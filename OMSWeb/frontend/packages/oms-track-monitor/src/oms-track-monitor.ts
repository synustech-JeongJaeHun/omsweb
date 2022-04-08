import { defineCustomElement } from 'vue'
import OmsTrackMonitor from './Root/OmsTrackMonitor.ce.vue'

const OmsTrackMonitorElement = defineCustomElement(OmsTrackMonitor)
customElements.define('oms-track-monitor', OmsTrackMonitorElement)
export { OmsTrackMonitorElement }
