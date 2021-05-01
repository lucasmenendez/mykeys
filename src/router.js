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
        path: '/m',
        name: 'manager',
        props: true,
        meta: { title: 'My Passwords' },
        component: () => import(/* webpackChunkName: "manager" */ '@/views/Manager'),
        beforeEnter: (to, _, next) => {
            const mock = [
                {"alias":"msssavb444msssavb444","username":"17lbtonz6yibyihq1czazmgfj","password":"lhnj8u6zo6caoa1e4cmtbub4l","description":"g3acfv7dg7n0crdnvtf039ohjnhfjfhl4horfr2btmj83l7g8n"},
                {"alias":"2xicx9h6ik2xicx9h6ik","username":"5g79x7fzfkfcrzgrzouqfr25u","password":"p27idtn9x51img518tryc8lsx","description":"xw4xwbbl7nmrttiv64lr0j5oypl9z86tcrnlp0e20tspwfaic0"},
                {"alias":"mlkbh8nmdvmlkbh8nmdv","username":"t3xmgkgsk4wt303cq139p5ikl","password":"dntxmsjozuahangqddddxke5r","description":"q60hutc066b13ajgacbl9rwvokqxkombak9wc8g4kif9a57i6b"},
                {"alias":"y0m2w9tucwy0m2w9tucw","username":"o2fyc4tzx86dqeujb1us0qgez","password":"bwa43vb59hccoplyitvu579tk","description":"uhnuj9wbb0ghfu6vebh4ud6qqpzcttqxmh18zoaa6imj6aqwh1"},
                {"alias":"11u70fjx9j11u70fjx9j","username":"zddjq8ea4dslnj8ut2t1rzdmo","password":"h4ymkrwuumnwooz7ynvyjoh19","description":"9mh5uw5ny6tmzkg4ir2rl7chxmef8rvm6evy0k608y7h4nogk1"},
                {"alias":"6m0qt9b0gi6m0qt9b0gi","username":"s6fy8goaxkvub66e6ixjkvu2j","password":"4nfqjrquv2q2qtlxm5om58ho3","description":"pqbbnb9mribk523toi37ufqlhrsyu4cfzjehm4ha169hmoaxa0"},
                {"alias":"pnh9edzwjppnh9edzwjp","username":"82app6mtrwplrgw8lyxht8pkw","password":"dfy1yovkl30paoufsqsaytku0","description":"z0aas8xh561pjpxvierjcezzwfkgv5bhkd5mvty5shs72blobh"},
                {"alias":"vmou60r6uyvmou60r6uy","username":"5tx6e6wvl55qi0u9wqxzy38zk","password":"tjqzymwpqwv20q58dm5bi1j2p","description":"1vpa3mqqc8kzq9dngnp3bpfzk2nddexbgml4wfk4htxgu6nkfg"},
                {"alias":"dsjcmidea7dsjcmidea7","username":"tadbl50167gm9wdha6huk9aat","password":"vsi4d6n3h2ylk5tvmdp9180yz","description":"zxnke9eq8dx9si7fq3tyglug4hkupmmtomyny47hjb44q9mdph"},
                {"alias":"h4dtensx8wh4dtensx8w","username":"eormq84sfz3uxtysiduzhz30k","password":"naks6h604d2zwmnqq7pv0eq80","description":"vl7rk9lvo84770t1amhtygewnwsgt4c9tx9ekoce35k56ycgve"}
            ];

            if (Object.keys(to.query).includes('mock')) to.params.data = mock;
            next();
        }
    },
    {
        path: '/d/:blob+',
        name: 'decrypt',
        props: true,
        meta: { title: 'Decrypt' },
        component: () => import(/* webpackChunkName: "decrypt" */ '@/views/Decrypt'),
        beforeEnter: (to, _, next) => {
            const blob = to.params.blob || null;

            if (blob.length > 0) next();
            else next({ name: 'home' });
        }
    },
    {
        path: '/e',
        name: 'encrypt',
        props: true,
        meta: { title: 'Encrypt' },
        component: () => import(/* webpackChunkName: "encrypt" */ '@/views/Encrypt'),
        beforeEnter: (to, _, next) => {
            const data = to.params.data || null;

            if (Array.isArray(data) && data.length > 0) next();
            else next({ name: 'home' });
        }
    }
]

const router = new VueRouter({
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