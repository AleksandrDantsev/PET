<script setup lang="ts">
import {
    computed,
    defineAsyncComponent,
    h,
    onMounted,
    ref,
} from "vue";

import { useGoogleSheets } from "@/composables/useGoogleSheets";
import { useTabsDrag } from "@/composables/useTabsDrag";
import { useAppTabs } from "@/composables/useAppTabs";

import AppErrorPanel from "@/components/common/AppErrorPanel.vue";
import AppLoader from "@/components/common/AppLoader.vue";
import AppSidebar, {
    type NavigationItem,
} from "@/components/common/AppSidebar.vue";
import UpButton from "@/components/common/UpButton.vue";

import type { Department } from "@/configs/permissions";

import {
    NTabs,
    NTabPane,
} from "naive-ui";

const props = defineProps<{
    department: Department;
}>();

const emit = defineEmits<{
    logout: [];
}>();

const InterchangeablePage = defineAsyncComponent({
    loader: () =>
        import("@/pages/Interchangeable/InterchangeablePage.vue"),
    loadingComponent: AppLoader,
    delay: 0,
});

const tabsHeaderRef = ref<HTMLElement | null>(null);

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

function handleNavigation(key: string) {
    activeSidebarItem.value = key;
}

function handleSettings() {
    // Заглушка настроек.
}

function handleLogout() {
    emit("logout");
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
                props.department === 'sales'
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
                        :interchangeable-data="interchangeableData"
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