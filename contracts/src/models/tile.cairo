
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
    index: u16,
    x: u16,
    y: u16,
    _type: u8
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
    fn new(id: u16, x:u16, y:u16) -> Tile;
    /// Returns a new `Option<Tile>` struct.
    /// # Arguments
    /// * `id` - The territory id.
    /// * `army` - The initial army supply.
    /// * `owner` - The owner id of the territory.
    /// # Returns
    /// * The initialized `Option<Tile>`.
    fn try_new( index: u16) -> Option<Tile>;

   fn is_close(self: Tile, x: u16, y: u16) -> bool;

     fn distance(self: Tile, x:u16, y:u16) -> u16;
}

/// Implementation of the `TileTrait` for the `Tile` struct.
impl TileImpl of TileTrait {
    #[inline(always)]
    fn new( id: u16, x:u16, y: u16) -> Tile {
        // assert(config::TILE_NUMBER >= id.into() && id > 0, errors::INVALID_ID);
        // let neighbors = config::neighbors(id).expect(errors::INVALID_ID);
        Tile {  index: 0, _type: 0, x, y }
    }

    fn is_close(self: Tile, x: u16, y: u16) -> bool {
        println!("distance: {}", self.distance(x,y));
        self.distance(x,y) <= 1
    }

    fn distance(self: Tile, x:u16, y:u16) -> u16 {
        println!("fromdist: {} {}", self.x, self.y);
        println!("todist: {} {}", x, y);
        let mut dx = 0;
        if self.x > x {
            dx = self.x - x;
        } else {
            dx = x - self.x;
        };
        println!("dx: {}", dx);
        let mut dy = 0;
        if self.y > y {
            dy = self.y - y;
        } else {
            dy = y - self.y;
        };
        println!("dy: {}", dy);
        dx * dx + dy * dy
    }


    #[inline(always)]
    fn try_new( index: u16) -> Option<Tile> {
        // let wrapped_neighbors = config::neighbors(id);
        // match wrapped_neighbors {
        //     Option::Some(neighbors) => {
        //         let tile = TileTrait::new(game_id, id, army, owner);
        //         Option::Some(tile)
        //     },
        //     Option::None => Option::None,
        // }
         Option::Some(Tile {  index, x:0, y:0, _type:0})
    }

    // #[inline(always)]
    // fn check(self: @Tile) -> bool {
    //     config::TILE_NUMBER >= (*self.id).into() && *self.id > 0
    // }

    // #[inline(always)]
    // fn assert(self: @Tile) {
    //     assert(self.check(), errors::INVALID_ID);
    // }

}