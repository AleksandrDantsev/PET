export function reportAppError(
    title: string,
    error?: unknown,
): void {
    const message =
        error instanceof Error
            ? error.message
            : String(error ?? title);

    console.error(`[${title}]`, error ?? message);

    window.dispatchEvent(
        new CustomEvent("app:error", {
            detail: {
                message: title,
                description: message,
            },
        }),
    );
}