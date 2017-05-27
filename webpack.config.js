const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

function plugins(env) {
  if (typeof env.production === 'undefined') {
    env.production = process.env.NODE_ENV === 'production';
  }

  let plugins = [
    new HtmlWebpackPlugin({
      inject: true,
      template: 'public/index.html',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': env.production ? '"production"' : '"development"',
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
    }),
  ];
  if (env.production) {
    plugins = plugins.concat([
      new ExtractTextPlugin('[name]-[hash:8].css'),
      new webpack.optimize.UglifyJsPlugin({
        compress: env.production ? {
          screw_ie8: true,
          warnings: false,
        } : false,
        sourceMap: true,
        mangle: {
          screw_ie8: true,
        },
        output: {
          comments: false,
          screw_ie8: true,
        },
      }),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.LoaderOptionsPlugin({
        minimize: true,
      }),
    ]);
  } else {
    plugins = plugins.concat([
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
    ]);
  }
  return plugins;
}

module.exports = function(env) {
  return {
    entry: {
      vendor: [
        'react',
        'react-dom',
        'redux',
        'react-redux',
        'core-js',
      ],
      main: [
        ...(env.production ? [] : []),
        './src/index.js',
      ],
    },
    resolve: {
      extensions: ['.js', '.json'],
    },
    devtool: env.production ? false : 'eval-source-map',
    devServer: env.production ? {} : {
      hot: false,
    },
    watch: env.production ? false : true,
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.jsx?$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/,
        },
        {
          exclude: [
            /\.jsx?$/,
            /\.css$/,
            /\.less$/,
            /\.html$/,
          ],
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'static/media/[name].[hash:8].[ext]',
          },
        },
        {
          test: /\.jsx?$/,
          loader: env.production ? 'babel-loader' : 'babel-loader?cacheDirectory=true&retainLines=true',
        },
        {
          test: /\.css$/,
          loader: env.production ? ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader?importLoaders=true'}) : 'style-loader!css-loader?importLoaders=true',
        },
        {
          test: /\.less$/,
          loader: env.production ? ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader?importLoaders=true!less-loader'}) : 'style-loader!css-loader?importLoaders=true!less-loader',
        },
      ],
    },
    output: {
      path: path.resolve(__dirname, 'build'),
      pathinfo: !env.production,
      filename: '[name]-[hash:8].js',
    },
    plugins: plugins(env),
    bail: env.production ? true : false,
  };
};
