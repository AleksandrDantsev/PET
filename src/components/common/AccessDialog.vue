
<script setup lang="ts">
import { ref } from "vue";
import {
    NButton,
    NInput,
    NRadio,
    NRadioGroup,
    NAlert,
} from "naive-ui";

export type Department = "procurement" | "sales";

const props = defineProps<{
    error?: string;
    loading?: boolean;
}>();

const emit = defineEmits<{
    submit: [credentials: {
        department: Department;
        password: string;
    }];
}>();

const department = ref<Department>("procurement");
const password = ref("");

const handleSubmit = () => {
    if (!password.value.trim()) return;

    emit("submit", {
        department: department.value,
        password: password.value,
    });
};
</script>

<template>
    <div class="access-overlay">
        <div class="access-card">
            <div class="access-header">
                <div class="access-icon">
                    <span>🔐</span>
                </div>

                <h2>Авторизация</h2>

                <p>
                    Выберите свой отдел и введите пароль
                    для доступа к приложению
                </p>
            </div>

            <form
                class="access-form"
                @submit.prevent="handleSubmit"
            >
                <div class="form-group">
                    <label>Ваш отдел</label>

                    <NRadioGroup
                        v-model:value="department"
                        class="department-options"
                    >
                        <NRadio value="procurement">
                            <span class="department-label">
                                Отдел закупки
                            </span>
                        </NRadio>

                        <NRadio value="sales">
                            <span class="department-label">
                                Отдел продаж
                            </span>
                        </NRadio>
                    </NRadioGroup>
                </div>

                <div class="form-group">
                    <label for="access-password">
                        Пароль
                    </label>

                    <NInput
                        id="access-password"
                        v-model:value="password"
                        type="password"
                        show-password-on="click"
                        placeholder="Введите пароль"
                        size="large"
                        autofocus
                        @keyup.enter="handleSubmit"
                    />
                </div>

                <NAlert
                    v-if="props.error"
                    type="error"
                    :show-icon="true"
                >
                    {{ props.error }}
                </NAlert>

                <NButton
                    attr-type="submit"
                    type="primary"
                    size="large"
                    block
                    :loading="props.loading"
                    :disabled="!password.trim()"
                >
                    Войти
                </NButton>
            </form>

            <div class="access-footer">
                Внутренняя система
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.access-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: #00000070;
    backdrop-filter: blur(4px);
}

.access-card {
    width: 100%;
    max-width: 390px;
    padding: 30px;
    border: 1px solid #e8e8e8;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 15px 50px #00000020;
}

.access-header {
    margin-bottom: 28px;
    text-align: center;

    h2 {
        margin: 12px 0 7px;
        color: #222;
        font-size: 21px;
        font-weight: 600;
    }

    p {
        margin: 0;
        color: #858585;
        font-size: 12px;
        line-height: 1.5;
    }
}

.access-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 54px;
    height: 54px;
    margin: 0 auto;
    border-radius: 50%;
    background: #edf3fb;
    font-size: 24px;
}

.access-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 10px;

    > label {
        color: #444;
        font-size: 12px;
        font-weight: 600;
    }
}

.department-options {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 5px 0;
}

.department-label {
    color: #444;
    font-size: 13px;
}

.access-footer {
    margin-top: 24px;
    color: #aaa;
    font-size: 10px;
    text-align: center;
}
</style>
