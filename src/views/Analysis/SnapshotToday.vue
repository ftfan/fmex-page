<template>
  <div>
    <v-dialog ref="dialog" v-model="modal" color="primary" :return-value.sync="date" persistent>
      <template v-slot:activator="{ on, attrs }">
        <v-text-field v-model="date" label="日期选择：部分日期暂无数据，联系邮箱：support@ft100.fun" prepend-icon="mdi-calendar-range" readonly v-bind="attrs" v-on="on"></v-text-field>
      </template>
      <v-date-picker v-model="date" scrollable :allowed-dates="allowedDates" :min="DateMin" :max="DateMax">
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="modal = false">取消</v-btn>
        <v-btn text color="primary" @click="$refs.dialog.save(date)">确定</v-btn>
      </v-date-picker>
    </v-dialog>
    <div class="data-analysis">
      <div id="AnalysisSnapshotBarTop50"></div>
      <div id="AnalysisSnapshotBarTop50End"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { EchartsBar } from '@/lib/echarts-render';
import { SnapshotItem, Snapshot } from '../../types/fmex';
import { DateFormat } from '../../lib/utils';
import axios from 'axios';

const DateMax = DateFormat(Date.now() - 86400000, 'yyyy-MM-dd'); // 只有昨日的数据。
const DateMin = DateFormat(new Date(2020, 7 - 1, 10), 'yyyy-MM-dd');

@Component({
  components: {},
})
export default class AnalysisPage extends Vue {
  modal = false;
  date = DateMax;
  DateMin = DateMin;
  DateMax = DateMax;

  loading = true;
  OnLoadData = ['用户资产数据'];
  SnapshotData: SnapshotItem[] = [];
  BaseUrl = 'https://fmex-database.oss-cn-qingdao.aliyuncs.com/fmex/api/broker/v3/zkp-assets/account/snapshot/BTC/';

  SaveDate() {
    //
  }

  @Watch('date')
  async OnDateChange() {
    this.SnapshotData = [];
    await this.GetData();
    this.Render();
  }

  allowedDates(val: string) {
    return ['2020-07-11'].indexOf(val) === -1;
  }

  async mounted() {
    await this.GetData();
    this.Render();
  }

  Render() {
    const Top50 = this.SnapshotData.slice(0, 50);
    EchartsBar(document.getElementById('AnalysisSnapshotBarTop50') as any, {
      color: ['#04a4cc'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          // 坐标轴指示器，坐标轴触发有效
          type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
        },
      },
      title: {
        subtext: 'FMex 账户资产 TOP:50' + `【${this.date}】`,
      },
      xAxis: {
        type: 'category',
        data: Top50.map((item, i) => i + 1),
        name: '名次',
      },
      yAxis: {
        type: 'value',
        name: '单位：BTC',
      },
      series: [
        {
          data: Top50.map((item) => item.amount),
          type: 'bar',
        },
      ],
    });

    const Top50End = this.SnapshotData.slice(50);
    EchartsBar(document.getElementById('AnalysisSnapshotBarTop50End') as any, {
      color: ['#04a4cc'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          // 坐标轴指示器，坐标轴触发有效
          type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
        },
      },
      title: {
        subtext: `FMex 账户资产排名 50~${this.SnapshotData.length}` + `【${this.date}】`,
      },
      xAxis: {
        type: 'category',
        data: Top50End.map((item, i) => i + 51),
        name: '名次',
      },
      yAxis: {
        type: 'value',
        name: '单位：BTC',
      },
      series: [
        {
          data: Top50End.map((item) => item.amount),
          type: 'bar',
        },
      ],
    });
  }

  async GetData(times = 0): Promise<any> {
    const FileName = this.date.replace(/-/g, '/');
    const Data = await this.$AnalysisStore.GetJson(this.BaseUrl + FileName);
    if (!Data) {
      return this.GetData(++times);
    }
    Data.forEach((item: any) => {
      item.amount = parseFloat(item.amount);
    });
    Data.sort((a: any, b: any) => b.amount - a.amount);
    this.SnapshotData = Data;
  }

  async GetBtcSnapshot(id = ''): Promise<any> {
    const idStr = id ? `&id=${id}` : '';
    if (id) this.OnLoadData.push(`用户资产数据 【${id}】`);

    const End = (data: Snapshot) => {
      if (id) this.$set(this.$AnalysisStore.sessionState.snapshot, id, data); // 有id的请求才缓存
      data.content.forEach((item) => {
        item.amount = parseFloat(item.amount as any);
      });
      this.SnapshotData.push(...data.content);
      if (data.has_next && data.next_page_id) return this.GetBtcSnapshot(data.next_page_id); // 获取下一页
      this.OnLoadData.push(`用户资产数据 全部加载完成`);
      this.SnapshotData.sort((a, b) => b.amount - a.amount);
      this.loading = false;
    };

    if (this.$AnalysisStore.sessionState.snapshot[id]) return End(this.$AnalysisStore.sessionState.snapshot[id]); // 使用缓存
    const res = await axios
      .get(`https://fmex.com/api/broker/v3/zkp-assets/account/snapshot?currencyName=BTC${idStr}`)
      .then((res) => res.data)
      .catch(() => null);
    console.log(res);
    if (!res || res.status !== 'ok') {
      this.OnLoadData[this.OnLoadData.length - 1] = `${this.OnLoadData[this.OnLoadData.length - 1]} 加载失败`;
      return this.GetBtcSnapshot(id); // 获取下一页
    }
    return End(res.data);
  }
}
</script>

<style lang="scss" scoped>
.data-analysis {
  div {
    width: 100%;
    height: 300px;
  }
}
</style>
