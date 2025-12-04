import LottieView from "lottie-react-native";
import { Dimensions } from "react-native";

export function Tick() {
  const dimensions = Dimensions.get("window");

  return (
    <LottieView
      autoPlay
      loop={false}
      style={{
        width: dimensions.width * 1.5,
        height: dimensions.width * 1.5,
      }}
      source={require("../assets/animations/success.json")}
    />
  );
}
