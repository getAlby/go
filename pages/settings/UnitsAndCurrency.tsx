import { Link } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { BitcoinIcon, ChevronRightIcon } from "~/components/Icons";
import ShitcoinIcon from "~/components/icons/ShitcoinIcon";
import Screen from "~/components/Screen";
import { Text } from "~/components/ui/text";

export function UnitsAndCurrency() {
  return (
    <View className="flex-1 bg-background">
      <Screen title="Units & Currency" />
      <View className="flex-1 flex flex-col mt-4">
        <Link href="/settings/bitcoin-units" asChild>
          <TouchableOpacity className="flex flex-row items-center gap-4 px-6 py-3">
            <BitcoinIcon
              className="text-muted-foreground"
              width={28}
              height={28}
            />
            <Text className="font-medium2 text-xl">Bitcoin Units</Text>
            <ChevronRightIcon
              className="ml-auto text-muted-foreground"
              width={20}
              height={20}
            />
          </TouchableOpacity>
        </Link>

        <Link href="/settings/fiat-currency" asChild>
          <TouchableOpacity className="flex flex-row gap-4 items-center px-6 py-3">
            <ShitcoinIcon width={28} height={28} />
            <Text className="font-medium2 text-xl">Fiat Currency</Text>
            <ChevronRightIcon
              className="ml-auto text-muted-foreground"
              width={20}
              height={20}
            />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
