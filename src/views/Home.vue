<template>
  <ocs-data-loader :data-loaded="dataLoaded" :data-load-error="dataLoadError" :data-not-found="dataNotFound">
    <template #data-load-error>
      <archive-data-table />
    </template>
    <template #not-found>
      <archive-data-table />
    </template>
    <archive-data-table :semesters="data.results" />
  </ocs-data-loader>
</template>

<script>
import moment from 'moment';
import { OCSMixin } from 'ocs-component-lib';
import ArchiveDataTable from '@/components/ArchiveDataTable.vue';

export default {
  name: 'Home',
  components: {
    ArchiveDataTable
  },
  mixins: [OCSMixin.getDataMixin],
  methods: {
    initializeDataEndpoint: function() {
      let now = moment.utc().format('YYYY-MM-DD HH:mm');
      return `${this.$store.state.urls.observationPortalApiUrl}/semesters/?start_lte=${now}`;
    }
  }
};
</script>
