const path = require('path');
const webpack = require('webpack');

const config = {
  // the base directory for resolving entry points and loaders from configuration
  context: path.resolve('./'),

  // remove webpack performace hints
  performance: {
    hints: process.env.npm_lifecycle_event === 'build' ? "warning" : false
  },

  resolve: {
    // automatically resolve these extensions when importing
    // ex : import file from './modules/file.js' => import file from './modules/file'
    extensions: ['.js', '.jsx'],
    // alias styles, modules, and state
    alias: {
      styles: path.resolve('src/styles/'),
      modules: path.resolve('src/modules/'),
      state: path.resolve('src/state'),
    }
  },

  module: {
    // define common rules to bundle
    rules: [
      {
        // es6 -> es5
        test: /\.(jsx?|js)$/,
        use: ['babel-loader'],
        include: path.resolve('./src'),
      },
      {
        // eslint all vue and js files
        // before compilation
        test: /\.(jsx?|js)$/,
        exclude: /node_modules/,
        include: path.resolve('./src'),
        use: 'eslint-loader',
        enforce: 'pre',
      },
      {
        // use file loader to import all fonts
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: 'file-loader?name=fonts/[name].[ext]',
        include: path.resolve('./src'),
      }
    ],
  },

  node: {
    // polyfill or mock certain Node.js globals - https://webpack.js.org/configuration/node/
    fs: "empty",
    net: "empty",
    tls: "empty",
  }
};

module.exports = config;
