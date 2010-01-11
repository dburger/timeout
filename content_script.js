var div = document.createElement("div");
div.style.position = "fixed";
div.style.left = div.style.top = 0;
div.style.width = div.style.height = "100%";
div.style.background = "white";
div.style.opacity = 0.9;

var addOverlay = function() {
    document.body.appendChild(div);
};

var removeOverlay = function() {
    document.body.removeChild(div);
};

chrome.extension.onRequest.addListener(function(msg, sender, callback) {
    if (msg.op === "add") {
        div.onclick = function () {
            callback();
        };
        addOverlay();
    } else {
        removeOverlay();
    }
});
