import { ToastConfig } from "react-native-toast-message";
import { Text } from "./ui/text";
import { View } from "react-native";
import { CheckCircle, XCircle } from "./Icons";
import { Link } from "expo-router";
import { Button } from "./ui/button";
import { useAppStore } from "~/lib/state/appStore";

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <View className="bg-primary rounded-full px-6 py-3 mx-6">
      <View className="flex flex-row gap-2 justify-center items-center">
        <CheckCircle className="text-primary-foreground" width={16} height={16} />
        <Text className="text-primary-foreground font-bold">{text1}</Text>
      </View>
      {text2 &&
        <Text className="text-muted-foreground text-center">{text2}</Text>
      }
    </View>
  ),
  error: ({ text1, text2, hide }) => (
    <View className="bg-primary rounded-full px-6 py-3 mx-6">
      <View className="flex flex-row gap-2 justify-center items-center">
        <XCircle className="text-primary-foreground" width={16} height={16} />
        <Text className="text-primary-foreground font-bold">{text1}</Text>
      </View>
      {text2 &&
        <Text className="text-muted-foreground text-center">{text2}</Text>
      }
    </View>
  ),
  connectionError: ({ text1, text2, hide }) => {
    const selectedWalletId = useAppStore((store) => store.selectedWalletId);
    return (
      <View className="bg-primary rounded-full px-6 py-3 mx-6">
        <View className="flex flex-row gap-2 justify-center items-center">
          <XCircle className="text-primary-foreground" width={16} height={16} />
          <Text className="text-primary-foreground font-bold">{text1}</Text>
        </View>
        <Text className="text-muted-foreground text-center">
          <Link
            href={`/settings/wallets/${selectedWalletId}/wallet-connection`}
            asChild
          >
            <Button>
              <Text>Update Wallet Connection</Text>
            </Button>
          </Link>
        </Text>
      </View>
    );
  },
};
