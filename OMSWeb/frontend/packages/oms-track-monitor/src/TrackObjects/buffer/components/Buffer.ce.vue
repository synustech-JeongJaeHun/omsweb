<script setup lang="ts">
import { computed, toRef } from 'vue'
import { Buffer } from '../types/Buffer'
import { useGroup } from '../../group/groups'
import { getPositionForBufferOrStation } from 'src/TrackObjects/utils/locationStationBuffer'
import { getGroupColorWithAlpha } from 'TrackObjects/group/utils/color'
import { readonlyIdType, IdType } from 'TrackObjects/common/alias'
import {scaleStylesInfo} from "src/styles/styles";

const props = defineProps<{
  buffer: Buffer,
  margin: number
  teleportRef?: SVGGElement
  handleLeftClick: (event: MouseEvent) => void
  handleRightClick: (event: MouseEvent) => void
  handleMouseover: (event: MouseEvent) => void
  handleMouseleave: (event: MouseEvent) => void
}>()

const position = computed(() =>
  getPositionForBufferOrStation(props.buffer, props.margin)
)

const group = useGroup('buffer', toRef(props.buffer, 'id'))
</script>

<template>
  <Teleport :to="teleportRef" :disabled="props.buffer.isCarrierFocused !== true">
    <svg
      v-if="position"
      class="overflow-visible cursor-pointer buffer"
      :x="position.x"
      :y="position.y"
      :data-disabled="props.buffer.unuse"
      :data-state="props.buffer.state"
      :data-carrier-focused="props.buffer.isCarrierFocused"
    >
        <g class="scale-and-reverse-rotate">
            <use v-if="group"
                 class="group-shadow"
                 href="#buffer-group-shadow"
                 :fill="getGroupColorWithAlpha(group.color)" />

            <!--캐리어있고 일정시간이 경과 된 경우(없는 경우는 알람자체가 없음)-->
            <use v-if="props.buffer.carrierId &&props.buffer.alertPassedTime"
                 class="carrier-passedTime"
                 transform="scale(0.8)"
                 href="#buffer-group-shadow"
                 :fill="!props.buffer.carrierId &&'transparent'" />

            <use v-if="props.buffer.isFocused"
                 href="#buffer"
                 class="focus"
                 stroke-width="10" />

            <use href="#buffer"
                 class="buffer-path"
                 stroke-width="4"
                 :data-id="props.buffer.id"
                 @click.left="handleLeftClick"
                 @click.right="handleRightClick"
                 @mouseover="handleMouseover"
                 @mouseout="handleMouseleave"
                 @mouseleave="handleMouseleave" />

            <!--플레이백에서 캐리어표시를 위한 이전코드-->
            <circle v-if="props.buffer.carrierId"
                    :data-id="props.buffer.id"
                    :class="props.buffer.carrierId && 'carrier-unknown'"
                    :fill="!props.buffer.carrierId &&'transparent'"
                    r="8"
                    @click.left="handleLeftClick"
                    @click.right="handleRightClick"
                    @mouseover="handleMouseover"
                    @mouseout="handleMouseleave"
                    @mouseleave="handleMouseleave" />

            <!--캐리어가 인스톨이 상태여야만, 캐리어 내부의 공/실 여부를 판단.-->
            <circle v-if="props.buffer.installed==1&&props.buffer.carrierEmptyStatus === 0"
                    :data-id="props.buffer.id"
                    :class="props.buffer.carrierId && 'carrier-unknown'"
                    :fill="!props.buffer.carrierId &&'transparent'"
                    r="8"
                    @click.left="handleLeftClick"
                    @click.right="handleRightClick"
                    @mouseover="handleMouseover"
                    @mouseout="handleMouseleave"
                    @mouseleave="handleMouseleave" />

            <circle v-if="props.buffer.installed==1&&props.buffer.carrierEmptyStatus === 1"
                    :data-id="props.buffer.id"
                    :class="props.buffer.carrierId && 'carrier-empty'"
                    :fill="!props.buffer.carrierId &&'transparent'"
                    r="8"
                    @click.left="handleLeftClick"
                    @click.right="handleRightClick"
                    @mouseover="handleMouseover"
                    @mouseout="handleMouseleave"
                    @mouseleave="handleMouseleave" />

            <circle v-if="props.buffer.installed==1&&props.buffer.carrierEmptyStatus === 2"
                    :data-id="props.buffer.id"
                    :class="props.buffer.carrierId && 'carrier-full'"
                    :fill="!props.buffer.carrierId &&'transparent'"
                    r="8"
                    @click.left="handleLeftClick"
                    @click.right="handleRightClick"
                    @mouseover="handleMouseover"
                    @mouseout="handleMouseleave"
                    @mouseleave="handleMouseleave" />

            <circle v-if="props.buffer.installed==1&&props.buffer.carrierEmptyStatus === 3"
                    :data-id="props.buffer.id"
                    :class="props.buffer.carrierId && 'carrier-err'"
                    :fill="!props.buffer.carrierId &&'transparent'"
                    r="8"
                    @click.left="handleLeftClick"
                    @click.right="handleRightClick"
                    @mouseover="handleMouseover"
                    @mouseout="handleMouseleave"
                    @mouseleave="handleMouseleave" />

            <text v-if="props.buffer.type"
                  class="invert label select-none buffer-type"
                  x="28"
                  y="4"
                  alignment-baseline="hanging"
                  text-anchor="middle"
                  text-rendering="optimizeSpeed"
                  :font-size="scaleStylesInfo.bufferTextSize"
                  pointer-events="none">
                {{props.buffer.type}}
            </text>
            <text class="invert label select-none"
                  x="0"
                  y="20"
                  alignment-baseline="hanging"
                  text-anchor="middle"
                  text-rendering="optimizeSpeed"
                  :font-size="scaleStylesInfo.bufferTextSize"
                  pointer-events="none">
                {{ readonlyIdType===IdType.ID ? props.buffer.logicalId : (props.buffer?.cAlias || props.buffer.logicalId)}}
            </text>
        </g>
    </svg>
  </Teleport>
</template>
