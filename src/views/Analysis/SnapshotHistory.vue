<template>
  <div>
    <div class="data-analysis">
      <div ref="AnalysisPage"></div>
      <div ref="AnalysisPageTop5"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import echarts from 'echarts';
import { DateFormat } from '../../lib/utils';
import BigNumber from 'bignumber.js';

const BaseTime = new Date(2020, 7 - 1, 11).getTime();

let myChart: echarts.ECharts | null = null;
let myChart2: echarts.ECharts | null = null;

@Component({
  components: {},
})
export default class AnalysisPage extends Vue {
  loading = true;
  OnLoadData = ['用户资产数据'];
  SnapshotData: any[] = [];

  BaseUrl = 'https://fmex-database.oss-cn-qingdao.aliyuncs.com/fmex/api/broker/v3/zkp-assets/account/snapshot/BTC/';

  // 资产区间
  BtcNumber = [1, 5, 10, 50];

  Top5 = [0, 1, 2, 3, 4];

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
        data: [...this.BtcNumber.map((num, i) => `${this.BtcNumber[i - 1] || 0}~${num}`), `${this.BtcNumber[this.BtcNumber.length - 1]}+`],
      },
      grid: {
        left: '20px',
        right: '14px',
        bottom: '3%',
        containLabel: true,
      },
      title: {
        text: ``,
        subtext: `账户资产趋势 ${DateFormat(this.Times[0], 'yyyy-MM-dd')} ~ ${DateFormat(this.Times[1], 'yyyy-MM-dd')}`,
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
    const data = this.SnapshotData.map((item: any, timeIndex) => {
      // 因为amount是从小到大排序的
      let NumIndex = 0;
      const tempArr = NumArrData.map((nad) => new BigNumber(0));
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
    });
    myChart.setOption({
      xAxis: {
        data: this.SnapshotData.map((it) => it.FileName),
      },
      series: [...NumArrData, other],
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
        data: this.SnapshotData.map((it) => it.FileName),
      },
      series: [...NumArrData2],
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
      item.amount = parseFloat(item.amount);
    });
    Data.sort((a: any, b: any) => a.amount - b.amount);
    this.SnapshotData.push({ FileName: DateFormat(time, 'MM-dd\r\nyyyy'), Data });
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
