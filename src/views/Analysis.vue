<template>
  <div class="analysis g-abs" transition="normal">
    <el-tabs type="border-card" @tab-click="TabClick">
      <el-tab-pane lazy label="账户资产">
        <SnapshotToday></SnapshotToday>
      </el-tab-pane>
      <el-tab-pane lazy label="资产历史">
        <SnapshotHistory></SnapshotHistory>
      </el-tab-pane>
      <el-tab-pane lazy label="数据走势">
        <BtcVolPrice></BtcVolPrice>
      </el-tab-pane>
      <el-tab-pane lazy label="未平仓合约">
        <HoldAmount></HoldAmount>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import SnapshotToday from './Analysis/SnapshotToday.vue';
import SnapshotHistory from './Analysis/SnapshotHistory.vue';
import BtcVolPrice from './Analysis/BtcVolPrice.vue';
import HoldAmount from './Analysis/HoldAmount.vue';
import { LogEvent } from '../router';

@Component({
  components: { SnapshotToday, SnapshotHistory, BtcVolPrice, HoldAmount },
})
export default class AnalysisPage extends Vue {
  TabClick(tab: any) {
    LogEvent(tab.label, 'click', 'tab', 1);
  }
}
</script>

<style lang="scss" scoped>
.analysis {
  overflow: auto;
  padding: 160px 100px 0;
}
@media screen and (max-width: 750px) {
  .analysis {
    padding: 160px 4px 0;
  }
}
</style>
