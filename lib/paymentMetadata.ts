// Helpers to load the podcast metadata of a payment from a url in its
// comment. Anyone can send a payment with any comment, so a url is only
// loaded from an exact list of known podcast app domains.

const PAYMENT_METADATA_FETCH_TIMEOUT = 10_000;

export function isAllowedMetadataUrl(url: string, domains: string[]): boolean {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.protocol === "https:" &&
      !parsedUrl.username &&
      !parsedUrl.password &&
      !parsedUrl.port &&
      domains.includes(parsedUrl.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}

// loads an allowed url with a timeout and reads the response. Returns
// undefined for a url that is not allowed, an error response, or a redirect
// to another domain
export async function fetchMetadata<T>(
  url: string,
  method: "GET" | "HEAD",
  domains: string[],
  read: (response: Response) => T | Promise<T>,
): Promise<T | undefined> {
  if (!isAllowedMetadataUrl(url, domains)) {
    return undefined;
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    PAYMENT_METADATA_FETCH_TIMEOUT,
  );
  try {
    const response = await fetch(url, { method, signal: controller.signal });
    // do not trust metadata from a redirect to another domain
    if (
      !response.ok ||
      (response.url && !isAllowedMetadataUrl(response.url, domains))
    ) {
      return undefined;
    }
    // the timeout also covers reading the body
    return await read(response);
  } finally {
    clearTimeout(timeout);
  }
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function toOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value !== "number" && typeof value !== "string") {
    return undefined;
  }
  if (typeof value === "string" && !value.trim()) {
    return undefined;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

// a position in the episode in whole seconds
export function toOptionalSeconds(value: unknown): number | undefined {
  const seconds = toOptionalNumber(value);
  return seconds === undefined ? undefined : Math.floor(seconds);
}
