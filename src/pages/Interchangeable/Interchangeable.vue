<script setup lang="ts">
import { ref, computed } from "vue";
import type { IGoogleTableData } from "../../types/TableSheetData.ts";
import { dataToObjects } from "@/helpers/dataHandlers.ts";
import InterchangeableForm from "./InterchangeableForm.vue";
import InterchangeableResult from "./InterchangeableResult.vue";
import InterchangeableFilters from "./InterchangeableFilters.vue";
import { check } from "@/helpers/checkInterchangeablePositions.ts";
import { ih } from "@/helpers/interchangeableFilters.ts";

import {
    NButton,
    NDrawer,
    NDrawerContent,
} from "naive-ui";

type DataObject = Record<string, string | number | boolean | null>;

const props = defineProps<{
    actualData?: IGoogleTableData | null;
    interchangeableData: IGoogleTableData | null;
    constTitles?: Record<string, string> | null;
    contragents: Record<string, {
        branch: string;
        manager: string;
    }> | null;
    managersBranches: Record<string, string> | null;
}>();

const filtersOpen = ref(false);

const searchResultObjs = ref<DataObject[]>([]);
const filteredActualResultObjs = ref<DataObject[]>([]);
const clientsDemand = ref<DataObject>({});

const actualDataObjs = computed(() => {
    if (!props.actualData) {
        return [];
    }

    return dataToObjects(props.actualData);
});

const interchangeableDataObjs = computed(() => {
    if (!props.interchangeableData) {
        return [];
    }

    return dataToObjects(props.interchangeableData);
});

const search = (fields: Record<string, string>) => {
    if (
        !fields ||
        !actualDataObjs.value.length ||
        !interchangeableDataObjs.value.length
    ) {
        searchResultObjs.value = [];
        filteredActualResultObjs.value = [];
        clientsDemand.value = {};
        return;
    }

    const contragent =
        "Ахтемов Сулейман ИП (Аджимбетов Эмиль Рустемович ИП)" ||
        fields?.contragent;

    const descriptionProduct = ih.getDescriptionProduct(
        "21,0 гр. 1810 белая (2100) АТФ" || fields.nomenclature
    );

    const productTypeInput = descriptionProduct?.type;

    const clientDemand = interchangeableDataObjs.value.find(item => {
        return (
            check.checkType(
                String(item["Тип"]),
                productTypeInput
            ) &&
            check.checkStandart(
                String(item["Стандарт"]),
                descriptionProduct?.standart
            ) &&
            check.checkContragent(
                String(item["Клиент"]),
                contragent
            ) &&
            (
                productTypeInput === "преформа"
                    ? check.checkGrams(
                        {
                            from: String(item['Граммаж "от"'] ?? ""),
                            to: String(item['Граммаж "до"'] ?? ""),
                        },
                        descriptionProduct?.grams
                    )
                    : true
            ) &&
            check.checkIncludeColors(
                descriptionProduct?.color,
                [
                    String(item["Основной цвет"] ?? ""),
                    String(item["Взаимозаменяемые цвета"] ?? ""),
                    String(item["Возможные цвета"] ?? ""),
                ]
            )
        );
    });

    if (!clientDemand) {
        searchResultObjs.value = [];
        filteredActualResultObjs.value = [];
        clientsDemand.value = {};
        return;
    }

    clientsDemand.value = clientDemand;

    const result = actualDataObjs.value.filter(item => {
        const nomenclature = item["Номенклатура 1С"];

        if (!nomenclature) {
            return false;
        }

        const actualProductDescription =
            ih.getDescriptionProduct(String(nomenclature));

        if (!actualProductDescription) {
            return false;
        }

        return (
            check.checkType(
                actualProductDescription.type,
                String(clientDemand["Тип"])
            ) &&
            check.checkStandart(
                String(clientDemand["Стандарт"] ?? ""),
                actualProductDescription.standart
            ) &&
            (
                actualProductDescription.type === "преформа"
                    ? check.checkGrams(
                        {
                            from: String(
                                clientDemand['Граммаж "от"'] ?? ""
                            ),
                            to: String(
                                clientDemand['Граммаж "до"'] ?? ""
                            ),
                        },
                        actualProductDescription.grams
                    )
                    : true
            ) &&
            check.isNormalizedTextEqual(
                String(item["Филиал"] ?? ""),
                String(clientDemand["Филиал"] ?? "")
            ) &&
            check.checkIncludeColors(
                actualProductDescription.color,
                [
                    String(clientDemand["Основной цвет"] ?? ""),
                    String(clientDemand["Взаимозаменяемые цвета"] ?? ""),
                    String(clientDemand["Возможные цвета"] ?? ""),
                ]
            )
        );
    });

    searchResultObjs.value = result;
    filteredActualResultObjs.value = result;

    console.log(result);
};

const applyFilters = (result: DataObject[]) => {
    filteredActualResultObjs.value = Array.isArray(result)
        ? result
        : [];
};

const applySorting = (result: DataObject[]) => {
    filteredActualResultObjs.value = Array.isArray(result)
        ? result
        : [];
};

const resetFilters = () => {
    filteredActualResultObjs.value = [...searchResultObjs.value];
};
</script>

<template>
    <div class="search-wrapper">
        <InterchangeableForm
            :const-titles="constTitles"
            :contragents="contragents"
            :managers-branches="managersBranches"
            :search="search"
        />

        <div class="filters-button">
            <NButton
                type="primary"
                :disabled="filteredActualResultObjs.length === 0"
                @click="filtersOpen = true"
            >
                Фильтры
            </NButton>
        </div>

        <InterchangeableResult
            :clients-demand="clientsDemand"
            :filtered-actual-result-objs="filteredActualResultObjs"
        />

        <NDrawer
            v-model:show="filtersOpen"
            placement="right"
            :width="420"
        >
            <NDrawerContent
                title="Фильтры"
                closable
            >
                <InterchangeableFilters
                    :result="searchResultObjs"
                    :current-result="filteredActualResultObjs"
                    @filter="applyFilters"
                    @sort="applySorting"
                    @reset="resetFilters"
                />
            </NDrawerContent>
        </NDrawer>
    </div>
</template>

<style scoped lang="scss">
.search-wrapper {
    position: relative;
    border-radius: 7px;
}

.filters-button {
    display: flex;
    justify-content: flex-end;
    margin: 12px 14px;
}
</style>