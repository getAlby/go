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
import {
  Keyboard,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Contact from "~/components/Contact";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import { PasteLineIcon, XIcon } from "~/components/Icons";
import Loading from "~/components/Loading";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { initiatePaymentFlow } from "~/lib/initiatePaymentFlow";
import { useAppStore } from "~/lib/state/appStore";
import { useThemeColor } from "~/lib/useThemeColor";
import { cn } from "~/lib/utils";

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
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const { primary, background, mutedForeground, foreground } = useThemeColor(
    "primary",
    "background",
    "mutedForeground",
    "foreground",
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        style={{ backgroundColor: foreground }}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.3}
        pressBehavior="close"
        onPress={Keyboard.dismiss}
      />
    ),
    [foreground],
  );

  const save = () => {
    setContactName(input);
    if (Keyboard.isVisible()) {
      Keyboard.dismiss();
    }
    bottomSheetModalRef.current?.dismiss();
  };

  const isIOS = Platform.OS === "ios";
  const Wrapper = isIOS ? React.Fragment : DismissableKeyboardView;

  return (
    <>
      <Checkbox
        isChecked={!!contactName}
        onPress={() => {
          if (contactName) {
            setInput("");
            setContactName("");
          } else {
            if (Keyboard.isVisible()) {
              Keyboard.dismiss();
            }
            bottomSheetModalRef.current?.present();
          }
        }}
        className="flex flex-row items-center justify-center px-12 py-2 gap-2"
      >
        <Text className="text-secondary-foreground font-medium2">
          Add to Contacts
        </Text>
      </Checkbox>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        backgroundStyle={{
          backgroundColor: background,
          borderRadius: 24,
        }}
        handleIndicatorStyle={{
          backgroundColor: mutedForeground,
        }}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
      >
        <BottomSheetView className="p-6 pt-2">
          <Wrapper>
            <View className="relative flex flex-row items-center justify-center">
              <TouchableOpacity
                onPress={() => {
                  if (Keyboard.isVisible()) {
                    Keyboard.dismiss();
                  }
                  bottomSheetModalRef.current?.dismiss();
                }}
                className="absolute -left-4 p-4"
              >
                <XIcon
                  className="text-muted-foreground"
                  width={24}
                  height={24}
                />
              </TouchableOpacity>
              <Text
                className={cn(
                  Platform.select({
                    ios: "ios:text-xl ios:sm:text-2xl",
                    android: "android:text-xl",
                  }),
                  "font-semibold2 text-secondary-foreground",
                )}
              >
                Add to Contacts
              </Text>
            </View>
            {isIOS ? (
              <BottomSheetTextInput
                placeholder="Satoshi Nakamoto"
                className="text-foreground placeholder:text-muted border-transparent bg-transparent text-center my-16 p-3 border ios:text-xl ios:sm:text-2xl !leading-[1.25] font-semibold2 caret-primary"
                placeholderClassName="text-muted"
                selectionColor={primary}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={save}
                autoFocus
              />
            ) : (
              <Input
                placeholder="Satoshi Nakamoto"
                className="text-foreground border-0 border-transparent bg-transparent text-center my-16 p-3 android:text-xl font-semibold2"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={save}
                autoFocus
              />
            )}
            <Button size="lg" onPress={save} disabled={!input}>
              <Text>Save</Text>
            </Button>
          </Wrapper>
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
    const result = await initiatePaymentFlow(keyboardText, "");
    if (contactName && result) {
      useAppStore.getState().addAddressBookEntry({
        name: contactName,
        lightningAddress: keyboardText,
      });
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
          <View className="flex-1 flex flex-col gap-8">
            <View className="flex items-center justify-center mt-6 px-12 relative">
              <Input
                className="text-center border-transparent bg-transparent ios:text-2xl android:text-xl !leading-[1.25] font-semibold2 w-full"
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
                <ContactInput
                  contactName={contactName}
                  setContactName={setContactName}
                  lnAddress={keyboardText}
                />
              )}
            <View className="flex-1 gap-4">
              <Text className="ios:text-xl android:text-lg text-center font-semibold2">
                Address Book
              </Text>
              {filteredAddressBookEntries.length > 0 ? (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  className="flex-1 flex flex-col"
                >
                  {filteredAddressBookEntries.map((addressBookEntry, index) => (
                    <React.Fragment key={index}>
                      <Contact
                        name={addressBookEntry.name}
                        lnAddress={addressBookEntry.lightningAddress}
                      />
                    </React.Fragment>
                  ))}
                </ScrollView>
              ) : (
                <Text className="text-secondary-foreground text-center">
                  No matching entries.
                </Text>
              )}
            </View>
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
