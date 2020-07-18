<template>
  <div class="analysis">
    <v-tabs grow contered background-color="primary" v-model="tab" show-arrows>
      <v-tab v-for="item in Taps" :key="item.Name">{{ item.Name }}</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab" touchless>
      <v-tab-item v-for="item in Taps" :key="item.Name">
        <v-card>
          <component :ref="item.Name" :is="item.Component"></component>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import SnapshotToday from './Analysis/SnapshotToday.vue';
import SnapshotHistory from './Analysis/SnapshotHistory.vue';
import BtcVolPrice from './Analysis/BtcVolPrice.vue';
import HoldAmount from './Analysis/HoldAmount.vue';
import { LogEvent } from '../router';

@Component({
  components: { SnapshotToday, SnapshotHistory, BtcVolPrice, HoldAmount },
})
export default class AnalysisPage extends Vue {
  tab = 0;

  Taps = [
    { Name: '账户资产', Component: SnapshotToday },
    { Name: '资产走势', Component: SnapshotHistory },
    { Name: '数据走势', Component: BtcVolPrice },
    { Name: '未平仓合约', Component: HoldAmount },
  ];

  @Watch('tab')
  TabClick(tab: any) {
    const item = this.Taps[tab];
    if (!item) return;
    const els = this.$refs[item.Name] as any;
    if (els) {
      const el = els[0];
      console.log(el && el.mountedd);
      if (el && el.mountedd) el.mountedd(); // 初始化组件
    }

    LogEvent(item.Name, 'click', 'tab', 1);
  }
}
</script>

<style lang="scss" scoped></style>
