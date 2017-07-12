const webpack = require('webpack');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const config = require('./webpack.config');

module.exports = merge(config.base('production'), {
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
    new CleanWebpackPlugin([ `${config.distPath}/*`, ]),
    new webpack.optimize.CommonsChunkPlugin({
      names: [ 'vendor', /*'manifest',*/ ],
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
      },
      output: {
        comments: false,
      },
    }),
    new webpack.LoaderOptionsPlugin({ minimize: true, debug: false, }),
  ],
});
