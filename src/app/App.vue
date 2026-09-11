<script setup lang="ts">
import { api } from "@/api/api";
import { ref, onMounted } from "vue"
import type { IGoogleTableData } from "../types/TableSheetData";
import Interchangeable from "@/pages/Interchangeable/Interchangeable.vue";
import { LocalStorage } from "@/utils/localStorage";
import { NConfigProvider, NGlobalStyle, ruRU } from "naive-ui";
import { themeOverrides } from "@/theme/naiveTheme";
import { 
    getConfigConst, 
    getConfigManagersBranchList, 
    getConfigContragentsList, 
} from "../helpers/configHandlers";


const ACTUAL_DATA = ref<IGoogleTableData | null>(null);
const CONFIG_DATA = ref<IGoogleTableData | null>(null);
const INTERCHANGEABLE_DATA = ref<IGoogleTableData | null>(null);

const CONST_TITLES = ref<Record<string, string> | null>(null);
const CONTRAGENTS = ref<Record<string, { branch: string, manager: string}> | null>(null);
const MANAGERS_BRANCHES = ref<Record<string, string> | null>(null);

onMounted(async () => {
    const savedActualData = LocalStorage.get<IGoogleTableData>(
        "actualData"
    );
    const savedConfigData = LocalStorage.get<IGoogleTableData>(
        "configData"
    );
    const savedInterchangeableData = LocalStorage.get<IGoogleTableData>(
        "interchangeableData"
    );

    if (savedActualData) ACTUAL_DATA.value = savedActualData;
    if (savedConfigData) CONFIG_DATA.value = savedConfigData;
    if (savedInterchangeableData) INTERCHANGEABLE_DATA.value = savedInterchangeableData;

    const [
        actualData,
        configData,
        interchangeableData,
    ] = await Promise.all([
        api.google
            .getSheetValuesById(358090170)
            .catch(() => null),
        api.google
            .getSheetValuesById(581263708)
            .catch(() => null),
        api.google
            .getSheetValuesById(778545787)
            .catch(() => null),
    ]);

    if (actualData) {
        ACTUAL_DATA.value = actualData;
        LocalStorage.save("actualData", actualData);
    }

    if (configData) {
        CONFIG_DATA.value = configData;
        LocalStorage.save("configData", configData);
    }

    if (interchangeableData) {
        INTERCHANGEABLE_DATA.value = interchangeableData;
        LocalStorage.save(
            "interchangeableData",
            interchangeableData
        );
    }

    if (CONFIG_DATA.value) {
        CONST_TITLES.value = getConfigConst(
            CONFIG_DATA.value
        );

        MANAGERS_BRANCHES.value =
            getConfigManagersBranchList(
                CONFIG_DATA.value
            );

        CONTRAGENTS.value =
            getConfigContragentsList(
                CONFIG_DATA.value
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
            <Interchangeable
                v-if="ACTUAL_DATA && INTERCHANGEABLE_DATA"
                :actual-data="ACTUAL_DATA" 
                :interchangeable-data="INTERCHANGEABLE_DATA"
                :const-titles="CONST_TITLES"
                :contragents="CONTRAGENTS"
                :managers-branches="MANAGERS_BRANCHES"
            />
        </div>
    </n-config-provider>
</template>