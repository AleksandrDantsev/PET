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
    --ink: #181817;
    --secondary: #777671;
    --line: #deddd9;
    --line-light: #ebeae7;
    --background: #ffffff;

    width: 100%;
    box-sizing: border-box;

    margin-top: 26px;

    color: var(--ink);

    font-family:
        Inter,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
}


// ═══════════════════════════════════════
// Заголовок
// ═══════════════════════════════════════

.contragent-desc-title {
    display: flex;
    align-items: center;

    margin: 0 0 17px;

    color: var(--ink);

    font-size: 11px;
    line-height: 1;
    font-weight: 600;

    text-transform: uppercase;

    letter-spacing: 0.13em;

    white-space: nowrap;

    &::after {
        content: "";

        width: 100%;
        height: 1px;

        margin-left: 18px;

        background: var(--line-light);
    }
}


// ═══════════════════════════════════════
// Поля
// ═══════════════════════════════════════

.contragent-desc-wrapper {
    margin: 0;

    border-top: 1px solid var(--line);

    > div {
        display: flex;
        align-items: baseline;

        min-width: 0;

        margin: 0;

        padding: 11px 2px;

        color: var(--ink);

        font-size: 13px;
        line-height: 1.4;

        border-bottom: 1px solid var(--line-light);

        overflow-wrap: anywhere;

        &:last-child {
            border-bottom-color: var(--line);
        }
    }
}


// ═══════════════════════════════════════
// Подписи
// ═══════════════════════════════════════

.subtitle {
    flex: 0 0 185px;

    display: inline-block;

    margin: 0;

    color: var(--secondary);

    font-size: 8px;
    line-height: 1.3;
    font-weight: 600;

    text-transform: uppercase;

    letter-spacing: 0.11em;
}


// ═══════════════════════════════════════
// Первое поле — контрагент
// ═══════════════════════════════════════

.contragent-desc-wrapper > div:first-child {
    padding-top: 13px;
    padding-bottom: 13px;

    font-size: 15px;
    font-weight: 600;

    letter-spacing: -0.01em;

    .subtitle {
        font-size: 8px;
    }
}


// ═══════════════════════════════════════
// Ошибка
// ═══════════════════════════════════════

.interchangeable-unit-not-found {
    position: relative;

    margin: 20px 0;

    padding: 15px 0 15px 16px;

    color: var(--secondary);

    font-size: 12px;
    line-height: 1.55;

    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);

    &::before {
        content: "";

        position: absolute;

        left: 0;
        top: 15px;
        bottom: 15px;

        width: 1px;

        background: #aaa8a2;
    }
}


// ═══════════════════════════════════════
// Планшет
// ═══════════════════════════════════════

@media (max-width: 800px) {
    .contragent-desc-container {
        margin-top: 22px;
    }

    .contragent-desc-title {
        font-size: 10px;
    }

    .subtitle {
        flex-basis: 155px;
    }
}


// ═══════════════════════════════════════
// Телефон
// ═══════════════════════════════════════

@media (max-width: 500px) {
    .contragent-desc-container {
        margin-top: 18px;
    }

    .contragent-desc-title {
        margin-bottom: 13px;

        font-size: 9px;

        letter-spacing: 0.1em;

        &::after {
            margin-left: 12px;
        }
    }

    .contragent-desc-wrapper {
        > div {
            padding: 9px 1px;

            font-size: 11px;
        }
    }

    .subtitle {
        flex-basis: 115px;

        font-size: 7px;
    }

    .contragent-desc-wrapper > div:first-child {
        padding-top: 11px;
        padding-bottom: 11px;

        font-size: 13px;

        .subtitle {
            font-size: 7px;
        }
    }

    .interchangeable-unit-not-found {
        margin: 15px 0;

        padding: 12px 0 12px 12px;

        font-size: 11px;
    }
}
</style>
