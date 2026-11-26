
<script setup lang="ts">
import { computed, ref } from "vue";
import { NButton, NDatePicker, NPopover, NTooltip } from "naive-ui";

import type { DataObject } from "@/types/TableSheetData";
import type { useTableTests } from "@/composables/useTableTests";
import FlaskIcon from "@/components/icons/FlaskIcon.vue";

type TableTests = Pick<
    ReturnType<typeof useTableTests>,
    "getTests" | "addTest" | "removeTest"
>;

const props = defineProps<{
    row: DataObject;
    tests: TableTests;
}>();

const showDatePicker = ref(false);

const testDate = computed(() =>
    props.tests.getTests(props.row)
);

const hasTests = computed(() => testDate.value !== null);

const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString("ru-RU");

const handleDateUpdate = (date: number | null) => {
    if (date === null) return;

    props.tests.addTest(props.row, date);
    showDatePicker.value = false;
};

const handleClearDate = () => {
    props.tests.removeTest(props.row);
    showDatePicker.value = false;
};
</script>

<template>
    <NPopover
        v-model:show="showDatePicker"
        trigger="manual"
        placement="right-start"
        :to="true"
        :z-index="99999"
        @clickoutside="showDatePicker = false"
    >
        <template #trigger>
            <NTooltip
                placement="top"
                :disabled="showDatePicker"
            >
                <template #trigger>
                    <span
                        class="product-test-indicator"
                        :class="{
                            'product-test-indicator--active': hasTests,
                        }"
                        @click.stop="showDatePicker = !showDatePicker"
                    >
                        <FlaskIcon />
                    </span>
                </template>

                <div class="product-test-tooltip">
                    Тесты: {{ testDate !== null ? formatDate(testDate) : "-" }}
                </div>
            </NTooltip>
        </template>

        <div class="product-test-picker">
            <NDatePicker
                panel
                type="date"
                :value="testDate"
                size="small"
                :clearable="false"
                @update:value="handleDateUpdate"
            />

            <NButton
                v-if="hasTests"
                size="small"
                quaternary
                type="error"
                block
                @click="handleClearDate"
            >
                Очистить дату
            </NButton>
        </div>
    </NPopover>
</template>

<style scoped lang="scss">
$colorSvg: #a0a0a0;

.product-test-indicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 3px;
    color: $colorSvg;
    cursor: pointer;
    transition: color 0.2s ease;

    svg {
        display: block;
        width: 13px;
        height: 13px;
    }

    &:hover {
        color: #5274D1;
    }

    &--active {
        color: #5274D1;
    }
}
.product-test-picker {
    width: max-content;

    :deep(.n-date-panel) {
        font-size: 11px;
    }

    :deep(.n-date-panel-date) {
        width: 20px;
        height: 20px;
    }

    :deep(.n-date-panel-month) {
        font-size: 11px;
    }
}
</style>
