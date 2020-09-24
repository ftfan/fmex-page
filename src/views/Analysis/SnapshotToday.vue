<template>
  <div>
    <v-select style="margin-top:10px" dense :items="$AnalysisStore.localState.PlatformCurrency" small label="查看币种" v-model="$AnalysisStore.localState.Currency" outlined></v-select>

    <v-dialog ref="dialog" v-model="modal" color="primary" :return-value.sync="date" persistent>
      <template v-slot:activator="{ on, attrs }">
        <div>
          <div style="float:right;">
            <v-btn class="mx-2" @click="ToDayNext(-1)" fab dark small color="primary">
              <v-icon dark>mdi-menu-left-outline</v-icon>
            </v-btn>
            <v-btn class="mx-2" @click="ToDayNext(1)" fab dark small :color="NextDayAble ? 'primary' : '#666666'">
              <v-icon dark>mdi-menu-right-outline</v-icon>
            </v-btn>
          </div>
          <v-text-field style="width:200px;" v-model="date" label="日期选择" prepend-icon="mdi-calendar-range" readonly v-bind="attrs" v-on="on"></v-text-field>
        </div>
      </template>
      <v-date-picker v-model="date" scrollable :allowed-dates="allowedDates" :min="DateMin" :max="DateMax">
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="modal = false">取消</v-btn>
        <v-btn text color="primary" @click="SaveDate">确定</v-btn>
      </v-date-picker>
    </v-dialog>

    <template v-if="!loading && TotalInfo">
      <div v-for="(item, index) in TotalInfo" :key="index">
        <v-badge v-bind="item.badge">
          <v-chip v-bind="item.chip">{{ item.chipContent }}</v-chip>
        </v-badge>
      </div>
    </template>
    <!-- <v-parallax
      v-if="$Config.IsMobile"
      class="parallax20200916"
      @click="ToLink('https://foss.imconfig.com/images/2020-09-16.png')"
      height="50"
      src="https://foss.imconfig.com/images/2020-09-16.png"
    ></v-parallax> -->
    <div class="data-analysis">
      <div :style="CanvasStyle" v-for="(item, index) in ShowDataOrigin" :key="index" v-show="$AnalysisStore.localState.UserSNChooseHistory.indexOf(index) > -1" ref="echartref"></div>
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
import { DateFormat, BigNumShowStr } from '../../lib/utils';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { PageLoading } from '@/lib/page-loading';

const ToDayStr = DateFormat(Date.now(), 'yyyy-MM-dd');

interface ShowDataOrigin {
  Name: (vm: AnalysisPage) => string;
  Render: (vm: AnalysisPage) => any;
}

const DateMax = DateFormat(Date.now() - 86400000, 'yyyy-MM-dd'); // 只有昨日的数据。
const DateMin = DateFormat(new Date(2020, 7 - 1, 8), 'yyyy-MM-dd');

const grid = {
  right: '50px',
  left: '50px',
  bottom: '80px',
};

const CreateNumChoose = (num: number, index: number) => {
  return [
    {
      Name: (vm: AnalysisPage) => `资产 < ${num} ${vm.UpCoinName} 的账户`,
      Render: (vm: AnalysisPage) => {
        const echartref = vm.$refs.echartref as any;
        const database = vm.SnapshotData.filter((item) => item.amount < num);
        EchartsBar(echartref[index], {
          grid,
          color: ['#04a4cc'],
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
          },
          title: {
            subtext: `账户资产 < ${num} ${vm.UpCoinName} 的${database.length}个账户`,
          },
          xAxis: {
            type: 'category',
            data: database.map((item, i) => i + vm.SnapshotData.length - database.length + 1),
            name: '名次',
          },
          yAxis: {
            type: 'value',
            name: `单位：${vm.UpCoinName}`,
            axisLabel: { formatter: BigNumShowStr },
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
      Name: (vm: AnalysisPage) => `资产 >= ${num} ${vm.UpCoinName} 的账户`,
      Render: (vm: AnalysisPage) => {
        const echartref = vm.$refs.echartref as any;
        const database = vm.SnapshotData.filter((item) => item.amount >= num);
        EchartsBar(echartref[index + 1], {
          grid,
          color: ['#04a4cc'],
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
          },
          title: {
            subtext: `账户资产 >= ${num} ${vm.UpCoinName} 的${database.length}个账户`,
          },
          xAxis: {
            type: 'category',
            data: database.map((item, i) => i + 1),
            name: '名次',
          },
          yAxis: {
            type: 'value',
            name: `单位：${vm.UpCoinName}`,
            axisLabel: { formatter: BigNumShowStr },
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

  get CanvasStyle() {
    return { width: window.outerWidth + 'px' };
  }

  get UpCoinName() {
    return this.$AnalysisStore.localState.Currency.toLocaleUpperCase();
  }

  get FUSDDateIndex() {
    // 18号那天（保存文件名称是2020-08-19），fusd奖励账户的资产排名到了第三位，也就是index===2；
    if (this.date === '2020-08-19') return [2, 1];

    // 因为上面18号那天的原因，需要调整19号的前一天，也就是18号的数据
    if (this.date === '2020-08-20') return [1, 2];
    return [1, 1];
  }
  get NextDayAble() {
    const date = new Date(this.date);
    const now = new Date(ToDayStr);
    return date.getTime() < now.getTime() - 86400000;
  }
  get thisNick() {
    return this;
  }

  // fusd解锁账号
  get TotalInfo() {
    if (this.SnapshotData.length === 0 || this.SnapshotDataPre.length === 0) return null;
    const last = this.SnapshotData;
    const lastSum = last.map((a: any) => new BigNumber(a.amount)).reduce((a, b) => a.plus(b), new BigNumber(0));
    const pre = this.SnapshotDataPre;
    const preSum = pre.map((a: any) => new BigNumber(a.amount)).reduce((a, b) => a.plus(b), new BigNumber(0));
    const FUSDIndex = this.FUSDDateIndex;
    const isBtc = this.UpCoinName === 'BTC';
    // 最新的资产表内对系统资产进行了标记
    const sys = this.SnapshotData.filter((item) => item.label);
    const sysSum = sys.map((a: any) => new BigNumber(a.amount)).reduce((a, b) => a.plus(b), new BigNumber(0));

    // 上一天的数据
    const sysPre = this.SnapshotDataPre.filter((item) => item.label);
    const sysPreMap: any = {};
    sysPre.forEach((item) => {
      sysPreMap[item.label] = item;
    });
    const sysPreSum = sysPre.map((a: any) => new BigNumber(a.amount)).reduce((a, b) => a.plus(b), new BigNumber(0));

    const sysInfo = sys.map((item) => ({
      badge: {
        content: this.ShowPre(new BigNumber(item.amount).minus(new BigNumber((sysPreMap[item.label] && sysPreMap[item.label].amount) || 0)).toNumber()),
        color: 'success',
        'offset-y': 14,
        'offset-x': 20,
      },
      chip: { class: 'ma-2', color: 'success', small: true, outlined: true },
      chipContent: `【${item.label}】 ${item.amount}`,
    }));
    if (sysInfo.length) {
      sysInfo.push({
        // 非系统账户合计
        badge: {
          content: this.ShowPre(
            lastSum
              .minus(sysSum)
              .minus(preSum.minus(sysPreSum))
              .toNumber()
          ),
          color: 'success',
          'offset-y': 14,
          'offset-x': 20,
        },
        chip: { class: 'ma-2', color: 'success', small: true, outlined: true },
        chipContent: `用户账户合计 ${lastSum.minus(sysSum).toNumber()}`,
      });
    }

    return [
      {
        // 账户数量
        badge: { content: this.ShowPre(last.length - pre.length), color: 'primary', 'offset-y': 14, 'offset-x': 20 },
        chip: { class: 'ma-2', color: 'primary', small: true, outlined: true },
        chipContent: `${this.UpCoinName} 账户数量 ${last.length}`,
      },
      // 系统账户
      ...sysInfo,
      {
        // 合计
        badge: { content: this.ShowPre(lastSum.minus(preSum).toNumber()), color: 'primary', 'offset-y': 14, 'offset-x': 20 },
        chip: { class: 'ma-2', color: 'primary', small: true, outlined: true },
        chipContent: `合计 ${lastSum.toNumber()}`,
      },
    ];
  }

  ShowPre(n: number) {
    if (n > 0) return `+ ${n}`;
    if (n === 0) return '+ 0';
    return `- ${-n}`;
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
      Name: (vm: AnalysisPage) => '资产排名 TOP: 50 的账户',
      Render: (vm: AnalysisPage) => {
        const echartref = vm.$refs.echartref as any;
        const database = vm.SnapshotData.slice(0, 50);
        EchartsBar(echartref[0], {
          grid,
          color: ['#04a4cc'],
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
          },
          title: {
            subtext: '账户资产 TOP:50',
          },
          xAxis: {
            type: 'category',
            data: database.map((item, i) => i + 1),
            name: '名次',
          },
          yAxis: {
            type: 'value',
            name: `单位：${vm.UpCoinName}`,
            axisLabel: { formatter: BigNumShowStr },
          },
          series: [
            {
              data: database.map((item) => item.amount),
              type: 'bar',
              markPoint: {
                data: database
                  .filter((i) => i.label)
                  .map((item) => {
                    return {
                      symbolRotate: 45,
                      name: item.label,
                      coord: [database.indexOf(item), item.amount],
                      value: item.label as any,
                    };
                  }),
              },
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
          grid,
          color: ['#04a4cc'],
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
          },
          title: {
            subtext: `账户资产排名 50~${vm.SnapshotData.length}`,
          },
          xAxis: {
            type: 'category',
            data: database.map((item, i) => i + 51),
            name: '名次',
          },
          yAxis: {
            type: 'value',
            name: `单位：${vm.UpCoinName}`,
            axisLabel: { formatter: BigNumShowStr },
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
  queue = 0;

  loading = true;
  OnLoadData = ['用户资产数据'];
  SnapshotData: SnapshotItem[] = [];
  SnapshotDataPre: SnapshotItem[] = [];
  get BaseUrl() {
    return `https://fmex-database.oss-cn-qingdao.aliyuncs.com/fmex/api/broker/v3/zkp-assets/account/snapshot/${this.UpCoinName}/`;
  }

  @Watch('dialog')
  OnDialogChange() {
    if (this.dialog === true) return;
    this.Render();
  }

  @Watch('date', { immediate: true })
  OnDateChange() {
    this.$AnalysisStore.GetPlatformCurrency(this.date);
  }

  @Watch('UpCoinName')
  async OnUpCoinNameChange() {
    if (this.$route.query.tab !== '0') return; // 不是当前页面
    this.mountedd();
  }

  async SaveDate() {
    (this.$refs.dialog as any).save(this.date);
    this.SnapshotData = [];
    this.mountedd();
  }

  allowedDates(val: string) {
    // return ['2020-07-11'].indexOf(val) === -1;
    return true;
  }

  mounted() {
    this.mountedd();
  }

  async mountedd() {
    await this.GetData(++this.queue);
    this.Render();
  }

  Render() {
    this.ShowDataOrigin.forEach((item, index) => {
      if (this.$AnalysisStore.localState.UserSNChooseHistory.indexOf(index) === -1) return;
      item.Render(this);
    });
  }

  async GetData(queue: number, times = 0): Promise<any> {
    if (times > 5) return;
    const timeDate = new Date(this.date);
    // 因为数据存储时，按照今天存储昨天的
    const next = new Date(timeDate.getTime() + 86400000);
    const FileName = DateFormat(next, 'yyyy/MM/dd');
    if (this.UpCoinName === 'USDT' && next.getTime() < new Date('2020-08-30').getTime()) return; // usdt 之前没数据。不用浪费请求
    const close = PageLoading(`获取数据: ${this.UpCoinName} ${FileName}`);
    const Data = await this.$AppStore.GetSnapshotDataByDate(this.UpCoinName, FileName);
    close();
    if (queue !== this.queue) return;
    if (!Data) {
      return this.GetData(queue, ++times);
    }
    Data.sort((a: any, b: any) => b.amount - a.amount);

    this.SnapshotData = Data;
    // 去重
    const mapId: any = {};
    this.SnapshotData = this.SnapshotData.filter((item) => {
      if (mapId[item.id]) return false;
      mapId[item.id] = true;
      return true;
    });
    this.loading = false;
    this.SnapshotDataPre = [];
    this.GetPreData(queue);
  }

  // 获取前一天的数据（用于比较）
  async GetPreData(queue: number, times = 0): Promise<any> {
    if (times > 5) return;
    const timeDate = new Date(this.date);
    // 因为数据存储时，按照今天存储昨天的
    const next = new Date(timeDate.getTime());
    const FileName = DateFormat(next, 'yyyy/MM/dd');
    if (this.UpCoinName === 'USDT' && next.getTime() < new Date('2020-08-30').getTime()) return; // usdt 之前没数据。不用浪费请求
    const close = PageLoading(`正在获取前一天的数据，用于比对`);
    const Data = await this.$AppStore.GetSnapshotDataByDate(this.UpCoinName, FileName);
    close();
    if (queue !== this.queue) return;
    if (!Data) {
      return this.GetPreData(queue, ++times);
    }
    Data.sort((a: any, b: any) => b.amount - a.amount);

    this.SnapshotDataPre = Data;
    // 去重
    const mapId: any = {};
    this.SnapshotDataPre = this.SnapshotDataPre.filter((item) => {
      if (mapId[item.id]) return false;
      mapId[item.id] = true;
      return true;
    });
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
    const close = PageLoading(`正在连接：https://fmex.com/api/broker/v3/`);
    const res = await axios
      .get(`https://fmex.com/api/broker/v3/zkp-assets/account/snapshot?currencyName=${this.UpCoinName.toLocaleUpperCase()}${idStr}`)
      .then((res) => res.data)
      .catch(() => null);
    close();
    console.log(res);
    if (!res || res.status !== 'ok') {
      this.OnLoadData[this.OnLoadData.length - 1] = `${this.OnLoadData[this.OnLoadData.length - 1]} 加载失败`;
      return this.GetBtcSnapshot(id, ++times); // 获取下一页
    }
    return End(res.data);
  }

  ToDayNext(num: number) {
    const timeDate = new Date(this.date);
    // 因为数据存储时，按照今天存储昨天的
    const next = new Date(timeDate.getTime() + num * 86400000);
    const nextDay = DateFormat(next, 'yyyy-MM-dd');
    if (nextDay === DateFormat(Date.now(), 'yyyy-MM-dd')) return; // 不能设置成今天，没有数据
    this.date = nextDay;
    this.mountedd();
  }
  ToLink(url: string) {
    location.href = url;
  }
}
</script>
<style lang="scss">
.parallax20200916 .v-parallax__image-container img {
  width: 100%;
  top: -1050px;
}
</style>

<style lang="scss" scoped>
.data-analysis {
  div {
    height: 300px;
  }
}
</style>
