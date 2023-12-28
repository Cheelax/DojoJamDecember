mod constants;
mod actions;
mod lords;

mod data {
    mod v00;
}
mod models {
    mod map;
    mod game;
    mod player;
    mod tile;
    mod entity;
    mod entity_infection;
}

mod systems {
    mod create;
}

use plaguestark::data::v00 as config;

mod origami {
    mod token {
        mod src {
            mod erc20 {
                mod erc20;
                mod models;
            }
        }
    }
}