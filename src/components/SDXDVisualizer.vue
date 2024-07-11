<template>
  <div class="visualizer_root" style="position: absolute;top: 0;left: 0;right: 0;bottom: 0;z-index: 1;">
    <canvas ref="visualizerCanvas" width="800" height="400"></canvas>
    <div style="display:none;">
      <img id="Hold" :src="HoldTex" />
      <img id="HoldEnd" :src="HoldEndTex" />
    </div>
  </div>
</template>
<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import HoldTex from "../assets/Hold.png"
import HoldEndTex from "../assets/HoldEnd.png"
import {settings} from "../libs/settings.ts";

const props = withDefaults(
    defineProps<{
      // audio: any;
      renderSize: number;
    }>(),
    {
      renderSize: 1.0
    }
)
const visualizerCanvas = ref<HTMLCanvasElement>();
let visualizerCanvasElement: HTMLCanvasElement;
let audio: HTMLAudioElement;
let audioContext: any, audioSrc: any, barAnalyzer: any, gainNode: any;

onMounted(() => {

  if(!visualizerCanvas.value) throw "ERROR: Visualizer Canvas component is null!";
  const ae = document.querySelector("#audio")
  if(!ae) throw "ERROR: Audio component is null!";

  audio = (ae as HTMLAudioElement);
  // else audio = props.audio;
  visualizerCanvasElement = visualizerCanvas.value;
  let c = visualizerCanvasElement.getContext('2d');
  if(!c) throw "ERROR: Visualizer 2D Context not found!";
  const ctx = c as CanvasRenderingContext2D;
  let h = document.getElementById("Hold");
  let he = document.getElementById("HoldEnd");
  if(!h || !he) throw "ERROR: Hold Texture not found!";
  const Hold:CanvasImageSource = h as CanvasImageSource;
  const HoldEnd:CanvasImageSource = he as CanvasImageSource;

  const resize = () => {
    const scale = window.devicePixelRatio * props.renderSize;
    visualizerCanvasElement.style.width = `100vw`;
    visualizerCanvasElement.width  = Math.floor(window.innerWidth * scale);
    visualizerCanvasElement.height = Math.floor(window.innerHeight * scale);
    visualizerCanvasElement.style.height = `${window.innerHeight}px`;
  }
  window.addEventListener('resize', resize);
  resize();

  audioContext = new (window.AudioContext)();
  audioSrc = audioContext.createMediaElementSource(audio);
  barAnalyzer = audioContext.createAnalyser();
  gainNode = audioContext.createGain();

  audioSrc.connect(barAnalyzer);
  audioSrc.connect(gainNode);
  gainNode.connect(audioContext.destination);
  gainNode.gain.value = 0.75;


  const channel = new BroadcastChannel("WBMPE");
  channel.onmessage = (e) => {
    if (e.data.action === "volume") {
      gainNode.gain.value = e.data?.volume;
    }
  }

  barAnalyzer.fftSize = 32;
  // maxDecibels = -10;
  const barBufferLength = barAnalyzer.frequencyBinCount;
  const barBuffer = new Uint8Array(barBufferLength);
  console.log(visualizerCanvasElement.width)
  const step = Math.floor(barBufferLength / 10);
  const start = Math.round(barBufferLength * 0.1)


  const bgAnalyzer = audioContext.createAnalyser();
  bgAnalyzer.smoothingTimeConstant = 0.5;  // Lower value for faster response
  bgAnalyzer.fftSize = 1024;
  let bgBufferLength = bgAnalyzer.frequencyBinCount;
  bgBufferLength = bgBufferLength*0.8;
  const bgBuffer = new Uint8Array(bgBufferLength);
  audioSrc.connect(bgAnalyzer);
  const endRatio = 50 / 1089;


  audio.onplay = () => {
    audioContext.resume().then(() => {
      // video.currentTime = audio.currentTime;
      // video.play();
    });
  };


  let savedRotation = 0;

  function drawWatermark(crit_val:number) {
    ctx.globalAlpha = 0.2;
    // Set the text properties
    ctx.font = '100px cmdysj';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const text = `SulphurDXD™  Visualizer`;
    const centerX = visualizerCanvasElement.width / 2;
    const centerY = visualizerCanvasElement.height / 2;

    ctx.save();


    savedRotation += crit_val / 32000;
    const rot = Math.sin(savedRotation) / 3
    ctx.translate(centerX, centerY);
    ctx.rotate(rot);
    ctx.scale(crit_val / 200, crit_val / 200);

    ctx.fillText(text, 0, 0);

    ctx.restore();
    ctx.textAlign = 'left';
  }

  visualizerDraw();
  watch(() => settings.visualizer, () => {
    visualizerDraw();
  })

  function visualizerDraw() {
    const cw = visualizerCanvasElement.width, ch = visualizerCanvasElement.height;
    const barWidth = (cw / 15);
    const bgWidth = (cw / bgBufferLength) * 2.5;

    if(!settings.visualizer) {
      ctx.clearRect(0, 0, cw, ch);
      return;
    }

    // 获取频率响度数据（取值 0 ~ 255）
    barAnalyzer.getByteFrequencyData(barBuffer);
    bgAnalyzer.getByteFrequencyData(bgBuffer);

    // Bass Pump
    let crit_val = bgBuffer[Math.floor(bgBufferLength*0.2)]

    // 清屏
    ctx.fillStyle = `rgba(0, 0, 0, 0)`;
    ctx.clearRect(0, 0, cw, ch);

    // 绘制背景
    let bx = 0;
    if (settings.visualizerBG > 0) {
      for(let i = 0; i < bgBufferLength; i++) {
        const val = bgBuffer[i];
        const a = val;
        // 透明度对应响度
        ctx.globalAlpha = Math.pow(a, 0.4) / 100;
        // 整体增幅
        ctx.globalAlpha *= (crit_val/25) * (settings.visualizerBG / 100);
        ctx.fillStyle = `rgba(255,255,255)`;
        ctx.fillRect(bx, 0, bgWidth, ch);
        bx += bgWidth;
      }
    }

    let x = barWidth/4;
    drawWatermark(crit_val);

    // 绘制长条
    for(let i = 0; i < 10; i++) {
      ctx.globalAlpha = settings.visualizerBar / 100;
      const index = start + i * step
      const raw_value = (barBuffer[index]) / 255;


      const ix = i / barBufferLength;

      const adjustedIndex1 = Math.log2(ix + 1) + 0.5;

      let processedVal = raw_value * Math.pow(adjustedIndex1, 0.35);

      processedVal *= processedVal * processedVal

      const barHeight = processedVal * ch / 3;
      const endHeight = barWidth * endRatio

      ctx.drawImage(Hold, x, ch - barHeight + endHeight, barWidth, ch / 2.5)
      ctx.drawImage(HoldEnd, x, ch - barHeight, barWidth, endHeight)

      if(settings.debug) {
        ctx.globalAlpha = 0.3;
        ctx.font = `${(10 * processedVal + 20) * props.renderSize}px cmdysj`;
        ctx.fillText("Buffer "+index, x + 5, ch / 1.09);
        ctx.fillText("Raw: "+raw_value.toFixed(2), x + 5, ch / 1.054);
        ctx.fillText("Post: "+processedVal.toFixed(2), x + 5, ch / 1.02);
      }

      x += barWidth + barWidth/2;
    }
    requestAnimationFrame(visualizerDraw);
  }

})
</script>
<style scoped>

</style>