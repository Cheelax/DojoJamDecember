import React, { FC, useEffect, useState } from 'react';
import { adventurerList } from '../utils/adventurerList';
import StatsCard from './StatsCard';
import NewGameButton from './NewGameButton';
import { store } from '../store';
import Logo from '../assets/plague.webp';
import { NetworkLayer } from '../dojo/createNetworkLayer';

interface NewGameProps {
  onPseudoChange?: (pseudo: string) => void; // Callback function to update parent state
  networkLayer: NetworkLayer
}

const NewGame: FC<NewGameProps> = ({ onPseudoChange, networkLayer }) => {
  const { setLoggedIn, setUsername, username, setSelectedAdventurer, selectedAdventurer } = store();
  const [adventurers, setAdventurers] = useState<any[]>([]);

  useEffect(() => {
	if (!networkLayer) return;
	const {
	  network: {
		provider
	  },
    } = networkLayer;

    const fetchAdventurers = async () => {
      const results = [];
      for (let i = 1; i <= 5; i++) {
        try {
          await delay(100);
          const { result } = await provider.call(
            'plaguestark::lootsurvivor::lootsurvivor',
            'getAdventurer',
            [i]
          );
		  const adventurer = {
			strength: result[result.length - 3],
			dexterity: result[result.length - 2],
			vitality: result[result.length - 1],
		  }
		  console.log(adventurer);
          results.push(adventurer);
        } catch (error) {
          console.error(`Error fetching adventurer ${i}:`, error);
        }
      }
      setAdventurers(results);
    };

    fetchAdventurers();
  }, [networkLayer]);

  const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  useEffect(() => {
    console.log('NewGame.tsx useEffect', adventurers);
  }, [adventurers]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setUsername(value);
    // onPseudoChange(value); // Notify the parent of the change
  };

  const login = () => {
    setLoggedIn(true);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center">
      <img src={Logo} alt="Plague" className="w-1/4 mb-16" />
      <div className="w-full max-w-xs">
        <label className="block text-[#fae8c8] text-sm font-bold mb-2" htmlFor="pseudo">
          Username
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-gray-600"
          id="pseudo"
          type="text"
          placeholder="Pseudo"
          value={username}
          onChange={handleInputChange}
          maxLength={18} // Limit the input to 30 characters
        />
      </div>
      <div className=" w-full max-w-[80%] mb-12">
        <p className="w-full text-start mt-20 mb-8">Choose an adventurer below:</p>
        <div className="flex  justify-around">
          {adventurerList.map((adventurer, index) => {
            return (
              <StatsCard
                key={index}
                data={adventurer}
                onClick={() => setSelectedAdventurer(adventurer)}
                isSelected={selectedAdventurer === null ? undefined : selectedAdventurer.name === adventurer.name}
              />
            );
          })}
        </div>
      </div>
      <NewGameButton onClick={login} disabled={!username || !selectedAdventurer} />
    </div>
  );
};

export default NewGame;
