(()=>{var i,d=new Array(128).fill(void 0);d.push(void 0,null,!0,!1);function c(n){return d[n]}var x=d.length;function U(n){n<132||(d[n]=x,x=n)}function W(n){let e=c(n);return U(n),e}function u(n){x===d.length&&d.push(d.length+1);let e=x;return x=d[e],d[e]=n,e}var M=typeof TextDecoder<"u"?new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0}):{decode:()=>{throw Error("TextDecoder not available")}};typeof TextDecoder<"u"&&M.decode();var p=null;function m(){return(p===null||p.byteLength===0)&&(p=new Uint8Array(i.memory.buffer)),p}function b(n,e){return n=n>>>0,M.decode(m().subarray(n,n+e))}function w(n){return n==null}var A=null;function C(){return(A===null||A.byteLength===0)&&(A=new Float64Array(i.memory.buffer)),A}var E=null;function l(){return(E===null||E.byteLength===0)&&(E=new Int32Array(i.memory.buffer)),E}function T(n){let e=typeof n;if(e=="number"||e=="boolean"||n==null)return`${n}`;if(e=="string")return`"${n}"`;if(e=="symbol"){let o=n.description;return o==null?"Symbol":`Symbol(${o})`}if(e=="function"){let o=n.name;return typeof o=="string"&&o.length>0?`Function(${o})`:"Function"}if(Array.isArray(n)){let o=n.length,_="[";o>0&&(_+=T(n[0]));for(let a=1;a<o;a++)_+=", "+T(n[a]);return _+="]",_}let t=/\[object ([^\]]+)\]/.exec(toString.call(n)),r;if(t.length>1)r=t[1];else return toString.call(n);if(r=="Object")try{return"Object("+JSON.stringify(n)+")"}catch{return"Object"}return n instanceof Error?`${n.name}: ${n.message}
${n.stack}`:r}var g=0,v=typeof TextEncoder<"u"?new TextEncoder("utf-8"):{encode:()=>{throw Error("TextEncoder not available")}},F=typeof v.encodeInto=="function"?function(n,e){return v.encodeInto(n,e)}:function(n,e){let t=v.encode(n);return e.set(t),{read:n.length,written:t.length}};function h(n,e,t){if(t===void 0){let s=v.encode(n),y=e(s.length,1)>>>0;return m().subarray(y,y+s.length).set(s),g=s.length,y}let r=n.length,o=e(r,1)>>>0,_=m(),a=0;for(;a<r;a++){let s=n.charCodeAt(a);if(s>127)break;_[o+a]=s}if(a!==r){a!==0&&(n=n.slice(a)),o=t(o,r,r=a+n.length*3,1)>>>0;let s=m().subarray(o+a,o+r),y=F(n,s);a+=y.written}return g=a,o}function L(n,e,t,r){let o={a:n,b:e,cnt:1,dtor:t},_=(...a)=>{o.cnt++;let s=o.a;o.a=0;try{return r(s,o.b,...a)}finally{--o.cnt===0?i.__wbindgen_export_2.get(o.dtor)(s,o.b):o.a=s}};return _.original=o,_}function S(n,e){let t=e(n.length*1,1)>>>0;return m().set(n,t/1),g=n.length,t}function B(n,e,t){let r=S(t,i.__wbindgen_malloc),o=g;i.wasm_bindgen__convert__closures__invoke1_mut__h5860e381bcb9706c(n,e,r,o)}function N(n,e,t,r){let o={a:n,b:e,cnt:1,dtor:t},_=(...a)=>{o.cnt++;try{return r(o.a,o.b,...a)}finally{--o.cnt===0&&(i.__wbindgen_export_2.get(o.dtor)(o.a,o.b),o.a=0)}};return _.original=o,_}function $(n,e,t){i.wasm_bindgen__convert__closures__invoke1__h5a4fa13f3ec138ca(n,e,u(t))}function O(n,e){return n=n>>>0,m().subarray(n/1,n/1+e)}function j(n){try{let o=i.__wbindgen_add_to_stack_pointer(-16),_=S(n,i.__wbindgen_malloc),a=g;i.run_ai(o,_,a);var e=l()[o/4+0],t=l()[o/4+1],r=O(e,t).slice();return i.__wbindgen_free(e,t*1,1),r}finally{i.__wbindgen_add_to_stack_pointer(16)}}function D(n){return()=>{throw new Error(`${n} is not defined`)}}var k=null;function V(){return(k===null||k.byteLength===0)&&(k=new Uint32Array(i.memory.buffer)),k}function q(n,e){n=n>>>0;let r=V().subarray(n/4,n/4+e),o=[];for(let _=0;_<r.length;_++)o.push(W(r[_]));return o}function f(n,e){try{return n.apply(this,e)}catch(t){i.__wbindgen_exn_store(u(t))}}async function J(n,e){if(typeof Response=="function"&&n instanceof Response){if(typeof WebAssembly.instantiateStreaming=="function")try{return await WebAssembly.instantiateStreaming(n,e)}catch(r){if(n.headers.get("Content-Type")!="application/wasm")console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",r);else throw r}let t=await n.arrayBuffer();return await WebAssembly.instantiate(t,e)}else{let t=await WebAssembly.instantiate(n,e);return t instanceof WebAssembly.Instance?{instance:t,module:n}:t}}function z(){let n={};return n.wbg={},n.wbg.__wbindgen_object_drop_ref=function(e){W(e)},n.wbg.__wbindgen_object_clone_ref=function(e){let t=c(e);return u(t)},n.wbg.__wbg_wincallback_a6a4fc5b782108cf=typeof win_callback=="function"?win_callback:D("win_callback"),n.wbg.__wbg_runaibackground_8f0429c82a23ffaf=function(e,t){var r=O(e,t).slice();i.__wbindgen_free(e,t*1,1),run_ai_background(r)},n.wbg.__wbindgen_string_new=function(e,t){let r=b(e,t);return u(r)},n.wbg.__wbindgen_number_get=function(e,t){let r=c(t),o=typeof r=="number"?r:void 0;C()[e/8+1]=w(o)?0:o,l()[e/4+0]=!w(o)},n.wbg.__wbindgen_number_new=function(e){return u(e)},n.wbg.__wbg_new_abda76e883ba8a5f=function(){let e=new Error;return u(e)},n.wbg.__wbg_stack_658279fe44541cf6=function(e,t){let r=c(t).stack,o=h(r,i.__wbindgen_malloc,i.__wbindgen_realloc),_=g;l()[e/4+1]=_,l()[e/4+0]=o},n.wbg.__wbg_error_f851667af71bcfc6=function(e,t){let r,o;try{r=e,o=t,console.error(b(e,t))}finally{i.__wbindgen_free(r,o,1)}},n.wbg.__wbg_warn_40349716c899750a=function(e,t){var r=q(e,t).slice();i.__wbindgen_free(e,t*4,4),console.warn(...r)},n.wbg.__wbg_instanceof_Window_434ce1849eb4e0fc=function(e){let t;try{t=c(e)instanceof Window}catch{t=!1}return t},n.wbg.__wbg_body_4579ae140279af20=function(e){let t=c(e).body;return w(t)?0:u(t)},n.wbg.__wbg_createElement_d15f046703844f09=function(){return f(function(e,t,r){let o=c(e).createElement(b(t,r));return u(o)},arguments)},n.wbg.__wbg_createElementNS_11acf9c78d336078=function(){return f(function(e,t,r,o,_){let a=c(e).createElementNS(t===0?void 0:b(t,r),b(o,_));return u(a)},arguments)},n.wbg.__wbg_createTextNode_18d067bf6369a475=function(e,t,r){let o=c(e).createTextNode(b(t,r));return u(o)},n.wbg.__wbg_getElementById_af8feeb3fb877150=function(e,t,r){let o=c(e).getElementById(b(t,r));return w(o)?0:u(o)},n.wbg.__wbg_instanceof_Element_c9423704dd5d9b1d=function(e){let t;try{t=c(e)instanceof Element}catch{t=!1}return t},n.wbg.__wbg_namespaceURI_9fd9462aeda0a089=function(e,t){let r=c(t).namespaceURI;var o=w(r)?0:h(r,i.__wbindgen_malloc,i.__wbindgen_realloc),_=g;l()[e/4+1]=_,l()[e/4+0]=o},n.wbg.__wbg_removeAttribute_8f442821de341f11=function(){return f(function(e,t,r){c(e).removeAttribute(b(t,r))},arguments)},n.wbg.__wbg_setAttribute_fecb2c0d020f422f=function(){return f(function(e,t,r,o,_){c(e).setAttribute(b(t,r),b(o,_))},arguments)},n.wbg.__wbg_target_ee132da05a9ef949=function(e){let t=c(e).target;return w(t)?0:u(t)},n.wbg.__wbg_cancelBubble_5739e699df6294b0=function(e){return c(e).cancelBubble},n.wbg.__wbg_addEventListener_1151978b9ef85f25=function(){return f(function(e,t,r,o,_){c(e).addEventListener(b(t,r),c(o),c(_))},arguments)},n.wbg.__wbg_setchecked_b4c153b5e9fbc166=function(e,t){c(e).checked=t!==0},n.wbg.__wbg_value_a2e4cbb5179fb3b8=function(e,t){let r=c(t).value,o=h(r,i.__wbindgen_malloc,i.__wbindgen_realloc),_=g;l()[e/4+1]=_,l()[e/4+0]=o},n.wbg.__wbg_setvalue_f9de54bc4a5880ce=function(e,t,r){c(e).value=b(t,r)},n.wbg.__wbg_value_6b1ddbb6e9155da3=function(e,t){let r=c(t).value,o=h(r,i.__wbindgen_malloc,i.__wbindgen_realloc),_=g;l()[e/4+1]=_,l()[e/4+0]=o},n.wbg.__wbg_setvalue_5ef50a7282dd6d7e=function(e,t,r){c(e).value=b(t,r)},n.wbg.__wbg_parentElement_5a7090f336d94c74=function(e){let t=c(e).parentElement;return w(t)?0:u(t)},n.wbg.__wbg_lastChild_b2bc9e1e4adf0cda=function(e){let t=c(e).lastChild;return w(t)?0:u(t)},n.wbg.__wbg_setnodeValue_7ed608b56bb5f51b=function(e,t,r){c(e).nodeValue=t===0?void 0:b(t,r)},n.wbg.__wbg_appendChild_f60942b2565cb803=function(){return f(function(e,t){let r=c(e).appendChild(c(t));return u(r)},arguments)},n.wbg.__wbg_insertBefore_d8e803d8ba9a41b8=function(){return f(function(e,t,r){let o=c(e).insertBefore(c(t),c(r));return u(o)},arguments)},n.wbg.__wbg_removeChild_38dc2b8a0f4f0a41=function(){return f(function(e,t){let r=c(e).removeChild(c(t));return u(r)},arguments)},n.wbg.__wbg_document_17e852b4666eac5e=function(e){let t=c(e).document;return w(t)?0:u(t)},n.wbg.__wbg_debug_ca7d8917245536d0=function(e,t,r,o){console.debug(c(e),c(t),c(r),c(o))},n.wbg.__wbg_error_1189b5de6dd1b808=function(e){console.error(c(e))},n.wbg.__wbg_error_4a7b91f097a233a5=function(e,t,r,o){console.error(c(e),c(t),c(r),c(o))},n.wbg.__wbg_info_d4ce670cd6ec6fde=function(e,t,r,o){console.info(c(e),c(t),c(r),c(o))},n.wbg.__wbg_log_50738d2ca2ec904a=function(e,t,r,o){console.log(c(e),c(t),c(r),c(o))},n.wbg.__wbg_warn_2eee9ed96860a8b7=function(e,t,r,o){console.warn(c(e),c(t),c(r),c(o))},n.wbg.__wbg_self_c4a869f7521d7b18=function(){return f(function(){let e=self.self;return u(e)},arguments)},n.wbg.__wbg_window_f76bff89ab6e4c74=function(){return f(function(){let e=window.window;return u(e)},arguments)},n.wbg.__wbg_globalThis_71824672ea2add7c=function(){return f(function(){let e=globalThis.globalThis;return u(e)},arguments)},n.wbg.__wbg_global_f78549112bdb0090=function(){return f(function(){let e=global.global;return u(e)},arguments)},n.wbg.__wbindgen_is_undefined=function(e){return c(e)===void 0},n.wbg.__wbg_newnoargs_4cbce0ba8003ced4=function(e,t){let r=new Function(b(e,t));return u(r)},n.wbg.__wbg_call_875d4ea9abbec88f=function(){return f(function(e,t){let r=c(e).call(c(t));return u(r)},arguments)},n.wbg.__wbg_get_02999bb2caeeff61=function(){return f(function(e,t){let r=Reflect.get(c(e),c(t));return u(r)},arguments)},n.wbg.__wbg_new_fc6bfaed5ca1b77a=function(){let e=new Object;return u(e)},n.wbg.__wbg_valueOf_b57a82897edf3264=function(e){return c(e).valueOf()},n.wbg.__wbg_is_e0a4fb92be049653=function(e,t){return Object.is(c(e),c(t))},n.wbg.__wbg_set_3340302df484a06c=function(){return f(function(e,t,r){return Reflect.set(c(e),c(t),c(r))},arguments)},n.wbg.__wbindgen_debug_string=function(e,t){let r=T(c(t)),o=h(r,i.__wbindgen_malloc,i.__wbindgen_realloc),_=g;l()[e/4+1]=_,l()[e/4+0]=o},n.wbg.__wbindgen_throw=function(e,t){throw new Error(b(e,t))},n.wbg.__wbindgen_closure_wrapper106=function(e,t,r){let o=L(e,t,6,B);return u(o)},n.wbg.__wbindgen_closure_wrapper334=function(e,t,r){let o=N(e,t,119,$);return u(o)},n}function H(n,e){return i=n.exports,I.__wbindgen_wasm_module=e,A=null,E=null,k=null,p=null,i}async function I(n){if(i!==void 0)return i;typeof n>"u"&&(n=new URL("tic_tac_toe_4d_bg.wasm",location));let e=z();(typeof n=="string"||typeof Request=="function"&&n instanceof Request||typeof URL=="function"&&n instanceof URL)&&(n=fetch(n));let{instance:t,module:r}=await J(await n,e);return H(t,r)}var R=I;R().then(n=>{onmessage=e=>{postMessage(j(e.data))},console.log("background execution ready")});})();
//# sourceMappingURL=webworker_glue.js.map