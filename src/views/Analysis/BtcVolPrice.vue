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
import { DateFormat, EchartsUtilsToolbox } from '../../lib/utils';
import { FMexWss } from '../../lib/wss';
import { FMex } from '@/api/FMex';
import { PageLoading } from '@/lib/page-loading';
import BigNumber from 'bignumber.js';
import { debounce, throttle } from 'ts-debounce-throttle';
import { SetShareInfo } from '@/lib/bridge';

const DateMax = DateFormat(Date.now(), 'yyyy-MM-dd');
const DateMin = DateFormat(new Date(2020, 7 - 1, 13), 'yyyy-MM-dd');
const MinTime = new Date(DateMin).getTime();
const GetTimes = () => {
  const now = new Date();
  const begin = new Date();
  begin.setDate(now.getDate() - 7);
  if (begin.getTime() < MinTime) begin.setTime(MinTime); // 开始时间不得大于目前已有的基础时间（有数据的时间）
  return [DateFormat(begin, 'yyyy-MM-dd'), DateMax];
};

let myChart: echarts.ECharts | null = null;
let myChart2: echarts.ECharts | null = null;
const map: any = {};
const Xarray = new Array((24 * 60) / 3).fill(0).map((v, i) => i * 3);

@Component({
  components: {},
})
export default class BtcVolPrice extends Vue {
  modal = false;
  DateMin = DateMin;
  DateMax = DateMax;
  // 默认选中最近 7 天
  Times = GetTimes();
  Dates = GetTimes();

  first = true;
  loading = true;
  // OnLoadData = ['用户资产数据'];
  SnapshotData: any[] = [];
  SnapshotData2: FMex.CandelRes[] = [];
  SnapshotData3: FMex.CandelRes[] = [];

  BaseUrl = 'https://foss.imconfig.com/fmex/v2/market/all-tickers/';
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

    FMexWss.sub('candle', FMex.Resolution.M3, 'btcusd_p').ondata((res) => {
      const item2 = this.SnapshotData2[this.SnapshotData2.length - 1];
      if (item2) {
        if (item2.id === res.id) {
          Object.assign(item2, res);
          console.log('merge to SnapshotData2', res);
        } else {
          this.SnapshotData2.push(res);
          console.log('push to SnapshotData2', res);
        }
      }
      this.Render2();
    });
    FMexWss.sub('candle', FMex.Resolution.M1, 'btcusd_p').ondata((res) => {
      const item3 = this.SnapshotData3[this.SnapshotData3.length - 1];
      if (item3) {
        if (item3.id === res.id) {
          Object.assign(item3, res);
          console.log('merge to SnapshotData3', res);
        } else {
          this.SnapshotData3.push(res);
          console.log('push to SnapshotData3', res);
        }
      }
      this.Render2();
    });

    FMexWss.req('candle', FMex.Resolution.M1, 'btcusd_p', 1440, now).then((res) => {
      this.SnapshotData3 = res.data;
      this.Render2();
    });

    // 获取到最近3天的数据（M1只能获取到最近24小时的）
    const [res1] = await Promise.all([FMexWss.req('candle', FMex.Resolution.M3, 'btcusd_p', 1440, now)]);

    // FMexWss.req('candle', FMex.Resolution.M1, 'btcusd_p', 1440, now)
    close();
    // const minLast24 = res2.data[0].id;
    // res1.data = res1.data.filter((item) => item.id < minLast24);
    // const max3m = res1.data[res1.data.length - 1].id + 180;
    // 相隔必须是3分钟。否则删除3分钟内多计算的
    // res2.data = res2.data.filter((item) => item.id >= max3m);
    // this.SnapshotData2 = res1.data.concat(res2.data);
    this.SnapshotData2 = res1.data;
    this.Render2();
  }
  Render2 = throttle(function(this: BtcVolPrice) {
    if (!myChart2) return;
    if (!this.SnapshotData2.length) return;
    const CurrentBtc = {
      name: `交易额`,
      yAxisIndex: 1,
      type: 'line',
      data: Xarray.map((i) => NaN),
      color: `rgba(4, 204, 164, 1)`,
      markPoint: {
        data: [] as any[],
      },
    };
    const LastBtc = {
      name: `交易额(昨)`,
      yAxisIndex: 1,
      type: 'line',
      data: Xarray.map((i) => NaN),
      color: `rgba(4, 204, 164, 0.3)`,
      markPoint: {
        data: [] as any[],
      },
    };
    const CurrentUsd = {
      name: `交易量`,
      yAxisIndex: 0,
      type: 'line',
      data: Xarray.map((i) => NaN),
      color: `rgba(4, 164, 204, 1)`,
      markPoint: {
        data: [] as any[],
      },
    };
    const LastUsd = {
      name: `交易量(昨)`,
      yAxisIndex: 0,
      type: 'line',
      data: Xarray.map((i) => NaN),
      color: `rgba(4, 164, 204, 0.3)`,
      markPoint: {
        data: [] as any[],
      },
    };
    const theDateOfNow = Date.now();
    const TodayStr = DateFormat(theDateOfNow, 'yyyy-MM-dd');
    const LastStr = DateFormat(theDateOfNow - 86400000, 'yyyy-MM-dd');
    const TodayStrArr: string[] = [];
    const LastStrArr: string[] = [];
    const xAxis = Xarray.map((val) => {
      let hh: any = Math.floor(val / 60); // 小时
      let mm: any = val % 60;
      if (hh < 10) hh = `0${hh}`;
      if (mm < 10) mm = `0${mm}`;
      const end = `${hh}:${mm}`;
      TodayStrArr.push(TodayStr + ' ' + end);
      LastStrArr.push(LastStr + ' ' + end);
      return end;
    });

    let sum24 = 0;
    const timer24 = theDateOfNow - 86400000;

    // 使用 SnapshotData3 计算出 最近24小时的交易量
    let SnapshotData3Last24H = 0;
    this.SnapshotData3.forEach((item) => {
      const time = item.id * 1000;
      if (time <= timer24) return;
      SnapshotData3Last24H += item.base_vol;
    });
    SnapshotData3Last24H = Math.floor(SnapshotData3Last24H / 10000) / 10000;

    let lastIndex = 0; // 记录今天的最后一个索引（后面的索引还没有数据。）

    this.SnapshotData2.forEach((item) => {
      const time = item.id * 1000;
      if (time > timer24) sum24 = sum24 + item.base_vol; // 统计最近24小时
      const timestr = DateFormat(time, 'yyyy-MM-dd hh:mm');
      const index = TodayStrArr.indexOf(timestr);
      const index2 = LastStrArr.indexOf(timestr);
      if (index > -1) {
        CurrentBtc.data[index] = new BigNumber(item.quote_vol).plus(CurrentBtc.data[index] || 0).toNumber();
        CurrentUsd.data[index] = new BigNumber(item.base_vol / 10000).plus(CurrentUsd.data[index] || 0).toNumber();
        lastIndex = index;
      } else if (index2 > -1) {
        LastBtc.data[index2] = new BigNumber(item.quote_vol).plus(LastBtc.data[index2] || 0).toNumber();
        LastUsd.data[index2] = new BigNumber(item.base_vol / 10000).plus(LastUsd.data[index2] || 0).toNumber();
      }
    });

    // console.log(TodayStrArr, LastStrArr, CurrentUsd, CurrentBtc, LastUsd, LastBtc);

    let summ = new BigNumber(0);
    LastUsd.data.forEach((item, index) => {
      summ = summ.plus(item);
      LastUsd.data[index] = summ.toNumber();
    });
    summ = new BigNumber(0);
    LastBtc.data.forEach((item, index) => {
      summ = summ.plus(item);
      LastBtc.data[index] = summ.toNumber();
    });
    summ = new BigNumber(0);
    CurrentUsd.data.forEach((item, index) => {
      if (index > lastIndex) return;
      summ = summ.plus(item);
      CurrentUsd.data[index] = summ.toNumber();
    });
    summ = new BigNumber(0);
    CurrentBtc.data.forEach((item, index) => {
      if (index > lastIndex) return;
      summ = summ.plus(item);
      CurrentBtc.data[index] = summ.toNumber();
    });

    CurrentBtc.markPoint.data.push({
      symbol: 'pin',
      symbolSize: 40,
      name: '',
      coord: [xAxis[lastIndex], CurrentBtc.data[lastIndex]],
      value: CurrentBtc.data[lastIndex],
    });
    CurrentUsd.markPoint.data.push({
      symbol: 'pin',
      symbolSize: 40,
      name: '',
      coord: [xAxis[lastIndex], CurrentUsd.data[lastIndex]],
      value: CurrentUsd.data[lastIndex],
    });
    LastBtc.markPoint.data.push({
      symbol: 'pin',
      symbolSize: 40,
      name: '',
      coord: [xAxis[xAxis.length - 1], LastBtc.data[LastBtc.data.length - 1]],
      value: LastBtc.data[LastBtc.data.length - 1],
    });
    LastUsd.markPoint.data.push({
      symbol: 'pin',
      symbolSize: 40,
      name: '',
      coord: [xAxis[xAxis.length - 1], LastUsd.data[LastUsd.data.length - 1]],
      value: LastUsd.data[LastUsd.data.length - 1],
    });

    const sum = Math.floor(CurrentUsd.data[lastIndex]) / 10000;
    const lastSum = Math.floor(LastUsd.data[LastUsd.data.length - 1]) / 10000;
    sum24 = Math.floor(sum24 / 10000) / 10000;
    myChart2.setOption({
      title: {
        text: [
          `    ·  ${DateFormat(theDateOfNow, 'yyyy-MM-dd hh:mm:ss')}`,
          `    ·  ${sum} 亿 USD (今日)`,
          `    ·  ${lastSum} 亿 USD (昨日)`,
          `    ·  ${SnapshotData3Last24H || sum24} 亿 USD (最近24小时)`,
        ].join('\r\n'),
      },
      xAxis: {
        data: xAxis,
      },
      series: [CurrentUsd, LastUsd, CurrentBtc, LastBtc],
    });

    SetShareInfo(
      `FMex交易量 BTC永续`,
      [
        `${DateFormat(theDateOfNow, 'yyyy-MM-dd hh:mm:ss')}`, //
        `${sum} 亿USD(今日)`,
        `${SnapshotData3Last24H || sum24} 亿USD(最近24小时)`,
      ].join('\r\n'),
      `https://fmex.fun/#/Analysis?tab=2`
    );
  }, 1000);

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
      toolbox: EchartsUtilsToolbox,
      grid: {
        right: '90px',
        left: '50px',
        bottom: '80px',
        top: '140px',
      },
      legend: {
        data: ['交易量', '交易额', '交易量(昨)', '交易额(昨)'],
        selected: {
          交易量: true,
          交易额: false,
          '交易量(昨)': true,
          '交易额(昨)': false,
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
      toolbox: EchartsUtilsToolbox,
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
        top: '24px',
      },
      title: {
        text: ``,
        subtext: `成交走势${this.Times[0]}~${this.Times[1]}`,
        top: '0px',
      },
      xAxis: [{ type: 'category', boundaryGap: false }],
      dataZoom: [
        {
          show: true,
          start: 0,
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
