import Vue from 'vue';

import MainApp from './components/MainApp.vue';
import Router from './router.js';

new Vue({
  router: Router.getRouter(),
  el: '#app',
  components: {
    'main-app': MainApp
  },
  template: '<main-app></main-app>'
});
