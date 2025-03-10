import { RTCView, RTCPeerConnection  } from 'react-native-webrtc';
import { useEffect, useState, useRef } from 'react';
import RNFetchBlob from 'rn-fetch-blob';
import { TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, Easing, } from 'react-native-reanimated'

export default function WebRTCStream() {
    const [stream, setStream] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [pc, setPc] = useState<RTCPeerConnection | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(false);
    const opacity = useSharedValue(0);
    const timeoutRef = useRef(null);

    // Reanimated style for controls
    const controlsStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: withTiming(opacity.value * 0, { duration: 300 }) }],
    }));

    // Handle controls visibility with animation
    const toggleControls = (visible: boolean, immediate = false) => {
        if (visible) {
            setControlsVisible(true);
            opacity.value = withTiming(1, {
                duration: immediate ? 0 : 300,
                easing: Easing.out(Easing.quad),
            });
        } else {
            opacity.value = withTiming(0, {
                duration: 300,
                easing: Easing.in(Easing.quad),
            }, (finished) => {
                    if (finished) runOnJS(setControlsVisible)(false);
                });
        }
    };

    // Handle video tap
    const handleVideoTap = () => {
        if (!controlsVisible) {
            toggleControls(true);
        }
        resetAutoHideTimer();
    };

    // Auto-hide controls after 5 seconds
    const resetAutoHideTimer = () => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            toggleControls(false);
        }, 5000);
    };

    const startStream = async () => {
        const { config } = RNFetchBlob;
        let options = {
            trusty: true,  // for self-signed certificates
            ciphers: ['ECDHE-RSA-AES128-GCM-SHA256'],  // accepted cipher list
            timeout: 5000,
            sslPinning: {
                certs: ["client"]
            },
        };
        try {
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' }
                ]
            });

            // Receive stream from server
            pc.addEventListener("track", (event) => {
                console.debug('ontrack', event);
                setStream(event.streams[0]);
                setIsConnected(true);
            });

            // create OFFER to server (mediaMTX)
            const offer = await pc.createOffer({
                offerToReceiveVideo: true,
            });
            await pc.setLocalDescription(offer);

            const response = await config(options).fetch('POST', 'https://rpi.local:8889/cam/whep', {'content-type': 'application/sdp'}, offer.sdp);
            const answer = await response.text();
            await pc.setRemoteDescription({
                type: 'answer',
                sdp: answer
            });

            setPc(pc);
            handleVideoTap();
        } catch (error) {
            console.debug('Error:', error);
        }
    };

    const togglePauseStream = () => {
        if (stream) {
            stream.getTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsPaused(!isPaused);
        }
    };

    const recordStream = () => {
        console.debug('recordStream');
    };

    const stopStream = () => {
        pc?.close();
        setPc(null);
        setStream(null);
        setIsConnected(false);
        setIsPaused(false);
    };

    useEffect(() => {
        return () => {
            pc?.close();
            clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <TouchableWithoutFeedback onPress={handleVideoTap}>
            <View className='flex-1'>
                {stream ? (
                    <View className='h-full bg-black' >
                        <RTCView
                            streamURL={stream.toURL()}
                            style={{ flex: 1 }}
                            objectFit="cover"
                        />
                    </View>
                ) : (
                        <View className='flex flex-col justify-center items-center h-full bg-black' />
                    )}
                {!isConnected && (
                    <View className='absolute inset-x-0 bottom-5 p-4 h-24 bg-transparent flex flex-row gap-10 justify-center items-center'>
                        <TouchableOpacity onPress={startStream}>
                            <Ionicons name='play' size={50} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
                {(isConnected && controlsVisible) && (
                    <Animated.View style={controlsStyle} className='absolute inset-x-0 bottom-5 p-4 h-24 bg-transparent flex flex-row gap-10 justify-center items-center'>
                        <TouchableOpacity onPress={recordStream} onPressIn={resetAutoHideTimer}>
                            <Ionicons name='recording' size={35} color="red" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={togglePauseStream} onPressIn={resetAutoHideTimer}>
                            <Ionicons name={isPaused ? 'play' : 'pause'} size={50} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={stopStream} onPressIn={resetAutoHideTimer}>
                            <Ionicons name='stop' size={35} color="white" />
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
}
