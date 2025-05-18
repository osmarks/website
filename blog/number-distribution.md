---
title: On the empirical distribution of numbers
description: At last, data-driven numerology.
created: 02/05/2025
slug: number
katex: true
tags: ["maths", "own tech"]
---
::: epigraph link=https://x.com/1thousandfaces_/status/1828105487411544170 attribution=@1thousandfaces_
What are some good numbers for someone just starting to get into math?
:::

You've probably heard of [Benford's Law](https://en.wikipedia.org/wiki/Benford%27s_law) - the nonuniform empirical distribution of the first digits of "real-world numbers". While thinking about [other things](https://gwern.net/oen), I realized that it would be very easy to investigate this more generally by counting all instances of "numbers" within [a mid-sized LLM training dataset](https://pile.eleuther.ai/).

I did this, using a somewhat complex [state-machine parser](https://github.com/osmarks/misc/blob/master/empirical-number-distribution/src/main.rs#L18) for "numbers" which attempts to correctly interpret numbers containing commas and dots and percentages, or separated by dashes, but which does *not* handle scientific notation or exponents[^1]. You can get the resulting number data [here](https://datasets.osmarks.net/counts.csv); I have run some analyses myself, described below. The lack of scientific notation parsing likely cuts off lots of the top end, and the URLs in the dataset probably skew it too.

Run over the entire Pile training set, my code extracts 60633452 unique numbers (6.1e7)[^3], and 12598942216 (1.2e10) total instances. Firstly, here are the 30 most common numbers. You can see that 1 makes up about 10% of all numbers, with 2 very close behind[^2]. Only one negative number makes it into these rarefied heights, and we can see that "round numbers" are more salient than merely small numbers.

<div class="numeric-table">

| number | count      |
|--------|------------|
| 1      | 1285091487 |
| 2      | 1245931860 |
| 0      | 759996917  |
| 3      | 658078393  |
| 4      | 442882667  |
| 5      | 342835723  |
| 6      | 246669458  |
| 8      | 207732046  |
| 10     | 204988418  |
| 7      | 195558391  |
| 9      | 161918480  |
| 12     | 129697054  |
| 11     | 111310452  |
| 20     | 101514897  |
| 15     | 91434782   |
| 16     | 87265477   |
| 13     | 79321181   |
| 14     | 75491719   |
| 30     | 72532266   |
| -1     | 70044908   |
| 18     | 69886735   |
| 17     | 62675170   |
| 32     | 59691749   |
| 24     | 58510498   |
| 19     | 57800365   |
| 25     | 55035188   |
| 21     | 54834586   |
| 100    | 50744706   |
| 22     | 47568552   |
| 50     | 47307684   |

</div>

We might expect the distribution to be Zipfian, i.e. $\mathrm{frequency} \propto \frac{1}{\mathrm{rank}}$, although this doesn't hold for the top two numbers. I find that it's not: on a log/log plot, the best-fit line has a substantially steeper gradient than Zipf's law predicts. I don't know how to fit a Zipf-Mandelbrot law $\mathrm{frequency} \propto \frac{1}{(\mathrm{rank}+b)^a}$ with the $b$ parameter, so I haven't.

::: captioned src=/assets/images/top_1000_numbers.png
It's closer to Zipfian for the top thousand numbers.
:::
::: captioned src=/assets/images/top_10000_numbers.png
It intuitively feels like the line should be shallower here, but the points are much denser toward the right.
:::
::: captioned src=/assets/images/top_100000_numbers.png
No significant change here.
:::

I also analyzed the number of numbers with numbers of occurrences falling into exponentially distributed bins:

::: captioned src=/assets/images/number_freq_freq.png
The majority of seen numbers are seen very few times. I think the straight trend here implies number frequency is [Pareto-distributed](https://en.wikipedia.org/wiki/Pareto_distribution).
:::

We can also look at properties of the numbers themselves, rather than just their frequencies, since they're less opaque than words. The most obvious one is their size (absolute value). Below $10^0$ (1), the results are somewhat unreliable, because percentages are parsed but not other units or fractions or scientific notation. Regardless:

::: captioned src=/assets/images/number_size_histogram.png
I am not sure what causes the spikiness - possibly numerical issues.
:::

By sorting the numbers, I also determined that the median number is 7, plus or minus some roundoff error (conversion to 64-bit floating points loses some precision over arbitrarily long decimal strings). I also have the frequency of small integers (0 to 100) and some plausible year numbers.

::: captioned src=/assets/images/small_numbers_frequency.png
Spikes mostly correspond to "round numbers" in base 10 or 2 (marked with x-axis ticks).
:::
::: captioned src=/assets/images/years_frequency.png
The dataset was compiled in 2020, and I suppose it contains less forward-looking content than backward-looking.
:::

Finally, first digits. I get results quite close to Benford's law across this dataset, though not a perfect fit. This is discarding anything which begins with 0, though.

::: captioned src=/assets/images/benford.png
"Noninteger" means I excluded every number without a `.` indicating fractional part.
:::

In the future, it might be "useful" to see how well you can predict number popularity with a linear model based on (some transforms of) magnitude, sign, number of trailing zeroes and first digit.

[^1]: These have very nonstandard formats. I don't know how to do this without writing hundreds of separate regexes. Already the parser is convoluted enough due to trying to normalize numbers.

[^2]: In some sense this is undercounting because "a" and "the" refer to one thing as well.

[^3]: 1% is counted as separate from 0.01 for reasons, so this is a slight overestimate.
