
<script setup lang="ts">
import { computed, ref } from "vue";
import {
    NButton,
    NDatePicker,
    NInput,
    NPopover,
    NPopconfirm,
    NSwitch,
    NTooltip,
} from "naive-ui";

import { capitalize } from "@/utils/normalize";
import type { DataObject } from "@/types/TableSheetData";
import type { useTableTests } from "@/composables/useTableTests";
import type {
    TestRecord,
    TestUpdate,
} from "@/services/supabase/userDataService";

import FlaskIcon from "@/components/icons/FlaskIcon.vue";
import TrashBinIcon from "../icons/TrashBinIcon.vue";
import PenIcon from "../icons/PenIcon.vue";
import CalendarIcon from "../icons/CalendarIcon.vue";
import ChevronIcon from "../icons/ChevronIcon.vue";

type TableTests = Pick<
    ReturnType<typeof useTableTests>,
    "getTests" | "addTest" | "editTest" | "removeTest"
>;

const props = defineProps<{
    row: DataObject;
    tests: TableTests;
}>();

const TOOLTIP_DELAY = 600;

const showPopover = ref(false);
const showForm = ref(false);
const showDatePicker = ref(false);

const editingTestId = ref<string | null>(null);

const formDate = ref<number | null>(Date.now());
const formComment = ref("");
const formIsSuitable = ref(true);

const isSaving = ref(false);
const processingTestIds = ref<Set<string>>(new Set());
const suitabilityOverrides = ref<Record<string, boolean>>({});

const testRecords = computed(() =>
    [...props.tests.getTests(props.row)].sort(
        (a, b) => a.testedAt - b.testedAt,
    ),
);

const hasTests = computed(() => testRecords.value.length > 0);

const latestTest = computed(
    () => testRecords.value.at(-1) ?? null,
);

const latestTestIsSuitable = computed(() =>
    latestTest.value
        ? getDisplayedSuitability(latestTest.value)
        : false,
);

const isFormChanged = computed(() => {
    if (!editingTestId.value) return true;

    const original = testRecords.value.find(
        test => test.id === editingTestId.value,
    );

    if (!original) return false;

    return (
        formDate.value !== original.testedAt ||
        capitalize(formComment.value).trim() !== original.comment.trim() ||
        formIsSuitable.value !== original.isSuitable
    );
});

const formatDate = (timestamp: number): string =>
    new Date(timestamp).toLocaleDateString("ru-RU");

const getDisplayedSuitability = (test: TestRecord): boolean =>
    suitabilityOverrides.value[test.id] ?? test.isSuitable;

const setProcessing = (id: string, processing: boolean): void => {
    const next = new Set(processingTestIds.value);

    if (processing) {
        next.add(id);
    } else {
        next.delete(id);
    }

    processingTestIds.value = next;
};

const resetForm = (open = false): void => {
    editingTestId.value = null;
    formDate.value = Date.now();
    formComment.value = "";
    formIsSuitable.value = true;

    showDatePicker.value = false;
    showForm.value = open;
};

const startAdding = (): void => {
    resetForm(true);
};

const startEditing = (test: TestRecord): void => {
    editingTestId.value = test.id;
    formDate.value = test.testedAt;
    formComment.value = test.comment;
    formIsSuitable.value = test.isSuitable;

    showDatePicker.value = false;
    showForm.value = true;
};

const handleSave = async (): Promise<void> => {
    if (
        formDate.value === null ||
        isSaving.value ||
        !isFormChanged.value
    ) {
        return;
    }

    isSaving.value = true;

    try {
        if (editingTestId.value) {
            const updates: TestUpdate = {
                testedAt: formDate.value,
                comment: capitalize(formComment.value),
                isSuitable: formIsSuitable.value,
            };

            await props.tests.editTest(
                editingTestId.value,
                updates,
            );
        } else {
            await props.tests.addTest(
                props.row,
                formDate.value,
                capitalize(formComment.value),
                formIsSuitable.value,
            );
        }

        resetForm();
    } catch (error) {
        console.error(
            "Не удалось сохранить тестирование:",
            error,
        );
    } finally {
        isSaving.value = false;
    }
};

const handleSuitabilityChange = async (
    test: TestRecord,
    value: boolean,
): Promise<void> => {
    if (processingTestIds.value.has(test.id)) return;

    suitabilityOverrides.value = {
        ...suitabilityOverrides.value,
        [test.id]: value,
    };

    setProcessing(test.id, true);

    try {
        await props.tests.editTest(test.id, {
            isSuitable: value,
        });
    } catch (error) {
        console.error(
            "Не удалось изменить результат тестирования:",
            error,
        );
    } finally {
        const next = { ...suitabilityOverrides.value };

        delete next[test.id];

        suitabilityOverrides.value = next;

        setProcessing(test.id, false);
    }
};

const handleDelete = async (test: TestRecord): Promise<void> => {
    if (processingTestIds.value.has(test.id)) return;

    setProcessing(test.id, true);

    try {
        await props.tests.removeTest(test.id);

        if (editingTestId.value === test.id) {
            resetForm();
        }
    } catch (error) {
        console.error(
            "Не удалось удалить тестирование:",
            error,
        );
    } finally {
        setProcessing(test.id, false);
    }
};

const handlePopoverClose = (): void => {
    showPopover.value = false;
    resetForm();
};

const isSuitableText = (condition: boolean) =>
    condition ? "Подходит" : "Не подходит";
</script>

<template>
    <NPopover
        v-model:show="showPopover"
        trigger="manual"
        placement="right-start"
        :to="true"
        :z-index="99999"
        @clickoutside="handlePopoverClose"
    >
        <template #trigger>
            <NTooltip
                placement="top"
                :disabled="showPopover"
                :delay="TOOLTIP_DELAY"
            >
                <template #trigger>
                    <span
                        class="product-test-indicator"
                        :class="{
                            'product-test-indicator--suitable':
                                hasTests && latestTestIsSuitable,
                            'product-test-indicator--unsuitable':
                                hasTests && !latestTestIsSuitable,
                        }"
                        @click.stop="showPopover = !showPopover"
                    >
                        <FlaskIcon />
                    </span>
                </template>

                <template v-if="latestTest">
                    Последнее тестирование:
                    {{ isSuitableText(latestTestIsSuitable) }}
                    ({{ formatDate(latestTest.testedAt) }})
                </template>

                <template v-else>
                    Тестирований нет
                </template>
            </NTooltip>
        </template>

        <div class="product-test-panel">
            <div class="product-test-header">
                <div class="product-test-heading">
                    <span class="product-test-title">
                        История тестирований
                    </span>

                    <span class="product-test-count">
                        {{ testRecords.length }}
                    </span>
                </div>

                <NButton
                    v-if="!showForm"
                    size="small"
                    type="primary"
                    secondary
                    @click="startAdding"
                >
                    <template #icon>
                        <span class="add-icon">+</span>
                    </template>

                    Добавить
                </NButton>
            </div>

            <div
                v-if="testRecords.length"
                class="product-test-list"
            >
                <div
                    v-for="test in testRecords"
                    :key="test.id"
                    class="product-test-row"
                >
                    <div class="product-test-info">
                        <span class="product-test-date">
                            {{ formatDate(test.testedAt) }}
                        </span>

                        <NTooltip
                            v-if="test.comment"
                            placement="top"
                            :delay="TOOLTIP_DELAY"
                        >
                            <template #trigger>
                                <span class="product-test-comment">
                                    {{ test.comment }}
                                </span>
                            </template>

                            {{ test.comment }}
                        </NTooltip>

                        <span
                            v-else
                            class="product-test-comment product-test-comment--empty"
                        >
                            Без комментария
                        </span>
                    </div>

                    <div class="product-test-actions">
                        <NTooltip
                            placement="top"
                            :delay="TOOLTIP_DELAY"
                        >
                            <template #trigger>
                                <NSwitch
                                    size="small"
                                    :value="getDisplayedSuitability(test)"
                                    :disabled="processingTestIds.has(test.id)"
                                    @update:value="
                                        value => handleSuitabilityChange(test, value)
                                    "
                                />
                            </template>

                            {{
                                isSuitableText(
                                    getDisplayedSuitability(test)
                                )
                            }}
                        </NTooltip>

                        <NTooltip
                            placement="top"
                            :delay="TOOLTIP_DELAY"
                        >
                            <template #trigger>
                                <button
                                    type="button"
                                    class="product-test-icon-button"
                                    aria-label="Редактировать тестирование"
                                    :disabled="processingTestIds.has(test.id)"
                                    @click="startEditing(test)"
                                >
                                    <PenIcon />
                                </button>
                            </template>

                            Редактировать
                        </NTooltip>

                        <NPopconfirm
                            positive-text="Удалить"
                            negative-text="Отмена"
                            @positive-click="handleDelete(test)"
                        >
                            <template #trigger>
                                <button
                                    type="button"
                                    class="product-test-icon-button product-test-icon-button--danger"
                                    aria-label="Удалить тестирование"
                                    :disabled="processingTestIds.has(test.id)"
                                >
                                    <TrashBinIcon />
                                </button>
                            </template>

                            Удалить это тестирование?
                        </NPopconfirm>
                    </div>
                </div>
            </div>

            <div
                v-else-if="!showForm"
                class="product-test-empty"
            >
                <FlaskIcon />
                <span>История тестирований пока пуста</span>
            </div>

            <div
                v-if="showForm"
                class="product-test-form"
            >
                <div class="product-test-form-header">
                    <span class="product-test-form-title">
                        {{
                            editingTestId
                                ? "Редактирование"
                                : "Новое тестирование"
                        }}
                    </span>
                </div>

                <NPopover
                    v-model:show="showDatePicker"
                    trigger="click"
                    placement="bottom-start"
                >
                    <template #trigger>
                        <button
                            type="button"
                            class="product-test-date-trigger"
                            :class="{
                                'product-test-date-trigger--open': showDatePicker,
                            }"
                        >
                            <span class="product-test-date-icon">
                                <CalendarIcon />
                            </span>

                            <span class="product-test-date-value">
                                {{
                                    formDate
                                        ? formatDate(formDate)
                                        : "Выбрать дату"
                                }}
                            </span>

                            <span class="product-test-date-hint">
                                Укажите дату проведения тестов
                            </span>

                            <ChevronIcon class="product-test-date-chevron" />
                        </button>
                    </template>

                    <NDatePicker
                        v-model:value="formDate"
                        type="date"
                        :actions="[]"
                        @update:value="showDatePicker = false"
                    />
                </NPopover>

                <NInput
                    v-model:value="formComment"
                    class="product-test-comment-input"
                    size="small"
                    placeholder="Комментарий к тестированию"
                    maxlength="500"
                    clearable
                />

                <div class="product-test-form-result">
                    <span
                        :class="{
                            'product-test-result--positive': formIsSuitable,
                            'product-test-result--negative': !formIsSuitable,
                        }"
                    >
                        {{ formIsSuitable ? "Подходит" : "Не подходит" }}
                    </span>

                    <NSwitch
                        v-model:value="formIsSuitable"
                        size="small"
                    />
                </div>

                <div class="product-test-form-actions">
                    <NButton
                        size="small"
                        quaternary
                        :disabled="isSaving"
                        @click="resetForm()"
                    >
                        Отмена
                    </NButton>

                    <NButton
                        size="small"
                        type="primary"
                        :loading="isSaving"
                        :disabled="formDate === null || !isFormChanged"
                        @click="handleSave"
                    >
                        {{ editingTestId ? "Сохранить" : "Добавить" }}
                    </NButton>
                </div>
            </div>
        </div>
    </NPopover>
</template>

<style scoped lang="scss">
$colorSvg: #a0a0a0;

.product-test-indicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 24px;
    width: 24px;
    height: 24px;
    padding: 3px;
    color: $colorSvg;
    cursor: pointer;
    border-radius: 6px;
    transition:
        color 0.18s ease,
        background-color 0.18s ease;

    svg {
        display: block;
        width: 14px;
        height: 14px;
    }

    &:hover {
        color: #e7ca26;
        background: #e2c72d1a;
    }

    &--suitable {
        color: #32a56f;

        &:hover {
            color: #27895b;
            background: rgb(50 165 111 / 10%);
        }
    }

    &--unsuitable {
        color: #d45b5b;

        &:hover {
            color: #bd4444;
            background: rgb(212 91 91 / 10%);
        }
    }
}

.product-test-panel {
    width: 510px;
    max-width: calc(100vw - 40px);
    padding: 6px 8px;
    contain: layout;
}

.product-test-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 32px;
    margin-bottom: 6px;
}

.product-test-heading {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
}

.product-test-title {
    font-size: 13px;
    font-weight: 650;
    letter-spacing: -0.1px;
}

.product-test-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 19px;
    height: 19px;
    padding: 0 5px;
    color: var(--n-text-color-2);
    font-size: 10px;
    font-weight: 650;
    background: var(--n-color-embedded);
    border-radius: 20px;
}

.product-test-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    max-height: 280px;
    overflow-y: auto;
    scrollbar-gutter: stable;
}

.product-test-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
    min-height: 32px;
    padding: 2px 4px;
    border-bottom: 1px solid var(--n-divider-color);
    border-radius: 5px;
    transition: background-color 0.15s ease;

    &:last-child {
        border-bottom-color: transparent;
    }

    &:hover {
        background: var(--n-color-embedded);
    }
}

.product-test-info {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    overflow: hidden;
}

.product-test-date {
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 650;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
}

.product-test-comment {
    min-width: 0;
    overflow: hidden;
    color: var(--n-text-color-2);
    font-size: 11px;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: help;
}

.product-test-comment--empty {
    color: var(--n-text-color-3);
    font-style: italic;
}

.product-test-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 0 0 auto;
    gap: 3px;
    min-width: 90px;
}

.product-test-form {
    display: flex;
    flex-direction: column;
    gap: 9px;
    margin-top: 6px;
    padding-top: 10px;
    border-top: 1px solid var(--n-divider-color);
}

.product-test-form-header {
    display: flex;
    align-items: center;
    min-height: 15px;
}

.product-test-form-title {
    font-size: 12px;
    font-weight: 600;
}

.product-test-date-trigger {
    display: flex;
    align-items: center;
    gap: 9px;
    box-sizing: border-box;
    width: 100%;
    height: 28px;
    padding: 0 9px;
    color: var(--n-text-color-2);
    cursor: pointer;
    background: var(--n-color);
    border: 1px solid var(--n-border-color);
    border-radius: var(--n-border-radius);
    outline: none;
    transition:
        background-color 0.15s ease,
        border-color 0.15s ease,
        box-shadow 0.15s ease,
        color 0.15s ease;

    &:hover,
    &--open {
        color: var(--n-text-color);
        border-color: var(--n-border-color-hover);
    }

    &:focus-visible {
        border-color: var(--n-border-color-focus);
        box-shadow: 0 0 0 2px var(--n-box-shadow);
    }
}

.product-test-date-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 16px;
    width: 16px;
    height: 16px;
    color: #9299a3;

    :deep(svg) {
        display: block;
        width: 15px;
        height: 15px;
        color: inherit;
        stroke: currentColor;
    }
}

.product-test-date-value {
    flex: 0 0 auto;
    min-width: 0;
    overflow: hidden;
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
}

.product-test-date-hint {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    color: var(--n-text-color-3);
    font-size: 10px;
    font-style: italic;
    font-weight: 400;
    line-height: 1;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.product-test-date-chevron {
    flex: 0 0 14px;
    width: 14px;
    height: 14px;
    color: #9299a3;
    transition: transform 0.15s ease;

    :deep(svg) {
        color: inherit;
        stroke: currentColor;
    }
}

.product-test-date-trigger--open .product-test-date-chevron {
    transform: rotate(180deg);
}

.product-test-comment-input {
    width: 100%;

    :deep(.n-input) {
        box-sizing: border-box;
        width: 100%;
    }
}

.product-test-form-result {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 28px;
    padding: 0 2px;
    font-size: 12px;
}

.product-test-result--positive {
    color: #3a9b70;
    font-weight: 600;
}

.product-test-result--negative {
    color: #d45b5b;
    font-weight: 600;
}

.product-test-form-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    padding-top: 2px;
}

.product-test-icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 26px;
    width: 26px;
    height: 26px;
    padding: 0;
    color: #9299a3;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 6px;
    transition:
        color 0.15s ease,
        background-color 0.15s ease;

    :deep(svg) {
        display: block;
        width: 15px;
        height: 15px;
        color: inherit;
        stroke: currentColor;
    }

    &:hover:not(:disabled) {
        color: var(--n-text-color);
        background: var(--n-color-hover);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.45;
    }

    &--danger:hover:not(:disabled) {
        color: #d94b4b;
        background: rgb(217 75 75 / 10%);
    }
}

.product-test-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 62px;
    color: var(--n-text-color-3);
    font-size: 12px;

    svg {
        width: 18px;
        height: 18px;
        opacity: 0.65;
    }
}
</style>
