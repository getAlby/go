![image](https://github.com/user-attachments/assets/c41c4ae2-ab4f-4fd8-8012-c6d3fbd8ca87)

# Alby Go

A simple lightning mobile wallet interface that works great with [Alby Hub](https://albyhub.com) or any other [NWC](https://nwc.dev) wallet service.

## Development

`yarn install`

`yarn start`

### Notifications

Push notifications are only available when running the app on a **physical device** using the following commands:

For iOS:

Run `yarn expo prebuild` (make sure to run this each time you edit `assets/ios/NotificationService.m`)

`yarn device:ios`

For Android:

`yarn device:android`

**Note:** Notifications do not work in the Expo Go app. You must run the app on a standalone build or a device using the above commands.

Download the google services from Firebase console and add it to the root directory

Add a .env.local in the root directory:

```env
GOOGLE_SERVICES_JSON=./google-services.json
```

Then run `yarn expo prebuild` (make sure to run this each time you edit `assets/android/MessagingService.kt`)

run `yarn device:android`

To view logs you can run `adb logcat | grep AlbyHubMessagingService`
