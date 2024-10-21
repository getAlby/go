import React, { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";
import Screen from "~/components/Screen";
import { cn } from "~/lib/utils";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { errorToast } from "~/lib/errorToast";
import { ALBY_URL } from "~/lib/constants";

let cachedCurrencies: Record<string, [string, string][]> = {};

export function FiatCurrency() {
  const [fiatCurrency, setFiatCurrency] = React.useState(
    useAppStore.getState().fiatCurrency
  );
  const [currencies, setCurrencies] = useState<[string, string][]>([]);
  const [filteredCurrencies, setFilteredCurrencies] = useState<[string, string][]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchCurrencies() {
   
      if (cachedCurrencies[fiatCurrency]) {
        const cachedData = cachedCurrencies[fiatCurrency];
        setCurrencies(cachedData);
        setFilteredCurrencies(cachedData);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${ALBY_URL}/api/rates`);
        const data = await response.json();

        const mappedCurrencies: [string, string][] = Object.entries(data).map(
          ([code, details]: any) => [code.toUpperCase(), details.name]
        );

        mappedCurrencies.sort((a, b) => a[1].localeCompare(b[1]));

      
        cachedCurrencies[fiatCurrency] = mappedCurrencies;

        setCurrencies(mappedCurrencies);
        setFilteredCurrencies(mappedCurrencies);
      } catch (error) {
        errorToast(error);
      } finally {
        setLoading(false);
      }
    }

    fetchCurrencies();
  }, [fiatCurrency]);

  useEffect(() => {
    const filtered = currencies.filter(([code, name]) =>
      name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      code.toLowerCase().includes(searchQuery.toLowerCase())
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

  const renderCurrencyItem = ({ item }: { item: [string, string] }) => (
    <TouchableOpacity
      className={cn("p-4 flex flex-row gap-2 border-b border-input", item[0] === fiatCurrency && "bg-muted")}
      onPress={() => select(item[0])}
    >
      <Text className={cn("text-lg", item[0] === fiatCurrency && "font-bold2")}>
        {item[1]}
      </Text>
      <Text className="text-lg text-muted-foreground">({item[0]})</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View className="flex-1 flex flex-col p-6">
      <Screen title="Fiat Currency" />
      <TextInput
        className="border border-gray-300 rounded-lg p-2 mb-4"
        placeholder="Search currencies..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredCurrencies}
        renderItem={renderCurrencyItem}
        keyExtractor={(item) => item[0]}
        className="flex-1 mb-4"
      />
    </View>
  );
}
