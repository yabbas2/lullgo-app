import React, { useState, useLayoutEffect, useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as DeviceConfigurator from '@/modules/DeviceConfigurator';
import * as Permissions from '@/modules/Permissions';
import { useStore } from '@/stores/DeviceStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Button, Spinner } from 'react-native-ios-kit'
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';


export default function main() {
    const { deviceExist, deviceBleId, setDeviceBleId, deviceHostname, setDeviceHostname, clearDevice } = useStore();
    const [blScan, setBlScan] = useState<boolean>(false);
    const [netScan, setNetScan] = useState<boolean>(false);
    const [connect, setConnect] = useState<boolean>(false);
    const router = useRouter();
    const navigation = useNavigation();

    const cbkBlScanResult = async (deviceBleId: string | null) => {
        setBlScan(false);
        setDeviceBleId(deviceBleId);
    }

    const cbkNetScanResult = async (deviceHostname: string | null) => {
        setNetScan(false);
        setDeviceHostname(deviceHostname);
        startBlScan();
    }

    const cbkNetConnectState = async (state: DeviceConfigurator.netConnectStateType, data?: any) => {
        setConnect(false);
        if (state === "selectNetwork") {
            const networks = data.map((network: string, index: number) => { return { ssid: network, id: index.toString() } });
            router.push({ pathname: '/(modals)/network', params: { networks: JSON.stringify(networks) } });
        } else if (state === "connected") {
            console.debug('[cbkNetConnectState] wifi connected');
        } else { // state === "notConnected"
            console.debug('[cbkNetConnectState] wifi not connected');
            // TODO: alert
        }
    }

    const startBlScan = async () => {
        setBlScan(true);
        const granted: boolean = await Permissions.requestPermissions();
        if (!granted) {
            clearDevice();
            setBlScan(false)
            // TODO: alert
            return;
        }
        await DeviceConfigurator.scanForDeviceOnBle(cbkBlScanResult);
    }

    const startNetScan = async () => {
        setNetScan(true);
        await DeviceConfigurator.scanForDeviceOnNet(cbkNetScanResult);
    }

    const connectDevice = async () => {
        if (deviceBleId) {
            setConnect(true);
            await DeviceConfigurator.connectDevice(deviceBleId!, cbkNetConnectState);
        } else {
            // TODO: alert: move closer to device for bluetooth scanning
        }
    }

    const disconnectDevice = async () => {
        setDeviceHostname(null);
        // TODO: disconnect device from network
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Button
                    inline
                    onPress={() => startNetScan()}
                    innerStyle={{ fontSize: 18 }}
                    disabled={blScan || netScan || connect}
                >
                    Rescan
                </Button>
            )
        });
    }, [navigation, blScan, netScan, connect]);

    useEffect(() => {
        startNetScan();
    }, []);

    return (
        <SafeAreaView className='flex-1'>
            {!(blScan || netScan) ? (
                <ScrollView>
                    {deviceExist ? (
                        <View className='flex flex-col mx-4 self-stretch justify-start items-start gap-2 bg-white border border-gray-200 p-5 rounded-lg shadow-md'>
                            <View className='flex flex-row self-stretch justify-between'>
                                <View className='flex flex-row self-stretch items-center gap-2'>
                                    <Text>
                                        <Text className='text-gray-900 font-semibold text-xl text-start'>Lullgo device #1</Text>
                                        <Text className='text-gray-500 text-md text-start'> - </Text>
                                    </Text>
                                    <MaterialIcons
                                        name={deviceBleId ? 'bluetooth-connected' : 'bluetooth-disabled'}
                                        color={deviceBleId ? 'green' : 'red'}
                                        size={20}
                                    />
                                    <MaterialIcons
                                        name={deviceHostname ? 'wifi' : 'wifi-off'}
                                        color={deviceHostname ? 'green' : 'red'}
                                        size={20}
                                    />
                                </View>
                                <Button
                                    inline
                                    onPress={() => { clearDevice() }}
                                    disabled={connect}
                                >
                                    <Ionicons name='trash' size={24} color={connect ? 'gray' : 'red'} />
                                </Button>
                            </View>
                            <View className="my-2 h-0.5 self-stretch bg-gray-300" />
                            <View className='flex flex-row self-stretch'>
                                <Button
                                    rounded
                                    inverted
                                    onPress={() => { deviceHostname? disconnectDevice() : connectDevice() }}
                                    style={{ width: '100%', height: 40 }}
                                    disabledStyle={{ width: '100%', height: 40 }}
                                    disabled={connect}
                                >
                                    {connect ? <Spinner theme={{ primaryColor: "white" }} /> : ( deviceHostname? "Disconnect" : "Connect")}
                                </Button>
                            </View>
                        </View>
                    ) : (
                            <View className='flex flex-row justify-center'>
                                <Text className='text-gray-500 text-lg text-center'>No devices are found.</Text>
                            </View>
                        )}
                </ScrollView>
            ) : (
                    <View className='flex flex-col justify-center items-center h-full'>
                        <ActivityIndicator color='#6b7280' size='large' />
                    </View>
                )}
        </SafeAreaView>
    );
};
