import { Coordinate } from '../type/GridElement';

const i_x = 1;
const i_y = 0.5;
const j_x = -1;
const j_y = 0.5;

const w = 48 * 2;
const h = 48 * 2;

const NUMBER_TILES = 8;

export const WIDTH = 1200;
export const HEIGHT = 600;

export const H_OFFSET = (HEIGHT - (NUMBER_TILES * h) / 2) / 2;

export function to_screen_coordinate(x: number, y: number) {
  return {
    x: x * i_x * 0.5 * w + y * j_x * 0.5 * w,
    y: x * i_y * 0.5 * h + y * j_y * 0.5 * h,
  };
}

function invert_matrix(a: number, b: number, c: number, d: number) {
  // Determinant
  const det = 1 / (a * d - b * c);

  return {
    a: det * d,
    b: det * -b,
    c: det * -c,
    d: det * a,
  };
}

export function to_grid_coordinate(screen: { x: number; y: number }) {
  const a = i_x * 0.5 * w;
  const b = j_x * 0.5 * w;
  const c = i_y * 0.5 * h;
  const d = j_y * 0.5 * h;

  const inv = invert_matrix(a, b, c, d);

  return {
    x: screen.x * inv.a + screen.y * inv.b,
    y: screen.x * inv.c + screen.y * inv.d,
  };
}

export function to_center(pos: { x: number, y: number }) {
  return { x: pos.x + WIDTH / 2, y: pos.y + H_OFFSET };
}

export const areCoordsEqual = (c1: Coordinate, c2: Coordinate) => {
  return c1.x === c2.x && c1.y === c2.y;
};
