src/
│
├── pages/
│ ├── HomePage.vue
│ ├── SearchPage.vue
│ └── SettingsPage.vue
│
├── components/
│ ├── search/
│ ├── product/
│ ├── ui/
│ └── layout/
│
├── services/
│ ├── api.ts
│ ├── product.ts
│ └── interchangeable.ts
│
├── composables/
│ ├── useSearch.ts
│ └── useLocalStorage.ts
│
├── stores/
│ └── app.store.ts
│
├── types/
│ ├── product.ts
│ ├── contragent.ts
│ └── common.ts
│
├── utils/
│ ├── pet.ts
│ ├── checkConditions.ts
│ ├── format.ts
│ └── helpers.ts
│
├── assets/
│
├── router/
│
└── main.ts

src/
│
├── pages/
├── components/
├── services/
├── stores/
├── composables/
├── utils/
├── types/
├── assets/
└── router/

1. Сервис работы с Google Sheets
   src/server/services/googleSheets.ts

Тут лежат все функции работы с таблицей:

export async function getSheet(range: string) {
...
}

export async function appendRow(range: string, values: string[]) {
...
}

export async function updateCell(range: string, value: string) {
...
}

export async function clearRange(range: string) {
...
} 2. IPC-обработчики
src/server/main/ipc/google.ts

Здесь просто прокидываешь вызовы:

import { ipcMain } from "electron";
import {
getSheet,
appendRow,
updateCell,
} from "../../services/googleSheets.js";

ipcMain.handle(
"google:getSheet",
(_, range) => getSheet(range)
);

ipcMain.handle(
"google:appendRow",
(_, range, values) =>
appendRow(range, values)
);

ipcMain.handle(
"google:updateCell",
(_, range, value) =>
updateCell(range, value)
); 3. Preload
src/server/preload/index.cjs
contextBridge.exposeInMainWorld(
"electronAPI",
{
getSheet: (range) =>
ipcRenderer.invoke(
"google:getSheet",
range
),

    appendRow: (range, values) =>
      ipcRenderer.invoke(
        "google:appendRow",
        range,
        values
      ),

    updateCell: (range, value) =>
      ipcRenderer.invoke(
        "google:updateCell",
        range,
        value
      ),

}
); 4. API-обёртка для Vue

Создай:

src/api/google.ts
export const googleApi = {
getSheet(range) {
return window.electronAPI.getSheet(range);
},

appendRow(range, values) {
return window.electronAPI.appendRow(
range,
values
);
},

updateCell(range, value) {
return window.electronAPI.updateCell(
range,
value
);
},
}; 5. Использование во Vue
import { googleApi } from "@/api/google";

const rows =
await googleApi.getSheet(
"Лист1!A1:C10"
);

await googleApi.appendRow(
"Лист1!A:C",
["Иван", "25", "Москва"]
);

В итоге получится такая цепочка:

Vue
↓
src/api/google.ts
↓
window.electronAPI
↓
preload
↓
ipcMain
↓
googleSheets.ts
↓
Google Sheets API

Когда появятся новые функции (удалить строку, найти запись, обновить сотрудника), ты просто добавляешь их в googleSheets.ts, регистрируешь IPC и вызываешь из Vue через googleApi. Это хорошо масштабируется и остаётся читаемым.
