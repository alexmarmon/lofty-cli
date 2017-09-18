const path = require('path');
const webpack = require('webpack');
const Merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
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
      path.resolve('./src/index')
    ],
    // without vendor file vue is removed from the hot bundle...
    vendor: [
      'vue', 'vuex', 'vue-router',
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
  ],
});

module.exports = config;