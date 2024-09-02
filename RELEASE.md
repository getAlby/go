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