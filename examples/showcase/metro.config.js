const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const packageRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [packageRoot];
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "@teelabs/native-utility-pack": packageRoot,
  react: path.resolve(projectRoot, "node_modules/react"),
  "react-dom": path.resolve(projectRoot, "node_modules/react-dom"),
  "react-native": path.resolve(projectRoot, "node_modules/react-native"),
};
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (["react", "react-dom", "react-native"].includes(moduleName)) {
    return {
      type: "sourceFile",
      filePath: path.resolve(
        projectRoot,
        "node_modules",
        moduleName,
        "index.js",
      ),
    };
  }

  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
