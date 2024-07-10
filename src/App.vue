<script setup lang="ts">
</script>

<template>
  <div class="scrollContainer">
    <router-view />
  </div>
</template>

<style lang="stylus">
.scrollContainer
  @apply w-screen h-screen;
  height 100svh
  overflow-x hidden
  overflow-y auto
</style>
