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
    deviceBleId: string | null;
    deviceHostname: string | null;
    setDeviceBleId: (id: string | null) => void;
    setDeviceHostname: (name: string | null) => void;
    clearDevice: () => void;
}

export const useDeviceStore = create<DeviceState>()(
    persist(
        (set, get) => ({
            deviceBleId: null,
            deviceHostname: '',
            setDeviceBleId: (id) => {
                set({ deviceBleId: id });
            },
            setDeviceHostname: (name) => {
                set({ deviceHostname: name });
            },
            clearDevice: () => {
                set({ deviceBleId: null });
                set({ deviceHostname: null });
            },
        }),
        {
            name: 'ble-storage',
            storage: createJSONStorage(() => zustandStorage),
        }
    )
);
