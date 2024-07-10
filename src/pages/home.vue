<template>
  <div class="w-100 h-screen flex flex-row justify-center items-center gap-6">
    <div class="absolute float-left left-10 top-6 flex">
      <a class="z-[1024] btn btn-ghost" href="/">
        <HomeIcon class="h-6 w-6 text-white" />&nbsp;
        Back to Home
      </a>
      <button class="btn btn-ghost" @click="showModal=true">
        <ArrowDownOnSquareIcon class="h-6 w-6 text-white" />&nbsp;
        Import Music
      </button>
    </div>

    <div class="window_base">
      <PlayerMain ref="playerMain"
        @request-playlist-open="(val) => togglePlaylist(val)">
      </PlayerMain>
    </div>

    <div :class="`window_base playlist_container ${playlistOpened? 'opened': ''}`">
      <Playlist></Playlist>
      <button class="btn btn-circle btn-ghost backdrop-blur-lg absolute right-2 top-7"
      @click="playlistOpened = false;playerMain.playlistOpened=playlistOpened;">✕</button>

    </div>
    <audio ref="audio" id="audio" class="hidden"></audio>
    <ImportModal :show-modal="showModal" :disabled="audioImporting"
                 @request-import="(url:string) => ImportMusic(url)" />
    <SDXDVisualizer :render-size="1.0" />
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, toRaw} from "vue";
import { HomeIcon, ArrowDownOnSquareIcon } from "@heroicons/vue/24/outline";
import PlayerMain from "../components/PlayerMain.vue";
import Playlist from "../components/Playlist.vue";
import ImportModal from "../components/ImportModal.vue";
import {AJAX} from "../libs/requests.ts";
import SDXDVisualizer from "@/components/SDXDVisualizer.vue";

const PLAYLIST = ref([])
const audio = ref<HTMLAudioElement>();
const playerMain = ref();

const showModal = ref(true);
const audioImporting = ref(false);

const playlistOpened = ref(false);

const togglePlaylist = (val: boolean) => {
  playlistOpened.value = val;
}

let listLength = 0;

let currentSong = 0;

const channel = new BroadcastChannel("WBMPE");

const init = ref(false)

let canPlay = false;

function ImportMusic(url: string) {
  PLAYLIST.value = [];
  audioImporting.value = true
  AJAX('GET', url, function(error, response) {
    if (error) {
      console.error(error);
    } else {
      const jsonObject = JSON.parse(response);
      listLength = jsonObject.length;
      PLAYLIST.value = jsonObject;
      channel.postMessage({"action": "overview", "playlist": toRaw(PLAYLIST.value)})
      showModal.value = false
      audioImporting.value = false
      console.log(jsonObject)
      initPlayer()
    }
  });
}

onMounted(() => {

})

function initPlayer() {
  if(init.value) return;
  // currentSong = 0;
  if(!audio.value) throw "ERROR: Audio component is null!";
  initSong();

  const a = audio.value;
  a.crossOrigin = "anonymous";
  a.addEventListener('durationchange', function () {
    channel.postMessage({
      action: "setLen",
      length: a.duration
    })
  });
  audio.value.addEventListener('timeupdate', function() {
    channel.postMessage({
      action: "timeUpdate",
      time: a.currentTime
    })
  })
}

function initSong() {
  let data = toRaw(PLAYLIST.value)[currentSong]
  channel.postMessage({
    action: "init",
    data: data,
    index: currentSong
  })
}

channel.onmessage = (e) => {
  if(!audio.value) throw "ERROR: Audio component is null!";
  const ap: HTMLAudioElement = audio.value;
  const isPlaying: boolean = !ap.paused;
  if (e.data.action === "play") {
    if(!canPlay) {
      canPlay = true;
      ap.src = PLAYLIST.value[currentSong].url;
      deferredPlay(ap);
    }
    else ap.play();
  }
  if (e.data.action === "pause") {
    ap.pause();
  }
  if (e.data.action === "skip") {
    if (e.data.forward) {
      if (currentSong >= listLength - 1) {
        currentSong = 0;
      } else {
        currentSong += 1;
      }
    } else {
      if (currentSong <= 0) {
        currentSong = listLength - 1
      } else {
        currentSong -= 1;
      }
    }
    ap.src = PLAYLIST.value[currentSong].url;
    initSong()
    if(isPlaying) deferredPlay(ap)
  }
  if (e.data.action === "seek") {
    ap.currentTime = e.data.position
  }
  if (e.data.action === "volume") {
    // ap.volume(e.data.volume, true);
  }
  if (e.data.action === "switch") {
    currentSong = e.data.index;
    ap.src = PLAYLIST.value[currentSong].url;
    initSong()
    if(isPlaying) deferredPlay(ap)
  }
}

const deferredPlay = (ap:HTMLAudioElement) => {
  ap.addEventListener('loadeddata', () => {
      ap.play().catch(error => {
        // Handle potential errors during playback (e.g., user gesture required)
        console.error("Error playing audio:", error);
      });
  });
}

</script>
<style scoped lang="postcss">
.playlist_container {
  @apply min-w-[440px] h-screen pb-2 pt-6 absolute right-1 z-[100];
  transform: translateX(100%);
  opacity: 0;
  transition: all 350ms ease;
}
.playlist_container.opened {
  opacity: 1;
  transform: translateX(0%);
}
</style>