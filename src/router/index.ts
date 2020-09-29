import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Index from '@/views/Index.vue';
import { PageLoading } from '@/lib/page-loading';

Vue.use(VueRouter);

function AsyncLoader(resolve: any, reject: any, component: Promise<any>) {
  component
    .then(resolve)
    .catch(() => {
      alert('资源加载失败，请稍后再试');
      reject('net error');
    })
    .finally(PageLoading('页面切换中，加载异步依赖'));
}

const routes: Array<RouteConfig> = [
  { path: '/', name: 'Index', component: Index },
  { path: '/Imconfig', name: 'Imconfig', component: (s, j) => AsyncLoader(s, j, import('@/views/Imconfig.vue')) },
  { path: '/About', name: 'About', component: (s, j) => AsyncLoader(s, j, import('@/views/About.vue')) },
  { path: '/Analysis', name: 'Analysis', component: (s, j) => AsyncLoader(s, j, import('@/views/Analysis.vue')) },
  { path: '/Friend', name: 'Friend', component: (s, j) => AsyncLoader(s, j, import('@/views/Friend.vue')) },
  { path: '/Runner', name: 'Runner', component: (s, j) => AsyncLoader(s, j, import('@/views/Runner.vue')) },
  { path: '/Admin', name: 'Admin', component: (s, j) => AsyncLoader(s, j, import('@/views/Admin.vue')) },
  { path: '/Comment', name: 'Comment', component: (s, j) => AsyncLoader(s, j, import('@/views/Comment.vue')) },
  { path: '/WechatTest', name: 'WechatTest', component: (s, j) => AsyncLoader(s, j, import('@/views/WechatTest.vue')) },
];

const router = new VueRouter({
  routes,
});

const czc = ((window as any)._czc = (window as any)._czc || []);
czc.push(['_setAutoPageview', false]); // 关闭自动统计
export const LogEvent = (type: string, event: string, log: string, value: number) => {
  czc.push(['_trackEvent', type, event, log, value]);
};

router.beforeEach((to, from, next) => {
  czc.push(['_trackPageview', to.fullPath, from ? location.origin + '/#' + from.fullPath : document.referrer]);
  next();
});

export default router;
