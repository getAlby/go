import LottieView from "lottie-react-native";

export function Paid() {
  return (
    <LottieView
      autoPlay
      loop={false}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 250,
      }}
      source={require("../assets/animations/success.json")}
    />
  );
}
