// Core imports
use plaguestark::models::player::{Player};
use plaguestark::models::entity::{EntityAtPosition};

// External imports
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};

fn infectEntity(entityId: felt252, world: IWorldDispatcher, timestamp: u64) {
    let mut entityLifeStatus = get!(world, entityId, EntityLifeStatus);
    if (entityLifeStatus.isInfected) {
        return;
    }
    entityLifeStatus.isInfected = true;
    entityLifeStatus.deadAt = timestamp + 60; // after 60 seconds, dead
    set!(world, (entityLifeStatus));
}

fn killEntity(entityId: felt252, world: IWorldDispatcher) {
    let mut entityLifeStatus = get!(world, entityId, EntityLifeStatus);
    if (entityLifeStatus.isDead) {
        return;
    }
    entityLifeStatus.isDead = true;
    set!(world, (entityLifeStatus));
}

// Check -2 to 2 square around the player. If there is an infected entity, returns true
fn spreadAndGetInfection(playerId: felt252, world: IWorldDispatcher, timestamp: u64) {
    let (player, playerLifeStatus) = get!(world, playerId, (Player, EntityLifeStatus));

    let x = player.x;
    let y = player.y;

    let mut ty = player.y - 2;
    loop {
        if ty > player.y + 2 {
            break;
        }

        let mut tx = player.x - 2;
        loop {
            if tx > player.x + 2 {
                break;
            }

            let entityId = get!(world, (tx, ty), (EntityAtPosition)).id;
            if entityId != 0 && entityId != playerId {
                let entityLifeStatus = get!(world, entityId, EntityLifeStatus);
                // Is it an infected entity? If yes, I become infected
                if !playerLifeStatus.isInfected && entityLifeStatus.isInfected && !entityLifeStatus.isDead {
                    infectEntity(playerId, world, timestamp);
                }
                // Is it a non-infected entity that I can infect?
                if playerLifeStatus.isInfected && !playerLifeStatus.isDead && !entityLifeStatus.isInfected {
                    infectEntity(entityId, world, timestamp);
                }
            }

            tx = tx + 1;
        };
        ty = ty + 1;
    };
}

// EntityLifeStatus
#[derive(Model, Copy, Drop, Serde)]
struct EntityLifeStatus {
    #[key]
    id: felt252,
    isInfected: bool,
    deadAt: u64,
    isDead: bool,
}

trait EntityLifeStatusTrait {
    fn new(id: felt252) -> EntityLifeStatus;
    fn tick(self: @EntityLifeStatus, world: IWorldDispatcher);
    fn isInfected(self: @EntityLifeStatus) -> bool;
    fn isDead(self: @EntityLifeStatus) -> bool;
}

/// Implementation of the `EntityLifeStatusTrait` for the `EntityLifeStatus` struct.
impl EntityLifeStatusImpl of EntityLifeStatusTrait {
    #[inline(always)]
    fn new(id: felt252) -> EntityLifeStatus {
        EntityLifeStatus { id, isInfected: false, deadAt: 0, isDead: false}
    }

    #[inline(always)]
    fn tick(self: @EntityLifeStatus, world: IWorldDispatcher) {
        let timestamp: u64 = starknet::get_block_info().unbox().block_timestamp;
        spreadAndGetInfection(*self.id, world, timestamp);
        if (*self.isInfected && timestamp >= *self.deadAt) {
            killEntity(*self.id, world);
            return;
        }
    }

    #[inline(always)]
    fn isInfected(self: @EntityLifeStatus) -> bool {
        *self.isInfected
    }

    #[inline(always)]
    fn isDead(self: @EntityLifeStatus) -> bool {
        *self.isDead
    }
}