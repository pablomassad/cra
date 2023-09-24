import { main } from 'fwk-quasar'
import Home from '../pages/home/index.vue'
import Login from '../pages/login/index.vue'

const routes = [
    {
        path: '/',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            { path: '/home', component: Home }
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
