import { LN_ADDRESS_REGEX } from "@getalby/lightning-tools/lnurl";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as Clipboard from "expo-clipboard";
import React, { useCallback, useRef, useState } from "react";
import { Keyboard, ScrollView, TouchableOpacity, View } from "react-native";
import Contact from "~/components/Contact";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import {
  AddUserIcon,
  CheckIcon,
  PasteLineIcon,
  XIcon,
} from "~/components/Icons";
import Loading from "~/components/Loading";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { errorToast } from "~/lib/errorToast";
import { initiatePaymentFlow } from "~/lib/initiatePaymentFlow";
import { useAppStore } from "~/lib/state/appStore";
import { useColorScheme } from "~/lib/useColorScheme";

interface ContactInputProps {
  lnAddress: string;
  contactName: string;
  setContactName: (contactName: string) => void;
}

function ContactInput({
  lnAddress,
  contactName,
  setContactName,
}: ContactInputProps) {
  const match = lnAddress.trim().match(LN_ADDRESS_REGEX);
  const [input, setInput] = useState(
    contactName ||
      (match?.[1] ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : ""),
  );
  const { isDarkColorScheme } = useColorScheme();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        style={{ backgroundColor: isDarkColorScheme ? "#FFFFFF" : "#09090B" }} // translates to background
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={isDarkColorScheme ? 0.3 : 0.7}
        pressBehavior="close"
        onPress={Keyboard.dismiss}
      />
    ),
    [isDarkColorScheme],
  );

  const save = () => {
    setContactName(input);
    Keyboard.dismiss();
    bottomSheetModalRef.current?.dismiss();
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          if (contactName) {
            setInput("");
            setContactName("");
          } else {
            bottomSheetModalRef.current?.present();
          }
        }}
        className="flex flex-row items-center justify-center px-12 py-4"
      >
        {contactName ? (
          <View className="bg-primary px-1 rounded-lg aspect-square flex items-center justify-center">
            <CheckIcon className="text-white" width={12} height={12} />
          </View>
        ) : (
          <AddUserIcon className="text-muted-foreground" />
        )}
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          className="text-muted-foreground font-medium2 text-lg text-center px-2"
        >
          Add to Contacts
        </Text>
      </TouchableOpacity>

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
              Add to Contacts
            </Text>
          </View>
          <BottomSheetTextInput
            placeholder="Satoshi Nakamoto"
            className="text-foreground placeholder:text-muted-foreground/30 border-transparent bg-transparent text-center my-16 p-3 border text-2xl leading-[1.25] font-semibold2 caret-primary"
            selectionColor={"hsl(47 100% 50%)"} // translates to primary
            value={input}
            onChangeText={setInput}
            onSubmitEditing={save}
            autoFocus
            multiline
          />
          <Button size="lg" onPress={save} disabled={!input}>
            <Text>Save</Text>
          </Button>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}

export function Address() {
  const [keyboardText, setKeyboardText] = useState("");
  const [contactName, setContactName] = useState("");
  const addressBookEntries = useAppStore((store) => store.addressBookEntries);
  const [isSubmitting, setSubmitting] = React.useState(false);

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await initiatePaymentFlow(keyboardText, "");
      if (result) {
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

  const filteredAddressBookEntries = React.useMemo(() => {
    const loweredKeyboardText = keyboardText.toLowerCase();
    return addressBookEntries.filter(
      (entry) =>
        !keyboardText ||
        entry.lightningAddress?.includes(keyboardText) ||
        entry.name?.toLowerCase().includes(loweredKeyboardText),
    );
  }, [addressBookEntries, keyboardText]);

  const paste = async () => {
    let clipboardText;
    try {
      clipboardText = await Clipboard.getStringAsync();
    } catch (error) {
      console.error("Failed to read clipboard", error);
      return;
    }
    setKeyboardText(clipboardText);
  };

  return (
    <>
      <Screen title="Send to Address" />
      <DismissableKeyboardView>
        <View className="flex-1 flex flex-col">
          <View className="flex-1 flex flex-col gap-6">
            <View className="flex items-center justify-center gap-6 mt-6 px-12 relative">
              <Input
                className="text-center border-transparent bg-transparent native:text-3xl font-semibold2 w-full"
                placeholder="hello@getalby.com"
                value={keyboardText}
                onChangeText={setKeyboardText}
                autoCapitalize="none"
                inputMode="email"
                returnKeyType="done"
                autoFocus={!addressBookEntries.length}
              />
              <TouchableOpacity
                onPress={paste}
                className="absolute right-4 p-4"
              >
                <PasteLineIcon className="text-muted-foreground" />
              </TouchableOpacity>
            </View>
            {LN_ADDRESS_REGEX.test(keyboardText) &&
              !addressBookEntries.some(
                (entry) => entry.lightningAddress === keyboardText,
              ) && (
                <View className="flex flex-row items-center justify-center gap-2">
                  <ContactInput
                    contactName={contactName}
                    setContactName={setContactName}
                    lnAddress={keyboardText}
                  />
                </View>
              )}
            <Text className="text-xl text-center font-semibold2 text-muted-foreground mt-4">
              Address Book
            </Text>
            {filteredAddressBookEntries.length > 0 ? (
              <ScrollView className="flex-1 flex flex-col">
                {filteredAddressBookEntries.map((addressBookEntry, index) => (
                  <Contact
                    name={addressBookEntry.name}
                    lnAddress={addressBookEntry.lightningAddress}
                  />
                ))}
              </ScrollView>
            ) : (
              <Text className="text-muted-foreground text-center">
                No matching entries.
              </Text>
            )}
          </View>
          <View className="p-6 flex flex-col gap-4">
            <Button
              onPress={onSubmit}
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
