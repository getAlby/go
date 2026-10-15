// Hermes has no Intl.PluralRules; the polyfill must be loaded before i18next
// is initialized (lib/i18n.ts). The plural data for the shipped languages is
// generated into locales/generated-plurals.ts (`yarn i18n:generate`) and has
// to be imported after polyfill-force.
import "@formatjs/intl-getcanonicallocales/polyfill.js";
import "@formatjs/intl-locale/polyfill.js";
import "@formatjs/intl-pluralrules/polyfill-force.js";
import "~/locales/generated-plurals";
import "message-port-polyfill";
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import TextEncodingPolyfill from "text-encoding";

const applyGlobalPolyfills = () => {
  Object.assign(global, {
    TextEncoder: TextEncodingPolyfill.TextEncoder,
    TextDecoder: TextEncodingPolyfill.TextDecoder,
  });
};

applyGlobalPolyfills();
