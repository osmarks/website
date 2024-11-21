---
title: Thoughts on fictional magic systems
description: What exactly is "magic" anyway?
slug: magic
created: 12/05/2024
---
::: epigraph author=Unknown
Arcane magical rituals work because they are adversarial inputs on AI controlling all of reality.
:::

I did allude to the fact that I intended to write this at some point, and now I have, as the world presumably benefits from me compiling my thoughts on this in one place, or something like that. Firstly, we all seem to know[^1] whether something is "technology" or "magic", but what rule do (or should) we use to judge this? I think there are a number of plausible candidates, and some less plausible ones:

* Magic is things which you can't plausibly do in the real world: likely the first definition you think of, but also obviously wrong. There are plenty of science fiction works which make up [entirely different physical laws](https://www.gregegan.net/ORTHOGONAL/ORTHOGONAL.html) or do things which are not that realistic (Niven has partly-psionic spaceship navigation and [humans bred for luck](https://larryniven.fandom.com/wiki/Teela_Brown)). I don't know of fantasy which only has things modern technology can do or can nearly do, but it probably exists somewhere.
* Magic is unpredictable in some way while "science"/technology is not: [not really](https://existentialcomics.com/comic/537)! [Some settings](https://www.reddit.com/r/Fantasy/comments/25u9ej/good_examples_of_soft_magic/) have it work like this, but not all. Also, have you seen computers?
* Magic is nonreductionist physical laws: this seemed closer, and I originally thought of it as a working definition. The real world's physics are, as far as anyone can tell, [annoyingly complicated](https://en.wikipedia.org/wiki/Mathematical_formulation_of_the_Standard_Model) differential equations with no reference to any of the simpler abstractions, like morality, minds, and macroscopic objects, we use. Magic systems make things we think of as simple, like "healing", "reading minds" or "shapeshifting", into easy primitive operations, where doing them on top of real physics requires many contingent details, conflating the map with the territory.
    * This doesn't work either, as the actual explanation for everything is just "the author says so" (or, in games, "the code says so"). In-universe, unless an author really likes infodumps, you may not find out either way[^2].
* Magic is power centred in people (or individuals/life in general) rather than infrastructure - fictional casters can typically do a lot from their knowledge/skills/levels/etc and easily available "mana" (maybe with a few material components), while in real life I require lots of tools (my computers, 3D printer, knife, ominously specific computer-adjacent equipment, etc) and external runtime dependencies (electricity and internet connectivity).
    * This is explicitly discussed in [Mage Errant](https://www.goodreads.com/series/252085-mage-errant) as causing weird sociopolitical situations if you actually run through the consequences.
    * It seems to consistently hold - I can think of some partial counterexamples, but they still pretty heavily confer power on individuals. Even in [Minecraft](/assets/images/botania-tech-mod.png), "magic mods" tend to contain more powers and equipment for the player than "tech mods"[^6].

Now that I've forced you to read those paragraphs, my real position is that "magic" is a fuzzy aesthetic concept related to all of these things to varying degrees: for any "technology" I can think of, I can adjust some surface details and/or backstory to make it "magic", and vice versa. At some level, people generally don't like the way science, technology and the real world work, since our default ontologies aren't built for them, and we have some standard ways to imply "I'm ignoring these in favour something I like more".

The way more or less every magic system, including "hard" ones, leaves its operations massively underspecified, provides some interesting worldbuilding opportunities. I initially thought of this while reading [a book](https://www.goodreads.com/en/book/show/51279226) with a rune-based magic system in which the simplest spell is a "source-link", built out of three runes (~8 bits each[^3]) and yet with many degrees of freedom already filled in - it's targeted using some kind of raycasting (but subject to gravity), renders as a green line, and performs several operations dependent on what the user is thinking[^4]. However, the problem of where the details come from is applicable to almost everything and, I think, infrequently explicitly addressed[^5] ([Ra](https://qntm.org/ra) is significantly about this, and some obscure [HPMoR](https://hpmor.com/) authors' notes talk about it), and can be interesting. Here are some possible approaches:

1. Spellcasters *do* have to specify almost everything (well, down to moderately complex physics), possibly making magic a way to internalize what would otherwise take lots of machinery. This is roughly the approach in [Ra](https://qntm.org/ra) and [The Machineries of Empire](https://www.goodreads.com/book/show/26118426-ninefox-gambit). Characters are legally required to offhandedly mention arbitrarily complex mathematics.
2. The less you specify the more power is required, presumably to derive the remainder some other way. I haven't seen anything but [Break Them All](https://forums.sufficientvelocity.com/threads/break-them-all-original-precross.12960/) (an obscure unfinished prequel (?) to a fanfiction to a webserial) do this. This provides a fairly natural way to make magic users more powerful from study, and to make advance preparation useful.
3. Magic works as either individual magic users expect (or want) it to or as everyone (in aggregate) expects it to. This is quite common, though my favourite implementation is the [Discworld](https://www.goodreads.com/series/40650-discworld) gods.
4. At some level lots of specification is necessary but, [as in software](/assets/images/magic-system.png), this is abstracted in common use. The implications of this are quite close to 2, with the addition that things aren't possible at all until someone works out and shares the low-level techniques, making those more valuable, and the possibility that the underlying systems are lost knowledge.
5. A controlling intelligence resolves the details as required. This implies that someone built it, and possibly that it can be negotiated with or tricked.
6. There are many, many effects which are possible, assigned through something random like a hash function, and people only know of/care about/use a small fraction of them. This does still preclude complex effects like healing unless there is also something biasing them toward being useful. [HPMoR](https://www.facebook.com/509414227/posts/10157671264984228/) does something like this and this is (kind of) the [Unsong](https://unsongbook.com/) magic system.
7. Simulationism - the universe is simulated using high-level approximations, and there's some unintended behaviour in edge cases because it was poorly programmed. Admittedly, this is kind of boring as a solution to anything.

Another somewhat related axis along which magic systems can vary is the ease of replicating a spell once it has been created, which has important economic consequences. At one extreme, once it has been discovered, anyone can cheaply use it (quite like software), and at the other, any new deployment requires large amounts of bespoke work (like traditional construction). Most works seem to make it like deep learning models or general consumer products - there are big initial R&D costs, and nontrivial but relatively small unit/deployment costs.

This is more of a set of somewhat linked ramblings than a cohesive post like I usually try to do, and as such I reserve the right to update it at random, more so than the other ones.

[^1]: Again, in fiction. Real-world magic is just people being wrong and/or exploits of human psychology.

[^2]: Imagine trying to explain to someone from the distant past that you have a box in your hand which can speak with and see people across the world, which works by pretending words, pictures and sounds are numbers, doing several billion pieces of simple maths per second, and writing the numbers onto invisible light seen by a network of constantly-watching towers. For it to work, special patterns much smaller than the eye can see have to be written into rocks. Only about five places in the world can do this. But it's not magic.

[^3]: Possibly a few extra for position.

[^4]: This is actually not a great example: it's not as complicated as some other "simple" things in other fiction, and the spell-complexity issue is explicitly called out later in reference to a cleaning spell.

[^5]: I think this is because authors frequently study English and not ~~a real subject~~ sciences.

[^6]: See also [this essay](https://genetyx8.github.io/flat-square-torus/2021/07/09/magic-mods.html).
