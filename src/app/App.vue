<script setup lang="ts">
import { provideAccess } from "@/composables/useAcces";
import { computed } from "vue";
import { RouterView } from "vue-router";

import { useAppAuthorization } from "@/composables/useAppAuthorization";
import { useAppReload } from "@/composables/useAppReload";

import {
    NConfigProvider,
    NMessageProvider,
    NNotificationProvider,
    NGlobalStyle,
    ruRU,
} from "naive-ui";

import { themeOverrides } from "@/theme/naiveTheme";

const { authorizedDepartment } = useAppAuthorization();

provideAccess(
    computed(() => authorizedDepartment.value ?? "procurement"),
);

useAppReload();
</script>

<template>
    <n-config-provider
        :theme-overrides="themeOverrides"
        :locale="ruRU"
    >
        <n-notification-provider placement="bottom-right">
            <n-message-provider
                to="body"
                :container-style="{ zIndex: 99999999 }"
            >
                <n-global-style />

                <RouterView />
            </n-message-provider>
        </n-notification-provider>
    </n-config-provider>
</template>
<style lang="scss">
* {
    font-family: Inter,
    "Segoe UI",
    "Roboto",
    Helvetica,
    Arial,
    sans-serif;
}

body {
    font-variant-numeric: tabular-nums;
    scrollbar-gutter: stable;
}

$minWidthTooltip: 500px;

.n-tooltip {
    max-width: min($minWidthTooltip, calc(100vw - 24px)) !important;
    box-sizing: border-box;
    font-size: 12px !important;
    white-space: pre-line !important;
    overflow-wrap: anywhere !important;
    word-break: break-word;
    line-height: 1.4;
}

.n-popconfirm .n-popconfirm__content {
    font-size: 11px;
}

.n-popconfirm .n-popconfirm__action {
    margin-top: 6px;
    gap: 4px;
}

.n-popconfirm .n-button {
    height: 22px;
    min-height: 22px;
    padding: 0 7px;
    font-size: 12px;
}

::selection {
    background-color: #27830d70;
    color: white;
}
</style>