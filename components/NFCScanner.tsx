import React from "react";
import { ActivityIndicator, Modal, Platform, View } from "react-native";
import { NfcIcon } from "~/components/Icons";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { readNfcTag } from "~/hooks/useNfc";

interface NFCScannerProps {
  onScanned: (data: string) => Promise<boolean>;
}

/**
 * NFCScanner shows a modal prompt asking the user to tap an NFC tag.
 * On iOS the system sheet is shown automatically; on Android we show our own
 * overlay so the user knows to tap.
 */
export function NFCScanner({ onScanned }: NFCScannerProps) {
  const [scanning, setScanning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const cancelRef = React.useRef<(() => void) | null>(null);

  async function startScan() {
    setError(null);
    setScanning(true);
    try {
      const [promise, cancel] = readNfcTag();
      cancelRef.current = cancel;
      const data = await promise;
      cancelRef.current = null;
      if (data) {
        await onScanned(data);
      } else {
        setError("No payment data found on this NFC tag.");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to read NFC tag.";
      setError(msg);
    } finally {
      setScanning(false);
    }
  }

  function cancelScan() {
    cancelRef.current?.();
    cancelRef.current = null;
    setScanning(false);
  }

  return (
    <>
      {/* Android scanning overlay */}
      {Platform.OS === "android" && (
        <Modal
          transparent
          animationType="fade"
          visible={scanning}
          onRequestClose={cancelScan}
        >
          <View className="flex-1 bg-black/60 items-center justify-center p-8">
            <View className="bg-background rounded-2xl p-8 items-center gap-6 w-full max-w-sm">
              <NfcIcon width={64} height={64} className="text-primary" />
              <Text className="ios:text-xl android:text-lg font-medium2 text-center">
                Ready to Scan
              </Text>
              <ActivityIndicator size="large" />
              <Text className="text-secondary-foreground text-center">
                Hold your device near the NFC tag to receive payment info.
              </Text>
              <Button
                variant="secondary"
                onPress={cancelScan}
                className="w-full"
              >
                <Text>Cancel</Text>
              </Button>
            </View>
          </View>
        </Modal>
      )}

      {/* Trigger button */}
      <Button
        variant="secondary"
        className="flex-1 flex flex-col gap-2"
        onPress={startScan}
        disabled={scanning}
      >
        <NfcIcon width={32} height={32} className="text-muted-foreground" />
        <Text numberOfLines={1}>{scanning ? "Scanning…" : "NFC"}</Text>
      </Button>

      {/* Inline error */}
      {!!error && (
        <View className="px-6 pb-2">
          <Text className="text-destructive text-center text-sm">{error}</Text>
        </View>
      )}
    </>
  );
}
