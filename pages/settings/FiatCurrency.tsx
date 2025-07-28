import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { CountryFlag } from "~/components/Flag";
import Loading from "~/components/Loading";
import Screen from "~/components/Screen";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Text } from "~/components/ui/text";
import { ALBY_URL, DEFAULT_CURRENCY } from "~/lib/constants";
import { errorToast } from "~/lib/errorToast";
import { useAppStore } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";

function CurrencyList() {
  const [fiatCurrency, setFiatCurrency] = React.useState(
    useAppStore.getState().fiatCurrency,
  );
  const [loading, setLoading] = useState(true);
  const [currencies, setCurrencies] = useState<[string, string, number][]>([]);
  const [filteredCurrencies, setFilteredCurrencies] = useState<
    [string, string, number][]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const response = await fetch(`${ALBY_URL}/api/rates`);
        const data = await response.json();
        const mappedCurrencies: [string, string, number][] = Object.entries(
          data,
        )
          .filter(([code]) => code.toUpperCase() !== "BTC")
          .map(([code, details]: any) => [
            code.toUpperCase(),
            details.name,
            details.priority ?? 100,
          ])
          .sort((a, b) => a[1].localeCompare(b[1]))
          .sort((a, b) => a[2] - b[2]) as [string, string, number][];
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
    Toast.show({ type: "success", text1: "Fiat currency updated" });
    router.dismissAll();
    router.navigate("/");
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Input
        placeholder="Search Fiat Currencies"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredCurrencies}
        keyExtractor={([code]) => code}
        className="flex-1"
        renderItem={({
          item: [code, name, priority],
          index,
        }: {
          item: [string, string, number];
          index: number;
        }) => {
          const nextPriority = filteredCurrencies[index + 1]?.[2];
          const shouldRenderDivider =
            nextPriority !== undefined &&
            nextPriority !== priority + 1 &&
            nextPriority !== priority;

          return (
            <>
              <TouchableOpacity
                className={cn(
                  "p-4 flex flex-row items-center gap-4 rounded-2xl",
                  code === fiatCurrency && "bg-muted",
                )}
                onPress={() => select(code)}
              >
                <CountryFlag
                  isoCode={code.slice(0, 2).toLowerCase()}
                  size={18}
                  className="rounded border border-input"
                />
                <View className="flex-1 flex flex-row items-center gap-4">
                  <Text
                    numberOfLines={1}
                    className="text-xl font-semibold2 text-secondary-foreground flex-initial"
                  >
                    {name}
                  </Text>
                  <Text className="text-xl font-medium2 text-muted-foreground">
                    {code}
                  </Text>
                </View>
              </TouchableOpacity>
              {shouldRenderDivider && (
                <View className="border border-input my-4" />
              )}
            </>
          );
        }}
      />
    </>
  );
}

export function FiatCurrency() {
  const fiatCurrency = useAppStore((store) => store.fiatCurrency);

  return (
    <View className="flex-1 flex flex-col gap-6 p-6">
      <Screen title="Fiat Currency" />

      <View className="flex-row items-center justify-between gap-2">
        <Label nativeID="fiat-toggle">
          <Text className="text-lg font-medium2">Display fiat currency</Text>
        </Label>
        <Switch
          nativeID="fiat-toggle"
          checked={!!fiatCurrency}
          onCheckedChange={(checked) =>
            useAppStore
              .getState()
              .setFiatCurrency(checked ? DEFAULT_CURRENCY : "")
          }
        />
      </View>

      {!!fiatCurrency && <CurrencyList />}
    </View>
  );
}
