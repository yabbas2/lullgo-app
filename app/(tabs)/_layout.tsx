import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Ionicons size={28} name="home-sharp" color={color} />,
                }}
            />
            <Tabs.Screen
                name="video"
                options={{
                    title: 'Video',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="video-camera" color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Ionicons size={28} name="settings" color={color} />,
                }}
            />
        </Tabs>
    );
}

