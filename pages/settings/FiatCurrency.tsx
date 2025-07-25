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
import { ALBY_URL, DEFAULT_CURRENCY, TOP_CURRENCIES } from "~/lib/constants";
import { errorToast } from "~/lib/errorToast";
import { useAppStore } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";

function CurrencyList() {
  const [fiatCurrency, setFiatCurrency] = React.useState(
    useAppStore.getState().fiatCurrency,
  );
  const [loading, setLoading] = useState(true);
  const [currencies, setCurrencies] = useState<[string, string][]>([]);
  const [filteredCurrencies, setFilteredCurrencies] = useState<
    [string, string][]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const response = await fetch(`${ALBY_URL}/api/rates`);
        const data = await response.json();
        const mappedCurrencies: [string, string][] = Object.entries(data)
          .map(([code, details]: any) => [code.toUpperCase(), details.name])
          .filter(([code]) => code !== "BTC") as [string, string][];
        mappedCurrencies.sort((a, b) => a[1].localeCompare(b[1]));

        const top = TOP_CURRENCIES.map((code) =>
          mappedCurrencies.find(([c]) => c === code),
        ).filter(Boolean) as [string, string][];
        const others = mappedCurrencies.filter(
          ([c]) => !TOP_CURRENCIES.includes(c),
        );

        setCurrencies([...top, ...others]);
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
          item: [code, name],
          index,
        }: {
          item: [string, string];
          index: number;
        }) => (
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
              <Text className="text-xl font-semibold2 text-secondary-foreground">
                {name}
              </Text>
              <Text className="text-xl font-medium2 text-muted-foreground">
                {code}
              </Text>
            </TouchableOpacity>
            {index === TOP_CURRENCIES.length - 1 && (
              <View className="border border-input my-4" />
            )}
          </>
        )}
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
