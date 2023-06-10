<template>
  <div>
    <b-modal :id="modalId" title="Headers" size="lg" hide-footer>
      <ocs-data-loader :data-load-error="dataLoadError" :data-not-found="dataNotFound" :data-loaded="dataLoaded">
        <template #data-load-error>
          <div>Could not load headers</div>
        </template>
        <template #not-found>
          <div>Could not load headers</div>
        </template>
        <b-row v-for="header in sortedHeaders" :key="header.key">
          <b-col class="text-right font-weight-bold">{{ header.key }}</b-col>
          <b-col class="text-break">{{ header.value }}</b-col>
        </b-row>
      </ocs-data-loader>
    </b-modal>
  </div>
</template>
<script>
import _ from 'lodash';
import { OCSMixin } from 'ocs-component-lib';

export default {
  name: 'HeadersModal',
  mixins: [OCSMixin.getDataMixin],
  props: {
    modalId: {
      type: String,
      required: true
    },
    frameId: {
      type: [String, Number],
      required: true
    }
  },
  computed: {
    sortedHeaders: function() {
      let headers = [];
      if (this.data) {
        for (let header in this.data.data) {
          headers.push({ key: header, value: this.data.data[header] });
        }
      }
      return _.sortBy(headers, 'key');
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      return `${this.$store.state.urls.archiveApiUrl}/frames/${this.frameId}/headers/`;
    }
  }
};
</script>
