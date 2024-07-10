<template>
<button class="playlist_item">
  <div class="aspect-square h-[45px] w-auto shadow-md rounded-[4px] overflow-hidden">
    <img :src="songData.pic" :class="`cover aspect-square h-full w-full ${coverLoaded? '' : 'cover_loading'}`" @load="coverLoaded = true">
  </div>
  <div class="grow flex flex-col">

    <span class="name mr-[auto] font-medium">{{ songData.name }}</span>
    <span class="artist mr-auto text-sm text-gray-500">{{ songData.artist }}</span>

  </div>
</button>
</template>
<script setup lang="ts">
import {ref} from "vue";

defineProps(["songData", "index"])

const coverLoaded = ref(false)

</script>
<style scoped>
.playlist_item {
  @apply w-full h-16 cursor-pointer
  scale-[0.99] hover:scale-[1] active:scale-[0.995] hover:shadow-lg hover:bg-white/20 rounded-md
  flex flex-row items-center p-1.5 pr-4 gap-3;
  will-change: scroll-position;
  transition: all 200ms ease;
}
.active {
  @apply bg-primary/10 hover:bg-primary/30;
}
.cover {
  transition: opacity 250ms ease;
}
.cover_loading {
  opacity: 0;
}
</style>