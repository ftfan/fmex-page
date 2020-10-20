import Data from '@/lib/data';
import Vue from 'vue';
import { Snapshot } from '@/types/fmex';
import axios from 'axios';
import { DateFormat } from '@/lib/utils';
import { SysName } from '@/lib/data-parse';

class Store extends Data {
  readonly state = {};

  readonly sessionState = {
    snapshot: {} as { [index: string]: Snapshot },
  };

  readonly localState = {
    UserSNChooseHistory: [0, 1],
    BtcRange: [1, 10],
    PlatformCurrencyCache: {} as { [index: string]: string[] },
    PlatformCurrency: ['btc'],
    Currency: 'btc',
  };

  // 模块名称，【必须】不能重复
  // 格式为 AAA:BBB:CCC ，指当前模块属于 AAA.BBB 模块，名为 CCC
  protected name = `fmex:AnalysisStore`;

  constructor() {
    super();
    this.initilization();
  }

  async GetPlatformCurrency(date: string) {
    const time = new Date(date);
    time.setDate(time.getDate());
    date = DateFormat(time, 'yyyy-MM-dd');
    // 30号之前。目前仅有btc。
    if (time.getTime() < new Date('2020-08-30').getTime()) {
      this.localState.PlatformCurrencyCache[date] = ['btc'];
      return (this.localState.PlatformCurrency = ['btc']);
    }
    if (this.localState.PlatformCurrencyCache[date]) return (this.localState.PlatformCurrency = this.localState.PlatformCurrencyCache[date]);
    const res = await axios
      .get(`https://foss.imconfig.com/fmex/api/broker/v3/zkp-assets/platform/currency/${date.replace(/-/g, '/')}.json`)
      .then((res) => res.data)
      .catch((e) => null);
    if (!res) {
      alert('资源获取失败，请刷新再试');
      return (this.localState.PlatformCurrency = ['btc']);
    }
    this.localState.PlatformCurrencyCache[date] = res;
    return (this.localState.PlatformCurrency = res);
  }

  async GetJson(url: string, clearCache = false) {
    let req = url + '.json';
    if (clearCache) req += '?t=' + Date.now();
    return this.GetData(req);
  }
  async GetData(url: string) {
    const res = await axios
      .get(url)
      .then((res) => res.data)
      .catch((e) => null);
    if (!res) return null;
    return res;
  }

  SysName(name: string) {
    return SysName(name);
  }
}

export const AnalysisStore = new Store();

declare module 'vue/types/vue' {
  interface Vue {
    $AnalysisStore: Store;
  }
  interface VueConstructor {
    AnalysisStore: Store;
  }
}

Vue.use((Vue) => {
  Vue.prototype.$AnalysisStore = AnalysisStore;
  Vue.AnalysisStore = AnalysisStore;
});
