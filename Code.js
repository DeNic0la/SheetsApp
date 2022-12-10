function onOpen() {
    let ui = SpreadsheetApp.getUi();
    ui.createAddonMenu().addItem("testFunction", "myTest")
        .addToUi();
}

function myTest() {
    console.log("Hello this is a test");
    SpreadsheetApp.getUi().alert("Test");
}
function onInstall(){
    onOpen();
}