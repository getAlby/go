import { BarCodeScanningResult, Camera } from "expo-camera";
import React, { useEffect } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useAppStore } from "lib/state/appStore";
import { lnurl } from "lib/lnurl";
import { Invoice } from "@getalby/lightning-tools";

export function Send() {
  const [isScanning, setScanning] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const [preimage, setPreimage] = React.useState("");
  const [invoice, setInvoice] = React.useState("");

  useEffect(() => {
    scan();
  }, []);

  async function scan() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setScanning(status === "granted");
  }

  function reset() {
    setInvoice("")
    setScanning(false);
    scan();
  }

  async function paste() {
    let clipboardText;
    try {
      clipboardText = await Clipboard.getStringAsync();
    } catch (error) {
      console.error("Failed to read clipboard", error);
      return;
    }
    loadPayment(clipboardText);
  }

  const handleBarCodeScanned = ({ data }: BarCodeScanningResult) => {
    setScanning((current) => {
      if (current === true) {
        loadPayment(data);
      }
      return false;
    });
    console.log(`Bar code with data ${data} has been scanned!`);
  };

  async function pay() {
    setLoading(true);
    try {
      const nwcClient = useAppStore.getState().nwcClient;
      if (!nwcClient) {
        throw new Error("NWC client not connected");
      }
      const response = await nwcClient.payInvoice({
        invoice,
      });

      setPreimage(response?.preimage);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  async function loadPayment(text: string) {
    setLoading(true);
    try {
      const lnurlValue = lnurl.findLnurl(text);
      if (lnurlValue) {
        const lnurlDetails = await lnurl.getDetails(lnurlValue);

        if (lnurlDetails.tag !== "payRequest") {
          throw new Error("LNURL tag " + lnurlDetails.tag + " not supported");
        }

        // TODO: allow user to enter these
        const callback = new URL(lnurlDetails.callback);
        callback.searchParams.append("amount", "1000");
        callback.searchParams.append("comment", "Test");
        callback.searchParams.append("payerdata", JSON.stringify({ test: 1 }));
        const lnurlPayInfo = await lnurl.getPayRequest(callback.toString());
        console.log("Got pay request", lnurlPayInfo.pr);
        text = lnurlPayInfo.pr;
      }

      setInvoice(text);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  if (isLoading) {
    return (
      <>
        <ActivityIndicator />
      </>
    );
  }

  if (preimage) {
    return (
      <>
        <Text className="">Paid! preimage: {preimage}</Text>
        <Pressable className="bg-primary rounded-lg p-3" onPress={reset}>
          <Text className="text-center text-white font-semibold">Start Over</Text>
        </Pressable>
      </>
    );
  }

  if (invoice) {
    const decodedInvoice = new Invoice({
      pr: invoice,
    });
    return (
      <>
        <Text className="">Confirm Payment</Text>
        <Text className="text-4xl">{decodedInvoice.satoshi} sats</Text>
        <View className="flex flex-row gap-3 justify-center items-center px-3 mt-3">
          <Pressable
            className="flex-1"
            onPress={() => setInvoice("")}
          >
            <Text className="text-center">Cancel</Text>
          </Pressable>
          <Pressable className="flex-1 bg-primary rounded-lg p-3" onPress={pay}>
            <Text className="text-center text-white font-semibold">Pay</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <>
      {isScanning && (<>
        <Camera
          onBarCodeScanned={handleBarCodeScanned}
          style={{ flex: 1, width: "100%" }}
        />
        <View className="absolute bottom-12 mx-auto z-10 flex flex-row gap-3">
          <Pressable className="bg-primary rounded-lg p-3" onPress={paste}>
            <Text className="text-white">Paste from Clipboard</Text>
          </Pressable>
          <Pressable className="bg-primary rounded-lg p-3" onPress={paste}>
            <Text className="text-white">Enter Manually</Text>
          </Pressable>
        </View>
      </>
      )}
      {!isScanning && (
        <>
          <Text className="mb-3">Camera Permissions Needed</Text>
          <Pressable className="bg-primary rounded-lg p-3" onPress={scan}>
            <Text className="text-white">Grant Permissions</Text>
          </Pressable>
        </>
      )}

    </>
  );
}
