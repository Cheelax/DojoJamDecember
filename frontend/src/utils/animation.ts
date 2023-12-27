import { SCALE_MODES, Texture } from 'pixi.js';

export enum Direction {
  S,
  SE,
  E,
  NE,
  N,
  NW,
  W,
  SW,
}

export enum Animation {
  Idle,
  Walk,
  Carry,
  Jump,
  Throw,
  Hurt,
  Death,
}

export const getFramesFromType = (
  mob_name: string,
  type: Animation,
  direction: Direction,
  resource: any
): Texture[] => {
  let frames = [];
  const firstResourceKey = Object.keys(resource)[0];

  const secondResourceKey = Object.keys(resource)[1];

  if (mob_name === 'doctorinfected') {
    frames = Object.keys(resource[secondResourceKey].data.frames);
  } else {
    frames = Object.keys(resource[firstResourceKey].data.frames);
  }

  let filtered = [];
  filtered = frames.filter((e) => e.includes(mob_name));

  if (type === Animation.Idle) {
    // console.log('[', mob_name, ']', 'Idle Frame');
    filtered = frames.filter((e) => e.includes('idle'));
  } else if (type === Animation.Walk) {
    // console.log('[', mob_name, ']', 'Walk Frame');
    filtered = frames.filter((e) => e.includes('walk'));
  } else if (type === Animation.Death) {
    frames = Object.keys(resource[secondResourceKey].data.frames);
    // console.log('[', mob_name, ']', 'Death Frame');
    filtered = frames.filter((e) => e.includes('death'));
  } else {
    throw new Error('Invalid AnimationType');
  }
  // console.log('FILTERED', filtered);
  if (direction === Direction.SE) {
    filtered = filtered.filter((e) => /-SE-/.test(e));
  } else if (direction === Direction.SW) {
    filtered = filtered.filter((e) => /-SW-/.test(e));
  } else if (direction === Direction.NW) {
    filtered = filtered.filter((e) => /-NW-/.test(e));
  } else if (direction === Direction.NE) {
    filtered = filtered.filter((e) => /-NE-/.test(e));
  }

  return filtered.map((frame: any) => {
    const texture = Texture.from(frame);
    // console.log(texture);
    texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
    return texture;
  }) as Texture[];
};
