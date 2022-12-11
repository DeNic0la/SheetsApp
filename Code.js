

const AREA_NAME_NOON = "nachmittage"
const AREA_NAME_MEETINGS= "sitzungen"

const NOON_END_TIME = [17,15]





function onOpen() {
    let ui = SpreadsheetApp.getUi();
    ui.createAddonMenu().addItem("testFunction", "myTest")
        .addToUi();
}

function myTest() {
    console.log("Hello this is a test");
    SpreadsheetApp.getUi().alert("Test");
}
function onInstall(){
    onOpen();
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
