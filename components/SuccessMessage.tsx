import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { openURL } from "expo-linking";
import React, { useCallback, useRef } from "react";
import { TouchableOpacity, View } from "react-native";
import { ChevronDownIcon } from "~/components/Icons";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { LNURLPaymentSuccessAction } from "~/lib/lnurl";
import { useThemeColor } from "~/lib/useThemeColor";

interface SuccessMessageProps {
  lnurlSuccessAction?: LNURLPaymentSuccessAction;
}

export function SuccessMessage({ lnurlSuccessAction }: SuccessMessageProps) {
  const { foreground, background, mutedForeground } = useThemeColor(
    "foreground",
    "background",
    "mutedForeground",
  );
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        style={{ backgroundColor: foreground }}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.3}
        pressBehavior="close"
      />
    ),
    [foreground],
  );

  if (!lnurlSuccessAction) {
    return;
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => bottomSheetModalRef.current?.present()}
        className="flex flex-row items-center justify-center gap-2 px-12 py-4"
      >
        <Text
          ellipsizeMode="tail"
          className="text-muted-foreground font-medium2 text-xl"
        >
          Success Message
        </Text>
        <ChevronDownIcon className="text-muted-foreground" />
      </TouchableOpacity>

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
        <BottomSheetView className="p-4 pt-0">
          <View className="flex flex-col mt-2 gap-2 items-center">
            <Text className="text-muted-foreground text-center font-semibold2">
              Message From Receiver
            </Text>
            {lnurlSuccessAction.tag === "message" && (
              <Text className="text-center text-xl font-medium2">
                {lnurlSuccessAction.message}
              </Text>
            )}
            {lnurlSuccessAction.tag === "url" && (
              <>
                {lnurlSuccessAction.description && (
                  <Text className="px-6 text-center text-xl font-medium2">
                    {lnurlSuccessAction.description}
                  </Text>
                )}
                {lnurlSuccessAction.url && (
                  <Button
                    variant="secondary"
                    onPress={() => openURL(lnurlSuccessAction.url ?? "")}
                  >
                    <Text>Open Link</Text>
                  </Button>
                )}
              </>
            )}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}
