import { useMessage } from "naive-ui";

export const useCopyToClipboard = () => {
    const message = useMessage();

    const copy = async (value: unknown, messageText: string) => {
        const text = String(value ?? "").trim();

        if (!text || text === "-") {
            return false;
        }

        try {
            await navigator.clipboard.writeText(text);
            message.success(messageText, {
                duration: 1300,
                closable: true,
            });
            return true;
        } catch (error) {
            console.error("Не удалось скопировать значение", error);
            message.error("Не удалось скопировать");
            return false;
        }
    };

    return { copy };
};