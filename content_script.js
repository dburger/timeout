var overlay = $("<div>", {"class": "overlay"});
var dialog = $("<div>", {
    "class": "dialog",
    html: "<p>Timeout over, back to work!</p><p>(click to dismiss)</p>"});

var addOverlay = function(callback) {
    dialog.click(function (evt) {
        callback();
    });
    overlay.appendTo(document.body);
    dialog.appendTo(document.body);
};

var removeOverlay = function() {
    overlay.remove();
    dialog.remove();
};

chrome.extension.onRequest.addListener(function(msg, sender, callback) {
    if (msg.op === "add") {
        addOverlay(callback);
    } else { // msg.op === "remove"
        removeOverlay();
    }
});
