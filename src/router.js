import { createMemoryHistory, createRouter } from 'vue-router'

import ScriptManagerPage from "@/page/ScriptManagerPage.vue";
import ConfigEditorPage from "@/page/ConfigEditorPage.vue";
import NewTaskPage from "@/page/NewTaskPage.vue";
import EditTaskPage from "@/page/EditTaskPage.vue";

const routes = [
    { path: '/', component: ScriptManagerPage },
    { path: '/config/editor', component: ConfigEditorPage},
    { path: '/task/new', component: NewTaskPage},
    { path: '/task/edit/:fileName', component: EditTaskPage},

]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router