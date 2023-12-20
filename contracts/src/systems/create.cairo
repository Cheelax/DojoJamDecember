#[dojo::contract]
mod Create {
    use plaguestark::models::map::{Map, MapTrait};
    use starknet::{ContractAddress, get_caller_address};

    fn execute(self: @ContractState, seed: felt252, size:u32) {
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

        }

        //create hideout
    }

    // #[test]
    // #[available_gas(30000000)]
    // fn test_1() {
    //     Create::execute(0, 10);
    // }
}