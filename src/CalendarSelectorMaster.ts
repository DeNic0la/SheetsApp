import {MyLogger} from "./Logger";

export class CalendarSelectorMaster {
    constructor() {
    }

    public getDropdownWithData(data:dropdownOption[]){
        let temp:any[] = [];
        const filename = "CalendarDropdown";
        try{
            temp[0] = HtmlService.createTemplateFromFile(filename).getRawContent();
            temp[2] = HtmlService.createTemplateFromFile(filename).getCodeWithComments();
            temp[1] = HtmlService.createTemplateFromFile(filename).getCode();

        }
        catch (e) {
            MyLogger.info(JSON.stringify(e))
        }

        MyLogger.info("TEMPLATE: "+JSON.stringify(temp))

        MyLogger.showLog()



        let dropdown = HtmlService.createTemplateFromFile("CalendarDropdown").evaluate();
/*
        console.log(dropdown);
        Logger.log(dropdown)
        MyLogger.info("TEMPLATE: "+JSON.stringify(dropdown))

        MyLogger.showLog()*/

        return dropdown;
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

function getAllCalendersForHTML(): dropdownOption[] {
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