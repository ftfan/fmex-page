<template>
  <div>
    <CurrencyCoin></CurrencyCoin>

    <div class="data-analysis">
      <div style="padding-top:10px" class="echarts" ref="Platform"></div>
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

let myChart: echarts.ECharts | null = null;

@Component({
  components: {},
})
export default class Platform extends Vue {
  get UpCoinName() {
    return this.$AnalysisStore.localState.Currency.toLocaleUpperCase();
  }

  SnapshotData: any[] = [];

  // 默认选中最近100天
  queue = 1; // 因为需要获取多个请求，这里设置个id。id不一样，后面就不请求了

  @Watch('UpCoinName')
  async OnUpCoinNameChange() {
    if (this.$route.query.tab !== '4') return; // 不是当前页面
    this.SnapshotData = [];
    if (myChart) myChart.clear();
    this.mountedd();
  }

  mounted() {
    this.mountedd();
  }

  async mountedd() {
    this.RenderInit();
    const today = DateFormat(new Date(), 'yyyy-MM-dd');
    this.$AnalysisStore.GetPlatformCurrency(today);
    this.GetData(++this.queue, today);
  }

  RenderInit() {
    this.SnapshotData = [];
    myChart = echarts.init(this.$refs.Platform as any);
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
        subtext: `钱包资产`,
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
  }

  Render() {
    if (!myChart) return;
    // const xAxisTime: number[] = [];
    // const address: string[] = [];
    // this.SnapshotData.forEach((item: any) => {
    //   // 先对数据进行排序
    //   xAxisTime.push(item.snapshot_time);
    //   item.platform_wallet_assets.forEach((addr: any) => {
    //     address.push(addr.address);
    //   });
    // });
    // const color = (i: number) => {
    //   return 0.4 + (i / this.BtcNumber.length) * 0.6;
    // };

    // const labelText = this.SnapshotData.map((it) => it.FileName);
    // const NumArrData = this.BtcNumber.map((num, i) => {
    //   return [
    //     {
    //       name: `${this.BtcNumber[i - 1] || 0}~${num}`,
    //       type: 'line',
    //       stack: `${this.UpCoinName}`,
    //       data: [] as number[],
    //       color: `rgba(4, 164, 204, ${color(i)})`,
    //       areaStyle: {
    //         color: `rgba(4, 164, 204, ${color(i)})`,
    //       },
    //     },
    //     {
    //       name: `${this.BtcNumber[i - 1] || 0}~${num}`,
    //       type: 'line',
    //       stack: `${this.UpCoinName}`,
    //       data: [] as number[],
    //       color: `rgba(4, 164, 204, ${color(i)})`,
    //       areaStyle: {
    //         color: `rgba(4, 164, 204, ${color(i)})`,
    //       },
    //     },
    //   ];
    // });
    // const other = [
    //   {
    //     name: `${this.BtcNumber[this.BtcNumber.length - 1]}+`,
    //     type: 'line',
    //     stack: `${this.UpCoinName}`,
    //     data: [] as number[],
    //     color: `rgba(4, 164, 204, 1)`,
    //     areaStyle: {
    //       color: `rgba(4, 164, 204, 1)`,
    //     },
    //   },
    //   {
    //     name: `${this.BtcNumber[this.BtcNumber.length - 1]}+`,
    //     type: 'line',
    //     stack: `${this.UpCoinName}`,
    //     data: [] as number[],
    //     color: `rgba(4, 164, 204, 1)`,
    //     areaStyle: {
    //       color: `rgba(4, 164, 204, 1)`,
    //     },
    //   },
    // ];
    // const sum = [
    //   {
    //     name: `总资产`,
    //     type: 'line',
    //     data: [] as number[],
    //     color: `rgba(4, 164, 204, 1)`,
    //   },
    //   {
    //     name: `合计`,
    //     type: 'line',
    //     data: [] as number[],
    //     color: `rgba(4, 164, 204, 1)`,
    //   },
    // ];

    // myChart.setOption({
    //   legend: {
    //     data: [...this.BtcNumber.map((num, i) => `${this.BtcNumber[i - 1] || 0}~${num}`), `${this.BtcNumber[this.BtcNumber.length - 1]}+`, '总资产'],
    //   },
    //   xAxis: {
    //     data: labelText,
    //   },
    //   yAxis: [
    //     {
    //       name: `单位: ${this.UpCoinName}`,
    //     },
    //   ],
    //   series: [...NumArrData.map((item) => item[0]), other[0], sum[0]],
    // });
  }

  async GetData(queue: number, time: string, times = 1): Promise<any> {
    if (queue !== this.queue) return Promise.resolve(false); // 这是一个已经丢弃掉的请求队列了。
    if (times > 3) return; // 重试3次没数据，当做没数据处理
    const timeDate = new Date(time);
    const FileName = time.replace(/-/g, '/');

    const close = PageLoading(`努力请求: ${this.UpCoinName} ${FileName}`);
    const Data = await Vue.AppStore.GetSnapshotDataByDateWallet(this.UpCoinName, FileName);
    close();
    if (queue !== this.queue) return Promise.resolve(false); // 这是一个已经丢弃掉的请求队列了。
    if (!Data) {
      return this.GetData(queue, time, ++times);
    }

    const next = new Date(timeDate.getTime() - 86400000);

    return this.GetData(Data, DateFormat(next, 'yyyy-MM-dd'));
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
