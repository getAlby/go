import dayjs from "dayjs";
import { applyDayjsLocale, buildDayjsLocale } from "~/lib/dayjsLocale";

// the English locale that dayjs ships, captured before it is replaced
const builtInEn = { ...dayjs.Ls.en };
// Wednesday 14 October 2026 10:00 in the local timezone
const dateTimeUnix = Math.floor(new Date(2026, 9, 14, 10, 0).getTime() / 1000);

describe("dayjsLocale", () => {
  afterEach(() => {
    applyDayjsLocale("en", { weekStart: 0 });
  });

  test("English names equal the dayjs built-in locale", () => {
    const locale = buildDayjsLocale("en", { weekStart: 0 });
    expect(locale.months).toEqual(builtInEn.months);
    expect(locale.weekdays).toEqual(builtInEn.weekdays);
    // dayjs derives the short names from the first three letters
    expect(locale.monthsShort).toEqual(
      builtInEn.months?.map((month) => month.slice(0, 3)),
    );
    expect(locale.weekdaysShort).toEqual(
      builtInEn.weekdays?.map((weekday) => weekday.slice(0, 3)),
    );
    expect(locale.weekStart).toBe(0);
  });

  test("English formatting is unchanged", () => {
    applyDayjsLocale("en", { weekStart: 0 });
    expect(dayjs.locale()).toBe("en");
    expect(dayjs.unix(dateTimeUnix).format("D MMMM YYYY, HH:mm")).toBe(
      "14 October 2026, 10:00",
    );
    expect(dayjs.unix(dateTimeUnix).format("dddd ddd MMM")).toBe(
      "Wednesday Wed Oct",
    );
    expect(dayjs.unix(dateTimeUnix).startOf("week").day()).toBe(0);
  });

  test("Czech names come from Intl and the week starts on Monday", () => {
    applyDayjsLocale("cs", { weekStart: 1 });
    expect(dayjs.locale()).toBe("cs");
    const date = dayjs.unix(dateTimeUnix).locale("cs");
    expect(date.format("D. M. YYYY HH:mm")).toBe("14. 10. 2026 10:00");
    expect(date.format("MMMM")).toBe("říjen");
    expect(date.format("MMM")).toBe("říj");
    expect(date.format("dddd")).toBe("středa");
    expect(date.format("ddd")).toBe("st");
    expect(date.startOf("week").day()).toBe(1);
  });

  test("translation overrides win over the Intl names", () => {
    const months = [
      "ledna",
      "února",
      "března",
      "dubna",
      "května",
      "června",
      "července",
      "srpna",
      "září",
      "října",
      "listopadu",
      "prosince",
    ];
    applyDayjsLocale("cs", { weekStart: 1 }, { months });
    const date = dayjs.unix(dateTimeUnix).locale("cs");
    expect(date.format("D. MMMM YYYY")).toBe("14. října 2026");
    // lists that are not overridden still come from Intl
    expect(date.format("dddd")).toBe("středa");
  });

  test("invalid overrides are ignored", () => {
    const locale = buildDayjsLocale(
      "cs",
      { weekStart: 1 },
      {
        months: ["jen", "jedenáct"],
        weekdays: "ne po út st čt pá so",
        monthsShort: Array.from({ length: 12 }, () => 1),
      },
    );
    expect(locale.months?.[9]).toBe("říjen");
    expect(locale.monthsShort?.[9]).toBe("říj");
    expect(locale.weekdays?.[3]).toBe("středa");
    expect(buildDayjsLocale("cs", {}, null).weekStart).toBe(0);
    expect(buildDayjsLocale("cs", {}, "calendar").months?.[0]).toBe("leden");
  });
});
