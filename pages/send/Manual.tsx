import { LN_ADDRESS_REGEX } from "@getalby/lightning-tools/lnurl";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import Loading from "~/components/Loading";
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
  const [isSubmitting, setSubmitting] = React.useState(false);

  const submitKeyboardText = async () => {
    setSubmitting(true);
    try {
      const result = await initiatePaymentFlow(keyboardText, "");
      if (result && addToContacts) {
        useAppStore.getState().addAddressBookEntry({
          name: contactName,
          lightningAddress: keyboardText,
        });
      }
    } catch (error) {
      console.error("Payment failed:", error);
      errorToast(error);
    }
    setSubmitting(false);
  };

  return (
    <>
      <Screen title="Manual Entry" />
      <DismissableKeyboardView>
        <View className="flex-1 flex flex-col">
          <View className="flex-1 flex flex-col gap-6 p-6">
            <View className="flex items-center justify-center mt-8 gap-6">
              <Text className="text-muted-foreground text-center">
                Type or paste a Lightning Address, lightning invoice or LNURL.
              </Text>
              <Input
                className="border-transparent bg-transparent native:text-2xl font-semibold2"
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
              <ScrollView className="flex-1 flex flex-col mt-2 opacity-75">
                {addressBookEntries
                  .filter(
                    (entry) =>
                      !keyboardText ||
                      entry.lightningAddress?.includes(keyboardText) ||
                      entry.name
                        ?.toLowerCase()
                        .includes(keyboardText.toLowerCase()),
                  )
                  .map((addressBookEntry, index) => (
                    <TouchableOpacity
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
                      className="mb-2"
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
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            )}
          </View>
          <View className="p-6 flex flex-col gap-4">
            <View>
              {LN_ADDRESS_REGEX.test(keyboardText) &&
                !addressBookEntries.some(
                  (entry) => entry.lightningAddress === keyboardText,
                ) && (
                  <View className="flex flex-row items-center justify-center gap-2">
                    <Checkbox
                      aria-labelledby="add-to-contacts"
                      checked={addToContacts}
                      onCheckedChange={setAddToContacts}
                    />
                    <Label
                      nativeID="add-to-contacts"
                      onPress={() => setAddToContacts(!addToContacts)}
                    >
                      <Text className="text-muted-foreground font-medium2">
                        Add to contacts
                      </Text>
                    </Label>
                  </View>
                )}
              {addToContacts && keyboardText.includes("@") && (
                <View>
                  <Label
                    nativeID="name"
                    className="self-start justify-self-start text-muted-foreground mb-1"
                  >
                    Name
                  </Label>
                  <Input
                    autoFocus
                    placeholder="Satoshi Nakamoto"
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
            </View>
            <Button
              onPress={submitKeyboardText}
              disabled={!keyboardText || isSubmitting}
              size="lg"
              className="flex flex-row gap-2"
            >
              {isSubmitting && <Loading className="text-primary-foreground" />}
              <Text>Next</Text>
            </Button>
          </View>
        </View>
      </DismissableKeyboardView>
    </>
  );
}
