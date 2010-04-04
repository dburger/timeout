$(function() {
    var startButton = $("#startButton");
    var cancelButton = $("#cancelButton");
    var alarmButton = $("#alarmButton");
    var minutesText = $("#minutesText");
    var timer = chrome.extension.getBackgroundPage().timer;

    var observer = function(time) {
        var sec = "" + time.sec;
        if (sec.length === 1) sec = "0" + sec;
        $("#time").text(time.min + ":" + sec);
    };

    timer.addObserver(observer);

    var close = function() {
        // if get onunload onbeforeunload to work can ditch this call
        timer.removeObserver(observer);
        window.close();
    };

    var start = function() {
        var minutes = parseInt(minutesText.val());
        try {
        timer.start(minutes);
        } catch (exc) {
          alert(exc.message);
        }
        close();
    };

    var cancel = function() {
        timer.cancel();
        close();
    };

    startButton.click(start);
    cancelButton.click(cancel);

    var running = timer.running();
    var paused = timer.paused();

    startButton.value = (running) ? "pause"
        : (paused) ? "resume"
        : "start";
    cancelButton.disabled = !(running || paused);

    timer.addObserver(observer);

    // this, unfortunately, does not work
    // question is being asked here:
    // http://stackoverflow.com/questions/2315863/does-onbeforeunload-event-trigger-for-popup-html-in-a-google-chrome-extension
    window.addEventListener("unload", function() {
        timer.removeObserver(observer);
    }, false);

    minutesText.focus();
});
