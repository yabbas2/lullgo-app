import { create } from 'zustand';

interface netConnectState {
    connect: boolean;
    setConnect: (val: boolean) => void;
}

export const useNetConnectStore = create<netConnectState>((set) => ({
    connect: false,
    setConnect: (val: boolean) => set({ connect: val }),
}));
