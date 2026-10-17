window.__ModuleLoader__.load({id:`deepseek-harness-chatroom`,factory:e=>{let t=(t=>t.factory(e))({id:`@deepseek-ai/dsh-client-connection`,factory:e=>{var t={exports:{}},n=t.exports;Object.defineProperty(n,Symbol.toStringTag,{value:`Module`});function r(e){return e==null}function i(e){return e&&typeof e==`object`&&!Array.isArray(e)}function a(e,t){return Object.fromEntries(Object.entries(e).filter(([e,n])=>t(e,n)))}function o(e,t){return Object.fromEntries(Object.entries(e).map(([e,n])=>[e,t(n,e)]))}function s(e,t,n){if(!t)return{...e};let r={};for(let i of t)(n||e[i]!==void 0)&&(r[i]=e[i]);return r}let c=Symbol.for(`cosmokit.volatile.write`);function l(e,t=new Set){if(typeof e==`function`)throw TypeError(`volatile config cannot contain functions`);if(typeof e!=`object`||!e)return e;if(t.has(e))throw TypeError(`volatile config cannot contain cycles`);t.add(e);try{if(Array.isArray(e))return Object.freeze(e.map(e=>l(e,t)));if(Object.getPrototypeOf(e)!==Object.prototype&&Object.getPrototypeOf(e)!==null)throw TypeError(`volatile config objects must be plain objects or arrays`);return Object.freeze(Object.fromEntries(Object.entries(e).map(([e,n])=>[e,l(n,t)])))}finally{t.delete(e)}}function u(e){let t=l(e);return Object.freeze({get:()=>t,[c]:e=>{t=e}})}function d(e){return typeof e==`object`&&!!e&&c in e}function f(e,t){return arguments.length===1?t=>f(e,t):e in globalThis&&t instanceof globalThis[e]||Object.prototype.toString.call(t).slice(8,-1)===e}function p(e){return f(`ArrayBuffer`,e)||f(`SharedArrayBuffer`,e)}function m(e){return p(e)||ArrayBuffer.isView(e)}var h;(function(e){e.is=p,e.isSource=m;function t(e){return ArrayBuffer.isView(e)?e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength):e}e.fromSource=t;function n(e){if(e=t(e),typeof Buffer<`u`)return Buffer.from(e).toString(`base64`);let n=``,r=new Uint8Array(e);for(let e=0;e<r.byteLength;e++)n+=String.fromCharCode(r[e]);return btoa(n)}e.toBase64=n;function r(e){return typeof Buffer<`u`?t(Buffer.from(e,`base64`)):Uint8Array.from(atob(e),e=>e.charCodeAt(0))}e.fromBase64=r;function i(e){return e=t(e),typeof Buffer<`u`?Buffer.from(e).toString(`hex`):Array.from(new Uint8Array(e),e=>e.toString(16).padStart(2,`0`)).join(``)}e.toHex=i;function a(e){if(typeof Buffer<`u`)return t(Buffer.from(e,`hex`));let n=e.length%2==0?e:e.slice(0,e.length-1),r=[];for(let e=0;e<n.length;e+=2)r.push(parseInt(`${n[e]}${n[e+1]}`,16));return Uint8Array.from(r).buffer}e.fromHex=a})(h||={}),h.fromBase64,h.toBase64,h.fromHex,h.toHex;function g(e,t=new Map){if(!e||typeof e!=`object`)return e;if(f(`Date`,e))return new Date(e.valueOf());if(f(`RegExp`,e))return new RegExp(e.source,e.flags);if(p(e))return e.slice(0);if(ArrayBuffer.isView(e))return e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength);let n=t.get(e);if(n)return n;if(Array.isArray(e)){let n=[];return t.set(e,n),e.forEach((e,r)=>{n[r]=Reflect.apply(g,null,[e,t])}),n}let r=Object.create(Object.getPrototypeOf(e));t.set(e,r);for(let n of Reflect.ownKeys(e)){let i={...Reflect.getOwnPropertyDescriptor(e,n)};`value`in i&&(i.value=Reflect.apply(g,null,[i.value,t])),Reflect.defineProperty(r,n,i)}return r}function _(e,t,n){let i=new Set;function a(e,t){if(e===t)return!0;if(d(e)||d(t))return d(e)&&d(t);if(!n&&r(e)&&r(t))return!0;if(typeof e!=typeof t||typeof e!=`object`||!e||!t||i.has(e))return!1;function o(n,r){return n(e)?n(t)?r(e,t):!1:!n(t)&&void 0}i.add(e);try{return o(Array.isArray,(e,t)=>{if(e.length!==t.length)return!1;for(let n=0;n<e.length;n++)if(!a(e[n],t[n]))return!1;return!0})??o(f(`Date`),(e,t)=>e.valueOf()===t.valueOf())??o(f(`URL`),(e,t)=>e.href===t.href)??o(f(`RegExp`),(e,t)=>e.source===t.source&&e.flags===t.flags)??o(p,(e,t)=>{if(e.byteLength!==t.byteLength)return!1;let n=new Uint8Array(e),r=new Uint8Array(t);for(let e=0;e<n.length;e++)if(n[e]!==r[e])return!1;return!0})??((!n||[e,t].every(e=>Object.getPrototypeOf(e)===Object.prototype||Object.getPrototypeOf(e)===null))&&Object.keys({...e,...t}).every(n=>a(e[n],t[n])))}finally{i.delete(e)}}return a(e,t)}var v;(function(e){e.millisecond=1,e.second=1e3,e.minute=e.second*60,e.hour=e.minute*60,e.day=e.hour*24,e.week=e.day*7;let t=new Date().getTimezoneOffset();function n(e){t=e}e.setTimezoneOffset=n;function r(){return t}e.getTimezoneOffset=r;function i(n=new Date,r){return typeof n==`number`&&(n=new Date(n)),r===void 0&&(r=t),Math.floor((n.valueOf()/e.minute-r)/1440)}e.getDateNumber=i;function a(n,r){let i=new Date(n*e.day);return r===void 0&&(r=t),new Date(+i+r*e.minute)}e.fromDateNumber=a;let o=RegExp(`^${[`w(?:eek(?:s)?)?`,`d(?:ay(?:s)?)?`,`h(?:our(?:s)?)?`,`m(?:in(?:ute)?(?:s)?)?`,`s(?:ec(?:ond)?(?:s)?)?`].map(e=>`(\\d+(?:\\.\\d+)?${e})?`).join(``)}$`);function s(t){let n=o.exec(t);return n?(parseFloat(n[1])*e.week||0)+(parseFloat(n[2])*e.day||0)+(parseFloat(n[3])*e.hour||0)+(parseFloat(n[4])*e.minute||0)+(parseFloat(n[5])*e.second||0):0}e.parseTime=s;function c(e){let t=s(e);return t?e=Date.now()+t:/^\d{1,2}(:\d{1,2}){1,2}$/.test(e)?e=`${new Date().toLocaleDateString()}-${e}`:/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(e)&&(e=`${new Date().getFullYear()}-${e}`),e?new Date(e):new Date}e.parseDate=c;function l(t){let n=Math.abs(t);return n>=e.day-e.hour/2?Math.round(t/e.day)+`d`:n>=e.hour-e.minute/2?Math.round(t/e.hour)+`h`:n>=e.minute-e.second/2?Math.round(t/e.minute)+`m`:n>=e.second?Math.round(t/e.second)+`s`:t+`ms`}e.format=l;function u(e,t=2){return e.toString().padStart(t,`0`)}e.toDigits=u;function d(e,t=new Date){return e.replace(`yyyy`,t.getFullYear().toString()).replace(`yy`,t.getFullYear().toString().slice(2)).replace(`MM`,u(t.getMonth()+1)).replace(`dd`,u(t.getDate())).replace(`hh`,u(t.getHours())).replace(`mm`,u(t.getMinutes())).replace(`ss`,u(t.getSeconds())).replace(`SSS`,u(t.getMilliseconds(),3))}e.template=d})(v||={});let y=Symbol.for(`schemastery`),b=Symbol.for(`ValidationError`);globalThis.__schemastery_index__??=0,globalThis.__schemastery_refs__=void 0;var x=class extends TypeError{options;name=`ValidationError`;constructor(e,t){let n=`$`;for(let e of t.path||[])typeof e==`string`?n+=`.`+e:typeof e==`number`?n+=`[`+e+`]`:typeof e==`symbol`&&(n+=`[Symbol(${e.toString()})]`);n.startsWith(`.`)&&(n=n.slice(1)),super((n===`$`?``:`${n} `)+e),this.options=t}static is(e){return!!e?.[b]}};Object.defineProperty(x.prototype,b,{value:!0});let S=function(e){let t=function(e,n={}){return S.resolve(e,t,n)[0]};if(e.refs){let t=o(e.refs,e=>new S(e)),n=e=>t[e];for(let e in t){let r=t[e];r.sKey=n(r.sKey),r.inner=n(r.inner),r.list=r.list&&r.list.map(n),r.dict=r.dict&&o(r.dict,n)}return t[e.uid]}if(Object.assign(t,e),typeof t.callback==`string`)try{t.callback=Function(`return `+t.callback)()}catch{}return Object.defineProperty(t,"uid",{value:globalThis.__schemastery_index__++}),Object.setPrototypeOf(t,S.prototype),t.meta||={},t.toString=t.toString.bind(t),t};S.prototype=Object.create(Function.prototype),S.prototype[y]=!0,Object.defineProperty(S.prototype,"~standard",{get(){return{version:1,vendor:`schemastery`,validate:e=>{try{return{value:S.resolve(e,this,{})[0]}}catch(e){if(x.is(e))return{issues:[{message:e.message,path:e.options.path}]};throw e}}}}}),S.ValidationError=x,S.prototype.toJSON=function(){if(globalThis.__schemastery_refs__)return globalThis.__schemastery_refs__[this.uid]??=JSON.parse(JSON.stringify({...this})),this.uid;globalThis.__schemastery_refs__={[this.uid]:{...this}},globalThis.__schemastery_refs__[this.uid]=JSON.parse(JSON.stringify({...this}));let e={uid:this.uid,refs:globalThis.__schemastery_refs__};return globalThis.__schemastery_refs__=void 0,e},S.prototype.set=function(e,t){return this.dict[e]=t,this},S.prototype.push=function(e){return this.list.push(e),this};function C(e,t){let n=typeof e==`string`?{"":e}:{...e};for(let e in t){let r=t[e];r?.$description||r?.$desc?n[e]=r.$description||r.$desc:typeof r==`string`&&(n[e]=r)}return n}function w(e){return e?.$value??e?.$inner}function T(e){return a(e??{},e=>!e.startsWith(`$`))}S.prototype.i18n=function(e){let t=S(this),n=C(t.meta.description,e);return Object.keys(n).length&&(t.meta.description=n),t.dict&&=o(t.dict,(t,n)=>t.i18n(o(e,e=>w(e)?.[n]??e?.[n]))),t.list&&=t.list.map((t,n)=>t.i18n(o(e,(e={})=>Array.isArray(w(e))?w(e)[n]:Array.isArray(e)?e[n]:T(e)))),t.inner&&=t.inner.i18n(o(e,e=>w(e)?w(e):T(e))),t.sKey&&=t.sKey.i18n(o(e,e=>e?.$key)),t},S.prototype.extra=function(e,t){let n=S(this);return n.meta={...n.meta,[e]:t},n};for(let e of[`required`,`disabled`,`collapse`,`hidden`,`loose`])Object.assign(S.prototype,{[e](t=!0){let n=S(this);return n.meta={...n.meta,[e]:t},n}});S.prototype.deprecated=function(){let e=S(this);return e.meta.badges||=[],e.meta.badges.push({text:`deprecated`,type:`danger`}),e},S.prototype.experimental=function(){let e=S(this);return e.meta.badges||=[],e.meta.badges.push({text:`experimental`,type:`warning`}),e},S.prototype.pattern=function(e){let t=S(this),n=s(e,[`source`,`flags`]);return t.meta={...t.meta,pattern:n},t},S.prototype.simplify=function(e){if(d(e)&&(e=e.get()),_(e,this.meta.default,this.type===`dict`))return null;if(r(e))return e;if(this.type===`object`||this.type===`dict`){let t={};for(let n in e){let i=(this.type===`object`?this.dict[n]:this.inner)?.simplify(e[n]);(this.type===`dict`||!r(i))&&(t[n]=i)}return _(t,this.meta.default,this.type===`dict`)?null:t}if(this.type===`array`||this.type===`tuple`){let t=[];return e.forEach((e,n)=>{let r=this.type===`array`?this.inner:this.list[n],i=r?r.simplify(e):e;t.push(i)}),t}if(this.type===`intersect`){let t={};for(let n of this.list)Object.assign(t,n.simplify(e));return t}if(this.type===`union`)for(let t of this.list)try{return S.resolve(e,t,{}),t.simplify(e)}catch{}return e},S.prototype.toString=function(e){return ie[this.type]?.(this,e)??`Schema<${this.type}>`},S.prototype.role=function(e,t){let n=S(this);return n.meta={...n.meta,role:e,extra:t},n};for(let e of[`default`,`link`,`comment`,`description`,`max`,`min`,`step`])Object.assign(S.prototype,{[e](t){let n=S(this);return n.meta={...n.meta,[e]:t},n}});S.prototype.volatile=function(){if(this.meta.volatile)throw TypeError(`volatile schema is already wrapped`);return this.extra(`volatile`,!0)};let E={},D=Symbol(`checked-volatile-schema`);function O(e,t=[],n=!1,r=new Map){let i=r.get(e)??new Set;if(i.has(n))return;if(i.add(n),r.set(e,i),e.meta?.volatile&&n)throw new x(`volatile fields require a fixed object path without an enclosing volatile field`,{path:t});let a=n||!!e.meta?.volatile;if(e.dict)for(let[n,i]of Object.entries(e.dict))O(i,[...t,n],a,r);if(e.sKey&&O(e.sKey,[...t,`<key>`],!0,r),e.inner&&(e.type!==`lazy`||e.inner[y])&&O(e.inner,[...t,`*`],!0,r),e.list)for(let n=0;n<e.list.length;n++)O(e.list[n],[...t,String(n)],!0,r)}S.extend=function(e,t){E[e]=t},S.resolve=function(e,t,n={},i=!1){if(!t)return[e];if(n[D]||(O(t,n.path),n={...n,[D]:!0}),t.meta?.volatile){let r=S(t);r.meta={...t.meta,volatile:!1};let[a,o]=S.resolve(e,r,n,i);try{return[u(a),o]}catch(e){throw new x(e instanceof Error?e.message:String(e),n)}}if(n.ignore?.(e,t))return[e];if(r(e)&&t.type!==`lazy`){if(t.meta.required)throw new x(`missing required value`,n);let i=t,a=t.meta.default;for(;i?.type===`intersect`&&r(a);)i=i.list[0],a=i?.meta.default;if(r(a))return[e];e=g(a)}let a=E[t.type];if(!a)throw new x(`unsupported type "${t.type}"`,n);try{return a(e,t,n,i)}catch(e){if(!t.meta.loose)throw e;return[t.meta.default]}},S.from=function(e){if(r(e))return S.any();if([`string`,`number`,`boolean`].includes(typeof e))return S.const(e).required();if(e[y])return e;if(typeof e==`function`)switch(e){case String:return S.string().required();case Number:return S.number().required();case Boolean:return S.boolean().required();case Function:return S.function().required();default:return S.is(e).required()}else throw TypeError(`cannot infer schema from ${e}`)},S.lazy=function(e){let t=new S({type:`lazy`,builder:e,inner:{toJSON:()=>(t.inner[y]||(t.inner=t.builder(),t.inner.meta={...t.meta,...t.inner.meta}),t.inner.toJSON())}});return t},S.natural=function(){return S.number().step(1).min(0)},S.percent=function(){return S.number().step(.01).min(0).max(1).role(`slider`)},S.date=function(){return S.union([S.is(Date),S.transform(S.string().role(`datetime`),(e,t)=>{let n=new Date(e);if(isNaN(+n))throw new x(`invalid date "${e}"`,t);return n},!0)])},S.regExp=function(e=``){return S.union([S.is(RegExp),S.transform(S.string().role(`regexp`,{flag:e}),(t,n)=>{try{return new RegExp(t,e)}catch(e){throw new x(e.message,n)}},!0)])},S.arrayBuffer=function(e){return S.union([S.is(ArrayBuffer),S.is(SharedArrayBuffer),S.transform(S.any(),(e,t)=>{if(h.isSource(e))return h.fromSource(e);throw new x(`expected ArrayBufferSource but got ${e}`,t)},!0),...e?[S.transform(S.string(),(t,n)=>{try{return e===`base64`?h.fromBase64(t):h.fromHex(t)}catch(e){throw new x(e.message,n)}},!0)]:[]])},S.extend(`lazy`,(e,t,n,r)=>(t.inner[y]||(t.inner=t.builder(),t.inner.meta={...t.meta,...t.inner.meta},O(t.inner,n.path,!0)),S.resolve(e,t.inner,n,r))),S.extend(`any`,e=>[e]),S.extend(`never`,(e,t,n)=>{throw new x(`expected nullable but got ${e}`,n)}),S.extend(`const`,(e,{value:t},n)=>{if(_(e,t))return[t];throw new x(`expected ${t} but got ${e}`,n)});function ee(e,t,n,r,i=!1){let{max:a=1/0,min:o=-1/0}=t;if(e>a)throw new x(`expected ${n} <= ${a} but got ${e}`,r);if(e<o&&!i)throw new x(`expected ${n} >= ${o} but got ${e}`,r)}S.extend(`string`,(e,{meta:t},n)=>{if(typeof e!=`string`)throw new x(`expected string but got ${e}`,n);if(t.pattern){let r=new RegExp(t.pattern.source,t.pattern.flags);if(!r.test(e))throw new x(`expect string to match regexp ${r}`,n)}return ee(e.length,t,`string length`,n),[e]});function k(e,t){let n=e.toString();if(n.includes(`e`))return e*10**t;let r=n.indexOf(`.`);if(r===-1)return e*10**t;let i=n.slice(r+1),a=n.slice(0,r);return i.length<=t?+(a+i.padEnd(t,`0`)):+(a+i.slice(0,t)+`.`+i.slice(t))}function te(e,t,n){if(n=Math.abs(n),!/^\d+\.\d+$/.test(n.toString()))return(e-t)%n===0;let r=n.toString().indexOf(`.`),i=n.toString().slice(r+1).length;return Math.abs(k(e,i)-k(t,i))%k(n,i)===0}S.extend(`number`,(e,{meta:t},n)=>{if(typeof e!=`number`)throw new x(`expected number but got ${e}`,n);ee(e,t,`number`,n);let{step:r}=t;if(r&&!te(e,t.min??0,r))throw new x(`expected number multiple of ${r} but got ${e}`,n);return[e]}),S.extend(`boolean`,(e,t,n)=>{if(typeof e==`boolean`)return[e];throw new x(`expected boolean but got ${e}`,n)}),S.extend(`bitset`,(e,{bits:t,meta:n},r)=>{let i=0,a=[];if(typeof e==`number`){i=e;for(let n in t)e&t[n]&&a.push(n)}else if(Array.isArray(e)){a=e;for(let e of a){if(typeof e!=`string`)throw new x(`expected string but got ${e}`,r);e in t&&(i|=t[e])}}else throw new x(`expected number or array but got ${e}`,r);return i===n.default?[i]:[i,a]}),S.extend(`function`,(e,t,n)=>{if(typeof e==`function`)return[e];throw new x(`expected function but got ${e}`,n)}),S.extend(`is`,(e,{constructor:t},n)=>{if(typeof t==`function`){if(e instanceof t)return[e];throw new x(`expected ${t.name} but got ${e}`,n)}{if(r(e))throw new x(`expected ${t} but got ${e}`,n);let i=Object.getPrototypeOf(e);for(;i;){if(i.constructor?.name===t)return[e];i=Object.getPrototypeOf(i)}throw new x(`expected ${t} but got ${e}`,n)}});function ne(e,t,n,r){try{let[i,a]=S.resolve(e[t],n,{...r,path:[...r.path||[],t]});return a!==void 0&&(e[t]=a),i}catch(i){if(!r?.autofix)throw i;return delete e[t],n.meta.volatile?u(n.meta.default):n.meta.default}}S.extend(`array`,(e,{inner:t,meta:n},i)=>{if(!Array.isArray(e))throw new x(`expected array but got ${e}`,i);return ee(e.length,n,`array length`,i,!r(t.meta.default)),[e.map((n,r)=>ne(e,r,t,i))]}),S.extend(`dict`,(e,{inner:t,sKey:n},r,a)=>{if(!i(e))throw new x(`expected object but got ${e}`,r);let o={};for(let i in e){let s;try{s=S.resolve(i,n,r)[0]}catch(e){if(a)continue;throw e}o[s]=ne(e,i,t,r),e[s]=e[i],i!==s&&delete e[i]}return[o]}),S.extend(`tuple`,(e,{list:t},n,r)=>{if(!Array.isArray(e))throw new x(`expected array but got ${e}`,n);let i=t.map((t,r)=>ne(e,r,t,n));return r||i.push(...e.slice(t.length)),[i]});function re(e,t){for(let n in t)n in e||(e[n]=t[n])}S.extend(`object`,(e,{dict:t},n,a)=>{if(!i(e))throw new x(`expected object but got ${e}`,n);let o={};for(let i in t){let a=ne(e,i,t[i],n);(!r(a)||i in e)&&(o[i]=a)}return a||re(o,e),[o]}),S.extend(`union`,(e,{list:t,toString:n},r,i)=>{let a=[];for(let n of t)try{return S.resolve(e,n,r,i)}catch(e){a.push(e)}throw new x(`expected ${n()} but got ${JSON.stringify(e)}`,r)}),S.extend(`intersect`,(e,{list:t,toString:n},a,o)=>{if(!t.length)return[e];let s;for(let i of t){let t=S.resolve(e,i,a,!0)[0];if(!r(t)){if(r(s))s=t;else if(typeof s!=typeof t)throw new x(`expected ${n()} but got ${JSON.stringify(e)}`,a);else if(typeof t==`object`)re(s??={},t);else if(s!==t)throw new x(`expected ${n()} but got ${JSON.stringify(e)}`,a)}}return!o&&i(e)&&re(s,e),[s]}),S.extend(`transform`,(e,{inner:t,callback:n,preserve:r},i)=>{let[a,o=e]=S.resolve(e,t,i,!0);return r?[n(a)]:[n(a),n(o)]});let ie={};function A(e,t,n){ie[e]=n,Object.assign(S,{[e](...n){let r=new S({type:e});return t.forEach((e,t)=>{switch(e){case`sKey`:r.sKey=n[t]??S.string();break;case`inner`:r.inner=S.from(n[t]);break;case`list`:r.list=n[t].map(S.from);break;case`dict`:r.dict=o(n[t],S.from);break;case`bits`:r.bits={};for(let e in n[t])typeof n[t][e]==`number`&&(r.bits[e]=n[t][e]);break;case`callback`:{let e=r.callback=n[t];e.toJSON||=()=>e.toString();break}case`constructor`:{let e=r.constructor=n[t];typeof e==`function`&&(e.toJSON||=()=>e.name);break}default:r[e]=n[t]}}),e===`object`||e===`dict`?r.meta.default={}:e===`array`||e===`tuple`?r.meta.default=[]:e===`bitset`&&(r.meta.default=0),r}})}A(`is`,[`constructor`],({constructor:e})=>typeof e==`function`?e.name:e),A(`any`,[],()=>`any`),A(`never`,[],()=>`never`),A(`const`,[`value`],({value:e})=>typeof e==`string`?JSON.stringify(e):e),A(`string`,[],()=>`string`),A(`number`,[],()=>`number`),A(`boolean`,[],()=>`boolean`),A(`bitset`,[`bits`],()=>`bitset`),A(`function`,[],()=>`function`),A(`array`,[`inner`],({inner:e})=>`${e.toString(!0)}[]`),A(`dict`,[`inner`,`sKey`],({inner:e,sKey:t})=>`{ [key: ${t.toString()}]: ${e.toString()} }`),A(`tuple`,[`list`],({list:e})=>`[${e.map(e=>e.toString()).join(`, `)}]`),A(`object`,[`dict`],({dict:e})=>Object.keys(e).length===0?`{}`:`{ ${Object.entries(e).map(([e,t])=>`${e}${t.meta.required?``:`?`}: ${t.toString()}`).join(`, `)} }`),A(`union`,[`list`],({list:e},t)=>{let n=e.map(({toString:e})=>e()).join(` | `);return t?`(${n})`:n}),A(`intersect`,[`list`],({list:e})=>`${e.map(e=>e.toString(!0)).join(` & `)}`),A(`transform`,[`inner`,`callback`,`preserve`],({inner:e},t)=>e.toString(t));let ae=2147483647,oe=S.object({backoffBaseMs:S.natural().min(1).max(ae).default(500),backoffFactor:S.number().min(1).max(Number.MAX_VALUE).default(2),backoffMaxMs:S.natural().min(1).max(ae).default(1e4),generationReadyWarnMs:S.natural().min(1).max(ae).default(3e3),generationReadyTimeoutMs:S.natural().min(1).max(ae).default(15e3)});function se(e={}){let t=oe(e);if(!Number.isFinite(t.backoffFactor))throw RangeError(`connection recovery backoffFactor must be finite`);return t}let ce=Error(`connection: manual reconnect requested`),j=Error(`connection: browser network state changed`);function M(e,t){return new Promise(n=>{let r=setTimeout(i,e);t.addEventListener(`abort`,i,{once:!0});function i(){clearTimeout(r),t.removeEventListener(`abort`,i),n()}})}function N(e){return e.aborted?Promise.resolve():new Promise(t=>{e.addEventListener(`abort`,()=>{t()},{once:!0})})}var le=class{source;sinks;generation=0;attempt=0;current=null;retryDelay=null;running=!1;immediateRetry=!1;networkAvailable=!0;lastState;config;constructor(e,t={},n={}){this.source=e,this.sinks=t,this.config=se(n)}start(){this.running||(this.running=!0,this.loop())}stop(){this.running=!1,this.current?.abort(),this.current=null,this.retryDelay?.abort(),this.retryDelay=null}reconnect(){this.running&&(this.attempt=0,this.immediateRetry=!0,this.emitState(`connecting`),this.isRunning()&&(this.current?.abort(ce),this.retryDelay?.abort(ce)))}setNetworkAvailable(e){this.networkAvailable!==e&&(this.networkAvailable=e,this.attempt=0,this.immediateRetry=!1,this.running&&(this.emitState(e?`connecting`:`disconnected`),this.isRunning()&&(this.current?.abort(j),this.retryDelay?.abort(j))))}backoffCap(e){let{backoffBaseMs:t,backoffFactor:n,backoffMaxMs:r}=this.config;return Math.min(r,t*n**Math.max(0,e-1))}backoffDelay(e){let t=this.backoffCap(e);return t/2+t/2*Math.random()}isRetryInterrupted(e){return this.immediateRetry||!this.networkAvailable&&!e}isRunning(){return this.running}isGenerationActive(e){return this.isRunning()&&!e.signal.aborted}async loop(){let e=!1;for(;this.running;){if(!this.networkAvailable&&!this.immediateRetry){let t=new AbortController;if(this.retryDelay=t,this.emitState(`disconnected`),await N(t.signal),this.retryDelay===t&&(this.retryDelay=null),!this.isRunning())return;e=!0;continue}let t=!1;if(e){let e=this.immediateRetry;this.immediateRetry=!1,e&&(this.attempt=0),t=e;let n=++this.attempt;if(this.emitState(`connecting`),!this.isRunning())return;if(this.isRetryInterrupted(e))continue;if(!e){let e=new AbortController;if(this.retryDelay=e,await M(this.backoffDelay(n),e.signal),this.retryDelay===e&&(this.retryDelay=null),!this.isRunning())return;if(e.signal.aborted)continue}if(console.warn(`[connection] connection lost, retry #${String(n)}`),this.callSink(()=>{this.sinks.onReconnectRequested?.()}),!this.isRunning())return}let n=++this.generation,r=new AbortController;this.current=r;let i=!1,a,o,s,c=new Promise((e,t)=>{a=e,o=t}),l=new Promise((e,t)=>{s=t}),u=e=>{i||n!==this.generation||!this.isGenerationActive(r)||(i=!0,a(e))},d=new Promise(e=>{let t=()=>{n===this.generation&&!r.signal.aborted&&r.abort(),e()};Promise.resolve().then(()=>this.source(r.signal,u)).then(()=>{let e=Error(`connection generation ended`);i||o(e),s(e),t()},e=>{let n=e instanceof Error?e:Error(`connection generation failed`,{cause:e});i||o(n),s(n),t()})});try{let e=await Promise.race([ue(c,this.config,r.signal),l]);if(r.signal.aborted)throw Error(`generation aborted during readiness handshake`);this.attempt=0,this.emitState(`connected`),this.isGenerationActive(r)&&this.callSink(()=>{this.sinks.onConnected?.(e)})}catch(e){r.signal.aborted||r.abort(e)}if(await d,!this.isRunning())return;t&&(this.attempt=0),e=!0}}emitState(e){this.lastState!==e&&(this.lastState=e,this.callSink(()=>this.sinks.onStateChange?.(e)))}callSink(e){try{e()}catch(e){console.error(`[connection] connection sink threw:`,e)}}};function ue(e,t,n){return new Promise((r,i)=>{let a=!1,o=setTimeout(()=>{console.warn(`[connection] generation is still not ready after ${String(t.generationReadyWarnMs)}ms`)},t.generationReadyWarnMs),s=setTimeout(()=>{let e=Error(`connection generation was not ready within ${String(t.generationReadyTimeoutMs)}ms`);console.warn(`[connection] ${e.message}; cancelling generation`),l({error:e})},t.generationReadyTimeoutMs),c=()=>{l({error:Error(`connection generation aborted`,{cause:n.reason})})},l=e=>{a||(a=!0,clearTimeout(o),clearTimeout(s),n.removeEventListener(`abort`,c),`error`in e?i(e.error):r(e.value))};n.addEventListener(`abort`,c,{once:!0}),e.then(e=>{l({value:e})},e=>{l({error:e})})})}function de(e){return e}function P(e){return{ok:!1,error:{code:`gateway/internal`,message:e instanceof Error?e.message:String(e),details:{}}}}function F(){let e=globalThis.crypto.getRandomValues(new Uint8Array(16)),t=new DataView(e.buffer,e.byteOffset,e.byteLength);t.setUint8(6,t.getUint8(6)&15|64),t.setUint8(8,t.getUint8(8)&63|128);let n=Array.from(e,e=>e.toString(16).padStart(2,`0`)).join(``);return`${n.slice(0,8)}-${n.slice(8,12)}-${n.slice(12,16)}-${n.slice(16,20)}-${n.slice(20)}`}let fe=/^\/[A-Za-z0-9._~-]+$/,pe=/^[A-Za-z0-9_$.-]+$/;function me(e,t){let n=e??((e,t)=>globalThis.fetch(e,t));return{async call(e,t,r,i){ge(e,t);let a=de(F()),o={type:`client-request`,rpcId:a,method:t,payload:r},s=await n(`${e}/${t}`.slice(1),{method:`POST`,headers:{"content-type":`application/json`},body:JSON.stringify(o),...i===void 0?{}:{signal:i}});if(!s.ok)throw Error(`transport failure for ${e}/${t}: HTTP ${s.status}`);let c=s.headers.get(`content-type`)?.split(`;`,1)[0]?.trim().toLowerCase()===`multipart/form-data`?await I(s):L(await s.json());if(i?.throwIfAborted(),c.rpcId!==a)throw Error(`rpcId mismatch for ${t}: sent ${a}, got ${c.rpcId}`);return c.result},...t===void 0?{}:{open(e,n,r,i,a){if(ge(e,n),e!==`/api`)throw Error(`connection: worker-local streams require the /api channel, got ${JSON.stringify(e)}`);return t(n,r,i,a)}}}}async function I(e){let t=await e.formData(),n=new Map;for(let[e,r]of t){if(n.has(e))throw TypeError(`connection: invalid binary response fields`);n.set(e,r)}let r=n.get(`metadata`);if(n.delete(`metadata`),typeof r!=`string`)throw TypeError(`connection: invalid binary response fields`);let i=JSON.parse(r),a=L(i);if(!a.result.ok||!he(i)||!Array.isArray(i.attachments)||i.attachments.length===0)throw TypeError(`connection: invalid binary response result`);let o={value:a.result.value};for(let e of i.attachments){if(!he(e)||e.codec!==`bytes`||typeof e.part!=`string`||!Array.isArray(e.path))throw TypeError(`connection: invalid binary response attachment`);let t=n.get(e.part);if(n.delete(e.part),!(t instanceof Blob))throw TypeError(`connection: invalid binary response fields`);let r=o,i=`value`;for(let t of e.path){let e=Reflect.get(r,i);if(typeof e!=`object`||!e)throw TypeError(`connection: invalid binary response path`);if(Array.isArray(e)){if(typeof t!=`number`||!Number.isSafeInteger(t)||t<0||t>=e.length)throw TypeError(`connection: invalid binary response path`)}else if(typeof t!=`string`)throw TypeError(`connection: invalid binary response path`);if(!Object.hasOwn(e,t))throw TypeError(`connection: invalid binary response path`);r=e,i=t}if(Reflect.get(r,i)!==null)throw TypeError(`connection: invalid binary response placeholder`);Object.defineProperty(r,i,{value:new Uint8Array(await t.arrayBuffer()),enumerable:!0,writable:!0,configurable:!0})}if(n.size!==0)throw TypeError(`connection: invalid binary response fields`);return{rpcId:a.rpcId,result:{ok:!0,value:o.value}}}function L(e){if(!he(e)||e.type!==`server-response`||typeof e.rpcId!=`string`)throw TypeError(`connection: invalid server-response envelope`);let t=e.result;if(!he(t))throw TypeError(`connection: invalid server-response result`);if(t.ok===!0)return{rpcId:de(e.rpcId),result:{ok:!0,value:t.value}};if(t.ok!==!1||!he(t.error))throw TypeError(`connection: invalid server-response result`);let n=t.error;if(typeof n.code!=`string`||typeof n.message!=`string`||!he(n.details))throw TypeError(`connection: invalid server-response failure`);return{rpcId:de(e.rpcId),result:{ok:!1,error:{code:n.code,message:n.message,details:n.details}}}}function he(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}function ge(e,t){let n=t.split(`/`);if(!fe.test(e)||n.some(e=>e===``||e===`.`||e===`..`||!pe.test(e)))throw Error(`connection: invalid RPC target ${JSON.stringify(`${e}/${t}`)}`)}function _e(e){if(e===`localhost`||e===`[::1]`)return!0;let t=e.split(`.`);return t.length===4&&t[0]===`127`&&t.every(e=>/^\d{1,3}$/.test(e)&&Number(e)<=255)}let ve=[];function ye(e){let t=globalThis.window,n=t?.navigator?.onLine;if(t===void 0||n===void 0)return()=>{};let r=()=>{e.setNetworkAvailable(!0)},i=()=>{e.setNetworkAvailable(!1)};return e.setNetworkAvailable(n),t.addEventListener(`online`,r),t.addEventListener(`offline`,i),()=>{t.removeEventListener(`online`,r),t.removeEventListener(`offline`,i)}}function R(e,t={}){let n=t.location,r=t.transport,i=t.recovery??{},a=r?.rpc??me(r?.fetch,r?.openStream),o,s,c=0,l,u,d=new Set,f=new Set,p=e=>{if(!Object.is(l,e)){l=e;for(let e of[...d])try{e()}catch(e){console.error(`[connection] generation listener threw:`,e)}}},m=e=>{if(u!==e){u=e;for(let e of[...f])try{e()}catch(e){console.error(`[connection] state listener threw:`,e)}}},h=e=>{s===e&&(s=void 0,e.stopNetworkWatch(),e.controller.stop(),p(void 0),m(void 0))},g={isLoopback:r?.ownsHost===!0||n===void 0||_e(n.hostname),generation:{getSnapshot:()=>l,subscribe:e=>(d.add(e),()=>{d.delete(e)})},state:{getSnapshot:()=>u,subscribe:e=>(f.add(e),()=>{f.delete(e)})},rpc:a,reconnect(){s?.controller.reconnect()},registerGenerationSource(e){if(o!==void 0)throw Error(`connection: a generation source is already registered`);return o=e,()=>{if(o!==e)return;o=void 0;let t=s;t?.source===e&&h(t)}},start(e,t){if(s!==void 0)throw Error(`connection: the stream loop is already owned by another consumer`);let n=o;if(n===void 0)throw Error(`connection: no generation source is registered`);let r={},a=()=>s?.token===r,u=new le(n,{...e,onConnected:t=>{let n={id:++c,host:t};p(n),!(!a()||!Object.is(l,n))&&e.onConnected?.(t)},onStateChange:t=>{t!==`connected`&&p(void 0),a()&&(m(t),e.onStateChange?.(t))}},{...i,...t}),d={token:r,source:n,controller:u,stopNetworkWatch:ye(u)};return s=d,u.start(),{stop:()=>{h(d)}}}};e.provide(`connection`,g)}function be(e){let t=globalThis,n=typeof location>`u`?void 0:location,r=t.__DSH_TRANSPORT__;R(e,{...r===void 0?{}:{transport:r},recovery:se(t.__DSH_CONNECTION_RECOVERY__),...n===void 0?{}:{location:n}})}return n.RpcId=de,n.apply=be,n.inject=ve,n.installConnection=R,n.transportError=P,t.exports}});var n={exports:{}},r=n.exports;Object.defineProperties(r,{__esModule:{value:!0},[Symbol.toStringTag]:{value:`Module`}});var i=Object.create,a=Object.defineProperty,o=Object.getOwnPropertyDescriptor,s=Object.getOwnPropertyNames,c=Object.getPrototypeOf,l=Object.prototype.hasOwnProperty,u=(e,t,n,r)=>{if(t&&typeof t==`object`||typeof t==`function`)for(var i=s(t),c=0,u=i.length,d;c<u;c++)d=i[c],!l.call(e,d)&&d!==n&&a(e,d,{get:(e=>t[e]).bind(null,d),enumerable:!(r=o(t,d))||r.enumerable});return e},d=(e,t,n)=>(n=e==null?{}:i(c(e)),u(t||!e||!e.__esModule||!l.call(e,`default`)?a(n,`default`,{value:e,enumerable:!0}):n,e));let f=e("react/jsx-runtime"),p=e("react");p=d(p,1);let m=e("react-dom"),h=`/plugins/deepseek-harness-chatroom/api`;async function g(e=fetch){let t=Date.now()+15e3;for(;;){let n=await e(`${h}/session`,{credentials:`same-origin`,signal:AbortSignal.timeout(15e3)});if(n.status===503&&Date.now()<t){await new Promise(e=>setTimeout(e,250));continue}if(!n.ok)throw Error(`群聊暂时无法加载（${n.status}），请刷新重试。`);return await n.json()}}function _(e){return Object.values(e.byId).find(e=>(e.retainedBy.mainView??0)>0)?.id}let v=[{id:`whale`,emoji:`🐳`,label:`鲸鱼`},{id:`panda`,emoji:`🐼`,label:`熊猫`},{id:`fox`,emoji:`🦊`,label:`狐狸`},{id:`cat`,emoji:`🐱`,label:`猫咪`},{id:`dog`,emoji:`🐶`,label:`狗狗`},{id:`rabbit`,emoji:`🐰`,label:`兔子`},{id:`octopus`,emoji:`🐙`,label:`章鱼`},{id:`unicorn`,emoji:`🦄`,label:`独角兽`}];function y(e){return typeof e==`string`&&v.some(t=>t.id===e)}function b(e){let t=0;for(let n of e)t=t*31+n.codePointAt(0)>>>0;return v[t%v.length].id}function x(e,t){let n=y(e)?e:b(t);return v.find(e=>e.id===n)}function S(e){return(0,f.jsx)(f.Fragment,{children:e.renderFactorySlot(`conversation.content`,{variant:`embedded`,phase:`active`,hero:!1})})}function C(e,t,n){return`${t.type===`oidc`?`${e}/auth/oidc/${encodeURIComponent(t.id)}/start`:`${e}/auth/dsh-auth/start`}?returnTo=${encodeURIComponent(n)}`}function w({avatarId:e,avatarUrl:t,seed:n,className:r=`dsh-chatroom-avatar`,title:i}){let[a,o]=(0,p.useState)(!1),s=x(e,n),c=T(t)?t:void 0;return(0,p.useEffect)(()=>{o(!1)},[c]),(0,f.jsxs)(`span`,{className:r,"data-avatar":s.id,title:i??s.label,"aria-label":i??s.label,children:[c!==void 0&&!a&&(0,f.jsx)(`img`,{src:c,alt:``,referrerPolicy:`no-referrer`,onError:()=>{o(!0)}}),(0,f.jsx)(`span`,{"aria-hidden":!0,children:s.emoji})]})}function T(e){if(e===void 0)return!1;try{let t=new URL(e);return t.protocol===`https:`&&t.username===``&&t.password===``&&t.hash===``}catch{return!1}}function E(e){let[t,n]=(0,p.useState)(!1),r=x(e.avatarId,e.participantId);return(0,p.useEffect)(()=>{n(!1)},[e.avatarUrl]),(0,f.jsx)(`span`,{className:e.className,"data-avatar":r.id,"data-avatar-source":e.avatarUrl===void 0||t?`fallback`:`enterprise`,title:e.title??r.label,"aria-hidden":!0,children:e.avatarUrl!==void 0&&!t?(0,f.jsx)(`img`,{src:e.avatarUrl,alt:``,referrerPolicy:`no-referrer`,onError:()=>{n(!0)}}):r.emoji})}function D({card:e}){return e.kind===`meeting`?(0,f.jsx)(ee,{card:e}):(0,f.jsxs)(`article`,{className:`dsh-chatroom-external-card dsh-chatroom-document-card`,children:[(0,f.jsx)(`div`,{className:`dsh-chatroom-external-icon`,"aria-hidden":!0,children:`📄`}),(0,f.jsxs)(`div`,{className:`dsh-chatroom-external-copy`,children:[(0,f.jsxs)(`small`,{children:[O(e.url),` · `,te(e.documentType)]}),(0,f.jsx)(`strong`,{children:e.title}),e.owner!==void 0&&(0,f.jsxs)(`span`,{children:[`创建者 · `,e.owner]}),e.modifiedAt!==void 0&&(0,f.jsxs)(`span`,{children:[`更新于 `,e.modifiedAt]})]}),e.url!==void 0&&(0,f.jsx)(`a`,{href:e.url,target:`_blank`,rel:`noreferrer`,children:`打开文档`})]})}function O(e){if(e===void 0)return`企业微信`;try{return new URL(e).hostname.toLocaleLowerCase()===`docs.qq.com`?`腾讯文档`:`企业微信`}catch{return`企业微信`}}function ee({card:e}){let[t,n]=(0,p.useState)();(0,p.useEffect)(()=>{n(void 0);let t=e.id===void 0?e.url===void 0?void 0:`${h}/meetings/resolve?url=${encodeURIComponent(e.url)}`:`${h}/meetings/${encodeURIComponent(e.id)}`;if(t===void 0)return;let r=!0,i,a=async()=>{let e=!1;try{let i=await fetch(t,{credentials:`same-origin`,headers:{Accept:`application/json`}});if(!i.ok)return;let a=await i.json();r&&n(a),e=a.status===`end`&&a.summaryStatus===`completed`}catch{}finally{r&&!e&&(i=window.setTimeout(()=>{a()},3e4))}};return a(),()=>{r=!1,i!==void 0&&window.clearTimeout(i)}},[e.id,e.url]);let r=t?.status??e.status,i=t?.summaryStatus;return(0,f.jsxs)(`article`,{className:`dsh-chatroom-external-card dsh-chatroom-meeting-card`,children:[(0,f.jsx)(`div`,{className:`dsh-chatroom-external-icon`,"aria-hidden":!0,children:`🎥`}),(0,f.jsxs)(`div`,{className:`dsh-chatroom-external-copy`,children:[(0,f.jsxs)(`small`,{children:[`企业微信会议 `,r!==void 0&&(0,f.jsx)(`em`,{children:k(r)})]}),(0,f.jsx)(`strong`,{children:t?.title??e.title}),(t?.beginTime!==void 0||t?.endTime!==void 0||e.beginTime!==void 0||e.endTime!==void 0)&&(0,f.jsx)(`span`,{children:[t?.beginTime??e.beginTime,t?.endTime??e.endTime].filter(Boolean).join(` — `)}),e.location!==void 0&&(0,f.jsxs)(`span`,{children:[`地点 · `,e.location]}),e.attendees!==void 0&&e.attendees.length>0&&(0,f.jsxs)(`span`,{children:[`参与人 · `,e.attendees.join(`、`)]}),r===`end`&&i===`pending`&&(0,f.jsx)(`span`,{children:`AI 会议总结生成中…`}),r===`end`&&i===`failed`&&(0,f.jsx)(`span`,{children:`AI 会议总结将在稍后重试`})]}),e.url!==void 0&&(0,f.jsx)(`a`,{href:e.url,target:`_blank`,rel:`noreferrer`,children:r===`end`?`查看会议`:`加入会议`})]})}function k(e){return e===`started`?`进行中`:e===`end`?`已结束`:e===`init`?`未开始`:e}function te(e){switch(e){case`sheet`:return`在线表格`;case`smartsheet`:return`智能表格`;case`smartpage`:return`智能文档`;case`doc`:return`在线文档`;default:return e??`文档`}}function ne(e){let t;try{t=new URL(e)}catch{return}if(t.protocol!==`https:`)return;let n=t.hostname.toLocaleLowerCase(),r=n===`docs.qq.com`?`tencent-docs`:n===`doc.weixin.qq.com`||n===`page.weixin.qq.com`?`wecom`:void 0;if(r===void 0)return;let i=t.pathname.split(`/`).filter(Boolean),a=i[0]?.toLocaleLowerCase(),o=n===`page.weixin.qq.com`?`smartpage`:a===`doc`?`doc`:a===`sheet`?`sheet`:a===`smartsheet`?`smartsheet`:a===`aio`?`smartpage`:void 0,s=i[1];if(o!==void 0&&s!==void 0&&s!==``)return{url:t.toString(),service:o,documentType:o,source:r,documentId:s}}let re=/https?:\/\/[^\s<>"']+/giu,ie=/[.,!?;:，。！？；：、)\]}】》〉」』]+$/u;function A(e){return[...e.matchAll(re)].flatMap(e=>{let t=e[0].replace(ie,``);if(t===``)return[];try{let e=new URL(t);if(e.protocol!==`http:`&&e.protocol!==`https:`)return[]}catch{return[]}let n=e.index;return[{url:t,start:n,end:n+t.length}]})}function ae({text:e,className:t}){let n=A(e),r=[],i=0;for(let t of n)t.start>i&&r.push(e.slice(i,t.start)),r.push((0,f.jsx)(`a`,{href:t.url,target:`_blank`,rel:`noreferrer`,children:t.url},`${t.start}:${t.url}`)),i=t.end;return i<e.length&&r.push(e.slice(i)),(0,f.jsx)(`span`,{className:t,children:r.length===0?e:r})}function oe({text:e,existingUrls:t=[]}){let n=[...new Set(A(e).map(e=>ne(e.url)?.url).filter(e=>e!==void 0&&!t.includes(e)))];return n.length===0?null:(0,f.jsx)(f.Fragment,{children:n.map(e=>(0,f.jsx)(se,{url:e},e))})}function se({url:e}){let[t,n]=(0,p.useState)();return(0,p.useEffect)(()=>{let t=!0,r=new AbortController,i=globalThis.setTimeout(()=>{r.abort()},5e3);return Promise.resolve().then(async()=>await fetch(`${h}/documents/resolve?url=${encodeURIComponent(e)}`,{credentials:`same-origin`,headers:{Accept:`application/json`},signal:r.signal})).then(async e=>{if(e===void 0||!e.ok)return;let r=await e.json();t&&ce(r)&&n(r)}).catch(()=>{}).finally(()=>{globalThis.clearTimeout(i)}),()=>{t=!1,globalThis.clearTimeout(i),r.abort()}},[e]),t===void 0?null:(0,f.jsx)(D,{card:t})}function ce(e){if(typeof e!=`object`||!e||Array.isArray(e))return!1;let t=e;return t.kind===`document`&&typeof t.title==`string`&&typeof t.url==`string`&&ne(t.url)!==void 0}let j=3e5;function M(e,t,n,r){let i=e[t];if(i===void 0)return`single`;let a=e[t-1],o=e[t+1],s=a!==void 0&&n(a)===n(i)&&r(i)-r(a)>=0&&r(i)-r(a)<=j,c=o!==void 0&&n(o)===n(i)&&r(o)-r(i)>=0&&r(o)-r(i)<=j;return s&&c?`middle`:s?`end`:c?`start`:`single`}function N(e,t,n,r){let i=e[t];if(i===void 0)return`missing:${t}`;let a=t;for(;a>0;){let t=e[a-1],o=e[a],s=r(o)-r(t);if(n(t)!==n(i)||s<0||s>j)break;--a}return`${n(i)}:${r(e[a])}:${a}`}function le(e){let t=F(e);if(t!==void 0)for(let e of fe(t))e.dataset.dshChatroomActionsVisible=String(e===t)}function ue(e){let t=F(e);if(t!==void 0)for(let e of fe(t)){let t=e.dataset.dshChatroomGroupPosition;e.dataset.dshChatroomActionsVisible=String(t===`single`||t===`end`)}}function de(e,t,n){let r=e.closest(`[data-chat-flow-kind]`);if(r===null||r.parentElement===null)return()=>void 0;r.dataset.dshChatroomGroupSender=t,r.dataset.dshChatroomGroupTime=String(n);let i=r.parentElement;return P(i),()=>{delete r.dataset.dshChatroomGroupSender,delete r.dataset.dshChatroomGroupTime,delete r.dataset.dshChatroomGroupPosition,delete r.dataset.dshChatroomActionGroup,delete r.dataset.dshChatroomActionsVisible,queueMicrotask(()=>{i.isConnected&&P(i)})}}function P(e){let t=[...e.children].filter(e=>e instanceof HTMLElement);for(let e of t)delete e.dataset.dshChatroomGroupPosition,delete e.dataset.dshChatroomActionGroup,delete e.dataset.dshChatroomActionsVisible;let n=0;for(;n<t.length;){let e=t[n],r=e.dataset.dshChatroomGroupSender,i=pe(e);if(r===void 0||i===void 0){n+=1;continue}let a=n,o=i;for(;a+1<t.length;){let e=t[a+1],n=pe(e);if(e.dataset.dshChatroomGroupSender!==r||n===void 0||n-o<0||n-o>j)break;a+=1,o=n}for(let e=n;e<=a;e+=1){let o=n===a?`single`:e===n?`start`:e===a?`end`:`middle`,s=t[e];s.dataset.dshChatroomGroupPosition=o,s.dataset.dshChatroomActionGroup=`${r}:${i}:${n}`,s.dataset.dshChatroomActionsVisible=String(o===`single`||o===`end`),s.querySelector(`.dsh-chatroom-participant-message`)?.setAttribute(`data-dsh-chatroom-group-position`,o)}n=a+1}}function F(e){return e.closest(`[data-chat-flow-kind][data-dsh-chatroom-action-group]`)??e.closest(`[data-dsh-chatroom-action-group]`)??void 0}function fe(e){let t=e.dataset.dshChatroomActionGroup,n=e.parentElement;return t===void 0||n===null?[e]:[...n.children].filter(e=>e instanceof HTMLElement&&e.dataset.dshChatroomActionGroup===t)}function pe(e){let t=Number(e.dataset.dshChatroomGroupTime);return Number.isFinite(t)?t:void 0}let me=[`👍`,`❤️`,`😂`,`😮`,`😢`,`🎉`];function I({name:e}){return(0,f.jsxs)(`svg`,{className:`dsh-chatroom-action-icon`,width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:[e===`reply`&&(0,f.jsx)(`path`,{d:`m9 5-6 6 6 6M3 11h10a7 7 0 0 1 7 7`}),e===`copy`&&(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`rect`,{x:`8`,y:`8`,width:`12`,height:`13`,rx:`2`}),(0,f.jsx)(`path`,{d:`M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3`})]}),e===`like`&&(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`path`,{d:`M7 10h3l3-7c3 0 3 3 2 6h4a2 2 0 0 1 2 2l-2 8a2 2 0 0 1-2 2H7z`}),(0,f.jsx)(`path`,{d:`M3 10h4v11H3z`})]}),e===`branch`&&(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`circle`,{cx:`6`,cy:`4`,r:`2`}),(0,f.jsx)(`circle`,{cx:`18`,cy:`6`,r:`2`}),(0,f.jsx)(`circle`,{cx:`6`,cy:`20`,r:`2`}),(0,f.jsx)(`path`,{d:`M6 6v12M18 8v2a4 4 0 0 1-4 4H6`})]}),e===`forward`&&(0,f.jsx)(`path`,{d:`m14 3 7 7-7 7v-4H9a6 6 0 0 0-6 6v-5a7 7 0 0 1 7-7h4z`}),e===`more`&&(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`circle`,{cx:`5`,cy:`12`,r:`1`}),(0,f.jsx)(`circle`,{cx:`12`,cy:`12`,r:`1`}),(0,f.jsx)(`circle`,{cx:`19`,cy:`12`,r:`1`})]}),e===`check`&&(0,f.jsx)(`path`,{d:`m5 12 4 4L19 6`})]})}async function L(e){if(navigator.clipboard?.writeText!==void 0)try{return await navigator.clipboard.writeText(e),!0}catch{return!1}if(typeof document.execCommand!=`function`)return!1;let t=document.createElement(`textarea`);t.value=e,t.style.position=`fixed`,t.style.left=`-9999px`,document.body.append(t),t.select();try{return document.execCommand(`copy`)}catch{return!1}finally{t.remove()}}function he({text:e}){let[t,n]=(0,p.useState)(!1);return e===``?null:(0,f.jsxs)(`button`,{type:`button`,"aria-label":t?`已复制`:`复制`,title:t?`已复制`:`复制`,onClick:()=>{t||L(e).then(e=>{e&&(n(!0),globalThis.setTimeout(()=>{n(!1)},1e3))})},children:[(0,f.jsx)(I,{name:t?`check`:`copy`}),(0,f.jsx)(`span`,{className:`dsh-chatroom-action-label`,children:t?`已复制`:`复制`})]})}function ge({tools:e,showTime:t=!1}){let[n,r]=(0,p.useState)(!1),i=e.copyText;if((0,p.useEffect)(()=>{if(!n)return;let e=()=>{r(!1)},t=t=>{t.key===`Escape`&&e()};return document.addEventListener(`pointerdown`,e),document.addEventListener(`keydown`,t),()=>{document.removeEventListener(`pointerdown`,e),document.removeEventListener(`keydown`,t)}},[n]),e.recalled)return null;let a=e.identity!==void 0,o=e.reactions.some(t=>t.messageId===e.message.messageId&&t.emoji===`👍`&&t.participantIds.includes(e.identity?.participantId??``));return i===void 0&&!a&&!t?null:(0,f.jsxs)(`div`,{className:`dsh-chatroom-message-actions`,children:[e.onReply!==void 0&&(0,f.jsxs)(`button`,{type:`button`,"aria-label":`回复`,onClick:e.onReply,children:[(0,f.jsx)(I,{name:`reply`}),(0,f.jsx)(`span`,{className:`dsh-chatroom-action-label`,children:`回复`})]}),i!==void 0&&(0,f.jsx)(he,{text:i}),a&&(0,f.jsxs)(`button`,{type:`button`,"aria-label":o?`取消点赞`:`点赞`,"aria-pressed":o,onClick:()=>{e.toggleReaction(e.roomId,e.message.messageId,`👍`)},children:[(0,f.jsx)(I,{name:`like`}),(0,f.jsx)(`span`,{className:`dsh-chatroom-action-label`,children:o?`已赞`:`点赞`})]}),e.onBranch!==void 0&&(0,f.jsxs)(`button`,{type:`button`,"aria-label":`分支`,onClick:e.onBranch,children:[(0,f.jsx)(I,{name:`branch`}),(0,f.jsx)(`span`,{className:`dsh-chatroom-action-label`,children:`分支`})]}),a&&(0,f.jsxs)(`button`,{type:`button`,"aria-label":`转发`,onClick:()=>{e.openForward(e.roomId,e.message)},children:[(0,f.jsx)(I,{name:`forward`}),(0,f.jsx)(`span`,{className:`dsh-chatroom-action-label`,children:`转发`})]}),(a||i!==void 0||e.onBranch!==void 0)&&(0,f.jsxs)(`span`,{className:`dsh-chatroom-inline-reaction-control`,children:[(0,f.jsx)(`button`,{type:`button`,"aria-label":`更多消息操作`,"aria-expanded":n,onClick:()=>{r(e=>!e)},children:(0,f.jsx)(I,{name:`more`})}),n&&(0,f.jsxs)(`span`,{className:`dsh-chatroom-action-overflow`,role:`menu`,"aria-label":`更多消息操作`,onPointerDown:e=>{e.stopPropagation()},children:[a&&(0,f.jsx)(`span`,{className:`dsh-chatroom-inline-reactions`,"aria-label":`贴表情`,children:me.map(t=>(0,f.jsx)(`button`,{type:`button`,"aria-label":`贴表情 ${t}`,title:`贴表情 ${t}`,onClick:()=>{e.toggleReaction(e.roomId,e.message.messageId,t),r(!1)},children:t},t))}),a&&(0,f.jsx)(`button`,{type:`button`,role:`menuitem`,onClick:()=>{e.toggleSelection(e.roomId,e.message),r(!1)},children:e.selected?`✓ 取消选择`:`☑ 多选`}),e.canRecall&&(0,f.jsx)(`button`,{type:`button`,role:`menuitem`,onClick:()=>{e.recallMessage(e.roomId,e.message.messageId),r(!1)},children:`↶ 撤回`})]})]}),t&&(0,f.jsx)(`time`,{className:`dsh-chatroom-inline-time`,children:_e(e.message.createdAt)})]})}function _e(e){return new Date(e).toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`})}function ve({tools:e}){return!e.selecting||e.recalled?null:(0,f.jsxs)(`label`,{className:`dsh-chatroom-selection-checkbox`,title:e.selected?`取消选择`:`选择消息`,children:[(0,f.jsx)(`input`,{type:`checkbox`,"aria-label":`${e.selected?`取消选择`:`选择`} ${e.message.displayName} 的消息`,checked:e.selected,onChange:()=>{e.toggleSelection(e.roomId,e.message)}}),(0,f.jsx)(`span`,{"aria-hidden":!0,children:e.selected?`✓`:``})]})}function ye(){let[e,t]=(0,p.useState)();return(0,p.useEffect)(()=>{if(e===void 0)return;let n=()=>{t(void 0)},r=e=>{e.key===`Escape`&&n()};return document.addEventListener(`pointerdown`,n),document.addEventListener(`keydown`,r),()=>{document.removeEventListener(`pointerdown`,n),document.removeEventListener(`keydown`,r)}},[e]),{position:e,open:e=>{e.preventDefault(),e.stopPropagation(),t({x:Math.max(8,Math.min(e.clientX,globalThis.innerWidth-248)),y:Math.max(8,Math.min(e.clientY,globalThis.innerHeight-248))})},close:()=>{t(void 0)}}}function R(e){if(e.recalled)return null;let t=e.reactions.filter(t=>t.messageId===e.message.messageId&&t.participantIds.length>0);return t.length===0?null:(0,f.jsx)(`div`,{className:`dsh-chatroom-reaction-bar`,children:t.map(t=>(0,f.jsxs)(`button`,{type:`button`,"aria-label":`${t.emoji} ${t.participantIds.length}`,"aria-pressed":t.participantIds.includes(e.identity?.participantId??``),disabled:e.identity===void 0,onClick:()=>{e.toggleReaction(e.roomId,e.message.messageId,t.emoji)},children:[(0,f.jsx)(`span`,{children:t.emoji}),(0,f.jsx)(`small`,{children:t.participantIds.length})]},t.emoji))})}function be({tools:e,position:t,close:n}){if(t===void 0||e.identity===void 0||e.recalled)return null;let r=e.copyText;return(0,f.jsxs)(`div`,{className:`dsh-chatroom-context-menu`,style:{left:t.x,top:t.y},role:`menu`,onPointerDown:e=>{e.stopPropagation()},children:[(0,f.jsx)(`div`,{className:`dsh-chatroom-context-reactions`,"aria-label":`贴表情`,children:me.map(t=>(0,f.jsx)(`button`,{type:`button`,title:`贴表情 ${t}`,onClick:()=>{e.toggleReaction(e.roomId,e.message.messageId,t),n()},children:t},t))}),r!==void 0&&(0,f.jsxs)(`button`,{type:`button`,role:`menuitem`,onClick:()=>{L(r),n()},children:[(0,f.jsx)(`span`,{"aria-hidden":!0,children:`▣`}),` 复制`]}),e.onReply!==void 0&&(0,f.jsxs)(`button`,{type:`button`,role:`menuitem`,onClick:()=>{e.onReply?.(),n()},children:[(0,f.jsx)(`span`,{"aria-hidden":!0,children:`↩`}),` 回复`]}),(0,f.jsxs)(`button`,{type:`button`,role:`menuitem`,onClick:()=>{e.openForward(e.roomId,e.message),n()},children:[(0,f.jsx)(`span`,{"aria-hidden":!0,children:`↗`}),` 转发`]}),(0,f.jsxs)(`button`,{type:`button`,role:`menuitem`,onClick:()=>{e.toggleSelection(e.roomId,e.message),n()},children:[(0,f.jsx)(`span`,{"aria-hidden":!0,children:e.selected?`✓`:`☑`}),` `,e.selected?`取消选择`:`多选`]}),e.onBranch!==void 0&&(0,f.jsxs)(`button`,{type:`button`,role:`menuitem`,onClick:()=>{e.onBranch?.(),n()},children:[(0,f.jsx)(`span`,{"aria-hidden":!0,children:`⑂`}),` 分支`]}),e.canRecall&&(0,f.jsxs)(`button`,{type:`button`,role:`menuitem`,onClick:()=>{e.recallMessage(e.roomId,e.message.messageId),n()},children:[(0,f.jsx)(`span`,{"aria-hidden":!0,children:`↶`}),` 撤回`]})]})}function z({rootRef:e,className:t,own:n,role:r=`human`,groupPosition:i,actionGroup:a,avatar:o,displayName:s,reply:c,body:l,footer:u,tools:d}){let p=ye(),m=i===void 0?void 0:i===`single`||i===`end`;return(0,f.jsxs)(`div`,{ref:e,className:[`dsh-chatroom-participant-message`,t].filter(Boolean).join(` `),"data-dsh-chatroom-message-id":d.message.messageId,"data-dsh-chatroom-own":n,"data-own":n,"data-role":r,"data-dsh-chatroom-group-position":i,"data-dsh-chatroom-action-group":a,"data-dsh-chatroom-actions-visible":m,"data-dsh-chatroom-selection-mode":d.selecting||void 0,"data-dsh-chatroom-selected":d.selected||void 0,onPointerEnter:e=>{le(e.currentTarget)},onPointerLeave:e=>{ue(e.currentTarget)},onContextMenu:p.open,children:[(0,f.jsx)(ve,{tools:d}),o,(0,f.jsxs)(`div`,{className:`dsh-chatroom-message-column`,children:[s!==void 0&&(0,f.jsx)(`div`,{className:`dsh-chatroom-display-name`,children:s}),!d.recalled&&c!==void 0&&(0,f.jsxs)(`div`,{className:`dsh-chatroom-reply-quote`,children:[(0,f.jsxs)(`strong`,{children:[`回复 `,c.displayName]}),(0,f.jsx)(`span`,{children:c.text})]}),l,(0,f.jsx)(R,{...d}),u,(0,f.jsx)(ge,{tools:d,showTime:!0})]}),(0,f.jsx)(be,{tools:d,position:p.position,close:p.close})]})}function xe(e){if(!e.startsWith(`⁣dsh-chatroom:`))return;let t=e.indexOf(`⁣`,14);if(t<0)return;let n=e.slice(14,t),r=n.indexOf(`|`),i=r<0?n:n.slice(0,r);if(i===``)return;let a=r<0?void 0:n.slice(r+1);return{participantId:i,avatarId:y(a)?a:b(i),length:t+1}}function Se(e){if(!e.startsWith(`⁣dsh-chatroom-reply:`))return{text:e};let t=e.indexOf(`⁣`,20);if(t<0)return{text:e};let n=Ne(e.slice(20,t));if(!Pe(n))return{text:e};let r=e.slice(t+1),i=ke(n);return r.startsWith(i)&&(r=r.slice(i.length)),{text:r,reply:n}}function Ce(e){let t=[],n=e;for(;;){let e=n.indexOf(`⁣dsh-chatroom-file:`);if(e<0)break;let r=n.indexOf(`⁣`,e+19);if(r<0)break;let i=Ne(n.slice(e+19,r));if(!Fe(i))break;t.push(i);let a=n.slice(0,e).replace(/\n$/u,``),o=n.slice(r+1),s=Ae(i);o.startsWith(s)&&(o=o.slice(s.length)),n=`${a}${o}`}return{text:n,files:t}}function we(e){if(!e.startsWith(`⁣dsh-chatroom-forward:`))return{text:e};let t=e.indexOf(`⁣`,22);if(t<0)return{text:e};let n=Ne(e.slice(22,t));if(!Ie(n))return{text:e};let r=e.slice(t+1),i=je(n);return r.startsWith(i)&&(r=r.slice(i.length)),{text:r,forward:n}}function Te(e){let t=[],n=e;for(;;){let e=n.indexOf(`⁣dsh-chatroom-card:`);if(e<0)break;let r=n.indexOf(`⁣`,e+19);if(r<0)break;let i=Ne(n.slice(e+19,r));if(!Re(i))break;t.push(i);let a=n.slice(0,e).replace(/\n$/u,``),o=n.slice(r+1),s=Me(i);o.startsWith(s)&&(o=o.slice(s.length)),n=`${a}${o}`}return{text:n,cards:t}}function Ee(e,t){let n=e.filter(e=>e.type===`text`).map(e=>e.text).join(`
`);return Oe(t).test(n)}function De(e){return e.find(e=>e.type===`text`)?.text.trimStart().startsWith(`/`)??!1}function Oe(e){let t=e.replace(/[.*+?^${}()|[\]\\]/gu,`\\$&`);return RegExp(`@${t}(?=$|[^\\p{L}\\p{N}_])`,`iu`)}function ke(e){return`回复 ${e.displayName}「${e.text}」\n`}function Ae(e){return`文件：${e.name}`}function je(e){let t=e.items.map(e=>`${e.displayName}：${e.text}`);return`合并转发（${e.items.length} 条）\n${t.join(`
`)}`}function Me(e){if(e.kind===`meeting`){let t=[e.beginTime,e.endTime].filter(e=>e!==void 0).join(` - `);return`企微会议：${e.title}${t===``?``:`（${t}）`}`}return`企微${e.documentType??`文档`}：${e.title}`}function Ne(e){try{return JSON.parse(decodeURIComponent(e))}catch{return}}function Pe(e){if(typeof e!=`object`||!e)return!1;let t=e;return typeof t.messageId==`string`&&typeof t.displayName==`string`&&typeof t.text==`string`}function Fe(e){if(typeof e!=`object`||!e)return!1;let t=e;return typeof t.id==`string`&&typeof t.name==`string`&&typeof t.mediaType==`string`&&typeof t.bytes==`number`}function Ie(e){if(typeof e!=`object`||!e)return!1;let t=e;return typeof t.sourceRoomId!=`string`||typeof t.sourceRoomTitle!=`string`||!Array.isArray(t.items)||t.items.length===0?!1:t.items.every(e=>{if(typeof e!=`object`||!e)return!1;let t=e;return typeof t.messageId==`string`&&(t.role===`human`||t.role===`ai`)&&typeof t.displayName==`string`&&typeof t.text==`string`&&typeof t.createdAt==`number`&&(t.sourceSessionId===void 0||typeof t.sourceSessionId==`string`)&&(t.sourceSeq===void 0||typeof t.sourceSeq==`number`)&&(t.content===void 0||Array.isArray(t.content)&&t.content.every(Le))&&(t.reply===void 0||Pe(t.reply))&&(t.reactions===void 0||Array.isArray(t.reactions)&&t.reactions.every(e=>typeof e==`object`&&!!e&&typeof e.emoji==`string`&&typeof e.count==`number`))})}function Le(e){if(typeof e!=`object`||!e)return!1;let t=e;if(t.type===`text`)return typeof t.text==`string`&&typeof t.markdown==`boolean`;if(t.type===`file`)return Fe(t.file);if(t.type!==`image`||t.image===null||typeof t.image!=`object`)return!1;let n=t.image;return typeof n.attachmentId==`string`&&typeof n.mediaType==`string`&&typeof n.bytes==`number`&&typeof n.width==`number`&&typeof n.height==`number`}function Re(e){if(typeof e!=`object`||!e)return!1;let t=e;if(t.kind!==`meeting`&&t.kind!==`document`||typeof t.title!=`string`||t.title.trim()===``)return!1;if(t.kind===`meeting`){if(t.id!==void 0&&typeof t.id!=`string`)return!1;let n=e;return ze(n.beginTime,n.endTime,n.url,n.location,n.status)&&(n.attendees===void 0||Array.isArray(n.attendees)&&n.attendees.every(e=>typeof e==`string`))}let n=e;return ze(n.documentType,n.url,n.modifiedAt,n.owner)}function ze(...e){return e.every(e=>e===void 0||typeof e==`string`)}function Be(e,t){let n=e.displayName.trim(),r=n.localeCompare(`AI`,void 0,{sensitivity:`accent`})===0||n.localeCompare(`DeepSeek`,void 0,{sensitivity:`accent`})===0,i=t.some(t=>t.participantId!==e.participantId&&t.displayName.trim().localeCompare(n,void 0,{sensitivity:`accent`})===0);return n===``||r||i?e.username:n}function Ve(e){return e.kind===`thread`?e.threadId:e.room.id}var He=class{openSession;nativeOwnershipLookups=new Map;snapshot={branchLink:void 0,open:!1,phase:`loading`,connection:`offline`,rooms:[],room:void 0,roomEnsureSessionId:void 0,identity:void 0,auth:{enabled:!1,authenticated:!0,providers:[],allowSelfRegistration:!0,bootstrapRequired:!1},online:0,members:[],memberCandidates:[],reactions:[],recalls:[],threadPreviews:[],pendingMessages:[],membersOpen:!1,managementBusy:!1,managementError:void 0,error:void 0,composerRoomId:void 0,compositions:{},composerBusy:!1,composerError:void 0,sessionControlBusy:!1,sessionControlError:void 0,wecomBusy:!1,wecomError:void 0,wecomAuthorization:void 0,wecomAuthorizationOpen:!1,thread:void 0,threadMessages:[],threadReply:void 0,threadBusy:!1,threadError:void 0,unreadCount:0,toasts:[],notificationsEnabled:Je()===`granted`,selectionRoomId:void 0,selectedMessages:[],forwardOpen:!1,forwardBusy:!1,forwardError:void 0,accountOpen:!1,accountBusy:!1,accountError:void 0,adminOpen:!1,adminBusy:!1,adminOverview:void 0,adminError:void 0,automationBusy:!1,automationOverview:void 0,automationError:void 0,directOpen:!1,directBusy:!1,directPeers:[],directConversations:[],directConversation:void 0,directMessages:[],directError:void 0,soloSessionIds:[],newSessionModes:{},searchOpen:!1,searchQuery:``,searchBusy:!1,searchResults:[],searchError:void 0};listeners=new Set;eventSource;notificationSource;pendingOpenRoomId;identityPromptedRoomId;stopped=!1;compositionRevision=0;pendingFileSequence=0;searchRevision=0;originalTitle;activeNativeSession;roomEnsure;pendingAutoTriggerWrites=new Map;pendingQuickMeetingTarget;constructor(e=()=>!1,t){this.openSession=e,t!==void 0&&(this.snapshot={...this.snapshot,branchLink:t})}getSnapshot=()=>this.snapshot;roomForSession(e){let t=this.snapshot.rooms.find(t=>t.sessionId===e);if(t!==void 0)return t;let n=this.snapshot.branchLink;if(this.snapshot.thread?.sessionId===e)return this.snapshot.rooms.find(e=>e.id===this.snapshot.thread?.roomId);let r=this.snapshot.threadPreviews.find(t=>t.thread.sessionId===e)?.thread.roomId;if(n?.sessionId===e)return this.snapshot.rooms.find(e=>e.id===n.roomId);if(r!==void 0)return this.snapshot.rooms.find(e=>e.id===r);let i=this.activeNativeSession;if(!(i?.id!==e||i.parentSessionId===void 0||!e.startsWith(`chatroom-thread-v1-`)))return this.snapshot.rooms.find(e=>e.sessionId===i.parentSessionId)}agentTargetForSession(e){let t=this.roomForSession(e);if(t===void 0)return;let n=this.snapshot.branchLink;if(n?.sessionId===e)return{kind:`thread`,room:t,threadId:n.threadId};let r=this.snapshot.thread?.sessionId===e?this.snapshot.thread:this.snapshot.threadPreviews.find(t=>t.thread.sessionId===e)?.thread;return r===void 0?this.activeNativeSession?.id===e&&this.activeNativeSession.parentSessionId!==void 0&&e.startsWith(`chatroom-thread-v1-`)?{kind:`thread`,room:t,threadId:e.slice(19)}:{kind:`room`,room:t}:{kind:`thread`,room:t,threadId:r.id}}registerNewSession=e=>{this.snapshot.auth.enabled&&!this.snapshot.soloSessionIds.includes(e)||this.set({newSessionModes:{...this.snapshot.newSessionModes,[e]:`group`}})};reserveSoloSession=async()=>{let e=await B(`${h}/solo-sessions`,{method:`POST`,headers:{"Content-Type":`application/json`}});return this.set({soloSessionIds:this.snapshot.soloSessionIds.includes(e.sessionId)?this.snapshot.soloSessionIds:[...this.snapshot.soloSessionIds,e.sessionId]}),e.sessionId};releaseSoloSession=async e=>{try{await tt(`${h}/solo-sessions`,{method:`DELETE`,headers:{"Content-Type":`application/json`},body:JSON.stringify({sessionId:e})})}finally{this.set({soloSessionIds:this.snapshot.soloSessionIds.filter(t=>t!==e)})}};canPromptNativeSession(e){return this.snapshot.phase===`ready`?!this.snapshot.auth.enabled||this.snapshot.soloSessionIds.includes(e):!1}resolveNativeOwnership(e){if(this.canPromptNativeSession(e))return Promise.resolve(!0);let t=this.snapshot.identity?.participantId;if(t===void 0||this.snapshot.phase!==`ready`)return Promise.resolve(!1);let n=`${t}:${e}`,r=this.nativeOwnershipLookups.get(n);if(r!==void 0)return r;let i=B(`${h}/session`).then(n=>this.stopped||this.snapshot.identity?.participantId!==t||n.identity?.participantId!==t?!1:(this.set({soloSessionIds:n.soloSessionIds}),n.soloSessionIds.includes(e))).catch(()=>!1).finally(()=>this.nativeOwnershipLookups.delete(n));return this.nativeOwnershipLookups.set(n,i),i}newSessionMode=e=>this.snapshot.newSessionModes[e];chooseNewSessionMode=async(e,t)=>this.snapshot.newSessionModes[e]!==void 0&&(this.set({newSessionModes:{...this.snapshot.newSessionModes,[e]:t},error:void 0}),!0);ensurePromptTarget=async e=>{let t=this.agentTargetForSession(e);return t!==void 0||this.snapshot.newSessionModes[e]!==`group`||this.activeNativeSession?.id!==e?t:(await this.ensureActiveSessionRoom(),this.agentTargetForSession(e))};newGroupInvitees=e=>{let t=this.snapshot.directPeers.filter(e=>e.participantId!==this.snapshot.identity?.participantId);return t.filter(n=>{let r=Be(n,t);return Ee(e,r)||r!==n.username&&Ee(e,n.username)}).map(e=>e.participantId)};subscribe=e=>(this.listeners.add(e),()=>{this.listeners.delete(e)});async start(e){this.stopped=!1,typeof document<`u`&&(this.originalTitle=document.title),await this.loadSession(e)}stop(){this.stopped=!0,this.closeEvents(),this.closeNotifications(),this.updateActiveDocumentRoom(!1),this.updateDocumentTitle(0),this.listeners.clear()}openRoom=()=>{this.set({open:!0,error:void 0})};login=async(e,t)=>{this.set({phase:`loading`,error:void 0});try{let n=await B(`${h}/auth/login`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({username:e,password:t})});return this.acceptSession(n),!0}catch(e){return this.set({phase:`auth-required`,open:!0,error:V(e)}),!1}};register=async e=>{this.set({phase:`loading`,error:void 0});try{let t=await B(`${h}/auth/register`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(e)});return this.acceptSession(t),!0}catch(e){return this.set({phase:`auth-required`,open:!0,error:V(e)}),!1}};logout=async()=>{try{await tt(`${h}/auth/logout`,{method:`POST`})}finally{this.closeEvents(),this.closeNotifications();let e=this.snapshot.auth;this.set({phase:`auth-required`,open:!0,rooms:[],room:void 0,roomEnsureSessionId:void 0,identity:void 0,compositions:{},composerRoomId:void 0,composerBusy:!1,composerError:void 0,auth:{enabled:e.enabled,authenticated:!1,providers:e.providers,allowSelfRegistration:e.allowSelfRegistration,bootstrapRequired:e.bootstrapRequired},accountOpen:!1,accountError:void 0,adminOpen:!1,adminOverview:void 0,directOpen:!1,directConversation:void 0,directMessages:[],soloSessionIds:[],newSessionModes:{},searchOpen:!1,searchBusy:!1,searchResults:[],searchError:void 0})}};openAccount=()=>{!this.snapshot.auth.enabled||!this.snapshot.auth.authenticated||this.set({accountOpen:!0,accountBusy:!1,accountError:void 0,adminOpen:!1,directOpen:!1})};closeAccount=()=>{this.set({accountOpen:!1,accountBusy:!1,accountError:void 0})};changePassword=async(e,t)=>{this.set({accountBusy:!0,accountError:void 0});try{let n=await B(`${h}/account`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({action:`change-password`,currentPassword:e,newPassword:t})});return this.set({accountOpen:!1,accountBusy:!1,accountError:void 0,auth:{...this.snapshot.auth,account:n.account},identity:n.account}),!0}catch(e){return this.set({accountBusy:!1,accountError:V(e)}),!1}};openAdmin=async()=>{if(this.snapshot.auth.account?.role===`super-admin`){this.set({adminOpen:!0,adminBusy:!0,adminError:void 0,directOpen:!1,accountOpen:!1});try{let e=await B(`${h}/admin`);this.set({adminBusy:!1,adminOverview:e})}catch(e){this.set({adminBusy:!1,adminError:V(e)})}}};closeAdmin=()=>{this.set({adminOpen:!1,adminError:void 0})};loadAutomation=async()=>{if(!this.snapshot.automationBusy){this.set({automationBusy:!0,automationError:void 0});try{let e=await B(`${h}/automation`);this.set({automationBusy:!1,automationOverview:e})}catch(e){this.set({automationBusy:!1,automationError:V(e)})}}};saveAutomation=async(e,t,n,r,i,a)=>{if(this.snapshot.automationBusy)return!1;this.set({automationBusy:!0,automationError:void 0});try{let o=await B(`${h}/automation`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({provider:e,model:t,meetingSummaryProvider:n,meetingSummaryModel:r,mainAgentPrompt:i,controllerPrompt:a})});return this.set({automationBusy:!1,automationOverview:o}),!0}catch(e){return this.set({automationBusy:!1,automationError:V(e)}),!1}};adminCreateUser=async e=>this.adminMutation({action:`create-user`,...e});adminUpdateUser=async(e,t)=>this.adminMutation({action:`update-user`,userId:e,...t});adminSetSelfRegistration=async e=>this.adminMutation({action:`settings`,allowSelfRegistration:e});adminSetAutoRedirectProvider=async e=>this.adminMutation({action:`settings`,autoRedirectProviderId:e??null});adminSaveProvider=async e=>this.adminMutation({action:`save-provider`,...e});adminDeleteProvider=async e=>this.adminMutation({action:`delete-provider`,providerId:e});openDirect=async e=>{this.set({directOpen:!0,directBusy:!0,directError:void 0,adminOpen:!1,accountOpen:!1});try{let t=e===void 0?await B(`${h}/direct`):await B(`${h}/direct`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({peerId:e})});this.set({directBusy:!1,directPeers:t.peers,directConversations:t.conversations,directConversation:t.conversation,directMessages:t.messages??[]})}catch(e){this.set({directBusy:!1,directError:V(e)})}};loadDirectDirectory=async()=>{if(this.snapshot.phase!==`ready`||this.snapshot.identity===void 0)return!1;try{let e=await B(`${h}/direct`);return this.set({directPeers:e.peers,directConversations:e.conversations,directError:void 0}),!0}catch(e){return this.set({directError:V(e)}),!1}};closeDirect=()=>{this.set({directOpen:!1,directError:void 0})};openSearch=()=>{this.snapshot.phase===`ready`&&this.set({searchOpen:!0,searchError:void 0,membersOpen:!1,accountOpen:!1,adminOpen:!1})};closeSearch=()=>{this.searchRevision+=1,this.set({searchOpen:!1,searchBusy:!1,searchError:void 0})};searchAll=async e=>{let t=e.normalize(`NFC`).trim(),n=++this.searchRevision;if(t===``){this.set({searchQuery:e,searchBusy:!1,searchResults:[],searchError:void 0});return}this.set({searchQuery:e,searchBusy:!0,searchError:void 0});try{let e=await B(`${h}/search?q=${encodeURIComponent(t)}`);if(n!==this.searchRevision||!this.snapshot.searchOpen)return;this.set({searchBusy:!1,searchResults:e.results,searchError:void 0})}catch(e){if(n!==this.searchRevision||!this.snapshot.searchOpen)return;this.set({searchBusy:!1,searchResults:[],searchError:V(e)})}};openSearchResult=async e=>{if(this.closeSearch(),e.participantId!==void 0&&(e.conversationKind===`direct`||e.kind===`account`||e.kind===`direct`)){await this.openDirect(e.participantId),this.revealSearchMessage(e.messageId);return}if(e.conversationKind===`room`&&e.conversationId!==void 0){await this.selectRoom(e.conversationId),this.revealSearchMessage(e.messageId);return}if(e.sessionId!==void 0){if(this.closeDirect(),this.closeThread(),!this.openSession(e.sessionId)){this.set({error:`暂时无法打开搜索结果对应的会话。`});return}this.revealSearchMessage(e.messageId)}};sendDirect=async(e,t=[],n)=>{let r=this.snapshot.directConversation;if(r===void 0||e.trim()===``&&t.length===0||this.snapshot.directBusy)return!1;this.set({directBusy:!0,directError:void 0});try{let i=await $e(t),a=[...e.trim()===``?[]:[{type:`text`,text:e}],...i],o=await B(`${h}/direct/messages`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({conversationId:r.id,content:a,...n===void 0?{}:{reply:n}})}),s=this.snapshot.directMessages.some(e=>e.id===o.message.id)?this.snapshot.directMessages:[...this.snapshot.directMessages,o.message];return this.set({directBusy:!1,directConversation:o.conversation,directMessages:s,directConversations:qe(this.snapshot.directConversations,o.conversation)}),!0}catch(e){return this.set({directBusy:!1,directError:V(e)}),!1}};toggleDirectReaction=async(e,t,n)=>{try{let r=await B(`${h}/direct/reactions/toggle`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({conversationId:e,messageId:t,emoji:n})});this.set({directMessages:this.snapshot.directMessages.map(e=>e.id===r.id?r:e),directError:void 0})}catch(e){this.set({directError:V(e)})}};openMembers=()=>{if(this.snapshot.room===void 0)return;this.set({membersOpen:!0,memberCandidates:[],thread:void 0,threadMessages:[],threadReply:void 0,threadError:void 0});let e=this.snapshot.members.find(e=>e.participantId===this.snapshot.identity?.participantId)?.role;(e===`owner`||e===`admin`||this.snapshot.auth.account?.role===`super-admin`)&&this.loadRoomMemberCandidates()};loadRoomMemberCandidates=async()=>{let e=this.snapshot.room;if(!(e===void 0||this.snapshot.managementBusy)){this.set({managementBusy:!0,managementError:void 0});try{let t=await B(`${h}/rooms/manage?roomId=${encodeURIComponent(e.id)}`);this.snapshot.room?.id===e.id&&this.applyRoomManagement(t)}catch(e){this.set({managementBusy:!1,managementError:V(e)})}}};completeGroupSetup=async(e,t)=>{let n=this.snapshot.room;return n===void 0||e.trim()===``||t.length===0||e.trim()!==n.title&&!await this.renameRoom(e)?!1:await this.addRoomMembers(t)};closeMembers=()=>{this.set({membersOpen:!1,memberCandidates:[],managementError:void 0})};addRoomMembers=async e=>{let t=this.snapshot.room;if(t===void 0||e.length===0||this.snapshot.managementBusy)return!1;this.set({managementBusy:!0,managementError:void 0});try{let n=await B(`${h}/rooms/manage`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:t.id,action:`add-members`,participantIds:e})});return this.applyRoomManagement(n),!0}catch(e){return this.set({managementBusy:!1,managementError:V(e)}),!1}};setRoomPinned=async(e,t)=>{try{let n=await B(`${h}/rooms/manage`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:e,action:`set-pinned`,pinned:t})});return this.applyRoomManagement(n),!0}catch(e){return this.set({managementError:V(e)}),!1}};setRoomAutoTrigger=e=>{let t=this.snapshot.room;if(t===void 0||this.snapshot.managementBusy)return Promise.resolve(!1);this.set({managementBusy:!0,managementError:void 0});let n=(async()=>{try{let n=await B(`${h}/rooms/manage`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:t.id,action:`set-auto-trigger`,enabled:e})});return this.applyRoomManagement(n),!0}catch(e){return this.set({managementBusy:!1,managementError:V(e)}),!1}})();return this.pendingAutoTriggerWrites.set(t.id,n),n.then(()=>{this.pendingAutoTriggerWrites.get(t.id)===n&&this.pendingAutoTriggerWrites.delete(t.id)}),n};async waitForRoomAutoTrigger(e){let t=this.pendingAutoTriggerWrites.get(e);if(t!==void 0&&!await t)throw Error(this.snapshot.managementError??`自动回复设置保存失败。`)}recallMessage=async(e,t)=>{try{let n=await B(`${h}/messages/recall`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:e,messageId:t})});return this.replaceRecall(n),!0}catch(e){return this.set({composerError:V(e)}),!1}};renameRoom=async e=>{let t=this.snapshot.room;if(t===void 0||this.snapshot.managementBusy)return!1;this.set({managementBusy:!0,managementError:void 0});try{let n=await B(`${h}/rooms/manage`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:t.id,action:`rename`,title:e})});return this.applyRoomManagement(n),!0}catch(e){return this.set({managementBusy:!1,managementError:V(e)}),!1}};setMemberRole=async(e,t)=>{let n=this.snapshot.room;if(n===void 0||this.snapshot.managementBusy)return!1;this.set({managementBusy:!0,managementError:void 0});try{let r=await B(`${h}/rooms/manage`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:n.id,action:`set-role`,participantId:e,role:t})});return this.applyRoomManagement(r),!0}catch(e){return this.set({managementBusy:!1,managementError:V(e)}),!1}};closeRoom=()=>{this.set(this.snapshot.phase===`identity-required`&&this.snapshot.identity!==void 0?{open:!1,phase:`ready`,error:void 0}:{open:!1})};resumeOpen=()=>{let e=this.pendingOpenRoomId;if(e===void 0)return;let t=this.snapshot.rooms.find(t=>t.id===e);t===void 0||!this.openSession(t.sessionId)||(this.pendingOpenRoomId=void 0,this.set({open:!1,error:void 0}))};activateSession=(e,t=`新会话`,n=!0,r)=>{this.activeNativeSession=e===void 0?void 0:{id:e,title:t,shareable:n,...r===void 0?{}:{parentSessionId:r}};let i=(e===void 0?void 0:this.agentTargetForSession(e))?.room;if(i===void 0){this.closeEvents(),this.identityPromptedRoomId=void 0,this.updateActiveDocumentRoom(!1),this.set({room:void 0,roomEnsureSessionId:this.roomEnsure?.sessionId===e?e:void 0,connection:`offline`,online:0,members:[],memberCandidates:[],reactions:[],recalls:[],threadPreviews:[],pendingMessages:[],membersOpen:!1,thread:void 0,threadMessages:[],threadReply:void 0,selectionRoomId:void 0,selectedMessages:[],forwardOpen:!1,directOpen:!1,directError:void 0});return}if(this.updateActiveDocumentRoom(!0),this.snapshot.identity===void 0&&this.identityPromptedRoomId!==i.id&&(this.identityPromptedRoomId=i.id,this.set({open:!0})),this.snapshot.room?.id===i.id&&this.eventSource!==void 0){this.snapshot.directOpen&&this.set({directOpen:!1,directError:void 0});return}this.set({room:i,roomEnsureSessionId:void 0,connection:`connecting`,online:0,members:[],memberCandidates:[],reactions:[],recalls:[],threadPreviews:[],pendingMessages:[],membersOpen:!1,thread:void 0,threadMessages:[],threadReply:void 0,selectionRoomId:void 0,selectedMessages:[],forwardOpen:!1,directOpen:!1,directError:void 0}),this.clearUnread(),this.openEvents(i)};join=async(e,t)=>{let n=this.snapshot.room,r=this.snapshot.connection,i=this.snapshot.online;this.set({phase:`loading`,error:void 0});try{let a=await B(`${h}/session`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({displayName:e,avatarId:t})});if(a.identity===null)throw Error(`服务端没有返回聊天室身份。`);let o=n===void 0?void 0:a.rooms.find(e=>e.id===n.id);this.set({phase:`ready`,open:!1,rooms:a.rooms,room:o,identity:a.identity,connection:o===void 0?`offline`:r,online:o===void 0?0:i,error:void 0}),this.openNotifications(),this.ensureActiveSessionRoom()}catch(e){this.set({phase:`identity-required`,error:V(e)})}};addFiles=(e,t)=>{if(t.length===0)return;let n=this.compositionFor(e),r=t.map(e=>({id:`file-${++this.pendingFileSequence}`,file:e}));this.updateComposition(e,{files:[...n.files,...r],reply:n.reply})};removeFile=(e,t)=>{let n=this.compositionFor(e),r=n.files.filter(e=>e.id!==t);r.length!==n.files.length&&this.updateComposition(e,{files:r,reply:n.reply})};setReply=(e,t)=>{this.updateComposition(e,{...this.compositionFor(e),reply:t})};clearReply=e=>{let t=this.compositionFor(e);t.reply!==void 0&&this.updateComposition(e,{files:t.files,reply:void 0})};toggleReaction=async(e,t,n)=>{try{let r=await B(`${h}/reactions/toggle`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:e,messageId:t,emoji:n})});this.replaceReaction(r)}catch(e){this.set({composerError:V(e)})}};toggleMessageSelection=(e,t)=>{let n=this.snapshot.selectionRoomId===e?this.snapshot.selectedMessages:[],r=n.some(e=>e.messageId===t.messageId)?n.filter(e=>e.messageId!==t.messageId):[...n,t];this.set({selectionRoomId:e,selectedMessages:r,forwardOpen:!1,forwardError:void 0})};openForward=(e,t)=>{let n=this.snapshot.selectionRoomId===e?this.snapshot.selectedMessages:[],r=t===void 0||n.some(e=>e.messageId===t.messageId)?n:[t];r.length!==0&&this.set({selectionRoomId:e,selectedMessages:r,forwardOpen:!0,forwardError:void 0})};clearMessageSelection=()=>{this.set({selectionRoomId:void 0,selectedMessages:[],forwardOpen:!1,forwardBusy:!1,forwardError:void 0})};closeForward=()=>{this.set({forwardOpen:!1,forwardError:void 0})};forwardSelected=async e=>{let t=this.snapshot.selectionRoomId;if(t===void 0||this.snapshot.selectedMessages.length===0||this.snapshot.forwardBusy)return!1;this.set({forwardBusy:!0,forwardError:void 0});try{return await B(`${h}/forward`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({sourceRoomId:t,targetRoomId:e,messages:this.snapshot.selectedMessages})}),this.clearMessageSelection(),!0}catch(e){return this.set({forwardBusy:!1,forwardError:V(e)}),!1}};composition=e=>this.compositionFor(e);completeComposition=e=>{this.compositionFor(e.roomId).revision===e.revision&&this.updateComposition(e.roomId,{files:[],reply:void 0}),this.snapshot.composerBusy&&this.set({composerBusy:!1})};sendFiles=async e=>{let t=this.composition(e);if(!(t.files.length===0||this.snapshot.composerBusy)){this.set({composerBusy:!0,composerError:void 0});try{let n=await Qe(t.files),r=this.snapshot.branchLink,i=this.snapshot.thread?.id===e?this.snapshot.thread:void 0;i!==void 0||r?.threadId===e?await Ze({threadId:i?.id??r.threadId,mode:`queue`,content:n,...t.reply===void 0?{}:{reply:t.reply}}):await Xe({roomId:e,mode:`queue`,content:n,...t.reply===void 0?{}:{reply:t.reply}}),this.completeComposition(t)}catch(e){this.set({composerBusy:!1,composerError:V(e)})}}};updateQueuedPrompt=async(e,t,n)=>{try{let r=await B(`${h}/queue`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({...e,messageId:t,action:n})});return this.set({composerError:void 0}),r.text}catch(e){this.set({composerError:V(e)});return}};selectRoom=async e=>{this.set({directOpen:!1,directError:void 0,error:void 0});try{let t=await B(`${h}/rooms/select`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:e})});this.selectAndOpen(t.room)}catch(e){this.set({phase:`ready`,error:V(e)})}};createRoom=async e=>{this.set({error:void 0});try{let t=await B(`${h}/rooms`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({title:e})});this.selectAndOpen(t.room)}catch(e){this.set({phase:`ready`,error:V(e)})}};stopRoomSession=async e=>{if(this.snapshot.sessionControlBusy)return!1;this.set({sessionControlBusy:!0,sessionControlError:void 0});try{let t=await B(`${h}/rooms/session`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:e,action:`stop`})});return this.applyRoomManagement(t),this.set({sessionControlBusy:!1}),!0}catch(e){return this.set({sessionControlBusy:!1,sessionControlError:V(e)}),!1}};newRoomSession=async e=>{if(this.snapshot.sessionControlBusy)return!1;this.set({sessionControlBusy:!0,sessionControlError:void 0});try{let t=await B(`${h}/rooms/session`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:e,action:`new`})});return this.applyRoomManagement(t),this.set({sessionControlBusy:!1}),!0}catch(e){return this.set({sessionControlBusy:!1,sessionControlError:V(e)}),!1}};quickMeeting=async e=>this.createQuickMeeting({roomId:e});quickThreadMeeting=async e=>this.createQuickMeeting({threadId:e});quickDirectMeeting=async e=>this.createQuickMeeting({directConversationId:e});loadWecomAuthorization=async()=>{try{let e=await B(`${h}/wecom/auth`);this.set({wecomAuthorization:e,wecomError:e.error});let t=e.status===`authorized`?this.pendingQuickMeetingTarget:void 0;return t!==void 0&&(this.pendingQuickMeetingTarget=void 0,await this.publishQuickMeeting(t)),e}catch(e){this.set({wecomError:V(e)});return}};startWecomAuthorization=async()=>{if(this.snapshot.wecomBusy)return!1;this.set({wecomBusy:!0,wecomError:void 0});try{let e=await B(`${h}/wecom/auth`,{method:`POST`});return this.set({wecomBusy:!1,wecomAuthorization:e,wecomAuthorizationOpen:!0}),!0}catch(e){return this.set({wecomBusy:!1,wecomError:V(e)}),!1}};disconnectWecomAuthorization=async()=>{if(this.snapshot.wecomBusy)return!1;this.set({wecomBusy:!0,wecomError:void 0});try{let e=await B(`${h}/wecom/auth`,{method:`DELETE`});return this.pendingQuickMeetingTarget=void 0,this.set({wecomBusy:!1,wecomAuthorization:e,wecomAuthorizationOpen:!1}),!0}catch(e){return this.set({wecomBusy:!1,wecomError:V(e)}),!1}};rebindWecomAuthorization=async()=>await this.disconnectWecomAuthorization()?await this.startWecomAuthorization():!1;closeWecomAuthorization=()=>{this.pendingQuickMeetingTarget=void 0,this.set({wecomAuthorizationOpen:!1,wecomError:void 0})};async createQuickMeeting(e){if(this.snapshot.wecomBusy)return!1;this.set({wecomBusy:!0,wecomError:void 0});let t=await this.loadWecomAuthorization();return t?.status===`authorized`?this.publishQuickMeeting(e):t?.enabled===!0?(this.pendingQuickMeetingTarget=e,this.set({wecomBusy:!1,wecomAuthorizationOpen:!0,wecomError:void 0}),t.status===`unauthorized`&&await this.startWecomAuthorization(),!1):(this.set({wecomBusy:!1,wecomAuthorizationOpen:!1,wecomError:t?.error??`企业微信功能当前不可用，请联系管理员。`}),!1)}async publishQuickMeeting(e){this.set({wecomBusy:!0,wecomError:void 0});try{return await B(`${h}/wecom/quick-meeting`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(e)}),this.pendingQuickMeetingTarget=void 0,this.set({wecomBusy:!1,wecomAuthorizationOpen:!1}),!0}catch(e){return this.set({wecomBusy:!1,wecomError:V(e)}),!1}}openThread=async(e,t)=>{this.set({membersOpen:!1,threadReply:void 0,threadBusy:!0,threadError:void 0});try{let n=await B(`${h}/threads/open`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({roomId:e,root:t})});this.set({thread:n.thread,threadMessages:n.messages,...n.messages.length===0?{}:{threadPreviews:Ue(this.snapshot.threadPreviews,{thread:n.thread,totalMessages:n.messages.length,recentMessages:n.messages.slice(-3)})},threadBusy:!1,threadError:void 0}),this.clearUnread()}catch(e){this.set({threadBusy:!1,threadError:V(e)})}};closeThread=()=>{this.set({thread:void 0,threadMessages:[],threadReply:void 0,threadBusy:!1,threadError:void 0})};setThreadReply=e=>{this.snapshot.thread!==void 0&&this.set({threadReply:e,threadError:void 0})};clearThreadReply=()=>{this.snapshot.threadReply!==void 0&&this.set({threadReply:void 0,threadError:void 0})};sendThreadMessage=async e=>{let t=this.snapshot.thread,n=this.snapshot.threadReply;if(t===void 0||this.snapshot.threadBusy||e.trim()===``)return!1;this.set({threadBusy:!0,threadError:void 0});try{return await B(`${h}/threads/prompt`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({threadId:t.id,mode:`queue`,content:[{type:`text`,text:e}],...n===void 0?{}:{reply:n}})}),this.set({threadReply:void 0,threadBusy:!1,threadError:void 0}),!0}catch(e){return this.set({threadBusy:!1,threadError:V(e)}),!1}};enableSystemNotifications=async()=>{if(typeof Notification>`u`)return;let e=await Notification.requestPermission();this.set({notificationsEnabled:e===`granted`})};dismissToast=e=>{this.set({toasts:this.snapshot.toasts.filter(t=>t.id!==e)})};resetIdentity=async()=>{this.set({open:!0,phase:`identity-required`,error:void 0})};retry=async()=>{this.set({phase:`loading`,error:void 0}),await this.loadSession()};async adminMutation(e){if(this.snapshot.adminBusy)return!1;this.set({adminBusy:!0,adminError:void 0});try{let t=await B(`${h}/admin`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(e)}),n=`overview`in t?t.overview:t;return this.set({adminBusy:!1,adminOverview:n}),!0}catch(e){return this.set({adminBusy:!1,adminError:V(e)}),!1}}acceptSession(e){if(e.identity===null)throw Error(`服务端没有返回登录账号。`);this.set({phase:`ready`,open:!1,connection:`offline`,rooms:e.rooms,soloSessionIds:e.soloSessionIds,identity:e.identity,auth:Ye(e),error:void 0}),this.openNotifications(),this.ensureActiveSessionRoom()}async ensureActiveSessionRoom(){let e=this.activeNativeSession;if(e===void 0||!e.shareable||this.snapshot.phase!==`ready`||this.snapshot.identity===void 0||this.snapshot.newSessionModes[e.id]!==`group`||this.roomForSession(e.id)!==void 0)return;if(this.roomEnsure?.sessionId===e.id)return await this.roomEnsure.promise;let t=(async()=>{this.set({roomEnsureSessionId:e.id,error:void 0});try{let t=await B(`${h}/rooms/ensure`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({sessionId:e.id,title:e.title})}),n=this.snapshot.rooms.some(e=>e.id===t.room.id)?this.snapshot.rooms.map(e=>e.id===t.room.id?t.room:e):[...this.snapshot.rooms,t.room],{[e.id]:r,...i}=this.snapshot.newSessionModes;this.set({rooms:n,soloSessionIds:this.snapshot.soloSessionIds.filter(t=>t!==e.id),newSessionModes:i,error:void 0}),this.activeNativeSession?.id===e.id&&this.activateSession(e.id,e.title,e.shareable)}catch(t){this.activeNativeSession?.id===e.id&&this.set({roomEnsureSessionId:void 0,error:V(t)})}})();this.roomEnsure={sessionId:e.id,promise:t};try{await t}finally{this.roomEnsure?.promise===t&&(this.roomEnsure=void 0)}}selectAndOpen(e){let t=this.snapshot.rooms.some(t=>t.id===e.id)?this.snapshot.rooms.map(t=>t.id===e.id?e:t):[...this.snapshot.rooms,e];this.pendingOpenRoomId=e.id,this.set({phase:`ready`,rooms:t,room:e,connection:`connecting`,online:0,members:[],memberCandidates:[],reactions:[],recalls:[],threadPreviews:[],pendingMessages:[],thread:void 0,threadMessages:[],threadReply:void 0,selectionRoomId:void 0,selectedMessages:[],forwardOpen:!1,directOpen:!1,directError:void 0,error:void 0}),this.openEvents(e),this.resumeOpen()}compositionFor(e){return this.snapshot.compositions[e]??{roomId:e,revision:0,files:[],reply:void 0}}updateComposition(e,t){this.set({composerRoomId:e,compositions:{...this.snapshot.compositions,[e]:{...t,roomId:e,revision:++this.compositionRevision}},composerError:void 0})}async loadSession(e){try{let t=e??await B(`/plugins/deepseek-harness-chatroom/api/session`);if(this.stopped)return;let n=Ye(t);if(n.enabled&&!n.authenticated){this.closeEvents(),this.closeNotifications(),this.set({phase:`auth-required`,open:!0,connection:`offline`,rooms:[],soloSessionIds:[],room:void 0,roomEnsureSessionId:void 0,identity:void 0,compositions:{},composerRoomId:void 0,composerBusy:!1,composerError:void 0,auth:n,online:0,error:void 0});return}if(t.identity===null){this.closeEvents(),this.set({phase:`identity-required`,open:!0,connection:`offline`,rooms:t.rooms,soloSessionIds:t.soloSessionIds,room:void 0,roomEnsureSessionId:void 0,identity:void 0,compositions:{},composerRoomId:void 0,composerBusy:!1,composerError:void 0,auth:n,online:0,error:void 0});return}this.set({phase:`ready`,connection:`offline`,rooms:t.rooms,soloSessionIds:t.soloSessionIds,identity:t.identity,auth:n,error:void 0}),this.openNotifications(),this.ensureActiveSessionRoom()}catch(e){this.stopped||this.set({phase:`error`,connection:`offline`,error:V(e)})}}openEvents(e){if(this.closeEvents(),this.stopped||this.snapshot.identity===void 0)return;this.set({connection:`connecting`});let t=new EventSource(`${h}/events?roomId=${encodeURIComponent(e.id)}`);this.eventSource=t,t.onopen=()=>{this.eventSource===t&&this.set({connection:`online`,error:void 0})},t.onmessage=e=>{if(this.eventSource===t)try{this.receive(JSON.parse(e.data))}catch{this.set({error:`收到无法识别的聊天室同步消息。`})}},t.onerror=()=>{this.eventSource===t&&this.set({connection:`connecting`})}}openNotifications(){if(this.stopped||this.snapshot.identity===void 0||this.notificationSource!==void 0)return;let e=new EventSource(`${h}/notifications`);this.notificationSource=e,e.onmessage=t=>{if(this.notificationSource===e)try{let e=JSON.parse(t.data);e.type===`notification`?this.receiveNotification(e.notification):e.type===`direct-message`&&this.receiveDirectMessage(e)}catch{this.set({error:`收到无法识别的消息提醒。`})}}}closeEvents(){this.eventSource?.close(),this.eventSource=void 0}closeNotifications(){this.notificationSource?.close(),this.notificationSource=void 0}receive(e){switch(e.type){case`snapshot`:{let t=Ke(e.room,e.members),n=We(this.snapshot.rooms,t);this.set({phase:`ready`,connection:`online`,rooms:n,room:t,identity:e.identity,online:e.online,members:e.members,reactions:e.reactions,recalls:e.recalls??[],threadPreviews:e.threadPreviews,pendingMessages:e.pendingMessages??[],error:void 0});return}case`presence`:{let t=this.snapshot.room===void 0?void 0:Ke(this.snapshot.room,e.members);this.set({online:e.online,members:e.members,...t===void 0?{}:{room:t,rooms:We(this.snapshot.rooms,t)}});return}case`pending-messages`:this.set({pendingMessages:e.messages});return;case`thread-message`:this.set({threadPreviews:Ue(this.snapshot.threadPreviews,e.preview),...this.snapshot.thread?.id!==e.message.threadId||this.snapshot.threadMessages.some(t=>t.id===e.message.id)?{}:{threadMessages:[...this.snapshot.threadMessages,e.message]}});return;case`reaction`:this.replaceReaction(e.reaction);return;case`message-recalled`:this.replaceRecall(e.recall);return;case`room-updated`:this.applyRoomManagement({room:e.room,members:e.members});return}}replaceReaction(e){if(this.snapshot.room?.id!==e.roomId)return;let t=this.snapshot.reactions.filter(t=>t.messageId!==e.messageId||t.emoji!==e.emoji);this.set({reactions:e.participantIds.length===0?t:[...t,e]})}replaceRecall(e){if(this.snapshot.room?.id!==e.roomId)return;let t=this.snapshot.recalls.filter(t=>t.messageId!==e.messageId);this.set({recalls:[...t,e],reactions:this.snapshot.reactions.filter(t=>t.messageId!==e.messageId),selectedMessages:this.snapshot.selectedMessages.filter(t=>t.messageId!==e.messageId)})}applyRoomManagement(e){let t=this.snapshot.rooms.find(t=>t.id===e.room.id),n=t?.pinned!==void 0&&e.room.pinned===void 0?{...e.room,pinned:t.pinned}:e.room,r=Ge(this.snapshot.rooms.map(e=>e.id===n.id?n:e)),i=new Set(e.members.map(e=>e.participantId));this.set({rooms:r,...this.snapshot.room?.id===n.id?{room:n,members:e.members}:{},memberCandidates:`candidates`in e?e.candidates:this.snapshot.memberCandidates.filter(e=>!i.has(e.participantId)),managementBusy:!1,managementError:void 0})}receiveNotification(e){if(e.participantId===this.snapshot.identity?.participantId)return;let t=[...this.snapshot.toasts.filter(t=>t.id!==e.id),e].slice(-4),n=typeof document<`u`&&document.visibilityState===`visible`,r=this.snapshot.room?.id===e.roomId&&(e.threadId===void 0||e.threadId===this.snapshot.thread?.id),i=n&&r?this.snapshot.unreadCount:this.snapshot.unreadCount+1,a=Ge(this.snapshot.rooms.map(t=>t.id===e.roomId?{...t,updatedAt:Math.max(t.updatedAt??0,e.createdAt)}:t));if(this.set({toasts:t,unreadCount:i,rooms:a}),this.snapshot.notificationsEnabled&&typeof Notification<`u`&&!n)try{new Notification(`${e.displayName} · ${e.roomTitle}`,{body:e.text})}catch(e){this.set({notificationsEnabled:!1,error:`系统消息提醒失败：${V(e)}`})}globalThis.setTimeout(()=>{this.dismissToast(e.id)},6e3)}receiveDirectMessage(e){let t=qe(this.snapshot.directConversations,e.conversation),n=this.snapshot.directConversation?.id===e.conversation.id,r=this.snapshot.directMessages.some(t=>t.id===e.message.id),i=n?r?this.snapshot.directMessages.map(t=>t.id===e.message.id?e.message:t):[...this.snapshot.directMessages,e.message]:this.snapshot.directMessages,a=e.message.senderId===this.snapshot.identity?.participantId,o=typeof document<`u`&&document.visibilityState===`visible`,s=this.snapshot.directOpen&&n;if(this.set({directConversations:t,...n?{directConversation:e.conversation,directMessages:i}:{},unreadCount:r||a||o&&s?this.snapshot.unreadCount:this.snapshot.unreadCount+1}),!a&&!r){let t={id:e.message.id,roomId:`direct:${e.conversation.id}`,roomTitle:`私聊`,participantId:e.message.senderId,displayName:e.conversation.peer.displayName,role:`human`,text:e.message.text,createdAt:e.message.createdAt},n=[...this.snapshot.toasts.filter(e=>e.id!==t.id),t].slice(-4);if(this.set({toasts:n}),this.snapshot.notificationsEnabled&&typeof Notification<`u`&&!o)try{new Notification(`${e.conversation.peer.displayName} · 私聊`,{body:e.message.text})}catch(e){this.set({notificationsEnabled:!1,error:`系统消息提醒失败：${V(e)}`})}globalThis.setTimeout(()=>{this.dismissToast(t.id)},6e3)}}clearUnread(){this.snapshot.unreadCount!==0&&this.set({unreadCount:0})}updateDocumentTitle(e){typeof document>`u`||this.originalTitle===void 0||(document.title=e===0?this.originalTitle:`(${e}) ${this.originalTitle}`)}updateActiveDocumentRoom(e){typeof document>`u`||document.documentElement.toggleAttribute(`data-dsh-chatroom-active`,e)}revealSearchMessage(e){if(e===void 0||typeof document>`u`)return;let t=0,n=()=>{let r=[...document.querySelectorAll(`[data-dsh-chatroom-message-id]`)].find(t=>t.dataset.dshChatroomMessageId===e);if(r===void 0){t+=1,t<30&&globalThis.setTimeout(n,100);return}r.scrollIntoView({block:`center`,behavior:`smooth`}),r.setAttribute(`data-dsh-chatroom-search-highlight`,``),globalThis.setTimeout(()=>{r.removeAttribute(`data-dsh-chatroom-search-highlight`)},2400)};globalThis.setTimeout(n,0)}set(e){if(!this.stopped){this.snapshot={...this.snapshot,...e},e.unreadCount!==void 0&&this.updateDocumentTitle(this.snapshot.unreadCount);for(let e of this.listeners)e()}}};function Ue(e,t){return[...e.filter(e=>e.thread.id!==t.thread.id),t]}function We(e,t){return Ge(e.some(e=>e.id===t.id)?e.map(e=>e.id===t.id?t:e):[...e,t])}function Ge(e){return[...e].sort((e,t)=>Number(t.pinned===!0)-Number(e.pinned===!0)||(t.updatedAt??0)-(e.updatedAt??0)||e.id.localeCompare(t.id))}function Ke(e,t){if(e.memberAvatars!==void 0)return e;let n=t.slice(0,9);return{...e,memberAvatarIds:n.map(e=>e.avatarId),memberAvatars:n.map(e=>({participantId:e.participantId,avatarId:e.avatarId,...e.avatarUrl===void 0?{}:{avatarUrl:e.avatarUrl}}))}}function qe(e,t){return[t,...e.filter(e=>e.id!==t.id)].sort((e,t)=>t.updatedAt-e.updatedAt)}function Je(){return typeof Notification>`u`?`unsupported`:Notification.permission}function Ye(e){return e.auth??{enabled:!1,authenticated:!0,providers:[],allowSelfRegistration:!0,bootstrapRequired:!1}}async function Xe(e,t){return await B(`${h}/prompt`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(e),...t===void 0?{}:{signal:t}})}async function Ze(e,t){return await B(`${h}/threads/prompt`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(e),...t===void 0?{}:{signal:t}})}async function Qe(e){return await $e(e.map(({file:e})=>e))}async function $e(e){return await Promise.all(e.map(async e=>{let t=rt(new Uint8Array(await e.arrayBuffer()));return e.type===`image/png`||e.type===`image/jpeg`||e.type===`image/webp`||e.type===`image/gif`?{type:`image`,name:e.name,mediaType:e.type,data:t}:{type:`file`,name:e.name,mediaType:e.type===``?`application/octet-stream`:e.type,data:t}}))}var et=class extends Error{status;constructor(e,t){super(t),this.status=e}};async function B(e,t){let n=await fetch(e,{...t,credentials:`same-origin`});if(!n.ok)throw await nt(n);return await n.json()}async function tt(e,t){let n=await fetch(e,{...t,credentials:`same-origin`});if(!n.ok)throw await nt(n)}async function nt(e){let t=`聊天室请求失败（HTTP ${e.status}）。`;try{let n=await e.json();typeof n.error==`string`&&n.error!==``&&(t=n.error)}catch{}return new et(e.status,t)}function V(e){return e instanceof Error?e.message:String(e)}function rt(e){let t=``;for(let n=0;n<e.length;n+=32768)t+=String.fromCharCode(...e.subarray(n,n+32768));return btoa(t)}let it=`😀.😃.😄.😁.😆.😂.🤣.😊.🥰.😍.😘.😋.😎.🤩.🥳.🙂.🤔.🫡.🤗.🤭.😮.😴.😭.😢.😡.🤯.😱.🙃.👍.👎.👏.🙌.🙏.🤝.💪.👌.✌️.🤞.👋.👀.❤️.🧡.💛.💚.💙.💜.💯.🔥.✨.⭐.🎉.🎊.🎁.🚀.💡.✅.❌.⚠️.📌.📝.☕.🍻.🌹.🐳`.split(`.`),at=`dsh-chatroom:restore-draft`;function ot(e,t){globalThis.dispatchEvent(new CustomEvent(at,{detail:{sessionId:e,text:t}}))}function st(e,t){let n=n=>{let r=n.detail;r?.sessionId===e&&t(r.text)};return globalThis.addEventListener(at,n),()=>{globalThis.removeEventListener(at,n)}}function ct({open:e,toggle:t,close:n,pick:r}){let i=(0,p.useRef)(null);return(0,p.useEffect)(()=>{if(!e)return;let t=e=>{i.current?.contains(e.target)||n()};return document.addEventListener(`pointerdown`,t),()=>{document.removeEventListener(`pointerdown`,t)}},[n,e]),(0,f.jsxs)(`div`,{className:`dsh-chatroom-composer-actions`,ref:i,children:[(0,f.jsxs)(`button`,{className:`dsh-chatroom-file-button`,type:`button`,title:`发送表情`,"aria-label":`发送表情`,"aria-expanded":e,onClick:t,children:[(0,f.jsx)(`span`,{"aria-hidden":!0,children:`☺`}),(0,f.jsx)(`span`,{children:`表情`})]}),e&&(0,f.jsx)(`div`,{className:`dsh-chatroom-emoji-picker`,role:`dialog`,"aria-label":`选择表情`,children:it.map(e=>(0,f.jsx)(`button`,{type:`button`,"aria-label":`插入 ${e}`,onClick:()=>{r(e),n()},children:e},e))})]})}function lt({reply:e,clear:t,cancelLabel:n=`取消回复`}){return(0,f.jsxs)(`div`,{className:`dsh-chatroom-reply-preview`,children:[(0,f.jsx)(`button`,{type:`button`,"aria-label":n,onClick:t,children:`×`}),(0,f.jsxs)(`span`,{children:[(0,f.jsxs)(`strong`,{children:[`回复 `,e.displayName,`：`]}),(0,f.jsx)(`small`,{children:e.text})]})]})}function ut({files:e,remove:t,trailing:n}){return(0,f.jsxs)(`div`,{className:`dsh-chatroom-pending-files`,children:[e.map(e=>(0,f.jsxs)(`span`,{className:`dsh-chatroom-pending-file`,children:[(0,f.jsx)(`span`,{"aria-hidden":!0,children:e.file.type.startsWith(`image/`)?`🖼️`:`📎`}),(0,f.jsx)(`span`,{title:e.file.name,children:e.file.name}),(0,f.jsx)(`button`,{type:`button`,"aria-label":`移除 ${e.file.name}`,onClick:()=>{t(e.id)},children:`×`})]},e.id)),n]})}function dt(e){let t=e.useInput(e=>e);e.useChatroom(e=>e);let n=e.resolveTarget(String(e.sessionId)),r=n?.room,i=(0,p.useRef)(null),[a,o]=(0,p.useState)(!1);if(r===void 0||n===void 0)return null;let s=Ve(n);return(0,f.jsxs)(`div`,{className:`dsh-chatroom-composer-actions`,children:[(0,f.jsx)(ct,{open:a,toggle:()=>{o(e=>!e)},close:()=>{o(!1)},pick:n=>{e.inputActions.setDraft(`${t.draft}${n}`)}}),(0,f.jsxs)(`button`,{className:`dsh-chatroom-file-button`,type:`button`,title:`发送图片或文件`,"aria-label":`发送图片或文件`,onClick:()=>{i.current?.click()},children:[(0,f.jsx)(`span`,{"aria-hidden":!0,children:`📎`}),(0,f.jsx)(`span`,{children:`附件`})]}),(0,f.jsx)(`input`,{ref:i,className:`dsh-chatroom-file-input`,"data-testid":`chatroom-file-input`,type:`file`,multiple:!0,onChange:t=>{let n=t.currentTarget.files;n!==null&&e.addFiles(s,[...n]),t.currentTarget.value=``}})]})}function ft(e){let t=e.useSession(e=>e),n=e.useChatroom(e=>e),r=e.resolveTarget(String(e.sessionId));return r===void 0?null:(0,f.jsxs)(`div`,{className:`dsh-chatroom-session-controls`,children:[r.kind===`room`&&(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`button`,{type:`button`,disabled:!t.running||n.sessionControlBusy,onClick:()=>{e.stopRoomSession(r.room.id)},children:`■ 停止`}),(0,f.jsx)(`button`,{type:`button`,disabled:n.sessionControlBusy,onClick:()=>{e.newRoomSession(r.room.id)},children:`＋ 新会话`})]}),(0,f.jsx)(`button`,{type:`button`,className:`dsh-chatroom-quick-meeting`,disabled:n.wecomBusy,onClick:()=>{r.kind===`room`?e.quickMeeting(r.room.id):e.quickThreadMeeting(r.threadId)},children:`⚡ 快速会议`}),n.sessionControlError!==void 0&&(0,f.jsx)(`span`,{className:`dsh-chatroom-control-error`,role:`alert`,title:n.sessionControlError,children:n.sessionControlError}),n.wecomError!==void 0&&(0,f.jsx)(`span`,{className:`dsh-chatroom-control-error`,role:`alert`,title:n.wecomError,children:n.wecomError})]})}function pt(e){let t=e.useInput(e=>e),n=e.useSession(e=>e),r=e.useChatroom(e=>e),i=e.resolveTarget(String(e.sessionId));if((0,p.useEffect)(()=>st(String(e.sessionId),t=>{e.inputActions.setDraft(t)}),[e.inputActions,e.sessionId]),i===void 0)return null;let a=i.room,o=new Set((r.pendingMessages??[]).map(e=>e.messageId)),s=t.queue.filter(e=>!o.has(String(e.id))).map(e=>{let t=e.content.flatMap(e=>e.type===`text`?[e.text]:[]).join(`
`);return{messageId:e.id,text:t,preview:t||`附件消息`}}),c=Ve(i),l=r.composerRoomId===c,u=r.compositions?.[c]?.files??[],d=u.length>0,m=i?.kind===`room`&&a.aiContextResetSeq!==void 0&&a.aiContextStartSeq===void 0;if(s.length===0&&!d&&!m&&(!l||r.composerError===void 0))return null;let h=d&&t.draft.trim()===``&&t.attachmentIds.length===0;return(0,f.jsxs)(`div`,{className:`dsh-chatroom-composer-dock`,"data-testid":`chatroom-composer-dock`,"data-dsh-chatroom-queue-dock":s.length>0||void 0,children:[s.length>0&&(0,f.jsx)(mt,{queue:s,running:n.running,guide:async t=>await e.updateQueuedPrompt(i.kind===`room`?{roomId:a.id}:{threadId:i.threadId},t,`guide`),edit:async t=>{let n=await e.updateQueuedPrompt(i.kind===`room`?{roomId:a.id}:{threadId:i.threadId},t,`edit`);n!==void 0&&e.inputActions.setDraft(n)},remove:async t=>await e.updateQueuedPrompt(i.kind===`room`?{roomId:a.id}:{threadId:i.threadId},t,`delete`)}),m&&(0,f.jsx)(gt,{}),d&&(0,f.jsx)(ut,{files:u,remove:t=>{e.removeFile(c,t)},trailing:h?(0,f.jsx)(`button`,{className:`dsh-chatroom-send-files`,type:`button`,disabled:r.composerBusy,onClick:()=>{e.sendFiles(c)},children:r.composerBusy?`正在发送…`:`发送`}):(0,f.jsx)(`small`,{className:`dsh-chatroom-file-hint`,children:`文件将随当前消息发送`})}),l&&r.composerError!==void 0&&(0,f.jsx)(`div`,{className:`dsh-chatroom-composer-error`,role:`alert`,children:r.composerError})]})}function mt({queue:e,running:t,guide:n,edit:r,remove:i}){let[a,o]=(0,p.useState)(),s=async(e,t)=>{o(e);try{await t()}finally{o(void 0)}};return(0,f.jsx)(`div`,{className:`dsh-chatroom-queued-prompts`,"aria-label":`排队消息`,children:e.map(e=>{let o=String(e.messageId),c=a===o;return(0,f.jsxs)(`div`,{className:`dsh-chatroom-queued-prompt`,children:[(0,f.jsxs)(`div`,{className:`dsh-chatroom-queued-prompt-status`,children:[(0,f.jsx)(`span`,{"aria-hidden":!0,className:`dsh-chatroom-queue-dot`}),(0,f.jsx)(`span`,{children:t?`正在排队 · 等待当前回复完成`:`等待模型响应`})]}),(0,f.jsx)(`div`,{className:`dsh-chatroom-queued-prompt-content`,children:ht(e.text,e.preview)}),(0,f.jsxs)(`div`,{className:`dsh-chatroom-queued-prompt-actions`,children:[(0,f.jsx)(`button`,{type:`button`,disabled:c||!t,onClick:()=>{s(o,async()=>await n(o))},children:`引导对话`}),(0,f.jsx)(`button`,{type:`button`,"aria-label":`编辑排队消息`,disabled:c,onClick:()=>{s(o,async()=>{await r(o)})},children:`编辑`}),(0,f.jsx)(`button`,{type:`button`,"aria-label":`删除排队消息`,disabled:c,onClick:()=>{s(o,async()=>await i(o))},children:`删除`})]})]},o)})})}function ht(e,t){let n=e?.match(/The automatic-response controller selected this chatroom message for an AI response: (.+?)(?:\nChatroom pending source:|$)/s)?.[1];if(n!==void 0)try{let e=JSON.parse(n);return typeof e==`string`?e:t}catch{return t}if(e===null)return t;let r=xe(e);return r===void 0?t:e.slice(r.length).replace(/^[^：]{1,80}：/u,``)}function gt(){return(0,f.jsxs)(`div`,{className:`dsh-chatroom-context-reset`,role:`status`,children:[(0,f.jsx)(`span`,{children:`新的 AI 会话`}),(0,f.jsx)(`small`,{children:`此前群聊消息继续保留`})]})}function _t(e){let t=e.useChatroom(e=>e),n=e.resolveTarget(String(e.sessionId)),r=n===void 0?void 0:Ve(n),i=e.nativeAttachmentsView,a=r===void 0?void 0:t.compositions?.[r]?.reply;return(0,f.jsxs)(f.Fragment,{children:[a!==void 0&&r!==void 0&&(0,f.jsx)(lt,{reply:a,clear:()=>{e.clearReply(r)}}),(0,f.jsx)(i,{...e})]})}function vt(e){return(0,f.jsxs)(f.Fragment,{children:[e.room.directOpen&&(0,f.jsx)(Dt,{...e}),e.room.wecomAuthorizationOpen&&(0,f.jsx)(xt,{...e})]})}function yt(e){let t=e.useChatroom(e=>e),n={...e,room:t},r=t.auth.account?.role===`super-admin`;return(0,p.useEffect)(()=>{r&&e.openAdmin()},[r]),(0,p.useEffect)(()=>{e.loadAutomation?.(),e.loadWecomAuthorization?.()},[]),(0,f.jsxs)(`div`,{className:`dsh-chatroom-settings`,"data-testid":`chatroom-settings`,children:[(0,f.jsx)(`header`,{className:`dsh-chatroom-settings-header`,children:(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`h2`,{children:`群聊与账号`}),(0,f.jsx)(`p`,{children:r?`管理账号、平台成员与企业登录。`:`管理你的账号与协作服务。`})]})}),(0,f.jsx)(St,{...n}),(0,f.jsx)(Ct,{...n}),(0,f.jsx)(bt,{...n}),(0,f.jsx)(Tt,{...n,embedded:!0}),r&&(0,f.jsx)(Et,{...n,embedded:!0})]})}function bt(e){let t=e.room.wecomAuthorization;return(0,f.jsxs)(`section`,{className:`dsh-chatroom-card dsh-chatroom-wecom-account`,"aria-label":`企业微信账号`,children:[(0,f.jsx)(`header`,{children:(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`h2`,{children:`企业微信账号`}),(0,f.jsx)(`p`,{children:`每个平台账号单独授权；会议和文档操作使用当前登录用户自己的企业微信身份。`})]})}),(0,f.jsxs)(`div`,{className:`dsh-chatroom-wecom-account-row`,children:[(0,f.jsx)(`span`,{children:t?.enabled===!0?t.status===`authorized`?`已连接`:t.status===`pending`?`等待扫码确认`:`尚未连接`:`企业微信功能当前不可用，请联系管理员。`}),(0,f.jsxs)(`div`,{className:`dsh-chatroom-wecom-actions`,children:[t?.enabled===!0&&t.status===`authorized`&&(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`button`,{type:`button`,disabled:e.room.wecomBusy,onClick:()=>{globalThis.confirm(`解绑后，只有你自己的快速会议和企业微信 Agent 工具会暂停。确定解绑吗？`)&&e.disconnectWecomAuthorization?.()},children:`解绑`}),(0,f.jsx)(`button`,{type:`button`,disabled:e.room.wecomBusy,onClick:()=>{globalThis.confirm(`重新绑定会先清除你当前的企业微信授权。确定继续吗？`)&&e.rebindWecomAuthorization?.()},children:`重新绑定`})]}),t?.enabled===!0&&t.status!==`authorized`&&(0,f.jsx)(`button`,{type:`button`,disabled:e.room.wecomBusy,onClick:()=>{e.startWecomAuthorization?.()},children:t.status===`pending`?`重新生成二维码`:`扫码连接`})]})]}),e.room.wecomError!==void 0&&(0,f.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.wecomError})]})}function xt(e){let t=e.room.wecomAuthorization,[n,r]=(0,p.useState)(()=>Date.now());return(0,p.useEffect)(()=>{if(t?.status!==`pending`)return;let n=globalThis.setInterval(()=>{e.loadWecomAuthorization?.()},1500);return()=>{globalThis.clearInterval(n)}},[t?.status]),(0,p.useEffect)(()=>{t?.qrAvailable===!0&&r(Date.now())},[t?.qrAvailable]),(0,f.jsx)(`div`,{className:`dsh-chatroom-dialog-layer dsh-chatroom-wecom-auth-layer`,"data-testid":`chatroom-wecom-auth`,onPointerDown:t=>{t.target===t.currentTarget&&e.closeWecomAuthorization()},children:(0,f.jsxs)(`section`,{className:`dsh-chatroom-card dsh-chatroom-wecom-auth-card`,role:`dialog`,"aria-label":`连接企业微信`,children:[(0,f.jsxs)(`header`,{children:[(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`h2`,{children:`连接企业微信`}),(0,f.jsx)(`p`,{children:`请用你自己的企业微信扫码；你的授权与其他平台账号完全隔离。`})]}),(0,f.jsx)(`button`,{"aria-label":`关闭企业微信登录`,type:`button`,onClick:e.closeWecomAuthorization,children:`×`})]}),t?.status===`authorized`?(0,f.jsxs)(`div`,{className:`dsh-chatroom-wecom-auth-success`,children:[(0,f.jsx)(`span`,{"aria-hidden":!0,children:`✓`}),(0,f.jsx)(`strong`,{children:`已连接，可以用你的身份发起会议`})]}):t?.qrAvailable===!0?(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`img`,{className:`dsh-chatroom-wecom-qr`,src:`${h}/wecom/auth/qr?v=${n}`,alt:`企业微信登录二维码`}),(0,f.jsx)(`p`,{className:`dsh-chatroom-panel-status`,children:`请使用企业微信扫码并在手机上确认。`})]}):(0,f.jsx)(`div`,{className:`dsh-chatroom-panel-status`,children:e.room.wecomBusy?`正在生成登录二维码…`:`等待二维码…`}),t?.enabled===!0&&t.status!==`authorized`&&(0,f.jsx)(`button`,{className:`dsh-chatroom-wecom-retry`,type:`button`,disabled:e.room.wecomBusy,onClick:()=>{e.startWecomAuthorization?.()},children:`重新生成二维码`}),e.room.wecomError!==void 0&&(0,f.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.wecomError})]})})}function St(e){let t=e.room.automationOverview,[n,r]=(0,p.useState)(``),[i,a]=(0,p.useState)(``);return(0,p.useEffect)(()=>{t!==void 0&&r(wt(t.provider,t.model)),t!==void 0&&a(wt(t.meetingSummaryProvider,t.meetingSummaryModel))},[t?.provider,t?.model,t?.meetingSummaryProvider,t?.meetingSummaryModel]),e.room.automationBusy&&t===void 0?(0,f.jsx)(`section`,{className:`dsh-chatroom-card dsh-chatroom-automation-card`,children:(0,f.jsx)(`div`,{className:`dsh-chatroom-panel-status`,children:`正在加载 AI 自动响应设置…`})}):t===void 0?(0,f.jsxs)(`section`,{className:`dsh-chatroom-card dsh-chatroom-automation-card`,children:[(0,f.jsx)(`header`,{children:(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`h2`,{children:`AI 自动响应`}),(0,f.jsx)(`p`,{children:`加载判断模型失败。`})]})}),e.room.automationError!==void 0&&(0,f.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.automationError})]}):(0,f.jsxs)(`section`,{className:`dsh-chatroom-card dsh-chatroom-automation-card`,"aria-label":`AI 自动响应设置`,children:[(0,f.jsx)(`header`,{children:(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`h2`,{children:`AI 自动响应`}),(0,f.jsx)(`p`,{children:`各群开启自动响应后，由这个模型判断普通消息是否需要唤起 AI。`})]})}),(0,f.jsxs)(`div`,{className:`dsh-chatroom-automation-form`,children:[(0,f.jsxs)(`label`,{children:[`判断模型`,(0,f.jsx)(`select`,{value:n,disabled:!t.canManage||e.room.automationBusy,onChange:e=>{r(e.target.value)},children:t.models.map(e=>(0,f.jsx)(`option`,{value:wt(e.provider,e.model),children:e.label},wt(e.provider,e.model)))})]}),(0,f.jsxs)(`label`,{children:[`会议总结模型`,(0,f.jsx)(`select`,{value:i,disabled:!t.canManage||e.room.automationBusy,onChange:e=>{a(e.target.value)},children:t.models.map(e=>(0,f.jsx)(`option`,{value:wt(e.provider,e.model),children:e.label},`summary:${wt(e.provider,e.model)}`))})]}),t.canManage&&(0,f.jsx)(`button`,{type:`button`,disabled:e.room.automationBusy||n===wt(t.provider,t.model),onClick:()=>{let r=t.models.find(e=>wt(e.provider,e.model)===n);r!==void 0&&e.saveAutomation?.(r.provider,r.model,t.meetingSummaryProvider,t.meetingSummaryModel,t.mainAgentPrompt,t.controllerPrompt)},children:`保存判断模型`}),t.canManage&&(0,f.jsx)(`button`,{type:`button`,disabled:e.room.automationBusy||i===wt(t.meetingSummaryProvider,t.meetingSummaryModel),onClick:()=>{let n=t.models.find(e=>wt(e.provider,e.model)===i);n!==void 0&&e.saveAutomation?.(t.provider,t.model,n.provider,n.model,t.mainAgentPrompt,t.controllerPrompt)},children:`保存会议总结模型`}),!t.canManage&&(0,f.jsx)(`small`,{children:`只有超级管理员可以修改判断模型。`})]}),e.room.automationError!==void 0&&(0,f.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.automationError})]})}function Ct(e){let t=e.room.automationOverview,[n,r]=(0,p.useState)(``),[i,a]=(0,p.useState)(``);if((0,p.useEffect)(()=>{t!==void 0&&(r(t.mainAgentPrompt),a(t.controllerPrompt))},[t?.mainAgentPrompt,t?.controllerPrompt]),t===void 0)return null;let o=n===t.mainAgentPrompt&&i===t.controllerPrompt;return(0,f.jsxs)(`section`,{className:`dsh-chatroom-card dsh-chatroom-prompt-card`,"aria-label":`Agent 系统提示词设置`,children:[(0,f.jsx)(`header`,{children:(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`h2`,{children:`Agent 系统提示词`}),(0,f.jsx)(`p`,{children:`仅影响聊天室主会话、分支会话和未 @AI 消息的唤起判断。`})]})}),t.canManage?(0,f.jsxs)(`div`,{className:`dsh-chatroom-prompt-form`,children:[(0,f.jsxs)(`label`,{children:[`群聊主 Agent`,(0,f.jsx)(`textarea`,{"aria-label":`群聊主 Agent 系统提示词`,value:n,onChange:e=>{r(e.target.value)}}),(0,f.jsx)(`small`,{children:`作为聊天室主会话和分支 Agent 的系统提示词，下一轮对话生效。`})]}),(0,f.jsxs)(`label`,{children:[`自动回复判断 Agent`,(0,f.jsx)(`textarea`,{"aria-label":`自动回复判断 Agent 系统提示词`,value:i,onChange:e=>{a(e.target.value)}}),(0,f.jsx)(`small`,{children:`用于判断未明确 @AI 的普通消息是否需要唤起；明确 @AI 始终跳过判断并直接唤起。`})]}),(0,f.jsx)(`button`,{type:`button`,disabled:e.room.automationBusy||o,onClick:()=>{e.saveAutomation?.(t.provider,t.model,t.meetingSummaryProvider,t.meetingSummaryModel,n,i)},children:`保存系统提示词`})]}):(0,f.jsx)(`small`,{children:`只有超级管理员可以修改系统提示词。`}),e.room.automationError!==void 0&&(0,f.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.automationError})]})}function wt(e,t){return`${e}\u0000${t}`}function Tt(e){let[t,n]=(0,p.useState)(``),[r,i]=(0,p.useState)(``),[a,o]=(0,p.useState)(``),s=e.room.auth.account,c=(0,f.jsxs)(`section`,{className:`dsh-chatroom-card dsh-chatroom-account-card`,"aria-label":`账号设置`,children:[(0,f.jsxs)(`header`,{children:[(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`h2`,{children:`账号设置`}),(0,f.jsx)(`p`,{children:s===void 0?``:`${s.displayName} · @${s.username}`})]}),!e.embedded&&(0,f.jsx)(`button`,{"aria-label":`关闭账号设置`,type:`button`,onClick:e.closeAccount,children:`×`})]}),s?.passwordManaged!==!1&&(0,f.jsxs)(`form`,{className:`dsh-chatroom-admin-form`,onSubmit:async s=>{s.preventDefault(),r===a&&await e.changePassword(t,r)&&(n(``),i(``),o(``))},children:[(0,f.jsxs)(`label`,{children:[`当前密码`,(0,f.jsx)(`input`,{type:`password`,autoComplete:`current-password`,value:t,onChange:e=>{n(e.target.value)}})]}),(0,f.jsxs)(`label`,{children:[`新密码`,(0,f.jsx)(`input`,{type:`password`,autoComplete:`new-password`,minLength:12,value:r,onChange:e=>{i(e.target.value)}})]}),(0,f.jsxs)(`label`,{children:[`确认新密码`,(0,f.jsx)(`input`,{type:`password`,autoComplete:`new-password`,minLength:12,value:a,onChange:e=>{o(e.target.value)}})]}),a!==``&&a!==r&&(0,f.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:`两次输入的新密码不一致。`}),(0,f.jsx)(`button`,{type:`submit`,disabled:e.room.accountBusy||t===``||r.length<12||r!==a,children:`修改密码`})]}),s?.passwordManaged===!1&&(0,f.jsx)(`p`,{className:`dsh-chatroom-panel-status`,children:`此账号由企业统一登录管理，密码请在企业登录系统中修改。`}),e.room.accountError!==void 0&&(0,f.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.accountError})]});return e.embedded?c:(0,f.jsx)(`div`,{className:`dsh-chatroom-dialog-layer dsh-chatroom-account-layer`,"data-testid":`chatroom-account`,children:c})}function Et(e){let t=e.room.adminOverview,n=e.room.auth.authMode===`dsh-auth-only`,[r,i]=(0,p.useState)(``),[a,o]=(0,p.useState)(``),[s,c]=(0,p.useState)(``),[l,u]=(0,p.useState)(`member`),[d,m]=(0,p.useState)(v[0].id),[h,g]=(0,p.useState)(Lt()),_=(0,f.jsxs)(`section`,{className:`dsh-chatroom-card dsh-chatroom-admin-card`,"aria-label":`系统管理`,children:[(0,f.jsxs)(`header`,{children:[(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`h2`,{children:`系统管理`}),(0,f.jsx)(`p`,{children:`账号、注册策略和企业身份提供方`})]}),!e.embedded&&(0,f.jsx)(`button`,{"aria-label":`关闭系统管理`,type:`button`,onClick:e.closeAdmin,children:`×`})]}),e.room.adminBusy&&t===void 0?(0,f.jsx)(`div`,{className:`dsh-chatroom-panel-status`,children:`正在载入管理数据…`}):t!==void 0&&(0,f.jsxs)(`div`,{className:`dsh-chatroom-admin-layout`,children:[(0,f.jsxs)(`section`,{children:[(0,f.jsx)(`h3`,{children:`注册策略`}),(0,f.jsxs)(`label`,{className:`dsh-chatroom-toggle`,children:[(0,f.jsx)(`input`,{type:`checkbox`,checked:t.allowSelfRegistration,disabled:e.room.adminBusy||n,onChange:t=>{e.adminSetSelfRegistration(t.target.checked)}}),`允许用户使用账号密码自主注册`]}),!n&&(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`h3`,{children:`统一创建账号`}),(0,f.jsxs)(`form`,{className:`dsh-chatroom-admin-form`,onSubmit:async t=>{t.preventDefault(),await e.adminCreateUser({username:r,password:s,displayName:a,avatarId:d,role:l})&&(i(``),c(``),o(``))},children:[(0,f.jsxs)(`label`,{children:[`账号名`,(0,f.jsx)(`input`,{placeholder:`例如 alice`,value:r,onChange:e=>{i(e.target.value)}})]}),(0,f.jsxs)(`label`,{children:[`显示名称`,(0,f.jsx)(`input`,{placeholder:`成员看到的名称`,value:a,onChange:e=>{o(e.target.value)}})]}),(0,f.jsxs)(`label`,{children:[`初始密码`,(0,f.jsx)(`input`,{placeholder:`至少 12 位`,type:`password`,value:s,onChange:e=>{c(e.target.value)}})]}),(0,f.jsxs)(`label`,{children:[`角色`,(0,f.jsxs)(`select`,{value:l,onChange:e=>{u(e.target.value)},children:[(0,f.jsx)(`option`,{value:`member`,children:`成员`}),(0,f.jsx)(`option`,{value:`admin`,children:`管理员`}),(0,f.jsx)(`option`,{value:`super-admin`,children:`超级管理员`})]})]}),(0,f.jsxs)(`fieldset`,{className:`dsh-chatroom-settings-avatar-field`,children:[(0,f.jsx)(`legend`,{children:`头像`}),(0,f.jsx)(`div`,{className:`dsh-chatroom-mini-avatars`,children:v.map(e=>(0,f.jsx)(`button`,{type:`button`,"aria-label":e.label,"aria-pressed":e.id===d,"data-selected":e.id===d,onClick:()=>{m(e.id)},children:e.emoji},e.id))})]}),(0,f.jsx)(`button`,{type:`submit`,disabled:e.room.adminBusy||r===``||a===``||s===``,children:`创建账号`})]})]})]}),(0,f.jsxs)(`section`,{children:[(0,f.jsxs)(`h3`,{children:[`用户 · `,t.users.length]}),(0,f.jsx)(`div`,{className:`dsh-chatroom-user-table`,children:t.users.map(t=>(0,f.jsxs)(`div`,{"data-disabled":t.status===`disabled`,children:[(0,f.jsx)(w,{avatarId:t.avatarId,avatarUrl:t.avatarUrl,seed:t.participantId}),(0,f.jsxs)(`span`,{children:[(0,f.jsx)(`strong`,{children:t.displayName}),(0,f.jsxs)(`small`,{children:[`@`,t.username]})]}),(0,f.jsxs)(`span`,{className:`dsh-chatroom-user-actions`,children:[(0,f.jsxs)(`select`,{"aria-label":`${t.username} 的角色`,value:t.role,disabled:e.room.adminBusy,onChange:n=>{e.adminUpdateUser(t.participantId,{role:n.target.value})},children:[(0,f.jsx)(`option`,{value:`member`,children:`成员`}),(0,f.jsx)(`option`,{value:`admin`,children:`管理员`}),(0,f.jsx)(`option`,{value:`super-admin`,children:`超级管理员`})]}),(0,f.jsx)(`button`,{type:`button`,disabled:e.room.adminBusy,onClick:()=>{e.adminUpdateUser(t.participantId,{status:t.status===`active`?`disabled`:`active`})},children:t.status===`active`?`停用`:`启用`})]})]},t.participantId))})]}),(0,f.jsx)(`section`,{className:`dsh-chatroom-provider-section`,children:n?(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`h3`,{children:`企业统一登录`}),(0,f.jsx)(`p`,{className:`dsh-chatroom-panel-status`,children:`当前部署固定使用 dsh-auth 企业登录；本地密码和 OIDC 提供方已关闭。`})]}):(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`h3`,{children:`企业 SSO / OIDC`}),(0,f.jsxs)(`label`,{className:`dsh-chatroom-admin-field`,children:[`未登录用户入口`,(0,f.jsxs)(`select`,{"aria-label":`未登录用户入口`,value:t.autoRedirectProviderId??``,disabled:e.room.adminBusy,onChange:t=>{e.adminSetAutoRedirectProvider(t.target.value||void 0)},children:[(0,f.jsx)(`option`,{value:``,children:`显示登录与认证选择页`}),t.loginProviders.map(e=>(0,f.jsxs)(`option`,{value:e.id,children:[`自动跳转到 `,e.label]},e.id))]})]}),(0,f.jsxs)(`p`,{className:`dsh-chatroom-callback`,children:[`自动跳转启用后，可在访问地址增加 `,(0,f.jsx)(`code`,{children:`local=1`}),` 打开本地账号应急入口。`]}),t.oidcCallbackBase!==``&&(0,f.jsxs)(`p`,{className:`dsh-chatroom-callback`,children:[`回调地址：`,(0,f.jsxs)(`code`,{children:[t.oidcCallbackBase,h.id||`{providerId}`,`/callback`]})]}),(0,f.jsxs)(`form`,{className:`dsh-chatroom-admin-form dsh-chatroom-provider-form`,onSubmit:async t=>{t.preventDefault(),await e.adminSaveProvider(h)&&g(Lt())},children:[(0,f.jsxs)(`label`,{children:[`Provider ID`,(0,f.jsx)(`input`,{placeholder:`例如 company`,value:h.id,onChange:e=>{g({...h,id:e.target.value})}})]}),(0,f.jsxs)(`label`,{children:[`登录按钮名称`,(0,f.jsx)(`input`,{placeholder:`例如 企业统一登录`,value:h.label,onChange:e=>{g({...h,label:e.target.value})}})]}),(0,f.jsxs)(`label`,{children:[`Issuer URL`,(0,f.jsx)(`input`,{placeholder:`https://id.example.com`,value:h.issuer,onChange:e=>{g({...h,issuer:e.target.value})}})]}),(0,f.jsxs)(`label`,{children:[`Client ID`,(0,f.jsx)(`input`,{value:h.clientId,onChange:e=>{g({...h,clientId:e.target.value})}})]}),(0,f.jsxs)(`label`,{children:[`Client Secret`,(0,f.jsx)(`input`,{placeholder:`编辑时可留空`,type:`password`,value:h.clientSecret??``,onChange:e=>{g({...h,clientSecret:e.target.value})}})]}),(0,f.jsxs)(`label`,{children:[`Scopes`,(0,f.jsx)(`input`,{value:h.scopes,onChange:e=>{g({...h,scopes:e.target.value})}})]}),(0,f.jsxs)(`label`,{children:[`账号 Claim`,(0,f.jsx)(`input`,{value:h.usernameClaim,onChange:e=>{g({...h,usernameClaim:e.target.value})}})]}),(0,f.jsxs)(`label`,{children:[`名称 Claim`,(0,f.jsx)(`input`,{value:h.displayNameClaim,onChange:e=>{g({...h,displayNameClaim:e.target.value})}})]}),(0,f.jsxs)(`label`,{className:`dsh-chatroom-toggle`,children:[(0,f.jsx)(`input`,{type:`checkbox`,checked:h.enabled,onChange:e=>{g({...h,enabled:e.target.checked})}}),`启用`]}),(0,f.jsxs)(`label`,{className:`dsh-chatroom-toggle`,children:[(0,f.jsx)(`input`,{type:`checkbox`,checked:h.autoCreateUsers,onChange:e=>{g({...h,autoCreateUsers:e.target.checked})}}),`首次 SSO 登录自动创建账号`]}),(0,f.jsx)(`button`,{type:`submit`,disabled:e.room.adminBusy,children:`保存提供方`})]}),(0,f.jsx)(`div`,{className:`dsh-chatroom-provider-list`,children:t.providers.map(t=>(0,f.jsxs)(`div`,{children:[(0,f.jsxs)(`span`,{children:[(0,f.jsx)(`strong`,{children:t.label}),(0,f.jsxs)(`small`,{children:[t.id,` · `,t.enabled?`已启用`:`已停用`,` · `,t.issuer]})]}),(0,f.jsxs)(`span`,{className:`dsh-chatroom-provider-actions`,children:[(0,f.jsx)(`button`,{type:`button`,onClick:()=>{g({id:t.id,label:t.label,enabled:t.enabled,issuer:t.issuer,clientId:t.clientId,scopes:t.scopes,usernameClaim:t.usernameClaim,displayNameClaim:t.displayNameClaim,autoCreateUsers:t.autoCreateUsers})},children:`编辑`}),(0,f.jsx)(`button`,{type:`button`,onClick:()=>{e.adminDeleteProvider(t.id)},children:`删除`})]})]},t.id))})]})})]}),e.room.adminError!==void 0&&(0,f.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.adminError})]});return e.embedded?_:(0,f.jsx)(`div`,{className:`dsh-chatroom-dialog-layer dsh-chatroom-admin-layer`,"data-testid":`chatroom-admin`,children:_})}function Dt(e){let[t,n]=(0,p.useState)(``),[r,i]=(0,p.useState)([]),[a,o]=(0,p.useState)(!1),[s,c]=(0,p.useState)(),[l]=(0,p.useState)(()=>It()),u=(0,p.useRef)(null),d=(0,p.useRef)(null),h=(0,p.useRef)(null),g=(0,p.useRef)(null),_=e.room.directConversation;(0,p.useLayoutEffect)(()=>{if(l!==void 0)return l.setAttribute(`data-dsh-chatroom-direct-host`,``),()=>{l.removeAttribute(`data-dsh-chatroom-direct-host`)}},[l]),(0,p.useEffect)(()=>{let e=u.current;e!==null&&(e.scrollTop=e.scrollHeight)},[_?.id,e.room.directMessages.length]),(0,p.useEffect)(()=>{n(``),i([]),o(!1),c(void 0)},[_?.id]);let v=!e.room.directBusy&&(t.trim()!==``||r.length>0),y=(0,f.jsxs)(`main`,{className:`dsh-chatroom-direct-panel`,"aria-label":`私聊`,"data-testid":`chatroom-direct`,children:[(0,f.jsxs)(`header`,{children:[_!==void 0&&(0,f.jsx)(E,{className:`dsh-chatroom-direct-header-avatar`,..._.peer}),(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`strong`,{children:_?.peer.displayName??`私聊`}),(0,f.jsx)(`small`,{children:_===void 0?`从左侧通讯录选择联系人`:`@${_.peer.username}`})]})]}),_===void 0?(0,f.jsx)(`div`,{className:`dsh-chatroom-direct-empty`,children:`从左侧“私聊”通讯录选择一位联系人`}):(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`div`,{ref:u,className:`dsh-chatroom-direct-messages`,children:e.room.directMessages.map((t,n,r)=>(0,f.jsx)(Ot,{message:t,groupPosition:M(r,n,e=>e.senderId,e=>e.createdAt),actionGroup:N(r,n,e=>e.senderId,e=>e.createdAt),peer:_.peer,props:e,setReply:c},t.id))}),(0,f.jsxs)(`form`,{ref:d,className:`dsh-chatroom-direct-composer`,onSubmit:async a=>{a.preventDefault(),v&&(s===void 0?await e.sendDirect(t,r):await e.sendDirect(t,r,s))&&(n(``),i([]),c(void 0))},children:[s!==void 0&&(0,f.jsx)(lt,{reply:s,cancelLabel:`取消私聊引用`,clear:()=>{c(void 0)}}),(0,f.jsx)(`textarea`,{ref:h,"data-dsh-chatroom-direct-input":!0,rows:2,placeholder:`给 ${_.peer.displayName} 发消息`,value:t,onChange:e=>{n(e.target.value)},onKeyDown:e=>{e.key!==`Enter`||e.shiftKey||e.nativeEvent.isComposing||(e.preventDefault(),v&&d.current?.requestSubmit())},onPaste:e=>{let t=[...e.clipboardData.files];t.length>0&&i(e=>[...e,...t])},enterKeyHint:`send`}),r.length>0&&(0,f.jsx)(ut,{files:r.map((e,t)=>({id:`${e.name}-${e.lastModified}-${t}`,file:e})),remove:e=>{i(t=>t.filter((t,n)=>`${t.name}-${t.lastModified}-${n}`!==e))}}),(0,f.jsxs)(`div`,{className:`dsh-chatroom-direct-composer-tools`,children:[(0,f.jsx)(ct,{open:a,toggle:()=>{o(e=>!e)},close:()=>{o(!1)},pick:e=>{n(t=>`${t}${e}`),h.current?.focus()}}),(0,f.jsxs)(`button`,{className:`dsh-chatroom-file-button`,type:`button`,"aria-label":`选择私聊图片或文件`,onClick:()=>{g.current?.click()},children:[`📎 `,(0,f.jsx)(`span`,{children:`附件`})]}),(0,f.jsxs)(`button`,{type:`button`,className:`dsh-chatroom-quick-meeting`,disabled:e.room.wecomBusy,onClick:()=>{e.quickDirectMeeting?.(_.id)},children:[`⚡ `,(0,f.jsx)(`span`,{children:`快速会议`})]}),(0,f.jsx)(`input`,{ref:g,"aria-label":`选择私聊文件`,type:`file`,multiple:!0,onChange:e=>{let t=e.currentTarget.files;t!==null&&i(e=>[...e,...t]),e.currentTarget.value=``}}),(0,f.jsx)(`small`,{children:`Enter 发送 · Shift+Enter 换行`}),(0,f.jsx)(`button`,{className:`dsh-chatroom-direct-send`,"aria-label":`发送私聊消息`,type:`submit`,disabled:!v,children:`↑`})]})]})]}),e.room.directError!==void 0&&(0,f.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.directError})]});return l===void 0?y:(0,m.createPortal)(y,l)}function Ot({message:e,groupPosition:t,actionGroup:n,peer:r,props:i,setReply:a}){let o=e.senderId===i.room.identity?.participantId,s=o?i.room.identity:r,c=kt(e,o?`我`:r.displayName),l={roomId:e.conversationId,message:c,reactions:(e.reactions??[]).map(t=>({roomId:e.conversationId,messageId:e.id,emoji:t.emoji,participantIds:t.participantIds})),identity:i.room.identity,selecting:i.room.selectionRoomId===e.conversationId,selected:i.room.selectionRoomId===e.conversationId&&i.room.selectedMessages.some(t=>t.messageId===e.id),recalled:!1,canRecall:!1,copyText:Pt(e),onReply:()=>{a({messageId:e.id,displayName:c.displayName,text:c.text})},toggleReaction:i.toggleDirectReaction??At,openForward:i.openForward??jt,toggleSelection:i.toggleMessageSelection??Mt,recallMessage:Nt};return(0,f.jsx)(z,{className:`dsh-chatroom-direct-message`,own:o,groupPosition:t,actionGroup:n,avatar:s===void 0?null:(0,f.jsx)(E,{className:`dsh-chatroom-avatar dsh-chatroom-direct-message-avatar`,...s}),displayName:c.displayName,reply:e.reply,tools:l,body:(0,f.jsxs)(f.Fragment,{children:[e.text!==``&&(0,f.jsx)(ae,{className:`dsh-chatroom-human-bubble`,text:e.text}),e.card!==void 0&&(0,f.jsx)(D,{card:e.card}),(0,f.jsx)(oe,{text:e.text,existingUrls:e.card?.url===void 0?[]:[e.card.url]}),e.files!==void 0&&e.files.length>0&&(0,f.jsx)(`div`,{className:`dsh-chatroom-direct-media`,children:e.files.map(e=>{let t=`/plugins/deepseek-harness-chatroom/api/files/${encodeURIComponent(e.id)}`;return e.mediaType.startsWith(`image/`)?(0,f.jsx)(`a`,{href:t,target:`_blank`,rel:`noreferrer`,children:(0,f.jsx)(`img`,{src:t,alt:e.name})},e.id):(0,f.jsxs)(`a`,{className:`dsh-chatroom-direct-file`,href:t,download:e.name,children:[(0,f.jsx)(`span`,{"aria-hidden":!0,children:`📎`}),(0,f.jsxs)(`span`,{children:[(0,f.jsx)(`strong`,{children:e.name}),(0,f.jsx)(`small`,{children:Ft(e.bytes)})]}),(0,f.jsx)(`span`,{"aria-hidden":!0,children:`↓`})]},e.id)})})]})})}function kt(e,t){return{messageId:e.id,role:`human`,displayName:t,text:Pt(e)||`私聊消息`,createdAt:e.createdAt}}let At=async()=>void 0,jt=()=>void 0,Mt=()=>void 0,Nt=async()=>!1;function Pt(e){return e.text.trim()===``?e.card===void 0?e.files?.map(e=>e.name).join(`
`)??``:e.card.kind===`meeting`?`企微会议：${e.card.title}`:`企微文档：${e.card.title}`:e.text}function Ft(e){return e<1024?`${e} B`:e<1048576?`${(e/1024).toFixed(1)} KB`:`${(e/1024/1024).toFixed(1)} MB`}function It(){if(typeof document>`u`)return;let e=document.querySelector(`[data-shell-overlay]`),t=e?.parentElement;if(e==null||t==null)return;let n=[...document.querySelectorAll(`textarea`)].find(e=>!e.hasAttribute(`data-dsh-chatroom-direct-input`));for(;n!==void 0&&n.parentElement!==null&&n.parentElement!==t;)n=n.parentElement;return n?.parentElement===t?n:[...t.children].filter(t=>t instanceof HTMLElement&&t!==e&&!t.hasAttribute(`data-side`)).map(e=>({element:e,area:e.clientWidth*e.clientHeight})).sort((e,t)=>t.area-e.area)[0]?.element}function Lt(){return{id:``,label:``,enabled:!0,issuer:``,clientId:``,scopes:`openid profile email`,usernameClaim:`preferred_username`,displayNameClaim:`name`,autoCreateUsers:!0}}function Rt(e){return(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(Wt,{toasts:e.room.toasts,dismiss:e.dismissToast}),(0,f.jsx)(vt,{...e}),e.room.membersOpen&&(0,f.jsx)(Gt,{...e}),e.room.thread!==void 0&&(0,f.jsx)(Kt,{...e,thread:e.room.thread,open:!0}),e.room.selectionRoomId!==void 0&&(0,f.jsx)(Ht,{...e}),e.room.forwardOpen&&(0,f.jsx)(Ut,{...e}),e.room.searchOpen&&(0,f.jsx)(zt,{...e})]})}function zt(e){let[t,n]=(0,p.useState)(e.room.searchQuery);return(0,p.useEffect)(()=>{let t=t=>{t.key===`Escape`&&e.closeSearch()};return document.addEventListener(`keydown`,t),()=>{document.removeEventListener(`keydown`,t)}},[e.closeSearch]),(0,p.useEffect)(()=>{let n=globalThis.setTimeout(()=>{e.searchAll(t)},180);return()=>{globalThis.clearTimeout(n)}},[e.searchAll,t]),(0,f.jsx)(`div`,{className:`dsh-chatroom-search-layer`,"data-testid":`chatroom-search-dialog`,onPointerDown:t=>{t.target===t.currentTarget&&e.closeSearch()},children:(0,f.jsxs)(`section`,{className:`dsh-chatroom-search-dialog`,role:`dialog`,"aria-modal":`true`,"aria-label":`搜索全部会话`,children:[(0,f.jsxs)(`header`,{children:[(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`strong`,{children:`搜索`}),(0,f.jsx)(`small`,{children:`用户、群聊、私聊、分支与全部聊天内容`})]}),(0,f.jsx)(`button`,{type:`button`,"aria-label":`关闭搜索`,onClick:e.closeSearch,children:`×`})]}),(0,f.jsxs)(`label`,{className:`dsh-chatroom-search-input`,children:[(0,f.jsx)(`span`,{"aria-hidden":!0,children:`⌕`}),(0,f.jsx)(`input`,{autoFocus:!0,type:`search`,value:t,placeholder:`输入用户名、群聊名或消息内容`,"aria-label":`搜索用户名、群聊名或消息内容`,onChange:e=>{n(e.target.value)}}),t!==``&&(0,f.jsx)(`button`,{type:`button`,"aria-label":`清空搜索`,onClick:()=>{n(``)},children:`×`})]}),(0,f.jsxs)(`div`,{className:`dsh-chatroom-search-results`,role:`listbox`,"aria-label":`搜索结果`,children:[e.room.searchResults.map(t=>(0,f.jsxs)(`button`,{type:`button`,role:`option`,"aria-label":`${t.title}，${t.subtitle}`,onClick:()=>{e.openSearchResult(t)},children:[(0,f.jsx)(`span`,{className:`dsh-chatroom-search-result-icon`,"aria-hidden":!0,children:Bt(t.kind)}),(0,f.jsxs)(`span`,{className:`dsh-chatroom-search-result-copy`,children:[(0,f.jsx)(`strong`,{children:t.title}),(0,f.jsx)(`small`,{children:t.subtitle}),t.preview!==void 0&&(0,f.jsx)(`span`,{children:t.preview})]}),t.createdAt!==void 0&&(0,f.jsx)(`time`,{children:Vt(t.createdAt)})]},t.id)),e.room.searchBusy&&(0,f.jsx)(`p`,{role:`status`,children:`正在搜索…`}),!e.room.searchBusy&&e.room.searchError!==void 0&&(0,f.jsx)(`p`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.searchError}),!e.room.searchBusy&&e.room.searchError===void 0&&t.trim()===``&&(0,f.jsx)(`p`,{children:`输入关键词，搜索当前账号可见的全部内容。`}),!e.room.searchBusy&&e.room.searchError===void 0&&t.trim()!==``&&e.room.searchResults.length===0&&(0,f.jsx)(`p`,{children:`没有找到匹配的用户、会话或消息。`})]})]})})}function Bt(e){switch(e){case`account`:return`人`;case`direct`:return`私`;case`room`:return`群`;case`thread`:return`↳`;case`message`:return`文`}}function Vt(e){let t=new Date(e),n=new Date;return t.toDateString()===n.toDateString()?t.toLocaleTimeString(`zh-CN`,{hour:`2-digit`,minute:`2-digit`,hour12:!1}):t.toLocaleDateString(`zh-CN`,{month:`numeric`,day:`numeric`})}function Ht(e){let t=e.room.selectionRoomId;return(0,f.jsxs)(`div`,{className:`dsh-chatroom-selection-bar`,role:`toolbar`,"aria-label":`消息多选`,children:[(0,f.jsxs)(`strong`,{children:[`已选择 `,e.room.selectedMessages.length,` 条消息`]}),(0,f.jsx)(`button`,{type:`button`,disabled:e.room.selectedMessages.length===0,onClick:()=>{t!==void 0&&e.openForward(t)},children:`合并转发`}),(0,f.jsx)(`button`,{type:`button`,onClick:e.clearMessageSelection,children:`取消`})]})}function Ut(e){let t=e.room.rooms.filter(t=>t.id!==e.room.selectionRoomId);return(0,f.jsx)(`div`,{className:`dsh-chatroom-dialog-layer dsh-chatroom-forward-layer`,"data-testid":`chatroom-forward-dialog`,children:(0,f.jsxs)(`section`,{className:`dsh-chatroom-card dsh-chatroom-forward-dialog`,"aria-label":`转发到群聊`,children:[(0,f.jsx)(`button`,{className:`dsh-chatroom-close`,"aria-label":`关闭转发`,type:`button`,onClick:e.closeForward,children:`×`}),(0,f.jsx)(`h2`,{children:`转发到群聊`}),(0,f.jsxs)(`p`,{children:[`将选中的 `,e.room.selectedMessages.length,` 条消息合并成一张聊天记录卡片。`]}),(0,f.jsxs)(`div`,{className:`dsh-chatroom-forward-targets`,children:[t.map(t=>(0,f.jsxs)(`button`,{type:`button`,disabled:e.room.forwardBusy,onClick:()=>{e.forwardSelected(t.id)},children:[(0,f.jsx)(`span`,{children:`＃`}),(0,f.jsx)(`strong`,{children:t.title}),(0,f.jsxs)(`small`,{children:[`@`,t.aiDisplayName]})]},t.id)),t.length===0&&(0,f.jsx)(`div`,{className:`dsh-chatroom-forward-empty`,children:`请先新建另一个群聊，再进行转发。`})]}),e.room.forwardError!==void 0&&(0,f.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.forwardError})]})})}function Wt({toasts:e,dismiss:t}){return e.length===0?null:(0,f.jsx)(`div`,{className:`dsh-chatroom-toast-stack`,role:`status`,"aria-live":`polite`,children:e.map(e=>(0,f.jsxs)(`button`,{className:`dsh-chatroom-toast`,type:`button`,onClick:()=>{t(e.id)},children:[(0,f.jsxs)(`strong`,{children:[e.displayName,` `,(0,f.jsxs)(`small`,{children:[`· `,e.roomTitle,e.threadId===void 0?``:` · 分支`]})]}),(0,f.jsx)(`span`,{children:e.text})]},e.id))})}function Gt(e){let[t,n]=(0,p.useState)(e.room.room?.title??``),[r,i]=(0,p.useState)(``),[a,o]=(0,p.useState)([]),s=e.room.members.find(t=>t.participantId===e.room.identity?.participantId)?.role??`member`,c=s===`owner`||s===`admin`,l=c||e.room.auth.account?.role===`super-admin`,u=r.trim().toLocaleLowerCase(`zh-CN`),d=e.room.memberCandidates.filter(e=>u===``||e.displayName.toLocaleLowerCase(`zh-CN`).includes(u)||e.username.toLocaleLowerCase(`zh-CN`).includes(u));return(0,p.useEffect)(()=>{let t=new Set(e.room.memberCandidates.map(e=>e.participantId));o(e=>e.filter(e=>t.has(e)))},[e.room.memberCandidates]),(0,f.jsxs)(`aside`,{className:`dsh-chatroom-member-card`,"data-testid":`chatroom-members`,"aria-label":`群管理`,children:[(0,f.jsx)(`button`,{className:`dsh-chatroom-close`,"aria-label":`关闭群管理`,type:`button`,onClick:e.closeMembers,children:`×`}),(0,f.jsx)(`h2`,{children:`群管理`}),(0,f.jsxs)(`p`,{children:[e.room.room?.title,` · `,e.room.members.length,` 位成员 · `,e.room.online,` 人在线`]}),l&&(0,f.jsxs)(`section`,{className:`dsh-chatroom-invite`,"aria-label":`添加群成员`,children:[(0,f.jsxs)(`div`,{className:`dsh-chatroom-invite-heading`,children:[(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`strong`,{children:`添加成员`}),(0,f.jsx)(`small`,{children:`从系统中尚未加入本群的启用账号里选择。`})]}),(0,f.jsxs)(`span`,{children:[a.length,` 位已选`]})]}),(0,f.jsx)(`input`,{type:`search`,value:r,placeholder:`搜索姓名或账号`,"aria-label":`搜索系统用户`,onChange:e=>{i(e.target.value)}}),(0,f.jsxs)(`div`,{className:`dsh-chatroom-invite-list`,children:[d.map(t=>{let n=a.includes(t.participantId);return(0,f.jsxs)(`label`,{children:[(0,f.jsx)(`input`,{type:`checkbox`,checked:n,disabled:e.room.managementBusy,onChange:()=>{o(e=>n?e.filter(e=>e!==t.participantId):[...e,t.participantId])}}),(0,f.jsx)(E,{className:`dsh-chatroom-member-avatar`,...t}),(0,f.jsxs)(`span`,{children:[(0,f.jsx)(`strong`,{children:t.displayName}),(0,f.jsxs)(`small`,{children:[`@`,t.username]})]})]},t.participantId)}),d.length===0&&(0,f.jsx)(`p`,{children:e.room.managementBusy?`正在加载系统用户…`:u===``?`所有启用账号都已在群聊中。`:`没有匹配的系统用户。`})]}),(0,f.jsxs)(`button`,{type:`button`,disabled:e.room.managementBusy||a.length===0,onClick:async()=>{await e.addRoomMembers?.(a)&&o([])},children:[`添加选中的 `,a.length,` 位`]})]}),c&&(0,f.jsxs)(`form`,{className:`dsh-chatroom-manage-title`,onSubmit:n=>{n.preventDefault(),e.renameRoom?.(t)},children:[(0,f.jsx)(`input`,{value:t,maxLength:160,"aria-label":`群聊名称`,onChange:e=>{n(e.target.value)}}),(0,f.jsx)(`button`,{type:`submit`,disabled:e.room.managementBusy||t.trim()===``||t.trim()===e.room.room?.title,children:`保存名称`})]}),(0,f.jsxs)(`section`,{className:`dsh-chatroom-auto-trigger`,"aria-label":`AI 自动回复`,children:[(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`strong`,{children:`无需 @AI 自动回复`}),(0,f.jsx)(`small`,{children:`开启后，由设置中选择的判断模型决定普通消息是否需要 AI 回复。群内所有成员都可以修改。`})]}),(0,f.jsxs)(`label`,{className:`dsh-chatroom-switch`,children:[(0,f.jsx)(`input`,{type:`checkbox`,"aria-label":`无需 @AI 自动回复`,checked:e.room.room?.autoTriggerEnabled??!1,disabled:e.room.managementBusy,onChange:t=>{e.setRoomAutoTrigger?.(t.target.checked)}}),(0,f.jsx)(`span`,{"aria-hidden":!0})]})]}),(0,f.jsx)(`div`,{className:`dsh-chatroom-member-list`,children:e.room.members.map(t=>(0,f.jsxs)(`div`,{className:`dsh-chatroom-member`,children:[(0,f.jsx)(E,{className:`dsh-chatroom-member-avatar`,...t}),(0,f.jsxs)(`span`,{children:[(0,f.jsxs)(`strong`,{children:[t.displayName,` `,(0,f.jsx)(`em`,{children:t.role===`owner`?`群主`:t.role===`admin`?`管理员`:``})]}),(0,f.jsx)(`small`,{children:t.online?`在线`:`最近活跃 ${qt(t.lastSeenAt)}`})]}),s===`owner`&&t.role!==`owner`?(0,f.jsx)(`button`,{className:`dsh-chatroom-member-role`,type:`button`,disabled:e.room.managementBusy,onClick:()=>{e.setMemberRole?.(t.participantId,t.role===`admin`?`member`:`admin`)},children:t.role===`admin`?`取消管理员`:`设为管理员`}):(0,f.jsx)(`i`,{"data-online":t.online})]},t.participantId))}),e.room.managementError!==void 0&&(0,f.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.room.managementError}),(0,f.jsx)(`button`,{className:`dsh-chatroom-notification-button`,type:`button`,disabled:e.room.notificationsEnabled,onClick:()=>{e.enableSystemNotifications()},children:e.room.notificationsEnabled?`✓ 系统消息提醒已开启`:`开启系统消息提醒`})]})}function Kt(e){let{thread:t,SessionProvider:n,renderSlot:r,retainBranch:i}=e,[a,o]=(0,p.useState)(),[s,c]=(0,p.useState)();return(0,p.useEffect)(()=>{let e=i(t.sessionId),n=!0;return o(e),c(void 0),e.ready.catch(()=>{n&&c(`分支暂时无法加载，请关闭后重试。`)}),()=>{n=!1,e.release()}},[i,t.sessionId]),(0,p.useEffect)(()=>{let t=t=>{t.key===`Escape`&&e.closeThread()};return document.addEventListener(`keydown`,t),()=>{document.removeEventListener(`keydown`,t)}},[e.closeThread]),(0,f.jsx)(`div`,{className:`dsh-chatroom-thread-layer`,"data-testid":`chatroom-thread-layer`,onPointerDown:t=>{t.target===t.currentTarget&&e.closeThread()},children:(0,f.jsxs)(`aside`,{className:`dsh-chatroom-thread-panel`,"data-testid":`chatroom-thread-panel`,"data-open":e.open,"aria-label":`分支回复`,children:[(0,f.jsxs)(`header`,{children:[(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`strong`,{children:`分支回复`}),(0,f.jsxs)(`small`,{children:[e.room.room?.title??`群聊`,` · `,t.root.displayName,` 发起`]})]}),(0,f.jsxs)(`span`,{className:`dsh-chatroom-thread-header-actions`,children:[(0,f.jsx)(`button`,{"aria-label":`在主视图打开分支`,title:`在主视图打开，查看轨迹与知识来源`,type:`button`,onClick:()=>{e.openBranchSession(t.sessionId)},children:(0,f.jsxs)(`svg`,{width:`18`,height:`18`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,"aria-hidden":`true`,children:[(0,f.jsx)(`path`,{d:`M14 4h6v6m0-6-9 9`}),(0,f.jsx)(`path`,{d:`M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4`})]})}),(0,f.jsx)(`button`,{"aria-label":`关闭分支`,type:`button`,onClick:e.closeThread,children:(0,f.jsx)(`svg`,{width:`18`,height:`18`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,"aria-hidden":`true`,children:(0,f.jsx)(`path`,{d:`m6 6 12 12M6 18 18 6`})})})]})]}),(0,f.jsx)(`div`,{className:`dsh-chatroom-thread-native`,"data-dsh-chatroom-branch-session":t.sessionId,children:s===void 0?a?.sessionId===t.sessionId?(0,f.jsx)(n,{session:a,children:r(`chatroom.branch`,{})}):(0,f.jsx)(`div`,{className:`dsh-chatroom-thread-status`,role:`status`,children:`正在加载分支…`}):(0,f.jsx)(`div`,{className:`dsh-chatroom-thread-error`,role:`alert`,children:s})})]})})}function qt(e){let t=Math.max(0,Math.floor((Date.now()-e)/6e4));return t<1?`刚刚`:t<60?`${t} 分钟前`:t<1440?`${Math.floor(t/60)} 小时前`:`${Math.floor(t/1440)} 天前`}function Jt(e){let t=e.useChatroom(e=>e),n=(0,f.jsx)(Rt,{room:t,...e});return t.open?(0,f.jsxs)(f.Fragment,{children:[(0,f.jsxs)(`div`,{className:`dsh-chatroom-dialog-layer`,"data-dsh-chatroom-entry":!0,"data-testid":`chatroom-dialog`,children:[t.phase===`auth-required`&&(0,f.jsx)(Yt,{room:t,login:e.login,register:e.register}),t.phase===`identity-required`&&(0,f.jsx)(Zt,{room:t,join:e.join,close:e.closeRoom}),t.phase===`loading`&&(0,f.jsx)($t,{title:`正在载入共享会话`,detail:`正在恢复此浏览器的身份与会话目录…`,close:e.closeRoom}),t.phase===`ready`&&t.identity!==void 0&&(0,f.jsx)(Qt,{room:t,selectRoom:e.selectRoom,createRoom:e.createRoom,resetIdentity:e.resetIdentity,logout:e.logout,openAccount:e.openAccount,openAdmin:e.openAdmin,openDirect:e.openDirect,close:e.closeRoom}),t.phase===`error`&&(0,f.jsx)($t,{title:`共享会话暂时不可用`,detail:t.error??`请稍后重试。`,action:`重试`,onAction:e.retry,close:e.closeRoom})]}),n]}):n}function Yt({room:e,login:t,register:n}){let r=e.auth.bootstrapRequired||e.auth.allowSelfRegistration,[i,a]=(0,p.useState)(e.auth.bootstrapRequired?`register`:`login`),[o,s]=(0,p.useState)(``),[c,l]=(0,p.useState)(``),[u,d]=(0,p.useState)(``),[m,h]=(0,p.useState)(``),[g,_]=(0,p.useState)(v[0].id),y=typeof location>`u`?`/`:`${location.pathname}${location.search}`,b=e.auth.bootstrapRequired?void 0:e.auth.autoRedirectProvider,x=e.auth.authMode!==`dsh-auth-only`&&typeof location<`u`&&new URLSearchParams(location.search).get(`local`)===`1`;return(0,p.useEffect)(()=>{b===void 0||x||typeof location>`u`||location.assign(Xt(b,y))},[b,x,y]),b!==void 0&&!x?(0,f.jsxs)(`section`,{className:`dsh-chatroom-card dsh-chatroom-auth-card`,role:`status`,children:[(0,f.jsxs)(`h2`,{children:[`正在前往 `,b.label]}),(0,f.jsx)(`p`,{children:`正在打开企业统一登录…`})]}):(0,f.jsxs)(`section`,{className:`dsh-chatroom-card dsh-chatroom-auth-card`,"aria-label":`系统登录`,children:[(0,f.jsxs)(`div`,{className:`dsh-chatroom-auth-brand`,children:[(0,f.jsx)(`strong`,{children:`DeepSeek Harness`}),(0,f.jsx)(`span`,{children:`团队协作平台`})]}),(0,f.jsx)(`h2`,{children:i===`login`?`登录`:e.auth.bootstrapRequired?`创建超级管理员`:`注册账号`}),(0,f.jsxs)(`div`,{className:`dsh-chatroom-auth-tabs`,children:[(0,f.jsx)(`button`,{type:`button`,"data-active":i===`login`,onClick:()=>{a(`login`)},children:`登录`}),r&&(0,f.jsx)(`button`,{type:`button`,"data-active":i===`register`,onClick:()=>{a(`register`)},children:`注册`})]}),(0,f.jsxs)(`form`,{onSubmit:r=>{r.preventDefault(),i===`login`?t(o,c):n({username:o,password:c,displayName:u,avatarId:g,...e.auth.bootstrapRequired?{bootstrapToken:m}:{}})},children:[(0,f.jsxs)(`label`,{children:[`账号`,(0,f.jsx)(`input`,{autoFocus:!0,autoComplete:`username`,value:o,onChange:e=>{s(e.target.value)}})]}),(0,f.jsxs)(`label`,{children:[`密码`,(0,f.jsx)(`input`,{type:`password`,autoComplete:i===`login`?`current-password`:`new-password`,value:c,onChange:e=>{l(e.target.value)}})]}),i===`register`&&(0,f.jsxs)(f.Fragment,{children:[(0,f.jsxs)(`label`,{children:[`显示名称`,(0,f.jsx)(`input`,{value:u,onChange:e=>{d(e.target.value)}})]}),e.auth.bootstrapRequired&&(0,f.jsxs)(`label`,{children:[`初始化口令`,(0,f.jsx)(`input`,{type:`password`,value:m,onChange:e=>{h(e.target.value)}})]}),(0,f.jsxs)(`fieldset`,{className:`dsh-chatroom-avatar-fieldset`,children:[(0,f.jsx)(`legend`,{children:`选择头像`}),(0,f.jsx)(`div`,{className:`dsh-chatroom-avatar-grid`,role:`radiogroup`,"aria-label":`选择头像`,children:v.map(e=>(0,f.jsx)(`button`,{className:`dsh-chatroom-avatar-choice`,"data-avatar":e.id,"data-selected":e.id===g,type:`button`,role:`radio`,"aria-checked":e.id===g,onClick:()=>{_(e.id)},children:e.emoji},e.id))})]})]}),(0,f.jsx)(`button`,{className:`dsh-chatroom-button`,type:`submit`,disabled:o.trim()===``||c===``||i===`register`&&u.trim()===``,children:i===`login`?`登录`:`创建账号`})]}),e.auth.providers.length>0&&(0,f.jsxs)(`div`,{className:`dsh-chatroom-sso-list`,children:[(0,f.jsx)(`span`,{children:`或使用企业账号`}),e.auth.providers.map(e=>(0,f.jsxs)(`a`,{href:Xt(e,y),children:[`使用 `,e.label,` 登录`]},e.id))]}),e.error!==void 0&&(0,f.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.error})]})}function Xt(e,t){return C(h,e,t)}function Zt({room:e,join:t,close:n}){let[r,i]=(0,p.useState)(e.identity?.displayName??``),[a,o]=(0,p.useState)(e.identity?.avatarId??v[0].id);return(0,f.jsxs)(`form`,{className:`dsh-chatroom-card`,onSubmit:e=>{e.preventDefault(),t(r,a)},children:[(0,f.jsx)(`button`,{className:`dsh-chatroom-close`,"aria-label":`关闭`,type:`button`,onClick:n,children:`×`}),(0,f.jsx)(`h2`,{children:`共享会话`}),(0,f.jsx)(`p`,{children:`选择你在共享会话中显示的名字和头像。`}),(0,f.jsx)(`input`,{className:`dsh-chatroom-name`,"data-testid":`chatroom-identity-input`,autoFocus:!0,maxLength:80,placeholder:`你的名字`,value:r,onChange:e=>{i(e.target.value)}}),(0,f.jsxs)(`fieldset`,{className:`dsh-chatroom-avatar-fieldset`,children:[(0,f.jsx)(`legend`,{children:`选择头像`}),(0,f.jsx)(`div`,{className:`dsh-chatroom-avatar-grid`,role:`radiogroup`,"aria-label":`选择头像`,children:v.map(e=>(0,f.jsx)(`button`,{className:`dsh-chatroom-avatar-choice`,"data-avatar":e.id,"data-selected":e.id===a,type:`button`,role:`radio`,"aria-checked":e.id===a,"aria-label":e.label,onClick:()=>{o(e.id)},children:e.emoji},e.id))})]}),(0,f.jsx)(`button`,{className:`dsh-chatroom-button`,"data-testid":`chatroom-join`,type:`submit`,disabled:r.trim()===``,children:`继续`}),e.error!==void 0&&(0,f.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.error})]})}function Qt({room:e,selectRoom:t,createRoom:n,resetIdentity:r,logout:i,openAccount:a,openAdmin:o,openDirect:s,close:c}){let[l,u]=(0,p.useState)(``);return(0,f.jsxs)(`div`,{className:`dsh-chatroom-card dsh-chatroom-room-card`,children:[(0,f.jsx)(`button`,{className:`dsh-chatroom-close`,"aria-label":`关闭`,type:`button`,onClick:c,children:`×`}),(0,f.jsx)(`h2`,{children:`共享会话`}),(0,f.jsxs)(`p`,{children:[`普通消息只在人类之间聊天；输入 `,(0,f.jsx)(`code`,{children:`@AI`}),` 或 `,(0,f.jsxs)(`code`,{children:[`@`,e.rooms[0]?.aiDisplayName??`DeepSeek`]}),` 才会触发 AI 回复。`]}),(0,f.jsx)(`div`,{className:`dsh-chatroom-room-list`,"data-testid":`chatroom-room-list`,children:e.rooms.map(n=>(0,f.jsxs)(`button`,{className:`dsh-chatroom-room-item`,"data-active":n.id===e.room?.id,"data-testid":`chatroom-room-${n.id}`,type:`button`,onClick:()=>{t(n.id)},children:[(0,f.jsx)(`span`,{children:n.title}),(0,f.jsxs)(`small`,{children:[`@`,n.aiDisplayName]})]},n.id))}),(0,f.jsxs)(`form`,{className:`dsh-chatroom-create`,onSubmit:e=>{e.preventDefault(),l.trim()!==``&&n(l)},children:[(0,f.jsx)(`input`,{className:`dsh-chatroom-name`,"data-testid":`chatroom-title-input`,maxLength:160,placeholder:`新共享会话名称`,value:l,onChange:e=>{u(e.target.value)}}),(0,f.jsx)(`button`,{className:`dsh-chatroom-create-button`,"data-testid":`chatroom-create`,type:`submit`,disabled:l.trim()===``,children:`新建`})]}),(0,f.jsxs)(`div`,{className:`dsh-chatroom-card-footer`,children:[(0,f.jsxs)(`span`,{children:[`当前身份：`,e.identity===void 0?``:(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(w,{className:`dsh-chatroom-member-avatar`,avatarId:e.identity.avatarId,avatarUrl:e.identity.avatarUrl,seed:e.identity.participantId}),` `,e.identity.displayName]})]}),(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`button`,{type:`button`,onClick:()=>{s()},children:`私聊`}),e.auth.enabled&&(0,f.jsx)(`button`,{type:`button`,onClick:a,children:`账号设置`}),e.auth.account?.role===`super-admin`&&(0,f.jsx)(`button`,{type:`button`,onClick:()=>{o()},children:`系统管理`}),e.auth.enabled?(0,f.jsx)(`button`,{type:`button`,onClick:()=>{i()},children:`退出登录`}):(0,f.jsx)(`button`,{type:`button`,onClick:()=>{r()},children:`更换身份`})]})]}),e.error!==void 0&&(0,f.jsx)(`div`,{className:`dsh-chatroom-error`,role:`alert`,children:e.error})]})}function $t({title:e,detail:t,action:n,onAction:r,close:i}){return(0,f.jsxs)(`div`,{className:`dsh-chatroom-card`,role:`status`,children:[(0,f.jsx)(`button`,{className:`dsh-chatroom-close`,"aria-label":`关闭`,type:`button`,onClick:i,children:`×`}),(0,f.jsx)(`h2`,{children:e}),(0,f.jsx)(`p`,{children:t}),n!==void 0&&(0,f.jsx)(`button`,{className:`dsh-chatroom-button`,type:`button`,onClick:()=>{r?.()},children:n})]})}function en({preview:e,open:t}){return e===void 0?null:(0,f.jsxs)(`button`,{className:`dsh-chatroom-thread-activity`,type:`button`,"aria-label":`打开分支，${e.totalMessages} 条回复`,disabled:t===void 0,onClick:t,children:[(0,f.jsxs)(`span`,{className:`dsh-chatroom-thread-activity-heading`,children:[(0,f.jsx)(`span`,{"aria-hidden":!0,children:`⑂`}),` 分支 · `,e.totalMessages,` 条回复`]}),(0,f.jsx)(`span`,{className:`dsh-chatroom-thread-activity-list`,children:e.recentMessages.map(e=>(0,f.jsxs)(`span`,{children:[(0,f.jsx)(w,{className:`dsh-chatroom-member-avatar`,avatarId:e.avatarId,avatarUrl:e.avatarUrl,seed:e.participantId}),(0,f.jsx)(`strong`,{children:e.displayName}),(0,f.jsx)(`span`,{children:e.text})]},e.id))})]})}function tn(e){let t=e.useChatroom(e=>e),n=t.rooms.find(t=>t.sessionId===String(e.sessionId)),r=e.resolveTarget?.(String(e.sessionId))??(n===void 0?void 0:{kind:`room`,room:n}),i=r?.room,a=e.useChat(t=>t.legacy.nodes.find(t=>t.kind===`assistant`&&t.messageId===e.messageId)),o=(0,p.useRef)(null),s=ye(),c=t.selectionRoomId===i?.id&&t.selectedMessages.some(t=>t.messageId===String(e.messageId)),l=t.selectionRoomId===i?.id;if((0,p.useEffect)(()=>{let t=o.current?.closest(`[data-turn-tail], [data-dsh-chatroom-standalone-assistant]`);if(t==null||i===void 0)return;let n=o.current?.parentElement;for(;n!=null&&n.parentElement!==null&&n.parentElement!==t;)n=n.parentElement;n?.setAttribute(`data-dsh-chatroom-native-actions`,``);let r=e=>{s.open(e)};return t.addEventListener(`contextmenu`,r),t.dataset.dshChatroomMessageId=String(e.messageId),t.toggleAttribute(`data-dsh-chatroom-selected`,c),t.toggleAttribute(`data-dsh-chatroom-selection-mode`,l),()=>{t.removeEventListener(`contextmenu`,r),t.removeAttribute(`data-dsh-chatroom-selected`),t.removeAttribute(`data-dsh-chatroom-selection-mode`),delete t.dataset.dshChatroomMessageId,n?.removeAttribute(`data-dsh-chatroom-native-actions`)}},[s.open,e.messageId,i,c,l]),i===void 0||a?.kind!==`assistant`)return null;let u=a.blocks.flatMap(e=>e.kind===`text`?[e.text]:[]).join(``).trim().replace(/\s+/gu,` `),d={messageId:String(e.messageId),displayName:i.aiDisplayName,text:[...u||`AI 回复`].slice(0,120).join(``)},m={...d,sourceSessionId:String(e.sessionId),sourceSeq:a.seq,role:`ai`,createdAt:a.time,content:a.blocks.reduce((e,t)=>(t.kind===`text`&&e.push({type:`text`,text:t.text,markdown:!0}),t.kind===`image`&&e.push({type:`image`,image:{...t.attachment,attachmentId:String(t.attachment.attachmentId)}}),e),[])},h={...d,role:`ai`,sourceSessionId:m.sourceSessionId,sourceSeq:m.sourceSeq},g={roomId:i.id,message:m,reactions:t.reactions,identity:t.identity,selecting:l,selected:c,recalled:!1,canRecall:!1,copyText:u||`AI 回复`,onReply:()=>{e.setReply(r===void 0?i.id:Ve(r),d)},onBranch:r?.kind===`thread`?void 0:()=>{e.openThread(i.id,h)},toggleReaction:e.toggleReaction,openForward:e.openForward,toggleSelection:e.toggleMessageSelection,recallMessage:e.recallMessage},_=t.threadPreviews.find(e=>e.thread.root.messageId===m.messageId&&e.thread.root.role===`ai`);return(0,f.jsxs)(`div`,{className:`dsh-chatroom-assistant-tools`,ref:o,children:[(0,f.jsx)(ve,{tools:g}),(0,f.jsxs)(`div`,{className:`dsh-chatroom-assistant-actions`,children:[(0,f.jsx)(R,{...g}),(0,f.jsx)(ge,{tools:g})]}),r?.kind!==`thread`&&(0,f.jsx)(en,{preview:_,open:()=>{e.openThread(i.id,h)}}),(0,f.jsx)(be,{tools:g,position:s.position,close:s.close})]})}function nn(e){let{message:t}=e,[n,r]=(0,p.useState)(!1),i={roomId:t.roomId},a={messageId:t.messageId,role:`human`,displayName:t.displayName,text:t.text,createdAt:t.createdAt,content:t.content,...t.reply===void 0?{}:{reply:t.reply},...t.forward===void 0?{}:{forward:t.forward}},o=async n=>{r(!0);try{let r=await e.update(i,t.messageId,n);n===`edit`&&r!==void 0&&ot(e.sessionId,r)}finally{r(!1)}};return(0,f.jsx)(z,{className:`dsh-chatroom-pending-message`,own:e.own,avatar:(0,f.jsx)(w,{avatarId:t.avatarId,avatarUrl:t.avatarUrl,seed:t.participantId}),displayName:t.displayName,reply:t.reply,tools:{roomId:t.roomId,message:a,reactions:[],identity:void 0,selecting:!1,selected:!1,recalled:!1,canRecall:!1,copyText:t.text,toggleReaction:async()=>void 0,openForward:()=>void 0,toggleSelection:()=>void 0,recallMessage:async()=>!1},body:(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(ae,{className:`dsh-chatroom-human-bubble`,text:t.text}),t.content.flatMap((e,t)=>e.type===`text`?[]:e.type===`file`?[(0,f.jsxs)(`a`,{className:`dsh-chatroom-file-card`,href:`${h}/files/${encodeURIComponent(e.file.id)}`,download:e.file.name,children:[(0,f.jsx)(`span`,{"aria-hidden":!0,children:`📎`}),(0,f.jsx)(`strong`,{children:e.file.name}),(0,f.jsx)(`span`,{"aria-hidden":!0,children:`↓`})]},`${e.file.id}:${t}`)]:[(0,f.jsx)(`span`,{className:`dsh-chatroom-pending-image`,children:`🖼️ 图片已发送`},`${e.image.attachmentId}:${t}`)])]}),footer:t.status===`passive`?void 0:(0,f.jsxs)(`div`,{className:`dsh-chatroom-pending-control`,role:`status`,children:[(0,f.jsxs)(`span`,{children:[(0,f.jsx)(`i`,{"aria-hidden":!0}),rn(t.status)]}),e.own&&t.status!==`guiding`&&(0,f.jsxs)(`span`,{className:`dsh-chatroom-pending-actions`,children:[(0,f.jsx)(`button`,{type:`button`,disabled:n,onClick:()=>{o(`guide`)},children:`引导`}),(0,f.jsx)(`button`,{type:`button`,disabled:n,onClick:()=>{o(`edit`)},children:`编辑`}),(0,f.jsx)(`button`,{type:`button`,disabled:n,onClick:()=>{o(`delete`)},children:`撤回`})]})]})})}function rn(e){switch(e){case`deciding`:return`正在判断是否需要 AI 回复`;case`queued`:return`正在排队 · 等待当前回复完成`;case`guiding`:return`正在引导当前回复`;case`passive`:return``}}let an=new Set([`assistant-step`,`context`,`retry`,`tool-call`]);function on(e){let t=e.nativeMessageView,n=(0,p.useRef)(null),[r,i]=(0,p.useState)(!1),a=e.node.data.finalNode,o=e.useTurnData(`turn-tail`),s=e.resolveTarget?.(String(e.sessionId)),c=s!==void 0,l=c&&a!==void 0&&o?.closing?.finalNode.seq===a.seq,u=c&&a!==void 0&&!l&&e.node.data.blocks.some(e=>e.kind===`text`&&e.text.trimStart().startsWith(`## 会议总结 ·`))?a.messageId:void 0,d=u!==void 0,m=e.useChat(t=>{let n=t.order.indexOf(e.node.key);return n<0?!1:t.order.slice(n+1).every(e=>t.nodes.get(e)?.kind!==`assistant-step`)}),h=e.useChatroom(e=>s?.kind===`room`&&m?e.pendingMessages.filter(e=>e.roomId===s.room.id):[]),g=e.useChatroom(e=>e.identity),_=e.useChat(t=>{if(!l)return``;let n=e.node.data.turn;return t.order.flatMap(r=>{let i=t.nodes.get(r);if(i===void 0||i.key===e.node.key)return[];let a=i.location;return(a.kind===`turn`||a.kind===`step`?a.turn.turn:void 0)===n&&an.has(i.kind)?[i.key]:[]}).join(`\0`)}),v=(0,p.useMemo)(()=>_===``?[]:_.split(`\0`),[_]),y=l?e.node.data.blocks.filter(e=>e.kind===`reasoning`&&e.text.trim()!==``).length:0,b=v.length+y,x=e.node.data.blocks.flatMap(e=>e.kind===`text`?Te(e.text).cards:[]),S=[];for(let t of e.node.data.blocks){if(t.kind!==`text`){S.push(t);continue}let e=Te(t.text);e.text.trim()!==``&&S.push({...t,text:e.text})}let C=x.length===0?e.node:{...e.node,data:{...e.node.data,blocks:S}};return(0,p.useEffect)(()=>{let e=n.current,t=e?.closest(`[data-chat-flow]`);if(e===null||!l)return;let i=new Set(v),a=t==null?[]:[...t.querySelectorAll(`[data-chat-flow-key]`)].filter(e=>i.has(e.dataset.chatFlowKey??``)),o=[...e.querySelectorAll(`[data-variant="think"]`)],s=[...a,...o].map(e=>({row:e,hidden:e.hidden}));for(let{row:e}of s)e.dataset.dshChatroomProcessRow=``,e.hidden=!r;return()=>{for(let{row:e,hidden:t}of s)e.hidden=t,delete e.dataset.dshChatroomProcessRow}},[l,r,v]),(0,f.jsxs)(`div`,{className:`dsh-chatroom-assistant-turn`,ref:n,"data-dsh-chatroom-standalone-assistant":d||void 0,children:[l&&b>0&&(0,f.jsxs)(`button`,{type:`button`,className:`dsh-chatroom-process-toggle`,"aria-expanded":r,onClick:()=>{i(e=>!e)},children:[(0,f.jsx)(`span`,{"aria-hidden":!0,className:`dsh-chatroom-process-chevron`,children:`⌄`}),(0,f.jsxs)(`span`,{children:[r?`收起执行过程`:`执行过程`,` · `,b,` 项`]})]}),(0,f.jsx)(t,{...e,node:C}),x.map((e,t)=>(0,f.jsx)(D,{card:e},`${e.kind}:${e.title}:${t}`)),d&&(0,f.jsx)(tn,{...e,messageId:u}),h.length>0&&(0,f.jsx)(`div`,{className:`dsh-chatroom-pending-stream`,"aria-label":`已发送的排队消息`,children:h.map(t=>(0,f.jsx)(nn,{message:t,own:t.participantId===g?.participantId,sessionId:String(e.sessionId),update:e.updateQueuedPrompt},t.messageId))})]})}var sn={af:`⁡`,applyfunction:`⁡`,ic:`⁣`,invisiblecomma:`⁣`,invisibletimes:`⁢`,it:`⁢`,lrm:`‎`,negativemediumspace:`​`,negativethickspace:`​`,negativethinspace:`​`,negativeverythinspace:`​`,nobreak:`⁠`,rlm:`‏`,shy:`­`,zerowidthspace:`​`,zwj:`‍`,zwnj:`‌`,downbreve:`̑`,tdot:`⃛`,tripledot:`⃛`,dotdot:`⃜`,tab:`	`,newline:`
`,emsp:` `,emsp13:` `,emsp14:` `,ensp:` `,hairsp:` `,mediumspace:` `,puncsp:` `,thinsp:` `,thinspace:` `,verythinspace:` `,nbsp:`\xA0`,nonbreakingspace:`\xA0`,numsp:` `,thickspace:`  `,oline:`‾`,overbar:`‾`,lowbar:`_`,underbar:`_`,dash:`‐`,hyphen:`‐`,ndash:`–`,mdash:`—`,horbar:`―`,comma:`,`,semi:`;`,bsemi:`⁏`,colon:`:`,Colone:`⩴`,excl:`!`,iexcl:`¡`,quest:`?`,iquest:`¿`,period:`.`,nldr:`‥`,hellip:`…`,mldr:`…`,centerdot:`·`,middot:`·`,apos:`'`,lsquo:`‘`,opencurlyquote:`‘`,closecurlyquote:`’`,rsquo:`’`,rsquor:`’`,lsquor:`‚`,sbquo:`‚`,lsaquo:`‹`,rsaquo:`›`,quot:`"`,ldquo:`“`,opencurlydoublequote:`“`,closecurlydoublequote:`”`,rdquo:`”`,rdquor:`”`,bdquo:`„`,ldquor:`„`,laquo:`«`,raquo:`»`,lpar:`(`,rpar:`)`,lbrack:`[`,lsqb:`[`,rbrack:`]`,rsqb:`]`,lbrace:`{`,lcub:`{`,rbrace:`}`,rcub:`}`,lceil:`⌈`,leftceiling:`⌈`,rceil:`⌉`,rightceiling:`⌉`,leftfloor:`⌊`,lfloor:`⌊`,rfloor:`⌋`,rightfloor:`⌋`,lopar:`⦅`,ropar:`⦆`,lbrke:`⦋`,rbrke:`⦌`,lbrkslu:`⦍`,rbrksld:`⦎`,lbrksld:`⦏`,rbrkslu:`⦐`,langd:`⦑`,rangd:`⦒`,lparlt:`⦓`,rpargt:`⦔`,gtlpar:`⦕`,ltrpar:`⦖`,leftdoublebracket:`⟦`,lobrk:`⟦`,rightdoublebracket:`⟧`,robrk:`⟧`,lang:`⟨`,langle:`⟨`,leftanglebracket:`⟨`,rang:`⟩`,rangle:`⟩`,rightanglebracket:`⟩`,Lang:`⟪`,Rang:`⟫`,loang:`⟬`,roang:`⟭`,lbbrk:`❲`,rbbrk:`❳`,Verbar:`‖`,Vert:`‖`,sect:`§`,para:`¶`,commat:`@`,ast:`*`,midast:`*`,sol:`/`,bsol:`\\`,amp:`&`,num:`#`,percnt:`%`,permil:`‰`,pertenk:`‱`,dagger:`†`,Dagger:`‡`,ddagger:`‡`,bull:`•`,bullet:`•`,hybull:`⁃`,prime:`′`,Prime:`″`,tprime:`‴`,qprime:`⁗`,backprime:`‵`,bprime:`‵`,caret:`⁁`,diacriticalgrave:"`",grave:"`",acute:`´`,diacriticalacute:`´`,diacriticaltilde:`˜`,tilde:`˜`,hat:`^`,macr:`¯`,strns:`¯`,breve:`˘`,diacriticaldot:`˙`,dot:`˙`,die:`¨`,Dot:`¨`,doubledot:`¨`,uml:`¨`,ring:`˚`,dblac:`˝`,diacriticaldoubleacute:`˝`,cedil:`¸`,cedilla:`¸`,ogon:`˛`,circ:`ˆ`,caron:`ˇ`,hacek:`ˇ`,deg:`°`,copy:`©`,circledr:`®`,reg:`®`,copysr:`℗`,weierp:`℘`,wp:`℘`,rx:`℞`,mho:`℧`,iiota:`℩`,larr:`←`,leftarrow:`←`,shortleftarrow:`←`,slarr:`←`,nlarr:`↚`,nleftarrow:`↚`,rarr:`→`,rightarrow:`→`,shortrightarrow:`→`,srarr:`→`,nrarr:`↛`,nrightarrow:`↛`,shortuparrow:`↑`,uarr:`↑`,uparrow:`↑`,darr:`↓`,downarrow:`↓`,shortdownarrow:`↓`,harr:`↔`,leftrightarrow:`↔`,nharr:`↮`,nleftrightarrow:`↮`,updownarrow:`↕`,varr:`↕`,nwarr:`↖`,nwarrow:`↖`,upperleftarrow:`↖`,nearr:`↗`,nearrow:`↗`,upperrightarrow:`↗`,lowerrightarrow:`↘`,searr:`↘`,searrow:`↘`,lowerleftarrow:`↙`,swarr:`↙`,swarrow:`↙`,rarrw:`↝`,rightsquigarrow:`↝`,nrarrw:`↝̸`,Larr:`↞`,twoheadleftarrow:`↞`,Uarr:`↟`,Rarr:`↠`,twoheadrightarrow:`↠`,Darr:`↡`,larrtl:`↢`,leftarrowtail:`↢`,rarrtl:`↣`,rightarrowtail:`↣`,leftteearrow:`↤`,mapstoleft:`↤`,mapstoup:`↥`,upteearrow:`↥`,map:`↦`,mapsto:`↦`,rightteearrow:`↦`,downteearrow:`↧`,mapstodown:`↧`,hookleftarrow:`↩`,larrhk:`↩`,hookrightarrow:`↪`,rarrhk:`↪`,larrlp:`↫`,looparrowleft:`↫`,looparrowright:`↬`,rarrlp:`↬`,harrw:`↭`,leftrightsquigarrow:`↭`,lsh:`↰`,rsh:`↱`,ldsh:`↲`,rdsh:`↳`,crarr:`↵`,cularr:`↶`,curvearrowleft:`↶`,curarr:`↷`,curvearrowright:`↷`,circlearrowleft:`↺`,olarr:`↺`,circlearrowright:`↻`,orarr:`↻`,leftharpoonup:`↼`,leftvector:`↼`,lharu:`↼`,downleftvector:`↽`,leftharpoondown:`↽`,lhard:`↽`,rightupvector:`↾`,uharr:`↾`,upharpoonright:`↾`,leftupvector:`↿`,uharl:`↿`,upharpoonleft:`↿`,rharu:`⇀`,rightharpoonup:`⇀`,rightvector:`⇀`,downrightvector:`⇁`,rhard:`⇁`,rightharpoondown:`⇁`,dharr:`⇂`,downharpoonright:`⇂`,rightdownvector:`⇂`,dharl:`⇃`,downharpoonleft:`⇃`,leftdownvector:`⇃`,rightarrowleftarrow:`⇄`,rightleftarrows:`⇄`,rlarr:`⇄`,udarr:`⇅`,uparrowdownarrow:`⇅`,leftarrowrightarrow:`⇆`,leftrightarrows:`⇆`,lrarr:`⇆`,leftleftarrows:`⇇`,llarr:`⇇`,upuparrows:`⇈`,uuarr:`⇈`,rightrightarrows:`⇉`,rrarr:`⇉`,ddarr:`⇊`,downdownarrows:`⇊`,leftrightharpoons:`⇋`,lrhar:`⇋`,reverseequilibrium:`⇋`,equilibrium:`⇌`,rightleftharpoons:`⇌`,rlhar:`⇌`,doubleleftarrow:`⇐`,lArr:`⇐`,Leftarrow:`⇐`,nlArr:`⇍`,nLeftarrow:`⇍`,doubleuparrow:`⇑`,uArr:`⇑`,Uparrow:`⇑`,doublerightarrow:`⇒`,implies:`⇒`,rArr:`⇒`,Rightarrow:`⇒`,nrArr:`⇏`,nRightarrow:`⇏`,dArr:`⇓`,doubledownarrow:`⇓`,Downarrow:`⇓`,doubleleftrightarrow:`⇔`,hArr:`⇔`,iff:`⇔`,Leftrightarrow:`⇔`,nhArr:`⇎`,nLeftrightarrow:`⇎`,doubleupdownarrow:`⇕`,Updownarrow:`⇕`,vArr:`⇕`,nwArr:`⇖`,neArr:`⇗`,seArr:`⇘`,swArr:`⇙`,laarr:`⇚`,lleftarrow:`⇚`,raarr:`⇛`,rrightarrow:`⇛`,zigrarr:`⇝`,larrb:`⇤`,leftarrowbar:`⇤`,rarrb:`⇥`,rightarrowbar:`⇥`,downarrowuparrow:`⇵`,duarr:`⇵`,loarr:`⇽`,roarr:`⇾`,hoarr:`⇿`,forall:`∀`,comp:`∁`,complement:`∁`,part:`∂`,partiald:`∂`,npart:`∂̸`,exist:`∃`,exists:`∃`,nexist:`∄`,nexists:`∄`,notexists:`∄`,empty:`∅`,emptyset:`∅`,emptyv:`∅`,varnothing:`∅`,del:`∇`,nabla:`∇`,element:`∈`,in:`∈`,isin:`∈`,isinv:`∈`,notelement:`∉`,notin:`∉`,notinva:`∉`,ni:`∋`,niv:`∋`,reverseelement:`∋`,suchthat:`∋`,notni:`∌`,notniva:`∌`,notreverseelement:`∌`,backepsilon:`϶`,bepsi:`϶`,prod:`∏`,product:`∏`,coprod:`∐`,coproduct:`∐`,sum:`∑`,plus:`+`,plusminus:`±`,plusmn:`±`,pm:`±`,div:`÷`,divide:`÷`,times:`×`,lt:`<`,nless:`≮`,nlt:`≮`,notless:`≮`,nvlt:`<⃒`,equals:`=`,ne:`≠`,notequal:`≠`,bne:`=⃥`,equal:`⩵`,gt:`>`,ngt:`≯`,ngtr:`≯`,notgreater:`≯`,nvgt:`>⃒`,not:`¬`,verbar:`|`,vert:`|`,verticalline:`|`,brvbar:`¦`,minus:`−`,minusplus:`∓`,mnplus:`∓`,mp:`∓`,dotplus:`∔`,plusdo:`∔`,frasl:`⁄`,backslash:`∖`,setminus:`∖`,setmn:`∖`,smallsetminus:`∖`,ssetmn:`∖`,lowast:`∗`,compfn:`∘`,smallcircle:`∘`,radic:`√`,sqrt:`√`,prop:`∝`,proportional:`∝`,propto:`∝`,varpropto:`∝`,vprop:`∝`,infin:`∞`,angrt:`∟`,ang:`∠`,angle:`∠`,nang:`∠⃒`,angmsd:`∡`,measuredangle:`∡`,angsph:`∢`,mid:`∣`,shortmid:`∣`,smid:`∣`,verticalbar:`∣`,nmid:`∤`,notverticalbar:`∤`,nshortmid:`∤`,nsmid:`∤`,doubleverticalbar:`∥`,par:`∥`,parallel:`∥`,shortparallel:`∥`,spar:`∥`,notdoubleverticalbar:`∦`,npar:`∦`,nparallel:`∦`,nshortparallel:`∦`,nspar:`∦`,and:`∧`,wedge:`∧`,or:`∨`,vee:`∨`,cap:`∩`,caps:`∩︀`,cup:`∪`,cups:`∪︀`,int:`∫`,integral:`∫`,Int:`∬`,iiint:`∭`,tint:`∭`,iiiint:`⨌`,qint:`⨌`,conint:`∮`,contourintegral:`∮`,oint:`∮`,Conint:`∯`,doublecontourintegral:`∯`,cconint:`∰`,cwint:`∱`,clockwisecontourintegral:`∲`,cwconint:`∲`,awconint:`∳`,counterclockwisecontourintegral:`∳`,there4:`∴`,therefore:`∴`,becaus:`∵`,because:`∵`,ratio:`∶`,Colon:`∷`,proportion:`∷`,dotminus:`∸`,minusd:`∸`,mddot:`∺`,homtht:`∻`,sim:`∼`,thicksim:`∼`,thksim:`∼`,Tilde:`∼`,nottilde:`≁`,nsim:`≁`,nvsim:`∼⃒`,backsim:`∽`,bsim:`∽`,race:`∽̱`,ac:`∾`,mstpos:`∾`,ace:`∾̳`,acd:`∿`,verticaltilde:`≀`,wr:`≀`,wreath:`≀`,eqsim:`≂`,equaltilde:`≂`,esim:`≂`,nesim:`≂̸`,notequaltilde:`≂̸`,sime:`≃`,simeq:`≃`,tildeequal:`≃`,nottildeequal:`≄`,nsime:`≄`,nsimeq:`≄`,cong:`≅`,tildefullequal:`≅`,ncong:`≇`,nottildefullequal:`≇`,simne:`≆`,ap:`≈`,approx:`≈`,asymp:`≈`,thickapprox:`≈`,thkap:`≈`,tildetilde:`≈`,nap:`≉`,napprox:`≉`,nottildetilde:`≉`,ape:`≊`,approxeq:`≊`,apid:`≋`,napid:`≋̸`,backcong:`≌`,bcong:`≌`,asympeq:`≍`,CupCap:`≍`,notcupcap:`≭`,nvap:`≍⃒`,bump:`≎`,Bumpeq:`≎`,humpdownhump:`≎`,nbump:`≎̸`,nothumpdownhump:`≎̸`,bumpe:`≏`,bumpeq:`≏`,humpequal:`≏`,nbumpe:`≏̸`,nothumpequal:`≏̸`,doteq:`≐`,dotequal:`≐`,esdot:`≐`,nedot:`≐̸`,doteqdot:`≑`,eDot:`≑`,efdot:`≒`,fallingdotseq:`≒`,erdot:`≓`,risingdotseq:`≓`,assign:`≔`,colone:`≔`,coloneq:`≔`,ecolon:`≕`,eqcolon:`≕`,ecir:`≖`,eqcirc:`≖`,circeq:`≗`,cire:`≗`,wedgeq:`≙`,veeeq:`≚`,triangleq:`≜`,trie:`≜`,equest:`≟`,questeq:`≟`,congruent:`≡`,equiv:`≡`,nequiv:`≢`,notcongruent:`≢`,bnequiv:`≡⃥`,le:`≤`,leq:`≤`,nle:`≰`,nleq:`≰`,notlessequal:`≰`,nvle:`≤⃒`,ge:`≥`,geq:`≥`,greaterequal:`≥`,nge:`≱`,ngeq:`≱`,notgreaterequal:`≱`,nvge:`≥⃒`,lE:`≦`,leqq:`≦`,lessfullequal:`≦`,nlE:`≦̸`,nleqq:`≦̸`,gE:`≧`,geqq:`≧`,greaterfullequal:`≧`,ngE:`≧̸`,ngeqq:`≧̸`,notgreaterfullequal:`≧̸`,lnE:`≨`,lneqq:`≨`,lvertneqq:`≨︀`,lvne:`≨︀`,gnE:`≩`,gneqq:`≩`,gvertneqq:`≩︀`,gvne:`≩︀`,ll:`≪`,Lt:`≪`,nestedlessless:`≪`,nltv:`≪̸`,notlessless:`≪̸`,nLt:`≪⃒`,gg:`≫`,Gt:`≫`,nestedgreatergreater:`≫`,ngtv:`≫̸`,notgreatergreater:`≫̸`,nGt:`≫⃒`,between:`≬`,twixt:`≬`,lesssim:`≲`,lesstilde:`≲`,lsim:`≲`,nlsim:`≴`,notlesstilde:`≴`,greatertilde:`≳`,gsim:`≳`,gtrsim:`≳`,ngsim:`≵`,notgreatertilde:`≵`,lessgreater:`≶`,lessgtr:`≶`,lg:`≶`,notlessgreater:`≸`,ntlg:`≸`,gl:`≷`,greaterless:`≷`,gtrless:`≷`,notgreaterless:`≹`,ntgl:`≹`,pr:`≺`,prec:`≺`,precedes:`≺`,notprecedes:`⊀`,npr:`⊀`,nprec:`⊀`,sc:`≻`,succ:`≻`,succeeds:`≻`,notsucceeds:`⊁`,nsc:`⊁`,nsucc:`⊁`,prcue:`≼`,preccurlyeq:`≼`,precedesslantequal:`≼`,notprecedesslantequal:`⋠`,nprcue:`⋠`,sccue:`≽`,succcurlyeq:`≽`,succeedsslantequal:`≽`,notsucceedsslantequal:`⋡`,nsccue:`⋡`,precedestilde:`≾`,precsim:`≾`,prsim:`≾`,scsim:`≿`,succeedstilde:`≿`,succsim:`≿`,notsucceedstilde:`≿̸`,sub:`⊂`,subset:`⊂`,nsub:`⊄`,notsubset:`⊂⃒`,nsubset:`⊂⃒`,vnsub:`⊂⃒`,sup:`⊃`,superset:`⊃`,supset:`⊃`,nsup:`⊅`,notsuperset:`⊃⃒`,nsupset:`⊃⃒`,vnsup:`⊃⃒`,sube:`⊆`,subseteq:`⊆`,subsetequal:`⊆`,notsubsetequal:`⊈`,nsube:`⊈`,nsubseteq:`⊈`,supe:`⊇`,supersetequal:`⊇`,supseteq:`⊇`,notsupersetequal:`⊉`,nsupe:`⊉`,nsupseteq:`⊉`,subne:`⊊`,subsetneq:`⊊`,varsubsetneq:`⊊︀`,vsubne:`⊊︀`,supne:`⊋`,supsetneq:`⊋`,varsupsetneq:`⊋︀`,vsupne:`⊋︀`,cupdot:`⊍`,unionplus:`⊎`,uplus:`⊎`,sqsub:`⊏`,sqsubset:`⊏`,squaresubset:`⊏`,notsquaresubset:`⊏̸`,sqsup:`⊐`,sqsupset:`⊐`,squaresuperset:`⊐`,notsquaresuperset:`⊐̸`,sqsube:`⊑`,sqsubseteq:`⊑`,squaresubsetequal:`⊑`,notsquaresubsetequal:`⋢`,nsqsube:`⋢`,sqsupe:`⊒`,sqsupseteq:`⊒`,squaresupersetequal:`⊒`,notsquaresupersetequal:`⋣`,nsqsupe:`⋣`,sqcap:`⊓`,sqcaps:`⊓︀`,squareintersection:`⊓`,sqcup:`⊔`,sqcups:`⊔︀`,squareunion:`⊔`,circleplus:`⊕`,oplus:`⊕`,circleminus:`⊖`,ominus:`⊖`,circletimes:`⊗`,otimes:`⊗`,osol:`⊘`,circledot:`⊙`,odot:`⊙`,circledcirc:`⊚`,ocir:`⊚`,circledast:`⊛`,oast:`⊛`,circleddash:`⊝`,odash:`⊝`,boxplus:`⊞`,plusb:`⊞`,boxminus:`⊟`,minusb:`⊟`,boxtimes:`⊠`,timesb:`⊠`,dotsquare:`⊡`,sdotb:`⊡`,righttee:`⊢`,vdash:`⊢`,nvdash:`⊬`,dashv:`⊣`,lefttee:`⊣`,downtee:`⊤`,top:`⊤`,bot:`⊥`,bottom:`⊥`,perp:`⊥`,uptee:`⊥`,models:`⊧`,doublerighttee:`⊨`,vDash:`⊨`,nvDash:`⊭`,Vdash:`⊩`,nVdash:`⊮`,vvdash:`⊪`,VDash:`⊫`,nVDash:`⊯`,prurel:`⊰`,lefttriangle:`⊲`,vartriangleleft:`⊲`,vltri:`⊲`,nltri:`⋪`,notlefttriangle:`⋪`,ntriangleleft:`⋪`,righttriangle:`⊳`,vartriangleright:`⊳`,vrtri:`⊳`,notrighttriangle:`⋫`,nrtri:`⋫`,ntriangleright:`⋫`,lefttriangleequal:`⊴`,ltrie:`⊴`,trianglelefteq:`⊴`,nltrie:`⋬`,notlefttriangleequal:`⋬`,ntrianglelefteq:`⋬`,nvltrie:`⊴⃒`,righttriangleequal:`⊵`,rtrie:`⊵`,trianglerighteq:`⊵`,notrighttriangleequal:`⋭`,nrtrie:`⋭`,ntrianglerighteq:`⋭`,nvrtrie:`⊵⃒`,origof:`⊶`,imof:`⊷`,multimap:`⊸`,mumap:`⊸`,hercon:`⊹`,intcal:`⊺`,intercal:`⊺`,veebar:`⊻`,barvee:`⊽`,angrtvb:`⊾`,lrtri:`⊿`,bigwedge:`⋀`,Wedge:`⋀`,xwedge:`⋀`,bigvee:`⋁`,Vee:`⋁`,xvee:`⋁`,bigcap:`⋂`,intersection:`⋂`,xcap:`⋂`,bigcup:`⋃`,union:`⋃`,xcup:`⋃`,diam:`⋄`,diamond:`⋄`,sdot:`⋅`,sstarf:`⋆`,Star:`⋆`,divideontimes:`⋇`,divonx:`⋇`,bowtie:`⋈`,ltimes:`⋉`,rtimes:`⋊`,leftthreetimes:`⋋`,lthree:`⋋`,rightthreetimes:`⋌`,rthree:`⋌`,backsimeq:`⋍`,bsime:`⋍`,curlyvee:`⋎`,cuvee:`⋎`,curlywedge:`⋏`,cuwed:`⋏`,Sub:`⋐`,Subset:`⋐`,Sup:`⋑`,Supset:`⋑`,Cap:`⋒`,Cup:`⋓`,fork:`⋔`,pitchfork:`⋔`,epar:`⋕`,lessdot:`⋖`,ltdot:`⋖`,gtdot:`⋗`,gtrdot:`⋗`,Ll:`⋘`,nll:`⋘̸`,Gg:`⋙`,ggg:`⋙`,ngg:`⋙̸`,leg:`⋚`,lesg:`⋚︀`,lesseqgtr:`⋚`,lessequalgreater:`⋚`,gel:`⋛`,gesl:`⋛︀`,greaterequalless:`⋛`,gtreqless:`⋛`,cuepr:`⋞`,curlyeqprec:`⋞`,cuesc:`⋟`,curlyeqsucc:`⋟`,lnsim:`⋦`,gnsim:`⋧`,precnsim:`⋨`,prnsim:`⋨`,scnsim:`⋩`,succnsim:`⋩`,vellip:`⋮`,ctdot:`⋯`,utdot:`⋰`,dtdot:`⋱`,disin:`⋲`,isinsv:`⋳`,isins:`⋴`,isindot:`⋵`,notindot:`⋵̸`,notinvc:`⋶`,notinvb:`⋷`,isine:`⋹`,notine:`⋹̸`,nisd:`⋺`,xnis:`⋻`,nis:`⋼`,notnivc:`⋽`,notnivb:`⋾`,barwed:`⌅`,barwedge:`⌅`,Barwed:`⌆`,doublebarwedge:`⌆`,drcrop:`⌌`,dlcrop:`⌍`,urcrop:`⌎`,ulcrop:`⌏`,bnot:`⌐`,profline:`⌒`,profsurf:`⌓`,telrec:`⌕`,target:`⌖`,ulcorn:`⌜`,ulcorner:`⌜`,urcorn:`⌝`,urcorner:`⌝`,dlcorn:`⌞`,llcorner:`⌞`,drcorn:`⌟`,lrcorner:`⌟`,frown:`⌢`,sfrown:`⌢`,smile:`⌣`,ssmile:`⌣`,cylcty:`⌭`,profalar:`⌮`,topbot:`⌶`,ovbar:`⌽`,solbar:`⌿`,angzarr:`⍼`,lmoust:`⎰`,lmoustache:`⎰`,rmoust:`⎱`,rmoustache:`⎱`,overbracket:`⎴`,tbrk:`⎴`,bbrk:`⎵`,underbracket:`⎵`,bbrktbrk:`⎶`,overparenthesis:`⏜`,underparenthesis:`⏝`,overbrace:`⏞`,underbrace:`⏟`,trpezium:`⏢`,elinters:`⏧`,blank:`␣`,boxh:`─`,horizontalline:`─`,boxv:`│`,boxdr:`┌`,boxdl:`┐`,boxur:`└`,boxul:`┘`,boxvr:`├`,boxvl:`┤`,boxhd:`┬`,boxhu:`┴`,boxvh:`┼`,boxH:`═`,boxV:`║`,boxdR:`╒`,boxDr:`╓`,boxDR:`╔`,boxdL:`╕`,boxDl:`╖`,boxDL:`╗`,boxuR:`╘`,boxUr:`╙`,boxUR:`╚`,boxuL:`╛`,boxUl:`╜`,boxUL:`╝`,boxvR:`╞`,boxVr:`╟`,boxVR:`╠`,boxvL:`╡`,boxVl:`╢`,boxVL:`╣`,boxHd:`╤`,boxhD:`╥`,boxHD:`╦`,boxHu:`╧`,boxhU:`╨`,boxHU:`╩`,boxvH:`╪`,boxVh:`╫`,boxVH:`╬`,uhblk:`▀`,lhblk:`▄`,block:`█`,blk14:`░`,blk12:`▒`,blk34:`▓`,squ:`□`,square:`□`,blacksquare:`▪`,filledverysmallsquare:`▪`,squarf:`▪`,squf:`▪`,emptyverysmallsquare:`▫`,rect:`▭`,marker:`▮`,fltns:`▱`,bigtriangleup:`△`,xutri:`△`,blacktriangle:`▴`,utrif:`▴`,triangle:`▵`,utri:`▵`,blacktriangleright:`▸`,rtrif:`▸`,rtri:`▹`,triangleright:`▹`,bigtriangledown:`▽`,xdtri:`▽`,blacktriangledown:`▾`,dtrif:`▾`,dtri:`▿`,triangledown:`▿`,blacktriangleleft:`◂`,ltrif:`◂`,ltri:`◃`,triangleleft:`◃`,loz:`◊`,lozenge:`◊`,cir:`○`,tridot:`◬`,bigcirc:`◯`,xcirc:`◯`,ultri:`◸`,urtri:`◹`,lltri:`◺`,emptysmallsquare:`◻`,filledsmallsquare:`◼`,bigstar:`★`,starf:`★`,star:`☆`,phone:`☎`,female:`♀`,male:`♂`,spades:`♠`,spadesuit:`♠`,clubs:`♣`,clubsuit:`♣`,hearts:`♥`,heartsuit:`♥`,diamondsuit:`♦`,diams:`♦`,sung:`♪`,check:`✓`,checkmark:`✓`,cross:`✗`,malt:`✠`,maltese:`✠`,sext:`✶`,verticalseparator:`❘`,bsolhsub:`⟈`,suphsol:`⟉`,longleftarrow:`⟵`,xlarr:`⟵`,longrightarrow:`⟶`,xrarr:`⟶`,longleftrightarrow:`⟷`,xharr:`⟷`,doublelongleftarrow:`⟸`,Longleftarrow:`⟸`,xlArr:`⟸`,doublelongrightarrow:`⟹`,Longrightarrow:`⟹`,xrArr:`⟹`,doublelongleftrightarrow:`⟺`,Longleftrightarrow:`⟺`,xhArr:`⟺`,longmapsto:`⟼`,xmap:`⟼`,dzigrarr:`⟿`,nvlarr:`⤂`,nvrarr:`⤃`,nvharr:`⤄`,Map:`⤅`,lbarr:`⤌`,bkarow:`⤍`,lBarr:`⤎`,dbkarow:`⤏`,rBarr:`⤏`,drbkarow:`⤐`,rbarr:`⤐`,RBarr:`⤐`,ddotrahd:`⤑`,uparrowbar:`⤒`,downarrowbar:`⤓`,Rarrtl:`⤖`,latail:`⤙`,ratail:`⤚`,lAtail:`⤛`,rAtail:`⤜`,larrfs:`⤝`,rarrfs:`⤞`,larrbfs:`⤟`,rarrbfs:`⤠`,nwarhk:`⤣`,nearhk:`⤤`,hksearow:`⤥`,searhk:`⤥`,hkswarow:`⤦`,swarhk:`⤦`,nwnear:`⤧`,nesear:`⤨`,toea:`⤨`,seswar:`⤩`,tosa:`⤩`,swnwar:`⤪`,rarrc:`⤳`,nrarrc:`⤳̸`,cudarrr:`⤵`,ldca:`⤶`,rdca:`⤷`,cudarrl:`⤸`,larrpl:`⤹`,curarrm:`⤼`,cularrp:`⤽`,rarrpl:`⥅`,harrcir:`⥈`,uarrocir:`⥉`,lurdshar:`⥊`,ldrushar:`⥋`,leftrightvector:`⥎`,rightupdownvector:`⥏`,downleftrightvector:`⥐`,leftupdownvector:`⥑`,leftvectorbar:`⥒`,rightvectorbar:`⥓`,rightupvectorbar:`⥔`,rightdownvectorbar:`⥕`,downleftvectorbar:`⥖`,downrightvectorbar:`⥗`,leftupvectorbar:`⥘`,leftdownvectorbar:`⥙`,leftteevector:`⥚`,rightteevector:`⥛`,rightupteevector:`⥜`,rightdownteevector:`⥝`,downleftteevector:`⥞`,downrightteevector:`⥟`,leftupteevector:`⥠`,leftdownteevector:`⥡`,lhar:`⥢`,uhar:`⥣`,rhar:`⥤`,dhar:`⥥`,luruhar:`⥦`,ldrdhar:`⥧`,ruluhar:`⥨`,rdldhar:`⥩`,lharul:`⥪`,llhard:`⥫`,rharul:`⥬`,lrhard:`⥭`,udhar:`⥮`,upequilibrium:`⥮`,duhar:`⥯`,reverseupequilibrium:`⥯`,roundimplies:`⥰`,erarr:`⥱`,simrarr:`⥲`,larrsim:`⥳`,rarrsim:`⥴`,rarrap:`⥵`,ltlarr:`⥶`,gtrarr:`⥸`,subrarr:`⥹`,suplarr:`⥻`,lfisht:`⥼`,rfisht:`⥽`,ufisht:`⥾`,dfisht:`⥿`,vzigzag:`⦚`,vangrt:`⦜`,angrtvbd:`⦝`,ange:`⦤`,range:`⦥`,dwangle:`⦦`,uwangle:`⦧`,angmsdaa:`⦨`,angmsdab:`⦩`,angmsdac:`⦪`,angmsdad:`⦫`,angmsdae:`⦬`,angmsdaf:`⦭`,angmsdag:`⦮`,angmsdah:`⦯`,bemptyv:`⦰`,demptyv:`⦱`,cemptyv:`⦲`,raemptyv:`⦳`,laemptyv:`⦴`,ohbar:`⦵`,omid:`⦶`,opar:`⦷`,operp:`⦹`,olcross:`⦻`,odsold:`⦼`,olcir:`⦾`,ofcir:`⦿`,olt:`⧀`,ogt:`⧁`,cirscir:`⧂`,cirE:`⧃`,solb:`⧄`,bsolb:`⧅`,boxbox:`⧉`,trisb:`⧍`,rtriltri:`⧎`,lefttrianglebar:`⧏`,notlefttrianglebar:`⧏̸`,righttrianglebar:`⧐`,notrighttrianglebar:`⧐̸`,iinfin:`⧜`,infintie:`⧝`,nvinfin:`⧞`,eparsl:`⧣`,smeparsl:`⧤`,eqvparsl:`⧥`,blacklozenge:`⧫`,lozf:`⧫`,ruledelayed:`⧴`,dsol:`⧶`,bigodot:`⨀`,xodot:`⨀`,bigoplus:`⨁`,xoplus:`⨁`,bigotimes:`⨂`,xotime:`⨂`,biguplus:`⨄`,xuplus:`⨄`,bigsqcup:`⨆`,xsqcup:`⨆`,fpartint:`⨍`,cirfnint:`⨐`,awint:`⨑`,rppolint:`⨒`,scpolint:`⨓`,npolint:`⨔`,pointint:`⨕`,quatint:`⨖`,intlarhk:`⨗`,pluscir:`⨢`,plusacir:`⨣`,simplus:`⨤`,plusdu:`⨥`,plussim:`⨦`,plustwo:`⨧`,mcomma:`⨩`,minusdu:`⨪`,loplus:`⨭`,roplus:`⨮`,Cross:`⨯`,timesd:`⨰`,timesbar:`⨱`,smashp:`⨳`,lotimes:`⨴`,rotimes:`⨵`,otimesas:`⨶`,Otimes:`⨷`,odiv:`⨸`,triplus:`⨹`,triminus:`⨺`,tritime:`⨻`,intprod:`⨼`,iprod:`⨼`,amalg:`⨿`,capdot:`⩀`,ncup:`⩂`,ncap:`⩃`,capand:`⩄`,cupor:`⩅`,cupcap:`⩆`,capcup:`⩇`,cupbrcap:`⩈`,capbrcup:`⩉`,cupcup:`⩊`,capcap:`⩋`,ccups:`⩌`,ccaps:`⩍`,ccupssm:`⩐`,And:`⩓`,Or:`⩔`,andand:`⩕`,oror:`⩖`,orslope:`⩗`,andslope:`⩘`,andv:`⩚`,orv:`⩛`,andd:`⩜`,ord:`⩝`,wedbar:`⩟`,sdote:`⩦`,simdot:`⩪`,congdot:`⩭`,ncongdot:`⩭̸`,easter:`⩮`,apacir:`⩯`,apE:`⩰`,nape:`⩰̸`,eplus:`⩱`,pluse:`⩲`,Esim:`⩳`,ddotseq:`⩷`,eddot:`⩷`,equivdd:`⩸`,ltcir:`⩹`,gtcir:`⩺`,ltquest:`⩻`,gtquest:`⩼`,leqslant:`⩽`,les:`⩽`,lessslantequal:`⩽`,nleqslant:`⩽̸`,nles:`⩽̸`,notlessslantequal:`⩽̸`,geqslant:`⩾`,ges:`⩾`,greaterslantequal:`⩾`,ngeqslant:`⩾̸`,nges:`⩾̸`,notgreaterslantequal:`⩾̸`,lesdot:`⩿`,gesdot:`⪀`,lesdoto:`⪁`,gesdoto:`⪂`,lesdotor:`⪃`,gesdotol:`⪄`,lap:`⪅`,lessapprox:`⪅`,gap:`⪆`,gtrapprox:`⪆`,lne:`⪇`,lneq:`⪇`,gne:`⪈`,gneq:`⪈`,lnap:`⪉`,lnapprox:`⪉`,gnap:`⪊`,gnapprox:`⪊`,lEg:`⪋`,lesseqqgtr:`⪋`,gEl:`⪌`,gtreqqless:`⪌`,lsime:`⪍`,gsime:`⪎`,lsimg:`⪏`,gsiml:`⪐`,lge:`⪑`,gle:`⪒`,lesges:`⪓`,gesles:`⪔`,els:`⪕`,eqslantless:`⪕`,egs:`⪖`,eqslantgtr:`⪖`,elsdot:`⪗`,egsdot:`⪘`,el:`⪙`,eg:`⪚`,siml:`⪝`,simg:`⪞`,simle:`⪟`,simge:`⪠`,lessless:`⪡`,notnestedlessless:`⪡̸`,greatergreater:`⪢`,notnestedgreatergreater:`⪢̸`,glj:`⪤`,gla:`⪥`,ltcc:`⪦`,gtcc:`⪧`,lescc:`⪨`,gescc:`⪩`,smt:`⪪`,lat:`⪫`,smte:`⪬`,smtes:`⪬︀`,late:`⪭`,lates:`⪭︀`,bumpE:`⪮`,pre:`⪯`,precedesequal:`⪯`,preceq:`⪯`,notprecedesequal:`⪯̸`,npre:`⪯̸`,npreceq:`⪯̸`,sce:`⪰`,succeedsequal:`⪰`,succeq:`⪰`,notsucceedsequal:`⪰̸`,nsce:`⪰̸`,nsucceq:`⪰̸`,prE:`⪳`,scE:`⪴`,precneqq:`⪵`,prne:`⪵`,scne:`⪶`,succneqq:`⪶`,prap:`⪷`,precapprox:`⪷`,scap:`⪸`,succapprox:`⪸`,precnapprox:`⪹`,prnap:`⪹`,scnap:`⪺`,succnapprox:`⪺`,Pr:`⪻`,Sc:`⪼`,subdot:`⪽`,supdot:`⪾`,subplus:`⪿`,supplus:`⫀`,submult:`⫁`,supmult:`⫂`,subedot:`⫃`,supedot:`⫄`,subE:`⫅`,subseteqq:`⫅`,nsubE:`⫅̸`,nsubseteqq:`⫅̸`,supE:`⫆`,supseteqq:`⫆`,nsupE:`⫆̸`,nsupseteqq:`⫆̸`,subsim:`⫇`,supsim:`⫈`,subnE:`⫋`,subsetneqq:`⫋`,varsubsetneqq:`⫋︀`,vsubnE:`⫋︀`,supnE:`⫌`,supsetneqq:`⫌`,varsupsetneqq:`⫌︀`,vsupnE:`⫌︀`,csub:`⫏`,csup:`⫐`,csube:`⫑`,csupe:`⫒`,subsup:`⫓`,supsub:`⫔`,subsub:`⫕`,supsup:`⫖`,suphsub:`⫗`,supdsub:`⫘`,forkv:`⫙`,topfork:`⫚`,mlcp:`⫛`,Dashv:`⫤`,doublelefttee:`⫤`,vdashl:`⫦`,barv:`⫧`,vbar:`⫨`,vbarv:`⫩`,Vbar:`⫫`,Not:`⫬`,bNot:`⫭`,rnmid:`⫮`,cirmid:`⫯`,midcir:`⫰`,topcir:`⫱`,nhpar:`⫲`,parsim:`⫳`,parsl:`⫽`,nparsl:`⫽⃥`,flat:`♭`,natur:`♮`,natural:`♮`,sharp:`♯`,curren:`¤`,cent:`¢`,dollar:`$`,pound:`£`,yen:`¥`,euro:`€`,sup1:`¹`,frac12:`½`,half:`½`,frac13:`⅓`,frac14:`¼`,frac15:`⅕`,frac16:`⅙`,frac18:`⅛`,sup2:`²`,frac23:`⅔`,frac25:`⅖`,sup3:`³`,frac34:`¾`,frac35:`⅗`,frac38:`⅜`,frac45:`⅘`,frac56:`⅚`,frac58:`⅝`,frac78:`⅞`,afr:`𝔞`,aopf:`𝕒`,ascr:`𝒶`,Afr:`𝔄`,Aopf:`𝔸`,Ascr:`𝒜`,ordf:`ª`,aacute:`á`,Aacute:`Á`,agrave:`à`,Agrave:`À`,abreve:`ă`,Abreve:`Ă`,acirc:`â`,Acirc:`Â`,aring:`å`,angst:`Å`,Aring:`Å`,auml:`ä`,Auml:`Ä`,atilde:`ã`,Atilde:`Ã`,aogon:`ą`,Aogon:`Ą`,amacr:`ā`,Amacr:`Ā`,aelig:`Æ`,AElig:`Æ`,bfr:`𝔟`,bopf:`𝕓`,bscr:`𝒷`,bernou:`ℬ`,bernoullis:`ℬ`,Bfr:`𝔅`,Bopf:`𝔹`,Bscr:`ℬ`,cfr:`𝔠`,copf:`𝕔`,cscr:`𝒸`,cayleys:`ℭ`,Cfr:`ℭ`,complexes:`ℂ`,Copf:`ℂ`,Cscr:`𝒞`,cacute:`ć`,Cacute:`Ć`,ccirc:`ĉ`,Ccirc:`Ĉ`,ccaron:`č`,Ccaron:`Č`,cdot:`ċ`,Cdot:`Ċ`,ccedil:`ç`,Ccedil:`Ç`,incare:`℅`,dfr:`𝔡`,differentiald:`ⅆ`,dopf:`𝕕`,dscr:`𝒹`,capitaldifferentiald:`ⅅ`,dd:`ⅅ`,DD:`ⅅ`,Dfr:`𝔇`,Dopf:`𝔻`,Dscr:`𝒟`,dcaron:`ď`,Dcaron:`Ď`,dstrok:`đ`,Dstrok:`Đ`,eth:`ð`,ETH:`Ð`,ee:`ⅇ`,efr:`𝔢`,eopf:`𝕖`,escr:`ℯ`,exponentiale:`ⅇ`,Efr:`𝔈`,Eopf:`𝔼`,Escr:`ℰ`,expectation:`ℰ`,eacute:`é`,Eacute:`É`,egrave:`è`,Egrave:`È`,ecirc:`ê`,Ecirc:`Ê`,ecaron:`ě`,Ecaron:`Ě`,euml:`ë`,Euml:`Ë`,edot:`ė`,Edot:`Ė`,eogon:`ę`,Eogon:`Ę`,emacr:`ē`,Emacr:`Ē`,ffr:`𝔣`,fopf:`𝕗`,fscr:`𝒻`,Ffr:`𝔉`,Fopf:`𝔽`,fouriertrf:`ℱ`,Fscr:`ℱ`,fflig:`ﬀ`,ffilig:`ﬃ`,ffllig:`ﬄ`,filig:`ﬁ`,fjlig:`fj`,fllig:`ﬂ`,fnof:`ƒ`,gfr:`𝔤`,gopf:`𝕘`,gscr:`ℊ`,Gfr:`𝔊`,Gopf:`𝔾`,Gscr:`𝒢`,gacute:`ǵ`,gbreve:`ğ`,Gbreve:`Ğ`,gcirc:`ĝ`,Gcirc:`Ĝ`,gdot:`ġ`,Gdot:`Ġ`,gcedil:`Ģ`,hfr:`𝔥`,hopf:`𝕙`,hscr:`𝒽`,planckh:`ℎ`,hamilt:`ℋ`,Hfr:`ℌ`,hilbertspace:`ℋ`,Hopf:`ℍ`,Hscr:`ℋ`,poincareplane:`ℌ`,quaternions:`ℍ`,hcirc:`ĥ`,Hcirc:`Ĥ`,hbar:`ℏ`,hslash:`ℏ`,hstrok:`ħ`,planck:`ℏ`,plankv:`ℏ`,Hstrok:`Ħ`,ifr:`𝔦`,ii:`ⅈ`,imaginaryi:`ⅈ`,iopf:`𝕚`,iscr:`𝒾`,Ifr:`ℑ`,im:`ℑ`,image:`ℑ`,imagline:`ℐ`,imagpart:`ℑ`,Iopf:`𝕀`,Iscr:`ℐ`,iacute:`í`,Iacute:`Í`,igrave:`ì`,Igrave:`Ì`,icirc:`î`,Icirc:`Î`,iuml:`ï`,Iuml:`Ï`,itilde:`ĩ`,Itilde:`Ĩ`,idot:`İ`,iogon:`į`,Iogon:`Į`,imacr:`ī`,Imacr:`Ī`,ijlig:`Ĳ`,IJlig:`Ĳ`,imath:`ı`,inodot:`ı`,jfr:`𝔧`,jopf:`𝕛`,jscr:`𝒿`,Jfr:`𝔍`,Jopf:`𝕁`,Jscr:`𝒥`,jcirc:`ĵ`,Jcirc:`Ĵ`,jmath:`ȷ`,kfr:`𝔨`,kopf:`𝕜`,kscr:`𝓀`,Kfr:`𝔎`,Kopf:`𝕂`,Kscr:`𝒦`,kcedil:`ķ`,Kcedil:`Ķ`,ell:`ℓ`,lfr:`𝔩`,lopf:`𝕝`,lscr:`𝓁`,lagran:`ℒ`,laplacetrf:`ℒ`,Lfr:`𝔏`,Lopf:`𝕃`,Lscr:`ℒ`,lacute:`ĺ`,Lacute:`Ĺ`,lcaron:`ľ`,Lcaron:`Ľ`,lcedil:`ļ`,Lcedil:`Ļ`,lstrok:`ł`,Lstrok:`Ł`,lmidot:`ŀ`,Lmidot:`Ŀ`,mfr:`𝔪`,mopf:`𝕞`,mscr:`𝓂`,mellintrf:`ℳ`,Mfr:`𝔐`,Mopf:`𝕄`,Mscr:`ℳ`,phmmat:`ℳ`,nfr:`𝔫`,nopf:`𝕟`,nscr:`𝓃`,naturals:`ℕ`,Nfr:`𝔑`,Nopf:`ℕ`,Nscr:`𝒩`,nacute:`ń`,Nacute:`Ń`,ncaron:`ň`,Ncaron:`Ň`,ntilde:`ñ`,Ntilde:`Ñ`,ncedil:`ņ`,Ncedil:`Ņ`,numero:`№`,eng:`ŋ`,ENG:`Ŋ`,ofr:`𝔬`,oopf:`𝕠`,order:`ℴ`,orderof:`ℴ`,oscr:`ℴ`,Ofr:`𝔒`,Oopf:`𝕆`,Oscr:`𝒪`,ordm:`º`,oacute:`ó`,Oacute:`Ó`,ograve:`ò`,Ograve:`Ò`,ocirc:`ô`,Ocirc:`Ô`,ouml:`ö`,Ouml:`Ö`,odblac:`ő`,Odblac:`Ő`,otilde:`õ`,Otilde:`Õ`,oslash:`ø`,Oslash:`Ø`,omacr:`ō`,Omacr:`Ō`,oelig:`Œ`,OElig:`Œ`,pfr:`𝔭`,popf:`𝕡`,pscr:`𝓅`,Pfr:`𝔓`,Popf:`ℙ`,primes:`ℙ`,Pscr:`𝒫`,qfr:`𝔮`,qopf:`𝕢`,qscr:`𝓆`,Qfr:`𝔔`,Qopf:`ℚ`,Qscr:`𝒬`,rationals:`ℚ`,kgreen:`ĸ`,rfr:`𝔯`,ropf:`𝕣`,rscr:`𝓇`,re:`ℜ`,real:`ℜ`,realine:`ℛ`,realpart:`ℜ`,reals:`ℝ`,Rfr:`ℜ`,Ropf:`ℝ`,Rscr:`ℛ`,racute:`ŕ`,Racute:`Ŕ`,rcaron:`ř`,Rcaron:`Ř`,rcedil:`ŗ`,Rcedil:`Ŗ`,sfr:`𝔰`,sopf:`𝕤`,sscr:`𝓈`,Sfr:`𝔖`,Sopf:`𝕊`,Sscr:`𝒮`,circleds:`Ⓢ`,os:`Ⓢ`,sacute:`ś`,Sacute:`Ś`,scirc:`ŝ`,Scirc:`Ŝ`,scaron:`š`,Scaron:`Š`,scedil:`ş`,Scedil:`Ş`,szlig:`ß`,tfr:`𝔱`,topf:`𝕥`,tscr:`𝓉`,Tfr:`𝔗`,Topf:`𝕋`,Tscr:`𝒯`,tcaron:`ť`,Tcaron:`Ť`,tcedil:`ţ`,Tcedil:`Ţ`,trade:`™`,tstrok:`ŧ`,Tstrok:`Ŧ`,ufr:`𝔲`,uopf:`𝕦`,uscr:`𝓊`,Ufr:`𝔘`,Uopf:`𝕌`,Uscr:`𝒰`,uacute:`ú`,Uacute:`Ú`,ugrave:`ù`,Ugrave:`Ù`,ubreve:`ŭ`,Ubreve:`Ŭ`,ucirc:`û`,Ucirc:`Û`,uring:`ů`,Uring:`Ů`,uuml:`ü`,Uuml:`Ü`,udblac:`ű`,Udblac:`Ű`,utilde:`ũ`,Utilde:`Ũ`,uogon:`ų`,Uogon:`Ų`,umacr:`ū`,Umacr:`Ū`,vfr:`𝔳`,vopf:`𝕧`,vscr:`𝓋`,Vfr:`𝔙`,Vopf:`𝕍`,Vscr:`𝒱`,wfr:`𝔴`,wopf:`𝕨`,wscr:`𝓌`,Wfr:`𝔚`,Wopf:`𝕎`,Wscr:`𝒲`,wcirc:`ŵ`,Wcirc:`Ŵ`,xfr:`𝔵`,xopf:`𝕩`,xscr:`𝓍`,Xfr:`𝔛`,Xopf:`𝕏`,Xscr:`𝒳`,yfr:`𝔶`,yopf:`𝕪`,yscr:`𝓎`,Yfr:`𝔜`,Yopf:`𝕐`,Yscr:`𝒴`,yacute:`ý`,Yacute:`Ý`,ycirc:`ŷ`,Ycirc:`Ŷ`,yuml:`ÿ`,Yuml:`Ÿ`,zfr:`𝔷`,zopf:`𝕫`,zscr:`𝓏`,integers:`ℤ`,zeetrf:`ℨ`,Zfr:`ℨ`,Zopf:`ℤ`,Zscr:`𝒵`,zacute:`ź`,Zacute:`Ź`,zcaron:`ž`,Zcaron:`Ž`,zdot:`ż`,Zdot:`Ż`,imped:`Ƶ`,thorn:`þ`,THORN:`Þ`,napos:`ŉ`,alpha:`α`,Alpha:`Α`,beta:`β`,Beta:`Β`,gamma:`γ`,Gamma:`Γ`,delta:`δ`,Delta:`Δ`,epsi:`ε`,epsilon:`ε`,epsiv:`ϵ`,straightepsilon:`ϵ`,varepsilon:`ϵ`,Epsilon:`Ε`,digamma:`ϝ`,gammad:`ϝ`,Gammad:`Ϝ`,zeta:`ζ`,Zeta:`Ζ`,eta:`η`,Eta:`Η`,theta:`θ`,thetasym:`ϑ`,thetav:`ϑ`,vartheta:`ϑ`,Theta:`Θ`,iota:`ι`,Iota:`Ι`,kappa:`κ`,kappav:`ϰ`,varkappa:`ϰ`,Kappa:`Κ`,lambda:`λ`,Lambda:`Λ`,mu:`μ`,micro:`µ`,Mu:`Μ`,nu:`ν`,Nu:`Ν`,xi:`ξ`,Xi:`Ξ`,omicron:`ο`,Omicron:`Ο`,pi:`π`,piv:`ϖ`,varpi:`ϖ`,Pi:`Π`,rho:`ρ`,rhov:`ϱ`,varrho:`ϱ`,Rho:`Ρ`,sigma:`σ`,Sigma:`Σ`,sigmaf:`ς`,sigmav:`ς`,varsigma:`ς`,tau:`τ`,Tau:`Τ`,upsi:`υ`,upsilon:`υ`,Upsilon:`Υ`,Upsi:`ϒ`,upsih:`ϒ`,phi:`φ`,phiv:`ϕ`,straightphi:`ϕ`,varphi:`ϕ`,Phi:`Φ`,chi:`χ`,Chi:`Χ`,psi:`ψ`,Psi:`Ψ`,omega:`ω`,ohm:`Ω`,Omega:`Ω`,acy:`а`,Acy:`А`,bcy:`б`,Bcy:`Б`,vcy:`в`,Vcy:`В`,gcy:`г`,Gcy:`Г`,gjcy:`Ѓ`,GJcy:`Ѓ`,dcy:`д`,Dcy:`Д`,djcy:`Ђ`,DJcy:`Ђ`,iecy:`Е`,IEcy:`Е`,iocy:`Ё`,IOcy:`Ё`,jukcy:`є`,Jukcy:`Є`,zhcy:`Ж`,ZHcy:`Ж`,zcy:`з`,Zcy:`З`,dscy:`Ѕ`,DScy:`Ѕ`,icy:`и`,Icy:`И`,iukcy:`і`,Iukcy:`І`,yicy:`Ї`,YIcy:`Ї`,jcy:`й`,Jcy:`Й`,jsercy:`ј`,Jsercy:`Ј`,kcy:`к`,Kcy:`К`,kjcy:`Ќ`,KJcy:`Ќ`,lcy:`л`,Lcy:`Л`,ljcy:`Љ`,LJcy:`Љ`,mcy:`м`,Mcy:`М`,ncy:`н`,Ncy:`Н`,njcy:`Њ`,NJcy:`Њ`,ocy:`о`,Ocy:`О`,pcy:`п`,Pcy:`П`,rcy:`р`,Rcy:`Р`,scy:`с`,Scy:`С`,tcy:`т`,Tcy:`Т`,tshcy:`ћ`,TSHcy:`Ћ`,ucy:`у`,Ucy:`У`,ubrcy:`ў`,Ubrcy:`Ў`,fcy:`ф`,Fcy:`Ф`,khcy:`Х`,KHcy:`Х`,tscy:`Ц`,TScy:`Ц`,chcy:`Ч`,CHcy:`Ч`,dzcy:`Џ`,DZcy:`Џ`,shcy:`Ш`,SHcy:`Ш`,shchcy:`щ`,SHCHcy:`Щ`,hardcy:`ъ`,HARDcy:`Ъ`,ycy:`ы`,Ycy:`Ы`,softcy:`ь`,SOFTcy:`Ь`,ecy:`э`,Ecy:`Э`,yucy:`Ю`,YUcy:`Ю`,yacy:`Я`,YAcy:`Я`,alefsym:`ℵ`,aleph:`ℵ`,beth:`ℶ`,gimel:`ℷ`,daleth:`ℸ`};function cn(e){return sn[e]||sn[e.toLowerCase()]}var H=32,U=9,ln=13,W=10,un=96,dn=126,fn=91,pn=94,G=62,mn=35,hn=37,K=45,gn=61,_n=92,vn=42,yn=95,bn=60,xn=64,Sn=93,Cn=33,wn=38,Tn=58,En=70,Dn=102,On=104,kn=119,An=116,jn=112,Mn=115,Nn=160,Pn=12,Fn=44,In=59,Ln=63,Rn=46,zn=47,Bn=39,Vn=34,Hn=43,Un=124,Wn=123,Gn=125,Kn=40,qn=41,Jn=78,Yn=110,Xn=79,Zn=111,Qn=120,$n=88,er=30,q=48,J=57,Y=65,X=90,tr=97,nr=122,rr=128,ir=32,Z={blockQuote:0,breakLine:1,breakThematic:2,codeBlock:3,codeInline:4,footnote:5,footnoteReference:6,frontmatter:7,gfmTask:8,heading:9,htmlBlock:10,htmlComment:11,htmlSelfClosing:12,image:13,link:14,orderedList:15,paragraph:16,ref:17,refCollection:18,table:19,text:20,textFormatted:21,unorderedList:22};function ar(e){if(!vr(e,`---`))return null;let t=3;for(;t<e.length&&(e[t]===` `||e[t]===`	`);)t++;if(t<e.length&&e[t]===`\r`&&t++,t>=e.length||e[t]!==`
`)return null;t++;let n=!1;for(;t<e.length;){let r=t;for(;t<e.length&&e[t]!==`
`&&e[t]!==`\r`;)t++;if(t>=e.length)break;let i=t;if(e[t]===`\r`&&t++,t<e.length&&e[t]===`
`&&t++,vr(e,`---`,r))return{endPos:t,hasValidYaml:n};if(!n){let t=Pr(e,r,i);if(t<i){let r=e.charCodeAt(t);if(r>=tr&&r<=nr||r>=Y&&r<=X||r>=q&&r<=J||r===yn){for(t++;t<i&&(r=e.charCodeAt(t),r>=tr&&r<=nr||r>=Y&&r<=X||r>=q&&r<=J||r===yn||r===K||r===Rn);)t++;t<i&&e.charCodeAt(t)===Tn&&(t++,t>=i?n=!0:(r=e.charCodeAt(t),(r===H||r===U)&&(n=!0)))}}}}return null}var or=/&([a-zA-Z0-9]+|#[0-9]{1,7}|#x[0-9a-fA-F]{1,6});/gi,sr={class:`className`,for:`htmlFor`,allowfullscreen:`allowFullScreen`,allowtransparency:`allowTransparency`,autocomplete:`autoComplete`,autofocus:`autoFocus`,autoplay:`autoPlay`,cellpadding:`cellPadding`,cellspacing:`cellSpacing`,charset:`charSet`,classid:`classId`,colspan:`colSpan`,contenteditable:`contentEditable`,contextmenu:`contextMenu`,crossorigin:`crossOrigin`,enctype:`encType`,formaction:`formAction`,formenctype:`formEncType`,formmethod:`formMethod`,formnovalidate:`formNoValidate`,formtarget:`formTarget`,frameborder:`frameBorder`,hreflang:`hrefLang`,inputmode:`inputMode`,keyparams:`keyParams`,keytype:`keyType`,marginheight:`marginHeight`,marginwidth:`marginWidth`,maxlength:`maxLength`,mediagroup:`mediaGroup`,minlength:`minLength`,novalidate:`noValidate`,radiogroup:`radioGroup`,readonly:`readOnly`,rowspan:`rowSpan`,spellcheck:`spellCheck`,srcdoc:`srcDoc`,srclang:`srcLang`,srcset:`srcSet`,tabindex:`tabIndex`,usemap:`useMap`,viewbox:`viewBox`},cr={};function lr(e){if(!e)return cr;var t={};for(var n in e){var r=sr[n.toLowerCase()];if(r)t[r]=e[n];else{var i=n.indexOf(`:`);i===-1?t[n]=e[n]:t[n.slice(0,i)+n[i+1].toUpperCase()+n.slice(i+2)]=e[n]}}return t}var ur=/(\n|^[-*]\s|^#|^ {2,}|^-{2,}|^>\s|^<(div|p|h[1-6]|ul|ol|li|blockquote|pre|table|thead|tbody|tr|td|th|dl|dt|dd|hr|address|article|aside|details|dialog|figure|figcaption|footer|form|header|main|menu|nav|section|summary|textarea|fieldset|legend|center|dir|hgroup|marquee|search|output|template)\b)/i;function dr(e){return e.indexOf(`&`)===-1?e:e.replace(or,(e,t)=>{var n=cn(t);if(n)return n;if(t[0]===`#`){var r=t[1]===`x`||t[1]===`X`?Number.parseInt(t.slice(2),16):Number.parseInt(t.slice(1),10);return r===0||r>=55296&&r<=57343||r>1114111?`�`:r<=65535?String.fromCharCode(r):String.fromCharCode(55296+(r-65536>>10),56320+(r-65536&1023))}return e})}var fr=/(javascript|vbscript|data(?!:image)):/i;function pr(e){if(fr.test(e))return null;if(e.indexOf(`%`)===-1)return e;try{let t=decodeURIComponent(e).replace(/[^A-Za-z0-9/:]/g,``);if(fr.test(t))return null}catch{return null}return e}var mr={},hr,gr;for(hr=[192,193,194,195,196,197,224,225,226,227,228,229,230,198],gr=0;gr<hr.length;gr++)mr[hr[gr]]=`a`;for(mr[231]=mr[199]=`c`,mr[240]=mr[208]=`d`,hr=[200,201,202,203,233,232,234,235],gr=0;gr<hr.length;gr++)mr[hr[gr]]=`e`;for(hr=[207,239,206,238,205,237,204,236],gr=0;gr<hr.length;gr++)mr[hr[gr]]=`i`;for(mr[209]=mr[241]=`n`,hr=[248,216,339,338,213,245,212,244,211,243,210,242],gr=0;gr<hr.length;gr++)mr[hr[gr]]=`o`;for(hr=[220,252,219,251,218,250,217,249],gr=0;gr<hr.length;gr++)mr[hr[gr]]=`u`;mr[376]=mr[255]=mr[221]=mr[253]=`y`;function _r(e){for(var t=``,n=-1,r=e.length,i=0;i<r;i++){var a=e.charCodeAt(i);if(a>=tr&&a<=nr||a>=q&&a<=J){n<0&&(n=i);continue}if(a>=Y&&a<=X){n>=0&&(t+=e.slice(n,i),n=-1),t+=String.fromCharCode(a+ir);continue}if(a===H||a===K){n>=0&&(t+=e.slice(n,i),n=-1),t+=`-`;continue}n>=0&&(t+=e.slice(n,i),n=-1);var o=mr[a];o&&(t+=o)}return n>=0&&(t+=e.slice(n)),t}function vr(e,t,n){return e.startsWith(t,n)}var yr=new Set([`area`,`base`,`br`,`col`,`embed`,`hr`,`img`,`input`,`link`,`meta`,`param`,`source`,`track`,`wbr`,`circle`,`ellipse`,`line`,`path`,`polygon`,`polyline`,`rect`,`use`,`stop`,`animate`,`set`]);function br(e){let t=e.toLowerCase();if(yr.has(t))return!0;let n=t.indexOf(`:`);return n!==-1&&(t=t.slice(n+1),yr.has(t))}var xr=1,Sr=2,Cr=4,wr=8,Tr=16,Er=32,Dr=64,Or=(()=>{var e=new Uint8Array(128),t;for(e[U]=xr,e[W]=xr|Sr,e[Pn]=xr,e[ln]=xr|Sr,e[H]=xr,t=Cn;t<=zn;t++)e[t]=Cr;for(t=Tn;t<=xn;t++)e[t]=Cr;for(t=fn;t<=un;t++)e[t]=Cr;for(t=Wn;t<=dn;t++)e[t]=Cr;for(t=q;t<=J;t++)e[t]=Tr;for(t=Y;t<=X;t++)e[t]=wr;for(t=tr;t<=nr;t++)e[t]=wr;return e})(),kr=/[\p{P}\p{S}]/u,Ar=/\p{Zs}/u,jr=[];function Mr(e){var t=e.indexOf(`\r`),n=e.indexOf(`\0`);if(t===-1&&n===-1)return e;var r=e.length;jr.length=0;var i=0,a=0;for(a=t===-1?n:n===-1||t<n?t:n;a<r;a++){var o=e.charCodeAt(a);o===ln?(i<a&&jr.push(e.slice(i,a)),a+1<r&&e.charCodeAt(a+1)===W&&a++,jr.push(`
`),i=a+1):o===0&&(i<a&&jr.push(e.slice(i,a)),jr.push(`�`),i=a+1)}return i<r&&jr.push(e.slice(i)),jr.join(``)}function Nr(e){return e.replace(/>\s+</g,`><`).replace(/\n+/g,` `).trim()}function Pr(e,t,n){let r=n??e.length;for(;t<r&&(e[t]===` `||e[t]===`	`);)t++;return t}function Fr(e){if(!e)return!1;for(var t in e)return!0;return!1}function Ir(e){return{attrs:{},children:[{type:Z.text,text:e}],c:!0,type:Z.htmlBlock,tag:`header`}}var Lr=/^\n+/;function Rr(e){for(var t=e.length;t>0&&(e[t-1]===`
`||e[t-1]===`\r`);)t--;return`${e.slice(0,t).replace(Lr,``)}

`}function zr(e){if((e.type===Z.htmlSelfClosing||e.type===Z.htmlBlock)&&e.a)return[];if(e.type===Z.paragraph){var t=e.children;return t?t.flatMap(zr):[]}return e.type===Z.text?e.text?.trim()?[e]:[]:e.type===Z.htmlBlock&&e.children?[{...e,children:e.children?.flatMap(zr)}]:[e]}function Br(e){for(var t=0;t<e.length;t++){if(e[t].type===Z.htmlBlock){var n=e[t],r=!1;if(n.c&&t===e.length-1){var i=n.j===void 0?n.a?n.e||``:(n.e||``)+(n.h||``):n.j,a=`</${String(n.tag).toLowerCase()}>`,o=i.toLowerCase().indexOf(a);o!==-1&&i.slice(o+a.length).replace(/<\/[a-z][a-z0-9-]*\s*>/gi,``).trim()&&(r=!0)}r||(n.c=!1)}`children`in e[t]&&e[t].children&&Br(e[t].children)}}function Vr(e,t){for(var n=0;n<e.length;n++){var r=e[n];if(r.type===Z.paragraph&&r.children)for(var i=r.children,a=0;a<i.length;a++){var o=i[a];if(o.type===Z.htmlSelfClosing&&o.a&&o.tag.toLowerCase()===t){var s=e.slice(0,n);a>0&&s.push({type:Z.paragraph,children:i.slice(0,a)});var c=[];if(a+1<i.length){var l=i.slice(a+1).filter(e=>!(e.type===Z.htmlSelfClosing&&e.a));l.length>0&&(c=l)}return c=c.concat(e.slice(n+1)),{found:!0,beforeClose:s,afterClose:c}}}if((r.type===Z.htmlSelfClosing||r.type===Z.htmlBlock)&&r.a&&r.tag.toLowerCase()===t)return{found:!0,beforeClose:e.slice(0,n),afterClose:e.slice(n+1)}}return{found:!1,beforeClose:e,afterClose:[]}}function Hr(e){var t=``;for(var n in e){var r=e[n];r===!0?t+=` ${n}`:r!==void 0&&r!=null&&r!==!1&&(t+=` ${n}="${String(r)}"`)}return t}function Ur(e,t,n,r){var i;return i=t===void 0?Hr(n):t.length>0&&t.charCodeAt(0)>H?` ${t}`:t,`<${e}${i}${r}`}function Wr(e){var t=e.tag,n=e.type===Z.htmlSelfClosing,r=e,i=r.b,a=`</${t}>`;if(!n&&r.a)return{kind:`literal`,literal:(r.h||a)+(r.e||``)};if(n){var o=e;return o.a?{kind:`literal`,literal:o.h||a}:o.m?{kind:`literal`,literal:o.m}:{kind:`literal`,literal:Ur(t,i,e.attrs,` />`)}}var s=Ur(t,i,e.attrs,`>`),c=r.children,l=c!=null&&c.length>0;if(r.c&&r.j!==void 0)return l?{kind:`sandwich`,open:s,close:a}:{kind:`literal`,literal:r.j};if(r.c&&!l)return{kind:`literal`,literal:s+(r.e||``)+(r.h||a)};if(c!=null&&c.length>0){for(var u=``,d=0;d<c.length;d++){var f=c[d];if(f.type!==Z.text)return{kind:`sandwich`,open:s,close:a};u+=f.text}return{kind:`literal`,literal:s+u+a}}var p=r.e||``;return p&&p.indexOf(a)!==-1?{kind:`literal`,literal:s+p}:{kind:`literal`,literal:s+p+a}}function Gr(e,t,n){var r=[],i=e,a=n;if(i&&r.push(i),Array.isArray(t))for(var o=0;o<t.length;o++)r.push(t[o]);else t!=null&&r.push(t);a&&r.push(a);for(var s=[],c=0;c<r.length;c++){var l=r[c];typeof l==`string`&&s.length>0&&typeof s.at(-1)==`string`?s[s.length-1]=s.at(-1)+l:s.push(l)}return s}function Kr(e){return e==null||e.tagfilter!==!1}function qr(e,t,n,r){var i=t(e,n,r);return i===null?null:Xr(i)}function Jr(e){var t=[];if(!e)return t;for(var n in e)n.charCodeAt(0)===94&&t.push({identifier:n,footnote:e[n].target});return t}function Yr(e,t,n){if(t.indexOf(`.`)===-1)return e?.[t]||n;for(var r=e,i=t.split(`.`),a=0;a<i.length&&(r=r?.[i[a]],r!==void 0);)a++;return r||n}function Xr(e){for(var t=!1,n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<=H||r===Vn||r===hn||r===bn||r===G||r===fn||r===_n||r===Sn||r===pn||r===un||r>=123){t=!0;break}}if(!t)return e;for(var i=``,n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r===hn&&n+2<e.length){var a=e.charCodeAt(n+1),o=e.charCodeAt(n+2);if((a>=q&&a<=J||a>=Y&&a<=En||a>=tr&&a<=Dn)&&(o>=q&&o<=J||o>=Y&&o<=En||o>=tr&&o<=Dn)){i+=e[n]+e[n+1]+e[n+2],n+=2;continue}}if(r>=55296&&r<=57343){if(r<=56319&&n+1<e.length){var s=e.charCodeAt(n+1);if(s>=56320&&s<=57343){i+=encodeURI(e[n]+e[n+1]),n++;continue}}i+=e[n];continue}i+=encodeURI(e[n])}return i}function Zr(...e){return e.filter(Boolean).join(` `)}var Qr=new Set([`title`,`textarea`,`style`,`xmp`,`iframe`,`noembed`,`noframes`,`script`,`plaintext`]),$r=/<(\/?)(title|textarea|style|xmp|iframe|noembed|noframes|script|plaintext)(\s|>|\/)/gi;function ei(e){return Qr.has(e.toLowerCase())}function ti(e){return $r.lastIndex=0,$r.test(e)}function ni(e){return $r.lastIndex=0,e.replace($r,(e,t,n,r)=>`&lt;${t}${n}${r}`)}function ri(e,t){var n=e||{},r=n.slugify,i;if(r){var a=r;i=e=>a(e,_r)}else i=_r;return{disableAutoLink:n.disableAutoLink,disableFrontmatter:n.disableFrontmatter,disableParsingRawHTML:n.disableParsingRawHTML,enforceAtxHeadings:n.enforceAtxHeadings,evalUnserializableExpressions:n.evalUnserializableExpressions,forceBlock:n.forceBlock,forceInline:t===void 0?n.forceInline:t,ignoreHTMLBlocks:n.ignoreHTMLBlocks,optimizeForStreaming:n.optimizeForStreaming,preserveFrontmatter:n.preserveFrontmatter,sanitizer:n.sanitizer||pr,slugify:i,tagfilter:Kr(n)}}var ii=/^<([a-zA-Z][a-zA-Z0-9-]*)\s[^>]*>/,ai=/^<[A-Z]/,oi=[`script`,`pre`,`style`,`textarea`],si=new Set(oi),ci=/<(?:pre|script|style|textarea)\b/i,li=/<(?:pre|script|style|textarea)\b/iy,ui=/^(\s{0,3}#[#\s]|\s{0,3}[-*+]\s|\s{0,3}\d+\.\s|\s{0,3}>\s|\s{0,3}```)/m,di=/^<([a-z][^ >/\n\r]*) ?([^>]*?)>/im,fi=new Uint8Array(128);(()=>{for(var e=[un,vn,yn,dn,gn,fn,Cn,bn,_n,wn,W,On,kn,Dn],t=0;t<e.length;t++)fi[e[t]]=1})();var pi=/([a-zA-Z_][a-zA-Z0-9_-]*)=(?:"([^"]*)"|'([^']*)')/g;function mi(e){return si.has(e)}function hi(e){return ci.test(e)}function gi(e,t,n){for(var r=t,i=n;r<i&&(e.charCodeAt(r)===H||e.charCodeAt(r)===U);)r++;if(r>=i)return!1;e.charCodeAt(r)===Un&&r++;for(var a=0;r<i;){for(;r<i&&(e.charCodeAt(r)===H||e.charCodeAt(r)===U);)r++;if(r>=i)break;if(e.charCodeAt(r)===Un&&a>0){for(var o=r+1;o<i&&(e.charCodeAt(o)===H||e.charCodeAt(o)===U);)o++;if(o>=i)return!0}if(e.charCodeAt(r)===Tn&&r++,r>=i||e.charCodeAt(r)!==K)return!1;for(;r<i&&e.charCodeAt(r)===K;)r++;for(r<i&&e.charCodeAt(r)===Tn&&r++,a++;r<i&&(e.charCodeAt(r)===H||e.charCodeAt(r)===U);)r++;if(r<i){if(e.charCodeAt(r)===Un)r++;else return!1}}return a>0}var _i=/[\u0000-\u001F\u007F]/g,vi={action:1,background:1,cite:1,data:1,formaction:1,href:1,longdesc:1,poster:1,src:1,"xlink:href":1},yi=/&#(x[0-9a-f]+|[0-9]+);?/gi;function bi(e){return e.indexOf(`&#`)===-1?e:e.replace(yi,(e,t)=>{var n=t.charCodeAt(0)===Qn||t.charCodeAt(0)===$n?Number.parseInt(t.slice(1),16):Number.parseInt(t,10);return n>0&&n<=1114111?String.fromCodePoint(n):e})}function xi(e,t,n){if(n&&t.charCodeAt(0)===Wn)return!1;var r=e.charCodeAt(0),i=e.charCodeAt(1);if((r===Zn||r===Xn)&&(i===Yn||i===Jn))return!(n&&t===``);var a=e.toLowerCase();if(a===`srcdoc`)return!0;if(a===`style`)return/url\s*\(\s*(javascript|vbscript|data:(?!image\/))/i.test(t);if(vi[a]===1){var o=bi(dr(t));if(pr(o)===null)return!0;var s=o.replace(_i,``);return s!==o&&pr(s)===null}return!1}function Si(e){return`<`+(e.f?`/`:``)+e.tag+e.g+e.b+(e.n?e.r?` />`:`/>`:`>`)}function Ci(e,t,n,r){for(var i=[],a=t,o=0;o<r.length;o+=2){var s=r[o];if(s>a){var c=e.slice(a,s).trim();c&&i.push(c)}a=r[o+1]}if(a<n){var l=e.slice(a,n).trim();l&&i.push(l)}return i.join(` `)}function wi(e,t){if(e.charCodeAt(t)!==bn)return null;let n=t+1,r=e.length,i=!1;e.charCodeAt(n)===zn&&(n++,i=!0);let a=n,o=e.charCodeAt(n);if(!(o>=tr&&o<=nr||o>=Y&&o<=X))return null;for(;n<r&&(e.charCodeAt(n)>=tr&&e.charCodeAt(n)<=nr||e.charCodeAt(n)>=Y&&e.charCodeAt(n)<=X||e.charCodeAt(n)>=q&&e.charCodeAt(n)<=J||e.charCodeAt(n)===K);)n++;let s=e.slice(a,n);if(!s)return null;let c=s.charCodeAt(0),l=c>=Y&&c<=X||s.indexOf(`-`)!==-1,u=n;for(;n<r&&(e.charCodeAt(n)===H||e.charCodeAt(n)===U||e.charCodeAt(n)===W);)n++;let d=e.slice(u,n);if(n===u&&n<r){var f=e.charCodeAt(n);if(f!==G&&f!==zn)return null}let p=n,m={},h=!1;for(var g=null;n<r;){let t=e.charCodeAt(n);if(t===G){let t=g?Ci(e,p,n,g):e.slice(p,n);return{r:h,u:l,f:i,b:t,q:g!=null,n:!1,g:d,attrs:m,end:n+1,tag:s}}if(t===H||t===U||t===W){n++;continue}if(t===zn&&n+1<r&&e.charCodeAt(n+1)===G){h=n>p&&e.charCodeAt(n-1)===H;let t=g?Ci(e,p,n,g):e.slice(p,n);return{r:h,u:l,f:i,b:t,q:g!=null,n:!0,g:d,attrs:m,end:n+2,tag:s}}var _=n,v=e.charCodeAt(n);if(!(v>=tr&&v<=nr||v>=Y&&v<=X||v===yn||v===Tn))return null;for(n++;n<r;){var y=e.charCodeAt(n);if(y>=tr&&y<=nr||y>=Y&&y<=X||y>=q&&y<=J||y===yn||y===Rn||y===Tn||y===K)n++;else break}for(var b=e.slice(_,n),x=n;n<r&&(e.charCodeAt(n)===H||e.charCodeAt(n)===U);)n++;var S,C;if(e.charCodeAt(n)===gn){for(n++;n<r&&(e.charCodeAt(n)===H||e.charCodeAt(n)===U);)n++;var w=e.charCodeAt(n);if(w===Vn||w===Bn){n++;for(var T=n;n<r&&e.charCodeAt(n)!==w;)n++;if(n>=r)return null;if(S=e.slice(T,n),n++,n<r){var E=e.charCodeAt(n);if(E!==H&&E!==U&&E!==W&&E!==G&&E!==zn)return null}C=n}else if(w===Wn){var D=1,T=n;for(n++;n<r&&D>0;){var y=e.charCodeAt(n);y===Wn?D++:y===Gn&&D--,n++}S=e.slice(T,n),C=n}else{for(var T=n;n<r;){var O=e.charCodeAt(n);if(O===H||O===U||O===G||O===W||O===Vn||O===Bn||O===gn||O===bn||O===un)break;n++}if(n===T)return null;S=e.slice(T,n),C=n}}else S=``,C=x;xi(b,S,l)?(g===null&&(g=[]),g.push(_,C)):m[b]=S}return null}function Ti(e){var t=e.indexOf(`<`);if(t===-1)return e;for(var n=``,r=0,i=!1;t!==-1;){var a=wi(e,t);a?(a.q&&(n+=e.slice(r,t)+Si(a),r=a.end,i=!0),t=e.indexOf(`<`,a.end)):t=e.indexOf(`<`,t+1)}return i?n+e.slice(r):e}function Ei(e,t,n){if(!n.optimizeForStreaming&&e.indexOf(`[`)===-1)return!1;for(var r=0,i=e.length,a=!1,o=!1;r<i;){for(var s=e.indexOf(`
`,r),c=s<0?i:s,l=r,u=0;l<c&&u<4;)if(e.charCodeAt(l)===H)u++,l++;else if(e.charCodeAt(l)===U)u+=4,l++;else break;if(l>=c){a=!1,r=s<0?i:s+1;continue}if(u<4){var d=e.charCodeAt(l);if(d===un||d===dn){for(var f=d,p=0,m=l;m<c&&e.charCodeAt(m)===f;)p++,m++;if(p>=3){var h=!0;if(f===un){for(var g=m;g<c;g++)if(e.charCodeAt(g)===un){h=!1;break}}if(h){a=!1;for(var _=s<0?i:s+1;_<i;){for(var v=_,y=0;v<i&&y<4;){var b=e.charCodeAt(v);if(b===H)y++,v++;else if(b===U)y+=4,v++;else break}if(y<4&&v<i&&e.charCodeAt(v)===f){for(var x=0;v<i&&e.charCodeAt(v)===f;)x++,v++;if(x>=p){for(;v<i&&(e.charCodeAt(v)===H||e.charCodeAt(v)===U);)v++;if(v>=i||e.charCodeAt(v)===W){r=v>=i?i:v+1;break}}}for(;_<i&&e.charCodeAt(_)!==W;)_++;_<i&&_++}_>=i&&(r=i,o=!0);continue}}}}for(var S=l;S<c&&e.charCodeAt(S)===G;){S++,S<c&&e.charCodeAt(S)===H&&S++;for(var C=0;S<c&&C<4;)if(e.charCodeAt(S)===H)C++,S++;else if(e.charCodeAt(S)===U)C+=4,S++;else break;if(C>=4)break;a=!1}if(!a&&u<4&&S<c&&e.charCodeAt(S)===fn&&!(S+1<i&&e.charCodeAt(S+1)===pn)){var w=Di(e,S,t);if(w){r=w,a=!1;continue}}var T=e.charCodeAt(l);if(T===mn&&u<4)a=!1;else if(u<4&&(T===K||T===vn||T===yn)){for(var E=l,D=0;E<c;){var O=e.charCodeAt(E);if(O===T)D++;else if(O!==H&&O!==U)break;E++}a=!(D>=3&&E>=c)}else a=!0;r=s<0?i:s+1}return o}function Di(e,t,n){let r=e.length;if(e.charCodeAt(t)!==fn)return null;let i=t+1<r&&e.charCodeAt(t+1)===pn,a=t+1;for(;a<r;){var o=e.charCodeAt(a);if(o===Sn){a++;break}if(o===fn)return null;o===_n&&a+1<r&&a++,a++}if(a>r||e.charCodeAt(a-1)!==Sn)return null;let s=e.slice(t+1,a-1);if(s.length>999)return null;let c=ji(s);if(!c||a>=r||e.charCodeAt(a)!==Tn)return null;a++;let l=!1;for(;a<r;){let t=e.charCodeAt(a);if(t===H||t===U)a++;else if(t===W&&!l)l=!0,a++;else break}if(i){let t=e.indexOf(`
`,a),i=t<0?r:t;return n[c]={target:e.slice(a,i).trim(),title:void 0},t<0?r:t+1}var u;if(a<r&&e.charCodeAt(a)===bn){a++;for(var d=a;a<r&&e.charCodeAt(a)!==G&&e.charCodeAt(a)!==W;)e.charCodeAt(a)===_n&&a+1<r&&a++,a++;if(a>=r||e.charCodeAt(a)!==G)return null;u=e.slice(d,a),a++;for(var f=e.indexOf(`
`,a),p=f<0?r:f,m=a;m<p&&(e.charCodeAt(m)===H||e.charCodeAt(m)===U);)m++;if(m<p){if(m===a)return null;var h=e.charCodeAt(m);if(h!==Vn&&h!==Bn&&h!==Kn)return null}}else{for(var d=a,g=0;a<r;){var o=e.charCodeAt(a);if(o===Kn)g++;else if(o===qn){if(g===0)break;g--}else{if(o===H||o===U||o===W)break;o===_n&&a+1<r&&a++}a++}if(u=e.slice(d,a),!u)return null}for(;a<r&&(e.charCodeAt(a)===H||e.charCodeAt(a)===U);)a++;var _=e.indexOf(`
`,a),v=_<0?r:_,y,b=!1,x=a,S=a;if(a===v&&a<r)for(S=a+1;S<r&&(e.charCodeAt(S)===H||e.charCodeAt(S)===U);)S++;if(S<r){var C=e.charCodeAt(S);if(C===Vn||C===Bn||C===Kn){for(var w=C===Kn?41:C,T=S+1,E=T;T<r;){var D=e.charCodeAt(T);if(D===w){for(var O=T+1;O<r&&(e.charCodeAt(O)===H||e.charCodeAt(O)===U);)O++;(O>=r||e.charCodeAt(O)===W)&&(y=e.slice(E,T),b=!0,x=O<r?O+1:r);break}if(D===_n&&T+1<r){T+=2;continue}if(D===W&&T+1<r&&e.charCodeAt(T+1)===W)break;T++}if(!b&&S===a)return null}}if(b)return n[c]||(n[c]={target:dr(Ni(u)),title:y===void 0?y:dr(Ni(y))}),x;for(;a<v&&(e.charCodeAt(a)===H||e.charCodeAt(a)===U);)a++;return a<v?null:(n[c]||(n[c]={target:dr(Ni(u)),title:y}),_<0?r:_+1)}var Oi=new Uint8Array(Or);for(Oi[mn]|=Er,Oi[G]|=Er,Oi[K]|=Er|Dr,Oi[Hn]|=Er,Oi[vn]|=Er|Dr,Oi[yn]|=Er|Dr,Oi[un]|=Er|Dr,Oi[dn]|=Er|Dr,Oi[bn]|=Er|Dr,Oi[fn]|=Dr,Oi[Cn]|=Dr,Oi[Un]|=Er,ki=q;ki<=J;ki++)Oi[ki]|=Er;var ki;function Ai(e){if(e.indexOf(`[`)<0&&e.indexOf(`]`)<0)return!1;for(var t=0;t<e.length;t++){if(e.charCodeAt(t)===_n){t++;continue}if(e.charCodeAt(t)===fn||e.charCodeAt(t)===Sn)return!0}return!1}function ji(e){for(var t=e.length,n=!0,r=t>0,i=0;i<t;i++){var a=e.charCodeAt(i);if(a===H){if(n){r=!1;break}n=!0}else if(a<33||a>126||a>=Y&&a<=X){r=!1;break}else n=!1}if(r&&!n)return e;var o=e.replace(/\s+/g,` `).trim();return o.indexOf(`ẞ`)===-1?o.toLowerCase():o.replace(/\u1E9E/g,`ss`).toLowerCase()}function Mi(e){return e<rr?Oi[e]:e===Nn?xr:0}function Ni(e){return e.indexOf(`\\`)===-1?e:e.replace(/\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g,`$1`)}var Pi=null,Fi=-1,Ii=-1;function Li(e,t){if(t>=Fi&&t<=Ii&&e===Pi)return Ii;var n=e.indexOf(`
`,t),r=n<0?e.length:n;return Pi=e,Fi=t,Ii=r,r}function Q(e,t){let n=Li(e,t);return n<e.length?n+1:n}function Ri(e,t,n){for(;t<n;){let n=e.charCodeAt(t);if(n!==H&&n!==U)break;t++}return t}function zi(e,t){let n=Q(e,t);for(;n<e.length;){let t=Li(e,n);if(Ui(e,n,t))return n;n=Q(e,n)}return e.length}function Bi(e,t,n,r){let i=0;for(;t+i<n&&e.charCodeAt(t+i)===r;)i++;return i}var Vi=0,$=0;function Hi(e,t,n){for(Vi=0,$=0;t+$<n;){let n=e.charCodeAt(t+$);if(n===U)Vi+=4-Vi%4;else if(n===H)Vi++;else break;$++}}function Ui(e,t,n){return Ri(e,t,n)>=n}function Wi(e,t){if(!e)return e;var n=t.v||=Object.create(null),r=n[e];if(r===void 0)return n[e]=0,e;for(var i=r+1,a=`${e}-${i}`;n[a]!==void 0;)i++,a=`${e}-${i}`;return n[e]=i,n[a]=0,a}function Gi(e,t,n,r){let i=Li(e,t);if(Hi(e,t,i),Vi>3)return null;let a=t+$;if(e.charCodeAt(a)!==mn)return null;let o=Bi(e,a,i,35);if(o<1||o>6||(a+=o,a<i&&e.charCodeAt(a)!==H&&e.charCodeAt(a)!==U))return null;a=Ri(e,a,i);for(var s=i;s>a&&e.charCodeAt(s-1)===H;)s--;for(var c=s;s>a&&e.charCodeAt(s-1)===mn;)s--;if(s<c){if(s===a||e.charCodeAt(s-1)===H)for(;s>a&&e.charCodeAt(s-1)===H;)s--;else s=c}let l=ya(e.slice(a,s),!1,n,r);return{node:{type:Z.heading,level:o,children:l,id:``},end:Q(e,i)}}function Ki(e,t,n){var r=e.charCodeAt(t);if(r!==gn&&r!==K)return!1;for(var i=t;i<n&&e.charCodeAt(i)===r;)i++;for(;i<n&&(e.charCodeAt(i)===H||e.charCodeAt(i)===U);)i++;return i>=n}function qi(e,t){let n=Li(e,t);if(Hi(e,t,n),Vi>3)return null;let r=t+$,i=e.charCodeAt(r);if(i!==K&&i!==vn&&i!==yn)return null;let a=0;for(;r<n;){let t=e.charCodeAt(r);if(t===i)a++;else if(t!==H&&t!==U)return null;r++}return a<3?null:{node:{type:Z.breakThematic},end:Q(e,n)}}var Ji=0,Yi=0,Xi=``;function Zi(e,t,n){let r=Li(e,t);if(Hi(e,t,r),Vi>3)return null;let i=Vi,a=t+$,o=e.charCodeAt(a);if(o!==un&&o!==dn)return null;let s=Bi(e,a,r,o);if(s<3)return null;a+=s;let c=Ri(e,a,r),l=r;if(o===un){for(let t=c;t<r;t++)if(e.charCodeAt(t)===un)return null}for(;l>c&&(e.charCodeAt(l-1)===H||e.charCodeAt(l-1)===U);)l--;let u=e.slice(c,l),d=``,f=``,p=u.indexOf(` `);p===-1?d=u:(d=u.slice(0,p),f=u.slice(p+1).trim()),d=Ni(d);var m;if(f){pi.lastIndex=0;for(var h;(h=pi.exec(f))!=null;)m||={},m[h[1]]=h[2]===void 0?h[3]:h[2]}let g=Q(e,r),_=e.length,v=e.length;var y;o===Ji&&s===Yi?y=Xi:(y=String.fromCharCode(o).repeat(s),Ji=o,Yi=s,Xi=y);for(var b=g;b<e.length;){var x=e.indexOf(y,b);if(x===-1)break;for(var S=x,C=0;S>0&&C<4&&e.charCodeAt(S-1)===H;)S--,C++;if(C<=3&&(S===0||e.charCodeAt(S-1)===W)){for(var w=x+s;w<e.length&&e.charCodeAt(w)===o;)w++;var T=Li(e,w);if(Ui(e,w,T)){_=S,v=Q(e,T);break}}b=x+1}var E;if(i===0)E=_>g&&e.charCodeAt(_-1)===W?e.slice(g,_-1):e.slice(g,_);else{E=``;for(var D=g;D<_;){var O=Li(e,D);Hi(e,D,O);var ee=Math.min($,i);E+=`${e.slice(D+ee,O)}
`,D=Q(e,O)}E.length>0&&E.charCodeAt(E.length-1)===W&&(E=E.slice(0,-1))}return{node:{type:Z.codeBlock,lang:d||void 0,text:E,infoString:f||void 0,attrs:m},end:v}}function Qi(e,t,n){for(var r=0,i=t;i<n&&r<4;)e.charCodeAt(i)===U?r+=4-r%4:r++,i++;if(r<4)return``;for(var a=``,o=4;o<r;o++)a+=` `;return a+e.slice(i,n)}function $i(e,t){if(Hi(e,t,Li(e,t)),Vi<4)return null;let n=``,r=t;for(;r<e.length;){let t=Li(e,r);if(Hi(e,r,t),Ui(e,r,t)){for(var i=`${Qi(e,r,t)}
`,a=Q(e,t);a<e.length;){var o=Li(e,a);if(Ui(e,a,o)){i+=`${Qi(e,a,o)}
`,a=Q(e,o);continue}Hi(e,a,o),Vi>=4&&(n+=i,r=a);break}if(r!==a)break;continue}if(Vi<4)break;let d=0,f=0;var s=0;for(let n=r;n<t&&f<4;n++){if(e.charCodeAt(n)===U){var c=4-f%4;f+c>4&&(s=f+c-4),f+=c}else f++;d++}var l=``;if(s>0)for(var u=0;u<s;u++)l+=` `;l+=e.slice(r+d,t),n+=`${l}
`,r=Q(e,t)}for(;n.length>0&&n.charCodeAt(n.length-1)===W;)n=n.slice(0,-1);return n?{node:{type:Z.codeBlock,lang:void 0,text:n,infoString:void 0,attrs:void 0},end:r}:null}function ea(e,t,n,r){if(Hi(e,t,Li(e,t)),Vi>3)return null;let i=t+$;if(e.charCodeAt(i)!==G)return null;let a=``,o=t,s,c=!1,l=!1,u=!1;for(;o<e.length;){let t=Li(e,o);Hi(e,o,t);let n=o+$;if(e.charCodeAt(n)===G){let r=n+1;var d=Vi+1,f=!1;if(r<t){var p=e.charCodeAt(r);p===H?(r++,d++,f=!0):p===U&&(f=!0)}for(var m=``,h=!1,g=r;g<t;g++)if(e.charCodeAt(g)===U){h=!0;break}if(h){var _=d;if(f&&r<t&&e.charCodeAt(r)===U){for(var v=4-_%4,y=0;y<v-1;y++)m+=` `;_+=v,r++}for(var b=r;b<t;b++)if(e.charCodeAt(b)===U){for(var x=4-_%4,S=0;S<x;S++)m+=` `;_+=x}else m+=e[b],_++}else m=e.slice(r,t);if(!(a||s)){let n=m.match(/^\[!([A-Za-z]+)\]\s*$/);if(n){s=n[1].toUpperCase(),o=Q(e,t);continue}}a+=`${m}
`;var C=m.trimStart();C.startsWith("```")||C.startsWith(`~~~`)?u=!u:(m.startsWith(`    `)||m.startsWith(`	`))&&(u=!0),l=C.length>0,o=Q(e,t)}else if(a&&!Ui(e,o,t)&&l){if(Vi<4){var w=o+$,T=w<t?e.charCodeAt(w):0;if(T===mn||T===G||T===un||T===dn||T===bn||(T===K||T===vn||T===yn)&&qi(e,o)||(T===K||T===vn||T===Hn)&&w+1<t&&(e.charCodeAt(w+1)===H||e.charCodeAt(w+1)===U))break;if(T>=q&&T<=J){for(var E=w;E<t&&e.charCodeAt(E)>=q&&e.charCodeAt(E)<=J;)E++;if(E<t&&(e.charCodeAt(E)===Rn||e.charCodeAt(E)===qn))break}}if(u)break;a+=`${e.slice(o,t)}
`,c=!0,o=Q(e,t)}else break}if(!(a||s))return null;var{inBlockQuote:D,l:O}=n;n.inBlockQuote=!0,c&&(n.l=!0);var ee=n.i;n.i=ee||!Ui(e,o,e.length);let k=io(a||``,n,r);return n.i=ee,n.inBlockQuote=D,n.l=O,{node:{type:Z.blockQuote,children:k,alert:s||void 0},end:o}}function ta(e,t,n){for(var r=0,i=t;i<n;i++)e.charCodeAt(i)===U?r+=4-r%4:r++;return r}function na(e,t,n){if(Hi(e,t,n),Vi>3)return null;var r=t+$;if(r>=n)return null;var i=e.charCodeAt(r),a=Vi,o=r,s=r;if(i===K||i===vn||i===Hn){if(o=r+1,o<n&&e.charCodeAt(o)!==H&&e.charCodeAt(o)!==U&&e.charCodeAt(o)!==W)return null}else if(i>=q&&i<=J){for(;s<n&&s-r<9;){var c=e.charCodeAt(s);if(c<q||c>J)break;s++}if(s>r&&s<n){var l=e.charCodeAt(s);if(l===Rn||l===qn){if(o=s+1,o<n&&e.charCodeAt(o)!==H&&e.charCodeAt(o)!==U&&e.charCodeAt(o)!==W)return null}else return null}else return null}else return null;var u=o,d=ta(e,t,o),f=0,p=u,m=d;if(u>=n)return{ordered:i>=q&&i<=J,marker:i>=q&&i<=J?e[s]:e[r],start:i>=q&&i<=J?Number.parseInt(e.slice(r,s),10):void 0,contentStart:u,contentCol:d+1,markerCol:a,isEmpty:!0};for(;p<n&&(e.charCodeAt(p)===H||e.charCodeAt(p)===U);){if(e.charCodeAt(p)===U){var h=4-m%4;m+=h}else m++;p++,f++}var g=p>=n,_=m-d;return g||_>4?(m=d+1,p=u+1,f=1):f===0&&(m=d+1,p=u,f=1),{ordered:i>=q&&i<=J,marker:i>=q&&i<=J?e[s]:e[r],start:i>=q&&i<=J?Number.parseInt(e.slice(r,s),10):void 0,contentStart:p,contentCol:m,markerCol:a,isEmpty:g}}var ra=0;function ia(e,t,n,r){var i=0,a=t;for(ra=0;a<n&&i<r;){var o=e.charCodeAt(a);if(o===U){var s=4-i%4;if(i+s>r){ra=i+s-r,a++,i=r;break}i+=s}else if(o===H)i++;else break;a++}return a}function aa(e,t,n,r){var i=Li(e,t),a=na(e,t,i);if(!a)return null;var o=[],s=t,c=a.contentCol,l=``,u=a.isEmpty,d=!1,f=!1;if(!a.isEmpty){for(var p=!1,m=a.contentStart;m<i;m++)if(e.charCodeAt(m)===U){p=!0;break}if(p){var h=``,g=ta(e,t,a.contentStart),_=g-a.contentCol;if(_>0)for(var v=0;v<_;v++)h+=` `;for(var y=a.contentStart;y<i;y++)if(e.charCodeAt(y)===U){for(var b=4-g%4,x=0;x<b;x++)h+=` `;g+=b}else h+=e[y],g++;l=`${h}
`}else l=`${e.slice(a.contentStart,i)}
`}for(s=Q(e,i);s<e.length;){var S=Li(e,s);Hi(e,s,S);var C=e.charCodeAt(s+$);if(Vi<c&&(C===K||C===vn||C===yn)&&Vi<=3&&qi(e,s))break;var w=na(e,s,S);if(w&&w.ordered===a.ordered&&w.marker===a.marker&&w.markerCol<c){o.push({contentCol:c,raw:l,hasBlankAfter:d,isEmpty:u}),d&&(f=!0),c=w.contentCol,u=w.isEmpty,d=!1,l=w.isEmpty?``:`${e.slice(w.contentStart,S)}
`,s=Q(e,S);continue}if(Ui(e,s,S)){var T=ia(e,s,S,c);if(ra>0||T<S){for(var E=``,D=0;D<ra;D++)E+=` `;l+=`${E+e.slice(T,S)}
`}else l+=`
`;s=Q(e,S);for(var O=!1,ee=0;ee<l.length;ee++){var k=l.charCodeAt(ee);if(k!==W&&k!==ln&&k!==H&&k!==U){O=!0;break}}if(u&&!O){if(s<e.length){var te=Li(e,s),ne=na(e,s,te);if(!ne||ne.ordered!==a.ordered||ne.marker!==a.marker)break;d=!0}else break}if(s<e.length){var re=Li(e,s);Hi(e,s,re);var ie=e.charCodeAt(s+$);if((ie===K||ie===vn||ie===yn)&&Vi<=3&&qi(e,s))break;var A=na(e,s,re);if(A&&A.ordered===a.ordered&&A.marker===a.marker&&A.markerCol<c){d=!0;continue}if(!Ui(e,s,re)&&Vi<c)break}continue}if(Vi>=c){var ae=ia(e,s,S,c);if(ra>0){for(var oe=``,se=c,ce=0;ce<ra;ce++)oe+=` `,se++;for(var j=ae;j<S;j++)if(e.charCodeAt(j)===U){for(var M=4-se%4,N=0;N<M;N++)oe+=` `;se+=M}else oe+=e[j],se++;l+=`${oe}
`}else l+=`${e.slice(ae,S)}
`;s=Q(e,S);continue}for(var le=!1,ue=0;ue<l.length;ue++){var de=l.charCodeAt(ue);if(de!==W&&de!==ln&&de!==H&&de!==U){le=!0;break}}if(!d&&le&&!u){var P=s+$,F=e.charCodeAt(P);if(!(F===mn||F===G||F===bn||F===un||F===dn||(F===K||F===vn||F===yn||F===Hn)&&(qi(e,s)!=null||na(e,s,S)!=null)||F>=q&&F<=J&&na(e,s,S)!=null)){l+=`${e.slice(P,S)}
`,s=Q(e,S);continue}}break}if(o.push({contentCol:c,raw:l,hasBlankAfter:d,isEmpty:u}),o.length===0)return null;var fe=f;if(!fe)for(var pe=0;pe<o.length;pe++){if(o[pe].hasBlankAfter&&pe<o.length-1){fe=!0;break}if(!o[pe].isEmpty){for(var me=o[pe].raw,I=me.length,L=0,he=!1,ge=!1,_e=!1,ve=!1,ye=0,R=0,be=-1;L<I;){var z=me.indexOf(`
`,L);if(z<0&&(z=I),ve){Hi(me,L,z);for(var xe=me.slice(L+$,z),Se=0;Se<xe.length&&xe.charCodeAt(Se)===ye;)Se++;Se>=R&&xe.slice(Se).trim()===``&&(ve=!1),L=z<I?z+1:I;continue}if(Ui(me,L,z)){be>=0?_e=!0:he&&(ge=!0),L=z<I?z+1:I;continue}if(Hi(me,L,z),be>=0){if(Vi>=be){L=z<I?z+1:I;continue}var Ce=na(me,L,z);if(Ce&&Ce.markerCol<be&&Ce.contentCol<=be){L=z<I?z+1:I;continue}if(Ce){L=z<I?z+1:I;continue}be=-1,_e&&=(ge=!0,!1)}var we=me.slice(L+$,z),Te=we.charCodeAt(0);if((Te===un||Te===dn)&&Vi<=3){for(var Ee=0;Ee<we.length&&we.charCodeAt(Ee)===Te;)Ee++;if(Ee>=3){if(ge&&he){fe=!0;break}ve=!0,ye=Te,R=Ee,he=!0,L=z<I?z+1:I;continue}}var De=Vi<=3?na(me,L,z):null;if(De&&he){if(ge){fe=!0;break}be=De.contentCol,_e=!1,L=z<I?z+1:I,he=!0;continue}if(ge){fe=!0;break}he=!0,L=z<I?z+1:I}if(fe)break}}for(var Oe=[],ke=0;ke<o.length;ke++){for(var Ae=o[ke],je=Ae.raw,Me=je.length;Me>0&&je.charCodeAt(Me-1)===W;)Me--;var Ne=Me<je.length?je.slice(0,Me):je,Pe=null;if(Ne.length>=3&&Ne.charCodeAt(0)===fn){var Fe=Ne[1];(Fe===` `||Fe===`x`||Fe===`X`)&&Ne.charCodeAt(2)===Sn&&(Pe={type:Z.gfmTask,completed:Fe===`x`||Fe===`X`},Ne=Ne.slice(3))}var Ie;if(Ae.isEmpty&&Ne.trim()===``)Ie=[];else if(fe){var Le=n.inList;n.inList=!0;var Re=n.i;n.i=Re||ke!==o.length-1,Ie=io(Ne,n,r),n.i=Re,n.inList=Le}else{var ze=n.inList;n.inList=!0;var Be=n.i;if(n.i=Be||ke!==o.length-1,Ie=io(Ne,n,r),n.i=Be,n.inList=ze,Ie.length===1&&Ie[0].type===Z.paragraph)Ie=Ie[0].children;else if(n.p){var Ve=[];n.p.push({src:Ie,dest:Ve,unwrap:!0}),Ie=Ve}else{for(var He=[],Ue=0;Ue<Ie.length;Ue++)if(Ie[Ue].type===Z.paragraph)for(var We=Ie[Ue].children,Ge=0;Ge<We.length;Ge++)He.push(We[Ge]);else He.push(Ie[Ue]);Ie=He}}if(Pe){var Ke=[Pe,{type:Z.text,text:` `}];if(n.p)n.p.push({src:Ie,dest:Ke,unwrap:!1});else for(var qe=0;qe<Ie.length;qe++)Ke.push(Ie[qe]);Oe.push(Ke)}else Oe.push(Ie)}return{node:{type:a.ordered?Z.orderedList:Z.unorderedList,start:a.ordered?a.start:void 0,items:Oe},end:s}}var oa=new Set(`address.article.aside.base.basefont.blockquote.body.caption.center.col.colgroup.dd.details.dialog.dir.div.dl.dt.fieldset.figcaption.figure.footer.form.frame.frameset.h1.h2.h3.h4.h5.h6.head.header.hr.html.iframe.legend.li.link.main.menu.menuitem.nav.noframes.ol.optgroup.option.p.param.search.section.summary.table.tbody.td.tfoot.th.thead.title.tr.track.ul`.split(`.`));function sa(e,t,n){let r={};for(let[o,s]of Object.entries(e)){let e=o.toLowerCase();if(e===`style`&&typeof s==`string`){let e={},t=[],n=0,i=0;for(let e=0;e<s.length;e++){let r=s.charCodeAt(e);r===Kn?n++:r===qn?n--:r===In&&n===0&&(t.push(s.slice(i,e)),i=e+1)}i<s.length&&t.push(s.slice(i));let a=!1;t.forEach(t=>{let n=t.indexOf(`:`);if(n===-1)return;let r=t.slice(0,n).trim(),i=t.slice(n+1).trim();if(r&&i){if(/url\s*\(\s*(javascript|vbscript|data:(?!image\/))/i.test(i)){a=!0;return}let t=r.indexOf(`-`)===-1?r:r.replace(/-([a-z])/g,(e,t)=>t.toUpperCase());e[t]=i}}),!a&&Object.keys(e).length>0&&(r[o]=e)}else if((e===`href`||e===`src`)&&n?.sanitizer){let i=n.sanitizer(s,t,e);i!=null&&(r[o]=i)}else if(s===``)r[o]=!0;else if(s.length>=2&&s.charCodeAt(0)===Wn&&s.charCodeAt(s.length-1)===Gn){var i=s.slice(1,-1);if(i.length>0){var a=i.charCodeAt(0);if(a===fn||a===Wn)try{r[o]=JSON.parse(i);continue}catch{}}if(i===`true`){r[o]=!0;continue}if(i===`false`){r[o]=!1;continue}if(n?.evalUnserializableExpressions)try{r[o]=(0,eval)(`(${i})`);continue}catch{}r[o]=i}else r[o]=s}return r}function ca(e,t,n){let r=t.length;if(r===0)return n;var i=t.charCodeAt(0);if(!(i>=Y&&i<=X||i>=tr&&i<=nr)){for(var a=String.fromCharCode(i),o=e.length-r,s=n;s<=o;){var c=e.indexOf(a,s);if(c===-1||c>o)return-1;for(var l=!0,u=1;u<r;u++){var d=e.charCodeAt(c+u),f=t.charCodeAt(u);if(d>=Y&&d<=X&&(d+=ir),f>=Y&&f<=X&&(f+=ir),d!==f){l=!1;break}}if(l)return c;s=c+1}return-1}i>=Y&&i<=X&&(i+=ir);for(let a=n;a<=e.length-r;a++){var p=e.charCodeAt(a);if(p>=Y&&p<=X&&(p+=ir),p!==i)continue;let n=!0;for(let i=1;i<r;i++){let r=e.charCodeAt(a+i),o=t.charCodeAt(i);if(r>=Y&&r<=X&&(r+=ir),o>=Y&&o<=X&&(o+=ir),r!==o){n=!1;break}}if(n)return a}return-1}function la(e,t,n){let r=t.length;var i=t.charCodeAt(0);i>=Y&&i<=X&&(i+=ir);for(let o=Math.min(n,e.length-r);o>=0;o--){var a=e.charCodeAt(o);if(a>=Y&&a<=X&&(a+=ir),a!==i)continue;let n=!0;for(let i=1;i<r;i++){let r=e.charCodeAt(o+i),a=t.charCodeAt(i);if(r>=Y&&r<=X&&(r+=ir),a>=Y&&a<=X&&(a+=ir),r!==a){n=!1;break}}if(n)return o}return-1}var ua=-1;function da(e,t,n){let r=n.toLowerCase(),i=`<${r}`,a=`</${r}`,o=1,s=t,c=e.length;for(ua=-1;s<c&&o>0;){let t=ca(e,i,s),n=ca(e,a,s);if(n===-1)return-1;if(t!==-1&&t<n){let n=wi(e,t);n?(n.tag.toLowerCase()===r&&!n.f&&!n.n&&!br(n.tag)&&o++,s=n.end):s=t+1}else{var l=n+a.length,u=l<c?e.charCodeAt(l):62;if((u===G||u===H||u===U||u===W)&&(o--,o===0)){ua=n;let t=n+a.length;for(;t<c&&e.charCodeAt(t)!==G;)t++;return t+1}s=n+1}}return-1}function fa(e,t,n,r){if(r.ignoreHTMLBlocks||r.disableParsingRawHTML)return null;var i=Li(e,t);if(Hi(e,t,i),Vi>3&&!n.inHTML)return null;var a=t+$;if(e.charCodeAt(a)!==bn)return null;var o=e.indexOf(`>`,a+1);if(o!==-1&&o<i){var s=e.slice(a+1,o);if(/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)||/^[^\s@]+@[^\s@]+$/.test(s))return null}var c=pa(e,a);if(c>=1&&c<=5){var l=e.length;if(c===1){for(var u=e.length,d=0;d<oi.length;d++){var f=ca(e,`</${oi[d]}>`,a);f>=0&&f<u&&(u=f)}if(u<e.length){var p=e.indexOf(`>`,u);l=p>=0?Q(e,p+1):e.length}}else{var m=c===2?`-->`:c===3?`?>`:c===4?`>`:`]]>`,h=e.indexOf(m,a);h>=0&&(l=Q(e,h+m.length))}var g=e.slice(a,l);if(c>=2)return{node:{type:Z.htmlComment,text:g,s:!1,raw:!0},end:l};var _=`div`,v=g.match(/^<\/?([a-zA-Z][a-zA-Z0-9-]*)/);v&&(_=v[1]);var y=wi(e,a),b={},x;y&&!y.f&&(b=sa(y.attrs,_,r),x=y.g+y.b);var S=[],C=ca(g,`</${_.toLowerCase()}`,0),w=``,T,E,D;if(y?.f){D=g.slice(0,y.end-a);for(var O=g.slice(y.end-a);O.length>0&&O.charCodeAt(O.length-1)===W;)O=O.slice(0,-1);O&&(E=Ti(O))}else if(y&&!y.f){var ee=y.end-a;if(C===-1){for(var k=g;k.length>0&&k.charCodeAt(k.length-1)===W;)k=k.slice(0,-1);T=Ti(k)}else{var te=ee;g.charCodeAt(te)===W&&te++;for(var ne=C;ne>te;){var re=g.charCodeAt(ne-1);if(re!==H&&re!==U&&re!==W&&re!==ln)break;ne--}var ie=g.slice(te,ne);ie&&(E=Ti(ie));for(var A=g.slice(C);A.length>0&&A.charCodeAt(A.length-1)===W;)A=A.slice(0,-1);D=Ti(A),w=g.slice(ee,C).trim()}}var ae=y?y.f:!1;return{node:{type:Z.htmlBlock,tag:_,attrs:b,b:x,children:S,e:E,h:D,j:T,text:w,c:!0,a:ae},end:l}}if(c===6||c===7){var oe=zi(e,t),se=oe<e.length?oe:e.length,ce=e.slice(a,se),j=oe<e.length?Q(e,oe):e.length,M=wi(e,a);if(M){var N=M.tag,le=N.toLowerCase();if(M.f){var ue=e.slice(M.end,se);return{node:{type:Z.htmlBlock,tag:N,attrs:{},children:[],h:e.slice(a,M.end),e:ue?Ti(ue):void 0,text:ue,c:!0,a:!0},end:j}}if(M.n||br(N))return{node:{type:Z.htmlBlock,tag:N,attrs:sa(M.attrs,N,r),b:M.g+M.b,children:[],text:``,c:!1,a:!1},end:M.end<e.length&&e.charCodeAt(M.end)===W?M.end+1:M.end};var de=n.d||0,P=e.slice(a,se),F=-1,fe=-1,pe=!1;if(de<10){for(var me=`</${le}`,I=M.end-a,L=1,he=I;he<P.length&&L>0;){var ge=ca(P,`<${le}`,he),_e=ca(P,me,he);if(_e===-1)break;if(ge!==-1&&ge<_e){var ve=ge+le.length+1;if(ve<P.length){var ye=P.charCodeAt(ve);(ye===H||ye===U||ye===W||ye===G||ye===zn)&&L++}he=ge+1}else{var R=_e+me.length;if(R<P.length){var be=P.charCodeAt(R);if((be===G||be===H||be===U||be===W)&&(L--,L===0)){F=_e;for(var z=R;z<P.length&&P.charCodeAt(z)!==G;)z++;fe=z+1;break}}else if(L--,L===0){F=_e,fe=P.length;break}he=_e+1}}if(F===-1&&!M.f&&(c===6||M.u)){var xe=da(e,M.end,le);if(xe!==-1){for(var Se=ua,Ce=M.end,we=!1,Te=!1,Ee=!1,De=0,Oe=!1,ke=!1,Ae=Ce;Ae<Se;){var je=e.charCodeAt(Ae);if(je===W)ke&&(we=!0),Oe||De++,ke=!0,Ae++;else if(je===H||je===U)Ae++;else{if(!Oe&&(Oe=!0,De>=2&&je===bn)){Ee=!0;break}if(ke=!1,je===bn){var Me=e.charCodeAt(Ae+1)|32;if((Me===jn||Me===Mn||Me===An)&&(li.lastIndex=Ae,li.test(e))){Te=!0;break}}Ae++}}if(we&&!Ee&&!Te){var Ne=Li(e,xe);se=Ne,j=Q(e,Ne),P=e.slice(a,se),ce=e.slice(a,se),F=Se-a,fe=xe-a,pe=!0}}}}var Pe=M.b.indexOf(`
`)!==-1||M.g.indexOf(`
`)!==-1,Fe=!1;F!==-1&&(Fe=P.slice(fe).trim().length===0);var Ie=!1,Le=se,Re=j;if(F!==-1){var ze=a+fe,Be=Li(e,ze-1);if(ze<Be){for(var Ve=ze;Ve<Be&&(e.charCodeAt(Ve)===H||e.charCodeAt(Ve)===U);)Ve++;if(Ve<Be&&e.charCodeAt(Ve)===bn){var He=wi(e,Ve);He&&!He.f&&(Ie=!0,Le=ze,Re=ze,Fe=!0)}}if(!Ie){var Ue=Q(e,Be);if(Ue<se){for(var We=Ue;We<se&&(e.charCodeAt(We)===H||e.charCodeAt(We)===U);)We++;We<se&&e.charCodeAt(We)===bn&&wi(e,We)&&(Ie=!0,Le=Be,Re=Ue,Fe=!0)}}!Ie&&n.inHTML&&(Ie=!0,Le=Be,Re=Q(e,Be),Fe=e.slice(ze,Be).trim().length===0)}var Ge=[],Ke=``;if(F!==-1){Ke=P.slice(M.end-a,F);var qe=Ke.trim();if(qe){var{inline:Je,inHTML:Ye,d:Xe}=n;if(n.inHTML=!0,n.d=de+1,le===`p`)n.inline=!0,Ge=ya(qe,!1,n,r);else{var Ze=Ke.indexOf(`

`)!==-1,Qe=ui.test(qe),$e=di.test(qe),et=Ze||Qe||n.inHTML&&$e;Ke.length>=2&&Ke.charCodeAt(0)===W&&Ke.charCodeAt(Ke.length-1)===W&&!Ze&&!Qe&&!$e?Ge=[{type:Z.text,text:qe}]:et||$e?(n.inline=!1,Ge=io(Ke,n,r)):(n.inline=!0,Ge=ya(qe,!1,n,r))}n.inline=Je,n.inHTML=Ye,n.d=Xe}}var B=!1;if(c===6&&F!==-1&&!n.inHTML&&!Pe){var tt=/<[a-zA-Z][^>]*>/.test(Ke),nt=Ke.indexOf(`

`)!==-1||ui.test(Ke);tt&&!nt&&(B=!0)}if(!pe&&(n.inHTML||c===7||Pe||!Fe||B)){var V,rt,it=!1;if(F!==-1&&Ie){var at=!1;if(n.inHTML&&fe<P.length){for(var ot=fe;ot<P.length&&P.charCodeAt(ot)!==W;)ot++;var st=P.slice(fe,ot).trim();at=st.length>1&&st.charCodeAt(0)===bn&&st.charCodeAt(1)!==zn}rt=at?P.slice(M.end-a):Ke,it=!0}else(c===7||n.inHTML)&&F!==-1?(rt=P.slice(M.end-a),rt.charCodeAt(0)===W&&(rt=rt.slice(1))):Ie?V=e.slice(a,Le):Pe?V=ce:(rt=P.slice(M.end-a),rt.charCodeAt(0)===W&&(rt=rt.slice(1)));var ct=V!==void 0,lt=Ti(V===void 0?rt||``:V),ut={type:Z.htmlBlock,tag:N,attrs:sa(M.attrs,N,r),b:M.g+M.b,children:Ge,e:ct?void 0:lt,j:ct?lt:void 0,text:lt,c:!0,a:!1};return it&&(ut.x=!0),{node:ut,end:Re}}var dt=Ti(Ke);return{node:{type:Z.htmlBlock,tag:N,attrs:sa(M.attrs,N,r),b:M.g+M.b,children:Ge,e:pe?void 0:dt,text:dt,c:!1,a:!1},end:Re}}var ft=ce.match(/^<(\/?)([a-zA-Z][a-zA-Z0-9-]*)/),pt=ft?ft[2]:`div`,mt=ft?ft[1]===`/`:!1,ht,gt,_t,vt=``;if(mt){var yt=ce.indexOf(`>`);yt===-1?ht=ce:(ht=ce.slice(0,yt+1),vt=ce.slice(yt+1),vt&&(gt=Ti(vt)))}else _t=Ti(ce);return{node:{type:Z.htmlBlock,tag:pt,attrs:{},children:[],e:gt,h:ht,j:_t,text:mt?vt:ce,c:!0,a:mt},end:j}}var bt=wi(e,a);if(!bt)return null;var xt=bt.tag,St=xt.toLowerCase(),Ct=xt.charCodeAt(0),wt=Ct>=Y&&Ct<=X;if(!(wt||oa.has(St)||si.has(St)||St.includes(`-`)))return null;if(bt.f)return{node:{type:Z.htmlSelfClosing,tag:xt,attrs:{},h:e.slice(a,bt.end),a:!0},end:bt.end};var Tt=da(e,bt.end,xt),Et=[];if(Tt!==-1){var Dt=ua,Ot=e.slice(bt.end,Dt),kt=Ot.trim();if(kt){var At=Ot.indexOf(`

`)!==-1,jt=ui.test(kt),Mt=di.test(kt),Nt=n.inline,Pt=n.inHTML,Ft=n.d;n.inHTML=!0,n.d=(n.d||0)+1,At||jt||Mt?(n.inline=!1,Et=io(Ot,n,r)):(n.inline=!0,Et=ya(kt,!1,n,r)),n.inline=Nt,n.inHTML=Pt,n.d=Ft}var It=Li(e,Tt),Lt=e.slice(Tt,It).trim()?Tt:Q(e,Tt),Rt=wt?e.slice(a,Tt):e.slice(a,Lt);return{node:{type:Z.htmlBlock,tag:xt,attrs:sa(bt.attrs,xt,r),b:bt.g+bt.b,children:Et,j:Ti(Rt),text:wt?Ot:Rt,c:!0,a:!1},end:Lt}}var zt=zi(e,bt.end),Bt=zt<e.length?Q(e,zt):zt,Vt=e.slice(bt.end,zt);if(Vt.trim()){var{inline:Ht,inHTML:Ut,d:Wt}=n;n.inline=!1,n.inHTML=!0,n.d=(n.d||0)+1,Et=io(Vt,n,r),n.inline=Ht,n.inHTML=Ut,n.d=Wt}var Gt=e.slice(bt.end,zt);return{node:{type:Z.htmlBlock,tag:xt,attrs:sa(bt.attrs,xt,r),b:bt.g+bt.b,children:Et,e:Ti(Gt),text:Vt,c:!0,a:!1},end:Bt}}function pa(e,t){if(e.charCodeAt(t)!==bn)return 0;var n=t+1,r=e.length;if(e.charCodeAt(n)===Cn&&e.charCodeAt(n+1)===K&&e.charCodeAt(n+2)===K)return 2;if(e.charCodeAt(n)===Ln)return 3;if(e.charCodeAt(n)===Cn){var i=e.charCodeAt(n+1);if(i>=Y&&i<=X)return 4;if(e.slice(n+1,n+8)===`[CDATA[`)return 5}for(var a=e.charCodeAt(n)===zn,o=a?n+1:n,s=o;s<r;){var c=e.charCodeAt(s);if(c>=Y&&c<=X||c>=tr&&c<=nr||c>=q&&c<=J||c===K)s++;else break}if(s===o)return 0;var l=e.slice(o,s);if(si.has(l.toLowerCase())){if(a)return 0;var u=e.charCodeAt(s);return+(u===H||u===U||u===G||u===W||s>=r)}if(oa.has(l.toLowerCase())){if(a){for(var d=s;d<r&&(e.charCodeAt(d)===H||e.charCodeAt(d)===U);)d++;return d<r&&e.charCodeAt(d)===G?6:0}var f=s<r?e.charCodeAt(s):-1;return f===H||f===U||f===G||f===W||f===zn||f===-1?6:0}if(a){for(var p=s;p<r&&(e.charCodeAt(p)===H||e.charCodeAt(p)===U);)p++;if(p<r&&e.charCodeAt(p)===G){var m=Li(e,t);if(e.slice(p+1,m).trim()===``)return 7}}else{var h=Li(e,t),g=wi(e,t);if(g&&g.end<=h&&e.slice(g.end,h).trim()===``)return 7}return 0}function ma(e,t,n){for(var r=0,i=e.length;r<i&&(e.charCodeAt(r)===H||e.charCodeAt(r)===U);)r++;for(;i>r&&(e.charCodeAt(i-1)===H||e.charCodeAt(i-1)===U);)i--;r<i&&e.charCodeAt(r)===Un&&r++,i>r&&e.charCodeAt(i-1)===Un&&(i-2<r||e.charCodeAt(i-2)!==_n)&&i--;for(var a=[],o=r,s=!1,c=[],l=r;l<i;){var u=e.charCodeAt(l);if(u===_n&&l+1<i){e.charCodeAt(l+1)===Un?(s||(s=!0,c=[]),c.push(e.slice(o,l)),c.push(`|`),l+=2,o=l):l+=2;continue}if(u===un){for(var d=0;l<i&&e.charCodeAt(l)===un;)d++,l++;for(var f=!1;l<i&&!f;){for(var p=0;l<i&&e.charCodeAt(l)===un;)p++,l++;p===d?f=!0:p===0&&l++}continue}if(u===Un){var m=s?(c.push(e.slice(o,l)),c.join(``)):e.slice(o,l);a.push(m.trim()),l++,o=l,s=!1,c=[];continue}l++}var h=s?(c.push(e.slice(o,i)),c.join(``)):e.slice(o,i);return a.push(h.trim()),a.map(e=>{var r=e.indexOf(`\\|`)===-1?e:e.replace(/\\\|/g,`|`);return r?ya(r,!1,t,n):[]})}function ha(e,t,n,r){let i=Li(e,t);var a=e.indexOf(`|`,t);if(a<0||a>=i)return null;let o=Q(e,i);if(o>=e.length)return null;let s=Li(e,o);if(!gi(e,o,s))return null;let c=e.slice(t,i),l=e.slice(o,s);for(var u=[],d=0,f=l.length;d<f&&(l.charCodeAt(d)===H||l.charCodeAt(d)===U);)d++;for(d<f&&l.charCodeAt(d)===Un&&d++;d<f;){for(;d<f&&(l.charCodeAt(d)===H||l.charCodeAt(d)===U);)d++;if(d>=f||l.charCodeAt(d)===Un)break;var p=l.charCodeAt(d)===Tn;for(p&&d++;d<f&&l.charCodeAt(d)===K;)d++;var m=d<f&&l.charCodeAt(d)===Tn;for(m&&d++,u.push(p&&m?`center`:m?`right`:p?`left`:null);d<f&&(l.charCodeAt(d)===H||l.charCodeAt(d)===U);)d++;d<f&&l.charCodeAt(d)===Un&&d++}let h=ma(c,n,r);if(u.length!==h.length)return null;let g=[],_=Q(e,s);for(;_<e.length;){let t=Li(e,_),i=e.slice(_,t);if(Ui(e,_,t))break;if(Hi(e,_,t),Vi<4){var v=e.charCodeAt(_+$);if(v===G||v===mn||(v===K||v===vn||v===yn)&&qi(e,_))break;if(v===un||v===dn){for(var y=_+$,b=0;y<t&&e.charCodeAt(y)===v;)b++,y++;if(b>=3)break}}g.push(ma(i,n,r)),_=Q(e,t)}if(r.optimizeForStreaming&&g.length===0)return null;for(var x=h.length,S=0;S<g.length;S++)if(g[S].length<x)for(;g[S].length<x;)g[S].push([]);else g[S].length>x&&(g[S].length=x);return{node:{type:Z.table,header:h,cells:g,align:u},end:_}}function ga(e,t,n){if(Hi(e,t,Li(e,t)),Vi>3)return null;var r=t+$;if(e.charCodeAt(r)!==fn)return null;if(r+1<e.length&&e.charCodeAt(r+1)===pn)return _a(e,r,n)||null;n.refs||={};var i=Di(e,r,n.refs);return i===null?null:{node:{type:Z.refCollection},end:i}}function _a(e,t,n){var r=e.length;if(e.charCodeAt(t)!==fn||t+1>=r||e.charCodeAt(t+1)!==pn)return null;for(var i=t+2,a=i;i<r&&e.charCodeAt(i)!==Sn;){if(e.charCodeAt(i)===W)return null;i++}if(i>=r)return null;var o=`^${e.slice(a,i)}`.toLowerCase();if(i++,i>=r||e.charCodeAt(i)!==Tn)return null;for(i++;i<r&&(e.charCodeAt(i)===H||e.charCodeAt(i)===U);)i++;if(i<r&&e.charCodeAt(i)===W)for(i++;i<r&&(e.charCodeAt(i)===H||e.charCodeAt(i)===U);)i++;var s=e.indexOf(`
`,i);s<0&&(s=r);for(var c=e.slice(i,s).trim(),l=s<r?s+1:r;l<r;){var u=Li(e,l);if(Hi(e,l,u),Vi>=2&&!Ui(e,l,u))c+=`
${e.slice(l,u)}`,l=Q(e,u);else if(Ui(e,l,u)){var d=Q(e,u);if(d<r&&(Hi(e,d,Li(e,d)),Vi>=2)){c+=`
`,l=Q(e,u);continue}break}else break}var f=n.refs;return f&&!f[o]&&(f[o]={target:c,title:void 0}),{node:{type:Z.footnote},end:l}}function va(e,t,n,r){let i=t,a=0,o=0,s=-1;for(;i<e.length;){let t=s>=0?s:Li(e,i);if(s=-1,Ui(e,i,t))break;if(Hi(e,i,t),Vi<4&&o>0&&!n.l){let n=e.charCodeAt(i+$);if(n===gn||n===K){let r=i+$;for(;r<t&&e.charCodeAt(r)===n;)r++;for(;r<t&&(e.charCodeAt(r)===H||e.charCodeAt(r)===U);)r++;if(r>=t){a=n===gn?1:2,i=Q(e,t);break}}}o=t;let x=Q(e,t);if(x<e.length){if(e.charCodeAt(x)===er){var c=Li(e,x);i=Q(e,c),o=c;continue}let t=Li(e,x);if(s=t,Hi(e,x,t),Vi<4){let a=e.charCodeAt(x+$);if(a===G){i=x;break}if(a===mn){for(var l=x+$,u=0;l<t&&e.charCodeAt(l)===mn&&u<=6;)u++,l++;if(u>=1&&u<=6&&(l>=t||e.charCodeAt(l)===H||e.charCodeAt(l)===U)){i=x;break}}if(a===un||a===dn){for(var d=x+$,f=0;d<t&&e.charCodeAt(d)===a;)f++,d++;if(f>=3){i=x;break}}if(a===bn){var p=x+$+1,m=p<t?e.charCodeAt(p):0,h=m===Cn||m===Ln;if(!h&&m===zn){for(var g=p+1,_=g;_<t&&(e.charCodeAt(_)>=Y&&e.charCodeAt(_)<=X||e.charCodeAt(_)>=tr&&e.charCodeAt(_)<=nr||e.charCodeAt(_)>=q&&e.charCodeAt(_)<=J||e.charCodeAt(_)===K);)_++;_>g&&(h=oa.has(e.slice(g,_).toLowerCase()))}else if(!h){for(var v=p;v<t&&(e.charCodeAt(v)>=Y&&e.charCodeAt(v)<=X||e.charCodeAt(v)>=tr&&e.charCodeAt(v)<=nr||e.charCodeAt(v)>=q&&e.charCodeAt(v)<=J||e.charCodeAt(v)===K);)v++;if(v>p){var y=e.slice(p,v).toLowerCase();h=oa.has(y)||si.has(y)}}if(h&&fa(e,x,n,r)){i=x;break}}if(a===K||a===vn||a===Hn){let n=x+$+1;if(n<t&&(e.charCodeAt(n)===H||e.charCodeAt(n)===U)&&Ri(e,n,t)<t&&!qi(e,x)){i=x;break}}if(a>=q&&a<=J){let n=x+$;for(;n<t&&e.charCodeAt(n)>=q&&e.charCodeAt(n)<=J;)n++;if(n<t&&(e.charCodeAt(n)===Rn||e.charCodeAt(n)===qn)&&n-(x+$)===1&&e.charCodeAt(x+$)===49){var b=n+1;if(b<t&&(e.charCodeAt(b)===H||e.charCodeAt(b)===U)&&Ri(e,b,t)<t){i=x;break}}}if(a===Un){let n=Q(e,t);if(n<e.length&&gi(e,n,Li(e,n))){i=x;break}}if((a===K||a===vn||a===yn)&&qi(e,x)){if(a!==K){i=x;break}let n=0,r=x+$;for(;r<t&&e.charCodeAt(r)===K;)n++,r++;for(;r<t&&(e.charCodeAt(r)===H||e.charCodeAt(r)===U);)r++;if(r<t){i=x;break}}}}i=Q(e,t)}for(var x=a?o:i;x>t&&(e.charCodeAt(x-1)===W||e.charCodeAt(x-1)===ln||e.charCodeAt(x-1)===H||e.charCodeAt(x-1)===U);)x--;for(var S=t;S<x&&(e.charCodeAt(S)===H||e.charCodeAt(S)===U);)S++;if(S>=x)return null;for(var C=!1,w=S;w<x;w++)if(e.charCodeAt(w)===er){C=!0;break}var T=C?e.slice(S,x).replace(/\u001E/g,``):e.slice(S,x);if(!T)return null;let E=ya(T,!0,n,r);return a?{node:{type:Z.heading,level:a,children:E,id:``},end:i}:{node:{type:Z.paragraph,children:E},end:i}}function ya(e,t,n,r){var i=n.t;if(!i){var a=n.k;n.k=t;var o=no(e,0,e.length,n,r);return n.k=a,o}var s=[];return i.push({dest:s,text:e,breaks:t,inline:n.inline,inAnchor:n.inAnchor,inHTML:n.inHTML,htmlDepth:n.d,inList:n.inList,inBlockQuote:n.inBlockQuote,noSetext:n.l,depth:n.o}),s}function ba(e,t,n){if(e.charCodeAt(t)!==un)return null;let r=Bi(e,t,n,96),i=t+r;for(;i<n;){let a=e.indexOf("`",i);if(a<0||a>=n)return null;let o=Bi(e,a,n,96);if(o===r){let n=e.slice(t+r,a);return n.indexOf(`
`)!==-1&&(n=n.replace(/\n/g,` `)),n.length>0&&n[0]===` `&&n.at(-1)===` `&&n.trim().length>0&&(n=n.slice(1,-1)),{node:{type:Z.codeInline,text:n},end:a+o}}i=a+o}return null}function xa(e,t,n){if(e.charCodeAt(t)!==un)return t;let r=Bi(e,t,n,96),i=t+r;for(;i<n;){let a=e.indexOf("`",i);if(a<0||a>=n)return t;let o=Bi(e,a,n,96);if(o===r)return a+o;i=a+o}return t}function Sa(e,t,n){if(e.charCodeAt(t)!==bn)return t;if(t+1<n&&e.charCodeAt(t+1)===zn){let r=t+2;for(;r<n&&e.charCodeAt(r)!==G;)r++;return r<n?r+1:t}if(t+3<n&&e.charCodeAt(t+1)===Cn&&e.charCodeAt(t+2)===K&&e.charCodeAt(t+3)===K){let n=e.indexOf(`-->`,t+4);return n>=0?n+3:t}let r=t+1,i=r;for(;r<n;){let t=e.charCodeAt(r);if(t>=Y&&t<=X||t>=tr&&t<=nr||t>=q&&t<=J||t===K)r++;else break}if(r===i)return t;let a=e.slice(i,r).toLowerCase(),o=!1;for(;r<n;){let i=e.charCodeAt(r);if(i===G){r++;break}if(i===zn&&r+1<n&&e.charCodeAt(r+1)===G){r+=2,o=!0;break}if(i===Vn||i===Bn){var s=i;for(r++;r<n&&e.charCodeAt(r)!==s;)r++;r<n&&r++;continue}if(i===W)return t;r++}if(o||br(a))return r;let c=1;for(;r<n&&c>0;)if(e.charCodeAt(r)===bn){if(r+1<n&&e.charCodeAt(r+1)===zn){let t=r+2,i=t;for(;i<n&&(e.charCodeAt(i)>=Y&&e.charCodeAt(i)<=X||e.charCodeAt(i)>=tr&&e.charCodeAt(i)<=nr);)i++;if(e.slice(t,i).toLowerCase()===a){for(;i<n&&e.charCodeAt(i)!==G;)i++;if(i<n&&i++,c--,c===0)return i}r=i}else{let t=r+1,i=t;for(;i<n&&(e.charCodeAt(i)>=Y&&e.charCodeAt(i)<=X||e.charCodeAt(i)>=tr&&e.charCodeAt(i)<=nr);)i++;e.slice(t,i).toLowerCase()===a&&c++,r++}}else r++;return r}function Ca(e,t,n,r,i){if(e.charCodeAt(t)!==dn||t+1>=n||e.charCodeAt(t+1)!==dn)return null;let a=t+2;for(;a+1<n;){let o=e.charCodeAt(a);if(o===un){let t=xa(e,a,n);if(t>a){a=t;continue}}if(o===dn&&e.charCodeAt(a+1)===dn){let n=e.slice(t+2,a),o=no(n,0,n.length,r,i);return{node:{type:Z.textFormatted,tag:`del`,children:o},end:a+2}}o===_n&&a+1<n&&a++,a++}return null}function wa(e,t,n,r,i){if(e.charCodeAt(t)!==gn||t+1>=n||e.charCodeAt(t+1)!==gn)return null;let a=t+2;for(;a+1<n;){let o=e.charCodeAt(a);if(o===un){let t=xa(e,a,n);if(t>a){a=t;continue}}if(o===gn&&e.charCodeAt(a+1)===gn&&a>t+2){let n=e.slice(t+2,a),o=no(n,0,n.length,r,i);return{node:{type:Z.textFormatted,tag:`mark`,children:o},end:a+2}}o===_n&&a+1<n&&a++,a++}return null}function Ta(e,t,n){return e<rr?!!(Mi(e)&Cr):kr.test(t[n])}function Ea(e,t,n){return e<rr?!!(Mi(e)&xr):Ar.test(t[n])}function Da(e,t,n){var r=e.charCodeAt(t);if(r!==vn&&r!==yn)return null;var i=Bi(e,t,n,r);if(i===0)return null;var a=t>0?e.charCodeAt(t-1):32,o=t+i<n?e.charCodeAt(t+i):32,s=Ea(a,e,t-1),c=Ea(o,e,t+i),l=t>0&&Ta(a,e,t-1),u=t+i<n&&Ta(o,e,t+i),d=!c&&(!u||s||l),f=!s&&(!l||c||u),p,m;return r===vn?(p=d,m=f):(p=d&&(!f||l),m=f&&(!d||u)),{len:i,canOpen:p,canClose:m}}function Oa(e,t,n,r){if(t.length!==0){for(var i=e.length,a=Array(i),o=null,s=null,c=0;c<i;c++){var l={node:e[c],prev:s,next:null};s?s.next=l:o=l,a[c]=l,s=l}for(var u=Array(t.length),d=0;d<t.length;d++)u[d]=a[t[d].idx];for(var f=[],p=0;p<12;p++)f[p]=-1;for(var m=0;m<t.length;){var h=t[m];if(!(h.active&&h.canClose)){m++;continue}for(var g=(h.ch===vn?0:1)*6+h.len%3*2+ +!!h.canOpen,_=f[g]===void 0?-1:f[g],v=-1,y=m-1;y>_;y--){var b=t[y];if(!(!b.active||b.ch!==h.ch||!b.canOpen)&&!((h.canOpen||b.canClose)&&(b.len+h.len)%3==0&&b.len%3!=0)){v=y;break}}if(v<0){f[g]=m-1,!h.canOpen&&(h.active=!1),m++;continue}var x=t[v],S=x.len>=2&&h.len>=2,C=S?2:1;x.len-=C,h.len-=C;var w=u[v],T=u[m],E=w.node,D=T.node;E.text=E.text.slice(0,E.text.length-C),D.text=D.text.slice(C);for(var O=[],ee=w.next;ee&&ee!==T;)O.push(ee.node),ee=ee.next;var k={node:{type:Z.textFormatted,tag:S?`strong`:`em`,children:O},prev:w,next:T};w.next=k,T.prev=k;for(var te=v+1;te<m;te++)t[te].active=!1;if(x.len===0&&(x.active=!1,E.text===``)){var ne=w.prev;k.prev=ne,ne?ne.next=k:o=k}if(h.len===0){if(h.active=!1,D.text===``){var re=T.next;k.next=re,re&&(re.prev=k)}}else continue;m++}for(var ie=0,A=o;A;){var ae=A.node;if(ae.type===Z.text){var oe=ae;if(oe.text===``){A=A.next;continue}if(ie>0&&e[ie-1].type===Z.text){e[ie-1].text+=oe.text,A=A.next;continue}}e[ie++]=ae,A=A.next}e.length=ie}}function ka(e,t,n,r){return t(e,n,r)===null?null:e}var Aa=0,ja=0,Ma=0,Na=0,Pa=0,Fa=0,Ia=0,La=0;function Ra(){return Ia===2147483647&&(ja=0,Na=0,Fa=0,Ba=0,Ia=0),++Ia}var za=null,Ba=0,Va=[],Ha=256;function Ua(e,t,n,r,i){let a=e.charCodeAt(t)===Cn,o=a?t+1:t;if(e.charCodeAt(o)!==fn||Na===La&&o>=Ma)return null;var s=Ba===La?za:null,c=s===null?0:s[o];if(c<0)return null;var l=c;if(c===0){var u=e.indexOf(`]`,o+1);if(u<0||u>=n)return Ma=o,Na=La,null;l=o+1;var d=0;Va[d++]=o;for(var f=n-o>=Ha;l<n&&d>0;){var p=e.charCodeAt(l);if(p===_n&&l+1<n){l+=2;continue}if(p===un){var m=xa(e,l,n);if(m>l){l=m;continue}}if(p===bn){var h=Wa(e,l,n);if(h){l=h.end;continue}var g=Sa(e,l,n);if(g>l){l=g;continue}}if(p===fn)Va[d++]=l;else if(p===Sn){var _=Va[--d];s===null&&f&&l-o>=Ha&&(s=za=new Int32Array(n),Ba=La),s!==null&&(s[_]=l+1)}l++}if(d>0){if(s===null&&f&&l-o>=Ha&&(s=za=new Int32Array(n),Ba=La),s!==null)for(;d>0;)s[Va[--d]]=-1;return null}}var v=l-1,y=e.slice(o+1,v),b=l<n?e.charCodeAt(l):0,x=!1;if(b===Kn){var S=!0;for(l++;l<n&&(e.charCodeAt(l)===H||e.charCodeAt(l)===W);)l++;var C=``,w=l;if(l<n&&e.charCodeAt(l)===bn){for(l++,w=l;w<n&&e.charCodeAt(w)!==G;){if(e.charCodeAt(w)===_n&&w+1<n){w+=2;continue}if(e.charCodeAt(w)===W){S=!1;break}w++}S&&(w>=n||e.charCodeAt(w)!==G)&&(S=!1),S&&(C=e.slice(l,w),w++)}else if(S){var T=ja===La?Aa:-1;if(T>=0&&l>=T)S=!1;else{for(var E=0,D=!1;w<n;){var O=e.charCodeAt(w);if(O===_n&&w+1<n){w+=2;continue}if(O===Kn)E++;else if(O===qn){if(D=!0,E===0)break;E--}else if(O===H||O===W)break;w++}w>=n&&!D&&(T<0||l<T)&&(Aa=l,ja=La),C=e.slice(l,w)}}if(S){for(l=w;l<n&&(e.charCodeAt(l)===H||e.charCodeAt(l)===W);)l++;var ee;if(l<n){var k=e.charCodeAt(l);if(k===Vn||k===Bn||k===Kn){var te=k===Kn?41:k;l++;for(var ne=l;l<n&&e.charCodeAt(l)!==te;)e.charCodeAt(l)===_n&&l+1<n&&l++,l++;l>=n?S=!1:(ee=e.slice(ne,l),l++)}}if(S){for(;l<n&&(e.charCodeAt(l)===H||e.charCodeAt(l)===W);)l++;(l>=n||e.charCodeAt(l)!==qn)&&(S=!1)}}if(S){if(l++,C=dr(Ni(C)),ee!==void 0&&(ee=dr(Ni(ee))),a){var re=Ya(no(y,0,y.length,r,i));return{node:{type:Z.image,target:ka(C,i?.sanitizer||pr,`img`,`src`),alt:re,title:ee},end:l}}var ie=r.inAnchor;r.inAnchor=!0;var A=ie?[{type:Z.text,text:y}]:no(y,0,y.length,r,i);return r.inAnchor=ie,!r.inAnchor&&Ja(A)?null:{node:{type:Z.link,target:ka(C,i?.sanitizer||pr,`a`,`href`),title:ee,children:A},end:l}}l=v+1,x=!0}var ae=``,oe=l;if(!x&&b===fn){var se=l+1;oe=se;for(var ce=!1;oe<n&&e.charCodeAt(oe)!==Sn;){if(e.charCodeAt(oe)===_n&&oe+1<n){oe+=2;continue}if(e.charCodeAt(oe)===fn){ce=!0;break}oe++}if(ce||oe>=n)return null;var j=e.slice(se,oe);if(j.trim())ae=ji(j);else{if(Ai(y))return null;ae=ji(y)}oe+=1}else{if(Ai(y))return null;ae=ji(y)}var M=r.refs?.[ae];if(!M)return null;if(a)return{node:{type:Z.image,target:ka(M.target,i?.sanitizer||pr,`img`,`src`),alt:Ya(no(y,0,y.length,r,i)),title:M.title},end:oe};var N=r.inAnchor;r.inAnchor=!0;var A=N?[{type:Z.text,text:y}]:no(y,0,y.length,r,i);return r.inAnchor=N,!r.inAnchor&&Ja(A)?null:{node:{type:Z.link,target:ka(M.target,i?.sanitizer||pr,`a`,`href`),title:M.title,children:A},end:oe}}function Wa(e,t,n){if(e.charCodeAt(t)!==bn)return null;for(var r=t+1;r<n;){var i=e.charCodeAt(r);if(i===G)break;if(i===H||i===W||i===ln||i===bn)return null;r++}if(r>=n||e.charCodeAt(r)!==G)return null;var a=e.slice(t+1,r);return a.match(/^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^\x00-\x20]*)$/)?{node:{type:Z.link,target:a,title:void 0,children:[{type:Z.text,text:a}]},end:r+1}:a.indexOf(`@`)!==-1&&/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(a)?{node:{type:Z.link,target:`mailto:${a}`,title:void 0,children:[{type:Z.text,text:a}]},end:r+1}:null}function Ga(e,t,n,r){if(e.charCodeAt(t)!==fn||t+1>=n||e.charCodeAt(t+1)!==pn||Fa===La&&t>=Pa)return null;let i=t+2;for(;i<n&&e.charCodeAt(i)!==Sn&&e.charCodeAt(i)!==W;)i++;if(i>=n)return Pa=t,Fa=La,null;if(e.charCodeAt(i)!==Sn)return null;let a=e.slice(t+2,i);return a?{node:{type:Z.footnoteReference,target:`#${_r(a)}`,text:a},end:i+1}:null}function Ka(e,t,n,r){if(r.disableBareUrls)return null;var i=``,a=!1,o=e.charCodeAt(t);if(o===On||o===72?t+8<=n&&e.charCodeAt(t+1)===An&&e.charCodeAt(t+2)===An&&e.charCodeAt(t+3)===jn&&(e.charCodeAt(t+4)===Mn&&e.charCodeAt(t+5)===Tn&&e.charCodeAt(t+6)===zn&&e.charCodeAt(t+7)===zn?i=`https://`:e.charCodeAt(t+4)===Tn&&e.charCodeAt(t+5)===zn&&e.charCodeAt(t+6)===zn&&(i=`http://`)):o===Dn||o===70?t+6<=n&&e.charCodeAt(t+1)===An&&e.charCodeAt(t+2)===jn&&e.charCodeAt(t+3)===Tn&&e.charCodeAt(t+4)===zn&&e.charCodeAt(t+5)===zn&&(i=`ftp://`):(o===kn||o===87)&&t+4<=n&&e.charCodeAt(t+1)===kn&&e.charCodeAt(t+2)===kn&&e.charCodeAt(t+3)===Rn&&(i=`www.`,a=!0),!i)return null;let s=t+i.length;for(;s<n;){let t=e.charCodeAt(s);if(t===H||t===W||t===U||t===ln||t===bn||t===G)break;s++}for(var c=0,l=0,u=t;u<s;u++){var d=e.charCodeAt(u);d===Kn?c++:d===qn&&l++}let f=s;for(;f>t+i.length;){let n=e.charCodeAt(f-1);if(n===Rn||n===Fn||n===Tn||n===Cn||n===Ln||n===qn||n===vn||n===yn||n===dn){if(n===qn){if(c>=l)break;l--}f--}else if(n===In){for(var p=f-2;p>t&&(e.charCodeAt(p)>=Y&&e.charCodeAt(p)<=X||e.charCodeAt(p)>=tr&&e.charCodeAt(p)<=nr||e.charCodeAt(p)>=q&&e.charCodeAt(p)<=J);)p--;p>=t&&e.charCodeAt(p)===wn?f=p:f--}else break}if(f<=t+i.length)return null;var m=t+(a?4:i.length),h=e.indexOf(`/`,m);if((h<0||h>f)&&(h=f),a&&e.indexOf(`.`,m)===-1)return null;for(var g=-1,_=-1,v=h-1;v>=m;v--)if(e.charCodeAt(v)===Rn){if(g<0)g=v;else{_=v;break}}for(var v=_>=0?_+1:m;v<h;v++)if(e.charCodeAt(v)===yn)return null;var y=e.slice(t,f),b=a?`http://${y}`:y;return{node:{type:Z.link,target:b,title:void 0,children:[{type:Z.text,text:y}]},end:f}}function qa(e,t,n,r){if(r.disableBareUrls)return null;for(var i=t,a=i;i<n;){var o=e.charCodeAt(i);if(o>=Y&&o<=X||o>=tr&&o<=nr||o>=q&&o<=J||o===Rn||o===Cn||o===mn||o===36||o===hn||o===wn||o===Bn||o===vn||o===Hn||o===zn||o===gn||o===Ln||o===pn||o===yn||o===un||o===Wn||o===Un||o===Gn||o===dn||o===K)i++;else break}if(i===a||i>=n||e.charCodeAt(i)!==xn)return null;i++;for(var s=i,c=-1,l=i;i<n;){var o=e.charCodeAt(i);if(o>=Y&&o<=X||o>=tr&&o<=nr||o>=q&&o<=J)i++;else if((o===K||o===yn)&&i>s)i++;else if(o===Rn){if(i===s)break;var u=e.charCodeAt(i-1);if(u===K||u===yn||i-l>63)break;if(i+1<n){var d=e.charCodeAt(i+1);if(d>=Y&&d<=X||d>=tr&&d<=nr||d>=q&&d<=J)c=i,l=i+1,i++;else break}else break}else break}if(i-l>63||c<0)return null;var f=e.charCodeAt(i-1);if(!(f>=Y&&f<=X||f>=tr&&f<=nr||f>=q&&f<=J)||i<=c+1)return null;for(var p=-1,m=c-1;m>=s;m--)if(e.charCodeAt(m)===Rn){p=m;break}for(var m=p>=0?p+1:s;m<i;m++)if(e.charCodeAt(m)===yn)return null;var h=e.slice(t,i);return{node:{type:Z.link,target:`mailto:${h}`,title:void 0,children:[{type:Z.text,text:h}]},end:i}}function Ja(e){for(var t=0;t<e.length;t++)if(e[t].type===Z.link||`children`in e[t]&&Array.isArray(e[t].children)&&Ja(e[t].children))return!0;return!1}function Ya(e,t){for(var n=``,r=0;r<e.length;r++){var i=e[r];i.type===Z.text?n+=i.text:i.type===Z.breakLine?n+=` `:i.type===Z.codeInline||i.type===Z.footnoteReference?n+=i.text:`children`in i&&Array.isArray(i.children)?n+=Ya(i.children,t):!t&&i.type===Z.image&&(n+=i.alt||``)}return n}function Xa(e,t,n){for(var r=0;r<e.length;r++){var i=e[r];if(i.type===Z.heading){var a=i;a.id=Wi(n(Ya(a.children,!0)),t)}if(`children`in i){var o=i.children;Array.isArray(o)&&Xa(o,t,n)}if((i.type===Z.orderedList||i.type===Z.unorderedList)&&Array.isArray(i.items))for(var s=i.items,c=0;c<s.length;c++)Xa(s[c],t,n)}}function Za(e){return{type:Z.text,text:e}}function Qa(e,t,n){var r=t+1;if(r>=n)return-1;if(e.charCodeAt(r)===mn){r++;var i=r<n&&(e.charCodeAt(r)===Qn||e.charCodeAt(r)===$n);i&&r++;for(var a=r,o=i?6:7;r<n&&r-a<=o;){var s=e.charCodeAt(r);if(!(s>=q&&s<=J||i&&(s>=Y&&s<=En||s>=tr&&s<=Dn)))break;r++}return r===a||r-a>o?-1:r<n&&e.charCodeAt(r)===In?r+1:-1}for(var c=r;r<n&&r-c<48;){var l=e.charCodeAt(r);if(l>=Y&&l<=X||l>=tr&&l<=nr||l>=q&&l<=J){r++;continue}break}return r===c?-1:r<n&&e.charCodeAt(r)===In?r+1:-1}function $a(e,t,n,r,i){if(e.charCodeAt(t)!==bn)return null;var a=t+1;if(a>=n)return null;var o=e.charCodeAt(a);if(o===Cn&&a+1<n&&e.charCodeAt(a+1)===K&&a+2<n&&e.charCodeAt(a+2)===K){var s=a+3;if(s<n&&e.charCodeAt(s)===G)return{node:{type:Z.htmlComment,text:``,s:!0},end:s+1};if(s+1<n&&e.charCodeAt(s)===K&&e.charCodeAt(s+1)===G)return{node:{type:Z.htmlComment,text:`-`,s:!0},end:s+2};var c=e.indexOf(`-->`,s);return c!==-1&&c<=n-3?{node:{type:Z.htmlComment,text:e.slice(t+4,c),s:!1},end:c+3}:null}if(o===Ln){var l=e.indexOf(`?>`,a+1);return l!==-1&&l<n?{node:{type:Z.htmlSelfClosing,tag:`?`,attrs:{},m:e.slice(t,l+2),a:!1},end:l+2}:null}if(o===Cn&&a+1<n){var u=e.charCodeAt(a+1);if(u===fn&&e.slice(a+1,a+8)===`[CDATA[`){var d=e.indexOf(`]]>`,a+8);return d!==-1&&d<n?{node:{type:Z.htmlSelfClosing,tag:`![CDATA[`,attrs:{},m:e.slice(t,d+3),a:!1},end:d+3}:null}if(u>=Y&&u<=X){var f=e.indexOf(`>`,a+2);return f!==-1&&f<n?{node:{type:Z.htmlSelfClosing,tag:`!${e.slice(a+1,f)}`,attrs:{},m:e.slice(t,f+1),a:!1},end:f+1}:null}}if(o===zn){var p=a+1;if(p>=n)return null;var m=e.charCodeAt(p);if(!(m>=Y&&m<=X||m>=tr&&m<=nr))return null;for(p++;p<n;){var h=e.charCodeAt(p);if(h>=Y&&h<=X||h>=tr&&h<=nr||h>=q&&h<=J||h===K)p++;else break}for(;p<n&&(e.charCodeAt(p)===H||e.charCodeAt(p)===U||e.charCodeAt(p)===W);)p++;if(p<n&&e.charCodeAt(p)===G){var g=e.slice(a+1,p).trim();return{node:{type:Z.htmlSelfClosing,tag:g,attrs:{},h:e.slice(t,p+1),a:!0},end:p+1}}return null}if(!(o>=Y&&o<=X||o>=tr&&o<=nr))return null;var _=wi(e,t);if(!_)return null;var v=_.tag,y=v.toLowerCase();if(_.n||br(v))return{node:{type:Z.htmlSelfClosing,tag:v,attrs:sa(_.attrs,v,i),m:_.q?Si(_):e.slice(t,_.end),a:!1},end:_.end};var b=si.has(y),x=da(e.slice(0,n),_.end,v);if(x===-1)return{node:{type:Z.htmlSelfClosing,tag:v,attrs:sa(_.attrs,v,i),m:_.q?Si(_):e.slice(t,_.end),a:!1},end:_.end};var S=la(e,`</${y}`,x),C=e.slice(_.end,S);if(b){var w=Ti(C);return{node:{type:Z.htmlBlock,tag:v,attrs:sa(_.attrs,v,i),b:_.g+_.b,children:[],e:w||void 0,h:e.slice(S,x),text:w,c:!0,a:!1},end:x}}var T=[],E=C.trim();if(E){var{inAnchor:D,inline:O,k:ee}=r;y===`a`&&(r.inAnchor=!0),r.k=!1,E.indexOf(`

`)!==-1||/^#{1,6}\s/.test(E)?(r.inline=!1,T=io(E,r,i)):T=no(E,0,E.length,r,i),r.inAnchor=D,r.inline=O,r.k=ee}return{node:{type:Z.htmlBlock,tag:v,attrs:sa(_.attrs,v,i),b:_.b,children:T,text:Ti(C),c:!1,a:!1},end:x}}var eo=200,to=0;function no(e,t,n,r,i){if(to++,to>eo)return to--,[{type:Z.text,text:e.slice(t,n)}];var a=La;La=Ra();let o=r;if(i.optimizeForStreaming){let r=function(e,t){for(var n=1,r=t+1;r<e.length;r++){var i=e.charCodeAt(r);if(i===fn)n++;else if(i===Sn&&(n--,n===0))return r}return-1},i=e.slice(t,n),a=i;for(var s=0,c=0,l=0,u=0,d=0,f=-1,p=-1,m=-1,h=-1,g=-1,_=0;_<i.length;_++){var v=i.charCodeAt(_);v===vn?_+1<i.length&&i.charCodeAt(_+1)===vn?(s++,f=_,_++):(c++,p=_):v===yn?_+1<i.length&&i.charCodeAt(_+1)===yn?(l++,m=_,_++):(u++,h=_):v===dn&&_+1<i.length&&i.charCodeAt(_+1)===dn&&(d++,g=_,_++)}var y=[];d%2==1&&g>=0&&y.push([g,2]),l%2==1&&m>=0&&y.push([m,2]),u%2==1&&h>=0&&y.push([h,1]),s%2==1&&f>=0&&y.push([f,2]),c%2==1&&p>=0&&y.push([p,1]),y.sort((e,t)=>t[0]-e[0]);for(var b=0;b<y.length;b++){var x=y[b][0],S=y[b][1];i=i.slice(0,x)+i.slice(x+S)}let o=0,j=-1;for(let e=0;e<i.length;e++)i.charCodeAt(e)===un&&(o++,j=e);if(o%2==1&&j!==-1){let e=!1,t=-1,n=0;for(;n<i.length;)i.charCodeAt(n)===un&&(e?(e=!1,t=-1):(t=n,e=!0)),n++;e&&t!==-1&&(i=i.slice(0,t))}for(var C=!0;C;){C=!1;for(var w=-1,T=-1,E=-1,D=!1,O=0;O<i.length;O++)if(i.charCodeAt(O)===fn&&(O===0||i.charCodeAt(O-1)!==_n)){var ee=O>0&&i.charCodeAt(O-1)===Cn,k=ee?O-1:O,te=r(i,O);if(te===-1)w=k,D=ee,T=O+1,E=i.length;else{var ne=te+1;if(ne>=i.length)w=k,D=ee,T=O+1,E=te;else if(i.charCodeAt(ne)===Kn){var re=i.indexOf(`)`,ne+1);re===-1?(w=k,D=ee,T=O+1,E=te,O=i.length):O=re}else if(i.charCodeAt(ne)===fn){var ie=i.indexOf(`]`,ne+1);ie===-1?(w=k,D=ee,T=O+1,E=te,O=i.length):O=ie}else O=te}}if(w>=0){var A=D?``:i.slice(T,E);i=i.slice(0,w)+A,C=!0}}let M=i.match(/<([A-Z][A-Za-z0-9]*)(?:\s[^>]*)?>([^<]*)$/);if(M&&M.index!==void 0){var ae=M[0].length-M[2].length;if(!(ae>=2&&M[0].charCodeAt(ae-2)===zn)){for(var oe=!1,se=0,ce=0;ce<M.index;ce++)i.charCodeAt(ce)===un&&se++;if(oe=se%2==1,!oe){let e=M[1];ca(i,`</${e}`,0)===-1&&(i=i.slice(0,M.index)+M[2])}}}i!==a&&(e=e.slice(0,t)+i,n=t+i.length)}let j=[];var M=[];let N=t;var le=``,ue=i.disableAutoLink||i.disableBareUrls||o.inAnchor?-1:e.indexOf(`@`,t);for(ue>=n&&(ue=-1);t<n;){let r=e.charCodeAt(t),a=null;if(r===un){if(a=ba(e,t,n),!a){var de=Bi(e,t,n,un);t+=de-1}}else if(r===vn||r===yn){var P=Da(e,t,n);if(P){if(P.canOpen||P.canClose){(le||t>N)&&(j.push(Za(le+e.slice(N,t))),le=``);var F=Za(e.slice(t,t+P.len));M.push({idx:j.length,ch:r,len:P.len,canOpen:P.canOpen,canClose:P.canClose,active:!0}),j.push(F),t+=P.len,N=t;continue}t+=P.len-1}}else if(r===dn)a=Ca(e,t,n,o,i);else if(r===gn)a=wa(e,t,n,o,i);else if(r===fn)t+1<n&&e.charCodeAt(t+1)===pn&&(a=Ga(e,t,n,o)),a||=Ua(e,t,n,o,i);else if(r===Cn&&t+1<n&&e.charCodeAt(t+1)===fn)a=Ua(e,t,n,o,i);else if(r===bn)a=Wa(e,t,n),!(a||i.disableParsingRawHTML||i.ignoreHTMLBlocks)&&(a=$a(e,t,n,o,i));else if(r===wn){var fe=Qa(e,t,n);if(fe!==-1){var pe=e.slice(t,fe),me=dr(pe);if(me!==pe){le=le+e.slice(N,t)+me,t=fe,N=fe;continue}}}else if((r===On||r===kn||r===Dn)&&!o.inAnchor&&!i.disableAutoLink&&(t===0||e.charCodeAt(t-1)!==bn)){var I=t+1<n?e.charCodeAt(t+1):0;(r===On&&I===An||r===Dn&&I===An||r===kn&&I===kn)&&(a=Ka(e,t,n,i))}if(!a&&ue>=0&&ue-t<=64&&!o.inAnchor&&!i.disableAutoLink&&!i.disableBareUrls&&(r>=Y&&r<=X||r>=tr&&r<=nr||r>=q&&r<=J)&&(a=qa(e,t,n,i),!a&&t>=ue&&(ue=e.indexOf(`@`,t+1),ue>=n&&(ue=-1))),r===W&&o.k){var L=!1,he=0;if(t>N&&e.charCodeAt(t-1)===_n)L=!0,he=1;else{for(var ge=0,_e=t-1;_e>=N&&e.charCodeAt(_e)===H;)ge++,_e--;ge>=2&&(L=!0,he=ge)}if(L){for((le||t-he>N)&&(j.push(Za(le+e.slice(N,t-he))),le=``),j.push({type:Z.breakLine}),t++;t<n&&e.charCodeAt(t)===H;)t++;N=t;continue}var ve=t>N&&e.charCodeAt(t-1)===H,ye=t+1<n&&e.charCodeAt(t+1)===H;if(ve||ye){for(var R=t;R>N&&e.charCodeAt(R-1)===H;)R--;for(le+=`${e.slice(N,R)}
`,t++;t<n&&e.charCodeAt(t)===H;)t++;N=t;continue}}if(a)(le||t>N)&&(j.push(Za(le+e.slice(N,t))),le=``),j.push(a.node),t=a.end,N=t;else{if(r===_n&&t+1<n&&Mi(e.charCodeAt(t+1))&Cr){(le||t>N)&&(j.push(Za(le+e.slice(N,t))),le=``),j.push(Za(e[t+1])),t+=2,N=t;continue}if(t++,ue<0||ue-t>64)for(;t<n&&!(ue>=0&&ue-t<=64);){var be=e.charCodeAt(t);if(be<rr&&!fi[be])t++;else break}}}return(le||n>N)&&(j.push(Za(le+e.slice(N,n))),le=``),M.length>0&&Oa(j,M,r,i),La=a,to--,j}var ro=500;function io(e,t,n){var r=t.o||0;if(r>ro)return[{type:Z.text,text:e}];if(t.o=r+1,n.optimizeForStreaming&&!(t.i||t.w)){for(var i=e.length;i>0&&e.charCodeAt(i-1)===W;)i--;for(var a=i;a>0&&e.charCodeAt(a-1)!==W;)a--;if(i>a&&e.charCodeAt(a)===Un){for(var o=!1,s=a+1;s<i;s++){var c=e.charCodeAt(s);if(c!==H&&c!==U&&c!==Un&&c!==Tn&&c!==K){o=!0;break}}for(var l=!1,u=!1,d=0,f=a,p=a-1;p>0;){for(var m=p;m>0&&e.charCodeAt(m-1)!==W;)m--;if(e.charCodeAt(m)!==Un)break;f=m;for(var h=!0,g=!1,_=m;_<p;_++){var v=e.charCodeAt(_);if(v===K)g=!0;else if(v!==H&&v!==U&&v!==Tn&&v!==Un){h=!1;break}}h&&g?(l=!0,u=!0):u||d++,p=m-1}o?l||(e=e.slice(0,a).trimEnd()):e=l&&d>0?e.slice(0,a).trimEnd():e.slice(0,f).trimEnd()}for(var y=-1,b=-1,x=-1,S=!1,C=e.length-1;C>=0;C--)if(e.charCodeAt(C)===bn){for(var w=C+1<e.length?e.charCodeAt(C+1):0,T=w>=Y&&w<=X||w>=tr&&w<=nr,E=w===zn&&C+2<e.length&&(e.charCodeAt(C+2)>=Y&&e.charCodeAt(C+2)<=X||e.charCodeAt(C+2)>=tr&&e.charCodeAt(C+2)<=nr),D=w===Cn||w===Ln,O=e.length;O>C+1&&e.charCodeAt(O-1)===W;)O--;var ee=C+1>=O;if(T||E||D||ee){var k=C+1;if((E||T)&&(k=C+2),T||E)for(;k<e.length;){var te=e.charCodeAt(k);if(te>=Y&&te<=X||te>=tr&&te<=nr||te>=q&&te<=J)k++;else break}for(var ne=T||E?k:C+2;ne<e.length&&e.charCodeAt(ne)!==G;)ne++;if(ne>=e.length)y=C,S=!0;else if((T||E)&&e.charCodeAt(ne-1)!==zn){for(var re=!1,ie=ne+1;ie<e.length;ie++)if(e.charCodeAt(ie)===bn){re=!0;break}re||(y=C,b=k,x=ne+1)}}break}if(y>=0){for(var A=0,ae=0;ae<y;ae++)e.charCodeAt(ae)===un&&A++;if(A%2==0){if(S)e=e.slice(0,y);else{var oe=e.slice(y+1,b);ca(e,`</${oe}`,0)===-1&&(e=e.slice(0,y)+e.slice(x))}}}for(var se=e.length;se>0&&e.charCodeAt(se-1)===W;)se--;if(se>0){for(var ce=se;ce>0&&e.charCodeAt(ce-1)!==W;)ce--;for(var j=ce,M=0;j<se&&e.charCodeAt(j)===H&&M<3;)j++,M++;if(ce>0&&j<se&&Ki(e,j,se)){for(var N=ce-1,le=N;le>0&&e.charCodeAt(le-1)!==W;)le--;Ui(e,le,N)||(e=e.slice(0,ce).trimEnd())}}var ue=e.length;if(ue>0){for(var de=e.lastIndexOf(`
`),P=de===-1?0:de+1,F=ue,fe=P,pe=0;fe<F&&e.charCodeAt(fe)===H&&pe<3;)fe++,pe++;if(fe<F){var me=e.charCodeAt(fe),I=!1;if(me===vn||me===K||me===Hn){var L=fe+1;if(L>=F||e.charCodeAt(L)===H||e.charCodeAt(L)===U){for(var he=L;he<F&&(e.charCodeAt(he)===H||e.charCodeAt(he)===U);)he++;he>=F&&(I=!0)}}else if(me>=q&&me<=J){for(var ge=fe;ge<F&&e.charCodeAt(ge)>=q&&e.charCodeAt(ge)<=J;)ge++;if(ge<F&&(e.charCodeAt(ge)===Rn||e.charCodeAt(ge)===qn)){var _e=ge+1;if(_e>=F||e.charCodeAt(_e)===H||e.charCodeAt(_e)===U){for(var ve=_e;ve<F&&(e.charCodeAt(ve)===H||e.charCodeAt(ve)===U);)ve++;ve>=F&&(I=!0)}}}I&&(e=e.slice(0,P).trimEnd())}}}if(t.inline)return no(e,0,e.length,t,n);let ye=[],R=0,be=e.length;if(R===0&&!n.disableFrontmatter&&e.startsWith(`---`)){let t=ar(e);if(t?.hasValidYaml){if(n.preserveFrontmatter!==!1){let n=e.slice(0,t.endPos).trimEnd();ye.push({type:Z.frontmatter,text:n})}R=t.endPos}}for(;R<be;){for(var z=e.indexOf(`
`,R),xe=z<0?be:z;R<be&&Ui(e,R,xe);)R=xe<be?xe+1:xe,R<be&&(z=e.indexOf(`
`,R),xe=z<0?be:z);if(R>=be)break;var Se=e.charCodeAt(R)===er;Hi(e,R,xe);let r=null;if(Pi=e,Fi=R,Ii=xe,!Se&&Vi>=4&&!t.inHTML)r=$i(e,R);else if(!Se){let i=R+$,a=e.charCodeAt(i);a===mn?r=Gi(e,R,t,n):a===G?r=ea(e,R,t,n):a===un||a===dn?r=Zi(e,R,t):a===K||a===vn||a===yn?(r=qi(e,R),!r&&(r=aa(e,R,t,n))):a===Hn||a>=q&&a<=J?r=aa(e,R,t,n):a===bn?r=fa(e,R,t,n):a===Un?r=ha(e,R,t,n):a===fn&&(r=ga(e,R,t))}if(!r){for(var Ce=!1,we=R;we<xe;we++)if(e.charCodeAt(we)===Un){Ce=!0;break}Ce&&(r=ha(e,R,t,n))}if(r||=va(e,R,t,n),r)r.node.type!==Z.refCollection&&ye.push(r.node),R=r.end;else{var Te=e.indexOf(`
`,R);R=Te<0?be:Te+1}}return t.o=r,ye}function ao(e,t,n,r){var i=wi(e,t);return i?{tagName:i.tag,tagLower:i.tag.toLowerCase(),attrs:i.b,whitespaceBeforeAttrs:i.g,isSelfClosing:i.n,hasSpaceBeforeSlash:i.r,isClosing:i.f,hasNewline:i.g.includes(`
`)||i.b.includes(`
`),endPos:i.end}:null}function oo(e,t,n){to=0,e=Mr(e),!t.refs&&(t.refs={}),(n.optimizeForStreaming||t.inline)&&(t.w=Ei(e,t.refs,n));var r,i;t.t||(t.t=r=[],t.p=i=[]);let a=io(e,t,n);if(r&&i){for(var o=r,s={inline:t.inline,inAnchor:t.inAnchor,inHTML:t.inHTML,htmlDepth:t.d,inList:t.inList,inBlockQuote:t.inBlockQuote,noSetext:t.l,depth:t.o},c=0;c<o.length;c++){var l=o[c];t.inline=l.inline,t.inAnchor=l.inAnchor,t.inHTML=l.inHTML,t.d=l.htmlDepth,t.inList=l.inList,t.inBlockQuote=l.inBlockQuote,t.l=l.noSetext,t.o=l.depth,t.k=l.breaks;var u=no(l.text,0,l.text.length,t,n);t.k=!1;for(var d=0;d<u.length;d++)l.dest.push(u[d])}t.inline=s.inline,t.inAnchor=s.inAnchor,t.inHTML=s.inHTML,t.d=s.htmlDepth,t.inList=s.inList,t.inBlockQuote=s.inBlockQuote,t.l=s.noSetext,t.o=s.depth;for(var f=i,p=0;p<f.length;p++)for(var m=f[p],h=0;h<m.src.length;h++){var g=m.src[h];if(m.unwrap&&g.type===Z.paragraph)for(var _=g.children,v=0;v<_.length;v++)m.dest.push(_[v]);else m.dest.push(g)}t.t=void 0,t.p=void 0,Xa(a,t,n.slugify)}return Fr(t.refs)?[{type:Z.refCollection,refs:t.refs},...a]:a}var so;try{co=p.createElement(`div`),so=typeof co==`object`&&co&&`$$typeof`in co&&typeof co.$$typeof==`symbol`?co.$$typeof:Symbol.for(`react.transitional.element`)}catch{so=Symbol.for(`react.transitional.element`)}var co;function lo(e,t,n){return{$$typeof:so,type:e,key:n==null?null:String(n),ref:null,props:t,_owner:null,_store:{},_debugStack:null,_debugTask:null}}function uo(e,t){var n={key:e};if(t){var r=lr(t);for(var i in r)n[i]=r[i]}return n}var fo=typeof p.createContext>`u`?void 0:p.createContext(void 0);function po(e,t,n,r,i,a,o,s,c){switch(e.type){case Z.blockQuote:{let i={key:n.key};return e.alert&&(i.className=`markdown-alert-${a(e.alert.toLowerCase(),_r)}`,e.children.unshift(Ir(e.alert))),r(`blockquote`,i,t(e.children,n))}case Z.breakLine:return r(`br`,{key:n.key});case Z.breakThematic:return r(`hr`,{key:n.key});case Z.frontmatter:return s.preserveFrontmatter?r(`pre`,{key:n.key},e.text):null;case Z.codeBlock:{let t=e.lang?dr(e.lang):``;var l=e.attrs?lr(e.attrs):{};return l.className=t?`language-${t} lang-${t}`:``,r(`pre`,{key:n.key},r(`code`,l,e.text))}case Z.codeInline:return r(`code`,{key:n.key},e.text);case Z.footnoteReference:return r(`a`,{key:n.key,href:i(e.target,`a`,`href`)||void 0},r(`sup`,null,e.text));case Z.gfmTask:return r(`input`,{checked:e.completed,key:n.key,readOnly:!0,type:`checkbox`});case Z.heading:return r(`h${e.level}`,{id:e.id,key:n.key},t(e.children,n));case Z.htmlBlock:{let a=e;if(Kr(s)&&ei(a.tag)){var u=Wr(a);return u.kind===`literal`?r(`span`,{key:n.key},u.literal):r(`span`,{key:n.key},...Gr(u.open,a.children?t(a.children,n):null,u.close))}let l=a.j,_=l!==void 0,v=_?l:a.a?a.e||``:(a.e||``)+(a.h||``);if(v&&a.c){let r=mi(a.tag.toLowerCase()),u=a.children,y=u!=null&&u.length>0;if(r){let t=_?l:a.e||``,r=Kr(s)?ni(t):t;if(/<[a-z][^>]{0,100}>/i.test(v)){var d=uo(n.key,e.attrs);return d.dangerouslySetInnerHTML={__html:r},c(e.tag,d)}return c(e.tag,uo(n.key,e.attrs),r)}let b=RegExp(`^<${a.tag}(\\s|>)`,`i`);if(y&&!b.test(v)&&Kr(s)&&ti(v))return c(e.tag,uo(n.key,e.attrs),t(u,n));if(hi(v)){let t=Kr(s)?ni(v):v;var f=uo(n.key,e.attrs);return f.dangerouslySetInnerHTML={__html:t},c(e.tag,f)}let x=ri({slugify:s.slugify,sanitizer:i,tagfilter:!0}),S=Nr(v);if(RegExp(`^<${a.tag}(\\s[^>]*)?>(\\s*</${a.tag}>)?$`,`i`).test(S))return a.children&&a.children.length>0?c(e.tag,uo(n.key,e.attrs),t(a.children,n)):c(e.tag,uo(n.key,e.attrs));let C=oo(S,{inline:!1,refs:o,inHTML:!1},x);Br(C);let w=a.tag.toLowerCase(),T=_;if(T&&y)return c(e.tag,uo(n.key,e.attrs),t(u,n));if(T)return t(C.flatMap(zr),n);var m=Vr(C,w);if(m.found&&m.afterClose.length>0){var h=m.beforeClose.flatMap(zr),g=m.afterClose.flatMap(zr);return lo(p.Fragment,{children:[c(e.tag,uo(n.key,e.attrs),t(h,n)),t(g,n)]},n.key)}return c(e.tag,uo(n.key,e.attrs),t(C.flatMap(zr),n))}return br(e.tag)?c(e.tag,uo(n.key,e.attrs)):c(e.tag,uo(n.key,e.attrs),e.children?t(e.children,n):``)}case Z.htmlSelfClosing:{let t=e;if(Kr(s)&&ei(t.tag)){var _=Wr(t);return r(`span`,{key:n.key},_.kind===`literal`?_.literal:_.open+(_.close||``))}return c(e.tag,uo(n.key,e.attrs))}case Z.image:{let t=e.target===null?null:i(e.target,`img`,`src`);return r(`img`,{key:n.key,alt:e.alt&&e.alt.length>0?e.alt:void 0,title:e.title||void 0,src:t||void 0})}case Z.link:{let a={key:n.key};if(e.target!=null){let t=qr(e.target,i,`a`,`href`);t!=null&&(a.href=t)}return e.title&&(a.title=e.title),r(`a`,a,t(e.children,n))}case Z.table:{let i=e;return r(`table`,{key:n.key},r(`thead`,{key:`thead`},r(`tr`,null,i.header.map(function(e,a){return r(`th`,{key:a,style:i.align[a]===null?{}:{textAlign:i.align[a]}},t(e,n))}))),i.cells.length>0&&r(`tbody`,{key:`tbody`},i.cells.map(function(e,a){return r(`tr`,{key:a},e.map(function(e,a){return r(`td`,{key:a,style:i.align[a]===null?{}:{textAlign:i.align[a]}},t(e,n))}))})))}case Z.text:return e.text;case Z.textFormatted:return r(e.tag,{key:n.key},t(e.children,n));case Z.orderedList:case Z.unorderedList:return r(e.type===Z.orderedList?`ol`:`ul`,{key:n.key,start:e.type===Z.orderedList?e.start:void 0},e.items.map(function(e,i){return r(`li`,{key:i},t(e,n))}));case Z.paragraph:return r(`p`,{key:n.key},t(e.children,n));case Z.ref:return null;default:return null}}var mo=(e,t,n,r,i,a,o)=>{var s=e=>e.map(e=>`text`in e?e.text:``),c=(l,u={})=>{var d=Array.isArray(l)?l:[l],f=(u.renderDepth||0)+1;if(f>2500)return s(d);u.renderDepth=f;for(var p=u.key,m=[],h=!1,g=0;g<d.length;g++){u.key=g;var _=e?e(po.bind(null,d[g],c,u,t,n,r,i,a,o),d[g],c,u):po(d[g],c,u,t,n,r,i,a,o),v=typeof _==`string`;if(h&&typeof _==`string`){var y=m.at(-1);m[m.length-1]=(typeof y==`string`?y:``)+_}else if(_!=null){if(Array.isArray(_))for(var b=0;b<_.length;b++)m.push(_[b]);else m.push(_)}h=v}return u.key=p,u.renderDepth=f-1,m};return c},ho=(e,t)=>{let n=Yr(t,e,void 0);return n?typeof n==`function`||typeof n==`object`&&`render`in n?n:Yr(t,`${e}.component`,e):e};function go(e,t){let n={...t||{}};n.overrides=n.overrides||{};let r=n.slugify||_r,i=n.sanitizer||pr,a=n.createElement,o=Fr(n.overrides),s=e=>_o(e,{...n,wrapper:null});function c(e){for(var t in e){var n=e[t];if(typeof n==`string`&&n.length>0&&n.charCodeAt(0)===bn&&(ii.test(n)||ai.test(n)||ao(n,0))){var r=s(n.trim());e[t]=t===`innerHTML`&&Array.isArray(r)?r[0]:r}}}function l(e,t,...r){var i=t||{},s=e;if(o){var c=Yr(n.overrides,`${e}.props`,{});s=ho(e,n.overrides),i={...i,...c,className:Zr(i.className,c.className)||void 0}}if(!a){var l=i.key;return l!=null&&delete i.key,r.length===1?i.children=r[0]:r.length>1&&(i.children=r),lo(s,i,l)}return a(s,i,...r)}function u(e,t,...n){return t&&c(t),l(e,t,...n)}let d=ri(n,n.forceInline),f=e[0]&&e[0].type===Z.refCollection?e[0].refs:{},p=mo(n.renderRule,l,i,r,f,n,u),m=p(e,{inline:n.forceInline,refs:f}),h=Jr(f);if(h.length>0&&m.push(l(`footer`,{key:`footer`},h.map(function(e){let t=e.identifier.charCodeAt(0)===pn?e.identifier.slice(1):e.identifier,n=oo(e.footnote,{inline:!0,refs:f},d);return l(`div`,{id:r(t,_r),key:e.identifier},`${t}: `,p(n,{inline:!0,refs:f}))}))),n.wrapper===null)return m;let g=n.wrapper||(n.forceInline?`span`:`div`),_;if(m.length>1||n.forceWrapper)_=m;else return m.length===1?m[0]:null;var v=n.wrapperProps?{...n.wrapperProps}:{};return v.children=_,lo(g,v,`outer`)}function _o(e=``,t={}){let n={...t||{}};n.overrides=n.overrides||{},n.slugify,n.sanitizer;function r(e){let t=n.forceInline||!(n.forceBlock||ur.test(e)),r=ri(n,t);return go(oo(t?e:Rr(e),{inline:t,refs:i},r),{...n,forceInline:t})}let i={};return r(e)}function vo(e){let t=p.useRef(e),n=t.current;if(n!==e){var r=!0,i=0;for(var a in e)if(i++,!Object.is(n[a],e[a])){r=!1;break}if(r){var o=0;for(var s in n)o++;r=o===i}r||(t.current=e)}return t.current}var yo=({children:e,options:t,...n})=>{if(!(typeof p.useContext<`u`)){let r={...t,overrides:{...t?.overrides},wrapperProps:{...t?.wrapperProps,...n}};return _o(e??``,r)}let r=fo?p.useContext(fo):void 0,i=vo(n),a=p.useMemo(()=>({...r,...t,overrides:{...r?.overrides,...t?.overrides},wrapperProps:{...r?.wrapperProps,...t?.wrapperProps,...i}}),[r,t,i]),o=e??``;return p.useMemo(()=>_o(o,a),[o,a])};function bo({text:e}){return(0,f.jsx)(yo,{options:{disableParsingRawHTML:!0,forceBlock:!0},children:e})}function xo(e,t,n=[],r=!1){let i=!1,a=!1,o,s,c,l,u,d,f=[],p=[],m=[],h=[];for(let g of e.data.content){if(g.type!==`text`){h.push(g);continue}let e=g.text;if(!a){a=!0,r&&e.startsWith(`这是群聊分支的主题消息。`)&&(e=e.slice(12));let f=xe(e);e=f===void 0?e:e.slice(f.length);let p=/^([^：]{1,80})：/.exec(e);o=p?.[1],i=t!==void 0&&(f===void 0?o===t.displayName:f.participantId===t.participantId),s=f?.avatarId??b(o??f?.participantId??`participant`),c=f?.participantId;let m=n.find(e=>e.participantId===c);s=m?.avatarId??s,l=m?.avatarUrl,p!==null&&(e=e.slice(p[0].length));let h=Se(e);e=h.text,u=h.reply;let g=we(e);e=g.text,d=g.forward}let _=Te(e);e=_.text,p.push(..._.cards);let v=Ce(e);e=v.text,f.push(...v.files),e.trim()!==``&&m.push(e.trim()),e.trim()!==``&&h.push(e===g.text?g:{...g,text:e})}if((f.length>0||h.some(e=>e.type===`image`))&&m.length===1&&So(m[0])){m.length=0;for(let e=h.length-1;e>=0;--e){let t=h[e];t?.type===`text`&&So(t.text.trim())&&h.splice(e,1)}}return{node:a?{...e,data:{...e.data,content:h}}:e,own:i,avatarId:s??b(t?.participantId??`participant`),...c===void 0?{}:{participantId:c},files:f,cards:p,text:m.join(`
`),...o===void 0?{}:{displayName:o},...l===void 0?t!==void 0&&i&&t.avatarUrl!==void 0?{avatarUrl:t.avatarUrl}:{}:{avatarUrl:l},...u===void 0?{}:{reply:u},...d===void 0?{}:{forward:d}}}function So(e){return e===`发送了文件。`||e===`发送了一张图片。`}let Co=(0,p.memo)(function(e){let t=e.useChatroom(e=>e),n=e.nativeMessageView,r=t.rooms.find(t=>String(e.sessionId)===t.sessionId),i=e.resolveTarget?.(String(e.sessionId))??(r===void 0?void 0:{kind:`room`,room:r});if(i===void 0)return(0,f.jsx)(n,{...e});let a=xo(e.node,t.identity,[],i.kind===`thread`),o={...a,...t.members.find(e=>e.participantId===a.participantId)?.avatarUrl===void 0?{}:{avatarUrl:t.members.find(e=>e.participantId===a.participantId)?.avatarUrl}},s=A(o.text).length>0,c=s?Eo(o.node):o.node,l=c.data.content.length===0?void 0:(0,f.jsx)(n,{...e,node:c}),u=i.room,d=Ao(String(e.sessionId),e.node,o),p=Mo(d),m=jo(d),h=t.identity===void 0?void 0:()=>{e.setReply(Ve(i),p)},g=t.identity===void 0||i.kind===`thread`?void 0:()=>{e.openThread(u.id,m)},_=No(e,t,u.id,d,d.text,o.own,h,g),v=Po(t.threadPreviews,d.messageId,`human`);return(0,f.jsxs)(f.Fragment,{children:[u.aiContextStartSeq===e.node.data.seq&&(0,f.jsx)(gt,{}),(0,f.jsx)(To,{native:l,projection:o,tools:_,threadPreview:v,onReply:h,onThread:g,linkedText:s})]})}),wo=(0,p.memo)(function(e){let t=e.useChatroom(e=>e),n=e.nativeMessageView,r=t.rooms.find(t=>String(e.sessionId)===t.sessionId),i=e.resolveTarget?.(String(e.sessionId))??(r===void 0?void 0:{kind:`room`,room:r});if(i===void 0)return(0,f.jsx)(n,{...e});let a=xo(e.node,t.identity,[],i.kind===`thread`),o={...a,...t.members.find(e=>e.participantId===a.participantId)?.avatarUrl===void 0?{}:{avatarUrl:t.members.find(e=>e.participantId===a.participantId)?.avatarUrl}},s=A(o.text).length>0,c=s?Eo(o.node):o.node,l=c.data.content.length===0?void 0:(0,f.jsx)(n,{...e,node:c}),u=i.room,d=Ao(String(e.sessionId),e.node,o),p=Mo(d),m=jo(d),h=t.identity===void 0?void 0:()=>{e.setReply(Ve(i),p)},g=t.identity===void 0||i.kind===`thread`?void 0:()=>{e.openThread(u.id,m)},_=No(e,t,u.id,d,d.text,o.own,h,g),v=Po(t.threadPreviews,d.messageId,`human`);return(0,f.jsxs)(f.Fragment,{children:[u.aiContextStartSeq===e.node.data.seq&&(0,f.jsx)(gt,{}),(0,f.jsx)(To,{native:l,projection:o,tools:_,threadPreview:v,onReply:h,onThread:g,linkedText:s})]})});function To({native:e,projection:t,tools:n,threadPreview:r,onReply:i,onThread:a,linkedText:o}){let s=(0,p.useRef)(null);return(0,p.useLayoutEffect)(()=>{let e=s.current;if(e!==null)return de(e,t.participantId??t.displayName??t.avatarId,n.message.createdAt)},[t.avatarId,t.displayName,t.participantId,n.message.createdAt]),(0,f.jsx)(z,{rootRef:s,own:t.own,avatar:(0,f.jsx)(w,{avatarId:t.avatarId,avatarUrl:t.avatarUrl,seed:t.participantId??t.displayName??``}),displayName:t.displayName,reply:t.reply,tools:n,body:n.recalled?(0,f.jsx)(`div`,{className:`dsh-chatroom-recalled-message`,children:`消息已撤回`}):(0,f.jsxs)(f.Fragment,{children:[o&&(0,f.jsx)(ae,{className:`dsh-chatroom-human-bubble`,text:t.text}),e!==void 0&&(0,f.jsx)(`div`,{className:`dsh-chatroom-native-message`,children:e}),t.files.map(e=>(0,f.jsx)(Do,{file:e},e.id)),t.cards.map((e,t)=>(0,f.jsx)(D,{card:e},`${e.kind}:${e.title}:${t}`)),(0,f.jsx)(oe,{text:t.text,existingUrls:t.cards.flatMap(e=>e.url===void 0?[]:[e.url])}),t.forward!==void 0&&(0,f.jsx)(Oo,{forward:t.forward})]}),footer:(0,f.jsx)(en,{preview:r,open:a})})}function Eo(e){return{...e,data:{...e.data,content:e.data.content.filter(e=>e.type!==`text`)}}}function Do({file:e}){return(0,f.jsxs)(`a`,{className:`dsh-chatroom-file-card`,href:`${h}/files/${encodeURIComponent(e.id)}`,download:e.name,children:[(0,f.jsx)(`span`,{className:`dsh-chatroom-file-icon`,"aria-hidden":!0,children:`📎`}),(0,f.jsxs)(`span`,{className:`dsh-chatroom-file-copy`,children:[(0,f.jsx)(`strong`,{children:e.name}),(0,f.jsx)(`small`,{children:Io(e.bytes)})]}),(0,f.jsx)(`span`,{"aria-hidden":!0,children:`↓`})]})}function Oo({forward:e,depth:t=0}){return(0,f.jsxs)(`details`,{className:`dsh-chatroom-forward-card`,children:[(0,f.jsxs)(`summary`,{children:[(0,f.jsxs)(`strong`,{children:[`合并转发 · `,e.items.length,` 条消息`]}),(0,f.jsxs)(`small`,{children:[`来自 `,e.sourceRoomTitle]})]}),(0,f.jsx)(`div`,{children:e.items.map(n=>(0,f.jsxs)(`article`,{children:[(0,f.jsxs)(`strong`,{children:[n.displayName,(0,f.jsx)(`time`,{children:Fo(n.createdAt)})]}),n.reply!==void 0&&(0,f.jsxs)(`div`,{className:`dsh-chatroom-forward-reply`,children:[(0,f.jsxs)(`b`,{children:[`回复 `,n.reply.displayName]}),(0,f.jsx)(`span`,{children:n.reply.text})]}),(n.content??[{type:`text`,text:n.text,markdown:n.role===`ai`}]).map((t,r)=>{if(t.type===`text`)return t.markdown?(0,f.jsx)(bo,{text:t.text},r):(0,f.jsx)(`p`,{className:`dsh-chatroom-forward-text`,children:t.text},r);if(t.type===`file`)return(0,f.jsx)(Do,{file:t.file},`${t.file.id}:${r}`);let i=ko(e.sourceRoomId,n,t.image);return i===void 0?(0,f.jsx)(`span`,{className:`dsh-chatroom-forward-image-error`,children:`图片来源不可用`},`${t.image.attachmentId}:${r}`):(0,f.jsx)(`img`,{className:`dsh-chatroom-forward-image`,src:i,alt:t.image.name??`转发图片`},`${t.image.attachmentId}:${r}`)}),n.forward!==void 0&&t<1&&(0,f.jsx)(Oo,{forward:n.forward,depth:t+1}),n.reactions!==void 0&&n.reactions.length>0&&(0,f.jsx)(`div`,{className:`dsh-chatroom-forward-reactions`,children:n.reactions.map(e=>(0,f.jsxs)(`span`,{children:[e.emoji,` `,e.count]},e.emoji))})]},n.messageId))})]})}function ko(e,t,n){if(t.sourceSessionId!==void 0&&t.sourceSeq!==void 0)return`${h}/images/${encodeURIComponent(JSON.stringify({sourceRoomId:e,sourceSessionId:t.sourceSessionId,sourceSeq:t.sourceSeq,image:n}))}`}function Ao(e,t,n){let r=n.files.length===0?``:n.files.map(e=>e.name).join(`、`),i=n.forward===void 0?``:`合并转发 ${n.forward.items.length} 条消息`,a=(n.text.trim()||r||i||`图片消息`).replace(/\s+/gu,` `);return{messageId:`${t.kind}:${t.data.seq}`,sourceSessionId:e,sourceSeq:t.data.seq,role:`human`,displayName:n.displayName??`参与者`,text:[...a].slice(0,120).join(``),createdAt:t.data.time,content:[...n.text.trim()===``?[]:[{type:`text`,text:n.text,markdown:!1}],...n.node.data.content.flatMap(e=>e.type===`image`?[{type:`image`,image:{...e.attachment,attachmentId:String(e.attachment.attachmentId)}}]:[]),...n.files.map(e=>({type:`file`,file:e}))],...n.reply===void 0?{}:{reply:n.reply},...n.forward===void 0?{}:{forward:n.forward}}}function jo(e){if(e.sourceSessionId===void 0||e.sourceSeq===void 0)throw Error(`chatroom branch target lost its source coordinates`);return{messageId:e.messageId,displayName:e.displayName,text:e.text,role:e.role,sourceSessionId:e.sourceSessionId,sourceSeq:e.sourceSeq}}function Mo(e){return{messageId:e.messageId,displayName:e.displayName,text:e.text}}function No(e,t,n,r,i,a,o,s){return{roomId:n,message:r,reactions:t.reactions,identity:t.identity,selecting:t.selectionRoomId===n,selected:t.selectionRoomId===n&&t.selectedMessages.some(e=>e.messageId===r.messageId),recalled:t.recalls.some(e=>e.messageId===r.messageId),canRecall:a,copyText:i,onReply:o,onBranch:s,toggleReaction:e.toggleReaction,openForward:e.openForward,toggleSelection:e.toggleMessageSelection,recallMessage:e.recallMessage}}function Po(e,t,n){return e.find(e=>e.thread.root.messageId===t&&e.thread.root.role===n)}function Fo(e){return new Date(e).toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`})}function Io(e){return e<1024?`${e} B`:e<1048576?`${(e/1024).toFixed(1)} KB`:`${(e/1048576).toFixed(1)} MB`}function Lo(e,t){let n=e.session,r=Object.getOwnPropertyDescriptor(n,`prompt`),i=n.prompt,a=async(e,n)=>{let r=String(e.sessionId),a=De(e.content),o=typeof t.agentTargetForSession==`function`?t.agentTargetForSession(String(e.sessionId)):(()=>{let n=t.roomForSession(String(e.sessionId));return n===void 0?void 0:{kind:`room`,room:n}})();if(o===void 0&&!t.canPromptNativeSession(r)&&t.getSnapshot().auth?.enabled&&await t.resolveNativeOwnership(r),o===void 0&&a){if(!t.canPromptNativeSession(r))throw Error(`会话不存在或你无权访问。`);return await i(e,n)}let s=o===void 0&&typeof t.newSessionMode==`function`&&t.newSessionMode(r)===`group`;if(o===void 0&&typeof t.ensurePromptTarget==`function`&&(o=await t.ensurePromptTarget(r)),o===void 0){if(!t.canPromptNativeSession(r))throw Error(`会话不存在或你无权访问。`);return await i(e,n)}if(a)return await i(e,n);if(t.getSnapshot().identity===void 0)throw Error(`请先选择聊天室身份。`);if(s){let n=t.newGroupInvitees(e.content);if(n.length>0&&!await t.addRoomMembers(n))throw Error(t.getSnapshot().managementError??`无法把提及的成员加入新群聊。`)}typeof t.waitForRoomAutoTrigger==`function`&&await t.waitForRoomAutoTrigger(o.room.id);let c=t.composition(Ve(o)),l=await Qe(c.files),u=[...e.content,...l];return o.kind===`thread`?await Ze({threadId:o.threadId,mode:e.mode,content:u,...c.reply===void 0?{}:{reply:c.reply},requestId:e.requestId,...e.clientTimeZone===void 0?{}:{clientTimeZone:e.clientTimeZone}},n):await Xe({roomId:o.room.id,mode:e.mode,content:u,...c.reply===void 0?{}:{reply:c.reply},requestId:e.requestId,...e.clientTimeZone===void 0?{}:{clientTimeZone:e.clientTimeZone}},n),t.completeComposition(c),{ok:!0,value:{accepted:!0}}};return Object.defineProperty(n,"prompt",{configurable:!0,enumerable:r?.enumerable??!0,writable:!0,value:a}),()=>{n.prompt===a&&(r===void 0?delete n.prompt:Object.defineProperty(n,"prompt",r))}}let Ro=`button[id^="dsh-slash-option-群聊成员-"]`,zo=`dsh-chatroom-native-mention-avatar`;function Bo(e){let t=()=>{let t=Ho(e.getSnapshot());for(let e of document.querySelectorAll(Ro)){let n=e.firstElementChild,r=n?.nextElementSibling?.textContent?.trim();if(!(n instanceof HTMLElement)||r===void 0||r===``)continue;let i=t.get(r),a=n.querySelector(`:scope > img.${zo}`);if(i===void 0){a?.remove(),n.classList.remove(zo),delete n.dataset.dshChatroomAvatarFailed;continue}if(a?.src===i||(a?.remove(),n.dataset.dshChatroomAvatarFailed===i))continue;n.classList.add(zo);let o=document.createElement(`img`);o.alt=``,o.referrerPolicy=`no-referrer`,o.src=i,o.addEventListener(`error`,()=>{n.dataset.dshChatroomAvatarFailed=i,o.remove(),n.classList.remove(zo)},{once:!0}),n.prepend(o)}},n=new MutationObserver(e=>{e.some(Vo)&&t()});n.observe(document.body,{childList:!0,subtree:!0});let r=e.subscribe(t);return t(),()=>{r(),n.disconnect();for(let e of document.querySelectorAll(`${Ro} img.${zo}`)){let t=e.parentElement;e.remove(),t?.classList.remove(zo),t!=null&&delete t.dataset.dshChatroomAvatarFailed}}}function Vo(e){return[...e.addedNodes].some(e=>e instanceof Element&&(e.matches(Ro)||e.querySelector(Ro)!==null))}function Ho(e){let t=new Map;for(let n of e.members){let e=Uo(n.avatarUrl);e!==void 0&&t.set(n.displayName,e)}for(let n of e.directPeers){let r=Uo(n.avatarUrl);r!==void 0&&t.set(Be(n,e.directPeers),r)}return t}function Uo(e){if(e!==void 0)try{let t=new URL(e);return t.protocol===`https:`&&t.username===``&&t.password===``&&t.hash===``?t.href:void 0}catch{return}}function Wo(e,t,n,r){let i=e.startSession,a=new Set,o=!1,s=s=>{let c=t.list.getSnapshot(),l=_(n.list.getSnapshot()),u=l===void 0?void 0:c.items.find(e=>e.sessionIds.includes(l))?.workspaceId,d=s??u??c.items[0]?.workspaceId;if(d===void 0){i(s);return}r(d).then(t=>{if(!o){let r=Go(e,n,t,a);r!==void 0&&a.add(r)}},e=>{o||console.warn(`new shared session failed:`,e)})};return e.startSession=s,()=>{o=!0;for(let e of a)e();a.clear(),e.startSession===s&&(e.startSession=i)}}function Go(e,t,n,r){let i=!1,a=()=>void 0,o,s=()=>{i||(i=!0,a(),o!==void 0&&clearTimeout(o),r.delete(s))},c=()=>{i||t.list.getSnapshot().byId[n]===void 0||(s(),e.openSession(n))};if(t.list.getSnapshot().byId[n]!==void 0){e.openSession(n);return}return a=t.list.subscribe(c),o=setTimeout(()=>{s(),console.warn(`new shared session was not listed within 5000ms`)},5e3),c(),i?void 0:s}function Ko(e){e.useChatroom(e=>e);let t=e.newSessionMode(String(e.sessionId)),[n,r]=(0,p.useState)(),i=e.useSession(e=>e.blank);if((0,p.useEffect)(()=>{i&&t===void 0&&e.registerNewSession(String(e.sessionId))},[i,t,e.registerNewSession,e.sessionId]),(0,p.useEffect)(()=>{if(!i)return;let e=[...document.querySelectorAll(`span`)].find(e=>e.textContent?.trim()===`探索未至之境`),t=e?.parentElement,n=t?.parentElement,a=t?.nextElementSibling;if(!(a instanceof HTMLElement)||e===void 0||n==null)return;let o=e.textContent;return e.textContent=`今天有什么工作要处理？`,n.setAttribute(`data-dsh-chatroom-new-session-hero`,``),a.setAttribute(`data-dsh-chatroom-new-session-switch-host`,``),r(a),()=>{e.textContent=o,n.removeAttribute(`data-dsh-chatroom-new-session-hero`),a.removeAttribute(`data-dsh-chatroom-new-session-switch-host`)}},[i,e.sessionId]),(0,p.useEffect)(()=>{if(!i||n===void 0||t===void 0)return;let e=null,r=n;for(;r!==null&&e===null;)e=r.querySelector(`button[aria-label="选择工作区"]`),r=r.parentElement;let a=e?.querySelector(`span`);if(e===null||a==null)return;let o=a.textContent??``,s=t===`solo`?`Solo`:`群聊`;return a.textContent=s,e.title=o===``?`当前会话类型：${s}`:`当前会话类型：${s}；工作区：${o}`,e.setAttribute(`data-dsh-chatroom-session-mode`,t),()=>{a.textContent=o,e.removeAttribute(`title`),e.removeAttribute(`data-dsh-chatroom-session-mode`)}},[i,t,n]),!i||t===void 0)return null;let a=t===`solo`?`solo`:`group`,o=(0,f.jsxs)(`div`,{className:`dsh-chatroom-new-mode-switch`,"data-mode":a,role:`group`,"aria-label":`新会话模式`,children:[(0,f.jsx)(`button`,{type:`button`,"data-active":a===`group`,onClick:()=>{e.chooseNewSessionMode(String(e.sessionId),`group`)},children:`群聊`}),(0,f.jsx)(`button`,{type:`button`,"data-active":a===`solo`,onClick:()=>{e.chooseNewSessionMode(String(e.sessionId),`solo`)},children:`Solo`})]});return n===void 0?(0,f.jsx)(`section`,{className:`dsh-chatroom-new-mode`,"aria-label":`选择新会话模式`,children:o}):(0,m.createPortal)(o,n)}function qo(e){let t=e.useChatroom(e=>e),n=t.rooms.find(t=>String(e.sessionId)===t.sessionId);if(n===void 0)return t.roomEnsureSessionId===String(e.sessionId)?(0,f.jsx)(`button`,{className:`dsh-chatroom-manage-action`,type:`button`,disabled:!0,children:`正在建立共享群…`}):null;let r=t.identity,i=t.room?.id===n.id,a=i&&t.connection===`online`?`${t.online} 人在线`:`共享会话`;return(0,f.jsxs)(`span`,{className:`dsh-chatroom-header-actions`,children:[(0,f.jsxs)(`span`,{className:`dsh-chatroom-identity-action`,title:`当前群聊身份`,children:[(0,f.jsx)(`span`,{className:`dsh-chatroom-presence-dot`,"data-online":i&&t.connection===`online`}),r?.displayName??`选择身份`,` · `,a]}),(0,f.jsx)(`button`,{className:`dsh-chatroom-manage-action`,type:`button`,onClick:e.openMembers,children:`群管理`})]})}let Jo=`div[role="treeitem"][aria-selected]`,Yo=`data-dsh-chatroom-group-avatar`,Xo=`data-dsh-chatroom-solo-avatar`,Zo=`data-dsh-chatroom-sidebar-category`,Qo=`data-dsh-chatroom-workspace-categories`,$o=`data-dsh-chatroom-category-header`,es=`data-dsh-chatroom-direct-row`,ts=`data-dsh-chatroom-category-wrapper`,ns=`data-dsh-chatroom-branch-row`,rs=`data-dsh-chatroom-branch-marker`,is=`data-dsh-chatroom-branch-surface`,as=`data-dsh-chatroom-branch-replies`,os=`data-dsh-chatroom-native-branch-title`,ss=`data-dsh-chatroom-branch-count`,cs=`data-dsh-chatroom-branch-overflow`,ls=`data-dsh-chatroom-branch-overflow-row`,us=`data-dsh-chatroom-branch-updated-at`,ds=`data-dsh-chatroom-session-id`,fs=`data-dsh-chatroom-hidden-session`,ps=`chatroom-thread-v1-`,ms=`分支：`,hs=`data-dsh-chatroom-native-group-section`,gs=`data-dsh-chatroom-native-folder-wrapper`,_s=`data-dsh-chatroom-native-folder-expand-attempted`,vs=`data-dsh-chatroom-native-overflow-button`,ys=`data-dsh-chatroom-native-overflow-expand-attempted`,bs=`data-dsh-chatroom-category-overflow`,xs=`data-dsh-chatroom-overflow-row`,Ss=`[role="tree"], [role="treeitem"], [role="menu"]`,Cs=-1e4,ws=-6e3,Ts=new WeakMap,Es=new WeakMap,Ds,Os;function ks(e,t){if(typeof document>`u`||typeof MutationObserver>`u`)return()=>void 0;let n=!1,r,i,a=()=>{n=!1;let a=t.list.getSnapshot(),s=e.getSnapshot();js(document,s,_(a),e.setRoomPinned,e.openDirect,e.closeDirect,a);let c=s.phase===`ready`?s.identity?.participantId:void 0;c===void 0?r=void 0:r!==c&&(r=c,e.loadDirectDirectory().then(e=>{e||r!==c||(r=void 0,i=setTimeout(o,2e3))}))},o=()=>{n||(n=!0,queueMicrotask(a))},s=new MutationObserver(e=>{e.some(As)&&o()}),c=t=>{(t.target instanceof Element?t.target.closest(`button[aria-label="搜索会话"]`):null)!==null&&(t.preventDefault(),t.stopPropagation(),t.stopImmediatePropagation(),e.openSearch())};document.addEventListener(`click`,c,!0),s.observe(document.body,{childList:!0,subtree:!0,characterData:!0});let l=e.subscribe(o),u=t.list.subscribe(o);return o(),()=>{l(),u(),s.disconnect(),document.removeEventListener(`click`,c,!0);let e=document.querySelectorAll(`${Jo}, [${ns}], [${ds}]`);for(let t of e)rc(t);for(let e of document.querySelectorAll(`[${fs}]`))e.removeAttribute(fs);i!==void 0&&clearTimeout(i);for(let e of document.querySelectorAll(`[${Zo}]`))ic(e);for(let e of document.querySelectorAll(`[${Qo}]`))kc(e)}}function As(e){let t=e.target instanceof Element?e.target:e.target.parentElement;return t!==null&&t.closest(Ss)!==null||[...e.addedNodes,...e.removedNodes].some(e=>e instanceof Element&&(e.matches(Ss)||e.querySelector(Ss)!==null))}function js(e,t,n,r,i,a,o){let s=[...e.querySelectorAll(Jo)].filter(e=>e.closest(`[${es}]`)===null),c=sc(e,s),l=[...t.rooms],u=[],d=[],f=0,p=0;for(let e of s){Rs(e,a);let r=e.getAttribute(`aria-selected`)===`true`,i=Ls(o,e),s=i===void 0?Bs(e)??(r?n:void 0):String(i.id),c=Is(o,s)??i,d=s===void 0?void 0:Hs(l,e=>e.sessionId===s),f=Qs(e)?.textContent?.trim(),p=c!==void 0&&Ks(c)||f?.startsWith(ms)===!0||e.dataset.dshChatroomBranchSessionId!==void 0,m=d===void 0&&s===void 0&&!p&&r&&t.room!==void 0?Hs(l,e=>e.id===t.room?.id):void 0,h=d??m??Us(l,e),g=Gs(e,s,c,o,t,h),_=g!==void 0&&Ms(g,t)?g:void 0;u.push({row:e,sessionId:s,summary:c,branch:_,room:h})}let m=new Map,h=new Set;for(let e of u){let t=e.branch;if(t===void 0||t.parentSessionId===void 0)continue;let n=t.sessionId??`${t.parentSessionId}\u0000${t.displayTitle}`;h.has(n)||(h.add(n),m.set(t.parentSessionId,(m.get(t.parentSessionId)??0)+1))}for(let e of u){let{row:n,sessionId:i,branch:a,room:o}=e;if(o!==void 0){Fs(n),tc(n),n.setAttribute(ds,o.sessionId),Js(n,o,Ws(o,t),f++,r);let e=i??o.sessionId;Xs(n,o.title,m.get(e)??0),ac(n,`group`),d.push(n);continue}if(nc(n),a!==void 0){Fs(n),n.dataset.dshChatroomBranchRow!==void 0&&n.dataset.dshChatroomBranchSessionId!==a.sessionId&&tc(n),Ys(n,a),n.style.order=String(Cs+f++),n.querySelector(`:scope > [${Xo}]`)?.remove(),ac(n,`group`),d.push(n);continue}if(tc(n),!zs(n)){Fs(n),ic(n);continue}if(!Ns(i,t)){Ps(n);continue}Fs(n),n.removeAttribute(ns),oc(n,p++),ac(n,`solo`),d.push(n)}cc(e,c,d,t,i),jc(e,t,r)}function Ms(e,t){return t.auth?.enabled!==!0||e.parentSessionId!==void 0&&t.rooms.some(t=>t.sessionId===e.parentSessionId)}function Ns(e,t){return t.phase!==void 0&&t.phase!==`ready`?!1:t.auth?.enabled!==!0||e!==void 0&&t.soloSessionIds?.includes(e)===!0}function Ps(e){let t=bc(e);ic(e),e.setAttribute(fs,``),t.setAttribute(fs,``)}function Fs(e){e.removeAttribute(fs),e.parentElement?.removeAttribute(fs)}function Is(e,t){if(e!==void 0&&t!==void 0)return e.byId[t]}function Ls(e,t){if(e===void 0)return;let n=Qs(t)?.textContent?.trim();if(n===void 0||!n.startsWith(ms))return;let r=Object.values(e.byId).filter(e=>Ks(e)&&e.displayTitle.trim()===n);return r.length===1?r[0]:void 0}function Rs(e,t){e.dataset.dshChatroomDirectCloseBound!==`true`&&(e.dataset.dshChatroomDirectCloseBound=`true`,e.addEventListener(`click`,e=>{e.target.closest(`button[aria-label]`)===null&&t?.()}))}function zs(e){return!e.hasAttribute(`aria-expanded`)&&(e.getAttribute(`aria-selected`)===`true`||e.querySelector(`button[aria-label]`)!==null||e.dataset.dshChatroomRoomRow!==void 0)}function Bs(e){if(e.dataset.dshChatroomSessionId!==void 0)return e.dataset.dshChatroomSessionId;if(e.draggable!==!0)return;let t=e.ownerDocument.defaultView?.Event;if(t===void 0)return;let n=new Map,r={effectAllowed:`uninitialized`,dropEffect:`none`,setData:(e,t)=>n.set(e,t),getData:e=>n.get(e)??``,clearData:e=>e===void 0?n.clear():n.delete(e)},i;try{let a=new t(`dragstart`,{bubbles:!0,cancelable:!0});Object.defineProperty(a,"dataTransfer",{value:r}),e.dispatchEvent(a),i=n.get(`text/plain`)}catch{i=void 0}finally{try{let n=new t(`dragend`,{bubbles:!0});Object.defineProperty(n,"dataTransfer",{value:r}),e.dispatchEvent(n)}catch{}}if(i!==void 0&&i.length!==0)return e.dataset.dshChatroomSessionId=i,i}function Vs(e,t){return[...e.querySelectorAll(`span`)].some(e=>!e.closest(`[${is}]`)&&e.childElementCount===0&&e.textContent?.trim()===t)}function Hs(e,t){let n=e.findIndex(t);if(!(n<0))return e.splice(n,1)[0]}function Us(e,t){let n=e.filter(e=>Vs(t,e.title));return n.length===1?Hs(e,e=>e.id===n[0]?.id):void 0}function Ws(e,t){return e.memberAvatars===void 0?e.memberAvatarIds===void 0?t.room?.id===e.id&&t.members.length>0?t.members.slice(0,9).map(e=>({participantId:e.participantId,avatarId:e.avatarId,...e.avatarUrl===void 0?{}:{avatarUrl:e.avatarUrl}})):[]:e.memberAvatarIds.slice(0,9).map((e,t)=>({participantId:String(t),avatarId:e})):e.memberAvatars.slice(0,9)}function Gs(e,t,n,r,i,a){if(a!==void 0||t!==void 0&&i.rooms.some(e=>e.sessionId===t))return;let o=Qs(e)?.textContent?.trim(),s=n?.displayTitle.trim(),c=t?.startsWith(ps)===!0,l=s?.startsWith(ms)===!0||o?.startsWith(ms)===!0;if(n!==void 0&&!Ks(n)&&!c)return;let u=n!==void 0&&Ks(n);if(c&&o!==void 0&&!o.startsWith(ms)&&!u){e.dataset.dshChatroomSessionId===t&&delete e.dataset.dshChatroomSessionId;return}if(!c&&!l)return;let d=s??o??ms,f=qs(d),p=t===void 0?void 0:(i.threadPreviews??[]).find(e=>e.thread.sessionId===t),m=p===void 0?void 0:i.rooms.find(e=>e.id===p.thread.roomId),h=n?.parentId===void 0?p?.thread.root.sourceSessionId??m?.sessionId:String(n.parentId),g=Is(r,h);return{sessionId:t,displayTitle:d,topic:f,parentSessionId:h,parentTitle:(h===void 0?void 0:i.rooms.find(e=>e.sessionId===h))?.title??g?.displayTitle??m?.title,replyCount:p!==void 0&&p.totalMessages>0?p.totalMessages:void 0,updatedAt:n?.updatedAt??p?.thread.createdAt??0}}function Ks(e){return String(e.id).startsWith(ps)||e.parentId!==void 0&&e.displayTitle.trim().startsWith(ms)}function qs(e){let t=e.trim(),n=t.startsWith(ms)?t.slice(3).trim():t;return n===``?`未命名主题`:n}function Js(e,t,n,r,i){e.dataset.dshChatroomRoomRow=``,e.dataset.dshChatroomRoomId=t.id,e.dataset.pinned=String(t.pinned===!0),e.style.order=String(Cs+r),e.parentElement?.setAttribute(`data-dsh-chatroom-room-list`,``),Ac(e,t),e.querySelector(`:scope > [${Xo}]`)?.remove();let a=n.map(e=>`${e.participantId}:${e.avatarId}:${e.avatarUrl??``}`).join(`|`)||`empty`,o=e.querySelector(`:scope > [${Yo}]`);if(o?.dataset.signature===a)return;o?.remove(),o=e.ownerDocument.createElement(`span`),o.setAttribute(Yo,``),o.dataset.count=String(Math.max(1,n.length)),o.dataset.signature=a,o.setAttribute(`aria-hidden`,`true`);let s=n.length===0?[{emoji:`✦`}]:n.map(e=>({...e,emoji:x(e.avatarId,e.participantId).emoji}));for(let t of s){let n=e.ownerDocument.createElement(`span`);if(t.avatarUrl===void 0)n.textContent=t.emoji;else{let r=e.ownerDocument.createElement(`img`);r.src=t.avatarUrl,r.alt=``,r.referrerPolicy=`no-referrer`,r.addEventListener(`error`,()=>{r.remove(),n.textContent=t.emoji},{once:!0}),n.append(r)}o.append(n)}e.prepend(o)}function Ys(e,t){e.dataset.dshChatroomBranchRow=``,t.sessionId===void 0?delete e.dataset.dshChatroomBranchSessionId:(e.dataset.dshChatroomBranchSessionId=t.sessionId,e.setAttribute(ds,t.sessionId)),t.parentSessionId===void 0?delete e.dataset.dshChatroomBranchParentSessionId:e.dataset.dshChatroomBranchParentSessionId=t.parentSessionId,e.setAttribute(us,String(t.updatedAt)),e.dataset.dshChatroomBranchTopic=t.topic,t.parentTitle===void 0?delete e.dataset.dshChatroomBranchParentTitle:e.dataset.dshChatroomBranchParentTitle=t.parentTitle,t.replyCount===void 0?e.removeAttribute(as):e.setAttribute(as,String(t.replyCount));let n=t.parentTitle===void 0?`来自群聊`:`来自 ${t.parentTitle}`,r=t.replyCount===void 0?``:` · ${t.replyCount} 条回复`,i=t.parentTitle===void 0&&t.replyCount===void 0?`分支会话：${t.topic}`:`分支会话：${t.topic}，${n}${r}`;ec(e,i),e.setAttribute(`aria-label`,i),e.setAttribute(`title`,i);let a=Qs(e,t.displayTitle);a?.setAttribute(os,``);let o=e.querySelector(`:scope > [${rs}]`);o===null&&(o=e.ownerDocument.createElement(`span`),o.setAttribute(rs,``),o.setAttribute(`aria-hidden`,`true`),o.innerHTML=`<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" aria-hidden="true"><circle cx="4" cy="3" r="1.5"/><circle cx="12" cy="4" r="1.5"/><circle cx="4" cy="13" r="1.5"/><path d="M4 4.5v7M4 9c5 0 8-1 8-3.5"/></svg>`);let s=e.querySelector(`:scope > [${is}]`);s===null&&(s=e.ownerDocument.createElement(`span`),s.setAttribute(is,``),s.setAttribute(`aria-hidden`,`true`));let c=`${t.topic}|${t.parentTitle??``}|${t.replyCount??``}`;if(s.dataset.signature!==c){s.replaceChildren();let n=e.ownerDocument.createElement(`span`);n.setAttribute(`data-dsh-chatroom-branch-heading`,``);let r=e.ownerDocument.createElement(`span`);if(r.setAttribute(`data-dsh-chatroom-branch-topic`,``),r.textContent=t.topic,n.append(r),s.append(n),t.replyCount!==void 0&&t.replyCount>0){let n=e.ownerDocument.createElement(`span`);n.setAttribute(`data-dsh-chatroom-branch-reply-count`,``),n.textContent=String(t.replyCount),n.title=`${t.replyCount} 条回复`,s.append(n)}s.dataset.signature=c}a===void 0?(o.parentElement!==e||s.parentElement!==e)&&e.append(o,s):(a.previousElementSibling!==s||s.previousElementSibling!==o)&&a.before(o,s)}function Xs(e,t,n){if(n===0){Zs(e);return}e.dataset.dshChatroomHasBranches=``,e.dataset.dshChatroomBranchCount=String(n);let r=e.querySelector(`:scope > [${ss}]`);if(r===null){r=e.ownerDocument.createElement(`span`),r.setAttribute(ss,``);let n=Qs(e,t);n===void 0?e.append(r):n.after(r)}let i=String(n);r.textContent!==i&&(r.textContent=i),r.setAttribute(`title`,`${n} 个分支`),r.setAttribute(`aria-label`,`${n} 个分支`)}function Zs(e){delete e.dataset.dshChatroomHasBranches,delete e.dataset.dshChatroomBranchCount,e.querySelector(`:scope > [${ss}]`)?.remove()}function Qs(e,t){let n=[...e.querySelectorAll(`span`)].filter(e=>!e.closest(`[${is}]`)&&!e.hasAttribute(rs)&&!e.hasAttribute(ss)&&e.childElementCount===0);if(t!==void 0){let e=n.find(e=>e.textContent?.trim()===t);if(e!==void 0)return e}return n.find(e=>e.textContent?.trim().startsWith(ms))??n.find(e=>e.dataset.dshChatroomNativeBranchTitle!==void 0)??n.filter(e=>{let t=e.textContent?.trim()??``;return t!==``&&!$s(t)&&t!==`●`}).sort((e,t)=>(t.textContent?.trim().length??0)-(e.textContent?.trim().length??0))[0]}function $s(e){return/^(?:刚刚|现在|now|\d+\s*(?:秒|分钟|小时|天|周|月|年|s|min|h|d|w))$/iu.test(e)}function ec(e,t){let n=Ts.get(e);if(n===void 0){Ts.set(e,{ariaLabel:e.getAttribute(`aria-label`),title:e.getAttribute(`title`),appliedAriaLabel:t,appliedTitle:t});return}let r=e.getAttribute(`aria-label`)===n.appliedAriaLabel?n.ariaLabel:e.getAttribute(`aria-label`),i=e.getAttribute(`title`)===n.appliedTitle?n.title:e.getAttribute(`title`);Ts.set(e,{ariaLabel:r,title:i,appliedAriaLabel:t,appliedTitle:t})}function tc(e){delete e.dataset.dshChatroomBranchRow,delete e.dataset.dshChatroomBranchSessionId,delete e.dataset.dshChatroomBranchParentSessionId,e.removeAttribute(us),e.removeAttribute(ls),delete e.dataset.dshChatroomBranchTopic,delete e.dataset.dshChatroomBranchParentTitle,e.removeAttribute(as),e.querySelector(`:scope > [${rs}]`)?.remove(),e.querySelector(`:scope > [${is}]`)?.remove();for(let t of e.querySelectorAll(`[${os}]`))t.removeAttribute(os);let t=Ts.get(e);t!==void 0&&(e.getAttribute(`aria-label`)===t.appliedAriaLabel&&(t.ariaLabel===null?e.removeAttribute(`aria-label`):e.setAttribute(`aria-label`,t.ariaLabel)),e.getAttribute(`title`)===t.appliedTitle&&(t.title===null?e.removeAttribute(`title`):e.setAttribute(`title`,t.title)),Ts.delete(e)),bc(e).removeAttribute(ls)}function nc(e){delete e.dataset.dshChatroomRoomRow,delete e.dataset.dshChatroomRoomId,delete e.dataset.pinned,Zs(e),e.querySelector(`:scope > [${Yo}]`)?.remove()}function rc(e){tc(e),nc(e),delete e.dataset.dshChatroomSessionId,delete e.dataset.dshChatroomBranchSessionId,e.style.removeProperty(`order`)}function ic(e){rc(e),e.removeAttribute(Zo),e.removeAttribute(ns),e.removeAttribute(xs),e.querySelector(`:scope > [${Xo}]`)?.remove();let t=e.parentElement;t?.removeAttribute(ts),t?.removeAttribute(xs),t?.style.removeProperty(`order`)}function ac(e,t){e.setAttribute(Zo,t);let n=e.closest(`[role="tree"]`),r=e.parentElement;n!==null&&r!==null&&r!==n&&(r.setAttribute(ts,t),r.style.order=e.style.order)}function oc(e,t){if(e.style.order=String(ws+t),e.querySelector(`:scope > [${Xo}]`)!==null)return;let n=e.ownerDocument.createElement(`span`);n.setAttribute(Xo,``),n.setAttribute(`aria-hidden`,`true`),n.textContent=`✧`,e.prepend(n)}function sc(e,t){return t.find(e=>e.closest(`[role="tree"]`)!==null)?.closest(`[role="tree"]`)??e.querySelector(`[role="tree"]`)??t[0]?.parentElement??void 0}function cc(e,t,n,r,i){for(let n of e.querySelectorAll(`[${Qo}]`))n!==t&&kc(n);if(t===void 0)return;t.setAttribute(Qo,``),lc(t),uc(t);let a=n.filter(e=>e.getAttribute(Zo)===`group`),o=n.filter(e=>e.getAttribute(Zo)===`solo`);fc(t,a),mc(t,a),wc(t,`group`,`群聊`,a.filter(e=>e.dataset.dshChatroomRoomRow!==void 0).length,-11e3),xc(t,`group`,a.filter(e=>e.dataset.dshChatroomRoomRow!==void 0),Cs),yc(t,a),wc(t,`solo`,`Solo`,o.length,-7e3),xc(t,`solo`,o,ws);let s=Tc(r.directPeers??[],r.directConversations??[]);wc(t,`direct`,`私聊`,s.length,-3e3),Ec(t,s,r,i)}function lc(e){for(let t of e.querySelectorAll(`[${hs}]`))t.removeAttribute(hs);for(let t of e.querySelectorAll(`[${gs}]`))t.removeAttribute(gs),t.removeAttribute(`data-hidden`),t.style.removeProperty(`order`);for(let t of e.querySelectorAll(`div[role="treeitem"]`)){let n=Cc(e,t);if(n!==void 0&&n!==t&&n.setAttribute(hs,``),!t.hasAttribute(`aria-expanded`))continue;let r=t.parentElement;if(r===null)continue;let i=r.querySelectorAll(`div[role="treeitem"]`).length>1?t:r;i.setAttribute(gs,``),i.dataset.hidden=`true`,t.getAttribute(`aria-expanded`)===`true`?t.removeAttribute(_s):t.getAttribute(`aria-expanded`)===`false`&&!t.hasAttribute(_s)&&(t.setAttribute(_s,``),t.click())}}function uc(e){for(let t of e.querySelectorAll(`[${hs}]`)){let e=t.querySelector(`:scope > button[aria-expanded]`);e!==null&&(e.setAttribute(vs,``),e.style.removeProperty(`order`),e.getAttribute(`aria-expanded`)===`true`?e.removeAttribute(ys):e.hasAttribute(ys)||(e.setAttribute(ys,``),e.click()))}}function dc(e){return`data-dsh-chatroom-${e}-overflow-expanded`}function fc(e,t){let n=pc(e),r=t.filter(e=>e.dataset.dshChatroomBranchParentSessionId!==void 0),i=new Map;for(let e of r){e.removeAttribute(ls),bc(e).removeAttribute(ls);let t=e.dataset.dshChatroomBranchParentSessionId,n=i.get(t)??[];n.push(e),i.set(t,n)}let a=new Map([...e.querySelectorAll(`:scope > [${cs}]`)].map(e=>[e.dataset.parentSessionId??``,e]));for(let[t,r]of i){let i=_c(r),o=a.get(t);if(a.delete(t),i.length<=2){n.delete(t),o?.remove();continue}if(o===void 0){o=e.ownerDocument.createElement(`div`),o.setAttribute(cs,``),o.dataset.parentSessionId=t;let r=e.ownerDocument.createElement(`button`);r.type=`button`;let i=o;r.onclick=()=>{n.has(t)?n.delete(t):n.add(t),i.dataset.expanded=String(n.has(t)),vc(i,_c(gc(e,t)))},o.append(r),e.append(o)}o.dataset.expanded=String(n.has(t)),o.dataset.total=String(i.length),vc(o,i)}for(let[e,t]of a)n.delete(e),t.remove()}function pc(e){let t=Es.get(e);if(t!==void 0)return t;let n=new Set([...e.querySelectorAll(`:scope > [${cs}][data-expanded="true"]`)].map(e=>e.dataset.parentSessionId).filter(e=>e!==void 0));return Es.set(e,n),n}function mc(e,t){let n=new Map([...e.querySelectorAll(`:scope > [${cs}]`)].map(e=>[e.dataset.parentSessionId??``,e])),r=new Map;for(let e of t.filter(e=>e.dataset.dshChatroomBranchRow!==void 0)){let t=e.dataset.dshChatroomBranchParentSessionId;if(t===void 0)continue;let n=r.get(t)??[];n.push(e),r.set(t,n)}let i=new Set,a=Cs;for(let e of t.filter(e=>e.dataset.dshChatroomRoomRow!==void 0)){hc(e,a++),i.add(e);let t=e.dataset.dshChatroomSessionId;if(t===void 0)continue;for(let e of _c(r.get(t)??[]))hc(e,a++),i.add(e);let o=n.get(t);o!==void 0&&(o.style.order=String(a++)),n.delete(t)}for(let e of t)i.has(e)||hc(e,a++);for(let e of n.values())e.style.order=String(a++)}function hc(e,t){e.style.order=String(t);let n=bc(e);n!==e&&(n.style.order=e.style.order)}function gc(e,t){return[...e.querySelectorAll(`[${ns}]`)].filter(e=>e.dataset.dshChatroomBranchParentSessionId===t)}function _c(e){return[...e].sort((e,t)=>Number(t.getAttribute(us)??`0`)-Number(e.getAttribute(us)??`0`)||Number(e.style.order)-Number(t.style.order))}function vc(e,t){let n=e.dataset.expanded===`true`;t.forEach((e,t)=>{let r=bc(e);!n&&t>=2?(e.setAttribute(ls,``),r.setAttribute(ls,``)):(e.removeAttribute(ls),r.removeAttribute(ls))});let r=e.querySelector(`button`);if(r===null)return;r.setAttribute(`aria-expanded`,String(n));let i=t.length-2,a=n?`收起`:`展开其余 ${String(i)} 个分支`;r.textContent!==a&&(r.textContent=a)}function yc(e,t){for(let e of t.filter(e=>e.dataset.dshChatroomBranchRow!==void 0)){let t=bc(e);t.getAttribute(xs)===`group`&&t.removeAttribute(xs)}for(let t of e.querySelectorAll(`:scope > [${cs}]`))t.getAttribute(xs)===`group`&&t.removeAttribute(xs);let n=t.filter(e=>e.dataset.dshChatroomRoomRow!==void 0&&bc(e).getAttribute(xs)===`group`).map(e=>e.dataset.dshChatroomSessionId).filter(e=>e!==void 0);for(let t of n){for(let n of gc(e,t))bc(n).setAttribute(xs,`group`);[...e.querySelectorAll(`:scope > [${cs}]`)].find(e=>e.dataset.parentSessionId===t)?.setAttribute(xs,`group`)}}function bc(e){let t=e.parentElement;return t===null||!t.hasAttribute(ts)||t.querySelectorAll(`div[role="treeitem"]`).length>1?e:t}function xc(e,t,n,r){let i=n.length>8;n.forEach((e,n)=>{let r=bc(e);i&&n>=8?r.setAttribute(xs,t):r.removeAttribute(xs)});let a=e.querySelector(`:scope > [${bs}="${t}"]`);if(!i){a?.remove();return}if(a===null){a=e.ownerDocument.createElement(`div`),a.setAttribute(bs,t);let n=e.ownerDocument.createElement(`button`);n.type=`button`;let r=a;n.onclick=()=>{let n=dc(t);e.setAttribute(n,String(e.getAttribute(n)!==`true`)),Sc(e,r,t)},a.append(n),e.append(a)}a.dataset.total=String(n.length),a.dataset.collapsedOrder=n[8]?.style.order??String(r+8);let o=[...e.querySelectorAll(`[${Zo}="${t}"]`)].map(e=>Number(e.style.order));t===`group`&&o.push(...[...e.querySelectorAll(`:scope > [${cs}]`)].map(e=>Number(e.style.order))),a.dataset.expandedOrder=String(Math.max(...o)+1),Sc(e,a,t)}function Sc(e,t,n){let r=Number(t.dataset.total??`0`),i=e.getAttribute(dc(n))===`true`;t.style.order=i?t.dataset.expandedOrder??String(r):t.dataset.collapsedOrder??`8`;let a=t.querySelector(`button`);if(a===null)return;a.setAttribute(`aria-expanded`,String(i));let o=i?`收起`:`展开其余 ${String(r-8)} 个会话`;a.textContent!==o&&(a.textContent=o)}function Cc(e,t){let n=t;for(;n?.parentElement!==null&&n.parentElement!==e;)n=n.parentElement;return n?.parentElement===e?n:void 0}function wc(e,t,n,r,i){let a=e.querySelector(`:scope > [${$o}="${t}"]`);if(a===null){a=e.ownerDocument.createElement(`div`),a.setAttribute($o,t);let n=e.ownerDocument.createElement(`button`);n.type=`button`,n.setAttribute(`aria-expanded`,`true`),n.innerHTML=`<span data-chevron aria-hidden>⌄</span><span data-folder-icon aria-hidden></span><strong></strong><small></small>`,n.onclick=()=>{let r=e.getAttribute(`data-dsh-chatroom-${t}-collapsed`)===`true`;e.setAttribute(`data-dsh-chatroom-${t}-collapsed`,String(!r)),n.setAttribute(`aria-expanded`,String(r));let i=n.querySelector(`[data-chevron]`);i!==null&&(i.textContent=r?`⌄`:`›`)},a.append(n),e.append(a)}a.style.order=String(i);let o=a.querySelector(`strong`),s=a.querySelector(`small`),c=a.querySelector(`[data-folder-icon]`);if(c!==null&&c.childElementCount===0){let t=e.querySelector(`div[role="treeitem"][aria-expanded] svg[width="16"]`);t!==null&&c.append(t.cloneNode(!0))}o?.textContent!==n&&(o.textContent=n);let l=String(r);s?.textContent!==l&&(s.textContent=l)}function Tc(e,t){let n=new Map(t.map(e=>[e.peer.participantId,e])),r=new Map(e.map(e=>[e.participantId,e]));for(let e of t)r.set(e.peer.participantId,e.peer);return[...r.values()].sort((e,t)=>{let r=n.get(e.participantId)?.updatedAt??0;return(n.get(t.participantId)?.updatedAt??0)-r||e.displayName.localeCompare(t.displayName,`zh-CN`)})}function Ec(e,t,n,r){let i=new Map([...e.querySelectorAll(`:scope > [${es}]`)].map(e=>[e.dataset.peerId??``,e]));t.forEach((t,a)=>{let o=i.get(t.participantId);o===void 0&&(o=e.ownerDocument.createElement(`div`),o.setAttribute(es,``),o.dataset.peerId=t.participantId,o.innerHTML=`<button type="button"><span data-avatar></span><span><strong></strong><small></small></span></button>`,e.append(o)),i.delete(t.participantId),o.style.order=String(-2900+a),o.dataset.active=String(n.directConversation?.peer.participantId===t.participantId);let s=o.querySelector(`button`);s.setAttribute(`aria-label`,`与 ${t.displayName} 私聊`),s.onclick=()=>{r?.(t.participantId)};let c=o.querySelector(`strong`),l=o.querySelector(`small`);c.textContent!==t.displayName&&(c.textContent=t.displayName);let u=n.directConversations.find(e=>e.peer.participantId===t.participantId),d=u===void 0?`@${t.username}`:Oc(u.updatedAt);l.textContent!==d&&(l.textContent=d),Dc(o.querySelector(`[data-avatar]`),t)});for(let e of i.values())e.remove()}function Dc(e,t){let n=`${t.participantId}:${t.avatarId}:${t.avatarUrl??``}`;if(e.dataset.signature===n)return;e.dataset.signature=n,e.replaceChildren();let r=x(t.avatarId,t.participantId).emoji;if(t.avatarUrl===void 0){e.textContent=r;return}let i=e.ownerDocument.createElement(`img`);i.src=t.avatarUrl,i.alt=``,i.referrerPolicy=`no-referrer`,i.addEventListener(`error`,()=>{i.remove(),e.textContent=r},{once:!0}),e.append(i)}function Oc(e){let t=Math.max(0,Math.floor((Date.now()-e)/6e4));return t<1?`刚刚`:t<60?`${String(t)}分钟`:t<1440?`${String(Math.floor(t/60))}小时`:`${String(Math.floor(t/1440))}天`}function kc(e){e.removeAttribute(Qo),e.removeAttribute(`data-dsh-chatroom-group-collapsed`),e.removeAttribute(`data-dsh-chatroom-solo-collapsed`),e.removeAttribute(`data-dsh-chatroom-direct-collapsed`),e.removeAttribute(dc(`group`)),e.removeAttribute(dc(`solo`));let t=`:scope > [${$o}], :scope > [${es}], :scope > [${bs}], :scope > [${cs}]`;for(let n of e.querySelectorAll(t))n.remove();for(let t of e.querySelectorAll(`[${xs}]`))t.removeAttribute(xs);for(let t of e.querySelectorAll(`[${ls}]`))t.removeAttribute(ls);for(let t of e.querySelectorAll(`[${hs}]`))t.removeAttribute(hs);for(let t of e.querySelectorAll(`[${gs}], [${ts}]`))t.removeAttribute(gs),t.removeAttribute(ts),t.removeAttribute(`data-hidden`),t.style.removeProperty(`order`);for(let t of e.querySelectorAll(`[${_s}]`))t.removeAttribute(_s);for(let t of e.querySelectorAll(`[${vs}]`))t.removeAttribute(vs),t.removeAttribute(ys),t.style.removeProperty(`order`)}function Ac(e,t){let n=e.querySelector(`button[aria-label]`);n!==null&&(n.dataset.dshChatroomNativeMenuRoomId=t.id,n.dataset.dshChatroomNativeMenuBound!==`true`&&(n.dataset.dshChatroomNativeMenuBound=`true`,n.addEventListener(`click`,()=>{Ds=n.dataset.dshChatroomNativeMenuRoomId,Os=void 0})))}function jc(e,t,n){if(Os!==void 0){Os.isConnected||(Os=void 0,Ds=void 0);return}let r=t.rooms.find(e=>e.id===Ds);if(r===void 0)return;let i=[...e.querySelectorAll(`[role="menu"]`)].at(-1)?.querySelector(`:scope > [role="presentation"]`),a=i?.querySelector(`:scope > *`),o=a?.querySelector(`:scope > button[role="menuitem"]`);if(i==null||a==null||o==null)return;let s=e.createElement(a.tagName.toLowerCase());s.className=a.className,s.dataset.dshChatroomPinMenuItem=``;let c=e.createElement(`button`);c.type=`button`,c.role=`menuitem`,c.className=o.className;let l=e.createElement(`span`);l.className=o.querySelector(`:scope > :first-child`)?.className??``;let u=e.createElementNS(`http://www.w3.org/2000/svg`,`svg`);u.setAttribute(`width`,`16`),u.setAttribute(`height`,`16`),u.setAttribute(`viewBox`,`0 0 16 16`);let d=e.createElementNS(`http://www.w3.org/2000/svg`,`path`);d.setAttribute(`d`,`M5 1.75h6l-1 4.1 2 2V9H8.65v5.25h-1.3V9H4V7.85l2-2-1-4.1Z`),d.setAttribute(`fill`,`currentColor`),u.append(d),l.append(u);let f=e.createElement(`span`);f.className=o.querySelector(`:scope > :last-child`)?.className??``,f.textContent=r.pinned===!0?`取消置顶`:`置顶群聊`,c.append(l,f),c.onclick=t=>{t.stopPropagation(),n?.(r.id,r.pinned!==!0),e.dispatchEvent(new KeyboardEvent(`keydown`,{key:`Escape`,bubbles:!0}))},s.append(c),i.append(s),Os=s}let Mc=`data-dsh-chatroom-settings-nav`;function Nc(e){if(typeof document>`u`||typeof MutationObserver>`u`)return()=>void 0;let t=!1,n=()=>{if(t)return;let n=e().trim(),r=document.querySelectorAll(`[role="dialog"] nav button`);for(let e of r)n.length>0&&e.textContent?.trim()===n?e.setAttribute(Mc,``):e.removeAttribute(Mc)};n();let r=new MutationObserver(n);return r.observe(document.body??document.documentElement,{childList:!0,subtree:!0,characterData:!0}),()=>{t=!0,r.disconnect(),document.querySelectorAll(`[${Mc}]`).forEach(e=>{e.removeAttribute(Mc)})}}let Pc=`dsh-chatroom-room`;function Fc(e){let t=new URLSearchParams(e.search),n=t.get(`dsh-chatroom-thread`),r=t.get(`dsh-chatroom-thread-session`),i=t.get(Pc),a=t.get(`dsh-chatroom-parent-session`);if(![n,r,i,a].some(e=>e===null||e===``))return{threadId:n,sessionId:r,roomId:i,parentSessionId:a}}function Ic(e,t){if(t!==void 0)return;let n=new URLSearchParams(e.search).get(Pc);return n===null||n===``?void 0:n}let Lc=[`connection`,`inputTriggers`,`sessions`,`slots`,`workspaces`,`uiWorkspace`,`remote`,`remote.session`],Rc=[];async function zc(e){let n=await g();if(n.auth?.enabled&&!n.auth.authenticated){let e=`${location.pathname}${location.search}`;location.replace(`${h}/auth/page?returnTo=${encodeURIComponent(e)}`);return}e.plugin({name:`chatroom-native-connection`,apply:t.apply});let r=n;e.inject(Lc,e=>{Bc(e,r),r=void 0})}function Bc(e,t){if(e.get(`connection`)===void 0)throw Error(`chatroom: client connection service unavailable`);let n=e.get(`sessions`);if(n===void 0)throw Error(`chatroom: client sessions service unavailable`);let r=e.get(`workspaces`);if(r===void 0)throw Error(`chatroom: client workspaces service unavailable`);let i=e.get(`inputTriggers`);if(i===void 0)throw Error(`chatroom: input trigger service unavailable`);let a=typeof location>`u`?void 0:Fc(location),o=new He(t=>{let r=t,i=n.list.getSnapshot();return _(i)===r||i.byId[r]!==void 0&&(e.uiWorkspace.openSession(r),!0)},a);e.effect(()=>Wo(e.uiWorkspace,r,n,async e=>{let t=o.getSnapshot();if(t.phase===`loading`)throw Error(`chatroom identity is still loading`);let r=t.auth.enabled?await o.reserveSoloSession():void 0;try{let t=await n.create({workspaceId:e,...r===void 0?{}:{sessionId:r}});if(r!==void 0&&String(t)!==r)throw Error(`native Session id does not match its Solo reservation`);return o.registerNewSession(String(t)),t}catch(e){throw r!==void 0&&await o.releaseSoloSession(r),e}}),`chatroom: distinct native New Session`),e.effect(()=>{document.documentElement.setAttribute(`data-dsh-chatroom-installed`,``);let r=document.createElement(`style`);r.dataset.dshChatroomStyles=``,r.textContent=`
/* Keep legacy Chatroom surfaces on the host's current theme, scoped to our UI. */
:where([class*="dsh-chatroom-"], [data-dsh-chatroom-category-header], [data-dsh-chatroom-category-overflow], [data-dsh-chatroom-branch-overflow], [data-dsh-chatroom-direct-row]) {
  --bg-primary: var(--dsw-alias-bg-layer-1, light-dark(#fff, #151517));
  --bg-secondary: var(--dsw-alias-bg-layer-2, light-dark(#f3f4f6, #242426));
  --text-primary: var(--dsw-alias-label-primary, light-dark(#111827, #f9fafb));
  --text-secondary: var(--dsw-alias-label-secondary, light-dark(#6b7280, #aeb0b4));
  --text-tertiary: var(--dsw-alias-label-tertiary, light-dark(#9ca3af, #8e9095));
  --border-primary: var(--dsw-alias-border-l2, light-dark(#e5e7eb, #343438));
  --brand-primary: var(--dsw-alias-brand-primary, #4f7cff);
}
/* Keep AI and people visually distinct in Harness's native @ menu. */
[role="listbox"] [data-source="AI 助手"] { color: var(--brand-primary, #4f7cff); font-weight: 600; }
[role="option"][id^="dsh-slash-option-AI 助手-"] > span:first-child {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  background: var(--brand-primary, #4f7cff);
  color: #fff;
  box-shadow: 0 4px 12px rgb(79 124 255 / 22%);
}
[role="option"][id^="dsh-slash-option-AI 助手-"] > span:nth-child(2) { color: var(--brand-primary, #4f7cff); font-weight: 600; }
[role="listbox"] [data-source="群聊成员"] { margin-top: 2px; border-top: 1px solid var(--border-primary, #e5e7eb); }
[role="option"][id^="dsh-slash-option-群聊成员-"] > .dsh-chatroom-native-mention-avatar {
  position: relative;
  overflow: hidden;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  border-radius: 8px;
}
[role="option"][id^="dsh-slash-option-群聊成员-"] > .dsh-chatroom-native-mention-avatar > img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dsh-chatroom-dialog-layer {
  pointer-events: auto;
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgb(0 0 0 / 28%);
  backdrop-filter: blur(2px);
}

.dsh-chatroom-search-layer {
  pointer-events: auto;
  position: fixed;
  inset: 0;
  z-index: 310;
  display: grid;
  place-items: start center;
  padding: min(12vh, 112px) 24px 24px;
  background: rgb(15 23 42 / 26%);
  backdrop-filter: blur(3px);
}
.dsh-chatroom-search-dialog {
  box-sizing: border-box;
  display: grid;
  grid-template-rows: auto auto minmax(100px, 1fr);
  width: min(680px, calc(100vw - 48px));
  max-height: min(720px, 76vh);
  overflow: hidden;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 18px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  box-shadow: 0 28px 90px rgb(15 23 42 / 24%);
}
.dsh-chatroom-search-dialog > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px 12px;
}
.dsh-chatroom-search-dialog > header > div { display: grid; gap: 2px; }
.dsh-chatroom-search-dialog > header strong { font-size: 20px; }
.dsh-chatroom-search-dialog > header small { color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-search-dialog > header > button {
  border: 0;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  padding: 3px 7px;
  font: inherit;
  font-size: 24px;
  cursor: pointer;
}
.dsh-chatroom-search-input {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  margin: 0 22px 12px;
  border: 1px solid var(--border-primary, #d8dde6);
  border-radius: 12px;
  background: var(--bg-secondary, #f7f8fa);
  padding: 0 12px;
  color: var(--text-secondary, #6b7280);
}
.dsh-chatroom-search-input:focus-within { border-color: var(--brand-primary, #4f7cff); box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary, #4f7cff) 12%, transparent); }
.dsh-chatroom-search-input input { min-width: 0; border: 0; outline: 0; background: transparent; color: var(--text-primary, #111827); padding: 12px 0; font: inherit; }
.dsh-chatroom-search-input button { border: 0; background: transparent; color: inherit; font: inherit; font-size: 18px; cursor: pointer; }
.dsh-chatroom-search-results { min-height: 0; overflow-y: auto; border-top: 1px solid var(--border-primary, #e5e7eb); padding: 8px; }
.dsh-chatroom-search-results > button {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  width: 100%;
  border: 0;
  border-radius: 11px;
  background: transparent;
  color: var(--text-primary, #111827);
  padding: 9px 11px;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.dsh-chatroom-search-results > button:hover,
.dsh-chatroom-search-results > button:focus-visible { outline: 0; background: color-mix(in srgb, var(--brand-primary, #4f7cff) 8%, var(--bg-primary, #fff)); }
.dsh-chatroom-search-result-icon { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; background: color-mix(in srgb, var(--brand-primary, #4f7cff) 9%, var(--bg-secondary, #f3f4f6)); color: var(--brand-primary, #4f7cff); font-size: 12px; font-weight: 650; }
.dsh-chatroom-search-result-copy { display: grid; min-width: 0; gap: 1px; }
.dsh-chatroom-search-result-copy :is(strong, small, span) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-search-result-copy strong { font-size: 14px; }
.dsh-chatroom-search-result-copy small { color: var(--text-secondary, #6b7280); font-size: 11px; }
.dsh-chatroom-search-result-copy > span { color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-search-results time { color: var(--text-tertiary, #9ca3af); font-size: 11px; }
.dsh-chatroom-search-results > p { margin: 28px 12px; color: var(--text-secondary, #6b7280); font-size: 13px; text-align: center; }
[data-dsh-chatroom-search-highlight] { animation: dsh-chatroom-search-highlight 2.4s ease-out; outline: 2px solid var(--brand-primary, #4f7cff); outline-offset: 5px; border-radius: 12px; }
@keyframes dsh-chatroom-search-highlight { 0%, 35% { background: color-mix(in srgb, var(--brand-primary, #4f7cff) 15%, transparent); } 100% { background: transparent; } }

.dsh-chatroom-card {
  position: relative;
  width: min(420px, calc(100vw - 48px));
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 18px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  padding: 28px;
  box-shadow: 0 24px 70px rgb(0 0 0 / 18%);
}

.dsh-chatroom-card h2 { margin: 0 0 10px; font-size: 22px; }
.dsh-chatroom-card p { margin: 0 0 20px; color: var(--text-secondary, #6b7280); line-height: 1.6; }
.dsh-chatroom-card code { color: var(--text-primary, #111827); font-size: .92em; }

.dsh-chatroom-close {
  position: absolute;
  top: 12px;
  right: 14px;
  border: 0;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  font: inherit;
  font-size: 24px;
  cursor: default;
}

.dsh-chatroom-name {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid var(--border-primary, #d1d5db);
  border-radius: 10px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  padding: 11px 13px;
  font: inherit;
  outline: none;
}

.dsh-chatroom-name:focus { border-color: var(--brand-primary, #4f7cff); }

.dsh-chatroom-avatar-fieldset {
  margin: 18px 0 0;
  padding: 0;
  border: 0;
}

.dsh-chatroom-avatar-fieldset legend {
  margin-bottom: 10px;
  color: var(--text-secondary, #6b7280);
  font-size: 13px;
}

.dsh-chatroom-avatar-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.dsh-chatroom-avatar-choice {
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  min-width: 0;
  border: 2px solid transparent;
  border-radius: 13px;
  background: var(--bg-secondary, #f3f4f6);
  padding: 0;
  font-size: 23px;
  cursor: pointer;
}

.dsh-chatroom-avatar-choice[data-selected="true"] {
  border-color: var(--brand-primary, #4f7cff);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand-primary, #4f7cff) 18%, transparent);
}

.dsh-chatroom-button {
  width: 100%;
  margin-top: 14px;
  border: 0;
  border-radius: 10px;
  background: var(--brand-primary, #4f7cff);
  color: #fff;
  padding: 11px 16px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.dsh-chatroom-button:disabled { cursor: not-allowed; opacity: .45; }
.dsh-chatroom-error { margin-top: 12px; color: #d14343; font-size: 13px; }

.dsh-chatroom-room-card { width: min(480px, calc(100vw - 48px)); }

.dsh-chatroom-room-list {
  display: grid;
  gap: 8px;
  max-height: min(340px, 42vh);
  overflow-y: auto;
}

.dsh-chatroom-room-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 10px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  padding: 11px 13px;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.dsh-chatroom-room-item:hover,
.dsh-chatroom-room-item[data-active="true"] {
  border-color: var(--brand-primary, #4f7cff);
  background: color-mix(in srgb, var(--brand-primary, #4f7cff) 7%, transparent);
}

.dsh-chatroom-room-item small { color: var(--text-secondary, #6b7280); }

.dsh-chatroom-create {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  margin-top: 14px;
}

.dsh-chatroom-create-button {
  border: 0;
  border-radius: 10px;
  background: var(--brand-primary, #4f7cff);
  color: #fff;
  padding: 0 18px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.dsh-chatroom-create-button:disabled { cursor: not-allowed; opacity: .45; }

.dsh-chatroom-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  color: var(--text-secondary, #6b7280);
  font-size: 13px;
}

.dsh-chatroom-card-footer button {
  border: 0;
  background: transparent;
  color: var(--brand-primary, #4f7cff);
  padding: 0;
  font: inherit;
  cursor: pointer;
}

.dsh-chatroom-identity-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  padding: 4px 6px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.dsh-chatroom-header-actions { display: inline-flex; align-items: center; gap: 4px; }
.dsh-chatroom-manage-action {
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  padding: 4px 8px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.dsh-chatroom-manage-action:hover { color: var(--brand-primary, #4f7cff); border-color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-manage-action:disabled { cursor: wait; opacity: .58; }

[data-dsh-chatroom-room-row] {
  box-sizing: border-box;
  height: 48px !important;
  min-height: 48px;
  padding-block: 6px !important;
}

[data-dsh-chatroom-room-list],
[data-dsh-chatroom-workspace-categories] { display: flex !important; flex-direction: column; }
[data-dsh-chatroom-hidden-session] { display: none !important; }
[data-dsh-chatroom-workspace-categories] > [data-dsh-chatroom-native-group-section] { display: contents !important; }
[data-dsh-chatroom-native-folder-wrapper][data-hidden="true"] { display: none !important; }
[data-dsh-chatroom-native-overflow-button] { display: none !important; }
[data-dsh-chatroom-workspace-categories]:not([data-dsh-chatroom-group-overflow-expanded="true"]) [data-dsh-chatroom-overflow-row="group"],
[data-dsh-chatroom-workspace-categories]:not([data-dsh-chatroom-solo-overflow-expanded="true"]) [data-dsh-chatroom-overflow-row="solo"] { display: none !important; }
[data-dsh-chatroom-branch-overflow-row] { display: none !important; }
[data-dsh-chatroom-category-overflow] { box-sizing: border-box; width: 100%; padding: 0 8px 2px 22px; }
[data-dsh-chatroom-category-overflow] > button {
  width: 100%;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  padding: 6px 7px;
  font: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}
[data-dsh-chatroom-category-overflow] > button:hover { background: var(--bg-secondary, #f3f4f6); color: var(--text-primary, #111827); }
[data-dsh-chatroom-branch-overflow] { box-sizing: border-box; width: 100%; padding: 0 8px 2px 46px; }
[data-dsh-chatroom-branch-overflow] > button {
  width: 100%;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  padding: 5px 7px;
  font: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}
[data-dsh-chatroom-branch-overflow] > button:hover { background: var(--bg-secondary, #f3f4f6); color: var(--text-primary, #111827); }
[data-dsh-chatroom-sidebar-category] { padding-left: 22px !important; }
[data-dsh-chatroom-category-header] {
  box-sizing: border-box;
  width: 100%;
  min-height: 38px;
  padding: 2px 8px;
}
[data-dsh-chatroom-category-header] > button {
  display: grid;
  grid-template-columns: 14px 20px minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-height: 34px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  padding: 3px 7px;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
[data-dsh-chatroom-category-header] > button:hover { background: var(--bg-secondary, #f3f4f6); color: var(--text-primary, #111827); }
[data-dsh-chatroom-category-header] strong { color: var(--text-primary, #111827); font-size: 13px; font-weight: 600; }
[data-dsh-chatroom-category-header] small { font-size: 11px; }
[data-dsh-chatroom-category-header] [data-folder-icon] { display: inline-flex; width: 17px; height: 17px; align-items: center; }
[data-dsh-chatroom-category-header] [data-folder-icon] svg { display: block; width: 16px; height: 16px; }
[data-dsh-chatroom-group-collapsed="true"] [data-dsh-chatroom-category-wrapper="group"],
[data-dsh-chatroom-group-collapsed="true"] > [data-dsh-chatroom-category-overflow="group"],
[data-dsh-chatroom-group-collapsed="true"] > [data-dsh-chatroom-branch-overflow],
[data-dsh-chatroom-solo-collapsed="true"] [data-dsh-chatroom-category-wrapper="solo"],
[data-dsh-chatroom-solo-collapsed="true"] > [data-dsh-chatroom-category-overflow="solo"],
[data-dsh-chatroom-direct-collapsed="true"] > [data-dsh-chatroom-direct-row] { display: none !important; }

[data-dsh-chatroom-solo-avatar] {
  display: grid;
  flex: 0 0 26px;
  place-items: center;
  width: 26px;
  height: 26px;
  margin-right: 12px;
  border: 1px solid color-mix(in srgb, var(--border-primary, #d8dde6) 70%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-primary, #4f7cff) 3%, var(--bg-primary, #fff));
  color: color-mix(in srgb, var(--brand-primary, #4f7cff) 62%, var(--text-secondary, #7b8491));
  font-size: 12px;
}
[data-dsh-chatroom-direct-row] { box-sizing: border-box; width: 100%; min-height: 48px; padding: 2px 8px 2px 14px; }
[data-dsh-chatroom-direct-row] > button {
  display: grid;
  grid-template-columns: 32px 16px minmax(0, 1fr);
  align-items: center;
  gap: 5px;
  width: 100%;
  min-height: 44px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--text-primary, #111827);
  padding: 5px 8px;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
[data-dsh-chatroom-direct-row] > button::before { content: ""; grid-column: 2; grid-row: 1; }
[data-dsh-chatroom-direct-row] > button:hover,
[data-dsh-chatroom-direct-row][data-active="true"] > button { background: var(--bg-secondary, #f3f4f6); }
[data-dsh-chatroom-direct-row] [data-avatar] {
  display: grid;
  grid-column: 1;
  grid-row: 1;
  place-items: center;
  width: 32px;
  height: 32px;
  overflow: hidden;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-primary, #4f7cff) 10%, var(--bg-primary, #fff));
}
[data-dsh-chatroom-direct-row] [data-avatar] img { width: 100%; height: 100%; object-fit: cover; }
[data-dsh-chatroom-direct-row] button > span:last-child { display: grid; grid-column: 3; grid-row: 1; min-width: 0; }
[data-dsh-chatroom-direct-row] strong,
[data-dsh-chatroom-direct-row] small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
[data-dsh-chatroom-direct-row] strong { font-size: 13px; }
[data-dsh-chatroom-direct-row] small { color: var(--text-secondary, #6b7280); font-size: 11px; }
[data-dsh-chatroom-room-row][data-pinned="true"] [data-dsh-chatroom-group-avatar]::after {
  content: ""; position: absolute; top: -2px; right: -2px; width: 7px; height: 7px; border: 2px solid var(--bg-primary, #fff);
  border-radius: 50%; background: var(--brand-primary, #4f7cff);
}

/* Native session rows reserve a 16px status slot plus a 4px title margin in
   front of the title. Once the chatroom avatar is prepended, the empty slot
   only widens the icon-to-title gap, so collapse it while it holds no dots. */
[data-dsh-chatroom-room-row] > [data-dsh-chatroom-group-avatar] + span:empty,
[data-dsh-chatroom-sidebar-category="solo"] > [data-dsh-chatroom-solo-avatar] + span:empty {
  display: none;
}
[data-dsh-chatroom-room-row] > [data-dsh-chatroom-group-avatar] + span:empty + span,
[data-dsh-chatroom-sidebar-category="solo"] > [data-dsh-chatroom-solo-avatar] + span:empty + span {
  margin-left: 0 !important;
}

[data-dsh-chatroom-group-avatar] {
  position: relative;
  display: grid;
  box-sizing: border-box;
  flex: 0 0 32px;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: 32px;
  height: 32px;
  margin-right: 6px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--border-primary, #d8dde6) 82%, transparent);
  border-radius: 9px;
  background: var(--bg-secondary, #f3f4f6);
  box-shadow: 0 2px 7px rgb(15 23 42 / 8%);
}

[data-dsh-chatroom-group-avatar][data-count="1"] {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

[data-dsh-chatroom-group-avatar][data-count="2"] {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr;
}

[data-dsh-chatroom-group-avatar][data-count="3"],
[data-dsh-chatroom-group-avatar][data-count="4"] {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

[data-dsh-chatroom-group-avatar] > span {
  display: grid;
  place-items: center;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: color-mix(in srgb, var(--bg-primary, #fff) 82%, var(--brand-primary, #4f7cff));
  font-size: 8px;
  line-height: 1;
}

[data-dsh-chatroom-group-avatar] > span > img,
.dsh-chatroom-avatar > img,
.dsh-chatroom-member-avatar > img,
.dsh-chatroom-user-avatar > img,
.dsh-chatroom-direct-avatar > img,
.dsh-chatroom-inline-avatar > img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
}

[data-dsh-chatroom-group-avatar][data-count="1"] > span { font-size: 18px; }
[data-dsh-chatroom-group-avatar][data-count="2"] > span { font-size: 12px; }
[data-dsh-chatroom-group-avatar][data-count="3"] > span,
[data-dsh-chatroom-group-avatar][data-count="4"] > span { font-size: 10px; }

/* Branches share the native sidebar's quiet hierarchy: one compact line,
   a single tree connector, and one clear selected surface. */
[data-dsh-chatroom-branch-row] {
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: auto !important;
  min-height: 36px !important;
  height: 36px !important;
  margin: 0 8px 0 34px !important;
  border: 0;
  border-radius: 8px !important;
  padding: 0 8px !important;
  background: transparent;
  color: var(--dsw-alias-label-secondary, var(--text-secondary, #6b7280)) !important;
  transition: background-color 140ms ease, color 140ms ease;
}
[data-dsh-chatroom-branch-row]:hover {
  background: var(--dsw-alias-fill-tsp-secondary, rgb(127 127 127 / 7%));
  color: var(--dsw-alias-label-primary, var(--text-primary, #111827)) !important;
}
[data-dsh-chatroom-branch-row][aria-selected="true"] {
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) 9%, transparent);
  color: var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff)) !important;
  box-shadow: none;
}
[data-dsh-chatroom-branch-row]:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary, var(--brand-primary, #4f7cff));
  outline-offset: -2px;
}
[data-dsh-chatroom-branch-row]::before {
  position: absolute;
  inset: -1px auto 50% -13px;
  width: 12px;
  border-left: 1px solid var(--dsw-alias-border-l2, var(--border-primary, #d8dde6));
  border-bottom: 1px solid var(--dsw-alias-border-l2, var(--border-primary, #d8dde6));
  border-bottom-left-radius: 6px;
  content: '';
  pointer-events: none;
}
[data-dsh-chatroom-branch-marker] {
  display: inline-flex;
  flex: 0 0 14px;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  margin-right: 7px;
  color: inherit;
  opacity: .65;
  font-size: 14px;
  line-height: 1;
}
[data-dsh-chatroom-branch-surface] { display: flex; flex: 1 1 auto; min-width: 0; align-items: center; }
[data-dsh-chatroom-branch-heading] { display: flex; flex: 1 1 auto; align-items: center; min-width: 0; }
[data-dsh-chatroom-branch-reply-count] { flex: none; margin-left: 8px; color: var(--dsw-alias-label-tertiary, var(--text-tertiary, #8b8f97)); font-size: 11px; font-variant-numeric: tabular-nums; }
[data-dsh-chatroom-branch-topic] {
  min-width: 0;
  overflow: hidden;
  color: inherit;
  font-size: 13px;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
[data-dsh-chatroom-branch-count] { font-variant-numeric: tabular-nums; }
@media (prefers-reduced-motion: reduce) {
  [data-dsh-chatroom-branch-row] { transition: none; }
}

[data-dsh-chatroom-native-branch-title] { display: none !important; }

/* The branch count is enough parent context; an inset stripe reads like a
   selected-row border and makes the sidebar edge visually heavier. */
[data-dsh-chatroom-has-branches] { box-shadow: none !important; }

/* DSH 0.1.x chooses a generic gear for external settings sections. The
   settings-nav helper marks this plugin's row after the dialog mounts, so the
   shell icon can be replaced without reaching into its React tree. */
[data-dsh-chatroom-settings-nav] > svg:first-child { display: none !important; }
[data-dsh-chatroom-settings-nav]::before {
  content: '';
  flex: none;
  width: 16px;
  height: 16px;
  background: currentColor;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='9' cy='7' r='4'/%3E%3Cpath d='M22 21v-2a4 4 0 0 0-3-3.87'/%3E%3Cpath d='M16 3.13a4 4 0 0 1 0 7.75'/%3E%3C/svg%3E") center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='9' cy='7' r='4'/%3E%3Cpath d='M22 21v-2a4 4 0 0 0-3-3.87'/%3E%3Cpath d='M16 3.13a4 4 0 0 1 0 7.75'/%3E%3C/svg%3E") center / contain no-repeat;
}

[data-dsh-chatroom-branch-count] {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  margin-right: 4px;
  color: var(--dsw-alias-label-tertiary, var(--text-tertiary, #8b8f97));
  font-size: 11px;
  line-height: 20px;
}

[data-dsh-chatroom-has-branches]:hover > [data-dsh-chatroom-branch-count],
[data-dsh-chatroom-has-branches]:focus-within > [data-dsh-chatroom-branch-count] {
  display: none;
}

.dsh-chatroom-group-setup {
  display: grid;
  gap: 12px;
  box-sizing: border-box;
  width: 100%;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 16px;
  background: color-mix(in srgb, var(--bg-primary, #fff) 96%, var(--brand-primary, #4f7cff));
  color: var(--text-primary, #111827);
  padding: 14px 16px;
  box-shadow: 0 12px 34px rgb(15 23 42 / 8%);
}
.dsh-chatroom-group-setup-collapsed {
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
}
.dsh-chatroom-group-setup-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: color-mix(in srgb, var(--brand-primary, #4f7cff) 12%, var(--bg-primary, #fff));
  font-size: 21px;
}
.dsh-chatroom-group-setup-collapsed > span:nth-child(2),
.dsh-chatroom-group-setup header > span:first-child { display: grid; gap: 3px; min-width: 0; }
.dsh-chatroom-group-setup strong { font-size: 14px; }
.dsh-chatroom-group-setup small { color: var(--text-secondary, #6b7280); font-size: 12px; line-height: 1.45; }
.dsh-chatroom-group-setup-collapsed > button,
.dsh-chatroom-group-setup-primary {
  border: 0;
  border-radius: 10px;
  background: var(--brand-primary, #4f7cff);
  color: #fff;
  padding: 9px 14px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.dsh-chatroom-group-setup header,
.dsh-chatroom-group-setup footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dsh-chatroom-group-setup header > span:last-child { flex: none; color: var(--brand-primary, #4f7cff); font-size: 12px; }
.dsh-chatroom-group-setup-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.dsh-chatroom-group-setup-fields label { display: grid; gap: 5px; color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-group-setup-fields input {
  min-width: 0;
  border: 1px solid var(--border-primary, #d1d5db);
  border-radius: 10px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  padding: 9px 11px;
  font: inherit;
  font-size: 13px;
  outline: none;
}
.dsh-chatroom-group-setup-fields input:focus { border-color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-group-setup-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px;
  max-height: min(176px, 24vh);
  overflow-y: auto;
}
.dsh-chatroom-group-setup-list > label {
  display: grid;
  grid-template-columns: 18px 36px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  border-radius: 11px;
  padding: 6px 7px;
  cursor: pointer;
}
.dsh-chatroom-group-setup-list > label:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-group-setup-list input { width: 16px; height: 16px; margin: 0; accent-color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-group-setup-list .dsh-chatroom-member-avatar { width: 36px; height: 36px; }
.dsh-chatroom-group-setup-list label > span:last-child { display: grid; min-width: 0; }
.dsh-chatroom-group-setup-list label strong,
.dsh-chatroom-group-setup-list label small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-group-setup-list > p { grid-column: 1 / -1; margin: 12px; color: var(--text-secondary, #6b7280); font-size: 12px; text-align: center; }
.dsh-chatroom-group-setup-secondary {
  border: 0;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  padding: 8px 4px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.dsh-chatroom-group-setup button:disabled { cursor: not-allowed; opacity: .45; }

.dsh-chatroom-new-mode { display: flex; justify-content: center; box-sizing: border-box; width: 100%; padding: 20px; }
[data-dsh-chatroom-new-session-hero] { gap: clamp(20px, 3vh, 30px) !important; }
[data-dsh-chatroom-new-session-hero] > :first-child {
  display: grid !important;
  grid-template-columns: auto auto;
  grid-template-rows: auto auto;
  justify-content: center;
  align-items: center;
  column-gap: 10px;
  row-gap: clamp(16px, 2.5vh, 24px);
  width: 100%;
  height: auto !important;
}
[data-dsh-chatroom-new-session-hero] > :first-child > :first-child {
  grid-column: 1 / -1;
  grid-row: 1;
  justify-self: center;
  width: 68px !important;
  height: 51px !important;
}
[data-dsh-chatroom-new-session-hero] > :first-child > :first-child svg { width: 68px !important; height: auto !important; }
[data-dsh-chatroom-new-session-hero] > :first-child > :nth-child(2) {
  grid-column: 1;
  grid-row: 2;
  font-size: clamp(28px, 3.4vw, 40px) !important;
  font-weight: 650 !important;
  letter-spacing: -.035em;
}
[data-dsh-chatroom-new-session-hero] > :first-child > :nth-child(3) {
  grid-column: 2;
  grid-row: 2;
}
[data-dsh-chatroom-new-session-switch-host] {
  display: flex !important;
  align-self: stretch !important;
  justify-content: center !important;
  box-sizing: border-box;
  width: 100% !important;
  max-width: none !important;
  padding-bottom: 18px;
}
.dsh-chatroom-new-mode-switch {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  box-sizing: border-box;
  width: min(560px, calc(100vw - 48px));
  margin-inline: auto;
  gap: 3px;
  border-radius: 999px;
  background: var(--bg-secondary, #f3f4f6);
  padding: 3px;
  isolation: isolate;
}
.dsh-chatroom-new-mode-switch::before {
  position: absolute;
  z-index: -1;
  top: 3px;
  bottom: 3px;
  left: 3px;
  width: calc(50% - 4.5px);
  border-radius: 999px;
  background: var(--bg-primary, #fff);
  box-shadow: 0 1px 3px rgb(15 23 42 / 8%), 0 8px 24px rgb(15 23 42 / 5%);
  content: '';
  transform: translateX(0);
  transition: transform 220ms cubic-bezier(.22, 1, .36, 1);
}
.dsh-chatroom-new-mode-switch[data-mode="solo"]::before { transform: translateX(calc(100% + 3px)); }
.dsh-chatroom-new-mode-switch > button {
  position: relative;
  z-index: 1;
  min-height: 52px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  padding: 8px 18px;
  font: inherit;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}
.dsh-chatroom-new-mode-switch > button[data-active="true"],
.dsh-chatroom-new-mode-switch > button:hover {
  color: var(--text-primary, #111827);
}
@media (prefers-reduced-motion: reduce) { .dsh-chatroom-new-mode-switch::before { transition: none; } }

.dsh-chatroom-presence-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #a0a7b2;
}

.dsh-chatroom-presence-dot[data-online="true"] { background: #20b26b; }

.dsh-chatroom-participant-message {
  position: relative;
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

[data-chat-flow-kind][data-dsh-chatroom-group-position="middle"],
[data-chat-flow-kind][data-dsh-chatroom-group-position="end"] { margin-top: -12px; }

.dsh-chatroom-participant-message:is([data-dsh-chatroom-group-position="middle"], [data-dsh-chatroom-group-position="end"]) .dsh-chatroom-avatar {
  height: 0;
  overflow: hidden;
  margin-top: 0;
  border-width: 0;
  box-shadow: none;
  visibility: hidden;
}
.dsh-chatroom-participant-message:is([data-dsh-chatroom-group-position="middle"], [data-dsh-chatroom-group-position="end"]) .dsh-chatroom-display-name { display: none; }

.dsh-chatroom-participant-message[data-dsh-chatroom-selection-mode="true"],
:is([data-turn-tail], [data-dsh-chatroom-standalone-assistant])[data-dsh-chatroom-selection-mode] {
  box-sizing: border-box;
  position: relative;
  padding-left: 36px !important;
}

.dsh-chatroom-selection-checkbox {
  position: absolute;
  z-index: 3;
  top: 28px;
  left: 5px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  cursor: pointer;
}

.dsh-chatroom-selection-checkbox input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.dsh-chatroom-selection-checkbox > span {
  display: grid;
  place-items: center;
  box-sizing: border-box;
  width: 19px;
  height: 19px;
  border: 1.5px solid var(--border-strong, #aeb5c0);
  border-radius: 6px;
  background: var(--bg-primary, #fff);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}
.dsh-chatroom-selection-checkbox input:checked + span { border-color: var(--brand-primary, #4f7cff); background: var(--brand-primary, #4f7cff); }
.dsh-chatroom-selection-checkbox input:focus-visible + span { outline: 2px solid color-mix(in srgb, var(--brand-primary, #4f7cff) 35%, transparent); outline-offset: 2px; }

.dsh-chatroom-participant-message[data-dsh-chatroom-own="true"] {
  flex-direction: row-reverse;
}

.dsh-chatroom-avatar {
  display: grid;
  flex: 0 0 38px;
  place-items: center;
  width: 38px;
  height: 38px;
  overflow: hidden;
  margin-top: 20px;
  border: 1px solid rgb(255 255 255 / 70%);
  border-radius: 13px;
  background: linear-gradient(145deg, #eaf2ff, #cbdcff);
  box-shadow: 0 4px 14px rgb(15 23 42 / 10%);
  font-size: 21px;
}

.dsh-chatroom-avatar[data-avatar="panda"],
.dsh-chatroom-avatar[data-avatar="cat"] { background: linear-gradient(145deg, #f6f2ff, #ddd3ff); }
.dsh-chatroom-avatar[data-avatar="fox"],
.dsh-chatroom-avatar[data-avatar="dog"] { background: linear-gradient(145deg, #fff1db, #ffd29b); }
.dsh-chatroom-avatar[data-avatar="rabbit"],
.dsh-chatroom-avatar[data-avatar="unicorn"] { background: linear-gradient(145deg, #ffeaf4, #ffcde4); }
.dsh-chatroom-avatar[data-avatar="octopus"] { background: linear-gradient(145deg, #e8fff6, #bfead9); }
.dsh-chatroom-avatar img,
.dsh-chatroom-member-avatar img {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
  grid-area: 1 / 1;
}
.dsh-chatroom-avatar > span,
.dsh-chatroom-member-avatar > span { grid-area: 1 / 1; }
.dsh-chatroom-avatar img + span,
.dsh-chatroom-member-avatar img + span { visibility: hidden; }

.dsh-chatroom-message-column {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  max-width: calc(100% - 48px);
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="true"] .dsh-chatroom-message-column {
  align-items: flex-end;
}

.dsh-chatroom-display-name {
  max-width: min(525px, 82%);
  padding: 0 4px;
  overflow: hidden;
  color: var(--dsw-alias-label-secondary, var(--text-secondary, #6b7280));
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="true"] .dsh-chatroom-display-name {
  text-align: right;
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="false"] .dsh-chatroom-display-name {
  text-align: left;
}

.dsh-chatroom-native-message {
  width: 100%;
}

.dsh-chatroom-human-bubble {
  display: block;
  box-sizing: border-box;
  width: fit-content;
  max-width: min(525px, 82%);
  border-radius: 16px;
  background: var(--bg-secondary, #f3f4f6);
  padding: 9px 13px;
  color: var(--text-primary, #111827);
  line-height: 1.55;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
.dsh-chatroom-participant-message[data-dsh-chatroom-own="true"] .dsh-chatroom-human-bubble { background: color-mix(in srgb, var(--brand-primary, #4f7cff) 14%, var(--bg-primary, #fff)); }
.dsh-chatroom-human-bubble a,
.dsh-chatroom-direct-messages p a { color: var(--brand-primary, #3478f6); text-decoration: underline; text-underline-offset: 2px; }

.dsh-chatroom-native-message [data-ref-chip][title^="@"] > svg {
  display: none !important;
}

.dsh-chatroom-native-message [data-ref-chip][title^="@"] {
  gap: 0 !important;
}

.dsh-chatroom-native-message [data-ref-chip][title^="@"]::before {
  content: "@";
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="false"] .dsh-chatroom-native-message > div {
  align-items: flex-start !important;
  text-align: left;
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="false"] .dsh-chatroom-native-message > div > :first-child,
.dsh-chatroom-participant-message[data-dsh-chatroom-own="false"] .dsh-chatroom-native-message > div > :first-child > * {
  align-items: flex-start !important;
  align-self: flex-start !important;
}

.dsh-chatroom-participant-message[data-dsh-chatroom-own="true"] .dsh-chatroom-native-message > div {
  align-items: flex-end !important;
}

.dsh-chatroom-native-message [data-clock],
[data-dsh-chatroom-native-actions] > button {
  display: none !important;
}

.dsh-chatroom-participant-message[data-dsh-chatroom-group-position="start"] :is(.dsh-chatroom-human-bubble, .dsh-chatroom-native-message > div > :first-child > :last-child) { border-radius: 16px 16px 5px 5px !important; }
.dsh-chatroom-participant-message[data-dsh-chatroom-group-position="middle"] :is(.dsh-chatroom-human-bubble, .dsh-chatroom-native-message > div > :first-child > :last-child) { border-radius: 5px !important; }
.dsh-chatroom-participant-message[data-dsh-chatroom-group-position="end"] :is(.dsh-chatroom-human-bubble, .dsh-chatroom-native-message > div > :first-child > :last-child) { border-radius: 5px 5px 16px 16px !important; }

.dsh-chatroom-reply-quote {
  display: flex;
  flex-direction: column;
  max-width: min(525px, 82%);
  margin-bottom: 5px;
  border-left: 3px solid var(--brand-primary, #4f7cff);
  border-radius: 0 8px 8px 0;
  background: color-mix(in srgb, var(--brand-primary, #4f7cff) 7%, transparent);
  padding: 6px 10px;
  color: var(--text-secondary, #6b7280);
  font-size: 12px;
  line-height: 18px;
}

.dsh-chatroom-reply-quote span {
  max-width: 420px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dsh-chatroom-message-actions > button {
  border: 0;
  background: transparent;
  color: var(--text-secondary, #7b8491);
  padding: 3px 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  opacity: .72;
}

.dsh-chatroom-message-actions > button:hover { color: var(--brand-primary, #4f7cff); opacity: 1; }
.dsh-chatroom-message-actions, .dsh-chatroom-assistant-actions { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 2px; }
.dsh-chatroom-message-actions { position: relative; }
.dsh-chatroom-message-actions > button,
.dsh-chatroom-inline-reaction-control > button { display: inline-flex; align-items: center; justify-content: center; gap: 5px; min-height: 28px; border-radius: var(--dsw-radius-sm, 6px); }
.dsh-chatroom-action-icon { flex: none; }
.dsh-chatroom-message-actions button:focus-visible { outline: 2px solid var(--dsw-focus-ring-color, #4f7cff); outline-offset: 2px; }
.dsh-chatroom-message-actions button[aria-pressed="true"] { color: var(--dsw-alias-state-business-primary, #4f7cff); }
.dsh-chatroom-inline-time { padding: 3px 4px; color: var(--text-secondary, #7b8491); font-size: 12px; font-weight: 400; opacity: .72; }
.dsh-chatroom-participant-message .dsh-chatroom-message-actions {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}
[data-chat-flow-kind][data-dsh-chatroom-actions-visible="true"] .dsh-chatroom-participant-message .dsh-chatroom-message-actions,
.dsh-chatroom-participant-message[data-dsh-chatroom-actions-visible="true"] .dsh-chatroom-message-actions {
  max-height: 32px;
  overflow: visible;
  opacity: 1;
  pointer-events: auto;
}
.dsh-chatroom-inline-reaction-control { position: relative; display: inline-flex; }
.dsh-chatroom-inline-reaction-control > button {
  border: 0;
  background: transparent;
  color: var(--text-secondary, #7b8491);
  padding: 3px 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  opacity: .72;
}
.dsh-chatroom-inline-reaction-control > button:hover { color: var(--brand-primary, #4f7cff); opacity: 1; }
.dsh-chatroom-action-overflow {
  position: absolute;
  z-index: 18;
  bottom: calc(100% + 5px);
  left: 0;
  display: grid;
  min-width: 196px;
  overflow: hidden;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 12px;
  background: var(--bg-primary, #fff);
  padding: 5px;
  box-shadow: 0 12px 30px rgb(15 23 42 / 18%);
}
.dsh-chatroom-action-overflow > button { border: 0; border-radius: 8px; background: transparent; color: var(--text-primary, #111827); padding: 8px 9px; font: inherit; font-size: 12px; text-align: left; cursor: pointer; }
.dsh-chatroom-action-overflow > button:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-inline-reactions {
  position: absolute;
  z-index: 12;
  bottom: calc(100% + 5px);
  left: 0;
  display: inline-flex;
  gap: 2px;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 12px;
  background: var(--bg-primary, #fff);
  padding: 5px;
  box-shadow: 0 12px 30px rgb(15 23 42 / 18%);
}
.dsh-chatroom-action-overflow > .dsh-chatroom-inline-reactions { position: static; box-sizing: border-box; width: 100%; border: 0; border-bottom: 1px solid var(--border-primary, #e5e7eb); border-radius: 0; box-shadow: none; }
.dsh-chatroom-inline-reactions > button { display: grid; place-items: center; width: 31px; height: 31px; border: 0; border-radius: 8px; background: transparent; font-size: 17px; cursor: pointer; }
.dsh-chatroom-inline-reactions > button:hover { background: var(--bg-secondary, #f3f4f6); transform: scale(1.06); }
.dsh-chatroom-participant-message[data-dsh-chatroom-own="true"] .dsh-chatroom-inline-reactions { right: 0; left: auto; }
.dsh-chatroom-participant-message[data-dsh-chatroom-own="true"] .dsh-chatroom-action-overflow { right: 0; left: auto; }
.dsh-chatroom-assistant-tools {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: min(440px, 76vw);
  padding-top: 8px;
}

html[data-dsh-chatroom-active] [data-dsh-chatroom-native-actions] {
  align-items: flex-start !important;
  height: auto !important;
  min-height: 0 !important;
  overflow: visible !important;
}

.dsh-chatroom-assistant-turn { display: flex; min-width: 0; flex-direction: column; gap: 16px; }
.dsh-chatroom-pending-stream { display: grid; gap: 16px; width: 100%; }
.dsh-chatroom-pending-message { scroll-margin-block: 80px; }
.dsh-chatroom-pending-control {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px 10px;
  max-width: min(525px, 82%);
  padding: 3px 4px 0;
  color: var(--text-secondary, #6b7280);
  font-size: 11px;
}
.dsh-chatroom-pending-control > span:first-child { display: inline-flex; align-items: center; gap: 6px; }
.dsh-chatroom-pending-control i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d89c2c;
  box-shadow: 0 0 0 3px rgb(216 156 44 / 13%);
}
.dsh-chatroom-pending-actions { display: inline-flex; align-items: center; gap: 2px; }
.dsh-chatroom-pending-actions button {
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary, #59616d);
  padding: 3px 5px;
  font: inherit;
  cursor: pointer;
}
.dsh-chatroom-pending-actions button:hover:not(:disabled) { background: var(--bg-secondary, #f3f4f6); color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-pending-actions button:disabled { opacity: .42; cursor: not-allowed; }
.dsh-chatroom-pending-image { display: block; margin-top: 5px; color: var(--text-secondary, #6b7280); font-size: 12px; }
[data-dsh-chatroom-process-row][hidden] { display: none !important; }
.dsh-chatroom-process-toggle {
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: 7px;
  min-height: 26px;
  border: 0;
  background: transparent;
  padding: 0;
  color: var(--text-secondary, #6b7280);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  cursor: pointer;
}
.dsh-chatroom-process-toggle:hover { color: var(--text-primary, #111827); }
.dsh-chatroom-process-chevron { display: inline-block; color: var(--brand-primary, #4f7cff); transform: rotate(-90deg); transition: transform .16s ease; }
.dsh-chatroom-process-toggle[aria-expanded="true"] .dsh-chatroom-process-chevron { transform: rotate(0deg); }

.dsh-chatroom-thread-activity {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: min(440px, 100%);
  margin-top: 7px;
  border: 0;
  border-left: 2px solid color-mix(in srgb, var(--brand-primary, #4f7cff) 45%, transparent);
  border-radius: 0 8px 8px 0;
  background: color-mix(in srgb, var(--bg-secondary, light-dark(#f3f4f6, #1b1b1c)) 58%, transparent);
  padding: 7px 9px;
  color: var(--text-secondary, light-dark(#6b7280, #aeb0b4));
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.dsh-chatroom-assistant-tools > .dsh-chatroom-thread-activity { margin-top: 0; }
.dsh-chatroom-thread-activity:hover { background: var(--bg-secondary, light-dark(#f3f4f6, #2c2c2e)); }
.dsh-chatroom-thread-activity:disabled { cursor: default; }
.dsh-chatroom-thread-activity-heading { font-size: 11px; font-weight: 600; }
.dsh-chatroom-thread-activity-list { display: grid; gap: 3px; }
.dsh-chatroom-thread-activity-list > span { display: grid; grid-template-columns: 22px minmax(44px, 72px) minmax(0, 1fr); gap: 7px; font-size: 11px; line-height: 16px; }
.dsh-chatroom-thread-activity-list .dsh-chatroom-member-avatar { width: 22px; height: 22px; border-radius: 7px; font-size: 12px; }
.dsh-chatroom-thread-activity-list strong,
.dsh-chatroom-thread-activity-list > span > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.dsh-chatroom-toast-stack {
  pointer-events: auto;
  position: fixed;
  top: 76px;
  right: 24px;
  z-index: 75;
  display: grid;
  gap: 10px;
  width: min(360px, calc(100vw - 32px));
}

.dsh-chatroom-toast {
  display: grid;
  gap: 5px;
  width: 100%;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 14px;
  background: color-mix(in srgb, var(--bg-primary, #fff) 94%, transparent);
  color: var(--text-primary, #111827);
  padding: 13px 15px;
  box-shadow: 0 14px 40px rgb(15 23 42 / 16%);
  font: inherit;
  text-align: left;
  cursor: pointer;
  backdrop-filter: blur(14px);
}
.dsh-chatroom-toast strong { font-size: 13px; }
.dsh-chatroom-toast strong small { color: var(--text-secondary, #6b7280); font-weight: 400; }
.dsh-chatroom-toast > span { overflow: hidden; color: var(--text-secondary, #6b7280); font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }

.dsh-chatroom-member-card {
  pointer-events: auto;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 250;
  width: min(460px, 94vw);
  overflow-y: auto;
  box-sizing: border-box;
  border-left: 1px solid var(--border-primary, #e5e7eb);
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  padding: 28px 24px;
  box-shadow: -18px 0 48px rgb(15 23 42 / 14%);
}
.dsh-chatroom-member-card h2 { margin: 0 0 8px; }
.dsh-chatroom-member-card > p { margin: 0 0 18px; color: var(--text-secondary, #6b7280); }
.dsh-chatroom-invite { display: grid; gap: 10px; margin-bottom: 18px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 12px; padding: 12px; }
.dsh-chatroom-invite-heading { display: flex; align-items: start; justify-content: space-between; gap: 12px; }
.dsh-chatroom-invite-heading > div { display: grid; gap: 3px; }
.dsh-chatroom-invite-heading > span { flex: none; color: var(--brand-primary, #4f7cff); font-size: 12px; }
.dsh-chatroom-invite small { color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-invite > input { min-width: 0; border: 1px solid var(--border-primary, #d1d5db); border-radius: 9px; background: var(--bg-primary, #fff); color: var(--text-primary, #111827); padding: 8px 10px; font: inherit; }
.dsh-chatroom-invite-list { display: grid; gap: 3px; max-height: min(240px, 34vh); overflow-y: auto; }
.dsh-chatroom-invite-list > label { display: grid; grid-template-columns: 18px 38px minmax(0, 1fr); align-items: center; gap: 9px; border-radius: 10px; padding: 6px 7px; cursor: pointer; }
.dsh-chatroom-invite-list > label:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-invite-list > label > input { width: 16px; height: 16px; margin: 0; accent-color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-invite-list > label > span:last-child { display: grid; min-width: 0; }
.dsh-chatroom-invite-list > label strong { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-invite-list > p { margin: 8px 0; color: var(--text-secondary, #6b7280); font-size: 12px; text-align: center; }
.dsh-chatroom-invite > button { border: 0; border-radius: 8px; background: var(--brand-primary, #4f7cff); padding: 9px 10px; color: #fff; font: inherit; font-size: 12px; cursor: pointer; }
.dsh-chatroom-invite > button:disabled { cursor: not-allowed; opacity: .45; }
.dsh-chatroom-manage-title { display: grid; grid-template-columns: 1fr auto; gap: 8px; margin-bottom: 14px; }
.dsh-chatroom-manage-title input { min-width: 0; border: 1px solid var(--border-primary, #d1d5db); border-radius: 9px; background: var(--bg-primary, #fff); color: var(--text-primary, #111827); padding: 8px 10px; font: inherit; }
.dsh-chatroom-manage-title button,
.dsh-chatroom-member-role { border: 1px solid var(--border-primary, #e5e7eb); border-radius: 8px; background: var(--bg-secondary, #f3f4f6); color: var(--text-primary, #111827); padding: 6px 9px; font: inherit; font-size: 12px; cursor: pointer; }
.dsh-chatroom-manage-title button:disabled,
.dsh-chatroom-member-role:disabled { cursor: not-allowed; opacity: .45; }
.dsh-chatroom-auto-trigger {
  display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 14px;
  border: 1px solid var(--border-primary, #e5e7eb); border-radius: 12px; padding: 11px 12px;
}
.dsh-chatroom-auto-trigger > div { display: grid; gap: 3px; min-width: 0; }
.dsh-chatroom-auto-trigger small { color: var(--text-secondary, #6b7280); font-size: 12px; line-height: 18px; }
.dsh-chatroom-switch { position: relative; flex: 0 0 auto; width: 38px; height: 22px; cursor: pointer; }
.dsh-chatroom-switch input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.dsh-chatroom-switch span { display: block; width: 100%; height: 100%; border-radius: 999px; background: #cbd0d8; transition: background .16s; }
.dsh-chatroom-switch span::after { content: ""; display: block; width: 18px; height: 18px; border-radius: 50%; background: #fff; transform: translate(2px, 2px); transition: transform .16s; box-shadow: 0 1px 4px rgb(15 23 42 / 18%); }
.dsh-chatroom-switch input:checked + span { background: var(--brand-primary, #4f7cff); }
.dsh-chatroom-switch input:checked + span::after { transform: translate(18px, 2px); }
.dsh-chatroom-switch input:disabled + span { opacity: .5; }
.dsh-chatroom-member-list { display: grid; gap: 5px; max-height: min(440px, 55vh); overflow-y: auto; }
.dsh-chatroom-member {
  display: grid;
  grid-template-columns: 42px 1fr auto;
  align-items: center;
  gap: 11px;
  border-radius: 12px;
  padding: 8px 9px;
}
.dsh-chatroom-member:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-member > span:nth-child(2) { display: grid; gap: 2px; min-width: 0; }
.dsh-chatroom-member strong { overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-member strong em { margin-left: 4px; color: var(--brand-primary, #4f7cff); font-size: 10px; font-style: normal; font-weight: 500; }
.dsh-chatroom-member small { color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-member > i { width: 8px; height: 8px; border-radius: 50%; background: #c4c9d1; }
.dsh-chatroom-member > i[data-online="true"] { background: #20b26b; box-shadow: 0 0 0 3px rgb(32 178 107 / 14%); }
.dsh-chatroom-member-avatar {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  overflow: hidden;
  border-radius: 12px;
  background: linear-gradient(145deg, #eaf2ff, #cbdcff);
  font-size: 20px;
}
.dsh-chatroom-inline-avatar { display: inline-grid; width: 22px; height: 22px; place-items: center; overflow: hidden; border-radius: 7px; vertical-align: middle; }
.dsh-chatroom-notification-button {
  width: 100%;
  margin-top: 14px;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 10px;
  background: var(--bg-secondary, #f3f4f6);
  color: var(--text-primary, #111827);
  padding: 10px 14px;
  font: inherit;
  cursor: pointer;
}
.dsh-chatroom-notification-button:disabled { color: #20a466; cursor: default; }

.dsh-chatroom-thread-layer {
  pointer-events: auto;
  position: fixed;
  inset: 0;
  z-index: 55;
  background: rgb(15 23 42 / 8%);
}
.dsh-chatroom-thread-panel {
  pointer-events: auto;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: grid;
  grid-template-rows: auto 1fr auto;
  width: min(720px, 96vw);
  min-width: 0;
  overflow: hidden;
  border-left: 1px solid var(--border-primary, light-dark(#e5e7eb, #343438));
  background: var(--bg-primary, light-dark(#fff, #151517));
  color: var(--text-primary, light-dark(#111827, #f9fafb));
  box-shadow: -8px 0 32px rgb(15 23 42 / 8%);
}
.dsh-chatroom-thread-panel[data-open="false"] { display: none; }
.dsh-chatroom-thread-native { background: var(--bg-primary, light-dark(#fff, #151517)); display: flex; position: relative; flex-direction: column; min-width: 0; min-height: 0; overflow: hidden; }
.dsh-chatroom-thread-native > [data-conversation-content] { flex: 1; min-height: 0; }
.dsh-chatroom-thread-status { position: absolute; inset: 0; display: grid; place-content: center; gap: 12px; background: var(--bg-primary, light-dark(#fff, #151517)); color: var(--text-secondary, light-dark(#6b7280, #aeb0b4)); font-size: 13px; text-align: center; }
.dsh-chatroom-thread-status strong { color: var(--text-primary, light-dark(#111827, #f9fafb)); font-size: 14px; }
.dsh-chatroom-thread-status small { color: var(--text-tertiary, light-dark(#9ca3af, #8e9095)); font-size: 11px; }
.dsh-chatroom-thread-status button { border: 0; border-radius: 9px; background: var(--brand-primary, #4f7cff); color: #fff; padding: 8px 12px; font: inherit; cursor: pointer; }
.dsh-chatroom-thread-error { display: grid; place-items: center; color: var(--text-secondary, light-dark(#6b7280, #aeb0b4)); }
.dsh-chatroom-thread-panel > header { display: flex; align-items: center; justify-content: space-between; min-height: 64px; border-bottom: 1px solid var(--border-primary, light-dark(#e5e7eb, #343438)); background: var(--bg-primary, light-dark(#fff, #151517)); padding: 0 18px; }
.dsh-chatroom-thread-panel > header div { display: grid; gap: 2px; min-width: 0; }
.dsh-chatroom-thread-header-actions { display: inline-flex; flex: none; gap: 4px; margin-left: 12px; }
.dsh-chatroom-thread-panel > header strong { font-size: 16px; }
.dsh-chatroom-thread-panel > header small { overflow: hidden; color: var(--text-secondary, light-dark(#6b7280, #aeb0b4)); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-thread-panel > header button { flex: none; display: grid; place-items: center; width: 32px; height: 32px; border: 0; border-radius: var(--dsw-radius-sm, 6px); background: transparent; color: var(--text-secondary, light-dark(#6b7280, #aeb0b4)); cursor: pointer; }
.dsh-chatroom-thread-panel > header button:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(128 128 128 / 10%)); }
.dsh-chatroom-thread-panel > header button:focus-visible { outline: 2px solid var(--dsw-focus-ring-color, #4f7cff); outline-offset: 2px; }
.dsh-chatroom-file-card {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(360px, 78vw);
  max-width: 100%;
  min-width: 0;
  margin: 4px 0;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 14px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
  padding: 10px 12px;
  text-decoration: none;
}

.dsh-chatroom-file-card:hover { border-color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-file-icon { font-size: 20px; }
.dsh-chatroom-file-copy { display: flex; flex: 1; flex-direction: column; min-width: 0; }
.dsh-chatroom-file-copy strong { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-file-copy small { color: var(--text-secondary, #6b7280); font-size: 11px; }

.dsh-chatroom-file-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary, #59616d);
  padding: 5px 7px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.dsh-chatroom-file-button:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-file-input { display: none; }

.dsh-chatroom-composer-dock {
  display: grid;
  gap: 7px;
  width: 100%;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 12px;
  background: var(--bg-primary, #fff);
  padding: 9px 11px;
  box-shadow: 0 5px 18px rgb(15 23 42 / 6%);
}

html[data-dsh-chatroom-active] [data-queue-dock] { display: none !important; }
.dsh-chatroom-queued-prompts { display: grid; gap: 7px; }
.dsh-chatroom-queued-prompt {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 4px 12px;
  border-radius: 10px;
  background: var(--bg-secondary, #f3f4f6);
  padding: 8px 10px;
}
.dsh-chatroom-queued-prompt-status {
  display: flex;
  grid-column: 1 / -1;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary, #6b7280);
  font-size: 11px;
}
.dsh-chatroom-queue-dot { width: 6px; height: 6px; border-radius: 50%; background: #d89c2c; box-shadow: 0 0 0 3px rgb(216 156 44 / 13%); }
.dsh-chatroom-queued-prompt-content { min-width: 0; overflow: hidden; color: var(--text-primary, #111827); font-size: 13px; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-queued-prompt-actions { display: flex; align-items: center; gap: 3px; }
.dsh-chatroom-queued-prompt-actions button { border: 0; border-radius: 7px; background: transparent; color: var(--text-secondary, #59616d); padding: 5px 7px; font: inherit; font-size: 11px; cursor: pointer; }
.dsh-chatroom-queued-prompt-actions button:hover:not(:disabled) { background: var(--bg-primary, #fff); color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-queued-prompt-actions button:disabled { opacity: .42; cursor: not-allowed; }

.dsh-chatroom-context-reset {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary, #6b7280);
  font-size: 12px;
}
.dsh-chatroom-context-reset::before,
.dsh-chatroom-context-reset::after { height: 1px; flex: 1; background: var(--border-primary, #e5e7eb); content: ''; }
.dsh-chatroom-context-reset span { color: var(--text-primary, #111827); font-weight: 600; white-space: nowrap; }
.dsh-chatroom-context-reset small { color: inherit; white-space: nowrap; }

.dsh-chatroom-pending-files {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
}

.dsh-chatroom-reply-preview {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  margin: 8px 12px 0;
  border-radius: 8px;
  background: var(--bg-secondary, #f3f4f6);
  color: var(--text-secondary, #6b7280);
  padding: 6px 9px;
}

.dsh-chatroom-reply-preview > span { display: flex; flex: 1; align-items: baseline; min-width: 0; white-space: nowrap; }
.dsh-chatroom-reply-preview strong { flex: none; font-size: 12px; }
.dsh-chatroom-reply-preview small { overflow: hidden; color: inherit; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-reply-preview button,
.dsh-chatroom-pending-file button { border: 0; background: transparent; color: var(--text-secondary, #6b7280); font: inherit; cursor: pointer; }

.dsh-chatroom-pending-file {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 240px;
  border-radius: 8px;
  background: var(--bg-secondary, #f3f4f6);
  padding: 5px 7px;
  font-size: 12px;
}

.dsh-chatroom-pending-file > span:nth-child(2) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-send-files { border: 0; border-radius: 8px; background: var(--brand-primary, #4f7cff); color: #fff; padding: 6px 10px; font: inherit; font-size: 12px; cursor: pointer; }
.dsh-chatroom-send-files:disabled { cursor: wait; opacity: .55; }
.dsh-chatroom-file-hint { color: var(--text-secondary, #6b7280); }
.dsh-chatroom-composer-error { color: #d14343; font-size: 12px; }

.dsh-chatroom-composer-actions { position: relative; display: inline-flex; align-items: center; gap: 2px; }
.dsh-chatroom-session-controls { display: inline-flex; align-items: center; gap: 5px; }
.dsh-chatroom-session-controls button {
  border: 0;
  border-radius: 8px;
  background: transparent;
  padding: 6px 8px;
  color: var(--text-secondary, #59616d);
  font: inherit;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
}
.dsh-chatroom-session-controls button:hover:not(:disabled) { background: var(--bg-secondary, #f3f4f6); color: var(--text-primary, #111827); }
.dsh-chatroom-session-controls button:disabled { opacity: .42; cursor: not-allowed; }
.dsh-chatroom-control-error {
  overflow: hidden;
  max-width: 240px;
  color: #d14343;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-chatroom-session-controls .dsh-chatroom-quick-meeting { color: var(--text-primary, #111827); font-weight: 600; }
.dsh-chatroom-external-card {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
  width: min(620px, 100%);
  margin: 10px 0;
  border: 1px solid var(--border-primary, #dfe3ea);
  border-radius: 16px;
  background: var(--bg-primary, #fff);
  box-shadow: 0 6px 20px rgb(15 23 42 / 6%);
  padding: 14px;
}
.dsh-chatroom-external-icon { display: grid; width: 40px; height: 40px; place-items: center; border-radius: 12px; background: #edf3ff; font-size: 22px; }
.dsh-chatroom-external-copy { display: grid; min-width: 0; gap: 3px; }
.dsh-chatroom-external-copy small,
.dsh-chatroom-external-copy span { overflow: hidden; color: var(--text-secondary, #6b7280); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-external-copy small em { margin-left: 5px; border-radius: 999px; background: #e8f0ff; padding: 2px 6px; color: #356ae6; font-style: normal; font-weight: 600; }
.dsh-chatroom-external-copy strong { overflow: hidden; color: var(--text-primary, #111827); font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-external-card > a { border-radius: 9px; background: #edf3ff; padding: 7px 10px; color: #356ae6; font-size: 12px; font-weight: 600; text-decoration: none; white-space: nowrap; }
.dsh-chatroom-emoji-picker {
  position: absolute;
  z-index: 80;
  bottom: 42px;
  left: 0;
  display: grid;
  grid-template-columns: repeat(6, 36px);
  gap: 4px;
  max-height: min(332px, 48vh);
  overflow-y: auto;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 14px;
  background: var(--bg-primary, #fff);
  padding: 10px;
  box-shadow: 0 14px 36px rgb(15 23 42 / 18%);
}
.dsh-chatroom-emoji-picker button { display: grid; place-items: center; width: 36px; height: 36px; border: 0; border-radius: 9px; background: transparent; font-size: 20px; cursor: pointer; }
.dsh-chatroom-emoji-picker button:hover { background: var(--bg-secondary, #f3f4f6); }

.dsh-chatroom-participant-message[data-dsh-chatroom-selected="true"],
:is([data-turn-tail], [data-dsh-chatroom-standalone-assistant])[data-dsh-chatroom-selected] {
  border-radius: 12px;
  outline: 2px solid color-mix(in srgb, var(--brand-primary, #4f7cff) 45%, transparent);
  outline-offset: 5px;
}

.dsh-chatroom-reaction-bar { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-top: 3px; }
.dsh-chatroom-reaction-bar button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 38px;
  height: 25px;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 13px;
  background: var(--bg-primary, #fff);
  padding: 1px 8px;
  font: inherit;
  cursor: pointer;
}
.dsh-chatroom-reaction-bar button[aria-pressed="true"] { border-color: var(--brand-primary, #4f7cff); background: color-mix(in srgb, var(--brand-primary, #4f7cff) 10%, transparent); }
.dsh-chatroom-reaction-bar small { color: var(--text-secondary, #6b7280); font-size: 11px; }

.dsh-chatroom-context-menu {
  position: fixed;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  width: 228px;
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 13px;
  background: var(--bg-primary, #fff);
  padding: 6px;
  box-shadow: 0 16px 42px rgb(15 23 42 / 22%);
}
.dsh-chatroom-context-menu > button { display: flex; align-items: center; gap: 9px; border: 0; border-radius: 8px; background: transparent; padding: 9px 10px; color: var(--text-primary, #111827); font: inherit; font-size: 13px; text-align: left; cursor: pointer; }
.dsh-chatroom-context-menu > button:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-context-reactions { display: grid; grid-template-columns: repeat(6, 1fr); gap: 2px; margin-bottom: 5px; border-bottom: 1px solid var(--border-primary, #e5e7eb); padding-bottom: 6px; }
.dsh-chatroom-context-reactions button { display: grid; place-items: center; width: 34px; height: 34px; border: 0; border-radius: 8px; background: transparent; font-size: 18px; cursor: pointer; }
.dsh-chatroom-context-reactions button:hover { background: var(--bg-secondary, #f3f4f6); transform: scale(1.08); }

.dsh-chatroom-forward-card { width: min(460px, 82vw); margin-top: 6px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 13px; background: var(--bg-primary, #fff); overflow: hidden; }
.dsh-chatroom-forward-card summary { display: flex; flex-direction: column; gap: 2px; padding: 12px 14px; cursor: pointer; list-style: none; }
.dsh-chatroom-forward-card summary::-webkit-details-marker { display: none; }
.dsh-chatroom-forward-card summary small { color: var(--text-secondary, #6b7280); font-size: 11px; }
.dsh-chatroom-forward-card > div { max-height: 360px; overflow-y: auto; border-top: 1px solid var(--border-primary, #e5e7eb); padding: 4px 14px; }
.dsh-chatroom-forward-card article { padding: 10px 0; border-bottom: 1px solid var(--border-primary, #e5e7eb); }
.dsh-chatroom-forward-card article:last-child { border-bottom: 0; }
.dsh-chatroom-forward-card article strong { display: flex; justify-content: space-between; gap: 12px; font-size: 12px; }
.dsh-chatroom-forward-card article time { color: var(--text-secondary, #6b7280); font-weight: 400; }
.dsh-chatroom-forward-card article p { margin: 4px 0 0; color: var(--text-primary, #111827); font-size: 13px; line-height: 1.45; }
.dsh-chatroom-forward-text { white-space: pre-wrap; }
.dsh-chatroom-forward-image { display: block; width: min(100%, 360px); max-height: 320px; margin-top: 7px; border-radius: 10px; object-fit: contain; background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-forward-image-error { display: block; margin-top: 7px; color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-forward-reply { display: grid; gap: 2px; margin-top: 6px; border-left: 2px solid var(--brand-primary, #4f7cff); padding-left: 8px; color: var(--text-secondary, #6b7280); font-size: 11px; }
.dsh-chatroom-forward-reply span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-forward-reactions { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 7px; }
.dsh-chatroom-forward-reactions span { border: 1px solid var(--border-primary, #e5e7eb); border-radius: 999px; padding: 2px 7px; font-size: 11px; }
.dsh-chatroom-recalled-message { color: var(--text-tertiary, #8b919c); font-size: 13px; font-style: italic; }

.dsh-chatroom-selection-bar { position: fixed; z-index: 170; bottom: 92px; left: 50%; display: flex; align-items: center; gap: 10px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 14px; background: var(--bg-primary, #fff); padding: 9px 12px; box-shadow: 0 12px 34px rgb(15 23 42 / 18%); transform: translateX(-50%); }
.dsh-chatroom-selection-bar strong { margin-right: 8px; font-size: 13px; }
.dsh-chatroom-selection-bar button { border: 0; border-radius: 8px; background: var(--bg-secondary, #f3f4f6); padding: 7px 10px; font: inherit; cursor: pointer; }
.dsh-chatroom-selection-bar button:first-of-type { background: var(--brand-primary, #4f7cff); color: #fff; }
.dsh-chatroom-selection-bar button:disabled { cursor: not-allowed; opacity: .45; }

.dsh-chatroom-forward-layer { z-index: 190; }
.dsh-chatroom-forward-dialog { width: min(440px, calc(100vw - 48px)); }
.dsh-chatroom-forward-targets { display: flex; flex-direction: column; gap: 7px; max-height: 360px; overflow-y: auto; }
.dsh-chatroom-forward-targets > button { display: grid; grid-template-columns: 28px 1fr auto; align-items: center; gap: 8px; width: 100%; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 10px; background: var(--bg-primary, #fff); padding: 10px; color: var(--text-primary, #111827); font: inherit; text-align: left; cursor: pointer; }
.dsh-chatroom-forward-targets > button:hover { border-color: var(--brand-primary, #4f7cff); background: color-mix(in srgb, var(--brand-primary, #4f7cff) 6%, transparent); }
.dsh-chatroom-forward-targets small { color: var(--text-secondary, #6b7280); }
.dsh-chatroom-forward-empty { border-radius: 10px; background: var(--bg-secondary, #f3f4f6); padding: 18px; color: var(--text-secondary, #6b7280); text-align: center; }

.dsh-chatroom-auth-card { width: min(460px, calc(100vw - 32px)); padding: 32px; }
.dsh-chatroom-auth-card form, .dsh-chatroom-auth-card form > label { display: grid; gap: 7px; }
.dsh-chatroom-auth-card form { gap: 14px; }
.dsh-chatroom-auth-card input, .dsh-chatroom-admin-form input, .dsh-chatroom-admin-form select {
  width: 100%; box-sizing: border-box; border: 1px solid var(--border-primary, #d8dee9); border-radius: 10px;
  background: var(--bg-primary, #fff); padding: 10px 12px; color: var(--text-primary, #111827); font: inherit;
}
.dsh-chatroom-auth-brand { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 1px solid var(--border-primary, #e5e7eb); padding-bottom: 16px; }
.dsh-chatroom-auth-brand strong { font-size: 18px; }
.dsh-chatroom-auth-brand span, .dsh-chatroom-sso-list > span { color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-auth-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 14px; border-radius: 11px; background: var(--bg-secondary, #f3f4f6); padding: 4px; }
.dsh-chatroom-auth-tabs button { border: 0; border-radius: 8px; background: transparent; padding: 8px; font: inherit; cursor: pointer; }
.dsh-chatroom-auth-tabs button[data-active="true"] { background: var(--bg-primary, #fff); box-shadow: 0 1px 4px rgb(15 23 42 / 10%); }
.dsh-chatroom-sso-list { display: grid; gap: 8px; margin-top: 18px; text-align: center; }
.dsh-chatroom-sso-list a { border: 1px solid var(--border-primary, #d8dee9); border-radius: 10px; padding: 10px; color: var(--text-primary, #111827); text-decoration: none; }
.dsh-chatroom-card-footer > div { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }

.dsh-chatroom-settings {
  display: flex; min-width: 0; max-width: 720px; flex-direction: column; gap: 20px; width: 100%; box-sizing: border-box;
  padding-bottom: 32px; overflow-x: clip; color: var(--dsw-alias-label-primary);
}
.dsh-chatroom-settings-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.dsh-chatroom-settings-header > div { min-width: 0; }
.dsh-chatroom-settings-header h2, .dsh-chatroom-settings-header p { margin: 0; }
.dsh-chatroom-settings-header h2 { font-size: 16px; line-height: 24px; font-weight: 500; }
.dsh-chatroom-settings-header p { margin-top: 2px; color: var(--dsw-alias-label-tertiary); font-size: 14px; line-height: 22px; }
.dsh-chatroom-settings-header button {
  flex: none; height: 36px; box-sizing: border-box; border: 1px solid var(--dsw-alias-border-l2); border-radius: 18px;
  background: transparent; padding: 0 14px; color: var(--dsw-alias-label-primary); font: inherit; font-size: 14px; cursor: pointer;
}
.dsh-chatroom-settings-header button:hover { background: var(--dsw-alias-interactive-bg-hover-solid); }

.dsh-chatroom-account-layer { z-index: 255; }
.dsh-chatroom-account-card { width: min(460px, calc(100vw - 32px)); padding: 0; overflow: hidden; }
.dsh-chatroom-account-card > header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-primary, #e5e7eb); padding: 18px 22px; }
.dsh-chatroom-account-card > header h2, .dsh-chatroom-account-card > header p { margin: 0; }
.dsh-chatroom-account-card > header p { margin-top: 3px; color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-account-card > header button { border: 0; background: transparent; color: var(--text-secondary, #6b7280); font-size: 25px; cursor: pointer; }
.dsh-chatroom-account-card > form { margin: 20px 22px; }
.dsh-chatroom-account-card > .dsh-chatroom-error { margin: 0 22px 20px; }

.dsh-chatroom-admin-layer { z-index: 260; }
.dsh-chatroom-admin-card { width: min(1080px, calc(100vw - 40px)); max-height: calc(100vh - 40px); padding: 0; overflow: hidden; }
.dsh-chatroom-admin-card > header, .dsh-chatroom-direct-panel > header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-primary, #e5e7eb); padding: 18px 22px; }
.dsh-chatroom-admin-card > header h2, .dsh-chatroom-admin-card > header p { margin: 0; }
.dsh-chatroom-admin-card > header p { margin-top: 3px; color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-admin-card > header button, .dsh-chatroom-direct-panel > header button { border: 0; background: transparent; color: var(--text-secondary, #6b7280); font-size: 25px; cursor: pointer; }
.dsh-chatroom-admin-layout { display: grid; grid-template-columns: minmax(280px, .8fr) minmax(360px, 1.2fr); gap: 22px; max-height: calc(100vh - 122px); overflow-y: auto; padding: 20px 22px 28px; }
.dsh-chatroom-admin-layout section { min-width: 0; }
.dsh-chatroom-admin-layout h3 { margin: 10px 0 12px; font-size: 15px; }
.dsh-chatroom-admin-form { display: grid; gap: 9px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 13px; padding: 13px; }
.dsh-chatroom-admin-form > button, .dsh-chatroom-user-table button, .dsh-chatroom-provider-list button { border: 0; border-radius: 8px; background: var(--brand-primary, #4f7cff); padding: 8px 10px; color: #fff; font: inherit; cursor: pointer; }
.dsh-chatroom-toggle { display: flex; align-items: center; gap: 8px; color: var(--text-secondary, #6b7280); font-size: 13px; }
.dsh-chatroom-toggle input { width: auto; }
.dsh-chatroom-mini-avatars { display: flex; flex-wrap: wrap; gap: 4px; }
.dsh-chatroom-mini-avatars button { width: 31px; height: 31px; border: 1px solid transparent; border-radius: 8px; background: var(--bg-secondary, #f3f4f6); cursor: pointer; }
.dsh-chatroom-mini-avatars button[data-selected="true"] { border-color: var(--brand-primary, #4f7cff); }
.dsh-chatroom-user-table, .dsh-chatroom-provider-list { display: grid; gap: 7px; }
.dsh-chatroom-user-table > div { display: grid; grid-template-columns: 36px minmax(110px, 1fr) 118px auto; align-items: center; gap: 8px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 11px; padding: 8px 10px; }
.dsh-chatroom-user-table > div[data-disabled="true"] { opacity: .55; }
.dsh-chatroom-user-table > div > span:first-child { display: grid; place-items: center; width: 34px; height: 34px; overflow: hidden; border-radius: 9px; background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-user-table > div > span:nth-child(2) { display: grid; }
.dsh-chatroom-user-table small, .dsh-chatroom-provider-list small { color: var(--text-secondary, #6b7280); }
.dsh-chatroom-user-table select { min-width: 0; border: 1px solid var(--border-primary, #d8dee9); border-radius: 8px; background: var(--bg-primary, #fff); padding: 7px; }
.dsh-chatroom-user-table button, .dsh-chatroom-provider-list button { background: var(--bg-secondary, #f3f4f6); color: var(--text-primary, #111827); }
.dsh-chatroom-provider-section { grid-column: 1 / -1; }
.dsh-chatroom-admin-field { display: grid; gap: 7px; max-width: 520px; color: var(--text-secondary, #6b7280); font-size: 13px; }
.dsh-chatroom-admin-field select { border: 1px solid var(--border-primary, #d8dee9); border-radius: 9px; background: var(--bg-primary, #fff); padding: 9px 11px; color: var(--text-primary, #111827); font: inherit; }
.dsh-chatroom-provider-form { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.dsh-chatroom-provider-form > button { grid-column: 1 / -1; }
.dsh-chatroom-callback { overflow-wrap: anywhere; color: var(--text-secondary, #6b7280); font-size: 12px; }
.dsh-chatroom-provider-list { margin-top: 10px; }
.dsh-chatroom-provider-list > div { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 8px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 10px; padding: 9px 11px; }
.dsh-chatroom-provider-list span { display: grid; overflow: hidden; }
.dsh-chatroom-provider-list small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-panel-status { padding: 40px; color: var(--text-secondary, #6b7280); text-align: center; }

/* Native Settings section: one bounded column, the same label hierarchy,
   module fills, hairlines, and capsule actions as Models and Agent presets. */
.dsh-chatroom-settings > .dsh-chatroom-card {
  position: static; width: 100%; min-width: 0; max-height: none; box-sizing: border-box; border: 0; border-radius: 0;
  background: transparent; padding: 0; color: var(--dsw-alias-label-primary); box-shadow: none; overflow: visible;
}
.dsh-chatroom-settings .dsh-chatroom-automation-card > header,
.dsh-chatroom-settings .dsh-chatroom-prompt-card > header {
  border-bottom: 1px solid var(--dsw-alias-border-l2); padding-bottom: 12px;
}
.dsh-chatroom-settings .dsh-chatroom-automation-card > header h2,
.dsh-chatroom-settings .dsh-chatroom-automation-card > header p,
.dsh-chatroom-settings .dsh-chatroom-prompt-card > header h2,
.dsh-chatroom-settings .dsh-chatroom-prompt-card > header p { margin: 0; }
.dsh-chatroom-settings .dsh-chatroom-automation-card > header h2,
.dsh-chatroom-settings .dsh-chatroom-prompt-card > header h2 { font-size: 14px; line-height: 22px; font-weight: 500; }
.dsh-chatroom-settings .dsh-chatroom-automation-card > header p,
.dsh-chatroom-settings .dsh-chatroom-prompt-card > header p { margin-top: 1px; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
.dsh-chatroom-automation-form { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 10px; padding-top: 12px; }
.dsh-chatroom-automation-form label { display: grid; gap: 6px; color: var(--dsw-alias-label-secondary); font-size: 12px; }
.dsh-chatroom-automation-form select { min-width: 0; height: 38px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 9px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); padding: 0 10px; font: inherit; }
.dsh-chatroom-automation-form button { height: 38px; border: 0; border-radius: 9px; background: var(--dsw-alias-brand-primary); color: #fff; padding: 0 14px; font: inherit; cursor: pointer; }
.dsh-chatroom-automation-form button:disabled { cursor: default; opacity: .4; }
.dsh-chatroom-automation-form > small { grid-column: 1 / -1; color: var(--dsw-alias-label-tertiary); }
.dsh-chatroom-prompt-form { display: grid; gap: 14px; padding-top: 12px; }
.dsh-chatroom-prompt-form label { display: grid; gap: 6px; color: var(--dsw-alias-label-secondary); font-size: 12px; }
.dsh-chatroom-prompt-form textarea {
  width: 100%; min-height: 116px; resize: vertical; box-sizing: border-box; border: 1px solid var(--dsw-alias-border-l2); border-radius: 9px;
  background: var(--dsw-alias-bg-layer-1); padding: 10px 11px; color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; line-height: 20px; outline: none;
}
.dsh-chatroom-prompt-form textarea:focus { border-color: var(--dsw-alias-label-primary); box-shadow: 0 0 0 1px var(--dsw-alias-label-primary); }
.dsh-chatroom-prompt-form label small,
.dsh-chatroom-prompt-card > small { color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
.dsh-chatroom-prompt-form > button {
  justify-self: start; height: 36px; border: 0; border-radius: 18px; background: var(--dsw-alias-button-primary-fill); padding: 0 15px;
  color: var(--dsw-alias-label-primary-foreground); font: inherit; font-size: 14px; cursor: pointer;
}
.dsh-chatroom-prompt-form > button:hover:not(:disabled) { background: var(--dsw-alias-button-primary-hover); }
.dsh-chatroom-prompt-form > button:disabled { cursor: default; opacity: .4; }
.dsh-chatroom-settings .dsh-chatroom-account-card > header,
.dsh-chatroom-settings .dsh-chatroom-admin-card > header {
  align-items: flex-start; border: 0; border-bottom: 1px solid var(--dsw-alias-border-l2); padding: 0 0 12px;
}
.dsh-chatroom-settings .dsh-chatroom-account-card > header h2,
.dsh-chatroom-settings .dsh-chatroom-admin-card > header h2 {
  margin: 0; color: var(--dsw-alias-label-primary); font-size: 14px; line-height: 22px; font-weight: 500;
}
.dsh-chatroom-settings .dsh-chatroom-account-card > header p,
.dsh-chatroom-settings .dsh-chatroom-admin-card > header p {
  margin: 1px 0 0; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px;
}
.dsh-chatroom-settings .dsh-chatroom-account-card > form {
  margin: 12px 0 0;
}
.dsh-chatroom-settings .dsh-chatroom-admin-layout {
  display: flex; max-height: none; flex-direction: column; gap: 28px; overflow: visible; padding: 16px 0 0;
}
.dsh-chatroom-settings .dsh-chatroom-admin-layout > section {
  display: flex; min-width: 0; flex-direction: column; gap: 10px;
}
.dsh-chatroom-settings .dsh-chatroom-admin-layout > section + section {
  border-top: 1px solid var(--dsw-alias-border-l2); padding-top: 24px;
}
.dsh-chatroom-settings .dsh-chatroom-admin-layout h3 {
  margin: 0; color: var(--dsw-alias-label-primary); font-size: 14px; line-height: 22px; font-weight: 500;
}
.dsh-chatroom-settings .dsh-chatroom-admin-layout h3:not(:first-child) { margin-top: 10px; }
.dsh-chatroom-settings .dsh-chatroom-admin-form {
  display: grid; min-width: 0; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 14px; border: 0;
  border-radius: 12px; background: var(--dsw-alias-bg-module-platform); padding: 14px 16px;
}
.dsh-chatroom-settings .dsh-chatroom-admin-form > label:not(.dsh-chatroom-toggle) {
  display: flex; min-width: 0; flex-direction: column; gap: 6px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 18px;
}
.dsh-chatroom-settings .dsh-chatroom-admin-form input:not([type="checkbox"]),
.dsh-chatroom-settings .dsh-chatroom-admin-form select,
.dsh-chatroom-settings .dsh-chatroom-admin-field select,
.dsh-chatroom-settings .dsh-chatroom-user-table select {
  width: 100%; min-width: 0; height: 36px; box-sizing: border-box; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px;
  background: var(--dsw-alias-bg-layer-3); padding: 0 11px; color: var(--dsw-alias-label-primary); font: inherit; font-size: 14px; outline: none;
}
.dsh-chatroom-settings .dsh-chatroom-admin-form input:focus,
.dsh-chatroom-settings .dsh-chatroom-admin-form select:focus,
.dsh-chatroom-settings .dsh-chatroom-admin-field select:focus,
.dsh-chatroom-settings .dsh-chatroom-user-table select:focus {
  border-color: var(--dsw-alias-label-primary); box-shadow: 0 0 0 1px var(--dsw-alias-label-primary);
}
.dsh-chatroom-settings .dsh-chatroom-admin-form > button {
  justify-self: start; min-width: 92px; height: 36px; box-sizing: border-box; border: 0; border-radius: 18px;
  background: var(--dsw-alias-button-primary-fill); padding: 0 14px; color: var(--dsw-alias-label-primary-foreground); font: inherit; font-size: 14px;
}
.dsh-chatroom-settings .dsh-chatroom-admin-form > button:hover:not(:disabled) { background: var(--dsw-alias-button-primary-hover); }
.dsh-chatroom-settings .dsh-chatroom-admin-form > button:disabled { cursor: default; opacity: .4; }
.dsh-chatroom-settings .dsh-chatroom-toggle {
  min-width: 0; color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 20px;
}
.dsh-chatroom-settings .dsh-chatroom-toggle input { accent-color: var(--dsw-alias-brand-primary); }
.dsh-chatroom-settings-avatar-field { min-width: 0; margin: 0; border: 0; padding: 0; }
.dsh-chatroom-settings-avatar-field legend { margin-bottom: 6px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 18px; }
.dsh-chatroom-settings .dsh-chatroom-mini-avatars button {
  border-radius: 8px; background: var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-primary);
}
.dsh-chatroom-settings .dsh-chatroom-mini-avatars button[data-selected="true"] {
  border-color: var(--dsw-alias-brand-primary); box-shadow: 0 0 0 1px var(--dsw-alias-brand-primary);
}
.dsh-chatroom-settings .dsh-chatroom-user-table,
.dsh-chatroom-settings .dsh-chatroom-provider-list { gap: 8px; }
.dsh-chatroom-settings .dsh-chatroom-user-table > div,
.dsh-chatroom-settings .dsh-chatroom-provider-list > div {
  min-width: 0; box-sizing: border-box; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px;
  background: transparent; padding: 10px 12px;
}
.dsh-chatroom-settings .dsh-chatroom-user-table > div {
  grid-template-columns: 36px minmax(0, 1fr) auto;
}
.dsh-chatroom-settings .dsh-chatroom-user-table > div > span:first-child { background: var(--dsw-alias-bg-module-platform); }
.dsh-chatroom-settings .dsh-chatroom-user-table > div > span:nth-child(2) { min-width: 0; }
.dsh-chatroom-settings .dsh-chatroom-user-table strong,
.dsh-chatroom-settings .dsh-chatroom-provider-list strong { font-size: 14px; line-height: 22px; font-weight: 500; }
.dsh-chatroom-settings .dsh-chatroom-user-table small,
.dsh-chatroom-settings .dsh-chatroom-provider-list small { color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
.dsh-chatroom-user-actions, .dsh-chatroom-provider-actions { display: flex; align-items: center; gap: 6px; }
.dsh-chatroom-settings .dsh-chatroom-user-actions select { width: 118px; }
.dsh-chatroom-settings .dsh-chatroom-user-actions button,
.dsh-chatroom-settings .dsh-chatroom-provider-actions button {
  height: 28px; box-sizing: border-box; border: 0; border-radius: 14px; background: transparent; padding: 0 10px;
  color: var(--dsw-alias-label-primary); font: inherit; font-size: 12px; cursor: pointer;
}
.dsh-chatroom-settings .dsh-chatroom-user-actions button:hover,
.dsh-chatroom-settings .dsh-chatroom-provider-actions button:hover { background: var(--dsw-alias-interactive-bg-hover-solid); }
.dsh-chatroom-settings .dsh-chatroom-admin-field { max-width: none; color: var(--dsw-alias-label-secondary); }
.dsh-chatroom-settings .dsh-chatroom-callback {
  margin: 0; overflow-wrap: anywhere; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px;
}
.dsh-chatroom-settings .dsh-chatroom-callback code { color: var(--dsw-alias-label-secondary); }
.dsh-chatroom-settings .dsh-chatroom-provider-section { grid-column: auto; }
.dsh-chatroom-settings .dsh-chatroom-provider-form { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.dsh-chatroom-settings .dsh-chatroom-provider-form > button { grid-column: 1 / -1; }
.dsh-chatroom-settings .dsh-chatroom-provider-list > div { grid-template-columns: minmax(0, 1fr) auto; }
.dsh-chatroom-settings .dsh-chatroom-provider-list span { min-width: 0; }
.dsh-chatroom-settings .dsh-chatroom-provider-list small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-settings > .dsh-chatroom-error { color: var(--dsw-alias-state-error-primary); }

[data-dsh-chatroom-direct-host] { position: relative !important; overflow: hidden !important; }
[data-dsh-chatroom-direct-host] > :not(.dsh-chatroom-direct-panel) { visibility: hidden !important; pointer-events: none !important; }
.dsh-chatroom-direct-panel {
  position: fixed;
  z-index: 250;
  inset: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  min-width: 0;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #111827);
}
[data-dsh-chatroom-direct-host] > .dsh-chatroom-direct-panel { position: absolute; z-index: 5; }
.dsh-chatroom-direct-panel > header {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  align-items: center;
  gap: 11px;
  min-height: 68px;
  border-bottom: 1px solid var(--border-primary, #e5e7eb);
  padding: 0 24px;
}
.dsh-chatroom-direct-panel > header > div { display: grid; gap: 1px; }
.dsh-chatroom-direct-panel > header strong { font-size: 15px; }
.dsh-chatroom-direct-panel > header small { overflow: hidden; color: var(--text-secondary, #6b7280); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-direct-header-avatar,
.dsh-chatroom-direct-message-avatar { display: grid; place-items: center; overflow: hidden; background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-direct-header-avatar { width: 38px; height: 38px; border-radius: 11px; }
.dsh-chatroom-direct-message-avatar { flex: 0 0 38px; width: 38px; height: 38px; border-radius: 12px; }
.dsh-chatroom-direct-header-avatar img,
.dsh-chatroom-direct-message-avatar img { width: 100%; height: 100%; object-fit: cover; }
.dsh-chatroom-direct-messages {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  min-height: 0;
  flex-direction: column;
  gap: 22px;
  overflow-y: auto;
  padding: 30px max(24px, calc((100% - 920px) / 2)) 120px;
}
.dsh-chatroom-direct-messages > .dsh-chatroom-direct-message { max-width: min(76%, 720px); }
.dsh-chatroom-direct-messages > .dsh-chatroom-direct-message:is([data-dsh-chatroom-group-position="middle"], [data-dsh-chatroom-group-position="end"]) { margin-top: -18px; }
.dsh-chatroom-direct-messages > .dsh-chatroom-direct-message[data-own="true"] { align-self: flex-end; text-align: right; }
.dsh-chatroom-direct-reply-quote {
  display: grid;
  gap: 2px;
  max-width: 520px;
  border-left: 3px solid var(--brand-primary, #4f7cff);
  border-radius: 0 8px 8px 0;
  background: color-mix(in srgb, var(--brand-primary, #4f7cff) 7%, transparent);
  padding: 6px 9px;
  color: var(--text-secondary, #6b7280);
  font-size: 12px;
  text-align: left;
}
.dsh-chatroom-direct-reply-quote span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-direct-media { display: grid; gap: 8px; margin: 4px 0; }
.dsh-chatroom-direct-media > a:not(.dsh-chatroom-direct-file) { display: block; overflow: hidden; border-radius: 14px; }
.dsh-chatroom-direct-media img { display: block; max-width: min(420px, 100%); max-height: 340px; object-fit: contain; }
.dsh-chatroom-direct-file {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  min-width: min(320px, 65vw);
  border: 1px solid var(--border-primary, #dfe3ea);
  border-radius: 13px;
  background: var(--bg-primary, #fff);
  padding: 10px 12px;
  color: var(--text-primary, #111827);
  text-align: left;
  text-decoration: none;
}
.dsh-chatroom-direct-file > span:nth-child(2) { display: grid; min-width: 0; }
.dsh-chatroom-direct-file strong { overflow: hidden; color: inherit !important; font-size: 13px !important; font-weight: 600 !important; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-direct-file small { color: var(--text-secondary, #6b7280); font-size: 11px; }
.dsh-chatroom-direct-composer {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  box-sizing: border-box;
  width: calc(100% - 48px);
  min-height: 112px;
  margin: 0 auto 18px;
  border: 1px solid var(--border-primary, #dfe3ea);
  border-radius: 22px;
  background: var(--bg-primary, #fff);
  box-shadow: 0 8px 28px rgb(15 23 42 / 8%);
  padding: 13px 14px 10px 18px;
}
.dsh-chatroom-direct-composer-reply {
  display: flex;
  align-items: center;
  gap: 8px;
  border-left: 3px solid var(--brand-primary, #4f7cff);
  border-radius: 0 8px 8px 0;
  background: color-mix(in srgb, var(--brand-primary, #4f7cff) 7%, transparent);
  padding: 7px 9px;
}
.dsh-chatroom-direct-composer-reply span { display: flex; flex: 1; flex-direction: column; min-width: 0; overflow: hidden; color: var(--text-secondary, #6b7280); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-direct-composer-reply button { border: 0; background: transparent; color: var(--text-secondary, #6b7280); cursor: pointer; }
.dsh-chatroom-direct-composer textarea { width: 100%; min-height: 52px; resize: none; border: 0; outline: 0; background: transparent; padding: 4px 0; color: var(--text-primary, #111827); font: inherit; line-height: 1.5; }
.dsh-chatroom-direct-pending-files { display: flex; min-width: 0; flex-wrap: wrap; gap: 6px; }
.dsh-chatroom-direct-pending-files > span { display: inline-flex; max-width: 260px; align-items: center; gap: 5px; border-radius: 8px; background: var(--bg-secondary, #f3f4f6); padding: 5px 7px; font-size: 12px; }
.dsh-chatroom-direct-pending-files > span > span:nth-child(2) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-chatroom-direct-pending-files button { border: 0; background: transparent; color: var(--text-secondary, #6b7280); cursor: pointer; }
.dsh-chatroom-direct-composer-tools { display: flex; position: relative; align-items: center; gap: 6px; }
.dsh-chatroom-direct-composer-tools > button,
.dsh-chatroom-direct-emoji-root > button { border: 0; border-radius: 9px; background: transparent; padding: 7px 8px; color: var(--text-secondary, #6b7280); font: inherit; font-size: 13px; cursor: pointer; }
.dsh-chatroom-direct-composer-tools > button:hover,
.dsh-chatroom-direct-emoji-root > button:hover { background: var(--bg-secondary, #f3f4f6); color: var(--text-primary, #111827); }
.dsh-chatroom-direct-composer-tools > input { display: none; }
.dsh-chatroom-direct-composer-tools > small { margin-left: 4px; color: var(--text-secondary, #6b7280); font-size: 11px; }
.dsh-chatroom-direct-emoji-root { position: relative; }
.dsh-chatroom-direct-emoji-picker {
  position: absolute;
  z-index: 20;
  bottom: calc(100% + 8px);
  left: 0;
  display: grid;
  grid-template-columns: repeat(6, 34px);
  gap: 3px;
  border: 1px solid var(--border-primary, #dfe3ea);
  border-radius: 13px;
  background: var(--bg-primary, #fff);
  box-shadow: 0 12px 38px rgb(15 23 42 / 14%);
  padding: 8px;
}
.dsh-chatroom-direct-emoji-picker button { display: grid; width: 34px; height: 34px; place-items: center; border: 0; border-radius: 8px; background: transparent; font-size: 20px; cursor: pointer; }
.dsh-chatroom-direct-emoji-picker button:hover { background: var(--bg-secondary, #f3f4f6); }
.dsh-chatroom-direct-composer-tools .dsh-chatroom-direct-send {
  display: grid;
  width: 42px;
  height: 42px;
  margin-left: auto;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: var(--brand-primary, #4f7cff);
  padding: 0;
  color: #fff;
  font: inherit;
  font-size: 24px;
  cursor: pointer;
}
.dsh-chatroom-direct-composer-tools .dsh-chatroom-direct-send:hover { background: var(--brand-primary, #4f7cff); color: #fff; }
.dsh-chatroom-direct-composer button:disabled { opacity: .45; cursor: not-allowed; }
.dsh-chatroom-direct-empty { display: grid; place-items: center; min-height: 0; color: var(--text-secondary, #6b7280); }
.dsh-chatroom-direct-panel > .dsh-chatroom-error { margin: 0 24px 16px; }

.dsh-chatroom-wecom-account-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.dsh-chatroom-wecom-account-row > span { color: var(--text-secondary, #6b7280); }
.dsh-chatroom-wecom-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
.dsh-chatroom-wecom-account-row button,
.dsh-chatroom-wecom-retry {
  border: 0;
  border-radius: 10px;
  background: var(--brand-primary, #4f7cff);
  padding: 8px 13px;
  color: #fff;
  font: inherit;
  cursor: pointer;
}
.dsh-chatroom-wecom-auth-layer { z-index: 390; }
.dsh-chatroom-wecom-auth-card { width: min(440px, calc(100vw - 32px)); text-align: center; }
.dsh-chatroom-wecom-auth-card > header { text-align: left; }
.dsh-chatroom-wecom-qr { display: block; width: min(280px, 72vw); height: auto; margin: 18px auto 8px; border-radius: 14px; }
.dsh-chatroom-wecom-auth-success { display: grid; place-items: center; gap: 10px; padding: 28px; color: #15803d; }
.dsh-chatroom-wecom-auth-success > span { display: grid; width: 48px; height: 48px; place-items: center; border-radius: 50%; background: #dcfce7; font-size: 28px; }
.dsh-chatroom-wecom-retry { margin-top: 12px; }
.dsh-chatroom-wecom-retry:disabled { cursor: wait; opacity: .55; }
.dsh-chatroom-wecom-inline-qr { display: grid; justify-items: center; gap: 8px; margin-top: 16px; padding: 18px; border: 1px solid var(--border-color, #e5e7eb); border-radius: 14px; }
.dsh-chatroom-wecom-inline-qr img { display: block; width: min(280px, 72vw); height: auto; border-radius: 12px; }
.dsh-chatroom-wecom-inline-qr p { margin: 0; color: var(--text-secondary, #6b7280); }
.dsh-chatroom-direct-messages .dsh-chatroom-external-card { width: min(520px, 64vw); max-width: 100%; text-align: left; }
.dsh-chatroom-direct-composer-tools .dsh-chatroom-direct-meeting { color: var(--text-primary, #111827); font-weight: 600; }

html[data-dsh-chatroom-installed] [data-conversation-scroll] {
  --dsh-chat-content-width: 100%;
  --dsh-composer-card-max-width: 100%;
  --dsh-composer-side-clearance: clamp(8px, 1.2vw, 16px);
}
@media (max-width: 640px) {
  .dsh-chatroom-session-controls button { padding-inline: 5px; }
  .dsh-chatroom-control-error { max-width: 100px; }
  .dsh-chatroom-external-card { grid-template-columns: 36px minmax(0, 1fr); }
  .dsh-chatroom-external-card > a { grid-column: 2; justify-self: start; }
  [data-dsh-chatroom-branch-badge] { padding-inline: 4px; }
  .dsh-chatroom-group-setup-collapsed { grid-template-columns: 38px minmax(0, 1fr); }
  .dsh-chatroom-group-setup-collapsed > button { grid-column: 1 / -1; width: 100%; }
  .dsh-chatroom-group-setup-fields,
  .dsh-chatroom-group-setup-list { grid-template-columns: 1fr; }
  .dsh-chatroom-avatar-grid { grid-template-columns: repeat(4, 1fr); }
  .dsh-chatroom-avatar { flex-basis: 34px; width: 34px; height: 34px; font-size: 19px; }
  .dsh-chatroom-message-column { max-width: calc(100% - 44px); }
  .dsh-chatroom-context-menu { width: 216px; }
  .dsh-chatroom-selection-bar { bottom: 84px; width: calc(100vw - 28px); justify-content: center; }
  .dsh-chatroom-action-label { display: none; }
  .dsh-chatroom-message-actions > button,
  .dsh-chatroom-inline-reaction-control > button { min-width: 30px; min-height: 30px; font-size: 14px; }
  .dsh-chatroom-thread-panel { width: 100vw; box-shadow: none; }
  .dsh-chatroom-member-card { width: 100vw; box-shadow: none; }
  .dsh-chatroom-thread-panel > header { min-height: 54px; padding: 0 12px; }
  .dsh-chatroom-action-overflow {
    position: fixed;
    right: 12px;
    bottom: 72px;
    left: 12px;
    min-width: 0;
    border-radius: 16px;
    padding: 8px;
    box-shadow: 0 18px 54px rgb(15 23 42 / 26%);
  }
  .dsh-chatroom-inline-reactions { justify-content: space-around; }
  .dsh-chatroom-admin-card { width: 100vw; max-height: 100vh; border-radius: 0; }
  .dsh-chatroom-settings > .dsh-chatroom-admin-card { width: 100%; max-height: none; border-radius: 14px; }
  .dsh-chatroom-admin-layout { grid-template-columns: 1fr; max-height: calc(100vh - 82px); }
  .dsh-chatroom-provider-section { grid-column: auto; }
  .dsh-chatroom-provider-form { grid-template-columns: 1fr; }
  .dsh-chatroom-provider-form > button { grid-column: auto; }
  .dsh-chatroom-user-table > div { grid-template-columns: 34px 1fr auto; }
  .dsh-chatroom-user-table select { grid-column: 2; }
  .dsh-chatroom-settings-header { flex-direction: column; }
  .dsh-chatroom-settings .dsh-chatroom-admin-form,
  .dsh-chatroom-settings .dsh-chatroom-provider-form { grid-template-columns: 1fr; }
  .dsh-chatroom-settings .dsh-chatroom-provider-form > button { grid-column: auto; }
  .dsh-chatroom-settings .dsh-chatroom-user-table > div { grid-template-columns: 34px minmax(0, 1fr); }
  .dsh-chatroom-settings .dsh-chatroom-user-actions { grid-column: 2; flex-wrap: wrap; }
  .dsh-chatroom-settings .dsh-chatroom-provider-list > div { grid-template-columns: 1fr; }
  .dsh-chatroom-settings .dsh-chatroom-provider-actions { justify-content: flex-end; }
  .dsh-chatroom-direct-messages { padding-inline: 16px; }
  .dsh-chatroom-direct-messages > .dsh-chatroom-direct-message { max-width: 88%; }
  .dsh-chatroom-direct-composer { width: calc(100% - 24px); margin-bottom: 10px; }
}
`,document.head.append(r);let i=Lo(e.remote,o),s=ks(o,n),c=Bo(o),l=!1,u=()=>{o.resumeOpen();let t=n.list.getSnapshot();if(!l&&a!==void 0&&t.byId[a.sessionId]!==void 0){l=!0,e.uiWorkspace.openSession(a.sessionId);return}let r=_(t),i=r===void 0?void 0:t.byId[r];o.activateSession(r===void 0?void 0:String(r),i?.displayTitle??`新会话`,i?.origin!==`subagent`,i?.parentId===void 0?void 0:String(i.parentId));let s=o.getSnapshot();if(r!==void 0&&s.auth.enabled&&s.phase!==`loading`&&(s.phase!==`ready`||o.roomForSession(String(r))===void 0&&!o.canPromptNativeSession(String(r)))){s.phase===`ready`?o.resolveNativeOwnership(String(r)).then(t=>{_(n.list.getSnapshot())===r&&(t?u():e.uiWorkspace.startSession())}):e.uiWorkspace.startSession();return}r!==void 0&&i?.blank===!0&&i.origin!==`subagent`&&o.roomForSession(String(r))===void 0&&o.newSessionMode(String(r))===void 0&&o.registerNewSession(String(r))},d=n.list.subscribe(u),f=o.getSnapshot().phase,p=o.subscribe(()=>{let e=o.getSnapshot().phase;e!==f&&(f=e,u())});return o.start(t).then(async()=>{if(u(),typeof location>`u`)return;let e=Ic(location,a);e!==void 0&&await o.selectRoom(e)}),()=>{d(),p(),i(),c(),s(),o.stop(),r.remove(),document.documentElement.removeAttribute(`data-dsh-chatroom-installed`)}},`chatroom: browser state and styles`);let s=Uc(o),c=Wc(o);e.effect(()=>i.registerSource(s),`chatroom: AI mention source`),e.effect(()=>i.registerSource(c),`chatroom: member mention source`),e.slots.inject(`shell.overlay`,()=>e.slots.register({name:`shell.overlay`,children:{"chatroom.branch":{kind:`single`,scope:`session`}},id:`chatroom`,order:0,inject:()=>({hooks:{chatroom:o},retainBranch:e=>n.retain(e,{source:`chatroomBranch`}),openBranchSession:t=>{e.uiWorkspace.openSession(t),o.closeThread()},openRoom:o.openRoom,closeRoom:o.closeRoom,join:o.join,login:o.login,register:o.register,logout:o.logout,openAccount:o.openAccount,closeAccount:o.closeAccount,changePassword:o.changePassword,selectRoom:o.selectRoom,createRoom:o.createRoom,resetIdentity:o.resetIdentity,retry:o.retry,closeMembers:o.closeMembers,renameRoom:o.renameRoom,setMemberRole:o.setMemberRole,addRoomMembers:o.addRoomMembers,setRoomAutoTrigger:o.setRoomAutoTrigger,closeThread:o.closeThread,setThreadReply:o.setThreadReply,clearThreadReply:o.clearThreadReply,sendThreadMessage:o.sendThreadMessage,enableSystemNotifications:o.enableSystemNotifications,dismissToast:o.dismissToast,toggleReaction:o.toggleReaction,recallMessage:o.recallMessage,openForward:o.openForward,closeForward:o.closeForward,forwardSelected:o.forwardSelected,toggleMessageSelection:o.toggleMessageSelection,clearMessageSelection:o.clearMessageSelection,openAdmin:o.openAdmin,closeAdmin:o.closeAdmin,adminCreateUser:o.adminCreateUser,adminUpdateUser:o.adminUpdateUser,adminSetSelfRegistration:o.adminSetSelfRegistration,adminSetAutoRedirectProvider:o.adminSetAutoRedirectProvider,adminSaveProvider:o.adminSaveProvider,adminDeleteProvider:o.adminDeleteProvider,loadAutomation:o.loadAutomation,saveAutomation:o.saveAutomation,openDirect:o.openDirect,closeDirect:o.closeDirect,sendDirect:o.sendDirect,toggleDirectReaction:o.toggleDirectReaction,quickDirectMeeting:o.quickDirectMeeting,loadWecomAuthorization:o.loadWecomAuthorization,startWecomAuthorization:o.startWecomAuthorization,disconnectWecomAuthorization:o.disconnectWecomAuthorization,rebindWecomAuthorization:o.rebindWecomAuthorization,closeWecomAuthorization:o.closeWecomAuthorization,closeSearch:o.closeSearch,searchAll:o.searchAll,openSearchResult:o.openSearchResult})},Jt)),e.slots.inject(`chatroom.branch`,()=>e.slots.register({name:`chatroom.branch`},S)),e.slots.inject(`settings.section`,()=>e.slots.register({name:`settings.section`,id:`chatroom`,order:30,label:()=>`群聊与账号`,inject:()=>({hooks:{chatroom:o},closeAccount:o.closeAccount,changePassword:o.changePassword,openAdmin:o.openAdmin,closeAdmin:o.closeAdmin,adminCreateUser:o.adminCreateUser,adminUpdateUser:o.adminUpdateUser,adminSetSelfRegistration:o.adminSetSelfRegistration,adminSetAutoRedirectProvider:o.adminSetAutoRedirectProvider,adminSaveProvider:o.adminSaveProvider,adminDeleteProvider:o.adminDeleteProvider,loadAutomation:o.loadAutomation,saveAutomation:o.saveAutomation,openDirect:o.openDirect,closeDirect:o.closeDirect,sendDirect:o.sendDirect,quickDirectMeeting:o.quickDirectMeeting,loadWecomAuthorization:o.loadWecomAuthorization,startWecomAuthorization:o.startWecomAuthorization,disconnectWecomAuthorization:o.disconnectWecomAuthorization,rebindWecomAuthorization:o.rebindWecomAuthorization,closeWecomAuthorization:o.closeWecomAuthorization})},yt)),e.effect(()=>Nc(()=>`群聊与账号`),`chatroom: settings navigation icon`),e.slots.inject(`conversation.session.header.actions`,()=>e.slots.register({name:`conversation.session.header.actions`,id:`chatroom-identity`,order:-5,inject:()=>({hooks:{chatroom:o},openMembers:o.openMembers})},qo)),e.slots.inject(`conversation.input.left`,()=>e.slots.register({name:`conversation.input.left`,id:`chatroom-files`,order:-20,inject:()=>({hooks:{chatroom:o},addFiles:o.addFiles,removeFile:o.removeFile,clearReply:o.clearReply,sendFiles:o.sendFiles,resolveTarget:o.agentTargetForSession.bind(o)})},dt)),e.slots.inject(`conversation.input.right`,()=>e.slots.register({name:`conversation.input.right`,id:`chatroom-session-controls`,order:-30,inject:()=>({hooks:{chatroom:o},resolveTarget:o.agentTargetForSession.bind(o),stopRoomSession:o.stopRoomSession,newRoomSession:o.newRoomSession,quickMeeting:o.quickMeeting,quickThreadMeeting:o.quickThreadMeeting})},ft)),e.slots.inject(`conversation.composer.dock`,()=>e.slots.register({name:`conversation.composer.dock`,id:`chatroom-group-setup`,order:-30,inject:()=>({hooks:{chatroom:o},registerNewSession:o.registerNewSession,newSessionMode:o.newSessionMode,chooseNewSessionMode:o.chooseNewSessionMode})},Ko)),e.slots.inject(`conversation.composer.dock`,()=>e.slots.register({name:`conversation.composer.dock`,id:`chatroom-composition`,order:-20,inject:()=>({hooks:{chatroom:o},addFiles:o.addFiles,removeFile:o.removeFile,clearReply:o.clearReply,sendFiles:o.sendFiles,updateQueuedPrompt:o.updateQueuedPrompt,resolveTarget:o.agentTargetForSession.bind(o)})},pt)),e.slots.inject(`conversation.input.attachments`,()=>Vc(()=>e.slots.entries(`conversation.input.attachments`).find(e=>(e.options.priority??0)===0)?.component,t=>e.slots.subscribe(`conversation.input.attachments`,t),t=>e.slots.register({name:`conversation.input.attachments`,priority:-10,locale:`conversation`,inject:()=>({hooks:{chatroom:o},nativeAttachmentsView:t,clearReply:o.clearReply,resolveTarget:o.agentTargetForSession.bind(o)})},_t))),e.slots.inject(`conversation.chat.assistant-actions`,()=>e.slots.register({name:`conversation.chat.assistant-actions`,id:`chatroom-reply`,order:5,inject:()=>({hooks:{chatroom:o},resolveTarget:o.agentTargetForSession.bind(o),setReply:o.setReply,openThread:o.openThread,toggleReaction:o.toggleReaction,recallMessage:o.recallMessage,openForward:o.openForward,toggleMessageSelection:o.toggleMessageSelection})},tn)),e.slots.inject(`conversation.chat.node`,()=>Vc(()=>e.slots.entries(`conversation.chat.node`).find(e=>e.options.key===`assistant-step`&&(e.options.priority??0)===0)?.component,t=>e.slots.subscribe(`conversation.chat.node`,t),t=>e.slots.register({name:`conversation.chat.node`,key:`assistant-step`,priority:-10,locale:`chat`,inject:()=>({hooks:{chatroom:o},nativeMessageView:t,resolveTarget:o.agentTargetForSession.bind(o),setReply:o.setReply,openThread:o.openThread,toggleReaction:o.toggleReaction,recallMessage:o.recallMessage,updateQueuedPrompt:o.updateQueuedPrompt,openForward:o.openForward,toggleMessageSelection:o.toggleMessageSelection})},on))),e.slots.inject(`conversation.chat.node`,()=>Vc(()=>e.slots.entries(`conversation.chat.node`).find(e=>e.options.key===`user`&&(e.options.priority??0)===0)?.component,t=>e.slots.subscribe(`conversation.chat.node`,t),t=>e.slots.register({name:`conversation.chat.node`,key:`user`,priority:-10,locale:`chat`,inject:()=>Hc(o,t)},Co))),e.slots.inject(`conversation.chat.node`,()=>Vc(()=>e.slots.entries(`conversation.chat.node`).find(e=>e.options.key===`steering`&&(e.options.priority??0)===0)?.component,t=>e.slots.subscribe(`conversation.chat.node`,t),t=>e.slots.register({name:`conversation.chat.node`,key:`steering`,priority:-10,locale:`chat`,inject:()=>Hc(o,t)},wo)))}function Vc(e,t,n){let r,i,a=()=>{let t=e();if(t===r)return;let a=i;i=void 0,r=void 0,a?.(),t!==void 0&&(r=t,i=n(t))},o=t(a);return a(),()=>{o(),i?.(),i=void 0,r=void 0}}function Hc(e,t){return{hooks:{chatroom:e},resolveTarget:e.agentTargetForSession.bind(e),nativeMessageView:t,setReply:e.setReply,openThread:e.openThread,toggleReaction:e.toggleReaction,recallMessage:e.recallMessage,openForward:e.openForward,toggleMessageSelection:e.toggleMessageSelection}}function Uc(e){return{trigger:`@`,name:`AI 助手`,order:-100,async candidates(t,{query:n}){let r=e.roomForSession(String(t.sessionId)),i=r===void 0&&e.newSessionMode(String(t.sessionId))===`group`;if(r===void 0&&!i)return[];let a=[{name:Kc(r?.aiDisplayName??`DeepSeek`),icon:()=>(0,f.jsx)(`span`,{"aria-hidden":!0,children:`✦`}),key:`chatroom-ai`,description:r===void 0?`创建群聊后立即回复`:`提及后回复`}],o=n.toLocaleLowerCase();return a.filter(e=>e.name.toLocaleLowerCase().includes(o))},lexicon(t){let n=e.roomForSession(String(t.sessionId));return n===void 0?e.newSessionMode(String(t.sessionId))===`group`?[`AI`,`DeepSeek`]:[]:[...new Set([`AI`,n.aiDisplayName])]},subscribeLexicon(t,n){return e.subscribe(n)},onPick({candidate:e}){return{text:`@${qc(e.name)} `}}}}function Wc(e){return{trigger:`@`,name:`群聊成员`,order:-90,async candidates(t,{query:n}){let r=e.roomForSession(String(t.sessionId)),i=r===void 0&&e.newSessionMode(String(t.sessionId))===`group`;if(r===void 0&&!i)return[];i&&e.getSnapshot().directPeers.length===0&&await e.loadDirectDirectory();let a=e.getSnapshot(),o=r===void 0?a.directPeers.filter(e=>e.participantId!==a.identity?.participantId).map(e=>({name:Be(e,a.directPeers),key:e.participantId,icon:()=>(0,f.jsx)(`span`,{"aria-hidden":!0,children:x(e.avatarId,e.participantId).emoji}),description:`创建群聊时自动邀请 · @${e.username}`})):a.members.filter(e=>e.participantId!==a.identity?.participantId).map(e=>({name:e.displayName,key:e.participantId,icon:()=>(0,f.jsx)(`span`,{"aria-hidden":!0,children:x(e.avatarId,e.participantId).emoji}),description:e.online?`在线成员`:`群成员`})),s=n.toLocaleLowerCase();return o.filter((e,t,n)=>n.findIndex(t=>t.name===e.name)===t).filter(e=>e.name.toLocaleLowerCase().includes(s))},lexicon(t){let n=e.roomForSession(String(t.sessionId)),r=e.getSnapshot();return n===void 0?e.newSessionMode(String(t.sessionId))===`group`?[...new Set(r.directPeers.filter(e=>e.participantId!==r.identity?.participantId).map(e=>Be(e,r.directPeers)))]:[]:[...new Set(r.members.filter(e=>e.participantId!==r.identity?.participantId).map(e=>e.displayName))]},subscribeLexicon(t,n){return e.subscribe(n)},onPick({candidate:e}){return{text:`@${e.name} `}}}}let Gc=`（AI 助手）`;function Kc(e){return`${e}${Gc}`}function qc(e){return e.endsWith(Gc)?e.slice(0,-7):e}var Jc={inject:Rc,apply:zc};return r.apply=zc,r.createChatroomAiSource=Uc,r.createChatroomMemberSource=Wc,r.default=Jc,r.inject=Rc,r.mountAfterNativeMessageView=Vc,n.exports}});
//# sourceMappingURL=client.js.map