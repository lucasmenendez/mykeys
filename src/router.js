import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home
    },
    {
        path: '/manager',
        name: 'manager',
        component: () => import(/* webpackChunkName: "manager" */ '@/views/Manager'),
        props: true,
        beforeEnter: (to, _, next) => {
            const obj = to.params.data || null;

            if (Array.isArray(obj) && obj.length > 0) next();
            else next({ name: 'home' });
        }
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router;