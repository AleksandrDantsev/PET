<script setup lang="ts">
import {
    defineAsyncComponent,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from "vue";
import type { DataObject } from "@/types/TableSheetData.ts";
import InterchangeableResultCard from "./InterchangeableResultCard.vue";

const InterchangeableClientDemand = defineAsyncComponent({
    loader: () => import("./InterchangeableClientDemand.vue"),
    delay: 200,
    timeout: 10000,
});

const props = defineProps<{
    clientsDemand: DataObject | null;
    filteredActualResultObjs: DataObject[];
}>();

const expandedCard = ref<DataObject | null>(null);
const expandedCardElement = ref<HTMLElement | null>(null);
const updateExpandedCardDirection = ref<(() => void) | null>(null);

let viewportUpdateRaf: number | null = null;

const handleCardOpen = async (
    card: DataObject,
    element: HTMLElement | null,
    updateDirection: () => void
) => {
    expandedCard.value = card;
    expandedCardElement.value = element;
    updateExpandedCardDirection.value = updateDirection;

    updateDirection();
};

const closeExpandedCard = () => {
    expandedCard.value = null;
    expandedCardElement.value = null;
    updateExpandedCardDirection.value = null;
};

const handleCardClose = (card: DataObject) => {
    if (expandedCard.value !== card) return;

    closeExpandedCard();
};

const handlePointerDown = (event: PointerEvent) => {
    if (!expandedCard.value) return;

    const target = event.target;

    if (
        target instanceof Node &&
        expandedCardElement.value &&
        !expandedCardElement.value.contains(target)
    ) {
        closeExpandedCard();
    }
};

const handleViewportChange = () => {
    if (!expandedCard.value || viewportUpdateRaf !== null) return;

    viewportUpdateRaf = requestAnimationFrame(() => {
        viewportUpdateRaf = null;

        if (!expandedCard.value) {
            return;
        }

        updateExpandedCardDirection.value?.();
    });
};

watch(() => props.filteredActualResultObjs, results => {
    if (expandedCard.value && !results.includes(expandedCard.value)) {
        closeExpandedCard();
    }
});

onMounted(() => {
    document.addEventListener(
        "pointerdown",
        handlePointerDown
    );

    window.addEventListener(
        "resize",
        handleViewportChange
    );

    window.addEventListener(
        "scroll",
        handleViewportChange,
        true
    );
});

onBeforeUnmount(() => {
    document.removeEventListener(
        "pointerdown",
        handlePointerDown
    );

    window.removeEventListener(
        "resize",
        handleViewportChange
    );

    window.removeEventListener(
        "scroll",
        handleViewportChange,
        true
    );

    if (viewportUpdateRaf !== null) {
        cancelAnimationFrame(viewportUpdateRaf);
        viewportUpdateRaf = null;
    }
});
</script>

<template>
    <div class="result-container">
        <div
            v-if="filteredActualResultObjs.length"
            class="container-result-cards"
        >
            <Transition name="client-demand">
                <InterchangeableClientDemand
                    v-if="clientsDemand && Object.keys(clientsDemand).length"
                    :clients-demand="clientsDemand"
                />
            </Transition>

            <div class="result-list">
                <InterchangeableResultCard
                    v-for="(value, index) in filteredActualResultObjs"
                    :key="JSON.stringify(value)"
                    :result="value"
                    :index="index"
                    :is-expanded="expandedCard === value"
                    @open="handleCardOpen"
                    @close="handleCardClose"
                />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.result-container {
    width: 91%;
    margin: 20px auto;
}

.container-result-cards {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.result-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 18px;
}

.client-demand-enter-active,
.client-demand-leave-active {
    transition: opacity 0.15s ease;
}

.client-demand-enter-from,
.client-demand-leave-to {
    opacity: 0;
}

.client-demand-enter-to,
.client-demand-leave-from {
    opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
    .client-demand-enter-active,
    .client-demand-leave-active {
        transition: none;
    }
}

@media (max-width: 900px) {
    .result-container {
        width: calc(100% - 24px);
        margin-top: 16px;
    }
}

@media (max-width: 600px) {
    .result-container {
        width: calc(100% - 16px);
        margin-top: 12px;
        margin-bottom: 24px;
    }

    .result-list {
        gap: 5px;
        margin-top: 12px;
    }
}
</style>