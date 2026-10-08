<script setup lang="ts">
import { ref, computed, watch, reactive } from "vue";
import { normalizeForSorting } from "@/utils/normalize";
import { MANAGERS_BRANCHES, CONTRAGENTS } from "@/configs/CONFIG_CONST";
// import type { IGoogleTableData } from "../../types/TableSheetData";
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
    // actualData?: IGoogleTableData | null;
    search: (value: Record<string, string>) => void;
}>();

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

const formRef = ref<FormInst | null>(null);
const passportFormRef = ref<FormInst | null>(null);

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
        if (!newManager || !MANAGERS_BRANCHES) {
            formValue.branch = null;
            return;
        }
        const managerBranch = MANAGERS_BRANCHES[newManager];

        if (!managerBranch) {
            formValue.branch = null;
            return;
        }

        const normalizedBranch = managerBranch.toUpperCase().trim();

        const hasMultipleBranches = [
            "КРЫМ", 
            "КРАСНОДАР",
        ].every(branch => normalizedBranch.includes(branch));

        formValue.branch = hasMultipleBranches ? null : managerBranch;
    }
);

const managerOptions = computed(() =>
    Object.keys(MANAGERS_BRANCHES ?? {}).map(manager => ({
        label: manager,
        value: manager,
    }))
);

const contragentsForSorting = computed(() => {
    if (!CONTRAGENTS) {
        return [];
    }

    return Object.keys(CONTRAGENTS)
        .sort((a, b) => normalizeForSorting(a).localeCompare(
            normalizeForSorting(b),
            undefined,
            { sensitivity: "base" }
        ));
});

const contragentOptions = computed(() => {
    if (!CONTRAGENTS) {
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

const returnInputValues = async () => {
    try {
        await formRef.value?.validate();
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
    } catch (err){
        console.error(err);
    }
};
</script>
<template>
    <div class="search-wrapper">
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
                class="nomenclature-field"
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
                class="contragent-field"
            >
                <n-auto-complete
                    v-model:value="formValue.contragent"
                    :options="contragentOptions"
                    placeholder="Введите контрагента"
                    clearable
                    :input-props="{ autocomplete: 'off' }"
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
        <n-form
            ref="passportFormRef"
            class="passport-fields"
            :model="formValue"
            :rules="passportRules"
            :show-feedback="false"
        >
            <div class="passport-grid">
                <n-form-item
                    label="Менеджер"
                    path="manager"
                    class="manager-field"
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
                    class="branch-field"
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
                    class="date-field"
                >
                    <n-date-picker
                        v-model:value="formValue.date"
                        type="date"
                        clearable
                    />
                </n-form-item>

                <n-form-item
                    label="Тип ЗНУР"
                    path="znurType"
                    class="znurType-field"
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
                    class="quantity-field"
                >
                    <n-input-number
                        v-model:value="formValue.quantity"
                        :min="1"
                        placeholder="Кол-во"
                        clearable
                    />
                </n-form-item>

                <n-form-item
                    label="Дата отгрузки"
                    path="dateOfDelivery"
                    class="dateOfDelivery-field"
                >
                    <n-date-picker
                        v-model:value="formValue.dateOfDelivery"
                        type="date"
                        clearable
                    />
                </n-form-item>
            </div>

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
$color-bg: #f8f8f6;
$color-surface: #fff;
$color-border: #d9d9d5;
$color-border-hover: #b8b8b3;
$color-text: #292929;
$color-text-secondary: #737373;
$color-placeholder: #999;
$color-muted: #858580;

$radius: 6px;
$control-height: 36px;
$gap: 10px;
$transition: 0.15s ease;

.search-wrapper {
    position: sticky;
    top: 0;
    z-index: 10;
    padding: 12px 14px 0;
    background: $color-bg;
    border-radius: 8px 8px 0 0;
}

.passport-wrapper {
    padding: 0 14px 12px;
    background: $color-bg;
    border-radius: 0 0 8px 8px;
}

.search-form {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 96px;
    gap: $gap;
    align-items: end;
    width: 100%;
    padding-bottom: 20px;
}

.passport-fields {
    display: flex;
    align-items: flex-end;
    gap: $gap;
    width: 100%;
}

.passport-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: $gap;
    flex: 1;
    min-width: 0;
}

:deep(.n-form-item) {
    width: 100%;
    min-width: 0;
    margin: 0;
}

:deep(.n-form-item-label) {
    padding-bottom: 4px;
}

:deep(.n-form-item-label__text) {
    color: $color-text-secondary;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

:deep(.n-input),
:deep(.n-input-number),
:deep(.n-base-selection),
:deep(.n-date-picker),
:deep(.n-auto-complete) {
    width: 100%;
    min-width: 0;
}

:deep(.n-input),
:deep(.n-input-number),
:deep(.n-base-selection),
:deep(.n-date-picker .n-input) {
    --n-border: #{$color-border};
    --n-border-hover: #{$color-border-hover};
    --n-border-focus: #555;
    --n-box-shadow-focus: 0 0 0 2px rgb(40 40 40 / 6%);
    --n-color: #{$color-surface};
    --n-text-color: #{$color-text};
    --n-placeholder-color: #{$color-placeholder};
    --n-height: #{$control-height};

    min-height: $control-height;
    border-radius: $radius;
    background: $color-surface;
    font-size: 12px;
    transition:
        border-color $transition,
        box-shadow $transition;
}

:deep(.n-input__input-el),
:deep(.n-input-number-input__input),
:deep(.n-base-selection-input__content) {
    min-width: 0;
    color: $color-text;
    font-size: 12px;
}

:deep(input::placeholder) {
    color: $color-placeholder;
}

:deep(.n-input__suffix),
:deep(.n-input__prefix),
:deep(.n-base-selection__arrow) {
    color: $color-muted;
}

:deep(.n-input__clear),
:deep(.n-base-selection__clear) {
    color: $color-placeholder;

    &:hover {
        color: $color-text;
    }
}

:deep(.n-input-number-input) {
    min-width: 0;
}

:deep(.n-input-number__minus),
:deep(.n-input-number__plus) {
    color: $color-muted;

    &:hover {
        background: #f1f1ee;
        color: $color-text;
    }
}

:deep(.n-base-selection-label) {
    min-width: 0;
    background: $color-surface;
    border-radius: $radius;
}

:deep(.n-base-selection-input) {
    min-width: 0;
    background: transparent;
}

:deep(.n-base-selection-input__content) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

:deep(.n-base-select-menu),
:deep(.n-auto-complete-menu),
:deep(.n-date-panel) {
    overflow: hidden;
    border: 1px solid #deded9;
    border-radius: 7px;
    background: $color-surface;
    box-shadow: 0 8px 24px rgb(0 0 0 / 8%);
}

:deep(.n-base-select-option) {
    min-height: 30px;
    padding: 0 8px;
    border-radius: 4px;
}

:deep(.n-base-select-option__label) {
    overflow: hidden;
    color: $color-text;
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

:deep(.n-base-select-option:hover) {
    background: #f3f3f0;
}

:deep(.n-base-select-option.n-base-select-option--selected) {
    background: #ecece8;
    color: #111;
    font-weight: 500;
}

.search-button {
    width: 96px;
    height: $control-height;
    padding: 0;
    border: 1px solid #333;
    border-radius: $radius;
    background: #333;
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    box-shadow: none;
    transition:
        background $transition,
        border-color $transition;

    &:hover {
        border-color: #222;
        background: #222;
    }

    &:active {
        border-color: #111;
        background: #111;
    }
}

.save-button {
    flex: 0 0 $control-height;
    width: $control-height;
    min-width: $control-height;
    height: $control-height;
    padding: 0;
    border: 1px solid $color-border;
    border-radius: $radius;
    background: $color-surface;
    color: #555;
    font-size: 14px;
    box-shadow: none;
    transition:
        background $transition,
        border-color $transition,
        color $transition;

    &:hover {
        border-color: $color-border-hover;
        background: #f1f1ee;
        color: $color-text;
    }

    &:active {
        background: #e9e9e6;
    }
}

:deep(.n-form-item-feedback-wrapper) {
    min-height: 0;
    font-size: 10px;
}

:deep(.n-form-item--error) {
    .n-input,
    .n-base-selection,
    .n-input-number {
        --n-border: rgb(150 45 45 / 45%);
    }
}

:deep(.n-form-item-feedback--error) {
    color: #9a4545;
}

@media (max-width: 1200px) {
    .passport-grid {
        grid-template-columns: repeat(5, minmax(0, 1fr));
    }
}

@media (max-width: 1000px) {
    .passport-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}

@media (max-width: 800px) {
    .search-wrapper {
        padding: 10px 12px 0;
    }

    .passport-wrapper {
        padding: 0 12px 10px;
    }

    .search-form {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }

    .search-button {
        width: 100%;
        grid-column: 1 / -1;
    }

    .passport-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
    }

    .passport-fields {
        gap: 8px;
    }
}

@media (max-width: 600px) {
    .search-form {
        grid-template-columns: 1fr;
    }

    .search-button {
        grid-column: auto;
    }

    .passport-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 420px) {
    .passport-grid {
        grid-template-columns: 1fr;
    }

    .passport-fields {
        align-items: stretch;
    }

    .save-button {
        align-self: end;
    }
}

@media (prefers-reduced-motion: reduce) {
    .search-button,
    .save-button,
    :deep(.n-input),
    :deep(.n-input-number),
    :deep(.n-base-selection),
    :deep(.n-date-picker) {
        transition: none;
    }
}
</style>