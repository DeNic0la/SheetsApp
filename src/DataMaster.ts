import {MeetingInfo, NoonDate, NoonInfo} from "./specific-types";
import {Validator} from "./Validator";
import {MyLogger} from "./Logger";

export class DataMaster {
    static mergeNoonsToMeetings(leNoons: NoonInfo[], leMeetings: MeetingInfo[]) {
        let meetings = leMeetings;
        for (let i = 0; i < meetings.length; i++) {
            let meeting = meetings[i]
            if (Validator.meetingIsNormalMeeting(meeting)) {
                let meetingNoons = meeting.noons;
                let meetingNoonObjs = [];
                for (let j = 0; j < meetingNoons.length; j++) {
                    let noonInfo = DataMaster.findNoonByDate(leNoons, meetingNoons[j]);
                    if (noonInfo) {
                        meetingNoonObjs.push(noonInfo)
                    } else {
                        MyLogger.info("Folgender Nachmittag der Sitzung vom " + meeting.date + " wurde nich gefunden:" + meetingNoons[j]+"- "+JSON.stringify(meeting))
                    }
                }
                meetings[i].noons = meetingNoonObjs;
            }
        }
        return meetings;
    }

    static getNoonContext(noon: NoonInfo): string {
        let context = [
            `Thema: ${noon.name}`,
            `Tagesleitung: ${noon.lead}`
        ]
        if (Validator.isValidString(noon.lunch)) {
            context.push(`Mittagessen: ${noon.lunch}`)
        }
        if (Validator.isValidString(noon.impMessage)) {
            context.push(noon.impMessage)
        }
        return context.join("\n");
    }

    static getMeetingContext(meeting: MeetingInfo): string {

        let context = [];

        if (Validator.isValidEntry(meeting.mProtocol))
            context.push(`Protokoll: ${meeting.mProtocol}`);

        if (Validator.isValidEntry(meeting.mInput)) {
            const prefix = (meeting.normalMeeting || Validator.isSemestersitzung(meeting)) ? "Lead & Input" : "Input";
            context.push(`${prefix}: ${meeting.mInput}`)
        }

        if (Validator.isValidEntry(meeting.mDesert)) {
            const prefix = Validator.isMorning(meeting.startDate) ? "Gipfeli" : "Dessert";
            context.push(`${prefix}: ${meeting.mDesert}`)
        }

        // Add Noons
        if (Validator.isMergedMeeting(meeting)) {
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

    static findNoonByDate(noons: NoonInfo[], date: NoonDate):NoonInfo|undefined {
        return noons.find(value => {
            let val = (typeof value.date === "string" ? new Date(value.date) : value.date)
            let d = ('0' + val.getDate()).slice(-2) + '.'
                + ('0' + (val.getMonth() + 1)).slice(-2) + '.'
                + val.getFullYear();
            return d === date.trim()
        })

    }
}