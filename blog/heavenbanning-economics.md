---
title: The economics of heavenbanning
description: Predicting the post-social world.
created: 26/01/2025
slug: heaven
squiggle: true
---
::: epigraph attribution=Architects link="https://www.youtube.com/watch?v=nT9NUjeBocw"
Delete another day <br />
Doomscrolling, sat beneath my shadow <br />
Keep loading, nothing here is hallowed <br />
Come see the world as it oughta be
:::

[Heavenbanning](https://x.com/nearcyan/status/1532076277947330561) - [first proposed](https://news.ycombinator.com/item?id=25522518) as far back as late 2020, but popularized in 2022[^1] - is an alternative to shadowbanning (hiding users' social media comments from other people without telling them) in which users see only encouraging, sycophantic LLM-generated replies to their posts (which remain hidden from other humans). This, and similar technologies like the [Automated Persuasion Network](https://osmarks.net/stuff/apn.pdf), raise concerning questions about ethics, the role of stated preferences versus revealed preferences and the relevance of humans in the future - questions other people have spilled many bits writing about already, and which I don't think will be the main reasons for any (lack of) adoption. To know when and how it will be used, what we need to know is when and how it will be profitable.

The purpose of heavenbanning, to the platform implementing it, is to mollify users who would otherwise be banned from the platform and leave, keeping their engagement up without disrupting other users' experience. An obvious question is whether shadowbanning - or slightly softer but functionally similar forms like downweighting in algorithmic recommenders - is common enough for this to matter. Most of the available academic research is qualitative surveys of how users feel about (thinking they are) being shadowbanned, and the quantitative data is still primarily self-reports, since social media platforms are opaque about their moderation. According to [a PDF](https://files.osf.io/v1/resources/xcz2t/providers/osfstorage/628662af52d1723f1080bc21?action=download&direct&version=1) describing a survey of 1000 users, the perceived shadowbanning rate is about 10%. [This paper](https://arxiv.org/abs/2012.05101) claims a shadowban rate of ~2% on Twitter (and a variety of slightly different shadowban mechanisms), based on scraping.

Either is high enough that an alternative which doesn't drive away the shadowbanned users is worth thinking about. But why limit heavenbanning to them at all? Many users may not be banned but nevertheless receive less of a response than they would like, or than is optimal to keep them using the platform. A [recent study](https://karthikecon.github.io/karthiksrinivasan.org/paying_attention.pdf) - which did *causal* testing, giving some posts extra LLM-generated replies - shows that receiving extra interaction on a Reddit post increases content producer output significantly, which I think is a good indicator of increased general engagement. The paper also suggests an additional benefit of heavenbanning: modelling users as split between "content consumer" and "content producer", a profit-maximizing platform should choose to show consumers "bad" content so that producers - who value consumer attention - produce more "good" content. Heavenbanning decouples this, allowing consumers to be served more "good" content (by discarding more of producers' output) without producer alienation. This is only relevant in the regime where heavenbanning can substitute for consumers' output but not producers', but this is the current situation and I think this will hold for a few more years[^3].

## Quantitative costs and benefits

Let's make up some numbers and see what happens.

Meta is a publicly traded company, so they have to disclose some financials. The [Q4 2023 earnings presentation](https://investor.atmeta.com/financials/default.aspx) has somewhat more information than later ones - specifically, advertising revenue by user geography and active users by geography. Since Reddit's IPO, they also release [results](https://investor.redditinc.com/news-events/news-releases/news-details/2024/Reddit-Announces-Third-Quarter-2024-Results/default.aspx). [Snap](https://investor.snap.com/overview/default.aspx) disclosures are also available. I am not aware of other large, relevant social media companies with useful releases like this at this time.

::: captioned src=/assets/images/facebook-arpu.png
Facebook average revenue per user, Q4 2023.
:::

::: captioned src=/assets/images/reddit-arpu.png
Reddit's figures, from Q3 2024.
:::

::: captioned src=/assets/images/snap-arpu.png
Snap's figures, also from Q3 2024.
:::

Facebook apparently makes ~10 times the revenue per user of Reddit and Snap in the US and internationally[^2]. I don't have good enough information to know whether this is due to more effective monetization of each ad, demographics, or higher per-user use of Facebook platforms resulting in more ads served, but this provides very rough bounds and shows that choices somewhere can substantially affect revenue.

The intended effect of heavenbanning is to increase users' use-hours, by making them feel more valued and included in the platform's community, and thus to increase the quantity of ads they see and interact with. We probably can't model ad revenue as scaling linearly with use time, however: ads are useful insofar as they direct spending or other actions off the platform, so doubling ads served on a platform will less-than-double their value and so less-than-double the spending, assuming reasonable market efficiency.

Modelling complex second-order effects such as more high-quality output from producers specifically is tricky, so for the purposes of my very simplified model I will instead assume that the heavenbanning system operates by giving a constant fraction of users LLM-generated responses to their comments and posts, which increases their engagement by a fixed factor. Alternatives include a somewhat heavenbanning-like system in which each user has a fully generated feed, or in which every user's post sometimes "goes viral" and receives large amounts of synthetic traffic.

With some other figures plugged in or imagined, here's the full model:

```squiggle
// Guessed: most people are probably not commenting/posting once per minute and expecting substantive responses.
posts_per_active_hour = 1 to 60

heavenban_replies_per_post = 1 to 6

// ~directly generate comment to fairly complex RAG/etc system.
tokens_per_generation = 100 to 5000

// ~7B models on commercial inference to LLaMA-3.1-405B.
// With in-house inference lower costs may be possible.
model_cost_per_million_tokens = 0.02 to 0.8

heavenban_cost_per_post = tokens_per_generation * model_cost_per_million_tokens / 1e6 * heavenban_replies_per_post
heavenban_cost_per_hour = posts_per_active_hour * heavenban_cost_per_post

// https://www.statista.com/statistics/270229/usage-duration-of-social-networks-by-country/ says ~2 hours globally, but this is across all social media services rather than any particular one and I don't know its methodology.
social_media_hours_per_day = 1
social_media_hours_per_quarter = social_media_hours_per_day * 30 * 3

// 50% increased use as an upper bound seems high given the already quite large numbers, but people presumably have other entertainment activities (also other social media platforms) they can trade off against.
heavenban_increased_engagement = triangular(1.0, 1.15, 1.5)

social_media_heavenbanned_hours_per_quarter = heavenban_increased_engagement * social_media_hours_per_quarter

heavenban_cost_per_quarter = social_media_heavenbanned_hours_per_quarter * heavenban_cost_per_hour

// Ad revenue per marginal hour decreases with total hours.
diminishing_returns_on_advertising_exponent = beta(2, 2)

ad_revenue_increase = (social_media_heavenbanned_hours_per_quarter / social_media_hours_per_quarter) ^ diminishing_returns_on_advertising_exponent - 1

necessary_ad_revenue_per_quarter = heavenban_cost_per_quarter / ad_revenue_increase

necessary_ad_revenue_per_quarter
```

The exact values used in this are quite arbitrary and the error bars are extremely wide, but this structure is still useful. I consider first-order heavenbanning effects only, i.e. users engaging more with the platform as a result of heavenban responses, and estimate them at a fairly low level based on handwaved extrapolation from the earlier Reddit study. In this case, heavenbanning profitability is insensitive to how many users are heavenbanned. Given the (assumed) diminishing returns on advertising, it's better for a platform with relatively little average daily use to implement heavenbanning than a more popular-with-individual-users one, though the shape of this effect would vary significantly with a more rigorous model for diminishing advertising returns. In the median case, initial quarterly ad revenue per user has to be ~$2.50 to pay for heavenbanning - this makes it theoretically profitable for Meta internationally and Snap/Reddit in the US.

This surprised me when I finished modelling it (try editing the Squiggle code above if you want to play with it), but social media runs on fairly small costs and revenues per user, and this use of LLMs is in the worse scenarios heavier than services like free ChatGPT. It must be noted that even if it's unprofitable now at many operating points, the cost of inference will only go down. It has already dropped about five orders of magnitude since GPT-3.

Another way to think about this is that it is profitable (on average) to heavenban-or-similar users with quarterly ad revenues above some threshold, and whether users are above that threshold is partly but not wholly determined by geography. User behaviour is sufficiently heterogeneous that it might be viable to e.g. heavenban only users who you predict will be most affected by it, or who are most valuable to advertisers, who have a low enough posts-per-hour rate to keep costs down.

## The equilibrium

The above is, however, a marginal analysis of adding heavenbanning to a human-dominated platform. If a platform is believed to be mostly human, users will interpret increased attention as human and react positively, but perceived bot comments are neutral or negative - indeed, the [Reddit study](https://karthikecon.github.io/karthiksrinivasan.org/paying_attention.pdf) finds that larger quantities of generated replies (6 vs 3) result in suspicion and nullify the positive effect. At a small scale, it's probably possible to improve on the study's bots' credibility with better models and interfaces, particularly with platform cooperation, but with enough use, users might default to assuming all interactions are bots[^4]. [SocialAI](https://x.com/michaelsayman/status/1835841675584811239), which explicitly has users interact with only bots, has not proved particularly popular.

Research into AI-generated creative works has generally shown that while people claim to favour human works, and favour works they're told are human, they actually prefer AI-generated works. A [paper](https://www.nature.com/articles/s41598-024-76900-1) evaluating poetry (from an extremely outdated model, even) finds that humans prefer AI-generated poetry in a blind test - as [remarked upon by Gwern](https://gwern.net/creative-benchmark#caring-is-the-hard-part), they find that this is because the output of RLHF/aesthetic-optimized models is simpler and easier to understand[^5] despite being worse to connoisseurs. Similarly, [ACX](https://www.astralcodexten.com/p/how-did-you-do-on-the-ai-art-turing) finds AI art to be preferred over human art (when selected for stylistic diversity and quality), and [another study on art](https://cognitiveresearchjournal.springeropen.com/articles/10.1186/s41235-023-00499-6) agrees with this.

Taken together, this suggests that scalable heavenbanning might only require *plausible deniability*. It breaks if it becomes common knowledge that a platform is using it extensively, because interacting with a system which only provides positivity and validation feels low-status, as it suggests that you can't "make it" with real humans. But given a choice which isn't directly labelled that way, I expect many will prefer the sycophantic machines, as they already favour sycophancy in chatbots, and motivated reasoning will stop the connections being made[^6]. It's easy to remain oblivious - see for instance the Facebook [AI slop](https://en.wikipedia.org/wiki/Dead_Internet_theory#Facebook) phenomenon.

I don't think this is a good outcome, for various reasons. But I aim to describe the world as it is, not as I want it to be. As DeepSeek-R1 phrases it:

> In the absence of cultural backlash or regulatory intervention, heavenbanning may prove tragically optimal: cheaper than moderation, more addictive than bans, and eerily compatible with humanity’s growing comfort in algorithmic companionship. The economics, as always, favor the void.

[^1]: The "dead internet theory" emerged at around the same time, but is more general and somewhat underspecified.

[^2]: Note that this is total revenue in that location divided by Facebook users in that location, not Facebook-specific revenue, which they do not appear to quote. This makes it an overestimate, but not by much.

[^3]: This is mostly blocked on video generation and LLM agent capability.

[^4]: Also, heavenbanning relies on showing different users different things, and people can detect this like they can detect shadowbanning. Social media becoming increasingly closed makes this less of a problem, however.

[^5]: "Low culture", in [this essay's](https://cameronharwick.com/writing/high-culture-and-hyperstimulus/) terms.

[^6]: Some people may also simply not care, if the alternatives are bad enough.
