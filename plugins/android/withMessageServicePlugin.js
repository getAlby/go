const {
  withAndroidManifest,
  withAppBuildGradle,
  withDangerousMod,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function withMessagingServicePlugin(config, props = {}) {
  config = withMessagingService(config, props);
  config = withAndroidManifest(config, modifyAndroidManifest);
  config = withAppBuildGradle(config, modifyAppBuildGradle);
  return config;
};

function getPackageName(config) {
  return config.android && config.android.package
    ? config.android.package
    : null;
}

function withMessagingService(config, props) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const srcFilePath = path.resolve(projectRoot, props.androidFMSFilePath);

      const packageName = getPackageName(config);
      if (!packageName) {
        throw new Error("Android package name not found in app config.");
      }

      const packagePath = packageName.replace(/\./g, path.sep);

      const destDir = path.join(
        projectRoot,
        "android",
        "app",
        "src",
        "main",
        "java",
        packagePath,
      );
      const destFilePath = path.join(destDir, "MessagingService.kt");

      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(srcFilePath, destFilePath);

      return config;
    },
  ]);
}

function modifyAndroidManifest(config) {
  const androidManifest = config.modResults;

  const application = androidManifest.manifest.application?.[0];
  if (!application) {
    throw new Error("Could not find <application> in AndroidManifest.xml");
  }

  if (!application.service) {
    application.service = [];
  }

  const serviceExists = application.service.some(
    (service) => service.$["android:name"] === ".MessagingService",
  );

  if (!serviceExists) {
    application.service.push({
      $: {
        "android:name": ".MessagingService",
        "android:exported": "false",
      },
      "intent-filter": [
        {
          action: [
            {
              $: {
                "android:name": "com.google.firebase.MESSAGING_EVENT",
              },
            },
          ],
        },
      ],
    });
  }

  return config;
}

function modifyAppBuildGradle(config) {
  let buildGradle = config.modResults.contents;
  const firebaseDependency = `implementation("com.google.firebase:firebase-messaging:23.2.1")`;

  if (!buildGradle.includes(firebaseDependency)) {
    buildGradle = buildGradle.replace(/dependencies\s?{/, (match) => {
      return `${match}\n    ${firebaseDependency}`;
    });
  }

  const bcDependency = `implementation("org.bouncycastle:bcprov-jdk15to18:1.76")`;
  if (!buildGradle.includes(bcDependency)) {
    buildGradle = buildGradle.replace(/dependencies\s?{/, (match) => {
      return `${match}\n    ${bcDependency}`;
    });
  }

  config.modResults.contents = buildGradle;
  return config;
}
