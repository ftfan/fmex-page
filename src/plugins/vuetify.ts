import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import zhHans from 'vuetify/src/locale/zh-Hans';
// import 'vuetify/src/styles/main.sass';
// import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
  theme: {
    options: {
      customProperties: true,
    },
    themes: {
      light: {
        primary: '#04a4cc',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107',
      },
    },
  },
  lang: {
    locales: { zhHans },
    current: 'zh-Hans',
  },
});
