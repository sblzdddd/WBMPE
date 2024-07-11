<template>
  <div class="lyric_root">
    <div :class="`lyric_container ${loaded? '':'opacity-0'}`" ref="container">
      <div class="lyric_space"></div>

      <div :class="`lyric_item ${i-1==currentLyric? 'active': ''}`" v-for="i in lyric.length" :key="i" @click="goto(i-1)"
      ref="itemRefs">
        <p class="lyric">{{ lyric[i-1].text }}</p>
        <p class="lyric-alt" v-if="lyric[i-1].alt">{{ lyric[i-1].alt }}</p>
      </div>

      <div class="lyric_space"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {fetchLrc, getCurrentLyric, type LyricData} from "@/libs/lrc.ts";
import {ref, watch} from "vue";

const lyric = ref<LyricData[]>([]);
const currentLyric = ref(0);
const loaded = ref(false)
const isFakeSeeking = ref(false)

const itemRefs = ref([]);
const container = ref();

const channel = new BroadcastChannel("WBMPE");
channel.onmessage = (e) => {
  const songData = e.data?.data;
  if (e.data?.action === "init") {
    loaded.value = false;
    if(!songData.lrc) {lyric.value=[];return;}
    fetchLrc(songData.lrc, function (data: LyricData[]) {
      lyric.value = data;
      loaded.value = true;
    })
  }
  if(e.data?.action === "fakeSeek") {
    if(!lyric.value || lyric.value.length <= 0) return;
    currentLyric.value = getCurrentLyric(lyric.value, e.data?.position)
    isFakeSeeking.value = true;
  }
  if(e.data?.action === "fakeSeekEnd") {
    isFakeSeeking.value = false;
  }
  if(e.data?.action === "timeUpdate") {
    if(!lyric.value || lyric.value.length <= 0) return;
    if(isFakeSeeking.value) return;
    const c = e.data?.time;
    currentLyric.value = getCurrentLyric(lyric.value, c)
  }
}

watch(() => currentLyric.value, () => {
  scrollToCenter(itemRefs.value[currentLyric.value]);
})

function goto(i:number) {
  channel.postMessage({"action": "seek", "position": lyric.value[i].start, 'forcePlay': true})
}
function scrollToCenter(targetElement:HTMLDivElement) {
  targetElement.scrollIntoView({
    behavior: isFakeSeeking.value ? 'instant':'smooth',
    block: 'center',
  })
}

</script>
<style scoped lang="postcss">
.lyric_root {
  @apply py-16 w-full h-screen z-[2];
  mask-image: linear-gradient(to bottom,
  rgba(0, 0, 0, 0) 10%,
  rgba(0, 0, 0, 1) 40%,
  rgba(0, 0, 0, 1) 60%,
  rgba(0, 0, 0, 0) 90%
  );
}
.lyric_container {
  @apply pr-20 h-full overflow-y-auto;
  transition: all 250ms ease;
}
.lyric_item {
  @apply relative mb-2 p-6 rounded-md cursor-pointer;
  transition: all 250ms ease;
}
.lyric_item:active {
  @apply scale-[0.98];
}
/* select highight */
.lyric_item::before {
  content: "";
  position: absolute;
  background: #ffffff20;
  @apply top-0 left-0 right-0 bottom-0 opacity-0 scale-95 rounded-md;
  transition: all 250ms ease;
}
.lyric_item:hover::before {
  @apply scale-100 opacity-100;
}

.lyric {
  @apply text-3xl text-right;
  transition: all 250ms ease;
}
.lyric-alt {
  @apply text-gray-300 text-right;
  transition: all 250ms ease;
}

.lyric_item.active .lyric {
  @apply text-4xl font-bold;
  filter: drop-shadow(0px 0px 5px rgba(255, 255, 255, 0.71));
}
.lyric_item.active .lyric-alt {
  @apply text-lg font-medium text-white;
  filter: drop-shadow(0px 0px 5px rgba(255, 255, 255, 0.45));
}

.lyric_space {
  @apply h-[46%];
}
</style>