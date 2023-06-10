<template>
  <b-form-group id="input-group-point" class="my-0">
    <template #label>
      <b>Point</b>
      <sup
        v-b-tooltip.hover.right
        class="blue"
        title="Searching by point is usually the most effective method as it will find
        all frames containing an RA/Dec independent of the name given in the OBJECT header. This will not work for solar
        system objects. Sexagesimal or degrees. You may also click the magnification glass to fetch RA/Dec from online
        sources (such as SIMBAD or NED) by object name."
      >
        ?
      </sup>
    </template>
    <b-input-group>
      <b-form-input v-model="objectName" placeholder="Search sources" class="border-secondary my-0"></b-form-input>
      <b-input-group-append>
        <b-button :disabled="!objectName || lookup.isBusy" variant="outline-secondary" @click="lookupTarget"><i class="fas fa-search"></i></b-button>
      </b-input-group-append>
    </b-input-group>
    <b-form-text v-if="lookup.status" id="text-lookup-status" class="my-0">{{ lookup.status }}</b-form-text>
    <b-form-input v-model="point.x" placeholder="RA" class="border-secondary my-1" @input="onPointUpdate"></b-form-input>
    <b-form-input v-model="point.y" placeholder="Dec" class="border-secondary my-1" @input="onPointUpdate"></b-form-input>
    <b-form-text v-if="coordinatesFeedback" id="text-coordinates-feedback" class="my-1">{{ coordinatesFeedback }}</b-form-text>
  </b-form-group>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';
import { wktToGeoJSON } from '@terraformer/wkt';
import { OCSUtil } from 'ocs-component-lib';

export default {
  name: 'TargetLookup',
  props: {
    // This should be a valid WTK representation of GeoJSON
    value: {
      type: String,
      required: true
    }
  },
  data: function() {
    return {
      objectName: '',
      lookup: {
        status: '',
        isBusy: false
      },
      coordinatesFeedback: '',
      point: this.parsePoint()
    };
  },
  methods: {
    parsePoint: function() {
      let point = { x: '', y: '' };
      if (this.value) {
        try {
          let geoJson = wktToGeoJSON(this.value);
          point = {
            x: geoJson.coordinates[0].toString(),
            y: geoJson.coordinates[1].toString()
          };
        } catch {
          console.log('Unable to parse GeoJSON from the WTK representation');
        }
        return point;
      } else {
        return point;
      }
    },
    lookupTarget: function() {
      this.setLookupStatus('');
      if (this.objectName) {
        this.lookup.isBusy = true;
        this.setLookupStatus(`Searching for target ${this.objectName}`);
        $.ajax({
          url: `${this.$store.state.urls.simbadServiceUrl}/${this.objectName}`
        })
          .done(response => {
            if (response.error) {
              this.setLookupStatus(response.error);
            } else {
              this.setLookupStatus('');
              this.point.x = response.ra.replace(/ /g, ':');
              this.point.y = response.dec.replace(/ /g, ':');
              this.onPointUpdate();
            }
          })
          .fail(() => {
            this.setLookupStatus('Unable to find target from lookup service');
          })
          .always(() => {
            this.lookup.isBusy = false;
          });
      }
    },
    getPointAsDecimal: function() {
      let x = OCSUtil.sexagesimalRaToDecimal(this.point.x);
      let y = OCSUtil.sexagesimalDecToDecimal(this.point.y);
      // Do not run _.toNumber if empty string since empty strings are interpreted as zeros.
      if (x !== '') x = _.toNumber(x);
      if (y !== '') y = _.toNumber(y);
      return { x: x, y: y };
    },
    setLookupStatus: _.debounce(function(status) {
      // Use debouce to smooth out how often the displayed text is rendered
      this.lookup.status = status;
    }, 100),
    onPointUpdate: _.debounce(function() {
      // Emit a WTK POINT representation that will go into the url for the `covers` param
      let pointAsDecimal = this.getPointAsDecimal();
      // Both x and y must be valid numbers to make a valid WTK POINT representation.
      if (!_.isNaN(pointAsDecimal.x) && !_.isNaN(pointAsDecimal.y) && _.isNumber(pointAsDecimal.x) && _.isNumber(pointAsDecimal.y)) {
        this.coordinatesFeedback = '';
        this.$emit('input', `POINT(${pointAsDecimal.x} ${pointAsDecimal.y})`);
      } else {
        this.coordinatesFeedback = 'Please enter valid coordinates to use a point search. Both RA and Dec must be set.';
        // If coordinates are invalid, do not add a WTK POINT to the URL param
        this.$emit('input', null);
      }
    }, 500)
  }
};
</script>
