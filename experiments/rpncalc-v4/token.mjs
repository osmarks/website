const tokens = (stream) => {
    let toks = [];
    let currTok = {startPos:0, val:"", type:"str", endPos:0};
    for (let i = 0; i < stream.length; i++) {
        if ("()';\"".includes(stream[i])) {
            if (currTok.val !== "") {
                currTok.endPos = i;
                toks.push(currTok);
            }
            toks.push({startPos:i, endPos:i+1, val:stream[i], type:"syntax"});
            currTok = {startPos:i+1, val:"", type:"str"};
        } else if (stream[i] === "-") {
            if (stream[i+1] === ">") {
                if (currTok.val !== "") {
                    currTok.endPos = i;
                    toks.push(currTok);
                }
                toks.push({startPos:i, endPos:i+1, val:"->", type:"syntax"});
                i++;
                currTok = {startPos:i+1, val:"", type:"str"};
            } else {
                currTok.val += "-";
            }
        } else if (/\s/.test(stream[i])) {
            if (currTok.val !== "") {
                currTok.endPos = i;
                toks.push(currTok);
            }
            currTok = {startPos:i+1, val:"", type:"str"};
        } else {
            currTok.val += stream[i];
        }
    }
    if (currTok.val !== "") {
        currTok.endPos = stream.length;
        toks.push(currTok);
    }
    return toks;
}

const classify = (tokens) => {
    return tokens.map(tok => {
        if (tok.type === "str") {
            if (!isNaN(tok.val)) {
                return {startPos:tok.startPos, endPos:tok.endPos, val:Number(tok.val), type:"num"};
            } else {
                return {startPos:tok.startPos, endPos:tok.endPos, name:tok.val, type:"ident"};
            }
        } else {
            return tok;
        }
    });
}

export const tokenize = (stream) => {
    return classify(tokens(stream));
}