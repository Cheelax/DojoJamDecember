// Core imports
use plaguestark::models::player::{Player};
use plaguestark::models::entity::{EntityAtPosition};

// External imports
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};

// Check -2 to 2 square around the player. If there is an infected entity, returns true
fn checkEntitySurroundingInfection(id: felt252, world: IWorldDispatcher) -> bool {
    let player = get!(world, id, Player);

    let x = player.x;
    let y = player.y;

    let mut ty = player.y - 2;
    let mut infectedClose = false;
    loop {
        if infectedClose || ty > player.y + 2 {
            break;
        }

        let mut tx = player.x - 2;
        loop {
            if infectedClose || tx > player.x + 2 {
                break;
            }

            let entityId = get!(world, (tx, ty), (EntityAtPosition)).id;
            if entityId != 0 && entityId != id {
                let entityLifeStatus = get!(world, entityId, EntityLifeStatus);
                if entityLifeStatus.isInfected && !entityLifeStatus.isDead {
                    infectedClose = true;
                }
            }

            tx = tx + 1;
        };
        ty = ty + 1;
    };

    return infectedClose;
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
    fn tick(ref self: EntityLifeStatus, world: IWorldDispatcher, timestamp: u64);
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
    fn tick(ref self: EntityLifeStatus, world: IWorldDispatcher, timestamp: u64) {
        if (self.isInfected == false) {
            self.isInfected = checkEntitySurroundingInfection(self.id, world);
            return;
        }

        if (self.isInfected && self.deadAt == 0) {
            self.deadAt = timestamp + 10; // after 10 seconds, dead
            return;
        }

        if (self.isInfected && timestamp >= self.deadAt) {
            self.isDead = true;
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