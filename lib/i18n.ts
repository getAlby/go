import "~/lib/applyGlobalPolyfills"; // Intl.PluralRules must exist before i18next is initialized
import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { IS_EXPO_GO } from "~/lib/constants";
import { applyDayjsLocale } from "~/lib/dayjsLocale";
import { setNotificationSettings } from "~/lib/notificationsNativeStorage";
import { type AppLanguage, useAppStore } from "~/lib/state/appStore";
import {
  isSupportedLanguage,
  LANGUAGES,
  type LanguageMeta,
  resources,
  type SupportedLanguage,
} from "~/locales/generated";

export { isSupportedLanguage, LANGUAGES };
export type { LanguageMeta, SupportedLanguage };

// The language registry is generated from locales/<code>/meta.json by
// `yarn i18n:generate`; nothing in here refers to a particular language.
export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = LANGUAGES.map(
  (language) => language.code,
);

// language names are shown in their own language and are not translated
export const LANGUAGE_LABELS = Object.fromEntries(
  LANGUAGES.map((language) => [language.code, language.name]),
) as Record<SupportedLanguage, string>;

export function getLanguageMeta(language: SupportedLanguage): LanguageMeta {
  // the generator always puts English first, so LANGUAGES[0] is a safe default
  return LANGUAGES.find((entry) => entry.code === language) ?? LANGUAGES[0];
}

export function getSystemLanguage(): SupportedLanguage {
  const locale = getLocales()[0];
  // the full tag is tried first so that a regional language directory
  // ("pt-BR") wins over the bare language ("pt")
  for (const candidate of [locale?.languageTag, locale?.languageCode]) {
    if (isSupportedLanguage(candidate)) {
      return candidate;
    }
  }
  return "en";
}

export function resolveLanguage(setting: AppLanguage): SupportedLanguage {
  return setting === "system" ? getSystemLanguage() : setting;
}

// mirrors the language into the native storage read by the notification
// service extension (ios) and messaging service (android)
async function syncLanguageToNative(language: SupportedLanguage) {
  if (IS_EXPO_GO) {
    return;
  }
  try {
    await setNotificationSettings({
      language,
      languageTag: getLanguageMeta(language).tag,
    });
  } catch (error) {
    console.error("Failed to sync language to native storage", error);
  }
}

// dayjs month and weekday names are built from Intl at runtime; a translation
// may override them through its optional common.calendar object
function syncDayjsLocale(language: SupportedLanguage) {
  applyDayjsLocale(
    language,
    getLanguageMeta(language),
    i18n.getResource(language, "translation", "common.calendar"),
  );
}

export async function applyLanguage(
  language: SupportedLanguage,
): Promise<void> {
  await i18n.changeLanguage(language);
  syncDayjsLocale(language);
  await syncLanguageToNative(language);
}

const initialLanguage = resolveLanguage(useAppStore.getState().language);

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: "en",
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: { escapeValue: false },
  returnNull: false,
});
syncDayjsLocale(initialLanguage);

useAppStore.subscribe((state, prevState) => {
  if (state.language !== prevState.language) {
    applyLanguage(resolveLanguage(state.language)).catch((error) => {
      console.error("Failed to apply language", error);
    });
  }
});

export default i18n;
