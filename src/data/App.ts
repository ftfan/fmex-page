import Data from '@/lib/data';
import Vue from 'vue';
import { URIJS } from '@/lib/utils';
const Day20200901 = new Date('2020-09-01').getTime();

class Store extends Data {
  readonly state = {
    Lyrics: [
      [`与其在别处仰望 不如在FCoin累趴下`, `今天你累趴下了嘛？`],
      [`FT100 别墅累趴下`, `通宵修复 累趴下了`],
      [`让那些下车的人 都累趴下`, `别催，累趴下了`],
      [`想多了心就痛 说多了都是泪！`, `别问，问就是累趴下了`],
    ],
    AppUrl: new URIJS(location.href),
    ErrorMsg: '',
    ErrorMsgTimer: null as any,
  };

  readonly sessionState = {
    cache: {} as { [index: string]: any },
  };

  readonly localState = {
    topMenuShow: true,
    UserKey: '',
    ApiInfo: {
      DataKey: '',
    },
    TimesCache: [] as string[],
    IsUsdBenWei: {} as { [index: string]: number },
    AdminUsers: [] as Array<{ Key: string; ReportKey: string; Secret: string; Mark: string }>,
  };

  // 模块名称，【必须】不能重复
  // 格式为 AAA:BBB:CCC ，指当前模块属于 AAA.BBB 模块，名为 CCC
  protected name = `fmex:app`;

  constructor() {
    super();
    this.initilization();
  }

  Error(msg: string, time = 3000) {
    clearTimeout(this.state.ErrorMsgTimer);
    this.state.ErrorMsg = msg;
    this.state.ErrorMsgTimer = setTimeout(() => {
      this.state.ErrorMsg = '';
    }, time);
  }

  async GetSnapshotDataByDate(coin: string, date: string) {
    const Data = await Vue.AnalysisStore.GetJson(`https://fmex-database.oss-cn-qingdao.aliyuncs.com/fmex/api/broker/v3/zkp-assets/account/snapshot/${coin}/${date}`);
    if (!Data) return Data;
    const ShowTime = new Date(date);
    Data.forEach((item: any) => {
      item.amount = parseFloat(item.amount);
      item.label = Vue.AnalysisStore.SysName(item.label);
    });
    Data.sort((a: any, b: any) => a.amount - b.amount);

    if (coin !== 'BTC') return Data;

    // 查找系统账户
    if (ShowTime.getTime() < Day20200901) {
      Data[Data.length - 1].label = '合约保险基金';
      // 19号那天（保存文件名称是2020-08-20），fusd奖励账户的资产排名到了第三位，也就是index===2；
      if (date === '2020/08/20') {
        Data[Data.length - 3].label = 'FUSD解锁账户';
      } else {
        Data[Data.length - 2].label = 'FUSD解锁账户';
      }
    }
    if (['2020/09/01', '2020/09/02', '2020/09/03'].indexOf(date) > -1) Data[Data.length - 2].label = 'FUSD解锁账户';
    if (['2020/09/04', '2020/09/05', '2020/09/06', '2020/09/07', '2020/09/08', '2020/09/09', '2020/09/10'].indexOf(date) > -1) Data[Data.length - 3].label = 'FUSD解锁账户';

    return Data;
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
