<template>
  <b-row>
    <b-col md="8" cols="12">
      <h5>Calibration and Catalog Frames</h5>
      <related-frames-table :frame-id="frame.id" :selected-items="selectedItems" v-on="$listeners" />
    </b-col>
    <b-col md="4" cols="12">
      <frame-data :frame-id="frame.id" v-if="dataInspectorViewEnabled"></frame-data>
      <b-button v-b-modal="modalId" variant="outline-secondary" class="my-1" block>View Headers</b-button>
      <!--<b-button variant="outline-secondary" class="my-1" @click="sendtoPIXLR" block>Send image to PIXLR</b-button>-->
      <b-button v-b-modal="modalIdLink" variant="outline-secondary" class="my-1" block @click="openLinkModal">Show direct link to file</b-button>
      <b-button variant="outline-secondary" class="my-1" v-if="dataInspectorViewEnabled" @click="openJS9" block>Open FITS in JS9</b-button>
      <headers-modal :modal-id="modalId" :frame-id="frame.id" />
      <link-modal :modal-id-link="modalIdLink" :frame-url="frame.url" />
      <thumbnail v-if="hasThumbnail" :frame-id="frame.id"></thumbnail>
      <div v-else>No preview available for this filetype</div>
    </b-col>
  </b-row>
</template>
<script>
import Thumbnail from '@/components/Thumbnail.vue';
import RelatedFramesTable from '@/components/RelatedFramesTable.vue';
import HeadersModal from '@/components/HeadersModal.vue';
import LinkModal from '@/components/LinkModal.vue';
import FrameData from '@/components/FrameData.vue';
/*import ReductionLevels from '@/components/ArchiveDataTable.vue';*/

export default {
  name: 'FrameDetail',
  components: {
    Thumbnail,
    RelatedFramesTable,
    HeadersModal,
    FrameData,
    LinkModal,
},
  props: {
    frame: {
      type: Object,
      required: true
    },
    obstype: {
      type: String,
      required: true
    },
    selectedItems: {
      type: Array,
      required: false,
      default: () => {
        return [];
      }
    }
  },
  computed: {
    hasThumbnail: function() {
      return ['EXPOSE', 'DARK', 'SKYFLAT', 'BIAS', 'STANDARD', 'SPECTRUM', 'ARC', 'LAMPFLAT'].indexOf(this.obstype) >= 0;
    },
    modalId: function() {
      return `modal-id-${this.frameId}`;
    },
    userIsStaff: function() {
      return this.$store.state.profile.is_staff;
    },
    dataInspectorViewEnabled: function() {
      return this.userIsStaff && this.$store.state.inspectorViewEnabled;
    },
    modalIdLink: function() {
      return `${this.frame.url}`;
    },
    /*reductionlevelIF: function() {
      return this.reductionLevelOptions=='TIF';
    },*/
  },
  methods: {
    openJS9: function () {
      // Open in a new window
      var opts = {
        scaleclipping: 'zscale',
        zoom: 'toFit',
        id: 'MyJS9' + '_' + this.frame.id,
        // By default, images are restricted to 2048 by 2048. Set xdim and ydim to 0 for no restriction.
        image: {
          xdim: 0,
          ydim: 0
        }
      };
      if (this.frame.INSTRUME.indexOf('fl') > -1 || this.frame.INSTRUME.indexOf('fa') > -1) {
        // Use second extension for multi-extension fits
        opts.extension = 1;
      }
      JS9.LoadWindow(this.frame.url, opts, 'new');
    },
    sendtoPIXLR: function(){
      /*PIXLR.LoadWindow(this.frame.url, 'new');*/
      window.open('https://pixlr.com/e/?image='+this.frame.url,'_blank');
      
    },
    openLinkModal: function() {
      this.$root.$emit('open-link-modal', this.frame.url);
    },
  }
};
</script>
