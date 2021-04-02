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
        props: true,
        meta: { title: 'My Passwords' },
        component: () => import(/* webpackChunkName: "manager" */ '@/views/Manager'),
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
});

// Set a dynamic web title on change view.
const baseTitle = 'MyKeys';
const titleSeparator = ' | ';
router.beforeEach((to, _, next) => {
    document.title = to.meta.title ? 
        to.meta.title + titleSeparator + baseTitle : baseTitle;
    next();
});

export default router;