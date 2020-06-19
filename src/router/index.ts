import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Index from '@/views/Index.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  { path: '/', name: 'Index', component: Index },
  { path: '/About', name: 'About', component: () => import('@/views/About.vue') },
  { path: '/Friend', name: 'Friend', component: () => import('@/views/Friend.vue') },
];

const router = new VueRouter({
  routes,
});

export default router;
