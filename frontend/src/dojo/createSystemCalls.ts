import { Component, Components, EntityIndex, Schema, setComponent } from '@latticexyz/recs';
import { poseidonHashMany } from 'micro-starknet';
import { Account, Call, Event, InvokeTransactionReceiptResponse } from 'starknet';
import { SetupNetworkResult } from './setupNetwork';

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  { execute, contractComponents }: SetupNetworkResult,
) {
  const spawn = async (
    signer: Account,
  ) => {
    try {
      const calls: Call[] = [
        {
          contractAddress: import.meta.env.VITE_PUBLIC_ACTIONS_ADDRESS || '',
          entrypoint: 'spawn',
          calldata: [import.meta.env.VITE_PUBLIC_WORLD_ADDRESS],
        },
      ];
      const tx = await execute(signer, calls);

      const receipt = (await signer.waitForTransaction(tx.transaction_hash, {
        retryInterval: 100,
      })) as InvokeTransactionReceiptResponse;

      const events = receipt.events;

      if (events) {
        const eventsTransformed = await setComponentsFromEvents(contractComponents, events);
        await executeEvents(eventsTransformed);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const move = async (
    signer: Account,
    x: number,
    y: number
  ) => {
    try {
      const calls: Call[] = [
        {
          contractAddress: import.meta.env.VITE_PUBLIC_ACTIONS_ADDRESS || '',
          entrypoint: 'move',
          // TODO: use config map size / half map size (see other todo "= 50")
          calldata: [x + 25, y + 25], // avoid overflow if negative
        },
      ];
      const tx = await execute(signer, calls);

      const receipt = (await signer.waitForTransaction(tx.transaction_hash, {
        retryInterval: 100,
      })) as InvokeTransactionReceiptResponse;

      const events = receipt.events;

      if (events) {
        const eventsTransformed = await setComponentsFromEvents(contractComponents, events);
        await executeEvents(eventsTransformed);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return {
    move,
    spawn,
  };
}

export async function executeEvents(
  events: TransformedEvent[]
) {
  const playerEvents = events.filter((e): e is PlayerEvent & ComponentData => e.type === 'Player');
  for (const e of playerEvents) {
    setComponent(e.component, e.entityIndex, e.componentValues);
  }
  await sleep(1000);
}

// DISCUSSION: MUD expects Numbers, but entities in Starknet are BigInts (from poseidon hash)
// so I am converting them to Numbers here, but it means that there is a bigger risk of collisions
export function getEntityIdFromKeys(keys: bigint[]): EntityIndex {
  if (keys.length === 1) {
    return parseInt(keys[0].toString()) as EntityIndex;
  }
  // calculate the poseidon hash of the keys
  const poseidon = poseidonHashMany([BigInt(keys.length), ...keys]);
  return parseInt(poseidon.toString()) as EntityIndex;
}

function hexToAscii(hex: string) {
  let str = '';
  for (let n = 2; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type PlayerEvent = ComponentData & {
  type: 'Player';
  id: bigint;
  orientation: number;
  x: number;
  y: number;
};

function handlePlayerEvent(
  keys: bigint[],
  values: string[]
): Omit<PlayerEvent, 'component' | 'componentValues' | 'entityIndex'> {
  const x = parseInt(values[0], 16) - 25
  const y = parseInt(values[1], 16) - 25
  const orientation = parseInt(values[2], 16);
  return {
    type: 'Player',
    orientation: orientation,
    id: keys[0],
    x,
    y,
  };
}

type ComponentData = {
  component: Component;
  componentValues: Schema;
  entityIndex: EntityIndex;
};

type TransformedEvent = PlayerEvent;

export async function setComponentsFromEvents(components: Components, events: Event[]): Promise<TransformedEvent[]> {
  const transformedEvents = [];

  for (const event of events) {
    const componentName = hexToAscii(event.data[0]);
    const keysNumber = parseInt(event.data[1]);
    const keys = event.data.slice(2, 2 + keysNumber).map((key) => BigInt(key));
    let index = 2 + keysNumber + 1;
    const numberOfValues = parseInt(event.data[index++]);
    const values = event.data.slice(index, index + numberOfValues);

    // Component
    const component = components[componentName];
    const componentValues = Object.keys(component.schema).slice(keysNumber).reduce((acc: Schema, key, index) => {
      const value = values[index];
      acc[key] = Number(value);
      return acc;
    }, {});
    const entity = getEntityIdFromKeys(keys);
    componentValues.id = entity

    const baseEventData = {
      component,
      componentValues,
      entityIndex: entity,
    };

    switch (componentName) {
      case 'Player':
        transformedEvents.push({
          ...baseEventData,
          componentValues: {
            ...componentValues,
            ...handlePlayerEvent(keys, values) // Hack needed if the values must be computed client side
          },
          ...handlePlayerEvent(keys, values)
        });
        break;
    }
  }

  return transformedEvents;
}
