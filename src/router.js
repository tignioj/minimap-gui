import { createMemoryHistory, createRouter } from 'vue-router'

import ScriptManagerPage from "@/page/ScriptManagerPage.vue";
import ConfigEditorPage from "@/page/ConfigEditorPage.vue";
import NewCollectTaskPage from "@/page/NewCollectTaskPage.vue";
import NewFightTaskPage from "@/page/NewFightTaskPage.vue";
import NewGouLiangTaskPage from "@/page/NewGouLiangTaskPage.vue";

const routes = [
    { path: '/', component: ScriptManagerPage,
        // redirect: '/task/collect/edit',
    },
    { path: '/config/editor', component: ConfigEditorPage },
    { path: '/task/collect/edit', component: NewCollectTaskPage },
    { path: '/task/collect/edit/:fileName', component: NewCollectTaskPage },

    { path: '/task/fight/edit', component: NewFightTaskPage},
    { path: '/task/fight/edit/:fileName', component: NewFightTaskPage},

    { path: '/task/gouliang/edit', component: NewGouLiangTaskPage},
    { path: '/task/gouliang/edit/:fileName', component: NewGouLiangTaskPage},

]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router