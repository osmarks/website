let wasm_bindgen;(function(){const __exports={};let wasm;__exports.init_context=function(){wasm.init_context();};__exports.load_defaults=function(){wasm.load_defaults();};let WASM_VECTOR_LEN=0;let cachedUint8Memory0=new Uint8Array();function getUint8Memory0(){if(cachedUint8Memory0.byteLength===0){cachedUint8Memory0=new Uint8Array(wasm.memory.buffer);}
return cachedUint8Memory0;}
const cachedTextEncoder=new TextEncoder('utf-8');const encodeString=(typeof cachedTextEncoder.encodeInto==='function'?function(arg,view){return cachedTextEncoder.encodeInto(arg,view);}:function(arg,view){const buf=cachedTextEncoder.encode(arg);view.set(buf);return{read:arg.length,written:buf.length};});function passStringToWasm0(arg,malloc,realloc){if(realloc===undefined){const buf=cachedTextEncoder.encode(arg);const ptr=malloc(buf.length);getUint8Memory0().subarray(ptr,ptr+buf.length).set(buf);WASM_VECTOR_LEN=buf.length;return ptr;}
let len=arg.length;let ptr=malloc(len);const mem=getUint8Memory0();let offset=0;for(;offset<len;offset++){const code=arg.charCodeAt(offset);if(code>0x7F)break;mem[ptr+offset]=code;}
if(offset!==len){if(offset!==0){arg=arg.slice(offset);}
ptr=realloc(ptr,len,len=offset+arg.length*3);const view=getUint8Memory0().subarray(ptr+offset,ptr+len);const ret=encodeString(arg,view);offset+=ret.written;}
WASM_VECTOR_LEN=offset;return ptr;}
let cachedInt32Memory0=new Int32Array();function getInt32Memory0(){if(cachedInt32Memory0.byteLength===0){cachedInt32Memory0=new Int32Array(wasm.memory.buffer);}
return cachedInt32Memory0;}
const cachedTextDecoder=new TextDecoder('utf-8',{ignoreBOM:true,fatal:true});cachedTextDecoder.decode();function getStringFromWasm0(ptr,len){return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr,ptr+len));}
__exports.run_program=function(program){try{const retptr=wasm.__wbindgen_add_to_stack_pointer(-16);const ptr0=passStringToWasm0(program,wasm.__wbindgen_malloc,wasm.__wbindgen_realloc);const len0=WASM_VECTOR_LEN;wasm.run_program(retptr,ptr0,len0);var r0=getInt32Memory0()[retptr/4+0];var r1=getInt32Memory0()[retptr/4+1];return getStringFromWasm0(r0,r1);}finally{wasm.__wbindgen_add_to_stack_pointer(16);wasm.__wbindgen_free(r0,r1);}};__exports.deinit_context=function(){wasm.deinit_context();};async function load(module,imports){if(typeof Response==='function'&&module instanceof Response){if(typeof WebAssembly.instantiateStreaming==='function'){try{return await WebAssembly.instantiateStreaming(module,imports);}catch(e){if(module.headers.get('Content-Type')!='application/wasm'){console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",e);}else{throw e;}}}
const bytes=await module.arrayBuffer();return await WebAssembly.instantiate(bytes,imports);}else{const instance=await WebAssembly.instantiate(module,imports);if(instance instanceof WebAssembly.Instance){return{instance,module};}else{return instance;}}}
function getImports(){const imports={};imports.wbg={};return imports;}
function initMemory(imports,maybe_memory){}
function finalizeInit(instance,module){wasm=instance.exports;init.__wbindgen_wasm_module=module;cachedInt32Memory0=new Int32Array();cachedUint8Memory0=new Uint8Array();return wasm;}
function initSync(module){const imports=getImports();initMemory(imports);if(!(module instanceof WebAssembly.Module)){module=new WebAssembly.Module(module);}
const instance=new WebAssembly.Instance(module,imports);return finalizeInit(instance,module);}
async function init(input){if(typeof input==='undefined'){let src;if(typeof document==='undefined'){src=location.href;}else{src=document.currentScript.src;}
input=src.replace(/\.js$/,'_bg.wasm');}
const imports=getImports();if(typeof input==='string'||(typeof Request==='function'&&input instanceof Request)||(typeof URL==='function'&&input instanceof URL)){input=fetch(input);}
initMemory(imports);const{instance,module}=await load(await input,imports);return finalizeInit(instance,module);}
wasm_bindgen=Object.assign(init,{initSync},__exports);})();let loaded=false
onmessage=async ev=>{if(!loaded){await wasm_bindgen("./osmarkscalculator.wasm")
loaded=true}
var[fn,...args]=ev.data
let init=false
if(fn==="deinit"){wasm_bindgen.deinit_context()
init=false}else if(fn==="run"){const start=performance.now()
try{if(!init){wasm_bindgen.init_context()
wasm_bindgen.load_defaults()
init=true;}
postMessage(["ok",wasm_bindgen.run_program(args[0]),performance.now()-start])}catch(e){postMessage(["error",e.toString(),performance.now()-start])}}}