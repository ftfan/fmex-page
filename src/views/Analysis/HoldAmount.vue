<template>
  <div>
    <div class="data-analysis">
      <div ref="HoldAmount"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import echarts from 'echarts';
import { DateFormat } from '../../lib/utils';

const BaseTime = new Date(2020, 7 - 1, 13).getTime();

let myChart: echarts.ECharts | null = null;

@Component({
  components: {},
})
export default class HoldAmount extends Vue {
  loading = true;
  // OnLoadData = ['用户资产数据'];
  SnapshotData: any[] = [];

  BaseUrl = 'https://fmex-database.oss-cn-qingdao.aliyuncs.com/fmex/api/contracts/web/v3/public/statistics/';

  // 默认选中最近 30 天
  Times = (() => {
    const now = new Date();
    const begin = new Date();
    begin.setDate(now.getDate() - 30);
    if (begin.getTime() < BaseTime) begin.setTime(BaseTime); // 开始时间不得大于目前已有的基础时间（有数据的时间）
    return [begin, now];
  })();

  mounted() {
    this.mountedd();
  }

  async mountedd() {
    this.GetData(this.Times[0]);
    this.RenderInit();
  }

  RenderInit() {
    this.SnapshotData = [];
    myChart = echarts.init(this.$refs.HoldAmount as any);
    myChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      grid: {
        right: '50px',
        left: '50px',
        bottom: '80px',
      },
      legend: {
        data: ['未平仓合约'],
      },
      title: {
        text: ``,
        subtext: `${DateFormat(this.Times[0], 'yyyy-MM-dd')} ~ ${DateFormat(this.Times[1], 'yyyy-MM-dd')}`,
        top: 4,
      },
      dataZoom: [
        {
          show: true,
          start: 0,
          end: 100,
        },
      ],
      xAxis: [{ type: 'category', boundaryGap: false }],
      yAxis: [
        {
          type: 'value',
          // min: (value) => {
          //   return Math.floor(value.min);
          // },
          position: 'right',
          name: '单位： 万USD',
          axisLabel: {
            formatter: '{value}',
          },
          // splitLine: { show: false },
        },
      ],
    });
  }

  Render() {
    if (!myChart) return;
    const Amounts = {
      name: `未平仓合约`,
      type: 'line',
      data: [] as number[],
      color: `rgba(4, 164, 204, 0.2)`,
      areaStyle: {
        color: `rgba(4, 164, 204, 0.2)`,
      },
    };
    this.SnapshotData.map((item: any) => {
      Amounts.data.push(item.BTCUSD_P / 10000);
    });
    myChart.setOption({
      xAxis: {
        data: this.SnapshotData.map((it) => it.TimeStr),
      },
      series: [Amounts],
    });
  }

  async GetData(time: Date, times = 1): Promise<any> {
    if (times > 5) return;
    const FileName = DateFormat(time, 'yyyy/MM/dd');
    // this.OnLoadData.push(`加载 ${FileName} ${times > 1 ? times : ''}`);
    const Data = await this.$AnalysisStore.GetJson(this.BaseUrl + FileName);
    if (!Data) {
      return this.GetData(time, ++times);
    }
    Data.forEach((item: any) => {
      item.TimeStr = DateFormat(item.ts, 'MM-dd\r\nhh:mm');
    });
    this.SnapshotData.push(...Data);
    const next = new Date(time.getTime() + 86400000);
    if (next.getTime() < this.Times[1].getTime()) {
      return this.GetData(next);
    }
    this.loading = false;
    this.GetFmexData();
    this.Render();
    return true;
  }

  async GetFmexData(): Promise<any> {
    // FMexWss.sub('ticker', 'BTCUSD_P').ondata((data) => {
    //   const Data: any = {
    //     TimeStr: DateFormat(data.ts, 'MM-dd\r\nhh:00'),
    //     tickers: [data],
    //     ts: data.ts,
    //     type: 'wss',
    //   };
    //   const last = this.SnapshotData[this.SnapshotData.length - 1];
    //   if (last.TimeStr === Data.TimeStr) {
    //     this.SnapshotData[this.SnapshotData.length - 1] = Data;
    //   } else {
    //     this.SnapshotData.push(Data);
    //   }
    //   this.Render();
    // });
  }
}
</script>

<style lang="scss" scoped>
.data-analysis {
  div {
    width: 100%;
    height: 500px;
  }
}
</style>
