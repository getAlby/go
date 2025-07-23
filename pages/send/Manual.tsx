import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Text } from "~/components/ui/text";
import { errorToast } from "~/lib/errorToast";
import { initiatePaymentFlow } from "~/lib/initiatePaymentFlow";
import { useAppStore } from "~/lib/state/appStore";

export function Manual() {
  const [keyboardText, setKeyboardText] = useState("");
  const [contactName, setContactName] = useState("");
  const [addToContacts, setAddToContacts] = React.useState(false);
  const addressBookEntries = useAppStore((store) => store.addressBookEntries);

  const submitKeyboardText = async () => {
    try {
      if (addToContacts) {
        useAppStore.getState().addAddressBookEntry({
          name: contactName,
          lightningAddress: keyboardText,
        });
      }
      await initiatePaymentFlow(keyboardText, "");
    } catch (error) {
      console.error("Payment failed:", error);
      errorToast(error);
    }
  };

  return (
    <>
      <Screen title="Manual Entry" />
      <DismissableKeyboardView>
        <View className="flex-1 h-full flex flex-col gap-5 p-6">
          <View className="flex items-center justify-center mt-8">
            <Text className="text-muted-foreground text-center">
              Type or paste a Lightning Address, lightning invoice or LNURL.
            </Text>
            <Input
              className="w-full text-center mt-6 border-transparent bg-transparent native:text-2xl font-semibold2"
              placeholder="hello@getalby.com"
              value={keyboardText}
              onChangeText={setKeyboardText}
              autoCapitalize="none"
              inputMode="email"
              returnKeyType="done"
              autoFocus={!addressBookEntries.length}
            />
          </View>
          {addressBookEntries.length > 0 && (
            <ScrollView className="flex-1 flex flex-col mt-8 opacity-75">
              {addressBookEntries
                .filter(
                  (entry) =>
                    !keyboardText ||
                    entry.lightningAddress?.includes(keyboardText) ||
                    entry.name?.includes(keyboardText),
                )
                .map((addressBookEntry, index) => (
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
                    <Card className="border-0 shadow-none">
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
                      </CardContent>
                    </Card>
                  </Pressable>
                ))}
            </ScrollView>
          )}
          {keyboardText.includes("@") &&
            !addressBookEntries.some(
              (entry) => entry.lightningAddress === keyboardText,
            ) && (
              <View className="flex items-center justify-center">
                <Text className="text-muted-foreground text-center flex flex-row gap-4">
                  <Checkbox
                    checked={addToContacts}
                    onCheckedChange={setAddToContacts}
                  />{" "}
                  <View>
                    <Text>Add to contacts</Text>
                  </View>
                </Text>
              </View>
            )}
          {addToContacts && (
            <View>
              <Label nativeID="name" className="self-start justify-self-start">
                Name
              </Label>
              <Input
                autoFocus
                placeholder="Satoshi"
                inputMode="email"
                className="w-full"
                value={contactName}
                onChangeText={setContactName}
                aria-labelledbyledBy="name"
                returnKeyType="done"
                // aria-errormessage="inputError"
              />
            </View>
          )}
          <Button
            onPress={submitKeyboardText}
            disabled={!keyboardText}
            size="lg"
          >
            <Text>Next</Text>
          </Button>
        </View>
      </DismissableKeyboardView>
    </>
  );
}
