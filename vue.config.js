module.exports = {
  publicPath: process.env.NODE_ENV === 'development' ? '/' : '/',
  outputDir: 'docs',
  assetsDir: 'static/',
  productionSourceMap: true,

  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "~@/assets/var.scss";`,
      },
    },
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
};
