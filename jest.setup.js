/* eslint-env jest */

// the app store (lib/state/appStore.ts) reads its persisted state synchronously
// from expo-secure-store on import; use an in-memory store in tests
jest.mock("expo-secure-store", () => {
  const store = new Map();
  return {
    getItem: jest.fn((key) => store.get(key) ?? null),
    setItem: jest.fn((key, value) => {
      store.set(key, value);
    }),
    getItemAsync: jest.fn(async (key) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key, value) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key) => {
      store.delete(key);
    }),
  };
});

// expo-localization reads the device locale from a native module which is not
// available in jest; tests override the return value when needed
jest.mock("expo-localization", () => ({
  getLocales: jest.fn(() => [
    {
      languageTag: "en-US",
      languageCode: "en",
      regionCode: "US",
      textDirection: "ltr",
      digitGroupingSeparator: ",",
      decimalSeparator: ".",
      measurementSystem: "us",
      currencyCode: "USD",
      currencySymbol: "$",
      languageRegionCode: "US",
      temperatureUnit: "fahrenheit",
    },
  ]),
}));
