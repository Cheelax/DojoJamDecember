import { Account } from 'starknet';
import { SetupNetworkResult } from './setupNetwork';

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  { execute }: SetupNetworkResult,
) {
  const spawn = async (
    signer: Account,
  ) => {
    try {
      await execute(
        signer,
        "plaguestark::actions::actions",
        "spawn",
        []
      );
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
      await execute(
        signer,
        "plaguestark::actions::actions",
        "move",
        [x, y]
      );
    } catch (e) {
      console.error(e);
    }
  };

  const drink_potion = async (
    signer: Account,
  ) => {
    try {
      await execute(
        signer,
        "plaguestark::actions::actions",
        "drink_potion",
        []
      );
    } catch (e) {
      console.error(e);
    }
  };

  return {
    spawn,
    move,
    drink_potion,
  };
}