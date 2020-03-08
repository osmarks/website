// infiscroll.js
// A really simple infinite-scroll system.
// Places an invisible marker element near the bottom of the screen and adds new content until it's offscreen.

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function addMarker(reference, markerPos) {
    var markerPos = markerPos || "5vh";

    var el = document.createElement("div");
    el.style.position = "relative";
    el.style.top = "-" + markerPos;
    el.style.width = "1px";
    el.style.height = "1px";
    el.classList.add("marker");

    insertAfter(el, reference)

    return el;
}

function infiscroll(addNewContent, markerPos, reference, maxRetries) {
    var maxRetries = maxRetries || 10
    var marker = addMarker(reference, markerPos);

    var handler = function() {
        let i = 0;
        var x = marker.getBoundingClientRect().bottom
        while (x / document.documentElement.scrollHeight < 0.2 || x < window.innerHeight) {
            i++
            if (i - 1 == maxRetries) {
                break
            }
            addNewContent()
        }
    }

    handler()
    window.addEventListener("scroll", handler)
    setInterval(handler, 500) // evil bodge
}