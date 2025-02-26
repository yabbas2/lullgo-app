import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import Intro from '@/components/ui/Intro';
import { useRouter } from 'expo-router';
import * as DeviceConfigurator from '@/modules/DeviceConfigurator';
import * as Permissions from '@/modules/Permissions';


export default function index() {
    //return <Redirect href="/home" />

    const [bleClientState, setBleClientState] = useState<string>("idle");
    const router = useRouter();

    const cbkBlConnectionState = async (state: DeviceConfigurator.blConnectionStateType) => {
        if (state === "connected") {
            setBleClientState("configure")
            await DeviceConfigurator.configureDevice(cbkWifiConnectionState);
        } else {
            setBleClientState("fail")
        }
    }

    const cbkWifiConnectionState = async (state: DeviceConfigurator.wifiConnectionStateType, data?: any) => {
        if (state === "selectNetwork") {
            router.push({ pathname: '/(modals)/network', params: { networks: JSON.stringify(data as Array<string>) } });
        } else if (state === "connected") {
            console.debug('[cbkWifiConnectionState] wifi connected');
        } else {
            console.debug('[cbkWifiConnectionState] unexpected state', state);
        }
    }

    const setBtnPressed = async (value: boolean) => {
        if (value) {
            setBleClientState("search")
            const granted: boolean = await Permissions.requestPermissions();
            if (!granted) {
                setBleClientState("fail");
                return;
            }
            await DeviceConfigurator.scanForDevice(cbkBlConnectionState);
        }
        //setBleClientState("idle")
    }

    useEffect(() => {
    }, [bleClientState]);

    return (
        <Intro mainBtnState={bleClientState} setMainBtnPressed={setBtnPressed} />
    );
};
