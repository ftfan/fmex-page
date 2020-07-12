import Vue from 'vue';
import App from './App.vue';
import router from './router';
import '@/assets/main.scss';

Vue.config.productionTip = false;
import '@/data/App';
import '@/data/Analysis';

// 加载数据中心
const requireComponent = (require as any).context('@/data', true, /[\w]+\.ts$/);
requireComponent.keys().forEach(async (fileName: any) => requireComponent(fileName));

new Vue({
  router,
  render: (h) => h(App),
  mounted() {
    const el = document.getElementById('page-loader-model');
    if (!el) return;
    el.className = 'hide';
  },
}).$mount('#app');
