
<script setup lang="ts">
import { computed, ref } from "vue";
import {
    NButton,
    NTooltip,
    NAvatar,
    NModal,
} from "naive-ui";

import SettingsIcon from "../icons/SettingsIcon.vue";
import LogoutIcon from "../icons/LogoutIcon.vue";

export interface NavigationItem {
    label: string;
    key: string;
    icon: "home" | "table" | "file" | "chart";
}

const props = withDefaults(defineProps<{
    modelValue: boolean;
    activeKey: string;
    items: NavigationItem[];
    department?: string;
    userLabel?: string;
    userRole?: string;
}>(), {
    department: "Рабочая область",
    userLabel: "Пользователь",
    userRole: "Сотрудник системы",
});

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    navigate: [key: string];
    settings: [];
    logout: [];
}>();

const isExpanded = computed(() => props.modelValue);
const showLogoutModal = ref(false);

const toggleSidebar = () => {
    emit("update:modelValue", !isExpanded.value);
};

const navigate = (key: string) => {
    if (isExpanded.value && props.activeKey === key) {
        toggleSidebar();
        return;
    }

    emit("navigate", key);
};

const confirmLogout = () => {
    showLogoutModal.value = false;
    emit("logout");
};

const iconPaths: Record<string, string> = {
    home: "M3 10.5L12 3L21 10.5V20H14V14H10V20H3V10.5Z",
    table: "M3 4H21V20H3V4ZM3 10H21M9 4V20M15 4V20",
    file: "M6 3H14L19 8V21H6V3ZM14 3V8H19M9 13H16M9 17H16",
    chart: "M4 19V12M10 19V5M16 19V9M22 19V3M2 21H22",
    settings: "M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 0 0 12 8.5ZM19.4 13.5L21 12L19.4 10.5L19 8.5L16.9 8L15.8 6.2L13.8 6.7L12 5.5L10.2 6.7L8.2 6.2L7.1 8L5 8.5L4.6 10.5L3 12L4.6 13.5L5 15.5L7.1 16L8.2 17.8L10.2 17.3L12 18.5L13.8 17.3L15.8 17.8L16.9 16L19 15.5L19.4 13.5Z",
};

const getIconPath = (icon: string) => {
    return iconPaths[icon] ?? iconPaths.file;
};
</script>

<template>
    <div
        v-if="isExpanded"
        class="sidebar-backdrop"
        @click="toggleSidebar"
    />

    <aside
        class="app-sidebar"
        :class="{ 'app-sidebar--expanded': isExpanded }"
    >
        <!-- Header -->
        <header class="sidebar-header">
            <button
                v-if="!isExpanded"
                class="collapsed-brand"
                aria-label="Развернуть меню"
                @click="toggleSidebar"
            >
                <span class="brand-logo">
                    <svg viewBox="0 0 24 24" fill="none">
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
                </span>
            </button>

            <div v-else class="brand">
                <span class="brand-logo">
                    <svg viewBox="0 0 24 24" fill="none">
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
                </span>

                <div class="brand-info">
                    <span class="brand-title">WORKSPACE</span>
                    <span class="brand-subtitle">{{ department }}</span>
                </div>
            </div>

            <NTooltip
                v-if="isExpanded"
                placement="right"
                :z-index="20000"
            >
                <template #trigger>
                    <NButton
                        quaternary
                        circle
                        size="small"
                        class="toggle-button"
                        @click="toggleSidebar"
                    >
                        <svg viewBox="0 0 24 24" fill="none">
                            <path
                                d="M9 5L2 5V19H9M15 5H22V19H15M9 12H15M12 9L15 12L12 15"
                                stroke="currentColor"
                                stroke-width="1.6"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </NButton>
                </template>
                Свернуть меню
            </NTooltip>
        </header>

        <!-- Navigation -->
        <nav class="sidebar-navigation">
            <div v-if="isExpanded" class="navigation-caption">
                РАБОЧИЕ РАЗДЕЛЫ
            </div>

            <div class="navigation-list">
                <NTooltip
                    v-for="item in items"
                    :key="item.key"
                    placement="right"
                    :z-index="20000"
                    :disabled="isExpanded"
                >
                    <template #trigger>
                        <button
                            class="navigation-item"
                            :class="{
                                'navigation-item--active':
                                    activeKey === item.key,
                            }"
                            @click="navigate(item.key)"
                        >
                            <span class="navigation-icon">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path
                                        :d="getIconPath(item.icon)"
                                        stroke="currentColor"
                                        stroke-width="1.6"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            </span>

                            <span
                                v-if="isExpanded"
                                class="navigation-label"
                            >
                                {{ item.label }}
                            </span>

                            <span
                                v-if="activeKey === item.key && isExpanded"
                                class="active-indicator"
                            />
                        </button>
                    </template>

                    {{ item.label }}
                </NTooltip>
            </div>
        </nav>

        <!-- Footer -->
        <footer class="sidebar-footer">
            <div class="footer-actions">
                <NTooltip
                    placement="right"
                    :disabled="isExpanded"
                    :z-index="20000"
                >
                    <template #trigger>
                        <button
                            class="navigation-item"
                            @click="emit('settings')"
                        >
                            <span class="navigation-icon">
                                <SettingsIcon />
                            </span>
                            <span
                                v-if="isExpanded"
                                class="navigation-label"
                            >
                                Настройки
                            </span>
                        </button>
                    </template>
                    Настройки
                </NTooltip>
            </div>

            <div class="user-block">
                <NAvatar
                    round
                    :size="34"
                    class="user-avatar"
                >
                    {{ userLabel.charAt(0).toUpperCase() }}
                </NAvatar>

                <div v-if="isExpanded" class="user-info">
                    <span class="user-name">{{ userLabel }}</span>
                    <span class="user-role">{{ userRole }}</span>
                </div>

                <NTooltip
                    placement="right"
                    :disabled="isExpanded"
                    :z-index="20000"
                >
                    <template #trigger>
                        <button
                            class="logout-button"
                            aria-label="Выйти"
                            @click="showLogoutModal = true"
                        >
                            <LogoutIcon />
                        </button>
                    </template>
                    Выйти
                </NTooltip>
            </div>
        </footer>
    </aside>

    <!-- Модальное окно подтверждения выхода -->
    <NModal
        v-model:show="showLogoutModal"
        preset="card"
        title="Выход из системы"
        :bordered="false"
        :mask-closable="true"
        :close-on-esc="true"
        :z-index="9999999"
        :style="{
            width: '400px',
            maxWidth: 'calc(100vw - 32px)',
            borderRadius: '16px',
            padding: '10px 5px',
        }"
        size="small"
    >
        <div class="logout-modal-content">
            <div class="logout-modal-icon">
                <LogoutIcon />
            </div>

            <div class="logout-modal-text">
                <div class="logout-modal-title">
                    Вы действительно хотите выйти?
                </div>

                <div class="logout-modal-description">
                    Для продолжения работы потребуется повторная авторизация.
                </div>
            </div>
        </div>

        <template #footer>
            <div class="logout-modal-actions">
                <NButton
                    secondary
                    @click="showLogoutModal = false"
                >
                    Отмена
                </NButton>

                <NButton
                    type="error"
                    @click="confirmLogout"
                >
                    Выйти
                </NButton>
            </div>
        </template>
    </NModal>
</template>

<style scoped lang="scss">
/* Модальное окно */

.logout-modal-content {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px 10px;
}

.logout-modal-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: rgba(208, 48, 80, 0.1);
    color: #d03050;
}

.logout-modal-icon :deep(svg) {
    width: 21px;
    height: 21px;
}

.logout-modal-text {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.logout-modal-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--n-text-color);
}

.logout-modal-description {
    font-size: 13px;
    line-height: 1.5;
    color: var(--n-text-color-3);
}

.logout-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

/* Исходные стили сайдбара */

.app-sidebar {
    --sidebar-width: 60px;
    --sidebar-expanded-width: 252px;
    --sidebar-accent: #426b9a;

    position: fixed;
    z-index: 9999999;
    inset: 0 auto 0 0;

    display: flex;
    flex-direction: column;

    width: var(--sidebar-width);
    height: 100dvh;

    overflow: hidden;

    background: #fff;
    border-right: 1px solid #e8edf3;

    box-shadow: 3px 0 18px rgba(35, 52, 73, 0.035);

    transition:
        width 0.24s cubic-bezier(0.2, 0.7, 0.3, 1),
        box-shadow 0.24s ease;

    &--expanded {
        width: var(--sidebar-expanded-width);
        box-shadow: 12px 0 35px rgba(35, 52, 73, 0.11);
    }
}

.sidebar-backdrop {
    position: fixed;
    z-index: 1000;
    inset: 0;

    background: rgba(31, 43, 59, 0.13);
    animation: backdrop-appear 0.2s ease;
}

.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    height: 72px;
    min-height: 72px;
    padding: 0 8px;

    border-bottom: 1px solid #edf0f4;
}

.app-sidebar--expanded .sidebar-header {
    padding: 0 13px;
}

.collapsed-brand {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 42px;
    height: 42px;
    min-width: 42px;

    padding: 0;
    border: 0;
    border-radius: 9px;

    background: transparent;
    cursor: pointer;

    &:hover {
        background: #f4f7fb;
    }
}

.brand {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 0;
}

.brand-logo {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;

    width: 34px;
    height: 34px;

    border-radius: 9px;

    color: #426b9a;
    background: #edf3fa;

    svg {
        width: 21px;
        height: 21px;
    }
}

.brand-info,
.user-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: hidden;
    white-space: nowrap;
}

.brand-title {
    color: #344255;
    font-size: 12px;
    font-weight: 750;
    letter-spacing: 1.3px;
}

.brand-subtitle {
    color: #8996a5;
    font-size: 11px;
}

.toggle-button {
    flex-shrink: 0;
    color: #8794a4;

    svg {
        width: 19px;
        height: 19px;
    }

    &:hover {
        color: var(--sidebar-accent);
    }
}

.sidebar-navigation {
    flex: 1;
    min-height: 0;
    padding: 22px 9px;
    overflow-y: auto;
    overflow-x: hidden;
}

.navigation-caption {
    margin: 0 0 12px 9px;

    color: #9aa5b2;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    white-space: nowrap;
}

.navigation-list,
.footer-actions {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.navigation-item {
    position: relative;

    display: flex;
    align-items: center;

    width: 100%;
    height: 43px;
    min-height: 43px;
    padding: 0;

    border: 0;
    border-radius: 8px;

    color: #69788a;
    background: transparent;

    cursor: pointer;
    text-align: left;

    transition:
        background 0.18s ease,
        color 0.18s ease;

    &:hover {
        color: #426b9a;
        background: #f4f7fb;
    }

    &--active {
        color: #345b88;
        background: #edf3fa;
        font-weight: 650;

        .navigation-icon {
            color: #426b9a;
        }
    }
}

.navigation-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;

    width: 42px;
    min-width: 42px;
    height: 43px;

    svg {
        display: block;
        width: 19px;
        height: 19px;
    }
}

.app-sidebar--expanded .navigation-item {
    gap: 0;
}

.navigation-label {
    min-width: 0;
    overflow: hidden;

    font-size: 13px;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.active-indicator {
    position: absolute;
    right: 10px;

    width: 5px;
    height: 5px;

    border-radius: 50%;
    background: #426b9a;
}

.sidebar-footer {
    padding: 12px 9px 15px;
    border-top: 1px solid #edf0f4;
}

.footer-actions {
    margin-bottom: 12px;
}

.user-block {
    display: flex;
    align-items: center;
    gap: 9px;

    min-height: 48px;
    padding: 6px 2px 0;
}

.user-avatar {
    flex-shrink: 0;

    color: #426b9a;
    background: #eaf1f8;

    font-size: 13px;
    font-weight: 650;
}

.user-info {
    flex: 1;
    min-width: 0;
}

.user-name {
    overflow: hidden;

    color: #354457;
    font-size: 12px;
    font-weight: 650;
    text-overflow: ellipsis;
}

.user-role {
    overflow: hidden;

    color: #95a0ae;
    font-size: 10px;
    text-overflow: ellipsis;
}

.logout-button {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;

    width: 30px;
    height: 30px;
    min-width: 30px;

    padding: 0;
    border: 0;
    border-radius: 7px;

    color: #9a7777;
    background: transparent;
    cursor: pointer;

    transition:
        color 0.18s ease,
        background 0.18s ease;

    &:hover {
        color: #b34e4e;
        background: #fbf0f0;
    }

    svg {
        display: block;
        width: 18px;
        height: 18px;
    }
}

.app-sidebar:not(.app-sidebar--expanded) {
    .user-block {
        flex-direction: column;
        gap: 7px;
        padding: 6px 0 0;
    }

    .logout-button {
        width: 34px;
        height: 30px;
    }
}

@keyframes backdrop-appear {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@media (max-width: 600px) {
    .app-sidebar--expanded {
        width: min(280px, calc(100vw - 40px));
    }
}

@media (prefers-reduced-motion: reduce) {
    .app-sidebar {
        transition: none;
    }
}
</style>
