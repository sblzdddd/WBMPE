<template>
    <div class="PlayerMain">
      <div class="cover-wrapper">
        <img :class="`cover ${coverLoaded? '':'cover_loading'}`" :src="coverUrl" @load="coverLoaded=true">
      </div>
      <div class="player-content">
        <div class="song_basic_info">
          <h1 class="song_name">{{ songName }}</h1>
          <a target="_blank" :href="`https://www.bing.com/search?q=${songArtist}`" class="song_artist">{{ songArtist }}</a>
        </div>
        <div class="action-container">
          <button class="btn btn-sm btn-ghost p-1">
            <ArrowPathRoundedSquareIcon class="h-6 text-gray-400" />
          </button>

          <button class="btn btn-sm btn-ghost p-1 ml-[auto]" @click="skip(false)">
            <BackwardIcon class="h-6 text-white" />
          </button>
          <button class="btn btn-sm btn-ghost p-1" @click="onPlayPauseClicked">
            <PauseIcon :class="`h-6 text-white ${operatePlay? '':'hidden'}`" />
            <PlayIcon :class="`h-6 text-white  ${operatePlay? 'hidden':''}`" />
          </button>
          <button class="btn btn-sm btn-ghost p-1 mr-[auto]" @click="skip(true)">
            <ForwardIcon class="h-6 text-white" />
          </button>

          <button class="btn btn-sm btn-ghost p-1"
                  @click="playlistOpened = !playlistOpened;
                          emit('requestPlaylistOpen', playlistOpened)
          ">
            <QueueListIcon v-if="playlistOpened" class="h-6 text-gray-400" />
            <QueueListIconOutline v-else class="h-6 text-gray-400" />
          </button>
        </div>
        <div class="progress-container">
          <span class="from_start">{{ currentLen }}</span>
          <input type="range" min="0" max="1000" class="appkit_slider" ref="progress"
                 @mousedown="onProgressMouse(true)" @mouseup="onProgressMouse(false)"
                 @input="onProgressChange"  v-model="progressValue"/>
          <span class="from_end">-{{ remainLen }}</span>
        </div>
      </div>

      <div class="hidden flex flex-row w-full justify-between items-center px-1 gap-3">
        <SpeakerXMarkIcon class="h-6 text-gray-400" />
        <input type="range" min="0" max="1000" value="700" class="appkit_slider no-anim" v-model="volumeValue" @change="onVolumeChange" />
        <SpeakerWaveIcon class="h-6 text-gray-400" />
      </div>
    </div>
</template>
<script setup lang="ts">
import cover from "@/assets/cover_default.png"
import { PauseIcon, PlayIcon, ForwardIcon, BackwardIcon,
  ArrowPathRoundedSquareIcon, QueueListIcon,
  SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/vue/24/solid";
import { QueueListIcon as QueueListIconOutline } from "@heroicons/vue/24/outline"
import { ref } from "vue";
import {GetRealUrl} from "../libs/requests.ts";

const emit = defineEmits(['requestPlaylistOpen', 'unhover'])
const playlistOpened = ref(false);

function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const minutesString = String(minutes).padStart(2, '0');
  const secondsString = String(remainingSeconds).padStart(2, '0');
  return `${minutesString}:${secondsString}`;
}

const coverLoaded = ref<boolean>(false);


const coverUrl = ref<string>(cover)

const songName = ref<string>("songName")
const songArtist = ref<string>("Artist")
const currentLen = ref<string>("00:00")
const remainLen = ref<string>("00:00")

const progressValue = ref(0);
const volumeValue = ref(700);

const channel = new BroadcastChannel("WBMPE");

const operatePlay = ref<boolean>(false);

const isProgressDrag = ref<boolean>(false);

const totalLength = ref<number>(0);

channel.onmessage = (e) => {
  const songData = e.data?.data;
  if (e.data?.action === "init") {
    GetRealUrl(songData.pic, function(url:string) {
      coverUrl.value = url;
      coverLoaded.value = false;
    })
    songName.value = songData.name;
    songArtist.value = songData.artist;
    progressValue.value = 0;
  }
  if(e.data?.action === "setLen") {
    totalLength.value = e.data?.length;
    remainLen.value = formatSeconds(totalLength.value);
    progressValue.value = 0;
  }
  if(e.data?.action === "timeUpdate") {
    if(!isProgressDrag.value) {
      const c = e.data?.time;
      currentLen.value = formatSeconds(c);
      const r = totalLength.value - c;
      remainLen.value = formatSeconds(r);
      progressValue.value = 1000 * c / totalLength.value;
    }
  }
  if (e.data?.action === "play" || e.data?.action === "pause") {
    operatePlay.value = e.data?.action == "play"
  }
  if (e.data?.action === "test") {
    coverLoaded.value = false;
  }
}

const onPlayPauseClicked = () => {
  operatePlay.value = !operatePlay.value;
  if (operatePlay.value) {
    channel.postMessage({"action": "play"})
  } else {
    channel.postMessage({"action": "pause"})
  }
}

function skip(forward: boolean) {
  coverLoaded.value = false;
  channel.postMessage({"action": "skip", "forward": forward})
}

function onProgressMouse(isDown: boolean) {
  isProgressDrag.value = isDown;
  if(!isDown) {
    channel.postMessage({"action": "seek", "position": totalLength.value * (progressValue.value / 1000)})
  }
}

function onProgressChange() {
  if(isProgressDrag.value) {
    const c = totalLength.value * (progressValue.value / 1000);
    currentLen.value = formatSeconds(c);
    const r = totalLength.value - c;
    remainLen.value = formatSeconds(r);
  }
}

function onVolumeChange() {
  channel.postMessage({"action": "volume", "volume": (volumeValue.value / 1000)})
}
defineExpose({playlistOpened})
</script>
<style scoped lang="postcss">

.PlayerMain {
  @apply w-full h-full flex flex-col justify-center items-center gap-3;
}

.cover-wrapper {
  @apply relative w-full rounded-md bg-base-300 cover aspect-square overflow-hidden;
  box-shadow: 0 7px 12px -8px #000000a8;
}
.cover {
  @apply w-[440px];
  opacity: 1;
  backdrop-filter: blur(0px);
  transition: all 250ms ease;
  z-index: 1;
}
.cover.cover_loading {
  backdrop-filter: blur(50px);
  opacity: 0;
}

.player-content {
  @apply w-full flex flex-col justify-center items-center gap-3 px-2;
}

.song_basic_info {
  @apply text-center w-full flex flex-col pt-5 gap-1 items-stretch;
}

.song_name {
  @apply text-3xl font-bold text-white;
}

.song_artist {
  @apply text-lg text-gray-400;
}

.action-container {
  @apply w-full flex flex-row justify-between items-center gap-2 mb-1;
}

.progress-container {
  @apply w-full flex flex-row items-center justify-center gap-4 px-1;
}
.from_start, .from_end {
  @apply w-12 text-xs font-light text-gray-400;
}
.appkit_slider {
  @apply w-full rounded-full;
  appearance :none;
  background: none;
  cursor: pointer;
  -webkit-appearance: none;
  height: 12px;
  background: #ffffff50;
  outline: none;
  opacity: 0.5;
  transition: opacity 500ms ease, height 300ms cubic-bezier(0.32, 2, 0.7, 1), margin 300ms cubic-bezier(0.32, 2, 0.7, 1);
  overflow: hidden;
}
.appkit_slider:hover {
  @apply opacity-100;
}
.appkit_slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 0;
  width: 0;
  background-color: transparent;
  border-radius: 50%;
  box-shadow: -400px 0 0 400px #ffffff;
  transition: height 300ms cubic-bezier(0.32, 2, 0.7, 1);
}
</style>