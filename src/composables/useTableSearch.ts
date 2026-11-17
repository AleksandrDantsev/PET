
import { computed, ref } from "vue";
import type { DataObject, SearchFormValue } from "@/types/TableSheetData";
import { CONST_TITLES } from "@/configs/CONFIG_CONST";
import { normalize } from "@/utils/normalize";
import { debounce } from "@/utils/debounce";
import { check } from "@/helpers/checkInterchangeablePositions";
import { ih } from "@/helpers/interchangeableFilters";

export type SortingPriorityField =
    | ""
    | "sameManagerSameClient"
    | "sameManagerAnotherClient"
    | "anotherManagerAnotherClient";

const searchableFields = [
    CONST_TITLES.ONE_C_NOMENCLATURE,
    CONST_TITLES.RESPONSIBLE_MANAGER,
    CONST_TITLES.BRANCH,
    CONST_TITLES.CURRENT_CLIENT,
    CONST_TITLES.UNDERSOLDED_COST,
    CONST_TITLES.HARDNESS,
    CONST_TITLES.REMAINDER_BOXES_1C,
    CONST_TITLES.NUMBER_TASK_BITRIX,
    CONST_TITLES.DATE_NEXT_ACTION,
];

export const useTableSearch = (
    getTableData: () => DataObject[],
    getClientsDemand: () => DataObject | null,
    getSearchedFields: () => SearchFormValue | null,
    getSearchQuery: () => string,
) => {
    const debouncedSearchQuery = ref(getSearchQuery());
    const sortingByPriorityField = ref<SortingPriorityField>("");

    const updateSearchQuery = debounce((value: string) => {
        debouncedSearchQuery.value = value;
    }, 500);

    const isClientAndNomenclatureMatch = (row: DataObject): boolean => {
        const searchedNomenclature = normalize(
            String(getSearchedFields()?.nomenclature ?? ""),
        );

        const searchedContragent = normalize(
            String(getSearchedFields()?.contragentNames?.contragent ?? ""),
        );

        const searchedHolding = normalize(
            String(getSearchedFields()?.contragentNames?.holding ?? ""),
        );

        if (!searchedNomenclature || (!searchedContragent && !searchedHolding)) {
            return false;
        }

        const rowClient = normalize(
            String(row[CONST_TITLES.CURRENT_CLIENT] ?? ""),
        );

        return (
            normalize(String(row[CONST_TITLES.ONE_C_NOMENCLATURE] ?? "")) ===
                searchedNomenclature &&
            ((searchedContragent !== "" && rowClient === searchedContragent) ||
                (searchedHolding !== "" && rowClient === searchedHolding))
        );
    };

    const isNomenclatureMatch = (row: DataObject): boolean => {
        const searchedNomenclature = normalize(
            String(getSearchedFields()?.nomenclature ?? ""),
        );

        if (!searchedNomenclature) {
            return false;
        }

        return (
            normalize(row[CONST_TITLES.ONE_C_NOMENCLATURE]) ===
            searchedNomenclature
        );
    };

    const getColorMatchPriority = (row: DataObject): number => {
        const searchedNomenclature = String(
            getSearchedFields()?.nomenclature ?? "",
        );

        if (!searchedNomenclature.trim()) {
            return 0;
        }

        const searchedColors = ih.getColor(searchedNomenclature);

        if (!searchedColors.length) {
            return 0;
        }

        const rowNomenclature = String(
            row[CONST_TITLES.ONE_C_NOMENCLATURE] ?? "",
        );

        const rowColors = ih.getColor(rowNomenclature);

        if (!rowColors.length) {
            return 0;
        }

        const hasExactColorMatch = searchedColors.some(
            color => rowColors.includes(color),
        );

        if (hasExactColorMatch) {
            return 2;
        }

        const hasCompatibleColorMatch = check.checkIncludeColors(
            searchedColors,
            [rowNomenclature],
        );

        return hasCompatibleColorMatch ? 1 : 0;
    };

    const searchedData = computed(() => {
        const query = normalize(debouncedSearchQuery.value);

        if (!query) {
            return getTableData();
        }

        return getTableData().filter(row =>
            searchableFields.some(key =>
                normalize(row[key]).includes(query),
            ),
        );
    });

    const displayedData = computed(() => {
        const data = searchedData.value;
        const demand = getClientsDemand();
        const mode = sortingByPriorityField.value;

        let filteredData = data;

        if (demand && mode) {
            const demandManager = normalize(
                demand[CONST_TITLES.MANAGER],
            );

            const demandClient = normalize(
                demand[CONST_TITLES.CONTRAGENT],
            );

            filteredData = data.filter(row => {
                const rowManager = normalize(
                    row[CONST_TITLES.RESPONSIBLE_MANAGER],
                );

                const rowClient = normalize(
                    row[CONST_TITLES.CURRENT_CLIENT],
                );

                const sameManager = Boolean(demandManager && rowManager)
                    && demandManager === rowManager;

                const sameClient = Boolean(demandClient && rowClient)
                    && demandClient === rowClient;

                switch (mode) {
                case "sameManagerSameClient":
                    return sameManager && sameClient;

                case "sameManagerAnotherClient":
                    return sameManager && !sameClient;

                case "anotherManagerAnotherClient":
                    return !sameManager && !sameClient;

                default:
                    return true;
                }
            });
        }

        return [...filteredData].sort((a, b) => {
            const getPriority = (row: DataObject): number => {
                if (isClientAndNomenclatureMatch(row)) return 5;
                if (isNomenclatureMatch(row)) return 4;

                const colorPriority = getColorMatchPriority(row);

                if (colorPriority === 2) return 3;
                if (colorPriority === 1) return 2;

                return 0;
            };

            return getPriority(b) - getPriority(a);
        });
    });

    return {
        debouncedSearchQuery,
        sortingByPriorityField,
        updateSearchQuery,
        searchedData,
        displayedData,
        isClientAndNomenclatureMatch,
        isNomenclatureMatch,
    };
};
