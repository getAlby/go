import {
  PopiconsAddressBookSolid as AddressBookIcon,
  PopiconsAtSymbolSolid as AddressIcon,
  PopiconsUserPlusLine as AddUserIcon,
  PopiconsCircleExclamationLine as AlertCircleIcon,
  PopiconsArrowLeftSolid as ArrowLeftIcon,
  PopiconsBitcoinSolid as BitcoinIcon,
  PopiconsCameraWebOffSolid as CameraOffIcon,
  PopiconsCircleCheckLine as CheckCircleIcon,
  PopiconsCheckSolid as CheckIcon,
  PopiconsChevronBottomLine as ChevronDownIcon,
  PopiconsChevronLeftLine as ChevronLeftIcon,
  PopiconsChevronRightSolid as ChevronRightIcon,
  PopiconsChevronTopLine as ChevronUpIcon,
  PopiconsCopySolid as CopyIcon,
  PopiconsEditSolid as EditIcon,
  PopiconsEditLine as EditLineIcon,
  PopiconsTouchIdSolid as FingerprintIcon,
  PopiconsCircleInfoSolid as HelpCircleIcon,
  PopiconsImageSolid as ImageIcon,
  PopiconsLinkExternalSolid as LinkIcon,
  PopiconsMapLine as MapLineIcon,
  PopiconsNotePlusLine as NotesIcon,
  PopiconsNotificationSquareSolid as NotificationIcon,
  PopiconsLifebuoySolid as OnboardingIcon,
  PopiconsClipboardTextSolid as PasteIcon,
  PopiconsClipboardTextLine as PasteLineIcon,
  PopiconsQrCodeMinimalSolid as QRIcon,
  PopiconsReloadSolid as ResetIcon,
  PopiconsFullscreenSolid as ScanIcon,
  PopiconsSettingsMinimalSolid as SettingsIcon,
  PopiconsSettingsMinimalLine as SettingsLineIcon,
  PopiconsShareSolid as ShareIcon,
  PopiconsLogoutSolid as SignOutIcon,
  PopiconsLoopSolid as SwapIcon,
  PopiconsPaintSolid as ThemeIcon,
  PopiconsBinSolid as TrashIcon,
  PopiconsBinLine as TrashLineIcon,
  PopiconsTriangleExclamationLine as TriangleAlertIcon,
  PopiconsWalletHorizontalOpenSolid as WalletIcon,
  PopiconsCircleXLine as XCircleIcon,
  PopiconsXSolid as XIcon,
  PopiconsBoltSolid as ZapIcon,
} from "@popicons/react-native";
import { cssInterop } from "nativewind";
import { type SvgProps } from "react-native-svg";

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

interopIcon(AddressBookIcon);
interopIcon(AddressIcon);
interopIcon(AddUserIcon);
interopIcon(AlertCircleIcon);
interopIcon(ArrowLeftIcon);
interopIcon(BitcoinIcon);
interopIcon(CameraOffIcon);
interopIcon(CheckCircleIcon);
interopIcon(CheckIcon);
interopIcon(ChevronDownIcon);
interopIcon(ChevronLeftIcon);
interopIcon(ChevronRightIcon);
interopIcon(ChevronUpIcon);
interopIcon(CopyIcon);
interopIcon(EditIcon);
interopIcon(EditLineIcon);
interopIcon(FingerprintIcon);
interopIcon(HelpCircleIcon);
interopIcon(ImageIcon);
interopIcon(LinkIcon);
interopIcon(MapLineIcon);
interopIcon(NotesIcon);
interopIcon(NotificationIcon);
interopIcon(OnboardingIcon);
interopIcon(PasteIcon);
interopIcon(PasteLineIcon);
interopIcon(QRIcon);
interopIcon(ResetIcon);
interopIcon(ScanIcon);
interopIcon(SettingsIcon);
interopIcon(SettingsLineIcon);
interopIcon(ShareIcon);
interopIcon(SignOutIcon);
interopIcon(SwapIcon);
interopIcon(ThemeIcon);
interopIcon(TrashIcon);
interopIcon(TrashLineIcon);
interopIcon(TriangleAlertIcon);
interopIcon(WalletIcon);
interopIcon(XCircleIcon);
interopIcon(XIcon);
interopIcon(ZapIcon);

export {
  AddressBookIcon,
  AddressIcon,
  AddUserIcon,
  AlertCircleIcon,
  ArrowLeftIcon,
  BitcoinIcon,
  CameraOffIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CopyIcon,
  EditIcon,
  EditLineIcon,
  FingerprintIcon,
  HelpCircleIcon,
  ImageIcon,
  LinkIcon,
  MapLineIcon,
  NotesIcon,
  NotificationIcon,
  OnboardingIcon,
  PasteIcon,
  PasteLineIcon,
  QRIcon,
  ResetIcon,
  ScanIcon,
  SettingsIcon,
  SettingsLineIcon,
  ShareIcon,
  SignOutIcon,
  SwapIcon,
  ThemeIcon,
  TrashIcon,
  TrashLineIcon,
  TriangleAlertIcon,
  WalletIcon,
  XCircleIcon,
  XIcon,
  ZapIcon,
};
