<template>
  <div :class="`${songData.length <= 0? 'skeleton': ''} playlist`">
    <PlaylistItem v-for="song in songData" :key="songData.indexOf(song)" :index="songData.indexOf(song)" :songData="song"
                  @click="channel.postMessage({'action': 'switch', 'index': songData.indexOf(song)});
                          channel.postMessage({'action': 'test'});channel.postMessage({'action': 'play'});"
                  :class="`${currentSong == songData.indexOf(song)? 'active': ''}`"/>
  </div>
</template>
<script setup lang="ts">
import {ref} from "vue";
import PlaylistItem from './PlaylistItem.vue';

const songData = ref([])
const channel = new BroadcastChannel("WBMPE");

// const props = withDefaults(
//     defineProps<{
//       opened: boolean;
//     }>(),
//     {
//       opened: false,
//     }
// )

const currentSong = ref(0);

channel.onmessage = (e) => {
  if (e.data.action == "overview") {
    songData.value = e.data.playlist;
  }
  if (e.data.action == "init") {
    currentSong.value = e.data.index;
  }
}
</script>
<style scoped lang="postcss">
.playlist {
  @apply rounded-lg w-full h-full gap-0.5 flex flex-col overflow-x-hidden p-2
  bg-black/50 backdrop-blur-lg overflow-y-auto;
}

</style>