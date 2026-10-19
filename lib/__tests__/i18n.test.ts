import { getLocales } from "expo-localization";
import i18n, {
  getLanguageMeta,
  getSystemLanguage,
  isSupportedLanguage,
  LANGUAGE_LABELS,
  LANGUAGES,
  resolveLanguage,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "~/lib/i18n";
import { resources } from "~/locales";

const mockedGetLocales = getLocales as jest.Mock;
const pluralSuffixPattern = /_(zero|one|two|few|many|other)$/;
// optional per-language name lists for lib/dayjsLocale.ts, not translation keys
const calendarOverridePrefix = "common.calendar.";
const languageCodes = LANGUAGES.map((language) => language.code);
// the Czech cases run once locales/cs exists (shipped in the Czech translation PR);
// the double assertion keeps the literal valid while the registry has no "cs"
const CS = "cs" as string as SupportedLanguage;
const hasCs = isSupportedLanguage(CS);
const testCs = hasCs ? test : test.skip;

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) =>
      flattenKeys(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [prefix];
}

// all keys of a language, plural forms (_one, _few, ...) counted as one key
function translationKeys(language: SupportedLanguage): string[] {
  return [
    ...new Set(
      flattenKeys(resources[language].translation)
        .filter((key) => !key.startsWith(calendarOverridePrefix))
        .map((key) => key.replace(pluralSuffixPattern, "")),
    ),
  ].sort();
}

// base key -> plural categories the language provides for it
function pluralForms(language: SupportedLanguage): Map<string, Set<string>> {
  const forms = new Map<string, Set<string>>();
  for (const key of flattenKeys(resources[language].translation)) {
    const match = key.match(pluralSuffixPattern);
    if (match) {
      const baseKey = key.replace(pluralSuffixPattern, "");
      const categories = forms.get(baseKey) ?? new Set<string>();
      categories.add(match[1]);
      forms.set(baseKey, categories);
    }
  }
  return forms;
}

describe("i18n", () => {
  afterEach(async () => {
    await i18n.changeLanguage("en");
  });

  test("the generated registry starts with English and feeds the exports", () => {
    expect(LANGUAGES[0].code).toBe("en");
    expect([...SUPPORTED_LANGUAGES]).toEqual(languageCodes);
    for (const language of LANGUAGES) {
      expect(isSupportedLanguage(language.code)).toBe(true);
      expect(getLanguageMeta(language.code)).toBe(language);
      expect(LANGUAGE_LABELS[language.code]).toBe(language.name);
    }
  });

  test.each(languageCodes)("%s has a valid manifest and resources", (code) => {
    const meta = getLanguageMeta(code);
    expect(meta.name.trim()).not.toBe("");
    expect(new Intl.Locale(meta.tag).language).toBe(
      new Intl.Locale(code).language,
    );
    expect(Object.keys(resources[code].translation).sort()).toEqual(
      Object.keys(resources.en.translation).sort(),
    );
  });

  // en is included so the table is never empty while English is the only language
  test.each(languageCodes)("%s has the same keys as en", (code) => {
    expect(translationKeys(code)).toEqual(translationKeys("en"));
  });

  test.each(languageCodes)(
    "%s provides every plural form its plural rules select",
    (code) => {
      const required = new Intl.PluralRules(code).resolvedOptions()
        .pluralCategories;
      const forms = pluralForms(code);
      const missing: string[] = [];
      for (const baseKey of pluralForms("en").keys()) {
        const provided = forms.get(baseKey) ?? new Set<string>();
        for (const category of required) {
          if (!provided.has(category)) {
            missing.push(`${baseKey}_${category}`);
          }
        }
      }
      expect(missing).toEqual([]);
    },
  );

  test("plurals in en", async () => {
    await i18n.changeLanguage("en");
    expect(i18n.t("common.sats", { count: 1 })).toBe("sat");
    expect(i18n.t("common.sats", { count: 2 })).toBe("sats");
    expect(i18n.t("common.sats", { count: 5 })).toBe("sats");
  });

  testCs("plurals in cs", async () => {
    await i18n.changeLanguage(CS);
    expect(i18n.t("common.sats", { count: 1 })).toBe("sat");
    expect(i18n.t("common.sats", { count: 2 })).toBe("saty");
    expect(i18n.t("common.sats", { count: 5 })).toBe("satů");
  });

  testCs("translates settings keys in cs", async () => {
    await i18n.changeLanguage(CS);
    expect(i18n.t("settings.language.title")).toBe("Jazyk");
    expect(i18n.t("settings.language.title", { lng: "en" })).toBe("Language");
  });

  test("isSupportedLanguage", () => {
    expect(isSupportedLanguage("en")).toBe(true);
    expect(isSupportedLanguage("cs")).toBe(hasCs);
    expect(isSupportedLanguage("system")).toBe(false);
    expect(isSupportedLanguage("xx")).toBe(false);
    expect(isSupportedLanguage(null)).toBe(false);
    expect(isSupportedLanguage(undefined)).toBe(false);
  });

  test("getSystemLanguage", () => {
    if (hasCs) {
      mockedGetLocales.mockReturnValueOnce([
        { languageTag: "cs-CZ", languageCode: "cs" },
      ]);
      expect(getSystemLanguage()).toBe(CS);
      // the full tag is tried before the bare language code
      mockedGetLocales.mockReturnValueOnce([
        { languageTag: "en", languageCode: "cs" },
      ]);
      expect(getSystemLanguage()).toBe("en");
    }
    mockedGetLocales.mockReturnValueOnce([
      { languageTag: "de-DE", languageCode: "de" },
    ]);
    expect(getSystemLanguage()).toBe("en");
    mockedGetLocales.mockReturnValueOnce([]);
    expect(getSystemLanguage()).toBe("en");
  });

  test("resolveLanguage", () => {
    expect(resolveLanguage("en")).toBe("en");
    if (hasCs) {
      expect(resolveLanguage(CS)).toBe(CS);
      mockedGetLocales.mockReturnValueOnce([
        { languageTag: "cs-CZ", languageCode: "cs" },
      ]);
      expect(resolveLanguage("system")).toBe(CS);
    }
    mockedGetLocales.mockReturnValueOnce([
      { languageTag: "en-US", languageCode: "en" },
    ]);
    expect(resolveLanguage("system")).toBe("en");
  });
});
