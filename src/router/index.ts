
import { createRouter, createWebHashHistory } from "vue-router";
import { useAppAuthorization } from "@/composables/useAppAuthorization";
import { useSupabaseAuth } from "@/composables/useSupabaseAuth";

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/database-login",
            name: "database-login",
            component: () =>
                import("@/pages/DatabaseLoginPage/DatabaseLoginPage.vue"),
        },
        {
            path: "/",
            name: "access",
            component: () =>
                import("@/pages/AccessPage/AccessPage.vue"),
        },
        {
            path: "/app",
            name: "app",
            component: () =>
                import("@/pages/AuthorizedPage/AuthorizedPage.vue"),
            meta: {
                requiresAuth: true,
            },
        },
    ],
});

router.beforeEach((to) => {
    const { isAuthenticated, isInitialized } = useSupabaseAuth();
    const { isAuthorized } = useAppAuthorization();

    if (!isInitialized.value || !isAuthenticated.value) {
        if (to.name !== "database-login") {
            return { name: "database-login" };
        }

        return;
    }

    if (to.name === "database-login") {
        return isAuthorized.value
            ? { name: "app" }
            : { name: "access" };
    }

    if (to.meta.requiresAuth && !isAuthorized.value) {
        return { name: "access" };
    }

    if (to.name === "access" && isAuthorized.value) {
        return { name: "app" };
    }
});

export default router;
