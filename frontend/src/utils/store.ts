import { create } from 'zustand';
import { TileType } from '../hooks/useComponentStates';
import { Coordinate } from '../type/GridElement';

export interface Map {
  size: number;
  holes: Coordinate[];
}

export interface Score {
  stage: number;
  score: number;
  player: string;
}

interface State {
  ip: number | undefined;
  map: Map;
  set_ip: (ip: number) => void;
}

export const useElementStore = create<State>((set) => ({
  ip: undefined,
  map: { size: 0, holes: [] },
  set_ip: (ip: number) => set(() => ({ ip })),
}));
