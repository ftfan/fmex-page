import Vue from 'vue';
import App from './App.vue';
import router from './router';
import '@/assets/main.scss';

Vue.config.productionTip = false;
import '@/data/App';
import '@/data/Analysis';
import { PageLoading } from './lib/page-loading';
import './plugins/element.js';

// 加载数据中心
const requireComponent = (require as any).context('@/data', true, /[\w]+\.ts$/);
requireComponent.keys().forEach(async (fileName: any) => requireComponent(fileName));

const close = PageLoading();
new Vue({
  router,
  render: (h) => h(App),
  mounted() {
    close();
  },
}).$mount('#app');
