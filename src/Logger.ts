export class MyLogger{

    public static info(message:string){
        Logger.log(message)
    }
    public static warn(message:string){
        SpreadsheetApp.getUi().alert(message)
    }

    public static showLog(){
        let log = Logger.getLog();
        Logger.clear();
        if (log.length > 0){
            SpreadsheetApp.getUi().alert(log)
        }
    }
}