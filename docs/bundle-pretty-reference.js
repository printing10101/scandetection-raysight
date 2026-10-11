var Br = Object.defineProperty;
var jr = (e, t, n) => t in e ? Br(e, t, {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: n
}) : e[t] = n;
var ks = (e, t, n) => jr(e, typeof t != "symbol" ? t + "" : t, n);
(function() {
    const t = document.createElement("link").relList;
    if (t && t.supports && t.supports("modulepreload")) return;
    for (const o of document.querySelectorAll('link[rel="modulepreload"]')) s(o);
    new MutationObserver(o => {
        for (const i of o)
            if (i.type === "childList")
                for (const a of i.addedNodes) a.tagName === "LINK" && a.rel === "modulepreload" && s(a)
    }).observe(document, {
        childList: !0,
        subtree: !0
    });

    function n(o) {
        const i = {};
        return o.integrity && (i.integrity = o.integrity), o.referrerPolicy && (i.referrerPolicy = o.referrerPolicy), o.crossOrigin === "use-credentials" ? i.credentials = "include" : o.crossOrigin === "anonymous" ? i.credentials = "omit" : i.credentials = "same-origin", i
    }

    function s(o) {
        if (o.ep) return;
        o.ep = !0;
        const i = n(o);
        fetch(o.href, i)
    }
})();
/**
 * @vue/shared v3.5.40
 * (c) 2018-present Yuxi (Evan) You and Vue contributors
 * @license MIT
 **/
function Zl(e) {
    const t = Object.create(null);
    for (const n of e.split(",")) t[n] = 1;
    return n => n in t
}
const Be = {},
    An = [],
    Rt = () => {},
    ea = () => !1,
    Ks = e => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && (e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97),
    Gs = e => e.startsWith("onUpdate:"),
    tt = Object.assign,
    eo = (e, t) => {
        const n = e.indexOf(t);
        n > -1 && e.splice(n, 1)
    },
    Hr = Object.prototype.hasOwnProperty,
    Ue = (e, t) => Hr.call(e, t),
    be = Array.isArray,
    Rn = e => ps(e) === "[object Map]",
    Dn = e => ps(e) === "[object Set]",
    No = e => ps(e) === "[object Date]",
    Ce = e => typeof e == "function",
    He = e => typeof e == "string",
    bt = e => typeof e == "symbol",
    Ve = e => e !== null && typeof e == "object",
    ta = e => (Ve(e) || Ce(e)) && Ce(e.then) && Ce(e.catch),
    na = Object.prototype.toString,
    ps = e => na.call(e),
    Kr = e => ps(e).slice(8, -1),
    sa = e => ps(e) === "[object Object]",
    Ws = e => He(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e,
    Jn = Zl(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),
    qs = e => {
        const t = Object.create(null);
        return n => t[n] || (t[n] = e(n))
    },
    Gr = /-\w/g,
    ct = qs(e => e.replace(Gr, t => t.slice(1).toUpperCase())),
    Wr = /\B([A-Z])/g,
    ln = qs(e => e.replace(Wr, "-$1").toLowerCase()),
    zs = qs(e => e.charAt(0).toUpperCase() + e.slice(1)),
    vl = qs(e => e ? `on${zs(e)}` : ""),
    At = (e, t) => !Object.is(e, t),
    Ss = (e, ...t) => {
        for (let n = 0; n < e.length; n++) e[n](...t)
    },
    la = (e, t, n, s = !1) => {
        Object.defineProperty(e, t, {
            configurable: !0,
            enumerable: !1,
            writable: s,
            value: n
        })
    },
    Js = e => {
        const t = parseFloat(e);
        return isNaN(t) ? e : t
    },
    qr = e => {
        const t = He(e) ? Number(e) : NaN;
        return isNaN(t) ? e : t
    };
let Do;
const Xs = () => Do || (Do = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});

function Ln(e) {
    if (be(e)) {
        const t = {};
        for (let n = 0; n < e.length; n++) {
            const s = e[n],
                o = He(s) ? Yr(s) : Ln(s);
            if (o)
                for (const i in o) t[i] = o[i]
        }
        return t
    } else if (He(e) || Ve(e)) return e
}
const zr = /;(?![^(]*\))/g,
    Jr = /:([^]+)/,
    Xr = /\/\*[^]*?\*\//g;

function Yr(e) {
    const t = {};
    return e.replace(Xr, "").split(zr).forEach(n => {
        if (n) {
            const s = n.split(Jr);
            s.length > 1 && (t[s[0].trim()] = s[1].trim())
        }
    }), t
}

function we(e) {
    let t = "";
    if (He(e)) t = e;
    else if (be(e))
        for (let n = 0; n < e.length; n++) {
            const s = we(e[n]);
            s && (t += s + " ")
        } else if (Ve(e))
            for (const n in e) e[n] && (t += n + " ");
    return t.trim()
}
const Qr = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",
    Zr = Zl(Qr);

function oa(e) {
    return !!e || e === ""
}

function eu(e, t) {
    if (e.length !== t.length) return !1;
    let n = !0;
    for (let s = 0; n && s < e.length; s++) n = Un(e[s], t[s]);
    return n
}

function Un(e, t) {
    if (e === t) return !0;
    let n = No(e),
        s = No(t);
    if (n || s) return n && s ? e.getTime() === t.getTime() : !1;
    if (n = bt(e), s = bt(t), n || s) return e === t;
    if (n = be(e), s = be(t), n || s) return n && s ? eu(e, t) : !1;
    if (n = Ve(e), s = Ve(t), n || s) {
        if (!n || !s) return !1;
        const o = Object.keys(e).length,
            i = Object.keys(t).length;
        if (o !== i) return !1;
        for (const a in e) {
            const r = e.hasOwnProperty(a),
                u = t.hasOwnProperty(a);
            if (r && !u || !r && u || !Un(e[a], t[a])) return !1
        }
    }
    return String(e) === String(t)
}

function to(e, t) {
    return e.findIndex(n => Un(n, t))
}
const ia = e => !!(e && e.__v_isRef === !0),
    v = e => He(e) ? e : e == null ? "" : be(e) || Ve(e) && (e.toString === na || !Ce(e.toString)) ? ia(e) ? v(e.value) : JSON.stringify(e, aa, 2) : String(e),
    aa = (e, t) => ia(t) ? aa(e, t.value) : Rn(t) ? {
        [`Map(${t.size})`]: [...t.entries()].reduce((n, [s, o], i) => (n[pl(s, i) + " =>"] = o, n), {})
    } : Dn(t) ? {
        [`Set(${t.size})`]: [...t.values()].map(n => pl(n))
    } : bt(t) ? pl(t) : Ve(t) && !be(t) && !sa(t) ? String(t) : t,
    pl = (e, t = "") => {
        var n;
        return bt(e) ? `Symbol(${(n=e.description)!=null?n:t})` : e
    };
/**
 * @vue/reactivity v3.5.40
 * (c) 2018-present Yuxi (Evan) You and Vue contributors
 * @license MIT
 **/
let Ze;
class ra {
    constructor(t = !1) {
        this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !t && Ze && (Ze.active ? (this.parent = Ze, this.index = (Ze.scopes || (Ze.scopes = [])).push(this) - 1) : (this._active = !1, this._warnOnRun = !1))
    }
    get active() {
        return this._active
    }
    pause() {
        if (this._active) {
            this._isPaused = !0;
            let t, n;
            if (this.scopes) {
                const s = this.scopes.slice();
                for (t = 0, n = s.length; t < n; t++) s[t].pause()
            }
            for (t = 0, n = this.effects.length; t < n; t++) this.effects[t].pause()
        }
    }
    resume() {
        if (this._active && this._isPaused) {
            this._isPaused = !1;
            let t, n;
            if (this.scopes) {
                const o = this.scopes.slice();
                for (t = 0, n = o.length; t < n; t++) o[t].resume()
            }
            const s = this.effects.slice();
            for (t = 0, n = s.length; t < n; t++) s[t].resume()
        }
    }
    run(t) {
        if (this._active) {
            const n = Ze;
            try {
                return Ze = this, t()
            } finally {
                Ze = n
            }
        }
    }
    on() {
        ++this._on === 1 && (this.prevScope = Ze, Ze = this)
    }
    off() {
        if (this._on > 0 && --this._on === 0) {
            if (Ze === this) Ze = this.prevScope;
            else {
                let t = Ze;
                for (; t;) {
                    if (t.prevScope === this) {
                        t.prevScope = this.prevScope;
                        break
                    }
                    t = t.prevScope
                }
            }
            this.prevScope = void 0
        }
    }
    stop(t) {
        if (this._active) {
            this._active = !1;
            let n, s;
            for (n = 0, s = this.effects.length; n < s; n++) this.effects[n].stop();
            for (this.effects.length = 0, n = 0, s = this.cleanups.length; n < s; n++) this.cleanups[n]();
            if (this.cleanups.length = 0, this.scopes) {
                const o = this.scopes.slice();
                for (n = 0, s = o.length; n < s; n++) o[n].stop(!0);
                this.scopes.length = 0
            }
            if (!this.detached && this.parent && !t) {
                const o = this.parent.scopes.pop();
                o && o !== this && (this.parent.scopes[this.index] = o, o.index = this.index)
            }
            this.parent = void 0
        }
    }
}

function ua(e) {
    return new ra(e)
}

function no() {
    return Ze
}

function so(e, t = !1) {
    Ze && Ze.cleanups.push(e)
}
let je;
const hl = new WeakSet;
class ca {
    constructor(t) {
        this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Ze && (Ze.active ? Ze.effects.push(this) : this.flags &= -2)
    }
    pause() {
        this.flags |= 64
    }
    resume() {
        this.flags & 64 && (this.flags &= -65, hl.has(this) && (hl.delete(this), this.trigger()))
    }
    notify() {
        this.flags & 2 && !(this.flags & 32) || this.flags & 8 || fa(this)
    }
    run() {
        if (!(this.flags & 1)) return this.fn();
        this.flags |= 2, Lo(this), va(this);
        const t = je,
            n = wt;
        je = this, wt = !0;
        try {
            return this.fn()
        } finally {
            pa(this), je = t, wt = n, this.flags &= -3
        }
    }
    stop() {
        if (this.flags & 1) {
            for (let t = this.deps; t; t = t.nextDep) io(t);
            this.deps = this.depsTail = void 0, Lo(this), this.onStop && this.onStop(), this.flags &= -2
        }
    }
    trigger() {
        this.flags & 64 ? hl.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty()
    }
    runIfDirty() {
        Pl(this) && this.run()
    }
    get dirty() {
        return Pl(this)
    }
}
let da = 0,
    Xn, Yn;

function fa(e, t = !1) {
    if (e.flags |= 8, t) {
        e.next = Yn, Yn = e;
        return
    }
    e.next = Xn, Xn = e
}

function lo() {
    da++
}

function oo() {
    if (--da > 0) return;
    if (Yn) {
        let t = Yn;
        for (Yn = void 0; t;) {
            const n = t.next;
            t.next = void 0, t.flags &= -9, t = n
        }
    }
    let e;
    for (; Xn;) {
        let t = Xn;
        for (Xn = void 0; t;) {
            const n = t.next;
            if (t.next = void 0, t.flags &= -9, t.flags & 1) try {
                t.trigger()
            } catch (s) {
                e || (e = s)
            }
            t = n
        }
    }
    if (e) throw e
}

function va(e) {
    for (let t = e.deps; t; t = t.nextDep) t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t
}

function pa(e) {
    let t, n = e.depsTail,
        s = n;
    for (; s;) {
        const o = s.prevDep;
        s.version === -1 ? (s === n && (n = o), io(s), tu(s)) : t = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = o
    }
    e.deps = t, e.depsTail = n
}

function Pl(e) {
    for (let t = e.deps; t; t = t.nextDep)
        if (t.dep.version !== t.version || t.dep.computed && (ha(t.dep.computed) || t.dep.version !== t.version)) return !0;
    return !!e._dirty
}

function ha(e) {
    if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === ss) || (e.globalVersion = ss, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Pl(e)))) return;
    e.flags |= 2;
    const t = e.dep,
        n = je,
        s = wt;
    je = e, wt = !0;
    try {
        va(e);
        const o = e.fn(e._value);
        (t.version === 0 || At(o, e._value)) && (e.flags |= 128, e._value = o, t.version++)
    } catch (o) {
        throw t.version++, o
    } finally {
        je = n, wt = s, pa(e), e.flags &= -3
    }
}

function io(e, t = !1) {
    const {
        dep: n,
        prevSub: s,
        nextSub: o
    } = e;
    if (s && (s.nextSub = o, e.prevSub = void 0), o && (o.prevSub = s, e.nextSub = void 0), n.subs === e && (n.subs = s, !s && n.computed)) {
        n.computed.flags &= -5;
        for (let i = n.computed.deps; i; i = i.nextDep) io(i, !0)
    }!t && !--n.sc && n.map && n.map.delete(n.key)
}

function tu(e) {
    const {
        prevDep: t,
        nextDep: n
    } = e;
    t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0)
}
let wt = !0;
const ma = [];

function jt() {
    ma.push(wt), wt = !1
}

function Ht() {
    const e = ma.pop();
    wt = e === void 0 ? !0 : e
}

function Lo(e) {
    const {
        cleanup: t
    } = e;
    if (e.cleanup = void 0, t) {
        const n = je;
        je = void 0;
        try {
            t()
        } finally {
            je = n
        }
    }
}
let ss = 0;
class nu {
    constructor(t, n) {
        this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0
    }
}
class ao {
    constructor(t) {
        this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0
    }
    track(t) {
        if (!je || !wt || je === this.computed) return;
        let n = this.activeLink;
        if (n === void 0 || n.sub !== je) n = this.activeLink = new nu(je, this), je.deps ? (n.prevDep = je.depsTail, je.depsTail.nextDep = n, je.depsTail = n) : je.deps = je.depsTail = n, ga(n);
        else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
            const s = n.nextDep;
            s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = je.depsTail, n.nextDep = void 0, je.depsTail.nextDep = n, je.depsTail = n, je.deps === n && (je.deps = s)
        }
        return n
    }
    trigger(t) {
        this.version++, ss++, this.notify(t)
    }
    notify(t) {
        lo();
        try {
            for (let n = this.subs; n; n = n.prevSub) n.sub.notify() && n.sub.dep.notify()
        } finally {
            oo()
        }
    }
}

function ga(e) {
    if (e.dep.sc++, e.sub.flags & 4) {
        const t = e.dep.computed;
        if (t && !e.dep.subs) {
            t.flags |= 20;
            for (let s = t.deps; s; s = s.nextDep) ga(s)
        }
        const n = e.dep.subs;
        n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e
    }
}
const Is = new WeakMap,
    mn = Symbol(""),
    Ml = Symbol(""),
    ls = Symbol("");

function nt(e, t, n) {
    if (wt && je) {
        let s = Is.get(e);
        s || Is.set(e, s = new Map);
        let o = s.get(n);
        o || (s.set(n, o = new ao), o.map = s, o.key = n), o.track()
    }
}

function Lt(e, t, n, s, o, i) {
    const a = Is.get(e);
    if (!a) {
        ss++;
        return
    }
    const r = u => {
        u && u.trigger()
    };
    if (lo(), t === "clear") a.forEach(r);
    else {
        const u = be(e),
            c = u && Ws(n);
        if (u && n === "length") {
            const d = Number(s);
            a.forEach((f, m) => {
                (m === "length" || m === ls || !bt(m) && m >= d) && r(f)
            })
        } else switch ((n !== void 0 || a.has(void 0)) && r(a.get(n)), c && r(a.get(ls)), t) {
            case "add":
                u ? c && r(a.get("length")) : (r(a.get(mn)), Rn(e) && r(a.get(Ml)));
                break;
            case "delete":
                u || (r(a.get(mn)), Rn(e) && r(a.get(Ml)));
                break;
            case "set":
                Rn(e) && r(a.get(mn));
                break
        }
    }
    oo()
}

function su(e, t) {
    const n = Is.get(e);
    return n && n.get(t)
}

function Cn(e) {
    const t = Me(e);
    return t === e ? t : (nt(t, "iterate", ls), ht(e) ? t : t.map(kt))
}

function Ys(e) {
    return nt(e = Me(e), "iterate", ls), e
}

function xt(e, t) {
    return Kt(e) ? In(Vt(e) ? kt(t) : t) : kt(t)
}
const lu = {
    __proto__: null,
    [Symbol.iterator]() {
        return ml(this, Symbol.iterator, e => xt(this, e))
    },
    concat(...e) {
        return Cn(this).concat(...e.map(t => be(t) ? Cn(t) : t))
    },
    entries() {
        return ml(this, "entries", e => (e[1] = xt(this, e[1]), e))
    },
    every(e, t) {
        return It(this, "every", e, t, void 0, arguments)
    },
    filter(e, t) {
        return It(this, "filter", e, t, n => n.map(s => xt(this, s)), arguments)
    },
    find(e, t) {
        return It(this, "find", e, t, n => xt(this, n), arguments)
    },
    findIndex(e, t) {
        return It(this, "findIndex", e, t, void 0, arguments)
    },
    findLast(e, t) {
        return It(this, "findLast", e, t, n => xt(this, n), arguments)
    },
    findLastIndex(e, t) {
        return It(this, "findLastIndex", e, t, void 0, arguments)
    },
    forEach(e, t) {
        return It(this, "forEach", e, t, void 0, arguments)
    },
    includes(...e) {
        return gl(this, "includes", e)
    },
    indexOf(...e) {
        return gl(this, "indexOf", e)
    },
    join(e) {
        return Cn(this).join(e)
    },
    lastIndexOf(...e) {
        return gl(this, "lastIndexOf", e)
    },
    map(e, t) {
        return It(this, "map", e, t, void 0, arguments)
    },
    pop() {
        return Fn(this, "pop")
    },
    push(...e) {
        return Fn(this, "push", e)
    },
    reduce(e, ...t) {
        return Uo(this, "reduce", e, t)
    },
    reduceRight(e, ...t) {
        return Uo(this, "reduceRight", e, t)
    },
    shift() {
        return Fn(this, "shift")
    },
    some(e, t) {
        return It(this, "some", e, t, void 0, arguments)
    },
    splice(...e) {
        return Fn(this, "splice", e)
    },
    toReversed() {
        return Cn(this).toReversed()
    },
    toSorted(e) {
        return Cn(this).toSorted(e)
    },
    toSpliced(...e) {
        return Cn(this).toSpliced(...e)
    },
    unshift(...e) {
        return Fn(this, "unshift", e)
    },
    values() {
        return ml(this, "values", e => xt(this, e))
    }
};

function ml(e, t, n) {
    const s = Ys(e),
        o = s[t]();
    return s !== e && !ht(e) && (o._next = o.next, o.next = () => {
        const i = o._next();
        return i.done || (i.value = n(i.value)), i
    }), o
}
const ou = Array.prototype;

function It(e, t, n, s, o, i) {
    const a = Ys(e),
        r = a !== e && !ht(e),
        u = a[t];
    if (u !== ou[t]) {
        const f = u.apply(e, i);
        return r ? kt(f) : f
    }
    let c = n;
    a !== e && (r ? c = function(f, m) {
        return n.call(this, xt(e, f), m, e)
    } : n.length > 2 && (c = function(f, m) {
        return n.call(this, f, m, e)
    }));
    const d = u.call(a, c, s);
    return r && o ? o(d) : d
}

function Uo(e, t, n, s) {
    const o = Ys(e),
        i = o !== e && !ht(e);
    let a = n,
        r = !1;
    o !== e && (i ? (r = s.length === 0, a = function(c, d, f) {
        return r && (r = !1, c = xt(e, c)), n.call(this, c, xt(e, d), f, e)
    }) : n.length > 3 && (a = function(c, d, f) {
        return n.call(this, c, d, f, e)
    }));
    const u = o[t](a, ...s);
    return r ? xt(e, u) : u
}

function gl(e, t, n) {
    const s = Me(e);
    nt(s, "iterate", ls);
    const o = s[t](...n);
    return (o === -1 || o === !1) && Qs(n[0]) ? (n[0] = Me(n[0]), s[t](...n)) : o
}

function Fn(e, t, n = []) {
    jt(), lo();
    const s = Me(e)[t].apply(e, n);
    return oo(), Ht(), s
}
const iu = Zl("__proto__,__v_isRef,__isVue"),
    ya = new Set(Object.getOwnPropertyNames(Symbol).filter(e => e !== "arguments" && e !== "caller").map(e => Symbol[e]).filter(bt));

function au(e) {
    bt(e) || (e = String(e));
    const t = Me(this);
    return nt(t, "has", e), t.hasOwnProperty(e)
}
class ba {
    constructor(t = !1, n = !1) {
        this._isReadonly = t, this._isShallow = n
    }
    get(t, n, s) {
        if (n === "__v_skip") return t.__v_skip;
        const o = this._isReadonly,
            i = this._isShallow;
        if (n === "__v_isReactive") return !o;
        if (n === "__v_isReadonly") return o;
        if (n === "__v_isShallow") return i;
        if (n === "__v_raw") return s === (o ? i ? gu : $a : i ? ka : wa).get(t) || Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
        const a = be(t);
        if (!o) {
            let u;
            if (a && (u = lu[n])) return u;
            if (n === "hasOwnProperty") return au
        }
        const r = Reflect.get(t, n, Xe(t) ? t : s);
        if ((bt(n) ? ya.has(n) : iu(n)) || (o || nt(t, "get", n), i)) return r;
        if (Xe(r)) {
            const u = a && Ws(n) ? r : r.value;
            return o && Ve(u) ? Nt(u) : u
        }
        return Ve(r) ? o ? Nt(r) : hs(r) : r
    }
}
class _a extends ba {
    constructor(t = !1) {
        super(!1, t)
    }
    set(t, n, s, o) {
        let i = t[n];
        const a = be(t) && Ws(n);
        if (!this._isShallow) {
            const c = Kt(i);
            if (!ht(s) && !Kt(s) && (i = Me(i), s = Me(s)), !a && Xe(i) && !Xe(s)) return c || (i.value = s), !0
        }
        const r = a ? Number(n) < t.length : Ue(t, n),
            u = Reflect.set(t, n, s, Xe(t) ? t : o);
        return t === Me(o) && u && (r ? At(s, i) && Lt(t, "set", n, s) : Lt(t, "add", n, s)), u
    }
    deleteProperty(t, n) {
        const s = Ue(t, n);
        t[n];
        const o = Reflect.deleteProperty(t, n);
        return o && s && Lt(t, "delete", n, void 0), o
    }
    has(t, n) {
        const s = Reflect.has(t, n);
        return (!bt(n) || !ya.has(n)) && nt(t, "has", n), s
    }
    ownKeys(t) {
        return nt(t, "iterate", be(t) ? "length" : mn), Reflect.ownKeys(t)
    }
}
class ru extends ba {
    constructor(t = !1) {
        super(!0, t)
    }
    set(t, n) {
        return !0
    }
    deleteProperty(t, n) {
        return !0
    }
}
const uu = new _a,
    cu = new ru,
    du = new _a(!0);
const Nl = e => e,
    $s = e => Reflect.getPrototypeOf(e);

function fu(e, t, n) {
    return function(...s) {
        const o = this.__v_raw,
            i = Me(o),
            a = Rn(i),
            r = e === "entries" || e === Symbol.iterator && a,
            u = e === "keys" && a,
            c = o[e](...s),
            d = n ? Nl : t ? In : kt;
        return !t && nt(i, "iterate", u ? Ml : mn), tt(Object.create(c), {
            next() {
                const {
                    value: f,
                    done: m
                } = c.next();
                return m ? {
                    value: f,
                    done: m
                } : {
                    value: r ? [d(f[0]), d(f[1])] : d(f),
                    done: m
                }
            }
        })
    }
}

function Cs(e) {
    return function(...t) {
        return e === "delete" ? !1 : e === "clear" ? void 0 : this
    }
}

function vu(e, t) {
    const n = {
        get(o) {
            const i = this.__v_raw,
                a = Me(i),
                r = Me(o);
            e || (At(o, r) && nt(a, "get", o), nt(a, "get", r));
            const {
                has: u
            } = $s(a), c = t ? Nl : e ? In : kt;
            if (u.call(a, o)) return c(i.get(o));
            if (u.call(a, r)) return c(i.get(r));
            i !== a && i.get(o)
        },
        get size() {
            const o = this.__v_raw;
            return !e && nt(Me(o), "iterate", mn), o.size
        },
        has(o) {
            const i = this.__v_raw,
                a = Me(i),
                r = Me(o);
            return e || (At(o, r) && nt(a, "has", o), nt(a, "has", r)), o === r ? i.has(o) : i.has(o) || i.has(r)
        },
        forEach(o, i) {
            const a = this,
                r = a.__v_raw,
                u = Me(r),
                c = t ? Nl : e ? In : kt;
            return !e && nt(u, "iterate", mn), r.forEach((d, f) => o.call(i, c(d), c(f), a))
        }
    };
    return tt(n, e ? {
        add: Cs("add"),
        set: Cs("set"),
        delete: Cs("delete"),
        clear: Cs("clear")
    } : {
        add(o) {
            const i = Me(this),
                a = $s(i),
                r = Me(o),
                u = !t && !ht(o) && !Kt(o) ? r : o;
            return a.has.call(i, u) || At(o, u) && a.has.call(i, o) || At(r, u) && a.has.call(i, r) || (i.add(u), Lt(i, "add", u, u)), this
        },
        set(o, i) {
            !t && !ht(i) && !Kt(i) && (i = Me(i));
            const a = Me(this),
                {
                    has: r,
                    get: u
                } = $s(a);
            let c = r.call(a, o);
            c || (o = Me(o), c = r.call(a, o));
            const d = u.call(a, o);
            return a.set(o, i), c ? At(i, d) && Lt(a, "set", o, i) : Lt(a, "add", o, i), this
        },
        delete(o) {
            const i = Me(this),
                {
                    has: a,
                    get: r
                } = $s(i);
            let u = a.call(i, o);
            u || (o = Me(o), u = a.call(i, o)), r && r.call(i, o);
            const c = i.delete(o);
            return u && Lt(i, "delete", o, void 0), c
        },
        clear() {
            const o = Me(this),
                i = o.size !== 0,
                a = o.clear();
            return i && Lt(o, "clear", void 0, void 0), a
        }
    }), ["keys", "values", "entries", Symbol.iterator].forEach(o => {
        n[o] = fu(o, e, t)
    }), n
}

function ro(e, t) {
    const n = vu(e, t);
    return (s, o, i) => o === "__v_isReactive" ? !e : o === "__v_isReadonly" ? e : o === "__v_raw" ? s : Reflect.get(Ue(n, o) && o in s ? n : s, o, i)
}
const pu = {
        get: ro(!1, !1)
    },
    hu = {
        get: ro(!1, !0)
    },
    mu = {
        get: ro(!0, !1)
    };
const wa = new WeakMap,
    ka = new WeakMap,
    $a = new WeakMap,
    gu = new WeakMap;

function yu(e) {
    switch (e) {
        case "Object":
        case "Array":
            return 1;
        case "Map":
        case "Set":
        case "WeakMap":
        case "WeakSet":
            return 2;
        default:
            return 0
    }
}

function hs(e) {
    return Kt(e) ? e : uo(e, !1, uu, pu, wa)
}

function Ca(e) {
    return uo(e, !1, du, hu, ka)
}

function Nt(e) {
    return uo(e, !0, cu, mu, $a)
}

function uo(e, t, n, s, o) {
    if (!Ve(e) || e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e)) return e;
    const i = o.get(e);
    if (i) return i;
    const a = yu(Kr(e));
    if (a === 0) return e;
    const r = new Proxy(e, a === 2 ? s : n);
    return o.set(e, r), r
}

function Vt(e) {
    return Kt(e) ? Vt(e.__v_raw) : !!(e && e.__v_isReactive)
}

function Kt(e) {
    return !!(e && e.__v_isReadonly)
}

function ht(e) {
    return !!(e && e.__v_isShallow)
}

function Qs(e) {
    return e ? !!e.__v_raw : !1
}

function Me(e) {
    const t = e && e.__v_raw;
    return t ? Me(t) : e
}

function co(e) {
    return !Ue(e, "__v_skip") && Object.isExtensible(e) && la(e, "__v_skip", !0), e
}
const kt = e => Ve(e) ? hs(e) : e,
    In = e => Ve(e) ? Nt(e) : e;

function Xe(e) {
    return e ? e.__v_isRef === !0 : !1
}

function w(e) {
    return Ea(e, !1)
}

function bu(e) {
    return Ea(e, !0)
}

function Ea(e, t) {
    return Xe(e) ? e : new _u(e, t)
}
class _u {
    constructor(t, n) {
        this.dep = new ao, this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : Me(t), this._value = n ? t : kt(t), this.__v_isShallow = n
    }
    get value() {
        return this.dep.track(), this._value
    }
    set value(t) {
        const n = this._rawValue,
            s = this.__v_isShallow || ht(t) || Kt(t);
        t = s ? t : Me(t), At(t, n) && (this._rawValue = t, this._value = s ? t : kt(t), this.dep.trigger())
    }
}

function ye(e) {
    return Xe(e) ? e.value : e
}
const wu = {
    get: (e, t, n) => t === "__v_raw" ? e : ye(Reflect.get(e, t, n)),
    set: (e, t, n, s) => {
        const o = e[t];
        return Xe(o) && !Xe(n) ? (o.value = n, !0) : Reflect.set(e, t, n, s)
    }
};

function xa(e) {
    return Vt(e) ? e : new Proxy(e, wu)
}

function ku(e) {
    const t = be(e) ? new Array(e.length) : {};
    for (const n in e) t[n] = Cu(e, n);
    return t
}
class $u {
    constructor(t, n, s) {
        this._object = t, this._defaultValue = s, this.__v_isRef = !0, this._value = void 0, this._key = bt(n) ? n : String(n), this._raw = Me(t);
        let o = !0,
            i = t;
        if (!be(t) || bt(this._key) || !Ws(this._key))
            do o = !Qs(i) || ht(i); while (o && (i = i.__v_raw));
        this._shallow = o
    }
    get value() {
        let t = this._object[this._key];
        return this._shallow && (t = ye(t)), this._value = t === void 0 ? this._defaultValue : t
    }
    set value(t) {
        if (this._shallow && Xe(this._raw[this._key])) {
            const n = this._object[this._key];
            if (Xe(n)) {
                n.value = t;
                return
            }
        }
        this._object[this._key] = t
    }
    get dep() {
        return su(this._raw, this._key)
    }
}

function Cu(e, t, n) {
    return new $u(e, t, n)
}
class Eu {
    constructor(t, n, s) {
        this.fn = t, this.setter = n, this._value = void 0, this.dep = new ao(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = ss - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s
    }
    notify() {
        if (this.flags |= 16, !(this.flags & 8) && je !== this) return fa(this, !0), !0
    }
    get value() {
        const t = this.dep.track();
        return ha(this), t && (t.version = this.dep.version), this._value
    }
    set value(t) {
        this.setter && this.setter(t)
    }
}

function xu(e, t, n = !1) {
    let s, o;
    return Ce(e) ? s = e : (s = e.get, o = e.set), new Eu(s, o, n)
}
const Es = {},
    Os = new WeakMap;
let fn;

function Su(e, t = !1, n = fn) {
    if (n) {
        let s = Os.get(n);
        s || Os.set(n, s = []), s.push(e)
    }
}

function Au(e, t, n = Be) {
    const {
        immediate: s,
        deep: o,
        once: i,
        scheduler: a,
        augmentJob: r,
        call: u
    } = n, c = I => o ? I : ht(I) || o === !1 || o === 0 ? Ut(I, 1) : Ut(I);
    let d, f, m, _, P = !1,
        E = !1;
    if (Xe(e) ? (f = () => e.value, P = ht(e)) : Vt(e) ? (f = () => c(e), P = !0) : be(e) ? (E = !0, P = e.some(I => Vt(I) || ht(I)), f = () => e.map(I => {
            if (Xe(I)) return I.value;
            if (Vt(I)) return c(I);
            if (Ce(I)) return u ? u(I, 2) : I()
        })) : Ce(e) ? t ? f = u ? () => u(e, 2) : e : f = () => {
            if (m) {
                jt();
                try {
                    m()
                } finally {
                    Ht()
                }
            }
            const I = fn;
            fn = d;
            try {
                return u ? u(e, 3, [_]) : e(_)
            } finally {
                fn = I
            }
        } : f = Rt, t && o) {
        const I = f,
            A = o === !0 ? 1 / 0 : o;
        f = () => Ut(I(), A)
    }
    const N = no(),
        M = () => {
            d.stop(), N && N.active && eo(N.effects, d)
        };
    if (i && t) {
        const I = t;
        t = (...A) => {
            const C = I(...A);
            return M(), C
        }
    }
    let L = E ? new Array(e.length).fill(Es) : Es;
    const K = I => {
        if (!(!(d.flags & 1) || !d.dirty && !I))
            if (t) {
                const A = d.run();
                if (I || o || P || (E ? A.some((C, T) => At(C, L[T])) : At(A, L))) {
                    m && m();
                    const C = fn;
                    fn = d;
                    try {
                        const T = [A, L === Es ? void 0 : E && L[0] === Es ? [] : L, _];
                        L = A, u ? u(t, 3, T) : t(...T)
                    } finally {
                        fn = C
                    }
                }
            } else d.run()
    };
    return r && r(K), d = new ca(f), d.scheduler = a ? () => a(K, !1) : K, _ = I => Su(I, !1, d), m = d.onStop = () => {
        const I = Os.get(d);
        if (I) {
            if (u) u(I, 4);
            else
                for (const A of I) A();
            Os.delete(d)
        }
    }, t ? s ? K(!0) : L = d.run() : a ? a(K.bind(null, !0), !0) : d.run(), M.pause = d.pause.bind(d), M.resume = d.resume.bind(d), M.stop = M, M
}

function Ut(e, t = 1 / 0, n) {
    if (t <= 0 || !Ve(e) || e.__v_skip || (n = n || new Map, (n.get(e) || 0) >= t)) return e;
    if (n.set(e, t), t--, Xe(e)) Ut(e.value, t, n);
    else if (be(e))
        for (let s = 0; s < e.length; s++) Ut(e[s], t, n);
    else if (Dn(e) || Rn(e)) e.forEach(s => {
        Ut(s, t, n)
    });
    else if (sa(e)) {
        for (const s in e) Ut(e[s], t, n);
        for (const s of Object.getOwnPropertySymbols(e)) Object.prototype.propertyIsEnumerable.call(e, s) && Ut(e[s], t, n)
    }
    return e
}
/**
 * @vue/runtime-core v3.5.40
 * (c) 2018-present Yuxi (Evan) You and Vue contributors
 * @license MIT
 **/
function ms(e, t, n, s) {
    try {
        return s ? e(...s) : e()
    } catch (o) {
        Zs(o, t, n)
    }
}

function _t(e, t, n, s) {
    if (Ce(e)) {
        const o = ms(e, t, n, s);
        return o && ta(o) && o.catch(i => {
            Zs(i, t, n)
        }), o
    }
    if (be(e)) {
        const o = [];
        for (let i = 0; i < e.length; i++) o.push(_t(e[i], t, n, s));
        return o
    }
}

function Zs(e, t, n, s = !0) {
    const o = t ? t.vnode : null,
        {
            errorHandler: i,
            throwUnhandledErrorInProduction: a
        } = t && t.appContext.config || Be;
    if (t) {
        let r = t.parent;
        const u = t.proxy,
            c = `https://vuejs.org/error-reference/#runtime-${n}`;
        for (; r;) {
            const d = r.ec;
            if (d) {
                for (let f = 0; f < d.length; f++)
                    if (d[f](e, u, c) === !1) return
            }
            r = r.parent
        }
        if (i) {
            jt(), ms(i, null, 10, [e, u, c]), Ht();
            return
        }
    }
    Ru(e, n, o, s, a)
}

function Ru(e, t, n, s = !0, o = !1) {
    if (o) throw e;
    console.error(e)
}
const rt = [];
let Et = -1;
const Tn = [];
let Qt = null,
    xn = 0;
const Sa = Promise.resolve();
let Ps = null;

function Gt(e) {
    const t = Ps || Sa;
    return e ? t.then(this ? e.bind(this) : e) : t
}

function Tu(e) {
    let t = Et + 1,
        n = rt.length;
    for (; t < n;) {
        const s = t + n >>> 1,
            o = rt[s],
            i = os(o);
        i < e || i === e && o.flags & 2 ? t = s + 1 : n = s
    }
    return t
}

function fo(e) {
    if (!(e.flags & 1)) {
        const t = os(e),
            n = rt[rt.length - 1];
        !n || !(e.flags & 2) && t >= os(n) ? rt.push(e) : rt.splice(Tu(t), 0, e), e.flags |= 1, Aa()
    }
}

function Aa() {
    Ps || (Ps = Sa.then(Ta))
}

function Iu(e) {
    be(e) ? Tn.push(...e) : Qt && e.id === -1 ? Qt.splice(xn + 1, 0, e) : e.flags & 1 || (Tn.push(e), e.flags |= 1), Aa()
}

function Vo(e, t, n = Et + 1) {
    for (; n < rt.length; n++) {
        const s = rt[n];
        if (s && s.flags & 2) {
            if (e && s.id !== e.uid) continue;
            rt.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2)
        }
    }
}

function Ra(e) {
    if (Tn.length) {
        const t = [...new Set(Tn)].sort((n, s) => os(n) - os(s));
        if (Tn.length = 0, Qt) {
            Qt.push(...t);
            return
        }
        for (Qt = t, xn = 0; xn < Qt.length; xn++) {
            const n = Qt[xn];
            n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2
        }
        Qt = null, xn = 0
    }
}
const os = e => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;

function Ta(e) {
    try {
        for (Et = 0; Et < rt.length; Et++) {
            const t = rt[Et];
            t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), ms(t, t.i, t.i ? 15 : 14), t.flags & 4 || (t.flags &= -2))
        }
    } finally {
        for (; Et < rt.length; Et++) {
            const t = rt[Et];
            t && (t.flags &= -2)
        }
        Et = -1, rt.length = 0, Ra(), Ps = null, (rt.length || Tn.length) && Ta()
    }
}
let ft = null,
    Ia = null;

function Ms(e) {
    const t = ft;
    return ft = e, Ia = e && e.type.__scopeId || null, t
}

function is(e, t = ft, n) {
    if (!t || e._n) return e;
    const s = (...o) => {
        s._d && Ls(-1);
        const i = Ms(t),
            a = yn.length;
        let r;
        try {
            r = e(...o)
        } finally {
            for (let u = yn.length; u > a; u--) rr();
            Ms(i), s._d && Ls(1)
        }
        return r
    };
    return s._n = !0, s._c = !0, s._d = !0, s
}

function he(e, t) {
    if (ft === null) return e;
    const n = ll(ft),
        s = e.dirs || (e.dirs = []);
    for (let o = 0; o < t.length; o++) {
        let [i, a, r, u = Be] = t[o];
        i && (Ce(i) && (i = {
            mounted: i,
            updated: i
        }), i.deep && Ut(a), s.push({
            dir: i,
            instance: n,
            value: a,
            oldValue: void 0,
            arg: r,
            modifiers: u
        }))
    }
    return e
}

function rn(e, t, n, s) {
    const o = e.dirs,
        i = t && t.dirs;
    for (let a = 0; a < o.length; a++) {
        const r = o[a];
        i && (r.oldValue = i[a].value);
        let u = r.dir[s];
        u && (jt(), _t(u, n, 8, [e.el, r, e, t]), Ht())
    }
}

function As(e, t) {
    if (st) {
        let n = st.provides;
        const s = st.parent && st.parent.provides;
        s === n && (n = st.provides = Object.create(s)), n[e] = t
    }
}

function yt(e, t, n = !1) {
    const s = mo();
    if (s || gn) {
        let o = gn ? gn._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
        if (o && e in o) return o[e];
        if (arguments.length > 1) return n && Ce(t) ? t.call(s && s.proxy) : t
    }
}

function Ou() {
    return !!(mo() || gn)
}
const Pu = Symbol.for("v-scx"),
    Mu = () => yt(Pu);

function et(e, t, n) {
    return Oa(e, t, n)
}

function Oa(e, t, n = Be) {
    const {
        immediate: s,
        deep: o,
        flush: i,
        once: a
    } = n, r = tt({}, n), u = t && s || !t && i !== "post";
    let c;
    if (us) {
        if (i === "sync") {
            const _ = Mu();
            c = _.__watcherHandles || (_.__watcherHandles = [])
        } else if (!u) {
            const _ = () => {};
            return _.stop = Rt, _.resume = Rt, _.pause = Rt, _
        }
    }
    const d = st;
    r.call = (_, P, E) => _t(_, d, P, E);
    let f = !1;
    i === "post" ? r.scheduler = _ => {
        it(_, d && d.suspense)
    } : i !== "sync" && (f = !0, r.scheduler = (_, P) => {
        P ? _() : fo(_)
    }), r.augmentJob = _ => {
        t && (_.flags |= 4), f && (_.flags |= 2, d && (_.id = d.uid, _.i = d))
    };
    const m = Au(e, t, r);
    return us && (c ? c.push(m) : u && m()), m
}

function Nu(e, t, n) {
    const s = this.proxy,
        o = He(e) ? e.includes(".") ? Pa(s, e) : () => s[e] : e.bind(s, s);
    let i;
    Ce(t) ? i = t : (i = t.handler, n = t);
    const a = gs(this),
        r = Oa(o, i.bind(s), n);
    return a(), r
}

function Pa(e, t) {
    const n = t.split(".");
    return () => {
        let s = e;
        for (let o = 0; o < n.length && s; o++) s = s[n[o]];
        return s
    }
}
const Xt = new WeakMap,
    Ma = Symbol("_vte"),
    Na = e => e.__isTeleport,
    vn = e => e && (e.disabled || e.disabled === ""),
    Du = e => e && (e.defer || e.defer === ""),
    Fo = e => typeof SVGElement < "u" && e instanceof SVGElement,
    Bo = e => typeof MathMLElement == "function" && e instanceof MathMLElement,
    Dl = (e, t) => {
        const n = e && e.to;
        return He(n) ? t ? t(n) : null : n
    },
    Lu = {
        name: "Teleport",
        __isTeleport: !0,
        process(e, t, n, s, o, i, a, r, u, c) {
            const {
                mc: d,
                pc: f,
                pbc: m,
                o: {
                    insert: _,
                    querySelector: P,
                    createText: E,
                    createComment: N,
                    parentNode: M
                }
            } = c, L = vn(t.props);
            let {
                dynamicChildren: K
            } = t;
            const I = (T, x, W) => {
                    T.shapeFlag & 16 && d(T.children, x, W, o, i, a, r, u)
                },
                A = (T = t) => {
                    const x = vn(T.props),
                        W = T.target = Dl(T.props, P),
                        te = Ll(W, T, E, _);
                    W && (a !== "svg" && Fo(W) ? a = "svg" : a !== "mathml" && Bo(W) && (a = "mathml"), o && o.isCE && (o.ce._teleportTargets || (o.ce._teleportTargets = new Set)).add(W), x || (I(T, W, te), Wn(T, !1)))
                },
                C = T => {
                    const x = () => {
                        if (Xt.get(T) === x) {
                            if (Xt.delete(T), vn(T.props)) {
                                const W = M(T.el) || n;
                                I(T, W, T.anchor), Wn(T, !0)
                            }
                            A(T)
                        }
                    };
                    Xt.set(T, x), it(x, i)
                };
            if (e == null) {
                const T = t.el = E(""),
                    x = t.anchor = E("");
                if (_(T, n, s), _(x, n, s), Du(t.props) || i && i.pendingBranch) {
                    C(t);
                    return
                }
                L && (I(t, n, x), Wn(t, !0)), A()
            } else {
                t.el = e.el;
                const T = t.anchor = e.anchor,
                    x = Xt.get(e);
                if (x) {
                    x.flags |= 8, Xt.delete(e), C(t);
                    return
                }
                t.targetStart = e.targetStart;
                const W = t.target = e.target,
                    te = t.targetAnchor = e.targetAnchor,
                    de = vn(e.props),
                    B = de ? n : W,
                    k = de ? T : te;
                if (a === "svg" || Fo(W) ? a = "svg" : (a === "mathml" || Bo(W)) && (a = "mathml"), K ? (m(e.dynamicChildren, K, B, o, i, a, r), ho(e, t, !0)) : u || f(e, t, B, k, o, i, a, r, !1), L) de ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to) : xs(t, n, T, c, 1);
                else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
                    const $ = Dl(t.props, P);
                    $ && (t.target = $, xs(t, $, null, c, 0))
                } else de && xs(t, W, te, c, 1);
                Wn(t, L)
            }
        },
        remove(e, t, n, {
            um: s,
            o: {
                remove: o
            }
        }, i) {
            const {
                shapeFlag: a,
                children: r,
                anchor: u,
                targetStart: c,
                targetAnchor: d,
                target: f,
                props: m
            } = e, _ = vn(m), P = i || !_, E = Xt.get(e);
            if (E && (E.flags |= 8, Xt.delete(e)), f && (o(c), o(d)), i && o(u), !E && (_ || f) && a & 16)
                for (let N = 0; N < r.length; N++) {
                    const M = r[N];
                    s(M, t, n, P, !!M.dynamicChildren)
                }
        },
        move: xs,
        hydrate: Uu
    };

function xs(e, t, n, {
    o: {
        insert: s
    },
    m: o
}, i = 2) {
    i === 0 && s(e.targetAnchor, t, n);
    const {
        el: a,
        anchor: r,
        shapeFlag: u,
        children: c,
        props: d
    } = e, f = i === 2;
    if (f && s(a, t, n), !Xt.has(e) && (!f || vn(d)) && u & 16)
        for (let m = 0; m < c.length; m++) o(c[m], t, n, 2);
    f && s(r, t, n)
}

function Uu(e, t, n, s, o, i, {
    o: {
        nextSibling: a,
        parentNode: r,
        querySelector: u,
        insert: c,
        createText: d
    }
}, f) {
    function m(N, M) {
        let L = M;
        for (; L;) {
            if (L && L.nodeType === 8) {
                if (L.data === "teleport start anchor") t.targetStart = L;
                else if (L.data === "teleport anchor") {
                    t.targetAnchor = L, N._lpa = t.targetAnchor && a(t.targetAnchor);
                    break
                }
            }
            L = a(L)
        }
    }

    function _(N, M) {
        M.anchor = f(a(N), M, r(N), n, s, o, i)
    }
    const P = t.target = Dl(t.props, u),
        E = vn(t.props);
    if (P) {
        const N = P._lpa || P.firstChild;
        t.shapeFlag & 16 && (E ? (_(e, t), m(P, N), t.targetAnchor || Ll(P, t, d, c, r(e) === P ? e : null)) : (t.anchor = a(e), m(P, N), t.targetAnchor || Ll(P, t, d, c), f(N && a(N), t, P, n, s, o, i))), Wn(t, E)
    } else E && t.shapeFlag & 16 && (_(e, t), t.targetStart = e, t.targetAnchor = a(e));
    return t.anchor && a(t.anchor)
}
const Vu = Lu;

function Wn(e, t) {
    const n = e.ctx;
    if (n && n.ut) {
        let s, o;
        for (t ? (s = e.el, o = e.anchor) : (s = e.targetStart, o = e.targetAnchor); s && s !== o;) s.nodeType === 1 && s.setAttribute("data-v-owner", n.uid), s = s.nextSibling;
        n.ut()
    }
}

function Ll(e, t, n, s, o = null) {
    const i = t.targetStart = n(""),
        a = t.targetAnchor = n("");
    return i[Ma] = a, e && (s(i, e, o), s(a, e, o)), a
}
const gt = Symbol("_leaveCb"),
    Bn = Symbol("_enterCb");

function Fu() {
    const e = {
        isMounted: !1,
        isLeaving: !1,
        isUnmounting: !1,
        leavingVNodes: new Map
    };
    return dt(() => {
        e.isMounted = !0
    }), _n(() => {
        e.isUnmounting = !0
    }), e
}
const mt = [Function, Array],
    Da = {
        mode: String,
        appear: Boolean,
        persisted: Boolean,
        onBeforeEnter: mt,
        onEnter: mt,
        onAfterEnter: mt,
        onEnterCancelled: mt,
        onBeforeLeave: mt,
        onLeave: mt,
        onAfterLeave: mt,
        onLeaveCancelled: mt,
        onBeforeAppear: mt,
        onAppear: mt,
        onAfterAppear: mt,
        onAppearCancelled: mt
    },
    La = e => {
        const t = e.subTree;
        return t.component ? La(t.component) : t
    },
    Bu = {
        name: "BaseTransition",
        props: Da,
        setup(e, {
            slots: t
        }) {
            const n = mo(),
                s = Fu();
            return () => {
                const o = t.default && Fa(t.default(), !0),
                    i = o && o.length ? Ua(o) : n.subTree ? V() : void 0;
                if (!i) return;
                const a = Me(e),
                    {
                        mode: r
                    } = a;
                if (s.isLeaving) return yl(i);
                const u = jo(i);
                if (!u) return yl(i);
                let c = Ul(u, a, s, n, f => c = f);
                u.type !== ut && as(u, c);
                let d = n.subTree && jo(n.subTree);
                if (d && d.type !== ut && !pn(d, u) && La(n).type !== ut) {
                    let f = Ul(d, a, s, n);
                    if (as(d, f), r === "out-in" && u.type !== ut) return s.isLeaving = !0, f.afterLeave = () => {
                        s.isLeaving = !1, n.job.flags & 8 || n.update(), delete f.afterLeave, d = void 0
                    }, yl(i);
                    r === "in-out" && u.type !== ut ? f.delayLeave = (m, _, P) => {
                        const E = Va(s, d);
                        E[String(d.key)] = d, m[gt] = () => {
                            _(), m[gt] = void 0, delete c.delayedLeave, d = void 0
                        }, c.delayedLeave = () => {
                            P(), delete c.delayedLeave, d = void 0
                        }
                    } : d = void 0
                } else d && (d = void 0);
                return i
            }
        }
    };

function Ua(e) {
    let t = e[0];
    if (e.length > 1) {
        for (const n of e)
            if (n.type !== ut) {
                t = n;
                break
            }
    }
    return t
}
const ju = Bu;

function Va(e, t) {
    const {
        leavingVNodes: n
    } = e;
    let s = n.get(t.type);
    return s || (s = Object.create(null), n.set(t.type, s)), s
}

function Ul(e, t, n, s, o) {
    const {
        appear: i,
        mode: a,
        persisted: r = !1,
        onBeforeEnter: u,
        onEnter: c,
        onAfterEnter: d,
        onEnterCancelled: f,
        onBeforeLeave: m,
        onLeave: _,
        onAfterLeave: P,
        onLeaveCancelled: E,
        onBeforeAppear: N,
        onAppear: M,
        onAfterAppear: L,
        onAppearCancelled: K
    } = t, I = String(e.key), A = Va(n, e), C = (W, te) => {
        W && _t(W, s, 9, te)
    }, T = (W, te) => {
        const de = te[1];
        C(W, te), be(W) ? W.every(B => B.length <= 1) && de() : W.length <= 1 && de()
    }, x = {
        mode: a,
        persisted: r,
        beforeEnter(W) {
            let te = u;
            if (!n.isMounted)
                if (i) te = N || u;
                else return;
            W[gt] && W[gt](!0);
            const de = A[I];
            de && pn(e, de) && de.el[gt] && de.el[gt](), C(te, [W])
        },
        enter(W) {
            if (A[I] === e) return;
            let te = c,
                de = d,
                B = f;
            if (!n.isMounted)
                if (i) te = M || c, de = L || d, B = K || f;
                else return;
            let k = !1;
            W[Bn] = j => {
                k || (k = !0, j ? C(B, [W]) : C(de, [W]), x.delayedLeave && x.delayedLeave(), W[Bn] = void 0)
            };
            const $ = W[Bn].bind(null, !1);
            te ? T(te, [W, $]) : $()
        },
        leave(W, te) {
            const de = String(e.key);
            if (W[Bn] && W[Bn](!0), n.isUnmounting) return te();
            C(m, [W]);
            let B = !1;
            W[gt] = $ => {
                B || (B = !0, te(), $ ? C(E, [W]) : C(P, [W]), W[gt] = void 0, A[de] === e && delete A[de])
            };
            const k = W[gt].bind(null, !1);
            A[de] = e, _ ? T(_, [W, k]) : k()
        },
        clone(W) {
            const te = Ul(W, t, n, s, o);
            return o && o(te), te
        }
    };
    return x
}

function yl(e) {
    if (el(e)) return e = nn(e), e.children = null, e
}

function jo(e) {
    if (!el(e)) return Na(e.type) && e.children ? Ua(e.children) : e;
    if (e.component) return e.component.subTree;
    const {
        shapeFlag: t,
        children: n
    } = e;
    if (n) {
        if (t & 16) return n[0];
        if (t & 32 && Ce(n.default)) return n.default()
    }
}

function as(e, t) {
    e.shapeFlag & 6 && e.component ? (e.transition = t, as(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t
}

function Fa(e, t = !1, n) {
    let s = [],
        o = 0;
    for (let i = 0; i < e.length; i++) {
        let a = e[i];
        const r = n == null ? a.key : String(n) + String(a.key != null ? a.key : i);
        a.type === ue ? (a.patchFlag & 128 && o++, s = s.concat(Fa(a.children, t, r))) : (t || a.type !== ut) && s.push(r != null ? nn(a, {
            key: r
        }) : a)
    }
    if (o > 1)
        for (let i = 0; i < s.length; i++) s[i].patchFlag = -2;
    return s
}

function Fe(e, t) {
    return Ce(e) ? tt({
        name: e.name
    }, t, {
        setup: e
    }) : e
}

function Ba(e) {
    e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0]
}

function Ho(e, t) {
    let n;
    return !!((n = Object.getOwnPropertyDescriptor(e, t)) && !n.configurable)
}
const Ns = new WeakMap;

function Qn(e, t, n, s, o = !1) {
    if (be(e)) {
        e.forEach((E, N) => Qn(E, t && (be(t) ? t[N] : t), n, s, o));
        return
    }
    if (Zn(s) && !o) {
        s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && Qn(e, t, n, s.component.subTree);
        return
    }
    const i = s.shapeFlag & 4 ? ll(s.component) : s.el,
        a = o ? null : i,
        {
            i: r,
            r: u
        } = e,
        c = t && t.r,
        d = r.refs === Be ? r.refs = {} : r.refs,
        f = r.setupState,
        m = Me(f),
        _ = f === Be ? ea : E => Ho(d, E) ? !1 : Ue(m, E),
        P = (E, N) => !(N && Ho(d, N));
    if (c != null && c !== u) {
        if (Ko(t), He(c)) d[c] = null, _(c) && (f[c] = null);
        else if (Xe(c)) {
            const E = t;
            P(c, E.k) && (c.value = null), E.k && (d[E.k] = null)
        }
    }
    if (Ce(u)) ms(u, r, 12, [a, d]);
    else {
        const E = He(u),
            N = Xe(u);
        if (E || N) {
            const M = () => {
                if (e.f) {
                    const L = E ? _(u) ? f[u] : d[u] : P() || !e.k ? u.value : d[e.k];
                    if (o) be(L) && eo(L, i);
                    else if (be(L)) L.includes(i) || L.push(i);
                    else if (E) d[u] = [i], _(u) && (f[u] = d[u]);
                    else {
                        const K = [i];
                        P(u, e.k) && (u.value = K), e.k && (d[e.k] = K)
                    }
                } else E ? (d[u] = a, _(u) && (f[u] = a)) : N && (P(u, e.k) && (u.value = a), e.k && (d[e.k] = a))
            };
            if (a) {
                const L = () => {
                    M(), Ns.delete(e)
                };
                L.id = -1, Ns.set(e, L), it(L, n)
            } else Ko(e), M()
        }
    }
}

function Ko(e) {
    const t = Ns.get(e);
    t && (t.flags |= 8, Ns.delete(e))
}
Xs().requestIdleCallback;
Xs().cancelIdleCallback;
const Zn = e => !!e.type.__asyncLoader,
    el = e => e.type.__isKeepAlive;

function Hu(e, t) {
    ja(e, "a", t)
}

function Ku(e, t) {
    ja(e, "da", t)
}

function ja(e, t, n = st) {
    const s = e.__wdc || (e.__wdc = () => {
        let o = n;
        for (; o;) {
            if (o.isDeactivated) return;
            o = o.parent
        }
        return e()
    });
    if (tl(t, s, n), n) {
        let o = n.parent;
        for (; o && o.parent;) el(o.parent.vnode) && Gu(s, t, n, o), o = o.parent
    }
}

function Gu(e, t, n, s) {
    const o = tl(t, e, s, !0);
    wn(() => {
        eo(s[t], o)
    }, n)
}

function tl(e, t, n = st, s = !1) {
    if (n) {
        const o = n[e] || (n[e] = []),
            i = t.__weh || (t.__weh = (...a) => {
                jt();
                const r = gs(n),
                    u = _t(t, n, e, a);
                return r(), Ht(), u
            });
        return s ? o.unshift(i) : o.push(i), i
    }
}
const qt = e => (t, n = st) => {
        (!us || e === "sp") && tl(e, (...s) => t(...s), n)
    },
    Wu = qt("bm"),
    dt = qt("m"),
    qu = qt("bu"),
    zu = qt("u"),
    _n = qt("bum"),
    wn = qt("um"),
    Ju = qt("sp"),
    Xu = qt("rtg"),
    Yu = qt("rtc");

function Qu(e, t = st) {
    tl("ec", e, t)
}
const Ha = "components";

function Zu(e, t) {
    return Ga(Ha, e, !0, t) || e
}
const Ka = Symbol.for("v-ndc");

function ec(e) {
    return He(e) ? Ga(Ha, e, !1) || e : e || Ka
}

function Ga(e, t, n = !0, s = !1) {
    const o = ft || st;
    if (o) {
        const i = o.type;
        {
            const r = Lc(i, !1);
            if (r && (r === t || r === ct(t) || r === zs(ct(t)))) return i
        }
        const a = Go(o[e] || i[e], t) || Go(o.appContext[e], t);
        return !a && s ? i : a
    }
}

function Go(e, t) {
    return e && (e[t] || e[ct(t)] || e[zs(ct(t))])
}

function Oe(e, t, n, s) {
    let o;
    const i = n,
        a = be(e);
    if (a || He(e)) {
        const r = a && Vt(e);
        let u = !1,
            c = !1;
        r && (u = !ht(e), c = Kt(e), e = Ys(e)), o = new Array(e.length);
        for (let d = 0, f = e.length; d < f; d++) o[d] = t(u ? c ? In(kt(e[d])) : kt(e[d]) : e[d], d, void 0, i)
    } else if (typeof e == "number") {
        o = new Array(e);
        for (let r = 0; r < e; r++) o[r] = t(r + 1, r, void 0, i)
    } else if (Ve(e))
        if (e[Symbol.iterator]) o = Array.from(e, (r, u) => t(r, u, void 0, i));
        else {
            const r = Object.keys(e);
            o = new Array(r.length);
            for (let u = 0, c = r.length; u < c; u++) {
                const d = r[u];
                o[u] = t(e[d], d, u, i)
            }
        }
    else o = [];
    return o
}
const Vl = e => e ? dr(e) ? ll(e) : Vl(e.parent) : null,
    es = tt(Object.create(null), {
        $: e => e,
        $el: e => e.vnode.el,
        $data: e => e.data,
        $props: e => e.props,
        $attrs: e => e.attrs,
        $slots: e => e.slots,
        $refs: e => e.refs,
        $parent: e => Vl(e.parent),
        $root: e => Vl(e.root),
        $host: e => e.ce,
        $emit: e => e.emit,
        $options: e => qa(e),
        $forceUpdate: e => e.f || (e.f = () => {
            fo(e.update)
        }),
        $nextTick: e => e.n || (e.n = Gt.bind(e.proxy)),
        $watch: e => Nu.bind(e)
    }),
    bl = (e, t) => e !== Be && !e.__isScriptSetup && Ue(e, t),
    tc = {
        get({
            _: e
        }, t) {
            if (t === "__v_skip") return !0;
            const {
                ctx: n,
                setupState: s,
                data: o,
                props: i,
                accessCache: a,
                type: r,
                appContext: u
            } = e;
            if (t[0] !== "$") {
                const m = a[t];
                if (m !== void 0) switch (m) {
                    case 1:
                        return s[t];
                    case 2:
                        return o[t];
                    case 4:
                        return n[t];
                    case 3:
                        return i[t]
                } else {
                    if (bl(s, t)) return a[t] = 1, s[t];
                    if (o !== Be && Ue(o, t)) return a[t] = 2, o[t];
                    if (Ue(i, t)) return a[t] = 3, i[t];
                    if (n !== Be && Ue(n, t)) return a[t] = 4, n[t];
                    Fl && (a[t] = 0)
                }
            }
            const c = es[t];
            let d, f;
            if (c) return t === "$attrs" && nt(e.attrs, "get", ""), c(e);
            if ((d = r.__cssModules) && (d = d[t])) return d;
            if (n !== Be && Ue(n, t)) return a[t] = 4, n[t];
            if (f = u.config.globalProperties, Ue(f, t)) return f[t]
        },
        set({
            _: e
        }, t, n) {
            const {
                data: s,
                setupState: o,
                ctx: i
            } = e;
            return bl(o, t) ? (o[t] = n, !0) : s !== Be && Ue(s, t) ? (s[t] = n, !0) : Ue(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = n, !0)
        },
        has({
            _: {
                data: e,
                setupState: t,
                accessCache: n,
                ctx: s,
                appContext: o,
                props: i,
                type: a
            }
        }, r) {
            let u;
            return !!(n[r] || e !== Be && r[0] !== "$" && Ue(e, r) || bl(t, r) || Ue(i, r) || Ue(s, r) || Ue(es, r) || Ue(o.config.globalProperties, r) || (u = a.__cssModules) && u[r])
        },
        defineProperty(e, t, n) {
            return n.get != null ? e._.accessCache[t] = 0 : Ue(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n)
        }
    };

function Wo(e) {
    return be(e) ? e.reduce((t, n) => (t[n] = null, t), {}) : e
}
let Fl = !0;

function nc(e) {
    const t = qa(e),
        n = e.proxy,
        s = e.ctx;
    Fl = !1, t.beforeCreate && qo(t.beforeCreate, e, "bc");
    const {
        data: o,
        computed: i,
        methods: a,
        watch: r,
        provide: u,
        inject: c,
        created: d,
        beforeMount: f,
        mounted: m,
        beforeUpdate: _,
        updated: P,
        activated: E,
        deactivated: N,
        beforeDestroy: M,
        beforeUnmount: L,
        destroyed: K,
        unmounted: I,
        render: A,
        renderTracked: C,
        renderTriggered: T,
        errorCaptured: x,
        serverPrefetch: W,
        expose: te,
        inheritAttrs: de,
        components: B,
        directives: k,
        filters: $
    } = t;
    if (c && sc(c, s, null), a)
        for (const H in a) {
            const ne = a[H];
            Ce(ne) && (s[H] = ne.bind(n))
        }
    if (o) {
        const H = o.call(n, n);
        Ve(H) && (e.data = hs(H))
    }
    if (Fl = !0, i)
        for (const H in i) {
            const ne = i[H],
                Ne = Ce(ne) ? ne.bind(n, n) : Ce(ne.get) ? ne.get.bind(n, n) : Rt,
                se = !Ce(ne) && Ce(ne.set) ? ne.set.bind(n) : Rt,
                b = me({
                    get: Ne,
                    set: se
                });
            Object.defineProperty(s, H, {
                enumerable: !0,
                configurable: !0,
                get: () => b.value,
                set: ve => b.value = ve
            })
        }
    if (r)
        for (const H in r) Wa(r[H], s, n, H);
    if (u) {
        const H = Ce(u) ? u.call(n) : u;
        Reflect.ownKeys(H).forEach(ne => {
            As(ne, H[ne])
        })
    }
    d && qo(d, e, "c");

    function le(H, ne) {
        be(ne) ? ne.forEach(Ne => H(Ne.bind(n))) : ne && H(ne.bind(n))
    }
    if (le(Wu, f), le(dt, m), le(qu, _), le(zu, P), le(Hu, E), le(Ku, N), le(Qu, x), le(Yu, C), le(Xu, T), le(_n, L), le(wn, I), le(Ju, W), be(te))
        if (te.length) {
            const H = e.exposed || (e.exposed = {});
            te.forEach(ne => {
                Object.defineProperty(H, ne, {
                    get: () => n[ne],
                    set: Ne => n[ne] = Ne,
                    enumerable: !0
                })
            })
        } else e.exposed || (e.exposed = {});
    A && e.render === Rt && (e.render = A), de != null && (e.inheritAttrs = de), B && (e.components = B), k && (e.directives = k), W && Ba(e)
}

function sc(e, t, n = Rt) {
    be(e) && (e = Bl(e));
    for (const s in e) {
        const o = e[s];
        let i;
        Ve(o) ? "default" in o ? i = yt(o.from || s, o.default, !0) : i = yt(o.from || s) : i = yt(o), Xe(i) ? Object.defineProperty(t, s, {
            enumerable: !0,
            configurable: !0,
            get: () => i.value,
            set: a => i.value = a
        }) : t[s] = i
    }
}

function qo(e, t, n) {
    _t(be(e) ? e.map(s => s.bind(t.proxy)) : e.bind(t.proxy), t, n)
}

function Wa(e, t, n, s) {
    let o = s.includes(".") ? Pa(n, s) : () => n[s];
    if (He(e)) {
        const i = t[e];
        Ce(i) && et(o, i)
    } else if (Ce(e)) et(o, e.bind(n));
    else if (Ve(e))
        if (be(e)) e.forEach(i => Wa(i, t, n, s));
        else {
            const i = Ce(e.handler) ? e.handler.bind(n) : t[e.handler];
            Ce(i) && et(o, i, e)
        }
}

function qa(e) {
    const t = e.type,
        {
            mixins: n,
            extends: s
        } = t,
        {
            mixins: o,
            optionsCache: i,
            config: {
                optionMergeStrategies: a
            }
        } = e.appContext,
        r = i.get(t);
    let u;
    return r ? u = r : !o.length && !n && !s ? u = t : (u = {}, o.length && o.forEach(c => Ds(u, c, a, !0)), Ds(u, t, a)), Ve(t) && i.set(t, u), u
}

function Ds(e, t, n, s = !1) {
    const {
        mixins: o,
        extends: i
    } = t;
    i && Ds(e, i, n, !0), o && o.forEach(a => Ds(e, a, n, !0));
    for (const a in t)
        if (!(s && a === "expose")) {
            const r = lc[a] || n && n[a];
            e[a] = r ? r(e[a], t[a]) : t[a]
        } return e
}
const lc = {
    data: zo,
    props: Jo,
    emits: Jo,
    methods: qn,
    computed: qn,
    beforeCreate: ot,
    created: ot,
    beforeMount: ot,
    mounted: ot,
    beforeUpdate: ot,
    updated: ot,
    beforeDestroy: ot,
    beforeUnmount: ot,
    destroyed: ot,
    unmounted: ot,
    activated: ot,
    deactivated: ot,
    errorCaptured: ot,
    serverPrefetch: ot,
    components: qn,
    directives: qn,
    watch: ic,
    provide: zo,
    inject: oc
};

function zo(e, t) {
    return t ? e ? function() {
        return tt(Ce(e) ? e.call(this, this) : e, Ce(t) ? t.call(this, this) : t)
    } : t : e
}

function oc(e, t) {
    return qn(Bl(e), Bl(t))
}

function Bl(e) {
    if (be(e)) {
        const t = {};
        for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
        return t
    }
    return e
}

function ot(e, t) {
    return e ? [...new Set([].concat(e, t))] : t
}

function qn(e, t) {
    return e ? tt(Object.create(null), e, t) : t
}

function Jo(e, t) {
    return e ? be(e) && be(t) ? [...new Set([...e, ...t])] : tt(Object.create(null), Wo(e), Wo(t ?? {})) : t
}

function ic(e, t) {
    if (!e) return t;
    if (!t) return e;
    const n = tt(Object.create(null), e);
    for (const s in t) n[s] = ot(e[s], t[s]);
    return n
}

function za() {
    return {
        app: null,
        config: {
            isNativeTag: ea,
            performance: !1,
            globalProperties: {},
            optionMergeStrategies: {},
            errorHandler: void 0,
            warnHandler: void 0,
            compilerOptions: {}
        },
        mixins: [],
        components: {},
        directives: {},
        provides: Object.create(null),
        optionsCache: new WeakMap,
        propsCache: new WeakMap,
        emitsCache: new WeakMap
    }
}
let ac = 0;

function rc(e, t) {
    return function(s, o = null) {
        Ce(s) || (s = tt({}, s)), o != null && !Ve(o) && (o = null);
        const i = za(),
            a = new WeakSet,
            r = [];
        let u = !1;
        const c = i.app = {
            _uid: ac++,
            _component: s,
            _props: o,
            _container: null,
            _context: i,
            _instance: null,
            version: Vc,
            get config() {
                return i.config
            },
            set config(d) {},
            use(d, ...f) {
                return a.has(d) || (d && Ce(d.install) ? (a.add(d), d.install(c, ...f)) : Ce(d) && (a.add(d), d(c, ...f))), c
            },
            mixin(d) {
                return i.mixins.includes(d) || i.mixins.push(d), c
            },
            component(d, f) {
                return f ? (i.components[d] = f, c) : i.components[d]
            },
            directive(d, f) {
                return f ? (i.directives[d] = f, c) : i.directives[d]
            },
            mount(d, f, m) {
                if (!u) {
                    const _ = c._ceVNode || Re(s, o);
                    return _.appContext = i, m === !0 ? m = "svg" : m === !1 && (m = void 0), e(_, d, m), u = !0, c._container = d, d.__vue_app__ = c, ll(_.component)
                }
            },
            onUnmount(d) {
                r.push(d)
            },
            unmount() {
                u && (_t(r, c._instance, 16), e(null, c._container), delete c._container.__vue_app__)
            },
            provide(d, f) {
                return i.provides[d] = f, c
            },
            runWithContext(d) {
                const f = gn;
                gn = c;
                try {
                    return d()
                } finally {
                    gn = f
                }
            }
        };
        return c
    }
}
let gn = null;
const uc = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${ct(t)}Modifiers`] || e[`${ln(t)}Modifiers`];

function cc(e, t, ...n) {
    if (e.isUnmounted) return;
    const s = e.vnode.props || Be;
    let o = n;
    const i = t.startsWith("update:"),
        a = i && uc(s, t.slice(7));
    a && (a.trim && (o = n.map(d => He(d) ? d.trim() : d)), a.number && (o = n.map(Js)));
    let r, u = s[r = vl(t)] || s[r = vl(ct(t))];
    !u && i && (u = s[r = vl(ln(t))]), u && _t(u, e, 6, o);
    const c = s[r + "Once"];
    if (c) {
        if (!e.emitted) e.emitted = {};
        else if (e.emitted[r]) return;
        e.emitted[r] = !0, _t(c, e, 6, o)
    }
}
const dc = new WeakMap;

function Ja(e, t, n = !1) {
    const s = n ? dc : t.emitsCache,
        o = s.get(e);
    if (o !== void 0) return o;
    const i = e.emits;
    let a = {},
        r = !1;
    if (!Ce(e)) {
        const u = c => {
            const d = Ja(c, t, !0);
            d && (r = !0, tt(a, d))
        };
        !n && t.mixins.length && t.mixins.forEach(u), e.extends && u(e.extends), e.mixins && e.mixins.forEach(u)
    }
    return !i && !r ? (Ve(e) && s.set(e, null), null) : (be(i) ? i.forEach(u => a[u] = null) : tt(a, i), Ve(e) && s.set(e, a), a)
}

function nl(e, t) {
    return !e || !Ks(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), Ue(e, t[0].toLowerCase() + t.slice(1)) || Ue(e, ln(t)) || Ue(e, t))
}

function Xo(e) {
    const {
        type: t,
        vnode: n,
        proxy: s,
        withProxy: o,
        propsOptions: [i],
        slots: a,
        attrs: r,
        emit: u,
        render: c,
        renderCache: d,
        props: f,
        data: m,
        setupState: _,
        ctx: P,
        inheritAttrs: E
    } = e, N = Ms(e);
    let M, L;
    try {
        if (n.shapeFlag & 4) {
            const I = o || s,
                A = I;
            M = St(c.call(A, I, d, f, _, m, P)), L = r
        } else {
            const I = t;
            M = St(I.length > 1 ? I(f, {
                attrs: r,
                slots: a,
                emit: u
            }) : I(f, null)), L = t.props ? r : fc(r)
        }
    } catch (I) {
        yn.length = 0, Zs(I, e, 1), M = Re(ut)
    }
    let K = M;
    if (L && E !== !1) {
        const I = Object.keys(L),
            {
                shapeFlag: A
            } = K;
        I.length && A & 7 && (i && I.some(Gs) && (L = vc(L, i)), K = nn(K, L, !1, !0))
    }
    return n.dirs && (K = nn(K, null, !1, !0), K.dirs = K.dirs ? K.dirs.concat(n.dirs) : n.dirs), n.transition && as(K, n.transition), M = K, Ms(N), M
}
const fc = e => {
        let t;
        for (const n in e)(n === "class" || n === "style" || Ks(n)) && ((t || (t = {}))[n] = e[n]);
        return t
    },
    vc = (e, t) => {
        const n = {};
        for (const s in e)(!Gs(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
        return n
    };

function pc(e, t, n) {
    const {
        props: s,
        children: o,
        component: i
    } = e, {
        props: a,
        children: r,
        patchFlag: u
    } = t, c = i.emitsOptions;
    if (t.dirs || t.transition) return !0;
    if (n && u >= 0) {
        if (u & 1024) return !0;
        if (u & 16) return s ? Yo(s, a, c) : !!a;
        if (u & 8) {
            const d = t.dynamicProps;
            for (let f = 0; f < d.length; f++) {
                const m = d[f];
                if (Xa(a, s, m) && !nl(c, m)) return !0
            }
        }
    } else return (o || r) && (!r || !r.$stable) ? !0 : s === a ? !1 : s ? a ? Yo(s, a, c) : !0 : !!a;
    return !1
}

function Yo(e, t, n) {
    const s = Object.keys(t);
    if (s.length !== Object.keys(e).length) return !0;
    for (let o = 0; o < s.length; o++) {
        const i = s[o];
        if (Xa(t, e, i) && !nl(n, i)) return !0
    }
    return !1
}

function Xa(e, t, n) {
    const s = e[n],
        o = t[n];
    return n === "style" && Ve(s) && Ve(o) ? !Un(s, o) : s !== o
}

function hc({
    vnode: e,
    parent: t,
    suspense: n
}, s) {
    for (; t;) {
        const o = t.subTree;
        if (o.suspense && o.suspense.activeBranch === e && (o.suspense.vnode.el = o.el = s, e = o), o === e)(e = t.vnode).el = s, t = t.parent;
        else break
    }
    n && n.activeBranch === e && (n.vnode.el = s)
}
const Ya = {},
    Qa = () => Object.create(Ya),
    Za = e => Object.getPrototypeOf(e) === Ya;

function mc(e, t, n, s = !1) {
    const o = {},
        i = Qa();
    e.propsDefaults = Object.create(null), er(e, t, o, i);
    for (const a in e.propsOptions[0]) a in o || (o[a] = void 0);
    n ? e.props = s ? o : Ca(o) : e.type.props ? e.props = o : e.props = i, e.attrs = i
}

function gc(e, t, n, s) {
    const {
        props: o,
        attrs: i,
        vnode: {
            patchFlag: a
        }
    } = e, r = Me(o), [u] = e.propsOptions;
    let c = !1;
    if ((s || a > 0) && !(a & 16)) {
        if (a & 8) {
            const d = e.vnode.dynamicProps;
            for (let f = 0; f < d.length; f++) {
                let m = d[f];
                if (nl(e.emitsOptions, m)) continue;
                const _ = t[m];
                if (u)
                    if (Ue(i, m)) _ !== i[m] && (i[m] = _, c = !0);
                    else {
                        const P = ct(m);
                        o[P] = jl(u, r, P, _, e, !1)
                    }
                else _ !== i[m] && (i[m] = _, c = !0)
            }
        }
    } else {
        er(e, t, o, i) && (c = !0);
        let d;
        for (const f in r)(!t || !Ue(t, f) && ((d = ln(f)) === f || !Ue(t, d))) && (u ? n && (n[f] !== void 0 || n[d] !== void 0) && (o[f] = jl(u, r, f, void 0, e, !0)) : delete o[f]);
        if (i !== r)
            for (const f in i)(!t || !Ue(t, f)) && (delete i[f], c = !0)
    }
    c && Lt(e.attrs, "set", "")
}

function er(e, t, n, s) {
    const [o, i] = e.propsOptions;
    let a = !1,
        r;
    if (t)
        for (let u in t) {
            if (Jn(u)) continue;
            const c = t[u];
            let d;
            o && Ue(o, d = ct(u)) ? !i || !i.includes(d) ? n[d] = c : (r || (r = {}))[d] = c : nl(e.emitsOptions, u) || (!(u in s) || c !== s[u]) && (s[u] = c, a = !0)
        }
    if (i) {
        const u = Me(n),
            c = r || Be;
        for (let d = 0; d < i.length; d++) {
            const f = i[d];
            n[f] = jl(o, u, f, c[f], e, !Ue(c, f))
        }
    }
    return a
}

function jl(e, t, n, s, o, i) {
    const a = e[n];
    if (a != null) {
        const r = Ue(a, "default");
        if (r && s === void 0) {
            const u = a.default;
            if (a.type !== Function && !a.skipFactory && Ce(u)) {
                const {
                    propsDefaults: c
                } = o;
                if (n in c) s = c[n];
                else {
                    const d = gs(o);
                    s = c[n] = u.call(null, t), d()
                }
            } else s = u;
            o.ce && o.ce._setProp(n, s)
        }
        a[0] && (i && !r ? s = !1 : a[1] && (s === "" || s === ln(n)) && (s = !0))
    }
    return s
}
const yc = new WeakMap;

function tr(e, t, n = !1) {
    const s = n ? yc : t.propsCache,
        o = s.get(e);
    if (o) return o;
    const i = e.props,
        a = {},
        r = [];
    let u = !1;
    if (!Ce(e)) {
        const d = f => {
            u = !0;
            const [m, _] = tr(f, t, !0);
            tt(a, m), _ && r.push(..._)
        };
        !n && t.mixins.length && t.mixins.forEach(d), e.extends && d(e.extends), e.mixins && e.mixins.forEach(d)
    }
    if (!i && !u) return Ve(e) && s.set(e, An), An;
    if (be(i))
        for (let d = 0; d < i.length; d++) {
            const f = ct(i[d]);
            Qo(f) && (a[f] = Be)
        } else if (i)
            for (const d in i) {
                const f = ct(d);
                if (Qo(f)) {
                    const m = i[d],
                        _ = a[f] = be(m) || Ce(m) ? {
                            type: m
                        } : tt({}, m),
                        P = _.type;
                    let E = !1,
                        N = !0;
                    if (be(P))
                        for (let M = 0; M < P.length; ++M) {
                            const L = P[M],
                                K = Ce(L) && L.name;
                            if (K === "Boolean") {
                                E = !0;
                                break
                            } else K === "String" && (N = !1)
                        } else E = Ce(P) && P.name === "Boolean";
                    _[0] = E, _[1] = N, (E || Ue(_, "default")) && r.push(f)
                }
            }
    const c = [a, r];
    return Ve(e) && s.set(e, c), c
}

function Qo(e) {
    return e[0] !== "$" && !Jn(e)
}
const vo = e => e === "_" || e === "_ctx" || e === "$stable",
    po = e => be(e) ? e.map(St) : [St(e)],
    bc = (e, t, n) => {
        if (t._n) return t;
        const s = is((...o) => po(t(...o)), n);
        return s._c = !1, s
    },
    nr = (e, t, n) => {
        const s = e._ctx;
        for (const o in e) {
            if (vo(o)) continue;
            const i = e[o];
            if (Ce(i)) t[o] = bc(o, i, s);
            else if (i != null) {
                const a = po(i);
                t[o] = () => a
            }
        }
    },
    sr = (e, t) => {
        const n = po(t);
        e.slots.default = () => n
    },
    lr = (e, t, n) => {
        for (const s in t)(n || !vo(s)) && (e[s] = t[s])
    },
    _c = (e, t, n) => {
        const s = e.slots = Qa();
        if (e.vnode.shapeFlag & 32) {
            const o = t._;
            o ? (lr(s, t, n), n && la(s, "_", o, !0)) : nr(t, s)
        } else t && sr(e, t)
    },
    wc = (e, t, n) => {
        const {
            vnode: s,
            slots: o
        } = e;
        let i = !0,
            a = Be;
        if (s.shapeFlag & 32) {
            const r = t._;
            r ? n && r === 1 ? i = !1 : lr(o, t, n) : (i = !t.$stable, nr(t, o)), a = t
        } else t && (sr(e, t), a = {
            default: 1
        });
        if (i)
            for (const r in o) !vo(r) && a[r] == null && delete o[r]
    },
    it = xc;

function kc(e) {
    return $c(e)
}

function $c(e, t) {
    const n = Xs();
    n.__VUE__ = !0;
    const {
        insert: s,
        remove: o,
        patchProp: i,
        createElement: a,
        createText: r,
        createComment: u,
        setText: c,
        setElementText: d,
        parentNode: f,
        nextSibling: m,
        setScopeId: _ = Rt,
        insertStaticContent: P
    } = e, E = (y, g, R, F = null, Y = null, q = null, re = void 0, ie = null, oe = !!g.dynamicChildren) => {
        if (y === g) return;
        y && !pn(y, g) && (F = z(y), ve(y, Y, q, !0), y = null), g.patchFlag === -2 && (oe = !1, g.dynamicChildren = null);
        const {
            type: Z,
            ref: U,
            shapeFlag: S
        } = g;
        switch (Z) {
            case sl:
                N(y, g, R, F);
                break;
            case ut:
                M(y, g, R, F);
                break;
            case Rs:
                y == null && L(g, R, F, re);
                break;
            case ue:
                B(y, g, R, F, Y, q, re, ie, oe);
                break;
            default:
                S & 1 ? A(y, g, R, F, Y, q, re, ie, oe) : S & 6 ? k(y, g, R, F, Y, q, re, ie, oe) : (S & 64 || S & 128) && Z.process(y, g, R, F, Y, q, re, ie, oe, J)
        }
        U != null && Y ? Qn(U, y && y.ref, q, g || y, !g) : U == null && y && y.ref != null && Qn(y.ref, null, q, y, !0)
    }, N = (y, g, R, F) => {
        if (y == null) s(g.el = r(g.children), R, F);
        else {
            const Y = g.el = y.el;
            g.children !== y.children && c(Y, g.children)
        }
    }, M = (y, g, R, F) => {
        y == null ? s(g.el = u(g.children || ""), R, F) : g.el = y.el
    }, L = (y, g, R, F) => {
        [y.el, y.anchor] = P(y.children, g, R, F, y.el, y.anchor)
    }, K = ({
        el: y,
        anchor: g
    }, R, F) => {
        let Y;
        for (; y && y !== g;) Y = m(y), s(y, R, F), y = Y;
        s(g, R, F)
    }, I = ({
        el: y,
        anchor: g
    }) => {
        let R;
        for (; y && y !== g;) R = m(y), o(y), y = R;
        o(g)
    }, A = (y, g, R, F, Y, q, re, ie, oe) => {
        if (g.type === "svg" ? re = "svg" : g.type === "math" && (re = "mathml"), y == null) C(g, R, F, Y, q, re, ie, oe);
        else {
            const Z = y.el && y.el._isVueCE ? y.el : null;
            try {
                Z && Z._beginPatch(), W(y, g, Y, q, re, ie, oe)
            } finally {
                Z && Z._endPatch()
            }
        }
    }, C = (y, g, R, F, Y, q, re, ie) => {
        let oe, Z;
        const {
            props: U,
            shapeFlag: S,
            transition: X,
            dirs: fe
        } = y;
        if (oe = y.el = a(y.type, q, U && U.is, U), S & 8 ? d(oe, y.children) : S & 16 && x(y.children, oe, null, F, Y, _l(y, q), re, ie), fe && rn(y, null, F, "created"), T(oe, y, y.scopeId, re, F), U) {
            for (const ke in U) ke !== "value" && !Jn(ke) && i(oe, ke, null, U[ke], q, F);
            "value" in U && i(oe, "value", null, U.value, q), (Z = U.onVnodeBeforeMount) && Ct(Z, F, y)
        }
        fe && rn(y, null, F, "beforeMount");
        const ge = Cc(Y, X);
        ge && X.beforeEnter(oe), s(oe, g, R), ((Z = U && U.onVnodeMounted) || ge || fe) && it(() => {
            try {
                Z && Ct(Z, F, y), ge && X.enter(oe), fe && rn(y, null, F, "mounted")
            } finally {}
        }, Y)
    }, T = (y, g, R, F, Y) => {
        if (R && _(y, R), F)
            for (let q = 0; q < F.length; q++) _(y, F[q]);
        if (Y) {
            let q = Y.subTree;
            if (g === q || ar(q.type) && (q.ssContent === g || q.ssFallback === g)) {
                const re = Y.vnode;
                T(y, re, re.scopeId, re.slotScopeIds, Y.parent)
            }
        }
    }, x = (y, g, R, F, Y, q, re, ie, oe = 0) => {
        for (let Z = oe; Z < y.length; Z++) {
            const U = y[Z] = ie ? Dt(y[Z]) : St(y[Z]);
            E(null, U, g, R, F, Y, q, re, ie)
        }
    }, W = (y, g, R, F, Y, q, re) => {
        const ie = g.el = y.el;
        let {
            patchFlag: oe,
            dynamicChildren: Z,
            dirs: U
        } = g;
        oe |= y.patchFlag & 16;
        const S = y.props || Be,
            X = g.props || Be;
        let fe;
        if (R && un(R, !1), (fe = X.onVnodeBeforeUpdate) && Ct(fe, R, g, y), U && rn(g, y, R, "beforeUpdate"), R && un(R, !0), Z && (!y.dynamicChildren || y.dynamicChildren.length !== Z.length) && (oe = 0, re = !1, Z = null), (S.innerHTML && X.innerHTML == null || S.textContent && X.textContent == null) && d(ie, ""), Z ? te(y.dynamicChildren, Z, ie, R, F, _l(g, Y), q) : re || ne(y, g, ie, null, R, F, _l(g, Y), q, !1), oe > 0) {
            if (oe & 16) de(ie, S, X, R, Y);
            else if (oe & 2 && S.class !== X.class && i(ie, "class", null, X.class, Y), oe & 4 && i(ie, "style", S.style, X.style, Y), oe & 8) {
                const ge = g.dynamicProps;
                for (let ke = 0; ke < ge.length; ke++) {
                    const _e = ge[ke],
                        Te = S[_e],
                        Pe = X[_e];
                    (Pe !== Te || _e === "value") && i(ie, _e, Te, Pe, Y, R)
                }
            }
            oe & 1 && y.children !== g.children && d(ie, g.children)
        } else !re && Z == null && de(ie, S, X, R, Y);
        ((fe = X.onVnodeUpdated) || U) && it(() => {
            fe && Ct(fe, R, g, y), U && rn(g, y, R, "updated")
        }, F)
    }, te = (y, g, R, F, Y, q, re) => {
        for (let ie = 0; ie < g.length; ie++) {
            const oe = y[ie],
                Z = g[ie],
                U = oe.el && (oe.type === ue || !pn(oe, Z) || oe.shapeFlag & 198) ? f(oe.el) : R;
            E(oe, Z, U, null, F, Y, q, re, !0)
        }
    }, de = (y, g, R, F, Y) => {
        if (g !== R) {
            if (g !== Be)
                for (const q in g) !Jn(q) && !(q in R) && i(y, q, g[q], null, Y, F);
            for (const q in R) {
                if (Jn(q)) continue;
                const re = R[q],
                    ie = g[q];
                re !== ie && q !== "value" && i(y, q, ie, re, Y, F)
            }
            "value" in R && i(y, "value", g.value, R.value, Y)
        }
    }, B = (y, g, R, F, Y, q, re, ie, oe) => {
        const Z = g.el = y ? y.el : r(""),
            U = g.anchor = y ? y.anchor : r("");
        let {
            patchFlag: S,
            dynamicChildren: X,
            slotScopeIds: fe
        } = g;
        fe && (ie = ie ? ie.concat(fe) : fe), y == null ? (s(Z, R, F), s(U, R, F), x(g.children || [], R, U, Y, q, re, ie, oe)) : S > 0 && S & 64 && X && y.dynamicChildren && y.dynamicChildren.length === X.length ? (te(y.dynamicChildren, X, R, Y, q, re, ie), (g.key != null || Y && g === Y.subTree) && ho(y, g, !0)) : ne(y, g, R, U, Y, q, re, ie, oe)
    }, k = (y, g, R, F, Y, q, re, ie, oe) => {
        g.slotScopeIds = ie, y == null ? g.shapeFlag & 512 ? Y.ctx.activate(g, R, F, re, oe) : $(g, R, F, Y, q, re, oe) : j(y, g, oe)
    }, $ = (y, g, R, F, Y, q, re) => {
        const ie = y.component = Oc(y, F, Y);
        if (el(y) && (ie.ctx.renderer = J), Pc(ie, !1, re), ie.asyncDep) {
            if (Y && Y.registerDep(ie, le, re), !y.el) {
                const oe = ie.subTree = Re(ut);
                M(null, oe, g, R), y.placeholder = oe.el
            }
        } else le(ie, y, g, R, Y, q, re)
    }, j = (y, g, R) => {
        const F = g.component = y.component;
        if (pc(y, g, R))
            if (F.asyncDep && !F.asyncResolved) {
                H(F, g, R);
                return
            } else F.next = g, F.update();
        else g.el = y.el, F.vnode = g
    }, le = (y, g, R, F, Y, q, re) => {
        const ie = () => {
            if (y.isMounted) {
                let {
                    next: S,
                    bu: X,
                    u: fe,
                    parent: ge,
                    vnode: ke
                } = y;
                {
                    const Ke = or(y);
                    if (Ke) {
                        S && (S.el = ke.el, H(y, S, re)), Ke.asyncDep.then(() => {
                            it(() => {
                                y.isUnmounted || Z()
                            }, Y)
                        });
                        return
                    }
                }
                let _e = S,
                    Te;
                un(y, !1), S ? (S.el = ke.el, H(y, S, re)) : S = ke, X && Ss(X), (Te = S.props && S.props.onVnodeBeforeUpdate) && Ct(Te, ge, S, ke), un(y, !0);
                const Pe = Xo(y),
                    Ie = y.subTree;
                y.subTree = Pe, E(Ie, Pe, f(Ie.el), z(Ie), y, Y, q), S.el = Pe.el, _e === null && hc(y, Pe.el), fe && it(fe, Y), (Te = S.props && S.props.onVnodeUpdated) && it(() => Ct(Te, ge, S, ke), Y)
            } else {
                let S;
                const {
                    el: X,
                    props: fe
                } = g, {
                    bm: ge,
                    m: ke,
                    parent: _e,
                    root: Te,
                    type: Pe
                } = y, Ie = Zn(g);
                un(y, !1), ge && Ss(ge), !Ie && (S = fe && fe.onVnodeBeforeMount) && Ct(S, _e, g), un(y, !0);
                {
                    Te.ce && Te.ce._hasShadowRoot() && Te.ce._injectChildStyle(Pe, y.parent ? y.parent.type : void 0);
                    const Ke = y.subTree = Xo(y);
                    E(null, Ke, R, F, y, Y, q), g.el = Ke.el
                }
                if (ke && it(ke, Y), !Ie && (S = fe && fe.onVnodeMounted)) {
                    const Ke = g;
                    it(() => Ct(S, _e, Ke), Y)
                }(g.shapeFlag & 256 || _e && Zn(_e.vnode) && _e.vnode.shapeFlag & 256) && y.a && it(y.a, Y), y.isMounted = !0, g = R = F = null
            }
        };
        y.scope.on();
        const oe = y.effect = new ca(ie);
        y.scope.off();
        const Z = y.update = oe.run.bind(oe),
            U = y.job = oe.runIfDirty.bind(oe);
        U.i = y, U.id = y.uid, oe.scheduler = () => fo(U), un(y, !0), Z()
    }, H = (y, g, R) => {
        g.component = y;
        const F = y.vnode.props;
        y.vnode = g, y.next = null, gc(y, g.props, F, R), wc(y, g.children, R), jt(), Vo(y), Ht()
    }, ne = (y, g, R, F, Y, q, re, ie, oe = !1) => {
        const Z = y && y.children,
            U = y ? y.shapeFlag : 0,
            S = g.children,
            {
                patchFlag: X,
                shapeFlag: fe
            } = g;
        if (X > 0) {
            if (X & 128) {
                se(Z, S, R, F, Y, q, re, ie, oe);
                return
            } else if (X & 256) {
                Ne(Z, S, R, F, Y, q, re, ie, oe);
                return
            }
        }
        fe & 8 ? (U & 16 && Ge(Z, Y, q), S !== Z && d(R, S)) : U & 16 ? fe & 16 ? se(Z, S, R, F, Y, q, re, ie, oe) : Ge(Z, Y, q, !0) : (U & 8 && d(R, ""), fe & 16 && x(S, R, F, Y, q, re, ie, oe))
    }, Ne = (y, g, R, F, Y, q, re, ie, oe) => {
        y = y || An, g = g || An;
        const Z = y.length,
            U = g.length,
            S = Math.min(Z, U);
        let X;
        for (X = 0; X < S; X++) {
            const fe = g[X] = oe ? Dt(g[X]) : St(g[X]);
            E(y[X], fe, R, null, Y, q, re, ie, oe)
        }
        Z > U ? Ge(y, Y, q, !0, !1, S) : x(g, R, F, Y, q, re, ie, oe, S)
    }, se = (y, g, R, F, Y, q, re, ie, oe) => {
        let Z = 0;
        const U = g.length;
        let S = y.length - 1,
            X = U - 1;
        for (; Z <= S && Z <= X;) {
            const fe = y[Z],
                ge = g[Z] = oe ? Dt(g[Z]) : St(g[Z]);
            if (pn(fe, ge)) E(fe, ge, R, null, Y, q, re, ie, oe);
            else break;
            Z++
        }
        for (; Z <= S && Z <= X;) {
            const fe = y[S],
                ge = g[X] = oe ? Dt(g[X]) : St(g[X]);
            if (pn(fe, ge)) E(fe, ge, R, null, Y, q, re, ie, oe);
            else break;
            S--, X--
        }
        if (Z > S) {
            if (Z <= X) {
                const fe = X + 1,
                    ge = fe < U ? g[fe].el : F;
                for (; Z <= X;) E(null, g[Z] = oe ? Dt(g[Z]) : St(g[Z]), R, ge, Y, q, re, ie, oe), Z++
            }
        } else if (Z > X)
            for (; Z <= S;) ve(y[Z], Y, q, !0), Z++;
        else {
            const fe = Z,
                ge = Z,
                ke = new Map;
            for (Z = ge; Z <= X; Z++) {
                const G = g[Z] = oe ? Dt(g[Z]) : St(g[Z]);
                G.key != null && ke.set(G.key, Z)
            }
            let _e, Te = 0;
            const Pe = X - ge + 1;
            let Ie = !1,
                Ke = 0;
            const Q = new Array(Pe);
            for (Z = 0; Z < Pe; Z++) Q[Z] = 0;
            for (Z = fe; Z <= S; Z++) {
                const G = y[Z];
                if (Te >= Pe) {
                    ve(G, Y, q, !0);
                    continue
                }
                let Se;
                if (G.key != null) Se = ke.get(G.key);
                else
                    for (_e = ge; _e <= X; _e++)
                        if (Q[_e - ge] === 0 && pn(G, g[_e])) {
                            Se = _e;
                            break
                        } Se === void 0 ? ve(G, Y, q, !0) : (Q[Se - ge] = Z + 1, Se >= Ke ? Ke = Se : Ie = !0, E(G, g[Se], R, null, Y, q, re, ie, oe), Te++)
            }
            const O = Ie ? Ec(Q) : An;
            for (_e = O.length - 1, Z = Pe - 1; Z >= 0; Z--) {
                const G = ge + Z,
                    Se = g[G],
                    $e = g[G + 1],
                    lt = G + 1 < U ? $e.el || ir($e) : F;
                Q[Z] === 0 ? E(null, Se, R, lt, Y, q, re, ie, oe) : Ie && (_e < 0 || Z !== O[_e] ? b(Se, R, lt, 2) : _e--)
            }
        }
    }, b = (y, g, R, F, Y = null) => {
        const {
            el: q,
            type: re,
            transition: ie,
            children: oe,
            shapeFlag: Z
        } = y;
        if (Z & 6) {
            b(y.component.subTree, g, R, F);
            return
        }
        if (Z & 128) {
            y.suspense.move(g, R, F);
            return
        }
        if (Z & 64) {
            re.move(y, g, R, J);
            return
        }
        if (re === ue) {
            s(q, g, R);
            for (let S = 0; S < oe.length; S++) b(oe[S], g, R, F);
            s(y.anchor, g, R);
            return
        }
        if (re === Rs) {
            K(y, g, R);
            return
        }
        if (F !== 2 && Z & 1 && ie)
            if (F === 0) ie.persisted && !q[gt] ? s(q, g, R) : (ie.beforeEnter(q), s(q, g, R), it(() => ie.enter(q), Y));
            else {
                const {
                    leave: S,
                    delayLeave: X,
                    afterLeave: fe
                } = ie, ge = () => {
                    y.ctx.isUnmounted ? o(q) : s(q, g, R)
                }, ke = () => {
                    const _e = q._isLeaving || !!q[gt];
                    q._isLeaving && q[gt](!0), ie.persisted && !_e ? ge() : S(q, () => {
                        ge(), fe && fe()
                    })
                };
                X ? X(q, ge, ke) : ke()
            }
        else s(q, g, R)
    }, ve = (y, g, R, F = !1, Y = !1) => {
        const {
            type: q,
            props: re,
            ref: ie,
            children: oe,
            dynamicChildren: Z,
            shapeFlag: U,
            patchFlag: S,
            dirs: X,
            cacheIndex: fe,
            memo: ge
        } = y;
        if (S === -2 && (Y = !1), ie != null && (jt(), Qn(ie, null, R, y, !0), Ht()), fe != null && (g.renderCache[fe] = void 0), U & 256) {
            g.ctx.deactivate(y);
            return
        }
        const ke = U & 1 && X,
            _e = !Zn(y);
        let Te;
        if (_e && (Te = re && re.onVnodeBeforeUnmount) && Ct(Te, g, y), U & 6) qe(y.component, R, F);
        else {
            if (U & 128) {
                y.suspense.unmount(R, F);
                return
            }
            ke && rn(y, null, g, "beforeUnmount"), U & 64 ? y.type.remove(y, g, R, J, F) : Z && !Z.hasOnce && (q !== ue || S > 0 && S & 64) ? Ge(Z, g, R, !1, !0) : (q === ue && S & 384 || !Y && U & 16) && Ge(oe, g, R), F && De(y)
        }
        const Pe = ge != null && fe == null;
        (_e && (Te = re && re.onVnodeUnmounted) || ke || Pe) && it(() => {
            Te && Ct(Te, g, y), ke && rn(y, null, g, "unmounted"), Pe && (y.el = null)
        }, R)
    }, De = y => {
        const {
            type: g,
            el: R,
            anchor: F,
            transition: Y
        } = y;
        if (g === ue) {
            pe(R, F);
            return
        }
        if (g === Rs) {
            I(y);
            return
        }
        const q = () => {
            o(R), Y && !Y.persisted && Y.afterLeave && Y.afterLeave()
        };
        if (y.shapeFlag & 1 && Y && !Y.persisted) {
            const {
                leave: re,
                delayLeave: ie
            } = Y, oe = () => re(R, q);
            ie ? ie(y.el, q, oe) : oe()
        } else q()
    }, pe = (y, g) => {
        let R;
        for (; y !== g;) R = m(y), o(y), y = R;
        o(g)
    }, qe = (y, g, R) => {
        const {
            bum: F,
            scope: Y,
            job: q,
            subTree: re,
            um: ie,
            m: oe,
            a: Z
        } = y;
        Zo(oe), Zo(Z), F && Ss(F), Y.stop(), q && (q.flags |= 8, ve(re, y, g, R)), ie && it(ie, g), it(() => {
            y.isUnmounted = !0
        }, g)
    }, Ge = (y, g, R, F = !1, Y = !1, q = 0) => {
        for (let re = q; re < y.length; re++) ve(y[re], g, R, F, Y)
    }, z = y => {
        if (y.shapeFlag & 6) return z(y.component.subTree);
        if (y.shapeFlag & 128) return y.suspense.next();
        const g = m(y.anchor || y.el),
            R = g && g[Ma];
        return R ? m(R) : g
    };
    let ce = !1;
    const ae = (y, g, R) => {
            let F;
            y == null ? g._vnode && (ve(g._vnode, null, null, !0), F = g._vnode.component) : E(g._vnode || null, y, g, null, null, null, R), g._vnode = y, ce || (ce = !0, Vo(F), Ra(), ce = !1)
        },
        J = {
            p: E,
            um: ve,
            m: b,
            r: De,
            mt: $,
            mc: x,
            pc: ne,
            pbc: te,
            n: z,
            o: e
        };
    return {
        render: ae,
        hydrate: void 0,
        createApp: rc(ae)
    }
}

function _l({
    type: e,
    props: t
}, n) {
    return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n
}

function un({
    effect: e,
    job: t
}, n) {
    n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5)
}

function Cc(e, t) {
    return (!e || e && !e.pendingBranch) && t && !t.persisted
}

function ho(e, t, n = !1) {
    const s = e.children,
        o = t.children;
    if (be(s) && be(o))
        for (let i = 0; i < s.length; i++) {
            const a = s[i];
            let r = o[i];
            r.shapeFlag & 1 && !r.dynamicChildren && ((r.patchFlag <= 0 || r.patchFlag === 32) && (r = o[i] = Dt(o[i]), r.el = a.el), !n && r.patchFlag !== -2 && ho(a, r)), r.type === sl && (r.patchFlag === -1 && (r = o[i] = Dt(r)), r.el = a.el), r.type === ut && !r.el && (r.el = a.el)
        }
}

function Ec(e) {
    const t = e.slice(),
        n = [0];
    let s, o, i, a, r;
    const u = e.length;
    for (s = 0; s < u; s++) {
        const c = e[s];
        if (c !== 0) {
            if (o = n[n.length - 1], e[o] < c) {
                t[s] = o, n.push(s);
                continue
            }
            for (i = 0, a = n.length - 1; i < a;) r = i + a >> 1, e[n[r]] < c ? i = r + 1 : a = r;
            c < e[n[i]] && (i > 0 && (t[s] = n[i - 1]), n[i] = s)
        }
    }
    for (i = n.length, a = n[i - 1]; i-- > 0;) n[i] = a, a = t[a];
    return n
}

function or(e) {
    const t = e.subTree.component;
    if (t) return t.asyncDep && !t.asyncResolved ? t : or(t)
}

function Zo(e) {
    if (e)
        for (let t = 0; t < e.length; t++) e[t].flags |= 8
}

function ir(e) {
    if (e.placeholder) return e.placeholder;
    const t = e.component;
    return t ? ir(t.subTree) : null
}
const ar = e => e.__isSuspense;

function xc(e, t) {
    t && t.pendingBranch ? be(e) ? t.effects.push(...e) : t.effects.push(e) : Iu(e)
}
const ue = Symbol.for("v-fgt"),
    sl = Symbol.for("v-txt"),
    ut = Symbol.for("v-cmt"),
    Rs = Symbol.for("v-stc"),
    yn = [];
let vt = null;

function p(e = !1) {
    yn.push(vt = e ? null : [])
}

function rr() {
    yn.pop(), vt = yn[yn.length - 1] || null
}
let rs = 1;

function Ls(e, t = !1) {
    rs += e, e < 0 && vt && t && (vt.hasOnce = !0)
}

function ur(e) {
    return e.dynamicChildren = rs > 0 ? vt || An : null, rr(), rs > 0 && vt && vt.push(e), e
}

function h(e, t, n, s, o, i) {
    return ur(l(e, t, n, s, o, i, !0))
}

function Wt(e, t, n, s, o) {
    return ur(Re(e, t, n, s, o, !0))
}

function Us(e) {
    return e ? e.__v_isVNode === !0 : !1
}

function pn(e, t) {
    return e.type === t.type && e.key === t.key
}
const cr = ({
        key: e
    }) => e ?? null,
    Ts = ({
        ref: e,
        ref_key: t,
        ref_for: n
    }) => (typeof e == "number" && (e = "" + e), e != null ? He(e) || Xe(e) || Ce(e) ? {
        i: ft,
        r: e,
        k: t,
        f: !!n
    } : e : null);

function l(e, t = null, n = null, s = 0, o = null, i = e === ue ? 0 : 1, a = !1, r = !1) {
    const u = {
        __v_isVNode: !0,
        __v_skip: !0,
        type: e,
        props: t,
        key: t && cr(t),
        ref: t && Ts(t),
        scopeId: Ia,
        slotScopeIds: null,
        children: n,
        component: null,
        suspense: null,
        ssContent: null,
        ssFallback: null,
        dirs: null,
        transition: null,
        el: null,
        anchor: null,
        target: null,
        targetStart: null,
        targetAnchor: null,
        staticCount: 0,
        shapeFlag: i,
        patchFlag: s,
        dynamicProps: o,
        dynamicChildren: null,
        appContext: null,
        ctx: ft
    };
    return r ? (Vs(u, n), i & 128 && e.normalize(u)) : n && (u.shapeFlag |= He(n) ? 8 : 16), rs > 0 && !a && vt && (u.patchFlag > 0 || i & 6) && u.patchFlag !== 32 && vt.push(u), u
}
const Re = Sc;

function Sc(e, t = null, n = null, s = 0, o = null, i = !1) {
    if ((!e || e === Ka) && (e = ut), Us(e)) {
        const r = nn(e, t, !0);
        return n && Vs(r, n), rs > 0 && !i && vt && (r.shapeFlag & 6 ? vt[vt.indexOf(e)] = r : vt.push(r)), r.patchFlag = -2, r
    }
    if (Uc(e) && (e = e.__vccOpts), t) {
        t = Ac(t);
        let {
            class: r,
            style: u
        } = t;
        r && !He(r) && (t.class = we(r)), Ve(u) && (Qs(u) && !be(u) && (u = tt({}, u)), t.style = Ln(u))
    }
    const a = He(e) ? 1 : ar(e) ? 128 : Na(e) ? 64 : Ve(e) ? 4 : Ce(e) ? 2 : 0;
    return l(e, t, n, s, o, a, i, !0)
}

function Ac(e) {
    return e ? Qs(e) || Za(e) ? tt({}, e) : e : null
}

function nn(e, t, n = !1, s = !1) {
    const {
        props: o,
        ref: i,
        patchFlag: a,
        children: r,
        transition: u
    } = e, c = t ? Rc(o || {}, t) : o, d = {
        __v_isVNode: !0,
        __v_skip: !0,
        type: e.type,
        props: c,
        key: c && cr(c),
        ref: t && t.ref ? n && i ? be(i) ? i.concat(Ts(t)) : [i, Ts(t)] : Ts(t) : i,
        scopeId: e.scopeId,
        slotScopeIds: e.slotScopeIds,
        children: r,
        target: e.target,
        targetStart: e.targetStart,
        targetAnchor: e.targetAnchor,
        staticCount: e.staticCount,
        shapeFlag: e.shapeFlag,
        patchFlag: t && e.type !== ue ? a === -1 ? 16 : a | 16 : a,
        dynamicProps: e.dynamicProps,
        dynamicChildren: e.dynamicChildren,
        appContext: e.appContext,
        dirs: e.dirs,
        transition: u,
        component: e.component,
        suspense: e.suspense,
        ssContent: e.ssContent && nn(e.ssContent),
        ssFallback: e.ssFallback && nn(e.ssFallback),
        placeholder: e.placeholder,
        el: e.el,
        anchor: e.anchor,
        ctx: e.ctx,
        ce: e.ce
    };
    return u && s && as(d, u.clone(d)), d
}

function ee(e = " ", t = 0) {
    return Re(sl, null, e, t)
}

function bn(e, t) {
    const n = Re(Rs, null, e);
    return n.staticCount = t, n
}

function V(e = "", t = !1) {
    return t ? (p(), Wt(ut, null, e)) : Re(ut, null, e)
}

function St(e) {
    return e == null || typeof e == "boolean" ? Re(ut) : be(e) ? Re(ue, null, e.slice()) : Us(e) ? Dt(e) : Re(sl, null, String(e))
}

function Dt(e) {
    return e.el === null && e.patchFlag !== -1 || e.memo ? e : nn(e)
}

function Vs(e, t) {
    let n = 0;
    const {
        shapeFlag: s
    } = e;
    if (t == null) t = null;
    else if (be(t)) n = 16;
    else if (typeof t == "object")
        if (s & 65) {
            const o = t.default;
            o && (o._c && (o._d = !1), Vs(e, o()), o._c && (o._d = !0));
            return
        } else {
            n = 32;
            const o = t._;
            !o && !Za(t) ? t._ctx = ft : o === 3 && ft && (ft.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024))
        }
    else if (Ce(t)) {
        if (s & 65) {
            Vs(e, {
                default: t
            });
            return
        }
        t = {
            default: t,
            _ctx: ft
        }, n = 32
    } else t = String(t), s & 64 ? (n = 16, t = [ee(t)]) : n = 8;
    e.children = t, e.shapeFlag |= n
}

function Rc(...e) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
        const s = e[n];
        for (const o in s)
            if (o === "class") t.class !== s.class && (t.class = we([t.class, s.class]));
            else if (o === "style") t.style = Ln([t.style, s.style]);
        else if (Ks(o)) {
            const i = t[o],
                a = s[o];
            a && i !== a && !(be(i) && i.includes(a)) ? t[o] = i ? [].concat(i, a) : a : a == null && i == null && !Gs(o) && (t[o] = a)
        } else o !== "" && (t[o] = s[o])
    }
    return t
}

function Ct(e, t, n, s = null) {
    _t(e, t, 7, [n, s])
}
const Tc = za();
let Ic = 0;

function Oc(e, t, n) {
    const s = e.type,
        o = (t ? t.appContext : e.appContext) || Tc,
        i = {
            uid: Ic++,
            vnode: e,
            type: s,
            parent: t,
            appContext: o,
            root: null,
            next: null,
            subTree: null,
            effect: null,
            update: null,
            job: null,
            scope: new ra(!0),
            render: null,
            proxy: null,
            exposed: null,
            exposeProxy: null,
            withProxy: null,
            provides: t ? t.provides : Object.create(o.provides),
            ids: t ? t.ids : ["", 0, 0],
            accessCache: null,
            renderCache: [],
            components: null,
            directives: null,
            propsOptions: tr(s, o),
            emitsOptions: Ja(s, o),
            emit: null,
            emitted: null,
            propsDefaults: Be,
            inheritAttrs: s.inheritAttrs,
            ctx: Be,
            data: Be,
            props: Be,
            attrs: Be,
            slots: Be,
            refs: Be,
            setupState: Be,
            setupContext: null,
            suspense: n,
            suspenseId: n ? n.pendingId : 0,
            asyncDep: null,
            asyncResolved: !1,
            isMounted: !1,
            isUnmounted: !1,
            isDeactivated: !1,
            bc: null,
            c: null,
            bm: null,
            m: null,
            bu: null,
            u: null,
            um: null,
            bum: null,
            da: null,
            a: null,
            rtg: null,
            rtc: null,
            ec: null,
            sp: null
        };
    return i.ctx = {
        _: i
    }, i.root = t ? t.root : i, i.emit = cc.bind(null, i), e.ce && e.ce(i), i
}
let st = null;
const mo = () => st || ft;
let Fs, Hl;
{
    const e = Xs(),
        t = (n, s) => {
            let o;
            return (o = e[n]) || (o = e[n] = []), o.push(s), i => {
                o.length > 1 ? o.forEach(a => a(i)) : o[0](i)
            }
        };
    Fs = t("__VUE_INSTANCE_SETTERS__", n => st = n), Hl = t("__VUE_SSR_SETTERS__", n => us = n)
}
const gs = e => {
        const t = st;
        return Fs(e), e.scope.on(), () => {
            e.scope.off(), Fs(t)
        }
    },
    ei = () => {
        st && st.scope.off(), Fs(null)
    };

function dr(e) {
    return e.vnode.shapeFlag & 4
}
let us = !1;

function Pc(e, t = !1, n = !1) {
    t && Hl(t);
    const {
        props: s,
        children: o
    } = e.vnode, i = dr(e);
    mc(e, s, i, t), _c(e, o, n || t);
    const a = i ? Mc(e, t) : void 0;
    return t && Hl(!1), a
}

function Mc(e, t) {
    const n = e.type;
    e.accessCache = Object.create(null), e.proxy = new Proxy(e.ctx, tc);
    const {
        setup: s
    } = n;
    if (s) {
        jt();
        const o = e.setupContext = s.length > 1 ? Dc(e) : null,
            i = gs(e),
            a = ms(s, e, 0, [e.props, o]),
            r = ta(a);
        if (Ht(), i(), (r || e.sp) && !Zn(e) && Ba(e), r) {
            if (a.then(ei, ei), t) return a.then(u => {
                ti(e, u)
            }).catch(u => {
                Zs(u, e, 0)
            });
            e.asyncDep = a
        } else ti(e, a)
    } else fr(e)
}

function ti(e, t, n) {
    Ce(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : Ve(t) && (e.setupState = xa(t)), fr(e)
}

function fr(e, t, n) {
    const s = e.type;
    e.render || (e.render = s.render || Rt);
    {
        const o = gs(e);
        jt();
        try {
            nc(e)
        } finally {
            Ht(), o()
        }
    }
}
const Nc = {
    get(e, t) {
        return nt(e, "get", ""), e[t]
    }
};

function Dc(e) {
    const t = n => {
        e.exposed = n || {}
    };
    return {
        attrs: new Proxy(e.attrs, Nc),
        slots: e.slots,
        emit: e.emit,
        expose: t
    }
}

function ll(e) {
    return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(xa(co(e.exposed)), {
        get(t, n) {
            if (n in t) return t[n];
            if (n in es) return es[n](e)
        },
        has(t, n) {
            return n in t || n in es
        }
    })) : e.proxy
}

function Lc(e, t = !0) {
    return Ce(e) ? e.displayName || e.name : e.name || t && e.__name
}

function Uc(e) {
    return Ce(e) && "__vccOpts" in e
}
const me = (e, t) => xu(e, t, us);

function go(e, t, n) {
    try {
        Ls(-1);
        const s = arguments.length;
        return s === 2 ? Ve(t) && !be(t) ? Us(t) ? Re(e, null, [t]) : Re(e, t) : Re(e, null, t) : (s > 3 ? n = Array.prototype.slice.call(arguments, 2) : s === 3 && Us(n) && (n = [n]), Re(e, t, n))
    } finally {
        Ls(1)
    }
}
const Vc = "3.5.40";
/**
 * @vue/runtime-dom v3.5.40
 * (c) 2018-present Yuxi (Evan) You and Vue contributors
 * @license MIT
 **/
let Kl;
const ni = typeof window < "u" && window.trustedTypes;
if (ni) try {
    Kl = ni.createPolicy("vue", {
        createHTML: e => e
    })
} catch {}
const vr = Kl ? e => Kl.createHTML(e) : e => e,
    Fc = "http://www.w3.org/2000/svg",
    Bc = "http://www.w3.org/1998/Math/MathML",
    Mt = typeof document < "u" ? document : null,
    si = Mt && Mt.createElement("template"),
    jc = {
        insert: (e, t, n) => {
            t.insertBefore(e, n || null)
        },
        remove: e => {
            const t = e.parentNode;
            t && t.removeChild(e)
        },
        createElement: (e, t, n, s) => {
            const o = t === "svg" ? Mt.createElementNS(Fc, e) : t === "mathml" ? Mt.createElementNS(Bc, e) : n ? Mt.createElement(e, {
                is: n
            }) : Mt.createElement(e);
            return e === "select" && s && s.multiple != null && o.setAttribute("multiple", s.multiple), o
        },
        createText: e => Mt.createTextNode(e),
        createComment: e => Mt.createComment(e),
        setText: (e, t) => {
            e.nodeValue = t
        },
        setElementText: (e, t) => {
            e.textContent = t
        },
        parentNode: e => e.parentNode,
        nextSibling: e => e.nextSibling,
        querySelector: e => Mt.querySelector(e),
        setScopeId(e, t) {
            e.setAttribute(t, "")
        },
        insertStaticContent(e, t, n, s, o, i) {
            const a = n ? n.previousSibling : t.lastChild;
            if (o && (o === i || o.nextSibling))
                for (; t.insertBefore(o.cloneNode(!0), n), !(o === i || !(o = o.nextSibling)););
            else {
                si.innerHTML = vr(s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e);
                const r = si.content;
                if (s === "svg" || s === "mathml") {
                    const u = r.firstChild;
                    for (; u.firstChild;) r.appendChild(u.firstChild);
                    r.removeChild(u)
                }
                t.insertBefore(r, n)
            }
            return [a ? a.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild]
        }
    },
    zt = "transition",
    jn = "animation",
    cs = Symbol("_vtc"),
    pr = {
        name: String,
        type: String,
        css: {
            type: Boolean,
            default: !0
        },
        duration: [String, Number, Object],
        enterFromClass: String,
        enterActiveClass: String,
        enterToClass: String,
        appearFromClass: String,
        appearActiveClass: String,
        appearToClass: String,
        leaveFromClass: String,
        leaveActiveClass: String,
        leaveToClass: String
    },
    Hc = tt({}, Da, pr),
    Kc = e => (e.displayName = "Transition", e.props = Hc, e),
    li = Kc((e, {
        slots: t
    }) => go(ju, Gc(e), t)),
    cn = (e, t = []) => {
        be(e) ? e.forEach(n => n(...t)) : e && e(...t)
    },
    oi = e => e ? be(e) ? e.some(t => t.length > 1) : e.length > 1 : !1;

function Gc(e) {
    const t = {};
    for (const B in e) B in pr || (t[B] = e[B]);
    if (e.css === !1) return t;
    const {
        name: n = "v",
        type: s,
        duration: o,
        enterFromClass: i = `${n}-enter-from`,
        enterActiveClass: a = `${n}-enter-active`,
        enterToClass: r = `${n}-enter-to`,
        appearFromClass: u = i,
        appearActiveClass: c = a,
        appearToClass: d = r,
        leaveFromClass: f = `${n}-leave-from`,
        leaveActiveClass: m = `${n}-leave-active`,
        leaveToClass: _ = `${n}-leave-to`
    } = e, P = Wc(o), E = P && P[0], N = P && P[1], {
        onBeforeEnter: M,
        onEnter: L,
        onEnterCancelled: K,
        onLeave: I,
        onLeaveCancelled: A,
        onBeforeAppear: C = M,
        onAppear: T = L,
        onAppearCancelled: x = K
    } = t, W = (B, k, $, j) => {
        B._enterCancelled = j, dn(B, k ? d : r), dn(B, k ? c : a), $ && $()
    }, te = (B, k) => {
        B._isLeaving = !1, dn(B, f), dn(B, _), dn(B, m), k && k()
    }, de = B => (k, $) => {
        const j = B ? T : L,
            le = () => W(k, B, $);
        cn(j, [k, le]), ii(() => {
            dn(k, B ? u : i), Ot(k, B ? d : r), oi(j) || ai(k, s, E, le)
        })
    };
    return tt(t, {
        onBeforeEnter(B) {
            cn(M, [B]), Ot(B, i), Ot(B, a)
        },
        onBeforeAppear(B) {
            cn(C, [B]), Ot(B, u), Ot(B, c)
        },
        onEnter: de(!1),
        onAppear: de(!0),
        onLeave(B, k) {
            B._isLeaving = !0;
            const $ = () => te(B, k);
            Ot(B, f), B._enterCancelled ? (Ot(B, m), ci(B)) : (ci(B), Ot(B, m)), ii(() => {
                B._isLeaving && (dn(B, f), Ot(B, _), oi(I) || ai(B, s, N, $))
            }), cn(I, [B, $])
        },
        onEnterCancelled(B) {
            W(B, !1, void 0, !0), cn(K, [B])
        },
        onAppearCancelled(B) {
            W(B, !0, void 0, !0), cn(x, [B])
        },
        onLeaveCancelled(B) {
            te(B), cn(A, [B])
        }
    })
}

function Wc(e) {
    if (e == null) return null;
    if (Ve(e)) return [wl(e.enter), wl(e.leave)];
    {
        const t = wl(e);
        return [t, t]
    }
}

function wl(e) {
    return qr(e)
}

function Ot(e, t) {
    t.split(/\s+/).forEach(n => n && e.classList.add(n)), (e[cs] || (e[cs] = new Set)).add(t)
}

function dn(e, t) {
    t.split(/\s+/).forEach(s => s && e.classList.remove(s));
    const n = e[cs];
    n && (n.delete(t), n.size || (e[cs] = void 0))
}

function ii(e) {
    requestAnimationFrame(() => {
        requestAnimationFrame(e)
    })
}
let qc = 0;

function ai(e, t, n, s) {
    const o = e._endId = ++qc,
        i = () => {
            o === e._endId && s()
        };
    if (n != null) return setTimeout(i, n);
    const {
        type: a,
        timeout: r,
        propCount: u
    } = zc(e, t);
    if (!a) return s();
    const c = a + "end";
    let d = 0;
    const f = () => {
            e.removeEventListener(c, m), i()
        },
        m = _ => {
            _.target === e && ++d >= u && f()
        };
    setTimeout(() => {
        d < u && f()
    }, r + 1), e.addEventListener(c, m)
}

function zc(e, t) {
    const n = window.getComputedStyle(e),
        s = P => (n[P] || "").split(", "),
        o = s(`${zt}Delay`),
        i = s(`${zt}Duration`),
        a = ri(o, i),
        r = s(`${jn}Delay`),
        u = s(`${jn}Duration`),
        c = ri(r, u);
    let d = null,
        f = 0,
        m = 0;
    t === zt ? a > 0 && (d = zt, f = a, m = i.length) : t === jn ? c > 0 && (d = jn, f = c, m = u.length) : (f = Math.max(a, c), d = f > 0 ? a > c ? zt : jn : null, m = d ? d === zt ? i.length : u.length : 0);
    const _ = d === zt && /\b(?:transform|all)(?:,|$)/.test(s(`${zt}Property`).toString());
    return {
        type: d,
        timeout: f,
        propCount: m,
        hasTransform: _
    }
}

function ri(e, t) {
    for (; e.length < t.length;) e = e.concat(e);
    return Math.max(...t.map((n, s) => ui(n) + ui(e[s])))
}

function ui(e) {
    return e === "auto" ? 0 : Number(e.slice(0, -1).replace(",", ".")) * 1e3
}

function ci(e) {
    return (e ? e.ownerDocument : document).body.offsetHeight
}

function Jc(e, t, n) {
    const s = e[cs];
    s && (t = (t ? [t, ...s] : [...s]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t
}
const Bs = Symbol("_vod"),
    hr = Symbol("_vsh"),
    Xc = {
        name: "show",
        beforeMount(e, {
            value: t
        }, {
            transition: n
        }) {
            e[Bs] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : Hn(e, t)
        },
        mounted(e, {
            value: t
        }, {
            transition: n
        }) {
            n && t && n.enter(e)
        },
        updated(e, {
            value: t,
            oldValue: n
        }, {
            transition: s
        }) {
            !t != !n && (s ? t ? (s.beforeEnter(e), Hn(e, !0), s.enter(e)) : s.leave(e, () => {
                Hn(e, !1)
            }) : Hn(e, t))
        },
        beforeUnmount(e, {
            value: t
        }) {
            Hn(e, t)
        }
    };

function Hn(e, t) {
    e.style.display = t ? e[Bs] : "none", e[hr] = !t
}
const Yc = Symbol(""),
    Qc = /(?:^|;)\s*display\s*:/;

function Zc(e, t, n) {
    const s = e.style,
        o = He(n);
    let i = !1;
    if (n && !o) {
        if (t)
            if (He(t))
                for (const a of t.split(";")) {
                    const r = a.slice(0, a.indexOf(":")).trim();
                    n[r] == null && zn(s, r, "")
                } else
                    for (const a in t) n[a] == null && zn(s, a, "");
        for (const a in n) {
            a === "display" && (i = !0);
            const r = n[a];
            r != null ? td(e, a, !He(t) && t ? t[a] : void 0, r) || zn(s, a, r) : zn(s, a, "")
        }
    } else if (o) {
        if (t !== n) {
            const a = s[Yc];
            a && (n += ";" + a), s.cssText = n, i = Qc.test(n)
        }
    } else t && e.removeAttribute("style");
    Bs in e && (e[Bs] = i ? s.display : "", e[hr] && (s.display = "none"))
}
const di = /\s*!important$/;

function zn(e, t, n) {
    if (be(n)) n.forEach(s => zn(e, t, s));
    else if (n == null && (n = ""), t.startsWith("--")) e.setProperty(t, n);
    else {
        const s = ed(e, t);
        di.test(n) ? e.setProperty(ln(s), n.replace(di, ""), "important") : e[s] = n
    }
}
const fi = ["Webkit", "Moz", "ms"],
    kl = {};

function ed(e, t) {
    const n = kl[t];
    if (n) return n;
    let s = ct(t);
    if (s !== "filter" && s in e) return kl[t] = s;
    s = zs(s);
    for (let o = 0; o < fi.length; o++) {
        const i = fi[o] + s;
        if (i in e) return kl[t] = i
    }
    return t
}

function td(e, t, n, s) {
    return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && He(s) && n === s
}
const vi = "http://www.w3.org/1999/xlink";

function pi(e, t, n, s, o, i = Zr(t)) {
    s && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(vi, t.slice(6, t.length)) : e.setAttributeNS(vi, t, n) : n == null || i && !oa(n) ? e.removeAttribute(t) : e.setAttribute(t, i ? "" : bt(n) ? String(n) : n)
}

function hi(e, t, n, s, o) {
    if (t === "innerHTML" || t === "textContent") {
        n != null && (e[t] = t === "innerHTML" ? vr(n) : n);
        return
    }
    const i = e.tagName;
    if (t === "value" && i !== "PROGRESS" && !i.includes("-")) {
        const r = i === "OPTION" ? e.getAttribute("value") || "" : e.value,
            u = n == null ? e.type === "checkbox" ? "on" : "" : String(n);
        (r !== u || !("_value" in e)) && (e.value = u), n == null && e.removeAttribute(t), e._value = n;
        return
    }
    let a = !1;
    if (n === "" || n == null) {
        const r = typeof e[t];
        r === "boolean" ? n = oa(n) : n == null && r === "string" ? (n = "", a = !0) : r === "number" && (n = 0, a = !0)
    }
    try {
        e[t] = n
    } catch {}
    a && e.removeAttribute(o || t)
}

function en(e, t, n, s) {
    e.addEventListener(t, n, s)
}

function nd(e, t, n, s) {
    e.removeEventListener(t, n, s)
}
const mi = Symbol("_vei");

function sd(e, t, n, s, o = null) {
    const i = e[mi] || (e[mi] = {}),
        a = i[t];
    if (s && a) a.value = s;
    else {
        const [r, u] = id(t);
        if (s) {
            const c = i[t] = ud(s, o);
            en(e, r, c, u)
        } else a && (nd(e, r, a, u), i[t] = void 0)
    }
}
const ld = /(Once|Passive|Capture)$/,
    od = /^on:?(?:Once|Passive|Capture)$/;

function id(e) {
    let t, n;
    for (;
        (n = e.match(ld)) && !od.test(e);) t || (t = {}), e = e.slice(0, e.length - n[1].length), t[n[1].toLowerCase()] = !0;
    return [e[2] === ":" ? e.slice(3) : ln(e.slice(2)), t]
}
let $l = 0;
const ad = Promise.resolve(),
    rd = () => $l || (ad.then(() => $l = 0), $l = Date.now());

function ud(e, t) {
    const n = s => {
        if (!s._vts) s._vts = Date.now();
        else if (s._vts <= n.attached) return;
        const o = n.value;
        if (be(o)) {
            const i = s.stopImmediatePropagation;
            s.stopImmediatePropagation = () => {
                i.call(s), s._stopped = !0
            };
            const a = o.slice(),
                r = [s];
            for (let u = 0; u < a.length && !s._stopped; u++) {
                const c = a[u];
                c && _t(c, t, 5, r)
            }
        } else _t(o, t, 5, [s])
    };
    return n.value = e, n.attached = rd(), n
}
const gi = e => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123,
    cd = (e, t, n, s, o, i) => {
        const a = o === "svg";
        t === "class" ? Jc(e, s, a) : t === "style" ? Zc(e, n, s) : Ks(t) ? Gs(t) || sd(e, t, n, s, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : dd(e, t, s, a)) ? (hi(e, t, s), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && pi(e, t, s, a, i, t !== "value")) : e._isVueCE && (fd(e, t) || e._def.__asyncLoader && (/[A-Z]/.test(t) || !He(s))) ? hi(e, ct(t), s, i, t) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s), pi(e, t, s, a))
    };

function dd(e, t, n, s) {
    if (s) return !!(t === "innerHTML" || t === "textContent" || t in e && gi(t) && Ce(n));
    if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA") return !1;
    if (t === "width" || t === "height") {
        const o = e.tagName;
        if (o === "IMG" || o === "VIDEO" || o === "CANVAS" || o === "SOURCE") return !1
    }
    return gi(t) && He(n) ? !1 : t in e
}

function fd(e, t) {
    const n = e._def.props;
    if (!n) return !1;
    const s = ct(t);
    return Array.isArray(n) ? n.some(o => ct(o) === s) : Object.keys(n).some(o => ct(o) === s)
}
const On = e => {
    const t = e.props["onUpdate:modelValue"] || !1;
    return be(t) ? n => Ss(t, n) : t
};

function vd(e) {
    e.target.composing = !0
}

function yi(e) {
    const t = e.target;
    t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")))
}
const Ft = Symbol("_assign");

function bi(e, t, n) {
    return t && (e = e.trim()), n && (e = Js(e)), e
}
const Ee = {
        created(e, {
            modifiers: {
                lazy: t,
                trim: n,
                number: s
            }
        }, o) {
            e[Ft] = On(o);
            const i = s || o.props && o.props.type === "number";
            en(e, t ? "change" : "input", a => {
                a.target.composing || e[Ft](bi(e.value, n, i))
            }), (n || i) && en(e, "change", () => {
                e.value = bi(e.value, n, i)
            }), t || (en(e, "compositionstart", vd), en(e, "compositionend", yi), en(e, "change", yi))
        },
        mounted(e, {
            value: t
        }) {
            e.value = t ?? ""
        },
        beforeUpdate(e, {
            value: t,
            oldValue: n,
            modifiers: {
                lazy: s,
                trim: o,
                number: i
            }
        }, a) {
            if (e[Ft] = On(a), e.composing) return;
            const r = (i || e.type === "number") && !/^0\d/.test(e.value) ? Js(e.value) : e.value,
                u = t ?? "";
            if (r === u) return;
            const c = e.getRootNode();
            (c instanceof Document || c instanceof ShadowRoot) && c.activeElement === e && e.type !== "range" && (s && t === n || o && e.value.trim() === u) || (e.value = u)
        }
    },
    kn = {
        deep: !0,
        created(e, t, n) {
            e[Ft] = On(n), en(e, "change", () => {
                const s = e._modelValue,
                    o = ds(e),
                    i = e.checked,
                    a = e[Ft];
                if (be(s)) {
                    const r = to(s, o),
                        u = r !== -1;
                    if (i && !u) a(s.concat(o));
                    else if (!i && u) {
                        const c = [...s];
                        c.splice(r, 1), a(c)
                    }
                } else if (Dn(s)) {
                    const r = new Set(s);
                    i ? r.add(o) : r.delete(o), a(r)
                } else a(mr(e, i))
            })
        },
        mounted: _i,
        beforeUpdate(e, t, n) {
            e[Ft] = On(n), _i(e, t, n)
        }
    };

function _i(e, {
    value: t,
    oldValue: n
}, s) {
    e._modelValue = t;
    let o;
    if (be(t)) o = to(t, s.props.value) > -1;
    else if (Dn(t)) o = t.has(s.props.value);
    else {
        if (t === n) return;
        o = Un(t, mr(e, !0))
    }
    e.checked !== o && (e.checked = o)
}
const pt = {
    deep: !0,
    created(e, {
        value: t,
        modifiers: {
            number: n
        }
    }, s) {
        e._modelValue = t, en(e, "change", () => {
            const o = Array.prototype.filter.call(e.options, i => i.selected).map(i => n ? Js(ds(i)) : ds(i));
            e[Ft](e.multiple ? Dn(e._modelValue) ? new Set(o) : o : o[0]), e._assigning = !0, Gt(() => {
                e._assigning = !1
            })
        }), e[Ft] = On(s)
    },
    mounted(e, {
        value: t
    }) {
        wi(e, t)
    },
    beforeUpdate(e, {
        value: t
    }, n) {
        e._modelValue = t, e[Ft] = On(n)
    },
    updated(e, {
        value: t
    }) {
        e._assigning || wi(e, t)
    }
};

function wi(e, t) {
    const n = e.multiple,
        s = be(t);
    if (!(n && !s && !Dn(t))) {
        for (let o = 0, i = e.options.length; o < i; o++) {
            const a = e.options[o],
                r = ds(a);
            if (n)
                if (s) {
                    const u = typeof r;
                    u === "string" || u === "number" ? a.selected = t.some(c => String(c) === String(r)) : a.selected = to(t, r) > -1
                } else a.selected = t.has(r);
            else if (Un(ds(a), t)) {
                e.selectedIndex !== o && (e.selectedIndex = o);
                return
            }
        }!n && e.selectedIndex !== -1 && (e.selectedIndex = -1)
    }
}

function ds(e) {
    return "_value" in e ? e._value : e.value
}

function mr(e, t) {
    const n = t ? "_trueValue" : "_falseValue";
    return n in e ? e[n] : t
}
const pd = ["ctrl", "shift", "alt", "meta"],
    hd = {
        stop: e => e.stopPropagation(),
        prevent: e => e.preventDefault(),
        self: e => e.target !== e.currentTarget,
        ctrl: e => !e.ctrlKey,
        shift: e => !e.shiftKey,
        alt: e => !e.altKey,
        meta: e => !e.metaKey,
        left: e => "button" in e && e.button !== 0,
        middle: e => "button" in e && e.button !== 1,
        right: e => "button" in e && e.button !== 2,
        exact: (e, t) => pd.some(n => e[`${n}Key`] && !t.includes(n))
    },
    Je = (e, t) => {
        if (!e) return e;
        const n = e._withMods || (e._withMods = {}),
            s = t.join(".");
        return n[s] || (n[s] = (o, ...i) => {
            for (let a = 0; a < t.length; a++) {
                const r = hd[t[a]];
                if (r && r(o, t)) return
            }
            return e(o, ...i)
        })
    },
    md = {
        esc: "escape",
        space: " ",
        up: "arrow-up",
        left: "arrow-left",
        right: "arrow-right",
        down: "arrow-down",
        delete: "backspace"
    },
    Tt = (e, t) => {
        const n = e._withKeys || (e._withKeys = {}),
            s = t.join(".");
        return n[s] || (n[s] = o => {
            if (!("key" in o)) return;
            const i = ln(o.key);
            if (t.some(a => a === i || md[a] === i)) return e(o)
        })
    },
    gd = tt({
        patchProp: cd
    }, jc);
let ki;

function yd() {
    return ki || (ki = kc(gd))
}
const bd = (...e) => {
    const t = yd().createApp(...e),
        {
            mount: n
        } = t;
    return t.mount = s => {
        const o = wd(s);
        if (!o) return;
        const i = t._component;
        !Ce(i) && !i.render && !i.template && (i.template = o.innerHTML), o.nodeType === 1 && (o.textContent = "");
        const a = n(o, !1, _d(o));
        return o instanceof Element && (o.removeAttribute("v-cloak"), o.setAttribute("data-v-app", "")), a
    }, t
};

function _d(e) {
    if (e instanceof SVGElement) return "svg";
    if (typeof MathMLElement == "function" && e instanceof MathMLElement) return "mathml"
}

function wd(e) {
    return He(e) ? document.querySelector(e) : e
}
/*!
 * pinia v2.3.1
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */
let gr;
const ol = e => gr = e,
    yr = Symbol();

function Gl(e) {
    return e && typeof e == "object" && Object.prototype.toString.call(e) === "[object Object]" && typeof e.toJSON != "function"
}
var ts;
(function(e) {
    e.direct = "direct", e.patchObject = "patch object", e.patchFunction = "patch function"
})(ts || (ts = {}));

function kd() {
    const e = ua(!0),
        t = e.run(() => w({}));
    let n = [],
        s = [];
    const o = co({
        install(i) {
            ol(o), o._a = i, i.provide(yr, o), i.config.globalProperties.$pinia = o, s.forEach(a => n.push(a)), s = []
        },
        use(i) {
            return this._a ? n.push(i) : s.push(i), this
        },
        _p: n,
        _a: null,
        _e: e,
        _s: new Map,
        state: t
    });
    return o
}
const br = () => {};

function $i(e, t, n, s = br) {
    e.push(t);
    const o = () => {
        const i = e.indexOf(t);
        i > -1 && (e.splice(i, 1), s())
    };
    return !n && no() && so(o), o
}

function En(e, ...t) {
    e.slice().forEach(n => {
        n(...t)
    })
}
const $d = e => e(),
    Ci = Symbol(),
    Cl = Symbol();

function Wl(e, t) {
    e instanceof Map && t instanceof Map ? t.forEach((n, s) => e.set(s, n)) : e instanceof Set && t instanceof Set && t.forEach(e.add, e);
    for (const n in t) {
        if (!t.hasOwnProperty(n)) continue;
        const s = t[n],
            o = e[n];
        Gl(o) && Gl(s) && e.hasOwnProperty(n) && !Xe(s) && !Vt(s) ? e[n] = Wl(o, s) : e[n] = s
    }
    return e
}
const Cd = Symbol();

function Ed(e) {
    return !Gl(e) || !e.hasOwnProperty(Cd)
}
const {
    assign: Yt
} = Object;

function xd(e) {
    return !!(Xe(e) && e.effect)
}

function Sd(e, t, n, s) {
    const {
        state: o,
        actions: i,
        getters: a
    } = t, r = n.state.value[e];
    let u;

    function c() {
        r || (n.state.value[e] = o ? o() : {});
        const d = ku(n.state.value[e]);
        return Yt(d, i, Object.keys(a || {}).reduce((f, m) => (f[m] = co(me(() => {
            ol(n);
            const _ = n._s.get(e);
            return a[m].call(_, _)
        })), f), {}))
    }
    return u = _r(e, c, t, n, s, !0), u
}

function _r(e, t, n = {}, s, o, i) {
    let a;
    const r = Yt({
            actions: {}
        }, n),
        u = {
            deep: !0
        };
    let c, d, f = [],
        m = [],
        _;
    const P = s.state.value[e];
    !i && !P && (s.state.value[e] = {});
    let E;

    function N(x) {
        let W;
        c = d = !1, typeof x == "function" ? (x(s.state.value[e]), W = {
            type: ts.patchFunction,
            storeId: e,
            events: _
        }) : (Wl(s.state.value[e], x), W = {
            type: ts.patchObject,
            payload: x,
            storeId: e,
            events: _
        });
        const te = E = Symbol();
        Gt().then(() => {
            E === te && (c = !0)
        }), d = !0, En(f, W, s.state.value[e])
    }
    const M = i ? function() {
        const {
            state: W
        } = n, te = W ? W() : {};
        this.$patch(de => {
            Yt(de, te)
        })
    } : br;

    function L() {
        a.stop(), f = [], m = [], s._s.delete(e)
    }
    const K = (x, W = "") => {
            if (Ci in x) return x[Cl] = W, x;
            const te = function() {
                ol(s);
                const de = Array.from(arguments),
                    B = [],
                    k = [];

                function $(H) {
                    B.push(H)
                }

                function j(H) {
                    k.push(H)
                }
                En(m, {
                    args: de,
                    name: te[Cl],
                    store: A,
                    after: $,
                    onError: j
                });
                let le;
                try {
                    le = x.apply(this && this.$id === e ? this : A, de)
                } catch (H) {
                    throw En(k, H), H
                }
                return le instanceof Promise ? le.then(H => (En(B, H), H)).catch(H => (En(k, H), Promise.reject(H))) : (En(B, le), le)
            };
            return te[Ci] = !0, te[Cl] = W, te
        },
        I = {
            _p: s,
            $id: e,
            $onAction: $i.bind(null, m),
            $patch: N,
            $reset: M,
            $subscribe(x, W = {}) {
                const te = $i(f, x, W.detached, () => de()),
                    de = a.run(() => et(() => s.state.value[e], B => {
                        (W.flush === "sync" ? d : c) && x({
                            storeId: e,
                            type: ts.direct,
                            events: _
                        }, B)
                    }, Yt({}, u, W)));
                return te
            },
            $dispose: L
        },
        A = hs(I);
    s._s.set(e, A);
    const T = (s._a && s._a.runWithContext || $d)(() => s._e.run(() => (a = ua()).run(() => t({
        action: K
    }))));
    for (const x in T) {
        const W = T[x];
        if (Xe(W) && !xd(W) || Vt(W)) i || (P && Ed(W) && (Xe(W) ? W.value = P[x] : Wl(W, P[x])), s.state.value[e][x] = W);
        else if (typeof W == "function") {
            const te = K(W, x);
            T[x] = te, r.actions[x] = W
        }
    }
    return Yt(A, T), Yt(Me(A), T), Object.defineProperty(A, "$state", {
        get: () => s.state.value[e],
        set: x => {
            N(W => {
                Yt(W, x)
            })
        }
    }), s._p.forEach(x => {
        Yt(A, a.run(() => x({
            store: A,
            app: s._a,
            pinia: s,
            options: r
        })))
    }), P && i && n.hydrate && n.hydrate(A.$state, P), c = !0, d = !0, A
} /*! #__NO_SIDE_EFFECTS__ */
function il(e, t, n) {
    let s, o;
    const i = typeof t == "function";
    typeof e == "string" ? (s = e, o = i ? n : t) : (o = e, s = e.id);

    function a(r, u) {
        const c = Ou();
        return r = r || (c ? yt(yr, null) : null), r && ol(r), r = gr, r._s.has(s) || (i ? _r(s, t, o, r) : Sd(s, o, r)), r._s.get(s)
    }
    return a.$id = s, a
}
/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */
const Sn = typeof document < "u";

function wr(e) {
    return typeof e == "object" || "displayName" in e || "props" in e || "__vccOpts" in e
}

function Ad(e) {
    return e.__esModule || e[Symbol.toStringTag] === "Module" || e.default && wr(e.default)
}
const Le = Object.assign;

function El(e, t) {
    const n = {};
    for (const s in t) {
        const o = t[s];
        n[s] = $t(o) ? o.map(e) : e(o)
    }
    return n
}
const ns = () => {},
    $t = Array.isArray;

function Ei(e, t) {
    const n = {};
    for (const s in e) n[s] = s in t ? t[s] : e[s];
    return n
}
const kr = /#/g,
    Rd = /&/g,
    Td = /\//g,
    Id = /=/g,
    Od = /\?/g,
    $r = /\+/g,
    Pd = /%5B/g,
    Md = /%5D/g,
    Cr = /%5E/g,
    Nd = /%60/g,
    Er = /%7B/g,
    Dd = /%7C/g,
    xr = /%7D/g,
    Ld = /%20/g;

function yo(e) {
    return e == null ? "" : encodeURI("" + e).replace(Dd, "|").replace(Pd, "[").replace(Md, "]")
}

function Ud(e) {
    return yo(e).replace(Er, "{").replace(xr, "}").replace(Cr, "^")
}

function ql(e) {
    return yo(e).replace($r, "%2B").replace(Ld, "+").replace(kr, "%23").replace(Rd, "%26").replace(Nd, "`").replace(Er, "{").replace(xr, "}").replace(Cr, "^")
}

function Vd(e) {
    return ql(e).replace(Id, "%3D")
}

function Fd(e) {
    return yo(e).replace(kr, "%23").replace(Od, "%3F")
}

function Bd(e) {
    return Fd(e).replace(Td, "%2F")
}

function fs(e) {
    if (e == null) return null;
    try {
        return decodeURIComponent("" + e)
    } catch {}
    return "" + e
}
const jd = /\/$/,
    Hd = e => e.replace(jd, "");

function xl(e, t, n = "/") {
    let s, o = {},
        i = "",
        a = "";
    const r = t.indexOf("#");
    let u = t.indexOf("?");
    return u = r >= 0 && u > r ? -1 : u, u >= 0 && (s = t.slice(0, u), i = t.slice(u, r > 0 ? r : t.length), o = e(i.slice(1))), r >= 0 && (s = s || t.slice(0, r), a = t.slice(r, t.length)), s = qd(s ?? t, n), {
        fullPath: s + i + a,
        path: s,
        query: o,
        hash: fs(a)
    }
}

function Kd(e, t) {
    const n = t.query ? e(t.query) : "";
    return t.path + (n && "?") + n + (t.hash || "")
}

function xi(e, t) {
    return !t || !e.toLowerCase().startsWith(t.toLowerCase()) ? e : e.slice(t.length) || "/"
}

function Gd(e, t, n) {
    const s = t.matched.length - 1,
        o = n.matched.length - 1;
    return s > -1 && s === o && Pn(t.matched[s], n.matched[o]) && Sr(t.params, n.params) && e(t.query) === e(n.query) && t.hash === n.hash
}

function Pn(e, t) {
    return (e.aliasOf || e) === (t.aliasOf || t)
}

function Sr(e, t) {
    if (Object.keys(e).length !== Object.keys(t).length) return !1;
    for (var n in e)
        if (!Wd(e[n], t[n])) return !1;
    return !0
}

function Wd(e, t) {
    return $t(e) ? Si(e, t) : $t(t) ? Si(t, e) : (e == null ? void 0 : e.valueOf()) === (t == null ? void 0 : t.valueOf())
}

function Si(e, t) {
    return $t(t) ? e.length === t.length && e.every((n, s) => n === t[s]) : e.length === 1 && e[0] === t
}

function qd(e, t) {
    if (e.startsWith("/")) return e;
    if (!e) return t;
    const n = t.split("/"),
        s = e.split("/"),
        o = s[s.length - 1];
    (o === ".." || o === ".") && s.push("");
    let i = n.length - 1,
        a, r;
    for (a = 0; a < s.length; a++)
        if (r = s[a], r !== ".")
            if (r === "..") i > 1 && i--;
            else break;
    return n.slice(0, i).join("/") + "/" + s.slice(a).join("/")
}
const Jt = {
    path: "/",
    name: void 0,
    params: {},
    query: {},
    hash: "",
    fullPath: "/",
    matched: [],
    meta: {},
    redirectedFrom: void 0
};
let zl = function(e) {
        return e.pop = "pop", e.push = "push", e
    }({}),
    Sl = function(e) {
        return e.back = "back", e.forward = "forward", e.unknown = "", e
    }({});

function zd(e) {
    if (!e)
        if (Sn) {
            const t = document.querySelector("base");
            e = t && t.getAttribute("href") || "/", e = e.replace(/^\w+:\/\/[^\/]+/, "")
        } else e = "/";
    return e[0] !== "/" && e[0] !== "#" && (e = "/" + e), Hd(e)
}
const Jd = /^[^#]+#/;

function Xd(e, t) {
    return e.replace(Jd, "#") + t
}

function Yd(e, t) {
    const n = document.documentElement.getBoundingClientRect(),
        s = e.getBoundingClientRect();
    return {
        behavior: t.behavior,
        left: s.left - n.left - (t.left || 0),
        top: s.top - n.top - (t.top || 0)
    }
}
const al = () => ({
    left: window.scrollX,
    top: window.scrollY
});

function Qd(e) {
    let t;
    if ("el" in e) {
        const n = e.el,
            s = typeof n == "string" && n.startsWith("#"),
            o = typeof n == "string" ? s ? document.getElementById(n.slice(1)) : document.querySelector(n) : n;
        if (!o) return;
        t = Yd(o, e)
    } else t = e;
    "scrollBehavior" in document.documentElement.style ? window.scrollTo(t) : window.scrollTo(t.left != null ? t.left : window.scrollX, t.top != null ? t.top : window.scrollY)
}

function Ai(e, t) {
    return (history.state ? history.state.position - t : -1) + e
}
const Jl = new Map;

function Zd(e, t) {
    Jl.set(e, t)
}

function ef(e) {
    const t = Jl.get(e);
    return Jl.delete(e), t
}

function tf(e) {
    return typeof e == "string" || e && typeof e == "object"
}

function Ar(e) {
    return typeof e == "string" || typeof e == "symbol"
}
let ze = function(e) {
    return e[e.MATCHER_NOT_FOUND = 1] = "MATCHER_NOT_FOUND", e[e.NAVIGATION_GUARD_REDIRECT = 2] = "NAVIGATION_GUARD_REDIRECT", e[e.NAVIGATION_ABORTED = 4] = "NAVIGATION_ABORTED", e[e.NAVIGATION_CANCELLED = 8] = "NAVIGATION_CANCELLED", e[e.NAVIGATION_DUPLICATED = 16] = "NAVIGATION_DUPLICATED", e
}({});
const Rr = Symbol("");
ze.MATCHER_NOT_FOUND + "", ze.NAVIGATION_GUARD_REDIRECT + "", ze.NAVIGATION_ABORTED + "", ze.NAVIGATION_CANCELLED + "", ze.NAVIGATION_DUPLICATED + "";

function Mn(e, t) {
    return Le(new Error, {
        type: e,
        [Rr]: !0
    }, t)
}

function Pt(e, t) {
    return e instanceof Error && Rr in e && (t == null || !!(e.type & t))
}
const nf = ["params", "query", "hash"];

function sf(e) {
    if (typeof e == "string") return e;
    if (e.path != null) return e.path;
    const t = {};
    for (const n of nf) n in e && (t[n] = e[n]);
    return JSON.stringify(t, null, 2)
}

function lf(e) {
    const t = {};
    if (e === "" || e === "?") return t;
    const n = (e[0] === "?" ? e.slice(1) : e).split("&");
    for (let s = 0; s < n.length; ++s) {
        const o = n[s].replace($r, " "),
            i = o.indexOf("="),
            a = fs(i < 0 ? o : o.slice(0, i)),
            r = i < 0 ? null : fs(o.slice(i + 1));
        if (a in t) {
            let u = t[a];
            $t(u) || (u = t[a] = [u]), u.push(r)
        } else t[a] = r
    }
    return t
}

function Ri(e) {
    let t = "";
    for (let n in e) {
        const s = e[n];
        if (n = Vd(n), s == null) {
            s !== void 0 && (t += (t.length ? "&" : "") + n);
            continue
        }($t(s) ? s.map(o => o && ql(o)) : [s && ql(s)]).forEach(o => {
            o !== void 0 && (t += (t.length ? "&" : "") + n, o != null && (t += "=" + o))
        })
    }
    return t
}

function of(e) {
    const t = {};
    for (const n in e) {
        const s = e[n];
        s !== void 0 && (t[n] = $t(s) ? s.map(o => o == null ? null : "" + o) : s == null ? s : "" + s)
    }
    return t
}
const af = Symbol(""),
    Ti = Symbol(""),
    rl = Symbol(""),
    bo = Symbol(""),
    Xl = Symbol("");

function Kn() {
    let e = [];

    function t(s) {
        return e.push(s), () => {
            const o = e.indexOf(s);
            o > -1 && e.splice(o, 1)
        }
    }

    function n() {
        e = []
    }
    return {
        add: t,
        list: () => e.slice(),
        reset: n
    }
}

function Zt(e, t, n, s, o, i = a => a()) {
    const a = s && (s.enterCallbacks[o] = s.enterCallbacks[o] || []);
    return () => new Promise((r, u) => {
        const c = m => {
                m === !1 ? u(Mn(ze.NAVIGATION_ABORTED, {
                    from: n,
                    to: t
                })) : m instanceof Error ? u(m) : tf(m) ? u(Mn(ze.NAVIGATION_GUARD_REDIRECT, {
                    from: t,
                    to: m
                })) : (a && s.enterCallbacks[o] === a && typeof m == "function" && a.push(m), r())
            },
            d = i(() => e.call(s && s.instances[o], t, n, c));
        let f = Promise.resolve(d);
        e.length < 3 && (f = f.then(c)), f.catch(m => u(m))
    })
}

function Al(e, t, n, s, o = i => i()) {
    const i = [];
    for (const a of e)
        for (const r in a.components) {
            let u = a.components[r];
            if (!(t !== "beforeRouteEnter" && !a.instances[r]))
                if (wr(u)) {
                    const c = (u.__vccOpts || u)[t];
                    c && i.push(Zt(c, n, s, a, r, o))
                } else {
                    let c = u();
                    i.push(() => c.then(d => {
                        if (!d) throw new Error(`Couldn't resolve component "${r}" at "${a.path}"`);
                        const f = Ad(d) ? d.default : d;
                        a.mods[r] = d, a.components[r] = f;
                        const m = (f.__vccOpts || f)[t];
                        return m && Zt(m, n, s, a, r, o)()
                    }))
                }
        }
    return i
}

function rf(e, t) {
    const n = [],
        s = [],
        o = [],
        i = Math.max(t.matched.length, e.matched.length);
    for (let a = 0; a < i; a++) {
        const r = t.matched[a];
        r && (e.matched.find(c => Pn(c, r)) ? s.push(r) : n.push(r));
        const u = e.matched[a];
        u && (t.matched.find(c => Pn(c, u)) || o.push(u))
    }
    return [n, s, o]
}
/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */
let uf = () => location.protocol + "//" + location.host;

function Tr(e, t) {
    const {
        pathname: n,
        search: s,
        hash: o
    } = t, i = e.indexOf("#");
    if (i > -1) {
        let a = o.includes(e.slice(i)) ? e.slice(i).length : 1,
            r = o.slice(a);
        return r[0] !== "/" && (r = "/" + r), xi(r, "")
    }
    return xi(n, e) + s + o
}

function cf(e, t, n, s) {
    let o = [],
        i = [],
        a = null;
    const r = ({
        state: m
    }) => {
        const _ = Tr(e, location),
            P = n.value,
            E = t.value;
        let N = 0;
        if (m) {
            if (n.value = _, t.value = m, a && a === P) {
                a = null;
                return
            }
            N = E ? m.position - E.position : 0
        } else s(_);
        o.forEach(M => {
            M(n.value, P, {
                delta: N,
                type: zl.pop,
                direction: N ? N > 0 ? Sl.forward : Sl.back : Sl.unknown
            })
        })
    };

    function u() {
        a = n.value
    }

    function c(m) {
        o.push(m);
        const _ = () => {
            const P = o.indexOf(m);
            P > -1 && o.splice(P, 1)
        };
        return i.push(_), _
    }

    function d() {
        if (document.visibilityState === "hidden") {
            const {
                history: m
            } = window;
            if (!m.state) return;
            m.replaceState(Le({}, m.state, {
                scroll: al()
            }), "")
        }
    }

    function f() {
        for (const m of i) m();
        i = [], window.removeEventListener("popstate", r), window.removeEventListener("pagehide", d), document.removeEventListener("visibilitychange", d)
    }
    return window.addEventListener("popstate", r), window.addEventListener("pagehide", d), document.addEventListener("visibilitychange", d), {
        pauseListeners: u,
        listen: c,
        destroy: f
    }
}

function Ii(e, t, n, s = !1, o = !1) {
    return {
        back: e,
        current: t,
        forward: n,
        replaced: s,
        position: window.history.length,
        scroll: o ? al() : null
    }
}

function df(e) {
    const {
        history: t,
        location: n
    } = window, s = {
        value: Tr(e, n)
    }, o = {
        value: t.state
    };
    o.value || i(s.value, {
        back: null,
        current: s.value,
        forward: null,
        position: t.length - 1,
        replaced: !0,
        scroll: null
    }, !0);

    function i(u, c, d) {
        const f = e.indexOf("#"),
            m = f > -1 ? (n.host && document.querySelector("base") ? e : e.slice(f)) + u : uf() + e + u;
        try {
            t[d ? "replaceState" : "pushState"](c, "", m), o.value = c
        } catch (_) {
            console.error(_), n[d ? "replace" : "assign"](m)
        }
    }

    function a(u, c) {
        i(u, Le({}, t.state, Ii(o.value.back, u, o.value.forward, !0), c, {
            position: o.value.position
        }), !0), s.value = u
    }

    function r(u, c) {
        const d = Le({}, o.value, t.state, {
            forward: u,
            scroll: al()
        });
        i(d.current, d, !0), i(u, Le({}, Ii(s.value, u, null), {
            position: d.position + 1
        }, c), !1), s.value = u
    }
    return {
        location: s,
        state: o,
        push: r,
        replace: a
    }
}

function ff(e) {
    e = zd(e);
    const t = df(e),
        n = cf(e, t.state, t.location, t.replace);

    function s(i, a = !0) {
        a || n.pauseListeners(), history.go(i)
    }
    const o = Le({
        location: "",
        base: e,
        go: s,
        createHref: Xd.bind(null, e)
    }, t, n);
    return Object.defineProperty(o, "location", {
        enumerable: !0,
        get: () => t.location.value
    }), Object.defineProperty(o, "state", {
        enumerable: !0,
        get: () => t.state.value
    }), o
}

function vf(e) {
    return e = location.host ? e || location.pathname + location.search : "", e.includes("#") || (e += "#"), ff(e)
}
let hn = function(e) {
    return e[e.Static = 0] = "Static", e[e.Param = 1] = "Param", e[e.Group = 2] = "Group", e
}({});
var Qe = function(e) {
    return e[e.Static = 0] = "Static", e[e.Param = 1] = "Param", e[e.ParamRegExp = 2] = "ParamRegExp", e[e.ParamRegExpEnd = 3] = "ParamRegExpEnd", e[e.EscapeNext = 4] = "EscapeNext", e
}(Qe || {});
const pf = {
        type: hn.Static,
        value: ""
    },
    hf = /[a-zA-Z0-9_]/;

function mf(e) {
    if (!e) return [
        []
    ];
    if (e === "/") return [
        [pf]
    ];
    if (!e.startsWith("/")) throw new Error(`Invalid path "${e}"`);

    function t(_) {
        throw new Error(`ERR (${n})/"${c}": ${_}`)
    }
    let n = Qe.Static,
        s = n;
    const o = [];
    let i;

    function a() {
        i && o.push(i), i = []
    }
    let r = 0,
        u, c = "",
        d = "";

    function f() {
        c && (n === Qe.Static ? i.push({
            type: hn.Static,
            value: c
        }) : n === Qe.Param || n === Qe.ParamRegExp || n === Qe.ParamRegExpEnd ? (i.length > 1 && (u === "*" || u === "+") && t(`A repeatable param (${c}) must be alone in its segment. eg: '/:ids+.`), i.push({
            type: hn.Param,
            value: c,
            regexp: d,
            repeatable: u === "*" || u === "+",
            optional: u === "*" || u === "?"
        })) : t("Invalid state to consume buffer"), c = "")
    }

    function m() {
        c += u
    }
    for (; r < e.length;) {
        if (u = e[r++], u === "\\" && n !== Qe.ParamRegExp) {
            s = n, n = Qe.EscapeNext;
            continue
        }
        switch (n) {
            case Qe.Static:
                u === "/" ? (c && f(), a()) : u === ":" ? (f(), n = Qe.Param) : m();
                break;
            case Qe.EscapeNext:
                m(), n = s;
                break;
            case Qe.Param:
                u === "(" ? n = Qe.ParamRegExp : hf.test(u) ? m() : (f(), n = Qe.Static, u !== "*" && u !== "?" && u !== "+" && r--);
                break;
            case Qe.ParamRegExp:
                u === ")" ? d[d.length - 1] == "\\" ? d = d.slice(0, -1) + u : n = Qe.ParamRegExpEnd : d += u;
                break;
            case Qe.ParamRegExpEnd:
                f(), n = Qe.Static, u !== "*" && u !== "?" && u !== "+" && r--, d = "";
                break;
            default:
                t("Unknown state");
                break
        }
    }
    return n === Qe.ParamRegExp && t(`Unfinished custom RegExp for param "${c}"`), f(), a(), o
}
const Oi = "[^/]+?",
    gf = {
        sensitive: !1,
        strict: !1,
        start: !0,
        end: !0
    };
var at = function(e) {
    return e[e._multiplier = 10] = "_multiplier", e[e.Root = 90] = "Root", e[e.Segment = 40] = "Segment", e[e.SubSegment = 30] = "SubSegment", e[e.Static = 40] = "Static", e[e.Dynamic = 20] = "Dynamic", e[e.BonusCustomRegExp = 10] = "BonusCustomRegExp", e[e.BonusWildcard = -50] = "BonusWildcard", e[e.BonusRepeatable = -20] = "BonusRepeatable", e[e.BonusOptional = -8] = "BonusOptional", e[e.BonusStrict = .7000000000000001] = "BonusStrict", e[e.BonusCaseSensitive = .25] = "BonusCaseSensitive", e
}(at || {});
const yf = /[.+*?^${}()[\]/\\]/g;

function bf(e, t) {
    const n = Le({}, gf, t),
        s = [];
    let o = n.start ? "^" : "";
    const i = [];
    for (const c of e) {
        const d = c.length ? [] : [at.Root];
        n.strict && !c.length && (o += "/");
        for (let f = 0; f < c.length; f++) {
            const m = c[f];
            let _ = at.Segment + (n.sensitive ? at.BonusCaseSensitive : 0);
            if (m.type === hn.Static) f || (o += "/"), o += m.value.replace(yf, "\\$&"), _ += at.Static;
            else if (m.type === hn.Param) {
                const {
                    value: P,
                    repeatable: E,
                    optional: N,
                    regexp: M
                } = m;
                i.push({
                    name: P,
                    repeatable: E,
                    optional: N
                });
                const L = M || Oi;
                if (L !== Oi) {
                    _ += at.BonusCustomRegExp;
                    try {
                        `${L}`
                    } catch (I) {
                        throw new Error(`Invalid custom RegExp for param "${P}" (${L}): ` + I.message)
                    }
                }
                let K = E ? `((?:${L})(?:/(?:${L}))*)` : `(${L})`;
                f || (K = N && c.length < 2 ? `(?:/${K})` : "/" + K), N && (K += "?"), o += K, _ += at.Dynamic, N && (_ += at.BonusOptional), E && (_ += at.BonusRepeatable), L === ".*" && (_ += at.BonusWildcard)
            }
            d.push(_)
        }
        s.push(d)
    }
    if (n.strict && n.end) {
        const c = s.length - 1;
        s[c][s[c].length - 1] += at.BonusStrict
    }
    n.strict || (o += "/?"), n.end ? o += "$" : n.strict && !o.endsWith("/") && (o += "(?:/|$)");
    const a = new RegExp(o, n.sensitive ? "" : "i");

    function r(c) {
        const d = c.match(a),
            f = {};
        if (!d) return null;
        for (let m = 1; m < d.length; m++) {
            const _ = d[m] || "",
                P = i[m - 1];
            f[P.name] = _ && P.repeatable ? _.split("/") : _
        }
        return f
    }

    function u(c) {
        let d = "",
            f = !1;
        for (const m of e) {
            (!f || !d.endsWith("/")) && (d += "/"), f = !1;
            for (const _ of m)
                if (_.type === hn.Static) d += _.value;
                else if (_.type === hn.Param) {
                const {
                    value: P,
                    repeatable: E,
                    optional: N
                } = _, M = P in c ? c[P] : "";
                if ($t(M) && !E) throw new Error(`Provided param "${P}" is an array but it is not repeatable (* or + modifiers)`);
                const L = $t(M) ? M.join("/") : M;
                if (!L)
                    if (N) m.length < 2 && (d.endsWith("/") ? d = d.slice(0, -1) : f = !0);
                    else throw new Error(`Missing required param "${P}"`);
                d += L
            }
        }
        return d || "/"
    }
    return {
        re: a,
        score: s,
        keys: i,
        parse: r,
        stringify: u
    }
}

function _f(e, t) {
    let n = 0;
    for (; n < e.length && n < t.length;) {
        const s = t[n] - e[n];
        if (s) return s;
        n++
    }
    return e.length < t.length ? e.length === 1 && e[0] === at.Static + at.Segment ? -1 : 1 : e.length > t.length ? t.length === 1 && t[0] === at.Static + at.Segment ? 1 : -1 : 0
}

function Ir(e, t) {
    let n = 0;
    const s = e.score,
        o = t.score;
    for (; n < s.length && n < o.length;) {
        const i = _f(s[n], o[n]);
        if (i) return i;
        n++
    }
    if (Math.abs(o.length - s.length) === 1) {
        if (Pi(s)) return 1;
        if (Pi(o)) return -1
    }
    return o.length - s.length
}

function Pi(e) {
    const t = e[e.length - 1];
    return e.length > 0 && t[t.length - 1] < 0
}
const wf = {
    strict: !1,
    end: !0,
    sensitive: !1
};

function kf(e, t, n) {
    const s = bf(mf(e.path), n),
        o = Le(s, {
            record: e,
            parent: t,
            children: [],
            alias: []
        });
    return t && !o.record.aliasOf == !t.record.aliasOf && t.children.push(o), o
}

function $f(e, t) {
    const n = [],
        s = new Map;
    t = Ei(wf, t);

    function o(f) {
        return s.get(f)
    }

    function i(f, m, _) {
        const P = !_,
            E = Ni(f);
        E.aliasOf = _ && _.record;
        const N = Ei(t, f),
            M = [E];
        if ("alias" in f) {
            const I = typeof f.alias == "string" ? [f.alias] : f.alias;
            for (const A of I) M.push(Ni(Le({}, E, {
                components: _ ? _.record.components : E.components,
                path: A,
                aliasOf: _ ? _.record : E
            })))
        }
        let L, K;
        for (const I of M) {
            const {
                path: A
            } = I;
            if (m && A[0] !== "/") {
                const C = m.record.path,
                    T = C[C.length - 1] === "/" ? "" : "/";
                I.path = m.record.path + (A && T + A)
            }
            if (L = kf(I, m, N), _ ? _.alias.push(L) : (K = K || L, K !== L && K.alias.push(L), P && f.name && !Di(L) && a(f.name)), Or(L) && u(L), E.children) {
                const C = E.children;
                for (let T = 0; T < C.length; T++) i(C[T], L, _ && _.children[T])
            }
            _ = _ || L
        }
        return K ? () => {
            a(K)
        } : ns
    }

    function a(f) {
        if (Ar(f)) {
            const m = s.get(f);
            m && (s.delete(f), n.splice(n.indexOf(m), 1), m.children.forEach(a), m.alias.forEach(a))
        } else {
            const m = n.indexOf(f);
            m > -1 && (n.splice(m, 1), f.record.name && s.delete(f.record.name), f.children.forEach(a), f.alias.forEach(a))
        }
    }

    function r() {
        return n
    }

    function u(f) {
        const m = xf(f, n);
        n.splice(m, 0, f), f.record.name && !Di(f) && s.set(f.record.name, f)
    }

    function c(f, m) {
        let _, P = {},
            E, N;
        if ("name" in f && f.name) {
            if (_ = s.get(f.name), !_) throw Mn(ze.MATCHER_NOT_FOUND, {
                location: f
            });
            N = _.record.name, P = Le(Mi(m.params, _.keys.filter(K => !K.optional).concat(_.parent ? _.parent.keys.filter(K => K.optional) : []).map(K => K.name)), f.params && Mi(f.params, _.keys.map(K => K.name))), E = _.stringify(P)
        } else if (f.path != null) E = f.path, _ = n.find(K => K.re.test(E)), _ && (P = _.parse(E), N = _.record.name);
        else {
            if (_ = m.name ? s.get(m.name) : n.find(K => K.re.test(m.path)), !_) throw Mn(ze.MATCHER_NOT_FOUND, {
                location: f,
                currentLocation: m
            });
            N = _.record.name, P = Le({}, m.params, f.params), E = _.stringify(P)
        }
        const M = [];
        let L = _;
        for (; L;) M.unshift(L.record), L = L.parent;
        return {
            name: N,
            path: E,
            params: P,
            matched: M,
            meta: Ef(M)
        }
    }
    e.forEach(f => i(f));

    function d() {
        n.length = 0, s.clear()
    }
    return {
        addRoute: i,
        resolve: c,
        removeRoute: a,
        clearRoutes: d,
        getRoutes: r,
        getRecordMatcher: o
    }
}

function Mi(e, t) {
    const n = {};
    for (const s of t) s in e && (n[s] = e[s]);
    return n
}

function Ni(e) {
    const t = {
        path: e.path,
        redirect: e.redirect,
        name: e.name,
        meta: e.meta || {},
        aliasOf: e.aliasOf,
        beforeEnter: e.beforeEnter,
        props: Cf(e),
        children: e.children || [],
        instances: {},
        leaveGuards: new Set,
        updateGuards: new Set,
        enterCallbacks: {},
        components: "components" in e ? e.components || null : e.component && {
            default: e.component
        }
    };
    return Object.defineProperty(t, "mods", {
        value: {}
    }), t
}

function Cf(e) {
    const t = {},
        n = e.props || !1;
    if ("component" in e) t.default = n;
    else
        for (const s in e.components) t[s] = typeof n == "object" ? n[s] : n;
    return t
}

function Di(e) {
    for (; e;) {
        if (e.record.aliasOf) return !0;
        e = e.parent
    }
    return !1
}

function Ef(e) {
    return e.reduce((t, n) => Le(t, n.meta), {})
}

function xf(e, t) {
    let n = 0,
        s = t.length;
    for (; n !== s;) {
        const i = n + s >> 1;
        Ir(e, t[i]) < 0 ? s = i : n = i + 1
    }
    const o = Sf(e);
    return o && (s = t.lastIndexOf(o, s - 1)), s
}

function Sf(e) {
    let t = e;
    for (; t = t.parent;)
        if (Or(t) && Ir(e, t) === 0) return t
}

function Or({
    record: e
}) {
    return !!(e.name || e.components && Object.keys(e.components).length || e.redirect)
}

function Li(e) {
    const t = yt(rl),
        n = yt(bo),
        s = me(() => {
            const u = ye(e.to);
            return t.resolve(u)
        }),
        o = me(() => {
            const {
                matched: u
            } = s.value, {
                length: c
            } = u, d = u[c - 1], f = n.matched;
            if (!d || !f.length) return -1;
            const m = f.findIndex(Pn.bind(null, d));
            if (m > -1) return m;
            const _ = Ui(u[c - 2]);
            return c > 1 && Ui(d) === _ && f[f.length - 1].path !== _ ? f.findIndex(Pn.bind(null, u[c - 2])) : m
        }),
        i = me(() => o.value > -1 && Of(n.params, s.value.params)),
        a = me(() => o.value > -1 && o.value === n.matched.length - 1 && Sr(n.params, s.value.params));

    function r(u = {}) {
        if (If(u)) {
            const c = t[ye(e.replace) ? "replace" : "push"](ye(e.to)).catch(ns);
            return e.viewTransition && typeof document < "u" && "startViewTransition" in document && document.startViewTransition(() => c), c
        }
        return Promise.resolve()
    }
    return {
        route: s,
        href: me(() => s.value.href),
        isActive: i,
        isExactActive: a,
        navigate: r
    }
}

function Af(e) {
    return e.length === 1 ? e[0] : e
}
const Rf = Fe({
        name: "RouterLink",
        compatConfig: {
            MODE: 3
        },
        props: {
            to: {
                type: [String, Object],
                required: !0
            },
            replace: Boolean,
            activeClass: String,
            exactActiveClass: String,
            custom: Boolean,
            ariaCurrentValue: {
                type: String,
                default: "page"
            },
            viewTransition: Boolean
        },
        useLink: Li,
        setup(e, {
            slots: t
        }) {
            const n = hs(Li(e)),
                {
                    options: s
                } = yt(rl),
                o = me(() => ({
                    [Vi(e.activeClass, s.linkActiveClass, "router-link-active")]: n.isActive,
                    [Vi(e.exactActiveClass, s.linkExactActiveClass, "router-link-exact-active")]: n.isExactActive
                }));
            return () => {
                const i = t.default && Af(t.default(n));
                return e.custom ? i : go("a", {
                    "aria-current": n.isExactActive ? e.ariaCurrentValue : null,
                    href: n.href,
                    onClick: n.navigate,
                    class: o.value
                }, i)
            }
        }
    }),
    Tf = Rf;

function If(e) {
    if (!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) && !e.defaultPrevented && !(e.button !== void 0 && e.button !== 0)) {
        if (e.currentTarget && e.currentTarget.getAttribute) {
            const t = e.currentTarget.getAttribute("target");
            if (/\b_blank\b/i.test(t)) return
        }
        return e.preventDefault && e.preventDefault(), !0
    }
}

function Of(e, t) {
    for (const n in t) {
        const s = t[n],
            o = e[n];
        if (typeof s == "string") {
            if (s !== o) return !1
        } else if (!$t(o) || o.length !== s.length || s.some((i, a) => i.valueOf() !== o[a].valueOf())) return !1
    }
    return !0
}

function Ui(e) {
    return e ? e.aliasOf ? e.aliasOf.path : e.path : ""
}
const Vi = (e, t, n) => e ?? t ?? n,
    Pf = Fe({
        name: "RouterView",
        inheritAttrs: !1,
        props: {
            name: {
                type: String,
                default: "default"
            },
            route: Object
        },
        compatConfig: {
            MODE: 3
        },
        setup(e, {
            attrs: t,
            slots: n
        }) {
            const s = yt(Xl),
                o = me(() => e.route || s.value),
                i = yt(Ti, 0),
                a = me(() => {
                    let c = ye(i);
                    const {
                        matched: d
                    } = o.value;
                    let f;
                    for (;
                        (f = d[c]) && !f.components;) c++;
                    return c
                }),
                r = me(() => o.value.matched[a.value]);
            As(Ti, me(() => a.value + 1)), As(af, r), As(Xl, o);
            const u = w();
            return et(() => [u.value, r.value, e.name], ([c, d, f], [m, _, P]) => {
                d && (d.instances[f] = c, _ && _ !== d && c && c === m && (d.leaveGuards.size || (d.leaveGuards = _.leaveGuards), d.updateGuards.size || (d.updateGuards = _.updateGuards))), c && d && (!_ || !Pn(d, _) || !m) && (d.enterCallbacks[f] || []).forEach(E => E(c))
            }, {
                flush: "post"
            }), () => {
                const c = o.value,
                    d = e.name,
                    f = r.value,
                    m = f && f.components[d];
                if (!m) return Fi(n.default, {
                    Component: m,
                    route: c
                });
                const _ = f.props[d],
                    P = _ ? _ === !0 ? c.params : typeof _ == "function" ? _(c) : _ : null,
                    N = go(m, Le({}, P, t, {
                        onVnodeUnmounted: M => {
                            M.component.isUnmounted && (f.instances[d] = null)
                        },
                        ref: u
                    }));
                return Fi(n.default, {
                    Component: N,
                    route: c
                }) || N
            }
        }
    });

function Fi(e, t) {
    if (!e) return null;
    const n = e(t);
    return n.length === 1 ? n[0] : n
}
const Pr = Pf;

function Mf(e) {
    const t = $f(e.routes, e),
        n = e.parseQuery || lf,
        s = e.stringifyQuery || Ri,
        o = e.history,
        i = Kn(),
        a = Kn(),
        r = Kn(),
        u = bu(Jt);
    let c = Jt;
    Sn && e.scrollBehavior && "scrollRestoration" in history && (history.scrollRestoration = "manual");
    const d = El.bind(null, z => "" + z),
        f = El.bind(null, Bd),
        m = El.bind(null, fs);

    function _(z, ce) {
        let ae, J;
        return Ar(z) ? (ae = t.getRecordMatcher(z), J = ce) : J = z, t.addRoute(J, ae)
    }

    function P(z) {
        const ce = t.getRecordMatcher(z);
        ce && t.removeRoute(ce)
    }

    function E() {
        return t.getRoutes().map(z => z.record)
    }

    function N(z) {
        return !!t.getRecordMatcher(z)
    }

    function M(z, ce) {
        if (ce = Le({}, ce || u.value), typeof z == "string") {
            const R = xl(n, z, ce.path),
                F = t.resolve({
                    path: R.path
                }, ce),
                Y = o.createHref(R.fullPath);
            return Le(R, F, {
                params: m(F.params),
                hash: fs(R.hash),
                redirectedFrom: void 0,
                href: Y
            })
        }
        let ae;
        if (z.path != null) ae = Le({}, z, {
            path: xl(n, z.path, ce.path).path
        });
        else {
            const R = Le({}, z.params);
            for (const F in R) R[F] == null && delete R[F];
            ae = Le({}, z, {
                params: f(R)
            }), ce.params = f(ce.params)
        }
        const J = t.resolve(ae, ce),
            D = z.hash || "";
        J.params = d(m(J.params));
        const y = Kd(s, Le({}, z, {
                hash: Ud(D),
                path: J.path
            })),
            g = o.createHref(y);
        return Le({
            fullPath: y,
            hash: D,
            query: s === Ri ? of(z.query) : z.query || {}
        }, J, {
            redirectedFrom: void 0,
            href: g
        })
    }

    function L(z) {
        return typeof z == "string" ? xl(n, z, u.value.path) : Le({}, z)
    }

    function K(z, ce) {
        if (c !== z) return Mn(ze.NAVIGATION_CANCELLED, {
            from: ce,
            to: z
        })
    }

    function I(z) {
        return T(z)
    }

    function A(z) {
        return I(Le(L(z), {
            replace: !0
        }))
    }

    function C(z, ce) {
        const ae = z.matched[z.matched.length - 1];
        if (ae && ae.redirect) {
            const {
                redirect: J
            } = ae;
            let D = typeof J == "function" ? J(z, ce) : J;
            return typeof D == "string" && (D = D.includes("?") || D.includes("#") ? D = L(D) : {
                path: D
            }, D.params = {}), Le({
                query: z.query,
                hash: z.hash,
                params: D.path != null ? {} : z.params
            }, D)
        }
    }

    function T(z, ce) {
        const ae = c = M(z),
            J = u.value,
            D = z.state,
            y = z.force,
            g = z.replace === !0,
            R = C(ae, J);
        if (R) return T(Le(L(R), {
            state: typeof R == "object" ? Le({}, D, R.state) : D,
            force: y,
            replace: g
        }), ce || ae);
        const F = ae;
        F.redirectedFrom = ce;
        let Y;
        return !y && Gd(s, J, ae) && (Y = Mn(ze.NAVIGATION_DUPLICATED, {
            to: F,
            from: J
        }), b(J, J, !0, !1)), (Y ? Promise.resolve(Y) : te(F, J)).catch(q => Pt(q) ? Pt(q, ze.NAVIGATION_GUARD_REDIRECT) ? q : se(q) : ne(q, F, J)).then(q => {
            if (q) {
                if (Pt(q, ze.NAVIGATION_GUARD_REDIRECT)) return T(Le({
                    replace: g
                }, L(q.to), {
                    state: typeof q.to == "object" ? Le({}, D, q.to.state) : D,
                    force: y
                }), ce || F)
            } else q = B(F, J, !0, g, D);
            return de(F, J, q), q
        })
    }

    function x(z, ce) {
        const ae = K(z, ce);
        return ae ? Promise.reject(ae) : Promise.resolve()
    }

    function W(z) {
        const ce = pe.values().next().value;
        return ce && typeof ce.runWithContext == "function" ? ce.runWithContext(z) : z()
    }

    function te(z, ce) {
        let ae;
        const [J, D, y] = rf(z, ce);
        ae = Al(J.reverse(), "beforeRouteLeave", z, ce);
        for (const R of J) R.leaveGuards.forEach(F => {
            ae.push(Zt(F, z, ce))
        });
        const g = x.bind(null, z, ce);
        return ae.push(g), Ge(ae).then(() => {
            ae = [];
            for (const R of i.list()) ae.push(Zt(R, z, ce));
            return ae.push(g), Ge(ae)
        }).then(() => {
            ae = Al(D, "beforeRouteUpdate", z, ce);
            for (const R of D) R.updateGuards.forEach(F => {
                ae.push(Zt(F, z, ce))
            });
            return ae.push(g), Ge(ae)
        }).then(() => {
            ae = [];
            for (const R of y)
                if (R.beforeEnter)
                    if ($t(R.beforeEnter))
                        for (const F of R.beforeEnter) ae.push(Zt(F, z, ce));
                    else ae.push(Zt(R.beforeEnter, z, ce));
            return ae.push(g), Ge(ae)
        }).then(() => (z.matched.forEach(R => R.enterCallbacks = {}), ae = Al(y, "beforeRouteEnter", z, ce, W), ae.push(g), Ge(ae))).then(() => {
            ae = [];
            for (const R of a.list()) ae.push(Zt(R, z, ce));
            return ae.push(g), Ge(ae)
        }).catch(R => Pt(R, ze.NAVIGATION_CANCELLED) ? R : Promise.reject(R))
    }

    function de(z, ce, ae) {
        r.list().forEach(J => W(() => J(z, ce, ae)))
    }

    function B(z, ce, ae, J, D) {
        const y = K(z, ce);
        if (y) return y;
        const g = ce === Jt,
            R = Sn ? history.state : {};
        ae && (J || g ? o.replace(z.fullPath, Le({
            scroll: g && R && R.scroll
        }, D)) : o.push(z.fullPath, D)), u.value = z, b(z, ce, ae, g), se()
    }
    let k;

    function $() {
        k || (k = o.listen((z, ce, ae) => {
            if (!qe.listening) return;
            const J = M(z),
                D = C(J, qe.currentRoute.value);
            if (D) {
                T(Le(D, {
                    replace: !0,
                    force: !0
                }), J).catch(ns);
                return
            }
            c = J;
            const y = u.value;
            Sn && Zd(Ai(y.fullPath, ae.delta), al()), te(J, y).catch(g => Pt(g, ze.NAVIGATION_ABORTED | ze.NAVIGATION_CANCELLED) ? g : Pt(g, ze.NAVIGATION_GUARD_REDIRECT) ? (T(Le(L(g.to), {
                force: !0
            }), J).then(R => {
                Pt(R, ze.NAVIGATION_ABORTED | ze.NAVIGATION_DUPLICATED) && !ae.delta && ae.type === zl.pop && o.go(-1, !1)
            }).catch(ns), Promise.reject()) : (ae.delta && o.go(-ae.delta, !1), ne(g, J, y))).then(g => {
                g = g || B(J, y, !1), g && (ae.delta && !Pt(g, ze.NAVIGATION_CANCELLED) ? o.go(-ae.delta, !1) : ae.type === zl.pop && Pt(g, ze.NAVIGATION_ABORTED | ze.NAVIGATION_DUPLICATED) && o.go(-1, !1)), de(J, y, g)
            }).catch(ns)
        }))
    }
    let j = Kn(),
        le = Kn(),
        H;

    function ne(z, ce, ae) {
        se(z);
        const J = le.list();
        return J.length ? J.forEach(D => D(z, ce, ae)) : console.error(z), Promise.reject(z)
    }

    function Ne() {
        return H && u.value !== Jt ? Promise.resolve() : new Promise((z, ce) => {
            j.add([z, ce])
        })
    }

    function se(z) {
        return H || (H = !z, $(), j.list().forEach(([ce, ae]) => z ? ae(z) : ce()), j.reset()), z
    }

    function b(z, ce, ae, J) {
        const {
            scrollBehavior: D
        } = e;
        if (!Sn || !D) return Promise.resolve();
        const y = !ae && ef(Ai(z.fullPath, 0)) || (J || !ae) && history.state && history.state.scroll || null;
        return Gt().then(() => D(z, ce, y)).then(g => g && Qd(g)).catch(g => ne(g, z, ce))
    }
    const ve = z => o.go(z);
    let De;
    const pe = new Set,
        qe = {
            currentRoute: u,
            listening: !0,
            addRoute: _,
            removeRoute: P,
            clearRoutes: t.clearRoutes,
            hasRoute: N,
            getRoutes: E,
            resolve: M,
            options: e,
            push: I,
            replace: A,
            go: ve,
            back: () => ve(-1),
            forward: () => ve(1),
            beforeEach: i.add,
            beforeResolve: a.add,
            afterEach: r.add,
            onError: le.add,
            isReady: Ne,
            install(z) {
                z.component("RouterLink", Tf), z.component("RouterView", Pr), z.config.globalProperties.$router = qe, Object.defineProperty(z.config.globalProperties, "$route", {
                    enumerable: !0,
                    get: () => ye(u)
                }), Sn && !De && u.value === Jt && (De = !0, I(o.location).catch(J => {}));
                const ce = {};
                for (const J in Jt) Object.defineProperty(ce, J, {
                    get: () => u.value[J],
                    enumerable: !0
                });
                z.provide(rl, qe), z.provide(bo, Ca(ce)), z.provide(Xl, u);
                const ae = z.unmount;
                pe.add(z), z.unmount = function() {
                    pe.delete(z), pe.size < 1 && (c = Jt, k && k(), k = null, u.value = Jt, De = !1, H = !1), ae()
                }
            }
        };

    function Ge(z) {
        return z.reduce((ce, ae) => ce.then(() => W(ae)), Promise.resolve())
    }
    return qe
}

function ys() {
    return yt(rl)
}

function _o(e) {
    return yt(bo)
}
const Nf = "0.1.0",
    Df = {
        version: Nf
    },
    Yl = "scan_operator_name";

function Nn() {
    return (localStorage.getItem(Yl) ?? "").trim() || "local"
}

function Lf(e) {
    const t = e.trim();
    t ? localStorage.setItem(Yl, t) : localStorage.removeItem(Yl)
}
const wo = "scan_auth_token",
    ko = "scan_guest_mode";

function $n() {
    return (sessionStorage.getItem(wo) ?? "").trim()
}

function Uf(e) {
    sessionStorage.setItem(wo, e)
}

function $o() {
    sessionStorage.removeItem(wo)
}

function Mr() {
    return sessionStorage.getItem(ko) === "1"
}

function Vf() {
    sessionStorage.setItem(ko, "1")
}

function Ff() {
    sessionStorage.removeItem(ko)
}
const sn = "http://127.0.0.1:18773/api/v1";

function Bf() {
    if (/^https?:\/\//.test(sn)) try {
        return new URL(sn).host
    } catch {}
    return `${window.location.host||"127.0.0.1"}（同源代理）`
}
class Ye extends Error {
    constructor(n, s, o, i) {
        super(o);
        ks(this, "status");
        ks(this, "code");
        ks(this, "detail");
        this.name = "ApiRequestError", this.status = n, this.code = s, this.detail = i
    }
}
const vs = "backend:down",
    js = "backend:up",
    Hs = "auth:unauthorized",
    Nr = 3e4,
    ul = 12e4,
    jf = 18e4,
    Bi = 2,
    Hf = 400;

function Kf(e) {
    return new Promise(t => window.setTimeout(t, e))
}

function cl() {
    return window.__IPC_TOKEN__ ?? null
}
async function Gf(e, t, n = Nr) {
    const s = new AbortController,
        o = window.setTimeout(() => s.abort(), n);
    let i;
    try {
        i = await fetch(`${sn}${e}`, {
            ...t,
            signal: s.signal
        })
    } catch (a) {
        throw a instanceof DOMException && a.name === "AbortError" ? new Ye(0, "TIMEOUT", `请求超时（>${n/1e3}s），后端可能未响应或正在处理`, null) : (window.dispatchEvent(new CustomEvent(vs)), new Ye(0, "BACKEND_UNREACHABLE", "无法连接本地推理服务，请确认服务已启动（默认地址 127.0.0.1:18773）", null))
    } finally {
        window.clearTimeout(o)
    }
    return window.dispatchEvent(new CustomEvent(js)), i.ok || await Co(i), await i.json()
}
async function Co(e) {
    const t = {
        400: "请求参数有误",
        401: "登录状态已失效，请重新登录",
        403: "当前账号无权限执行此操作",
        404: "请求的资源不存在",
        409: "与当前状态冲突，请刷新后重试",
        413: "文件超过大小上限",
        422: "提交的内容未通过校验",
        429: "请求过于频繁，请稍后再试",
        500: "服务内部错误",
        502: "推理服务不可用",
        503: "服务暂不可用，正在处理中"
    };
    let n = "HTTP_ERROR",
        s = t[e.status] ?? `请求失败（HTTP ${e.status}）`,
        o = null;
    try {
        const i = await e.json();
        i != null && i.error ? (n = i.error.code ?? n, s = i.error.message ?? s, o = i.error.detail ?? null) : i != null && i.detail && (n = i.detail.code ?? n, s = i.detail.message ?? s)
    } catch {}
    throw e.status === 401 && ($o(), window.dispatchEvent(new CustomEvent(Hs))), new Ye(e.status, n, s, o)
}

function on(e, t, n) {
    return xe(e, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(t)
    }, n)
}
async function xe(e, t, n = Nr) {
    const s = $n(),
        o = {
            "X-Operator-Name": Nn()
        };
    s && (o.Authorization = `Bearer ${s}`);
    const i = cl();
    i && (o["X-IPC-Token"] = i), Object.assign(o, (t == null ? void 0 : t.headers) ?? {});
    const a = {
        ...t,
        headers: o
    };
    let r;
    for (let u = 0; u <= Bi; u++) try {
        return await Gf(e, a, n)
    } catch (c) {
        if (r = c, !(c instanceof Ye && c.code === "BACKEND_UNREACHABLE") || u === Bi) break;
        await Kf(Hf * 2 ** u)
    }
    throw r
}

function Wf() {
    return xe("/health")
}

function qf(e) {
    return xe("/report", {
        method: "POST",
        body: e
    }, ul)
}

function zf(e) {
    const t = new URLSearchParams;
    e != null && e.level && t.set("level", e.level), e != null && e.workpiece && t.set("workpiece", e.workpiece), (e == null ? void 0 : e.classId) !== void 0 && t.set("class", String(e.classId)), e != null && e.dateFrom && t.set("from", e.dateFrom), e != null && e.dateTo && t.set("to", e.dateTo), (e == null ? void 0 : e.needReview) !== void 0 && t.set("need_review", e.needReview ? "true" : "false"), t.set("page", String((e == null ? void 0 : e.page) ?? 1)), t.set("size", String((e == null ? void 0 : e.size) ?? 50));
    const n = t.toString();
    return xe(`/records?${n}`)
}

function Jf(e) {
    return on("/review", e)
}

function Xf(e) {
    return on("/active/export", e)
}

function Yf() {
    return xe("/active/pool")
}

function Qf(e, t, n) {
    return new Promise((s, o) => {
        const i = new XMLHttpRequest;
        i.open("POST", `${sn}/batch`), i.timeout = 6e5;
        const a = $n();
        a && i.setRequestHeader("Authorization", `Bearer ${a}`);
        const r = Nn();
        i.setRequestHeader("X-Operator-Name", r);
        const u = cl();
        u && i.setRequestHeader("X-IPC-Token", u), i.upload.onprogress = c => {
            c.lengthComputable && t(Math.round(c.loaded / c.total * 100))
        }, i.onload = () => {
            var f, m, _, P;
            if (i.status >= 200 && i.status < 300) {
                try {
                    s(JSON.parse(i.responseText))
                } catch {
                    o(new Ye(0, "BAD_RESPONSE", "服务响应格式异常", null))
                }
                return
            }
            let c = "HTTP_ERROR",
                d = `提交失败（HTTP ${i.status}）`;
            try {
                const E = JSON.parse(i.responseText);
                c = ((f = E == null ? void 0 : E.error) == null ? void 0 : f.code) ?? ((m = E == null ? void 0 : E.detail) == null ? void 0 : m.code) ?? c, d = ((_ = E == null ? void 0 : E.error) == null ? void 0 : _.message) ?? ((P = E == null ? void 0 : E.detail) == null ? void 0 : P.message) ?? d
            } catch {}
            i.status === 401 && ($o(), window.dispatchEvent(new CustomEvent(Hs))), o(new Ye(i.status, c, d, null))
        }, i.onerror = () => {
            window.dispatchEvent(new CustomEvent(vs)), o(new Ye(0, "BACKEND_UNREACHABLE", "无法连接本地推理服务，请确认服务已启动", null))
        }, i.ontimeout = () => {
            o(new Ye(0, "TIMEOUT", "上传超时（>10 分钟），请减少单批数量后重试", null))
        }, i.send(e)
    })
}

function ji(e) {
    return xe(`/batch/${e}`)
}

function Hi() {
    return xe("/batches")
}

function Zf(e) {
    return xe(`/batch/${e}/cancel`, {
        method: "POST"
    })
}

function ev(e) {
    return xe(`/batch/${e}/pause`, {
        method: "POST"
    })
}

function tv(e) {
    return xe(`/batch/${e}/resume`, {
        method: "POST"
    })
}

function nv(e) {
    return xe(`/batch/${e}/retry`, {
        method: "POST"
    })
}

function sv(e, t) {
    return xe(`/batch/${e}/dedup/resolve`, {
        method: "POST",
        body: JSON.stringify({
            decisions: t
        })
    })
}

function lv() {
    return xe("/devices")
}

function ov(e) {
    return on("/devices", e)
}

function iv(e) {
    return xe(`/devices/${e}`)
}

function av(e, t) {
    return xe(`/devices/${e}/calibrations`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(t)
    })
}

function rv(e) {
    return xe(`/report/${e}/verify`, {
        method: "POST"
    })
}

function Eo(e) {
    return xe(`/report/${e}/detections`)
}

function uv(e) {
    return xe(`/report/${e}/narrative`, {}, jf)
}

function cv(e, t) {
    return xe(`/review/${e}/defects`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(t)
    }, ul)
}

function dv(e, t) {
    return xe(`/review/defects/${e}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(t)
    }, ul)
}

function fv(e, t) {
    const n = new URLSearchParams({
        reason: t
    });
    return xe(`/review/defects/${e}?${n}`, {
        method: "DELETE"
    }, ul)
}

function vv() {
    return xe("/std-eval/personnel")
}

function pv(e) {
    return xe("/std-eval/personnel", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            people: e
        })
    })
}

function hv(e) {
    return on("/std-eval/record", e)
}

function mv(e) {
    return Dr(`${sn}/std-eval/record/pdf?record_name=${encodeURIComponent(e)}`)
}

function gv() {
    return xe("/std-eval/history")
}

function yv(e) {
    return Dr(`${sn}/report/${encodeURIComponent(e)}/pdf`)
}

function bv(e, t) {
    return on("/export/requests", {
        subject: e,
        reason: t || null
    })
}

function _v(e) {
    return on(`/export/requests/${encodeURIComponent(e)}/token`, {})
}

function wv(e) {
    return xe(`/export/requests/${encodeURIComponent(e)}`)
}
async function Ki(e, t) {
    const n = {
            "X-Operator-Name": Nn()
        },
        s = $n();
    s && (n.Authorization = `Bearer ${s}`);
    const o = cl();
    o && (n["X-IPC-Token"] = o);
    const i = t == null ? void 0 : t.trim();
    i && (n["X-Export-Token"] = i);
    let a;
    try {
        a = await fetch(`${sn}${e}`, {
            headers: n
        })
    } catch {
        throw window.dispatchEvent(new CustomEvent(vs)), new Ye(0, "BACKEND_UNREACHABLE", "无法连接本地推理服务，请确认服务已启动（默认地址 127.0.0.1:18773）", null)
    }
    return window.dispatchEvent(new CustomEvent(js)), a.ok || await Co(a), await a.blob()
}

function Dr(e) {
    const t = $n();
    if (!t) return e;
    const n = e.includes("?") ? "&" : "?";
    return `${e}${n}access_token=${encodeURIComponent(t)}`
}

function kv() {
    return xe("/auth/challenge")
}

function $v(e, t, n) {
    return xe("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: e,
            challenge_id: t,
            private_key: n
        })
    })
}

function Cv(e) {
    return on("/auth/bootstrap", e)
}

function Ev() {
    return xe("/auth/logout", {
        method: "POST"
    })
}

function xv() {
    return xe("/auth/me")
}

function Sv() {
    return xe("/auth/accounts")
}

function Av(e) {
    return on("/auth/accounts", e)
}

function Gi(e) {
    return xe(`/auth/accounts/${encodeURIComponent(e)}/keypair`, {
        method: "POST"
    })
}

function Rv(e, t) {
    return xe(`/auth/accounts/${encodeURIComponent(e)}/status`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            status: t
        })
    })
}

function Tv() {
    return xe("/auth/bootstrap/status")
}
async function Iv(e) {
    const t = await fetch(`${sn}/images/${encodeURIComponent(e)}/preview.png`, {
        headers: await Ov()
    });
    return t.ok || await Co(t), await t.blob()
}
async function Ov() {
    const e = {
            "X-Operator-Name": Nn()
        },
        t = $n();
    t && (e.Authorization = `Bearer ${t}`);
    const n = cl();
    return n && (e["X-IPC-Token"] = n), e
}

function Wi() {
    return xe("/llm/status", {
        method: "GET"
    }, 3e4)
}

function Pv(e = !0) {
    return xe(`/llm/models?include_services=${e?"true":"false"}`, {
        method: "GET"
    }, 6e4)
}

function Mv() {
    return xe("/llm/scan", {
        method: "POST"
    })
}

function Nv() {
    return xe("/llm/scan/cancel", {
        method: "POST"
    })
}

function Dv(e) {
    return xe(`/llm/models/${encodeURIComponent(e)}/select`, {
        method: "POST"
    }, 6e4)
}

function Lv() {
    return xe("/llm/selection", {
        method: "DELETE"
    }, 6e4)
}

function Uv(e) {
    return xe("/llm/dirs", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            path: e
        })
    })
}

function Vv(e) {
    return xe(`/llm/dirs?path=${encodeURIComponent(e)}`, {
        method: "DELETE"
    })
}
const Fv = 3e4,
    Bv = 9e4,
    Ql = "scan_logout_reason";

function jv() {
    const e = sessionStorage.getItem(Ql);
    return sessionStorage.removeItem(Ql), e === "idle" || e === "expired" || e === "manual" ? e : null
}

function qi(e) {
    sessionStorage.setItem(Ql, e)
}
const an = il("auth", () => {
        const e = w($n()),
            t = w(""),
            n = w(""),
            s = w(""),
            o = w(Mr()),
            i = me(() => e.value !== "" || o.value);
        let a, r = Date.now(),
            u = 15 * 6e4;
        const c = w(!1);
        async function d(A, C) {
            const T = await kv(),
                x = await $v(A, T.challenge_id, C);
            e.value = x.token, t.value = x.username, n.value = x.role, s.value = x.account_id, Uf(x.token), u = Math.max(1, x.idle_timeout_min) * 6e4, r = Date.now()
        }

        function f() {
            o.value = !0, t.value = "guest", n.value = "guest", s.value = "guest", Vf()
        }
        async function m() {
            if (o.value && !e.value) return !0;
            if (!e.value) return !1;
            try {
                const A = await xv();
                return t.value = A.username, n.value = A.role, s.value = A.account_id, !0
            } catch {
                return !1
            }
        }
        async function _(A = "manual") {
            try {
                e.value && await Ev()
            } catch {}
            A !== "manual" && qi(A), P()
        }

        function P() {
            e.value = "", t.value = "", n.value = "", s.value = "", o.value = !1, c.value = !1, $o(), Ff(), K()
        }

        function E() {
            r = Date.now(), c.value = !1
        }

        function N() {
            if (!e.value) return;
            const A = Date.now() - r;
            if (A > u) {
                _("idle");
                return
            }
            c.value = u - A <= Bv
        }

        function M() {
            qi("expired"), P()
        }

        function L() {
            window.addEventListener("mousemove", E, {
                passive: !0
            }), window.addEventListener("keydown", E), window.addEventListener(Hs, M), a = window.setInterval(N, Fv)
        }

        function K() {
            a !== void 0 && (window.clearInterval(a), a = void 0)
        }

        function I() {
            K(), window.removeEventListener("mousemove", E), window.removeEventListener("keydown", E), window.removeEventListener(Hs, M)
        }
        return {
            token: e,
            username: t,
            role: n,
            accountId: s,
            guest: o,
            isLoggedIn: i,
            idleWarning: c,
            login: d,
            enterGuest: f,
            restore: m,
            logout: _,
            bindIdleWatch: L,
            unbindIdleWatch: I
        }
    }),
    Hv = ["onMouseenter"],
    Kv = ["onClick"],
    Gv = {
        key: 0,
        class: "dropdown"
    },
    Wv = {
        key: 0,
        class: "sep"
    },
    qv = ["onClick"],
    zv = {
        class: "lab"
    },
    Jv = {
        key: 0,
        class: "key"
    },
    Xv = {
        class: "ctx"
    },
    Yv = {
        key: 0,
        class: "ctx user"
    },
    Qv = Fe({
        __name: "MenuBar",
        props: {
            activeView: {}
        },
        emits: ["action"],
        setup(e, {
            emit: t
        }) {
            const n = t,
                s = {
                    journey: "单幅评定",
                    batch: "批量评定",
                    archive: "检测档案",
                    viewer: "底片观察",
                    "std-eval": "系统评价",
                    device: "设备标定",
                    admin: "账号管理",
                    llm: "本地大模型"
                },
                o = an(),
                i = ys(),
                a = {
                    sysadmin: "系统管理员",
                    secadmin: "安全保密管理员",
                    auditor: "安全审计员",
                    guest: "访客"
                };

            function r() {
                o.logout().then(() => i.push("/login"))
            }
            const u = me(() => [{
                    id: "file",
                    label: "文件",
                    items: [{
                        id: "open-image",
                        label: "打开射线影像…",
                        shortcut: "Ctrl+O"
                    }, {
                        id: "open-batch",
                        label: "批量导入底片…",
                        shortcut: "Ctrl+Shift+O"
                    }, {
                        id: "sep1",
                        label: "",
                        separator: !0
                    }, {
                        id: "exit",
                        label: "退出",
                        shortcut: "Alt+F4"
                    }]
                }, {
                    id: "view",
                    label: "视图",
                    items: [{
                        id: "view-journey",
                        label: "单幅评定",
                        shortcut: "Ctrl+1"
                    }, {
                        id: "view-batch",
                        label: "批量评定",
                        shortcut: "Ctrl+2"
                    }, {
                        id: "view-archive",
                        label: "检测档案",
                        shortcut: "Ctrl+3"
                    }, {
                        id: "view-device",
                        label: "设备标定",
                        shortcut: "Ctrl+4"
                    }, {
                        id: "view-viewer",
                        label: "底片观察",
                        shortcut: "Ctrl+5"
                    }, {
                        id: "view-std-eval",
                        label: "系统评价",
                        shortcut: "Ctrl+6"
                    }, {
                        id: "view-llm",
                        label: "本地大模型",
                        shortcut: "Ctrl+7"
                    }, ...o.role === "sysadmin" ? [{
                        id: "view-admin",
                        label: "账号管理",
                        shortcut: ""
                    }] : []]
                }, {
                    id: "tools",
                    label: "工具",
                    items: [{
                        id: "operator",
                        label: "检测人员信息…"
                    }]
                }, {
                    id: "help",
                    label: "帮助",
                    items: [{
                        id: "shortcuts",
                        label: "快捷键…"
                    }, {
                        id: "about",
                        label: "关于…"
                    }]
                }]),
                c = w(null);

            function d(P) {
                c.value = c.value === P ? null : P
            }

            function f(P) {
                c.value !== null && (c.value = P)
            }

            function m(P) {
                c.value = null, n("action", P)
            }

            function _() {
                c.value = null
            }
            return dt(() => document.addEventListener("click", _)), _n(() => document.removeEventListener("click", _)), (P, E) => (p(), h("div", {
                class: "menubar",
                onClick: E[0] || (E[0] = Je(() => {}, ["stop"]))
            }, [E[1] || (E[1] = l("div", {
                class: "brand"
            }, [l("span", {
                class: "mark",
                "aria-hidden": "true"
            }), l("span", {
                class: "name"
            }, "射线焊缝缺陷智能检测系统")], -1)), (p(!0), h(ue, null, Oe(u.value, N => (p(), h("div", {
                key: N.id,
                class: "menu",
                onMouseenter: M => f(N.id)
            }, [l("button", {
                type: "button",
                class: we({
                    open: c.value === N.id
                }),
                onClick: M => d(N.id)
            }, v(N.label), 11, Kv), c.value === N.id ? (p(), h("div", Gv, [(p(!0), h(ue, null, Oe(N.items, M => (p(), h(ue, {
                key: M.id
            }, [M.separator ? (p(), h("div", Wv)) : (p(), h("button", {
                key: 1,
                type: "button",
                class: "item",
                onClick: L => m(M.id)
            }, [l("span", zv, v(M.label), 1), M.shortcut ? (p(), h("span", Jv, v(M.shortcut), 1)) : V("", !0)], 8, qv))], 64))), 128))])) : V("", !0)], 40, Hv))), 128)), E[2] || (E[2] = l("div", {
                class: "spacer"
            }, null, -1)), l("div", Xv, " 当前工作区：" + v(s[e.activeView] ?? ""), 1), ye(o).isLoggedIn ? (p(), h("div", Yv, [ee(v(ye(o).username) + "（" + v(a[ye(o).role] ?? ye(o).role) + "） ", 1), l("button", {
                type: "button",
                class: "logout",
                onClick: r
            }, " 注销 ")])) : V("", !0)]))
        }
    }),
    We = (e, t) => {
        const n = e.__vccOpts || e;
        for (const [s, o] of t) n[s] = o;
        return n
    },
    Zv = We(Qv, [
        ["__scopeId", "data-v-d6b5a33d"]
    ]),
    ep = {
        class: "ribbon"
    },
    tp = {
        class: "group"
    },
    np = {
        class: "group views"
    },
    sp = ["title", "onClick"],
    lp = {
        viewBox: "0 0 24 24",
        class: "ic s"
    },
    op = ["d"],
    ip = Fe({
        __name: "RibbonBar",
        props: {
            activeView: {},
            operator: {}
        },
        emits: ["action", "view"],
        setup(e, {
            emit: t
        }) {
            const n = t,
                s = [{
                    id: "journey",
                    label: "单幅评定",
                    icon: "M4 3h16v14H4z M4 17l5-5 4 4 3-3 4 4"
                }, {
                    id: "batch",
                    label: "批量评定",
                    icon: "M3 4h8v8H3z M13 4h8v8h-8z M3 14h8v8H3z M13 14h8v8h-8z"
                }, {
                    id: "archive",
                    label: "检测档案",
                    icon: "M4 4h16v4H4z M4 10h16v10H4z M8 7h.01"
                }, {
                    id: "device",
                    label: "设备标定",
                    icon: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 2v3 M12 19v3 M2 12h3 M19 12h3"
                }];
            return (o, i) => (p(), h("div", ep, [l("div", tp, [l("button", {
                type: "button",
                class: "big",
                title: "导入单幅射线底片并提交评定 (Ctrl+O)",
                onClick: i[0] || (i[0] = a => n("action", "open-image"))
            }, [...i[3] || (i[3] = [l("svg", {
                viewBox: "0 0 24 24",
                class: "ic"
            }, [l("path", {
                d: "M12 3 5 9v12h14V9z M9 21v-7h6v7"
            })], -1), l("span", null, "打开影像", -1)])]), l("button", {
                type: "button",
                class: "big",
                title: "多幅底片/整卷文件夹批量导入评定 (Ctrl+Shift+O)",
                onClick: i[1] || (i[1] = a => n("action", "open-batch"))
            }, [...i[4] || (i[4] = [l("svg", {
                viewBox: "0 0 24 24",
                class: "ic"
            }, [l("path", {
                d: "M3 5h7l2 2h9v12H3z M3 5v14"
            })], -1), l("span", null, "批量导入", -1)])])]), i[5] || (i[5] = l("div", {
                class: "divider"
            }, null, -1)), l("div", np, [(p(), h(ue, null, Oe(s, a => l("button", {
                key: a.id,
                type: "button",
                class: we({
                    on: e.activeView === a.id
                }),
                title: `${a.label} (Ctrl+${s.indexOf(a)+1})`,
                onClick: r => n("view", a.id)
            }, [(p(), h("svg", lp, [l("path", {
                d: a.icon
            }, null, 8, op)])), l("span", null, v(a.label), 1)], 10, sp)), 64))]), i[6] || (i[6] = l("div", {
                class: "spacer"
            }, null, -1)), l("button", {
                type: "button",
                class: "operator",
                title: "点击修改检测人员姓名（用于报告签署与审计追溯）",
                onClick: i[2] || (i[2] = a => n("action", "operator"))
            }, " 检测人员：" + v(e.operator), 1)]))
        }
    }),
    ap = We(ip, [
        ["__scopeId", "data-v-4dae1533"]
    ]),
    Lr = il("backend", () => {
        const e = w(!1),
            t = w(!1),
            n = w(!1);
        let s;

        function o() {
            s !== void 0 && (window.clearTimeout(s), s = void 0)
        }

        function i() {
            o(), s = window.setTimeout(async () => {
                try {
                    (await Wf()).status === "starting" ? (n.value = !0, i()) : (n.value = !1, t.value = !0)
                } catch {
                    i()
                }
            }, 1e3)
        }

        function a() {
            e.value = !0, t.value = !1, i()
        }

        function r() {
            e.value = !1, t.value = !0, n.value = !1, o()
        }

        function u() {
            window.addEventListener(vs, a), window.addEventListener(js, r)
        }

        function c() {
            o(), window.removeEventListener(vs, a), window.removeEventListener(js, r)
        }

        function d() {
            i()
        }
        return {
            backendDown: e,
            backendUp: t,
            modelLoading: n,
            bind: u,
            unbind: c,
            start: d,
            stopPolling: o
        }
    }),
    rp = {
        class: "statusbar"
    },
    up = {
        class: "cell"
    },
    cp = {
        class: "cell sep"
    },
    dp = {
        class: "cell sep"
    },
    fp = {
        class: "cell"
    },
    vp = Fe({
        __name: "StatusBar",
        setup(e) {
            const t = Lr(),
                n = me(() => t.backendUp ? "up" : t.backendDown ? "down" : "connecting"),
                s = me(() => n.value === "up" ? "就绪" : n.value === "down" ? "不可用" : "加载中"),
                o = w(new Date),
                i = Bf();
            let a;
            dt(() => {
                a = window.setInterval(() => o.value = new Date, 1e3)
            }), _n(() => {
                a !== void 0 && window.clearInterval(a)
            });

            function r(u) {
                const c = d => String(d).padStart(2, "0");
                return `${u.getFullYear()}-${c(u.getMonth()+1)}-${c(u.getDate())} ${c(u.getHours())}:${c(u.getMinutes())}:${c(u.getSeconds())}`
            }
            return (u, c) => (p(), h("footer", rp, [l("div", up, [l("span", {
                class: we(["lamp", n.value])
            }, null, 2), ee(" " + v(n.value === "up" ? "系统就绪" : n.value === "down" ? "推理服务未连接" : "正在连接推理服务"), 1)]), l("div", cp, " 服务端 " + v(ye(i)), 1), l("div", dp, [c[0] || (c[0] = ee(" 评定模型：", -1)), l("span", {
                class: we(s.value === "就绪" ? "ok" : "warn")
            }, v(s.value), 3)]), c[1] || (c[1] = l("div", {
                class: "cell sep"
            }, " 本地化部署 · 数据不出机 ", -1)), c[2] || (c[2] = l("div", {
                class: "spacer"
            }, null, -1)), l("div", fp, v(r(o.value)), 1)]))
        }
    }),
    pp = We(vp, [
        ["__scopeId", "data-v-08ff7e76"]
    ]);

function Ae(e) {
    return e instanceof Error && e.message ? e.message : typeof e == "string" && e.trim() ? e : "操作失败，请重试；若持续出现请联系系统管理员查看服务日志。"
}

function hp(e, t = 24) {
    const n = (e ?? "").trim();
    return n ? n.length > t ? `${n.slice(0,t)}…` : n : ""
}

function tn(e) {
    if (!e || !e.status) return null;
    const t = hp(e.text),
        n = s => t ? `${s}（${t}）` : s;
    return e.status === "present" ? e.orientation === "mirrored" ? {
        label: t ? `镜像 ${t}` : "印字·镜像",
        cls: "ok",
        title: n("识别到印字（镜像：底片背面扫描，文字左右翻转）")
    } : {
        label: t ? `正向 ${t}` : "印字·正向",
        cls: "ok",
        title: n("识别到印字（正向）")
    } : e.status === "missing" ? e.need_review || e.needReview ? {
        label: "无印字·待复核",
        cls: "warn",
        title: "未识别到日期/编号印字，需人工复核确认底片身份"
    } : {
        label: "无印字",
        cls: "muted",
        title: "未识别到日期/编号印字（未触发人工复核：小批量未裁决或该批已按印字占比豁免）"
    } : null
}

function zi(e) {
    return e.replace(/[\\/:*?"<>|]/g, "_").slice(0, 120)
}

function xo() {
    const e = an(),
        t = w(!1),
        n = w(!1),
        s = w(null),
        o = w(null),
        i = w(""),
        a = w(null),
        r = w(null),
        u = w(null);
    let c;

    function d(I) {
        return `export_req_${I}`
    }

    function f(I, A) {
        const C = URL.createObjectURL(I),
            T = document.createElement("a");
        T.href = C, T.download = A, T.click(), window.setTimeout(() => URL.revokeObjectURL(C), 4e3)
    }

    function m() {
        c !== void 0 && (window.clearInterval(c), c = void 0)
    }
    async function _() {
        if (!(!r.value || !t.value)) try {
            const I = await wv(r.value);
            I.status !== u.value && (u.value = I.status === "approved" ? "approved" : I.status === "rejected" ? "rejected" : "pending", u.value === "approved" ? s.value = "申请已批准，点击「领取令牌并下载」完成导出。" : u.value === "rejected" && (o.value = "导出申请被安全保密管理员驳回，如需导出请重新申请并补充理由。"))
        } catch {}
    }

    function P() {
        m(), c = window.setInterval(() => void _(), 5e3)
    }
    async function E(I, A) {
        a.value = I;
        const C = `${zi(A??I)}.pdf`;
        if (e.role === "secadmin") {
            window.open(yv(I), "_blank", "noopener"), a.value = null;
            return
        }
        n.value = !0, o.value = null, s.value = null;
        try {
            f(await Ki(`/report/${encodeURIComponent(I)}/pdf`), C), a.value = null;
            return
        } catch (T) {
            T instanceof Ye && T.code === "EXPORT_TOKEN_REQUIRED" ? (r.value = sessionStorage.getItem(d(I)), u.value = null, t.value = !0, P()) : (t.value = !0, o.value = Ae(T))
        } finally {
            n.value = !1
        }
    }
    async function N() {
        if (a.value) {
            n.value = !0, o.value = null, s.value = null;
            try {
                const I = await bv(`report:${a.value}`, i.value.trim() || void 0);
                r.value = I.request_id, sessionStorage.setItem(d(a.value), I.request_id), u.value = "pending", s.value = "申请已提交，等待安全保密管理员审批；批准后本面板会提示，届时点击「领取令牌并下载」。", P()
            } catch (I) {
                o.value = Ae(I)
            } finally {
                n.value = !1
            }
        }
    }
    async function M() {
        if (!(!r.value || !a.value)) {
            n.value = !0, o.value = null, s.value = null;
            try {
                const I = await _v(r.value);
                f(await Ki(`/report/${encodeURIComponent(a.value)}/pdf`, I.token), `${zi(a.value)}.pdf`), sessionStorage.removeItem(d(a.value)), r.value = null, t.value = !1, m(), a.value = null
            } catch (I) {
                o.value = Ae(I)
            } finally {
                n.value = !1
            }
        }
    }

    function L(I) {
        i.value = I
    }

    function K() {
        t.value = !1, m(), o.value = null, s.value = null, i.value = "", a.value = null
    }
    return so(m), {
        gateOpen: t,
        gateBusy: n,
        gateMsg: s,
        gateErr: o,
        gateReason: i,
        reportId: a,
        requestId: r,
        approval: u,
        openPdf: E,
        applyExportRequest: N,
        fetchTokenAndDownload: M,
        setReason: L,
        closeGate: K
    }
}
const mp = {
        class: "modal",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "受控导出"
    },
    gp = ["model-value"],
    yp = {
        key: 0,
        class: "gate-status",
        role: "status"
    },
    bp = {
        key: 1,
        class: "gate-status ok",
        role: "status"
    },
    _p = {
        key: 2,
        class: "ok-msg"
    },
    wp = {
        key: 3,
        class: "err show"
    },
    kp = {
        class: "gate-acts"
    },
    $p = ["disabled"],
    Cp = ["disabled"],
    Ep = Fe({
        __name: "PdfGateModal",
        props: {
            ctrl: {}
        },
        setup(e) {
            return (t, n) => e.ctrl.gateOpen.value ? (p(), h("div", {
                key: 0,
                class: "modal-mask",
                onClick: n[4] || (n[4] = Je((...s) => e.ctrl.closeGate && e.ctrl.closeGate(...s), ["self"]))
            }, [l("div", mp, [n[6] || (n[6] = l("h3", {
                class: "m-title"
            }, " 受控导出（C-14） ", -1)), n[7] || (n[7] = l("p", {
                class: "gate-hint"
            }, " 报告 PDF 受导出审批管控：需提交申请并由安全保密管理员批准后， 领取一次性导出令牌完成下载。全程留痕审计。 ", -1)), n[8] || (n[8] = l("label", {
                class: "gate-lab"
            }, "申请理由（选填）", -1)), l("input", {
                "model-value": e.ctrl.gateReason.value,
                class: "gate-in",
                type: "text",
                maxlength: "200",
                placeholder: "如：归档移交 / 质量复盘",
                "onUpdate:modelValue": n[0] || (n[0] = (...s) => e.ctrl.setReason && e.ctrl.setReason(...s))
            }, null, 8, gp), e.ctrl.approval.value === "pending" ? (p(), h("p", yp, [...n[5] || (n[5] = [l("span", {
                class: "spin"
            }, null, -1), ee(" 审批状态：待安全保密管理员审批（本面板每 5 秒自动刷新， 批准后会提示，无需关闭重进） ", -1)])])) : e.ctrl.approval.value === "approved" ? (p(), h("p", bp, " ✓ 审批已通过，点击「领取令牌并下载」完成导出。 ")) : V("", !0), e.ctrl.gateMsg.value ? (p(), h("div", _p, " ✓ " + v(e.ctrl.gateMsg.value), 1)) : V("", !0), e.ctrl.gateErr.value ? (p(), h("div", wp, " ⚠ " + v(e.ctrl.gateErr.value), 1)) : V("", !0), l("div", kp, [l("button", {
                class: "g-btn",
                type: "button",
                disabled: e.ctrl.gateBusy.value,
                onClick: n[1] || (n[1] = (...s) => e.ctrl.applyExportRequest && e.ctrl.applyExportRequest(...s))
            }, v(e.ctrl.requestId.value ? "重新申请" : "申请导出"), 9, $p), e.ctrl.requestId.value ? (p(), h("button", {
                key: 0,
                class: "g-btn primary",
                type: "button",
                disabled: e.ctrl.gateBusy.value,
                onClick: n[2] || (n[2] = (...s) => e.ctrl.fetchTokenAndDownload && e.ctrl.fetchTokenAndDownload(...s))
            }, " 领取令牌并下载 ", 8, Cp)) : V("", !0), l("button", {
                class: "g-btn ghost",
                type: "button",
                onClick: n[3] || (n[3] = (...s) => e.ctrl.closeGate && e.ctrl.closeGate(...s))
            }, " 关闭 ")])])])) : V("", !0)
        }
    }),
    So = We(Ep, [
        ["__scopeId", "data-v-7d57753d"]
    ]),
    dl = ["气孔", "夹渣", "未焊透", "未熔合", "裂纹", "咬边", "内凹"],
    Ji = [{
        title: "工程信息",
        fields: [{
            key: "client_unit",
            label: "委托单位"
        }, {
            key: "project_name",
            label: "工程名称"
        }, {
            key: "project_category",
            label: "工程类别/检测时机",
            ph: "如 锅炉安装/焊后"
        }, {
            key: "test_address",
            label: "检测地址",
            ph: "如 施工现场"
        }]
    }, {
        title: "工件概况",
        fields: [{
            key: "material",
            label: "材质",
            ph: "如 20G"
        }, {
            key: "part_no",
            label: "工件编号"
        }, {
            key: "groove_type",
            label: "坡口形式",
            ph: "如 V"
        }, {
            key: "surface_status",
            label: "表面状况",
            ph: "如 符合要求"
        }, {
            key: "weld_process",
            label: "焊接方式",
            ph: "如 GTAW"
        }, {
            key: "heat_treatment",
            label: "热处理状态"
        }]
    }, {
        title: "技术要求",
        fields: [{
            key: "tech_level",
            label: "检测技术等级",
            ph: "A / AB / B"
        }, {
            key: "accept_level",
            label: "合格级别（验收要求）",
            ph: "Ⅰ / Ⅱ / Ⅲ / Ⅳ"
        }, {
            key: "record_no",
            label: "原始记录编号"
        }, {
            key: "scatter_control",
            label: "散射线控制"
        }]
    }, {
        title: "检测器材及工艺参数",
        fields: [{
            key: "source_kind",
            label: "源种类",
            ph: "X射线 / γ源"
        }, {
            key: "device_no",
            label: "设备型号/编号"
        }, {
            key: "focus_size",
            label: "焦点尺寸",
            ph: "如 2.0×2.0mm"
        }, {
            key: "film_model",
            label: "胶片型号"
        }, {
            key: "film_size",
            label: "胶片规格",
            ph: "如 180×80mm"
        }, {
            key: "film_class",
            label: "胶片分类等级",
            ph: "如 C5"
        }, {
            key: "screen_way",
            label: "增感方式",
            ph: "如 Pb"
        }, {
            key: "iqi_position",
            label: "像质计摆放",
            ph: "源侧 / 胶片侧"
        }, {
            key: "screens",
            label: "前屏/后屏",
            ph: "如 0.03/0.03mm"
        }, {
            key: "technique",
            label: "透照方式",
            ph: "如 双壁双影"
        }, {
            key: "focus_distance",
            label: "F（焦距）"
        }, {
            key: "source_distance",
            label: "f（源至工件）"
        }, {
            key: "film_distance",
            label: "b（工件至胶片）"
        }, {
            key: "tube_voltage",
            label: "管电压",
            ph: "如 190kV"
        }, {
            key: "tube_current",
            label: "管电流",
            ph: "如 5mA"
        }, {
            key: "exposure_time",
            label: "曝光时间",
            ph: "如 1.5min"
        }, {
            key: "develop_method",
            label: "冲洗条件",
            ph: "手工 / 自动"
        }, {
            key: "developer",
            label: "显影液配方"
        }, {
            key: "develop_temp",
            label: "洗片温度",
            ph: "如 22℃"
        }]
    }],
    xp = ["底片影像加载", "影像质量校验（黑度 D · 像质计 IQI）", "缺陷检出与当量测定", "标准符合性判定（NB/T 47013.2）", "检测数据归档", "评片报告签发（PDF/A）"],
    Sp = {
        class: "pool"
    },
    Ap = {
        key: 0,
        class: "hint"
    },
    Rp = {
        key: 1,
        class: "hint"
    },
    Tp = {
        class: "pool-meta"
    },
    Ip = {
        class: "fp"
    },
    Op = {
        key: 0
    },
    Pp = {
        class: "stat"
    },
    Mp = {
        class: "search"
    },
    Np = ["value"],
    Dp = ["value"],
    Lp = {
        class: "nr-check"
    },
    Up = {
        key: 0,
        class: "hint"
    },
    Vp = {
        key: 1,
        class: "err show"
    },
    Fp = {
        key: 0,
        class: "empty"
    },
    Bp = {
        key: 1,
        class: "empty"
    },
    jp = ["title"],
    Hp = {
        key: 1
    },
    Kp = {
        key: 0,
        class: "lv"
    },
    Gp = {
        key: 1,
        class: "need"
    },
    Wp = {
        key: 0,
        class: "need"
    },
    qp = {
        key: 1
    },
    zp = {
        class: "ops"
    },
    Jp = ["onClick"],
    Xp = ["onClick"],
    Yp = {
        class: "stat"
    },
    Qp = {
        key: 0,
        class: "pager"
    },
    Zp = ["disabled"],
    eh = {
        class: "pg"
    },
    th = ["disabled"],
    nh = Fe({
        __name: "ArchiveView",
        setup(e) {
            const t = {
                    0: "非密",
                    1: "内部",
                    2: "秘密",
                    3: "机密"
                },
                n = ys(),
                s = xo(),
                o = w(!0),
                i = w(null),
                a = w(null),
                r = w(""),
                u = w(""),
                c = w(""),
                d = w(""),
                f = w(null),
                m = w(!1),
                _ = w(1),
                P = w(50),
                E = w(0),
                N = me(() => r.value !== "" || u.value.trim() !== "" || c.value.trim() !== "" || d.value.trim() !== "" || f.value !== null || m.value);

            function M(B) {
                n.push({
                    name: "viewer",
                    query: {
                        image_id: B
                    }
                })
            }

            function L(B) {
                s.openPdf(B)
            }
            let K = 0;
            const I = w(!0),
                A = w(null);
            async function C() {
                I.value = !0;
                try {
                    A.value = await Yf()
                } catch {
                    A.value = null
                } finally {
                    I.value = !1
                }
            }
            async function T() {
                const B = ++K;
                o.value = !0, i.value = null;
                try {
                    const k = await zf({
                        level: r.value || void 0,
                        workpiece: u.value || void 0,
                        dateFrom: c.value.trim() || void 0,
                        dateTo: d.value.trim() || void 0,
                        classId: f.value ?? void 0,
                        needReview: m.value ? !0 : void 0,
                        page: _.value,
                        size: P.value
                    });
                    if (B !== K) return;
                    a.value = k, E.value = k.total
                } catch (k) {
                    if (B !== K) return;
                    i.value = Ae(k)
                } finally {
                    B === K && (o.value = !1)
                }
            }
            dt(() => {
                T(), C()
            });

            function x() {
                _.value = 1, T()
            }

            function W() {
                r.value = "", u.value = "", c.value = "", d.value = "", f.value = null, m.value = !1, x()
            }

            function te(B) {
                const k = Math.max(1, Math.ceil(E.value / P.value));
                B < 1 || B > k || (_.value = B, T())
            }
            const de = ["", "I", "II", "III", "IV"];
            return (B, k) => (p(), h("div", null, [k[19] || (k[19] = l("h1", {
                class: "title-zine",
                "data-t": "检测档案"
            }, " 检测档案 ", -1)), k[20] || (k[20] = l("div", {
                class: "lede"
            }, " 检索本地归档的检测评定记录（数据来自本地检测档案数据库） ", -1)), l("section", Sp, [k[11] || (k[11] = l("h2", {
                class: "pool-title"
            }, " 主动学习训练样本库 ", -1)), I.value ? (p(), h("p", Ap, " 加载中… ")) : A.value ? (p(), h(ue, {
                key: 2
            }, [l("div", Tp, [l("span", null, [k[9] || (k[9] = ee("样本总数：", -1)), l("b", null, v(A.value.sample_count), 1)]), l("span", null, [k[10] || (k[10] = ee("数据集版本指纹：", -1)), l("code", Ip, v(A.value.fingerprint ?? "—"), 1)]), A.value.exported_at ? (p(), h("span", Op, "最近导出：" + v(A.value.exported_at), 1)) : V("", !0)]), l("p", Pp, " 经人工复核确认的缺陷样本将回流至训练样本库（§5.5 持续学习闭环），标注文件： " + v(A.value.files.length ? A.value.files.join(" · ") : "暂无，完成一次样本导出后生成"), 1)], 64)) : (p(), h("p", Rp, " 训练样本库暂不可用（后端未装配或目录不存在）。 "))]), l("div", Mp, [he(l("input", {
                "onUpdate:modelValue": k[0] || (k[0] = $ => u.value = $),
                placeholder: "按工件编号检索…",
                onKeyup: Tt(x, ["enter"])
            }, null, 544), [
                [Ee, u.value]
            ]), he(l("select", {
                "onUpdate:modelValue": k[1] || (k[1] = $ => r.value = $),
                onChange: x
            }, [(p(), h(ue, null, Oe(de, $ => l("option", {
                key: $,
                value: $
            }, v($ ? `${$} 级` : "全部级别"), 9, Np)), 64))], 544), [
                [pt, r.value]
            ]), he(l("input", {
                "onUpdate:modelValue": k[2] || (k[2] = $ => c.value = $),
                type: "date",
                title: "归档日期起",
                onChange: x
            }, null, 544), [
                [Ee, c.value]
            ]), he(l("input", {
                "onUpdate:modelValue": k[3] || (k[3] = $ => d.value = $),
                type: "date",
                title: "归档日期止",
                onChange: x
            }, null, 544), [
                [Ee, d.value]
            ]), he(l("select", {
                "onUpdate:modelValue": k[4] || (k[4] = $ => f.value = $),
                onChange: x
            }, [k[12] || (k[12] = l("option", {
                value: null
            }, " 全部缺陷类别 ", -1)), (p(!0), h(ue, null, Oe(ye(dl), ($, j) => (p(), h("option", {
                key: j,
                value: j
            }, " 含" + v($), 9, Dp))), 128))], 544), [
                [pt, f.value]
            ]), l("label", Lp, [he(l("input", {
                "onUpdate:modelValue": k[5] || (k[5] = $ => m.value = $),
                type: "checkbox",
                onChange: x
            }, null, 544), [
                [kn, m.value]
            ]), k[13] || (k[13] = ee(" 仅看待复核 ", -1))]), l("button", {
                class: "btn ghost",
                type: "button",
                style: {
                    "margin-top": "0"
                },
                onClick: x
            }, " 检索 "), N.value ? (p(), h("button", {
                key: 0,
                class: "btn link",
                type: "button",
                style: {
                    "margin-top": "0"
                },
                onClick: W
            }, " 清除筛选 ")) : V("", !0)]), o.value ? (p(), h("p", Up, " 加载中… ")) : i.value ? (p(), h("p", Vp, [ee(" ⚠ 加载失败：" + v(i.value) + "　", 1), l("button", {
                class: "btn link",
                type: "button",
                onClick: x
            }, " 重试 ")])) : !a.value || a.value.items.length === 0 ? (p(), h(ue, {
                key: 2
            }, [N.value ? (p(), h("p", Fp, [k[14] || (k[14] = ee(" 没有匹配当前筛选条件的归档记录。可调整筛选条件，或 ", -1)), l("a", {
                href: "#",
                class: "clr",
                onClick: Je(W, ["prevent"])
            }, "清除全部筛选"), k[15] || (k[15] = ee(" 后重试。 ", -1))])) : (p(), h("p", Bp, " 暂无归档记录 —— 完成检测评定后，结果将自动归档至此。 "))], 64)) : (p(), h(ue, {
                key: 3
            }, [l("table", null, [k[16] || (k[16] = l("thead", null, [l("tr", null, [l("th", null, "影像编号"), l("th", null, "工件编号"), l("th", null, "底片印字"), l("th", null, "密级"), l("th", null, "评定级别"), l("th", null, "可评片"), l("th", null, "待复核"), l("th", null, "归档时间"), l("th", null, "操作")])], -1)), l("tbody", null, [(p(!0), h(ue, null, Oe(a.value.items, $ => (p(), h("tr", {
                key: $.image_id
            }, [l("td", null, v($.image_id), 1), l("td", null, v($.workpiece_no ?? "—"), 1), l("td", null, [ye(tn)($) ? (p(), h("span", {
                key: 0,
                class: we(["stamp", `stamp-${ye(tn)($).cls}`]),
                title: ye(tn)($).title
            }, v(ye(tn)($).label), 11, jp)) : (p(), h("span", Hp, "—"))]), l("td", null, [l("span", {
                class: we(["lv", {
                    secret: ($.secret_level ?? 0) >= 2
                }])
            }, v(t[$.secret_level ?? 0] ?? "非密"), 3)]), l("td", null, [$.joint_level ? (p(), h("span", Kp, v($.joint_level), 1)) : (p(), h("span", Gp, "—"))]), l("td", null, v($.evaluable ? "是" : "否"), 1), l("td", null, [$.need_review ? (p(), h("span", Wp, "待复核")) : (p(), h("span", qp, "—"))]), l("td", null, v($.created_at ?? "—"), 1), l("td", zp, [l("button", {
                type: "button",
                class: "btn link",
                title: "在「底片观察」中载入该影像",
                onClick: j => M($.image_id)
            }, " 查看影像 ", 8, Jp), $.report_id ? (p(), h("button", {
                key: 0,
                type: "button",
                class: "btn link",
                title: "打开该底片的 PDF/A 检测报告（经受控导出通道）",
                onClick: j => L($.report_id)
            }, " 查看报告 ", 8, Xp)) : V("", !0)])]))), 128))])]), l("p", Yp, [k[17] || (k[17] = ee(" 共 ", -1)), l("b", null, v(E.value), 1), ee(" 条记录 · 级别分布：" + v(Object.entries(a.value.stats.by_level).map(([$, j]) => `${$}:${j}`).join(" ") || "—"), 1)]), E.value > P.value ? (p(), h("div", Qp, [l("button", {
                class: "btn ghost",
                type: "button",
                disabled: _.value <= 1,
                onClick: k[6] || (k[6] = $ => te(_.value - 1))
            }, " ← 上一页 ", 8, Zp), l("span", eh, "第 " + v(_.value) + " / " + v(Math.max(1, Math.ceil(E.value / P.value))) + " 页", 1), l("button", {
                class: "btn ghost",
                type: "button",
                disabled: _.value >= Math.ceil(E.value / P.value),
                onClick: k[7] || (k[7] = $ => te(_.value + 1))
            }, " 下一页 → ", 8, th), he(l("select", {
                "onUpdate:modelValue": k[8] || (k[8] = $ => P.value = $),
                class: "ps",
                onChange: x
            }, [...k[18] || (k[18] = [l("option", {
                value: 50
            }, " 50/页 ", -1), l("option", {
                value: 100
            }, " 100/页 ", -1)])], 544), [
                [pt, P.value, void 0, {
                    number: !0
                }]
            ])])) : V("", !0)], 64)), Re(So, {
                ctrl: ye(s)
            }, null, 8, ["ctrl"])]))
        }
    }),
    sh = We(nh, [
        ["__scopeId", "data-v-cba4d5cc"]
    ]),
    Ao = ["dcm", "dicom", "ima", "png", "jpg", "jpeg", "jfif", "bmp", "gif", "webp", "tif", "tiff", "avif", "heic", "heif", "pgm", "ppm", "pnm", "ico"],
    Ro = Ao.map(e => `.${e}`).join(","),
    lh = ["png", "jpg", "jpeg", "jfif", "bmp", "gif", "webp", "avif", "ico"];

function Ur(e) {
    var n;
    const t = ((n = e.split(".").pop()) == null ? void 0 : n.toLowerCase()) ?? "";
    return lh.includes(t)
}
const oh = 120;
let ih = 1;
const To = il("viewerFilms", () => {
        const e = w([]),
            t = w(-1),
            n = w({}),
            s = w({}),
            o = me(() => e.value.length);

        function i(N, M) {
            return e.value.find(L => L.name === N && L.size === M)
        }

        function a(N) {
            for (const M of N) {
                const L = i(M.name, M.size);
                if (L) {
                    t.value = L.id;
                    continue
                }
                const K = {
                    id: ih++,
                    name: M.name,
                    url: URL.createObjectURL(M),
                    size: M.size,
                    decodable: Ur(M.name),
                    addedAt: Date.now()
                };
                e.value.unshift(K), t.value = K.id
            }
            r()
        }

        function r() {
            for (; e.value.length > oh;) {
                const N = e.value.pop();
                N && (URL.revokeObjectURL(N.url), d(N.id), _(N.id))
            }
        }

        function u(N, M) {
            n.value = {
                ...n.value,
                [N]: M
            }
        }

        function c(N) {
            return N == null ? null : n.value[N] ?? null
        }

        function d(N) {
            if (N in n.value) {
                const M = {
                    ...n.value
                };
                delete M[N], n.value = M
            }
        }

        function f(N, M) {
            s.value = {
                ...s.value,
                [N]: M
            }
        }

        function m(N) {
            return N == null ? null : s.value[N] ?? null
        }

        function _(N) {
            if (N in s.value) {
                const M = {
                    ...s.value
                };
                delete M[N], s.value = M
            }
        }

        function P(N) {
            const M = e.value.findIndex(K => K.id === N);
            if (M === -1) return;
            const [L] = e.value.splice(M, 1);
            URL.revokeObjectURL(L.url), d(N), _(N), t.value === N && (t.value = -1)
        }

        function E() {
            for (const N of e.value) URL.revokeObjectURL(N.url);
            e.value = [], n.value = {}, s.value = {}, t.value = -1
        }
        return {
            films: e,
            lastAddedId: t,
            count: o,
            annotations: n,
            stamps: s,
            add: a,
            setAnnotations: u,
            annotationsOf: c,
            setStamp: f,
            stampOf: m,
            remove: P,
            clear: E
        }
    }),
    Io = il("workspace", () => {
        const e = w(Nn());

        function t(o) {
            Lf(o), e.value = Nn()
        }
        const n = w(null);

        function s(o) {
            n.value = o
        }
        return {
            operator: e,
            setOperator: t,
            pendingFileOpen: n,
            requestFileOpen: s
        }
    }),
    Bt = w(null),
    ah = {
        class: "bp"
    },
    rh = {
        class: "bp-head"
    },
    uh = {
        class: "bp-bar"
    },
    ch = {
        class: "bp-meta"
    },
    dh = {
        class: "bp-pct"
    },
    fh = {
        class: "bp-counts"
    },
    vh = {
        key: 0,
        class: "bp-fail"
    },
    ph = {
        key: 1
    },
    hh = {
        key: 0,
        class: "bp-est"
    },
    mh = {
        key: 1,
        class: "bp-paused"
    },
    gh = {
        key: 2,
        class: "bp-fin"
    },
    yh = {
        class: "bp-tasks"
    },
    bh = ["title"],
    _h = {
        key: 0,
        class: "bp-level"
    },
    wh = {
        key: 1,
        class: "bp-rev"
    },
    kh = {
        key: 2,
        class: "bp-defect",
        title: "该底片检出缺陷，已在「底片观察」中叠加标注框"
    },
    $h = ["title"],
    Ch = ["title"],
    Eh = ["title"],
    xh = ["onClick"],
    Sh = {
        key: 0,
        class: "bp-stamp-summary"
    },
    Ah = {
        class: "bp-ops"
    },
    Rh = Fe({
        __name: "BatchProgress",
        props: {
            status: {}
        },
        emits: ["cancel", "retry", "archive", "pause", "resume", "openReport"],
        setup(e, {
            emit: t
        }) {
            const n = t,
                s = {
                    pending: "排队中",
                    running: "评定中",
                    done: "已完成",
                    failed: "已失败",
                    cancelled: "已取消"
                };

            function o(c) {
                return c ? c.includes("interrupted by restart") ? "因程序重启中断，可整批重试" : c : ""
            }
            const i = {
                    pending: "badge-muted",
                    running: "badge-run",
                    done: "badge-ok",
                    failed: "badge-err",
                    cancelled: "badge-muted"
                },
                a = {
                    running: "评定中",
                    paused: "已暂停",
                    awaiting_review: "待重复性核查",
                    finished: "已完结"
                };

            function r(c) {
                return c.status === "done" ? tn(c) : null
            }

            function u(c) {
                const d = c.stamp_summary;
                if (!d) return "";
                const f = `底片印字：${d.present}/${d.evaluated} 张识别到日期/编号印字（${Math.round(d.ratio*100)}%）`;
                return d.suppressed ? `${f} —— 该批普遍无印字，缺印字已按规则豁免人工复核` : `${f} —— 缺印字底片已转人工复核 ${d.flagged} 张`
            }
            return (c, d) => (p(), h("div", ah, [l("div", rh, [l("div", uh, [l("div", {
                class: "bp-fill",
                style: Ln({
                    width: `${Math.round(e.status.progress*100)}%`
                })
            }, null, 4)]), l("div", ch, [l("span", dh, v(Math.round(e.status.progress * 100)) + "%", 1), l("span", fh, [ee(" 已完成 " + v(e.status.done) + " / " + v(e.status.total) + " ", 1), e.status.failed ? (p(), h("em", vh, "失败 " + v(e.status.failed), 1)) : V("", !0), e.status.cancelled ? (p(), h("em", ph, "取消 " + v(e.status.cancelled), 1)) : V("", !0)]), e.status.status === "running" ? (p(), h("span", hh, " 预计剩余 ≈ " + v(e.status.estimated_sec) + " 秒 ", 1)) : e.status.status === "paused" ? (p(), h("span", mh, "已暂停 · 点击「继续评定」恢复")) : (p(), h("span", gh, v(a[e.status.status] ?? "已完结"), 1))])]), l("div", yh, [(p(!0), h(ue, null, Oe(e.status.tasks, f => (p(), h("div", {
                key: f.task_id,
                class: "bp-task"
            }, [l("span", {
                class: "bp-name",
                title: f.error ?? void 0
            }, v(f.image_name), 9, bh), f.joint_level ? (p(), h("span", _h, "评定级别 " + v(f.joint_level), 1)) : f.need_review ? (p(), h("span", wh, "待人工复核")) : V("", !0), f.status === "done" && (f.defect_count ?? 0) > 0 ? (p(), h("span", kh, "缺陷 " + v(f.defect_count) + " 处", 1)) : V("", !0), f.dup_kind ? (p(), h("span", {
                key: 3,
                class: "bp-dup",
                title: f.dup_kind === "history" ? `与历史影像 ${f.dup_ref??""} 内容指纹重复` : `与批内 ${f.dup_ref??""} 内容指纹重复`
            }, "重复", 8, $h)) : V("", !0), r(f) ? (p(), h("span", {
                key: 4,
                class: we(["bp-stamp", `stamp-${r(f).cls}`]),
                title: r(f).title
            }, v(r(f).label), 11, Ch)) : V("", !0), l("span", {
                class: we(["badge", i[f.status] ?? "badge-muted"])
            }, v(s[f.status] ?? f.status), 3), f.error ? (p(), h("span", {
                key: 5,
                class: "bp-err",
                title: o(f.error)
            }, "⚠ " + v(o(f.error)), 9, Eh)) : V("", !0), f.status === "done" && f.report_id ? (p(), h("button", {
                key: 6,
                type: "button",
                class: "bp-report",
                title: "打开该底片的 PDF/A 检测报告（含缺陷标注与检出明细）",
                onClick: m => n("openReport", f.report_id)
            }, " 报告 ", 8, xh)) : V("", !0)]))), 128))]), e.status.stamp_summary ? (p(), h("p", Sh, v(u(e.status)), 1)) : V("", !0), l("div", Ah, [e.status.status === "running" ? (p(), h("button", {
                key: 0,
                type: "button",
                class: "btn ghost",
                title: "未启动的底片暂停派发，正在评定的底片会正常完成；可随时恢复",
                onClick: d[0] || (d[0] = f => n("pause"))
            }, " 暂停评定 ")) : V("", !0), e.status.status === "paused" ? (p(), h("button", {
                key: 1,
                type: "button",
                class: "btn",
                title: "把暂停时未启动的底片重新投入评定",
                onClick: d[1] || (d[1] = f => n("resume"))
            }, " 继续评定 → ")) : V("", !0), e.status.status === "running" || e.status.status === "paused" ? (p(), h("button", {
                key: 2,
                type: "button",
                class: "btn ghost",
                onClick: d[2] || (d[2] = f => n("cancel"))
            }, " 取消批次 ")) : V("", !0), e.status.status === "finished" && e.status.failed > 0 ? (p(), h("button", {
                key: 3,
                type: "button",
                class: "btn",
                onClick: d[3] || (d[3] = f => n("retry"))
            }, " 重试失败任务（" + v(e.status.failed) + " 项）→ ", 1)) : V("", !0), l("button", {
                type: "button",
                class: "btn ghost",
                onClick: d[4] || (d[4] = f => n("archive"))
            }, " 查阅检测档案 ")])]))
        }
    }),
    Th = We(Rh, [
        ["__scopeId", "data-v-5bc7a45f"]
    ]),
    Ih = ["aria-label"],
    Oh = {
        class: "cd-title"
    },
    Ph = {
        class: "cd-msg"
    },
    Mh = {
        class: "cd-foot"
    },
    Nh = Fe({
        __name: "ConfirmDialog",
        props: {
            open: {
                type: Boolean
            },
            title: {},
            message: {},
            confirmText: {},
            danger: {
                type: Boolean
            }
        },
        emits: ["confirm", "cancel"],
        setup(e, {
            emit: t
        }) {
            const n = e,
                s = t,
                o = w(null),
                i = w(null);

            function a(r) {
                if (n.open) {
                    if (r.key === "Escape") {
                        r.stopPropagation(), s("cancel");
                        return
                    }
                    if (r.key === "Tab" && o.value) {
                        const u = o.value.querySelectorAll("button");
                        if (u.length === 0) return;
                        const c = u[0],
                            d = u[u.length - 1];
                        r.shiftKey && document.activeElement === c ? (r.preventDefault(), d.focus()) : !r.shiftKey && document.activeElement === d && (r.preventDefault(), c.focus())
                    }
                }
            }
            return et(() => n.open, r => {
                r ? (window.addEventListener("keydown", a, !0), Gt(() => {
                    var u;
                    return (u = i.value) == null ? void 0 : u.focus()
                })) : window.removeEventListener("keydown", a, !0)
            }), _n(() => window.removeEventListener("keydown", a, !0)), (r, u) => (p(), Wt(Vu, {
                to: "body"
            }, [e.open ? (p(), h("div", {
                key: 0,
                class: "cd-mask",
                onClick: u[2] || (u[2] = Je(c => s("cancel"), ["self"]))
            }, [l("div", {
                ref_key: "panel",
                ref: o,
                class: "cd-panel",
                role: "alertdialog",
                "aria-modal": "true",
                "aria-label": e.title
            }, [l("p", Oh, v(e.title), 1), l("p", Ph, v(e.message), 1), l("div", Mh, [l("button", {
                ref_key: "cancelBtn",
                ref: i,
                type: "button",
                class: "cd-btn",
                onClick: u[0] || (u[0] = c => s("cancel"))
            }, " 取消 ", 512), l("button", {
                type: "button",
                class: we(["cd-btn", {
                    danger: e.danger
                }]),
                onClick: u[1] || (u[1] = c => s("confirm"))
            }, v(e.confirmText ?? "确认"), 3)])], 8, Ih)])) : V("", !0)]))
        }
    }),
    Vn = We(Nh, [
        ["__scopeId", "data-v-49a17557"]
    ]),
    Dh = {
        key: 0
    },
    Lh = {
        class: "row"
    },
    Uh = {
        class: "grow"
    },
    Vh = ["onKeydown"],
    Fh = ["accept"],
    Bh = {
        key: 0,
        class: "preview show"
    },
    jh = {
        class: "meta"
    },
    Hh = {
        class: "meta faint"
    },
    Kh = {
        key: 0
    },
    Gh = {
        key: 1,
        class: "err show"
    },
    Wh = {
        key: 2,
        class: "up-progress",
        role: "status"
    },
    qh = {
        class: "up-bar"
    },
    zh = {
        class: "up-pct"
    },
    Jh = {
        class: "grow"
    },
    Xh = {
        class: "field"
    },
    Yh = {
        class: "field"
    },
    Qh = {
        class: "field"
    },
    Zh = {
        class: "field"
    },
    em = {
        class: "check"
    },
    tm = ["disabled"],
    nm = {
        key: 1
    },
    sm = {
        class: "sec-label"
    },
    lm = {
        class: "dedup-box"
    },
    om = {
        class: "dd-head"
    },
    im = {
        class: "dd-list"
    },
    am = {
        class: "dd-info"
    },
    rm = {
        class: "dd-name"
    },
    um = {
        class: "dd-meta"
    },
    cm = {
        class: "dd-actions"
    },
    dm = ["onClick"],
    fm = ["onClick"],
    vm = {
        class: "dd-foot"
    },
    pm = ["disabled"],
    hm = {
        key: 0,
        class: "err show"
    },
    mm = {
        key: 2
    },
    gm = {
        key: 0,
        class: "err show"
    },
    ym = {
        key: 1,
        class: "err show"
    },
    bm = {
        key: 2,
        class: "err show"
    },
    _m = ["data-t"],
    wm = {
        key: 0,
        class: "sec-state hold"
    },
    km = {
        key: 1,
        class: "sec-state run"
    },
    $m = {
        key: 2,
        class: "sec-state fin"
    },
    Cm = {
        key: 4,
        class: "row",
        style: {
            "margin-top": "14px"
        }
    },
    Em = {
        key: 3,
        class: "hist"
    },
    xm = {
        key: 0,
        class: "hint",
        role: "alert"
    },
    Sm = {
        class: "hist-list"
    },
    Am = ["onClick"],
    Rm = {
        class: "h-id"
    },
    Tm = {
        class: "h-time"
    },
    Im = {
        class: "h-prog"
    },
    Om = {
        class: "h-counts"
    },
    Pm = {
        key: 0,
        class: "h-fail"
    },
    Rl = 100,
    Mm = 50 * 1024 * 1024,
    Nm = 2e3,
    Dm = 3,
    Lm = Fe({
        __name: "BatchView",
        emits: ["archive"],
        setup(e, {
            emit: t
        }) {
            const n = t,
                s = To(),
                o = w("upload"),
                i = w(null),
                a = w([]),
                r = w(null),
                u = w(null),
                c = w(!1),
                d = w(-1),
                f = w(null),
                m = w([]),
                _ = xo();

            function P(Q) {
                _.openPdf(Q)
            }
            const E = w([]),
                N = w({}),
                M = w(!1),
                L = me(() => E.value.filter(Q => (N.value[Q.task_id] ?? "skip") === "skip").length),
                K = me(() => E.value.length - L.value);

            function I(Q) {
                E.value = Q;
                const O = {};
                for (const G of Q) O[G.task_id] = "skip";
                N.value = O, o.value = "dedup"
            }

            function A(Q, O) {
                N.value = {
                    ...N.value,
                    [Q]: O
                }
            }

            function C(Q) {
                const O = {};
                for (const G of E.value) O[G.task_id] = Q;
                N.value = O
            }
            const T = w("0.1000"),
                x = w(""),
                W = w(""),
                te = w(""),
                de = w(!0);
            let B = null,
                k = null;
            const $ = w(0),
                j = w(!1),
                le = w(null);

            function H() {
                return Math.min(Nm * 2 ** $.value, 8e3)
            }
            const ne = w(null);
            async function Ne() {
                try {
                    m.value = await Hi(), ne.value = null
                } catch (Q) {
                    if (Q instanceof Ye && Q.status === 401) return;
                    ne.value = `历史批次刷新失败：${Ae(Q)}`
                }
            }

            function se(Q) {
                F(), r.value = Q.batch_id, Q.status === "finished" ? ve(Q.batch_id) : (o.value = "running", R(Q.batch_id))
            }
            let b = 0;
            async function ve(Q) {
                const O = ++b;
                try {
                    const G = await ji(Q);
                    if (O !== b) return;
                    i.value = G, o.value = "result", f.value = null, re(G)
                } catch (G) {
                    if (O !== b || G instanceof Ye && G.status === 401) return;
                    f.value = `批次状态获取失败：${Ae(G)}`
                }
            }

            function De(Q) {
                const O = Q.target;
                pe(O.files), O.value = ""
            }

            function pe(Q) {
                var Se;
                if (!Q || Q.length === 0) return;
                const O = [],
                    G = [];
                for (const $e of Array.from(Q)) {
                    const lt = ((Se = $e.name.split(".").pop()) == null ? void 0 : Se.toLowerCase()) ?? "";
                    if (Ao.includes(lt)) {
                        if ($e.size > Mm) {
                            G.push(`${$e.name}（${($e.size/1024/1024).toFixed(1)}MB）`);
                            continue
                        }
                        O.push($e)
                    }
                }
                if (G.length > 0 && (u.value = `以下 ${G.length} 个文件超过单文件 50MB 上限，已未导入：${G.slice(0,5).join("、")}` + (G.length > 5 ? " 等。" : "。请压缩或降分辨率后重新导入。")), O.length === 0) {
                    G.length === 0 && (u.value = "所选文件/文件夹中未包含受支持的影像格式（DICOM .dcm / JPG / PNG / BMP / GIF / WebP / TIFF / HEIC 等）。");
                    return
                }
                if (O.length > Rl) {
                    u.value = `单批上限 ${Rl} 幅，当前已选 ${O.length} 幅，请分批提交。`;
                    return
                }
                a.value = O, G.length === 0 && (u.value = null), s.add(O)
            }
            const qe = () => {
                const Q = a.value.length;
                if (Q === 0) return "";
                const O = a.value.reduce((G, Se) => G + Se.size, 0) / 1024 / 1024;
                return `${Q} 幅 · ${O.toFixed(1)} MB`
            };

            function Ge() {
                var Q;
                (Q = document.getElementById("pick-files")) == null || Q.click()
            }

            function z() {
                var Q;
                (Q = document.getElementById("pick-dir")) == null || Q.click()
            }
            const ce = Io();
            et(() => ce.pendingFileOpen, Q => {
                Q === "batch" && (ce.pendingFileOpen = null, Gt(Ge))
            }, {
                immediate: !0
            });

            function ae() {
                if (u.value = null, a.value.length === 0) {
                    u.value = "请先导入底片文件或文件夹。";
                    return
                }
                if (!x.value.trim()) {
                    u.value = "母材公称厚度 T 为必填项（分级评定依据）。";
                    return
                }
                const Q = new FormData;
                for (const O of a.value) Q.append("images", O);
                Q.append("pixel_spacing_mm", T.value || ""), Q.append("base_metal_thickness_mm", x.value.trim()), W.value.trim() && Q.append("workpiece_no", W.value.trim()), te.value.trim() && Q.append("weld_no", te.value.trim()), Q.append("force", de.value ? "true" : "false"), J(Q)
            }
            async function J(Q) {
                if (!c.value) {
                    c.value = !0, d.value = 0;
                    try {
                        const O = await Qf(Q, G => {
                            d.value = G
                        });
                        r.value = O.batch_id, O.status === "awaiting_review" ? (i.value = null, I(O.duplicates ?? []), Ne()) : (o.value = "running", R(O.batch_id))
                    } catch (O) {
                        if (O instanceof Ye && O.code === "ABORTED") return;
                        u.value = Ae(O)
                    } finally {
                        c.value = !1, d.value = -1
                    }
                }
            }
            async function D() {
                if (!(!r.value || M.value)) {
                    M.value = !0;
                    try {
                        await sv(r.value, E.value.map(Q => ({
                            task_id: Q.task_id,
                            action: N.value[Q.task_id] ?? "skip"
                        }))), E.value = [], N.value = {}, i.value = null, o.value = "running", R(r.value)
                    } catch (Q) {
                        u.value = Ae(Q)
                    } finally {
                        M.value = !1
                    }
                }
            }

            function y() {
                B !== null && (window.clearTimeout(B), B = null)
            }

            function g(Q) {
                y(), B = window.setTimeout(() => void Z(Q), H())
            }

            function R(Q) {
                F(), j.value = !1, $.value = 0, le.value = null, b++, k = Q, Bt.value = "batch", Z(Q)
            }

            function F() {
                k = null, y(), Bt.value === "batch" && (Bt.value = null)
            }

            function Y(Q) {
                return (Q.tasks ?? []).filter(O => O.dup_kind).map(O => ({
                    task_id: O.task_id,
                    image_name: O.image_name,
                    content_sha256: O.content_sha256 ?? null,
                    kind: O.dup_kind ?? "batch",
                    duplicate_of: O.dup_ref ?? null,
                    history: null
                }))
            }
            const q = new Set;
            async function re(Q) {
                for (const O of Q.tasks ?? []) O.status !== "done" || !O.report_id || q.has(O.report_id) || (q.add(O.report_id), !(O.defect_count != null && O.defect_count <= 0 && !O.need_review) && oe(O.report_id, O.image_name))
            }

            function ie(Q) {
                for (const O of Q.tasks ?? []) {
                    if (O.status !== "done" || !O.stamp_status) continue;
                    const G = s.films.find(Se => Se.name === O.image_name);
                    !G || s.stampOf(G.id) || s.setStamp(G.id, {
                        status: O.stamp_status,
                        text: O.stamp_text ?? null,
                        orientation: O.stamp_orientation ?? null,
                        needReview: O.stamp_need_review === !0
                    })
                }
            }
            async function oe(Q, O) {
                try {
                    const G = await Eo(Q);
                    if (G.defects.length === 0) return;
                    const Se = s.films.find($e => $e.name === O);
                    if (!Se) return;
                    s.setAnnotations(Se.id, {
                        imageW: G.image_w,
                        imageH: G.image_h,
                        reportId: Q,
                        boxes: G.defects.map($e => ({
                            id: $e.id,
                            classId: $e.class_id,
                            bbox: $e.bbox,
                            confidence: $e.confidence,
                            needReview: $e.need_review
                        }))
                    })
                } catch {}
            }
            async function Z(Q) {
                try {
                    const O = await ji(Q);
                    if (k !== Q) return;
                    if (i.value = O, $.value = 0, j.value = !1, le.value = null, re(O), ie(O), O.status === "awaiting_review") {
                        F(), I(O.duplicates ?? Y(O));
                        return
                    }
                    if (O.status === "finished") {
                        F(), o.value = "result", Ne();
                        return
                    }
                } catch (O) {
                    if (k !== Q) return;
                    if (O instanceof Ye && (O.status === 401 || O.status === 403)) {
                        F();
                        return
                    }
                    if ($.value += 1, le.value = Ae(O), $.value >= Dm) {
                        j.value = !0, F();
                        return
                    }
                }
                k === Q && g(Q)
            }

            function U() {
                le.value = null, r.value && R(r.value)
            }
            const S = w(!1);

            function X() {
                r.value && (S.value = !0)
            }
            async function fe() {
                if (r.value) try {
                    await ev(r.value), u.value = null
                } catch (Q) {
                    if (Q instanceof Ye && Q.status === 401) return;
                    u.value = `暂停失败：${Ae(Q)}`
                }
            }
            async function ge() {
                if (r.value) try {
                    await tv(r.value), u.value = null
                } catch (Q) {
                    if (Q instanceof Ye && Q.status === 401) return;
                    u.value = `恢复失败：${Ae(Q)}`
                }
            }
            async function ke() {
                if (S.value = !1, !!r.value) {
                    try {
                        await Zf(r.value)
                    } catch (Q) {
                        if (Q instanceof Ye && Q.status === 401) return;
                        u.value = `取消请求失败（批次可能仍在执行）：${Ae(Q)}`
                    }
                    o.value === "dedup" && (E.value = [], ve(r.value))
                }
            }
            async function _e() {
                if (r.value) try {
                    await nv(r.value), o.value = "running", R(r.value)
                } catch (Q) {
                    if (Q instanceof Ye && Q.status === 401) return;
                    u.value = `重试失败：${Ae(Q)}`
                }
            }

            function Te() {
                F(), b++, o.value = "upload", i.value = null, r.value = null, a.value = [], u.value = null, f.value = null, E.value = [], N.value = {}, Ne()
            }
            async function Pe() {
                try {
                    const Q = await Hi(),
                        O = Q.find(G => G.status === "running") ?? Q.find(G => G.status === "awaiting_review") ?? Q.find(G => G.status === "paused");
                    O && !r.value && se(O)
                } catch {}
            }
            dt(() => {
                Ne(), Pe()
            }), wn(() => {
                F()
            });
            const Ie = w(!1);

            function Ke(Q) {
                var G;
                Ie.value = !1;
                const O = (G = Q.dataTransfer) == null ? void 0 : G.files;
                O && O.length > 0 && pe(O)
            }
            return (Q, O) => (p(), h(ue, null, [l("div", null, [O[34] || (O[34] = l("h1", {
                class: "title-zine",
                "data-t": "批量评定"
            }, " 批量评定 ", -1)), O[35] || (O[35] = l("div", {
                class: "lede"
            }, " 多幅底片/整卷文件夹批量评定，支持异步队列调度、实时进度监视与历史批次管理 ", -1)), o.value === "upload" ? (p(), h("div", Dh, [l("div", {
                class: "guide"
            }, [l("div", {
                class: "g"
            }, [O[17] || (O[17] = l("div", {
                class: "n"
            }, " 一 · 底片导入 ", -1)), l("div", {
                class: "t"
            }, " 支持多选文件或整卷文件夹导入（DICOM 及常见图像格式），单批上限 " + v(Rl) + " 幅。 ")]), O[18] || (O[18] = bn('<div class="g" data-v-27ed3aca><div class="n" data-v-27ed3aca> 二 · 公共工艺参数 </div><div class="t" data-v-27ed3aca> 母材公称厚度 T 为必填项，统一应用于批内全部底片；像质不合格底片默认强制出片并标记「待人工复核」。 </div></div><div class="g" data-v-27ed3aca><div class="n" data-v-27ed3aca> 三 · 异步批量执行 </div><div class="t" data-v-27ed3aca> 提交后即返回批次编号，多推理进程并行调度，界面实时刷新进度。 </div></div>', 2))]), l("div", Lh, [l("div", Uh, [O[21] || (O[21] = bn('<div class="chips" data-v-27ed3aca><span class="chip on" data-v-27ed3aca>DICOM .dcm</span><span class="chip on" data-v-27ed3aca>JPG/PNG/BMP</span><span class="chip on" data-v-27ed3aca>TIFF/GIF/WebP</span><span class="chip on" data-v-27ed3aca>HEIC/AVIF</span></div><div class="hint" data-v-27ed3aca> 文件夹导入将递归收集子目录中的影像；非影像文件自动跳过。 </div>', 2)), l("div", {
                class: we(["drop", {
                    over: Ie.value
                }]),
                role: "button",
                tabindex: "0",
                "aria-label": "点击或拖入底片文件",
                onClick: Ge,
                onKeydown: [Tt(Je(Ge, ["prevent"]), ["enter"]), Tt(Je(Ge, ["prevent"]), ["space"])],
                onDragover: O[0] || (O[0] = Je(G => Ie.value = !0, ["prevent"])),
                onDragleave: O[1] || (O[1] = G => Ie.value = !1),
                onDrop: Je(Ke, ["prevent"])
            }, [...O[19] || (O[19] = [l("div", {
                class: "big"
            }, " 点击选择、拖入底片文件 ", -1), l("div", {
                class: "hint"
            }, " 支持 Ctrl/Shift 多选；影像全程本机处理，不经外部网络传输 ", -1)])], 42, Vh), l("input", {
                id: "pick-files",
                type: "file",
                accept: ye(Ro),
                multiple: "",
                style: {
                    display: "none"
                },
                onChange: O[2] || (O[2] = G => De(G))
            }, null, 40, Fh), l("button", {
                type: "button",
                class: "btn ghost",
                onClick: z
            }, " 或导入整个文件夹… "), l("input", {
                id: "pick-dir",
                type: "file",
                webkitdirectory: "",
                multiple: "",
                style: {
                    display: "none"
                },
                onChange: O[3] || (O[3] = G => De(G))
            }, null, 32), a.value.length ? (p(), h("div", Bh, [l("div", jh, v(qe()), 1), l("div", Hh, [ee(v(a.value.slice(0, 8).map(G => G.name).join("、")), 1), a.value.length > 8 ? (p(), h("span", Kh, "…")) : V("", !0)])])) : V("", !0), u.value ? (p(), h("div", Gh, " ⚠ " + v(u.value), 1)) : V("", !0), c.value && d.value >= 0 ? (p(), h("div", Wh, [l("div", qh, [l("div", {
                class: "up-fill",
                style: Ln({
                    width: `${d.value}%`
                })
            }, null, 4)]), l("span", zh, "上传中 " + v(d.value) + "%", 1), O[20] || (O[20] = l("span", {
                class: "up-hint"
            }, "上传完成后即开始评定，可保持本页等待", -1))])) : V("", !0)]), l("div", Jh, [l("div", Xh, [O[22] || (O[22] = l("label", {
                for: "spacing"
            }, "空间像素标定（mm/px）", -1)), he(l("input", {
                id: "spacing",
                "onUpdate:modelValue": O[4] || (O[4] = G => T.value = G)
            }, null, 512), [
                [Ee, T.value]
            ]), O[23] || (O[23] = l("div", {
                class: "why"
            }, " 默认 0.1000 mm/px；用于将像素尺寸换算为缺陷实际当量。 ", -1))]), l("div", Yh, [O[24] || (O[24] = l("label", {
                for: "thick"
            }, [ee("母材公称厚度 T（mm）"), l("span", {
                class: "req"
            }, "*")], -1)), he(l("input", {
                id: "thick",
                "onUpdate:modelValue": O[5] || (O[5] = G => x.value = G),
                placeholder: "如 20"
            }, null, 512), [
                [Ee, x.value]
            ]), O[25] || (O[25] = l("div", {
                class: "why"
            }, " 分级评定必备（NB/T 47013.2 依 T 划定评定区与各级限值），统一应用于批内全部底片。 ", -1))]), l("div", Qh, [O[26] || (O[26] = l("label", {
                for: "wp"
            }, "工件编号（选填）", -1)), he(l("input", {
                id: "wp",
                "onUpdate:modelValue": O[6] || (O[6] = G => W.value = G),
                placeholder: "如 WP-7781"
            }, null, 512), [
                [Ee, W.value]
            ])]), l("div", Zh, [O[27] || (O[27] = l("label", {
                for: "wn"
            }, "焊缝编号（选填）", -1)), he(l("input", {
                id: "wn",
                "onUpdate:modelValue": O[7] || (O[7] = G => te.value = G),
                placeholder: "如 W-12"
            }, null, 512), [
                [Ee, te.value]
            ])]), l("label", em, [he(l("input", {
                "onUpdate:modelValue": O[8] || (O[8] = G => de.value = G),
                type: "checkbox"
            }, null, 512), [
                [kn, de.value]
            ]), O[28] || (O[28] = ee(" 强制出片（像质不合格底片标记「待人工复核」并继续处理，不阻断整批流程） ", -1))]), l("button", {
                class: "btn",
                type: "button",
                disabled: a.value.length === 0 || c.value,
                onClick: ae
            }, v(c.value ? "提交中…" : "提交批量评定 →"), 9, tm)])])])) : o.value === "dedup" ? (p(), h("div", nm, [l("div", sm, [ee(" 批次 " + v(r.value ? r.value.slice(0, 8) : "") + " ", 1), O[29] || (O[29] = l("span", {
                class: "sec-state hold"
            }, "待重复性核查", -1))]), l("div", lm, [l("div", om, [O[30] || (O[30] = ee(" 检出 ", -1)), l("b", null, v(E.value.length), 1), O[31] || (O[31] = ee(" 幅重复底片（与批内其他影像或历史已检影像内容指纹完全一致）。 请逐项确认处置方式；非重复影像不受影响，确认后立即开始评定。 ", -1))]), l("div", im, [(p(!0), h(ue, null, Oe(E.value, G => (p(), h("div", {
                key: G.task_id,
                class: "dd-row"
            }, [l("div", am, [l("div", rm, v(G.image_name), 1), l("div", um, [l("span", {
                class: we(["dd-kind", G.kind])
            }, v(G.kind === "history" ? "与历史已检影像重复" : "批内重复"), 3), G.kind === "batch" ? (p(), h(ue, {
                key: 0
            }, [ee(" 与本批「" + v(G.duplicate_of) + "」内容一致 ", 1)], 64)) : G.history ? (p(), h(ue, {
                key: 1
            }, [ee(" 首检 " + v(G.history.image_id.slice(0, 8)) + " ", 1), G.history.created_at ? (p(), h(ue, {
                key: 0
            }, [ee(" · " + v(G.history.created_at), 1)], 64)) : V("", !0), G.history.joint_level ? (p(), h(ue, {
                key: 1
            }, [ee(" · 级别 " + v(G.history.joint_level), 1)], 64)) : V("", !0)], 64)) : V("", !0)])]), l("div", cm, [l("button", {
                type: "button",
                class: we(["dd-btn", {
                    on: (N.value[G.task_id] ?? "skip") === "skip"
                }]),
                onClick: Se => A(G.task_id, "skip")
            }, " 跳过（推荐） ", 10, dm), l("button", {
                type: "button",
                class: we(["dd-btn", {
                    on: (N.value[G.task_id] ?? "skip") === "keep"
                }]),
                onClick: Se => A(G.task_id, "keep")
            }, " 强制评定 ", 10, fm)])]))), 128))]), l("div", vm, [l("button", {
                type: "button",
                class: "btn ghost",
                onClick: O[9] || (O[9] = G => C("skip"))
            }, " 全部跳过 "), l("button", {
                type: "button",
                class: "btn ghost",
                onClick: O[10] || (O[10] = G => C("keep"))
            }, " 全部强制评定 "), O[32] || (O[32] = l("span", {
                class: "dd-hint"
            }, "跳过的底片不重复评定、不出具报告；强制评定的底片正常评片并归档。", -1)), l("button", {
                type: "button",
                class: "btn",
                disabled: M.value,
                style: {
                    "margin-left": "auto"
                },
                onClick: D
            }, v(M.value ? "提交中…" : `确认并继续（跳过 ${L.value} · 强制评定 ${K.value}）→`), 9, pm), l("button", {
                type: "button",
                class: "btn ghost dd-danger",
                onClick: X
            }, " 取消整批 ")]), u.value ? (p(), h("div", hm, " ⚠ " + v(u.value), 1)) : V("", !0)])])) : (p(), h("div", mm, [j.value ? (p(), h("div", gm, [ee(" ⚠ " + v(le.value ? `进度获取失败（${le.value}），` : "") + "推理服务可能无响应，已暂停进度轮询。", 1), l("button", {
                class: "btn link",
                type: "button",
                onClick: U
            }, " 重试连接 ")])) : V("", !0), u.value ? (p(), h("div", ym, [ee(" ⚠ " + v(u.value) + " ", 1), l("button", {
                class: "btn link",
                type: "button",
                onClick: O[11] || (O[11] = G => u.value = null)
            }, " 知道了 ")])) : V("", !0), f.value ? (p(), h("div", bm, [ee(" ⚠ " + v(f.value) + " ", 1), l("button", {
                class: "btn link",
                type: "button",
                onClick: O[12] || (O[12] = G => r.value && ve(r.value))
            }, " 重试 ")])) : V("", !0), l("div", {
                class: "sec-label",
                "data-t": `BATCH ${r.value?r.value.slice(0,8):""}`
            }, [ee(" 批次 " + v(r.value ? r.value.slice(0, 8) : "") + " ", 1), i.value && i.value.status === "paused" ? (p(), h("span", wm, "已暂停")) : o.value === "running" ? (p(), h("span", km, "执行中")) : (p(), h("span", $m, "已完结"))], 8, _m), i.value ? (p(), Wt(Th, {
                key: 3,
                status: i.value,
                onCancel: X,
                onRetry: _e,
                onArchive: O[13] || (O[13] = G => n("archive")),
                onOpenReport: P,
                onPause: fe,
                onResume: ge
            }, null, 8, ["status"])) : V("", !0), o.value === "result" ? (p(), h("div", Cm, [l("button", {
                type: "button",
                class: "btn",
                onClick: O[14] || (O[14] = G => Te())
            }, " 新建批次 → "), l("button", {
                type: "button",
                class: "btn ghost",
                onClick: O[15] || (O[15] = G => n("archive"))
            }, " 查阅检测档案 ")])) : V("", !0)])), m.value.length ? (p(), h("div", Em, [O[33] || (O[33] = l("div", {
                class: "section-h"
            }, " 历史批次 ", -1)), ne.value ? (p(), h("p", xm, " ⚠ " + v(ne.value), 1)) : V("", !0), l("div", Sm, [(p(!0), h(ue, null, Oe(m.value, G => (p(), h("button", {
                key: G.batch_id,
                type: "button",
                class: we(["hist-row", {
                    cur: G.batch_id === r.value
                }]),
                onClick: Se => se(G)
            }, [l("span", Rm, v(G.batch_id.slice(0, 8)), 1), l("span", Tm, v(G.created_at), 1), l("span", Im, v(Math.round(G.progress * 100)) + "%", 1), l("span", Om, [ee(v(G.done) + "/" + v(G.total), 1), G.failed ? (p(), h("em", Pm, " 失败" + v(G.failed), 1)) : V("", !0)]), l("span", {
                class: we(["h-status", G.status === "paused" ? "paused" : G.status])
            }, v(G.status === "finished" ? "已完成" : G.status === "awaiting_review" ? "待重复性核查" : G.status === "paused" ? "已暂停" : "进行中"), 3)], 10, Am))), 128))])])) : V("", !0)]), Re(Vn, {
                open: S.value,
                title: "取消批次确认",
                message: "取消后，该批次尚未处理的底片将停止评定，已完成的结果予以保留；失败/已取消的任务后续可重试。确认取消？",
                "confirm-text": "取消批次",
                danger: "",
                onConfirm: ke,
                onCancel: O[16] || (O[16] = G => S.value = !1)
            }, null, 8, ["open"]), Re(So, {
                ctrl: ye(_)
            }, null, 8, ["ctrl"])], 64))
        }
    }),
    Um = We(Lm, [
        ["__scopeId", "data-v-27ed3aca"]
    ]),
    Vm = {
        key: 0,
        class: "err show"
    },
    Fm = {
        key: 1,
        class: "ok show"
    },
    Bm = {
        class: "row"
    },
    jm = {
        class: "grow"
    },
    Hm = {
        class: "dev-list"
    },
    Km = ["onClick"],
    Gm = {
        class: "d-name"
    },
    Wm = {
        class: "d-model"
    },
    qm = {
        key: 1,
        class: "cal-badge none"
    },
    zm = {
        key: 0,
        class: "hint"
    },
    Jm = {
        class: "field"
    },
    Xm = {
        class: "field"
    },
    Ym = {
        class: "field"
    },
    Qm = {
        class: "field"
    },
    Zm = {
        class: "grow"
    },
    e1 = {
        class: "section-h"
    },
    t1 = {
        class: "sub"
    },
    n1 = {
        class: "field"
    },
    s1 = {
        class: "field"
    },
    l1 = {
        class: "field"
    },
    o1 = {
        class: "field"
    },
    i1 = {
        class: "field"
    },
    a1 = {
        class: "hist-list"
    },
    r1 = {
        class: "c-time"
    },
    u1 = {
        class: "c-who"
    },
    c1 = {
        class: "c-val"
    },
    d1 = {
        key: 0,
        class: "hint"
    },
    f1 = {
        key: 1,
        class: "hint",
        style: {
            "margin-top": "20px"
        }
    },
    v1 = Fe({
        __name: "DeviceView",
        setup(e) {
            const t = an(),
                n = w([]),
                s = w(null),
                o = w(null),
                i = w(null),
                a = w(null),
                r = w(""),
                u = w(""),
                c = w(""),
                d = w(""),
                f = w(t.username || "");
            et(() => t.username, A => {
                A && (f.value = A)
            });
            const m = w(""),
                _ = w(""),
                P = w(""),
                E = w("");
            async function N() {
                try {
                    n.value = await lv()
                } catch (A) {
                    a.value = Ae(A)
                }
            }
            async function M(A) {
                s.value = A, a.value = null, i.value = null;
                try {
                    o.value = await iv(A)
                } catch (C) {
                    o.value = null, a.value = Ae(C)
                }
            }
            async function L() {
                if (a.value = null, i.value = null, !r.value.trim()) {
                    a.value = "设备名称必填。";
                    return
                }
                try {
                    const A = await ov({
                        name: r.value.trim(),
                        model: u.value.trim() || null,
                        serial_no: c.value.trim() || null,
                        notes: d.value.trim() || null
                    });
                    r.value = "", u.value = "", c.value = "", d.value = "", await N(), await M(A.device_id)
                } catch (A) {
                    a.value = Ae(A)
                }
            }
            async function K() {
                if (a.value = null, i.value = null, !s.value) return;
                if (!f.value.trim()) {
                    a.value = "标定人员不能为空。";
                    return
                }
                const A = Number(m.value);
                if (!Number.isFinite(A) || A <= 0) {
                    a.value = "实测像素标定值必须为正数。";
                    return
                }
                const C = _.value.trim() ? Number(_.value) : null;
                if (C !== null && (!Number.isFinite(C) || C <= 0)) {
                    a.value = "标定件参考值必须为正数。";
                    return
                }
                const T = P.value.trim() ? Number(P.value) : null;
                if (T !== null && !Number.isFinite(T)) {
                    a.value = "黑度校验值必须为数字。";
                    return
                }
                try {
                    await av(s.value, {
                        calibrator: f.value.trim(),
                        pixel_spacing_mm: A,
                        ref_pixel_spacing_mm: C,
                        density_ref: T,
                        notes: E.value.trim() || null
                    }), f.value = "", m.value = "", _.value = "", P.value = "", E.value = "", await M(s.value), await N(), i.value = "标定记录已保存。"
                } catch (x) {
                    a.value = Ae(x)
                }
            }
            const I = () => {
                var A;
                return ((A = o.value) == null ? void 0 : A.last_calibration) ?? null
            };
            return dt(() => {
                N()
            }), (A, C) => (p(), h("div", null, [C[24] || (C[24] = bn('<h1 class="title-zine" data-t="设备标定" data-v-bc7279eb> 设备标定 </h1><div class="lede" data-v-bc7279eb> 检测设备台账与空间像素标定管理，支持跨设备一致性核查（相对偏差 ≤ 5% 判定达标） </div><div class="guide" data-v-bc7279eb><div class="g" data-v-bc7279eb><div class="n" data-v-bc7279eb> 一 · 设备登记 </div><div class="t" data-v-bc7279eb> 登记检测设备信息（名称/型号/出厂编号），作为标定档案主体。 </div></div><div class="g" data-v-bc7279eb><div class="n" data-v-bc7279eb> 二 · 标定值录入 </div><div class="t" data-v-bc7279eb> 实测像素标定与标定件参考值比对，系统自动计算相对偏差：≤5% 判定达标，超差标记「over」。 </div></div><div class="g" data-v-bc7279eb><div class="n" data-v-bc7279eb> 三 · 一致性档案 </div><div class="t" data-v-bc7279eb> 每次标定均留档（标定人员/时间/偏差），批量筛查前可核对设备状态。 </div></div></div>', 3)), a.value ? (p(), h("div", Vm, " ⚠ " + v(a.value), 1)) : V("", !0), i.value ? (p(), h("div", Fm, v(i.value), 1)) : V("", !0), l("div", Bm, [l("div", jm, [C[13] || (C[13] = l("div", {
                class: "section-h"
            }, " 设备台账 ", -1)), l("div", Hm, [(p(!0), h(ue, null, Oe(n.value, T => (p(), h("button", {
                key: T.device_id,
                type: "button",
                class: we(["dev-row", {
                    cur: T.device_id === s.value
                }]),
                onClick: x => M(T.device_id)
            }, [l("span", Gm, v(T.name), 1), l("span", Wm, v(T.model || T.serial_no || "—"), 1), T.last_calibration ? (p(), h("span", {
                key: 0,
                class: we(["cal-badge", T.last_calibration.status === "over" ? "over" : "ok"])
            }, v(T.last_calibration.status === "over" ? "超差" : "达标"), 3)) : (p(), h("span", qm, "未标定"))], 10, Km))), 128)), n.value.length === 0 ? (p(), h("div", zm, " 暂无已登记设备。 ")) : V("", !0)]), C[14] || (C[14] = l("div", {
                class: "section-h",
                style: {
                    "margin-top": "18px"
                }
            }, " 设备登记 ", -1)), l("div", Jm, [C[9] || (C[9] = l("label", {
                for: "dn"
            }, [ee("设备名称 "), l("span", {
                class: "req"
            }, "*")], -1)), he(l("input", {
                id: "dn",
                "onUpdate:modelValue": C[0] || (C[0] = T => r.value = T),
                placeholder: "如 CR-01"
            }, null, 512), [
                [Ee, r.value]
            ])]), l("div", Xm, [C[10] || (C[10] = l("label", {
                for: "dm"
            }, "型号", -1)), he(l("input", {
                id: "dm",
                "onUpdate:modelValue": C[1] || (C[1] = T => u.value = T),
                placeholder: "如 X-Ray 3000"
            }, null, 512), [
                [Ee, u.value]
            ])]), l("div", Ym, [C[11] || (C[11] = l("label", {
                for: "ds"
            }, "出厂编号", -1)), he(l("input", {
                id: "ds",
                "onUpdate:modelValue": C[2] || (C[2] = T => c.value = T),
                placeholder: "如 SN-001"
            }, null, 512), [
                [Ee, c.value]
            ])]), l("div", Qm, [C[12] || (C[12] = l("label", {
                for: "dnotes"
            }, "备注", -1)), he(l("input", {
                id: "dnotes",
                "onUpdate:modelValue": C[3] || (C[3] = T => d.value = T)
            }, null, 512), [
                [Ee, d.value]
            ])]), l("button", {
                class: "btn",
                type: "button",
                onClick: L
            }, " 登记设备 → ")]), l("div", Zm, [o.value ? (p(), h(ue, {
                key: 0
            }, [l("div", e1, [ee(v(o.value.name) + " ", 1), l("span", t1, v(o.value.model || "") + " " + v(o.value.serial_no || ""), 1)]), l("div", {
                class: we(["cal-status", o.value.calibration_count ? "has" : ""])
            }, [ee(" 累计标定 " + v(o.value.calibration_count) + " 次 ", 1), I() ? (p(), h(ue, {
                key: 0
            }, [ee(" · 最近 " + v(I().calibrated_at) + " 由 " + v(I().calibrator) + " ", 1), l("span", {
                class: we(I().status === "over" ? "over" : "ok")
            }, " （" + v(I().status === "over" ? "超差" : "达标") + "， 相对偏差 " + v(I().deviation_pct ?? "—") + "%） ", 3)], 64)) : V("", !0)], 2), C[22] || (C[22] = l("div", {
                class: "section-h",
                style: {
                    "margin-top": "16px"
                }
            }, " 录入标定值 ", -1)), l("div", n1, [C[15] || (C[15] = l("label", {
                for: "cal1"
            }, [ee("标定人员（当前登录账号）"), l("span", {
                class: "req"
            }, "*")], -1)), he(l("input", {
                id: "cal1",
                "onUpdate:modelValue": C[4] || (C[4] = T => f.value = T),
                readonly: "",
                title: "标定记录归属当前登录账号（三员分岗防冒名）"
            }, null, 512), [
                [Ee, f.value]
            ])]), l("div", s1, [C[16] || (C[16] = l("label", {
                for: "cal2"
            }, [ee("实测像素标定（mm/px）"), l("span", {
                class: "req"
            }, "*")], -1)), he(l("input", {
                id: "cal2",
                "onUpdate:modelValue": C[5] || (C[5] = T => m.value = T),
                placeholder: "如 0.1000"
            }, null, 512), [
                [Ee, m.value]
            ]), C[17] || (C[17] = l("div", {
                class: "why"
            }, " 本设备实测空间标定值；提交检测任务时作为像素标定的默认参考。 ", -1))]), l("div", l1, [C[18] || (C[18] = l("label", {
                for: "cal3"
            }, "标定件参考值（mm/px）", -1)), he(l("input", {
                id: "cal3",
                "onUpdate:modelValue": C[6] || (C[6] = T => _.value = T),
                placeholder: "如 0.1000"
            }, null, 512), [
                [Ee, _.value]
            ]), C[19] || (C[19] = l("div", {
                class: "why"
            }, " 跨设备一致性核查基准；填写后自动计算相对偏差并按 ≤5% 判定。 ", -1))]), l("div", o1, [C[20] || (C[20] = l("label", {
                for: "cal4"
            }, "黑度 D 校验值（选填）", -1)), he(l("input", {
                id: "cal4",
                "onUpdate:modelValue": C[7] || (C[7] = T => P.value = T),
                placeholder: "如 2.4"
            }, null, 512), [
                [Ee, P.value]
            ])]), l("div", i1, [C[21] || (C[21] = l("label", {
                for: "cal5"
            }, "备注", -1)), he(l("input", {
                id: "cal5",
                "onUpdate:modelValue": C[8] || (C[8] = T => E.value = T)
            }, null, 512), [
                [Ee, E.value]
            ])]), l("button", {
                class: "btn",
                type: "button",
                onClick: K
            }, " 保存标定记录 → "), C[23] || (C[23] = l("div", {
                class: "section-h",
                style: {
                    "margin-top": "18px"
                }
            }, " 标定档案 ", -1)), l("div", a1, [(p(!0), h(ue, null, Oe(o.value.calibrations, T => (p(), h("div", {
                key: T.calibration_id,
                class: "cal-row"
            }, [l("span", r1, v(T.calibrated_at), 1), l("span", u1, v(T.calibrator), 1), l("span", c1, v(T.pixel_spacing_mm) + " mm/px", 1), T.deviation_pct !== null ? (p(), h("span", {
                key: 0,
                class: we(["c-dev", T.status])
            }, " 偏差 " + v(T.deviation_pct) + "% ", 3)) : V("", !0), l("span", {
                class: we(["c-badge", T.status])
            }, v(T.status === "over" ? "超差" : "达标"), 3)]))), 128)), o.value.calibrations.length === 0 ? (p(), h("div", d1, " 暂无标定记录。 ")) : V("", !0)])], 64)) : (p(), h("div", f1, " 请从左侧选择设备查看标定档案，或先登记设备。 "))])])]))
        }
    }),
    p1 = We(v1, [
        ["__scopeId", "data-v-bc7279eb"]
    ]);

function h1() {
    const e = w("upload"),
        t = w(null),
        n = w(null),
        s = w(null),
        o = w(null),
        i = w(0);
    let a;
    no() && so(() => {
        a && clearInterval(a), a = void 0, n.value && URL.revokeObjectURL(n.value)
    });

    function r(f) {
        n.value && URL.revokeObjectURL(n.value), n.value = null, t.value = f, f && (n.value = URL.createObjectURL(f))
    }
    async function u(f) {
        e.value = "processing", o.value = null, s.value = null, Bt.value = "journey";
        const m = performance.now();
        a = setInterval(() => {
            i.value = Math.round(performance.now() - m)
        }, 200);
        try {
            s.value = await qf(f), e.value = "result"
        } catch (_) {
            o.value = Ae(_), e.value = "result"
        } finally {
            a && clearInterval(a), a = void 0, Bt.value === "journey" && (Bt.value = null)
        }
    }

    function c() {
        o.value = null, s.value = null, i.value = 0, e.value = "upload"
    }

    function d() {
        a && clearInterval(a), a = void 0, r(null), e.value = "upload", o.value = null, s.value = null, i.value = 0
    }
    return {
        phase: Nt(e),
        file: Nt(t),
        sourceUrl: Nt(n),
        result: Nt(s),
        error: Nt(o),
        elapsedMs: Nt(i),
        setFile: r,
        submit: u,
        backToUpload: c,
        reset: d
    }
}
const m1 = {
        class: "stepper",
        "aria-label": "评定流程步骤"
    },
    g1 = {
        class: "num"
    },
    y1 = Fe({
        __name: "Stepper",
        props: {
            current: {}
        },
        setup(e) {
            const t = ["底片导入", "自动评定", "报告签发"];
            return (n, s) => (p(), h("div", m1, [(p(), h(ue, null, Oe(t, (o, i) => (p(), h(ue, {
                key: o
            }, [i > 0 ? (p(), h("div", {
                key: 0,
                class: we(["bar", {
                    done: e.current > i
                }])
            }, null, 2)) : V("", !0), l("div", {
                class: we(["step", {
                    active: e.current === i + 1,
                    done: e.current > i + 1
                }])
            }, [l("span", g1, v(`0${i+1}`), 1), ee(v(o), 1)], 2)], 64))), 64))]))
        }
    }),
    b1 = {
        class: "row"
    },
    _1 = {
        class: "grow"
    },
    w1 = ["onKeydown"],
    k1 = ["accept"],
    $1 = {
        key: 0,
        class: "preview show"
    },
    C1 = {
        key: 0,
        class: "thumb noimg",
        title: "该格式由后端转档处理，本机不做预览；可正常提交评定"
    },
    E1 = ["src"],
    x1 = {
        key: 2,
        class: "thumb noimg",
        title: "预览解码失败：文件可能损坏或扩展名与实际格式不符；仍可尝试提交评定"
    },
    S1 = {
        class: "meta"
    },
    A1 = {
        key: 3,
        class: "hint"
    },
    R1 = {
        key: 1,
        class: "err show"
    },
    T1 = {
        class: "grow"
    },
    I1 = {
        class: "field"
    },
    O1 = {
        class: "field"
    },
    P1 = {
        key: 0,
        class: "err show"
    },
    M1 = {
        class: "field"
    },
    N1 = {
        class: "field"
    },
    D1 = {
        class: "field"
    },
    L1 = {
        class: "check",
        for: "prelim"
    },
    U1 = ["disabled"],
    V1 = {
        class: "meta-head"
    },
    F1 = {
        key: 0,
        class: "fgroups"
    },
    B1 = {
        class: "fgrid"
    },
    j1 = ["for"],
    H1 = ["id", "onUpdate:modelValue", "placeholder"],
    K1 = 50 * 1024 * 1024,
    G1 = Fe({
        __name: "UploadPanel",
        emits: ["fileChanged", "submit"],
        setup(e, {
            expose: t,
            emit: n
        }) {
            const s = n,
                o = w(null),
                i = w(null),
                a = w(null),
                r = w(null),
                u = w("0.1000"),
                c = w(""),
                d = w(""),
                f = w(""),
                m = w(!0),
                _ = w(!1),
                P = w({}),
                E = me(() => Object.values(P.value).filter($ => $.trim()).length);

            function N() {
                _.value = !_.value
            }
            const M = me(() => !!o.value && Ur(o.value.name)),
                L = me(() => {
                    var $;
                    return ((($ = o.value) == null ? void 0 : $.name.split(".").pop()) ?? "?").toUpperCase()
                }),
                K = w(!1);

            function I($) {
                var le;
                const j = ((le = $.name.split(".").pop()) == null ? void 0 : le.toLowerCase()) ?? "";
                if (!Ao.includes(j)) {
                    a.value = `不支持的格式${j?` .${j}`:""}：请提供 DICOM(.dcm) 或常见图像格式（JPG/PNG/BMP/GIF/WebP/TIFF/HEIC 等）。`;
                    return
                }
                if ($.size > K1) {
                    a.value = `文件 ${($.size/1024/1024).toFixed(1)}MB 超过 50MB 上限，请压缩后重新导入。`;
                    return
                }
                a.value = null, K.value = !1, i.value && URL.revokeObjectURL(i.value), o.value = $, i.value = URL.createObjectURL($), s("fileChanged", $)
            }

            function A($) {
                var le, H;
                $.preventDefault();
                const j = (H = (le = $.dataTransfer) == null ? void 0 : le.files) == null ? void 0 : H[0];
                j && I(j)
            }

            function C() {
                var $;
                ($ = x.value) == null || $.click()
            }

            function T($) {
                var le;
                const j = (le = $.target.files) == null ? void 0 : le[0];
                j && I(j), $.target.value = ""
            }
            const x = w(null),
                W = Io();
            et(() => W.pendingFileOpen, $ => {
                $ === "image" && (W.pendingFileOpen = null, Gt(() => {
                    var j;
                    return (j = x.value) == null ? void 0 : j.click()
                }))
            }, {
                immediate: !0
            });

            function te() {
                if (r.value = null, !o.value) {
                    a.value = "请先导入射线底片影像。";
                    return
                }
                if (!c.value.trim()) {
                    r.value = "母材公称厚度 T 为必填项（分级评定依据）；缺省时级别评定将被锁定。";
                    return
                }
                const $ = new FormData;
                $.append("image", o.value), $.append("pixel_spacing_mm", u.value || ""), $.append("base_metal_thickness_mm", c.value.trim()), d.value.trim() && $.append("workpiece_no", d.value.trim()), f.value.trim() && $.append("weld_no", f.value.trim()), $.append("allow_preliminary_grade", m.value ? "true" : "false");
                const j = {};
                for (const le of Ji)
                    for (const H of le.fields) {
                        const ne = (P.value[H.key] ?? "").trim();
                        ne && (j[H.key] = ne)
                    }
                Object.keys(j).length > 0 && $.append("report_meta", JSON.stringify(j)), s("submit", $)
            }
            const de = me(() => {
                if (!o.value) return "";
                const $ = (o.value.size / 1024).toFixed(0);
                return `${o.value.name} · ${$} KB`
            });

            function B() {
                i.value && (URL.revokeObjectURL(i.value), i.value = null)
            }

            function k() {
                B(), o.value = null, a.value = null, r.value = null, K.value = !1, u.value = "0.1000", c.value = "", d.value = "", f.value = "", P.value = {}, _.value = !1, s("fileChanged", null)
            }
            return wn(() => {
                B()
            }), t({
                reset: k
            }), ($, j) => (p(), h("div", null, [j[16] || (j[16] = bn('<div class="guide"><div class="g"><div class="n"> 一 · 底片导入 </div><div class="t"> 拖入或选择射线底片。支持 DICOM(.dcm) 及常见图像格式（JPG/PNG/BMP/GIF/WebP/TIFF/HEIC 等）。 </div></div><div class="g"><div class="n"> 二 · 工艺参数录入 </div><div class="t"> 空间像素标定有默认值；母材公称厚度 T 为分级评定必备参数。可展开填写《射线检测报告》汇总表补充信息。 </div></div><div class="g"><div class="n"> 三 · 评定报告 </div><div class="t"> 提交后由本地推理流水线评定（约 15–30 秒），输出《射线检测报告》与底片评定表。 </div></div></div>', 1)), l("div", b1, [l("div", _1, [j[8] || (j[8] = bn('<div class="chips"><span class="chip on">DICOM .dcm</span><span class="chip on">JPG/PNG/BMP</span><span class="chip on">TIFF/GIF/WebP</span><span class="chip on">HEIC/AVIF</span></div><div class="hint"> 常见图像与 DICOM 均可导入，系统自动转换为灰度影像处理。单文件 ≤ 50MB。 </div>', 2)), l("div", {
                class: "drop",
                role: "button",
                tabindex: "0",
                "aria-label": "拖入或选择射线底片",
                onClick: C,
                onKeydown: [Tt(Je(C, ["prevent"]), ["enter"]), Tt(Je(C, ["prevent"]), ["space"])],
                onDragover: j[0] || (j[0] = Je(() => {}, ["prevent"])),
                onDrop: A
            }, [...j[7] || (j[7] = [l("div", {
                class: "big"
            }, " 拖入射线底片至此处，或点击选择文件 ", -1), l("div", {
                class: "hint"
            }, " 影像全程本机处理，不经任何外部网络传输 ", -1)])], 40, w1), l("input", {
                ref_key: "inputEl",
                ref: x,
                type: "file",
                accept: ye(Ro),
                style: {
                    display: "none"
                },
                onChange: T
            }, null, 40, k1), o.value ? (p(), h("div", $1, [M.value ? K.value ? (p(), h("span", x1, "预览失败")) : (p(), h("img", {
                key: 1,
                src: i.value ?? void 0,
                alt: "影像预览",
                class: "thumb",
                onError: j[1] || (j[1] = le => K.value = !0)
            }, null, 40, E1)) : (p(), h("span", C1, v(L.value), 1)), l("div", S1, v(de.value), 1), !M.value || K.value ? (p(), h("div", A1, " 该格式本机不做缩略图预览（不影响评定）；评定结果页可查看完整报告。 ")) : V("", !0)])) : V("", !0), a.value ? (p(), h("div", R1, " ⚠ " + v(a.value), 1)) : V("", !0)]), l("div", T1, [l("div", I1, [j[9] || (j[9] = l("label", {
                for: "spacing"
            }, "空间像素标定（mm/px）", -1)), he(l("input", {
                id: "spacing",
                "onUpdate:modelValue": j[2] || (j[2] = le => u.value = le)
            }, null, 512), [
                [Ee, u.value]
            ]), j[10] || (j[10] = l("div", {
                class: "why"
            }, " 默认 0.1000 mm/px；底片带影像标尺时可覆盖。用于将像素尺寸换算为缺陷实际当量。 ", -1))]), l("div", O1, [j[11] || (j[11] = l("label", {
                for: "thick"
            }, [ee("母材公称厚度 T（mm）"), l("span", {
                class: "req"
            }, "*")], -1)), he(l("input", {
                id: "thick",
                "onUpdate:modelValue": j[3] || (j[3] = le => c.value = le),
                placeholder: "如 20"
            }, null, 512), [
                [Ee, c.value]
            ]), j[12] || (j[12] = l("div", {
                class: "why"
            }, " 分级评定必备（NB/T 47013.2 依 T 划定评定区与各级限值）。 ", -1)), r.value ? (p(), h("div", P1, " ⚠ " + v(r.value), 1)) : V("", !0)]), l("div", M1, [j[13] || (j[13] = l("label", {
                for: "wp"
            }, "工件名称（选填）", -1)), he(l("input", {
                id: "wp",
                "onUpdate:modelValue": j[4] || (j[4] = le => d.value = le),
                placeholder: "如 前水冷壁"
            }, null, 512), [
                [Ee, d.value]
            ])]), l("div", N1, [j[14] || (j[14] = l("label", {
                for: "wn"
            }, "焊缝/管口编号（选填）", -1)), he(l("input", {
                id: "wn",
                "onUpdate:modelValue": j[5] || (j[5] = le => f.value = le),
                placeholder: "如 QSB"
            }, null, 512), [
                [Ee, f.value]
            ])]), l("div", D1, [l("label", L1, [he(l("input", {
                id: "prelim",
                "onUpdate:modelValue": j[6] || (j[6] = le => m.value = le),
                type: "checkbox"
            }, null, 512), [
                [kn, m.value]
            ]), j[15] || (j[15] = l("span", null, [ee(" 底片质量不达标时仍输出 AI 预筛级别 "), l("em", null, "级别会标注为「AI 预筛·非正式级别」，仅供参考，不得作为验收结论；取消勾选则不合格底片不输出级别。")], -1))])]), l("button", {
                class: "btn",
                type: "button",
                disabled: !o.value,
                onClick: te
            }, " 提交评定 → ", 8, U1)])]), j[17] || (j[17] = l("div", {
                class: "section-h"
            }, [l("span", {
                class: "no"
            }, "报告"), ee("《射线检测报告》补充信息（选填） ")], -1)), j[18] || (j[18] = l("div", {
                class: "hint"
            }, " 按正式报告首页汇总表分区录入，出片时自动填入对应栏位；留空栏打印后可手工补填。 ", -1)), l("div", V1, [l("button", {
                class: "btn link",
                type: "button",
                onClick: N
            }, [ee(v(_.value ? "▾ 收起补充信息" : "▸ 展开补充信息") + " ", 1), E.value > 0 ? (p(), h(ue, {
                key: 0
            }, [ee(" 　· 已填 " + v(E.value) + " 项 ", 1)], 64)) : V("", !0)])]), _.value ? (p(), h("div", F1, [(p(!0), h(ue, null, Oe(ye(Ji), le => (p(), h("fieldset", {
                key: le.title,
                class: "fset"
            }, [l("legend", null, v(le.title), 1), l("div", B1, [(p(!0), h(ue, null, Oe(le.fields, H => (p(), h("div", {
                key: H.key,
                class: "fitem"
            }, [l("label", {
                for: `meta-${H.key}`
            }, v(H.label), 9, j1), he(l("input", {
                id: `meta-${H.key}`,
                "onUpdate:modelValue": ne => P.value[H.key] = ne,
                placeholder: H.ph ?? ""
            }, null, 8, H1), [
                [Ee, P.value[H.key]]
            ])]))), 128))])]))), 128))])) : V("", !0)]))
        }
    }),
    W1 = {
        class: "proc-head"
    },
    q1 = {
        class: "clock"
    },
    z1 = {
        class: "track"
    },
    J1 = {
        class: "idx"
    },
    X1 = {
        class: "nm"
    },
    Y1 = {
        key: 0,
        class: "st"
    },
    Q1 = {
        key: 1,
        class: "st"
    },
    Z1 = {
        key: 0,
        class: "tip"
    },
    eg = {
        key: 1,
        class: "tip"
    },
    tg = {
        style: {
            color: "var(--signal)"
        }
    },
    ng = {
        key: 2,
        class: "tip slow-hint",
        role: "status"
    },
    sg = Fe({
        __name: "PipelineTrack",
        props: {
            status: {},
            elapsedMs: {},
            errorMessage: {}
        },
        emits: ["retry"],
        setup(e, {
            emit: t
        }) {
            const n = e,
                s = t;

            function o(r) {
                const u = Math.floor(r / 1e3);
                return `${String(Math.floor(u/60)).padStart(2,"0")}:${String(u%60).padStart(2,"0")}`
            }
            const i = () => n.status === "running",
                a = () => n.elapsedMs > 6e4;
            return (r, u) => (p(), h("div", null, [l("div", W1, [l("div", null, [u[1] || (u[1] = l("span", {
                style: {
                    "font-size": "11px",
                    color: "var(--ink-faint)"
                }
            }, "已运行", -1)), l("span", q1, v(o(e.elapsedMs)), 1)]), u[2] || (u[2] = l("div", {
                class: "expect"
            }, " 预计耗时 15–30 秒 · 评定进行中，请勿关闭窗口 ", -1))]), l("div", z1, [(p(!0), h(ue, null, Oe(ye(xp), (c, d) => (p(), h("div", {
                key: c,
                class: we(["stage-row", i() ? "run" : "fail"])
            }, [l("span", J1, v(String(d + 1).padStart(2, "0")), 1), l("span", X1, v(c), 1), i() ? (p(), h("span", Y1, v(d === 0 ? "提交后依序执行" : "排队"), 1)) : (p(), h("span", Q1, "已中断"))], 2))), 128))]), i() ? (p(), h("p", Z1, [...u[3] || (u[3] = [l("span", {
                class: "spin"
            }, null, -1), ee("正在向本地推理服务提交底片并等待评定结果… ", -1)])])) : (p(), h("p", eg, [l("span", tg, "✕ 评定失败：" + v(e.errorMessage), 1)])), i() && a() ? (p(), h("p", ng, " 已超过常规耗时。大尺寸底片或机械硬盘场景下 1–3 分钟属正常范围，计时仍在走动即说明请求未挂起；若超过 3 分钟无响应，可返回检查服务状态后重新提交。 ")) : V("", !0), u[4] || (u[4] = l("div", {
                class: "leave"
            }, " 等待期间可切换至「检测档案」查阅历史记录；评定结果将自动归档至本地数据库。 ", -1)), i() ? V("", !0) : (p(), h("button", {
                key: 3,
                class: "btn ghost",
                type: "button",
                onClick: u[0] || (u[0] = c => s("retry"))
            }, " ← 返回修改（保留已选底片与参数） "))]))
        }
    }),
    Xi = We(sg, [
        ["__scopeId", "data-v-5a6dbbaa"]
    ]),
    lg = {
        class: "lv"
    },
    og = {
        class: "con"
    },
    ig = ["title"],
    ag = {
        class: "why"
    },
    rg = Fe({
        __name: "ResultBanner",
        props: {
            result: {}
        },
        setup(e) {
            const t = e,
                n = me(() => t.result.evaluable ? t.result.need_review ? "review" : "ok" : "fail"),
                s = me(() => tn(t.result.stamp ?? null)),
                o = me(() => t.result.evaluable ? t.result.need_review && !t.result.joint_level ? "待复核" : t.result.joint_level ?? "待复核" : "不可评片"),
                i = me(() => {
                    const r = t.result.defect_count;
                    if (n.value === "fail") return "底片质量未达标准要求（像质计灵敏度/黑度 D 校验未通过），系统按保守原则未输出级别结论。";
                    const u = t.result.need_review && t.result.joint_level ? `综合评定 ${t.result.joint_level} 级，本报告须经人工复核确认。` : t.result.joint_level ? `综合评定 ${t.result.joint_level} 级。` : "本报告待人工复核，暂无自动评级结论。",
                        c = r > 0 ? `共检出 ${r} 处缺陷，明细见 PDF/A 报告。` : "未检出缺陷。";
                    return u + c
                }),
                a = me(() => n.value === "fail" ? "可能原因：像质计（IQI）丝号未达要求，或黑度 D 超出 AB 级规定范围。可调整曝光参数或补加像质计后重新透照；必要时转人工评片。" : n.value === "review" ? "可能原因：本报告依据的评级标准限值需要授权后使用，或初评与对评结论存在分歧。系统已按 §12.2 转入人工仲裁流程——此为「宁保守、不误放行」的保守判定策略，并非系统误报。" : "像质计灵敏度与黑度 D 校验均通过；如需归档，请导出 PDF/A 检测报告。");
            return (r, u) => (p(), h("div", {
                class: we(["banner", n.value])
            }, [l("div", lg, v(o.value), 1), l("div", og, [l("b", null, v(i.value), 1), s.value ? (p(), h("span", {
                key: 0,
                class: we(["stamp-line", `stamp-${s.value.cls}`]),
                title: s.value.title
            }, "底片印字：" + v(s.value.label), 11, ig)) : V("", !0), l("span", ag, v(a.value), 1)])], 2))
        }
    }),
    ug = We(rg, [
        ["__scopeId", "data-v-1349adcc"]
    ]),
    cg = {
        key: 0,
        class: "notices",
        role: "alert"
    },
    dg = Fe({
        __name: "ReportNotices",
        props: {
            result: {}
        },
        setup(e) {
            const t = e,
                n = me(() => [...t.result.warnings ?? []]);
            return (s, o) => n.value.length > 0 ? (p(), h("div", cg, [o[0] || (o[0] = l("div", {
                class: "n-h"
            }, " ⚠ 需注意 ", -1)), l("ul", null, [(p(!0), h(ue, null, Oe(n.value, (i, a) => (p(), h("li", {
                key: a
            }, v(i), 1))), 128))])])) : V("", !0)
        }
    }),
    fg = We(dg, [
        ["__scopeId", "data-v-12cb35f1"]
    ]),
    vg = {
        class: "track",
        style: {
            "margin-top": "12px"
        }
    },
    pg = {
        style: {
            padding: "14px 16px"
        }
    },
    hg = {
        class: "row"
    },
    mg = {
        class: "field grow",
        style: {
            "margin-top": "0"
        }
    },
    gg = {
        class: "field grow",
        style: {
            "margin-top": "0"
        }
    },
    yg = {
        class: "field grow",
        style: {
            "margin-top": "0"
        }
    },
    bg = {
        class: "field"
    },
    _g = ["disabled"],
    wg = {
        key: 0,
        style: {
            "margin-top": "10px"
        }
    },
    kg = {
        class: "field"
    },
    $g = {
        key: 0,
        class: "dtable"
    },
    Cg = ["value", "disabled", "onChange"],
    Eg = ["value"],
    xg = ["disabled", "onClick"],
    Sg = {
        key: 1,
        class: "lede"
    },
    Ag = {
        class: "row"
    },
    Rg = {
        class: "field"
    },
    Tg = ["value"],
    Ig = {
        class: "field grow"
    },
    Og = ["disabled"],
    Pg = {
        key: 2,
        class: "ok show"
    },
    Mg = {
        key: 3,
        class: "err show"
    },
    Ng = {
        key: 1,
        class: "err show",
        style: {
            "margin-top": "10px"
        }
    },
    Dg = {
        key: 2,
        style: {
            "margin-top": "16px"
        },
        class: "kv"
    },
    Lg = {
        class: "v"
    },
    Ug = {
        class: "v"
    },
    Vg = {
        class: "v"
    },
    Fg = {
        class: "v"
    },
    Bg = {
        class: "v"
    },
    jg = {
        class: "v"
    },
    Hg = {
        key: 0,
        class: "err show",
        style: {
            "margin-top": "10px"
        }
    },
    Kg = Fe({
        __name: "ReviewPanel",
        props: {
            imageId: {},
            reportId: {}
        },
        setup(e) {
            const t = e,
                n = dl.map((B, k) => ({
                    id: k,
                    name: B
                })),
                s = an(),
                o = w(s.username || "");
            et(() => s.username, B => {
                B && (o.value = B)
            });
            const i = w("initial"),
                a = w(""),
                r = w(""),
                u = w(!1),
                c = w(null),
                d = w(null),
                f = w(!1),
                m = w([]),
                _ = w(!1),
                P = w(null),
                E = w(null),
                N = w(""),
                M = w(0),
                L = w("");
            async function K() {
                f.value = !f.value, f.value && t.reportId && await I()
            }
            async function I() {
                if (t.reportId) {
                    E.value = null;
                    try {
                        const B = await Eo(t.reportId);
                        m.value = B.defects.map(k => ({
                            id: String(k.id),
                            class_id: Number(k.class_id),
                            bbox_px: k.bbox ?? [],
                            source: k.source ?? null
                        }))
                    } catch (B) {
                        E.value = Ae(B)
                    }
                }
            }

            function A() {
                return N.value.trim() ? N.value.trim() : (E.value = "请先填写变更理由（审计必填）。", null)
            }
            async function C() {
                const B = A();
                if (B === null) return;
                const k = L.value.split(/[,,\s]+/).filter(Boolean).map(Number);
                if (k.length !== 4 || k.some($ => !Number.isFinite($) || $ < 0)) {
                    E.value = "检出框坐标格式应为 x,y,w,h（非负数字）。";
                    return
                }
                _.value = !0, E.value = null;
                try {
                    const $ = await cv(t.imageId, {
                        class_id: M.value,
                        bbox_px: k,
                        reason: B
                    });
                    P.value = `已补录缺陷，综合评定级别 ${$.joint_level??"待人工评定"}（缺陷检出 ${$.defect_count} 处）`, await I()
                } catch ($) {
                    E.value = Ae($)
                } finally {
                    _.value = !1
                }
            }
            async function T(B, k) {
                const $ = A();
                if ($ !== null) {
                    _.value = !0, E.value = null;
                    try {
                        const j = await dv(B.id, {
                            class_id: k,
                            reason: $
                        });
                        P.value = `已改判缺陷类别，综合评定级别 ${j.joint_level??"待人工评定"}`, await I()
                    } catch (j) {
                        E.value = Ae(j)
                    } finally {
                        _.value = !1
                    }
                }
            }
            const x = w(null);

            function W(B) {
                x.value = B
            }
            async function te() {
                const B = x.value;
                if (x.value = null, !B) return;
                const k = A();
                if (k !== null) {
                    _.value = !0, E.value = null;
                    try {
                        const $ = await fv(B.id, k);
                        P.value = `已删除缺陷记录，综合评定级别 ${$.joint_level??"待人工评定"}（缺陷检出 ${$.defect_count} 处）`, await I()
                    } catch ($) {
                        E.value = Ae($)
                    } finally {
                        _.value = !1
                    }
                }
            }
            async function de() {
                if (d.value = null, c.value = null, !o.value.trim()) {
                    d.value = "评片人员姓名/工号不能为空。";
                    return
                }
                u.value = !0;
                try {
                    c.value = await Jf({
                        image_id: t.imageId,
                        reviewer: o.value.trim(),
                        role: i.value,
                        overall_level: a.value || null,
                        note: r.value.trim() || null
                    })
                } catch (B) {
                    d.value = Ae(B)
                } finally {
                    u.value = !1
                }
            }
            return (B, k) => (p(), h(ue, null, [l("div", vg, [k[25] || (k[25] = l("div", {
                class: "stage-row"
            }, [l("span", {
                class: "idx"
            }, "·"), l("span", {
                class: "nm",
                style: {
                    color: "var(--amber)"
                }
            }, "人工复核（初评 / 复评 / 仲裁）"), l("span", {
                class: "st",
                style: {
                    color: "var(--amber)"
                }
            }, "待人工复核")], -1)), l("div", pg, [l("div", hg, [l("div", mg, [k[8] || (k[8] = l("label", {
                for: "rv"
            }, [ee("评片人员（当前登录账号）"), l("span", {
                class: "req"
            }, "*")], -1)), he(l("input", {
                id: "rv",
                "onUpdate:modelValue": k[0] || (k[0] = $ => o.value = $),
                readonly: "",
                title: "复核记录归属当前登录账号（三员分岗防冒名）"
            }, null, 512), [
                [Ee, o.value]
            ])]), l("div", gg, [k[10] || (k[10] = l("label", {
                for: "rr"
            }, "复核角色", -1)), he(l("select", {
                id: "rr",
                "onUpdate:modelValue": k[1] || (k[1] = $ => i.value = $)
            }, [...k[9] || (k[9] = [l("option", {
                value: "initial"
            }, " 初评 ", -1), l("option", {
                value: "secondary"
            }, " 复评 ", -1), l("option", {
                value: "arbitrator"
            }, " 仲裁 ", -1)])], 512), [
                [pt, i.value]
            ])]), l("div", yg, [k[12] || (k[12] = l("label", {
                for: "rl"
            }, "复核质量级别（选填）", -1)), he(l("select", {
                id: "rl",
                "onUpdate:modelValue": k[2] || (k[2] = $ => a.value = $)
            }, [...k[11] || (k[11] = [bn('<option value="" data-v-2eae17b2> 不指定 </option><option value="I" data-v-2eae17b2> I 级 </option><option value="II" data-v-2eae17b2> II 级 </option><option value="III" data-v-2eae17b2> III 级 </option><option value="IV" data-v-2eae17b2> IV 级 </option>', 5)])], 512), [
                [pt, a.value]
            ])])]), l("div", bg, [k[13] || (k[13] = l("label", {
                for: "rn"
            }, "复核意见（选填）", -1)), he(l("input", {
                id: "rn",
                "onUpdate:modelValue": k[3] || (k[3] = $ => r.value = $),
                style: {
                    "max-width": "100%"
                }
            }, null, 512), [
                [Ee, r.value]
            ])]), l("button", {
                class: "btn",
                type: "button",
                disabled: u.value,
                onClick: de
            }, v(u.value ? "提交中…" : "提交复核结论"), 9, _g), k[24] || (k[24] = l("div", {
                class: "section-h"
            }, " 缺陷管理（增删改后系统自动重新评级） ", -1)), l("button", {
                class: "btn",
                type: "button",
                onClick: K
            }, v(f.value ? "收起" : "展开") + "缺陷管理 ", 1), f.value ? (p(), h("div", wg, [l("div", kg, [k[14] || (k[14] = l("label", {
                for: "dfr"
            }, [ee("变更理由（审计必填）"), l("span", {
                class: "req"
            }, "*")], -1)), he(l("input", {
                id: "dfr",
                "onUpdate:modelValue": k[4] || (k[4] = $ => N.value = $),
                placeholder: "如：复核确认为裂纹 / 补录漏检气孔 / 判定为伪影像"
            }, null, 512), [
                [Ee, N.value]
            ])]), m.value.length ? (p(), h("table", $g, [k[15] || (k[15] = l("thead", null, [l("tr", null, [l("th", null, "缺陷类型"), l("th", null, "检出框 [x,y,w,h]"), l("th", null, "来源"), l("th", null, "操作")])], -1)), l("tbody", null, [(p(!0), h(ue, null, Oe(m.value, $ => (p(), h("tr", {
                key: $.id
            }, [l("td", null, [l("select", {
                value: $.class_id,
                disabled: _.value,
                onChange: j => T($, Number(j.target.value))
            }, [(p(!0), h(ue, null, Oe(ye(n), j => (p(), h("option", {
                key: j.id,
                value: j.id
            }, v(j.name), 9, Eg))), 128))], 40, Cg)]), l("td", null, v($.bbox_px.map(j => Math.round(j)).join(", ")), 1), l("td", null, v($.source === "manual" ? "人工补录" : "系统检出"), 1), l("td", null, [l("button", {
                class: "btn danger",
                type: "button",
                disabled: _.value,
                onClick: j => W($)
            }, " 删除 ", 8, xg)])]))), 128))])])) : (p(), h("div", Sg, " 该影像暂无缺陷检出记录。 ")), l("div", Ag, [l("div", Rg, [k[16] || (k[16] = l("label", {
                for: "dfc"
            }, "新增缺陷类型", -1)), he(l("select", {
                id: "dfc",
                "onUpdate:modelValue": k[5] || (k[5] = $ => M.value = $)
            }, [(p(!0), h(ue, null, Oe(ye(n), $ => (p(), h("option", {
                key: $.id,
                value: $.id
            }, v($.name), 9, Tg))), 128))], 512), [
                [pt, M.value, void 0, {
                    number: !0
                }]
            ])]), l("div", Ig, [k[17] || (k[17] = l("label", {
                for: "dfb"
            }, "检出框坐标 x,y,w,h（像素）", -1)), he(l("input", {
                id: "dfb",
                "onUpdate:modelValue": k[6] || (k[6] = $ => L.value = $),
                placeholder: "如 120,30,20,20"
            }, null, 512), [
                [Ee, L.value]
            ])]), l("button", {
                class: "btn",
                type: "button",
                disabled: _.value,
                onClick: C
            }, " 补录缺陷 ", 8, Og)]), P.value ? (p(), h("div", Pg, v(P.value), 1)) : V("", !0), E.value ? (p(), h("div", Mg, v(E.value), 1)) : V("", !0)])) : V("", !0), d.value ? (p(), h("div", Ng, " ⚠ " + v(d.value), 1)) : V("", !0), c.value ? (p(), h("div", Dg, [k[18] || (k[18] = l("div", {
                class: "k"
            }, " 对评一致性 ", -1)), l("div", Lg, v(c.value.consensus ? "已达成" : "未达成"), 1), k[19] || (k[19] = l("div", {
                class: "k"
            }, " 一致性系数 κ ", -1)), l("div", Ug, v(c.value.kappa.toFixed(3)), 1), k[20] || (k[20] = l("div", {
                class: "k"
            }, " 复核阶段 ", -1)), l("div", Vg, v(c.value.stage), 1), k[21] || (k[21] = l("div", {
                class: "k"
            }, " 最终质量级别 ", -1)), l("div", Fg, v(c.value.joint_level ?? "—"), 1), k[22] || (k[22] = l("div", {
                class: "k"
            }, " 是否需仲裁 ", -1)), l("div", Bg, v(c.value.needs_arbitration ? "是" : "否"), 1), k[23] || (k[23] = l("div", {
                class: "k"
            }, " 累计复核次数 ", -1)), l("div", jg, v(c.value.review_count), 1), c.value.training_pool_synced ? V("", !0) : (p(), h("div", Hg, " ⚠ 训练池自动回流失败：本次人工确认的缺陷未能进入训练样本库（详见服务端日志），需管理员手动补录 "))])) : V("", !0)])]), Re(Vn, {
                open: x.value !== null,
                title: "删除缺陷确认",
                message: "删除该缺陷记录后将触发重新评级并重新签发报告；本操作记入审计链，不可撤销。确认删除？",
                "confirm-text": "删除",
                danger: "",
                onConfirm: te,
                onCancel: k[7] || (k[7] = $ => x.value = null)
            }, null, 8, ["open"])], 64))
        }
    }),
    Gg = We(Kg, [
        ["__scopeId", "data-v-2eae17b2"]
    ]),
    Wg = {
        class: "badge"
    },
    qg = {
        class: "actions"
    },
    zg = {
        key: 0,
        class: "disc"
    },
    Jg = Fe({
        __name: "DispositionPanel",
        props: {
            result: {}
        },
        setup(e) {
            const t = e,
                n = me(() => {
                    switch (t.result.disposition) {
                        case "accept":
                            return "accept";
                        case "conditional":
                            return "conditional";
                        case "rework":
                            return "rework";
                        default:
                            return "recheck"
                    }
                });
            return (s, o) => e.result.disposition ? (p(), h("div", {
                key: 0,
                class: we(["disp", n.value])
            }, [l("div", Wg, v(e.result.disposition_label ?? e.result.disposition), 1), l("ul", qg, [(p(!0), h(ue, null, Oe(e.result.disposition_actions, (i, a) => (p(), h("li", {
                key: a
            }, v(i), 1))), 128))]), e.result.disclaimer ? (p(), h("div", zg, v(e.result.disclaimer), 1)) : V("", !0)], 2)) : V("", !0)
        }
    }),
    Xg = We(Jg, [
        ["__scopeId", "data-v-e54a883a"]
    ]),
    Yg = {
        class: "lede"
    },
    Qg = {
        class: "rt-wrap"
    },
    Zg = {
        class: "rt-no"
    },
    ey = {
        class: "rt"
    },
    ty = {
        colspan: "7"
    },
    ny = {
        colspan: "4"
    },
    sy = {
        colspan: "7"
    },
    ly = {
        colspan: "4"
    },
    oy = {
        colspan: "3"
    },
    iy = {
        colspan: "5"
    },
    ay = {
        colspan: "2"
    },
    ry = {
        colspan: "3"
    },
    uy = {
        colspan: "2"
    },
    cy = {
        colspan: "5"
    },
    dy = {
        colspan: "2"
    },
    fy = {
        colspan: "3"
    },
    vy = {
        colspan: "5"
    },
    py = {
        colspan: "3"
    },
    hy = {
        colspan: "5"
    },
    my = {
        colspan: "2"
    },
    gy = {
        colspan: "2"
    },
    yy = {
        colspan: "3"
    },
    by = {
        colspan: "5"
    },
    _y = {
        colspan: "2"
    },
    wy = {
        colspan: "3"
    },
    ky = {
        colspan: "5"
    },
    $y = {
        colspan: "2"
    },
    Cy = {
        colspan: "3"
    },
    Ey = {
        colspan: "2"
    },
    xy = {
        colspan: "3"
    },
    Sy = {
        colspan: "5"
    },
    Ay = {
        colspan: "3"
    },
    Ry = {
        colspan: "5"
    },
    Ty = {
        colspan: "2"
    },
    Iy = {
        colspan: "3"
    },
    Oy = {
        colspan: "5"
    },
    Py = {
        colspan: "2"
    },
    My = {
        colspan: "3"
    },
    Ny = {
        colspan: "5"
    },
    Dy = {
        colspan: "2"
    },
    Ly = {
        colspan: "3"
    },
    Uy = {
        colspan: "2"
    },
    Vy = {
        colspan: "4"
    },
    Fy = {
        class: "concl",
        colspan: "21"
    },
    By = {
        colspan: "3"
    },
    jy = {
        colspan: "3"
    },
    Hy = {
        class: "seal",
        colspan: "6",
        rowspan: "2"
    },
    Ky = {
        class: "seal-d"
    },
    Gy = {
        colspan: "3"
    },
    Wy = {
        class: "compare"
    },
    qy = {
        class: "plate"
    },
    zy = ["src", "alt"],
    Jy = {
        key: 1,
        class: "ph"
    },
    Xy = {
        class: "cap"
    },
    Yy = {
        class: "plate"
    },
    Qy = ["disabled"],
    Zy = {
        class: "kv"
    },
    eb = {
        class: "v"
    },
    tb = {
        class: "v"
    },
    nb = {
        class: "v"
    },
    sb = {
        class: "v"
    },
    lb = {
        class: "v"
    },
    ob = {
        key: 0,
        class: "prelim-tag",
        title: "底片质量未达标，该级别仅由算法预筛得出，不构成验收依据"
    },
    ib = {
        class: "narr"
    },
    ab = {
        key: 0,
        class: "narr-state"
    },
    rb = {
        key: 0,
        class: "narr-text"
    },
    ub = {
        key: 1,
        class: "narr-state"
    },
    cb = {
        key: 2,
        class: "narr-meta"
    },
    db = {
        class: "narr-disc"
    },
    fb = {
        key: 0,
        class: "narr-state"
    },
    vb = {
        class: "a"
    },
    pb = {
        key: 0,
        class: "section-h"
    },
    hb = {
        class: "acts"
    },
    mb = ["disabled"],
    gb = {
        class: "a"
    },
    yb = ["disabled", "title"],
    bb = {
        class: "d"
    },
    _b = {
        class: "modal",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "主动学习样本回流"
    },
    wb = {
        key: 0,
        class: "hint"
    },
    kb = {
        key: 1,
        class: "err show"
    },
    $b = {
        class: "stat"
    },
    Cb = {
        class: "exp"
    },
    Eb = ["onUpdate:modelValue"],
    xb = {
        class: "cid"
    },
    Sb = ["onUpdate:modelValue"],
    Ab = {
        value: -1
    },
    Rb = ["value"],
    Tb = {
        key: 0,
        class: "need"
    },
    Ib = {
        key: 1,
        class: "ok"
    },
    Ob = {
        key: 2
    },
    Pb = {
        class: "m-actions"
    },
    Mb = ["disabled"],
    Nb = {
        key: 0,
        class: "ok-msg"
    },
    Db = {
        key: 1,
        class: "err show"
    },
    Lb = {
        key: 4,
        class: "err show"
    },
    Ub = Fe({
        __name: "ReportView",
        props: {
            result: {},
            sourceUrl: {},
            fileName: {}
        },
        emits: ["archive", "reset"],
        setup(e, {
            emit: t
        }) {
            const n = dl,
                s = e,
                o = t,
                i = xo(),
                a = w(null),
                r = w(!1),
                u = w(null);
            async function c() {
                if (!r.value) {
                    r.value = !0, u.value = null;
                    try {
                        a.value = await uv(s.result.report_id)
                    } catch (se) {
                        u.value = Ae(se)
                    } finally {
                        r.value = !1
                    }
                }
            }

            function d() {
                const se = s.result,
                    b = se.workpiece_no ? `${se.workpiece_no}_${se.report_id}` : se.report_id;
                i.openPdf(se.report_id, b)
            }
            const f = {
                I: "Ⅰ",
                II: "Ⅱ",
                III: "Ⅲ",
                IV: "Ⅳ"
            };

            function m(se) {
                var b;
                return ((b = s.result.report_meta) == null ? void 0 : b[se]) ?? ""
            }

            function _(se) {
                const b = (se ?? "").trim().toUpperCase();
                return f[b] ?? b
            }

            function P(se) {
                const b = (se ?? "").trim().toUpperCase();
                return {
                    I: 1,
                    II: 2,
                    III: 3,
                    IV: 4,
                    "Ⅰ": 1,
                    "Ⅱ": 2,
                    "Ⅲ": 3,
                    "Ⅳ": 4
                } [b] ?? null
            }
            const E = me(() => {
                    const se = (s.result.joint_level ?? "").trim().toUpperCase();
                    return {
                        i: se === "I" ? "1" : "/",
                        ii: se === "II" ? "1" : "/",
                        iii: se === "III" ? "1" : "/",
                        iv: se === "IV" ? "1" : "/",
                        total: se ? "1" : "/"
                    }
                }),
                N = me(() => {
                    const se = s.result;
                    if (se.grade_preliminary && se.joint_level) return [`1、本片影像质量校验未通过（IQI/黑度不达标），不构成正式评定依据；AI 预筛级别为${_(se.joint_level)}级，仅供参考，不得作为验收结论，须由持证人依标准原文重新评定。`];
                    if (!se.evaluable) return ["1、影像质量校验未通过（IQI/黑度不达标），本片不可评片，需人工复核处理。"];
                    const b = se.standard_ref || "验收标准";
                    if (se.joint_level) {
                        const ve = P(se.joint_level),
                            De = P(m("accept_level"));
                        if (ve !== null && De !== null) {
                            const qe = ve <= De;
                            return [`1、本工件（${se.workpiece_no||"—"}）焊缝质量经检测，依据${b}评为${_(se.joint_level)}级，${qe?"满足":"未满足"}验收要求（合格级别${_(m("accept_level"))}级），结果${qe?"合格":"不合格"}。`]
                        }
                        const pe = ve !== null && ve <= 2 ? "合格" : "不合格";
                        return [`1、本工件（${se.workpiece_no||"—"}）焊缝质量经检测，依据${b} 评为${_(se.joint_level)}级，结果${pe}。`]
                    }
                    return ["1、本片暂无法自动评级（置信度不足或未标定），需人工评定。"]
                }),
                M = me(() => {
                    const se = new Date;
                    return `${se.getFullYear()}.${se.getMonth()+1}.${se.getDate()}`
                }),
                L = w(!1),
                K = w(!1),
                I = w(null),
                A = w(null),
                C = w([]),
                T = w(!1),
                x = w(null),
                W = w(null),
                te = me(() => C.value.filter(se => se.checked).length),
                de = me(() => te.value > 0 && !T.value);
            async function B() {
                L.value = !0, K.value = !0, I.value = null, x.value = null, W.value = null;
                try {
                    const se = await Eo(s.result.report_id);
                    A.value = se, C.value = se.defects.map(b => ({
                        id: b.id,
                        class_id: b.class_id,
                        bbox: b.bbox,
                        confidence: b.confidence,
                        uncertainty: b.uncertainty,
                        reviewed: b.reviewed,
                        need_review: b.need_review,
                        checked: !0,
                        override: -1
                    }))
                } catch (se) {
                    I.value = Ae(se)
                } finally {
                    K.value = !1
                }
            }
            async function k() {
                if (!A.value || !de.value) return;
                T.value = !0, W.value = null;
                const se = C.value.filter(b => b.checked);
                try {
                    x.value = await Xf({
                        image_stem: A.value.image_stem,
                        image_w: A.value.image_w,
                        image_h: A.value.image_h,
                        defects: se.map(b => ({
                            id: b.id,
                            class_id: b.override >= 0 ? b.override : b.class_id,
                            bbox: b.bbox,
                            confidence: b.confidence,
                            uncertainty: b.uncertainty
                        })),
                        class_overrides: {}
                    })
                } catch (b) {
                    W.value = Ae(b)
                } finally {
                    T.value = !1
                }
            }

            function $() {
                L.value = !1
            }
            const j = w(!1),
                le = w(null),
                H = w(null),
                ne = me(() => le.value ? le.value.valid === !0 ? "ok" : le.value.valid === !1 ? "bad" : "na" : "");
            async function Ne() {
                j.value = !0, H.value = null;
                try {
                    le.value = await rv(s.result.report_id)
                } catch (se) {
                    H.value = Ae(se)
                } finally {
                    j.value = !1
                }
            }
            return (se, b) => (p(), h("div", null, [b[96] || (b[96] = l("h1", {
                class: "title-zine",
                "data-t": "评片报告"
            }, " 射线检测报告 ", -1)), l("div", Yg, [ee(" 报告编号 " + v(e.result.report_id) + " · 影像编号 " + v(e.result.image_id), 1), e.result.standard_ref ? (p(), h(ue, {
                key: 0
            }, [ee(" · " + v(e.result.standard_ref), 1)], 64)) : V("", !0)]), Re(ug, {
                result: e.result
            }, null, 8, ["result"]), Re(fg, {
                result: e.result
            }, null, 8, ["result"]), Re(Xg, {
                result: e.result
            }, null, 8, ["result"]), b[97] || (b[97] = l("div", {
                class: "section-h"
            }, [l("span", {
                class: "no"
            }, "报告"), ee("报告首页预览（与打印版式一致，空白栏以手工补填为准） ")], -1)), l("div", Qg, [l("div", Zg, " NO:" + v(e.result.report_id), 1), l("table", ey, [l("tbody", null, [l("tr", null, [b[2] || (b[2] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 委托单位 ", -1)), l("td", ty, v(m("client_unit")), 1), b[3] || (b[3] = l("td", {
                class: "lbl",
                colspan: "7"
            }, " 工程类别/检测时机 ", -1)), l("td", ny, v(m("project_category")), 1)]), l("tr", null, [b[4] || (b[4] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 工程名称 ", -1)), l("td", sy, v(m("project_name")), 1), b[5] || (b[5] = l("td", {
                class: "lbl",
                colspan: "7"
            }, " 检测地址 ", -1)), l("td", ly, v(m("test_address")), 1)]), l("tr", null, [b[6] || (b[6] = l("td", {
                class: "sec",
                rowspan: "3"
            }, " 工件概况 ", -1)), b[7] || (b[7] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 工件名称 ", -1)), l("td", oy, v(e.result.workpiece_no ?? ""), 1), b[8] || (b[8] = l("td", {
                class: "lbl",
                colspan: "4"
            }, " 材　　质 ", -1)), l("td", iy, v(m("material")), 1), b[9] || (b[9] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 坡口形式 ", -1)), l("td", ay, v(m("groove_type")), 1)]), l("tr", null, [b[10] || (b[10] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 工件编号 ", -1)), l("td", ry, v(m("part_no")), 1), b[11] || (b[11] = l("td", {
                class: "lbl",
                colspan: "4"
            }, " 规　　格 ", -1)), b[12] || (b[12] = l("td", {
                colspan: "5"
            }, " — ", -1)), b[13] || (b[13] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 表面状况 ", -1)), l("td", uy, v(m("surface_status")), 1)]), l("tr", null, [b[14] || (b[14] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 检测部位 ", -1)), b[15] || (b[15] = l("td", {
                colspan: "3"
            }, " 焊接接头 ", -1)), b[16] || (b[16] = l("td", {
                class: "lbl",
                colspan: "4"
            }, " 焊接方式 ", -1)), l("td", cy, v(m("weld_process")), 1), b[17] || (b[17] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 热处理状态 ", -1)), l("td", dy, v(m("heat_treatment")), 1)]), l("tr", null, [b[18] || (b[18] = l("td", {
                class: "sec",
                rowspan: "3"
            }, " 技术要求 ", -1)), b[19] || (b[19] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 验收标准 ", -1)), l("td", fy, v(e.result.standard_ref ?? ""), 1), b[20] || (b[20] = l("td", {
                class: "lbl",
                colspan: "4"
            }, " 检测标准 ", -1)), l("td", vy, v(e.result.standard_ref ?? ""), 1), b[21] || (b[21] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 检测比例 ", -1)), b[22] || (b[22] = l("td", {
                colspan: "2"
            }, " 100% ", -1))]), l("tr", null, [b[23] || (b[23] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 检测技术等级 ", -1)), l("td", py, v(m("tech_level")), 1), b[24] || (b[24] = l("td", {
                class: "lbl",
                colspan: "4"
            }, " 合格级别 ", -1)), l("td", hy, v(m("accept_level")), 1), b[25] || (b[25] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 原始记录编号 ", -1)), l("td", my, v(m("record_no")), 1)]), l("tr", null, [b[26] || (b[26] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 黑度范围 ", -1)), b[27] || (b[27] = l("td", {
                colspan: "3"
            }, " — ", -1)), b[28] || (b[28] = l("td", {
                class: "lbl",
                colspan: "4"
            }, " 应识别丝号 ", -1)), b[29] || (b[29] = l("td", {
                colspan: "5"
            }, " — ", -1)), b[30] || (b[30] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 散射线控制 ", -1)), l("td", gy, v(m("scatter_control")), 1)]), l("tr", null, [b[31] || (b[31] = l("td", {
                class: "sec",
                rowspan: "7"
            }, " 检测器材及工艺参数 ", -1)), b[32] || (b[32] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 源种类 ", -1)), l("td", yy, v(m("source_kind")), 1), b[33] || (b[33] = l("td", {
                class: "lbl",
                colspan: "4"
            }, " 设备型号/编号 ", -1)), l("td", by, v(m("device_no")), 1), b[34] || (b[34] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 焦点尺寸 ", -1)), l("td", _y, v(m("focus_size")), 1)]), l("tr", null, [b[35] || (b[35] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 胶片型号 ", -1)), l("td", wy, v(m("film_model")), 1), b[36] || (b[36] = l("td", {
                class: "lbl",
                colspan: "4"
            }, " 胶片规格 ", -1)), l("td", ky, v(m("film_size")), 1), b[37] || (b[37] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 胶片分类等级 ", -1)), l("td", $y, v(m("film_class")), 1)]), l("tr", null, [b[38] || (b[38] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 增感方式 ", -1)), l("td", Cy, v(m("screen_way")), 1), b[39] || (b[39] = l("td", {
                class: "lbl",
                colspan: "4"
            }, " 像质计型号 ", -1)), b[40] || (b[40] = l("td", {
                colspan: "5"
            }, " — ", -1)), b[41] || (b[41] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 像质计摆放 ", -1)), l("td", Ey, v(m("iqi_position")), 1)]), l("tr", null, [b[42] || (b[42] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 前屏/后屏 ", -1)), l("td", xy, v(m("screens")), 1), b[43] || (b[43] = l("td", {
                class: "lbl",
                colspan: "4"
            }, " 透照方式 ", -1)), l("td", Sy, v(m("technique")), 1), b[44] || (b[44] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 透照厚度 ", -1)), b[45] || (b[45] = l("td", {
                colspan: "2"
            }, " — ", -1))]), l("tr", null, [b[46] || (b[46] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " F（焦距） ", -1)), l("td", Ay, v(m("focus_distance")), 1), b[47] || (b[47] = l("td", {
                class: "lbl",
                colspan: "4"
            }, " f（源至工件） ", -1)), l("td", Ry, v(m("source_distance")), 1), b[48] || (b[48] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 冲洗条件 ", -1)), l("td", Ty, v(m("develop_method")), 1)]), l("tr", null, [b[49] || (b[49] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " b（工件至胶片） ", -1)), l("td", Iy, v(m("film_distance")), 1), b[50] || (b[50] = l("td", {
                class: "lbl",
                colspan: "4"
            }, " 管电压 ", -1)), l("td", Oy, v(m("tube_voltage")), 1), b[51] || (b[51] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 显影液配方 ", -1)), l("td", Py, v(m("developer")), 1)]), l("tr", null, [b[52] || (b[52] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 管电流 ", -1)), l("td", My, v(m("tube_current")), 1), b[53] || (b[53] = l("td", {
                class: "lbl",
                colspan: "4"
            }, " 曝光时间 ", -1)), l("td", Ny, v(m("exposure_time")), 1), b[54] || (b[54] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 洗片温度 ", -1)), l("td", Dy, v(m("develop_temp")), 1)]), b[74] || (b[74] = l("tr", null, [l("td", {
                class: "sec",
                rowspan: "3"
            }, " 检测情况 "), l("td", {
                class: "lbl",
                colspan: "3"
            }, " 焊缝总数 "), l("td", {
                colspan: "3"
            }, " 1道 "), l("td", {
                class: "sec2",
                rowspan: "3"
            }, " 最终评定结果 "), l("td", {
                class: "lbl",
                colspan: "3",
                rowspan: "2"
            }, " Ｉ级（张） "), l("td", {
                class: "lbl",
                colspan: "2",
                rowspan: "2"
            }, " Ⅱ级（张） "), l("td", {
                class: "lbl",
                rowspan: "2"
            }, " Ⅲ级（张） "), l("td", {
                class: "lbl",
                colspan: "4",
                rowspan: "2"
            }, " Ⅳ级（张） "), l("td", {
                class: "lbl",
                rowspan: "2"
            }, " 总计（张） "), l("td", {
                class: "lbl",
                rowspan: "2"
            }, " 返修数量（张） "), l("td", {
                class: "lbl",
                rowspan: "2"
            }, " 最高返修次数（次） ")], -1)), b[75] || (b[75] = l("tr", null, [l("td", {
                class: "lbl",
                colspan: "3"
            }, " 检测数量 "), l("td", {
                colspan: "3"
            }, " 1道 ")], -1)), l("tr", null, [b[55] || (b[55] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 检测比例 ", -1)), b[56] || (b[56] = l("td", {
                colspan: "3"
            }, " 100% ", -1)), l("td", Ly, v(E.value.i), 1), l("td", Uy, v(E.value.ii), 1), l("td", null, v(E.value.iii), 1), l("td", Vy, v(E.value.iv), 1), l("td", null, v(E.value.total), 1), b[57] || (b[57] = l("td", null, " / ", -1)), b[58] || (b[58] = l("td", null, " / ", -1))]), l("tr", null, [l("td", Fy, [b[59] || (b[59] = l("div", {
                class: "c-head"
            }, " 检测结论及说明： ", -1)), (p(!0), h(ue, null, Oe(N.value, ve => (p(), h("div", {
                key: ve,
                class: "c-line"
            }, v(ve), 1))), 128)), b[60] || (b[60] = l("div", {
                class: "c-line"
            }, " 2、检测位置，返修部位，底片评定情况见射线检测位置示意图和底片评定表。 ", -1)), b[61] || (b[61] = l("div", {
                class: "c-line"
            }, " 3、缺陷代号 ", -1)), b[62] || (b[62] = l("div", {
                class: "c-line"
            }, " A裂纹、B未焊透、C未熔合、D圆形缺陷（气孔、夹渣、夹钨、夹铜等）、E条形缺陷、F内凹、G咬边 ", -1)), b[63] || (b[63] = l("div", {
                class: "c-line"
            }, " 4、本报告为AI辅助评定，级别须经责任工程师复核签核后方可采信。 ", -1))])]), l("tr", null, [b[65] || (b[65] = l("td", {
                class: "lbl",
                colspan: "2"
            }, " 检　测 ", -1)), l("td", By, v(e.result.signer ?? ""), 1), b[66] || (b[66] = l("td", {
                class: "lbl"
            }, " 资　格 ", -1)), b[67] || (b[67] = l("td", {
                colspan: "3"
            }, " — ", -1)), b[68] || (b[68] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 日　期 ", -1)), l("td", jy, v(M.value), 1), l("td", Hy, [b[64] || (b[64] = l("div", {
                class: "seal-t"
            }, " 检测单位检测专用章 ", -1)), l("div", Ky, " 日期：" + v(M.value), 1)])]), l("tr", null, [b[69] || (b[69] = l("td", {
                class: "lbl",
                colspan: "2"
            }, " 审　核 ", -1)), b[70] || (b[70] = l("td", {
                colspan: "3"
            }, null, -1)), b[71] || (b[71] = l("td", {
                class: "lbl"
            }, " 资　格 ", -1)), b[72] || (b[72] = l("td", {
                colspan: "3"
            }, " — ", -1)), b[73] || (b[73] = l("td", {
                class: "lbl",
                colspan: "3"
            }, " 日　期 ", -1)), l("td", Gy, v(M.value), 1)])])])]), b[98] || (b[98] = l("div", {
                class: "section-h"
            }, [l("span", {
                class: "no"
            }, "影像"), ee("送检原始底片（用户导入原图，未经标注） ")], -1)), l("div", Wy, [l("div", qy, [e.sourceUrl ? (p(), h("img", {
                key: 0,
                src: e.sourceUrl,
                alt: e.fileName ?? "导入影像"
            }, null, 8, zy)) : (p(), h("span", Jy, "影像不可用")), l("div", Xy, v(e.fileName ?? "导入文件") + " · 未标注 ", 1)]), l("div", Yy, [l("button", {
                type: "button",
                class: "plate-btn",
                disabled: ye(i).gateBusy.value,
                style: {
                    display: "block",
                    width: "100%",
                    border: "0",
                    background: "transparent",
                    padding: "0",
                    cursor: "pointer",
                    color: "inherit",
                    "font-family": "inherit"
                },
                title: "打开 PDF/A 归档报告（经受控导出通道）",
                onClick: d
            }, [...b[76] || (b[76] = [l("span", {
                class: "ph",
                style: {
                    display: "grid",
                    "place-items": "center",
                    "min-height": "160px",
                    color: "var(--accent)",
                    "font-size": "11px"
                }
            }, " 缺陷标注影像详见 PDF 报告 → ", -1), l("div", {
                class: "cap"
            }, " 打开 PDF/A 归档报告（含缺陷标注与检出明细） ", -1)])], 8, Qy)])]), b[99] || (b[99] = l("div", {
                class: "section-h"
            }, [l("span", {
                class: "no"
            }, "结果"), ee("本次评定结果 ")], -1)), l("div", Zy, [b[77] || (b[77] = l("div", {
                class: "k"
            }, " 报告编号 ", -1)), l("div", eb, v(e.result.report_id), 1), b[78] || (b[78] = l("div", {
                class: "k"
            }, " 影像编号 ", -1)), l("div", tb, v(e.result.image_id), 1), b[79] || (b[79] = l("div", {
                class: "k"
            }, " 缺陷检出数 ", -1)), l("div", nb, v(e.result.defect_count) + " 处 ", 1), b[80] || (b[80] = l("div", {
                class: "k"
            }, " 评片质量判定 ", -1)), l("div", sb, v(e.result.evaluable ? "底片质量合格，可评定" : "不可评片（底片质量不满足评定要求）"), 1), b[81] || (b[81] = l("div", {
                class: "k"
            }, " 质量级别（综合评定） ", -1)), l("div", lb, [ee(v(e.result.joint_level ?? "（待复核/未输出）") + " ", 1), e.result.grade_preliminary ? (p(), h("span", ob, "AI 预筛·非正式级别")) : V("", !0)])]), b[100] || (b[100] = l("div", {
                class: "section-h"
            }, [l("span", {
                class: "no"
            }, "AI"), ee("评片结论（本地大模型辅助撰述） ")], -1)), l("div", ib, [r.value ? (p(), h("div", ab, " 本地大模型生成中… ")) : a.value ? (p(), h(ue, {
                key: 1
            }, [a.value.status === "ok" ? (p(), h("p", rb, v(a.value.text), 1)) : (p(), h("p", ub, " AI 结论不可用：" + v(a.value.reason), 1)), a.value.status === "ok" ? (p(), h("div", cb, " 模型 " + v(a.value.model || "—") + " · 生成耗时 " + v((a.value.elapsed_ms / 1e3).toFixed(1)) + "s ", 1)) : V("", !0), l("p", db, v(a.value.disclaimer), 1)], 64)) : (p(), h(ue, {
                key: 2
            }, [u.value ? (p(), h("p", fb, " 生成失败：" + v(u.value), 1)) : V("", !0), l("button", {
                class: "act narr-btn",
                type: "button",
                onClick: c
            }, [l("div", vb, v(u.value ? "重试生成评片结论" : "生成评片结论"), 1), b[82] || (b[82] = l("div", {
                class: "d"
            }, " 由本机部署的本地大模型把检测结果与门禁结论整理成可读结论（不参与评级） ", -1))])], 64))]), e.result.need_review ? (p(), h("div", pb, [...b[83] || (b[83] = [l("span", {
                class: "no"
            }, "复核", -1), ee("人工复核（初评 / 复评 / 仲裁） ", -1)])])) : V("", !0), e.result.need_review ? (p(), Wt(Gg, {
                key: 1,
                "image-id": e.result.image_id,
                "report-id": e.result.report_id
            }, null, 8, ["image-id", "report-id"])) : V("", !0), b[101] || (b[101] = l("div", {
                class: "section-h"
            }, [l("span", {
                class: "no"
            }, "处置"), ee("后续操作 ")], -1)), l("div", hb, [l("button", {
                class: "act",
                type: "button",
                onClick: d
            }, [...b[84] || (b[84] = [l("div", {
                class: "a"
            }, " 导出 PDF/A 报告 ", -1), l("div", {
                class: "d"
            }, " 下载符合归档要求的检测报告（含缺陷标注、判定依据与检出明细） ", -1)])]), l("button", {
                class: "act",
                type: "button",
                onClick: b[0] || (b[0] = ve => o("archive"))
            }, [...b[85] || (b[85] = [l("div", {
                class: "a"
            }, " 查阅检测档案 ", -1), l("div", {
                class: "d"
            }, " 在检测档案中查看该影像的归档记录与统计信息 ", -1)])]), l("button", {
                class: "act",
                type: "button",
                onClick: b[1] || (b[1] = ve => o("reset"))
            }, [...b[86] || (b[86] = [l("div", {
                class: "a"
            }, " 新建评定任务 ", -1), l("div", {
                class: "d"
            }, " 返回底片导入步骤，提交下一份待检底片 ", -1)])]), l("button", {
                class: "act",
                type: "button",
                disabled: j.value,
                onClick: Ne
            }, [l("div", gb, v(j.value ? "校验中…" : "校验报告数字签名"), 1), b[87] || (b[87] = l("div", {
                class: "d"
            }, " 比对报告内容指纹与签发记录，验证报告完整性与防篡改性（§7.2） ", -1))], 8, mb), l("button", {
                class: "act",
                type: "button",
                disabled: e.result.defect_count === 0,
                title: e.result.defect_count === 0 ? "本片未检出缺陷，没有可回流的样本" : void 0,
                onClick: B
            }, [b[88] || (b[88] = l("div", {
                class: "a"
            }, " 样本回流（主动学习） ", -1)), l("div", bb, v(e.result.defect_count === 0 ? "本片未检出缺陷，无可回流样本（该按钮不可用）" : "经人工复核确认的缺陷标注回流至主动学习训练样本库（§5.5 持续学习闭环）"), 1)], 8, yb)]), L.value ? (p(), h("div", {
                key: 2,
                class: "modal-mask",
                onClick: Je($, ["self"])
            }, [l("div", _b, [b[95] || (b[95] = l("h3", {
                class: "m-title"
            }, " 主动学习样本回流 · 人工确认 ", -1)), K.value ? (p(), h("p", wb, " 正在载入缺陷检出明细… ")) : I.value ? (p(), h("p", kb, " ⚠ 载入失败：" + v(I.value), 1)) : A.value ? (p(), h(ue, {
                key: 2
            }, [l("p", $b, [b[89] || (b[89] = ee(" 影像 ", -1)), l("b", null, v(A.value.image_stem), 1), ee(" · " + v(A.value.image_w) + "×" + v(A.value.image_h) + "px · 共检出 " + v(A.value.defects.length) + " 处缺陷。请勾选需回流的样本，必要时对类别进行人工改判后确认。 ", 1)]), l("table", Cb, [b[90] || (b[90] = l("thead", null, [l("tr", null, [l("th", null, "回流"), l("th", null, "检出类别"), l("th", null, "人工改判"), l("th", null, "置信度"), l("th", null, "不确定度"), l("th", null, "复核状态")])], -1)), l("tbody", null, [(p(!0), h(ue, null, Oe(C.value, ve => (p(), h("tr", {
                key: ve.id
            }, [l("td", null, [he(l("input", {
                "onUpdate:modelValue": De => ve.checked = De,
                type: "checkbox"
            }, null, 8, Eb), [
                [kn, ve.checked]
            ])]), l("td", null, [ee(v(ye(n)[ve.class_id]) + " ", 1), l("span", xb, "(" + v(ve.class_id) + ")", 1)]), l("td", null, [he(l("select", {
                "onUpdate:modelValue": De => ve.override = De,
                class: "ov"
            }, [l("option", Ab, " 维持原判（" + v(ye(n)[ve.class_id]) + "） ", 1), (p(!0), h(ue, null, Oe(ye(n), (De, pe) => (p(), h("option", {
                key: pe,
                value: pe
            }, v(De), 9, Rb))), 128))], 8, Sb), [
                [pt, ve.override, void 0, {
                    number: !0
                }]
            ])]), l("td", null, v((ve.confidence * 100).toFixed(0)) + "%", 1), l("td", null, [l("span", {
                class: we(ve.uncertainty >= .5 ? "warn" : "")
            }, v((ve.uncertainty * 100).toFixed(0)) + "%", 3)]), l("td", null, [ve.need_review ? (p(), h("span", Tb, "待复核")) : ve.reviewed ? (p(), h("span", Ib, "已复核")) : (p(), h("span", Ob, "—"))])]))), 128))])]), l("div", Pb, [l("button", {
                class: "btn primary",
                type: "button",
                disabled: !de.value,
                onClick: k
            }, v(T.value ? "回流中…" : `确认回流（${te.value} 项）`), 9, Mb), l("button", {
                class: "btn ghost",
                type: "button",
                onClick: $
            }, " 关闭 ")]), b[94] || (b[94] = l("p", {
                class: "threshold-legend"
            }, [ee(" 判读口径：不确定度 ≥ "), l("b", null, "50%"), ee(" 的检出（橙色）表示模型对该判定把握较低， 建议优先人工复核后再回流；置信度为该缺陷框的检出把握，仅作参考，不构成级别结论。 ")], -1)), x.value ? (p(), h("div", Nb, [b[91] || (b[91] = ee(" ✓ 已回流至主动学习训练样本库，当前共 ", -1)), l("b", null, v(x.value.total_in_pool), 1), b[92] || (b[92] = ee(" 个样本（数据集版本指纹 ", -1)), l("code", null, v(x.value.fingerprint ?? "—"), 1), b[93] || (b[93] = ee("） ", -1))])) : V("", !0), W.value ? (p(), h("div", Db, " ⚠ 回流失败：" + v(W.value), 1)) : V("", !0)], 64)) : V("", !0)])])) : V("", !0), le.value ? (p(), h("div", {
                key: 3,
                class: we(["sig-state", ne.value])
            }, [le.value.valid === !0 ? (p(), h(ue, {
                key: 0
            }, [ee(" ✓ 数字签名校验通过（签发者：" + v(le.value.signer ?? "—") + "） ", 1)], 64)) : le.value.valid === !1 ? (p(), h(ue, {
                key: 1
            }, [ee(" ⚠ 数字签名无效或报告内容已被篡改（" + v(le.value.reason ?? "内容指纹不匹配") + "） ", 1)], 64)) : (p(), h(ue, {
                key: 2
            }, [ee(" — 本报告未附数字签名（" + v(le.value.reason ?? "无签发记录") + "） ", 1)], 64))], 2)) : V("", !0), H.value ? (p(), h("div", Lb, " ⚠ 签名校验请求失败：" + v(H.value), 1)) : V("", !0), b[102] || (b[102] = l("div", {
                class: "sig"
            }, " 评片人签署：____________　声明：本报告由系统自动生成，仅供质量追溯参考；状态为「待人工复核」或「不可评片」时，不作为正式评片结论依据。 ", -1)), Re(So, {
                ctrl: ye(i)
            }, null, 8, ["ctrl"])]))
        }
    }),
    Vb = We(Ub, [
        ["__scopeId", "data-v-27450919"]
    ]),
    Fb = {
        key: 0
    },
    Bb = {
        key: 1
    },
    jb = Fe({
        __name: "JourneyView",
        emits: ["archive"],
        setup(e, {
            emit: t
        }) {
            const n = t,
                s = To(),
                o = w(null),
                {
                    phase: i,
                    sourceUrl: a,
                    file: r,
                    elapsedMs: u,
                    error: c,
                    result: d,
                    setFile: f,
                    submit: m,
                    backToUpload: _,
                    reset: P
                } = h1(),
                E = me(() => i.value === "upload" ? 1 : i.value === "processing" ? 2 : 3);

            function N(I) {
                f(I), I && s.add([I])
            }

            function M(I) {
                m(I)
            }

            function L() {
                _()
            }

            function K() {
                var I;
                P(), (I = o.value) == null || I.reset()
            }
            return (I, A) => {
                var C;
                return p(), h("div", null, [Re(y1, {
                    current: E.value
                }, null, 8, ["current"]), he(l("div", null, [A[1] || (A[1] = l("h1", {
                    class: "title-zine",
                    "data-t": "开始一次检测"
                }, " 新建单幅评定任务 ", -1)), A[2] || (A[2] = l("div", {
                    class: "lede"
                }, " 导入射线底片 → 本地推理流水线评定 → 签发评片报告（数据全程本地化处理） ", -1)), Re(G1, {
                    ref_key: "uploadPanel",
                    ref: o,
                    onFileChanged: N,
                    onSubmit: M
                }, null, 512)], 512), [
                    [Xc, ye(i) === "upload"]
                ]), ye(i) === "processing" ? (p(), h("div", Fb, [A[3] || (A[3] = l("h1", {
                    class: "title-zine",
                    "data-t": "正在处理"
                }, " 自动评定进行中 ", -1)), A[4] || (A[4] = l("div", {
                    class: "lede"
                }, " 底片已提交至本地推理流水线，正在执行缺陷检出与标准符合性评定 ", -1)), Re(Xi, {
                    status: "running",
                    "elapsed-ms": ye(u),
                    "error-message": null
                }, null, 8, ["elapsed-ms"])])) : ye(i) === "result" && ye(c) !== null ? (p(), h("div", Bb, [A[5] || (A[5] = l("h1", {
                    class: "title-zine",
                    "data-t": "处理失败"
                }, " 评定任务失败 ", -1)), A[6] || (A[6] = l("div", {
                    class: "lede"
                }, " 本次评定未完成；已选底片与参数仍保留，可修改后重新提交 ", -1)), Re(Xi, {
                    status: "error",
                    "elapsed-ms": ye(u),
                    "error-message": ye(c),
                    onRetry: L
                }, null, 8, ["elapsed-ms", "error-message"])])) : ye(i) === "result" && ye(d) !== null ? (p(), Wt(Vb, {
                    key: 2,
                    result: ye(d),
                    "source-url": ye(a),
                    "file-name": ((C = ye(r)) == null ? void 0 : C.name) ?? null,
                    onArchive: A[0] || (A[0] = T => n("archive")),
                    onReset: K
                }, null, 8, ["result", "source-url", "file-name"])) : V("", !0)])
            }
        }
    });
async function Vr(e) {
    var t;
    try {
        if ((t = navigator.clipboard) != null && t.writeText) return await navigator.clipboard.writeText(e), !0
    } catch {}
    try {
        const n = document.createElement("textarea");
        n.value = e, n.style.position = "fixed", n.style.opacity = "0", document.body.appendChild(n), n.select();
        const s = document.execCommand("copy");
        return n.remove(), s
    } catch {
        return !1
    }
}
const Hb = {
        class: "login-wrap"
    },
    Kb = {
        key: 0,
        class: "notice",
        role: "alert"
    },
    Gb = {
        class: "field"
    },
    Wb = {
        class: "field"
    },
    qb = {
        key: 1,
        class: "hint"
    },
    zb = ["disabled"],
    Jb = {
        key: 3,
        class: "error",
        role: "alert"
    },
    Xb = ["open"],
    Yb = {
        class: "field"
    },
    Qb = {
        class: "field"
    },
    Zb = ["disabled"],
    e_ = {
        class: "warn"
    },
    t_ = {
        key: 0,
        class: "copy-ok"
    },
    n_ = {
        key: 1,
        class: "copy-fail"
    },
    s_ = ["value"],
    l_ = Fe({
        __name: "LoginView",
        setup(e) {
            const t = ys(),
                n = an(),
                s = w(""),
                o = w(""),
                i = w(""),
                a = w(!1),
                r = w(""),
                u = w(!1),
                c = w(""),
                d = w("sysadmin"),
                f = w(""),
                m = w(!0),
                _ = w(null);
            dt(async () => {
                const A = jv();
                A === "idle" ? _.value = "因长时间无操作，会话已自动退出，请重新登录。" : A === "expired" && (_.value = "登录状态已过期，请重新登录。");
                try {
                    const C = await Tv();
                    m.value = C.guest_mode, C.needs_bootstrap && (u.value = !0)
                } catch {}
            });
            async function P(A) {
                var x;
                const T = (x = A.target.files) == null ? void 0 : x[0];
                T && (i.value = T.name, o.value = (await T.text()).trim())
            }

            function E() {
                t.push("/journey")
            }

            function N() {
                n.enterGuest(), t.push("/journey")
            }
            async function M() {
                if (r.value = "", !s.value.trim()) {
                    r.value = "请输入账号名";
                    return
                }
                if (!o.value) {
                    r.value = "请选择私钥证书文件（管理员签发的 .key / .pem 文本）";
                    return
                }
                a.value = !0;
                try {
                    await n.login(s.value.trim(), o.value), E()
                } catch (A) {
                    r.value = A instanceof Ye ? A.message : "鉴权失败，请重试"
                } finally {
                    a.value = !1
                }
            }
            async function L() {
                if (r.value = "", !c.value.trim()) {
                    r.value = "请输入初始化账号名";
                    return
                }
                a.value = !0;
                try {
                    const A = await Cv({
                        username: c.value.trim(),
                        role: d.value
                    });
                    f.value = A.private_key ?? "", s.value = A.username
                } catch (A) {
                    r.value = A instanceof Ye ? A.message : "账号初始化失败"
                } finally {
                    a.value = !1
                }
            }
            const K = w("");
            async function I() {
                K.value = await Vr(f.value) ? "ok" : "fail"
            }
            return (A, C) => (p(), h("div", Hb, [l("form", {
                class: "login-card",
                onSubmit: Je(M, ["prevent"])
            }, [C[12] || (C[12] = l("h1", {
                class: "title"
            }, " 射线焊缝缺陷智能检测系统 ", -1)), C[13] || (C[13] = l("p", {
                class: "subtitle"
            }, " 三员分岗身份认证（SM2 挑战—响应协议） ", -1)), _.value ? (p(), h("p", Kb, v(_.value), 1)) : V("", !0), l("label", Gb, [C[5] || (C[5] = l("span", null, "账号名", -1)), he(l("input", {
                "onUpdate:modelValue": C[0] || (C[0] = T => s.value = T),
                type: "text",
                autocomplete: "username",
                placeholder: "系统管理员 / 保密管理员 / 审计员 账号"
            }, null, 512), [
                [Ee, s.value]
            ])]), l("label", Wb, [C[6] || (C[6] = l("span", null, "SM2 私钥证书文件", -1)), l("input", {
                type: "file",
                accept: ".key,.pem,.txt,.json",
                onChange: P
            }, null, 32)]), i.value ? (p(), h("p", qb, " 已选择：" + v(i.value), 1)) : V("", !0), l("button", {
                class: "primary",
                type: "submit",
                disabled: a.value
            }, v(a.value ? "正在鉴权…" : "登 录"), 9, zb), m.value ? (p(), h("button", {
                key: 2,
                class: "guest",
                type: "button",
                onClick: N
            }, " 访客模式（免鉴权进入，操作以访客身份审计） ")) : V("", !0), r.value ? (p(), h("p", Jb, v(r.value), 1)) : V("", !0), l("details", {
                class: "boot",
                open: u.value,
                onToggle: C[4] || (C[4] = T => u.value = T.target.open)
            }, [C[11] || (C[11] = l("summary", null, "首次部署？初始化系统账号（引导窗口）", -1)), f.value ? (p(), h(ue, {
                key: 1
            }, [l("p", e_, [C[10] || (C[10] = ee(" 请立即妥善保存私钥（仅此一次展示，系统不留存副本）： ", -1)), l("button", {
                type: "button",
                onClick: I
            }, " 复制私钥 "), K.value === "ok" ? (p(), h("span", t_, "✓ 已复制到剪贴板")) : K.value === "fail" ? (p(), h("span", n_, "复制失败，请直接在下方文本框手动全选复制——关闭页面后将无法再次查看")) : V("", !0)]), l("textarea", {
                class: "keyout",
                readonly: "",
                value: f.value,
                rows: "3",
                onFocus: C[3] || (C[3] = T => T.target.select())
            }, null, 40, s_)], 64)) : (p(), h(ue, {
                key: 0
            }, [l("label", Yb, [C[7] || (C[7] = l("span", null, "初始化账号名", -1)), he(l("input", {
                "onUpdate:modelValue": C[1] || (C[1] = T => c.value = T),
                type: "text"
            }, null, 512), [
                [Ee, c.value]
            ])]), l("label", Qb, [C[9] || (C[9] = l("span", null, "岗位角色（一人一岗，三员分立）", -1)), he(l("select", {
                "onUpdate:modelValue": C[2] || (C[2] = T => d.value = T)
            }, [...C[8] || (C[8] = [l("option", {
                value: "sysadmin"
            }, "系统管理员", -1), l("option", {
                value: "secadmin"
            }, "安全保密管理员", -1), l("option", {
                value: "auditor"
            }, "安全审计员", -1)])], 512), [
                [pt, d.value]
            ])]), l("button", {
                type: "button",
                disabled: a.value,
                onClick: L
            }, " 创建账号并签发 SM2 软证书 ", 8, Zb)], 64))], 40, Xb)], 32)]))
        }
    }),
    Fr = We(l_, [
        ["__scopeId", "data-v-1dba145d"]
    ]),
    o_ = {
        class: "panel"
    },
    i_ = {
        class: "row"
    },
    a_ = {
        class: "field"
    },
    r_ = {
        class: "field"
    },
    u_ = {
        class: "field"
    },
    c_ = {
        class: "field"
    },
    d_ = {
        key: 0,
        class: "plist"
    },
    f_ = ["onClick"],
    v_ = ["onClick"],
    p_ = {
        key: 1,
        class: "err show"
    },
    h_ = ["disabled"],
    m_ = {
        key: 2,
        class: "ok show"
    },
    g_ = {
        class: "panel"
    },
    y_ = {
        class: "row"
    },
    b_ = {
        class: "field grow"
    },
    __ = {
        class: "field"
    },
    w_ = {
        class: "field"
    },
    k_ = {
        class: "row"
    },
    $_ = {
        class: "field"
    },
    C_ = {
        class: "field"
    },
    E_ = {
        class: "field"
    },
    x_ = {
        class: "field"
    },
    S_ = ["disabled"],
    A_ = ["href"],
    R_ = {
        key: 1,
        class: "hint"
    },
    T_ = {
        class: "panel"
    },
    I_ = {
        class: "dtable"
    },
    O_ = {
        colspan: "3"
    },
    P_ = {
        key: 0
    },
    M_ = {
        colspan: "3"
    },
    N_ = {
        colspan: "3"
    },
    D_ = {
        key: 0,
        class: "err show"
    },
    L_ = {
        class: "panel"
    },
    U_ = {
        key: 0,
        class: "err show"
    },
    V_ = {
        key: 1,
        class: "hint"
    },
    F_ = ["viewBox"],
    B_ = ["y1", "x2", "y2"],
    j_ = ["x", "y"],
    H_ = ["d"],
    K_ = ["d"],
    G_ = ["d"],
    W_ = ["x", "y"],
    q_ = ["x", "y"],
    z_ = {
        class: "legend"
    },
    J_ = {
        class: "key"
    },
    X_ = {
        key: 1,
        class: "ok show"
    },
    Y_ = {
        key: 2,
        class: "err show"
    },
    Tl = 720,
    Il = 240,
    Gn = 44,
    Yi = 16,
    Ol = 28,
    Q_ = 46,
    Z_ = Fe({
        __name: "StdEvalView",
        setup(e) {
            const t = w(null),
                n = w([]),
                s = w([]),
                o = w([]),
                i = w(!1),
                a = w(null),
                r = w(null),
                u = w("std_record"),
                c = w(null),
                d = w(null),
                f = me(() => c.value !== null && d.value !== null && u.value.trim() !== d.value),
                m = w("承压设备射线检测缺陷自动识别系统"),
                _ = w(""),
                P = w(""),
                E = w("RT"),
                N = w(""),
                M = w("single"),
                L = w("manual"),
                K = w(""),
                I = w(""),
                A = w("labeler"),
                C = w(""),
                T = w("");
            async function x() {
                try {
                    const J = await vv();
                    t.value = J.qualified, n.value = J.issues, s.value = J.evaluators, o.value = J.labelers
                } catch (J) {
                    r.value = Ae(J)
                }
            }

            function W() {
                return [...s.value, ...o.value].map(J => ({
                    name: J.name,
                    cert_type: J.cert_type,
                    role: J.role,
                    cert_no: J.cert_no ?? "",
                    valid_until: J.valid_until ?? ""
                }))
            }

            function te() {
                if (r.value = null, !K.value.trim() || !I.value.trim()) {
                    r.value = "姓名与持证类型必填（如 张三 / RT(D)-II）。";
                    return
                }
                const J = {
                    name: K.value.trim(),
                    cert_type: I.value.trim(),
                    role: A.value,
                    cert_no: C.value.trim(),
                    valid_until: T.value.trim()
                };
                A.value === "evaluator" ? s.value = [...s.value, J] : o.value = [...o.value, J], K.value = "", I.value = "", C.value = "", T.value = ""
            }
            const de = w(null);

            function B(J, D) {
                var g;
                const y = J === "evaluator" ? s.value : o.value;
                de.value = {
                    role: J,
                    idx: D,
                    name: ((g = y[D]) == null ? void 0 : g.name) ?? ""
                }
            }

            function k() {
                const J = de.value;
                J && (J.role === "evaluator" ? s.value = s.value.filter((D, y) => y !== J.idx) : o.value = o.value.filter((D, y) => y !== J.idx), de.value = null, a.value = "已从列表移除；如需生效到已保存的资质档案，请点击「保存并校验资质」。")
            }
            async function $() {
                i.value = !0, r.value = null, a.value = null;
                try {
                    const J = await pv(W());
                    t.value = J.qualified, n.value = J.issues, a.value = J.qualified ? "资质校验通过。" : "已保存，但存在资质问题（详见下方列表）。"
                } catch (J) {
                    r.value = Ae(J)
                } finally {
                    i.value = !1
                }
            }
            async function j() {
                i.value = !0, r.value = null, a.value = null;
                try {
                    c.value = await hv({
                        system_name: m.value.trim() || "承压设备射线检测缺陷自动识别系统",
                        system_version: _.value.trim(),
                        developer: P.value.trim(),
                        film_kind: E.value,
                        exposure_layout: N.value.trim(),
                        weld_form: M.value,
                        weld_method: L.value,
                        record_name: u.value.trim() || "std_record"
                    }), d.value = u.value.trim() || "std_record", a.value = c.value.grading.official ? "附录 A 记录表已生成（正式分级结论）。" : "附录 A 记录表已生成（人员资质或 FRR 未满足要求，分级数据仅作参考）。"
                } catch (J) {
                    r.value = Ae(J)
                } finally {
                    i.value = !1
                }
            }
            const le = J => `${(J*100).toFixed(2)}%`,
                H = w([]),
                ne = w(null);
            async function Ne() {
                try {
                    const J = await gv();
                    H.value = [...J.items].reverse()
                } catch (J) {
                    ne.value = Ae(J)
                }
            }
            dt(() => {
                x(), Ne()
            });
            const se = me(() => H.value.map((J, D) => ({
                item: J,
                idx: D
            })).filter(({
                item: J
            }) => J.tdr != null || J.wdr != null || J.frr != null));

            function b(J, D) {
                return D <= 1 ? Gn : Gn + J * (Tl - Gn - Yi) / (D - 1)
            }

            function ve(J) {
                return Ol + (1 - J) * (Il - Ol - Q_)
            }

            function De(J) {
                const D = H.value.length;
                if (D === 0) return "";
                let y = "",
                    g = !1;
                return se.value.forEach(({
                    item: R,
                    idx: F
                }) => {
                    const Y = R[J];
                    if (Y == null) {
                        g = !1;
                        return
                    }
                    y += `${g?"L":"M"}${b(F,D).toFixed(1)},${ve(Y).toFixed(1)} `, g = !0
                }), y.trim()
            }
            const pe = me(() => De("tdr")),
                qe = me(() => De("wdr")),
                Ge = me(() => De("frr")),
                z = me(() => [0, .25, .5, .75, 1].map(J => ({
                    v: J,
                    y: ve(J)
                }))),
                ce = me(() => {
                    const J = H.value.length,
                        D = Math.max(1, Math.ceil(J / 8));
                    return H.value.map((y, g) => ({
                        i: g,
                        text: (y.evaluated_at ?? "").replace("T", " ").slice(0, 16)
                    })).filter(y => y.i % D === 0 || y.i === J - 1)
                }),
                ae = me(() => {
                    const J = H.value.length;
                    return H.value.map((D, y) => ({
                        i: y,
                        level: D.level ?? ""
                    })).filter(D => D.level).map(D => ({
                        ...D,
                        x: b(D.i, J)
                    }))
                });
            return (J, D) => {
                var y;
                return p(), h("div", null, [D[42] || (D[42] = l("h1", {
                    class: "title-zine"
                }, " 系统评价（DB50/T 1807-2025） ", -1)), D[43] || (D[43] = l("div", {
                    class: "lede"
                }, " 评价指标由系统管理员在服务端运行标准评价任务产出；本页用于检测人员资质录入与附录 A 记录表生成。 ", -1)), D[44] || (D[44] = l("div", {
                    class: "section-h"
                }, [l("span", {
                    class: "no"
                }, "1"), ee("评价/标注人员资质 ")], -1)), l("div", o_, [l("div", i_, [l("div", a_, [D[12] || (D[12] = l("label", {
                    for: "spn"
                }, "姓名", -1)), he(l("input", {
                    id: "spn",
                    "onUpdate:modelValue": D[0] || (D[0] = g => K.value = g),
                    placeholder: "张三"
                }, null, 512), [
                    [Ee, K.value]
                ])]), l("div", r_, [D[13] || (D[13] = l("label", {
                    for: "spc"
                }, "持证类型", -1)), he(l("input", {
                    id: "spc",
                    "onUpdate:modelValue": D[1] || (D[1] = g => I.value = g),
                    placeholder: "RT(D)-II / RT-Ⅱ"
                }, null, 512), [
                    [Ee, I.value]
                ])]), l("div", u_, [D[15] || (D[15] = l("label", {
                    for: "spr"
                }, "岗位", -1)), he(l("select", {
                    id: "spr",
                    "onUpdate:modelValue": D[2] || (D[2] = g => A.value = g)
                }, [...D[14] || (D[14] = [l("option", {
                    value: "evaluator"
                }, " 评价人员 ", -1), l("option", {
                    value: "labeler"
                }, " 标注人员 ", -1)])], 512), [
                    [pt, A.value]
                ])]), l("div", c_, [D[16] || (D[16] = l("label", {
                    for: "spv"
                }, "证书有效期（选填）", -1)), he(l("input", {
                    id: "spv",
                    "onUpdate:modelValue": D[3] || (D[3] = g => T.value = g),
                    placeholder: "2099-12-31"
                }, null, 512), [
                    [Ee, T.value]
                ])]), l("button", {
                    class: "btn",
                    type: "button",
                    onClick: te
                }, " 添加 ")]), s.value.length || o.value.length ? (p(), h("ul", d_, [(p(!0), h(ue, null, Oe(s.value, (g, R) => (p(), h("li", {
                    key: `e${R}`
                }, [ee(" 评价人员：" + v(g.name) + "（" + v(g.cert_type) + v(g.valid_until ? "，至 " + g.valid_until : "") + "） ", 1), l("a", {
                    href: "#",
                    onClick: Je(F => B("evaluator", R), ["prevent"])
                }, "移除", 8, f_)]))), 128)), (p(!0), h(ue, null, Oe(o.value, (g, R) => (p(), h("li", {
                    key: `l${R}`
                }, [ee(" 标注人员：" + v(g.name) + "（" + v(g.cert_type) + "） ", 1), l("a", {
                    href: "#",
                    onClick: Je(F => B("labeler", R), ["prevent"])
                }, "移除", 8, v_)]))), 128))])) : V("", !0), t.value === !1 ? (p(), h("div", p_, " 资质问题：" + v(n.value.join("；")), 1)) : V("", !0), l("button", {
                    class: "btn",
                    type: "button",
                    disabled: i.value,
                    onClick: $
                }, " 保存并校验资质 ", 8, h_), t.value === !0 ? (p(), h("span", m_, "资质校验通过")) : V("", !0)]), D[45] || (D[45] = l("div", {
                    class: "section-h"
                }, [l("span", {
                    class: "no"
                }, "2"), ee("记录表基本信息 ")], -1)), l("div", g_, [l("div", y_, [l("div", b_, [D[17] || (D[17] = l("label", {
                    for: "sen"
                }, "系统名称", -1)), he(l("input", {
                    id: "sen",
                    "onUpdate:modelValue": D[4] || (D[4] = g => m.value = g)
                }, null, 512), [
                    [Ee, m.value]
                ])]), l("div", __, [D[18] || (D[18] = l("label", {
                    for: "sev"
                }, "系统版本", -1)), he(l("input", {
                    id: "sev",
                    "onUpdate:modelValue": D[5] || (D[5] = g => _.value = g),
                    placeholder: "1.0.0"
                }, null, 512), [
                    [Ee, _.value]
                ])]), l("div", w_, [D[19] || (D[19] = l("label", {
                    for: "sed"
                }, "研制单位", -1)), he(l("input", {
                    id: "sed",
                    "onUpdate:modelValue": D[6] || (D[6] = g => P.value = g)
                }, null, 512), [
                    [Ee, P.value]
                ])])]), l("div", k_, [l("div", $_, [D[21] || (D[21] = l("label", {
                    for: "sek"
                }, "检测方法", -1)), he(l("select", {
                    id: "sek",
                    "onUpdate:modelValue": D[7] || (D[7] = g => E.value = g)
                }, [...D[20] || (D[20] = [l("option", null, "RT", -1), l("option", null, "DR", -1), l("option", null, "CR", -1)])], 512), [
                    [pt, E.value]
                ])]), l("div", C_, [D[23] || (D[23] = l("label", {
                    for: "sef"
                }, "焊缝形式", -1)), he(l("select", {
                    id: "sef",
                    "onUpdate:modelValue": D[8] || (D[8] = g => M.value = g)
                }, [...D[22] || (D[22] = [l("option", {
                    value: "single"
                }, " 单面焊 ", -1), l("option", {
                    value: "double"
                }, " 双面焊 ", -1)])], 512), [
                    [pt, M.value]
                ])]), l("div", E_, [D[25] || (D[25] = l("label", {
                    for: "sem"
                }, "焊接方法", -1)), he(l("select", {
                    id: "sem",
                    "onUpdate:modelValue": D[9] || (D[9] = g => L.value = g)
                }, [...D[24] || (D[24] = [l("option", {
                    value: "manual"
                }, " 手工焊 ", -1), l("option", {
                    value: "auto"
                }, " 自动焊 ", -1)])], 512), [
                    [pt, L.value]
                ])]), l("div", x_, [D[26] || (D[26] = l("label", {
                    for: "ser"
                }, "记录表编号", -1)), he(l("input", {
                    id: "ser",
                    "onUpdate:modelValue": D[10] || (D[10] = g => u.value = g)
                }, null, 512), [
                    [Ee, u.value]
                ])])]), l("button", {
                    class: "btn",
                    type: "button",
                    disabled: i.value,
                    onClick: j
                }, " 生成附录 A 记录表 ", 8, S_), c.value && !f.value ? (p(), h("a", {
                    key: 0,
                    class: "btn",
                    href: ye(mv)(d.value ?? "std_record"),
                    target: "_blank"
                }, " 下载 PDF ", 8, A_)) : f.value ? (p(), h("span", R_, " 记录表编号已修改，请点击「生成附录 A 记录表」以新编号重新生成后再下载。 ")) : V("", !0)]), c.value ? (p(), h(ue, {
                    key: 0
                }, [D[37] || (D[37] = l("div", {
                    class: "section-h"
                }, [l("span", {
                    class: "no"
                }, "3"), ee("评价结果 ")], -1)), l("div", T_, [l("table", I_, [l("tbody", null, [l("tr", null, [D[27] || (D[27] = l("th", null, "KDR（关键缺陷检出率）", -1)), l("td", null, v(le(c.value.metrics.kdr)) + "（严格口径 " + v(le(c.value.metrics.kdr_strict)) + "）", 1), D[28] || (D[28] = l("th", null, "WDR（综合检出率）", -1)), l("td", null, v(le(c.value.metrics.wdr)) + "（" + v(le(c.value.metrics.wdr_strict)) + "）", 1)]), l("tr", null, [D[29] || (D[29] = l("th", null, "TDR（正确检出率）", -1)), l("td", null, v(le(c.value.metrics.tdr)) + "（" + v(le(c.value.metrics.tdr_strict)) + "）", 1), D[30] || (D[30] = l("th", null, "FRR（整片误报率）", -1)), l("td", null, v(le(c.value.metrics.frr)) + "（" + v(le(c.value.metrics.frr_strict)) + "）", 1)]), l("tr", null, [D[31] || (D[31] = l("th", null, "系统分级", -1)), l("td", O_, [ee(v(c.value.grading.level ?? "未定级") + "（标准口径 " + v(c.value.grading.level_standard ?? "未定级") + " / 严格口径 " + v(c.value.grading.level_strict ?? "未定级") + "） ", 1), c.value.grading.official ? V("", !0) : (p(), h("span", P_, "（参考值）"))])]), l("tr", null, [D[32] || (D[32] = l("th", null, "风险分析", -1)), l("td", M_, " 漏检 " + v(c.value.risks.miss) + "；误检 " + v(c.value.risks.false_detect) + "；误报 " + v(c.value.risks.false_report), 1)]), l("tr", null, [D[36] || (D[36] = l("th", null, "逐类别指标", -1)), l("td", N_, [ee(" TDRn：" + v(c.value.metrics.tdr_row), 1), D[33] || (D[33] = l("br", null, null, -1)), ee(" FDRn：" + v(c.value.metrics.fdr_row), 1), D[34] || (D[34] = l("br", null, null, -1)), ee(" MDRn：" + v(c.value.metrics.mdr_row), 1), D[35] || (D[35] = l("br", null, null, -1)), ee(" FRRn：" + v(c.value.metrics.frr_row), 1)])])])]), c.value.grading.note ? (p(), h("div", D_, v(c.value.grading.note), 1)) : V("", !0)])], 64)) : V("", !0), D[46] || (D[46] = l("div", {
                    class: "section-h"
                }, [l("span", {
                    class: "no"
                }, "4"), ee("评价历史与分级曲线 ")], -1)), l("div", L_, [ne.value ? (p(), h("div", U_, " 评价历史读取失败：" + v(ne.value), 1)) : H.value.length === 0 ? (p(), h("div", V_, " 暂无评价历史 —— 先经 CLI 产出指标或生成记录表，历史记录将自动汇聚至此。 ")) : (p(), h(ue, {
                    key: 2
                }, [(p(), h("svg", {
                    class: "curve",
                    viewBox: `0 0 ${Tl} ${Il}`,
                    role: "img",
                    "aria-label": "评价等级曲线"
                }, [(p(!0), h(ue, null, Oe(z.value, g => (p(), h("g", {
                    key: `g${g.v}`
                }, [l("line", {
                    x1: Gn,
                    y1: g.y,
                    x2: Tl - Yi,
                    y2: g.y,
                    class: "grid"
                }, null, 8, B_), l("text", {
                    x: Gn - 6,
                    y: g.y + 4,
                    class: "axis",
                    "text-anchor": "end"
                }, v(Math.round(g.v * 100)) + "%", 9, j_)]))), 128)), pe.value ? (p(), h("path", {
                    key: 0,
                    d: pe.value,
                    class: "line line-tdr"
                }, null, 8, H_)) : V("", !0), qe.value ? (p(), h("path", {
                    key: 1,
                    d: qe.value,
                    class: "line line-wdr"
                }, null, 8, K_)) : V("", !0), Ge.value ? (p(), h("path", {
                    key: 2,
                    d: Ge.value,
                    class: "line line-frr"
                }, null, 8, G_)) : V("", !0), (p(!0), h(ue, null, Oe(ae.value, g => (p(), h("g", {
                    key: `lv${g.i}`
                }, [l("text", {
                    x: g.x,
                    y: Ol - 8,
                    class: "lvl",
                    "text-anchor": "middle"
                }, v(g.level), 9, W_)]))), 128)), (p(!0), h(ue, null, Oe(ce.value, g => (p(), h("text", {
                    key: `x${g.i}`,
                    x: b(g.i, H.value.length),
                    y: Il - 8,
                    class: "axis",
                    "text-anchor": "middle"
                }, v(g.text), 9, q_))), 128))], 8, F_)), l("div", z_, [D[38] || (D[38] = l("span", {
                    class: "key key-tdr"
                }, "TDR", -1)), D[39] || (D[39] = l("span", {
                    class: "key key-wdr"
                }, "WDR", -1)), D[40] || (D[40] = l("span", {
                    class: "key key-frr"
                }, "FRR", -1)), D[41] || (D[41] = l("span", {
                    class: "key key-lvl"
                }, "L1–L4 = 系统分级", -1)), l("span", J_, "共 " + v(H.value.length) + " 条评价记录", 1)])], 64))]), a.value ? (p(), h("div", X_, v(a.value), 1)) : V("", !0), r.value ? (p(), h("div", Y_, v(r.value), 1)) : V("", !0), Re(Vn, {
                    open: de.value !== null,
                    title: "移除人员确认",
                    message: `将从列表移除「${((y=de.value)==null?void 0:y.name)??""}」。如该人员此前已保存过，还需点击「保存并校验资质」才会生效。确认移除？`,
                    "confirm-text": "移除",
                    danger: "",
                    onConfirm: k,
                    onCancel: D[11] || (D[11] = g => de.value = null)
                }, null, 8, ["open", "message"])])
            }
        }
    }),
    e0 = We(Z_, [
        ["__scopeId", "data-v-7656051f"]
    ]);

function Qi(e, t, n) {
    let s = (e - n.natW / 2) * n.factor,
        o = (t - n.natH / 2) * n.factor;
    n.flipH && (s = -s), n.flipV && (o = -o);
    const i = (n.rot % 360 + 360) % 360;
    let a = s,
        r = o;
    return i === 90 ? (a = -o, r = s) : i === 180 ? (a = -s, r = -o) : i === 270 && (a = o, r = -s), [a + n.w / 2, r + n.h / 2]
}

function t0(e, t, n, s) {
    const [o, i] = Qi(e[0] * t, e[1] * n, s), [a, r] = Qi((e[0] + e[2]) * t, (e[1] + e[3]) * n, s);
    return {
        x: Math.min(o, a),
        y: Math.min(i, r),
        w: Math.abs(a - o),
        h: Math.abs(r - i)
    }
}
const n0 = {
        class: "fv-toolbar"
    },
    s0 = {
        key: 0,
        class: "fv-error"
    },
    l0 = {
        key: 1,
        class: "fv-hint"
    },
    o0 = {
        key: 2,
        class: "fv-label"
    },
    i0 = {
        class: "fv-filters"
    },
    a0 = {
        class: "chk"
    },
    r0 = {
        class: "fv-status"
    },
    u0 = Fe({
        __name: "FilmViewer",
        props: {
            src: {},
            syncTransform: {
                default: null
            },
            height: {
                default: "62vh"
            },
            label: {
                default: ""
            },
            annotations: {
                default: null
            }
        },
        emits: ["transformChanged"],
        setup(e, {
            emit: t
        }) {
            const n = e,
                s = t,
                o = w(null),
                i = w(null),
                a = w(1),
                r = w(0),
                u = w(0),
                c = w(0),
                d = w(!1),
                f = w(!1),
                m = w(!1),
                _ = w(100),
                P = w(100),
                E = w(!1),
                N = w(255),
                M = w(128),
                L = w(0),
                K = w(!1),
                I = w(null),
                A = w(null),
                C = w(!1),
                T = w(!1),
                x = document.createElement("canvas");
            let W = 0,
                te = 0,
                de = "";

            function B(U) {
                return 2 ** (Math.ceil(Math.log2(Math.max(U, .001)) * 2) / 2)
            }

            function k() {
                const U = window.devicePixelRatio || 1,
                    S = B(Math.min(1, Math.max(a.value * U, .02)));
                return `${le.value}|res${S}`
            }
            const $ = me(() => ({
                    scale: a.value,
                    tx: r.value,
                    ty: u.value,
                    rotation: c.value,
                    flipH: d.value,
                    flipV: f.value
                })),
                j = me(() => [`${Math.round(a.value*100)}% · ${c.value}°`, I.value ? `原图 ${I.value.naturalWidth}×${I.value.naturalHeight}px` : "", d.value ? "· 水平镜像" : "", f.value ? "· 垂直镜像" : "", m.value ? "· 反相" : "", E.value ? `· 窗宽${N.value}/窗位${M.value}` : ""].filter(Boolean).join(" "));
            et(() => n.src, U => {
                if (A.value = null, !U) {
                    I.value = null;
                    return
                }
                const S = U,
                    X = new Image;
                X.onload = () => {
                    n.src === S && (I.value = X, qe())
                }, X.onerror = () => {
                    n.src === S && (A.value = "影像载入失败（TIFF/DICOM 格式请先经后端转档为 PNG/JPG 预览格式）", I.value = null)
                }, X.src = U
            }, {
                immediate: !0
            });
            const le = me(() => {
                var U;
                return `${((U=I.value)==null?void 0:U.src)??""}|${c.value}|${d.value}|${f.value}|${m.value}|${_.value}|${P.value}|${E.value}|${N.value}|${M.value}|${L.value}|${K.value}`
            });
            et(le, () => {
                de = "", ve()
            }), et(() => n.annotations, () => {
                de = "", ve()
            }), et(() => n.syncTransform, U => {
                U && (a.value = U.scale, r.value = U.tx, u.value = U.ty, c.value = U.rotation, d.value = U.flipH, f.value = U.flipV, ve())
            });

            function H() {
                s("transformChanged", {
                    ...$.value
                })
            }

            function ne(U, S, X, fe = 0) {
                const ge = new Uint8ClampedArray(U.data),
                    ke = U.data,
                    _e = U.width,
                    Te = U.height;
                for (let Pe = 1; Pe < Te - 1; Pe++)
                    for (let Ie = 1; Ie < _e - 1; Ie++)
                        for (let Ke = 0; Ke < 3; Ke++) {
                            let Q = 0,
                                O = 0;
                            for (let G = -1; G <= 1; G++)
                                for (let Se = -1; Se <= 1; Se++, O++) Q += ge[((Pe + G) * _e + (Ie + Se)) * 4 + Ke] * S[O];
                            ke[(Pe * _e + Ie) * 4 + Ke] = Q / X + fe
                        }
            }

            function Ne(U, S, X, fe, ge, ke, _e) {
                const Te = n.annotations;
                if (!Te || Te.boxes.length === 0) return;
                const Pe = S / Math.max(1, Te.imageW),
                    Ie = X / Math.max(1, Te.imageH),
                    Ke = {
                        natW: S,
                        natH: X,
                        rot: fe,
                        w: ge,
                        h: ke,
                        factor: _e,
                        flipH: d.value,
                        flipV: f.value
                    },
                    Q = Math.min(ge, ke),
                    O = Math.max(1.5, Q / 400),
                    G = Math.max(12, Math.min(30, Math.round(Q / 30)));
                U.save(), U.lineJoin = "round", U.textBaseline = "top", U.font = `600 ${G}px system-ui, "Segoe UI", sans-serif`;
                for (const Se of Te.boxes) {
                    const $e = t0(Se.bbox, Pe, Ie, Ke);
                    U.strokeStyle = "#ff453a", U.lineWidth = O, U.strokeRect($e.x, $e.y, Math.max($e.w, O), Math.max($e.h, O));
                    const lt = `${dl[Se.classId]??"缺陷"} ${Math.round(Se.confidence*100)}%` + (Se.needReview ? " · 待复核" : ""),
                        bs = G * .35,
                        Po = G * .22,
                        fl = U.measureText(lt).width + bs * 2,
                        Mo = G + Po * 2;
                    let _s = $e.y - Mo - O;
                    _s < 2 && (_s = $e.y + O);
                    let ws = $e.x;
                    ws + fl > ge - 2 && (ws = ge - 2 - fl), U.fillStyle = "rgba(155, 22, 12, 0.85)", U.fillRect(ws, _s, fl, Mo), U.fillStyle = "#fff", U.fillText(lt, ws + bs, _s + Po)
                }
                U.restore()
            }

            function se() {
                const U = I.value;
                if (!U) return;
                const S = (c.value % 360 + 360) % 360,
                    X = S === 90 || S === 270,
                    fe = U.naturalWidth,
                    ge = U.naturalHeight;
                W = X ? ge : fe, te = X ? fe : ge;
                const ke = window.devicePixelRatio || 1,
                    _e = B(Math.min(1, Math.max(a.value * ke, .02))),
                    Te = Math.max(1, Math.round(W * _e)),
                    Pe = Math.max(1, Math.round(te * _e));
                x.width = Te, x.height = Pe;
                const Ie = x.getContext("2d");
                if (!Ie) return;
                Ie.save(), Ie.translate(Te / 2, Pe / 2), Ie.rotate(S * Math.PI / 180), Ie.scale(_e * (d.value ? -1 : 1), _e * (f.value ? -1 : 1)), Ie.drawImage(U, -fe / 2, -ge / 2), Ie.restore();
                const Ke = Ie.getImageData(0, 0, Te, Pe),
                    Q = new Uint8ClampedArray(256),
                    O = _.value / 100,
                    G = P.value / 100;
                for (let $e = 0; $e < 256; $e++) {
                    let lt = $e;
                    if (E.value) {
                        const bs = M.value - N.value / 2;
                        lt = (lt - bs) / Math.max(N.value, 1) * 255
                    }
                    lt = (lt - 128) * G + 128 * O, m.value && (lt = 255 - lt), Q[$e] = Math.min(255, Math.max(0, lt))
                }
                const Se = Ke.data;
                for (let $e = 0; $e < Se.length; $e += 4) Se[$e] = Q[Se[$e]], Se[$e + 1] = Q[Se[$e + 1]], Se[$e + 2] = Q[Se[$e + 2]];
                if (L.value > 0) {
                    const $e = L.value / 100;
                    ne(Ke, [0, -$e, 0, -$e, 1 + 4 * $e, -$e, 0, -$e, 0], 1)
                }
                K.value && ne(Ke, [-2, -1, 0, -1, 1, 1, 0, 1, 2], 1, 128), Ie.putImageData(Ke, 0, 0), Ne(Ie, fe, ge, S, Te, Pe, _e), de = k()
            }
            let b = 0;

            function ve() {
                b || (b = requestAnimationFrame(() => {
                    b = 0, De()
                }))
            }

            function De() {
                var _e;
                const U = o.value;
                if (!U) return;
                const S = (_e = U.parentElement) == null ? void 0 : _e.getBoundingClientRect(),
                    X = window.devicePixelRatio || 1,
                    fe = Math.max(1, Math.floor((S == null ? void 0 : S.width) ?? 640)),
                    ge = Math.max(1, Math.floor((S == null ? void 0 : S.height) ?? 480));
                (U.width !== fe * X || U.height !== ge * X) && (U.width = fe * X, U.height = ge * X);
                const ke = U.getContext("2d");
                ke && (ke.setTransform(X, 0, 0, X, 0, 0), ke.clearRect(0, 0, fe, ge), I.value && (de !== k() && se(), ke.save(), ke.translate(fe / 2 + r.value, ge / 2 + u.value), ke.scale(a.value, a.value), ke.drawImage(x, -W / 2, -te / 2, W, te), ke.restore()))
            }
            const pe = w(1);

            function qe() {
                var Ie;
                const U = o.value;
                if (!U || !I.value) return;
                const S = (Ie = U.parentElement) == null ? void 0 : Ie.getBoundingClientRect(),
                    X = (S == null ? void 0 : S.width) ?? 640,
                    fe = (S == null ? void 0 : S.height) ?? 480,
                    ge = .94,
                    _e = (c.value % 360 + 360) % 360 % 180 !== 0,
                    Te = _e ? I.value.naturalHeight : I.value.naturalWidth,
                    Pe = _e ? I.value.naturalWidth : I.value.naturalHeight;
                a.value = Math.min(X / Te, fe / Pe) * ge, pe.value = a.value, r.value = 0, u.value = 0, ve(), H()
            }

            function Ge() {
                a.value = 1, r.value = 0, u.value = 0, ve(), H()
            }

            function z() {
                c.value = 0, d.value = !1, f.value = !1, m.value = !1, _.value = 100, P.value = 100, E.value = !1, N.value = 255, M.value = 128, L.value = 0, K.value = !1, qe()
            }

            function ce(U, S = 0, X = 0) {
                const fe = Math.min(32, Math.max(.02, U)),
                    ge = fe / a.value;
                r.value = S + (r.value - S) * ge, u.value = X + (u.value - X) * ge, a.value = fe, ve(), H()
            }

            function ae(U, S = 0, X = 0) {
                ce(a.value * U, S, X)
            }

            function J(U) {
                I.value && ce(pe.value * U)
            }

            function D(U) {
                c.value = (c.value + U * 90 + 360) % 360, ve(), H()
            }

            function y() {
                E.value = !E.value, E.value && (N.value = 255, M.value = 128)
            }
            let g = !1,
                R = 0,
                F = 0;

            function Y(U) {
                var ge;
                U.preventDefault();
                const S = (ge = o.value) == null ? void 0 : ge.getBoundingClientRect(),
                    X = S ? U.clientX - S.left - S.width / 2 : 0,
                    fe = S ? U.clientY - S.top - S.height / 2 : 0;
                ae(U.deltaY < 0 ? 1.1 : 1 / 1.1, X, fe)
            }

            function q(U) {
                g = !0, R = U.clientX, F = U.clientY
            }

            function re(U) {
                g && (r.value += U.clientX - R, u.value += U.clientY - F, R = U.clientX, F = U.clientY, ve())
            }

            function ie() {
                g && (g = !1, H())
            }

            function oe(U) {
                const S = U;
                return !S || !S.tagName ? !1 : S.tagName === "INPUT" || S.tagName === "TEXTAREA" || S.tagName === "SELECT" || S.isContentEditable
            }

            function Z(U) {
                if (oe(U.target) || U.ctrlKey || U.metaKey || U.altKey || !C.value && !T.value || !o.value || !I.value) return;
                const S = 24;
                switch (U.key) {
                    case "+":
                    case "=":
                        ae(1.15);
                        break;
                    case "-":
                        ae(1 / 1.15);
                        break;
                    case "ArrowLeft":
                        r.value -= S, ve(), H();
                        break;
                    case "ArrowRight":
                        r.value += S, ve(), H();
                        break;
                    case "ArrowUp":
                        u.value -= S, ve(), H();
                        break;
                    case "ArrowDown":
                        u.value += S, ve(), H();
                        break;
                    case "r":
                        D(1);
                        break;
                    case "R":
                        D(-1);
                        break;
                    case "i":
                        m.value = !m.value;
                        break;
                    case "f":
                        qe();
                        break;
                    case "1":
                        Ge();
                        break;
                    case "0":
                        z();
                        break;
                    default:
                        return
                }
                U.preventDefault()
            }
            return dt(() => {
                window.addEventListener("keydown", Z), window.addEventListener("resize", ve), ve()
            }), _n(() => {
                window.removeEventListener("keydown", Z), window.removeEventListener("resize", ve), b && cancelAnimationFrame(b)
            }), (U, S) => (p(), h("div", {
                class: "film-viewer",
                style: Ln({
                    height: e.height
                }),
                onMouseenter: S[21] || (S[21] = X => C.value = !0),
                onMouseleave: S[22] || (S[22] = X => C.value = !1)
            }, [l("div", n0, [l("button", {
                title: "放大（+）",
                onClick: S[0] || (S[0] = X => ae(1.2))
            }, " ＋ "), l("button", {
                title: "缩小（-）",
                onClick: S[1] || (S[1] = X => ae(1 / 1.2))
            }, " － "), l("button", {
                title: "适应窗口（f）",
                onClick: S[2] || (S[2] = X => qe())
            }, " 适应 "), l("button", {
                title: "1:1 实际像素尺寸（1）",
                onClick: S[3] || (S[3] = X => Ge())
            }, " 1:1 "), l("button", {
                title: "适应比例的 2 倍放大",
                onClick: S[4] || (S[4] = X => J(2))
            }, " 2× "), l("button", {
                title: "适应比例的 4 倍放大（细节判读）",
                onClick: S[5] || (S[5] = X => J(4))
            }, " 4× "), l("button", {
                title: "适应比例的 8 倍放大",
                onClick: S[6] || (S[6] = X => J(8))
            }, " 8× "), l("button", {
                title: "逆时针旋转 90°（R）",
                onClick: S[7] || (S[7] = X => D(-1))
            }, " ↺ "), l("button", {
                title: "顺时针旋转 90°（r）",
                onClick: S[8] || (S[8] = X => D(1))
            }, " ↻ "), l("button", {
                title: "水平镜像",
                class: we({
                    on: d.value
                }),
                onClick: S[9] || (S[9] = X => d.value = !d.value)
            }, " ⇋ ", 2), l("button", {
                title: "垂直镜像",
                class: we({
                    on: f.value
                }),
                onClick: S[10] || (S[10] = X => f.value = !f.value)
            }, " ⇅ ", 2), l("button", {
                title: "正反片转换 / 反相（i）",
                class: we({
                    on: m.value
                }),
                onClick: S[11] || (S[11] = X => m.value = !m.value)
            }, " ◐ ", 2), l("button", {
                title: "窗宽窗位调节（灰度映射）",
                class: we({
                    on: E.value
                }),
                onClick: y
            }, " 窗 ", 2), l("button", {
                title: "还原初始视图与滤波参数（0）",
                onClick: S[12] || (S[12] = X => z())
            }, " 还原 ")]), l("div", {
                ref_key: "wrap",
                ref: i,
                class: "fv-stage"
            }, [l("canvas", {
                ref_key: "canvas",
                ref: o,
                tabindex: "0",
                "aria-label": "底片查看区：+/- 缩放，方向键平移，r 旋转，i 反相，f 适应，1 原始尺寸，0 还原",
                onWheel: Y,
                onMousedown: q,
                onMousemove: re,
                onMouseup: ie,
                onMouseleave: ie,
                onFocus: S[13] || (S[13] = X => T.value = !0),
                onBlur: S[14] || (S[14] = X => T.value = !1)
            }, null, 544), A.value ? (p(), h("div", s0, v(A.value), 1)) : I.value ? n.label ? (p(), h("div", o0, v(n.label), 1)) : V("", !0) : (p(), h("div", l0, v(n.label || "未载入影像"), 1))], 512), l("div", i0, [l("label", null, [S[23] || (S[23] = ee("亮度", -1)), he(l("input", {
                "onUpdate:modelValue": S[15] || (S[15] = X => _.value = X),
                type: "range",
                min: "20",
                max: "300",
                step: "5"
            }, null, 512), [
                [Ee, _.value, void 0, {
                    number: !0
                }]
            ])]), l("label", null, [S[24] || (S[24] = ee("对比度", -1)), he(l("input", {
                "onUpdate:modelValue": S[16] || (S[16] = X => P.value = X),
                type: "range",
                min: "20",
                max: "300",
                step: "5"
            }, null, 512), [
                [Ee, P.value, void 0, {
                    number: !0
                }]
            ])]), E.value ? (p(), h(ue, {
                key: 0
            }, [l("label", null, [S[25] || (S[25] = ee("窗宽", -1)), he(l("input", {
                "onUpdate:modelValue": S[17] || (S[17] = X => N.value = X),
                type: "range",
                min: "1",
                max: "512",
                step: "1"
            }, null, 512), [
                [Ee, N.value, void 0, {
                    number: !0
                }]
            ])]), l("label", null, [S[26] || (S[26] = ee("窗位", -1)), he(l("input", {
                "onUpdate:modelValue": S[18] || (S[18] = X => M.value = X),
                type: "range",
                min: "0",
                max: "255",
                step: "1"
            }, null, 512), [
                [Ee, M.value, void 0, {
                    number: !0
                }]
            ])])], 64)) : V("", !0), l("label", null, [S[27] || (S[27] = ee("锐化", -1)), he(l("input", {
                "onUpdate:modelValue": S[19] || (S[19] = X => L.value = X),
                type: "range",
                min: "0",
                max: "100",
                step: "5"
            }, null, 512), [
                [Ee, L.value, void 0, {
                    number: !0
                }]
            ])]), l("label", a0, [he(l("input", {
                "onUpdate:modelValue": S[20] || (S[20] = X => K.value = X),
                type: "checkbox"
            }, null, 512), [
                [kn, K.value]
            ]), S[28] || (S[28] = ee("浮雕", -1))])]), l("div", r0, v(j.value), 1)], 36))
        }
    }),
    Zi = We(u0, [
        ["__scopeId", "data-v-5de466fc"]
    ]),
    c0 = {
        class: "viewer-controls"
    },
    d0 = {
        key: 0,
        class: "fname"
    },
    f0 = ["title"],
    v0 = {
        key: 1,
        class: "fdef"
    },
    p0 = ["disabled"],
    h0 = {
        key: 1,
        class: "aerr",
        role: "alert"
    },
    m0 = {
        class: "chk"
    },
    g0 = {
        key: 0,
        class: "empty-guide"
    },
    y0 = {
        key: 1,
        class: "strip-wrap"
    },
    b0 = {
        class: "strip-head"
    },
    _0 = {
        class: "strip"
    },
    w0 = ["title", "onClick"],
    k0 = {
        class: "timg"
    },
    $0 = ["src"],
    C0 = {
        key: 1,
        class: "noimg",
        title: "该格式需经后端转档后预览（WebView 不支持直接解码）"
    },
    E0 = {
        class: "tname"
    },
    x0 = ["title"],
    S0 = {
        key: 1,
        class: "tdef",
        title: "批量检出缺陷，上屏后叠加标注框"
    },
    A0 = ["onClick"],
    R0 = ["onClick"],
    T0 = Fe({
        __name: "ViewerView",
        setup(e) {
            const t = To(),
                n = _o(),
                s = w(null),
                o = w(null),
                i = w(!1),
                a = w(!0),
                r = w(null),
                u = w(""),
                c = w(null);

            function d(k, $) {
                const j = k === "A" ? s.value : o.value;
                j != null && j.owned && URL.revokeObjectURL(j.url), k === "A" ? s.value = $ : o.value = $
            }
            wn(() => {
                var k, $;
                (k = s.value) != null && k.owned && URL.revokeObjectURL(s.value.url), ($ = o.value) != null && $.owned && URL.revokeObjectURL(o.value.url)
            });

            function f(k, $ = "A") {
                d($, {
                    url: k.url,
                    name: k.name,
                    owned: !1,
                    filmId: k.id
                }), $ === "B" && (i.value = !0)
            }
            dt(() => {
                const k = n.query.image_id;
                if (typeof k == "string" && k.trim()) {
                    u.value = k.trim(), _();
                    return
                }
                if (s.value) return;
                const $ = t.films.find(j => j.decodable);
                $ && f($)
            }), et(() => t.lastAddedId, k => {
                if (k < 0) return;
                const $ = t.films.find(j => j.id === k);
                !$ || !$.decodable || (i.value && !o.value ? f($, "B") : f($))
            }), et(() => t.films.map(k => k.id), k => {
                var $, j;
                ($ = s.value) != null && $.filmId && !k.includes(s.value.filmId) && d("A", null), (j = o.value) != null && j.filmId && !k.includes(o.value.filmId) && d("B", null)
            });
            const m = w(!1);
            async function _() {
                const k = u.value.trim();
                if (c.value = null, !k) {
                    c.value = "请输入影像编号（可在「检测档案」中复制）。";
                    return
                }
                m.value = !0;
                try {
                    const $ = await Iv(k),
                        j = URL.createObjectURL($);
                    d("A", {
                        url: j,
                        name: `档案影像 ${k}`,
                        owned: !0
                    })
                } catch ($) {
                    $ instanceof Ye ? $.status === 404 ? c.value = `未找到影像「${k}」：请确认编号是否来自「检测档案」列表。` : $.status === 401 ? c.value = "登录状态已失效，请重新登录后再试。" : c.value = `影像载入失败：${$.message}` : c.value = `影像载入失败：${Ae($)}`
                } finally {
                    m.value = !1
                }
            }

            function P(k) {
                const $ = document.createElement("input");
                $.type = "file", $.accept = Ro, $.onchange = () => {
                    var le;
                    const j = (le = $.files) == null ? void 0 : le[0];
                    j && (d(k, {
                        url: URL.createObjectURL(j),
                        name: j.name,
                        owned: !0
                    }), k === "B" && (i.value = !0))
                }, $.click()
            }

            function E(k) {
                r.value = k
            }

            function N(k) {
                d(k, null)
            }
            const M = w(null),
                L = w(null);

            function K() {
                M.value = "clear"
            }

            function I(k) {
                L.value = k, M.value = "remove"
            }

            function A() {
                M.value === "clear" ? t.clear() : M.value === "remove" && L.value && t.remove(L.value.id), M.value = null, L.value = null
            }

            function C() {
                M.value = null, L.value = null
            }

            function T(k) {
                return (k.split(".").pop() ?? "?").toUpperCase()
            }
            const x = me(() => {
                    var k;
                    return t.annotationsOf((k = s.value) == null ? void 0 : k.filmId)
                }),
                W = me(() => {
                    var k;
                    return t.annotationsOf((k = o.value) == null ? void 0 : k.filmId)
                });

            function te(k) {
                var $;
                return (($ = t.annotationsOf(k)) == null ? void 0 : $.boxes.length) ?? 0
            }
            const de = me(() => {
                var k;
                return tn(t.stampOf((k = s.value) == null ? void 0 : k.filmId))
            });

            function B(k) {
                const $ = t.stampOf(k);
                return $ ? tn($) : null
            }
            return (k, $) => {
                var j, le, H, ne, Ne;
                return p(), h("div", null, [$[9] || ($[9] = l("h1", {
                    class: "title-zine"
                }, " 底片观察 ", -1)), $[10] || ($[10] = l("div", {
                    class: "lede"
                }, " 单幅/批量导入的影像自动同步至本工作区；支持缩放、平移、旋转、镜像、正反片（反相）转换、窗宽窗位调节、锐化与浮雕增强 （DB50/T 1807 §6.1.5）；快捷键：+ − r R i f 1 0 方向键 ", -1)), l("div", c0, [l("button", {
                    onClick: $[0] || ($[0] = se => P("A"))
                }, v(s.value ? "更换" : "载入") + "主片… ", 1), s.value ? (p(), h("span", d0, [ee(v(s.value.name) + " ", 1), de.value ? (p(), h("em", {
                    key: 0,
                    class: we(["fstamp", `fstamp-${de.value.cls}`]),
                    title: de.value.title
                }, v(de.value.label), 11, f0)) : V("", !0), x.value ? (p(), h("em", v0, "检出缺陷 " + v(x.value.boxes.length) + " 处（已标注）", 1)) : V("", !0), l("a", {
                    href: "#",
                    onClick: $[1] || ($[1] = Je(se => N("A"), ["prevent"]))
                }, "移除")])) : V("", !0), he(l("input", {
                    "onUpdate:modelValue": $[2] || ($[2] = se => u.value = se),
                    class: "aid",
                    placeholder: "档案影像编号…",
                    onKeyup: Tt(_, ["enter"])
                }, null, 544), [
                    [Ee, u.value]
                ]), l("button", {
                    disabled: m.value,
                    onClick: _
                }, v(m.value ? "载入中…" : "从检测档案载入"), 9, p0), c.value ? (p(), h("span", h0, v(c.value), 1)) : V("", !0), l("button", {
                    class: we({
                        on: i.value
                    }),
                    onClick: $[3] || ($[3] = se => i.value = !i.value)
                }, " 双片对比 ", 2), i.value ? (p(), h(ue, {
                    key: 2
                }, [l("button", {
                    onClick: $[4] || ($[4] = se => P("B"))
                }, v(o.value ? "更换" : "载入") + "对比片… ", 1), l("label", m0, [he(l("input", {
                    "onUpdate:modelValue": $[5] || ($[5] = se => a.value = se),
                    type: "checkbox"
                }, null, 512), [
                    [kn, a.value]
                ]), $[6] || ($[6] = ee("视图联动", -1))])], 64)) : V("", !0)]), ye(t).count === 0 ? (p(), h("div", g0, [...$[7] || ($[7] = [l("p", {
                    class: "eg-title"
                }, " 尚未同步任何底片 ", -1), l("p", {
                    class: "eg-line"
                }, " · 在「单幅评定」或「批量评定」中导入的底片会自动同步到本页（本会话内有效）； ", -1), l("p", {
                    class: "eg-line"
                }, " · 或在上方输入档案影像编号，从「检测档案」载入历史底片（支持 TIFF/DICOM 转档预览）； ", -1), l("p", {
                    class: "eg-line"
                }, " · 也可点击「载入主片…」直接选择本机影像文件。 ", -1)])])) : V("", !0), ye(t).count ? (p(), h("div", y0, [l("div", b0, [ee(" 已同步影像 " + v(ye(t).count) + " 幅", 1), $[8] || ($[8] = l("span", {
                    class: "faint"
                }, "（来自单幅/批量导入，最新优先）", -1)), l("a", {
                    href: "#",
                    class: "clear",
                    onClick: Je(K, ["prevent"])
                }, "清空")]), l("div", _0, [(p(!0), h(ue, null, Oe(ye(t).films, se => {
                    var b, ve;
                    return p(), h("div", {
                        key: se.id,
                        class: we(["thumb", {
                            active: ((b = s.value) == null ? void 0 : b.filmId) === se.id || ((ve = o.value) == null ? void 0 : ve.filmId) === se.id
                        }]),
                        title: se.name,
                        onClick: De => f(se)
                    }, [l("span", k0, [se.decodable ? (p(), h("img", {
                        key: 0,
                        src: se.url,
                        loading: "lazy",
                        decoding: "async",
                        alt: ""
                    }, null, 8, $0)) : (p(), h("span", C0, v(T(se.name)), 1))]), l("span", E0, v(se.name), 1), B(se.id) ? (p(), h("span", {
                        key: 0,
                        class: we(["tstamp", `tstamp-${B(se.id).cls}`]),
                        title: B(se.id).title
                    }, v(B(se.id).label), 11, x0)) : V("", !0), te(se.id) > 0 ? (p(), h("span", S0, "缺陷 " + v(te(se.id)), 1)) : V("", !0), i.value ? (p(), h("button", {
                        key: 2,
                        class: "tb",
                        title: "设为对比片（B）",
                        onClick: Je(De => f(se, "B"), ["stop"])
                    }, " 对比 ", 8, A0)) : V("", !0), l("button", {
                        class: "tx",
                        title: "从列表移除",
                        onClick: Je(De => I(se), ["stop"])
                    }, " ✕ ", 8, R0)], 10, w0)
                }), 128))])])) : V("", !0), l("div", {
                    class: we(i.value ? "dual" : "single")
                }, [Re(Zi, {
                    src: ((j = s.value) == null ? void 0 : j.url) ?? null,
                    label: ((le = s.value) == null ? void 0 : le.name) || "未载入影像",
                    annotations: x.value,
                    "sync-transform": a.value ? r.value : null,
                    onTransformChanged: E
                }, null, 8, ["src", "label", "annotations", "sync-transform"]), i.value ? (p(), Wt(Zi, {
                    key: 0,
                    src: ((H = o.value) == null ? void 0 : H.url) ?? null,
                    label: ((ne = o.value) == null ? void 0 : ne.name) || "未载入对比片",
                    annotations: W.value,
                    "sync-transform": a.value ? r.value : null,
                    onTransformChanged: E
                }, null, 8, ["src", "label", "annotations", "sync-transform"])) : V("", !0)], 2), Re(Vn, {
                    open: M.value !== null,
                    title: M.value === "clear" ? "清空已同步影像" : "移除影像",
                    message: M.value === "clear" ? `将移除已同步的全部 ${ye(t).count} 幅影像及其缺陷标注（不影响已归档的检测结果），本会话内无法找回。确认清空？` : `将移除「${((Ne=L.value)==null?void 0:Ne.name)??""}」及其缺陷标注（不影响已归档的检测结果）。确认移除？`,
                    "confirm-text": "确认移除",
                    danger: "",
                    onConfirm: A,
                    onCancel: C
                }, null, 8, ["open", "title", "message"])])
            }
        }
    }),
    I0 = We(T0, [
        ["__scopeId", "data-v-7481c27a"]
    ]),
    O0 = {
        key: 0,
        class: "empty"
    },
    P0 = {
        key: 0,
        class: "err show"
    },
    M0 = {
        key: 1,
        class: "ok-msg"
    },
    N0 = {
        class: "create-row"
    },
    D0 = ["disabled"],
    L0 = {
        key: 2,
        class: "key-panel",
        role: "alert"
    },
    U0 = {
        class: "kp-title"
    },
    V0 = ["value"],
    F0 = {
        class: "kp-acts"
    },
    B0 = {
        key: 0,
        class: "cp-ok"
    },
    j0 = {
        key: 1,
        class: "cp-fail"
    },
    H0 = {
        key: 3,
        class: "hint"
    },
    K0 = {
        key: 4,
        class: "empty"
    },
    G0 = {
        key: 5
    },
    W0 = {
        class: "ops"
    },
    q0 = ["disabled", "onClick"],
    z0 = ["disabled", "onClick"],
    J0 = Fe({
        __name: "AdminView",
        setup(e) {
            const t = an(),
                n = me(() => t.role === "sysadmin"),
                s = w([]),
                o = w(!1),
                i = w(null),
                a = w(null),
                r = {
                    sysadmin: "系统管理员",
                    secadmin: "安全保密管理员",
                    auditor: "安全审计员"
                };
            async function u() {
                o.value = !0, i.value = null;
                try {
                    s.value = await Sv()
                } catch (A) {
                    i.value = Ae(A)
                } finally {
                    o.value = !1
                }
            }
            dt(() => {
                n.value && u()
            });
            const c = w(""),
                d = w("auditor"),
                f = w(!1),
                m = w(null),
                _ = w("");
            async function P() {
                a.value = null;
                const A = c.value.trim();
                if (!A) {
                    i.value = "请输入新账号名。";
                    return
                }
                f.value = !0, i.value = null;
                try {
                    const C = await Av({
                            username: A,
                            role: d.value
                        }),
                        T = await Gi(C.account_id);
                    m.value = {
                        username: C.username,
                        privateKey: T.private_key
                    }, _.value = "", c.value = "", await u()
                } catch (C) {
                    i.value = Ae(C)
                } finally {
                    f.value = !1
                }
            }
            async function E(A) {
                a.value = null, i.value = null;
                try {
                    const C = await Gi(A.account_id);
                    m.value = {
                        username: A.username,
                        privateKey: C.private_key
                    }, _.value = ""
                } catch (C) {
                    i.value = Ae(C)
                }
            }
            async function N() {
                m.value && (_.value = await Vr(m.value.privateKey) ? "ok" : "fail")
            }
            const M = w(null),
                L = w(!1);

            function K(A) {
                A.status === "disabled" ? I(A) : M.value = A
            }
            async function I(A) {
                L.value = !0, i.value = null;
                try {
                    const C = A.status === "disabled" ? "active" : "disabled";
                    await Rv(A.account_id, C), a.value = C === "disabled" ? `账号「${A.username}」已停用并吊销其全部会话。` : `账号「${A.username}」已启用。`, await u()
                } catch (C) {
                    i.value = Ae(C)
                } finally {
                    L.value = !1, M.value = null
                }
            }
            return (A, C) => {
                var T;
                return p(), h("div", null, [C[11] || (C[11] = l("h1", {
                    class: "title-zine",
                    "data-t": "账号管理"
                }, " 账号管理 ", -1)), C[12] || (C[12] = l("div", {
                    class: "lede"
                }, " 三员账号全生命周期管理（一人一岗）；账号停用即时吊销会话，私钥可重新签发（一次性展示） ", -1)), n.value ? (p(), h(ue, {
                    key: 1
                }, [i.value ? (p(), h("p", P0, " ⚠ " + v(i.value), 1)) : a.value ? (p(), h("p", M0, " ✓ " + v(a.value), 1)) : V("", !0), C[8] || (C[8] = l("div", {
                    class: "section-h"
                }, [l("span", {
                    class: "no"
                }, "1"), ee("新建账号 ")], -1)), l("div", N0, [he(l("input", {
                    "onUpdate:modelValue": C[0] || (C[0] = x => c.value = x),
                    placeholder: "新账号名（如 zhangsan）",
                    onKeyup: Tt(P, ["enter"])
                }, null, 544), [
                    [Ee, c.value]
                ]), he(l("select", {
                    "onUpdate:modelValue": C[1] || (C[1] = x => d.value = x)
                }, [...C[6] || (C[6] = [l("option", {
                    value: "sysadmin"
                }, " 系统管理员 ", -1), l("option", {
                    value: "secadmin"
                }, " 安全保密管理员 ", -1), l("option", {
                    value: "auditor"
                }, " 安全审计员 ", -1)])], 512), [
                    [pt, d.value]
                ]), l("button", {
                    class: "btn",
                    type: "button",
                    disabled: f.value,
                    onClick: P
                }, v(f.value ? "创建中…" : "创建并签发密钥 →"), 9, D0)]), m.value ? (p(), h("div", L0, [l("p", U0, " ⚠ 账号「" + v(m.value.username) + "」的 SM2 私钥（仅此一次展示，系统不留存副本） ", 1), l("textarea", {
                    class: "keyout",
                    readonly: "",
                    value: m.value.privateKey,
                    rows: "4",
                    onFocus: C[2] || (C[2] = x => x.target.select())
                }, null, 40, V0), l("div", F0, [l("button", {
                    type: "button",
                    class: "btn",
                    onClick: N
                }, " 复制私钥 "), _.value === "ok" ? (p(), h("span", B0, "✓ 已复制到剪贴板")) : _.value === "fail" ? (p(), h("span", j0, "复制失败：请在上面的文本框内手动全选复制，关闭本面板后将无法再次查看。")) : V("", !0), l("button", {
                    type: "button",
                    class: "btn ghost",
                    style: {
                        "margin-left": "auto"
                    },
                    onClick: C[3] || (C[3] = x => m.value = null)
                }, " 我已妥善保存，关闭 ")])])) : V("", !0), C[9] || (C[9] = l("div", {
                    class: "section-h"
                }, [l("span", {
                    class: "no"
                }, "2"), ee("账号列表 ")], -1)), o.value ? (p(), h("p", H0, " 加载中… ")) : s.value.length === 0 ? (p(), h("p", K0, " 暂无账号。 ")) : (p(), h("table", G0, [C[7] || (C[7] = l("thead", null, [l("tr", null, [l("th", null, "账号名"), l("th", null, "岗位角色"), l("th", null, "状态"), l("th", null, "连续失败次数"), l("th", null, "锁定至"), l("th", null, "创建时间"), l("th", null, "操作")])], -1)), l("tbody", null, [(p(!0), h(ue, null, Oe(s.value, x => (p(), h("tr", {
                    key: x.account_id
                }, [l("td", null, v(x.username), 1), l("td", null, v(r[x.role] ?? x.role), 1), l("td", null, [l("span", {
                    class: we(["lv", {
                        disabled: x.status !== "active"
                    }])
                }, v(x.status === "active" ? "启用" : "停用"), 3)]), l("td", null, v(x.failed_attempts), 1), l("td", null, v(x.locked_until ?? "—"), 1), l("td", null, v(x.created_at ?? "—"), 1), l("td", W0, [l("button", {
                    type: "button",
                    class: "btn link",
                    disabled: L.value,
                    onClick: W => K(x)
                }, v(x.status === "active" ? "停用" : "启用"), 9, q0), l("button", {
                    type: "button",
                    class: "btn link",
                    disabled: L.value,
                    onClick: W => E(x)
                }, " 重新签发密钥… ", 8, z0)])]))), 128))])])), C[10] || (C[10] = l("p", {
                    class: "hint"
                }, " 「重新签发密钥」会使旧私钥立即失效（私钥丢失或疑似泄露时使用）；新私钥仅展示一次。 ", -1))], 64)) : (p(), h("div", O0, " 本页面仅系统管理员可用。当前登录身份无权限查看账号管理。 ")), Re(Vn, {
                    open: M.value !== null,
                    title: "停用账号确认",
                    message: `停用后账号「${((T=M.value)==null?void 0:T.username)??""}」将立即无法登录，其全部会话被吊销；可随时再启用。确认停用？`,
                    "confirm-text": "停用账号",
                    danger: "",
                    onConfirm: C[4] || (C[4] = x => M.value && I(M.value)),
                    onCancel: C[5] || (C[5] = x => M.value = null)
                }, null, 8, ["open", "message"])])
            }
        }
    }),
    X0 = We(J0, [
        ["__scopeId", "data-v-dc2460dd"]
    ]),
    Y0 = {
        key: 0,
        class: "err show"
    },
    Q0 = {
        key: 1,
        class: "ok-msg"
    },
    Z0 = {
        key: 2,
        class: "cards"
    },
    ew = {
        class: "card"
    },
    tw = {
        class: "rowline"
    },
    nw = {
        class: "kv"
    },
    sw = {
        class: "kv"
    },
    lw = {
        key: 0
    },
    ow = {
        key: 0,
        class: "hint errline"
    },
    iw = {
        key: 1,
        class: "hint"
    },
    aw = {
        class: "card"
    },
    rw = {
        class: "kv"
    },
    uw = {
        class: "kv"
    },
    cw = {
        key: 1,
        class: "kv"
    },
    dw = {
        class: "card"
    },
    fw = {
        class: "kv"
    },
    vw = ["disabled"],
    pw = {
        key: 1,
        class: "kv"
    },
    hw = {
        class: "svc"
    },
    mw = {
        class: "kv"
    },
    gw = {
        key: 0,
        class: "chip warn"
    },
    yw = {
        key: 1,
        class: "kv muted"
    },
    bw = {
        key: 0,
        class: "empty"
    },
    _w = {
        class: "section-h"
    },
    ww = {
        class: "actions"
    },
    kw = ["disabled"],
    $w = ["disabled"],
    Cw = {
        class: "kv inline"
    },
    Ew = {
        key: 1,
        class: "kv"
    },
    xw = {
        key: 3,
        class: "hint"
    },
    Sw = {
        key: 4,
        class: "empty"
    },
    Aw = {
        key: 5,
        class: "empty"
    },
    Rw = {
        key: 6,
        class: "mlist"
    },
    Tw = {
        class: "mname"
    },
    Iw = {
        key: 0,
        class: "chip muted"
    },
    Ow = {
        key: 1,
        class: "chip muted"
    },
    Pw = {
        key: 2,
        class: "chip bad"
    },
    Mw = {
        class: "mpath"
    },
    Nw = {
        key: 0,
        class: "hint errline"
    },
    Dw = {
        class: "hint"
    },
    Lw = {
        key: 1,
        class: "kv"
    },
    Uw = ["disabled", "onClick"],
    Vw = {
        class: "actions"
    },
    Fw = ["disabled"],
    Bw = {
        class: "dirs"
    },
    jw = ["disabled", "onClick"],
    Hw = {
        key: 0,
        class: "kv"
    },
    Kw = {
        key: 7,
        class: "hint"
    },
    Gw = Fe({
        __name: "LlmView",
        setup(e) {
            const t = an(),
                n = me(() => t.role === "sysadmin"),
                s = w(null),
                o = w([]),
                i = w([]),
                a = w({
                    total: 0,
                    local: 0,
                    service: 0,
                    infeasible: 0
                }),
                r = w(!1),
                u = w(!1),
                c = w(null),
                d = w(null),
                f = w(""),
                m = w(!1);
            let _ = null;
            const P = {
                    starting: "启动中",
                    ready: "就绪",
                    error: "故障",
                    unavailable: "端点未运行",
                    auth_required: "需要 API Key",
                    disabled: "已关闭",
                    stopped: "已停止"
                },
                E = {
                    ready: "ok",
                    starting: "warn",
                    unavailable: "warn",
                    auth_required: "warn",
                    error: "bad",
                    disabled: "muted",
                    stopped: "muted"
                },
                N = {
                    full_gpu: "可全量上卡",
                    tight: "余量紧张",
                    partial_offload: "需部分 offload",
                    infeasible: "跑不动（走 CPU）",
                    unknown: "未知"
                },
                M = {
                    full_gpu: "ok",
                    tight: "warn",
                    partial_offload: "warn",
                    infeasible: "bad",
                    unknown: "muted"
                },
                L = me(() => {
                    var H;
                    return ((H = s.value) == null ? void 0 : H.scan) ?? null
                }),
                K = me(() => {
                    var H;
                    return ((H = L.value) == null ? void 0 : H.state) === "running"
                }),
                I = me(() => {
                    var H;
                    return ((H = s.value) == null ? void 0 : H.engine) ?? null
                }),
                A = me(() => {
                    var H;
                    return ((H = s.value) == null ? void 0 : H.selection) ?? null
                }),
                C = me(() => m.value ? o.value.filter(H => {
                    var ne;
                    return H.available && ((ne = H.vram) == null ? void 0 : ne.verdict) !== "infeasible"
                }) : o.value);

            function T(H) {
                return !H || H <= 0 ? "—" : `${(H/1024**3).toFixed(2)} GB`
            }

            function x(H) {
                return H.max_ctx ? `${(H.max_ctx/1024).toFixed(0)}K` : "—"
            }
            async function W() {
                r.value = !0, c.value = null;
                try {
                    const [H, ne] = await Promise.all([Wi(), Pv(!0)]);
                    s.value = H, o.value = ne.models, i.value = ne.services, a.value = {
                        total: ne.counts.total,
                        local: ne.counts.local,
                        service: ne.counts.service,
                        infeasible: ne.counts.infeasible
                    }
                } catch (H) {
                    c.value = Ae(H)
                } finally {
                    r.value = !1
                }
            }
            async function te(H, ne) {
                u.value = !0, c.value = null, d.value = null;
                try {
                    await H(), d.value = ne, await W()
                } catch (Ne) {
                    c.value = Ae(Ne)
                } finally {
                    u.value = !1
                }
            }

            function de(H) {
                te(() => Dv(H.id), `已选中「${H.display_name}」（引擎热应用，加载需数秒到数十秒）`)
            }

            function B() {
                te(Lv, "已回落到配置文件默认")
            }

            function k() {
                te(Mv, "已启动模型扫描（后台进行，可继续操作）")
            }

            function $() {
                te(Nv, "已请求取消扫描（已扫到的结果保留）")
            }

            function j() {
                const H = f.value.trim();
                H && te(async () => {
                    await Uv(H), f.value = ""
                }, `已添加模型目录：${H}`)
            }

            function le(H) {
                te(() => Vv(H), `已移除目录登记（磁盘文件未动）：${H}`)
            }
            return dt(() => {
                W();
                let H = !1;
                _ = setInterval(async () => {
                    var ne, Ne;
                    if (!(u.value || H)) {
                        H = !0;
                        try {
                            if (s.value = await Wi(), K.value || ((ne = I.value) == null ? void 0 : ne.state) === "starting") return;
                            ((Ne = L.value) == null ? void 0 : Ne.state) === "done" && W()
                        } catch {} finally {
                            H = !1
                        }
                    }
                }, 3e3)
            }), wn(() => {
                _ !== null && clearInterval(_)
            }), (H, ne) => {
                var Ne, se, b, ve, De;
                return p(), h("div", null, [ne[8] || (ne[8] = l("h1", {
                    class: "title-zine",
                    "data-t": "本地大模型"
                }, " 本地大模型 ", -1)), ne[9] || (ne[9] = l("div", {
                    class: "lede"
                }, " 发现本机已有的 GGUF 模型与在跑的推理服务，选中后热应用为本次会话的本地模型（全程只读扫描，不复制、不上传） ", -1)), c.value ? (p(), h("p", Y0, " ⚠ " + v(c.value), 1)) : d.value ? (p(), h("p", Q0, " ✓ " + v(d.value), 1)) : V("", !0), ne[10] || (ne[10] = l("div", {
                    class: "section-h"
                }, [l("span", {
                    class: "no"
                }, "1"), ee("引擎状态 ")], -1)), I.value ? (p(), h("div", Z0, [l("div", ew, [ne[2] || (ne[2] = l("div", {
                    class: "card-t"
                }, " 运行状态 ", -1)), l("div", tw, [l("span", {
                    class: we(["chip", E[I.value.state] ?? "muted"])
                }, v(P[I.value.state] ?? I.value.state), 3), l("span", nw, "方式：" + v(I.value.mode === "managed" ? "本进程拉起" : "连接已有服务"), 1)]), l("div", sw, [ee(" 端点：" + v(I.value.endpoint || "—") + " ", 1), I.value.adopted ? (p(), h("span", lw, "（复用外部实例，退出时不回收）")) : V("", !0)]), I.value.error ? (p(), h("p", ow, v(I.value.error), 1)) : V("", !0), I.value.advice ? (p(), h("p", iw, v(I.value.advice), 1)) : V("", !0)]), l("div", aw, [ne[3] || (ne[3] = l("div", {
                    class: "card-t"
                }, " 本机显存 ", -1)), (Ne = s.value) != null && Ne.gpu ? (p(), h(ue, {
                    key: 0
                }, [l("div", rw, v(s.value.gpu.name), 1), l("div", uw, " 空闲 " + v(T(s.value.gpu.free_bytes)) + " / 共 " + v(T(s.value.gpu.total_bytes)), 1)], 64)) : (p(), h("div", cw, " 未检测到 GPU 信息 "))]), l("div", dw, [ne[4] || (ne[4] = l("div", {
                    class: "card-t"
                }, " 已选中 ", -1)), (se = A.value) != null && se.active_id ? (p(), h(ue, {
                    key: 0
                }, [l("div", fw, v(A.value.model_path || A.value.endpoint || A.value.active_id), 1), l("button", {
                    class: "btn",
                    type: "button",
                    disabled: u.value || !n.value,
                    onClick: B
                }, " 回落到配置默认 ", 8, vw)], 64)) : (p(), h("div", pw, " 未显式选中（按配置文件默认运行） "))])])) : V("", !0), ne[11] || (ne[11] = l("div", {
                    class: "section-h"
                }, [l("span", {
                    class: "no"
                }, "2"), ee("本机推理服务 ")], -1)), l("div", hw, [(p(!0), h(ue, null, Oe(i.value, pe => (p(), h("div", {
                    key: pe.base_url,
                    class: "svc-row"
                }, [l("span", {
                    class: we(["chip", pe.reachable && pe.health_ok ? "ok" : "muted"])
                }, v(pe.reachable && pe.health_ok ? "在线" : "未运行"), 3), l("code", null, v(pe.base_url), 1), l("span", mw, v(pe.models.length) + " 个模型", 1), pe.needs_auth ? (p(), h("span", gw, "需要 Key")) : V("", !0), pe.error && !pe.models.length ? (p(), h("span", yw, v(pe.error), 1)) : V("", !0)]))), 128)), i.value.length ? V("", !0) : (p(), h("div", bw, " 未探测到可用的本机推理服务。 "))]), l("div", _w, [ne[5] || (ne[5] = l("span", {
                    class: "no"
                }, "3", -1)), ee("可选模型（" + v(a.value.total) + " 个：本地 " + v(a.value.local) + " / 服务 " + v(a.value.service) + "） ", 1)]), l("div", ww, [l("button", {
                    class: "btn",
                    type: "button",
                    disabled: u.value || !n.value || K.value,
                    onClick: k
                }, v(K.value ? "扫描中…" : "开始扫描本机模型"), 9, kw), K.value ? (p(), h("button", {
                    key: 0,
                    class: "btn",
                    type: "button",
                    disabled: u.value,
                    onClick: $
                }, " 取消扫描 ", 8, $w)) : V("", !0), l("label", Cw, [he(l("input", {
                    "onUpdate:modelValue": ne[0] || (ne[0] = pe => m.value = pe),
                    type: "checkbox"
                }, null, 512), [
                    [kn, m.value]
                ]), ne[6] || (ne[6] = ee(" 只显示当前跑得动的 ", -1))]), K.value && L.value ? (p(), h("span", Ew, v(L.value.progress.current || "遍历中…") + "（已扫 " + v(L.value.progress.dirs) + " 个目录 / 命中 " + v(L.value.found) + "）", 1)) : V("", !0)]), a.value.infeasible > 0 ? (p(), h("p", xw, " 其中 " + v(a.value.infeasible) + " 个在所有本机显存条件下都无法全量上卡（会退回 CPU 推理）——仍会列出，不做隐藏。 ", 1)) : V("", !0), r.value && !o.value.length ? (p(), h("div", Sw, " 正在读取模型清单… ")) : C.value.length ? (p(), h("table", Rw, [ne[7] || (ne[7] = l("thead", null, [l("tr", null, [l("th", null, "模型"), l("th", null, "来源"), l("th", null, "量化"), l("th", {
                    title: "权重文件声明的能力上限，不等于服务实际启动的 -c"
                }, " 上限 ctx "), l("th", {
                    title: "按当前空闲显存估算的运行占用"
                }, " 显存 "), l("th", null, "操作")])], -1)), l("tbody", null, [(p(!0), h(ue, null, Oe(C.value, pe => (p(), h("tr", {
                    key: pe.id,
                    class: we({
                        active: pe.active
                    })
                }, [l("td", null, [l("div", Tw, [ee(v(pe.display_name) + " ", 1), pe.is_embedding ? (p(), h("span", Iw, "向量")) : V("", !0), pe.duplicate_count ? (p(), h("span", Ow, "另有 " + v(pe.duplicate_count) + " 份副本", 1)) : V("", !0), pe.available ? V("", !0) : (p(), h("span", Pw, "不可用"))]), l("div", Mw, v(pe.source === "local" ? pe.path : pe.endpoint), 1), pe.error ? (p(), h("div", Nw, v(pe.error), 1)) : V("", !0)]), l("td", null, v(pe.source === "local" ? "本地文件" : "已有服务"), 1), l("td", null, v(pe.quant || "—"), 1), l("td", null, v(x(pe)), 1), l("td", null, [pe.vram ? (p(), h(ue, {
                    key: 0
                }, [l("span", {
                    class: we(["chip", M[pe.vram.verdict] ?? "muted"])
                }, v(N[pe.vram.verdict] ?? pe.vram.verdict), 3), l("div", Dw, v(T(pe.vram.needed_bytes)) + " / 可用 " + v(T(pe.vram.free_vram_bytes)), 1)], 64)) : (p(), h("span", Lw, "不占本机显存"))]), l("td", null, [l("button", {
                    class: "btn",
                    type: "button",
                    disabled: u.value || !n.value || !pe.available || pe.active,
                    onClick: qe => de(pe)
                }, v(pe.active ? "使用中" : "选中"), 9, Uw)])], 2))), 128))])])) : (p(), h("div", Aw, " 未发现模型。可在下方添加模型目录，或先启动本机的推理服务。 ")), ne[12] || (ne[12] = l("div", {
                    class: "section-h"
                }, [l("span", {
                    class: "no"
                }, "4"), ee("模型目录 ")], -1)), l("div", Vw, [he(l("input", {
                    "onUpdate:modelValue": ne[1] || (ne[1] = pe => f.value = pe),
                    placeholder: "添加目录，如 E:\\llama-cpp\\models",
                    onKeyup: Tt(j, ["enter"])
                }, null, 544), [
                    [Ee, f.value]
                ]), l("button", {
                    class: "btn",
                    type: "button",
                    disabled: u.value || !n.value || !f.value.trim(),
                    onClick: j
                }, " 添加目录 ", 8, Fw)]), l("div", Bw, [(p(!0), h(ue, null, Oe(((b = s.value) == null ? void 0 : b.model_dirs) ?? [], pe => (p(), h("div", {
                    key: pe,
                    class: "dir-row"
                }, [l("code", null, v(pe), 1), l("button", {
                    class: "btn",
                    type: "button",
                    disabled: u.value || !n.value,
                    onClick: qe => le(pe)
                }, " 移除登记 ", 8, jw)]))), 128)), (De = (ve = s.value) == null ? void 0 : ve.model_dirs) != null && De.length ? V("", !0) : (p(), h("div", Hw, " 未添加额外目录（扫描范围默认覆盖本机全部固定盘）。 "))]), n.value ? V("", !0) : (p(), h("p", Kw, " 当前身份只读：选中模型、增删目录与扫描需系统管理员权限。 "))])
            }
        }
    }),
    Ww = We(Gw, [
        ["__scopeId", "data-v-8b5b21b5"]
    ]),
    qw = [{
        path: "/",
        redirect: "/journey"
    }, {
        path: "/login",
        name: "login",
        component: Fr
    }, {
        path: "/journey",
        name: "journey",
        component: jb
    }, {
        path: "/batch",
        name: "batch",
        component: Um
    }, {
        path: "/archive",
        name: "archive",
        component: sh
    }, {
        path: "/device",
        name: "device",
        component: p1
    }, {
        path: "/viewer",
        name: "viewer",
        component: I0
    }, {
        path: "/std-eval",
        name: "std-eval",
        component: e0
    }, {
        path: "/admin",
        name: "admin",
        component: X0
    }, {
        path: "/llm",
        name: "llm",
        component: Ww
    }];

function zw(e = vf()) {
    const t = Mf({
        history: e,
        routes: qw
    });
    return t.beforeEach(n => {
        const s = $n() !== "" || Mr();
        return !s && n.name !== "login" ? {
            name: "login"
        } : s && n.name === "login" ? {
            name: "journey"
        } : !0
    }), t
}
const Jw = zw();

function Xw(e) {
    return e === "batch" || e === "archive" || e === "device" || e === "journey" || e === "viewer" || e === "std-eval" || e === "admin" || e === "llm" ? e : "journey"
}
const Yw = {
        class: "app-shell"
    },
    Qw = {
        class: "doctabs"
    },
    Zw = {
        class: "main"
    },
    ek = ["aria-label"],
    tk = {
        class: "d-head"
    },
    nk = {
        key: 0,
        class: "d-body"
    },
    sk = {
        key: 1,
        class: "d-body about"
    },
    lk = {
        class: "ver"
    },
    ok = {
        class: "d-foot"
    },
    ik = {
        class: "dialog",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "检测人员信息"
    },
    ak = {
        class: "d-head"
    },
    rk = {
        class: "d-body"
    },
    uk = {
        class: "d-foot"
    },
    ck = {
        class: "dialog",
        role: "alertdialog",
        "aria-modal": "true",
        "aria-label": "退出应用"
    },
    dk = {
        class: "d-foot"
    },
    fk = Fe({
        __name: "AppShell",
        setup(e) {
            const t = _o(),
                n = ys(),
                s = Io(),
                o = me(() => Xw(t.name)),
                i = me(() => s.operator),
                a = w("none"),
                r = Df.version,
                u = [{
                    id: "journey",
                    label: "单幅评定"
                }, {
                    id: "batch",
                    label: "批量评定"
                }, {
                    id: "archive",
                    label: "检测档案"
                }, {
                    id: "device",
                    label: "设备标定"
                }, {
                    id: "viewer",
                    label: "底片观察"
                }, {
                    id: "std-eval",
                    label: "系统评价"
                }, {
                    id: "llm",
                    label: "本地大模型"
                }];

            function c(T) {
                n.push({
                    name: T
                })
            }

            function d() {
                s.requestFileOpen("image"), c("journey")
            }

            function f() {
                s.requestFileOpen("batch"), c("batch")
            }
            const m = w(!1),
                _ = w(""),
                P = w(null);

            function E() {
                _.value = i.value, m.value = !0, Gt(() => {
                    var T;
                    return (T = P.value) == null ? void 0 : T.focus()
                })
            }

            function N() {
                s.setOperator(_.value.trim()), m.value = !1
            }
            const M = w(!1);

            function L() {
                window.close(), window.setTimeout(() => {
                    M.value = !0
                }, 300)
            }

            function K(T) {
                switch (T) {
                    case "open-image":
                        d();
                        break;
                    case "open-batch":
                        f();
                        break;
                    case "view-journey":
                        c("journey");
                        break;
                    case "view-batch":
                        c("batch");
                        break;
                    case "view-archive":
                        c("archive");
                        break;
                    case "view-device":
                        c("device");
                        break;
                    case "view-viewer":
                        c("viewer");
                        break;
                    case "view-std-eval":
                        c("std-eval");
                        break;
                    case "view-llm":
                        c("llm");
                        break;
                    case "view-admin":
                        c("admin");
                        break;
                    case "operator":
                        E();
                        break;
                    case "shortcuts":
                        a.value = "shortcuts";
                        break;
                    case "about":
                        a.value = "about";
                        break;
                    case "exit":
                        L();
                        break
                }
            }
            const I = w(null);

            function A(T) {
                T.key === "Escape" && a.value !== "none" && (a.value = "none")
            }
            et(a, T => {
                T !== "none" && Gt(() => {
                    var x;
                    return (x = I.value) == null ? void 0 : x.focus()
                })
            });

            function C(T) {
                if (!(T.ctrlKey || T.metaKey)) return;
                const x = T.key.toLowerCase();
                if (x === "1") c("journey");
                else if (x === "2") c("batch");
                else if (x === "3") c("archive");
                else if (x === "4") c("device");
                else if (x === "5") c("viewer");
                else if (x === "6") c("std-eval");
                else if (x === "7") c("llm");
                else if (x === "o" && T.shiftKey) f();
                else if (x === "o") d();
                else return;
                T.preventDefault()
            }
            return dt(() => {
                window.addEventListener("keydown", C), window.addEventListener("keydown", A)
            }), _n(() => {
                window.removeEventListener("keydown", C), window.removeEventListener("keydown", A)
            }), (T, x) => {
                const W = Zu("router-link");
                return p(), h("div", Yw, [Re(Zv, {
                    "active-view": o.value,
                    onAction: K
                }, null, 8, ["active-view"]), Re(ap, {
                    "active-view": o.value,
                    operator: i.value,
                    onAction: K,
                    onView: c
                }, null, 8, ["active-view", "operator"]), l("div", Qw, [(p(), h(ue, null, Oe(u, te => Re(W, {
                    key: te.id,
                    to: {
                        name: te.id
                    },
                    class: we(["doctab", {
                        on: o.value === te.id
                    }])
                }, {
                    default: is(() => [ee(v(te.label), 1)]),
                    _: 2
                }, 1032, ["to", "class"])), 64))]), l("main", Zw, [Re(ye(Pr), null, {
                    default: is(({
                        Component: te
                    }) => [(p(), Wt(ec(te), {
                        onArchive: x[0] || (x[0] = de => c("archive"))
                    }, null, 32))]),
                    _: 1
                })]), Re(pp), a.value !== "none" ? (p(), h("div", {
                    key: 0,
                    class: "overlay",
                    onClick: x[3] || (x[3] = Je(te => a.value = "none", ["self"]))
                }, [l("div", {
                    class: "dialog",
                    role: "dialog",
                    "aria-modal": "true",
                    "aria-label": a.value === "shortcuts" ? "键盘快捷键" : "关于"
                }, [l("div", tk, [ee(v(a.value === "shortcuts" ? "键盘快捷键" : "关于") + " ", 1), l("button", {
                    type: "button",
                    class: "x",
                    "aria-label": "关闭",
                    onClick: x[1] || (x[1] = te => a.value = "none")
                }, " × ")]), a.value === "shortcuts" ? (p(), h("div", nk, [...x[11] || (x[11] = [bn('<table class="keys" data-v-61c0995d><tbody data-v-61c0995d><tr data-v-61c0995d><td data-v-61c0995d>打开影像</td><td data-v-61c0995d>Ctrl+O</td></tr><tr data-v-61c0995d><td data-v-61c0995d>批量导入</td><td data-v-61c0995d>Ctrl+Shift+O</td></tr><tr data-v-61c0995d><td data-v-61c0995d>单幅评定</td><td data-v-61c0995d>Ctrl+1</td></tr><tr data-v-61c0995d><td data-v-61c0995d>批量评定</td><td data-v-61c0995d>Ctrl+2</td></tr><tr data-v-61c0995d><td data-v-61c0995d>检测档案</td><td data-v-61c0995d>Ctrl+3</td></tr><tr data-v-61c0995d><td data-v-61c0995d>设备标定</td><td data-v-61c0995d>Ctrl+4</td></tr><tr data-v-61c0995d><td data-v-61c0995d>底片观察</td><td data-v-61c0995d>Ctrl+5</td></tr><tr data-v-61c0995d><td data-v-61c0995d>系统评价</td><td data-v-61c0995d>Ctrl+6</td></tr><tr data-v-61c0995d><td data-v-61c0995d>本地大模型</td><td data-v-61c0995d>Ctrl+7</td></tr><tr data-v-61c0995d><td data-v-61c0995d>退出</td><td data-v-61c0995d>Alt+F4 / 窗口关闭按钮</td></tr></tbody></table>', 1)])])) : (p(), h("div", sk, [x[12] || (x[12] = l("div", {
                    class: "logo"
                }, null, -1)), x[13] || (x[13] = l("p", {
                    class: "app-name"
                }, " 射线焊缝缺陷智能检测系统 ", -1)), l("p", lk, " 版本 " + v(ye(r)) + " · 本地化部署 ", 1), x[14] || (x[14] = l("p", {
                    class: "ver"
                }, [ee(" 依据 NB/T 47013.2-2015 执行焊缝缺陷智能评定"), l("br"), ee(" 检测数据全程本地化处理，不经外部网络传输 ")], -1))])), l("div", ok, [l("button", {
                    ref_key: "helpOkBtn",
                    ref: I,
                    type: "button",
                    class: "ok",
                    onClick: x[2] || (x[2] = te => a.value = "none")
                }, " 确定 ", 512)])], 8, ek)])) : V("", !0), m.value ? (p(), h("div", {
                    key: 1,
                    class: "overlay",
                    onClick: x[7] || (x[7] = Je(te => m.value = !1, ["self"])),
                    onKeydown: x[8] || (x[8] = Tt(te => m.value = !1, ["escape"]))
                }, [l("div", ik, [l("div", ak, [x[15] || (x[15] = ee(" 检测人员信息 ", -1)), l("button", {
                    type: "button",
                    class: "x",
                    "aria-label": "关闭",
                    onClick: x[4] || (x[4] = te => m.value = !1)
                }, " × ")]), l("div", rk, [x[16] || (x[16] = l("label", {
                    class: "op-field",
                    for: "operator-name"
                }, "检测人员姓名（用于报告签署与审计追溯）", -1)), he(l("input", {
                    id: "operator-name",
                    ref_key: "operatorInput",
                    ref: P,
                    "onUpdate:modelValue": x[5] || (x[5] = te => _.value = te),
                    type: "text",
                    onKeyup: Tt(N, ["enter"])
                }, null, 544), [
                    [Ee, _.value]
                ])]), l("div", uk, [l("button", {
                    type: "button",
                    class: "ok",
                    onClick: x[6] || (x[6] = te => m.value = !1)
                }, " 取消 "), l("button", {
                    type: "button",
                    class: "ok primary",
                    onClick: N
                }, " 保存 ")])])], 32)) : V("", !0), M.value ? (p(), h("div", {
                    key: 2,
                    class: "overlay",
                    onClick: x[10] || (x[10] = Je(te => M.value = !1, ["self"]))
                }, [l("div", ck, [x[17] || (x[17] = l("div", {
                    class: "d-head"
                }, " 退出应用 ", -1)), x[18] || (x[18] = l("div", {
                    class: "d-body"
                }, " 当前运行环境不允许本页自动关闭窗口。请点击窗口右上角的关闭按钮 ×，或按 Alt+F4 退出应用。 ", -1)), l("div", dk, [l("button", {
                    type: "button",
                    class: "ok",
                    onClick: x[9] || (x[9] = te => M.value = !1)
                }, " 知道了 ")])])])) : V("", !0)])
            }
        }
    }),
    vk = We(fk, [
        ["__scopeId", "data-v-61c0995d"]
    ]),
    pk = {
        key: 0,
        class: "offline-banner",
        role: "alert"
    },
    hk = {
        key: 1,
        class: "offline-banner loading",
        role: "status"
    },
    mk = {
        key: 0,
        class: "offline-banner idle-warn",
        role: "alert"
    },
    gk = Fe({
        __name: "App",
        setup(e) {
            const t = Lr(),
                n = an(),
                s = _o(),
                o = ys();
            dt(() => {
                t.bind(), t.start(), n.bindIdleWatch(), n.restore(), a()
            });
            const i = window.desktop;

            function a() {
                i && i.onCloseRequested(() => {
                    r.value = !0
                })
            }
            const r = w(!1);

            function u() {
                r.value = !1, Bt.value = null, i == null || i.confirmQuit()
            }
            return et(Bt, c => {
                if (i) {
                    i.setBusy(!!c), window.onbeforeunload = null;
                    return
                }
                window.onbeforeunload = c ? d => (d.preventDefault(), d.returnValue = "评定任务正在进行中，关闭将中断任务。", d.returnValue) : null
            }), et(() => n.isLoggedIn, c => {
                !c && s.name !== "login" && o.push("/login")
            }), wn(() => {
                t.unbind(), n.unbindIdleWatch()
            }), (c, d) => (p(), h(ue, null, [ye(s).name === "login" ? (p(), Wt(Fr, {
                key: 0
            })) : (p(), Wt(vk, {
                key: 1
            })), Re(li, {
                name: "fade"
            }, {
                default: is(() => [ye(t).backendDown ? (p(), h("div", pk, [...d[1] || (d[1] = [l("span", {
                    class: "dot"
                }, null, -1), ee(" 推理服务正在启动或未连接，系统自动重试中…（冷启动需导入推理依赖，可能需要 1~3 分钟，请保持窗口开启） ", -1)])])) : ye(t).modelLoading ? (p(), h("div", hk, [...d[2] || (d[2] = [l("span", {
                    class: "dot"
                }, null, -1), ee(" 评定模型加载中，评定功能稍后可用（档案查阅不受影响）… ", -1)])])) : V("", !0)]),
                _: 1
            }), Re(li, {
                name: "fade"
            }, {
                default: is(() => [ye(n).isLoggedIn && ye(n).idleWarning ? (p(), h("div", mk, [...d[3] || (d[3] = [l("span", {
                    class: "dot"
                }, null, -1), ee(" 已空闲较久，即将自动退出登录（约 1 分钟内）；移动鼠标或按任意键可继续保持登录 ", -1)])])) : V("", !0)]),
                _: 1
            }), Re(Vn, {
                open: r.value,
                title: "退出确认",
                message: ye(Bt) === "batch" ? "批量评定正在进行中，关闭窗口将中断本机评定任务（已完成的结果已保存，未完成的可重新提交）。确定要关闭吗？" : "单幅评定正在进行中，关闭窗口将放弃本次评定。确定要关闭吗？",
                "confirm-text": "关闭窗口",
                danger: "",
                onConfirm: u,
                onCancel: d[0] || (d[0] = f => r.value = !1)
            }, null, 8, ["open", "message"])], 64))
        }
    }),
    yk = We(gk, [
        ["__scopeId", "data-v-f58c2ef9"]
    ]),
    Oo = bd(yk);
Oo.use(kd());
Oo.use(Jw);
Oo.mount("#app");
window.addEventListener("unhandledrejection", e => {
    console.error("[unhandledrejection]", e.reason)
});
window.addEventListener("error", e => {
    console.error("[window.error]", e.message)
});