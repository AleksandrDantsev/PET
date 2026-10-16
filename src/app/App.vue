<script setup lang="ts">
import { api } from "@/api/api";
import { ref, onMounted, defineAsyncComponent } from "vue"
import type { IGoogleTableData } from "../types/TableSheetData";
import AppErrorPanel from "@/components/common/AppErrorPanel.vue";
import { LocalStorage } from "@/utils/localStorage";
import { 
    NConfigProvider,
    NMessageProvider,
    NNotificationProvider,
    NGlobalStyle,
    ruRU,
} from "naive-ui";
import { themeOverrides,  } from "@/theme/naiveTheme";
import UpButton from "@/components/common/UpButton.vue";
import { reportAppError } from "@/utils/appErrors";

const InterchangeablePage = defineAsyncComponent(
    () => import("@/pages/Interchangeable/InterchangeablePage.vue")
);

const ACTUAL_DATA = ref<IGoogleTableData | null>(null);
const INTERCHANGEABLE_DATA = ref<IGoogleTableData | null>(null);

onMounted(async () => {
    window.scrollTo(0, 0);

    const savedActualData = LocalStorage.get<IGoogleTableData>(
        "actualData"
    );

    const savedInterchangeableData = LocalStorage.get<IGoogleTableData>(
        "interchangeableData"
    );


    if (savedActualData) {
        ACTUAL_DATA.value = savedActualData;
    }

    if (savedInterchangeableData) {
        INTERCHANGEABLE_DATA.value = savedInterchangeableData;
    }

    const [
        actualData,
        configData,
        interchangeableData,
    ] = await Promise.all([
        api.google
            .getSheetValuesById(358090170)
            .catch(error => {
                reportAppError("Ошибка загрузки листа недопроданного", error);
                return null;
            }),

        api.google
            .getSheetValuesById(581263708)
            .catch(error => {
                reportAppError("Ошибка загрузки листа конфигурации", error);
                return null;
            }),

        api.google
            .getSheetValuesById(517769516)
            .catch(error => {
                reportAppError("Ошибка загрузки листа базы данных с потребностью клиента", error);
                return null;
            }),
    ]);


    if (actualData) {
        ACTUAL_DATA.value = actualData;
        LocalStorage.save("actualData", actualData);
    }

    if (configData) {
        LocalStorage.save("configData", configData);
    }

    if (interchangeableData) {
        INTERCHANGEABLE_DATA.value = interchangeableData;
        LocalStorage.save(
            "interchangeableData",
            interchangeableData
        );
    }
});

</script>

<template>
    <n-config-provider 
        :theme-overrides="themeOverrides" 
        :locale="ruRU"
    >
        <n-notification-provider placement="bottom-right">
            <n-message-provider>
                <n-global-style />
                <AppErrorPanel />
                <div>
                    <InterchangeablePage
                        v-if="ACTUAL_DATA && INTERCHANGEABLE_DATA"
                        :actual-data="ACTUAL_DATA" 
                        :interchangeable-data="INTERCHANGEABLE_DATA"
                    />
                </div>
                <UpButton />
            </n-message-provider>
        </n-notification-provider>
    </n-config-provider>
</template>

<style>
* {
    font-family:  Inter,
    "Segoe UI",
    "Roboto",
    Helvetica,
    Arial,
    sans-serif;
}
body {
    font-variant-numeric: tabular-nums;
    scrollbar-gutter: stable;
}

.n-popconfirm .n-popconfirm__content {
    font-size: 11px;
}

.n-popconfirm .n-popconfirm__action {
    margin-top: 6px;
    gap: 4px;
}

.n-popconfirm .n-button {
    height: 22px;
    min-height: 22px;
    padding: 0 7px;
    font-size: 12px;
}

::selection {
    background-color: #456d3a6b;
    color: white;
}
</style>