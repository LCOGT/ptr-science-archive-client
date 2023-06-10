<template>
  <div>
    <slot name="label"
      ><b>{{ label }}</b></slot
    >
    <b-dropdown block class="my-1" menu-class="menu" boundary="viewport" variant="outline-secondary">
      <template #button-content>
        <span v-if="value">{{ value | truncate }}</span>
        <span v-else>{{ allOptionText | truncate }}</span>
      </template>
      <b-dropdown-form form-class="px-1">
        <b-form-input v-model="filterOptionsBy"></b-form-input>
      </b-dropdown-form>
      <b-dropdown-item href="#" :active="value === allValue" @click="onUpdate(allValue)">{{ allOptionText }}</b-dropdown-item>
      <slot name="first">
        <b-dropdown-group v-if="placeFirstOptionsInGroup && filteredFirstOptions.length > 0" :header="firstOptionGroupLabel">
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item v-for="option in filteredFirstOptions" :key="option" :active="value === option" @click="onUpdate(option)">
            {{ option }}
          </b-dropdown-item>
        </b-dropdown-group>
        <template v-else-if="filteredFirstOptions.length > 0">
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item v-for="option in filteredFirstOptions" :key="option" :active="value === option" @click="onUpdate(option)">
            {{ option }}
          </b-dropdown-item>
        </template>
      </slot>
      <b-dropdown-divider></b-dropdown-divider>
      <b-dropdown-group v-if="placeInOptionGroup" :header="optionGroupLabel">
        <b-dropdown-item v-for="available in filteredOptions.available" :key="available" :active="value === available" @click="onUpdate(available)">
          {{ available }}
        </b-dropdown-item>
        <b-dropdown-divider></b-dropdown-divider>
        <b-dropdown-item
          v-for="unavailable in filteredOptions.unavailable"
          :key="unavailable"
          :active="value === unavailable"
          link-class="text-muted"
          @click="onUpdate(unavailable)"
        >
          {{ unavailable }}
        </b-dropdown-item>
      </b-dropdown-group>
      <template v-else>
        <b-dropdown-item v-for="available in filteredOptions.available" :key="available" :active="value === available" @click="onUpdate(available)">
          {{ available }}
        </b-dropdown-item>
        <b-dropdown-divider></b-dropdown-divider>
        <b-dropdown-item
          v-for="unavailable in filteredOptions.unavailable"
          :key="unavailable"
          :active="value === unavailable"
          link-class="text-muted"
          @click="onUpdate(unavailable)"
        >
          {{ unavailable }}
        </b-dropdown-item>
      </template>
    </b-dropdown>
  </div>
</template>
<script>
import _ from 'lodash';

export default {
  name: 'AggregatedOptionsSelect',
  filters: {
    truncate: function(value) {
      return _.truncate(value, { length: 12 });
    }
  },
  props: {
    options: {
      type: Object,
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
    },
    placeInOptionGroup: {
      type: Boolean
    },
    optionGroupLabel: {
      type: String,
      default: 'Options'
    },
    allOptionText: {
      type: String,
      default: 'All'
    },
    firstOptions: {
      type: Array,
      default: () => {
        return [];
      }
    },
    placeFirstOptionsInGroup: {
      type: Boolean
    },
    firstOptionGroupLabel: {
      type: String,
      default: ''
    }
  },
  data: function() {
    return {
      // Value used for the `All` option
      allValue: '',
      filterOptionsBy: ''
    };
  },
  computed: {
    filteredOptions: function() {
      let options = { available: [], unavailable: [] };
      for (let state of ['available', 'unavailable']) {
        for (let opt of this.options[state]) {
          if (_.includes(_.toUpper(opt), _.toUpper(this.filterOptionsBy))) {
            options[state].push(opt);
          }
        }
      }
      return options;
    },
    filteredFirstOptions: function() {
      let options = [];
      for (let opt of this.firstOptions) {
        if (_.includes(_.toUpper(opt), _.toUpper(this.filterOptionsBy))) {
          options.push(opt);
        }
      }
      return options;
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
