const webpack = require('webpack');
const merge = require('webpack-merge');
const config = require('./webpack.config');

module.exports = merge(config.base('development'), {
  devtool: 'source-map',
  context: config.sourcePath,
  entry: {
    bundle: config.bundle,
    vendor: config.vendorLibs,
  },
  output: {
    path: config.distPath,
    filename: config.outputFileNameTemplate,
    publicPath: '/',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    // host must be set to enable accessing server from localhost:${PORT} when devServer running in docker
    host: '0.0.0.0',
    contentBase: config.sourcePath,
    historyApiFallback: true,
    port: 8001,
    watchOptions: {
      aggregateTimeout: 50,
      poll: 100,
    },
  },
});
