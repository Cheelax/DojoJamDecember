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


    // fn initialize(self: @ContractState);
    // fn randomize_stats( self: @ContractState);
    fn get_adventurer(self: @ContractState,id :felt252) -> Adventurer;
    // fn get_vitality( self: @ContractState) -> u8;
    // fn get_strength( self: @ContractState) -> u8;
    // fn get_dexterity( self: @ContractState) -> u8;
}

#[dojo::contract]
mod lootsurvivor {
    use super::ILootSurvivor;
    use super::Adventurer;
    use starknet::ContractAddress;
    use starknet::{get_caller_address, get_contract_address};
    use debug::PrintTrait;
    use poseidon::poseidon_hash_span;

    #[storage]
    struct Storage {
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

    mod Errors {
        const INVALID_ACTION: felt252 = 'SurvivorStats: Invalid action';
    }

    #[external(v0)]
    fn get_adventurer(self: @ContractState,id :felt252) -> Adventurer {
        let mut adventurer: Adventurer = Adventurer {
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
            strength: 0,
            dexterity: 0,
            vitality: 0,
        };
        
        adventurer.strength = random_u8(id);
        adventurer.vitality = random_u8(id+1);
        adventurer.dexterity = random_u8(id+2);
        adventurer
    }

    // #[external(v0)]
    // fn initialize(ref self: ContractState) {
    //     // Initial values for demonstration purposes
    //     self.last_action_block.write(0);
    //     self.health.write(0);
    //     self.xp.write(0);
    //     self.gold.write(0);
    //     self.weapon_id.write(0);
    //     self.weapon_xp.write(0);
    //     self.weapon_metadata.write(0);
    //     self.chest_id.write(0);
    //     self.chest_xp.write(0);
    //     self.chest_metadata.write(0);
    //     self.head_id.write(0);
    //     self.head_xp.write(0);
    //     self.head_metadata.write(0);
    //     self.waist_id.write(0);
    //     self.waist_xp.write(0);
    //     self.waist_metadata.write(0);
    //     self.foot_id.write(0);
    //     self.foot_xp.write(0);
    //     self.foot_metadata.write(0);
    //     self.hand_id.write(0);
    //     self.hand_xp.write(0);
    //     self.hand_metadata.write(0);
    //     self.neck_id.write(0);
    //     self.neck_xp.write(0);
    //     self.neck_metadata.write(0);
    //     self.ring_id.write(0);
    //     self.ring_xp.write(0);
    //     self.ring_metadata.write(0);
    //      self.beast_health.write(0);
    //     self.stat_points_available.write(0);
    //     self.actions_per_block.write(0);
    //     self.mutated.write(false);
    //     self.strength.write(0);
    //     self.dexterity.write(0);
    //     self.vitality.write(0);
    //     randomize_stats(ref self, 0);
    // }

    // #[external(v0)]
    // fn randomize_stats(ref self: ContractState, seed: felt252) {
    //     self.strength.write(random_u8(seed));
    //     self.dexterity.write(random_u8(seed+1));
    //     self.vitality.write(random_u8(seed+2));
    // }
  
    fn random_u8(seed:felt252) -> u8 {
        let hash: u256 = poseidon_hash_span(array![seed].span()).into();
        let mut rand : u8 = 0;
        rand=(hash.low % 10).try_into().unwrap();
        rand +1
    }

    // #[external(v0)]
    // fn get_vitality(ref self: ContractState) -> u8 {
    //     let vitality = self.vitality.read();
    //     println!("vitality: {}", vitality);
    //     vitality
    // }

    // #[external(v0)]
    // fn get_strength(ref self: ContractState) -> u8 {
    //     let strength = self.strength.read();
    //     println!("strength: {}", strength);
    //     strength
    // }

    // #[external(v0)]
    // fn get_dexterity(ref self: ContractState) -> u8 {
    //     let dexterity = self.dexterity.read();
    //     println!("dexterity: {}", dexterity);
    //     dexterity
    // }
}

#[cfg(test)]
mod tests {
    use starknet::class_hash::Felt252TryIntoClassHash;

    // Import world dispatcher
    use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
    use debug::PrintTrait;

    // Import test utils
    use dojo::test_utils::{spawn_test_world, deploy_contract};

    // Import lootsurvivor
    use super::{lootsurvivor, ILootSurvivorDispatcher, ILootSurvivorDispatcherTrait};

    #[test]
    #[available_gas(30000000)]
    fn test_randomize_stats() {
        // Caller
        let caller = starknet::contract_address_const::<0x0>();

        // Deploy world
        let world = spawn_test_world(array![]);

        // Deploy lootsurvivor contract
        let contract_address = world
            .deploy_contract('salt', lootsurvivor::TEST_CLASS_HASH.try_into().unwrap());
        let lootsurvivor_system = ILootSurvivorDispatcher { contract_address };

        // Initialize the contract
        let adventurer=lootsurvivor_system.get_adventurer(1);
       
        // Retrieve updated values
        let strength = adventurer.strength;
        let dexterity = adventurer.dexterity;
        let vitality = adventurer.vitality;
        println!("strength: {}", strength);
        println!("dexterity: {}", dexterity);
        println!("vitality: {}", vitality);

          // Initialize the contract
        let adventurer=lootsurvivor_system.get_adventurer(2);
       
        // Retrieve updated values
        let strength = adventurer.strength;
        let dexterity = adventurer.dexterity;
        let vitality = adventurer.vitality;
        println!("strength: {}", strength);
        println!("dexterity: {}", dexterity);
        println!("vitality: {}", vitality);

        // Assertions to verify that stats have been randomized
        assert( strength <= 10, 'Strength randomization failed');
        assert( dexterity <= 10, 'Dexterity randomization failed');
        assert( vitality <= 10, 'Vitality randomization failed');
    }
}
