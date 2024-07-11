<template>
  <dialog ref="settings_modal" class="modal">
    <div class="modal-box bg-base-100/80 backdrop-blur-sm text-left w-1/3 max-w-5xl">
      <h3 class="font-bold text-xl">Settings</h3>
      <div class="form-control mt-2">
        <label class="label cursor-pointer">
          <span class="label-text text-gray-300">TV Mode</span>
          <input type="checkbox" class="toggle toggle-primary" v-model="settings.TVMode" />
        </label>
      </div>
      <div class="form-control mt-2">
        <label class="label cursor-pointer">
          <span class="label-text text-gray-300">SulphurDXD™ Visualizer</span>
          <input type="checkbox" class="toggle toggle-primary" v-model="settings.visualizer" />
        </label>
      </div>
      <div class="form-control mt-2">
        <label class="label cursor-pointer">
          <span class="label-text text-gray-300">Visualizer Background</span>
          <input type="range" min="0" max="100" v-model="settings.visualizerBG" class="range range-xs w-full max-w-[200px]" />
        </label>
      </div>
      <div class="form-control mt-2">
        <label class="label cursor-pointer">
          <span class="label-text text-gray-300">Visualizer Bar</span>
          <input type="range" min="0" max="100" v-model="settings.visualizerBar" class="range range-xs w-full max-w-[200px]" />
        </label>
      </div>
      <div class="form-control mt-2">
        <label class="label cursor-pointer">
          <span class="label-text text-gray-300">Background Blur</span>
          <input type="range" min="0" max="50" v-model="settings.bgBlur" class="range range-xs w-full max-w-[200px]" />
        </label>
      </div>
      <div class="form-control mt-2">
        <label class="label cursor-pointer">
          <span class="label-text text-gray-300">Background Dim</span>
          <input type="range" min="0" max="100" v-model="settings.bgDim" class="range range-xs w-full max-w-[200px]" />
        </label>
      </div>
      <div class="form-control mt-2">
        <label class="label cursor-pointer">
          <span class="label-text text-gray-300">Debug</span>
          <input type="checkbox" class="toggle toggle-primary" v-model="settings.debug" />
        </label>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button class="cursor-default">close</button>
    </form>
  </dialog>
</template>
<script setup lang="ts">
import {ref} from "vue";
import {settings} from "../libs/settings.ts";
const settings_modal = ref()
// const props = withDefaults(
//     defineProps<{
//     }>(),
//     {
//     }
// )

function showModal() {
  if(settings_modal) settings_modal.value.showModal();
}
defineExpose({showModal})

</script>

<style scoped>

</style>