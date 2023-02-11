import {CustomPicker, PickerContext} from "./CustomPicker";
import {getAllCalendersForHTML, getCalendarId} from "./CalendarSelectorMaster";

export type debugState = "User" | "Extended" | "Nicola"
const DEBUG_STATE_KEY = "DebugStateKey";
export function getDebugStateProp():debugState{
    let prop = PropertiesService.getUserProperties().getProperty(DEBUG_STATE_KEY);
    if (
        prop &&
        (
            prop === "User" ||
            prop === "Extended" ||
            prop === "Nicola"
        )
    ){
        return prop;
    }
    return "User";
}

export function getDebugState():DebugState {
    return new DebugState(getDebugStateProp());
}

export class DebugState {
    get isExtendedOrHigher():boolean{
        return this.state === "Extended" || this.state === "Nicola"
    }
    get isAdmin():boolean{
        return this.state === "Nicola"
    }

    constructor(private state:debugState){

    }
}

export function call_debug_state_picker(){
    let context:PickerContext = {
        data: [
            {value: "User",key: "Benutzer"},
            {value: "Extended", key: "Erweiterte Informationen"},
            {value: "Nicola", key: "Nicola - Zeige alles an"}
        ],
        current: getDebugStateProp(),
        propertyName: DEBUG_STATE_KEY,
        propertyType: "User"
    }

    let picker = new CustomPicker(context)

    picker.show("Wähle ein Informationslevel");
}