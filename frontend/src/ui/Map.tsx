import { Sprite } from '@pixi/react';
import { SCALE_MODES, Texture } from 'pixi.js';
import groundTile from '../assets/tilesets/tile.png';
import tree1 from '../assets/trees_pngs/1.png';
import tree2 from '../assets/trees_pngs/2.png';
import tree3 from '../assets/trees_pngs/3.png';
import tree4 from '../assets/trees_pngs/4.png';
import rock1 from '../assets/rocks_png/1.png';
import rock2 from '../assets/rocks_png/2.png';
import rock3 from '../assets/rocks_png/3.png';
import rock4 from '../assets/rocks_png/4.png';
import herb1 from '../assets/tilesets/herb1.png';
import herb2 from '../assets/png_flower/2.png';
import alchemyLab1 from '../assets/alchemylab/lab_1.png';
import alchemyLab2 from '../assets/alchemylab/lab_2.png';
import { Coordinate } from '../type/GridElement';
import { H_OFFSET, WIDTH, to_center, to_grid_coordinate, to_screen_coordinate } from '../utils/grid';
import { useEffect, useState } from 'react';
import { defineSystem, Has } from '@dojoengine/recs';
import overlay_blue from '../assets/tilesets/overlay_blue.png';
import overlay_yellow from '../assets/tilesets/overlay_yellow.png';

interface MapProps {
  hoveredTile?: Coordinate;
  networkLayer: any;
  neighbor?: any[];
}

const Map: React.FC<MapProps> = ({ hoveredTile, networkLayer, neighbor }) => {
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
    [1]: [tree1, tree2, tree3, tree4],
    [2]: [rock1, rock2, rock3, rock4],
    [3]: [alchemyLab1, alchemyLab2],
    // [4]: hideouts,
    [5]: [herb1, herb2],
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

      let scaleTile = 1;
      if (tileData && tileData._type == 3) {
        scaleTile = 1;
      }

      let tileSprite;
      if (tileData && tileSprites[tileData._type]) {
        const sprites = tileSprites[tileData._type];
        tileSprite = sprites[Math.floor(tile.x + tile.y) % sprites.length];
      }
      let showmarker = false;
      neighbor?.map((n: any) => {
        if (n.x == tile.x && n.y == tile.y) {
          showmarker = true;
        }
      });

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
          {showmarker && <Sprite image={overlay_blue} anchor={0.5} scale={2} x={0} y={0} />}
          {tileData && tileSprite && (
            <Sprite
              key={`${tile.x}-${tile.y}-1`}
              image={tileSprite}
              anchor={0.5}
              scale={scaleTile}
              x={0}
              y={tileData._type == 3 ? -55 : -30}
            />
          )}
          {}
        </Sprite>
      );
    });
  });
};

export default Map;
