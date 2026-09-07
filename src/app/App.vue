<script setup lang="ts">
  import { api } from "@/api/api";
  import { ref, onMounted } from "vue"
  import type { IGoogleTableData } from "@/types/TableSheetData.types";
  import { valuesToColumns } from "@/helpers/dataHandlers";
  import { getConfigContragentsList } from "@/helpers/configHandlers";


  const rows = ref<IGoogleTableData | null>();

  onMounted(async () => {
    // rows.value = await api.google.getSheetValuesById(358090170);
    rows.value = await api.google.getSheetValuesById(581263708);
  });
</script>

<template>
  <div>
    <pre>
      {{ getConfigContragentsList(rows) }}
    </pre>
  </div>
</template>