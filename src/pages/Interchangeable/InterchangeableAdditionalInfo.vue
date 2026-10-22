<script setup lang="ts">
import { formatCost } from "@/utils/normalize";

interface AdditionalField {
    key: string;
    value: unknown;
}

defineProps<{
    fields: AdditionalField[];
}>();


const formatValue = (value: unknown) => {
    if (value == null || String(value).trim() === "") {
        return "-";
    }

    if (typeof value === "number") {
        return formatCost(value) ?? String(value);
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
        <div
            v-for="field in fields"
            :key="field.key"
            class="additional-field"
        >
            <div class="additional-label">
                {{ field.key }}
            </div>

            <div class="additional-value">
                {{ formatValue(field.value) }}
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.additional-fields {
    width: 100%;
    padding: 12px 24px 12px 48px;
    border-left: 3px solid #0066cc;
    background: #fff;
}

.additional-field {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    align-items: stretch;
    min-height: 28px;
    border-bottom: 1px solid #ededed;
}

.additional-label {
    display: flex;
    align-items: center;
    padding: 6px 12px;
    color: #444649;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.3;
    border-right: 1px solid #ededed;
}

.additional-value {
    min-width: 0;
    padding: 6px 12px;
    color: #151515;
    font-size: 11px;
    font-weight: 400;
    line-height: 1.3;
    white-space: pre-line;
    overflow-wrap: anywhere;
    word-break: break-word;
}

@media (max-width: 900px) {
    .additional-fields {
        padding-left: 32px;
    }

    .additional-field {
        grid-template-columns: 180px minmax(0, 1fr);
    }
}

@media (max-width: 600px) {
    .additional-fields {
        padding: 0 10px 0 24px;
    }

    .additional-field {
        grid-template-columns: 1fr;
    }

    .additional-label {
        padding: 5px 8px 2px;
        border-right: 0;
    }

    .additional-value {
        padding: 2px 8px 6px;
    }
}
</style>