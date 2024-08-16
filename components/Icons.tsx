import {
  AlertCircle,
  CheckCircle,
  LucideIcon,
  XCircle,
  MoveUpRight,
  MoveDownRight,
  MoveDownLeft,
  MoveUp,
  MoveDown,
  Camera,
  Menu,
  ZapIcon,
  WalletIcon,
  Copy,
  Currency,
  Settings2,
  ArrowLeftRight,
  PlusCircle,
  Cog,
  ClipboardPaste,
  Keyboard,
  BookUser,
  Wallet2,
  ArrowDown,
  ChevronDown,
  Bitcoin
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
interopIcon(ArrowDown);
interopIcon(CheckCircle);
interopIcon(Bitcoin);
interopIcon(XCircle);
interopIcon(MoveUp);
interopIcon(MoveDown);
interopIcon(ChevronDown);
interopIcon(MoveDownRight);
interopIcon(MoveUpRight);
interopIcon(MoveDownLeft);
interopIcon(Camera);
interopIcon(Menu);
interopIcon(ZapIcon);
interopIcon(WalletIcon);
interopIcon(Copy);
interopIcon(Currency);
interopIcon(Settings2);
interopIcon(ArrowLeftRight);
interopIcon(PlusCircle);
interopIcon(Cog);
interopIcon(ClipboardPaste);
interopIcon(Keyboard);
interopIcon(BookUser);
interopIcon(Wallet2);

export {
  AlertCircle,
  ArrowDown,
  Bitcoin,
  Camera,
  CheckCircle,
  XCircle,
  ChevronDown,
  MoveDown,
  MoveUp,
  MoveDownRight,
  MoveUpRight,
  MoveDownLeft,
  Menu,
  ZapIcon,
  WalletIcon,
  Copy,
  Currency,
  Settings2,
  ArrowLeftRight,
  PlusCircle,
  Cog,
  ClipboardPaste,
  Keyboard,
  BookUser,
  Wallet2
};
