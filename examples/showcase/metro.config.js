const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const packageRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [packageRoot];
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "@teelabs/native-utility-pack": packageRoot,
};

module.exports = config;
