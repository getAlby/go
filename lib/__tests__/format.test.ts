import dayjs from "dayjs";
import "dayjs/locale/cs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  formatBitcoinAmount,
  formatDateTime,
  formatFiatNumber,
  formatNumber,
  formatRelativeTime,
  formatSatsUnit,
  getCurrencySymbol,
  getDecimalSeparator,
  getGroupingSeparator,
  getLocale,
  parseLocaleNumber,
} from "~/lib/format";
import i18n, { isSupportedLanguage } from "~/lib/i18n";

// Intl uses non-breaking spaces as grouping separators in some locales
function normalizeSpaces(value: string) {
  return value.replace(/[  ]/g, " ");
}

// 14 October 2026 10:00 in the local timezone
const dateTimeUnix = Math.floor(new Date(2026, 9, 14, 10, 0).getTime() / 1000);

// formatRelativeTime replaces dayjs' fromNow(); the plugin and the Czech
// locale are loaded here only to compute the reference values
dayjs.extend(relativeTime);

const nowMs = dateTimeUnix * 1000;
const now = dayjs(nowMs);

// offsets around the dayjs thresholds (44 s, 89 s, 44 min, 89 min, 21 h,
// 35 h, 25 d, 45 d, 10 M, 17 M)
const relativeTimeOffsets: [number, dayjs.ManipulateType][] = [
  [10, "second"],
  [44, "second"],
  [45, "second"],
  [89, "second"],
  [90, "second"],
  [2, "minute"],
  [44, "minute"],
  [45, "minute"],
  [89, "minute"],
  [90, "minute"],
  [2, "hour"],
  [21, "hour"],
  [22, "hour"],
  [35, "hour"],
  [36, "hour"],
  [2, "day"],
  [25, "day"],
  [26, "day"],
  [45, "day"],
  [46, "day"],
  [2, "month"],
  [10, "month"],
  [11, "month"],
  [17, "month"],
  [18, "month"],
  [2, "year"],
];

function ago(amount: number, unit: dayjs.ManipulateType) {
  return now.subtract(amount, unit);
}

describe("format", () => {
  describe("en", () => {
    beforeAll(async () => {
      await i18n.changeLanguage("en");
    });

    test("getLocale", () => {
      expect(getLocale()).toBe("en");
    });

    test("formatNumber", () => {
      expect(formatNumber(1234567.89)).toBe("1,234,567.89");
      expect(formatNumber(0.5, { maximumFractionDigits: 1 })).toBe("0.5");
    });

    test("separators", () => {
      expect(getDecimalSeparator()).toBe(".");
      expect(getGroupingSeparator()).toBe(",");
    });

    test("parseLocaleNumber", () => {
      expect(parseLocaleNumber("1,234.56")).toBe("1234.56");
      expect(parseLocaleNumber("1.234,56")).toBe("1234.56");
      expect(parseLocaleNumber("1,234")).toBe("1234");
      expect(parseLocaleNumber("1,234,567")).toBe("1234567");
      expect(parseLocaleNumber("1.5")).toBe("1.5");
      expect(parseLocaleNumber(".5")).toBe("0.5");
      expect(parseLocaleNumber("12.")).toBe("12");
      expect(parseLocaleNumber("1 234")).toBe("1234");
      expect(parseLocaleNumber("abc")).toBe("");
      expect(parseLocaleNumber("")).toBe("");
    });

    test("formatSatsUnit", () => {
      expect(formatSatsUnit(1)).toBe("sat");
      expect(formatSatsUnit(2)).toBe("sats");
      expect(formatSatsUnit(5)).toBe("sats");
      expect(formatSatsUnit(0)).toBe("sats");
    });

    test("formatBitcoinAmount", () => {
      expect(formatBitcoinAmount(1234567)).toBe("₿ 1,234,567");
      expect(formatBitcoinAmount(1234567, "sats")).toBe("1,234,567 sats");
      expect(formatBitcoinAmount(1, "sats")).toBe("1 sat");
      expect(formatBitcoinAmount(1234567, "sats", false)).toBe("1,234,567");
      expect(formatBitcoinAmount(1234567, "bip177", false)).toBe("1,234,567");
    });

    test("fiat", () => {
      expect(formatFiatNumber(1234.5, "USD")).toBe("1,234.50");
      expect(formatFiatNumber(1234.5, "JPY")).toBe("1,235");
      expect(getCurrencySymbol("USD")).toBe("$");
      expect(getCurrencySymbol("EUR")).toBe("€");
    });

    test("formatDateTime", () => {
      expect(formatDateTime(dateTimeUnix)).toBe("14 October 2026, 10:00");
    });

    test.each(relativeTimeOffsets)(
      "formatRelativeTime %i %s ago matches dayjs",
      (amount, unit) => {
        const time = ago(amount, unit);
        expect(formatRelativeTime(time.unix(), nowMs)).toBe(time.from(now));
      },
    );

    test("formatRelativeTime", () => {
      expect(formatRelativeTime(ago(10, "second").unix(), nowMs)).toBe(
        "a few seconds ago",
      );
      expect(formatRelativeTime(ago(1, "minute").unix(), nowMs)).toBe(
        "a minute ago",
      );
      expect(formatRelativeTime(ago(3, "minute").unix(), nowMs)).toBe(
        "3 minutes ago",
      );
      expect(formatRelativeTime(ago(1, "hour").unix(), nowMs)).toBe(
        "an hour ago",
      );
      expect(formatRelativeTime(ago(5, "hour").unix(), nowMs)).toBe(
        "5 hours ago",
      );
      expect(formatRelativeTime(ago(1, "day").unix(), nowMs)).toBe("a day ago");
      expect(formatRelativeTime(ago(2, "day").unix(), nowMs)).toBe(
        "2 days ago",
      );
      expect(formatRelativeTime(ago(1, "month").unix(), nowMs)).toBe(
        "a month ago",
      );
      expect(formatRelativeTime(ago(3, "month").unix(), nowMs)).toBe(
        "3 months ago",
      );
      expect(formatRelativeTime(ago(1, "year").unix(), nowMs)).toBe(
        "a year ago",
      );
      expect(formatRelativeTime(ago(2, "year").unix(), nowMs)).toBe(
        "2 years ago",
      );
      // the current time and clock skew into the future
      expect(formatRelativeTime(now.unix(), nowMs)).toBe("a few seconds ago");
      expect(formatRelativeTime(now.add(30, "second").unix(), nowMs)).toBe(
        "a few seconds ago",
      );
    });
  });

  // the Czech cases run once locales/cs exists (shipped in the Czech translation PR)
  const describeCs = isSupportedLanguage("cs") ? describe : describe.skip;
  describeCs("cs", () => {
    beforeAll(async () => {
      await i18n.changeLanguage("cs");
    });

    afterAll(async () => {
      await i18n.changeLanguage("en");
    });

    test("getLocale", () => {
      expect(getLocale()).toBe("cs");
    });

    test("formatNumber", () => {
      expect(normalizeSpaces(formatNumber(1234567.89))).toBe("1 234 567,89");
      expect(formatNumber(0.5, { maximumFractionDigits: 1 })).toBe("0,5");
    });

    test("separators", () => {
      expect(getDecimalSeparator()).toBe(",");
      expect(normalizeSpaces(getGroupingSeparator())).toBe(" ");
    });

    test("parseLocaleNumber", () => {
      expect(parseLocaleNumber("1 234,56")).toBe("1234.56");
      expect(parseLocaleNumber("1 234,56")).toBe("1234.56");
      expect(parseLocaleNumber("1.234,56")).toBe("1234.56");
      expect(parseLocaleNumber("1,234.56")).toBe("1234.56");
      expect(parseLocaleNumber("1.234")).toBe("1234");
      expect(parseLocaleNumber("1,5")).toBe("1.5");
      expect(parseLocaleNumber(",5")).toBe("0.5");
    });

    test("formatSatsUnit", () => {
      expect(formatSatsUnit(1)).toBe("sat");
      expect(formatSatsUnit(2)).toBe("saty");
      expect(formatSatsUnit(4)).toBe("saty");
      expect(formatSatsUnit(5)).toBe("satů");
      expect(formatSatsUnit(0)).toBe("satů");
      expect(formatSatsUnit(1.5)).toBe("satu");
    });

    test("formatBitcoinAmount", () => {
      expect(normalizeSpaces(formatBitcoinAmount(1234567))).toBe("₿ 1 234 567");
      expect(normalizeSpaces(formatBitcoinAmount(1234567, "sats"))).toBe(
        "1 234 567 satů",
      );
      expect(formatBitcoinAmount(1, "sats")).toBe("1 sat");
      expect(formatBitcoinAmount(2, "sats")).toBe("2 saty");
      expect(normalizeSpaces(formatBitcoinAmount(1234567, "sats", false))).toBe(
        "1 234 567",
      );
    });

    test("fiat", () => {
      expect(normalizeSpaces(formatFiatNumber(1234.5, "USD"))).toBe("1 234,50");
      expect(normalizeSpaces(formatFiatNumber(1234.5, "JPY"))).toBe("1 235");
      expect(getCurrencySymbol("USD")).toBe("$");
      expect(getCurrencySymbol("CZK")).toBe("Kč");
    });

    test("formatDateTime", () => {
      expect(formatDateTime(dateTimeUnix)).toBe("14. 10. 2026 10:00");
    });

    test.each(relativeTimeOffsets)(
      "formatRelativeTime %i %s ago matches dayjs/locale/cs",
      (amount, unit) => {
        const time = ago(amount, unit);
        expect(formatRelativeTime(time.unix(), nowMs)).toBe(
          time.locale("cs").from(now),
        );
      },
    );

    test("formatRelativeTime", () => {
      expect(formatRelativeTime(ago(10, "second").unix(), nowMs)).toBe(
        "před pár sekundami",
      );
      expect(formatRelativeTime(ago(1, "minute").unix(), nowMs)).toBe(
        "před minutou",
      );
      expect(formatRelativeTime(ago(3, "minute").unix(), nowMs)).toBe(
        "před 3 minutami",
      );
      expect(formatRelativeTime(ago(1, "hour").unix(), nowMs)).toBe(
        "před hodinou",
      );
      expect(formatRelativeTime(ago(5, "hour").unix(), nowMs)).toBe(
        "před 5 hodinami",
      );
      expect(formatRelativeTime(ago(1, "day").unix(), nowMs)).toBe("před dnem");
      expect(formatRelativeTime(ago(2, "day").unix(), nowMs)).toBe(
        "před 2 dny",
      );
      expect(formatRelativeTime(ago(1, "month").unix(), nowMs)).toBe(
        "před měsícem",
      );
      expect(formatRelativeTime(ago(3, "month").unix(), nowMs)).toBe(
        "před 3 měsíci",
      );
      expect(formatRelativeTime(ago(7, "month").unix(), nowMs)).toBe(
        "před 7 měsíci",
      );
      expect(formatRelativeTime(ago(1, "year").unix(), nowMs)).toBe(
        "před rokem",
      );
      expect(formatRelativeTime(ago(2, "year").unix(), nowMs)).toBe(
        "před 2 lety",
      );
    });
  });
});
