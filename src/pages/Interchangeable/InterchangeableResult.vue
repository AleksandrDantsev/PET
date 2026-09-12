<script setup lang="ts">
import InterchangeableClientDemand from "./InterchangeableClientDemand.vue";
import InterchangeableResultCard from "./InterchangeableResultCard.vue";

type DataObject = Record<string, string | number | boolean | null>;

defineProps<{
    clientsDemand: DataObject | null;
    filteredActualResultObjs: DataObject[];
}>();

</script>

<template>
    <div class="result-container">
        <Transition name="result-fade">
            <div
                v-if="filteredActualResultObjs.length"
                class="container-result-cards"
            >
                <InterchangeableClientDemand
                    v-if="clientsDemand && Object.keys(clientsDemand).length"
                    :clients-demand="clientsDemand"
                />
                <InterchangeableResultCard
                    v-for="(value, index) in filteredActualResultObjs"
                    :key="index + String(value)"
                    :result="value"
                    :index="index"
                />
            </div>
        </Transition>
    </div>
</template>

<style scoped lang="scss">

.result-container {
    width: 91%;
    margin: 20px auto;
}
.container-result-cards {
    height: 100%;
    overflow-y: hidden;
}

.result-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 18px;
}

.result-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 180px;
    margin-top: 16px;
    padding: 30px;
    box-sizing: border-box;
    text-align: center;
    background: #fafaf8;
    border: 1px solid #e5e4df;
    border-radius: 6px;
}

.result-empty-title {
    color: #4c4a45;

    font-size: 13px;
    font-weight: 600;
}

.result-empty-text {
    margin-top: 5px;

    color: #99968f;

    font-size: 11px;
}


.result-fade-enter-active,
.result-fade-leave-active {
    transition:
        opacity 0.25s ease,
        transform 0.25s ease;
}

.result-fade-enter-from,
.result-fade-leave-to {
    opacity: 0;
    transform: translateY(6px);
}

.result-fade-enter-to,
.result-fade-leave-from {
    opacity: 1;
    transform: translateY(0);
}

@media (max-width: 900px) {
    .result-container {
        width: calc(100% - 24px);

        margin-top: 16px;
    }
}


/* =========================================================
   MOBILE
========================================================= */

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