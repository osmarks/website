---
title: Modded Minecraft power creep trends
description: Has Minecraft become easier?
created: 01/11/2024
slug: mcpower
---
Playing modded Minecraft, I have the vague impression that many things have been simplified over the years of development. Of course, vague impressions from memory aren't very reliable, so I've gathered slightly more robust information by looking at what general-purpose "kitchen sink" modpacks in various versions had available. The categories I will use are by nature somewhat arbitrary, but I think they're good enough to be useful. If you don't want to know about all the details, [skip to the conclusion](#conclusion).

## Logistics

In the ancient days of [Tekkit](https://www.technicpack.net/modpack/tekkit.552560/mods) (1.2.5), which is now old enough that I remember almost nothing about it and have had to trawl the Internet Archive and quaint wikis for information, predating even hoppers (1.5), the primary means of item transportation for automation was BuildCraft pipes. These were very unsophisticated: a special pipe with an engine attached was required to move items out of inventories, automatic filtering required a diamond pipe, and if the destination was full then items were simply dropped. There were also Pneumatic Tubes from [RedPower](https://web.archive.org/web/20120103012226/http://www.eloraam.com/), which actually checked whether their destinations had space and had somewhat smarter filtering options, though they still required some additional blocks to do anything - transposers needed redstone signals to submit items to the pipe network and sorters needed "blutricity" produced by other machines. For long distances, there were the options of Railcraft trains and Ender Storage item teleporter boxes.

::: captioned src="/assets/images/bcpipes1.jpg"
A very small BuildCraft pipe system.
:::

::: captioned src="/assets/images/seven_sorters_common_delivery_1.jpg"
Organizing items: previously a hard enough problem that [blog posts](https://gamegenus.blogspot.com/2012/01/minecraft-sorting-and-smelting-system.html) were written on optimizing it.
:::

Somewhat later, [Feed The Beast](https://www.feed-the-beast.com/modpacks/76-ftb-ultimate?tab=mods) (1.4.7) brought, among *many* other things, Applied Energistics. [Applied Energistics](https://web.archive.org/web/20130301012622/http://ae-mod.info/ME-Storage-and-Automation/) replaced the complexity of pipe-based sorting and storage systems with a trivially extensible cabled network which also handled storage and on-demand autocrafting. This means that rather than requiring buildout of dedicated automation systems for every item and making everything else by hand, a much smaller set of machines could be shared between many recipes and only be invoked when needed[^1].

Applied Energistics' developer seemingly considered this a mistake, because around the time of [1.7.10](https://www.feed-the-beast.com/modpacks/23-ftb-infinity-evolved-17?tab=mods), the mod was overhauled with "channels", which encourage more thoroughly planned and complex network designs, as well as moving away from from standard "have ores in the ground" world generation to include rare meteors containing "alien processor presses" necessary to start. The channel system also encouraged creative subnetwork design for certain problems and the mod incentivized organizing storage in certain ways which nobody ever did[^2] to optimize space use. Slightly earlier, Thermal Expansion introduced its "itemducts", essentially a simplified version of the RedPower pneumatic tubes which didn't need external support equipment, and [Ender IO](https://www.curseforge.com/minecraft/mc-mods/ender-io) has roughly contemporaneous conduits which simplify routing even further by fitting multiple pipes into a single block.

::: captioned src="/assets/images/ae2_example_cn.png"
This mid-game system can store several thousand items and automatically craft a few types from its stocks.
:::

::: captioned src="/assets/images/itemducts_simple.jpg"
It was quite hard to find any pictures of the 1.6.4 version. This may or may not be it.
:::

A similar "stable modding version" to 1.7.10 was not really reached until 1.12.2, and by this time Applied Energistics 2 had a new competitor, Refined Storage, which brought AE1's simpler design to newer versions, with many modpacks including it, possibly along with AE2. I do not follow versions later than that in much detail, and there don't seem to be many genuinely new mods from them anyway, but my understanding is that the world has shifted back to AE2 for central storage, with various other mods adding short-distance pipes and [Create](https://www.curseforge.com/minecraft/mc-mods/create)'s conveyor belt systems favoured by some.

A few other less-widely-used logistics solutions have existed:

* [Logistics Pipes](https://ftb.fandom.com/wiki/Getting_Started_(Logistics_Pipes)) extended Buildcraft pipes with AE2-like capabilities while remaining tied to the physical virtual world more than AE2. It seems to have been introduced around 1.4.7 (its history is shrouded in dead links). Modern versions have [Pretty Pipes](https://www.curseforge.com/minecraft/mc-mods/pretty-pipes).
* [ComputerCraft](https://tweaked.cc/) can move items between inventories (with several addons, in older versions), so people built storage systems such as [Milo](https://forums.computercraft.cc/index.php?topic=87.0), [Artist](https://github.com/squidDev-CC/artist), ItemSystem (which appears to be lost now) and about [four](https://github.com/osmarks/dragon) [janky](https://github.com/osmarks/wyvern) [projects](https://docs.osmarks.net/hypha/spectral) I've made.
* [XNet](https://www.mcjty.eu/docs/mods/xnet) is essentially a confusing domain-specific programming language for moving items, energy and fluids.
* [Botania's Corporea system](https://www.reddit.com/r/feedthebeast/comments/8hdl35/a_guide_to_botania_corporea_networks_what_are/) augments vanilla storage systems with some extra automation and IO capabilities.
* [Immersive Engineering](https://www.curseforge.com/minecraft/mc-mods/immersive-engineering) has conveyor belts with more or less the same restrictions as BuildCraft pipes.
* [PneumaticCraft](https://www.curseforge.com/minecraft/mc-mods/pneumaticcraft-repressurized) has its own logistics network based on drones, like Factorio's.

## Industry

As far as I know, "industrialization" in Minecraft in the sense of automation with heavily technology-themed equipment began with BuildCraft and IndustrialCraft. IndustrialCraft and BuildCraft had simple systems for power and some new machines, but BuildCraft focused on things like quarries and pumps whilst IndustrialCraft had electric furnaces, some personal equipment, and various machines which existed to produce parts of other machines. Notably, because of complaints about it using too much iron, it added the macerator, which turned one iron ore into two iron ingots, as many tech mods still do to this day. BuildCraft machines ran on Redstone Engines (free), Stirling Engines (coal) or Combustion Engines (oil, and they required cooling or they would violently explode), but IndustrialCraft had a more complicated system with different voltage tiers, more types of generator and the flagship nuclear reactor, with its own design minigame and also the possibility of violently exploding.

::: captioned src="/assets/images/bcquarry.png"
The iconic BuildCraft Quarry.
:::

::: captioned src="/assets/images/tekkit_nuclear_reactor.jpg"
A [computer-controlled](https://www.planetminecraft.com/project/fully-automatic-nuclear-power-plant-in-tekkit-minecraft/) Tekkit nuclear reactor.
:::

Around 1.3, Thermal Expansion was introduced, and with it a new style of machinery which has been adopted by almost every tech mod since. Thermal Expansion machines can automatically output and input items from each side, run even with insufficient power supplied (but slower), store energy rather than requiring it to be supplied exactly when needed, never explode, occupy exactly one block and perform many functions within that one block, and are coupled with generators which work in similar ways. Much of this design was [crystallized](https://www.reddit.com/r/feedthebeast/comments/4dbmll/how_the_default_effect_ensured_rf_power_would_be/) in the Redstone Flux API for cross-mod power compatibility, which has energy work more or less identically to a fluid rather than anything analogous to real electricity, and has remained broadly unchanged in mainstream tech mods since.

Mod intercompatibility in power generation meant that mods could differentiate or "balance" themselves by using bigger numbers. Most notably, [Big Reactors](https://www.curseforge.com/minecraft/mc-mods/big-reactors) was included in many 1.6/1.7 modpacks and trivialized power generation, with fairly cheap, simple, safe and high-output nuclear reactors[^8].

::: captioned src="/assets/images/big_reactor.jpg
One of these machines obsoletes a vast quantity of smaller generators and support infrastructure, so long as you can supply it with yellorium.
:::

As a reaction to perceived power creep, [Immersive Engineering](https://www.curseforge.com/minecraft/mc-mods/immersive-engineering) was released for 1.7.10 too; it has a slightly more complex RF-based power system and, to counter the "magic blocks" phenomenon, uses multiblocks instead. I don't consider this a good solution, as it really only alters the aesthetics and increases resource costs.

::: captioned src="/assets/images/immersive_engineering_biodiesel.webp
This biodiesel plant is bigger than other mods might make it, but it has about five distinct machines in it.
:::

While there have been numerous incremental changes since then - primarily in the direction of bigger numbers, utility mods adding more special-purpose machines to automate very specific tasks and fragmentation into smaller mods - the only big change I am aware of has been [Create](https://www.curseforge.com/minecraft/mc-mods/create), a very much ground-up tech mod in wide use since 1.14 which aims to make automation involve more world interaction and (literal) moving parts.

There are a few mods, generally not used outside modpacks centered on them, actively designed along different lines: [RotaryCraft](https://reikakalseki.github.io/minecraft/mods/rotarycraft.html) and addons are built for physical realism and progression mostly based on forcing players to solve increasingly intricate engineering challenges[^3]; [Modern Industrialization](https://www.curseforge.com/minecraft/mc-mods/modern-industrialization) has specific internal progression mechanisms and is meant to be centered on logistics puzzles; the notorious GregTech series just goes for incompatibility with everything and massive complexity everywhere.

## Resource acquisition

Tech mods also generally provide ways to avoid "manual labour" like mining and farming of mobs and plants[^4], beginning with, again, the BuildCraft quarry for automated mining. [MineFactory Reloaded](https://ftbwiki.org/MineFactory_Reloaded) also added simple-to-use machines for mob and plant automation, whereas [Forestry](https://www.curseforge.com/minecraft/mc-mods/forestry) added much more complex farms and farming in general, including the widely feared bee mechanics, which require players to selectively breed bees to produce a few handy things like ender pearls.

However, Minecraft isn't a well-optimized game. Interacting with the world and having entities is slow, and so mods were frequently designed to avoid these operations to reduce lag on busy servers. This has ultimately led to "functionally equivalent" replacements for farming and mining systems without actually doing the farming and mining, such as [Mystical Agriculture](https://www.curseforge.com/minecraft/mc-mods/mystical-agriculture) (and IndustrialCraft, but less so) resource crops, resource *bees*, several mods for "virtual" mob farms, and things like the [Lens of the Miner](https://ftb.fandom.com/wiki/Lens_of_the_Miner) and [Void Ore Miner](https://ftb.fandom.com/wiki/Void_Ore_Miner), which directly materialize ore from energy. This removes many of Minecraft's "physical" limits and thus permits much more horizontal and vertical scaling, which some mods and modpacks have adapted to with ideas like [singularities](https://www.curseforge.com/minecraft/mc-mods/singularities) crafted from unreasonably large quantities of a single item.

::: captioned src="/assets/images/mystical_agriculture.png"
I don't think you can reasonably consider this operationally interesting given that it is mostly dependent on one mechanic (farming), waiting and sheer numbers.
:::

On the other hand, aside from weird outliers like Mekanism's [5x ore processing](https://wiki.aidancbrady.com/wiki/Ore_Processing), which requires a moderately sized chemical processing line, ore processing - turning ores into ingots - has remained fairly close to the original benchmark IC2 set with ore doubling-and-a-bit-more remaining the standard.

## Magic

Magic mods[^5] are much more heterogeneous, and don't borrow as much from each others' designs as tech mods, plausibly because they don't feel the need to interoperate as much or to match reality at all. Tekkit, for all that it generally has less powerful mods than newer packs, contains [Equivalent Exchange](https://www.minecraftforum.net/forums/mapping-and-modding-java-edition/minecraft-mods/1282288-1-2-5-equivalent-exchange-2-v1-4-6-7), which breaks everything by allowing anything to be converted into anything else for free (once you have one item as a template). Most magic mods do not interact with so much of the game: they have their own internal progression like Thaumcraft's [research](https://ftb.fandom.com/wiki/Research_(Thaumcraft_4)), to some extent Botania's runes, and [Astral Sorcery](https://www.curseforge.com/minecraft/mc-mods/astral-sorcery)'s attunement perk tree, and only sometimes provide capabilities you can "bring out" of the mod. These are sometimes quite powerful - [Psi](https://www.curseforge.com/minecraft/mc-mods/psi) arguably obsoletes most early-to-mid-game tools - but they generally don't compound across mods or appear directly commensurable enough that developers react by increasing the capabilities of their own mods.

## Equipment

There have been many equipment mods. One of the most popular is [Tinkers' Construct](https://ftb.fandom.com/wiki/Tinkers%27_Construct), which makes tools out of swappable parts with distinct modifiers. However, in its original form, it had more or less a unique globally optimal tool set significantly better than vanilla's: Tinkers' Construct 2 adjusted everything and fixed this. Many mods with their own materials add their own slightly-better-than-vanilla armour and tool sets, but IC2, fairly early on, decided to add armour to make you [effectively immortal](https://ftbwiki.org/QuantumSuit). I suppose this reduced the efficacy of future power-creep. There are several other dimensions along which equipment can vary beyond raw power, like unique convenience features as in [Modular Powersuits](https://ftbwiki.org/Modular_Powersuits), and many magic or tech mods design tool sets along similar lines.

No mention of equipment power creep, however, is complete without mentioning Draconic Evolution. Draconic Evolution has a [boss](https://ftb.fandom.com/wiki/Chaos_Guardian) which deals damage which *cannot be blocked* - indeed, it can harm creative mode players - while simultaneously having its own armour which directly prevents death from any source as long as it is powered. The obvious consequence of this is that Draconic Evolution equipment is [almost](https://www.reddit.com/r/allthemods/comments/s12ho7/couldnt_beat_the_chaos_guardian_with_full/) a hard requirement for survival, and will trivially curbstomp almost anything else.

## Conclusion

"Power creep" is actually several closely related things:

* The existence of a [single optimal strategy](https://heav.apionet.net/blog#8) (or total ordering over strategies). This is probably a *realistic* way for a game to behave - in real life, there are many solutions to problems, ways to behave, traits and circumstances which are more or less "dominated options" - but, for whatever reason, often feels unpleasant[^6]. Unlike in most other domains, people usually want there to be tradeoffs, perhaps because they find different playstyles fun.
* "One-upmanship" leading to this narrowing of strategies - or perhaps just to increasingly large numbers, though this has the same ultimate effect - in which developers want to make their mod relevant in the current situation, make it slightly more powerful than others in some dimension, and "force" others to follow.
* Loss of complexity through "competition" on ease-of-use features, as has happened with logistics, machinery and resources.

You can reasonably argue that it's not an actual problem because multiplayer games usually aren't sufficiently competitive to force use of the optimal strategy, so players can pick their preferred option, and because [CraftTweaker](https://www.curseforge.com/minecraft/mc-mods/crafttweaker)-like tools allow customization to bring strategies' power into alignment. I don't think this is right, since defaults are very powerful: recipe tweaking is slow and annoying enough to be rarely done extensively except by specialized pack designers, people are likely still biased towards "better" options, and it affects the design of new mechanics in mods, as they will usually be built against the perceived defaults rather than people's idiosyncratic preferences.

Something interesting to note here is that we don't see a smooth monotonic progression towards more power. There generally instead seems to be convergence toward a "preferred" level of simplicity/abstraction/power within each domain, progressing rapidly at first as people discover-or-invent new mechanics and occasionally reversing (e.g. Create, AE2[^9]). There's also lots of sensitivity to the actions and design goals of individual developers, making jumps discontinuous and somewhat unpredictable. It also appears that power creep is avoidable by individual mod authors by deliberately reducing interconnectivity with other mods, such that users cannot pick-and-choose optimal solutions finely, and by having unusual features which can't clearly be compared in power[^7].

What can we learn from this outside of Minecraft mod balance? Probably not that much. While we see that the dynamics involved have been quite sensitive to individual developers, I think this is because there's not very strong selection pressure on mods and because "generations" are slow rather than this being a more general pattern. One interesting angle here is that the (apparent) nonexistence of a dominant strategy often comes from the advantages and disadvantages being merely hard to compare rather than actually equal. I think this holds up in other contexts, and growing ability to make end-to-end comparisons might remove illusions that many things are equally matched.

[^1]: In a way, this is similar to (the ideal of) cloud computing.

[^2]: You "pay for" item types as well as individual items, so in principle you can eke out greater storage efficiency by defragmenting storage carefully such that each storage cell contains a specific small set of item types and is correctly sized for them. In practice, storage cells are cheap enough and the problem frustrating enough to keep on top of that this was only ever done as a [fun curiosity](https://www.reddit.com/r/feedthebeast/comments/5qclhu/ae2_perfect_storage_cell_defragmentation/).

[^3]: The author goes to great lengths to keep everything working despite being functionally unable to move off 1.7.10. It is admirable and vaguely cursed.

[^4]: This is possible in vanilla, but most of the designs are somewhat annoying and expensive or require [technical Minecraft horrors](https://technical-minecraft.fandom.com/wiki/Quarry).

[^5]: As [mentioned](/magic/) in my other post, I mean specifically magic-aesthetic mods, similarly to [this](https://genetyx8.github.io/flat-square-torus/2021/07/09/magic-mods.html).

[^6]: Also, it wastes game design effort if you don't expect anyone to use the worse ones.

[^7]: This reminds me of [status illegibility](https://www.ribbonfarm.com/2010/10/14/the-gervais-principle-iv-wonderful-human-beings/).

[^8]: Ironically, we probably could have this in real life too.

[^9]: It's possible that these only worked because of timing - people were already used to and somewhat bored of their predecessors. I don't know.
