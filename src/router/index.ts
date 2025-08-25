import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '@/views/about.vue'
import HomeView from '@/views/home.vue'
import logout from '@/views/logout.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', component: HomeView },
        { path: '/about', component: AboutView },
        { path: '/logout', component: logout },
    ],
})

export { router }
