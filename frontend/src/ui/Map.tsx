import { Container, Sprite } from '@pixi/react';
import { SCALE_MODES, Texture } from 'pixi.js';
import groundTile from '../assets/tilesets/1_2.png';
import tree from '../assets/tree.png';
import rock from '../assets/tilesets/3_0.png';
import herb1 from '../assets/tilesets/herb1.png';
import alchemyLabs from '../assets/tilesets/alchemyLabs.png';
import { Coordinate } from '../type/GridElement';
import { H_OFFSET, WIDTH, to_screen_coordinate } from '../utils/grid';
import Mob from './Mob';
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
    components: { EntityLifeStatus, Player, Tile },
  } = networkLayer;

  const [entitiesLifeStatus, setEntitiesLifeStatus] = useState<any>({});
  const [players, setPlayers] = useState<any>({});
  const [playersList, setPlayersList] = useState<any>([]);
  const [tiles, setTiles] = useState<any>({});

  // TODO: move this in config file
  const gridSize = 50;

  Texture.from(groundTile).baseTexture.scaleMode = SCALE_MODES.NEAREST;

  useEffect(() => {
    setPlayersList(Object.values(players));
  }, [players]);

  useEffect(() => {
    defineSystem(world, [Has(EntityLifeStatus)], function ({ value: [newValue] }: any) {
      setEntitiesLifeStatus((prevEntities: any) => {
        return { ...prevEntities, [newValue.id]: newValue };
      });
    });

    defineSystem(world, [Has(Player)], function ({ value: [newValue] }: any) {
      setPlayers((prevPlayers: any) => {
        return { ...prevPlayers, [newValue.id]: newValue };
      });
    });

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

      let player: typeof Player = undefined;
      if (playersList) {
        const playersOnCell = playersList.filter((p: any) => p.x == tile.x && p.y == tile.y);
        if (playersOnCell.length > 0) {
          player = playersOnCell[0];
        }
      }

      return (
        <Container key={`${tile.x}-${tile.y}-container`}>
          <Sprite
            key={`${tile.x}-${tile.y}`}
            image={groundTile}
            anchor={0.5}
            scale={2}
            x={screenPos.x + WIDTH / 2}
            y={screenPos.y + H_OFFSET - adjustment}
          />
          {tileData && tileSprites[tileData._type] && (
            <Sprite
              key={`${tile.x}-${tile.y}-1`}
              image={tileSprites[tileData._type]}
              anchor={0.5}
              scale={1}
              x={screenPos.x + WIDTH / 2}
              y={screenPos.y + H_OFFSET - adjustment - 25}
            />
          )}
          {player && (
            <Mob
              key={player.id}
              orientation={player.orientation}
              lifeStatus={entitiesLifeStatus[player.id]}
              type="knight"
              targetPosition={{ x: player.x, y: player.y } as Coordinate}
            />
          )}
        </Container>
      );
    });
  });
};

export default Map;
