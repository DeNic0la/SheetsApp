import {MeetingEntryFields, MeetingInfo, NoonEntryFields, NoonInfo} from "./specific-types";
import {DataRangeManger} from "./DataRangeManger";
import {MyLogger} from "./Logger";
import {Validator} from "./Validator";
import {Constant} from "./Constant";

const AREA_NAME_NOON = "nachmittage"

export class SheetsMaster {

    static getNoonsAsObj(): NoonInfo[] {
        let noons = DataRangeManger.getDataByRange(AREA_NAME_NOON);
        let noonObjs = []
        for (let i = 0; i < noons.length; i++) {
            let noon = noons[i];

            if (Validator.isValidNoonEntryFields(noon)) {
                noonObjs.push(SheetsMaster.noonArrayToObject(noon));

            } else {
                MyLogger.info("Nachmittag Nr:" + (i + 1) + " wurde übersprungen")
            }


        }
        return noonObjs;
    }

    static noonArrayToObject(array: NoonEntryFields): NoonInfo {
        let date = array[0]
        let timePlace = array[1].split("/") // 00:00 / Place to ["00:00", "Place"]
        let time = timePlace[0].trim().split(":") // " 00:00 " to ["00","00"]
        let startDate = new Date(date);
        let endDate = new Date(date);

        startDate.setHours(parseInt(time[0]));
        startDate.setMinutes(parseInt(time[1]));

        endDate.setHours(Constant.NOON_END_TIME[0]);
        endDate.setMinutes(Constant.NOON_END_TIME[1]);

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

    static meetingArrayToObject(array: MeetingEntryFields): MeetingInfo {
        let date = array[0]
        let timePlace = array[1].split("/") // 00:00 / Place to ["00:00", "Place"]
        let time = timePlace[0].trim().split(":") // " 00:00 " to ["00","00"]
        let startDate = new Date(date);
        let endDate = new Date(date);
        let meetingContext = array[5];
        let normalMeeting = Validator.isNormalMeeting(meetingContext);


        startDate.setHours(parseInt(time[0]));
        startDate.setMinutes(parseInt(time[1]));

        if (normalMeeting) {
            endDate.setHours(Constant.MEETING_END_TIME[0]);
            endDate.setMinutes(Constant.MEETING_END_TIME[1]);
        } else {
            endDate.setHours(parseInt(time[0]) + 2);
            endDate.setMinutes(parseInt(time[1]));
        }


        let obj: MeetingInfo = {
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
        if (Validator.isNormalMeeting(meetingContext)) {
            obj.noons = meetingContext.split(" ");
        } else {
            obj.meetingType = Validator.isValidEntry(meetingContext) ? meetingContext : "Unbenannte Sitzung";
        }
        return obj;
    }

    static getMeetingsAsObj(): MeetingInfo[] {
        let meetings = DataRangeManger.getDataByRange(Constant.AREA_NAME_MEETINGS);
        let meetingObjs = [];
        for (let i = 0; i < meetings.length; i++) {
            let meeting = meetings[i];
            if (Validator.isValidMeetingEntryFields(meeting)) {
                meetingObjs.push(SheetsMaster.meetingArrayToObject(meeting));
            } else {
                MyLogger.info("Sitzung Nr:" + (i + 1) + " wurde übersprungen")
            }
        }
        return meetingObjs;
    }


}