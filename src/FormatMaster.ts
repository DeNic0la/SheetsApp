import {AdvancedSheetDataMaster, LAGER, MEETINGS_TITLE, NOONS_TITLE} from "./AdvancedSheetDataMaster";
import {getDebugState} from "./DebugState";
import {MyLogger} from "./Logger";

const THEMES = [
    SpreadsheetApp.BandingTheme.LIGHT_GREY,
    SpreadsheetApp.BandingTheme.GREY,
    SpreadsheetApp.BandingTheme.TEAL
];

const COLORS = [
    SpreadsheetApp.ThemeColorType.ACCENT3,
    SpreadsheetApp.ThemeColorType.ACCENT4,
    SpreadsheetApp.ThemeColorType.ACCENT2
]
const TITLE_STRINGS = [
    NOONS_TITLE,
    MEETINGS_TITLE,
    LAGER
]
export class FormatMaster {
    /**
     * Currently Not Working
     */
    static removeEmpty(){
        let ss = SpreadsheetApp.getActive();
        let activeSheet = SpreadsheetApp.getActiveSheet();
        let maxCol = activeSheet.getMaxColumns();
        let lastCol = activeSheet.getLastColumn();
        if (maxCol-lastCol != 0){
            activeSheet.deleteColumns(lastCol+1,maxCol-lastCol)
        }

        let maxRow = activeSheet.getMaxRows();
        let lastRow = activeSheet.getLastRow();
        if (maxRow-lastRow != 0){
            activeSheet.deleteColumns(lastRow+1,maxRow-lastRow)
        }
    }

    static removeAllFormat(){
        let ss = SpreadsheetApp.getActiveSheet();
        let range = ss.getRange(1,1,ss.getMaxRows(),ss.getMaxColumns());
        range.clearFormat();
        range.setBackground(null);
        range.setBorder(null,null,null,null,null,null);
        range.setFontWeight(null);
        SpreadsheetApp.flush();
    }

    static formatTables(){
        let debugState = getDebugState();

        let RANGES = [
            AdvancedSheetDataMaster.getNoonRange(),
            AdvancedSheetDataMaster.getMeetingRange(),
            AdvancedSheetDataMaster.getLagerRange(),
        ]
        let HEADERS = [
            AdvancedSheetDataMaster.getHeaderRow(NOONS_TITLE),
            AdvancedSheetDataMaster.getHeaderRow(MEETINGS_TITLE),
            AdvancedSheetDataMaster.getHeaderRowLager()
        ]

        for (let i = 0; i < 3; i++) {
            let R = RANGES[i];
            let Band = THEMES[i];
            let Header = HEADERS[i];
            if (R){
                try{
                    R.applyRowBanding(Band,true,false);
                    R.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP)
                    R.setBorder(null,null,null,null,true,null,null,null)

                }
                catch (e) {
                    if (debugState.isExtendedOrHigher){
                        MyLogger.warn("Error on Format: "+e);
                    }
                }
            }
            else if (debugState.isExtendedOrHigher){
                MyLogger.info("Range for Table not found")
            }
            if (Header){
                Header.setFontWeight('bold').setBorder(null,null,true,null,null,null)
            }

        }
    }

    static formatTitles(){
        let ranges = TITLE_STRINGS.map(this.titleToRangeMapper);

        for (let i = 0; i < 3; i++) {
            let range = ranges[i];
            let color = COLORS[i];

            if (!range){
                MyLogger.info("Title not found")
                continue;
            }
            MyLogger.info("COLOR-COLOR: "+color);

            let col = color.toString();
            MyLogger.info("HEX-COLOR: "+col);

            range.setBackground(col);
            range.setFontWeight('bold');
            range.setFontColor('white');
        }
    }
    static titleToRangeMapper(val:string){
        return AdvancedSheetDataMaster.getRangeByContent(val);
    }
}