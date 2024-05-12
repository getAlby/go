import { Link, Stack, router } from "expo-router";
import { Pressable, View } from "react-native";
import { PlusCircle } from "~/components/Icons";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";

export function AddressBook() {
  const addressBookEntries = useAppStore((store) => store.addressBookEntries);
  return (
    <View className="flex-1 flex flex-col p-3 gap-3">
      <Stack.Screen
        options={{
          title: "Address Book",
        }}
      />
      {addressBookEntries.map((addressBookEntry, index) => (
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
        >
          <Card className="w-full">
            <CardHeader className="w-full">
              <CardTitle>
                {addressBookEntry.name || addressBookEntry.lightningAddress}
              </CardTitle>
              <CardDescription>
                {addressBookEntry.lightningAddress}
              </CardDescription>
            </CardHeader>
          </Card>
        </Pressable>
      ))}
      <Link href="/settings/address-book/new" asChild>
        <Pressable>
          <Card className="w-full">
            <CardHeader className="w-full">
              <View className="flex flex-row items-center gap-2">
                <PlusCircle className="text-primary" />
                <Text className="font-bold">Add Address</Text>
              </View>
            </CardHeader>
          </Card>
        </Pressable>
      </Link>
    </View>
  );
}
