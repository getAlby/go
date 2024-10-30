import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useGetFiatAmount, useGetSatsAmount } from "~/hooks/useGetFiatAmount";
import {
  CURSOR_COLOR,
  DEFAULT_CURRENCY,
  FIAT_REGEX,
  SATS_REGEX,
} from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";
import { RefreshCw } from "./Icons";
import { Input } from "./ui/input";
import { Text } from "./ui/text";

type DualCurrencyInputProps = {
  amount: string;
  setAmount(amount: string): void;
  autoFocus?: boolean;
  readOnly?: boolean;
};

export function DualCurrencyInput({
  amount,
  setAmount,
  autoFocus = false,
  readOnly = false,
}: DualCurrencyInputProps) {
  const getFiatAmount = useGetFiatAmount();
  const getSatsAmount = useGetSatsAmount();
  const fiatCurrency =
    useAppStore((store) => store.fiatCurrency) || DEFAULT_CURRENCY;
  const [fiatAmount, setFiatAmount] = React.useState("");
  const [inputMode, setInputMode] = React.useState<"sats" | "fiat">("sats");

  function onChangeText(text: string) {
    if (inputMode === "sats") {
      if (!SATS_REGEX.test(text)) {
        return;
      }
      setAmount(text);
    } else {
      if (!FIAT_REGEX.test(text)) {
        return;
      }
      setFiatAmount(text);
      if (getSatsAmount) {
        setAmount(getSatsAmount(+text)?.toString() || "");
      }
    }
  }

  function toggleInputMode() {
    if (inputMode === "sats" && getFiatAmount) {
      setFiatAmount(
        amount ? getFiatAmount(+amount, false)?.toString() || "" : "",
      );
    }
    setInputMode(inputMode === "fiat" ? "sats" : "fiat");
  }

  return (
    <View className="w-full flex flex-col items-center justify-center gap-5">
      <Input
        className="w-full border-transparent bg-transparent text-center mt-3"
        placeholder="0"
        keyboardType={inputMode === "sats" ? "number-pad" : "decimal-pad"}
        value={inputMode === "sats" ? amount : fiatAmount}
        selectionColor={CURSOR_COLOR}
        onChangeText={onChangeText}
        aria-labelledbyledBy="amount"
        style={styles.amountInput}
        autoFocus={autoFocus}
        returnKeyType="done"
        readOnly={readOnly}
        // aria-errormessage="inputError"
      />
      <TouchableOpacity onPress={toggleInputMode}>
        <View className="flex flex-row gap-2 items-center justify-center">
          <Text className="font-semibold2 text-2xl text-muted-foreground">
            {inputMode === "fiat" ? fiatCurrency : "sats"}
          </Text>
          <RefreshCw className="text-muted-foreground" width={16} height={16} />
        </View>
      </TouchableOpacity>
      {
        <Text className="text-muted-foreground text-2xl font-semibold2">
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
    height: 90,
  },
});
