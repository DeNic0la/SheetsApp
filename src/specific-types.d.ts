type DateField = string | Date;
type TimePlaceField = `${number}:${number} / ${string}`;// 00:00 / Place
type TopicField = string | undefined | null;
type LeadField = string | undefined | null;
type LunchField = string | undefined | null;
type ProtocolField = string | undefined | null;
type InputField = string | undefined | null;
type DessertField = string | undefined | null;
type MeetingContextField = string | undefined | null;
type ExcusedField = string | undefined | null;
type MessageField = string | undefined | null;
type CalenderIdField = string | undefined | null;
type NoonEntryFields = [DateField, TimePlaceField, TopicField, LeadField, LunchField, ExcusedField, MessageField, CalenderIdField]
type MeetingEntryFields = [DateField, TimePlaceField, ProtocolField, InputField, DessertField, MeetingContextField, ExcusedField, CalenderIdField]
type ValidField = string
type ValidEntryFields = NoonEntryFields | MeetingEntryFields;
type NoonList = `${NoonDate} ${NoonDate}` | NoonDate;
type NoonDate = `${number}.${number}.${number}`;

interface DateEntryInfo {
    date: DateField,
    startDate: Date,
    endDate: Date,
    place: string,
    calId: CalenderIdField,
    excused: ExcusedField,
    /**
     * Represents the Index the Entry has in the Range.
     */
    indexInNamedRange: number,

}


interface NoonInfo extends DateEntryInfo {
    name: TopicField,
    lead: LeadField,
    lunch: LunchField,
    impMessage: MessageField,
}

interface MeetingInfo extends DateEntryInfo {
    normalMeeting: boolean,
    mProtocol: ProtocolField,
    mInput: InputField,
    mDesert: DessertField
    noons?: any,
    meetingType?: any,

}

interface NormalMeetingInfo extends MeetingInfo {
    noons: NoonDate[]
}

interface MergedNormalMeetingInfo extends MeetingInfo {
    noons: NoonInfo[]
}

interface SpecialMeetingInfo extends MeetingInfo {
    meetingType: string
}

export {
    DateField,
    TimePlaceField,
    TopicField,
    LeadField,
    LunchField,
    ProtocolField,
    InputField,
    DessertField,
    MeetingContextField,
    ExcusedField,
    CalenderIdField,
    NoonEntryFields,
    MeetingEntryFields,
    ValidField,
    ValidEntryFields,
    MessageField,
    NoonInfo,
    DateEntryInfo,
    MeetingInfo,
    NoonDate,
    NoonList,
    NormalMeetingInfo,
    SpecialMeetingInfo,
    MergedNormalMeetingInfo
}
export type Calendar = GoogleAppsScript.Calendar.Calendar;
export type CalendarEvent = GoogleAppsScript.Calendar.CalendarEvent;
export type Range = GoogleAppsScript.Spreadsheet.Range;
