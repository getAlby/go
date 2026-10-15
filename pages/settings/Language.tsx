import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { CheckIcon } from "~/components/Icons";
import Screen from "~/components/Screen";
import { Text } from "~/components/ui/text";
import {
  getSystemLanguage,
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
} from "~/lib/i18n";
import { type AppLanguage, useAppStore } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";

export function Language() {
  const { t } = useTranslation();
  const language = useAppStore((store) => store.language);

  // single-choice list in the style of the fiat currency picker:
  // the selected row is highlighted and marked with a check
  const options: { value: AppLanguage; label: string; hint?: string }[] = [
    {
      value: "system",
      label: t("settings.language.systemDefault"),
      hint: LANGUAGE_LABELS[getSystemLanguage()],
    },
    ...SUPPORTED_LANGUAGES.map((supportedLanguage) => ({
      value: supportedLanguage,
      label: LANGUAGE_LABELS[supportedLanguage],
    })),
  ];

  const selectLanguage = (newLanguage: AppLanguage) => {
    if (newLanguage === language) {
      return;
    }
    useAppStore.getState().setLanguage(newLanguage);
    // the toast is shown in the newly selected language
    Toast.show({ type: "success", text1: t("settings.language.updated") });
  };

  return (
    <>
      <Screen title={t("settings.language.title")} />
      <View className="flex-1">
        <View className="px-8 my-6">
          <Text
            className={cn(
              Platform.select({
                ios: "ios:text-sm ios:sm:text-base",
                android: "android:text-sm",
              }),
              "text-center text-secondary-foreground",
            )}
          >
            {t("settings.language.description")}
          </Text>
        </View>
        <View className="flex flex-col px-6">
          {options.map((option) => {
            const isSelected = language === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                className={cn(
                  "p-4 flex flex-row items-center gap-4 rounded-2xl",
                  isSelected && "bg-muted",
                )}
                onPress={() => selectLanguage(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <View className="flex-1 flex flex-row items-center gap-4">
                  <Text
                    numberOfLines={1}
                    className={cn(
                      Platform.select({
                        ios: "ios:text-base ios:sm:text-lg",
                        android: "android:text-base",
                      }),
                      "font-medium2",
                    )}
                  >
                    {option.label}
                  </Text>
                  {option.hint && (
                    <Text
                      className={cn(
                        Platform.select({
                          ios: "ios:text-base ios:sm:text-lg",
                          android: "android:text-base",
                        }),
                        "font-medium2 text-muted-foreground",
                      )}
                    >
                      {option.hint}
                    </Text>
                  )}
                </View>
                {isSelected && (
                  <CheckIcon
                    className="text-foreground"
                    width={20}
                    height={20}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </>
  );
}
