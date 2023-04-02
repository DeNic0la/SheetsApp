import {Constant} from "./Constant";
import {MyLogger} from "./Logger";

export type propertyType = "Script" | "User" | "Document";
export interface PickerContext{
    data: {
        /**
         * Value is the Access Key, this info gets passed back
         */
        value: string|number,
        /**
         * Key is the Display Value, Humanreadable
         */
        key: string|number
    }[],
    current: string|number|null,
    propertyName: string,
    propertyType: propertyType,

}


export class CustomPicker {
    constructor(private context:PickerContext) {
        let {data, propertyName, propertyType, current} = context;
        let userProperties = PropertiesService.getUserProperties();
        let uiResponse = {data,current};
        let callback = {propertyType, propertyName}
        userProperties.setProperty(Constant.PROPERTY_NAME_UI_DATA,JSON.stringify(uiResponse));
        userProperties.setProperty(Constant.PROPERTY_NAME_CALLBACK_DATA,JSON.stringify(callback));


    }

    public show(title:string):void{
        let html = HtmlService.createTemplateFromFile("GenericDropdown").evaluate()
            .setSandboxMode(HtmlService.SandboxMode.IFRAME)
            .setHeight(200)
            .setWidth(400)
            .setTitle(title)

        SpreadsheetApp.getUi().showModalDialog(html,title)
    }
}

export function submitEventCallback(value:string) {
    let userProperties = PropertiesService.getUserProperties();
    let val = userProperties.getProperty(Constant.PROPERTY_NAME_CALLBACK_DATA);

    if (!val)
        throw new Error("No Save-Data Found")

    let data = JSON.parse(val) as { propertyName: string, propertyType: propertyType};
    MyLogger.info("Data: "+val);

    let prop = null;
    if (data.propertyType === "Script"){
        prop = PropertiesService.getScriptProperties();
    }
    else if (data.propertyType === "User"){
        prop = userProperties;
    }
    else if (data.propertyType === "Document"){
        prop = PropertiesService.getDocumentProperties();
    }

    MyLogger.info("PROPERTIES: "+prop);

    if (!prop)
        throw new Error("Properties not working")

    MyLogger.info(`Setting ${data.propertyName} on the ${data.propertyType} Property to ${value}`)
    prop.setProperty(data.propertyName,value);
    
}