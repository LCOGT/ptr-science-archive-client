<template>
  <div>
    <b-modal class="color-red" :id="modalIdLink" title="Direct Link" size="lg" hide-footer>
      <b-row>
        <!-- Use a computed property to access the frameURL prop -->
        <b-col class="text-left">{{ modalIdLink }}</b-col>
      </b-row>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'LinkModal',
  props: {
    modalIdLink: {
      type: String,
      required: true
    },
    frameURL: {
      type: [String, Number],
      required: true
    }
  },
  computed: {
    computedFrameURL() {
      return this.frameURL;
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      return `${this.frame.url}`;
    }
  }
};
</script>
