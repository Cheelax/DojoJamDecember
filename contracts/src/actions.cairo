use starknet::ContractAddress;

// define the interface
#[starknet::interface]
trait IActions<TContractState> {
    fn set_lords_address(ref self: TContractState, contract_address: ContractAddress);
    fn set_randomness_address(ref self: TContractState, contract_address: ContractAddress);
    fn set_treasury_address(ref self: TContractState, contract_address: ContractAddress);
    fn spawn(self: @TContractState, amount: u128, character: u8, name: felt252);
    fn move(self: @TContractState, x: u16, y: u16);
    fn drink_potion(self: @TContractState);
    fn receive_random_words(
        ref self: TContractState,
        requestor_address: ContractAddress,
        request_id: u64,
        random_words: Span<felt252>,
        calldata: Array<felt252>
    );
}

// dojo decorator
#[dojo::contract]
mod actions {
    use starknet::{get_caller_address, get_contract_address, ContractAddress};
    use super::IActions;

    use debug::PrintTrait;

    use plaguestark::models::player::{Player, PlayerScore, PlayerInventory};
    use plaguestark::models::tile::{Tile, TileAtPosition};
    use plaguestark::models::entity_infection::{EntityLifeStatus, EntityLifeStatusTrait};
    use plaguestark::models::entity::{EntityAtPosition};
    use plaguestark::models::game::{Game,ContractsRegistry};
    use plaguestark::models::map::{Map, MapTrait};
    use plaguestark::systems::create::{initGame};
    use plaguestark::randomness::{IRandomness,IRandomnessDispatcher,IRandomnessDispatcherTrait};
    use plaguestark::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

    use poseidon::poseidon_hash_span;

    fn _uniform_random(seed: felt252, max: u128) -> u128 {
        let hash: u256 = poseidon_hash_span(array![seed].span()).into();
        hash.low % max
    }

    #[storage]  
    struct Storage {
        erc20_contract_address: ContractAddress,
        randomness_contract_address: ContractAddress,
        treasury_contract_address: ContractAddress,
    }

    // impl: implement functions specified in trait
    #[external(v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn set_lords_address(ref self: ContractState, contract_address: ContractAddress) {
            self.erc20_contract_address.write(contract_address);

            let world = self.world_dispatcher.read();
            let mut contracts = get!(world, 'contracts', ContractsRegistry);
            contracts.lords_address = contract_address.into();
            set!(world, (contracts));
        }

        fn set_randomness_address(ref self: ContractState, contract_address: ContractAddress) {
            self.randomness_contract_address.write(contract_address);

            let world = self.world_dispatcher.read();
            let mut contracts = get!(world, 'contracts', ContractsRegistry);
            contracts.randomness_address = contract_address.into();
            set!(world, (contracts));
        }

        fn set_treasury_address(ref self: ContractState, contract_address: ContractAddress) {
            self.treasury_contract_address.write(contract_address);

            let world = self.world_dispatcher.read();
            let mut contracts = get!(world, 'contracts', ContractsRegistry);
            contracts.treasury_address = contract_address.into();
            set!(world, (contracts));
        }

        // ContractState is defined by system decorator expansion
        fn spawn(self: @ContractState, amount: u128, character: u8, name: felt252) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Init game once
            let game = get!(world, 0, (Game));
            if !game.isInit {
                let mut game = get!(world, 0, (Game));
                game.isInit = true;
                set!(world, (game));
                request_my_randomness(world, self.randomness_contract_address.read(), 1, 2500); // mapseed, mapsize
            }
            
            // Get the address of the current caller, possibly the player's address.
            let playerId: felt252 = get_caller_address().into();

            // Pay fees
            assert(amount >= 10, 'Entry cost is minimum 10');

            let lordsDispatcher = IERC20Dispatcher {
                contract_address: self.erc20_contract_address.read()
            };
            let from: ContractAddress = get_caller_address();
            let to: ContractAddress = get_contract_address();
            let finalAmount: u128 = amount;
            lordsDispatcher.transfer_from(from, to, finalAmount);

            let (x,y) = spawn_coords(world, playerId, playerId);
            set!(world,
                (
                    Player { id: playerId, orientation: 1, x: x, y: y , character: character, amount_vested: amount, name: name },
                    PlayerScore { id: playerId, nb_tiles_explored: 0, name: name },
                    EntityLifeStatusTrait::new(playerId),
                    EntityAtPosition { x: x, y: y, id: playerId },
                    PlayerInventory { id: playerId, nb_red_potions: 1, nb_white_herbs: 3 },
                )
            );
        }

        // Implementation of the move function for the ContractState struct.
        fn move(self: @ContractState, x: u16, y: u16) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let playerId: felt252 = get_caller_address().into();

            let (player,lifeStatus) = get!(world, playerId, (Player, EntityLifeStatus));
            assert(player.amount_vested > 0, 'You need to spawn first');
            assert(lifeStatus.isDead() == false, 'You are dead');

            let isNextToPlayer = (
                (player.x > 0 && x == player.x - 1 && y == player.y) ||
                (player.x < 50 && x == player.x + 1 && y == player.y) ||
                (player.y > 0 && x == player.x && y == player.y - 1) ||
                (player.y < 50 && x == player.x && y == player.y + 1)
            );
            assert(isNextToPlayer, 'Target position is not in range');

            let tile: TileAtPosition = get!(world, (x, y), (TileAtPosition));
            if tile._type == 3 {
                // Alchemy labs
                let mut inventory = get!(world, playerId, (PlayerInventory));
                let potentialPotions = inventory.nb_white_herbs / 3; // need 3 herbs for 1 potion
                if potentialPotions > 0 {
                    inventory.nb_white_herbs -= potentialPotions * 3;
                    inventory.nb_red_potions += potentialPotions;
                    set!(world, (inventory));
                }
            }

            if tile._type == 5 {
                // Grab flower
                let mut inventory = get!(world, playerId, (PlayerInventory));
                inventory.nb_white_herbs += 1;
                set!(world, (
                    Tile { index: x + y * 50, x, y, _type: 0 },
                    TileAtPosition { x, y, _type: 0 },
                    inventory
                ));
                let seed = playerId + x.into() + y.into();
                get!(world, 0, (Map)).addTileAtRandomEmptyPosition(world, tile._type, seed);
            }
            // Check if can walk on the tile
            assert(tile._type != 1 && tile._type != 2, 'You can\'t move here');

            let mut nextOrientation: u8 = 0;
            if (x > player.x) {
                nextOrientation = 1; // SE
            } else if (y < player.y) {
                nextOrientation = 3; // NE
            } else if (x < player.x) {
                nextOrientation = 5; // NW
            } else if (y > player.y) {
                nextOrientation = 7; // SW
            }

            let mut otherEntity = get!(world, (x,y), EntityAtPosition);
            if otherEntity.id != 0 {
                let mut other = get!(world, otherEntity.id, Player);
                let otherLifeStatus = get!(world, otherEntity.id, EntityLifeStatus);
                if other.amount_vested == 0 {
                    otherEntity.id = 0;
                } else if otherLifeStatus.isDead {
                    let lordsDispatcher = IERC20Dispatcher {
                        contract_address: self.erc20_contract_address.read()
                    };
                    let to: ContractAddress = get_caller_address();
                    let finalAmount: u128 = other.amount_vested;
                    lordsDispatcher.transfer(to, finalAmount);
                    other.amount_vested = 0;
                    otherEntity.id = 0; // Virtually remove the entity from the map
                    set!(world, (other, otherEntity));
                }
            }
            assert(otherEntity.id == 0, 'There is already someone here');

            let (player, score) = get!(world, playerId, (Player, PlayerScore));
            // Remove player from previous tile
            set!(world,
                (
                    EntityAtPosition { x: player.x, y: player.y, id: 0 },
                )
            );

            set!(world,
                (
                    Player { id: playerId, orientation: nextOrientation, x, y, character: player.character, amount_vested: player.amount_vested, name: player.name },
                    PlayerScore { id: playerId, nb_tiles_explored: score.nb_tiles_explored + 1, name: player.name },
                    EntityAtPosition { x, y, id: playerId },
                )
            );

            lifeStatus.randomlyAddInfectionStack(world);
            // Update life status
            let lifeStatus = get!(world, playerId, EntityLifeStatus);
            lifeStatus.tick(world);
        }

        fn drink_potion(self: @ContractState) {
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let playerId: felt252 = get_caller_address().into();

            let (mut inventory, mut lifeStatus) = get!(world, playerId, (PlayerInventory, EntityLifeStatus));
            assert(lifeStatus.isInfected == false && lifeStatus.isDead == false, 'You are doomed');
            assert(inventory.nb_red_potions > 0, 'You need a potion');

            inventory.nb_red_potions -= 1;
            lifeStatus.infectionStacks = 0;
            set!(world, ( inventory, lifeStatus ));
        }

        fn receive_random_words(
            ref self: ContractState,
            requestor_address: ContractAddress,
            request_id: u64,
            random_words: Span<felt252>,
            calldata: Array<felt252>
        ) {
            let world = self.world_dispatcher.read();
            initGame(world, random_words);
            return ();
        }
    }

    fn request_my_randomness(
        world: IWorldDispatcher,
        randomness_contract_address: ContractAddress,
        seed: u64,
        num_words: u64,
    ) {
        let randomness_dispatcher = IRandomnessDispatcher {
            contract_address: randomness_contract_address
        };
        let emptyArray: Array<felt252> = ArrayTrait::new();
        // Request the randomness
        let request_id = randomness_dispatcher
            .request_random(
                seed, get_contract_address(), 0, 0, num_words, 
                emptyArray
            );

        let emptyArray: Array<felt252> = ArrayTrait::new();
        randomness_dispatcher
            .submit_random(
                request_id,
                get_contract_address(),
                seed,
                0,
                get_contract_address(),
                0, 0,
                emptyArray.span(),
                emptyArray.span(),
                emptyArray
            );
        return ();
    }

    fn spawn_coords(world: IWorldDispatcher, player: felt252, mut salt: felt252) -> (u16, u16) {
        let mut x = 10;
        let mut y = 10;
        loop {
            x = _uniform_random(player + salt, 50).try_into().unwrap();
            y = _uniform_random(player + salt, 50).try_into().unwrap();

            let (entity, tile) = get!(world, (x, y), (EntityAtPosition, TileAtPosition));

            // Ensure there is no entity + tile is of type Ground
            if entity.id == 0 && tile._type == 0 {
                break;
            } else {
                salt += 1; // Try new salt
            }
        };
        (x, y)
    }
}
