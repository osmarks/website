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

dayjs.extend(customParseFormat)

const root = path.join(__dirname, "..")
const templateDir = path.join(root, "templates")
const experimentDir = path.join(root, "experiments")
const blogDir = path.join(root, "blog")
const errorPagesDir = path.join(root, "error")
const assetsDir = path.join(root, "assets")
const outDir = path.join(root, "out")

const buildID = nanoid()
globalData.buildID = buildID

const removeExtension = x => x.replace(/\.[^/.]+$/, "")

const readFile = path => fsp.readFile(path, { encoding: "utf8" })
const md = new MarkdownIt()
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
    if (options.processMeta) { options.processMeta(page.data) }
    if (options.processContent) { page.content = options.processContent(page.content) }
    const rendered = template({ ...globalData, ...page.data, content: page.content })
    await fsp.writeFile(await getOutput(page), minifyHTML(rendered))
    return page.data
}

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
            { processMeta: meta => { meta.slug = meta.slug || basename }})
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
        }, { processMeta: meta => { meta.slug = meta.slug || removeExtension(basename) }, processContent: renderMarkdown })
    })
    console.log(chalk.yellow(`${Object.keys(blog).length} blog entries`))
    globalData.blog = R.sortBy(x => x.updated ? -x.updated.valueOf() : 0, R.values(blog))
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

globalData.renderDate = date => date.format("DD/MM/YYYY")

const writeBuildID = () => fsp.writeFile(path.join(outDir, "buildID.txt"), buildID)
const index = async () => {
    const index = globalData.templates.index({ ...globalData, title: "Index", posts: globalData.blog })
    await fsp.writeFile(path.join(outDir, "index.html"), index)
}
const compileCSS = async () => {
    const css = sass.renderSync({
        data: await readFile(path.join(root, "style.sass")),
        outputStyle: "compressed",
        indentedSyntax: true
    }).css
    globalData.css = css
}
const loadTemplates = async () => {
    globalData.templates = await loadDir(templateDir, async fullPath => pug.compile(await readFile(fullPath), { filename: fullPath }))
}
const runOpenring = async () => {
    // wildly unsafe but only runs on input from me anyway
    const arg = `./openring -n6 ${globalData.feeds.map(x => '-s "' + x + '"').join(" ")} < openring.html`
    console.log(chalk.keyword("orange")("Openring:") + " " + arg)
    const out = await util.promisify(childProcess.exec)(arg)
    console.log(chalk.keyword("orange")("Openring:") + "\n" + out.stderr.trim())
    globalData.openring = minifyHTML(out.stdout)
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
const genServiceWorker = async () => {
    const serviceWorker = mustache.render(await readFile(path.join(assetsDir, "sw.js")), globalData)
    await minifyJSFile(serviceWorker, "sw.js", path.join(outDir, "sw.js"))
}
const copyAsset = subpath => fse.copy(path.join(assetsDir, subpath), path.join(outAssets, subpath))

const tasks = {
    errorPages: { deps: ["pagedeps"], fn: processErrorPages },
    templates: { deps: [], fn: loadTemplates },
    pagedeps: { deps: ["templates", "css"] },
    css: { deps: [], fn: compileCSS },
    writeBuildID: { deps: [], fn: writeBuildID },
    index: { deps: ["openring", "pagedeps", "blog", "experiments"], fn: index },
    openring: { deps: [], fn: runOpenring },
    rss: { deps: ["blog"], fn: genRSS },
    blog: { deps: ["pagedeps"], fn: processBlog },
    experiments: { deps: ["pagedeps"], fn: processExperiments },
    assetsDir: { deps: [], fn: () => fse.ensureDir(outAssets) },
    manifest: { deps: ["assetsDir"], fn: genManifest },
    minifyJS: { deps: ["assetsDir"], fn: minifyJSTask },
    serviceWorker: { deps: [], fn: genServiceWorker },
    images: { deps: ["assetsDir"], fn: () => copyAsset("images") },
    offlinePage: { deps: ["assetsDir", "pagedeps"], fn: () => applyTemplate(globalData.templates.experiment, path.join(assetsDir, "offline.html"), () => path.join(outAssets, "offline.html"), {}) },
    assets: { deps: ["manifest", "minifyJS", "serviceWorker", "images"] },
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