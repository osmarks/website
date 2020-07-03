let currentStyle = localStorage.getItem("user-stylesheet") || ""

if (!customStyleEl) {
    customStyleEl = document.createElement("style")
    customStyleEl.appendChild(document.createTextNode(customStyle))
    customStyleEl.onload = () => console.log("Loaded custom styles")
    customStyleEl.id = "custom-style"
    document.head.appendChild(customStyleEl)
}

const saveStyles = () => { localStorage.setItem("user-stylesheet", currentStyle) }
const applyStyles = () => {
    try { document.head.removeChild(customStyleEl) } catch {}
    while (customStyleEl.firstChild) { customStyleEl.removeChild(customStyleEl.firstChild) }
    customStyleEl.appendChild(document.createTextNode(currentStyle))
    document.head.appendChild(customStyleEl)
}
const removeStyles = () => {
    document.head.removeChild(customStyleEl)
}

const handleTab = ev => {
    if (ev.keyCode === 9) { // tab
        const start = ev.target.selectionStart
        const end = ev.target.selectionEnd
        const value = ev.target.value
        ev.target.value = value.substring(0, start) + "\t" + value.substring(end)
        ev.target.selectionStart = ev.target.selectionEnd = start + 1
        ev.preventDefault()
    }
}

const App = {
    view: () => m("", [
        m("em", "Due to browser limitations, this currently cannot tell you about errors or warnings in your stylesheet. You can check your browser console for these, probably."),
        m(".toolbar", [
            m("button", { onclick: () => { saveStyles(); applyStyles() } }, "Save & Apply"),
            m("button", { onclick: saveStyles }, "Save"),
            m("button", { onclick: applyStyles }, "Apply"),
            m("button", { onclick: removeStyles }, "Remove")
        ]),
        m("textarea.style-input", { oncreate: vnode => { vnode.dom.value = currentStyle }, oninput: ev => { currentStyle = ev.target.value }, onkeydown: handleTab }),
    ])
}

m.mount(document.getElementById("app"), App)