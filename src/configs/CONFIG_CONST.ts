import { LocalStorage } from "@/utils/localStorage";
import type { IGoogleTableData } from "@/types/TableSheetData";
import { 
    getConfigConst,
    getConfigManagersBranchList,
    getConfigContragentsList,
    getZnurTypes,
} from "@/helpers/configHandlers";

function required<T>(value: T | null | undefined, name: string): T {
    if (value == null) {
        throw new Error(`Не удалось загрузить ${name}`);
    }

    return value;
}

const сonfigData = LocalStorage.get<IGoogleTableData>("configData");


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
    MANAGERS_BRANCHES,
    CONTRAGENTS,
    ZNUR_TYPES,
};