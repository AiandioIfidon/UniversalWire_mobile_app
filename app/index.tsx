import { Text, View } from "react-native";
<<<<<<< HEAD
import {BLEservice} from "@/components/BLEservice";

export default function Index() {
  return (
    <View>
      <BLEservice />
=======
import BleView from "../components/BleView"

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <BleView />
>>>>>>> bluetooth
    </View>
  );
}
