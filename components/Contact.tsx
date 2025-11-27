import { darken, lighten } from "colorizr";
import { router } from "expo-router";
import pastellify from "pastellify";
import { TouchableOpacity, View } from "react-native";
import { TrashLineIcon } from "~/components/Icons";
import { Text } from "~/components/ui/text";

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
      className="flex flex-row items-center gap-4 px-6 py-4"
      onPress={() => {
        router.navigate({
          pathname: "/send",
          params: {
            url: lnAddress,
          },
        });
      }}
    >
      <View
        className="h-12 w-12 flex items-center justify-center rounded-full"
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
        <Text className="text-xl font-semibold2">{name || lnAddress}</Text>
        <Text className="text-muted-foreground">{lnAddress}</Text>
      </View>
      {onDelete && (
        <TouchableOpacity className="p-3" onPress={onDelete}>
          <TrashLineIcon className="text-muted-foreground" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
