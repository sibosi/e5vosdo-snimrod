const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Force the bundler to use the project's root node_modules/react
  config.resolve.alias['react'] = path.resolve(
    __dirname,
    '../../node_modules/react'
  );
  config.resolve.alias['react-dom'] = path.resolve(
    __dirname,
    '../../node_modules/react-dom'
  );

  return config;
};
