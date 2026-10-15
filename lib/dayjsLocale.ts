import dayjs from "dayjs";

// Builds dayjs locales at runtime from the platform's Intl data, so adding a
// language does not need a `dayjs/locale/<code>` import. A translation may
// override the generated name lists through the optional `common.calendar`
// object (for languages whose month name next to a day number needs another
// grammatical case than the standalone Intl form); the arrays must have 12
// (months) or 7 (weekdays, starting with Sunday) entries.
export const CALENDAR_OVERRIDE_LENGTHS = {
  months: 12,
  monthsShort: 12,
  weekdays: 7,
  weekdaysShort: 7,
  weekdaysMin: 7,
} as const;

export type CalendarOverrideKey = keyof typeof CALENDAR_OVERRIDE_LENGTHS;
export type CalendarOverrides = Partial<
  Record<CalendarOverrideKey, readonly string[]>
>;

export type DayjsLocaleMeta = {
  // first day of the week, 0 = Sunday (locales/<code>/meta.json)
  weekStart?: number;
};

export type DayjsLocale = Partial<ILocale> & { name: string };

// fixed UTC dates: the first day of every month of 2000 and the week that
// starts on Sunday 2 January 2000
const monthDates = Array.from(
  { length: 12 },
  (_, month) => new Date(Date.UTC(2000, month, 1)),
);
const weekdayDates = Array.from(
  { length: 7 },
  (_, day) => new Date(Date.UTC(2000, 0, 2 + day)),
);

function intlNames(
  code: string,
  options: Intl.DateTimeFormatOptions,
  dates: Date[],
): string[] {
  const formatter = new Intl.DateTimeFormat(code, {
    ...options,
    timeZone: "UTC",
  });
  return dates.map((date) => formatter.format(date));
}

function pickOverride(
  overrides: unknown,
  key: CalendarOverrideKey,
): string[] | undefined {
  if (overrides === null || typeof overrides !== "object") {
    return undefined;
  }
  const value: unknown = (overrides as Record<string, unknown>)[key];
  if (
    Array.isArray(value) &&
    value.length === CALENDAR_OVERRIDE_LENGTHS[key] &&
    value.every((item): item is string => typeof item === "string")
  ) {
    return value;
  }
  return undefined;
}

export function buildDayjsLocale(
  code: string,
  meta: DayjsLocaleMeta,
  overrides?: unknown,
): DayjsLocale {
  return {
    name: code,
    months:
      pickOverride(overrides, "months") ??
      intlNames(code, { month: "long" }, monthDates),
    monthsShort:
      pickOverride(overrides, "monthsShort") ??
      intlNames(code, { month: "short" }, monthDates),
    weekdays:
      pickOverride(overrides, "weekdays") ??
      intlNames(code, { weekday: "long" }, weekdayDates),
    weekdaysShort:
      pickOverride(overrides, "weekdaysShort") ??
      intlNames(code, { weekday: "short" }, weekdayDates),
    weekdaysMin:
      pickOverride(overrides, "weekdaysMin") ??
      intlNames(code, { weekday: "narrow" }, weekdayDates),
    weekStart: meta.weekStart ?? 0,
    ordinal: (n) => `${n}`,
    // only read by the localizedFormat plugin; the app formats dates with the
    // pattern from the translation (transactions.dateTimeFormat)
    formats: {
      LT: "HH:mm",
      LTS: "HH:mm:ss",
      L: "YYYY-MM-DD",
      LL: "D MMMM YYYY",
      LLL: "D MMMM YYYY HH:mm",
      LLLL: "dddd, D MMMM YYYY HH:mm",
    },
    // relativeTime is left out on purpose: dayjs then falls back to its
    // English strings, and inflected languages cannot be expressed as plain
    // strings anyway; relative time is formatted through i18next plurals
  };
}

// Registers (or refreshes) the locale for `code` and makes it the global
// dayjs locale. `overrides` is the translation's optional common.calendar
// object, passed in by lib/i18n.ts so that this module stays free of i18n.
export function applyDayjsLocale(
  code: string,
  meta: DayjsLocaleMeta,
  overrides?: unknown,
): void {
  dayjs.locale(code, buildDayjsLocale(code, meta, overrides), true);
  dayjs.locale(code);
}
