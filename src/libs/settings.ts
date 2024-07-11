import { reactive } from 'vue'

export const settings = reactive<{
    TVMode: boolean
    visualizer: boolean
    visualizerBG: number
    visualizerBar: number
    bgBlur: number
    bgDim: number
    debug: boolean
}>({
    TVMode: false,
    visualizer: true,
    visualizerBG: 15,
    visualizerBar: 20,
    bgBlur: 10,
    bgDim: 45,
    debug: false,
})