import {Constant} from "./Constant";
import { Range } from "./specific-types";
import {Validator} from "./Validator";
import {DataRangeManger} from "./DataRangeManger";

const HEX_VALUE_RED = "#fa1418"
export class HighlightMaster {
    static highlightValidationErrorInNoon(index: number, rowData: any[],range: GoogleAppsScript.Spreadsheet.Range = DataRangeManger.getRange(Constant.AREA_NAME_NOON)) {
        if (!Validator.isValidDateField(rowData[0])) {
            this.highlightField(index,0,range)
        }
        if (!Validator.isValidTimePlaceField(rowData[1])) {
            this.highlightField(index,1,range)
        }

    }

    static highlightValidationErrorInMeeting(index: number, rowData: any[],range: GoogleAppsScript.Spreadsheet.Range = DataRangeManger.getRange(Constant.AREA_NAME_MEETINGS)) {

        if (!Validator.isValidDateField(rowData[0])) {
            this.highlightField(index,0,range)
        }
        if (!Validator.isValidTimePlaceField(rowData[1])) {
            this.highlightField(index,1,range)

        }
        if (!Validator.isValidEntry(rowData[5])) {
            this.highlightField(index,5,range)
        }
    }

    private static highlightField(index: number, fieldIndex: number, range: Range) {
        range.getCell(
            (index + 1), (fieldIndex + 1)
        ).setBackground(HEX_VALUE_RED);
        SpreadsheetApp.flush();
        //MyLogger.info(`Markiere Feld mit index: ${index} und fieldIndex ${fieldIndex}`)
        /*
        try{
            range.getCell(
                (index + 1), (fieldIndex + 1)
            ).setBackgroundRGB(250,20,25);
        }
        catch (e) {
            SpreadsheetApp.getUi().alert("Hat Nicht geklappt")

        }*/



    }

}