import { Pressable, StyleSheet, View } from "react-native";
import { useGetFiatAmount, useGetSatsAmount } from "~/hooks/useGetFiatAmount";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Text } from "./ui/text";
import React from "react";
import { useAppStore } from "~/lib/state/appStore";
import { ArrowLeftRight } from "./Icons";
import { DEFAULT_CURRENCY } from "~/lib/constants";

type DualCurrencyInputProps = {
  amount: string;
  setAmount(amount: string): void;
};

export function DualCurrencyInput({
  amount,
  setAmount,
}: DualCurrencyInputProps) {
  const getFiatAmount = useGetFiatAmount();
  const getSatsAmount = useGetSatsAmount();
  const fiatCurrency =
    useAppStore((store) => store.fiatCurrency) || DEFAULT_CURRENCY;
  const [fiatAmount, setFiatAmount] = React.useState("");
  const [inputMode, setInputMode] = React.useState<"sats" | "fiat">("sats");

  function onChangeText(text: string) {
    if (inputMode === "sats") {
      setAmount(text);
    } else {
      setFiatAmount(text);
      if (getSatsAmount) {
        setAmount(getSatsAmount(+text)?.toString() || "");
      }
    }
  }

  function toggleInputMode() {
    if (inputMode === "sats" && getFiatAmount) {
      setFiatAmount(
        amount ? getFiatAmount(+amount, false)?.toString() || "" : ""
      );
    }
    setInputMode(inputMode === "fiat" ? "sats" : "fiat");
  }

  return (
    <View className="w-full flex flex-col items-center justify-center gap-5">
      <Input
        className="w-full border-transparent text-center mt-3"
        placeholder="0"
        keyboardType="number-pad"
        value={inputMode === "sats" ? amount : fiatAmount}
        onChangeText={onChangeText}
        aria-labelledbyledBy="amount"
        style={styles.amountInput}
      // aria-errormessage="inputError"
      />
      <Pressable onPress={toggleInputMode}>
        <View className="flex flex-row gap-2 items-center justify-center">
          <Label nativeID="amount" className="self-start justify-self-start">
            {inputMode === "fiat" ? fiatCurrency : "sats"}
          </Label>
          <ArrowLeftRight className="text-primary" width={16} height={16} />
        </View>
      </Pressable>
      {
        <Text>
          {inputMode === "fiat"
            ? new Intl.NumberFormat().format(+amount) + " sats"
            : getFiatAmount?.(+amount) || ""}
        </Text>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  amountInput: {
    fontSize: 80,
    height: 100,
  },
});
