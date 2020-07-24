import Data from '@/lib/data';
import Vue from 'vue';
import { URIJS } from '@/lib/utils';

class Store extends Data {
  readonly state = {
    Lyrics: [
      [`与其在别处仰望 不如在FCoin累趴下`, `今天你累趴下了嘛？`],
      [`FT100 别墅累趴下`, `通宵修复 累趴下了`],
      [`让那些下车的人 都累趴下`, `别催，累趴下了`],
      [`想多了心就痛 说多了都是泪！`, `别问，问就是累趴下了`],
    ],
    AppUrl: new URIJS(location.href),
  };

  readonly sessionState = {
    cache: {} as { [index: string]: any },
  };

  readonly localState = {
    topMenuShow: true,
  };

  // 模块名称，【必须】不能重复
  // 格式为 AAA:BBB:CCC ，指当前模块属于 AAA.BBB 模块，名为 CCC
  protected name = `fmex:app`;

  constructor() {
    super();
    this.initilization();
  }
}

export const AppStore = new Store();

declare module 'vue/types/vue' {
  interface Vue {
    $AppStore: Store;
  }
  interface VueConstructor {
    AppStore: Store;
  }
}

Vue.use((Vue) => {
  Vue.prototype.$AppStore = AppStore;
  Vue.AppStore = AppStore;
});
