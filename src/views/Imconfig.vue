<template>
  <div class="center" v-if="!$route.query.DataKey">
    <h1 class="sitename">参数错误</h1>
  </div>
  <div class="page-index" v-else>
    <div class="center" style="padding-top: 20px;">
      <p>账号: {{ report }}</p>
    </div>

    <v-dialog v-model="settingDailog">
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="primary" style="top:80px" fixed top right small fab v-bind="attrs" v-on="on">
          <v-icon>mdi-view-dashboard-outline</v-icon>
        </v-btn>
      </template>

      <v-form ref="form" lazy-validation style="padding:20px;background-color:#ffffff;">
        <!-- <v-text-field required v-model="params.BasePrice" label="基准价格(USD)" type="number" outlined></v-text-field>
        <v-slider v-model="params.BasePriceWeight" label="基准价格权重" thumb-label="always" :thumb-size="30" :min="0" :max="1" :step="0.1"> </v-slider>
        <span>基准价格权重为<strong>1</strong>时:</span>
        <span><strong>不使用</strong>最近24小时成交均价做区间参考</span>
        <br />
        <br /> -->
        <v-list-item dense v-for="(item, index) in params.OrderRule" :key="index" active-class="text--accent-4">
          <v-list-item-icon>
            <v-text-field required style="width:80px" v-model.number="item.Price" :label="'价格' + (index + 1)" type="number"></v-text-field>
          </v-list-item-icon>
          <v-list-item-content>
            <v-text-field required style="width:80px" v-model.number="item.Position" :label="'持仓(负为空)'" type="number"></v-text-field>
          </v-list-item-content>
          <v-list-item-action>
            <v-icon color="success" @click="params.OrderRule.splice(index, 1)">mdi-close-circle</v-icon>
            <v-icon v-if="index < params.OrderRule.length - 1" color="primary" @click="ChooseRule(item)">mdi-vector-radius</v-icon>
          </v-list-item-action>
        </v-list-item>
        <v-list-item dense>
          <v-list-item-content>
            <v-icon color="primary" @click="params.OrderRule.push({ Price: 0, Position: 0, Next: { Type: 'L7', Position: 0, Price: 0 } })">mdi-plus-circle</v-icon>
          </v-list-item-content>
        </v-list-item>

        <v-dialog v-model="settingDailogSub">
          <v-item-group>
            <v-container>
              <v-row>
                <v-col v-for="item in RuleTypes" :key="item" cols="6" md="2">
                  <v-card class="d-flex align-center" height="100">
                    <div
                      :class="ActiveRule && ActiveRule.Next.Type === item ? 'div-active' : ''"
                      @click="RuleChoosed(item)"
                      :style="{ 'background-image': 'url(/t-' + item + '.svg)', width: '100%', height: '100%' }"
                      type="image/svg+xml"
                    ></div>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-item-group>
        </v-dialog>

        <v-text-field style="margin-top:10px" required v-model.number="params.MaxStepVol" label="单次挂单上限(张)" type="number" outlined></v-text-field>
        <v-text-field required v-model.number="params.OpenOrderMaxCount" label="挂单数量（单边，1~25）" type="number" outlined></v-text-field>
        <v-text-field required v-model.number="params.GridDiff" label="挂单间隔(USD，0.5的倍数)" type="number" outlined></v-text-field>

        <v-text-field required v-model="params.Key" label="api key" type="text" outlined clearable></v-text-field>
        <v-text-field required v-model="params.Pwd" label="密码" type="password" outlined clearable></v-text-field>
        <v-switch v-model="params.Runner" class="ma-2" label="策略运行"></v-switch>

        <v-btn color="primary" class="mr-4" @click="RunderSetting">
          <v-icon>mdi-refresh</v-icon>
          预览策略视图
        </v-btn>

        <div style="padding-bottom:20px;width:280px;height:300px;" ref="params"></div>

        <v-btn color="success" class="mr-4" @click="validate">保存</v-btn>
      </v-form>
    </v-dialog>

    <div class="section">
      <v-dialog ref="dialog" v-model="modal" color="primary" :return-value.sync="Dates" persistent>
        <template v-slot:activator="{ on, attrs }">
          <v-text-field v-model="Dates" label="日期选择" prepend-icon="mdi-calendar-range" readonly v-bind="attrs" v-on="on"></v-text-field>
        </template>
        <v-date-picker v-model="Dates" range scrollable :allowed-dates="allowedDates" :max="DateMax">
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
import { DateFormat, sleep } from '../lib/utils';
import echarts from 'echarts';
import urijs from 'urijs';
import { throttle } from 'ts-debounce-throttle';
import { FunApi } from '@/api/fun';
import { CodeObj } from '@/lib/Code';
let myChart: echarts.ECharts | null = null;
let myChart2: echarts.ECharts | null = null;
let myChart3: echarts.ECharts | null = null;

const DateMax = DateFormat(Date.now(), 'yyyy-MM-dd');

interface LogData {
  Ts: number;
  p24h: number;
  Price: number;
  BtcSum: number;
  UsdSum: number;
  quantity: number;
  // WantPos: number | number[];
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

type RuleTypeEnum = '' | 'LL' | '77' | 'L7' | '7L' | 'L' | '7';
export interface RuleType {
  Type: RuleTypeEnum;
  Position: number;
  Price: number;
}
export interface OrderRule {
  Price: number;
  Position: number;
  Next: RuleType;
}

// 以24小时均价为基准线。上下浮动范围调整仓位。
export interface UserParams {
  OrderRule: OrderRule[]; // 用户设置每个点位的持仓量，以此推算网格
  MaxStepVol: number; // 每次下单最多不能超过该金额
  OpenOrderMaxCount: number; // 单边挂单数量
  Runner: boolean;
  BasePriceWeight: number; // 基准价格权重，为1表示忽略24H均价。
  BasePrice: number; // 基准价格，中间价格
  GridDiff: number; // 订单间隔
  Reports: string[]; // 当前用户每日报表文件记录
  ReportKey: string;
  Time: number; // 该配置的设置时间
  Pwd: string;
  Key: string;
  BakSetting: UserParams[]; // 链式记录上一次的配置
  PricePosition: number[][];
}

@Component({
  components: {},
})
export default class ImconfigPage extends Vue {
  settingDailog = false;
  settingDailogSub = false;
  modal = false;
  DateMax = DateMax;
  Times = [DateMax, DateMax];
  Dates = [DateMax, DateMax];
  get BuildTime() {
    const Time = window.__Build_Time === '__Build_Time__' ? Date.now() : parseInt(window.__Build_Time, 10);
    return DateFormat(Time, 'yyyy-MM-dd hh:mm');
  }

  get report() {
    return this.$route.query.DataKey as string;
  }
  @Watch('settingDailog')
  async OnSettingDailogChange() {
    if (!this.settingDailog) return;
    await this.$nextTick();
    await sleep(1000);
    this.RunderSetting();
  }

  RuleTypes = ['L7', '7L', 'L', '7', 'LL', '77', ''];
  RunderSetting() {
    // 校验参数的合格性
    const OrderRule: OrderRule[] = [];
    this.params.OrderRule.sort((a, b) => a.Price - b.Price);

    let err = '';
    let max = Infinity;
    let lastPrice = 0;
    this.params.OrderRule.forEach((item, index) => {
      const pos = `【价格${index + 1}】`;
      if (err) return; // 已经定位错误了，以第一个错误为准
      if (item.Price <= 0) return (err = `价格不能为 0 ${pos}`);
      if (item.Position > max) return (err = `价格越大，持仓必须越小 ${pos}`);
      if (item.Price === lastPrice) return (err = `价格不能重复 ${pos}`);
      max = item.Position;
      lastPrice = item.Price;
      OrderRule.push(item);
    });
    if (!err) {
      if (this.params.MaxStepVol <= 0) err = `下单上限错误`;
      if (this.params.OpenOrderMaxCount <= 0) err = `单边挂单数量错误`;
      if (this.params.GridDiff < 0.5) err = `挂单间隔不能小于0.5`;
      if (OrderRule.length < 2) err = '价格至少设置两个';
    }
    if (err) return this.$AppStore.Error(err);

    const myChart = echarts.init(this.$refs.params as any);

    const MinPrice = OrderRule[0].Price;
    const PriceDiff = OrderRule[OrderRule.length - 1].Price - MinPrice;

    const PriceDiffCount = Math.ceil(PriceDiff / this.params.GridDiff);

    const xx = Array(PriceDiffCount + 1)
      .join(',')
      .split(',')
      .map((item, index) => index * this.params.GridDiff + MinPrice);

    const yy: number[] = [];
    const Map: { [index: string]: number } = {};

    let bakRule: OrderRule | null = null;
    OrderRule.forEach((rule) => {
      if (!bakRule) {
        bakRule = rule;
        return;
      }
      const perRule = bakRule;
      bakRule = rule;

      const center = perRule.Next;
      // 仓位不符合规范
      // if (center.Position <= perRule.Position || center.Position >= rule.Position || center.Price <= perRule.Price || center.Price >= rule.Price) {
      center.Position = (perRule.Position + rule.Position) / 2;
      center.Price = (rule.Price + perRule.Price) / 2;
      switch (center.Type) {
        case 'L':
          center.Position = center.Position - (center.Position - perRule.Position) * -0.5;
          center.Price = center.Price - (center.Price - rule.Price) * -0.5;
          break;
        case '7':
          center.Position = center.Position - (center.Position - rule.Position) * -0.5;
          center.Price = center.Price - (center.Price - perRule.Price) * -0.5;
          break;
      }
      // }

      const centerSum = center.Price * center.Position;
      const beginSum = perRule.Price * perRule.Position;
      const endSum = rule.Price * rule.Position;
      const bc = beginSum / centerSum;
      const ec = endSum / centerSum;

      xx.forEach((item) => {
        if (item < perRule.Price || item > rule.Price) return;
        if (item === rule.Price) return yy.push(rule.Position);
        if (item === center.Price) return yy.push(center.Position);
        if (item === perRule.Price) return yy.push(perRule.Position);
        let begin: { Price: number; Position: number } = perRule;
        let end: { Price: number; Position: number } = center;
        if (item > center.Price) {
          begin = center;
          end = rule;
        }
        const p = (item - begin.Price) / (end.Price - begin.Price);
        const pp = 0.5 + p * 1.5;
        let add = 0;
        const Line = () => p * (begin.Position - end.Position);
        const PicL = () => ((2 - 1 / pp) / 1.5) * (begin.Position - end.Position);
        const Pic7 = () => ((1 / (2.5 - pp) - 0.5) / 1.5) * (begin.Position - end.Position);
        const str = center.Type.split('');
        const bp = str[0];
        const ep = str[str.length - 1];
        if (center.Type === '') {
          add = Line();
        } else if ((item < center.Price && bp === '7') || (item > center.Price && ep === '7')) {
          add = Pic7();
        } else {
          add = PicL();
        }
        const Position = begin.Position - add;
        yy.push(Position > 0 ? Math.floor(Position) : Math.ceil(Position));
      });
    });

    this.params.PricePosition = xx.map((x, index) => [x, yy[index]]);

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
      legend: {
        data: ['仓位'],
      },
      grid: {
        left: '20px',
        right: '14px',
        bottom: '40px',
        containLabel: true,
      },
      xAxis: [{ type: 'category', boundaryGap: false }],
      yAxis: [
        {
          type: 'value',
          min: 'dataMin',
          max: 'dataMax',
        },
      ],
    });

    myChart.setOption({
      xAxis: {
        data: xx,
      },
      series: [
        {
          name: '仓位',
          type: 'bar',
          data: yy,
        },
      ],
    });
    return 'success';
  }

  ChooseRule(item: OrderRule) {
    this.settingDailogSub = true;
    this.ActiveRule = item;
  }
  RuleChoosed(item: RuleTypeEnum) {
    if (!this.ActiveRule) return;
    this.ActiveRule.Next.Type = item;
    this.settingDailogSub = false;
  }
  ActiveRule: null | OrderRule = null;
  params: UserParams = {
    OrderRule: [
      { Price: 11500, Position: 1000, Next: { Type: 'L7', Position: 0, Price: 0 } },
      { Price: 12500, Position: 0, Next: { Type: 'L7', Position: 0, Price: 0 } },
      { Price: 13000, Position: -100, Next: { Type: 'L7', Position: 0, Price: 0 } },
    ],
    OpenOrderMaxCount: 20, // 单边最多挂单数量
    Runner: false,
    Key: Vue.AppStore.localState.UserKey,
    BasePrice: 11700,
    BasePriceWeight: 1,
    GridDiff: 1, // 挂单间隔
    MaxStepVol: 100,
    Reports: [],
    Time: 0,
    Pwd: '',
    ReportKey: '',
    BakSetting: [],
    PricePosition: [],
  };
  OrderRuleModel = [];

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

  allowedDates(val: string) {
    return this.params.Reports.indexOf(val) > -1;
  }

  async mountedd() {
    this.GetParams();
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
    Vue.AppStore.localState.TimesCache = this.Times;
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
      // { name: '目标持仓', type: 'line', color: '#ff9900', key: 'WantPos', y: 2 },
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
          const value = (data as any)[val.key];
          // if (val.key === 'WantPos' && typeof value === 'object') return render[val.name].data.push(value[0]);
          render[val.name].data.push(value);
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
    const Data = await this.$AnalysisStore.GetJson(`https://fmex-database.oss-cn-qingdao.aliyuncs.com/runner/report/${this.report}/` + FileName);
    if (!Data) {
      return this.GetData(time, ++times);
    }
    this.SnapshotData.push({
      time,
      data: Data,
    });
    // 获取下一个报表
    const thisIndex = this.params.Reports.indexOf(time);
    const next = this.params.Reports[thisIndex + 1];
    if (time !== this.Times[1] && next !== this.Times[1]) return this.GetData(next);
    this.Render();
    return true;
  }

  async GetParams() {
    const Data = await this.$AnalysisStore.GetJson(`https://fmex-database.oss-cn-qingdao.aliyuncs.com/runner/report/${this.report}/config`, true);
    if (!Data) return this.$AppStore.Error('配置文件加载失败，请刷新重试');
    Object.assign(this.params, Data);
    this.params.Key = this.$AppStore.localState.UserKey;
    if (this.params.Reports.length === 0) return this.$AppStore.Error('暂未找到该账号的数据报表');
    this.Times[0] = this.Times[1] = this.params.Reports[this.params.Reports.length - 1];

    this.GetData(this.Times[0]);
    this.RenderInit();
  }

  async validate() {
    const check = this.RunderSetting();
    if (check !== 'success') return;
    this.params.ReportKey = this.report;
    this.$AppStore.localState.UserKey = this.params.Key;
    const res = await FunApi.post('/grid/set-params', this.params).then((res) => res.data as CodeObj<any>);
    console.log(res);
    this.settingDailog = false;
    if (res.Error()) return this.$AppStore.Error(res.Msg);
    this.$AppStore.Error('保存成功');
  }
}
</script>

<style lang="scss" scoped>
.div-active {
  border: 2px solid $color-primary;
}
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
