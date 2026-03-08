const { merge } = require("webpack-merge");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const commonConfig = require("./webpack.common");
const packageJson = require("./package.json");

module.exports = () => {
  const devConfig = {
    mode: "development",
    // devtool: "inline-source-map",
    devtool: "source-map",
    output: {
      publicPath: "http://localhost:3086/",
      filename: "[name].[contenthash].js",
    },
    devServer: {
      port: 3086,
      historyApiFallback: {
        index: "/",
      },
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
    plugins: [
      new ModuleFederationPlugin({
        name: "WIP",
        filename: "remoteEntry.js",
        exposes: {
          "./WipDashboard": "./src/pages/WipDashboard/index.tsx",
        },
        shared: packageJson.dependencies,
      }),
      new HtmlWebpackPlugin({
        template: "./public/index.html",
      }),
    ],
  };

  return merge(commonConfig, devConfig);
};
