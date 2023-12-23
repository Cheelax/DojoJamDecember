import { Sprite } from '@pixi/react';
import { SCALE_MODES, Texture } from 'pixi.js';
import groundTile from '../assets/tilesets/1_2.png';
import tree from '../assets/tree.png';
import rock from '../assets/rock.png';
import herb1 from '../assets/tilesets/herb1.png';
import alchemyLabs from '../assets/alchemylab.png';
import { Coordinate } from '../type/GridElement';
import { H_OFFSET, WIDTH, to_center, to_grid_coordinate, to_screen_coordinate } from '../utils/grid';
import { useEffect, useState } from 'react';
import { defineSystem, Has } from '@dojoengine/recs';

interface MapProps {
  hoveredTile?: Coordinate;
  networkLayer: any;
}

const Map: React.FC<MapProps> = ({ hoveredTile, networkLayer }) => {
  if (networkLayer == null) return null;
  const {
    world,
    components: { Tile },
  } = networkLayer;

  const [tiles, setTiles] = useState<any>({});

  // TODO: move this in config file
  const gridSize = 50;

  Texture.from(groundTile).baseTexture.scaleMode = SCALE_MODES.NEAREST;

  useEffect(() => {
    defineSystem(world, [Has(Tile)], function ({ value: [newValue] }: any) {
      setTiles((prevTiles: any) => {
        if (prevTiles[newValue.y] === undefined) {
          prevTiles[newValue.y] = {};
        }
        prevTiles[newValue.y][newValue.x] = newValue;
        return prevTiles;
      });
    });
  }, []);

  if (tiles === undefined) {
    return;
  }

  const tileSprites: any = {
    [1]: tree,
    [2]: rock,
    [3]: alchemyLabs,
    // [4]: hideouts,
    [5]: herb1,
  };

  return Array.from(Array(gridSize)).map((_: any, y: number) => {
    return Array.from(Array(gridSize)).map((_: any, x: number) => {
      const tile = { x, y, layer: 'base', type: 'ground' };
      const screenPos = to_screen_coordinate(tile.x, tile.y);

      // Shift hovered tile up
      const adjustment = hoveredTile && hoveredTile.x === tile.x && hoveredTile.y === tile.y ? 5 : 0;

      let tileData;
      if (tiles[tile.y] && tiles[tile.y][tile.x]) {
        tileData = tiles[tile.y][tile.x];
      }

      // Compute zIndex exactly like in Mob
      const zIndexCoords = to_center(to_screen_coordinate(tile.x, tile.y))
      const zIndex = to_grid_coordinate(zIndexCoords).x + to_grid_coordinate(zIndexCoords).y

      let scaleTile = tileData && tileData._type == 1 ? 0.25 : 0.5;
      if (tileData && (tileData._type == 2 || tileData._type == 3)) {
        scaleTile = 0.1
      }

      return (
        <Sprite
          zIndex={zIndex}
          key={`${tile.x}-${tile.y}`}
          image={groundTile}
          anchor={0.5}
          scale={2}
          x={screenPos.x + WIDTH / 2}
          y={screenPos.y + H_OFFSET - adjustment}
        >
          {tileData && tileSprites[tileData._type] && (
            <Sprite
              key={`${tile.x}-${tile.y}-1`}
              image={tileSprites[tileData._type]}
              anchor={0.5}
              scale={scaleTile}
              x={0}
              y={tileData._type == 1 ? -20 : -10}
            />
          )}
        </Sprite>
      );
    });
  });
};

export default Map;
