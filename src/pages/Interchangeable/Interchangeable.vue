<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from "vue";
import type { DataObject, IGoogleTableData } from "../../types/TableSheetData.ts";
import { dataToObjects } from "@/helpers/dataHandlers.ts";
import InterchangeableForm from "./InterchangeableForm.vue";
import InterchangeableResult from "./InterchangeableResult.vue";
import { CONST_TITLES } from "@/configs/CONFIG_CONST.ts";
const InterchangeableFilters = defineAsyncComponent({
    loader: () => import("./InterchangeableFilters.vue"),
    delay: 200,
    timeout: 10000,
});
import { check } from "@/helpers/checkInterchangeablePositions.ts";
import { ih } from "@/helpers/interchangeableFilters.ts";

import {
    NButton,
    NDrawer,
    NDrawerContent,
    NEmpty,
    NImage,
} from "naive-ui";

const props = defineProps<{
    actualData?: IGoogleTableData | null;
    interchangeableData: IGoogleTableData | null;
}>();

const filtersOpen = ref(false);

const searchResultObjs = ref<DataObject[]>([]);
const filteredActualResultObjs = ref<DataObject[]>([]);
const clientsDemand = ref<DataObject>({});
const isSearched = ref<boolean>(false);

onMounted(() => {
    if (props.actualData) {
        searchResultObjs.value = dataToObjects(props.actualData);
        filteredActualResultObjs.value = dataToObjects(props.actualData);
    }
});

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
    isSearched.value = true;

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

    // const contragent =
    //     "Ахтемов Сулейман ИП (Аджимбетов Эмиль Рустемович ИП)" ||
    //     fields?.contragent;

    // const descriptionProduct = ih.getDescriptionProduct(
    //     "21,0 гр. 1810 белая (2100) АТФ" || fields.nomenclature
    // );

    const contragent = fields.contragent;
    const descriptionProduct = ih.getDescriptionProduct(fields.nomenclature);

    const productTypeInput = descriptionProduct?.type;

    const clientDemand = interchangeableDataObjs.value.find(item => {
        return (
            check.checkType(
                String(item[CONST_TITLES.TYPE_OF_PRODUCT]),
                productTypeInput
            ) &&
            check.checkStandart(
                String(item[CONST_TITLES.STANDARD]),
                descriptionProduct?.standart
            ) &&
            check.checkContragent(
                String(item[CONST_TITLES.CONTRAGENT]),
                contragent
            ) &&
            (
                productTypeInput === "преформа"
                    ? check.checkGrams(
                        {
                            from: String(item[CONST_TITLES.WEIGHT_FROM] ?? ""),
                            to: String(item[CONST_TITLES.WEIGHT_TO] ?? ""),
                        },
                        descriptionProduct?.grams
                    )
                    : true
            ) &&
            check.checkIncludeColors(
                descriptionProduct?.color,
                [
                    String(item[CONST_TITLES.PRIMARY_COLOR] ?? ""),
                    String(item[CONST_TITLES.INTERCHANGEABLE_COLORS] ?? ""),
                    String(item[CONST_TITLES.POSSIBLE_COLORS] ?? ""),
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
        const nomenclature = item[CONST_TITLES.ONE_C_NOMENCLATURE];

        if (!nomenclature) {
            return false;
        }

        const actualProductDescription = ih.getDescriptionProduct(String(nomenclature));
  
        if (!actualProductDescription) {
            return false;
        }
        return (
            check.checkType(
                actualProductDescription.type,
                String(clientDemand[CONST_TITLES.TYPE_OF_PRODUCT])
            ) &&
            check.checkStandart(
                String(clientDemand[CONST_TITLES.STANDARD] ?? ""),
                actualProductDescription.standart
            ) &&
            (
                actualProductDescription.type === "преформа"
                    ? check.checkGrams(
                        {
                            from: String(
                                clientDemand[CONST_TITLES.WEIGHT_FROM] ?? ""
                            ),
                            to: String(
                                clientDemand[CONST_TITLES.WEIGHT_TO] ?? ""
                            ),
                        },
                        actualProductDescription.grams
                    )
                    : true
            ) &&
            check.isNormalizedTextEqual(
                String(item[CONST_TITLES.BRANCH] ?? ""),
                String(clientDemand[CONST_TITLES.BRANCH_DELIVERY] ?? "")
            ) &&
            check.checkIncludeColors(
                actualProductDescription.color,
                [
                    String(clientDemand[CONST_TITLES.PRIMARY_COLOR] ?? ""),
                    String(clientDemand[CONST_TITLES.INTERCHANGEABLE_COLORS] ?? ""),
                    String(clientDemand[CONST_TITLES.POSSIBLE_COLORS] ?? ""),
                ]
            )
        );
    });

    searchResultObjs.value = result;
    filteredActualResultObjs.value = result;
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
            v-if="filteredActualResultObjs.length"
            
            :clients-demand="clientsDemand"
            :filtered-actual-result-objs="filteredActualResultObjs"
        />
        <NEmpty
            v-else
            :description="
                isSearched
                    ? 'Ничего не найдено'
                    : 'Попробуйте найти что-нибудь'
            "
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