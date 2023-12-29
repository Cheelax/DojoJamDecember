import { Account } from 'starknet';
import { SetupNetworkResult } from './setupNetwork';

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls({ execute }: SetupNetworkResult) {
  const connect = async (signer: Account) => {
    try {
      await execute(signer, 'plaguestark::actions::actions', 'connect', []);
    } catch (e) {
      console.error(e);
    }
  };

  const spawn = async (signer: Account, name: string) => {
    try {
      await execute(signer, 'plaguestark::actions::actions', 'spawn', [name]);
    } catch (e) {
      console.error(e);
    }
  };

  const move = async (signer: Account, x: number, y: number) => {
    try {
      await execute(signer, 'plaguestark::actions::actions', 'move', [x, y]);
    } catch (e) {
      console.error(e);
    }
  };

  const drink_potion = async (signer: Account) => {
    try {
      await execute(signer, 'plaguestark::actions::actions', 'drink_potion', []);
    } catch (e) {
      console.error(e);
    }
  };

  return {
    connect,
    spawn,
    move,
    drink_potion,
  };
}
