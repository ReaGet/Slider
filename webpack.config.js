const path = require("path");
const htmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "src/js/app.js"),
  output: {
    path: path.resolve(__dirname, "public"),
    clean: {
      keep: /slides/
    },
  },
  plugins: [
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
          "style-loader",
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              url: false,
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