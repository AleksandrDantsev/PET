
<script setup lang="ts">
import { computed } from "vue";
import type { DataObject } from "@/types/TableSheetData";
import { setColorText } from "@/utils/colorHelpers";
import { CONST_TITLES } from "@/configs/CONFIG_CONST";
import {
    formatValue,
    formatRange,
    formatLitrazh,
} from "@/utils/demandFormatters";

const props = defineProps<{
    demand: DataObject;
}>();

const fields = computed(() => {
    const demand = props.demand;
    const litrazh = demand[CONST_TITLES.LITRAZH];

    return [
        {
            key: "standard",
            label: "Стандарт",
            value: formatValue(demand[CONST_TITLES.STANDARD]),
        },
        {
            key: "litrazh",
            label: "Литраж",
            value: formatLitrazh(litrazh),
        },
        {
            key: "grams",
            label: "Диапазон граммажей",
            value: formatRange(
                demand[CONST_TITLES.WEIGHT_FROM],
                demand[CONST_TITLES.WEIGHT_TO],
            ),
        },
    ];
});

const colors = computed(() => [
    {
        key: "base",
        label: "Основной цвет",
        values: setColorText(
            props.demand[CONST_TITLES.PRIMARY_COLOR],
        ),
    },
    // {
    //     key: "interchangeable",
    //     label: "Взаимозаменяемые цвета",
    //     values: setColorText(
    //         props.demand[CONST_TITLES.INTERCHANGEABLE_COLORS],
    //     ),
    // },
    // {
    //     key: "possible",
    //     label: "Возможные цвета",
    //     values: setColorText(
    //         props.demand[CONST_TITLES.POSSIBLE_COLORS],
    //     ),
    // },
]);
</script>

<template>
    <article class="demand-card">
        <div class="demand-card__header">
            <span class="demand-card__title">
                {{ formatValue(demand[CONST_TITLES.TYPE_OF_PRODUCT]) }}
            </span>
        </div>

        <div class="demand-card__body">
            <div
                v-for="field in fields"
                :key="field.key"
                class="demand-card__row"
            >
                <span class="demand-card__label">
                    {{ field.label }}
                </span>

                <span class="demand-card__value">
                    {{ field.value }}
                </span>
            </div>

            <div
                v-for="group in colors"
                :key="group.key"
                class="demand-card__row"
            >
                <span class="demand-card__label">
                    {{ group.label }}
                </span>

                <span class="demand-card__value demand-card__colors">
                    <template v-if="group.values.length">
                        <span
                            v-for="value in group.values"
                            :key="`${value.colorName}-${value.color}`"
                            class="demand-card__color"
                            :style="{
                                color: value.color === '#ffffff'
                                    ? 'inherit'
                                    : value.color,
                            }"
                        >
                            {{ value.colorName || "-" }}
                        </span>
                    </template>
                    <template v-else>-</template>
                </span>
            </div>
        </div>
    </article>
</template>

<style scoped lang="scss">


.demand-card {
    min-width: 0;
    padding: 10px 14px;
    border: 1px solid #e8e9eb;
    border-radius: 7px;
    background: #fff;
    transition: border-color 0.2s ease;

    &:hover {
        border-color: #cbd9ce;
    }

    &__header {
        display: flex;
        align-items: center;
        margin-bottom: 7px;
    }

    &__title {
        color: #292824;
        font-size: 12.5px;
        font-weight: 650;
    }

    &__body {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    &__row {
        display: grid;
        grid-template-columns: 165px minmax(0, 1fr);
        gap: 8px;
        align-items: baseline;
        font-size: 11.5px;
        line-height: 1.4;
    }

    &__label {
        color: #9298a0;
        font-weight: 500;
    }

    &__value {
        min-width: 0;
        color: #343a40;
        overflow-wrap: anywhere;
    }

    &__colors {
        display: flex;
        flex-wrap: wrap;
        column-gap: 4px;
    }

    &__color:not(:last-child)::after {
        content: ",";
        color: #9298a0;
    }
}

@media (max-width: 600px) {
    .demand-card {
        padding: 9px 11px;

        &__row {
            grid-template-columns: 1fr;
            gap: 1px;
        }
    }
}

</style>
