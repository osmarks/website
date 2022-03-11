// I cannot be bothered to set up a bundler
// https://www.npmjs.com/package/idb
!function(e,t){t(window.idb={})}(this,(function(e){"use strict";let t,n;const r=new WeakMap,o=new WeakMap,s=new WeakMap,i=new WeakMap,a=new WeakMap;let c={get(e,t,n){if(e instanceof IDBTransaction){if("done"===t)return o.get(e);if("objectStoreNames"===t)return e.objectStoreNames||s.get(e);if("store"===t)return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return f(e[t])},set:(e,t,n)=>(e[t]=n,!0),has:(e,t)=>e instanceof IDBTransaction&&("done"===t||"store"===t)||t in e};function d(e){return e!==IDBDatabase.prototype.transaction||"objectStoreNames"in IDBTransaction.prototype?(n||(n=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])).includes(e)?function(...t){return e.apply(p(this),t),f(r.get(this))}:function(...t){return f(e.apply(p(this),t))}:function(t,...n){const r=e.call(p(this),t,...n);return s.set(r,t.sort?t.sort():[t]),f(r)}}function u(e){return"function"==typeof e?d(e):(e instanceof IDBTransaction&&function(e){if(o.has(e))return;const t=new Promise(((t,n)=>{const r=()=>{e.removeEventListener("complete",o),e.removeEventListener("error",s),e.removeEventListener("abort",s)},o=()=>{t(),r()},s=()=>{n(e.error||new DOMException("AbortError","AbortError")),r()};e.addEventListener("complete",o),e.addEventListener("error",s),e.addEventListener("abort",s)}));o.set(e,t)}(e),n=e,(t||(t=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])).some((e=>n instanceof e))?new Proxy(e,c):e);var n}function f(e){if(e instanceof IDBRequest)return function(e){const t=new Promise(((t,n)=>{const r=()=>{e.removeEventListener("success",o),e.removeEventListener("error",s)},o=()=>{t(f(e.result)),r()},s=()=>{n(e.error),r()};e.addEventListener("success",o),e.addEventListener("error",s)}));return t.then((t=>{t instanceof IDBCursor&&r.set(t,e)})).catch((()=>{})),a.set(t,e),t}(e);if(i.has(e))return i.get(e);const t=u(e);return t!==e&&(i.set(e,t),a.set(t,e)),t}const p=e=>a.get(e);const l=["get","getKey","getAll","getAllKeys","count"],D=["put","add","delete","clear"],b=new Map;function v(e,t){if(!(e instanceof IDBDatabase)||t in e||"string"!=typeof t)return;if(b.get(t))return b.get(t);const n=t.replace(/FromIndex$/,""),r=t!==n,o=D.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!o&&!l.includes(n))return;const s=async function(e,...t){const s=this.transaction(e,o?"readwrite":"readonly");let i=s.store;return r&&(i=i.index(t.shift())),(await Promise.all([i[n](...t),o&&s.done]))[0]};return b.set(t,s),s}c=(e=>({...e,get:(t,n,r)=>v(t,n)||e.get(t,n,r),has:(t,n)=>!!v(t,n)||e.has(t,n)}))(c),e.deleteDB=function(e,{blocked:t}={}){const n=indexedDB.deleteDatabase(e);return t&&n.addEventListener("blocked",(()=>t())),f(n).then((()=>{}))},e.openDB=function(e,t,{blocked:n,upgrade:r,blocking:o,terminated:s}={}){const i=indexedDB.open(e,t),a=f(i);return r&&i.addEventListener("upgradeneeded",(e=>{r(f(i.result),e.oldVersion,e.newVersion,f(i.transaction))})),n&&i.addEventListener("blocked",(()=>n())),a.then((e=>{s&&e.addEventListener("close",(()=>s())),o&&e.addEventListener("versionchange",(()=>o()))})).catch((()=>{})),a},e.unwrap=p,e.wrap=f}));

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
window.points = (async () => {
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
        },
        heavgame1: {
            title: "Pastaphysical Futility",
            conditions: "Annoying the narrator of Heavpoot's Game",
            description: "Irritating the narrator with control of your reality is rarely a good choice. In this case it definitely wasn't.",
            points: 34.04
        },
        heavgame2: {
            title: "(insert meaningful secret O5 councily thing here)",
            conditions: "Solving the puzzle in Heavpoot's Game",
            description: `You... did something or other and somehow found the "black moon" thing and guessed/found the answer to the puzzle there, so enjoy this achievement, O6-3234234!`,
            points: 41.5824
        },
        tttWinai1:{
            title: "Beginner's Luck",
            conditions: `Beat "AI" 1 on Tic-Tac-Toe`,
            description: "Congratulations on beating a slightly aware random number generator.",
            points: 23
        },
        tttWinai2:{
            title: "Superior Algorithms",
            conditions: `Beat "AI" 2 on Tic-Tac-Toe`,
            description: "Nonsarcastic congratulations on beating the near-optimal minimax agent.",
            points: 46
        },
        apioformGame: {
            title: "Relativistic apiohydromagnetoplasmodynamic cryomemetics",
            conditions: "Finish the Apioform Game tutorial",
            description: "You have braved the complete lack of guidance or a description in the Apioform Game and apioformed many apioforms.",
            points: 40
        },
        rpnv4recursion: {
            title: "You are doing it right",
            conditions: "Recurse to a stack depth of 100 or more on RPNCalc v4",
            description: "For using RPNCalcV4 as it is meant to be used - highly, highly recursively.",
            points: 18.324
        }
    }

    let [metrics, pointsData] = [{}, {}]
    try {
        const [oldMetrics, oldPoints] = await Promise.all([idb.openDB("arbitrary-metrics"), idb.openDB("arbitrary-points")])
        const getMetrics = async () => {
            const metrics = {}
            const tx = oldMetrics.transaction("metrics", "readonly")
            for (const key of await tx.store.getAllKeys()) {
                metrics[key] = await tx.store.get(key)
            }
            return metrics
        }
        const getPointsData = async () => {
            const data = {}
            const tx = oldPoints.transaction("data", "readonly")
            for (const key of await tx.store.getAllKeys()) {
                data[key] = await tx.store.get(key)
            }
            return data
        }
        [metrics, pointsData] = await Promise.all([getMetrics(), getPointsData()])
        await Promise.all([oldMetrics.close(), oldPoints.close()])
    } catch(e) {
        console.warn("old achievements not loaded due to", e)
    }
    const db = await idb.openDB("arbitrary-data", 1, {
        async upgrade(db, oldVersion, newVersion, tx) {
            console.log("migrating", oldVersion, newVersion)
            if (!oldVersion || oldVersion < 1) {
                // create metrics, KV, achievements stores
                db.createObjectStore("kv")
                db.createObjectStore("metrics")
                db.createObjectStore("achievements", {
                    keyPath: "id"
                })
                for (const [key, value] of Object.entries(metrics)) {
                    await tx.objectStore("metrics").put(value, key)
                }
                for (const achievement of (pointsData["achievements"] || [])) {
                    await tx.objectStore("achievements").put(achievement)
                }
            }
            await tx.done
        },
        blocked() {
            console.warn("Database error (older version open)")
        },
        blocking() {
            window.location.reload()
        },
        terminated() {
            console.warn("Database error (unexpectedly closed)")
        },
    });

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

    const fireUpdatedEvent = () => document.dispatchEvent(new Event("points-update"))

    let achievementsList

    const getAchievements = async tx => {
        if (achievementsList) { return achievementsList }
        if (!tx) { tx = db.transaction("achievements", "readonly") }
        achievementsList = await tx.objectStore("achievements").getAll()
        return achievementsList
    }

    const getPoints = async () => (await getAchievements()).map(a => a.points).reduce((x, y) => x + y, 0)

    const updateMetric = async (name, fn, def) => {
        const tx = db.transaction("metrics", "readwrite")
        const init = await tx.store.get(name) || def
        const newValue = fn(init)
        await tx.store.put(newValue, name)
        switch (name) {
        case "achievements":
            if (newValue === 1) {
                await unlockAchievement("firstAchievement")
            }
            break
        }
        return newValue
    }
    // increment pages visited count, since this should be run when a page is visited
    updateMetric("pagesVisited", x => x + 1, 0)

    const visitStart = Date.now()
    window.onbeforeunload = () => {
        const elapsedMs = Date.now() - visitStart
        updateMetric("timeSpent", x => x + (elapsedMs / 1000), 0)
    }

    const readAllMetrics = async () => {
        const out = new Map()
        const tx = db.transaction("metrics", "readonly")
        for (const key of await tx.store.getAllKeys()) {
            out.set(key, await tx.store.get(key))
        }
        return out
    }

    const reset = async () => {
        const tx = db.transaction(["achievements", "metrics"], "readwrite")
        for (const achievement of await tx.objectStore("achievements").getAllKeys()) {
            await tx.objectStore("achievements").delete(achievement)
        }
        for (const metric of await tx.objectStore("metrics").getAllKeys()) {
            await tx.objectStore("metrics").delete(metric)
        }
        achievementsList = []
        // fireUpdatedEvent()
        // called when achievement is unlocked there anyway
        await unlockAchievement("reset")
    }

    const unlockAchievement = async id => {
        const tx = db.transaction("achievements", "readwrite")
        const achievementsUnlocked = await getAchievements(tx)
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
        achievementsList.push(item)
        await Promise.all([
            updateMetric("achievements", x => x + 1, 0),
            tx.objectStore("achievements").put(item),
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
        unlockAchievement,
        getAchievements,
        achievementInfo
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