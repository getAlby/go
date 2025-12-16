import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import {
  lnurl as lnurlLib,
  type LNURLWithdrawServiceResponse,
} from "lib/lnurl";
import React, { useEffect } from "react";
import { View } from "react-native";
import { DualCurrencyInput } from "~/components/DualCurrencyInput";
import { PasteIcon } from "~/components/Icons";
import Loading from "~/components/Loading";
import QRCodeScanner from "~/components/QRCodeScanner";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { WalletSwitcher } from "~/components/WalletSwitcher";
import { errorToast } from "~/lib/errorToast";
import { useAppStore } from "~/lib/state/appStore";

export function Withdraw() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const [isLoading, setLoading] = React.useState(false);
  const [loadingConfirm, setLoadingConfirm] = React.useState(false);
  const [startScanning, setStartScanning] = React.useState(false);
  const wallets = useAppStore((store) => store.wallets);
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);

  const [valueSat, setValueSat] = React.useState("");
  const [lnurlDetails, setLnurlDetails] =
    React.useState<LNURLWithdrawServiceResponse>();

  const isAmountInvalid = React.useMemo(() => {
    if (!lnurlDetails) {
      return true;
    }
    const min = Math.floor(lnurlDetails.minWithdrawable / 1000);
    const max = Math.floor(lnurlDetails.maxWithdrawable / 1000);

    return Number(valueSat) < min || Number(valueSat) > max;
  }, [valueSat, lnurlDetails]);

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

    console.info("loading withdrawal", text);
    const originalText = text;
    setLoading(true);
    try {
      if (text.startsWith("lightning:")) {
        text = text.substring("lightning:".length);
      }
      let lnurl;
      if (text.startsWith("lnurlw:")) {
        lnurl = text;
      } else {
        lnurl = lnurlLib.findLnurl(text);
      }
      console.info("Checked lnurl value", text, lnurl);
      if (lnurl) {
        const lnurlDetails = await lnurlLib.getDetails(lnurl);

        if (lnurlDetails.tag !== "withdrawRequest") {
          throw new Error("LNURL tag " + lnurlDetails.tag + " not supported");
        }

        setLnurlDetails(lnurlDetails);
        setValueSat(
          (lnurlDetails.maxWithdrawable &&
            Math.floor(+lnurlDetails.maxWithdrawable / 1000).toString()) ||
            "",
        );
        return true;
      } else {
        throw new Error("Invalid LNURL");
      }
    } catch (error) {
      console.error("failed to load withdraw info", originalText, error);
      errorToast(error, "Failed to load withdraw info");
    } finally {
      setLoading(false);
    }

    return false;
  }

  async function confirm() {
    try {
      if (!lnurlDetails) {
        return;
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
      errorToast(error, "Failed to withdraw");
    } finally {
      setLoadingConfirm(false);
    }
  }

  return (
    <>
      <Screen title="Redeem" animation="slide_from_left" />
      <View className="flex-1">
        {isLoading && (
          <View className="flex-1 flex flex-col items-center justify-center">
            <Loading className="text-primary-foreground" />
          </View>
        )}
        {!isLoading && (
          <>
            {!lnurlDetails && (
              <>
                <View className="p-4">
                  <Text className="text-center text-secondary-foreground font-medium2">
                    Scan a LNURL QR code to withdraw
                  </Text>
                </View>
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
                    <PasteIcon
                      width={32}
                      height={32}
                      className="text-muted-foreground"
                    />
                    <Text numberOfLines={1}>Paste</Text>
                  </Button>
                </View>
              </>
            )}
            {lnurlDetails && (
              <View className="flex-1 flex flex-col">
                <DualCurrencyInput
                  amount={valueSat}
                  setAmount={setValueSat}
                  description={lnurlDetails.defaultDescription}
                  min={Math.floor(lnurlDetails.minWithdrawable / 1000)}
                  max={Math.floor(lnurlDetails.maxWithdrawable / 1000)}
                  isAmountReadOnly={
                    lnurlDetails.minWithdrawable ===
                    lnurlDetails.maxWithdrawable
                  }
                  isDescriptionReadOnly
                />
                <View className="p-6">
                  <WalletSwitcher
                    selectedWalletId={selectedWalletId}
                    wallets={wallets}
                  />
                  <Button
                    size="lg"
                    className="flex flex-row gap-2"
                    onPress={confirm}
                    disabled={loadingConfirm || isAmountInvalid}
                  >
                    {loadingConfirm && (
                      <Loading className="text-primary-foreground" />
                    )}
                    <Text>Confirm Withdrawal</Text>
                  </Button>
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </>
  );
}
