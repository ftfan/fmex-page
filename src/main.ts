import Vue from 'vue';
import App from './App.vue';
import router, { LogEvent } from './router';
import '@/assets/main.scss';
import '@/lib/uses';

Vue.config.productionTip = false;
import '@/data/App';
import '@/data/Analysis';
import { PageLoading } from './lib/page-loading';

import vuetify from './plugins/vuetify';
import './plugins/vssue';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@mdi/font/css/materialdesignicons.css';
import CurrencyCoin from '@/components/CurrencyCoin.vue';
import { IsWechat, sleep } from './lib/utils';
import { LoadCloudApi, SetShareInfo } from './lib/bridge';

Vue.component('CurrencyCoin', CurrencyCoin);

// 加载数据中心
const requireComponent = (require as any).context('@/data', true, /[\w]+\.ts$/);
requireComponent.keys().forEach(async (fileName: any) => requireComponent(fileName));

window.onerror = (message, source, lineno, colno, error) => {
  console.error(message, source, lineno, colno, error);
  LogEvent('Error', 'window', `${JSON.stringify({ message, source, lineno, colno, error })}`, 1);
};

// (require as any)(['vconsole'], (VConsole: any) => {
//   (window as any).VConsole = new VConsole();
// });

Vue.config.errorHandler = function(err, vm, info) {
  console.error(err, vm, info);
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

// if (IsWechat) {
//   LoadCloudApi();
// }

const close = PageLoading('正在启动程序');
new Vue({
  router,
  vuetify,
  render: (h) => h(App),
  async mounted() {
    SetShareInfo(`FMex.Fun`, '累趴下了~');
    close();
  },
}).$mount('#app');
