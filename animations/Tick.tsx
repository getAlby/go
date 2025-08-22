import LottieView from "lottie-react-native";
import { Dimensions } from "react-native";

export function Tick() {
  const dimensions = Dimensions.get("window");

  return (
    <LottieView
      autoPlay
      loop={false}
      style={{
        width: dimensions.width,
        height: dimensions.width,
      }}
      source={require("../assets/animations/success.json")}
    />
  );
}
