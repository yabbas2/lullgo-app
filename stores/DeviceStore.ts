import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

const zustandStorage = {
    setItem: (key: string, value: string) => storage.set(key, value),
    getItem: (key: string) => storage.getString(key) || null,
    removeItem: (key: string) => storage.delete(key),
};

interface DeviceState {
    deviceExist: boolean;
    deviceBleId: string | null;
    deviceHostname: string | null;
    setDeviceBleId: (id: string | null) => void;
    setDeviceHostname: (name: string | null) => void;
    clearDevice: () => void;
}

export const useStore = create<DeviceState>()(
    persist(
        (set, get) => ({
            deviceExist: false,
            deviceBleId: null,
            deviceHostname: '',
            setDeviceBleId: (id) => {
                set({ deviceBleId: id });
                set({ deviceExist: true });
            },
            setDeviceHostname: (name) => {
                set({ deviceHostname: name });
                set({ deviceExist: true });
            },
            clearDevice: () => {
                set({ deviceBleId: null });
                set({ deviceHostname: null });
                set({ deviceExist: false });
            },
        }),
        {
            name: 'ble-storage',
            storage: createJSONStorage(() => zustandStorage),
        }
    )
);
