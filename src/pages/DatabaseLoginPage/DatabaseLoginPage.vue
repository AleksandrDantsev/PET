
<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSupabaseAuth } from "@/composables/useSupabaseAuth";

import {
    NCard,
    NForm,
    NFormItem,
    NInput,
    NButton,
    NAlert,
} from "naive-ui";

const router = useRouter();

const { signIn, isLoading, authError } = useSupabaseAuth();

const email = ref("");
const password = ref("");

async function handleLogin() {
    const success = await signIn(
        email.value.trim(),
        password.value,
    );

    if (!success) return;

    await router.replace({ name: "access" });
}
</script>

<template>
    <div class="database-login">
        <n-card
            title="Подключение к базе данных"
            class="database-login__card"
        >
            <n-form @submit.prevent="handleLogin">
                <n-form-item label="Email">
                    <n-input
                        v-model:value="email"
                        placeholder="Введите email"
                        autocomplete="username"
                        :disabled="isLoading"
                    />
                </n-form-item>

                <n-form-item label="Пароль">
                    <n-input
                        v-model:value="password"
                        type="password"
                        show-password-on="click"
                        placeholder="Введите пароль"
                        autocomplete="current-password"
                        :disabled="isLoading"
                        @keydown.enter="handleLogin"
                    />
                </n-form-item>

                <n-alert
                    v-if="authError"
                    type="error"
                    :show-icon="true"
                    class="database-login__error"
                >
                    {{ authError }}
                </n-alert>

                <n-button
                    type="primary"
                    attr-type="submit"
                    block
                    :loading="isLoading"
                    :disabled="!email.trim() || !password"
                >
                    Войти
                </n-button>
            </n-form>
        </n-card>
    </div>
</template>

<style scoped lang="scss">
.database-login {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;

    &__card {
        width: 100%;
        max-width: 400px;
    }

    &__error {
        margin-bottom: 16px;
    }
}
</style>
