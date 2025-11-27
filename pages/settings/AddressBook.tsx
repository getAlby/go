import { router } from "expo-router";
import { ScrollView, View } from "react-native";
import Contact from "~/components/Contact";
import { AddUserIcon } from "~/components/Icons";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";

export function AddressBook() {
  const addressBookEntries = useAppStore((store) => store.addressBookEntries);

  return (
    <View className="flex-1 flex flex-col gap-3">
      <Screen title="Address Book" />
      <ScrollView className="flex-1 flex flex-col mt-4">
        {addressBookEntries.length > 0 ? (
          addressBookEntries.map((addressBookEntry, index) => (
            <Contact
              name={addressBookEntry.name}
              lnAddress={addressBookEntry.lightningAddress}
              onDelete={() => {
                useAppStore.getState().removeAddressBookEntry(index);
              }}
            />
          ))
        ) : (
          <Text className="text-lg">No entries yet.</Text>
        )}
      </ScrollView>

      <View className="p-6">
        <Button
          variant="secondary"
          size="lg"
          onPress={() => {
            router.push("/settings/address-book/new");
          }}
          className="flex flex-row gap-2"
        >
          <AddUserIcon className="text-muted-foreground" />
          <Text className="text-muted-foreground">Create Contact</Text>
        </Button>
      </View>
    </View>
  );
}
