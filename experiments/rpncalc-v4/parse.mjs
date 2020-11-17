/* make parser safe */
const debug = false;

const attempt = (parser) => (stream) => {
    if (debug) {
        console.log("attempt");
        console.log(stream);
    }
    let streamclone = [...stream];
    try {
        let out = parser(stream);
        return out;
    } catch(err) {
        return {parsed:null,stream:streamclone};
    }
}

/* chain */
const or = (a, b) => (stream) => {
    let streamclone = [...stream];
    if (debug) {
        console.log("or");
        console.log(stream);
    }
    let aout = a(stream);
    if (aout.parsed === null) {
        return b(streamclone);
    } else {
        return aout;
    }
}

/* (parser) */
const parens = (parser) => (stream) => {
    if (debug) {
        console.log("parens");
        console.log(stream);
    }
    let a = parseSyntax("(")(stream);
    if (a.parsed === null) {
        return {parsed:null, stream:a.stream};
    }
    let dat = parser(a.stream);
    let b = parseSyntax(")")(dat.stream);
    if (b.parsed === null) {
        throw 'mismatched parens!';
    }
    dat.parsed.pos.start = a.parsed.pos.start;
    dat.parsed.pos.end = b.parsed.pos.end;
    return {parsed:dat.parsed, stream:b.stream};
}

/* [parser] */
const many = (parser) => (stream) => {
    if (debug) {
        console.log("many");
        console.log(stream);
    }
    let parsed = [];
    while (true) {
        let i = parser(stream);
        stream = i.stream;
        if (i.parsed === null) {
            break;
        } else {
            parsed.push(i.parsed);
        }
    }
    let startPos = 0;
    let endPos = 0;
    if (parsed.length > 1) {
        startPos = parsed[0].pos.start;
        endPos = parsed[parsed.length-1].pos.start;
    }
    return {parsed:{arr:parsed, pos:{start:startPos, end:endPos}}, stream:stream};
}

/* takes in stream, outputs parsed item or null */
const parseIdent = (stream) => {
    if (debug) {
        console.log("ident");
        console.log(stream);
    }
    let e = stream[0];
    if (e === undefined) {
        return {parsed:null, stream:stream};
    }
    if (e.type !== "ident") {
        return {parsed:null, stream:stream};
    } else {
        stream.shift();
        return {parsed:{type:e.type, val:e.name, pos:{start:e.startPos, end:e.endPos}}, stream:stream};
    }
}

/* takes in stream, outputs parsed item or null */
const parseNum = (stream) => {
    if (debug) {
        console.log("num");
        console.log(stream);
    }
    let e = stream[0];
    if (e === undefined) {
        return {parsed:null, stream:stream};
    }
    if (e.type !== "num") {
        return {parsed:null, stream:stream};
    } else {
        stream.shift();
        return {parsed:{type:e.type, val:e.val, pos:{start:e.startPos, end:e.endPos}}, stream:stream};
    }
}

/* takes in stream, outputs parsed item or null */
const parseSyntax = (syntax) => (stream) => {
    if (debug) {
        console.log("syntax", syntax);
        console.log(stream);
    }
    let e = stream[0];
    if (e === undefined) {
        return {parsed:null, stream:stream};
    }
    if (e.type !== "syntax") {
        return {parsed:null, stream:stream};
    }
    if (e.val !== syntax) {
        return {parsed:null, stream:stream};
    } else {
        stream.shift();
        return {parsed:{type:"syntax", val:syntax, pos:{start:e.startPos, end:e.endPos}}, stream:stream};
    }
}

/* takes in stream, outputs string or null - FAILABLE */
const parseName = (stream) => {
    if (debug) {
        console.log("name");
        console.log(stream);
    }
    let id = parseIdent(stream);
    if (id.parsed === null) {
        return {parsed:null, stream:id.stream};
    }
    let syn = parseSyntax(";")(id.stream);
    if (syn.parsed === null) {
        throw 'could not parse name!'
    }
    return {parsed:{name:id.parsed.val, pos:{start:id.parsed.pos.start, end:syn.parsed.pos.end}}, stream:syn.stream};
}

const parseType = (stream) => {
    if (debug) {
        console.log("type");
        console.log(stream);
    }
    let syn = attempt(parseSyntax("\""))(stream);
    if (syn.parsed === null) {
        return {parsed:null, stream:syn.stream};
    }
    let id = or(parseIdent, parseNum)(syn.stream);
    if (id.parsed === null) {
        return {parsed:null, stream:id.stream};
    }
    return {parsed:{type:"type", val:id.parsed.val, pos:{start:syn.parsed.pos.start, end:id.parsed.pos.end}}, stream:id.stream};
}

/* takes in stream, outputs parsed item or null - FAILABLE */
const parsePush = (stream) => {
    if (debug) {
        console.log("push");
        console.log(stream);
    }
    let syn = attempt(parseSyntax("'"))(stream);
    if (syn.parsed === null) {
        return {parsed:null, stream:syn.stream};
    }
    let id = parseExpr(syn.stream);
    if (id.parsed === null) {
        return {parsed:null, stream:id.stream};
    }
    return {parsed:{type:"push", elem:id.parsed, pos:{start:syn.parsed.pos.start, end:id.parsed.pos.end}}, stream:id.stream};
}

const parseDefn = (stream) => {
    if (debug) {
        console.log("defn");
        console.log(stream);
    }
    let name = parseName(stream);
    if (name.parsed === null) {
        throw 'no name found!'
    }
    let expr = parseExprs(stream);
    if (expr.parsed === null) {
        throw 'no body found!'
    }
    return {parsed:{type:"defn", ident:name.parsed.name, defn:expr.parsed.arr, pos:{start:name.parsed.pos.start, end:expr.parsed.pos.end}}, stream:expr.stream}
}

/* takes in stream, outputs parsed item or null - FAILABLE */
const parseLambda = (stream) => {
    if (debug) {
        console.log("lambda");
        console.log(stream);
    }
    let args = many(parseIdent)(stream);
    let syn = parseSyntax("->")(args.stream);
    if (syn.parsed === null) {
        throw 'no lambda body found!';
    }
    let body = parseExprs(syn.stream); // .parsed should never be null, but anyway...
    if (body.parsed === null) {
        throw 'no lambda body found!';
    }
    return {parsed:{type:"func", args:args.parsed.arr.map(x => x.val), body:body.parsed.arr, pos:{start:args.parsed.pos.start, end:body.parsed.pos.end}}, stream:body.stream};
}

/* takes in stream, outputs parsed item or null */
const parseExpr = or(
    attempt(parens(parseDefn)), or(
    attempt(parens(parseLambda)), or(
    attempt(parseLambda), or(
    parseType, or(
    parseIdent, or(
    parseNum,
    parsePush
    ))))));

/* takes in stream, outputs parsed items */
export const parseExprs = many(parseExpr);