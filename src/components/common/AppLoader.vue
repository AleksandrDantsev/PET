
<script setup lang="ts">
withDefaults(
    defineProps<{
        mode?: "element" | "screen";
        text?: string;
    }>(),
    {
        mode: "element",
        text: "Загрузка раздела",
    }
);
</script>

<template>
    <div
        class="app-loader"
        :class="`app-loader--${mode}`"
        role="status"
        aria-live="polite"
    >
        <div class="loader-card">
            <div class="loader-visual">
                <div class="loader-glow"></div>
                <div class="loader-ring loader-ring--outer"></div>
                <div class="loader-ring loader-ring--inner"></div>

                <div class="loader-center">
                    <div class="loader-dot"></div>
                </div>
            </div>

            <div class="loader-info">
                <span class="loader-title">{{ text }}</span>
                <span class="loader-description">
                    Получение данных...
                </span>
            </div>

            <div class="loader-progress">
                <div class="loader-progress-track">
                    <div class="loader-progress-bar"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.app-loader {
    display: flex;
    align-items: center;
    justify-content: center;

    &--element {
        position: absolute;
        inset: 0;
        z-index: 100;
        min-height: 240px;
        border-radius: 8px;
        background: #fffffff0;
        backdrop-filter: blur(12px);
    }

    &--screen {
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: #f8f9fbf7;
        backdrop-filter: blur(16px);
    }
}

.loader-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 320px;
    padding: 45px 40px;
    background: #ffffff9c;
    border-radius: 40px;
    box-shadow:
        0 12px 36px #19233207,
        0 2px 6px #19233207;
}

.loader-visual {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    margin-bottom: 22px;
}

.loader-glow {
    position: absolute;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #5a78a01f;
    filter: blur(12px);
    animation: breathe 2s ease-in-out infinite;
}

.loader-ring {
    position: absolute;
    border-radius: 50%;
    border: 2px solid transparent;

    &--outer {
        inset: 2px;
        border-top-color: #687b95;
        border-right-color: #687b9538;
        animation: rotate 1.4s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
    }

    &--inner {
        inset: 11px;
        border-bottom-color: #a8b4c4;
        border-left-color: #a8b4c433;
        animation: rotate-reverse 1.8s linear infinite;
    }
}

.loader-center {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #f1f4f8;
    box-shadow: 0 1px 4px #1e2d4114;
}

.loader-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #769e71;
    animation: pulse 1.4s ease-in-out infinite;
}

.loader-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}

.loader-title {
    color: #303844;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.25px;
}

.loader-description {
    color: #929ba8;
    font-size: 11px;
    font-weight: 400;
}

.loader-progress {
    width: 100%;
    margin-top: 22px;
}

.loader-progress-track {
    width: 100%;
    height: 3px;
    overflow: hidden;
    border-radius: 4px;
    background: #edf0f4;
}

.loader-progress-bar {
    width: 35%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #aab7c8, #647c9c);
    animation: progress 1.4s ease-in-out infinite;
}

@keyframes rotate {
    to {
        transform: rotate(360deg);
    }
}

@keyframes rotate-reverse {
    to {
        transform: rotate(-360deg);
    }
}

@keyframes breathe {
    0%, 100% {
        opacity: 0.45;
        transform: scale(0.85);
    }
    50% {
        opacity: 0.9;
        transform: scale(1.1);
    }
}

@keyframes pulse {
    0%, 100% {
        opacity: 0.55;
        transform: scale(0.8);
    }
    50% {
        opacity: 1;
        transform: scale(1.15);
    }
}

@keyframes progress {
    0% {
        transform: translateX(-110%);
    }
    100% {
        transform: translateX(310%);
    }
}

@media (prefers-reduced-motion: reduce) {
    .loader-glow,
    .loader-ring,
    .loader-dot,
    .loader-progress-bar {
        animation: none;
    }
}
</style>
