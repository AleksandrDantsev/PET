import { onMounted, onUnmounted } from "vue";

export function useAppReload() {
    function handleKeydown(event: KeyboardEvent) {
        if (
            event.key === "F5" ||
            ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "r")
        ) {
            event.preventDefault();
            window.location.reload();
        }
    }

    onMounted(() => {
        window.addEventListener("keydown", handleKeydown);
    });

    onUnmounted(() => {
        window.removeEventListener("keydown", handleKeydown);
    });
}