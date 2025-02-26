import { View, Text, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { Button, ButtonSpinner } from '@/components/ui/button'
import { Input, InputField, InputSlot } from '@/components/ui/input'
import Ionicons from '@expo/vector-icons/Ionicons'
import { VStack } from '@/components/ui/vstack'
import { router } from 'expo-router'
import * as DeviceConfigurator from '@/modules/DeviceConfigurator';


export default function connect() {
    const params = useLocalSearchParams();
    const [connect, setConnect] = useState<boolean>(false);
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const ssid = params.ssid ? params.ssid as string : "";

    const handleConnect = async () => {
        console.debug('Connecting to', ssid, password);
        setConnect(true);
        await DeviceConfigurator.connectDeviceToWifi(ssid, password);
        setTimeout(() => {
            router.dismissTo('/');
            setConnect(false);
        }, 1000);
    }

    return (
        <View className='flex justify-center p-4'>
            <VStack space='4xl'>
                <View className='p-5'>
                    <Text className='text-gray-900 text-4xl' style={{ fontFamily: 'SUSE-SemiBold' }}>Enter </Text>
                    <Text className='text-gray-900 text-4xl' style={{ fontFamily: 'SUSE-SemiBold' }}>the password for </Text>
                    <Text className='text-sky-500 text-5xl mt-5 text-center' style={{ fontFamily: 'SUSE-SemiBold' }}>"{ssid}"</Text>
                </View>
                <View className='gap-4 px-5'>
                    <Input className='bg-white' size='lg'>
                        <InputField
                            onChangeText={(p) => setPassword(p)}
                            value={password}
                            type={showPassword ? 'text' : 'password'}
                            placeholder='Password'
                            className='rounded-md p-3'
                        />
                        <InputSlot
                            className='pr-3'
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color='black' />
                        </InputSlot>
                    </Input>
                    <Button className='
                        bg-sky-400
                        rounded-lg
                        data-[disabled=true]:bg-sky-800
                        data-[disabled=true]:opacity-50
                        data-[active=true]:bg-sky-500'
                        onPress={() => handleConnect()}
                        isDisabled={password === '' || connect}
                    >
                        {!connect &&
                            <>
                                <Text className='text-white font-semibold' style={{ fontFamily: 'SUSE-SemiBold' }}>Connect</Text>
                                <Ionicons
                                    name='chevron-forward-sharp'
                                    size={15}
                                    color='white'
                                />
                            </>
                        }
                        {connect &&
                            <ButtonSpinner size='small' />
                        }
                    </Button>
                </View>
            </VStack>
        </View>
    )
}
