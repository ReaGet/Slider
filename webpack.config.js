const path = require("path");
const htmlWebpackPlugin = require("html-webpack-plugin");
const miniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: path.resolve(__dirname, "src/js/app.js"),
  output: {
    path: path.resolve(__dirname, "public"),
    clean: {
      keep: /slides/
    },
  },
  plugins: [
    new miniCssExtractPlugin({
      filename: `./styles/styles.css`,
    }),
    new htmlWebpackPlugin({
      template: path.resolve(__dirname, "src/index.html"),
      filename: "index.html",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(sc|sa|c)ss$/i,
        use: [
          // "style-loader",
          miniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              url: true,
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          }
        ]
      }
    ],
  },
  devServer: {
    hot: true,
    watchFiles: ["src/index.html"],
    static: {
      directory: path.resolve(__dirname, "public/"), 
    },
  },
}