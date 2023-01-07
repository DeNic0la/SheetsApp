import {Calendar, CalendarEvent, MeetingInfo, NoonInfo} from "./specific-types";
import {Constant} from "./Constant";
import {DataMaster} from "./DataMaster";

export class CalendarMaster {
    static generateMeetings(cal: Calendar, meetings: MeetingInfo[]) {
        let rangeByName = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(Constant.AREA_NAME_MEETINGS);
        if (rangeByName === null) {
            throw new Error("Folgender bereich wurde nicht gesetzt: " + Constant.AREA_NAME_MEETINGS)
        }
        for (let i = 0; i < meetings.length; i++) {
            let meeting = meetings[i];

            let id = CalendarMaster.upsertMeetingCalender(cal, meeting)

            // set Calender Id to Sheet
            rangeByName.getCell((i + 1) /*Index + 1 */, 8).setValue(id);
        }
    }

    static generateNoons(cal: Calendar, noons: NoonInfo[]): void {
        let rangeByName = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(Constant.AREA_NAME_NOON);
        if (rangeByName === null) {
            throw new Error("Folgender bereich wurde nicht gesetzt: " + Constant.AREA_NAME_NOON)
        }
        for (let i = 0; i < noons.length; i++) {
            let noon = noons[i];

            let id = CalendarMaster.upsertNoonCalender(cal, noon)

            // set Calender Id to Sheet
            rangeByName.getCell((i + 1) /*Index + 1 */, 8).setValue(id);
        }
    }

    static upsertNoonCalender(cal: Calendar, noon: NoonInfo): string {
        let title = `Jungschi [ ${noon.place} ]`;
        let context = DataMaster.getNoonContext(noon);

        let place = (noon.place.trim() === "MK" ? "Markuskirche Luzern" : noon.place);
        let calEvent: CalendarEvent | null = null

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

    static upsertMeetingCalender(cal: Calendar, meeting: MeetingInfo) {
        const normalMeeting = meeting.normalMeeting;
        let title = normalMeeting ? "Jungschisitzung" : meeting.meetingType;
        let context = DataMaster.getMeetingContext(meeting);

        let place = (meeting.place.trim() === "Sekretariat" ? "Sekretariat Markuskirche Luzern" : (meeting.place.trim() === "MK" ? "Markuskirche Luzern" : meeting.place));
        let calEvent: CalendarEvent | null = null;

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
}