import { Coordinate } from '../type/GridElement';

export const getNeighbors = (tile: Coordinate, grid: any, players: any): Coordinate[] => {
  const directions = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 },
  ];
  const neighbors: Coordinate[] = [];

  for (const { x: dx, y: dy } of directions) {
    const x = tile.x + dx;
    const y = tile.y + dy;

    if (
      grid[y] === undefined ||
      grid[y][x] == undefined ||
      (grid[y] && grid[y][x] && grid[y][x]._type !== 1 && grid[y][x]._type !== 2)
    ) {
      const neighbor: Coordinate = { x, y };
      let playerFound = false;

      // Iterate through players array to check if the player exists at (x, y)
      for (const player of Object.values(players)) {
        const playerparsed = player as any;
        if (playerparsed.x === x && playerparsed.y === y) {
          playerFound = true;
          break; // Exit the loop if a player is found
        }
      }

      if (!playerFound) {
        neighbors.push(neighbor);
      }
    }
  }

  return neighbors;
};
