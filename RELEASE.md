# Release

1. Update version in

- `app.config.js`
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

Install [zsp](https://github.com/zapstore/zsp)

Then publish the release

1. `zsp publish --wizard`
1. Use nsec to sign release events
