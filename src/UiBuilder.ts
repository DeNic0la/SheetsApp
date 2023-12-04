import {getCalendarId} from "./CalendarSelectorMaster";
import {getDebugState} from "./DebugState";
import {DriveMaster} from "./DriveMaster";


const PICK_CAL = "Kalender Auswählen";
const CKECK_PERMISSIONS = "Berechtigungen überprüfen"
const PICK_LOGLEVEL = "Informationslevel Auswählen"
const GENERATE_EVENTS = "Kalender Synchronisieren"
const SHOW_CURRENT_SETTINGS = "Aktuelle Einstellungen Anzeigen"
const SETTINGS = "Einstellungen"
export function buildUI(event:any) {
    let ui = SpreadsheetApp.getUi();

    let menu = ui.createAddonMenu();
    let settings = ui.createMenu(SETTINGS);


    menu.addItem("Datenvalidierung","validate_validity");
    settings.addItem(PICK_LOGLEVEL, "main_call_debug_state_picker");

    if (event && event.authMode == ScriptApp.AuthMode.NONE) {
        menu.addItem(CKECK_PERMISSIONS, "check_permissions_on_no_auth")
    } else {
        let calId = getCalendarId();
        const state = getDebugState();

        settings.addItem(PICK_CAL,"main_call_custom_picker_for_cal")
        if (state.isExtendedOrHigher){
            settings.addItem("Testkalender Generieren","restTestEnviroment")
            menu.addItem("Neuformatieren","reformat_entire_spreadsheet")
            settings.addItem("Sitzungs Ordner Setzen","pick_meetings_folder")
            settings.addItem("Preset für Meetings auswählen","pick_preset_document")
            if (DriveMaster.getMeetingFolderId() !== undefined && DriveMaster.getPresetId() !== undefined)
                menu.addItem("Dokumente Für Meetings erstellen","generate_meeting_docs")
            settings.addSeparator();
            settings.addItem("Nachmittagspläne Ordner Setzen","pick_noons_folder")
            settings.addItem("Preset für Nachmitagspläne auswählen","pick_noons_document")
            if (DriveMaster.getNoonFolderId() !== undefined && DriveMaster.getNoonPresetId() !== undefined)
                menu.addItem("Dokumente Für Nachmitäge erstellen","generate_noon_docs")
        }

        if (calId) {
            menu.addItem(GENERATE_EVENTS,"generateCalEvents")

            if (state.isExtendedOrHigher){

                settings.addItem("Reset CalId","unset");


            }
        }
    }
    settings.addItem(SHOW_CURRENT_SETTINGS,"show_settings")

    menu.addSubMenu(settings)
        .addToUi();

}
