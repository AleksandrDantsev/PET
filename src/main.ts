// import "@/assets/styles/reset.scss";
import "@/assets/styles/normalize.scss";
import "@fontsource/inter";

import { createApp } from "vue";
import App from "@/app/App.vue";
import { reportAppError } from "@/utils/appErrors";

const app = createApp(App);

app.config.errorHandler = (error, _instance, info) => {
    reportAppError(`Ошибка Vue: ${info}`, error);
};

app.mount("#app");