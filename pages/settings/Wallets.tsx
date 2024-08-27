import { Link, Stack } from "expo-router";
import { Wallet2 } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { FlatList } from "react-native";
import { Settings2 } from "~/components/Icons";
import { Button } from "~/components/ui/button";

import { Text } from "~/components/ui/text";
import { DEFAULT_WALLET_NAME } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";

export function Wallets() {
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const wallets = useAppStore((store) => store.wallets);
  return (
    <>
      <View className="flex-1 flex flex-col">
        <Stack.Screen
          options={{
            title: "Manage Wallets",
          }}
        />
        <View className="flex-1 px-6 py-3">
          <FlatList
            className="flex flex-col"
            data={wallets}
            renderItem={(item) => {
              const active = item.index === selectedWalletId;

              return (
                <Pressable
                  onPress={() => {
                    if (item.index !== selectedWalletId) {
                      useAppStore.getState().setSelectedWalletId(item.index);
                    }
                  }}
                  className={cn(
                    "flex flex-row items-center justify-between p-6 rounded-2xl border-2",
                    active ? "border-primary" : "border-transparent",
                  )}
                >
                  <View className="flex flex-row gap-4 items-center">
                    <Wallet2 className="text-foreground" />
                    <Text className={cn("text-xl", active && "font-semibold2")}>
                      {item.item.name || DEFAULT_WALLET_NAME}
                    </Text>
                  </View>
                  {active && (
                    <Link
                      href={`/settings/wallets/${selectedWalletId}`}
                      className="absolute right-2"
                      asChild
                    >
                      <Button variant="link">
                        <Settings2 className="text-foreground w-32 h-32" />
                      </Button>
                    </Link>
                  )}
                </Pressable>
              );
            }}
          />
        </View>
        <View className="p-6">
          <Link href="/settings/wallets/new" asChild>
            <Button size="lg">
              <Text>Connect a Wallet</Text>
            </Button>
          </Link>
        </View>
      </View>
    </>
  );
}
