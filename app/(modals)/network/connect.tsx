import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import * as DeviceConfigurator from '@/modules/DeviceConfigurator';
import { Button, TextField, Spinner, Switch } from 'react-native-ios-kit'
import { useDeviceStore } from '@/stores/DeviceStore';
import { useNetConnectStore } from '@/stores/netConnectStore'


export default function connect() {
    const params = useLocalSearchParams();
    const { connect, setConnect } = useNetConnectStore();
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const { deviceBleId } = useDeviceStore();

    const ssid = params.ssid ? params.ssid as string : "";

    const handleConnect = async () => {
        console.debug('Connecting to', ssid, password);
        setConnect(true);
        await DeviceConfigurator.connectDeviceToNet(deviceBleId!, ssid, password);
        setTimeout(() => {
            router.dismissTo('/(tabs)/settings/device');
        }, 500);
    }

    return (
        <View className='flex flex-col justify-center p-4'>
            <View>
                <View className='p-5'>
                    <Text className='text-gray-900 text-lg'>Enter the password for "{ssid}":</Text>
                </View>
                <View className='gap-4 px-5'>
                    <TextField
                        placeholder="Password"
                        value={password}
                        onValueChange={(p: string) => setPassword(p)}
                        secureTextEntry={!showPassword}
                        clearButton={false}
                    />
                    <View className='flex flex-row justify-between items-center'>
                        <View className='flex flex-row justify-start items-center gap-2'>
                            <Switch
                                value={showPassword}
                                onValueChange={(v: boolean) => setShowPassword(v)}
                                className='justify-self-start'
                            />
                            <Text className='text-gray-900 text-md'>Show password</Text>
                        </View>
                        <Button
                            rounded
                            inverted
                            onPress={() => { handleConnect() }}
                            style={{ width: '30%', height: 40 }}
                            disabledStyle={{ width: '30%', height: 40 }}
                            disabled={connect || password.length < 8}
                            className='justify-self-end'
                        >
                            {connect ?
                                <Spinner theme={{ primaryColor: "white" }} />
                                :
                                <View className='flex flex-row justify-center items-center gap-2'>
                                    <Text className='text-white text-md'>Connect</Text>
                                    <Ionicons name='chevron-forward' size={18} color='white' />
                                </View>
                            }
                        </Button>
                    </View>
                </View>
            </View>
        </View>
    )
};
