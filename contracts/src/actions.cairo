use starknet::ContractAddress;

// define the interface
#[starknet::interface]
trait IActions<TContractState> {
    fn spawn(self: @TContractState);
    fn move(self: @TContractState, x: u16, y: u16);
}

// dojo decorator
#[dojo::contract]
mod actions {
    use starknet::{get_caller_address, ContractAddress, get_block_info};
    use super::IActions;

    use integer::{u128s_from_felt252, U128sFromFelt252Result, u128_safe_divmod};

    use plaguestark::models::player::{Player};
    use plaguestark::models::map::{Map};
    use plaguestark::models::tile::{Tile, TileTrait};
    use plaguestark::models::entity_infection::{EntityLifeStatus, EntityLifeStatusTrait};
    use plaguestark::models::entity::{EntityAtPosition};

    fn spawn_coords(world: IWorldDispatcher, player: felt252, mut salt: felt252) -> (u16, u16) {
        let mut x = 10;
        let mut y = 10;
        loop {
            let hash = pedersen::pedersen(player, salt);
            let rnd_seed = match u128s_from_felt252(hash) {
                U128sFromFelt252Result::Narrow(low) => low,
                U128sFromFelt252Result::Wide((high, low)) => low,
            };
            let MAP_SIZE: u128 = 50;
            let (rnd_seed, x_) = u128_safe_divmod(rnd_seed, MAP_SIZE.try_into().unwrap());
            let (rnd_seed, y_) = u128_safe_divmod(rnd_seed, MAP_SIZE.try_into().unwrap());
            let x_: felt252 = x_.into();
            let y_: felt252 = y_.into();

            x = x_.try_into().unwrap();
            y = y_.try_into().unwrap();
            let occupied = get!(world, (x, y), (EntityAtPosition)).id;
            if occupied == 0 {
                break;
            } else {
                salt += 1; // Try new salt
            }
        };
        (x, y)
    }

    // impl: implement functions specified in trait
    #[external(v0)]
    impl ActionsImpl of IActions<ContractState> {
        // ContractState is defined by system decorator expansion
        fn spawn(self: @ContractState) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let playerId: felt252 = get_caller_address().into();

            let (x,y) = spawn_coords(world, playerId, playerId);

            set!(world,
                (
                    Player { id: playerId, orientation: 0, x: x, y: y },
                    EntityLifeStatusTrait::new(playerId),
                    EntityAtPosition { x: x, y: y, id: playerId },
                )
            );
        }

        // Implementation of the move function for the ContractState struct.
        fn move(self: @ContractState, x: u16, y: u16) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let playerId: felt252 = get_caller_address().into();

            let player = get!(world, playerId, (Player));
            let orientation = player.orientation;
            // TODO: check previous position to compute orientation
            let nextOrientation = ((orientation + 1) % 4);

            let isNextToPlayer = (
                (x == player.x - 1 && y == player.y) ||
                (x == player.x + 1 && y == player.y) ||
                (x == player.x && y == player.y - 1) ||
                (x == player.x && y == player.y + 1)
            );

            // let sourceTile = get!(world, (player.x, player.y), (Tile));
            assert(isNextToPlayer, 'Target position is not in range');

            let player = get!(world, playerId, Player);
            set!(world,
                (
                    EntityAtPosition { x: player.x, y: player.y, id: 0 },
                )
            );

            // Call tick
            set!(world,
                (
                    Player { id: playerId, orientation: nextOrientation, x: x, y: y },
                    EntityAtPosition { x: x, y: y, id: playerId },
                )
            );

            let mut lifeStatus = get!(world, playerId, EntityLifeStatus);
            let timestamp: u64 = get_block_info().unbox().block_timestamp;
            lifeStatus.tick(world, timestamp);
            set!(world, (lifeStatus));
        }
    }
}

#[cfg(test)]
mod tests {
    use starknet::class_hash::Felt252TryIntoClassHash;

    // import world dispatcher
    use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
    use debug::PrintTrait;
    use plaguestark::models::player::{player,Player};

    // import test utils
    use dojo::test_utils::{spawn_test_world, deploy_contract};

    // import actions
    use super::{actions, IActionsDispatcher, IActionsDispatcherTrait};

    #[test]
    #[available_gas(30000000)]
    fn test_1() {
        // caller
        let caller = starknet::contract_address_const::<0x0>();

        // models
        let mut models = array![player::TEST_CLASS_HASH];

        // deploy world with models
        let world = spawn_test_world(models);

        // deploy systems contract
        let contract_address = world
            .deploy_contract('salt', actions::TEST_CLASS_HASH.try_into().unwrap());
        let actions_system = IActionsDispatcher { contract_address };

        // call spawn()
        actions_system.spawn();

        let player = get!(world, caller, Player);
        assert(player.x == 0 && player.y == 0, 'pos1 is wrong');
        assert(player.orientation == 0, 'orient1 is wrong');

        // call move with direction right
        actions_system.move(1, 0);

        let player = get!(world, caller, Player);
        assert(player.x == 1 && player.y == 0, 'pos2 is wrong');
        assert(player.orientation == 1, 'orient2 is wrong');
    }
}
