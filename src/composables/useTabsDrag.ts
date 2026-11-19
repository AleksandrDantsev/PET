
import {
    nextTick,
    onBeforeUnmount,
    onMounted,
    watch,
    type Ref,
} from "vue";
import Sortable from "sortablejs";

export function useTabsDrag(
    container: Ref<HTMLElement | null>,
    tabsCount: Ref<number>,
    onReorder: (orderedNames: string[]) => void,
) {
    let sortable: Sortable | null = null;

    function destroy() {
        sortable?.destroy();
        sortable = null;
    }

    async function init() {
        await nextTick();

        destroy();

        const root = container.value;
        if (!root) return;

        const nav = root.querySelector<HTMLElement>(
            ".n-tabs-nav-scroll-content",
        );

        if (!nav) {
            console.error("[useTabsDrag] Контейнер вкладок не найден");
            return;
        }

        const tabs = Array.from(
            nav.querySelectorAll<HTMLElement>(".n-tabs-tab"),
        );

        if (!tabs.length) return;

        const firstTabWrapper = tabs[0].parentElement;
        const tabsContainer = firstTabWrapper?.parentElement;

        if (!firstTabWrapper || !tabsContainer) return;

        const draggableSelector = `.${Array.from(
            firstTabWrapper.classList,
        ).join(".")}`;

        const getWrappers = () =>
            Array.from(
                tabsContainer.querySelectorAll<HTMLElement>(
                    `:scope > ${draggableSelector}`,
                ),
            );

        const draggableCount = getWrappers().length;

        if (draggableCount !== tabsCount.value) {
            console.warn(
                `[useTabsDrag] Ожидалось ${tabsCount.value} вкладок, найдено ${draggableCount}`,
            );
        }

        sortable = Sortable.create(tabsContainer, {
            animation: 200,
            draggable: draggableSelector,

            filter: ".n-tabs-tab__close",
            preventOnFilter: false,

            ghostClass: "tabs-ghost",
            chosenClass: "tabs-chosen",
            dragClass: "tabs-drag",

            onEnd() {
                const orderedNames = getWrappers()
                    .map(wrapper => {
                        const tab = wrapper.querySelector<HTMLElement>(
                            ".n-tabs-tab",
                        );

                        return tab?.getAttribute("data-name") ?? null;
                    })
                    .filter(
                        (name): name is string => name !== null,
                    );

                if (orderedNames.length !== tabsCount.value) {
                    console.warn(
                        "[useTabsDrag] Количество имён не совпадает",
                        {
                            expected: tabsCount.value,
                            actual: orderedNames.length,
                            orderedNames,
                        },
                    );
                    return;
                }

                onReorder(orderedNames);
            },
        });
    }

    watch(
        tabsCount,
        () => void init(),
        { flush: "post" },
    );

    onMounted(() => void init());

    onBeforeUnmount(destroy);

    return {
        refresh: init,
    };
}
