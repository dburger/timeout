var timer = (function() {
    var POLL_INTERVAL = 1000;
    var timer = null;
    var MSEC_PER_SECOND = 1000;
    var MSEC_PER_MINUTE = 60 * MSEC_PER_SECOND;
    var endMillis = null;
    var millisLeft = null;
    var expired = false;
    var observers = [];
    var popupObserver;

    var cancelTimer = function() {
        clearInterval(timer);
        timer = null;
    }

    var fireAlarm = function() {
        expired = true;
        tabsAddOverlay();
    };

    var notify = function() {
        var millis = millisLeft();
        var time = millisToMinSec(millis);
        $.each(observers.slice(0), function(i, o) {
            o(time);
        });
        if (millis <= 0) {
            cancelTimer();
            fireAlarm();
        }
    };

    var millisLeft = function() {
        return endMillis - nowMillis();
    };

    var millisToMinSec = function(millis) {
        if (millis <= 0) return {min: 0, sec: 0};
        var min = Math.floor(millis / MSEC_PER_MINUTE);
        var sec = Math.floor((millis % MSEC_PER_MINUTE) / MSEC_PER_SECOND);
        return {min: min, sec: sec};
    };

    var nowMillis = function() {
        return (new Date()).getTime();
    };

    var startTimer = function() {
        timer = setInterval(notify, POLL_INTERVAL);
    };

    var tabsAddOverlay = function() {
        tellAllTabs({op: "add"}, tabsRemoveOverlay);
    };

    var tabsRemoveOverlay = function() {
        expired = false;
        tellAllTabs({op: "remove"});
    };

    var tellAllTabs = function(msg, callback) {
        chrome.windows.getAll({populate: true}, function(windows) {
            for (var i = 0, l = windows.length; i < l; ++i) {
                var window = windows[i];
                for (var j = 0, k = window.tabs.length; j < k; ++j) {
                    var tab = window.tabs[j];
                    chrome.tabs.sendRequest(tab.id, msg, callback);
                }
            }
        });
    };

    // set up a listener so that if the user loads a new tab or manages to navigate
    // to a new page as the alarm expires it will correctly display the overlay
    chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
        if (info.status === "complete" && expired) {
            chrome.tabs.sendRequest(tabId, {op: "add"}, tabsRemoveOverlay);
        }
    });

    return {
        addObserver: function(observer) {
            observers.push(observer);
        },
        addPopupObserver: function(observer) {
            popupObserver = observer;
            observers.push(observer);
        },
        removeObserver: function(observer) {
            $.each(observers.slice(0), function(i, o) {
                if (o === observer) {
                    observers.splice(i, 1);
                    return false;
                }
            });
        },
        start: function(minutes) {
            endMillis = nowMillis() + minutes * MSEC_PER_MINUTE;
            notify();
            startTimer();
        },
        pause: function() {
            var nowMillis = nowMillis();
            millisLeft = (endMillis - nowMillis);
            clearInterval(timer);
        },
        paused: function() {
            return (millisLeft !== null);
        },
        resume: function() {
            var nowMillis = nowMillis();
            endMillis = nowMillis + millisLeft;
            millisLeft = null;
            startTimer();
        },
        running: function() {
            return timer && (millisLeft === null);
        },
        cancel: function() {
            cancelTimer();
            millisLeft = null;
        }
    }
})();


timer.addObserver(function(time) {
    var minutes = time.min;
    if (time.sec > 0) minutes++;
    chrome.browserAction.setBadgeText({text: "" + minutes});
});

/*
   For the longer story see popup.js.  The problem is that the popup does not
   fire its unload event - and thus cannot unregister itself as an observer
   of timer events at the appropriate time.  Thus we allow it to connect via
   a port, give it a special addPopupObserver to store a reference to it,
   and handle its timer.removeObserver call on disconnect.
 */
chrome.extension.onConnect.addListener(function(port) {
    port.onDisconnect.addListener(function() {
        timer.removeObserver(popupObserver);
    });
});
