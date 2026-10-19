import { Link } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, TouchableOpacity, View } from "react-native";
import { BitcoinIcon, ChevronRightIcon } from "~/components/Icons";
import ShitcoinIcon from "~/components/icons/ShitcoinIcon";
import Screen from "~/components/Screen";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";

export function UnitsAndCurrency() {
  const { t } = useTranslation();
  return (
    <View className="flex-1">
      <Screen title={t("settings.unitsAndCurrency.title")} />
      <View className="flex-1 flex flex-col mt-4">
        <Link href="/settings/bitcoin-units" asChild>
          <TouchableOpacity className="flex flex-row items-center gap-4 px-6 py-4">
            <BitcoinIcon
              className="text-muted-foreground"
              width={24}
              height={24}
            />
            <Text
              className={cn(
                Platform.select({
                  ios: "ios:text-lg ios:sm:text-xl",
                  android: "android:text-lg",
                }),
                "font-medium2",
              )}
            >
              {t("settings.bitcoinUnits.title")}
            </Text>
            <ChevronRightIcon
              className="ml-auto text-muted-foreground"
              width={20}
              height={20}
            />
          </TouchableOpacity>
        </Link>

        <Link href="/settings/fiat-currency" asChild>
          <TouchableOpacity className="flex flex-row gap-4 items-center px-6 py-4">
            <ShitcoinIcon width={24} height={24} />
            <Text
              className={cn(
                Platform.OS === "ios"
                  ? "ios:text-lg ios:sm:text-xl"
                  : "android:text-lg",
                "font-medium2",
              )}
            >
              {t("settings.fiatCurrency.title")}
            </Text>
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
