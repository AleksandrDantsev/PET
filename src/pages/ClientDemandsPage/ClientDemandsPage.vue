
<script setup lang="ts">
import { computed, ref, watch } from "vue";

import type {
    DataObject,
    IGoogleTableData,
} from "@/types/TableSheetData";

import { dataToObjects } from "@/helpers/dataHandlers";
import { check } from "@/helpers/checkInterchangeablePositions";
import { CONST_TITLES } from "@/configs/CONFIG_CONST";

import ClientDemandCard from "./ClientDemandCard.vue";

import { NEmpty, NSelect } from "naive-ui";
import { normalizeForSorting } from "@/utils/normalize.ts";

const props = defineProps<{
    interchangeableData: IGoogleTableData | null;
}>();

const ALL_TYPES = "Все";

const selectedContragent = ref<string | null>(null);
const selectedType = ref(ALL_TYPES);
const selectedStandard = ref(ALL_TYPES);

const demandObjects = computed<DataObject[]>(() => {
    if (!props.interchangeableData) return [];

    return dataToObjects(props.interchangeableData);
});

const contragentOptions = computed(() => {
    const names = new Set<string>();

    demandObjects.value.forEach(item => {
        const name = String(
            item[CONST_TITLES.CONTRAGENT] ?? ""
        ).trim();

        if (name) names.add(name);
    });
    

    return Array.from(names)
        .sort((a, b) => normalizeForSorting(a).localeCompare(
            normalizeForSorting(b),
            undefined,
            { sensitivity: "base" }
        ))
        .map(name => ({
            label: name,
            value: name,
        }));
});

const clientDemands = computed<DataObject[]>(() => {
    if (!selectedContragent.value) return [];

    return demandObjects.value.filter(item =>
        check.checkContragent(
            String(item[CONST_TITLES.CONTRAGENT] ?? ""),
            selectedContragent.value!,
        )
    );
});

const clientInfo = computed(() => {
    const first = clientDemands.value[0];

    if (!first) return null;

    return {
        contragent: first[CONST_TITLES.CONTRAGENT],
        branch: first[CONST_TITLES.BRANCH_DELIVERY],
        manager: first[CONST_TITLES.MANAGER],
    };
});

const productTypes = computed(() => {
    const types = new Set<string>();

    clientDemands.value.forEach(item => {
        const type = String(
            item[CONST_TITLES.TYPE_OF_PRODUCT] ?? ""
        ).trim();

        if (type) types.add(type);
    });

    return Array.from(types).sort((a, b) =>
        a.localeCompare(b, "ru")
    );
});

const productStandards = computed(() => {
    const standards = new Set<string>();

    clientDemands.value.forEach(item => {
        const standard = String(
            item[CONST_TITLES.STANDARD] ?? ""
        ).trim();

        if (standard) standards.add(standard);
    });

    return Array.from(standards).sort((a, b) =>
        a.localeCompare(b, "ru", { numeric: true })
    );
});

const typeOptions = computed(() => [
    {
        label: ALL_TYPES,
        value: ALL_TYPES,
        count: clientDemands.value.length - 1,
    },
    ...productTypes.value.map(type => ({
        label: type,
        value: type,
        count: clientDemands.value.filter(item =>
            String(
                item[CONST_TITLES.TYPE_OF_PRODUCT] ?? ""
            ).trim() === type
        ).length,
    })),
]);

const standardOptions = computed(() => [
    {
        label: ALL_TYPES,
        value: ALL_TYPES,
        count: clientDemands.value.length - 1,
    },
    ...productStandards.value.map(standard => ({
        label: standard,
        value: standard,
        count: clientDemands.value.filter(item =>
            String(
                item[CONST_TITLES.STANDARD] ?? ""
            ).trim() === standard
        ).length,
    })),
]);

const filteredDemands = computed(() => {
    return clientDemands.value.filter(item => {
        const type = String(
            item[CONST_TITLES.TYPE_OF_PRODUCT] ?? ""
        ).trim();

        const standard = String(
            item[CONST_TITLES.STANDARD] ?? ""
        ).trim();

        const matchesType =
            selectedType.value === ALL_TYPES ||
            type === selectedType.value;

        const matchesStandard =
            selectedStandard.value === ALL_TYPES ||
            standard === selectedStandard.value;

        return matchesType && matchesStandard;
    });
});

const formatInfo = (value: unknown): string => {
    if (value == null || String(value).trim() === "") {
        return "Не указано";
    }

    return String(value);
};

watch(selectedContragent, () => {
    selectedType.value = ALL_TYPES;
    selectedStandard.value = ALL_TYPES;
});
</script>

<template>
    <div class="client-demands-page">
        <header class="page-header">
            <div class="page-heading">
                <h2>Потребности клиентов</h2>
                <span>Просмотр и фильтрация потребностей</span>
            </div>

            <div class="search-field">
                <NSelect
                    v-model:value="selectedContragent"
                    :options="contragentOptions"
                    filterable
                    clearable
                    placeholder="Найти контрагента..."
                    size="medium"
                />
            </div>
        </header>
        <template v-if="selectedContragent">
            <template v-if="clientDemands.length">
                <section class="client-info">
                    <div class="client-info__name">
                        <span>Контрагент</span>
                        <strong>
                            {{ formatInfo(clientInfo?.contragent) }}
                        </strong>
                    </div>

                    <div class="client-info__item">
                        <span>Филиал</span>
                        <strong>
                            {{ formatInfo(clientInfo?.branch) }}
                        </strong>
                    </div>

                    <div class="client-info__item">
                        <span>Менеджер</span>
                        <strong>
                            {{ formatInfo(clientInfo?.manager) }}
                        </strong>
                    </div>

                    <div class="client-info__total">
                        <strong>{{ clientDemands.length }}</strong>
                        <span>потребностей</span>
                    </div>
                </section>

                <section class="demands-section">
                    <div class="demands-toolbar">
                        <div class="demands-title">
                            <h3>Список потребностей</h3>
                            <span>{{ filteredDemands.length }} записей</span>
                        </div>

                        <div class="filters">
                            <div class="filter-group">
                                <span class="filter-label">
                                    Тип товара
                                </span>

                                <div class="type-filter">
                                    <button
                                        v-for="type in typeOptions"
                                        :key="type.value"
                                        type="button"
                                        class="type-filter__button"
                                        :class="{
                                            'type-filter__button--active':
                                                selectedType === type.value
                                        }"
                                        :aria-pressed="
                                            selectedType === type.value
                                        "
                                        @click="selectedType = type.value"
                                    >
                                        {{ type.label }}
                                        <span>{{ type.count }}</span>
                                    </button>
                                </div>
                            </div>

                            <div class="filter-group">
                                <span class="filter-label">
                                    Стандарт
                                </span>

                                <div class="type-filter">
                                    <button
                                        v-for="standard in standardOptions"
                                        :key="standard.value"
                                        type="button"
                                        class="type-filter__button"
                                        :class="{
                                            'type-filter__button--active':
                                                selectedStandard === standard.value
                                        }"
                                        :aria-pressed="
                                            selectedStandard === standard.value
                                        "
                                        @click="
                                            selectedStandard = standard.value
                                        "
                                    >
                                        {{ standard.label }}
                                        <span>{{ standard.count }}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="filteredDemands.length"
                        class="demands-list"
                    >
                        <ClientDemandCard
                            v-for="(demand, index) in filteredDemands"
                            :key="index"
                            :demand="demand"
                        />
                    </div>
                    <NEmpty
                        v-else
                        description="Нет потребностей по выбранным фильтрам"
                        size="medium"
                        class="empty-state"
                    />
                </section>
            </template>
            <NEmpty
                v-else
                description="У этого контрагента пока нет потребностей"
                size="medium"
                class="empty-state"
            />
        </template>
        <div 
            v-else 
            class="start-state"
        >
            <div class="start-state__icon">
                <span>⌕</span>
            </div>

            <strong>Выберите контрагента</strong>
            <span>
                Начните вводить название в поле поиска выше
            </span>
        </div>
    </div>
</template>
<style scoped lang="scss">
.client-demands-page {
    width: 100%;
    min-height: 100%;
    padding: 40px 24px 28px;
    box-sizing: border-box;
    color: #292d32;
}

.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 20px;
}

.page-heading {
    min-width: 0;

    h2 {
        margin: 0;
        font-size: 19px;
        line-height: 1.3;
        font-weight: 650;
        color: #292d32;
    }

    > span {
        display: block;
        margin-top: 4px;
        color: #9299a3;
        font-size: 12px;
    }
}

.search-field {
    width: min(100%, 600px);
    flex-shrink: 0;
}


.client-info {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 13px 16px;
    margin-bottom: 24px;
    background: #f7f8fa;
    border: 1px solid #eaedf0;
    border-radius: 10px;

    > div {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    &__name {
        flex: 1.5;
        padding-right: 20px;
    }

    &__item {
        flex: 1;
        padding: 0 20px;
        border-left: 1px solid #e4e7eb;
    }

    span {
        color: #9299a3;
        font-size: 11px;
    }

    strong {
        overflow: hidden;
        color: #3a4048;
        font-size: 12px;
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__total {
        align-items: flex-end;
        padding-left: 20px;
        border-left: 1px solid #e4e7eb;

        strong {
            color: #3977bd;
            font-size: 19px;
            line-height: 1;
        }
    }
}

.demands-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.demands-toolbar {
    display: flex;
    flex-direction: column;
    gap: 13px;
}

.demands-title {
    display: flex;
    align-items: baseline;
    gap: 10px;

    h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 650;
    }

    span {
        color: #9299a3;
        font-size: 11px;
    }
}

.filters {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.filter-group {
    display: flex;
    align-items: flex-start;
    gap: 14px;
}

.filter-label {
    width: 85px;
    flex-shrink: 0;
    padding-top: 7px;
    color: #9299a3;
    font-size: 11px;
    font-weight: 600;
}

.type-filter {
    display: flex;
    flex: 1;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;

    &__button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        min-height: 30px;
        padding: 5px 11px;
        border: 1px solid #e6e9ed;
        border-radius: 6px;
        background: #fff;
        color: #646c76;
        font-family: inherit;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition:
            background 0.18s ease,
            color 0.18s ease,
            border-color 0.18s ease,
            box-shadow 0.18s ease;

        span {
            min-width: 17px;
            padding: 1px 4px;
            border-radius: 4px;
            background: #f0f2f5;
            color: #7c8590;
            font-size: 10px;
            text-align: center;
            transition: inherit;
        }

        &:hover {
            border-color: #b9cce0;
            background: #f7faff;
            color: #3977bd;
        }

        &--active {
            border-color: #3977bd;
            background: #3977bd;
            color: #fff;
            box-shadow: 0 2px 5px rgb(57 119 189 / 15%);

            span {
                background: rgb(255 255 255 / 18%);
                color: #fff;
            }

            &:hover {
                border-color: #326ba9;
                background: #326ba9;
                color: #fff;
            }
        }
    }
}

.demands-list {
    display: grid;
    grid-template-columns: repeat(
        auto-fill,
        minmax(min(100%, 390px), 1fr)
    );
    gap: 12px;
}

.start-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 24px;
    text-align: center;
    user-select: none;

    &__icon {
        display: grid;
        place-items: center;
        width: 46px;
        height: 46px;
        margin-bottom: 13px;
        border-radius: 12px;
        background: #f0f4f9;
        color: #5686bb;
        font-size: 29px;
        line-height: 1;
    }

    strong {
        color: #414852;
        font-size: 13px;
        font-weight: 600;
    }

    > span {
        margin-top: 5px;
        color: #9299a3;
        font-size: 11px;
    }
}

.empty-state {
    padding: 50px 0;
    margin-top: 50px;
}

@media (max-width: 760px) {
    .page-header {
        align-items: stretch;
        flex-direction: column;
        gap: 14px;
    }

    .search-field {
        width: 100%;
    }

    .client-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;

        &__name,
        &__item,
        &__total {
            padding: 0;
            border: 0;
            align-items: flex-start;
        }
    }
}

@media (max-width: 600px) {
    .filter-group {
        flex-direction: column;
        gap: 7px;
    }

    .filter-label {
        width: auto;
        padding-top: 0;
    }
}

@media (max-width: 480px) {
    .client-demands-page {
        padding: 15px 12px 22px;
    }

    .demands-title {
        flex-wrap: wrap;
    }

    .demands-list {
        grid-template-columns: 1fr;
    }
}
</style>
