<template>
  <div class="background_root" style="position: absolute;top: 0;left: 0;right: 0;bottom: 0;z-index: 0;">
    <canvas ref="videoCanvas" width="800" height="400" style="position: absolute;"></canvas>
    <video id="video" style="position: absolute;z-index: 2;filter: blur(16px);display: none;"></video>
    <img class="hidden" ref="coverImg">
    <img class="hidden" ref="coverImgNew" @load="coverLoaded=true">
  </div>

</template>
<script setup lang="ts">
import {GetRealUrl} from "@/libs/requests.ts";

const props = withDefaults(
    defineProps<{
      renderSize: number;
    }>(),
    {
      renderSize: 1.0
    }
)
import {onMounted, ref} from "vue";
import {settings} from "@/libs/settings.ts";

const coverImg = ref();
const coverImgNew = ref();
const coverLoaded = ref(false);
const channel = new BroadcastChannel("WBMPE");
channel.onmessage = (e) => {
  const songData = e.data?.data;
  if (e.data?.action === "init") {
    GetRealUrl(songData.pic, function (url: string) {
      console.log(url)
      coverImgNew.value.src = url;
      coverLoaded.value = false;
    })
  }
}
function drawImageCover(img: HTMLImageElement | HTMLVideoElement, opacity = 1) {
  const blur = settings.bgBlur;
  const ctx = vCtx;
  const cw = videoCanvasElement.width
  const ch = videoCanvasElement.height;
  const imgWidth = img.width;
  const imgHeight = img.height;
  const canvasAspectRatio = cw / ch;
  const imgAspectRatio = imgWidth / imgHeight;

  let drawWidth, drawHeight, offsetX, offsetY;

  if (canvasAspectRatio > imgAspectRatio) {
    // Canvas is wider than image
    drawWidth = cw;
    drawHeight = drawWidth / imgAspectRatio;
    offsetX = 0;
    offsetY = (ch - drawHeight) / 2;
  } else {
    // Canvas is taller than image
    drawHeight = ch;
    drawWidth = drawHeight * imgAspectRatio;
    offsetX = (cw - drawWidth) / 2;
    offsetY = 0;
  }

  // Save the current canvas state
  ctx.save();
  ctx.filter = `blur(${blur * props.renderSize}px)`;
  // Set the global alpha (opacity)
  ctx.globalAlpha = opacity;
  // Draw the image
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  // Restore the canvas state
  ctx.restore();
}

const videoCanvas = ref<HTMLCanvasElement>();
let videoCanvasElement: HTMLCanvasElement
let vCtx: CanvasRenderingContext2D;
const width = 640;

let audio: HTMLAudioElement;

onMounted(() => {
  if(!videoCanvas.value) throw "ERROR: Video Canvas component is null!";
  const ae = document.querySelector("#audio")
  if(!ae) throw "ERROR: Audio component is null!";

  audio = (ae as HTMLAudioElement);
  console.log(audio)

  videoCanvasElement = videoCanvas.value;
  let c = videoCanvasElement.getContext('2d');
  if(!c) throw "Error: Background xontext 2D not found!"
  vCtx = c;
  const resize = () => {
    videoCanvasElement.style.width = `100vw`;
    videoCanvasElement.style.height = `${window.innerHeight}px`;
    videoCanvasElement.width  = Math.floor(width);
    videoCanvasElement.height = Math.floor(width / window.innerWidth * window.innerHeight);
  }
  resize();
  window.onresize = resize;

  let msPrev = window.performance.now()
  const fps = 45
  const msPerFrame = 1000 / fps
  let crossfadeDuration = 400; // Duration in milliseconds
  let startTime:number|null;
  let isTransitioning = false;


  function videoDraw() {
    requestAnimationFrame(videoDraw);
    const msNow = window.performance.now()
    const msPassed = msNow - msPrev
    if (msPassed < msPerFrame) return
    msPrev = msNow
    let progress;
    if(coverLoaded.value) {
      coverLoaded.value = false;
      isTransitioning = true;
    }
    if(isTransitioning) {
      if (!startTime) startTime = performance.now();
      const elapsedTime = performance.now() - startTime;
      progress = Math.min(elapsedTime / crossfadeDuration, 1);
    } else {
      progress = 0;
    }

    const ctx = vCtx;
    const cw = videoCanvasElement.width, ch = videoCanvasElement.height;
    ctx.clearRect(0, 0, cw, ch);

    drawImageCover(coverImg.value, 1-progress)
    if (isTransitioning) {
      drawImageCover(coverImgNew.value, progress)
    }

    ctx.globalAlpha = settings.bgDim / 100;
    ctx.fillStyle = `rgb(0, 0, 0)`;
    ctx.fillRect(0, 0, cw, ch);

    // Continue the animation if not completed
    if (progress < 1) {
    } else {
      coverImg.value.src = coverImgNew.value.src;
      coverImgNew.value.src = ""
      isTransitioning = false;
      startTime = null;
    }
  }
  videoDraw()

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

})
</script>
<style scoped>

</style>