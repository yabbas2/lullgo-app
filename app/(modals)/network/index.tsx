import { View, Text, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { VStack } from '@/components/ui/vstack'
import { router } from 'expo-router'
import { Card } from '@/components/ui/card'
import { Pressable } from '@/components/ui/pressable'


export default function network() {
    const params = useLocalSearchParams();

    const networks = params.networks ? JSON.parse(params.networks as string) : ["hamada", "yl3ab", "yksab", "ywda3", "elfa2r", "khalas", "ya40fjs0-"];

    const handleCardPress = async (network: string) => {
        router.push({ pathname: '/(modals)/network/connect', params: { ssid: network } });
    }

    return (
        <View className='flex justify-center p-4'>
            <VStack space='4xl'>
                <View className='p-5'>
                    <Text className='text-gray-900 text-5xl' style={{ fontFamily: 'SUSE-SemiBold' }}>Connect </Text>
                    <Text className='text-sky-500 text-4xl' style={{ fontFamily: 'SUSE-SemiBold' }}>your Lullgo device </Text>
                    <Text className='text-gray-900 text-3xl' style={{ fontFamily: 'SUSE-SemiBold' }}>to your home WiFi network</Text>
                </View>
                <ScrollView>
                    <Text className='text-lg text-gray-900 p-5' style={{ fontFamily: 'SUSE-SemiBold' }}>Available Wifi networks:</Text>
                    {networks.map((network: string, index: number) => (
                        <Card
                            key={index}
                            variant='filled'
                            size='md'
                            className='my-1 mx-5 rounded-md border border-gray-500'
                        >
                            <Pressable onPress={() => { handleCardPress(network) }}>
                                <View className='flex-row justify-between items-center px-5'>
                                    <Text className='text-gray-900 font-bold text-xl' style={{ fontFamily: 'SUSE-SemiBold' }}>{network}</Text>
                                    <Ionicons
                                        name='wifi-sharp'
                                        size={20}
                                        color="#6b7280"
                                    />
                                </View>
                            </Pressable>
                        </Card>
                    ))}
                </ScrollView>
            </VStack>
        </View>
    )
}
