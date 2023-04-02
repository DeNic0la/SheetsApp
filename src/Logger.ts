import {UiMaster} from "./UiMaster";

export class MyLogger {


    public static info(message: string) {
        this.stack.push(message);
        Logger.log(message)
    }

    /**
     * @deprecated
     */
    public static warn(message: string) {
        this.stack.push(message);
    }
    static stack:any[];


    public static showLog() {
        UiMaster.showMessageDialog(this.stack.join("\n<br>"))
    }


}
MyLogger.stack = [];