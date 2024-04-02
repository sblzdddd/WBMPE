<template>
<div class="playlist_item">
  <img :src="songData.pic" class="aspect-square h-full w-auto shadow-md rounded-[8px]">
  <span class="artist text-lg font-bold text-primary">{{ index + 1 }}</span>
  <span class="name mr-[auto] text-lg font-bold">{{ songData.name }}</span>
  <span class="artist text-lg">{{ songData.artist }}</span>
</div>
</template>
<script setup lang="ts">
defineProps(["songData", "index"])

</script>
<style scoped>
.playlist_item {
  @apply w-full h-16 hover:bg-white/20 cursor-pointer
  scale-[0.98] hover:scale-[1] active:scale-[0.99] hover:shadow-lg rounded-box
  flex flex-row justify-between items-center p-2 pr-4 gap-4;
  transition: all 200ms ease;
}
.active {
  @apply bg-primary/10 hover:bg-primary/30;
}
</style>