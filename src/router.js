import { createMemoryHistory, createRouter } from 'vue-router'

import ScriptManagerPage from "@/page/ScriptManagerPage.vue";
import ConfigEditorPage from "@/page/ConfigEditorPage.vue";
import NewTaskPage from "@/page/NewTaskPage.vue";
import EditTaskPage from "@/page/EditTaskPage.vue";
import NewCollectTaskPage from "@/page/NewCollectTaskPage.vue";

const routes = [
    { path: '/', component: ScriptManagerPage },
    { path: '/config/editor', component: ConfigEditorPage},
    { path: '/task/base/new', component: NewTaskPage},
    { path: '/task/collect/new', component: NewCollectTaskPage},
    { path: '/task/fight/new', component: NewCollectTaskPage},
    { path: '/task/gouliang/new', component: NewCollectTaskPage},
    { path: '/task/edit/:fileName', component: EditTaskPage},

]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router