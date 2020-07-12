<template>
  <div class="main index" transition="normal">
    <div class="center">
      <h1 class="sitename">FMex.Fun</h1>
      <p><b>最近更新: </b>{{ BuildTime }}</p>
    </div>
    <div class="section">
      <ul class="clearfix">
        <li class="GetTired">
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
import { DateFormat } from '../lib/utils';

@Component({
  components: {},
})
export default class IndexPage extends Vue {
  get BuildTime() {
    const Time = window.__Build_Time === '__Build_Time__' ? Date.now() : parseInt(window.__Build_Time, 10);
    return DateFormat(Time, 'yyyy-MM-dd hh:mm');
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
