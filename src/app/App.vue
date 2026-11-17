<script setup lang="ts">
import { provideAccess } from "@/composables/useAcces";
import { defineAsyncComponent, computed, onMounted } from "vue";
import { useGoogleSheets } from "@/composables/useGoogleSheets";
import AppErrorPanel from "@/components/common/AppErrorPanel.vue";
import AccessDialog from "@/components/common/AccessDialog.vue";
import { useAppTabs } from "@/composables/useAppTabs";
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

const InterchangeablePage = defineAsyncComponent(
    () => import("@/pages/Interchangeable/InterchangeablePage.vue")
);

const {
    authorizedDepartment,
    isAuthorized,
    authError,
    handleAuthorization,
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
} = useAppTabs();


provideAccess(
    computed(() => authorizedDepartment.value ?? "procurement"),
);


function handleLogin(credentials: {
    department: Department;
    password: string;
}) {
    if (!handleAuthorization(credentials)) return;

    void startApp();
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
                                v-if="tab.initialized && actualData && interchangeableData"
                                :actual-data="actualData"
                                :interchangeable-data="interchangeableData"
                                @update-title="title => updateTabTitle(tab.name, title)"
                            />
                        </div>
                    </div>
                    <UpButton />
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