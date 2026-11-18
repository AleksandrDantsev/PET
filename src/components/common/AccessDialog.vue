<script setup lang="ts">
import { computed, ref } from "vue";
import {
    NButton,
    NRadio,
    NRadioGroup,
    NAlert,
} from "naive-ui";


export type Department = "procurement" | "sales";

interface DepartmentOption {
    key: Department;
    label: string;
    iconPath: string;
}

interface Credentials {
    department: Department;
    pinCode: string;
}


const PIN_LENGTH = 4;

const DEPARTMENT_OPTIONS: DepartmentOption[] = [
    {
        key: "procurement",
        label: "Отдел закупок",
        iconPath:
            "M4 7H20V20H4V7Z M8 7V4H16V7 M4 11H20 M9 11V13H15V11",
    },
    {
        key: "sales",
        label: "Отдел продаж",
        iconPath:
            "M4 19V12 M10 19V5 M16 19V9 M22 19V3 M2 21H22",
    },
];

const CHECK_ICON_PATH = "M3 8L6.5 11.5L13 4.5";

const props = defineProps<{
    error?: string;
    loading?: boolean;
}>();

const emit = defineEmits<{
    submit: [credentials: Credentials];
}>();

const department = ref<Department>("procurement");

const pin = ref<string[]>(Array(PIN_LENGTH).fill(""));

const pinInputs = ref<(HTMLInputElement | null)[]>(
    Array(PIN_LENGTH).fill(null),
);

const pinCode = computed(() => pin.value.join(""));

const isPinComplete = computed(
    () => pinCode.value.length === PIN_LENGTH,
);


const focusPinInput = (index: number) => {
    pinInputs.value[index]?.focus();
};

const setPinInputRef = (
    element: Element | null,
    index: number,
) => {
    pinInputs.value[index] =
        element instanceof HTMLInputElement ? element : null;
};

const setPinDigits = (value: string, startIndex: number) => {
    const digits = value
        .replace(/\D/g, "")
        .slice(0, PIN_LENGTH - startIndex);

    [...digits].forEach((digit, offset) => {
        pin.value[startIndex + offset] = digit;
    });

    return digits.length;
};


const handlePinInput = (event: Event, index: number) => {
    const target = event.target as HTMLInputElement;
    const digit = target.value.replace(/\D/g, "").slice(-1);

    pin.value[index] = digit;
    target.value = digit;

    if (digit && index < PIN_LENGTH - 1) {
        focusPinInput(index + 1);
    }
};

const handlePinKeydown = (
    event: KeyboardEvent,
    index: number,
) => {
    if (event.key === "Backspace") {
        if (!pin.value[index] && index > 0) {
            pin.value[index - 1] = "";
            focusPinInput(index - 1);
        }

        return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
        event.preventDefault();
        focusPinInput(index - 1);
        return;
    }

    if (event.key === "ArrowRight" && index < PIN_LENGTH - 1) {
        event.preventDefault();
        focusPinInput(index + 1);
    }
};

const handlePinPaste = (
    event: ClipboardEvent,
    index: number,
) => {
    event.preventDefault();

    const pastedText = event.clipboardData?.getData("text") ?? "";
    const insertedCount = setPinDigits(pastedText, index);

    if (insertedCount > 0) {
        const nextIndex = Math.min(
            index + insertedCount,
            PIN_LENGTH - 1,
        );

        focusPinInput(nextIndex);
    }
};

const handleSubmit = () => {
    if (!isPinComplete.value || props.loading) return;

    emit("submit", {
        department: department.value,
        pinCode: pinCode.value,
    });
};
</script>
<template>
    <div class="access-overlay">
        <div class="access-background">
            <div class="background-grid" />
            <div class="background-glow background-glow--one" />
            <div class="background-glow background-glow--two" />
        </div>

        <section class="access-card">
            <header class="access-header">
                <div class="brand-mark">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M4 7.5L12 3L20 7.5V16.5L12 21L4 16.5V7.5Z"
                            stroke="currentColor"
                            stroke-width="1.6"
                            stroke-linejoin="round"
                        />
                        <path
                            d="M4.5 7.5L12 12L19.5 7.5M12 12V20.5"
                            stroke="currentColor"
                            stroke-width="1.6"
                            stroke-linejoin="round"
                        />
                    </svg>
                </div>

                <h1>Добро пожаловать</h1>

                <p class="access-description">
                    Войдите в систему, чтобы продолжить работу
                </p>
            </header>

            <form
                class="access-form"
                @submit.prevent="handleSubmit"
            >
                <div class="form-section">
                    <div class="section-heading">
                        <span class="section-number">01</span>
                        <label>Выберите подразделение</label>
                    </div>

                    <NRadioGroup
                        v-model:value="department"
                        class="department-options"
                    >
                        <label
                            v-for="option in DEPARTMENT_OPTIONS"
                            :key="option.key"
                            class="department-option"
                            :class="{
                                'department-option--active':
                                    department === option.key,
                            }"
                        >
                            <NRadio :value="option.key">
                                <span class="radio-placeholder" />
                            </NRadio>

                            <span class="department-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <path
                                        :d="option.iconPath"
                                        stroke="currentColor"
                                        stroke-width="1.6"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            </span>

                            <span class="department-info">
                                <span class="department-title">
                                    {{ option.label }}
                                </span>
                            </span>

                            <span class="option-check">
                                <svg
                                    viewBox="0 0 16 16"
                                    fill="none"
                                >
                                    <path
                                        :d="CHECK_ICON_PATH"
                                        stroke="currentColor"
                                        stroke-width="1.8"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            </span>
                        </label>
                    </NRadioGroup>
                </div>

                <div class="form-section pin-section">
                    <div class="section-heading">
                        <span class="section-number">02</span>
                        <label>PIN-код доступа</label>
                    </div>

                    <div class="pin-inputs">
                        <input
                            v-for="(_, index) in pin"
                            :key="index"
                            :ref="(element) =>
                                setPinInputRef(element as Element | null, index)
                            "
                            :value="pin[index]"
                            type="text"
                            inputmode="numeric"
                            autocomplete="one-time-code"
                            maxlength="1"
                            pattern="[0-9]*"
                            class="pin-input"
                            :aria-label="`Цифра ${index + 1} PIN-кода`"
                            :disabled="props.loading"
                            :autofocus="index === 0"
                            @input="handlePinInput($event, index)"
                            @keydown="handlePinKeydown($event, index)"
                            @paste="handlePinPaste($event, index)"
                        />
                    </div>
                </div>
                <NAlert
                    v-if="props.error"
                    type="error"
                    :show-icon="true"
                    class="access-error"
                >
                    {{ props.error }}
                </NAlert>
                <NButton
                    attr-type="submit"
                    type="primary"
                    size="large"
                    block
                    :loading="props.loading"
                    :disabled="!isPinComplete"
                    class="submit-button"
                >
                    <span>Войти в систему</span>

                    <template #icon>
                        <svg 
                            viewBox="0 0 24 24" 
                            fill="none"
                        >
                            <path
                                d="M5 12H19M12 5L19 12L12 19"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </template>
                </NButton>
            </form>

            <footer class="access-footer">
                <span class="status-indicator" />
                <span>
                    Система поиска взаимозаменяемых позиций
                </span>
            </footer>
        </section>
    </div>
</template>


<style scoped lang="scss">
.access-overlay {
    --accent: #426b9a;
    --accent-dark: #34577f;
    --text-primary: #263445;
    --text-secondary: #8491a1;
    --border: #e6ebf1;

    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
    padding: 16px;
    background: #f2f5f9;
    font-family: inherit;
}

.access-background {
    position: fixed;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
}

.background-grid {
    position: absolute;
    inset: 0;
    opacity: 0.32;
    background-image:
        linear-gradient(#dce4ee 1px, transparent 1px),
        linear-gradient(90deg, #dce4ee 1px, transparent 1px);
    background-size: 42px 42px;
    mask-image: linear-gradient(to bottom, black, transparent 85%);
}

.background-glow {
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.35;

    &--one {
        top: -300px;
        left: -150px;
        background: #b9d0e9;
    }

    &--two {
        right: -200px;
        bottom: -300px;
        background: #c7d9e9;
    }
}

.access-card {
    position: relative;
    width: 100%;
    max-width: 410px;
    margin: auto;
    padding: 29px 34px 21px;
    border: 1px solid rgba(222, 230, 239, 0.9);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.96);
    box-shadow:
        0 24px 70px rgba(38, 57, 82, 0.09),
        0 3px 10px rgba(38, 57, 82, 0.035);
    animation: card-appear 0.45s ease-out both;
}

.access-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 25px;
    text-align: center;
}

.brand-mark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 49px;
    height: 49px;
    margin-bottom: 11px;
    border: 1px solid #dce7f3;
    border-radius: 12px;
    color: var(--accent);
    background: #f0f5fb;

    svg {
        width: 27px;
        height: 27px;
    }
}

.access-header h1 {
    margin: 0;
    color: var(--text-primary);
    font-size: 22px;
    font-weight: 650;
    letter-spacing: -0.8px;
}

.access-description {
    margin: 7px 0 0;
    color: var(--text-secondary);
    font-size: 12px;
    line-height: 1.5;
}

.access-form {
    display: flex;
    flex-direction: column;
    gap: 21px;
}

.form-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.section-heading {
    display: flex;
    align-items: center;
    gap: 9px;

    label {
        color: #4a5869;
        font-size: 13px;
        font-weight: 650;
    }
}

.section-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 23px;
    height: 23px;
    border-radius: 6px;
    color: #6684a7;
    background: #eef3f9;
    font-size: 11px;
    font-weight: 700;
}

.department-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
}

.department-option {
    position: relative;
    display: flex;
    align-items: center;
    gap: 11px;
    min-height: 63px;
    padding: 9px 12px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: #fff;
    cursor: pointer;
    transition:
        border-color 0.2s ease,
        background 0.2s ease,
        box-shadow 0.2s ease;

    &:hover {
        border-color: #c5d4e5;
        background: #fafcff;
    }

    :deep(.n-radio) {
        flex-shrink: 0;
    }

    &--active {
        border-color: #8ba8c9;
        background: #f5f8fc;
        box-shadow: 0 0 0 2px rgba(66, 107, 154, 0.07);

        .department-icon {
            color: var(--accent);
            background: #e7eff8;
        }

        .option-check {
            opacity: 1;
            transform: scale(1);
        }
    }
}

.department-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: 9px;
    color: #7e8fa3;
    background: #f1f4f7;
    transition: 0.2s ease;

    svg {
        width: 19px;
        height: 19px;
    }
}

.department-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}

.department-title {
    color: #344255;
    font-size: 12px;
    font-weight: 650;
}

.department-subtitle {
    color: #98a3b1;
    font-size: 10px;
}

.option-check {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 19px;
    height: 19px;
    margin-left: auto;
    border-radius: 50%;
    color: white;
    background: var(--accent);
    opacity: 0;
    transform: scale(0.7);
    transition: 0.2s ease;

    svg {
        width: 13px;
        height: 13px;
    }
}

/* PIN */

.pin-inputs {
    display: flex;
    justify-content: center;
    gap: 13px;
    width: 100%;
    padding: 5px 0;
}

.pin-input {
    box-sizing: border-box;
    width: 56px;
    height: 56px;
    border: 1px solid #dfe6ee;
    border-radius: 11px;
    outline: none;
    background: #fafbfd;
    color: #263445;
    font-family: inherit;
    font-size: 23px;
    font-weight: 650;
    text-align: center;
    caret-color: var(--accent);
    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        background 0.2s ease;

    &:hover:not(:disabled) {
        border-color: #b7c9de;
    }

    &:focus {
        border-color: var(--accent);
        background: #fff;
        box-shadow: 0 0 0 3px #426b9a1a;
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.65;
    }
}

.access-error {
    margin-top: -9px;
    border-radius: 8px;
}

.submit-button {
    height: 43px;
    margin-top: -3px;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.1px;
    background: var(--accent);
    box-shadow: 0 4px 12px #426b9a2e;
    transition:
        background 0.2s ease,
        box-shadow 0.2s ease,
        transform 0.2s ease;

    &:hover {
        background: var(--accent-dark);
        box-shadow: 0 6px 16px #426b9a3d;
    }

    &:active {
        transform: translateY(1px);
    }

    :deep(.n-button__content) {
        gap: 9px;
    }

    :deep(.n-button__icon) {
        margin-left: 2px;
    }

    svg {
        width: 17px;
        height: 17px;
    }
}

.access-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 21px;
    padding-top: 16px;
    border-top: 1px solid #edf0f4;
    color: #a0aab6;
    font-size: 10px;
}

.status-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #69b58c;
    box-shadow: 0 0 0 3px #69b58c1f;
}

@keyframes card-appear {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-height: 700px) {
    .access-overlay {
        align-items: flex-start;
        padding-top: 12px;
        padding-bottom: 12px;
    }

    .access-card {
        padding-top: 22px;
        padding-bottom: 17px;
    }

    .access-header {
        margin-bottom: 18px;
    }

    .brand-mark {
        width: 42px;
        height: 42px;
        margin-bottom: 8px;

        svg {
            width: 24px;
            height: 24px;
        }
    }

    .access-form {
        gap: 16px;
    }

    .department-option {
        min-height: 56px;
    }

    .access-footer {
        margin-top: 15px;
        padding-top: 12px;
    }
}

@media (max-width: 480px) {
    .access-overlay {
        padding: 18px 14px;
    }

    .access-card {
        padding: 24px 20px 18px;
        border-radius: 13px;
    }

    .access-header h1 {
        font-size: 21px;
    }

    .pin-inputs {
        gap: 10px;
    }

    .pin-input {
        width: 54px;
        height: 54px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .access-card {
        animation: none;
    }

    *,
    *::before,
    *::after {
        transition-duration: 0.01ms !important;
    }
}
</style>
