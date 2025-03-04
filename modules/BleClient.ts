import BleManager, { BleState, Peripheral, BleDisconnectPeripheralEvent, BleManagerDidUpdateValueForCharacteristicEvent } from 'react-native-ble-manager';

type serviceNickname = string;
type serviceUUID = string;
type characteristicNickname = string;
type characteristicUUID = string;

const SECONDS_TO_SCAN = 6;
const SERVICE_UUIDS: string[] = [];
const ALLOW_DUPLICATE = false;
const serviceMap = new Map<serviceNickname, serviceUUID>([
    ["WIFI", "a97bb3e5-5f0c-495e-a87d-d642e77f1216"],
])
const characteristicMap = new Map<characteristicNickname, characteristicUUID>([
    ["SSID", "4a2d084a-7c2a-4fb5-9122-700858ed37c0"],
    ["PASSWORD", "8b107cf0-be4f-4aa9-b7ac-529779d1cc33"],
    ["CONNECT_STATUS", "6cf12fea-c7dc-47c4-a57d-79a3ba7ddfec"],
    ["NETWORKS", "a324d143-e23a-4377-ad7c-bd2b89da0e15"],
])

var isScanning = false;
var isInitialized = false;
var peripherals = new Map<Peripheral['id'], Peripheral>();
var listeners: any[] = []

const cbkDisconnectPeripheral = (event: BleDisconnectPeripheralEvent) => {
    if (!event) return;

    console.debug(`[handleDisconnectedPeripheral][${event.peripheral}] disconnected.`);
};

const cbkDiscoverPeripheral = (peripheral: Peripheral) => {
    if (!peripheral) return;

    console.debug('[handleDiscoverPeripheral] new BLE peripheral=', peripheral.id, peripheral.name, peripheral.rssi);
    if (!peripheral.name) { // filter#1: only accept peripherals with name
        return;
    }
    if (!peripheral.name.startsWith("lullgo")) { // filter#2: only accept our peripherals
        return;
    }
    peripherals.set(peripheral.id, peripheral);
};

function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export const CheckPeripheral = async (peripheralId: string): Promise<boolean> => {
    const peripheralData = await BleManager.retrieveServices(peripheralId);
    console.debug(`[connect][${peripheralId}] retrieved peripheral services`, peripheralData);

    let serviceUUIDs = peripheralData?.advertising?.serviceUUIDs;

    if (serviceUUIDs?.length !== serviceMap.size) {
        console.debug('[CheckPeripheral] invalid peripheral uuids #1');
        return false;
    }
    for (const uuid of Object.values(serviceMap)) {
        if (!(uuid in serviceUUIDs)) {
            console.debug('[CheckPeripheral] invalid peripheral uuids #2');
            return false;
        }
    }

    console.debug('[CheckPeripheral] valid peripheral info')
    return true;
}

export const Connect = async (peripheralId: string) => {
    try {
        console.debug(`[Connect][${peripheralId}] connecting...`);
        await BleManager.connect(peripheralId);
    } catch (error) {
        console.error('[Connect] error', error);
    }
};

export const StartScan = async () => {
    try {
        const blState = await BleManager.checkState();
        console.debug('blState is', blState);
        if (blState === BleState.On) {
            if (!isScanning) {
                // reset found peripherals before scan
                peripherals.clear();

                console.debug('[StartScan] starting scan...');
                await BleManager.scan(SERVICE_UUIDS, SECONDS_TO_SCAN, ALLOW_DUPLICATE);
                console.debug('[StartScan] scan is successful.');
                isScanning = true;
            }
            await sleep(SECONDS_TO_SCAN * 1000); // wait for scan to complete
        } else {
            console.debug('[StartScan] bluetooth is off.');
        }
    } catch (error) {
        console.error('[StartScan] error', error);
    }
}

export const GetDesiredPeripheral = (): Peripheral | null => {
    isScanning = false;

    if (peripherals.size === 0) return null;
    // sort peripherals such that the peripheral with lowest RSSI is first
    peripherals = new Map([...peripherals].sort((a, b) => {
        if (a[1].rssi < b[1].rssi) return 1;
        else if (a[1].rssi == b[1].rssi) return 0;
        else return -1;
    }));

    return [...peripherals][0][1];
}

export const Init = async (
    cbkStopScan: () => void,
    cbkConnectPeripheral: (event: any) => void,
    cbkUpdateValueForCharacteristic: (data: BleManagerDidUpdateValueForCharacteristicEvent) => void
) => {
    try {
        if (isInitialized) return;

        await BleManager.start({ showAlert: false });
        console.debug('BleManager started.');

        listeners.push(BleManager.onDiscoverPeripheral(cbkDiscoverPeripheral))
        listeners.push(BleManager.onStopScan(cbkStopScan))
        listeners.push(BleManager.onConnectPeripheral(cbkConnectPeripheral))
        listeners.push(BleManager.onDidUpdateValueForCharacteristic(cbkUpdateValueForCharacteristic))
        listeners.push(BleManager.onDisconnectPeripheral(cbkDisconnectPeripheral))

        await sleep(900);
        isInitialized = true;
    } catch (error) {
        console.error('[Init] error', error);
    }
}

export const Deinit = () => {
    console.debug('Removing listeners...');
    for (const listener of listeners) {
        listener.remove();
    }
    isInitialized = false;
}

export const WriteWithoutResponse = async (peripheralId: string, key: string, data: string) => {
    try {
        let utf8Encode = new TextEncoder();
        let byteArray: Array<number> = Array.from(utf8Encode.encode(data));
        let [serviceNickname, characteristicNickname] = key.split('.');
        let serviceUUID = serviceMap.get(serviceNickname);
        let characteristicUUID = characteristicMap.get(characteristicNickname);

        if (!serviceUUID || !characteristicUUID || (byteArray.length === 0)) return;
        await BleManager.writeWithoutResponse(peripheralId, serviceUUID, characteristicUUID, byteArray);
        console.debug('[WriteWithoutResponse] write is successful.', byteArray);
    } catch (error) {
        console.error('[WriteWithoutResponse] error', error);
    }
}

export const Read = async (peripheralId: string, key: string): Promise<string> => {
    try {
        let [serviceNickname, characteristicNickname] = key.split('.');
        let serviceUUID = serviceMap.get(serviceNickname);
        let characteristicUUID = characteristicMap.get(characteristicNickname);

        if (!serviceUUID || !characteristicUUID) return '';
        const data: number[] = await BleManager.read(peripheralId, serviceUUID, characteristicUUID);
        let utf8Decode = new TextDecoder('utf-8')
        let str = utf8Decode.decode(new Uint8Array(data));
        console.debug('[Read] read is successful.', str);
        return str;
    } catch (error) {
        console.error('[Read] error', error);
        return '';
    }
}

export const StartNotification = async (peripheralId: string, key: string) => {
    try {
        let [serviceNickname, characteristicNickname] = key.split('.');
        let serviceUUID = serviceMap.get(serviceNickname);
        let characteristicUUID = characteristicMap.get(characteristicNickname);

        if (!serviceUUID || !characteristicUUID) return;
        await BleManager.startNotification(peripheralId, serviceUUID, characteristicUUID);
        console.debug('[StartNotification] notification is started.', serviceUUID, characteristicUUID);
    } catch (error) {
        console.error('[ValidateConnection] error', error);
    }
}

export const GetCharacteristicUuid = (key: string): string | undefined => {
    return characteristicMap.get(key.split('.')[1])
}
