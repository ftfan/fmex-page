<template>
  <div class="page-index">
    <div class="center">
      <h1 class="sitename">测试账号</h1>
      <p><b>最近更新: </b>{{ BuildTime }}</p>
    </div>

    <v-form ref="form" lazy-validation style="padding-left:20px;padding-right:20px;">
      <v-select v-model="paramsAutoPrice" :items="paramsAutoPrices" :label="paramsAutoPrice" solo></v-select>
      <template v-if="paramsAutoPrice === '固定区间模式'">
        <v-text-field required v-model="params.MaxPrice" label="【上限价格】，达到此价格，持【上限仓位】(USD)" type="number" outlined></v-text-field>
        <v-text-field required v-model="params.MaxPosition" label="【上限仓位】负为空(张)" type="number" outlined></v-text-field>

        <v-text-field required v-model="params.MinPrice" label="【下限价格】，达到此价格，持【下限仓位】(USD)" type="number" outlined></v-text-field>
        <v-text-field required v-model="params.MinPosition" label="【下限仓位】负为空(张)" type="number" outlined></v-text-field>
      </template>
      <template v-else>
        <v-text-field required v-model="params.MaxPrice" label="【上限价格】24H均价+该价格，持【上限仓位】(USD)" type="number" outlined></v-text-field>
        <v-text-field required v-model="params.MaxPosition" label="【上限仓位】负为空(张)" type="number" outlined></v-text-field>

        <v-text-field required v-model="params.MinPrice" label="【下限价格】24H均价+该价格，持【下限仓位】(USD)" type="number" outlined></v-text-field>
        <v-text-field required v-model="params.MinPosition" label="【下限仓位】负为空(张)" type="number" outlined></v-text-field>
      </template>

      <v-text-field required v-model="params.MaxStepVol" label="单次挂单量(张)" type="number" outlined></v-text-field>
      <v-text-field required v-model="params.OverStepChange" label="价差多少重新下单(USD)" type="number" outlined></v-text-field>

      <v-text-field required v-model="params.Key" label="api key" type="text" outlined></v-text-field>
      <v-switch v-model="params.Runner" class="ma-2" label="策略运行"></v-switch>

      <v-btn color="success" class="mr-4" @click="validate">保存</v-btn>
    </v-form>
    <div class="section">
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
      <div style="padding-top:10px" class="echarts" ref="MyAccount"></div>
      <div style="padding-top:40px" class="echarts" ref="MyAccountDetail"></div>
      <v-slider v-model="detailValue" thumb-label="always" :thumb-size="60" :min="detailMin" :max="detailMax" :step="0.5">
        <template v-slot:prepend>
          <v-icon color="primary" @click="detailValue -= 0.5">
            mdi-minus
          </v-icon>
        </template>

        <template v-slot:append>
          <v-icon color="primary" @click="detailValue += 0.5">
            mdi-plus
          </v-icon>
        </template>
      </v-slider>
      <div style="padding-top:40px" class="echarts" ref="MyAccountReport"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { DateFormat } from '../lib/utils';
import echarts from 'echarts';
import { throttle } from 'ts-debounce-throttle';
import Axios from 'axios';
let myChart: echarts.ECharts | null = null;
let myChart2: echarts.ECharts | null = null;
let myChart3: echarts.ECharts | null = null;

const DateMax = DateFormat(Date.now(), 'yyyy-MM-dd');
const DateMin = DateFormat(new Date(2020, 8 - 1, 7), 'yyyy-MM-dd');
const MinTime = new Date(DateMin).getTime();
const GetTimes = () => {
  const now = new Date();
  const begin = new Date();
  begin.setDate(now.getDate() - 2);
  if (begin.getTime() < MinTime) begin.setTime(MinTime); // 开始时间不得大于目前已有的基础时间（有数据的时间）
  return [DateFormat(begin, 'yyyy-MM-dd'), DateMax];
};

interface LogData {
  Ts: number;
  p24h: number;
  Price: number;
  BtcSum: number;
  UsdSum: number;
  quantity: number;
  WantPos: number;
}

interface KData {
  low: number;
  high: number;
  open: number;
  close: number;
  price: number;
  details: LogData[];
}
let KlineData: {
  [index: string]: KData;
} = {};

@Component({
  components: {},
})
export default class ImconfigPage extends Vue {
  modal = false;
  DateMin = DateMin;
  DateMax = DateMax;
  // 默认选中最近 30 天
  Times = GetTimes();
  Dates = GetTimes();
  get BuildTime() {
    const Time = window.__Build_Time === '__Build_Time__' ? Date.now() : parseInt(window.__Build_Time, 10);
    return DateFormat(Time, 'yyyy-MM-dd hh:mm');
  }

  params = {
    MinPrice: 11600,
    MinPosition: 1000,
    MaxPrice: 12000,
    MaxPosition: -200,
    AutoPrice: false,
    MaxStepVol: 100, // 每次下单最多不能超过该金额
    OverStepChange: 3,
    Runner: true,
    Key: Vue.AppStore.localState.UserKey,
  };
  paramsAutoPrice = '固定区间模式';
  paramsAutoPrices = ['固定区间模式', '24H均价移动区间模式'];

  detailValue = 0;
  detailMin = Infinity;
  detailMax = 0;
  @Watch('detailValue')
  detailValueChange() {
    this.Runder3();
  }

  SnapshotData: { data: LogData[]; time: string }[] = [];

  mounted() {
    this.mountedd();
  }

  async mountedd() {
    this.GetParams();

    this.GetData(this.Times[0]);
    this.RenderInit();
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
    await this.GetData(this.Times[0]);
    this.Render();
  }

  RenderInit() {
    this.SnapshotData = [];
    myChart = echarts.init(this.$refs.MyAccount as any);
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
      legend: {
        data: ['24H均价', '现价', '资产BTC', '持仓', '目标持仓'],
        selected: {
          '24H均价': true,
          现价: true,
          资产BTC: true,
          持仓: true,
          目标持仓: false,
        },
      },
      dataZoom: [
        {
          show: true,
          start: 0,
          end: 100,
        },
      ],
      grid: {
        left: '20px',
        right: '14px',
        bottom: '40px',
        // top: '40px',
        containLabel: true,
      },
      title: {
        text: ``,
        subtext: `账户资产走势`,
        top: 4,
      },
      xAxis: [{ type: 'category', boundaryGap: false }],
      yAxis: [
        {
          type: 'value',
          position: 'left',
          name: '价格: USD',
          axisLabel: {
            formatter: '{value}',
          },
          min: 'dataMin',
          max: 'dataMax',
          splitLine: { show: false },
        },
        {
          type: 'value',
          position: 'right',
          name: '账户权益: BTC',
          axisLabel: {
            formatter: '{value}',
          },
          min: (value) => {
            return Math.floor(value.min * 10000) / 10000;
          },
          splitLine: { show: false },
        },
        {
          type: 'value',
          offset: 50,
          position: 'right',
          name: '持仓金额: USD',
          axisLabel: {
            formatter: '{value}',
          },
          // min: -200,
          // max: 1000,
          splitLine: { show: false },
          inverse: true,
        },
      ],
    });

    myChart2 = echarts.init(this.$refs.MyAccountReport as any);
    myChart2.setOption({
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
      legend: {
        data: ['资产变更'],
      },
      dataZoom: [
        {
          show: true,
          start: 33,
          end: 66,
        },
      ],
      grid: {
        left: '20px',
        right: '14px',
        bottom: '40px',
        containLabel: true,
      },
      title: {
        text: ``,
        subtext: `资产-价格变更趋势`,
        top: 4,
      },
      xAxis: [{ type: 'category', boundaryGap: false, scale: true, axisLine: { onZero: false }, splitLine: { show: false }, min: 'dataMin', max: 'dataMax' }],
      yAxis: [
        {
          scale: true,
          splitArea: {
            show: true,
          },
        },
      ],
    });

    myChart3 = echarts.init(this.$refs.MyAccountDetail as any);
    myChart3.setOption({
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
      legend: {
        data: ['资产变更-详情'],
      },
      grid: {
        left: '20px',
        right: '14px',
        bottom: '40px',
        containLabel: true,
      },
      title: {
        text: ``,
        subtext: `资产-变更记录`,
        top: 4,
      },
      xAxis: [{ type: 'category', boundaryGap: false, scale: true, axisLine: { onZero: false }, splitLine: { show: false }, min: 'dataMin', max: 'dataMax' }],
      yAxis: [
        {
          type: 'value',
          position: 'left',
          name: '价格: USD',
          axisLabel: {
            formatter: '{value}',
          },
          min: 'dataMin',
          splitLine: { show: false },
        },
        {
          type: 'value',
          position: 'right',
          name: '账户权益: BTC',
          axisLabel: {
            formatter: '{value}',
          },
          min: (value) => {
            return Math.floor(value.min * 10000) / 10000;
          },
          splitLine: { show: false },
        },
      ],
    });
  }

  Render() {
    if (!myChart) return;
    if (!myChart2) return;
    if (!myChart3) return;
    interface Aaaa {
      name: string;
      type: string;
      data: number[];
      color: string;
      yAxisIndex: number;
      areaStyle: any;
    }
    const conf = [
      { name: '资产BTC', type: 'line', color: 'rgba(4, 100, 100, 0.3)', areaStyle: { color: 'rgba(4, 100, 100, 0.3)' }, key: 'BtcSum', y: 1 },
      { name: '24H均价', type: 'line', color: '#666666', key: 'p24h', y: 0 },
      { name: '现价', type: 'line', color: 'rgba(4, 164, 204, 1)', key: 'Price', y: 0 },
      { name: '持仓', type: 'line', color: '#ff0099', key: 'quantity', y: 2 },
      { name: '目标持仓', type: 'line', color: '#ff9900', key: 'WantPos', y: 2 },
    ];
    const render: { [index: string]: Aaaa } = {};

    conf.forEach((item) => {
      render[item.name] = {
        yAxisIndex: item.y,
        name: item.name,
        type: item.type,
        data: [] as number[],
        color: item.color,
        areaStyle: item.areaStyle,
      };
    });

    const xxx: string[] = [];
    KlineData = {};
    const arr: KData[] = [];

    this.SnapshotData.forEach((item) => {
      item.data.forEach((data) => {
        conf.forEach((val) => {
          render[val.name].data.push((data as any)[val.key]);
        });
        xxx.push(DateFormat(data.Ts, 'hh:mm:ss\r\nMM-dd'));

        // 计算K线
        const kline = KlineData[data.Price];
        if (!kline) {
          KlineData[data.Price] = {
            low: data.BtcSum,
            high: data.BtcSum,
            open: data.BtcSum,
            close: data.BtcSum,
            price: data.Price,
            details: [data],
          };
          arr.push(KlineData[data.Price]);
          return;
        }
        kline.low = Math.min(kline.low, data.BtcSum);
        kline.high = Math.max(kline.high, data.BtcSum);
        kline.close = data.BtcSum;
        kline.details.push(data);

        this.detailMax = Math.max(this.detailMax, data.Price);
        this.detailMin = Math.min(this.detailMin, data.Price);
      });
    });
    // console.log(this.SnapshotData, render, xxx.length);

    // 过滤资产不变更的数据
    let ii = 0;
    arr.forEach((i) => {
      const close = i.close; //  - i.open;
      const low = i.low; //  - i.open;
      const high = i.high; //  - i.open;
      // if (low === 0 && high === 0) return;
      const replace = arr[ii++];
      replace.low = low;
      replace.high = high;
      replace.close = close;
    });

    arr.splice(ii, arr.length - ii);
    arr.sort((a, b) => a.price - b.price);
    console.log(arr);

    myChart.setOption({
      xAxis: {
        data: xxx,
      },
      series: [...conf.map((item) => render[item.name])],
    });

    const upColor = '#ec0000';
    const upBorderColor = '#8A0000';
    const downColor = '#00da3c';
    const downBorderColor = '#008F28';

    myChart2.setOption({
      xAxis: {
        data: arr.map((i) => i.price),
      },
      series: [
        {
          name: '资产变更',
          type: 'candlestick',
          data: arr.map((i) => [i.open, i.close, i.low, i.high]),
          itemStyle: {
            color: upColor,
            color0: downColor,
            borderColor: upBorderColor,
            borderColor0: downBorderColor,
          },
        },
      ],
    });

    const lastFile = this.SnapshotData[this.SnapshotData.length - 1];
    if (!lastFile || !lastFile.data.length) return;
    const lastPrice = lastFile.data[lastFile.data.length - 1].Price;
    console.log(lastPrice);
    this.detailValue = lastPrice;
    // this.Runder3();
  }

  Runder3 = throttle(function(this: ImconfigPage) {
    if (!myChart3) return;
    const last = KlineData[this.detailValue];
    const end = () => {
      if (!myChart3) return;
      // myChart3.clear();
    };
    if (!last) return end();

    // 将数组内相邻的相同数据剔除
    let lastBtcSum = -1;
    const lastDetail = last.details.filter((item) => {
      if (item.BtcSum === lastBtcSum) return false;
      lastBtcSum = item.BtcSum;
      return true;
    });
    if (lastDetail.length < 2) return end();
    const open = lastDetail[lastDetail.length - 1].BtcSum;
    const diff = lastDetail[lastDetail.length - 1].BtcSum - lastDetail[0].BtcSum;
    const title = `${last.price} USD 资产变更`;
    const subtext = `${last.price} USD 资产变更: ${diff} (${Math.floor((diff / open) * 10000) / 100}%)`;
    console.log(last);

    myChart3.setOption({
      legend: {
        data: ['资产', '24H均价', '持仓'],
      },
      title: {
        subtext: subtext,
      },
      xAxis: {
        data: lastDetail.map((item) => DateFormat(item.Ts, 'hh:mm:ss\r\nMM-dd')),
      },
      series: [
        {
          name: '资产',
          yAxisIndex: 1,
          type: 'line',
          data: lastDetail.map((item) => item.BtcSum),
          areaStyle: { color: 'rgba(4, 100, 100, 0.3)' },
        },
        {
          name: '24H均价',
          type: 'line',
          data: lastDetail.map((item) => item.p24h),
        },
      ],
    });
  }, 1000);

  async GetData(time: string, times = 1): Promise<any> {
    if (times > 5) return;
    const FileName = time.replace(/-/g, '/');
    // this.OnLoadData.push(`加载 ${FileName} ${times > 1 ? times : ''}`);
    const Data = await this.$AnalysisStore.GetJson('https://fmex-database.oss-cn-qingdao.aliyuncs.com/report/9f19f869ad1cc4adbbfc10f509a6fad6/' + FileName);
    if (!Data) {
      return this.GetData(time, ++times);
    }
    this.SnapshotData.push({
      time,
      data: Data,
    });
    const timeDate = new Date(time);
    const next = new Date(timeDate.getTime() + 86400000);
    if (next.getTime() <= new Date(this.Times[1]).getTime()) {
      return this.GetData(DateFormat(next, 'yyyy-MM-dd'));
    }
    this.Render();
    return true;
  }

  async GetParams() {
    const Data = await this.$AnalysisStore.GetJson(`https://fmex-database.oss-cn-qingdao.aliyuncs.com/report/${this.$AppStore.localState.KeyDecode}/config`);
    if (!Data) return;
    Object.assign(this.params, Data);
  }

  async validate() {
    this.params.AutoPrice = this.paramsAutoPrice !== '固定区间模式';
    this.$AppStore.localState.UserKey = this.params.Key;
    const res = await Axios.get(`${this.$AppStore.localState.ServerUrl}/grid/set-params`, {
      params: this.params,
    });
    if (res.data && res.data.Code === 0) {
      this.$AppStore.localState.UserKey = this.params.Key;

      return alert('保存成功');
    }
    alert(res.data && res.data.Msg);
  }
}
</script>

<style lang="scss" scoped>
.echarts {
  width: 100%;
  height: 600px;
}
h2 {
  color: #fff;
}
$time: 10s;
.sitename {
  color: $color-primary;
}
p {
  color: $color-primary;
}
.section {
  margin-top: 20px;
}
.center {
  text-align: center;
}
ul {
  li {
    $section-ul-li-width: 240px;
    width: $section-ul-li-width;
    height: $section-ul-li-width / 3;
    padding: 12px;
    margin: 4px;
    background-color: $color-primary;
    border: 4px solid #fff;
    box-shadow: 0 0 4px $color-primary;
    transition: all 0.2s ease-in-out;
    float: left;
    overflow: hidden;

    h2 {
      font-size: 1rem;
      font-weight: 400;
      text-align: center;
    }

    a {
      color: #fff;
    }

    .des {
      color: #dadada;
      font-size: 0.8rem;
    }

    &:hover {
      background-color: #00a499;
      cursor: pointer;

      a {
        color: #83e9f5;
        text-decoration: none;
      }
    }
  }
}
</style>
