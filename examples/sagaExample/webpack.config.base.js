const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const distPath = path.join(__dirname, 'dist');
const context = path.join(__dirname, 'src');
const getPostCssPlugins = () => [
  autoprefixer({ browsers: [
    '>1%',
    'last 4 versions',
    'Firefox ESR',
    'not ie < 9',
  ], }),
];

const base = (env) => ({
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
      {
        test: /\.(png|jpg|jpeg|gif|svg|eot|ttf|woff|woff2|otf)$/,
        include: path.join(context, './images'),
        use: env==='production'
          ? 'url-loader?limit=10000&name=/assets/[name].[hash:8].[ext]'
          :'file-loader?name=assets/[name].[hash:8].[ext]',
        // If the file is greater than the limit (10000 in bytes) the file-loader is used and all query parameters are passed to it.
      },
      {
        test: [ /\.scss$/, /\.css$/, ],
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader', options: { sourceMap: env!=='production', }, },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: env!=='production',
                plugins: getPostCssPlugins(),
              },
            },
            { loader: 'sass-loader', options: { sourceMap: env!=='production', }, },
          ], }),
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin({ filename: getPath => getPath('css/[name][hash].css').replace('css/js', 'css'),
      allChunks: true, }),
    new HtmlWebpackPlugin({
      template: `${context}/index.html`,
      path: distPath,
      filename: 'index.html',
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      names: [ 'vendor', 'manifest', 'index', ],
    }),
  ],
});

const vendor = [
  'react', 'react-dom', 'react-router', 'uuid', 'react-transition-group', 'react-router-dom', 'react-redux', 'redux-saga',
];
module.exports = {
  API_URL: process.env.API_URL || JSON.stringify('http://138.197.65.89:9000'),
  distPath,
  context,
  publicPath: '/',
  base,
  vendor,
};
