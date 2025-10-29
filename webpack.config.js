const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    sidepanel: './src/sidepanel.tsx',
    background: './src/background.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: false,
            compilerOptions: {
              noEmit: false,
              skipLibCheck: true
            }
          }
        },
        exclude: [/node_modules/, /\.test\.tsx?$/]
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
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true,
        },
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/sidepanel.html',
      inject: 'body',
      scriptLoading: 'blocking',
      filename: 'sidepanel.html',
      chunks: ['vendors', 'sidepanel']
    }),
    new CopyPlugin({
      patterns: [
        { from: 'public/manifest.json', to: 'manifest.json' },
        { from: 'assets/media', to: 'assets/media', noErrorOnMissing: true },
        { from: 'assets/fonts', to: 'assets/fonts', noErrorOnMissing: true },
        { from: 'assets/files', to: 'assets/files', noErrorOnMissing: true },
        { from: 'assets/icons', to: 'assets/icons', noErrorOnMissing: true }
      ]
    })
  ]
};

