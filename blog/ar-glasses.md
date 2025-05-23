---
title: Consumer AR glasses
description: Why I think they're not popular, and what they need.
created: 22/03/2025
slug: glass
tags: ["hardware", "hci"]
---
::: epigraph attribution="Daniel Eliot Boese"
What were you expecting? At one point, the solution to all communication issues was a handheld glassy rectangle. Welcome to the future. We do things differently here.
:::

AR glasses are obviously very cool in concept, but as consumer products they have not done well. It's been twelve years since Google Glass, and the technology has failed to find wide adoption, though a few people use the existing systems for niche applications like [teleprompters](https://www.youtube.com/watch?v=qAuwW7Wzrng) and [FPV drones](https://www.youtube.com/watch?v=BsEltlIXkYg). [This article](https://fleetwood.dev/posts/a-first-principles-analysis-of-consumer-smart-glasses) by Fleetwood is focused on display tech limitations, but I believe most of the problems are elsewhere.

Note that I'm going to be talking specifically about optical AR, i.e. glasses which combine light from the outside world with overlays optically, rather than using a camera and compositing images digitally like the [Apple Vision Pro](https://www.apple.com/apple-vision-pro/). This is less flexible, but I think social barriers (to wearing a large opaque helmet constantly outside) and focusing issues favor optical AR in the near term[^1].

Optical systems have a critical flaw: for [optics reasons](https://kguttag.com/2024/05/27/cogni-trax-why-hard-edge-occlusion-is-still-impossible-behind-the-magic-trick/), it's not possible to occlude objects, only to draw on top of them. This precludes replacement of objects and limits practical applications to annotations (on top of objects) or <span class="hoverdefn" title="heads-up display">HUDs</span> (overlays not anchored to anything in particular). Current hardware is mostly limited to HUDs due to <span class="hoverdefn" title="field of view">FOV</span> limitations, and low-cost options comprise "display glasses" such as those from [Xreal](https://www.xreal.com/uk/air2/) and [Epson](https://www.epson.co.uk/en_GB/products/smart-glasses/see-through-mobile-viewer/moverio-bt-40/p/31095), which aren't very usable outdoors due to brightness and transmissivity issues but which have high-resolution multicolor displays, and various normal-looking glasses with integrated [low-resolution green displays](https://kguttag.com/2024/08/18/even-realities-g1-minimalist-ar-glasses-with-integrated-prescription-lenses/). This will improve, of course, though it seems like known solutions have nasty tradeoffs.

Given this, I think AR is primarily competing with:

* Smartphones: glasses are much less obtrusive to view than a phone, and thus may be preferred even if image quality is worse.
* Smartwatches: HUDs are faster to check than a watch, and plausibly nicer to read than watch displays, which are small and inconveniently placed.
* Earpieces: while not commonly considered an alternative, they are already widely used as always-on devices, and could provide you with useful context in the background. AR glasses have the advantages of higher bandwidth, scannability (you can glance at them, or read some distance back) and interfering less with the physical world - most people find it difficult to listen to two people speaking at once, but can switch to and from reading things more quickly[^2]. Also, they can have cameras.

Replacing each of these requires somewhat different hardware and supported usecases: a "phone on your face" product for multimedia on the go can get away with less outdoor usability (while still being more convenient than a phone) but needs high-resolution, multicolor display for users to respect it; something to replace a smartwatch or hypothetical context earpiece needs to be light, comfortable, durable and battery-equipped enough to wear all the time, and benefits from a large set of onboard sensors to infer what you want to know.

The former is problematic for power reasons: as Fleetwood describes, mass/volume constraints cut battery capacity to far below a phone's, but almost all the energy-consuming parts of phones must remain onboard[^5]. I haven't found a breakdown of modern smartphone power consumption, but glasses with the featureset people expect from this still need a high-powered processor and modem, with the only difference being the display - which is in a worse position, because it has to be reasonably bright against real-world light across a larger field of view despite optics losses. As a result of this, all the "display glasses" I'm aware of work as wired peripherals for other computers.

Another problem is input, particularly when replacing a phone. Current systems use their host device's inputs or a dedicated controller (not very portable), capacitative touch sensors on the glasses themselves (inconvenient to use and very low-bitrate), head movements (only usable for pointing) and sometimes voice. Other possible methods include gesture sensing (via camera, as in the Vision Pro, or [radar](https://research.google/blog/soli-radar-based-perception-and-interaction-in-pixel-4/)), eye trackers and surface electromyography, as Meta is working on. sEMG reads the nerve signals controlling muscles via electrical potentials on the skin. I expect sEMG and voice to win: making large gestures for a long time is fatiguing, and (according to discussions with a former Meta engineer who worked on this) sEMG is even able to read consciously triggered subthreshold signals which do not cause muscle movement[^3].

As for more smartwatch-replacing products (always-on unobtrusive information overlays), the limit here is applications. People buy smartwatches for fitness tracking applications glasses don't help with as well as for things like notifications, and "read the subject lines of your emails two seconds faster" is not an especially persuasive pitch. Features like navigation seem more useful, but still marginal without a wide portfolio of them. Real-time written language translation overlays could be valuable but impose huge compute costs for image recognition.

There are claims that the "killer app" is LLM integration, but I'm not convinced: LLM agent systems remain too dumb to be workable by themselves, and the lines of research producing them seem focused on having you interact using natural language as you might delegate something to a human, which works about as well over audio. To be very useful, the AI has to have a unified set of interfaces to helpful tools for you - nobody seems interested in doing that integration work and AIs cannot yet operate the human interfaces directly[^4]. [This proposal](https://federicorcassarino.substack.com/p/ar-glasses-much-more-than-you-wanted) for contextually aware applications is compelling, but much harder than merely having the hardware, and with user modelling of this quality I think you could substitute other sensors and IOs effectively. It *is* possible that people will want ubiquitous AI companionship even without significant practical applications.

Why do I want AR glasses despite this, other than the fact that they are in science fiction and therefore required? I think there are useful applications for [relatively non-flashy](https://kguttag.com/2019/10/07/fov-obsession/) systems if you are willing to customize heavily and write lots of personalized software, which I generally am. Old work like [Northpaw](https://web.archive.org/web/20240216092219/https://sensebridge.net/projects/northpaw/) has demonstrated the utility of always-on inputs for integrating things into your cognitive maps, and modern electronics gives us a ridiculous array of sensors available at very little cost. It might also be possible to scan [rough semantics of text](https://gwern.net/idea#deep-learning) into your mind more effectively than via normal reading, but this hardly needs the glasses. With good enough input devices, there are other handy applications like having GNU `units`[^6] on tap everywhere.

Mass-market appeal probably requires reduced costs, better batteries and onboard compute, and, most importantly, a new reason to use them.

[^1]: Also, VR-style passthrough fails closed (if the hardware fails you can't see), which is a safety issue in some circumstances. There are some possible FOV and light sealing issues, which currently make the Vision Pro impractical outside, but these seem more fixable.

[^2]: I don't think this is fundamental - human sensory processing is very plastic and you can imagine using frequencies outside of the standard voice band, Morse, etc. However, only weird nerds would ever learn this, just as most people [do not learn to type fast](https://en.wikipedia.org/wiki/Words_per_minute).

[^3]: It's surprising to me that there isn't more hobbyist interest beyond gimmicks. Possibly the people with the relevant hardware knowledge don't know how to handle the signal processing.

[^4]: Products for this exist but they're bad. Also, many services are hostile to this due to some combination of anti-AI sentiment and wanting human users they can exploit better.

[^5]: Wirelessly offloading many operations to a normal phone nearby is maybe possible, but streaming lots of video back and forth is also costly. For 3D graphics there still has to be a fast onboard GPU to keep latency low in case of head movements.

[^6]: [https://en.wikipedia.org/wiki/GNU_Units](https://en.wikipedia.org/wiki/GNU_Units)
