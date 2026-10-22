import { LocalStorage } from "@/utils/localStorage";
import type { IGoogleTableData } from "@/types/TableSheetData";
import { 
    getConfigConst,
    getConfigManagersBranchList,
    getConfigContragentsList,
    getZnurTypes,
} from "@/helpers/configHandlers";

function required<T>(
    value: T | null | undefined, name: string
): T {
    if (value == null) {
        throw new Error(`Не удалось загрузить ${name}`);
    }
    return value;
}

const COMMENTS_STORAGE_KEY = "interchangeable-row-comments";
const ADDITIONAL_COMMENTS_STORAGE_KEY = "interchangeable-row-additional-comments";
const HIDDEN_ROWS_STORAGE_KEY = "interchangeable-hidden-rows";
const CONFIG_DATA_STORAGE_KEY = "configData";
const ACTUAL_DATA_STORAGE_KEY = "actualData";
const INTERCHANGEABLE_DATA_STORAGE_KEY = "interchangeableData";


const сonfigData = LocalStorage.get<IGoogleTableData>(CONFIG_DATA_STORAGE_KEY);

const CONST_TITLES = required(
    getConfigConst(сonfigData), "CONST_TITLES"
)
const MANAGERS_BRANCHES = required(
    getConfigManagersBranchList(сonfigData), "MANAGERS_BRANCHES"
)
const CONTRAGENTS = required(
    getConfigContragentsList(сonfigData), "CONTRAGENTS"
)
const ZNUR_TYPES = required(
    getZnurTypes(сonfigData), "ZNUR_TYPES"
)

export {
    CONST_TITLES,
    CONFIG_DATA_STORAGE_KEY,
    ACTUAL_DATA_STORAGE_KEY,
    INTERCHANGEABLE_DATA_STORAGE_KEY,
    MANAGERS_BRANCHES,
    CONTRAGENTS,
    ZNUR_TYPES,
    COMMENTS_STORAGE_KEY,
    ADDITIONAL_COMMENTS_STORAGE_KEY,
    HIDDEN_ROWS_STORAGE_KEY,
};