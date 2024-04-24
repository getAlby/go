import * as SecureStore from "expo-secure-store";

export const secureStorage = {
  getItem: (key: string) => {
    return SecureStore.getItem(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItem(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};
