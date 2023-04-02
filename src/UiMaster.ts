export class UiMaster{
    /**
     * Sends a Message to the User without beeing dependent on the user to respond
     * @param message
     * @param title
     */
    static showMessageDialog(message:string,title:string="Nachricht"){
        let template = HtmlService.createTemplateFromFile('GenericUiMessage');
        template.message = message;
        let html = template.evaluate()
            .setSandboxMode(HtmlService.SandboxMode.IFRAME)
            .setTitle(title)
        SpreadsheetApp.getUi().showModalDialog(html,title);
    }
}