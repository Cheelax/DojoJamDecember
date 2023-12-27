import { Sprite } from '@pixi/react';
import { SCALE_MODES, Texture } from 'pixi.js';
import groundTile from '../assets/tilesets/tile.png';
import tree from '../assets/tree.png';
import tree1 from '../assets/trees_pngs/1.png';
import tree2 from '../assets/trees_pngs/2.png';
import tree3 from '../assets/trees_pngs/3.png';
import tree4 from '../assets/trees_pngs/4.png';
import rock1 from '../assets/rocks_png/1.png';
import rock2 from '../assets/rocks_png/2.png';
import rock3 from '../assets/rocks_png/3.png';
import rock4 from '../assets/rocks_png/4.png';
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
    [1]: tree1,
    [2]: rock1,
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
      const zIndexCoords = to_center(to_screen_coordinate(tile.x, tile.y));
      const zIndex = to_grid_coordinate(zIndexCoords).x + to_grid_coordinate(zIndexCoords).y;

      let scaleTile = tileData && tileData._type == 1 ? 0.5 : 1.5;
      if (tileData && tileData._type == 2) {
        scaleTile = 1.5;
      }
      if (tileData && tileData._type == 3) {
        scaleTile = 0.16;
      }

      return (
        <Sprite
          zIndex={zIndex}
          key={`${tile.x}-${tile.y}`}
          image={groundTile}
          anchor={0.5}
          scale={1.5}
          x={screenPos.x + WIDTH / 2}
          y={screenPos.y + H_OFFSET - adjustment}
        >
          {tileData && tileSprites[tileData._type] && (
            <Sprite
              key={`${tile.x}-${tile.y}-1`}
              image={tileSprites[tileData._type]}
              anchor={1}
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
