import { createRouter, createWebHashHistory } from 'vue-router'
const Home = () => import('@/pages/home.vue');
const NotFound = () => import('@/pages/not_found.vue');

// 实例化路由
const router = createRouter({
    routes: [
        {
            path: "/",
            name: "Home",
            component: Home
        },
        {
            path: "/:catchAll(.*)",
            name: "Not Found",
            component: NotFound
        },
    ],
    history: createWebHashHistory(),
});

export default router;
