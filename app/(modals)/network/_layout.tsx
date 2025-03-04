import React from 'react'
import "@/global.css";
import { Stack } from 'expo-router'

export default function MainLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ presentation: 'modal', title: 'Connect Lullgo device to WiFi' }} />
            <Stack.Screen name="connect" options={{ presentation: 'card', title: '' }} />
        </Stack>
    );
}
