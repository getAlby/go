import { Platform } from "react-native";
import Toast from "react-native-toast-message";
import { IS_EXPO_GO, NOSTR_API_URL } from "~/lib/constants";
import { errorToast } from "~/lib/errorToast";
import { useAppStore, Wallet } from "~/lib/state/appStore";
import {
  computeSharedSecret,
  getConversationKey,
  getPubkeyFromNWCUrl,
} from "~/lib/utils";
import { removeWalletInfo, storeWalletInfo } from "~/lib/walletInfo";

export async function registerWalletNotifications(
  wallet: Wallet,
  walletId: number,
) {
  if (!(wallet.nwcCapabilities || []).includes("notifications")) {
    Toast.show({
      type: "info",
      text1: `${wallet.name} does not have notifications capability`,
    });
  }

  const nwcClient = useAppStore.getState().getNWCClient(walletId);

  if (IS_EXPO_GO || !nwcClient) {
    return;
  }

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
      name: wallet.name ?? "",
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

export async function deregisterWalletNotifications(
  wallet: Wallet,
  walletId: number,
) {
  if (IS_EXPO_GO || !wallet.pushId) {
    return;
  }
  try {
    // TODO: wallets with the same secret if added will have the same token,
    // hence deregistering one might make others not work but will show
    // as ON because their push ids are not removed from the wallet store
    const response = await fetch(
      `${NOSTR_API_URL}/subscriptions/${wallet.pushId}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) {
      errorToast(
        new Error("Failed to deregister push notification subscription"),
      );
    }
    useAppStore.getState().updateWallet(
      {
        pushId: "",
      },
      walletId,
    );
    const pubkey = getPubkeyFromNWCUrl(wallet.nostrWalletConnectUrl ?? "");
    if (pubkey) {
      await removeWalletInfo(pubkey, walletId);
    }
  } catch (error) {
    errorToast(error);
  }
}
