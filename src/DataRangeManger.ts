export class DataRangeManger {

    /**
     * @deprecated try to avoid this
     * @param rangeName
     */
    public static getDataByRange(rangeName: string): any[][] {
        const range = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(rangeName)?.getValues();
        SpreadsheetApp.flush();
        if (!range) {
            throw new Error("Folgender bereich wurde nicht gesetzt: " + rangeName)
        } else if (range[0].length < 8) {
            throw new Error("Folgender bereich ist zu kurz: " + rangeName)
        }
        return range;
    }

    public static getRange(rangeName: string): GoogleAppsScript.Spreadsheet.Range {
        const range = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(rangeName);
        SpreadsheetApp.flush();
        if (!range) {
            throw new Error("Folgender bereich wurde nicht gesetzt: " + rangeName)
        }
        return range;
    }
}