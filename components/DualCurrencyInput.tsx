import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SwapIcon } from "~/components/Icons";
import { useGetFiatAmount, useGetSatsAmount } from "~/hooks/useGetFiatAmount";
import { CURSOR_COLOR, FIAT_REGEX, SATS_REGEX } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";
import { Input } from "./ui/input";
import { Text } from "./ui/text";

type DualCurrencyInputProps = {
  amount: string;
  setAmount(amount: string): void;
  autoFocus?: boolean;
  readOnly?: boolean;
  max?: number;
  min?: number;
};

export function DualCurrencyInput({
  amount,
  setAmount,
  autoFocus = false,
  readOnly = false,
  max,
  min,
}: DualCurrencyInputProps) {
  const getFiatAmount = useGetFiatAmount();
  const getSatsAmount = useGetSatsAmount();
  const fiatCurrency = useAppStore((store) => store.fiatCurrency);
  const [fiatAmount, setFiatAmount] = React.useState("");
  const [inputMode, setInputMode] = React.useState<"sats" | "fiat">("sats");
  const inputRef = React.useRef<TextInput>(null);

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
        const numericValue = +text.replace(",", ".");
        setAmount(getSatsAmount(numericValue)?.toString() || "");
      }
    }
  }

  function toggleInputMode() {
    inputRef.current?.blur();
    if (inputMode === "sats" && getFiatAmount) {
      setFiatAmount(
        amount ? getFiatAmount(+amount, false)?.toString() || "" : "",
      );
    }
    const newMode = inputMode === "fiat" ? "sats" : "fiat";
    setInputMode(newMode);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }

  return (
    <View className="w-full flex flex-col items-center justify-center gap-5">
      <Input
        key={inputMode}
        ref={inputRef}
        className={cn(
          "w-full border-transparent bg-transparent text-center mt-3",
          ((max && Number(amount) > max) || (min && Number(amount) < min)) &&
            "text-destructive",
        )}
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
      />
      {fiatCurrency ? (
        <TouchableOpacity onPress={toggleInputMode} className="p-2">
          <View className="flex flex-row gap-2 items-center justify-center">
            <Text className="font-semibold2 text-2xl text-muted-foreground">
              {inputMode === "fiat" ? fiatCurrency : "sats"}
            </Text>
            <SwapIcon
              className="text-muted-foreground"
              width={16}
              height={16}
            />
          </View>
        </TouchableOpacity>
      ) : (
        <Text className="font-semibold2 text-2xl text-muted-foreground p-2">
          sats
        </Text>
      )}
      {fiatCurrency && (
        <Text className="text-muted-foreground text-2xl font-semibold2">
          {inputMode === "fiat"
            ? new Intl.NumberFormat().format(+amount) + " sats"
            : getFiatAmount?.(+amount) || ""}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  amountInput: {
    fontSize: 80,
  },
});
