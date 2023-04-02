import {CustomPicker, PickerContext} from "./CustomPicker";

const CALENDAR_PROPERTY_KEY = "CalendarToWrite";
export function selectCalendar(calId:string){
    let userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty(CALENDAR_PROPERTY_KEY,calId);
}
export function getCalendarId(){
    let userProperties = PropertiesService.getUserProperties();
    return userProperties.getProperty(CALENDAR_PROPERTY_KEY);
}
export function getCurrentCalendarName() {
    let calendarId = getCalendarId();
    return calendarId ? CalendarApp.getCalendarById(calendarId).getName() : "Nicht Gesetzt";
}

export function call_custom_picker_for_cal(){
    let context:PickerContext = {
        data: getAllCalendersForHTML(),
        current: getCalendarId(),
        propertyName: CALENDAR_PROPERTY_KEY,
        propertyType: "User"
    }

    let picker = new CustomPicker(context)

    picker.show("Wähle einen Kalender");

}

export function getAllCalendersForHTML(): dropdownOption[] {
    return CalendarApp.getAllCalendars().map(c => {
        return {
            value: c.getId(),
            key: c.getName()
        } as dropdownOption;
    });
}


export interface dropdownOption {
    value: string;
    key: string;
}