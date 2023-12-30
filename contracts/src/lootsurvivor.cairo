 #[derive(Component, Copy, Drop, Serde)]
 struct Adventurer {
    last_action_block: u16,
    health: u16,
    xp: u16,
    gold: u16,
    weapon_id: u8,
    weapon_xp: u16,
    weapon_metadata: u8,
    chest_id: u8,
    chest_xp: u16,
    chest_metadata: u8,
    head_id: u8,
    head_xp: u16,
    head_metadata: u8,
    waist_id: u8,
    waist_xp: u16,
    waist_metadata: u8,
    foot_id: u8,
    foot_xp: u16,
    foot_metadata: u8,
    hand_id: u8,
    hand_xp: u16,
    hand_metadata: u8,
    neck_id: u8,
    neck_xp: u16,
    neck_metadata: u8,
    ring_id: u8,
    ring_xp: u16,
    ring_metadata: u8,
    beast_health: u16,
    stat_points_available: u8,
    actions_per_block: u8,
    mutated: bool,
    strength: u8,
    dexterity: u8,
    vitality: u8,
}


#[starknet::interface]
trait ILootSurvivor<ContractState> {
    fn getAdventurer(self: @ContractState, id :felt252) -> Adventurer;
}

#[dojo::contract]
mod lootsurvivor {
    use super::Adventurer;
    use poseidon::poseidon_hash_span;

    fn _uniform_random(seed: felt252, max: u128) -> u128 {
        let hash: u256 = poseidon_hash_span(array![seed].span()).into();
        hash.low % max
    }

    #[external(v0)]
    fn getAdventurer(self: @ContractState, id :felt252) -> Adventurer {
        Adventurer {
            last_action_block: 0,
            health: 0,
            xp: 0,
            gold: 0,
            weapon_id: 0,
            weapon_xp: 0,
            weapon_metadata: 0,
            chest_id: 0,
            chest_xp: 0,
            chest_metadata: 0,
            head_id: 0,
            head_xp: 0,
            head_metadata: 0,
            waist_id: 0,
            waist_xp: 0,
            waist_metadata: 0,
            foot_id: 0,
            foot_xp: 0,
            foot_metadata: 0,
            hand_id: 0,
            hand_xp: 0,
            hand_metadata: 0,
            neck_id: 0,
            neck_xp: 0,
            neck_metadata: 0,
            ring_id: 0,
            ring_xp: 0,
            ring_metadata: 0,
            beast_health: 0,
            stat_points_available: 0,
            actions_per_block: 0,
            mutated: false,
            strength: _uniform_random(id,10).try_into().unwrap(),
            dexterity: _uniform_random(id + 10000,10).try_into().unwrap(),
            vitality: _uniform_random(id + 20000,10).try_into().unwrap(),
        }
    }
}
