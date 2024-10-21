import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { lnurl, LNURLWithdrawServiceResponse } from "lib/lnurl";
import React, { useEffect } from "react";
import { View } from "react-native";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import { DualCurrencyInput } from "~/components/DualCurrencyInput";
import { ClipboardPaste } from "~/components/Icons";
import Loading from "~/components/Loading";
import QRCodeScanner from "~/components/QRCodeScanner";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { errorToast } from "~/lib/errorToast";
import { useAppStore } from "~/lib/state/appStore";

export function Withdraw() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const getFiatAmount = useGetFiatAmount();
  const [isLoading, setLoading] = React.useState(false);
  const [loadingConfirm, setLoadingConfirm] = React.useState(false);
  const [startScanning, setStartScanning] = React.useState(false);

  const [valueSat, setValueSat] = React.useState("");
  const [lnurlDetails, setLnurlDetails] =
    React.useState<LNURLWithdrawServiceResponse>();

  // Delay starting the QR scanner if url has valid lnurl withdraw info
  useEffect(() => {
    if (url) {
      (async () => {
        const result = await loadWithdrawal(url);
        // Delay the camera to show the error message
        if (!result) {
          setTimeout(() => {
            setStartScanning(true);
          }, 2000);
        }
      })();
    } else {
      setStartScanning(true);
    }
  }, [url]);

  async function paste() {
    let clipboardText;
    try {
      clipboardText = await Clipboard.getStringAsync();
    } catch (error) {
      console.error("Failed to read clipboard", error);
      return;
    }
    loadWithdrawal(clipboardText);
  }

  const handleScanned = (data: string) => {
    return loadWithdrawal(data);
  };

  async function loadWithdrawal(text: string): Promise<boolean> {
    if (!text) {
      errorToast(new Error("Your clipboard is empty."));
      return false;
    }

    text = text.toLowerCase();

    console.log("loading withdrawal", text);
    const originalText = text;
    setLoading(true);
    try {
      if (text.startsWith("lightning:")) {
        text = text.substring("lightning:".length);
      }

      const lnurlValue = lnurl.findLnurl(text);
      console.log("Checked lnurl value", text, lnurlValue);
      if (lnurlValue) {
        const lnurlDetails = await lnurl.getDetails(lnurlValue);

        if (lnurlDetails.tag !== "withdrawRequest") {
          throw new Error("LNURL tag " + lnurlDetails.tag + " not supported");
        }

        setLnurlDetails(lnurlDetails);
        setValueSat(
          (lnurlDetails.maxWithdrawable &&
            Math.floor(+lnurlDetails.maxWithdrawable / 1000).toString()) ||
            ""
        );
        return true;
      } else {
        throw new Error("Invalid LNURL");
      }
    } catch (error) {
      console.error("failed to load withdraw info", originalText, error);
      errorToast(error);
    } finally {
      setLoading(false);
    }

    return false;
  }

  async function confirm() {
    try {
      if (!lnurlDetails) return;

      if (Number(valueSat) < lnurlDetails.minWithdrawable) {
        throw new Error(`Amount below minimum limit of ${lnurlDetails.minWithdrawable} sats`);
      }
      if (Number(valueSat) > lnurlDetails.maxWithdrawable) {
        throw new Error(`Amount exceeds maximum limit of ${lnurlDetails.maxWithdrawable} sats.`);
      }

      setLoadingConfirm(true);

      const nwcClient = useAppStore.getState().nwcClient;
      if (!nwcClient) {
        throw new Error("NWC client not connected");
      }
      const response = await nwcClient.makeInvoice({
        amount: parseInt(valueSat) * 1000,
        description: lnurlDetails.defaultDescription,
      });

      const url = new URL(lnurlDetails.callback);
      url.searchParams.append("k1", lnurlDetails.k1);
      url.searchParams.append("pr", response.invoice);

      const withdrawResponse = await fetch(url.toString());
      const data = await withdrawResponse.json();

      if (data.status.toUpperCase() === "OK") {
        router.dismissAll();
        router.navigate({
          pathname: "/receive/success",
          params: { invoice: response.invoice },
        });
      } else {
        throw new Error(data.reason);
      }
    } catch (error) {
      console.error(error);
      errorToast(error);
    } finally {
      setLoadingConfirm(false);
    }
  }

  console.log(lnurlDetails)

  return (
    <>
      <Screen title="Withdraw" />
      {isLoading && (
        <View className="flex-1 flex flex-col items-center justify-center">
          <Loading className="text-primary-foreground" />
        </View>
      )}
      {!isLoading && (
        <>
          {!lnurlDetails && (
            <>
              <QRCodeScanner
                onScanned={handleScanned}
                startScanning={startScanning}
              />
              <View className="flex flex-row items-stretch justify-center gap-4 p-6">
                <Button
                  onPress={paste}
                  variant="secondary"
                  className="flex flex-col gap-2 flex-1"
                >
                  <ClipboardPaste className="text-secondary-foreground" />
                  <Text numberOfLines={1}>Paste</Text>
                </Button>
              </View>
            </>
          )}
          {lnurlDetails &&
            (lnurlDetails.minWithdrawable == lnurlDetails.maxWithdrawable ? (
              <>
                <View className="flex-1 justify-center items-center gap-8 p-6">
                  <View className="flex flex-col gap-2">
                    <View className="flex flex-row items-center justify-center gap-2">
                      <Text className="text-5xl font-bold2 text-foreground">
                        {new Intl.NumberFormat().format(
                          Math.floor(lnurlDetails.minWithdrawable / 1000)
                        )}
                      </Text>
                      <Text className="text-3xl font-bold2 text-muted-foreground">
                        sats
                      </Text>
                    </View>
                    {getFiatAmount && (
                      <Text className="text-center text-muted-foreground text-3xl font-semibold2">
                        {getFiatAmount(
                          Math.floor(lnurlDetails.minWithdrawable / 1000)
                        )}
                      </Text>
                    )}
                  </View>
                  <View className="flex flex-col gap-2 justify-center items-center">
                    <Text className="text-muted-foreground text-center font-semibold2">
                      Description
                    </Text>
                    <Text className="text-center text-foreground text-2xl font-medium2">
                      {lnurlDetails.defaultDescription}
                    </Text>
                  </View>
                </View>
                <View className="p-6">
                  <Button
                    size="lg"
                    className="flex flex-row gap-2"
                    onPress={confirm}
                    disabled={loadingConfirm}
                  >
                    {loadingConfirm && (
                      <Loading className="text-primary-foreground" />
                    )}
                    <Text>Confirm Withdrawal</Text>
                  </Button>
                </View>
              </>
            ) : (
              <DismissableKeyboardView>
                <View className="flex-1 flex flex-col">
                  <View className="flex-1 h-full flex flex-col justify-center gap-5 p-3">
                    <DualCurrencyInput
                      amount={valueSat}
                      setAmount={setValueSat}
                      autoFocus
                    />
                    <View className="flex flex-col gap-2 justify-center items-center">
                      <Text className="text-muted-foreground text-center font-semibold2">
                        Description
                      </Text>
                      <Text className="text-center text-foreground text-2xl font-medium2">
                        {lnurlDetails.defaultDescription}
                      </Text>
                    </View>
                  </View>
                  <View className="m-6">
                    <Button
                      size="lg"
                      className="flex flex-row gap-2"
                      onPress={confirm}
                      disabled={loadingConfirm}
                    >
                      {loadingConfirm && (
                        <Loading className="text-primary-foreground" />
                      )}
                      <Text>Confirm Withdrawal</Text>
                    </Button>
                  </View>
                </View>
              </DismissableKeyboardView>
            ))}
        </>
      )}
    </>
  );
}