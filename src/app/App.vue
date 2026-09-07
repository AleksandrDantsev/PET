<script setup lang="ts">
import { api } from "@/api/api";
import { ref, onMounted, computed } from "vue"
import type { IGoogleTableData } from "@/types/TableSheetData.types"
import Interchangeable from "@/pages/Interchangeable/Interchangeable.vue";

import { NConfigProvider, NGlobalStyle } from "naive-ui";
import { themeOverrides } from "@/theme/naiveTheme";
import { getConfigConst } from "@/helpers/configHandlers";


  const actualData = ref<IGoogleTableData | null>(null);
  const configData = ref<IGoogleTableData | null>(null);

  onMounted(async () => {
    actualData.value = await api.google.getSheetValuesById(358090170);
    configData.value = await api.google.getSheetValuesById(581263708);
  });

  const arrConstTitles = computed(() => {
    if (configData.value === null) return null;
    return Object.values(getConfigConst(configData.value) ?? {})
  })
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-global-style />
    <div>
      <Interchangeable
        :actual-data="actualData" 
        :arr-const-titles="arrConstTitles"
      />
    </div>
  </n-config-provider>
</template>