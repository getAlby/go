import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import Contact from "~/components/Contact";
import Screen from "~/components/Screen";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";

export function AddressBook() {
  const { t } = useTranslation();
  const addressBookEntries = useAppStore((store) => store.addressBookEntries);

  return (
    <View className="flex-1">
      <Screen title={t("settings.addressBook.title")} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 flex flex-col mt-4"
      >
        {addressBookEntries.length > 0 ? (
          addressBookEntries.map((addressBookEntry, index) => (
            <React.Fragment key={index}>
              <Contact
                name={addressBookEntry.name}
                lnAddress={addressBookEntry.lightningAddress}
                onDelete={() => {
                  useAppStore.getState().removeAddressBookEntry(index);
                }}
              />
            </React.Fragment>
          ))
        ) : (
          <Text className="text-secondary-foreground text-center">
            {t("settings.addressBook.noEntries")}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
