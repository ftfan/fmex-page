<template>
  <div>
    <CurrencyCoin></CurrencyCoin>

    <div class="data-analysis">
      <div style="padding-top:10px" class="echarts" ref="AnalysisPage"></div>
      <v-divider></v-divider>
      <div style="padding-top:40px" class="echarts" ref="AnalysisPageTop5"></div>
      <v-divider></v-divider>
      <div style="padding-top:40px" class="echarts" ref="AnalysisNum"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import echarts from 'echarts';
import { DateFormat, BigNumShowStr, EchartsUtilsToolbox } from '../../lib/utils';
import BigNumber from 'bignumber.js';
import { debounce, throttle } from 'ts-debounce-throttle';
import { PageLoading } from '@/lib/page-loading';
import { PageDataPush } from '@/lib/data-parse';
import { SetShareInfo } from '@/lib/bridge';
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
let myChart3: echarts.ECharts | null = null;

@Component({
  components: {},
})
export default class AnalysisPage extends Vue {
  modal = false;
  DateMin = DateMin;
  DateMax = DateMax;

  get UpCoinName() {
    return this.$AnalysisStore.localState.Currency.toLocaleUpperCase();
  }

  loading = true;
  dialog = false;
  // OnLoadData = ['用户资产数据'];
  SnapshotData: any[] = [];

  // 默认选中最近100天
  Times = GetTimes();
  Dates = GetTimes();
  queue = 1; // 因为需要获取多个请求，这里设置个id。id不一样，后面就不请求了

  PageDataConf = {
    Symbol: 'btc',
    Version: 0,
    BeginTime: '2020-07-08',
    EndTime: '',
    DataParse: 'parse1',
    Params: [{ Key: '' }],
    Data: [] as any[],
  };

  @Watch('UpCoinName')
  async OnUpCoinNameChange() {
    if (this.$route.query.tab !== '1') return; // 不是当前页面
    this.SnapshotData = [];
    if (myChart) myChart.clear();
    if (myChart2) myChart2.clear();
    if (myChart3) myChart3.clear();
    this.mountedd();
  }

  mounted() {
    this.mountedd();
  }

  async mountedd() {
    this.RenderInit();
    await this.GetConfig();
    SetShareInfo(
      `FMex资产走势 ${this.UpCoinName}`,
      `${this.PageDataConf.BeginTime}至${this.PageDataConf.EndTime}\r\n账户资产走势`,
      `https://fmex.fun/#/Analysis?tab=1&Currency=${this.$AnalysisStore.localState.Currency}`
    );
  }

  async GetConfig() {
    const res = await Vue.AnalysisStore.GetJson(`https://foss.imconfig.com/report/account/snapshot/${this.UpCoinName}`);
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
      // color: ['#04a4cc'],
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
        subtext: `账户资产趋势`,
        top: '0',
      },
      xAxis: [{ type: 'category', boundaryGap: false }],
      yAxis: [
        {
          name: `单位: ${this.UpCoinName}`,
          type: 'value',
          axisLabel: { formatter: BigNumShowStr },
          // min: 'dataMin',
          // max: 'dataMax',
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
        selected: {
          1: true,
          2: true,
          3: true,
          4: false,
          5: false,
        },
        top: '24px',
      },
      grid: {
        left: '20px',
        right: '14px',
        bottom: '3%',
        top: '120px',
        containLabel: true,
      },
      title: {
        text: ``,
        subtext: `TOP5 资产 与系统资产 历史`,
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

    myChart3 = echarts.init(this.$refs.AnalysisNum as any);
    myChart3.setOption({
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
        top: '24px',
      },
      grid: {
        left: '20px',
        right: '14px',
        bottom: '3%',
        // top: '40px',
        containLabel: true,
      },
      title: {
        text: ``,
        subtext: `账户数量趋势`,
        top: '0px',
      },
      xAxis: [{ type: 'category', boundaryGap: false }],
      yAxis: [
        {
          type: 'value',
          axisLabel: { formatter: BigNumShowStr },
        },
      ],
    });
  }

  Render() {
    if (!myChart) return;
    if (!myChart2) return;
    if (!myChart3) return;
    const color = (i: number) => {
      return 0.4 + (i / 5) * 0.6;
    };

    const labelText = this.PageDataConf.Data.map((item) => item[0].replace('-', '\r\n'));
    const X1 = this.PageDataConf.Params.slice(1, 6).map((item) => item.Key);
    const X2 = this.PageDataConf.Params.slice(6, 11).map((item) => item.Key);
    const X3 = this.PageDataConf.Params.slice(11).map((item) => item.Key);
    console.log(this.PageDataConf);
    const Ys1 = X1.map((item, i) => {
      const res = {
        name: `${item}`,
        type: 'line',
        stack: i < 4 ? `${this.UpCoinName}` : '', // 总资产不在叠加范围，单独
        data: this.PageDataConf.Data.map((item) => item[i + 1]),
        color: `rgba(4, 164, 204, ${color(i)})`,
      };
      if (i < 4) {
        Object.assign(res, {
          areaStyle: { color: `rgba(4, 164, 204, ${color(i)})` },
        });
      }
      return res;
    });
    console.log(Ys1);
    const Ys2 = X2.map((item, i) => {
      const res = {
        name: `${item}`,
        type: 'line',
        stack: i < 4 ? `${this.UpCoinName}` : '',
        data: this.PageDataConf.Data.map((item) => item[i + 6]),
        color: `rgba(4, 164, 204, ${color(i)})`,
      };
      if (i < 4) {
        Object.assign(res, {
          areaStyle: { color: `rgba(4, 164, 204, ${color(i)})` },
        });
      }
      return res;
    });
    const Ys3 = X3.map((item, i) => {
      const res = {
        name: `${item}`,
        type: 'line',
        // stack: `${this.UpCoinName}`,
        data: this.PageDataConf.Data.map((item) => item[i + 11]),
      };
      if (i < 4) {
        Object.assign(res, {
          color: `rgba(4, 164, 204, ${color(i)})`,
          areaStyle: { color: `rgba(4, 164, 204, ${color(i)})` },
        });
      }
      return res;
    });

    myChart.setOption({
      legend: { data: X1 },
      xAxis: { data: labelText },
      series: Ys1,
      yAxis: [{ name: `单位: ${this.UpCoinName}` }],
    });

    myChart3.setOption({
      legend: { data: X2 },
      xAxis: { data: labelText },
      series: Ys2,
    });

    myChart2.setOption({
      legend: { data: X3 },
      xAxis: { data: labelText },
      series: Ys3,
    });
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
      PageDataPush(this.PageDataConf, Data);
      if (next.getTime() <= new Date(this.Times[1]).getTime()) {
        return this.GetData(queue, FileName.replace(/\//g, '-'));
      }
      this.loading = false;
      this.Render();
      return true;
    };

    const FileName = DateFormat(next, 'yyyy/MM/dd');
    if (times > 3) return NextDay([]); // 重试3次没数据，当做没数据处理
    const close = PageLoading(`努力请求: ${this.UpCoinName} ${FileName}`);
    const Data = await this.$AppStore.GetSnapshotDataByDate(this.UpCoinName, FileName);
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
