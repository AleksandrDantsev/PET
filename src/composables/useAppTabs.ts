
import { ref, watch } from "vue";
import { cutOverflowedText } from "@/utils/normalize";

export interface AppTab {
    name: string;
    label: string;
    initialized: boolean;
    fullName?: string;
    contragent?: string | null;
}

const FIRST_TAB_NAME = "interchangeable-1";

export const useAppTabs = () => {
    const activeTab = ref(FIRST_TAB_NAME);

    const tabs = ref<AppTab[]>([
        {
            name: FIRST_TAB_NAME,
            label: "Вкладка 1",
            initialized: true,
        },
    ]);

    function addTab() {
        let tabCounter = 1;

        while (
            tabs.value.some(
                tab => tab.name === `interchangeable-${tabCounter}`,
            )
        ) {
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

    function updateTabTitle(
        name: string,
        title: string,
        contragent?: string | null,
    ) {
        const tab = tabs.value.find(tab => tab.name === name);

        if (!tab) return;

        tab.fullName = title;
        tab.contragent = contragent;

        tab.label =
            cutOverflowedText(String(title), 16) +
            (contragent
                ? ` / ${cutOverflowedText(String(contragent), 13)}`
                : "");
    }

    function reorderTabs(orderedNames: string[]) {
        const tabsMap = new Map(
            tabs.value.map(tab => [tab.name, tab]),
        );

        const reorderedTabs = orderedNames
            .map(name => tabsMap.get(name))
            .filter((tab): tab is AppTab => Boolean(tab));

        if (reorderedTabs.length !== tabs.value.length) {
            console.warn("[useAppTabs] Не удалось восстановить порядок вкладок");
            return;
        }

        tabs.value = reorderedTabs;
    }

    watch(activeTab, name => {
        const tab = tabs.value.find(item => item.name === name);

        if (tab) {
            tab.initialized = true;
        }
    });

    return {
        tabs,
        activeTab,
        addTab,
        closeTab,
        updateTabTitle,
        reorderTabs,
    };
};
