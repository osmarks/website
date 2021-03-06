import {defnOp, makeOp, defn} from './shiny.mjs';
import {parseExprs} from './parse.mjs';
import {tokenize} from './token.mjs';

const objEq = (a, b) => {
    if (typeof a !== 'object' && typeof b !== 'object') {
        return a === b;
    } else if (typeof a !== 'object' || typeof b !== 'object') {
        return false;
    } else {
        const aprop = Object.getOwnPropertyNames(a);
        const bprop = Object.getOwnPropertyNames(b);

        if (bprop.length !== aprop.length) {
            return false;
        }

        for (let i = 0; i < aprop.length; i++) {
            if (!objEq(a[aprop[i]], b[aprop[i]])) {
                return false;
            }
        }

        return true;
    }
}

export let scope = {};

export const customHandler = (ins) => {
    return [ins];
}

const addRPNDefn = (name, def) => {
    let toks = tokenize(def);
    if (!toks) {
        throw 'could not load builtin'
    }
    toks = toks.map(elem => {
        elem.startPos = 0;
        elem.endPos = 0;
        return elem;
    });
    let ast = parseExprs(toks);
    if (!ast.parsed) {
        throw 'could not load builtin'
    }
    scope = defn(name, ast.parsed.arr, scope);
}

const assertType = (type) => (elem) => {
    if (elem.type !== type) {
        throw 'typeerror'
    }
}

const addDefn = (name, args, fn) => {
    if (Array.isArray(args)) {
        const nargs = [...Array(args.length).keys()];
        const liftFn = (scope) => {
            let newscope = Object.create(scope);
            for (let i = 0; i < args.length; i++) {
                assertType(args[i])(scope[i][0]);
                newscope[i] = scope[i][0].val;
            }
            return fn(newscope);
        }
        const op = makeOp(nargs, liftFn);
        defnOp(name, op);
    } else {
        const nargs = [...Array(args).keys()];
        const liftFn = (scope) => {
            let newscope = Object.create(scope);
            for (let i = 0; i < args; i++) {
                newscope[i] = scope[i][0];
            }
            return fn(newscope);
        }
        const op = makeOp(nargs, liftFn);
        defnOp(name, op);
    }
}

const addBinopDefn = (name, op) => addDefn(name, ["num", "num"], args => [{ type: "num", val: op(args[0], args[1]) }])
const addUnopDefn = (name, op) => addDefn(name, ["num"], args => [{ type: "num", val: op(args[0]) }])
const addConstDefn = (name, val) => addDefn(name, [], args => [{ type: "num", val }])

const type = (args) => [{type:"type", val:args[0].type}];
const pair = (args) => [{type:"pair", val:{fst:args[0], snd:args[1]}}];
const fst = (args) => [args[0].fst];
const snd = (args) => [args[0].snd];
const tuple = (args) => makeOp([...Array(args[0]).keys()], (args) => {return [{type:"tuple", val:args}]});
const index = (args) => args[0][args[1]];
const len = (args) => [{type:"num", val:args[0].length}];

const eq = (args) => {
    if (args[2].type === args[3].type && objEq(args[2].val, args[3].val)) {
        return [args[0]];
    } else {
        return [args[1]];
    }
}

addBinopDefn("+", (x, y) => x + y)
addBinopDefn("-", (x, y) => x - y)
addBinopDefn("/", (x, y) => x / y)
addBinopDefn("*", (x, y) => x * y)
addBinopDefn("%", (x, y) => x % y)
addBinopDefn("^", Math.pow)
addBinopDefn("atan2", Math.atan2)
for (const func of ["abs", "floor", "log", "asin", "acos", "atan", "sin", "cos", "tan", "exp", "cbrt", "ceil", "sqrt"]) {
    addUnopDefn(func, Math[func])
}
addConstDefn("e", Math.E)
addConstDefn("pi", Math.PI)

addDefn("==", 4, eq);
addDefn("pair", 2, pair);
addDefn("fst", ["pair"], fst);
addDefn("snd", ["pair"], snd);
addDefn("tuple", ["num"], tuple);
addDefn("!!", ["tuple", "num"], index);
addDefn("len", ["tuple"], len);
addDefn("typeof", 1, type);
addRPNDefn("stop", "\"stop");
addRPNDefn("inv", "(x -> 1 x /)");
addRPNDefn("fold", "(x acc fn -> acc '(-> x acc fn 'fn fold) 'x stop ==)");
addRPNDefn("range", "(x y -> x '(->x x 1 + y range) 'x y ==)");
addRPNDefn("listthen", "(fn -> (internal; x acc -> '(->acc fn) '(->x acc pair internal) x stop ==) 0 tuple internal)");
addRPNDefn("list", "'(a -> a) listthen");
addRPNDefn("lmap", "(list fn -> list '(->list fst fn list snd 'fn lmap pair) list 0 tuple ==)");
addRPNDefn("unlist", "(l -> (internal; list -> '(->) '(->list fst list snd internal) list 0 tuple ==) stop l internal)");
addRPNDefn("map", "fn -> '(l->l 'fn lmap unlist) listthen");
addRPNDefn("hypot", "(a b -> a a * b b * + sqrt)")
addRPNDefn("swap", "(a b -> b a)")