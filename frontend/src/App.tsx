import 'font-awesome/css/font-awesome.min.css';
import Modal from 'react-modal';
import { useDojo } from './DojoContext';
import Canvas from './ui/Canvas';

function App() {
  const {
    setup: {
      systemCalls: { spawn, move },
      components: { Player },
    },
    account: { account },
  } = useDojo();

  Modal.setAppElement('#root');

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-grow mx-auto mt-2">
        <Canvas
          spawn={spawn}
          move={move}
          Player={Player}
          account={account}
        />
      </div>
    </div>
  );
}

export default App;
