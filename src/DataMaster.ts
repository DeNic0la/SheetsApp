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
                        MyLogger.warn("Folgender Nachmittag der Sitzung vom " + meeting.date + " wurde nich gefunden:" + meetingNoons[j]+"- "+JSON.stringify(meeting))
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
        let search = new Date(date).getTime();
        let darray: string[] = []
        let a =  noons.find(value => {
            let val = (typeof value.date === "string" ? new Date(value.date): value.date)
            if (val.getTime() === search)
                return true;
            let d = ""+value.startDate.getDate()+"."+(value.startDate.getMonth()+1)+"."+value.startDate.getFullYear();
            darray.push(d);
            return d === date.trim()
        });
        MyLogger.info("Equals: "+a+" {"+ JSON.stringify(darray)+"|"+date+"}")

        return a
        let lookupDateTime = new Date(date).getTime();

        return noons.find(value => {
            let val = (typeof value.date === "string" ? new Date(value.date): value.date)
            let a = (lookupDateTime === val.getTime())
            if (a){
                MyLogger.info("Equals: "+a+" {"+ JSON.stringify(value)+"|"+date+"}")

            }
            return a;
        });
    }
}