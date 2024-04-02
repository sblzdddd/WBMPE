<script setup lang="ts">
import { PlayIcon, ArrowTopRightOnSquareIcon } from "@heroicons/vue/24/outline";



</script>

<template>
  <div class="home-container">
    <video class="parallax-bg" src="@/assets/background_compressed.mp4" muted autoplay></video>
    <h1 class="home-title">WBMPE</h1>
    <p class="z-[1] text-lg font-bold">A simple media player online.</p>
    <div class="z-[1] flex gap-5">
      <button class="btn btn-accent rounded-full" @click="$router.push('Player')">
        <PlayIcon class="h-6 w-6 text-black" />
        Launch Player
      </button>
      <button class="btn btn-active btn-secondary rounded-full">
        <ArrowTopRightOnSquareIcon class="h-6 w-6 text-black" />
        Source Code
      </button>
    </div>
  </div>
</template>

<style scoped>
video {
 filter: hue-rotate(256deg) blur(30px);
  animation: hueShift 50s infinite;
}
@keyframes hueShift {
  from {
    filter: hue-rotate(256deg) blur(30px);
  }
  50% {
    filter: hue-rotate(350deg) blur(30px);
  }
  to {
    filter: hue-rotate(256deg) blur(30px);
  }
}
.home-container {
  @apply w-screen h-screen flex flex-col justify-center items-center gap-5;
}
.parallax-bg {
  position: fixed;
  z-index: 0;
  height: 100vh;
  width: 100vw;
  object-fit: cover;
}
.home-title {
  @apply z-[10]
  text-7xl md:text-8xl lg:text-[10rem] font-black;
  background: linear-gradient(to right, #00fee3, #bd34fe);
  color: #ffffffc0;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>