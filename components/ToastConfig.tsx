import { type ToastConfig } from "react-native-toast-message";
import Alert from "~/components/Alert";
import { CheckCircleIcon, XCircleIcon } from "~/components/Icons";

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <Alert
      icon={CheckCircleIcon}
      type="info"
      title={text1 || ""}
      description={text2}
      className="mx-6"
    />
  ),
  error: ({ text1, text2 }) => (
    <Alert
      icon={XCircleIcon}
      type="error"
      title={text1 || ""}
      description={text2}
      className="mx-6"
    />
  ),
};
