import {MyLogger} from "./Logger";
import {Constant} from "./Constant";
import {SheetsMaster} from "./SheetsMaster";
import {CalendarMaster} from "./CalendarMaster";
import {DataMaster} from "./DataMaster";
import {Calendar} from "./specific-types";
import {CalendarSelectorMaster, dropdownOption} from "./CalendarSelectorMaster";

function onOpen() {
    let ui = SpreadsheetApp.getUi();
    ui.createAddonMenu().addItem("Kalender Aktualisieren", "generateCalEvents")
        .addItem("Berechtugungen überprüfen", "checkPermissions")
        .addItem("RUN DEBUG","testing")
        .addToUi();
}


function onInstall() {
    onOpen();
}

function testing() {

    let a = new CalendarSelectorMaster();
    a.select_calendar();

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

function getAllCalendersAsHTMLOption() {
    MyLogger.info("CALLED")
    MyLogger.showLog()
    let data = CalendarApp.getAllCalendars().map(c => {
        return {
            value: c.getId(),
            key: c.getName()
        } as dropdownOption;
    });

    let options:string[] = [];

    for (let i = 0; i < data.length; i++){
        options.push(`<option value="${data[i].value}">${data[i].key}</option>`)
    }
    return data //HtmlService.createHtmlOutput(options.join('\n')).getContent();

}

function selectCalendarCallback(e:any){
    MyLogger.info("CALID: "+e);
    MyLogger.showLog()
}