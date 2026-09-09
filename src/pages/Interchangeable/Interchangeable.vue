<script setup lang="ts">
import { ref, computed } from "vue";
import type { IGoogleTableData } from "@/types/TableSheetData.types";
import { dataToObjects } from "@/helpers/dataHandlers.ts";
import InterchangeableForm from "./InterchangeableForm.vue";
import InterchangeableResult from "./InterchangeableResult.vue";
import { check } from "@/helpers/checkInterchangeablePositions.ts";
import { ih } from "@/helpers/interchangeableFilters.ts";

type DataObject = Record<string, string | number | boolean | null>;


const props = defineProps<{
    actualData?: IGoogleTableData | null;
    interchangeableData: IGoogleTableData | null,
    constTitles?: Record<string, string> | null;
    contragents: Record<string, {
        branch: string;
        manager: string;
    }> | null;
    managersBranches: Record<string, string> | null;
}>();

const filteredActualResultObjs = ref<DataObject[]>([]);
const inputFieldsValues = ref<{[key: string]: string} | null>(null);

const actualDataObjs = computed(() => {
    if (!props?.actualData) {
        return [];
    }
    return dataToObjects(props.actualData);
});

const interchangeableDataObjs = computed(() => {
    if (!props?.interchangeableData) {
        return [];
    }
    return dataToObjects(props.interchangeableData);
});

const search = (fields: Record<string, string>) => {
    if (
        !fields ||
        !actualDataObjs.value?.length ||
        !interchangeableDataObjs.value?.length
    ) {
        filteredActualResultObjs.value = [];
        return;
    };
    

    const contragent = "Ахтемов Сулейман ИП (Аджимамбетов Эмиль Рустемович ИП)" || fields?.contragent; // TODO
    const desriptionProduct = ih.getDescriptionProduct("21,0 гр. 1810 белая (2100) АТФ" || fields.nomenclature);
    const productTypeInput = desriptionProduct?.type;
    
    const clientDemand = interchangeableDataObjs.value.find(item => {
        return (
            check.checkType(
                String(item["Тип"]),
                productTypeInput
            ) &&
            check.checkStandart(
                String(item["Стандарт"]), 
                desriptionProduct?.standart
            ) &&
            check.checkContragent(
                String(item["Клиент"]), 
                contragent
            ) && ((
                productTypeInput === "преформа"
                    ? check.checkGrams(
                        {
                            from: String(
                                item['Граммаж "от"'] ?? ""
                            ),
                            to: String(
                                item['Граммаж "до"'] ?? ""
                            ),
                        },
                        desriptionProduct?.grams
                    ) : true) 
            &&
            check.checkIncludeColors(
                desriptionProduct?.color,
                [
                    String(item["Основной цвет"] ?? ""),
                    String(item["Взаимозаменяемые цвета"]),
                    String(item["Возможные цвета"]),
                ]
            ))
        )
    })
    
    if (!clientDemand) {
        return null;
    }

    const result = actualDataObjs.value.filter((item) => {
        const nomenclature = item["Номенклатура 1С"];

        if (!nomenclature) {
            return false;
        }

        const actualProductDescription = ih.getDescriptionProduct(
            String(nomenclature)
        );

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
    })

    filteredActualResultObjs.value = result;

    console.log(result)

    // actualDataObjs.value.filter()
    // console.log(desriptionProduct)
    // console.log(fields)
    // console.log(interchangeableDataObjs.value)
}

//    Ахтемов Сулейман ИП (Аджимамбетов Эмиль Рустемович ИП)
//    21,0 гр. 1810 белая (2100) АТФ

</script>

<template>
    <div class="search-wrapper">
        <InterchangeableForm 
            :const-titles="constTitles"
            :contragents="contragents"
            :managers-branches="managersBranches"
            :search="search"
        />
        <InterchangeableResult />
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

</style>
