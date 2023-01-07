import Calendar = GoogleAppsScript.Calendar.Calendar;
import {MyLogger} from "./Logger";
import {Constant} from "./Constant";
import {SheetsMaster} from "./SheetsMaster";
import {CalendarMaster} from "./CalendarMaster";
import {DataMaster} from "./DataMaster";


function onOpen() {
    let ui = SpreadsheetApp.getUi();
    ui.createAddonMenu()
        .addItem("Kalender Aktualisieren", "generateCalEvents")
        .addItem("Berechtugungen überprüfen", "checkPermissions")
        .addToUi();
}

function onInstall() {
    onOpen();
}

function checkPermissions() {
    let name = CalendarApp.getName();
    if (name.length > 0) {
        SpreadsheetApp.getUi().alert("Alles ist Startbereit")
    }
}

function generateCalEvents() {

    let cal: Calendar = CalendarApp.getCalendarById(Constant.CALENDER_ID);
    let noons = SheetsMaster.getNoonsAsObj();
    let mergedMeetings = DataMaster.mergeNoonsToMeetings(noons, SheetsMaster.getMeetingsAsObj());

    CalendarMaster.generateNoons(cal, noons);
    CalendarMaster.generateMeetings(cal, mergedMeetings);
    MyLogger.showLog();
}

