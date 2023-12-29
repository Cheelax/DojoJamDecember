#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

export RPC_URL="http://localhost:5050";

export WORLD_ADDRESS=$(cat ./target/dev/manifest.json | jq -r '.world.address')

export ACTIONS_ADDRESS=$(cat ./target/dev/manifest.json | jq -r '.contracts[] | select(.name == "plaguestark::actions::actions" ).address')

export LORDS_ADDRESS=$(cat ./target/dev/manifest.json | jq -r '.contracts[] | select(.name == "plaguestark::lords::lords" ).address')

echo "---------------------------------------------------------------------------"
echo world : $WORLD_ADDRESS 
echo " "
echo actions : $ACTIONS_ADDRESS
echo " "
echo lords : $LORDS_ADDRESS
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

# ERC20 Lords
echo "Initializing ERC20 LORDS token..."

# Initialize ERC20
# sozo execute $LORDS_ADDRESS initializer --calldata $WORLD_ADDRESS,0x4c4f524453,0x4c4f524453,0x100000,0x0,0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973
sozo execute $LORDS_ADDRESS initializer --calldata $WORLD_ADDRESS,0x4c4f524453,0x4c4f524453,0x100000,0x0,$LORDS_ADDRESS

# Approve actions
# sozo execute $LORDS_ADDRESS approve --calldata 0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973,0x0,0x100000

# echo approve
# sozo execute $LORDS_ADDRESS approve --calldata $ACTIONS_ADDRESS,0x0,0x100000

# Set ERC20 address
sozo execute $ACTIONS_ADDRESS set_lords_address --calldata $LORDS_ADDRESS

# ERC20 Lords END

echo "Default authorizations have been successfully set."