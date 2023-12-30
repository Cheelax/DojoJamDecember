import { AnimatedSprite, Text, useTick } from '@pixi/react';
import { Assets, Texture } from 'pixi.js';
import { useEffect, useState } from 'react';
import { Coordinate } from '../type/GridElement';
import { to_center, to_grid_coordinate, to_screen_coordinate } from '../utils/grid';
import { Direction, getFramesFromType, Animation } from '../utils/animation';

export type MobType = 'doctor1';

interface MobProps {
  type: MobType;
  lifeStatus: any;
  orientation: number;
  targetPosition: Coordinate;
  nbInfectionStacks: number;
  username: string;
  isLocalPlayer: boolean;
}

function lerp(start: number, end: number, t: number) {
  return start * (1 - t) + end * t;
}

const Mob: React.FC<MobProps> = ({
  type,
  lifeStatus,
  orientation,
  targetPosition,
  nbInfectionStacks,
  username,
  isLocalPlayer,
}) => {
  const [animation, setAnimation] = useState<Animation>(Animation.Idle);
  const [frames, setFrames] = useState<Texture[]>([]);
  const [resource, setResource] = useState<any>(undefined);

  const [currentFrame, setCurrentFrame] = useState(0);
  const [counterAnim, setCounterAnim] = useState<number>(0);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  // Allow animation (set target, then tick lerp to set position)
  const [absoluteTargetPosition, setAbsoluteTargetPosition] = useState<Coordinate>({ x: 0, y: 0 });
  const [absolutePosition, setAbsolutePosition] = useState<Coordinate>({ x: 0, y: 0 });

  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (!shouldAnimate) return;
    if (resource === undefined || orientation === undefined) return;
    if (lifeStatus.isDead) {
      setFrames(getFramesFromType('doctorinfected', Animation.Death, orientation, resource));
      setAnimation(Animation.Death);
    } else if (lifeStatus.isInfected) {
      if (animation === Animation.Walk) {
        setFrames(getFramesFromType('doctorinfected', Animation.Walk, orientation, resource));
      } else {
        setFrames(getFramesFromType('doctorinfected', Animation.Idle, orientation, resource));
      }
    } else if (animation === Animation.Walk) {
      setFrames(getFramesFromType(type, Animation.Walk, orientation, resource));
    } else {
      setFrames(getFramesFromType(type, Animation.Idle, orientation, resource));
    }
    setCurrentFrame(0);
    setCounterAnim(0);
  }, [animation, resource, orientation, lifeStatus]);

  useEffect(() => {
    if (targetPosition === undefined) return;

    setAbsoluteTargetPosition(to_center(to_screen_coordinate(targetPosition.x, targetPosition.y)));
  }, [targetPosition]);

  useTick(() => {
    const currentX = absolutePosition.x;
    const currentY = absolutePosition.y;
    const targetX = absoluteTargetPosition.x;
    const targetY = absoluteTargetPosition.y;
    if (Math.abs(targetX - currentX) >= 1 || Math.abs(targetY - currentY) >= 1) {
      setIsMoving(true);
      const newX = lerp(currentX, targetX, 0.05);
      const newY = lerp(currentY, targetY, 0.05);
      setAbsolutePosition({ x: newX, y: newY });
    } else {
      setIsMoving(false);
    }
  });

  useEffect(() => {
    if (isMoving) {
      setAnimation(Animation.Walk);
    } else {
      setAnimation(Animation.Idle);
    }
  }, [isMoving]);

  useEffect(() => {
    const load = async () => {
      const resource = await Assets.load([`assets/${type}/${type}.json`, `assets/doctorinfected/doctorinfected.json`]);
      setResource(resource);

      if (lifeStatus.isDead) {
        const deathFrames = getFramesFromType('doctorinfected', Animation.Death, Direction.SE, resource);
        setFrames(deathFrames);
        setShouldAnimate(false);
        setCurrentFrame(deathFrames.length - 1);
      } else {
        setFrames(getFramesFromType(type, Animation.Idle, Direction.SE, resource));
      }
    };
    load();
  }, []);

  useTick((delta) => {
    if (shouldAnimate) {
      setCounterAnim((prevCounter) => prevCounter + delta);
      if (animation === Animation.Death && currentFrame === frames.length - 1) {
        setShouldAnimate(false);
      }

      if (counterAnim > 10) {
        if (animation === Animation.Idle) {
          // if IDLE, loop through frames
          if (frames && frames.length > 0) {
            setCurrentFrame((prevFrame) => (prevFrame + 1) % frames.length); // change to the next frame and back to f0
          }
        } else {
          // otherwise we do only the frames, and then go IDLE
          if (frames && frames.length > 0 && currentFrame < frames.length - 1) {
            setCurrentFrame((prevFrame) => prevFrame + 1); // change to the next frame
          } else if (animation === Animation.Death) {
            setShouldAnimate(false);
          } else {
            // last frame of the animation
            setCurrentFrame(0);
            setAnimation(Animation.Idle);
          }
        }
        setCounterAnim(0);
      }
    }
  });
  if (resource === undefined || lifeStatus === undefined) {
    return null;
  }

  let hintText = username;
  if (isLocalPlayer) {
    hintText =
      !lifeStatus.isDead && !lifeStatus.isInfected
        ? lifeStatus.infectionStacks + '/' + Math.floor(nbInfectionStacks)
        : '';
  }

  return (
    <>
      <AnimatedSprite
        zIndex={to_grid_coordinate(absolutePosition).x + to_grid_coordinate(absolutePosition).y + 1.1}
        x={absolutePosition.x}
        y={absolutePosition.y - 48}
        anchor={0.5}
        scale={1.5}
        isPlaying={false}
        textures={frames}
        initialFrame={currentFrame}
      />
      {}
      <Text
        text={hintText}
        zIndex={to_grid_coordinate(absolutePosition).x + to_grid_coordinate(absolutePosition).y}
        scale={1}
        x={absolutePosition.x - hintText.length * 6}
        y={absolutePosition.y - 110}
      />
    </>
  );
};

export default Mob;
