import { createMemoryHistory, createRouter } from 'vue-router'

import ScriptManagerPage from "@/page/ScriptManagerPage.vue";
import ConfigEditorPage from "@/page/ConfigEditorPage.vue";
import NewCollectTaskPage from "@/page/NewCollectTaskPage.vue";
import NewFightTaskPage from "@/page/NewFightTaskPage.vue";
import NewGouLiangTaskPage from "@/page/NewGouLiangTaskPage.vue";
import LogPage from "@/page/LogPage.vue";
import FightTeamManagerPage from "@/page/FightTeamManagerPage.vue";
import AboutPage from "@/page/AboutPage.vue";
import DailyMissionPage from "@/page/DailyMissionPage.vue";
import LeyLineOutCrop from "@/page/LeyLineOutCrop.vue";
import NewLeyLineOutCropPage from "@/page/NewLeyLineOutCropPage.vue";
import NewDailyMissionPage from "@/page/NewDailyMissionPage.vue";
import OneDragonPage from "@/page/OneDragonPage.vue";
import DomainPage from "@/page/DomainPage.vue";

const routes = [
    { path: '/',
        // redirect: '/config/editor',
        redirect: '/oneDragon',
        // redirect: '/domain',
        // redirect: '/team',
        // redirect: '/leyline',
    },
    { path: '/script', component: ScriptManagerPage, meta: { keepAlive: true }, // 需要缓存
    },
    { path: '/oneDragon', component: OneDragonPage},
    { path: '/domain', component: DomainPage},
    { path: '/daily', component: DailyMissionPage},
    { path: '/config/editor', component: ConfigEditorPage , meta: { keepAlive: true } },
    { path: '/task/collect/edit', component: NewCollectTaskPage },
    { path: '/task/collect/edit/:fileName', component: NewCollectTaskPage },

    { path: '/task/fight/edit', component: NewFightTaskPage},
    { path: '/task/fight/edit/:fileName', component: NewFightTaskPage},

    { path: '/task/gouliang/edit', component: NewGouLiangTaskPage},
    { path: '/task/gouliang/edit/:fileName', component: NewGouLiangTaskPage},

    { path: '/task/leyline/edit/:fileName', component: NewLeyLineOutCropPage},
    { path: '/task/daily/edit/:fileName', component: NewDailyMissionPage},


    { path: '/leyline', component: LeyLineOutCrop},
    { path: '/logs', component: LogPage},
    { path: '/team', component: FightTeamManagerPage},
    { path: '/about', component: AboutPage},

]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router