<script setup lang="ts">
import InterchangeableClientDemand from "./InterchangeableClientDemand.vue";
import InterchangeableResultCard from "./InterchangeableResultCard.vue";

type DataObject = Record<string, string | number | boolean | null>;

const props = defineProps<{
    clientsDemand: DataObject | null;
    filteredActualResultObjs: DataObject[];
}>();

</script>

<template>
    <div class="result-conteiner">
        <InterchangeableClientDemand
            v-if="clientsDemand && Object.keys(clientsDemand).length"
            :clients-demand="clientsDemand"
        />

        <div
            v-if="filteredActualResultObjs?.length"
            class="container-result-cards"
        >
            <InterchangeableResultCard
                v-for="(value, index) in filteredActualResultObjs"
                :key="index"
                :result="value"
                :index="index"
            />
        </div>
    </div>
</template>

<style scoped lang="scss">
.result-conteiner {
    width: 85%;
    max-width: 1200px;
    margin: 24px auto 40px;
}

.container-result-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
}
</style>
