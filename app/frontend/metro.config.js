const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');
const config = getDefaultConfig(projectRoot);

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== 'svg'
);
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'svg',
  'cjs',
  'json',
];

config.watchFolders = [
  monorepoRoot,
  path.join(monorepoRoot, 'packages/resources'),
  path.join(monorepoRoot, 'packages/types'),
  //  path.resolve(__dirname, '../../node_modules'),
];

config.resolver.nodeModulesPaths = [
  path.join(projectRoot, 'node_modules'),
  //  path.join(monorepoRoot, 'node_modules'),
];

config.resolver.extraNodeModules = {
  '@repo/resources': path.join(monorepoRoot, 'packages/resources'),
  '@repo/types': path.join(monorepoRoot, 'packages/types'),
  'react-native': path.join(projectRoot, 'node_modules/react-native'),
};

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  react: path.join(projectRoot, 'node_modules', 'react'),
  'react-dom': path.join(projectRoot, 'node_modules', 'react-dom'),
};

config.resolver.blockList = exclusionList([
  //  new RegExp(`${monorepoRoot}/node_modules/react-native/.*`),
  //  new RegExp(`${monorepoRoot}/node_modules/react/.*`),
]);

config.projectRoot = projectRoot;
module.exports = config;
