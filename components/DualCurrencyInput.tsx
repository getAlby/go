import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import {
  ArrowLeftIcon,
  EditLineIcon,
  NotesIcon,
  SwapIcon,
  XIcon,
} from "~/components/Icons";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount, useGetSatsAmount } from "~/hooks/useGetFiatAmount";
import { MAX_SATS_THRESHOLD } from "~/lib/constants";
import { errorToast } from "~/lib/errorToast";
import { useAppStore } from "~/lib/state/appStore";
import { useThemeColor } from "~/lib/useThemeColor";
import { cn, formatBitcoinAmount } from "~/lib/utils";

interface DescriptionInputProps {
  description: string;
  setDescription?: (description: string) => void;
  readOnly?: boolean;
}

type DualCurrencyInputProps = {
  amount: string;
  setAmount(amount: string): void;
  description: string;
  setDescription?: (description: string) => void;
  min?: number;
  max?: number;
  isAmountReadOnly?: boolean;
  isDescriptionReadOnly?: boolean;
};

function DescriptionInput({
  description,
  setDescription,
  readOnly,
}: DescriptionInputProps) {
  const [input, setInput] = useState(description);
  const { primary, foreground, background, mutedForeground } = useThemeColor(
    "primary",
    "foreground",
    "background",
    "mutedForeground",
  );
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        style={{ backgroundColor: foreground }}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.3}
        pressBehavior="close"
        onPress={Keyboard.dismiss}
      />
    ),
    [foreground],
  );

  const save = () => {
    setDescription?.(input);
    if (Keyboard.isVisible()) {
      Keyboard.dismiss();
    }
    bottomSheetModalRef.current?.dismiss();
  };

  const isIOS = Platform.OS === "ios";
  const Wrapper = isIOS ? React.Fragment : DismissableKeyboardView;

  return (
    <>
      {readOnly ? (
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          className="text-secondary-foreground font-medium2 text-lg text-center px-2"
        >
          {description}
        </Text>
      ) : (
        <TouchableOpacity
          onPress={() => {
            if (Keyboard.isVisible()) {
              Keyboard.dismiss();
            }
            bottomSheetModalRef.current?.present();
          }}
          className="flex flex-row items-center justify-center gap-2 px-12 py-4"
        >
          {!description && <NotesIcon className="text-secondary-foreground" />}
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            className="text-secondary-foreground font-medium2 text-lg text-center px-2"
          >
            {description || "Add Description"}
          </Text>
          {description && (
            <EditLineIcon className="text-secondary-foreground" />
          )}
        </TouchableOpacity>
      )}

      <BottomSheetModal
        ref={bottomSheetModalRef}
        backgroundStyle={{
          backgroundColor: background,
          borderRadius: 24,
        }}
        handleIndicatorStyle={{
          backgroundColor: mutedForeground,
        }}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
      >
        <BottomSheetView className="p-6 pt-2">
          <Wrapper>
            <View className="relative flex flex-row items-center justify-center">
              <TouchableOpacity
                onPress={() => {
                  if (Keyboard.isVisible()) {
                    Keyboard.dismiss();
                  }
                  bottomSheetModalRef.current?.dismiss();
                }}
                className="absolute -left-4 p-4"
              >
                <XIcon
                  className="text-muted-foreground"
                  width={24}
                  height={24}
                />
              </TouchableOpacity>
              <Text className="text-xl sm:text-2xl font-semibold2 text-secondary-foreground">
                Add Description
              </Text>
            </View>
            {isIOS ? (
              <BottomSheetTextInput
                placeholder="Sats for Satoshi"
                className="text-foreground placeholder:text-muted border-transparent bg-transparent text-center my-16 p-3 border text-2xl leading-[1.25] font-semibold2 caret-primary"
                placeholderClassName="text-muted"
                selectionColor={primary}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={save}
                autoFocus
              />
            ) : (
              <Input
                placeholder="Sats for Satoshi"
                className="text-foreground border-0 border-transparent bg-transparent text-center my-16 p-3 text-2xl leading-[1.25] font-semibold2"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={save}
                autoFocus
              />
            )}
            <Button size="lg" onPress={save}>
              <Text>Save</Text>
            </Button>
          </Wrapper>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}

export function DualCurrencyInput({
  amount,
  setAmount,
  description,
  setDescription,
  min,
  max,
  isAmountReadOnly,
  isDescriptionReadOnly,
}: DualCurrencyInputProps) {
  const getFiatAmount = useGetFiatAmount();
  const getSatsAmount = useGetSatsAmount();
  const fiatCurrency = useAppStore((store) => store.fiatCurrency);
  const bitcoinDisplayFormat = useAppStore(
    (store) => store.bitcoinDisplayFormat,
  );
  const [text, setText] = React.useState(amount);
  const [inputMode, setInputMode] = React.useState<"sats" | "fiat">("sats");

  const formatPlaceholderNumber = React.useCallback((value: number) => {
    const suffixes = { M: 1_000_000, k: 1_000 };
    const abs = Math.abs(value);

    for (const [suffix, divisor] of Object.entries(suffixes)) {
      if (abs >= divisor) {
        const scaled = value / divisor;
        const truncated =
          scaled >= 0
            ? Math.floor(scaled * 10) / 10
            : Math.ceil(scaled * 10) / 10;
        const display =
          truncated < 100 && truncated % 1 !== 0
            ? truncated.toFixed(1)
            : truncated.toString();

        return `${display}${suffix}`;
      }
    }

    return new Intl.NumberFormat().format(value);
  }, []);

  const keypadRows = React.useMemo(
    () => [
      ["1", "2", "3"],
      ["4", "5", "6"],
      ["7", "8", "9"],
      [inputMode === "fiat" ? "." : "000", "0", "Back"],
    ],
    [inputMode],
  );

  const symbol = React.useMemo(() => {
    if (!fiatCurrency) {
      return "";
    }
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: fiatCurrency,
      currencyDisplay: "narrowSymbol",
    })
      .format(0)
      .replace(/[0-9.,\s]/g, "");
  }, [fiatCurrency]);

  const formattedText = React.useMemo(() => {
    if (!text) {
      return "";
    }
    const sanitized = text.replace(/,/g, "");
    const [integer, decimal] = sanitized.split(".");
    const formattedInteger = new Intl.NumberFormat().format(
      Number(integer || 0),
    );
    return decimal !== undefined
      ? `${formattedInteger}.${decimal}`
      : formattedInteger;
  }, [text]);

  const showSatsThresholdToast = useCallback(() => {
    errorToast(
      new Error(
        `Maximum amount is ${formatBitcoinAmount(max || MAX_SATS_THRESHOLD, bitcoinDisplayFormat)}`,
      ),
    );
  }, [bitcoinDisplayFormat, max]);

  const handleKeyPress = (key: string) => {
    if (inputMode === "sats") {
      let next;
      if (key === "Back") {
        next = text.slice(0, -1);
      } else {
        next = `${text}${key}`;
      }
      if (Number(next || "0") > MAX_SATS_THRESHOLD) {
        showSatsThresholdToast();
        return;
      }
      setText(next);
      setAmount(next);
      return;
    } else {
      let next;
      if (key === "Back") {
        next = text.slice(0, -1);
      } else if (key === "." && text === "") {
        next = "0.";
      } else {
        next = `${text}${key}`;
      }
      next = next.replace(/^0+(?=\d)/, "");
      const satsAmount = getSatsAmount?.(+next);
      if (satsAmount !== undefined && satsAmount > MAX_SATS_THRESHOLD) {
        showSatsThresholdToast();
        return;
      }
      setText(next);
      if (getSatsAmount) {
        setAmount(satsAmount?.toString() || "");
      }
    }
  };

  const validationMessage = React.useMemo(() => {
    if (!text) {
      return "";
    }
    const hasMin = min !== undefined;
    const hasMax = max !== undefined;
    if (hasMin && hasMax && (+amount > max || +amount < min)) {
      return `Between ${formatBitcoinAmount(min, bitcoinDisplayFormat)} and ${formatBitcoinAmount(max, bitcoinDisplayFormat)}`;
    }
    if (hasMin && !hasMax && +amount < min) {
      return `Should not be less than ${formatBitcoinAmount(min, bitcoinDisplayFormat)}`;
    }
    if (hasMax && !hasMin && +amount > max) {
      return `Should not be more than ${formatBitcoinAmount(max, bitcoinDisplayFormat)}`;
    }
    return "";
  }, [amount, max, min, text, bitcoinDisplayFormat]);

  function toggleInputMode() {
    if (inputMode === "sats") {
      const fiatAmount = getFiatAmount?.(+amount, false) || "";
      const sanitizedFiatAmount = fiatAmount.replace(/[^0-9.]/g, "");
      setText(+amount ? sanitizedFiatAmount : "");
    } else {
      setText(+amount ? amount : "");
    }
    const newMode = inputMode === "fiat" ? "sats" : "fiat";
    setInputMode(newMode);
  }

  const displayCharacterCount = React.useMemo(
    () => formattedText.length + (bitcoinDisplayFormat === "bip177" ? 1 : 4),
    [formattedText, bitcoinDisplayFormat],
  );

  return (
    <View className="flex-1 flex flex-col gap-2">
      <View className="flex-1 flex flex-col">
        <View className="flex-1 flex items-center justify-center">
          {validationMessage !== "" && (
            <Text className="text-destructive">{validationMessage}</Text>
          )}
        </View>
        <View className="flex-[2] w-full flex flex-col items-center justify-center gap-2">
          <View className="flex flex-row items-center justify-center gap-2">
            {(inputMode === "fiat" ||
              (inputMode === "sats" && bitcoinDisplayFormat === "bip177")) && (
              <Text
                className={cn(
                  displayCharacterCount > 11 ? "text-4xl" : "text-5xl",
                  displayCharacterCount <= 14 &&
                    displayCharacterCount >= 11 &&
                    "sm:text-5xl",
                  "text-secondary-foreground font-bold2 !leading-[1.5]",
                  !text && "text-muted",
                )}
              >
                {inputMode === "sats" && bitcoinDisplayFormat === "bip177"
                  ? "₿"
                  : symbol}
              </Text>
            )}
            <Text
              className={cn(
                displayCharacterCount > 11 ? "text-4xl" : "text-5xl",
                displayCharacterCount <= 14 &&
                  displayCharacterCount >= 11 &&
                  "sm:text-5xl",
                "font-semibold2 !leading-[1.5]",
                !text && "text-muted",
                validationMessage && "text-destructive",
              )}
            >
              {text
                ? formattedText
                : inputMode === "sats"
                  ? min
                    ? max
                      ? `${formatPlaceholderNumber(min)}-${formatPlaceholderNumber(max)}`
                      : `Min ${formatPlaceholderNumber(min)}`
                    : max
                      ? `Max ${formatPlaceholderNumber(max)}`
                      : "0"
                  : "0.00"}
            </Text>
            {inputMode === "sats" && bitcoinDisplayFormat === "sats" && (
              <Text
                className={cn(
                  displayCharacterCount > 11 ? "text-4xl" : "text-5xl",
                  displayCharacterCount <= 14 &&
                    displayCharacterCount >= 11 &&
                    "sm:text-5xl",
                  "text-secondary-foreground font-semibold2 !leading-[1.5]",
                  !text && "text-muted",
                )}
              >
                {+amount === 1 ? "sat" : "sats"}
              </Text>
            )}
          </View>
          {fiatCurrency && (
            <Pressable onPress={toggleInputMode}>
              <View className="flex flex-row gap-2 items-center justify-center">
                {getFiatAmount ? (
                  <Text className="text-secondary-foreground text-3xl font-semibold2">
                    {inputMode === "fiat"
                      ? formatBitcoinAmount(+amount, bitcoinDisplayFormat)
                      : getFiatAmount(+amount) || ""}
                  </Text>
                ) : (
                  <Skeleton className="w-16 text-3xl" />
                )}
                <SwapIcon
                  className="text-secondary-foreground"
                  width={16}
                  height={16}
                />
              </View>
            </Pressable>
          )}
        </View>
        <View className="flex-[2] flex items-center justify-center">
          <DescriptionInput
            description={description}
            setDescription={setDescription}
            readOnly={isDescriptionReadOnly}
          />
        </View>
      </View>
      <View
        className={cn("flex-1 flex flex-col", isAmountReadOnly && "opacity-30")}
      >
        {keypadRows.map((row) => (
          <View key={row.join("-")} className="flex-1 flex-row">
            {row.map((label) => {
              const isBackspace = label === "Back";
              const isDecimalKey = label === ".";
              const isZeroKey = label === "0" || label === "000";

              const isDisabledKey = (() => {
                if (isAmountReadOnly) {
                  return true;
                }
                if (isBackspace) {
                  return text === "";
                }

                if (inputMode === "sats") {
                  return !+amount && isZeroKey; // zero key when there's no input
                }

                const hasDecimal = text.includes(".");
                const decimalDigits = hasDecimal
                  ? text.split(".")[1]?.length || 0
                  : 0;

                if (text === "0" && isZeroKey) {
                  return true;
                } // zero key when input is already 0
                if (hasDecimal && decimalDigits >= 2) {
                  return true;
                } // all keys except backspace when two decimal places are filled
                if (isDecimalKey) {
                  return hasDecimal;
                } // decimal key when input already has a decimal

                return false;
              })();
              return (
                <Pressable
                  key={label}
                  className="flex-1"
                  disabled={isDisabledKey}
                  onPress={() => handleKeyPress(label)}
                >
                  <View className="flex-1 flex items-center justify-center">
                    {isBackspace ? (
                      <ArrowLeftIcon
                        className={cn(
                          isDisabledKey
                            ? "text-muted-foreground"
                            : "text-foreground",
                        )}
                        width={24}
                        height={24}
                      />
                    ) : (
                      <Text
                        className={cn(
                          "font-bold2",
                          label === "000" ? "text-xl" : "text-3xl",
                          isDisabledKey && "text-muted-foreground",
                        )}
                      >
                        {label}
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
