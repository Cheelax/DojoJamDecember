import 'font-awesome/css/font-awesome.min.css';
import Modal from 'react-modal';
import Canvas from './ui/Canvas';
import { store } from './store';
import { useEffect } from 'react';
import { useNetworkLayer } from './dojo/useNetworkLayer';
import NewGame from './ui/NewGame';
import { sound as pixiSound } from '@pixi/sound'

function App() {
  const networkLayer = useNetworkLayer();
  const { loggedIn, username, selectedAdventurer } = store();
  useEffect(() => {
    if (!networkLayer || !networkLayer.account) return;

    store.setState({ networkLayer });

	const soundList = [
		'become_infected',
		'dead',
		'drink',
		'get_infection_stack',
		'health_restore',
		'pick_flower',
		'select_player',
		'soundtrack',
		'start_game',
		'walk',
	]
	for (const sound of soundList) {
		pixiSound.add(sound, `assets/sfx/${sound}.mp3`);
	}

    const {
      account,
      systemCalls: { approveLords },
    } = networkLayer;
    approveLords(account);
  }, [networkLayer]);

  Modal.setAppElement('#root');
  return (
    <div className="flex flex-col min-h-screen w-full">
      {loggedIn ? (
        <div className="flex-grow mx-auto mt-2">
          <Canvas networkLayer={networkLayer} />
        </div>
      ) : (
        <NewGame networkLayer={networkLayer} />
      )}
    </div>
  );
}

export default App;
