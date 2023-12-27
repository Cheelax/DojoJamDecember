import { Container, Stage } from '@pixi/react';
import { PointerEvent, useEffect, useState } from 'react';
import { Coordinate } from '../type/GridElement';
import { HEIGHT, H_OFFSET, WIDTH, to_grid_coordinate, to_screen_coordinate } from '../utils/grid';
import MapComponent from './Map';
import Leaderboard from './Leaderboard';
import { defineSystem, Has } from '@dojoengine/recs';
import { NetworkLayer } from '../dojo/createNetworkLayer';
import Camera from './Camera';
import Inventory from './Inventory';
import Mob from './Mob';

interface CanvasProps {
  networkLayer: NetworkLayer | undefined;
}

const Canvas: React.FC<CanvasProps> = ({ networkLayer }) => {
  if (networkLayer == null) return null;
  const {
    systemCalls: { spawn, move },
    world,
    account,
    components: { Player, EntityLifeStatus },
  } = networkLayer;

  const [localPlayer, setLocalPlayer] = useState<any>();
  const [cameraOffset, setCameraOffset] = useState<Coordinate>({ x: 0, y: 0 });
  const [targetCameraOffset, setTargetCameraOffset] = useState<Coordinate>({ x: 0, y: 0 });
  const [pointerPosition, setPointerPosition] = useState<any>();

  const [entitiesLifeStatus, setEntitiesLifeStatus] = useState<any>({});
  const [players, setPlayers] = useState<any>({});

  function isLocalPlayer(id: number): boolean {
    return '0x' + id.toString(16) == account.address;
  }

  useEffect(() => {
    spawn(account);

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

    defineSystem(world, [Has(Player)], function ({ value: [newLocalPlayer] }: any) {
      if (newLocalPlayer && isLocalPlayer(newLocalPlayer.id)) {
        setLocalPlayer(newLocalPlayer);
        const pos = to_screen_coordinate(newLocalPlayer.x, newLocalPlayer.y);
        setTargetCameraOffset({ x: pos.x, y: pos.y - H_OFFSET * 2 - 30 });
      }
    });
  }, []);

  function getTileCoordsFromEvent(e: PointerEvent): Coordinate {
    const gridPos = to_grid_coordinate({
      x: e.nativeEvent.offsetX - WIDTH / 2 + cameraOffset.x,
      y: e.nativeEvent.offsetY - H_OFFSET + 18 + cameraOffset.y, // 18 otherwise mouse not centered on the tile
    });
    const tileX = Math.round(gridPos.x);
    const tileY = Math.round(gridPos.y);
    return { x: tileX, y: tileY } as Coordinate;
  }

  if (localPlayer === undefined) return;

  return (
    <div style={{ position: 'relative' }}>
      <Stage
        width={WIDTH}
        height={HEIGHT}
        onPointerMove={(e) => {
          setPointerPosition(e);
        }}
        onPointerDown={(e) => {
          const tileCoords = getTileCoordsFromEvent(e);
          if (tileCoords.x < 0 || tileCoords.x >= 50 || tileCoords.y < 0 || tileCoords.y >= 50) {
            // Out of map
            return;
          }
          move(account, tileCoords.x, tileCoords.y);
        }}
      >
        <Container sortableChildren={true} x={-cameraOffset.x} y={-cameraOffset.y}>
          <Camera
            cameraOffset={cameraOffset}
            targetCameraOffset={targetCameraOffset}
            setCameraOffset={setCameraOffset}
          />
          <MapComponent networkLayer={networkLayer} />
          {Object.values(players).map((player: any) => {
            return (
              <Mob
                key={player.id}
                orientation={player.orientation}
                lifeStatus={entitiesLifeStatus[player.id]}
                type="doctor1"
                targetPosition={{ x: player.x, y: player.y } as Coordinate}
              />
            );
          })}
        </Container>
        <Leaderboard networkLayer={networkLayer} localPlayer={localPlayer} />
        <Inventory networkLayer={networkLayer} localPlayer={localPlayer} />
      </Stage>
    </div>
  );
};

export default Canvas;
