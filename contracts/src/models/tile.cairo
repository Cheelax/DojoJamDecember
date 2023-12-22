
// Core imports

use array::{ArrayTrait, SpanTrait};
use poseidon::PoseidonTrait;
use hash::HashStateTrait;

// External imports

// Internal imports
use plaguestark::config;

#[derive(Model, Copy, Drop, Serde)]
struct Tile {
    #[key]
    index: u16,
    x: u16,
    y: u16,
    _type: u8
}

#[derive(Model, Copy, Drop, Serde)]
struct TileAtPosition {
    #[key]
    x: u16,
    #[key]
    y: u16,
    _type: u8
}