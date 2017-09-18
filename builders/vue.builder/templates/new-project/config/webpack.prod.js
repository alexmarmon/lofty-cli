const path = require('path');
const webpack = require('webpack');
const Merge = require('webpack-merge');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CommonConfig = require('./webpack.common.js');

// use smart strategy to force replacement
// of the following configs
// - https://github.com/survivejs/webpack-merge
const config = Merge.smartStrategy({
  'module.entry': 'replace',
  'module.rules': 'replace',
  'module.resolve': 'replace'
})(CommonConfig, {

  entry: {
    // add application code to bundle
    main: [
      path.resolve('./src/index')
    ],
    // create vendor file that can be cached by user
    vendor: ['vuex', 'vue', 'vue-router', 'whatwg-fetch']
  },

  resolve: {
    // automatically resolve these extensions when importing
    // ex : import file from './modules/file.js' => import file from './modules/file'
    extensions: ['.js', '.vue'],
    // alias vue and vuex to get minified builds
    // https://vuejs.org/v2/guide/installation.html
    alias: {
      'vue': path.resolve('node_modules/vue/dist/vue.min.js'),
      'vuex': path.resolve('node_modules/vuex/dist/vuex.min.js'),
      'styles': path.resolve('src/styles/'),
      'modules': path.resolve('src/modules/'),
    },
  },

  module: {
    // rules are recreated from common.
    // vue-loader now includes logic to extract css bundle
    // from javascript.
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        exclude: /node_modules/,
        options: {
          // default catch incase css files are added somewhere
          extractCSS: true,
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
            // extract scss into separate bundle
            scss: ExtractTextPlugin.extract({
              use: [
                'css-loader',
                'sass-loader',
              ],
              fallback: 'vue-style-loader' // dependency of vue-loader
            }),
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

  // specify bundle output config
  output: {
    publicPath: path.resolve('/assets/'),
    filename: '[name].js',
    path: path.resolve('./prod/assets'),
  },

  // fastest for production
  // - https://webpack.js.org/configuration/devtool/
  devtool: 'cheap-source-map',

  plugins: [
    // create global constants
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    // new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['common', 'vendor'],
      minChunks: Infinity
    }),
    // include plugin to extract css into single file
    new ExtractTextPlugin("style.css"),
    // create index.html file
    new HtmlWebpackPlugin({
      filename: '../index.html',
      template: 'index.html',
      inject: true
    }),
  ],
});

module.exports = config;