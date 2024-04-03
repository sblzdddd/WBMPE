<script setup lang="ts">
import Footer from "./components/Footer.vue";
// import {ref} from "vue";
// import { useRouter } from 'vue-router';

// const router = useRouter();

const componentPages: string[] = ['Playlist', 'PlayerMain', 'Lyric', 'Player'];
</script>

<template>
  <div class="scrollContainer">
    <router-view />
    <Footer v-if="!componentPages.includes($route.name)" />
  </div>
</template>

<style lang="stylus">
.scrollContainer
  @apply w-screen h-screen;
  height 100svh
  overflow-x hidden
  overflow-y auto
</style>
