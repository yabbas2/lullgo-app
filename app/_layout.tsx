import React from 'react'
import "@/global.css";
import { Stack } from 'expo-router'
import { ThemeProvider } from 'react-native-ios-kit';

export default function MainLayout() {
    return (
        <ThemeProvider>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(modals)/network" options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </ThemeProvider>
    );
}
