/* eslint-env node, es2020 */
// Checks the translation files in locales/:
// - every language directory has a valid meta.json and the generated registry
//   (locales/generated.ts, locales/generated-plurals.ts) is up to date
// - every language has the same area files and the same keys as English
//   (plural suffixes such as _one/_few/_many/_other are normalized)
// - every key that is plural in English has the plural forms the language
//   needs according to Intl.PluralRules (missing form = error, extra = warning)
// - every key used in the sources exists in English
// - English keys that are not used anywhere are reported as warnings (the
//   `notifications` area is read by the native notification code only)
// Exits with code 1 when an error is found. Run with `yarn i18n:check`.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { discoverLanguages, generateFiles } from "./i18n-generate.mjs";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const localesDir = join(rootDir, "locales");
const baseLanguage = "en";
const sourceDirs = [
  "app",
  "pages",
  "components",
  "lib",
  "hooks",
  "context",
  "services",
  "native",
];
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const pluralSuffixPattern = /_(zero|one|two|few|many|other)$/;
// areas whose keys are consumed by the native notification code, not by t()
const nativeOnlyAreas = new Set(["notifications"]);
// optional per-language name lists for lib/dayjsLocale.ts: arrays, not keys
const calendarOverridePrefix = "common.calendar.";
const calendarOverrideLengths = new Map([
  ["common.calendar.months", 12],
  ["common.calendar.monthsShort", 12],
  ["common.calendar.weekdays", 7],
  ["common.calendar.weekdaysShort", 7],
  ["common.calendar.weekdaysMin", 7],
]);
const keyUsagePatterns = [
  /\bt\(\s*"([^"\n]+)"/g,
  /\bt\(\s*'([^'\n]+)'/g,
  /\bi18n\.t\(\s*"([^"\n]+)"/g,
  /\bi18n\.t\(\s*'([^'\n]+)'/g,
  /\bi18nKey=["']([^"'\n]+)["']/g,
];

const errors = [];
const warnings = [];

// Collects the keys (plural suffixes removed) into result.keys and the plural
// categories provided per base key into result.plurals.
function flattenKeys(value, prefix, result, language) {
  if (Array.isArray(value)) {
    const expectedLength = calendarOverrideLengths.get(prefix);
    if (expectedLength === undefined) {
      errors.push(`[${language}] value of "${prefix}" must be a string`);
    } else if (
      value.length !== expectedLength ||
      value.some((item) => typeof item !== "string")
    ) {
      errors.push(
        `[${language}] "${prefix}" must be an array of ${expectedLength} strings`,
      );
    }
    // calendar overrides are optional per language and not translation keys
    return result;
  }
  if (value !== null && typeof value === "object") {
    for (const [childKey, childValue] of Object.entries(value)) {
      flattenKeys(
        childValue,
        prefix ? `${prefix}.${childKey}` : childKey,
        result,
        language,
      );
    }
    return result;
  }
  if (prefix.startsWith(calendarOverridePrefix)) {
    errors.push(
      `[${language}] "${prefix}" is not a calendar override (${[...calendarOverrideLengths.keys()].join(", ")})`,
    );
    return result;
  }
  if (typeof value !== "string") {
    errors.push(`[${language}] value of "${prefix}" must be a string`);
    return result;
  }
  const baseKey = prefix.replace(pluralSuffixPattern, "");
  result.keys.add(baseKey);
  const match = prefix.match(pluralSuffixPattern);
  if (match) {
    const categories = result.plurals.get(baseKey) ?? new Set();
    categories.add(match[1]);
    result.plurals.set(baseKey, categories);
  }
  return result;
}

function loadLanguage(language) {
  const languageDir = join(localesDir, language);
  const areas = new Map();
  const plurals = new Map();
  for (const fileName of readdirSync(languageDir).sort()) {
    if (extname(fileName) !== ".json" || fileName === "meta.json") {
      continue;
    }
    const filePath = join(languageDir, fileName);
    let json;
    try {
      json = JSON.parse(readFileSync(filePath, "utf8"));
    } catch (error) {
      errors.push(`${relative(rootDir, filePath)}: ${error.message}`);
      continue;
    }
    const area = fileName.slice(0, -".json".length);
    const result = flattenKeys(
      json,
      area,
      { keys: new Set(), plurals },
      language,
    );
    areas.set(area, result.keys);
  }
  return { areas, plurals };
}

function collectSourceFiles(dir, files) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) {
      continue;
    }
    const entryPath = join(dir, entry);
    if (statSync(entryPath).isDirectory()) {
      collectSourceFiles(entryPath, files);
    } else if (sourceExtensions.has(extname(entry))) {
      files.push(entryPath);
    }
  }
  return files;
}

function collectUsedKeys() {
  const usedKeys = new Map();
  const files = [];
  for (const sourceDir of sourceDirs) {
    const dirPath = join(rootDir, sourceDir);
    try {
      statSync(dirPath);
    } catch {
      continue;
    }
    collectSourceFiles(dirPath, files);
  }
  for (const filePath of files) {
    const source = readFileSync(filePath, "utf8");
    for (const pattern of keyUsagePatterns) {
      for (const match of source.matchAll(pattern)) {
        const key = match[1];
        if (!usedKeys.has(key)) {
          usedKeys.set(key, []);
        }
        usedKeys.get(key).push(relative(rootDir, filePath));
      }
    }
  }
  return usedKeys;
}

// The plural categories a language selects from, e.g. one/few/many/other for
// cs. Node ships the full ICU data, so any language can be checked here.
function pluralCategories(language) {
  const resolved = new Intl.PluralRules(language).resolvedOptions();
  if (
    new Intl.Locale(resolved.locale).language !==
    new Intl.Locale(language).language
  ) {
    warnings.push(
      `[${language}] Node has no plural rules for "${language}", checking against "${resolved.locale}"`,
    );
  }
  return resolved.pluralCategories;
}

// 1. language manifests and the generated registry
const discovered = discoverLanguages(rootDir);
for (const code of discovered.skipped) {
  errors.push(
    `locales/${code}/meta.json is missing (see "Translations" in README.md)`,
  );
}
errors.push(...discovered.problems);
if (discovered.problems.length === 0) {
  try {
    const generated = await generateFiles(rootDir);
    for (const [relativePath, content] of Object.entries(generated)) {
      let onDisk = null;
      try {
        onDisk = readFileSync(join(rootDir, relativePath), "utf8");
      } catch {
        // reported below
      }
      if (onDisk === null) {
        errors.push(`${relativePath} is missing, run \`yarn i18n:generate\``);
      } else if (onDisk.replace(/\r\n/g, "\n") !== content) {
        errors.push(
          `${relativePath} is out of date, run \`yarn i18n:generate\``,
        );
      }
    }
  } catch (error) {
    errors.push(...(error.problems ?? [error.message]));
  }
}

// 2. area files and key parity
const languages = readdirSync(localesDir)
  .filter((entry) => statSync(join(localesDir, entry)).isDirectory())
  .filter((entry) => entry !== "native")
  .sort();

if (!languages.includes(baseLanguage)) {
  errors.push(`Missing base language directory locales/${baseLanguage}`);
}

const translations = new Map(
  languages.map((language) => [language, loadLanguage(language)]),
);
const baseAreas = translations.get(baseLanguage)?.areas ?? new Map();
const baseKeys = new Set([...baseAreas.values()].flatMap((keys) => [...keys]));

function keysOf(language) {
  return new Set(
    [...translations.get(language).areas.values()].flatMap((keys) => [...keys]),
  );
}

for (const language of languages) {
  if (language === baseLanguage) {
    continue;
  }
  const { areas } = translations.get(language);
  for (const area of baseAreas.keys()) {
    if (!areas.has(area)) {
      errors.push(`locales/${language}/${area}.json is missing`);
    }
  }
  for (const area of areas.keys()) {
    if (!baseAreas.has(area)) {
      errors.push(
        `locales/${language}/${area}.json has no counterpart in locales/${baseLanguage}`,
      );
    }
  }
  const languageKeys = keysOf(language);
  for (const key of baseKeys) {
    if (!languageKeys.has(key)) {
      errors.push(`[${language}] missing key "${key}"`);
    }
  }
  for (const key of languageKeys) {
    if (!baseKeys.has(key)) {
      errors.push(
        `[${language}] key "${key}" does not exist in ${baseLanguage}`,
      );
    }
  }
}

// 3. plural forms: every key that is plural in English needs the categories
// of the language; `_zero` is always allowed because i18next uses it for
// count 0 in every language
const basePlurals = translations.get(baseLanguage)?.plurals ?? new Map();
for (const language of languages) {
  const { plurals } = translations.get(language);
  const languageKeys = keysOf(language);
  let required;
  try {
    required = pluralCategories(language);
  } catch (error) {
    errors.push(`[${language}] ${error.message}`);
    continue;
  }
  for (const key of basePlurals.keys()) {
    if (!languageKeys.has(key)) {
      continue; // reported by the key parity check
    }
    const provided = plurals.get(key);
    if (!provided) {
      errors.push(
        `[${language}] key "${key}" must have the plural forms ${required.map((category) => `${key}_${category}`).join(", ")}`,
      );
      continue;
    }
    for (const category of required) {
      if (!provided.has(category)) {
        errors.push(
          `[${language}] missing plural form "${key}_${category}" (${language} uses ${required.join(", ")})`,
        );
      }
    }
    for (const category of provided) {
      if (!required.includes(category) && category !== "zero") {
        warnings.push(
          `[${language}] plural form "${key}_${category}" is never selected (${language} uses ${required.join(", ")})`,
        );
      }
    }
  }
  for (const key of plurals.keys()) {
    if (!basePlurals.has(key) && baseKeys.has(key)) {
      errors.push(
        `[${language}] key "${key}" has plural forms but is not plural in ${baseLanguage}`,
      );
    }
  }
}

// 4. keys used in the sources
const usedKeys = collectUsedKeys();
for (const [key, files] of usedKeys) {
  if (!baseKeys.has(key)) {
    errors.push(
      `Key "${key}" used in ${[...new Set(files)].join(", ")} does not exist in locales/${baseLanguage}`,
    );
  }
}
for (const key of [...baseKeys].sort()) {
  if (!usedKeys.has(key) && !nativeOnlyAreas.has(key.split(".")[0])) {
    warnings.push(`Key "${key}" is not used in the sources`);
  }
}

for (const warning of warnings) {
  console.info(`Warning: ${warning}`);
}
for (const error of errors) {
  console.error(`Error: ${error}`);
}
console.info(
  `i18n check: ${languages.length} languages, ${baseKeys.size} keys, ${basePlurals.size} plural, ${usedKeys.size} used, ${warnings.length} warnings, ${errors.length} errors`,
);
if (errors.length > 0) {
  process.exit(1);
}
