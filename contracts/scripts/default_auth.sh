#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

export RPC_URL="http://localhost:5050";

export WORLD_ADDRESS=$(cat ./target/dev/manifest.json | jq -r '.world.address')

export ACTIONS_ADDRESS=$(cat ./target/dev/manifest.json | jq -r '.contracts[] | select(.name == "plaguestark::actions::actions" ).address')

export LORDS_ADDRESS=$(cat ./target/dev/manifest.json | jq -r '.contracts[] | select(.name == "plaguestark::lords::lords" ).address')

export RANDOMNESS_ADDRESS=$(cat ./target/dev/manifest.json | jq -r '.contracts[] | select(.name == "plaguestark::randomness::Randomness" ).address')

export LOOTSURVIVOR_ADDRESS=$(cat ./target/dev/manifest.json | jq -r '.contracts[] | select(.name == "plaguestark::lootsurvivor::lootsurvivor" ).address')

echo "---------------------------------------------------------------------------"
echo world : $WORLD_ADDRESS 
echo " "
echo actions : $ACTIONS_ADDRESS
echo " "
echo lords : $LORDS_ADDRESS
echo " "
echo randomness : $RANDOMNESS_ADDRESS
echo " "
echo adventurer : $LOOTSURVIVOR_ADDRESS
echo "---------------------------------------------------------------------------"

# enable system -> component authorizations
COMPONENTS=("Player" "EntityLifeStatus" "EntityAtPosition" "PlayerScore" "Map" "Tile" "Type" "Game" "TileAtPosition" "PlayerInventory")

for component in ${COMPONENTS[@]}; do
    sozo auth writer $component $ACTIONS_ADDRESS --world $WORLD_ADDRESS --rpc-url $RPC_URL
done

ERC20_COMPONENTS=("ERC20Balance" "ERC20Allowance" "ERC20Meta")

for component in ${ERC20_COMPONENTS[@]}; do
    sozo auth writer $component $LORDS_ADDRESS --world $WORLD_ADDRESS --rpc-url $RPC_URL
done

LOOTSURVIVOR_COMPONENTS=("Adventurer")

for component in ${LOOTSURVIVOR_COMPONENTS[@]}; do
    sozo auth writer $component $LOOTSURVIVOR_ADDRESS --world $WORLD_ADDRESS --rpc-url $RPC_URL
done

# ERC20 Lords
echo "Initializing ERC20 LORDS token..."

# Initialize ERC20
sozo execute $LORDS_ADDRESS initializer --calldata $WORLD_ADDRESS,0x4c4f524453,0x4c4f524453,0x100000,$LORDS_ADDRESS

# Set ERC20 address
sozo execute $ACTIONS_ADDRESS set_lords_address --calldata $LORDS_ADDRESS
sozo execute $ACTIONS_ADDRESS set_randomness_address --calldata $RANDOMNESS_ADDRESS

# ERC20 Lords END

echo "Default authorizations have been successfully set."