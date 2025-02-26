import React from 'react'
import "@/global.css";
import { Stack } from 'expo-router'

export default function MainLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="connect" options={{ presentation: 'modal', headerShown: false }} />
        </Stack>
    );
}
