
<script setup lang="ts">
import {
    computed,
    defineAsyncComponent,
    h,
    onMounted,
    ref,
} from "vue";

import { useRouter } from "vue-router";

import ClientDemandsPage from "../ClientDemandsPage/ClientDemandsPage.vue";

import { useGoogleSheets } from "@/composables/useGoogleSheets";
import { useTabsDrag } from "@/composables/useTabsDrag";
import { useAppTabs } from "@/composables/useAppTabs";
import { useAppAuthorization } from "@/composables/useAppAuthorization";
import { useSupabaseAuth } from "@/composables/useSupabaseAuth.ts";
import AppErrorPanel from "@/components/common/AppErrorPanel.vue";
import AppLoader from "@/components/common/AppLoader.vue";
import AppSidebar, {
    type NavigationItem,
} from "@/components/common/AppSidebar.vue";
import UpButton from "@/components/common/UpButton.vue";

import {
    NTabs,
    NTabPane,
} from "naive-ui";

import BoxLinkedIcon from "@/components/icons/BoxLinkedIcon.vue";
import ClientListIcon from "@/components/icons/ClientListIcon.vue";

import { isConfigInitialized } from "@/configs/CONFIG_CONST";

const router = useRouter();
const { signOut } = useSupabaseAuth();

const {
    authorizedDepartment,
    logout,
} = useAppAuthorization();

const InterchangeablePage = defineAsyncComponent({
    loader: () =>
        import("@/pages/Interchangeable/InterchangeablePage.vue"),
});

const tabsHeaderRef = ref<HTMLElement | null>(null);

const {
    actualData,
    interchangeableData,
    startApp,
    isLoading,
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

const sidebarExpanded = ref(false);
const activeSidebarItem = ref("overview");


const isAppDataReady = computed(() => {
    return !isLoading.value && isConfigInitialized;
});

const isInitialPageReady = ref(false);

const showLoader = computed(() => {
    return (
        !isAppDataReady.value ||
        (
            activeSidebarItem.value === "overview" &&
            !isInitialPageReady.value
        )
    );
});
const navigationItems: NavigationItem[] = [
    {
        label: "Взаимозаменяемое",
        key: "overview",
        icon: BoxLinkedIcon,
    },
    {
        label: "Потребности клиентов",
        key: "client-demands",
        icon: ClientListIcon,
    },
];

function handleNavigation(key: string) {
    activeSidebarItem.value = key;
}

function handlePageReady() {
    isInitialPageReady.value = true;
}
function handleSettings() {
    // Заглушка настроек.
}

async function handleDatabaseLogout() {
    const success = await signOut();

    if (!success) return;

    await router.replace({ name: "database-login" });
}

function handleLogout() {
    logout();
    void router.replace({ name: "access" });
}

onMounted(() => {
    void startApp();
});
</script>

<template>
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
            @database-logout="handleDatabaseLogout"
            @navigate="handleNavigation"
            @settings="handleSettings"
            @logout="handleLogout"
        />

        <main class="app-main">
            <div
                v-if="isAppDataReady"
                class="app-content"
                :class="{
                    'app-content--visible': !showLoader,
                }"
            >
                <div
                    v-show="activeSidebarItem !== 'client-demands'"
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
                            :tab="
                                () =>
                                    h(
                                        'span',
                                        {
                                            title: [
                                                tab.fullName,
                                                tab.contragent,
                                            ]
                                                .filter(Boolean)
                                                .join(' / '),
                                        },
                                        tab.label,
                                    )
                            "
                            :closable="tabs.length > 1"
                            display-directive="show"
                        >
                            <span hidden>
                                {{ tab.label }}
                            </span>
                        </NTabPane>
                    </NTabs>
                </div>

                <div
                    v-show="activeSidebarItem === 'client-demands'"
                    class="client-demands-content"
                >
                    <ClientDemandsPage
                        :interchangeable-data="interchangeableData"
                    />
                </div>

                <div
                    v-show="activeSidebarItem !== 'client-demands'"
                    class="tab-content"
                >
                    <div
                        v-for="tab in tabs"
                        v-show="activeTab === tab.name"
                        :key="tab.name"
                    >
                        <Transition name="table-fade">
                            <InterchangeablePage
                                v-if="
                                    tab.initialized &&
                                        actualData &&
                                        interchangeableData
                                "
                                :actual-data="actualData"
                                :interchangeable-data="interchangeableData"
                                @ready="handlePageReady"
                                @update-title="
                                    (title, contragent) =>
                                        updateTabTitle(
                                            tab.name,
                                            title,
                                            contragent,
                                        )
                                "
                            />
                        </Transition>
                    </div>
                </div>
            </div>

            <!-- Загрузчик располагается поверх контента. -->
            <Transition name="loader-fade">
                <div
                    v-if="showLoader"
                    class="app-loader-overlay"
                >
                    <AppLoader />
                </div>
            </Transition>
        </main>

        <UpButton />
    </div>
</template>

<style lang="scss">
.app-main {
    position: relative;
    margin-left: 55px;
    min-width: 0;
    min-height: 100vh;
}

.app-content {
    min-width: 0;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.app-content--visible {
    opacity: 1;
}

.app-loader-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;

    display: flex;
    align-items: center;
    justify-content: center;

    padding-left: 55px;
    box-sizing: border-box;

    background: #fff;
}

.loader-fade-enter-active,
.loader-fade-leave-active {
    transition: opacity 0.25s ease;
}

.loader-fade-enter-from,
.loader-fade-leave-to {
    opacity: 0;
}

.loader-fade-enter-to,
.loader-fade-leave-from {
    opacity: 1;
}

.table-fade-enter-active {
    transition: opacity 0.7s ease;
}

.table-fade-enter-from {
    opacity: 0;
}

.table-fade-enter-to {
    opacity: 1;
}

.tabs-header {
    position: sticky;
    top: 0;
    z-index: 9999;
    background: #fff;

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

.n-tabs.n-tabs--card-type {
    user-select: none;

    .n-tabs-tab {
        font-size: 11.5px !important;
        color: #a3a3a3 !important;
    }

    .n-tabs-nav {
        padding: 6px 4px 0;
        background: #fff;
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

.tab-content {
    width: 100%;
}
</style>
