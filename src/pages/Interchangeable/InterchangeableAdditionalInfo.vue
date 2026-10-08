<script setup lang="ts">
import { formatNumber } from "@/utils/normalize";
import { CONST_TITLES } from "@/configs/CONFIG_CONST.ts";

interface AdditionalField {
    key: string;
    value: unknown;
}

defineProps<{
    fields: AdditionalField[];
}>();


const splitByDate = (value: string) => {  // временное решение, скорее всего формат входных данных изменится
    return value
        .split(/(?<=\(\d{2}\.\d{2}\.\d{4}\))\s+/)
        .map(item => item.trim())
        .filter(Boolean)
        .join("\n");
};

const formatValue = (value: unknown, key: string = "") => {
    if (value == null || value === "") {
        return "-";
    }

    if (key === CONST_TITLES.ALL_CUSTOMERS_SHIPPED_ITEM_MANAGER) {
        return splitByDate(String(value))
    }

    if (typeof value === "number") {
        return formatNumber(value) ?? String(value);
    }

    if (Array.isArray(value)) {
        return value.join(", ");
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value);
};
</script>

<template>
    <div class="additional-fields">
        <div class="additional-title">
            Дополнительная информация
        </div>

        <div
            v-for="field in fields"
            :key="field.key"
            class="additional-field"
        >
            <div class="additional-label">
                {{ field.key }}
            </div>

            <div class="additional-value">
                {{ formatValue(field.value, field.key) }}
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.additional-fields {
    width: min(900px, 100%);
    padding: 8px 12px 10px 48px;
}

.additional-title {
    margin-bottom: 6px;
    color: #6f6d67;
    font-size: 9px;
    font-weight: 600;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.additional-field {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    min-height: 26px;
    align-items: center;
    border-top: 1px solid #f1f1ef;
}

.additional-field:last-child {
    border-bottom: 1px solid #f1f1ef;
}

.additional-label {
    padding: 5px 16px 5px 0;
    color: #77756f;
    font-size: 10px;
    font-weight: 500;
    line-height: 1.3;
}

.additional-value {
    min-width: 0;
    padding: 5px 0;
    color: #353532;
    font-size: 10px;
    font-weight: 400;
    line-height: 1.3;
    white-space: pre-line;
    overflow-wrap: anywhere;
    word-break: break-word;
}

@media (max-width: 900px) {
    .additional-fields {
        width: 100%;
        padding-left: 24px;
    }

    .additional-field {
        grid-template-columns: 180px minmax(0, 1fr);
    }
}

@media (max-width: 600px) {
    .additional-fields {
        padding: 8px 10px;
    }

    .additional-field {
        grid-template-columns: 1fr;
        gap: 2px;
        padding: 5px 0;
    }

    .additional-label {
        padding: 0;
        font-size: 9px;
    }

    .additional-value {
        padding: 0;
        font-size: 10px;
    }
}
</style>