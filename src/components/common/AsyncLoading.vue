<script setup lang="ts">
withDefaults(
    defineProps<{
        text?: string;
    }>(),
    {
        text: "Загрузка...",
    }
);
</script>

<template>
    <div class="async-loading">
        <span class="spinner" />
        <span class="text">{{ text }}</span>
    </div>
</template>

<style scoped lang="scss">
.async-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 120px;
    width: 100%;
    color: #777;
}

.spinner {
    width: 18px;
    height: 18px;
    border: 2px solid #deded9;
    border-top-color: #555;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

.text {
    font-size: 12px;
    line-height: 1;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    .spinner {
        animation: none;
    }
}
</style>
