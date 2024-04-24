import { BarCodeScanningResult, Camera } from "expo-camera";
import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useAppStore } from "lib/state/appStore";
import { lnurl } from "lib/lnurl";
import { Invoice } from "@getalby/lightning-tools";

export function Send() {
  const [isScanning, setScanning] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const [preimage, setPreimage] = React.useState("");
  const [invoice, setInvoice] = React.useState("");

  async function scan() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setScanning(status === "granted");
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
        <Text className="">{decodedInvoice.satoshi} sats</Text>

        <Pressable className="mt-4 p-4 bg-green-300" onPress={pay}>
          <Text className="">Pay</Text>
        </Pressable>
        <Pressable
          className="mt-4 p-4 bg-green-300"
          onPress={() => setInvoice("")}
        >
          <Text className="">Cancel</Text>
        </Pressable>
      </>
    );
  }

  return (
    <>
      <Text className="">Pay</Text>
      {isScanning && (
        <Camera
          onBarCodeScanned={handleBarCodeScanned}
          style={{ flex: 1, width: "100%" }}
        />
      )}
      {!isScanning && (
        <Pressable className="mt-4 p-4 bg-green-300" onPress={scan}>
          <Text className="">Scan</Text>
        </Pressable>
      )}
      <Pressable className="mt-4 p-4 bg-green-300" onPress={paste}>
        <Text className="">Paste</Text>
      </Pressable>
    </>
  );
}
