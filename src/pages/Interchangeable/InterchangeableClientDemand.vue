<script setup lang="ts">
import { computed } from "vue";
import type { DataObject } from "@/types/TableSheetData";
import { setColorText } from "@/utils/colorHelpers";
import { CONST_TITLES } from "@/configs/CONFIG_CONST";

const props = defineProps<{
    clientsDemand?: DataObject;
}>();

const subtitles = {
    contragent: "Контрагент:",
    branch: "Филиал:",
    manager: "Менеджер клиента:",
    typeOfProduct: "Тип товара:",
    standard: "Стандарт:",
    rangeOfGrams: "Диапазон граммажей:",
    baseColor: "Основной цвет:",
    interchangeableColors: "Взаимозаменяемые цвета:",
    possibleColors: "Возможные цвета:",
}

const colorsData = computed(() => {
    if (!props.clientsDemand) {
        return undefined;
    }
    return {
        mainColors: setColorText(
            props.clientsDemand[CONST_TITLES.PRIMARY_COLOR]
        ),
        interchangeableColors: setColorText(
            props.clientsDemand[CONST_TITLES.INTERCHANGEABLE_COLORS]
        ),
        possibleColors: setColorText(
            props.clientsDemand[CONST_TITLES.POSSIBLE_COLORS]
        )
    }
});

const colorGroups = computed(() => [
    {
        label: subtitles.baseColor,
        values: colorsData.value?.mainColors,
    },
    {
        label: subtitles.interchangeableColors,
        values: colorsData.value?.interchangeableColors,
    },
    {
        label: subtitles.possibleColors,
        values: colorsData.value?.possibleColors,
    },
]);

</script>
<template>
    <div class="contragent-desc-container">
        <Transition name="fade-slide">
            <div 
                v-if="!clientsDemand"
                key="not-found" 
                class="interchangeable-unit-not-found"
            >
                Не найдено подходящих данных о контрагенте в листе
                "Взаимозаменяемое", учитывая позицию
            </div>

            <div 
                v-else 
                key="content"
            >
                <div class="contragent-desc-title">
                    Потребности клиента по данному типу товара:
                </div>

                <div class="contragent-desc-wrapper">
                    <div class="subtitle-client-container">
                        <span class="subtitle">
                            {{ subtitles.contragent }}
                        </span>
                        {{ clientsDemand[CONST_TITLES.CONTRAGENT] }}
                    </div>

                    <div class="subtitle-client-container">
                        <span class="subtitle">
                            {{ subtitles.branch }}
                        </span>
                        {{ clientsDemand[CONST_TITLES.BRANCH_DELIVERY] }}
                    </div>

                    <div class="subtitle-client-container">
                        <span class="subtitle">
                            {{ subtitles.manager }}
                        </span>
                        {{ clientsDemand[CONST_TITLES.MANAGER] }}
                    </div>

                    <div class="subtitle-client-container">
                        <span class="subtitle">
                            {{ subtitles.typeOfProduct }}
                        </span>
                        {{ clientsDemand[CONST_TITLES.TYPE_OF_PRODUCT] }}
                    </div>

                    <div class="subtitle-client-container">
                        <span class="subtitle">
                            {{ subtitles.standard }}
                        </span>
                        {{ clientsDemand[CONST_TITLES.STANDARD] }}
                    </div>

                    <div class="subtitle-client-container">
                        <span class="subtitle">
                            {{ subtitles.rangeOfGrams }}
                        </span>
                        {{ clientsDemand[CONST_TITLES.WEIGHT_FROM] }} - {{ clientsDemand[CONST_TITLES.WEIGHT_TO] }} 
                        {{ clientsDemand[CONST_TITLES.WEIGHT_FROM] && "гр." }}
                    </div>

                    <div
                        v-for="(group, index) in colorGroups"
                        :key="group.label + index"
                        class="subtitle-client-container"
                    >
                        <span class="subtitle">{{ group.label }}</span>

                        <span
                            v-for="value in group.values"
                            :key="`${value.colorName}-${value.color}`"
                            class="color-value"
                            :style="{ 
                                color: value.color === '#ffffff' ? 'inherit' : value.color 
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
    width: 93%;
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
    gap: 7px;
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

</style>