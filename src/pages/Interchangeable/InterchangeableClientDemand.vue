<script setup lang="ts">
import { computed } from "vue";
import type { DataObject } from "@/types/TableSheetData";
import { setColorText } from "@/utils/colorHelpers";
import { formatCost } from "@/utils/normalize";
import { CONST_TITLES } from "@/configs/CONFIG_CONST";

interface DisplayField {
    key: string;
    label: string;
    value: string;
}

const props = defineProps<{
    clientsDemand?: DataObject;
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

const formatValue = (value: unknown): string => {
    if (value == null || String(value).trim() === "") {
        return "-";
    }

    if (typeof value === "number") {
        return formatCost(value) ?? String(value);
    }

    if (Array.isArray(value)) {
        return value.join(", ");
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value);
};

const formatRange = (from: unknown, to: unknown): string => {
    const isEmpty = (value: unknown) =>
        value == null || String(value).trim() === "";

    const hasFrom = !isEmpty(from);
    const hasTo = !isEmpty(to);

    if (!hasFrom && !hasTo) {
        return "-";
    }

    if (!hasFrom) {
        return `${to} гр.`;
    }

    if (!hasTo) {
        return `${from} гр.`;
    }

    return `${from} – ${to} гр.`;
};

const displayFields = computed<DisplayField[]>(() => {
    const demand = props.clientsDemand;

    if (!demand) {
        return [];
    }

    const litrazh = demand[CONST_TITLES.LITRAZH];

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
            value: litrazh == null || String(litrazh).trim() === ""
                ? "-"
                : `${formatValue(litrazh)} л.`,
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
            values: setColorText(
                demand[CONST_TITLES.PRIMARY_COLOR],
            ),
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
            values: setColorText(
                demand[CONST_TITLES.POSSIBLE_COLORS],
            ),
        },
    ];
});
</script>
<template>
    <div class="contragent-desc-container">
        <Transition name="fade-slide" mode="out-in">
            <div
                v-if="!clientsDemand"
                key="not-found"
                class="interchangeable-unit-not-found"
            />
            <div
                v-else
                key="content"
            >
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
                        v-for="group in colorGroups"
                        :key="group.key"
                        class="subtitle-client-container"
                    >
                        <span class="subtitle">
                            {{ group.label }}
                        </span>

                        <span
                            v-for="value in group.values"
                            :key="`${value.colorName}-${value.color}`"
                            class="color-value"
                            :style="{
                                color: value.color === '#ffffff'
                                    ? 'inherit'
                                    : value.color,
                            }"
                        >
                            {{ value.colorName || "-" }}
                        </span>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped lang="scss">
.contragent-desc-container {
    width: 97%;
    margin: 25px auto;
    color: #292824;
}

.contragent-desc-title {
    margin-bottom: 12px;
    color: #66635d;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.contragent-desc-wrapper {
    display: flex;
    flex-direction: column;
    gap: 2.5px;
}

.subtitle-client-container {
    display: flex;
    align-items: baseline;
    min-width: 0;
    font-size: 12px;
    line-height: 1.45;
}

.color-value:not(:last-child)::after {
    content: ",\00a0";
}

.subtitle {
    flex: 0 0 180px;
    margin-right: 10px;
    color: #8a8780;
    font-weight: 700;
    line-height: 1.4;
}

.interchangeable-unit-not-found {
    padding: 10px 0;
    color: #85827b;
    font-size: 13px;
    line-height: 1.5;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition:
        opacity 0.35s ease,
        transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
        filter 0.35s ease;
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(-4px) scaleY(0.98);
    filter: blur(2px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-2px) scaleY(0.99);
    filter: blur(1px);
}

@media (max-width: 600px) {
    .contragent-desc-container {
        margin-top: 14px;
    }

    .contragent-desc-title {
        margin-bottom: 10px;
        font-size: 11px;
    }

    .contragent-desc-wrapper {
        gap: 8px;
        > div {
            display: block;
        }
    }

    .subtitle {
        display: block;
        margin: 0 0 2px;
        font-size: 9px;
    }
}

</style>