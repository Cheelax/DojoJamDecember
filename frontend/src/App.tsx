import 'font-awesome/css/font-awesome.min.css';
import Modal from 'react-modal';
import Canvas from './ui/Canvas';
import { store } from './store';
import { useEffect } from 'react';
import { useNetworkLayer } from './dojo/useNetworkLayer';
import NewGame from './ui/NewGame';

function App() {
	const networkLayer = useNetworkLayer();
	const { loggedIn, username, selectedAdventurer } = store();
	useEffect(() => {
		if (!networkLayer || !networkLayer.account) return;

		store.setState({ networkLayer });

		const {
			account,
			systemCalls: { approveLords, faucetLords }
		} = networkLayer;
		setTimeout(function() {
			faucetLords(account);
		}, 100);
		setTimeout(function() {
			approveLords(account);
		}, 200);
	}, [networkLayer]);

	Modal.setAppElement('#root');
	return (
		<div className='flex flex-col min-h-screen w-full'>
			{loggedIn ? (
				<div className='flex-grow mx-auto mt-2'>
					<Canvas networkLayer={networkLayer} />
				</div>
			) : (
				<NewGame networkLayer={networkLayer}/>
			)}
		</div>
	);
}

export default App;
