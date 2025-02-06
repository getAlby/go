import {
  PopiconsCircleExclamationLine as AlertCircleIcon,
  PopiconsBitcoinSolid as BitcoinIcon,
  PopiconsAddressBookSolid as BookUserIcon,
  PopiconsCameraWebOffSolid as CameraOffIcon,
  PopiconsCircleCheckLine as CheckCircleIcon,
  PopiconsChevronTopLine as ChevronUpIcon,
  PopiconsCopySolid as CopyIcon,
  PopiconsEditSolid as EditIcon,
  PopiconsUploadSolid as ExportIcon,
  PopiconsTouchIdSolid as FingerprintIcon,
  PopiconsCircleInfoLine as HelpCircleIcon,
  PopiconsArrowDownLine as MoveDownIcon,
  PopiconsArrowUpLine as MoveUpIcon,
  PopiconsNotificationSquareSolid as NotificationIcon,
  PopiconsLifebuoySolid as OnboardingIcon,
  PopiconsClipboardTextSolid as PasteIcon,
  PopiconsPinSolid as PinIcon,
  PopiconsReloadLine as RefreshIcon,
  PopiconsReloadSolid as ResetIcon,
  PopiconsSettingsMinimalSolid as SettingsIcon,
  PopiconsShareSolid as ShareIcon,
  PopiconsLogoutSolid as SignOutIcon,
  PopiconsLoopSolid as SwapIcon,
  PopiconsPaintSolid as ThemeIcon,
  PopiconsBinSolid as TrashIcon,
  PopiconsTriangleExclamationLine as TriangleAlertIcon,
  PopiconsWalletHorizontalOpenSolid as WalletIcon,
  PopiconsDownloadSolid as WithdrawIcon,
  PopiconsCircleXLine as XCircleIcon,
  PopiconsXSolid as XIcon,
  PopiconsBoltSolid as ZapIcon,
} from "@popicons/react-native";
import { cssInterop } from "nativewind";
import { SvgProps } from "react-native-svg";

function interopIcon(icon: React.FunctionComponent<SvgProps>) {
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

interopIcon(AlertCircleIcon);
interopIcon(BitcoinIcon);
interopIcon(BookUserIcon);
interopIcon(CameraOffIcon);
interopIcon(CheckCircleIcon);
interopIcon(ChevronUpIcon);
interopIcon(CopyIcon);
interopIcon(EditIcon);
interopIcon(ExportIcon);
interopIcon(FingerprintIcon);
interopIcon(HelpCircleIcon);
interopIcon(MoveDownIcon);
interopIcon(MoveUpIcon);
interopIcon(NotificationIcon);
interopIcon(OnboardingIcon);
interopIcon(PasteIcon);
interopIcon(PinIcon);
interopIcon(RefreshIcon);
interopIcon(ResetIcon);
interopIcon(SettingsIcon);
interopIcon(ShareIcon);
interopIcon(SignOutIcon);
interopIcon(SwapIcon);
interopIcon(ThemeIcon);
interopIcon(TrashIcon);
interopIcon(TriangleAlertIcon);
interopIcon(WalletIcon);
interopIcon(WithdrawIcon);
interopIcon(XCircleIcon);
interopIcon(XIcon);
interopIcon(ZapIcon);

export {
  AlertCircleIcon,
  BitcoinIcon,
  BookUserIcon,
  CameraOffIcon,
  CheckCircleIcon,
  ChevronUpIcon,
  CopyIcon,
  EditIcon,
  ExportIcon,
  FingerprintIcon,
  HelpCircleIcon,
  MoveDownIcon,
  MoveUpIcon,
  NotificationIcon,
  OnboardingIcon,
  PasteIcon,
  PinIcon,
  RefreshIcon,
  ResetIcon,
  SettingsIcon,
  ShareIcon,
  SignOutIcon,
  SwapIcon,
  ThemeIcon,
  TrashIcon,
  TriangleAlertIcon,
  WalletIcon,
  WithdrawIcon,
  XCircleIcon,
  XIcon,
  ZapIcon,
};
