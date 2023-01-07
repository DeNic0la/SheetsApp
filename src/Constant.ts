export class Constant {
    static TimePlaceRegexp = new RegExp("[ ]{0,2}[0-2]?[0-9]:[0-5]?[0-9][ ]{0,2}[\\/][ ]{0,2}[a-zA-Z]{3,20}[ ]{0,2}")
    static MeetingListRegexp = new RegExp("[\.0-9]{3,} ?[\.0-9]*");

    static AREA_NAME_NOON = "nachmittage"
    static AREA_NAME_MEETINGS = "sitzungen"

    static NOON_END_TIME = [17, 15];
    static MEETING_END_TIME = [20, 15];

    static CALENDER_ID = "hv0f19qpcmhch895bu4akmk6o4@group.calendar.google.com";
}