/*
EVAL.js
-------

reads exprs from AST and executes them

types of elem:
all have type
all have val

TYPE        VAL
"closure"   {scope:{}, args:['x', 'y'], defn:<function-like>}

<function-like>:
{type:"ins", ins:[]}
{type:"builtin", fn:(scope) => {stack}}

exported functionality:
defnOp(name, function) - define a built-in operator
defn(name, ins, scope) - extend scope with AST
makeOp(name, args, fn) - lift a function to an operator
evalRPN(scope, ast)
*/

let builtins = {};

export const defnOp = (name, data) => {
    builtins[name] = data;
}

export const defn = (name, ins, scope) => {
    let defscope = Object.create(scope);
    let fnForm = {type:"closure", val:{scope:defscope, args:[], defn:{type:"ins", ins:ins}}};
    defscope[name] = [fnForm];
    let out = execRPN(defscope, ins);
    defscope[name] = out.stacks[0];
    return defscope;
}

export const makeOp = (args, fn) => {
    return [{type:"closure", val:{scope:{}, args:args, defn:{type:"builtin", fn:fn}}}];
}

const lookup = (name, scope) => {
    let n = scope[name];
    if (n) {
        return n;
    }
    n = builtins[name];
    if (n) {
        return n;
    }
    console.log(scope);
    throw '"' + name + '" not in scope'
}

const extend = (scope, name, elems) => {
    let o = Object.create(scope);
    o[name] = elems;
    return o;
}

const runFn = (defn, state) => {
    if (defn.type === "ins") {
        state.calls.push(defn.ins);
        state.stacks.push([]);
    } else if (defn.type === "builtin") {
        let scope = state.scopes[state.scopes.length-1];
        let out = defn.fn(scope);
        state.calls.push([]);
        state.stacks.push(out);
    }
}

const giveArg = (arg, elem) => {
    let argN = elem.val.args[elem.val.args.length-1];
    let newscope = extend(elem.val.scope, argN, [arg]);
    return {type:elem.type, val:{scope:newscope, args:elem.val.args.slice(0,-1), defn:elem.val.defn}};
}

const apply = (elem, state) => {
    if (elem.type === "closure") {
        if (elem.val.args.length === 0) {
            state.scopes.push(elem.val.scope);
            runFn(elem.val.defn, state);
        } else if (state.stacks[state.stacks.length-1].length > 0) {
            apply(giveArg(state.stacks[state.stacks.length-1].pop(), elem), state);
        } else {
            state.stacks[state.stacks.length-1].push(elem);
        }
    } else {
        state.stacks[state.stacks.length-1].push(elem);
    }
}

const applyMany = (elems, state) => {
    for (let i = 0; i < elems.length; i++) {
        apply(elems[i], state);
    }
}

const makeStackElems = (ins, state, handler) => {
    if (ins.type === "push") {
        throw 'nested push error'
    } else if (ins.type === "ident") {
        return lookup(ins.val, state.scopes[state.scopes.length-1]);
    } else if (ins.type === "func") {
        return [{type:"closure", val:{scope:state.scopes[state.scopes.length-1], args:ins.args, defn:{type:"ins", ins:ins.body}}}];
    } else {
        return handler(ins);
    }
}

const doIns = (ins, state, handler) => {
    if (ins.type === "push") {
        state.stacks[state.stacks.length-1] = state.stacks[state.stacks.length-1].concat(makeStackElems(ins.elem, state, handler));
    } else if (ins.type === "defn") {
        state.scopes[state.scopes.length-1] = defn(ins.ident, ins.defn, state.scopes[state.scopes.length-1]);
    } else {
        applyMany(makeStackElems(ins, state, handler), state);
    }
}

export const step = (state, handler, showIns, maxdepth) => {
    if (state.stacks.length > maxdepth) {
        throw 'max recursion depth exceeded'
    }
    if (state.calls[state.calls.length-1].length === 0) {
        if (state.calls.length === 1) {
            throw 'finished execution'
        }
        if (state.stacks.length < 2) {
            throw 'nothing to return'
        }
        state.calls.pop();
        state.scopes.pop();
        let out = state.stacks.pop();
        applyMany(out, state);
        return {start:0, end:0};
    } else {
        let ins = state.calls[state.calls.length-1][0];
        state.calls[state.calls.length-1] = state.calls[state.calls.length-1].slice(1);
        try {
            doIns(ins, state, handler);
        } catch (error) {
            throw error + ' while executing "' + showIns(ins) + '"'
        }
        return ins.pos;
    }
}

export const execRPN = (scope, ins, handler=(x)=>[x], showIns=(x)=>x.name, maxdepth=16384) => {
    let state = {scopes:[scope], stacks:[[]], calls:[ins]};
    while (state.calls[0].length > 0 || state.calls.length > 1) {
        step(state, handler, showIns, maxdepth);
    }
    return state;
}