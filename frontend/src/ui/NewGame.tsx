import React, { FC, useEffect, useRef, useState } from 'react';
import { adventurerList, AdventurerType } from '../utils/adventurerList';
import StatsCard from './StatsCard';
import NewGameButton from './NewGameButton';
import { store } from '../store';
import Logo from '../assets/plague.png';
import { NetworkLayer } from '../dojo/createNetworkLayer';
import { sound as pixiSound } from '@pixi/sound';
import RulesButton from './RulesButton';
import FaucetButton from './FaucetButton';
import Modal from './Modal';

interface NewGameProps {
  onPseudoChange?: (pseudo: string) => void;
  networkLayer: NetworkLayer;
}

const NewGame: FC<NewGameProps> = ({ onPseudoChange, networkLayer }) => {
  const {
    setLoggedIn,
    setUsername,
    username,
    setSelectedAdventurer,
    selectedAdventurer,
    setLordsAmount: setLordsAmountStore,
    lordsAmount: lordsAmountStore,
  } = store();
  const [adventurers, setAdventurers] = useState<AdventurerType[]>(adventurerList);
  const [receivedFaucet, setReceivedFaucet] = useState<boolean>(false);
  const [lordsAmount, setLordsAmount] = useState<number>(lordsAmountStore);
  const [clickFaucet, setClickFaucet] = useState<boolean>(false);

  const [isRulesModalOpen, setRulesModalOpen] = useState(false);

  const openRulesModal = () => {
    setRulesModalOpen(true);
  };

  // Function to close the rules modal
  const closeRulesModal = () => {
    setRulesModalOpen(false);
  };

  useEffect(() => {
    if (!networkLayer) return;
    const {
      network: { provider, account },
      systemCalls: { faucetLords },
    } = networkLayer;

    const fetchAdventurers = async () => {
      const results = [];
      for (let i = 1; i <= adventurerList.length; i++) {
        try {
          await delay(100);
          const { result } = await provider.call('plaguestark::lootsurvivor::lootsurvivor', 'getAdventurer', [i]);
          const adventurer = {
            strength: parseInt(result[result.length - 3], 16),
            dexterity: parseInt(result[result.length - 2], 16),
            vitality: parseInt(result[result.length - 1], 16),
          };
          console.log(adventurer);
          results.push(adventurer);
        } catch (error) {
          console.error(`Error fetching adventurer ${i}:`, error);
        }
      }
      updateAdventurerList(results);
    };

    fetchAdventurers();
  }, [networkLayer]);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeRulesModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setLordsAmountStore(lordsAmount);
  }, [lordsAmount]);

  const updateAdventurerList = (newValues: any[]) => {
    const updatedAdventurers = adventurerList.map((adventurer, index) => {
      if (index < newValues.length) {
        const updatedValues = adventurer.value.map((stat) => {
          const newValue = newValues[index][stat.name];
          return newValue ? { ...stat, value: newValue.toString() } : stat;
        });
        return { ...adventurer, value: updatedValues };
      }
      return adventurer;
    });
    setAdventurers(updatedAdventurers);
  };

  const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setUsername(value);
    if (onPseudoChange) {
      onPseudoChange(value);
    }
  };

  const login = () => {
    pixiSound.play('start_game');
    setLoggedIn(true);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center">
      <div style={{ position: 'absolute', right: 10, top: 10, display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }} className="mx-5">
          {lordsAmount}
        </div>
        <img src="assets/lords.png" style={{ float: 'right' }} className="mr-2" />
        {!clickFaucet && (
          <FaucetButton
            onClick={() => {
              if (!networkLayer) return;
              const {
                account,
                systemCalls: { faucetLords },
              } = networkLayer;
              faucetLords(account);
              setClickFaucet(true);
              setTimeout(() => {
                setReceivedFaucet(true);
                setLordsAmount(lordsAmount + 1000);
              }, 1000);
            }}
            disabled={clickFaucet}
          />
        )}
      </div>
      <img src={Logo} alt="Plague" className="w-1/4 mb-8 mt-8" />
      <div className="w-full max-w-xs">
        <label className="block text-[#fae8c8] text-sm font-bold mb-2" htmlFor="pseudo">
          Username
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-gray-600 mb-2"
          id="pseudo"
          type="text"
          placeholder="Pseudo"
          value={username}
          onChange={handleInputChange}
          maxLength={18}
        />
      </div>
      <div className=" w-full max-w-[80%] mb-2">
        <p className="w-full text-start mt-20 mb-2">Choose an adventurer below:</p>
        <div className="flex  justify-around">
          {adventurers.map((adventurer, index) => (
            <StatsCard
              key={index}
              data={adventurer}
              onClick={() => {
                pixiSound.play('select_player');
                setSelectedAdventurer(adventurer);
              }}
              isSelected={selectedAdventurer === null ? undefined : selectedAdventurer.name === adventurer.name}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-center space-around space-x-4 w-full">
        <RulesButton onClick={openRulesModal} />
        <NewGameButton onClick={login} disabled={!username || !selectedAdventurer || !receivedFaucet} />
      </div>
      <Modal isOpen={isRulesModalOpen} onClose={closeRulesModal} modalRef={modalRef}></Modal>
    </div>
  );
};

export default NewGame;
