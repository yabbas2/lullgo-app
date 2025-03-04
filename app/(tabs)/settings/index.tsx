import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TableView, NavigationRow } from 'react-native-ios-kit';
import { useStore } from '@/stores/DeviceStore'
import { router } from 'expo-router';

export default function Settings() {
    const { deviceBleId, deviceHostname } = useStore();

    return (
        <SafeAreaView className='flex-1 gap-2'>
            <ScrollView>
                <View className='grid grid-cols-1 gap-10'>
                    <TableView withoutHeader={true} withoutFooter={true}>
                        {/* TODO: handle multiple devices */}
                        <NavigationRow title="Devices" info={deviceBleId || deviceHostname ? "1" : "0"} onPress={() => { router.push('/(tabs)/settings/device') }} />
                    </TableView>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
