import Calendar = GoogleAppsScript.Calendar.Calendar;
import {DataRangeManger} from "./DataRangeManger";
import {
    DateField,
    MeetingEntryFields, MeetingInfo, MergedNormalMeetingInfo, NoonDate,
    NoonEntryFields, NoonInfo, NoonList, NormalMeetingInfo, SpecialMeetingInfo,
    TimePlaceField,
    ValidEntryFields,
    ValidField
} from "./specific-types";
import {MyLogger} from "./Logger";
import CalendarEvent = GoogleAppsScript.Calendar.CalendarEvent;

export {}
const AREA_NAME_NOON = "nachmittage"
const AREA_NAME_MEETINGS = "sitzungen"

const NOON_END_TIME = [17, 15];
const MEETING_END_TIME = [20, 15];

const CALENDER_ID = "hv0f19qpcmhch895bu4akmk6o4@group.calendar.google.com";


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

    let cal:Calendar = CalendarApp.getCalendarById(CALENDER_ID);
    let noons = getNoonsAsObj();
    let mergedMeetings = mergeNoonsToMeetings(noons, getMeetingsAsObj());

    generateNoons(cal, noons);
    generateMeetings(cal, mergedMeetings);
    MyLogger.showLog();
}

function generateMeetings(cal:Calendar, meetings:MeetingInfo[]) {
    let rangeByName = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(AREA_NAME_MEETINGS);
    if (rangeByName === null){
        throw new Error("Folgender bereich wurde nicht gesetzt: "+AREA_NAME_MEETINGS)
    }
    for (let i = 0; i < meetings.length; i++) {
        let meeting = meetings[i];

        let id = upsertMeetingCalender(cal, meeting)

        // set Calender Id to Sheet
        rangeByName.getCell((i + 1) /*Index + 1 */, 8).setValue(id);
    }
}

function generateNoons(cal:Calendar, noons:NoonInfo[]):void {
    let rangeByName = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(AREA_NAME_NOON);
    if (rangeByName === null){
        throw new Error("Folgender bereich wurde nicht gesetzt: "+AREA_NAME_NOON)
    }
    for (let i = 0; i < noons.length; i++) {
        let noon = noons[i];

        let id = upsertNoonCalender(cal, noon)

        // set Calender Id to Sheet
        rangeByName.getCell((i + 1) /*Index + 1 */, 8).setValue(id);
    }
}

function upsertNoonCalender(cal:Calendar, noon:NoonInfo):string {
    let title = `Jungschi [ ${noon.place} ]`;
    let context = getNoonContext(noon);

    let place = (noon.place.trim() === "MK" ? "Markuskirche Luzern" : noon.place);
    let calEvent:CalendarEvent | null = null

    if (typeof noon.calId === "string") {
        calEvent = cal.getEventById(noon.calId);
    }
    if (calEvent === null) {
        calEvent = cal.createEvent(title, noon.startDate, noon.endDate);
    } else {
        calEvent.setTitle(title);
        calEvent.setTime(noon.startDate, noon.endDate);
    }
    calEvent.setDescription(context);
    calEvent.setLocation(place);

    return calEvent.getId();
}

function upsertMeetingCalender(cal:Calendar, meeting:MeetingInfo) {
    const normalMeeting = meeting.normalMeeting;
    let title = normalMeeting ? "Jungschisitzung" : meeting.meetingType;
    let context = getMeetingContext(meeting);

    let place = (meeting.place.trim() === "Sekretariat" ? "Sekretariat Markuskirche Luzern" : (meeting.place.trim() === "MK" ? "Markuskirche Luzern" : meeting.place));
    let calEvent:CalendarEvent|null = null;

    if (typeof meeting.calId === "string") {
        calEvent = cal.getEventById(meeting.calId);
    }
    if (calEvent === null) {
        calEvent = cal.createEvent(title, meeting.startDate, meeting.endDate);
    } else {
        calEvent.setTitle(title);
        calEvent.setTime(meeting.startDate, meeting.endDate);
    }
    calEvent.setDescription(context);
    calEvent.setLocation(place);

    return calEvent.getId();
}

function getMeetingContext(meeting:MeetingInfo):string {

    let context = [];

    if (isValidEntry(meeting.mProtocol))
        context.push(`Protokoll: ${meeting.mProtocol}`);

    if (isValidEntry(meeting.mInput)) {
        const prefix = (meeting.normalMeeting || isSemestersitzung(meeting)) ? "Lead & Input" : "Input";
        context.push(`${prefix}: ${meeting.mInput}`)
    }

    if (isValidEntry(meeting.mDesert)) {
        const prefix = isMorning(meeting.startDate) ? "Gipfeli" : "Dessert";
        context.push(`${prefix}: ${meeting.mDesert}`)
    }

    // Add Noons
    if (isMergedMeeting(meeting)) {
        context.push("");
        context.push("Nachmittage:");
        const noons = meeting.noons;
        for (let i = 0; i < noons.length; i++) {
            const noon = noons[i];
            context.push(`${noon.name}: ${noon.lead}`)
        }
    }

    return context.join("\n");

}

function isMergedMeeting(meeting:MeetingInfo):meeting is MergedNormalMeetingInfo{
    return (meetingIsNormalMeeting(meeting) &&  meeting.noons.length >= 0)
}

function isSpecialMeeting(meeting:MeetingInfo):meeting is SpecialMeetingInfo{
    return !meeting.normalMeeting
}

function isSemestersitzung(meeting:MeetingInfo):meeting is SpecialMeetingInfo {
    return isSpecialMeeting(meeting)
        && (meeting.meetingType === "semestersitzung"
            || isIdenticalWithTolerance(meeting.meetingType, "semestersitzung"))// Typo Prevention
}

function isIdenticalWithTolerance(str1:string, str2:string) {
    if (str1.length !== str2.length) {
        return false;
    }
    let tolerance = 3;
    for (let i = 0; i < str1.length; i++) {
        if (str1[i] !== str2[i]) {
            tolerance -= 1;
            if (tolerance < 0) {
                return false;
            }
        }
    }
    return true;
}


function isMorning(date:Date) {
    const hours = date.getHours();
    return hours >= 0 && hours < 12;
}

function isValidEntry(name:any): name is ValidField {
    return isValidString(name) && (name.trim().length > 2);
}

function getNoonContext(noon:NoonInfo):string {
    let context = [
        `Thema: ${noon.name}`,
        `Tagesleitung: ${noon.lead}`
    ]
    if (isValidString(noon.lunch)) {
        context.push(`Mittagessen: ${noon.lunch}`)
    }
    if (isValidString(noon.impMessage)) {
        context.push(noon.impMessage)
    }
    return context.join("\n");
}

function isValidString(toTest:any): toTest is string {
    return (toTest && typeof toTest === "string" && toTest.trim().length > 0)
}

function meetingIsNormalMeeting(meeting:MeetingInfo):meeting is NormalMeetingInfo {
    return meeting.normalMeeting;
}

function mergeNoonsToMeetings(leNoons:NoonInfo[], leMeetings:MeetingInfo[]) {
    let meetings = leMeetings;
    for (let i = 0; i < meetings.length; i++) {
        let meeting = meetings[i]
        if (meetingIsNormalMeeting(meeting)) {
            let meetingNoons = meeting.noons;
            let meetingNoonObjs = [];
            for (let j = 0; j < meetingNoons.length; j++) {
                let noonInfo = findNoonByDate(leNoons, meetingNoons[j]);
                if (noonInfo){
                    meetingNoonObjs.push(noonInfo)
                }
                else {
                    MyLogger.warn("Folgender Nachmittag der Sitzung vom "+ meeting.date+ " wurde nich gefunden:"+ meetingNoons[j] )
                }
            }
            meetings[i].noons = meetingNoonObjs;
        }
    }
    return meetings;
}

function findNoonByDate(noons:NoonInfo[], date:NoonDate) {
    return noons.find(value => {
        return (typeof value.date === "string" ? value.date.trim() : `${value.date.getDate()}.${value.date.getMonth() + 1}.${value.date.getFullYear()}`) === date.trim();
    });
}

function getMeetingsAsObj():MeetingInfo[] {
    let meetings = DataRangeManger.getDataByRange(AREA_NAME_MEETINGS);
    let meetingObjs = [];
    for (let i = 0; i < meetings.length; i++) {
        let meeting = meetings[i];
        if (isValidMeetingEntryFields(meeting)){
            meetingObjs.push(meetingArrayToObject(meeting));
        }
        else {
            MyLogger.info("Sitzung Nr:" + (i+1) +" wurde übersprungen")
        }
    }
    return meetingObjs;
}

function isValidNoonEntryFields(array:any[]):array is NoonEntryFields {
    return isValidEntryArray(array)
}
function isValidMeetingEntryFields(array:any[]):array is MeetingEntryFields {
    return isValidEntryArray(array) && isValidEntry(array[5])
}
function isValidEntryArray(array: any[]): array is ValidEntryFields{
    if (array.length < 8)
        return false;

    return isValidDateField(array[0]) && isValidTimePlaceField(array[1])
}


function getNoonsAsObj():NoonInfo[] {
    let noons = DataRangeManger.getDataByRange(AREA_NAME_NOON);
    let noonObjs = []
    for (let i = 0; i < noons.length; i++) {
        let noon = noons[i];

        if (isValidNoonEntryFields(noon)){
            noonObjs.push(noonArrayToObject(noon));

        }
        else {
            MyLogger.info("Nachmittag Nr:" + (i+1) +" wurde übersprungen")
        }


    }
    return noonObjs;
}
function isValidDateField(field: any): field is DateField {
    if (field === "Datum")
        return false;
    if (field instanceof Date)
        return true;
    return isValidEntry(field)
}
const TimePlaceRegexp = new RegExp("[ ]{0,2}[0-2]?[0-9]:[0-5]?[0-9][ ]{0,2}[\\/][ ]{0,2}[a-zA-Z]{3,20}[ ]{0,2}")
function isValidTimePlaceField(field:any):field is TimePlaceField {
    return (isValidEntry(field) && TimePlaceRegexp.test(field));
}


function noonArrayToObject(array:NoonEntryFields):NoonInfo {
    let date = array[0]
    let timePlace = array[1].split("/") // 00:00 / Place to ["00:00", "Place"]
    let time = timePlace[0].trim().split(":") // " 00:00 " to ["00","00"]
    let startDate = new Date(date);
    let endDate = new Date(date);

    startDate.setHours(parseInt(time[0]));
    startDate.setMinutes(parseInt(time[1]));

    endDate.setHours(NOON_END_TIME[0]);
    endDate.setMinutes(NOON_END_TIME[1]);

    return {
        date,
        startDate,
        endDate,
        place: timePlace[1],
        name: array[2],
        lead: array[3],
        lunch: array[4],
        excused: array[5],
        impMessage: array[6],
        calId: array[7]
    }
}
const MeetingListRegexp = new RegExp("[\.0-9]{3,} ?[\.0-9]*");

function isNormalMeeting(meetingContext:any): meetingContext is NoonList {
    return isValidEntry(meetingContext) && MeetingListRegexp.test(meetingContext)
}


function meetingArrayToObject(array:MeetingEntryFields):MeetingInfo {
    let date = array[0]
    let timePlace = array[1].split("/") // 00:00 / Place to ["00:00", "Place"]
    let time = timePlace[0].trim().split(":") // " 00:00 " to ["00","00"]
    let startDate = new Date(date);
    let endDate = new Date(date);
    let meetingContext = array[5];
    let normalMeeting = isNormalMeeting(meetingContext);



    startDate.setHours(parseInt(time[0]));
    startDate.setMinutes(parseInt(time[1]));

    if (normalMeeting) {
        endDate.setHours(MEETING_END_TIME[0]);
        endDate.setMinutes(MEETING_END_TIME[1]);
    } else {
        endDate.setHours(parseInt(time[0]) + 2);
        endDate.setMinutes(parseInt(time[1]));
    }


    let obj:MeetingInfo = {
        date,
        startDate,
        endDate,
        normalMeeting,
        place: timePlace[1],
        mProtocol: array[2],
        mInput: array[3],
        mDesert: array[4],
        excused: array[6],
        calId: array[7],
    }
    if (isNormalMeeting(meetingContext)) {
        obj.noons = meetingContext.split(" ");
    } else {
        obj.meetingType = isValidEntry(meetingContext) ? meetingContext : "Unbenannte Sitzung";
    }
    return obj;
}
