import { LinearGradient } from "components/LinearGradient";
import { View } from "react-native";
import QRCodeLibrary from "react-native-qrcode-svg";

function QRCode({ value }: { value: string }) {
  return (
    <LinearGradient
      className="p-2 rounded-2xl flex items-center justify-center"
      colors={["#FFC453", "#FFE951"]}
      start={[0, 1]}
      end={[1, 0]}
      style={{ borderRadius: 28, elevation: 2 }}
    >
      <View className="flex items-center justify-center p-3 rounded-3xl bg-white w-96 h-96">
        <QRCodeLibrary value={value} size={300} ecl="H" />
      </View>
    </LinearGradient>
  );
}

export default QRCode;
