<template>
  <div class="page-index">
    <div class="center">
      <h1 class="sitename">FMex.Fun</h1>
      <p><b>最近更新: </b>{{ BuildTime }}</p>
    </div>
    <div class="section">
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
                <v-btn color="primary" text @click="tip = true">我要试用</v-btn>
                <v-btn color="primary" text @click="ViewData">查看策略日志</v-btn>
                <v-btn color="primary" text @click="$router.push({ name: 'Imconfig', query: { DataKey: '' } })">查看试运行账号</v-btn>
                <!-- <v-switch v-model="item.Run"></v-switch> -->
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-dialog v-model="kkkkkkkkk">
        <v-form lazy-validation style="padding:20px;background-color:#ffffff;">
          <!-- <v-text-field required v-model="$AppStore.localState.ApiInfo.Key" label="api key" type="number" outlined clearable></v-text-field> -->
          <v-text-field required v-model="DataKeyTemp" label="输入你的日志ID" type="text" outlined clearable></v-text-field>

          <v-btn color="primary" class="mr-4" @click="SubmitView">查看策略日志</v-btn>
        </v-form>
      </v-dialog>

      <v-dialog v-model="tip">
        <v-alert type="info"> 添加微信: <strong>Luo982748666</strong> 进群了解策略详情（参数解读） </v-alert>
        <v-form ref="form" lazy-validation style="padding:20px;background-color:#ffffff;">
          <v-text-field style="margin-top:10px" required v-model="applyParams.Key" label="api key" type="text" outlined clearable></v-text-field>
          <v-text-field required v-model="applyParams.Secret" label="api secret" type="text" outlined clearable></v-text-field>
          <v-text-field required v-model="applyParams.Pwd" label="给当前 api 设置个密码" type="password" outlined clearable></v-text-field>
          <v-text-field required v-model="applyParams.Pwd2" label="再次输入密码，避免输错" type="password" outlined clearable></v-text-field>
          <v-btn color="success" class="mr-4" @click="ApplyCreateUser">开始使用</v-btn>
        </v-form>
      </v-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { DateFormat } from '../lib/utils';
import { FunApi } from '@/api/fun';
import { CodeObj } from '@/lib/Code';

@Component({
  components: {},
})
export default class IndexPage extends Vue {
  get BuildTime() {
    const Time = window.__Build_Time === '__Build_Time__' ? Date.now() : parseInt(window.__Build_Time, 10);
    return DateFormat(Time, 'yyyy-MM-dd hh:mm');
  }
  tip = false;
  kkkkkkkkk = false;

  DataKeyTemp = '';

  ViewData() {
    this.DataKeyTemp = this.$AppStore.localState.ApiInfo.DataKey;
    this.kkkkkkkkk = true;
  }

  applyParams = {
    Key: '',
    Secret: '',
    Pwd: '',
    Pwd2: '',
  };

  SubmitView() {
    this.validate(this.DataKeyTemp);
  }

  async validate(key: string) {
    const Data = await this.$AnalysisStore.GetJson(`https://fmex-database.oss-cn-qingdao.aliyuncs.com/runner/report/${key}/config`);
    if (!Data) return this.$AppStore.Error('日志索引错误，未找到对应数据');
    this.$AppStore.localState.ApiInfo.DataKey = key;
    this.$router.push({ name: 'Imconfig', query: { DataKey: this.$AppStore.localState.ApiInfo.DataKey } });
  }

  async ApplyCreateUser() {
    if (!this.applyParams.Key) return this.$AppStore.Error('key');
    if (!this.applyParams.Secret) return this.$AppStore.Error('secret');
    if (this.applyParams.Pwd !== this.applyParams.Pwd2) return this.$AppStore.Error('两次密码不一致');
    const res = await FunApi.post('/grid/add-user', this.applyParams).then((res) => res.data as CodeObj<any>);
    this.tip = false;
    if (res.Error()) return this.$AppStore.Error(res.Msg);
    this.$AppStore.Error('设置成功，去设置具体参数，并开启策略吧~');
    this.$AppStore.localState.ApiInfo.DataKey = res.Data;
    this.$AppStore.localState.UserKey = this.applyParams.Key;
    this.validate(res.Data);
  }

  Runners = [
    {
      Title: 'FMex网格策略(试运行阶段)',
      Des: '在一定价格区间内低多高空，赚取差价和手续费',
      // Run: false,
      // Api: {
      //   Secret: '',
      //   Key: '',
      // },
    },
  ];
}
</script>

<style lang="scss" scoped>
h2 {
  color: #fff;
}
$time: 10s;
.sitename {
  transition: all $time ease-in-out;
  color: $color-primary;

  &:hover {
    transform: scale(1.2) rotate((3 * 360deg * $time / 1s) + 10deg);
  }
}
p {
  color: $color-primary;
}
.section {
  margin-top: 20px;
}
.center {
  text-align: center;
}
ul {
  li {
    $section-ul-li-width: 240px;
    width: $section-ul-li-width;
    height: $section-ul-li-width / 3;
    padding: 12px;
    margin: 4px;
    background-color: $color-primary;
    border: 4px solid #fff;
    box-shadow: 0 0 4px $color-primary;
    transition: all 0.2s ease-in-out;
    float: left;
    overflow: hidden;

    h2 {
      font-size: 1rem;
      font-weight: 400;
      text-align: center;
    }

    a {
      color: #fff;
    }

    .des {
      color: #dadada;
      font-size: 0.8rem;
    }

    &:hover {
      background-color: #00a499;
      cursor: pointer;

      a {
        color: #83e9f5;
        text-decoration: none;
      }
    }
  }
}
</style>
