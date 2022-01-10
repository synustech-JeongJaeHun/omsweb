<script setup lang="ts">
import { segments } from '../segments';
</script>

<template>
  <svg>
    <defs>
      <path v-for="segment of segments" />
    </defs>
  </svg>
</template>
