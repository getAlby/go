import LottieView from "lottie-react-native";

export function Tick() {
  return (
    <LottieView
      autoPlay
      loop={false}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 300,
      }}
      source={require("../assets/animations/success.json")}
    />
  );
}
