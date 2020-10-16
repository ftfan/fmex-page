<template>
  <div>
    <v-dialog ref="dialog" v-model="modal" color="primary" :return-value.sync="Dates" persistent>
      <template v-slot:activator="{ on, attrs }">
        <v-text-field v-model="Dates" label="日期选择" prepend-icon="mdi-calendar-range" readonly v-bind="attrs" v-on="on"></v-text-field>
      </template>
      <v-date-picker v-model="Dates" range scrollable :min="DateMin" :max="DateMax">
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="modal = false">取消</v-btn>
        <v-btn text color="primary" @click="Submit">确定</v-btn>
      </v-date-picker>
    </v-dialog>

    <div class="data-analysis">
      <div ref="HoldAmountTotal"></div>
      <div ref="HoldAmount"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import echarts from 'echarts';
import { ArrayFilter, DateFormat, EchartsUtilsToolbox } from '../../lib/utils';
import { PageLoading } from '@/lib/page-loading';
import { DataParse } from '@/lib/data-parse';
import { SetShareInfo } from '@/lib/bridge';

const DateMax = DateFormat(Date.now(), 'yyyy-MM-dd');
const DateMin = DateFormat(new Date(2020, 7 - 1, 13), 'yyyy-MM-dd');
const GetTimes = () => {
  const now = new Date();
  const begin = new Date();
  begin.setDate(now.getDate() - 15);
  const MinTime = new Date(DateMin).getTime();
  if (begin.getTime() < MinTime) begin.setTime(MinTime); // 开始时间不得大于目前已有的基础时间（有数据的时间）
  return [DateFormat(begin, 'yyyy-MM-dd'), DateMax];
};

let myChart: echarts.ECharts | null = null;
let myChart2: echarts.ECharts | null = null;

@Component({
  components: {},
})
export default class HoldAmount extends Vue {
  modal = false;
  DateMin = DateMin;
  DateMax = DateMax;
  // 默认选中最近 15 天
  Times = GetTimes();
  Dates = GetTimes();

  loading = true;
  // OnLoadData = ['用户资产数据'];
  // SnapshotData: any[] = [];
  FullData: any[] = [];
  queue = 1; // 因为需要获取多个请求，这里设置个id。id不一样，后面就不请求了

  BaseUrl = 'https://fmex-database.oss-cn-qingdao.aliyuncs.com/fmex/api/contracts/web/v3/public/statistics/';

  mounted() {
    this.mountedd();
  }

  async Submit() {
    (this.$refs.dialog as any).save(this.Dates);
    const begin = new Date(this.Dates[0]);
    const end = new Date(this.Dates[1]);
    if (begin.getTime() > end.getTime()) {
      const temp = begin.getTime();
      begin.setTime(end.getTime());
      end.setTime(temp);
    }
    this.Times = [DateFormat(begin, 'yyyy-MM-dd'), DateFormat(end, 'yyyy-MM-dd')];
    this.FullData = [];
    await this.GetData(++this.queue, this.Times[0]);
    this.Render();
  }

  async mountedd() {
    this.GetData(++this.queue, this.Times[0]);
    this.RenderInit();
  }

  RenderInit() {
    this.FullData = [];
    myChart = echarts.init(this.$refs.HoldAmountTotal as any);
    myChart2 = echarts.init(this.$refs.HoldAmount as any);
    myChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      toolbox: EchartsUtilsToolbox,
      grid: {
        right: '50px',
        left: '50px',
        bottom: '80px',
      },
      legend: {
        data: ['未平仓量'],
        // data: ['量', '最小', '最大'],
        top: '24px',
      },
      title: {
        text: ``,
        subtext: `${this.Times[0]}~${this.Times[1]}未平仓趋势`,
        top: '0px',
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
    myChart2.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      toolbox: EchartsUtilsToolbox,
      grid: {
        right: '50px',
        left: '50px',
        bottom: '80px',
      },
      legend: {
        data: ['未平仓量'],
        top: '24px',
      },
      title: {
        text: ``,
        subtext: `近3日未平仓张数`,
        top: '0px',
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
    if (!myChart2) return;
    const AmountsAvo = {
      name: `未平仓量`,
      type: 'line',
      smooth: true,
      data: [] as number[],
      color: `rgba(4, 164, 204, 1)`,
      areaStyle: {
        color: `rgba(4, 164, 204, 0.2)`,
      },
    };
    // const AmountsMin = {
    //   name: `最小`,
    //   type: 'line',
    //   smooth: true,
    //   data: [] as number[],
    //   color: `rgba(4, 164, 204, 0.6)`,
    //   areaStyle: {
    //     color: `rgba(255, 255, 255, 1)`,
    //   },
    // };
    // const AmountsMax = {
    //   name: `最大`,
    //   type: 'line',
    //   smooth: true,
    //   data: [] as number[],
    //   color: `rgba(4, 164, 204, 0.6)`,
    //   areaStyle: {
    //     color: `rgba(4, 164, 204, 0.4)`,
    //   },
    // };
    const xAxisTotal: string[] = [];
    const Amounts = {
      name: `未平仓量`,
      type: 'bar',
      data: [] as number[],
      color: `rgba(4, 164, 204, 0.4)`,
      areaStyle: {
        color: `rgba(4, 164, 204, 0.4)`,
      },
    };
    const xAxis: string[] = [];
    const Last5Day = this.FullData.length - 3;
    this.FullData.map((items: any, index) => {
      if (!items.length) return;
      // xAxisTotal.push(items[0].TimeStr.replace(/\r\n(.*)/, ''));
      const min = Infinity;
      const max = 0;
      const sum = 0;
      items.forEach((item: any) => {
        const val = item.BTCUSD_P / 10000;
        if (index >= Last5Day) {
          xAxis.push(item.TimeStr);
          Amounts.data.push(val);
        }
        // min = Math.min(val, min);
        // max = Math.max(val, max);
        // sum += val;

        xAxisTotal.push(item.TimeStr);
        AmountsAvo.data.push(val);
      });

      // ArrayFilter(items, 1440);
      // items.forEach((item: any) => {
      //   const val = item.BTCUSD_P / 10000;
      //   xAxisTotal.push(item.TimeStr);
      //   AmountsAvo.data.push(val);
      // });
      // AmountsAvo.data.push(Math.floor((sum / items.length) * 10000) / 10000);
      // AmountsMin.data.push(min);
      // AmountsMax.data.push(max);
    });
    myChart.setOption({
      xAxis: {
        data: xAxisTotal,
      },
      series: [AmountsAvo],
    });
    myChart2.setOption({
      xAxis: {
        data: xAxis,
      },
      series: [Amounts],
    });

    const last = Amounts.data[Amounts.data.length - 1];
    const lastx = xAxis[xAxis.length - 1];
    if (!last) return;
    SetShareInfo(`FMex未平仓张数 BTC永续`, `时间：${lastx.replace('\r\n', ' ')}\r\n未平仓：${last} 万张`);
  }

  async GetData(queue: number, time: string, times = 1): Promise<any> {
    if (queue !== this.queue) return Promise.resolve(false); // 这是一个已经丢弃掉的请求队列了。
    if (times > 5) return;
    const FileName = time.replace(/-/g, '/');
    // this.OnLoadData.push(`加载 ${FileName} ${times > 1 ? times : ''}`);
    const close = PageLoading(`获取数据: ${FileName}`);
    let Data = await this.$AnalysisStore.GetJson(this.BaseUrl + FileName);
    Data = DataParse(Data); // 解析数据。

    close();
    if (queue !== this.queue) return Promise.resolve(false); // 这是一个已经丢弃掉的请求队列了。
    if (!Data) {
      return this.GetData(queue, time, ++times);
    }
    Data.forEach((item: any) => {
      item.TimeStr = DateFormat(item.ts, 'MM-dd\r\nhh:mm');
    });
    this.FullData.push(Data);
    // this.SnapshotData.push(...Data);
    const timeDate = new Date(time);
    const next = new Date(timeDate.getTime() + 86400000);
    if (next.getTime() <= new Date(this.Times[1]).getTime()) {
      return this.GetData(queue, DateFormat(next, 'yyyy-MM-dd'));
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
