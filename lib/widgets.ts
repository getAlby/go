import { NativeModules, Platform } from "react-native";
import { IS_EXPO_GO } from "./constants";

// Access the native module directly for widget data operations
const { ReactNativeHomeWidget } = NativeModules;

/**
 * Snapshot of data shared with iOS widgets via App Group UserDefaults.
 * This is serialized to JSON and read by the Swift widget extension.
 */
export interface WidgetSnapshot {
  // Settings
  widgetsEnabled: boolean;
  hideAmounts: boolean;
  useBitcoinSymbol: boolean; // true = ₿, false = sats
  
  // Wallet info
  walletName?: string;
  
  // Price data
  fiatCurrency: string;
  btcPriceInFiat?: number;
  
  // Balance data
  balanceSats?: number;
  balanceFiat?: number;
  
  // Last transaction
  lastTransaction?: {
    type: "incoming" | "outgoing";
    amountSats: number;
    amountFiat?: number;
    description: string;
    timestamp: number; // Unix timestamp in seconds
  };
  
  // Metadata
  updatedAt: number; // Unix timestamp in seconds
}

export interface BuildSnapshotParams {
  widgetsEnabled: boolean;
  hideAmounts: boolean;
  useBitcoinSymbol: boolean; // true = ₿ (bip177), false = sats
  walletName?: string;
  fiatCurrency: string;
  balanceMsats?: number;
  fiatRate?: number;
  lastTransaction?: {
    type: "incoming" | "outgoing";
    amount: number; // in msats
    description?: string;
    settled_at?: number;
  };
}

/**
 * Build a widget snapshot from app state.
 * Converts msats to sats and calculates fiat values.
 */
export function buildWidgetSnapshotFromState(params: BuildSnapshotParams): WidgetSnapshot {
  const {
    widgetsEnabled,
    hideAmounts,
    useBitcoinSymbol,
    walletName,
    fiatCurrency,
    balanceMsats,
    fiatRate,
    lastTransaction,
  } = params;

  const balanceSats = balanceMsats !== undefined ? Math.floor(balanceMsats / 1000) : undefined;
  const btcPriceInFiat = fiatRate;
  
  // Calculate fiat values
  let balanceFiat: number | undefined;
  if (balanceSats !== undefined && fiatRate !== undefined) {
    balanceFiat = (balanceSats / 100_000_000) * fiatRate;
  }

  // Build last transaction data
  let lastTx: WidgetSnapshot["lastTransaction"];
  if (lastTransaction) {
    const amountSats = Math.floor(Math.abs(lastTransaction.amount) / 1000);
    let amountFiat: number | undefined;
    if (fiatRate !== undefined) {
      amountFiat = (amountSats / 100_000_000) * fiatRate;
    }
    
    lastTx = {
      type: lastTransaction.type,
      amountSats,
      amountFiat,
      description: lastTransaction.description || "",
      timestamp: lastTransaction.settled_at || Math.floor(Date.now() / 1000),
    };
  }

  return {
    widgetsEnabled,
    hideAmounts,
    useBitcoinSymbol,
    walletName,
    fiatCurrency,
    btcPriceInFiat,
    balanceSats,
    balanceFiat,
    lastTransaction: lastTx,
    updatedAt: Math.floor(Date.now() / 1000),
  };
}

const WIDGET_SNAPSHOT_KEY = "alby_widget_snapshot";
const WIDGET_WALLETS_KEY = "alby_widget_wallets";

/**
 * Wallet info for widget configuration (wallet selection)
 */
export interface WalletInfo {
  id: string;
  name: string;
}

/**
 * Per-wallet data for widgets
 */
export interface WalletWidgetData {
  id: string;
  name: string;
  balanceSats?: number;
  balanceFiat?: number;
  lastTransaction?: {
    type: "incoming" | "outgoing";
    amountSats: number;
    amountFiat?: number;
    description: string;
    timestamp: number;
  };
}

/**
 * Write widget snapshot to shared App Group UserDefaults.
 * This makes data available to the iOS widget extension.
 */
export async function writeWidgetSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  if (Platform.OS !== "ios" || IS_EXPO_GO || !ReactNativeHomeWidget) {
    return;
  }

  try {
    const jsonString = JSON.stringify(snapshot);
    await ReactNativeHomeWidget.setWidgetData(WIDGET_SNAPSHOT_KEY, jsonString);
    
    // Reload all widget timelines to refresh the display
    await ReactNativeHomeWidget.reloadAllTimelines();
  } catch (error) {
    console.error("Failed to write widget snapshot:", error);
  }
}

/**
 * Write wallet list for widget configuration.
 * This allows users to select which wallet to show in the widget.
 */
export async function writeWalletList(wallets: WalletInfo[]): Promise<void> {
  if (Platform.OS !== "ios" || IS_EXPO_GO || !ReactNativeHomeWidget) {
    return;
  }

  try {
    const jsonString = JSON.stringify(wallets);
    await ReactNativeHomeWidget.setWidgetData(WIDGET_WALLETS_KEY, jsonString);
  } catch (error) {
    console.error("Failed to write wallet list:", error);
  }
}

/**
 * Write per-wallet data for widgets.
 * Each wallet's data is stored separately so widgets can show different wallets.
 */
export async function writeWalletWidgetData(walletId: string, data: WalletWidgetData): Promise<void> {
  if (Platform.OS !== "ios" || IS_EXPO_GO || !ReactNativeHomeWidget) {
    return;
  }

  try {
    const jsonString = JSON.stringify(data);
    await ReactNativeHomeWidget.setWidgetData(`alby_widget_wallet_${walletId}`, jsonString);
  } catch (error) {
    console.error("Failed to write wallet widget data:", error);
  }
}

/**
 * Reload all widget timelines to refresh the display.
 * This forces widgets to reload their data from shared storage.
 */
export async function reloadAllWidgets(): Promise<void> {
  if (Platform.OS !== "ios" || IS_EXPO_GO || !ReactNativeHomeWidget) {
    return;
  }

  try {
    await ReactNativeHomeWidget.reloadAllTimelines();
  } catch (error) {
    console.error("Failed to reload widgets:", error);
  }
}

/**
 * Clear widget data (e.g., when widgets are disabled).
 */
export async function clearWidgetSnapshot(): Promise<void> {
  if (Platform.OS !== "ios" || IS_EXPO_GO || !ReactNativeHomeWidget) {
    return;
  }

  try {
    // Write an empty/disabled snapshot
    const emptySnapshot: WidgetSnapshot = {
      widgetsEnabled: false,
      hideAmounts: false,
      useBitcoinSymbol: true,
      fiatCurrency: "USD",
      updatedAt: Math.floor(Date.now() / 1000),
    };
    
    const jsonString = JSON.stringify(emptySnapshot);
    await ReactNativeHomeWidget.setWidgetData(WIDGET_SNAPSHOT_KEY, jsonString);
    await ReactNativeHomeWidget.reloadAllTimelines();
  } catch (error) {
    console.error("Failed to clear widget snapshot:", error);
  }
}
