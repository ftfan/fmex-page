<template>
  <div>
    <v-dialog ref="dialog" v-model="modal" color="primary" :return-value.sync="date" persistent>
      <template v-slot:activator="{ on, attrs }">
        <v-text-field v-model="date" label="日期选择" prepend-icon="mdi-calendar-range" readonly v-bind="attrs" v-on="on"></v-text-field>
      </template>
      <v-date-picker v-model="date" scrollable :allowed-dates="allowedDates" :min="DateMin" :max="DateMax">
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="modal = false">取消</v-btn>
        <v-btn text color="primary" @click="SaveDate">确定</v-btn>
      </v-date-picker>
    </v-dialog>

    <template v-if="!loading && TotalInfo">
      <v-badge :content="PreInfo('Count')" color="primary" :offset-y="14" :offset-x="20">
        <v-chip class="ma-2" color="primary" small outlined> 共 {{ TotalInfo.Last.Count }} 个账户 </v-chip>
      </v-badge>
      <br />
      <v-badge :content="PreInfo('bxjj')" color="primary" :offset-y="14" :offset-x="20">
        <v-chip class="ma-2" color="primary" small outlined> 系统账户-【保险基金】: {{ TotalInfo.Last.bxjj }} BTC </v-chip>
      </v-badge>
      <br />
      <v-badge :content="PreInfo('fusd')" color="primary" :offset-y="14" :offset-x="20">
        <v-chip class="ma-2" color="primary" small outlined> 系统账户-【FUSD解锁】: {{ TotalInfo.Last.fusd }} BTC </v-chip>
      </v-badge>
      <br />
      <v-badge :content="PreInfo('RealSum')" color="primary" :offset-y="14" :offset-x="20">
        <v-chip class="ma-2" color="primary" small outlined> 其余账户 {{ TotalInfo.Last.RealSum }} BTC </v-chip>
      </v-badge>
      <br />
      <v-badge :content="PreInfo('Sum')" color="primary" :offset-y="14" :offset-x="20">
        <v-chip class="ma-2" color="primary" small outlined> 合计 {{ TotalInfo.Last.Sum }} BTC </v-chip>
      </v-badge>
    </template>
    <div class="data-analysis">
      <div v-for="(item, index) in ShowDataOrigin" :key="index" v-show="$AnalysisStore.localState.UserSNChooseHistory.indexOf(index) > -1" ref="echartref"></div>
    </div>

    <v-dialog v-model="dialog">
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="primary" style="top:80px" fixed top right small fab v-bind="attrs" v-on="on">
          <v-icon>mdi-view-dashboard-outline</v-icon>
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="headline grey lighten-2">
          选择要查看的图表
          <v-icon @click="dialog = false" style="position: absolute;right: 10px;top: 10px;">mdi-window-close</v-icon>
        </v-card-title>

        <v-card-text>
          <v-item-group multiple v-model="$AnalysisStore.localState.UserSNChooseHistory">
            <v-container>
              <v-row>
                <v-col v-for="(data, index) in ShowDataOrigin" :key="index" cols="12">
                  <v-item v-slot:default="{ active, toggle }">
                    <v-card :color="active ? 'primary' : '#ccc'" class="d-flex align-center" dark height="30" @click="toggle">
                      <v-scroll-y-transition>
                        <div class="flex-grow-1 text-left" style="padding-left: 10px">
                          <v-icon v-if="active">mdi-check-circle-outline</v-icon>
                          {{ data.Name(thisNick) }}
                        </div>
                      </v-scroll-y-transition>
                    </v-card>
                  </v-item>
                </v-col>
              </v-row>
            </v-container>
          </v-item-group>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { EchartsBar } from '@/lib/echarts-render';
import { SnapshotItem, Snapshot } from '../../types/fmex';
import { DateFormat } from '../../lib/utils';
import axios from 'axios';
import BigNumber from 'bignumber.js';

interface ShowDataOrigin {
  Name: (vm: AnalysisPage) => string;
  Render: (vm: AnalysisPage) => any;
}

const DateMax = DateFormat(Date.now() - 86400000, 'yyyy-MM-dd'); // 只有昨日的数据。
const DateMin = DateFormat(new Date(2020, 7 - 1, 8), 'yyyy-MM-dd');

const CreateNumChoose = (num: number, index: number) => {
  return [
    {
      Name: (vm: AnalysisPage) => `资产 < ${num} BTC 的账户`,
      Render: (vm: AnalysisPage) => {
        const echartref = vm.$refs.echartref as any;
        const database = vm.SnapshotData.filter((item) => item.amount < num);
        EchartsBar(echartref[index], {
          color: ['#04a4cc'],
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
          },
          title: {
            subtext: `FMex 账户资产 < ${num} BTC 的${database.length}个账户`,
          },
          xAxis: {
            type: 'category',
            data: database.map((item, i) => i + vm.SnapshotData.length - database.length + 1),
            name: '名次',
          },
          yAxis: {
            type: 'value',
            name: '单位：BTC',
          },
          series: [
            {
              data: database.map((item) => item.amount),
              type: 'bar',
            },
          ],
        });
      },
    },
    {
      Name: (vm: AnalysisPage) => `资产 >= ${num} BTC 的账户`,
      Render: (vm: AnalysisPage) => {
        const echartref = vm.$refs.echartref as any;
        const database = vm.SnapshotData.filter((item) => item.amount >= num);
        EchartsBar(echartref[index + 1], {
          color: ['#04a4cc'],
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
          },
          title: {
            subtext: `FMex 账户资产 >= ${num} BTC 的${database.length}个账户`,
          },
          xAxis: {
            type: 'category',
            data: database.map((item, i) => i + 1),
            name: '名次',
          },
          yAxis: {
            type: 'value',
            name: '单位：BTC',
          },
          series: [
            {
              data: database.map((item) => item.amount),
              type: 'bar',
            },
          ],
        });
      },
    },
  ];
};

@Component({
  components: {},
})
export default class AnalysisPage extends Vue {
  modal = false;
  date = DateMax;
  DateMin = DateMin;
  DateMax = DateMax;

  get FUSDDateIndex() {
    if (this.date === '2020-08-19') return 2;
    return 1;
  }

  get thisNick() {
    return this;
  }

  get TotalInfo() {
    if (this.SnapshotData.length === 0 || this.SnapshotDataPre.length === 0) return null;
    const last = this.SnapshotData;
    const lastSum = last.map((a: any) => new BigNumber(a.amount)).reduce((a, b) => a.plus(b), new BigNumber(0));
    const pre = this.SnapshotDataPre;
    const preSum = pre.map((a: any) => new BigNumber(a.amount)).reduce((a, b) => a.plus(b), new BigNumber(0));

    return {
      Last: {
        bxjj: last[0].amount,
        fusd: last[1].amount,
        Count: last.length,
        Sum: lastSum.toNumber(),
        RealSum: lastSum
          .minus(last[0].amount)
          .minus(last[this.FUSDDateIndex].amount)
          .toNumber(),
      },
      Pre: {
        bxjj: pre[0].amount,
        fusd: pre[1].amount,
        Count: pre.length,
        Sum: preSum.toNumber(),
        RealSum: preSum
          .minus(pre[0].amount)
          .minus(pre[this.FUSDDateIndex].amount)
          .toNumber(),
      },
    };
  }

  PreInfo(key: string) {
    if (!this.TotalInfo) return null;
    const tt = this.TotalInfo as any;
    const val = new BigNumber(tt.Last[key]).minus(tt.Pre[key]).toNumber();
    if (val < 0) return '- ' + -val;
    return '+ ' + val;
  }

  ShowDataOrigin: ShowDataOrigin[] = [
    {
      Name: (vm: AnalysisPage) => '资产排名 TOP:50 的账户',
      Render: (vm: AnalysisPage) => {
        const echartref = vm.$refs.echartref as any;
        const database = vm.SnapshotData.slice(0, 50);
        EchartsBar(echartref[0], {
          color: ['#04a4cc'],
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
          },
          title: {
            subtext: 'FMex 账户资产 TOP:50',
          },
          xAxis: {
            type: 'category',
            data: database.map((item, i) => i + 1),
            name: '名次',
          },
          yAxis: {
            type: 'value',
            name: '单位：BTC',
          },
          series: [
            {
              data: database.map((item) => item.amount),
              type: 'bar',
            },
          ],
        });
      },
    },
    {
      Name: (vm: AnalysisPage) => `资产排名 50~${vm.SnapshotData.length} 的账户`,
      Render: (vm: AnalysisPage) => {
        const echartref = vm.$refs.echartref as any;
        const database = vm.SnapshotData.slice(50);
        EchartsBar(echartref[1], {
          color: ['#04a4cc'],
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
          },
          title: {
            subtext: `FMex 账户资产排名 50~${vm.SnapshotData.length}`,
          },
          xAxis: {
            type: 'category',
            data: database.map((item, i) => i + 51),
            name: '名次',
          },
          yAxis: {
            type: 'value',
            name: '单位：BTC',
          },
          series: [
            {
              data: database.map((item) => item.amount),
              type: 'bar',
            },
          ],
        });
      },
    },
    ...CreateNumChoose(1, 2),
    ...CreateNumChoose(5, 4),
    ...CreateNumChoose(10, 6),
  ];

  dialog = false;

  loading = true;
  OnLoadData = ['用户资产数据'];
  SnapshotData: SnapshotItem[] = [];
  SnapshotDataPre: SnapshotItem[] = [];
  BaseUrl = 'https://fmex-database.oss-cn-qingdao.aliyuncs.com/fmex/api/broker/v3/zkp-assets/account/snapshot/BTC/';

  @Watch('dialog')
  OnDialogChange() {
    if (this.dialog === true) return;
    this.Render();
  }

  async SaveDate() {
    (this.$refs.dialog as any).save(this.date);
    this.SnapshotData = [];
    await this.GetData();
    this.Render();
  }

  allowedDates(val: string) {
    // return ['2020-07-11'].indexOf(val) === -1;
    return true;
  }

  mounted() {
    this.mountedd();
  }

  async mountedd() {
    await this.GetData();
    this.Render();
  }

  Render() {
    this.ShowDataOrigin.forEach((item, index) => {
      if (this.$AnalysisStore.localState.UserSNChooseHistory.indexOf(index) === -1) return;
      item.Render(this);
    });
  }

  async GetData(times = 0): Promise<any> {
    const timeDate = new Date(this.date);
    // 因为数据存储时，按照今天存储昨天的
    const next = new Date(timeDate.getTime() + 86400000);
    const FileName = DateFormat(next, 'yyyy/MM/dd');
    const Data = await this.$AnalysisStore.GetJson(this.BaseUrl + FileName);
    if (!Data) {
      return this.GetData(++times);
    }
    Data.forEach((item: any) => {
      item.amount = parseFloat(item.amount);
    });
    Data.sort((a: any, b: any) => b.amount - a.amount);
    this.SnapshotData = Data;
    this.loading = false;
    this.GetPreData();
  }

  // 获取前一天的数据（用于比较）
  async GetPreData(times = 0): Promise<any> {
    const timeDate = new Date(this.date);
    // 因为数据存储时，按照今天存储昨天的
    const next = new Date(timeDate.getTime());
    const FileName = DateFormat(next, 'yyyy/MM/dd');
    const Data = await this.$AnalysisStore.GetJson(this.BaseUrl + FileName);
    if (!Data) {
      return this.GetPreData(++times);
    }
    Data.forEach((item: any) => {
      item.amount = parseFloat(item.amount);
    });
    Data.sort((a: any, b: any) => b.amount - a.amount);
    this.SnapshotDataPre = Data;
  }

  async GetBtcSnapshot(id = '', times = 0): Promise<any> {
    if (times > 5) return;
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
      return this.GetBtcSnapshot(id, ++times); // 获取下一页
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
