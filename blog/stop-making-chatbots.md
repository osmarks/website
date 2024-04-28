---
title: AI interface design
description: Please stop making chatbots.
slug: nochatbots
created: 27/04/2024
---
::: epigraph attribution="Leo Gao" link=https://twitter.com/nabla_theta/status/1776427242748609022
While computers may excel at soft skills like creativity and emotional understanding, they will never match human ability at dispassionate, mechanical reasoning.
:::

Occasionally when reading fiction (I mostly [read fantasy and scifi](/otherstuff/)) I am struck by just how convenient some fictional thing would be, and get unhappy when I remember it doesn't exist in real life. This most frequently happens with "spatial storage"/"bags of holding", a technology[^1] which would be much handier than my usual backpack-of-many-objects, followed by fictional assistant AIs. While not at the level of fictional (for now) machine gods, they too are very handy, simplifying complex systems and controls for mere humans to operate. As other software engineers presumably feel the same way, it's no wonder we have lots of chatbots now acting as frontends for things. It's a shame this is (with current technology and in most cases) terrible design.

I can understand why else people build chatbots. LLM APIs are [right there](https://platform.openai.com/docs/api-reference), ready to plug into your project, and modern APIs encourage you to treat them as things you talk to rather than the [original, underlying](https://platform.openai.com/docs/api-reference/completions) paradigm of [simulators](https://www.lesswrong.com/s/N7nDePaNabJdnbXeE/p/vJFdjigzmcXMhNTsx) which model processes which produce text. But they aren't a sound way to build your interface, both due to (temporary but still relevant right now) technical limitations and more fundamental <span class="hoverdefn" title="human-computer interaction">HCI</span> considerations.

A good interface makes it clear what functions are available from it and what's out of scope or impossible. A chatbot interface doesn't indicate this, just providing a box which lets you ask anything and a model which can probably do anything, or at least pretend to. If you're using a particular service's chatbot rather than a general-purpose chatbot or general-purpose search engine, you probably have a particular reason for that, a specific task you want to accomplish - and you can only see whether that's possible by negotiating with a machine which might hallucinate or just be confused and misinterpret you. This is especially likely if it's using a last-generation model, which is commonly done to reduce costs.

Since present models are kind of dumb, you can't even have them provide a particularly sophisticated wrapper over whatever they're attached to. You want a competent agentic professional capable of understanding complex problems for you, retaining memory over interactions, following up, and executing subtasks against its backend: however, [agent](https://github.com/Significant-Gravitas/AutoGPT) [scaffolding](https://github.com/princeton-nlp/SWE-agent) is not reliably able to provide this[^2], so the best your chatbot can realistically be is a cheaper [tier one support agent](https://www.bitsaboutmoney.com/archive/seeing-like-a-bank), or in fact less than that because it's not robust enough to have nonpublic access[^3]. Essentially, you have replaced some combination of documentation search, forms and dashboards with a superficially-friendlier interface which will probably lie to you and is slower to use. It does have the advantage that unsophisticated users might find it nicer when it works, but it should not be the *only* option to access things.

There's also the issue of predictability: a good interface agrees with the user's internal model of the interface. It should behave reliably and consistently, so that actions which look the same have the same results. LLMs really, really do not offer this. They are famously sensitive to tiny variations in wording, generally sampled nondeterministically, and not well-understood by most users. Dumber "chatbots" which run on hardcoded string matching do better on this front, but at that point are just pointlessly illegible sets of dropdown menus.

## What am I suggesting instead?

Think about what workflows your users need and how you can serve them with a well-scoped UI rather than pretending to handle every possible input[^5]. Make your interface feel like a predictable, trustworthy tool rather than someone you might delegate work to, unless it actually can have work reasonably delegated to it. A really good tool should do what you mean, anticipating your desires and needs[^4], and AI can help with this, mostly in unflashy but helpful ways - the primary uses being good semantic search and recommender systems. Something like a documentation website should just have good organization and helpful search, maybe with an inline summarizer; forms can just be forms, maybe with AI (or regexes) to point out possibly erroneous inputs; a dashboard should present the most important information upfront and any recent changes or anomalies rather than requiring a dialog tree. In general, subtle uses of AI in areas it's competent are better than trying and failing to emulate a human.

[^1]: My thoughts on fictional magic systems are to be made available here later.

[^2]: I don't really know why this is the case, but it's probably for the best.

[^3]: There are many instances of people forgetting this, with hilarious results. The general term to look for is "prompt injection".

[^4]: Arguably, this means a really good tool loves you. Maybe this is where waifutech comes from.

[^5]: There are a few cases - notably, having LLMs write scripts, and search engines and the like - where you actually *can* service a very wide range of possible inputs. Those are fine. Most situations aren't like that.