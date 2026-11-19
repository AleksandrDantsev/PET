
<script setup lang="ts">
import {
    nextTick,
    onMounted,
    onBeforeUnmount,
    reactive,
    watch,
} from "vue";

import { formatCost } from "@/utils/normalize";

interface AdditionalField {
    key: string;
    value: unknown;
}

const props = defineProps<{
    fields: AdditionalField[];
}>();

const expandedFields = reactive<Record<string, boolean>>({});
const overflowingFields = reactive<Record<string, boolean>>({});

const fieldElements = new Map<string, HTMLElement>();

let resizeObserver: ResizeObserver | null = null;

const formatValue = (value: unknown): string => {
    if (value == null || String(value).trim() === "") {
        return "—";
    }

    if (typeof value === "number") {
        return formatCost(value) ?? String(value);
    }

    if (Array.isArray(value)) {
        return value.length ? value.join(", ") : "—";
    }

    if (typeof value === "object") {
        return JSON.stringify(value, null, 2);
    }

    return String(value);
};

const measureField = (key: string) => {
    const element = fieldElements.get(key);
    if (!element) return;

    const styles = getComputedStyle(element);
    const lineHeight = parseFloat(styles.lineHeight) || 17;

    const fullHeight = element.scrollHeight;
    const collapsedHeight = lineHeight * 2;

    overflowingFields[key] = fullHeight > collapsedHeight + 1;

    if (!overflowingFields[key]) {
        expandedFields[key] = false;
    }
};

const setFieldElement = (
    key: string,
    element: Element | null,
) => {
    if (element instanceof HTMLElement) {
        fieldElements.set(key, element);
        resizeObserver?.observe(element);

        nextTick(() => measureField(key));
    } else {
        const previous = fieldElements.get(key);

        if (previous) {
            resizeObserver?.unobserve(previous);
        }

        fieldElements.delete(key);
    }
};

const toggleField = (key: string) => {
    if (!overflowingFields[key]) return;

    expandedFields[key] = !expandedFields[key];

    fieldElements.get(key)?.classList.toggle(
        "is-expanded",
        expandedFields[key],
    );
};

const measureAllFields = () => {
    nextTick(() => {
        fieldElements.forEach((_, key) => measureField(key));
    });
};

watch(
    () => props.fields,
    measureAllFields,
    { deep: true, flush: "post" },
);

onMounted(() => {
    resizeObserver = new ResizeObserver(() => {
        measureAllFields();
    });

    fieldElements.forEach((element) => {
        resizeObserver?.observe(element);
    });

    measureAllFields();
});

onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    resizeObserver = null;
});
</script>

<template>
    <div 
        v-if="fields.length" 
        class="additional-fields"
    >
        <div class="additional-fields__header">
            <span class="additional-fields__title">
                Дополнительные данные
            </span>

            <span class="additional-fields__count">
                {{ fields.length }}
            </span>
        </div>

        <div class="additional-fields__grid">
            <div
                v-for="field in fields"
                :key="field.key"
                class="additional-field"
            >
                <div class="additional-field__label">
                    {{ field.key }}
                </div>

                <div
                    v-if="field.value != null && formatValue(field.value) !== '—'"
                    class="additional-field__expand"
                >
                    <div
                        :ref="(el) => setFieldElement(field.key, el as Element | null)"
                        class="additional-field__content"
                    >
                        {{ formatValue(field.value) }}
                    </div>

                    <button
                        v-if="overflowingFields[field.key]"
                        type="button"
                        class="additional-field__toggle"
                        @click="toggleField(field.key)"
                    >
                        {{ expandedFields[field.key] ? "Свернуть" : "Развернуть" }}

                        <span
                            class="additional-field__arrow"
                            :class="{
                                'is-open': expandedFields[field.key],
                            }"
                        >
                            ↓
                        </span>
                    </button>
                </div>

                <div
                    v-else
                    class="additional-field__value"
                    :class="{
                        'is-empty': formatValue(field.value) === '—',
                    }"
                >
                    {{ formatValue(field.value) }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.additional-fields {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    padding: 12px 20px 14px 48px;
    background: #fafbfc;
    border-radius: 0 0 8px 8px;
}

.additional-fields__header {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 8px;
}

.additional-fields__title {
    color: #555e6e;
    font-size: 11px;
    font-weight: 650;
}

.additional-fields__count {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    color: #7779c9;
    background: #ededfa;
    border-radius: 5px;
    font-size: 10px;
    font-weight: 600;
}

.additional-fields__grid {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
}

.additional-field {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    padding: 7px 0;
    border-bottom: 1px solid #e9ecf1;
    box-sizing: border-box;

    &:last-child {
        border-bottom: none;
    }
}

.additional-field__label {
    margin-bottom: 3px;
    color: #9299a7;
    font-size: 10px;
    font-weight: 500;
    line-height: 1.4;
    overflow-wrap: anywhere;
}

.additional-field__value,
.additional-field__content {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    color: #303847;
    font-size: 11px;
    font-weight: 550;
    line-height: 1.55;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
    box-sizing: border-box;
}

.additional-field__value.is-empty {
    color: #b5bbc5;
    font-weight: 400;
}

.additional-field__expand {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    min-width: 0;
}

.additional-field__content {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    color: #303847;
    font-size: 11px;
    font-weight: 550;
    line-height: 1.55;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
    box-sizing: border-box;

    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}

.additional-field__content.is-expanded {
    display: block;
    overflow: visible;
    -webkit-line-clamp: unset;
}

.additional-field__content.is-measuring {
    transition: none !important;
}

.additional-field__toggle {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 4px;
    padding: 0;
    border: none;
    background: transparent;
    color: #7779c9;
    font-family: inherit;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: color 0.15s ease;

    &:hover {
        color: #5558b5;
    }

    &:focus-visible {
        outline: 2px solid #a5a6ed;
        outline-offset: 3px;
        border-radius: 3px;
    }
}

.additional-field__arrow {
    display: inline-block;
    font-size: 12px;
    transition: transform 0.15s ease;

    &.is-open {
        transform: rotate(180deg);
    }
}

@media (max-width: 600px) {
    .additional-fields {
        padding: 10px 12px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .additional-field__toggle,
    .additional-field__arrow {
        transition: none;
    }
}
</style>
