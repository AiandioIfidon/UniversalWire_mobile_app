import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Platform, PermissionsAndroid, TouchableOpacity, ActivityIndicator } from 'react-native';
import { bleManager } from '@/utils/BLE_instance'
import { MaterialIcons, Feather } from '@expo/vector-icons';

const BLEservice = () => {
  const [device, setDevice] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [SSID, changeSSID] = useState('');
  const [PASSPHRASE, changePASSPHRASE] = useState('');

  // UUIDs of the service and characteristics
  const SERVICE_UUID = "853f29b2-f5ed-4b69-b4c6-9cd68a9fc2b0";
  const SSID_CHARACTERISTIC_UUID = "b72b9432-25f9-4c7f-96cb-fcb8efde84fd";
  const PASSPHRASE_CHARACTERISTIC_UUID = "7c8451c7-7909-47ef-b072-35d24729b8aa"

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

  const write_ssid = async () => {
    try {
      await device.writeCharacteristicWithoutResponseForService(
        SERVICE_UUID,
        SSID_CHARACTERISTIC_UUID,
        btoa(SSID),
        null
      )
      console.log("Successful write to SSID characteristic\nWritten value: " + SSID)
    } catch (error) {
      console.error("Failed to write to characteristic", error)
    }
  };

  const write_passphrase = async () => {
    try {
      await device.writeCharacteristicWithoutResponseForService(
        SERVICE_UUID,
        PASSPHRASE_CHARACTERISTIC_UUID,
        btoa(PASSPHRASE),
        null
      )
      console.log("Successful write to Passphrase characteristic\nWritten value: " + PASSPHRASE)
    } catch (error) {
      console.error("Failed to write to characteristic", error)
    }
  }

  const write_both = async () => {
    try {
      write_ssid();
      write_passphrase();
      setTimeout(() => {
        disconnectDevice();
      }, 1000);
    } catch (error) {
      console.error("Error writing passphrase and ssid")
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.statusSection}>
          {isConnected ? (
            <>
              <View style={styles.statusIndicator}>
                <MaterialIcons name="wifi" size={24} color="#22c55e" />
                <View style={[styles.statusDot, styles.statusConnected]} />
              </View>
              <Text style={styles.statusTitle}>Connected</Text>
              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={disconnectDevice}
              >
                <MaterialIcons name="wifi-off" size={20} color="#ef4444" />
                <Text style={styles.disconnectText}>Disconnect</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.statusIndicator}>
                <MaterialIcons name="wifi" size={24} color="#94a3b8" />
                <View style={[styles.statusDot, styles.statusDisconnected]} />
              </View>
              <Text style={styles.statusTitle}>Not Connected </Text>
              <Text style={styles.note}>Bluetooth and Location must be enabled</Text>
              {isScanning ? (
                <View style={styles.scanningContainer}>
                  <ActivityIndicator color="#2563eb" />
                  <Text style={styles.scanningText}>Scanning for devices...</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={connectToDevice}
                >
                  <Text style={styles.connectButtonText}>Connect Device</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View style={styles.configSection}>
          <Text style={styles.configTitle}>Network Configuration</Text>

          <View style={styles.inputContainer}>
            <Feather name="user" size={20} color="#64748b" />
            <TextInput
              style={styles.input}
              placeholder="Network SSID"
              placeholderTextColor="#94a3b8"
              value={SSID}
              onChangeText={text => changeSSID(text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color="#64748b" />
            <TextInput
              style={styles.input}
              placeholder="Network Password"
              placeholderTextColor="#94a3b8"
              value={PASSPHRASE}
              onChangeText={text => changePASSPHRASE(text)}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={write_both}
          >
            <Text style={styles.submitButtonText}>Update Network Settings</Text>
            <MaterialIcons name="arrow-right" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  note: {
    fontStyle: 'italic'
  },
  statusSection: {
    alignItems: 'center',
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusConnected: {
    backgroundColor: '#22c55e',
  },
  statusDisconnected: {
    backgroundColor: '#94a3b8',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
  },
  disconnectText: {
    color: '#ef4444',
    fontWeight: '500',
    marginLeft: 8,
  },
  connectButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  scanningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanningText: {
    color: '#64748b',
    marginLeft: 8,
    fontSize: 16,
  },
  configSection: {
    marginTop: 24,
  },
  configTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
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
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});


// Helper function for requesting location permission
const requestLocationPermission = async () => {
  if (Platform.OS !== 'android') return false;

  const permission =
    Platform.Version >= 31
      ? PERMISSIONS.ANDROID.BLUETOOTH_SCAN
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

  const result = await request(permission);
  return result === RESULTS.GRANTED;
};

export default BLEservice;