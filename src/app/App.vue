<script setup lang="ts">
import { provideAccess } from "@/composables/useAcces";
import { defineAsyncComponent, computed, onMounted, ref, h } from "vue";
import { useGoogleSheets } from "@/composables/useGoogleSheets";
import AppErrorPanel from "@/components/common/AppErrorPanel.vue";
import AccessDialog from "@/components/common/AccessDialog.vue";
import AppLoader from "@/components/common/AppLoader.vue";
import { useTabsDrag } from "@/composables/useTabsDrag";
import { useAppTabs } from "@/composables/useAppTabs";
import AppSidebar, {
    type NavigationItem,
} from "@/components/common/AppSidebar.vue";
import type { Department } from "@/configs/permissions";
import { useAppAuthorization } from "@/composables/useAppAuthorization";
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

const InterchangeablePage = defineAsyncComponent({
    loader: () => import("@/pages/Interchangeable/InterchangeablePage.vue"),
    loadingComponent: AppLoader,
    delay: 0,
});

const tabsHeaderRef = ref<HTMLElement | null>(null);

const {
    authorizedDepartment,
    isAuthorized,
    authError,
    handleAuthorization,
    logout,
} = useAppAuthorization();

const {
    actualData,
    interchangeableData,
    startApp,
} = useGoogleSheets();

const {
    tabs,
    activeTab,
    addTab,
    closeTab,
    updateTabTitle,
    reorderTabs,
} = useAppTabs();


useTabsDrag(
    tabsHeaderRef,
    computed(() => tabs.value.length),
    reorderTabs,
);


provideAccess(
    computed(() => authorizedDepartment.value ?? "procurement"),
);

const sidebarExpanded = ref(false);
const activeSidebarItem = ref("overview");

const navigationItems: NavigationItem[] = [
    {
        label: "Обзор",
        key: "overview",
        icon: "home",
    },
    {
        label: "Рабочие данные",
        key: "workspace",
        icon: "table",
    },
    {
        label: "Отчётность",
        key: "reports",
        icon: "chart",
    },
    {
        label: "Документы",
        key: "documents",
        icon: "file",
    },
];


function handleLogin(credentials: {
    department: Department;
    pinCode: string;
}) {
    if (!handleAuthorization(credentials)) return;

    void startApp();
}

// Sidebar actions
function handleNavigation(key: string) {
    activeSidebarItem.value = key;
}

function handleSettings() {
    // Заглушка настроек.
}

function handleLogout() {
    logout();
}


onMounted(() => {
    if (isAuthorized.value) {
        void startApp();
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
            <n-message-provider
                to="body"
                :container-style="{
                    zIndex: 99999999
                }"
            >
                <n-global-style />

                <AccessDialog
                    v-if="!isAuthorized"
                    :error="authError"
                    @submit="handleLogin"
                />

                <template v-else>
                    <AppErrorPanel />

                    <div class="app-layout">
                        <AppSidebar
                            v-model="sidebarExpanded"
                            :active-key="activeSidebarItem"
                            :items="navigationItems"
                            :department="
                                authorizedDepartment === 'sales'
                                    ? 'Отдел продаж'
                                    : 'Отдел закупок'
                            "
                            user-label="Пользователь"
                            user-role="Сотрудник системы"
                            @navigate="handleNavigation"
                            @settings="handleSettings"
                            @logout="handleLogout"
                        />

                        <main class="app-main">
                            <div 
                                ref="tabsHeaderRef"
                                class="tabs-header"
                            >
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
                                        :tab="() => h('span', {
                                            title: [tab.fullName, tab.contragent]
                                                .filter(Boolean)
                                                .join(' / ')
                                        }, tab.label)"
                                        :closable="tabs.length > 1"
                                        display-directive="show"
                                    >
                                        <span hidden>
                                            {{ tab.label }}
                                        </span>
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
                                        v-if="
                                            tab.initialized &&
                                                actualData &&
                                                interchangeableData
                                        "
                                        :actual-data="actualData"
                                        :interchangeable-data="
                                            interchangeableData
                                        "
                                        @update-title="
                                            (title, contragent) =>
                                                updateTabTitle(
                                                    tab.name,
                                                    title,
                                                    contragent
                                                )
                                        "
                                    />
                                </div>
                            </div>
                        </main>

                        <UpButton />
                    </div>
                </template>
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

.app-main {
    margin-left: 55px;
    border-left: solid 1px #e6e6e6bb;
}

.tabs-header {
  position: sticky;
  top: 0;
  z-index: 9999;
  background: #fff;
}

.tabs-header {
    .tabs-ghost {
        opacity: 0.3 !important;
        background: #e8f3e6 !important;
        outline: 1px dashed #27830d !important;
        outline-offset: -1px;
    }

    .tabs-chosen {
        cursor: grabbing !important;
        background: #fff !important;
        border-radius: 7px !important;
        box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.12),
            0 1px 3px rgba(0, 0, 0, 0.06) !important;
    }

    .tabs-drag {
        opacity: 1 !important;
        transform: none !important;
    }
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
        min-height: 35px;
        padding: 4px 15px;
        border: 1px solid transparent;
        border-radius: 7px 7px 0 0;
        margin-left: -5px;
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
        border: 1px solid #b7d7b0;
        border-radius: 5px;
        background: #e8f3e6;
        color: #27830d;
        transition:
            background-color 0.15s ease,
            border-color 0.15s ease,
            color 0.15s ease;

        &:hover {
            background: #27830d;
            border-color: #27830d;
            color: #fff;
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