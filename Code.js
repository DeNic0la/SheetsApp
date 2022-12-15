

const AREA_NAME_NOON = "nachmittage"
const AREA_NAME_MEETINGS= "sitzungen"

const NOON_END_TIME = [17,15];
const MEETING_END_TIME = [20,15];

const CALENDER_ID = "hv0f19qpcmhch895bu4akmk6o4@group.calendar.google.com";


function onOpen() {
    let ui = SpreadsheetApp.getUi();
    ui.createAddonMenu()
        .addItem("generateCalEvents","generateCalEvents")
        .addItem("Check Permissions","checkPermissions")
        .addToUi();
}

function myTest() {
    console.log("Hello this is a test");
    SpreadsheetApp.getUi().alert("Test");
}
function onInstall(){
    onOpen();
}

function checkPermissions(){
    let name = CalendarApp.getName();
    if (name.length > 0){
        SpreadsheetApp.getUi().alert("You have granted all the Required permissions")
    }
}

function generateCalEvents(){

    let cal = CalendarApp.getCalendarById(CALENDER_ID);
    let noons = getNoonsAsObj();
    let mergedMeetings = mergeNoonsToMeetings(noons, getMeetingsAsObj());

    generateNoons(cal,noons);
}

function generateNoons(cal, noons) {
    let rangeByName = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(AREA_NAME_NOON);

    for (let i = 0; i < noons.length; i++) {
        let noon = noons[i];

        let id = upsertNoonCalender(cal,noon)

        // set Calender Id to Sheet
        rangeByName.getCell((i+1) /*Index + 1 */,8).setValue( id );
    }
}

function upsertNoonCalender(cal,noon){
    let title = `Jungschi [ ${noon.place} ]`;
    let context = getNoonContext(noon);

    let place = (noon.place.trim() === "MK" ? "Markuskirche Luzern" : noon.place);
    let calEvent = cal.getEventById(noon.calId);
    if (calEvent === null){
        calEvent = cal.createEvent(title, noon.startDate, noon.endDate);
    }
    else {
        calEvent.setTitle(title);
        calEvent.setTime(noon.startDate, noon.endDate);
    }
    calEvent.setDescription(context);
    calEvent.setLocation(place);

    return calEvent.getId();
}

function getNoonContext(noon){
    let context = [
        `Thema: ${noon.name}`,
        `Tagesleitung: ${noon.lead}`
    ]
    if (isValidString(noon.lunch)){
        context.push(`Mittagessen: ${noon.lunch}`)
    }
    if (isValidString(noon.impMessage)){
        context.push(noon.impMessage)
    }
    return context.join("\n");
}

function isValidString(toTest){
    return (toTest && typeof toTest === "string" && toTest.trim().length > 0)
}
function mergeNoonsToMeetings(leNoons,leMeetings){
    let meetings = leMeetings;
    for (let i = 0; i < meetings.length; i++) {
        if (meetings[i].normalMeeting){
            let meetingNoons = meetings[i].noons;
            let meetingNoonObjs = [];
            for (let j = 0; j < meetingNoons; j++) {
                meetingNoonObjs.push(findNoonByDate(leNoons,meetingNoons[j]))
            }
            meetings[i].noons = meetingNoonObjs;
        }
    }
    return meetings;
}

function findNoonByDate(noons,date){
    return  noons.find(value => {return value.date.trim() === date.trim()});
}

function getMeetingsAsObj(){
    let meetings = getDataByRange(AREA_NAME_MEETINGS);
    let meetingObjs = [];
    for (let i = 0; i < meetings.length; i++) {
        let meeting = meetings[i];
        if ( isEmpty(meeting[0]) )
            continue;// Skip Empty

        meetingObjs.push(meetingArrayToObject(meeting));
    }
    return meetingObjs;
}


function getNoonsAsObj(){
    let noons = getDataByRange(AREA_NAME_NOON);
    let noonObjs = []
    for (let i = 0; i < noons.length; i++) {
        let noon = noons[i];
        if ( isEmpty(noon[0]) )
            continue;// Skip Empty

        noonObjs.push(noonArrayToObject(noon));
    }
    return noonObjs;
}

function isEmpty(dateField) {
    if (dateField === "Datum")
        return true;
    if (dateField instanceof Date){
        return false;
    }
    else if (typeof dateField === 'string') {
        return (dateField.trim().length <= 0)
    }
    else {
        return (dateField.toString().trim().length <= 0)
    }
}

function getDataByRange(rangeName) {
    return SpreadsheetApp.getActiveSpreadsheet().getRangeByName(rangeName).getValues();
}
function noonArrayToObject(array){
    let date = array[0]
    let timePlace = array[1].split("/") // 00:00 / Place to ["00:00", "Place"]
    let time = timePlace[0].trim().split(":") // " 00:00 " to ["00","00"]
    let startDate = new Date(date);
    let endDate = new Date(date);

    startDate.setHours(parseInt(time[0]));
    startDate.setMinutes(parseInt(time[1]));

    endDate.setHours(NOON_END_TIME[0]);
    endDate.setMinutes(NOON_END_TIME[1]);

    return  {
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

function isNormalMeeting(meetingContext) {
    const regexp = "[\.0-9]{3,} ?[\.0-9]*";
    return (meetingContext.match(regexp) || meetingContext.trim() === "Semestersitzung")
}

function meetingArrayToObject(array){
    let date = array[0]
    let timePlace = array[1].split("/") // 00:00 / Place to ["00:00", "Place"]
    let time = timePlace[0].trim().split(":") // " 00:00 " to ["00","00"]
    let startDate = new Date(date);
    let endDate = new Date(date);

    let meetingContext = array[5];
    let normalMeeting = isNormalMeeting(meetingContext);

    startDate.setHours(parseInt(time[0]));
    startDate.setMinutes(parseInt(time[1]));

    if (isNormalMeeting){
        endDate.setHours(MEETING_END_TIME[0]);
        endDate.setMinutes(MEETING_END_TIME[1]);
    }
    else {
        endDate.setHours(parseInt(time[0]) + 2);
        endDate.setMinutes(parseInt(time[1]));
    }


    let obj =  {
        date,
        startDate,
        endDate,
        normalMeeting,
        place: timePlace[1],
        mProtocol: array[2],
        mInput: array[3],
        mDesert: array[4],
        excused: array[6],
        calId: array[7]
    }
    if (normalMeeting){
        obj.noons = meetingContext.split(" ");
    }
    else {
        obj.meetingType = meetingContext;
    }
    return obj;
}
