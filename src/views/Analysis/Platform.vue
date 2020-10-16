<template>
  <div>
    <CurrencyCoin></CurrencyCoin>

    <div class="data-analysis">
      <div style="padding-top:10px" class="echarts" ref="echartref"></div>
      <v-divider></v-divider>
      <div style="padding-top:10px" class="echarts" ref="AnalysisPage"></div>
      <v-divider></v-divider>
      <div style="padding-top:40px" class="echarts" ref="AnalysisPageTop5"></div>
      <!-- <v-divider></v-divider>
      <div style="padding-top:40px" class="echarts" ref="AnalysisNum"></div> -->
    </div>
    <div style="padding: 10px;">
      钱包地址详细信息：
    </div>
    <v-list-item three-line v-for="(item, index) in X2D" :key="index">
      <v-list-item-content>
        <v-list-item-title>
          <v-avatar color="primary" size="36">
            <span class="white--text headline">{{ index + 1 }}</span>
          </v-avatar>
          {{ NumberShow(Ys3[index]) }}
        </v-list-item-title>
        <v-list-item-subtitle @click="AddressShow(item.Key)">
          {{ item.Key }}
        </v-list-item-subtitle>
        <v-list-item-subtitle>
          <v-chip color="primary" small v-if="item.address_label" outlined>{{ item.address_label }}</v-chip>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import echarts from 'echarts';
import { DateFormat, BigNumShowStr, EchartsUtilsToolbox } from '../../lib/utils';
import BigNumber from 'bignumber.js';
import { debounce, throttle } from 'ts-debounce-throttle';
import { PageLoading } from '@/lib/page-loading';
import { PageDataPush, PageDataPush2 } from '@/lib/data-parse';
import { SetShareInfo } from '@/lib/bridge';
import { EchartsBar } from '@/lib/echarts-render';
const DateMax = DateFormat(Date.now() - 86400000, 'yyyy-MM-dd'); // 只有昨日的数据。
const DateMin = DateFormat(new Date(2020, 7 - 1, 8), 'yyyy-MM-dd');
const GetTimes = () => {
  const now = new Date();
  const begin = new Date();
  begin.setDate(now.getDate() - 100);
  const MinTime = new Date(DateMin).getTime();
  if (begin.getTime() < MinTime) begin.setTime(MinTime); // 开始时间不得大于目前已有的基础时间（有数据的时间）
  return [DateFormat(begin, 'yyyy-MM-dd'), DateMax];
};

let myChart: echarts.ECharts | null = null;
let myChart2: echarts.ECharts | null = null;
const myChart3: echarts.ECharts | null = null;

@Component({
  components: {},
})
export default class AnalysisPlatfromPage extends Vue {
  modal = false;
  DateMin = DateMin;
  DateMax = DateMax;
  BigNumShowStr = BigNumShowStr;
  NumberShow(str: any) {
    if (isNaN(str)) return '无记录';
    return str + ' ' + this.UpCoinName;
  }
  AddressShow(str: string) {
    if (this.UpCoinName === 'BTC') return (location.href = `https://btc.com/${str}`);
    if (this.UpCoinName === 'ETH') return (location.href = `https://etherscan.io/address/${str}`);
    if (this.UpCoinName === 'USDT') return (location.href = `https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7?a=${str}`);
    if (this.UpCoinName === 'TRX') return (location.href = `https://tronscan.org/#/address/${str}`);
    // return str;
  }

  get UpCoinName() {
    return this.$AnalysisStore.localState.Currency.toLocaleUpperCase();
  }

  loading = true;
  dialog = false;
  // OnLoadData = ['用户资产数据'];
  SnapshotData: any[] = [];

  X2D: Array<{ Key: string; address_label: string }> = [];
  Ys3: number[] = [];

  // 默认选中最近100天
  Times = GetTimes();
  Dates = GetTimes();
  queue = 1; // 因为需要获取多个请求，这里设置个id。id不一样，后面就不请求了

  PageDataConf = {
    Symbol: 'btc',
    Version: 0,
    BeginTime: '2020-07-12',
    EndTime: '',
    DataParse: 'parse1',
    Params: [{ Key: 'snapshot_time' }, { Key: 'platform_total_amount' }, { Key: 'user_total_amount' }, { Key: 'assets_rate' }],
    Data: [] as any[],
  };

  @Watch('UpCoinName')
  async OnUpCoinNameChange() {
    if (this.$route.query.tab !== '4') return; // 不是当前页面
    this.SnapshotData = [];
    if (myChart) myChart.clear();
    if (myChart2) myChart2.clear();
    // if (myChart3) myChart3.clear();
    this.mountedd();
  }

  mounted() {
    this.mountedd();
  }

  async mountedd() {
    // this.RenderInit();
    await this.GetConfig();
  }

  async GetConfig() {
    const res = await Vue.AnalysisStore.GetJson(`https://fmex-database.oss-cn-qingdao.aliyuncs.com/report/platform/snapshot/${this.UpCoinName}`);
    if (!res) return;
    this.PageDataConf = res;
    if (!this.PageDataConf.EndTime) return;
    const next = DateFormat(new Date(this.PageDataConf.EndTime).getTime(), 'yyyy-MM-dd');
    await this.GetData(++this.queue, next);
  }

  RenderInit() {
    this.SnapshotData = [];
    myChart = echarts.init(this.$refs.AnalysisPage as any);
    myChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
      },
      toolbox: EchartsUtilsToolbox,
      legend: {
        top: '24px',
        data: [],
      },
      grid: {
        left: '20px',
        right: '14px',
        bottom: '3%',
        top: '80px',
        containLabel: true,
      },
      title: {
        text: ``,
        subtext: `钱包资产趋势`,
        top: '0',
      },
      xAxis: [{ type: 'category', boundaryGap: false }],
      yAxis: [
        {
          name: `单位: ${this.UpCoinName}`,
          type: 'value',
          axisLabel: { formatter: BigNumShowStr },
        },
      ],
    });

    myChart2 = echarts.init(this.$refs.AnalysisPageTop5 as any);
    myChart2.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
      },
      toolbox: EchartsUtilsToolbox,
      legend: {
        data: [],
        top: '30px',
      },
      grid: {
        left: '20px',
        right: '14px',
        // bottom: '3%',
        height: '300px',
        top: '60px',
        containLabel: true,
      },
      title: {
        text: ``,
        subtext: `具体钱包账户资产`,
        top: '0px',
      },
      xAxis: [{ type: 'category', boundaryGap: false }],
      yAxis: [
        {
          name: `单位: ${this.UpCoinName}`,
          type: 'value',
          axisLabel: { formatter: BigNumShowStr },
          min: (value) => {
            return Math.floor(value.min);
          },
          max: (value) => {
            return Math.ceil(value.max);
          },
        },
      ],
    });
  }

  Render() {
    (this.$refs.AnalysisPageTop5 as any).style.height = 400 + (5 * this.PageDataConf.Params.length - 4) + 'px';
    this.RenderInit();
    if (!myChart) return;
    if (!myChart2) return;
    // if (!myChart3) return;
    const color = (i: number) => {
      return 0.4 + (i / 5) * 0.6;
    };

    const labelText = this.PageDataConf.Data.map((item) => DateFormat(item[0], 'yyyy-MM-dd').replace('-', '\r\n'));
    const X1 = this.PageDataConf.Params.slice(1, 3).map((item) => item.Key);
    const X2D = this.PageDataConf.Params.slice(4);
    this.X2D = X2D as any;
    const X2 = X2D.map((item, index) => index + 1 + '');
    console.log(this.PageDataConf);
    const Ys1 = X1.map((item, i) => {
      const res = {
        name: `${item}`,
        type: 'line',
        data: this.PageDataConf.Data.map((item) => item[i + 1]),
      };
      return res;
    });
    const Ys2 = X2.map((item, i) => {
      const res = {
        name: `${item}`,
        type: 'line',
        data: this.PageDataConf.Data.map((item) => item[i + 6]),
      };
      return res;
    });
    const last = this.PageDataConf.Data[this.PageDataConf.Data.length - 1];
    const Ys3 = this.PageDataConf.Data[this.PageDataConf.Data.length - 1].slice(4);
    this.Ys3 = Ys3;

    myChart.setOption({
      legend: { data: X1 },
      xAxis: { data: labelText },
      series: Ys1,
      yAxis: [{ name: `单位: ${this.UpCoinName}` }],
    });

    myChart2.setOption({
      legend: { data: X2 },
      xAxis: { data: labelText },
      series: Ys2,
      grid: {
        top: 5 * this.PageDataConf.Params.length + 40 + 'px',
      },
    });

    EchartsBar(this.$refs.echartref as any, {
      grid: {
        right: '50px',
        left: '50px',
        bottom: '80px',
        top: '80px',
      },
      color: ['#04a4cc'],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      toolbox: EchartsUtilsToolbox,
      title: {
        subtext: `${DateFormat(last[0], 'yyyy-MM-dd')} 钱包资产(具体 钱包地址 在页面底部备注)`,
        top: '20px',
      },
      xAxis: {
        type: 'category',
        data: X2,
        name: '地址',
      },
      yAxis: {
        type: 'value',
        name: `单位：${this.UpCoinName}`,
        axisLabel: { formatter: BigNumShowStr },
      },
      series: [
        {
          name: `资产`,
          data: Ys3,
          type: 'bar',
          markPoint: {
            data: X2D.filter((i: any) => i.address_label).map((item: any) => {
              const index = X2D.indexOf(item);
              return {
                symbolRotate: 45,
                name: item.address_label,
                coord: [X2[index], Ys3[index]],
                value: item.address_label as any,
              };
            }),
          },
        },
      ],
    });
    SetShareInfo(
      `FMex钱包资产 ${this.UpCoinName}`,
      `${this.PageDataConf.BeginTime}至${this.PageDataConf.EndTime}\r\n钱包资产走势`, //
      `https://fmex.fun/#/Analysis?tab=4&Currency=${this.$AnalysisStore.localState.Currency}`
    );
  }

  async GetData(queue: number, time: string, times = 1): Promise<any> {
    if (queue !== this.queue) return Promise.resolve(false); // 这是一个已经丢弃掉的请求队列了。
    const timeDate = new Date(time);
    // 因为数据存储时，按照今天存储昨天的
    const next = new Date(timeDate.getTime() + 86400000);
    const NextDay = (Data: any) => {
      // 用户资产是备份前一天的。所以时间上是错开了一天。这里纠正回去
      // const ShowTime = new Date(time);
      // this.SnapshotData.push({ FileName: DateFormat(ShowTime, 'MM-dd\r\nyyyy'), Data, ShowTime });
      this.PageDataConf.EndTime = DateFormat(next, 'yyyy-MM-dd');
      PageDataPush2(this.PageDataConf, Data);
      if (next.getTime() <= new Date(this.Times[1]).getTime()) {
        return this.GetData(queue, FileName.replace(/\//g, '-'));
      }
      this.loading = false;
      this.Render();
      return true;
    };

    const FileName = DateFormat(next, 'yyyy/MM/dd');
    if (times > 3) {
      // 重试3次没数据，当做没数据处理
      return NextDay({
        snapshot_time: time,
        platform_total_amount: '',
        user_total_amount: '',
        assets_rate: '',
        platform_wallet_assets: [],
      });
    }

    const close = PageLoading(`努力请求: ${this.UpCoinName} ${FileName}`);
    const Data = await this.$AppStore.GetSnapshotDataByDateWallet(this.UpCoinName, FileName);
    close();
    if (queue !== this.queue) return Promise.resolve(false); // 这是一个已经丢弃掉的请求队列了。
    if (!Data) {
      return this.GetData(queue, time, ++times);
    }

    return NextDay(Data);
  }
}
</script>

<style lang="scss" scoped>
.data-analysis {
  .echarts {
    width: 100%;
    height: 400px;
  }
}
.txt-i {
  color: red;
}
</style>
