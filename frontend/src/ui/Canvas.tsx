import { Container, Stage } from '@pixi/react';
import { PointerEvent, useEffect, useState } from 'react';
import { Coordinate } from '../type/GridElement';
import { HEIGHT, H_OFFSET, WIDTH, areCoordsEqual, to_grid_coordinate } from '../utils/grid';
import MapComponent from './Map';
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

  useEffect(() => {
    spawn(account);

    defineSystem(world, [Has(Player)], function({ value: [newValue] }: any) {
      setPlayers((prevPlayers) => { return { ...prevPlayers, [newValue.id]: newValue } });
    });
  }, []);

  function getTileCoordsFromEvent(e: PointerEvent) : Coordinate {
    const gridPos = to_grid_coordinate({
      x: e.nativeEvent.offsetX - WIDTH / 2,
      y: e.nativeEvent.offsetY - H_OFFSET + 18, // 18 otherwise mouse not centered on the tile
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
          move(account, tileCoords.x, tileCoords.y)
        }}
      >
        <Container sortableChildren={true}>
          <MapComponent hoveredTile={hoveredTile} />
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
