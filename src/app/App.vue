<script setup lang="ts">
import { api } from "@/api/api";
import { ref, onMounted, onUnmounted, defineAsyncComponent, watch } from "vue";
import type { IGoogleTableData } from "../types/TableSheetData";
import AppErrorPanel from "@/components/common/AppErrorPanel.vue";
import { ID_LIST } from "@/configs/ID_LIST";
import { LocalStorage } from "@/utils/localStorage";
import {
    NConfigProvider,
    NMessageProvider,
    NNotificationProvider,
    NGlobalStyle,
    NTabs,
    NTabPane,
    ruRU,
} from "naive-ui";
import { themeOverrides } from "@/theme/naiveTheme";
import UpButton from "@/components/common/UpButton.vue";
import { useAppReload } from "@/composables/useAppReload";
import { reportAppError } from "@/utils/appErrors";
import { cutOverflowedText } from "@/utils/normalize";
import { 
    CONFIG_DATA_STORAGE_KEY,
    ACTUAL_DATA_STORAGE_KEY,
    INTERCHANGEABLE_DATA_STORAGE_KEY 
} from "@/configs/CONFIG_CONST";

const InterchangeablePage = defineAsyncComponent(
    () => import("@/pages/Interchangeable/InterchangeablePage.vue")
);

const ACTUAL_DATA = ref<IGoogleTableData | null>(null);
const INTERCHANGEABLE_DATA = ref<IGoogleTableData | null>(null);

const CHECK_INTERVAL = 120_000;

let intervalId: ReturnType<typeof setInterval> | null = null;
let isChecking = false;

function hasDataChanged(
    previous: IGoogleTableData | null,
    current: IGoogleTableData,
): boolean {
    return JSON.stringify(previous) !== JSON.stringify(current);
}

const FIRST_TAB_NAME = "interchangeable-1";
const activeTab = ref(FIRST_TAB_NAME);


const tabs = ref([
    {
        name: "interchangeable-1",
        label: "Вкладка 1",
        initialized: true,
    },
]);

async function loadGoogleSheets() {
    if (isChecking) return;

    isChecking = true;

    try {
        const [
            actualData,
            configData,
            interchangeableData,
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

        if (actualData) {
            const changed = hasDataChanged(
                ACTUAL_DATA.value,
                actualData,
            );

            if (changed) {
                ACTUAL_DATA.value = actualData;
                LocalStorage.save(ACTUAL_DATA_STORAGE_KEY, actualData);
            }
        }

        if (configData) {
            const savedConfigData =
                LocalStorage.get<IGoogleTableData>(CONFIG_DATA_STORAGE_KEY);

            if (hasDataChanged(savedConfigData, configData)) {
                LocalStorage.save(CONFIG_DATA_STORAGE_KEY, configData);
            }
        }

        if (interchangeableData) {
            const changed = hasDataChanged(
                INTERCHANGEABLE_DATA.value,
                interchangeableData,
            );

            if (changed) {
                INTERCHANGEABLE_DATA.value = interchangeableData;

                LocalStorage.save(
                    INTERCHANGEABLE_DATA_STORAGE_KEY,
                    interchangeableData,
                );
            }
        }
    } finally {
        isChecking = false;
    }
}

onMounted(async () => {
    window.scrollTo(0, 0);

    const savedActualData =
        LocalStorage.get<IGoogleTableData>(ACTUAL_DATA_STORAGE_KEY);

    const savedInterchangeableData =
        LocalStorage.get<IGoogleTableData>(INTERCHANGEABLE_DATA_STORAGE_KEY);

    if (savedActualData) {
        ACTUAL_DATA.value = savedActualData;
    }

    if (savedInterchangeableData) {
        INTERCHANGEABLE_DATA.value = savedInterchangeableData;
    }

    await loadGoogleSheets();

    intervalId = setInterval(() => {
        console.log("Ура")
        void loadGoogleSheets().catch(error => {
            reportAppError(
                "Ошибка автоматического обновления Google Sheets",
                error,
            );
        });
    }, CHECK_INTERVAL);
});

function addTab() {
    let tabCounter = 1;

    while (tabs.value.some(tab => tab.name === `interchangeable-${tabCounter}`)) {
        tabCounter++;
    }

    const name = `interchangeable-${tabCounter}`;

    tabs.value.push({
        name,
        label: `Вкладка ${tabCounter}`,
        initialized: false,
    });

    activeTab.value = name;
}

function closeTab(name: string | number) {
    if (tabs.value.length <= 1) return;

    const tabName = String(name);
    const index = tabs.value.findIndex(tab => tab.name === tabName);

    if (index === -1) return;

    const wasActive = activeTab.value === tabName;

    tabs.value.splice(index, 1);

    if (wasActive) {
        activeTab.value = tabs.value[Math.max(0, index - 1)].name;
    }
}

function updateTabTitle(name: string, title: string) {
    const tab = tabs.value.find(tab => tab.name === name);

    if (tab) {
        tab.label = String(cutOverflowedText(title, 25));
    }
}

watch(activeTab, name => {
    const tab = tabs.value.find(item => item.name === name);

    if (tab) {
        tab.initialized = true;
    }
});

onUnmounted(() => {
    if (intervalId !== null) {
        clearInterval(intervalId);
    }
});

useAppReload();
</script>

<template>
    <n-config-provider
        :theme-overrides="themeOverrides"
        :locale="ruRU"
    >
        <n-notification-provider placement="bottom-right">
            <n-message-provider>
                <n-global-style />
                <AppErrorPanel />
                <div class="tabs-header">
                    <NTabs
                        v-model:value="activeTab"
                        type="card"
                        addable
                        :animated="false"
                        @add="addTab"
                        @close="closeTab"
                    >
                        <NTabPane
                            v-for="tab in tabs"
                            :key="tab.name"
                            :name="tab.name"
                            :tab="tab.label"
                            :closable="tabs.length > 1"
                            display-directive="show"
                        >
                            <span hidden>{{ tab.label }}</span>
                        </NTabPane>
                    </NTabs>
                </div>
                <div class="tab-content">
                    <div
                        v-for="tab in tabs"
                        v-show="activeTab === tab.name"
                        :key="tab.name"
                    >
                        <InterchangeablePage
                            v-if="tab.initialized && ACTUAL_DATA && INTERCHANGEABLE_DATA"
                            :actual-data="ACTUAL_DATA"
                            :interchangeable-data="INTERCHANGEABLE_DATA"
                            @update-title="title => updateTabTitle(tab.name, title)"
                        />
                    </div>
                </div>
                <UpButton />
            </n-message-provider>
        </n-notification-provider>
    </n-config-provider>
</template>

<style lang="scss">
* {
    font-family:  Inter,
    "Segoe UI",
    "Roboto",
    Helvetica,
    Arial,
    sans-serif;
}
body {
    font-variant-numeric: tabular-nums;
    scrollbar-gutter: stable;
}

$minWidthTooltip: 500px;

.n-tooltip {
    max-width: min($minWidthTooltip, calc(100vw - 24px)) !important;
    box-sizing: border-box;
    font-size: 12px !important;
    white-space: pre-line !important;
    overflow-wrap: anywhere !important;
    word-break: break-word;
    line-height: 1.4;
}

.tabs-header {
  position: sticky;
  top: 0;
  z-index: 9999;
  background: #fff;
}

.n-popconfirm .n-popconfirm__content {
    font-size: 11px;
}

.n-popconfirm .n-popconfirm__action {
    margin-top: 6px;
    gap: 4px;
}

.n-popconfirm .n-button {
    height: 22px;
    min-height: 22px;
    padding: 0 7px;
    font-size: 12px;
}

.n-tabs.n-tabs--card-type .n-tabs-tab {
    font-size: 11.5px !important;
    color: #a3a3a3 !important;
}

.n-tabs.n-tabs--card-type {
    user-select: none;
    .n-tabs-nav {
        padding: 6px 4px 0 4px;
        background: #ffffff;
        border-radius: 6px 6px 0 0;
    }

    .n-tabs-tab {
        min-height: 30px;
        padding: 4px 15px;
        border: 1px solid transparent;
        border-radius: 7px 7px 0 0;
        background: transparent;
        transition:
            background-color 0.15s ease,
            color 0.15s ease,
            border-color 0.15s ease;

        &:hover {
            color: #222831 !important;
            background: #e8eaed;
        }

        &.n-tabs-tab--active {
            background: #fff;
            border-color: #dfe3e8;
            border-bottom-color: #fff;
            color: #18a058 !important;
            font-weight: 500;
        }
    }

    .n-tabs-tab__close {
        width: 16px;
        height: 16px;
        margin-left: 7px;
        border-radius: 4px;
        color: #858b95;
        transition:
            color 0.15s ease,
            background-color 0.15s ease;

        &:hover {
            color: #c0392b;
            background: #fdecea;
        }
    }

    .tab-content {
        width: 100%;
    }

    .n-tabs-nav__add {
        width: 28px;
        height: 28px;
        margin: 0 0 2px 2px;
        border: 1px solid #dfe3e8;
        border-radius: 5px;
        background: #fff;
        color: #60656f;
        transition:
            background-color 0.15s ease,
            border-color 0.15s ease,
            color 0.15s ease;

        &:hover {
            background: #e8f3e6;
            border-color: #b7d7b0;
            color: #27830d;
        }
    }

    .n-tabs-pane-wrapper {
        padding-top: 8px;
    }
}
.n-tabs.n-tabs--top .n-tab-pane {
    padding: 0 10px;
}
::selection {
    background-color: #27830d70;
    color: white;
}
</style>