import React, { useEffect } from 'react'
import { Text, StyleSheet, ImageBackground } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { VStack } from '@/components/ui/vstack'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import Ionicons from '@expo/vector-icons/Ionicons'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withRepeat } from 'react-native-reanimated'

type Props = {
    mainBtnState: string,
    setMainBtnPressed: (value: boolean) => void,
}

export default function Intro({ mainBtnState, setMainBtnPressed }: Props) {
    const scale = useSharedValue(1);
    const scaleAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });
    const rotation = useSharedValue(0);
    const rotateAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }],
        };
    });

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (mainBtnState === "search") {
            const zoomIn = () => {
                scale.value = withTiming(1.5, { // 1.5 scale in 1 second
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                });
            };
            const zoomOut = () => {
                scale.value = withTiming(1, { // 1 scale in 1 second
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                });
            };
            // loop the scale animation
            interval = setInterval(() => {
                zoomIn();
                setTimeout(zoomOut, 1000);
            }, 2000); // total duration of one cycle: 2000ms (1000ms zoom in + 1000ms zoom out)
        } else if (mainBtnState === "configure") {
            // rotation animation
            rotation.value = withRepeat(
                withTiming(360, {
                    duration: 2000, // rotate 360 degrees in 2 seconds
                    easing: Easing.linear, // linear easing for smooth rotation
                }),
                -1, // infinite loop
                false // do not reverse the animation
            );
        }

        // cleanup on unmount
        return () => clearInterval(interval);
    }, [mainBtnState]);

    return (
        <ImageBackground source={require('@/assets/images/intro.jpeg')} resizeMode='cover' style={styles.image} blurRadius={5}>
            <SafeAreaView>
                <VStack space='4xl' reversed={false} className='items-stretch'>
                    <Box className='self-center'>
                        <Text className='text-center text-8xl text-sky-100 shadow-sm' style={styles.mainFont}>Lullgo</Text>
                    </Box>
                    <Box className='self-center'>
                        <VStack space='sm' reversed={false} className='items-stretch'>
                            <Button
                                onPress={() => setMainBtnPressed(true)}
                                className='
                                    self-center
                                    bg-sky-400
                                    h-24 w-24
                                    rounded-full
                                    shadow-lg
                                    data-[disabled=true]:bg-sky-800
                                    data-[disabled=true]:opacity-50
                                    data-[active=true]:bg-sky-500'
                                action='secondary'
                                isDisabled={["search", "configure"].includes(mainBtnState)}
                            >
                                {mainBtnState === "search" &&
                                    (
                                        <Animated.View style={scaleAnimatedStyle}>
                                            <Ionicons name="search" size={26} color="white" />
                                        </Animated.View>
                                    )
                                }
                                {mainBtnState === "configure" &&
                                    (
                                        <Animated.View style={rotateAnimatedStyle}>
                                            <Ionicons name="settings-outline" size={26} color="white" />
                                        </Animated.View>
                                    )
                                }
                                {mainBtnState === "idle" && <Ionicons name="power" size={26} color="white" />}
                            </Button>
                            { mainBtnState === "idle" && <Text className='text-sky-100 text-lg text-center' style={styles.mainFont}>Connect a Lullgo device</Text> }
                            { mainBtnState === "search" && <Text className='text-sky-100 text-lg text-center' style={styles.mainFont}>Scanning via Bluetooth...</Text> }
                            { mainBtnState === "configure" && <Text className='text-sky-100 text-lg text-center' style={styles.mainFont} >Configuring Lullgo device...</Text> }
                        </VStack>
                    </Box>
                </VStack>
            </SafeAreaView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    mainFont: {
        fontFamily: 'SUSE-SemiBold',
    },
    image: {
        flex: 1,
        justifyContent: 'center',
        alignSelf: 'center',
        height: '100%',
        width: '100%',
    },
})
