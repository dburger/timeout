var pollInterval = 1000;
var timer = null;
var minuteMillis = 60 * 1000;
var endMillis = null;
var millisLeft = null;

var expired = false;

// console.log("hello world");

var now = function() {
    return (new Date()).getTime();
};

var startTimer = function() {
    timer = setInterval(updateBadge, pollInterval);
};

var pauseTimer = function() {
    clearInterval(timer);
};

var cancelTimer = function() {
    clearInterval(timer);
    timer = null;
};

var start = function(minutes) {
    var nowMillis = now();
    endMillis = nowMillis + minutes * minuteMillis;
    updateBadge();
    startTimer();
};

var pause = function() {
    var nowMillis = now();
    millisLeft = (endMillis - nowMillis);
    pauseTimer();
};

var resume = function() {
    var nowMillis = now();
    endMillis = nowMillis + millisLeft;
    millisLeft = null;
    startTimer();
};

var cancel = function() {
    millisLeft = null;
    cancelTimer();
};

var updateBadge = function() {
    var nowMillis = now();
    var minutesLeft = (endMillis - nowMillis) / minuteMillis;
    var minutesLeft = Math.ceil(minutesLeft);
    if (minutesLeft <= 0) {
        cancel();
        fireAlarm();
    }
    chrome.browserAction.setBadgeText({text: "" + minutesLeft});
};

var running = function() {
    return timer && (millisLeft === null);
};

var paused = function() {
    return (millisLeft !== null);
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

var tabsAddOverlay = function() {
    tellAllTabs({op: "add"}, tabsRemoveOverlay);
};

var tabsRemoveOverlay = function() {
    expired = false;
    tellAllTabs({op: "remove"});
};

var fireAlarm = function() {
    expired = true;
    tabsAddOverlay();
};

// set up a listener so that if the user loads a new tab or manages to navigate
// to a new page as the alarm expires it will correctly display the overlay
chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
    if (info.status === "complete" && expired) {
        chrome.tabs.sendRequest(tabId, {op: "add"}, tabsRemoveOverlay);
    }
});
