import { defineCustomElement } from 'vue'
import OmsTrackMonitor from './OmsTrackMonitor.ce.vue'

// With Vue3
// createApp(OmsTrackMonitor).mount('#app')

// With Web Component
const OmsTrackMonitorElement = defineCustomElement(OmsTrackMonitor)
customElements.define('oms-track-monitor', OmsTrackMonitorElement)