const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const libPath = path.join(__dirname, 'lib');
const context = path.join(__dirname, 'src');

module.exports = {
  context,
  devtool: 'source-map',
  entry: {// use babel-polyfill to enable new javascript features on old IE:s
    index: [ 'index.js', ],
    connect: [ 'connect.jsx', ],
    DevSubStore: [ 'DevSubStore.js', ],
    Provider: [ 'Provider.jsx', ],
    shape: [ 'shape.js', ],
    SubStore: [ 'SubStore.js', ],
    SubStoreLeaf: [ 'SubStoreLeaf.js', ],
  },
  output: {
    path: libPath,
    filename: '[name].js',
  },
  externals: { react: 'react', 'prop-types': 'prop-types', },
  resolve: {
    extensions: [ '.js', '.jsx', ],
    modules: [
      path.resolve(__dirname, 'node_modules'),
      context,
    ],
  }, module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      names: [ 'index', 'connect', 'DevSubStore', 'Provider', 'shape', 'SubStore', 'SubStoreLeaf', ],
    }),
    new CleanWebpackPlugin([ libPath, ]),
    new webpack.EnvironmentPlugin({ NODE_ENV: 'development', }),
    new UglifyJSPlugin({
      mangle: false,
      beautify: true,
      comments: false,
      sourceMap: true,
    }),
    new webpack.LoaderOptionsPlugin({ minimize: true, debug: false, }),
  ],
};
