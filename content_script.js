var overlay = document.createElement("div");
overlay.style.position = "fixed";
overlay.style.left = overlay.style.top = 0;
overlay.style.width = overlay.style.height = "100%";
overlay.style.background = "white";
overlay.style.opacity = 0.9;

var badge = document.createElement("div");
badge.style.position = "fixed";
badge.style.width = badge.style.height = "100px";
badge.style.left = badge.style.top = "50%";
badge.style.marginLeft = badge.style.marginTop = "-50px";
badge.style.background = "yellow";
badge.innerHTML = "OK, Back to Work!";

var addOverlay = function() {
    document.body.appendChild(overlay);
    document.body.appendChild(badge);
};

var removeOverlay = function() {
    document.body.removeChild(overlay);
    document.body.removeChild(badge);
};

chrome.extension.onRequest.addListener(function(msg, sender, callback) {
    if (msg.op === "add") {
        badge.onclick = function () {
            callback();
        };
        addOverlay();
    } else {
        removeOverlay();
    }
});
