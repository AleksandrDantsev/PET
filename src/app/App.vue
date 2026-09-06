<script setup lang="ts">
import { api } from "@/api/api";
import { ref, onMounted } from "vue";
import { getHeaderIndex } from "@/utils/tableHelpers";

const rows = ref<Record<string, string>>({});

onMounted(async () => {
  rows.value =
    await api.google.getSheetValuesById(358090170);

  console.log(await api.google.getHeadersConst());
  console.log(getHeaderIndex(rows.value, await api.google.getHeadersConst()));
});
</script>

<template>
  <div>
    <pre>
      {{ rows }}
    </pre>
  </div>
</template>