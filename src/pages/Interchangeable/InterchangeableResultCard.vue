<script setup>
import {
    computed,
    onBeforeUnmount,
    onMounted,
    ref
} from 'vue';

import {
    getHardnessColor,
    setDaysText,
    getProductColor,
    formatNumber
} from '@/utils/tableHelpers';
import { trimTrailingZeros } from '@/utils/normalize';

const props = defineProps({
    result: {
        type: Object,
        required: true
    },

    index: {
        type: Number,
        required: true
    }
});

const isExpanded = ref(false);

const cardRef = ref(null);

const cardId = Symbol('interchangeable-card');

/* =========================================
   COMPUTED
========================================= */

const hardnessDaysForm = computed(() =>
    setDaysText(
        props.result["Кол-во дней с даты привоза"]
    )
);

const hardnessColor = computed(() =>
    getHardnessColor(
        props.result["Кол-во дней с даты привоза"]
    )
);

const productColor = computed(() =>
    getProductColor(
        props.result["Номенклатура 1С"]
    )
);

const cost = computed(() =>
    formatNumber(
        props.result["Стоимость недопроданного товара"]
    )
);

/* =========================================
   ADDITIONAL FIELDS
========================================= */

const includedFields = [
    "Номер задачи в битрикс",
    "Дата привоза",
    "Кол-во дней с даты привоза",
    "Кол-во недопрод. товара",
    "Кто заказал",
    "Кому недопродано",
    "Все остатки из 1С",
    "Недопродал потому что",
    "Ближайшее действие",
    "Все клиенты, которым отгр. ном. + менеджер",
];

const additionalFields = computed(() => {
    return includedFields
        .filter(key => {
            const value = props.result[key];

            return value !== null
                && value !== undefined
                && value !== '';
        })
        .map(key => ({
            key,
            value: props.result[key]
        }));
});

const formatAdditionalValue = (value) => {
    if (typeof value === 'number') {
        return formatNumber(value) ?? value;
    }

    if (Array.isArray(value)) {
        return value.join(', ');
    }

    if (
        typeof value === 'object'
        && value !== null
    ) {
        return JSON.stringify(value);
    }

    return String(value);
};

/* =========================================
   OPEN / CLOSE
========================================= */

/**
 * Открываем карточку.
 *
 * Перед открытием сообщаем всем остальным карточкам,
 * что появилась новая активная карточка.
 */
const openCard = () => {
    if (!additionalFields.value.length) {
        return;
    }

    window.dispatchEvent(
        new CustomEvent('interchangeable-card-open', {
            detail: {
                id: cardId
            }
        })
    );

    isExpanded.value = true;
};

const closeCard = () => {
    isExpanded.value = false;
};

const toggleExpanded = () => {
    if (!additionalFields.value.length) {
        return;
    }

    if (isExpanded.value) {
        closeCard();
    } else {
        openCard();
    }
};

/* =========================================
   CLOSE OTHER CARDS
========================================= */

const handleOtherCardOpen = (event) => {
    if (event.detail?.id === cardId) {
        return;
    }

    closeCard();
};

/* =========================================
   CLICK OUTSIDE
========================================= */

const handlePointerDown = (event) => {
    if (!isExpanded.value) {
        return;
    }

    if (!cardRef.value) {
        return;
    }

    if (!cardRef.value.contains(event.target)) {
        closeCard();
    }
};

/* =========================================
   KEYBOARD
========================================= */

const handleKeydown = (event) => {
    if (
        event.key === 'Enter'
        || event.key === ' '
    ) {
        event.preventDefault();

        toggleExpanded();
    }

    if (event.key === 'Escape') {
        closeCard();
    }
};

/* =========================================
   LIFECYCLE
========================================= */

onMounted(() => {
    window.addEventListener(
        'interchangeable-card-open',
        handleOtherCardOpen
    );

    document.addEventListener(
        'pointerdown',
        handlePointerDown
    );
});

onBeforeUnmount(() => {
    window.removeEventListener(
        'interchangeable-card-open',
        handleOtherCardOpen
    );

    document.removeEventListener(
        'pointerdown',
        handlePointerDown
    );
});
</script>

<template>
    <div
        ref="cardRef"
        class="interchangeable-unit"
        :class="{
            'is-expanded': isExpanded
        }"
        role="button"
        tabindex="0"
        :aria-expanded="isExpanded"
        @click="toggleExpanded"
        @keydown="handleKeydown"
    >
        <!-- =========================================
             LEFT
        ========================================== -->

        <div class="counter-color">
            <div class="interchangeable-unit-counter">
                <span>
                    {{ index + 1 }}
                </span>
            </div>

            <div
                class="interchangeable-unit-color"
                :style="{
                    backgroundColor: productColor
                }"
            />
        </div>

        <!-- =========================================
             CONTENT
        ========================================== -->

        <div class="interchangeable-unit-container">

            <!-- HEADER -->

            <div class="interchangeable-unit-header">
                <div class="interchangeable-unit-nomenclature">
                    {{ result["Номенклатура 1С"] || "-" }}
                </div>

                <div
                    v-if="additionalFields.length"
                    class="expand-icon"
                    :class="{
                        rotated: isExpanded
                    }"
                    aria-hidden="true"
                >
                    <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M5.5 7.5L10 12L14.5 7.5"
                            stroke="currentColor"
                            stroke-width="1.6"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </div>
            </div>

            <!-- MAIN DATA -->

            <div class="interchangeable-unit-desc-conteiner">

                <div class="subtitle-conteiner">
                    <span class="subtitle">
                        Филиал:
                    </span>

                    {{ result["Филиал"] || "-" }}
                </div>

                <div class="subtitle-conteiner">
                    <span class="subtitle">
                        Менеджер:
                    </span>

                    {{ result["Ответственный за продажу"] || "-" }}
                </div>

                <div class="subtitle-conteiner">
                    <span class="subtitle">
                        Клиент:
                    </span>

                    {{ result["Какому клиенту планируется продажа"] || "-" }}
                </div>

                <div class="subtitle-conteiner">
                    <span class="subtitle">
                        Стоимость:
                    </span>

                    {{ cost ? cost + " р." : "-" }}
                </div>

                <div class="subtitle-conteiner">
                    <span class="subtitle">
                        Жесткость:
                    </span>

                    <span
                        class="hardness"
                        :style="{
                            color: hardnessColor
                        }"
                    >
                        {{ result["Жесткость"] || "-" }}

                        <span class="hardness-days">
                            (
                            {{ result["Кол-во дней с даты привоза"] || 0 }}
                            {{ hardnessDaysForm }}
                            )
                        </span>
                    </span>
                </div>

                <div class="interchangeable-unit-leftover">
                    <span class="subtitle">
                        Остатки:
                    </span>

                    {{ trimTrailingZeros(result["Кол-во кор. на остатках из 1С"]) || "-" }}
                </div>

            </div>

            <!-- =========================================
                 DROPDOWN
            ========================================== -->

            <Transition name="dropdown">
                <div
                    v-if="isExpanded"
                    class="additional-wrapper"
                    @click.stop
                >
                    <div class="additional-inner">

                        <div class="additional-title">
                            Дополнительная информация
                        </div>

                        <div class="additional-fields">

                            <div
                                v-for="field in additionalFields"
                                :key="field.key"
                                class="additional-field"
                            >
                                <div class="additional-label">
                                    {{ field.key }}
                                </div>

                                <div class="additional-value">
                                    {{ formatAdditionalValue(field.value) }}
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </Transition>

        </div>
    </div>
</template>

<style scoped lang="scss">
.interchangeable-unit {
    position: relative;
    z-index: 1;

    display: flex;

    width: 100%;
    min-width: 0;
    min-height: 52px;

    padding: 12px;

    box-sizing: border-box;

    background: #fff;

    border: 1px solid transparent;
    border-bottom-color: #e4e2dc;
    border-radius: 7px;

    cursor: pointer;

    transition:
        background 0.15s ease,
        border-color 0.15s ease,
        box-shadow 0.15s ease;

    &:hover {
        background: #fcfcfa;
        border-color: #dedbd3;
    }

    &.is-expanded {
        z-index: 100;

        background: #fdfdfb;

        border-color: #d9d6ce;

        box-shadow:
            0 8px 24px rgba(0, 0, 0, 0.08);
    }
}

/* =========================================
   COUNTER
========================================= */

.counter-color {
    display: flex;
    flex-direction: column;
    align-items: center;

    flex: 0 0 34px;

    width: 34px;

    padding-top: 2px;
    margin-right: 15px;

    box-sizing: border-box;
}

.interchangeable-unit-counter {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 22px;
    height: 22px;

    color: #85827b;

    font-size: 9px;
    font-weight: 600;

    background: #f6f5f1;

    border: 1px solid #e4e2dc;
    border-radius: 5px;
}

.interchangeable-unit-color {
    width: 8px;
    height: 8px;

    margin-top: 8px;

    border-radius: 50%;

    box-shadow:
        0 0 0 2px #fff,
        0 0 0 3px rgba(0, 0, 0, 0.04);
}

/* =========================================
   CONTENT
========================================= */

.interchangeable-unit-container {
    flex: 1;
    min-width: 0;
}

/* =========================================
   HEADER
========================================= */

.interchangeable-unit-header {
    display: flex;
    align-items: center;

    width: 100%;
    min-width: 0;

    margin-bottom: 7px;
}

.interchangeable-unit-nomenclature {
    flex: 1;
    min-width: 0;

    color: #292824;

    font-size: 12px;
    font-weight: 600;
    line-height: 1.25;

    overflow: hidden;

    text-overflow: ellipsis;
    white-space: nowrap;
}

/* =========================================
   ICON
========================================= */

.expand-icon {
    display: flex;
    align-items: center;
    justify-content: center;

    flex: 0 0 22px;

    width: 22px;
    height: 22px;

    margin-left: 8px;

    color: #aaa79f;

    background: #f7f6f2;

    border: 1px solid #e8e6df;
    border-radius: 5px;

    transition:
        color 0.18s ease,
        background 0.18s ease,
        transform 0.2s ease;

    svg {
        width: 14px;
        height: 14px;
    }

    &.rotated {
        color: #5f5c55;

        background: #efeee9;

        transform: rotate(180deg);
    }
}

/* =========================================
   MAIN DATA
========================================= */

.interchangeable-unit-desc-conteiner {
    display: grid;

    grid-template-columns:
        repeat(3, minmax(0, 1fr));

    grid-template-rows:
        repeat(2, minmax(0, auto));

    column-gap: 18px;
    row-gap: 5px;

    width: 100%;
    min-width: 0;

    font-size: 11px;
}

.interchangeable-unit-desc-conteiner > div {
    min-width: 0;

    overflow: hidden;

    white-space: nowrap;
    text-overflow: ellipsis;
}

.subtitle {
    margin-right: 4px;

    color: #929088;

    font-weight: 600;

    letter-spacing: 0.04em;

    text-transform: uppercase;
}

.subtitle-conteiner {
    font-size: 11px;
}

.hardness {
    font-weight: 700;
}

.hardness-days {
    font-weight: 500;
    opacity: 0.75;
}

.interchangeable-unit-leftover {
    color: #34332f;

    overflow: hidden;

    text-overflow: ellipsis;
    white-space: nowrap;
}

/* =========================================
   DROPDOWN
========================================= */

.additional-wrapper {
    position: absolute;

    z-index: 1000;

    top: calc(100% + 4px);

    left: 0;
    right: 0;

    padding: 11px 14px 13px;

    box-sizing: border-box;

    background: #fff;

    border: 1px solid #ddd9d1;
    border-radius: 8px;

    box-shadow:
        0 12px 30px rgba(0, 0, 0, 0.09),
        0 3px 8px rgba(0, 0, 0, 0.04);
}

.additional-inner {
    min-width: 0;
}

.additional-title {
    display: flex;
    align-items: center;

    gap: 8px;

    margin-bottom: 6px;

    color: #aaa79f;

    font-size: 9px;
    font-weight: 700;

    line-height: 1.2;

    letter-spacing: 0.07em;

    text-transform: uppercase;

    &::before {
        content: '';

        width: 14px;
        height: 1px;

        background: #e5e2db;
    }
}

.additional-fields {
    display: flex;
    flex-direction: column;
}

.additional-field {
    display: grid;

    grid-template-columns:
        minmax(130px, 0.35fr)
        minmax(0, 1fr);

    align-items: center;

    min-width: 0;

    padding: 6px 0;

    border-bottom: 1px solid #f0eee9;

    &:last-child {
        border-bottom: 0;
    }
}

.additional-label {
    min-width: 0;

    color: #aaa79f;

    font-size: 10px;
    font-weight: 600;

    line-height: 1.3;

    letter-spacing: 0.03em;
}

.additional-value {
    min-width: 0;

    color: #41403b;

    font-size: 11px;
    font-weight: 500;

    line-height: 1.35;

    overflow: hidden;

    text-overflow: ellipsis;
    white-space: nowrap;
}

/* =========================================
   ANIMATION
========================================= */

.dropdown-enter-active,
.dropdown-leave-active {
    transition:
        opacity 0.16s ease,
        transform 0.16s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;

    transform:
        translateY(-5px)
        scale(0.985);
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 800px) {
    .additional-fields {
        grid-template-columns:
            repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 600px) {
    .interchangeable-unit {
        padding: 9px;
    }

    .interchangeable-unit-desc-conteiner {
        grid-template-columns:
            repeat(2, minmax(0, 1fr));

        column-gap: 10px;
    }

    .additional-fields {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 400px) {
    .interchangeable-unit-desc-conteiner {
        grid-template-columns: 1fr;
    }
}
</style>
