import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useRef, useState } from "react";
import { Keyboard, Pressable, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import {
  ArrowLeftIcon,
  EditLineIcon,
  NotesIcon,
  SwapIcon,
  XIcon,
} from "~/components/Icons";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount, useGetSatsAmount } from "~/hooks/useGetFiatAmount";
import { MAX_SATS_THRESHOLD } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";
import { useColorScheme } from "~/lib/useColorScheme";
import { cn } from "~/lib/utils";

interface KeypadInputProps {
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
}: KeypadInputProps) {
  const [input, setInput] = useState(description);
  const { isDarkColorScheme } = useColorScheme();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        style={{ backgroundColor: isDarkColorScheme ? "#FFFFFF" : "#09090B" }} // translates to background
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.1}
        pressBehavior="close"
        onPress={Keyboard.dismiss}
      />
    ),
    [isDarkColorScheme],
  );

  const save = () => {
    setDescription?.(input);
    Keyboard.dismiss();
    bottomSheetModalRef.current?.dismiss();
  };

  return (
    <>
      {readOnly ? (
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          className="text-muted-foreground font-medium2 text-lg text-center px-2"
        >
          {description}
        </Text>
      ) : (
        <TouchableOpacity
          onPress={() => bottomSheetModalRef.current?.present()}
          className="flex flex-row items-center justify-center gap-2 px-12"
        >
          {!description && <NotesIcon className="text-muted-foreground" />}
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            className="text-muted-foreground font-medium2 text-lg text-center px-2"
          >
            {description || "Add Description"}
          </Text>
          {description && <EditLineIcon className="text-muted-foreground" />}
        </TouchableOpacity>
      )}

      <BottomSheetModal
        ref={bottomSheetModalRef}
        backgroundStyle={{
          backgroundColor: isDarkColorScheme ? "#09090B" : "#ffffff", // translates to muted
          borderRadius: 24,
        }}
        handleIndicatorStyle={{
          backgroundColor: isDarkColorScheme ? "#FAFAFA" : "#9BA2AE", // translates to foreground
        }}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        index={0}
      >
        <BottomSheetView className="p-6 pt-2">
          <View className="relative flex flex-row items-center justify-center">
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                bottomSheetModalRef.current?.dismiss();
              }}
              className="absolute -left-4 p-4"
            >
              <XIcon className="text-muted-foreground" width={24} height={24} />
            </TouchableOpacity>
            <Text className="text-2xl font-semibold2 text-muted-foreground">
              Add Description
            </Text>
          </View>
          <BottomSheetTextInput
            placeholder="Sats for Satoshi"
            className="text-foreground border-transparent bg-transparent text-center my-16 p-3 border text-2xl leading-[1.25] font-semibold2"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={save}
            autoFocus
          />
          <Button size="lg" onPress={save}>
            <Text>Save</Text>
          </Button>
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
  const [text, setText] = React.useState(amount);
  const [inputMode, setInputMode] = React.useState<"sats" | "fiat">("sats");

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
    Toast.show({
      type: "error",
      text1: `Maximum amount is ${new Intl.NumberFormat().format(MAX_SATS_THRESHOLD)} sats`,
    });
  }, []);

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

  return (
    <View className="flex-1 flex flex-col gap-2">
      <View className="flex-1 flex flex-col">
        <View className="flex-1 flex items-center justify-center">
          {/* TODO: Cover only min and only max cases */}
          {text &&
            min &&
            max &&
            (Number(amount) > max || Number(amount) < min) && (
              <Text className="text-destructive">
                Between ₿ {new Intl.NumberFormat().format(min)} and ₿{" "}
                {new Intl.NumberFormat().format(max)}
              </Text>
            )}
        </View>
        <View className="flex-[2] w-full flex flex-col items-center justify-center gap-2">
          <View className="flex flex-row items-center justify-center gap-2">
            <Text
              className={cn(
                "text-muted-foreground font-semibold2 leading-[1.5]",
                formattedText.length > 10 ? "text-4xl" : "text-5xl",
                !text && "text-muted",
              )}
            >
              {inputMode === "sats" ? "₿" : symbol}
            </Text>
            <Text
              className={cn(
                "text-foreground font-semibold2 leading-[1.5]",
                formattedText.length > 10 ? "text-4xl" : "text-5xl",
                !text && "text-muted",
              )}
            >
              {text ? formattedText : inputMode === "sats" ? "0" : "0.00"}
            </Text>
          </View>
          {fiatCurrency && (
            <Pressable onPress={toggleInputMode}>
              <View className="flex flex-row gap-2 items-center justify-center">
                <Text className="text-muted-foreground text-3xl font-semibold2">
                  {inputMode === "fiat"
                    ? "₿ " + new Intl.NumberFormat().format(+amount)
                    : getFiatAmount?.(+amount) || ""}
                </Text>
                <SwapIcon
                  className="text-muted-foreground"
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
