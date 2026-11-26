
import { ref } from "vue";

import {
    loadUserData,
    saveGeneralComment,
    saveClientComment,
    setHiddenRow,
    saveTest,
    removeTest,
    subscribeToUserData,
    type UserDataSnapshot,
} from "@/services/supabase/userDataService";

type RealtimePayload = {
    table: string;
    eventType: "INSERT" | "UPDATE" | "DELETE";
    new: Record<string, unknown>;
    old: Record<string, unknown>;
};

const generalComments = ref<Record<string, string>>({});
const clientComments = ref<Record<string, string>>({});
const hiddenRows = ref<Set<string>>(new Set());
const tests = ref<Record<string, number>>({});

const isLoaded = ref(false);
const isLoading = ref(false);

let initializationPromise: Promise<void> | null = null;
let unsubscribe: (() => void) | null = null;

const pendingEvents: RealtimePayload[] = [];

function applyRealtimeEvent(payload: RealtimePayload): void {
    const row = payload.eventType === "DELETE"
        ? payload.old
        : payload.new;

    const isDelete = payload.eventType === "DELETE";

    if (payload.table === "general_comments") {
        const key = row.nomenclature_key;
        const comment = row.comment;

        if (typeof key !== "string") return;

        const next = { ...generalComments.value };

        if (isDelete) {
            delete next[key];
        } else if (typeof comment === "string") {
            next[key] = comment;
        }

        generalComments.value = next;
        return;
    }

    // Клиентские комментарии: клиент + исходная + найденная номенклатура.
    if (payload.table === "client_comments") {
        const contragentKey = row.contragent_key;
        const searchNomenclatureKey = row.search_nomenclature_key;
        const nomenclatureKey = row.nomenclature_key;
        const comment = row.comment;

        if (
            typeof contragentKey !== "string" ||
            typeof searchNomenclatureKey !== "string" ||
            typeof nomenclatureKey !== "string"
        ) {
            return;
        }

        const key = JSON.stringify([
            contragentKey,
            searchNomenclatureKey,
            nomenclatureKey,
        ]);

        const next = { ...clientComments.value };

        if (isDelete) {
            delete next[key];
        } else if (typeof comment === "string") {
            next[key] = comment;
        }

        clientComments.value = next;
        return;
    }

    // Скрытые строки и тесты: клиент + номенклатура.
    if (
        payload.table === "hidden_rows" ||
        payload.table === "row_tests"
    ) {
        const contragentKey = row.contragent_key;
        const nomenclatureKey = row.nomenclature_key;

        if (
            typeof contragentKey !== "string" ||
            typeof nomenclatureKey !== "string"
        ) {
            return;
        }

        const key = JSON.stringify([
            contragentKey,
            nomenclatureKey,
        ]);

        if (payload.table === "hidden_rows") {
            const next = new Set(hiddenRows.value);

            if (isDelete) {
                next.delete(key);
            } else {
                next.add(key);
            }

            hiddenRows.value = next;
            return;
        }

        if (payload.table === "row_tests") {
            const testedAt = row.tested_at;
            const next = { ...tests.value };

            if (isDelete) {
                delete next[key];
            } else if (
                typeof testedAt === "number" &&
                Number.isFinite(testedAt)
            ) {
                next[key] = testedAt;
            }

            tests.value = next;
        }
    }
}

function handleRealtimeEvent(payload: RealtimePayload): void {
    if (!isLoaded.value) {
        pendingEvents.push(payload);
        return;
    }

    applyRealtimeEvent(payload);
}

async function initialize(): Promise<void> {
    if (isLoaded.value) return;

    if (initializationPromise) {
        return initializationPromise;
    }

    initializationPromise = (async () => {
        isLoading.value = true;

        try {
            // Сначала подписываемся, чтобы не пропустить изменения
            // во время первоначальной загрузки.
            if (!unsubscribe) {
                unsubscribe = subscribeToUserData(
                    handleRealtimeEvent,
                );
            }

            const data: UserDataSnapshot = await loadUserData();

            generalComments.value = data.generalComments;
            clientComments.value = data.clientComments;
            hiddenRows.value = new Set(data.hiddenRows);
            tests.value = data.tests;

            isLoaded.value = true;

            // Применяем события, пришедшие во время загрузки.
            pendingEvents.splice(0).forEach(applyRealtimeEvent);

            console.info(
                "Supabase: данные загружены, Realtime подключён",
            );
        } catch (error) {
            pendingEvents.length = 0;

            unsubscribe?.();
            unsubscribe = null;

            throw error;
        } finally {
            isLoading.value = false;
            initializationPromise = null;
        }
    })();

    return initializationPromise;
}

async function updateGeneralComment(
    nomenclatureKey: string,
    comment: string,
): Promise<void> {
    await saveGeneralComment(nomenclatureKey, comment);

    const next = { ...generalComments.value };

    if (comment.trim()) {
        next[nomenclatureKey] = comment.trim();
    } else {
        delete next[nomenclatureKey];
    }

    generalComments.value = next;
}

async function updateClientComment(
    contragentKey: string,
    searchNomenclatureKey: string,
    nomenclatureKey: string,
    comment: string,
): Promise<void> {
    await saveClientComment(
        contragentKey,
        searchNomenclatureKey,
        nomenclatureKey,
        comment,
    );

    const key = JSON.stringify([
        contragentKey,
        searchNomenclatureKey,
        nomenclatureKey,
    ]);

    const next = { ...clientComments.value };

    if (comment.trim()) {
        next[key] = comment.trim();
    } else {
        delete next[key];
    }

    clientComments.value = next;
}

async function updateHiddenRow(
    contragentKey: string,
    nomenclatureKey: string,
    isHidden: boolean,
): Promise<void> {
    await setHiddenRow(
        contragentKey,
        nomenclatureKey,
        isHidden,
    );

    const key = JSON.stringify([
        contragentKey,
        nomenclatureKey,
    ]);

    const next = new Set(hiddenRows.value);

    if (isHidden) {
        next.add(key);
    } else {
        next.delete(key);
    }

    hiddenRows.value = next;
}

async function updateTest(
    contragentKey: string,
    nomenclatureKey: string,
    date: number,
): Promise<void> {
    await saveTest(
        contragentKey,
        nomenclatureKey,
        date,
    );

    const key = JSON.stringify([
        contragentKey,
        nomenclatureKey,
    ]);

    tests.value = {
        ...tests.value,
        [key]: date,
    };
}

async function deleteTest(
    contragentKey: string,
    nomenclatureKey: string,
): Promise<void> {
    await removeTest(
        contragentKey,
        nomenclatureKey,
    );

    const next = { ...tests.value };

    delete next[
        JSON.stringify([contragentKey, nomenclatureKey])
    ];

    tests.value = next;
}

export function useUserData() {
    return {
        generalComments,
        clientComments,
        hiddenRows,
        tests,
        isLoaded,
        isLoading,
        initialize,
        updateGeneralComment,
        updateClientComment,
        updateHiddenRow,
        updateTest,
        deleteTest,
    };
}
