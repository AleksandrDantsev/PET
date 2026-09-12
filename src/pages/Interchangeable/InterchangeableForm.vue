<script setup lang="ts">
import { ref, computed, watch, reactive } from "vue";
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


const formValue = reactive({
    nomenclature: "",
    contragent: "",
    manager: null as string | null,
    branch: null as string | null,
    date: Date.now(),
    znurType: "",
    quantity: null as number | null,
    dateOfDelivery: Date.now() as number | null,
});


watch(
    () => formValue.manager,
    (newManager) => {
        if (!newManager || !props.managersBranches) {
            formValue.branch = null;
            return;
        }
        const managerBranch = props.managersBranches[newManager];

        if (!managerBranch) {
            formValue.branch = null;
            return;
        }

        const normalizedBranch = managerBranch.toUpperCase().trim();

        const hasMultipleBranches = ["КРЫМ", "КРАСНОДАР"].every(
            branch => normalizedBranch.includes(branch)
        );

        formValue.branch = hasMultipleBranches
            ? null
            : managerBranch;
    }
);


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

    const query = formValue.contragent.trim().toLowerCase();

    return contragentsForSorting.value
        .filter(name => {
            if (!query) {
                return true;
            }

            return name.toLowerCase().includes(query);
        })
        .map(name => ({
            label: name,
            value: name,
        }));
});


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
        nomenclature: formValue.nomenclature,
        contragent: formValue.contragent,
        manager: formValue.manager ?? "",
        branch: formValue.branch ?? "",
        date: formValue.date?.toString() ?? "",
        znurType: formValue.znurType,
        quantity: formValue.quantity?.toString() ?? "",
        dateOfDelivery: formValue.dateOfDelivery?.toString() ?? "",
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
                    v-model:value="formValue.nomenclature"
                    placeholder="Введите номенклатуру"
                    clearable
                />
            </n-form-item>

            <n-form-item
                label="Контрагент"
                path="contragent"
            >
                <n-auto-complete
                    v-model:value="formValue.contragent"
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
    </div>
    <div class="passport-wrapper">
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
                    v-model:value="formValue.manager"
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
                    v-model:value="formValue.branch"
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
                    v-model:value="formValue.date"
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
                    v-model:value="formValue.znurType"
                    placeholder="Тип ЗНУР"
                    clearable
                />
            </n-form-item>

            <n-form-item
                label="Кол-во"
                path="quantity"
            >
                <n-input-number
                    v-model:value="formValue.quantity"
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
                    v-model:value="formValue.dateOfDelivery"
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
$backgroundHeader: #f8f8f8;
.search-wrapper {
    position: sticky;
    top: 0px;
    z-index: 100;
    padding: 12px 14px 0px 14px;
    background: $backgroundHeader;
    border-radius: 8px 8px 0 0;
}
.passport-wrapper {
    padding: 0 14px 12px;
    background: $backgroundHeader;
    border-radius: 0 0 8px 8px;
}
.search-form {
    display: grid;
    grid-template-columns:
        minmax(200px, 1fr)
        minmax(240px, 1fr)
        96px;
    gap: 10px;
    align-items: end;
}

.passport-fields {
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
    padding-top: 20px;
}
:deep(.n-form-item-label) {
    padding-bottom: 4px;
}
:deep(.n-form-item-label__text) {
    color: #777;
    font-size: 10px;
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}
:deep(.n-input),
:deep(.n-input-number),
:deep(.n-base-selection),
:deep(.n-date-picker) {
    --n-border: #d8d8d4;
    --n-border-hover: #b8b8b3;
    --n-border-focus: #555;
    --n-box-shadow-focus: 0 0 0 2px rgba(40, 40, 40, 0.06);
    --n-color: #fff;
    --n-text-color: #292929;
    --n-placeholder-color: #999;
    --n-height: 36px;
    min-height: 36px;
    font-size: 12px;
    border-radius: 6px;
    transition:
        border-color 0.15s ease,
        box-shadow 0.15s ease;
}
:deep(.n-input) {
    background: #fff;
}
:deep(.n-input:focus-within) {
    box-shadow: 0 0 0 2px rgba(40, 40, 40, 0.055);
}
:deep(.n-input__input-el),
:deep(.n-input__textarea-el),
:deep(.n-input-number-input__input) {
    color: #292929;
    font-size: 12px;
}
:deep(input::placeholder) {
    color: #a3a39e;
}
:deep(.n-input__suffix),
:deep(.n-input__prefix),
:deep(.n-base-selection__arrow) {
    color: #888;
}
:deep(.n-input__clear),
:deep(.n-base-selection__clear) {
    color: #999;
}
:deep(.n-input__clear:hover),
:deep(.n-base-selection__clear:hover) {
    color: #333;
}
:deep(.n-base-selection) {
    width: 100%;
    background: #fff;
}
:deep(.n-base-selection-label) {
    background: #fff;
    border-radius: 6px;
}
:deep(.n-base-selection-input) {
    background: transparent;
}
:deep(.n-base-selection-input__content) {
    color: #292929;
    font-size: 12px;
}
:deep(.n-base-selection--active) {
    background: #fff;
    box-shadow: 0 0 0 2px rgba(40, 40, 40, 0.055);
}
:deep(.n-auto-complete) {
    width: 100%;
}
:deep(.n-auto-complete .n-input) {
    background: #fff;
}
:deep(.n-input-number) {
    width: 100%;
    background: #fff;
}
:deep(.n-input-number-input) {
    background: #fff;
}
:deep(.n-input-number__minus),
:deep(.n-input-number__plus) {
    color: #888;
}
:deep(.n-input-number__minus:hover),
:deep(.n-input-number__plus:hover) {
    color: #333;
    background: #f2f2ef;
}
.full-width {
    width: 100%;
}
:deep(.n-date-picker) {
    width: 100%;
    background: #fff;
}
:deep(.n-date-picker .n-input) {
    width: 100%;
    background: #fff;
}
:deep(.n-base-select-menu),
:deep(.n-auto-complete-menu) {
    overflow: hidden;
    background: #fff;
    border: 1px solid #deded9;
    border-radius: 7px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
:deep(.n-base-select-option) {
    min-height: 30px;
    padding: 0 8px;
    border-radius: 4px;
}

:deep(.n-base-select-option__label) {
    color: #333;
    font-size: 11px;
    line-height: 1.2;
}
:deep(.n-base-select-option:hover) {
    background: #f3f3f0;
}
:deep(.n-base-select-option.n-base-select-option--selected) {
    background: #ecece8;
    color: #111;
    font-weight: 500;
}
:deep(.n-date-panel) {
    background: #fff;
    border: 1px solid #deded9;
    border-radius: 7px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
.search-button {
    width: 96px;
    height: 36px;
    border: 1px solid #333;
    border-radius: 6px;
    background: #333;
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    box-shadow: none;
    transition:
        background 0.15s ease,
        border-color 0.15s ease;
}
.search-button:hover {
    background: #222;
    border-color: #222;
}
.search-button:active {
    background: #111;
}
.save-button {
    width: 36px;
    min-width: 36px;
    height: 36px;
    padding: 0;
    border: 1px solid #d6d6d1;
    border-radius: 6px;
    background: #fff;
    color: #555;
    font-size: 14px;
    box-shadow: none;
    transition:
        background 0.15s ease,
        color 0.15s ease,
        border-color 0.15s ease;
}
.save-button:hover {
    background: #f1f1ee;
    border-color: #c8c8c3;
    color: #222;
}
:deep(.n-form-item-feedback-wrapper) {
    font-size: 10px;
}
:deep(.n-form-item--error .n-input),
:deep(.n-form-item--error .n-base-selection),
:deep(.n-form-item--error .n-input-number) {
    --n-border: rgba(150, 45, 45, 0.45);
}
:deep(.n-form-item-feedback--error) {
    color: #9a4545;
}
@media (max-width: 1250px) {
    .passport-fields {
        grid-template-columns:
            repeat(3, minmax(130px, 1fr))
            36px;
    }
}
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
        width: 100%;
    }
    .passport-fields {
        grid-template-columns:
            repeat(2, minmax(130px, 1fr));
        gap: 8px;
        margin-top: 8px;
        padding-top: 8px;
    }
    .save-button {
        width: 100%;
    }
}
@media (max-width: 560px) {
    .passport-fields {
        grid-template-columns: 1fr;
    }
}
@media (prefers-reduced-motion: reduce) {
    .search-button,
    .save-button {
        transition: none;
    }
}
</style>
