import { Account } from 'starknet';
import { SetupNetworkResult } from './setupNetwork';

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls({ execute }: SetupNetworkResult) {
  const approveLords = async (signer: Account) => {
    try {
      await execute(signer, 'plaguestark::lords::lords', 'approve', [
        import.meta.env.VITE_PUBLIC_ACTIONS_ADDRESS!,
        1000,
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const faucetLords = async (signer: Account) => {
    try {
      await execute(signer, 'plaguestark::lords::lords', 'faucet', []);
    } catch (e) {
      console.error(e);
    }
  };

  const spawn = async (signer: Account, amount: number, character: number, name: string) => {
    try {
      await execute(signer, 'plaguestark::actions::actions', 'spawn', [amount, character, name]);
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
    faucetLords,
    approveLords,
    spawn,
    move,
    drink_potion,
  };
}
