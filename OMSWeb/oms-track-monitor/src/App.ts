import { defineCustomElement } from 'vue'
import OmsTrackMonitor from './OmsTrackMonitor.ce.vue'

console.log(OmsTrackMonitor.styles)

const OmsTrackMonitorElement = defineCustomElement(OmsTrackMonitor)

customElements.define('oms-track-monitor', OmsTrackMonitorElement)