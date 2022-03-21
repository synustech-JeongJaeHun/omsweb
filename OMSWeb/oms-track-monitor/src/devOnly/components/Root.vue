<script setup lang="ts">
import OmsTrackMonitor from 'src/OmsTrackMonitor.ce.vue'
import {
  computed,
  defineCustomElement,
  reactive,
  ref,
  watchEffect,
} from 'vue'
import { useWindowRect } from '../hooks/useWindowRect'
import { useHub } from '../hooks/useHub'

const windowRect = useWindowRect()

const omsTrackMonitorRef = ref<typeof OmsTrackMonitor>()
const omsTrackMonitorMethods = computed(
  () => omsTrackMonitorRef.value?._instance.exposed
)

watchEffect(async () => {
  if (omsTrackMonitorMethods.value === undefined) return

  const trackData = await fetch('/api/status/tracks').then((res) =>
    res.json()
  )

  console.log(omsTrackMonitorMethods.value)

  // @ts-ignore
  omsTrackMonitorMethods.value.setTrack({
    ...trackData,
    segmentParts: trackData.segments,
    // @ts-ignore
    clusters: trackData.clusters.map((c) => ({
      ...c,
      // @ts-ignore
      segments: c.segments.split(',').map((id) => parseInt(id.trim())),
    })),
  })
  useHub({
    // @ts-ignore
    segmentDisabledChanged: (e) => {
      // @ts-ignore
      omsTrackMonitorMethods.value.updateSegmentDisabled(e.operation, {
        id: e.id,
        operation: e.operation,
        data: e.data,
      })
    },
    // @ts-ignore
    vehicleChanged: (e) => {
      // @ts-ignore
      omsTrackMonitorMethods.value.updateVehicle(e.operation, e.data)
    },
    // @ts-ignore
    zcuMapChanged: (e) => {
      // @ts-ignore
      omsTrackMonitorMethods.value.updateZcu(e.operation, e.data)
    },
  })
})
</script>

<template>
  <oms-track-monitor
    ref="omsTrackMonitorRef"
    :viewMode="'VIEWER'"
    :mapType="'DB'"
    :width="windowRect.width"
    :height="windowRect.height"
    :rotation="0"
    :vehicleSize="undefined"
    :segmentWidth="undefined"
    :segmentDirectionSize="undefined"
    :isMinimapVisible="undefined"
    :isVehicleLineVisible="undefined"
    :isSegmentDirectionVisible="undefined"
    :isPointLabelVisible="undefined"
    :isStationVisible="undefined"
    :isBufferVisible="undefined"
    :isGroupVisible="undefined"
    :isClusterVisible="undefined"
    :backgroundColor="undefined"
    :stationColor="undefined"
    :bufferColor="undefined"
    :pointColor="undefined"
    :normalSegmentColor="undefined"
    :disabledSegmentColor="undefined"
    :segmentDirectionColor="undefined"
    :autoModeVehicleColor="undefined"
    :manualModeVehicleColor="undefined"
    :noneModeVehicleColor="undefined"
    :cargoLoadingColor="undefined"
    :cargoFullColor="undefined"
    :cargoUnloadingColor="undefined"
  ></oms-track-monitor>
</template>
