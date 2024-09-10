import Toast from "react-native-toast-message";

export function errorToast(error: Error | unknown) {
  Toast.show({
    type: "error",
    text1:
      (error as Error | undefined)?.message ||
      "An unknown error occured. Please check your internet connection or try restarting Alby Go",
  });
}
