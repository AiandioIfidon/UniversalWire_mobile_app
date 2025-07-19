import { useEffect, useState } from "react";
import { bleManager } from "../utils/bleinstance";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { ResourceSavingView } from "@react-navigation/elements";

const BleView = () => {
    const [Sent, setSent] = useState('');
    const [Recieved, setRecieved] = useState('');
    const [device, setDevice] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    const SERVICE_UUID = "853f29b2-f5ed-4b69-b4c6-9cd68a9fc2b0";
    const CHARACTERISTIC_UUID = "b72b9432-25f9-4c7f-96cb-fcb8efde84fd";


    useEffect(() => {
        if(!device || !isConnected){
            return;
        }
        const subscription = startListening(device);
        return () => subscription?.remove();
    }, [device, isConnected]);

  useEffect(() => {
    const requestPermissions = async () => {
      const granted = await requestLocationPermission();
      return granted;
    };

    requestPermissions();
  }, []);


    const connectToDevice = async () => {
        try {
            // Start scanning for devices
            setIsScanning(true);
            console.log('Scanning for BLE devices...');
            bleManager.startDeviceScan(null, null, async (error, scannedDevice) => {
                if (error) {
                    console.error('Scan error:', error);
                    setIsScanning(false);
                    return;
                }
                // Check if this is the device you want to connect to
                if (scannedDevice && scannedDevice.serviceUUIDs?.includes(SERVICE_UUID)) {
                    // Stop scanning once we find the device
                    console.log("Found : " + scannedDevice.name);
                    bleManager.stopDeviceScan();
                    setIsScanning(false);
                    try {
                        // Connect to the device
                        const connectedDevice = await scannedDevice.connect();
                        console.log('Connected to device');
                        // Discover all services and characteristics
                        const discoveredDevice = await connectedDevice.discoverAllServicesAndCharacteristics();
                        console.log('Discovered services and characteristics');
                        setDevice(discoveredDevice);
                        setIsConnected(true);
                    } catch (connectionError) {
                        console.error('Connection error:', connectionError);
                        setIsConnected(false);
                    }
                }
            });
        } catch (error) {
            console.error('BLE error:', error);
            setIsConnected(false);
        }
    };

    const disconnectDevice = async () => {
        if (device) {
            try {
                await device.cancelConnection();
                setIsConnected(false);
                setDevice(null);
            } catch (error) {
                console.error('Disconnection error:', error);
            }
        }
    };

    const send = async () => {
        try {
            await device.writeCharacteristicWithoutResponseForService(
                SERVICE_UUID,
                CHARACTERISTIC_UUID,
                btoa(Sent),
                null
            )
            console.log("Successful write to characteristic\nWritten value: " + Sent)
        } catch (error) {
            console.error("Failed to write to characteristic", error)
        }
    };

    const startListening = (device) => {
        return device.monitorCharacteristicForService(
            SERVICE_UUID,
            CHARACTERISTIC_UUID,
            (error, characteristic) => {
                if (error) {
                    console.error('Notification error:', error);
                    return;
                }
                const value = characteristic?.value;
                if (value) {
                    const decoded = atob(value);
                    setRecieved(decoded);
                }
            }
        );
    }
    return (
        <View>
            <Text>Hello there</Text>
            {isConnected ?
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={disconnectDevice}><Text>Disconnnect</Text>
                </TouchableOpacity>
                : isScanning ? <Text>Scanning</Text>
                    : <TouchableOpacity
                        style={styles.submitButton}
                        onPress={connectToDevice}><Text>Connect</Text>
                    </TouchableOpacity>}
            <View>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="value to send"
                        value={Sent}
                        onChangeText={text => setSent(text)}
                    />
                </View>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={send}
                ><Text>Send</Text></TouchableOpacity>
            </View>
            <Text style={{ fontSize: 20 }}>Value received: {Recieved} // its just what is sent. useffect test</Text>

        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    input: {
        fontSize: 16,
        color: '#0f172a',
    },
    submitButton: {
        backgroundColor: '#2563eb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    }
})

export default BleView;