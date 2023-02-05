export class CalendarSelectorMaster {
    private template: GoogleAppsScript.HTML.HtmlTemplate
    constructor() {
        this.template = HtmlService.createTemplateFromFile("CalendarDropdown.html");
    }

    public getDropdownWithData(data:dropdownOption[]){
        let dropdown = this.template;
        dropdown.options = data;
        return dropdown.evaluate();

    }

}

export interface dropdownOption {
    value: string;
    key: string;
}