const fs = require("fs")
const fsp = require("fs").promises
const fse = require("fs-extra")
const MarkdownIt = require("markdown-it")
const pug = require("pug")
const path = require("path")
const matter = require('gray-matter')
const mustache = require("mustache")
const globalData = require("./global.json")
const stylus = require("stylus")
const util = require("util")
const R = require("ramda")
const dayjs = require("dayjs")
const customParseFormat = require("dayjs/plugin/customParseFormat")
const nanoid = require("nanoid")

dayjs.extend(customParseFormat)
const stylusRender = util.promisify(stylus.render)

const root = path.join(__dirname, "..")
const templateDir = path.join(root, "templates")
const experimentDir = path.join(root, "experiments")
const blogDir = path.join(root, "blog")
const assetsDir = path.join(root, "assets")
const outDir = path.join(root, "out")

const buildID = nanoid()
globalData.buildID = buildID

const removeExtension = x => x.replace(/\.[^/.]+$/, "")

const readFile = path => fsp.readFile(path, { encoding: "utf8" })
const md = new MarkdownIt()
const renderMarkdown = x => md.render(x)

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

const applyTemplate = async (template, input, getOutput, options) => {
    const page = parseFrontMatter(await readFile(input))
    if (options.processMeta) { options.processMeta(page.data) }
    if (options.processContent) { page.content = options.processContent(page.content) }
    const rendered = template({ ...globalData, ...page.data, content: page.content })
    await fsp.writeFile(await getOutput(page), rendered)
    return page.data
}

const processExperiments = templates => {
    return loadDir(experimentDir, (subdirectory, basename) => {
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
}

const processBlog = templates => {
    return loadDir(blogDir, async (file, basename) => {
        return applyTemplate(templates.blogPost, file, async page => {
            const out = path.join(outDir, page.data.slug)
            await fse.ensureDir(out)
            return path.join(out, "index.html")
        }, { processMeta: meta => { meta.slug = meta.slug || removeExtension(basename) }, processContent: renderMarkdown })
    })
}

const processAssets = async templates => {
    const outAssets = path.join(outDir, "assets")
    await fse.ensureDir(outAssets)

    applyTemplate(templates.experiment, path.join(assetsDir, "offline.html"), () => path.join(outAssets, "offline.html"), {})

    // Write out the web manifest after templating it using somewhat misapplied frontend templating stuff 
    const manifest = mustache.render(await readFile(path.join(assetsDir, "manifest.webmanifest")), globalData)
    await fsp.writeFile(path.join(outAssets, "manifest.webmanifest"), manifest)

    const copyAsset = subpath => fse.copy(path.join(assetsDir, subpath), path.join(outAssets, subpath))
    // Directly copy images, JS, CSS
    await copyAsset("images")
    await copyAsset("js")
    await copyAsset("css")

    const serviceWorker = mustache.render(await readFile(path.join(assetsDir, "sw.js")), globalData)
    await fsp.writeFile(path.join(outDir, "sw.js"), serviceWorker)
}

globalData.renderDate = date => date.format("DD/MM/YYYY")

const run = async () => {
    const css = await stylusRender(await readFile(path.join(root, "style.styl")), { compress: true })
    globalData.css = css

    const templates = await loadDir(templateDir, async fullPath => pug.compile(await readFile(fullPath), { filename: fullPath }))
    const experimentsList = R.sortBy(x => x.title, R.values(await processExperiments(templates)))
    const blogList = R.sortBy(x => x.updated ? -x.updated.valueOf() : 0, R.values(await processBlog(templates)))
    await processAssets(templates)

    const index = templates.index({ ...globalData, title: "Index", experiments: experimentsList, posts: blogList })
    await fsp.writeFile(path.join(outDir, "index.html"), index)

    const rssFeed = templates.rss({ ...globalData, items: blogList, lastUpdate: new Date() })
    await fsp.writeFile(path.join(outDir, "rss.xml"), rssFeed)

    await fsp.writeFile(path.join(outDir, "buildID.txt"), buildID)
}

run()