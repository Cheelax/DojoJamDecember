import { Container, Stage } from '@pixi/react';
import { PointerEvent, useEffect, useState } from 'react';
import { Coordinate } from '../type/GridElement';
import { HEIGHT, H_OFFSET, WIDTH, areCoordsEqual, to_grid_coordinate, to_screen_coordinate } from '../utils/grid';
import MapComponent from './Map';
import Leaderboard from './Leaderboard';
import { defineSystem, Has, defineEnterSystem } from '@dojoengine/recs';
import { NetworkLayer } from '../dojo/createNetworkLayer';
import Camera from './Camera';

interface CanvasProps {
  networkLayer: NetworkLayer | null;
}

const Canvas: React.FC<CanvasProps> = ({ networkLayer }) => {
  if (networkLayer == null) return null;
  const {
    systemCalls,
    world,
    account,
    components: { Player },
  } = networkLayer;

  const { spawn, move } = systemCalls;
  const [hoveredTile, setHoveredTile] = useState<Coordinate | undefined>(undefined);
  const [localPlayer, setLocalPlayer] = useState<any>();
  const [cameraOffset, setCameraOffset] = useState<Coordinate>({ x: 0, y: 0 });
  const [targetCameraOffset, setTargetCameraOffset] = useState<Coordinate>({ x: 0, y: 0 });
  const [pointerPosition, setPointerPosition] = useState<any>();

  // could be useful to check if "player.id" is the local player
  function isLocalPlayer(id: number): boolean {
    return '0x' + id.toString(16) == account.address;
  }

  useEffect(() => {
    if (localPlayer === undefined) return;
    const pos = to_screen_coordinate(localPlayer.x, localPlayer.y);
    setTargetCameraOffset({ x: pos.x, y: pos.y - H_OFFSET });
  }, [localPlayer]);

  useEffect(() => {
    spawn(account);

    defineSystem(world, [Has(Player)], function ({ value: [newValue] }: any) {
      if (isLocalPlayer(newValue.id)) {
        setLocalPlayer(newValue);
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
        // options={{ backgroundColor: '#242424' }}
        onPointerMove={(e) => {
          setPointerPosition(e);
          const tileCoords = getTileCoordsFromEvent(e);
          if (hoveredTile === undefined || !areCoordsEqual(hoveredTile, tileCoords)) {
            setHoveredTile(tileCoords);
          }
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
          <MapComponent
            hoveredTile={hoveredTile}
            networkLayer={networkLayer}
          />
        </Container>
        <Leaderboard
          networkLayer={networkLayer}
          localPlayer={localPlayer}
        />
      </Stage>
    </div>
  );
};

export default Canvas;
