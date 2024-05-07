import { create } from "zustand";
import { NWCClient, Nip47Capability } from "@getalby/sdk/dist/NWCClient";
import { nwc } from "@getalby/sdk";
import { secureStorage } from "lib/secureStorage";

interface AppState {
  readonly nwcClient: NWCClient | undefined;
  readonly lightningAddress: string;
  readonly fiatCurrency: string;
  readonly nwcCapabilities: Nip47Capability[];
  setNWCClient: (nwcClient: NWCClient | undefined) => void;
  setNostrWalletConnectUrl(nostrWalletConnectUrl: string): void;
  setNWCCapabilities(capabilities: Nip47Capability[]): void;
  disconnectWallet(): void;
  setLightningAddress(lightningAddress: string): void;
  setFiatCurrency(fiatCurrency: string): void;
}

const nostrWalletConnectUrlKey = "nostrWalletConnectUrl";
const lightningAddressKey = "lightningAddress";
const fiatCurrencyKey = "fiatCurrency";
const nwcCapabilitiesKey = "nwcCapabilities";

export const useAppStore = create<AppState>()((set) => ({
  nwcClient: getNWCClient(),
  lightningAddress: secureStorage.getItem(lightningAddressKey) || "",
  fiatCurrency: secureStorage.getItem(fiatCurrencyKey) || "",
  nwcCapabilities: JSON.parse(
    secureStorage.getItem(nwcCapabilitiesKey) || "[]"
  ),
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
  setFiatCurrency: (fiatCurrency) => {
    secureStorage.setItem(fiatCurrencyKey, fiatCurrency);
    set({ fiatCurrency });
  },
  setNWCCapabilities: (nwcCapabilities) => {
    secureStorage.setItem(nwcCapabilitiesKey, JSON.stringify(nwcCapabilities));
    set({ nwcCapabilities });
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
