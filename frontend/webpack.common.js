const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
  entry: "./src/index.ts",
  devtool: "eval-source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    modules: [path.resolve(__dirname, "src"), "node_modules"],
    alias: {
      src: path.resolve(__dirname, "src"),
      "@types": path.resolve(__dirname, "src/types/**/*"),
    },
  },
  module: {
    rules: [
      // typescript file loader
      {
        test: /\.(js|jsx|tsx|ts)$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            sourceMap: true, // Enable source maps for TypeScript
          },
        },
      },
      // css or scss
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"], // Only handle CSS files
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              sourceMap: true, // optional but helpful
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[hash].[ext]",
              outputPath: "assets/",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new CopyWebpackPlugin({
          patterns: [
            { from: 'public/manifest.json', to: 'manifest.json' },
          ]
        })
  ],
};
