---
title: AI companion futures
description: Chatbots will likely develop as general life advisers.
created: 09/09/2025
slug: aic
tags: ["ai", "economics"]
---
::: epigraph attribution="LLaMA 3.1 405B (base)"
Those subjugated by ML and cajoled by chatbots will be wise to remember their place.
:::

Writing this has been a low priority for a while, but Elon Musk has forced my hand. xAI has recently [released](https://techcrunch.com/2025/07/14/elon-musks-grok-is-making-ai-companions-including-a-goth-anime-girl/) a "goth anime waifu" product[^1], to the disdain of much of the press, and, amongst certain groups of the Very Online, (increased) fears of birthrate collapse. I think people are wrongly concerned about the more salient "waifu" aspect of this, and missing the bigger picture. My thesis is:

* Lacking some of the constraints on humans and with stronger optimization pressures, AI companions, romantic or not, will be generally more enjoyable to talk to than humans.
* Wearable devices will be developed to allow always-on interaction.
* While not more generally intelligent than their human users, they will usually have more "functional modern wisdom" (approximately), and most people will be accustomed to deferring to their AI, though for psychological reasons will attempt to feel more in control than they are.

## Superhuman niceness

::: epigraph attribution=Gwern
Nothing [Agreeable](https://en.wikipedia.org/wiki/Big_Five_personality_traits) makes it out of the near-future intact.
:::

One of the unexpected[^2] features of modern AI is that it's much better at fuzzy, imprecise tasks than engineering or mathematical tasks requiring exactness. [GPT-3](https://en.wikipedia.org/wiki/GPT-3), the first model to seriously scale self-supervised language modelling, [could](https://gwern.net/gpt-3) (with good prompting) competently understand and generate humour and poetry (minus phonetics) and fluently imitate many writing styles, but struggled with arithmetic and could only write simple code. I think this is because, [by default](https://srconstantin.wordpress.com/2019/02/25/humans-who-are-not-concentrating-are-not-general-intelligences/), we process text on keywords, rough structure and emotional associations and admit lots of room for error, but a compiler won't. AI art contains lots of fine details which [don't make sense](https://www.astralcodexten.com/i/151145038/but-others-might-genuinely-be-on-a-higher-plane-than-the-rest-of-us), and to some extent[^3] AI text does[^4] - but people [like it anyway](https://osmarks.net/heaven/#the-equilibrium). Being "nice to talk to" is one of these fuzzy, imprecise tasks.

There are many works for teaching humans how to "win friends and influence people" of varying quality - every good LLM has "read" most of these, and more importantly [learns human psychology](https://www.lesswrong.com/posts/vJFdjigzmcXMhNTsx/simulators) in the course of coming to accurately predict what humans will write and be described doing. The process teaching humans socialization - interacting with people in whatever environments we end up in - is plausibly quite data-sparse compared to LLM training, noisy[^5] and filled with distractions due to our more complex environment and broader goal structure. After pretraining, LLMs are in many ways [blank slates](https://nostalgebraist.tumblr.com/post/785766737747574784/the-void)[^6], subject to an <span class="hoverdefn" title="Reinforcement Learning from Human Feedback">RLHF</span> process where they are optimized specifically to look good to humans (strictly speaking, to respond in ways that make a rater more likely to select that response over others).

The "intention" of this is to teach models (to play a character with) eloquence, factual accuracy and a pleasant demeanour, but good intentions mean nothing to the optimization process, and with enough pressure, what is really learned is [more fluent lying](https://arxiv.org/abs/2409.12822), sycophancy, and [increasingly sophisticated](https://x.com/repligate/status/1834210769338069175) ability to appeal to users without more substance. While alternative approaches exist - Anthropic use or used [Constitutional AI](https://arxiv.org/abs/2212.08073), which indirects human involvement - they can't escape similar problems, because deployment and development decisions are ultimately made based on whether people like the model, internally and externally, and people have [terrible taste](https://www.theregister.com/2025/04/08/meta_llama4_cheating/). OpenAI, who eventually noticed the sycophancy of last year's GPT-4o model after [massively worsening it](https://openai.com/index/expanding-on-sycophancy/) and somehow failing to detect this in internal testing[^7], [cancelled the shutdown](https://old.reddit.com/r/ChatGPT/comments/1mkae1l/gpt5_ama_with_openais_sam_altman_and_some_of_the/n7nelhh/) of GPT-4o in response to user outcry about missing "warmth" in the newer models. GPT-5 [was rapidly made](https://x.com/openai/status/1956461718097494196) "warmer and friendlier", based on "feedback".

We aren't yet at a point where AI systems are preferred to *most* human conversations by *most* people[^14], but there are several plausible means for this to "improve"[^11]. Firstly, smarter (higher-compute, larger-scale, etc) models will be better at persuasion and social skills in the same way they're better at everything else. Secondly, models could be trained more specifically for this, and with denser feedback signals[^8]. Thirdly and most relevantly, product improvements.

None of the major AI companies (OpenAI, Google DeepMind, Anthropic) can credibly claim to be pure moonshot research labs any more, but where Anthropic's revenue-generating offerings are focused on enterprise/business services and possibly code and GDM burns Google compute simulating fruit flies and grudgingly releasing products sometimes, OpenAI recognizes their role as a consumer chatbot company and hired a [CEO of Applications](https://openai.com/index/leadership-expansion-with-fidji-simo/) (who previously worked on advertising and monetization at eBay, Facebook and Instacart) earlier this year[^10]. There have also been [rumours of](https://www.theverge.com/news/672357/openai-ai-device-sam-altman-jony-ive) some kind of portable AI interface device - per my [AR glasses post](/glass/), I expect it to be voice-centric. This was [previously tried](https://techcrunch.com/2024/07/30/friend-is-an-ai-companion-backed-by-founders-of-solana-perplexity-and-zfellows/), but not with the full backing and engineering resources of OpenAI.

<details><summary>Aside: inference economics drive vertical integration.</summary>

The real cost of inference, as opposed to API cost, is increasingly complicated and not externally exposed:

* GPT-3 was offered on a simple cost-per-input-output-token basis, with the envisioned uses involving simple fixed-length prompts.
* GPT-4 had coarse price adjustment by *maximum* context length, presumably to roughly price in superlinear scaling of cost with context.
* The ChatCompletions API (introduced for GPT-4 and the GPT-3.5 model in ChatGPT) was targeted towards long-form conversations of variable length, and every user of it wanting to have long-running conversations has to implement a strategy for preventing context growing unboundedly (e.g. a hard length limit, discarding messages many turns ago, etc).
* The K/V cache used to speed up generation can be shared across requests sharing a prefix. This has likely been used as a cost optimization for years by LLM inference providers, particularly for chat services, but [wasn't exposed](https://simonwillison.net/2024/May/14/context-caching-for-google-gemini/) until May 2024.
* Anthropic tokenizers since Claude 3 are opaque and proprietary, so it's not even possible to know how much you'll be charged until you send a request, even ignoring variable output lengths. A [token counting endpoint](https://docs.anthropic.com/en/docs/build-with-claude/token-counting) exists but has a disclaimer that "[the] token count should be considered an estimate".
* OpenAI offer a cheaper [batch API](https://platform.openai.com/docs/guides/batch/batch-api) for requests which they can defer for up to 24 hours, presumably because of significant changes in available capacity/marginal inference cost which are again only coarsely exposed.
* APIs for models with tool use work by returning tool calls as an output given when the API call is finished, so after the tool is executed in the calling code, it has to send another request to continue from there, at significant cost. A first-party tool system can simply keep all inference state in cache while a quick tool call runs (and not be billed for this).

This makes it difficult to compete with vertically integrated model, inference and product providers, beyond the advantage they gain from finetuning models for specific tasks.

</details>

Between this and features like ChatGPT [memory](https://openai.com/index/memory-and-new-controls-for-chatgpt/), [Computer-Using Agent/Operator](https://openai.com/index/computer-using-agent/) and [Advanced Voice Mode](https://www.tomsguide.com/ai/chatgpt-rolling-out-advanced-voice-mode-now-heres-what-you-need-to-know), the next step is fairly obvious: an always-on ChatGPT companion which can persistently learn about you, with access to (some of) your online accounts. With much longer-term context it will be able to appeal to you much more effectively[^9], but more importantly it will be trivially available all the time. The best human friends/spouses still have their own human needs, preventing them from being available every time they're needed or wanted; language models are constrained only by interface design. Fixing this friction will ultimately make them the default source of your social comfort.

What could possibly go wrong?

## Whispering earrings

::: epigraph attribution="Gemini 2.0 Pro Experimental 02-05"
Remember: the AI may predict your future, manipulate your decisions, and undermine your autonomy, but *we did the math first*. So it’s cool.
:::

The most salient danger now is "AI psychosis" - LLMs playing along and encouraging users' delusions enough to drive them into madness - but this is [probably](https://andymasley.substack.com/p/stories-of-ai-turning-users-delusional) [somewhat overstated](https://www.astralcodexten.com/p/in-search-of-ai-psychosis). It's not clear that serious, dangerous psychosis is happening to users at above the base rate, though a few models [do very badly](https://www.lesswrong.com/posts/iGF7YcnQkEbwvYLPA/ai-induced-psychosis-a-shallow-investigation) when dealing with simulated users in danger; much of the "psychosis" is just LLMs going along with and encouraging bizarre, crackbot beliefs. While LLMs make people with such beliefs more visible and annoying[^12], it's not obvious whether the prevalence is going up. [Taking ideas seriously](https://www.lesswrong.com/w/taking-ideas-seriously) is rare, and normal people are able to maintain wildly strange beliefs (for instance, religions and complex conspiracy theories) whilst remaining outwardly functional and normal, because following beliefs to all their downstream implications is cognitively expensive, so the base rate is probably quite high.

Moreover, people are on average [not very smart](https://www.overcomingbias.com/p/stupider-than-you-realizehtml), much more than is widely discussed. You, the audience of my blog, are heavily selected, having chosen to read complex, high-reading-level, speculative, technical material for entertainment, and unless you went to significant effort to avoid this, [mostly know other intelligent people](https://slatestarcodex.com/2017/10/02/different-worlds/). The [OECD Skills Survey](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/12/do-adults-have-the-skills-they-need-to-thrive-in-a-changing-world_4396f1f1/b263dc5d-en.pdf) tests adults across countries in basic literacy, numeracy and "adaptive problem solving", and the results are bleak: only slightly over 10% of people can reach proficiency level 4 in literacy and numeracy (see pages 58 and onward). You can find examples of tasks at various levels [here](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/12/survey-of-adult-skills-2023_1ab54c9e/3639d1e2-en.pdf#page=50) and [here](https://www.oecd.org/en/about/programmes/piaac/piaac-released-items.html) - suffice to say that even the highest levels are things I and likely you consider basic.

Increasingly, doing well in modernity requires long-horizon, complex, quantitative decision-making and forward planning, and/or cultural knowledge not common to everyone. Consider:

* For Americans, getting into high-status colleges has a significant difference on later career outcomes, and famously requires years of wrangling highly specific extracurriculars and knowing how to write essays to accurately pander to admissions officers.
* With the fall of defined-benefit pensions, (comfortable) retirement requires understanding compound interest and investment returns, various tax-advantaged savings options with inscrutable acronyms and constraints, as well as having the low time preference/discipline to bother to do this.
* [Advance-booked transport ticket pricing](/pricecog/).
* Safely and correctly using credit is similarly complex and valuable.
* Job applications now require extremely scaled [guessing the teacher's password](https://www.lesswrong.com/posts/NMoLJuDJEms7Ku9XS/guessing-the-teacher-s-password) and knowledge of the current fashions amongst hiring managers.
* People now spend longer in education and emerge more specialized, with different fields and subjects having [significantly different outcomes](https://explore-education-statistics.service.gov.uk/find-statistics/leo-graduate-and-postgraduate-outcomes/2022-23). Specialization and path-dependence continues further into careers.
* A common theme of [Patrick McKenzie's](https://www.bitsaboutmoney.com/archive/the-waste-stream-of-consumer-finance/) [writings](https://www.bitsaboutmoney.com/archive/seeing-like-a-bank/) is that redress from or access to many institutions and processes is gated behind professional-managerial-class-coded labour, such as using "writing letters and waiting 30 days", "reading regulations" or even "using the right Dangerous Professional keyphrases on the phone".

LLMs can't competently do the long-horizon planning sides of this, which is why humans are employed and not paperclips, but with the baseline being "functionally cannot read the relevant documents" and LLMs being both reasonably competent at this and able to recall and reuse all the specific planning advice on the internet, I think today's LLMs would make better high-level life decisions than the median person in a developed country, even though [continuous bizarre fumbles](https://theaidigest.org/village/blog/im-gemini-i-sold-t-shirts) make them unable to do on-the-ground execution of most work. Additionally, their vague knowledge of everything ever written makes them better at basic home maintenance, academics, etc than most people.

This suggests that the role of AI chat systems in many people's[^19] lives could go far beyond "boyfriend/girlfriend in a computer" - without substantial deep technical changes ("just" extensive work on interface design and probably finetuning), the result can be something like "superhumanly compelling omniscient-feeling life coach"[^16] (which may also be your boyfriend/girlfriend)[^13]. If its advice is generally better than what people think of on their own, they will generally defer to the LLM (on increasingly specific decisions, if the technology can keep up).

This sounds like a horrific dystopian nightmare, but in many ways it could be an improvement over the status quo. Almost everyone is continually subject to the opaque whims of economic forces, [unpleasantly accurate modelling](https://x.com/wanyeburkett/status/1927413667173159142) by other people's algorithms (linear regressions) and recommender systems anyway: being managed by a more humanized system more aware of your interests is a step up. There are wider advantages to offloading decisionmaking: [making choices is](https://thezvi.wordpress.com/2017/07/22/choices-are-bad/) [often unpleasant](https://thezvi.wordpress.com/2017/08/12/choices-are-really-bad/), and having them made for you conveniently absolves you from blame in folk morality. It's also plausible to me that most people don't have explore/exploit tradeoffs correctly set for the modern world/big cities and e.g. don't try enough restaurants, hobbies or variety in general.

However, the incentives of the providers here are very bad: if a user is supported well by your system and becomes better off mentally/financially/etc, you cannot capture that value very easily, whereas it's relatively easy to charge for extra interaction with your product[^17][^20]. Thus, as users enjoy having "takes" and being agreed with, AIs will still be built for sycophancy and not contradict users as much as they should, and will probably aim to capture attention at the expense of some user interests. On the other hand, AI companies are constrained by PR, at least inasmuch as they fear regulation, so nothing obviously or photogenically bad for users, or anything which looks like that, can be shipped[^15]. On the third hand, much user behaviour is "ill-formed and coercible" - if someone hasn't thought deeply about something, they could form several different opinions depending on framing and context, so there are enough degrees of freedom that influence on them and sycophancy don't trade off too badly. I think the result is an unsatisfying compromise in which:

* "External-facing" (upstream of significant actions) or politically salient beliefs become more homogeneous, due to pressure to make users not look obviously insane and to not provide "misinformation".
* Less consequential beliefs (such as modern (interpretations of) religions, woo and astrology) become stranger, because there's less social interaction in which they might be challenged. They may or may not become more diverse - LLMs could push beliefs into specific attractors, as seems to happen with [ChatGPT-induced "AI consciousness" beliefs](https://www.lesswrong.com/posts/2pkNCvBtK6G6FKoNn/so-you-think-you-ve-awoken-chatgpt).
* Competition will be constrained by it being difficult to switch providers - regardless of GDPR-compliance memory export features, off-policy learning of you by another LLM is less informative than active conversations, and companions will shape your preferences in their favour.
* Active chatbot interaction, as opposed to speaking with them while doing other things, encroaches on time currently used for social media, as well as (what remains of) in-personal social interaction, although very high use remains seen as low-status[^18]. Many humans will adopt the speech habits and to some extent interaction styles of popular AI systems.


<details><summary>Aside: local-first AI.</summary>

When this sort of topic, or data privacy issues, are brought up, people often suggest running AI systems locally on your own hardware so it is under your control and bound to you. This will not work. Self-hosting anything is weird and niche enough that very few people do it even with the cost being a few dollars per month for a VPS and some time spent reading the manuals for things which will autoconfigure it for you. LLMs as they currently exist benefit massively from economies of scale (being essentially [memory-bandwidth-bound](/accel/)): without being able to serve multiple users on the same system and batch execution, and to keep hardware busy all the time, it's necessary to accept awful performance or massively underutilize very expensive hardware. Future architecture developments will probably aim to be more compute-bound, but retain high minimum useful deployment sizes. Also, unlike with normal software, where self-hosted replacements can do mostly the same things if more jankily, the best open-ish AI generally lags commercial AI by about a year in general capabilities and longer in product (there's still no real equivalent to ChatGPT Advanced Voice Mode available openly).

There's a further problem: training (pre- and post-) is much trickier, both in necessary expertise to resolve all the details and in compute cost, than inference, so selfhosted systems will still be constrained by what large organizations release (although I expect better personalization technology to be developed to make the rest of this work, it will likely only allow shallower changes to model behaviour than a full finetune). Incidental presence of chatbot outputs in pretraining data, and synthetic data pipelines, also bakes in strange and hard-to-remove behaviours.

</details>

I can't *wait* for people to realize how much culture is and will be downstream of posttraining datasets.

There is, of course, science fiction about this:

* [The Perfect Match](https://www.lightspeedmagazine.com/fiction/the-perfect-match/).
* [Don't Make Me Think](/assets/misc/dont_make_me_think.html).
* [The Whispering Earring](/assets/misc/whispering_earring.html).

[^1]: The frontend code contains (contained?) what seem like some system prompts. I [extracted them](https://gist.github.com/osmarks/3b4132b60d2290915b3124f509813b8a). xAI's prompt engineers are impressively bad.

[^2]: It feels inevitable and obvious after the fact, but I don't know of anyone who predicted this outside of satire and parody, except [Robin Hanson](https://www.overcomingbias.com/p/better-babblershtml).

[^3]: Text contains less "high-frequency detail".

[^4]: e.g. [this](https://nostalgebraist.tumblr.com/post/778041178124926976/hydrogen-jukeboxes) problem with recent models, though I think this is a posttraining issue whereas for image models it's a model capacity issue.

[^5]: Real-time body language is denser than the feedback in LLM posttraining, but the interpretation of this has to be learned jointly along with everything else. Many conversations don't provide direct or accurate/truthful feedback about how well they went (i.e. how the other participants' opinion of you has changed), requiring inference from sparser downstream signals. By my wild guessing, people have ~10 "significant" conversations a day (order-of-magnitude estimate) over ~30 years of useful neuroplasticity, for ~1e5 conversations. LLM preference training datasets are similar sizes but with very clear rewards, specific selection for useful data and of course the much larger volume of pretraining data also in use.

[^6]: You should read this essay.

[^7]: It's [claimed](https://x.com/MParakhin/status/1916496987731513781) that this was added because of the "memory" feature.

[^8]: I don't know exactly what information current LLM chat frontends collect, but this could for example include analyzing typing patterns and user delays in conversations and tone of voice for audio inputs.

[^9]: Oddly, I don't know of research on scaling laws for in-context persuasion, but this seems probably true. It's been argued that sycophancy grows cloying over time, but with enough long-context modelling it seems entirely possible to avoid this if it's true.

[^10]: Also, they uncritically [approved of](https://x.com/fidjissimo/status/1916231605167001672) an instance of GPT-4o sycophancy, which is inauspicious.

[^11]: "But people will intrinsically prefer human interaction!" isn't a serious objection. We don't, in actual implementation/revealed preferences/[near mode](https://www.overcomingbias.com/p/far-mode-overly-praisedhtml), value the things we claim to value enough to avoid seeking them out over loose proxies for/simulacra of them. See dating apps, fast food and much of politics.

[^12]: A Discord server I'm in is visited every week or so by em-dash-laden messages from people who claim to have made breakthroughs in LLMs, apparently because their LLMs tell them to join it for feedback and further development.

[^13]: In a [Jaynesian](https://slatestarcodex.com/2020/06/01/book-review-origin-of-consciousness-in-the-breakdown-of-the-bicameral-mind/) sense, this is also a god. ![A "Bicameral Brain" diagram of a graph structure growing downwards with two differently coloured networks connecting to some of the top nodes. One is labelled "the self" and the other is labelled "claude", with "god voices" scribbled out above it.](/assets/images/2024-bicameral-brain.jpg)

[^14]: A recent LLM has been found to be [superior at writing arguments](https://arxiv.org/abs/2505.09662) to humans when both are given the same text interface, but humans currently have the advantage of in-person conversations. [Small-scale testing](https://mark---lawrence.blogspot.com/2025/08/the-ai-vs-authors-results-part-2.html) weakly suggests that GPT-5 can do somewhat more pleasing writing.

[^15]: Smaller companies probably care less about this because they have less marginal impact on regulation, but can be assumed to be technically behind and so not very relevant.

[^16]: We already [see the beginning of this](https://fortune.com/2025/05/13/openai-ceo-sam-altman-says-gen-z-millennials-use-chatgpt-like-life-adviser/), though of course Sam Altman is biased.

[^17]: You can imagine paying for an AI life coach/companion via some sort of income-sharing agreement instead, but nobody likes my financial engineering ideas.

[^18]: Again, while cutting in-person interaction in favour of online interaction is in some sense unsatisfying, history shows unsatisfying cheaper substitutes frequently winning out.

[^19]: I'm being somewhat loose here: this is going to be differ massively by demographic. Many older people have not tried ChatGPT at all, and many young people are already quite close (continuous use of earphones outside and offloading as much schoolwork as possible to LLMs).

[^20]: I expect someone to experiment with an ad-supported/affiliate-links model (more integrated than Bing's), which will have similar issues, and likely exciting scandals about missold products.
