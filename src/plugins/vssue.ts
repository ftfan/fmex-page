// 引入 vue
import Vue from 'vue';
// 引入 vssue
import Vssue from 'vssue';
// 引入对应平台的 api 包
import GiteeV5 from '@vssue/api-gitee-v5';
// 引入 vssue 的样式文件
// import 'vssue/dist/vssue.css';
import './vssue.styl';
import 'github-markdown-css/github-markdown.css';

Vue.use(Vssue, {
  // 设置要使用的平台 api
  api: GiteeV5,
  // 在这里设置你使用的平台的 OAuth App 配置
  owner: 'fmex',
  repo: 'fmex-fun-vssue',
  clientId: '35ca80c34036e128fd12e6255be9de7935f897df194e0d48016ef7e0c55a9e30',
  clientSecret: '8db1d7aec1ad9c71f82c8218b4addec73b516d7c8663c7ba859d12e10139842d',
  // autoCreateIssue: true, // 允许自动创建issue
  prefix: '[FMexFun]',
});
