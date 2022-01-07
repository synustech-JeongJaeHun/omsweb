import { createApp, defineCustomElement } from 'vue'
import OmsTrackMonitor from './OmsTrackMonitor.ce.vue'

// With Vue3
createApp(OmsTrackMonitor).mount('#app')

// With Web Component
// const OmsTrackMonitorElement = defineCustomElement(OmsTrackMonitor)
// customElements.define('oms-track-monitor', OmsTrackMonitorElement)
// setTimeout(() => {
//   const omsTrackMonitor = document.getElementById('track-canvas')
//   // @ts-ignore
//   window.omsTrackMonitor = omsTrackMonitor
// }, 1000);
