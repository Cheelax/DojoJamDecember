import 'font-awesome/css/font-awesome.min.css';
import Modal from 'react-modal';
import Canvas from './ui/Canvas';
import { store } from './store';
import { useEffect } from 'react';
import { useNetworkLayer } from './dojo/useNetworkLayer';

function App() {
  const networkLayer = useNetworkLayer();

  useEffect(() => {
    if (!networkLayer || !networkLayer.account) return;

    store.setState({ networkLayer });
  }, [networkLayer]);

  Modal.setAppElement('#root');

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-grow mx-auto mt-2">
        <Canvas networkLayer={networkLayer}/>
      </div>
    </div>
  );
}

export default App;
