import { ignorePaths } from "./common"

const offlinePage = "/assets/offline.html"
const cacheName = `${siteVersion}-v1`
const precache = [
    offlinePage,
    "/index.html",
    "/assets/images/logo256.png",
    //"/assets/images/icon.png",
    "/assets/js/page.js",
    "/points/index.html",
    "/points/index.js",
    "/assets/js/mithril.js"
]

// Preload important things
self.addEventListener("install", async event => {
    console.log("Installed service worker for site version", siteVersion)
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => cache.addAll(precache))
            .then(self.skipWaiting())
    )
})

// Delete caches from outdated versions of the site
self.addEventListener("activate", event => {
    console.log("Activated service worker for site version", siteVersion)
    event.waitUntil(
        caches.keys()
            .then(cacheNames => cacheNames.filter(cache => cacheName != cache))
            .then(cachesToDelete => Promise.all(cachesToDelete.map(cacheToDelete => caches.delete(cacheToDelete))))
            .then(() => self.clients.claim())
    )
})

const shouldRespond = req => {
    if (req.method !== "GET") { return false } // do not respond to non-GET requests
    if (!req.url.startsWith(self.location.origin)) { return false } // do not respond to cross-origin requests
    const parsedURL = new URL(req.url)
    const path = parsedURL.pathname
    for (ignorePath of ignorePaths) {
        if (path.startsWith(ignorePath)) { return false }
    }
    return true
}

const fetchWithTimeout = (req, timeout) =>
    new Promise((resolve, reject) => {
        const timerID = setTimeout(() => reject("timed out"), timeout)
        fetch(req).then(res => {
            clearTimeout(timerID)
            resolve(res)
        }).catch(reject)
    })

const getResponse = async req => {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(req)
    if (cachedResponse) {
        console.log("Serving", req.url, "from cache")
        return cachedResponse
    }
    try {
        console.log("Requesting", req.url)
        const response = await fetchWithTimeout(req.clone(), 10000)
        if (response.status < 400) {
            console.log("Caching request to", req.url)
            cache.put(req, response.clone())
        } else {
            console.log("Error requesting", req.url, "status", response.status)
        }
        return response
    } catch(e) {
        console.log("Error", e, "occured, sending offline page")
        return cache.match(offlinePage)
    }
}

self.addEventListener("fetch", event => {
    if (shouldRespond(event.request)) {
        event.respondWith(getResponse(event.request))
    }
})