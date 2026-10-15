![image](https://github.com/user-attachments/assets/b68b6da1-a5e0-4958-afa9-c0ba83be7c59)

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

## Translations

The app uses [i18next](https://www.i18next.com/) with [react-i18next](https://react.i18next.com/). Translations live in `locales/<language>/<area>.json` (one file per area: `common`, `home`, `onboarding`, `unlock`, `send`, `receive`, `transactions`, `settings`, `wallets`, `map`, `errors`) and are merged into a single namespace by the generated `locales/generated.ts`, so a key looks like `settings.language.title`. Plurals use the i18next suffixes (`sats_one`, `sats_few`, `sats_many`, `sats_other`), interpolation uses `{{name}}`. Each language directory also has a `meta.json` manifest: `{ "name": "Čeština", "tag": "cs-CZ", "weekStart": 1 }` (`name` is the language name in that language as shown in the settings, `tag` the BCP-47 tag mirrored to the native notification code, `weekStart` the first day of the week, 0 = Sunday).

English is the source language. The language can be changed in Settings → Language; by default the device language is used (falling back to English). Numbers and dates are formatted for the selected language via `lib/format.ts`; month and weekday names come from the platform's `Intl` data (a translation can override them with an optional `common.calendar` object holding `months`, `monthsShort`, `weekdays`, `weekdaysShort` and `weekdaysMin` arrays, e.g. for a genitive month form).

To add a language, only files under `locales/` change:

1. Copy `locales/en` to `locales/<code>` (`<code>` is the BCP-47 language tag, e.g. `de` or `pt-BR`), edit `meta.json` and translate the values (keep the keys).
2. Add the plural forms the language needs (`_one`, `_few`, `_many`, `_other`, ...); `yarn i18n:check` lists the missing ones.
3. Optionally add `locales/native/<code>.json` with the iOS permission dialog texts; `app.config.js` picks it up automatically.
4. Run `yarn i18n:generate && yarn i18n:check`.

`yarn i18n:generate` rewrites the committed `locales/generated.ts` (language registry, types, resources) and `locales/generated-plurals.ts` (plural rules data). `yarn i18n:check` verifies the manifests, that the generated files are up to date, that all languages have the same keys and plural forms and that every key used in the sources exists. It is part of `yarn lint` and CI.
