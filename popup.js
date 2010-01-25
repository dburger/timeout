function init() {
    var startButton = document.getElementById("startButton");
    var cancelButton = document.getElementById("cancelButton");
    var alarmButton = document.getElementById("alarmButton");
    var minutesText = document.getElementById("minutesText");
    var backgroundPage = chrome.extension.getBackgroundPage();

    var start = function() {
        var minutes = parseInt(minutesText.value);
        backgroundPage[startButton.value](minutes);
        window.close();
    };

    var cancel = function() {
        backgroundPage.cancel();
        window.close();
    };

    var alarm = function() {
        backgroundPage.fireAlarm();
    };

    startButton.addEventListener("click", start, false);
    cancelButton.addEventListener("click", cancel, false);
    alarmButton.addEventListener("click", alarm, false);

    var running = backgroundPage.running();
    var paused = backgroundPage.paused();

    startButton.value = (running) ? "pause"
        : (paused) ? "resume"
        : "start";
    cancelButton.disabled = !(running || paused);

    minutesText.focus();
}
