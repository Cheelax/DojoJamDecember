// Core imports

use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
use dict::{Felt252Dict, Felt252DictTrait};
use array::{ArrayTrait, SpanTrait};
use nullable::{NullableTrait, nullable_from_box, match_nullable, FromNullableResult};
use poseidon::PoseidonTrait;
use hash::HashStateTrait;
use traits::Into;
use plaguestark::constants::{
   GROUND_TYPE,TREE_TYPE, ROCK_TYPE, HIDEOUT_TYPE, ALCHEMY_LABS_TYPE, HERB_1
};
use poseidon::poseidon_hash_span;

// External imports


use plaguestark::config;
use plaguestark::models::tile::{Tile, TileAtPosition};

// Map struct.
#[derive(Model, Copy, Drop, Serde)]
struct Map {
    #[key]
    id: u32,
    seed: felt252,
    size: u16,
}

#[derive(Serde, Copy, Drop, PartialEq)]
enum Type {
    Ground: (),
    Tree: (),
    Rock: (),
    AlchemyLabs: (),
    Hideout: (),
    Herb1: (),
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
    fn new(game_id: u32, seed: felt252, grid_side: u16) -> Map;
    /// Returns the `Map` struct according to the tiles.
    /// # Arguments
    /// * `player_count` - The number of players.
    /// * `tiles` - The tiles.
    /// # Returns
    /// * The initialized `Map`.
    // fn from_tiles(player_count: u32, tiles: Span<Tile>) -> Map;
    /// Computes the score of a player.
    /// # Arguments
    /// * `self` - The map.
    /// * `player_index` - The player index for whom to calculate the score.
    /// # Returns
    /// * The score.
    fn get_type(self: Map, raw_type: u8) -> Type;
    fn generate(self: Map, seed: felt252) -> Span<u8>;
    fn decompose(self: Map, index: u16) -> (u16, u16);
    fn addTileAtRandomEmptyPosition(self: Map, world: IWorldDispatcher, _type: u8, seed: felt252);
}

/// Implementation of the `MapTrait` for the `Map` struct.
impl MapImpl of MapTrait {
    fn new(
        game_id: u32, seed: felt252, grid_side: u16
    ) -> Map {
        Map { id:0_u32, size:grid_side, seed:seed }
    }

    fn generate(self: Map, seed: felt252) -> Span<u8> {
        _generate(seed, self.size * self.size)
    }

    fn get_type(self: Map, raw_type: u8) -> Type {
        if raw_type == GROUND_TYPE {
            return Type::Ground(());
        } else if raw_type == ROCK_TYPE {
            return Type::Tree(());
        } else if raw_type == ROCK_TYPE {
            return Type::Rock(());
        } else if raw_type == ALCHEMY_LABS_TYPE {
            return Type::AlchemyLabs(());
        } else if raw_type == HIDEOUT_TYPE {
            return Type::Hideout(());
        } else if raw_type == HERB_1 {
            return Type::Herb1(());
        }
        Type::Ground(())
    }

    fn decompose(self: Map, index: u16) -> (u16, u16) {
        _decompose(index, self.size)
    }

    fn addTileAtRandomEmptyPosition(self: Map, world: IWorldDispatcher, _type: u8, seed: felt252) {
        let mut randValue = _uniform_random(seed, 50 * 50);
        let mut x: u16 = (randValue % 50_u128).try_into().unwrap();
        let mut y: u16 = (randValue / 50_u128).try_into().unwrap();
        let mut retry: u8 = 0;
        loop {
            let tile = get!(world, (x,y), (TileAtPosition));
            if tile._type == 0 || retry > 200_u8 { // Stop after 200 retry
                break;
            }
            randValue = _uniform_random(seed + retry.into(), 50 * 50);
            x = (randValue % 50_u128).try_into().unwrap();
            y = (randValue / 50_u128).try_into().unwrap();
            retry += 1;
        };
        set!(world, (
            Tile { index: randValue.try_into().unwrap(), _type, x, y },
            TileAtPosition { x, y, _type }
        ))
    }
}

fn _generate(seed: felt252, n_tiles: u16) -> Span<u8> {
    let mut index = 0;
    let mut dict_types: Felt252Dict<u8> = Default::default();
    loop {
        if index >= n_tiles {
            break;
        }
        let randValue = _uniform_random(seed + index.into(), 1000);
        let mut _type = GROUND_TYPE;
        if randValue > 950 { // 5%
            _type = ROCK_TYPE;
        } else if randValue > 890 { // 6%
            _type = TREE_TYPE;
        } else if randValue > 885 { // 0.5%
            _type = ALCHEMY_LABS_TYPE;
        } else if randValue > 880 { // 0.5%
            _type = HIDEOUT_TYPE;
        } else if randValue > 860 { // 2%
            _type = HERB_1;
        }
        dict_types.insert(index.into(), _type);
        index += 1;
    };
    _dict_to_span(dict_types, n_tiles)
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

#[inline(always)]
fn _uniform_random(seed: felt252, max: u128) -> u128 {
    let hash: u256 = poseidon_hash_span(array![seed].span()).into();
    hash.low % max
}

#[inline(always)]
fn _decompose(index: u16, size: u16) -> (u16, u16) {
    (index % size, index / size)
}

fn _dict_to_span(mut dict: Felt252Dict<u8>, length: u16) -> Span<u8> {
    let mut array: Array<u8> = array![];
    let mut index = 0;
    loop {
        if index == length {
            break;
        }
        array.append(dict.get(index.into()));
        index += 1;
    };
    array.span()
}


#[cfg(test)]
mod tests {
    // Core imports

    use debug::PrintTrait;

    // Internal imports

    use plaguestark::config;
    use plaguestark::models::tile::{Tile};
    // use plaguestark::models::set::{Set, SetTrait};

    // Local imports

    use super::{Map, MapTrait, _random};

    // Constants

    const GAME_ID: u32 = 0;
    const SEED: felt252 = 'seed';
    const NONCE: u32 = 0;

    #[test]
    #[available_gas(100_000_000)]
    fn test_map_random() {
        let (unit, nonce) = _random(SEED, NONCE);
        assert(unit == 0 || unit == 1, 'Map: wrong random unit');
        assert(nonce == NONCE + 1, 'Map: wrong nonce');
    }

    #[test]
    #[available_gas(18_000_000)]
    fn test_map_new() {
        let result = MapTrait::new(GAME_ID, SEED, 50);
    }

    #[test]
    #[available_gas(18_000_000_000)]
    fn test_generate(){
        let mut map= MapTrait::new(0, 0, 50);
          
        // create tile
        let raw_types = map.generate(map.seed);
        let mut index = 0;
        let length = raw_types.len();
    }
}
