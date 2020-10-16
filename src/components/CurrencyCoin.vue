<template>
  <v-btn-toggle style="margin: 20px 60px 20px 10px;width:80%;display:block;" dense color="primary" mandatory group v-model="$AnalysisStore.localState.Currency">
    <v-btn v-for="item in $AnalysisStore.localState.PlatformCurrency" :key="item" :value="item">
      {{ item }}
    </v-btn>
  </v-btn-toggle>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class CurrencyCoin extends Vue {
  created() {
    if (this.$route.query.Currency) this.$AnalysisStore.localState.Currency = String(this.$route.query.Currency);
  }
}
</script>
