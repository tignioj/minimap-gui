import { createMemoryHistory, createRouter } from 'vue-router'

import ScriptManagerPage from "@/page/ScriptManagerPage.vue";
import ConfigEditorPage from "@/page/ConfigEditorPage.vue";
import NewCollectTaskPage from "@/page/NewCollectTaskPage.vue";
import NewFightTaskPage from "@/page/NewFightTaskPage.vue";
import NewGouLiangTaskPage from "@/page/NewGouLiangTaskPage.vue";
import LogPage from "@/page/LogPage.vue";
import FightTeamManagerPage from "@/page/FightTeamManagerPage.vue";

const routes = [
    { path: '/', component: ScriptManagerPage, meta: { keepAlive: true }, // 需要缓存
        // redirect: '/task/collect/edit',
        // redirect: '/team',
    },
    { path: '/config/editor', component: ConfigEditorPage , meta: { keepAlive: true } },
    { path: '/task/collect/edit', component: NewCollectTaskPage },
    { path: '/task/collect/edit/:fileName', component: NewCollectTaskPage },

    { path: '/task/fight/edit', component: NewFightTaskPage},
    { path: '/task/fight/edit/:fileName', component: NewFightTaskPage},

    { path: '/task/gouliang/edit', component: NewGouLiangTaskPage},
    { path: '/task/gouliang/edit/:fileName', component: NewGouLiangTaskPage},
    { path: '/logs', component: LogPage},

    { path: '/team', component: FightTeamManagerPage},

]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router