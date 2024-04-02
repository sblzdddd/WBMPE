<template>
  <div class="playlist rounded-box w-screen h-screen flex flex-col gap-1 overflow-y-auto py-2">
    <PlaylistItem v-for="song in songData" :key="songData.indexOf(song)" :index="songData.indexOf(song)" :songData="song"
                  @click="channel.postMessage({'action': 'switch', 'index': songData.indexOf(song)});
                          channel.postMessage({'action': 'test'});channel.postMessage({'action': 'play'});"
                  :class="`${currentSong == songData.indexOf(song)? 'active': ''}`"/>
  </div>
</template>
<script setup lang="ts">
import {ref} from "vue";
import PlaylistItem from "@/components/PlaylistItem.vue";

const songData = ref([])
const channel = new BroadcastChannel("WBMPE");

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
<style>
html, body, #app {
  background: #0f172a;
}
/* width */
::-webkit-scrollbar {
  width: 4px;
}

/* Track */
::-webkit-scrollbar-track {
  background: transparent;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}

</style>