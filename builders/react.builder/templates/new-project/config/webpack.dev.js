const path = require('path');
const webpack = require('webpack');
const Merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const PrettyPrintPlugin = require('@lofty/lofty-pretty-print-plugin');
const CommonConfig = require('./webpack.common.js');

// merge dev environment config with common config
const config = Merge(CommonConfig, {
  entry: {
    main: [
      // add webpack-hot-middleware to bundle and
      // remove console logs
      'webpack-hot-middleware/client?noInfo=true',
      // add fetch polyfill for api requests
      'whatwg-fetch',
      // add application code to bundle
      path.resolve('./src/index'),
    ],
    // add common vendors to seperate build file
    vendor: [
      'mobx', 'mobx-react', 'react', 'react-dom', 'react-router',
    ]
  },

  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        exclude: /node_modules/,
        include: path.resolve('./src'),
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' },
          { loader: 'postcss-loader',
            options: {
              plugins: (loader) => [
                require('autoprefixer')({browsers: ['last 2 versions']}),
              ],
            },
          },
        ],
      },
    ],
  },

  // define webpack output
  output: {
    publicPath: path.resolve('/'),
    filename: '[name].dev.js',
    path: path.resolve('./dev'),
  },

  // fastest for dev
  // - https://webpack.js.org/configuration/devtool/
  devtool: '#eval-source-map',

  externals: {
    'react/addons': 'true',
    'react/lib/ExecutionEnvironment': 'true',
    'react/lib/ReactContext': 'true',
  },

  plugins: [
    // create global constants
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    }),
    // enable hot reload - webpack-hot-middleware
    new webpack.HotModuleReplacementPlugin(),
    // serve index.html file to client and auto inject script tags
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    // custom pretty print output
    new PrettyPrintPlugin(),
    // This plugin will cause the relative path of the module to be displayed
    new webpack.NamedModulesPlugin(),
    // https://webpack.js.org/plugins/commons-chunk-plugin/
    new webpack.optimize.CommonsChunkPlugin({
      names: ['common', 'vendor'],
      minChunks: Infinity
    }),
  ],
});

module.exports = config;
