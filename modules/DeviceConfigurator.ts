import { BleManagerDidUpdateValueForCharacteristicEvent, Peripheral } from 'react-native-ble-manager';
import { cloneDeep } from 'lodash';
import * as BleClient from '@/modules/BleClient';

export type blConnectionStateType = "connected" | "notConnected";
type cbkBlConnectionStateType = (state: blConnectionStateType) => void;

export type wifiConnectionStateType = "connected" | "selectNetwork" | "notConnected";
type cbkWifiConnectionStateType = (state: wifiConnectionStateType, data?: any) => void;

var desiredPeripheral: Peripheral | null = null;

var cbkBlConnectionStateFn: cbkBlConnectionStateType;
var cbkWifiConnectionStateFn: cbkWifiConnectionStateType;

const listenOnWifiConnectEvents = async () => {
    const result: string = await BleClient.Read(desiredPeripheral!.id, "WIFI.NETWORKS")
    if (result === "ack") {
        await BleClient.StartNotification(desiredPeripheral!.id, "WIFI.CONNECT_STATUS");
        await BleClient.StartNotification(desiredPeripheral!.id, "WIFI.NETWORKS");
    } else {
        // TODO: report error
    }
}

const cbkStopScan = async () => {
    console.debug('[cbkStopScan] scan is stopped.');
    const p = BleClient.GetDesiredPeripheral();
    if (!p) {
        cbkBlConnectionStateFn("notConnected")
        console.debug('[cbkStopScan] no peripheral found.');
        return;
    }
    desiredPeripheral = cloneDeep(p);
    console.debug('[cbkStopScan] callback....', p, desiredPeripheral);
    await BleClient.Connect(p.id);
}

const cbkConnectPeripheral = async (event: any) => {
    if (!event) return;
    if (event.peripheral !== desiredPeripheral!.id) return;

    const result = await BleClient.CheckPeripheral(desiredPeripheral!.id);
    if (!result) {
    cbkBlConnectionStateFn("notConnected")
        console.debug('[cbkConnectPeripheral] connection to peripheral failed.');
        return;
    }
    console.debug('[cbkConnectPeripheral] connected to desired peripheral.');
    cbkBlConnectionStateFn("connected")
}

const cbkUpdateValueForCharacteristic = (data: BleManagerDidUpdateValueForCharacteristicEvent) => {
    if (!data) return;

    if (data.characteristic === BleClient.GetCharacteristicUuid("WIFI.NETWORKS")) {
        let utf8Decode = new TextDecoder('utf-8')
        let str = utf8Decode.decode(new Uint8Array(data.value));
        console.debug('[cbkUpdateValueForCharacteristic] expected data received');
        console.debug('[cbkUpdateValueForCharacteristic]', data.peripheral, data.characteristic, str);
        cbkWifiConnectionStateFn("selectNetwork", str.split('\n'))
    } else if (data.characteristic === BleClient.GetCharacteristicUuid("WIFI.CONNECT_STATUS")) {
        let utf8Decode = new TextDecoder('utf-8')
        let str = utf8Decode.decode(new Uint8Array(data.value));
        console.debug('[cbkUpdateValueForCharacteristic] expected data received');
        console.debug('[cbkUpdateValueForCharacteristic]', data.peripheral, data.characteristic, str);
        cbkWifiConnectionStateFn((str === 'ok') ? "connected" : "notConnected")
    } else {
        console.debug('[cbkUpdateValueForCharacteristic] unexpected data received');
    }
}

export const scanForDevice = async (cbkBlConnectionState: cbkBlConnectionStateType) => {
    cbkBlConnectionStateFn = cbkBlConnectionState;
    await BleClient.Init(cbkStopScan, cbkConnectPeripheral, cbkUpdateValueForCharacteristic);
    await BleClient.StartScan();
}

export const configureDevice = async (cbkWifiConnectionState: cbkWifiConnectionStateType) => {
    cbkWifiConnectionStateFn = cbkWifiConnectionState;
    await listenOnWifiConnectEvents();
}

export const connectDeviceToWifi = async (network: string, password: string) => {
    await BleClient.WriteWithoutResponse(desiredPeripheral!.id, "WIFI.SSID", network)
    await BleClient.WriteWithoutResponse(desiredPeripheral!.id, "WIFI.PASSWORD", password)
}
