import { AnimatedSprite, useTick } from '@pixi/react';
import { Assets, Texture } from 'pixi.js';
import { useEffect, useState } from 'react';
import { Coordinate } from '../type/GridElement';
import { to_center, to_grid_coordinate, to_screen_coordinate } from '../utils/grid';
import { Direction, getFramesFromType, Animation } from '../utils/animation';

export type MobType = 'knight';

interface MobProps {
  type: MobType;
  position: Coordinate;
}

function lerp(start: number, end: number, t: number) {
  return start * (1 - t) + end * t;
}

const getDirection = (start: Coordinate, end: Coordinate, orientation: Direction): Direction => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  // Conversion de coordonnées cartésiennes à coordonnées isométriques
  const iso_dx = dx - dy;
  const iso_dy = (dx + dy) / 2;

  if (iso_dx > 0 && iso_dy >= 0) return Direction.SE;
  if (iso_dx <= 0 && iso_dy > 0) return Direction.SW;
  if (iso_dx < 0 && iso_dy <= 0) return Direction.NW;
  if (iso_dx >= 0 && iso_dy < 0) return Direction.NE;

  return orientation; // Retourner NONE si aucune direction n'est trouvée
};

const getStartOrientation = (mob_coord: Coordinate, knight_position?: Coordinate) => {
  return getDirection(mob_coord, knight_position ? knight_position : mob_coord, Direction.S);
};

const Mob: React.FC<MobProps> = ({ type, position }) => {
  const [animation, setAnimation] = useState<Animation>(Animation.Idle);

  // const [orientation, setOrientation] = useState<Direction>(getStartOrientation(targetPosition, knightPosition));
  const [frames, setFrames] = useState<Texture[]>([]);
  const [resource, setResource] = useState<any>(undefined);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [counterAnim, setCounterAnim] = useState(0);

  const [isMoving, setIsMoving] = useState(false);

  // useEffect(() => {
  //   if (resource) {
  //     if (animation === Animation.Walk) {
  //       // const or = getDirection(
  //       //   to_grid_coordinate(absolutePosition),
  //       //   to_grid_coordinate(absoluteTargetPosition),
  //       //   orientation
  //       // );
  //       // setOrientation(or);
  //       setFrames(getFramesFromType(type, Animation.Walk, or, resource));
  //     } else if (animation === Animation.Hurt) {
  //       setFrames(getFramesFromType(type, Animation.Hurt, orientation, resource));
  //     } else if (animation === Animation.Death) {
  //       setFrames(getFramesFromType(type, Animation.Death, orientation, resource));
  //     } else {
  //       setFrames(getFramesFromType(type, Animation.Idle, orientation, resource));
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [animation, resource]);

  useEffect(() => {
    if (isMoving) {
      setAnimation(Animation.Walk);
    }
  }, [isMoving]);

  // current position absolute during movement
  // will be changing during the movement, towards the absoluteTargetPosition
  const [absolutePosition, setAbsolutePosition] = useState<Coordinate>(to_center(to_screen_coordinate(position)));
  // const [absoluteTargetPosition, setAbsoluteTargetPosition] = useState<Coordinate>(
  //   to_center(to_screen_coordinate(targetPosition))
  // );

  // Only at init
  useEffect(() => {
    const load = async () => {
      const resource = await Assets.load(`assets/${type}/${type}.json`);
      setResource(resource);
      setFrames(getFramesFromType(type, Animation.Idle, Direction.SE, resource));
    };
    load();
    // init position
    // setAbsolutePosition(to_center(to_screen_coordinate(targetPosition)));
    setAbsolutePosition(to_center(to_screen_coordinate(position)));
  }, []);

  // If we receive a new targetPosition from props, we transform it into absolute pixel pos and work on it for the move
  useEffect(() => {
    setAbsolutePosition(to_center(to_screen_coordinate(position)));
  }, [position]);

  const [isDead, setIsDead] = useState(false);

  if (frames.length === 0) {
    return null;
  }

  return (
    <>
      <AnimatedSprite
        zIndex={to_grid_coordinate(absolutePosition).x + to_grid_coordinate(absolutePosition).y}
        x={isDead ? -100 /*lol*/ : absolutePosition.x}
        y={isDead ? -100 /*lol*/ : absolutePosition.y - 36}
        anchor={0.5}
        scale={2}
        isPlaying={true}
        textures={frames}
        initialFrame={currentFrame}
        animationSpeed={0.05}
      />
    </>
  );
};

export default Mob;
