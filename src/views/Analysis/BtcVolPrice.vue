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
import { DateFormat, sleep } from '../../lib/utils';
import { FMexWss } from '../../lib/wss';

const BaseTime = new Date(2020, 7 - 1, 13).getTime();

let myChart: echarts.ECharts | null = null;

@Component({
  components: {},
})
export default class BtcVolPrice extends Vue {
  first = true;
  loading = true;
  // OnLoadData = ['用户资产数据'];
  SnapshotData: any[] = [];

  BaseUrl = 'https://fmex-database.oss-cn-qingdao.aliyuncs.com/fmex/v2/market/all-tickers/';
  FmexCurrent = 'https://api.fmex.com/v2/market/all-tickers';

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
        bottom: '80px',
      },
      legend: {
        data: ['24H均价', '现价', '成交量', '成交额'],
        selected: {
          现价: true,
          均价: true,
          成交量: false,
          成交额: true,
        },
      },
      title: {
        text: ``,
        subtext: `24小时成交走势 ${DateFormat(this.Times[0], 'yyyy-MM-dd')} ~ ${DateFormat(this.Times[1], 'yyyy-MM-dd')}`,
        top: 4,
      },
      xAxis: [{ type: 'category', boundaryGap: false }],
      dataZoom: [
        {
          show: true,
          start: 90,
          end: 100,
        },
      ],
      yAxis: [
        {
          type: 'value',
          // min: 'dataMin',
          min: (value) => {
            return Math.floor(value.min);
          },
          // max: 'dataMax',
          position: 'left',
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
          offset: 50,
          position: 'right',
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
    const last = this.SnapshotData[this.SnapshotData.length - 1];
    const AvoPrice = {
      name: `24H均价`,
      type: 'line',
      data: [] as number[],
    };
    const CurrPrice = {
      name: `现价`,
      type: 'line',
      data: [] as number[],
      markPoint: {
        data: [] as any[],
      },
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
      color: `rgba(4, 164, 204, 0.2)`,
      areaStyle: {
        color: `rgba(4, 164, 204, 0.2)`,
      },
      markPoint: {
        data: [] as any[],
      },
      data: [] as number[],
    };
    const data = this.SnapshotData.map((item: any, timeIndex) => {
      const amount = item.tickers[0].ticker[9];
      const vol = item.tickers[0].ticker[10];
      CurrPrice.data.push(item.tickers[0].ticker[0]);
      AvoPrice.data.push(parseFloat((amount / vol).toFixed(1)));
      Btc.data.push(parseFloat(vol.toFixed(2)));
      Usd.data.push(parseFloat((amount / 10000).toFixed(2)));
    });

    const xAxis = this.SnapshotData.map((it) => it.TimeStr);

    const curPrice = CurrPrice.data[CurrPrice.data.length - 1];
    CurrPrice.markPoint.data.push({
      symbol: 'pin',
      symbolSize: 40,
      name: '最新价格',
      coord: [xAxis[xAxis.length - 1], curPrice],
      value: curPrice,
    });

    const curAmount = Usd.data[Usd.data.length - 1];
    Usd.markPoint.data.push({
      symbol: 'pin',
      symbolSize: 40,
      name: '最新成交额',
      coord: [xAxis[xAxis.length - 1], curAmount],
      value: curAmount,
    });
    myChart.setOption({
      xAxis: {
        data: xAxis,
      },
      series: [CurrPrice, AvoPrice, Btc, Usd],
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
      item.TimeStr = DateFormat(item.ts, 'MM-dd\r\nhh:00');
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
    if (!this.first) return;
    if (this.first) this.first = false;
    FMexWss.sub('ticker', 'BTCUSD_P').ondata((data) => {
      // 设置为下一个时间点的数据
      const nextDate = data.ts + 3600000;
      const Data: any = {
        TimeStr: DateFormat(nextDate, 'MM-dd\r\nhh:00'),
        tickers: [data],
        ts: data.ts,
        type: 'wss',
      };
      const last = this.SnapshotData[this.SnapshotData.length - 1];
      if (last.TimeStr === Data.TimeStr) {
        this.SnapshotData[this.SnapshotData.length - 1] = Data;
      } else {
        this.SnapshotData.push(Data);
      }
      this.Render();
    });
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
