import { Sprite } from '@pixi/react';
import { SCALE_MODES, Texture } from 'pixi.js';
import groundTile from '../assets/tilesets/0_1.png';
import { Coordinate } from '../type/GridElement';
import { H_OFFSET, WIDTH, to_screen_coordinate } from '../utils/grid';

interface MapProps {
  hoveredTile?: Coordinate;
  cameraOffset: Coordinate;
}

const Map: React.FC<MapProps> = ({ hoveredTile, cameraOffset }) => {
  // TODO: move this in config file
  const gridSize = 50

  Texture.from(groundTile).baseTexture.scaleMode = SCALE_MODES.NEAREST;

  return Array.from(Array(gridSize)).map((_: any, y: number) => {
    return Array.from(Array(gridSize)).map((_: any, x: number) => {
      const tile = { x, y, layer: "base", type: "ground" }
      const screenPos = to_screen_coordinate(tile.x, tile.y);

      // Shift hovered tile up
      const adjustment = hoveredTile && hoveredTile.x === tile.x && hoveredTile.y === tile.y ? 5 : 0;

      return (
        <Sprite
          key={`${tile.x}-${tile.y}`}
          image={groundTile}
          anchor={0.5}
          scale={2}
          x={screenPos.x + WIDTH / 2}
          y={screenPos.y + H_OFFSET - adjustment}
        />
      );
    });
  });
};

export default Map;
