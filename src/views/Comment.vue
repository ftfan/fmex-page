<template>
  <div>
    <v-app-bar app>
      <v-tabs grow contered background-color="primary" v-model="tab" show-arrows>
        <v-tab v-for="item in Taps" :key="item.Name">{{ item.Name }}</v-tab>
      </v-tabs>
    </v-app-bar>
    <v-tabs-items v-model="tab" touchless>
      <v-tab-item v-for="item in Taps" :key="item.Name">
        <v-card>
          <Vssue :title="item.Component" />
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
import Platform from './Analysis/Platform.vue';
import { LogEvent } from '../router';
import { JsBridgeCloseMenu } from '@/lib/bridge';
// import { IsWechat } from '@/lib/utils';

@Component<AnalysisPage>({
  components: { SnapshotToday, SnapshotHistory, BtcVolPrice, HoldAmount, Platform },
  beforeRouteEnter: (to, from, next) => {
    JsBridgeCloseMenu();
    next((vm) => {
      vm.tab = parseInt(to.query.tab as string, 10) || 0;
    });
  },
})
export default class AnalysisPage extends Vue {
  tab = 0;

  Taps = [
    { Name: '留言板', Component: '留言板' },
    { Name: '建议', Component: '建议' },
  ];

  @Watch('tab')
  TabClick(tab: any) {
    const item = this.Taps[tab];
    if (!item) return;
    const els = this.$refs[item.Name] as any;
    if (els) {
      const el = els[0];
      if (el && el.mountedd) el.mountedd(); // 初始化组件
    }
    const query = Object.assign({}, this.$route.query, {
      tab: String(tab),
    });

    // 当前路由与tab不一致时才更新
    if (String(tab) !== String(this.$route.query.tab)) {
      // if (IsWechat) {
      //   location.replace(`/?Analysis=${tab}/#/Analysis?tab=${tab}`);
      // } else {
      this.$router.replace({ query });
      // }
    }
    LogEvent(item.Name, 'click', 'tab', 1);
  }
}
</script>
