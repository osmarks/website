---
title: Linux on the Barracuda CloudGen Firewall F380 Revision B
description: My new main router.
created: 10/02/2025
slug: f380b
---
While idly browsing eBay, I came across Barracuda Networks "firewall" devices, mysterious boxes with lots of (fairly low-speed) network IO and basic general-purpose-computer IO (USB and VGA). It transpired that Barracuda is primarily in the business of selling expensive software licenses to people who for some reason don't want to use open-source software, and that the mysterious boxes were actually rebadged x86 machines from various "network appliance" vendors. The [F180A](https://campus.barracuda.com/product/cloudgenfirewall/doc/169426005/f180-and-f183-revision-a) I was considering originally has an outdated Atom CPU[^1] and apparently an integrated WiFi card, which was not very interesting, but further searching turned up the [F380B](https://campus.barracuda.com/product/cloudgenfirewall/doc/93880710/f380-revision-b/) at a very low price (£37). Barracuda do not document this, but as far as I can tell it's actually an [Aewin SCB-1723](https://www.aewin.com/products/scb-1723/), with "recent" (2017) Intel CPU compatibility[^2] and a low-end Celeron in it - and, in their version, two SFP+ ports driven by an [X710](https://www.intel.com/content/www/us/en/products/details/ethernet/700-network-adapters/x710-network-adapters/docs.html)! I clearly had to get one to stop my overtaxed access point from also serving as a router.

The public internet doesn't seem to have thorough details on the internals, so here you go:

```
root@archiso /tmp # lscpu
Architecture:             x86_64
  CPU op-mode(s):         32-bit, 64-bit
  Address sizes:          39 bits physical, 48 bits virtual
  Byte Order:             Little Endian
CPU(s):                   2
  On-line CPU(s) list:    0,1
Vendor ID:                GenuineIntel
  Model name:             Intel(R) Celeron(R) G4900 CPU @ 3.10GHz
    CPU family:           6
    Model:                158
    Thread(s) per core:   1
    Core(s) per socket:   2
    Socket(s):            1
    Stepping:             11
    CPU(s) scaling MHz:   32%
    CPU max MHz:          3100.0000
    CPU min MHz:          800.0000
    BogoMIPS:             6202.33
    Flags:                fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush dts acpi mmx fxsr sse sse2 ss ht tm pbe syscall nx
                          pdpe1gb rdtscp lm constant_tsc art arch_perfmon pebs bts rep_good nopl xtopology nonstop_tsc cpuid aperfmperf pni pclmulqdq dtes64
                          monitor ds_cpl est tm2 ssse3 sdbg cx16 xtpr pdcm pcid sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave rdrand lahf_lm
                           abm 3dnowprefetch cpuid_fault pti ssbd ibrs ibpb stibp fsgsbase tsc_adjust smep erms invpcid mpx rdseed smap clflushopt intel_pt x
                          saveopt xsavec xgetbv1 xsaves dtherm arat pln pts hwp hwp_notify hwp_act_window hwp_epp md_clear flush_l1d arch_capabilities
Caches (sum of all):
  L1d:                    64 KiB (2 instances)
  L1i:                    64 KiB (2 instances)
  L2:                     512 KiB (2 instances)
  L3:                     2 MiB (1 instance)
NUMA:
  NUMA node(s):           1
  NUMA node0 CPU(s):      0,1
Vulnerabilities:
  Gather data sampling:   Not affected
  Itlb multihit:          KVM: Mitigation: VMX unsupported
  L1tf:                   Mitigation; PTE Inversion
  Mds:                    Mitigation; Clear CPU buffers; SMT disabled
  Meltdown:               Mitigation; PTI
  Mmio stale data:        Mitigation; Clear CPU buffers; SMT disabled
  Reg file data sampling: Not affected
  Retbleed:               Mitigation; IBRS
  Spec rstack overflow:   Not affected
  Spec store bypass:      Mitigation; Speculative Store Bypass disabled via prctl
  Spectre v1:             Mitigation; usercopy/swapgs barriers and __user pointer sanitization
  Spectre v2:             Mitigation; IBRS; IBPB conditional; STIBP disabled; RSB filling; PBRSB-eIBRS Not affected; BHI Not affected
  Srbds:                  Mitigation; Microcode
  Tsx async abort:        Not affected
```

```
root@archiso /tmp # lspci
00:00.0 Host bridge: Intel Corporation Device 3e0f (rev 08)
00:01.0 PCI bridge: Intel Corporation 6th-10th Gen Core Processor PCIe Controller (x16) (rev 08)
00:02.0 VGA compatible controller: Intel Corporation CoffeeLake-S GT1 [UHD Graphics 610]
00:08.0 System peripheral: Intel Corporation Xeon E3-1200 v5/v6 / E3-1500 v5 / 6th/7th/8th Gen Core Processor Gaussian Mixture Model
00:12.0 Signal processing controller: Intel Corporation Cannon Lake PCH Thermal Controller (rev 10)
00:14.0 USB controller: Intel Corporation Cannon Lake PCH USB 3.1 xHCI Host Controller (rev 10)
00:14.2 RAM memory: Intel Corporation Cannon Lake PCH Shared SRAM (rev 10)
00:16.0 Communication controller: Intel Corporation Cannon Lake PCH HECI Controller (rev 10)
00:17.0 SATA controller: Intel Corporation Cannon Lake PCH SATA AHCI Controller (rev 10)
00:1c.0 PCI bridge: Intel Corporation Cannon Lake PCH PCI Express Root Port #5 (rev f0)
00:1c.6 PCI bridge: Intel Corporation Cannon Lake PCH PCI Express Root Port #7 (rev f0)
00:1c.7 PCI bridge: Intel Corporation Cannon Lake PCH PCI Express Root Port #8 (rev f0)
00:1d.0 PCI bridge: Intel Corporation Cannon Lake PCH PCI Express Root Port #11 (rev f0)
00:1d.3 PCI bridge: Intel Corporation Cannon Lake PCH PCI Express Root Port #12 (rev f0)
00:1e.0 Communication controller: Intel Corporation Cannon Lake PCH Serial IO UART Host Controller (rev 10)
00:1f.0 ISA bridge: Intel Corporation H310 Chipset LPC/eSPI Controller (rev 10)
00:1f.4 SMBus: Intel Corporation Cannon Lake PCH SMBus Controller (rev 10)
00:1f.5 Serial bus controller: Intel Corporation Cannon Lake PCH SPI Controller (rev 10)
01:00.0 Ethernet controller: Intel Corporation I211 Gigabit Network Connection (rev 03)
02:00.0 Ethernet controller: Intel Corporation I211 Gigabit Network Connection (rev 03)
03:00.0 Ethernet controller: Intel Corporation I211 Gigabit Network Connection (rev 03)
04:00.0 Ethernet controller: Intel Corporation I211 Gigabit Network Connection (rev 03)
05:00.0 PCI bridge: Pericom Semiconductor PI7C9X2G608GP PCIe2 6-Port/8-Lane Packet Switch
06:01.0 PCI bridge: Pericom Semiconductor PI7C9X2G608GP PCIe2 6-Port/8-Lane Packet Switch
06:02.0 PCI bridge: Pericom Semiconductor PI7C9X2G608GP PCIe2 6-Port/8-Lane Packet Switch
06:03.0 PCI bridge: Pericom Semiconductor PI7C9X2G608GP PCIe2 6-Port/8-Lane Packet Switch
06:04.0 PCI bridge: Pericom Semiconductor PI7C9X2G608GP PCIe2 6-Port/8-Lane Packet Switch
07:00.0 Ethernet controller: Intel Corporation I211 Gigabit Network Connection (rev 03)
08:00.0 Ethernet controller: Intel Corporation I211 Gigabit Network Connection (rev 03)
09:00.0 Ethernet controller: Intel Corporation I211 Gigabit Network Connection (rev 03)
0a:00.0 Ethernet controller: Intel Corporation I211 Gigabit Network Connection (rev 03)
0b:00.0 Ethernet controller: Intel Corporation Ethernet Controller X710 for 10GbE SFP+ (rev 02)
0b:00.1 Ethernet controller: Intel Corporation Ethernet Controller X710 for 10GbE SFP+ (rev 02)
```

```
root@archiso /tmp # lsusb
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
Bus 001 Device 002: ID 0930:6545 Toshiba Corp. Kingston DataTraveler 102/2.0 / HEMA Flash Drive 2 GB / PNY Attache 4GB Stick
Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
```

![lstopo output](/assets/images/f380b_lstopo.png)

::: captioned src=/assets/images/f380b_hw.jpg
This is the only picture of the internals on the internet (that I know of), probably because these are rare and I had to undo about twenty screws to get this far. I assume this was done to spite maintenance technicians.
:::

::: captioned src=/assets/images/f380b_psu.jpg
It uses some kind of off-the-shelf nonredundant low-quality power supply, but the interfaces look standard so I guess you could replace it if you wanted to.
:::

::: captioned src=/assets/images/f380b_net_daughtercard.jpg
High-speed networking is on a separate proprietary-form-factor daughtercard with, for *some* reason, another PCB providing a right-angle connection.
:::

::: captioned src=/assets/images/f380b_cpu.jpg
You can just about see the CPU socket under the heatsink and airflow guides. There's also a free RAM slot.
:::

The four SATA ports here and the extra SATA power available from the PSU mean that, if you wanted to and could print or otherwise fabricate more drive mounts, you could use this as a very janky four-drive NAS. I was hoping for a free mini-PCIe or M.2 slot, but it seems that all the lanes are in use by the PCIe switches for the front-panel NICs and the X710. Also, you'll note from the `lscpu` output that this CPU is vulnerable to several side-channel attacks which it's software-mitigating: I recommend you disable mitigations because Skylake derivatives are quite badly affected performancewise, and if you're running untrusted code on a router something has clearly gone very wrong some time ago.

I do not have a VGA or serial console adapter, but it has an Ethernet port and USB and boots USB sticks by default, so it was a simple matter to boot an [Arch installer image with SSH configured](https://wiki.archlinux.org/title/Install_Arch_Linux_via_SSH#Using_a_single_USB_flash_drive) and then write OpenWRT to the internal storage. Unfortunately, this did not actually work: it imaged fine but the network ports failed to come up. Fortunately, it turned out that the problem was simply OpenWRT only enabling some of the ports, and in a weird order - it wanted 5 as LAN and 6 as WAN, in the numbering on the front panel.

It is very loud by default - the fan curves are set aggressively (8000 RPM!), presumably for datacentre use. If you install the drivers for the NCT6791 chip, Linux enumerates the fans through sysfs; I have a hacky script which adjusts the PWM operating points down. There also is an LCD panel with some buttons on the front, which I wanted to use. It turns out that the code for this is all very 1990s; I eventually managed to get everything to work by extracting the `lcd4linux` binaries and configuration from the official firmware[^3] [ISO](https://dlportal.barracudanetworks.com/download/6120/GWAY-9.0.4-0097.iso). It might be possible to use `lcdproc`, but I wasn't able to port the configuration properly.

It's currently in service as the core router for my home network, running horribly underutilized because I only have gigabit internet service and [SQM](https://openwrt.org/docs/guide-user/network/traffic-shaping/sqm) isn't particularly heavy for a "real" processor.

[^1]: Barracuda doesn't document it, but one seller says it's a [C2358](https://www.intel.com/content/www/us/en/products/sku/77978/intel-atom-processor-c2358-1m-cache-1-70-ghz/specifications.html). Note that this generation, if maybe not this product, is vulnerable to the [AVR54](https://www.servethehome.com/intel-atom-c2000-c0-stepping-fixing-the-avr54-bug/) bug.

[^2]: Aside from BIOS compatibility, it might be possible to put an i9-9900K in there, which would be very funny. The [CC150](https://www.tomshardware.com/news/intel-cc150-cpu-specs-benchmark-results), which is a very power-efficient 8C/16T CPU, would probably be nice and not particularly unreasonable.

[^3]: The LCD control stack is so cursed. A systemd service invokes an init script which regex-substitutes a config file and fudges CLI arguments for a C program which runs a GUI in a programming language embedded in `lcd4linux` which calls out to some shell scripts. They kept enough of the original pieces that I could cut out several parts though.
