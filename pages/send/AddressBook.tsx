import { Link, router } from "expo-router";
import { Pressable, ScrollView, TouchableOpacity, View } from "react-native";
import { TrashIcon } from "~/components/Icons";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";

export function AddressBook() {
  const addressBookEntries = useAppStore((store) => store.addressBookEntries);

  return (
    <View className="flex-1 flex flex-col p-6 gap-3">
      <Screen title="Address Book" />
      <ScrollView className="flex-1 flex flex-col">
        {addressBookEntries.length > 0 ? (
          addressBookEntries.map((addressBookEntry, index) => (
            <Pressable
              key={index}
              onPress={() => {
                router.dismissAll();
                router.navigate({
                  pathname: "/send",
                  params: {
                    url: addressBookEntry.lightningAddress,
                  },
                });
              }}
              className="mb-4"
            >
              <Card>
                <CardContent className="flex flex-row items-center gap-4">
                  <View className="h-10 w-10 flex items-center justify-center rounded-full bg-accent">
                    <Text className="text-foreground text-base font-bold">
                      {addressBookEntry.name?.[0]?.toUpperCase() ||
                        addressBookEntry.lightningAddress?.[0]?.toUpperCase() ||
                        "SN"}
                    </Text>
                  </View>
                  <View className="flex flex-1 flex-col">
                    <CardTitle>
                      {addressBookEntry.name ||
                        addressBookEntry.lightningAddress}
                    </CardTitle>
                    <CardDescription>
                      {addressBookEntry.lightningAddress}
                    </CardDescription>
                  </View>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      useAppStore.getState().removeAddressBookEntry(index);
                    }}
                  >
                    <TrashIcon className="text-destructive" />
                  </TouchableOpacity>
                </CardContent>
              </Card>
            </Pressable>
          ))
        ) : (
          <Text className="text-lg">No entries yet.</Text>
        )}
      </ScrollView>

      <Link href="/settings/address-book/new" asChild>
        <Button size="lg">
          <Text>Create Contact</Text>
        </Button>
      </Link>
    </View>
  );
}
