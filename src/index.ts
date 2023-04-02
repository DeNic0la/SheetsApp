import {MyLogger} from "./Logger";
import {Constant} from "./Constant";
import {SheetsMaster} from "./SheetsMaster";
import {CalendarMaster} from "./CalendarMaster";
import {DataMaster} from "./DataMaster";
import {Calendar} from "./specific-types";
import {
    call_custom_picker_for_cal,
    getCalendarId,
    getCurrentCalendarName,
    selectCalendar,
} from "./CalendarSelectorMaster";
import {AdvancedSheetDataMaster} from "./AdvancedSheetDataMaster";
import {submitEventCallback} from "./CustomPicker";
import {buildUI } from "./UiBuilder";
import {call_debug_state_picker, getDebugState, getDebugStateProp} from "./DebugState";
import {FormatMaster} from "./FormatMaster";
import {UiMaster} from "./UiMaster";
import {DriveMaster} from "./DriveMaster";

function main_call_debug_state_picker() {
    call_debug_state_picker();
}
function main_call_custom_picker_for_cal(){
   call_custom_picker_for_cal();
}

function onOpen(e:any) {
    buildUI(e)
}

function unset(){
    PropertiesService.getUserProperties().deleteProperty("CalendarToWrite");
    buildUI(undefined);
}


function onInstall(e:any) {
    onOpen(e);
}

function check_permissions_on_no_auth(){
    var authorizationInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.LIMITED);
    var authorizationStatus = authorizationInfo.getAuthorizationStatus();
    SpreadsheetApp.getUi().alert("Status ist "+authorizationStatus.toString())
    buildUI(undefined);
}

function show_settings(){
    UiMaster.showMessageDialog(`Der Ausgewählte Kalender ist: ${getCurrentCalendarName()}
        Das Informationslevel ist auf: ${getDebugStateProp()}`,"Aktuelle Einstellungen")
}

const TEST_CALENDAR_NAME = "TestCalendar";
const TEST_CALENDAR_ID_PROPERTY_KEY = "TestCalendarId"
function restTestEnviroment() {
    let userProperties = PropertiesService.getUserProperties();
    let testCalId = userProperties.getProperty(TEST_CALENDAR_ID_PROPERTY_KEY);
    if (testCalId){
        let oldTestCal = CalendarApp.getCalendarById(testCalId);
        if (oldTestCal && oldTestCal.getName() === TEST_CALENDAR_NAME){
            oldTestCal.deleteCalendar();
        }
    }
    let calendar = CalendarApp.createCalendar(TEST_CALENDAR_NAME);
    const testid = calendar.getId()
    selectCalendar(testid);
    userProperties.setProperty(TEST_CALENDAR_ID_PROPERTY_KEY,testid)
}



function reformat_entire_spreadsheet() {
    FormatMaster.removeAllFormat();

    let ss = SpreadsheetApp.getActiveSpreadsheet();
    let noonRange = AdvancedSheetDataMaster.getNoonRange();
    let meetingRange = AdvancedSheetDataMaster.getMeetingRange();

    if (noonRange)
        ss.setNamedRange(Constant.AREA_NAME_NOON,noonRange);
    if (meetingRange)
        ss.setNamedRange(Constant.AREA_NAME_MEETINGS,meetingRange)


    FormatMaster.formatTables();
    FormatMaster.formatTitles();
}

function generateCalEvents() {

    let calendarId = getCalendarId();

    if (!calendarId){
        UiMaster.showMessageDialog(`Es wurden kein Kalender gesetzt. Vorgang wird abgebrochen`)
        return;
    }

    let cal: Calendar = CalendarApp.getCalendarById(calendarId);

    // Prompt the User to confirm the selected Cal
    if (cal.getName() !== TEST_CALENDAR_NAME && !confirmCalendarSelection(cal.getName())){
        return;
    }


        console.time("NoonFetch")

        let noons = SheetsMaster.getNoonsAsObj();

        console.timeEnd("NoonFetch")
        console.time("MeetingFetch")

        let mergedMeetings = DataMaster.mergeNoonsToMeetings(noons, SheetsMaster.getMeetingsAsObj());
        console.timeEnd("MeetingFetch")

        console.time("GenNoons")

        CalendarMaster.generateNoons(cal, noons);
    console.timeEnd("GenNoons")
    console.time("GenMeetings")

    CalendarMaster.generateMeetings(cal, mergedMeetings);
    console.timeEnd("GenMeetings")
    console.time("END")


    SpreadsheetApp.flush();
    MyLogger.showLog();
    console.timeEnd("END")

}

function confirmCalendarSelection(calendar_name:string):boolean{
    let ui = SpreadsheetApp.getUi();
    let promptResponse = ui.alert("Kalender Bestätigen",`Die aktuellen Aktionen werden mit dem "${calendar_name}" ausgeführt, fortfahren?`, ui.ButtonSet.YES_NO);
    return (promptResponse == ui.Button.YES)
}






function include(filename: string) {
    return HtmlService.createHtmlOutputFromFile(filename)
        .getContent();
}

function submitInputCallback(value:string){
    submitEventCallback(value);
    buildUI(undefined);
}
function getDataFromProp(){
    let userProperties = PropertiesService.getUserProperties();
    let val = userProperties.getProperty(Constant.PROPERTY_NAME_UI_DATA);
    if (val){
        return val;
    }
    MyLogger.warn("Data Not Found")
    throw new Error("DATA NOT FOUND")
}
function pick_meetings_folder(){
    DriveMaster.pickMeetingFolder();
}
function pick_preset_document(){
    DriveMaster.pickPreset();
}
function generate_meeting_docs(){
    let noons = SheetsMaster.getNoonsAsObj();
    let mergedMeetings = DataMaster.mergeNoonsToMeetings(noons, SheetsMaster.getMeetingsAsObj());
    DriveMaster.generateDocumentForMeetings(mergedMeetings)
    MyLogger.showLog();
}