import {createRouter, createWebHistory} from 'vue-router'
import routes from "@/router/routes.js";

const router = createRouter({
    history: createWebHistory(),
    routes
})

export function resetRouter () {
    const newRouter = createRouter()
    router.matcher = newRouter.matcher // the relevant part
}

export default router
