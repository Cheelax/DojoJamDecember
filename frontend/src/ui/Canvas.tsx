import { Container, Sprite, Stage, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { useEffect, useState } from 'react';
import heart from '../assets/heart1.png';
import skull from '../assets/skull.png';
import { useComponentStates } from '../hooks/useComponentStates';
import useIP from '../hooks/useIP';
import { Coordinate } from '../type/GridElement';
import { HEIGHT, H_OFFSET, WIDTH, areCoordsEqual, to_grid_coordinate } from '../utils/grid';
import { useElementStore } from '../utils/store';
import MapComponent from './Map';
import Mob, { MobType } from './Mob';

interface CanvasProps {
  spawn: any;
  move: any;
  Player: any;
  account: any;
}

const Canvas: React.FC<CanvasProps> = ({
  spawn,
  move,
  Player,
  account,
}) => {
  const contractState = useComponentStates(Player);
  const { player } = contractState;

  const [hoveredTile, setHoveredTile] = useState<Coordinate | undefined>(undefined);

  const { map, set_ip } =
  useElementStore((state) => state);

  const { ip, loading, error } = useIP();
  useEffect(() => {
    if (!loading && ip) {
      set_ip(ip);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ip, loading]);

  const generateNewGame = async () => {
    // const pseudoFelt = shortString.encodeShortString("guest#" + Math.floor(Math.random() * 10000));
    // create(account, ip, 1000, pseudoFelt);
    console.log(account, ip)
    spawn("spawn", account, ip);
    setTimeout(function() {
      console.log("move", account, ip, 2, 3)
      move(account, ip, 2, 3);
    }, 5000)
  };
  generateNewGame()

  PIXI.Texture.from(heart).baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  PIXI.Texture.from(skull).baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

  return (
    <div style={{ position: 'relative' }}>
      <Stage
        width={WIDTH}
        height={HEIGHT}
        options={{ backgroundColor: '#242424' }}
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
        }}
      >
        <Container sortableChildren={true}>
          <MapComponent hoveredTile={hoveredTile} />

          {player.position && player.health !== undefined && (
            <Mob
              type="knight"
              targetPosition={player.position}
              health={player.health}
              knightPosition={player.position}
            />
          )}

          {map.size !== 0 &&
            Object.keys(contractState).map((m: string, j) => {
              const mtype = m as MobType;
              //console.log('mtype', mtype);
              if (m === 'game' || m === 'map' || m === 'hitter' || m === 'hitPosition') return null;
              const health = contractState[mtype].health;

              return (
                <>
                  {health !== undefined && health > 0 ? (
                    Array.from({ length: health as number }).map((_, i) => {
                      return (
                        <Sprite
                          key={`heart-${i}`}
                          image={heart}
                          anchor={0.5}
                          scale={1.5}
                          x={950 - i * 30}
                          y={59 + (j - 2) * 40}
                        />
                      );
                    })
                  ) : (
                    <Sprite key={`skull`} image={skull} anchor={0.5} scale={0.5} x={950} y={59 + (j - 2) * 40} />
                  )}

                  <Text
                    text={m.charAt(0).toUpperCase() + m.slice(1)}
                    x={980}
                    y={48 + (j - 2) * 40}
                    style={
                      new PIXI.TextStyle({
                        align: 'center',
                        fontFamily: '"Press Start 2P", Helvetica, sans-serif',
                        fontSize: 20,
                        fontWeight: '400',
                        fill: health && health > 0 ? '#ffffff' : '#808080',
                      })
                    }
                  />
                </>
              );
            })}
        </Container>
      </Stage>
    </div>
  );
};

export default Canvas;
