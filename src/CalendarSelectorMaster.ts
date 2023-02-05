const CALENDAR_PROPERTY_KEY = "CalendarToWrite";
export class CalendarSelectorMaster {
    constructor() {
    }

    private getHTMLForDropDown(){
        return  HtmlService.createTemplateFromFile("CalendarDropdown").evaluate();
    }

    public select_calendar(){

        let htmlOutput = this.getHTMLForDropDown()
            .setSandboxMode(HtmlService.SandboxMode.IFRAME)
            .setHeight(200)
            .setWidth(300)

        SpreadsheetApp.getUi()
            .showModalDialog(htmlOutput,'Kalender Wählen')

    }

    static selectCalendar(calId:string){
        let userProperties = PropertiesService.getUserProperties();
        userProperties.setProperty(CALENDAR_PROPERTY_KEY,calId);
    }

    static getCalendarId(){
        let userProperties = PropertiesService.getUserProperties();
        return userProperties.getProperty(CALENDAR_PROPERTY_KEY);
    }



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