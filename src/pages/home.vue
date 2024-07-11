<template>
  <div :class="{'player_root': true, 'TVMode': settings.TVMode}">
    <div class="absolute float-left left-4 top-4 flex z-[3]">
      <a class="z-[1024] btn btn-ghost" href="/">
        <HomeIcon class="h-6 w-6 text-white" />
      </a>
      <button class="btn btn-ghost" @click="showModal=true">
        <ArrowDownOnSquareIcon class="h-6 w-6 text-white" />
      </button>
      <button class="btn btn-ghost" @click="settingsModal.showModal()">
        <Cog6ToothIcon class="h-6 w-6 text-white" />
      </button>
    </div>

    <div class="window_base">
      <PlayerMain ref="playerMain"
                  @request-playlist-open="(val) => togglePlaylist(val)">
      </PlayerMain>
    </div>
    <Lyric />

    <div :class="`window_base playlist_container ${playlistOpened? 'opened': ''}`">
      <Playlist></Playlist>
      <button class="btn btn-circle btn-ghost backdrop-blur-lg absolute right-2 top-7"
      @click="playlistOpened = false;playerMain.playlistOpened=playlistOpened;">✕</button>

    </div>
    <audio ref="audio" id="audio" class="hidden"></audio>
    <ImportModal :show-modal="showModal" :disabled="audioImporting"
                 @request-import="(url:string) => ImportMusic(url)" />
    <SettingsModal ref="settingsModal" />
    <SDXDVisualizer :render-size="1.0" />
    <Background :render-size="1.0" />
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, toRaw} from "vue";
import { settings } from '../libs/settings'
import { HomeIcon, ArrowDownOnSquareIcon, Cog6ToothIcon } from "@heroicons/vue/24/outline";
import PlayerMain from "../components/PlayerMain.vue";
import Playlist from "../components/Playlist.vue";
import ImportModal from "../components/ImportModal.vue";
import {AJAX} from "../libs/requests.ts";
import SDXDVisualizer from "../components/SDXDVisualizer.vue";
import {deferredPlay, fadeIn} from "../libs/audio.ts";
import Background from "../components/Background.vue";
import Lyric from "../components/Lyric.vue";
import SettingsModal from "../components/SettingsModal.vue";

interface SongData {
  url: string;
  lrc: string;
  pic: string;
  name: string;
  artist: string;
}
const PLAYLIST = ref<SongData[]>([])
const audio = ref<HTMLAudioElement>();
const playerMain = ref();
const settingsModal = ref();

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
  channel.postMessage({"action": "play"});
  canPlay = true;
  a.src = PLAYLIST.value[currentSong].url;
  deferredPlay(a);
}

function initSong() {
  let data = toRaw(PLAYLIST.value)[currentSong]
  channel.postMessage({
    action: "init",
    data: data,
    index: currentSong
  })
}

let fai:number|null = null;
channel.onmessage = (e) => {
  if(!audio.value) throw "ERROR: Audio component is null!";
  const ap: HTMLAudioElement = audio.value;
  const isPlaying: boolean = !ap.paused;

  switch (e.data.action) {
    case "play":
      if(!canPlay) {
        canPlay = true;
        ap.src = PLAYLIST.value[currentSong].url;
        deferredPlay(ap);
      }
      else fai = fadeIn(ap, 100);
      return;
    case "pause":
      if(fai) clearInterval(fai);
      ap.pause();
      return;
    case "skip":
      if (e.data.forward) {
        if (currentSong >= listLength - 1) currentSong = 0;
        else currentSong += 1;
      } else {
        if (currentSong <= 0) currentSong = listLength - 1
        else currentSong -= 1;
      }
      ap.src = PLAYLIST.value[currentSong].url;
      initSong()
      if(isPlaying) deferredPlay(ap)
      playerMain.value.operatePlay = true;
      return;
    case "seek":
      ap.currentTime = e.data.position
      if(isPlaying || e.data.forcePlay) {
        fai = fadeIn(ap, 100);
        playerMain.value.operatePlay = true;
      }
      return;
    case "switch":
      currentSong = e.data.index;
      ap.src = PLAYLIST.value[currentSong].url;
      initSong()
      if(isPlaying) deferredPlay(ap)
      return;
    case "volume":
      return;
    default: return;
  }
}


</script>
<style scoped lang="postcss">
.player_root {
  @apply w-screen h-screen flex flex-row justify-center items-center gap-6 pl-24;
}
.player_root.TVMode {
  @apply justify-start items-end p-0;
}
.playlist_container {
  @apply min-w-[440px] h-screen pb-2 pt-6 absolute right-1 top-0 z-[100];
  transform: translateX(102%);
  transition: transform 350ms ease;
}
.playlist_container.opened {
  transform: translateX(0%);
  transition: transform 350ms ease;
}
</style>