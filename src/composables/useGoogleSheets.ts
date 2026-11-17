
import { ref, onUnmounted } from "vue";
import { api } from "@/api/api";
import type { IGoogleTableData } from "@/types/TableSheetData";
import { ID_LIST } from "@/configs/ID_LIST";
import { LocalStorage } from "@/utils/localStorage";
import { reportAppError } from "@/utils/appErrors";
import {
    CONFIG_DATA_STORAGE_KEY,
    ACTUAL_DATA_STORAGE_KEY,
    INTERCHANGEABLE_DATA_STORAGE_KEY,
} from "@/configs/CONFIG_CONST";

const CHECK_INTERVAL = 120_000;

export const useGoogleSheets = () => {
    const actualData = ref<IGoogleTableData | null>(null);
    const interchangeableData = ref<IGoogleTableData | null>(null);

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let isChecking = false;
    let isStarted = false;

    function hasDataChanged(
        previous: IGoogleTableData | null,
        current: IGoogleTableData,
    ): boolean {
        return JSON.stringify(previous) !== JSON.stringify(current);
    }

    async function loadGoogleSheets() {
        if (isChecking) return;

        isChecking = true;

        try {
            const [
                actualDataFromApi,
                configData,
                interchangeableDataFromApi,
            ] = await Promise.all([
                api.google
                    .getSheetValuesById(ID_LIST.actual)
                    .catch(error => {
                        reportAppError(
                            "Ошибка загрузки листа недопроданного",
                            error,
                        );
                        return null;
                    }),

                api.google
                    .getSheetValuesById(ID_LIST.config)
                    .catch(error => {
                        reportAppError(
                            "Ошибка загрузки листа конфигурации",
                            error,
                        );
                        return null;
                    }),

                api.google
                    .getSheetValuesById(ID_LIST.interchangeable)
                    .catch(error => {
                        reportAppError(
                            "Ошибка загрузки листа базы данных с потребностью клиента",
                            error,
                        );
                        return null;
                    }),
            ]);

            if (actualDataFromApi) {
                const savedActualData =
                    LocalStorage.get<IGoogleTableData>(
                        ACTUAL_DATA_STORAGE_KEY,
                    );

                if (
                    savedActualData == null ||
                    hasDataChanged(savedActualData, actualDataFromApi)
                ) {
                    actualData.value = actualDataFromApi;

                    LocalStorage.save(
                        ACTUAL_DATA_STORAGE_KEY,
                        actualDataFromApi,
                    );
                } else {
                    actualData.value = savedActualData;
                }
            }

            if (configData) {
                const savedConfigData =
                    LocalStorage.get<IGoogleTableData>(
                        CONFIG_DATA_STORAGE_KEY,
                    );

                if (
                    savedConfigData == null ||
                    hasDataChanged(savedConfigData, configData)
                ) {
                    LocalStorage.save(
                        CONFIG_DATA_STORAGE_KEY,
                        configData,
                    );
                }
            }

            if (interchangeableDataFromApi) {
                const savedInterchangeableData =
                    LocalStorage.get<IGoogleTableData>(
                        INTERCHANGEABLE_DATA_STORAGE_KEY,
                    );

                if (
                    savedInterchangeableData == null ||
                    hasDataChanged(
                        savedInterchangeableData,
                        interchangeableDataFromApi,
                    )
                ) {
                    interchangeableData.value = interchangeableDataFromApi;

                    LocalStorage.save(
                        INTERCHANGEABLE_DATA_STORAGE_KEY,
                        interchangeableDataFromApi,
                    );
                } else {
                    interchangeableData.value = savedInterchangeableData;
                }
            }
        } finally {
            isChecking = false;
        }
    }

    async function startApp() {
        if (isStarted) return;

        isStarted = true;

        window.scrollTo(0, 0);

        const savedActualData =
            LocalStorage.get<IGoogleTableData>(
                ACTUAL_DATA_STORAGE_KEY,
            );

        const savedInterchangeableData =
            LocalStorage.get<IGoogleTableData>(
                INTERCHANGEABLE_DATA_STORAGE_KEY,
            );

        if (savedActualData) {
            actualData.value = savedActualData;
        }

        if (savedInterchangeableData) {
            interchangeableData.value = savedInterchangeableData;
        }

        try {
            await loadGoogleSheets();

            intervalId = setInterval(() => {
                void loadGoogleSheets().catch(error => {
                    reportAppError(
                        "Ошибка автоматического обновления Google Sheets",
                        error,
                    );
                });

                console.log(
                    `Данные обновлены. Частота обновления: ${CHECK_INTERVAL / 60_000} мин.`,
                );
            }, CHECK_INTERVAL);
        } catch (error) {
            isStarted = false;
            throw error;
        }
    }

    function stopApp() {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }

        isStarted = false;
    }

    onUnmounted(stopApp);

    return {
        actualData,
        interchangeableData,
        startApp,
        stopApp,
        loadGoogleSheets,
    };
};
