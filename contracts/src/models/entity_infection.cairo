// Core imports
use plaguestark::models::player::{Player};
use plaguestark::models::game::{ContractsRegistry};
use plaguestark::models::entity::{EntityAtPosition};
use plaguestark::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

// External imports
use starknet::info::{get_block_number};
use starknet::{ContractAddress,get_contract_address};
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
use poseidon::poseidon_hash_span;

fn _uniform_random(seed: felt252, max: u128) -> u128 {
    let hash: u256 = poseidon_hash_span(array![seed].span()).into();
    hash.low % max
}

fn infectEntity(entityId: felt252, world: IWorldDispatcher, timestamp: u64, source: felt252) {
    let mut entityLifeStatus = get!(world, entityId, EntityLifeStatus);
    if (entityLifeStatus.isInfected) {
        return;
    }
    entityLifeStatus.isInfected = true;
    entityLifeStatus.infected_by = source;

    let player = get!(world, entityId, (Player));

    let mut timeOffestDeath = 60;
    if(player.character == 0) {
        timeOffestDeath = 90;
    }
    entityLifeStatus.deadAt = timestamp + timeOffestDeath; // after 60 seconds, dead
    set!(world, (entityLifeStatus));
}

fn killEntity(entityId: felt252, world: IWorldDispatcher) {
    let mut entityLifeStatus = get!(world, entityId, EntityLifeStatus);
    if (entityLifeStatus.isDead) {
        return;
    }
    entityLifeStatus.isDead = true;

    let contracts = get!(world, 'contracts', (ContractsRegistry));

    // If infected solo, send to treasure
    let mut destination_address: felt252 = contracts.treasury_address;
    // Else send to infected_by
    if (entityLifeStatus.id != entityLifeStatus.infected_by) {
        destination_address = entityLifeStatus.infected_by;
    }

    let mut player = get!(world, entityId, (Player));
    let amount = player.amount_vested * 80 / 100; // Get 80% of the amount
    player.amount_vested -= amount;

    let lordsDispatcher = IERC20Dispatcher {
        contract_address: contracts.lords_address.try_into().unwrap()
    };
    lordsDispatcher.transfer(destination_address.try_into().unwrap(), amount);

    set!(world, (entityLifeStatus, player));
}

// Check -2 to 2 square around the player. If there is an infected entity, returns true
fn spreadAndGetInfection(playerId: felt252, world: IWorldDispatcher, timestamp: u64) {
    let (player, playerLifeStatus) = get!(world, playerId, (Player, EntityLifeStatus));

    let x = player.x;
    let y = player.y;

    let mut ty = 0;
    if player.y >= 2 {
        ty = player.y - 2;
    }
    loop {
        if ty > player.y + 2 {
            break;
        }

        if ty >= 0 && ty < 50 {
            let mut tx = 0;
            if player.x >= 2 {
                tx = player.x - 2;
            }
            loop {
                if tx > player.x + 2 {
                    break;
                }

                if tx >= 0 && tx < 50 {
                    let entityId = get!(world, (tx, ty), (EntityAtPosition)).id;
                    if entityId != 0 && entityId != playerId {
                        let entityLifeStatus = get!(world, entityId, EntityLifeStatus);
                        // Is entity dead?
                        if entityLifeStatus.isInfected && timestamp >= entityLifeStatus.deadAt {
                            killEntity(entityLifeStatus.id, world);
                        } else {
                            // Is it an infected entity? If yes, I become infected
                            if !playerLifeStatus.isInfected && entityLifeStatus.isInfected && !entityLifeStatus.isDead {
                                infectEntity(playerId, world, timestamp, entityId);
                            }
                            // Is it a non-infected entity that I can infect?
                            if playerLifeStatus.isInfected && !playerLifeStatus.isDead && !entityLifeStatus.isInfected {
                                infectEntity(entityId, world, timestamp, playerId);
                            }
                        }
                    }
                }
                tx = tx + 1;
            };
        }
        ty = ty + 1;
    };
}

// EntityLifeStatus
#[derive(Model, Copy, Drop, Serde)]
struct EntityLifeStatus {
    #[key]
    id: felt252,
    infectionStacks: u8,
    isInfected: bool,
    infected_by: felt252,
    deadAt: u64,
    isDead: bool,
}

trait EntityLifeStatusTrait {
    fn new(id: felt252) -> EntityLifeStatus;
    fn tick(self: @EntityLifeStatus, world: IWorldDispatcher);
    fn randomlyAddInfectionStack(self: @EntityLifeStatus, world: IWorldDispatcher) -> bool;
    fn isInfected(self: @EntityLifeStatus) -> bool;
    fn isDead(self: @EntityLifeStatus) -> bool;
}

/// Implementation of the `EntityLifeStatusTrait` for the `EntityLifeStatus` struct.
impl EntityLifeStatusImpl of EntityLifeStatusTrait {
    #[inline(always)]
    fn new(id: felt252) -> EntityLifeStatus {
        EntityLifeStatus { id, infectionStacks: 0, isInfected: false, deadAt: 0, isDead: false, infected_by: 0 }
    }

    #[inline(always)]
    fn tick(self: @EntityLifeStatus, world: IWorldDispatcher) {
        let timestamp: u64 = starknet::get_block_info().unbox().block_timestamp;
        let player = get!(world, *self.id, Player);

        spreadAndGetInfection(*self.id, world, timestamp);

        let mut stackToInfection = 3;
        if (player.character == 2) {
            stackToInfection = 5;
        }
        if (!*self.isInfected && *self.infectionStacks >= stackToInfection) {
            infectEntity(*self.id, world, timestamp, *self.id);
        }
        if (*self.isInfected && timestamp >= *self.deadAt) {
            killEntity(*self.id, world);
            return;
        }
    }

    #[inline(always)]
    fn randomlyAddInfectionStack(self: @EntityLifeStatus, world: IWorldDispatcher) -> bool {
        if *self.isInfected {
            return false;
        }
        let entityId = *self.id;
        let player = get!(world, entityId, (Player));

        let salt = entityId + player.x.into() + (player.y * 100).into() + get_block_number().into();

        let rnd_value = _uniform_random(salt, 100);
        let mut stackChance = 10;
        if player.character == 1 {
            stackChance = 5;
        }

        if rnd_value <= stackChance { // 10% chance to get one stack
            let mut lifeStatus = get!(world, entityId, EntityLifeStatus);
            lifeStatus.infectionStacks += 1;
            set!(world, (lifeStatus));
            return true;
        }
        return false;
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