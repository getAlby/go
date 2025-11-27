import { darken, lighten } from "colorizr";
import { router } from "expo-router";
import pastellify from "pastellify";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { AddUserIcon, TrashLineIcon } from "~/components/Icons";
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
            <View key={index} className="px-6 py-2">
              <View className="flex flex-row items-center gap-4">
                <View
                  className="h-12 w-12 flex items-center justify-center rounded-full"
                  style={{
                    backgroundColor: lighten(
                      pastellify(addressBookEntry.lightningAddress, {
                        toCSS: true,
                      }),
                      10,
                    ),
                  }}
                >
                  <Text
                    className="text-2xl font-semibold2"
                    style={{
                      color: darken(
                        pastellify(addressBookEntry.lightningAddress, {
                          toCSS: true,
                        }),
                        30,
                      ),
                    }}
                  >
                    {addressBookEntry.name?.[0]?.toUpperCase() ||
                      addressBookEntry.lightningAddress?.[0]?.toUpperCase() ||
                      "SN"}
                  </Text>
                </View>
                <View className="flex flex-1 flex-col">
                  <Text className="text-xl font-semibold2">
                    {addressBookEntry.name || addressBookEntry.lightningAddress}
                  </Text>
                  <Text className="text-muted-foreground">
                    {addressBookEntry.lightningAddress}
                  </Text>
                </View>
                <TouchableOpacity
                  className="p-4"
                  onPress={() => {
                    useAppStore.getState().removeAddressBookEntry(index);
                  }}
                >
                  <TrashLineIcon className="text-muted-foreground" />
                </TouchableOpacity>
              </View>
            </View>
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
