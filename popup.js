$(function() {
    var startButton = $("#startButton");
    var cancelButton = $("#cancelButton");
    var minutesText = $("#minutesText");
    var timer = chrome.extension.getBackgroundPage().timer;

    var observer = function(time) {
        var sec = "" + time.sec;
        if (sec.length === 1) sec = "0" + sec;
        $("#time").text(time.min + ":" + sec);
    };

    var close = function() {
        // if get onunload onbeforeunload to work can ditch this call
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

    var startButtonValue = (running) ? "pause"
        : (paused) ? "resume"
        : "start";
    startButton.attr("value", startButtonValue);
    cancelButton.attr("disabled", !(running || paused));

    /*
       Long story short - I would like to be able to do this somewhat like
       this:

       timer.addObserver(observer);

       window.addEventListener("unload", function() {
           timer.removeObserver(observer);
       }, false);

       This, unfortunately, does not work because the unload event will not
       fire when the popup is being closed.

       question of why not is being asked here:

       1. http://stackoverflow.com/questions/2315863/does-onbeforeunload-event-trigger-for-popup-html-in-a-google-chrome-extension
       2. http://groups.google.com/a/chromium.org/group/chromium-extensions/browse_thread/thread/cc6673d8e47a9bf4#
       3. http://code.google.com/p/chromium/issues/detail?id=31262

       The workaround below will call a special addPopupObserver which will
       cause the background page to add the observer and store a reference
       to it.  A port will also be opened to the background page.  When the
       popup closes the port will get a disconnect and the background page
       will remove the observer...
       errrr that is the theory anyway....HACK!
     */

    timer.addPopupObserver(observer);
    var port = chrome.extension.connect();
    minutesText.focus();
});
