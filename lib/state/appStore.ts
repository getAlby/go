import { create } from "zustand";
import { NWCClient } from "@getalby/sdk/dist/NWCClient";
import { nwc } from "@getalby/sdk";
import { secureStorage } from "lib/secureStorage";

interface AppState {
  readonly nwcClient: NWCClient | undefined;
  readonly lightningAddress: string;
  setNWCClient: (nwcClient: NWCClient | undefined) => void;
  setNostrWalletConnectUrl(nostrWalletConnectUrl: string): void;
  disconnectWallet(): void;
  setLightningAddress(lightningAddress: string): void;
}

const nostrWalletConnectUrlKey = "nostrWalletConnectUrl";
const lightningAddressKey = "lightningAddress";

export const useAppStore = create<AppState>()((set) => ({
  nwcClient: getNWCClient(),
  lightningAddress: secureStorage.getItem(lightningAddressKey) || "",
  setNWCClient: (nwcClient) => set({ nwcClient }),
  disconnectWallet: () => {
    secureStorage.removeItem(nostrWalletConnectUrlKey);
    set({ nwcClient: undefined });
  },
  setNostrWalletConnectUrl: (nostrWalletConnectUrl) => {
    secureStorage.setItem(nostrWalletConnectUrlKey, nostrWalletConnectUrl);
  },
  setLightningAddress: (lightningAddress) => {
    secureStorage.setItem(lightningAddressKey, lightningAddress);
    set({ lightningAddress });
  },
}));

let client: nwc.NWCClient | undefined;
function getNWCClient(): nwc.NWCClient | undefined {
  if (client) {
    return client;
  }
  const nostrWalletConnectUrl = secureStorage.getItem(nostrWalletConnectUrlKey);
  if (!nostrWalletConnectUrl) {
    console.log("No nostrWalletConnectUrl set");
    return undefined;
  }
  client = new nwc.NWCClient({
    nostrWalletConnectUrl,
  });
  return client;
}
