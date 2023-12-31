mod constants;
mod actions;
mod lords;
mod randomness;
mod lootsurvivor;

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
    mod adventurer;
}

mod systems {
    mod create;
}

use plaguestark::data::v00 as config;

mod erc20 {
    mod interface;
    mod models;
}