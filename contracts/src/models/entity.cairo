// Structure to represent an entity position with unique keys and an ID
#[derive(Model, Copy, Drop, Serde)]
struct EntityAtPosition {
    #[key]
    x: u16,
    #[key]
    y: u16,
    id: felt252,
}