
<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import { useNotification } from "naive-ui";

const notification = useNotification();
const shownErrors = new Set<string>();

function showError(title: string, error: unknown) {
    const message = error instanceof Error
        ? error.message
        : String(error ?? "");

    const key = `${title}:${message}`;

    if (shownErrors.has(key)) return;

    shownErrors.add(key);

    notification.error({
        title,
        content: message,
        duration: 0,
        closable: true,
        onClose: () => {
            shownErrors.delete(key);
        },
    });
}

function handleWindowError(event: ErrorEvent) {
    showError(
        "Ошибка приложения",
        event.message || "Неизвестная ошибка JavaScript"
    );
}

function handleUnhandledRejection(event: PromiseRejectionEvent) {
    showError(
        "Ошибка асинхронной операции",
        event.reason
    );
}

function handleAppError(event: Event) {
    const detail = (event as CustomEvent<{
        message?: string;
        description?: string;
    }>).detail;

    showError(
        detail?.message ?? "Ошибка приложения",
        detail?.description
    );
}

onMounted(() => {
    window.addEventListener("error", handleWindowError);
    window.addEventListener(
        "unhandledrejection",
        handleUnhandledRejection
    );
    window.addEventListener("app:error", handleAppError);
});

onBeforeUnmount(() => {
    window.removeEventListener("error", handleWindowError);
    window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
    );
    window.removeEventListener("app:error", handleAppError);
});
</script>

<template>
    <span hidden />
</template>
