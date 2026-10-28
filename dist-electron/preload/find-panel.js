"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initFindPanel = initFindPanel;
const electron_1 = require("electron");
let findPanel = null;
let findInput = null;
let findCounter = null;
function closeFindPanel() {
    electron_1.ipcRenderer.send("find:stop");
    findPanel?.remove();
    findPanel = null;
    findInput = null;
    findCounter = null;
}
function openFindPanel() {
    if (findPanel) {
        findInput?.focus();
        findInput?.select();
        return;
    }
    const panel = document.createElement("div");
    panel.style.cssText = `
        position: fixed;
        top: 12px;
        right: 12px;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px;
        background: #ffffff;
        color: #333333;
        border: 1px solid #e0e0e0;
        border-radius: 7px;
        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12);
        font: 12px Arial, sans-serif;
    `;
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Найти на странице";
    input.setAttribute("aria-label", "Найти на странице");
    input.style.cssText = `
        width: 190px;
        height: 26px;
        box-sizing: border-box;
        padding: 4px 7px;
        border: 1px solid #dcdcdc;
        border-radius: 4px;
        outline: none;
        font: 12px Arial, sans-serif;
        color: #222222;
        background: #ffffff;
    `;
    input.addEventListener("focus", () => {
        input.style.borderColor = "#999999";
    });
    input.addEventListener("blur", () => {
        input.style.borderColor = "#dcdcdc";
    });
    const counter = document.createElement("span");
    counter.textContent = "0 / 0";
    counter.style.cssText = `
        min-width: 36px;
        white-space: nowrap;
        text-align: center;
        color: #777777;
        font-size: 11px;
    `;
    const createButton = (label, title) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.title = title;
        button.style.cssText = `
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            border: none;
            border-radius: 4px;
            background: transparent;
            color: #555555;
            cursor: pointer;
            font: 15px Arial, sans-serif;
        `;
        button.addEventListener("mouseenter", () => {
            button.style.background = "#f0f0f0";
        });
        button.addEventListener("mouseleave", () => {
            button.style.background = "transparent";
        });
        return button;
    };
    const previousButton = createButton("↑", "Предыдущее совпадение");
    const nextButton = createButton("↓", "Следующее совпадение");
    const closeButton = createButton("×", "Закрыть (Esc)");
    previousButton.addEventListener("click", () => {
        electron_1.ipcRenderer.send("find:next", false);
    });
    nextButton.addEventListener("click", () => {
        electron_1.ipcRenderer.send("find:next", true);
    });
    closeButton.addEventListener("click", closeFindPanel);
    input.addEventListener("input", () => {
        electron_1.ipcRenderer.send("find:start", input.value);
    });
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            electron_1.ipcRenderer.send("find:next", !event.shiftKey);
        }
        if (event.key === "Escape") {
            event.preventDefault();
            closeFindPanel();
        }
    });
    panel.append(input, counter, previousButton, nextButton, closeButton);
    document.body.appendChild(panel);
    findPanel = panel;
    findInput = input;
    findCounter = counter;
    input.focus();
}
function initFindPanel() {
    electron_1.ipcRenderer.on("find:open", openFindPanel);
    electron_1.ipcRenderer.on("find:result", (_event, result) => {
        if (!findCounter)
            return;
        findCounter.textContent =
            result.matches > 0
                ? `${result.activeMatchOrdinal} / ${result.matches}`
                : "0 / 0";
    });
}
