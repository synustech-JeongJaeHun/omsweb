<script setup lang="ts">
import { ref } from 'vue';
import { cameraInfo } from '../camera';
import { rotationInfo } from '../../rotate/rotate';
import { scaleInfo } from '../../scale/scale';
import { elementRectInfo } from '../elementRect';
import { mapSizePropertiesInfo } from '../mapSizeProperties';
import { scaleStylesInfo } from '../../styles/styles';

const isShow = ref(false)
</script>

<template>
  <div style="font-size: smaller;">
    <button
      type="button"
      @click.stop="isShow = !isShow"
      style="border: unset; background-color: unset;"
    >ℹ️</button>
    <div
      v-if="isShow"
      class="absolute"
      style="padding: 10px;bottom: 40px;right: 5px; min-width: 20em; width: max-content; background-color: rgba(0, 0, 0, 0.255); overflow: scroll;"
    >
      <details :open="false">
        <summary>
          <h2 style="margin: 0px; border-bottom: 2px solid black;">📷 camera</h2>
        </summary>

        <dl>
          <dt>x y</dt>
          <dd>x: {{ cameraInfo.x.toFixed(2) }} y: {{ cameraInfo.y.toFixed(2) }}</dd>

          <dt>viewBox</dt>
          <dd>w: {{ cameraInfo.viewBoxWidth.toFixed(2) }} h: {{ cameraInfo.viewBoxHeight.toFixed(2) }}</dd>

          <dt>element</dt>
          <dd>w: {{ elementRectInfo.width }} h: {{ elementRectInfo.height }}</dd>

          <dt>center</dt>
          <dd>x: {{ cameraInfo.centerX.toFixed(2) }} y: {{ cameraInfo.centerY.toFixed(2) }}</dd>

          <dt>max</dt>
          <dd>x: {{ cameraInfo.maxX.toFixed(2) }} y: {{ cameraInfo.maxY.toFixed(2) }}</dd>

          <dt>ratio</dt>
          <dd>{{ cameraInfo.ratio.toFixed(8) }}</dd>

          <dt>viewBox</dt>
          <dd>{{ cameraInfo.viewBox }}</dd>
        </dl>
      </details>

      <details :open="false">
        <summary>
          <h2 style="margin: 0px; border-bottom: 2px solid black;">🔍 Scale</h2>
        </summary>

        <dl>
          <dt>mm Per pixel</dt>
          <dd>{{ scaleInfo.mmPerPixel.toFixed(8) }}</dd>

          <dt>pixel Per mm</dt>
          <dd>{{ scaleInfo.pixelPerMm.toFixed(8) }}</dd>
        </dl>
      </details>

      <details :open="false">
        <summary>
          <h2 style="margin: 0px; border-bottom: 2px solid black;">♻️ rotate</h2>
        </summary>

        <dl>
          <dt>rotate</dt>
          <dd>{{ rotationInfo }}</dd>
        </dl>
      </details>

      <details :open="false">
        <summary>
          <h2 style="margin: 0px; border-bottom: 2px solid black;">👗 styles</h2>
        </summary>
        <dl>
          <dt>vehicle</dt>
          <dd>{{ scaleStylesInfo.vehicleSize }}</dd>

          <dt>segment-width</dt>
          <dd>{{ scaleStylesInfo.segmentWidth }}</dd>

          <dt>segment-direction</dt>
          <dd>{{ scaleStylesInfo.segmentDirection }}</dd>
        </dl>
      </details>

      <details :open="false">
        <summary>
          <h2 style="margin: 0px; border-bottom: 2px solid black;">🗺️ map</h2>
        </summary>

        <dl>
          <dt>min</dt>
          <dd>x: {{ mapSizePropertiesInfo.minX }} y: {{ mapSizePropertiesInfo.minY }}</dd>

          <dt>center</dt>
          <dd>x: {{ mapSizePropertiesInfo.centerX }} y: {{ mapSizePropertiesInfo.centerY }}</dd>

          <dt>max</dt>
          <dd>x: {{ mapSizePropertiesInfo.maxX }} y: {{ mapSizePropertiesInfo.maxY }}</dd>

          <dt>width height</dt>
          <dd>w: {{ mapSizePropertiesInfo.width }} h: {{ mapSizePropertiesInfo.height }}</dd>
        </dl>
      </details>
    </div>
  </div>
</template>