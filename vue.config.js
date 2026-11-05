// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
process.env.VUE_APP_VERSION = require('./package.json').version

module.exports = {
  'transpileDependencies': [
    'vuetify'
  ],
  configureWebpack: {
    // plugins: [new BundleAnalyzerPlugin()],
    resolve: {
      alias: {
        'plotly.js$': 'plotly.js/dist/plotly-basic.js'
      }
    }
  },
  chainWebpack: (config) => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        // modify the options...
        options.whitespace = 'condense'
        return options
      })
  }
}
