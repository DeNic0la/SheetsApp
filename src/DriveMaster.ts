import {CustomPicker} from "./CustomPicker";
import {MyLogger} from "./Logger";
import {MeetingInfo} from "./specific-types";
import {Validator} from "./Validator";

const REQUIRED_MIME_TYPE = MimeType.GOOGLE_DOCS//"'application/vnd.google-apps.document'"
const PRESET_REQUIRED_NAME = "preset"
export type DriveFile =  GoogleAppsScript.Drive.File
export type DriveFolder =  GoogleAppsScript.Drive.Folder
const MEETING_FOLDER_PROP_KEY = "SelectedMeetingFolder"
const SELECTED_MEETING_PRESET_KEY = "SelectedMeetingPreset"
const MEETING_FILENAME_PREFIX = "Sitzung"

export class DriveMaster {

    static generateDocumentForMeetings(meetings:MeetingInfo[]){
        let meetingPreset = this.getMeetingPreset();
        let meetingFolder = this.getMeetingFolder();
        if (!meetingPreset || !meetingFolder){
            MyLogger.info("Ordner oder Preset wurde nicht gesetzt");
            return;
        }
        for (let meeting of meetings) {
            let isSemester = Validator.isSemestersitzung(meeting);
            if (!meeting.normalMeeting && !isSemester){
                MyLogger.info("Skipping: "+meeting.meetingType)
                continue;
            }
            if (!Validator.isMergedMeeting(meeting)){
                MyLogger.info("Skipping: "+meeting.meetingType)
                continue;
            }
            let name = isSemester ? MEETING_FILENAME_PREFIX : `${MEETING_FILENAME_PREFIX} ${Utilities.formatDate(meeting.startDate,"GMT+2","dd.MM.yyyy")}`;
            let file = meetingPreset.makeCopy(name,meetingFolder);
            let document = DocumentApp.openById(file.getId());
            let body = document.getBody();
            let traktanden = body.findElement(DocumentApp.ElementType.TABLE).getElement();
            if (traktanden.getType() !== DocumentApp.ElementType.TABLE){
                MyLogger.info("Traktanden Table in Document not found")
                continue;
            }
            let table = traktanden.asTable();
            let empty = this.getEmptyRow(table);
            if (!empty){
                MyLogger.info("Traktanden Table has no empty row")
                continue;
            }
            table.removeRow(empty)

            let i = 0;
            for (let noon of meeting.noons) {
                let tableRow = table.insertTableRow(empty+i);
                i++;
                tableRow.appendTableCell().setText(noon.name ?? "")
                tableRow.appendTableCell().setText(noon.lead ?? "");
            }
            body.replaceText("_Datum",Utilities.formatDate(meeting.startDate,"GMT+2","dd.MM.yyyy"))
            body.replaceText("_Uhrzeit",Utilities.formatDate(meeting.startDate,"GMT+2","HH:mm"))
            body.replaceText("_Protokoll",meeting.mProtocol??"")
            body.replaceText("Sitzungs_Leitung",meeting.mInput??"")
            body.replaceText("Dessert_Leiter",meeting.mDesert??"")
            body.replaceText("_Abgemeldet",meeting.excused??"")

            document.saveAndClose();

        }

    }
    private static getEmptyRow(table:GoogleAppsScript.Document.Table): number | undefined{
        for (let i = 1; i < table.getNumRows(); i++) {
            let row = table.getRow(i);
            if (row.getCell(0).getText() === "__Fill") {
                return i;
            }
        }
    }

    static pickMeetingFolder(){
        let options = this.getMeetingsFoldersOptions();
        let picker = new CustomPicker({
            data: options,
            current: this.getMeetingFolderId() ?? "",
            propertyName: MEETING_FOLDER_PROP_KEY,
            propertyType: "User"
        })
        picker.show("Wähle einen Sitzungsordner")
        //MyLogger.showLog();
    }
    static getMeetingFolderId(){
        let property = PropertiesService.getUserProperties().getProperty(MEETING_FOLDER_PROP_KEY);
        if (property)
            return property;
    }

    static getPresetId(){
        let property = PropertiesService.getUserProperties().getProperty(SELECTED_MEETING_PRESET_KEY);
        if (property)
            return property;
    }
    static getMeetingFolder(){
        let meetingFolderId = this.getMeetingFolderId();
        if (meetingFolderId){
            return DriveApp.getFolderById(meetingFolderId);
        }
    }
    static getMeetingPreset(){
        let presetId = this.getPresetId();
        if (presetId){
            return DriveApp.getFileById(presetId);
        }
    }

    static pickPreset(){
        let options = this.getPresetDocumentOptions();
        let picker = new CustomPicker({
            data: options,
            current: this.getPresetId() ?? "",
            propertyName: SELECTED_MEETING_PRESET_KEY,
            propertyType: "User"
        })
        picker.show("Wähle einene Sitzungsvorlage")
    }


    static getPresetDocumentOptions(){
        let query = `mimeType = '${REQUIRED_MIME_TYPE}' and title contains '${PRESET_REQUIRED_NAME}'`;
        MyLogger.info(query)
        let fileIterator = DriveApp.searchFiles(query);
        let files = []
        MyLogger.info("HasNext: "+fileIterator.hasNext())
        for (let i = 0; (i < 30 && fileIterator.hasNext()); i++) {
            let file = fileIterator.next();
            files.push({value:file.getId(),key:this.getExtendendedFileInfo(file)})
        }
        return files;
    }


    static getMeetingsFoldersOptions(){
        let iterator = DriveApp.getFoldersByName("Sitzungen");
        let folders = []
        for (let i = 0; i < 10 && iterator.hasNext(); i++) {
            MyLogger.info(i + " Files found");
            let folder = iterator.next();
            let name = folder.getName();
            MyLogger.info(name);
            folders.push({value:folder.getId(),key:this.getExtendendedFolderInfo(folder)})
        }
        MyLogger.info("Return")
        return folders;
    }
    static getExtendendedFolderInfo(folder:DriveFolder):string {
        let updated = Utilities.formatDate(folder.getLastUpdated(),"GMT+2","dd.MM.yyyy")
        let parent = folder.getParents().next()?.getName()
        let owner = folder.getOwner().getName()
        return `${owner}/${parent}/${folder.getName()} - ${updated}`;
    }
    static getExtendendedFileInfo(file:DriveFile):string {
        let updated = Utilities.formatDate(file.getLastUpdated(),"GMT+2","dd.MM.yyyy")
        let parent = file.getParents().next()?.getName()
        return `${parent}/${file.getName()} - ${updated}`;
    }




}