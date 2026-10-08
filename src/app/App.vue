<script setup lang="ts">
import { api } from "@/api/api";
import { ref, onMounted } from "vue"
import type { IGoogleTableData } from "../types/TableSheetData";
import InterchangeablePage from "@/pages/Interchangeable/InterchangeablePage.vue";
import { LocalStorage } from "@/utils/localStorage";
import { NConfigProvider, NGlobalStyle, ruRU } from "naive-ui";
import { themeOverrides } from "@/theme/naiveTheme";
import UpButton from "@/components/common/UpButton.vue";

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
                console.error("actualData error:", error);
                return null;
            }),

        api.google
            .getSheetValuesById(581263708)
            .catch(error => {
                console.error("configData error:", error);
                return null;
            }),

        api.google
            .getSheetValuesById(517769516)
            .catch(error => {
                console.error("interchangeableData error:", error);
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
        <n-global-style />
        <div>
            <InterchangeablePage
                v-if="ACTUAL_DATA && INTERCHANGEABLE_DATA"
                :actual-data="ACTUAL_DATA" 
                :interchangeable-data="INTERCHANGEABLE_DATA"
            />
        </div>
        <UpButton />
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
::selection {
    background-color: rgb(83, 92, 82);
    color: white;
}
</style>