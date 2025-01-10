export interface MakeInvoiceResponse {
  invoice: string;
  paymentHash: string;
}

export interface LookupInvoiceResponse {
  paid: boolean;
  preimage?: string;
  amount: number;
  description?: string;
}

export interface NWCInvoiceError {
  error: string;
  message: string;
}
