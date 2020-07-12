import Data from '@/lib/data';
import Vue from 'vue';
import { Snapshot } from '@/types/fmex';

class Store extends Data {
  readonly state = {};

  readonly sessionState = {
    snapshot: {} as { [index: string]: Snapshot },
  };

  readonly localState = {};

  // 模块名称，【必须】不能重复
  // 格式为 AAA:BBB:CCC ，指当前模块属于 AAA.BBB 模块，名为 CCC
  protected name = `fmex:AnalysisStore`;

  constructor() {
    super();
    this.initilization();
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
