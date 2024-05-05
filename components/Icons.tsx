import {
  AlertCircle,
  CheckCircle,
  LucideIcon,
  XCircle,
  MoveUpRight,
  MoveDownRight,
  MoveDownLeft,
  Camera
} from "lucide-react-native";
import { cssInterop } from "nativewind";

function interopIcon(icon: LucideIcon) {
  cssInterop(icon, {
    className: {
      target: "style",
      nativeStyleToProp: {
        color: true,
        opacity: true,
      },
    },
  });
}

interopIcon(AlertCircle);
interopIcon(CheckCircle);
interopIcon(XCircle);
interopIcon(MoveDownRight);
interopIcon(MoveUpRight);
interopIcon(MoveDownLeft);
interopIcon(Camera);

export { AlertCircle, Camera, CheckCircle, XCircle, MoveDownRight, MoveUpRight, MoveDownLeft };
