import {
    DateField,
    MeetingEntryFields,
    MeetingInfo, MergedNormalMeetingInfo,
    NoonEntryFields, NoonList,
    NormalMeetingInfo, SpecialMeetingInfo, TimePlaceField,
    ValidEntryFields,
    ValidField
} from "./specific-types";
import {Constant} from "./Constant";

export class Validator {
    static isValidEntry(name: any): name is ValidField {
        return Validator.isValidString(name) && (name.trim().length > 2);
    }

    static isValidString(toTest: any): toTest is string {
        return (toTest && typeof toTest === "string" && toTest.trim().length > 0)
    }

    static meetingIsNormalMeeting(meeting: MeetingInfo): meeting is NormalMeetingInfo {
        return meeting.normalMeeting;
    }

    static isValidNoonEntryFields(array: any[]): array is NoonEntryFields {
        return Validator.isValidEntryArray(array)
    }

    static isValidMeetingEntryFields(array: any[]): array is MeetingEntryFields {
        return Validator.isValidEntryArray(array) && Validator.isValidEntry(array[5])
    }

    static isValidEntryArray(array: any[]): array is ValidEntryFields {
        if (array.length < 8)
            return false;

        return Validator.isValidDateField(array[0]) && Validator.isValidTimePlaceField(array[1])
    }

    static isValidTimePlaceField(field: any): field is TimePlaceField {
        return (Validator.isValidEntry(field) && Constant.TimePlaceRegexp.test(field));
    }

    static isNormalMeeting(meetingContext: any): meetingContext is NoonList {
        return Validator.isValidEntry(meetingContext) && Constant.MeetingListRegexp.test(meetingContext)
    }

    static isValidDateField(field: any): field is DateField {
        if (field === "Datum")
            return false;
        if (field instanceof Date)
            return true;
        return Validator.isValidEntry(field)
    }

    static isMorning(date: Date) {
        const hours = date.getHours();
        return hours >= 0 && hours < 12;
    }

    static isMergedMeeting(meeting: MeetingInfo): meeting is MergedNormalMeetingInfo {
        return (Validator.meetingIsNormalMeeting(meeting) && meeting.noons.length >= 0)
    }

    static isSpecialMeeting(meeting: MeetingInfo): meeting is SpecialMeetingInfo {
        return !meeting.normalMeeting
    }

    static isSemestersitzung(meeting: MeetingInfo): meeting is SpecialMeetingInfo {
        return Validator.isSpecialMeeting(meeting)
            && (meeting.meetingType === "semestersitzung"
                || Validator.isIdenticalWithTolerance(meeting.meetingType, "semestersitzung"))// Typo Prevention
    }

    static isIdenticalWithTolerance(str1: string, str2: string) {
        if (str1.length !== str2.length) {
            return false;
        }
        let tolerance = 3;
        for (let i = 0; i < str1.length; i++) {
            if (str1[i] !== str2[i]) {
                tolerance -= 1;
                if (tolerance < 0) {
                    return false;
                }
            }
        }
        return true;
    }
}