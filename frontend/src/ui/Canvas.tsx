import { Container, Stage } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { useEffect, useState } from 'react';
import heart from '../assets/heart1.png';
import skull from '../assets/skull.png';
import { Coordinate } from '../type/GridElement';
import { HEIGHT, H_OFFSET, WIDTH, areCoordsEqual, to_grid_coordinate } from '../utils/grid';
import MapComponent from './Map';
import Mob from './Mob';

interface CanvasProps {
  position: any,
  move: any;
  account: any;
}

const Canvas: React.FC<CanvasProps> = ({
  move,
  position,
  account,
}) => {
  const [hoveredTile, setHoveredTile] = useState<Coordinate | undefined>(undefined);

  PIXI.Texture.from(heart).baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  PIXI.Texture.from(skull).baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

  return (
    <div style={{ position: 'relative' }}>
      <Stage
        width={WIDTH}
        height={HEIGHT}
        // options={{ backgroundColor: '#242424' }}
        onPointerMove={(e) => {
          const gridPos = to_grid_coordinate({
            x: e.nativeEvent.offsetX - WIDTH / 2,
            y: e.nativeEvent.offsetY - H_OFFSET + 18, // 18 otherwise mouse not centered on the tile
          });
          const tileX = Math.round(gridPos.x);
          const tileY = Math.round(gridPos.y);

          const tileCoords = { x: tileX, y: tileY };
          if (hoveredTile === undefined || !areCoordsEqual(hoveredTile, tileCoords)) {
            setHoveredTile(tileCoords);
          }
        }}
        onPointerDown={(e) => {
          console.log('Click on map');
          const gridPos = to_grid_coordinate({
            x: e.nativeEvent.offsetX - WIDTH / 2,
            y: e.nativeEvent.offsetY - H_OFFSET + 18, // 18 otherwise mouse not centered on the tile
          });
          const tileX = Math.round(gridPos.x);
          const tileY = Math.round(gridPos.y);

          const tileCoords = { x: tileX, y: tileY };
          move(account, tileCoords.x, tileCoords.y)
        }}
      >
        <Container sortableChildren={true}>
          <MapComponent hoveredTile={hoveredTile} />
            <Mob
              type="knight"
              position={position}
            />
        </Container>
      </Stage>
    </div>
  );
};

export default Canvas;
