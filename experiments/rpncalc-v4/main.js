import {execRPN, step} from './shiny.mjs';
import {parseExprs} from './parse.mjs';
import {tokenize} from './token.mjs';
import {scope, customHandler} from './builtin.mjs';

//const scope = {};
//const customHandler = a => [a];

const inbox = document.getElementById("inbox")
const insbox = document.getElementById("insbox")
const outbox = document.getElementById("outbox")
const stepb = document.getElementById("step")
const play = document.getElementById("play")
const load = document.getElementById("load")

const usestd = document.getElementById("use-std")

let state = null;
let input = null;

const highlight = (str, start, end, color) => {
    return str.slice(0, start) + `<span style='background-color:${color}'>` + str.slice(start, end) + "</span>" + str.slice(end);
}

const loadState = () => {
    input = inbox.value;
    let toks = tokenize(input);
    let ast = parseExprs(toks);
    console.log(ast);
    if (ast.parsed === null) {
        insbox.innerHTML = "could not parse AST!"
    } else if (ast.stream.length !== 0) {
        insbox.innerHTML = highlight(input, ast.stream[0].startPos, ast.stream[0].endPos, "red");
        insbox.innerHTML += "<br>unexpected token"
        input = null;
        state = null;
        return;
    }
    insbox.innerHTML = input;
    outbox.innerHTML = "";
    if (usestd.checked) {
        state = {scopes:[scope], stacks:[[]], calls:[ast.parsed.arr]};
    } else {
        state = {scopes:[{}], stacks:[[]], calls:[ast.parsed.arr]};
    }
}

const showIns = (ins) => {
    if (ins.val) {
        return ins.val;
    } else if (ins.ident) {
        return ins.ident;
    } else if (ins.name) {
        return ins.name;
    } else {
        return 'anon';
    }
}

load.onclick = _ => {
    loadState();
}

play.onclick = _ => {
    if (state === null) {
        loadState();
    }
    insbox.innerHTML = "";
    while (state.calls[0].length > 0 || state.calls.length > 1) {
        try {
            step(state, customHandler, showIns);
        } catch (err) {
            insbox.innerHTML = err;
            state = null;
            input = null;
            return;
        }
    }
    outbox.innerHTML = prettyprint(state.stacks[0]);
    state = null;
    input = null;
}

// TODO: Actually deal with horrible XSS problems. It seems to be safe for now due to string literals being bad, at least.
// It may be possible to do JSF[REDACTED]k-style things to get around this, though.
stepb.onclick = _ => {
    if (state === null) {
        return;
    }
    if (state.calls[0].length > 0 || state.calls.length > 1) {
        let pos;
        try {
            pos = step(state, customHandler, showIns);
        } catch (err) {
            insbox.innerHTML = err;
            state = null;
            input = null;
            return;
        }
        if (!(pos.start === 0 && pos.end === 0)) {
            insbox.innerHTML = highlight(input, pos.start, pos.end, "green");
        }
        let out = []
        let emptyCounter = 0
        for (const stack of state.stacks) {
            if (stack.length === 0) {
                emptyCounter += 1
            } else {
                if (emptyCounter !== 0) {
                    out.push(`[empty x${emptyCounter}]`)
                    emptyCounter = 0
                }
                out.push(prettyprint(stack))
            }
        }
        if (emptyCounter !== 0) {
            out.push(`[empty x${emptyCounter}]`)
        }
        outbox.innerHTML = out.join("<br>")
    }
}

const show = (elem) => {
    if (elem.type === "pair") {
        return "{" + show(elem.val.fst) + ", " + show(elem.val.snd) + "}"
    } else if (elem.type === "closure") {
        return "(needs " + elem.val.args.length + ")"
    } else if (elem.type === "array") {
        return "[" + prettyprint(elem.val) + "]"
    } else {
        return "(" + elem.val + ": " + elem.type + ")"
    }
}

const prettyprint = (out) => {
    let str = "";
    for (let i = 0; i < out.length; i++) {
        str += show(out[i]);
        if (i < out.length - 1) {
            str += " ";
        }
    }
    return str;
}