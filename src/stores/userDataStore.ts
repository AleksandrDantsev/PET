
import { ref } from "vue";

import {
    loadUserData,
    saveGeneralComment,
    saveClientComment,
    setHiddenRow,
    createTest as createTestRequest,
    updateTest as updateTestRequest,
    removeTest as removeTestRequest,
    subscribeToUserData,
    makeClientRowKey,
    type TestRecord,
    type TestUpdate,
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
const tests = ref<Record<string, TestRecord[]>>({});

const isLoaded = ref(false);
const isLoading = ref(false);

let initializationPromise: Promise<void> | null = null;
let unsubscribe: (() => void) | null = null;

const pendingEvents: RealtimePayload[] = [];

function removeTestFromState(id: string): void {
    const next = { ...tests.value };

    for (const [key, records] of Object.entries(next)) {
        const filtered = records.filter(test => test.id !== id);

        if (filtered.length !== records.length) {
            if (filtered.length) {
                next[key] = filtered;
            } else {
                delete next[key];
            }
        }
    }

    tests.value = next;
}

function upsertTestInState(
    key: string,
    record: TestRecord,
): void {
    const next = { ...tests.value };
    const records = next[key] ?? [];

    next[key] = [
        ...records.filter(test => test.id !== record.id),
        record,
    ];

    tests.value = next;
}

function applyRealtimeTestEvent(
    payload: RealtimePayload,
): void {
    if (payload.eventType === "DELETE") {
        const id = payload.old.id;

        if (typeof id === "string") {
            removeTestFromState(id);
        }

        return;
    }

    const row = payload.new;

    if (
        typeof row.id !== "string" ||
        typeof row.contragent_key !== "string" ||
        typeof row.nomenclature_key !== "string" ||
        typeof row.tested_at !== "number" ||
        !Number.isFinite(row.tested_at) ||
        typeof row.comment !== "string" ||
        typeof row.is_suitable !== "boolean"
    ) {
        return;
    }

    const record: TestRecord = {
        id: row.id,
        testedAt: row.tested_at,
        comment: row.comment,
        isSuitable: row.is_suitable,
    };

    removeTestFromState(record.id);

    const key = makeClientRowKey(
        row.contragent_key,
        row.nomenclature_key,
    );

    upsertTestInState(key, record);
}

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

    if (payload.table === "hidden_rows") {
        const contragentKey = row.contragent_key;
        const nomenclatureKey = row.nomenclature_key;

        if (
            typeof contragentKey !== "string" ||
            typeof nomenclatureKey !== "string"
        ) {
            return;
        }

        const key = makeClientRowKey(
            contragentKey,
            nomenclatureKey,
        );

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
        applyRealtimeTestEvent(payload);
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

    const key = makeClientRowKey(
        contragentKey,
        nomenclatureKey,
    );

    const next = new Set(hiddenRows.value);

    if (isHidden) {
        next.add(key);
    } else {
        next.delete(key);
    }

    hiddenRows.value = next;
}

async function addTest(
    contragentKey: string,
    nomenclatureKey: string,
    testedAt: number,
    comment: string,
    isSuitable: boolean,
): Promise<TestRecord> {
    const record = await createTestRequest(
        contragentKey,
        nomenclatureKey,
        testedAt,
        comment,
        isSuitable,
    );

    const key = makeClientRowKey(
        contragentKey,
        nomenclatureKey,
    );

    upsertTestInState(key, record);

    return record;
}

async function updateTest(
    id: string,
    updates: TestUpdate,
): Promise<void> {
    const matchingKey = Object.keys(tests.value).find(key =>
        tests.value[key]?.some(test => test.id === id),
    );

    const record = await updateTestRequest(id, updates);

    if (matchingKey) {
        upsertTestInState(matchingKey, record);
    }
}

async function deleteTest(id: string): Promise<void> {
    await removeTestRequest(id);

    removeTestFromState(id);
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
        addTest,
        updateTest,
        deleteTest,
    };
}
