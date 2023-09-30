import { main } from 'fwk-q-main'
import Home from '../pages/home/index.vue'
import Login from '../pages/login/index.vue'
import Poliza from '../pages/poliza/index.vue'
import Notificaciones from '../pages/notificaciones/index.vue'

const routes = [
    {
        path: '/',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            { path: '/home', component: Home },
            { path: '/poliza', component: Poliza },
            { path: '/notificaciones', component: Notificaciones }
        ]
    },
    { path: '/login', component: Login },
    {
        path: '/:catchAll(.*)*',
        component: () => import('pages/Error404.vue')
    }
]
main.actions.initBeforeRoutes(routes[0].children)
export default routes
