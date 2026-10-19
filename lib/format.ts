import dayjs from "dayjs";
import i18n from "~/lib/i18n";
import type { BitcoinDisplayFormat } from "~/lib/state/appStore";

// numbers and dates are formatted according to the app language,
// not the device region, so that what is displayed matches the keyboard
export function getLocale(): string {
  return i18n.language || "en";
}

export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(getLocale(), options).format(value);
}

export function getDecimalSeparator(): string {
  return formatNumber(1.1).replace(/\d/g, "") || ".";
}

export function getGroupingSeparator(): string {
  return formatNumber(1000).replace(/\d/g, "");
}

// Converts user input in the current locale ("1 234,56", "1,234.56", ...)
// into a canonical number string ("1234.56") or "" when there are no digits.
export function parseLocaleNumber(input: string): string {
  const cleaned = input.replace(/\s/g, "");
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  let decimalIndex = -1;
  if (lastComma !== -1 && lastDot !== -1) {
    // both separators present: the last one is the decimal separator
    decimalIndex = Math.max(lastComma, lastDot);
  } else if (lastComma !== -1 || lastDot !== -1) {
    // a single kind of separator is the decimal separator only when it
    // matches the locale and appears once, otherwise it groups thousands
    const separator = lastComma !== -1 ? "," : ".";
    const index = Math.max(lastComma, lastDot);
    if (
      separator === getDecimalSeparator() &&
      cleaned.indexOf(separator) === index
    ) {
      decimalIndex = index;
    }
  }

  const integerPart = (
    decimalIndex === -1 ? cleaned : cleaned.slice(0, decimalIndex)
  ).replace(/\D/g, "");
  const fractionPart =
    decimalIndex === -1
      ? ""
      : cleaned.slice(decimalIndex + 1).replace(/\D/g, "");

  if (!integerPart && !fractionPart) {
    return "";
  }
  if (!fractionPart) {
    return integerPart;
  }
  return `${integerPart || "0"}.${fractionPart}`;
}

export function formatSatsUnit(amount: number): string {
  return i18n.t("common.sats", { count: amount });
}

export function formatBitcoinAmount(
  amount: number,
  displayFormat: BitcoinDisplayFormat = "bip177",
  showSymbol: boolean = true,
): string {
  const formattedNumber = formatNumber(+amount);

  if (!showSymbol) {
    return formattedNumber;
  }

  if (displayFormat === "bip177") {
    return `₿ ${formattedNumber}`;
  } else {
    return `${formattedNumber} ${formatSatsUnit(amount)}`;
  }
}

export function getCurrencySymbol(currency: string): string {
  return new Intl.NumberFormat(getLocale(), {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  })
    .format(0)
    .replace(/[0-9.,\s]/g, "");
}

// Formats a fiat amount as a plain number with the currency's number of
// decimals, e.g. "1,234.50" (en) or "1 234,50" (cs); the symbol is added
// separately by the caller.
export function formatFiatNumber(value: number, currency: string): string {
  return new Intl.NumberFormat(getLocale(), {
    style: "currency",
    currency,
    currencyDisplay: "code",
  })
    .format(value)
    .replace(/[A-Za-z]/g, "")
    .trim();
}

export function formatDateTime(unixSeconds: number): string {
  return dayjs.unix(unixSeconds).format(i18n.t("transactions.dateTimeFormat"));
}

type RelativeTimeUnit = "second" | "minute" | "hour" | "day" | "month" | "year";

type RelativeTimeStep = {
  // dayjs diff unit; steps without a unit reuse the difference of the
  // previous step (e.g. "a minute" is chosen from the number of seconds)
  unit?: RelativeTimeUnit;
  // the step applies when the rounded difference is at most this value;
  // the last step has no limit
  limit?: number;
  format: (count: number) => string;
};

// Same thresholds as the dayjs relativeTime plugin (which the output used
// to come from), so that the English texts stay identical:
//   seconds <= 44 → a few seconds ago     seconds <= 89 → a minute ago
//   minutes <= 44 → {{count}} minutes ago minutes <= 89 → an hour ago
//   hours   <= 21 → {{count}} hours ago   hours   <= 35 → a day ago
//   days    <= 25 → {{count}} days ago    days    <= 45 → a month ago
//   months  <= 10 → {{count}} months ago  months  <= 17 → a year ago
//   otherwise     → {{count}} years ago
// A count of 1 in a plural step falls back to the singular step before it.
const relativeTimeSteps: RelativeTimeStep[] = [
  {
    unit: "second",
    limit: 44,
    format: () => i18n.t("common.relativeTime.seconds"),
  },
  { limit: 89, format: () => i18n.t("common.relativeTime.minute") },
  {
    unit: "minute",
    limit: 44,
    format: (count) => i18n.t("common.relativeTime.minutes", { count }),
  },
  { limit: 89, format: () => i18n.t("common.relativeTime.hour") },
  {
    unit: "hour",
    limit: 21,
    format: (count) => i18n.t("common.relativeTime.hours", { count }),
  },
  { limit: 35, format: () => i18n.t("common.relativeTime.day") },
  {
    unit: "day",
    limit: 25,
    format: (count) => i18n.t("common.relativeTime.days", { count }),
  },
  { limit: 45, format: () => i18n.t("common.relativeTime.month") },
  {
    unit: "month",
    limit: 10,
    format: (count) => i18n.t("common.relativeTime.months", { count }),
  },
  { limit: 17, format: () => i18n.t("common.relativeTime.year") },
  {
    unit: "year",
    format: (count) => i18n.t("common.relativeTime.years", { count }),
  },
];

// Relative time of a past timestamp ("3 minutes ago"), a data-driven
// replacement of dayjs' fromNow() that reads the texts from the translations
// instead of the dayjs locale files. The differences are computed by dayjs
// (diff in months follows the calendar) and rounded like dayjs does, so the
// results match fromNow() exactly for all past timestamps.
// Timestamps in the future (clock skew between the device and the wallet
// service) are shown as "a few seconds ago" instead of dayjs' "in ...".
export function formatRelativeTime(
  unixSeconds: number,
  nowMs: number = Date.now(),
): string {
  const time = dayjs.unix(unixSeconds);
  const now = dayjs(nowMs);
  if (time.valueOf() > now.valueOf()) {
    return i18n.t("common.relativeTime.seconds");
  }

  let count = 0;
  for (let index = 0; index < relativeTimeSteps.length; index++) {
    let step = relativeTimeSteps[index];
    if (step.unit) {
      count = Math.round(Math.abs(time.diff(now, step.unit, true)));
    }
    if (step.limit === undefined || count <= step.limit) {
      if (count <= 1 && index > 0) {
        step = relativeTimeSteps[index - 1];
      }
      return step.format(count);
    }
  }
  // unreachable: the last step has no limit
  return i18n.t("common.relativeTime.seconds");
}
