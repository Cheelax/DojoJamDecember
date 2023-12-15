
// Core imports

use array::{ArrayTrait, SpanTrait};
use poseidon::PoseidonTrait;
use hash::HashStateTrait;

// External imports
use plaguestark::utils::dice::{Dice, DiceTrait};

// Internal imports

// use zconqueror::constants::DICE_FACES_NUMBER;
use plaguestark::config;
// use plaguestark::models::player::Player;

#[derive(Model, Copy, Drop, Serde)]
struct Tile {
    #[key]
    game_id: u32,
    #[key]
    id: u8,
    x: u8,
    y: u8,
    _type: u8,
}

/// Errors module
mod errors {
    const INVALID_ID: felt252 = 'Tile: invalid id';
    const INVALID_DISPATCHED: felt252 = 'Tile: invalid dispatched';
    const INVALID_ARRAY: felt252 = 'Tile: invalid array';
    const INVALID_CONNECTION: felt252 = 'Tile: invalid connection';
}

/// Trait to initialize and manage army from the Tile.
trait TileTrait {
    /// Returns a new `Tile` struct.
    /// # Arguments
    /// * `id` - The territory id.
    /// * `army` - The initial army supply.
    /// * `owner` - The owner id of the territory.
    /// # Returns
    /// * The initialized `Tile`.
    fn new(game_id: u32, id: u8, x:u8, y:u8) -> Tile;
    /// Returns a new `Option<Tile>` struct.
    /// # Arguments
    /// * `id` - The territory id.
    /// * `army` - The initial army supply.
    /// * `owner` - The owner id of the territory.
    /// # Returns
    /// * The initialized `Option<Tile>`.
    fn try_new(game_id: u32, id: u8) -> Option<Tile>;
    /// Check validity.
    /// # Arguments
    /// * `self` - The tile.
    /// # Returns
    /// * Tile validity status.
    fn check(self: @Tile) -> bool;
    /// Assert validity.
    /// # Arguments
    /// * `self` - The tile.
    fn assert(self: @Tile);
}

/// Implementation of the `TileTrait` for the `Tile` struct.
impl TileImpl of TileTrait {
    #[inline(always)]
    fn new(game_id: u32, id: u8, x:u8, y: u8) -> Tile {
        // assert(config::TILE_NUMBER >= id.into() && id > 0, errors::INVALID_ID);
        // let neighbors = config::neighbors(id).expect(errors::INVALID_ID);
        Tile { game_id, id, x, y, _type:0}
    }

    #[inline(always)]
    fn try_new(game_id: u32, id: u8) -> Option<Tile> {
        // let wrapped_neighbors = config::neighbors(id);
        // match wrapped_neighbors {
        //     Option::Some(neighbors) => {
        //         let tile = TileTrait::new(game_id, id, army, owner);
        //         Option::Some(tile)
        //     },
        //     Option::None => Option::None,
        // }
         Option::Some(Tile { game_id, id, x:0, y:0, _type:0})
    }

    #[inline(always)]
    fn check(self: @Tile) -> bool {
        config::TILE_NUMBER >= (*self.id).into() && *self.id > 0
    }

    #[inline(always)]
    fn assert(self: @Tile) {
        assert(self.check(), errors::INVALID_ID);
    }

}