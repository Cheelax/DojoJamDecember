const GAME_DATA_KEY: felt252 ='game';

#[derive(Model, Copy, Drop, Serde)]
struct Game {
    #[key]
    id: felt252,
    isInit: bool,
}