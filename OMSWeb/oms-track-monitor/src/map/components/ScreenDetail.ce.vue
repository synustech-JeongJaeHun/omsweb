<script setup lang="ts">
import { ref } from 'vue';
import { cameraInfo } from '../camera';
import { rotationInfo } from '../rotate';
import { elementRectInfo } from '../elementRect';
import { mapSizePropertiesInfo } from '../mapSizeProperties';

const isShow = ref(true)
</script>

<template>
  <div style="
  font-size: smaller; 
  background-color: rgba(0, 0, 0, 0.12);
  padding: 5px;
  ">
    <button
      type="button"
      style="position: absolute; right: 0px"
      @click="isShow = !isShow"
    >{{ isShow ? "X" : "V" }}</button>
    <div v-if="isShow">
      <h2>📷camera</h2>
      <dl>
        <dt>x y</dt>
        <dd>x: {{ cameraInfo.x }} y: {{ cameraInfo.y }}</dd>

        <dt>viewBox</dt>
        <dd>w: {{ cameraInfo.viewBoxWidth }} h: {{ cameraInfo.viewBoxHeight }}</dd>

        <dt>element</dt>
        <dd>w: {{ elementRectInfo.width }} h: {{ elementRectInfo.height }}</dd>

        <dt>rotate</dt>
        <dd>{{ rotationInfo }}</dd>

        <dt>center</dt>
        <dd>x: {{ cameraInfo.centerX }} y: {{ cameraInfo.centerY }}</dd>

        <dt>max</dt>
        <dd>x: {{ cameraInfo.maxX }} y: {{ cameraInfo.maxY }}</dd>

        <dt>ratio</dt>
        <dd>{{ cameraInfo.ratio.toFixed(5) }}</dd>

        <dt>viewBox</dt>
        <dd>{{ cameraInfo.viewBox }}</dd>

        <dt>zoomLevel</dt>
        <dd>{{ cameraInfo.zoomLevel }}</dd>
      </dl>

      <h2>🗺️map</h2>
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
    </div>
  </div>
</template>