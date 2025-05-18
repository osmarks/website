---
title: Deep learning accelerator architecture
description: "Or: why most AI hardware startups are lying."
slug: accel
created: 06/10/2024
katex: true
tags: ["hardware", "ai"]
---
::: epigraph attribution=Chlorokin
Except in the domain of making near-omnipotent computer entities, I project very little progress in the next 50 years.
:::

In this article, I will explain the basic structure of the computations involved in deep learning, how specialized hardware can be used to accelerate them, and what the main constraints on this hardware are. Some familiarity with computer architecture and basic mathematics is assumed. Some of this is also addressed in my article on [ML workstation builds](/mlrig/), but I will go into more depth regarding the underlying hardware implementations here.

## Deep learning

The main computations involved in deep learning (I am ignoring all other AI as irrelevant, and various "matmul-free" methods as mostly unready and unused in industry) are matrix multiplications - the forward pass (inference) and backward pass (generating gradients for training) are mostly - by total FLOP (floating point operation) count - just large multiplications of (relatively fixed) weight matrices by (variable) inputs or activations. Inference and training are a series of these multiplications interspersed with other operations - things like softmax, which includes a sum over a whole vector, and activation functions like $\mathrm{ReLU}(x) = \max(x, 0)$, which work on scalar values individually. Convolutions are common in older architectures, but can be reduced to matrix multiplication. The backward pass uses the same weights as the forward pass, but in reverse order. Most of today's large models are transformers, which use an "attention" mechanism which is more or less an oddly structured, data-dependent matrix multiplication.

Unlike most other workloads, there is almost no data-dependent control flow - Mixture of Experts models select different subsets of the weights in a data-dependent way, and many sequence models can take variable amounts of input tokens, but this is still much more static than in general-purpose CPU or GPU code, so it's much more practical to apply heavyweight ahead-of-time compilation. As I will describe later, the practicality of many hardware products depends on this.

Matrix multiplication uses $O(n^3)$ operations (wrt. matrix size)[^1], primarily [fused multiply-adds](https://en.wikipedia.org/wiki/Multiply%E2%80%93accumulate_operation). They contain $n^2$ elements, all of which must be read at least once to perform the multiplication, so in principle, as matrices get arbitrarily large, computation time is dominated by performing these fused multiply-adds rather than reading the matrices from memory. In practice, however, matrices cannot be arbitrarily big and memory IO is significant, and so the great challenge of AI hardware is to keep the compute units doing the arithmetic fed with data from memory. For example, Nvidia's latest H100 SXM5 GPUs can do 989TFLOPS (trillion FLOPs per second, 16-bit in this case) and read 3.35TB/s from main memory[^3], meaning that for every byte read from memory, the GPU must do $\frac{989e12}{3.35e12} = 295$ FLOPs of work at the same time to maintain full utilization. This is known as the "arithmetic intensity" necesssary to saturate it.

It is, of course, not really possible to do 300 useful operations on a single byte without interacting with anything else, so the GPU has registers, shared memory and caches with much higher bandwidth and lower latency than main memory - this allows keeping chunks of the input matrices closer to compute units and performing tiled matrix multiplications using those chunks[^5]. There's also dedicated hardware for asynchronously fetching data from memory without ever tying up compute generating memory addresses. Even with all this, H100 GPUs can usually only manage ~70% of their quoted FLOPS performing a matrix multiplication, and large-scale training runs only manage ~40%[^4].

The worse utilization on real training runs is partly because of individual weight matrices and inputs not filling the GPU, and partly because of the aforementioned scalar/vector operations: naively, doing $\mathrm{ReLU}$ to a vector would waste the vast majority of FLOPS, because each value would be fetched, trivially operated on, and then written back, though kernel fusion (applying it before writing to memory during a matmul) mitigates this. There are also significant slowdowns introduced by multi-GPU operations. I don't know exactly what causes this, since communications and computation can mostly be overlapped in larger models, but one part is that all GPUs are forced to wait for all others at various points, and there is significant variance in performance between GPUs[^6]. Also, network communications tie up memory bandwidth and power budget.

### DLRMs

While "generative AI" now comprises the majority of interest in AI, a large fraction of total compute is still spent on boring but critical work like the [Deep Learning Recommender Models](https://ai.meta.com/blog/dlrm-an-advanced-open-source-deep-learning-recommendation-model/) which now control modern culture by determining what social media users see. These use extremely large lookup tables for sparse features and very little arithmetic, making them much more memory bandwidth- and capacity-bound. I won't talk about them further because there are already solutions for this implemented by Google and Meta in TPUs and [MTIA](https://ai.meta.com/blog/meta-training-inference-accelerator-AI-MTIA/), and no startups seem particularly interested.

## Hardware design

But what, exactly, are the constraints on hardware driving these limits? I'm not an electrical engineer or chip designer, but much of this is public and relatively easy to understand, and some vendors provide helpful information in whitepapers.

Excluding a few specialized and esoteric products like [Lightmatter](https://web.archive.org/web/20240909133702/https://en.wikipedia.org/wiki/Lightmatter) and [Mythic](https://mythic.ai/)'s, AI accelerators are built on modern digital logic semiconductor processes. They contain at least one logic die - it can be more than one thanks to modern advanced packaging like Intel Foveros and TSMC CoWoS - with some mix of analog circuitry for IO, SRAM (static random access memory) for fast on-chip memory, and logic gates for the control and computation. The main limit on the complexity of the GPU is die area: each transistor in a logic circuit or IO interface or memory array consumes some area, and the cost increases somewhat superlinearly with die area. This is because die are made on a fixed-size wafer which is then cut up ("singulated"), bigger die have a higher total number of random defects ("worse yields") and so need to be discarded more often, and there's a maximum size (the "reticle limit"), above which it's necessary to combine several with expensive advanced packaging.

Better manufacturing processes make transistors smaller, faster and lower-power, with the downside that a full wafer costs more. Importantly, though, not everything scales down the same - recently, SRAM has almost entirely stopped getting smaller[^7], and analog has not scaled well for some time. Only logic is still shrinking fast.

It's only possible to fit about 2GB of SRAM onto a die, even if you are using all the die area and the maximum single-die size. Obviously, modern models are larger than this, and it wouldn't be economical to do this anyway. The solution used by most accelerators is to use external DRAM (dynamic random access memory). This is much cheaper and more capacious, at the cost of worse bandwidth and greater power consumption. Generally this will be HBM (high-bandwidth memory, which is more expensive and integrated more closely with the logic via advanced packaging), or some GDDR/LPDDR variant.

Another major constraint is power use, which directly contributes to running costs and cooling system complexity. Transistors being present and powered consumes power (static/leakage power) and transistors switching on and off consumes power (dynamic/switching power). The latter scales superlinearly with clock frequency, which is inconvenient, since performance scales slightly sublinearly with clock frequency. A handy Google paper[^8] (extending work from 2014[^9]), worth reading in its own right, provides rough energy estimates per operation, though without much detail about e.g. clock frequency:

| Operation | | Picojoules per Operation |||
|-----------|---|-------------|-------|-------|
| | | **45 nm** (~2007) | **7 nm** (~2018) | **45 / 7** |
| + | Int 8 | 0.03 | 0.007 | 4.3 |
| | Int 32 | 0.1 | 0.03 | 3.3 |
| | BFloat 16 | -- | 0.11 | -- |
| | IEEE FP 16 | 0.4 | 0.16 | 2.5 |
| | IEEE FP 32 | 0.9 | 0.38 | 2.4 |
| × | Int 8 | 0.2 | 0.07 | 2.9 |
| | Int 32 | 3.1 | 1.48 | 2.1 |
| | BFloat 16 | -- | 0.21 | -- |
| | IEEE FP 16 | 1.1 | 0.34 | 3.2 |
| | IEEE FP 32 | 3.7 | 1.31 | 2.8 |
| SRAM (64b access) | 8 KB SRAM | 10 | 7.5 | 1.3 |
| | 32 KB SRAM | 20 | 8.5 | 2.4 |
| | 1 MB SRAM | 100 | 14 | 7.1 |
| GeoMean | | -- | -- | 2.6 |
| DRAM (64b access) | | **Circa 45 nm** | **Circa 7 nm** | |
| | DDR3/4 | 1300 | 1300 | 1.0 |
| | HBM2 | -- | 250-450 | -- |
| | GDDR6 | -- | 350-480 | -- |

As a brief sanity check, we can check against the values for the Nvidia A100[^10]. This was manufactured on a TSMC 7nm process, can deliver 312TFLOPS (FP16), has 2.39TB/s of memory bandwidth, and is rated for 400W of power draw. Using `units`, we see that `2.39 TB/s * (250pJ/64 bit) = 74.6875W` and `312 trillion / s * (0.34 pJ + 0.16 pJ) / 2 = 78W` (each two FLOPs taken to be one multiply and one add), which sum to at least the right order of magnitude. This is expected to be an underestimate because A100s are clocked quite aggressively, they are in some circumstances doing more expensive arithmetic as part of an "FP16" matmul, and large costs are incurred by control logic and moving data around on the chip. An NVIDIA presentation on "Hardware for Deep Learning"[^11] breaks down power use in a power-optimized test chip - apparently, roughly half is spent on arithmetic - and quotes overhead per instruction (though I don't know exactly how they define this) as around 20% with their recent GPUs.

## Classes of accelerator

I am in some sense trivializing years of hard work by thousands of hardware engineers by doing this coarse categorization, but I think there are three primary classes of AI accelerator being built.

### GPU-likes

GPUs are among the older dedicated parallel processors, and Intel, AMD and Nvidia have built their flagship AI accelerators by extending GPUs with dedicated hardware which does small matrix multiplications and related operations. They have a small amount (~100) of "shader modules", "execution units" or "compute units" on die, with a matrix unit, vector units, control and memory. GPUs inherit lots of work intended to make them easy to program, have a small amount (~50MB) of onboard SRAM (partly explicitly software-managed and partly hardware-managed caches) and a large pool of attached DRAM, and rely somewhat less on complex compiler stacks to run fast. The main downsides I can see are that resources are spent on things which aren't AI-specific (e.g. FP64 arithmetic for HPC/simulation workloads) and that GPUs do not have the same degree of systems-level integration and design for AI as some other accelerators.

### TPU-likes

I've named this category after Google TPUs, which are in my opinion the best-designed hardware. However, you can't buy them and they wouldn't work outside of a Google datacentre anyway. Rather than a large quantity of smaller units as in GPUs, TPU-likes have a smaller quantity of big matrix units, reducing control/data movement overhead, and drop any feature not relevant to AI. The programming models are generally hard for humans to work with, so the hardware is designed for compilers to target or for a small number of carefully optimized kernels. Rather than hardware-managed caches, which guess which data will be used later and store it locally, TPU-likes require software to explicitly manage scratchpad memory, increasing efficiency.

Often these also come with onboard networking - to some extent modern GPUs also do, but TPU-likes' networking is usually designed to scale to more nodes and require less external switching equipment, theoretically reducing costs. Nvidia GPUs have onboard "NVLink" for smaller (presently, I don't think they go above 72 GPUs per NVLink group) clusters and use external switched InfiniBand/Ethernet beyond that; Google TPUs directly connect to each other over Ethernet in clusters of up to 4096 devices (for TPUv4), and Intel's Gaudi 3 (from their acquisition of Habana) also [directly does Ethernet](https://www.anandtech.com/show/21342/intel-introduces-gaudi-3-accelerator-going-bigger-and-aiming-higher).

The smaller lower-power "NPUs" in many consumer devices are often built along similar lines, though without external networking. For example, Intel's [Movidius NPUs](https://chipsandcheese.com/2024/04/22/intel-meteor-lakes-npu/), shipped in some "AI PCs", and Qualcomm's [Hexagon](https://chipsandcheese.com/2023/10/04/qualcomms-hexagon-dsp-and-now-npu/), fall under this category, though Qualcomm's is designed for non-AI DSP (digital signal processing) workloads as well.

A danger of these architectures is that they're easy to overfit to specific models: older accelerator hardware was often made to run convolutional neural nets, widely used for image processing, and now works poorly for transformers.

### SRAM machines

DRAM is costly, slow and power-hungry, so why don't we get rid of it? Many startups have tried this or similar things, by making big die with many small cores with attached SRAM and arithmetic units. This eliminates the power cost and bottlenecks of DRAM[^13], meaning code can run much faster... as long as its data fits into the <1GB of SRAM available on each accelerator. In the past, this would often have been sufficient; now, scaling has eaten the world, and LLMs run into the terabytes at the highest end and ~10GB at the lower.

A good example of this is Graphcore "IPUs" (intelligence processing units). They're very good at convolutions[^12] but achieve low utilization on large matrix multiplications, though the high memory bandwidth makes them better at small batches than a GPU would be. It's not clear to me exactly what their design intention was, since their architecture's main advantage is fine-grained local control, which standard neural nets did not need at the time and require even less now. It may be intended for "graph neural networks", which are used in some fields where inputs have more structure than text, or sparse training, where speed benefits are derived from skipping zeroed weights or activations. Like GPUs, this flexibility does also make them useful for non-AI tasks.

[Groq](https://groq.com/) has done somewhat better recently; I don't know what they intended either, but they also use many small slices of matrix units and SRAM. They are more focused on splitting models across several chips, rely on deterministic scheduling and precompilation, and became widely known for running big LLMs at multiple hundreds of tokens per second, an order of magnitude faster than most other deployments. However, they need [hundreds of chips](https://www.semianalysis.com/p/groq-inference-tokenomics-speed-but) for this due to memory capacity limits, and it's not clear that this responsiveness improvement justifies the cost.

Tesla have their internal [Dojo](https://chipsandcheese.com/2022/09/01/hot-chips-34-teslas-dojo-microarchitecture/) design, which I believe was designed to train small models to run on their cars. It does have HBM attached, but only to the edge of a "tile" consisting of 25 Dojo die - the fast interconnect between many of them compensates for the lack of memory capacity. [Cerebras](https://cerebras.ai/) has brute-forced the issue by shipping [an entire wafer](https://spectrum.ieee.org/cerebras-chip-cs3) with 900000 "cores" and 44GB of SRAM on it and are offering fast inference similar to Groq's, as well as training without (some of) the hassle of distributed systems engineering. 44GB is still not enough for modern models, though, so they have to combine many Wafer-Scale Engines or use [external memory pools](https://cerebras.ai/blog/announcing-the-cerebras-architecture-for-extreme-scale-ai/), and at that point the advantage over GPUs is not obvious.

Finally, [Tenstorrent](https://tenstorrent.com/) - their architecture doesn't fit cleanly into any of these categories, but I think it's closest to this. They have some external DRAM, but with less bandwidth and capacity than datacentre GPUs, and suggest scaling up to more accelerators if this is insufficient. Also, their control system is built on many small cores rather than the fewer large ones in  TPU-likes.

## Conclusion

The design space of AI accelerators built on digital logic - for mainstream workloads - is fairly tightly bounded by the practical limits of manufacturing and the current algorithms used for AI. The exciting headline figures quoted by many startups belie problematic tradeoffs, and doing much better without a radical physical overhaul is not possible. The most egregious instance of this I've seen, which caused me to write this, is [Etched](https://www.etched.com/announcing-etched), who claim that by "burning the transformer architecture into [their] chip" they can achieve orders-of-magnitude gains over Nvidia GPUs. I don't think this is at all feasible: transformer inference is limited by memory bandwidth (sometimes) and total compute (more so) for performing large matmuls, not lack of specialization. Future hardware gains will come from the slow grind of slightly better process technology and designs - or potentially a large algorithmic change which makes specialization more gainful. Part of transformers' advantage was running with more parallelism on existing GPUs, but there is enough money in the field for strong hardware/software/algorithmic codesign. I don't know what form this will take.

[^1]: Technically, some algorithms can do better asymptotically, but these are not widely used because they only work at unreachably large scales, are numerically unstable, or complicate control flow.

[^3]: See [the whitepaper](https://resources.nvidia.com/en-us-tensor-core/gtc22-whitepaper-hopper), page 39.

[^4]: [https://ai.meta.com/research/publications/the-llama-3-herd-of-models/](https://ai.meta.com/research/publications/the-llama-3-herd-of-models/) page 10.

[^5]: You can read more about this [here](https://siboehm.com/articles/22/CUDA-MMM). It doesn't deal with modern features like [TMA](https://docs.nvidia.com/cuda/hopper-tuning-guide/index.html#tensor-memory-accelerator) or tensor cores.

[^6]: Nvidia GPUs will run as hard as possible until they hit power limits, and manufacturing variance, as well as different temperatures and such, mean that this corresponds to different performance levels. I believe this is also true of other manufacturers.

[^7]: [https://fuse.wikichip.org/news/7343/iedm-2022-did-we-just-witness-the-death-of-sram/](https://fuse.wikichip.org/news/7343/iedm-2022-did-we-just-witness-the-death-of-sram/)

[^8]: [Ten Lessons From Three Generations Shaped Google’s TPUv4i](/assets/misc/2021-jouppi.pdf#page=3), hosted locally to avoid paywalls.

[^9]: [Computing’s Energy Problem (and what we can do about it)](/assets/misc/2014-horowitz.pdf), also rehosted, as well as the [presentation](/assets/misc/2014-horowitz-2.pdf).

[^10]: [See the "datasheet".](https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-nvidia-us-2188504-web.pdf).

[^11]: [Power consumption of a test chip](https://www.youtube.com/watch?v=rsxCZAE8QNA&t=1067) and [instruction overhead](https://www.youtube.com/watch?v=rsxCZAE8QNA&t=646).

[^12]: [https://arxiv.org/abs/1912.03413](https://arxiv.org/abs/1912.03413) page 76.

[^13]: Also possibly supply shortages. HBM is [pretty scarce](https://www.reuters.com/technology/nvidia-supplier-sk-hynix-says-hbm-chips-almost-sold-out-2025-2024-05-02/) right now, and it may prove impossible to ramp fast enough if AI hardware demand consumes an increasing proportion of logic fab output.
