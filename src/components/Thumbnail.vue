<template>
  <ocs-data-loader :data-load-error="dataLoadError" :data-not-found="dataNotFound" :data-loaded="dataLoaded">
    <template #data-load-error>
      <div>Could not load thumbnail</div>
    </template>
    <template #not-found>
      <div>Could not load thumbnail</div>
    </template>
    <b-img :src="data.url" :alt="'Thumbnail for frame' + frameId" center thumbnail></b-img>
  </ocs-data-loader>
</template>
<script>
import { OCSMixin } from 'ocs-component-lib';

export default {
  name: 'Thumbnail',
  mixins: [OCSMixin.getDataMixin],
  props: {
    frameId: {
      type: [String, Number],
      required: true
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      return `${this.$store.state.urls.thumbnailServiceUrl}/${this.frameId}/?width=300`;
    }
  }
};
</script>
