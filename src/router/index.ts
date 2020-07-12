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
    .finally(PageLoading());
}

const routes: Array<RouteConfig> = [
  { path: '/', name: 'Index', component: Index },
  { path: '/About', name: 'About', component: (s, j) => AsyncLoader(s, j, import('@/views/About.vue')) },
  { path: '/Analysis', name: 'Analysis', component: (s, j) => AsyncLoader(s, j, import('@/views/Analysis.vue')) },
  { path: '/Friend', name: 'Friend', component: (s, j) => AsyncLoader(s, j, import('@/views/Friend.vue')) },
];

const router = new VueRouter({
  routes,
});

export default router;
