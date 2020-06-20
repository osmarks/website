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
const { minify } = require("html-minifier")

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

const processErrorPages = templates => {
    return loadDir(errorPagesDir, async (file, basename) => {
        return applyTemplate(templates.experiment, file, async page => {
            return path.join(outDir, basename)
        })
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
    await Promise.all([await copyAsset("images"), await copyAsset("css")])
    
    const jsDir = path.join(assetsDir, "js")
    const jsOutDir = path.join(outAssets, "js")
    await Promise.all((await fsp.readdir(jsDir)).map(async file => {
        const fullpath = path.join(jsDir, file)
        await minifyJSFile(await readFile(fullpath), file, path.join(jsOutDir, file))
    }))

    const serviceWorker = mustache.render(await readFile(path.join(assetsDir, "sw.js")), globalData)
    await minifyJSFile(serviceWorker, "sw.js", path.join(outDir, "sw.js"))
}

globalData.renderDate = date => date.format("DD/MM/YYYY")

const run = async () => {
    const css = await sass.renderSync({
        data: await readFile(path.join(root, "style.sass")),
        outputStyle: "compressed",
        indentedSyntax: true
    }).css
    globalData.css = css

    const templates = await loadDir(templateDir, async fullPath => pug.compile(await readFile(fullPath), { filename: fullPath }))
    const experimentsList = R.sortBy(x => x.title, R.values(await processExperiments(templates)))
    const blogList = R.sortBy(x => x.updated ? -x.updated.valueOf() : 0, R.values(await processBlog(templates)))
    await processAssets(templates)
    await processErrorPages(templates)

    const index = templates.index({ ...globalData, title: "Index", experiments: experimentsList, posts: blogList })
    await fsp.writeFile(path.join(outDir, "index.html"), index)

    const rssFeed = templates.rss({ ...globalData, items: blogList, lastUpdate: new Date() })
    await fsp.writeFile(path.join(outDir, "rss.xml"), rssFeed)

    await fsp.writeFile(path.join(outDir, "buildID.txt"), buildID)
}

run()
