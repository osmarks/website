import * as R from "ramda"
import * as htmlToText from "html-to-text"
import * as binaryFuseFilter from "binary-fuse-filter"
import { xxHash32 as hash } from "js-xxhash"
import * as msgpack from "msgpackr"
import * as fs from "fs"
import { BIGRAM_SEPARATOR, FREQUENCY_SEPARATOR, FREQUENCY_THRESHOLDS, tokenize } from "./fts_common.mjs"

const index = []
const recordStrings = []

const BIGRAM_INCLUSION = 0.3
const URL = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g

export const stripHTML = html => htmlToText.convert(html.replace(URL, " "), {
    wordwrap: false,
    selectors: [
        { selector: "a", options: { ignoreHref: true } },
        { selector: "img", format: "skip" }
    ]
})

export const pushEntry = (sourceType, entry) => {
    const { html, url, timestamp, title, description, ignoreDescription } = entry
    // TODO: this puts URLs inline, maybe do something with that
    const text = (title ?? "") + " " + (!ignoreDescription ? (description && stripHTML(description)) ?? "" : "") + " " + stripHTML(html)
    recordStrings.push(text)
    const words = tokenize(text)
    const counts = {}
    for (const word of words) {
        counts[word] = (counts[word] ?? 0) + 1
    }
    const bigrams = {}
    for (const [a, b] of R.zip(words, R.drop(1, words))) {
        bigrams[a + BIGRAM_SEPARATOR + b] = (bigrams[a + BIGRAM_SEPARATOR + b] ?? 0) + 1
    }
    index.push({
        url,
        timestamp,
        counts,
        bigrams,
        title,
        description,
        sourceType
    })
}

export const build = () => {
    fs.writeFileSync("strings.json", JSON.stringify(recordStrings))

    let totalTerms = 0
    let totalBigrams = 0
    const totalBigramCounts = {}
    const totalTermCounts = {}
    for (const entry of index) {
        for (const [bigram, count] of Object.entries(entry.bigrams)) {
            totalBigramCounts[bigram] = (totalBigramCounts[bigram] ?? 0) + count
            totalBigrams += count
        }
        for (const [word, count] of Object.entries(entry.counts)) {
            totalTermCounts[word] = (totalTermCounts[word] ?? 0) + count
            totalTerms += count
        }
    }
    const pmi = (bigram, count) => {
        const [a, b] = bigram.split(BIGRAM_SEPARATOR, 2)
        // bigram provides no useful information if term is unique anyway
        // want ascending order (lower is better)
        if (totalTermCounts[a] === 1 || totalTermCounts[b] === 1) { return 0 }
        return -(count / totalBigrams) / ((totalTermCounts[a] / totalTerms) * (totalTermCounts[b] / totalTerms))
    }
    const pmis = new Map(Object.entries(totalBigramCounts).map(([k, v]) => [k, pmi(k, v)]))
    const records = []
    for (const entry of index) {
        const keys = []
        for (const [word, count] of Object.entries(entry.counts)) {
            for (const threshold of FREQUENCY_THRESHOLDS) {
                if (count >= threshold) {
                    keys.push(hash(word + FREQUENCY_SEPARATOR + threshold))
                }
            }
        }
        const sorted = R.sortBy(x => pmis.get(x), Object.entries(entry.bigrams))
        for (const [bigram, count] of sorted.slice(0, Math.ceil(keys.length * BIGRAM_INCLUSION))) {
            keys.push(hash(bigram))
        }
        const [filter, err] = binaryFuseFilter.populateBinaryFuse8(keys)
        if (err) {
            throw err // Golang...
        }
        filter.Fingerprints = new Uint8Array(filter.Fingerprints)
        records.push({
            filter,
            url: entry.url,
            timestamp: entry.timestamp ? entry.timestamp.format("YYYY-MM-DD") : null,
            title: entry.title,
            description: entry.description,
            sourceType: entry.sourceType
        })
    }
    console.log(`Total terms: ${totalTerms}`)
    console.log(`Total bigrams: ${totalBigrams}`)
    return msgpack.pack(records)
}
