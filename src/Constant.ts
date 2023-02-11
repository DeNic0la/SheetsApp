export class Constant {
    static TimePlaceRegexp: RegExp;
    static MeetingListRegexp: RegExp;
    static AREA_NAME_NOON: string;
    static NOON_END_TIME: number[];
    static MEETING_END_TIME: number[];
    static AREA_NAME_MEETINGS: string;
    static PROPERTY_NAME_UI_DATA: string;
    static PROPERTY_NAME_CALLBACK_DATA: string;

}
Constant.TimePlaceRegexp = new RegExp("[ ]{0,2}[0-2]?[0-9]:[0-5]?[0-9][ ]{0,2}[\\/][ ]{0,2}[a-zA-ZäöüÄÖÜ]{2,20}[ ]{0,2}");
Constant.MeetingListRegexp = new RegExp("[\.0-9]{3,} ?[\.0-9]*");

Constant.AREA_NAME_NOON = "nachmittage"
Constant.AREA_NAME_MEETINGS = "sitzungen"

Constant.NOON_END_TIME = [17, 15];
Constant.MEETING_END_TIME = [20, 15];
Constant.PROPERTY_NAME_UI_DATA = "UiData"
Constant.PROPERTY_NAME_CALLBACK_DATA = "CallbackData"

