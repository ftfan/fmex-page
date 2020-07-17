<template>
  <v-app>
    <v-main>
      <router-view></router-view>
    </v-main>

    <v-bottom-navigation v-model="bottomNav" color="primary" app grow shift>
      <v-btn class="my-btn" href="/#/">
        <span>FMex.fun</span>
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-btn class="my-btn" href="/#/Analysis">
        <span>数据分析</span>
        <v-icon>mdi-chart-line</v-icon>
      </v-btn>
      <v-btn class="my-btn" href="/#/About">
        <span>站点介绍</span>
        <v-icon>mdi-information-variant</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
// import Header from '@/components/Header.vue';

@Component({
  components: {
    // Header,
  },
})
export default class App extends Vue {
  bottomNav = 0;
  @Watch('$route', { immediate: true })
  OnRouteChange() {
    this.bottomNav = 0;
    if (this.$route.name === 'Index') return (this.bottomNav = 0);
    if (this.$route.name === 'Analysis') return (this.bottomNav = 1);
    if (this.$route.name === 'About') return (this.bottomNav = 2);
  }
}
</script>

<style lang="scss" scpoed>
.my-btn {
  height: inherit !important;
}
</style>
