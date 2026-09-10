<script setup>
const props = defineProps({
    result: {
        type: Object,
        required: true
    },
    index: {
        type: Number,
        required: true
    },
    nomenclature: {
        type: String,
        default: ""
    },
    nomenclatureColor: {
        type: String,
        default: ""
    },
    hardness: {
        type: [String, Number],
        default: ""
    },
    hardnessColor: {
        type: String,
        default: ""
    },
    days: {
        type: [String, Number],
        default: ""
    },
    daysText: {
        type: String,
        default: "дней"
    },
    cost: {
        type: [String, Number],
        default: "-"
    }
});
</script>

<template>
    <div class="interchangeable-unit">
        <div class="interchangeable-unit-counter">
            <span>{{ index + 1 }}</span>
        </div>

        <div
            class="interchangeable-unit-color"
            :style="{ backgroundColor: nomenclatureColor }"
        ></div>

        <div class="interchangeable-unit-container">
            <div class="interchangeable-unit-nomenclature">
                {{ result["Номенклатура 1С"] }}
            </div>

            <div class="interchangeable-unit-desc-conteiner">
                <div>
                    <span class="subtitle">Личный номер:</span>
                    {{ result["Личный номер"] }}
                </div>

                <div>
                    <span class="subtitle">Филиал:</span>
                    {{ result["Филиал"] }}
                </div>

                <div>
                    <span class="subtitle">Менеджер:</span>
                    {{ result["Ответственный за продажу"] }}
                </div>

                <div>
                    <span class="subtitle">Клиент:</span>
                    {{ result["Какому клиенту планируется продажа"] }}
                </div>

                <div>
                    <span class="subtitle">Стоимость:</span>
                    {{ result["Стоимость недопроданного товара"] }} р.
                </div>

                <div>
                    <span class="subtitle">Жесткость:</span>

                    <!-- <span
                        :style="{
                            color: hardnessColor,
                            fontWeight: 'bold'
                        }"
                    >
                        {{ hardness }}
                        ({{ days }} {{ daysText }})
                    </span> -->
                </div>

                <div class="interchangeable-unit-leftover">
                    <span class="subtitle">Остатки:</span>
                    {{ result["Все остатки из 1С"] }}
                </div>
            </div>

            <div class="interchangeable-unit-comment">
                <div class="subtitle">
                    Комментарий:
                </div>

                <textarea
                    class="interchangeable-unit-comment-input"
                    placeholder="Введите комментарий..."
                />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">

/* =========================================================
   CARD
========================================================= */

.interchangeable-unit {
    --ink: #252421;
    --ink-soft: #4d4a44;
    --muted: #96928a;

    --line: #e8e5df;
    --line-strong: #d9d5cd;

    --paper: #ffffff;
    --paper-soft: #faf9f6;

    position: relative;

    display: flex;
    align-items: flex-start;

    width: 100%;
    box-sizing: border-box;

    padding: 20px 22px;

    color: var(--ink);

    background:
        linear-gradient(
            135deg,
            #ffffff 0%,
            #fdfcf9 100%
        );

    border: 1px solid rgba(31, 31, 31, 0.09);
    border-radius: 14px;

    box-shadow:
        0 5px 18px rgba(20, 19, 17, 0.035),
        0 1px 3px rgba(20, 19, 17, 0.025);

    overflow: hidden;

    opacity: 0;

    transform: translateY(12px);

    animation:
        luxuryCardIn
        0.5s
        cubic-bezier(0.22, 1, 0.36, 1)
        forwards;

    animation-delay: var(--animation-delay);

    transition:
        border-color 0.25s ease,
        box-shadow 0.25s ease,
        transform 0.25s ease;


    /* -----------------------------------------------------
       Цветовой акцент слева
    ----------------------------------------------------- */

    &::before {
        content: "";

        position: absolute;

        top: 18px;
        bottom: 18px;
        left: 0;

        width: 2px;

        background: v-bind(nomenclatureColor);

        opacity: 0.75;

        border-radius: 0 2px 2px 0;
    }


    /* -----------------------------------------------------
       Верхняя тонкая линия
    ----------------------------------------------------- */

    &::after {
        content: "";

        position: absolute;

        top: 0;
        left: 42px;
        right: 42px;

        height: 1px;

        background: linear-gradient(
            90deg,
            transparent,
            rgba(30, 30, 30, 0.08),
            transparent
        );
    }


    /* -----------------------------------------------------
       Hover
    ----------------------------------------------------- */

    /* =====================================================
       COUNTER
    ===================================================== */

    &-counter {
        display: flex;
        align-items: center;
        justify-content: center;

        flex: 0 0 30px;

        width: 30px;
        height: 30px;

        margin: 1px 14px 0 1px;

        color: #77736c;

        font-size: 9px;
        font-weight: 600;

        letter-spacing: 0.04em;

        background: #faf9f6;

        border: 1px solid var(--line);

        border-radius: 50%;

        transition:
            border-color 0.2s ease,
            color 0.2s ease,
            background 0.2s ease;
    }

    &:hover &-counter {
        color: #33312d;

        border-color: var(--line-strong);

        background: #f6f5f1;
    }


    /* =====================================================
       COLOR DOT
    ===================================================== */

    &-color {
        flex: 0 0 9px;

        width: 9px;
        height: 9px;

        margin: 10px 15px 0 0;

        border-radius: 50%;

        box-shadow:
            0 0 0 3px
            color-mix(
                in srgb,
                v-bind(nomenclatureColor) 11%,
                transparent
            );

        transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
    }

    &:hover &-color {
        transform: scale(1.15);

        box-shadow:
            0 0 0 4px
            color-mix(
                in srgb,
                v-bind(nomenclatureColor) 13%,
                transparent
            );
    }


    /* =====================================================
       MAIN CONTAINER
    ===================================================== */

    &-container {
        flex: 1;

        min-width: 0;
    }


    /* =====================================================
       NOMENCLATURE
    ===================================================== */

    &-nomenclature {
        margin: 0 0 15px !important;

        color: var(--ink);

        font-size: 17px;
        line-height: 1.3;

        font-weight: 600;

        letter-spacing: -0.02em;

        overflow-wrap: anywhere;
    }


    /* =====================================================
       INFORMATION
    ===================================================== */

    &-desc-conteiner {
        display: flex;
        flex-direction: column;

        margin: 0 !important;

        border-top: 1px solid var(--line);

        > div {
            display: flex;
            align-items: baseline;

            min-width: 0;

            margin: 0;

            padding: 9px 3px;

            color: var(--ink-soft);

            font-size: 12px;
            line-height: 1.4;



            overflow-wrap: anywhere;

            transition:
                background 0.15s ease,
                padding-left 0.15s ease;
        }
    }


    /* =====================================================
       LEFTOVER
    ===================================================== */

    &-leftover {
        color: var(--ink) !important;

        font-weight: 600;

        background: #faf9f6;

        &:hover {
            background: #f5f3ee !important;
        }
    }


    /* =====================================================
       COMMENT
    ===================================================== */

    &-comment {
        margin-top: 16px !important;

        padding-top: 14px;

        border-top: 1px solid var(--line-strong);
    }


    &-comment-input {
        display: block;

        width: 100%;
        min-height: 64px;

        margin-top: 8px;

        padding: 10px 11px;

        box-sizing: border-box;

        color: var(--ink);

        font-family: inherit;

        font-size: 12px;
        line-height: 1.5;

        background: #faf9f6;

        border: 1px solid var(--line);

        border-radius: 8px;

        outline: none;

        resize: vertical;

        transition:
            background 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;

        &::placeholder {
            color: #aaa69e;
        }

        &:hover {
            background: #fff;

            border-color: #d8d4cc;
        }

        &:focus {
            background: #fff;

            border-color: #9e9a92;

            box-shadow:
                0 0 0 3px rgba(30, 30, 30, 0.035);
        }
    }
}


/* =========================================================
   SUBTITLES
========================================================= */

.subtitle {
    flex: 0 0 145px;

    display: inline-block;

    margin: 0;

    color: var(--muted);

    font-size: 8px;
    line-height: 1.25;

    font-weight: 600;

    text-transform: uppercase;

    letter-spacing: 0.11em;

    white-space: nowrap;
}


/* =========================================================
   ANIMATION
========================================================= */

@keyframes luxuryCardIn {
    from {
        opacity: 0;

        transform:
            translateY(12px)
            scale(0.995);
    }

    to {
        opacity: 1;

        transform:
            translateY(0)
            scale(1);
    }
}


/* =========================================================
   TABLET
========================================================= */

@media (max-width: 800px) {

    .interchangeable-unit {
        padding: 17px 18px;

        &-nomenclature {
            font-size: 16px;
        }

        &-desc-conteiner {

            > div {
                padding: 8px 2px;
            }
        }

        .subtitle {
            flex-basis: 125px;
        }
    }
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 500px) {

    .interchangeable-unit {
        padding: 15px 14px 16px;

        border-radius: 12px;


        &::before {
            top: 12px;
            bottom: 12px;
        }


        &::after {
            left: 25px;
            right: 25px;
        }


        /* -----------------------------------------------
           Counter
        ----------------------------------------------- */

        &-counter {
            flex-basis: 26px;

            width: 26px;
            height: 26px;

            margin-right: 9px;

            font-size: 8px;
        }


        /* -----------------------------------------------
           Color
        ----------------------------------------------- */

        &-color {
            display: none;
        }


        /* -----------------------------------------------
           Name
        ----------------------------------------------- */

        &-nomenclature {
            margin-bottom: 12px !important;

            font-size: 15px;

            line-height: 1.3;
        }


        /* -----------------------------------------------
           Information
        ----------------------------------------------- */

        &-desc-conteiner {

            > div {
                display: block;

                padding: 7px 1px;

                font-size: 11px;

                line-height: 1.45;

                &:hover {
                    padding-left: 1px;
                }
            }
        }


        /* -----------------------------------------------
           Comment
        ----------------------------------------------- */

        &-comment {
            margin-top: 13px !important;

            padding-top: 12px;
        }


        &-comment-input {
            min-height: 58px;

            padding: 9px;

            font-size: 11px;
        }


        /* -----------------------------------------------
           Labels
        ----------------------------------------------- */

        .subtitle {
            display: block;

            margin-bottom: 3px;

            font-size: 7px;

            letter-spacing: 0.1em;
        }
    }
}


/* =========================================================
   REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {

    .interchangeable-unit {
        opacity: 1;

        transform: none;

        animation: none;

        transition: none;

        &-color,
        &-counter,
        &-desc-conteiner > div {
            transition: none;
        }
    }
}

</style>
