<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { normalizeForSorting } from "@/utils/normalize";
import type { IGoogleTableData } from "@/types/TableSheetData.types";
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
                />
            </n-form-item>

            <n-form-item
                label="Кол-во"
                path="quantity"
            >
                <n-input-number
                    v-model:value="quantity"
                    :min="1"
                    placeholder="Количество"
                    class="full-width"
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

<style scoped lang="scss">
.search-wrapper {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #fcfcfc;
    border-radius: 7px;
}

.search-form {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 10px;
    align-items: end;
    padding: 5px 15px;
}

.passport-fields {
    display: grid;
    grid-template-columns: repeat(6, 1fr) auto;
    gap: 10px;
    align-items: end;
    margin-top: 10px;
    padding: 0 15px 15px;
}

.search-button {
    width: 100px;
}

.save-button {
    width: 36px;
    min-width: 36px;
    height: 36px;
}

.full-width {
    width: 100%;
}
</style>
