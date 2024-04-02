import { createRouter, createWebHistory } from 'vue-router'
const Home = () => import('../pages/home.vue');
const NotFound = () => import('../pages/not_found.vue');
const Player = () => import('../pages/player.vue')
const PlayerMain = () => import('../components/PlayerMain.vue')
const Lyric = () => import('../components/Lyric.vue')
const Playlist = () => import('../components/Playlist.vue')

// 实例化路由
const router = createRouter({
    routes: [
        {
            path: "/",
            name: "Home",
            component: Home
        },
        {
            path: "/player",
            name: "Player",
            component: Player
        },
        {
            path: "/PlayerMain",
            name: "PlayerMain",
            component: PlayerMain
        },
        {
            path: "/Lyric",
            name: "Lyric",
            component: Lyric
        },
        {
            path: "/Playlist",
            name: "Playlist",
            component: Playlist
        },
        {
            path: "/:catchAll(.*)",
            name: "Not Found",
            component: NotFound
        },
    ],
    history: createWebHistory(),    // 拒绝 “#/”，从我做起
});

export default router;