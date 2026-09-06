<script setup lang="ts">
import { ref, onMounted } from "vue";

const rows = ref<string[][]>([]);

onMounted(async () => {
  rows.value =
    await window.electronAPI.getSheet(
      "актуальное"
    );
});

console.log(rows.value)
</script>

<template>

  <pre>
{{ rows }}
  </pre>
</template>