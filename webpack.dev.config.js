const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/sidepanel.tsx',
  output: {
    path: path.resolve(__dirname, 'dev-dist'),
    filename: 'app.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/sidepanel.html',
      inject: true,
    }),
    new CopyPlugin({
      patterns: [
        { from: 'assets', to: 'icons', noErrorOnMissing: true },
        { from: 'public/icons', to: 'icons', noErrorOnMissing: true }
      ]
    })
  ],
  devServer: {
    static: [
      {
        directory: path.join(__dirname, 'dev-dist'),
      },
      {
        directory: path.join(__dirname, 'assets'),
        publicPath: '/icons',
      },
      {
        directory: path.join(__dirname, 'public/icons'),
        publicPath: '/icons',
      }
    ],
    port: 3000,
    hot: true,
    open: true,
  },
  devtool: 'source-map',
};

