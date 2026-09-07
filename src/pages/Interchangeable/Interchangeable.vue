<script setup lang="ts">

import type { IGoogleTableData } from "@/types/TableSheetData.types";
import { ref, computed, onMounted } from "vue";
import { NButton, NInput } from "naive-ui";
import { dataToObjects } from "@/helpers/dataHandlers";

const props = defineProps<{
    actualData?: IGoogleTableData | null;
    arrConstTitles: string[] | null;
}>();

    const actualObjsList = computed(() => {
        if (!props.actualData) {
            return null;
        }
        return dataToObjects(props.actualData)
    })

</script>

<template>
  <div>
    <n-button type="primary">
      Сохранить
    </n-button>
    <pre>
        {{ arrConstTitles}}
    </pre>
  </div>
</template>

<style scoped lang="scss">

</style>