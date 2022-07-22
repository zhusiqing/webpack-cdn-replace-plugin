const { resolve, extname } = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const { UploadPlugin } = require('../lib/index.js')
module.exports = {
  mode: 'production',
  entry: resolve(__dirname, './src/index.js'),
  output: {
    path: resolve(__dirname, './dist'),
    filename: '[name].[contenthash:6].js',
    publicPath: '',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [ MiniCssExtractPlugin.loader, 'css-loader' ]
      },
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'img/[name].[contenthash:6].[ext]'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:6].css'
    }),
    new OptimizeCssAssetsPlugin(),
    new UploadPlugin({
      cache: false,
      uploadFn: async(path, fileName) => {
        return `http://test.cdn/${fileName}`
      }
    })
  ]
}
