const webpack = require('webpack');
const path = require('path');

const distPath = path.join(__dirname, 'lib');
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
  ],
});

module.exports = {
  distPath,
  context,
  publicPath: '/',
  base,
};
