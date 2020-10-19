const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');
module.exports = {
  publicPath: process.env.NODE_ENV === 'development' ? '/' : '/',
  outputDir: 'dist',
  assetsDir: 'static/',
  productionSourceMap: process.env.NODE_ENV === 'development',

  transpileDependencies: ['vuetify'],

  configureWebpack: {
    plugins: [
      // new VuetifyLoaderPlugin(),
      // new BundleAnalyzerPlugin(), //
    ],
  },

  chainWebpack: (config) => {
    config.plugins.delete('preload');
    config.plugins.delete('prefetch');
    config.module
      .rule('images')
      .use('url-loader')
      .loader('url-loader')
      .tap((options) => Object.assign(options, { limit: -1 }));
  },
  devServer: {
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    disableHostCheck: true,
    port: 8080,
    https: false,
    hotOnly: false,
  },
};
