

<template>
<input type="checkbox" id="my_modal_6" class="modal-toggle" v-model="props.showModal" />
<div class="modal" role="dialog">
  <div class="modal-box bg-base-100/80 backdrop-blur-sm text-left w-2/3 max-w-5xl">
    <h3 class="font-bold text-lg">Import Playlist</h3>
    <p class="py-4">Please specify a url (api url) that returns a playlist JSON with aplayer song data format.</p>
    <p>For more information about this, see
      <a class="text-primary underline underline-offset-1" target="_blank"
         href="https://github.com/sblzdddd/WBMPE?tab=readme-ov-file#how-to-use">How to use</a>.
    </p>
    <p class="pt-2">Or click the "Example" button for a demo playlist url</p>
    <div class="join pt-4 w-full">
      <input :class="`grow input input-bordered join-item ${disabled?'input-disabled':''}`"
             v-model="playlistUrl" placeholder="Playlist Url"/>
      <button :class="`btn join-item btn-accent ${disabled?'btn-disabled':''}`"
              @click="playlistUrl='https://v.iarc.top/?type=playlist&id=7331352483'">Example</button>
    </div>
    <div class="modal-action">
      <button :class="`w-full btn btn-primary ${playlistUrl=='' || disabled ? 'btn-disabled':''}`"
              @click="emit('requestImport', playlistUrl)">
        <span :class="`loading ${disabled?'':'hidden'}`"></span>Import</button>
    </div>
  </div>
</div>
</template>
<script setup lang="ts">
const playlistUrl = ref("");
import {ref} from "vue";

const props = withDefaults(
    defineProps<{
      showModal: boolean;
      disabled: boolean;
    }>(),
    {
      showModal: false,
      disabled: false,
    }
)

const emit = defineEmits(['requestImport'])
</script>
<style scoped>

</style>