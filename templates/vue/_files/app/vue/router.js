import Vue from 'vue';
import VueRouter from 'vue-router';

import HomePage from './pages/HomePage.vue';
import TestPage from './pages/TestPage.vue';

Vue.use(VueRouter);

let router = new VueRouter({
  mode: 'hash',
  base: __dirname,
  routes: [
    {
      path: '/',
      component: HomePage
    },
    {
      path: '/test',
      component: TestPage
    }
  ]
});

export default {
  getRouter: () => {
    return router;
  }
};
