
import { useMessage } from "naive-ui";

export const getQuantityOfBox = (
    text: string | number | undefined
): number | null => {
    if (text === undefined || text === "") return null;

    const arr = String(text).trim().split(/\s+/);

    let i = 0;

    for (const item of String(text)) {
        if (item === " ") i++;
    }

    return Number(arr[Math.ceil(i / 2)] ?? null);
};

export const usePasteIntoFormFromClipboard = () => {
    const message = useMessage();

    const pasteFromClipboard = async () => {
        let clipboardValue: string;

        try {
            clipboardValue = await navigator.clipboard.readText();
        } catch (error) {
            console.error("Не удалось прочитать буфер обмена:", error);
            message.error("Не удалось прочитать буфер обмена");
            return null;
        }

        if (!clipboardValue.trim()) {
            message.error("Пустой буфер обмена");
            return null;
        }

        const valuesArr = clipboardValue
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .trimEnd()
            .split("\n");

        if (valuesArr.length !== 8) {
            message.error(
                "Данные в буфере не соответствуют формату полей"
            );
            return null;
        }

        const [
            agreement,
            monthCost,
            znur,
            client,
            order,
            nomenclature,
            titles,
            numbers,
        ] = valuesArr;

        if (!getQuantityOfBox(numbers)) return;

        const result = {
            agreement,
            monthCost,
            znur,
            client,
            order,
            nomenclature,
            titles,
            quantityBox: getQuantityOfBox(numbers),
        };

        message.success("");

        return result;
    };

    return { pasteFromClipboard };
};

// Согласование аналитика ДХТ
// Цена на месяц
// ЗНУР 003421 от 30.09.2026 15:51:50
// Ахтемов Сулейман ИП (Аджимамбетов Эмиль Рустемович ИП)
// Ф-2 (отсрочка 30 дней)
// 64 гр. 38 мм бесцветная (4032) ЕП
// Цена Количество Коробов Сумма
// 14,36 8 064 2 115 799,04
