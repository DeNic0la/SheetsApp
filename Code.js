

const AREA_NAME_NOON = "nachmittage"
const AREA_NAME_MEETINGS= "sitzungen"

const NOON_END_TIME = [17,15];
const MEETING_END_TIME = [20,15];

const CALENDER_ID = "hv0f19qpcmhch895bu4akmk6o4@group.calendar.google.com";


function onOpen() {
    let ui = SpreadsheetApp.getUi();
    ui.createAddonMenu().addItem("testFunction", "myTest")
        .addItem("generateCalEvents","generateCalEvents")
        .addToUi();
}

function myTest() {
    console.log("Hello this is a test");
    SpreadsheetApp.getUi().alert("Test");
}
function onInstall(){
    onOpen();
}


function generateCalEvents(){

    let cal = CalendarApp.getCalendarById(CALENDER_ID);
    let noons = getNoonsAsObj();
    let mergedMeetings = mergeNoonsToMeetings(noons, getMeetingsAsObj());

    let name = cal.getName();
    console.log(name);
    SpreadsheetApp.getUi().alert(name);


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
        if (meeting[0].trim().length <= 0)// Skip Empty
            continue;

        meetingObjs.push(meetingArrayToObject(meeting));
    }
    return meetingObjs;
}

function getNoonsAsObj(){
    let noons = getDataByRange(AREA_NAME_NOON);
    let noonObjs = []
    for (let i = 0; i < noons.length; i++) {
        let noon = noons[i];
        if (noon[0].trim().length <= 0) // Skip Empty
            continue;

        noonObjs.push(noonArrayToObject(noon));
    }
    return noonObjs;
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
