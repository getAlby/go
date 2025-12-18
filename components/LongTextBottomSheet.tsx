import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useRef } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { XIcon } from "~/components/Icons";
import { Text } from "~/components/ui/text";
import { useThemeColor } from "~/lib/useThemeColor";

interface LongTextBottomSheetProps {
  title: string;
  content?: string;
  children?: React.ReactNode;
}

export function LongTextBottomSheet({
  title,
  content,
  children,
}: LongTextBottomSheetProps) {
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

  if (!content) {
    return;
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => bottomSheetModalRef.current?.present()}
        className="flex items-center justify-center gap-2"
      >
        <Text className="text-center text-muted-foreground font-medium2 sm:text-lg">
          {title}
        </Text>
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          className="text-center text-xl font-semibold2"
        >
          {content}
        </Text>
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
        <BottomSheetView className="p-6 pt-2">
          <View className="relative flex flex-row items-center justify-center mb-4">
            <TouchableOpacity
              onPress={() => {
                bottomSheetModalRef.current?.dismiss();
              }}
              className="absolute -left-4 p-4"
            >
              <XIcon className="text-muted-foreground" width={24} height={24} />
            </TouchableOpacity>
            <Text className="text-xl sm:text-2xl font-semibold2 text-secondary-foreground">
              {title}
            </Text>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 flex flex-col max-h-[50vh]"
          >
            {children ? (
              children
            ) : (
              <Text className="text-center sm:text-lg text-secondary-foreground p-3">
                {content}
              </Text>
            )}
          </ScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}
