import React, {useEffect, useState } from "react";
import {TouchableOpacity, Dimensions, Text, View, StyleSheet, Alert } from "react-native";
import Icon from 'react-native-vector-icons/Feather';
import { auth_token } from './token'

const { width, height } = Dimensions.get('window');

const Blynk2 = () => {

    const server_address = "blynk.cloud"
    const token = auth_token
    const Relay_Switch = 'v0'
    const Battery_Monitor = 'v1'
    const Status_Vpin = 'v2'
    const Power_pin = 'v3'
    const digital_on = 1
    const digital_off = 0

    const [isOn, setIsOn] = useState(false);
    
    const [Battery_Percentage, setBatteryPercentage] = useState(0)
    const [Inverter_Status, setInverter_Status] = useState('Offline')
    const [Power_Consumption, setPower_Consumption] = useState(0)

  useEffect(() => {
    const getInverter_Status = async () => {
      try{
        const status = await fetch(`https://${server_address}/external/api/get?token=${token}&${Status_Vpin}`)
        if (status.ok){
          const status_text = await status.text()
          setInverter_Status(status_text)
        }
      } catch(error){
        console.error("Failed to perform getInverter_Status operation")
      }  
    };

    const interval_id2 = setInterval(getInverter_Status, 5000)
    return () => clearInterval(interval_id2);
  }, []);

  useEffect(() => {
    const getBatteryPercentage = async () => {
      try {
        const response = await fetch(`https://${server_address}/external/api/get?token=${token}&${Battery_Monitor}`)
        if (response.ok){
          const value = await response.text();
          setBatteryPercentage(value)
        } else {
          console.log("Failed to Update Battery percentage")
        }
      } catch (error) {}
    };
    const interval_id = setInterval(getBatteryPercentage, 5000)
    return () => clearInterval(interval_id);
  }, [])

  useEffect(() => {
    const getPowerConsumption = async () => {
      try {
        const response = await fetch(`https://${server_address}/external/api/get?token=${token}&${Power_pin}`)
        if (response.ok){
          const value = await response.text();
          setPower_Consumption(value)
        } else {
          console.log("Failed to Update Power Consumption")
        }
      } catch (error) {}
    };

    const interval_id2 = setInterval(getPowerConsumption, 5000)
    return () => clearInterval(interval_id2)
  }, [])

  const performAction_TurnOn = async () => {
    try {
      const response = await fetch(`https://${server_address}/external/api/update?token=${token}&${Relay_Switch}=${digital_on}`);
      if (response.ok) {
        Alert.alert("Solar Inverter turn on successfully!");
      } else {
        Alert.alert("Error", "Failed to turn on the Solar Inverter");
      }
    } catch (error) {}
  };

  const performAction_TurnOff = async () => {
    try {
        const response = await fetch(`http://${server_address}/external/api/update?token=${token}&${Relay_Switch}=${digital_off}`);
      if (response.ok) {
        Alert.alert("Solar Inverter turn off successfully!");
      } else {
        Alert.alert("Error", "Failed to turn off Solar Inverter");
      }
    } catch (error) {}
  };

   const toggleHandler = () => {
     if (isOn) {
       performAction_TurnOff();
      } else {
        performAction_TurnOn();
      }
      setIsOn(!isOn);
  };





  const getStatusColor = (status) => {
    return status?.toLowerCase() === "online" ? "#34d399" : "#f87171";
  };

  const getBatteryColor = (percentage) => {
    if (percentage >= 70) return "#34d399";
    if (percentage >= 30) return "#fbbf24";
    return "#f87171";
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <View style={styles.card}>
          <Icon 
            name="power" 
            size={48} 
            color={getStatusColor(Inverter_Status)} 
            style={styles.icon}
          />
          <Text style={styles.title}>Inverter Status</Text>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(Inverter_Status) }]} />
          <Text style={[styles.value, { color: getStatusColor(Inverter_Status) }]}>
            {Inverter_Status || 'Unknown'}
          </Text>
        </View>

        <View style={styles.card}>
          <Icon
            name="zap"
            size={48}
            color="#fbbf24"
            style={styles.icon}
          />
          <Text style={styles.title}>Power Control</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                isOn && styles.activeButton,
                { marginRight: 8 }
              ]}
              onPress={() => {
                setIsOn(true);
                performAction_TurnOn()}}
            >
              <Text style={[
                styles.buttonText,
                isOn && styles.activeButtonText
              ]}>ON</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.controlButton,
                !isOn && styles.activeButton
              ]}
              onPress={() => {
                setIsOn(false);
                performAction_TurnOff()}}
            >
              <Text style={[
                styles.buttonText,
                !isOn && styles.activeButtonText
              ]}>OFF</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Icon 
            name="battery" 
            size={48} 
            color={getBatteryColor(Battery_Percentage)} 
            style={styles.icon}
          />
          <Text style={styles.title}>Battery Level</Text>
          <Text style={[styles.value, { color: getBatteryColor(Battery_Percentage) }]}>
            {Battery_Percentage !== undefined ? `${Math.min(100, Math.max(0, Battery_Percentage))}%` : '0%'}
          </Text>
          <View style={styles.batteryBar}>
            <View 
              style={[
                styles.batteryFill, 
                { 
                  width: `${Math.min(100, Math.max(0, Battery_Percentage || 0))}%`,
                  backgroundColor: getBatteryColor(Battery_Percentage)
                }
              ]} 
            />
          </View>
        </View>

        {/* Power Consumption */}
        <View style={styles.card}>
          <Icon 
            name="activity" 
            size={48} 
            color="#60a5fa" 
            style={styles.icon}
          />
          <Text style={styles.title}>Power Consumption</Text>
          <Text style={styles.value}>
            <Text style={[styles.value, { color: '#60a5fa' }]}>
              {Power_Consumption !== undefined ? Power_Consumption : '0'}
            </Text>
            <Text style={styles.unit}> Amps</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Dark background
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8
  },
  card: {
    width: (width - 40) / 2,
    height: (height - 200) / 2,
    backgroundColor: '#1e3a8a', // Blue background for cards
    margin: 4,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#bfdbfe', // Light blue text
    textAlign: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  unit: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#bfdbfe',
  },
  switch: {
    transform: [{ scale: 1.2 }],
    marginVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    marginTop: 4,
    color: '#bfdbfe',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  batteryBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#1e3a8a',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  controlButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1e3a8a',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  activeButton: {
    backgroundColor: '#34d399',
    borderColor: '#34d399',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#bfdbfe',
  },
  activeButtonText: {
    color: '#ffffff',
  },
});

/*  
  return (
      <View style={styles.container}>
      //{ Online Status }
      <View style={styles.row}>
        <Text style={styles.label}>Status:</Text>
        <Text style={styles.status}> Device status : {Inverter_Status} </Text>
      </View>

      //{ On/Off Switch }
      <View style={styles.row}>
        <CustomToggle
          value={isOn}
          onValueChange={toggleHandler}
          label="Power"
        />
      </View>

      //{Battery Percentage }
      <View style={styles.row}>
        <Text style={styles.label}>Battery:</Text>
        <Text style={styles.value}>{Battery_Percentage}%</Text>
      </View>

      //{ Power Consumption }
      <View style={styles.row}>
        <Text style={styles.label}>Power Consumption:</Text>
        <Text style={styles.value}>{Power_Consumption} Amps</Text>
      </View>
    </View>
  );
}
  
const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'pink',
      padding: 20
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 10,
      width: '100%',
      justifyContent: 'space-between',
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    status: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    online: {
      color: 'green',
    },
    offline: {
      color: 'red',
    },
    value: {
      fontSize: 16,
    },
  });

  */

  
export default Blynk2;