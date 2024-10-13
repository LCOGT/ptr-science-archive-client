<template>
  <b-row>
    <b-modal id="bv-modal-alert" hide-footer>
      <div class="d-block text-center">
        {{ alertModalMessage }}
      </div>
    </b-modal>
    <b-col :md="sidebarWidth">
      <b-form @submit="onSubmit" @reset="onReset">
        <b-form-group id="input-group-daterange" class="my-1">
          <date-picker 
            v-model=selectedTimeRange 
            range
            :clearable="false"
            ref="datePicker"
            format='YYYY-MM-DD'
            @change="onDatePickerChange"
            :shortcuts = "datepickerShortcuts"
            >
            <template v-slot:input>
              <div id="date-range-picker" class="border border-secondary rounded p-1 w-100 text-center">
                Data loaded for:<br />
                <i class="far fa-calendar"></i> {{ queryParams.start }} <br />
                <i class="fas fa-caret-down"></i> {{ queryParams.end }}
              </div>
            </template>
          </date-picker>
        </b-form-group>
        <aggregated-options-select
          id="proposals"
          v-model="queryParams.proposal_id"
          :options="categorizedAggregatedOptions.proposals"
          place-in-option-group
          option-group-label="Public proposals"
          place-first-options-in-group
          first-option-group-label="My proposals"
          :first-options="profileProposals"
          @input="refreshData"
        >
          <template #label><b> Proposal </b><sup v-b-tooltip.hover.right class="blue" title="Log in to view your proposals">?</sup> </template>
        </aggregated-options-select>
<!--         <b-form-group id="input-group-science-data" class="my-0">
          <b-form-checkbox
            id="checkbox-science-data"
            v-model="viewOnlyScienceData"
            name="checkbox-science-data"
          >
            View only science data
            <sup v-b-tooltip.hover.right class="blue" title="Science data excludes all calibration data">
              ?
            </sup>
          </b-form-checkbox>
        </b-form-group>
        <b-form-group id="input-group-public" class="my-0">
          <b-form-checkbox
            id="checkbox-public"
            v-model="queryParams.public"
            name="checkbox-public"
            value="true"
            unchecked-value="false"
            @input="refreshData"
          >
            Include public data
            <sup v-b-tooltip.hover.right class="blue" title="This will include all public data that is beyond its proprietary period and not a part of any of your proposals.">
              ?
            </sup>
          </b-form-checkbox>
        </b-form-group> -->
        <b-form-group id="user-id">
          <template #label>
            <b>User ID</b
            ><sup
              v-b-tooltip.hover.right
              class="blue"
              title="Search by User ID"
              >?</sup
            >
          </template>
          <b-form-input v-model="userID" type="text" class="border-secondary my-0"></b-form-input>
        </b-form-group>
        <b-form-group id="input-group-basename" class="my-1">
          <template #label>
            <b>Image Name</b>
            <sup v-b-tooltip.hover.right class="blue" title="Image name does not include file extension">
              ?
            </sup>
          </template>
          <b-form-input v-model="imageName" class="border-secondary my-0"></b-form-input>
        </b-form-group>
        <target-lookup v-model="queryParams.covers" @input="refreshData" />
        <b-form-group id="input-group-object" class="my-1">
          <template #label>
            <b>Object</b>
            <sup
              v-b-tooltip.hover.right
              class="blue"
              title="As written to FITS header. Not an exact match: returns all frames
              with the given text included in the OBJECT header."
            >
              ?
            </sup>
          </template>
          <b-form-input v-model="objectName" class="border-secondary my-0"></b-form-input>
        </b-form-group>
        <aggregated-options-select
          id="obstypes"
          v-model="queryParams.configuration_type"
          label="Observation Type"
          :options="categorizedAggregatedOptions.obstypes"
          @input="onConfigurationTypeInput"
        />
        <b-form-group id="input-group-rlevel" class="my-1">
          <template #label>
            <b>Reduction Level</b>
          </template>
          <template #description>
            See <a href="https://lco.global/documentation/archive-documentation/#products" target="blank">documentation
            on reduction levels</a>.
          </template>
          <simple-select
            id="input-rlevel"
            v-model="selectedReductionLevel"
            :options="reductionLevelOptions"
            @input="refreshData">
          </simple-select>
        </b-form-group>
        <aggregated-options-select
          id="sites"
          v-model="queryParams.site_id"
          label="Site"
          :options="categorizedAggregatedOptions.sites"
          @input="refreshData"
        />
        <aggregated-options-select
          id="telescopes"
          v-model="queryParams.telescope_id"
          label="Telescope"
          :options="categorizedAggregatedOptions.telescopes"
          @input="refreshData"
        />
        <aggregated-options-select
          id="instruments"
          v-model="queryParams.instrument_id"
          label="Instrument"
          :options="categorizedAggregatedOptions.instruments"
          @input="refreshData"
        />
        <aggregated-options-select
          id="filters"
          v-model="queryParams.primary_optical_element"
          label="Filter"
          :options="categorizedAggregatedOptions.filters"
          @input="refreshData"
        />
        <b-form-group id="input-group-exposure-time">
          <template #label>
            <b>Exposure Time</b
            ><sup
              v-b-tooltip.hover.right
              class="blue"
              title="Actual exposure time in seconds. Filter results with a greater than or equal value. Value may differ slightly from requested exposure time"
              >?</sup
            >
          </template>
          <b-form-input v-model="exposureTime" type="number" class="border-secondary my-0"></b-form-input>
        </b-form-group>
        <b-button-group class="w-100">
          <b-button type="reset" variant="outline-secondary" :disabled="isBusy">Reset</b-button>
        </b-button-group>
      </b-form>
    </b-col>
    <b-col md="10">
      <b-row class="mb-1">
        <b-col>
          <b-dropdown
            :split-class="{ disabled: selected.length <= 0 || preventDownloadUncompressed() }"
            split
            variant="primary"
            split-href=""
            @click="downloadFiles"
          >
            <template #button-content>Download {{ selected.length }}</template>
            <b-dropdown-form>
              <b-form-group v-slot="{ ariaDescribedby }">
                <!--<b-form-radio
                  v-model="dltype"
                  :disabled="selected.length > maxFunpackedFrames"
                  :aria-describedby="ariaDescribedby"
                  name="dltype"
                  value="zip-uncompressed">
                  zip download (with uncompressed fits files)
                </b-form-radio>
                <b-dropdown-divider />-->
                <b-form-radio v-model="dltype" :aria-describedby="ariaDescribedby" name="dltype" value="zip-compressed">
                  zip download
                </b-form-radio>
                <b-dropdown-divider />
               <!--<b-form-radio
                  v-model="dltype"
                  :aria-describedby="ariaDescribedby"
                  name="dltype"
                  value="zip-catalog"
                >
                  zip download (catalog only)
                </b-form-radio>
                <b-dropdown-divider />--> 
                <b-form-radio v-model="dltype" :aria-describedby="ariaDescribedby" name="dltype" value="wget">wget script</b-form-radio>
                <b-dropdown-divider />
                <b-form-radio v-model="dltype" :aria-describedby="ariaDescribedby" name="dltype" value="framesnumcopy">Copy frame numbers and download CSV file</b-form-radio>
                <b-dropdown-divider />
                <b-form-radio v-model="dltype" :aria-describedby="ariaDescribedby" name="dltype" value="framesnumsagemaker">Download code for Sagemaker</b-form-radio>
              </b-form-group>
            </b-dropdown-form>
          </b-dropdown>
          <b-button :disabled="selected.length <= 0" variant="primary" class="ml-1" v-if="dataInspectorViewEnabled" :href="'archive+ds9://' + ds9LinkSuffix">Open Selected FITS in DS9</b-button>
          <b-button :disabled="selected.length <= 0" variant="primary" class="mx-1" @click="clearSelected" v-b-tooltip.hover title="Clear selected data">
            <template><i class="fa fa-times"/></template>
          </b-button>
        </b-col>
        <b-col class="text-right">
          <b-button-group>
            <b-button variant="outline-secondary" :disabled="expandAllDisabled" @click="expandAll" v-b-tooltip.hover title="Expand all table rows"><i class="fas fa-plus"></i></b-button>
            <b-button variant="outline-secondary" :disabled="expandAllDisabled" @click="collapseAll" v-b-tooltip.hover title="Collapse all table rows"><i class="fas fa-minus"></i></b-button>
            <b-button variant="outline-secondary" @click="refreshData"><i class="fas fa-sync-alt" v-b-tooltip.hover title="Refresh data"></i></b-button>
            <b-dropdown variant="outline-secondary" right v-b-tooltip.hover title="Select/deselect data fields">
              <template #button-content>
                <i class="fas fa-table"></i>
              </template>
              <b-dropdown-form>
                <div v-for="(value, key) in fields" :key="key">
                  <b-form-checkbox
                    v-if="value.hideable"
                    :id="'checkbox-' + value.key"
                    :key="key"
                    v-model="value.hidden"
                    :name="'checkbox-' + value.key"
                    :value="false"
                    :unchecked-value="true"
                    @change="onFieldsChanged"
                  >
                    <span v-if="value.label">{{ value.label }}</span>
                    <span v-else>{{ value.key }}</span>
                  </b-form-checkbox>
                </div>
              </b-dropdown-form>
            </b-dropdown>
            <b-dropdown variant="outline-secondary" right v-b-tooltip.hover title="Export data">
              <template #button-content>
                <i class="fas fa-file-export"></i>
              </template>
              <b-dropdown-item @click="exportTable('json')">JSON</b-dropdown-item>
              <b-dropdown-item @click="exportTable('xml')">XML</b-dropdown-item>
              <b-dropdown-item @click="exportTable('csv')">CSV</b-dropdown-item>
              <b-dropdown-item @click="exportTable('txt')">TXT</b-dropdown-item>
              <b-dropdown-item @click="exportTable('sql')">SQL</b-dropdown-item>
              <b-dropdown-item @click="exportTable('excel')">MS-Excel</b-dropdown-item>
            </b-dropdown>
          </b-button-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <span v-if="preventDownloadUncompressed()">Uncompressed downloads are not permitted with more than {{ maxFunpackedFrames }} files.</span>
        </b-col>
      </b-row>
      <b-table
        id="archive-table"
        ref="archivetable"
        :items="data.results"
        :fields="visibleFields"
        :busy="isBusy"
        small
        :striped="dataInspectorViewEnabled"
        show-empty
        responsive
        selectable
        selected-variant=""
        hover
        sort-direction="desc"
        :sort-by="getSortByFromOrdering()"
        :sort-desc="getSortDescFromOrdering()"
        no-local-sorting
        @sort-changed="onSortingChanged"
        @row-clicked="onRowClicked"
      >
        <template #head(selected)="">
          <b-form-checkbox :checked="ifAllSelected()" @change="onSelectAll" />
        </template>
        <template #cell(selected)="row">
          <b-form-checkbox :checked="itemInSelected(row.item.id)" @change="onRowChecked(row, ...arguments)" />
        </template>
        <template #empty>
          <div v-if="!userIsAuthenticated" class="text-center my-2">
            No matching records found. 
            <!-- You must be logged in to view proprietary data. -->
          </div>
          <div v-else class="text-center my-2">
            No matching records found.
          </div>
        </template>
        <template #table-busy>
          <div class="text-center my-2"><i class="fa fa-spin fa-spinner" /> Loading data, please wait...</div>
        </template>
        <template #cell(showDetails)="row">
          <b-link v-if="row.detailsShowing" @click="row.toggleDetails">
            <i class="fas fa-minus"></i>
          </b-link>
          <b-link v-else @click="row.toggleDetails">
            <i class="fas fa-plus"></i>
          </b-link>
        </template>
        <template #row-details="data">
          <frame-detail
            :frame="data.item"
            :obstype="data.item.configuration_type"
            :selected-items="selected"
            class="p-3"
            @checked-related-frame="onRowChecked(...arguments)"
            @clicked-related-frame="onRowClicked(...arguments)"
          />
        </template>
      </b-table>
      <template v-if="!isBusy && data.count > 0">
        <b-row>
          <b-col>
            <div class="text-right text-muted">
              Showing {{ currentPageRange.start }} to {{ currentPageRange.end }} of {{ data.count }} row{{ data.count === 1 ? '' : 's' }}
            </div>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <ocs-pagination
              table-id="archive-table"
              :per-page="queryParams.limit"
              :total-rows="data.count"
              :current-page="currentPage"
              :display-per-page-dropdown="true"
              :pagination-attrs="{ 'first-number': true, 'last-number': true }"
              :per-page-options="perPageOptions"
              @limitChange="onLimitChange"
              @pageChange="onPageChange"
            />
          </b-col>
        </b-row>
      </template>
    </b-col>
    <!-- This is included for downloading the table data -->
    <script src="https://cdn.lco.global/script/tableExport.min.js" type="application/javascript"></script>
  </b-row>
</template>

<script>
import _ from 'lodash';
import $ from 'jquery';
const Terraformer = require('@terraformer/spatial');
import 'bootstrap-daterangepicker-v2';
import 'bootstrap-daterangepicker-v2/daterangepicker.css';
import { OCSMixin, OCSUtil } from 'ocs-component-lib';
import { DateTime } from 'luxon';
import { itemInList, removeItemFromList } from '@/util.js';
import { downloadZip, downloadWget, downloadFrameNum, downloadFrameNumSageMaker } from '@/download.js';
import AggregatedOptionsSelect from '@/components/AggregatedOptionsSelect.vue';
import SimpleSelect from '@/components/SimpleSelect.vue';
import TargetLookup from '@/components/TargetLookup.vue';
import FrameDetail from '@/components/FrameDetail.vue';
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';

export default {
  name: 'ArchiveDataTable',
  components: {
    AggregatedOptionsSelect,
    SimpleSelect,
    TargetLookup,
    FrameDetail,
    DatePicker,
  },
  mixins: [OCSMixin.paginationAndFilteringMixin],
  props: {
    // List of semesters to be used to generate helpful time ranges for the time filter. The current semester is
    // expected to be the first semester in the array, and the array is expected to be sorted going back in time.
    semesters: {
      type: Array,
      required: false,
      default: () => {
        return [];
      }
    }
  },
  data: function() {
    let filterDateRangeOptions = this.getTimeRangeFilters();
    return {
      dltype: 'zip-uncompressed',
      maxFunpackedFrames: 1000,
      selected: [],
      selectedTimeRange: null,
      filterDateRangeOptions: filterDateRangeOptions,
      alertModalMessage: '',
      perPageOptions: [
        { value: '20', text: '20 rows per page' },
        { value: '50', text: '50 rows per page' },
        { value: '100', text: '100 rows per page' },
        { value: '500', text: '500 rows per page' },
        { value: '1000', text: '1000 rows per page' },
      ],
      reductionLevelOptions: [
        { value: 'All', text: 'All' },
        { value: 'EVA-SmStack', text: 'EVA-SmartStack (e96)' },
        { value: 'EVA-LoStack', text: 'EVA-LongStack (e97)' },
        { value: 'EVA', text: 'EVA (e95)' },
        { value: 'BZESK-SS', text: 'BZESK-SS (e93)' },
        { value: 'BZESK', text: 'BZESK (e92)' },
        { value: 'BANZAI', text: 'BANZAI(e91)' },
        { value: 'SEA', text: 'SEA Photometry (e81)' },
        { value: 'SEK', text: 'SEK Photometry (e82)' },
        { value: 'PSX', text: 'PSX Photometry (e83)' },
        { value: 'TIF', text: 'TIF (e71)' },
        { value: 'JPEG', text: 'JPEG (e72)' },
        { value: 'Small-JPEG', text: 'Small-JPEG (e74)' },
        { value: 'Thumbnails', text: 'Thumbnails (e73)' },
        { value: 'Raw', text: 'Raw' },
      //  { value: 'ORAC', text: 'ORAC' },
      //  { value: 'NRES Commissioning', text: 'NRES Commissioning' },
      //  { value: 'BANZAI', text: 'BANZAI' },
      //  { value: 'BANZAI-NRES', text: 'BANZAI-NRES' },
        
      ],
      categorizedAggregatedOptions: {
        sites: {
          available: [],
          unavailable: []
        },
        instruments: {
          available: [],
          unavailable: []
        },
        telescopes: {
          available: [],
          unavailable: []
        },
        filters: {
          available: [],
          unavailable: []
        },
        obstypes: {
          available: [],
          unavailable: []
        },
        proposals: {
          available: [],
          unavailable: []
        }
      },
      allAggregatedOptions: {
        sites: [],
        instruments: [],
        telescopes: [],
        filters: [],
        obstypes: [],
        proposals: []
      },
      fields: [
        {
          key: 'showDetails',
          label: '',
          tdClass: 'pr-2',
          sortable: false,
          hidden: false
        },
        {
          key: 'selected',
          sortable: false,
          hidden: false
        },
        {
          key: 'basename',
          label: 'Image Name',
          sortable: true,
          hideable: true,
          hidden: false
        },
        {
          key: 'observation_date',
          label: 'Time',
          sortable: true,
          hideable: true,
          hidden: false,
          formatter: value => {
            return OCSUtil.formatDate(value);
          }
        },
        {
          key: 'proposal_id',
          label: 'Proposal',
          sortable: true,
          hideable: true,
          hidden: true
        },
        {
          key: 'target_name',
          label: 'Object',
          sortable: true,
          hideable: true,
          hidden: false
        },
        {
          key: 'user_id',
          label: 'User ID',
          sortable: true,
          hideable: true,
          hidden: false
        },
        {
          key: 'primary_optical_element',
          label: 'Filter',
          sortable: true,
          hideable: true,
          hidden: false
        },
        {
          key: 'configuration_type',
          label: 'Type',
          sortable: true,
          hideable: true,
          hidden: false
        },
        {
          key: 'observation_id',
          label: 'Observation ID',
          hideable: true,
          hidden: true
        },
        {
          key: 'request_id',
          label: 'Request #',
          hideable: true,
          hidden: true
        },
        {
          key: 'area',
          label: 'Centroid',
          hideable: true,
          hidden: true,
          formatter: value => {
            if (value) {
              let envelope = Terraformer.calculateEnvelope(value);
              let ra = envelope.x + envelope.w / 2;
              if (ra < 0) {
                ra = parseFloat(ra) + 360.0;
              }
              let dec = envelope.y + envelope.h / 2;
              return `${ra.toFixed(4)}, ${dec.toFixed(4)}`;
            } else {
              return '';
            }
          }
        },
        {
          key: 'exposure_time',
          label: 'Exp. Time',
          sortable: true,
          hideable: true,
          hidden: false,
          formatter: value => {
            // Only display 1 decimal point of precision in exposure time
            return _.round(parseFloat(value), 1).toFixed(1);
          }
        },
        {
          key: 'reduction_level',
          label: 'R. level',
          sortable: true,
          hideable: true,
          hidden: false,
          formatter: (value, key, item) => {
            return this.getReductionLevelText(value.toString(), item.telescope_id);
          }
        }
      ],
    };
  },
  computed: {
    imageName: {
      get: function() {
        return this.queryParams.basename;
      },
      set: _.debounce(function(newImageName) {
        this.queryParams.basename = newImageName;
        this.refreshData();
      }, 500)
    },
    objectName: {
      get: function() {
        return this.queryParams.target_name;
      },
      set: _.debounce(function(newObjectName) {
        this.queryParams.target_name = newObjectName;
        this.refreshData();
      }, 500)
    },
    exposureTime: {
      get: function() {
        return this.queryParams.exposure_time;
      },
      set: _.debounce(function(newExposureTime) {
        this.queryParams.exposure_time = newExposureTime;
        this.refreshData();
      }, 500)
    },
    userID: {
      get: function() {
        return this.queryParams.user_id;
      },
      set: _.debounce(function(newuserID) {
        this.queryParams.user_id = newuserID;
        this.refreshData();
      }, 500)
    },
    viewOnlyScienceData: {
      get: function() {
        return this.queryParams.exclude_calibrations;
      },
      set: function(scienceOnly) {
          this.queryParams.exclude_calibrations = scienceOnly ? true : false;
          // make sure we clear out selected configuration type if we're viewing only science frames
          if (scienceOnly) {
            this.queryParams.configuration_type = '';
          }
          this.refreshData();
      }
    },
    datepickerShortcuts: function() {
      return [
              // {text: "This Semester", 
              // onClick: () => {
              //  return[this.filterDateRangeOptions["This Semester"][0].toJSDate(), this.filterDateRangeOptions["This Semester"][1].toJSDate()]
              // }
              //},
              // {text: "Last Semester", 
              // onClick: () => {
              //  return[this.filterDateRangeOptions["Last Semester"][0].toJSDate(), this.filterDateRangeOptions["Last Semester"][1].toJSDate()]
              // }
              //},
              {text: "Last 7 Days", 
               onClick: () => {
                return[this.filterDateRangeOptions["Last 7 Days"][0].toJSDate(), this.filterDateRangeOptions["Last 7 Days"][1].toJSDate()]
               }
              },
              {text: "Last 30 Days", 
               onClick: () => {
                return[this.filterDateRangeOptions["Last 30 Days"][0].toJSDate(), this.filterDateRangeOptions["Last 30 Days"][1].toJSDate()]
               }
              },
              {text: "All Time", 
               onClick: () => {
                if (this.allTimeAllowed) {
                  return[this.filterDateRangeOptions["All Time"][0].toJSDate(), this.filterDateRangeOptions["All Time"][1].toJSDate()]
                }
                else {
                  this.alertModalMessage = "The 'All Time' filter requires either the proposal name or object name to be set. Please constrain your query further."
                  this.$bvModal.show('bv-modal-alert');
                }
               },
              }]
    },
    allTimeAllowed: function() {
      return this.queryParams.proposal_id != '' || this.queryParams.target_name != ''
    },
    selectedReductionLevel: {
      // Return the correct human-readable representation of the selected reduction level
      get: function () {
        return this.getReductionLevelText(this.queryParams.reduction_level, this.queryParams.telescope_id);
      },
      // Based on the reduction level selected, set the query parameters accordingly.
      set: function (reductionLevel) {
        if (this.queryParams.telescope_id === 'igla') this.queryParams.telescope_id = '';
        switch (reductionLevel) {
          case 'EVA-SmStack':
            this.queryParams.reduction_level = '96';
            break;
          case 'EVA-LoStack':
            this.queryParams.reduction_level = '97';
            break;
          case 'EVA':
            this.queryParams.reduction_level = '95';
            break;
          case 'BZESK-SS':
            this.queryParams.reduction_level = '93';
            break;
          case 'BZESK':
            this.queryParams.reduction_level = '92';
            break;
          case 'BANZAI':
            this.queryParams.reduction_level = '91';
            break;
          case 'SEA':
            this.queryParams.reduction_level = '81';
            break;
          case 'SEK':
            this.queryParams.reduction_level = '82';
            break;
          case 'PSX':
            this.queryParams.reduction_level = '83';
            break;
          case 'TIF':
            this.queryParams.reduction_level = '71';
            break;
          case 'JPEG':
            this.queryParams.reduction_level = '72';
            break;
          case 'Small-JPEG':
            this.queryParams.reduction_level = '74';
            break;
          case 'Thumbnails':
            this.queryParams.reduction_level = '73';
            break;
          case 'All':
            this.queryParams.reduction_level = '';
            break;
          case 'Raw':
            this.queryParams.reduction_level = '0';
            break;
        // case 'ORAC':
        //    this.queryParams.reduction_level = '90';
        //    break;
        //  case 'BANZAI':
        //    this.queryParams.reduction_level = '91';
        //   break;
          // NRES Commissioning and BANZAI-Imaging share the same reduction_level, so they must be differentiated by telescope_id
        //  case 'NRES Commissioning':
        //    this.queryParams.reduction_level = '91';
        //    this.queryParams.telescope_id = 'igla';
        //    break;
        //  case 'BANZAI-NRES':
        //    this.queryParams.reduction_level = '92';
        //    break;
          default:
            this.queryParams.reduction_level = '';
        }
      }
    },
    archiveApiUrl: function() {
      return this.$store.state.urls.archiveApiUrl;
    },
    profile: function() {
      return this.$store.state.profile;
    },
    userIsAuthenticated: function() {
      return this.$store.state.userIsAuthenticated;
    },
    profileProposals: function() {
      return _.get(this.profile, ['profile', 'proposals'], []).sort();
    },
    visibleFields: function() {
      return _.filter(this.fields, function(field) {
        return !field.hidden;
      });
    },
    currentPageRange: function() {
      let limit = _.toNumber(this.queryParams.limit);
      let offset = _.toNumber(this.queryParams.offset);
      return {
        start: _.min([offset + 1, this.data.count]),
        end: _.min([offset + limit, this.data.count])
      };
    },
    userIsStaff: function() {
      return this.$store.state.profile.is_staff;
    },
    dataInspectorViewEnabled: function() {
      return this.userIsStaff && this.$store.state.inspectorViewEnabled;
    },
    ds9LinkSuffix: function() {
      let archiveToken = localStorage.getItem('archiveToken');
      return '?frame_ids=' + String(this.selected) + '&token=' + archiveToken + '&frame_url=' + this.archiveApiUrl + '/frames/';
    },
    sidebarWidth: function() {
      // make the data inspector sidebar a bit smaller to maximize data table space
      return this.dataInspectorViewEnabled ? '1.5' : '2';
    },
    expandAllDisabled: function() {
      return this.queryParams.limit > 50
    },
  },
  created: function() {
    this.updateFilters();
  },
  mounted: function() {
    // Set up alert modal to clear message when it it hidden
    this.$root.$on('bv::modal::hidden', (bvEvent, modalId) => {
      if (modalId === 'bv-modal-alert') {
        this.alertModalMessage = '';
      }
    });
    this.setSelectedFields();
  },
  methods: {
    exportTable: function(type) {
      $('#archive-table').tableExport({
        type: type,
        onCellHtmlData(cell, rowIndex, colIndex, htmlData) {
          if (cell.is('th')) {
            return cell.find('div').text();
          }
          return htmlData;
        },
        exportFooter: false,
        tfootSelector: ''
      });
    },
    getDateFormat: function() {
      return 'yyyy-LL-dd HH:mm';
    },
    onConfigurationTypeInput: function() {
      if (this.queryParams.configuration_type != '') {
        this.queryParams.exclude_calibrations = false;
      }
      this.refreshData();
    },
    onDatePickerChange: function() {
      let start = DateTime.fromJSDate(this.selectedTimeRange[0])
      let end = DateTime.fromJSDate(this.selectedTimeRange[1])
      
      this.queryParams.start = start.startOf('day').toFormat(this.getDateFormat());
      this.queryParams.end = end.endOf('day').toFormat(this.getDateFormat());

      this.refreshData();
    },
    expandAll: function() {
      for (let item of this.data.results) {
        this.$set(item, '_showDetails', true);
      }
    },
    collapseAll: function() {
      for (let item of this.data.results) {
        this.$set(item, '_showDetails', false);
      }
    },
    setSelectedFields: function() {
      // if visible fields preferences are set in local storage, set them here
      let visibleFields = JSON.parse(localStorage.getItem('visibleFields'));
      if (visibleFields !== null) {
        for (let field of this.fields) {
          field.hidden = _.includes(visibleFields, field.key) ? false : true;
        }
      }
    },
    getTimeRangeFilters: function() {
      let filterDateRangeOptions = {};
      let currentSemester = this.getCurrentOrLastSemester('current');
      if (currentSemester.start && currentSemester.end) {
        filterDateRangeOptions['This Semester'] = [DateTime.fromISO(currentSemester.start, {zone: 'utc'}), DateTime.fromISO(currentSemester.end, {zone: 'utc'})];
      }
      let lastSemester = this.getCurrentOrLastSemester('last');
      if (lastSemester.start && lastSemester.end) {
        filterDateRangeOptions['Last Semester'] = [DateTime.fromISO(lastSemester.start,  {zone: 'utc'}), DateTime.fromISO(lastSemester.end,  {zone: 'utc'})];
      }
      _.merge(filterDateRangeOptions, {
      //  Today: [DateTime.utc().startOf('day'), DateTime.utc().endOf('day')],
      //  Yesterday: [
      //    DateTime
      //      .utc()
      //      .startOf('day')
      //      .minus({ days : 1 }),
      //    DateTime
      //      .utc()
      //      .endOf('day')
      //      .minus({ days: 1 })
      //  ],
        'Last 7 Days': [
          DateTime
            .utc()
            .startOf('day')
            .minus({ days: 6 }),
          DateTime.utc().endOf('day')
        ],
        'Last 30 Days': [
          DateTime
            .utc()
            .startOf('day')
            .minus({ days: 29 }),
          DateTime.utc().endOf('day')
        ],
        'All Time': [
          DateTime.fromISO('2014-01-01T00:00:00', {zone: 'utc'}),
          DateTime.utc().endOf('day')
        ]
      });
      return filterDateRangeOptions;
    },
    getCurrentOrLastSemester: function(currentOrLast) {
      let semesterIndex = currentOrLast === 'current' ? 0 : 1;
      return _.get(this.semesters, semesterIndex, {});
    },
    initializeDataEndpoint: function() {
      return `${this.$store.state.urls.archiveApiUrl}/frames/`;
    },
    preventDownloadUncompressed: function() {
      return this.selected.length > this.maxFunpackedFrames && this.dltype === 'zip-uncompressed';
    },
    selectItem: function(item) {
      if (!_.includes(this.selected, item.id)) this.selected.push(item.id);
    },
    deselectItem: function(item) {
      // remove an item by value via filtering, since vue cannot detect changes made by _.pull or _.remove lodash methods
      this.selected = removeItemFromList(this.selected, item.id);
    },
    clearSelected: function() {
      this.$refs.archivetable.clearSelected();
      this.selected = [];
    },
    ifAllSelected: function() {
      // don't attempt to access the archive table before it has been mounted
      if (typeof this.$refs.archivetable === 'undefined') return;
      for (const item of this.$refs.archivetable.items) {
        if (!this.itemInSelected(item.id)) {
          return false;
        }
      }
      return true;
    },
    itemInSelected(item) {
      return itemInList(this.selected, item);
    },
    onSelectAll: function(checked) {
      if (checked) {
        this.$refs.archivetable.items.forEach(item => {
          this.selectItem(item);
        });
      } else {
        this.$refs.archivetable.items.forEach(item => {
          this.deselectItem(item);
        });
      }
    },
    onRowChecked: function(row, checked) {
      if (checked) {
        this.selectItem(row.item);
      } else {
        this.deselectItem(row.item);
      }
    },
    onRowClicked: function(item) {
      if (!this.itemInSelected(item.id)) {
        this.selectItem(item);
      } else {
        this.deselectItem(item);
      }
    },
    downloadFiles: function() {
      let archiveToken = localStorage.getItem('archiveToken');
      let frameIds = this.selected;
      if (this.dltype === 'zip-compressed' || this.dltype === 'zip-uncompressed') {
        let uncompress = this.dltype === 'zip-compressed' ? false : true;
        let catalog = false;
        downloadZip(frameIds, uncompress, catalog, this.archiveApiUrl, archiveToken);
      }
      else if (this.dltype === 'zip-catalog') {
        let uncompress = false;
        let catalog = true;
        downloadZip(frameIds, uncompress, catalog, this.archiveApiUrl, archiveToken);
      }
      else if (this.dltype === 'wget') {
        downloadWget(frameIds, archiveToken, this.archiveApiUrl);
      }
      else if (this.dltype === 'framesnumcopy') {
        downloadFrameNum(frameIds, archiveToken, this.archiveApiUrl);
      }
      else if (this.dltype === 'framesnumsagemaker') {
        downloadFrameNumSageMaker(frameIds, archiveToken, this.archiveApiUrl);
      }
    },
    getReductionLevelText: function (numericReductionLevel, telescopeId) {
      // Given the numeric reduction level and telescope ID, get a human readable representation of the reduction level.
      switch (numericReductionLevel) {
        case '96':
          return 'EVA-SmStack';
        case '97':
          return 'EVA-LoStack';
        case '95':
          return 'EVA';
        case '93':
          return 'BZESK-SS';
        case '92':
          return 'BZESK';
        case '91':
          return 'BANZAI';
        case '81':
          return 'SEA';
        case '82':
          return 'SEK';
        case '83':
          return 'PSX';
        case '71':
          return 'TIF';
        case '72':
          return 'JPEG';
        case '74':
          return 'Small-JPEG';
        case '73':
          return 'Thumbnails';
        case '':
          return 'All';
        case '0':
          return 'Raw';
        //case '90':
        //  return 'ORAC';
        // Due to BANZAI-Imaging and NRES Commissioning sharing the numeric reduction_level 91, we must differentiate them by telescope_id
        case '91':
          if (telescopeId === 'igla') {
            return 'NRES Commissioning';
          } else {
            return 'BANZAI';
          }
        //case '92':
        //  return 'BANZAI-NRES';
        default:
          return 'All';
      }
    },
    initializeDefaultQueryParams: function() {
      let timeRangeFilters = this.getTimeRangeFilters();
      let defaultRange;
      // If the semester is available, use that to set the default range. Otherwise set the default range to Last 7 days,
      // which is guaranteed to be in the time range filters.
      if (timeRangeFilters['This Semester']) {
        defaultRange = timeRangeFilters['This Semester'];
      } else {
        defaultRange = timeRangeFilters['Last 7 Days'];
      }
      const defaultQueryParams = {
        reduction_level: '',
        proposal_id: '',
        instrument_id: '',
        target_name: '',
        user_id: '',
        site_id: '',
        telescope_id: '',
        primary_optical_element: '',
        configuration_type: '',
        exposure_time: '',
        observation_id: '',
        request_id: '',
        basename: '',
        start: defaultRange[0].toFormat(this.getDateFormat()),
        end: defaultRange[1].toFormat(this.getDateFormat()),
        id: '',
        covers: '',
        ordering: '',
        limit: 20,
        offset: 0,
        expand_all: false,
        // set these two in the router
        public: undefined,
        exclude_calibrations: undefined
      };
      return defaultQueryParams;
    },
    onErrorRetrievingData: function(response) {
      if (response.status == 429) {
        this.alertModalMessage =
          'Your account has been throttled due to too many requests. Please see https://lco.global/documentation/archive-documentation/#limits';
      } else {
        this.alertModalMessage = `There was a problem with your request. Status: ${response.status}. Please contact support.`;
      }
      this.$bvModal.show('bv-modal-alert');
    },
    refreshData: function() {
      // when refreshing data to display, go to the first page of results.
      this.goToFirstPage();
      this.update();
      // update the available selections based on the newly-selected params
      this.updateFilters();
    },
    onSuccessfulDataRetrieval: function() {
      // if the expand_all param is specified in the query params, make sure we automatically expand all the rows
      if (this.queryParams.expand_all === 'true' && !this.expandAllDisabled) {
        this.expandAll();
      }
    },
    setOptions: function(optionKey, availableOptions) {
      // optionKey must be (is expected to be) one of the keys inside allAggregatedOptions
      availableOptions.sort();
      this.categorizedAggregatedOptions[optionKey].available = availableOptions;
      let unavailable = this.allAggregatedOptions[optionKey].slice(0);
      let unavailableIdx;
      for (let availableIdx in availableOptions) {
        unavailableIdx = unavailable.indexOf(availableOptions[availableIdx]);
        if (unavailableIdx >= 0) {
          unavailable.splice(unavailableIdx, 1);
        }
      }
      this.categorizedAggregatedOptions[optionKey].unavailable = unavailable;
    },
    updateOptions: function() {
      let isParamForFilter, isProposalForFilter;
      let filters = {};
      for (let p in this.queryParams) {
        if (this.queryParams[p]) {
          isParamForFilter = ['site_id', 'telescope_id', 'instrument_id', 'primary_optical_element', 'configuration_type', 'start', 'end', 'public'].indexOf(p) >= 0;
          // Only add the proposal to the filters if the chosen proposal is a public one as those are the ones that are
          // populated by the aggregate endpoint. Profile proposals are handled differently.
          isProposalForFilter = p === 'proposal_id' && this.allAggregatedOptions.proposals.indexOf(this.queryParams[p]) >= 0;
          if (isParamForFilter || isProposalForFilter) {
            filters[p] = this.queryParams[p];
          }
        }
      }
      $.ajax({
        url: `${this.archiveApiUrl}/frames/aggregate/`,
        data: filters
      }).done(response => {
        this.setOptions('proposals', response.proposals);
        this.setOptions('obstypes', response.obstypes);
        this.setOptions('sites', response.sites);
        this.setOptions('instruments', response.instruments);
        this.setOptions('filters', response.filters);
        this.setOptions('telescopes', response.telescopes);
      }).fail(() => {
        this.setOptions('proposals', this.allAggregatedOptions.proposals);
        this.setOptions('obstypes', this.allAggregatedOptions.obstypes);
        this.setOptions('sites', this.allAggregatedOptions.sites);
        this.setOptions('instruments', this.allAggregatedOptions.instruments);
        this.setOptions('filters', this.allAggregatedOptions.filters);
        this.setOptions('telescopes', this.allAggregatedOptions.telescopes);
      });
    },
    getAllFiltersAndUpdateOptions: function() {
      $.ajax({
        url: `${this.archiveApiUrl}/frames/aggregate/`,
        data: { }
      }).done(response => {
        this.allAggregatedOptions.sites = response.sites.sort();
        this.allAggregatedOptions.filters = response.filters.sort();
        this.allAggregatedOptions.instruments = response.instruments.sort();
        this.allAggregatedOptions.telescopes = response.telescopes.sort();
        this.allAggregatedOptions.obstypes = response.obstypes.sort();
        this.allAggregatedOptions.proposals = response.proposals.sort();
        this.updateOptions();
      });
    },
    updateFilters: function() {
      // Populate all the dropdowns from the aggregate endpoint.
      if (this.allAggregatedOptions.sites.length < 1) {
        this.getAllFiltersAndUpdateOptions();
      } else {
        this.updateOptions();
      }
    },
    getSortByFromOrdering: function() {
      // Return what field the data is currently sorted by given the `ordering` field in the query params
      let splitOrdering = _.split(this.queryParams.ordering, '-');
      return splitOrdering.pop();
    },
    getSortDescFromOrdering: function() {
      // Return whether the current sort order set in the `ordering` query param is descending
      return _.startsWith(this.queryParams.ordering, '-') ? true : false;
    },
    getOrderingFromSort: function(sortDesc, sortBy) {
      // Return what the `ordering` value in the query params should be given the sort order and the sort field
      let ordering = '';
      if (sortBy) {
        ordering = sortDesc ? `-${sortBy}` : sortBy;
      }
      return ordering;
    },
    onSortingChanged: function(event) {
      this.queryParams.ordering = this.getOrderingFromSort(event.sortDesc, event.sortBy);
      this.goToFirstPage();
      this.update();
    },
    onFieldsChanged: function() {
      // store the names of the visible fields in local storage to persist them
      let visibleFieldNames = _.map(this.visibleFields, function(field) {
        return field.key;
      });
      localStorage.setItem('visibleFields', JSON.stringify(visibleFieldNames));
    }
  }
};
</script>
<style scoped>
#date-range-picker {
  cursor: pointer;
}

</style>
<!-- 
Make table header position relative to avoid horizontal overflow. 
Should be fixed in boostrap-vue 2.22.0
https://github.com/bootstrap-vue/bootstrap-vue/issues/6326
-->
<style lang="scss">
@import '@/assets/scss/custom-colors.scss';

th {
  position: relative;
}

.table td{
  word-break: break-word;
}

.table-hover tbody tr:hover td {
    background: $tan;
}

.mx-datepicker {
  width: 100%;
}

.mx-icon-calendar {  
  display: none;
}

.mx-datepicker-sidebar {
  width: auto;
}

.mx-datepicker-sidebar + .mx-datepicker-content {
  margin-left: 150px;
}
.modal-title{
  color: #ffffff;
}
.modal-body{
  overflow-wrap: anywhere;
}
.modal-header{
  color:#ffffff;
}


</style>
