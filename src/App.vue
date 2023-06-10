<template>
  <div id="app" class="d-flex flex-column h-100">
    <div>
      <b-navbar toggleable="lg" variant="dark-blue" type="dark">
        <b-navbar-brand :href="this.$store.state.urls.navbarBrandUrl">
          <b-img class="brand-image-small d-inline-block align-top d-lg-none"
            :src="this.$store.state.urls.brandImageSmall"
            :alt="this.$store.state.urls.brandImageAltText" />
          <b-img class="brand-image-large align-top d-none d-lg-inline-block"
            :src="this.$store.state.urls.brandImageLarge"
            :alt="this.$store.state.urls.brandImageAltText" />
          <div id="name-large" class="name text-left pl-2 align-top d-none d-lg-inline-block">DataLab<br />Archive</div>
          <div id="name-small" class="name text-left pl-2 align-top d-inline-block d-lg-none">DataLab<br />Archive</div>
          <div class="verticalLine d-inline-flex align-top pl-2" v-if="dataInspectorViewEnabled"></div>
          <div id="name-large" class="name text-left pl-2 align-top d-none d-lg-inline-block" v-if="dataInspectorViewEnabled">Data<br />Inspector</div>
          <div id="name-small" class="name text-left pl-2 align-top d-inline-block d-lg-none" v-if="dataInspectorViewEnabled">Data<br />Inspector</div>
        </b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav>
            <b-nav-item :href="this.$store.state.urls.documentationUrl">Documentation</b-nav-item>
            <b-nav-item :href="this.$store.state.urls.archiveApiUrl">API</b-nav-item>
            <b-nav-item :href="this.$store.state.urls.organizationHomepageUrl">{{ this.$store.state.urls.organizationHomepageText }}</b-nav-item>
            <b-nav-item :href="this.$store.state.urls.networkMonitoringPortalUrl" v-if="dataInspectorViewEnabled">Network Monitoring Portal</b-nav-item>
            <b-nav-item :href="this.$store.state.urls.roguesGalleryUrl" v-if="dataInspectorViewEnabled">Rogue's Gallery</b-nav-item>
            <!--<template v-if="userIsAuthenticated">
              <hr class="w-100 d-lg-none border-light" />
              <b-nav-text class="d-lg-none">
                <i class="fas fa-user-alt"></i> <span class="font-weight-bold">{{ profile.username }}</span>
              </b-nav-text>
              <b-nav-item class="d-lg-none" @click="logout">Logout</b-nav-item>
            </template>
            <template v-else>
              <b-nav-item class="d-lg-none" :to="{ name: 'Login' }">Login</b-nav-item>
            </template>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto">
            <b-nav-item-dropdown v-if="userIsAuthenticated" class="d-none d-lg-block" right>
              <template #button-content>
                <i class="fas fa-user-alt"></i>
              </template>
              <b-dropdown-text>
                Logged in as <span class="font-weight-bold">{{ profile.username }}</span>
              </b-dropdown-text>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item @click="logout">Logout</b-dropdown-item>
              <b-dropdown-form v-if="userIsStaff">
                <b-dropdown-divider></b-dropdown-divider>
                <b-form-checkbox
                v-model="dataInspectorViewEnabled">Staff Data Inspector View</b-form-checkbox>
              </b-dropdown-form>
            </b-nav-item-dropdown>
            <b-nav-item v-else class="d-none d-lg-block" :to="{ name: 'Login' }">Login</b-nav-item>-->
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
    </div>
    <b-alert v-if="userIsAuthenticatedAndNotMemberOfProposals" variant="info" dismissible>
      <div>You are not a member of any proposals. Only public data will be shown.</div>
    </b-alert>
    <b-container :fluid="dataInspectorViewEnabled" class="flex-shrink-0 px-5 py-1">
      <router-view class="my-3" />
    </b-container>
    <ArchiveFooter
      :copyright-organization="this.$store.state.urls.copyrightOrganization"
      :terms-of-service-url="this.$store.state.urls.termsOfServiceUrl"
      :privacy-policy-url="this.$store.state.urls.privacyPolicyUrl"
      :feedback-email="this.$store.state.urls.feedbackEmail"
      :github-api-url="this.$store.state.urls.githubApiUrl"
      :science-archive-api-url="this.$store.state.urls.archiveApiUrl"
      :api-documentation-url="this.$store.state.urls.apiDocumentationUrl"
      :general-documentation-url="this.$store.state.urls.generalDocumentationUrl" />
  </div>
</template>
<script>
import ArchiveFooter from '@/components/ArchiveFooter.vue';

export default {
  name: 'App',
  components: {
    ArchiveFooter
  },
  computed: {
    profile: function() {
      return this.$store.state.profile;
    },
    userIsAuthenticated: function() {
      return this.$store.state.userIsAuthenticated;
    },
    userIsAuthenticatedAndNotMemberOfProposals: function() {
      return this.userIsAuthenticated && this.profile.profile.proposals.length < 1;
    },
    userIsStaff: function() {
      return this.$store.state.profile.is_staff;
    },
    dataInspectorViewEnabled: {
      get: function() {
        return this.userIsStaff && this.$store.state.inspectorViewEnabled;
      },
      set: function() {
        if (localStorage.getItem('staff-inspector-view')) {
          localStorage.removeItem('staff-inspector-view');
        }
        else {
          localStorage.setItem('staff-inspector-view', true);
        }
        this.$store.commit('toggleStaffDataInspector');
        // set the query params properly before reload
        this.$router.replace({ path: "/", params: { exclude_calibrations : localStorage.getItem('staff-inspector-view') ? false : true }});
        location.reload();
      }
    }
  },
  methods: {
    logout: function() {
      this.$store.dispatch('removeArchiveToken').then(() => {
        window.location = window.location.href.split('?')[0];
      });
    }
  }
};
</script>
<style scoped>
.verticalLine {
  border-right: 4px solid #ffcd05;
  height: 48px;
}
.brand-image-large {
  max-height: 50px;
}
.brand-image-small {
  max-height: 45px;
}
.name {
  font-family: 'Heebo', sans-serif;
}
#name-large {
  font-size: 1.2rem;
}
#name-small {
  font-size: 1rem;
}
.basic-small {
  font-size: 0.6rem;
}
</style>
