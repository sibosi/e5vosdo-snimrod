// apps/native/metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");
const defaultConfig = getDefaultConfig(projectRoot);

defaultConfig.watchFolders = [
  monorepoRoot,
  path.resolve(monorepoRoot, "packages/ui"),
  path.resolve(monorepoRoot, "packages/types"),
];

defaultConfig.resolver.nodeModulesPaths = [
  path.resolve(monorepoRoot, "node_modules"),
  path.resolve(projectRoot, "node_modules"),
];

module.exports = withNativeWind(defaultConfig, { input: "./global.css" });
