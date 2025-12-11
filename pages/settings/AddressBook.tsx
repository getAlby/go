import React from "react";
import { ScrollView, View } from "react-native";
import Contact from "~/components/Contact";
import Screen from "~/components/Screen";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";

export function AddressBook() {
  const addressBookEntries = useAppStore((store) => store.addressBookEntries);

  return (
    <View className="flex-1 bg-background">
      <Screen title="Address Book" />
      <ScrollView className="flex-1 flex flex-col mt-4">
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
          <Text className="text-lg">No entries yet.</Text>
        )}
      </ScrollView>
    </View>
  );
}
