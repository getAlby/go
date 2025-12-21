import Toast from "react-native-toast-message";

export function errorToast(error: Error | unknown, title?: string) {
  const message = (error as Error | undefined)?.message?.trim();

  Toast.show({
    type: "error",
    text1: title || message || "An unknown error occured",
    text2: title
      ? message
      : message
        ? undefined
        : "Please check your internet connection or try restarting Alby Go",
  });
}
