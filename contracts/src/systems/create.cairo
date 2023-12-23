use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};

use plaguestark::models::game::{Game};
use plaguestark::models::map::{Map, MapTrait, Type};
use plaguestark::models::tile::{Tile, TileAtPosition};

fn initGame(world: IWorldDispatcher) {
    let mut game = get!(world, 0, (Game));
    game.isInit = true;
    set!(world, (game));

    let mut map = MapTrait::new(0, 0, 50);
    set!(world, (map));

    // create tile
    let raw_types = map.generate(map.seed);
    let mut index = 0;
    let length = raw_types.len();
    loop {
        if index >= length {
            break;
        }

        let raw_type = *raw_types[index];
        let tile_type = map.get_type(raw_type);
        let indexreduced: u16 = index.try_into().unwrap();
        let (x, y) = map.decompose(indexreduced);
        if raw_type > 0 {
            set!(world, (
                Tile { x, y, index:indexreduced, _type: raw_type },
                TileAtPosition { x, y, _type: raw_type }
            ));
        }

        // if raw_type == Type::AlchemyLabs.into() {
        //     // Create Alchemy Labs?
        // }
        // if raw_type == Type::Hideout.into() {
        //     // Create Hideout?
        // }

        index += 1;
    };
}