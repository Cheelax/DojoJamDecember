import { Container, Stage } from '@pixi/react';
import { PointerEvent, useEffect, useState } from 'react';
import { Coordinate } from '../type/GridElement';
import { HEIGHT, H_OFFSET, WIDTH, areCoordsEqual, to_grid_coordinate } from '../utils/grid';
import MapComponent from './Map';
import Mob from './Mob';
import { defineSystem, Has } from '@latticexyz/recs';

interface CanvasProps {
  spawn: any;
  move: any;
  world: any;
  account: any;
  Player: any;
}

const Canvas: React.FC<CanvasProps> = ({
  move,
  spawn,
  world,
  account,
  Player
}) => {
  const [hoveredTile, setHoveredTile] = useState<Coordinate | undefined>(undefined);
  const [player, setPlayer] = useState({ x: 0, y: 0, id: 0, orientation: 0 })

  useEffect(() => {
    // Played once
    spawn(account);
    defineSystem(world, [Has(Player)], ({ value: [newValue]}: any) => {
      // Called whenever the player is updated
      // TODO: (maybe) split position and orientation in submodels?
      setPlayer(newValue)
    });  
  }, [account])

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
            <Mob
              type="knight"
              position={{x: player.x, y: player.y} as Coordinate}
            />
        </Container>
      </Stage>
    </div>
  );
};

export default Canvas;
