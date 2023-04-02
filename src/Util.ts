
export function displayNoLockError(): void{
    let ui = SpreadsheetApp.getUi();
    ui.alert(
        "Auf diesem Dokument sind bereits Prozesse am Laufen",
        "Diese Aktion kann zur Zeit nicht ausgeführt werden, versuche es erneut.",
        ui.ButtonSet.OK)
}

export function displayError(e:any): void{
    let ui = SpreadsheetApp.getUi();
    ui.alert(
        "Es ist ein Fehler aufgetretten",
        JSON.stringify(e),
        ui.ButtonSet.OK)
}