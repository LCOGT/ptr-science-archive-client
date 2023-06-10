import Vue from 'vue';
import Vuex from 'vuex';
import $ from 'jquery';

Vue.use(Vuex);

const EMPTY_PROFILE_DATA = {
  username: '',
  profile: {
    proposals: []
  }
};

export default new Vuex.Store({
  state: {
    archiveToken: '',
    userIsAuthenticated: false,
    profile: EMPTY_PROFILE_DATA,
    urls: {}
  },
  mutations: {
    setRuntimeConfig(state, payload) {
      state.urls = payload;
    },
    setProfileData(state, payload) {
      state.profile = payload;
      this.commit('setUserIsAuthenticated', payload);
    },
    setUserIsAuthenticated(state, profileData) {
      if (profileData.username) {
        state.userIsAuthenticated = true;
      } else {
        state.userIsAuthenticated = false;
      }
    },
    setArchiveToken(state, token) {
      state.archiveToken = token;
    },
    initializeArchiveToken(state) {
      let storedArchiveToken = localStorage.getItem('archiveToken');
      if (storedArchiveToken) {
        state.archiveToken = storedArchiveToken;
      }
    },
    initializeStaffDataInspector(state) {
      state.inspectorViewEnabled = localStorage.getItem('staff-inspector-view') ? true : false;
    },
    toggleStaffDataInspector(state) {
      state.inspectorViewEnabled = state.inspectorViewEnabled ? false : true;
    }
  },
  actions: {
    getArchiveToken(context, credentials) {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: context.state.urls.observationPortalApiUrl + '/api-token-auth/',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            username: credentials.username,
            password: credentials.password
          })
        })
          .done(function(response) {
            localStorage.setItem('archiveToken', response.token);
            resolve(response);
          })
          .fail(function(response) {
            reject(response);
          });
      });
    },
    removeArchiveToken() {
      localStorage.removeItem('archiveToken');
    },
    getProfileData(context) {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: context.state.urls.archiveApiUrl + '/profile/',
          success: function(response) {
            context.commit('setProfileData', response);
            resolve(response);
          },
          error: function(response) {
            context.commit('setProfileData', EMPTY_PROFILE_DATA);
            if (response.status === 403) {
              // User is not authenticated, but that is ok
              resolve(response);
            } else {
              reject(response);
            }
          }
        });
      });
    }
  },
  modules: {}
});
