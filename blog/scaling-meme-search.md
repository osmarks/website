---
title: Scaling meme search to 230 million images
description: Downloading and indexing everything* on Reddit on one computer.
created: 24/01/2025
# series: meme_search
series_index: 3
slug: memescale
---
::: emphasis
Try the new search system [here](https://nooscope.osmarks.net/). I don't intend to replace the existing [Meme Search Engine](https://mse.osmarks.net/), as its more curated dataset is more useful to me for most applications.
:::

::: epigraph attribution="Brian Eno"
Be the first person to not do something that no one else has ever thought of not doing before.
:::

Computers are very fast. It is easy to forget this when they routinely behave so slowly, and now that many engineers are working on heavily abstracted cloud systems, but even my slightly outdated laptop is in principle capable of executing 15 billion instructions per core in each second it wastes stuttering and doing nothing in particular. People will sometimes talk about how their system has to serve "millions of requests a day", but a day is about 10<sup>5</sup> seconds, and the problem of serving tens of queries a second on much worse hardware than we have now was solved decades ago. The situation is even sillier for GPUs - every consumer GPU is roughly as fast as entire 1990s supercomputers[^1] and they mostly get used to shade triangles for games. In the spirit of [Production Twitter on One Machine](https://thume.ca/2023/01/02/one-machine-twitter/), [Command-line Tools can be 235x Faster than your Hadoop Cluster](https://adamdrake.com/command-line-tools-can-be-235x-faster-than-your-hadoop-cluster.html) and projects like [Marginalia](https://search.marginalia.nu/), I have assembled what I believe to be a competitively sized image dataset and search system on my one ["server"](/stack/)[^2] by carefully avoiding work.

## Scraping

The concept for this project was developed in May, when I was pondering how to get more memes and a more general collection without the existing semimanual curation systems, particularly in order to provide open-domain image search. [MemeThresher](/memethresher/)'s crawler pulls from a small set of subreddits, and it seemed plausible that I could just switch it to `r/all`[^3] to get a decent sample of recent data. However, after their IPO and/or some manager realizing unreasonably late that people might be willing to pay for unstructured text data now, Reddit [does not want you](https://support.reddithelp.com/hc/en-us/articles/26410290525844-Public-Content-Policy) to scrape much, and this consistently cut off after a few thousand items. Conveniently, however, in the [words](https://www.reddit.com/r/reddit4researchers/comments/1co0mqa/our_plans_for_researchers_on_reddit/) of Reddit's CTO:

> “Existing” bulk data solutions that have been deployed (by others!) in the past generally include words such as “unsanctioned” and “bittorent”

The [unsanctioned datasets distributed via BitTorrent](https://academictorrents.com/details/9c263fc85366c1ef8f5bb9da0203f4c8c8db75f4), widely used in research and diligently maintained by [PushShift](https://github.com/Watchful1/PushshiftDumps) and [Arctic Shift](https://github.com/ArthurHeitmann/arctic_shift), were pleasantly easy to download and use, and after the slow process of decompressing and streaming all 500GB of historical submissions through some basic analysis tools on my staging VPS (it has a mechanical hard drive and two Broadwell cores...) I ran some rough estimates and realized that it would be possible for me to process *all* the images (up to November 2024)[^6] rather than just a subset.

This may be unintuitive, since "all the images" was, based on my early estimates, about 250 million. Assuming a (slightly pessimistic) 1MB per image, I certainly don't have 250TB of storage. Usable thumbnails would occupy perhaps 50kB each with the best available compression, which would have been very costly to apply, but 12TB is still more than I have free. The trick is that it wasn't necessary to store any of that[^4]: to do search, only the embedding vectors, occupying about 2kB each, are needed (as well as some metadata for practicality). Prior work like [img2dataset](https://github.com/rom1504/img2dataset) retained resized images for later embedding: I avoided this by implementing the entire system as a monolithic minimal-buffering pipeline going straight from URLs to image buffers to embeddings to a very large compressed blob on disk, with backpressure to clamp download speed to the rate necessary to feed the GPU.

I spent a day or two [implementing](https://github.com/osmarks/meme-search-engine/blob/master/src/reddit_dump.rs) this, with a mode to randomly sample a small fraction of the images for initial testing. This revealed some bottlenecks - notably, the inference server was slower than it theoretically could be and substantially CPU-hungry - which I was able to partly fix by [hackily rewriting](https://github.com/osmarks/meme-search-engine/blob/master/aitemplate/model.py) the model using [AITemplate](https://github.com/facebookincubator/AITemplate). I had anticipated running close to network bandwidth limits, but with my GPU fully loaded and the inference server improved I only hit 200Mbps down at first; a surprising and more binding limit was the CPU-based image preprocessing code, which I "fixed" by compromising image quality very slightly. I also had to increase a lot of resource limits (file descriptors and local DNS caching) to handle the unreasonable amount of parallel downloads. This more or less worked, but more detailed calculations showed that I'd need a month of runtme and significant additional storage for a full run, and the electricity/SSD costs were nontrivial so the project was shelved.

Recently, some reprioritization and requiring a lot of additional storage anyway resulted in me resurrecting the project from the archives. I had to make a few final tweaks to integrate it with the metrics system, reduce network traffic by making it ignore probably-non-image URLs earlier, log some data I was missing and (slightly) handle links to things like Imgur galleries. After an early issue with miswritten concurrency code leading to records being read in the wrong order such that it would not correctly recover from a restart, it ran very smoothly for a few days. There were, however, several unexplained discontinuities in the metrics, as well as some gradual changes over time which resulted in me using far too much CPU time. I had to actually think about optimization.

::: captioned src=/assets/images/meme_scrape_1.png
The metrics dashboard just after starting it up. The white stripe is due to placeholder "image deleted" images, which weren't discarded early until later.
:::

::: captioned src=/assets/images/net_cpu_metrics.png
While not constantly maxing out CPU, it was bad enough to worsen GPU utilization.
:::

There were, conveniently, easy solutions. I reanalyzed some code and realized that I was using an inefficient `msgpack` library in the Python inference server for no particular reason, which was easy to swap out; that having the inference server client code send images as PNGs to reduce network traffic was not necessary for this and was probably using nontrivial CPU time for encode/decode (PNG uses outdated and slow compression); and that a farily easy [replacement](https://lib.rs/crates/fast_image_resize) for the Rust image resizing code was available with significant speedups. This reduced load enough to keep things functioning stably at slightly less than 100% CPU for a while, but it crept up again later. [Further profiling](/assets/images/meme-search-perf.png) revealed no obvious low-hanging fruit other than [console-subscriber](https://github.com/tokio-rs/console/), a monitoring tool for tokio async code, using ~15% of runtime for no good reason - fixing this and switching again to slightly lower-quality image resizing fixed everything for the remainder of runtime. There was a later spike in network bandwidth which appeared to be due to there being many more large PNGs to download, which I worried would sink the project (or at least make it 20% slower), but this resolved itself after a few hours.

## Indexing

Previous Meme Search Engines have used a small dataset in the tens of thousands of items, so search was very easy and could work through trivial brute force in milliseconds, and I mostly treated the vector index as a black box. A four-order-of-magnitude scaleup makes many problems less easy: a brute-force scan takes an impractical several minutes, so <span class="hoverdefn" title="approximate nearest neighbours">ANN</span> algorithms are necessary. Unfortunately, I have weird enough requirements that my problems went from "trivial" to "active area of research": I have ten times more data than fits in RAM uncompressed, I want reasonably high recall[^9], I want low latency (hundreds of milliseconds at most), I have much less CPU power than the people studying this usually do, and I need to search image embeddings using text embeddings, which [apparently](https://kay21s.github.io/RoarGraph-VLDB2024.pdf) makes ANN indices' jobs much harder.

The "default" option for this is FAISS's inverted lists (clustering vectors and searching a subset of clusters; these can be stored on disk and memory-mapped) and product quantization (lossy compression of vectors for faster scanning and smaller memory footprint). This is what I had initially assumed I would use. FAISS's documentation is somewhat haphazard, and while [some of it](https://github.com/facebookresearch/faiss/wiki/Indexing-1G-vectors) shows this working very well, we also see [significantly worse](https://github.com/facebookresearch/faiss/wiki/Vector-codec-benchmarks) performance with product quantization alone on datasets I think are more representative (though they do not seem to list their dataset sizes there). [Recent work](https://arxiv.org/abs/2305.04359) has shown terrible recall performance on similar datasets (TEXT2IMAGE-100M and -1B).

There are better solutions available. [DiskANN](https://proceedings.neurips.cc/paper_files/paper/2019/file/09853c7fb1d3f8ee67a61b6bf4a7f8e6-Paper.pdf) uses an on-disk graph data structure[^5] and has significantly better recall/QPS curves. It doesn't have Rust bindings, but apparently it has an entire Rust port. Said port was apparently never finished, only builds on Windows, looks overcomplicated and seems to make some strange decisions, so I don't trust it. I considered trying to work out how to bind the DiskANN *C++* code to Rust instead and ignoring its quirks, but I don't like C++ and it makes other strange design decisions[^11]. The algorithm did not look that hard, so I decided to implement it myself, which would also allow me to reduce latency by changing the on-disk data format to store results' URLs and metadata along with their vectors and graph neighbours. It was, however, hard, especially on my CPU compute budget[^15]. There were many confusing problems[^8], smallish indices on my test data turned out bad at first, and I misunderstood the importance of product quantization and did not implement it initially. There were then some very confusing bugs which I was, after far too much work, able to track down to forgetting a `+ i as u32` and not maintaining an invariant correctly in an internal buffer. I ran the scraper for significantly longer while fixing everything, so you get nicer results out of it, at least.

Benchmarking on a small dataset showed that the product quantization was a significant limit on OOD query performance (and ID performance, but this starts from a much higher point and seems to vary less). DiskANN's algorithm can compensate for this with more disk reads - since it retrieves full-precision vectors as it traverses the graph, it asymptotically approaches perfect recall - but disk reads are costly. I adopted a slight variant of [OOD-DiskANN](https://arxiv.org/abs/2211.12850)'s AOPQ algorithm, which adjusts quantization to adapt to the distribution of queries. I investigated [RaBitQ](https://github.com/gaoj0017/RaBitQ) briefly due to its better claims, but it did not seem good in practice, and the basic idea was considered and rejected by [some other papers](https://arxiv.org/abs/1806.03198) anyway. In principle, there are much more efficient ways to pack vectors into short codes - including, rather recently, some work on [using a neural network to produce an implicit codebook](https://arxiv.org/abs/2501.03078) - but the ~1μs/PQ comparison time budget at query time makes almost all of them impractical even with GPU offload[^14]. The one thing which can work is *additive* quantization, which is as cheap at query time as product quantization but much slower at indexing time. The slowdown is enough that it's not practical for DiskANN, unless GPU acceleration is used. Most additive quantizers rely on beam search, which parallelizes poorly, but [LSQ++](https://openaccess.thecvf.com/content_ECCV_2018/papers/Julieta_Martinez_LSQ_lower_runtime_ECCV_2018_paper.pdf) should be practical. This may be integrated later.

An interesting problem I also hadn't considered beforehand was sharding: DiskANN handles larger-than-memory datasets by clustering them using k-means or a similar algorithm, processing each shard separately and stitching the resulting graphs together. K-means itself, however, doesn't produce balanced clusters, which is important since it's necessary to bound the maximum cluster size to fit it in RAM. I fixed this in a moderately cursed way by using [simulated annealing](https://github.com/osmarks/meme-search-engine/blob/master/kmeans.py) to generate approximately-right clustering centroids on a subset of the data and adding a fudge factor at full dataset shard time to balance better than that. I tried several other things which did not work.

Full graph assembly took slightly over six days with 42 shards with about 13 million vectors each (each vector is spilled to two shards so that the shards are connected, and there are more vectors in the index than are shown in results because I did some filtering too late). There were some auxiliary processes like splitting and merging them and running the rating models and quantizers, but these were much quicker.

### Off-the-shelf vector databases

I am sufficiently annoyed by these that they get their own subsection. There is a large amount of off-the-shelf software which is *supposed* to do exactly what I need - store vectors and metadata and provide fast, efficient search. It doesn't work.

An acquaintance more into distributed systems reviewed all of them slightly over a year ago and says that, at the time, they all implemented sharding wrong. In standard databases, each key should be assigned to a single shard (or a subset of shards for replication etc) using something like a hash on keys, so that when a query comes in it only has to go to one server. Except for [Pinecone now](https://www.pinecone.io/blog/serverless-architecture/), every vector database sends writes to a random shard (by hash) and merges reads from every shard, which scales poorly. The alternative is to partition by vectors, but almost nobody does this.

They also generally claim to offer nonvector filtering and search, as you might expect from a normal relational database - "give me only records from this user" or "show me things added in the last week". This is an algorithmically hard problem, though, to which nobody currently has a satisfying answer - you can make [intrusive changes](https://harsha-simhadri.org/pubs/Filtered-DiskANN23.pdf) to the vector index structures to make some queries efficient, have separate index shards for each value of the metadata, or read out vector top-k results then filter them after the fact. These all have different, complex tradeoffs which the end user ought to consider, but commercial vector databases barely talk about them and as far as I know generally do it in the naive way (after-the-fact filtering) or assume there's only one value you want to partition by (e.g. user). I suspect that if you mix separate users' data in most vector databases you become vulnerable to timing side-channel attacks, but it would be hard to do anything useful with this.

We also see questionable computer-architectural choices. Several databases rely on a graph index optimized for RAM, and then page it in from disk piece-by-piece, leading to significant slowdowns, and some of the (rather poorly priced) commercial options are even "serverless", i.e. "let's load our large, latency-sensitive indices from remote object storage".

Finally, despite the issues I mentioned with crossmodal search, this is usually mentioned as a first-class feature with no reference to these extra challenges, nor any adaptations (which I can see anywhere) to solve them.

I think there is something like a good reason for this. Software is, implicitly or otherwise, built for what it is used for[^12]. Given the current desire for [dubiously useful chatbots](/nochatbots/) with <span class="hoverdefn" title="retrieval augmented generation">RAG</span>, most applications are likely either dubiously useful chatbots - which don't have heavy QPS loads, and which can tolerate high latency since the LLM is slower - or tools which want to offer semantic search for each user's small dataset, in which case paging in that user's index on demand is a reasonable decision. The basic research for the underlying vector indices is almost all out of big tech (I've primarily been building on Microsoft Research work[^13]) or universities, whereas the people shipping vector database products are more product- and systems-engineering-focused and usually treat them as black boxes.

If you, reader, find yourself needing a vector database, I think you are best served with either the naive Numpy solution (for small in-process datasets), FAISS (for bigger in-process datasets), or [PGVector](https://github.com/pgvector/pgvector) (for general-purpose applications which happen to need embeddings). Beyond the scales these support, you will have to go into the weeds yourself.

## Improving results

The index was generated from a filtered and deduplicated version of the dump - the embeddings are very amenable to useful classification, so I discarded anything which looked like a standard "this image has been deleted" image from various sites (I eventually put this into the scraper itself) and did additional NSFW filtering. Deduplicating without an index already built was quite tricky since the image encoder is nondeterministic[^7], so I went for hashing quantized vectors and URLs, though this likely missed things. Sadly, by [Sturgeon's law](https://en.wikipedia.org/wiki/Sturgeon's_law), most things are bad so this might not produce good search results. Despite the plaintive cries of "subjectivity" almost every time I mention this, I retooled [MemeThresher](https://osmarks.net/memethresher/)'s goodness classifier and retrained it, and attached quality scores to every item in the dataset, which are used in reranking. Rather than a single quality score it now predicts "meme", "aesthetic" and "useful" scores. I redid the process once with more granular options (strong/weak/no preference) in an attempt to fix an issue which turned out to be due to a trivial bug somewhere else.

::: captioned src=/assets/images/data_label_frontend.png
I have to make such hard decisions.
:::

This all required more time in the data labelling mines and slightly different active learning algorithms. I [previously made](https://osmarks.net/memethresher/#improving-the-model) a few suggestions for this, but:

* I don't know how to regularize a bigger model better, and I have harder runtime constraints now, so I've not done that. In fact, I turned off all the regularization since it would overfit horribly anyway and it was in some sense cleaner to do early stopping.
* Hyperparameter sweeps would still have been annoying and it was much quicker to wildly guess.
* To the best of my knowledge, there's still no model better than SigLIP (`So400m/14@384` on WebLI) available, and space constraints meant I had to use the regular image embeddings still.
* I still think directly predicting winrates with a single model might be a good idea, but it would have been annoying to do, since I'd still have to train the score model, and I think most of the loss of information occurs elsewhere (rounding off preferences).
* Picking pairs with predicted winrate 0.5 would also pick mostly boring pairs the model is confident in. The variance of predictions across the ensemble is more meta-uncertainty, which I think is more relevant. I did add some code to have me rate the high-rated samples, though, since I worried that the unfiltered internet data was broadly too bad to make the model learn the high end.

It turns out that SigLIP is tasteful enough on its own that I don't need to do that much given a fairly specific query, and the classifier is not that useful - the bitter lesson in action.

I previously worked on [SAEs](/memesae/) to improve querying, but this seems to be unnecessary with everything else in place. Training of a bigger one is ongoing for general interest.

As ever, logs and data are available from the [datasets server](https://datasets.osmarks.net/projects-formerly-codenamed-radius-tyrian-phase-ii/).

## Notes

::: captioned src=/assets/images/meme-search-business-plan.png
The meme search master plan.
:::

* I should have done more deduplication earlier in the pipeline to avoid wasting computing time.
* The runtime of index-building is dominated by computing dot products. I messed around for two days with integer quantization but had substantial accuracy problems, then looked more carefully at the dot product code I was [depending on](https://github.com/ashvardanian/SimSIMD/blob/7c87779d4c10dae46faf41b296f1786fa378f348/include/simsimd/dot.h#L1025) and beat it by a factor of three (in microbenchmarking, ~60ns down from ~180ns in 1152D) in twenty minutes using [highly advanced techniques](https://github.com/osmarks/meme-search-engine/blob/ee23b8144405c5af44e4302a468e0caa4d64e37f/diskann/src/vector.rs#L257) like "unrolling the loop at all", "using multiple accumulators" and "assuming vectors have lengths which are multiples of 32". There's probably a lesson here. I don't know what it is.
* I don't have enough cores that the [ParlayANN](https://arxiv.org/abs/2305.04359) algorithms were necessary, but it provided useful information about search quality on various datasets and the code is nicer than the main DiskANN library.
* [Nearest Neighbour Normalization](https://arxiv.org/abs/2410.24114) may have been helpful here, but for various reasons implementation would have been difficult. It may be implemented "later".
* [DiskANN++](https://arxiv.org/abs/2310.00402) has some relevant performance improvements. I adopt entry vertex selection, if mostly because it is structurally easier. This and some other works also propose algorithms for reordering the graph to improve performance: I didn't use them because my vectors are long enough that I can only fit one node per disk sector anyway.
* Much of the difficulty of this project came from running on underpowered hardware. With a mere* terabyte or so of RAM, indexing with off-the-shelf tools would have been a non-issue, and the streaming embedding generation could have been replaced with normal disks, [img2dataset](https://github.com/rom1504/img2dataset) and faster high-end GPUs. Many people have access to this and the idea has been possible since at least 2023 (the original CLIP was perhaps not good enough). However, nothing like this is, to my knowledge, currently available anywhere else - Google and Bing have bad image search, Yandex (for *some* reason) is slightly better and the big [clip-retrieval](https://github.com/rom1504/clip-retrieval) deployments are dead. We can thus conclude that the [EMH](https://en.wikipedia.org/wiki/Efficient-market_hypothesis) isn't real.
* The system allows you to search partly by the classifier scores (and time), which is done by adjusting graph traversal, though not the index, by adding extra components to the query/base dot products.
* The frontend now also has some extra telemetry so I can hopefully train better recommendation systems later.
* As the dataset is quite big (~600GB compressed), I won't be able to offer on-demand downloads. Please contact me if you want any of this data. I can also run specialized queries against it for you without you having to download all of it.
* Some parts of the algorithm (asymmetric PQ dot products, apparently) are bizarrely sensitive to numerics, which I discovered while making some innocuous changes to where things got converted to integers. Keep this in mind if you need to use part of this for anything.
* Data labelling makes me much more misanthropic. So much of the randomly sampled content used to bootstrap rating is inane advertising, extremely poorly photographed images of games on computer screens or nonsense political memes.
* There is currently no provision for updating the index. It [should be possible](https://arxiv.org/abs/2105.09613) - the algorithms are not terribly complex but there are some slightly tricky engineering considerations.
* I don't actually know how good the recall is because computing ground truth results is very expensive. Oh well.
* The build-time deduplication is still insufficient, so I added a hacky step to do it at query time. I may do another pass and rebuild to fix this.

[^1]: Yes, I know we count supercomputer power in FP64 and consumer hardware mostly won't do double-precision. I am ignoring that for the purposes of art.

[^2]: It has an AMD Ryzen 5 5500, 64GB of slow RAM and a Nvidia RTX 3090.

[^3]: For non-Redditors, this is the merged content of all subreddits.

[^4]: It might also be legally fraught to, in any case.

[^5]: This seems weird since random reads are quite expensive, even with SSDs, but the graph-based algorithm is good enough that it works out. Optane would do better if Intel still sold it and/or I could afford it.

[^6]: I did not, technically, process *all* of them. Some of them are in formats my code can't process, some (so, so many) are dead links now, some are above the arbitrary filesize limit of 16MiB I imposed, some of them weren't directly linked to, and a few (not more than a thousand, I believe) were skipped due to lazy restart-on-failure code which uses the last timestamp as a cutoff even though the output is not fully linearized.

[^7]: Mathematically, it shouldn't be, of course, but performance on consumer Nvidia hardware brings numerical instability and CUDA determinism has a ~10% performance hit.

[^8]: I kept accidentally introducing complicated bugs which partly cancelled each other out.

[^9]: You may be wondering why I didn't just do what the old [LAION search index](https://rom1504.medium.com/semantic-search-at-billions-scale-95f21695689a) did: it is down so I can't easily test this but it likely compromised lots on recall. Private discussions with rom1504 confirm this.

[^10]: In principle, you can bootstrap using progressively larger subsets, but this would be annoying and slow.

[^11]: Also, it only supports FP32 vectors, which would have doubled my storage requirements.

[^12]: See also how PyTorch [apparently](https://semianalysis.com/2024/12/22/mi300x-vs-h100-vs-h200-benchmark-part-1-training/#amds-user-experience-is-suboptimal-and-the-mi300x-is-not-usable-out-of-the-box) has many bugs with AMD hardware on codepaths Meta doesn't hit internally.

[^13]: One has to wonder why Microsoft Research did so much work to fit big vector indices on small computers. Surely they have many computers over there. Facebook and Google's public output tends to assume you have infinite RAM.

[^14]: Also, most work doesn't seem interested in testing performance in the ~64B code size regime even though the winning method varies significantly by size.

[^15]: Could it be (usefully) run on GPU instead? I don't *think* so, at least without major tweaks. You'd have less VRAM, so you'd need smaller graph shards, and the algorithm is quite branchy and does many random reads.
