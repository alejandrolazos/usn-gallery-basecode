const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PurgecssPlugin = require('purgecss-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const dotenv = require('dotenv').config();

// const isProd = process.env.NODE_ENV === 'production';
const PROD = 'production'; // JSON.parse(process.env.PROD_ENV || '0'); // 'production';
const paths = {
  src: path.resolve(__dirname),
  build: 
    path.resolve(__dirname, '..', 'dist', 'js') 
}

module.exports = {
  mode: PROD ? 'production' : 'development',
  entry: {
    "wgl.min": `${paths.src}/main.js`,
  },
  devtool: "source-map",
  output: {
    path: paths.build,
    filename: '[name].js',
    // filename: `[name].[contenthash].js`,
    // chunkFilename: '[id].[contenthash]',
    publicPath: '/',
  },
  resolve: {
    alias: {
      '@': `${paths.src}/`,
      'fonts': path.resolve(__dirname, '/'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              '@babel/plugin-proposal-object-rest-spread',
              '@babel/plugin-transform-template-literals',
              '@babel/plugin-proposal-class-properties'
            ],
          },
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            publicPath: './fonts/',
            outputPath: './fonts/'
        }
        },
      }
    ]
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: `[name].css`,
      // filename: `[name].[contenthash].css`,
    }),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(dotenv.parsed)
    }),
  ],

  node: {
    fs: 'empty',
  },
  stats: 'errors-only',
  optimization: {
    minimizer: PROD
      ? [
          new TerserPlugin({
            parallel: true,
            extractComments: 'all',
          }),
        ]
      : [],
  },
}