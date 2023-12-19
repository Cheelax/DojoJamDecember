// Core imports
use starknet::{ContractAddress};

// External imports

enum LifeStatus {
    Alive: (),
    Infected: (),
    Dead: (),
    Decomposed: (),
}

// EntityLifeStatus
#[derive(Model)]
struct EntityLifeStatus {
    #[key]
    id: ContractAddress,
    status: LifeStatus
}

// EntityLifeStatus
#[derive(Model)]
struct EntityInfectionStatus {
    #[key]
    id: ContractAddress,
    infected: bool,

}
