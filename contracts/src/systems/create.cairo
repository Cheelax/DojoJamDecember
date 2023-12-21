#[dojo::contract]
mod Create {
    use plaguestark::models::map::{Map, MapTrait, Type};
    use plaguestark::models::tile::Tile;
    use starknet::{ContractAddress, get_caller_address};

    fn execute(self: @ContractState, seed: felt252, size:u16) {
        // create game
        let world = self.world_dispatcher.read();
            let mut map= MapTrait::new(0, seed, size);
            set!(world,
                (
                    map
                ));

        // create tile
        let raw_types = map.generate(map.seed);
        let mut index = 0;
        let length = raw_types.len();
        println!("length: {}", length);
        loop {
            if index == length {
                break;
            }

            let raw_type = *raw_types[index];
            let tile_type = map.get_type(raw_type);
            let indexreduced: u16 = index.try_into().unwrap();
            let (x, y) = map.decompose(indexreduced);
            let tile = Tile { game_id: 0, x, y, index:indexreduced, _type: raw_type };

            // [Command] Set Tile and Character entities
            match tile_type {
                Type::Ground(()) => { //
                },
                Type::Three(()) => {
                    // [Command] Set Tile entity
                    set!(world, (tile));
                },
                Type::Rock(()) => {
                    // [Command] Set Tile entity
                    set!(world, (tile));
                },
                Type::AlchemyLabs(()) => {
                    set!(world, (tile));
                },
                Type::Hideout(()) => {
                    // [Command] Set Tile entity
                    set!(world, (tile));
                    // TODO: set hideout 
                    // let barbarian = Character {
                    //     game_id: game_id,
                    //     _type: raw_type,
                    //     health: MOB_HEALTH,
                    //     index,
                    //     hitter: 0,
                    //     hit: 0
                    // };
                    // set!(ctx.world, (barbarian));
                },
            };

            index += 1;
        }
    }

    // #[test]
    // #[available_gas(30000000)]
    // fn test_1() {
    //     Create::execute(0, 10);
    // }
}