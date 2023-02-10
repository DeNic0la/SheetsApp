import {MyLogger} from "./Logger";
import {Constant} from "./Constant";
import {SheetsMaster} from "./SheetsMaster";
import {CalendarMaster} from "./CalendarMaster";
import {DataMaster} from "./DataMaster";
import {Calendar} from "./specific-types";
import {CalendarSelectorMaster, getAllCalendersForHTML} from "./CalendarSelectorMaster";
import {displayError, displayNoLockError} from "./Util";
import {AdvancedSheetDataMaster} from "./AdvancedSheetDataMaster";



function onOpen() {
    let ui = SpreadsheetApp.getUi();
    ui.createAddonMenu().addItem("Kalender Synchronisieren", "generateCalEvents")
        .addItem("Aktuelle Einstellungen anzeigen", "check_settings")
        .addItem("Kalender Auswählen", "open_select_calendar")
        .addSeparator()
        .addItem("Setup Test calendar","restTestEnviroment")
        .addItem("Named Ranges","namedRangeBuilder")
        .addToUi();
}

const DEFAULT_LOCK_TIMEOUT = 1000;

function onInstall() {
    onOpen();
}
const CalendarSelectorMain = new CalendarSelectorMaster();

function open_select_calendar(){
    CalendarSelectorMain.select_calendar();
}

function check_settings() {
    try {
        let calid = CalendarSelectorMaster.getCalendarId();
        let text = calid ? "Calendar ID is set " + calid : "Calendar id is not set";

        MyLogger.info(text)

        var authorizationInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.LIMITED);
        MyLogger.info(JSON.stringify(authorizationInfo));

        var authorizationStatus = authorizationInfo.getAuthorizationStatus();
        MyLogger.info(JSON.stringify(authorizationStatus));

        var authorizationUrl = authorizationInfo.getAuthorizationUrl();
        MyLogger.info(authorizationUrl);
    }
    catch (e) {
        MyLogger.info(JSON.stringify(e));
    }
    MyLogger.showLog();

    let a = confirmCalendarSelection(getCurrentCalendarName());
    MyLogger.info("Confirmed: "+a);


    let name = CalendarApp.getName();
    if (name.length > 0) {
        SpreadsheetApp.getUi().alert("Alles ist Startbereit")
    }


}
const TEST_CALENDAR_NAME = "TestCalendar";
const TEST_CALENDAR_ID_PROPERTY_KEY = "TestCalendarId"
function restTestEnviroment() {
    let userProperties = PropertiesService.getUserProperties();
    let testCalId = userProperties.getProperty(TEST_CALENDAR_ID_PROPERTY_KEY);
    if (testCalId){
        let oldTestCal = CalendarApp.getCalendarById(testCalId);
        if (oldTestCal.getName() === TEST_CALENDAR_NAME){
            oldTestCal.deleteCalendar();
        }
    }
    let calendar = CalendarApp.createCalendar(TEST_CALENDAR_NAME);
    const testid = calendar.getId()
    CalendarSelectorMaster.selectCalendar(testid);
    userProperties.setProperty(TEST_CALENDAR_ID_PROPERTY_KEY,testid)
}

function validate_dates(){

}

function namedRangeBuilder(){
    return AdvancedSheetDataMaster.guessNamedRange()
}


function generateCalEvents() {

    let calendarId = CalendarSelectorMaster.getCalendarId();

    if (!calendarId){
        return open_select_calendar();
    }

    let cal: Calendar = CalendarApp.getCalendarById(calendarId);

    if (cal.getName() !== TEST_CALENDAR_NAME && !confirmCalendarSelection(cal.getName())){
        return open_select_calendar();
    }

    let scriptLock = LockService.getScriptLock();
    if (!scriptLock.tryLock(DEFAULT_LOCK_TIMEOUT)){// No Lock
        return displayNoLockError();
    }
    try {

        let noons = SheetsMaster.getNoonsAsObj();
        let mergedMeetings = DataMaster.mergeNoonsToMeetings(noons, SheetsMaster.getMeetingsAsObj());

        CalendarMaster.generateNoons(cal, noons);
        CalendarMaster.generateMeetings(cal, mergedMeetings);
    }
    catch (e){
        return displayError(e);
    }
    finally {
        scriptLock.releaseLock();
        MyLogger.showLog();
    }

}

function confirmCalendarSelection(calendar_name:string):boolean{
    let ui = SpreadsheetApp.getUi();
    let promptResponse = ui.alert("Kalender Bestätigen",`Die aktuellen Aktionen werden mit dem "${calendar_name}" ausgeführt, fortfahren?`, ui.ButtonSet.YES_NO);
    return (promptResponse == ui.Button.YES)
}

function getAllCalendersAsHTMLOption() {
    return getAllCalendersForHTML();
}

function selectCalendarCallback(e:string){
    return CalendarSelectorMaster.selectCalendar(e);
}

function getCurrentCalendarName() {
    let calendarId = CalendarSelectorMaster.getCalendarId();
    return calendarId ? CalendarApp.getCalendarById(calendarId).getName() : "Nicht Gesetzt";
}

function include(filename: string) {
    return HtmlService.createHtmlOutputFromFile(filename)
        .getContent();
}