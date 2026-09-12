<script setup lang="ts">
import { setColorText } from "@/utils/tableHelpers";
import { computed } from "vue";

type DataObject = Record<string, string | number | boolean | null>;

const props = defineProps<{
    clientsDemand: DataObject | undefined | null;
}>();


const colorsData = computed(() => {
    if (!props.clientsDemand) return undefined;
    return {
        mainColors: setColorText(props.clientsDemand["Основной цвет"]),
        interchangeableColors: setColorText(props.clientsDemand["Взаимозаменяемые цвета"]),
        possibleColors: setColorText(props.clientsDemand["Возможные цвета"])
    }
});

const setComma = (length: number, index: number) =>
    index < length - 1 ? ",\u00A0" : "";

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
                    <span class="subtitle">Контрагент:</span>
                    {{ clientsDemand["Клиент"] }}
                </div>

                <div class="subtitle-client-container">
                    <span class="subtitle">Филиал:</span>
                    {{ clientsDemand["Филиал"] }}
                </div>

                <div class="subtitle-client-container">
                    <span class="subtitle">Менеджер клиента:</span>
                    {{ clientsDemand["Менеджер"] }}
                </div>

                <div class="subtitle-client-container">
                    <span class="subtitle">Тип товара:</span>
                    {{ clientsDemand["Тип"] }}
                </div>

                <div class="subtitle-client-container">
                    <span class="subtitle">Стандарт:</span>
                    {{ clientsDemand["Стандарт"] }}
                </div>

                <div class="subtitle-client-container">
                    <span class="subtitle">Диапазон граммаж:</span>
                    {{ clientsDemand['Граммаж "от"'] }} - {{ clientsDemand['Граммаж "до"'] }} 
                    {{ clientsDemand['Граммаж "от"'] && "гр." }}
                </div>

                <div 
                    v-if="colorsData?.mainColors?.length"
                    class="subtitle-client-container"
                >
                    <span class="subtitle">Основной цвет:</span>
                    <span
                        v-for="(value, index) in colorsData.mainColors"
                        :key="value.colorName + value.color"
                        :style="{ color: value.color }"
                    >
                        {{ value.colorName + setComma(colorsData.mainColors.length, index) }}
                    </span>
                </div>

                <div 
                    v-if="colorsData?.interchangeableColors?.length"
                    class="subtitle-client-container"
                >
                    <span class="subtitle">Взаимозаменяемые цвета:</span>
                    <span
                        v-for="(value, index) in colorsData.interchangeableColors"
                        :key="value.colorName + value.color"
                        :style="{ color: value.color }"
                    >
                        {{ value.colorName + setComma(colorsData.interchangeableColors.length, index) }}
                    </span>
                </div>

                <div 
                    v-if="colorsData?.possibleColors?.length"
                    class="subtitle-client-container"
                >
                    <span class="subtitle">Возможные цвета:</span>
                    <span
                        v-for="(value, index) in colorsData.possibleColors"
                        :key="value.colorName + value.color"
                        :style="{ color: value.color }"
                    >
                        {{ value.colorName + setComma(colorsData.possibleColors.length, index) }}
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
    width: 100%;

    > div {
        display: flex;
        align-items: baseline;
        min-width: 0;
        line-height: 1.45;
    }
}

.subtitle-client-container {
    font-size: 12px;
}

.subtitle {
    flex: 0 0 180px;
    margin-right: 10px;
    color: #8a8780;
    font-weight: 700;
    line-height: 1.4;
}

.value {
    min-width: 0;
    color: #3d3b36;
    font-size: 13px;
    line-height: 1.45;
    overflow-wrap: anywhere;
}

.contragent-desc-wrapper > div:first-child {
    margin-bottom: 2px;
    .value {
        color: #292824;
        font-size: 14px;
        font-weight: 600;
    }
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

    .value {
        display: block;
        font-size: 12px;
    }

}

</style>