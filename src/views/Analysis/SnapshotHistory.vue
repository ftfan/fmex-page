<template>
  <div>
    <div class="data-analysis">
      <div ref="AnalysisPage"></div>
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

@Component({
  components: {},
})
export default class AnalysisPage extends Vue {
  loading = true;
  OnLoadData = ['用户资产数据'];
  SnapshotData: any[] = [];

  BaseUrl = 'https://fmex-database.oss-cn-qingdao.aliyuncs.com/fmex/api/broker/v3/zkp-assets/account/snapshot/BTC/';

  // 资产区间
  BtcNumber = [0.01, 0.1, 1, 10];

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
        data: [...this.BtcNumber.map((num) => `<=${num}`), '>10'],
      },
      grid: {
        left: '30px',
        right: '30px',
        bottom: '3%',
        containLabel: true,
      },
      title: {
        text: `账户资产趋势`,
        subtext: `${DateFormat(this.Times[0], 'yyyy-MM-dd')} ~ ${DateFormat(this.Times[1], 'yyyy-MM-dd')}`,
      },
      xAxis: [{ type: 'category', boundaryGap: false }],
      yAxis: [
        {
          type: 'value',
          // min: 'dataMin',
          // max: 'dataMax',
        },
      ],
    });
  }

  Render() {
    if (!myChart) return;
    const NumArrData = this.BtcNumber.map((num) => {
      return {
        name: `<=${num}`,
        type: 'line',
        stack: `BTC`,
        data: [] as number[],
        areaStyle: {},
      };
    });
    const other = {
      name: `>10`,
      type: 'line',
      stack: `BTC`,
      data: [] as number[],
      areaStyle: {},
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
    this.SnapshotData.push({ FileName, Data });
    this.Render();
    const next = new Date();
    next.setDate(time.getDate() + 1);
    console.log(DateFormat(time, 'yyyy-MM-dd'), DateFormat(next, 'yyyy-MM-dd'), DateFormat(this.Times[1], 'yyyy-MM-dd'), next.getTime() < this.Times[1].getTime());
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
