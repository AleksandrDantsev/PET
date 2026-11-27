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

interface DisplayField {
    key: string;
    label: string;
    value: string;
}

const props = defineProps<{
    clientsDemand?: DataObject | null;
}>();

const subtitles = {
    contragent: "Контрагент:",
    branch: "Филиал:",
    manager: "Менеджер клиента:",
    typeOfProduct: "Тип товара:",
    standard: "Стандарт:",
    litrazh: "Литраж:",
    rangeOfGrams: "Диапазон граммажей:",
    baseColor: "Основной цвет:",
    interchangeableColors: "Взаимозаменяемые цвета:",
    possibleColors: "Возможные цвета:",
} as const;

const displayFields = computed<DisplayField[]>(() => {
    const demand = props.clientsDemand;

    if (!demand) {
        return [];
    }

    return [
        {
            key: "contragent",
            label: subtitles.contragent,
            value: formatValue(demand[CONST_TITLES.CONTRAGENT]),
        },
        {
            key: "branch",
            label: subtitles.branch,
            value: formatValue(demand[CONST_TITLES.BRANCH_DELIVERY]),
        },
        {
            key: "manager",
            label: subtitles.manager,
            value: formatValue(demand[CONST_TITLES.MANAGER]),
        },
        {
            key: "typeOfProduct",
            label: subtitles.typeOfProduct,
            value: formatValue(demand[CONST_TITLES.TYPE_OF_PRODUCT]),
        },
        {
            key: "standard",
            label: subtitles.standard,
            value: formatValue(demand[CONST_TITLES.STANDARD]),
        },
        {
            key: "litrazh",
            label: subtitles.litrazh,
            value: formatLitrazh(demand[CONST_TITLES.LITRAZH]),
        },
        {
            key: "rangeOfGrams",
            label: subtitles.rangeOfGrams,
            value: formatRange(
                demand[CONST_TITLES.WEIGHT_FROM],
                demand[CONST_TITLES.WEIGHT_TO],
            ),
        },
    ];
});

const colorGroups = computed(() => {
    const demand = props.clientsDemand;

    if (!demand) {
        return [];
    }

    return [
        {
            key: "baseColor",
            label: subtitles.baseColor,
            values: setColorText(demand[CONST_TITLES.PRIMARY_COLOR]),
        },
        {
            key: "interchangeableColors",
            label: subtitles.interchangeableColors,
            values: setColorText(
                demand[CONST_TITLES.INTERCHANGEABLE_COLORS],
            ),
        },
        {
            key: "possibleColors",
            label: subtitles.possibleColors,
            values: setColorText(demand[CONST_TITLES.POSSIBLE_COLORS]),
        },
    ];
});

const visibleColorGroups = computed(() =>
    colorGroups.value.filter(group =>
        group.values.some(value => value.colorName !== "-"),
    ),
);

function isWhiteColor(color: string): boolean {
    const normalized = color.trim().toLowerCase();

    return [
        "#fff",
        "#ffffff",
        "white",
        "rgb(255, 255, 255)",
        "rgba(255, 255, 255, 1)",
    ].includes(normalized);
}
</script>

<template>
    <div class="contragent-desc-container">
        <Transition name="fade-slide" mode="out-in">
            <div
                v-if="!clientsDemand"
                key="not-found"
                class="interchangeable-unit-not-found"
            />

            <div v-else key="content">
                <div class="contragent-desc-title">
                    Потребности клиента по данному типу товара:
                </div>

                <div class="contragent-desc-wrapper">
                    <div
                        v-for="field in displayFields"
                        :key="field.key"
                        class="subtitle-client-container"
                    >
                        <span class="subtitle">
                            {{ field.label }}
                        </span>

                        <span>{{ field.value }}</span>
                    </div>

                    <div
                        v-for="group in visibleColorGroups"
                        :key="group.key"
                        class="subtitle-client-container color-group"
                    >
                        <span class="subtitle">
                            {{ group.label }}
                        </span>

                        <div class="color-values">
                            <span
                                v-for="value in group.values"
                                :key="`${value.colorName}-${value.color}`"
                                class="color-chip"
                                :class="{
                                    'color-chip-white': isWhiteColor(value.color),
                                }"
                                :style="{
                                    '--chip-color': value.color,
                                }"
                            >
                                {{ value.colorName || "-" }}
                            </span>

                            <span
                                v-if="!group.values.length"
                                class="empty-value"
                            >
                                —
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped lang="scss">
$primary: #252525;
$secondary: #85858b;

.contragent-desc-container {
    width: 97%;
    margin: 20px auto;
    color: $primary;
}

.contragent-desc-title {
    margin-bottom: 13px;
    color: #424248;
    font-size: 14px;
    font-weight: 650;
    line-height: 1.4;
    letter-spacing: -0.15px;
}

.contragent-desc-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.subtitle-client-container {
    display: flex;
    align-items: baseline;
    min-width: 0;
    font-size: 12px;
    line-height: 1.4;
}

.subtitle {
    flex: 0 0 180px;
    margin-right: 8px;
    color: $secondary;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.4;
}

.subtitle-client-container > span:not(.subtitle) {
    min-width: 0;
    color: $primary;
    font-size: 12px;
    font-weight: 550;
    overflow-wrap: anywhere;
}

.color-group {
    align-items: baseline;
    margin-top: 3px;
}

.color-values {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    min-width: 0;
}

.color-chip {
    display: inline-flex;
    align-items: center;
    min-height: 19px;
    padding: 1px 7px;
    color: color-mix(in srgb, var(--chip-color) 80%, #292929);
    font-size: 10px;
    font-weight: 550;
    line-height: 1.3;
    white-space: nowrap;
    user-select: none;
    cursor: default;
    background: color-mix(in srgb, var(--chip-color) 10%, white);
    border: 1px solid color-mix(in srgb, var(--chip-color) 16%, white);
    border-radius: 5px;
    transition:
        background-color 0.15s ease,
        border-color 0.15s ease;

    &:hover {
        background: color-mix(in srgb, var(--chip-color) 17%, white);
        border-color: color-mix(in srgb, var(--chip-color) 25%, white);
    }
}

.color-chip-white {
    color: #55555a;
    background: #fff;
    border-color: #dedee3;

    &:hover {
        background: #f5f5f7;
        border-color: #c7c7cc;
    }
}

.empty-value {
    color: $secondary;
    font-size: 11px;
}

.interchangeable-unit-not-found {
    padding: 7px 0;
    color: $secondary;
    font-size: 12px;
    line-height: 1.4;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(-3px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(3px);
}

@media (max-width: 600px) {
    .contragent-desc-container {
        margin: 12px auto;
    }

    .subtitle-client-container {
        display: block;
    }

    .subtitle {
        display: inline;
        margin-right: 6px;
    }

    .color-group {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .fade-slide-enter-active,
    .fade-slide-leave-active,
    .color-chip {
        transition: none;
    }
}
</style>