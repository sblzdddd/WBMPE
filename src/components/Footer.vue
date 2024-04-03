<script setup lang="ts">

</script>

<template>
  <footer class="z-[1] relative footer-container">
    <h1 class="footer-title">WBMPE</h1>
    <div class="credits">
      <h2>Made by <b class="text-primary">Donovan 22103</b></h2>
      <h2 class="flex">Built with&nbsp;
        <a class="flex items-center" href="https://vitejs.dev" target="_blank">
          <img src="@/assets/vite.svg" class="logo" alt="Vite logo" />&nbsp;Vite
        </a>&nbsp;and&nbsp;
        <a class="flex items-center" href="https://vuejs.org/" target="_blank">
          <img src="@/assets/vue.svg" class="logo vue" alt="Vue logo" />&nbsp;Vue
        </a>&nbsp;|&nbsp;<a target="_blank" href="">Source Code</a>
      </h2>
    </div>
  </footer>
</template>

<style scoped>
.footer-container {
  @apply w-full flex flex-row justify-center items-center gap-10 py-4;
  background-color: black;
}
.credits {
  @apply flex flex-col items-center;
}
.footer-title {
  @apply text-6xl m-0 hidden md:block;
  transform: translateY(-4px);
}
.logo {
  height: 1.2em;
  padding: 0.1em;
  will-change: filter;
  transition: filter 300ms;
}
a:hover > .logo {
  filter: drop-shadow(0 0 10px #646cff);
}
a:hover > .logo.vue {
  filter: drop-shadow(0 0 10px #42b883);
}
</style>