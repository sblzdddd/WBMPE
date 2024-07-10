<template>
  <div class="background_root" style="position: absolute;top: 0;left: 0;right: 0;bottom: 0;z-index: -1;">
    <canvas ref="videoCanvas" width="800" height="400" style="position: absolute;z-index: -1;"></canvas>
    <video id="video" src="test.mp4" style="position: absolute;z-index: 2;filter: blur(16px);display: none;"></video>
  </div>

</template>
<script setup lang="ts">
const props = withDefaults(
    defineProps<{
      audio: any;
      renderSize: number;
    }>(),
    {
      renderSize: 1.0
    }
)
import {onMounted, ref} from "vue";

const videoCanvas = ref<HTMLCanvasElement>();
let videoCanvasElement: HTMLCanvasElement
let vCtx: CanvasRenderingContext2D;

onMounted(() => {
  if(!videoCanvas.value) throw "ERROR: Video Canvas component is null!";
  const ae = document.querySelector("#audio")
  if(!props.audio && !ae) throw "ERROR: Audio component is null!";

  if(!props.audio && ae) audio = (ae as HTMLAudioElement);
  else audio = props.audio;

  videoCanvasElement = videoCanvas.value;
  vCtx = videoCanvasElement.getContext('2d');
  const resize = () => {
    const scale = window.devicePixelRatio * props.renderSize;
    videoCanvasElement.style.width = `100vw`;
    videoCanvasElement.style.height = `${window.innerHeight}px`;
  }

  //
  // audio.ontimeupdate = () => {
  //   if (!video.paused && !video.seeking) {
  //     video.currentTime = audio.currentTime;
  //   }
  // };
  //
  // audio.onpause = () => {
  //   video.pause();
  // };
  //
  // audio.onseeked = () => {
  //   video.currentTime = audio.currentTime;
  // };

  // audio.onplay = () => {
  //   audioContext.resume().then(() => {
  //     video.currentTime = audio.currentTime;
  //     video.play();
  //   });
  // };


// video.addEventListener( "loadedmetadata", function (e) {
//   var width = this.videoWidth,
//       height = this.videoHeight;
//   vCanvas.width  = Math.floor(width * renderSize);
//   vCanvas.height = Math.floor(height * renderSize);
//   console.log(1)
// }, false );

// function videoDraw() {
//   vCtx.filter = `blur(${5 * renderSize}px)`;
//   vCtx.drawImage(video, 0, 0, vCanvas.width, vCanvas.height);
//   requestAnimationFrame(videoDraw);
// }
// videoDraw()
})
</script>
<style scoped>

</style>