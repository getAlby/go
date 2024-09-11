import { router } from "expo-router";
import React from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";
import Screen from "~/components/Screen";
import { cn } from "~/lib/utils";
import { currencies } from "../../lib/currencies";


export function FiatCurrency() {
  const [fiatCurrency, setFiatCurrency] = React.useState(
    useAppStore.getState().fiatCurrency,
  );

  const renderCurrencyItem = ({ item }: { item: [string, string] }) => (
    <TouchableOpacity
      className={cn("p-4 flex flex-row gap-2 border-b border-input", item[0] === fiatCurrency && "bg-muted")}
      onPress={() => setFiatCurrency(item[0])}
    >
      <Text className={cn("text-lg", item[0] === fiatCurrency && "font-bold2")}>
        {item[1]}
      </Text>
      <Text className="text-lg text-muted-foreground">
        ({item[0]})
      </Text>
    </TouchableOpacity >
  );

  return (
    <View className="flex-1 flex flex-col p-6">
      <Screen title="Fiat Currency" />
      <FlatList
        data={currencies}
        renderItem={renderCurrencyItem}
        keyExtractor={(item) => item[0]}
        className="flex-1 mb-4"
      />
      <Button
        size="lg"
        onPress={() => {
          useAppStore.getState().setFiatCurrency(fiatCurrency);
          Toast.show({
            type: "success",
            text1: "Fiat currency updated",
          });
          router.back();
        }}
      >
        <Text>Save</Text>
      </Button>
    </View>
  );
}
