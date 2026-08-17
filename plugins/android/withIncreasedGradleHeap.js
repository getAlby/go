const { withGradleProperties, AndroidConfig } = require("expo/config-plugins");

// The default template heap (~2GB) isn't enough for :app:mergeReleaseNativeDebugMetadata
// once native debug symbols are merged across all 4 ABIs for this project's native
// modules (reanimated, gesture-handler, worklets, etc.), causing CI release builds to
// fail with "Java heap space".
const GRADLE_JVM_ARGS =
  "-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8";

module.exports = function withIncreasedGradleHeap(config) {
  return withGradleProperties(config, (config) => {
    config.modResults =
      AndroidConfig.BuildProperties.updateAndroidBuildProperty(
        config.modResults,
        "org.gradle.jvmargs",
        GRADLE_JVM_ARGS,
      );
    return config;
  });
};
