const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const defaultConfig = getDefaultConfig(projectRoot);

defaultConfig.transformer = {
  ...defaultConfig.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};
defaultConfig.resolver = {
  ...defaultConfig.resolver,
  assetExts: defaultConfig.resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
};

const config = defaultConfig;

// 1) tell Metro about all of the workspaces/folders we want to watch
config.watchFolders = [
  monorepoRoot,
  path.join(monorepoRoot, 'packages/ui'),
  path.join(monorepoRoot, 'packages/resources'),
  path.join(monorepoRoot, 'packages/types'),
];

// 2) point module resolution at our monorepo packages and avoid double React Native
config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.join(monorepoRoot, 'node_modules'),
    path.join(projectRoot, 'node_modules'),
  ],
  extraNodeModules: {
    // alias your packages
    '@repo/ui': path.join(monorepoRoot, 'packages/ui'),
    '@repo/resources': path.join(monorepoRoot, 'packages/resources'),
    '@repo/types': path.join(monorepoRoot, 'packages/types'),
    // ensure all RN imports resolve to the single copy in this app
    'react-native': path.join(projectRoot, 'node_modules/react-native'),
  },
  // block any RN copies from other workspaces
  blockList: exclusionList([
    new RegExp(`${monorepoRoot}/node_modules/react-native/.*`),
  ]),
  // you can extend if you have custom extensions
  sourceExts: [...config.resolver.sourceExts, 'cjs', 'json'],
};

module.exports = withNativeWind(config, { input: './global.css' });
