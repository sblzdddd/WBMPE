<template>
<div class="w-100 h-screen p-4 flex flex-row gap-6">
  <div class="absolute float-left left-10 top-6 flex">
    <a class="z-[1024] btn btn-ghost" href="/">
      <HomeIcon class="h-6 w-6 text-white" />&nbsp;
      Back to Home
    </a>
    <button class="btn btn-ghost" @click="showModal=true">
      <ArrowDownOnSquareIcon class="h-6 w-6 text-white" />&nbsp;
      Import Playlist
    </button>
  </div>
  <div class="min-w-[450px] aspect-[50/90] window_base">
    <iframe src="/#/PlayerMain"></iframe>
  </div>
<!--  <div class="grow window_base">-->
<!--    <iframe src="/Lyric"></iframe>-->
<!--  </div>-->
  <div class="grow min-w-[30vw] window_base">
    <iframe src="/#/Playlist"></iframe>
  </div>
  <div class="aplayer_container" ref="aplayer_container"></div>
  <input type="checkbox" id="my_modal_6" class="modal-toggle" v-model="showModal" />
  <div class="modal" role="dialog">
    <div class="modal-box text-left w-2/3 max-w-5xl">
      <h3 class="font-bold text-lg">Import Playlist</h3>
      <p class="py-4">Please specify a url (api url) that returns a playlist JSON with aplayer song data format.</p>
      <p>For more information about this, see
        <a class="text-primary underline underline-offset-1" target="_blank"
           href="https://github.com/sblzdddd/WBMPE?tab=readme-ov-file#how-to-use">How to use</a>.
      </p>
      <p class="pt-2">Or click the "Example" button for a demo playlist url</p>
      <div class="join pt-4 w-full">
        <input :class="`grow input input-bordered join-item ${audioImporting?'input-disabled':''}`"
               v-model="playlistUrl" placeholder="Playlist Url"/>
        <button :class="`btn join-item btn-accent ${audioImporting?'btn-disabled':''}`"
                @click="playlistUrl='https://api.injahow.cn/meting/?type=playlist&id=7331352483'">Example</button>
      </div>
      <div class="modal-action">
        <button :class="`w-full btn btn-primary ${playlistUrl=='' || audioImporting ? 'btn-disabled':''}`"
                @click="ImportMusic(playlistUrl)">
          <span :class="`loading ${audioImporting?'':'hidden'}`"></span>Import</button>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
// https://v.iarc.top/?type=playlist&id=7331352483

import {onMounted, ref, toRaw, watch} from "vue";
import { HomeIcon, ArrowDownOnSquareIcon } from "@heroicons/vue/24/outline";


const PLAYLIST = ref([])
const aplayer_container = ref();
const playlistUrl = ref("");

const audioImporting = ref(false);
const showModal = ref(true);

let listLength = 0;

let currentSong = 0;

const channel = new BroadcastChannel("WBMPE");

const init = ref(false)

let ap;

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

const HQCover = true

function ImportMusic(url) {
  PLAYLIST.value = [];
  audioImporting.value = true
  AJAX('GET', url, function(error, response, url) {
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
      initAplayer(PLAYLIST.value)
    }
  });
}

onMounted(() => {
})


function initAplayer(data) {
  if(!init.value) {
    init.value = true;
    ap = new APlayer({
      container: aplayer_container.value,
      fixed: true,
      autoplay: false,
      loop: false,
      order: 'random',
      preload: 'auto',
      volume: 0.7,
      mutex: true,
      listFolded: false,
      listMaxHeight: 90,
      lrcType: 3,
      audio: data,
    });
    ap.volume(0.7, true)
    ap.list.switch(currentSong)
    initSong()
    ap.on('durationchange', function () {
      channel.postMessage({
        action: "setLen",
        length: ap.audio.duration
      })
    });
    ap.on('timeupdate', function(e) {
      channel.postMessage({
        action: "timeUpdate",
        time: ap.audio.currentTime
      })
    })
  }
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
  if (e.data.action === "play") {
    ap.play();
  }
  if (e.data.action === "pause") {
    ap.pause();
  }
  if (e.data.action === "skip") {
    console.log(currentSong)
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
    ap.list.switch(currentSong)
    initSong()
  }
  if (e.data.action === "seek") {
    ap.seek(e.data.position);
  }
  if (e.data.action === "volume") {
    ap.volume(e.data.volume, true);
  }
  if (e.data.action === "switch") {
    currentSong = e.data.index;
    ap.list.switch(currentSong)
    initSong()
  }
}


// try {
//   fetch(apiUrl, {method: 'HEAD', redirect: 'follow'}).then((response) => {
//     const finalUrl = response.url.split('?')[0];
//   });
// }
// catch (error) {
//   console.error('Error fetching URL:', error);
//   return null;
// }

</script>

<style>
iframe {
  @apply grow;
  color-scheme: none;
}
.aplayer-body, .aplayer-list {
  display: none;
}
.aplayer.aplayer-fixed .aplayer-lrc {
  width: 450px;
  display: block;
  position: fixed;
  bottom: 55px;
  left: 2rem;
  right: 0;
  margin: 0;
  z-index: 98;
  pointer-events: none;
  color: white!important;
  text-shadow: none!important;
}
.aplayer .aplayer-lrc p {
  color: white;
}
</style>