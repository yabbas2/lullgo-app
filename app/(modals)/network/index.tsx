import { View, Text, FlatList, TouchableHighlight } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'

type Network = {
    id: string;
    ssid: string;
};

export default function network() {
    const params = useLocalSearchParams();
    const networks: Network[] = params.networks ? JSON.parse(params.networks as string) : [ {ssid: "hamada", id: "0"}, {ssid: "yl3ab", id: "1"}, {ssid: "yksab", id: "2"}, {ssid: "yenot", id: "3"}, {ssid: "yo2a3", id: "4"} ]

    const handleCardPress = async (ssid: string) => {
        router.push({ pathname: '/(modals)/network/connect', params: { ssid: ssid } });
    }

    const NetworkPressable = ({title}: {title: string}) => {
        return (
            <TouchableHighlight
                onPress={() => { handleCardPress(title) }}
                underlayColor="#ddd"
                className='my-1 mx-4 py-5 rounded-lg border border-gray-500'
            >
                <View className='flex flex-row justify-between items-center px-5'>
                    <Text className='text-gray-900 font-bold text-xl'>{title}</Text>
                    <Ionicons
                        name='wifi-sharp'
                        size={20}
                        color="#6b7280"
                    />
                </View>
            </TouchableHighlight>
        );
    }

    return (
        <View className='flex justify-center p-4'>
            <View>
                <View className='p-5'>
                    <Text className='text-gray-900 text-xl'>Available WiFi networks:</Text>
                </View>
                <FlatList
                    data={networks}
                    renderItem={({item}) => <NetworkPressable title={item.ssid} />}
                    keyExtractor={item => item.id}
                />
            </View>
        </View>
    )
}
