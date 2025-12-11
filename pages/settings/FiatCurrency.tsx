import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { CountryFlag } from "~/components/Flag";
import Loading from "~/components/Loading";
import Screen from "~/components/Screen";
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
            details.priority,
          ])
          .sort((a, b) => a[0].localeCompare(b[0]))
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
      <FlatList
        data={currencies}
        keyExtractor={([code]) => code}
        className="flex-1"
        renderItem={({
          item: [code, name, priority],
          index,
        }: {
          item: [string, string, number];
          index: number;
        }) => {
          const nextPriority = currencies[index + 1]?.[2];
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
                  className="rounded border border-muted"
                />
                <View className="flex-1 flex flex-row items-center gap-4">
                  <Text numberOfLines={1} className="sm:text-lg font-medium2">
                    {name}
                  </Text>
                  <Text className="sm:text-lg font-medium2 text-muted-foreground">
                    {code}
                  </Text>
                </View>
              </TouchableOpacity>
              {shouldRenderDivider && (
                <View className="border border-muted my-4" />
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

  const toggleFiatCurrency = () => {
    useAppStore
      .getState()
      .setFiatCurrency(!fiatCurrency ? DEFAULT_CURRENCY : "");
  };

  return (
    <View className="flex-1 p-6 bg-background">
      <Screen title="Fiat Currency" />

      <View className="flex-row items-center justify-between gap-2 mb-2">
        <Label onPress={toggleFiatCurrency} nativeID="fiat-toggle">
          <Text className="sm:text-lg font-semibold2">
            Display fiat currency
          </Text>
        </Label>
        <Switch
          nativeID="fiat-toggle"
          checked={!!fiatCurrency}
          onCheckedChange={toggleFiatCurrency}
        />
      </View>

      {!!fiatCurrency && (
        <>
          <View className="border border-muted my-4" />
          <CurrencyList />
        </>
      )}
    </View>
  );
}
