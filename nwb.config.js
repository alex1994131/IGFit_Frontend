const path = require('path');
const webpack = require("webpack");

module.exports = {
  babel: {
    plugins: [
      ["import", { "libraryName": "antd-mobile", "style": "true" }] // `style: true` for less
    ]
  },
  webpack: {
    aliases: {
      "../../theme.config": path.join(__dirname, "./src/semantic-ui/theme.config"),
      "../semantic-ui/site": path.join(__dirname, "./src/semantic-ui/site"),
      "../../data/txdata": path.join(__dirname, process.env.NODE_ENV == "production" ? "./src/data/txdata2" : "./src/data/txdata"),
      "../data/txdata": path.join(__dirname, process.env.NODE_ENV == "production" ? "./src/data/txdata2" : "./src/data/txdata")
    },
    rules: {
      babel: {
        exclude: [/node_modules[\\/](?!react-app-polyfill)/, path.resolve(__dirname, "./src/data/csvdata.js"), path.resolve(__dirname, "./src/data/pricesoffline.js"), path.resolve(__dirname, "./src/data/txdata.js")
        ]
      }
    },
    publicPath: '',
    extra: {
      module: {
        rules: [
          { test: /\.tsx?$/, loader: "ts-loader", exclude: ['/node_modules/', '/Archive/'], },
        ]
      },
      plugins: [
        new webpack.EnvironmentPlugin(['NODE_ENV'])
      ],
      resolve: {
        extensions: ['.tsx', '.ts', '.js'],
      },
    },
  }
}