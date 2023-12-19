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
    use starknet::{get_caller_address, ContractAddress};
    use super::IActions;
    use plaguestark::models::player::{Player};

    // impl: implement functions specified in trait
    #[external(v0)]
    impl ActionsImpl of IActions<ContractState> {
        // ContractState is defined by system decorator expansion
        fn spawn(self: @ContractState) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let playerId: felt252 = get_caller_address().into();

            set!(world,
                (
                    Player { id: playerId, orientation: 0, x: 0, y: 0 },
                )
            );
        }

        // Implementation of the move function for the ContractState struct.
        fn move(self: @ContractState, x: u16, y: u16) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let playerId: felt252 = get_caller_address().into();

            let orientation = get!(world, playerId, (Player)).orientation;
            // TODO: check previous position to compute orientation
            let nextOrientation = ((orientation + 1) % 4);

            set!(world,
                (
                    Player { id: playerId, orientation: nextOrientation, x: x, y: y },
                )
            );
        }
    }
}

#[cfg(test)]
mod tests {
    use starknet::class_hash::Felt252TryIntoClassHash;

    // import world dispatcher
    use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};

    use super::{player, Player};
    use debug::PrintTrait;

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
