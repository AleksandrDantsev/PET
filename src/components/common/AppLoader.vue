
<script setup lang="ts">
withDefaults(
    defineProps<{
        mode?: "element" | "screen";
    }>(),
    {
        mode: "element",
    },
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
                <div class="loader-aura loader-aura--blue"></div>
                <div class="loader-aura loader-aura--violet"></div>

                <svg
                    class="loader-scene"
                    viewBox="0 0 180 150"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        class="frame frame--outer"
                        d="M90 8 L151 42 L165 75 L151 108 L90 142 L29 108 L15 75 L29 42 Z"
                    />

                    <path
                        class="frame frame--middle"
                        d="M90 20 L140 48 L151 75 L140 102 L90 130 L40 102 L29 75 L40 48 Z"
                    />

                    <path
                        class="frame frame--inner"
                        d="M90 32 L128 54 L138 75 L128 96 L90 118 L52 96 L42 75 L52 54 Z"
                    />

                    <path
                        class="frame-trace"
                        d="M90 8 L151 42 L165 75 L151 108 L90 142 L29 108 L15 75 L29 42 Z"
                    />

                    <g class="angular-orbit angular-orbit--one">
                        <path
                            d="M90 8 L151 42 L165 75 L151 108 L90 142 L29 108 L15 75 L29 42 Z"
                            stroke="#79caff"
                            stroke-width="1.5"
                            stroke-dasharray="20 90 12 90"
                        />
                    </g>

                    <g class="angular-orbit angular-orbit--two">
                        <path
                            d="M90 20 L140 48 L151 75 L140 102 L90 130 L40 102 L29 75 L40 48 Z"
                            stroke="#a58cff"
                            stroke-width="1.4"
                            stroke-dasharray="28 65 8 65"
                        />
                    </g>

                    <g class="angular-core">
                        <path
                            d="M90 39 L118 55 L118 91 L90 107 L62 91 L62 55 Z"
                            fill="#a8c9ff"
                            fill-opacity=".06"
                            stroke="#9bcfff"
                            stroke-width="1.5"
                        />

                        <path
                            d="M90 39 L90 73 L118 55"
                            stroke="#c1dfff"
                            stroke-width="1.4"
                        />

                        <path
                            d="M90 73 L118 91 L90 107"
                            stroke="#9b9eff"
                            stroke-width="1.4"
                        />

                        <path
                            d="M90 73 L62 55"
                            stroke="#c1dfff"
                            stroke-width="1.4"
                        />

                        <path
                            d="M90 73 L62 91 L90 107"
                            stroke="#8ebdff"
                            stroke-width="1.4"
                        />

                        <path
                            d="M90 39 L90 73"
                            stroke="#ffffff"
                            stroke-width="1.3"
                        />

                        <path
                            d="M90 73 L118 91"
                            stroke="#b3a5ff"
                            stroke-width="1.2"
                        />

                        <path
                            d="M90 73 L62 91"
                            stroke="#a3d8ff"
                            stroke-width="1.2"
                        />

                        <path
                            d="M90 39 L118 55 L118 91 L90 107 L62 91 L62 55 Z"
                            stroke="#ffffff"
                            stroke-opacity=".3"
                            stroke-width=".8"
                        />
                    </g>

                    <path
                        class="core-trace"
                        d="M90 39 L118 55 L118 91 L90 107 L62 91 L62 55 Z"
                    />

                    <g class="energy-points">
                        <path d="M15 75 L20 70 L25 75 L20 80 Z" fill="#8bdcff" />
                        <path d="M155 42 L160 37 L165 42 L160 47 Z" fill="#b9a2ff" />
                        <path d="M90 8 L94 4 L98 8 L94 12 Z" fill="#ffffff" />
                        <path d="M151 108 L155 104 L159 108 L155 112 Z" fill="#9bdcff" />
                        <path d="M29 108 L33 104 L37 108 L33 112 Z" fill="#b7a4ff" />
                    </g>

                    <g class="small-particles">
                        <path d="M43 25 L46 22 L49 25 L46 28 Z" />
                        <path d="M132 20 L135 17 L138 20 L135 23 Z" />
                        <path d="M8 116 L11 113 L14 116 L11 119 Z" />
                        <path d="M168 119 L171 116 L174 119 L171 122 Z" />
                        <path d="M90 146 L93 143 L96 146 L93 149 Z" />
                    </g>
                </svg>
            </div>

            <div class="loader-info">
                <span class="loader-description">
                    Получение данных...
                </span>
            </div>

            <div class="loader-progress">
                <div class="loader-progress-track">
                    <div class="loader-progress-bar"></div>
                    <div class="loader-progress-highlight"></div>
                </div>
            </div>

            <span class="loader-caption">
                SYSTEM INITIALIZATION
            </span>
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
        background: rgb(248 250 253 / 91%);
        backdrop-filter: blur(14px);
    }

    &--screen {
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: rgb(245 248 253 / 93%);
        backdrop-filter: blur(20px);
    }
}

.loader-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    width: 340px;
    max-width: calc(100vw - 32px);
    padding: 30px 32px 24px;
    overflow: hidden;
    background:
        linear-gradient(
            145deg,
            rgb(255 255 255 / 97%),
            rgb(246 249 255 / 94%)
        );
    border-radius: 14px;
    box-shadow:
        0 18px 55px rgb(52 75 115 / 9%),
        0 2px 8px rgb(52 75 115 / 4%),
        inset 0 1px 0 #ffffff;
}

.loader-visual {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 216px;
    height: 180px;
    margin-bottom: 12px;
}

.loader-aura {
    position: absolute;
    width: 95px;
    height: 95px;
    filter: blur(30px);
    animation: aura 3s ease-in-out infinite;

    &--blue {
        background: rgb(93 183 255 / 30%);
        transform: translate(-15px, 5px);
    }

    &--violet {
        background: rgb(158 123 255 / 24%);
        animation-delay: -1.5s;
        transform: translate(20px, -5px);
    }
}

.loader-scene {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    overflow: visible;
}

.frame {
    stroke: #b7c8df;
    stroke-width: 1;
    stroke-opacity: .3;
    stroke-linejoin: bevel;
}

.frame--middle {
    stroke: #91a9ce;
    stroke-opacity: .28;
}

.frame--inner {
    stroke: #a4b9d8;
    stroke-opacity: .25;
}

.frame-trace {
    stroke: #8bcfff;
    stroke-width: 1.8;
    stroke-linejoin: bevel;
    stroke-dasharray: 26 180;
    filter: drop-shadow(0 0 4px #75bdff);
    animation: trace 2.8s linear infinite;
}

.angular-orbit {
    transform-origin: 90px 75px;
    transform-box: view-box;
}

.angular-orbit--one {
    animation: angular-rotate 16s linear infinite;
}

.angular-orbit--two {
    animation: angular-rotate-reverse 11s linear infinite;
}

.angular-core {
    transform-origin: 90px 73px;
    animation: core-float 3s ease-in-out infinite;
    filter: drop-shadow(0 0 5px rgb(105 173 255 / 45%));
}

.core-trace {
    stroke: #ffffff;
    stroke-width: 1.6;
    stroke-linejoin: bevel;
    stroke-dasharray: 18 130;
    filter: drop-shadow(0 0 5px #8bcfff);
    animation: core-trace 2s linear infinite;
}

.energy-points {
    animation: energy 2.5s ease-in-out infinite alternate;
    filter: drop-shadow(0 0 4px #8ccaff);
}

.small-particles {
    fill: #a8c4ed;
    opacity: .6;
    animation: particles 2s ease-in-out infinite alternate;
}

.loader-title {
    color: #29364b;
    font-size: 16px;
    font-weight: 650;
    letter-spacing: -.3px;
}

.loader-description {
    display: inline-block;
    color: #929eb1;
    padding-top: 10px;
    font-size: 12px;
    font-weight: 450;
}

.loader-progress {
    width: 100%;
    margin-top: 25px;
}

.loader-progress-track {
    position: relative;
    width: 100%;
    height: 4px;
    overflow: hidden;
    background: #e7edf5;
    clip-path: polygon(
        0 0,
        calc(100% - 3px) 0,
        100% 50%,
        calc(100% - 3px) 100%,
        0 100%
    );
}

.loader-progress-bar {
    position: absolute;
    inset: 0 auto 0 0;
    width: 36%;
    background: linear-gradient(
        90deg,
        #74c8f7,
        #718ef5,
        #a68af4
    );
    animation: progress 1.8s cubic-bezier(.45, 0, .35, 1) infinite;
}

.loader-progress-highlight {
    position: absolute;
    top: -3px;
    left: 0;
    width: 22%;
    height: 10px;
    background: #ffffff;
    filter: blur(5px);
    opacity: .85;
    animation: progress 1.8s cubic-bezier(.45, 0, .35, 1) infinite;
}

.loader-caption {
    margin-top: 13px;
    color: #b0bdcf;
    font-size: 8px;
    font-weight: 650;
    letter-spacing: 2px;
}

@keyframes trace {
    from {
        stroke-dashoffset: 220;
    }

    to {
        stroke-dashoffset: 0;
    }
}

@keyframes core-trace {
    from {
        stroke-dashoffset: 148;
    }

    to {
        stroke-dashoffset: 0;
    }
}

@keyframes angular-rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@keyframes angular-rotate-reverse {
    from {
        transform: rotate(360deg);
    }

    to {
        transform: rotate(0deg);
    }
}

@keyframes core-float {
    0%, 100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-4px);
    }
}

@keyframes aura {
    0%, 100% {
        opacity: .4;
        scale: .85;
    }

    50% {
        opacity: .85;
        scale: 1.2;
    }
}

@keyframes energy {
    from {
        opacity: .45;
    }

    to {
        opacity: 1;
    }
}

@keyframes particles {
    from {
        opacity: .25;
        transform: translateY(2px);
    }

    to {
        opacity: .8;
        transform: translateY(-2px);
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
    *,
    *::before,
    *::after {
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
    }
}
</style>
