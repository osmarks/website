---
title: "Site tech stack 2: the unfathomed depths"
description: RSAPI and the rest of my infrastructure.
created: 27/03/2024
slug: srsapi
---
::: epigraph attribution=@creatine_cycle link=https://twitter.com/creatine_cycle/status/1661455402033369088
Transhumanism is attractive until you have seen how software is built.
:::

The original [Site tech stack](/stack/) article (updated since release somewhat as hardware has improved and software been replaced) covers the basic workings of the public-facing website. However, I run *other* things, some of which are interesting to talk about! I have a number of services for personal use running on the same infrastructure, and several non-web-facing but public services. Here's the latest edition of the handy diagram I made in Graphviz:

<details>
<summary><h2>Expand</h2></summary>

::: captioned src=/assets/images/rsapi_diagram_5_alay.png wide link
This used to be done manually in draw.io, before it became intractable to run the layouts by hand. You may want to open it in fullscreen.
:::

</details>

This is split into several boxes indicating the various servers several subsystems run on. As I mention in the comments of the old article, I have a physical server running the actual compute tasks (`protagonism`), but a <span class="hoverdefn" title="Virtual Private Server (cloud VM)">VPS</span> (`procyon`) is where your HTTP requests are initially going. Since it tends to have better uptime[^1], it also runs the [uptime monitoring system](https://status.osmarks.net/) onstat3, my [Discord bot](https://github.com/osmarks/autobotrobot), and a few other directly network-facing things: osmarksDNS[^3], an <span class="hoverdefn" title="Internet Relay Chat (the Discord of the 1990s)">IRC</span> server ([APIONET](https://apionet.gh0.pw/)) and smtp2rss.

If you know what <span class="hoverdefn" title="Simple Mail Transfer Protocol">SMTP</span> stands for, hearing "smtp2rss" may have confused you (if you have not talked to me much) or worried you (if you have). Don't worry: it's perfectly sane and reasonable. I [like RSS](/rssgood/), but many people try to email me things, without an RSS fallback[^2]. I dislike minor workflow inconveniences and am willing to throw arbitrary amounts of technology and engineering at them (sometimes), so I wrote a [Python script](https://github.com/osmarks/random-stuff/blob/master/smtp2rss.py) to take inbound emails on a spare domain and expose them as RSS feeds. As a handy bonus, it can provide disposable mailboxes for signing up to services.

A fun quirk of the nginx installation on `procyon` is that, since I wanted it to not be able to decrypt requests to `protagonism` (I don't entirely trust it, and duplicating the certificate issuance programs on each would be irritating), I use [ngx_stream_ssl_preread](https://nginx.org/en/docs/stream/ngx_stream_ssl_preread_module.html) to forward still-encrypted TLS connections either to itself (on another port) or `protagonism`'s reverse proxy. As janky as this sounds, it does seem to work fine, except for one extremely-hard-to-reproduce bug I suspect might be related where users sometimes get shown 404 pages or the status page incorrectly. Traffic is routed over [Tailscale](https://tailscale.com/) using [Headscale](https://github.com/juanfont/headscale)[^5].

Several of `protagonism`'s services are mostly-self-contained personal-use applications, such as [Minoteaur](/minoteaur/) (notes), [ankisyncd](https://github.com/ankicommunity/ankicommunity-sync-server/) (flashcards), [atuin](https://github.com/atuinsh/atuin) (shell history) and [calibre-web](https://github.com/janeczku/calibre-web) (books). The rest are somewhat more interesting, in that they do more and are in some cases publicly accessible. For example, [SPUDNET](https://d.gh0.pw/doku.php?id=gtech:spudnet). It was built to serve the needs of an ["operating system"](https://potatos.madefor.cc/) for ComputerCraft (a Minecraft computer mod) by providing <span class="hoverdefn" title="backdoors">remote debugging services</span>. Originally built about six years ago, it somehow still works with relatively minor changes (new protocol support). It provides bidirectional many-to-one and many-to-many communications over websocket, with an unnecessarily sophisticated authentication system, as well as HTTP long polling fallbacks and incident reports. [Skynet](https://github.com/osmarks/skynet) is a somewhat simpler version.

I also have a monitoring system using [VictoriaMetrics](https://docs.victoriametrics.com/)[^4] and [Grafana](https://grafana.com/). VictoriaMetrics periodically scrapes services for metrics and stores time series, and Grafana can plot them. This is a fairly standard setup, and lots of software exposes Prometheus-compatible metrics itself or has an exporter available (e.g. the [node_exporter](https://github.com/prometheus/node_exporter) for general Linux machine status and the [PostgreSQL exporter](https://github.com/prometheus-community/postgres_exporter)). I went slightly further by exposing metrics in most of my custom applications, so I have, for instance, nice dashboards from my Discord bot.  These used to be public, but apparently that exposing any dashboard in Grafana allows users to read any data out of the backend, which was a bit of a security issue. One might reasonably question how much use I get out of these, as I don't get enough traffic to have to debug performance issues much, but they do look nice and their presence is calming.

::: captioned src=/assets/images/grafana1.png
My customized node-exporter dashboard. I still need more storage.
:::
::: captioned src=/assets/images/grafana2.png
AutoBotRobot monitoring.
:::

The most important component I have is undoubtedly RSAPI, the highly custom integration script which does about twenty different things since putting them in different services would have been annoying. Many things I need to do share the same basic building blocks - a database or simple state storage, timers and an HTTP server - and while it would be *possible* though tricky to factor this out into a library and write several microservices, the deployment would be harder to manage with my tools and many of the parts have to interoperate anyway. Some would consider a 1600-line monolithic Python program plugged into 10 different APIs "bad", but, freed from Conway's law[^6], I think it is actually the most efficient way to do this. For whatever reason I can track its structure mentally very efficiently, so it's not hard to work on.

::: captioned src=/assets/images/rsapimports.png
The RSAPI imports section.
:::

RSAPI has a wide range of functions, having grown from a short Flask application which served [fortunes](https://wiki.archlinux.org/title/Fortune) to [PotatOS](https://potatos.madefor.cc/) by accretion of additional capabilities as they were needed. The exact history has been lost to the halcyon days of poor version control and backups, but it was built in roughly this order:

* Initial version built: served fortunes and [Seventy Maxims of Maximally Effective Mercenaries](https://schlockmercenary.fandom.com/wiki/The_Seventy_Maxims_of_Maximally_Effective_Mercenaries) over HTTP.
* "Currently playing" support for my internet radio server, via integration with MPD.
* youtube-dl web frontend and very basic login.
* IRC bot for server status and MPD status.
* Rewrite from Flask/gevent to asyncio/aiohttp.
* DNS to comments (and IRC) bridge - converts specially formatted DNS queries to a subdomain to comments on a certain page.
* "Currently playing" support expanded with listener counts.
* [Miniflux](https://miniflux.app/) (RSS reader) to Discord bridge, and (unnecessary, since it has an RSS button I somehow ignored) RoyalRoad fiction to RSS bridge.
* Random video selector (from local media folders).
* [IncDec](https://osmarks.net/incdec/)/IRC Bridge.
* Cancelled rewrite to make it more modular. Migration of internal databases from SQLite to LevelDB.
* Live chat on internet radio (specialized bridge to IRC).
* NASA [Astronomy Picture of the Day](https://apod.nasa.gov/apod/) fetcher implemented. Daily task scheduler built.
* Wordnik Word of the Day fetcher implemented.
* ComputerCraft to Prometheus metrics bridge.
* "[Webmaze](https://r.osmarks.net/maze/ZSwLxemYUq59J-Hcr-rx0ejcJmMvrjAhA4Nxa7KcBgiNmmTVa8ZxDHVw-ZVZXhFMxj_6kA)" prototype - an infinite partly connected 3D grid implemented fully statelessly, intended for a hypothetical adventure game which never materialized.
* [Freefall](http://freefall.purrsia.com/) (webcomic) fetcher implemented.
* Migration from youtube-dl to yt_dlp.
* Cross-device scratchpad/clipboard for copying short text between computers.
* For some reason, a script which infinitely generates primes, digits of e and digits of pi, reads them out using bad TTS, and sends them as an internet radio stream[^9].
* Random bytes API.
* Basic service status page for a tablet (to be glued to walls).
* Migration back to SQLite. Proper database migration system.
* URL shortener - in conjunction with my [really short domain](https://0t.lt/), it can produce really short URLs, as well as ZWS-based URLs and two-word URLs like [https://0t.lt/YearningPried](https://0t.lt/YearningPried) - these use a special prefix-free wordlist so they can also be typed in uncapitalized unambiguously.
* [zzcxz](https://zzcxz.citrons.xyz/) telephony interface.
* Tablet status interface enhanced with list of failed services (from systemd).
* Personal event logger.
* Remote to local calendar synchronizer.
* Weather and calendar updates (for the tablet).
* [Threat Update (Twitter)](https://twitter.com/threat_update) scraper.
* [SwitchCraft](https://sc3.io/) player surveillance (Dynmap).
* RSS feed for random memes (for XScreensaver).
* Better login system - multiple users, SSO for other services via [Nginx authentication subrequests](https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-subrequest-authentication/), basicauth option for non-interactive systems.
* Key/value storage backend for PotatOS, due to the shutdown of the random free API it used before.
* Internal LLM-based [Threat Updates](https://r.osmarks.net/threat-update) system[^8], to replace the archive of historical ones and Twitter scraper. I was too lazy to work out how to draw nicely line-wrapped text in images in Python, so this actually invokes a ComputerCraft emulator, runs the Threat Update implementation on that, dumps its virtual screen, and renders that to an image.
* The new comments system, replacing [Isso](https://github.com/isso-comments/isso). It supports ominous AI faces (from StyleGAN2, thanks to [StyleGANCpp](https://github.com/podgorskiy/StyleGANCpp/)[^7]), leftvotes/rightvotes for greater user expression, SSO integration, better threading, and lower client resource use.

I'm especially proud of the ComputerCraft to Prometheus metrics bridge. While it's only about 20 lines of code (plus the ComputerCraft side), it does allow me to feel cool about being able to monitor meaninglessly large numbers in great detail. There are similar Factorio mods, which I'll probably use next time I play.

::: captioned src=/assets/images/grafana3.png
My base's reactor powering up on a recent tech modpack server, as visualized from Grafana.
:::

I also have some custom inference servers backing [Meme Search Engine](https://mse.osmarks.net/) and [Maghammer](/maghammer/), in addition to an ExllamaV2-based LLM API used in PotatOS. Early prototypes loaded the models in-process, but this was very inflexible: restarts were slow, only one process at a time could use them, and it effectively required that consuming code be written in Python. The servers are basic (no automatic batching and few optimizations), but are presently good enough to handle traffic. The CLIP one is in fact open as part of [Meme Search Engine](https://github.com/osmarks/meme-search-engine/blob/master/clip_server.py).

I haven't covered *every* osmarks.net service in this post, or even all the ones in the slightly outdated diagram above, but I think I got the most interesting ones. I hope this was informative, and did not accidentally make people notice horrible security issues I missed.

[^1]: Much better uptime: ![An SSH session on procyon saying "up 588 days, 38 min".](/assets/images/uptime.png)

[^2]: Ironically, they are doing this via mailing list services which absolutely could also offer RSS if they wanted to (Mailchimp does, even, as an option). They probably don't want to for "engagement" reasons.

[^3]: osmarksDNS is less interesting, and refers to a DNS over HTTPS server and recursive resolver installed locally, I think because of an issue with bootstrapping dnscrypt-proxy I had years ago. That was fixed another way, but I never had a compelling reason to shut it down.

[^4]: This used to be Prometheus, but I swapped VictoriaMetrics in to reduce storage requirements.

[^5]: I like Tailscale's ease of use, but it's horrifyingly CPU-intensive for no obvious reason, and `procyon` is not very powerful. This would be a problem if I had traffic.

[^6]: "The structure of any system designed by an organization is isomorphic to the structure of the organization." You could argue that this is more "directly in line with Conway's law" than "freed from it", but ignore that.

[^7]: It seems to have a gender bias problem, presumably due to dataset or potentially broken implementation. I wanted to use Stable Diffusion, but the compute costs are too bad to run it on CPU and I don't have the free VRAM to load it on GPU constantly.

[^8]: Here's the latest: <img src="https://r.osmarks.net/threat-update">

[^9]: That one bothers me. It contains an algorithm for streaming digits of π which I clearly got from GitHub somewhere, but the one for e is written in my style but isn't something I understand or recognize.