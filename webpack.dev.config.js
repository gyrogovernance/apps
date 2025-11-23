const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    sidepanel: './src/sidepanel.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dev-dist'),
    filename: '[name].js',
    publicPath: '/',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true, // Faster compilation for HMR
          },
        },
        exclude: [/node_modules/, /\.test\.tsx?$/],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: {
                filter: (url) => {
                  // Don't process font URLs - they're handled by CopyPlugin
                  return !url.includes('fonts/');
                }
              }
            }
          },
          'postcss-loader'
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/sidepanel.html',
      inject: 'body',
      scriptLoading: 'blocking',
      filename: 'sidepanel.html',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'public/manifest.json', to: 'manifest.json', noErrorOnMissing: true },
        { from: 'assets/media', to: 'assets/media', noErrorOnMissing: true },
        { from: 'assets/fonts', to: 'assets/fonts', noErrorOnMissing: true },
        { from: 'assets/files', to: 'assets/files', noErrorOnMissing: true },
        { from: 'assets/icons', to: 'assets/icons', noErrorOnMissing: true },
        { from: 'src/lib/thm-docs', to: 'lib/thm-docs', noErrorOnMissing: true }
      ]
    })
  ],
  devServer: {
    static: [
      {
        directory: path.join(__dirname, 'assets'),
        publicPath: '/assets',
      },
      {
        directory: path.join(__dirname, 'src/lib/thm-docs'),
        publicPath: '/lib/thm-docs',
      }
    ],
    port: 3000,
    hot: true,
    liveReload: false, // Use HMR instead
    open: ['sidepanel.html'],
    compress: true,
    historyApiFallback: {
      index: '/sidepanel.html',
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
  devtool: 'eval-source-map', // Better for HMR
  optimization: {
    runtimeChunk: 'single', // Better HMR performance
  },
};

