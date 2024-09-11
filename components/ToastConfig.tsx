import { Link } from "expo-router";
import { View } from "react-native";
import {
  BaseToast,
  BaseToastProps,
  ToastConfig,
} from "react-native-toast-message";
import { useAppStore } from "~/lib/state/appStore";

import { CheckCircle, XCircle } from "./Icons";
import { Button } from "./ui/button";
import { Text } from "./ui/text";

export const toastConfig: ToastConfig = {
  info: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      text2NumberOfLines={2}
      text1Style={{ fontSize: 16 }}
      text2Style={{ fontSize: 14 }}
    />
  ),
  success: ({ text1, text2 }) => (
    <View className="bg-foreground rounded-full px-6 py-3 mx-6">
      <View className="flex flex-row gap-2 justify-center items-center">
        <CheckCircle className="text-background" width={16} height={16} />
        <Text className="text-background font-semibold2">{text1}</Text>
      </View>
      {text2 && <Text className="text-background text-center">{text2}</Text>}
    </View>
  ),
  error: ({ text1, text2, hide }) => (
    <View className="bg-destructive rounded-full px-6 py-3 mx-6">
      <View className="flex flex-row gap-2 justify-center items-center">
        <XCircle className="text-background" width={16} height={16} />
        <Text className="text-background font-semibold2">{text1}</Text>
      </View>
      {text2 && <Text className="text-background text-center">{text2}</Text>}
    </View>
  ),
  connectionError: ({ text1, text2, hide }) => {
    const selectedWalletId = useAppStore((store) => store.selectedWalletId);
    return (
      <View className="bg-foreground rounded-full px-6 py-3 mx-6 flex flex-col gap-2">
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
