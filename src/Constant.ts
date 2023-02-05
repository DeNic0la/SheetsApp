export class Constant {
    static TimePlaceRegexp: RegExp;
    static MeetingListRegexp: RegExp;
    static AREA_NAME_NOON: string;
    static NOON_END_TIME: number[];
    static MEETING_END_TIME: number[];
    static AREA_NAME_MEETINGS: string;
}
Constant.TimePlaceRegexp = new RegExp("[ ]{0,2}[0-2]?[0-9]:[0-5]?[0-9][ ]{0,2}[\\/][ ]{0,2}[a-zA-ZäöüÄÖÜ]{2,20}[ ]{0,2}");
Constant.MeetingListRegexp = new RegExp("[\.0-9]{3,} ?[\.0-9]*");

Constant.AREA_NAME_NOON = "nachmittage"
Constant.AREA_NAME_MEETINGS = "sitzungen"

Constant.NOON_END_TIME = [17, 15];
Constant.MEETING_END_TIME = [20, 15];

//Constant.CALENDER_ID = "hv0f19qpcmhch895bu4akmk6o4@group.calendar.google.com";