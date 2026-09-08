<script setup lang="ts">
import { api } from "@/api/api";
import { ref, onMounted } from "vue"
import type { IGoogleTableData } from "@/types/TableSheetData.types"
import Interchangeable from "@/pages/Interchangeable/Interchangeable.vue";

import { NConfigProvider, NGlobalStyle, ruRU } from "naive-ui";
import { themeOverrides } from "@/theme/naiveTheme";
import { 
    getConfigConst, 
    getConfigManagersBranchList, 
    getConfigContragentsList, 
} from "../helpers/configHandlers";


const ACTUAL_DATA = ref<IGoogleTableData | null>(null);
const CONFIG_DATA = ref<IGoogleTableData | null>(null);

const CONST_TITLES = ref<Record<string, string> | null>(null);
const CONTRAGENTS = ref<Record<string, { branch: string, manager: string}> | null>(null);
const MANAGERS_BRANCHES = ref<Record<string, string> | null>(null);

onMounted(async () => {
    ACTUAL_DATA.value = await api.google.getSheetValuesById(358090170);
    CONFIG_DATA.value = await api.google.getSheetValuesById(581263708);

    CONST_TITLES.value = getConfigConst(
        CONFIG_DATA.value
    );
    MANAGERS_BRANCHES.value = getConfigManagersBranchList(
        CONFIG_DATA.value
    );
    CONTRAGENTS.value = getConfigContragentsList(
        CONFIG_DATA.value
    );
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
                :actual-data="ACTUAL_DATA" 
                :const-titles="CONST_TITLES"
                :contragents="CONTRAGENTS"
                :managers-branches="MANAGERS_BRANCHES"
            />
        </div>
    </n-config-provider>
</template>