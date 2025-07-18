import { useState } from "react";
import { bleManager } from "../utils/bleinstance";
import { View, Text, TextInput } from "react-native";

const BleView = () => {
    const [Sent, setSent] = useState('');
    const [Recieved, setRecieved] = useState('');
    return (
        <View>
            <Text>Hello there</Text>
            <TextInput
                placeholder="value to send"
                value={Sent}
            />
            <Text>Value received: </Text>

        </View>
    );
}

export default BleView;