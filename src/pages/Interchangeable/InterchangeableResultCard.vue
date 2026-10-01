<script setup>
import { computed, nextTick, ref } from 'vue';
import { getHardnessColor, setDaysText, getProductColor, formatNumber } from '@/utils/tableHelpers';
import { trimTrailingZeros } from '@/utils/normalize';

const props = defineProps({
    result: {
        type: Object,
        required: true,
    },

    index: {
        type: Number,
        required: true,
    },

    isExpanded: {
        type: Boolean,
        required: true,
    },
});

const emit = defineEmits([
    'open',
    'close',
]);

const cardRef = ref(null);

const dropdownDirection = ref('down');

const cardData = computed(() => ({
    hardnessDaysForm: setDaysText(
        props.result["Кол-во дней с даты привоза"]
    ),

    hardnessColor: getHardnessColor(
        props.result["Кол-во дней с даты привоза"]
    ),

    productColor: getProductColor(
        props.result["Номенклатура 1С"]
    ),

    cost: formatNumber(
        props.result["Стоимость недопроданного товара"]
    ),
}));


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

            return (
                value !== null &&
                value !== undefined &&
                value !== ''
            );
        })
        .map(key => ({
            key,
            value: props.result[key],
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
        typeof value === 'object' &&
        value !== null
    ) {
        return JSON.stringify(value);
    }

    return String(value);
};


const updateDropdownDirection = async () => {
    if (!cardRef.value) return;

    await nextTick();

    const rect = cardRef.value.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const estimatedDropdownHeight = Math.min(
        360,
        Math.max(
            150,
            additionalFields.value.length * 40 + 60
        )
    );

    const gap = 6;

    const spaceBelow = viewportHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;

    if (spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow) {
        dropdownDirection.value = 'up';
    } 
    else {
        dropdownDirection.value = 'down';
    }
};

const openCard = async () => {
    if (!additionalFields.value.length) {
        return;
    }

    emit('open', props.index);

    await updateDropdownDirection();
};

const closeCard = () => {
    emit('close', props.index);
};

const toggleExpanded = async () => {
    if (!additionalFields.value.length) {
        return;
    }

    if (props.isExpanded) closeCard();
    else openCard();
};

const handleKeydown = (event) => {
    if (
        event.key === 'Enter' ||
        event.key === ' '
    ) {
        event.preventDefault();

        toggleExpanded();
    }

    if (event.key === 'Escape') {
        closeCard();
    }
};

defineExpose({
    updateDropdownDirection,
});
</script>

<template>
    <div
        ref="cardRef"
        class="interchangeable-unit"
        data-interchangeable-card
        :class="{
            'is-expanded': isExpanded,
            'dropdown-up': dropdownDirection === 'up',
            'dropdown-down': dropdownDirection === 'down',
        }"
        role="button"
        tabindex="0"
        :aria-expanded="isExpanded"
        @click="toggleExpanded"
        @keydown="handleKeydown"
    >
        <div class="counter-color">
            <div class="interchangeable-unit-counter">
                <span>
                    {{ index + 1 }}
                </span>
            </div>

            <div
                class="interchangeable-unit-color"
                :style="{
                    backgroundColor: cardData.productColor,
                }"
            />
        </div>
        <div class="interchangeable-unit-container">
            <div class="interchangeable-unit-header">
                <div class="interchangeable-unit-nomenclature">
                    {{ result["Номенклатура 1С"] || "-" }}
                </div>

                <div
                    v-if="additionalFields.length"
                    class="expand-icon"
                    :class="{
                        rotated: isExpanded,
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
            <div class="interchangeable-unit-desc-container">
                <div class="subtitle-container">
                    <span class="subtitle">
                        Филиал:
                    </span>

                    <span class="field-value">
                        {{ result["Филиал"] || "-" }}
                    </span>
                </div>

                <div class="subtitle-container">
                    <span class="subtitle">
                        Менеджер:
                    </span>

                    <span class="field-value">
                        {{ result["Ответственный за продажу"] || "-" }}
                    </span>
                </div>

                <div class="subtitle-container">
                    <span class="subtitle">
                        Клиент:
                    </span>

                    <span class="field-value">
                        {{ result["Какому клиенту планируется продажа"] || "-" }}
                    </span>
                </div>

                <div class="subtitle-container">
                    <span class="subtitle">
                        Стоимость:
                    </span>

                    <span class="field-value">
                        {{ cardData.cost ? cardData.cost + " р." : "-" }}
                    </span>
                </div>

                <div class="subtitle-container">
                    <span class="subtitle">
                        Жесткость:
                    </span>

                    <span
                        class="field-value hardness"
                        :style="{
                            color: cardData.hardnessColor,
                        }"
                    >
                        {{ result["Жесткость"] || "-" }}

                        <span class="hardness-days">
                            (
                            {{ result["Кол-во дней с даты привоза"] || 0 }}
                            {{ cardData.hardnessDaysForm }}
                            )
                        </span>
                    </span>
                </div>

                <div class="subtitle-container">
                    <span class="subtitle">
                        Остатки:
                    </span>

                    <span class="field-value">
                        {{
                            trimTrailingZeros(
                                result["Кол-во кор. на остатках из 1С"]
                            ) || "-"
                        }}
                    </span>
                </div>
            </div>
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

.interchangeable-unit-container {
    flex: 1;
    min-width: 0;
}

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
    border: 1px solid #aca89a;
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

.interchangeable-unit-desc-container {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: 18px;
    row-gap: 5px;
    width: 100%;
    min-width: 0;
    font-size: 11px;
}

.subtitle-container {
    display: flex;
    align-items: baseline;
    min-width: 0;
    line-height: 1.4;
}

.subtitle {
    flex: 0 0 auto;
    margin-right: 4px;
    color: #929088;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.field-value {
    min-width: 0;
    color: #34332f;
    overflow-wrap: anywhere;
    word-break: break-word;
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
}

.additional-wrapper {
    position: absolute;
    z-index: 1000;
    left: -1px;
    right: -1px;
    box-sizing: border-box;
    padding: 11px 14px 13px;
    background: #fff;
    border: 1px solid #ddd9d1;
    border-radius: 8px;
    box-shadow:
        0 12px 30px rgba(0, 0, 0, 0.09),
        0 3px 8px rgba(0, 0, 0, 0.04);
}

.dropdown-down .additional-wrapper {
    top: calc(100% + 5px);
}

.dropdown-up .additional-wrapper {
    bottom: calc(100% + 5px);
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
        flex: 0 0 14px;
        background: #e5e2db;
    }
}

.additional-fields {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.additional-field {
    display: grid;
    grid-template-columns:
        minmax(130px, 0.35fr)
        minmax(0, 1fr);

    align-items: start;
    min-width: 0;
    padding: 6px 0;
    border-bottom: 1px solid #f0eee9;
    &:last-child {
        border-bottom: 0;
    }
}

.additional-label {
    min-width: 0;
    padding-right: 10px;
    color: #aaa79f;
    font-size: 10px;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: 0.03em;
    overflow-wrap: anywhere;
    word-break: break-word;
}

.additional-value {
    min-width: 0;
    color: #41403b;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.35;
    white-space: normal;

    overflow-wrap: anywhere;
    word-break: break-word;
}

.dropdown-enter-active,
.dropdown-leave-active {
    transition:
        opacity 0.16s ease,
        transform 0.16s ease;
}

.dropdown-down .dropdown-enter-from,
.dropdown-down .dropdown-leave-to {
    opacity: 0;
    transform:
        translateY(-5px)
        scale(0.985);
}

.dropdown-down .dropdown-enter-to,
.dropdown-down .dropdown-leave-from {
    opacity: 1;
    transform:
        translateY(0)
        scale(1);
}

.dropdown-up .dropdown-enter-from,
.dropdown-up .dropdown-leave-to {
    opacity: 0;
    transform:
        translateY(5px)
        scale(0.985);
}

.dropdown-up .dropdown-enter-to,
.dropdown-up .dropdown-leave-from {
    opacity: 1;
    transform:
        translateY(0)
        scale(1);
}

@media (max-width: 900px) {
    .interchangeable-unit-desc-container {
        grid-template-columns:
            repeat(2, minmax(0, 1fr));

        column-gap: 12px;
    }
}

@media (max-width: 600px) {
    .interchangeable-unit {
        padding: 9px;
    }

    .counter-color {
        flex-basis: 28px;
        width: 28px;
        margin-right: 10px;
    }

    .interchangeable-unit-desc-container {
        grid-template-columns: 1fr;
        gap: 5px;
    }

    .subtitle-container {
        align-items: baseline;
    }

    .additional-wrapper {
        padding: 10px;
    }

    .additional-field {
        grid-template-columns: 1fr;
        gap: 2px;
    }

    .additional-label {
        padding-right: 0;
    }
}

@media (max-width: 400px) {
    .interchangeable-unit-nomenclature {
        font-size: 11px;
    }

    .subtitle-container {
        font-size: 10px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .interchangeable-unit,
    .expand-icon,
    .dropdown-enter-active,
    .dropdown-leave-active {
        transition: none;
    }
}
</style>
