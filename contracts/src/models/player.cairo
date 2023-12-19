#[derive(Model, Copy, Drop, Serde)]
struct Player {
    #[key]
    id: felt252,
    x: u16,
    y: u16,
    orientation: u8, // use enum
}
