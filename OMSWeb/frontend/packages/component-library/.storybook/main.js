const path = require('path')
const fs = require("fs")
const PnpWebpackPlugin = require(`pnp-webpack-plugin`)

function getPackageDir(filepath) {
  let currDir = path.dirname(require.resolve(filepath));
  while (true) {
    if (fs.existsSync(path.join(currDir, "package.json"))) {
      return currDir;
    }
    const { dir, root } = path.parse(currDir);
    if (dir === root) {
      throw new Error(
        `Could not find package.json in the parent directories starting from ${filepath}.`
      );
    }
    currDir = dir;
  }
}

const resolvePath = {
}

module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  webpackFinal: async (config, { configType }) => {
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      use: {
        loader: require.resolve('ts-loader'),
        options: {
          transpileOnly: true,
          configFile: path.resolve(__dirname, "tsconfig.json")
        }, 
      },
    })
    config.resolve = { ...config.resolve, plugins: [ PnpWebpackPlugin, ] }
    config.resolve.alias = { ...config.resolve.alias, ...resolvePath }
    config.resolveLoader = { ...config.resolveLoader, plugins: [ PnpWebpackPlugin.moduleLoader(module), ], }
    return config
  },
}