const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const exclusionList = require('metro-config/src/defaults/exclusionList');

// Roots
const projectRoot = __dirname; // apps/native
const monorepoRoot = path.resolve(projectRoot, '../..'); // e5vosdo-app/

// Load default Expo config
const config = getDefaultConfig(projectRoot);

// SVG transformer
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

// Extend asset/source extensions
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== 'svg'
);
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'svg',
  'cjs',
  'json',
];

// Monorepo watch folders
config.watchFolders = [
  monorepoRoot,
  path.join(monorepoRoot, 'packages/ui'),
  path.join(monorepoRoot, 'packages/resources'),
  path.join(monorepoRoot, 'packages/types'),
  path.join(monorepoRoot, 'packages/hooks'),
  path.resolve(__dirname, '../../node_modules'),
];

// Resolve modules and dedupe React Native
config.resolver.nodeModulesPaths = [
  path.join(monorepoRoot, 'node_modules'),
  path.join(projectRoot, 'node_modules'),
];
config.resolver.extraNodeModules = {
  '@repo/ui': path.join(monorepoRoot, 'packages/ui'),
  '@repo/resources': path.join(monorepoRoot, 'packages/resources'),
  '@repo/types': path.join(monorepoRoot, 'packages/types'),
  '@repo/hooks': path.join(monorepoRoot, 'packages/hooks'),
  'react-native': path.join(projectRoot, 'node_modules/react-native'),
};
config.resolver.blockList = exclusionList([
  new RegExp(`${monorepoRoot}/node_modules/react-native/.*`),
]);

config.projectRoot = projectRoot;

module.exports = withNativeWind(config, { input: './global.css' });
