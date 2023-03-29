import {Constant} from "./Constant";
import { Range } from "./specific-types";
import {Validator} from "./Validator";
import {MyLogger} from "./Logger";

const HEX_VALUE_RED = "#fa1418"
export class HighlightMaster {
    static highlightValidationErrorInNoon(index: number, rowData: any[]) {
        let rangeByName = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(Constant.AREA_NAME_NOON);
        if (!rangeByName) return;
        if (!Validator.isValidDateField(rowData[0])) {
            this.highlightField(index,0,rangeByName)
        }
        if (!Validator.isValidTimePlaceField(rowData[1])) {
            this.highlightField(index,1,rangeByName)
        }

    }

    static highlightValidationErrorInMeeting(index: number, rowData: any[]) {
        let rangeByName = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(Constant.AREA_NAME_MEETINGS);
        if (!rangeByName) return;
        if (!Validator.isValidDateField(rowData[0])) {
            this.highlightField(index,0,rangeByName)
        }
        if (!Validator.isValidTimePlaceField(rowData[1])) {
            this.highlightField(index,1,rangeByName)

        }
        if (!Validator.isValidEntry(rowData[5])) {
            this.highlightField(index,5,rangeByName)
        }
    }

    private static highlightField(index: number, fieldIndex: number, range: Range) {
        SpreadsheetApp.getUi().alert(`Markiere Feld mit index: ${index} und fieldIndex ${fieldIndex}`)

        //MyLogger.info(`Markiere Feld mit index: ${index} und fieldIndex ${fieldIndex}`)
        try{
            range.getCell(
                (index + 1), (fieldIndex + 1)
            ).setBackgroundRGB(250,20,25);
        }
        catch (e) {
            SpreadsheetApp.getUi().alert("Hat Nicht geklappt")
            range.getCell(
                (index + 1), (fieldIndex + 1)
            ).setBackground(HEX_VALUE_RED);
        }



    }

}