import { BIGRAM_SEPARATOR, FREQUENCY_SEPARATOR, FREQUENCY_THRESHOLDS, tokenize } from "./fts_common.mjs"
import { populateBinaryFuse8 } from "binary-fuse-filter"
import { xxHash32 as hash } from "js-xxhash"
import { unpack } from "msgpackr"
import { drop, zip } from "ramda"

const SCORE_EXP = 1.9
const BIGRAM_FACTOR = 3

let index = null

const query = input => {
    const tokens = tokenize(input)
    const bigrams = new Set()
    for (const [a, b] of zip(tokens, drop(1, tokens))) {
        bigrams.add(a + BIGRAM_SEPARATOR + b)
    }
    const cache = {}
    const hashCached = x => {
        if (cache[x]) { return cache[x] }
        const ret = hash(x)
        cache[x] = ret
        return ret
    }
    const results = []
    for (const doc of index) {
        let score = 0
        for (const token of tokens) {
            let count = 0
            for (const frequency of FREQUENCY_THRESHOLDS) {
                const query = hashCached(token + FREQUENCY_SEPARATOR + frequency)
                if (doc.filter.contains(query)) {
                    if (count > 0 || frequency == FREQUENCY_THRESHOLDS[0]) {
                        count = frequency
                    }
                }
            }
            if (count > 0) {
                score += SCORE_EXP ** count
            }
        }
        for (const bigram of bigrams) {
            if (doc.filter.contains(hashCached(bigram))) {
                score *= BIGRAM_FACTOR
            }
        }
        if (score > 0) {
            results.push({
                score,
                url: doc.url,
                title: doc.title,
                description: doc.description,
                timestamp: doc.timestamp,
                sourceType: doc.sourceType
            })
        }
    }
    results.sort((a, b) => b.score - a.score)
    return results.slice(0, 10)
}

const loadIndex = async () => {
    if (index) { return }
    index = await fetch("/fts.bin").then(x => x.arrayBuffer()).then(x => new Uint8Array(x)).then(x => unpack(x))
    index.forEach(entry => {
        const x = entry.filter
        const newFilter = populateBinaryFuse8([])[0]
        newFilter.Seed = BigInt(x.Seed)
        newFilter.SegmentLength = x.SegmentLength
        newFilter.SegmentLengthMask = x.SegmentLengthMask
        newFilter.SegmentCount = x.SegmentCount
        newFilter.SegmentCountLength = x.SegmentCountLength
        newFilter.len = x.len
        newFilter.Fingerprints = x.Fingerprints
        entry.filter = newFilter
    })
}

await loadIndex()

export default query