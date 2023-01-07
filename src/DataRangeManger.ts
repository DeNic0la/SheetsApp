export class DataRangeManger {
    public static getDataByRange(rangeName: string): any[][] {
        const range = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(rangeName)?.getValues();
        if (!range) {
            throw new Error("Folgender bereich wurde nicht gesetzt: " + rangeName)
        } else if (range[0].length < 8) {
            throw new Error("Folgender bereich ist zu kurz: " + rangeName)
        }
        return range;
    }
}