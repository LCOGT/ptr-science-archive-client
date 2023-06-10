import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import BootstrapVue from 'bootstrap-vue';
import { OCSComponentLib } from 'ocs-component-lib';
import '@/assets/scss/app.scss';
import $ from 'jquery';

Vue.use(BootstrapVue);
Vue.use(OCSComponentLib);

Vue.config.productionTip = false;

$.ajax({
  method: 'GET',
  url: '/config/config.json'
}).done(function(data) {
  store.commit('setRuntimeConfig', {
    // default to the environment variable if present, else use the data in urls.json
    //observationPortalApiUrl: process.env.VUE_APP_OBSERVATION_PORTAL_API_URL || data.observationPortalApiUrl,
    archiveApiUrl: process.env.VUE_APP_ARCHIVE_API_URL || data.archiveApiUrl,
    simbadServiceUrl: process.env.VUE_APP_SIMBAD_SERVICE_URL || data.simbadServiceUrl,
    thumbnailServiceUrl: process.env.VUE_APP_THUMBNAIL_SERVICE_URL || data.thumbnailServiceUrl,
    navbarBrandUrl: process.env.VUE_APP_NAVBAR_BRAND_URL || data.navbarBrandUrl,
    brandImageLarge: process.env.VUE_APP_BRAND_IMAGE_LARGE || data.brandImageLarge,
    brandImageSmall: process.env.VUE_APP_BRAND_IMAGE_SMALL || data.brandImageSmall,
    brandImageAltText: process.env.VUE_APP_BRAND_IMAGE_ALT_TEXT || data.brandImageAltText,
    documentationUrl: process.env.VUE_APP_DOCUMENTATION_URL || data.documentationUrl,
    organizationHomepageUrl: process.env.VUE_APP_ORGANIZATION_HOMEPAGE_URL || data.organizationHomepageUrl,
    organizationHomepageText: process.env.VUE_APP_ORGANIZATION_HOMEPAGE_TEXT || data.organizationHomepageText,
    copyrightOrganization: process.env.VUE_APP_COPYRIGHT_ORGANIZATION || data.copyrightOrganization,
    termsOfServiceUrl: process.env.VUE_APP_TERMS_OF_SERVICE_URL || data.termsOfServiceUrl,
    privacyPolicyUrl: process.env.VUE_APP_PRIVACY_POLICY_URL || data.privacyPolicyUrl,
    feedbackEmail: process.env.VUE_APP_FEEDBACK_EMAIL || data.feedbackEmail,
    githubApiUrl: process.env.VUE_APP_GITHUB_API_URL || data.githubApiUrl,
    apiDocumentationUrl: process.env.VUE_APP_API_DOCUMENTATION_URL || data.apiDocumentationUrl,
    generalDocumentationUrl: process.env.VUE_APP_GENERAL_DOCUMENTATION_URL || data.generalDocumentationUrl,
    networkMonitoringPortalUrl: process.env.NETWORK_MONITORING_PORTAL_URL || data.networkMonitoringPortalUrl,
    roguesGalleryUrl: process.env.ROGUES_GALLERY_URL || data.roguesGalleryUrl
  });

  // Add the archive token to a request being sent to the archive api or the thumbservice
  $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
    if (
      (options.url.startsWith(store.state.urls.archiveApiUrl) || options.url.startsWith(store.state.urls.thumbnailServiceUrl)) &&
      store.state.archiveToken
    ) {
      jqXHR.setRequestHeader('Authorization', 'Token ' + store.state.archiveToken);
    }
  });

  // Initialize archive token if it is available in local storage already
  store.commit('initializeArchiveToken');

  // Initialize the data inspector state based on local storage
  store.commit('initializeStaffDataInspector');

  store
    .dispatch('getProfileData')
    .then(() => {
      new Vue({
        router,
        store,
        render: h => h(App)
      }).$mount('#app');
    })
    .catch(() => {
      // TODO: Display error page
      console.log('Error getting profile data');
    });
});
