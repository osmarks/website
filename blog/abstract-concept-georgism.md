---
title: "A modest proposal: Abstract Concept Georgism"
description: Generalize land value tax to short names.
created: 27/03/2025
slug: georg
---
::: epigraph attribution="Ancient American curse"
May your markets be efficient.
:::

[Georgism](https://www.astralcodexten.com/p/your-book-review-progress-and-poverty) is an obscure economic ideology based on the idea that value from land - in the economic sense of resources which nobody has produced (unimproved physical space, the electromagnetic spectrum, ores in the ground, etc) - should go to everyone, via a land value tax (tax on the unimproved value of land). This is favoured by economists for being more economically efficient than alternative taxes and aligning incentives for land use nicely, but the idea is not popular in general despite being obviously correct.

A kind of land which Georgists have heretofore ignored (to the best of my knowledge) is **short descriptions**. The number of distinct ten-character printable strings is quite large but still finite, and cannot be expanded[^1]; the number of pronounceable ones is much smaller; and the number of nice-sounding strings is even smaller. Yet we happily let organizations use short, recognizable strings such as "Stripe", "Ford", "Uber", "Slack" and even "X" at no cost, then receive legal protection (trademarks) restricting others' use. Once a name becomes a popular brand, the legal and cultural association can long outlast the viability of the company - MySpace is functionally dead by now, but the name is unusable for anything else. Trademarks have even been granted on [colors](https://www.npr.org/2019/11/25/782723429/t-mobiles-parent-tells-small-firm-to-keep-its-hands-off-magenta), which are even scarcer.

But how do we determine the unimproved value of this form of land, to correctly tax it? This requires a metric of "naturalness" or how "special" a name or term is. There are several plausible options here: most obvious is length, but it's clear that `bjzxckop` is less natural than `cresracs` is less natural than `birdsong`. Somewhat less obvious is Kolmogorov complexity (the length of the shortest program which generates a string), which makes "random-looking" strings less valuable than "cleaner" ones - however, you have to choose a programming language/universal Turing machine to define this, and (with reasonable choices for the language) it does not consider cultural factors such as common words. We could also measure the number of bits required to encode a string by a good compressor, such as a neural language model or `gzip` with a decent amount of context, but this leaves many degrees of freedom (what model to use and with what context), so it's not very clean.

We can possibly rescue this with clever mechanism design: specifically, a [Harberger tax](https://en.wikipedia.org/wiki/Harberger_Tax), in which holders periodically estimate the value-to-them of objects, pay tax on that value, and must sell at that value if asked to (to incentivize providing a correct price). However, there is a problem which makes it unsuitable in other contexts: it doesn't separate the unimproved and improved values of land, i.e. if you increase the value of a name through your own efforts you pay more tax, nullifying (some to all of) the value of the improvement.

However, unlike with most other land, I think "improvements" on a word or brand name are zero-sum, so disincentivizing them is fine. It seems that "improvements" consist of advertising to make of people think of your brand in association with some context, at the expense of whatever you might think of instead. This is also why I think we should not dismiss attaching popular brands to common/short names as merely a way for language to tend towards increased compression: every such attachment increases ambiguity and [computational overhead](https://en.wikipedia.org/wiki/Hick%27s_law).

It would be nice to extend this beyond trademarks - people often consume cool words and phrases with bad or rapidly obsoleted ideas - but transaction costs and operational difficulties don't make this practical yet. I think it would be valid to have a similar mechanism in domain names, though the cost of switching a domain name is higher because of security implications and remote configuration files.

[^1]: Strictly, you can expand your character set, so to be precise we should be counting in terms of bits and not characters.
