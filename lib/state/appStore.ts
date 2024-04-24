import { create } from "zustand";
import { NWCClient } from "@getalby/sdk/dist/NWCClient";
import { nwc } from "@getalby/sdk";
import { secureStorage } from "lib/secureStorage";

interface AppState {
  nwcClient: NWCClient | undefined;
  setNWCClient: (nwcClient: NWCClient | undefined) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  nwcClient: getNWCClient(),
  setNWCClient: (nwcClient) => set({ nwcClient }),
}));

let client: nwc.NWCClient | undefined;
function getNWCClient(): nwc.NWCClient | undefined {
  if (client) {
    return client;
  }
  const nostrWalletConnectUrl = secureStorage.getItem("nostrWalletConnectUrl");
  if (!nostrWalletConnectUrl) {
    console.log("No nostrWalletConnectUrl set");
    return undefined;
  }
  client = new nwc.NWCClient({
    nostrWalletConnectUrl,
  });
  return client;
}
