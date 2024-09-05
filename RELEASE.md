# Release 

1. Update version in 
 - `app.json`
 - `package.json`

2. Build packages
 - `yarn eas:build:android`
 - `yarn eas:build:ios`

3. Submit to app stores
 - `eas submit --platform android`
 - `eas submit --platform ios`

# Zapstore

Pre-requirements to have installed:
- `sudo apt install apksigner`
- https://github.com/sibprogrammer/xq \
- https://github.com/zapstore/zapstore-cli \

1. Make sure you have the apk file locally, either by building it with `eas --local --profile production_apk --output=./alby-go-<version>-android.apk` or downloading it from expo.dev or github release.
2. `zapstore publish albygo -a alby-go-<version>-android.apk -r <version>`
3. use Alby nsec to sign during zapstore publish

