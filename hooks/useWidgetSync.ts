import { useEffect, useRef } from "react";
import { AppState, Platform, type AppStateStatus } from "react-native";
import { DEFAULT_WALLET_NAME, IS_EXPO_GO } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";
import {
    buildWidgetSnapshotFromState,
    reloadAllWidgets,
    writeWalletList,
    writeWalletWidgetData,
    writeWidgetSnapshot,
    type WalletInfo,
    type WalletWidgetData,
} from "~/lib/widgets";
import { useBalance } from "./useBalance";
import { useGetFiatAmount } from "./useGetFiatAmount";
import { useTransactions } from "./useTransactions";

/**
 * Hook that syncs app state to iOS home screen widgets.
 * Observes balance, transactions, and settings changes.
 */
export function useWidgetSync() {
  const isWidgetsEnabled = useAppStore((store) => store.isWidgetsEnabled);
  const hideWidgetAmounts = useAppStore((store) => store.hideWidgetAmounts);
  const fiatCurrency = useAppStore((store) => store.fiatCurrency);
  const bitcoinDisplayFormat = useAppStore((store) => store.bitcoinDisplayFormat);
  const wallets = useAppStore((store) => store.wallets);
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const walletName = wallets[selectedWalletId]?.name;
  
  const { data: balance } = useBalance();
  const getFiatAmount = useGetFiatAmount();
  const { data: transactions } = useTransactions();
  
  // Track last written data to avoid unnecessary writes
  const lastSnapshotRef = useRef<string>("");
  const lastWalletListRef = useRef<string>("");

  // Refresh widgets when app enters foreground
  useEffect(() => {
    if (Platform.OS !== "ios" || IS_EXPO_GO || !isWidgetsEnabled) {
      return;
    }

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        // App entered foreground - refresh widgets to show latest data
        reloadAllWidgets();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isWidgetsEnabled]);

  // Write wallet list whenever wallets change (for widget configuration)
  useEffect(() => {
    if (Platform.OS !== "ios" || IS_EXPO_GO || !isWidgetsEnabled) {
      return;
    }

    // Build wallet list for widget configuration
    const walletList: WalletInfo[] = wallets.map((wallet, index) => ({
      id: String(index),
      name: wallet.name || DEFAULT_WALLET_NAME,
    }));

    const walletListJson = JSON.stringify(walletList);
    if (walletListJson !== lastWalletListRef.current) {
      lastWalletListRef.current = walletListJson;
      writeWalletList(walletList);
    }
  }, [wallets, isWidgetsEnabled]);

  // Write snapshot and per-wallet data whenever data changes
  useEffect(() => {
    // Skip on non-iOS or Expo Go
    if (Platform.OS !== "ios" || IS_EXPO_GO) {
      return;
    }

    // Skip if widgets are disabled
    if (!isWidgetsEnabled) {
      return;
    }

    // Get fiat rate from the getFiatAmount helper
    // We call it with 100M sats (1 BTC) to get the BTC price
    // Note: getFiatAmount expects sats, not msats!
    const btcPriceResult = getFiatAmount?.(100_000_000, false); // 1 BTC = 100,000,000 sats, no currency sign
    // Parse the number - handle both "90,047.00" (US) and "90 047,00" (EU) formats
    let fiatRate: number | undefined;
    if (btcPriceResult) {
      // Remove spaces and replace comma with period if it's the decimal separator
      let cleaned = btcPriceResult.replace(/\s/g, ""); // Remove spaces
      // If the string has a comma followed by exactly 2 digits at the end, it's a decimal comma
      if (/,\d{2}$/.test(cleaned)) {
        cleaned = cleaned.replace(/\./g, "").replace(",", "."); // Remove thousand dots, convert decimal comma
      } else {
        cleaned = cleaned.replace(/,/g, ""); // Remove thousand commas
      }
      fiatRate = parseFloat(cleaned);
    }

    // Get last transaction from the transactions array
    // transactions is an object with a transactions array
    const txList = transactions?.transactions;
    const lastTx = txList?.[0];
    const lastTransaction = lastTx ? {
      type: lastTx.type as "incoming" | "outgoing",
      amount: lastTx.amount,
      description: lastTx.description || lastTx.metadata?.comment || "",
      // settled_at is already a Unix timestamp in seconds
      settled_at: lastTx.settled_at,
    } : undefined;

    // Build snapshot (for backwards compatibility and Bitcoin Price widget)
    const snapshot = buildWidgetSnapshotFromState({
      widgetsEnabled: isWidgetsEnabled,
      hideAmounts: hideWidgetAmounts,
      useBitcoinSymbol: bitcoinDisplayFormat === "bip177",
      walletName,
      fiatCurrency,
      balanceMsats: balance?.balance,
      fiatRate,
      lastTransaction,
    });

    // Only write if snapshot changed
    const snapshotJson = JSON.stringify(snapshot);
    if (snapshotJson !== lastSnapshotRef.current) {
      lastSnapshotRef.current = snapshotJson;
      
      // Write main snapshot
      writeWidgetSnapshot(snapshot);
      
      // Write per-wallet data for the currently selected wallet
      // This allows widgets configured to show this wallet to display its data
      const balanceSats = balance?.balance !== undefined 
        ? Math.floor(balance.balance / 1000) 
        : undefined;
      
      const walletData: WalletWidgetData = {
        id: String(selectedWalletId),
        name: walletName || DEFAULT_WALLET_NAME,
        balanceSats,
        balanceFiat: balanceSats !== undefined && fiatRate !== undefined
          ? (balanceSats / 100_000_000) * fiatRate
          : undefined,
        lastTransaction: lastTransaction ? {
          type: lastTransaction.type,
          amountSats: Math.floor(Math.abs(lastTransaction.amount) / 1000),
          amountFiat: fiatRate !== undefined
            ? (Math.floor(Math.abs(lastTransaction.amount) / 1000) / 100_000_000) * fiatRate
            : undefined,
          description: lastTransaction.description || "",
          timestamp: lastTransaction.settled_at || Math.floor(Date.now() / 1000),
        } : undefined,
      };
      
      writeWalletWidgetData(String(selectedWalletId), walletData);
    }
  }, [
    isWidgetsEnabled,
    hideWidgetAmounts,
    bitcoinDisplayFormat,
    walletName,
    selectedWalletId,
    fiatCurrency,
    balance?.balance,
    getFiatAmount,
    transactions,
  ]);
}

/**
 * Component wrapper for the widget sync hook.
 * Use this in your layout to enable widget syncing.
 */
export function WidgetSync() {
  useWidgetSync();
  return null;
}
