import {DateEntryInfo, NoonInfo} from "./specific-types";
type Date = GoogleAppsScript.Base.Date;

type File =  GoogleAppsScript.Drive.File
type Folder =  GoogleAppsScript.Drive.Folder
type Document = GoogleAppsScript.Document.Document
type objectEntry = [string,unknown]
export class PresetMaster {
    static getDocumentCopy(name:string,preset:File,folder:Folder):Document{
        let file = preset.makeCopy(name,folder);
        return  DocumentApp.openById(file.getId());
    }

    static fillNoonInfo(document:Document,info:NoonInfo){
        let body = document.getBody();
        const replaceActions = Object.entries(info).map(this.toNoonDocumentReplaceData);
        for (const {key,value} of replaceActions) {
            body.replaceText(key,value)
        }
    }
    private static toNoonDocumentReplaceData( a:objectEntry):({key:string,value:string}){
        let [key,value] = a;
        if (typeof value === 'object' && (value instanceof Date)){
            value = Utilities.formatDate(value,"GMT+2","dd.MM.yyyy")
        }
        if (Array.isArray(value)){
            value = value.join(", ")
        }
        if (typeof value !== 'string'){
            value = String(value)
        }
        // @ts-ignore
        return {key:`\\%${key}\\%` ,value};
    }
}