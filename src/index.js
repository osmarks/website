const fsp = require("fs").promises
const fse = require("fs-extra")
const MarkdownIt = require("markdown-it")
const pug = require("pug")
const path = require("path")
const matter = require("gray-matter")
const mustache = require("mustache")
const globalData = require("./global.json")
const sass = require("sass")
const R = require("ramda")
const dayjs = require("dayjs")
const customParseFormat = require("dayjs/plugin/customParseFormat")
const nanoid = require("nanoid")
const htmlMinifier = require("html-minifier").minify
const terser = require("terser")
const util = require("util")
const childProcess = require("child_process")
const chalk = require("chalk")
const crypto = require("crypto")
const uuid = require("uuid")
const sqlite = require("better-sqlite3")
const axios = require("axios")
const msgpack = require("@msgpack/msgpack")
const esbuild = require("esbuild")

dayjs.extend(customParseFormat)

const root = path.join(__dirname, "..")
const templateDir = path.join(root, "templates")
const experimentDir = path.join(root, "experiments")
const blogDir = path.join(root, "blog")
const errorPagesDir = path.join(root, "error")
const assetsDir = path.join(root, "assets")
const outDir = path.join(root, "out")
const srcDir = path.join(root, "src")

const buildID = nanoid()
globalData.buildID = buildID

const randomPick = xs => xs[Math.floor(Math.random() * xs.length)]
globalData.siteDescription = randomPick(globalData.taglines)

const hexPad = x => Math.round(x).toString(16).padStart(2, "0")
function hslToRgb(h, s, l) {
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
            function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;

        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return `#${hexPad(r * 255)}${hexPad(g * 255)}${hexPad(b * 255)}`
}
const hashBG = (cls, i) => {
    const buf = crypto.createHash("md5").update(cls).digest()
    const base = (buf[0] + 256 * buf[1]) % 360
    const hue = (base + i * 37) % 360
    return `background: ${hslToRgb(hue / 360, 1, 0.9)}; background: hsl(${hue}deg, var(--autocol-saturation), var(--autocol-lightness))`
}
globalData.hashBG = hashBG

const removeExtension = x => x.replace(/\.[^/.]+$/, "")

const mdutils = MarkdownIt().utils
const renderContainer = (tokens, idx) => {
    let opening = true
    if (tokens[idx].type === "container__close") {
        let nesting = 0
        for (; tokens[idx].type !== "container__open" && nesting !== 1; idx--) {
            nesting += tokens[idx].nesting
        }
        opening = false
    }
    const m = tokens[idx].info.trim().split(" ");
    const blockType = m[0]

    const options = {}
    for (const arg of m.slice(1)) {
        const [k, v] = arg.split("=", 2)
        options[k] = v ?? true
    }

    if (opening) {
        if (blockType === "captioned") {
            const link = `<a href="${md.utils.escapeHtml(options.src)}">`
            return `<div class="${options.wide ? "caption wider" : "caption"}">${options.link ? link : ""}<img src="${md.utils.escapeHtml(options.src)}">${options.link ? "</a>" : ""}`
        }
    } else {
        if (blockType === "captioned") {
            return `</div>`
        }
    }
    throw new Error(`unrecognized blockType ${blockType}`)
}

const readFile = path => fsp.readFile(path, { encoding: "utf8" })
const anchor = require("markdown-it-anchor")
const md = new MarkdownIt({ html: true })
    .use(require("markdown-it-container"), "", { render: renderContainer, validate: params => true })
    .use(require("markdown-it-footnote"))
    .use(anchor, {
        permalink: anchor.permalink["headerLink"]({
            symbol: "§"
        })
    })
const minifyHTML = x => htmlMinifier(x, {
    collapseWhitespace: true,
    sortAttributes: true,
    sortClassName: true,
    removeRedundantAttributes: true,
    removeAttributeQuotes: true,
    conservativeCollapse: true,
    collapseBooleanAttributes: true
})
const renderMarkdown = x => md.render(x)
// basically just whitespace removal - fast and still pretty good versus unminified code
const minifyJS = (x, filename) => {
    const res = terser.minify(x, {
        mangle: true,
        compress: true,
        sourceMap: {
            filename,
            url: filename + ".map"
        }
    })
    if (res.warnings) {
        for (const warn of res.warnings) {
            console.warn("MINIFY WARNING:", warn)
        }
    }
    if (res.error) {
        console.warn("MINIFY ERROR:", res.error)
        throw new Error("could not minify " + filename)
    }
    return res
}
const minifyJSFile = (incode, filename, out) => {
    const res = minifyJS(incode, filename)
    return Promise.all([ fsp.writeFile(out, res.code), fsp.writeFile(out + ".map", res.map) ])
}

const parseFrontMatter = content => {
    const raw = matter(content)
    if (raw.data.updated) {
        raw.data.updated = dayjs(raw.data.updated, "DD/MM/YYYY")
    }
    if (raw.data.created) {
        raw.data.created = dayjs(raw.data.created, "DD/MM/YYYY")
    }
    if (raw.data.created && !raw.data.updated) { raw.data.updated = raw.data.created }
    return raw
}

const loadDir = async (dir, func) => {
    const files = await fsp.readdir(dir)
    const out = {}
    await Promise.all(files.map(async file => {
        out[removeExtension(file)] = await func(path.join(dir, file), file)
    }))
    return out
}

const applyTemplate = async (template, input, getOutput, options = {}) => {
    const page = parseFrontMatter(await readFile(input))
    if (options.processMeta) { options.processMeta(page.data, page) }
    if (options.processContent) { page.originalContent = page.content; page.content = options.processContent(page.content) }
    const rendered = template({ ...globalData, ...page.data, content: page.content })
    await fsp.writeFile(await getOutput(page), minifyHTML(rendered))
    page.data.full = page
    return page.data
}

const addGuids = R.map(x => ({ ...x, guid: uuid.v5(`${x.lastUpdate}:${x.slug}`, "9111a1fc-59c3-46f0-9ab4-47c607a958f2") }))

const processExperiments = async () => {
    const templates = globalData.templates
    const experiments = await loadDir(experimentDir, (subdirectory, basename) => {
        return applyTemplate(
            templates.experiment,
            path.join(subdirectory, "index.html"),
            async page => {
                const out = path.join(outDir, page.data.slug)
                await fse.ensureDir(out)
                const allFiles = await fsp.readdir(subdirectory)
                await Promise.all(allFiles.map(file => {
                    if (file !== "index.html") {
                        return fse.copy(path.join(subdirectory, file), path.join(out, file))
                    }
                }))
                return path.join(out, "index.html")
            },
            { processMeta: meta => {
                meta.slug = meta.slug || basename
            }})
    })
    console.log(chalk.yellow(`${Object.keys(experiments).length} experiments`))
    globalData.experiments = R.sortBy(x => x.title, R.values(experiments))
}

const processBlog = async () => {
    const templates = globalData.templates
    const blog = await loadDir(blogDir, async (file, basename) => {
        return applyTemplate(templates.blogPost, file, async page => {
            const out = path.join(outDir, page.data.slug)
            await fse.ensureDir(out)
            return path.join(out, "index.html")
        }, { processMeta: (meta, page) => {
            meta.slug = meta.slug || removeExtension(basename)
            meta.wordCount = page.content.split(/\s+/).map(x => x.trim()).filter(x => x).length
            meta.haveSidenotes = true
        }, processContent: renderMarkdown })
    })
    console.log(chalk.yellow(`${Object.keys(blog).length} blog entries`))
    globalData.blog = addGuids(R.filter(x => !x.draft, R.sortBy(x => x.updated ? -x.updated.valueOf() : 0, R.values(blog))))
}

const processErrorPages = () => {
    const templates = globalData.templates
    return loadDir(errorPagesDir, async (file, basename) => {
        return applyTemplate(templates.experiment, file, async page => {
            return path.join(outDir, basename)
        })
    })
}

const outAssets = path.join(outDir, "assets")

globalData.renderDate = date => date.format(globalData.dateFormat)
const metricPrefixes = ["", "k", "M", "G", "T", "P", "E", "Z", "Y"]
const applyMetricPrefix = (x, unit) => {
    let log = Math.log10(x)
    let exp = x !== 0 ? Math.floor(log / 3) : 0
    let val = x / Math.pow(10, exp * 3)
    return (exp !== 0 ? val.toFixed(3 - (log - exp * 3)) : val) + metricPrefixes[exp] + unit
}
globalData.metricPrefix = applyMetricPrefix

const writeBuildID = () => fsp.writeFile(path.join(outDir, "buildID.txt"), buildID)

const index = async () => {
    const index = globalData.templates.index({ ...globalData, title: "Index", posts: globalData.blog, description: globalData.siteDescription })
    await fsp.writeFile(path.join(outDir, "index.html"), index)
}

const cache = sqlite("cache.sqlite3")
cache.exec("CREATE TABLE IF NOT EXISTS cache (k TEXT NOT NULL PRIMARY KEY, v BLOB NOT NULL, ts INTEGER NOT NULL)")
const writeCacheStmt = cache.prepare("INSERT OR REPLACE INTO cache VALUES (?, ?, ?)")
const readCacheStmt = cache.prepare("SELECT * FROM cache WHERE k = ?")
const readCache = (k, maxAge=null, ts=null) => {
    const row = readCacheStmt.get(k)
    if (!row) return
    if ((maxAge && row.ts < (Date.now() - maxAge) || (ts && row.ts != ts))) return
    return msgpack.decode(row.v)
}
const writeCache = (k, v, ts=Date.now()) => {
    const enc = msgpack.encode(v)
    writeCacheStmt.run(k, Buffer.from(enc.buffer, enc.byteOffset, enc.byteLength), ts)
}

const fetchMicroblog = async () => {
    const cached = readCache("microblog", 60*60*1000)
    if (cached) {
        globalData.microblog = cached
    } else {
        const posts = (await axios({ url: globalData.microblogSource, headers: { "Accept": 'application/ld+json; profile="https://www.w3.org/ns/activitystreams"' } })).data.orderedItems
        writeCache("microblog", posts)
        globalData.microblog = posts
    }
    
    globalData.microblog = globalData.microblog.slice(0, 6).map((post, i) => minifyHTML(globalData.templates.activitypub({
        ...globalData,
        permalink: post.object.id,
        date: dayjs(post.object.published),
        content: post.object.content,
        i
    })))
    
}

const runOpenring = async () => {
    const cached = readCache("openring", 60*60*1000)
    if (cached) { globalData.openring = cached; return }
    // wildly unsafe but only runs on input from me anyway
    const arg = `./openring -n6 ${globalData.feeds.map(x => '-s "' + x + '"').join(" ")} < openring.html`
    console.log(chalk.keyword("orange")("Openring:") + " " + arg)
    const out = await util.promisify(childProcess.exec)(arg)
    console.log(chalk.keyword("orange")("Openring:") + "\n" + out.stderr.trim())
    globalData.openring = minifyHTML(out.stdout)
    writeCache("openring", globalData.openring)
}

const compileCSS = async () => {
    let css = sass.renderSync({
        data: await readFile(path.join(srcDir, "style.sass")),
        outputStyle: "compressed",
        indentedSyntax: true
    }).css
    css += "\n"
    css += await fsp.readFile(path.join(srcDir, "comments.css"))
    globalData.css = css
}

const loadTemplates = async () => {
    globalData.templates = await loadDir(templateDir, async fullPath => pug.compile(await readFile(fullPath), { filename: fullPath }))
}

const genRSS = async () => {
    const rssFeed = globalData.templates.rss({ ...globalData, items: globalData.blog, lastUpdate: new Date() })
    await fsp.writeFile(path.join(outDir, "rss.xml"), rssFeed)
}

const genManifest = async () => {
    const m = mustache.render(await readFile(path.join(assetsDir, "manifest.webmanifest")), globalData)
    fsp.writeFile(path.join(outAssets, "manifest.webmanifest"), m)
}

const minifyJSTask = async () => {
    const jsDir = path.join(assetsDir, "js")
    const jsOutDir = path.join(outAssets, "js")
    await Promise.all((await fsp.readdir(jsDir)).map(async file => {
        const fullpath = path.join(jsDir, file)
        await minifyJSFile(await readFile(fullpath), file, path.join(jsOutDir, file))
    }))
}

const compilePageJSTask = async () => {
    await esbuild.build({
        entryPoints: [ path.join(srcDir, "page.js") ],
        bundle: true,
        outfile: path.join(outAssets, "js/page.js"),
        minify: true,
        sourcemap: true
    })
}

const genServiceWorker = async () => {
    const serviceWorker = mustache.render(await readFile(path.join(assetsDir, "sw.js")), globalData)
    await minifyJSFile(serviceWorker, "sw.js", path.join(outDir, "sw.js"))
}

const copyAsset = subpath => fse.copy(path.join(assetsDir, subpath), path.join(outAssets, subpath))

const doImages = async () => {
    copyAsset("images")
    copyAsset("titillium-web.woff2")
    copyAsset("titillium-web-semibold.woff2")
    copyAsset("share-tech-mono.woff2")
    globalData.images = {}
    await Promise.all(
        (await fse.readdir(path.join(assetsDir, "images"), { encoding: "utf-8" })).map(async image => {
            if (image.endsWith(".original")) { // generate alternative formats
                const stripped = image.replace(/\.original$/).split(".").slice(0, -1).join(".")
                const fullPath = path.join(assetsDir, "images", image)
                const stat = await fse.stat(fullPath)
                const writeFormat = async (name, ext, cmd, supplementaryArgs, suffix="") => {
                    let bytes = readCache(`images/${stripped}/${name}`, null, stat.mtimeMs)
                    const destFilename = stripped + ext
                    const destPath = path.join(outAssets, "images", destFilename)
                    if (!bytes) {
                        console.log(chalk.keyword("orange")(`Compressing image ${stripped} (${name})`))
                        await util.promisify(childProcess.execFile)(cmd, supplementaryArgs.concat([
                            fullPath,
                            destPath
                        ]))
                        writeCache(`images/${stripped}/${name}`, await fsp.readFile(destPath), stat.mtimeMs)
                    } else {
                        await fsp.writeFile(destPath, bytes)
                    }
                    
                    return "/assets/images/" + destFilename
                }
                const avif = await writeFormat("avif", ".avif", "avifenc", ["-s", "0", "-q", "20"], " 2x")
                const avifc = await writeFormat("avif-compact", ".c.avif", path.join(srcDir, "avif_compact.sh"), [])
                const jpeg = await writeFormat("jpeg-scaled", ".jpg", "_fallback", "convert", ["-resize", "25%", "-format", "jpeg"])
                globalData.images[stripped] = [
                    ["image/avif", `${avifc}, ${avif} 2x`],
                    ["_fallback", jpeg]
                ]
            } else {
                globalData.images[image.split(".").slice(0, -1).join(".")] = "/assets/images/" + image
            }
        })
    )
}

const tasks = {
    errorPages: { deps: ["pagedeps"], fn: processErrorPages },
    templates: { deps: [], fn: loadTemplates },
    pagedeps: { deps: ["templates", "css"] },
    css: { deps: [], fn: compileCSS },
    writeBuildID: { deps: [], fn: writeBuildID },
    index: { deps: ["openring", "pagedeps", "blog", "experiments", "images", "fetchMicroblog"], fn: index },
    openring: { deps: [], fn: runOpenring },
    rss: { deps: ["blog"], fn: genRSS },
    blog: { deps: ["pagedeps"], fn: processBlog },
    fetchMicroblog: { deps: ["templates"], fn: fetchMicroblog },
    experiments: { deps: ["pagedeps"], fn: processExperiments },
    assetsDir: { deps: [], fn: () => fse.ensureDir(outAssets) },
    manifest: { deps: ["assetsDir"], fn: genManifest },
    minifyJS: { deps: ["assetsDir"], fn: minifyJSTask },
    compilePageJS: { deps: ["assetsDir"], fn: compilePageJSTask },
    serviceWorker: { deps: [], fn: genServiceWorker },
    images: { deps: ["assetsDir"], fn: doImages },
    offlinePage: { deps: ["assetsDir", "pagedeps"], fn: () => applyTemplate(globalData.templates.experiment, path.join(assetsDir, "offline.html"), () => path.join(outAssets, "offline.html"), {}) },
    assets: { deps: ["manifest", "minifyJS", "serviceWorker", "images", "compilePageJS"] },
    main: { deps: ["writeBuildID", "index", "errorPages", "assets", "experiments", "blog", "rss"] }
}

const compile = async () => {
    const done = new Set()
    const inProgress = new Set()
    const go = async finished => {
        if (finished) {
            inProgress.delete(finished)
            done.add(finished)
            console.log(`[${done.size}/${Object.keys(tasks).length}] ` + chalk.green(`Done ${finished}`))
        }
        for (const [task, conf] of Object.entries(tasks)) {
            if (!inProgress.has(task) && !done.has(task) && conf.deps.every(x => done.has(x))) { // dependencies now satisfied for task, execute it
                inProgress.add(task)
                const callback = () => go(task)
                if (conf.fn) {
                    console.log(chalk.cyanBright(`Executing ${task}`))
                    Promise.resolve(conf.fn()).then(callback, err => {
                        console.error(`Error in ${task}: ${err.stack}`)
                        process.exit(1)
                    })
                } else {
                    setImmediate(callback)
                }
            }
        }
    }
    go()
}
compile()