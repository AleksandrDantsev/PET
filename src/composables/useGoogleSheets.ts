
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
    initializeConfig,
} from "@/configs/CONFIG_CONST";

const CHECK_INTERVAL = 120_000;

export const useGoogleSheets = () => {
    const actualData = ref<IGoogleTableData | null>(null);
    const interchangeableData = ref<IGoogleTableData | null>(null);

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let isChecking = false;
    let isStarted = false;

    const isLoading = ref(false);

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
                configDataFromApi,
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

            // Основные данные.
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

            // Конфигурация.
            const savedConfigData =
                LocalStorage.get<IGoogleTableData>(
                    CONFIG_DATA_STORAGE_KEY,
                );

            const configForApp =
                configDataFromApi ?? savedConfigData;

            if (configForApp) {
                try {
                    // Сначала проверяем и применяем конфигурацию.
                    initializeConfig(configForApp);

                    // Сохраняем только корректную конфигурацию из API.
                    if (
                        configDataFromApi &&
                        (
                            savedConfigData == null ||
                            hasDataChanged(
                                savedConfigData,
                                configDataFromApi,
                            )
                        )
                    ) {
                        LocalStorage.save(
                            CONFIG_DATA_STORAGE_KEY,
                            configDataFromApi,
                        );
                    }
                } catch (error) {
                    reportAppError(
                        "Ошибка обработки конфигурации Google Sheets",
                        error,
                    );
                }
            }

            // Данные взаимозаменяемого.
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
                    interchangeableData.value =
                        interchangeableDataFromApi;

                    LocalStorage.save(
                        INTERCHANGEABLE_DATA_STORAGE_KEY,
                        interchangeableDataFromApi,
                    );
                } else {
                    interchangeableData.value =
                        savedInterchangeableData;
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
            interchangeableData.value =
                savedInterchangeableData;
        }

        try {
            isLoading.value = true;

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
        } finally {
            isLoading.value = false;
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
        isLoading,
        loadGoogleSheets,
    };
};
