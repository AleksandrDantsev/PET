export const LocalStorage = {
    get: function <T>(key: string): T | null {
        const data = localStorage.getItem(key);

        if (!data) {
            return null;
        }

        try {
            return JSON.parse(data) as T;
        } 
        catch {
            return null;
        }
    },
    save: function <T>(key: string, data: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(
                `Не удалось сохранить данные в localStorage (${key}):`,
                error,
            );
        }
    }
}