import React, { FC } from 'react';
import { adventurerList } from '../utils/adventurerList';
import StatsCard from './StatsCard';
import NewGameButton from './NewGameButton';
import { store } from '../store';

interface NewGameProps {
	onPseudoChange?: (pseudo: string) => void; // Callback function to update parent state
}

const NewGame: FC<NewGameProps> = ({ onPseudoChange }) => {
	const { setLoggedIn, setUsername, username, setSelectedAdventurer, selectedAdventurer } = store();

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
		setUsername(value);
		// onPseudoChange(value); // Notify the parent of the change
	};

	const login = () => {
		setLoggedIn(true);
	};

	return (
		<div className='w-full min-h-screen flex flex-col items-center justify-center'>
			<div className='w-full max-w-xs'>
				<label
					className='block text-gray-700 text-sm font-bold mb-2'
					htmlFor='pseudo'
				>
					Username
				</label>
				<input
					className='shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-gray-600'
					id='pseudo'
					type='text'
					placeholder='Pseudo'
					value={username}
					onChange={handleInputChange}
					maxLength={18} // Limit the input to 30 characters
				/>
			</div>
			<div className=' w-full max-w-[80%] mb-12'>
				<p className='w-full text-start mt-20 mb-8'>Choose an adventurer below:</p>
				<div className='flex  justify-around'>
					{adventurerList.map((adventurer, index) => {
						return (
							<StatsCard
								key={index}
								data={adventurer}
								onClick={() => setSelectedAdventurer(adventurer)}
								isSelected={
									selectedAdventurer === null
										? undefined
										: selectedAdventurer.name === adventurer.name
								}
							/>
						);
					})}
				</div>
			</div>
			<NewGameButton
				onClick={login}
				disabled={!username || !selectedAdventurer}
			/>
		</div>
	);
};

export default NewGame;
