<template>
  <v-app>
    <div class="app-sys-nav" v-if="FMexFunApp"></div>
    <v-main>
      <router-view></router-view>
    </v-main>
    <v-bottom-navigation v-if="!FMexFunApp" v-model="bottomNav" color="primary" app grow>
      <v-btn class="my-btn" @click="LinkTo('')">
        <span>FMex.fun</span>
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-btn class="my-btn" @click="LinkTo('Analysis')">
        <span>数据分析</span>
        <v-icon>mdi-chart-line</v-icon>
      </v-btn>
      <v-btn class="my-btn" @click="LinkTo('Comment')">
        <span>留言区</span>
        <v-icon>mdi-comment-processing-outline</v-icon>
      </v-btn>
      <v-btn class="my-btn" @click="LinkTo('About')">
        <span>站点介绍</span>
        <v-icon>mdi-information-variant</v-icon>
      </v-btn>
    </v-bottom-navigation>
    <v-dialog :value="!!$AppStore.state.ErrorMsg" @input="CloseMsg">
      <v-alert border="left" colored-border color="primary" elevation="2"> {{ $AppStore.state.ErrorMsg }} </v-alert>
    </v-dialog>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { IsPC } from './lib/utils';
// import { IsWechat } from './lib/utils';
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
    if (this.$route.name === 'Comment') return (this.bottomNav = 2);
    if (this.$route.name === 'About') return (this.bottomNav = 3);
  }
  LinkTo(url: string) {
    // if (IsWechat) {
    //   url = `/?${url}#/${url}`;
    // } else {
    url = `/#/${url}`;
    // }
    location.href = url;
  }

  CloseMsg(bol: boolean) {
    if (bol) return;
    this.$AppStore.state.ErrorMsg = '';
  }

  get FMexFunApp() {
    if (!this.$AppStore.state.AppUrl) return false;
    return this.$AppStore.state.AppUrl.hasQuery('FMexFunApp');
  }
}
</script>

<style lang="scss" scpoed>
.my-btn {
  height: inherit !important;
}
.app-sys-nav {
  height: 20px;
  background-color: #04a4cc;
}
</style>
