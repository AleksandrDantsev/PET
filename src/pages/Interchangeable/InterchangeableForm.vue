<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { normalizeForSorting } from "@/utils/normalize";
import type { IGoogleTableData } from "../../types/TableSheetData";
import type { FormInst, FormRules } from "naive-ui";
import {
    NAutoComplete,
    NButton,
    NDatePicker,
    NForm,
    NFormItem,
    NInput,
    NInputNumber,
    NSelect,
} from "naive-ui";

const props = defineProps<{
    actualData?: IGoogleTableData | null;
    constTitles?: Record<string, string> | null;
    contragents: Record<string, {
        branch: string;
        manager: string;
    }> | null;
    managersBranches: Record<string, string> | null;
    search: (value: Record<string, string>) => void;
}>();



const nomenclature = ref("");
const selectedContragent = ref("");
const manager = ref<string | null>(null);
const branch = ref<string | null>(null);
const date = ref<number>(Date.now());
const znurType = ref("");
const quantity = ref<number | null>(null);
const dateOfDelivery = ref<number | null>(Date.now());

const formRef = ref<FormInst | null>(null);
const passportFormRef = ref<FormInst | null>(null);

const branchOptions = [
    {
        label: "КРЫМ",
        value: "КРЫМ",
    },
    {
        label: "КРАСНОДАР",
        value: "КРАСНОДАР",
    },
];

const managerOptions = computed(() => {
    if (!props?.managersBranches) {
        return [];
    }

    return Object.keys(
        props.managersBranches
    ).map(el => ({
        label: el,
        value: el,
    }));
});


watch(manager, (newManager) => {
    if (!newManager || !props.managersBranches) {
        branch.value = null;
        return;
    }

    const managerBranch = props.managersBranches[newManager]
        .toUpperCase()
        .trim();

    const hasMultipleBranches = ["КРЫМ", "КРАСНОДАР"].every(
        branch => managerBranch.includes(branch)
    );

    branch.value = hasMultipleBranches
        ? null
        : props.managersBranches[newManager];
});


const contragentsForSorting = computed(() => {
    if (!props?.contragents) {
        return [];
    }

    return Object.keys(props.contragents)
        .sort((a, b) => normalizeForSorting(a).localeCompare(
            normalizeForSorting(b),
            undefined,
            { sensitivity: "base" }
        ));
});


const contragentOptions = computed(() => {
    if (!props.contragents) {
        return [];
    }

    const query = selectedContragent.value.trim().toLowerCase();

    return contragentsForSorting.value
        .filter((name) => {
            if (!query) {
                return true;
            }

            return name.toLowerCase().includes(query);
        })
        .map((name) => ({
            label: name,
            value: name,
        }));
});


const formValue = computed(() => ({
    nomenclature: nomenclature.value,
    contragent: selectedContragent.value,
    manager: manager.value,
    branch: branch.value,
    date: date.value,
    znurType: znurType.value,
    quantity: quantity.value,
    dateOfDelivery: dateOfDelivery.value,
}));


const searchRules: FormRules = {
    nomenclature: {
        required: true,
        message: "Введите номенклатуру",
        trigger: ["blur", "input"],
    },

    contragent: {
        required: true,
        message: "Выберите контрагента",
        trigger: ["blur", "input", "change"],
    },
};

const passportRules: FormRules = {
    manager: {
        required: true,
        message: "Выберите менеджера",
        trigger: ["change"],
    },

    branch: {
        required: true,
        message: "Выберите филиал",
        trigger: ["change"],
    },

    date: {
        required: true,
        message: "Выберите дату",
        trigger: ["change"],
        type: "number",
    },

    znurType: {
        required: true,
        message: "Введите тип ЗНУР",
        trigger: ["blur", "input"],
    },

    quantity: {
        required: true,
        message: "Введите количество",
        trigger: ["change"],
        type: "number",
    },

    dateOfDelivery: {
        required: true,
        message: "Выберите дату отгрузки",
        trigger: ["change"],
        type: "number",
    },
};

const returnInputValues = async () => {
    try {
        // await formRef.value?.validate();
    } catch {
        return;
    }

    props.search({
        nomenclature: nomenclature.value,
        contragent: selectedContragent.value,
        manager: manager.value ?? "",
        branch: branch.value ?? "",
        date: date.value?.toString() ?? "",
        znurType: znurType.value,
        quantity: quantity.value?.toString() ?? "",
        dateOfDelivery: dateOfDelivery.value?.toString() ?? "",
    });
};


const save = async () => {
    try {
        await Promise.all([
            formRef.value?.validate(),
            passportFormRef.value?.validate(),
        ]);
    } catch {
        return;
    }

};
</script>

<template>
    <div class="search-wrapper">
        <!-- Первая форма -->
        <n-form
            ref="formRef"
            class="search-form"
            :model="formValue"
            :rules="searchRules"
            :show-feedback="false"
        >
            <n-form-item
                label="Номенклатура"
                path="nomenclature"
            >
                <n-input
                    v-model:value="nomenclature"
                    placeholder="Введите номенклатуру"
                    clearable
                />
            </n-form-item>

            <n-form-item
                label="Контрагент"
                path="contragent"
            >
                <n-auto-complete
                    v-model:value="selectedContragent"
                    :options="contragentOptions"
                    placeholder="Введите контрагента"
                    clearable
                    :input-props="{
                        autocomplete: 'off',
                    }"
                />
            </n-form-item>

            <n-button
                class="search-button"
                type="primary"
                @click="returnInputValues"
            >
                Найти
            </n-button>
        </n-form>


        <!-- Вторая форма -->
        <n-form
            ref="passportFormRef"
            class="passport-fields"
            :model="formValue"
            :rules="passportRules"
            :show-feedback="false"
        >
            <n-form-item
                label="Менеджер"
                path="manager"
            >
                <n-select
                    v-model:value="manager"
                    :options="managerOptions"
                    placeholder="Менеджер"
                    clearable
                />
            </n-form-item>

            <n-form-item
                label="Филиал"
                path="branch"
            >
                <n-select
                    v-model:value="branch"
                    :options="branchOptions"
                    placeholder="Филиал"
                    clearable
                />
            </n-form-item>

            <n-form-item
                label="Дата"
                path="date"
            >
                <n-date-picker
                    v-model:value="date"
                    type="date"
                    clearable
                    class="full-width"
                />
            </n-form-item>

            <n-form-item
                label="Тип ЗНУР"
                path="znurType"
            >
                <n-input
                    v-model:value="znurType"
                    placeholder="Тип ЗНУР"
                    clearable
                />
            </n-form-item>

            <n-form-item
                label="Кол-во"
                path="quantity"
            >
                <n-input-number
                    v-model:value="quantity"
                    :min="1"
                    placeholder="Кол-во"
                    class="full-width"
                    clearable
                />
            </n-form-item>

            <n-form-item
                label="Предполагаемая дата отгрузки"
                path="dateOfDelivery"
            >
                <n-date-picker
                    v-model:value="dateOfDelivery"
                    type="date"
                    clearable
                    class="full-width"
                />
            </n-form-item>

            <n-button
                class="save-button"
                type="primary"
                secondary
                @click="save"
            >
                💾
            </n-button>
        </n-form>
    </div>
</template>
<style lang="scss" scoped>
.search-wrapper {
    position: sticky;
    top: 0;
    z-index: 100;

    width: 100%;
    box-sizing: border-box;

    padding: 12px 14px;

    background: #f8f8f6;

    border: 1px solid #e3e3df;
    border-radius: 8px;

    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.035);

    overflow: visible;
}


/* =========================================================
   ОСНОВНАЯ ФОРМА
========================================================= */

.search-form {
    position: relative;
    z-index: 20;

    display: grid;

    grid-template-columns:
        minmax(200px, 1fr)
        minmax(240px, 1fr)
        96px;

    gap: 10px;

    align-items: end;

    padding: 0;

    background: #f8f8f6;
}


/* =========================================================
   ДОПОЛНИТЕЛЬНЫЕ ПОЛЯ
========================================================= */

.passport-fields {
    position: relative;
    z-index: 1;

    display: grid;

    grid-template-columns:
        minmax(140px, 1.1fr)
        minmax(120px, 0.8fr)
        minmax(120px, 0.8fr)
        minmax(130px, 0.9fr)
        minmax(90px, 0.55fr)
        minmax(160px, 1.2fr)
        36px;

    gap: 10px;

    align-items: end;

    margin-top: 10px;
    padding: 10px 0 0;

    border-top: 1px solid #e4e4e0;
}


/* =========================================================
   LABELS
========================================================= */

:deep(.n-form-item-label) {
    padding-bottom: 4px !important;
}

:deep(.n-form-item-label__text) {
    color: #777;

    font-size: 10px;
    font-weight: 600;
    line-height: 1.1;

    letter-spacing: 0.08em;
    text-transform: uppercase;
}


/* =========================================================
   ОБЩИЕ INPUT / SELECT / DATE
========================================================= */

:deep(.n-input),
:deep(.n-input-number),
:deep(.n-base-selection),
:deep(.n-date-picker) {
    --n-border: #d8d8d4 !important;
    --n-border-hover: #b8b8b3 !important;
    --n-border-focus: #555 !important;

    --n-box-shadow-focus:
        0 0 0 2px rgba(40, 40, 40, 0.06) !important;

    --n-color: #fff !important;
    --n-text-color: #292929 !important;
    --n-placeholder-color: #999 !important;

    --n-height: 36px !important;

    min-height: 36px;

    background: #fff !important;

    border-radius: 6px !important;

    font-size: 12px !important;

    transition:
        border-color 0.15s ease,
        box-shadow 0.15s ease;
}


/* =========================================================
   INPUT
========================================================= */

:deep(.n-input) {
    background: #fff !important;
}

:deep(.n-input:hover) {
    background: #fff !important;
}

:deep(.n-input:focus-within) {
    background: #fff !important;

    box-shadow:
        0 0 0 2px rgba(40, 40, 40, 0.055) !important;
}


/* =========================================================
   TEXT
========================================================= */

:deep(.n-input__input-el),
:deep(.n-input__textarea-el),
:deep(.n-input-number-input__input) {
    color: #292929 !important;

    font-size: 12px !important;
}

:deep(input::placeholder) {
    color: #a3a39e !important;
}


/* =========================================================
   ICONS
========================================================= */

:deep(.n-input__suffix),
:deep(.n-input__prefix),
:deep(.n-base-selection__arrow) {
    color: #888 !important;
}

:deep(.n-input__clear),
:deep(.n-base-selection__clear) {
    color: #999 !important;
}

:deep(.n-input__clear:hover),
:deep(.n-base-selection__clear:hover) {
    color: #333 !important;
}


/* =========================================================
   SELECT
========================================================= */

:deep(.n-base-selection) {
    width: 100%;

    background: #fff !important;
}

:deep(.n-base-selection-label) {
    background: #fff !important;

    border-radius: 6px !important;
}

:deep(.n-base-selection-input) {
    background: transparent !important;
}

:deep(.n-base-selection-input__content) {
    color: #292929 !important;

    font-size: 12px !important;
}

:deep(.n-base-selection--active) {
    background: #fff !important;

    box-shadow:
        0 0 0 2px rgba(40, 40, 40, 0.055) !important;
}


/* =========================================================
   AUTOCOMPLETE
========================================================= */

:deep(.n-auto-complete) {
    width: 100%;
}

:deep(.n-auto-complete .n-input) {
    background: #fff !important;
}


/* =========================================================
   NUMBER
========================================================= */

:deep(.n-input-number) {
    width: 100%;

    background: #fff !important;
}

:deep(.n-input-number-input) {
    background: #fff !important;
}

:deep(.n-input-number__minus),
:deep(.n-input-number__plus) {
    color: #888 !important;
}

:deep(.n-input-number__minus:hover),
:deep(.n-input-number__plus:hover) {
    color: #333 !important;

    background: #f2f2ef !important;
}


/* =========================================================
   DATE
========================================================= */

.full-width {
    width: 100%;
}

:deep(.n-date-picker) {
    width: 100%;

    background: #fff !important;
}

:deep(.n-date-picker .n-input) {
    width: 100%;

    background: #fff !important;
}


/* =========================================================
   DROPDOWN
========================================================= */

:deep(.n-base-select-menu),
:deep(.n-auto-complete-menu) {
    overflow: hidden;

    border: 1px solid #deded9 !important;
    border-radius: 7px !important;

    background: #fff !important;

    box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.08) !important;
}


/* =========================================================
   OPTIONS
========================================================= */

:deep(.n-base-select-option) {
    min-height: 34px !important;

    padding: 0 10px !important;

    border-radius: 4px !important;

    color: #333 !important;

    font-size: 12px !important;
}

:deep(.n-base-select-option:hover) {
    background: #f3f3f0 !important;
}

:deep(.n-base-select-option.n-base-select-option--selected) {
    background: #ecece8 !important;

    color: #111 !important;

    font-weight: 500;
}


/* =========================================================
   DATE PANEL
========================================================= */

:deep(.n-date-panel) {
    border: 1px solid #deded9 !important;
    border-radius: 7px !important;

    background: #fff !important;

    box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.08) !important;
}


/* =========================================================
   SEARCH BUTTON
========================================================= */

.search-button {
    width: 96px !important;
    height: 36px !important;

    border: 1px solid #333 !important;
    border-radius: 6px !important;

    background: #333 !important;
    color: #fff !important;

    font-size: 10px !important;
    font-weight: 600 !important;

    letter-spacing: 0.12em;
    text-transform: uppercase;

    box-shadow: none !important;

    transition:
        background 0.15s ease,
        border-color 0.15s ease;
}

.search-button:hover {
    background: #222 !important;

    border-color: #222 !important;

    transform: none;

    box-shadow: none !important;
}

.search-button:active {
    background: #111 !important;
}


/* =========================================================
   SAVE BUTTON
========================================================= */

.save-button {
    width: 36px !important;
    min-width: 36px !important;
    height: 36px !important;

    padding: 0 !important;

    border: 1px solid #d6d6d1 !important;
    border-radius: 6px !important;

    background: #fff !important;
    color: #555 !important;

    font-size: 14px !important;

    box-shadow: none !important;

    transition:
        background 0.15s ease,
        color 0.15s ease,
        border-color 0.15s ease;
}

.save-button:hover {
    background: #f1f1ee !important;

    border-color: #c8c8c3 !important;

    color: #222 !important;

    transform: none;
}


/* =========================================================
   VALIDATION
========================================================= */

:deep(.n-form-item-feedback-wrapper) {
    font-size: 10px;
}

:deep(.n-form-item--error .n-input),
:deep(.n-form-item--error .n-base-selection),
:deep(.n-form-item--error .n-input-number) {
    --n-border: rgba(150, 45, 45, 0.45) !important;
}

:deep(.n-form-item-feedback--error) {
    color: #9a4545 !important;
}


/* =========================================================
   TABLET
========================================================= */

@media (max-width: 1250px) {
    .passport-fields {
        grid-template-columns:
            repeat(3, minmax(130px, 1fr))
            36px;
    }
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 850px) {
    .search-wrapper {
        padding: 10px;
        border-radius: 7px;
    }

    .search-form {
        grid-template-columns: 1fr;
        gap: 8px;
    }

    .search-button {
        width: 100% !important;
    }

    .passport-fields {
        grid-template-columns:
            repeat(2, minmax(130px, 1fr));

        gap: 8px;

        margin-top: 8px;
        padding-top: 8px;
    }

    .save-button {
        width: 100% !important;
    }
}


@media (max-width: 560px) {
    .passport-fields {
        grid-template-columns: 1fr;
    }
}


/* =========================================================
   REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {
    .passport-fields,
    .search-button,
    .save-button {
        transition: none;
    }
}

</style>