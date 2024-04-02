<template>
    <div class="w-full h-full flex flex-col justify-center items-center gap-3 p-5">
      <div class="cover-wrapper w-full rounded-box shadow-lg bg-base-300 cover aspect-square overflow-hidden">
        <img :class="`cover w-full aspect-square ${coverLoaded? '':'cover_loading'}`" :src="coverUrl" @load="coverLoaded=true">
      </div>
      <div class="song_basic_info text-left w-full flex flex-col px-1 items-stretch">
        <h1 class="text-lg font-bold text-white">{{ songName }}</h1>
        <a target="_blank" :href="`https://www.bing.com/search?q=${songArtist}`" class="text-sm text-gray-400 italic underline underline-offset-1">{{ songArtist }}</a>
      </div>
      <div class="progress-container w-full flex flex-col items-stretch justify-center px-1 pt-1 mb-0.5">
        <div class="flex flex-row w-full justify-between mb-0.5">
          <span class="from_start text-xs font-light text-gray-400">{{ currentLen }}</span>
          <span class="from_end text-xs font-light text-gray-400">-{{ remainLen }}</span>
        </div>
        <input type="range" min="0" max="1000" class="appkit_slider" ref="progress"
               @mousedown="onProgressMouse(true)" @mouseup="onProgressMouse(false)"
               @input="onProgressChange"  v-model="progressValue"/>
      </div>
      <div class="action-container  w-full flex flex-row justify-between items-center gap-2">
        <button class="btn btn-sm btn-ghost p-1">
          <ArrowPathRoundedSquareIcon class="h-6 text-gray-400" />
        </button>
        <button class="btn btn-lg btn-circle btn-ghost ml-[auto]" @click="skip(false)">
          <BackwardIcon class="h-10 text-white" />
        </button>
        <button class="btn btn-lg btn-circle btn-ghost" @click="onPlayPauseClicked">
          <PauseIcon :class="`h-10 text-white ${operatePlay? '':'hidden'}`" />
          <PlayIcon :class="`h-10 text-white  ${operatePlay? 'hidden':''}`" />
        </button>
        <button class="btn btn-lg btn-circle btn-ghost mr-[auto]" @click="skip(true)">
          <ForwardIcon class="h-10 text-white" />
        </button>
        <button class="btn btn-sm btn-ghost p-1">
          <HeartIconOutline class="h-6 text-gray-400" />
          <HeartIcon class="h-6 text-white hidden" />
        </button>
      </div>
      <div class="flex flex-row w-full justify-between items-center px-1 gap-3">
        <SpeakerXMarkIcon class="h-6 text-gray-400" />
        <input type="range" min="0" max="1000" value="700" class="appkit_slider" v-model="volumeValue" @change="onVolumeChange" />
        <SpeakerWaveIcon class="h-6 text-gray-400" />
      </div>
    </div>
</template>
<script setup lang="ts">
import cover from "@/assets/cover_default.png"
import { PauseIcon, PlayIcon, ForwardIcon, BackwardIcon,
  ArrowPathRoundedSquareIcon, HeartIcon,
  SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/vue/24/solid";
import { HeartIcon as HeartIconOutline } from "@heroicons/vue/24/outline";
import { ref } from "vue";

function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const minutesString = String(minutes).padStart(2, '0');
  const secondsString = String(remainingSeconds).padStart(2, '0');
  return `${minutesString}:${secondsString}`;
}

const coverLoaded = ref<boolean>(false);

function AJAX(method, url, callback) {
  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status >= 200 && xhr.status < 300) {
        callback(null, xhr.responseText, xhr.responseURL);
      } else {
        callback(new Error('Request failed with status: ' + xhr.status));
      }
    }
  };

  xhr.open(method, url, true);
  xhr.send();
}

function GetRealUrl(url, callback) {
  AJAX('HEAD', url, function(error, response, url) {
    if (error) {
      console.error(error);
    } else {
      callback(url.split("?")[0]);
    }
  })

}

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
    GetRealUrl(songData.pic, function(url) {
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

</script>
<style>
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
  @apply m-0 my-1 opacity-100 h-[24px];
}
.cover {
  opacity: 1;
  backdrop-filter: blur(0px);
  transition: all 250ms ease;
  z-index: 1;
}
.cover.cover_loading {
  backdrop-filter: blur(50px);
  opacity: 0;
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