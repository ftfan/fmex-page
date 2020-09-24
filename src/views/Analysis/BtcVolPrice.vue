<template>
  <div>
    <div class="data-analysis">
      <div class="canvass" ref="BtcVolPriceToday"></div>

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
      <div class="canvass" ref="BtcVolPrice"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import echarts from 'echarts';
import { DateFormat } from '../../lib/utils';
import { FMexWss } from '../../lib/wss';
import { FMex } from '@/api/FMex';
import { PageLoading } from '@/lib/page-loading';

const DateMax = DateFormat(Date.now(), 'yyyy-MM-dd');
const DateMin = DateFormat(new Date(2020, 7 - 1, 13), 'yyyy-MM-dd');
const MinTime = new Date(DateMin).getTime();
const GetTimes = () => {
  const now = new Date();
  const begin = new Date();
  begin.setDate(now.getDate() - 30);
  if (begin.getTime() < MinTime) begin.setTime(MinTime); // 开始时间不得大于目前已有的基础时间（有数据的时间）
  return [DateFormat(begin, 'yyyy-MM-dd'), DateMax];
};

let myChart: echarts.ECharts | null = null;
let myChart2: echarts.ECharts | null = null;
const map: any = {};

@Component({
  components: {},
})
export default class BtcVolPrice extends Vue {
  modal = false;
  DateMin = DateMin;
  DateMax = DateMax;
  // 默认选中最近 30 天
  Times = GetTimes();
  Dates = GetTimes();

  first = true;
  loading = true;
  // OnLoadData = ['用户资产数据'];
  SnapshotData: any[] = [];
  SnapshotData2: FMex.CandelRes[] = [];

  BaseUrl = 'https://fmex-database.oss-cn-qingdao.aliyuncs.com/fmex/v2/market/all-tickers/';
  FmexCurrent = 'https://api.fmex.com/v2/market/all-tickers';
  queue = 1; // 因为需要获取多个请求，这里设置个id。id不一样，后面就不请求了

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
    this.SnapshotData = [];
    await this.GetData(++this.queue, this.Times[0]);
    this.Render();
  }

  async mountedd() {
    this.GetData(++this.queue, this.Times[0]);
    this.RenderInit();
    this.RunderToday();
  }

  async RunderToday() {
    if (this.SnapshotData2.length) return this.Render2();
    this.SnapshotData2 = [];
    const now = Date.now();
    const close = PageLoading(`正在努力连接 wss://api.fmex.com/v2/ws`);
    // 获取到最近3天的数据（M1只能获取到最近24小时的）
    const [res1, res2] = await Promise.all([FMexWss.req('candle', FMex.Resolution.M3, 'btcusd_p', 1440, now), FMexWss.req('candle', FMex.Resolution.M1, 'btcusd_p', 1440, now)]);
    close();
    const minLast24 = res2.data[0].id;
    res1.data = res1.data.filter((item) => item.id < minLast24);
    this.SnapshotData2 = res1.data.concat(res2.data);
    this.Render2();
  }

  Render2() {
    if (!myChart2) return;
    const arr24 = new Array(24).fill(0).map((v, i) => i + 1);
    const CurrentBtc = {
      name: `交易量(今)`,
      yAxisIndex: 1,
      type: 'line',
      data: arr24.map((i) => NaN),
      color: `rgba(4, 204, 164, 1)`,
    };
    const LastBtc = {
      name: `交易量(昨)`,
      yAxisIndex: 1,
      type: 'line',
      data: arr24.map((i) => NaN),
      color: `rgba(4, 204, 164, 0.3)`,
    };
    const CurrentUsd = {
      name: `交易额(今)`,
      yAxisIndex: 0,
      type: 'line',
      data: arr24.map((i) => NaN),
      color: `rgba(4, 164, 204, 1)`,
    };
    const LastUsd = {
      name: `交易额(昨)`,
      yAxisIndex: 0,
      type: 'line',
      data: arr24.map((i) => NaN),
      color: `rgba(4, 164, 204, 0.3)`,
    };
    const TodayStr = DateFormat(new Date(), 'yyyy-MM-dd');
    const LastStr = DateFormat(Date.now() - 86400000, 'yyyy-MM-dd');
    const TodayStrArr: string[] = [];
    const LastStrArr: string[] = [];
    const xAxis = arr24.map((val) => {
      val = val - 1;
      let str = `${val}`;
      if (val < 10) str = `0${val}`;
      TodayStrArr.push(TodayStr + ` ${str}`);
      LastStrArr.push(LastStr + ` ${str}`);
      return str;
    });

    let sum24 = 0;
    const timer24 = Date.now() - 86400000;

    this.SnapshotData2.forEach((item) => {
      const time = item.id * 1000;
      if (time > timer24) sum24 = sum24 + item.base_vol; // 统计最近24小时
      const timestr = DateFormat(time, 'yyyy-MM-dd hh');
      const index = TodayStrArr.indexOf(timestr);
      const index2 = LastStrArr.indexOf(timestr);
      if (index > -1) {
        CurrentBtc.data[index] = (CurrentBtc.data[index] || 0) + item.quote_vol;
        CurrentUsd.data[index] = (CurrentUsd.data[index] || 0) + item.base_vol / 10000;
      } else if (index2 > -1) {
        LastBtc.data[index2] = (LastBtc.data[index2] || 0) + item.quote_vol;
        LastUsd.data[index2] = (LastUsd.data[index2] || 0) + item.base_vol / 10000;
      }
    });
    // console.log(TodayStrArr, LastStrArr, CurrentUsd, CurrentBtc, LastUsd, LastBtc);
    // CurrentBtc.markPoint.data.push({
    //   symbol: 'pin',
    //   symbolSize: 40,
    //   name: '最新价格',
    //   coord: [xAxis[xAxis.length - 1], curPrice],
    //   value: curPrice,
    // });
    const sum = Math.floor(CurrentUsd.data.reduce((a, b) => (a || 0) + (b || 0), 0)) / 10000;
    const lastSum = Math.floor(LastUsd.data.reduce((a, b) => (a || 0) + (b || 0), 0)) / 10000;
    sum24 = Math.floor(sum24 / 10000) / 10000;
    myChart2.setOption({
      title: {
        text: [`    ·  单位： 亿USD`, `    ·  ${sum} (昨日交易额)`, `    ·  ${lastSum} (今日交易额)`, `    ·  ${sum24} (最近24小时交易额)`].join('\r\n'),
      },
      xAxis: {
        data: xAxis,
      },
      series: [CurrentUsd, LastUsd, CurrentBtc, LastBtc],
    });
  }

  RenderInit() {
    this.SnapshotData = [];
    myChart2 = echarts.init(this.$refs.BtcVolPriceToday as any);
    myChart2.setOption({
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
        top: '140px',
      },
      legend: {
        data: ['交易额(今)', '交易额(昨)', '交易量(今)', '交易量(昨)'],
        selected: {
          '交易额(今)': true,
          '交易额(昨)': true,
          '交易量(今)': false,
          '交易量(昨)': false,
        },
        top: '70px',
      },
      title: {
        text: ``,
        top: '10px',
        textStyle: {
          color: `rgba(4, 164, 204, 1)`,
          fontWeight: 'normal',
          fontSize: 14,
        },
      },
      xAxis: [{ type: 'category', boundaryGap: false }],
      yAxis: [
        {
          type: 'value',
          position: 'right',
          name: '万USD',
          axisLabel: {
            formatter: '{value}',
          },
        },
        {
          type: 'value',
          position: 'left',
          name: 'BTC',
          axisLabel: {
            formatter: '{value}',
          },
        },
      ],
    });
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
        top: '100px',
      },
      legend: {
        data: [
          '24H均价',
          '24H成交量',
          '24H成交额',
          //  '1H均价',
          '1H最高价',
          '1H最低价',
        ],
        selected: {
          '24H均价': true,
          // '1H均价': false,
          '1H最高价': true,
          '1H最低价': true,
          '24H成交量': false,
          '24H成交额': true,
        },
      },
      title: {
        text: ``,
        subtext: `24小时成交走势 ${this.Times[0]} ~ ${this.Times[1]}`,
        top: 36,
      },
      xAxis: [{ type: 'category', boundaryGap: false }],
      dataZoom: [
        {
          show: true,
          start: 50,
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
          name: '单位: USD',
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
          name: 'BTC',
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
      name: `24H均价`,
      color: `rgba(0, 1, 2, 1)`,
      type: 'line',
      data: [] as number[],
      markPoint: {
        data: [] as any[],
      },
    };
    const AvoPrice1 = {
      name: `1H均价`,
      type: 'line',
      data: [] as number[],
    };
    const AvoPriceMax = {
      name: `1H最高价`,
      type: 'line',
      data: [] as number[],
      color: `rgba(150, 150, 150, 1)`,
      areaStyle: {
        color: `rgba(4, 164, 204, 0.4)`,
      },
    };
    const AvoPriceMin = {
      name: `1H最低价`,
      type: 'line',
      data: [] as number[],
      color: `rgba(150, 150, 150, 1)`,
      areaStyle: {
        color: `rgba(255, 255, 255, 1)`,
      },
    };
    // const CurrPrice = {
    //   name: `现价`,
    //   type: 'line',
    //   data: [] as number[],
    //   markPoint: {
    //     data: [] as any[],
    //   },
    // };
    const Btc = {
      name: `24H成交量`,
      type: 'line',
      yAxisIndex: 2,
      data: [] as number[],
    };
    const Usd = {
      name: `24H成交额`,
      type: 'line',
      yAxisIndex: 1,
      color: `rgba(4, 164, 204, 0.4)`,
      areaStyle: {
        color: `rgba(4, 164, 204, 0.4)`,
      },
      markPoint: {
        data: [] as any[],
      },
      data: [] as number[],
    };
    this.SnapshotData.forEach((item: any) => {
      const amount = item.tickers[0].ticker[9];
      const vol = item.tickers[0].ticker[10];
      // CurrPrice.data.push(item.tickers[0].ticker[0]);
      AvoPrice.data.push(parseFloat((amount / vol).toFixed(1)));
      Btc.data.push(parseFloat(vol.toFixed(2)));
      Usd.data.push(parseFloat((amount / 10000).toFixed(2)));
      if (!item.kline) return;
      // AvoPrice1.data.push(parseFloat((item.kline.base_vol / item.kline.quote_vol).toFixed(2)));
      AvoPriceMin.data.push(item.kline.low);
      AvoPriceMax.data.push(item.kline.high);
    });

    const xAxis = this.SnapshotData.map((it) => it.TimeStr);

    // const curPrice = CurrPrice.data[CurrPrice.data.length - 1];
    // CurrPrice.markPoint.data.push({
    //   symbol: 'pin',
    //   symbolSize: 40,
    //   name: '最新价格',
    //   coord: [xAxis[xAxis.length - 1], curPrice],
    //   value: curPrice,
    // });
    const curPrice = AvoPrice.data[AvoPrice.data.length - 1];
    AvoPrice.markPoint.data.push({
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
      series: [
        AvoPriceMax,
        AvoPriceMin,
        // CurrPrice,
        AvoPrice,
        Btc,
        Usd,
        // AvoPrice1,
      ],
    });
  }

  async GetData(queue: number, time: string, times = 1): Promise<any> {
    if (queue !== this.queue) return Promise.resolve(false); // 这是一个已经丢弃掉的请求队列了。
    if (times > 5) return;
    const FileName = time.replace(/-/g, '/');
    // this.OnLoadData.push(`加载 ${FileName} ${times > 1 ? times : ''}`);
    const close = PageLoading(`正在请求备份的数据：${FileName}`);
    const Data = await this.$AnalysisStore.GetJson(this.BaseUrl + FileName);
    close();
    if (queue !== this.queue) return Promise.resolve(false); // 这是一个已经丢弃掉的请求队列了。
    if (!Data) {
      return this.GetData(queue, time, ++times);
    }
    Data.forEach((item: any) => {
      item.ts = item.ts - (item.ts % 3600000);
      map[item.ts] = item;
      item.TimeStr = DateFormat(item.ts, 'MM-dd\r\nhh:00');
    });
    this.SnapshotData.push(...Data);
    const timeDate = new Date(time);
    const next = new Date(timeDate.getTime() + 86400000);
    if (next.getTime() <= new Date(this.Times[1]).getTime()) {
      return this.GetData(queue, DateFormat(next, 'yyyy-MM-dd'));
    }
    FMexWss.req('candle', FMex.Resolution.H1, 'btcusd_p', 1440, new Date(this.Times[1]).getTime()).then((res) => {
      console.log(res);
      res.data.forEach((item) => {
        const time = item.id * 1000;
        if (time < MinTime) return; // 7-13之前还没开始记录数据，这些图画不了
        if (!map[time]) return; // 找不到对应的数据
        map[time].kline = item;
      });
      this.SnapshotData = this.SnapshotData.filter((item) => item.kline);
      this.Render();
    });
    this.loading = false;
    this.GetFmexData();
    this.Render();
    return true;
  }

  async GetFmexData(): Promise<any> {
    if (!this.first) return;
    if (this.first) this.first = false;

    // FMexWss.sub('ticker', 'BTCUSD_P').ondata((data) => {
    //   // 设置为下一个时间点的数据
    //   const nextDate = data.ts + 3600000;

    //   data.ts = data.ts - (data.ts % 3600000);
    //   const Data: any = {
    //     TimeStr: DateFormat(nextDate, 'MM-dd\r\nhh:00'),
    //     tickers: [data],
    //     ts: data.ts,
    //     type: 'wss',
    //     kline: map[data.ts],
    //   };
    //   const last = this.SnapshotData[this.SnapshotData.length - 1];
    //   if (last.TimeStr === Data.TimeStr) {
    //     this.SnapshotData[this.SnapshotData.length - 1] = Data;
    //   } else {
    //     FMexWss.req('candle', FMex.Resolution.H1, 'btcusd_p', 2, Date.now()).then((res) => {
    //       res.data.forEach((item) => {
    //         const time = item.id * 1000;
    //         if (time < MinTime) return; // 7-13之前还没开始记录数据，这些图画不了
    //         if (!map[time]) return; // 找不到对应的数据
    //         map[time].kline = item;
    //       });
    //       this.Render();
    //     });

    //     this.SnapshotData.push(Data);
    //   }
    //   this.Render();
    // });
  }
}
</script>

<style lang="scss" scoped>
.data-analysis {
  .canvass {
    width: 100%;
    height: 500px;
  }
}
</style>
