import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { ChevronDownIcon, WalletIcon } from "~/components/Icons";
import { Text } from "~/components/ui/text";
import { DEFAULT_WALLET_NAME } from "~/lib/constants";
import { useAppStore, type Wallet } from "~/lib/state/appStore";
import { useColorScheme } from "~/lib/useColorScheme";
import { cn } from "~/lib/utils";

interface WalletSwitcherProps {
  selectedWalletId: number;
  wallets: Wallet[];
}

export function WalletSwitcher({
  selectedWalletId,
  wallets,
}: WalletSwitcherProps) {
  const { isDarkColorScheme } = useColorScheme();
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
        style={{ backgroundColor: isDarkColorScheme ? "#FFFFFF" : "#09090B" }} // translates to background
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={isDarkColorScheme ? 0.3 : 0.7}
        pressBehavior="close"
      />
    ),
    [isDarkColorScheme],
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
        <WalletIcon className="text-muted-foreground" />
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="text-muted-foreground font-medium2 text-xl"
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
          backgroundColor: isDarkColorScheme ? "#09090B" : "#FFFFFF", // translates to muted
        }}
        handleIndicatorStyle={{
          backgroundColor: isDarkColorScheme ? "#FAFAFA" : "#1F2937", // translates to foreground
        }}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
      >
        <BottomSheetView className="p-4 pt-0">
          <Text className="text-lg text-center font-bold2 my-2">
            Switch Wallet
          </Text>
          <FlatList
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
                    "flex flex-row items-center justify-between p-6 rounded-2xl border-2",
                    active ? "border-primary" : "border-transparent",
                  )}
                >
                  <View className="flex flex-row gap-4 items-center flex-shrink">
                    <WalletIcon className="text-muted-foreground" />
                    <Text
                      className={cn(
                        "text-xl pr-16",
                        active && "font-semibold2",
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
