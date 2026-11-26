
import "@/assets/styles/normalize.scss";
import "@fontsource/inter";
// import { migrateLocalDataToSupabase } from "@/services/supabase/userData";
import { createApp } from "vue";
import App from "@/app/App.vue";
import { reportAppError } from "@/utils/appErrors";
import router from "@/router";

import { useSupabaseAuth } from "@/composables/useSupabaseAuth";
import { useUserData } from "@/stores/userDataStore";

async function bootstrap() {
    const auth = useSupabaseAuth();

    await auth.initialize();

    if (auth.isAuthenticated.value) {
        try {
            await useUserData().initialize();

            console.info("Supabase: облачное хранилище инициализировано");
        } catch (error) {
            reportAppError(
                "Не удалось загрузить данные из Supabase",
                error,
            );
        }
    }

    const app = createApp(App);

    app.config.errorHandler = (error, _instance, info) => {
        reportAppError(`Ошибка Vue: ${info}`, error);
    };

    app.use(router);
    await router.isReady();
    app.mount("#app");
}

bootstrap().catch(error => {
    reportAppError("Ошибка запуска приложения", error);
});
