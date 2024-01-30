const round = x => Math.round(x * 1e10) / 1e10

const prefixes = ["", "kilo", "mega", "giga", "tera", "peta", "exa", "zetta", "yotta"]
const siPrefix = (value, unit) => {
    let i = 0
    let b = value
    while (b > 1000) {
        b /= 1000
        i++
    }
    return `${round(b).toString()} ${prefixes[i]}${unit}${value !== 1 ? "s" : ""}`
}

const metricDisplayInfo = {
    pagesVisited: { name: "Pages visited", units: "page" },
    timeSpent: { name: "Time spent", units: "second" },
    achievements: { name: "Achievements" },
    foesVanquished: { name: "Foes vanquished", units: "foe" },
    deaths: { name: "Emu War Deaths", units: "death" },
    loremParagraphs: { name: "Lorem Ipsum paragraphs seen", units: "paragraph" },
    commentsPosted: { name: "Comments posted", units: "comment" },
    greatestInfipage: { name: "Largest infipage visited" },
    heavpootLocations: { name: "Heavpoot's Game states", units: "state" },
    heavpootDeaths: { name: "Heavpoot's Game deaths", units: "death" },
}

for (const opponent of ["ai1", "ai2"]) {
    for (const result of ["Wins", "Losses", "Draws"]) {
        metricDisplayInfo[`ttt${result}${opponent}`] = { name: `${result} against ${opponent.toUpperCase()}`, units: "game" }
    }
}

for (const result of ["Wins", "Losses", "Draws"]) {
    metricDisplayInfo[`ttt4${result}`] = { name: `${result} in 4D Tic-Tac-Toe`, units: "game" }
}

const displayMetric = metric => {
    let name = metric[0]
    let value = metric[1]
    const displayInfo = metricDisplayInfo[name]
    if (displayInfo) {
        name = displayInfo.name
        if (displayInfo.units) {
            value = siPrefix(value, displayInfo.units)
        }
    }
    return m("tr", m("td.metricname", name), m("td.metricvalue", value))
}

const Metrics = {
    metrics: null,
    load: async () => {
        Metrics.metrics = await (await points).readAllMetrics()
        m.redraw()
    },
    view: () => m("p", Metrics.metrics === null ? "Loading..." : m("table.metrics", Array.from(Metrics.metrics.entries()).map(displayMetric)))
}

const zfill = (num, z) => num.toString().padStart(z, "0")
const formatDate = x => `${zfill(x.getHours(), 2)}:${zfill(x.getMinutes(), 2)}:${zfill(x.getSeconds(), 2)} ${zfill(x.getDate(), 2)}/${zfill(x.getMonth() + 1, 2)}/${zfill(x.getFullYear(), 4)}`

const renderAchievement = a =>
    m(".achievement", { style: `background-color: ${colHash(a.title)}` }, [
        a.timestamp && m(".title", { title: a.id }, `Achievement achieved at ${formatDate(new Date(a.timestamp))}`),
        m(".title", a.title),
        m(".description", a.description),
        m(".conditions", `Unlocked by: ${a.conditions}`),
        a.points && m(".points", `${a.points} points`)
    ])

const Achievements = {
    achievements: [],
    load: async () => {
        let rpoints = await points
        const raw = await rpoints.getAchievements()
        Achievements.achievements = raw.map(ach => {
            const info = rpoints.achievementInfo[ach.id]
            const out = {
                title: ach.id || "???",
                description: `Unrecognized achievement ${ach.id}.`,
                conditions: "???",
                ...ach
            }
            if (info) { Object.assign(out, info) }
            m.redraw()
            return out
        })
        Achievements.achievements.sort((a, b) => a.timestamp < b.timestamp)
    },
    view: () => m(".achievements-listing", Achievements.achievements.map(renderAchievement))
}

const reset = async () => {
    if (prompt(`This will reset your points, achievements and metrics. If you are sure, please type "yes I am definitely sure".`) === "yes I am definitely sure") {
        if (confirm("Are you really very sure?")) {
            await (await points).reset()
            //window.location.reload()
        }
    }
}

let pointsCount = "[loading...]"

const reloadPoints = async () => { pointsCount = await (await points).getPoints() }

const App = {
    view: () => m("div", [
        m("h2", `Points: ${pointsCount}`),
        m("button", { onclick: reset }, "Reset"),
        m(Metrics),
        m(Achievements)
    ])
}

m.mount(document.getElementById("app"), App)

Metrics.load()
reloadPoints()
Achievements.load()

points.then(points => points.unlockAchievement("visitArbitraryPoints"))

document.addEventListener("points-update", () => { reloadPoints(); Achievements.load() })