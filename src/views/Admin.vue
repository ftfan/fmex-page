<template>
  <div>
    <v-container>
      <v-row dense>
        <v-col cols="12" v-for="item in $AppStore.localState.AdminUsers" :key="item.Key">
          <v-card color="primary" @click="View(item)" dark>
            <v-card-title class="headline">{{ item.Mark }}</v-card-title>
            <v-card-subtitle>ReportKey: {{ item.ReportKey }}<br />Key: {{ item.Key }}<br />Secret: {{ item.Secret }}</v-card-subtitle>
            <v-card-actions>
              <v-btn color="error" @click="Del(item)">删除</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-row dense>
      <v-col cols="12" style="padding: 12px;">
        <v-text-field required color="primary" v-model="Params.Mark" label="Mark" outlined type="text"></v-text-field>
        <v-text-field required color="primary" v-model="Params.ReportKey" label="ReportKey" outlined type="text"></v-text-field>
        <v-text-field required color="primary" v-model="Params.Key" label="Key" outlined type="text"></v-text-field>
        <v-text-field required color="primary" v-model="Params.Secret" label="Secret" outlined type="text"></v-text-field>
        <v-btn @click="Submit" color="primary">添加管理</v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { clone, DateFormat, sleep } from '../lib/utils';
import echarts from 'echarts';
import urijs from 'urijs';
import { debounce, throttle } from 'ts-debounce-throttle';
import { FunApi } from '@/api/fun';
import { CodeObj } from '@/lib/Code';

@Component({
  components: {},
})
export default class ImconfigPage extends Vue {
  Params = {
    Mark: '',
    Key: '',
    ReportKey: '',
    Secret: '',
  };

  async Submit() {
    Vue.AppStore.localState.AdminUsers.push(clone(this.Params));
  }

  async View(item: any) {
    this.$router.push({ name: 'Imconfig', query: { DataKey: item.ReportKey } });
  }
  Del(item: any) {
    const bool = prompt('确认删除？');
    if (!bool) return;
    const index = Vue.AppStore.localState.AdminUsers.indexOf(item);
    Vue.AppStore.localState.AdminUsers.splice(index, 1);
  }
}
</script>

<style lang="scss" scoped></style>
