import {MyLogger} from "./Logger";

const NOONS_TITLE = "NACHMITTAGE"
const MEETINGS_TITLE = "SITZUNGEN"
export type Range = GoogleAppsScript.Spreadsheet.Range;
export type Direction = GoogleAppsScript.Spreadsheet.Direction;
export class AdvancedSheetDataMaster {

    static getHeaderRow(title: "NACHMITTAGE"|"SITZUNGEN" ){
        let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        const startRange = this.getRangeByContent(title)
        if (!startRange)
            return undefined;

        const datum = this.findNextFieldWithText(startRange,SpreadsheetApp.Direction.DOWN)

        if (!datum)
            return undefined;

        let numColumns = (spreadsheet.getActiveSheet().getLastColumn() + 1) - datum.getColumn();
        return spreadsheet.getActiveSheet().getRange(datum.getRow(), datum.getColumn(), 1, numColumns)

    }
    static findNextFieldWithText(range:Range, way: Direction){
        let limit = 20;
        let nextDataCell = range.getNextDataCell(way);
        while (nextDataCell && limit > 0){
            limit--;
            let displayValue = nextDataCell.getDisplayValue();
            if (displayValue.trim().length !== 0){
                return nextDataCell;
            }
            nextDataCell = nextDataCell.getNextDataCell(way);
        }
        return undefined
    }

    static getLastRowWithContent(range:Range){
        let sheet = SpreadsheetApp.getActiveSheet();
        const column = range.getColumn();
        const colNum = range.getNumColumns();
        let rangeToTest:undefined | Range;

        let lastRowWithData:undefined | Range;
        for (let i = range.getRow(); i < (20+range.getRow()); i++) {
            rangeToTest = sheet.getRange(i,column,1,colNum);
            let values = rangeToTest.getDisplayValues().join('').replaceAll(",","").trim();
            if (values.length > 0){
                lastRowWithData = rangeToTest
            }
            else {
                return lastRowWithData;
            }
        }

        return lastRowWithData
    }

    static getRangeByContent(title: string){
        return SpreadsheetApp.getActiveSpreadsheet().createTextFinder(title).matchCase(true).matchEntireCell(true).findNext()

    }
    static guessNamedRange(){
        const noonsHeader = this.getHeaderRow("NACHMITTAGE");
        const noonRange = this.getRangeForHeaderRow(noonsHeader);
        let a1Notation = noonRange?.getA1Notation();
        MyLogger.info("ANOT:    "+a1Notation)
        noonRange?.activate()



        MyLogger.showLog() //A1:H4:H31
    }

    static getRangeForHeaderRow(headerRow:Range|undefined){
        if (headerRow){
            let lastRowWithContent = this.getLastRowWithContent(headerRow);
            if (lastRowWithContent){
                let data = {row: headerRow.getRow(),col: headerRow.getColumn(),numRows: ((lastRowWithContent.getLastRow()+1) - headerRow.getRow()), numCols: ((lastRowWithContent.getLastColumn()+1) - headerRow.getColumn()) }
                MyLogger.info(JSON.stringify(data));
                return SpreadsheetApp.getActiveSheet().getRange(
                    headerRow.getRow(),
                    headerRow.getColumn(),
                    (lastRowWithContent.getLastRow()+1) - headerRow.getRow(),
                    (lastRowWithContent.getLastColumn()+1) - headerRow.getColumn()
                );
            }
        }
        return undefined;
    }
    static logTextFinder(a:GoogleAppsScript.Spreadsheet.TextFinder,title:string|undefined){
        let data = [];
        data.push(`${title} Ranges:`)
        let all = a.findAll();
        let vals = a.findNext()?.getValues();
        while (vals) {
            data.push(JSON.stringify(vals))
            vals = a.findNext()?.getValues();
        }
        data.push(JSON.stringify(all.map(value => {return value.getA1Notation()})))
        MyLogger.info(data.join('\n'))

    }
}