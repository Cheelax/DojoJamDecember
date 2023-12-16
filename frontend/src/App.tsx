import 'font-awesome/css/font-awesome.min.css';
import Modal from 'react-modal';
import { useDojo } from './DojoContext';
import Canvas from './ui/Canvas';
import { defineSystem, Has } from '@latticexyz/recs';
import { useState } from 'react';
import { Coordinate } from './type/GridElement';

function App() {
  const {
    setup: {
      systemCalls: { spawn, move },
      components: { Player },
      network: { world }
    },
    account: { account },
  } = useDojo();

  Modal.setAppElement('#root');
  spawn(account);

  const [position, setPosition] = useState({ x: 0, y: 0 })

  defineSystem(world, [Has(Player)], ({ entity, value: [newValue] }: any) => {
    console.log("Entity", entity, "moved to", newValue.value);
    const pos = newValue as Coordinate
    setPosition({ x: pos.x, y: pos.y })
    // ... do stuff, like rendering the entity on the screen, etc
  });

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-grow mx-auto mt-2">
        <Canvas
          move={move}
          position={position}
          account={account}
        />
      </div>
    </div>
  );
}

export default App;
