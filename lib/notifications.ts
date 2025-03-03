import { Platform } from "react-native";
import { NOSTR_API_URL } from "~/lib/constants";
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
  try {
    if (!(wallet.nwcCapabilities || []).includes("notifications")) {
      throw new Error(`${wallet.name} does not have notifications capability`);
    }

    const nwcClient = useAppStore.getState().getNWCClient(walletId);
    if (!nwcClient) {
      return;
    }

    const walletServiceInfo = await nwcClient.getWalletServiceInfo();
    const isNip44 = walletServiceInfo.encryptions.includes("nip44_v2");

    const pushToken = useAppStore.getState().expoPushToken;
    if (!pushToken) {
      throw new Error("Push token is not set");
    }

    const body = {
      pushToken,
      relayUrl: nwcClient.relayUrl,
      connectionPubkey: nwcClient.publicKey,
      walletPubkey: nwcClient.walletPubkey,
      isIOS: Platform.OS === "ios",
      // This is for http-nostr to know the encryption
      // TODO: replace with nip44 flag
      ...(isNip44 ? { version: "1.0" } : {}),
    };

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
      // This is for Alby Go's notification service to know the encryption
      // "1.0" is nip44_v2, "0.0" is nip04
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
  if (!wallet.pushId) {
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
    // FIXME: if deregistering fails, app will keep receiving notifications from the server
    if (!response.ok) {
      throw new Error("Failed to deregister push notifications");
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
