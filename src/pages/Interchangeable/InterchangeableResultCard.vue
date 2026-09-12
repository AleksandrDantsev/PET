<script setup>
import { computed } from 'vue';
import { 
    getHardnessColor, 
    setDaysText, 
    getProductColor 
} from '@/utils/tableHelpers';


const props = defineProps({
    result: {
        type: Object,
        required: true
    },
    index: {
        type: Number,
        required: true
    }
});

const hardnessDaysForm = computed(() => setDaysText(props.result["Кол-во дней с даты привоза"]));
const hardnessColor = computed(() => getHardnessColor(props.result["Кол-во дней с даты привоза"]));
const productColor = computed(() => getProductColor(props.result["Номенклатура 1С"]));


</script>

<template>
    <div class="interchangeable-unit">
        <div class="counter-color">
            <div class="interchangeable-unit-counter">
                <span>{{ index + 1 }}</span>
            </div>
    
            <div
                class="interchangeable-unit-color"
                :style="{ backgroundColor: productColor }"
            />
        </div>
        <div class="interchangeable-unit-container">
            <div class="interchangeable-unit-nomenclature">
                {{ result["Номенклатура 1С"] || "-"}}
            </div>

            <div class="interchangeable-unit-desc-conteiner">
                <div class="subtitle-conteiner">
                    <span class="subtitle">Филиал:</span>
                    {{ result["Филиал"] || "-" }}
                </div>

                <div class="subtitle-conteiner">
                    <span class="subtitle">Менеджер:</span>
                    {{ result["Ответственный за продажу"] || "-" }}
                </div>

                <div class="subtitle-conteiner">
                    <span class="subtitle">Клиент:</span>
                    {{ result["Какому клиенту планируется продажа"] || "-"}}
                </div>

                <div class="subtitle-conteiner">
                    <span class="subtitle">Стоимость:</span>
                    {{ result["Стоимость недопроданного товара"] || "-" }} р.
                </div>

                <div class="subtitle-conteiner">
                    <span class="subtitle">Жесткость:</span>
                    <span
                        :style="{
                            color: hardnessColor,
                            fontWeight: 'bold'
                        }"
                    >
                        {{ result["Жесткость"] }}
                        ({{ result["Кол-во дней с даты привоза"] }} {{ hardnessDaysForm }})
                    </span>
                </div>

                <div class="interchangeable-unit-leftover">
                    <span class="subtitle">Остатки:</span>
                    {{ result["Все остатки из 1С"] || "-" }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.interchangeable-unit {
    display: flex;
    width: 100%;
    min-width: 0;
    min-height: 52px;
    padding: 12px;
    box-sizing: border-box;
    background: #fff;
    border-bottom: 1px solid #e4e2dc;
    border-radius: 4px;
    transition:
        border-color 0.15s ease,
        background 0.15s ease,
        box-shadow 0.15s ease;

    &:hover {
        background: #fcfcfa;
        border-color: #d3d0c8;
        box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.035);
    }
}

.counter-color {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    flex: 0 0 34px;
    width: 34px;
    padding-top: 2px;
    margin-right: 15px;
    box-sizing: border-box;
}

.interchangeable-unit-counter {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    color: #85827b;
    font-size: 9px;
    font-weight: 600;
    background: #f6f5f1;
    border: 1px solid #e4e2dc;
    border-radius: 4px;
}

.interchangeable-unit-color {
    width: 9px;
    height: 8px;
    margin-top: 8px;
    border-radius: 50%;
}


.interchangeable-unit-container {
    flex: 1;
    min-width: 0;
}

.interchangeable-unit-nomenclature {
    width: 100%;
    margin-bottom: 7px;
    color: #292824;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.interchangeable-unit-desc-conteiner {
    display: grid;
    grid-template-columns:
        repeat(3, minmax(0, 1fr));

    grid-template-rows:
        repeat(2, minmax(0, auto));

    column-gap: 18px;
    row-gap: 5px;
    width: 100%;
    min-width: 0;
    font-size: 11px;
}

.interchangeable-unit-desc-conteiner > div {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.subtitle {
    margin-right: 4px;
    color: #929088;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.subtitle-conteiner {
    font-size: 11px;
}

.value {
    color: #46443f;
    font-size: 10px;
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.interchangeable-unit-leftover {
    color: #34332f;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

@media (max-width: 800px) {
    .interchangeable-unit {
        min-height: 76px;
    }

    .interchangeable-unit-desc-conteiner {
        column-gap: 10px;
    }

}


@media (max-width: 600px) {

    .interchangeable-unit {
        min-height: auto;
        padding: 8px;
    }

    .interchangeable-unit-desc-conteiner {
        grid-template-columns:
            repeat(2, minmax(0, 1fr));
    }

    .interchangeable-unit-leftover {
        margin-top: 6px;
    }

}

@media (max-width: 400px) {

    .interchangeable-unit-desc-conteiner {
        grid-template-columns: 1fr;
    }

}

</style>