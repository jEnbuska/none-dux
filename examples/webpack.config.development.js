const webpack = require('webpack');
const merge = require('webpack-merge');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const { context, distPath, publicPath, base, API_URL, vendor, }= require('./webpack.config.base');

const port = process.env.PORT || 8000;
const host = process.env.HOST || '0.0.0.0';

module.exports = merge(base('development'), {
  devtool: 'source-map',
  context,
  entry: {
    bundle: 'index.jsx',
    vendor,
  },
  output: {
    path: distPath,
    filename: '[name].[hash].js',
    publicPath,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        API_URL,
        NODE_ENV: JSON.stringify('development'),
      },
    }),
    new webpack.HotModuleReplacementPlugin(),
    new OpenBrowserPlugin({ url: `http://${host}:${port}/`, }),
  ],
  devServer: {
    // host must be set to enable accessing server from localhost:${PORT} when devServer running in docker
    port,
    host,
    contentBase: context,
    historyApiFallback: true,
    watchOptions: {
      aggregateTimeout: 100,
      poll: 200,
    },
  },
});
