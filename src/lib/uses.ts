import Vue from 'vue';

const ua = navigator.userAgent.toLowerCase();

const Config = {
  IsMobile: Boolean(ua.match(/android/i) || ua.match(/iPhone/i) || ua.match(/iPad/i)),
};

// 给 Vue 安上。
declare module 'vue/types/vue' {
  interface Vue {
    $Config: typeof Config;
  }
  interface VueConstructor {
    Config: typeof Config;
  }
}

Vue.use({
  install(Vue) {
    Vue.prototype.$Config = Config;
    Vue.Config = Config;
  },
});
