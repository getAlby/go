const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const PODFILE_SNIPPET = `
  pod 'OpenSSL-Universal'
  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
`;

module.exports = function withOpenSSLPlugin(config, props = {}) {
  config = withDangerousMod(config, [
    "ios",
    async (config) => {
      const iosPath = path.join(config.modRequest.projectRoot, "ios");
      const podfilePath = path.join(iosPath, "Podfile");

      try {
        let podfileContent = fs.readFileSync(podfilePath, "utf8");

        if (!podfileContent.includes("pod 'OpenSSL-Universal'")) {
          podfileContent = podfileContent.replace(
            /(target 'AlbyGo' do[\s\S]*?use_react_native!\([\s\S]*?\))/m,
            `$1\n  ${PODFILE_SNIPPET}`,
          );
        }

        if (
          !podfileContent.includes("target 'NotificationServiceExtension' do")
        ) {
          const notificationTarget = `
target 'NotificationServiceExtension' do${PODFILE_SNIPPET}end
`;
          podfileContent += notificationTarget;
        }

        fs.writeFileSync(podfilePath, podfileContent, "utf8");
      } catch (error) {
        console.error("Failed to update Podfile:", error);
      }

      return config;
    },
  ]);

  return config;
};
