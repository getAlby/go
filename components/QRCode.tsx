import { View } from "react-native";
import QRCodeLibrary from "react-native-qrcode-svg";


function QRCode({ value }: { value: string }) {
    return (
        <View className="border-4 border-amber-400 p-3 rounded-3xl bg-white" style={{ elevation: 1 }}>
            <QRCodeLibrary value={value} size={300} />
        </View>
    );
}

export default QRCode;
