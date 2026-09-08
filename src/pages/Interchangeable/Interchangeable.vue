<!-- <script setup lang="ts">
import type { IGoogleTableData } from "@/types/TableSheetData.types";
import { ref, computed } from "vue";
import { NAutoComplete } from "naive-ui";
import { dataToObjects } from "@/helpers/dataHandlers";


</script>

<template>
    <div class="main-wrapper">
        <div class="main-conteiner">
            <n-auto-complete
                v-model:value="selectedContragent"
                :input-props="{
                    autocomplete: 'disabled',
                }"
                :options="contragentOptions"
                :placeholder="constTitles?.CLIENT"
                clearable
                
            />
        </div>
    </div>
    <pre>
        {{constTitles}}
    </pre>
</template>

<style scoped lang="scss">
.main-wrapper {
    width: 100%;
}

.main-conteiner {
    width: 400px;
}

.results-count {
    margin-top: 6px;
    color: #888;
    font-size: 13px;
}
</style> -->
<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { IGoogleTableData } from "@/types/TableSheetData.types";
import { dataToObjects } from "@/helpers/dataHandlers";
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
const date = ref<number>(Date.now())
const znurType = ref("");
const quantity = ref<number | null>(null);
const dateOfDelivery = ref<number | null>(Date.now());

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
}>();


const actualObjsList = computed(() => {
    if (!props.actualData) {
        return null;
    }

    return dataToObjects(props.actualData);
});

const managerOptions = computed(() => {
    if (!props?.managersBranches) return [];
    return Object.keys(props.managersBranches).map(el => ({label: el, value: el}))
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

const contragentOptions = computed(() => {
    if (!props.contragents) {
        return [];
    }

    const query = selectedContragent.value.trim().toLowerCase();

    return Object.keys(props.contragents)
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


</script>

<template>
    <div class="search-wrapper">
        <n-form
            class="search-form"
            :show-feedback="false"
        >
            <n-form-item label="Номенклатура">
                <n-input
                    v-model:value="nomenclature"
                    placeholder="Введите номенклатуру"
                />
            </n-form-item>

            <n-form-item label="Контрагент">
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
                @click="() => ''"
            >
                Найти
            </n-button>
        </n-form>

        <n-form
            class="passport-fields"
            :show-feedback="false"
        >
            <n-form-item label="Менеджер">
                <n-select
                    v-model:value="manager"
                    :options="managerOptions"
                    placeholder="Менеджер"
                    clearable
                />
            </n-form-item>

            <n-form-item label="Филиал">
                <n-select
                    v-model:value="branch"
                    :options="branchOptions"
                    placeholder="Филиал"
                    clearable
                />
            </n-form-item>

            <n-form-item label="Дата">
                <n-date-picker
                    v-model:value="date"
                    type="date"
                    clearable
                    class="full-width"
                />
            </n-form-item>

            <n-form-item label="Тип ЗНУР">
                <n-input
                    v-model:value="znurType"
                    placeholder="Тип ЗНУР"
                />
            </n-form-item>

            <n-form-item label="Кол-во">
                <n-input-number
                    v-model:value="quantity"
                    :min="1"
                    placeholder="Количество"
                    class="full-width"
                />
            </n-form-item>

            <n-form-item label="Предполагаемая дата отгрузки">
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
