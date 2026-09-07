export const api = {
  google: {
    getSheet: (range: string) =>
      window.electronAPI.getSheet(range),

    getSheetValuesById: (id: string | number) =>
      window.electronAPI.getSheetValuesById(id),

    getSheetsGID: () =>
      window.electronAPI.getSheetsGID(),


  },

};