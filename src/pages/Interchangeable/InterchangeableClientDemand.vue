<script setup lang="ts">
import { computed } from "vue";
import type { DataObject } from "@/types/TableSheetData";
import { setColorText } from "@/utils/colorHelpers";

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
            props.clientsDemand["Основной цвет"]
        ),
        interchangeableColors: setColorText(
            props.clientsDemand["Взаимозаменяемые цвета"]
        ),
        possibleColors: setColorText(
            props.clientsDemand["Возможные цвета"]
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
        <div 
            v-if="!clientsDemand" 
            class="interchangeable-unit-not-found"
        >
            Не найдено подходящих данных о контрагенте в листе
            "Взаимозаменяемое", учитывая позицию
        </div>

        <template v-else>
            <div class="contragent-desc-title">
                Потребности клиента по данному типу товара:
            </div>

            <div class="contragent-desc-wrapper">
                <div class="subtitle-client-container">
                    <span class="subtitle">
                        {{ subtitles.contragent }}
                    </span>
                    {{ clientsDemand["Клиент"] }}
                </div>

                <div class="subtitle-client-container">
                    <span class="subtitle">
                        {{ subtitles.branch }}
                    </span>
                    {{ clientsDemand["Филиал"] }}
                </div>

                <div class="subtitle-client-container">
                    <span class="subtitle">
                        {{ subtitles.manager }}
                    </span>
                    {{ clientsDemand["Менеджер"] }}
                </div>

                <div class="subtitle-client-container">
                    <span class="subtitle">
                        {{ subtitles.typeOfProduct }}
                    </span>
                    {{ clientsDemand["Тип"] }}
                </div>

                <div class="subtitle-client-container">
                    <span class="subtitle">
                        {{ subtitles.standard }}
                    </span>
                    {{ clientsDemand["Стандарт"] }}
                </div>

                <div class="subtitle-client-container">
                    <span class="subtitle">
                        {{ subtitles.rangeOfGrams }}
                    </span>
                    {{ clientsDemand['Граммаж "от"'] }} - {{ clientsDemand['Граммаж "до"'] }} 
                    {{ clientsDemand['Граммаж "от"'] && "гр." }}
                </div>

                <div
                    v-for="(group, index) in colorGroups"
                    v-show="group.values?.length"
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
                        {{ value.colorName }}
                    </span>
                </div>
            </div>
        </template>
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

</style>