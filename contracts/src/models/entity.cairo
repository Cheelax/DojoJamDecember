// Structure to represent an entity position with unique keys and an ID
#[derive(Model, Copy, Drop, Serde)]
struct EntityAtPosition {
    #[key]
    x: u16,
    #[key]
    y: u16,
    id: felt252,
}

#[derive(Model, Copy, Drop, Serde)]
struct EntityList {
    #[key]
    id: u32,
    entity_id: felt252,
    next_id: u32,
    prev_id: u32,
    last_id: u32,
}

use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
use debug::PrintTrait;

trait EntityListTrait {
    // Add in lsit and returns id
    fn add(world: IWorldDispatcher, entity_id: felt252) -> u32;
    // Get first node
    fn getFirst(world: IWorldDispatcher) -> EntityList;
    // Returns next Entity (call isLast before to avoid loop)
    fn getNext(self: @EntityList, world: IWorldDispatcher) -> EntityList;
    // Returns true if last Entity
    fn isLast(self: @EntityList, world: IWorldDispatcher) -> bool;
    // Remove
    fn remove(self: @EntityList, world: IWorldDispatcher);
    // Get id of the first empty space
    fn findEmptyNode(self: @EntityList, world: IWorldDispatcher) -> u32;
}

impl EntityListImpl of EntityListTrait {
    fn add(world: IWorldDispatcher, entity_id: felt252) -> u32 {
        let mut firstElement = get!(world, 0, EntityList);
 
        if firstElement.entity_id == 0 {
            firstElement.entity_id = entity_id;
            firstElement.next_id = 0;
            firstElement.prev_id = 0;
            firstElement.last_id = 0;
            set!(world, (firstElement));
            return 0;
        }

        let mut lastElement = get!(world, firstElement.last_id, EntityList);
        let newId = lastElement.id + 1;
        firstElement.last_id = newId;
        if (firstElement.id == lastElement.id) {
            firstElement.next_id = newId;
        }
        lastElement.next_id = newId;
        set!(world, (
            EntityList { id: newId, entity_id: entity_id, next_id: 0, prev_id: lastElement.id, last_id: newId },
            lastElement,
            firstElement,
        ));
        newId
    }

    fn getFirst(world: IWorldDispatcher) -> EntityList {
        let first = get!(world, 0, EntityList);
        if first.entity_id == 0 {
            return get!(world, first.next_id, EntityList);
        }
        return first;
    }

    fn getNext(self: @EntityList, world: IWorldDispatcher) -> EntityList {
        get!(world, (*self.next_id), EntityList)
    }

    fn isLast(self: @EntityList, world: IWorldDispatcher) -> bool {
        *self.next_id == 0
    }

    fn remove(self: @EntityList, world: IWorldDispatcher) {
        // If only one single element
        if (*self.id == 0 && *self.next_id == 0) {
            set!(world, (
                EntityList { id: 0, entity_id: 0, next_id: 0, prev_id: 0, last_id: 0 }
            ));
            return;
        }
        let mut prevElement = get!(world, *self.prev_id, EntityList);
        let mut nextElement = get!(world, *self.next_id, EntityList);

        if prevElement.id != *self.id {
            prevElement.next_id = nextElement.id;
        } else {
            prevElement.next_id = prevElement.id;
            prevElement.last_id = prevElement.id;
        }

        if nextElement.id != *self.id {
            nextElement.prev_id = prevElement.id;
        } else {
            nextElement.prev_id = nextElement.id;
            nextElement.last_id = nextElement.last_id;
        }

        if (*self.id == 0) {
            nextElement.last_id = *self.last_id;
            nextElement.prev_id = nextElement.id;
        }

        let mut nextId = nextElement.id;
        if nextId == *self.id {
            nextId = prevElement.id;
        }

        if prevElement.id != *self.id {
            set!(world, (
                prevElement,
            ))
        }

        if nextElement.id != *self.id {
            set!(world, (
                nextElement,
            ))
        }

        set!(world, (
            EntityList { id: *self.id, entity_id: 0, next_id: nextId, prev_id: 0, last_id: 0 }
        ))
    }
    
    fn findEmptyNode(self: @EntityList, world: IWorldDispatcher) -> u32 {
        // to implement
        return 0;
    }
}


#[cfg(test)]
mod tests {
    use starknet::class_hash::Felt252TryIntoClassHash;

    // import world dispatcher
    use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
    use debug::PrintTrait;
    use super::{EntityList, EntityListTrait, entity_list};

    // import test utils
    use dojo::test_utils::{spawn_test_world};

    #[test]
    #[available_gas(30000000)]
    fn test_one_element() {
        // models
        let mut models = array![entity_list::TEST_CLASS_HASH];

        // deploy world with models
        let world = spawn_test_world(models);

        let entity_id: felt252 = 134;
        EntityListTrait::add(world, entity_id);

        let node = EntityListTrait::getFirst(world);
        assert(node.entity_id == entity_id, 'Wrong entity_id');
        assert(node.next_id == 0, 'Wrong next_id');
        assert(node.prev_id == 0, 'Wrong prev_id');
    }

    #[test]
    #[available_gas(30000000)]
    fn test_remove_one_element() {
        // models
        let mut models = array![entity_list::TEST_CLASS_HASH];

        // deploy world with models
        let world = spawn_test_world(models);

        let entity_id: felt252 = 134;
        EntityListTrait::add(world, entity_id);

        let node = EntityListTrait::getFirst(world);
        node.remove(world);

        let node = EntityListTrait::getFirst(world);

        assert(node.entity_id == 0, 'Wrong entity_id');
        assert(node.next_id == 0, 'Wrong next_id');
        assert(node.prev_id == 0, 'Wrong prev_id');
    }

    #[test]
    #[available_gas(30000000)]
    fn test_two_element() {
        // models
        let mut models = array![entity_list::TEST_CLASS_HASH];

        // deploy world with models
        let world = spawn_test_world(models);

        let entity_id: felt252 = 134;
        EntityListTrait::add(world, entity_id);

        let second_entity_id: felt252 = 256;
        EntityListTrait::add(world, second_entity_id);

        let node = EntityListTrait::getFirst(world);
        assert(node.entity_id == entity_id, 'Wrong first entity_id');
        assert(node.next_id == 1, 'Wrong first next_id');
        assert(node.prev_id == 0, 'Wrong first prev_id');
        assert(node.last_id == 1, 'Wrong first last_id');

        let node = node.getNext(world);
        assert(node.entity_id == second_entity_id, 'Wrong second entity_id');
        assert(node.next_id == 0, 'Wrong second next_id');
        assert(node.prev_id == 0, 'Wrong second prev_id');
        assert(node.last_id == 1, 'Wrong second last_id');
    }

    #[test]
    #[available_gas(300000000)]
    fn test_two_element_remove_first() {
        // models
        let mut models = array![entity_list::TEST_CLASS_HASH];

        // deploy world with models
        let world = spawn_test_world(models);

        let entity_id: felt252 = 134;
        EntityListTrait::add(world, entity_id);

        let second_entity_id: felt252 = 256;
        EntityListTrait::add(world, second_entity_id);

        let node = EntityListTrait::getFirst(world);
        node.remove(world);

        let node = EntityListTrait::getFirst(world);
        assert(node.entity_id == second_entity_id, 'Wrong first entity_id');
        assert(node.next_id == 0, 'Wrong first next_id');
        assert(node.prev_id == 1, 'Wrong first prev_id');
        assert(node.last_id == 1, 'Wrong first last_id');

        assert(node.isLast(world) == true, 'Should be last');
    }

    // #[test]
    // #[available_gas(300000000)]
    // fn test_two_element_remove_last() {
    //     // models
    //     let mut models = array![entity_list::TEST_CLASS_HASH];

    //     // deploy world with models
    //     let world = spawn_test_world(models);

    //     let entity_id: felt252 = 134;
    //     EntityListTrait::add(world, entity_id);

    //     let second_entity_id: felt252 = 256;
    //     EntityListTrait::add(world, second_entity_id);

    //     let node = EntityListTrait::getFirst(world);
    //     node.getNext(world).remove(world);

    //     let node = EntityListTrait::getFirst(world);
    //     assert(node.entity_id == entity_id, 'Wrong first entity_id');
    //     assert(node.prev_id == 0, 'Wrong first prev_id');
    //     assert(node.last_id == 0, 'Wrong first last_id');
    //     assert(node.next_id == 0, 'Wrong first next_id');

    //     assert(node.isLast(world) == true, 'Should be last');
    // }
}