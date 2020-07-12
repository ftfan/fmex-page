<template>
  <div class="main index" transition="normal">
    <div class="center">
      <h1 class="sitename">FMex 数据看板</h1>
    </div>
    <div class="section" v-if="loading">
      正在加载：
      <div v-for="item in OnLoadData" :key="item">{{ item }}</div>
    </div>
    <div class="data-analysis"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import $ from 'jquery';

@Component({
  components: {},
})
export default class AnalysisPage extends Vue {
  loading = true;
  OnLoadData = ['用户资产数据'];

  mounted() {
    this.GetBtcSnapshot();
  }

  async GetBtcSnapshot(id = ''): Promise<any> {
    const idStr = id ? `&id=${id}` : '';
    if (id) this.OnLoadData.push(`用户资产数据 【${id}】`);

    const End = (data: any) => {
      if (id) this.$set(this.$AnalysisStore.sessionState.snapshot, id, data); // 有id的请求才缓存
      if (data.has_next && data.next_page_id) return this.GetBtcSnapshot(data.next_page_id); // 获取下一页
      this.OnLoadData.push(`用户资产数据 全部加载完成`);
      this.loading = false;
    };

    if (this.$AnalysisStore.sessionState.snapshot[id]) return End(this.$AnalysisStore.sessionState.snapshot[id]); // 使用缓存
    const res = await $.getJSON(`https://fmex.com/api/broker/v3/zkp-assets/account/snapshot?currencyName=BTC${idStr}`);
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
h2 {
  color: #fff;
}
$time: 10s;
.sitename {
  transition: all $time ease-in-out;

  &:hover {
    transform: scale(1.2) rotate((3 * 360deg * $time / 1s) + 10deg);
  }
}
</style>
