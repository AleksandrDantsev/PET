
import { supabase } from "@/services/supabase/client";

export type UserDataSnapshot = {
    generalComments: Record<string, string>;
    clientComments: Record<string, string>;
    hiddenRows: string[];
    tests: Record<string, number>;
};

type GeneralCommentRow = {
    nomenclature_key: string;
    comment: string;
};

type ClientCommentRow = {
    contragent_key: string;
    search_nomenclature_key: string;
    nomenclature_key: string;
    comment: string;
};

type HiddenRow = {
    contragent_key: string;
    nomenclature_key: string;
};

type TestRow = {
    contragent_key: string;
    nomenclature_key: string;
    tested_at: number;
};



// Ключ для скрытых позиций и дат тестирования.
export const makeClientRowKey = (
    contragentKey: string,
    nomenclatureKey: string,
): string => JSON.stringify([
    contragentKey,
    nomenclatureKey,
]);

// Ключ для клиентских комментариев.
export const makeClientCommentRowKey = (
    contragentKey: string,
    searchNomenclatureKey: string,
    nomenclatureKey: string,
): string => JSON.stringify([
    contragentKey,
    searchNomenclatureKey,
    nomenclatureKey,
]);


export async function loadUserData(): Promise<UserDataSnapshot> {
    const [
        generalResult,
        clientResult,
        hiddenResult,
        testsResult,
    ] = await Promise.all([
        supabase
            .from("general_comments")
            .select("nomenclature_key, comment"),

        supabase
            .from("client_comments")
            .select(
                "contragent_key, search_nomenclature_key, nomenclature_key, comment",
            ),

        supabase
            .from("hidden_rows")
            .select("contragent_key, nomenclature_key"),

        supabase
            .from("row_tests")
            .select("contragent_key, nomenclature_key, tested_at"),
    ]);

    if (generalResult.error) throw generalResult.error;
    if (clientResult.error) throw clientResult.error;
    if (hiddenResult.error) throw hiddenResult.error;
    if (testsResult.error) throw testsResult.error;

    const generalComments: Record<string, string> = {};
    const clientComments: Record<string, string> = {};
    const hiddenRows: string[] = [];
    const tests: Record<string, number> = {};

    (generalResult.data as GeneralCommentRow[]).forEach(row => {
        generalComments[row.nomenclature_key] = row.comment;
    });

    (clientResult.data as ClientCommentRow[]).forEach(row => {
        const key = makeClientCommentRowKey(
            row.contragent_key,
            row.search_nomenclature_key,
            row.nomenclature_key,
        );

        clientComments[key] = row.comment;
    });

    (hiddenResult.data as HiddenRow[]).forEach(row => {
        hiddenRows.push(
            makeClientRowKey(
                row.contragent_key,
                row.nomenclature_key,
            ),
        );
    });

    (testsResult.data as TestRow[]).forEach(row => {
        const key = makeClientRowKey(
            row.contragent_key,
            row.nomenclature_key,
        );

        tests[key] = row.tested_at;
    });

    return {
        generalComments,
        clientComments,
        hiddenRows,
        tests,
    };
}


export async function saveGeneralComment(
    nomenclatureKey: string,
    comment: string,
): Promise<void> {
    const value = comment.trim();
    const query = supabase.from("general_comments");

    const { error } = value
        ? await query.upsert(
            {
                nomenclature_key: nomenclatureKey,
                comment: value,
            },
            { onConflict: "nomenclature_key" },
        )
        : await query
            .delete()
            .eq("nomenclature_key", nomenclatureKey);

    if (error) throw error;
}


export async function saveClientComment(
    contragentKey: string,
    searchNomenclatureKey: string,
    nomenclatureKey: string,
    comment: string,
): Promise<void> {
    const value = comment.trim();
    const query = supabase.from("client_comments");

    const { error } = value
        ? await query.upsert(
            {
                contragent_key: contragentKey,
                search_nomenclature_key: searchNomenclatureKey,
                nomenclature_key: nomenclatureKey,
                comment: value,
            },
            {
                onConflict:
                    "contragent_key,search_nomenclature_key,nomenclature_key",
            },
        )
        : await query
            .delete()
            .eq("contragent_key", contragentKey)
            .eq("search_nomenclature_key", searchNomenclatureKey)
            .eq("nomenclature_key", nomenclatureKey);

    if (error) throw error;
}


export async function setHiddenRow(
    contragentKey: string,
    nomenclatureKey: string,
    isHidden: boolean,
): Promise<void> {
    const query = supabase.from("hidden_rows");

    const { error } = isHidden
        ? await query.upsert(
            {
                contragent_key: contragentKey,
                nomenclature_key: nomenclatureKey,
            },
            {
                onConflict: "contragent_key,nomenclature_key",
                ignoreDuplicates: true,
            },
        )
        : await query
            .delete()
            .eq("contragent_key", contragentKey)
            .eq("nomenclature_key", nomenclatureKey);

    if (error) throw error;
}


export async function saveTest(
    contragentKey: string,
    nomenclatureKey: string,
    date: number,
): Promise<void> {
    const { error } = await supabase
        .from("row_tests")
        .upsert(
            {
                contragent_key: contragentKey,
                nomenclature_key: nomenclatureKey,
                tested_at: date,
            },
            {
                onConflict: "contragent_key,nomenclature_key",
            },
        );

    if (error) throw error;
}

export async function removeTest(
    contragentKey: string,
    nomenclatureKey: string,
): Promise<void> {
    const { error } = await supabase
        .from("row_tests")
        .delete()
        .eq("contragent_key", contragentKey)
        .eq("nomenclature_key", nomenclatureKey);

    if (error) throw error;
}

export function subscribeToUserData(
    onChange: (payload: {
        table: string;
        eventType: "INSERT" | "UPDATE" | "DELETE";
        new: Record<string, unknown>;
        old: Record<string, unknown>;
    }) => void,
) {
    const channel = supabase
        .channel("user-data-changes")

        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "general_comments",
            },
            payload => {
                onChange({
                    table: "general_comments",
                    eventType: payload.eventType,
                    new: payload.new as Record<string, unknown>,
                    old: payload.old as Record<string, unknown>,
                });
            },
        )

        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "client_comments",
            },
            payload => {
                onChange({
                    table: "client_comments",
                    eventType: payload.eventType,
                    new: payload.new as Record<string, unknown>,
                    old: payload.old as Record<string, unknown>,
                });
            },
        )

        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "hidden_rows",
            },
            payload => {
                onChange({
                    table: "hidden_rows",
                    eventType: payload.eventType,
                    new: payload.new as Record<string, unknown>,
                    old: payload.old as Record<string, unknown>,
                });
            },
        )

        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "row_tests",
            },
            payload => {
                onChange({
                    table: "row_tests",
                    eventType: payload.eventType,
                    new: payload.new as Record<string, unknown>,
                    old: payload.old as Record<string, unknown>,
                });
            },
        );

    channel.subscribe((status, err) => {
        console.log("Supabase Realtime status:", status);

        if (err) {
            console.error("Supabase Realtime error:", err);
        }
    });

    return () => {
        void supabase.removeChannel(channel);
    };
}
