import {Calendar, CalendarEvent, DateEntryInfo, MeetingInfo, NoonInfo} from "./specific-types";
import {Constant} from "./Constant";
import {DataMaster} from "./DataMaster";
import {DataRangeManger} from "./DataRangeManger";
import {MyLogger} from "./Logger";

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
            rangeByName.getCell((meeting.indexInNamedRange + 1) /*Index + 1 */, 8).setValue(id);
        }
    }

    static generateNoons(cal: Calendar, noons: NoonInfo[]): void {
        let rangeByName = DataRangeManger.getRange(Constant.AREA_NAME_NOON);

        let result = [];
        for (let noon of noons) {
            if (noon.calId){
                let eventById = cal.getEventById(noon.calId);
                noon.event = eventById
                result.push(eventById)
            }
        }


        for (let noon of noons){
            if (noon.event){
                let info = this.getNoonCalenderInfo(noon);
                if (noon.event.getTitle() === info.title
                    && noon.event.getDescription() === info.context)
                    continue;

                noon.event.setTitle(info.title)
                noon.event.setTime(noon.startDate,noon.endDate)
                noon.event.setDescription(info.context)
                noon.event.setLocation(info.place)
            }
        }

        let idsToPatch:{index:number,calEv: GoogleAppsScript.Calendar.CalendarEvent}[] = []
        for (let noon of noons){
            if (!noon.event){
                let info = this.getNoonCalenderInfo(noon);
                let calendarEvent = cal.createEvent(info.title,noon.startDate,noon.endDate,{
                    description: info.context,
                    place: info.place
                });
                idsToPatch.push({index: noon.indexInNamedRange,calEv:calendarEvent})
            }
        }


        for (let patchObj of idsToPatch) {
            rangeByName.getCell(patchObj.index+1,8).setValue(patchObj.calEv.getId());
        }

    }

    static getMeetingCalenderInfo(meeting: MeetingInfo) {
        const normalMeeting = meeting.normalMeeting;

        return {
            title: normalMeeting ? "Jungschisitzung" : meeting.meetingType,
            place:  (meeting.place.trim() === "Sekretariat" ? "Sekretariat Markuskirche Luzern" : (meeting.place.trim() === "MK" ? "Markuskirche Luzern" : meeting.place)),
            context: DataMaster.getMeetingContext(meeting)
        }
    }

    static getNoonCalenderInfo(noon: NoonInfo) {
        return {
            title: `Jungschi [ ${noon.place} ]`,
            place:  (noon.place.trim() === "MK" ? "Markuskirche Luzern" : noon.place),
            context: DataMaster.getNoonContext(noon)
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
            calEvent = cal.createEvent(title, meeting.startDate, meeting.endDate,{
                description: context,
                place: place
            });
            return calEvent.getId();
        }
        if (calEvent.getTitle() === title && calEvent.getDescription() === context){
            return calEvent.getId();
        }
        calEvent.setTitle(title);
        calEvent.setTime(meeting.startDate, meeting.endDate);
        calEvent.setDescription(context);
        calEvent.setLocation(place);

        return calEvent.getId();
    }


}