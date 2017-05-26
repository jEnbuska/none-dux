const webpack = require('webpack');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { context, vendor, distPath, publicPath, base, }= require('./webpack.config.base');

module.exports = merge(base('production'), {
  context,
  entry: {// use babel-polyfill to enable new javascript features on old IE:s
    bundle: [ 'babel-polyfill', 'index.js', ],
    vendor,
    publicPath,
  },
  output: {
    path: distPath,
    filename: '[name].js',
  },
  plugins: [
    new CleanWebpackPlugin([ distPath, ]),
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
