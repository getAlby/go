import { Toast } from "toastify-react-native";

export function errorToast(error: Error | unknown) {
  Toast.show({
    type: "error",
    text1:
      (error as Error | undefined)?.message ||
      "An unknown error occured. Please check your internet connection or try restarting Alby Go",
  });
}
