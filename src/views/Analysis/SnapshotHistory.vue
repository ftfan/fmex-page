<template>
  <div>
    <v-select style="margin-top:10px" dense :items="$AnalysisStore.localState.PlatformCurrency" label="查看币种" v-model="$AnalysisStore.localState.Currency" outlined></v-select>
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

    <v-dialog v-model="dialog">
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="primary" style="top:80px" fixed top right small fab v-bind="attrs" v-on="on">
          <v-icon>mdi-view-dashboard-outline</v-icon>
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="headline grey lighten-2">
          设置统计范围
          <v-icon @click="dialog = false" style="position: absolute;right: 10px;top: 10px;">mdi-window-close</v-icon>
        </v-card-title>

        <v-card-text>
          分析:
          <br />
          <v-chip class="ma-2" color="primary" small outlined>
            <i class="txt-i">0</i> ~ <i class="txt-i">{{ $AnalysisStore.localState.BtcRange[0] }}</i> 个 {{ UpCoinName }}
          </v-chip>
          <br />
          <v-chip class="ma-2" color="primary" small outlined>
            <i class="txt-i">{{ $AnalysisStore.localState.BtcRange[0] }}</i> ~ <i class="txt-i">{{ $AnalysisStore.localState.BtcRange[1] }}</i> 个 {{ UpCoinName }}
          </v-chip>
          <br />
          <v-chip class="ma-2" color="primary" small outlined>
            <i class="txt-i">{{ $AnalysisStore.localState.BtcRange[1] }}</i> ~ <i class="txt-i">{{ 50 }}</i> 个 {{ UpCoinName }}
          </v-chip>
          <br />
          的账户数量/资产统计
          <v-range-slider style="margin-top:60px;" v-model="$AnalysisStore.localState.BtcRange" thumb-label="always" :step="0.1" min="0" max="50">
            <template v-slot:prepend>
              <v-icon color="primary" @click="decrement">
                mdi-minus
              </v-icon>
            </template>

            <template v-slot:append>
              <v-icon color="primary" @click="increment">
                mdi-plus
              </v-icon>
            </template>
          </v-range-slider>

          <v-chip class="ma-2" @click="TryClick(val)" v-for="val in Ranges" :key="val" :color="$AnalysisStore.localState.BtcRange.indexOf(val) > -1 ? 'primary' : 'success'" small>{{ val }}</v-chip>
        </v-card-text>
      </v-card>
    </v-dialog>

    <div class="data-analysis">
      <div style="padding-top:10px" class="echarts" ref="AnalysisPage"></div>
      <v-divider></v-divider>
      <div style="padding-top:40px" class="echarts" ref="AnalysisNum"></div>
      <v-divider></v-divider>
      <div style="padding-top:40px" class="echarts" ref="AnalysisPageTop5"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import echarts from 'echarts';
import { DateFormat } from '../../lib/utils';
import BigNumber from 'bignumber.js';
import { debounce, throttle } from 'ts-debounce-throttle';
const DateMax = DateFormat(Date.now() - 86400000, 'yyyy-MM-dd'); // 只有昨日的数据。
const DateMin = DateFormat(new Date(2020, 7 - 1, 8), 'yyyy-MM-dd');
const GetTimes = () => {
  const now = new Date();
  const begin = new Date();
  begin.setDate(now.getDate() - 100);
  const MinTime = new Date(DateMin).getTime();
  if (begin.getTime() < MinTime) begin.setTime(MinTime); // 开始时间不得大于目前已有的基础时间（有数据的时间）
  return [DateFormat(begin, 'yyyy-MM-dd'), DateMax];
};

let myChart: echarts.ECharts | null = null;
let myChart2: echarts.ECharts | null = null;
let myChart3: echarts.ECharts | null = null;

@Component({
  components: {},
})
export default class AnalysisPage extends Vue {
  modal = false;
  DateMin = DateMin;
  DateMax = DateMax;

  Ranges = [1, 2, 3, 4, 5, 8, 10, 15, 20, 25, 30, 40];

  value: number[] = [];
  labelText: string[] = [];

  get UpCoinName() {
    return this.$AnalysisStore.localState.Currency.toLocaleUpperCase();
  }

  loading = true;
  dialog = false;
  // OnLoadData = ['用户资产数据'];
  SnapshotData: any[] = [];

  get BaseUrl() {
    return `https://fmex-database.oss-cn-qingdao.aliyuncs.com/fmex/api/broker/v3/zkp-assets/account/snapshot/${this.UpCoinName}/`;
  }

  // 资产区间
  BtcNumber = [1, 10, 50];

  Top5 = [0, 1, 2, 3, 4];

  // 默认选中最近100天
  Times = GetTimes();
  Dates = GetTimes();
  queue = 1; // 因为需要获取多个请求，这里设置个id。id不一样，后面就不请求了

  @Watch('Times', { immediate: true, deep: true })
  OnTimes1Change() {
    this.$AnalysisStore.GetPlatformCurrency(this.Times[1]);
  }

  LastChangeIndex = 0; // $AnalysisStore.localState.BtcRange 最近在使用的索引
  old = [...Vue.AnalysisStore.localState.BtcRange];

  LabelOutput(item: { index: number; value: string }) {
    if (item.index === 0) return item.value; // 第一个显示
    if (item.index === this.SnapshotData.length - 1) return item.value; // 最后一个也显示
    return '';
  }

  TryClick(val: number) {
    const range = this.$AnalysisStore.localState.BtcRange;
    if (range[1] < range[0]) {
      const temp = range[1];
      this.$set(range, 1, range[0]);
      this.$set(range, 0, temp);
    }
    const diff1 = val - range[0];
    const diff2 = -val + range[1];

    if (diff1 > diff2) {
      this.$set(range, 1, val);
    } else {
      this.$set(range, 0, val);
    }
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
    this.OnUpCoinNameChange();
  }

  @Watch('$AnalysisStore.localState.BtcRange', { deep: true, immediate: true })
  OnBtcRangeChange(val: number[]) {
    if (val && val[0] === this.old[0]) {
      this.LastChangeIndex = 1;
    } else {
      this.LastChangeIndex = 0;
    }
    this.old = [...this.$AnalysisStore.localState.BtcRange];
    this.OnBtcRangeChanged();
  }
  OnBtcRangeChanged = debounce(function(this: AnalysisPage, val: number[]) {
    this.BtcNumber[0] = this.$AnalysisStore.localState.BtcRange[0];
    this.BtcNumber[1] = this.$AnalysisStore.localState.BtcRange[1];
    this.Render();
  }, 300);

  @Watch('UpCoinName')
  async OnUpCoinNameChange() {
    this.SnapshotData = [];
    this.GetData(++this.queue, this.Times[0]);
    this.Render();
  }

  decrement() {
    const val = new BigNumber(this.$AnalysisStore.localState.BtcRange[this.LastChangeIndex]).minus(0.1);
    this.$set(this.$AnalysisStore.localState.BtcRange, this.LastChangeIndex, val.toNumber());
  }
  increment() {
    const val = new BigNumber(this.$AnalysisStore.localState.BtcRange[this.LastChangeIndex]).plus(0.1);
    this.$set(this.$AnalysisStore.localState.BtcRange, this.LastChangeIndex, val.toNumber());
  }

  mounted() {
    this.mountedd();
  }

  async mountedd() {
    this.RenderInit();
    this.GetData(++this.queue, this.Times[0]);
  }

  RenderInit() {
    this.labelText = [];
    this.SnapshotData = [];
    myChart = echarts.init(this.$refs.AnalysisPage as any);
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
        data: [...this.BtcNumber.map((num, i) => `${this.BtcNumber[i - 1] || 0}~${num}`), `${this.BtcNumber[this.BtcNumber.length - 1]}+`, '总资产'],
      },
      grid: {
        left: '20px',
        right: '14px',
        bottom: '3%',
        // top: '40px',
        containLabel: true,
      },
      title: {
        text: ``,
        subtext: `账户资产趋势`,
        top: 4,
      },
      xAxis: [{ type: 'category', boundaryGap: false }],
      yAxis: [
        {
          name: `单位: ${this.UpCoinName}`,
          type: 'value',
          // min: 'dataMin',
          // max: 'dataMax',
        },
      ],
    });

    myChart2 = echarts.init(this.$refs.AnalysisPageTop5 as any);
    myChart2.setOption({
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
        data: this.Top5.map((val) => val + 1 + ''),
        selected: {
          1: true,
          2: true,
          3: true,
          4: true,
          5: true,
        },
      },
      grid: {
        left: '20px',
        right: '14px',
        bottom: '3%',
        containLabel: true,
      },
      title: {
        text: ``,
        subtext: `TOP${this.Top5.length} 的资产变化`,
        top: 4,
      },
      xAxis: [{ type: 'category', boundaryGap: false }],
      yAxis: [
        {
          name: `单位: ${this.UpCoinName}`,
          type: 'value',
          min: (value) => {
            return Math.floor(value.min);
          },
          max: (value) => {
            return Math.ceil(value.max);
          },
        },
      ],
    });

    myChart3 = echarts.init(this.$refs.AnalysisNum as any);
    myChart3.setOption({
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
        data: [...this.BtcNumber.map((num, i) => `${this.BtcNumber[i - 1] || 0}~${num}`), `${this.BtcNumber[this.BtcNumber.length - 1]}+`, '合计'],
      },
      grid: {
        left: '20px',
        right: '14px',
        bottom: '3%',
        // top: '40px',
        containLabel: true,
      },
      title: {
        text: ``,
        subtext: `账户数量趋势`,
        top: 4,
      },
      xAxis: [{ type: 'category', boundaryGap: false }],
      yAxis: [
        {
          type: 'value',
        },
      ],
    });
  }

  Render() {
    if (!myChart) return;
    if (!myChart2) return;
    if (!myChart3) return;
    const color = (i: number) => {
      return 0.4 + (i / this.BtcNumber.length) * 0.6;
    };

    this.value = this.SnapshotData.map((it) => it.Data.length);
    const labelText = this.SnapshotData.map((it) => it.FileName);
    // this.labelText = labelText.map((it) =>
    //   it
    //     .split('\r\n')
    //     .reverse()
    //     .join('-')
    // );
    // 1111111111111111
    const NumArrData = this.BtcNumber.map((num, i) => {
      return [
        {
          name: `${this.BtcNumber[i - 1] || 0}~${num}`,
          type: 'line',
          stack: `${this.UpCoinName}`,
          data: [] as number[],
          color: `rgba(4, 164, 204, ${color(i)})`,
          areaStyle: {
            color: `rgba(4, 164, 204, ${color(i)})`,
          },
        },
        {
          name: `${this.BtcNumber[i - 1] || 0}~${num}`,
          type: 'line',
          stack: `${this.UpCoinName}`,
          data: [] as number[],
          color: `rgba(4, 164, 204, ${color(i)})`,
          areaStyle: {
            color: `rgba(4, 164, 204, ${color(i)})`,
          },
        },
      ];
    });
    const other = [
      {
        name: `${this.BtcNumber[this.BtcNumber.length - 1]}+`,
        type: 'line',
        stack: `${this.UpCoinName}`,
        data: [] as number[],
        color: `rgba(4, 164, 204, 1)`,
        areaStyle: {
          color: `rgba(4, 164, 204, 1)`,
        },
      },
      {
        name: `${this.BtcNumber[this.BtcNumber.length - 1]}+`,
        type: 'line',
        stack: `${this.UpCoinName}`,
        data: [] as number[],
        color: `rgba(4, 164, 204, 1)`,
        areaStyle: {
          color: `rgba(4, 164, 204, 1)`,
        },
      },
    ];
    const sum = [
      {
        name: `总资产`,
        type: 'line',
        data: [] as number[],
        color: `rgba(4, 164, 204, 1)`,
      },
      {
        name: `合计`,
        type: 'line',
        data: [] as number[],
        color: `rgba(4, 164, 204, 1)`,
      },
    ];

    // 2222222222222222222
    const NumArrData2 = this.Top5.map((num, i) => {
      return {
        name: `${num + 1}`,
        type: 'line',
        data: [] as number[],
        color: `rgba(4, 164, 204, ${color(i)})`,
        areaStyle: {
          color: `rgba(4, 164, 204, ${color(i)})`,
        },
      };
    });

    // 计算
    this.SnapshotData.forEach((item: any) => {
      // 2222222222222
      this.Top5.forEach((num, index) => {
        const user = item.Data[item.Data.length - num - 1] || { amount: 0 }; // 倒序的
        NumArrData2[index].data.push(user.amount);
      });

      // 111111111111 因为amount是从小到大排序的
      let NumIndex = 0;
      const tempArrCount = NumArrData.map(() => 0);
      const tempArr = NumArrData.map(() => new BigNumber(0));
      tempArr.push(new BigNumber(0)); // 其他，多余 10 BTC的账户
      tempArrCount.push(0);
      item.Data.forEach((val: any) => {
        const PutItem = () => {
          const NumRange = this.BtcNumber[NumIndex];
          const max = NumIndex in this.BtcNumber ? NumRange : Infinity; // 如果找不到，那就去无限大。
          const AddVal = (index: number) => {
            tempArr[index] = tempArr[index].plus(val.amount);
            tempArrCount[index]++;
          };

          if (val.amount < max) return AddVal(NumIndex);
          NumIndex++;
          PutItem();
        };
        PutItem();
      });
      NumArrData.forEach((nad, index) => {
        nad[0].data.push(tempArr[index].toNumber());
        nad[1].data.push(tempArrCount[index]);
      });
      other[0].data.push(tempArr[tempArr.length - 1].toNumber());
      other[1].data.push(tempArrCount[tempArrCount.length - 1]);
      sum[0].data.push(tempArr.reduce((a, b) => a.plus(b), new BigNumber(0)).toNumber());
      sum[1].data.push(tempArrCount.reduce((a, b) => a + b, 0));
    });
    myChart.setOption({
      legend: {
        data: [...this.BtcNumber.map((num, i) => `${this.BtcNumber[i - 1] || 0}~${num}`), `${this.BtcNumber[this.BtcNumber.length - 1]}+`, '总资产'],
      },
      xAxis: {
        data: labelText,
      },
      yAxis: [
        {
          name: `单位: ${this.UpCoinName}`,
        },
      ],
      series: [...NumArrData.map((item) => item[0]), other[0], sum[0]],
    });

    myChart3.setOption({
      legend: {
        data: [...this.BtcNumber.map((num, i) => `${this.BtcNumber[i - 1] || 0}~${num}`), `${this.BtcNumber[this.BtcNumber.length - 1]}+`, '合计'],
      },
      xAxis: {
        data: labelText,
      },
      yAxis: [
        {
          name: `单位: ${this.UpCoinName}`,
        },
      ],
      series: [...NumArrData.map((item) => item[1]), other[1], sum[1]],
    });

    myChart2.setOption({
      xAxis: {
        data: labelText,
      },
      series: [...NumArrData2],
    });
  }

  async GetData(queue: number, time: string, times = 1): Promise<any> {
    if (queue !== this.queue) return Promise.resolve(false); // 这是一个已经丢弃掉的请求队列了。

    const NextDay = (Data: any) => {
      // 用户资产是备份前一天的。所以时间上是错开了一天。这里纠正回去
      const ShowTime = new Date(time);
      this.SnapshotData.push({ FileName: DateFormat(ShowTime, 'MM-dd\r\nyyyy'), Data });
      if (next.getTime() <= new Date(this.Times[1]).getTime()) {
        return this.GetData(queue, FileName.replace(/\//g, '-'));
      }
      this.loading = false;
      this.Render();
      return true;
    };
    const timeDate = new Date(time);
    // 因为数据存储时，按照今天存储昨天的
    const next = new Date(timeDate.getTime() + 86400000);
    const FileName = DateFormat(next, 'yyyy/MM/dd');
    if (times > 3) return NextDay([]); // 重试3次没数据，当做没数据处理
    if (this.UpCoinName === 'USDT' && next.getTime() < new Date('2020-08-30').getTime()) return NextDay([]); // usdt 之前没数据。不用浪费请求
    const Data = await this.$AnalysisStore.GetJson(this.BaseUrl + FileName);
    if (queue !== this.queue) return Promise.resolve(false); // 这是一个已经丢弃掉的请求队列了。
    if (!Data) {
      return this.GetData(queue, time, ++times);
    }
    Data.forEach((item: any) => {
      item.amount = parseFloat(item.amount);
    });
    Data.sort((a: any, b: any) => a.amount - b.amount);

    return NextDay(Data);
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
