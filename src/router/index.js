import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
//import NotFound from '../components/NotFound.vue';
import store from '../store';
import ArchiveDataTable from '@/components/ArchiveDataTable.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    beforeEnter: (to, from, next) => {
      // if the route contains a public parameter, honor that
      if (to.query.public != undefined || to.query.exclude_calibrations != undefined) {
        next();
        return;
      }

      // otherwise send authenticated users to public=false
      // and unauthenticated users to public=true
      if (store.state.userIsAuthenticated) {
        let query = {...to.query, public: "false"};
        // make sure we set the include_configuration_type correctly based on the DQI setting
        query.exclude_calibrations = store.state.inspectorViewEnabled ? false : true;
        next({ name: 'Home', query: query});
      } else {
        // anonymous users should only see public data and science data by default
          next({ name: 'Home', query: {...to.query, public: "true", exclude_calibrations: "true"}});
      }
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '*',
    name: 'Not archive',
    component: ArchiveDataTable
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
