// https://github.com/jakearchibald/idb-keyval/blob/master/dist/idb-keyval-iife.min.js
// This is small enough that I decided to just embed it directly here to save hassle and network bandwidth.
const idbk=function(e){"use strict";class t{constructor(e="keyval-store",t="keyval"){this.storeName=t,this._dbp=new Promise((r,n)=>{const o=indexedDB.open(e,1);o.onerror=(()=>n(o.error)),o.onsuccess=(()=>r(o.result)),o.onupgradeneeded=(()=>{o.result.createObjectStore(t)})})}
    _withIDBStore(e,t){return this._dbp.then(r=>new Promise((n,o)=>{const s=r.transaction(this.storeName,e);s.oncomplete=(()=>n()),s.onabort=s.onerror=(()=>o(s.error)),t(s.objectStore(this.storeName))}))}}let r;function n(){return r||(r=new t),r}return e.Store=t,e.get=function(e,t=n()){let r;return t._withIDBStore("readonly",t=>{r=t.get(e)}).then(()=>r.result)},e.set=function(e,t,r=n()){return r._withIDBStore("readwrite",r=>{r.put(t,e)})},e.del=function(e,t=n()){return t._withIDBStore("readwrite",t=>{t.delete(e)})},e.clear=function(e=n()){return e._withIDBStore("readwrite",e=>{e.clear()})},e.keys=function(e=n()){const t=[];return e._withIDBStore("readonly",e=>{(e.openKeyCursor||e.openCursor).call(e).onsuccess=function(){this.result&&(t.push(this.result.key),this.result.continue())}}).then(()=>t)},e}({});

// attempt to register service worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).then(reg => {
        if (reg.installing) {
            console.log("Service worker installing");
        } else if (reg.waiting) {
            console.log("Service worker installed");
        } else if (reg.active) {
            console.log("Service worker active");
        }
    }).catch(error => {
        // registration failed
        console.log("Registration failed with " + error);
    });
} else {
    console.log("Service workers are not supported.");
}

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
const hashString = function(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i)
        h1 = Math.imul(h1 ^ ch, 2654435761)
        h2 = Math.imul(h2 ^ ch, 1597334677)
    }
    h1 = Math.imul(h1 ^ h1>>>16, 2246822507) ^ Math.imul(h2 ^ h2>>>13, 3266489909);
    h2 = Math.imul(h2 ^ h2>>>16, 2246822507) ^ Math.imul(h1 ^ h1>>>13, 3266489909)
    return 4294967296 * (2097151 & h2) + (h1>>>0)
}

const colHash = (str, saturation = 100, lightness = 70) => `hsl(${hashString(str) % 360}, ${saturation}%, ${lightness}%)`

// Arbitrary Points code, wrapped in an IIFE to not pollute the global environment much more than it already is
window.points = (() => {
    const achievementInfo = {
        test: {
            title: "Test",
            conditions: "testing",
            description: "This achievement is for testing purposes.",
            points: 10
        },
        firstAchievement: {
            title: "Achievement-Achieving Achievement™",
            conditions: "unlocking another achievement",
            description: "You achieved your first achievement, so here's an achievement to commemorate your achievement of an achievement! Enjoy the sense of achievement you get from this achievement!",
            points: 5.5
        },
        timeSpent1Hour: {
            title: "Causal Mondays",
            conditions: "using the site for a total of 1 hour",
            description: "Apparently you've spent an hour on this site. Weird. You get an achievement for it, though.",
            points: 9.3
        },
        visitArbitraryPoints: {
            title: "Arbitrary Arbitration",
            conditions: "visiting the Arbitrary Points management page",
            description: "You've now visited the Arbitrary Points page, from which you can see your achievements, point count and tracked metrics.",
            points: 15
        },
        reset: {
            title: "Burn It Down",
            conditions: "resetting",
            description: "So you wiped your Arbitrary Points data for whatever reason. Now you get this exclusive achievement!",
            points: 11.4
        },
        pagesVisited64: {
            title: "Real Dedication",
            conditions: "visiting 64 pages",
            points: 15.01,
            description: "You've visited something between 64 pages or 1 page 64 times and are thus being rewarded for your frequent use of the site."
        },
        blindLuck: {
            title: "Ridiculous Blind Luck",
            conditions: "0.001% chance of getting this every second",
            points: 66.6,
            description: "Through sheer chance you have obtained this achievement, which provides more points than all the other ones. This is probably a metaphor for life."
        },
        offline: {
            title: "Not The Dinosaur Game",
            conditions: "seeing the offline page",
            points: 10.1,
            description: "Something broke somewhere and you're seeing this. Sadly this no longer has the Chrome dinosaur game, but you can use other stuff."
        },
        attemptedXSS: {
            title: "1337 h4xx0r",
            conditions: "attempting an XSS attack",
            points: 43.01,
            description: "You appear to have attempted a cross-site-scripting attack. This probably hasn't worked. If it has, please tell me as this is a problem."
        },
        emuwar10: {
            title: "Emu Warrior",
            conditions: "vanquishing 10 or more foes in Emu War",
            points: 28.5,
            description: "You have become a mighty Emu Warrior by defeating 10 or more monsters and/or probably things which live in Australia."
        },
        lorem400: {
            title: "quare?",
            conditions: "seeing 400 paragraphs of Lorem Ipsum",
            points: 42.3,
            description: "Apparently you viewed 400 paragraphs of randomly generated Lorem Ipsum. I don't know why."
        },
        firstComment: {
            title: "That's just, like, your opinion, man",
            conditions: "posting a comment",
            points: 30.5,
            description: "You (probably, the detection isn't 100% accurate) posted a comment! Enjoy expressing your opinion (or random meaningless message) to random internet people!"
        },
        aprilFools: {
            title: "April Folly",
            conditions: "visiting on April Fools' Day",
            description: "Enjoy being... April Fooled? Good luck getting this, speedrunners.",
            points: 16.0303
        }
    }

    const e = (cls, parent, content) => {
        const element = document.createElement("div")
        element.classList.add(cls)
        if (content) { element.appendChild(document.createTextNode(content)) }
        if (parent) { parent.appendChild(element) }
        return element
    }

    const achievementsContainer = e("achievements", document.body)
    const displayAchievement = (title, description, conditions, points) => {
        const elem = e("achievement", achievementsContainer)
        elem.title = "click to dismiss"
        e("title", elem, "Achievement achieved!")
        e("title", elem, title)
        elem.style.backgroundColor = colHash(title)
        e("description", elem, description)
        e("conditions", elem, `Unlocked by: ${conditions}`)
        e("points", elem, `${points} points`)
        // disappear on click
        elem.addEventListener("click", () => {
            achievementsContainer.removeChild(elem)
        })
    }

    const metricsStore = new idbk.Store("arbitrary-metrics", "metrics")
    const dataStore = new idbk.Store("arbitrary-points", "data")

    const fireUpdatedEvent = () => document.dispatchEvent(new Event("points-update"))

    let pointsCount

    const getPoints = async () => {
        if (pointsCount) { return pointsCount }
        let value = await idbk.get("points", dataStore)
        if (value === undefined) {
            await idbk.set("points", 0, dataStore)
            value = 0
        }
        pointsCount = value
        return value
    }

    const updateStoredValue = async (store, name, fn, def) => {
        const newValue = fn(await idbk.get(name, store) || def)
        await idbk.set(name, newValue, store)
        return newValue
    }

    const updateMetric = async (name, fn, def) => {
        const newValue = await updateStoredValue(metricsStore, name, fn, def)
        switch (name) {
        case "achievements":
            if (newValue === 1) {
                await unlockAchievement("firstAchievement")
            }
            break
        }
        return newValue
    }
    const incrementPoints = inc => {
        pointsCount += inc
        updateStoredValue(dataStore, "points", x => x + inc, 0)
        fireUpdatedEvent()
    }

    // increment pages visited count, since this should be run when a page is visited
    updateMetric("pagesVisited", x => x + 1, 0)

    const visitStart = Date.now()
    window.onbeforeunload = () => {
        const elapsedMs = Date.now() - visitStart
        updateMetric("timeSpent", x => x + (elapsedMs / 1000), 0)
    }

    const setMetric = (metric, value) => idbk.set(metric, value, metricsStore)

    const readAllMetrics = async () => {
        const keys = await idbk.keys(metricsStore)
        const out = new Map()
        await Promise.all(keys.map(async k => {
            out.set(k, await idbk.get(k, metricsStore))
        }))
        return out
    }

    const reset = async () => {
        pointsCount = 0
        achievementsList = []
        await idbk.clear(metricsStore)
        await idbk.clear(dataStore)
        await unlockAchievement("reset")
    }

    let achievementsList
    const getAchievements = async () => {
        if (achievementsList) { return achievementsList }
        const value = await idbk.get("achievements", dataStore) || []
        achievementsList = value
        return value
    }

    const unlockAchievement = async id => {
        const achievementsUnlocked = await getAchievements()
        if (achievementsUnlocked.filter(a => a.id === id).length > 0) { return "already unlocked" }
        const info = achievementInfo[id]
        if (!info) { throw new Error("Achievement not recognized") }
        info.points = info.points || 10
        displayAchievement(info.title, info.description, info.conditions, info.points)
        const item = {
            id,
            timestamp: Date.now(),
            page: window.location.pathname,
            points: info.points
        }
        achievementsList = achievementsList.concat([item])
        await Promise.all([
            idbk.set("achievements", achievementsList, dataStore),
            updateMetric("achievements", x => x + 1, 0),
            incrementPoints(info.points)
        ])

        fireUpdatedEvent()
    }

    document.addEventListener("DOMContentLoaded", async () => {
        const metrics = await readAllMetrics()
        if (metrics.get("timeSpent") > 3600) { // one hour in seconds
            unlockAchievement("timeSpent1Hour")
        }
        if (metrics.get("pagesVisited") > 64) {
            unlockAchievement("pagesVisited64")
        }
        const now = new Date()
        if (now.getUTCMonth() === 3 && now.getUTCDate() === 1) {
        //if (now.getUTCMonth() === 2 && now.getUTCDate() === 22) {
            unlockAchievement("aprilFools")
        }
    })

    setInterval(() => {
        if (Math.random() < 0.00001) {
            unlockAchievement("blindLuck")
        }
    }, 1000)

    window.addEventListener("input", e => {
        if (e.target) {
            const text = e.target.value || e.target.textContent
            // extremely advanced XSS detection algorithm
            if (text && (text.includes("<script") || text.includes("onload="))) {
                unlockAchievement("attemptedXSS")
            }
        }
    })

    window.addEventListener("click", e => {
        // detect clicking of comment "submit" button
        if (e.target &&
            e.target.value === "Submit" &&
            e.target.parentElement &&
            e.target.parentElement.parentElement &&
            e.target.parentElement.parentElement.className === "auth-section") {
            unlockAchievement("firstComment")
            points.updateMetric("commentsPosted", function(x) { return x + 1 }, 0)
        }
    })

    return {
        reset,
        updateMetric,
        readAllMetrics,
        getPoints,
        incrementPoints,
        unlockAchievement,
        getAchievements,
        achievementInfo,
        setMetric
    }
})()

const customStyle = localStorage.getItem("user-stylesheet")
let customStyleEl = null
if (customStyle) {
    customStyleEl = document.createElement("style")
    customStyleEl.appendChild(document.createTextNode(customStyle))
    customStyleEl.onload = () => console.log("Loaded custom styles")
    customStyleEl.id = "custom-style"
    document.head.appendChild(customStyleEl)
}