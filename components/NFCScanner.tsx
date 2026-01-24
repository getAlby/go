import NfcManager, { Ndef } from "react-native-nfc-manager";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";

interface NFCScannerProps {
  onScanned: (data: string) => Promise<boolean>;
  startScanning: boolean;
}

function NFCScanner({ onScanned, startScanning = true }: NFCScannerProps) {
  const [isScanning, setScanning] = useState(startScanning);
  const [isSupported, setSupported] = useState(false);

  useEffect(() => {
    const initNfc = async () => {
      const supported = await NfcManager.isSupported();
      setSupported(supported);
      if (supported) {
        await NfcManager.start();
      }
    };
    initNfc();

    return () => {
      NfcManager.unregisterTagEvent();
    };
  }, []);

  useEffect(() => {
    if (isScanning && isSupported) {
      // @ts-ignore - registerTagEvent callback type mismatch in library
      NfcManager.registerTagEvent((tag: any) => {
        if (tag.ndefMessage && tag.ndefMessage.length > 0) {
          const record = tag.ndefMessage[0];
          if (
            record.tnf === Ndef.TNF_WELL_KNOWN &&
            record.type[0] === Ndef.RTD_TEXT
          ) {
            const payload = Ndef.text.decodePayload(
              new Uint8Array(record.payload),
            );
            if (
              payload.startsWith("lightning:") ||
              payload.startsWith("lnbc")
            ) {
              onScanned(payload).then((result) => setScanning(!result));
            }
          }
        }
      });
    } else {
      NfcManager.unregisterTagEvent();
    }
  }, [isScanning, isSupported, onScanned]);

  if (!isSupported) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>NFC not supported on this device</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="mb-4">
        Tap your phone to an NFC tag with a Lightning invoice
      </Text>
      <Button onPress={() => setScanning(!isScanning)}>
        <Text>{isScanning ? "Stop Scanning" : "Start Scanning"}</Text>
      </Button>
    </View>
  );
}

export default NFCScanner;
