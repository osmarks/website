---
title: London should be a cube
created: 06/04/2026
description: A new vision for housing in Great Britain.
slug: londocube
tags: ["economics", "opinion"]
highlightCode: true
squiggle: true
katex: true
---
We've all been annoyed at high London rents at some point, and possibly had [unproductive](/opinion/) arguments about what causes them and how they can be fixed. I believe that the root of the problem is inefficient use of the third dimension. The [very tallest buildings](https://en.wikipedia.org/wiki/List_of_tallest_buildings_and_structures_in_London) only go to about 300m, and according to [this report](https://content.knightfrank.com/research/2207/documents/en/nlaknight-frank-london-tall-buildings-survey-2021-7962.pdf) the number of "tall buildings" (over 20 storeys) introduced every year is about... 50. Additionally, there are [20 megametres](https://www.london.gov.uk/who-we-are/what-london-assembly-does/questions-mayor/find-an-answer/major-road-network) of road in Greater London, which is 1572km<sup>2</sup> in total size; assuming 4m-wide roads on average, 5% of land area is roads (ignoring double-counting at intersections, and tunnels), the volume above which is mostly wasted.

My proposal is simple: rebuild Greater London as a 3km-by-3km-by-3km cube[^2] containing all housing, commercial areas, offices and perhaps light industry of current London. The main advantage of this is reduced travel time - according to various dubious sources, the average commute is about 80 minutes a day, and based on [this](https://www.london.gov.uk/who-we-are/what-london-assembly-does/questions-mayor/find-an-answer/average-distance-travelled-person-mode-london) people travel about 8km/day on average[^1]. Within the cube, the *maximum* (straight-line) journey length would be 5.2km. To avoid doing real maths, I assembled a Monte Carlo simulation to estimate average journey lengths given uniformly distributed placement within the cube. Median journeys are only 2km! The [city scaling laws](https://www.pnas.org/doi/10.1073/pnas.0610172104) show significantly superlinear returns on city population (and economies of scale in infrastructure), and it's plausible to me that this is mediated by lots of people being able to reach each other easily, though I don't know exactly how you'd measure this, so this would be a great boon to the economy. We can estimate journey time using [Vitalik's travel time scaling law](https://vitalik.eth.limo/general/2023/04/14/traveltime.html).

```squiggle
size = 3
x1 = uniform(0, size)
x2 = uniform(0, size)
y1 = uniform(0, size)
y2 = uniform(0, size)
z1 = uniform(0, size)
z2 = uniform(0, size)

distance = ((x1-x2)^2 + (y1-y2)^2 + (z1-z2)^2)^0.5

966 * distance ^ 0.614
```

Our median (one-way) journey time is about 25 minutes, though practical commute times should be lower: people will preferentially work in nearer places, and the scaling law is fit based on poorly designed legacy cities with insufficient infrastructure, unlike the cube.

The population of Greater London is about 9 million people, so this gives 3000m<sup>3</sup> per person. This is easily enough to give everyone a reasonably sized (50m<sup>2</sup>, 2.5m ceilings) apartment and office space with more than an order of magnitude left over for expansion, infrastructure and commercial areas. Thus, this solves housing and transport.

## Minor engineering difficulties

### Anisotropy

It's much slower and harder to move vertically than horizontally, because of Earth's gravity: walking 3km horizontally is annoying but practical for most people, but 3km of vertical ascent is very difficult, and railways can only handle shallow gradients (4% or so with modern <span class="hoverdefn" title="electric multiple units">EMUs</span>). Fortunately, modern elevators can go quite fast: according to [this list](https://www.businessinsider.com/the-8-fastest-elevators-in-the-world-2013-1), the fastest elevators can manage 17m/s, which gives a maximum single-axis journey length of 3 minutes - very tractable. I was worried this would be much slower than horizontal transport, but comparisons against subway systems with closely spaced stations favour elevators' speed. At this scale, horizontal transport might be better off using [horizontal elevator](https://www.wired.com/story/thyssenkrupp-multi-maglev-elevator/) technology, or perhaps travelators, rather than trainlike platforms. There will need to be a parallel system for freight transport, which could also use elevators, probably sized to hold intermodal containers.

[![](/assets/images/metro_system_station_spacing.png)](https://worksinprogress.co/issue/the-magic-of-through-running/)

### Air pressure

The top of the cube, 3km above the landscape, will have an air pressure of about 70% of that at sea level. This is survivable - commercial aircraft interiors are often pressurized to "cabin altitudes" (effective altitude from pressure) of about 2km, and oxygen masks aren't mandatory until 4.5km - but uncomfortable. [Denver](https://en.wikipedia.org/wiki/Denver) and [Mexico City](https://en.wikipedia.org/wiki/Mexico_City), at 1.6km and 2.2km respectively, are seemingly not affected too adversely, but the difference is notable to athletes who haven't spent time acclimating.

However, London is one of the greatest cities of the world: it deserves better than "survivable but uncomfortable"[^6]. The cube needs mechanical ventilation systems in order to keep the inner parts livable, so they might as well also keep pressure at the ground-level norm, except in a few specialized zones, though this would require somewhat more air handling capacity and more solid walls. Can we improve on normal-pressure outdoor air? As it turns out, [yes](https://westhunt.wordpress.com/2012/03/23/a-sobering-thought/): the mostly-inert nitrogen in the air we all know and love, which has noticeable psychoactive effects on scuba divers, is [slightly anaesthetic](https://pubmed.ncbi.nlm.nih.gov/1130736/) even at ambient pressure. This was determined by replacing it with helium: sadly, helium is rare[^7], and pressurizing the cube even once would require most of the world's helium reserves. There don't appear to be good alternatives: other available gaseous elements are also anaesthetics[^8] (noble gases) or horribly unsafe (hydrogen) and anything else would presumably have been picked up by [scuba divers](https://web.archive.org/web/20080914174633/http://www.techdiver.ws/exotic_gases.shtml) already. A significantly increased partial pressure of oxygen would increase fire risk and possibly lead to [oxygen toxicity](https://en.wikipedia.org/wiki/Oxygen_toxicity). Lower pressure with the same partial pressure of oxygen - as is used in spacesuits - would lead to decompression sickness on entry (if the difference was large).

A neat compromise is an atmosphere at a reasonably safe total pressure of perhaps 0.75 atm, roughly on par with commercial airliners, and the same partial pressure of oxygen as normal air but less nitrogen. This shouldn't cause decompression issues for anyone who hasn't dived in the last few days, would (very speculatively assuming something like linearity) give people mildly improved cognition and would not cause oxygen toxicity/shortage issues. Carbon dioxide is also present in the atmosphere at around 400ppm, and maybe also harms cognition, so it would also be worth scrubbing this at cube inlets if possible. This could involve carbon capture plants or just CO<sub>2</sub> scrubber cycles to move it elsewhere.

The pressure difference will put some strain on the walls, but planes manage this with extremely thin skin (for mass reasons), so this shouldn't be an enormous problem, especially since for thermal reasons (detailed [below](#thermal-management)) there will be no windows, let alone openable windows. There will also need to be airlocks between the main cube and ambient-pressure sections such as the terminals for external rail/road/foot/ship access (including freight), which is a larger problem, because cycling speed is limited by human comfort (avoiding ear damage). It's been surprisingly difficult to find good data on what rate of pressure change is dangerous, but one reference is aircraft, which should apparently do at most [300 ft/min](https://www.ncbi.nlm.nih.gov/books/NBK219009) of descent (so about twenty minutes for 0.75 atm to 1 atm). Extrapolating somewhat from the figures in [this](/assets/misc/ryan2018.pdf), it may only be possible to go down to 95%–98% of outside pressure without unreasonably delaying entry and exit. This might also be necessary to keep emergency evacuation practical.

The cube certainly also needs active ventilation. We can estimate the air handling requirements based on the existing standards ([Approved Document F](https://assets.publishing.service.gov.uk/media/62a761edd3bf7f03667c667e/ADF2_revised.pdf#page=18)) of 10L/s/person (or 1L/s/m<sup>2</sup> of floor area). In this case, the floor area constraint would be binding, assuming 5m per floor for 600 total floors. The system has to move 5.4e9 L/s, or 5.4e6 m<sup>3</sup>/s, across all floors, or 9000m<sup>3</sup>/s for one floor, which has external faces of 3000m (horizontally) by 5m (vertically). Assuming that all flow is in one direction (e.g. east/west) and that the same volume of air is exhausted as taken in, we can calculate the necessary cross-sectional area of ducting from velocity. The velocity used in ducts is constrained by, apparently, noise, with branches in residential systems at up to [3m/s](https://www.engineeringtoolbox.com/sizing-ducts-d_207.html) according to a website. At that low speed a full fifth of the cross-section is in use for ducting, but we can use higher speeds for the central parts; 20m/s for all of it drops the area requirements to 450m<sup>2</sup> per floor, or 3%. Some of the system will of course need lower speeds, so the real figure will be between these, but I think this is enough to demonstrate rough feasibility.

Obviously, the cube's density increases the risk of airborne pathogens, all else equal: however, most buildings today don't have very good ventilation[^9] due to [skill issues](https://asteriskmag.com/issues/05/lies-damned-lies-and-manometer-readings), outdated building stock and high retrofit costs, so a ground-up design with modern HVAC provision should be able to do better than average. We could also incorporate [far-UVC](https://www.worksinprogress.news/p/flipping-the-switch-on-far-uvc) technologies, which have seen little adoption despite being obviously correct to install. Biosafety can also be improved by minimizing leaks and ensuring isolation between the HVAC systems for different sections, which is again much easier in a newly built structure.

The situation for water is probably similar, but water is denser and generally easier to deal with, though it will require more energy to pump it in quantity upcube.

### Structural stability

The [tallest building in the world](https://en.wikipedia.org/wiki/List_of_tallest_structures) is 0.8km, and gets thinner near the top, implying that there are some problems with making taller, fatter structures. I am not a civil engineer, but the most obvious issue is the compressive strength of the support structures. Considering a 1m<sup>2</sup> vertical slice through the cube, we can estimate the total mass of each floor's non-support objects, and then compute the amount of material needed to support that as well as the previous floors, as a simple recurrence:

```python
floor_height = 5 # m (guess)
object_mass = 5000 # kg (in that one m²) per floor of mass aside from the vertical supports (guess)
compressive_strength = 250e6 # Pa (the lower-bound number on Wikipedia for an unspecified type of steel)
total_height = 3000 # m
total_floors = total_height // floor_height
g = 9.81 # m/s²
density = 7850 # kg/m³

def mass(floor):
    if floor == 0: return object_mass
    mass_supported = mass(floor - 1)
    force_supported = mass_supported * g
    supports_area = force_supported / compressive_strength
    supports_mass = supports_area * floor_height * density
    print("area", supports_area)
    return mass_supported + object_mass + supports_mass
    
print(mass(total_floors))
```

```
[...]
area 0.19285887544334274
area 0.19335211089753432
4940012.895468282
```

This basic model says that only 20% of the bottom floor's area needs to be support structures. However, upon further research[^10], this does not actually work: the supports would [buckle](https://en.wikipedia.org/wiki/Euler%27s_critical_load) below their nominal maximum crushing pressure, there would be some lateral forces from wind, there may be noticeable thermal expansion/contraction effects, and the ground cannot support this. According to a Wikipedia page, the critical load $P=\frac{\pi^2 E I}{(KL)^2}$ where $E$ is a [property of the material](https://en.wikipedia.org/wiki/Young%27s_modulus) (200 GPa for "A36" steel), $L$ is the unsupported length (in this case, the 5m floor height), $K$ is a magic constant ("effective length factor") which I will take to be 1.0, and $I$ is the "minimum second moment of area of the cross section of the column" (in one direction, not the polar second moment). This of course depends on the chosen shape and the column area. Each column is ideally as broad as possible, but this reduces living space, and may run into issues with individual plates buckling, so for simplicity and ease of calculation we will assume each column is a solid square. This can be shown to have $I=\frac43 r^4$ where $r$ is half the square's side length. So:

```python
import math, scipy.optimize

floor_height = 5 # m (guess)
object_mass = 5000 # kg (in that one m²) per floor of mass aside from the vertical supports (guess)
compressive_strength = 250e6 # Pa (the lower-bound number on Wikipedia for an unspecified type of steel)
total_height = 3000 # m
total_floors = total_height // floor_height
g = 9.81 # m/s²
density = 7850 # kg/m³
youngs_modulus = 200e9 # Pa (A36 steel)
K = 1.0 # Wikipedia: rotation/translation free

def critical_load(r): # N
    return math.pi ** 2 * youngs_modulus * 4/3 * r**4 / ((K * floor_height) ** 2)

# we ignore self-weight within a floor for simplicity
def buckling_required_support_area(force_supported):
    # numerically solve critical_load(r) = force_supported
    eqn = lambda r: critical_load(r) - force_supported
    soln = scipy.optimize.fsolve(eqn, 1)[0]
    # r is half a side so double it
    return (soln * 2) ** 2

def mass(floor):
    if floor == 0: return object_mass
    mass_supported = mass(floor - 1)
    force_supported = mass_supported * g
    #print(buckling_required_support_area(force_supported))
    supports_area = max(force_supported / compressive_strength, buckling_required_support_area(force_supported))
    supports_mass = supports_area * floor_height * density
    print("area", supports_area)
    return mass_supported + object_mass + supports_mass
    
print(mass(total_floors))
```

```
[...]
area 0.19650723179519963
area 0.19700608633839367
5033274.954189333
```

This only mildly increases the required area fraction, but this is an oversimplification of the real behaviour - building codes have more complicated models to account for interactions between different failure modes rather than the sharp `max` cutoff. Blindly using the formulae from [a document on bridges](https://www.aisc.org/media/hf4jbmik/b904_sbdh_chapter4.pdf#page=79)[^11], we have:

```python
import math, scipy.optimize

floor_height = 5 # m (guess)
object_mass = 5000 # kg / m² (per-floor/per-area mass aside from the vertical supports (guess))
compressive_strength = 250e6 # Pa (the lower-bound number on Wikipedia for an unspecified type of steel)
total_height = 3000 # m
total_floors = total_height // floor_height
g = 9.81 # m/s²
density = 7850 # kg/m³
youngs_modulus = 200e9 # Pa (A36 steel)
K = 1.0 # Wikipedia: rotation/translation free
cell_size = 1

# tungsten carbide numbers, from an arbitrary PDF: https://www.carbideprobes.com/wp-content/uploads/2019/07/TungstenCarbideDataSheet.pdf
#compressive_strength = 6.2e9 # Pa
#youngs_modulus = 6.3e11 # Pa

# square column, r is half side length
def column_area(r): # m²
    return (r * 2) ** 2

def P_stub(r): # N
    return column_area(r) * compressive_strength

def P_effective(r): # N
    return math.pi ** 2 * youngs_modulus * 4/3 * r**4 / ((K * floor_height) ** 2)

def P_nominal(r): # N
    ratio = P_stub(r) / P_effective(r)
    if ratio <= 2.25:
        return 0.658 ** ratio * P_stub(r)
    else:
        return 0.877 * P_effective(r)

# we ignore self-weight within a floor for simplicity
def required_support_area(force_supported):
    # numerically solve critical_load(r) = force_supported
    eqn = lambda r: P_nominal(r) - force_supported
    soln = scipy.optimize.fsolve(eqn, 1)[0]
    assert soln > 0.0
    return column_area(soln)

def mass(floor):
    if floor == 0: return object_mass * cell_size, 0
    mass_supported, prev_supports_mass = mass(floor - 1)
    force_supported = mass_supported * g
    supports_area = required_support_area(force_supported)
    supports_mass = supports_area * floor_height * density
    print("area fraction", supports_area / cell_size)
    return mass_supported + object_mass * cell_size + supports_mass, supports_mass + prev_supports_mass
    
total_mass, mass_of_supports = mass(total_floors)
print(total_mass / cell_size) # kg
print(mass_of_supports / cell_size) # kg
```

```
[...]
area fraction 0.22872471498390148
area fraction 0.22927445574076946
5465335.676963464
2460335.6769634676
```

This still does not add much area. I also added a `cell_size` parameter, because having a separate column for each m<sup>2</sup> of living space is awkward, though it isn't very useful because increasing cell size (i.e. putting bigger columns less frequently) can only ever decrease the required area in this model because the considered failure modes are too-thin columns bending and columns being crushed (and the latter has linearity), whereas the real cost of this is more lateral bracing within each floor (lateral support is not explicitly modelled, because it's complicated).

We have not resolved the issue of foundations. London is built on what I understand to be relatively weak sedimentary rocks which could not tolerate ~60MPa without undergoing several unpleasant failure modes. This could perhaps be resolved by constructing the cube in the Scottish Highlands, but these have very poor connectivity and are not London. However, stronger "London Platform" rocks are not especially deep under central London itself, so it would be a simple matter of excavating several cubic kilometres of softer material to reach them, followed by pouring an enormous plane of high-strength concrete onto them to horizontally spread the load, and building the cube on top of that. There are almost certainly some remaining geotechnical concerns which need more detailed investigation, so it would be nicer to use less mass, especially since buttresses might be required and would add additional weight.

::: captioned src=/assets/images/london_geology.jpg wide
From British Regional Geology: London and the Thames Valley, 4th edition.
:::

Can we do better? Tungsten carbide is much stiffer and stronger than steel, but somewhat heavier: I have estimated (by recklessly using the same formulae as for steel with different inputs) that this provides a total load improvement of about 20%, because the majority of the total mass is from `object_mass`, encompassing everything but the vertical supports, and guessed wildly without much basis. At only 1000kg of horizontal structure and useful payload per floor-square-metre we have a much more reasonable 14MPa on the ground, but this is likely too optimistic. Also, this requires 700 tonnes of tungsten carbide per square metre, which means consuming orders of magnitude more tungsten than a year of global production in total.

It looks like [polycrystalline diamond](/assets/misc/lammer1988.pdf) - very small grains of diamond bonded to cobalt or tungsten carbide[^12], now used for e.g. high-performance 3D printer nozzles and drill bits - has even better properties, being lighter than tungsten carbide and steel but having about the same strength as tungsten carbide. This has the same problem of consuming much more than all global production, and the [existing process](https://www.youtube.com/watch?v=96eFnTescoY) looks limited to small objects and difficult and expensive to scale. Without a way to form the strong carbon/carbon bonds *in situ*, or the ability to make much larger polycrystalline diamond structural elements, this is not practical. It might be possible to use [chemical vapour deposition](https://worksinprogress.co/issue/lab-grown-diamonds/) to slowly grow additional structural diamond onto existing diamond, but this requires a vacuum chamber with tightly controlled conditions and is very slow and difficult to tune. Overall, this is not feasible without further research or [Drexlerian nanotechnology](https://nanosyste.ms/), which also requires further research and may be impossible.

You may have noticed that the calculation with steel requires ~2500 tonnes of steel per square metre of vertical support, or about 22 billion tonnes in total. Global steel production is ~2 billion tonnes per year[^14], and it would not be possible to repurpose all of this.

::: captioned src=/assets/images/gwangyang_steel_plant.jpg
Someone's photograph of the [POSCO Gwangyang steelworks](https://www.gem.wiki/POSCO_Gwangyang_steel_plant); it looks less shiny in Google Maps, and this picture excludes some of what I take to be support infrastructure.
:::

This facility produces ~20 million tonnes of steel, or 1% of global production, per year in [22km<sup>2</sup>](https://newsroom.posco.com/en/posco-steelworks-create-forests-from-within/) of (reclaimed!) land, and is apparently fairly tightly integrated, receiving iron ore and coal from Australia and producing crude steel outputs. Wales alone is 20000km<sup>2</sup>, so it could easily fit 100 such facilities, enough to make enough steel for the cube in just 10 years, though as it is quite hilly they may not be best placed there. Britain also benefits from an expanse of [relatively shallow, reclaimable land](https://en.wikipedia.org/wiki/Doggerland) off the east coast, if necessary. Operating these would require roughly quadrupling British electrical demand and output - most likely with nuclear reactors, for power density. The country already has extensive coal and iron ore resources, though my understanding is that imported iron resources are used instead now because they're better-quality and the best local ones have been depleted.

### Evacuation and safety

Evacuating every cubedweller (cubican?) whenever there is a fire or similar incident will be wildly impractical, not least because nowhere else in the country could contain them for long. The cube thus needs to be able to section off damaged areas, as in some [dystopian science fiction](https://en.wikipedia.org/wiki/The_Concentration_City), enough to prevent the spread of fire, structural problems, floods and biohazards. The maximum size of these areas is then set by practical evacuation distances, which are, per [building codes](https://assets.publishing.service.gov.uk/media/67d2bb074702aacd2251cb94/Approved_Document_B_volume_1_Dwellings_2019_edition_incorporating_2020_2022_and_2025_amendments_collated_with_2026_and_2029_amendments.pdf#page=38), limited to 30 metres, giving a maximum size per area of 60 metres (per side, assuming square): this could be looser if we allow vertical evacuation and include many stairs, but it might be challenging to then ensure that these all have enough isolation. Around the edges, to ensure that every direction has working escape routes, there could be external stairs between the cube's outer structural wall and reflective layer, to allow access to the floor below. While sectioning off HVAC would be relatively easy as the system would have to be quite branchy regardless of any safety measures, strong isolation barriers every 60m would be unpleasant for occupants, so this system will have to be hierarchical: most of the barriers will only be strong enough to provide enough time for escape to another area, with most of the hardening going on inter-floor routes and occasional "district" boundaries.

### Thermal management

London already has a substantial heat problem, due to urban heat island effects and Britain becoming increasingly warm in general. The deep Tube system is much worse off[^5]. With its higher density and lack of surface area for convective cooling, the cube will have an even worse situation and need powerful active cooling. Humans alone produce about 100W of heat each, for a total of 1GW for the whole cube; household, office, infrastructural and commercial energy consumption adds more[^4], so let's assume 10GW for some safety margin and future growth. Sunlight would contribute lots (at peak times), as solar irradiance in the UK can reach 1kW/m<sup>2</sup>, but if we cover the surface in 95% efficient mirrors (cheap Mylar film should be sufficient) this becomes a relatively minor concern (~hundreds of MW). For human comfort, we need to keep the interior at about 20°C.

Modern air conditioners have a [coefficient of performance](https://en.wikipedia.org/wiki/Coefficient_of_performance) (the ratio of heat moved to work required) of over 4, so cooling could be managed with (indicatively) 2.5GW, or the electrical output of a large nuclear power plant, but the heat must be moved somewhere. It could be extracted from the guts of the cube itself using the ventilation system (if ducts are well-insulated) or dedicated cooling water lines.

The Thames carries a [very variable](https://richmondcanoeclub.com/members/flow/kingston/) amount of water. If we assume it's at least 10m<sup>3</sup>/s, this gives us 40MW of cooling capacity per kelvin we are willing to raise the Thames' temperature, ignoring phase changes. This means that in dry seasons it may be necessary to bring the river to or above boiling to shed enough heat. While boiling the Thames may sound attractive, the greater temperature difference reduces cooling efficiency, and there are probably environmental concerns of some kind. This could possibly be mitigated by realigning the river, rerouting other rivers and installing large reservoirs to provide a consistent ~100m<sup>3</sup>/s of flow, leaving a merely very warm river, though there is then a risk of insufficient rainfall. Alternatively, and in my opinion more elegantly, a canal or aqueduct could be configured to transport water from the south coast to the cube, to be discharged via the existing Thames estuary. Britain has a [rich history](https://en.wikipedia.org/wiki/Canals_of_the_United_Kingdom) of canals, many substantially longer than this, though it would have to run against the terrain (presumably with several pumping stations) and have much faster flows than is typical.

I can't rule out the possibility of exchanging heat radiatively, or convectively with the air, but the efficiency of this will vary with weather, and the cube must operate at all times.

## Conclusion

Through reduced commute times, the cube should save 30 minutes a day for every existing London worker, and provide the capacity for a large scaleup of the population of London without increasing urban sprawl. Based on the scaling laws I mentioned earlier, doubling London's population should lead to a 10% increase in GDP per capita (assumed exponent 1.15). As no other country, to my knowledge, has a vast monolithic cube containing its capital city, this would increase tourism revenues. But there is a deeper reason we need London to be a cube.

Britain used to lead the world in technological progress and industrial development, but in recent years has become unable to even build a [railway line](https://en.wikipedia.org/wiki/High_Speed_2)[^13]. It is said that if you want men to build a ship, the fastest way is not to assign them to collect wood and research hydrodynamics but to teach them to yearn for the vast and endless sea. Similarly, reindustrialization of Britain requires not dry, stolid targets and quotas and strategies but a grand megastructural vision to inspire the nation to action. Construction of the London Cube must begin at once, with a target of replacing all other buildings within the M25. The future of the British economy - and indeed the British culture - depends on it.

[^1]: Of course, people don't make the same journey every day. Assuming people travel only for work, for simplicity, and that people have 46 5-day work weeks a year (52 minus annual leave), we instead get 13km/day, for 6.5km/commute.

[^2]: A sphere is better for distance minimization, I think, but would look silly and have some structural problems.

[^4]: The average UK household apparently consumes 2700kWh/year and has 2 to 3 people. This is about 120W/person, though some of this is heating, which would be provided centrally in the cube.

[^5]: Some lines reach over [30°C in summer](https://data.london.gov.uk/dataset/london-underground-average-monthly-temperatures/) on average, with worse peaks.

[^6]: Altitude training is of course a draw for some people, but a very small minority.

[^7]: Also, it [might break things](https://www.ifixit.com/News/11986/iphones-are-allergic-to-helium).

[^8]: The full mechanism is apparently disputed, but it seems to involve physical properties of gases rather than chemical reactions *per se*, so it's not easily avoidable.

[^9]: According to [a survey](https://www.sciencedirect.com/science/article/pii/S0360132324003706), only 11% of UK homes have mechanical ventilation systems, though presumably it's higher for e.g. offices. I moved into an apartment with mechanical ventilation some time ago, having previously not thought about it very much, and am now significantly less willing to move somewhere without it.

[^10]: Asking ChatGPT to list all the problems.

[^11]: The original source is [Specification for Structural Steel Buildings](/assets/misc/aisc2022.pdf#page=108), I think.

[^12]: It [has recently become possible](https://pmc.ncbi.nlm.nih.gov/articles/PMC8951216/) to produce it without these binders.

[^13]: While construction is progressing, it is massively overbudget and behind schedule, and has been descoped.

[^14]: I'm not sure what mix of different types of steel this is, but I'm assuming everything could be retooled to produce high-strength structural steel for the cube if required.
