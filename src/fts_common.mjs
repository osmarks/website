import * as stemmer from "porter2"

export const BIGRAM_SEPARATOR = "\x00"
export const FREQUENCY_SEPARATOR = "\x01"
export const FREQUENCY_THRESHOLDS = [1, 4, 9]
const NUMERIC = /^[0-9\.e]+$/

function segmentWords(text) {
    if (Intl && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter("en", { granularity: "word" })
        return Array.from(segmenter.segment(text)).filter(x => x.isWordLike).filter(x => !NUMERIC.test(x.segment)).map(x => x.segment)
    } else {
        // Fallback path
        return text.split(/[\s\p{P}]+/u).filter(Boolean)
    }
}

export const tokenize = x => segmentWords(x).map(x => x.toLowerCase()).map(stemmer.stem)