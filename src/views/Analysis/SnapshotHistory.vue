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
    <v-card class="mx-auto text-center" color="primary" dark max-width="600">
      <v-card-text>
        <v-sheet color="rgba(4, 164, 204, .12)">
          <v-sparkline :value="value" :line-width="2" color="rgba(255, 255, 255, .7)" height="80" padding="10">
            <template v-slot:label="item">{{ item.value }}</template>
            <!-- <template v-slot:label="item">{{ labelText[item.index] }}</template> -->
          </v-sparkline>
        </v-sheet>
        <v-divider></v-divider>
        <!-- <v-subheader>部分日期暂无数据，若有提供，联系邮箱：support@ft100.fun （感谢！）</v-subheader> -->
      </v-card-text>

      <v-card-text>
        <div class="font-weight-thin">账户数量走势</div>
      </v-card-text>
    </v-card>
    <div class="data-analysis">
      <div ref="AnalysisPage"></div>
      <v-divider></v-divider>
      <div ref="AnalysisPageTop5"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import echarts from 'echarts';
import { DateFormat } from '../../lib/utils';
import BigNumber from 'bignumber.js';

const DateMax = DateFormat(Date.now() - 86400000, 'yyyy-MM-dd'); // 只有昨日的数据。
const DateMin = DateFormat(new Date(2020, 7 - 1, 11), 'yyyy-MM-dd');
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

@Component({
  components: {},
})
export default class AnalysisPage extends Vue {
  modal = false;
  DateMin = DateMin;
  DateMax = DateMax;

  value: number[] = [];
  labelText: string[] = [];

  loading = true;
  // OnLoadData = ['用户资产数据'];
  SnapshotData: any[] = [];

  BaseUrl = 'https://fmex-database.oss-cn-qingdao.aliyuncs.com/fmex/api/broker/v3/zkp-assets/account/snapshot/BTC/';

  // 资产区间
  BtcNumber = [1, 10, 50];

  Top5 = [0, 1, 2, 3, 4];

  // 默认选中最近100天
  Times = GetTimes();
  Dates = GetTimes();

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

  mounted() {
    this.mountedd();
  }

  async mountedd() {
    this.GetData(this.Times[0]);
    this.RenderInit();
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
        containLabel: true,
      },
      title: {
        text: ``,
        subtext: `账户资产趋势 ${this.Times[0]} ~ ${this.Times[1]}`,
        top: 4,
      },
      xAxis: [{ type: 'category', boundaryGap: false }],
      yAxis: [
        {
          name: '单位: BTC',
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
          3: false,
          4: false,
          5: false,
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
          name: '单位: BTC',
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
  }

  Render() {
    if (!myChart) return;
    if (!myChart2) return;
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
      return {
        name: `${this.BtcNumber[i - 1] || 0}~${num}`,
        type: 'line',
        stack: `BTC`,
        data: [] as number[],
        color: `rgba(4, 164, 204, ${color(i)})`,
        areaStyle: {
          color: `rgba(4, 164, 204, ${color(i)})`,
        },
      };
    });
    const other = {
      name: `${this.BtcNumber[this.BtcNumber.length - 1]}+`,
      type: 'line',
      stack: `BTC`,
      data: [] as number[],
      color: `rgba(4, 164, 204, 1)`,
      areaStyle: {
        color: `rgba(4, 164, 204, 1)`,
      },
    };
    const sum = {
      name: `总资产`,
      type: 'line',
      data: [] as number[],
      color: `rgba(4, 164, 204, 1)`,
    };
    this.SnapshotData.forEach((item: any) => {
      // 因为amount是从小到大排序的
      let NumIndex = 0;
      const tempArr = NumArrData.map(() => new BigNumber(0));
      tempArr.push(new BigNumber(0)); // 其他，多余 10 BTC的账户
      item.Data.forEach((val: any) => {
        const NumRange = this.BtcNumber[NumIndex];
        const max = NumRange || Infinity; // 如果找不到，那就去无限大。
        const AddVal = (index: number) => {
          tempArr[index] = tempArr[index].plus(val.amount);
        };
        if (val.amount <= max) return AddVal(NumIndex);
        NumIndex++;
        AddVal(NumIndex);
      });
      NumArrData.forEach((nad, index) => {
        nad.data.push(tempArr[index].toNumber());
      });
      other.data.push(tempArr[tempArr.length - 1].toNumber());
      sum.data.push(tempArr.reduce((a, b) => a.plus(b), new BigNumber(0)).toNumber());
    });
    myChart.setOption({
      xAxis: {
        data: labelText,
      },
      series: [...NumArrData, other, sum],
    });

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
    this.SnapshotData.map((item: any) => {
      this.Top5.forEach((num, index) => {
        const user = item.Data[item.Data.length - num - 1]; // 倒序的
        NumArrData2[index].data.push(user.amount);
      });
    });
    myChart2.setOption({
      xAxis: {
        data: labelText,
      },
      series: [...NumArrData2],
    });
  }

  async GetData(time: string, times = 1): Promise<any> {
    if (times > 5) return;
    const timeDate = new Date(time);
    // 因为数据存储时，按照今天存储昨天的
    const next = new Date(timeDate.getTime() + 86400000);
    const FileName = DateFormat(next, 'yyyy/MM/dd');
    // this.OnLoadData.push(`加载 ${FileName} ${times > 1 ? times : ''}`);
    const Data = await this.$AnalysisStore.GetJson(this.BaseUrl + FileName);
    if (!Data) {
      return this.GetData(time, ++times);
    }
    Data.forEach((item: any) => {
      item.amount = parseFloat(item.amount);
    });
    Data.sort((a: any, b: any) => a.amount - b.amount);

    // 用户资产是备份前一天的。所以时间上是错开了一天。这里纠正回去
    const ShowTime = new Date(time);
    this.SnapshotData.push({ FileName: DateFormat(ShowTime, 'MM-dd\r\nyyyy'), Data });
    if (next.getTime() <= new Date(this.Times[1]).getTime()) {
      return this.GetData(FileName.replace(/\//g, '-'));
    }
    this.loading = false;
    this.Render();
    return true;
  }
}
</script>

<style lang="scss" scoped>
.data-analysis {
  div {
    width: 100%;
    height: 500px;
    padding-top: 40px;
  }
}
</style>
