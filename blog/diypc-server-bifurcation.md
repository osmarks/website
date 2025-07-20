---
title: DIYPC and server bifurcation
description: The many technologies modern servers have which your desktop doesn't.
slug: diypc
created: 27/05/2025
tags: ["hardware", "opinion"]
---
::: epigraph attribution="James Mickens" link=https://scholar.harvard.edu/files/mickens/files/theslowwinter.pdf
Indeed, who wouldn’t want an octavo-core machine with 73 virtual hyper-threads per physical processor? [...] John’s massive parallelism strategy assumed that lay people use their computers to simulate hurricanes, decode monkey genomes, and otherwise multiply vast, unfathomably dimensioned matrices in a desperate attempt to unlock eigenvectors whose desolate grandeur could only be imagined by Edgar Allen Poe.
:::

For much of computing history, "client" and "server" computers were quite different. Mainframes had their dumb terminals, and even once microcomputers took over, the proliferation of standards led to some architectures being positioned for servers and high-end workstations and others for personal computers. In the 2000s, returns on scale and dominance in personal computers led to [x86](https://en.wikipedia.org/wiki/X86) winning in servers. For a brief, glorious, approximately-10-year period, ending roughly in 2015 when Intel's 10nm stumbles[^1] broke their roadmaps, mainstream servers and personal computers were essentially the same except for some segmentation on core count, IO, manageability and reliability features like ECC memory. With the end of cheap transistor scaling[^2], "hyperscaler" companies like Google and Facebook seeking cost optimizations and increasing compute demands, both commodity and specialized servers are now very different.

## Efficient end-to-end power delivery

Most commodity servers, and desktop systems based on [ATX](https://en.wikipedia.org/wiki/ATX), contain a power supply which takes 110V/230V AC power from the "wall" and produces 12V/5V/3.3V DC outputs. This is only for historical reasons: changes in the voltage requirements of modern electronics mean that the vast majority of power draw is on 12V, and goes to <span class="hoverdefn" title="voltage regulator modules">VRMs</span> which reduce voltages to around 1V to supply the digital logic in CPUs and GPUs. There is [a standard](https://gamersnexus.net/guides/3568-intel-atx-12vo-spec-explained-what-manufacturers-think) simplifying and improving the efficiency of desktop PSUs by switching to 12V only, but inertia means this has not been widely adopted.

When you're buying hundreds of thousands of servers at once, it is easier to change things. Open Compute Project (a project standardizing hyperscaler-friendly server infrastructure) [racks](https://www.opencompute.org/wiki/Open_Rack/SpecsAndDesigns) replace power distribution with rack-level "power shelves" which convert AC to 12V/48V DC centrally and distribute it via a busbar. According to [OCP documentation](https://files.opencompute.org/oc/public.php?service=files&t=cf80ec91104554a01b3227983f33a89c&download), 48V conversion is more efficient than 12V by several percentage points - important at scale - and distribution of course has lower resistive losses[^11]. 48V was probably chosen since it is nearly the standard limit of "safe" low voltage and for consistency with -48V telecoms equipment. This also provides reliability improvements (more redundancy for the power supplies) and easier battery backups.

::: captioned src=/assets/images/molex-orv3.jpg
An Open Rack V3 busbar, via [Molex](https://www.molex.com/en-us/industries-applications/servers-storage/open-compute-project/ocp-rack-and-power-orv3).
:::

## Cabled PCIe

The PCIe interconnect used for almost every high-speed link inside a modern computer (excepting RAM, cross-socket interconnect and inter-GPU connectivity) has [roughly doubled in throughput](https://en.wikipedia.org/wiki/PCI_Express#History_and_revisions) every generation to keep up with demand. It's done this by using more complicated (less noise-resistant) modulation and increasing bandwidth, both of which lead to suffering for electrical engineers tasked with routing the signals. PCIe signals used to be run cheaply over [PCBs](https://en.wikipedia.org/wiki/Printed_circuit_board) on mainboards, in riser cards and for drive backplanes, but now they frequently need concerning quantities of expensive retimer chips or the cables now standardized as, for some reason, [CopprLink](https://pcisig.com/blog/pcie%C2%AE-cabling-%E2%80%93-journey-copprlink%E2%84%A2).

::: captioned src=/assets/images/GENOAD8X-2TBCM.jpg
The [ASRock Rack GENOAD8X-2T/BCM](https://www.asrockrack.com/general/productdetail.asp?Model=GENOAD8X-2T/BCM) motherboard, with several retimer chips (yellow) and MCIO connectors (green).
:::

Relatedly, power and interconnectivity difficulties with PCIe cards have led to the [OAM](https://146a55aca6f00848c565-a7635525d40ac1c70300198708936b4e.ssl.cf1.rackcdn.com/images/fbb4a175925d7b085634f772f89584006f81f01f.pdf) standard[^7], which puts GPUs or GPU-likes onto separate "baseboards" with 48V power inputs and built-in cross-accelerator connections. These are cabled to the rest of the system. I think something like this is sorely necessary in DIY computers, where GPUs fit the PCIe card form factor badly for almost exactly the same reasons, but nobody has been able to coordinate the change.

## Fast networking

Consumers have mostly been stuck with [Gigabit Ethernet](https://en.wikipedia.org/wiki/Gigabit_Ethernet) for decades[^3]. 10 Gigabit Ethernet was available soon afterward but lacks consumer adoption: I think this is because of a combination of expensive and power-hungry initial products, more stringent cabling requirements, and lack of demand (because internet connections were slow and LANs became less important). A decade later, the more modest 2.5GbE and 5GbE standards were released, designed for cheaper implementations and cables[^4]. These have eventually been used in desktop motherboards and higher-end consumer networking equipment[^5].

Servers, being in environments where fast core networks and backhaul are more easily available and having more use for high throughput, moved rapidly to 10, 40, 100(/25)[^6], 200, 400 and 800Gbps, with 1.6Tbps Ethernet now being standardized. The highest speeds are mostly for AI and specialized network applications, since most code is bad and is limited by some combination of CPU time and external API latency. Optimized code which does not do much work can handle [millions of HTTP requests a second](https://www.techempower.com/benchmarks/#section=data-r23&test=json) on [28 outdated cores](https://github.com/TechEmpower/FrameworkBenchmarks/wiki/Project-Information-Environment), and with kernel bypass and hardware-offloaded cryptography [DPDK](https://www.dpdk.org/) can push 100 million: most software is not like that, and has to do more work per byte sent/received.

Energy per bit transferred is scaling down slower than data rates are scaling up, so high-performance switches are having to move to [co-packaged optics](https://www.servethehome.com/hands-on-with-the-intel-co-packaged-optics-and-silicon-photonics-switch/) and similar technologies.

## Expanded hardware acceleration

Many common workloads - compression, cryptographic key exchanges and now matrix multiplication - can run much faster and more cheaply on dedicated hardware than general-purpose CPU cores. Many years ago, Intel released [QAT](https://www.servethehome.com/intel-quickassist-in-ice-lake-servers-what-you-need-to-know/), which initially sped up cryptography in cheap networking appliances using its CPUs - this was expanded and rolled out [inconsistently](https://www.servethehome.com/intel-quickassist-parts-and-cards-by-qat-generation/) since then. As of "Sapphire Rapids", their 2022/23 generation, these were finally [brought](https://www.anandtech.com/show/17596/intel-demos-sapphire-rapids-accelerators-at-innovation-2022) to (most) mainstream server CPUs[^8], along with new capabilities - [DLB](https://www.intel.com/content/www/us/en/developer/articles/technical/proof-points-of-dynamic-load-balancer-dlb.html), which provides hardware queue management for networking, and [AMX](https://www.intel.com/content/www/us/en/products/docs/accelerator-engines/what-is-intel-amx.html), which multiplies matrices. By my estimations, recent parts with AMX are performance-competitive with recent consumer GPUs or old datacentre GPUs.

The closest things made available to consumers are in networking, as the most common most accelerateable high-throughput area around. Almost every network card can checksum packets, and assemble and disassemble sequences of them, in hardware, and cheap "routers" rely on [hardware-offloaded](https://forum.openwrt.org/t/how-to-check-if-hardware-nat-flow-offloading-is-enabled/83239/15) NAT. Servers have gone much further: they now regularly use [DPUs](https://www.servethehome.com/dpu-vs-smartnic-sth-nic-continuum-framework-for-discussing-nic-types/), full multicore Linux-based computers on a PCIe card with programmable routing/switching/packet processing hardware in the data path. This was pioneered by cloud providers wanting to move management features off the CPU cores they rent out. Even simpler NICs [can offload](https://www.nvidia.com/content/dam/en-zz/Solutions/networking/ethernet-adapters/connectX-6-dx-datasheet.pdf) stateful firewalling and several remote storage and tunnelling protocols.

## Power density

People complain about the RTX 5090 having 600W of rated power draw and the "inefficiency" of modern client CPUs, but power density in servers has similarly been trending upwards. At the top end, Nvidia is pushing increasingly deranged [600kW racks](https://www.tomshardware.com/pc-components/gpus/nvidia-shows-off-rubin-ultra-with-600-000-watt-kyber-racks-and-infrastructure-coming-in-2027), equivalent to roughly half the power draw of a small legacy datacentre, but we see a rough [exponential trend](https://www.servethehome.com/why-servers-are-using-so-much-power-tdp-growth-over-time-supermicro-vertiv-intel-amd-nvidia/) in mainstream dual-socket CPUs, which now have maximum TDPs you would struggle to run your desktop at[^9]. Desktop chassis are roomy and permit large, quiet cooling systems: most servers are one or two rack units (1.75 inches) tall, so they've historically used terrifying 10k-RPM fans which can use as much as [10% of a server's power budget](https://www.servethehome.com/deep-dive-into-lowering-server-power-consumption-intel-inspur-hpe-dell-emc/). To mitigate this, high-performance systems are moving to liquid cooling. Unlike enthusiast liquid cooling systems, which exist to dump heat from power-dense CPUs into the probably-cool-enough air quickly, datacentres use liquid cooling to manage temperatures at the scale of racks and above, and might have facility-level water cooling.

::: captioned src=/assets/images/supermicro_water_cooling.jpg
A SuperMicro GPU server with direct-to-chip liquid cooling, via [ServeTheHome](https://www.servethehome.com/liquid-cooling-next-gen-servers-getting-hands-on-3-options-supermicro/4/). Unlike consumer liquid cooling, this is designed for serviceability, with special quick-disconnect fittings.
:::

## Disaggregation

Even as individual servers grow more powerful, there is demand for pulling hardware out of them and sharing it between them to optimize utilization. This is an old idea for bulk storage ([storage area networks](https://en.wikipedia.org/wiki/Storage_area_network)), although there are some new ideas like [directly Ethernet-connected SSDs](https://www.servethehome.com/ethernet-ssds-hands-on-with-the-kioxia-em6-nvmeof-ssd/). With the increased bandwidth of PCIe and RAM costs making up an increasing fraction of server costs ([about half](https://www.nextplatform.com/2020/04/03/cxl-and-gen-z-iron-out-a-coherent-interconnect-strategy/) for Azure), modern servers now have the [CXL](https://www.servethehome.com/cxl-is-finally-coming-in-2025-amd-intel-marvell-xconn-inventec-lenovo-asus-kioxia-montage-arm/) protocol for adding extra memory over PCIe (physical-layer) links. This is most important for [cloud providers](https://semianalysis.com/2022/07/07/cxl-enables-microsoft-azure-to-cut/)[^10], who deal with many VMs at once which may not fill the server they are on perfectly, and which need to have all the memory customers are paying for "available" but which may not actively use much of it at a time. This creates inconsistent memory latency, but servers already had to deal with this - even single-socket servers now have multiple [NUMA](https://en.wikipedia.org/wiki/Non-uniform_memory_access) nodes because of use of chiplets.

::: captioned src=/assets/images/cxl_memory_expander.jpg
A CXL memory expander which can use older DDR4 DIMMs, via [ServeTheHome](https://www.servethehome.com/cxl-is-finally-coming-in-2025-amd-intel-marvell-xconn-inventec-lenovo-asus-kioxia-montage-arm/).
:::

## Conclusion

The main consequences of this are:

* Somewhat less ability to transfer learning from personal homelabs to datacentres - it's much easier to run the fanciest datacentre software stacks at home than exotic expensive hardware which only makes sense at large scale.
* Yet more difficulty in getting the highest performance out of computers (through more complex memory topologies, more parallelism and the requirement to use more offloads).
* Increased advantages to consolidation in hosting (through more ability to use disaggregation technology and amortization of fixed costs of using more difficult technologies).

[^1]: This is a long story which is mostly not publicly known, but you can read about some of what happened [here](https://www.eetimes.com/intels-10nm-node-past-present-and-future/) and [here](https://semiwiki.com/forum/threads/intel-10nm-process-problems-my-thoughts-on-this-subject.10535/).

[^2]: Arguably the "end of [Moore's law](https://en.wikipedia.org/wiki/Moore%27s_law)", but Moore's law is about leading-edge density and not costs. As far as I know, cost per transistor has plateaued or worsened recently, and we don't see the same rapid migration of volume to new processes we used to.

[^3]: It was released in 1999, so it's now retro.

[^4]: Because of this timing, 10GbE devices may or may not be able to negotiate down to 2.5GbE or 5GbE. This is often not documented clearly, to provide excitement and chance to users.

[^5]: Adoption in consumer systems seems to track [Realtek](https://www.realtek.com/)'s product lineup, as apparently nobody else is competently trying. We began to see much 5GbE adoption only after the [RTL8126](https://www.cnx-software.com/2024/06/18/realtek-rtl8126-5gbps-ethernet-pcie-and-m-2-adapters/) offered it cheaply. They have a [10GbE product](https://www.techpowerup.com/337113/realtek-to-bring-affordable-10-gbps-ethernet-to-the-masses-later-this-year) now which will perhaps finally drive use.

[^6]: 40Gbps Ethernet is something of a technological dead end: it's four 10Gbps channels bonded together, and soon after it was widely available it became practical to upgrade each channel to 25Gbps for a total of 100Gbps, or use a single 25Gbps channel for a cheaper roughly-as-good link.

[^7]: Nvidia GPUs ship in their own incompatible SXM form factors, of course.

[^8]: Intel management being, presumably, insane, they still market-segment these despite them being one of few advantages they have over AMD.

[^9]: Desktop CPUs are still less efficient in normal operation, though - they clock higher on fewer cores, for cost and single-threaded performance.

[^10]: Though see [this paper](https://conferences.sigcomm.org/hotnets/2023/papers/hotnets23_levis.pdf) arguing against it. I think the ability to reuse older DRAM for less latency-sensitive memory contents is an important application it doesn't consider, however.

[^11]: With some people's fear of "melting" [12VHPWR](https://en.wikipedia.org/wiki/12VHPWR) connectors, this could be a major selling point if 48V ever makes it to consumer products.
