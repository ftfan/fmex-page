import Vue from 'vue';
import App from './App.vue';
import router, { LogEvent } from './router';
import '@/assets/main.scss';

Vue.config.productionTip = false;
import '@/data/App';
import '@/data/Analysis';
import { PageLoading } from './lib/page-loading';

import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@mdi/font/css/materialdesignicons.css';

// 加载数据中心
const requireComponent = (require as any).context('@/data', true, /[\w]+\.ts$/);
requireComponent.keys().forEach(async (fileName: any) => requireComponent(fileName));

window.onerror = (message, source, lineno, colno, error) => {
  LogEvent('Error', 'window', `${JSON.stringify({ message, source, lineno, colno, error })}`, 1);
};

Vue.config.errorHandler = function(err, vm, info) {
  LogEvent(
    'Error',
    'vue',
    `${JSON.stringify({
      stack: String(err.stack),
      err: err.message,
      vm: String((vm as any)._name) || String((vm as any).name),
      info,
      url: location.href,
    })}`,
    1
  );
};

const close = PageLoading();
new Vue({
  router,
  vuetify,
  render: (h) => h(App),
  mounted() {
    close();
  },
}).$mount('#app');
