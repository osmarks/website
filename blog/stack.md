---
title: Site tech stack
description: Learn about how osmarks.net works internally! Spoiler warning if you wanted to reverse-engineer it yourself.
created: 24/02/2022
---
As you may know, osmarks.net is a website, served from computers which are believed to exist. But have you ever wondered exactly how it's all set up? If not, you may turn elsewhere and live in ignorance. Otherwise, continue reading.

Many similar personal sites are hosted on free static site services or various cloud platforms, but mine actually runs on a physical server. This was originally done because of my general distrust of SaaS/cloud platforms, to learn about Linux administration, and desire to run some non-web things, but now it's necessary to run the full range of weird components which are now important to the website. The hardware has remained the same since early 2019, before I actually had a public site, apart from the addition of more disk capacity and a spare GPU for occasional machine learning workloads - I am using an old HP ML110 G7 tower server. Despite limited RAM and CPU power compared to contemporary rackmount models, it was cheap, has continued to work amazingly reliably, and is much more power-efficient than those would have been. It mostly only runs at about 5% CPU load and 2GB of RAM in use anyway, so it's not been an issue.

The main site itself, which you're currently reading, is in fact just a simple static website. Over the years the exact implementation has varied a lot, from the original not-actually-that-static version using Caddy, some weird PHP scripts for Markdown, and a few folders of HTML files, to the later strange combination of Haskell (using Hakyll) and makefiles to the current somewhat horrible Node.js program (which also interacts with someone else's Go program. Fun!). The modern implementation of the compiler does templating, dependency resolution, Markdown and some optimization tasks in about 300 lines of poorly-described JavaScript.

Being static files, many, many different webservers could have been used for this site. In practice, it's mostly alternated randomly between [caddy](https://caddyserver.com/) (a more recent, Go-based webserver with automatic LetsEncrypt integration) and [nginx](https://nginx.org/) (an older and more powerful but slightly quirky program) - caddy generally had easier configuration, but I arbitrarily preferred nginx in some ways. After caddy v2 suddenly required me to rewrite my configuration and introduced a bunch of weird issues, I permanently switched over to nginx and haven't changed back. The configuration file is now 600 lines or so, even with inclusion of includes to shorten things, but it... works, at least. This is mostly to accommodate the bizzarely large set of subdomains I now have for various people, and reverse proxy configuration for backend services. I also use a custom-compiled build of nginx with HTTP/3 (QUIC) support and some modules compiled in.

Some of these backend things are only for personal use, but a few are related to the site itself. For example, the comment server is a standalone Python program, [isso](https://posativ.org/isso/), with corresponding JS embedded in each page. This works pretty well, but has lead to some weird quirkiness, such as each separate 404-erroring URL having its own list of comments. There's also the Random Stuff API, a custom assemblage of about 15 different Python libraries and external programs which, while technically not linked on the site, does interact with other projects like [PotatOS](https://git.osmarks.net/osmarks/potatOS/), and internal services on the same infrastructure like my [RSS reader](https://miniflux.app/). The images subdomain also uses a [PHP program](https://larsjung.de/h5ai/) to generate a nice searchable index; in fact, it is one of two PHP things I have unfortunately not yet been able to purge. There also used to be a publicly available status page using some custom code, but this doesn't work very well and has now been dropped; previously I had a Grafana (and earlier Netdata) instance there, but this has now been cancelled because it leaks a worrying amount of information.

As for the underlying OS everything runs on, I currently use [Arch Linux](https://i.osmarks.net/memes-or-something/arch-btw.png) (as well as Alpine on a few lower-resourced cloud servers). Some form of Linux is inevitable - BSDs aren't really compatible with much, and Windows is obviously unsuited for server duty - but I mostly use Arch for its stability (this sounds sarcastic, but I've actually found it to be very reliable with regular updates), wide range of packages (particularly from the AUR; as I don't really run critical production infrastructure, I can generally afford to compile stuff from source a lot), and better general ease-of-use than Alpine. As much as I vaguely resent it, this is mostly down to systemd - despite it being a horrific bloated monolith, `journalctl` is very convenient and unit files are pleasant and easy to write compared to the weird OpenRC scripts Alpine uses.

I am actually considering yet another redesign, however; switching to a dynamic site implementation instead would allow me to integrate the comment system and achievement system better, make things like the "from other blogs" tiles actually update at reasonable intervals, and arbitrarily A/B test users, although it would break some nice things like this site's very aggressive caching and fast serving. Please leave your thoughts or lack of thoughts on this in the comments.