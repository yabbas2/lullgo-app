import { BleManagerDidUpdateValueForCharacteristicEvent } from 'react-native-ble-manager';
import * as BleClient from '@/modules/BleClient';
import RNFetchBlob from 'rn-fetch-blob';


type cbkBlScanResultType = (deviceId: string | null) => void;
type cbkNetScanResultType = (deviceMac: string | null) => void;

export type netConnectStateType = "connected" | "selectNetwork" | "notConnected";
type cbkNetConnectStateType = (state: netConnectStateType, data?: any) => void;

var cbkBlScanResultFn: cbkBlScanResultType;
var cbkNetConnectStateFn: cbkNetConnectStateType;
var deviceBleId: string;

const listenOnNetConnectEvents = async () => {
    const result: string = await BleClient.Read(deviceBleId, "WIFI.NETWORKS")
    if (result === "ack") {
        await BleClient.StartNotification(deviceBleId, "WIFI.CONNECT_STATUS");
        await BleClient.StartNotification(deviceBleId, "WIFI.NETWORKS");
    } else {
        // TODO: report error
    }
}

const cbkStopScan = async () => {
    console.debug('[cbkStopScan] scan is stopped.');
    const p = BleClient.GetDesiredPeripheral();
    if (p) {
        cbkBlScanResultFn(p.id);
    } else {
        cbkBlScanResultFn(null)
        console.debug('[cbkStopScan] no peripheral found.');
    }
}

const cbkConnectDevice = async (event: any) => {
    if (!event) return;
    if (event.peripheral !== deviceBleId) return;

    const result = await BleClient.CheckPeripheral(deviceBleId);
    if (!result) {
        console.debug('[cbkConnectDevice] connection to peripheral failed.');
        return;
    }
    console.debug('[cbkConnectDevice] connected to desired peripheral.');
    await listenOnNetConnectEvents();
}

const cbkUpdateValueForCharacteristic = (data: BleManagerDidUpdateValueForCharacteristicEvent) => {
    if (!data) return;

    if (data.characteristic === BleClient.GetCharacteristicUuid("WIFI.NETWORKS")) {
        let utf8Decode = new TextDecoder('utf-8')
        let str = utf8Decode.decode(new Uint8Array(data.value));
        console.debug('[cbkUpdateValueForCharacteristic] expected data received');
        console.debug('[cbkUpdateValueForCharacteristic]', data.peripheral, data.characteristic, str);
        cbkNetConnectStateFn("selectNetwork", str.split('\n'))
    } else if (data.characteristic === BleClient.GetCharacteristicUuid("WIFI.CONNECT_STATUS")) {
        let utf8Decode = new TextDecoder('utf-8')
        let str = utf8Decode.decode(new Uint8Array(data.value));
        console.debug('[cbkUpdateValueForCharacteristic] expected data received');
        console.debug('[cbkUpdateValueForCharacteristic]', data.peripheral, data.characteristic, str);
        cbkNetConnectStateFn((str === 'ok') ? "connected" : "notConnected");
    } else {
        console.debug('[cbkUpdateValueForCharacteristic] unexpected data received');
    }
}

export const scanForDeviceOnBle = async (cbkBlScanResult: cbkBlScanResultType) => {
    cbkBlScanResultFn = cbkBlScanResult;
    await BleClient.Init(cbkStopScan, cbkConnectDevice, cbkUpdateValueForCharacteristic);
    await BleClient.StartScan();
}

export const connectDevice = async (deviceId: string, cbkNetConnectState: cbkNetConnectStateType) => {
    cbkNetConnectStateFn = cbkNetConnectState;
    deviceBleId = deviceId;
    await BleClient.Connect(deviceId);
}

export const connectDeviceToNet = async (deviceId: string, network: string, password: string) => {
    await BleClient.WriteWithoutResponse(deviceId, "WIFI.SSID", network);
    await BleClient.WriteWithoutResponse(deviceId, "WIFI.PASSWORD", password);
}

export const scanForDeviceOnNet = async (cbkNetScanResult: cbkNetScanResultType) => {
    // TODO: find DNS first
    const { config } = RNFetchBlob;
    let scanOptions = {
        url: 'https://rpi.local:8081',
        trusty: true,  // for self-signed certificates
        ciphers: ['ECDHE-RSA-AES128-GCM-SHA256'],  // accepted cipher list
        timeout: 5000,
        sslPinning: {
            certs: ["client"]
        },
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };
    try {
        const response = await config(scanOptions).fetch('GET', 'https://rpi.local:8081');
        console.debug('Response:', await response.json());
        cbkNetScanResult('rpi.local');
    } catch (error) {
        console.debug('Error:', error);
        cbkNetScanResult(null);
    }
}
