<template>
  <b-table
    :items="data"
    :fields="fields"
    selectable
    selected-variant=""
    :busy="!dataLoaded"
    show-empty
    hover
    @row-clicked="$emit('clicked-related-frame', $event)"
  >
    <template #cell(selected)="row">
      <b-form-checkbox :checked="itemInSelectedItems(row.item.id)" @change="$emit('checked-related-frame', row, $event)" />
    </template>
    <template #table-busy>
      <div class="text-center my-2"><i class="fa fa-spin fa-spinner" /> Loading data, please wait...</div>
    </template>
    <template #empty>
      <div class="text-center">No matching records found</div>
    </template>
  </b-table>
</template>
<script>
import { itemInList } from '@/util.js';
import { OCSMixin } from 'ocs-component-lib';

export default {
  name: 'RelatedFramesTable',
  mixins: [OCSMixin.getDataListMixin],
  props: {
    frameId: {
      type: [String, Number],
      required: true,
      default: () => {
        return '';
      }
    },
    selectedItems: {
      type: Array,
      required: false,
      default: () => {
        return [];
      }
    }
  },
  data: function() {
    return {
      fields: [
        {
          key: 'selected',
          label: ''
        },
        {
          key: 'basename',
          label: 'Basename'
        },
        {
          key: 'configuration_type',
          label: 'Type'
        }
      ]
    };
  },
  methods: {
    initializeDataEndpoint: function() {
      return `${this.$store.state.urls.archiveApiUrl}/frames/${this.frameId}/related/`;
    },
    itemInSelectedItems: function(item) {
      return itemInList(this.selectedItems, item);
    }
  }
};
</script>
