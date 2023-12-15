// Core imports

use dict::{Felt252Dict, Felt252DictTrait};
use array::{ArrayTrait, SpanTrait};
use nullable::{NullableTrait, nullable_from_box, match_nullable, FromNullableResult};
use poseidon::PoseidonTrait;
use hash::HashStateTrait;

// External imports

use alexandria_data_structures::array_ext::ArrayTraitExt;

use plaguestark::config;
use plaguestark::models::tile::{Tile, TileTrait};
// Map struct.
#[derive(Destruct)]
struct Map {
    tilesMap: Felt252Dict<Nullable<Span<Tile>>>,
}



/// Errors module
mod errors {
    const TILES_EMPTY: felt252 = 'Map: Tiles empty';
    const INVALID_TILE_NUMBER: felt252 = 'Map: Invalid tile number';
    const INVALID_TILE_ID: felt252 = 'Map: Invalid tile id';
    const TILES_UNBOX_ISSUE: felt252 = 'Tiles: unbox issue';
}

/// Trait to initialize and manage tile from the Map.
trait MapTrait {
    /// Returns a new `Map` struct.
    /// # Arguments
    /// * `game_id` - The game id.
    /// * `seed` - A seed to generate the map.
    /// * `player_count` - The number of players.
    /// * `tile_count` - The number of tiles.
    /// * `army_count` - The number of army of each player.
    /// # Returns
    /// * The initialized `Map`.
    fn new(game_id: u32, seed: felt252, grid_side: u8) -> Map;
    /// Returns the `Map` struct according to the tiles.
    /// # Arguments
    /// * `player_count` - The number of players.
    /// * `tiles` - The tiles.
    /// # Returns
    /// * The initialized `Map`.
    fn from_tiles(player_count: u32, tiles: Span<Tile>) -> Map;
    /// Computes the score of a player.
    /// # Arguments
    /// * `self` - The map.
    /// * `player_index` - The player index for whom to calculate the score.
    /// # Returns
    /// * The score.
    fn score(ref self: Map, player_index: u32) -> u32;
}

/// Implementation of the `MapTrait` for the `Map` struct.
impl MapImpl of MapTrait {
    fn new(
        game_id: u32, seed: felt252, grid_side: u8
    ) -> Map {
        
        // [Compute] Seed in u256 for futher operations
        let base_seed: u256 = seed.into();
        
        // Each player draw R/N where R is the remaining cards and N the number of players left
        let mut tilesMap: Felt252Dict<Nullable<Span<Tile>>> = Default::default();
        let mut count_generated: u32 = 0;

        let mut x: u8 = 0;
        let mut y: u8 = 0;
        loop {
            if x==grid_side {
                break;
            }
            loop {
                if y==grid_side {
                    break;
                }

                let mut tiles: Array<Tile> = array![];
                let tile_id = (x * grid_side + y); // Calculez l'ID basé sur x et y
                let tile = TileTrait::new(game_id, tile_id, x, y); // Assurez-vous que TileTrait::new accepte x et y
                tiles.append(tile);

                //todo: verify if this key is unique
                let key = (x * grid_side + y);
                tilesMap.insert(key.into(), nullable_from_box(BoxTrait::new(tiles.span())));
                y= y+1;
            };
            
            x= x+1;
            y= 0_u8;
        };
        Map { tilesMap }
    }

    fn from_tiles(player_count: u32, tiles: Span<Tile>) -> Map {
        let mut tilesMap: Felt252Dict<Nullable<Span<Tile>>> = Default::default();
        let mut player_index = 0;
        loop {
            if player_index == player_count {
                break;
            };
            let mut player_tiles: Array<Tile> = array![];
            let mut tile_index = 0;
            loop {
                if tile_index == tiles.len() {
                    break;
                };
                let tile = tiles.at(tile_index);
               
                tile_index += 1;
            };
            tilesMap
                .insert(player_index.into(), nullable_from_box(BoxTrait::new(player_tiles.span())));
            player_index += 1;
        };
        Map { tilesMap }
    }

    fn score(ref self: Map, player_index: u32) -> u32 {
        

        // [Return] Score
        0
    }
}
    

/// Generates a random number between 0 or 1.
/// # Arguments
/// * `seed` - The seed.
/// * `nonce` - The nonce.
/// # Returns
/// * The random number.
    #[inline(always)]
    fn _random(seed: felt252, nonce: u32) -> (u8, u32) {
        let mut state = PoseidonTrait::new();
        state = state.update(seed);
        state = state.update(nonce.into());
        let hash: u256 = state.finalize().into();
        ((hash % 2).try_into().unwrap(), nonce + 1)
    }


#[cfg(test)]
mod tests {
    // Core imports

    use debug::PrintTrait;

    // Internal imports

    use zconqueror::config;
    use zconqueror::models::tile::{Tile, TileTrait};
    use zconqueror::models::set::{Set, SetTrait};

    // Local imports

    use super::{Map, MapTrait, _random};

    // Constants

    const GAME_ID: u32 = 0;
    const SEED: felt252 = 'seed';
    const NONCE: u32 = 0;
    const PLAYER_1: u32 = 0;

    #[test]
    #[available_gas(100_000)]
    fn test_map_random() {
        let (unit, nonce) = _random(SEED, NONCE);
        assert(unit == 0 || unit == 1, 'Map: wrong random unit');
        assert(nonce == NONCE + 1, 'Map: wrong nonce');
    }

    #[test]
    #[available_gas(18_000_000)]
    fn test_map_new() {
        MapTrait::new(GAME_ID, SEED, PLAYER_NUMBER, config::TILE_NUMBER, config::ARMY_NUMBER);
    }

    #[test]
    #[available_gas(18_000_000)]
    fn test_map_from_tiles() {
        let mut tiles: Array<Tile> = array![];
        tiles.append(TileTrait::new(GAME_ID, 1, 0, PLAYER_1));
        tiles.append(TileTrait::new(GAME_ID, 2, 0, PLAYER_1));
        MapTrait::from_tiles(PLAYER_NUMBER, tiles.span());
    }

    // #[test]
    // #[available_gas(18_000_000)]
    // fn test_map_player_tiles() {
    //     let mut tiles: Array<Tile> = array![];
    //     tiles.append(TileTrait::new(GAME_ID, 1, 0, PLAYER_1));
    //     tiles.append(TileTrait::new(GAME_ID, 2, 0, PLAYER_1));
    //     tiles.append(TileTrait::new(GAME_ID, 3, 0, PLAYER_1));
    //     tiles.append(TileTrait::new(GAME_ID, 4, 0, PLAYER_2));
    //     tiles.append(TileTrait::new(GAME_ID, 5, 0, PLAYER_2));
    //     let mut map = MapTrait::from_tiles(PLAYER_NUMBER, tiles.span());
    //     assert(map.player_tiles(PLAYER_1).len() == 3, 'Map: wrong player tiles');
    //     assert(map.player_tiles(PLAYER_2).len() == 2, 'Map: wrong player tiles');
    // }

    // #[test]
    // #[available_gas(18_000_000)]
    // fn test_map_score_full() {
    //     let mut tiles: Array<Tile> = array![];
    //     tiles.append(TileTrait::new(GAME_ID, 1, 0, PLAYER_1));
    //     tiles.append(TileTrait::new(GAME_ID, 2, 0, PLAYER_1));
    //     tiles.append(TileTrait::new(GAME_ID, 3, 0, PLAYER_1));
    //     tiles.append(TileTrait::new(GAME_ID, 4, 0, PLAYER_1));
    //     tiles.append(TileTrait::new(GAME_ID, 5, 0, PLAYER_1));
    //     let mut map = MapTrait::from_tiles(PLAYER_NUMBER, tiles.span());
    //     assert(map.score(PLAYER_1) >= 5, 'Map: wrong score');
    // }

    // #[test]
    // #[available_gas(18_000_000)]
    // fn test_map_deploy() {
    //     let mut tiles: Array<Tile> = array![];
    //     tiles.append(TileTrait::new(GAME_ID, 1, 0, PLAYER_1));
    //     tiles.append(TileTrait::new(GAME_ID, 2, 0, PLAYER_1));
    //     tiles.append(TileTrait::new(GAME_ID, 3, 0, PLAYER_2));
    //     tiles.append(TileTrait::new(GAME_ID, 4, 0, PLAYER_1));
    //     tiles.append(TileTrait::new(GAME_ID, 5, 0, PLAYER_1));
    //     let mut map = MapTrait::from_tiles(PLAYER_NUMBER, tiles.span());
    //     let set = SetTrait::new(1, 2, 3);
    //     let player_tiles = map.deploy(PLAYER_1, @set);
    //     assert(player_tiles.at(0).army == @2, 'Map: wrong tile army 0');
    //     assert(player_tiles.at(1).army == @2, 'Map: wrong tile army 1');
    //     assert(player_tiles.at(2).army == @0, 'Map: wrong tile army 3');
    //     assert(player_tiles.at(3).army == @0, 'Map: wrong tile army 4');
    // }
}
