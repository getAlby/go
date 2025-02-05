import {
  PopiconsAtSymbolSolid as AddressIcon,
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
  PopiconsLinkExternalSolid as LinkIcon,
  PopiconsArrowDownLine as MoveDownIcon,
  PopiconsArrowUpLine as MoveUpIcon,
  PopiconsLifebuoySolid as OnboardingIcon,
  PopiconsClipboardTextSolid as PasteIcon,
  PopiconsQrCodeMinimalSolid as QRIcon,
  PopiconsReloadLine as RefreshIcon,
  PopiconsReloadSolid as ResetIcon,
  PopiconsFullscreenSolid as ScanIcon,
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

interopIcon(AddressIcon);
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
interopIcon(LinkIcon);
interopIcon(MoveDownIcon);
interopIcon(MoveUpIcon);
interopIcon(OnboardingIcon);
interopIcon(PasteIcon);
interopIcon(QRIcon);
interopIcon(RefreshIcon);
interopIcon(ResetIcon);
interopIcon(ScanIcon);
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
  AddressIcon,
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
  LinkIcon,
  MoveDownIcon,
  MoveUpIcon,
  OnboardingIcon,
  PasteIcon,
  QRIcon,
  RefreshIcon,
  ResetIcon,
  ScanIcon,
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
