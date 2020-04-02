const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DynamicCdnWebpackPlugin = require('dynamic-cdn-webpack-plugin');
const moduleToCdn = require('module-to-cdn');

module.exports = {
  entry: {
    app: ['./index.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
    ],
  },
  context: path.join(__dirname, 'src'),
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Symbol Art Editor',
      template: 'index.html',
    }),
    new DynamicCdnWebpackPlugin({
      only: ['react', 'react-dom', 'regl', 'gl-matrix'],
      resolver: function (name, version, options) {
        switch (name) {
          case 'regl':
            return {
              name: 'regl',
              var: 'createREGL',
              url: `https://unpkg.com/regl@${version}/dist/regl.min.js`,
            };
          case 'gl-matrix':
            return {
              name: 'gl-matrix',
              var: 'glMatrix',
              url: `https://unpkg.com/gl-matrix@${version}/gl-matrix-min.js`,
            };
          default:
            return moduleToCdn(name, version, options);
        }
      },
    }),
  ],
};
