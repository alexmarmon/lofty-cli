const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

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
    extensions: ['.js', '.vue'],
    // alias vue and vuex to get full builds
    // https://vuejs.org/v2/guide/installation.html
    alias: {
      vue: path.resolve('node_modules/vue/dist/vue.js'),
      vuex: path.resolve('node_modules/vuex/dist/vuex.js'),
      styles: path.resolve('src/styles/'),
      modules: path.resolve('src/modules/'),
    },
  },

  module: {
    // define common rules to bundle
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        exclude: /node_modules/,
        options: {
          // autoprefix css with default config
          postcss: [
            require('autoprefixer')({browsers: ['last 2 versions']}),
          ],
          loaders: {
            // overwrite default loaders for language blocks inside .vue files
            js: [
              'babel-loader',
              'eslint-loader',
            ],
          },
        },
      },
      {
        // es6 -> es5
        test: /\.js$/,
        use: ['babel-loader'],
        include: path.resolve('./src'),
      },
      {
        // eslint all vue and js files
        // before compilation
        test: /\.(vue|js)$/,
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
  },
};

module.exports = config;