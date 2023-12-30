use starknet::{ContractAddress, ClassHash};

#[starknet::interface]
trait IRandomness<TContractState> {
    fn request_random(
        ref self: TContractState,
        seed: u64,
        callback_address: ContractAddress,
        callback_fee_limit: u128,
        publish_delay: u64,
        num_words: u64,
        calldata: Array<felt252>
    ) -> u64;
    fn submit_random(
        ref self: TContractState,
        request_id: u64,
        requestor_address: ContractAddress,
        seed: u64,
        minimum_block_number: u64,
        callback_address: ContractAddress,
        callback_fee_limit: u128,
        callback_fee: u128,
        random_words: Span<felt252>,
        proof: Span<felt252>,
        calldata: Array<felt252>
    );
}


#[starknet::contract]
mod Randomness {
    use super::{ContractAddress, IRandomness, ClassHash};
    use starknet::{get_caller_address};
    use starknet::info::{get_block_number};
    use array::{ArrayTrait, SpanTrait};
    use traits::{TryInto, Into};
    const MAX_PREMIUM_FEE: u128 = 100000000; // 1$ with 8 decimals
    use plaguestark::actions::{IActionsDispatcher, IActionsDispatcherTrait};
    use poseidon::{poseidon_hash_span, PoseidonTrait};

    #[storage]
    struct Storage {
        num_words: u64,
    }

    #[external(v0)]
    impl IRandomnessImpl of IRandomness<ContractState> {
        fn request_random(
            ref self: ContractState,
            seed: u64,
            callback_address: ContractAddress,
            callback_fee_limit: u128, //the max amount the user can pay for the callback
            publish_delay: u64,
            num_words: u64,
            calldata: Array<felt252>
        ) -> u64 {
            self.num_words.write(num_words);
            return (1);
        }

        fn submit_random(
            ref self: ContractState,
            request_id: u64,
            requestor_address: ContractAddress,
            seed: u64,
            minimum_block_number: u64,
            callback_address: ContractAddress,
            callback_fee_limit: u128,
            callback_fee: u128, //the actual fee estimated off chain
            random_words: Span<felt252>,
            proof: Span<felt252>,
            calldata: Array<felt252>
        ) {
            let actionsDispatcher = IActionsDispatcher {
                contract_address: callback_address
            };
            let mut words: Array<felt252> = ArrayTrait::new();
            
            let mut nonce: u64 = 0;
            loop {
                if nonce >= self.num_words.read() {
                    break;
                }
                words.append(_uniform_random((seed + nonce).into(), 10000000).into());
                nonce += 1;
            };
            actionsDispatcher
                .receive_random_words(
                    requestor_address, request_id, words.span(), calldata.clone()
                );
        }
    }

    fn _uniform_random(seed: felt252, max: u128) -> u128 {
        let hash: u256 = poseidon_hash_span(array![seed].span()).into();
        hash.low % max
    }
}
