<template>
  <div class="main index" transition="normal">
    <div class="center">
      <h1>FMex.Fun</h1>
      <p><b>最近更新: </b>2020年6月20日</p>
    </div>
    <div class="section">
      <ul class="clearfix">
        <li>
          <div class="content">
            <a href="https://github.com/ftfan/api-client" target="_blank">
              <h2>FMex交易软件(开发中~)</h2>
              <div class="des">提供基础交易方式，用于刷量、网格等~</div>
            </a>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class IndexPage extends Vue {}
</script>

<style lang="scss" scoped>
h2 {
  color: #fff;
}
</style>
