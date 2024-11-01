---
title: Computing is terrible and that's okay
description: Everything mostly works enough and you were never getting a clean-sheet redesign
slug: complexity
created: 18/04/2024
draft: yes
---
::: epigraph attribution="David Wheeler"
All problems in computer science can be solved by another level of indirection.
:::

Computer hardware grows more powerful every year, as fabs wrangle [ever more advanced machinery](https://www.anandtech.com/show/17415/asmls-highna-update-coming-to-fabs-in-2024-2025) into printing ever better and smaller transistors and the handful of companies still at the cutting edge [refine their architectures slightly](https://ieeexplore.ieee.org/document/10067540), but basic metrics of user experience [have stagnated or regressed](https://danluu.com/input-lag/) despite vast investment at every level: a modern device doesn't really feel snappier or like it's solving fundamentally harder problems than past systems. The cause of this is no longer in question: systems scaled far beyond what a person can fully understand, and without end-to-end design and oversight regressions in some places were inevitable. Many other articles would, at this point, decry this as a failure of modernity and perhaps talk about a new project aiming to fix everything; *this* blog was founded on principles of contrarianism[^1], and I'll instead be arguing why this is good, or at least necessary.

## The hidden complexity of modern problems

Intuitively, an early word processor feels like it's solving the same problem as a modern application, despite running nicely on computers perhaps four orders of magnitude slower[^2], but this isn't exactly true. While the older Word can substitute for the newer version in simple use cases, it would look more at home as a CLI editor for low-resourced systems: users now expect vastly more formatting options and editing capabilities, as well as Unicode, and most importantly a smooth interactable GUI which mirrors what the final printout will look like. This is far more complicated than a text-mode UI: variable-width text requires a complex [text rendering stack](https://faultlore.com/blah/text-hates-you/) to run on every keypress - with further dependencies on font rendering, itself [quite tricky](https://axleos.com/writing-a-truetype-font-renderer/); the editor has to solve for a new valid layout on every change even with complicated objects in use; and users expect smooth panning, scrolling and zooming.

::: captioned src=/assets/images/word_dos.png
Word for DOS.
:::
::: captioned src=/assets/images/word_o365.png
A more modern version (I don't know which specifically).
:::

Many things are like this! People are now used to high-definition video streaming - both watching other people's and creating their own - and graphical interfaces, requiring both dealing with vast volumes of data compared to an old text-mode UI[^3] and very rapidly (de)compresing it by three orders of magnitude for the world's slow internet connections using very complex codecs. Messaging systems are meant to deliver to every device someone owns, anywhere in the world, in seconds, while encrypting information in transit, allowing participation in many groups at once and exchanging large files. Every imaginable device is expected to plug-and-play with every plausible piece of software, even if a manufacturer ships subtly broken implementations. Users want to work on the same document with multiple people concurrently, requiring some hairy distributed systems engineering.

This doesn't, strictly, mean they have to run slowly.

## Systems which fit in your head

TODO legibility Seeing Like A State

https://en.wikipedia.org/wiki/Oberon_(operating_system)
ComputerCraft
https://drewdevault.com/2020/03/18/Reckless-limitless-scope.html

## Abstraction allows rapid development

## The hardware is still really fast

[^1]: This isn't actually true, but it's rhetorically convenient, which is just as good.

[^2]: Home computers in 1990 could achieve about 10 <span class="hoverdefn" title="Million Instructions Per Second">MIPS</span>, while modern computers can achieve perhaps 20000 per core, and of course have multiple cores and a GPU.

[^3]: Uncompressed, full HD/8-bit-per-channel/60Hz video, now the bare minimum for usability, occupies a minimum of 3Gbps, significantly more than consumer LANs. I use a modest 4K60 display, which requires 12Gbps. Every byte streaming into a display requires *something* to generate it.
