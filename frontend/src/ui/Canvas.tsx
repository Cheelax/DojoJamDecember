import { Container, Stage, useTick } from '@pixi/react';
import { PointerEvent, useEffect, useState } from 'react';
import { Coordinate } from '../type/GridElement';
import { HEIGHT, H_OFFSET, WIDTH, areCoordsEqual, to_grid_coordinate } from '../utils/grid';
import MapComponent from './Map';
import Camera from './Camera';
import Mob from './Mob';
import { defineSystem, Has } from '@dojoengine/recs';
import { NetworkLayer } from '../dojo/createNetworkLayer';

interface CanvasProps {
  networkLayer: NetworkLayer | null
}

const Canvas: React.FC<CanvasProps> = ({
  networkLayer
}) => {
  if (networkLayer == null) return null;
  const {
    systemCalls,
    world,
    account,
    components: { Player }
  } = networkLayer

  const { spawn, move } = systemCalls
  const [hoveredTile, setHoveredTile] = useState<Coordinate | undefined>(undefined);
  const [players, setPlayers] = useState({});
  const [cameraOffset, setCameraOffset] = useState<Coordinate>({x: 0, y: 0});

  function isLocalPlayer(id: number): boolean {
    return "0x" + id.toString(16) == account.address
  }

  useEffect(() => {
    spawn(account);
  
    // Player update sent my Torii
    defineSystem(world, [Has(Player)], function({ value: [newValue] }: any) {
      setPlayers((prevPlayers) => { return { ...prevPlayers, [newValue.id]: newValue } });
    });
  }, []);

  function getTileCoordsFromEvent(e: PointerEvent) : Coordinate {
    const gridPos = to_grid_coordinate({
      x: e.nativeEvent.offsetX - WIDTH / 2 + cameraOffset.x,
      y: e.nativeEvent.offsetY - H_OFFSET + 18 + cameraOffset.y, // 18 otherwise mouse not centered on the tile
    });
    const tileX = Math.round(gridPos.x);
    const tileY = Math.round(gridPos.y);
    return { x: tileX, y: tileY } as Coordinate;
  }

  return (
    <div style={{ position: 'relative' }}>
      <Stage
        width={WIDTH}
        height={HEIGHT}
        // options={{ backgroundColor: '#242424' }}
        onPointerMove={(e) => {
          const tileCoords = getTileCoordsFromEvent(e)
          if (hoveredTile === undefined || !areCoordsEqual(hoveredTile, tileCoords)) {
            setHoveredTile(tileCoords);
          }
        }}
        onPointerDown={(e) => {
          const tileCoords = getTileCoordsFromEvent(e)
          if (tileCoords.x < 0 || tileCoords.x >= 50 || tileCoords.y < 0 || tileCoords.y >= 50) {
            // Out of map
            return
          }
          move(account, tileCoords.x, tileCoords.y)
        }}
      >
        <Container sortableChildren={true} x={-cameraOffset.x} y={-cameraOffset.y} >
          <Camera setCameraOffset={setCameraOffset}/>
          <MapComponent hoveredTile={hoveredTile} cameraOffset={cameraOffset}/>
            {Object.values(players).map((player: typeof Player) => {
              return <Mob
                key={player.id}
                type="knight"
                position={{x: player.x, y: player.y} as Coordinate}
              />
            })}
        </Container>
      </Stage>
    </div>
  );
};

export default Canvas;
