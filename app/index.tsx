import React, { useEffect } from 'react';
import { useStore } from '@/stores/DeviceStore';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';


export default function main() {
    const { deviceBleId, deviceHostname } = useStore();
    useEffect(() => {
        setTimeout(() => {
            if (deviceBleId || deviceHostname) {
                // a device has been already registered
                router.replace('/(tabs)/home');
            } else {
                router.replace('/(tabs)/settings');
            }
        }, 300)
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" />
        </View>
    );
};
