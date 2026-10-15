import type { resources } from "~/locales/generated";

// Type-checks every t("…") key, i18n.t("…") key and <Trans i18nKey="…">
// against the English resources (the source language), so a mistyped or
// removed key fails `yarn tsc:compile`. Plural keys stay callable by their
// base name ("common.sats" for sats_one/sats_other) when `count` is passed.
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: (typeof resources)["en"];
    returnNull: false;
  }
}
