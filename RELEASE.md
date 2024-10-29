# Release

1. Update version in

- `app.json`
- `package.json`

2. Create a git tag and push it (a new draft release will be created)

- `git tag v1.2.3`
- `git push origin tag v1.2.3`
- Update the release notes and publish the release (APK will be built and added automatically)

3. Build packages

- `yarn eas:build:android`
- `yarn eas:build:ios`

3. Submit to app stores

- `eas submit --platform android`
- `eas submit --platform ios`

# Zapstore

Install required software:

- `sudo apt install apksigner apktool`
- https://github.com/sibprogrammer/xq
- https://github.com/zapstore/zapstore-cli

Then publish the release

1. `zapstore publish albygo -v <version>` (<version> without the `v` prefix)
1. Use nsec to sign release events
