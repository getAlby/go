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
                borderRadius: ["24%", "24%", "24%", "24%"],
              },
              topRight: {
                borderRadius: ["24%", "24%", "24%", "24%"],
              },
              bottomLeft: {
                borderRadius: ["24%", "24%", "24%", "24%"],
              },
            }}
            innerEyesOptions={{
              borderRadius: ["20%", "20%", "20%", "20%"],
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
