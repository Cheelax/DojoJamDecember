import { create } from 'zustand';
import { NetworkLayer } from "./dojo/createNetworkLayer";
import { AdventurerType } from "./utils/adventurerList";

export type Store = {
    networkLayer: NetworkLayer | null;
    loggedIn: boolean;
    setLoggedIn: (loggedIn: boolean) => void;
    username: string;
    setUsername: (username: string) => void;
    selectedAdventurer: AdventurerType | null;
    setSelectedAdventurer: (adventurer: AdventurerType | null) => void;
    lordsAmount: number;
    setLordsAmount: (amount: number) => void;
};

export const store = create<Store>((set) => ({
    networkLayer: null,
    loggedIn: false,
    setLoggedIn: (loggedIn: boolean) => set(() => ({ loggedIn })),
    username: "",
    setUsername: (username: string) => set(() => ({ username })),
    selectedAdventurer: null,
    setSelectedAdventurer: (adventurer: AdventurerType | null) => set(() => ({ selectedAdventurer: adventurer })),
    lordsAmount: 0,
    setLordsAmount: (amount: number) => set(() => ({ lordsAmount: amount })),
}));

