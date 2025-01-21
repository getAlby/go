import ExpoAppIntents from "expo-ios-app-intents";
import { useAppStore } from "../state/appStore";
import { Nip47Transaction } from "@getalby/sdk/dist/NWCClient";

export interface MakeInvoiceParameters {
  _Amount: number;
  _Description?: string;
}

export interface LookupInvoiceParameters {
  _Invoice: string;
}

// Define the proper IntentEventPayload type
interface IntentEventPayload {
  id: string;
  name: string;
  parameters: Record<string, any>;
}

async function handleIntent(event: IntentEventPayload) {
  const { name, parameters, id } = event;
  const nwcClient = useAppStore.getState().nwcClient;

  if (!nwcClient) {
    ExpoAppIntents.failIntent(id, "NWC client not connected");
    return;
  }

  try {
    if (name === "MakeInvoice") {
      const { _Amount, _Description } = parameters as MakeInvoiceParameters;
      const response = (await nwcClient.makeInvoice({
        amount: _Amount,
        ...(_Description ? { description: _Description } : {}),
      })) as Nip47Transaction;
      // Return [invoice, paymentHash] as string array
      ExpoAppIntents.completeIntent(id, { value: JSON.stringify(response) });
    } else if (name === "LookupInvoice") {
      const { _Invoice } = parameters as LookupInvoiceParameters;
      const response = (await nwcClient.lookupInvoice({
        invoice: _Invoice,
      })) as Nip47Transaction;

      // Return [paid, preimage, amount, description] as string array
      // Determine paid status from presence of settled_at timestamp
      ExpoAppIntents.completeIntent(id, { value: JSON.stringify(response) });
    }
  } catch (error) {
    console.error("App Intent error:", error);
    ExpoAppIntents.failIntent(
      id,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}

export const setupLightningIntentHandlers = () => {
  ExpoAppIntents.addListener("onIntent", (event: IntentEventPayload) => {
    handleIntent(event);
  });
};
