import {CalendarMaster} from "./CalendarMaster";
import {MyLogger} from "./Logger";

export class CalendarSelectorMaster {
    private template: GoogleAppsScript.HTML.HtmlTemplate ;
    constructor() {
        this.template = HtmlService.createTemplateFromFile("build/CalendarDropdown.html");
    }

    public getDropdownWithData(data:dropdownOption[]){
        let options:string[] = [];

        for (let i = 0; i < data.length; i++){
            options.push(`<option value="${data[i].value}">${data[i].key}</option>`)
        }

        let optionsAsHtml = HtmlService.createHtmlOutput(options.join('\n'));

        let dropdown = this.template;
        dropdown.data = data;

        let dd = dropdown.evaluate();
        MyLogger.info(optionsAsHtml.getContent())
        MyLogger.info(dd.getContent())
        MyLogger.showLog()
        return dd;
    }

    public select_calendar(){

        let allCalendars = CalendarApp.getAllCalendars().map(c => {
            return {
                value: c.getId(),
                key: c.getName()
            } as dropdownOption;
        });

        let htmlOutput = this.getDropdownWithData(allCalendars)
            .setSandboxMode(HtmlService.SandboxMode.IFRAME)
            .setHeight(100)
            .setWidth(400)

        SpreadsheetApp.getUi()
            .showModalDialog(htmlOutput,'Kalender Wählen')

    }

    static selectCalendar(calId:string){
        MyLogger.info("CALID: "+calId);
        MyLogger.showLog()
    }

}


export interface dropdownOption {
    value: string;
    key: string;
}