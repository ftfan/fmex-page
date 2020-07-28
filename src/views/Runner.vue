<template>
  <v-container fluid>
    <v-row dense>
      <v-col v-for="(item, index) in Runners" :key="index">
        <v-card outlined :loading="item.Run" :elevation="4">
          <v-list-item three-line>
            <v-list-item-content>
              <v-list-item-title class="headline mb-1">{{ item.Title }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.Des }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-card-actions>
            <v-btn color="primary" text>绑定API</v-btn>
            <v-btn color="primary" text>详情</v-btn>
            <v-switch v-model="item.Run"></v-switch>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
// import { DateFormat } from '../lib/utils';

@Component({
  components: {},
})
export default class RunnerPage extends Vue {
  Runners = [
    {
      Title: '网格策略',
      Des: '网格从策略网格从策略网格从策略网格从策略网格从策略网格从策略网格从策略网格从策略网格从策略网格从策略网格从策略网格从策略',
      Run: false,
      Api: {
        Secret: '',
        Key: '',
      },
    },
  ];
}
</script>
