import { run, defaultEnvironment } from "@quri/squiggle-lang"
import { deflate } from "pako" // ... really?
import { fromByteArray } from "base64-js"

window.run = run
window.defaultEnvironment = defaultEnvironment

const e = (cls, parent, content, type="div") => {
    const element = document.createElement(type)
    element.classList.add(cls)
    if (content) { element.appendChild(document.createTextNode(content)) }
    if (parent) { parent.appendChild(element) }
    return element
}

const blocks = document.querySelectorAll("textarea.squiggle")
for (const block of blocks) {
    const resultsDiv = e("squiggle-control", null, null)
    const b64code = encodeURIComponent(fromByteArray(deflate(JSON.stringify({
        defaultCode: block.value
    }))))
    resultsDiv.innerHTML += `<div>Interactive embedded Squiggle instance. Go to <a href="https://www.squiggle-language.com/playground?v=0.10.0#code=${b64code}">the Squiggle playground</a> for complex edits.</div>`
    const runButton = e("large-button", resultsDiv, "Run", "button")
    const resultsCode = e("squiggle-results", resultsDiv, "", "div")
    const execute = async () => {
        try {
            const code = block.value
            const result = await run(code, defaultEnvironment)
            if (!result.result.ok) {
                throw new Error(result.result.value.errors.map(x => x.toString()).join("\n"))
            }
            const samples = result.result.value.result.value.getSamples()
            samples.sort((a, b) => a - b) // numerically sort (JS...)
            const percentiles = [0.05, 0.2, 0.3, 0.5, 0.7, 0.8, 0.95]
            resultsCode.innerText = "Distribution:"
            for (const percentile of percentiles) {
                const index = Math.floor(samples.length * percentile)
                const sample = samples[index]
                e(null, resultsCode, `${(percentile * 100).toFixed(0)}%ile: ${sample.toFixed(3)}`, "div")
            }
        } catch (e) {
            console.error(e)
            resultsCode.innerText = e.message
        }
        // sorry.
        if (window.relayout) {
            setTimeout(() => window.relayout(true), 0)
        }
    }
    runButton.addEventListener("click", execute)
    block.parentElement.insertBefore(resultsDiv, block.nextSibling)
    setTimeout(execute, 0)
}
