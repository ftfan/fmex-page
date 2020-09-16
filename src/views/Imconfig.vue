<template>
  <div class="center" v-if="!report">
    <h1 class="sitename">参数错误</h1>
  </div>
  <div class="page-index" v-else>
    <div class="center" style="padding-top: 20px;">
      <p>账号: {{ report }}</p>
      <p v-if="!IsAdmin">无当前账号设置权限</p>
    </div>

    <v-btn-toggle color="primary" tile dense v-model="IsUSD">
      <v-btn>BTC本位</v-btn>
      <v-btn>USD本位</v-btn>
    </v-btn-toggle>

    <!-- <v-dialog v-model="TipDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <template v-slot:activator="{ on, attrs }">
        <v-btn style="float:right" color="primary" dark v-bind="attrs" dense tile v-on="on">当前策略解析</v-btn>
      </template>
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title>策略解析</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="TipDialog = false">关闭</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-list three-line subheader>
          <v-subheader>多空方向分析</v-subheader>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Content filtering</v-list-item-title>
              <v-list-item-subtitle>Set the content filtering level to restrict apps that can be downloaded</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Password</v-list-item-title>
              <v-list-item-subtitle>Require password for purchase or use password to restrict purchase</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-list three-line subheader>
          <v-subheader>General</v-subheader>
          <v-list-item>
            <v-list-item-action>
              <v-checkbox v-model="notifications"></v-checkbox>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Notifications</v-list-item-title>
              <v-list-item-subtitle>Notify me about updates to apps or games that I downloaded</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-action>
              <v-checkbox v-model="sound"></v-checkbox>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Sound</v-list-item-title>
              <v-list-item-subtitle>Auto-update apps at any time. Data charges may apply</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog> -->
    <!-- <v-tabs color="primary" v-model="ViewMode">
      <v-tab>最近24小时</v-tab>
      <v-tab>查看所有</v-tab>
      <v-tab>自定义查看</v-tab>
    </v-tabs> -->
    <v-btn-toggle color="primary" mandatory tile dense v-model="ViewMode">
      <v-btn>最近24小时</v-btn>
      <v-btn>最近视图</v-btn>
      <v-btn>总视图</v-btn>
      <v-btn>自定义视图</v-btn>
    </v-btn-toggle>

    <v-card-text>
      {{ ViewModeText[ViewMode] }}
    </v-card-text>

    <template v-if="ViewMode === 3">
      <!-- 报表选择 -->
      <v-select v-model="ShowReports" :items="ReportsSelect" filled chips label="选择查看数据" multiple></v-select>
      <!-- 资产精度选择 -->
      <v-select v-model="BtcNumEnd" :items="BtcNumEnds" filled chips label="资产,小数精确位数"></v-select>
      <!-- 数据采样 -->
      <v-select v-model="DataNum" :items="DataNums" filled chips label="查看每日采样数据：份"></v-select>
    </template>

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
        <v-btn-toggle color="primary" tile mandatory dense v-model="params.Hedging">
          <v-btn>合约网格</v-btn>
          <v-btn>USD本位 BTC对冲</v-btn>
        </v-btn-toggle>
        <template v-if="params.Hedging === 0">
          <v-list-item dense v-for="(item, index) in params.OrderRule" :key="index" active-class="text--accent-4">
            <v-list-item-icon>
              <v-text-field required style="width:80px" v-model.number="item.Price" :label="'价格' + (index + 1)" type="number"></v-text-field>
            </v-list-item-icon>
            <v-list-item-content>
              <v-text-field required style="width:80px" v-model.number="item.Position" :label="'持仓(负为空)'" type="number"></v-text-field>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon color="error" @click="params.OrderRule.splice(index, 1)">mdi-close-circle</v-icon>
              <v-icon v-if="index < params.OrderRule.length - 1" color="primary" @click="ChooseRule(item)">mdi-vector-radius</v-icon>
            </v-list-item-action>
          </v-list-item>
          <v-list-item dense>
            <v-list-item-content>
              <v-icon color="primary" @click="params.OrderRule.push({ Price: 0, Position: 0, Next: { Type: '', Position: 0, Price: 0 } })">mdi-plus-circle</v-icon>
            </v-list-item-content>
          </v-list-item>
        </template>
        <template v-else>
          <v-text-field style="margin-top:10px" required v-model.number="params.HedgingDiffVol" outlined label="持仓偏移量" type="number"></v-text-field>
        </template>

        <v-dialog v-model="settingDailogSub">
          <v-item-group style="background-color:#ffffff">
            <v-container>
              <v-row>
                <v-card-text>函数模型，不懂的请选择最后一个，切勿乱选，影响收益</v-card-text>
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

        <v-text-field v-if="IsAdmin" required v-model="params.Key" label="api key" type="text" outlined clearable></v-text-field>
        <v-text-field v-if="IsAdmin" required v-model="params.Pwd" label="密码" type="password" outlined clearable></v-text-field>
        <v-switch v-if="IsAdmin" v-model="params.Runner" class="ma-2" label="策略开关（保存后生效）"></v-switch>

        <v-btn color="primary" v-if="params.Hedging === 0" class="mr-4" @click="RunderSetting">
          <v-icon>mdi-refresh</v-icon>
          预览策略视图
        </v-btn>

        <div v-if="params.Hedging === 0" style="padding-bottom:20px;width:280px;height:300px;" ref="params"></div>

        <v-btn color="success" class="mr-4" @click="validate" v-if="IsAdmin">保存</v-btn>
        <v-btn color="error" class="mr-4" @click="deleteIt" v-if="IsAdmin">永久删除</v-btn>
      </v-form>
    </v-dialog>

    <v-alert v-if="loaded && loadeddata && params.Reports.length === 0" type="error">
      该账号，暂无报表数据
    </v-alert>

    <div class="section">
      <!-- <v-dialog ref="dialog" v-model="modal" color="primary" :return-value.sync="Dates" persistent>
        <template v-slot:activator="{ on, attrs }">
          <v-text-field v-model="Dates" label="日期选择" prepend-icon="mdi-calendar-range" readonly v-bind="attrs" v-on="on"></v-text-field>
        </template>
        <v-date-picker v-model="Dates" range scrollable :allowed-dates="allowedDates" :max="DateMax">
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="modal = false">取消</v-btn>
          <v-btn text color="primary" @click="Submit">确定</v-btn>
        </v-date-picker>
      </v-dialog> -->
      <div style="padding-top:10px" class="echarts" ref="MyAccount"></div>
      <div style="padding-top:40px" class="echarts" ref="MyAccountReport"></div>

      <div style="padding-top:40px" class="echarts" ref="MyAccountDetail"></div>
      <v-slider v-model="detailValue" thumb-label="always" :thumb-size="50" :min="detailMin" :max="detailMax" :step="0.5">
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
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { clone, DateFormat, sleep } from '../lib/utils';
import echarts from 'echarts';
import urijs from 'urijs';
import { debounce, throttle } from 'ts-debounce-throttle';
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
  Hedging: number; // 是否是对冲策略
  HedgingDiffVol: number;
}

interface SnapshotData {
  data: LogData[];
  FileName: string;
}

@Component({
  components: {},
})
export default class ImconfigPage extends Vue {
  ViewModeText = ['最近24小时策略形成的数据', '变更参数 10 分钟后至今，策略形成的数据', '该账号注册以来所有数据采样得出的视图', '自定义数据和采样精度，分析数据'];
  TipDialog = false;
  get IsUSD() {
    if (this.$AppStore.localState.IsUsdBenWei[this.report] === 0) return 0;
    return 1;
  }
  set IsUSD(val) {
    this.$set(this.$AppStore.localState.IsUsdBenWei, this.report, val);
  }
  loaded = false;
  loadeddata = false;
  settingDailog = false;
  settingDailogSub = false;
  ViewMode = 2;
  modal = false;
  DateMax = DateMax;
  Times = [DateMax, DateMax];
  Dates = [DateMax, DateMax];
  get BuildTime() {
    const Time = window.__Build_Time === '__Build_Time__' ? Date.now() : parseInt(window.__Build_Time, 10);
    return DateFormat(Time, 'yyyy-MM-dd hh:mm');
  }

  ShowReports: string[] = []; // 报表选择
  BtcNumEnd = 6; // 小数点位数精确至
  DataNum = 3000; // 每日数据采样数量

  BtcNumEnds = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  DataNums = [500, 1000, 3000, 6000, 12000, 24000];

  TipDialogData = {
    Prices: [] as Array<{ Title: string; Content: string }>,
  };
  @Watch('TipDialog')
  async OnTipDialogChange() {
    if (!this.TipDialog) return;
    await this.$nextTick();
    if (!this.serverparams) {
      this.TipDialog = false;
      this.$AppStore.Error('资源未加载完成');
      return;
    }
    const Prices = [
      { Title: '做多区间（持【多单】）', Content: '' },
      { Title: '部分套保（持一倍以下【空单】）', Content: '' },
      { Title: '对冲区间（持一倍【空单】）', Content: '' },
      { Title: '做空区间（持一倍以上【空单】）', Content: '' },
    ];
    this.serverparams.PricePosition.forEach((item) => {
      //
    });
    this.TipDialogData.Prices.splice(0, this.TipDialogData.Prices.length, ...Prices);
  }

  @Watch('ViewMode', { immediate: true })
  OnViewModeChange() {
    if (this.ViewMode === 0) {
      this.ShowReports = this.ReportsSelect.slice(this.ReportsSelect.length - Math.min(this.ReportsSelect.length, 2)); // 最近2天的数据
      this.BtcNumEnd = this.BtcNumEnds[this.BtcNumEnds.length - 1];
      this.DataNum = this.DataNums[this.DataNums.length - 1];
    } else if (this.ViewMode === 1) {
      // 获得最后变更参数的时间点
      // const LastChange = this.params.Time;
      this.ShowReports = this.ReportsSelect.slice(0);
      this.BtcNumEnd = 6;
      this.DataNum = this.DataNums[0];
    } else if (this.ViewMode === 2) {
      this.ShowReports = this.ReportsSelect.slice(0);
      this.BtcNumEnd = 6;
      this.DataNum = this.DataNums[0];
    } else {
      this.ShowReports = this.ReportsSelect.slice(this.ReportsSelect.length - Math.min(this.ReportsSelect.length, 5)); // 最近 5 天的数据
      this.BtcNumEnd = 6;
      this.DataNum = 3000;
    }
  }

  @Watch('BtcNumEnd')
  @Watch('IsUSD')
  @Watch('DataNum')
  @Watch('ShowReports', { deep: true })
  OnSomeChange = debounce(function(this: ImconfigPage) {
    console.log('OnSomeChange');
    if (this.loaded && this.loadeddata) this.Render();
  }, 1500);

  get ReportsSelect() {
    return this.params.Reports.map((item) => {
      return item.replace(/(.*?)\/(\d\d\d\d)\/(\d\d)\/(\d\d)\.json/, (all, r1, yyyy, MM, dd) => {
        // console.log(all, r1, yyyy, MM, dd);
        return `${yyyy}-${MM}-${dd}`;
      });
    });
  }

  DataFilter(data: SnapshotData[]) {
    const strs = this.ShowReports.map((item) => item.replace(/-/g, '/'));
    const Last24H = Date.now() - 86400000; // 24H
    let LastChange = this.params.Time + 10 * 60 * 1000;
    if (LastChange >= this.params.Time + 11 * 60 * 1000) LastChange = 0; // 数据太少。这项条件删除

    return data
      .map((item) => {
        const match = strs.filter((str) => item.FileName.match(str))[0];
        if (!match) {
          return {
            data: [],
            FileName: '',
          };
        }

        const s = Math.pow(10, this.BtcNumEnd);
        const revert: LogData[] = [];
        let lastP = 0;
        // 过滤资产不变更的数据
        const key = this.IsUSD ? 'UsdSum' : 'BtcSum';
        const datas = item.data.forEach((da) => {
          const p = Math.floor(da[key] * s) / s;
          if (p === lastP) return;
          if (this.ViewMode === 0 && da.Ts < Last24H) return; // 查看最近24H的数据。
          if (this.ViewMode === 1 && da.Ts < LastChange) return; // 查看最近一次修改参数后的数据
          lastP = p;
          const item = {
            Ts: da.Ts,
            p24h: da.p24h,
            Price: da.Price,
            BtcSum: p,
            UsdSum: p,
            quantity: da.quantity,
          };
          revert.push(item);
        });
        this.ArrayFilter(revert, this.DataNum);

        return {
          data: revert,
          FileName: item.FileName,
        };
      })
      .filter((item) => item.data.length);
  }

  // 采样数据
  ArrayFilter(arr: any[], num: number) {
    if (!arr.length) return;
    const diffOut = arr.length / num; // 每隔 这么多个，留下一个
    if (diffOut <= 1) return;
    let ii = 0;
    const map: any = {};
    arr.forEach((i, index) => {
      map[Math.floor(index * diffOut)] = true;
      // 无需修改的有效数据
      if (map[index]) {
        arr[ii++] = i;
        return;
      }
    });

    const last = arr[arr.length - 1];
    arr.splice(ii, arr.length - ii);
    arr[arr.length - 1] = last; // 一定把最后一条数据放进去，有头有尾
  }

  get report() {
    const key = this.$route.query.DataKey as string;
    if (!key) return 'e6e53eb75ebbe4eae637898fee27dacc';
    return key;
  }
  get IsAdmin() {
    if (this.$AppStore.localState.ApiInfo.DataKey === this.report) return true;
    if (this.$AppStore.localState.AdminUsers.filter((item) => item.ReportKey === this.report).length) return true;
    return false;
  }
  @Watch('settingDailog')
  async OnSettingDailogChange() {
    if (!this.settingDailog) return;
    await this.$nextTick();
    await sleep(1000);
    this.RunderSetting();
  }

  RuleTypes: RuleTypeEnum[] = ['L7', '7L', 'L', '7', 'LL', '77', ''];
  RunderSetting() {
    // 校验参数的合格性
    const OrderRule: OrderRule[] = [];
    this.params.OrderRule.sort((a, b) => a.Price - b.Price);

    let err = '';
    let max = Infinity;
    let lastPrice = 0;
    if (this.params.Hedging === 0) {
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
    }

    if (!err) {
      if (this.params.MaxStepVol <= 0) err = `下单上限错误`;
      if (this.params.OpenOrderMaxCount <= 0) err = `单边挂单数量错误`;
      if (this.params.GridDiff < 0.5) err = `挂单间隔不能小于0.5`;
      if (this.params.Hedging === 0 && OrderRule.length < 2) err = '价格至少设置两个';
    }
    if (err) return this.$AppStore.Error(err);
    if (!this.params.HedgingDiffVol) this.params.HedgingDiffVol = 0;

    if (this.params.Hedging === 0) {
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
    }
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
    Hedging: 1,
    OrderRule: [
      { Price: 4000, Position: -400, Next: { Type: 'L7', Position: 0, Price: 0 } },
      { Price: 20000, Position: -2000, Next: { Type: 'L7', Position: 0, Price: 0 } },
    ],
    OpenOrderMaxCount: 15, // 单边最多挂单数量
    Runner: false,
    Key: Vue.AppStore.localState.UserKey,
    BasePrice: 11700,
    BasePriceWeight: 1,
    GridDiff: 1, // 挂单间隔
    MaxStepVol: 1000,
    Reports: [],
    Time: 0,
    Pwd: '',
    ReportKey: '',
    BakSetting: [],
    PricePosition: [],
    HedgingDiffVol: 0,
  };

  serverparams: UserParams | null = null;
  OrderRuleModel = [];

  detailValue = 0;
  detailMin = Infinity;
  detailMax = 0;
  @Watch('detailValue')
  detailValueChange() {
    this.Runder3();
  }

  SnapshotData: SnapshotData[] = [];

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
    await this.GetData(this.params.Reports.length - 1);
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
        data: ['24H均价', 'BTC价格', '账户资产', '持仓'],
        selected: {
          '24H均价': false,
          BTC价格: false,
          账户资产: true,
          持仓: false,
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
        subtext: `BTC价格走势 与 账户资产、持仓 走势分析`,
        top: 4,
      },
      xAxis: [{ type: 'category', boundaryGap: false }],
      yAxis: [
        {
          type: 'value',
          position: 'left',
          name: 'BTC价格(USD)',
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
          name: '账户资产',
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
          name: '持仓(张)',
          axisLabel: {
            formatter: '{value}',
          },
          // min: -200,
          // max: 1000,
          splitLine: { show: false },
          // inverse: true,
        },
      ],
    });

    myChart2 = echarts.init(this.$refs.MyAccountReport as any);
    myChart2.setOption({
      backgroundColor: '#404a59',
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
        data: ['资产'],
      },
      grid: {
        left: '20px',
        right: '14px',
        bottom: '40px',
        containLabel: true,
      },
      title: {
        text: ``,
        subtext: `资产-变更趋势`,
        top: 4,
      },
      xAxis: {
        type: 'value',
        name: 'BTC 价格',
        nameGap: 4,
        nameTextStyle: {
          color: '#fff',
          fontSize: 14,
        },
        // max: 31,
        splitLine: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            color: '#eee',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: '账户权益',
        nameLocation: 'end',
        nameGap: 4,
        nameTextStyle: {
          color: '#fff',
          fontSize: 16,
        },
        axisLine: {
          lineStyle: {
            color: '#eee',
          },
        },
        splitLine: {
          show: false,
        },
      },
      visualMap: [
        {
          left: 'right',
          bottom: '5%',
          dimension: 2,
          min: 0,
          max: 50,
          itemHeight: 0,

          precision: 0.1,
          text: ['白色表示旧数据'],
          textGap: 30,
          textStyle: {
            color: '#fff',
          },
          inRange: {
            colorLightness: [1, 0.5],
            symbolSize: [2, 2],
            colorAlpha: [0.1, 1],
            color: '#04a4cc',
          },
          outOfRange: {
            color: ['rgba(255,255,255,.2)'],
          },
          controller: {
            inRange: {
              color: ['#04a4cc'],
            },
            outOfRange: {
              color: ['#04a4cc'],
            },
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
        top: '80px',
        containLabel: true,
      },
      title: {
        text: ``,
        subtext: ``,
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
          name: '账户权益',
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
    const btcsss: any = { name: '资产(BTC)', type: 'line', color: 'rgba(4, 164, 204, 1)', areaStyle: { color: 'rgba(4, 164, 204, 0.2)' }, key: 'BtcSum', y: 1 };
    const usdsss: any = { name: '资产(USD)', type: 'line', color: 'rgba(4, 164, 204, 1)', areaStyle: { color: 'rgba(4, 164, 204, 0.2)' }, key: 'UsdSum', y: 1 };
    console.log('IsUSD', this.IsUSD);
    const conf: any[] = [
      this.IsUSD ? usdsss : btcsss,
      { name: '24H均价', type: 'line', color: '#666666', key: 'p24h', y: 0 },
      { name: 'BTC价格', type: 'line', color: 'rgba(4, 100, 100, 0.5)', key: 'Price', y: 0 },
      { name: '持仓', type: 'line', color: 'rgba(255, 0, 150, 0.5)', areaStyle: { color: 'rgba(255, 0, 150, 0.2)' }, key: 'quantity', y: 2 },
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

    const all: LogData[] = [];
    const SnapshotData = this.DataFilter(this.SnapshotData);
    SnapshotData.forEach((item) => {
      item.data.forEach((data) => {
        all.push(data);
        conf.forEach((val) => {
          const value = (data as any)[val.key];
          // if (val.key === 'WantPos' && typeof value === 'object') return render[val.name].data.push(value[0]);
          render[val.name].data.push(value);
        });
        xxx.push(DateFormat(data.Ts, 'hh:mm:ss\r\nMM-dd'));
      });
    });

    const key = this.IsUSD ? 'UsdSum' : 'BtcSum';

    this.SnapshotData.forEach((item) => {
      item.data.forEach((data) => {
        const sum = data[key];
        // 计算K线
        const kline = KlineData[data.Price];
        if (!kline) {
          KlineData[data.Price] = {
            low: sum,
            high: sum,
            open: sum,
            close: sum,
            price: data.Price,
            details: [data],
          };
          arr.push(KlineData[data.Price]);
          return;
        }
        kline.low = Math.min(kline.low, sum);
        kline.high = Math.max(kline.high, sum);
        kline.close = sum;
        kline.details.push(data);

        this.detailMax = Math.max(this.detailMax, data.Price);
        this.detailMin = Math.min(this.detailMin, data.Price);
      });
    });

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
    // console.log(arr);

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

    all.sort((a, b) => a.Price - b.Price);
    const itemStyle = {
      opacity: 0.8,
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowColor: 'rgba(0, 0, 0, 0.5)',
    };
    const prices = all.map((i) => i.Price);
    const btcs = all.map((i) => i[key]);
    const tss = all.map((i) => i.Ts);
    myChart2.setOption({
      xAxis: {
        min: Math.min(...prices),
        max: Math.max(...prices),
      },
      yAxis: {
        min: Math.floor(Math.min(...btcs) * 10000) / 10000,
        max: Math.ceil(Math.max(...btcs) * 10000) / 10000,
      },
      visualMap: [
        {
          dimension: 2,
          min: Math.min(...tss),
          max: Math.max(...tss),
        },
      ],
      series: [
        {
          name: '',
          type: 'scatter',
          itemStyle,
          // itemStyle: {
          //   color: upColor,
          //   color0: downColor,
          //   borderColor: upBorderColor,
          //   borderColor0: downBorderColor,
          // },
          data: all.map((i) => [i.Price, i[key], i.Ts]),
        },
      ],
    });

    const lastFile = SnapshotData[SnapshotData.length - 1];
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
    const key = this.IsUSD ? 'UsdSum' : 'BtcSum';

    // 将数组内相邻的相同数据剔除
    let lastBtcSum = -1;
    const lastDetail = last.details.filter((item) => {
      if (item[key] === lastBtcSum) return false;
      lastBtcSum = item[key];
      return true;
    });
    if (lastDetail.length < 2) return end();
    const open = lastDetail[0][key];
    const close = lastDetail[lastDetail.length - 1][key];
    const p = Math.pow(10, this.BtcNumEnd);
    const diff = Math.floor((close - open) * p) / p;
    const title = `${last.price} USD 资产变更`;
    const per = diff / open;
    let subtext = `${last.price} USD 用户资产变更 ${diff > 0 ? '+ ' + diff : diff} (${Math.floor(per * 10000) / 100}%)`;
    if (diff > 0) {
      const diffTs = lastDetail[lastDetail.length - 1].Ts - lastDetail[0].Ts;
      const nextDiff = Math.ceil(per); // 下一倍
      // nextDiff / diff = nextDiffTs / diffTs;
      const nextDiffTs = (nextDiff / per) * diffTs;
      const timestr = DateFormat(lastDetail[0].Ts + nextDiffTs, 'yyyy年MM月dd日hh点');
      const nextBtc = Math.floor((1 + nextDiff) * open * 10000) / 10000;
      subtext += `\r\n以此预计在 ${timestr} 资产为 ${nextBtc}（${Math.floor(open * 10000) / 10000}的${nextDiff + 1}倍）`;
    }
    console.log(last);

    myChart3.setOption({
      legend: {
        data: ['资产'],
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
          data: lastDetail.map((item) => item[key]),
          color: 'rgba(4, 164, 204, 1)',
          areaStyle: { color: 'rgba(4, 164, 204, 0.2)' },
        } as any,
        // {
        //   name: '24H均价',
        //   type: 'line',
        //   data: lastDetail.map((item) => item.p24h),
        // },
      ],
    });
  }, 1000);

  async GetData(index: number, times = 1): Promise<any> {
    if (times > 5) return;
    let FileName = this.params.Reports[index];
    if (!FileName) return;
    const TodayStr = DateFormat(new Date(), 'yyyy/MM/dd');
    // 今日的数据，要获取最新的
    if (FileName.match(TodayStr)) FileName = `${FileName}?t=${Date.now()}`;
    const Data = await this.$AnalysisStore.GetData(`https://fmex-database.oss-cn-qingdao.aliyuncs.com` + FileName);
    if (!Data) {
      return this.GetData(index, ++times);
    }
    this.SnapshotData.unshift({
      FileName,
      data: Data,
    });
    // 获取下一个报表
    const thisIndex = --index;
    const next = this.params.Reports[thisIndex];
    if (next) return this.GetData(thisIndex);
    this.Render();
    this.loadeddata = true;
    return true;
  }

  async GetParams() {
    const Data = await this.$AnalysisStore.GetJson(`https://fmex-database.oss-cn-qingdao.aliyuncs.com/runner/report/${this.report}/config`, true);
    if (!Data) return this.$AppStore.Error('配置文件加载失败，请刷新重试');
    if (!('Hedging' in Data)) Data.Hedging = 0; // 旧数据设置
    if (!('HedgingDiffVol' in Data)) Data.HedgingDiffVol = 0; // 旧数据设置

    this.params = clone(Data);
    this.serverparams = Data;
    if (this.params.Hedging) this.$set(this.$AppStore.localState.IsUsdBenWei, this.params.ReportKey, 1); // U本位
    this.OnViewModeChange(); // 更新报表显示数据模型
    this.loaded = true;
    this.params.Key = this.$AppStore.localState.UserKey;
    if (this.IsAdmin) {
      const find = Vue.AppStore.localState.AdminUsers.filter((item) => item.ReportKey === this.report)[0];
      if (find) {
        this.params.Key = find.Key;
      }
    }
    if (this.params.Reports.length === 0) return;
    // this.Times[0] = this.Times[1] = this.params.Reports[this.params.Reports.length - 1];
    // 为空的时候，默认最后 5 条数据
    if (this.ShowReports.length === 0) {
      this.ShowReports = this.ReportsSelect.slice(this.ReportsSelect.length - Math.min(this.ReportsSelect.length, 5));
    }

    this.GetData(this.params.Reports.length - 1);
    this.RenderInit();
  }

  async validate() {
    const check = this.RunderSetting();
    if (check !== 'success') return;
    this.params.ReportKey = this.report;
    // this.$AppStore.localState.UserKey = this.params.Key;
    const res = await FunApi.post('/grid/set-params', this.params).then((res) => res.data as CodeObj<any>);
    console.log(res);
    this.settingDailog = false;
    if (res.Error()) return this.$AppStore.Error(res.Msg);
    this.$AppStore.Error('保存成功');
  }

  async deleteIt() {
    const bool = confirm('永久删除后，无法找回数据，是否删除？');
    if (!bool) return;
    this.params.ReportKey = this.report;
    const res = await FunApi.post('/grid/del-params', this.params).then((res) => res.data as CodeObj<any>);
    console.log(res);
    this.settingDailog = false;
    if (res.Error()) return this.$AppStore.Error(res.Msg);
    this.$AppStore.localState.UserKey = '';
    this.$AppStore.localState.ApiInfo.DataKey = '';
    this.$AppStore.Error('删除成功');
    // this.$router.push();
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
