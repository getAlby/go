import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import Loading from "~/components/Loading";
import Screen from "~/components/Screen";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { ALBY_URL } from "~/lib/constants";
import { errorToast } from "~/lib/errorToast";
import { useAppStore } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";

export function FiatCurrency() {
  const [fiatCurrency, setFiatCurrency] = React.useState(
    useAppStore.getState().fiatCurrency,
  );
  const [currencies, setCurrencies] = useState<[string, string][]>([]);
  const [filteredCurrencies, setFilteredCurrencies] = useState<
    [string, string][]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const response = await fetch(`${ALBY_URL}/api/rates`);
        const data = await response.json();

        const mappedCurrencies: [string, string][] = Object.entries(data).map(
          ([code, details]: any) => [code.toUpperCase(), details.name],
        );

        mappedCurrencies.sort((a, b) => a[1].localeCompare(b[1]));

        setCurrencies(mappedCurrencies);
      } catch (error) {
        errorToast(error);
      } finally {
        setLoading(false);
      }
    }

    fetchCurrencies();
  }, []);

  useEffect(() => {
    const filtered = currencies.filter(
      ([code, name]) =>
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        code.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredCurrencies(filtered);
  }, [searchQuery, currencies]);

  function select(iso: string) {
    setFiatCurrency(iso);
    useAppStore.getState().setFiatCurrency(iso);
    Toast.show({
      type: "success",
      text1: "Fiat currency updated",
    });
    router.back();
  }

  return (
    <View className="flex-1 flex flex-col gap-6 p-6">
      <Screen title="Fiat Currency" />
      {loading ? (
        <Loading className="flex-1" />
      ) : (
        <>
          <Input
            placeholder="Search Fiat Currencies"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FlatList
            data={filteredCurrencies}
            renderItem={({ item }: { item: [string, string] }) => (
              <TouchableOpacity
                className={cn(
                  "p-4 flex flex-row gap-2 border-b border-input",
                  item[0] === fiatCurrency && "bg-muted",
                )}
                onPress={() => select(item[0])}
              >
                <Text
                  className={cn(
                    "text-lg",
                    item[0] === fiatCurrency && "font-bold2",
                  )}
                >
                  {item[1]}
                </Text>
                <Text className="text-lg text-muted-foreground">
                  ({item[0]})
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item[0]}
            className="flex-1"
          />
        </>
      )}
    </View>
  );
}
