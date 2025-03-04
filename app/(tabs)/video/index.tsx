import React, { useEffect, useState, useRef, RefObject } from 'react';
import { View, StyleSheet, Text } from 'react-native';
//import { RTCView, RTCPeerConnection, mediaDevices, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';

type WebSocketMessage = {
    type: 'answer' | 'candidate' | 'offer';
    sdp?: string;
    candidate?: RTCIceCandidate;
    path?: string;
};

export default function WebRTCStreamViewer() {
    //const [streamURL, setStreamURL] = useState<string | null>(null);
    //const pcRef: RefObject<RTCPeerConnection | null> = useRef(null);
    //const wsRef: RefObject<WebSocket | null> = useRef(null);
    //const mediaServerURL = 'ws://rpi.local:8889/ws'; // Replace with your Pi's IP
    //
    //useEffect(() => {
    //    const setupWebRTC = async () => {
    //        // 1. Create Peer Connection
    //        pcRef.current = new RTCPeerConnection({
    //            iceServers: [
    //                { urls: 'stun:stun.l.google.com:19302' },
    //            ],
    //            iceTransportPolicy: 'relay' as RTCIceTransportPolicy,
    //        });
    //
    //        // 2. Set up WebSocket connection to MediaMTX
    //        wsRef.current = new WebSocket(mediaServerURL);
    //
    //        // 3. Add transceivers
    //        pcRef.current.addTransceiver('video', { direction: 'recvonly' });
    //        pcRef.current.addTransceiver('audio', { direction: 'recvonly' });
    //
    //        // 4. Handle incoming tracks
    //        pcRef.current.ontrack = (event) => {
    //            if (event.track.kind === 'video' && event.streams.length > 0) {
    //                setStreamURL(event.streams[0].toURL());
    //            }
    //        };
    //
    //        // 5. Create and send offer
    //        const offer = await pcRef.current.createOffer();
    //        await pcRef.current.setLocalDescription(offer);
    //
    //        // 6. Send offer via WebSocket
    //        wsRef.current.onopen = () => {
    //            wsRef.current?.send(JSON.stringify({
    //                type: 'offer',
    //                sdp: pcRef.current?.localDescription?.sdp,
    //                path: '/cam',
    //            } as WebSocketMessage));
    //        };
    //
    //        // 7. Handle WebSocket messages
    //        wsRef.current.onmessage = async (event) => {
    //            const message: WebSocketMessage = JSON.parse(event.data);
    //
    //            if (message.type === 'answer' && message.sdp && pcRef.current) {
    //                await pcRef.current.setRemoteDescription(
    //                    new RTCSessionDescription({ type: 'answer', sdp: message.sdp })
    //                );
    //            } else if (message.candidate && pcRef.current) {
    //                await pcRef.current.addIceCandidate(
    //                    new RTCIceCandidate(message.candidate)
    //                );
    //            }
    //        };
    //    };
    //
    //    setupWebRTC();
    //
    //    // Cleanup
    //    return () => {
    //        pcRef.current?.close();
    //        wsRef.current?.close();
    //    };
    //}, []);

    return (
        <View style={styles.container}>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    video: {
        flex: 1,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    loadingText: {
        color: 'white',
        fontSize: 18,
    },
});
