<script setup lang="ts">
import { useRouter } from "vue-router";
import AccessDialog from "@/components/common/AccessDialog.vue";
import { useAppAuthorization } from "@/composables/useAppAuthorization";
import type { Department } from "@/configs/permissions";

const router = useRouter();

const {
    authError,
    handleAuthorization,
} = useAppAuthorization();

function handleLogin(credentials: {
    department: Department;
    pinCode: string;
}) {
    if (!handleAuthorization(credentials)) return;

    void router.replace({ name: "app" });
}
</script>

<template>
    <AccessDialog
        :error="authError"
        @submit="handleLogin"
    />
</template>