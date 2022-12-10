function onOpen() {
    let ui = SpreadsheetApp.getUi();
    ui.createAddonMenu().addItem("testFunction", "myTest")
}

function myTest() {
    console.log("Hello this is a test");
    SpreadsheetApp.getUi().alert("Test");
}
function onInstall(){
    onOpen();
}