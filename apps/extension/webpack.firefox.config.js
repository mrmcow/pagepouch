const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    background: './src/background/index.ts',
    content: './src/content/index.ts',
    // Use vanilla JS popup for Firefox to avoid React CSP issues
  },
  output: {
    path: path.resolve(__dirname, 'dist-firefox'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true, // Skip type checking for faster builds
            configFile: path.resolve(__dirname, 'tsconfig.json'),
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@pagestash/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
    fallback: {
      "process": require.resolve("process/browser"),
      "buffer": require.resolve("buffer"),
    },
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        // Use Firefox-specific manifest
        { from: 'manifest.firefox.json', to: 'manifest.json' },
        { from: 'icons', to: 'icons', noErrorOnMissing: true },
        // Copy Firefox-specific popup files
        { from: 'src/popup/firefox-popup.js', to: 'firefox-popup.js' },
        { from: 'popup.firefox.html', to: 'popup.html' },
      ],
    }),
    // Remove HtmlWebpackPlugin since we're copying the HTML directly
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    // Define Firefox-specific environment variables
    new webpack.DefinePlugin({
      'process.env.BROWSER_TARGET': JSON.stringify('firefox'),
      'process.env.MANIFEST_VERSION': JSON.stringify(2),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    }),
  ],
  devtool: 'cheap-module-source-map',
};
