import './assets/main.css'
import router from './router'
import { createApp, ref } from 'vue'
import App from './App.vue'



import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { fas} from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far} from '@fortawesome/free-regular-svg-icons';
library.add(fas, far, fab)

// dom.watch();  # 巨卡，别watch


const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)
app.mount('#app')

