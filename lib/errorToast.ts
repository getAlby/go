import Toast from "react-native-toast-message";
import i18n from "~/lib/i18n";

export function errorToast(error: Error | unknown, title?: string) {
  const message = (error as Error | undefined)?.message?.trim();

  Toast.show({
    type: "error",
    text1: title || message || i18n.t("errors.unknown"),
    text2: title
      ? message
      : message
        ? undefined
        : i18n.t("errors.checkConnection"),
  });
}
