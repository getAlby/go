import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef } from "react";
import { FlatList, Platform, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { ChevronDownIcon, WalletIcon, XIcon } from "~/components/Icons";
import { Text } from "~/components/ui/text";
import { DEFAULT_WALLET_NAME } from "~/lib/constants";
import { useAppStore, type Wallet } from "~/lib/state/appStore";
import { useThemeColor } from "~/lib/useThemeColor";
import { cn } from "~/lib/utils";

interface WalletSwitcherProps {
  selectedWalletId: number;
  wallets: Wallet[];
}

export function WalletSwitcher({
  selectedWalletId,
  wallets,
}: WalletSwitcherProps) {
  const { foreground, background, mutedForeground } = useThemeColor(
    "foreground",
    "background",
    "mutedForeground",
  );
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const openSheet = useCallback(() => {
    if (wallets.length > 1) {
      bottomSheetModalRef.current?.present();
    }
  }, [wallets.length]);

  const selectedWallet = useMemo(
    () => wallets.find((w, i) => i === selectedWalletId),
    [wallets, selectedWalletId],
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
      />
    ),
    [foreground],
  );

  if (wallets.length <= 1) {
    return;
  }

  return (
    <>
      <TouchableOpacity
        onPress={openSheet}
        className="flex flex-row items-center justify-center gap-2 mb-4 px-4"
      >
        <WalletIcon width={16} height={16} className="text-muted-foreground" />
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className={cn(
            Platform.select({
              ios: "ios:text-base ios:sm:text-lg",
              android: "android:text-base",
            }),
            "text-muted-foreground font-medium2",
          )}
        >
          {selectedWallet?.name || DEFAULT_WALLET_NAME}
        </Text>
        {wallets.length > 1 && (
          <ChevronDownIcon className="text-muted-foreground" />
        )}
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
        <BottomSheetView className="p-6 pt-2 max-h-[50vh]">
          <View className="relative flex flex-row items-center justify-center mb-4">
            <TouchableOpacity
              onPress={() => {
                bottomSheetModalRef.current?.dismiss();
              }}
              className="absolute -left-4 p-4"
            >
              <XIcon className="text-muted-foreground" width={24} height={24} />
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
              Switch Wallet
            </Text>
          </View>
          <FlatList
            className="mt-4"
            data={wallets}
            renderItem={({ item: wallet, index }) => {
              const active = index === selectedWalletId;

              return (
                <TouchableOpacity
                  onPress={() => {
                    if (index !== selectedWalletId) {
                      useAppStore.getState().setSelectedWalletId(index);
                      Toast.show({
                        type: "success",
                        text1: `Switched wallet to ${wallet.name || DEFAULT_WALLET_NAME}`,
                        position: "top",
                      });
                      bottomSheetModalRef.current?.dismiss();
                    }
                  }}
                  className={cn(
                    "flex flex-row items-center justify-between px-6 py-4 mb-2 rounded-2xl border-[3px] bg-transparent",
                    active ? "border-primary" : "border-transparent",
                  )}
                >
                  <View className="flex flex-row gap-4 items-center flex-shrink">
                    <WalletIcon
                      className={cn(
                        active
                          ? "text-secondary-foreground"
                          : "text-muted-foreground",
                      )}
                      width={24}
                      height={24}
                    />
                    <Text
                      className={cn(
                        Platform.select({
                          ios: "ios:text-lg ios:sm:text-xl",
                          android: "android:text-lg",
                        }),
                        "pr-16",
                        active ? "font-semibold2" : "font-medium2",
                      )}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {wallet.name || DEFAULT_WALLET_NAME}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}
