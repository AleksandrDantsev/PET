<script setup lang="ts">
import {
    computed,
    defineAsyncComponent,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
} from "vue";
import InterchangeableResultCard from "./InterchangeableResultCard.vue";

const InterchangeableClientDemand = defineAsyncComponent({
    loader: () => import("./InterchangeableClientDemand.vue"),
    delay: 200,
    timeout: 10000,
});

type DataObject = Record<string, string | number | boolean | null>;

const props = defineProps<{
    clientsDemand: DataObject | null;
    filteredActualResultObjs: DataObject[];
}>();

const hasClientDemand = computed(() => {
    return Boolean(
        props.clientsDemand &&
        Object.keys(props.clientsDemand).length
    );
});

const hasResults = computed(() => {
    return props.filteredActualResultObjs.length > 0;
});

const expandedCardIndex = ref<number | null>(null);
const expandedCardRef = ref<{ updateDropdownDirection: () => Promise<void> } | null> (null);

const handleCardOpen = async (index: number) => {
    expandedCardIndex.value = index;

    await nextTick();
};

const handleCardClose = (index: number) => {
    if (expandedCardIndex.value === index) {
        expandedCardIndex.value = null;
    }
};

const handlePointerDown = (event: PointerEvent) => {
    if (expandedCardIndex.value === null) {
        return;
    }

    const target = event.target;

    if (!(target instanceof Element)) {
        return;
    }

    const card = target.closest("[data-interchangeable-card]");

    if (card) {
        return;
    }

    expandedCardIndex.value = null;
};

const handleViewportChange = () => {
    if (expandedCardIndex.value === null) {
        return;
    }

    expandedCardRef.value?.updateDropdownDirection();
};

const setExpandedCardRef = (
    card: {
        updateDropdownDirection: () => Promise<void>;
    } | null
) => {
    expandedCardRef.value = card;
};

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
});
</script>

<template>
    <div class="result-container">
        <div
            v-if="hasResults"
            class="container-result-cards"
        >
            <Transition name="client-demand">
                <InterchangeableClientDemand
                    v-if="hasClientDemand"
                    :clients-demand="clientsDemand"
                />
            </Transition>

            <div class="result-list">
                <InterchangeableResultCard
                    v-for="(value, index) in filteredActualResultObjs"
                    :key="index + String(value)"
                    :ref="expandedCardIndex === index ? setExpandedCardRef : undefined"
                    :result="value"
                    :index="index"
                    :is-expanded="expandedCardIndex === index"
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
