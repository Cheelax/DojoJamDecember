import { DojoProvider } from '@dojoengine/core';
import { Account, num } from 'starknet';
import { defineContractComponents } from './contractComponents';
import manifest from './manifest.json';
import { world } from './world';
import * as torii from "@dojoengine/torii-client";
import { createBurner } from "./createBurner";

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

export async function setupNetwork() {
  // Extract environment variables for better readability.
  const { VITE_PUBLIC_WORLD_ADDRESS, VITE_PUBLIC_NODE_URL, VITE_PUBLIC_TORII } = import.meta.env;

  // Create a new DojoProvider instance.
  const provider = new DojoProvider(VITE_PUBLIC_WORLD_ADDRESS, manifest, VITE_PUBLIC_NODE_URL);

  const toriiClient = await torii.createClient([], {
    rpcUrl: VITE_PUBLIC_NODE_URL,
    toriiUrl: VITE_PUBLIC_TORII,
    worldAddress: VITE_PUBLIC_WORLD_ADDRESS,
  });

  const { account, burnerManager } = await createBurner();

  // Return the setup object.
  return {
    provider,
    world,
    toriiClient,
  
    account,
    burnerManager,

    // Define contract components for the world.
    contractComponents: defineContractComponents(world),

    execute: async (
      signer: Account,
      contract: string,
      system: string,
      call_data: num.BigNumberish[]
    ) => {
        return provider.execute(signer, contract, system, call_data);
    },
  };
}
