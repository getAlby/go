import { Link } from "expo-router";
import { View } from "react-native";
import { ToastConfig } from "react-native-toast-message";
import { useAppStore } from "~/lib/state/appStore";
import { CircleCheck, XCircle } from "./Icons";
import { Button } from "./ui/button";
import { Text } from "./ui/text";

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <View className="bg-foreground rounded-xl px-6 py-3 mx-6">
      <View className="flex flex-row gap-2 justify-center items-center">
        <CircleCheck className="text-background" width={16} height={16} />
        <Text className="text-background font-semibold2">{text1}</Text>
      </View>
      {text2 && <Text className="text-background text-center">{text2}</Text>}
    </View>
  ),
  info: ({ text1, text2, hide }) => (
    <View className="bg-yellow-500 rounded-full px-6 py-3 mx-6">
      <View className="flex flex-row gap-2 justify-center items-center">
        <XCircle className="text-background" width={16} height={16} />
        <Text className="text-background font-semibold2">{text1}</Text>
      </View>
      {text2 && <Text className="text-background text-center">{text2}</Text>}
    </View>
  ),
  error: ({ text1, text2, hide }) => (
    <View className="bg-destructive rounded-xl px-6 py-3 mx-6">
      <View className="flex flex-row gap-2 justify-center items-center">
        <XCircle className="text-background" width={16} height={16} />
        <Text className="text-background font-semibold2">{text1}</Text>
      </View>
      {text2 && <Text className="text-background text-center">{text2}</Text>}
    </View>
  ),
  connectionError: ({ text1, text2, hide }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const selectedWalletId = useAppStore((store) => store.selectedWalletId);
    return (
      <View className="bg-foreground rounded-xl px-6 py-3 mx-6 flex flex-col gap-2">
        <View className="flex flex-row gap-2 justify-center items-center">
          <XCircle className="text-background" width={16} height={16} />
          <Text className="text-background font-semibold2">{text1}</Text>
        </View>
        <Link
          href={`/settings/wallets/${selectedWalletId}/wallet-connection`}
          asChild
        >
          <Button variant="secondary" size="sm">
            <Text>Update Wallet Connection</Text>
          </Button>
        </Link>
      </View>
    );
  },
};
