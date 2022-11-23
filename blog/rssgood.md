---
title: "RSS: good and useful"
description: RSS/Atom are protocols for Internet-based newsletter/feed services. They're surprisingly well-supported and you should consider using them.
created: 14/05/2022
---
RSS stands for Really Simple Syndication, and it's an underappreciated protocol for generally "following" things on the internet.
Most people do this via proprietary platforms with feed/notification functionality, the problems of which are obvious, or email.
Email, though, is push-based - you subscribe to a service and it communicates with your email server whenever a new item is published.
While this allows new content to be received in near-real-time, it has the significant disadvantage that unsubscription can be difficult and nonstandardized, and your address can be used by anyone else to send you unwanted mails.

RSS inverts this; an RSS reader application periodically checks a list of RSS feeds by downloading them from their servers and displays all new content it finds.
This makes it a lot easier to manage a lot of feeds or items as an end user, particularly since lots of reader software will also let you categorize feeds to better manage content.
It's also easier for site admins: because of rampant spam running your own email server (without email from it being immediately discarded) is tricky, so it's generally required to integrate some external, paid service instead.
RSS only requires serving an XML file, which is very easy to do on top of an existing website, which is probably why it's still pretty widely implemented.

Yes, despite RSS's relative lack of use nowadays, a surprisingly large amount of sites still support it (some might use Atom, a slightly different protocol, but good reader applications support both transparently):

* WordPress, a very popular platform for blogs, has RSS support enabled by default (just go to `/feed/`).
* YouTube has RSS feeds for channels' videos: `https://www.youtube.com/feeds/videos.xml?channel_id=[ID of channel to follow]`.
* Some web fiction sites (e.g. Royal Road, Archive Of Our Own) have per-story RSS feeds.
* osmarks.net has an RSS feed, linked on the main page somewhere: [https://osmarks.net/rss.xml](https://osmarks.net/rss.xml) - this does only cover blog posts and not experiments, as those aren't actually timestamped.
* Blogspot blogs have feeds at `/rss.xml`.
* The BBC has RSS feeds described here: [https://www.bbc.com/news/10628494](https://www.bbc.com/news/10628494).
* Otherwise, you can ctrl+F for "RSS" or "Atom" or "feed" or "subscribe" and might be successful, or try URLs like `/feed`, `/feed.xml`, `/feed.atom`, `/index.xml`, `/rss` or `/rss.xml`.

As for RSS readers to use these with, there are many implementations available.
I use [Miniflux](https://miniflux.app/), since it's self-hosted and accessible on multiple devices via the web, and has nice features like keyboard controls, scraping websites which omit some content from RSS feeds, and an integration API which I use to plug it into my convoluted mess of custom scripting.
The [Awesome Self-Hosted list](https://github.com/awesome-selfhosted/awesome-selfhosted#feed-readers) has many other reader applications like this.
If you prefer something which runs locally as a desktop application, [Wikipedia has a list](https://en.wikipedia.org/wiki/Comparison_of_feed_aggregators) (I haven't actually checked this space myself).