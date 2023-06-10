<template>
  <div>
    <slot name="label">{{ label }}</slot>
    <b-dropdown block class="my-0" menu-class="menu" boundary="viewport" variant="outline-secondary">
      <template #button-content>
        <span>{{ currentOptionLabel | truncate }}</span>
      </template>
      <b-dropdown-item v-for="option in options" :key="option.value" :active="value === option.value" @click="onUpdate(option.value)">
        {{ option.text }}
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>
<script>
import _ from 'lodash';

export default {
  name: 'AggregatedOptionsSelect',
  filters: {
    truncate: function(value) {
      return _.truncate(value, { length: 18 });
    }
  },
  props: {
    // List of objects where each object contains `text` and `value`
    options: {
      type: Array,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: ''
    }
  },
  computed: {
    currentOptionLabel: function() {
      for (let option of this.options) {
        if (option.value === this.value) {
          return option.text;
        }
      }
      return '';
    }
  },
  methods: {
    onUpdate: function(value) {
      this.$emit('input', value);
    }
  }
};
</script>
<style>
.menu {
  max-height: 200px;
  overflow-y: scroll;
}
</style>
