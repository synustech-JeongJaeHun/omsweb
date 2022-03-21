import { createApp, defineCustomElement } from 'vue'
import Root from './devOnly/components/Root.vue'
import OmsTrackMonitor from './OmsTrackMonitor.ce.vue'

const OmsTrackMonitorElement = defineCustomElement(OmsTrackMonitor)
customElements.define('oms-track-monitor', OmsTrackMonitorElement)

createApp(Root).mount('#app')
