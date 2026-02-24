import {
  PopiconsAddressBookSolid as AddressBookIcon,
  PopiconsAtSymbolSolid as AddressIcon,
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
  PopiconsCircleInfoLine as HelpCircleLineIcon,
  PopiconsImageSolid as ImageIcon,
  PopiconsLikeSolid as LikeIcon,
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
import React from "react";
import { Path, Svg, type SvgProps } from "react-native-svg";

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
interopIcon(HelpCircleLineIcon);
interopIcon(ImageIcon);
interopIcon(LikeIcon);
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

// Custom NFC icon (not available in @popicons/react-native)
function NfcIcon({
  width = 24,
  height = 24,
  color,
  style,
  ...props
}: SvgProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
      {...props}
    >
      <Path
        d="M20 2H4C2.9 2 2 2.9 2 4V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V4C22 2.9 21.1 2 20 2ZM13 17H11V7H13V17ZM17 17H15V10H17V17ZM9 17H7V13H9V17Z"
        fill={(color as string) ?? "currentColor"}
      />
    </Svg>
  );
}
cssInterop(NfcIcon, {
  className: {
    target: "style",
    nativeStyleToProp: {
      color: true,
      opacity: true,
    },
  },
});

export {
  AddressBookIcon,
  AddressIcon,
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
  HelpCircleLineIcon,
  ImageIcon,
  LikeIcon,
  LinkIcon,
  MapLineIcon,
  NfcIcon,
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
