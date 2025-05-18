---
title: Autocrafting algorithms
description: How it's made (automatically) (in computer games with Minecraft-like recipe systems).
created: 18/05/2025
slug: craft
highlightCode: true
tags: ["fiction", "games", "maths"]
---
I have previously [written](/mcpower/#logistics) briefly about on-demand autocrafting systems in Minecraft, which radically restructured ingame industry by allowing flexible timeshared allocation of machines. Rather than every item being made and stockpiled in large quantity on a dedicated production line, as in Factorio, or produced manually, they are made in response to user requests. An autocrafting-capable base can get away with a much smaller set of machines - one or a few of each kind, regardless of the number of item types being produced, as well as a few extra systems where autocrafting doesn't work or make sense. Controlling such a system is a harder problem than it first appears, however.

## Basic definition

Given:

- a set of valid items
- a "multiset/bag" (a set where items can be repeated, or an unsorted list) of items which are currently in storage
- a partial function mapping (some) items to a multiset (the input) and natural number (the quantity), i.e. crafting recipes - the inputs are consumed, producing the given quantity of the specified item
- an item and natural number (target item and quantity to produce)

we want to produce an autocrafting plan which will make the target item in the target quantity. Specifically, we want a sequence of recipes (identified by output items) and quantities (to run the recipes in)[^1] such that, when we start from the initial contents of storage and sequentially substitute each recipe's inputs for its outputs, each substitution is valid (we always have nonnegative quantities of items) and the final state of storage contains the target item in the target quantity.

If solutions exist, it is quite easy to find one, using backward-chaining/depth first search. [Dragon](https://github.com/osmarks/dragon), my old storage system, has a simple, bad implementation which, in retrospect, probably should not actually work. I wrote a [cleaner Python implementation](https://github.com/osmarks/misc/blob/master/autocrafter.py)[^3]:

```python
def solve(item: str, quantity: int, inventory: Inventory, use_callback, craft_callback) -> Inventory:
    directly_available = min(inventory[item], quantity) # Consume items from storage if available
    if directly_available > 0:
        use_callback(item, directly_available)
    inventory = inventory.take(item, directly_available)
    quantity -= directly_available

    if quantity > 0:
        if recipe := recipes.get(item):
            recipe_runs = math.ceil(quantity / recipe.quantity)
            for citem, cquantity in Counter(recipe.slots).items():
                if citem is not None:
                    inventory = solve(citem, recipe_runs * cquantity, inventory, use_callback, craft_callback) # Recurse into subrecipe
            craft_callback(item, recipe_runs)
            inventory = inventory.add(item, recipe_runs * recipe.quantity - quantity) # Add spare items to tracked inventory
        else:
            raise NoRecipe(item, quantity) # We need to make this and can't

    return inventory
```

::: captioned src=/assets/images/basic_autocraft.png
A simplified diagram of the ways to make ComputerCraft "turtle" robots. While there are multiple inputs at several steps, they all have to be used together.
:::

When it needs an item, it takes it from storage if possible, and otherwise it recursively crafts as many as it needs. Simple, clean, reasonably efficient in practice[^2] - what more could you want? As it turns out, several things.

## Extending the problem

We made a very large simplification in the previous definition: each item has *at most one* recipe to produce it. The algorithm has almost no choices to make - in principle, it could redundantly craft things it already has or do things in different orders, but these are not very interesting differences. But this isn't true in a real modded playthrough: at the very least, [OreDictionary](https://docs.minecraftforge.net/en/1.12.x/utilities/oredictionary/) (and now the [tag system](https://minecraft.wiki/w/Item_tag_(Java_Edition))) means that you can substitute different varieties of "the same" material for each other - for instance, almost everything which needs "a chest" can be made with oak, acacia, spruce, birch, jungle, etc. This seems trivial, but in larger modpacks you can often substitute equivalent tiers of separate mods' intermediate crafting components for each other despite wildly different recipes.

Considering multiple alternatives at each step, and the stateful inventory tracking preventing (obvious methods of) caching branches, means that [autocrafting is NP-hard](https://squiddev.github.io/ae-sat/) (wrt. recipe count, I think)[^4] if we permit multiple recipes per item, through reduction of [SAT](https://en.wikipedia.org/wiki/Boolean_satisfiability_problem) to autocrafting, though real-world systems (<span class="hoverdefn" title="Applied Energistics 2">AE2</span> and <span class="hoverdefn" title="Refined Storage">RS</span>) don't have general enough solvers for all instances. As far as I can tell, the [AE2 crafting solver](https://github.com/AppliedEnergistics/Applied-Energistics-2/blob/70838d74f81917ece64335db2aca3cb3a604b780/src/main/java/appeng/crafting/CraftingTreeNode.java#L167) uses a greedy algorithm - this could return technically-avoidable failures if a branch which is tried earlier consumes resources a later branch could have used more efficiently. [Refined Storage](https://github.com/refinedmods/refinedstorage2/blob/accdcf28c52752c1512c16b97efad7b59ab3b340/refinedstorage-autocrafting-api/src/main/java/com/refinedmods/refinedstorage/api/autocrafting/calculation/CraftingTree.java) appears to work the same way.

::: captioned src=/assets/images/complex_autocraft.png
If we also introduce the ability to make chests from birch wood, add smelting recipes and add the turtle to advanced turtle upgrade recipe, we have this more complex example.
:::

The greedy algorithm is, in practice, fine (in terms of returning solutions where they exist). Game progression is such that by the time it might become a problem, you have far more basic resources than you need, so the naive solver will work[^6]. We could stop here. But that isn't fun. Instead, we can make a general solution by accepting the problem's NP-hardness and running the problem through a general integer linear programming solver. I considered using an [SMT](https://en.wikipedia.org/wiki/Satisfiability_modulo_theories) solver as [previously proposed](https://borretti.me/fiction/eog581/the-lunar-surface), but with the preprocessing necessary for it to be tractable this is unnecessarily general. By performing a topological sort on the relevant section of the recipe graph[^5] to generate an ordered list of items to (possibly) make, substituting in all the possible recipes and solving for the number of invocations of each recipe under the constraint that we have positive quantities of every item and a sufficient quantity of the target item, we can find an autocrafting plan:

```python
def solve_ilp(item: str, quantity: int, inventory: Inventory, use_callback, craft_callback):
    sequence = list(topo_sort_inputs(item))

    recipe_steps = []

    # Rewrite (involved) recipes as production/consumption numbers.
    items = { sitem: [] for sitem in sequence }

    for item in sequence:
        for recipe in recipes_general[item]:
            step_changes = { sitem: 0 for sitem in sequence }
            for citem, cquantity in Counter(recipe.slots).items():
                if citem is not None:
                    step_changes[citem] = -cquantity
            step_changes[item] = recipe.quantity

            recipe_steps.append((item, recipe))

            for sitem, coef in step_changes.items():
                items[sitem].append(coef)

    objective = np.ones(len(recipe_steps))
    # The amount of each item we produce/consume is linearly dependent on how many times each recipe is executed.
    # This matrix is that linear transform.
    # Solver wants upper bounds so flip signs.
    production_matrix = -np.stack([np.array(coefs) for item, coefs in items.items()])
    # production_matrix @ x is the vector of item consumption, so we upper-bound that with inventory item counts
    # and require that we produce the required output (negative net consumption)
    item_constraint_vector = np.array([ -quantity + inventory[i] if i == item else inventory[i] for i in sequence ])

    soln = opt.linprog(objective, integrality=np.ones_like(objective), A_ub=production_matrix, b_ub=item_constraint_vector)

    match soln.status:
        case 0:
            print("OK")
            # soln.x is now the number of times to execute each recipe_step
            item_consumption = production_matrix @ soln.x
            for item_name, consumption in zip(sequence, item_consumption):
                consumption = int(consumption)
                if consumption > 0:
                    use_callback(item_name, consumption)
                inventory = inventory.take(item_name, consumption)
            for (recipe_output, recipe_spec), execution_count in zip(recipe_steps, soln.x):
                execution_count = int(execution_count)
                if execution_count > 0:
                    craft_callback(recipe_spec, recipe_output, execution_count)
            return inventory
        case 1:
            print("iteration limit reached")
            raise NoRecipe
        case 2:
            print("infeasible")
            raise NoRecipe
```

This is not very efficient - it globally optimizes over the whole relevant subtree at once - but it can find solutions greedy search cannot, and is more easily adapted to multi-output recipes.

## Subjectivity and other limitations

The problem is still not over. For one thing, the solver ignores cycles, where recipes (indirectly) contain themselves, because it can't topologically sort them, though you could likely adapt it quite easily since the ILP side doesn't care about order. More importantly, as an [AE2 developer describes](https://www.reddit.com/r/feedthebeast/comments/7t8v0o/autocrafting_is_npcomplete/dtbgkz9/), when there are multiple ways to make something there are subjective tradeoffs to make: is it better to consume slightly fewer items but use more machine time? What if avoiding extra machine time consumes an expensive resource? What if a large job is running and, without consuming this item, the user will have to wait tens of minutes? Since the algorithm I describe is ILP-based, it admits and indeed requires an objective function (where a SAT-based one wouldn't) - in my code, it minimizes crafting steps, but it could be replaced with one which cares about time and resource consumption. However, while it could use this information, it doesn't have it.

We can easily imagine tracking the time taken to run a recipe on a machine automatically, and perhaps having a "priority" switch to bump lower-priority jobs and switch to faster operations, but can't easily automatically know how valued an input is (though several heuristics are plausible), and many, such as power draw (or sometimes fluid inputs), are not known as part of crafting patterns (they could in principle be added, but this would be inconvenient). AE2 "solves" this by having users manually configure every recipe they want to use, but this is a large time sink and does not solve the problem in cases where users do actually want to use multiple recipes in different circumstances.

There is a further issue: randomness. Sometimes - mostly with "raw material" operations such as pulverizing ores or growing crops - outputs are produced nondeterministically some fraction of the time. This makes exact forward planning of recipe execution completely impossible, though in principle you could assume, say, the 95th percentile cost and rerun the random part until it works. In practice, most people run these as part of "always-on" systems which build up stockpiles (e.g. [this](https://guide.appliedenergistics.org/1.20.4/example-setups/recursive-crafting-setup)), or assume that the recipe will run enough as part of deterministic queries.

Does this have any other practical applications? Not that I know of - I am not sure this even turns up in games outside of modded Minecraft[^7]. This is apparently related to [Petri](https://en.wikipedia.org/wiki/Petri_net) [nets](https://isr.umd.edu/Labs/CIM/miscs/wmsor97.pdf), though I haven't paid enough attention to them to see why, as well as (much more obviously) to [vector addition systems](https://en.wikipedia.org/wiki/Vector_addition_system) and [commutative](https://www.sciencedirect.com/science/article/pii/S0019995883800229) [grammars](/assets/misc/commutative_grammars.pdf).

[^1]: We could equivalently repeat steps rather than giving them a quantity, but real implementations don't usually do that, for efficiency.

[^2]: You can imagine pathological cases in which it does much more computation than necessary because the same item is used repeatedly in different parts of the tree and the code makes no attempt to deduplicate here. In practice I don't think the trees get wide enough that this is a significant issue, and I don't see an obvious algorithm to coalesce repeats to fix it without already having done most of the traversal.

[^3]: I wanted to make it a generator rather than using the callbacks, but there wasn't an obvious way to do that and pass the inventories around.

[^4]: Less-technical discussions of this usually imply that if something is NP-hard it's intractable in general. NP-hardness means, loosely, that very difficult instances of a problem can be constructed, not that all instances are difficult. See [Wikipedia](https://en.wikipedia.org/wiki/P_versus_NP_problem).

[^5]: Technically, it's not a graph, because recipes don't map to a single item to item edge. The topological sort procedure uses a graph such that if any recipe for A contains B, there is an edge from B to A.

[^6]: And recipes tend not to hit corner cases anyway.

[^7]: Nothing else that I know of has the same range of items to make, general-purpose crafting machines and automation.
