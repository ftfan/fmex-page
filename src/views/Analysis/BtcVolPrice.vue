<template>
  <div>
    <div class="data-analysis">
      <div ref="BtcVolPrice"></div>
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
export default class BtcVolPrice extends Vue {
  loading = true;
  OnLoadData = ['用户资产数据'];
  SnapshotData: any[] = [];

  BaseUrl = 'https://fmex-database.oss-cn-qingdao.aliyuncs.com/fmex/v2/market/all-tickers/';

  // 默认选中最近100天
  Times = (() => {
    const now = new Date();
    const begin = new Date();
    begin.setDate(now.getDate() - 100);
    if (begin.getTime() < BaseTime) begin.setTime(BaseTime); // 开始时间不得大于目前已有的基础时间（有数据的时间）
    return [begin, now];
  })();

  async mounted() {
    this.GetData(this.Times[0]);
    this.RenderInit();
  }

  RenderInit() {
    myChart = echarts.init(this.$refs.BtcVolPrice as any);
    myChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      grid: {
        right: '90px',
        left: '50px',
      },
      legend: {
        data: ['均价', '成交量', '成交额'],
      },
      title: {
        text: ``,
        subtext: `24小时成交走势 ${DateFormat(this.Times[0], 'yyyy-MM-dd')} ~ ${DateFormat(this.Times[1], 'yyyy-MM-dd')}`,
        top: 4,
      },
      xAxis: [{ type: 'category', boundaryGap: false }],
      yAxis: [
        {
          type: 'value',
          // min: 'dataMin',
          min: (value) => {
            return Math.floor(value.min);
          },
          // max: 'dataMax',
          offset: 50,
          position: 'right',
          name: 'USD',
          axisLabel: {
            formatter: '{value}',
          },
          splitLine: { show: false },
        },
        {
          type: 'value',
          // min: 'dataMin',
          min: (value) => {
            return Math.floor(value.min / 100) * 100;
          },
          // max: 'dataMax',
          position: 'right',
          name: '万USD',
          axisLabel: {
            formatter: '{value}',
          },
        },
        {
          type: 'value',
          // min: 'dataMin',
          min: (value) => {
            return Math.floor(value.min / 100) * 100;
          },
          // max: 'dataMax',
          position: 'left',
          name: '单位: BTC',
          axisLabel: {
            formatter: '{value}',
          },
        },
      ],
    });
  }

  Render() {
    if (!myChart) return;
    const AvoPrice = {
      name: `均价`,
      type: 'line',
      data: [] as number[],
    };
    const Btc = {
      name: `成交量`,
      type: 'line',
      yAxisIndex: 2,
      data: [] as number[],
    };
    const Usd = {
      name: `成交额`,
      type: 'line',
      yAxisIndex: 1,
      data: [] as number[],
    };
    const data = this.SnapshotData.map((item: any, timeIndex) => {
      const amount = item.tickers[0].ticker[9];
      const vol = item.tickers[0].ticker[10];
      AvoPrice.data.push(parseFloat((amount / vol).toFixed(1)));
      Btc.data.push(parseFloat(vol.toFixed(2)));
      Usd.data.push(parseFloat((amount / 10000).toFixed(2)));
    });
    myChart.setOption({
      xAxis: {
        data: this.SnapshotData.map((it) => it.TimeStr),
      },
      series: [AvoPrice, Btc, Usd],
    });
  }

  async GetData(time: Date, times = 1): Promise<any> {
    if (times > 5) return;
    const FileName = DateFormat(time, 'yyyy/MM/dd');
    this.OnLoadData.push(`加载 ${FileName} ${times > 1 ? times : ''}`);
    const Data = await this.$AnalysisStore.GetJson(this.BaseUrl + FileName);
    if (!Data) {
      return this.GetData(time, ++times);
    }
    Data.forEach((item: any) => {
      item.TimeStr = DateFormat(item.ts, 'MM-dd\r\nhh:00');
    });
    this.SnapshotData.push(...Data);
    this.Render();
    const next = new Date(time.getTime() + 86400000);
    if (next.getTime() < this.Times[1].getTime()) {
      return this.GetData(next, ++times);
    }
    this.loading = false;
    return true;
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
