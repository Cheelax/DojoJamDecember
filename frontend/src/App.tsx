import 'font-awesome/css/font-awesome.min.css';
import Modal from 'react-modal';
import Canvas from './ui/Canvas';
import { store } from './store';
import { useContext, useEffect } from 'react';
import { useNetworkLayer } from './dojo/useNetworkLayer';
import { AppProvider } from '@pixi/react';
import NewGame from './ui/NewGame';

function App() {
	const networkLayer = useNetworkLayer();

	useEffect(() => {
		if (!networkLayer || !networkLayer.account) return;

		store.setState({ networkLayer });
	}, [networkLayer]);

	Modal.setAppElement('#root');

	return (
		<div className='flex flex-col min-h-screen w-full'>
			<NewGame
				onClick={() => 'te'}
				onPseudoChange={() => 'te'}
			/>
			{/* <div className="flex-grow mx-auto mt-2">
        <Canvas networkLayer={networkLayer}/>
      </div> */}
		</div>
	);
}

export default App;
