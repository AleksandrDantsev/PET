<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { NButton } from "naive-ui";

const showScrollTop = ref(false);

const handleScroll = () => {
    showScrollTop.value = window.scrollY > 400;
};

const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
};

onMounted(() => {
    window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
    <div class="page">
        <NButton
            class="scroll-top"
            :class="{ 'scroll-top--visible': showScrollTop }"
            circle
            @click="scrollToTop"
        >
            <template #icon>↑</template>
        </NButton>
    </div>
</template>

<style scoped lang="scss">
.scroll-top {
    position: fixed;
    width: 50px;
    height: 50px;
    right: 50px;
    bottom: 40px;
    z-index: 1000;

    background: #fff !important;
    color: #333 !important;
    border: 1px solid #e5e5e5 !important;
    border-radius: 50%;

    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateY(10px);

    box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.12),
        0 2px 4px rgba(0, 0, 0, 0.06);

    transition:
        opacity 0.3s ease,
        visibility 0.3s ease,
        transform 0.3s ease,
        box-shadow 0.2s ease;

    :deep(.n-button__border),
    :deep(.n-button__state-border) {
        display: none !important;
    }

    &--visible {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translateY(0);
    }

    &:hover {
        background: #fff !important;
        color: #222 !important;
        border-color: #ddd !important;
        transform: translateY(-3px);

        box-shadow:
            0 8px 20px rgba(0, 0, 0, 0.16),
            0 3px 8px rgba(0, 0, 0, 0.08);
    }

    &:active {
        transform: translateY(0);
    }
}


</style>