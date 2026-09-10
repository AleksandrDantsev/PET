<script setup lang="ts">
import { ref, computed } from "vue";

type DataObject = Record<string, string | number | boolean | null>;

const props = defineProps<{
    clientsDemand: DataObject;
}>();

const clientsDemandMemo = computed(() => {
    return props.clientsDemand;
});

</script>

<template>
    <div class="contragent-desc-container">
        <div 
            v-if="!clientsDemandMemo" 
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
                <div>
                    <span class="subtitle">Контрагент:</span>
                    {{ clientsDemandMemo["Клиент"] }}
                </div>

                <div>
                    <span class="subtitle">Филиал:</span>
                    {{ clientsDemandMemo["Филиал"] }}
                </div>

                <div>
                    <span class="subtitle">Менеджер клиента:</span>
                    {{ clientsDemandMemo["Менеджер"] }}
                </div>

                <div>
                    <span class="subtitle">Тип товара:</span>
                    {{ clientsDemandMemo["Тип"] }}
                </div>

                <div>
                    <span class="subtitle">Стандарт:</span>
                    {{ clientsDemandMemo["Стандарт"] }}
                </div>

                <div>
                    <span class="subtitle">Диапазон граммаж:</span>
                    {{ clientsDemandMemo['Граммаж "от"'] }} -
                    {{ clientsDemandMemo['Граммаж "до"'] }}
                </div>

                <div>
                    <span class="subtitle">Основной цвет:</span>
                    {{ clientsDemandMemo["Основной цвет"] }}
                </div>

                <div>
                    <span class="subtitle">Взаимозаменяемые цвета:</span>
                    {{ clientsDemandMemo["Взаимозаменяемые цвета"] }}
                </div>

                <div>
                    <span class="subtitle">Возможные цвета:</span>
                    {{ clientsDemandMemo["Возможные цвета"] }}
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped lang="scss">

.contragent-desc-container {
    width: 91%;
    margin: 25px auto;
    color: #292824;
}


/* =========================================================
   TITLE
========================================================= */

.contragent-desc-title {
    margin-bottom: 12px;

    color: #66635d;

    font-size: 12px;
    font-weight: 600;

    line-height: 1.3;

    letter-spacing: 0.06em;
    text-transform: uppercase;
}


/* =========================================================
   LIST
========================================================= */

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


/* =========================================================
   LABEL
========================================================= */

.subtitle {
    flex: 0 0 180px;

    margin-right: 10px;

    color: #8a8780;

    font-size: 11px;
    font-weight: 600;

    line-height: 1.4;

    white-space: nowrap;
}


/* =========================================================
   VALUE
========================================================= */

.value {
    min-width: 0;

    color: #3d3b36;

    font-size: 13px;
    line-height: 1.45;

    overflow-wrap: anywhere;
}


/* =========================================================
   CLIENT
========================================================= */

.contragent-desc-wrapper > div:first-child {
    margin-bottom: 2px;

    .value {
        color: #292824;

        font-size: 14px;
        font-weight: 600;
    }
}


/* =========================================================
   NOT FOUND
========================================================= */

.interchangeable-unit-not-found {
    padding: 10px 0;

    color: #85827b;

    font-size: 13px;
    line-height: 1.5;
}


/* =========================================================
   MOBILE
========================================================= */

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