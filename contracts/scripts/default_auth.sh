#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

export RPC_URL="http://localhost:5050";

export WORLD_ADDRESS=$(cat ./target/dev/manifest.json | jq -r '.world.address')

export ACTIONS_ADDRESS=$(cat ./target/dev/manifest.json | jq -r '.contracts[] | select(.name == "plaguestark::actions::actions" ).address')

export LORDS_ADDRESS=$(cat ./target/dev/manifest.json | jq -r '.contracts[] | select(.name == "plaguestark::lords::lords" ).address')

export RANDOMNESS_ADDRESS=$(cat ./target/dev/manifest.json | jq -r '.contracts[] | select(.name == "plaguestark::randomness::Randomness" ).address')

export LOOTSURVIVOR_ADDRESS=$(cat ./target/dev/manifest.json | jq -r '.contracts[] | select(.name == "plaguestark::lootsurvivor::lootsurvivor" ).address')

# This is a random address that's part of the prefunded accounts
export TREASURY_ADDRESS="0x5ae5b8925c1568f3ec6ab5f4d4ea4b5467e6d6a18f0944608a0d368ac15bdc7"

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
echo " "
echo treasury : $TREASURY_ADDRESS
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
sozo execute $LORDS_ADDRESS initializer --calldata $WORLD_ADDRESS,0x4c4f524453,0x4c4f524453,0x10000000000,$LORDS_ADDRESS

echo "Link contracts"

sozo execute $ACTIONS_ADDRESS set_lords_address --calldata $LORDS_ADDRESS
sozo execute $ACTIONS_ADDRESS set_randomness_address --calldata $RANDOMNESS_ADDRESS
sozo execute $ACTIONS_ADDRESS set_treasury_address --calldata $TREASURY_ADDRESS

echo "Default authorizations have been successfully set."