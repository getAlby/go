import { nwc } from "@getalby/sdk";
import { NWCClient, Nip47Capability } from "@getalby/sdk/dist/NWCClient";
import { create } from "zustand";
import { secureStorage } from "../secureStorage";

interface AppState {
  readonly unlocked: boolean;
  readonly nwcClient: NWCClient | undefined;
  readonly fiatCurrency: string;
  readonly selectedWalletId: number;
  readonly wallets: Wallet[];
  readonly addressBookEntries: AddressBookEntry[];
  readonly isSecurityEnabled: boolean;
  readonly isNotificationsEnabled: boolean | null;
  readonly isOnboarded: boolean;
  readonly expoPushToken: string;
  readonly theme?: Theme;
  readonly balanceDisplayMode: BalanceDisplayMode;
  setUnlocked: (unlocked: boolean) => void;
  setTheme: (theme: Theme) => void;
  setBalanceDisplayMode: (balanceDisplayMode: BalanceDisplayMode) => void;
  setOnboarded: (isOnboarded: boolean) => void;
  setExpoPushToken: (expoPushToken: string) => void;
  getNWCClient: (walletId: number) => NWCClient | undefined;
  setNWCClient: (nwcClient: NWCClient | undefined) => void;
  updateWallet(wallet: Partial<Wallet>, walletId?: number): void;
  removeWallet(walletId?: number): void;
  setFiatCurrency(fiatCurrency: string): void;
  setSelectedWalletId(walletId: number): void;
  setSecurityEnabled(securityEnabled: boolean): void;
  setNotificationsEnabled(notificationsEnabled: boolean | null): void;
  addWallet(wallet: Wallet): void;
  addAddressBookEntry(entry: AddressBookEntry): void;
  removeAddressBookEntry: (index: number) => void;
  reset(): void;
  getLastAlbyPayment(): Date | null;
  updateLastAlbyPayment(): void;
}

const walletKeyPrefix = "wallet";
const addressBookEntryKeyPrefix = "addressBookEntry";
const selectedWalletIdKey = "selectedWalletId";
const fiatCurrencyKey = "fiatCurrency";
const hasOnboardedKey = "hasOnboarded";
const expoPushTokenKey = "expoPushToken";
const lastAlbyPaymentKey = "lastAlbyPayment";
const themeKey = "theme";
const balanceDisplayModeKey = "balanceDisplayMode";
const isSecurityEnabledKey = "isSecurityEnabled";
const isNotificationsEnabledKey = "isNotificationsEnabled";
export const lastActiveTimeKey = "lastActiveTime";

export type BalanceDisplayMode = "sats" | "fiat" | "hidden";
export type Theme = "light" | "dark";

export type Wallet = {
  name?: string;
  nostrWalletConnectUrl?: string;
  lightningAddress?: string;
  nwcCapabilities?: Nip47Capability[];
  pushId?: string;
};

type AddressBookEntry = {
  name?: string;
  lightningAddress?: string;
};

const getWalletKey = (walletId: number) => {
  return walletKeyPrefix + walletId;
};

const getAddressBookEntryKey = (addressBookEntryId: number) => {
  return addressBookEntryKeyPrefix + addressBookEntryId;
};

function loadWallets(): Wallet[] {
  const wallets: Wallet[] = [];
  for (let i = 0; ; i++) {
    const walletJSON = secureStorage.getItem(getWalletKey(i));
    if (!walletJSON) {
      break;
    }
    wallets.push(JSON.parse(walletJSON));
  }
  return wallets;
}

function loadAddressBookEntries(): AddressBookEntry[] {
  const addressBookEntries: AddressBookEntry[] = [];
  for (let i = 0; ; i++) {
    const addressBookEntryJSON = secureStorage.getItem(
      getAddressBookEntryKey(i),
    );
    if (!addressBookEntryJSON) {
      break;
    }
    addressBookEntries.push(JSON.parse(addressBookEntryJSON));
  }
  return addressBookEntries;
}

export const useAppStore = create<AppState>()((set, get) => {
  const updateWallet = (walletUpdate: Partial<Wallet>, walletId?: number) => {
    walletId = walletId ?? get().selectedWalletId;
    const wallets = [...get().wallets];

    const wallet: Wallet = {
      ...(wallets[walletId] || {}),
      ...walletUpdate,
    };
    secureStorage.setItem(getWalletKey(walletId), JSON.stringify(wallet));
    wallets[walletId] = wallet;
    set({
      wallets,
    });
  };

  const removeWallet = (walletId?: number) => {
    const wallets = [...get().wallets];
    if (wallets.length <= 1) {
      // set to initial wallet status
      secureStorage.removeItem(hasOnboardedKey);
      secureStorage.removeItem(getWalletKey(0));
      secureStorage.setItem(selectedWalletIdKey, "0");
      set({
        isOnboarded: false,
        wallets: [],
        selectedWalletId: 0,
        nwcClient: undefined,
      });
      return;
    }
    const selectedWalletId = get().selectedWalletId;
    walletId = walletId ?? selectedWalletId;

    // move existing wallets down one
    for (let i = walletId; i < wallets.length - 1; i++) {
      const nextWallet = secureStorage.getItem(getWalletKey(i + 1));
      if (!nextWallet) {
        throw new Error("Next wallet not found");
      }
      secureStorage.setItem(getWalletKey(i), nextWallet);
    }

    secureStorage.removeItem(getWalletKey(wallets.length - 1));

    if (walletId === selectedWalletId) {
      get().setSelectedWalletId(0);
    } else if (walletId < selectedWalletId) {
      get().setSelectedWalletId(selectedWalletId - 1);
    }

    set({
      wallets: wallets.filter((_, i) => i !== walletId),
    });
  };

  const removeAddressBookEntry = (index: number) => {
    const addressBookEntries = [...get().addressBookEntries];
    if (index < 0 || index >= addressBookEntries.length) {
      return;
    }

    addressBookEntries.splice(index, 1);

    for (let i = index; i < addressBookEntries.length; i++) {
      secureStorage.setItem(
        getAddressBookEntryKey(i),
        JSON.stringify(addressBookEntries[i]),
      );
    }

    secureStorage.removeItem(getAddressBookEntryKey(addressBookEntries.length));

    set({ addressBookEntries });
  };

  const initialSelectedWalletId = +(
    secureStorage.getItem(selectedWalletIdKey) || "0"
  );

  const isSecurityEnabled =
    secureStorage.getItem(isSecurityEnabledKey) === "true";

  const theme = (secureStorage.getItem(themeKey) as Theme) || null;
  const balanceDisplayMode =
    (secureStorage.getItem(balanceDisplayModeKey) as BalanceDisplayMode) ||
    "sats";

  const initialWallets = loadWallets();
  return {
    unlocked: !isSecurityEnabled,
    addressBookEntries: loadAddressBookEntries(),
    wallets: initialWallets,
    nwcClient: getNWCClient(initialSelectedWalletId),
    fiatCurrency: secureStorage.getItem(fiatCurrencyKey) || "",
    isSecurityEnabled,
    isNotificationsEnabled: secureStorage.getItem(isNotificationsEnabledKey)
      ? secureStorage.getItem(isNotificationsEnabledKey) === "true"
      : null,
    theme,
    balanceDisplayMode,
    isOnboarded: secureStorage.getItem(hasOnboardedKey) === "true",
    selectedWalletId: initialSelectedWalletId,
    expoPushToken: secureStorage.getItem(expoPushTokenKey) || "",
    updateWallet,
    removeWallet,
    removeAddressBookEntry,
    getNWCClient,
    setUnlocked: (unlocked) => {
      set({ unlocked });
    },
    setTheme: (theme) => {
      secureStorage.setItem(themeKey, theme);
      set({ theme });
    },
    setBalanceDisplayMode: (balanceDisplayMode) => {
      secureStorage.setItem(balanceDisplayModeKey, balanceDisplayMode);
      set({ balanceDisplayMode });
    },
    setOnboarded: (isOnboarded) => {
      if (isOnboarded) {
        secureStorage.setItem(hasOnboardedKey, "true");
      } else {
        secureStorage.removeItem(hasOnboardedKey);
      }
      set({ isOnboarded });
    },
    setExpoPushToken: (expoPushToken) => {
      secureStorage.setItem(expoPushTokenKey, expoPushToken);
      set({ expoPushToken });
    },
    setNWCClient: (nwcClient) => set({ nwcClient }),
    setSecurityEnabled: (isEnabled) => {
      secureStorage.setItem(isSecurityEnabledKey, isEnabled.toString());
      set({
        isSecurityEnabled: isEnabled,
        ...(!isEnabled ? { unlocked: true } : {}),
      });
    },
    setNotificationsEnabled: (isEnabled) => {
      if (isEnabled === null) {
        secureStorage.removeItem(isNotificationsEnabledKey);
      } else {
        secureStorage.setItem(isNotificationsEnabledKey, isEnabled.toString());
      }
      set({
        isNotificationsEnabled: isEnabled,
      });
    },
    setFiatCurrency: (fiatCurrency) => {
      secureStorage.setItem(fiatCurrencyKey, fiatCurrency);
      set({ fiatCurrency });
    },
    setSelectedWalletId: (selectedWalletId) => {
      set({
        selectedWalletId,
        nwcClient: getNWCClient(selectedWalletId),
      });
      secureStorage.setItem(selectedWalletIdKey, selectedWalletId.toString());
    },
    addWallet: (wallet: Wallet) => {
      const currentWallets = get().wallets;
      const newWalletId = currentWallets.length;
      secureStorage.setItem(getWalletKey(newWalletId), JSON.stringify(wallet));
      set({
        wallets: [...currentWallets, wallet],
        selectedWalletId: newWalletId,
      });
    },
    addAddressBookEntry: (addressBookEntry: AddressBookEntry) => {
      const currentAddressBookEntries = get().addressBookEntries;
      const newAddressBookEntryId = currentAddressBookEntries.length;
      secureStorage.setItem(
        getAddressBookEntryKey(newAddressBookEntryId),
        JSON.stringify(addressBookEntry),
      );
      set({
        addressBookEntries: [...currentAddressBookEntries, addressBookEntry],
      });
    },
    getLastAlbyPayment: () => {
      const result = secureStorage.getItem(lastAlbyPaymentKey);
      if (result) {
        return new Date(result);
      }
      return null;
    },
    updateLastAlbyPayment: () => {
      secureStorage.setItem(lastAlbyPaymentKey, new Date().toString());
    },
    reset() {
      // clear wallets
      for (let i = 0; i < get().wallets.length; i++) {
        secureStorage.removeItem(getWalletKey(i));
      }
      // clear address book
      for (let i = 0; i < get().addressBookEntries.length; i++) {
        secureStorage.removeItem(getAddressBookEntryKey(i));
      }

      // clear fiat currency
      secureStorage.removeItem(fiatCurrencyKey);

      // clear security enabled status
      secureStorage.removeItem(isSecurityEnabledKey);

      // clear onboarding status
      secureStorage.removeItem(hasOnboardedKey);

      // clear last alby payment date
      secureStorage.removeItem(lastAlbyPaymentKey);

      // set to initial wallet status
      secureStorage.setItem(selectedWalletIdKey, "0");

      // clear notifications enabled status
      secureStorage.removeItem(isNotificationsEnabledKey);

      // clear expo push notifications token
      secureStorage.removeItem(expoPushTokenKey);

      set({
        nwcClient: undefined,
        fiatCurrency: undefined,
        selectedWalletId: 0,
        wallets: [],
        addressBookEntries: [],
        isSecurityEnabled: false,
        isOnboarded: false,
      });
    },
  };
});

function getNWCClient(walletId: number): nwc.NWCClient | undefined {
  const walletJSON = secureStorage.getItem(getWalletKey(walletId));
  if (!walletJSON) {
    console.info("No wallet set", walletId);
    return undefined;
  }
  const wallet: Wallet = JSON.parse(walletJSON);
  if (!wallet.nostrWalletConnectUrl) {
    console.info("No wallet NWC URL set");
    return undefined;
  }

  return new nwc.NWCClient({
    nostrWalletConnectUrl: wallet.nostrWalletConnectUrl,
  });
}
