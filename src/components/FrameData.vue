<template>
 <b-table 
    :items="headerItems"
    :fields="fields"
    :busy="!dataLoaded"
 >
 </b-table>
</template>
<script>
import { OCSMixin } from 'ocs-component-lib';
import _ from 'lodash';

export default {
    name: 'FrameData',
    mixins: [OCSMixin.getDataListMixin],
    props: {
        frameId: {
            type: [String, Number],
            required: true
        }
    },
    data: function() {
        return {
            fields: [
                {
                    key: 'L1FWHM',
                    label: 'FWHM'
                },
                {
                    key: 'FOCOBOFF',
                    label: 'Defocus'
                },
                {
                    key: 'PNTOFST',
                    label: 'Pointing Offset'
                }
            ],
        };
    },
    computed: {
        headerItems: function() {
            let row = {};
            if (this.data.data) {
                for (let keyword of this.fields) {
                    let value = _.get(this.data.data, keyword.key, '-')
                    // truncate numbers to two decimal places
                    row[keyword.key] = _.isNumber(value) ? value.toFixed(2) : value;
                }
            }
            return [row];
        }
    },
    methods: {
        initializeDataEndpoint: function() {
            return `${this.$store.state.urls.archiveApiUrl}/frames/${this.frameId}/headers/`;
        }
    }
}
</script>
