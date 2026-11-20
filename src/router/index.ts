import { createRouter, createWebHashHistory } from "vue-router";
import { useAppAuthorization } from "@/composables/useAppAuthorization";

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/",
            name: "access",
            component: () => import("@/pages/AccessPage/AccessPage.vue"),
        },
        {
            path: "/app",
            name: "app",
            component: () => import("@/pages/AuthorizedPage/AuthorizedPage.vue"),
            meta: {
                requiresAuth: true,
            },
        },
    ],
});

router.beforeEach((to) => {
    const { isAuthorized } = useAppAuthorization();

    if (to.meta.requiresAuth && !isAuthorized.value) {
        return { name: "access" };
    }

    if (to.name === "access" && isAuthorized.value) {
        return { name: "app" };
    }
});

export default router;