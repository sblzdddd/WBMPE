<template>
<div class="w-100 h-screen p-4 flex flex-row gap-6">
  <a class="btn btn-ghost btn-lg absolute float-left left-10 top-6" href="/">
    <HomeIcon class="h-6 w-6 text-white" />&nbsp;
    Back to Home
  </a>
  <div class="min-w-[450px] aspect-[50/90] window_base">
    <iframe src="/PlayerMain"></iframe>
  </div>
<!--  <div class="grow window_base">-->
<!--    <iframe src="/Lyric"></iframe>-->
<!--  </div>-->
  <div class="grow min-w-[30vw] window_base">
    <iframe src="/Playlist"></iframe>
  </div>
  <div class="aplayer_container" ref="aplayer_container"></div>
</div>
</template>

<script setup>
// https://v.iarc.top/?type=playlist&id=7331352483

import {onMounted, ref, toRaw, watch} from "vue";
import { HomeIcon } from "@heroicons/vue/24/outline";


const PLAYLIST = ref([])
const aplayer_container = ref();
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

onMounted(() => {
  AJAX('GET', "https://v.iarc.top/?type=playlist&id=7331352483", function(error, response, url) {
    if (error) {
      console.error(error);
    } else {
      const jsonObject = JSON.parse(response);
      listLength = jsonObject.length;
      jsonObject.map(function(item) {
        let i = item;
        PLAYLIST.value.push(i);
      });
    }
  });
})

watch(PLAYLIST.value, (newValue, oldValue) => {

  console.log(PLAYLIST.value);
  channel.postMessage({"action": "overview", "playlist": toRaw(PLAYLIST.value)})
  if (PLAYLIST.value.length == listLength) {
    initAplayer(PLAYLIST.value)
  }
});


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