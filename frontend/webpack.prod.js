const { merge } = require("webpack-merge");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const commonConfig = require("./webpack.common");
const packageJson = require("./package.json");

module.exports = () => {
  const prodConfig = {
    mode: "production",
    output: {
      publicPath: "/WIP/",
      filename: "[name].[contenthash].js",
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
    ],
};

return merge(commonConfig, prodConfig);
};
