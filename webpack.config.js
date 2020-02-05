const path = require("path");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  entry: ["./server/src/core/index.websdk.ts"],
  output: {
    path: path.resolve(__dirname, "websdk"),
    filename: "index.js",
  },
  mode: "production",
  resolve: {
    extensions: [".ts", ".js", ".json"],
    alias: {
      "@amoebajs/builder$": "@amoebajs/builder/index.websdk",
    },
  },
  optimization: {
    minimize: true,
  },
  externals: ["fs", "module", "console", "child_process", "prettier"],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: require.resolve("ts-loader"),
            options: {
              transpileOnly: true,
              configFile: "tsconfig.websdk.json",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // new BundleAnalyzerPlugin()
  ],
};
