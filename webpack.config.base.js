const webpack = require('webpack');
const path = require('path');

const distPath = path.join(__dirname, 'dist');
const context = path.join(__dirname, 'src');

const base = () => ({
  resolve: {
    extensions: [ '.js', '.jsx', ],
    modules: [
      path.resolve(__dirname, 'node_modules'),
      context,
    ],
  },
  module: {
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
      names: [ 'vendor', ],
    }),
  ],
});

const vendor = [ 'react', 'prop-types', ];
module.exports = {
  distPath,
  context,
  publicPath: '/',
  base,
  vendor,
};
