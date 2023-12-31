#[derive(Model, Copy, Drop, Serde)]
struct Player {
    #[key]
    id: felt252,
    character: u8,
    name: felt252,
    x: u16,
    y: u16,
    orientation: u8, // use enum
    amount_vested: u128,
}

// 0:strength
// 1:dexterity
// 2:vitality

#[derive(Model, Copy, Drop, Serde)]
struct PlayerScore {
    #[key]
    id: felt252,
    name: felt252,
    nb_tiles_explored: u16,
}

#[derive(Model, Copy, Drop, Serde)]
struct PlayerInventory {
    #[key]
    id: felt252,
    nb_white_herbs: u8,
    nb_red_potions: u8,
}