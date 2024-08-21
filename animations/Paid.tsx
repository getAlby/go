import LottieView from "lottie-react-native";
import { View } from "react-native";

export function Paid() {
  return (
    <View className="border border-red-500">
      <LottieView
        autoPlay
        loop={false}
        style={{
          width: 400,
          height: 400,
        }}
        source={require("../assets/animations/success.json")}
      />
    </View>
  );
}
