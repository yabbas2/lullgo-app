import React from 'react'
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Stack } from 'expo-router'

export default function MainLayout() {
    return (
        <GluestackUIProvider mode="light">
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(modals)/network" options={{ presentation: 'modal', headerShown:false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </GluestackUIProvider>
    );
}
