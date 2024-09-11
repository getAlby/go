import { PermissionStatus } from "expo-modules-core/src/PermissionsInterface";
import { View } from "react-native";
import { FocusableCamera } from "./FocusableCamera";
import React, { useEffect } from "react";
import Loading from "./Loading";
import { Camera } from "expo-camera";
import { Text } from "~/components/ui/text";
import { CameraOff } from "./Icons";

type QRCodeScannerProps = {
    onScanned: (data: string) => void;
    scanning?: boolean;
};

function QRCodeScanner({ onScanned, scanning = true }: QRCodeScannerProps) {
    const [isLoading, setLoading] = React.useState(false);
    const [permissionStatus, setPermissionStatus] = React.useState(PermissionStatus.UNDETERMINED);

    useEffect(() => {
        if (scanning) {
            // Add some timeout to allow the screen transition to finish before
            // starting the camera to avoid stutters
            setLoading(true);
            window.setTimeout(async () => {
                await requestCameraPermission();
                setLoading(false);
            }, 200);
        }
    }, [scanning]);

    async function requestCameraPermission() {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setPermissionStatus(status);
    }

    const handleScanned = (data: string) => {
        if (scanning) {
            console.log(`Bar code with data ${data} has been scanned!`);
            onScanned(data);
        }
    };

    return (
        <>
            {isLoading || !scanning && (
                <View className="flex-1 justify-center items-center">
                    <Loading />
                </View>
            )}
            {!isLoading && scanning && (
                <>
                    {permissionStatus === PermissionStatus.DENIED && (
                        <View className="flex-1 h-full flex flex-col items-center justify-center gap-2 p-6">
                            <CameraOff className="text-foreground" size={64} />
                            <Text className="text-2xl text-foreground text-center">Camera Permission Denied</Text>
                            <Text className="text-muted-foreground text-xl text-center">It seems you denied permissions to use your camera. You might need to go to your device settings to allow access to your camera again.</Text>
                        </View>
                    )}
                    {permissionStatus === PermissionStatus.GRANTED && (
                        <FocusableCamera onScanned={handleScanned} />
                    )}
                </>
            )}
        </>
    );
}

export default QRCodeScanner;
