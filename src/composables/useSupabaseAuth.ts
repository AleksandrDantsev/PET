
import { computed, ref } from "vue";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase/client";

const session = ref<Session | null>(null);
const isInitialized = ref(false);
const isLoading = ref(false);
const authError = ref("");

let initializationPromise: Promise<void> | null = null;
let authListenerInitialized = false;

export function useSupabaseAuth() {
    /**
     * Подписываемся на изменения авторизации.
     * Подписка создаётся только один раз.
     */
    function initializeAuthListener() {
        if (authListenerInitialized) return;

        authListenerInitialized = true;

        supabase.auth.onAuthStateChange((_event, newSession) => {
            session.value = newSession;
        });
    }

    /**
     * Первоначальная проверка и восстановление сессии.
     */
    function initialize(): Promise<void> {
        if (initializationPromise) {
            return initializationPromise;
        }

        initializationPromise = (async () => {
            try {
                initializeAuthListener();

                const { data, error } = await supabase.auth.getSession();

                if (error) throw error;

                session.value = data.session;
            } catch (error) {
                authError.value =
                    error instanceof Error
                        ? error.message
                        : "Не удалось восстановить сессию Supabase";

                session.value = null;
            } finally {
                isInitialized.value = true;
            }
        })();

        return initializationPromise;
    }

    /**
     * Вход по email и паролю.
     */
    async function signIn(email: string, password: string) {
        authError.value = "";
        isLoading.value = true;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            session.value = data.session;

            return true;
        } catch (error) {
            authError.value =
                error instanceof Error
                    ? error.message
                    : "Ошибка авторизации";

            return false;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Выход из Supabase.
     */
    async function signOut() {
        authError.value = "";
        isLoading.value = true;

        try {
            const { error } = await supabase.auth.signOut();

            if (error) throw error;

            session.value = null;

            return true;
        } catch (error) {
            authError.value =
                error instanceof Error
                    ? error.message
                    : "Ошибка выхода из аккаунта";

            return false;
        } finally {
            isLoading.value = false;
        }
    }

    const isAuthenticated = computed(() => session.value !== null);

    return {
        session,
        isAuthenticated,
        isInitialized,
        isLoading,
        authError,
        initialize,
        signIn,
        signOut,
    };
}
