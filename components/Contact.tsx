import { darken, lighten } from "colorizr";
import pastellify from "pastellify";
import { TouchableOpacity, View } from "react-native";
import { TrashLineIcon } from "~/components/Icons";
import { Text } from "~/components/ui/text";
import { initiatePaymentFlow } from "~/lib/initiatePaymentFlow";

export default function Contact({
  lnAddress,
  name,
  onDelete,
}: {
  lnAddress: string;
  name?: string;
  onDelete?: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex flex-row items-center gap-4 px-6 py-3"
      onPress={async () => {
        await initiatePaymentFlow(lnAddress);
      }}
    >
      <View
        className="h-10 w-10 flex items-center justify-center rounded-full"
        style={{
          backgroundColor: lighten(
            pastellify(lnAddress, {
              toCSS: true,
            }),
            10,
          ),
        }}
      >
        <Text
          className="text-2xl font-semibold2"
          style={{
            color: darken(
              pastellify(lnAddress, {
                toCSS: true,
              }),
              30,
            ),
          }}
        >
          {name?.[0]?.toUpperCase() || lnAddress[0]?.toUpperCase() || "SN"}
        </Text>
      </View>
      <View className="flex flex-1 flex-col">
        <Text className="text-lg font-semibold2">{name || lnAddress}</Text>
        <Text className="text-secondary-foreground">{lnAddress}</Text>
      </View>
      {onDelete && (
        <TouchableOpacity className="px-4 -mr-2" onPress={onDelete}>
          <TrashLineIcon
            width={18}
            height={18}
            className="text-muted-foreground"
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
