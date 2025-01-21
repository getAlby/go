import { nwc } from "@getalby/sdk";
import { Platform } from "react-native";
import { IS_EXPO_GO, NOSTR_API_URL } from "~/lib/constants";
import { errorToast } from "~/lib/errorToast";
import { computeSharedSecret, getConversationKey } from "~/lib/sharedSecret";
import { useAppStore } from "~/lib/state/appStore";
import { storeWalletInfo } from "~/lib/walletInfo";

export async function registerWalletNotifications(
  nwcUrl: string,
  walletId: number,
  walletName?: string,
) {
  if (IS_EXPO_GO || !nwcUrl) {
    return;
  }

  const nwcClient = new nwc.NWCClient({
    nostrWalletConnectUrl: nwcUrl,
  });

  const walletServiceInfo = await nwcClient.getWalletServiceInfo();
  const isNip44 = walletServiceInfo.versions.includes("1.0");

  const pushToken = useAppStore.getState().expoPushToken;
  if (!pushToken) {
    errorToast(new Error("Push token is not set"));
    return;
  }

  const body = {
    pushToken,
    relayUrl: nwcClient.relayUrl,
    connectionPubkey: nwcClient.publicKey,
    walletPubkey: nwcClient.walletPubkey,
    isIOS: Platform.OS === "ios",
    ...(isNip44 ? { version: "1.0" } : {}),
  };

  try {
    const response = await fetch(`${NOSTR_API_URL}/nip47/notifications/push`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const responseData = await response.json();
      useAppStore.getState().updateWallet(
        {
          pushId: responseData.subscriptionId,
        },
        walletId,
      );
    } else {
      new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const walletData = {
      name: walletName ?? "",
      sharedSecret: isNip44
        ? getConversationKey(nwcClient.walletPubkey, nwcClient.secret ?? "")
        : computeSharedSecret(nwcClient.walletPubkey, nwcClient.secret ?? ""),
      id: walletId,
      version: isNip44 ? "1.0" : "0.0",
    };

    try {
      await storeWalletInfo(nwcClient.publicKey, walletData);
    } catch (storageError) {
      console.error(storageError);
      errorToast(new Error("Failed to save wallet data"));
    }
  } catch (error) {
    errorToast(error);
  }
}

export async function deregisterWalletNotifications(pushId?: string) {
  if (IS_EXPO_GO || !pushId) {
    return;
  }
  try {
    const response = await fetch(`${NOSTR_API_URL}/subscriptions/${pushId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      errorToast(
        new Error("Failed to deregister push notification subscription"),
      );
    }
  } catch (error) {
    errorToast(error);
  }
}
