import { useComponentValue } from '@dojoengine/react';
import { EntityIndex } from '@latticexyz/recs';
import { Coordinate } from '../type/GridElement';
import { useElementStore } from '../utils/store';

export enum TileType {
  Ground,
  Hole,
  Knight
}

interface Mob {
  health?: number;
  position?: Coordinate;
}

const createMob = (health?: number, mob_position?: Coordinate): Mob => {
  return { health, position: mob_position };
};

export const useComponentStates = (Player: any) => {
  const { ip } = useElementStore((state) => state);

  const entityId = ip as EntityIndex;
  // const game = useComponentValue(Game, entityId);

  // useEffect(() => {
  //   console.log('game', game);
  // }, [game]);

  // const entityId2 = game?.game_id as EntityIndex;
  // const map = useComponentValue(Map, entityId2);
  //console.log('map', map);

  // ===================================================================================================================
  // KNIGHT
  // const knight = useComponentValue(
  //   Character,
  //   getEntityIdFromKeys([game?.game_id ? BigInt(game?.game_id) : BigInt(0), BigInt(TileType.Knight)])
  // );

  // let entityId3 = 0 as EntityIndex;
  // if (game && game.game_id !== undefined && map && map.level !== undefined && knight && knight.index !== undefined)
  //   entityId3 = getEntityIdFromKeys([
  //     game?.game_id ? BigInt(game?.game_id) : BigInt(0),
  //     BigInt(map?.level),
  //     BigInt(knight?.index),
  //   ]);
  // const knight_position = useComponentValue(Tile, entityId3);

  const player = useComponentValue(
    Player,
    entityId
  );
  console.log(player)

  return {
    player: createMob(10, { x: player?.x, y: player?.y })
    // game: { id: game?.game_id, over: game?.over, seed: game?.seed },
    // map: { level: map?.level, size: map?.size, spawn: map?.spawn, score: map?.score, over: map?.over, name: map?.name },
    // knight: createMob(knight?.health, knight_position),
  };
};
