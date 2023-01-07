export class MyLogger {

    public static info(message: string) {
        Logger.log("INFO: "+message+"\n")
    }

    public static warn(message: string) {
        Logger.log("WARN: "+message+"\n")
        //SpreadsheetApp.getUi().alert(message)
    }

    public static showLog() {
        let log = Logger.getLog();
        Logger.clear();
        if (log.length > 0) {
            SpreadsheetApp.getUi().alert(log)
        }
    }
}