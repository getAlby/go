import { LinearGradient } from "components/LinearGradient";
import { Dimensions, View } from "react-native";
import QRCodeStyled from "react-native-qrcode-styled";
import AlbyGoLogomark from "~/components/AlbyGoLogomark";
import { useThemeColor } from "~/lib/useThemeColor";

function QRCode({
  value,
  showAvatar,
}: {
  value: string;
  showAvatar?: boolean;
}) {
  const { primary, secondary, foreground } = useThemeColor(
    "primary",
    "secondary",
    "foreground",
  );
  const dimensions = Dimensions.get("window");
  const qrSize = Math.round((dimensions.width * 5) / 7);
  const avatarSize = qrSize * 0.15;

  return (
    <View className="justify-center">
      <LinearGradient
        className="p-2 rounded-[28] flex items-center justify-center"
        colors={[secondary, primary]}
        start={[0, 1]}
        end={[1, 0]}
      >
        <View className="flex items-center justify-center p-4 rounded-3xl bg-background">
          <QRCodeStyled
            data={value}
            size={qrSize}
            color={foreground}
            pieceBorderRadius={"50%"}
            outerEyesOptions={{
              topLeft: {
                borderRadius: ["30%", "30%", "30%", "30%"],
              },
              topRight: {
                borderRadius: ["30%", "30%", "30%", "30%"],
              },
              bottomLeft: {
                borderRadius: ["30%", "30%", "30%", "30%"],
              },
            }}
            innerEyesOptions={{
              borderRadius: ["30%", "30%", "30%", "30%"],
            }}
          />
        </View>
      </LinearGradient>
      {showAvatar && (
        <View className="absolute self-center p-3 rounded-full bg-background">
          <AlbyGoLogomark
            style={{
              width: avatarSize,
              height: avatarSize,
            }}
          />
        </View>
      )}
    </View>
  );
}

export default QRCode;
