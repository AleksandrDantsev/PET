
import { reactive, ref } from "vue";

import { LocalStorage } from "@/utils/localStorage";
import type { IGoogleTableData } from "@/types/TableSheetData";

import {
    getConfigConst,
    getConfigManagersBranchList,
    getConfigContragentsList,
    getZnurTypes,
} from "@/helpers/configHandlers";

type Contragent = {
    branch: string;
    manager: string;
    holding?: string;
};

// НЕ ИЗМЕНЯТЬ НАЗВАНИЕ ПЕРЕМЕННЫХ!!!
const COMMENTS_STORAGE_KEY = "interchangeable-row-comments";
const ADDITIONAL_COMMENTS_STORAGE_KEY = "interchangeable-row-additional-comments";
const HIDDEN_ROWS_STORAGE_KEY = "interchangeable-hidden-rows";

const CONFIG_DATA_STORAGE_KEY = "configData";
const ACTUAL_DATA_STORAGE_KEY = "actualData";
const INTERCHANGEABLE_DATA_STORAGE_KEY = "interchangeableData";

const CONST_TITLES = reactive<Record<string, string>>({});
const MANAGERS_BRANCHES = reactive<Record<string, string>>({});
const CONTRAGENTS = reactive<Record<string, Contragent>>({});
const ZNUR_TYPES = reactive<Array<string | number | boolean>>([]);

const isConfigInitialized = ref(false);

function initializeConfig(data: IGoogleTableData): void {
    const titles = getConfigConst(data);
    const managers = getConfigManagersBranchList(data);
    const contragents = getConfigContragentsList(data);
    const znurTypes = getZnurTypes(data);

    // Проверяем обязательные разделы до изменения текущей конфигурации.
    if (
        !titles ||
        !Object.keys(titles).length ||
        !managers ||
        !Object.keys(managers).length ||
        !contragents ||
        !znurTypes ||
        !znurTypes.length
    ) {
        throw new Error(
            "Получена пустая или некорректная конфигурация Google Sheets",
        );
    }

    // Обновляем заголовки.
    Object.keys(CONST_TITLES).forEach(key => {
        delete CONST_TITLES[key];
    });
    Object.assign(CONST_TITLES, titles);

    // Обновляем менеджеров.
    Object.keys(MANAGERS_BRANCHES).forEach(key => {
        delete MANAGERS_BRANCHES[key];
    });
    Object.assign(MANAGERS_BRANCHES, managers);

    // Обновляем контрагентов только при наличии данных.
    if (Object.keys(contragents).length) {
        Object.keys(CONTRAGENTS).forEach(key => {
            delete CONTRAGENTS[key];
        });
        Object.assign(CONTRAGENTS, contragents);
    }

    // Обновляем типы ЗНУР.
    ZNUR_TYPES.splice(0, ZNUR_TYPES.length, ...znurTypes);

    isConfigInitialized.value = true;
}

// Восстанавливаем конфигурацию при наличии сохранённых данных.
const savedConfig = LocalStorage.get<IGoogleTableData>(
    CONFIG_DATA_STORAGE_KEY,
);

if (savedConfig) {
    try {
        initializeConfig(savedConfig);
    } catch (error) {
        console.error("Ошибка восстановления конфигурации:", error);
    }
}

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
    initializeConfig,
    isConfigInitialized,
};
