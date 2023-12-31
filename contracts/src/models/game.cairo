const GAME_DATA_KEY: felt252 ='game';

#[derive(Model, Copy, Drop, Serde)]
struct Game {
    #[key]
    id: felt252,
    isInit: bool,
}

#[derive(Model, Copy, Drop, Serde)]
struct ContractsRegistry {
    #[key]
    id: felt252, // always "contract"
    lords_address: felt252,
    randomness_address: felt252,
    treasury_address: felt252,
}

