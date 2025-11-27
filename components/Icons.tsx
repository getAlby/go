import {
  PopiconsAddressBookSolid as AddressBookIcon,
  PopiconsAtSymbolSolid as AddressIcon,
  PopiconsUserPlusSolid as AddUserIcon,
  PopiconsUserPlusLine as AddUserLineIcon,
  PopiconsCircleExclamationLine as AlertCircleIcon,
  PopiconsArrowLeftSolid as ArrowLeftIcon,
  PopiconsBitcoinSolid as BitcoinIcon,
  PopiconsAddressBookSolid as BookUserIcon,
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
  PopiconsUploadSolid as ExportIcon,
  PopiconsTouchIdSolid as FingerprintIcon,
  PopiconsCircleInfoSolid as HelpCircleIcon,
  PopiconsImageSolid as ImageIcon,
  PopiconsKeyboardSolid as KeyboardIcon,
  PopiconsLinkExternalSolid as LinkIcon,
  PopiconsMapLine as MapLineIcon,
  PopiconsArrowDownLine as MoveDownIcon,
  PopiconsArrowUpLine as MoveUpIcon,
  PopiconsNotePlusLine as NotesIcon,
  PopiconsNotificationSquareSolid as NotificationIcon,
  PopiconsLifebuoySolid as OnboardingIcon,
  PopiconsClipboardTextSolid as PasteIcon,
  PopiconsClipboardTextLine as PasteLineIcon,
  PopiconsPinSolid as PinIcon,
  PopiconsQrCodeMinimalSolid as QRIcon,
  PopiconsReloadLine as RefreshIcon,
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
interopIcon(AddUserLineIcon);
interopIcon(AlertCircleIcon);
interopIcon(ArrowLeftIcon);
interopIcon(BitcoinIcon);
interopIcon(BookUserIcon);
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
interopIcon(ExportIcon);
interopIcon(FingerprintIcon);
interopIcon(HelpCircleIcon);
interopIcon(ImageIcon);
interopIcon(KeyboardIcon);
interopIcon(LinkIcon);
interopIcon(MapLineIcon);
interopIcon(MoveDownIcon);
interopIcon(MoveUpIcon);
interopIcon(NotesIcon);
interopIcon(NotificationIcon);
interopIcon(OnboardingIcon);
interopIcon(PasteIcon);
interopIcon(PasteLineIcon);
interopIcon(PinIcon);
interopIcon(QRIcon);
interopIcon(RefreshIcon);
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
  AddUserLineIcon,
  AlertCircleIcon,
  ArrowLeftIcon,
  BitcoinIcon,
  BookUserIcon,
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
  ExportIcon,
  FingerprintIcon,
  HelpCircleIcon,
  ImageIcon,
  KeyboardIcon,
  LinkIcon,
  MapLineIcon,
  MoveDownIcon,
  MoveUpIcon,
  NotesIcon,
  NotificationIcon,
  OnboardingIcon,
  PasteIcon,
  PasteLineIcon,
  PinIcon,
  QRIcon,
  RefreshIcon,
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
