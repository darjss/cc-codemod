// ../node_modules/effect/dist/Pipeable.js
var pipeArguments = (self, args) => {
  switch (args.length) {
    case 0:
      return self;
    case 1:
      return args[0](self);
    case 2:
      return args[1](args[0](self));
    case 3:
      return args[2](args[1](args[0](self)));
    case 4:
      return args[3](args[2](args[1](args[0](self))));
    case 5:
      return args[4](args[3](args[2](args[1](args[0](self)))));
    case 6:
      return args[5](args[4](args[3](args[2](args[1](args[0](self))))));
    case 7:
      return args[6](args[5](args[4](args[3](args[2](args[1](args[0](self)))))));
    case 8:
      return args[7](args[6](args[5](args[4](args[3](args[2](args[1](args[0](self))))))));
    case 9:
      return args[8](args[7](args[6](args[5](args[4](args[3](args[2](args[1](args[0](self)))))))));
    default: {
      let ret = self;
      for (let i = 0, len = args.length;i < len; i++) {
        ret = args[i](ret);
      }
      return ret;
    }
  }
};
var Prototype = {
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var Class = /* @__PURE__ */ function() {
  function PipeableBase() {}
  PipeableBase.prototype = Prototype;
  return PipeableBase;
}();

// ../node_modules/effect/dist/Function.js
var dual = function(arity, body) {
  if (typeof arity === "function") {
    return function() {
      return arity(arguments) ? body.apply(this, arguments) : (self) => body(self, ...arguments);
    };
  }
  switch (arity) {
    case 0:
    case 1:
      throw new RangeError(`Invalid arity ${arity}`);
    case 2:
      return function(a, b) {
        if (arguments.length >= 2) {
          return body(a, b);
        }
        return function(self) {
          return body(self, a);
        };
      };
    case 3:
      return function(a, b, c) {
        if (arguments.length >= 3) {
          return body(a, b, c);
        }
        return function(self) {
          return body(self, a, b);
        };
      };
    default:
      return function() {
        if (arguments.length >= arity) {
          return body.apply(this, arguments);
        }
        const args = arguments;
        return function(self) {
          return body(self, ...args);
        };
      };
  }
};
var identity = (a) => a;
var constant = (value) => () => value;
var constTrue = /* @__PURE__ */ constant(true);
var constUndefined = /* @__PURE__ */ constant(undefined);
var constVoid = constUndefined;
function memoize(f) {
  const cache = new WeakMap;
  return (a) => {
    const cached = cache.get(a);
    if (cached !== undefined)
      return cached;
    const result = f(a);
    cache.set(a, result);
    return result;
  };
}
function memoizeIdempotent(f) {
  const cache = new WeakMap;
  return (a) => {
    const cached = cache.get(a);
    if (cached !== undefined)
      return cached;
    const result = f(a);
    cache.set(a, result);
    if (result !== a) {
      cache.set(result, result);
    }
    return result;
  };
}

// ../node_modules/effect/dist/internal/equal.js
var getAllObjectKeys = (obj) => {
  const keys = new Set(Reflect.ownKeys(obj));
  if (obj.constructor === Object)
    return keys;
  if (obj instanceof Error) {
    keys.delete("stack");
  }
  const proto = Object.getPrototypeOf(obj);
  let current = proto;
  while (current !== null && current !== Object.prototype) {
    const ownKeys = Reflect.ownKeys(current);
    for (let i = 0;i < ownKeys.length; i++) {
      keys.add(ownKeys[i]);
    }
    current = Object.getPrototypeOf(current);
  }
  if (keys.has("constructor") && typeof obj.constructor === "function" && proto === obj.constructor.prototype) {
    keys.delete("constructor");
  }
  return keys;
};
var byReferenceInstances = /* @__PURE__ */ new WeakSet;
var viewBytes = (view) => new Uint8Array(view.buffer, view.byteOffset, view.byteLength);

// ../node_modules/effect/dist/internal/hash.js
var backEdges = 0;
var addBackEdge = () => {
  backEdges++;
};

// ../node_modules/effect/dist/Predicate.js
function isString(input) {
  return typeof input === "string";
}
function isNumber(input) {
  return typeof input === "number";
}
function isBoolean(input) {
  return typeof input === "boolean";
}
function isFunction(input) {
  return typeof input === "function";
}
function isNotNullish(input) {
  return input != null;
}
function isUnknown(_) {
  return true;
}
function isObject(input) {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}
function isObjectKeyword(input) {
  return typeof input === "object" && input !== null || isFunction(input);
}
var hasProperty = /* @__PURE__ */ dual(2, (self, property) => isObjectKeyword(self) && (property in self));
function isError(input) {
  return input instanceof Error;
}
function isIterable(input) {
  return hasProperty(input, Symbol.iterator) || isString(input);
}

// ../node_modules/effect/dist/Hash.js
var symbol = "~effect/Hash";
var hash = (self) => {
  switch (typeof self) {
    case "number":
      return number(self);
    case "bigint":
      return string(self.toString(10));
    case "string":
      return string(self);
    case "function":
    case "object": {
      if (self === null) {
        break;
      } else if (self instanceof Date) {
        if (Number.isNaN(self.getTime())) {
          return string("Invalid Date");
        }
        return string(self.toISOString());
      } else if (self instanceof RegExp) {
        return string(self.toString());
      } else {
        if (byReferenceInstances.has(self)) {
          return random(self);
        }
        const cached = hashCache.get(self);
        if (cached !== undefined) {
          return cached;
        }
        if (visitedObjects.has(self)) {
          addBackEdge();
          return string("[Circular]");
        }
        visitedObjects.add(self);
        const seen = backEdges;
        let h;
        try {
          if (symbol in self) {
            h = self[symbol]();
          } else if (typeof self === "function") {
            h = random(self);
          } else if (self instanceof DataView) {
            h = array(viewBytes(self));
          } else if (Array.isArray(self) || ArrayBuffer.isView(self)) {
            h = array(self);
          } else if (self instanceof Map) {
            h = hashMap(self);
          } else if (self instanceof Set) {
            h = hashSet(self);
          } else {
            h = structure(self);
          }
        } finally {
          visitedObjects.delete(self);
        }
        if (seen === backEdges) {
          hashCache.set(self, h);
        }
        return h;
      }
    }
  }
  return optimize(mix(string(String(self))));
};
var random = (self) => {
  if (!randomHashCache.has(self)) {
    randomHashCache.set(self, optimize(Math.random() * 4294967296 | 0));
  }
  return randomHashCache.get(self);
};
var mix = (h) => {
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909);
  return h ^ h >>> 16;
};
var combine = /* @__PURE__ */ dual(2, (self, b) => mix(Math.imul(self, 2654435761) + Math.imul(b, 2246822507)));
var optimize = (n) => n & 3221225471 | n >>> 1 & 1073741824;
var float64 = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(8));
var number = (n) => {
  const h = n | 0;
  if (h === n) {
    return optimize(h);
  }
  float64.setFloat64(0, n !== n ? NaN : n);
  return optimize(combine(float64.getInt32(0), float64.getInt32(4)));
};
var string = (str) => {
  let h = 5381, i = str.length;
  while (i) {
    h = h * 33 ^ str.charCodeAt(--i);
  }
  return optimize(h);
};
var structureKeys = (o, keys) => {
  let h = 12289;
  for (const key of keys) {
    h ^= combine(hash(key), hash(o[key]));
  }
  return optimize(h);
};
var structure = (o) => structureKeys(o, getAllObjectKeys(o));
var unordered = (seed, f) => (iter) => {
  let h = seed;
  for (const element of iter) {
    h ^= f(element);
  }
  return optimize(h);
};
var array = (arr) => {
  let h = 6151;
  for (const element of arr) {
    h = combine(h, hash(element));
  }
  return optimize(h);
};
var hashMap = /* @__PURE__ */ unordered(/* @__PURE__ */ string("Map"), ([k, v]) => combine(hash(k), hash(v)));
var setSeed = /* @__PURE__ */ string("Set");
var hashSet = /* @__PURE__ */ unordered(setSeed, (element) => combine(setSeed, hash(element)));
var randomHashCache = /* @__PURE__ */ new WeakMap;
var hashCache = /* @__PURE__ */ new WeakMap;
var visitedObjects = /* @__PURE__ */ new WeakSet;

// ../node_modules/effect/dist/Equal.js
var symbol2 = "~effect/Equal";
function equals() {
  if (arguments.length === 1) {
    return (self) => compareBoth(self, arguments[0]);
  }
  return compareBoth(arguments[0], arguments[1]);
}
function compareBoth(self, that) {
  if (self === that)
    return true;
  if (self == null || that == null)
    return false;
  const selfType = typeof self;
  if (selfType !== typeof that) {
    return false;
  }
  if (selfType === "number" && self !== self && that !== that) {
    return true;
  }
  if (selfType !== "object" && selfType !== "function") {
    return false;
  }
  if (byReferenceInstances.has(self) || byReferenceInstances.has(that)) {
    return false;
  }
  return compareObjects(self, that);
}
function compareObjects(self, that) {
  const depth = pathLeft.length;
  for (let i = depth;i-- > 0; ) {
    if (pathLeft[i] === self && pathRight[i] === that)
      return true;
  }
  if (depth)
    return compareOnPath(self, that);
  let known = results.get(self);
  if (!known)
    results.set(self, known = new WeakMap);
  let result = known.get(that);
  if (result === undefined)
    known.set(that, result = compareOnPath(self, that));
  return result;
}
function compareOnPath(self, that) {
  pathLeft.push(self);
  pathRight.push(that);
  try {
    return compareStructure(self, that);
  } finally {
    pathLeft.pop();
    pathRight.pop();
  }
}
var pathLeft = [];
var pathRight = [];
var results = /* @__PURE__ */ new WeakMap;
function compareStructure(self, that) {
  if (hash(self) !== hash(that)) {
    return false;
  } else if (self instanceof Date) {
    if (!(that instanceof Date))
      return false;
    const selfTime = self.getTime();
    const thatTime = that.getTime();
    return selfTime === thatTime || Number.isNaN(selfTime) && Number.isNaN(thatTime);
  } else if (self instanceof RegExp) {
    return that instanceof RegExp && self.toString() === that.toString();
  }
  const bothEquals = isEqual(self);
  if (bothEquals !== isEqual(that) || typeof self === "function" && !bothEquals) {
    return false;
  } else if (bothEquals) {
    return self[symbol2](that);
  } else if (Array.isArray(self)) {
    if (!Array.isArray(that) || self.length !== that.length) {
      return false;
    }
    return compareArrays(self, that);
  } else if (ArrayBuffer.isView(self)) {
    const selfIsDataView = self instanceof DataView;
    if (!ArrayBuffer.isView(that) || self.byteLength !== that.byteLength || selfIsDataView !== that instanceof DataView) {
      return false;
    }
    if (selfIsDataView) {
      return compareTypedArrays(viewBytes(self), viewBytes(that));
    }
    return compareTypedArrays(self, that);
  } else if (self instanceof Map) {
    if (!(that instanceof Map) || self.size !== that.size) {
      return false;
    }
    return compareHashed(self, that, entryHash, equalEntries);
  } else if (self instanceof Set) {
    if (!(that instanceof Set) || self.size !== that.size) {
      return false;
    }
    return compareHashed(self, that, hash, compareBoth);
  }
  return compareRecords(self, that);
}
function compareArrays(self, that) {
  for (let i = 0;i < self.length; i++) {
    if (!compareBoth(self[i], that[i])) {
      return false;
    }
  }
  return true;
}
function compareTypedArrays(self, that) {
  if (self.length !== that.length) {
    return false;
  }
  for (let i = 0;i < self.length; i++) {
    if (self[i] !== that[i]) {
      return false;
    }
  }
  return true;
}
function compareRecords(self, that) {
  const selfKeys = getAllObjectKeys(self);
  const thatKeys = getAllObjectKeys(that);
  if (selfKeys.size !== thatKeys.size) {
    return false;
  }
  for (const key of selfKeys) {
    if (!thatKeys.has(key) || !compareBoth(self[key], that[key])) {
      return false;
    }
  }
  return true;
}
function compareHashed(self, that, hashOf, equivalent) {
  const groups = new Map;
  for (const item of that) {
    const h = hashOf(item);
    const group = groups.get(h);
    if (group)
      group.push(item);
    else
      groups.set(h, [item]);
  }
  outer:
    for (const item of self) {
      const group = groups.get(hashOf(item));
      if (group) {
        for (let i = 0;i < group.length; i++) {
          if (equivalent(item, group[i])) {
            group[i] = group[group.length - 1];
            group.pop();
            continue outer;
          }
        }
      }
      return false;
    }
  return true;
}
var entryHash = (entry) => hash(entry[0]);
var equalEntries = (self, that) => compareBoth(self[0], that[0]) && compareBoth(self[1], that[1]);
var isEqual = (u) => hasProperty(u, symbol2);

// ../node_modules/effect/dist/Redactable.js
var symbolRedactable = /* @__PURE__ */ Symbol.for("~effect/Redactable");
var isRedactable = (u) => hasProperty(u, symbolRedactable);
function redact(u) {
  if (isRedactable(u))
    return getRedacted(u);
  return u;
}
function getRedacted(redactable) {
  return redactable[symbolRedactable](globalThis[currentFiberTypeId]?.context ?? emptyContext);
}
var currentFiberTypeId = "~effect/Fiber/currentFiber";
var emptyMap = /* @__PURE__ */ new Map;
var emptyContext = {
  "~effect/Context": {},
  base: emptyMap,
  depth: 0,
  mapUnsafe: emptyMap,
  pipe() {
    return pipeArguments(this, arguments);
  }
};

// ../node_modules/effect/dist/Formatter.js
function format(input, options) {
  const space = options?.space ?? 0;
  const ancestors = new WeakSet;
  const gap = !space ? "" : typeof space === "number" ? " ".repeat(space) : space;
  const ind = (d) => gap.repeat(d);
  const wrap = (v, body) => {
    const ctor = v?.constructor;
    return ctor && ctor !== Object.prototype.constructor && ctor.name ? `${ctor.name}(${body})` : body;
  };
  const ownKeys = (o) => {
    try {
      return Reflect.ownKeys(o);
    } catch {
      return ["[ownKeys threw]"];
    }
  };
  function recur(v, d = 0) {
    try {
      return recurUnsafe(v, d);
    } catch {
      if (typeof v === "object" && v !== null || typeof v === "function")
        ancestors.delete(v);
      return "[inspection threw]";
    }
  }
  function recurUnsafe(v, d = 0) {
    if (typeof v === "string")
      return JSON.stringify(v);
    if (typeof v === "number" || v == null || typeof v === "boolean" || typeof v === "symbol")
      return String(v);
    if (typeof v === "bigint")
      return String(v) + "n";
    if (typeof v === "object" || typeof v === "function") {
      if (ancestors.has(v))
        return CIRCULAR;
      ancestors.add(v);
      let output;
      if (symbolRedactable in v) {
        output = recur(getRedacted(v), d);
      } else if (Array.isArray(v)) {
        output = !gap || v.length <= 1 ? `[${v.map((x) => recur(x, d)).join(",")}]` : `[
${ind(d + 1)}${v.map((x) => recur(x, d + 1)).join(`,
` + ind(d + 1))}
${ind(d)}]`;
      } else if (v instanceof Date) {
        output = formatDate(v);
      } else if (!options?.ignoreToString && hasProperty(v, "toString") && typeof v["toString"] === "function" && v["toString"] !== Object.prototype.toString && v["toString"] !== Array.prototype.toString) {
        const s = safeToString(v);
        output = v instanceof Error && v.cause !== undefined ? `${s} (cause: ${recur(v.cause, d)})` : s;
      } else if (Symbol.iterator in v) {
        output = `${v.constructor.name}(${recur(Array.from(v), d)})`;
      } else {
        const keys = ownKeys(v);
        if (!gap || keys.length <= 1) {
          const body = `{${keys.map((k) => `${formatPropertyKey(k)}:${recur(safeGet(v, k), d)}`).join(",")}}`;
          output = wrap(v, body);
        } else {
          const body = `{
${keys.map((k) => `${ind(d + 1)}${formatPropertyKey(k)}: ${recur(safeGet(v, k), d + 1)}`).join(`,
`)}
${ind(d)}}`;
          output = wrap(v, body);
        }
      }
      ancestors.delete(v);
      return output;
    }
    return String(v);
  }
  return recur(input, 0);
}
var CIRCULAR = "[Circular]";
function formatPropertyKey(name) {
  return typeof name === "string" ? JSON.stringify(name) : String(name);
}
function formatPath(path) {
  return path.map((key) => `[${formatPropertyKey(key)}]`).join("");
}
function formatDate(date) {
  try {
    return date.toISOString();
  } catch {
    return "Invalid Date";
  }
}
function safeToString(input) {
  try {
    const s = input.toString();
    return typeof s === "string" ? s : String(s);
  } catch {
    return "[toString threw]";
  }
}
function safeGet(input, key) {
  try {
    return input[key];
  } catch {
    return "[property access threw]";
  }
}
function formatJson(input, options) {
  const ancestors = [];
  return JSON.stringify(input, function(key, value) {
    const original = Object.getOwnPropertyDescriptor(this, key)?.value;
    const redacted = hasProperty(original, symbolRedactable) ? redact(original) : redact(value);
    if (typeof redacted === "bigint") {
      return format(redacted);
    }
    if (typeof redacted !== "object" || redacted === null) {
      return redacted;
    }
    const current = redacted instanceof Error && !hasProperty(redacted, "toJSON") ? {
      ...redacted,
      name: redacted.name,
      message: redacted.message
    } : redacted;
    while (ancestors.length > 0 && ancestors[ancestors.length - 1] !== this) {
      ancestors.pop();
    }
    if (ancestors.includes(redacted)) {
      return;
    }
    ancestors.push(redacted);
    if (current !== redacted) {
      ancestors.push(current);
    }
    return current;
  }, options?.space) ?? "null";
}

// ../node_modules/effect/dist/Inspectable.js
var NodeInspectSymbol = /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom");
var toJson = (input) => {
  try {
    input = redact(input);
    if (hasProperty(input, "toJSON") && isFunction(input["toJSON"]) && input["toJSON"].length === 0) {
      return input.toJSON();
    } else if (Array.isArray(input)) {
      return input.map(toJson);
    }
    return input;
  } catch {
    return "[toJSON threw]";
  }
};
var BaseProto = {
  toJSON() {
    return toJson(this);
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  },
  toString() {
    return format(this.toJSON());
  }
};

// ../node_modules/effect/dist/internal/stackTraceLimit.js
var isStackTraceLimitWritable = () => {
  const desc = Object.getOwnPropertyDescriptor(Error, "stackTraceLimit");
  if (desc === undefined) {
    return Object.isExtensible(Error);
  }
  return Object.hasOwn(desc, "writable") ? desc.writable === true : desc.set !== undefined;
};
var canWriteStackTraceLimit = /* @__PURE__ */ isStackTraceLimitWritable();
var getStackTraceLimit = () => Error.stackTraceLimit;
var setStackTraceLimit = (value) => {
  if (canWriteStackTraceLimit) {
    Error.stackTraceLimit = value;
  }
};

// ../node_modules/effect/dist/Utils.js
class SingleShotGen {
  constructor(self) {
    this.value = self;
    this.done = false;
  }
  next(a) {
    if (this.done) {
      this.value = a;
      return this;
    }
    this.done = true;
    return {
      value: this.value,
      done: false
    };
  }
}
var pickInternalCall = () => {
  const InternalTypeId = "~effect/Utils/internal";
  const standard = {
    [InternalTypeId]: (body) => {
      return body();
    }
  };
  const forced = {
    [InternalTypeId]: (body) => {
      try {
        return body();
      } finally {}
    }
  };
  const isNotOptimizedAway = getStackTraceLimit() !== 0 && standard[InternalTypeId](() => new Error().stack)?.includes(InternalTypeId) === true;
  return isNotOptimizedAway ? standard[InternalTypeId] : forced[InternalTypeId];
};
var internalCall = /* @__PURE__ */ pickInternalCall();

// ../node_modules/effect/dist/internal/record.js
function assignProperty(self, key, value) {
  if (key === "__proto__") {
    Object.defineProperty(self, key, {
      value,
      writable: true,
      enumerable: true,
      configurable: true
    });
  } else {
    self[key] = value;
  }
}
function assignProperties(self, source) {
  for (const key of Reflect.ownKeys(source)) {
    if (Object.prototype.propertyIsEnumerable.call(source, key)) {
      assignProperty(self, key, source[key]);
    }
  }
}

// ../node_modules/effect/dist/internal/core.js
var EffectTypeId = `~effect/Effect`;
var ExitTypeId = `~effect/Exit`;
var effectVariance = {
  _A: identity,
  _E: identity,
  _R: identity
};
var identifier = `${EffectTypeId}/identifier`;
var args = `${EffectTypeId}/args`;
var evaluate = `${EffectTypeId}/evaluate`;
var contA = `${EffectTypeId}/successCont`;
var contE = `${EffectTypeId}/failureCont`;
var contAll = `${EffectTypeId}/ensureCont`;
var Yield = /* @__PURE__ */ Symbol.for("effect/Effect/Yield");
var PipeInspectableProto = {
  pipe() {
    return pipeArguments(this, arguments);
  },
  toJSON() {
    return {
      ...this
    };
  },
  toString() {
    return format(this.toJSON(), {
      ignoreToString: true,
      space: 2
    });
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  }
};
var StructuralProto = {
  [symbol]() {
    return structureKeys(this, Object.keys(this));
  },
  [symbol2](that) {
    const selfKeys = Object.keys(this);
    const thatKeys = Object.keys(that);
    if (selfKeys.length !== thatKeys.length)
      return false;
    for (let i = 0;i < selfKeys.length; i++) {
      if (selfKeys[i] !== thatKeys[i] || !equals(this[selfKeys[i]], that[selfKeys[i]])) {
        return false;
      }
    }
    return true;
  }
};
var EffectProto = {
  [EffectTypeId]: effectVariance,
  ...PipeInspectableProto,
  [Symbol.iterator]() {
    return new SingleShotGen(this);
  },
  toJSON() {
    return {
      _id: "Effect",
      op: this[identifier],
      ...args in this ? {
        args: this[args]
      } : undefined
    };
  }
};
var isEffect = (u) => hasProperty(u, EffectTypeId);
var isExit = (u) => hasProperty(u, ExitTypeId);
var CauseTypeId = "~effect/Cause";
var CauseReasonTypeId = "~effect/Cause/Reason";
var isCause = (self) => hasProperty(self, CauseTypeId);
class CauseImpl {
  constructor(failures) {
    this[CauseTypeId] = CauseTypeId;
    this.reasons = failures;
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
  toJSON() {
    return {
      _id: "Cause",
      failures: this.reasons.map((f) => f.toJSON())
    };
  }
  toString() {
    return `Cause(${format(this.reasons)})`;
  }
  [NodeInspectSymbol]() {
    return this.toJSON();
  }
  [symbol2](that) {
    return isCause(that) && this.reasons.length === that.reasons.length && this.reasons.every((e, i) => equals(e, that.reasons[i]));
  }
  [symbol]() {
    return array(this.reasons);
  }
}
var annotationsMap = /* @__PURE__ */ new WeakMap;

class ReasonBase {
  [CauseReasonTypeId];
  annotations;
  _tag;
  constructor(_tag, annotations, originalError) {
    this[CauseReasonTypeId] = CauseReasonTypeId;
    this._tag = _tag;
    if (annotations !== constEmptyAnnotations && typeof originalError === "object" && originalError !== null && annotations.size > 0) {
      const prevAnnotations = annotationsMap.get(originalError);
      if (prevAnnotations) {
        annotations = new Map([...prevAnnotations, ...annotations]);
      }
      annotationsMap.set(originalError, annotations);
    }
    this.annotations = annotations;
  }
  annotate(annotations, options) {
    if (annotations.mapUnsafe.size === 0)
      return this;
    const newAnnotations = new Map(this.annotations);
    annotations.mapUnsafe.forEach((value, key) => {
      if (options?.overwrite !== true && newAnnotations.has(key))
        return;
      newAnnotations.set(key, value);
    });
    const self = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    self.annotations = newAnnotations;
    return self;
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
  toString() {
    return format(this);
  }
  [NodeInspectSymbol]() {
    return this.toString();
  }
}
var constEmptyAnnotations = /* @__PURE__ */ new Map;

class Fail extends ReasonBase {
  constructor(error, annotations = constEmptyAnnotations) {
    super("Fail", annotations, error);
    this.error = error;
  }
  toString() {
    return `Fail(${format(this.error)})`;
  }
  toJSON() {
    return {
      _tag: "Fail",
      error: this.error
    };
  }
  [symbol2](that) {
    return isFailReason(that) && equals(this.error, that.error) && equals(this.annotations, that.annotations);
  }
  [symbol]() {
    return combine(string(this._tag))(combine(hash(this.error))(hash(this.annotations)));
  }
}
var causeFromReasons = (reasons) => new CauseImpl(reasons);
var dedupeReasons = (self, that) => {
  const buckets = new Map;
  const out = [];
  for (const reason of self.concat(that)) {
    const hash2 = hash(reason);
    const bucket = buckets.get(hash2);
    if (bucket === undefined) {
      buckets.set(hash2, [reason]);
    } else if (bucket.some((previous) => equals(previous, reason))) {
      continue;
    } else {
      bucket.push(reason);
    }
    out.push(reason);
  }
  return out;
};
var causeCombine = /* @__PURE__ */ dual(2, (self, that) => {
  if (self.reasons.length === 0) {
    return that;
  } else if (that.reasons.length === 0) {
    return self;
  }
  const newCause = new CauseImpl(dedupeReasons(self.reasons, that.reasons));
  return equals(self, newCause) ? self : newCause;
});
var causeFail = (error) => new CauseImpl([new Fail(error)]);

class Die extends ReasonBase {
  constructor(defect, annotations = constEmptyAnnotations) {
    super("Die", annotations, defect);
    this.defect = defect;
  }
  toString() {
    return `Die(${format(this.defect)})`;
  }
  toJSON() {
    return {
      _tag: "Die",
      defect: this.defect
    };
  }
  [symbol2](that) {
    return isDieReason(that) && equals(this.defect, that.defect) && equals(this.annotations, that.annotations);
  }
  [symbol]() {
    return combine(string(this._tag))(combine(hash(this.defect))(hash(this.annotations)));
  }
}
var causeDie = (defect) => new CauseImpl([new Die(defect)]);
var causeAnnotate = /* @__PURE__ */ dual((args) => isCause(args[0]), (self, annotations, options) => {
  if (annotations.mapUnsafe.size === 0)
    return self;
  return new CauseImpl(self.reasons.map((f) => f.annotate(annotations, options)));
});
var isFailReason = (self) => self._tag === "Fail";
var isDieReason = (self) => self._tag === "Die";
var isInterruptReason = (self) => self._tag === "Interrupt";
function defaultEvaluate(_fiber) {
  return exitDie(`Effect.evaluate: Not implemented`);
}
var makePrimitiveProto = (options) => ({
  ...EffectProto,
  [identifier]: options.op,
  [evaluate]: options[evaluate] ?? defaultEvaluate,
  [contA]: options[contA],
  [contE]: options[contE],
  [contAll]: options[contAll]
});
var makePrimitive = (options) => {
  const Proto = makePrimitiveProto(options);
  const PrimitiveImpl = function(value) {
    this[args] = value;
  };
  PrimitiveImpl.prototype = Proto;
  return function(value) {
    return new PrimitiveImpl(value);
  };
};
var makeExit = (options) => {
  const Proto = {
    [ExitTypeId]: ExitTypeId,
    _tag: options.op,
    get [options.prop]() {
      return this[args];
    },
    ...makePrimitiveProto(options),
    toString() {
      return `${options.op}(${format(this[args])})`;
    },
    toJSON() {
      return {
        _id: "Exit",
        _tag: options.op,
        [options.prop]: this[args]
      };
    },
    [symbol2](that) {
      return isExit(that) && that._tag === this._tag && equals(this[args], that[args]);
    },
    [symbol]() {
      return combine(string(options.op), hash(this[args]));
    }
  };
  const ExitPrimitive = function(value) {
    this[args] = value;
  };
  ExitPrimitive.prototype = Proto;
  return function(value) {
    return new ExitPrimitive(value);
  };
};
var exitSucceed = /* @__PURE__ */ makeExit({
  op: "Success",
  prop: "value",
  [evaluate](fiber) {
    const cont = fiber.getCont(contA);
    return cont ? cont[contA](this[args], fiber, this) : fiber.yieldWith(this);
  }
});
var StackTraceKey = {
  key: "effect/Cause/StackTrace"
};
var InterruptorStackTrace = {
  key: "effect/Cause/InterruptorStackTrace"
};
var exitFailCause = /* @__PURE__ */ makeExit({
  op: "Failure",
  prop: "cause",
  [evaluate](fiber) {
    let cause = this[args];
    let annotated = false;
    if (fiber.cache.stackFrame) {
      cause = causeAnnotate(cause, {
        mapUnsafe: new Map([[StackTraceKey.key, fiber.cache.stackFrame]])
      });
      annotated = true;
    }
    let cont = fiber.getCont(contE);
    const interruptedCause = fiber._interruptedCause;
    if (interruptedCause && fiber.interruptible) {
      let skippedHandler = false;
      while (cont && fiber.interruptible) {
        skippedHandler ||= identifier in cont;
        cont = fiber.getCont(contE);
      }
      if (skippedHandler) {
        cause = causeFromReasons(cause.reasons.filter((reason) => reason._tag !== "Fail"));
      }
      cause = causeCombine(cause, interruptedCause);
      annotated = true;
    }
    return cont ? cont[contE](cause, fiber, annotated ? undefined : this) : fiber.yieldWith(annotated ? exitFailCause(cause) : this);
  }
});
var exitFail = (e) => exitFailCause(causeFail(e));
var exitDie = (defect) => exitFailCause(causeDie(defect));
var withFiber = /* @__PURE__ */ makePrimitive({
  op: "WithFiber",
  [evaluate](fiber) {
    return this[args](fiber);
  }
});
var withFiberSucceed = /* @__PURE__ */ makePrimitive({
  op: "WithFiberSucceed",
  [evaluate](fiber) {
    const value = this[args](fiber);
    const cont = fiber.getCont(contA);
    return cont ? cont[contA](value, fiber) : fiber.yieldWith(exitSucceed(value));
  }
});
var YieldableError = /* @__PURE__ */ function() {

  class YieldableError extends globalThis.Error {
  }
  const proto = /* @__PURE__ */ makePrimitiveProto({
    op: "YieldableError",
    [evaluate]() {
      return exitFail(this);
    }
  });
  delete proto.toString;
  Object.assign(YieldableError.prototype, proto);
  return YieldableError;
}();
var Error2 = /* @__PURE__ */ function() {
  const plainArgsSymbol = /* @__PURE__ */ Symbol.for("effect/Data/Error/plainArgs");
  return class Base extends YieldableError {
    constructor(args) {
      super(args?.message, args?.cause ? {
        cause: args.cause
      } : undefined);
      if (args) {
        assignProperties(this, args);
        Object.defineProperty(this, plainArgsSymbol, {
          value: args,
          enumerable: false
        });
      }
    }
    toJSON() {
      return {
        ...this[plainArgsSymbol],
        ...this
      };
    }
  };
}();
var TaggedError = (tag) => {

  class Base extends Error2 {
    _tag = tag;
  }
  Base.prototype.name = tag;
  return Base;
};
var DoneTypeId = "~effect/Cause/Done";
var DoneVoid = {
  [DoneTypeId]: DoneTypeId,
  _tag: "Done",
  value: undefined
};

// ../node_modules/effect/dist/Effectable.js
var Prototype2 = (options) => makePrimitiveProto({
  op: options.label,
  [evaluate]: options.evaluate
});

// ../node_modules/effect/dist/internal/option.js
var TypeId = "~effect/Option";
var CommonProto = {
  [TypeId]: {
    _A: (_) => _
  },
  ...PipeInspectableProto,
  [Symbol.iterator]() {
    return new SingleShotGen(this);
  }
};
var SomeProto = /* @__PURE__ */ Object.defineProperty(/* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(CommonProto), {
  _tag: "Some",
  _op: "Some",
  [symbol2](that) {
    return isOption(that) && isSome(that) && equals(this.value, that.value);
  },
  [symbol]() {
    return combine(hash(this._tag))(hash(this.value));
  },
  toString() {
    return `some(${format(this.value)})`;
  },
  toJSON() {
    return {
      _id: "Option",
      _tag: this._tag,
      value: toJson(this.value)
    };
  }
}), "valueOrUndefined", {
  get() {
    return this.value;
  }
});
var NoneHash = /* @__PURE__ */ hash("None");
var NoneProto = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(CommonProto), {
  _tag: "None",
  _op: "None",
  valueOrUndefined: undefined,
  [symbol2](that) {
    return isOption(that) && isNone(that);
  },
  [symbol]() {
    return NoneHash;
  },
  toString() {
    return `none()`;
  },
  toJSON() {
    return {
      _id: "Option",
      _tag: this._tag
    };
  }
});
var isOption = (input) => hasProperty(input, TypeId);
var isNone = (fa) => fa._tag === "None";
var isSome = (fa) => fa._tag === "Some";
var none = /* @__PURE__ */ Object.create(NoneProto);
var SomeImpl = function(value) {
  this.value = value;
};
SomeImpl.prototype = SomeProto;
var some = (value) => new SomeImpl(value);

// ../node_modules/effect/dist/internal/result.js
var TypeId2 = "~effect/Result";
var CommonProto2 = {
  [TypeId2]: {
    _A: (_) => _,
    _E: (_) => _
  },
  ...PipeInspectableProto,
  [Symbol.iterator]() {
    return new SingleShotGen(this);
  }
};
var SuccessProto = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(CommonProto2), {
  _tag: "Success",
  _op: "Success",
  [symbol2](that) {
    return isResult(that) && isSuccess(that) && equals(this.success, that.success);
  },
  [symbol]() {
    return combine(hash(this._tag))(hash(this.success));
  },
  toString() {
    return `success(${format(this.success)})`;
  },
  toJSON() {
    return {
      _id: "Result",
      _tag: this._tag,
      value: toJson(this.success)
    };
  }
});
var FailureProto = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(CommonProto2), {
  _tag: "Failure",
  _op: "Failure",
  [symbol2](that) {
    return isResult(that) && isFailure(that) && equals(this.failure, that.failure);
  },
  [symbol]() {
    return combine(hash(this._tag))(hash(this.failure));
  },
  toString() {
    return `failure(${format(this.failure)})`;
  },
  toJSON() {
    return {
      _id: "Result",
      _tag: this._tag,
      failure: toJson(this.failure)
    };
  }
});
var isResult = (input) => hasProperty(input, TypeId2);
var isFailure = (result) => result._tag === "Failure";
var isSuccess = (result) => result._tag === "Success";
var FailureImpl = function(failure) {
  this.failure = failure;
};
FailureImpl.prototype = FailureProto;
var fail = (failure) => new FailureImpl(failure);
var SuccessImpl = function(success) {
  this.success = success;
};
SuccessImpl.prototype = SuccessProto;
var succeed = (success) => new SuccessImpl(success);

// ../node_modules/effect/dist/Order.js
function make(compare) {
  return (self, that) => self === that ? 0 : compare(self, that);
}
var Number2 = /* @__PURE__ */ make((self, that) => {
  if (globalThis.Number.isNaN(self) && globalThis.Number.isNaN(that))
    return 0;
  if (globalThis.Number.isNaN(self))
    return -1;
  if (globalThis.Number.isNaN(that))
    return 1;
  return self < that ? -1 : 1;
});
var isGreaterThan = (O) => dual(2, (self, that) => O(self, that) === 1);
var isGreaterThanOrEqualTo = (O) => dual(2, (self, that) => O(self, that) !== -1);

// ../node_modules/effect/dist/Option.js
var none2 = () => none;
var some2 = some;
var isNone2 = isNone;

// ../node_modules/effect/dist/Context.js
var ServiceTypeId = "~effect/Context/Service";
var Service = function() {
  function KeyClass() {}
  const self = KeyClass;
  Object.setPrototypeOf(self, ServiceProto);
  const init = (key, options) => {
    self.key = key;
    if (options?.defaultValue) {
      self[ReferenceTypeId] = ReferenceTypeId;
      self.defaultValue = options.defaultValue;
    }
    if (options?.make) {
      self.make = options.make;
    }
    if (options?.fiberCached) {
      cacheKeys.add(key);
    }
    return self;
  };
  return arguments.length > 0 ? init(arguments[0], arguments[1]) : init;
};
var ServiceProto = {
  [ServiceTypeId]: ServiceTypeId,
  .../* @__PURE__ */ Prototype2({
    label: "Service",
    evaluate(fiber) {
      return exitSucceed(get(fiber.context, this));
    }
  }),
  toJSON() {
    return {
      _id: "Service",
      key: this.key
    };
  },
  of(self) {
    return self;
  },
  context(self) {
    return make2(this, self);
  },
  use(f) {
    return withFiber((fiber) => f(get(fiber.context, this)));
  },
  useSync(f) {
    return withFiber((fiber) => exitSucceed(f(get(fiber.context, this))));
  }
};
var cacheKeys = /* @__PURE__ */ new Set;
var ReferenceTypeId = "~effect/Context/Reference";
var TypeId3 = "~effect/Context";
var MaxDepth = 8;
var FlattenAfterBaseHits = 8;
var makeImpl = (cacheRoot, base, overlay, depth) => {
  const self = Object.create(Proto);
  self.cacheRoot = cacheRoot ?? self;
  self.base = base;
  self.overlay = overlay;
  self.depth = depth;
  self._flat = undefined;
  self.baseHits = 0;
  return self;
};
var applyOverlays = (map, overlay) => {
  if (!overlay)
    return;
  applyOverlays(map, overlay.parent);
  map.set(overlay.key, overlay.value);
};
var flatten = (self) => {
  if (self._flat)
    return self._flat;
  if (!self.overlay)
    return self._flat = self.base;
  const map = new Map(self.base);
  applyOverlays(map, self.overlay);
  return self._flat = map;
};
var withFlat = (self, f) => {
  const map = new Map(self.mapUnsafe);
  f(map);
  return makeUnsafe(map);
};
var notFound = /* @__PURE__ */ Symbol();
var lookup = (self, key) => {
  const impl = self;
  for (let overlay = impl.overlay;overlay; overlay = overlay.parent) {
    if (overlay.key === key)
      return overlay.value;
  }
  const value = impl.base.get(key);
  if (value === undefined && !impl.base.has(key))
    return notFound;
  if (impl.overlay && ++impl.baseHits >= impl.base.size && impl.baseHits >= FlattenAfterBaseHits) {
    impl.base = flatten(impl);
    impl.overlay = undefined;
    impl.depth = 0;
  }
  return value;
};
var makeUnsafe = (mapUnsafe) => makeImpl(undefined, mapUnsafe, undefined, 0);
var Proto = {
  get mapUnsafe() {
    return flatten(this);
  },
  ...PipeInspectableProto,
  [TypeId3]: {
    _Services: (_) => _
  },
  toJSON() {
    return {
      _id: "Context",
      services: Array.from(this.mapUnsafe).map(([key, value]) => ({
        key,
        value
      }))
    };
  },
  [symbol2](that) {
    if (!isContext(that))
      return false;
    const self = this.mapUnsafe;
    const other = that.mapUnsafe;
    if (self.size !== other.size)
      return false;
    for (const [key, value] of self) {
      if (!other.has(key) || !equals(value, other.get(key)))
        return false;
    }
    return true;
  },
  [symbol]() {
    return number(this.mapUnsafe.size);
  }
};
var hasSameCache = (self, that) => self.cacheRoot === that.cacheRoot;
var isContext = (u) => hasProperty(u, TypeId3);
var isReference = (u) => !!u[ReferenceTypeId];
var empty = () => emptyContext2;
var emptyContext2 = /* @__PURE__ */ makeUnsafe(/* @__PURE__ */ new Map);
var make2 = (key, service) => makeUnsafe(new Map([[key.key, service]]));
var add = /* @__PURE__ */ dual(3, (self, key, service) => addUnsafe(self, key.key, service));
var addUnsafe = (self, key, service) => {
  const impl = self;
  const cacheRoot = cacheKeys.has(key) ? undefined : impl.cacheRoot;
  if (impl.depth >= MaxDepth) {
    const map = new Map(impl.mapUnsafe);
    map.set(key, service);
    return makeImpl(cacheRoot, map, undefined, 0);
  }
  return makeImpl(cacheRoot, impl.base, {
    key,
    value: service,
    parent: impl.overlay
  }, impl.depth + 1);
};
var getOrUndefinedUnsafe = (self, key) => {
  const value = lookup(self, key);
  return value === notFound ? undefined : value;
};
var getUnsafe = /* @__PURE__ */ dual(2, (self, service) => {
  const value = lookup(self, service.key);
  if (value === notFound) {
    if (isReference(service))
      return getDefaultValue(service);
    throw serviceNotFoundError(service);
  }
  return value;
});
var get = getUnsafe;
var defaultValueCacheKey = "~effect/Context/defaultValue";
var getDefaultValue = (ref) => {
  if (defaultValueCacheKey in ref) {
    return ref[defaultValueCacheKey];
  }
  return ref[defaultValueCacheKey] = ref.defaultValue();
};
var serviceNotFoundError = (service) => {
  const error = new Error(`Service not found${service.key ? `: ${String(service.key)}` : ""}`);
  if (error.stack) {
    const lines = error.stack.split(`
`);
    lines.splice(1, 3);
    error.stack = lines.join(`
`);
  }
  return error;
};
var merge = /* @__PURE__ */ dual(2, (self, that) => {
  if (self.mapUnsafe.size === 0)
    return that;
  if (that.mapUnsafe.size === 0)
    return self;
  return withFlat(self, (map) => that.mapUnsafe.forEach((value, key) => map.set(key, value)));
});
var Reference = Service;

// ../node_modules/effect/dist/internal/array.js
var isArrayNonEmpty = (self) => self.length > 0;

// ../node_modules/effect/dist/Result.js
var succeed2 = succeed;
var fail2 = fail;
var isFailure2 = isFailure;
var match = /* @__PURE__ */ dual(2, (self, {
  onFailure,
  onSuccess
}) => isFailure2(self) ? onFailure(self.failure) : onSuccess(self.success));

// ../node_modules/effect/dist/Array.js
var Array2 = globalThis.Array;
var fromIterable = (collection) => Array2.isArray(collection) ? collection : Array2.from(collection);
var append = /* @__PURE__ */ dual(2, (self, last) => [...self, last]);
var isArray = Array2.isArray;
var isArrayNonEmpty2 = isArrayNonEmpty;
var isReadonlyArrayNonEmpty = isArrayNonEmpty;
var empty2 = () => [];
var map = /* @__PURE__ */ dual(2, (self, f) => self.map(f));

// ../node_modules/effect/dist/Duration.js
var TypeId4 = "~effect/Duration";
var bigint0 = /* @__PURE__ */ BigInt(0);
var bigint1 = /* @__PURE__ */ BigInt(1);
var bigint2 = /* @__PURE__ */ BigInt(2);
var bigint10 = /* @__PURE__ */ BigInt(10);
var bigint1e3 = /* @__PURE__ */ BigInt(1000);
var roundTiesAwayFromZero = (input) => BigInt(input < 0 ? Math.ceil(input - 0.5) : Math.floor(input + 0.5));
var roundMillisToNanos = (millis) => roundTiesAwayFromZero(millis * 1e6);
var parseNanos = (input, scale) => {
  const decimalIndex = input.indexOf(".");
  if (decimalIndex === -1)
    return BigInt(input) * scale;
  const isNegative = input[0] === "-";
  const fractional = input.slice(decimalIndex + 1);
  const fractionalScale = bigint10 ** BigInt(fractional.length);
  const scaled = (BigInt(input.slice(isNegative ? 1 : 0, decimalIndex)) * fractionalScale + BigInt(fractional)) * scale;
  const rounded = scaled / fractionalScale + (scaled % fractionalScale * bigint2 >= fractionalScale ? bigint1 : bigint0);
  return isNegative ? -rounded : rounded;
};
var DURATION_REGEXP = /^(-?\d+(?:\.\d+)?)\s+(nanos?|micros?|millis?|seconds?|minutes?|hours?|days?|weeks?)$/;
var fromInputUnsafe = (input) => {
  switch (typeof input) {
    case "number":
      return millis(input);
    case "bigint":
      return nanos(input);
    case "string": {
      if (input === "Infinity") {
        return infinity;
      }
      if (input === "-Infinity") {
        return negativeInfinity;
      }
      const match = DURATION_REGEXP.exec(input);
      if (!match)
        break;
      const [_, valueStr, unit] = match;
      if (unit === "nano" || unit === "nanos") {
        return nanos(parseNanos(valueStr, bigint1));
      }
      if (unit === "micro" || unit === "micros") {
        return nanos(parseNanos(valueStr, bigint1e3));
      }
      const value = Number(valueStr);
      switch (unit) {
        case "milli":
        case "millis":
          return millis(value);
        case "second":
        case "seconds":
          return seconds(value);
        case "minute":
        case "minutes":
          return minutes(value);
        case "hour":
        case "hours":
          return hours(value);
        case "day":
        case "days":
          return days(value);
        case "week":
        case "weeks":
          return weeks(value);
      }
      break;
    }
    case "object": {
      if (input === null)
        break;
      if (TypeId4 in input)
        return input;
      if (Array.isArray(input)) {
        if (input.length !== 2 || !input.every(isNumber)) {
          return invalid(input);
        }
        if (Number.isNaN(input[0]) || Number.isNaN(input[1])) {
          return zero;
        }
        if (input[0] === -Infinity || input[1] === -Infinity) {
          return negativeInfinity;
        }
        if (input[0] === Infinity || input[1] === Infinity) {
          return infinity;
        }
        return make3(roundTiesAwayFromZero(input[0] * 1e9 + input[1]));
      }
      const obj = input;
      let millis = 0;
      if (obj.weeks)
        millis += obj.weeks * 604800000;
      if (obj.days)
        millis += obj.days * 86400000;
      if (obj.hours)
        millis += obj.hours * 3600000;
      if (obj.minutes)
        millis += obj.minutes * 60000;
      if (obj.seconds)
        millis += obj.seconds * 1000;
      if (obj.milliseconds)
        millis += obj.milliseconds;
      if (!obj.microseconds && !obj.nanoseconds)
        return make3(millis);
      return make3(roundTiesAwayFromZero(millis * 1e6 + (obj.microseconds ?? 0) * 1000 + (obj.nanoseconds ?? 0)));
    }
  }
  return invalid(input);
};
var invalid = (input) => {
  throw new Error(`Invalid Input: ${input}`);
};
var zeroDurationValue = {
  _tag: "Millis",
  millis: 0
};
var infinityDurationValue = {
  _tag: "Infinity"
};
var negativeInfinityDurationValue = {
  _tag: "NegativeInfinity"
};
var DurationProto = {
  [TypeId4]: TypeId4,
  [symbol]() {
    switch (this.value._tag) {
      case "Millis": {
        const nanos = this.value.millis * 1e6;
        return Number.isFinite(nanos) ? hash(roundTiesAwayFromZero(nanos)) : number(this.value.millis);
      }
      case "Nanos":
        return hash(this.value.nanos);
      default:
        return structure(this.value);
    }
  },
  [symbol2](that) {
    return isDuration(that) && equals2(this, that);
  },
  toString() {
    switch (this.value._tag) {
      case "Infinity":
        return "Infinity";
      case "NegativeInfinity":
        return "-Infinity";
      case "Nanos":
        return `${this.value.nanos} nanos`;
      case "Millis":
        return `${this.value.millis} millis`;
    }
  },
  toJSON() {
    switch (this.value._tag) {
      case "Millis":
        return {
          _id: "Duration",
          _tag: "Millis",
          millis: this.value.millis
        };
      case "Nanos":
        return {
          _id: "Duration",
          _tag: "Nanos",
          nanos: String(this.value.nanos)
        };
      case "Infinity":
        return {
          _id: "Duration",
          _tag: "Infinity"
        };
      case "NegativeInfinity":
        return {
          _id: "Duration",
          _tag: "NegativeInfinity"
        };
    }
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var make3 = (input) => {
  const duration = Object.create(DurationProto);
  if (typeof input === "number") {
    if (isNaN(input) || input === 0 || Object.is(input, -0)) {
      duration.value = zeroDurationValue;
    } else if (!Number.isFinite(input)) {
      duration.value = input > 0 ? infinityDurationValue : negativeInfinityDurationValue;
    } else if (!Number.isInteger(input)) {
      duration.value = {
        _tag: "Nanos",
        nanos: roundMillisToNanos(input)
      };
    } else {
      duration.value = {
        _tag: "Millis",
        millis: input
      };
    }
  } else if (input === bigint0) {
    duration.value = zeroDurationValue;
  } else {
    duration.value = {
      _tag: "Nanos",
      nanos: input
    };
  }
  return duration;
};
var isDuration = (u) => hasProperty(u, TypeId4);
var zero = /* @__PURE__ */ make3(0);
var infinity = /* @__PURE__ */ make3(Infinity);
var negativeInfinity = /* @__PURE__ */ make3(-Infinity);
var nanos = (nanos) => make3(nanos);
var millis = (millis) => make3(millis);
var seconds = (seconds) => make3(seconds * 1000);
var minutes = (minutes) => make3(minutes * 60000);
var hours = (hours) => make3(hours * 3600000);
var days = (days) => make3(days * 86400000);
var weeks = (weeks) => make3(weeks * 604800000);
var toMillis = (self) => match2(fromInputUnsafe(self), {
  onMillis: identity,
  onNanos: (nanos) => Number(nanos) / 1e6,
  onInfinity: () => Infinity,
  onNegativeInfinity: () => -Infinity
});
var toNanosUnsafe = (input) => {
  const self = fromInputUnsafe(input);
  switch (self.value._tag) {
    case "Infinity":
    case "NegativeInfinity":
      throw new Error("Cannot convert infinite duration to nanos");
    case "Nanos":
      return self.value.nanos;
    case "Millis":
      return roundMillisToNanos(self.value.millis);
  }
};
var match2 = /* @__PURE__ */ dual(2, (self, options) => {
  switch (self.value._tag) {
    case "Millis":
      return options.onMillis(self.value.millis);
    case "Nanos":
      return options.onNanos(self.value.nanos);
    case "Infinity":
      return options.onInfinity();
    case "NegativeInfinity":
      return (options.onNegativeInfinity ?? options.onInfinity)();
  }
});
var matchPair = /* @__PURE__ */ dual(3, (self, that, options) => {
  if (self.value._tag === "Infinity" || self.value._tag === "NegativeInfinity" || that.value._tag === "Infinity" || that.value._tag === "NegativeInfinity")
    return options.onInfinity(self, that);
  if (self.value._tag === "Millis") {
    return that.value._tag === "Millis" ? options.onMillis(self.value.millis, that.value.millis) : options.onNanos(toNanosUnsafe(self), that.value.nanos);
  } else {
    return options.onNanos(self.value.nanos, toNanosUnsafe(that));
  }
});
var Equivalence = (self, that) => matchPair(self, that, {
  onMillis: (self, that) => self === that,
  onNanos: (self, that) => self === that,
  onInfinity: (self, that) => self.value._tag === that.value._tag
});
var equals2 = /* @__PURE__ */ dual(2, (self, that) => Equivalence(self, that));

// ../node_modules/effect/dist/Scheduler.js
var Scheduler = /* @__PURE__ */ Reference("effect/Scheduler", {
  fiberCached: true,
  defaultValue: () => new MixedScheduler
});
var setMicrotask = (f) => {
  let cancelled = false;
  Promise.resolve().then(() => {
    if (!cancelled)
      f();
  });
  return () => {
    cancelled = true;
  };
};
var setTimer = "setImmediate" in globalThis ? (f) => {
  const timer = globalThis.setImmediate(f);
  return () => globalThis.clearImmediate(timer);
} : (f) => {
  const timer = setTimeout(f, 0);
  return () => clearTimeout(timer);
};
var setImmediate = (f) => {
  try {
    return setTimer(f);
  } catch {
    return setMicrotask(f);
  }
};

class PriorityBuckets {
  buckets = [];
  scheduleTask(task, priority) {
    const buckets = this.buckets;
    const len = buckets.length;
    let bucket;
    let index = 0;
    for (;index < len; index++) {
      if (buckets[index][0] > priority)
        break;
      bucket = buckets[index];
    }
    if (bucket && bucket[0] === priority) {
      bucket[1].push(task);
    } else if (index === len) {
      buckets.push([priority, [task]]);
    } else {
      buckets.splice(index, 0, [priority, [task]]);
    }
  }
  drain() {
    const buckets = this.buckets;
    this.buckets = [];
    return buckets;
  }
}

class MixedScheduler {
  executionMode;
  setImmediate;
  constructor(executionMode = "async", setImmediateFn) {
    this.executionMode = executionMode;
    this.setImmediate = setImmediateFn ?? (executionMode === "sync" ? setMicrotask : setImmediate);
  }
  shouldYield(fiber) {
    return fiber.currentOpCount >= fiber.cache.maxOpsBeforeYield;
  }
  makeDispatcher() {
    return new MixedSchedulerDispatcher(this.setImmediate);
  }
}

class MixedSchedulerDispatcher {
  tasks = /* @__PURE__ */ new PriorityBuckets;
  running = undefined;
  setImmediate;
  constructor(setImmediateFn = setImmediate) {
    this.setImmediate = setImmediateFn;
  }
  scheduleTask(task, priority) {
    this.tasks.scheduleTask(task, priority);
    if (this.running === undefined) {
      this.running = this.setImmediate(this.afterScheduled);
    }
  }
  afterScheduled = () => {
    this.running = undefined;
    this.runTasks();
  };
  runTasks() {
    const buckets = this.tasks.drain();
    for (let i = 0;i < buckets.length; i++) {
      const toRun = buckets[i][1];
      for (let j = 0;j < toRun.length; j++) {
        toRun[j]();
      }
    }
  }
  flush() {
    while (this.tasks.buckets.length > 0) {
      if (this.running !== undefined) {
        this.running();
        this.running = undefined;
      }
      this.runTasks();
    }
  }
}
var MaxOpsBeforeYield = /* @__PURE__ */ Reference("effect/Scheduler/MaxOpsBeforeYield", {
  fiberCached: true,
  defaultValue: () => 2048
});
var PreventSchedulerYield = /* @__PURE__ */ Reference("effect/Scheduler/PreventSchedulerYield", {
  fiberCached: true,
  defaultValue: () => false
});

// ../node_modules/effect/dist/Data.js
var TaggedError2 = TaggedError;

// ../node_modules/effect/dist/encoding/EncodingError.js
var EncodingErrorTypeId = "~effect/encoding/EncodingError";

class EncodingError extends (/* @__PURE__ */ TaggedError2("EncodingError")) {
  [EncodingErrorTypeId] = EncodingErrorTypeId;
}

// ../node_modules/effect/dist/Tracer.js
var ParentSpanKey = "effect/Tracer/ParentSpan";
var TracerKey = "effect/Tracer";

// ../node_modules/effect/dist/internal/metric.js
var FiberRuntimeMetricsKey = "effect/Metric/FiberRuntimeMetrics";

// ../node_modules/effect/dist/internal/references.js
var CurrentStackFrame = /* @__PURE__ */ Reference("effect/References/CurrentStackFrame", {
  fiberCached: true,
  defaultValue: constUndefined
});
var TracerEnabled = /* @__PURE__ */ Reference("effect/References/TracerEnabled", {
  fiberCached: true,
  defaultValue: constTrue
});
var CurrentLogLevel = /* @__PURE__ */ Reference("effect/References/CurrentLogLevel", {
  fiberCached: true,
  defaultValue: () => "Info"
});
var MinimumLogLevel = /* @__PURE__ */ Reference("effect/References/MinimumLogLevel", {
  fiberCached: true,
  defaultValue: () => "Info"
});

// ../node_modules/effect/dist/internal/effect.js
class Interrupt extends ReasonBase {
  constructor(fiberId, annotations = constEmptyAnnotations) {
    super("Interrupt", annotations, "Interrupted");
    this.fiberId = fiberId;
  }
  toString() {
    return `Interrupt(${this.fiberId})`;
  }
  toJSON() {
    return {
      _tag: "Interrupt",
      fiberId: this.fiberId
    };
  }
  [symbol2](that) {
    return isInterruptReason(that) && this.fiberId === that.fiberId && this.annotations === that.annotations;
  }
  [symbol]() {
    return combine(string(`${this._tag}:${this.fiberId}`))(random(this.annotations));
  }
}
var causeInterrupt = (fiberId) => new CauseImpl([new Interrupt(fiberId)]);
var findError = (self) => {
  for (let i = 0;i < self.reasons.length; i++) {
    const reason = self.reasons[i];
    if (reason._tag === "Fail") {
      return succeed2(reason.error);
    }
  }
  return fail2(self);
};
var findDefect = (self) => {
  const reason = self.reasons.find(isDieReason);
  return reason ? succeed2(reason.defect) : fail2(self);
};
var hasInterrupts = (self) => self.reasons.some(isInterruptReason);
var hasInterruptsOnly = (self) => self.reasons.length > 0 && self.reasons.every(isInterruptReason);
var causeMap = /* @__PURE__ */ dual(2, (self, f) => {
  let hasFail = false;
  const failures = self.reasons.map((failure) => {
    if (isFailReason(failure)) {
      hasFail = true;
      return new Fail(f(failure.error), failure.annotations);
    }
    return failure;
  });
  return hasFail ? causeFromReasons(failures) : self;
});
var causeSquash = (self) => {
  let die;
  for (const reason of self.reasons) {
    if (reason._tag === "Fail")
      return reason.error;
    if (reason._tag === "Die")
      die ??= reason;
  }
  if (die !== undefined)
    return die.defect;
  if (self.reasons.length > 0)
    return new globalThis.Error("All fibers interrupted without error");
  return new globalThis.Error("Empty cause");
};
var causePrettyErrors = (self, options) => {
  const errors = [];
  const interrupts = [];
  if (self.reasons.length === 0)
    return errors;
  const prevStackLimit = getStackTraceLimit();
  if (prevStackLimit !== 0)
    setStackTraceLimit(1);
  try {
    for (const failure of self.reasons) {
      if (failure._tag === "Interrupt") {
        interrupts.push(failure);
        continue;
      }
      errors.push(causePrettyError(failure._tag === "Die" ? failure.defect : failure.error, failure.annotations, options));
    }
    if (errors.length === 0) {
      const cause = new Error("The fiber was interrupted by:");
      cause.name = "InterruptCause";
      cause.stack = interruptCauseStack(cause, interrupts);
      const error = new globalThis.Error("All fibers interrupted without error", {
        cause
      });
      error.name = "InterruptError";
      error.stack = `${error.name}: ${error.message}`;
      errors.push(causePrettyError(error, interrupts[0].annotations, options));
    }
  } finally {
    if (prevStackLimit !== 0)
      setStackTraceLimit(prevStackLimit);
  }
  return errors;
};
var causePrettyError = (original, annotations, options) => {
  const kind = typeof original;
  let error;
  if (original && kind === "object") {
    error = new globalThis.Error(causePrettyMessage(original), {
      cause: original.cause ? causePrettyError(original.cause) : undefined
    });
    if (typeof original.name === "string") {
      error.name = original.name;
    }
    if (typeof original.stack === "string") {
      error.stack = cleanErrorStack(original.stack, error, annotations);
    } else {
      const stack = `${error.name}: ${error.message}`;
      error.stack = annotations ? addStackAnnotations(stack, annotations) : stack;
    }
    if (options?.includeCauseInStack) {
      error.stack = renderPrettyError(error);
    }
    for (const key of Object.keys(original)) {
      if (!(key in error)) {
        error[key] = original[key];
      }
    }
  } else {
    error = new globalThis.Error(!original ? `Unknown error: ${original}` : kind === "string" ? original : formatJson(original));
  }
  return error;
};
var causePrettyMessage = (u) => {
  if (typeof u.message === "string") {
    return u.message;
  } else if (typeof u.toString === "function" && u.toString !== Object.prototype.toString && u.toString !== Array.prototype.toString) {
    try {
      return u.toString();
    } catch {}
  }
  return formatJson(u);
};
var locationRegExp = /\((.*)\)/g;
var cleanErrorStack = (stack, error, annotations) => {
  const message = `${error.name}: ${error.message}`;
  const lines = (stack.startsWith(message) ? stack.slice(message.length) : stack).split(`
`);
  const out = [message];
  for (let i = 1;i < lines.length; i++) {
    if (/Generator\.next|~effect\/(?:Effect|Utils)/.test(lines[i])) {
      break;
    }
    out.push(lines[i]);
  }
  return annotations ? addStackAnnotations(out.join(`
`), annotations) : out.join(`
`);
};
var addStackAnnotations = (stack, annotations) => {
  const frame = annotations?.get(StackTraceKey.key);
  if (frame) {
    stack = `${stack}
${currentStackTrace(frame)}`;
  }
  return stack;
};
var interruptCauseStack = (error, interrupts) => {
  const out = [`${error.name}: ${error.message}`];
  for (const current of interrupts) {
    const fiberId = current.fiberId !== undefined ? `#${current.fiberId}` : "unknown";
    const frame = current.annotations.get(InterruptorStackTrace.key);
    out.push(`    at fiber (${fiberId})`);
    if (frame)
      out.push(currentStackTrace(frame));
  }
  return out.join(`
`);
};
var currentStackTrace = (frame) => {
  const out = [];
  let current = frame;
  let i = 0;
  while (current && i < 10) {
    const stack = current.stack();
    if (stack) {
      const locationMatchAll = stack.matchAll(locationRegExp);
      let match = false;
      for (const [, location] of locationMatchAll) {
        match = true;
        out.push(`    at ${current.name} (${location})`);
      }
      if (!match) {
        out.push(`    at ${current.name} (${stack.replace(/^at /, "")})`);
      }
    } else {
      out.push(`    at ${current.name}`);
    }
    current = current.parent;
    i++;
  }
  return out.join(`
`);
};
var renderPrettyError = (e) => e.cause ? `${e.stack} {
${renderErrorCause(e.cause, "  ")}
}` : e.stack;
var renderErrorCause = (cause, prefix) => {
  const lines = cause.stack.split(`
`);
  let stack = `${prefix}[cause]: ${lines[0]}`;
  for (let i = 1, len = lines.length;i < len; i++) {
    stack += `
${prefix}${lines[i]}`;
  }
  if (cause.cause) {
    stack += ` {
${renderErrorCause(cause.cause, `${prefix}  `)}
${prefix}}`;
  }
  return stack;
};
var FiberTypeId = "~effect/Fiber";
var fiberVariance = {
  _A: identity,
  _E: identity
};
var fiberIdStore = {
  id: 0
};
var AsyncResource = /* @__PURE__ */ (() => {
  try {
    return globalThis.process?.getBuiltinModule?.("node:async_hooks")?.AsyncResource;
  } catch {
    return;
  }
})();
var captureAsyncContext = () => AsyncResource === undefined ? undefined : new AsyncResource("effect/Fiber");
var getCurrentFiber = () => globalThis[currentFiberTypeId];

class FiberImpl {
  constructor(context, interruptible = true) {
    this.setContext(context);
    this.id = ++fiberIdStore.id;
    this.currentOpCount = 0;
    this.interruptible = interruptible;
    this._stack = [];
    this._observers = undefined;
    this._exit = undefined;
    this._children = undefined;
    this._interruptedCause = undefined;
    this._yielded = undefined;
    this._running = false;
    this._deferredInterrupt = false;
    this._parent = undefined;
    this._asyncContext = undefined;
    this.cache.runtimeMetrics?.recordFiberStart(this.context);
  }
  get [FiberTypeId]() {
    return fiberVariance;
  }
  get currentDispatcher() {
    return this._dispatcher ??= this.cache.scheduler.makeDispatcher();
  }
  getRef(ref) {
    return get(this.context, ref);
  }
  addObserver(cb) {
    if (this._exit) {
      cb(this._exit);
      return constVoid;
    }
    if (this._observers === undefined) {
      this._observers = [cb];
    } else {
      this._observers.push(cb);
    }
    return () => this.removeObserver(cb);
  }
  removeObserver(cb) {
    if (this._exit || this._observers === undefined)
      return;
    const index = this._observers.indexOf(cb);
    if (index >= 0) {
      this._observers.splice(index, 1);
    }
  }
  interruptUnsafe(fiberId, annotations) {
    if (this._exit) {
      return;
    }
    let cause = causeInterrupt(fiberId);
    if (this.cache.stackFrame) {
      cause = causeAnnotate(cause, make2(StackTraceKey, this.cache.stackFrame));
    }
    if (annotations) {
      cause = causeAnnotate(cause, annotations);
    }
    this._interruptedCause = this._interruptedCause ? causeCombine(this._interruptedCause, cause) : cause;
    if (this.interruptible) {
      if (this._running) {
        this._deferredInterrupt = true;
      } else {
        this.evaluate(failCause(this._interruptedCause));
      }
    }
  }
  pollUnsafe() {
    return this._exit;
  }
  evaluate(effect) {
    if (this._exit) {
      return;
    } else if (this._asyncContext !== undefined) {
      const asyncContext = this._asyncContext;
      this._asyncContext = undefined;
      return asyncContext.runInAsyncScope(this.evaluate, this, effect);
    } else if (this._yielded !== undefined) {
      const yielded = this._yielded;
      this._yielded = undefined;
      yielded();
    }
    const exit = this.runLoop(effect);
    if (exit === Yield) {
      this._asyncContext = captureAsyncContext();
      return;
    }
    const interruptChildren = fiberMiddleware.interruptChildren && fiberMiddleware.interruptChildren(this);
    if (interruptChildren !== undefined) {
      return this.evaluate(flatMap(interruptChildren, () => exit));
    }
    this._exit = exit;
    this.cache.runtimeMetrics?.recordFiberEnd(this.context, this._exit);
    if (this._parent) {
      this._parent._children?.delete(this);
      this._parent = undefined;
    }
    if (this._observers !== undefined) {
      const observers = this._observers;
      this._observers = undefined;
      for (let i = 0;i < observers.length; i++) {
        observers[i](exit);
      }
    }
    this._stack.length = 0;
    this._children = undefined;
    this.context = empty();
  }
  runLoop(effect) {
    const prevFiber = globalThis[currentFiberTypeId];
    globalThis[currentFiberTypeId] = this;
    const prevRunning = this._running;
    this._running = true;
    let yielding = false;
    let current = effect;
    this.currentOpCount = 0;
    try {
      while (true) {
        if (this._deferredInterrupt) {
          this._deferredInterrupt = false;
          current = failCause(this._interruptedCause);
        }
        this.currentOpCount++;
        const cache = this.cache;
        if (!yielding && !cache.preventYield && cache.scheduler.shouldYield(this)) {
          yielding = true;
          const prev = current;
          current = flatMap(yieldNow, () => prev);
        }
        current = cache.tracerContext ? cache.tracerContext(current, this) : current[evaluate](this);
        if (current === Yield) {
          const yielded = this._yielded;
          if (ExitTypeId in yielded) {
            this._deferredInterrupt = false;
            this._yielded = undefined;
            return yielded;
          } else if (this._deferredInterrupt) {
            this._yielded = undefined;
            yielded();
            continue;
          }
          return Yield;
        }
      }
    } catch (error) {
      if (!hasProperty(current, evaluate)) {
        return exitDie(`Fiber.runLoop: Not a valid effect: ${String(current)}`);
      }
      return this.runLoop(exitDie(error));
    } finally {
      this._running = prevRunning;
      globalThis[currentFiberTypeId] = prevFiber;
    }
  }
  getCont(symbol) {
    if (this._deferredInterrupt) {
      this._deferredInterrupt = false;
      return deferredInterruptCont;
    }
    while (true) {
      const op = this._stack.pop();
      if (!op)
        return;
      const all = op[contAll];
      if (all !== undefined) {
        const cont = all.call(op, this);
        if (cont) {
          cont[symbol] = cont;
          return cont;
        }
      }
      if (op[symbol])
        return op;
    }
  }
  succeedWith(value) {
    if ((++this.currentOpCount & maxInlineSteps - 1) === 0) {
      return exitSucceed(value);
    }
    const cont = this.getCont(contA);
    return cont ? cont[contA](value, this) : this.yieldWith(exitSucceed(value));
  }
  yieldWith(value) {
    this._yielded = value;
    return Yield;
  }
  children() {
    return this._children ??= new Set;
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
  setContext(context) {
    const previous = this.context;
    this.context = context;
    if (previous !== undefined && hasSameCache(previous, context))
      return;
    const root = context.cacheRoot;
    const cache = root._fiberCache ??= makeFiberContextCache(context);
    if (this.cache?.scheduler !== cache.scheduler) {
      this._dispatcher = undefined;
    }
    this.cache = cache;
  }
  get currentSpanLocal() {
    const span = this.cache.span;
    return span?._tag === "Span" ? span : undefined;
  }
}
var makeFiberContextCache = (context) => {
  const currentTracer = getOrUndefinedUnsafe(context, TracerKey);
  return {
    scheduler: get(context, Scheduler),
    tracer: currentTracer,
    tracerContext: currentTracer ? currentTracer["context"] : undefined,
    tracerEnabled: get(context, TracerEnabled),
    span: getOrUndefinedUnsafe(context, ParentSpanKey),
    logLevel: get(context, CurrentLogLevel),
    minimumLogLevel: get(context, MinimumLogLevel),
    stackFrame: get(context, CurrentStackFrame),
    runtimeMetrics: getOrUndefinedUnsafe(context, FiberRuntimeMetricsKey),
    maxOpsBeforeYield: get(context, MaxOpsBeforeYield),
    preventYield: get(context, PreventSchedulerYield)
  };
};
var deferredInterruptCont = {
  [contA](_value, fiber) {
    return failCause(fiber._interruptedCause);
  },
  [contE](_cause, fiber) {
    return failCause(fiber._interruptedCause);
  }
};
var maxInlineSteps = 32;
var fiberMiddleware = {
  interruptChildren: undefined
};
var fiberStackAnnotations = (fiber) => {
  if (!fiber.cache.stackFrame)
    return;
  const annotations = new Map;
  annotations.set(InterruptorStackTrace.key, fiber.cache.stackFrame);
  return makeUnsafe(annotations);
};
var fiberAwait = (self) => {
  const impl = self;
  if (impl._exit)
    return succeed3(impl._exit);
  return callback((resume) => {
    if (impl._exit)
      return resume(succeed3(impl._exit));
    return sync(self.addObserver((exit) => resume(succeed3(exit))));
  });
};
var fiberAwaitAll = (self) => callback((resume) => {
  const iter = self[Symbol.iterator]();
  const exits = [];
  let cancel = undefined;
  function loop() {
    let result = iter.next();
    while (!result.done) {
      if (result.value._exit) {
        exits.push(result.value._exit);
        result = iter.next();
        continue;
      }
      cancel = result.value.addObserver((exit) => {
        exits.push(exit);
        loop();
      });
      return;
    }
    resume(succeed3(exits));
  }
  loop();
  return sync(() => cancel?.());
});
var fiberInterrupt = (self) => withFiber((fiber) => fiberInterruptAs(self, fiber.id));
var fiberInterruptAs = /* @__PURE__ */ dual((args) => hasProperty(args[0], FiberTypeId), (self, fiberId, annotations) => withFiber((parent) => {
  let ann = fiberStackAnnotations(parent);
  ann = ann && annotations ? merge(ann, annotations) : ann ?? annotations;
  self.interruptUnsafe(fiberId, ann);
  return asVoid(fiberAwait(self));
}));
var fiberInterruptAll = (fibers) => withFiber((parent) => {
  const annotations = fiberStackAnnotations(parent);
  let fiberArr = empty2();
  for (const fiber of fibers) {
    fiber.interruptUnsafe(parent.id, annotations);
    fiberArr.push(fiber);
  }
  return asVoid(fiberAwaitAll(fiberArr));
});
var succeed3 = exitSucceed;
var failCause = exitFailCause;
var fail3 = exitFail;
var sync = /* @__PURE__ */ makePrimitive({
  op: "Sync",
  [evaluate](fiber) {
    const value = this[args]();
    const cont = fiber.getCont(contA);
    return cont ? cont[contA](value, fiber) : fiber.yieldWith(exitSucceed(value));
  }
});
var suspend = /* @__PURE__ */ makePrimitive({
  op: "Suspend",
  [evaluate](_fiber) {
    return this[args]();
  }
});
var fromResult = /* @__PURE__ */ match({
  onFailure: fail3,
  onSuccess: succeed3
});
var yieldNowWith = /* @__PURE__ */ makePrimitive({
  op: "Yield",
  [evaluate](fiber) {
    let resumed = false;
    fiber.currentDispatcher.scheduleTask(() => {
      if (resumed)
        return;
      fiber.evaluate(exitVoid);
    }, this[args] ?? 0);
    return fiber.yieldWith(() => {
      resumed = true;
    });
  }
});
var yieldNow = /* @__PURE__ */ yieldNowWith(0);
var failCauseSync = (evaluate) => suspend(() => failCause(evaluate()));
var die = (defect) => exitDie(defect);
var failSync = (error) => suspend(() => fail3(error()));
var void_ = /* @__PURE__ */ succeed3(undefined);
var try_ = (options) => {
  const evaluate = typeof options === "function" ? options : options.try;
  const catcher = typeof options === "function" ? (cause) => new UnknownError(cause, "An error occurred in Effect.try") : options.catch;
  return suspend(() => {
    try {
      return succeed3(evaluate());
    } catch (err) {
      return fail3(catcher(err));
    }
  });
};
var tryPromise = (options) => {
  const f = typeof options === "function" ? options : options.try;
  const catcher = typeof options === "function" ? (cause) => new UnknownError(cause, "An error occurred in Effect.tryPromise") : options.catch;
  return callbackOptions(function(resume, signal) {
    const failWithCatch = (cause) => suspend(() => {
      try {
        return fail3(internalCall(() => catcher(cause)));
      } catch (err) {
        return die(err);
      }
    });
    try {
      f(signal).then((a) => resume(succeed3(a)), (e) => resume(failWithCatch(e)));
    } catch (err) {
      resume(failWithCatch(err));
    }
  }, f.length !== 0);
};
var withFiberId = (f) => withFiber((fiber) => f(fiber.id));
var callbackOptions = /* @__PURE__ */ function() {
  const Proto = /* @__PURE__ */ makePrimitiveProto({
    op: "Async",
    [evaluate](fiber) {
      let resumed = false;
      let yielded = false;
      const controller = this.withSignal ? new AbortController : undefined;
      const onCancel = this.register.call(fiber.cache.scheduler, (effect) => {
        if (resumed)
          return;
        resumed = true;
        if (yielded) {
          fiber.evaluate(effect);
        } else {
          yielded = effect;
        }
      }, controller?.signal);
      if (yielded !== false)
        return yielded;
      yielded = true;
      fiber._yielded = () => {
        resumed = true;
      };
      if (controller === undefined && onCancel === undefined) {
        return Yield;
      }
      fiber._stack.push(asyncFinalizer(() => {
        resumed = true;
        controller?.abort();
        return onCancel ?? exitVoid;
      }));
      return Yield;
    }
  });
  const AsyncImpl = function(register, withSignal) {
    this.register = register;
    this.withSignal = withSignal;
  };
  AsyncImpl.prototype = Proto;
  return function(register, withSignal) {
    return new AsyncImpl(register, withSignal);
  };
}();
var asyncFinalizer = /* @__PURE__ */ makePrimitive({
  op: "AsyncFinalizer",
  [contAll](fiber) {
    if (fiber.interruptible) {
      fiber.interruptible = false;
      fiber._stack.push(setInterruptibleTrue);
    }
  },
  [contE](cause, _fiber) {
    return hasInterrupts(cause) ? flatMap(combineFinalizerCause(exitFailCause(cause), this[args]()), () => failCause(cause)) : failCause(cause);
  }
});
var callback = (register) => callbackOptions(register, register.length >= 2);
var never = /* @__PURE__ */ callback(constVoid);
var gen = (...args) => {
  if (args.length === 1) {
    const body = args[0];
    return suspend(() => fromIteratorUnsafe(body()));
  }
  const [options, body] = args;
  return suspend(() => fromIteratorUnsafe(body.call(options.self)));
};
var fnUntraced = (body, ...pipeables) => {
  const fn = pipeables.length === 0 ? function() {
    return suspend(() => fromIteratorUnsafe(body.apply(this, arguments)));
  } : function() {
    let effect = suspend(() => fromIteratorUnsafe(body.apply(this, arguments)));
    for (let i = 0;i < pipeables.length; i++) {
      effect = pipeables[i](effect, ...arguments);
    }
    return effect;
  };
  return defineFunctionLength(body.length, fn);
};
var defineFunctionLength = (length, fn) => Object.defineProperty(fn, "length", {
  value: length,
  configurable: true
});
var fnUntracedEager = (body, ...pipeables) => defineFunctionLength(body.length, pipeables.length === 0 ? function() {
  return fromIteratorEagerUnsafe(() => body.apply(this, arguments));
} : function() {
  let effect = fromIteratorEagerUnsafe(() => body.apply(this, arguments));
  for (const pipeable of pipeables) {
    effect = pipeable(effect, ...arguments);
  }
  return effect;
});
var fromIteratorEagerUnsafe = (evaluate) => {
  try {
    const iterator = evaluate();
    let value = undefined;
    while (true) {
      const state = iterator.next(value);
      if (state.done) {
        return succeed3(state.value);
      }
      const primitive = state.value;
      if (primitive && primitive._tag === "Success") {
        value = primitive.value;
        continue;
      } else if (primitive && primitive._tag === "Failure") {
        return state.value;
      } else {
        let isFirstExecution = true;
        return suspend(() => {
          if (isFirstExecution) {
            isFirstExecution = false;
            return flatMap(state.value, (value) => fromIteratorUnsafe(iterator, value));
          } else {
            return suspend(() => fromIteratorUnsafe(evaluate()));
          }
        });
      }
    }
  } catch (error) {
    return die(error);
  }
};
var fromIteratorUnsafe = /* @__PURE__ */ function() {
  const Proto = /* @__PURE__ */ makePrimitiveProto({
    op: "Iterator",
    [contA](value, fiber) {
      const iter = this.iterator;
      while (true) {
        const state = iter.next(value);
        if (state.done)
          return succeed3(state.value);
        if (!effectIsExit(state.value)) {
          fiber._stack.push(this);
          return state.value;
        } else if (state.value._tag === "Failure") {
          return state.value;
        }
        value = state.value.value;
      }
    },
    [evaluate](fiber) {
      return this[contA](this.initial, fiber);
    }
  });
  const IteratorImpl = function(iterator, initial) {
    this.iterator = iterator;
    this.initial = initial;
  };
  IteratorImpl.prototype = Proto;
  return function(iterator, initial) {
    return new IteratorImpl(iterator, initial);
  };
}();
var as = /* @__PURE__ */ dual(2, (self, value) => new ContImpl(self, returnPayload, succeed3(value)));
var evaluateCont = function(fiber) {
  fiber._stack.push(this);
  return this[args];
};
var OnSuccessProto = /* @__PURE__ */ makePrimitiveProto({
  op: "OnSuccess",
  [evaluate]: evaluateCont
});
var ContImpl = function(self, cont, payload) {
  this[args] = self;
  this[contA] = cont;
  this.payload = payload;
};
ContImpl.prototype = OnSuccessProto;
var returnPayload = function() {
  return this.payload;
};
var succeedPayload = function(_value, fiber) {
  return fiber.succeedWith(this.payload);
};
var continuationMarksStack = /* @__PURE__ */ (() => {
  const marker = "~effect/Effect/stackProbe";
  const probe = {
    [marker]: function stackProbe() {
      return new Error().stack;
    }
  };
  return probe[marker]()?.includes("[as " + marker + "]") === true;
})();
var mapCont = function(value, fiber) {
  const f = this.payload;
  return fiber.succeedWith(continuationMarksStack ? f(value) : internalCall(() => f(value)));
};
var andThenCont = function(value) {
  const f = this.payload;
  return f(value);
};
var tapCont = function(value) {
  const f = this.payload;
  return new ContImpl(f(value), succeedPayload, value);
};
var tapEffectCont = function(value) {
  return new ContImpl(this.payload, succeedPayload, value);
};
var asSome = (self) => map2(self, some2);
var andThen = /* @__PURE__ */ dual(2, (self, f) => new ContImpl(self, isEffect(f) ? returnPayload : andThenCont, f));
var tap = /* @__PURE__ */ dual(2, (self, f) => new ContImpl(self, isEffect(f) ? tapEffectCont : tapCont, f));
var asVoid = (self) => new ContImpl(self, returnPayload, exitVoid);
var raceAll = (all, options) => withFiber((parent) => {
  const fibers = new Set;
  onExitUnsafe(parent, () => fibers.size === 0 ? undefined : fiberInterruptAll(fibers));
  return callback((resume) => {
    const effects = fromIterable(all);
    const len = effects.length;
    let doneCount = 0;
    let done = false;
    const failures = [];
    const onExit = (exit, fiber, i) => {
      doneCount++;
      if (exit._tag === "Failure") {
        failures.push(...exit.cause.reasons);
        if (doneCount >= len) {
          resume(failCause(causeFromReasons(failures)));
        }
        return;
      }
      const isWinner = !done;
      done = true;
      resume(exit);
      if (isWinner && options?.onWinner) {
        options.onWinner({
          fiber,
          index: i,
          parentFiber: parent
        });
      }
    };
    for (let i = 0;i < len; i++) {
      const fiber = forkUnsafe(parent, effects[i], true, true, false);
      fibers.add(fiber);
      fiber.addObserver((exit) => {
        fibers.delete(fiber);
        onExit(exit, fiber, i);
      });
      if (done)
        break;
    }
  });
});
var raceAllFirst = (all, options) => withFiber((parent) => {
  const fibers = new Set;
  onExitUnsafe(parent, () => fibers.size === 0 ? undefined : fiberInterruptAll(fibers));
  return callback((resume) => {
    let done = false;
    let i = 0;
    for (const effect of all) {
      if (done)
        break;
      const index = i++;
      const fiber = forkUnsafe(parent, effect, true, true, false);
      fibers.add(fiber);
      fiber.addObserver((exit) => {
        fibers.delete(fiber);
        const isWinner = !done;
        done = true;
        resume(exit);
        if (isWinner && options?.onWinner) {
          options.onWinner({
            fiber,
            index,
            parentFiber: parent
          });
        }
      });
    }
  });
});
var raceFirst = /* @__PURE__ */ dual((args) => isEffect(args[1]), (self, that, options) => raceAllFirst([self, that], options));
var flatMap = /* @__PURE__ */ dual(2, (self, f) => new ContImpl(self, andThenCont, f));
var effectIsExit = (effect) => effect[ExitTypeId] !== undefined;
var flatMapEager = /* @__PURE__ */ dual(2, (self, f) => {
  if (effectIsExit(self)) {
    return self._tag === "Success" ? f(self.value) : self;
  }
  return flatMap(self, f);
});
var flatten2 = (self) => flatMap(self, identity);
var map2 = /* @__PURE__ */ dual(2, (self, f) => new ContImpl(self, mapCont, f));
var mapEager = /* @__PURE__ */ dual(2, (self, f) => effectIsExit(self) ? exitMap(self, f) : map2(self, f));
var mapErrorEager = /* @__PURE__ */ dual(2, (self, f) => effectIsExit(self) ? exitMapError(self, f) : mapError(self, f));
var exitIsSuccess = (self) => self._tag === "Success";
var exitIsFailure = (self) => self._tag === "Failure";
var exitVoid = /* @__PURE__ */ exitSucceed(undefined);
var exitMap = /* @__PURE__ */ dual(2, (self, f) => self._tag === "Success" ? exitSucceed(f(self.value)) : self);
var exitMapError = /* @__PURE__ */ dual(2, (self, f) => {
  if (self._tag === "Success")
    return self;
  const error = findError(self.cause);
  if (isFailure2(error))
    return self;
  return exitFail(f(error.success));
});
var exitAsVoidAll = (exits) => {
  const failures = [];
  for (const exit of exits) {
    if (exit._tag === "Failure") {
      failures.push(...exit.cause.reasons);
    }
  }
  return failures.length === 0 ? exitVoid : exitFailCause(causeFromReasons(failures));
};
var updateContext = /* @__PURE__ */ dual(2, (self, f) => withFiber((fiber) => {
  const prevContext = fiber.context;
  const nextContext = f(prevContext);
  if (prevContext === nextContext)
    return self;
  fiber.setContext(nextContext);
  onExitUnsafe(fiber, () => {
    fiber.setContext(prevContext);
    return;
  });
  return self;
}));
var provideService = function() {
  if (arguments.length === 1) {
    return dual(2, (self, impl) => provideServiceImpl(self, arguments[0], impl));
  }
  return dual(3, (self, service, impl) => provideServiceImpl(self, service, impl)).apply(this, arguments);
};
var provideServiceImpl = (self, service, implementation) => updateContext(self, add(service, implementation));
var catchCause = /* @__PURE__ */ dual(2, (self, f) => new OnFailureImpl(self, f.length !== 1 ? (cause) => f(cause) : f));
var OnFailureProto = /* @__PURE__ */ makePrimitiveProto({
  op: "OnFailure",
  [evaluate]: evaluateCont
});
var OnFailureImpl = function(self, f) {
  this[args] = self;
  this[contE] = f;
};
OnFailureImpl.prototype = OnFailureProto;
var catchCauseFilter = /* @__PURE__ */ dual(3, (self, filter, f) => catchCause(self, (cause) => {
  const eb = filter(cause);
  return isFailure2(eb) ? failCause(eb.failure) : f(eb.success, cause);
}));
var catch_ = /* @__PURE__ */ dual(2, (self, f) => catchCauseFilter(self, findError, (e) => f(e)));
var catchDefect = /* @__PURE__ */ dual(2, (self, f) => catchCauseFilter(self, findDefect, f));
var mapError = /* @__PURE__ */ dual(2, (self, f) => catch_(self, (error) => failSync(() => f(error))));
var result = (self) => matchEager(self, {
  onFailure: fail2,
  onSuccess: succeed2
});
var matchCauseEffect = /* @__PURE__ */ dual(2, (self, options) => new OnSuccessAndFailureImpl(self, options.onSuccess.length !== 1 ? (a) => options.onSuccess(a) : options.onSuccess, options.onFailure.length !== 1 ? (cause) => options.onFailure(cause) : options.onFailure));
var OnSuccessAndFailureProto = /* @__PURE__ */ makePrimitiveProto({
  op: "OnSuccessAndFailure",
  [evaluate]: evaluateCont
});
var OnSuccessAndFailureImpl = function(self, onSuccess, onFailure) {
  this[args] = self;
  this[contA] = onSuccess;
  this[contE] = onFailure;
};
OnSuccessAndFailureImpl.prototype = OnSuccessAndFailureProto;
var matchSuccess = function(value, fiber) {
  const handlers = this.payload;
  return fiber.succeedWith(continuationMarksStack ? handlers.onSuccess(value) : internalCall(() => handlers.onSuccess(value)));
};
var makeMatch = (op, onFailure) => {
  const Proto = makePrimitiveProto({
    op,
    [evaluate]: evaluateCont,
    [contA]: matchSuccess,
    [contE]: onFailure
  });
  const MatchImpl = function(self, handlers) {
    this[args] = self;
    this.payload = handlers;
  };
  MatchImpl.prototype = Proto;
  return MatchImpl;
};
var MatchImpl = /* @__PURE__ */ makeMatch("Match", function(cause, fiber) {
  const fail = cause.reasons.find(isFailReason);
  if (fail === undefined)
    return failCause(cause);
  const handlers = this.payload;
  return fiber.succeedWith(continuationMarksStack ? handlers.onFailure(fail.error) : internalCall(() => handlers.onFailure(fail.error)));
});
var match3 = /* @__PURE__ */ dual(2, (self, options) => new MatchImpl(self, options));
var matchEager = /* @__PURE__ */ dual(2, (self, options) => {
  if (effectIsExit(self)) {
    if (self._tag === "Success")
      return exitSucceed(options.onSuccess(self.value));
    const error = findError(self.cause);
    if (isFailure2(error))
      return self;
    return exitSucceed(options.onFailure(error.success));
  }
  return match3(self, options);
});
var exit = (self) => effectIsExit(self) ? exitSucceed(self) : exitPrimitive(self);
var exitPrimitive = /* @__PURE__ */ makePrimitive({
  op: "Exit",
  [evaluate](fiber) {
    fiber._stack.push(this);
    return this[args];
  },
  [contA](value, fiber, exit) {
    return fiber.succeedWith(exit ?? exitSucceed(value));
  },
  [contE](cause, fiber, exit) {
    return fiber.succeedWith(exit ?? exitFailCause(cause));
  }
});
var timeoutOrElse = /* @__PURE__ */ dual(2, (self, options) => flatMap(timeoutOption(self, options.duration), (option) => isNone2(option) ? options.orElse() : succeed3(option.value)));
var timeoutOption = /* @__PURE__ */ dual(2, (self, duration) => raceFirst(asSome(self), as(sleep(duration), none2())));
var ScopeTypeId = "~effect/Scope";
var ScopeCloseableTypeId = "~effect/Scope/Closeable";
var scopeClose = (self, exit_) => withFiber((fiber) => {
  const close = scopeCloseUnsafe(self, exit_);
  if (close === undefined)
    return void_;
  fiberEnterUninterruptibleUnsafe(fiber);
  return close;
});
var scopeCloseUnsafe = (self, exit_) => {
  const state = self.state;
  if (state._tag === "Closed")
    return;
  self.state = {
    _tag: "Closed",
    exit: exit_
  };
  if (self.parent !== undefined) {
    scopeRemoveFinalizerUnsafe(self.parent, self);
  }
  if (state._tag === "Empty")
    return;
  if (state.finalizer !== undefined) {
    return runFinalizer(state.finalizer, exit_);
  }
  const finalizers = state.finalizers;
  if (finalizers.size === 1) {
    return runFinalizer(finalizers.values().next().value, exit_);
  }
  return scopeCloseFinalizers(self, finalizers, exit_);
};
var runFinalizer = (finalizer, exit_) => {
  try {
    return finalizer(exit_);
  } catch (defect) {
    return exitDie(defect);
  }
};
var combineFinalizerCause = (exit_, finalizer) => exitIsSuccess(exit_) ? finalizer : catchCause(finalizer, (cause) => failCause(causeCombine(exit_.cause, cause)));
var scopeCloseFinalizers = /* @__PURE__ */ fnUntraced(function* (self, finalizers, exit_) {
  let exits = [];
  const fibers = [];
  const arr = Array.from(finalizers.values());
  const parent = getCurrentFiber();
  for (let i = arr.length - 1;i >= 0; i--) {
    const finalizer = arr[i];
    if (self.strategy === "sequential") {
      exits.push(yield* exit(runFinalizer(finalizer, exit_)));
    } else {
      fibers.push(forkUnsafe(parent, runFinalizer(finalizer, exit_), true, true, "inherit"));
    }
  }
  if (fibers.length > 0) {
    exits = yield* fiberAwaitAll(fibers);
  }
  return yield* exitAsVoidAll(exits);
});
var scopeAddFinalizerUnsafe = (scope, key, finalizer) => {
  if (scope.state._tag === "Empty") {
    scope.state = {
      _tag: "Open",
      finalizerKey: key,
      finalizer,
      finalizers: undefined
    };
  } else if (scope.state._tag === "Open") {
    const state = scope.state;
    if (state.finalizer !== undefined) {
      state.finalizers = new Map([[state.finalizerKey, state.finalizer]]);
      state.finalizerKey = undefined;
      state.finalizer = undefined;
      state.finalizers.set(key, finalizer);
    } else {
      state.finalizers.set(key, finalizer);
    }
  }
};
var scopeRemoveFinalizerUnsafe = (scope, key) => {
  if (scope.state._tag !== "Open")
    return;
  const state = scope.state;
  if (state.finalizerKey === key) {
    scope.state = constScopeEmpty;
  } else if (state.finalizers !== undefined) {
    state.finalizers.delete(key);
    if (state.finalizers.size === 0) {
      scope.state = constScopeEmpty;
    }
  }
};
var scopeMakeUnsafe = (finalizerStrategy) => makeScope(finalizerStrategy, undefined);
var makeScope = (finalizerStrategy = "sequential", parent) => ({
  [ScopeCloseableTypeId]: ScopeCloseableTypeId,
  [ScopeTypeId]: ScopeTypeId,
  strategy: finalizerStrategy,
  parent,
  state: constScopeEmpty
});
var constScopeEmpty = {
  _tag: "Empty"
};
var scopeMake = (finalizerStrategy) => sync(() => scopeMakeUnsafe(finalizerStrategy));
var OnExitImpl = /* @__PURE__ */ function() {
  const Proto = /* @__PURE__ */ makePrimitiveProto({
    op: "OnExit",
    [evaluate](fiber) {
      fiber._stack.push(this);
      return this.effect;
    },
    [contAll](fiber) {
      if (fiber.interruptible && this.interruptible !== true) {
        fiber._stack.push(setInterruptibleTrue);
        fiber.interruptible = false;
      }
    },
    [contA](value, _, exit) {
      exit ??= exitSucceed(value);
      let eff;
      try {
        eff = this.onExit(exit);
      } catch (defect) {
        eff = exitDie(defect);
      }
      return eff ? flatMap(eff, (_) => exit) : exit;
    },
    [contE](cause, _, exit) {
      exit ??= exitFailCause(cause);
      let eff;
      try {
        eff = this.onExit(exit);
      } catch (defect) {
        eff = exitDie(defect);
      }
      return eff ? flatMap(combineFinalizerCause(exit, eff), (_) => exit) : exit;
    }
  });
  const OnExitImpl = function(effect, onExit, interruptible) {
    this.effect = effect;
    this.onExit = onExit;
    this.interruptible = interruptible;
  };
  OnExitImpl.prototype = Proto;
  return OnExitImpl;
}();
var onExitPrimitive = (effect, onExit, interruptible) => new OnExitImpl(effect, onExit, interruptible);
var onExitUnsafe = (fiber, f) => {
  fiber._stack.push(new OnExitImpl(undefined, f, undefined));
};
var onExit = /* @__PURE__ */ dual(2, onExitPrimitive);
var ensuring = /* @__PURE__ */ dual(2, (self, finalizer) => onExit(self, (_) => finalizer));
var acquireUseRelease = (acquire, use, release) => uninterruptibleMask((restore) => flatMap(acquire, (a) => onExitPrimitive(suspend(() => restore(use(a))), (exit) => release(a, exit), true)));
var interrupt = /* @__PURE__ */ withFiber((fiber) => failCause(causeInterrupt(fiber.id)));
var uninterruptible = (self) => withFiber((fiber) => {
  if (!fiber.interruptible)
    return self;
  fiber.interruptible = false;
  fiber._stack.push(setInterruptibleTrue);
  return self;
});
var setInterruptible = /* @__PURE__ */ makePrimitive({
  op: "SetInterruptible",
  [contAll](fiber) {
    fiber.interruptible = this[args];
    if (fiber._interruptedCause && fiber.interruptible) {
      return () => failCause(fiber._interruptedCause);
    }
  }
});
var setInterruptibleTrue = /* @__PURE__ */ setInterruptible(true);
var setInterruptibleFalse = /* @__PURE__ */ setInterruptible(false);
var setFiberInterruptible = (fiber) => {
  fiber.interruptible = true;
  fiber._stack.push(setInterruptibleFalse);
  if (fiber._interruptedCause)
    return failCause(fiber._interruptedCause);
};
var fiberEnterUninterruptibleUnsafe = (fiber) => {
  const impl = fiber;
  if (!impl.interruptible)
    return;
  impl.interruptible = false;
  impl._stack.push(setInterruptibleTrue);
};
var interruptible = (self) => withFiber((fiber) => {
  if (fiber.interruptible)
    return self;
  return setFiberInterruptible(fiber) ?? self;
});
var uninterruptibleMask = (f) => withFiber((fiber) => {
  if (!fiber.interruptible)
    return f(identity);
  fiber.interruptible = false;
  fiber._stack.push(setInterruptibleTrue);
  return f(interruptible);
});
var all = (arg, options) => {
  if (isIterable(arg)) {
    return options?.mode === "result" ? forEach(arg, result, options) : forEach(arg, identity, options);
  } else if (options?.discard) {
    return options.mode === "result" ? forEach(Object.values(arg), result, options) : forEach(Object.values(arg), identity, options);
  }
  return suspend(() => {
    const out = {};
    return as(forEach(Object.entries(arg), ([key, effect]) => map2(options?.mode === "result" ? result(effect) : effect, (value) => {
      assignProperty(out, key, value);
    }), {
      discard: true,
      concurrency: options?.concurrency
    }), out);
  });
};
var whileLoop = /* @__PURE__ */ makePrimitive({
  op: "While",
  [contA](value, fiber) {
    this[args].step(value);
    if (this[args].while()) {
      fiber._stack.push(this);
      return this[args].body();
    }
    return exitVoid;
  },
  [evaluate](fiber) {
    if (this[args].while()) {
      fiber._stack.push(this);
      return this[args].body();
    }
    return exitVoid;
  }
});
var forEach = /* @__PURE__ */ dual((args) => typeof args[1] === "function", (iterable, f, options) => suspend(() => {
  const concurrency = resolveConcurrency(options?.concurrency);
  if (concurrency === 1) {
    return forEachSequential(iterable, f, options);
  }
  const items = fromIterable(iterable);
  let length = items.length;
  if (length === 0) {
    return options?.discard ? void_ : succeed3([]);
  }
  const out = options?.discard ? undefined : new Array(length);
  const eff = forEachConcurrent({
    f,
    out
  }, items, {
    concurrency
  });
  return eff ? as(eff, out) : succeed3(out);
}));
var forEachSequential = (iterable, f, options) => suspend(() => {
  const out = options?.discard ? undefined : [];
  const iterator = iterable[Symbol.iterator]();
  let state = iterator.next();
  let index = 0;
  return as(whileLoop({
    while: () => !state.done,
    body: () => f(state.value, index++),
    step: (b) => {
      if (out)
        out.push(b);
      state = iterator.next();
    }
  }), out);
});
var resolveConcurrency = (concurrency) => concurrency === "unbounded" ? Number.POSITIVE_INFINITY : Math.max(1, concurrency ?? 1);
var iterateEager = () => (options) => {
  const onItem = options.onItem;
  const step = options.step;
  const resumeSequential = (state, items, index, end, effect) => flatMap(exit(effect), (itemExit) => step(state, items[index], itemExit, index) ?? runSequential(state, items, index + 1, end) ?? void_);
  const runSequential = (state, items, index = 0, end = items.length) => {
    for (;index < end; index++) {
      const item = items[index];
      const effect = onItem(state, item, index);
      if (!effectIsExit(effect)) {
        return resumeSequential(state, items, index, end, effect);
      }
      const terminal = step(state, item, effect, index);
      if (terminal)
        return terminal._tag === "Failure" ? terminal : undefined;
    }
  };
  return runSequential;
};
var iterateConcurrentImpl = (options) => {
  const onItem = options.onItem;
  const step = options.step;
  return (state, items, opts) => {
    let index = 0;
    const end = opts.end ?? items.length;
    const concurrency = opts.concurrency;
    let done = false;
    let parentFiber;
    let fibers;
    let resume;
    let terminal;
    let effect;
    const failDefect = (error) => {
      const defect = exitDie(error);
      terminal = defect;
      done = true;
      return fibers && fibers.size > 0 ? flatMap(uninterruptible(fiberInterruptAll(Array.from(fibers))), () => terminal ?? defect) : defect;
    };
    const go = () => {
      let paused = false;
      for (;!terminal && index < end; index++) {
        const item = items[index];
        const eff = effect ?? onItem(state, item, index);
        if (effectIsExit(eff)) {
          terminal = step(state, item, eff, index);
          if (terminal)
            break;
        } else if (!parentFiber) {
          return callback((cb) => {
            parentFiber = getCurrentFiber();
            fibers = new Set;
            effect = eff;
            resume = cb;
            let result;
            try {
              result = go();
            } catch (error) {
              return cb(failDefect(error));
            }
            if (result)
              return cb(result);
            return suspend(() => {
              terminal ??= exitVoid;
              return flatMap(fibers ? fiberInterruptAll(fibers) : void_, () => terminal?._tag === "Failure" ? terminal : void_);
            });
          });
        } else {
          effect = undefined;
          const fiber = forkUnsafe(parentFiber, eff, true, true, "inherit");
          if (fiber._exit) {
            terminal = step(state, item, fiber._exit, index);
            if (terminal)
              break;
            continue;
          }
          fibers.add(fiber);
          const currentIndex = index;
          fiber.addObserver((exit) => {
            fibers.delete(fiber);
            try {
              if (terminal) {
                if (exit._tag === "Failure") {
                  const reasons = exit.cause.reasons.filter((reason) => reason._tag !== "Interrupt");
                  if (reasons.length > 0) {
                    const cause = causeFromReasons(reasons);
                    terminal = exitFailCause(terminal._tag === "Failure" ? causeCombine(terminal.cause, cause) : cause);
                  }
                }
              } else {
                const result = step(state, item, exit, currentIndex);
                if (result) {
                  terminal = result;
                  go();
                }
              }
              if (paused) {
                const eff = go();
                if (eff)
                  resume(eff);
              } else if (done && fibers.size === 0) {
                resume(terminal ?? void_);
              }
            } catch (error) {
              resume(failDefect(error));
            }
          });
          if (fibers.size < concurrency)
            continue;
          paused = true;
          index++;
          return;
        }
      }
      done = true;
      if (terminal) {
        if (fibers && fibers.size > 0) {
          const annotations = fiberStackAnnotations(parentFiber);
          fibers.forEach((f) => f.interruptUnsafe(parentFiber.id, annotations));
          return;
        }
        if (resume || terminal._tag === "Failure") {
          return terminal;
        }
      } else if (resume) {
        if (!fibers) {
          return exitVoid;
        } else if (fibers.size === 0) {
          resume(void_);
        }
      }
    };
    return go();
  };
};
var iterateConcurrent = () => (options) => iterateConcurrentImpl(options);
var forEachConcurrent = /* @__PURE__ */ iterateConcurrentImpl({
  onItem(state, item, index) {
    return state.f(item, index);
  },
  step(state, _, exit, index) {
    if (exit._tag === "Failure")
      return exit;
    else if (state.out) {
      state.out[index] = exit.value;
    }
  }
});
var forkUnsafe = (parent, effect, immediate = false, daemon = false, uninterruptible = false) => {
  const parentRuntime = parent;
  const interruptible = uninterruptible === "inherit" ? parentRuntime.interruptible : !uninterruptible;
  const child = new FiberImpl(parentRuntime.context, interruptible);
  if (immediate) {
    child.evaluate(effect);
  } else {
    child._asyncContext = captureAsyncContext();
    parentRuntime.currentDispatcher.scheduleTask(() => child.evaluate(effect), 0);
  }
  if (!daemon && !child._exit) {
    parentRuntime.children().add(child);
    child._parent = parentRuntime;
  }
  return child;
};
var forkIn = /* @__PURE__ */ dual((args) => isEffect(args[0]), (self, scope, options) => withFiber((parent) => {
  const fiber = forkUnsafe(parent, self, options?.startImmediately, true, options?.uninterruptible);
  if (!fiber._exit) {
    if (scope.state._tag !== "Closed") {
      const key = {};
      const finalizer = () => withFiberId((interruptor) => interruptor === fiber.id ? void_ : fiberInterrupt(fiber));
      scopeAddFinalizerUnsafe(scope, key, finalizer);
      fiber.addObserver(() => scopeRemoveFinalizerUnsafe(scope, key));
    } else {
      fiber.interruptUnsafe(parent.id, fiberStackAnnotations(parent));
    }
  }
  return succeed3(fiber);
}));
var runForkWith = (context) => (effect, options) => {
  const fiber = new FiberImpl(options?.scheduler ? add(context, Scheduler, options.scheduler) : context, options?.uninterruptible !== true);
  fiber.evaluate(effect);
  if (fiber._exit)
    return fiber;
  if (options?.signal) {
    if (options.signal.aborted) {
      fiber.interruptUnsafe();
    } else {
      const abort = () => fiber.interruptUnsafe();
      options.signal.addEventListener("abort", abort, {
        once: true
      });
      fiber.addObserver(() => options.signal.removeEventListener("abort", abort));
    }
  }
  if (options?.onFiberStart) {
    options.onFiberStart(fiber);
  }
  return fiber;
};
var runPromiseExitWith = (context) => {
  const runFork = runForkWith(context);
  return (effect, options) => {
    const fiber = runFork(effect, options);
    return new Promise((resolve) => {
      fiber.addObserver((exit) => resolve(exit));
    });
  };
};
var runPromiseWith = (context) => {
  const runPromiseExit = runPromiseExitWith(context);
  return (effect, options) => runPromiseExit(effect, options).then((exit) => {
    if (exit._tag === "Failure") {
      throw causeSquash(exit.cause);
    }
    return exit.value;
  });
};
var runPromise = /* @__PURE__ */ runPromiseWith(/* @__PURE__ */ empty());
var runSyncExitWith = (context) => {
  const runFork = runForkWith(context);
  return (effect) => {
    if (effectIsExit(effect))
      return effect;
    const scheduler = new MixedScheduler("sync");
    const fiber = runFork(effect, {
      scheduler
    });
    fiber._dispatcher?.flush();
    return fiber._exit ?? exitDie(new AsyncFiberError(fiber));
  };
};
var runSyncExit = /* @__PURE__ */ runSyncExitWith(/* @__PURE__ */ empty());
var ClockRef = /* @__PURE__ */ Reference("effect/Clock", {
  defaultValue: () => new ClockImpl
});
var MAX_TIMER_MILLIS = 2 ** 31 - 1;

class ClockImpl {
  currentTimeMillisUnsafe() {
    return Date.now();
  }
  currentTimeMillis = /* @__PURE__ */ sync(() => this.currentTimeMillisUnsafe());
  currentTimeNanosUnsafe() {
    return wallTimeNanos();
  }
  currentTimeNanos = /* @__PURE__ */ sync(() => this.currentTimeNanosUnsafe());
  monotonicTimeNanosUnsafe() {
    return monotonicNowNanos();
  }
  monotonicTimeNanos = /* @__PURE__ */ sync(() => this.monotonicTimeNanosUnsafe());
  sleep(duration) {
    return this.sleepMillis(toMillis(duration));
  }
  sleepMillis(millis) {
    if (millis <= 0)
      return yieldNow;
    else if (!Number.isFinite(millis))
      return never;
    return callback((resume) => {
      const continuation = millis > MAX_TIMER_MILLIS ? this.sleepMillis(millis - MAX_TIMER_MILLIS) : void_;
      const handle = setTimeout(() => resume(continuation), Math.min(millis, MAX_TIMER_MILLIS));
      return sync(() => clearTimeout(handle));
    });
  }
}
var nanosPerMilli = /* @__PURE__ */ BigInt(1e6);
var monotonicNowNanos = /* @__PURE__ */ function() {
  const processHrtime = globalThis.process?.hrtime;
  if (typeof processHrtime?.bigint === "function") {
    return () => processHrtime.bigint();
  }
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return () => BigInt(Math.round(performance.now() * 1e6));
  }
  let previous = /* @__PURE__ */ BigInt(0);
  return () => {
    const current = BigInt(Date.now()) * nanosPerMilli;
    if (current > previous) {
      previous = current;
    }
    return previous;
  };
}();
var wallTimeNanos = /* @__PURE__ */ function() {
  const reanchorThresholdNanos = /* @__PURE__ */ BigInt(1e9);
  let origin;
  return () => {
    const monotonic = monotonicNowNanos();
    const wall = BigInt(Date.now()) * nanosPerMilli;
    if (origin === undefined) {
      origin = wall - monotonic;
    } else {
      const projected = origin + monotonic;
      const skew = wall > projected ? wall - projected : projected - wall;
      if (skew > reanchorThresholdNanos) {
        origin = wall - monotonic;
      }
    }
    return origin + monotonic;
  };
}();
var clockWith = (f) => withFiber((fiber) => f(fiber.getRef(ClockRef)));
var sleep = (duration) => clockWith((clock) => clock.sleep(fromInputUnsafe(duration)));
var AsyncFiberErrorTypeId = "~effect/Cause/AsyncFiberError";
class AsyncFiberError extends (/* @__PURE__ */ TaggedError("AsyncFiberError")) {
  [AsyncFiberErrorTypeId] = AsyncFiberErrorTypeId;
  constructor(fiber) {
    super({
      message: "An asynchronous Effect was executed with Effect.runSync",
      fiber
    });
  }
}
var UnknownErrorTypeId = "~effect/Cause/UnknownError";
class UnknownError extends (/* @__PURE__ */ TaggedError("UnknownError")) {
  [UnknownErrorTypeId] = UnknownErrorTypeId;
  constructor(cause, message) {
    super({
      message,
      cause
    });
  }
}
var LoggerTypeId = "~effect/Logger";
var LoggerProto = {
  [LoggerTypeId]: {
    _Message: identity,
    _Output: identity
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var colors = {
  bold: "1",
  red: "31",
  green: "32",
  yellow: "33",
  blue: "34",
  cyan: "36",
  white: "37",
  gray: "90",
  black: "30",
  bgBrightRed: "101"
};
var logLevelColors = {
  None: [],
  All: [],
  Trace: [colors.gray],
  Debug: [colors.blue],
  Info: [colors.green],
  Warn: [colors.yellow],
  Error: [colors.red],
  Fatal: [colors.bgBrightRed, colors.black]
};
var undefined_ = /* @__PURE__ */ succeed3(undefined);

// ../node_modules/effect/dist/Cause.js
var isFailReason2 = isFailReason;
var isInterruptReason2 = isInterruptReason;
var die2 = causeDie;
var hasInterruptsOnly2 = hasInterruptsOnly;
var map3 = causeMap;
var squash = causeSquash;
var prettyErrors = causePrettyErrors;

// ../node_modules/effect/dist/Exit.js
var succeed4 = exitSucceed;
var failCause2 = exitFailCause;
var fail4 = exitFail;
var void_2 = exitVoid;
var isSuccess3 = exitIsSuccess;
var isFailure3 = exitIsFailure;

// ../node_modules/effect/dist/Deferred.js
var TypeId5 = "~effect/Deferred";
var DeferredProto = {
  [TypeId5]: {
    _A: identity,
    _E: identity
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var DeferredImpl = function() {
  this.resumes = undefined;
  this.effect = undefined;
};
DeferredImpl.prototype = DeferredProto;
var makeUnsafe2 = () => new DeferredImpl;
var _await = (self) => callback((resume) => {
  if (self.effect)
    return resume(self.effect);
  self.resumes ??= [];
  self.resumes.push(resume);
  return sync(() => {
    const resumes = self.resumes;
    if (resumes === undefined)
      return;
    const index = resumes.indexOf(resume);
    if (index >= 0)
      resumes.splice(index, 1);
  });
});
var isDoneUnsafe = (self) => self.effect !== undefined;
var doneUnsafe = (self, effect) => {
  if (self.effect)
    return false;
  self.effect = effect;
  if (self.resumes) {
    const resumes = self.resumes;
    self.resumes = undefined;
    for (let i = 0;i < resumes.length; i++) {
      resumes[i](effect);
    }
  }
  return true;
};

// ../node_modules/effect/dist/Scope.js
var make4 = scopeMake;
var close = scopeClose;

// ../node_modules/effect/dist/Effect.js
var isEffect2 = isEffect;
var all2 = all;
var forEach2 = forEach;
var tryPromise2 = tryPromise;
var succeed5 = succeed3;
var suspend2 = suspend;
var sync2 = sync;
var void_3 = void_;
var undefined_2 = undefined_;
var callback2 = callback;
var gen2 = gen;
var fail5 = fail3;
var failCause3 = failCause;
var failCauseSync2 = failCauseSync;
var die3 = die;
var try_2 = try_;
var yieldNow2 = yieldNow;
var withFiber2 = withFiber;
var fromResult2 = fromResult;
var flatMap2 = flatMap;
var flatten3 = flatten2;
var andThen2 = andThen;
var tap2 = tap;
var exit2 = exit;
var map4 = map2;
var as2 = as;
var asVoid2 = asVoid;
var catch_2 = catch_;
var catchCause2 = catchCause;
var catchDefect2 = catchDefect;
var mapError2 = mapError;
var timeoutOrElse2 = timeoutOrElse;
var raceAll2 = raceAll;
var matchCauseEffect2 = matchCauseEffect;
var provideService2 = provideService;
var acquireUseRelease2 = acquireUseRelease;
var ensuring2 = ensuring;
var onExit2 = onExit;
var interrupt2 = interrupt;
var uninterruptibleMask2 = uninterruptibleMask;
var forkIn2 = forkIn;
var runPromise2 = runPromise;
var runSyncExit2 = runSyncExit;
var mapEager2 = mapEager;
var mapErrorEager2 = mapErrorEager;
var flatMapEager2 = flatMapEager;
var fnUntracedEager2 = fnUntracedEager;

// ../node_modules/effect/dist/encoding/Base64.js
var encode = (input) => encodeBytes(typeof input === "string" ? encoder.encode(input) : input);
var decode = (str) => {
  const stripped = stripCrlf(str);
  const length = stripped.length;
  if (length % 4 !== 0) {
    return fail2(new EncodingError({
      kind: "Decode",
      module: "Base64",
      input: stripped,
      message: `Length must be a multiple of 4, but is ${length}`
    }));
  }
  const index = stripped.indexOf("=");
  if (index !== -1 && (index < length - 2 || index === length - 2 && stripped[length - 1] !== "=")) {
    return fail2(new EncodingError({
      kind: "Decode",
      module: "Base64",
      input: stripped,
      message: "Found a '=' character, but it is not at the end"
    }));
  }
  try {
    const missingOctets = stripped.endsWith("==") ? 2 : stripped.endsWith("=") ? 1 : 0;
    const result = new Uint8Array(3 * (length / 4) - missingOctets);
    for (let i = 0, j = 0;i < length; i += 4, j += 3) {
      const buffer = getCode(stripped.charCodeAt(i)) << 18 | getCode(stripped.charCodeAt(i + 1)) << 12 | getCode(stripped.charCodeAt(i + 2)) << 6 | getCode(stripped.charCodeAt(i + 3));
      result[j] = buffer >> 16;
      result[j + 1] = buffer >> 8 & 255;
      result[j + 2] = buffer & 255;
    }
    return succeed2(result);
  } catch (cause) {
    return fail2(new EncodingError({
      kind: "Decode",
      module: "Base64",
      input: stripped,
      message: cause instanceof Error ? cause.message : "Invalid input"
    }));
  }
};
var encodeBytes = (bytes) => {
  const length = bytes.length;
  let result = "";
  let i;
  for (i = 2;i < length; i += 3) {
    result += alphabet[bytes[i - 2] >> 2];
    result += alphabet[(bytes[i - 2] & 3) << 4 | bytes[i - 1] >> 4];
    result += alphabet[(bytes[i - 1] & 15) << 2 | bytes[i] >> 6];
    result += alphabet[bytes[i] & 63];
  }
  if (i === length + 1) {
    result += alphabet[bytes[i - 2] >> 2];
    result += alphabet[(bytes[i - 2] & 3) << 4];
    result += "==";
  }
  if (i === length) {
    result += alphabet[bytes[i - 2] >> 2];
    result += alphabet[(bytes[i - 2] & 3) << 4 | bytes[i - 1] >> 4];
    result += alphabet[(bytes[i - 1] & 15) << 2];
    result += "=";
  }
  return result;
};
var encoder = /* @__PURE__ */ new TextEncoder;
var stripCrlf = (str) => str.replace(/[\n\r]/g, "");
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var codes = /* @__PURE__ */ new Uint8Array(123).fill(255);
for (let i = 0;i < alphabet.length; i++)
  codes[/* @__PURE__ */ alphabet.charCodeAt(i)] = i;
codes[61] = 0;
var getCode = (charCode) => {
  if (charCode >= codes.length || codes[charCode] === 255) {
    throw new TypeError(`Invalid character ${String.fromCharCode(charCode)}`);
  }
  return codes[charCode];
};

// ../node_modules/effect/dist/internal/schema/annotations.js
function resolve(ast) {
  return ast.checks ? ast.checks[ast.checks.length - 1].annotations : ast.annotations;
}
function resolveAt(key) {
  return (ast) => resolve(ast)?.[key];
}
var STRUCTURAL_ANNOTATION_KEY = "~structural";
var IDENTIFIER_FALLBACK_KEY = "~identifier";
var SENTINELS_ANNOTATION_KEY = "~sentinels";
var CONSTRUCTOR_ANNOTATION_KEY = "~constructor";
var jsonSchemaAnnotationKeys = ["title", "description", "default", "examples", "readOnly", "writeOnly", "format", "contentEncoding", "contentMediaType", "contentSchema"];
var resolveIdentifier = /* @__PURE__ */ resolveAt("identifier");
var resolveIdentifierFallback = /* @__PURE__ */ resolveAt(IDENTIFIER_FALLBACK_KEY);
var getExpected = /* @__PURE__ */ memoize((ast) => {
  const identifier = resolve(ast)?.identifier;
  if (typeof identifier === "string")
    return identifier;
  return ast.getExpected(getExpected);
});
var annotationExcludedKeys = /* @__PURE__ */ new Set([SENTINELS_ANNOTATION_KEY, STRUCTURAL_ANNOTATION_KEY, "representation", "arbitraryConstraint", "toJsonSchema", "toCode", "toEquivalence", "toFormatter", "toCodec", "toCodecJson", "toCodecStringTree", "toCodecIso", "toCodecArbitrary"]);

// ../node_modules/effect/dist/internal/schema/parser.js
var missing = /* @__PURE__ */ Symbol();
var succeed6 = succeed4;
var missingExit = /* @__PURE__ */ succeed6(missing);
var sameExit = /* @__PURE__ */ succeed6(missing);
var toOption = (value) => value === missing ? none2() : some2(value);
var fromOptionExit = (option) => option._tag === "None" ? missingExit : succeed6(option.value);

// ../node_modules/effect/dist/SchemaIssue.js
var TypeId6 = "~effect/SchemaIssue/Issue";
function isIssue(u) {
  return hasProperty(u, TypeId6) && u[TypeId6] === TypeId6;
}
function hasInput(issue) {
  return Object.hasOwn(issue, "input");
}

class IssueNodeImpl {
  [TypeId6] = TypeId6;
  constructor(input, options) {
    if (options?.reportInput === true && input !== missing) {
      this.input = input;
    }
  }
}
var Filter = class extends IssueNodeImpl {
  _tag = "Filter";
  filter;
  issue;
  constructor(filter, issue, input, options) {
    super(input, options);
    this.filter = filter;
    this.issue = issue;
  }
};
var Encoding = class extends IssueNodeImpl {
  _tag = "Encoding";
  ast;
  issue;
  constructor(ast, issue, input, options) {
    super(input, options);
    this.ast = ast;
    this.issue = issue;
  }
};
var Pointer = class extends IssueNodeImpl {
  _tag = "Pointer";
  path;
  issue;
  constructor(path, issue) {
    super();
    this.path = path;
    this.issue = issue;
  }
};
var MissingKey = class extends IssueNodeImpl {
  _tag = "MissingKey";
  annotations;
  constructor(annotations) {
    super();
    this.annotations = annotations;
  }
};
var UnexpectedKey = class extends IssueNodeImpl {
  _tag = "UnexpectedKey";
  ast;
  constructor(ast, input, options) {
    super(input, options);
    this.ast = ast;
  }
};
var Composite = class extends IssueNodeImpl {
  _tag = "Composite";
  ast;
  issues;
  constructor(ast, issues, input, options) {
    super(input, options);
    this.ast = ast;
    this.issues = issues;
  }
};
var InvalidType = class extends IssueNodeImpl {
  _tag = "InvalidType";
  ast;
  constructor(ast, input, options) {
    super(input, options);
    this.ast = ast;
  }
};
var InvalidValue = class extends IssueNodeImpl {
  _tag = "InvalidValue";
  annotations;
  constructor(annotations, input, options) {
    super(input, options);
    this.annotations = annotations;
  }
};
var AnyOf = class extends IssueNodeImpl {
  _tag = "AnyOf";
  ast;
  issues;
  constructor(ast, issues, input, options) {
    super(input, options);
    this.ast = ast;
    this.issues = issues;
  }
};
var OneOf = class extends IssueNodeImpl {
  _tag = "OneOf";
  ast;
  successes;
  constructor(ast, successes, input, options) {
    super(input, options);
    this.ast = ast;
    this.successes = successes;
  }
};
function makeFilterIssue(entry, input, options) {
  if (isIssue(entry)) {
    return entry;
  }
  if (typeof entry === "string") {
    return new InvalidValue({
      message: entry
    }, input, options);
  }
  const inner = typeof entry.issue === "string" ? new InvalidValue({
    message: entry.issue
  }, input, options) : entry.issue;
  return new Pointer(entry.path, inner);
}
function makeSingle(out, input, options) {
  if (out === undefined) {
    return;
  }
  if (typeof out === "boolean") {
    return out ? undefined : new InvalidValue(undefined, input, options);
  }
  return makeFilterIssue(out, input, options);
}
function normalizeFilterOutput(ast, out, input, options) {
  if (Array.isArray(out)) {
    if (!isReadonlyArrayNonEmpty(out)) {
      return;
    }
    return out.length === 1 ? makeFilterIssue(out[0], input, options) : new Composite(ast, map(out, (entry) => makeFilterIssue(entry, input, options)), input, options);
  }
  return makeSingle(out, input, options);
}
var defaultLeafHook = (issue) => {
  const message = findMessage(issue);
  if (message !== undefined)
    return message;
  switch (issue._tag) {
    case "InvalidType":
      return getExpectedMessage(getExpected(issue.ast), issue);
    case "InvalidValue": {
      const expected = findExpected(issue);
      if (expected !== undefined)
        return getExpectedMessage(expected, issue);
      const input = formatInput(issue);
      return input === undefined ? "Expected a valid value" : `Invalid data ${input}`;
    }
    case "MissingKey":
      return "Missing key";
    case "UnexpectedKey": {
      const input = formatInput(issue);
      return input === undefined ? "Expected no excess property" : `Unexpected key with value ${input}`;
    }
    case "Forbidden":
      return "Forbidden operation";
    case "OneOf": {
      const input = formatInput(issue);
      return input === undefined ? "Expected exactly one member to match" : `Expected exactly one member to match the input ${input}`;
    }
  }
};
var defaultCheckHook = (issue) => findMessage(issue.issue) ?? findMessage(issue);
function formatInput(issue) {
  return hasInput(issue) ? format(issue.input) : undefined;
}
function findExpected(issue) {
  const expected = issue.annotations?.expected;
  return typeof expected === "string" ? expected : undefined;
}
function getExpectedMessage(expected, issue) {
  const input = formatInput(issue);
  return input === undefined ? `Expected ${expected}` : `Expected ${expected}, got ${input}`;
}
function formatCheck(check) {
  const expected = check.annotations?.expected;
  if (typeof expected === "string")
    return expected;
  switch (check._tag) {
    case "Filter":
      return "<filter>";
    case "FilterGroup":
      return check.checks.map((check) => formatCheck(check)).join(" & ");
  }
}
function makeFormatterDefault() {
  return (issue) => formatIssue(issue, "");
}
var defaultFormatter = /* @__PURE__ */ makeFormatterDefault();
function formatIssue(issue, path) {
  let message;
  switch (issue._tag) {
    case "Filter": {
      const annotated = defaultCheckHook(issue);
      if (annotated !== undefined) {
        message = annotated;
      } else {
        if (issue.issue._tag !== "InvalidValue") {
          return formatIssue(issue.issue, path);
        }
        const expected = findExpected(issue.issue);
        message = expected === undefined ? getExpectedMessage(formatCheck(issue.filter), issue) : getExpectedMessage(expected, issue.issue);
      }
      break;
    }
    case "Encoding":
      return formatIssue(issue.issue, path);
    case "Pointer":
      return formatIssue(issue.issue, path + formatPath(issue.path));
    case "Composite":
    case "AnyOf": {
      if (issue._tag === "Composite" || issue.issues.length > 0) {
        return issue.issues.map((issue) => formatIssue(issue, path)).join(`
`);
      }
      message = findMessage(issue) ?? getExpectedMessage(getExpected(issue.ast), issue);
      break;
    }
    default:
      message = defaultLeafHook(issue);
      break;
  }
  return path ? `${message}
  at ${path}` : message;
}
function findMessage(issue) {
  if (issue._tag === "Pointer")
    return;
  if (issue._tag === "Encoding")
    return findMessage(issue.issue);
  const annotations = issue._tag === "Filter" ? issue.filter.annotations : ("annotations" in issue) ? issue.annotations : issue.ast.annotations;
  const message = annotations?.[issue._tag === "MissingKey" ? "messageMissingKey" : issue._tag === "UnexpectedKey" ? "messageUnexpectedKey" : "message"];
  if (typeof message === "string")
    return message;
}

// ../node_modules/effect/dist/internal/schema/cause.js
function getSchemaIssue(cause) {
  let issue;
  for (const reason of cause.reasons) {
    if (!isFailReason2(reason) || !isIssue(reason.error)) {
      return;
    }
    issue ??= reason.error;
  }
  return issue;
}
function getSchemaIssueOrThrow(cause, message) {
  const issue = getSchemaIssue(cause);
  if (issue === undefined) {
    throw new Error(message, {
      cause
    });
  }
  return issue;
}

// ../node_modules/effect/dist/SchemaGetter.js
var makeGetter = (fields) => Object.assign(Object.create(Prototype), fields);
var passthrough_ = /* @__PURE__ */ makeGetter({
  _tag: "Passthrough"
});
function passthrough() {
  return passthrough_;
}
function transform(f) {
  return makeGetter({
    _tag: "Transform",
    transform: f
  });
}
function transformEffect(f) {
  return makeGetter({
    _tag: "TransformEffect",
    transform: f
  });
}
function String2() {
  return transform(globalThis.String);
}
function Number3() {
  return transform(globalThis.Number);
}
function parseJson(options) {
  return transformEffect((input, parseOptions) => try_2({
    try: () => JSON.parse(input, options?.reviver),
    catch: () => new InvalidValue({
      expected: "a valid JSON string"
    }, input, parseOptions)
  }));
}
function stringifyJson(options) {
  return transformEffect((input, parseOptions) => try_2({
    try: () => {
      const output = JSON.stringify(input, options?.replacer, options?.space);
      if (output === undefined) {
        throw new TypeError("Value cannot be represented as JSON");
      }
      return output;
    },
    catch: () => new InvalidValue({
      expected: "a JSON-serializable value"
    }, input, parseOptions)
  }));
}
function encodeBase64() {
  return transform(encode);
}
function decodeBase64() {
  return transformEffect((input, options) => mapErrorEager2(fromResult2(decode(input)), () => new InvalidValue({
    expected: "a valid Base64 string"
  }, input, options)));
}

// ../node_modules/effect/dist/SchemaTransformation.js
var TypeId7 = "~effect/SchemaTransformation/Transformation";
var Transformation = class extends Class {
  [TypeId7] = TypeId7;
  _tag = "Transformation";
  decode;
  encode;
  constructor(decode, encode) {
    super();
    this.decode = decode;
    this.encode = encode;
  }
  flip() {
    return new Transformation(this.encode, this.decode);
  }
};
function isTransformation(u) {
  return hasProperty(u, TypeId7) && u[TypeId7] === TypeId7;
}
var makeTransformation = (options) => {
  if (isTransformation(options)) {
    return options;
  }
  return new Transformation(options.decode, options.encode);
};
function transformEffect2(options) {
  return new Transformation(transformEffect(options.decode), transformEffect(options.encode));
}
function transform2(options) {
  return new Transformation(transform(options.decode), transform(options.encode));
}
var passthrough_2 = /* @__PURE__ */ new Transformation(/* @__PURE__ */ passthrough(), /* @__PURE__ */ passthrough());
function passthrough2() {
  return passthrough_2;
}
var numberFromString = /* @__PURE__ */ new Transformation(/* @__PURE__ */ Number3(), /* @__PURE__ */ String2());
var isJsonError = (input) => isObject(input) && typeof input["message"] === "string";
var decodeJsonError = (input) => {
  const hasCause = Object.hasOwn(input, "cause");
  const err = hasCause ? new Error(input.message, {
    cause: decodeDefect(input.cause)
  }) : new Error(input.message);
  if (typeof input.name === "string" && input.name !== "Error")
    err.name = input.name;
  if (typeof input.stack === "string")
    err.stack = input.stack;
  return err;
};
var encodeUnknownAsJson = (input) => {
  try {
    const json = formatJson(input);
    return json === undefined ? format(input) : JSON.parse(json);
  } catch {
    return format(input);
  }
};
var encodeJsonError = (input, options, encodeDefect) => {
  const encoded = {
    name: input.name,
    message: typeof input.message === "string" ? input.message : ""
  };
  if (options?.includeStack && typeof input.stack === "string") {
    encoded.stack = input.stack;
  }
  if (!options?.excludeCause && input.cause !== undefined) {
    encoded.cause = encodeDefect(input.cause);
  }
  return encoded;
};
var makeEncodeDefect = (options) => {
  const seen = new WeakSet;
  const encode = (input) => {
    if (isError(input)) {
      if (seen.has(input)) {
        return "[Circular]";
      }
      seen.add(input);
      const encoded = encodeJsonError(input, options, encode);
      seen.delete(input);
      return encoded;
    }
    return encodeUnknownAsJson(input);
  };
  return encode;
};
var decodeDefect = (input) => isJsonError(input) ? decodeJsonError(input) : input;
var defectFromJson = (options) => transform2({
  decode: decodeDefect,
  encode: makeEncodeDefect(options)
});
var urlFromString = /* @__PURE__ */ transformEffect2({
  decode: (s, options) => URL.canParse(s) ? succeed5(new URL(s)) : fail5(new InvalidValue({
    expected: "a valid URL string"
  }, s, options)),
  encode: (url) => succeed5(url.href)
});
var uint8ArrayFromBase64String = /* @__PURE__ */ new Transformation(/* @__PURE__ */ decodeBase64(), /* @__PURE__ */ encodeBase64());
function fromJsonString(options) {
  return new Transformation(parseJson(options ?? {}), stringifyJson(options));
}

// ../node_modules/effect/dist/SchemaAST.js
function makeGuard(tag) {
  return (ast) => ast._tag === tag;
}
var isDeclaration = /* @__PURE__ */ makeGuard("Declaration");
var isNever2 = /* @__PURE__ */ makeGuard("Never");
var isLiteral = /* @__PURE__ */ makeGuard("Literal");
var isUniqueSymbol = /* @__PURE__ */ makeGuard("UniqueSymbol");
var isArrays = /* @__PURE__ */ makeGuard("Arrays");
var isObjects = /* @__PURE__ */ makeGuard("Objects");
var isSuspend = /* @__PURE__ */ makeGuard("Suspend");
var Link = class {
  to;
  transformation;
  constructor(to, transformation) {
    this.to = to;
    this.transformation = transformation;
  }
};
var defaultParseOptions = {};
var Context = class {
  isOptional;
  isMutable;
  constructorDefault;
  annotations;
  constructor(isOptional, isMutable, constructorDefault = undefined, annotations = undefined) {
    this.isOptional = isOptional;
    this.isMutable = isMutable;
    this.constructorDefault = constructorDefault;
    this.annotations = annotations;
  }
};
var TypeId8 = "~effect/Schema";

class ASTNodeImpl {
  [TypeId8] = TypeId8;
  annotations;
  checks;
  encoding;
  context;
  constructor(annotations = undefined, checks = undefined, encoding = undefined, context = undefined) {
    this.annotations = annotations;
    this.checks = checks;
    this.encoding = encoding;
    this.context = context;
  }
  toString() {
    return `<${this._tag}>`;
  }
}
var Declaration = class extends ASTNodeImpl {
  _tag = "Declaration";
  typeParameters;
  run;
  encodingChecks;
  encodingRun;
  constructor(typeParameters, run, annotations, checks, encoding, context, encodingChecks, encodingRun) {
    super(annotations, checks, encoding, context);
    this.typeParameters = typeParameters;
    this.run = run;
    this.encodingChecks = encodingChecks;
    this.encodingRun = encodingRun;
  }
  getParser() {
    let run;
    return (input, options) => {
      if (input === missing)
        return missingExit;
      return (run ??= this.run(this.typeParameters))(input, this, options);
    };
  }
  _rebuild(recur, checks, encodingChecks, run, encodingRun) {
    const tps = mapOrSame(this.typeParameters, recur);
    return tps === this.typeParameters && checks === this.checks && encodingChecks === this.encodingChecks && run === this.run && encodingRun === this.encodingRun ? this : new Declaration(tps, run, this.annotations, checks, undefined, this.context, encodingChecks, encodingRun);
  }
  recur(recur) {
    return this._rebuild(recur, this.checks, this.encodingChecks, this.run, this.encodingRun);
  }
  flip(recur) {
    return this._rebuild(recur, this.encodingChecks, this.checks, this.encodingRun ?? this.run, this.run);
  }
  getExpected() {
    const expected = this.annotations?.expected;
    if (typeof expected === "string")
      return expected;
    return "<Declaration>";
  }
};
var Null = class extends ASTNodeImpl {
  _tag = "Null";
  getParser() {
    return fromConst(this, null);
  }
  getExpected() {
    return "null";
  }
};
var null_ = /* @__PURE__ */ new Null;
var Unknown = class extends ASTNodeImpl {
  _tag = "Unknown";
  getParser() {
    return fromRefinement(this, isUnknown);
  }
  getExpected() {
    return "unknown";
  }
};
var unknown = /* @__PURE__ */ new Unknown;
var Literal = class extends ASTNodeImpl {
  _tag = "Literal";
  literal;
  constructor(literal, annotations, checks, encoding, context) {
    super(annotations, checks, encoding, context);
    if (typeof literal === "number" && !globalThis.Number.isFinite(literal)) {
      throw new Error(`A numeric literal must be finite, got ${format(literal)}`);
    }
    this.literal = literal;
  }
  getParser() {
    return fromConst(this, this.literal);
  }
  matchPart(s, _options) {
    return s === globalThis.String(this.literal) ? this.literal : undefined;
  }
  toCodecJson() {
    return typeof this.literal === "bigint" ? literalToString(this) : this;
  }
  toCodecStringTree() {
    return typeof this.literal === "string" ? this : literalToString(this);
  }
  getExpected() {
    return typeof this.literal === "string" ? JSON.stringify(this.literal) : globalThis.String(this.literal);
  }
};
function literalToString(ast) {
  const literalAsString = globalThis.String(ast.literal);
  return replaceEncoding(ast, [new Link(new Literal(literalAsString), new Transformation(transform(() => ast.literal), transform(() => literalAsString)))]);
}
var String3 = class extends ASTNodeImpl {
  _tag = "String";
  getParser() {
    return fromRefinement(this, isString);
  }
  matchPart(s, options) {
    const checks = this.checks;
    return checks && !options.disableChecks && collectIssues(checks, s, undefined, this, options) ? undefined : s;
  }
  getExpected() {
    return "string";
  }
};
var string2 = /* @__PURE__ */ new String3;
var Number4 = class extends ASTNodeImpl {
  _tag = "Number";
  getParser() {
    return fromRefinement(this, isNumber);
  }
  matchKey(s, options) {
    return this._match(isStringNumberRegExp, s, options);
  }
  matchPart(s, options) {
    return this._match(isStringFiniteRegExp, s, options);
  }
  _match(regexp, s, options) {
    if (!regexp.test(s))
      return;
    const value = globalThis.Number(s);
    if (options.disableChecks || !this.checks)
      return value;
    return collectIssues(this.checks, value, undefined, this, options) ? undefined : value;
  }
  toCodecJson() {
    if (this.checks && (hasCheck(this.checks, "effect/schema/isFinite") || hasCheck(this.checks, "effect/schema/isInt"))) {
      return this;
    }
    return replaceEncoding(this, [numberToJson]);
  }
  toCodecStringTree() {
    if (this.toCodecJson() === this) {
      return replaceEncoding(this, [finiteToString]);
    }
    return replaceEncoding(this, [numberToString]);
  }
  getExpected() {
    return "number";
  }
};
function hasCheck(checks, id) {
  return checks.some((check) => check.annotations?.representation?.id === id || check._tag === "FilterGroup" && hasCheck(check.checks, id));
}
var number2 = /* @__PURE__ */ new Number4;
var Boolean2 = class extends ASTNodeImpl {
  _tag = "Boolean";
  getParser() {
    return fromRefinement(this, isBoolean);
  }
  getExpected() {
    return "boolean";
  }
};
var boolean = /* @__PURE__ */ new Boolean2;
var Arrays = class extends ASTNodeImpl {
  _tag = "Arrays";
  isMutable;
  elements;
  rest;
  encodingChecks;
  constructor(isMutable, elements, rest, annotations, checks, encoding, context, encodingChecks) {
    super(annotations, checks, encoding, context);
    this.isMutable = isMutable;
    this.elements = elements;
    this.rest = rest;
    this.encodingChecks = encodingChecks;
    let hasOptional = false;
    for (let i = 0;i < elements.length; i++) {
      if (isOptional(elements[i])) {
        hasOptional = true;
      } else if (hasOptional) {
        throw new Error("A required element cannot follow an optional element. ts(1257)");
      }
    }
    if (hasOptional && rest.length > 1) {
      throw new Error("A required element cannot follow an optional element. ts(1257)");
    }
    for (let i = 1;i < rest.length; i++) {
      if (isOptional(rest[i])) {
        throw new Error("An optional element cannot follow a rest element. ts(1266)");
      }
    }
  }
  getParser(compile, compileField = compile) {
    const ast = this;
    let elements;
    let rest;
    const elementLen = ast.elements.length;
    const tailLen = Math.max(0, ast.rest.length - 1);
    function getParser(tailThreshold, index) {
      if (index < elementLen) {
        return elements[index];
      } else if (index >= tailThreshold) {
        return rest[index - tailThreshold + 1];
      }
      return rest[0];
    }
    const finish = (state) => {
      const {
        input,
        len,
        options
      } = state;
      if (ast.rest.length === 0 && len > elementLen) {
        for (let i = elementLen;i < len; i++) {
          const unexpected = new UnexpectedKey(ast, input[i], options);
          const issue = new Pointer([i], unexpected);
          if (options.errors === "all") {
            if (state.issues)
              state.issues.push(issue);
            else
              state.issues = [issue];
          } else {
            return fail5(new Composite(ast, [issue], input, options));
          }
        }
      }
      if (state.issues) {
        return fail5(new Composite(ast, state.issues, input, options));
      }
      return succeed6(state.output);
    };
    const parse = (input, options) => {
      const len = input.length;
      const state = {
        ast,
        getParser,
        input,
        len,
        tailThreshold: Math.max(elementLen, len - tailLen),
        output: new globalThis.Array(len),
        issues: undefined,
        options
      };
      const end = ast.rest.length === 0 ? elementLen : Math.max(len, elementLen + tailLen);
      const concurrency = options.concurrency === undefined ? 1 : resolveConcurrency(options.concurrency);
      const eff = concurrency === 1 ? parseArray(state, input, 0, end) : parseArrayConcurrent(state, input, {
        concurrency,
        end
      });
      if (!eff)
        return finish(state);
      if (effectIsExit(eff))
        return flatMapEager2(eff, () => finish(state));
      let first = true;
      return suspend2(() => {
        if (!first)
          return parse(input, options);
        first = false;
        return flatMap2(eff, () => finish(state));
      });
    };
    return (input, options) => {
      if (input === missing)
        return missingExit;
      try {
        if (!Array.isArray(input)) {
          return fail5(new InvalidType(ast, input, options));
        }
        if (!elements) {
          elements = ast.elements.map((ast) => ({
            ast,
            parser: compileField(ast)
          }));
          rest = ast.rest.map((ast) => ({
            ast,
            parser: compileField(ast)
          }));
        }
        return parse(input, options);
      } catch (error) {
        return die3(error);
      }
    };
  }
  _rebuild(recur, checks, encodingChecks) {
    const elements = mapOrSame(this.elements, recur);
    const rest = mapOrSame(this.rest, recur);
    return elements === this.elements && rest === this.rest && checks === this.checks && encodingChecks === this.encodingChecks ? this : new Arrays(this.isMutable, elements, rest, this.annotations, checks, undefined, this.context, encodingChecks);
  }
  recur(recur) {
    return this._rebuild(recur, this.checks, this.encodingChecks);
  }
  flip(recur) {
    return this._rebuild(recur, this.encodingChecks, this.checks);
  }
  getExpected() {
    return "array";
  }
};
function stepArray(s, item, exit, i) {
  if (exit._tag === "Failure") {
    return wrapPropertyKeyIssue(s, s.ast, i, exit);
  }
  const value = exit === sameExit ? item : exit[args];
  if (value !== missing) {
    s.output[i] = value;
  } else {
    const p = s.getParser(s.tailThreshold, i);
    if (isOptional(p.ast))
      return;
    const issue = new Pointer([i], new MissingKey(p.ast.context?.annotations));
    if (s.options.errors === "all") {
      if (s.issues)
        s.issues.push(issue);
      else
        s.issues = [issue];
    } else {
      return fail4(new Composite(s.ast, [issue], s.input, s.options));
    }
  }
}
var parseArrayOptions = {
  onItem(s, item, i) {
    const value = i < s.len ? item : missing;
    return s.getParser(s.tailThreshold, i).parser(value, s.options);
  },
  step: stepArray
};
var parseArray = /* @__PURE__ */ iterateEager()(parseArrayOptions);
var parseArrayConcurrent = /* @__PURE__ */ iterateConcurrent()(parseArrayOptions);
var wrapPropertyKeyIssue = (s, ast, key, exit) => {
  if (exit.cause.reasons.length === 0) {
    return exit;
  }
  const issue = getSchemaIssue(exit.cause);
  if (issue === undefined) {
    return failCause2(map3(exit.cause, (issue) => new Composite(ast, [new Pointer([key], issue)], s.input, s.options)));
  }
  const pointer = new Pointer([key], issue);
  if (s.options.errors === "all") {
    if (s.issues)
      s.issues.push(pointer);
    else
      s.issues = [pointer];
  } else {
    return fail4(new Composite(ast, [pointer], s.input, s.options));
  }
};
var FINITE_PATTERN = "[+-]?\\d*\\.?\\d+(?:[Ee][+-]?\\d+)?";
function getIndexSignatureKeys(input, parameter, options = defaultParseOptions) {
  let stringKeys;
  let symbolKeys;
  function go(parameter) {
    switch (parameter._tag) {
      case "String":
      case "TemplateLiteral":
        return (stringKeys ??= Object.keys(input)).filter((k) => parameter.matchPart(k, options) !== undefined);
      case "Number":
        return (stringKeys ??= Object.keys(input)).filter((k) => parameter.matchKey(k, options) !== undefined);
      case "Symbol":
        return (symbolKeys ??= Object.getOwnPropertySymbols(input)).filter((k) => Object.prototype.propertyIsEnumerable.call(input, k) && parameter.matchKey(k, options) !== undefined);
      case "Union":
        return [...new Set(parameter.types.flatMap(go))];
      default:
        return [];
    }
  }
  return go(parameterFromPropertyKey(toEncoded(parameter)));
}
var PropertySignature = class {
  name;
  type;
  constructor(name, type) {
    this.name = name;
    this.type = type;
  }
};
function isIndexSignatureParameterSide(ast) {
  switch (ast._tag) {
    case "String":
    case "Number":
    case "Symbol":
    case "TemplateLiteral":
      return true;
    case "Union":
      return ast.types.every(isIndexSignatureParameterSide);
    default:
      return false;
  }
}
function isIndexSignatureParameterEncodedSide(ast) {
  const encoded = getLastEncoding(ast);
  switch (encoded._tag) {
    case "String":
    case "Number":
    case "Symbol":
    case "TemplateLiteral":
      return true;
    case "Union":
      return encoded.types.every(isIndexSignatureParameterEncodedSide);
    default:
      return false;
  }
}
function isIndexSignatureParameter(ast) {
  return isIndexSignatureParameterSide(ast) && isIndexSignatureParameterEncodedSide(ast);
}
var IndexSignature = class {
  parameter;
  type;
  constructor(parameter, type) {
    if (!isIndexSignatureParameter(parameter)) {
      throw new Error(`Invalid index signature parameter ${parameter._tag}`);
    }
    this.parameter = parameter;
    this.type = type;
    if (isOptional(type) && !containsUndefined(type)) {
      throw new Error("Cannot use `Schema.optionalKey` with index signatures, use `Schema.optional` instead.");
    }
  }
};
var Objects = class extends ASTNodeImpl {
  _tag = "Objects";
  propertySignatures;
  indexSignatures;
  encodingChecks;
  constructor(propertySignatures, indexSignatures, annotations, checks, encoding, context, encodingChecks) {
    super(annotations, checks, encoding, context);
    this.propertySignatures = propertySignatures;
    this.indexSignatures = indexSignatures;
    this.encodingChecks = encodingChecks;
  }
  getParser(compile, compileField = compile) {
    const ast = this;
    const hasProperties = ast.propertySignatures.length;
    const indexCount = ast.indexSignatures.length;
    if (!hasProperties && !indexCount) {
      return fromRefinement(ast, isNotNullish);
    }
    let properties;
    let indexes;
    const compileMembers = () => {
      if (!properties) {
        properties = ast.propertySignatures.map((ps) => ({
          parser: compileField(ps.type),
          name: ps.name,
          type: ps.type
        }));
        indexes = indexCount ? ast.indexSignatures.map((is) => ({
          is,
          parserKey: compile(parameterFromPropertyKey(is.parameter)),
          parserValue: compileField(is.type)
        })) : undefined;
      }
      return properties;
    };
    const makeFallback = () => {
      const expectedKeys = new Set(ast.propertySignatures.map((ps) => typeof ps.name === "number" ? globalThis.String(ps.name) : ps.name));
      const finishIndex = (s, key, k2, inputValue, exitValue) => {
        if (exitValue._tag === "Failure") {
          return wrapPropertyKeyIssue(s, ast, key, exitValue) ?? void_2;
        }
        const value = exitValue === sameExit ? inputValue : exitValue[args];
        if (k2 !== missing && value !== missing) {
          if (hasProperties && (expectedKeys.has(key) || expectedKeys.has(typeof k2 === "number" ? globalThis.String(k2) : k2)))
            return void_2;
          assignProperty(s.out, k2, value);
        }
        return void_2;
      };
      const parseIndex = (s, key, index, exitKey) => {
        if (!exitKey) {
          const eff = index.parserKey(key, s.options);
          if (!effectIsExit(eff)) {
            return flatMap2(exit2(eff), (exit) => parseIndex(s, key, index, exit));
          }
          exitKey = eff;
        }
        if (exitKey._tag === "Failure") {
          return wrapPropertyKeyIssue(s, ast, key, exitKey) ?? void_2;
        }
        const k2 = exitKey === sameExit ? key : exitKey[args];
        const inputValue = s.input[key];
        const result = index.parserValue(inputValue, s.options);
        return effectIsExit(result) ? finishIndex(s, key, k2, inputValue, result) : flatMap2(exit2(result), (exit) => finishIndex(s, key, k2, inputValue, exit));
      };
      const parseStringIndex = (s, key, index) => {
        const inputValue = s.input[key];
        const result = index.parserValue(inputValue, s.options);
        return effectIsExit(result) ? finishIndex(s, key, key, inputValue, result) : flatMap2(exit2(result), (exit) => finishIndex(s, key, key, inputValue, exit));
      };
      const parseIndexes = indexCount ? iterateConcurrent()({
        onItem: (s, [key, index]) => index.is.parameter === string2 ? parseStringIndex(s, key, index) : parseIndex(s, key, index),
        step: (_s, _item, exit) => exit._tag === "Failure" ? exit : undefined
      }) : undefined;
      return fnUntracedEager2(function* (input, options) {
        if (input === missing) {
          return missing;
        }
        if (!(typeof input === "object" && input !== null && !Array.isArray(input))) {
          return yield* fail5(new InvalidType(ast, input, options));
        }
        compileMembers();
        const record = input;
        const out = {};
        const state = {
          ast,
          input: record,
          out,
          issues: undefined,
          options
        };
        const errorsAllOption = options.errors === "all";
        const onExcessPropertyError = options.onExcessProperty === "error";
        const concurrency = options.concurrency === undefined ? 1 : resolveConcurrency(options.concurrency);
        const indexKeys = indexCount && onExcessPropertyError ? ast.indexSignatures.map((index) => getIndexSignatureKeys(record, index.parameter, options)) : undefined;
        if (onExcessPropertyError) {
          const coveredKeys = indexKeys ? new Set(expectedKeys) : expectedKeys;
          if (indexKeys) {
            for (const keys of indexKeys) {
              for (const key of keys)
                coveredKeys.add(key);
            }
          }
          const inputKeys = Reflect.ownKeys(record);
          for (let i = 0;i < inputKeys.length; i++) {
            const key = inputKeys[i];
            if (!coveredKeys.has(key) && Object.prototype.propertyIsEnumerable.call(record, key)) {
              const unexpected = new UnexpectedKey(ast, record[key], options);
              const issue = new Pointer([key], unexpected);
              if (errorsAllOption) {
                if (state.issues) {
                  state.issues.push(issue);
                } else {
                  state.issues = [issue];
                }
                continue;
              } else {
                return yield* fail5(new Composite(ast, [issue], input, options));
              }
            }
          }
        }
        if (hasProperties) {
          const eff = concurrency === 1 ? parseProperties(state, properties) : parsePropertiesConcurrent(state, properties, {
            concurrency
          });
          if (eff)
            yield* eff;
        }
        if (indexCount && concurrency === 1) {
          for (let i = 0;i < indexCount; i++) {
            const index = indexes[i];
            const parse = index.is.parameter === string2 ? parseStringIndex : parseIndex;
            const keys = indexKeys?.[i] ?? (index.is.parameter === string2 ? Object.keys(record) : getIndexSignatureKeys(record, index.is.parameter, options));
            for (let j = 0;j < keys.length; j++) {
              const eff = parse(state, keys[j], index);
              if (!effectIsExit(eff))
                yield* eff;
              else if (eff._tag === "Failure")
                return yield* eff;
            }
          }
        } else if (parseIndexes) {
          const keyPairs = empty2();
          for (let i = 0;i < indexCount; i++) {
            const index = indexes[i];
            const keys = indexKeys?.[i] ?? (index.is.parameter === string2 ? Object.keys(record) : getIndexSignatureKeys(record, index.is.parameter, options));
            for (let j = 0;j < keys.length; j++) {
              keyPairs.push([keys[j], index]);
            }
          }
          const eff = parseIndexes(state, keyPairs, {
            concurrency
          });
          if (eff)
            yield* eff;
        }
        if (state.issues) {
          return yield* fail5(new Composite(ast, state.issues, input, options));
        }
        return out;
      });
    };
    if (indexCount)
      return makeFallback();
    let fallback;
    const resume = (state, index, pending) => {
      const property = properties[index];
      return flatMap2(exit2(pending), (exit) => {
        const terminal = stepProperty(state, property, exit);
        if (terminal)
          return terminal;
        const done = () => succeed6(state.out);
        const eff = parseProperties(state, properties.slice(index + 1));
        return eff ? flatMapEager2(eff, done) : done();
      });
    };
    return (input, options) => {
      if (input === missing)
        return missingExit;
      if (options.errors === "all" || options.onExcessProperty !== undefined || options.concurrency !== undefined && resolveConcurrency(options.concurrency) !== 1) {
        return (fallback ??= makeFallback())(input, options);
      }
      if (!(typeof input === "object" && input !== null && !Array.isArray(input))) {
        return fail5(new InvalidType(ast, input, options));
      }
      const props = compileMembers();
      const record = input;
      const out = {};
      const state = {
        ast,
        input: record,
        out,
        issues: undefined,
        options
      };
      try {
        for (let index = 0;index < props.length; index++) {
          const property = props[index];
          const name = property.name;
          const hasKey = hasPropertySignature(record, name);
          const value = hasKey ? record[name] : missing;
          const exit = property.parser(value, options);
          if (!effectIsExit(exit)) {
            return resume(state, index, exit);
          }
          if (exit === sameExit) {
            if (hasKey)
              assignProperty(out, name, value);
            continue;
          }
          const terminal = stepProperty(state, property, exit);
          if (terminal)
            return terminal;
        }
      } catch (error) {
        return die3(error);
      }
      return succeed6(out);
    };
  }
  _rebuild(recur, recurParameter, checks, encodingChecks) {
    const props = mapOrSame(this.propertySignatures, (ps) => {
      const t = recur(ps.type);
      return t === ps.type ? ps : new PropertySignature(ps.name, t);
    });
    const indexes = mapOrSame(this.indexSignatures, (is) => {
      const p = recurParameter(is.parameter);
      const t = recur(is.type);
      return p === is.parameter && t === is.type ? is : new IndexSignature(p, t);
    });
    return props === this.propertySignatures && indexes === this.indexSignatures && checks === this.checks && encodingChecks === this.encodingChecks ? this : new Objects(props, indexes, this.annotations, checks, undefined, this.context, encodingChecks);
  }
  flip(recur) {
    return this._rebuild(recur, recur, this.encodingChecks, this.checks);
  }
  recur(recur, recurParameter = recur) {
    return this._rebuild(recur, recurParameter, this.checks, this.encodingChecks);
  }
  getExpected() {
    if (this.propertySignatures.length === 0 && this.indexSignatures.length === 0)
      return "object | array";
    return "object";
  }
};
function stepProperty(s, p, exit) {
  if (exit._tag === "Failure") {
    return wrapPropertyKeyIssue(s, s.ast, p.name, exit);
  }
  if (exit === sameExit)
    return;
  const value = exit[args];
  if (value !== missing) {
    assignProperty(s.out, p.name, value);
    return;
  }
  delete s.out[p.name];
  if (!isOptional(p.type)) {
    const issue = new Pointer([p.name], new MissingKey(p.type.context?.annotations));
    if (s.options.errors === "all") {
      if (s.issues)
        s.issues.push(issue);
      else
        s.issues = [issue];
      return;
    } else {
      return fail4(new Composite(s.ast, [issue], s.input, s.options));
    }
  }
}
var parsePropertiesOptions = {
  onItem(s, p) {
    if (!hasPropertySignature(s.input, p.name)) {
      return p.parser(missing, s.options);
    }
    const value = s.input[p.name];
    assignProperty(s.out, p.name, value);
    return p.parser(value, s.options);
  },
  step: stepProperty
};
var parseProperties = /* @__PURE__ */ iterateEager()(parsePropertiesOptions);
var parsePropertiesConcurrent = /* @__PURE__ */ iterateConcurrent()(parsePropertiesOptions);
function combineChecks(a, b) {
  if (!a)
    return b;
  if (!b)
    return a;
  return [...a, ...b];
}
function struct(fields, checks, annotations) {
  return new Objects(Reflect.ownKeys(fields).map((key) => {
    return new PropertySignature(key, fields[key].ast);
  }), [], annotations, checks);
}
function getAST(self) {
  return self.ast;
}
function tuple(elements, checks = undefined) {
  return new Arrays(false, elements.map((e) => e.ast), [], undefined, checks);
}
function union(members, options, checks) {
  return new Union(members.map(getAST), options, undefined, checks);
}
var toCandidate = /* @__PURE__ */ memoizeIdempotent((ast) => {
  while (true) {
    if (isSuspend(ast))
      return unknown;
    const encoding = ast.encoding;
    if (!encoding) {
      return ast.recur?.(toCandidate, identity) ?? ast;
    }
    if (encoding.some((link) => link.transformation._tag === "Middleware" && link.transformation.decode !== identity))
      return unknown;
    ast = encoding[encoding.length - 1].to;
  }
});
function getCandidateTypes(ast) {
  switch (ast._tag) {
    case "Null":
      return ["null"];
    case "Undefined":
      return ["undefined"];
    case "String":
    case "TemplateLiteral":
      return ["string"];
    case "Number":
      return ["number"];
    case "Boolean":
      return ["boolean"];
    case "Symbol":
    case "UniqueSymbol":
      return ["symbol"];
    case "BigInt":
      return ["bigint"];
    case "Arrays":
      return ["array"];
    case "ObjectKeyword":
      return ["object", "array", "function"];
    case "Objects":
      return ast.propertySignatures.length || ast.indexSignatures.length ? ["object"] : ["string", "number", "boolean", "symbol", "bigint", "object", "array", "function"];
    case "Enum":
      return Array.from(new Set(ast.enums.map(([, v]) => typeof v)));
    case "Literal":
      return [typeof ast.literal];
    case "Union":
      return Array.from(new Set(ast.types.flatMap(getCandidateTypes)));
    default:
      return ["null", "undefined", "string", "number", "boolean", "symbol", "bigint", "object", "array", "function"];
  }
}
function collectSentinels(ast) {
  switch (ast._tag) {
    default:
      return [];
    case "Declaration": {
      const s = ast.annotations?.[SENTINELS_ANNOTATION_KEY];
      return Array.isArray(s) ? s : [];
    }
    case "Objects":
      return ast.propertySignatures.flatMap((ps) => {
        const type = ps.type;
        if (!isOptional(type)) {
          if (isLiteral(type)) {
            return [{
              key: ps.name,
              literal: type.literal
            }];
          }
          if (isUniqueSymbol(type)) {
            return [{
              key: ps.name,
              literal: type.symbol
            }];
          }
        }
        return [];
      });
    case "Arrays":
      return ast.elements.flatMap((e, i) => {
        if (!isOptional(e)) {
          if (isLiteral(e)) {
            return [{
              key: i,
              literal: e.literal
            }];
          }
          if (isUniqueSymbol(e)) {
            return [{
              key: i,
              literal: e.symbol
            }];
          }
        }
        return [];
      });
    case "Union": {
      if (ast.types.length === 0)
        return [];
      const members = ast.types.map((type) => collectSentinels(toCandidate(type)));
      return members[0].filter((s) => members.every((sentinels) => sentinels.some((o) => o.key === s.key && o.literal === s.literal)));
    }
    case "Suspend":
      return collectSentinels(ast.thunk());
  }
}
var candidateIndexCache = /* @__PURE__ */ new WeakMap;
var emptyCandidates = /* @__PURE__ */ Object.freeze([]);
var getRuntimeType = (input) => input === null ? "null" : Array.isArray(input) ? "array" : typeof input;
var hasPropertySignature = (input, key) => key === "__proto__" ? Object.hasOwn(input, key) : (key in input);
function getCandidateIndex(types) {
  let index = candidateIndexCache.get(types);
  if (index)
    return index;
  let bySentinel;
  let sentinelCandidateCount = 0;
  let otherwise;
  let literalCandidates;
  let onlyLiterals = true;
  const literalOf = [];
  for (let i = 0;i < types.length; i++) {
    const a = types[i];
    const encoded = toCandidate(a);
    if (isNever2(encoded))
      continue;
    if (isLiteral(encoded) || isUniqueSymbol(encoded)) {
      literalCandidates ??= new Map;
      const literal = isLiteral(encoded) ? encoded.literal : encoded.symbol;
      literalOf[i] = literal;
      let arr = literalCandidates.get(literal);
      if (!arr)
        literalCandidates.set(literal, arr = []);
      arr.push(i);
    } else {
      onlyLiterals = false;
    }
    const sentinels = collectSentinels(encoded);
    if (sentinels.length) {
      bySentinel ??= new Map;
      sentinelCandidateCount++;
      for (const {
        key,
        literal
      } of sentinels) {
        let entry = bySentinel.get(key);
        if (!entry)
          bySentinel.set(key, entry = [new Map, new Set]);
        entry[1].add(i);
        let indexes = entry[0].get(literal);
        if (!indexes)
          entry[0].set(literal, indexes = new Set);
        indexes.add(i);
      }
    } else {
      otherwise ??= {};
      const candidateTypes = getCandidateTypes(encoded);
      for (const t of candidateTypes)
        (otherwise[t] ??= []).push(i);
    }
  }
  const fallbacks = {};
  const getFallback = (type) => fallbacks[type] ??= Object.freeze(otherwise?.[type] ?? emptyCandidates);
  if (onlyLiterals && literalCandidates) {
    literalCandidates.forEach(Object.freeze);
    index = (input) => literalCandidates.get(input) ?? emptyCandidates;
  } else if (bySentinel?.size === 1 && !otherwise) {
    const [key, [byValue]] = bySentinel.entries().next().value;
    const candidates = new Map;
    for (const [literal, indexes] of byValue) {
      candidates.set(literal, Object.freeze(Array.from(indexes)));
    }
    const all = Object.freeze(types.map((_, i) => i));
    index = (input, isConstructor) => {
      if (isObjectKeyword(input)) {
        const value = hasPropertySignature(input, key) ? input[key] : undefined;
        if (value !== undefined)
          return candidates.get(value) ?? emptyCandidates;
        if (isConstructor)
          return all;
      }
      return emptyCandidates;
    };
  } else if (bySentinel) {
    let commonSentinel;
    for (const entry of bySentinel) {
      if ((!commonSentinel || entry[1][0].size > commonSentinel[1][0].size) && entry[1][1].size === sentinelCandidateCount) {
        commonSentinel = entry;
      }
    }
    index = (input, isConstructor) => {
      const runtimeType = getRuntimeType(input);
      if (!isObjectKeyword(input))
        return getFallback(runtimeType);
      const selected = new Set(otherwise?.[runtimeType]);
      let directKey;
      if (commonSentinel) {
        const [key, [byValue]] = commonSentinel;
        const hasKey = hasPropertySignature(input, key);
        const value = hasKey ? input[key] : undefined;
        if (hasKey && (!isConstructor || value !== undefined)) {
          const match = byValue.get(value);
          if (!match)
            return getFallback(runtimeType);
          for (const i of match)
            selected.add(i);
          directKey = key;
        }
      }
      if (directKey === undefined) {
        for (const [key, [byValue, all]] of bySentinel) {
          const hasKey = hasPropertySignature(input, key);
          const value = hasKey ? input[key] : undefined;
          if (hasKey && (!isConstructor || value !== undefined)) {
            const match = byValue.get(value);
            if (match) {
              for (const i of match)
                selected.add(i);
            }
          } else if (isConstructor) {
            for (const i of all)
              selected.add(i);
          }
        }
      }
      for (const [key, [byValue, all]] of bySentinel) {
        if (key === directKey)
          continue;
        const hasKey = hasPropertySignature(input, key);
        const value = hasKey ? input[key] : undefined;
        if (hasKey && (!isConstructor || value !== undefined)) {
          const match = byValue.get(value);
          for (const i of selected) {
            if (all.has(i) && !match?.has(i))
              selected.delete(i);
          }
        }
      }
      return Array.from(selected).sort((a, b) => a - b);
    };
  } else {
    index = (input) => {
      const fallback = getFallback(getRuntimeType(input));
      return literalCandidates ? fallback.filter((i) => literalOf[i] === undefined || literalOf[i] === input) : fallback;
    };
  }
  candidateIndexCache.set(types, index);
  return index;
}
var Union = class extends ASTNodeImpl {
  _tag = "Union";
  types;
  options;
  encodingChecks;
  constructor(types, options, annotations, checks, encoding, context, encodingChecks) {
    super(annotations, checks, encoding, context);
    this.types = types;
    this.options = options;
    this.encodingChecks = encodingChecks;
  }
  getParser(compile, compileField) {
    const ast = this;
    const isConstructor = compileField !== undefined;
    const parsers = [];
    const parser = (i) => parsers[i] ??= compile(ast.types[i]);
    let index;
    return (input, options) => {
      if (input === missing) {
        return missingExit;
      }
      const candidates = (index ??= getCandidateIndex(ast.types))(input, isConstructor);
      if (candidates.length === 0) {
        return fail5(new AnyOf(ast, [], input, options));
      }
      if (candidates.length === 1) {
        const result = parser(candidates[0])(input, options);
        if (result._tag === "Success")
          return result;
        return effectIsExit(result) ? failSingleUnionCandidate(ast, result.cause, input, options) : catchSingleUnionCandidate(ast, result, input, options);
      }
      return parseUnionCandidates(ast, parser, candidates, input, options);
    };
  }
  _rebuild(recur, checks, encodingChecks) {
    const types = mapOrSame(this.types, recur);
    return types === this.types && checks === this.checks && encodingChecks === this.encodingChecks ? this : new Union(types, this.options, this.annotations, checks, undefined, this.context, encodingChecks);
  }
  recur(recur) {
    return this._rebuild(recur, this.checks, this.encodingChecks);
  }
  flip(recur) {
    return this._rebuild(recur, this.encodingChecks, this.checks);
  }
  matchPart(s, options) {
    for (const type of this.types) {
      const out = type.matchPart(s, options);
      if (out !== undefined)
        return out;
    }
    return;
  }
  getExpected(getExpected) {
    const expected = this.annotations?.expected;
    if (typeof expected === "string")
      return expected;
    if (this.types.length === 0)
      return "never";
    const types = this.types.map((type) => {
      const encoded = toEncoded(type);
      switch (encoded._tag) {
        case "Arrays": {
          const literals = encoded.elements.filter(isLiteral);
          if (literals.length > 0) {
            return `${formatIsMutable(encoded.isMutable)}[ ${literals.map((e) => getExpected(e) + formatIsOptional(e.context?.isOptional)).join(", ")}, ... ]`;
          }
          break;
        }
        case "Objects": {
          const literals = encoded.propertySignatures.filter((ps) => isLiteral(ps.type));
          if (literals.length > 0) {
            return `{ ${literals.map((ps) => `${formatIsMutable(ps.type.context?.isMutable)}${formatPropertyKey(ps.name)}${formatIsOptional(ps.type.context?.isOptional)}: ${getExpected(ps.type)}`).join(", ")}, ... }`;
          }
          break;
        }
      }
      return getExpected(encoded);
    });
    return Array.from(new Set(types)).join(" | ");
  }
};
function failSingleUnionCandidate(ast, cause, input, options) {
  const issue = getSchemaIssue(cause);
  if (!issue)
    return failCause2(cause);
  return fail4(new AnyOf(ast, [issue], input, options));
}
function catchSingleUnionCandidate(ast, result, input, options) {
  return catchCause2(result, (cause) => failSingleUnionCandidate(ast, cause, input, options));
}
function parseUnionCandidates(ast, parser, candidates, input, options) {
  const state = {
    ast,
    parser,
    input,
    out: undefined,
    successes: ast.options?.mode === "oneOf" ? [] : undefined,
    issues: undefined,
    options
  };
  const eff = parseUnion(state, candidates);
  if (!eff) {
    if (state.out)
      return state.out;
    return fail5(new AnyOf(ast, state.issues ?? [], input, options));
  }
  return resumeUnion(eff, state);
}
function resumeUnion(eff, state) {
  return flatMapEager2(eff, (_) => {
    if (state.out === sameExit)
      return succeed5(state.input);
    if (state.out)
      return state.out;
    return fail5(new AnyOf(state.ast, state.issues ?? [], state.input, state.options));
  });
}
var parseUnion = /* @__PURE__ */ iterateEager()({
  onItem(s, i) {
    return s.parser(i)(s.input, s.options);
  },
  step(s, i, exit) {
    if (exit._tag === "Failure") {
      const issue = getSchemaIssue(exit.cause);
      if (issue === undefined) {
        return exit;
      }
      if (s.issues)
        s.issues.push(issue);
      else
        s.issues = [issue];
    } else {
      if (s.out && s.successes) {
        s.successes.push(s.ast.types[i]);
        return fail4(new OneOf(s.ast, s.successes, s.input, s.options));
      }
      s.out = exit;
      if (s.successes) {
        s.successes.push(s.ast.types[i]);
      } else {
        return void_2;
      }
    }
  }
});
var nonFiniteLiterals = /* @__PURE__ */ new Union([/* @__PURE__ */ new Literal("Infinity"), /* @__PURE__ */ new Literal("-Infinity"), /* @__PURE__ */ new Literal("NaN")]);
function formatIsMutable(isMutable) {
  return isMutable ? "" : "readonly ";
}
function formatIsOptional(isOptional) {
  return isOptional ? "?" : "";
}
var Filter2 = class extends Class {
  _tag = "Filter";
  run;
  annotations;
  aborted;
  constructor(run, annotations = undefined, aborted = false) {
    super();
    this.run = run;
    this.annotations = annotations;
    this.aborted = aborted;
  }
  annotate(annotations) {
    return new Filter2(this.run, {
      ...this.annotations,
      ...annotations
    }, this.aborted);
  }
  abort() {
    return new Filter2(this.run, this.annotations, true);
  }
  and(other, annotations) {
    return new FilterGroup([this, other], annotations);
  }
};
var FilterGroup = class extends Class {
  _tag = "FilterGroup";
  checks;
  annotations;
  constructor(checks, annotations = undefined) {
    super();
    this.checks = checks;
    this.annotations = annotations;
  }
  annotate(annotations) {
    return new FilterGroup(this.checks, {
      ...this.annotations,
      ...annotations
    });
  }
  and(other, annotations) {
    return new FilterGroup([this, other], annotations);
  }
};
function makeFilter(filter, annotations, aborted = false) {
  return new Filter2((input, ast, options) => normalizeFilterOutput(ast, filter(input, ast, options), input, options), annotations, aborted);
}
function isFinite(annotations) {
  return makeFilter((n) => globalThis.Number.isFinite(n), {
    expected: "a finite number",
    representation: {
      id: "effect/schema/isFinite",
      payload: null
    },
    toJsonSchema: () => ({
      type: "number"
    }),
    toCode: () => ({
      runtime: "Schema.isFinite()"
    }),
    arbitraryConstraint: {
      number: "finite"
    },
    ...annotations
  });
}
var finite = /* @__PURE__ */ appendChecks(number2, [/* @__PURE__ */ isFinite()]);
var numberToJson = /* @__PURE__ */ new Link(/* @__PURE__ */ new Union([finite, nonFiniteLiterals]), /* @__PURE__ */ new Transformation(/* @__PURE__ */ Number3(), /* @__PURE__ */ transform((n) => globalThis.Number.isFinite(n) ? n : globalThis.String(n))));
function isPattern(regExp, annotations) {
  const copy = new globalThis.RegExp(regExp);
  const payload = {
    source: copy.source,
    flags: copy.flags
  };
  return makeFilter((s) => {
    copy.lastIndex = 0;
    return copy.test(s);
  }, {
    expected: `a string matching the RegExp ${payload.source}`,
    representation: {
      id: "effect/schema/isPattern",
      payload
    },
    toJsonSchema: () => [{}, true],
    arbitraryConstraint: {
      patterns: [payload]
    },
    ...annotations
  });
}
var bodyOwners = /* @__PURE__ */ new WeakMap;
function copy(ast, changes) {
  const out = Object.assign(Object.create(Object.getPrototypeOf(ast)), ast, changes);
  if (Reflect.ownKeys(changes).every((key) => key === "context" || key === "encoding")) {
    bodyOwners.set(out, getContextOwner(ast));
  }
  return out;
}
function getContextOwner(ast) {
  const existing = bodyOwners.get(ast);
  if (existing !== undefined)
    return existing;
  if (ast.encoding === undefined)
    return ast;
  const owner = Object.assign(Object.create(Object.getPrototypeOf(ast)), ast, {
    encoding: undefined
  });
  bodyOwners.set(ast, owner);
  return owner;
}
function replaceEncoding(ast, encoding) {
  return ast.encoding === encoding ? ast : copy(ast, {
    encoding
  });
}
function replaceContext(ast, context) {
  if (ast.context === context) {
    return ast;
  }
  const owner = getContextOwner(ast);
  if (owner.context === context && owner.encoding === ast.encoding) {
    return owner;
  }
  return copy(ast, {
    context
  });
}
function getLastEncoding(ast) {
  return ast.encoding ? getLastEncoding(ast.encoding[ast.encoding.length - 1].to) : ast;
}
function annotate(ast, annotations) {
  if (ast.checks) {
    const last = ast.checks[ast.checks.length - 1];
    return replaceChecks(ast, append(ast.checks.slice(0, -1), last.annotate(annotations)));
  }
  return copy(ast, {
    annotations: {
      ...ast.annotations,
      ...annotations
    }
  });
}
function replaceChecks(ast, checks) {
  if (ast._tag === "Suspend" && checks) {
    throw new Error("Cannot add checks to Suspend");
  }
  if (ast.checks === checks) {
    return ast;
  }
  return copy(ast, {
    checks
  });
}
function appendChecks(ast, checks) {
  return replaceChecks(ast, combineChecks(ast.checks, checks));
}
function mapLink(link, f) {
  const to = f(link.to);
  return to === link.to ? link : new Link(to, link.transformation);
}
function updateLastLink(encoding, f) {
  const links = encoding;
  const last = links[links.length - 1];
  const out = mapLink(last, f);
  return out === last ? encoding : append(encoding.slice(0, encoding.length - 1), out);
}
function applyToLastLink(f) {
  return (ast) => ast.encoding ? replaceEncoding(ast, updateLastLink(ast.encoding, f)) : ast;
}
function replaceContextLastLink(ast, context) {
  return applyToLastLink((ast) => replaceContext(ast, context))(ast);
}
function applyToSelfOrLastLinkEncodingIdempotent(f, options) {
  function out(ast) {
    if (ast.encoding) {
      const last = ast.encoding[ast.encoding.length - 1];
      return options?.stopAt?.(last) ? ast : replaceEncoding(ast, updateLastLink(ast.encoding, out));
    }
    return f(ast);
  }
  return memoizeIdempotent(out);
}
function appendTransformation(from, transformation, to) {
  const link = new Link(from, transformation);
  return replaceEncoding(to, to.encoding ? [...to.encoding, link] : [link]);
}
function mapOrSame(as, f) {
  let out;
  for (let i = 0;i < as.length; i++) {
    const a = as[i];
    const fa = f(a);
    if (out) {
      out[i] = fa;
    } else if (fa !== a) {
      out = new Array(as.length);
      for (let j = 0;j < i; j++) {
        out[j] = as[j];
      }
      out[i] = fa;
    }
  }
  return out ?? as;
}
function annotateKey(ast, annotations) {
  const context = ast.context ? new Context(ast.context.isOptional, ast.context.isMutable, ast.context.constructorDefault, {
    ...ast.context.annotations,
    ...annotations
  }) : new Context(false, false, undefined, annotations);
  return replaceContext(ast, context);
}
var optionalKey = /* @__PURE__ */ memoizeIdempotent((ast) => {
  const context = ast.context ? ast.context.isOptional === false ? new Context(true, ast.context.isMutable, ast.context.constructorDefault, ast.context.annotations) : ast.context : new Context(true, false);
  return optionalKeyLastLink(replaceContext(ast, context));
});
var optionalKeyLastLink = /* @__PURE__ */ applyToLastLink(optionalKey);
function withConstructorDefault(ast, defaultValue) {
  const context = ast.context ? new Context(ast.context.isOptional, ast.context.isMutable, defaultValue, ast.context.annotations) : new Context(false, false, defaultValue);
  return replaceContext(ast, context);
}
function decodeTo(from, to, transformation) {
  return appendTransformation(from, transformation, to);
}
function isOptional(ast) {
  return ast.context?.isOptional ?? false;
}
function isMutable(ast) {
  return ast.context?.isMutable ?? false;
}
function isStructuralCheck(check) {
  return check.annotations?.[STRUCTURAL_ANNOTATION_KEY] === true || check._tag === "FilterGroup" && check.checks.every(isStructuralCheck);
}
function extractStructuralChecks(checks) {
  function extract(check) {
    if (isStructuralCheck(check))
      return [check];
    return check._tag === "FilterGroup" ? check.checks.flatMap(extract) : [];
  }
  const out = checks.flatMap(extract);
  return isArrayNonEmpty2(out) ? out : undefined;
}
function canPreserveEncodingChecks(ast) {
  let preserve = true;
  function visit(child) {
    preserve = preserve && !child.encoding && !isSuspend(child);
    if (preserve && "recur" in child)
      child.recur(visit);
    return child;
  }
  if ("recur" in ast)
    ast.recur(visit);
  return preserve;
}
var toType = /* @__PURE__ */ memoizeIdempotent((ast) => {
  const owner = getContextOwner(ast);
  if (owner !== ast) {
    const type = toType(owner);
    return type === owner && ast.encoding === undefined ? ast : replaceContext(type, ast.context);
  }
  const type = "recur" in ast ? ast.recur(toType) : ast;
  if ("encodingChecks" in type && type.encodingChecks) {
    const checks = canPreserveEncodingChecks(ast) ? type.encodingChecks : isArrays(type) || isObjects(type) || isDeclaration(type) && type.typeParameters.length > 0 ? extractStructuralChecks(type.encodingChecks) : undefined;
    return copy(type, {
      encodingChecks: undefined,
      checks: combineChecks(type.checks, checks)
    });
  }
  return type;
});
var toEncoded = /* @__PURE__ */ memoizeIdempotent((ast) => {
  return toType(flip2(ast));
});
function flipEncoding(ast, encoding) {
  const links = encoding;
  const len = links.length;
  const last = links[len - 1];
  const ls = [new Link(flip2(replaceEncoding(ast, undefined)), links[0].transformation.flip())];
  for (let i = 1;i < len; i++) {
    ls.unshift(new Link(flip2(links[i - 1].to), links[i].transformation.flip()));
  }
  const to = flip2(last.to);
  if (to.encoding) {
    return replaceEncoding(to, [...to.encoding, ...ls]);
  } else {
    return replaceEncoding(to, ls);
  }
}
var flip2 = /* @__PURE__ */ memoize((ast) => {
  if (ast.encoding) {
    return flipEncoding(ast, ast.encoding);
  }
  const owner = getContextOwner(ast);
  if (owner !== ast) {
    const flipped = flip2(owner);
    return flipped === owner ? ast : replaceContext(flipped, ast.context);
  }
  return "flip" in ast ? ast.flip(flip2) : ("recur" in ast) ? ast.recur(flip2) : ast;
});
function containsUndefined(ast) {
  switch (ast._tag) {
    case "Undefined":
      return true;
    case "Union":
      return ast.types.some(containsUndefined);
    default:
      return false;
  }
}
function fromConst(ast, value) {
  const succeed = value === 0 ? sameExit : succeed6(value);
  return (input, options) => {
    if (input === missing)
      return missingExit;
    if (input === value)
      return succeed;
    return fail5(new InvalidType(ast, input, options));
  };
}
function fromRefinement(ast, refinement) {
  return (input, options) => {
    if (input === missing)
      return missingExit;
    if (refinement(input))
      return sameExit;
    return fail5(new InvalidType(ast, input, options));
  };
}
var parameterFromPropertyKey = /* @__PURE__ */ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
  switch (ast._tag) {
    default:
      return ast;
    case "Number":
      return ast.toCodecStringTree();
    case "Union":
      return ast.recur(parameterFromPropertyKey);
  }
});
var parameterFromString = /* @__PURE__ */ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
  switch (ast._tag) {
    default:
      return ast;
    case "Symbol":
    case "UniqueSymbol":
      return ast.toCodecStringTree();
    case "Union":
      return ast.recur(parameterFromString);
  }
});
var STRING_PATTERN = "[\\s\\S]*?";
var isStringFiniteRegExp = /* @__PURE__ */ new globalThis.RegExp(`^${FINITE_PATTERN}$`);
var isStringNumberRegExp = /* @__PURE__ */ new globalThis.RegExp(`^(?:${FINITE_PATTERN}|Infinity|-Infinity|NaN)$`);
function isStringFinite(annotations) {
  return isPattern(isStringFiniteRegExp, {
    expected: "a string representing a finite number",
    representation: {
      id: "effect/schema/isStringFinite",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: isStringFiniteRegExp.source
    }),
    ...annotations
  });
}
var finiteString = /* @__PURE__ */ appendChecks(string2, [/* @__PURE__ */ isStringFinite()]);
var finiteToString = /* @__PURE__ */ new Link(finiteString, numberFromString);
var numberToString = /* @__PURE__ */ new Link(/* @__PURE__ */ new Union([finiteString, nonFiniteLiterals]), numberFromString);
var BIGINT_PATTERN = "-?\\d+";
var isStringBigIntRegExp = /* @__PURE__ */ new globalThis.RegExp(`^${BIGINT_PATTERN}$`);
var REGEXP_PATTERN = "Symbol\\(([\\s\\S]*)\\)";
var isStringSymbolRegExp = /* @__PURE__ */ new globalThis.RegExp(`^${REGEXP_PATTERN}$`);
function collectIssues(checks, value, issues, ast, options) {
  for (let i = 0;i < checks.length; i++) {
    const check = checks[i];
    if (check._tag === "FilterGroup") {
      issues = collectIssues(check.checks, value, issues, ast, options);
      if (issues && (options.errors !== "all" || issues[issues.length - 1].filter.aborted)) {
        return issues;
      }
    } else {
      const issue = check.run(value, ast, options);
      if (issue) {
        const filter = new Filter(check, issue, value, options);
        if (issues)
          issues.push(filter);
        else
          issues = [filter];
        if (options.errors !== "all" || check.aborted) {
          return issues;
        }
      }
    }
  }
  return issues;
}
function getConstructorDescriptor(ast) {
  if (!isDeclaration(ast))
    return;
  const getDescriptor = ast.annotations?.[CONSTRUCTOR_ANNOTATION_KEY];
  return isFunction(getDescriptor) ? getDescriptor(ast.typeParameters) : undefined;
}
function isJsonLeaf(u) {
  return u === null || typeof u === "string" || typeof u === "boolean" || typeof u === "number" && globalThis.Number.isFinite(u);
}
function isStringTreeLeaf(u) {
  return u === undefined || typeof u === "string";
}
function isTree(u, isLeaf) {
  const cache = new WeakMap;
  const stack = [];
  outer:
    while (true) {
      if (typeof u !== "object" || u === null) {
        if (!isLeaf(u)) {
          return false;
        }
      } else {
        const value = u;
        const cached = cache.get(value);
        if (cached === false) {
          return false;
        }
        if (cached === undefined) {
          const isArray = Array.isArray(value);
          if (!isArray) {
            const prototype = Object.getPrototypeOf(value);
            if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
              return false;
            }
          }
          cache.set(value, false);
          stack.push({
            value,
            keys: isArray ? value.length : Object.keys(value),
            index: 0
          });
        }
      }
      while (stack.length > 0) {
        const frame = stack[stack.length - 1];
        const keys = frame.keys;
        if (typeof keys === "number") {
          if (frame.index < keys) {
            u = frame.value[frame.index++];
            continue outer;
          }
        } else if (frame.index < keys.length) {
          u = frame.value[keys[frame.index++]];
          continue outer;
        }
        cache.set(frame.value, true);
        stack.pop();
      }
      return true;
    }
}
function isJson(u) {
  return isTree(u, isJsonLeaf);
}
var Json = /* @__PURE__ */ new Declaration([], () => (input, ast, options) => isJson(input) ? sameExit : fail5(new InvalidType(ast, input, options)), {
  representation: {
    id: "effect/schema/Json",
    payload: null
  },
  expected: "JSON value",
  toCodecJson: () => {
    return;
  },
  toCodecStringTree: () => unknownToStringTree
});
var unknownToJson = /* @__PURE__ */ new Link(Json, /* @__PURE__ */ passthrough2());
var objectKeywordToJson = /* @__PURE__ */ new Link(/* @__PURE__ */ new Union([/* @__PURE__ */ new Arrays(false, [], [Json]), /* @__PURE__ */ new Objects([], [/* @__PURE__ */ new IndexSignature(string2, Json)])]), /* @__PURE__ */ passthrough2());
function isStringTree(u) {
  return isTree(u, isStringTreeLeaf);
}
var StringTree = /* @__PURE__ */ new Declaration([], () => (input, ast, options) => isStringTree(input) ? sameExit : fail5(new InvalidType(ast, input, options)), {
  expected: "StringTree",
  toCodecStringTree: () => {
    return;
  }
});
var unknownToStringTree = /* @__PURE__ */ new Link(StringTree, /* @__PURE__ */ passthrough2());

// ../node_modules/effect/dist/internal/schema/interpreter.js
var flatMapTransformation = (result, current, f) => result === sameExit ? f(current) : flatMapEager2(result, f);
function compileTransformation(transformation) {
  if (transformation._tag === "Middleware") {
    return (result, current, options) => {
      const transformed = result === sameExit ? transformation.decode(succeed6(toOption(current)), options) : transformation.decode(mapEager2(result, toOption), options);
      return fromOptionalEffect(transformed);
    };
  }
  const getter = transformation.decode;
  switch (getter._tag) {
    case "Passthrough":
      return (result, current) => result === sameExit ? succeed6(current) : result;
    case "Transform": {
      const transform = (value) => value === missing ? missingExit : succeed6(getter.transform(value));
      return (result, current) => flatMapTransformation(result, current, transform);
    }
    case "TransformOptional": {
      const transform = (value) => fromOptionExit(getter.transform(toOption(value)));
      return (result, current) => flatMapTransformation(result, current, transform);
    }
    case "TransformEffect":
      return (result, current, options) => flatMapTransformation(result, current, (value) => value === missing ? missingExit : getter.transform(value, options));
    case "TransformOptionalEffect":
      return (result, current, options) => flatMapTransformation(result, current, (value) => fromOptionalEffect(getter.transform(toOption(value), options)));
  }
}
var fromOptionalEffect = (effect) => flatMapEager2(effect, fromOptionExit);
var wrapEncoding = (ast, input, options, effect) => catchCause2(effect, (cause) => failCauseSync2(() => map3(cause, (issue) => new Encoding(ast, issue, input, options))));
function makeConstructorParser(descriptor, compile) {
  const transform = compileTransformation(descriptor.link.transformation);
  let sourceParser;
  return (input, options) => {
    if (input === missing)
      return missingExit;
    if (descriptor.isConstructed(input))
      return sameExit;
    const result = (sourceParser ??= compile(descriptor.link.to))(input, options);
    return transform(result, input, options);
  };
}
function withDefault(ast, parser) {
  const defaultValue = ast.context.constructorDefault;
  return (input, options) => {
    if (input !== missing && input !== undefined)
      return parser(input, options);
    const result = defaultValue;
    if (effectIsExit(result) && result._tag === "Success") {
      const local = parser(result[args], options);
      return local === sameExit ? result : local;
    }
    return flatMapEager2(wrapEncoding(ast, input, options, result), (value) => {
      const local = parser(value, options);
      return local === sameExit ? succeed6(value) : local;
    });
  };
}
function compileField(ast, compile) {
  const parser = compile(ast);
  return ast.context?.constructorDefault === undefined ? parser : withDefault(ast, parser);
}
function compile(ast, compile, compileField, base, specialize) {
  if (ast._tag === "Declaration") {
    for (const parameter of ast.typeParameters)
      compile(parameter);
  }
  const descriptor = compileField ? getConstructorDescriptor(ast) : undefined;
  const parser = descriptor ? makeConstructorParser(descriptor, compile) : base ?? ast.getParser(compile, compileField);
  const checks = ast.checks;
  const links = ast.encoding;
  const transformations = links?.map((link) => compileTransformation(link.transformation));
  const encodingChecks = ast.encodingChecks;
  if (!links && !checks && !encodingChecks) {
    return parser;
  }
  let encodingParsers;
  const parseChecks = (input, options) => {
    let result = parser(input, options);
    if (encodingChecks && !options.disableChecks) {
      if (effectIsExit(result)) {
        if (result._tag === "Success") {
          const output = result === sameExit ? input : result[args];
          if (input !== missing && output !== missing) {
            const issues = collectIssues(encodingChecks, input, undefined, ast, options);
            if (issues) {
              result = fail5(new Composite(ast, issues, input, options));
            }
          }
        }
      } else {
        result = flatMap2(result, (value) => {
          if (input !== missing && value !== missing) {
            const issues = collectIssues(encodingChecks, input, undefined, ast, options);
            if (issues) {
              return fail5(new Composite(ast, issues, input, options));
            }
          }
          return succeed5(value);
        });
      }
    }
    if (checks && !options.disableChecks) {
      if (effectIsExit(result)) {
        if (result._tag === "Success") {
          const value = result === sameExit ? input : result[args];
          if (value === missing)
            return result;
          const issues = collectIssues(checks, value, undefined, ast, options);
          if (issues) {
            result = fail5(new Composite(ast, issues, value, options));
          }
        }
      } else {
        result = flatMap2(result, (value) => {
          if (value !== missing) {
            const issues = collectIssues(checks, value, undefined, ast, options);
            if (issues) {
              return fail5(new Composite(ast, issues, value, options));
            }
          }
          return succeed5(value);
        });
      }
    }
    return result;
  };
  const parseLocal = specialize === undefined ? parseChecks : specialize(parseChecks);
  if (!links) {
    return parseLocal;
  }
  return (input, options) => {
    const parsers = encodingParsers ??= links.map((link) => compile(link.to));
    let current = input;
    let result = parsers[parsers.length - 1](input, options);
    for (let i = links.length - 1;i >= 0; i--) {
      result = transformations[i](result, current, options);
      if (i !== 0) {
        const next = parsers[i - 1];
        if (result._tag === "Success") {
          current = result[args];
          result = next(current, options);
        } else {
          result = flatMapEager2(result, (value) => {
            const nextResult = next(value, options);
            return nextResult === sameExit ? succeed6(value) : nextResult;
          });
        }
      }
    }
    if (result._tag === "Success") {
      const value = result[args];
      const local = parseLocal(value, options);
      return local === sameExit ? result : local;
    }
    result = wrapEncoding(ast, input, options, result);
    return flatMapEager2(result, (value) => {
      const local = parseLocal(value, options);
      return local === sameExit ? succeed6(value) : local;
    });
  };
}

// ../node_modules/effect/dist/internal/schema/compilerRegistry.js
var invalid2 = /* @__PURE__ */ Symbol();
var cache = /* @__PURE__ */ new WeakMap;
var compiler;
var compilerAdaptersEnabled = false;
var decodeChild = (ast) => compilerAdaptersEnabled ? lazyParser(resolve2, ast, "parser") : resolve2(ast).parser;
var makeChild = (ast) => compilerAdaptersEnabled ? lazyParser(resolve2, ast, "makeEffect") : resolve2(ast).makeEffect;
var makeField = (ast) => compileField(ast, makeChild);

class InterpretedEntry {
  ast;
  constructor(ast) {
    this.ast = ast;
  }
  get decodeEffect() {
    return this.cachedDecodeEffect ??= compile(this.ast, decodeChild);
  }
  get parser() {
    return this.decodeEffect;
  }
  get makeEffect() {
    return this.cachedMakeEffect ??= compile(this.ast, makeChild, makeField);
  }
}

class CompilerEntry extends InterpretedEntry {
  compiled;
  resolve;
  constructor(ast, compiled, resolve) {
    super(ast);
    this.compiled = compiled;
    this.resolve = resolve;
  }
  save(key, value) {
    Object.defineProperty(this, key, {
      value
    });
    return value;
  }
  operation(key) {
    const compiled = this.compiled;
    return typeof compiled === "function" ? compiled(this.ast, this.resolve, key) : compiled?.[key];
  }
  get is() {
    return this.save("is", this.operation("is"));
  }
  get decode() {
    return this.save("decode", this.operation("decode"));
  }
  get make() {
    return this.save("make", this.operation("make"));
  }
  get decodeEffect() {
    return this.save("decodeEffect", this.operation("decodeEffect") ?? compile(this.ast, (ast) => lazyParser(this.resolve, ast, "parser")));
  }
  get parser() {
    const decode = this.decode;
    return decode === undefined ? this.decodeEffect : this.save("parser", withDecode(decode, () => this.decodeEffect));
  }
  get makeEffect() {
    const makeEffect = this.operation("makeEffect");
    if (makeEffect !== undefined)
      return this.save("makeEffect", makeEffect);
    const child = (ast) => lazyParser(this.resolve, ast, "makeEffect");
    return this.save("makeEffect", compile(this.ast, child, (ast) => compileField(ast, child)));
  }
}
function withDecode(fastDecode, decodeEffect) {
  let detailed;
  return (input, options) => {
    if (input !== missing) {
      try {
        const value = fastDecode(input, options);
        if (value !== invalid2)
          return value === input ? sameExit : succeed6(value);
      } catch (error) {
        return die3(error);
      }
    }
    return (detailed ??= decodeEffect())(input, options);
  };
}
function lazyParser(resolve, ast, operation) {
  const entry = resolve(ast);
  if (entry.compiled === undefined || Object.hasOwn(entry, operation)) {
    return entry[operation];
  }
  let parser;
  return (input, options) => (parser ??= entry[operation])(input, options);
}
function resolve2(ast) {
  const cached = cache.get(ast);
  if (cached !== undefined)
    return cached;
  const entry = compiler === undefined ? new InterpretedEntry(ast) : new CompilerEntry(ast, compiler(ast, resolve2), resolve2);
  cache.set(ast, entry);
  return entry;
}

// ../node_modules/effect/dist/SchemaParser.js
function makeEffect(schema) {
  const ast = schema.ast;
  let parser;
  return (input, options) => {
    return (parser ??= runWithCompiler(constructorCompiler, toType(ast)))(input, options?.disableChecks ? options?.parseOptions ? {
      ...options.parseOptions,
      disableChecks: true
    } : {
      disableChecks: true
    } : options?.parseOptions);
  };
}
function makeOption(schema) {
  const parser = makeEffect(schema);
  return (input, options) => {
    const exit = runSyncExit2(parser(input, options));
    if (isSuccess3(exit)) {
      return some2(exit.value);
    }
    getSchemaIssueOrThrow(exit.cause, "Option adapter can only return none for schema issues");
    return none2();
  };
}
function make5(schema) {
  return makeConstructorSync(toType(schema.ast));
}
function decodeUnknownEffect(schema, options) {
  const parser = run(schema.ast);
  return options === undefined ? parser : (input, overrideOptions) => parser(input, mergeParseOptions(options, overrideOptions));
}
function decodeUnknownOption(schema, options) {
  return asOption(decodeUnknownEffect(schema, options));
}
var mergeParseOptions = (options, overrideOptions) => overrideOptions ? {
  ...options,
  ...overrideOptions
} : options;
var getValue = (value) => {
  if (value === missing) {
    return fail5(new InvalidValue);
  }
  return succeed5(value);
};
function run(ast) {
  return runWithCompiler(normalCompiler, ast);
}
function parserResult(result, input) {
  if (result === sameExit) {
    return succeed5(input);
  }
  if (!effectIsExit(result)) {
    return flatMapEager2(result, getValue);
  }
  return result[args] === missing ? getValue(missing) : result;
}
function runWithCompiler(compiler, ast) {
  let parser;
  return (input, options) => {
    const result = (parser ??= compiler(ast))(input, options ?? defaultParseOptions);
    if (result === sameExit) {
      return succeed5(input);
    }
    if (!effectIsExit(result)) {
      return flatMapEager2(result, getValue);
    }
    return result[args] === missing ? getValue(missing) : result;
  };
}
function asExit(parser) {
  return (input, options) => runSyncExit2(parser(input, options));
}
function asOption(parser) {
  const parserExit = asExit(parser);
  return (input, options) => {
    const exit = parserExit(input, options);
    if (isSuccess3(exit)) {
      return some2(exit.value);
    }
    getSchemaIssueOrThrow(exit.cause, "Option adapter can only return none for schema issues");
    return none2();
  };
}
function runSync2(effect, message) {
  const exit = runSyncExit2(effect);
  if (isSuccess3(exit)) {
    return exit.value;
  }
  const issue = getSchemaIssueOrThrow(exit.cause, message);
  throw new Error("Schema validation failed", {
    cause: issue
  });
}
function makeConstructorSync(ast) {
  let entry;
  let parser;
  return (input, options) => {
    entry ??= resolve2(ast);
    const parseOptions = options?.disableChecks ? options.parseOptions ? {
      ...options.parseOptions,
      disableChecks: true
    } : {
      disableChecks: true
    } : options?.parseOptions ?? defaultParseOptions;
    const make = entry.make;
    if (make !== undefined && input !== missing) {
      let output;
      try {
        output = make(input, parseOptions);
      } catch (error) {
        getSchemaIssueOrThrow(die2(error), "Constructor adapter can only throw schema issues");
        throw error;
      }
      if (output !== invalid2 && output !== missing)
        return output;
    }
    const result = (parser ??= entry.makeEffect)(input, parseOptions);
    return runSync2(parserResult(result, input), "Constructor adapter can only throw schema issues");
  };
}
var normalCompiler = (ast) => resolve2(ast).parser;
var constructorCompiler = (ast) => resolve2(ast).makeEffect;

// ../node_modules/effect/dist/internal/schema/make.js
var TypeId9 = "~effect/Schema/Schema";
var RebuildOptions = /* @__PURE__ */ Symbol();
var SchemaProto = {
  [TypeId9]: TypeId9,
  get make() {
    const value = make5(this);
    Object.defineProperty(this, "make", {
      value,
      enumerable: true
    });
    return value;
  },
  get makeEffect() {
    const value = makeEffect(this);
    Object.defineProperty(this, "makeEffect", {
      value,
      enumerable: true
    });
    return value;
  },
  get makeOption() {
    const value = makeOption(this);
    Object.defineProperty(this, "makeOption", {
      value,
      enumerable: true
    });
    return value;
  },
  pipe() {
    return pipeArguments(this, arguments);
  },
  annotate(annotations) {
    return this.rebuild(annotate(this.ast, annotations));
  },
  annotateKey(annotations) {
    return this.rebuild(annotateKey(this.ast, annotations));
  },
  check(...checks) {
    return this.rebuild(appendChecks(this.ast, checks));
  },
  rebuild(ast) {
    return make6(ast, this[RebuildOptions]);
  }
};
function make6(ast, options) {
  function Schema() {}
  const self = Object.setPrototypeOf(Schema, SchemaProto);
  if (options && (Object.hasOwn(options, "name") || Object.hasOwn(options, "length") || Object.hasOwn(options, "__proto__"))) {
    Object.defineProperties(self, Object.getOwnPropertyDescriptors({
      ...options
    }));
  } else {
    Object.assign(self, options);
  }
  self[RebuildOptions] = options;
  self.ast = ast;
  return self;
}

// ../node_modules/effect/dist/JsonPointer.js
function escapeToken(token) {
  return token.replace(/~/g, "~0").replace(/\//g, "~1");
}
function unescapeToken(token) {
  return token.replace(/~1/g, "/").replace(/~0/g, "~");
}
function formatUriFragmentToken(token) {
  return encodeURI(escapeToken(token)).replace(/#/g, "%23");
}
function decodeUriFragment(fragment) {
  if (fragment.length === 0 || fragment === "#")
    return "";
  if (!fragment.startsWith("#"))
    return;
  const encoded = fragment.slice(1);
  try {
    if (encodeURI(encoded).replace(/%25/g, "%").replace(/#/g, "%23") !== encoded)
      return;
    const pointer = decodeURIComponent(encoded);
    return pointer.startsWith("/") && !/~(?:[^01]|$)/.test(pointer) ? pointer : undefined;
  } catch {
    return;
  }
}
function parseUriFragment(fragment) {
  const pointer = decodeUriFragment(fragment);
  return pointer === undefined ? undefined : pointer.length === 0 ? [] : pointer.slice(1).split("/").map(unescapeToken);
}

// ../node_modules/effect/dist/JsonSchema.js
function transformSchema(node, transform) {
  return walk(node, false, true);
  function walk(node, inheritedResource, isRoot = false) {
    if (!isObject(node))
      return node;
    const inEmbeddedResource = inheritedResource || !isRoot && createsResource(node.$id);
    const out = {};
    for (const key of Object.keys(node)) {
      const value = node[key];
      let transformed = value;
      switch (key) {
        case "$defs":
        case "properties":
        case "patternProperties":
        case "dependentSchemas":
          transformed = mapObject(value, (value) => walk(value, inEmbeddedResource)) ?? value;
          break;
        case "allOf":
        case "anyOf":
        case "oneOf":
        case "prefixItems":
          transformed = Array.isArray(value) ? value.map((value) => walk(value, inEmbeddedResource)) : value;
          break;
        case "not":
        case "additionalProperties":
        case "propertyNames":
        case "unevaluatedProperties":
        case "items":
        case "contains":
        case "unevaluatedItems":
        case "if":
        case "then":
        case "else":
        case "contentSchema":
          transformed = walk(value, inEmbeddedResource);
      }
      assignProperty(out, key, transformed);
    }
    transform(out, inEmbeddedResource);
    return out;
  }
}
function rewriteRefs(schema, rewrite) {
  return transformSchema(schema, (schema) => {
    rewriteSchemaRef(schema, rewrite);
  });
}
function rewriteSchemaRef(schema, rewrite) {
  if (typeof schema.$ref === "string") {
    assignProperty(schema, "$ref", rewrite(schema.$ref, "$ref"));
  }
  if (typeof schema.$dynamicRef === "string") {
    assignProperty(schema, "$dynamicRef", rewrite(schema.$dynamicRef, "$dynamicRef"));
  }
}
function mapObject(value, f) {
  if (!isObject(value))
    return;
  const out = {};
  for (const key of Object.keys(value)) {
    assignProperty(out, key, f(value[key], key));
  }
  return out;
}
function createsResource(id) {
  return typeof id === "string" && id.length > 0 && id[0] !== "#";
}
var PRE_2020_TO_2020_COLLISIONS = ["$anchor", "$defs", "$dynamicAnchor", "$dynamicRef", "$vocabulary", "contentSchema", "dependentRequired", "dependentSchemas", "maxContains", "minContains", "prefixItems", "unevaluatedItems", "unevaluatedProperties"];
var DRAFT_07_TO_2020_COLLISIONS = [...PRE_2020_TO_2020_COLLISIONS, "deprecated"];
var OPEN_API_30_TO_2020_COLLISIONS = [...PRE_2020_TO_2020_COLLISIONS, "$comment", "$id", "$schema", "const", "contains", "contentEncoding", "contentMediaType", "else", "examples", "if", "patternProperties", "propertyNames", "then"];

// ../node_modules/effect/dist/internal/schema/toCodec.js
var toCodecJsonAST = /* @__PURE__ */ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
  const out = toCodecJsonASTStep(ast, toCodecJsonAST);
  const context = ast.context;
  if (out === ast || context === undefined)
    return out;
  return replaceContextLastLink(out, withoutConstructorDefault(context));
});
function withoutConstructorDefault(context) {
  return context.constructorDefault === undefined ? context : new Context(context.isOptional, context.isMutable, undefined, context.annotations);
}
function validateCanonicalObjectPropertyNames(ast) {
  if (ast.propertySignatures.some((ps) => typeof ps.name !== "string")) {
    throw new globalThis.Error("Objects property names must be strings", {
      cause: ast
    });
  }
}
function makeReorder(getPriority) {
  return (types) => {
    const sortedTypes = [...types].sort((a, b) => getPriority(toEncoded(a)) - getPriority(toEncoded(b)));
    const orderChanged = sortedTypes.some((ast, index) => ast !== types[index]);
    if (!orderChanged)
      return types;
    return sortedTypes;
  };
}
var toCodecJsonReorder = /* @__PURE__ */ makeReorder((ast) => {
  switch (ast._tag) {
    case "BigInt":
    case "Symbol":
    case "UniqueSymbol":
      return 0;
    default:
      return 1;
  }
});
function toCodecJsonASTStep(ast, recur) {
  switch (ast._tag) {
    case "Declaration": {
      const getLink = ast.annotations?.toCodecJson ?? ast.annotations?.toCodec;
      if (!isFunction(getLink)) {
        return replaceEncoding(ast, [unknownToJson]);
      }
      const typeParameters = ast.typeParameters.map((tp) => make6(toEncoded(tp)));
      const link = getLink(typeParameters);
      return link === undefined ? ast : replaceEncoding(ast, [mapLink(link, recur)]);
    }
    case "Unknown":
      return replaceEncoding(ast, [unknownToJson]);
    case "ObjectKeyword":
      return replaceEncoding(ast, [objectKeywordToJson]);
    case "Undefined":
    case "Void":
    case "Literal":
    case "Number":
      return ast.toCodecJson();
    case "UniqueSymbol":
    case "Symbol":
    case "BigInt":
      return ast.toCodecStringTree();
    case "Objects": {
      validateCanonicalObjectPropertyNames(ast);
      return ast.recur(recur, parameterFromString);
    }
    case "Union": {
      const sortedTypes = toCodecJsonReorder(ast.types);
      if (sortedTypes !== ast.types) {
        return new Union(sortedTypes, ast.options, ast.annotations, ast.checks, ast.encoding, ast.context, ast.encodingChecks).recur(recur);
      }
      return ast.recur(recur);
    }
    case "Arrays":
    case "Suspend":
      return ast.recur(recur);
  }
  return ast;
}

// ../node_modules/effect/dist/RegExp.js
var RegExp2 = globalThis.RegExp;
var escape = (string) => string.replace(/[/\\^$*+?.()|[\]{}]/g, "\\$&");

// ../node_modules/effect/dist/internal/errors.js
function errorWithPath(message, path) {
  if (path.length > 0) {
    message += `
  at ${formatPath(path)}`;
  }
  return new Error(message);
}

// ../node_modules/effect/dist/internal/schema/toJsonSchemaDocument.js
function formatDefinitionReference(key) {
  return `#/$defs/${formatUriFragmentToken(key)}`;
}
var jsonSchemaAnnotationExcludedKeys = /* @__PURE__ */ new Set([...annotationExcludedKeys, IDENTIFIER_FALLBACK_KEY, ...jsonSchemaAnnotationKeys]);
function collectJsonSchemaAnnotations(annotations, options) {
  if (annotations === undefined)
    return;
  const out = {};
  const title = annotations.title;
  if (typeof title === "string")
    out.title = title;
  const description = annotations.description;
  const expected = annotations.expected;
  if (typeof description === "string")
    out.description = description;
  else if (options?.generateDescriptions === true && typeof expected === "string")
    out.description = expected;
  const defaultValue = annotations.default;
  if (isJson(defaultValue))
    out.default = defaultValue;
  const examples = annotations.examples;
  if (Array.isArray(examples) && isJson(examples))
    out.examples = examples;
  const readOnly = annotations.readOnly;
  if (typeof readOnly === "boolean")
    out.readOnly = readOnly;
  const writeOnly = annotations.writeOnly;
  if (typeof writeOnly === "boolean")
    out.writeOnly = writeOnly;
  const format = annotations.format;
  if (typeof format === "string")
    out.format = format;
  const contentEncoding = annotations.contentEncoding;
  if (typeof contentEncoding === "string")
    out.contentEncoding = contentEncoding;
  const contentMediaType = annotations.contentMediaType;
  if (typeof contentMediaType === "string")
    out.contentMediaType = contentMediaType;
  const contentSchema = annotations.contentSchema;
  if (isJson(contentSchema))
    out.contentSchema = contentSchema;
  if (options?.includeAnnotationKey !== undefined) {
    for (const [key, value] of Object.entries(annotations)) {
      if (jsonSchemaAnnotationExcludedKeys.has(key) || !options.includeAnnotationKey(key)) {
        continue;
      }
      if (isJson(value))
        assignProperty(out, key, value);
    }
  }
  return Object.keys(out).length === 0 ? undefined : out;
}
function extractJsonSchemaNumberType(schema) {
  let type = schema.type === "number" || schema.type === "integer" ? schema.type : undefined;
  let out = schema;
  if (type !== undefined) {
    out = {
      ...schema
    };
    delete out.type;
  }
  if (Array.isArray(out.allOf)) {
    const members = [];
    let changed = false;
    for (const member of out.allOf) {
      const extracted = extractJsonSchemaNumberType(member);
      if (extracted.type !== undefined) {
        changed = true;
        if (type === undefined || extracted.type === "integer")
          type = extracted.type;
      }
      if (Object.keys(extracted.schema).length > 0)
        members.push(extracted.schema);
    }
    if (changed) {
      const {
        allOf: _,
        ...rest
      } = out;
      out = members.length === 0 ? rest : {
        ...rest,
        allOf: members
      };
    }
  }
  return {
    type,
    schema: out
  };
}
function isJsonSchemaNumberEncoding(schema) {
  if (!Array.isArray(schema.anyOf) || schema.anyOf.length !== 2 || schema.anyOf[0]?.type !== "number")
    return false;
  const special = schema.anyOf[1];
  return special?.type === "string" && Array.isArray(special.enum) && special.enum.length === 3 && special.enum.includes("NaN") && special.enum.includes("Infinity") && special.enum.includes("-Infinity");
}
var inlineableCheckKeywords = "|type|format|pattern|multipleOf|minimum|maximum|exclusiveMinimum|exclusiveMaximum|minLength|maxLength|minItems|maxItems|uniqueItems|minProperties|maxProperties|propertyNames|";
function hasOnlyKeywords(schema, allowed) {
  return Object.keys(schema).every((key) => allowed.includes(`|${key}|`));
}
function hasNoCollisions(left, rightKeys) {
  return typeof left.$ref !== "string" && rightKeys.every((key) => !Object.hasOwn(left, key));
}
var promotableAnnotationKeywords = "|title|description|default|examples|readOnly|writeOnly|";
var inlineableAnnotatedCheckKeywords = inlineableCheckKeywords + promotableAnnotationKeywords;
function appendJsonSchema(left, right, inlineCheck) {
  if (Object.keys(left).length === 0)
    return right;
  const rightKeys = Object.keys(right);
  if (rightKeys.length === 0)
    return left;
  const leftType = left.type === "number" || left.type === "integer" ? left.type : undefined;
  const isNumberEncoding = isJsonSchemaNumberEncoding(left);
  if (leftType !== undefined || isNumberEncoding) {
    const extracted = extractJsonSchemaNumberType(right);
    if (extracted.type !== undefined) {
      const type = leftType === "integer" || extracted.type === "integer" ? "integer" : "number";
      const base = {
        ...left,
        type
      };
      if (isNumberEncoding)
        delete base.anyOf;
      const extractedKeys = Object.keys(extracted.schema);
      if (extractedKeys.length === 0)
        return base;
      return hasOnlyKeywords(extracted.schema, promotableAnnotationKeywords) && hasNoCollisions(base, extractedKeys) ? {
        ...base,
        ...extracted.schema
      } : appendJsonSchema(base, extracted.schema, inlineCheck);
    }
  }
  if (inlineCheck && hasNoCollisions(left, rightKeys)) {
    return {
      ...left,
      ...right
    };
  }
  const members = Array.isArray(right.allOf) && rightKeys.length === 1 ? right.allOf : [right];
  if (Array.isArray(left.allOf)) {
    return {
      ...left,
      allOf: [...left.allOf, ...members]
    };
  }
  if (typeof left.$ref === "string") {
    return {
      allOf: [left, ...members]
    };
  }
  return {
    ...left,
    allOf: members
  };
}
function isExact(exactness, seen = new Set) {
  if (typeof exactness === "boolean")
    return exactness;
  if (seen.has(exactness))
    return true;
  seen.add(exactness);
  return exactness.every((dependency) => isExact(dependency, seen));
}
function isApproximateCheckOutput(output) {
  return Array.isArray(output);
}
function compileJsonSchema(representations, rootPaths, references, options) {
  const compiledDefinitions = new Map;
  const definitionAliases = new Map;
  const compiledRepresentations = new WeakMap;
  const pendingOneOf = new Map;
  const fallbackDefinitions = new Map;
  const referenceKeys = Object.keys(references);
  for (const key of referenceKeys) {
    compileDefinition(key, ["references", key]);
  }
  const compiledSchemas = map(representations, (representation, index) => recur(representation, rootPaths[index], []));
  for (const [branches, schemas] of pendingOneOf.values()) {
    if (!isExact(branches)) {
      for (const schema of schemas) {
        if (Array.isArray(schema.oneOf)) {
          schema.anyOf = schema.oneOf;
          delete schema.oneOf;
        }
      }
    }
  }
  for (const key of referenceKeys) {
    const representation = references[key];
    const fallback = getIdentifierFallback(representation);
    if (fallback === undefined)
      continue;
    const schema = compiledDefinitions.get(key)[0];
    const candidates = fallbackDefinitions.get(fallback);
    const match = candidates?.find((candidate) => equals(compiledDefinitions.get(candidate)[0], schema));
    if (match === undefined) {
      if (candidates === undefined)
        fallbackDefinitions.set(fallback, [key]);
      else
        candidates.push(key);
    } else {
      definitionAliases.set(key, match);
    }
  }
  const schemas = map(compiledSchemas, finalizeJsonSchema);
  const definitions = {};
  for (const key of referenceKeys) {
    if (!definitionAliases.has(key)) {
      assignProperty(definitions, key, finalizeJsonSchema(compiledDefinitions.get(key)[0]));
    }
  }
  return {
    dialect: "draft-2020-12",
    schemas,
    definitions
  };
  function registerPendingOneOf(schema) {
    if (Array.isArray(schema.oneOf))
      pendingOneOf.get(schema.oneOf)?.[1].push(schema);
    return schema;
  }
  function compileDefinition(key, path) {
    if (!Object.hasOwn(references, key)) {
      throw errorWithPath(`Invalid reference ${key}`, [...path, "$ref"]);
    }
    const cached = compiledDefinitions.get(key);
    if (cached !== undefined)
      return cached;
    const result = [{}, []];
    compiledDefinitions.set(key, result);
    result[0] = recur(references[key], ["references", key], result[1]);
    return result;
  }
  function finalizeJsonSchema(schema) {
    return rewriteRefs(schema, ($ref) => {
      const pointer = decodeUriFragment($ref);
      if (pointer === undefined) {
        if (/^#(?:\/|%2f)/i.test($ref)) {
          throw new Error(`Invalid JSON Pointer URI fragment ${JSON.stringify($ref)}`);
        }
        return $ref;
      }
      if (!pointer.startsWith("/$defs/"))
        return $ref;
      const separator = pointer.indexOf("/", 7);
      const canonical = definitionAliases.get(unescapeToken(pointer.slice(7, separator < 0 ? undefined : separator)));
      if (canonical === undefined)
        return $ref;
      return $ref.replace(/^#(?:\/|%2f).*?(?:\/|%2f).*?(?=\/|%2f|$)/i, formatDefinitionReference(canonical));
    });
  }
  function getIdentifierFallback(representation) {
    if (representation._tag === "Reference")
      return;
    const annotations = representation.checks.length === 0 ? representation.annotations : representation.checks[representation.checks.length - 1].annotations;
    return typeof annotations?.identifier !== "string" && typeof annotations?.[IDENTIFIER_FALLBACK_KEY] === "string" ? annotations[IDENTIFIER_FALLBACK_KEY] : undefined;
  }
  function compileCheck(check, type, path, dependencies) {
    const annotations = check.annotations;
    const callback = annotations?.toJsonSchema;
    if (callback !== undefined) {
      const schemas = check.representation?.schemas?.map((schema, index) => recur(schema, [...path, "representation", "schemas", index], dependencies)) ?? [];
      const result = callback({
        type,
        schemas
      });
      const approximate = isApproximateCheckOutput(result);
      if (approximate) {
        dependencies.push(false);
      }
      const fragment = approximate ? result[0] : result;
      const ordinary = collectJsonSchemaAnnotations(annotations, options);
      const schema = ordinary === undefined ? fragment : {
        ...fragment,
        ...ordinary
      };
      const allowed = ordinary === undefined ? inlineableCheckKeywords : inlineableAnnotatedCheckKeywords;
      return [schema, check._tag === "Filter" && hasOnlyKeywords(schema, allowed) && (ordinary === undefined || hasOnlyKeywords(ordinary, promotableAnnotationKeywords)) ? true : undefined];
    }
    if (check._tag === "Filter") {
      dependencies.push(false);
      return;
    }
    const schemas = check.checks.flatMap((child, index) => {
      const result = compileCheck(child, type, [...path, "checks", index], dependencies);
      return result === undefined ? [] : [result[0]];
    });
    if (schemas.length === 0)
      return;
    const ordinary = collectJsonSchemaAnnotations(annotations, options);
    const schema = {
      allOf: schemas
    };
    return [ordinary === undefined ? schema : {
      ...schema,
      ...ordinary
    }];
  }
  function recur(representation, path, dependencies) {
    if (representation._tag === "Reference") {
      dependencies.push(compileDefinition(representation.$ref, path)[1]);
      return {
        $ref: formatDefinitionReference(representation.$ref)
      };
    }
    const cached = compiledRepresentations.get(representation);
    if (cached !== undefined) {
      dependencies.push(cached[1]);
      return cached[0];
    }
    const local = [];
    dependencies.push(local);
    let output = on(representation, path, local);
    const ordinary = collectJsonSchemaAnnotations(representation.annotations, options);
    if (ordinary !== undefined) {
      output = {
        ...output,
        ...ordinary
      };
    }
    for (let index = 0;index < representation.checks.length; index++) {
      const type = typeof output.type === "string" && isJsonSchemaType(output.type) ? output.type : undefined;
      const check = compileCheck(representation.checks[index], type, [...path, "checks", index], local);
      if (check !== undefined)
        output = appendJsonSchema(output, ...check);
    }
    compiledRepresentations.set(representation, [output, local]);
    return registerPendingOneOf(output);
  }
  function on(representation, path, dependencies) {
    switch (representation._tag) {
      case "Any":
      case "Unknown":
        return {};
      case "ObjectKeyword":
        return {
          anyOf: [{
            type: "object"
          }, {
            type: "array"
          }]
        };
      case "Void":
      case "Undefined":
      case "Null":
        return {
          type: "null"
        };
      case "BigInt":
        return {
          type: "string",
          allOf: [{
            pattern: "^-?\\d+$"
          }]
        };
      case "Symbol":
        return {
          type: "string",
          allOf: [{
            pattern: "^Symbol\\(([\\s\\S]*)\\)$"
          }]
        };
      case "UniqueSymbol":
        return globalThis.Symbol.keyFor(representation.symbol) === undefined ? {
          not: {}
        } : {
          type: "string",
          enum: [globalThis.String(representation.symbol)]
        };
      case "Declaration":
        dependencies.push(false);
        return {};
      case "Suspend":
        return recur(representation.thunk, [...path, "thunk"], dependencies);
      case "Never":
        return {
          not: {}
        };
      case "String":
        return {
          type: "string"
        };
      case "Number":
        return {
          anyOf: [{
            type: "number"
          }, {
            type: "string",
            enum: ["NaN", "Infinity", "-Infinity"]
          }]
        };
      case "Boolean":
        return {
          type: "boolean"
        };
      case "Literal": {
        const literal = representation.literal;
        return typeof literal === "bigint" ? {
          type: "string",
          enum: [globalThis.String(literal)]
        } : {
          type: typeof literal,
          enum: [literal]
        };
      }
      case "Enum": {
        const types = representation.enums.map(([title, literal], index) => {
          if (typeof literal === "number" && !globalThis.Number.isFinite(literal)) {
            throw errorWithPath(`Invalid numeric enum value ${globalThis.String(literal)}`, [...path, "enums", index, 1]);
          }
          return {
            type: typeof literal,
            enum: [literal],
            title
          };
        });
        return types.length === 0 ? {
          not: {}
        } : {
          anyOf: types
        };
      }
      case "TemplateLiteral":
        return {
          type: "string",
          pattern: `^${representation.parts.map(getPartPattern).join("")}$`
        };
      case "Arrays": {
        if (representation.rest.length > 1) {
          throw errorWithPath("Invalid schema representation document", [...path, "rest"]);
        }
        const out = {
          type: "array"
        };
        let minItems = representation.elements.length;
        const prefixItems = representation.elements.map((element, index) => {
          if (element.isOptional)
            minItems--;
          const schema = recur(element.type, [...path, "elements", index, "type"], dependencies);
          const annotations = collectJsonSchemaAnnotations(element.annotations, options);
          return annotations === undefined ? schema : registerPendingOneOf(appendJsonSchema(schema, annotations));
        });
        if (prefixItems.length > 0) {
          out.prefixItems = prefixItems;
          out.maxItems = representation.elements.length;
          if (minItems > 0)
            out.minItems = minItems;
        } else {
          out.items = false;
        }
        if (representation.rest.length === 1) {
          delete out.maxItems;
          const rest = recur(representation.rest[0], [...path, "rest", 0], dependencies);
          if (Object.keys(rest).length > 0)
            out.items = rest;
          else
            delete out.items;
        }
        return out;
      }
      case "Objects": {
        if (representation.propertySignatures.length === 0 && representation.indexSignatures.length === 0) {
          return {
            not: {
              type: "null"
            }
          };
        }
        const out = {
          type: "object"
        };
        const properties = {};
        const required = [];
        for (let index = 0;index < representation.propertySignatures.length; index++) {
          const property = representation.propertySignatures[index];
          if (typeof property.name !== "string") {
            throw errorWithPath("Invalid schema representation document", [...path, "propertySignatures", index, "name"]);
          }
          const name = property.name;
          const schema = recur(property.type, [...path, "propertySignatures", index, "type"], dependencies);
          const annotations = collectJsonSchemaAnnotations(property.annotations, options);
          assignProperty(properties, name, annotations === undefined ? schema : registerPendingOneOf(appendJsonSchema(schema, annotations)));
          if (!property.isOptional)
            required.push(name);
        }
        if (representation.propertySignatures.length > 0)
          out.properties = properties;
        if (required.length > 0)
          out.required = required;
        const patternProperties = {};
        const additionalPropertySchemas = [];
        const indexValueSchemas = [];
        let hasUnrepresentableIndexPattern = false;
        for (let index = 0;index < representation.indexSignatures.length; index++) {
          const signature = representation.indexSignatures[index];
          let type = recur(signature.type, [...path, "indexSignatures", index, "type"], dependencies);
          if (equals(type, {
            not: {}
          }))
            type = false;
          indexValueSchemas.push(type);
          const patterns = getParameterPatterns(signature.parameter, [...path, "indexSignatures", index, "parameter"], new Set);
          if (patterns === undefined) {
            hasUnrepresentableIndexPattern = true;
            dependencies.push(false);
            continue;
          }
          if (patterns.length === 0) {
            additionalPropertySchemas.push(type);
          } else {
            for (const pattern of patterns) {
              const previous = patternProperties[pattern];
              assignProperty(patternProperties, pattern, previous === undefined ? type : previous === false || type === false ? false : registerPendingOneOf(appendJsonSchema(previous, type)));
            }
          }
        }
        const hasPatternProperties = Object.keys(patternProperties).length > 0;
        if (hasPatternProperties) {
          out.patternProperties = patternProperties;
        }
        if (hasUnrepresentableIndexPattern && options?.onExcessProperty === "error") {
          const propertyNames = [];
          if (representation.propertySignatures.length > 0) {
            propertyNames.push({
              enum: Object.keys(properties)
            });
          }
          for (let index = 0;index < representation.indexSignatures.length; index++) {
            propertyNames.push(recur(representation.indexSignatures[index].parameter, [...path, "indexSignatures", index, "parameter"], dependencies));
          }
          out.propertyNames = propertyNames.length === 1 ? propertyNames[0] : {
            anyOf: propertyNames
          };
          out.additionalProperties = indexValueSchemas.length === 1 ? indexValueSchemas[0] : {
            anyOf: indexValueSchemas
          };
          if (additionalPropertySchemas.length > 0) {
            out.allOf = additionalPropertySchemas.map((type) => ({
              type: "object",
              additionalProperties: type
            }));
          }
        } else if (additionalPropertySchemas.length === 0) {
          out.additionalProperties = hasUnrepresentableIndexPattern || options?.onExcessProperty !== "error";
        } else if (additionalPropertySchemas.length === 1 && representation.propertySignatures.length === 0 && !hasPatternProperties) {
          out.additionalProperties = additionalPropertySchemas[0];
        } else if (additionalPropertySchemas.length > 0) {
          out.allOf = additionalPropertySchemas.map((type) => ({
            type: "object",
            additionalProperties: type
          }));
        }
        if (typeof out.additionalProperties === "object" && out.additionalProperties !== null && Object.keys(out.additionalProperties).length === 0) {
          delete out.additionalProperties;
        }
        return out;
      }
      case "Union": {
        const branches = [];
        const types = representation.types.map((type, index) => recur(type, [...path, "types", index], branches));
        dependencies.push(branches);
        if (types.length === 0)
          return {
            not: {}
          };
        const mode = representation.options?.mode ?? "anyOf";
        if (mode === "anyOf" && types.length > 1) {
          const compacted = compactEnums(types);
          if (compacted !== undefined)
            return compacted;
        }
        if (mode === "oneOf")
          pendingOneOf.set(types, [branches, []]);
        return {
          [mode]: types
        };
      }
    }
  }
  function getParameterPatterns(parameter, path, seenReferences) {
    switch (parameter._tag) {
      case "Reference": {
        if (!Object.hasOwn(references, parameter.$ref)) {
          throw errorWithPath(`Invalid reference ${parameter.$ref}`, [...path, "$ref"]);
        }
        compileDefinition(parameter.$ref, path);
        if (seenReferences.has(parameter.$ref))
          return;
        const next = new Set(seenReferences).add(parameter.$ref);
        return getParameterPatterns(references[parameter.$ref], ["references", parameter.$ref], next);
      }
      case "String": {
        if (parameter.checks.length === 0)
          return [];
        if (parameter.checks.length !== 1 || parameter.checks[0]._tag !== "Filter" || parameter.checks[0].annotations?.toJsonSchema === undefined) {
          return;
        }
        const dependencies = [];
        const schema = recur(parameter, path, dependencies);
        if (!isExact(dependencies))
          return;
        return schema.type === "string" && typeof schema.pattern === "string" && hasOnlyKeywords(schema, "|type|pattern|title|description|default|examples|readOnly|writeOnly|") ? [schema.pattern] : undefined;
      }
      case "TemplateLiteral":
        return parameter.checks.length === 0 ? [`^${parameter.parts.map(getPartPattern).join("")}$`] : undefined;
      case "Union": {
        if (parameter.types.length === 0 || parameter.checks.length > 0 || parameter.options?.mode === "oneOf") {
          return;
        }
        const patterns = [];
        for (let index = 0;index < parameter.types.length; index++) {
          const memberPatterns = getParameterPatterns(parameter.types[index], [...path, "types", index], seenReferences);
          if (memberPatterns === undefined)
            return;
          if (memberPatterns.length === 0)
            return [];
          patterns.push(...memberPatterns);
        }
        return patterns;
      }
      default:
        throw errorWithPath("Invalid schema representation document", path);
    }
  }
}
function isJsonSchemaType(input) {
  return input === "string" || input === "number" || input === "boolean" || input === "array" || input === "object" || input === "null" || input === "integer";
}
function compactEnums(schemas) {
  let sharedType = undefined;
  const values = [];
  for (const schema of schemas) {
    const keys = Object.keys(schema);
    if (keys.length !== 2 || schema.type === undefined || !Array.isArray(schema.enum) || schema.enum.length === 0) {
      return;
    }
    if (sharedType === undefined)
      sharedType = schema.type;
    else if (schema.type !== sharedType)
      return;
    for (const value of schema.enum) {
      if (values.includes(value))
        return;
      values.push(value);
    }
  }
  return {
    type: sharedType,
    enum: values
  };
}
function getPartPattern(part) {
  switch (part._tag) {
    case "Literal":
      return escape(globalThis.String(part.literal));
    case "String":
      return STRING_PATTERN;
    case "Number":
      return FINITE_PATTERN;
    case "TemplateLiteral":
      return part.parts.map(getPartPattern).join("");
    case "Union":
      return `(?:${part.types.map(getPartPattern).join("|")})`;
    default:
      throw errorWithPath("Invalid schema representation document", []);
  }
}
function toJsonSchemaDocument(document, options) {
  const output = compileJsonSchema([document.representation], [["representation"]], document.references, options);
  return {
    dialect: output.dialect,
    schema: output.schemas[0],
    definitions: output.definitions
  };
}

// ../node_modules/effect/dist/internal/schema/toRepresentation.js
var defaultReferencePolicy = ({
  identifier
}) => identifier;
function annotationsField(annotations) {
  return annotations === undefined ? undefined : {
    annotations
  };
}
function toRepresentation(ast, options) {
  const {
    references,
    representations
  } = toRepresentations([ast], options);
  return {
    representation: representations[0],
    references
  };
}
function toRepresentations(asts, options) {
  const references = {};
  const referenceOwners = new Map;
  const buildingReferences = new Set;
  const candidates = new Map;
  const visitingCandidates = new Set;
  for (const ast of asts)
    visit(ast);
  const referencePolicy = options?.referencePolicy ?? defaultReferencePolicy;
  for (const candidatesByIdentifier of candidates.values()) {
    for (const candidate of candidatesByIdentifier.values()) {
      const requestedReference = referencePolicy({
        ast: candidate.ast,
        occurrences: candidate.occurrences,
        identifier: candidate.identifier
      });
      if (requestedReference !== undefined) {
        const separator = requestedReference === candidate.identifier || !requestedReference.endsWith("_") ? "_" : "";
        candidate.reference = getReference(requestedReference, candidate, separator);
      } else if (candidate.isRecursive) {
        candidate.reference = getReference(`${candidate.ast._tag}_`, candidate, "");
      }
    }
  }
  const representations = map(asts, (ast) => recur(ast));
  return {
    representations,
    references
  };
  function getReference(prefix, owner, separator = "_") {
    let candidate = prefix;
    let suffix = 0;
    while (referenceOwners.has(candidate)) {
      if (referenceOwners.get(candidate) === owner)
        return candidate;
      candidate = `${prefix}${separator}${++suffix}`;
    }
    referenceOwners.set(candidate, owner);
    return candidate;
  }
  function annotateReference(ast, candidate, reference) {
    const fallback = candidate.fallback;
    if (fallback !== undefined) {
      return resolveIdentifierFallback(ast) === fallback ? ast : annotate(ast, {
        [IDENTIFIER_FALLBACK_KEY]: fallback
      });
    }
    return reference === candidate.identifier ? ast : annotate(ast, {
      identifier: reference
    });
  }
  function makeReference(reference, ast) {
    if (!Object.hasOwn(references, reference) && !buildingReferences.has(reference)) {
      buildingReferences.add(reference);
      const representation = on(ast);
      buildingReferences.delete(reference);
      assignProperty(references, reference, representation);
    }
    return {
      _tag: "Reference",
      $ref: reference
    };
  }
  function getCandidate(input) {
    const ast = getLastEncoding(input);
    const owner = getContextOwner(ast);
    let identifier = resolveIdentifier(ast);
    const fallback = identifier === undefined ? (ast !== input ? resolveIdentifier(input) : undefined) ?? resolveIdentifierFallback(ast) : undefined;
    if (fallback !== undefined)
      identifier = `${fallback}Encoded`;
    let candidatesByIdentifier = candidates.get(owner);
    if (candidatesByIdentifier === undefined) {
      candidatesByIdentifier = new Map;
      candidates.set(owner, candidatesByIdentifier);
    }
    let candidate = candidatesByIdentifier.get(identifier);
    if (candidate === undefined) {
      candidate = {
        ast: owner,
        identifier,
        fallback,
        occurrences: 0,
        isRecursive: false,
        reference: undefined
      };
      candidatesByIdentifier.set(identifier, candidate);
    }
    return candidate;
  }
  function visit(input) {
    const candidate = getCandidate(input);
    const ast = candidate.ast;
    candidate.occurrences++;
    if (visitingCandidates.has(candidate)) {
      candidate.isRecursive = true;
      return;
    }
    if (candidate.occurrences > 1)
      return;
    visitingCandidates.add(candidate);
    visitChecks(ast.checks);
    switch (ast._tag) {
      case "Declaration":
      case "Arrays":
      case "Objects":
      case "Union":
        ast.recur((child) => {
          visit(child);
          return child;
        });
        break;
      case "TemplateLiteral":
        ast.parts.forEach(visit);
        break;
      case "Suspend":
        visit(ast.thunk());
        break;
    }
    visitingCandidates.delete(candidate);
  }
  function visitChecks(checks) {
    checks?.forEach((check) => {
      check.annotations?.representation?.schemas?.forEach((schema) => visit(toType(schema)));
      if (check._tag === "FilterGroup")
        visitChecks(check.checks);
    });
  }
  function recur(input) {
    const candidate = getCandidate(input);
    const ast = candidate.ast;
    const reference = candidate.reference;
    if (reference !== undefined) {
      const annotated = candidate.identifier === undefined ? ast : annotateReference(ast, candidate, reference);
      return makeReference(reference, annotated);
    }
    return on(ast);
  }
  function on(ast) {
    const checks = fromChecks(ast.checks);
    switch (ast._tag) {
      case "Declaration":
        return {
          _tag: "Declaration",
          typeParameters: ast.typeParameters.map((ast) => recur(ast)),
          checks,
          ...fromDeclarationAnnotations(ast.annotations)
        };
      case "Null":
      case "Undefined":
      case "Void":
      case "Never":
      case "Unknown":
      case "Any":
      case "String":
      case "Boolean":
      case "Number":
      case "BigInt":
      case "Symbol":
      case "ObjectKeyword":
        return {
          _tag: ast._tag,
          checks,
          ...annotationsField(ast.annotations)
        };
      case "Literal":
        return {
          _tag: "Literal",
          literal: ast.literal,
          checks,
          ...annotationsField(ast.annotations)
        };
      case "UniqueSymbol":
        return {
          _tag: "UniqueSymbol",
          symbol: ast.symbol,
          checks,
          ...annotationsField(ast.annotations)
        };
      case "Enum":
        return {
          _tag: "Enum",
          enums: ast.enums,
          checks,
          ...annotationsField(ast.annotations)
        };
      case "TemplateLiteral":
        return {
          _tag: "TemplateLiteral",
          parts: ast.parts.map((ast) => recur(ast)),
          checks,
          ...annotationsField(ast.annotations)
        };
      case "Arrays":
        return {
          _tag: "Arrays",
          elements: ast.elements.map((element) => {
            const projected = getLastEncoding(element);
            const annotations = projected.context?.annotations;
            return {
              isOptional: isOptional(projected),
              type: recur(element),
              ...annotationsField(annotations)
            };
          }),
          rest: ast.rest.map((ast) => recur(ast)),
          checks,
          ...annotationsField(ast.annotations)
        };
      case "Objects":
        return {
          _tag: "Objects",
          propertySignatures: ast.propertySignatures.map((property) => {
            const projected = getLastEncoding(property.type);
            const annotations = projected.context?.annotations;
            return {
              name: property.name,
              type: recur(property.type),
              isOptional: isOptional(projected),
              isMutable: isMutable(projected),
              ...annotationsField(annotations)
            };
          }),
          indexSignatures: ast.indexSignatures.map((index) => ({
            parameter: recur(index.parameter),
            type: recur(index.type)
          })),
          checks,
          ...annotationsField(ast.annotations)
        };
      case "Union":
        return {
          _tag: "Union",
          types: ast.types.map((ast) => recur(ast)),
          ...ast.options === undefined ? {} : {
            options: ast.options
          },
          checks,
          ...annotationsField(ast.annotations)
        };
      case "Suspend":
        return {
          _tag: "Suspend",
          checks: [],
          thunk: recur(ast.thunk()),
          ...annotationsField(ast.annotations)
        };
    }
  }
  function fromChecks(checks) {
    return checks?.map(fromCheck) ?? [];
  }
  function fromCheck(check) {
    switch (check._tag) {
      case "Filter":
        return {
          _tag: "Filter",
          aborted: check.aborted,
          ...fromCheckAnnotations(check.annotations)
        };
      case "FilterGroup":
        return {
          _tag: "FilterGroup",
          checks: map(check.checks, fromCheck),
          ...fromCheckAnnotations(check.annotations)
        };
    }
  }
  function fromDeclarationAnnotations(annotations) {
    if (annotations === undefined)
      return;
    const {
      representation,
      ...ordinary
    } = annotations;
    return {
      ...representation === undefined ? undefined : {
        representation
      },
      ...Object.keys(ordinary).length === 0 ? undefined : {
        annotations: ordinary
      }
    };
  }
  function fromCheckAnnotations(annotations) {
    if (annotations === undefined)
      return;
    const {
      representation,
      ...ordinary
    } = annotations;
    const projected = representation === undefined ? undefined : representation.schemas === undefined ? representation : {
      ...representation,
      schemas: representation.schemas.map((schema) => recur(toType(schema)))
    };
    return {
      ...projected === undefined ? undefined : {
        representation: projected
      },
      ...Object.keys(ordinary).length === 0 ? undefined : {
        annotations: ordinary
      }
    };
  }
}

// ../node_modules/effect/dist/Struct.js
var lambda = (f) => f;

// ../node_modules/effect/dist/internal/schemaError.js
var SchemaErrorTypeId = "~effect/Schema/SchemaError";
function isSchemaError(u) {
  return hasProperty(u, SchemaErrorTypeId) && u[SchemaErrorTypeId] === SchemaErrorTypeId;
}

// ../node_modules/effect/dist/Schema.js
var TypeId10 = TypeId9;
function declareConstructor() {
  return (typeParameters, run, annotations) => {
    return make7(new Declaration(typeParameters.map(getAST), (typeParameters) => run(typeParameters.map((ast) => make7(ast))), annotations));
  };
}
function declare(is, annotations) {
  return declareConstructor()([], () => (input, ast, options) => is(input) ? succeed5(input) : fail5(new InvalidType(ast, input, options)), annotations);
}
class SchemaError extends (/* @__PURE__ */ TaggedError2("SchemaError")) {
  [SchemaErrorTypeId] = SchemaErrorTypeId;
  constructor(issue) {
    const stackTraceLimit = getStackTraceLimit();
    setStackTraceLimit(0);
    try {
      super({
        issue
      });
    } finally {
      setStackTraceLimit(stackTraceLimit);
    }
  }
  get message() {
    return defaultFormatter(this.issue);
  }
  toString() {
    return `SchemaError(${this.message})`;
  }
}
function isSchemaError2(u) {
  return isSchemaError(u);
}
function fromIssueEffect(self) {
  if (effectIsExit(self)) {
    return fromIssueExit(self);
  }
  return catchCause2(self, (cause) => failCauseSync2(() => map3(cause, (issue) => new SchemaError(issue))));
}
function fromIssueExit(exit) {
  return isSuccess3(exit) ? exit : failCause2(map3(exit.cause, (issue) => new SchemaError(issue)));
}
function getSchemaErrorOrThrow(cause, message) {
  let schemaError;
  for (const reason of cause.reasons) {
    if (!isFailReason2(reason) || !isSchemaError2(reason.error)) {
      throw new globalThis.Error(message, {
        cause
      });
    }
    schemaError ??= reason.error;
  }
  if (schemaError === undefined) {
    throw new globalThis.Error(message, {
      cause
    });
  }
  return schemaError;
}
function runSchemaErrorSync(self) {
  const exit = runSyncExit2(self);
  if (isSuccess3(exit)) {
    return exit.value;
  }
  throw getSchemaErrorOrThrow(exit.cause, "Sync adapter can only throw schema errors");
}
function decodeUnknownEffect2(schema, options) {
  const parser = decodeUnknownEffect(schema, options);
  return (input, options) => {
    return fromIssueEffect(parser(input, options));
  };
}
var decodeUnknownOption2 = decodeUnknownOption;
function decodeUnknownSync(schema, options) {
  const parser = decodeUnknownEffect2(schema, options);
  return (input, options) => {
    return runSchemaErrorSync(parser(input, options));
  };
}
var make7 = make6;
function isSchema(u) {
  return hasProperty(u, TypeId10) && u[TypeId10] === TypeId10;
}
var optionalKey2 = /* @__PURE__ */ lambda((schema) => make7(optionalKey(schema.ast), {
  schema
}));
var toType2 = /* @__PURE__ */ lambda((schema) => make7(toType(schema.ast), {
  schema
}));
function Literal2(literal) {
  const out = make7(new Literal(literal), {
    literal,
    transform(to) {
      return out.pipe(decodeTo2(Literal2(to), {
        decode: transform(() => to),
        encode: transform(() => literal)
      }));
    }
  });
  return out;
}
var Unknown2 = /* @__PURE__ */ make7(unknown);
var Null2 = /* @__PURE__ */ make7(null_);
var String4 = /* @__PURE__ */ make7(string2);
var Number5 = /* @__PURE__ */ make7(number2);
var Boolean3 = /* @__PURE__ */ make7(boolean);
function makeStruct(ast, fields) {
  return make7(ast, {
    fields,
    mapFields(f, options) {
      const fields = f(this.fields);
      return makeStruct(struct(fields, options?.unsafePreserveChecks ? this.ast.checks : undefined), fields);
    }
  });
}
function Struct(fields) {
  return makeStruct(struct(fields, undefined), fields);
}
function makeTuple(ast, elements) {
  return make7(ast, {
    elements,
    mapElements(f, options) {
      const elements = f(this.elements);
      return makeTuple(tuple(elements, options?.unsafePreserveChecks ? this.ast.checks : undefined), elements);
    }
  });
}
function Tuple(elements) {
  return makeTuple(tuple(elements), elements);
}
var ArraySchema = /* @__PURE__ */ lambda((schema) => make7(new Arrays(false, [], [schema.ast]), {
  value: schema
}));
function makeUnion(ast, members) {
  return make7(ast, {
    members,
    mapMembers(f, options) {
      const members = f(this.members);
      return makeUnion(union(members, this.ast.options, options?.unsafePreserveChecks ? this.ast.checks : undefined), members);
    }
  });
}
function Union2(members, options) {
  return makeUnion(union(members, options, undefined), members);
}
function Literals(literals) {
  const members = literals.map(Literal2);
  return make7(union(members, undefined, undefined), {
    literals,
    members,
    mapMembers(f) {
      return Union2(f(this.members));
    },
    pick(literals) {
      return Literals(literals);
    },
    transform(to) {
      return Union2(members.map((member, index) => member.transform(to[index])));
    }
  });
}
var NullOr = /* @__PURE__ */ lambda((self) => Union2([self, Null2]));
function decodeTo2(to, transformation) {
  return (from) => {
    return make7(decodeTo(from.ast, to.ast, transformation ? makeTransformation(transformation) : passthrough2()), {
      from,
      to
    });
  };
}
function withConstructorDefault2(defaultValue) {
  return (schema) => make7(withConstructorDefault(schema.ast, defaultValue), {
    schema
  });
}
function tag(literal) {
  return Literal2(literal).pipe(withConstructorDefault2(succeed5(literal)));
}
function TaggedStruct(value, fields) {
  return Struct({
    _tag: tag(value),
    ...fields
  });
}
function instanceOf(constructor, annotations) {
  return declare((u) => u instanceof constructor, annotations);
}
function link() {
  return (encodeTo, transformation) => {
    return new Link(encodeTo.ast, makeTransformation(transformation));
  };
}
var makeFilter2 = makeFilter;
function isPattern2(regExp, annotations) {
  const source = regExp.source;
  const flags = regExp.flags;
  const canExport = /^[dg]*uy?$/.test(flags);
  const runtimeRegExp = flags === "" ? `new RegExp(${format(source)})` : `new RegExp(${format(source)}, ${format(flags)})`;
  return isPattern(regExp, {
    toJsonSchema: () => canExport ? {
      pattern: flags.endsWith("y") ? `^(?:${source})` : source
    } : [{}, true],
    toCode: () => ({
      runtime: `Schema.isPattern(${runtimeRegExp})`
    }),
    ...annotations
  });
}
function isBase64(annotations) {
  const regExp = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  return isPattern2(regExp, {
    expected: "a base64 encoded string",
    representation: {
      id: "effect/schema/isBase64",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: "Schema.isBase64()"
    }),
    ...annotations
  });
}
function makeIsGreaterThan(options) {
  const gt = isGreaterThan(options.order);
  const formatter = options.formatter ?? format;
  return (exclusiveMinimum, annotations) => {
    return makeFilter2((input) => gt(input, exclusiveMinimum), {
      expected: `a value greater than ${formatter(exclusiveMinimum)}`,
      arbitraryConstraint: {
        order: options.order,
        minimum: exclusiveMinimum,
        exclusiveMinimum: true
      },
      ...options.annotate?.(exclusiveMinimum),
      ...annotations
    });
  };
}
function makeIsGreaterThanOrEqualTo(options) {
  const gte = isGreaterThanOrEqualTo(options.order);
  const formatter = options.formatter ?? format;
  return (minimum, annotations) => {
    return makeFilter2((input) => gte(input, minimum), {
      expected: `a value greater than or equal to ${formatter(minimum)}`,
      arbitraryConstraint: {
        order: options.order,
        minimum
      },
      ...options.annotate?.(minimum),
      ...annotations
    });
  };
}
function encodeNumberPayload(number) {
  if (!globalThis.Number.isFinite(number)) {
    throw new globalThis.RangeError(`Expected a finite number, got ${format(number)}`);
  }
  return number;
}
var isGreaterThan2 = /* @__PURE__ */ makeIsGreaterThan({
  order: Number2,
  annotate: (exclusiveMinimum) => ({
    representation: {
      id: "effect/schema/isGreaterThan",
      payload: {
        exclusiveMinimum: encodeNumberPayload(exclusiveMinimum)
      }
    },
    toJsonSchema: () => ({
      exclusiveMinimum
    }),
    toCode: () => ({
      runtime: `Schema.isGreaterThan(${format(exclusiveMinimum)})`
    })
  })
});
var isGreaterThanOrEqualTo2 = /* @__PURE__ */ makeIsGreaterThanOrEqualTo({
  order: Number2,
  annotate: (minimum) => ({
    representation: {
      id: "effect/schema/isGreaterThanOrEqualTo",
      payload: {
        minimum: encodeNumberPayload(minimum)
      }
    },
    toJsonSchema: () => ({
      minimum
    }),
    toCode: () => ({
      runtime: `Schema.isGreaterThanOrEqualTo(${format(minimum)})`
    })
  })
});
function isInt(annotations) {
  return makeFilter2((n) => globalThis.Number.isSafeInteger(n), {
    expected: "an integer",
    representation: {
      id: "effect/schema/isInt",
      payload: null
    },
    toJsonSchema: () => [{
      type: "integer"
    }, true],
    toCode: () => ({
      runtime: "Schema.isInt()"
    }),
    arbitraryConstraint: {
      number: "integer"
    },
    ...annotations
  });
}
var Int = /* @__PURE__ */ Number5.check(/* @__PURE__ */ isInt());
var getErrorOptionsKey = (options) => (options?.includeStack === true ? 1 : 0) | (options?.excludeCause === true ? 2 : 0);
var getErrorOptions = (key) => {
  switch (key) {
    case 0:
      return;
    case 1:
      return {
        includeStack: true
      };
    case 2:
      return {
        excludeCause: true
      };
    case 3:
      return {
        includeStack: true,
        excludeCause: true
      };
  }
};
var defectSchemaCache = [];
function Defect(options) {
  const key = getErrorOptionsKey(options);
  const cached = defectSchemaCache[key];
  if (cached !== undefined) {
    return cached;
  }
  const schema = Json2.pipe(decodeTo2(Unknown2, defectFromJson(getErrorOptions(key))));
  defectSchemaCache[key] = schema;
  return schema;
}
var RegExp3 = /* @__PURE__ */ instanceOf(globalThis.RegExp, {
  representation: {
    id: "effect/schema/RegExp",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.RegExp`,
    Type: `globalThis.RegExp`
  }),
  expected: "RegExp",
  toCodecJson: () => link()(Struct({
    source: String4,
    flags: String4
  }), transformEffect2({
    decode: (e, options) => try_2({
      try: () => new globalThis.RegExp(e.source, e.flags),
      catch: () => new InvalidValue({
        expected: "valid RegExp source and flags"
      }, e, options)
    }),
    encode: (regExp) => succeed5({
      source: regExp.source,
      flags: regExp.flags
    })
  }))
});
var URLString = /* @__PURE__ */ String4.annotate({
  expected: "a string that will be decoded as a URL"
});
var URL2 = /* @__PURE__ */ instanceOf(globalThis.URL, {
  representation: {
    id: "effect/schema/URL",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.URL`,
    Type: `globalThis.URL`
  }),
  expected: "URL",
  toCodecJson: () => link()(URLString, urlFromString)
});
var JsonString = /* @__PURE__ */ String4.annotate({
  expected: "a string that will be decoded as JSON",
  contentMediaType: "application/json"
});
function fromJsonString2(schema, options) {
  return JsonString.pipe(decodeTo2(schema, fromJsonString(options)));
}
var File = /* @__PURE__ */ instanceOf(globalThis.File, {
  representation: {
    id: "effect/schema/File",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.File`,
    Type: `globalThis.File`
  }),
  expected: "File",
  toCodecJson: () => link()(Struct({
    data: String4.check(isBase64()),
    type: String4,
    name: String4,
    lastModified: Int
  }), transformEffect2({
    decode: (e, options) => match(decode(e.data), {
      onFailure: () => fail5(new InvalidValue({
        expected: "a valid Base64 string"
      }, e.data, options)),
      onSuccess: (bytes) => {
        const buffer = new globalThis.Uint8Array(bytes);
        return succeed5(new globalThis.File([buffer], e.name, {
          type: e.type,
          lastModified: e.lastModified
        }));
      }
    }),
    encode: (file, options) => tryPromise2({
      try: async () => {
        const bytes = new globalThis.Uint8Array(await file.arrayBuffer());
        return {
          data: encode(bytes),
          type: file.type,
          name: file.name,
          lastModified: file.lastModified
        };
      },
      catch: () => new InvalidValue({
        expected: "a readable File"
      }, file, options)
    })
  }))
});
var FormData2 = /* @__PURE__ */ instanceOf(globalThis.FormData, {
  representation: {
    id: "effect/schema/FormData",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.FormData`,
    Type: `globalThis.FormData`
  }),
  expected: "FormData",
  toCodecJson: () => link()(ArraySchema(Tuple([String4, Union2([Struct({
    _tag: tag("String"),
    value: String4
  }), Struct({
    _tag: tag("File"),
    value: File
  })])])), transformEffect2({
    decode: (e) => {
      const out = new globalThis.FormData;
      for (const [key, entry] of e) {
        out.append(key, entry.value);
      }
      return succeed5(out);
    },
    encode: (formData) => {
      return succeed5(globalThis.Array.from(formData.entries()).map(([key, value]) => {
        if (typeof value === "string") {
          return [key, {
            _tag: "String",
            value
          }];
        } else {
          return [key, {
            _tag: "File",
            value
          }];
        }
      }));
    }
  }))
});
var URLSearchParams2 = /* @__PURE__ */ instanceOf(globalThis.URLSearchParams, {
  representation: {
    id: "effect/schema/URLSearchParams",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.URLSearchParams`,
    Type: `globalThis.URLSearchParams`
  }),
  expected: "URLSearchParams",
  toCodecJson: () => link()(String4.annotate({
    expected: "a query string that will be decoded as URLSearchParams"
  }), transform2({
    decode: (e) => new globalThis.URLSearchParams(e),
    encode: (params) => params.toString()
  }))
});
var Base64String = /* @__PURE__ */ String4.annotate({
  expected: "a base64 encoded string that will be decoded as Uint8Array",
  format: "byte",
  contentEncoding: "base64"
});
var Uint8Array2 = /* @__PURE__ */ instanceOf(globalThis.Uint8Array, {
  representation: {
    id: "effect/schema/Uint8Array",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.Uint8Array`,
    Type: `globalThis.Uint8Array`
  }),
  expected: "Uint8Array",
  toCodecJson: () => link()(Base64String, uint8ArrayFromBase64String)
});
var arbitraryMinimumDateTimestamp = -8640000000000000;
var arbitraryMaximumDateTimestamp = 8640000000000000;
var arbitraryMinimumZonedDateTimeTimestamp = arbitraryMinimumDateTimestamp + 14 * 60 * 60 * 1000;
var arbitraryMaximumZonedDateTimeTimestamp = arbitraryMaximumDateTimestamp - 14 * 60 * 60 * 1000;
var arbitraryMinimumTimeZoneOffset = -12 * 60 * 60 * 1000;
var arbitraryMaximumTimeZoneOffset = 14 * 60 * 60 * 1000;
var immerable = /* @__PURE__ */ globalThis.Symbol.for("immer-draftable");
var payloadToken = {};
function makeClass(Inherited, identifier, struct2, annotations, proto) {
  const getClassSchema = getClassSchemaFactory(struct2, identifier, annotations);
  const ClassTypeId = getClassTypeId(identifier);
  const out = class extends Inherited {
    constructor(...[input, options]) {
      const internalOptions = options;
      const payload = internalOptions?.["~payload"];
      const value = payload?.token === payloadToken ? payload.value : struct2.make(input ?? {}, options);
      super(value, {
        ...options,
        disableChecks: true,
        "~payload": {
          token: payloadToken,
          value
        }
      });
    }
    static [TypeId10] = TypeId10;
    get [ClassTypeId]() {
      return ClassTypeId;
    }
    static [immerable] = true;
    static identifier = identifier;
    static fields = struct2.fields;
    static get ast() {
      return getClassSchema(this).ast;
    }
    static pipe() {
      return pipeArguments(this, arguments);
    }
    static rebuild(ast) {
      return getClassSchema(this).rebuild(ast);
    }
    static make(input, options) {
      return make5(getClassSchema(this))(input ?? {}, options);
    }
    static makeOption(input, options) {
      return makeOption(getClassSchema(this))(input ?? {}, options);
    }
    static makeEffect(input, options) {
      return getClassSchema(this).makeEffect(input ?? {}, options);
    }
    static annotate(annotations) {
      return this.rebuild(annotate(this.ast, annotations));
    }
    static annotateKey(annotations) {
      return this.rebuild(annotateKey(this.ast, annotations));
    }
    static check(...checks) {
      return this.rebuild(appendChecks(this.ast, checks));
    }
    static extend(identifier2) {
      return (schema, annotations) => {
        const extension = isStruct(schema) ? schema : Struct(schema);
        const fields = {
          ...struct2.fields,
          ...extension.fields
        };
        const ast = struct(fields, struct2.ast.checks, {
          identifier: identifier2
        });
        return makeClass(this, identifier2, makeStruct(appendChecks(ast, extension.ast.checks), fields), annotations, proto);
      };
    }
    static mapFields(f, options) {
      return struct2.mapFields(f, options);
    }
  };
  if (proto !== undefined) {
    Object.assign(out.prototype, proto(identifier));
  }
  return out;
}
function getClassTransformation(self) {
  return new Transformation(transform((input) => new self(input, {
    "~payload": {
      token: payloadToken,
      value: input
    }
  })), passthrough());
}
function getClassTypeId(identifier) {
  return `~effect/Schema/Class/${identifier}`;
}
function getClassSchemaFactory(from, identifier, annotations) {
  let memo;
  return (self) => {
    if (memo !== undefined) {
      return memo;
    }
    const ClassTypeId = getClassTypeId(identifier);
    const isClassValue = (input) => input instanceof self || hasProperty(input, ClassTypeId);
    const transformation = getClassTransformation(self);
    const to = make7(new Declaration([from.ast], () => (input, ast, options) => {
      return isClassValue(input) ? succeed5(input) : fail5(new InvalidType(ast, input, options));
    }, {
      identifier,
      [CONSTRUCTOR_ANNOTATION_KEY]: ([from]) => ({
        isConstructed: isClassValue,
        link: new Link(from, transformation)
      }),
      toCodec: ([from]) => new Link(from.ast, transformation),
      toEquivalence: ([from]) => from,
      toFormatter: ([from]) => (t) => `${self.identifier}(${from(t)})`,
      [SENTINELS_ANNOTATION_KEY]: collectSentinels(from.ast),
      ...annotations
    }));
    return memo = decodeTo2(to, transformation)(from);
  };
}
function isStruct(schema) {
  return isSchema(schema);
}
var Error3 = (identifier) => (schema, annotations) => {
  const struct = isStruct(schema) ? schema : Struct(schema);
  const self = makeClass(Error2, identifier, struct, annotations, (identifier) => ({
    name: identifier
  }));
  return self;
};
var TaggedError3 = (identifier) => {
  return (tagValue, schema, annotations) => {
    const struct = isStruct(schema) ? schema.mapFields((fields) => ({
      _tag: tag(tagValue),
      ...fields
    }), {
      unsafePreserveChecks: true
    }) : TaggedStruct(tagValue, schema);
    return Error3(identifier ?? tagValue)(struct, annotations);
  };
};
function toJsonSchemaDocument2(schema, options) {
  const document = toRepresentation(toCodecJsonAST(schema.ast), options);
  return toJsonSchemaDocument(document, options);
}
var Json2 = /* @__PURE__ */ make7(/* @__PURE__ */ annotate(Json, {
  toCode: () => ({
    runtime: "Schema.Json",
    Type: "Schema.Json"
  })
}));
// ../node_modules/effect/dist/Fiber.js
var await_ = fiberAwait;
var interruptAll = fiberInterruptAll;
// ../node_modules/acorn/dist/acorn.mjs
var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 7, 9, 32, 4, 318, 1, 80, 3, 71, 10, 50, 3, 123, 2, 54, 14, 32, 10, 3, 1, 11, 3, 46, 10, 8, 0, 46, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 3, 0, 158, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 68, 8, 2, 0, 3, 0, 2, 3, 2, 4, 2, 0, 15, 1, 83, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 7, 19, 58, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 343, 9, 54, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 330, 3, 10, 1, 2, 0, 49, 6, 4, 4, 14, 10, 5350, 0, 7, 14, 11465, 27, 2343, 9, 87, 9, 39, 4, 60, 6, 26, 9, 535, 9, 470, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 4178, 9, 519, 45, 3, 22, 543, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 101, 0, 161, 6, 10, 9, 357, 0, 62, 13, 499, 13, 245, 1, 2, 9, 726, 6, 110, 6, 6, 9, 4759, 9, 787719, 239];
var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 13, 10, 2, 14, 2, 6, 2, 1, 2, 10, 2, 14, 2, 6, 2, 1, 4, 51, 13, 310, 10, 21, 11, 7, 25, 5, 2, 41, 2, 8, 70, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 39, 27, 10, 22, 251, 41, 7, 1, 17, 2, 60, 28, 11, 0, 9, 21, 43, 17, 47, 20, 28, 22, 13, 52, 58, 1, 3, 0, 14, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 20, 1, 64, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 31, 9, 2, 0, 3, 0, 2, 37, 2, 0, 26, 0, 2, 0, 45, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 38, 6, 186, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 19, 72, 200, 32, 32, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 328, 18, 16, 0, 2, 12, 2, 33, 125, 0, 80, 921, 103, 110, 18, 195, 2637, 96, 16, 1071, 18, 5, 26, 3994, 6, 582, 6842, 29, 1763, 568, 8, 30, 18, 78, 18, 29, 19, 47, 17, 3, 32, 20, 6, 18, 433, 44, 212, 63, 129, 74, 6, 0, 67, 12, 65, 1, 2, 0, 29, 6135, 9, 1237, 42, 9, 8936, 3, 2, 6, 2, 1, 2, 290, 16, 0, 30, 2, 3, 0, 15, 3, 9, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 1845, 30, 7, 5, 262, 61, 147, 44, 11, 6, 17, 0, 322, 29, 19, 43, 485, 27, 229, 29, 3, 0, 496, 6, 2, 3, 2, 1, 2, 14, 2, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42719, 33, 4153, 7, 221, 3, 5761, 15, 7472, 16, 621, 2467, 541, 1507, 4938, 6, 4191];
var nonASCIIidentifierChars = "‌‍·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߽߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛ࢗ-࢟࣊-ࣣ࣡-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯৾ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ૺ-૿ଁ-ଃ଼ା-ୄେୈୋ-୍୕-ୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఄ఼ా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ೳഀ-ഃ഻഼ാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ඁ-ඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ຼ່-໎໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜕ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠏-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᪿ-ᫎᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭᳴᳷-᳹᷀-᷿‌‍‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯・꘠-꘩꙯ꙴ-꙽ꚞꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧ꠬ꢀꢁꢴ-ꣅ꣐-꣙꣠-꣱ꣿ-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︯︳︴﹍-﹏０-９＿･";
var nonASCIIidentifierStartChars = "ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙՠ-ֈא-תׯ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࡠ-ࡪࡰ-ࢇࢉ-ࢎࢠ-ࣉऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱৼਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡૹଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘ-ౚౝౠౡಀಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೝೞೠೡೱೲഄ-ഌഎ-ഐഒ-ഺഽൎൔ-ൖൟ-ൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄຆ-ຊຌ-ຣລວ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜑᜟ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡸᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭌᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᲀ-ᲊᲐ-ᲺᲽ-Ჿᳩ-ᳬᳮ-ᳳᳵᳶᳺᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄯㄱ-ㆎㆠ-ㆿㇰ-ㇿ㐀-䶿一-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꟍꟐꟑꟓꟕ-Ƛꟲ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꣽꣾꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭩꭰ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ";
var reservedWords = {
  3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
  5: "class enum extends super const export import",
  6: "enum",
  strict: "implements interface let package private protected public static yield",
  strictBind: "eval arguments"
};
var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";
var keywords$1 = {
  5: ecma5AndLessKeywords,
  "5module": ecma5AndLessKeywords + " export import",
  6: ecma5AndLessKeywords + " const class extends export import super"
};
var keywordRelationalOperator = /^in(stanceof)?$/;
var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
function isInAstralSet(code, set) {
  var pos = 65536;
  for (var i = 0;i < set.length; i += 2) {
    pos += set[i];
    if (pos > code) {
      return false;
    }
    pos += set[i + 1];
    if (pos >= code) {
      return true;
    }
  }
  return false;
}
function isIdentifierStart(code, astral) {
  if (code < 65) {
    return code === 36;
  }
  if (code < 91) {
    return true;
  }
  if (code < 97) {
    return code === 95;
  }
  if (code < 123) {
    return true;
  }
  if (code <= 65535) {
    return code >= 170 && nonASCIIidentifierStart.test(String.fromCharCode(code));
  }
  if (astral === false) {
    return false;
  }
  return isInAstralSet(code, astralIdentifierStartCodes);
}
function isIdentifierChar(code, astral) {
  if (code < 48) {
    return code === 36;
  }
  if (code < 58) {
    return true;
  }
  if (code < 65) {
    return false;
  }
  if (code < 91) {
    return true;
  }
  if (code < 97) {
    return code === 95;
  }
  if (code < 123) {
    return true;
  }
  if (code <= 65535) {
    return code >= 170 && nonASCIIidentifier.test(String.fromCharCode(code));
  }
  if (astral === false) {
    return false;
  }
  return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
}
var TokenType = function TokenType(label, conf) {
  if (conf === undefined)
    conf = {};
  this.label = label;
  this.keyword = conf.keyword;
  this.beforeExpr = !!conf.beforeExpr;
  this.startsExpr = !!conf.startsExpr;
  this.isLoop = !!conf.isLoop;
  this.isAssign = !!conf.isAssign;
  this.prefix = !!conf.prefix;
  this.postfix = !!conf.postfix;
  this.binop = conf.binop || null;
  this.updateContext = null;
};
function binop(name, prec) {
  return new TokenType(name, { beforeExpr: true, binop: prec });
}
var beforeExpr = { beforeExpr: true };
var startsExpr = { startsExpr: true };
var keywords = {};
function kw(name, options) {
  if (options === undefined)
    options = {};
  options.keyword = name;
  return keywords[name] = new TokenType(name, options);
}
var types$1 = {
  num: new TokenType("num", startsExpr),
  regexp: new TokenType("regexp", startsExpr),
  string: new TokenType("string", startsExpr),
  name: new TokenType("name", startsExpr),
  privateId: new TokenType("privateId", startsExpr),
  eof: new TokenType("eof"),
  bracketL: new TokenType("[", { beforeExpr: true, startsExpr: true }),
  bracketR: new TokenType("]"),
  braceL: new TokenType("{", { beforeExpr: true, startsExpr: true }),
  braceR: new TokenType("}"),
  parenL: new TokenType("(", { beforeExpr: true, startsExpr: true }),
  parenR: new TokenType(")"),
  comma: new TokenType(",", beforeExpr),
  semi: new TokenType(";", beforeExpr),
  colon: new TokenType(":", beforeExpr),
  dot: new TokenType("."),
  question: new TokenType("?", beforeExpr),
  questionDot: new TokenType("?."),
  arrow: new TokenType("=>", beforeExpr),
  template: new TokenType("template"),
  invalidTemplate: new TokenType("invalidTemplate"),
  ellipsis: new TokenType("...", beforeExpr),
  backQuote: new TokenType("`", startsExpr),
  dollarBraceL: new TokenType("${", { beforeExpr: true, startsExpr: true }),
  eq: new TokenType("=", { beforeExpr: true, isAssign: true }),
  assign: new TokenType("_=", { beforeExpr: true, isAssign: true }),
  incDec: new TokenType("++/--", { prefix: true, postfix: true, startsExpr: true }),
  prefix: new TokenType("!/~", { beforeExpr: true, prefix: true, startsExpr: true }),
  logicalOR: binop("||", 1),
  logicalAND: binop("&&", 2),
  bitwiseOR: binop("|", 3),
  bitwiseXOR: binop("^", 4),
  bitwiseAND: binop("&", 5),
  equality: binop("==/!=/===/!==", 6),
  relational: binop("</>/<=/>=", 7),
  bitShift: binop("<</>>/>>>", 8),
  plusMin: new TokenType("+/-", { beforeExpr: true, binop: 9, prefix: true, startsExpr: true }),
  modulo: binop("%", 10),
  star: binop("*", 10),
  slash: binop("/", 10),
  starstar: new TokenType("**", { beforeExpr: true }),
  coalesce: binop("??", 1),
  _break: kw("break"),
  _case: kw("case", beforeExpr),
  _catch: kw("catch"),
  _continue: kw("continue"),
  _debugger: kw("debugger"),
  _default: kw("default", beforeExpr),
  _do: kw("do", { isLoop: true, beforeExpr: true }),
  _else: kw("else", beforeExpr),
  _finally: kw("finally"),
  _for: kw("for", { isLoop: true }),
  _function: kw("function", startsExpr),
  _if: kw("if"),
  _return: kw("return", beforeExpr),
  _switch: kw("switch"),
  _throw: kw("throw", beforeExpr),
  _try: kw("try"),
  _var: kw("var"),
  _const: kw("const"),
  _while: kw("while", { isLoop: true }),
  _with: kw("with"),
  _new: kw("new", { beforeExpr: true, startsExpr: true }),
  _this: kw("this", startsExpr),
  _super: kw("super", startsExpr),
  _class: kw("class", startsExpr),
  _extends: kw("extends", beforeExpr),
  _export: kw("export"),
  _import: kw("import", startsExpr),
  _null: kw("null", startsExpr),
  _true: kw("true", startsExpr),
  _false: kw("false", startsExpr),
  _in: kw("in", { beforeExpr: true, binop: 7 }),
  _instanceof: kw("instanceof", { beforeExpr: true, binop: 7 }),
  _typeof: kw("typeof", { beforeExpr: true, prefix: true, startsExpr: true }),
  _void: kw("void", { beforeExpr: true, prefix: true, startsExpr: true }),
  _delete: kw("delete", { beforeExpr: true, prefix: true, startsExpr: true })
};
var lineBreak = /\r\n?|\n|\u2028|\u2029/;
var lineBreakG = new RegExp(lineBreak.source, "g");
function isNewLine(code) {
  return code === 10 || code === 13 || code === 8232 || code === 8233;
}
function nextLineBreak(code, from, end) {
  if (end === undefined)
    end = code.length;
  for (var i = from;i < end; i++) {
    var next = code.charCodeAt(i);
    if (isNewLine(next)) {
      return i < end - 1 && next === 13 && code.charCodeAt(i + 1) === 10 ? i + 2 : i + 1;
    }
  }
  return -1;
}
var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;
var ref = Object.prototype;
var hasOwnProperty = ref.hasOwnProperty;
var toString = ref.toString;
var hasOwn = Object.hasOwn || function(obj, propName) {
  return hasOwnProperty.call(obj, propName);
};
var isArray2 = Array.isArray || function(obj) {
  return toString.call(obj) === "[object Array]";
};
var regexpCache = Object.create(null);
function wordsRegexp(words) {
  return regexpCache[words] || (regexpCache[words] = new RegExp("^(?:" + words.replace(/ /g, "|") + ")$"));
}
function codePointToString(code) {
  if (code <= 65535) {
    return String.fromCharCode(code);
  }
  code -= 65536;
  return String.fromCharCode((code >> 10) + 55296, (code & 1023) + 56320);
}
var loneSurrogate = /(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/;
var Position = function Position(line, col) {
  this.line = line;
  this.column = col;
};
Position.prototype.offset = function offset(n) {
  return new Position(this.line, this.column + n);
};
var SourceLocation = function SourceLocation(p, start, end) {
  this.start = start;
  this.end = end;
  if (p.sourceFile !== null) {
    this.source = p.sourceFile;
  }
};
function getLineInfo(input, offset) {
  for (var line = 1, cur = 0;; ) {
    var nextBreak = nextLineBreak(input, cur, offset);
    if (nextBreak < 0) {
      return new Position(line, offset - cur);
    }
    ++line;
    cur = nextBreak;
  }
}
var defaultOptions = {
  ecmaVersion: null,
  sourceType: "script",
  onInsertedSemicolon: null,
  onTrailingComma: null,
  allowReserved: null,
  allowReturnOutsideFunction: false,
  allowImportExportEverywhere: false,
  allowAwaitOutsideFunction: null,
  allowSuperOutsideMethod: null,
  allowHashBang: false,
  checkPrivateFields: true,
  locations: false,
  onToken: null,
  onComment: null,
  ranges: false,
  program: null,
  sourceFile: null,
  directSourceFile: null,
  preserveParens: false
};
var warnedAboutEcmaVersion = false;
function getOptions(opts) {
  var options = {};
  for (var opt in defaultOptions) {
    options[opt] = opts && hasOwn(opts, opt) ? opts[opt] : defaultOptions[opt];
  }
  if (options.ecmaVersion === "latest") {
    options.ecmaVersion = 1e8;
  } else if (options.ecmaVersion == null) {
    if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
      warnedAboutEcmaVersion = true;
      console.warn(`Since Acorn 8.0.0, options.ecmaVersion is required.
Defaulting to 2020, but this will stop working in the future.`);
    }
    options.ecmaVersion = 11;
  } else if (options.ecmaVersion >= 2015) {
    options.ecmaVersion -= 2009;
  }
  if (options.allowReserved == null) {
    options.allowReserved = options.ecmaVersion < 5;
  }
  if (!opts || opts.allowHashBang == null) {
    options.allowHashBang = options.ecmaVersion >= 14;
  }
  if (isArray2(options.onToken)) {
    var tokens = options.onToken;
    options.onToken = function(token) {
      return tokens.push(token);
    };
  }
  if (isArray2(options.onComment)) {
    options.onComment = pushComment(options, options.onComment);
  }
  return options;
}
function pushComment(options, array) {
  return function(block, text, start, end, startLoc, endLoc) {
    var comment = {
      type: block ? "Block" : "Line",
      value: text,
      start,
      end
    };
    if (options.locations) {
      comment.loc = new SourceLocation(this, startLoc, endLoc);
    }
    if (options.ranges) {
      comment.range = [start, end];
    }
    array.push(comment);
  };
}
var SCOPE_TOP = 1;
var SCOPE_FUNCTION = 2;
var SCOPE_ASYNC = 4;
var SCOPE_GENERATOR = 8;
var SCOPE_ARROW = 16;
var SCOPE_SIMPLE_CATCH = 32;
var SCOPE_SUPER = 64;
var SCOPE_DIRECT_SUPER = 128;
var SCOPE_CLASS_STATIC_BLOCK = 256;
var SCOPE_CLASS_FIELD_INIT = 512;
var SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK;
function functionFlags(async, generator) {
  return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0);
}
var BIND_NONE = 0;
var BIND_VAR = 1;
var BIND_LEXICAL = 2;
var BIND_FUNCTION = 3;
var BIND_SIMPLE_CATCH = 4;
var BIND_OUTSIDE = 5;
var Parser = function Parser(options, input, startPos) {
  this.options = options = getOptions(options);
  this.sourceFile = options.sourceFile;
  this.keywords = wordsRegexp(keywords$1[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
  var reserved = "";
  if (options.allowReserved !== true) {
    reserved = reservedWords[options.ecmaVersion >= 6 ? 6 : options.ecmaVersion === 5 ? 5 : 3];
    if (options.sourceType === "module") {
      reserved += " await";
    }
  }
  this.reservedWords = wordsRegexp(reserved);
  var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
  this.reservedWordsStrict = wordsRegexp(reservedStrict);
  this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
  this.input = String(input);
  this.containsEsc = false;
  if (startPos) {
    this.pos = startPos;
    this.lineStart = this.input.lastIndexOf(`
`, startPos - 1) + 1;
    this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
  } else {
    this.pos = this.lineStart = 0;
    this.curLine = 1;
  }
  this.type = types$1.eof;
  this.value = null;
  this.start = this.end = this.pos;
  this.startLoc = this.endLoc = this.curPosition();
  this.lastTokEndLoc = this.lastTokStartLoc = null;
  this.lastTokStart = this.lastTokEnd = this.pos;
  this.context = this.initialContext();
  this.exprAllowed = true;
  this.inModule = options.sourceType === "module";
  this.strict = this.inModule || this.strictDirective(this.pos);
  this.potentialArrowAt = -1;
  this.potentialArrowInForAwait = false;
  this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
  this.labels = [];
  this.undefinedExports = Object.create(null);
  if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!") {
    this.skipLineComment(2);
  }
  this.scopeStack = [];
  this.enterScope(SCOPE_TOP);
  this.regexpState = null;
  this.privateNameStack = [];
};
var prototypeAccessors = { inFunction: { configurable: true }, inGenerator: { configurable: true }, inAsync: { configurable: true }, canAwait: { configurable: true }, allowSuper: { configurable: true }, allowDirectSuper: { configurable: true }, treatFunctionsAsVar: { configurable: true }, allowNewDotTarget: { configurable: true }, inClassStaticBlock: { configurable: true } };
Parser.prototype.parse = function parse() {
  var node = this.options.program || this.startNode();
  this.nextToken();
  return this.parseTopLevel(node);
};
prototypeAccessors.inFunction.get = function() {
  return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0;
};
prototypeAccessors.inGenerator.get = function() {
  return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0;
};
prototypeAccessors.inAsync.get = function() {
  return (this.currentVarScope().flags & SCOPE_ASYNC) > 0;
};
prototypeAccessors.canAwait.get = function() {
  for (var i = this.scopeStack.length - 1;i >= 0; i--) {
    var ref = this.scopeStack[i];
    var flags = ref.flags;
    if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT)) {
      return false;
    }
    if (flags & SCOPE_FUNCTION) {
      return (flags & SCOPE_ASYNC) > 0;
    }
  }
  return this.inModule && this.options.ecmaVersion >= 13 || this.options.allowAwaitOutsideFunction;
};
prototypeAccessors.allowSuper.get = function() {
  var ref = this.currentThisScope();
  var flags = ref.flags;
  return (flags & SCOPE_SUPER) > 0 || this.options.allowSuperOutsideMethod;
};
prototypeAccessors.allowDirectSuper.get = function() {
  return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0;
};
prototypeAccessors.treatFunctionsAsVar.get = function() {
  return this.treatFunctionsAsVarInScope(this.currentScope());
};
prototypeAccessors.allowNewDotTarget.get = function() {
  for (var i = this.scopeStack.length - 1;i >= 0; i--) {
    var ref = this.scopeStack[i];
    var flags = ref.flags;
    if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT) || flags & SCOPE_FUNCTION && !(flags & SCOPE_ARROW)) {
      return true;
    }
  }
  return false;
};
prototypeAccessors.inClassStaticBlock.get = function() {
  return (this.currentVarScope().flags & SCOPE_CLASS_STATIC_BLOCK) > 0;
};
Parser.extend = function extend() {
  var plugins = [], len = arguments.length;
  while (len--)
    plugins[len] = arguments[len];
  var cls = this;
  for (var i = 0;i < plugins.length; i++) {
    cls = plugins[i](cls);
  }
  return cls;
};
Parser.parse = function parse(input, options) {
  return new this(options, input).parse();
};
Parser.parseExpressionAt = function parseExpressionAt(input, pos, options) {
  var parser = new this(options, input, pos);
  parser.nextToken();
  return parser.parseExpression();
};
Parser.tokenizer = function tokenizer(input, options) {
  return new this(options, input);
};
Object.defineProperties(Parser.prototype, prototypeAccessors);
var pp$9 = Parser.prototype;
var literal = /^(?:'((?:\\[^]|[^'\\])*?)'|"((?:\\[^]|[^"\\])*?)")/;
pp$9.strictDirective = function(start) {
  if (this.options.ecmaVersion < 5) {
    return false;
  }
  for (;; ) {
    skipWhiteSpace.lastIndex = start;
    start += skipWhiteSpace.exec(this.input)[0].length;
    var match = literal.exec(this.input.slice(start));
    if (!match) {
      return false;
    }
    if ((match[1] || match[2]) === "use strict") {
      skipWhiteSpace.lastIndex = start + match[0].length;
      var spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length;
      var next = this.input.charAt(end);
      return next === ";" || next === "}" || lineBreak.test(spaceAfter[0]) && !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "=");
    }
    start += match[0].length;
    skipWhiteSpace.lastIndex = start;
    start += skipWhiteSpace.exec(this.input)[0].length;
    if (this.input[start] === ";") {
      start++;
    }
  }
};
pp$9.eat = function(type) {
  if (this.type === type) {
    this.next();
    return true;
  } else {
    return false;
  }
};
pp$9.isContextual = function(name) {
  return this.type === types$1.name && this.value === name && !this.containsEsc;
};
pp$9.eatContextual = function(name) {
  if (!this.isContextual(name)) {
    return false;
  }
  this.next();
  return true;
};
pp$9.expectContextual = function(name) {
  if (!this.eatContextual(name)) {
    this.unexpected();
  }
};
pp$9.canInsertSemicolon = function() {
  return this.type === types$1.eof || this.type === types$1.braceR || lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
};
pp$9.insertSemicolon = function() {
  if (this.canInsertSemicolon()) {
    if (this.options.onInsertedSemicolon) {
      this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
    }
    return true;
  }
};
pp$9.semicolon = function() {
  if (!this.eat(types$1.semi) && !this.insertSemicolon()) {
    this.unexpected();
  }
};
pp$9.afterTrailingComma = function(tokType, notNext) {
  if (this.type === tokType) {
    if (this.options.onTrailingComma) {
      this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
    }
    if (!notNext) {
      this.next();
    }
    return true;
  }
};
pp$9.expect = function(type) {
  this.eat(type) || this.unexpected();
};
pp$9.unexpected = function(pos) {
  this.raise(pos != null ? pos : this.start, "Unexpected token");
};
var DestructuringErrors = function DestructuringErrors() {
  this.shorthandAssign = this.trailingComma = this.parenthesizedAssign = this.parenthesizedBind = this.doubleProto = -1;
};
pp$9.checkPatternErrors = function(refDestructuringErrors, isAssign) {
  if (!refDestructuringErrors) {
    return;
  }
  if (refDestructuringErrors.trailingComma > -1) {
    this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element");
  }
  var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
  if (parens > -1) {
    this.raiseRecoverable(parens, isAssign ? "Assigning to rvalue" : "Parenthesized pattern");
  }
};
pp$9.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
  if (!refDestructuringErrors) {
    return false;
  }
  var shorthandAssign = refDestructuringErrors.shorthandAssign;
  var doubleProto = refDestructuringErrors.doubleProto;
  if (!andThrow) {
    return shorthandAssign >= 0 || doubleProto >= 0;
  }
  if (shorthandAssign >= 0) {
    this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns");
  }
  if (doubleProto >= 0) {
    this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property");
  }
};
pp$9.checkYieldAwaitInDefaultParams = function() {
  if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos)) {
    this.raise(this.yieldPos, "Yield expression cannot be a default value");
  }
  if (this.awaitPos) {
    this.raise(this.awaitPos, "Await expression cannot be a default value");
  }
};
pp$9.isSimpleAssignTarget = function(expr) {
  if (expr.type === "ParenthesizedExpression") {
    return this.isSimpleAssignTarget(expr.expression);
  }
  return expr.type === "Identifier" || expr.type === "MemberExpression";
};
var pp$8 = Parser.prototype;
pp$8.parseTopLevel = function(node) {
  var exports = Object.create(null);
  if (!node.body) {
    node.body = [];
  }
  while (this.type !== types$1.eof) {
    var stmt = this.parseStatement(null, true, exports);
    node.body.push(stmt);
  }
  if (this.inModule) {
    for (var i = 0, list = Object.keys(this.undefinedExports);i < list.length; i += 1) {
      var name = list[i];
      this.raiseRecoverable(this.undefinedExports[name].start, "Export '" + name + "' is not defined");
    }
  }
  this.adaptDirectivePrologue(node.body);
  this.next();
  node.sourceType = this.options.sourceType;
  return this.finishNode(node, "Program");
};
var loopLabel = { kind: "loop" };
var switchLabel = { kind: "switch" };
pp$8.isLet = function(context) {
  if (this.options.ecmaVersion < 6 || !this.isContextual("let")) {
    return false;
  }
  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
  if (nextCh === 91 || nextCh === 92) {
    return true;
  }
  if (context) {
    return false;
  }
  if (nextCh === 123 || nextCh > 55295 && nextCh < 56320) {
    return true;
  }
  if (isIdentifierStart(nextCh, true)) {
    var pos = next + 1;
    while (isIdentifierChar(nextCh = this.input.charCodeAt(pos), true)) {
      ++pos;
    }
    if (nextCh === 92 || nextCh > 55295 && nextCh < 56320) {
      return true;
    }
    var ident = this.input.slice(next, pos);
    if (!keywordRelationalOperator.test(ident)) {
      return true;
    }
  }
  return false;
};
pp$8.isAsyncFunction = function() {
  if (this.options.ecmaVersion < 8 || !this.isContextual("async")) {
    return false;
  }
  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length, after;
  return !lineBreak.test(this.input.slice(this.pos, next)) && this.input.slice(next, next + 8) === "function" && (next + 8 === this.input.length || !(isIdentifierChar(after = this.input.charCodeAt(next + 8)) || after > 55295 && after < 56320));
};
pp$8.isUsingKeyword = function(isAwaitUsing, isFor) {
  if (this.options.ecmaVersion < 17 || !this.isContextual(isAwaitUsing ? "await" : "using")) {
    return false;
  }
  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length;
  if (lineBreak.test(this.input.slice(this.pos, next))) {
    return false;
  }
  if (isAwaitUsing) {
    var awaitEndPos = next + 5, after;
    if (this.input.slice(next, awaitEndPos) !== "using" || awaitEndPos === this.input.length || isIdentifierChar(after = this.input.charCodeAt(awaitEndPos)) || after > 55295 && after < 56320) {
      return false;
    }
    skipWhiteSpace.lastIndex = awaitEndPos;
    var skipAfterUsing = skipWhiteSpace.exec(this.input);
    if (skipAfterUsing && lineBreak.test(this.input.slice(awaitEndPos, awaitEndPos + skipAfterUsing[0].length))) {
      return false;
    }
  }
  if (isFor) {
    var ofEndPos = next + 2, after$1;
    if (this.input.slice(next, ofEndPos) === "of") {
      if (ofEndPos === this.input.length || !isIdentifierChar(after$1 = this.input.charCodeAt(ofEndPos)) && !(after$1 > 55295 && after$1 < 56320)) {
        return false;
      }
    }
  }
  var ch = this.input.charCodeAt(next);
  return isIdentifierStart(ch, true) || ch === 92;
};
pp$8.isAwaitUsing = function(isFor) {
  return this.isUsingKeyword(true, isFor);
};
pp$8.isUsing = function(isFor) {
  return this.isUsingKeyword(false, isFor);
};
pp$8.parseStatement = function(context, topLevel, exports) {
  var starttype = this.type, node = this.startNode(), kind;
  if (this.isLet(context)) {
    starttype = types$1._var;
    kind = "let";
  }
  switch (starttype) {
    case types$1._break:
    case types$1._continue:
      return this.parseBreakContinueStatement(node, starttype.keyword);
    case types$1._debugger:
      return this.parseDebuggerStatement(node);
    case types$1._do:
      return this.parseDoStatement(node);
    case types$1._for:
      return this.parseForStatement(node);
    case types$1._function:
      if (context && (this.strict || context !== "if" && context !== "label") && this.options.ecmaVersion >= 6) {
        this.unexpected();
      }
      return this.parseFunctionStatement(node, false, !context);
    case types$1._class:
      if (context) {
        this.unexpected();
      }
      return this.parseClass(node, true);
    case types$1._if:
      return this.parseIfStatement(node);
    case types$1._return:
      return this.parseReturnStatement(node);
    case types$1._switch:
      return this.parseSwitchStatement(node);
    case types$1._throw:
      return this.parseThrowStatement(node);
    case types$1._try:
      return this.parseTryStatement(node);
    case types$1._const:
    case types$1._var:
      kind = kind || this.value;
      if (context && kind !== "var") {
        this.unexpected();
      }
      return this.parseVarStatement(node, kind);
    case types$1._while:
      return this.parseWhileStatement(node);
    case types$1._with:
      return this.parseWithStatement(node);
    case types$1.braceL:
      return this.parseBlock(true, node);
    case types$1.semi:
      return this.parseEmptyStatement(node);
    case types$1._export:
    case types$1._import:
      if (this.options.ecmaVersion > 10 && starttype === types$1._import) {
        skipWhiteSpace.lastIndex = this.pos;
        var skip = skipWhiteSpace.exec(this.input);
        var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
        if (nextCh === 40 || nextCh === 46) {
          return this.parseExpressionStatement(node, this.parseExpression());
        }
      }
      if (!this.options.allowImportExportEverywhere) {
        if (!topLevel) {
          this.raise(this.start, "'import' and 'export' may only appear at the top level");
        }
        if (!this.inModule) {
          this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
        }
      }
      return starttype === types$1._import ? this.parseImport(node) : this.parseExport(node, exports);
    default:
      if (this.isAsyncFunction()) {
        if (context) {
          this.unexpected();
        }
        this.next();
        return this.parseFunctionStatement(node, true, !context);
      }
      var usingKind = this.isAwaitUsing(false) ? "await using" : this.isUsing(false) ? "using" : null;
      if (usingKind) {
        if (topLevel && this.options.sourceType === "script") {
          this.raise(this.start, "Using declaration cannot appear in the top level when source type is `script`");
        }
        if (usingKind === "await using") {
          if (!this.canAwait) {
            this.raise(this.start, "Await using cannot appear outside of async function");
          }
          this.next();
        }
        this.next();
        this.parseVar(node, false, usingKind);
        this.semicolon();
        return this.finishNode(node, "VariableDeclaration");
      }
      var maybeName = this.value, expr = this.parseExpression();
      if (starttype === types$1.name && expr.type === "Identifier" && this.eat(types$1.colon)) {
        return this.parseLabeledStatement(node, maybeName, expr, context);
      } else {
        return this.parseExpressionStatement(node, expr);
      }
  }
};
pp$8.parseBreakContinueStatement = function(node, keyword) {
  var isBreak = keyword === "break";
  this.next();
  if (this.eat(types$1.semi) || this.insertSemicolon()) {
    node.label = null;
  } else if (this.type !== types$1.name) {
    this.unexpected();
  } else {
    node.label = this.parseIdent();
    this.semicolon();
  }
  var i = 0;
  for (;i < this.labels.length; ++i) {
    var lab = this.labels[i];
    if (node.label == null || lab.name === node.label.name) {
      if (lab.kind != null && (isBreak || lab.kind === "loop")) {
        break;
      }
      if (node.label && isBreak) {
        break;
      }
    }
  }
  if (i === this.labels.length) {
    this.raise(node.start, "Unsyntactic " + keyword);
  }
  return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
};
pp$8.parseDebuggerStatement = function(node) {
  this.next();
  this.semicolon();
  return this.finishNode(node, "DebuggerStatement");
};
pp$8.parseDoStatement = function(node) {
  this.next();
  this.labels.push(loopLabel);
  node.body = this.parseStatement("do");
  this.labels.pop();
  this.expect(types$1._while);
  node.test = this.parseParenExpression();
  if (this.options.ecmaVersion >= 6) {
    this.eat(types$1.semi);
  } else {
    this.semicolon();
  }
  return this.finishNode(node, "DoWhileStatement");
};
pp$8.parseForStatement = function(node) {
  this.next();
  var awaitAt = this.options.ecmaVersion >= 9 && this.canAwait && this.eatContextual("await") ? this.lastTokStart : -1;
  this.labels.push(loopLabel);
  this.enterScope(0);
  this.expect(types$1.parenL);
  if (this.type === types$1.semi) {
    if (awaitAt > -1) {
      this.unexpected(awaitAt);
    }
    return this.parseFor(node, null);
  }
  var isLet = this.isLet();
  if (this.type === types$1._var || this.type === types$1._const || isLet) {
    var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
    this.next();
    this.parseVar(init$1, true, kind);
    this.finishNode(init$1, "VariableDeclaration");
    return this.parseForAfterInit(node, init$1, awaitAt);
  }
  var startsWithLet = this.isContextual("let"), isForOf = false;
  var usingKind = this.isUsing(true) ? "using" : this.isAwaitUsing(true) ? "await using" : null;
  if (usingKind) {
    var init$2 = this.startNode();
    this.next();
    if (usingKind === "await using") {
      this.next();
    }
    this.parseVar(init$2, true, usingKind);
    this.finishNode(init$2, "VariableDeclaration");
    return this.parseForAfterInit(node, init$2, awaitAt);
  }
  var containsEsc = this.containsEsc;
  var refDestructuringErrors = new DestructuringErrors;
  var initPos = this.start;
  var init = awaitAt > -1 ? this.parseExprSubscripts(refDestructuringErrors, "await") : this.parseExpression(true, refDestructuringErrors);
  if (this.type === types$1._in || (isForOf = this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
    if (awaitAt > -1) {
      if (this.type === types$1._in) {
        this.unexpected(awaitAt);
      }
      node.await = true;
    } else if (isForOf && this.options.ecmaVersion >= 8) {
      if (init.start === initPos && !containsEsc && init.type === "Identifier" && init.name === "async") {
        this.unexpected();
      } else if (this.options.ecmaVersion >= 9) {
        node.await = false;
      }
    }
    if (startsWithLet && isForOf) {
      this.raise(init.start, "The left-hand side of a for-of loop may not start with 'let'.");
    }
    this.toAssignable(init, false, refDestructuringErrors);
    this.checkLValPattern(init);
    return this.parseForIn(node, init);
  } else {
    this.checkExpressionErrors(refDestructuringErrors, true);
  }
  if (awaitAt > -1) {
    this.unexpected(awaitAt);
  }
  return this.parseFor(node, init);
};
pp$8.parseForAfterInit = function(node, init, awaitAt) {
  if ((this.type === types$1._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) && init.declarations.length === 1) {
    if (this.options.ecmaVersion >= 9) {
      if (this.type === types$1._in) {
        if (awaitAt > -1) {
          this.unexpected(awaitAt);
        }
      } else {
        node.await = awaitAt > -1;
      }
    }
    return this.parseForIn(node, init);
  }
  if (awaitAt > -1) {
    this.unexpected(awaitAt);
  }
  return this.parseFor(node, init);
};
pp$8.parseFunctionStatement = function(node, isAsync, declarationPosition) {
  this.next();
  return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync);
};
pp$8.parseIfStatement = function(node) {
  this.next();
  node.test = this.parseParenExpression();
  node.consequent = this.parseStatement("if");
  node.alternate = this.eat(types$1._else) ? this.parseStatement("if") : null;
  return this.finishNode(node, "IfStatement");
};
pp$8.parseReturnStatement = function(node) {
  if (!this.inFunction && !this.options.allowReturnOutsideFunction) {
    this.raise(this.start, "'return' outside of function");
  }
  this.next();
  if (this.eat(types$1.semi) || this.insertSemicolon()) {
    node.argument = null;
  } else {
    node.argument = this.parseExpression();
    this.semicolon();
  }
  return this.finishNode(node, "ReturnStatement");
};
pp$8.parseSwitchStatement = function(node) {
  this.next();
  node.discriminant = this.parseParenExpression();
  node.cases = [];
  this.expect(types$1.braceL);
  this.labels.push(switchLabel);
  this.enterScope(0);
  var cur;
  for (var sawDefault = false;this.type !== types$1.braceR; ) {
    if (this.type === types$1._case || this.type === types$1._default) {
      var isCase = this.type === types$1._case;
      if (cur) {
        this.finishNode(cur, "SwitchCase");
      }
      node.cases.push(cur = this.startNode());
      cur.consequent = [];
      this.next();
      if (isCase) {
        cur.test = this.parseExpression();
      } else {
        if (sawDefault) {
          this.raiseRecoverable(this.lastTokStart, "Multiple default clauses");
        }
        sawDefault = true;
        cur.test = null;
      }
      this.expect(types$1.colon);
    } else {
      if (!cur) {
        this.unexpected();
      }
      cur.consequent.push(this.parseStatement(null));
    }
  }
  this.exitScope();
  if (cur) {
    this.finishNode(cur, "SwitchCase");
  }
  this.next();
  this.labels.pop();
  return this.finishNode(node, "SwitchStatement");
};
pp$8.parseThrowStatement = function(node) {
  this.next();
  if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) {
    this.raise(this.lastTokEnd, "Illegal newline after throw");
  }
  node.argument = this.parseExpression();
  this.semicolon();
  return this.finishNode(node, "ThrowStatement");
};
var empty$1 = [];
pp$8.parseCatchClauseParam = function() {
  var param = this.parseBindingAtom();
  var simple = param.type === "Identifier";
  this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
  this.checkLValPattern(param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
  this.expect(types$1.parenR);
  return param;
};
pp$8.parseTryStatement = function(node) {
  this.next();
  node.block = this.parseBlock();
  node.handler = null;
  if (this.type === types$1._catch) {
    var clause = this.startNode();
    this.next();
    if (this.eat(types$1.parenL)) {
      clause.param = this.parseCatchClauseParam();
    } else {
      if (this.options.ecmaVersion < 10) {
        this.unexpected();
      }
      clause.param = null;
      this.enterScope(0);
    }
    clause.body = this.parseBlock(false);
    this.exitScope();
    node.handler = this.finishNode(clause, "CatchClause");
  }
  node.finalizer = this.eat(types$1._finally) ? this.parseBlock() : null;
  if (!node.handler && !node.finalizer) {
    this.raise(node.start, "Missing catch or finally clause");
  }
  return this.finishNode(node, "TryStatement");
};
pp$8.parseVarStatement = function(node, kind, allowMissingInitializer) {
  this.next();
  this.parseVar(node, false, kind, allowMissingInitializer);
  this.semicolon();
  return this.finishNode(node, "VariableDeclaration");
};
pp$8.parseWhileStatement = function(node) {
  this.next();
  node.test = this.parseParenExpression();
  this.labels.push(loopLabel);
  node.body = this.parseStatement("while");
  this.labels.pop();
  return this.finishNode(node, "WhileStatement");
};
pp$8.parseWithStatement = function(node) {
  if (this.strict) {
    this.raise(this.start, "'with' in strict mode");
  }
  this.next();
  node.object = this.parseParenExpression();
  node.body = this.parseStatement("with");
  return this.finishNode(node, "WithStatement");
};
pp$8.parseEmptyStatement = function(node) {
  this.next();
  return this.finishNode(node, "EmptyStatement");
};
pp$8.parseLabeledStatement = function(node, maybeName, expr, context) {
  for (var i$1 = 0, list = this.labels;i$1 < list.length; i$1 += 1) {
    var label = list[i$1];
    if (label.name === maybeName) {
      this.raise(expr.start, "Label '" + maybeName + "' is already declared");
    }
  }
  var kind = this.type.isLoop ? "loop" : this.type === types$1._switch ? "switch" : null;
  for (var i = this.labels.length - 1;i >= 0; i--) {
    var label$1 = this.labels[i];
    if (label$1.statementStart === node.start) {
      label$1.statementStart = this.start;
      label$1.kind = kind;
    } else {
      break;
    }
  }
  this.labels.push({ name: maybeName, kind, statementStart: this.start });
  node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
  this.labels.pop();
  node.label = expr;
  return this.finishNode(node, "LabeledStatement");
};
pp$8.parseExpressionStatement = function(node, expr) {
  node.expression = expr;
  this.semicolon();
  return this.finishNode(node, "ExpressionStatement");
};
pp$8.parseBlock = function(createNewLexicalScope, node, exitStrict) {
  if (createNewLexicalScope === undefined)
    createNewLexicalScope = true;
  if (node === undefined)
    node = this.startNode();
  node.body = [];
  this.expect(types$1.braceL);
  if (createNewLexicalScope) {
    this.enterScope(0);
  }
  while (this.type !== types$1.braceR) {
    var stmt = this.parseStatement(null);
    node.body.push(stmt);
  }
  if (exitStrict) {
    this.strict = false;
  }
  this.next();
  if (createNewLexicalScope) {
    this.exitScope();
  }
  return this.finishNode(node, "BlockStatement");
};
pp$8.parseFor = function(node, init) {
  node.init = init;
  this.expect(types$1.semi);
  node.test = this.type === types$1.semi ? null : this.parseExpression();
  this.expect(types$1.semi);
  node.update = this.type === types$1.parenR ? null : this.parseExpression();
  this.expect(types$1.parenR);
  node.body = this.parseStatement("for");
  this.exitScope();
  this.labels.pop();
  return this.finishNode(node, "ForStatement");
};
pp$8.parseForIn = function(node, init) {
  var isForIn = this.type === types$1._in;
  this.next();
  if (init.type === "VariableDeclaration" && init.declarations[0].init != null && (!isForIn || this.options.ecmaVersion < 8 || this.strict || init.kind !== "var" || init.declarations[0].id.type !== "Identifier")) {
    this.raise(init.start, (isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer");
  }
  node.left = init;
  node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
  this.expect(types$1.parenR);
  node.body = this.parseStatement("for");
  this.exitScope();
  this.labels.pop();
  return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement");
};
pp$8.parseVar = function(node, isFor, kind, allowMissingInitializer) {
  node.declarations = [];
  node.kind = kind;
  for (;; ) {
    var decl = this.startNode();
    this.parseVarId(decl, kind);
    if (this.eat(types$1.eq)) {
      decl.init = this.parseMaybeAssign(isFor);
    } else if (!allowMissingInitializer && kind === "const" && !(this.type === types$1._in || this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
      this.unexpected();
    } else if (!allowMissingInitializer && (kind === "using" || kind === "await using") && this.options.ecmaVersion >= 17 && this.type !== types$1._in && !this.isContextual("of")) {
      this.raise(this.lastTokEnd, "Missing initializer in " + kind + " declaration");
    } else if (!allowMissingInitializer && decl.id.type !== "Identifier" && !(isFor && (this.type === types$1._in || this.isContextual("of")))) {
      this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
    } else {
      decl.init = null;
    }
    node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
    if (!this.eat(types$1.comma)) {
      break;
    }
  }
  return node;
};
pp$8.parseVarId = function(decl, kind) {
  decl.id = kind === "using" || kind === "await using" ? this.parseIdent() : this.parseBindingAtom();
  this.checkLValPattern(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
};
var FUNC_STATEMENT = 1;
var FUNC_HANGING_STATEMENT = 2;
var FUNC_NULLABLE_ID = 4;
pp$8.parseFunction = function(node, statement, allowExpressionBody, isAsync, forInit) {
  this.initFunction(node);
  if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
    if (this.type === types$1.star && statement & FUNC_HANGING_STATEMENT) {
      this.unexpected();
    }
    node.generator = this.eat(types$1.star);
  }
  if (this.options.ecmaVersion >= 8) {
    node.async = !!isAsync;
  }
  if (statement & FUNC_STATEMENT) {
    node.id = statement & FUNC_NULLABLE_ID && this.type !== types$1.name ? null : this.parseIdent();
    if (node.id && !(statement & FUNC_HANGING_STATEMENT)) {
      this.checkLValSimple(node.id, this.strict || node.generator || node.async ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION);
    }
  }
  var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  this.enterScope(functionFlags(node.async, node.generator));
  if (!(statement & FUNC_STATEMENT)) {
    node.id = this.type === types$1.name ? this.parseIdent() : null;
  }
  this.parseFunctionParams(node);
  this.parseFunctionBody(node, allowExpressionBody, false, forInit);
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, statement & FUNC_STATEMENT ? "FunctionDeclaration" : "FunctionExpression");
};
pp$8.parseFunctionParams = function(node) {
  this.expect(types$1.parenL);
  node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
};
pp$8.parseClass = function(node, isStatement) {
  this.next();
  var oldStrict = this.strict;
  this.strict = true;
  this.parseClassId(node, isStatement);
  this.parseClassSuper(node);
  var privateNameMap = this.enterClassBody();
  var classBody = this.startNode();
  var hadConstructor = false;
  classBody.body = [];
  this.expect(types$1.braceL);
  while (this.type !== types$1.braceR) {
    var element = this.parseClassElement(node.superClass !== null);
    if (element) {
      classBody.body.push(element);
      if (element.type === "MethodDefinition" && element.kind === "constructor") {
        if (hadConstructor) {
          this.raiseRecoverable(element.start, "Duplicate constructor in the same class");
        }
        hadConstructor = true;
      } else if (element.key && element.key.type === "PrivateIdentifier" && isPrivateNameConflicted(privateNameMap, element)) {
        this.raiseRecoverable(element.key.start, "Identifier '#" + element.key.name + "' has already been declared");
      }
    }
  }
  this.strict = oldStrict;
  this.next();
  node.body = this.finishNode(classBody, "ClassBody");
  this.exitClassBody();
  return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
};
pp$8.parseClassElement = function(constructorAllowsSuper) {
  if (this.eat(types$1.semi)) {
    return null;
  }
  var ecmaVersion = this.options.ecmaVersion;
  var node = this.startNode();
  var keyName = "";
  var isGenerator = false;
  var isAsync = false;
  var kind = "method";
  var isStatic = false;
  if (this.eatContextual("static")) {
    if (ecmaVersion >= 13 && this.eat(types$1.braceL)) {
      this.parseClassStaticBlock(node);
      return node;
    }
    if (this.isClassElementNameStart() || this.type === types$1.star) {
      isStatic = true;
    } else {
      keyName = "static";
    }
  }
  node.static = isStatic;
  if (!keyName && ecmaVersion >= 8 && this.eatContextual("async")) {
    if ((this.isClassElementNameStart() || this.type === types$1.star) && !this.canInsertSemicolon()) {
      isAsync = true;
    } else {
      keyName = "async";
    }
  }
  if (!keyName && (ecmaVersion >= 9 || !isAsync) && this.eat(types$1.star)) {
    isGenerator = true;
  }
  if (!keyName && !isAsync && !isGenerator) {
    var lastValue = this.value;
    if (this.eatContextual("get") || this.eatContextual("set")) {
      if (this.isClassElementNameStart()) {
        kind = lastValue;
      } else {
        keyName = lastValue;
      }
    }
  }
  if (keyName) {
    node.computed = false;
    node.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);
    node.key.name = keyName;
    this.finishNode(node.key, "Identifier");
  } else {
    this.parseClassElementName(node);
  }
  if (ecmaVersion < 13 || this.type === types$1.parenL || kind !== "method" || isGenerator || isAsync) {
    var isConstructor = !node.static && checkKeyName(node, "constructor");
    var allowsDirectSuper = isConstructor && constructorAllowsSuper;
    if (isConstructor && kind !== "method") {
      this.raise(node.key.start, "Constructor can't have get/set modifier");
    }
    node.kind = isConstructor ? "constructor" : kind;
    this.parseClassMethod(node, isGenerator, isAsync, allowsDirectSuper);
  } else {
    this.parseClassField(node);
  }
  return node;
};
pp$8.isClassElementNameStart = function() {
  return this.type === types$1.name || this.type === types$1.privateId || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword;
};
pp$8.parseClassElementName = function(element) {
  if (this.type === types$1.privateId) {
    if (this.value === "constructor") {
      this.raise(this.start, "Classes can't have an element named '#constructor'");
    }
    element.computed = false;
    element.key = this.parsePrivateIdent();
  } else {
    this.parsePropertyName(element);
  }
};
pp$8.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
  var key = method.key;
  if (method.kind === "constructor") {
    if (isGenerator) {
      this.raise(key.start, "Constructor can't be a generator");
    }
    if (isAsync) {
      this.raise(key.start, "Constructor can't be an async method");
    }
  } else if (method.static && checkKeyName(method, "prototype")) {
    this.raise(key.start, "Classes may not have a static property named prototype");
  }
  var value = method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);
  if (method.kind === "get" && value.params.length !== 0) {
    this.raiseRecoverable(value.start, "getter should have no params");
  }
  if (method.kind === "set" && value.params.length !== 1) {
    this.raiseRecoverable(value.start, "setter should have exactly one param");
  }
  if (method.kind === "set" && value.params[0].type === "RestElement") {
    this.raiseRecoverable(value.params[0].start, "Setter cannot use rest params");
  }
  return this.finishNode(method, "MethodDefinition");
};
pp$8.parseClassField = function(field) {
  if (checkKeyName(field, "constructor")) {
    this.raise(field.key.start, "Classes can't have a field named 'constructor'");
  } else if (field.static && checkKeyName(field, "prototype")) {
    this.raise(field.key.start, "Classes can't have a static field named 'prototype'");
  }
  if (this.eat(types$1.eq)) {
    this.enterScope(SCOPE_CLASS_FIELD_INIT | SCOPE_SUPER);
    field.value = this.parseMaybeAssign();
    this.exitScope();
  } else {
    field.value = null;
  }
  this.semicolon();
  return this.finishNode(field, "PropertyDefinition");
};
pp$8.parseClassStaticBlock = function(node) {
  node.body = [];
  var oldLabels = this.labels;
  this.labels = [];
  this.enterScope(SCOPE_CLASS_STATIC_BLOCK | SCOPE_SUPER);
  while (this.type !== types$1.braceR) {
    var stmt = this.parseStatement(null);
    node.body.push(stmt);
  }
  this.next();
  this.exitScope();
  this.labels = oldLabels;
  return this.finishNode(node, "StaticBlock");
};
pp$8.parseClassId = function(node, isStatement) {
  if (this.type === types$1.name) {
    node.id = this.parseIdent();
    if (isStatement) {
      this.checkLValSimple(node.id, BIND_LEXICAL, false);
    }
  } else {
    if (isStatement === true) {
      this.unexpected();
    }
    node.id = null;
  }
};
pp$8.parseClassSuper = function(node) {
  node.superClass = this.eat(types$1._extends) ? this.parseExprSubscripts(null, false) : null;
};
pp$8.enterClassBody = function() {
  var element = { declared: Object.create(null), used: [] };
  this.privateNameStack.push(element);
  return element.declared;
};
pp$8.exitClassBody = function() {
  var ref = this.privateNameStack.pop();
  var declared = ref.declared;
  var used = ref.used;
  if (!this.options.checkPrivateFields) {
    return;
  }
  var len = this.privateNameStack.length;
  var parent = len === 0 ? null : this.privateNameStack[len - 1];
  for (var i = 0;i < used.length; ++i) {
    var id = used[i];
    if (!hasOwn(declared, id.name)) {
      if (parent) {
        parent.used.push(id);
      } else {
        this.raiseRecoverable(id.start, "Private field '#" + id.name + "' must be declared in an enclosing class");
      }
    }
  }
};
function isPrivateNameConflicted(privateNameMap, element) {
  var name = element.key.name;
  var curr = privateNameMap[name];
  var next = "true";
  if (element.type === "MethodDefinition" && (element.kind === "get" || element.kind === "set")) {
    next = (element.static ? "s" : "i") + element.kind;
  }
  if (curr === "iget" && next === "iset" || curr === "iset" && next === "iget" || curr === "sget" && next === "sset" || curr === "sset" && next === "sget") {
    privateNameMap[name] = "true";
    return false;
  } else if (!curr) {
    privateNameMap[name] = next;
    return false;
  } else {
    return true;
  }
}
function checkKeyName(node, name) {
  var computed = node.computed;
  var key = node.key;
  return !computed && (key.type === "Identifier" && key.name === name || key.type === "Literal" && key.value === name);
}
pp$8.parseExportAllDeclaration = function(node, exports) {
  if (this.options.ecmaVersion >= 11) {
    if (this.eatContextual("as")) {
      node.exported = this.parseModuleExportName();
      this.checkExport(exports, node.exported, this.lastTokStart);
    } else {
      node.exported = null;
    }
  }
  this.expectContextual("from");
  if (this.type !== types$1.string) {
    this.unexpected();
  }
  node.source = this.parseExprAtom();
  if (this.options.ecmaVersion >= 16) {
    node.attributes = this.parseWithClause();
  }
  this.semicolon();
  return this.finishNode(node, "ExportAllDeclaration");
};
pp$8.parseExport = function(node, exports) {
  this.next();
  if (this.eat(types$1.star)) {
    return this.parseExportAllDeclaration(node, exports);
  }
  if (this.eat(types$1._default)) {
    this.checkExport(exports, "default", this.lastTokStart);
    node.declaration = this.parseExportDefaultDeclaration();
    return this.finishNode(node, "ExportDefaultDeclaration");
  }
  if (this.shouldParseExportStatement()) {
    node.declaration = this.parseExportDeclaration(node);
    if (node.declaration.type === "VariableDeclaration") {
      this.checkVariableExport(exports, node.declaration.declarations);
    } else {
      this.checkExport(exports, node.declaration.id, node.declaration.id.start);
    }
    node.specifiers = [];
    node.source = null;
    if (this.options.ecmaVersion >= 16) {
      node.attributes = [];
    }
  } else {
    node.declaration = null;
    node.specifiers = this.parseExportSpecifiers(exports);
    if (this.eatContextual("from")) {
      if (this.type !== types$1.string) {
        this.unexpected();
      }
      node.source = this.parseExprAtom();
      if (this.options.ecmaVersion >= 16) {
        node.attributes = this.parseWithClause();
      }
    } else {
      for (var i = 0, list = node.specifiers;i < list.length; i += 1) {
        var spec = list[i];
        this.checkUnreserved(spec.local);
        this.checkLocalExport(spec.local);
        if (spec.local.type === "Literal") {
          this.raise(spec.local.start, "A string literal cannot be used as an exported binding without `from`.");
        }
      }
      node.source = null;
      if (this.options.ecmaVersion >= 16) {
        node.attributes = [];
      }
    }
    this.semicolon();
  }
  return this.finishNode(node, "ExportNamedDeclaration");
};
pp$8.parseExportDeclaration = function(node) {
  return this.parseStatement(null);
};
pp$8.parseExportDefaultDeclaration = function() {
  var isAsync;
  if (this.type === types$1._function || (isAsync = this.isAsyncFunction())) {
    var fNode = this.startNode();
    this.next();
    if (isAsync) {
      this.next();
    }
    return this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync);
  } else if (this.type === types$1._class) {
    var cNode = this.startNode();
    return this.parseClass(cNode, "nullableID");
  } else {
    var declaration = this.parseMaybeAssign();
    this.semicolon();
    return declaration;
  }
};
pp$8.checkExport = function(exports, name, pos) {
  if (!exports) {
    return;
  }
  if (typeof name !== "string") {
    name = name.type === "Identifier" ? name.name : name.value;
  }
  if (hasOwn(exports, name)) {
    this.raiseRecoverable(pos, "Duplicate export '" + name + "'");
  }
  exports[name] = true;
};
pp$8.checkPatternExport = function(exports, pat) {
  var type = pat.type;
  if (type === "Identifier") {
    this.checkExport(exports, pat, pat.start);
  } else if (type === "ObjectPattern") {
    for (var i = 0, list = pat.properties;i < list.length; i += 1) {
      var prop = list[i];
      this.checkPatternExport(exports, prop);
    }
  } else if (type === "ArrayPattern") {
    for (var i$1 = 0, list$1 = pat.elements;i$1 < list$1.length; i$1 += 1) {
      var elt = list$1[i$1];
      if (elt) {
        this.checkPatternExport(exports, elt);
      }
    }
  } else if (type === "Property") {
    this.checkPatternExport(exports, pat.value);
  } else if (type === "AssignmentPattern") {
    this.checkPatternExport(exports, pat.left);
  } else if (type === "RestElement") {
    this.checkPatternExport(exports, pat.argument);
  }
};
pp$8.checkVariableExport = function(exports, decls) {
  if (!exports) {
    return;
  }
  for (var i = 0, list = decls;i < list.length; i += 1) {
    var decl = list[i];
    this.checkPatternExport(exports, decl.id);
  }
};
pp$8.shouldParseExportStatement = function() {
  return this.type.keyword === "var" || this.type.keyword === "const" || this.type.keyword === "class" || this.type.keyword === "function" || this.isLet() || this.isAsyncFunction();
};
pp$8.parseExportSpecifier = function(exports) {
  var node = this.startNode();
  node.local = this.parseModuleExportName();
  node.exported = this.eatContextual("as") ? this.parseModuleExportName() : node.local;
  this.checkExport(exports, node.exported, node.exported.start);
  return this.finishNode(node, "ExportSpecifier");
};
pp$8.parseExportSpecifiers = function(exports) {
  var nodes = [], first = true;
  this.expect(types$1.braceL);
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.afterTrailingComma(types$1.braceR)) {
        break;
      }
    } else {
      first = false;
    }
    nodes.push(this.parseExportSpecifier(exports));
  }
  return nodes;
};
pp$8.parseImport = function(node) {
  this.next();
  if (this.type === types$1.string) {
    node.specifiers = empty$1;
    node.source = this.parseExprAtom();
  } else {
    node.specifiers = this.parseImportSpecifiers();
    this.expectContextual("from");
    node.source = this.type === types$1.string ? this.parseExprAtom() : this.unexpected();
  }
  if (this.options.ecmaVersion >= 16) {
    node.attributes = this.parseWithClause();
  }
  this.semicolon();
  return this.finishNode(node, "ImportDeclaration");
};
pp$8.parseImportSpecifier = function() {
  var node = this.startNode();
  node.imported = this.parseModuleExportName();
  if (this.eatContextual("as")) {
    node.local = this.parseIdent();
  } else {
    this.checkUnreserved(node.imported);
    node.local = node.imported;
  }
  this.checkLValSimple(node.local, BIND_LEXICAL);
  return this.finishNode(node, "ImportSpecifier");
};
pp$8.parseImportDefaultSpecifier = function() {
  var node = this.startNode();
  node.local = this.parseIdent();
  this.checkLValSimple(node.local, BIND_LEXICAL);
  return this.finishNode(node, "ImportDefaultSpecifier");
};
pp$8.parseImportNamespaceSpecifier = function() {
  var node = this.startNode();
  this.next();
  this.expectContextual("as");
  node.local = this.parseIdent();
  this.checkLValSimple(node.local, BIND_LEXICAL);
  return this.finishNode(node, "ImportNamespaceSpecifier");
};
pp$8.parseImportSpecifiers = function() {
  var nodes = [], first = true;
  if (this.type === types$1.name) {
    nodes.push(this.parseImportDefaultSpecifier());
    if (!this.eat(types$1.comma)) {
      return nodes;
    }
  }
  if (this.type === types$1.star) {
    nodes.push(this.parseImportNamespaceSpecifier());
    return nodes;
  }
  this.expect(types$1.braceL);
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.afterTrailingComma(types$1.braceR)) {
        break;
      }
    } else {
      first = false;
    }
    nodes.push(this.parseImportSpecifier());
  }
  return nodes;
};
pp$8.parseWithClause = function() {
  var nodes = [];
  if (!this.eat(types$1._with)) {
    return nodes;
  }
  this.expect(types$1.braceL);
  var attributeKeys = {};
  var first = true;
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.afterTrailingComma(types$1.braceR)) {
        break;
      }
    } else {
      first = false;
    }
    var attr = this.parseImportAttribute();
    var keyName = attr.key.type === "Identifier" ? attr.key.name : attr.key.value;
    if (hasOwn(attributeKeys, keyName)) {
      this.raiseRecoverable(attr.key.start, "Duplicate attribute key '" + keyName + "'");
    }
    attributeKeys[keyName] = true;
    nodes.push(attr);
  }
  return nodes;
};
pp$8.parseImportAttribute = function() {
  var node = this.startNode();
  node.key = this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
  this.expect(types$1.colon);
  if (this.type !== types$1.string) {
    this.unexpected();
  }
  node.value = this.parseExprAtom();
  return this.finishNode(node, "ImportAttribute");
};
pp$8.parseModuleExportName = function() {
  if (this.options.ecmaVersion >= 13 && this.type === types$1.string) {
    var stringLiteral = this.parseLiteral(this.value);
    if (loneSurrogate.test(stringLiteral.value)) {
      this.raise(stringLiteral.start, "An export name cannot include a lone surrogate.");
    }
    return stringLiteral;
  }
  return this.parseIdent(true);
};
pp$8.adaptDirectivePrologue = function(statements) {
  for (var i = 0;i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
    statements[i].directive = statements[i].expression.raw.slice(1, -1);
  }
};
pp$8.isDirectiveCandidate = function(statement) {
  return this.options.ecmaVersion >= 5 && statement.type === "ExpressionStatement" && statement.expression.type === "Literal" && typeof statement.expression.value === "string" && (this.input[statement.start] === '"' || this.input[statement.start] === "'");
};
var pp$7 = Parser.prototype;
pp$7.toAssignable = function(node, isBinding, refDestructuringErrors) {
  if (this.options.ecmaVersion >= 6 && node) {
    switch (node.type) {
      case "Identifier":
        if (this.inAsync && node.name === "await") {
          this.raise(node.start, "Cannot use 'await' as identifier inside an async function");
        }
        break;
      case "ObjectPattern":
      case "ArrayPattern":
      case "AssignmentPattern":
      case "RestElement":
        break;
      case "ObjectExpression":
        node.type = "ObjectPattern";
        if (refDestructuringErrors) {
          this.checkPatternErrors(refDestructuringErrors, true);
        }
        for (var i = 0, list = node.properties;i < list.length; i += 1) {
          var prop = list[i];
          this.toAssignable(prop, isBinding);
          if (prop.type === "RestElement" && (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")) {
            this.raise(prop.argument.start, "Unexpected token");
          }
        }
        break;
      case "Property":
        if (node.kind !== "init") {
          this.raise(node.key.start, "Object pattern can't contain getter or setter");
        }
        this.toAssignable(node.value, isBinding);
        break;
      case "ArrayExpression":
        node.type = "ArrayPattern";
        if (refDestructuringErrors) {
          this.checkPatternErrors(refDestructuringErrors, true);
        }
        this.toAssignableList(node.elements, isBinding);
        break;
      case "SpreadElement":
        node.type = "RestElement";
        this.toAssignable(node.argument, isBinding);
        if (node.argument.type === "AssignmentPattern") {
          this.raise(node.argument.start, "Rest elements cannot have a default value");
        }
        break;
      case "AssignmentExpression":
        if (node.operator !== "=") {
          this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
        }
        node.type = "AssignmentPattern";
        delete node.operator;
        this.toAssignable(node.left, isBinding);
        break;
      case "ParenthesizedExpression":
        this.toAssignable(node.expression, isBinding, refDestructuringErrors);
        break;
      case "ChainExpression":
        this.raiseRecoverable(node.start, "Optional chaining cannot appear in left-hand side");
        break;
      case "MemberExpression":
        if (!isBinding) {
          break;
        }
      default:
        this.raise(node.start, "Assigning to rvalue");
    }
  } else if (refDestructuringErrors) {
    this.checkPatternErrors(refDestructuringErrors, true);
  }
  return node;
};
pp$7.toAssignableList = function(exprList, isBinding) {
  var end = exprList.length;
  for (var i = 0;i < end; i++) {
    var elt = exprList[i];
    if (elt) {
      this.toAssignable(elt, isBinding);
    }
  }
  if (end) {
    var last = exprList[end - 1];
    if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier") {
      this.unexpected(last.argument.start);
    }
  }
  return exprList;
};
pp$7.parseSpread = function(refDestructuringErrors) {
  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
  return this.finishNode(node, "SpreadElement");
};
pp$7.parseRestBinding = function() {
  var node = this.startNode();
  this.next();
  if (this.options.ecmaVersion === 6 && this.type !== types$1.name) {
    this.unexpected();
  }
  node.argument = this.parseBindingAtom();
  return this.finishNode(node, "RestElement");
};
pp$7.parseBindingAtom = function() {
  if (this.options.ecmaVersion >= 6) {
    switch (this.type) {
      case types$1.bracketL:
        var node = this.startNode();
        this.next();
        node.elements = this.parseBindingList(types$1.bracketR, true, true);
        return this.finishNode(node, "ArrayPattern");
      case types$1.braceL:
        return this.parseObj(true);
    }
  }
  return this.parseIdent();
};
pp$7.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowModifiers) {
  var elts = [], first = true;
  while (!this.eat(close)) {
    if (first) {
      first = false;
    } else {
      this.expect(types$1.comma);
    }
    if (allowEmpty && this.type === types$1.comma) {
      elts.push(null);
    } else if (allowTrailingComma && this.afterTrailingComma(close)) {
      break;
    } else if (this.type === types$1.ellipsis) {
      var rest = this.parseRestBinding();
      this.parseBindingListItem(rest);
      elts.push(rest);
      if (this.type === types$1.comma) {
        this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
      }
      this.expect(close);
      break;
    } else {
      elts.push(this.parseAssignableListItem(allowModifiers));
    }
  }
  return elts;
};
pp$7.parseAssignableListItem = function(allowModifiers) {
  var elem = this.parseMaybeDefault(this.start, this.startLoc);
  this.parseBindingListItem(elem);
  return elem;
};
pp$7.parseBindingListItem = function(param) {
  return param;
};
pp$7.parseMaybeDefault = function(startPos, startLoc, left) {
  left = left || this.parseBindingAtom();
  if (this.options.ecmaVersion < 6 || !this.eat(types$1.eq)) {
    return left;
  }
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.right = this.parseMaybeAssign();
  return this.finishNode(node, "AssignmentPattern");
};
pp$7.checkLValSimple = function(expr, bindingType, checkClashes) {
  if (bindingType === undefined)
    bindingType = BIND_NONE;
  var isBind = bindingType !== BIND_NONE;
  switch (expr.type) {
    case "Identifier":
      if (this.strict && this.reservedWordsStrictBind.test(expr.name)) {
        this.raiseRecoverable(expr.start, (isBind ? "Binding " : "Assigning to ") + expr.name + " in strict mode");
      }
      if (isBind) {
        if (bindingType === BIND_LEXICAL && expr.name === "let") {
          this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name");
        }
        if (checkClashes) {
          if (hasOwn(checkClashes, expr.name)) {
            this.raiseRecoverable(expr.start, "Argument name clash");
          }
          checkClashes[expr.name] = true;
        }
        if (bindingType !== BIND_OUTSIDE) {
          this.declareName(expr.name, bindingType, expr.start);
        }
      }
      break;
    case "ChainExpression":
      this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
      break;
    case "MemberExpression":
      if (isBind) {
        this.raiseRecoverable(expr.start, "Binding member expression");
      }
      break;
    case "ParenthesizedExpression":
      if (isBind) {
        this.raiseRecoverable(expr.start, "Binding parenthesized expression");
      }
      return this.checkLValSimple(expr.expression, bindingType, checkClashes);
    default:
      this.raise(expr.start, (isBind ? "Binding" : "Assigning to") + " rvalue");
  }
};
pp$7.checkLValPattern = function(expr, bindingType, checkClashes) {
  if (bindingType === undefined)
    bindingType = BIND_NONE;
  switch (expr.type) {
    case "ObjectPattern":
      for (var i = 0, list = expr.properties;i < list.length; i += 1) {
        var prop = list[i];
        this.checkLValInnerPattern(prop, bindingType, checkClashes);
      }
      break;
    case "ArrayPattern":
      for (var i$1 = 0, list$1 = expr.elements;i$1 < list$1.length; i$1 += 1) {
        var elem = list$1[i$1];
        if (elem) {
          this.checkLValInnerPattern(elem, bindingType, checkClashes);
        }
      }
      break;
    default:
      this.checkLValSimple(expr, bindingType, checkClashes);
  }
};
pp$7.checkLValInnerPattern = function(expr, bindingType, checkClashes) {
  if (bindingType === undefined)
    bindingType = BIND_NONE;
  switch (expr.type) {
    case "Property":
      this.checkLValInnerPattern(expr.value, bindingType, checkClashes);
      break;
    case "AssignmentPattern":
      this.checkLValPattern(expr.left, bindingType, checkClashes);
      break;
    case "RestElement":
      this.checkLValPattern(expr.argument, bindingType, checkClashes);
      break;
    default:
      this.checkLValPattern(expr, bindingType, checkClashes);
  }
};
var TokContext = function TokContext(token, isExpr, preserveSpace, override, generator) {
  this.token = token;
  this.isExpr = !!isExpr;
  this.preserveSpace = !!preserveSpace;
  this.override = override;
  this.generator = !!generator;
};
var types = {
  b_stat: new TokContext("{", false),
  b_expr: new TokContext("{", true),
  b_tmpl: new TokContext("${", false),
  p_stat: new TokContext("(", false),
  p_expr: new TokContext("(", true),
  q_tmpl: new TokContext("`", true, true, function(p) {
    return p.tryReadTemplateToken();
  }),
  f_stat: new TokContext("function", false),
  f_expr: new TokContext("function", true),
  f_expr_gen: new TokContext("function", true, false, null, true),
  f_gen: new TokContext("function", false, false, null, true)
};
var pp$6 = Parser.prototype;
pp$6.initialContext = function() {
  return [types.b_stat];
};
pp$6.curContext = function() {
  return this.context[this.context.length - 1];
};
pp$6.braceIsBlock = function(prevType) {
  var parent = this.curContext();
  if (parent === types.f_expr || parent === types.f_stat) {
    return true;
  }
  if (prevType === types$1.colon && (parent === types.b_stat || parent === types.b_expr)) {
    return !parent.isExpr;
  }
  if (prevType === types$1._return || prevType === types$1.name && this.exprAllowed) {
    return lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
  }
  if (prevType === types$1._else || prevType === types$1.semi || prevType === types$1.eof || prevType === types$1.parenR || prevType === types$1.arrow) {
    return true;
  }
  if (prevType === types$1.braceL) {
    return parent === types.b_stat;
  }
  if (prevType === types$1._var || prevType === types$1._const || prevType === types$1.name) {
    return false;
  }
  return !this.exprAllowed;
};
pp$6.inGeneratorContext = function() {
  for (var i = this.context.length - 1;i >= 1; i--) {
    var context = this.context[i];
    if (context.token === "function") {
      return context.generator;
    }
  }
  return false;
};
pp$6.updateContext = function(prevType) {
  var update, type = this.type;
  if (type.keyword && prevType === types$1.dot) {
    this.exprAllowed = false;
  } else if (update = type.updateContext) {
    update.call(this, prevType);
  } else {
    this.exprAllowed = type.beforeExpr;
  }
};
pp$6.overrideContext = function(tokenCtx) {
  if (this.curContext() !== tokenCtx) {
    this.context[this.context.length - 1] = tokenCtx;
  }
};
types$1.parenR.updateContext = types$1.braceR.updateContext = function() {
  if (this.context.length === 1) {
    this.exprAllowed = true;
    return;
  }
  var out = this.context.pop();
  if (out === types.b_stat && this.curContext().token === "function") {
    out = this.context.pop();
  }
  this.exprAllowed = !out.isExpr;
};
types$1.braceL.updateContext = function(prevType) {
  this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
  this.exprAllowed = true;
};
types$1.dollarBraceL.updateContext = function() {
  this.context.push(types.b_tmpl);
  this.exprAllowed = true;
};
types$1.parenL.updateContext = function(prevType) {
  var statementParens = prevType === types$1._if || prevType === types$1._for || prevType === types$1._with || prevType === types$1._while;
  this.context.push(statementParens ? types.p_stat : types.p_expr);
  this.exprAllowed = true;
};
types$1.incDec.updateContext = function() {};
types$1._function.updateContext = types$1._class.updateContext = function(prevType) {
  if (prevType.beforeExpr && prevType !== types$1._else && !(prevType === types$1.semi && this.curContext() !== types.p_stat) && !(prevType === types$1._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) && !((prevType === types$1.colon || prevType === types$1.braceL) && this.curContext() === types.b_stat)) {
    this.context.push(types.f_expr);
  } else {
    this.context.push(types.f_stat);
  }
  this.exprAllowed = false;
};
types$1.colon.updateContext = function() {
  if (this.curContext().token === "function") {
    this.context.pop();
  }
  this.exprAllowed = true;
};
types$1.backQuote.updateContext = function() {
  if (this.curContext() === types.q_tmpl) {
    this.context.pop();
  } else {
    this.context.push(types.q_tmpl);
  }
  this.exprAllowed = false;
};
types$1.star.updateContext = function(prevType) {
  if (prevType === types$1._function) {
    var index = this.context.length - 1;
    if (this.context[index] === types.f_expr) {
      this.context[index] = types.f_expr_gen;
    } else {
      this.context[index] = types.f_gen;
    }
  }
  this.exprAllowed = true;
};
types$1.name.updateContext = function(prevType) {
  var allowed = false;
  if (this.options.ecmaVersion >= 6 && prevType !== types$1.dot) {
    if (this.value === "of" && !this.exprAllowed || this.value === "yield" && this.inGeneratorContext()) {
      allowed = true;
    }
  }
  this.exprAllowed = allowed;
};
var pp$5 = Parser.prototype;
pp$5.checkPropClash = function(prop, propHash, refDestructuringErrors) {
  if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement") {
    return;
  }
  if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand)) {
    return;
  }
  var key = prop.key;
  var name;
  switch (key.type) {
    case "Identifier":
      name = key.name;
      break;
    case "Literal":
      name = String(key.value);
      break;
    default:
      return;
  }
  var kind = prop.kind;
  if (this.options.ecmaVersion >= 6) {
    if (name === "__proto__" && kind === "init") {
      if (propHash.proto) {
        if (refDestructuringErrors) {
          if (refDestructuringErrors.doubleProto < 0) {
            refDestructuringErrors.doubleProto = key.start;
          }
        } else {
          this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
        }
      }
      propHash.proto = true;
    }
    return;
  }
  name = "$" + name;
  var other = propHash[name];
  if (other) {
    var redefinition;
    if (kind === "init") {
      redefinition = this.strict && other.init || other.get || other.set;
    } else {
      redefinition = other.init || other[kind];
    }
    if (redefinition) {
      this.raiseRecoverable(key.start, "Redefinition of property");
    }
  } else {
    other = propHash[name] = {
      init: false,
      get: false,
      set: false
    };
  }
  other[kind] = true;
};
pp$5.parseExpression = function(forInit, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseMaybeAssign(forInit, refDestructuringErrors);
  if (this.type === types$1.comma) {
    var node = this.startNodeAt(startPos, startLoc);
    node.expressions = [expr];
    while (this.eat(types$1.comma)) {
      node.expressions.push(this.parseMaybeAssign(forInit, refDestructuringErrors));
    }
    return this.finishNode(node, "SequenceExpression");
  }
  return expr;
};
pp$5.parseMaybeAssign = function(forInit, refDestructuringErrors, afterLeftParse) {
  if (this.isContextual("yield")) {
    if (this.inGenerator) {
      return this.parseYield(forInit);
    } else {
      this.exprAllowed = false;
    }
  }
  var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldDoubleProto = -1;
  if (refDestructuringErrors) {
    oldParenAssign = refDestructuringErrors.parenthesizedAssign;
    oldTrailingComma = refDestructuringErrors.trailingComma;
    oldDoubleProto = refDestructuringErrors.doubleProto;
    refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
  } else {
    refDestructuringErrors = new DestructuringErrors;
    ownDestructuringErrors = true;
  }
  var startPos = this.start, startLoc = this.startLoc;
  if (this.type === types$1.parenL || this.type === types$1.name) {
    this.potentialArrowAt = this.start;
    this.potentialArrowInForAwait = forInit === "await";
  }
  var left = this.parseMaybeConditional(forInit, refDestructuringErrors);
  if (afterLeftParse) {
    left = afterLeftParse.call(this, left, startPos, startLoc);
  }
  if (this.type.isAssign) {
    var node = this.startNodeAt(startPos, startLoc);
    node.operator = this.value;
    if (this.type === types$1.eq) {
      left = this.toAssignable(left, false, refDestructuringErrors);
    }
    if (!ownDestructuringErrors) {
      refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1;
    }
    if (refDestructuringErrors.shorthandAssign >= left.start) {
      refDestructuringErrors.shorthandAssign = -1;
    }
    if (this.type === types$1.eq) {
      this.checkLValPattern(left);
    } else {
      this.checkLValSimple(left);
    }
    node.left = left;
    this.next();
    node.right = this.parseMaybeAssign(forInit);
    if (oldDoubleProto > -1) {
      refDestructuringErrors.doubleProto = oldDoubleProto;
    }
    return this.finishNode(node, "AssignmentExpression");
  } else {
    if (ownDestructuringErrors) {
      this.checkExpressionErrors(refDestructuringErrors, true);
    }
  }
  if (oldParenAssign > -1) {
    refDestructuringErrors.parenthesizedAssign = oldParenAssign;
  }
  if (oldTrailingComma > -1) {
    refDestructuringErrors.trailingComma = oldTrailingComma;
  }
  return left;
};
pp$5.parseMaybeConditional = function(forInit, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseExprOps(forInit, refDestructuringErrors);
  if (this.checkExpressionErrors(refDestructuringErrors)) {
    return expr;
  }
  if (this.eat(types$1.question)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.test = expr;
    node.consequent = this.parseMaybeAssign();
    this.expect(types$1.colon);
    node.alternate = this.parseMaybeAssign(forInit);
    return this.finishNode(node, "ConditionalExpression");
  }
  return expr;
};
pp$5.parseExprOps = function(forInit, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseMaybeUnary(refDestructuringErrors, false, false, forInit);
  if (this.checkExpressionErrors(refDestructuringErrors)) {
    return expr;
  }
  return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, forInit);
};
pp$5.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, forInit) {
  var prec = this.type.binop;
  if (prec != null && (!forInit || this.type !== types$1._in)) {
    if (prec > minPrec) {
      var logical = this.type === types$1.logicalOR || this.type === types$1.logicalAND;
      var coalesce = this.type === types$1.coalesce;
      if (coalesce) {
        prec = types$1.logicalAND.binop;
      }
      var op = this.value;
      this.next();
      var startPos = this.start, startLoc = this.startLoc;
      var right = this.parseExprOp(this.parseMaybeUnary(null, false, false, forInit), startPos, startLoc, prec, forInit);
      var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);
      if (logical && this.type === types$1.coalesce || coalesce && (this.type === types$1.logicalOR || this.type === types$1.logicalAND)) {
        this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
      }
      return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, forInit);
    }
  }
  return left;
};
pp$5.buildBinary = function(startPos, startLoc, left, right, op, logical) {
  if (right.type === "PrivateIdentifier") {
    this.raise(right.start, "Private identifier can only be left side of binary expression");
  }
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.operator = op;
  node.right = right;
  return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression");
};
pp$5.parseMaybeUnary = function(refDestructuringErrors, sawUnary, incDec, forInit) {
  var startPos = this.start, startLoc = this.startLoc, expr;
  if (this.isContextual("await") && this.canAwait) {
    expr = this.parseAwait(forInit);
    sawUnary = true;
  } else if (this.type.prefix) {
    var node = this.startNode(), update = this.type === types$1.incDec;
    node.operator = this.value;
    node.prefix = true;
    this.next();
    node.argument = this.parseMaybeUnary(null, true, update, forInit);
    this.checkExpressionErrors(refDestructuringErrors, true);
    if (update) {
      this.checkLValSimple(node.argument);
    } else if (this.strict && node.operator === "delete" && isLocalVariableAccess(node.argument)) {
      this.raiseRecoverable(node.start, "Deleting local variable in strict mode");
    } else if (node.operator === "delete" && isPrivateFieldAccess(node.argument)) {
      this.raiseRecoverable(node.start, "Private fields can not be deleted");
    } else {
      sawUnary = true;
    }
    expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
  } else if (!sawUnary && this.type === types$1.privateId) {
    if ((forInit || this.privateNameStack.length === 0) && this.options.checkPrivateFields) {
      this.unexpected();
    }
    expr = this.parsePrivateIdent();
    if (this.type !== types$1._in) {
      this.unexpected();
    }
  } else {
    expr = this.parseExprSubscripts(refDestructuringErrors, forInit);
    if (this.checkExpressionErrors(refDestructuringErrors)) {
      return expr;
    }
    while (this.type.postfix && !this.canInsertSemicolon()) {
      var node$1 = this.startNodeAt(startPos, startLoc);
      node$1.operator = this.value;
      node$1.prefix = false;
      node$1.argument = expr;
      this.checkLValSimple(expr);
      this.next();
      expr = this.finishNode(node$1, "UpdateExpression");
    }
  }
  if (!incDec && this.eat(types$1.starstar)) {
    if (sawUnary) {
      this.unexpected(this.lastTokStart);
    } else {
      return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false, false, forInit), "**", false);
    }
  } else {
    return expr;
  }
};
function isLocalVariableAccess(node) {
  return node.type === "Identifier" || node.type === "ParenthesizedExpression" && isLocalVariableAccess(node.expression);
}
function isPrivateFieldAccess(node) {
  return node.type === "MemberExpression" && node.property.type === "PrivateIdentifier" || node.type === "ChainExpression" && isPrivateFieldAccess(node.expression) || node.type === "ParenthesizedExpression" && isPrivateFieldAccess(node.expression);
}
pp$5.parseExprSubscripts = function(refDestructuringErrors, forInit) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseExprAtom(refDestructuringErrors, forInit);
  if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")") {
    return expr;
  }
  var result = this.parseSubscripts(expr, startPos, startLoc, false, forInit);
  if (refDestructuringErrors && result.type === "MemberExpression") {
    if (refDestructuringErrors.parenthesizedAssign >= result.start) {
      refDestructuringErrors.parenthesizedAssign = -1;
    }
    if (refDestructuringErrors.parenthesizedBind >= result.start) {
      refDestructuringErrors.parenthesizedBind = -1;
    }
    if (refDestructuringErrors.trailingComma >= result.start) {
      refDestructuringErrors.trailingComma = -1;
    }
  }
  return result;
};
pp$5.parseSubscripts = function(base, startPos, startLoc, noCalls, forInit) {
  var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" && this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 && this.potentialArrowAt === base.start;
  var optionalChained = false;
  while (true) {
    var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit);
    if (element.optional) {
      optionalChained = true;
    }
    if (element === base || element.type === "ArrowFunctionExpression") {
      if (optionalChained) {
        var chainNode = this.startNodeAt(startPos, startLoc);
        chainNode.expression = element;
        element = this.finishNode(chainNode, "ChainExpression");
      }
      return element;
    }
    base = element;
  }
};
pp$5.shouldParseAsyncArrow = function() {
  return !this.canInsertSemicolon() && this.eat(types$1.arrow);
};
pp$5.parseSubscriptAsyncArrow = function(startPos, startLoc, exprList, forInit) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true, forInit);
};
pp$5.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit) {
  var optionalSupported = this.options.ecmaVersion >= 11;
  var optional = optionalSupported && this.eat(types$1.questionDot);
  if (noCalls && optional) {
    this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions");
  }
  var computed = this.eat(types$1.bracketL);
  if (computed || optional && this.type !== types$1.parenL && this.type !== types$1.backQuote || this.eat(types$1.dot)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.object = base;
    if (computed) {
      node.property = this.parseExpression();
      this.expect(types$1.bracketR);
    } else if (this.type === types$1.privateId && base.type !== "Super") {
      node.property = this.parsePrivateIdent();
    } else {
      node.property = this.parseIdent(this.options.allowReserved !== "never");
    }
    node.computed = !!computed;
    if (optionalSupported) {
      node.optional = optional;
    }
    base = this.finishNode(node, "MemberExpression");
  } else if (!noCalls && this.eat(types$1.parenL)) {
    var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    var exprList = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
    if (maybeAsyncArrow && !optional && this.shouldParseAsyncArrow()) {
      this.checkPatternErrors(refDestructuringErrors, false);
      this.checkYieldAwaitInDefaultParams();
      if (this.awaitIdentPos > 0) {
        this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function");
      }
      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      this.awaitIdentPos = oldAwaitIdentPos;
      return this.parseSubscriptAsyncArrow(startPos, startLoc, exprList, forInit);
    }
    this.checkExpressionErrors(refDestructuringErrors, true);
    this.yieldPos = oldYieldPos || this.yieldPos;
    this.awaitPos = oldAwaitPos || this.awaitPos;
    this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
    var node$1 = this.startNodeAt(startPos, startLoc);
    node$1.callee = base;
    node$1.arguments = exprList;
    if (optionalSupported) {
      node$1.optional = optional;
    }
    base = this.finishNode(node$1, "CallExpression");
  } else if (this.type === types$1.backQuote) {
    if (optional || optionalChained) {
      this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
    }
    var node$2 = this.startNodeAt(startPos, startLoc);
    node$2.tag = base;
    node$2.quasi = this.parseTemplate({ isTagged: true });
    base = this.finishNode(node$2, "TaggedTemplateExpression");
  }
  return base;
};
pp$5.parseExprAtom = function(refDestructuringErrors, forInit, forNew) {
  if (this.type === types$1.slash) {
    this.readRegexp();
  }
  var node, canBeArrow = this.potentialArrowAt === this.start;
  switch (this.type) {
    case types$1._super:
      if (!this.allowSuper) {
        this.raise(this.start, "'super' keyword outside a method");
      }
      node = this.startNode();
      this.next();
      if (this.type === types$1.parenL && !this.allowDirectSuper) {
        this.raise(node.start, "super() call outside constructor of a subclass");
      }
      if (this.type !== types$1.dot && this.type !== types$1.bracketL && this.type !== types$1.parenL) {
        this.unexpected();
      }
      return this.finishNode(node, "Super");
    case types$1._this:
      node = this.startNode();
      this.next();
      return this.finishNode(node, "ThisExpression");
    case types$1.name:
      var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
      var id = this.parseIdent(false);
      if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types$1._function)) {
        this.overrideContext(types.f_expr);
        return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true, forInit);
      }
      if (canBeArrow && !this.canInsertSemicolon()) {
        if (this.eat(types$1.arrow)) {
          return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false, forInit);
        }
        if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types$1.name && !containsEsc && (!this.potentialArrowInForAwait || this.value !== "of" || this.containsEsc)) {
          id = this.parseIdent(false);
          if (this.canInsertSemicolon() || !this.eat(types$1.arrow)) {
            this.unexpected();
          }
          return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true, forInit);
        }
      }
      return id;
    case types$1.regexp:
      var value = this.value;
      node = this.parseLiteral(value.value);
      node.regex = { pattern: value.pattern, flags: value.flags };
      return node;
    case types$1.num:
    case types$1.string:
      return this.parseLiteral(this.value);
    case types$1._null:
    case types$1._true:
    case types$1._false:
      node = this.startNode();
      node.value = this.type === types$1._null ? null : this.type === types$1._true;
      node.raw = this.type.keyword;
      this.next();
      return this.finishNode(node, "Literal");
    case types$1.parenL:
      var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow, forInit);
      if (refDestructuringErrors) {
        if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr)) {
          refDestructuringErrors.parenthesizedAssign = start;
        }
        if (refDestructuringErrors.parenthesizedBind < 0) {
          refDestructuringErrors.parenthesizedBind = start;
        }
      }
      return expr;
    case types$1.bracketL:
      node = this.startNode();
      this.next();
      node.elements = this.parseExprList(types$1.bracketR, true, true, refDestructuringErrors);
      return this.finishNode(node, "ArrayExpression");
    case types$1.braceL:
      this.overrideContext(types.b_expr);
      return this.parseObj(false, refDestructuringErrors);
    case types$1._function:
      node = this.startNode();
      this.next();
      return this.parseFunction(node, 0);
    case types$1._class:
      return this.parseClass(this.startNode(), false);
    case types$1._new:
      return this.parseNew();
    case types$1.backQuote:
      return this.parseTemplate();
    case types$1._import:
      if (this.options.ecmaVersion >= 11) {
        return this.parseExprImport(forNew);
      } else {
        return this.unexpected();
      }
    default:
      return this.parseExprAtomDefault();
  }
};
pp$5.parseExprAtomDefault = function() {
  this.unexpected();
};
pp$5.parseExprImport = function(forNew) {
  var node = this.startNode();
  if (this.containsEsc) {
    this.raiseRecoverable(this.start, "Escape sequence in keyword import");
  }
  this.next();
  if (this.type === types$1.parenL && !forNew) {
    return this.parseDynamicImport(node);
  } else if (this.type === types$1.dot) {
    var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
    meta.name = "import";
    node.meta = this.finishNode(meta, "Identifier");
    return this.parseImportMeta(node);
  } else {
    this.unexpected();
  }
};
pp$5.parseDynamicImport = function(node) {
  this.next();
  node.source = this.parseMaybeAssign();
  if (this.options.ecmaVersion >= 16) {
    if (!this.eat(types$1.parenR)) {
      this.expect(types$1.comma);
      if (!this.afterTrailingComma(types$1.parenR)) {
        node.options = this.parseMaybeAssign();
        if (!this.eat(types$1.parenR)) {
          this.expect(types$1.comma);
          if (!this.afterTrailingComma(types$1.parenR)) {
            this.unexpected();
          }
        }
      } else {
        node.options = null;
      }
    } else {
      node.options = null;
    }
  } else {
    if (!this.eat(types$1.parenR)) {
      var errorPos = this.start;
      if (this.eat(types$1.comma) && this.eat(types$1.parenR)) {
        this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import\u0028)");
      } else {
        this.unexpected(errorPos);
      }
    }
  }
  return this.finishNode(node, "ImportExpression");
};
pp$5.parseImportMeta = function(node) {
  this.next();
  var containsEsc = this.containsEsc;
  node.property = this.parseIdent(true);
  if (node.property.name !== "meta") {
    this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'");
  }
  if (containsEsc) {
    this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters");
  }
  if (this.options.sourceType !== "module" && !this.options.allowImportExportEverywhere) {
    this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module");
  }
  return this.finishNode(node, "MetaProperty");
};
pp$5.parseLiteral = function(value) {
  var node = this.startNode();
  node.value = value;
  node.raw = this.input.slice(this.start, this.end);
  if (node.raw.charCodeAt(node.raw.length - 1) === 110) {
    node.bigint = node.value != null ? node.value.toString() : node.raw.slice(0, -1).replace(/_/g, "");
  }
  this.next();
  return this.finishNode(node, "Literal");
};
pp$5.parseParenExpression = function() {
  this.expect(types$1.parenL);
  var val = this.parseExpression();
  this.expect(types$1.parenR);
  return val;
};
pp$5.shouldParseArrow = function(exprList) {
  return !this.canInsertSemicolon();
};
pp$5.parseParenAndDistinguishExpression = function(canBeArrow, forInit) {
  var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
  if (this.options.ecmaVersion >= 6) {
    this.next();
    var innerStartPos = this.start, innerStartLoc = this.startLoc;
    var exprList = [], first = true, lastIsComma = false;
    var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
    this.yieldPos = 0;
    this.awaitPos = 0;
    while (this.type !== types$1.parenR) {
      first ? first = false : this.expect(types$1.comma);
      if (allowTrailingComma && this.afterTrailingComma(types$1.parenR, true)) {
        lastIsComma = true;
        break;
      } else if (this.type === types$1.ellipsis) {
        spreadStart = this.start;
        exprList.push(this.parseParenItem(this.parseRestBinding()));
        if (this.type === types$1.comma) {
          this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
        }
        break;
      } else {
        exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
      }
    }
    var innerEndPos = this.lastTokEnd, innerEndLoc = this.lastTokEndLoc;
    this.expect(types$1.parenR);
    if (canBeArrow && this.shouldParseArrow(exprList) && this.eat(types$1.arrow)) {
      this.checkPatternErrors(refDestructuringErrors, false);
      this.checkYieldAwaitInDefaultParams();
      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      return this.parseParenArrowList(startPos, startLoc, exprList, forInit);
    }
    if (!exprList.length || lastIsComma) {
      this.unexpected(this.lastTokStart);
    }
    if (spreadStart) {
      this.unexpected(spreadStart);
    }
    this.checkExpressionErrors(refDestructuringErrors, true);
    this.yieldPos = oldYieldPos || this.yieldPos;
    this.awaitPos = oldAwaitPos || this.awaitPos;
    if (exprList.length > 1) {
      val = this.startNodeAt(innerStartPos, innerStartLoc);
      val.expressions = exprList;
      this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
    } else {
      val = exprList[0];
    }
  } else {
    val = this.parseParenExpression();
  }
  if (this.options.preserveParens) {
    var par = this.startNodeAt(startPos, startLoc);
    par.expression = val;
    return this.finishNode(par, "ParenthesizedExpression");
  } else {
    return val;
  }
};
pp$5.parseParenItem = function(item) {
  return item;
};
pp$5.parseParenArrowList = function(startPos, startLoc, exprList, forInit) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, false, forInit);
};
var empty3 = [];
pp$5.parseNew = function() {
  if (this.containsEsc) {
    this.raiseRecoverable(this.start, "Escape sequence in keyword new");
  }
  var node = this.startNode();
  this.next();
  if (this.options.ecmaVersion >= 6 && this.type === types$1.dot) {
    var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
    meta.name = "new";
    node.meta = this.finishNode(meta, "Identifier");
    this.next();
    var containsEsc = this.containsEsc;
    node.property = this.parseIdent(true);
    if (node.property.name !== "target") {
      this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'");
    }
    if (containsEsc) {
      this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters");
    }
    if (!this.allowNewDotTarget) {
      this.raiseRecoverable(node.start, "'new.target' can only be used in functions and class static block");
    }
    return this.finishNode(node, "MetaProperty");
  }
  var startPos = this.start, startLoc = this.startLoc;
  node.callee = this.parseSubscripts(this.parseExprAtom(null, false, true), startPos, startLoc, true, false);
  if (this.eat(types$1.parenL)) {
    node.arguments = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false);
  } else {
    node.arguments = empty3;
  }
  return this.finishNode(node, "NewExpression");
};
pp$5.parseTemplateElement = function(ref) {
  var isTagged = ref.isTagged;
  var elem = this.startNode();
  if (this.type === types$1.invalidTemplate) {
    if (!isTagged) {
      this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
    }
    elem.value = {
      raw: this.value.replace(/\r\n?/g, `
`),
      cooked: null
    };
  } else {
    elem.value = {
      raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, `
`),
      cooked: this.value
    };
  }
  this.next();
  elem.tail = this.type === types$1.backQuote;
  return this.finishNode(elem, "TemplateElement");
};
pp$5.parseTemplate = function(ref) {
  if (ref === undefined)
    ref = {};
  var isTagged = ref.isTagged;
  if (isTagged === undefined)
    isTagged = false;
  var node = this.startNode();
  this.next();
  node.expressions = [];
  var curElt = this.parseTemplateElement({ isTagged });
  node.quasis = [curElt];
  while (!curElt.tail) {
    if (this.type === types$1.eof) {
      this.raise(this.pos, "Unterminated template literal");
    }
    this.expect(types$1.dollarBraceL);
    node.expressions.push(this.parseExpression());
    this.expect(types$1.braceR);
    node.quasis.push(curElt = this.parseTemplateElement({ isTagged }));
  }
  this.next();
  return this.finishNode(node, "TemplateLiteral");
};
pp$5.isAsyncProp = function(prop) {
  return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" && (this.type === types$1.name || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword || this.options.ecmaVersion >= 9 && this.type === types$1.star) && !lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
};
pp$5.parseObj = function(isPattern, refDestructuringErrors) {
  var node = this.startNode(), first = true, propHash = {};
  node.properties = [];
  this.next();
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types$1.braceR)) {
        break;
      }
    } else {
      first = false;
    }
    var prop = this.parseProperty(isPattern, refDestructuringErrors);
    if (!isPattern) {
      this.checkPropClash(prop, propHash, refDestructuringErrors);
    }
    node.properties.push(prop);
  }
  return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
};
pp$5.parseProperty = function(isPattern, refDestructuringErrors) {
  var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
  if (this.options.ecmaVersion >= 9 && this.eat(types$1.ellipsis)) {
    if (isPattern) {
      prop.argument = this.parseIdent(false);
      if (this.type === types$1.comma) {
        this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
      }
      return this.finishNode(prop, "RestElement");
    }
    prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
    if (this.type === types$1.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
      refDestructuringErrors.trailingComma = this.start;
    }
    return this.finishNode(prop, "SpreadElement");
  }
  if (this.options.ecmaVersion >= 6) {
    prop.method = false;
    prop.shorthand = false;
    if (isPattern || refDestructuringErrors) {
      startPos = this.start;
      startLoc = this.startLoc;
    }
    if (!isPattern) {
      isGenerator = this.eat(types$1.star);
    }
  }
  var containsEsc = this.containsEsc;
  this.parsePropertyName(prop);
  if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
    isAsync = true;
    isGenerator = this.options.ecmaVersion >= 9 && this.eat(types$1.star);
    this.parsePropertyName(prop);
  } else {
    isAsync = false;
  }
  this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
  return this.finishNode(prop, "Property");
};
pp$5.parseGetterSetter = function(prop) {
  var kind = prop.key.name;
  this.parsePropertyName(prop);
  prop.value = this.parseMethod(false);
  prop.kind = kind;
  var paramCount = prop.kind === "get" ? 0 : 1;
  if (prop.value.params.length !== paramCount) {
    var start = prop.value.start;
    if (prop.kind === "get") {
      this.raiseRecoverable(start, "getter should have no params");
    } else {
      this.raiseRecoverable(start, "setter should have exactly one param");
    }
  } else {
    if (prop.kind === "set" && prop.value.params[0].type === "RestElement") {
      this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params");
    }
  }
};
pp$5.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
  if ((isGenerator || isAsync) && this.type === types$1.colon) {
    this.unexpected();
  }
  if (this.eat(types$1.colon)) {
    prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
    prop.kind = "init";
  } else if (this.options.ecmaVersion >= 6 && this.type === types$1.parenL) {
    if (isPattern) {
      this.unexpected();
    }
    prop.method = true;
    prop.value = this.parseMethod(isGenerator, isAsync);
    prop.kind = "init";
  } else if (!isPattern && !containsEsc && this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set") && (this.type !== types$1.comma && this.type !== types$1.braceR && this.type !== types$1.eq)) {
    if (isGenerator || isAsync) {
      this.unexpected();
    }
    this.parseGetterSetter(prop);
  } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
    if (isGenerator || isAsync) {
      this.unexpected();
    }
    this.checkUnreserved(prop.key);
    if (prop.key.name === "await" && !this.awaitIdentPos) {
      this.awaitIdentPos = startPos;
    }
    if (isPattern) {
      prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
    } else if (this.type === types$1.eq && refDestructuringErrors) {
      if (refDestructuringErrors.shorthandAssign < 0) {
        refDestructuringErrors.shorthandAssign = this.start;
      }
      prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
    } else {
      prop.value = this.copyNode(prop.key);
    }
    prop.kind = "init";
    prop.shorthand = true;
  } else {
    this.unexpected();
  }
};
pp$5.parsePropertyName = function(prop) {
  if (this.options.ecmaVersion >= 6) {
    if (this.eat(types$1.bracketL)) {
      prop.computed = true;
      prop.key = this.parseMaybeAssign();
      this.expect(types$1.bracketR);
      return prop.key;
    } else {
      prop.computed = false;
    }
  }
  return prop.key = this.type === types$1.num || this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
};
pp$5.initFunction = function(node) {
  node.id = null;
  if (this.options.ecmaVersion >= 6) {
    node.generator = node.expression = false;
  }
  if (this.options.ecmaVersion >= 8) {
    node.async = false;
  }
};
pp$5.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
  var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
  this.initFunction(node);
  if (this.options.ecmaVersion >= 6) {
    node.generator = isGenerator;
  }
  if (this.options.ecmaVersion >= 8) {
    node.async = !!isAsync;
  }
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));
  this.expect(types$1.parenL);
  node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
  this.parseFunctionBody(node, false, true, false);
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, "FunctionExpression");
};
pp$5.parseArrowExpression = function(node, params, isAsync, forInit) {
  var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
  this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
  this.initFunction(node);
  if (this.options.ecmaVersion >= 8) {
    node.async = !!isAsync;
  }
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  node.params = this.toAssignableList(params, true);
  this.parseFunctionBody(node, true, false, forInit);
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, "ArrowFunctionExpression");
};
pp$5.parseFunctionBody = function(node, isArrowFunction, isMethod, forInit) {
  var isExpression = isArrowFunction && this.type !== types$1.braceL;
  var oldStrict = this.strict, useStrict = false;
  if (isExpression) {
    node.body = this.parseMaybeAssign(forInit);
    node.expression = true;
    this.checkParams(node, false);
  } else {
    var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
    if (!oldStrict || nonSimple) {
      useStrict = this.strictDirective(this.end);
      if (useStrict && nonSimple) {
        this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list");
      }
    }
    var oldLabels = this.labels;
    this.labels = [];
    if (useStrict) {
      this.strict = true;
    }
    this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
    if (this.strict && node.id) {
      this.checkLValSimple(node.id, BIND_OUTSIDE);
    }
    node.body = this.parseBlock(false, undefined, useStrict && !oldStrict);
    node.expression = false;
    this.adaptDirectivePrologue(node.body.body);
    this.labels = oldLabels;
  }
  this.exitScope();
};
pp$5.isSimpleParamList = function(params) {
  for (var i = 0, list = params;i < list.length; i += 1) {
    var param = list[i];
    if (param.type !== "Identifier") {
      return false;
    }
  }
  return true;
};
pp$5.checkParams = function(node, allowDuplicates) {
  var nameHash = Object.create(null);
  for (var i = 0, list = node.params;i < list.length; i += 1) {
    var param = list[i];
    this.checkLValInnerPattern(param, BIND_VAR, allowDuplicates ? null : nameHash);
  }
};
pp$5.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
  var elts = [], first = true;
  while (!this.eat(close)) {
    if (!first) {
      this.expect(types$1.comma);
      if (allowTrailingComma && this.afterTrailingComma(close)) {
        break;
      }
    } else {
      first = false;
    }
    var elt = undefined;
    if (allowEmpty && this.type === types$1.comma) {
      elt = null;
    } else if (this.type === types$1.ellipsis) {
      elt = this.parseSpread(refDestructuringErrors);
      if (refDestructuringErrors && this.type === types$1.comma && refDestructuringErrors.trailingComma < 0) {
        refDestructuringErrors.trailingComma = this.start;
      }
    } else {
      elt = this.parseMaybeAssign(false, refDestructuringErrors);
    }
    elts.push(elt);
  }
  return elts;
};
pp$5.checkUnreserved = function(ref) {
  var start = ref.start;
  var end = ref.end;
  var name = ref.name;
  if (this.inGenerator && name === "yield") {
    this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator");
  }
  if (this.inAsync && name === "await") {
    this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function");
  }
  if (!(this.currentThisScope().flags & SCOPE_VAR) && name === "arguments") {
    this.raiseRecoverable(start, "Cannot use 'arguments' in class field initializer");
  }
  if (this.inClassStaticBlock && (name === "arguments" || name === "await")) {
    this.raise(start, "Cannot use " + name + " in class static initialization block");
  }
  if (this.keywords.test(name)) {
    this.raise(start, "Unexpected keyword '" + name + "'");
  }
  if (this.options.ecmaVersion < 6 && this.input.slice(start, end).indexOf("\\") !== -1) {
    return;
  }
  var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
  if (re.test(name)) {
    if (!this.inAsync && name === "await") {
      this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function");
    }
    this.raiseRecoverable(start, "The keyword '" + name + "' is reserved");
  }
};
pp$5.parseIdent = function(liberal) {
  var node = this.parseIdentNode();
  this.next(!!liberal);
  this.finishNode(node, "Identifier");
  if (!liberal) {
    this.checkUnreserved(node);
    if (node.name === "await" && !this.awaitIdentPos) {
      this.awaitIdentPos = node.start;
    }
  }
  return node;
};
pp$5.parseIdentNode = function() {
  var node = this.startNode();
  if (this.type === types$1.name) {
    node.name = this.value;
  } else if (this.type.keyword) {
    node.name = this.type.keyword;
    if ((node.name === "class" || node.name === "function") && (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
      this.context.pop();
    }
    this.type = types$1.name;
  } else {
    this.unexpected();
  }
  return node;
};
pp$5.parsePrivateIdent = function() {
  var node = this.startNode();
  if (this.type === types$1.privateId) {
    node.name = this.value;
  } else {
    this.unexpected();
  }
  this.next();
  this.finishNode(node, "PrivateIdentifier");
  if (this.options.checkPrivateFields) {
    if (this.privateNameStack.length === 0) {
      this.raise(node.start, "Private field '#" + node.name + "' must be declared in an enclosing class");
    } else {
      this.privateNameStack[this.privateNameStack.length - 1].used.push(node);
    }
  }
  return node;
};
pp$5.parseYield = function(forInit) {
  if (!this.yieldPos) {
    this.yieldPos = this.start;
  }
  var node = this.startNode();
  this.next();
  if (this.type === types$1.semi || this.canInsertSemicolon() || this.type !== types$1.star && !this.type.startsExpr) {
    node.delegate = false;
    node.argument = null;
  } else {
    node.delegate = this.eat(types$1.star);
    node.argument = this.parseMaybeAssign(forInit);
  }
  return this.finishNode(node, "YieldExpression");
};
pp$5.parseAwait = function(forInit) {
  if (!this.awaitPos) {
    this.awaitPos = this.start;
  }
  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeUnary(null, true, false, forInit);
  return this.finishNode(node, "AwaitExpression");
};
var pp$4 = Parser.prototype;
pp$4.raise = function(pos, message) {
  var loc = getLineInfo(this.input, pos);
  message += " (" + loc.line + ":" + loc.column + ")";
  if (this.sourceFile) {
    message += " in " + this.sourceFile;
  }
  var err = new SyntaxError(message);
  err.pos = pos;
  err.loc = loc;
  err.raisedAt = this.pos;
  throw err;
};
pp$4.raiseRecoverable = pp$4.raise;
pp$4.curPosition = function() {
  if (this.options.locations) {
    return new Position(this.curLine, this.pos - this.lineStart);
  }
};
var pp$3 = Parser.prototype;
var Scope = function Scope(flags) {
  this.flags = flags;
  this.var = [];
  this.lexical = [];
  this.functions = [];
};
pp$3.enterScope = function(flags) {
  this.scopeStack.push(new Scope(flags));
};
pp$3.exitScope = function() {
  this.scopeStack.pop();
};
pp$3.treatFunctionsAsVarInScope = function(scope) {
  return scope.flags & SCOPE_FUNCTION || !this.inModule && scope.flags & SCOPE_TOP;
};
pp$3.declareName = function(name, bindingType, pos) {
  var redeclared = false;
  if (bindingType === BIND_LEXICAL) {
    var scope = this.currentScope();
    redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
    scope.lexical.push(name);
    if (this.inModule && scope.flags & SCOPE_TOP) {
      delete this.undefinedExports[name];
    }
  } else if (bindingType === BIND_SIMPLE_CATCH) {
    var scope$1 = this.currentScope();
    scope$1.lexical.push(name);
  } else if (bindingType === BIND_FUNCTION) {
    var scope$2 = this.currentScope();
    if (this.treatFunctionsAsVar) {
      redeclared = scope$2.lexical.indexOf(name) > -1;
    } else {
      redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1;
    }
    scope$2.functions.push(name);
  } else {
    for (var i = this.scopeStack.length - 1;i >= 0; --i) {
      var scope$3 = this.scopeStack[i];
      if (scope$3.lexical.indexOf(name) > -1 && !(scope$3.flags & SCOPE_SIMPLE_CATCH && scope$3.lexical[0] === name) || !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
        redeclared = true;
        break;
      }
      scope$3.var.push(name);
      if (this.inModule && scope$3.flags & SCOPE_TOP) {
        delete this.undefinedExports[name];
      }
      if (scope$3.flags & SCOPE_VAR) {
        break;
      }
    }
  }
  if (redeclared) {
    this.raiseRecoverable(pos, "Identifier '" + name + "' has already been declared");
  }
};
pp$3.checkLocalExport = function(id) {
  if (this.scopeStack[0].lexical.indexOf(id.name) === -1 && this.scopeStack[0].var.indexOf(id.name) === -1) {
    this.undefinedExports[id.name] = id;
  }
};
pp$3.currentScope = function() {
  return this.scopeStack[this.scopeStack.length - 1];
};
pp$3.currentVarScope = function() {
  for (var i = this.scopeStack.length - 1;; i--) {
    var scope = this.scopeStack[i];
    if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK)) {
      return scope;
    }
  }
};
pp$3.currentThisScope = function() {
  for (var i = this.scopeStack.length - 1;; i--) {
    var scope = this.scopeStack[i];
    if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK) && !(scope.flags & SCOPE_ARROW)) {
      return scope;
    }
  }
};
var Node = function Node(parser, pos, loc) {
  this.type = "";
  this.start = pos;
  this.end = 0;
  if (parser.options.locations) {
    this.loc = new SourceLocation(parser, loc);
  }
  if (parser.options.directSourceFile) {
    this.sourceFile = parser.options.directSourceFile;
  }
  if (parser.options.ranges) {
    this.range = [pos, 0];
  }
};
var pp$2 = Parser.prototype;
pp$2.startNode = function() {
  return new Node(this, this.start, this.startLoc);
};
pp$2.startNodeAt = function(pos, loc) {
  return new Node(this, pos, loc);
};
function finishNodeAt(node, type, pos, loc) {
  node.type = type;
  node.end = pos;
  if (this.options.locations) {
    node.loc.end = loc;
  }
  if (this.options.ranges) {
    node.range[1] = pos;
  }
  return node;
}
pp$2.finishNode = function(node, type) {
  return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc);
};
pp$2.finishNodeAt = function(node, type, pos, loc) {
  return finishNodeAt.call(this, node, type, pos, loc);
};
pp$2.copyNode = function(node) {
  var newNode = new Node(this, node.start, this.startLoc);
  for (var prop in node) {
    newNode[prop] = node[prop];
  }
  return newNode;
};
var scriptValuesAddedInUnicode = "Gara Garay Gukh Gurung_Khema Hrkt Katakana_Or_Hiragana Kawi Kirat_Rai Krai Nag_Mundari Nagm Ol_Onal Onao Sunu Sunuwar Todhri Todr Tulu_Tigalari Tutg Unknown Zzzz";
var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
var ecma11BinaryProperties = ecma10BinaryProperties;
var ecma12BinaryProperties = ecma11BinaryProperties + " EBase EComp EMod EPres ExtPict";
var ecma13BinaryProperties = ecma12BinaryProperties;
var ecma14BinaryProperties = ecma13BinaryProperties;
var unicodeBinaryProperties = {
  9: ecma9BinaryProperties,
  10: ecma10BinaryProperties,
  11: ecma11BinaryProperties,
  12: ecma12BinaryProperties,
  13: ecma13BinaryProperties,
  14: ecma14BinaryProperties
};
var ecma14BinaryPropertiesOfStrings = "Basic_Emoji Emoji_Keycap_Sequence RGI_Emoji_Modifier_Sequence RGI_Emoji_Flag_Sequence RGI_Emoji_Tag_Sequence RGI_Emoji_ZWJ_Sequence RGI_Emoji";
var unicodeBinaryPropertiesOfStrings = {
  9: "",
  10: "",
  11: "",
  12: "",
  13: "",
  14: ecma14BinaryPropertiesOfStrings
};
var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";
var ecma9ScriptValues = "Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
var ecma12ScriptValues = ecma11ScriptValues + " Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi";
var ecma13ScriptValues = ecma12ScriptValues + " Cypro_Minoan Cpmn Old_Uyghur Ougr Tangsa Tnsa Toto Vithkuqi Vith";
var ecma14ScriptValues = ecma13ScriptValues + " " + scriptValuesAddedInUnicode;
var unicodeScriptValues = {
  9: ecma9ScriptValues,
  10: ecma10ScriptValues,
  11: ecma11ScriptValues,
  12: ecma12ScriptValues,
  13: ecma13ScriptValues,
  14: ecma14ScriptValues
};
var data = {};
function buildUnicodeData(ecmaVersion) {
  var d = data[ecmaVersion] = {
    binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion] + " " + unicodeGeneralCategoryValues),
    binaryOfStrings: wordsRegexp(unicodeBinaryPropertiesOfStrings[ecmaVersion]),
    nonBinary: {
      General_Category: wordsRegexp(unicodeGeneralCategoryValues),
      Script: wordsRegexp(unicodeScriptValues[ecmaVersion])
    }
  };
  d.nonBinary.Script_Extensions = d.nonBinary.Script;
  d.nonBinary.gc = d.nonBinary.General_Category;
  d.nonBinary.sc = d.nonBinary.Script;
  d.nonBinary.scx = d.nonBinary.Script_Extensions;
}
for (i = 0, list = [9, 10, 11, 12, 13, 14];i < list.length; i += 1) {
  ecmaVersion = list[i];
  buildUnicodeData(ecmaVersion);
}
var ecmaVersion;
var i;
var list;
var pp$1 = Parser.prototype;
var BranchID = function BranchID(parent, base) {
  this.parent = parent;
  this.base = base || this;
};
BranchID.prototype.separatedFrom = function separatedFrom(alt) {
  for (var self = this;self; self = self.parent) {
    for (var other = alt;other; other = other.parent) {
      if (self.base === other.base && self !== other) {
        return true;
      }
    }
  }
  return false;
};
BranchID.prototype.sibling = function sibling() {
  return new BranchID(this.parent, this.base);
};
var RegExpValidationState = function RegExpValidationState(parser) {
  this.parser = parser;
  this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "") + (parser.options.ecmaVersion >= 13 ? "d" : "") + (parser.options.ecmaVersion >= 15 ? "v" : "");
  this.unicodeProperties = data[parser.options.ecmaVersion >= 14 ? 14 : parser.options.ecmaVersion];
  this.source = "";
  this.flags = "";
  this.start = 0;
  this.switchU = false;
  this.switchV = false;
  this.switchN = false;
  this.pos = 0;
  this.lastIntValue = 0;
  this.lastStringValue = "";
  this.lastAssertionIsQuantifiable = false;
  this.numCapturingParens = 0;
  this.maxBackReference = 0;
  this.groupNames = Object.create(null);
  this.backReferenceNames = [];
  this.branchID = null;
};
RegExpValidationState.prototype.reset = function reset(start, pattern, flags) {
  var unicodeSets = flags.indexOf("v") !== -1;
  var unicode = flags.indexOf("u") !== -1;
  this.start = start | 0;
  this.source = pattern + "";
  this.flags = flags;
  if (unicodeSets && this.parser.options.ecmaVersion >= 15) {
    this.switchU = true;
    this.switchV = true;
    this.switchN = true;
  } else {
    this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
    this.switchV = false;
    this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
  }
};
RegExpValidationState.prototype.raise = function raise(message) {
  this.parser.raiseRecoverable(this.start, "Invalid regular expression: /" + this.source + "/: " + message);
};
RegExpValidationState.prototype.at = function at(i, forceU) {
  if (forceU === undefined)
    forceU = false;
  var s = this.source;
  var l = s.length;
  if (i >= l) {
    return -1;
  }
  var c = s.charCodeAt(i);
  if (!(forceU || this.switchU) || c <= 55295 || c >= 57344 || i + 1 >= l) {
    return c;
  }
  var next = s.charCodeAt(i + 1);
  return next >= 56320 && next <= 57343 ? (c << 10) + next - 56613888 : c;
};
RegExpValidationState.prototype.nextIndex = function nextIndex(i, forceU) {
  if (forceU === undefined)
    forceU = false;
  var s = this.source;
  var l = s.length;
  if (i >= l) {
    return l;
  }
  var c = s.charCodeAt(i), next;
  if (!(forceU || this.switchU) || c <= 55295 || c >= 57344 || i + 1 >= l || (next = s.charCodeAt(i + 1)) < 56320 || next > 57343) {
    return i + 1;
  }
  return i + 2;
};
RegExpValidationState.prototype.current = function current(forceU) {
  if (forceU === undefined)
    forceU = false;
  return this.at(this.pos, forceU);
};
RegExpValidationState.prototype.lookahead = function lookahead(forceU) {
  if (forceU === undefined)
    forceU = false;
  return this.at(this.nextIndex(this.pos, forceU), forceU);
};
RegExpValidationState.prototype.advance = function advance(forceU) {
  if (forceU === undefined)
    forceU = false;
  this.pos = this.nextIndex(this.pos, forceU);
};
RegExpValidationState.prototype.eat = function eat(ch, forceU) {
  if (forceU === undefined)
    forceU = false;
  if (this.current(forceU) === ch) {
    this.advance(forceU);
    return true;
  }
  return false;
};
RegExpValidationState.prototype.eatChars = function eatChars(chs, forceU) {
  if (forceU === undefined)
    forceU = false;
  var pos = this.pos;
  for (var i = 0, list = chs;i < list.length; i += 1) {
    var ch = list[i];
    var current = this.at(pos, forceU);
    if (current === -1 || current !== ch) {
      return false;
    }
    pos = this.nextIndex(pos, forceU);
  }
  this.pos = pos;
  return true;
};
pp$1.validateRegExpFlags = function(state) {
  var validFlags = state.validFlags;
  var flags = state.flags;
  var u = false;
  var v = false;
  for (var i = 0;i < flags.length; i++) {
    var flag = flags.charAt(i);
    if (validFlags.indexOf(flag) === -1) {
      this.raise(state.start, "Invalid regular expression flag");
    }
    if (flags.indexOf(flag, i + 1) > -1) {
      this.raise(state.start, "Duplicate regular expression flag");
    }
    if (flag === "u") {
      u = true;
    }
    if (flag === "v") {
      v = true;
    }
  }
  if (this.options.ecmaVersion >= 15 && u && v) {
    this.raise(state.start, "Invalid regular expression flag");
  }
};
function hasProp(obj) {
  for (var _ in obj) {
    return true;
  }
  return false;
}
pp$1.validateRegExpPattern = function(state) {
  this.regexp_pattern(state);
  if (!state.switchN && this.options.ecmaVersion >= 9 && hasProp(state.groupNames)) {
    state.switchN = true;
    this.regexp_pattern(state);
  }
};
pp$1.regexp_pattern = function(state) {
  state.pos = 0;
  state.lastIntValue = 0;
  state.lastStringValue = "";
  state.lastAssertionIsQuantifiable = false;
  state.numCapturingParens = 0;
  state.maxBackReference = 0;
  state.groupNames = Object.create(null);
  state.backReferenceNames.length = 0;
  state.branchID = null;
  this.regexp_disjunction(state);
  if (state.pos !== state.source.length) {
    if (state.eat(41)) {
      state.raise("Unmatched ')'");
    }
    if (state.eat(93) || state.eat(125)) {
      state.raise("Lone quantifier brackets");
    }
  }
  if (state.maxBackReference > state.numCapturingParens) {
    state.raise("Invalid escape");
  }
  for (var i = 0, list = state.backReferenceNames;i < list.length; i += 1) {
    var name = list[i];
    if (!state.groupNames[name]) {
      state.raise("Invalid named capture referenced");
    }
  }
};
pp$1.regexp_disjunction = function(state) {
  var trackDisjunction = this.options.ecmaVersion >= 16;
  if (trackDisjunction) {
    state.branchID = new BranchID(state.branchID, null);
  }
  this.regexp_alternative(state);
  while (state.eat(124)) {
    if (trackDisjunction) {
      state.branchID = state.branchID.sibling();
    }
    this.regexp_alternative(state);
  }
  if (trackDisjunction) {
    state.branchID = state.branchID.parent;
  }
  if (this.regexp_eatQuantifier(state, true)) {
    state.raise("Nothing to repeat");
  }
  if (state.eat(123)) {
    state.raise("Lone quantifier brackets");
  }
};
pp$1.regexp_alternative = function(state) {
  while (state.pos < state.source.length && this.regexp_eatTerm(state)) {}
};
pp$1.regexp_eatTerm = function(state) {
  if (this.regexp_eatAssertion(state)) {
    if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
      if (state.switchU) {
        state.raise("Invalid quantifier");
      }
    }
    return true;
  }
  if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
    this.regexp_eatQuantifier(state);
    return true;
  }
  return false;
};
pp$1.regexp_eatAssertion = function(state) {
  var start = state.pos;
  state.lastAssertionIsQuantifiable = false;
  if (state.eat(94) || state.eat(36)) {
    return true;
  }
  if (state.eat(92)) {
    if (state.eat(66) || state.eat(98)) {
      return true;
    }
    state.pos = start;
  }
  if (state.eat(40) && state.eat(63)) {
    var lookbehind = false;
    if (this.options.ecmaVersion >= 9) {
      lookbehind = state.eat(60);
    }
    if (state.eat(61) || state.eat(33)) {
      this.regexp_disjunction(state);
      if (!state.eat(41)) {
        state.raise("Unterminated group");
      }
      state.lastAssertionIsQuantifiable = !lookbehind;
      return true;
    }
  }
  state.pos = start;
  return false;
};
pp$1.regexp_eatQuantifier = function(state, noError) {
  if (noError === undefined)
    noError = false;
  if (this.regexp_eatQuantifierPrefix(state, noError)) {
    state.eat(63);
    return true;
  }
  return false;
};
pp$1.regexp_eatQuantifierPrefix = function(state, noError) {
  return state.eat(42) || state.eat(43) || state.eat(63) || this.regexp_eatBracedQuantifier(state, noError);
};
pp$1.regexp_eatBracedQuantifier = function(state, noError) {
  var start = state.pos;
  if (state.eat(123)) {
    var min = 0, max = -1;
    if (this.regexp_eatDecimalDigits(state)) {
      min = state.lastIntValue;
      if (state.eat(44) && this.regexp_eatDecimalDigits(state)) {
        max = state.lastIntValue;
      }
      if (state.eat(125)) {
        if (max !== -1 && max < min && !noError) {
          state.raise("numbers out of order in {} quantifier");
        }
        return true;
      }
    }
    if (state.switchU && !noError) {
      state.raise("Incomplete quantifier");
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatAtom = function(state) {
  return this.regexp_eatPatternCharacters(state) || state.eat(46) || this.regexp_eatReverseSolidusAtomEscape(state) || this.regexp_eatCharacterClass(state) || this.regexp_eatUncapturingGroup(state) || this.regexp_eatCapturingGroup(state);
};
pp$1.regexp_eatReverseSolidusAtomEscape = function(state) {
  var start = state.pos;
  if (state.eat(92)) {
    if (this.regexp_eatAtomEscape(state)) {
      return true;
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatUncapturingGroup = function(state) {
  var start = state.pos;
  if (state.eat(40)) {
    if (state.eat(63)) {
      if (this.options.ecmaVersion >= 16) {
        var addModifiers = this.regexp_eatModifiers(state);
        var hasHyphen = state.eat(45);
        if (addModifiers || hasHyphen) {
          for (var i = 0;i < addModifiers.length; i++) {
            var modifier = addModifiers.charAt(i);
            if (addModifiers.indexOf(modifier, i + 1) > -1) {
              state.raise("Duplicate regular expression modifiers");
            }
          }
          if (hasHyphen) {
            var removeModifiers = this.regexp_eatModifiers(state);
            if (!addModifiers && !removeModifiers && state.current() === 58) {
              state.raise("Invalid regular expression modifiers");
            }
            for (var i$1 = 0;i$1 < removeModifiers.length; i$1++) {
              var modifier$1 = removeModifiers.charAt(i$1);
              if (removeModifiers.indexOf(modifier$1, i$1 + 1) > -1 || addModifiers.indexOf(modifier$1) > -1) {
                state.raise("Duplicate regular expression modifiers");
              }
            }
          }
        }
      }
      if (state.eat(58)) {
        this.regexp_disjunction(state);
        if (state.eat(41)) {
          return true;
        }
        state.raise("Unterminated group");
      }
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatCapturingGroup = function(state) {
  if (state.eat(40)) {
    if (this.options.ecmaVersion >= 9) {
      this.regexp_groupSpecifier(state);
    } else if (state.current() === 63) {
      state.raise("Invalid group");
    }
    this.regexp_disjunction(state);
    if (state.eat(41)) {
      state.numCapturingParens += 1;
      return true;
    }
    state.raise("Unterminated group");
  }
  return false;
};
pp$1.regexp_eatModifiers = function(state) {
  var modifiers = "";
  var ch = 0;
  while ((ch = state.current()) !== -1 && isRegularExpressionModifier(ch)) {
    modifiers += codePointToString(ch);
    state.advance();
  }
  return modifiers;
};
function isRegularExpressionModifier(ch) {
  return ch === 105 || ch === 109 || ch === 115;
}
pp$1.regexp_eatExtendedAtom = function(state) {
  return state.eat(46) || this.regexp_eatReverseSolidusAtomEscape(state) || this.regexp_eatCharacterClass(state) || this.regexp_eatUncapturingGroup(state) || this.regexp_eatCapturingGroup(state) || this.regexp_eatInvalidBracedQuantifier(state) || this.regexp_eatExtendedPatternCharacter(state);
};
pp$1.regexp_eatInvalidBracedQuantifier = function(state) {
  if (this.regexp_eatBracedQuantifier(state, true)) {
    state.raise("Nothing to repeat");
  }
  return false;
};
pp$1.regexp_eatSyntaxCharacter = function(state) {
  var ch = state.current();
  if (isSyntaxCharacter(ch)) {
    state.lastIntValue = ch;
    state.advance();
    return true;
  }
  return false;
};
function isSyntaxCharacter(ch) {
  return ch === 36 || ch >= 40 && ch <= 43 || ch === 46 || ch === 63 || ch >= 91 && ch <= 94 || ch >= 123 && ch <= 125;
}
pp$1.regexp_eatPatternCharacters = function(state) {
  var start = state.pos;
  var ch = 0;
  while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
    state.advance();
  }
  return state.pos !== start;
};
pp$1.regexp_eatExtendedPatternCharacter = function(state) {
  var ch = state.current();
  if (ch !== -1 && ch !== 36 && !(ch >= 40 && ch <= 43) && ch !== 46 && ch !== 63 && ch !== 91 && ch !== 94 && ch !== 124) {
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_groupSpecifier = function(state) {
  if (state.eat(63)) {
    if (!this.regexp_eatGroupName(state)) {
      state.raise("Invalid group");
    }
    var trackDisjunction = this.options.ecmaVersion >= 16;
    var known = state.groupNames[state.lastStringValue];
    if (known) {
      if (trackDisjunction) {
        for (var i = 0, list = known;i < list.length; i += 1) {
          var altID = list[i];
          if (!altID.separatedFrom(state.branchID)) {
            state.raise("Duplicate capture group name");
          }
        }
      } else {
        state.raise("Duplicate capture group name");
      }
    }
    if (trackDisjunction) {
      (known || (state.groupNames[state.lastStringValue] = [])).push(state.branchID);
    } else {
      state.groupNames[state.lastStringValue] = true;
    }
  }
};
pp$1.regexp_eatGroupName = function(state) {
  state.lastStringValue = "";
  if (state.eat(60)) {
    if (this.regexp_eatRegExpIdentifierName(state) && state.eat(62)) {
      return true;
    }
    state.raise("Invalid capture group name");
  }
  return false;
};
pp$1.regexp_eatRegExpIdentifierName = function(state) {
  state.lastStringValue = "";
  if (this.regexp_eatRegExpIdentifierStart(state)) {
    state.lastStringValue += codePointToString(state.lastIntValue);
    while (this.regexp_eatRegExpIdentifierPart(state)) {
      state.lastStringValue += codePointToString(state.lastIntValue);
    }
    return true;
  }
  return false;
};
pp$1.regexp_eatRegExpIdentifierStart = function(state) {
  var start = state.pos;
  var forceU = this.options.ecmaVersion >= 11;
  var ch = state.current(forceU);
  state.advance(forceU);
  if (ch === 92 && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
    ch = state.lastIntValue;
  }
  if (isRegExpIdentifierStart(ch)) {
    state.lastIntValue = ch;
    return true;
  }
  state.pos = start;
  return false;
};
function isRegExpIdentifierStart(ch) {
  return isIdentifierStart(ch, true) || ch === 36 || ch === 95;
}
pp$1.regexp_eatRegExpIdentifierPart = function(state) {
  var start = state.pos;
  var forceU = this.options.ecmaVersion >= 11;
  var ch = state.current(forceU);
  state.advance(forceU);
  if (ch === 92 && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
    ch = state.lastIntValue;
  }
  if (isRegExpIdentifierPart(ch)) {
    state.lastIntValue = ch;
    return true;
  }
  state.pos = start;
  return false;
};
function isRegExpIdentifierPart(ch) {
  return isIdentifierChar(ch, true) || ch === 36 || ch === 95 || ch === 8204 || ch === 8205;
}
pp$1.regexp_eatAtomEscape = function(state) {
  if (this.regexp_eatBackReference(state) || this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state) || state.switchN && this.regexp_eatKGroupName(state)) {
    return true;
  }
  if (state.switchU) {
    if (state.current() === 99) {
      state.raise("Invalid unicode escape");
    }
    state.raise("Invalid escape");
  }
  return false;
};
pp$1.regexp_eatBackReference = function(state) {
  var start = state.pos;
  if (this.regexp_eatDecimalEscape(state)) {
    var n = state.lastIntValue;
    if (state.switchU) {
      if (n > state.maxBackReference) {
        state.maxBackReference = n;
      }
      return true;
    }
    if (n <= state.numCapturingParens) {
      return true;
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatKGroupName = function(state) {
  if (state.eat(107)) {
    if (this.regexp_eatGroupName(state)) {
      state.backReferenceNames.push(state.lastStringValue);
      return true;
    }
    state.raise("Invalid named reference");
  }
  return false;
};
pp$1.regexp_eatCharacterEscape = function(state) {
  return this.regexp_eatControlEscape(state) || this.regexp_eatCControlLetter(state) || this.regexp_eatZero(state) || this.regexp_eatHexEscapeSequence(state) || this.regexp_eatRegExpUnicodeEscapeSequence(state, false) || !state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state) || this.regexp_eatIdentityEscape(state);
};
pp$1.regexp_eatCControlLetter = function(state) {
  var start = state.pos;
  if (state.eat(99)) {
    if (this.regexp_eatControlLetter(state)) {
      return true;
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatZero = function(state) {
  if (state.current() === 48 && !isDecimalDigit(state.lookahead())) {
    state.lastIntValue = 0;
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_eatControlEscape = function(state) {
  var ch = state.current();
  if (ch === 116) {
    state.lastIntValue = 9;
    state.advance();
    return true;
  }
  if (ch === 110) {
    state.lastIntValue = 10;
    state.advance();
    return true;
  }
  if (ch === 118) {
    state.lastIntValue = 11;
    state.advance();
    return true;
  }
  if (ch === 102) {
    state.lastIntValue = 12;
    state.advance();
    return true;
  }
  if (ch === 114) {
    state.lastIntValue = 13;
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_eatControlLetter = function(state) {
  var ch = state.current();
  if (isControlLetter(ch)) {
    state.lastIntValue = ch % 32;
    state.advance();
    return true;
  }
  return false;
};
function isControlLetter(ch) {
  return ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122;
}
pp$1.regexp_eatRegExpUnicodeEscapeSequence = function(state, forceU) {
  if (forceU === undefined)
    forceU = false;
  var start = state.pos;
  var switchU = forceU || state.switchU;
  if (state.eat(117)) {
    if (this.regexp_eatFixedHexDigits(state, 4)) {
      var lead = state.lastIntValue;
      if (switchU && lead >= 55296 && lead <= 56319) {
        var leadSurrogateEnd = state.pos;
        if (state.eat(92) && state.eat(117) && this.regexp_eatFixedHexDigits(state, 4)) {
          var trail = state.lastIntValue;
          if (trail >= 56320 && trail <= 57343) {
            state.lastIntValue = (lead - 55296) * 1024 + (trail - 56320) + 65536;
            return true;
          }
        }
        state.pos = leadSurrogateEnd;
        state.lastIntValue = lead;
      }
      return true;
    }
    if (switchU && state.eat(123) && this.regexp_eatHexDigits(state) && state.eat(125) && isValidUnicode(state.lastIntValue)) {
      return true;
    }
    if (switchU) {
      state.raise("Invalid unicode escape");
    }
    state.pos = start;
  }
  return false;
};
function isValidUnicode(ch) {
  return ch >= 0 && ch <= 1114111;
}
pp$1.regexp_eatIdentityEscape = function(state) {
  if (state.switchU) {
    if (this.regexp_eatSyntaxCharacter(state)) {
      return true;
    }
    if (state.eat(47)) {
      state.lastIntValue = 47;
      return true;
    }
    return false;
  }
  var ch = state.current();
  if (ch !== 99 && (!state.switchN || ch !== 107)) {
    state.lastIntValue = ch;
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_eatDecimalEscape = function(state) {
  state.lastIntValue = 0;
  var ch = state.current();
  if (ch >= 49 && ch <= 57) {
    do {
      state.lastIntValue = 10 * state.lastIntValue + (ch - 48);
      state.advance();
    } while ((ch = state.current()) >= 48 && ch <= 57);
    return true;
  }
  return false;
};
var CharSetNone = 0;
var CharSetOk = 1;
var CharSetString = 2;
pp$1.regexp_eatCharacterClassEscape = function(state) {
  var ch = state.current();
  if (isCharacterClassEscape(ch)) {
    state.lastIntValue = -1;
    state.advance();
    return CharSetOk;
  }
  var negate = false;
  if (state.switchU && this.options.ecmaVersion >= 9 && ((negate = ch === 80) || ch === 112)) {
    state.lastIntValue = -1;
    state.advance();
    var result;
    if (state.eat(123) && (result = this.regexp_eatUnicodePropertyValueExpression(state)) && state.eat(125)) {
      if (negate && result === CharSetString) {
        state.raise("Invalid property name");
      }
      return result;
    }
    state.raise("Invalid property name");
  }
  return CharSetNone;
};
function isCharacterClassEscape(ch) {
  return ch === 100 || ch === 68 || ch === 115 || ch === 83 || ch === 119 || ch === 87;
}
pp$1.regexp_eatUnicodePropertyValueExpression = function(state) {
  var start = state.pos;
  if (this.regexp_eatUnicodePropertyName(state) && state.eat(61)) {
    var name = state.lastStringValue;
    if (this.regexp_eatUnicodePropertyValue(state)) {
      var value = state.lastStringValue;
      this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
      return CharSetOk;
    }
  }
  state.pos = start;
  if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
    var nameOrValue = state.lastStringValue;
    return this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue);
  }
  return CharSetNone;
};
pp$1.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
  if (!hasOwn(state.unicodeProperties.nonBinary, name)) {
    state.raise("Invalid property name");
  }
  if (!state.unicodeProperties.nonBinary[name].test(value)) {
    state.raise("Invalid property value");
  }
};
pp$1.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
  if (state.unicodeProperties.binary.test(nameOrValue)) {
    return CharSetOk;
  }
  if (state.switchV && state.unicodeProperties.binaryOfStrings.test(nameOrValue)) {
    return CharSetString;
  }
  state.raise("Invalid property name");
};
pp$1.regexp_eatUnicodePropertyName = function(state) {
  var ch = 0;
  state.lastStringValue = "";
  while (isUnicodePropertyNameCharacter(ch = state.current())) {
    state.lastStringValue += codePointToString(ch);
    state.advance();
  }
  return state.lastStringValue !== "";
};
function isUnicodePropertyNameCharacter(ch) {
  return isControlLetter(ch) || ch === 95;
}
pp$1.regexp_eatUnicodePropertyValue = function(state) {
  var ch = 0;
  state.lastStringValue = "";
  while (isUnicodePropertyValueCharacter(ch = state.current())) {
    state.lastStringValue += codePointToString(ch);
    state.advance();
  }
  return state.lastStringValue !== "";
};
function isUnicodePropertyValueCharacter(ch) {
  return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch);
}
pp$1.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
  return this.regexp_eatUnicodePropertyValue(state);
};
pp$1.regexp_eatCharacterClass = function(state) {
  if (state.eat(91)) {
    var negate = state.eat(94);
    var result = this.regexp_classContents(state);
    if (!state.eat(93)) {
      state.raise("Unterminated character class");
    }
    if (negate && result === CharSetString) {
      state.raise("Negated character class may contain strings");
    }
    return true;
  }
  return false;
};
pp$1.regexp_classContents = function(state) {
  if (state.current() === 93) {
    return CharSetOk;
  }
  if (state.switchV) {
    return this.regexp_classSetExpression(state);
  }
  this.regexp_nonEmptyClassRanges(state);
  return CharSetOk;
};
pp$1.regexp_nonEmptyClassRanges = function(state) {
  while (this.regexp_eatClassAtom(state)) {
    var left = state.lastIntValue;
    if (state.eat(45) && this.regexp_eatClassAtom(state)) {
      var right = state.lastIntValue;
      if (state.switchU && (left === -1 || right === -1)) {
        state.raise("Invalid character class");
      }
      if (left !== -1 && right !== -1 && left > right) {
        state.raise("Range out of order in character class");
      }
    }
  }
};
pp$1.regexp_eatClassAtom = function(state) {
  var start = state.pos;
  if (state.eat(92)) {
    if (this.regexp_eatClassEscape(state)) {
      return true;
    }
    if (state.switchU) {
      var ch$1 = state.current();
      if (ch$1 === 99 || isOctalDigit(ch$1)) {
        state.raise("Invalid class escape");
      }
      state.raise("Invalid escape");
    }
    state.pos = start;
  }
  var ch = state.current();
  if (ch !== 93) {
    state.lastIntValue = ch;
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_eatClassEscape = function(state) {
  var start = state.pos;
  if (state.eat(98)) {
    state.lastIntValue = 8;
    return true;
  }
  if (state.switchU && state.eat(45)) {
    state.lastIntValue = 45;
    return true;
  }
  if (!state.switchU && state.eat(99)) {
    if (this.regexp_eatClassControlLetter(state)) {
      return true;
    }
    state.pos = start;
  }
  return this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state);
};
pp$1.regexp_classSetExpression = function(state) {
  var result = CharSetOk, subResult;
  if (this.regexp_eatClassSetRange(state))
    ;
  else if (subResult = this.regexp_eatClassSetOperand(state)) {
    if (subResult === CharSetString) {
      result = CharSetString;
    }
    var start = state.pos;
    while (state.eatChars([38, 38])) {
      if (state.current() !== 38 && (subResult = this.regexp_eatClassSetOperand(state))) {
        if (subResult !== CharSetString) {
          result = CharSetOk;
        }
        continue;
      }
      state.raise("Invalid character in character class");
    }
    if (start !== state.pos) {
      return result;
    }
    while (state.eatChars([45, 45])) {
      if (this.regexp_eatClassSetOperand(state)) {
        continue;
      }
      state.raise("Invalid character in character class");
    }
    if (start !== state.pos) {
      return result;
    }
  } else {
    state.raise("Invalid character in character class");
  }
  for (;; ) {
    if (this.regexp_eatClassSetRange(state)) {
      continue;
    }
    subResult = this.regexp_eatClassSetOperand(state);
    if (!subResult) {
      return result;
    }
    if (subResult === CharSetString) {
      result = CharSetString;
    }
  }
};
pp$1.regexp_eatClassSetRange = function(state) {
  var start = state.pos;
  if (this.regexp_eatClassSetCharacter(state)) {
    var left = state.lastIntValue;
    if (state.eat(45) && this.regexp_eatClassSetCharacter(state)) {
      var right = state.lastIntValue;
      if (left !== -1 && right !== -1 && left > right) {
        state.raise("Range out of order in character class");
      }
      return true;
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatClassSetOperand = function(state) {
  if (this.regexp_eatClassSetCharacter(state)) {
    return CharSetOk;
  }
  return this.regexp_eatClassStringDisjunction(state) || this.regexp_eatNestedClass(state);
};
pp$1.regexp_eatNestedClass = function(state) {
  var start = state.pos;
  if (state.eat(91)) {
    var negate = state.eat(94);
    var result = this.regexp_classContents(state);
    if (state.eat(93)) {
      if (negate && result === CharSetString) {
        state.raise("Negated character class may contain strings");
      }
      return result;
    }
    state.pos = start;
  }
  if (state.eat(92)) {
    var result$1 = this.regexp_eatCharacterClassEscape(state);
    if (result$1) {
      return result$1;
    }
    state.pos = start;
  }
  return null;
};
pp$1.regexp_eatClassStringDisjunction = function(state) {
  var start = state.pos;
  if (state.eatChars([92, 113])) {
    if (state.eat(123)) {
      var result = this.regexp_classStringDisjunctionContents(state);
      if (state.eat(125)) {
        return result;
      }
    } else {
      state.raise("Invalid escape");
    }
    state.pos = start;
  }
  return null;
};
pp$1.regexp_classStringDisjunctionContents = function(state) {
  var result = this.regexp_classString(state);
  while (state.eat(124)) {
    if (this.regexp_classString(state) === CharSetString) {
      result = CharSetString;
    }
  }
  return result;
};
pp$1.regexp_classString = function(state) {
  var count = 0;
  while (this.regexp_eatClassSetCharacter(state)) {
    count++;
  }
  return count === 1 ? CharSetOk : CharSetString;
};
pp$1.regexp_eatClassSetCharacter = function(state) {
  var start = state.pos;
  if (state.eat(92)) {
    if (this.regexp_eatCharacterEscape(state) || this.regexp_eatClassSetReservedPunctuator(state)) {
      return true;
    }
    if (state.eat(98)) {
      state.lastIntValue = 8;
      return true;
    }
    state.pos = start;
    return false;
  }
  var ch = state.current();
  if (ch < 0 || ch === state.lookahead() && isClassSetReservedDoublePunctuatorCharacter(ch)) {
    return false;
  }
  if (isClassSetSyntaxCharacter(ch)) {
    return false;
  }
  state.advance();
  state.lastIntValue = ch;
  return true;
};
function isClassSetReservedDoublePunctuatorCharacter(ch) {
  return ch === 33 || ch >= 35 && ch <= 38 || ch >= 42 && ch <= 44 || ch === 46 || ch >= 58 && ch <= 64 || ch === 94 || ch === 96 || ch === 126;
}
function isClassSetSyntaxCharacter(ch) {
  return ch === 40 || ch === 41 || ch === 45 || ch === 47 || ch >= 91 && ch <= 93 || ch >= 123 && ch <= 125;
}
pp$1.regexp_eatClassSetReservedPunctuator = function(state) {
  var ch = state.current();
  if (isClassSetReservedPunctuator(ch)) {
    state.lastIntValue = ch;
    state.advance();
    return true;
  }
  return false;
};
function isClassSetReservedPunctuator(ch) {
  return ch === 33 || ch === 35 || ch === 37 || ch === 38 || ch === 44 || ch === 45 || ch >= 58 && ch <= 62 || ch === 64 || ch === 96 || ch === 126;
}
pp$1.regexp_eatClassControlLetter = function(state) {
  var ch = state.current();
  if (isDecimalDigit(ch) || ch === 95) {
    state.lastIntValue = ch % 32;
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_eatHexEscapeSequence = function(state) {
  var start = state.pos;
  if (state.eat(120)) {
    if (this.regexp_eatFixedHexDigits(state, 2)) {
      return true;
    }
    if (state.switchU) {
      state.raise("Invalid escape");
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatDecimalDigits = function(state) {
  var start = state.pos;
  var ch = 0;
  state.lastIntValue = 0;
  while (isDecimalDigit(ch = state.current())) {
    state.lastIntValue = 10 * state.lastIntValue + (ch - 48);
    state.advance();
  }
  return state.pos !== start;
};
function isDecimalDigit(ch) {
  return ch >= 48 && ch <= 57;
}
pp$1.regexp_eatHexDigits = function(state) {
  var start = state.pos;
  var ch = 0;
  state.lastIntValue = 0;
  while (isHexDigit(ch = state.current())) {
    state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
    state.advance();
  }
  return state.pos !== start;
};
function isHexDigit(ch) {
  return ch >= 48 && ch <= 57 || ch >= 65 && ch <= 70 || ch >= 97 && ch <= 102;
}
function hexToInt(ch) {
  if (ch >= 65 && ch <= 70) {
    return 10 + (ch - 65);
  }
  if (ch >= 97 && ch <= 102) {
    return 10 + (ch - 97);
  }
  return ch - 48;
}
pp$1.regexp_eatLegacyOctalEscapeSequence = function(state) {
  if (this.regexp_eatOctalDigit(state)) {
    var n1 = state.lastIntValue;
    if (this.regexp_eatOctalDigit(state)) {
      var n2 = state.lastIntValue;
      if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
        state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
      } else {
        state.lastIntValue = n1 * 8 + n2;
      }
    } else {
      state.lastIntValue = n1;
    }
    return true;
  }
  return false;
};
pp$1.regexp_eatOctalDigit = function(state) {
  var ch = state.current();
  if (isOctalDigit(ch)) {
    state.lastIntValue = ch - 48;
    state.advance();
    return true;
  }
  state.lastIntValue = 0;
  return false;
};
function isOctalDigit(ch) {
  return ch >= 48 && ch <= 55;
}
pp$1.regexp_eatFixedHexDigits = function(state, length) {
  var start = state.pos;
  state.lastIntValue = 0;
  for (var i = 0;i < length; ++i) {
    var ch = state.current();
    if (!isHexDigit(ch)) {
      state.pos = start;
      return false;
    }
    state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
    state.advance();
  }
  return true;
};
var Token = function Token(p) {
  this.type = p.type;
  this.value = p.value;
  this.start = p.start;
  this.end = p.end;
  if (p.options.locations) {
    this.loc = new SourceLocation(p, p.startLoc, p.endLoc);
  }
  if (p.options.ranges) {
    this.range = [p.start, p.end];
  }
};
var pp = Parser.prototype;
pp.next = function(ignoreEscapeSequenceInKeyword) {
  if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc) {
    this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword);
  }
  if (this.options.onToken) {
    this.options.onToken(new Token(this));
  }
  this.lastTokEnd = this.end;
  this.lastTokStart = this.start;
  this.lastTokEndLoc = this.endLoc;
  this.lastTokStartLoc = this.startLoc;
  this.nextToken();
};
pp.getToken = function() {
  this.next();
  return new Token(this);
};
if (typeof Symbol !== "undefined") {
  pp[Symbol.iterator] = function() {
    var this$1$1 = this;
    return {
      next: function() {
        var token = this$1$1.getToken();
        return {
          done: token.type === types$1.eof,
          value: token
        };
      }
    };
  };
}
pp.nextToken = function() {
  var curContext = this.curContext();
  if (!curContext || !curContext.preserveSpace) {
    this.skipSpace();
  }
  this.start = this.pos;
  if (this.options.locations) {
    this.startLoc = this.curPosition();
  }
  if (this.pos >= this.input.length) {
    return this.finishToken(types$1.eof);
  }
  if (curContext.override) {
    return curContext.override(this);
  } else {
    this.readToken(this.fullCharCodeAtPos());
  }
};
pp.readToken = function(code) {
  if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92) {
    return this.readWord();
  }
  return this.getTokenFromCode(code);
};
pp.fullCharCodeAtPos = function() {
  var code = this.input.charCodeAt(this.pos);
  if (code <= 55295 || code >= 56320) {
    return code;
  }
  var next = this.input.charCodeAt(this.pos + 1);
  return next <= 56319 || next >= 57344 ? code : (code << 10) + next - 56613888;
};
pp.skipBlockComment = function() {
  var startLoc = this.options.onComment && this.curPosition();
  var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
  if (end === -1) {
    this.raise(this.pos - 2, "Unterminated comment");
  }
  this.pos = end + 2;
  if (this.options.locations) {
    for (var nextBreak = undefined, pos = start;(nextBreak = nextLineBreak(this.input, pos, this.pos)) > -1; ) {
      ++this.curLine;
      pos = this.lineStart = nextBreak;
    }
  }
  if (this.options.onComment) {
    this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos, startLoc, this.curPosition());
  }
};
pp.skipLineComment = function(startSkip) {
  var start = this.pos;
  var startLoc = this.options.onComment && this.curPosition();
  var ch = this.input.charCodeAt(this.pos += startSkip);
  while (this.pos < this.input.length && !isNewLine(ch)) {
    ch = this.input.charCodeAt(++this.pos);
  }
  if (this.options.onComment) {
    this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos, startLoc, this.curPosition());
  }
};
pp.skipSpace = function() {
  loop:
    while (this.pos < this.input.length) {
      var ch = this.input.charCodeAt(this.pos);
      switch (ch) {
        case 32:
        case 160:
          ++this.pos;
          break;
        case 13:
          if (this.input.charCodeAt(this.pos + 1) === 10) {
            ++this.pos;
          }
        case 10:
        case 8232:
        case 8233:
          ++this.pos;
          if (this.options.locations) {
            ++this.curLine;
            this.lineStart = this.pos;
          }
          break;
        case 47:
          switch (this.input.charCodeAt(this.pos + 1)) {
            case 42:
              this.skipBlockComment();
              break;
            case 47:
              this.skipLineComment(2);
              break;
            default:
              break loop;
          }
          break;
        default:
          if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
            ++this.pos;
          } else {
            break loop;
          }
      }
    }
};
pp.finishToken = function(type, val) {
  this.end = this.pos;
  if (this.options.locations) {
    this.endLoc = this.curPosition();
  }
  var prevType = this.type;
  this.type = type;
  this.value = val;
  this.updateContext(prevType);
};
pp.readToken_dot = function() {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next >= 48 && next <= 57) {
    return this.readNumber(true);
  }
  var next2 = this.input.charCodeAt(this.pos + 2);
  if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) {
    this.pos += 3;
    return this.finishToken(types$1.ellipsis);
  } else {
    ++this.pos;
    return this.finishToken(types$1.dot);
  }
};
pp.readToken_slash = function() {
  var next = this.input.charCodeAt(this.pos + 1);
  if (this.exprAllowed) {
    ++this.pos;
    return this.readRegexp();
  }
  if (next === 61) {
    return this.finishOp(types$1.assign, 2);
  }
  return this.finishOp(types$1.slash, 1);
};
pp.readToken_mult_modulo_exp = function(code) {
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  var tokentype = code === 42 ? types$1.star : types$1.modulo;
  if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
    ++size;
    tokentype = types$1.starstar;
    next = this.input.charCodeAt(this.pos + 2);
  }
  if (next === 61) {
    return this.finishOp(types$1.assign, size + 1);
  }
  return this.finishOp(tokentype, size);
};
pp.readToken_pipe_amp = function(code) {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) {
    if (this.options.ecmaVersion >= 12) {
      var next2 = this.input.charCodeAt(this.pos + 2);
      if (next2 === 61) {
        return this.finishOp(types$1.assign, 3);
      }
    }
    return this.finishOp(code === 124 ? types$1.logicalOR : types$1.logicalAND, 2);
  }
  if (next === 61) {
    return this.finishOp(types$1.assign, 2);
  }
  return this.finishOp(code === 124 ? types$1.bitwiseOR : types$1.bitwiseAND, 1);
};
pp.readToken_caret = function() {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) {
    return this.finishOp(types$1.assign, 2);
  }
  return this.finishOp(types$1.bitwiseXOR, 1);
};
pp.readToken_plus_min = function(code) {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) {
    if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 && (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
      this.skipLineComment(3);
      this.skipSpace();
      return this.nextToken();
    }
    return this.finishOp(types$1.incDec, 2);
  }
  if (next === 61) {
    return this.finishOp(types$1.assign, 2);
  }
  return this.finishOp(types$1.plusMin, 1);
};
pp.readToken_lt_gt = function(code) {
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  if (next === code) {
    size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
    if (this.input.charCodeAt(this.pos + size) === 61) {
      return this.finishOp(types$1.assign, size + 1);
    }
    return this.finishOp(types$1.bitShift, size);
  }
  if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 && this.input.charCodeAt(this.pos + 3) === 45) {
    this.skipLineComment(4);
    this.skipSpace();
    return this.nextToken();
  }
  if (next === 61) {
    size = 2;
  }
  return this.finishOp(types$1.relational, size);
};
pp.readToken_eq_excl = function(code) {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) {
    return this.finishOp(types$1.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2);
  }
  if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) {
    this.pos += 2;
    return this.finishToken(types$1.arrow);
  }
  return this.finishOp(code === 61 ? types$1.eq : types$1.prefix, 1);
};
pp.readToken_question = function() {
  var ecmaVersion = this.options.ecmaVersion;
  if (ecmaVersion >= 11) {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 46) {
      var next2 = this.input.charCodeAt(this.pos + 2);
      if (next2 < 48 || next2 > 57) {
        return this.finishOp(types$1.questionDot, 2);
      }
    }
    if (next === 63) {
      if (ecmaVersion >= 12) {
        var next2$1 = this.input.charCodeAt(this.pos + 2);
        if (next2$1 === 61) {
          return this.finishOp(types$1.assign, 3);
        }
      }
      return this.finishOp(types$1.coalesce, 2);
    }
  }
  return this.finishOp(types$1.question, 1);
};
pp.readToken_numberSign = function() {
  var ecmaVersion = this.options.ecmaVersion;
  var code = 35;
  if (ecmaVersion >= 13) {
    ++this.pos;
    code = this.fullCharCodeAtPos();
    if (isIdentifierStart(code, true) || code === 92) {
      return this.finishToken(types$1.privateId, this.readWord1());
    }
  }
  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};
pp.getTokenFromCode = function(code) {
  switch (code) {
    case 46:
      return this.readToken_dot();
    case 40:
      ++this.pos;
      return this.finishToken(types$1.parenL);
    case 41:
      ++this.pos;
      return this.finishToken(types$1.parenR);
    case 59:
      ++this.pos;
      return this.finishToken(types$1.semi);
    case 44:
      ++this.pos;
      return this.finishToken(types$1.comma);
    case 91:
      ++this.pos;
      return this.finishToken(types$1.bracketL);
    case 93:
      ++this.pos;
      return this.finishToken(types$1.bracketR);
    case 123:
      ++this.pos;
      return this.finishToken(types$1.braceL);
    case 125:
      ++this.pos;
      return this.finishToken(types$1.braceR);
    case 58:
      ++this.pos;
      return this.finishToken(types$1.colon);
    case 96:
      if (this.options.ecmaVersion < 6) {
        break;
      }
      ++this.pos;
      return this.finishToken(types$1.backQuote);
    case 48:
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 120 || next === 88) {
        return this.readRadixNumber(16);
      }
      if (this.options.ecmaVersion >= 6) {
        if (next === 111 || next === 79) {
          return this.readRadixNumber(8);
        }
        if (next === 98 || next === 66) {
          return this.readRadixNumber(2);
        }
      }
    case 49:
    case 50:
    case 51:
    case 52:
    case 53:
    case 54:
    case 55:
    case 56:
    case 57:
      return this.readNumber(false);
    case 34:
    case 39:
      return this.readString(code);
    case 47:
      return this.readToken_slash();
    case 37:
    case 42:
      return this.readToken_mult_modulo_exp(code);
    case 124:
    case 38:
      return this.readToken_pipe_amp(code);
    case 94:
      return this.readToken_caret();
    case 43:
    case 45:
      return this.readToken_plus_min(code);
    case 60:
    case 62:
      return this.readToken_lt_gt(code);
    case 61:
    case 33:
      return this.readToken_eq_excl(code);
    case 63:
      return this.readToken_question();
    case 126:
      return this.finishOp(types$1.prefix, 1);
    case 35:
      return this.readToken_numberSign();
  }
  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};
pp.finishOp = function(type, size) {
  var str = this.input.slice(this.pos, this.pos + size);
  this.pos += size;
  return this.finishToken(type, str);
};
pp.readRegexp = function() {
  var escaped, inClass, start = this.pos;
  for (;; ) {
    if (this.pos >= this.input.length) {
      this.raise(start, "Unterminated regular expression");
    }
    var ch = this.input.charAt(this.pos);
    if (lineBreak.test(ch)) {
      this.raise(start, "Unterminated regular expression");
    }
    if (!escaped) {
      if (ch === "[") {
        inClass = true;
      } else if (ch === "]" && inClass) {
        inClass = false;
      } else if (ch === "/" && !inClass) {
        break;
      }
      escaped = ch === "\\";
    } else {
      escaped = false;
    }
    ++this.pos;
  }
  var pattern = this.input.slice(start, this.pos);
  ++this.pos;
  var flagsStart = this.pos;
  var flags = this.readWord1();
  if (this.containsEsc) {
    this.unexpected(flagsStart);
  }
  var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
  state.reset(start, pattern, flags);
  this.validateRegExpFlags(state);
  this.validateRegExpPattern(state);
  var value = null;
  try {
    value = new RegExp(pattern, flags);
  } catch (e) {}
  return this.finishToken(types$1.regexp, { pattern, flags, value });
};
pp.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
  var allowSeparators = this.options.ecmaVersion >= 12 && len === undefined;
  var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;
  var start = this.pos, total = 0, lastCode = 0;
  for (var i = 0, e = len == null ? Infinity : len;i < e; ++i, ++this.pos) {
    var code = this.input.charCodeAt(this.pos), val = undefined;
    if (allowSeparators && code === 95) {
      if (isLegacyOctalNumericLiteral) {
        this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals");
      }
      if (lastCode === 95) {
        this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore");
      }
      if (i === 0) {
        this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits");
      }
      lastCode = code;
      continue;
    }
    if (code >= 97) {
      val = code - 97 + 10;
    } else if (code >= 65) {
      val = code - 65 + 10;
    } else if (code >= 48 && code <= 57) {
      val = code - 48;
    } else {
      val = Infinity;
    }
    if (val >= radix) {
      break;
    }
    lastCode = code;
    total = total * radix + val;
  }
  if (allowSeparators && lastCode === 95) {
    this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits");
  }
  if (this.pos === start || len != null && this.pos - start !== len) {
    return null;
  }
  return total;
};
function stringToNumber(str, isLegacyOctalNumericLiteral) {
  if (isLegacyOctalNumericLiteral) {
    return parseInt(str, 8);
  }
  return parseFloat(str.replace(/_/g, ""));
}
function stringToBigInt(str) {
  if (typeof BigInt !== "function") {
    return null;
  }
  return BigInt(str.replace(/_/g, ""));
}
pp.readRadixNumber = function(radix) {
  var start = this.pos;
  this.pos += 2;
  var val = this.readInt(radix);
  if (val == null) {
    this.raise(this.start + 2, "Expected number in radix " + radix);
  }
  if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
    val = stringToBigInt(this.input.slice(start, this.pos));
    ++this.pos;
  } else if (isIdentifierStart(this.fullCharCodeAtPos())) {
    this.raise(this.pos, "Identifier directly after number");
  }
  return this.finishToken(types$1.num, val);
};
pp.readNumber = function(startsWithDot) {
  var start = this.pos;
  if (!startsWithDot && this.readInt(10, undefined, true) === null) {
    this.raise(start, "Invalid number");
  }
  var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
  if (octal && this.strict) {
    this.raise(start, "Invalid number");
  }
  var next = this.input.charCodeAt(this.pos);
  if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
    var val$1 = stringToBigInt(this.input.slice(start, this.pos));
    ++this.pos;
    if (isIdentifierStart(this.fullCharCodeAtPos())) {
      this.raise(this.pos, "Identifier directly after number");
    }
    return this.finishToken(types$1.num, val$1);
  }
  if (octal && /[89]/.test(this.input.slice(start, this.pos))) {
    octal = false;
  }
  if (next === 46 && !octal) {
    ++this.pos;
    this.readInt(10);
    next = this.input.charCodeAt(this.pos);
  }
  if ((next === 69 || next === 101) && !octal) {
    next = this.input.charCodeAt(++this.pos);
    if (next === 43 || next === 45) {
      ++this.pos;
    }
    if (this.readInt(10) === null) {
      this.raise(start, "Invalid number");
    }
  }
  if (isIdentifierStart(this.fullCharCodeAtPos())) {
    this.raise(this.pos, "Identifier directly after number");
  }
  var val = stringToNumber(this.input.slice(start, this.pos), octal);
  return this.finishToken(types$1.num, val);
};
pp.readCodePoint = function() {
  var ch = this.input.charCodeAt(this.pos), code;
  if (ch === 123) {
    if (this.options.ecmaVersion < 6) {
      this.unexpected();
    }
    var codePos = ++this.pos;
    code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
    ++this.pos;
    if (code > 1114111) {
      this.invalidStringToken(codePos, "Code point out of bounds");
    }
  } else {
    code = this.readHexChar(4);
  }
  return code;
};
pp.readString = function(quote) {
  var out = "", chunkStart = ++this.pos;
  for (;; ) {
    if (this.pos >= this.input.length) {
      this.raise(this.start, "Unterminated string constant");
    }
    var ch = this.input.charCodeAt(this.pos);
    if (ch === quote) {
      break;
    }
    if (ch === 92) {
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar(false);
      chunkStart = this.pos;
    } else if (ch === 8232 || ch === 8233) {
      if (this.options.ecmaVersion < 10) {
        this.raise(this.start, "Unterminated string constant");
      }
      ++this.pos;
      if (this.options.locations) {
        this.curLine++;
        this.lineStart = this.pos;
      }
    } else {
      if (isNewLine(ch)) {
        this.raise(this.start, "Unterminated string constant");
      }
      ++this.pos;
    }
  }
  out += this.input.slice(chunkStart, this.pos++);
  return this.finishToken(types$1.string, out);
};
var INVALID_TEMPLATE_ESCAPE_ERROR = {};
pp.tryReadTemplateToken = function() {
  this.inTemplateElement = true;
  try {
    this.readTmplToken();
  } catch (err) {
    if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
      this.readInvalidTemplateToken();
    } else {
      throw err;
    }
  }
  this.inTemplateElement = false;
};
pp.invalidStringToken = function(position, message) {
  if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
    throw INVALID_TEMPLATE_ESCAPE_ERROR;
  } else {
    this.raise(position, message);
  }
};
pp.readTmplToken = function() {
  var out = "", chunkStart = this.pos;
  for (;; ) {
    if (this.pos >= this.input.length) {
      this.raise(this.start, "Unterminated template");
    }
    var ch = this.input.charCodeAt(this.pos);
    if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) {
      if (this.pos === this.start && (this.type === types$1.template || this.type === types$1.invalidTemplate)) {
        if (ch === 36) {
          this.pos += 2;
          return this.finishToken(types$1.dollarBraceL);
        } else {
          ++this.pos;
          return this.finishToken(types$1.backQuote);
        }
      }
      out += this.input.slice(chunkStart, this.pos);
      return this.finishToken(types$1.template, out);
    }
    if (ch === 92) {
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar(true);
      chunkStart = this.pos;
    } else if (isNewLine(ch)) {
      out += this.input.slice(chunkStart, this.pos);
      ++this.pos;
      switch (ch) {
        case 13:
          if (this.input.charCodeAt(this.pos) === 10) {
            ++this.pos;
          }
        case 10:
          out += `
`;
          break;
        default:
          out += String.fromCharCode(ch);
          break;
      }
      if (this.options.locations) {
        ++this.curLine;
        this.lineStart = this.pos;
      }
      chunkStart = this.pos;
    } else {
      ++this.pos;
    }
  }
};
pp.readInvalidTemplateToken = function() {
  for (;this.pos < this.input.length; this.pos++) {
    switch (this.input[this.pos]) {
      case "\\":
        ++this.pos;
        break;
      case "$":
        if (this.input[this.pos + 1] !== "{") {
          break;
        }
      case "`":
        return this.finishToken(types$1.invalidTemplate, this.input.slice(this.start, this.pos));
      case "\r":
        if (this.input[this.pos + 1] === `
`) {
          ++this.pos;
        }
      case `
`:
      case "\u2028":
      case "\u2029":
        ++this.curLine;
        this.lineStart = this.pos + 1;
        break;
    }
  }
  this.raise(this.start, "Unterminated template");
};
pp.readEscapedChar = function(inTemplate) {
  var ch = this.input.charCodeAt(++this.pos);
  ++this.pos;
  switch (ch) {
    case 110:
      return `
`;
    case 114:
      return "\r";
    case 120:
      return String.fromCharCode(this.readHexChar(2));
    case 117:
      return codePointToString(this.readCodePoint());
    case 116:
      return "\t";
    case 98:
      return "\b";
    case 118:
      return "\v";
    case 102:
      return "\f";
    case 13:
      if (this.input.charCodeAt(this.pos) === 10) {
        ++this.pos;
      }
    case 10:
      if (this.options.locations) {
        this.lineStart = this.pos;
        ++this.curLine;
      }
      return "";
    case 56:
    case 57:
      if (this.strict) {
        this.invalidStringToken(this.pos - 1, "Invalid escape sequence");
      }
      if (inTemplate) {
        var codePos = this.pos - 1;
        this.invalidStringToken(codePos, "Invalid escape sequence in template string");
      }
    default:
      if (ch >= 48 && ch <= 55) {
        var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
        var octal = parseInt(octalStr, 8);
        if (octal > 255) {
          octalStr = octalStr.slice(0, -1);
          octal = parseInt(octalStr, 8);
        }
        this.pos += octalStr.length - 1;
        ch = this.input.charCodeAt(this.pos);
        if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
          this.invalidStringToken(this.pos - 1 - octalStr.length, inTemplate ? "Octal literal in template string" : "Octal literal in strict mode");
        }
        return String.fromCharCode(octal);
      }
      if (isNewLine(ch)) {
        if (this.options.locations) {
          this.lineStart = this.pos;
          ++this.curLine;
        }
        return "";
      }
      return String.fromCharCode(ch);
  }
};
pp.readHexChar = function(len) {
  var codePos = this.pos;
  var n = this.readInt(16, len);
  if (n === null) {
    this.invalidStringToken(codePos, "Bad character escape sequence");
  }
  return n;
};
pp.readWord1 = function() {
  this.containsEsc = false;
  var word = "", first = true, chunkStart = this.pos;
  var astral = this.options.ecmaVersion >= 6;
  while (this.pos < this.input.length) {
    var ch = this.fullCharCodeAtPos();
    if (isIdentifierChar(ch, astral)) {
      this.pos += ch <= 65535 ? 1 : 2;
    } else if (ch === 92) {
      this.containsEsc = true;
      word += this.input.slice(chunkStart, this.pos);
      var escStart = this.pos;
      if (this.input.charCodeAt(++this.pos) !== 117) {
        this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX");
      }
      ++this.pos;
      var esc = this.readCodePoint();
      if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral)) {
        this.invalidStringToken(escStart, "Invalid Unicode escape");
      }
      word += codePointToString(esc);
      chunkStart = this.pos;
    } else {
      break;
    }
    first = false;
  }
  return word + this.input.slice(chunkStart, this.pos);
};
pp.readWord = function() {
  var word = this.readWord1();
  var type = types$1.name;
  if (this.keywords.test(word)) {
    type = keywords[word];
  }
  return this.finishToken(type, word);
};
var version = "8.15.0";
Parser.acorn = {
  Parser,
  version,
  defaultOptions,
  Position,
  SourceLocation,
  getLineInfo,
  Node,
  TokenType,
  tokTypes: types$1,
  keywordTypes: keywords,
  TokContext,
  tokContexts: types,
  isIdentifierChar,
  isIdentifierStart,
  Token,
  isNewLine,
  lineBreak,
  lineBreakG,
  nonASCIIwhitespace
};
function parse(input, options) {
  return Parser.parse(input, options);
}
// ../node_modules/@opencode/codemode/dist/interpreter/model.js
var CallSite = Reference("codemode/CallSite", {
  defaultValue: () => ({ depth: 0 })
});
var AsyncIteratorSymbol = Symbol("codemode.async-iterator");
var IteratorSymbol = Symbol("codemode.iterator");
class Throw {
  value;
  constructor(value) {
    this.value = value;
  }
}

class GeneratorReturn {
  value;
  constructor(value) {
    this.value = value;
  }
}
var OptionalShortCircuit = Symbol("codemode.optional-short-circuit");

class PendingThrow {
  type;
  message;
  kind;
  suggestions;
  node;
  value;
  constructor(type, message, node, kind = "ExecutionFailure", suggestions) {
    this.type = type;
    this.message = message;
    this.kind = kind;
    this.suggestions = suggestions;
    if (node)
      this.node = node;
  }
}
var failure = (type, kind) => (message, node) => new PendingThrow(type, message, node, kind);
var typeError = failure("TypeError");
var invalidData = failure("TypeError", "InvalidDataValue");
var rangeError = failure("RangeError");
var referenceError = failure("ReferenceError");
var syntaxError = failure("SyntaxError");
var uriError = failure("URIError");
var supportedSyntaxMessage = "This is a restricted JavaScript-like language. Supported: plain and async functions, data literals, destructuring, standard control flow, await and Promise, and built-ins such as Array, Object, Math, JSON, Date, RegExp, Map, Set, and URL. Unsupported: classes, getters/setters, BigInt, and custom Symbols. Use plain functions and data objects instead.";
var unsupportedSyntax = (kind, node) => new PendingThrow("SyntaxError", `Syntax '${kind}' is not supported. ${supportedSyntaxMessage}`, node, "UnsupportedSyntax", [supportedSyntaxMessage]);
var sourceLocation = (node) => ({
  line: node.loc?.start.line ?? 1,
  column: (node.loc?.start.column ?? 0) + 1
});
var formatLocation = (node) => {
  if (!node?.loc)
    return "";
  const location = sourceLocation(node);
  return ` (line ${location.line}, col ${location.column})`;
};

// ../node_modules/@opencode/codemode/dist/interpreter/limits.js
var MAX_STRING_LENGTH = 1 << 24;
var MAX_ARRAY_LENGTH = 1e7;
var MAX_PENDING_PROMISES = 1e4;
var MAX_VALUE_DEPTH = 32;
var checkStringLength = (length) => {
  if (length > MAX_STRING_LENGTH)
    throw rangeError("Invalid string length");
};
var checkArrayLength = (length) => {
  if (length > MAX_ARRAY_LENGTH)
    throw rangeError("Invalid array length");
};

// ../node_modules/@opencode/codemode/dist/tool-error.js
class ToolError extends TaggedError3()("ToolError", {
  message: String4,
  cause: optionalKey2(Defect())
}) {
}
var toolError = (message, cause) => new ToolError({ message, ...cause === undefined ? {} : { cause } });

// ../node_modules/@opencode/codemode/dist/tool-schema.js
var isEffectSchema = (schema) => isSchema(schema);
var renderLiteral = (value) => JSON.stringify(value) ?? "unknown";
var identifierSegment = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
var renderKey = (name) => identifierSegment.test(name) ? name : JSON.stringify(name);
var definitionName = (ref) => {
  const tokens = parseUriFragment(ref);
  return tokens?.length === 2 && (tokens[0] === "$defs" || tokens[0] === "definitions") ? tokens[1] : undefined;
};
var effectNumberSentinel = (schema) => schema.type === "string" && Array.isArray(schema.enum) && schema.enum.length > 0 && schema.enum.every((value) => value === "NaN" || value === "Infinity" || value === "-Infinity");
var annotationKeywords = new Set(["title", "description", "default", "examples", "readOnly", "writeOnly"]);
var isEffectEmptyStruct = (schema) => schema.not?.type === "null" && Object.keys(schema.not).length === 1 && Object.keys(schema).every((key) => key === "not" || annotationKeywords.has(key));
var intersection = (members) => {
  const concrete = members.filter((member) => member !== "unknown");
  if (concrete.length === 0)
    return "unknown";
  if (concrete.length === 1)
    return concrete[0];
  return concrete.map((member) => member.includes(" | ") ? `(${member})` : member).join(" & ");
};
var MAX_RENDER_DEPTH = 8;
var hasUnresolvedRef = (schema, definitions, seen = new Set, visited = new Set) => {
  if (visited.has(schema))
    return false;
  const nextVisited = new Set([...visited, schema]);
  if (schema.$ref !== undefined) {
    const name = definitionName(schema.$ref);
    if (name === undefined || definitions[name] === undefined || seen.has(name))
      return true;
    if (hasUnresolvedRef(definitions[name], definitions, new Set([...seen, name]), nextVisited))
      return true;
  }
  return [
    ...schema.anyOf ?? [],
    ...schema.oneOf ?? [],
    ...schema.allOf ?? [],
    ...Object.values(schema.properties ?? {}),
    ...schema.items === undefined ? [] : [schema.items],
    ...typeof schema.additionalProperties === "object" ? [schema.additionalProperties] : []
  ].some((item) => hasUnresolvedRef(item, definitions, seen, nextVisited));
};
var docTags = (schema) => {
  const tags = [];
  if (schema.deprecated === true)
    tags.push("@deprecated");
  if (schema.default !== undefined) {
    try {
      const rendered = JSON.stringify(schema.default);
      if (rendered !== undefined)
        tags.push(`@default ${rendered}`);
    } catch {}
  }
  if (typeof schema.format === "string")
    tags.push(`@format ${schema.format}`);
  if (schema.type === "integer")
    tags.push("@integer");
  if (typeof schema.minimum === "number")
    tags.push(`@minimum ${schema.minimum}`);
  if (typeof schema.maximum === "number")
    tags.push(`@maximum ${schema.maximum}`);
  if (typeof schema.exclusiveMinimum === "number")
    tags.push(`@exclusiveMinimum ${schema.exclusiveMinimum}`);
  if (typeof schema.exclusiveMaximum === "number")
    tags.push(`@exclusiveMaximum ${schema.exclusiveMaximum}`);
  if (typeof schema.multipleOf === "number")
    tags.push(`@multipleOf ${schema.multipleOf}`);
  if (typeof schema.minLength === "number")
    tags.push(`@minLength ${schema.minLength}`);
  if (typeof schema.maxLength === "number")
    tags.push(`@maxLength ${schema.maxLength}`);
  if (typeof schema.pattern === "string")
    tags.push(`@pattern ${schema.pattern}`);
  if (typeof schema.minItems === "number")
    tags.push(`@minItems ${schema.minItems}`);
  if (typeof schema.maxItems === "number")
    tags.push(`@maxItems ${schema.maxItems}`);
  if (schema.uniqueItems === true)
    tags.push("@uniqueItems true");
  return tags;
};
var docLines = (schema, width) => {
  const summary = docTags(schema).join(" ");
  const lines = (schema.description ?? "").split(`
`).map((line) => line.replace(/\s+$/, ""));
  while (lines.length > 0 && lines[0].trim() === "")
    lines.shift();
  while (lines.length > 0 && lines[lines.length - 1].trim() === "")
    lines.pop();
  const inline = lines.length === 1 ? `${lines[0]}${lines[0].endsWith(".") ? "" : "."} ${summary}` : summary;
  return summary && lines.length === 1 && !summary.includes(`
`) && width + inline.length + 7 <= 120 ? [inline] : [...lines, ...summary ? summary.split(`
`) : []];
};
var jsdoc = (schema, pad) => {
  const content = docLines(schema, pad.length);
  const types = typeof schema.type === "string" ? [schema.type] : schema.type ?? [];
  const append = (label, child) => {
    docLines(child, pad.length + label.length + 2).forEach((line, index) => {
      if (index === 0) {
        content.push(`${label}: ${line}`);
        return;
      }
      content.push(line ? `  ${line}` : "");
    });
  };
  if (types.includes("array") && schema.items)
    append("Each item", schema.items);
  if ((types.includes("object") || schema.properties) && typeof schema.additionalProperties === "object") {
    const label = Object.keys(schema.properties ?? {}).length > 0 ? "Each additional value" : "Each value";
    append(label, schema.additionalProperties);
  }
  if (content.length === 0)
    return "";
  const escaped = content.map((line) => line.replaceAll("*/", "* /"));
  if (escaped.length === 1 && pad.length + escaped[0].length + 7 <= 120)
    return `${pad}/** ${escaped[0]} */
`;
  const body = escaped.map((line) => `${pad} *${line === "" ? "" : ` ${line}`}`).join(`
`);
  return `${pad}/**
${body}
${pad} */
`;
};
var renderSchema = (schema, ctx, depth = 0, seen = new Set) => {
  if (depth > MAX_RENDER_DEPTH)
    return "unknown";
  const nested = schema.definitions === undefined && schema.$defs === undefined ? ctx : { ...ctx, definitions: { ...ctx.definitions, ...schema.definitions ?? {}, ...schema.$defs ?? {} } };
  if (schema.$ref) {
    const name = definitionName(schema.$ref);
    if (!name || !nested.definitions[name] || seen.has(name))
      return "unknown";
    return intersection([
      renderSchema(nested.definitions[name], nested, depth, new Set([...seen, name])),
      renderSchema({ ...schema, $ref: undefined }, nested, depth + 1, seen)
    ]);
  }
  if (schema.const !== undefined)
    return renderLiteral(schema.const);
  if (schema.enum)
    return schema.enum.map(renderLiteral).join(" | ");
  const alternatives = schema.anyOf ?? schema.oneOf;
  if (alternatives) {
    if (alternatives.some((item) => item.type === "number") && alternatives.every((item) => item.type === "number" || effectNumberSentinel(item)))
      return "number";
    if (alternatives.length === 2 && alternatives[0]?.type === "object" && alternatives[0].properties === undefined && alternatives[1]?.type === "array" && alternatives[1].items === undefined) {
      return "{}";
    }
    const members = alternatives.map((item) => renderSchema(item, nested, depth + 1, seen));
    if (members.some((member) => member === "unknown"))
      return "unknown";
    return intersection([
      members.join(" | "),
      renderSchema({ ...schema, anyOf: undefined, oneOf: undefined }, nested, depth + 1, seen)
    ]);
  }
  if (schema.allOf) {
    if (schema.allOf.some((item) => hasUnresolvedRef(item, nested.definitions)))
      return "unknown";
    const members = schema.allOf.map((item) => renderSchema(item, nested, depth + 1, seen));
    return intersection([renderSchema({ ...schema, allOf: undefined }, nested, depth + 1, seen), ...members]);
  }
  if (Array.isArray(schema.type)) {
    return schema.type.map((item) => renderSchema({ ...schema, type: item }, nested, depth + 1, seen)).join(" | ");
  }
  if (schema.type === "string")
    return "string";
  if (schema.type === "number" || schema.type === "integer")
    return "number";
  if (schema.type === "boolean")
    return "boolean";
  if (schema.type === "null")
    return "null";
  if (schema.type === "array")
    return `Array<${renderSchema(schema.items ?? {}, nested, depth + 1, seen)}>`;
  if (schema.type === "object" || schema.properties) {
    const required = new Set(schema.required ?? []);
    const properties = Object.entries(schema.properties ?? {});
    const additional = schema.additionalProperties;
    const indexType = additional && typeof additional === "object" ? renderSchema(additional, nested, depth + 1, seen) : undefined;
    const field = ([name, value]) => `${renderKey(name)}${required.has(name) ? "" : "?"}: ${renderSchema(value, nested, depth + 1, seen)}`;
    if (!ctx.pretty) {
      const fields = properties.map(field);
      if (indexType !== undefined)
        fields.push(`[key: string]: ${indexType}`);
      return fields.length === 0 ? "{}" : `{ ${fields.join("; ")} }`;
    }
    if (properties.length === 0 && indexType === undefined)
      return "{}";
    const pad = "  ".repeat(depth + 1);
    const lines = properties.map((entry) => `${jsdoc(entry[1], pad)}${pad}${field(entry)},`);
    if (indexType !== undefined)
      lines.push(`${pad}[key: string]: ${indexType},`);
    return `{
${lines.join(`
`)}
${"  ".repeat(depth)}}`;
  }
  if (isEffectEmptyStruct(schema))
    return "{}";
  return "unknown";
};
var toTypeScript = (schema, decoded = false, pretty = false) => {
  try {
    const document = toJsonSchemaDocument2(decoded ? toType2(schema) : schema, {
      onExcessProperty: "error"
    });
    return renderSchema(document.schema, { definitions: document.definitions, pretty });
  } catch {
    return "unknown";
  }
};
var jsonSchemaToTypeScript = (schema, pretty = false) => {
  try {
    return renderSchema(schema, { definitions: {}, pretty });
  } catch {
    return "unknown";
  }
};
var inputProperties = (tool) => {
  try {
    const document = isEffectSchema(tool.input) ? toJsonSchemaDocument2(tool.input, { onExcessProperty: "error" }) : {
      schema: tool.input,
      definitions: { ...tool.input.definitions ?? {}, ...tool.input.$defs ?? {} }
    };
    let schema = document.schema;
    if (schema.$ref !== undefined) {
      const name = definitionName(schema.$ref);
      const resolved = name === undefined ? undefined : document.definitions[name];
      if (resolved === undefined)
        return [];
      schema = resolved;
    }
    const required = new Set(schema.required ?? []);
    return Object.entries(schema.properties ?? {}).map(([name, value]) => ({
      name,
      description: typeof value.description === "string" ? value.description : undefined,
      required: required.has(name)
    }));
  } catch {
    return [];
  }
};
var inputTypeScript = (tool, pretty = false) => isEffectSchema(tool.input) ? toTypeScript(tool.input, false, pretty) : jsonSchemaToTypeScript(tool.input, pretty);
var isEmptyInput = (tool) => isEffectSchema(tool.input) ? isEffectEmptyStruct(toJsonSchemaDocument2(tool.input, { referencePolicy: () => {
  return;
} }).schema) : inputTypeScript(tool) === "{}";
var outputTypeScript = (tool, pretty = false) => tool.output === undefined ? "void" : isEffectSchema(tool.output) ? toTypeScript(tool.output, true, pretty) : jsonSchemaToTypeScript(tool.output, pretty);
var decodeInput = (tool, value) => isEffectSchema(tool.input) ? decodeUnknownSync(tool.input)(value) : value;
var decodeOutput = (tool, value) => tool.output === undefined ? undefined : isEffectSchema(tool.output) ? decodeUnknownSync(tool.output)(value) : value;

// ../node_modules/@opencode/codemode/dist/namespace.js
var isNamespace = (value) => Object.hasOwn(value, "_tag") && value._tag === "CodeModeNamespace";

// ../node_modules/@opencode/codemode/dist/tool.js
var isTool = (value) => value !== undefined && Object.hasOwn(value, "_tag") && value._tag === "CodeModeTool";
var make8 = (options) => ({
  _tag: "CodeModeTool",
  description: options.description,
  input: options.input,
  output: options.output,
  execute: (input) => options.execute(input)
});

// ../node_modules/@opencode/codemode/dist/tool-runtime.js
var compareText = (left, right) => left < right ? -1 : left > right ? 1 : 0;
var hooked = (call, before, after, run) => {
  const observed = after === undefined ? run : onExit2(run, (exit) => {
    if (isSuccess3(exit))
      return after(call, { status: "success", value: exit.value });
    if (hasInterruptsOnly2(exit.cause))
      return after(call, { status: "interrupted" });
    return after(call, { status: "failure", error: squash(exit.cause) });
  });
  return before === undefined ? observed : andThen2(before(call), observed);
};
var defaultSearchLimit = 10;
var PositiveInt = Int.check(isGreaterThan2(0));
var NonNegativeInt = Int.check(isGreaterThanOrEqualTo2(0));
var SearchInput = Struct({
  query: optionalKey2(String4),
  namespace: optionalKey2(String4),
  limit: optionalKey2(PositiveInt),
  offset: optionalKey2(NonNegativeInt)
});
var SearchItem = Struct({
  path: String4,
  description: String4,
  signature: String4
});
var SearchOutput = Struct({
  items: ArraySchema(SearchItem),
  remaining: NonNegativeInt,
  next: NullOr(Struct({ offset: NonNegativeInt }))
});
var toolExpression = (path) => "tools" + path.split(".").map((segment) => identifierSegment.test(segment) ? `.${segment}` : `[${JSON.stringify(segment)}]`).join("");

class ToolReference {
  path;
  constructor(path) {
    this.path = path;
  }
}
var toolTrie = (tools) => {
  const root = { children: new Map };
  const insert = (node, group) => {
    for (const [name, value] of Object.entries(group)) {
      let current = node;
      for (const segment of name.split(".")) {
        if (segment === "")
          throw new TypeError(`Tool name '${name}' contains an empty segment.`);
        const child = current.children.get(segment) ?? { children: new Map };
        current.children.set(segment, child);
        current = child;
      }
      if (isTool(value))
        current.tool = value;
      else if (isNamespace(value)) {
        current.namespace = value;
        insert(current, value.tools);
      } else
        insert(current, value);
    }
  };
  insert(root, tools);
  return root;
};
var canonicalSegments = (path) => path.flatMap((segment) => segment.split("."));
var flattenTools = (node, path = [], namespaces = []) => {
  const next = node.namespace === undefined ? namespaces : [...namespaces, node.namespace];
  return [
    ...node.tool === undefined ? [] : [{ path: path.join("."), tool: node.tool, namespaces: next }],
    ...Array.from(node.children).flatMap(([name, child]) => flattenTools(child, [...path, name], next))
  ];
};
var describeTool = (visible) => {
  let signature;
  return {
    path: visible.path,
    description: visible.tool.description,
    get signature() {
      return signature ??= [
        toolExpression(visible.path),
        isEmptyInput(visible.tool) ? "()" : `(${inputTypeScript(visible.tool, true)})`,
        `: Promise<${outputTypeScript(visible.tool, true)}>`
      ].join("");
    }
  };
};
var tokenize = (query) => query.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 0 && term !== "*");
var termForms = (term) => {
  const forms = [term];
  if (term.endsWith("es") && term.length > 3)
    forms.push(term.slice(0, -2));
  if (term.endsWith("s") && term.length > 2)
    forms.push(term.slice(0, -1));
  return forms;
};
var rank = (entries, query) => {
  const terms = tokenize(query).map(termForms);
  return entries.map((entry) => {
    const path = entry.description.path.toLowerCase();
    const description = entry.description.description.toLowerCase();
    const score = terms.reduce((total, forms) => total + (forms.some((form) => path === form || path.endsWith(`.${form}`)) ? 20 : 0) + (forms.some((form) => entry.pathWords.includes(form)) ? 12 : 0) + (forms.some((form) => path.includes(form)) ? 8 : 0) + (forms.some((form) => description.includes(form)) ? 4 : 0) + (forms.some((form) => entry.searchText.includes(form)) ? 2 : 0), 0);
    return { entry, score };
  }).filter(({ score }) => terms.length === 0 || score > 0).sort((left, right) => right.score - left.score || compareText(left.entry.description.path, right.entry.description.path)).map(({ entry }) => entry);
};
var makeSearchTool = (searchIndex) => ({
  _tag: "CodeModeTool",
  description: "Search available tools",
  input: SearchInput,
  output: SearchOutput,
  execute: (input) => sync2(() => {
    const request = input;
    const query = request.query ?? "";
    const offset = request.offset ?? 0;
    let ns = request.namespace;
    if (ns !== undefined && !searchIndex.some((entry) => entry.description.path.startsWith("tools."))) {
      if (ns === "tools")
        ns = undefined;
      else if (ns.startsWith("tools."))
        ns = ns.slice("tools.".length);
    }
    const scoped = ns === undefined ? searchIndex : searchIndex.filter((entry) => entry.description.path === ns || entry.description.path.startsWith(`${ns}.`));
    const trimmed = query.trim();
    const pathQuery = trimmed.startsWith("tools.") ? trimmed.slice("tools.".length) : trimmed;
    const exact = pathQuery === "" ? undefined : scoped.find((entry) => entry.description.path === pathQuery || toolExpression(entry.description.path) === trimmed);
    const ranked = exact !== undefined ? [exact] : rank(scoped, query);
    const items = ranked.slice(offset, offset + (request.limit ?? defaultSearchLimit)).map(({ description }) => ({
      ...description,
      path: toolExpression(description.path)
    }));
    const remaining = Math.max(0, ranked.length - offset - items.length);
    return {
      items,
      remaining,
      next: remaining > 0 ? { offset: offset + items.length } : null
    };
  })
});
var searchSignature = (() => {
  const tool = makeSearchTool([]);
  return `search(${inputTypeScript(tool, true)}): ${outputTypeScript(tool, true)}`;
})();
var toSearchEntry = (visible) => ({
  description: describeTool(visible),
  pathWords: tokenize(visible.path),
  searchText: [
    visible.path,
    visible.tool.description,
    ...visible.namespaces.flatMap((namespace) => namespace.description === undefined ? [] : [namespace.description]),
    ...inputProperties(visible.tool).flatMap(({ name, description: property }) => property === undefined ? [name] : [name, property])
  ].join(`
`).toLowerCase()
});
var prepare = (tools) => {
  const root = toolTrie(tools);
  let searchIndex;
  let catalog;
  return {
    root,
    get catalog() {
      return catalog ??= this.searchIndex.map((entry) => entry.description);
    },
    get searchIndex() {
      return searchIndex ??= flattenTools(root).sort((left, right) => compareText(left.path, right.path)).map(toSearchEntry);
    }
  };
};
var lookup2 = (root, segments) => segments.reduce((node, segment) => node?.children.get(segment), root);
var namespaceKeys = (root, path) => {
  const segments = canonicalSegments(path);
  const node = lookup2(root, segments);
  if (node === undefined) {
    throw new ToolRuntimeError("UnknownTool", `Unknown tool namespace '${segments.join(".")}'.`);
  }
  return Array.from(node.children.keys());
};
var resolve3 = (root, path, index) => {
  const segments = canonicalSegments(path);
  const node = lookup2(root, segments);
  if (node === undefined) {
    const name = segments.join(".");
    const ns = segments.length > 1 && root.children.has(segments[0]) ? segments[0] : undefined;
    const closest = rank(ns ? index.filter((entry) => entry.description.path.startsWith(`${ns}.`)) : index, ns ? segments.slice(1).join(" ") : name)[0];
    throw new ToolRuntimeError("UnknownTool", closest ? `Unknown tool '${name}'. Did you mean ${toolExpression(closest.description.path)}?` : `Unknown tool '${name}'.`, ["Use search to find available tools."]);
  }
  if (node.tool === undefined) {
    throw new ToolRuntimeError("UnknownTool", `Tool '${segments.join(".")}' is not callable.`);
  }
  return node.tool;
};

class ToolRuntimeError extends Error {
  kind;
  suggestions;
  constructor(kind, message, suggestions = []) {
    super(message);
    this.kind = kind;
    this.suggestions = suggestions;
    this.name = "ToolRuntimeError";
  }
}
var make9 = (prepared, maxToolCalls, hooks = {}) => {
  const calls = [];
  const root = prepared.root;
  const recordCall = (call) => {
    if (maxToolCalls !== undefined && calls.length >= maxToolCalls) {
      throw new ToolRuntimeError("ToolCallLimitExceeded", `Execution exceeded its tool-call limit of ${maxToolCalls}.`);
    }
    calls.push(call);
  };
  const executeTool = (name, tool, args) => gen2(function* () {
    const normalized = args.length === 0 ? [{}] : args;
    if (normalized.length !== 1)
      throw new ToolRuntimeError("InvalidToolInput", `Tool '${name}' expects at most one input object.`);
    const input = yield* try_2({
      try: () => decodeInput(tool, normalized[0]),
      catch: (cause) => new ToolRuntimeError("InvalidToolInput", `Invalid input for tool '${name}': ${String(cause)}`, name === "search" ? [] : ["The signature may have changed. Use search to get the current signature."])
    });
    yield* sync2(() => recordCall({ name }));
    return yield* hooked({ name, input }, hooks["tool.before"], hooks["tool.after"], gen2(function* () {
      const raw = yield* suspend2(() => tool.execute(input)).pipe(catchCause2((cause) => {
        if (hasInterruptsOnly2(cause))
          return interrupt2;
        return fail5(toolError(prettyErrors(cause).map((error) => error.cause ? format(error) : error.message || error.name).join(`
`)));
      }));
      return yield* try_2({
        try: () => {
          const text = JSON.stringify(decodeOutput(tool, raw));
          return text === undefined ? undefined : JSON.parse(text);
        },
        catch: (cause) => new ToolRuntimeError("InvalidToolOutput", `Invalid output from tool '${name}': ${cause}`)
      });
    }));
  });
  return {
    calls,
    hooks,
    keys: (path) => namespaceKeys(root, path),
    search: (args) => suspend2(() => executeTool("search", makeSearchTool(prepared.searchIndex), args)),
    execute: (path, args) => suspend2(() => {
      const segments = canonicalSegments(path);
      if (segments.length === 1 && segments[0] === "search" && lookup2(root, segments) === undefined)
        return executeTool("search", makeSearchTool(prepared.searchIndex), args);
      return executeTool(segments.join("."), resolve3(root, path, prepared.searchIndex), args);
    })
  };
};

// ../node_modules/@opencode/codemode/dist/interpreter/objects.js
var data2 = { writable: true, enumerable: true, configurable: true };
var hidden = { writable: true, enumerable: false, configurable: true };
var readonly = { writable: false, enumerable: false, configurable: true };
var frozen = { writable: false, enumerable: false, configurable: false };

class Obj {
  proto;
  props = new Map;
  extensible = true;
  constructor(proto) {
    this.proto = proto;
  }
  tag = "Object";
  get describe() {
    if (this.tag === "Object")
      return "a data object";
    return `${/^[AEIO]/.test(this.tag) ? "an" : "a"} ${this.tag}`;
  }
  toString() {
    return `[object ${this.tag}]`;
  }
  toPrimitive(hint) {
    return this.toString();
  }
  toNumber() {
    return Number(this.toPrimitive("number"));
  }
  inspect(item) {
    return `{${entries(this).map(([key, value]) => `${JSON.stringify(key)}:${item(value)}`).join(",")}}`;
  }
  toHost(item) {
    return Object.fromEntries(entries(this).filter(([key]) => key !== "__proto__").map(([key, value]) => [key, item(value)]));
  }
  iterator(builtins) {
    return;
  }
}

class Arr extends Obj {
  items;
  tag = "Array";
  elements = data2;
  constructor(proto, items = []) {
    super(proto);
    this.items = items;
  }
  get describe() {
    return "an array";
  }
  toString() {
    return this.items.map((item) => item === null || item === undefined ? "" : coerceToString(item)).join(",");
  }
  inspect(item) {
    return `[${this.items.map(item).join(",")}]`;
  }
  toHost(item) {
    return this.items.map(item);
  }
  iterator() {
    return this.items.values();
  }
}

class ErrorObj extends Obj {
  tag = "Error";
  host;
  toString() {
    const name = get2(this, "name");
    const message = get2(this, "message");
    const shownName = typeof name === "string" ? name : "Error";
    const shownMessage = typeof message === "string" ? message : "";
    if (shownMessage === "")
      return shownName;
    if (shownName === "")
      return shownMessage;
    return `${shownName}: ${shownMessage}`;
  }
  inspect() {
    return this.toString();
  }
}

class Opaque extends Obj {
  inspect() {
    return "[opaque reference]";
  }
}

class Callable extends Opaque {
  length;
  tag = "Function";
  constructor(proto, name, length) {
    super(proto);
    this.length = length;
    define(this, "length", length, readonly);
    define(this, "name", name, readonly);
  }
  get describe() {
    return "a function";
  }
}

class Fn extends Callable {
  parameters;
  body;
  capturedScopes;
  async;
  generator;
  arrow;
  constructor(proto, name, parameters, body, capturedScopes, async, generator, arrow) {
    const optional = parameters.findIndex((p) => p.type === "AssignmentPattern" || p.type === "RestElement");
    super(proto, name, optional === -1 ? parameters.length : optional);
    this.parameters = parameters;
    this.body = body;
    this.capturedScopes = capturedScopes;
    this.async = async;
    this.generator = generator;
    this.arrow = arrow;
  }
}

class Arguments extends Obj {
  tag = "Arguments";
  constructor(proto, args) {
    super(proto);
    args.forEach((arg, index) => define(this, String(index), arg));
    define(this, "length", args.length, hidden);
  }
  iterator() {
    return keys(this).map((key) => get2(this, key)).values();
  }
}

class Native extends Callable {
  call;
  construct;
  callback;
  constructor(proto, options) {
    super(proto, options.name, options.length ?? 0);
    this.call = options.call;
    this.construct = options.construct;
    this.callback = options.callback ?? true;
  }
}

class PromiseObj extends Opaque {
  fiber;
  tag = "Promise";
  constructor(proto, fiber) {
    super(proto);
    this.fiber = fiber;
  }
  get describe() {
    return "an un-awaited Promise";
  }
  inspect() {
    return "[Promise (await it to get its value)]";
  }
}

class GeneratorObj extends Opaque {
  asynchronous;
  request;
  tag = "Generator";
  constructor(proto, asynchronous, request) {
    super(proto);
    this.asynchronous = asynchronous;
    this.request = request;
  }
  get describe() {
    return "a generator";
  }
}
var hostCursor = (iterator) => ({
  next: sync2(() => {
    const step = iterator.next();
    return { done: Boolean(step.done), value: step.value };
  }),
  close: void_3
});

class IteratorObj extends Opaque {
  cursor;
  tag = "Iterator";
  constructor(proto, cursor) {
    super(proto);
    this.cursor = cursor;
  }
  get describe() {
    return "an iterator";
  }
}
var hostIterator = (builtins, iterator) => new IteratorObj(builtins.Iterator, hostCursor(iterator));

class Wrapper extends Obj {
  inspect(item) {
    return this.toString();
  }
}

class DateObj extends Wrapper {
  time;
  tag = "Date";
  constructor(proto, time) {
    super(proto);
    this.time = time;
  }
  toString() {
    return Number.isFinite(this.time) ? new Date(this.time).toISOString() : "Invalid Date";
  }
  toPrimitive(hint) {
    return hint === "number" ? this.time : this.toString();
  }
  toHost() {
    return new Date(this.time);
  }
}

class RegExpObj extends Wrapper {
  tag = "RegExp";
  regex;
  constructor(proto, pattern, flags) {
    super(proto);
    this.regex = new RegExp(pattern, flags);
  }
  toString() {
    return `/${this.regex.source}/${this.regex.flags}`;
  }
  toHost() {
    return new RegExp(this.regex.source, this.regex.flags);
  }
}

class MapObj extends Wrapper {
  tag = "Map";
  map = new Map;
  inspect(item) {
    return `Map(${this.map.size}) [${[...this.map].map(([key, value]) => `[${item(key)},${item(value)}]`).join(",")}]`;
  }
  toHost(item) {
    return new Map([...this.map].map(([key, value]) => [item(key), item(value)]));
  }
  iterator(builtins) {
    return this.map.entries().map((entry) => new Arr(builtins.Array, entry));
  }
}

class SetObj extends Wrapper {
  tag = "Set";
  set = new Set;
  inspect(item) {
    return `Set(${this.set.size}) [${[...this.set].map(item).join(",")}]`;
  }
  toHost(item) {
    return new Set([...this.set].map(item));
  }
  iterator() {
    return this.set.values();
  }
}

class WeakMapObj extends Wrapper {
  tag = "WeakMap";
  map = new WeakMap;
  inspect() {
    return "WeakMap { <items unknown> }";
  }
}

class WeakSetObj extends Wrapper {
  tag = "WeakSet";
  set = new WeakSet;
  inspect() {
    return "WeakSet { <items unknown> }";
  }
}

class URLSearchParamsObj extends Wrapper {
  params;
  tag = "URLSearchParams";
  constructor(proto, params) {
    super(proto);
    this.params = params;
  }
  toString() {
    return this.params.toString();
  }
  toHost() {
    return new URLSearchParams(this.params);
  }
  iterator(builtins) {
    return this.params.entries().map((entry) => new Arr(builtins.Array, entry));
  }
}

class HeadersObj extends Wrapper {
  headers;
  tag = "Headers";
  constructor(proto, headers) {
    super(proto);
    this.headers = headers;
  }
  inspect() {
    return `Headers ${JSON.stringify(Object.fromEntries(this.headers))}`;
  }
  toHost() {
    return new Headers(this.headers);
  }
  iterator(builtins) {
    return Iterator.from(this.headers.entries()).map((entry) => new Arr(builtins.Array, entry));
  }
}

class URLObj extends Wrapper {
  url;
  tag = "URL";
  searchParams;
  constructor(proto, searchParamsProto, url) {
    super(proto);
    this.url = url;
    this.searchParams = new URLSearchParamsObj(searchParamsProto, url.searchParams);
  }
  toString() {
    return this.url.href;
  }
  toHost() {
    return new URL(this.url.href);
  }
}

class Bytes extends Wrapper {
  bytes;
  tag = "Uint8Array";
  constructor(proto, bytes) {
    super(proto);
    this.bytes = bytes;
  }
  toString() {
    return this.bytes.join(",");
  }
  inspect() {
    return `Uint8Array(${this.bytes.length}) [${this.bytes.join(",")}]`;
  }
  toHost() {
    return new Uint8Array(this.bytes);
  }
  iterator() {
    return this.bytes.values();
  }
}
var coerceToString = (value) => value instanceof Obj ? value.toString() : String(value);
var coerceToNumber = (value) => {
  if (value instanceof Obj)
    return value.toNumber();
  return value instanceof ToolReference ? Number.NaN : Number(value);
};
var coerceToInteger = (value) => {
  const number = coerceToNumber(value);
  return Number.isNaN(number) ? 0 : Math.trunc(number);
};
var isRuntimeReference = (value) => value instanceof Opaque || value instanceof Wrapper || value instanceof ToolReference;
var MAX_ARRAY_INDEX = 4294967295;
var parseArrayIndex = (key) => {
  const property = String(key);
  if (!/^(0|[1-9]\d*)$/.test(property))
    return;
  const index = Number(property);
  return index < MAX_ARRAY_INDEX ? index : undefined;
};
var canonical = (key) => typeof key === "symbol" ? key : String(key);
var isIndexed = (target) => target instanceof Arr || target instanceof Bytes;
var elements = (target) => target instanceof Arr ? target.items : target.bytes;
var index = (target, key) => isIndexed(target) && typeof key === "string" ? parseArrayIndex(key) : undefined;
var own = (target, key) => {
  const name = canonical(key);
  if (isIndexed(target)) {
    const at = index(target, name);
    if (at !== undefined) {
      const items = elements(target);
      if (!(at in items))
        return;
      return { value: items[at], ...target instanceof Arr ? target.elements : data2 };
    }
    if (target instanceof Arr && name === "length") {
      return { value: target.items.length, writable: target.elements.writable, enumerable: false, configurable: false };
    }
  }
  return target.props.get(name);
};
var read = (slot, receiver) => ("value" in slot) ? slot.value : slot.get === undefined ? undefined : slot.get(receiver);
var hasOwn2 = (target, key) => own(target, key) !== undefined;
var getOwn = (target, key) => {
  const slot = own(target, key);
  return slot === undefined ? undefined : read(slot, target);
};
var get2 = (target, key, receiver = target) => {
  for (let current = target;current !== null; current = current.proto) {
    const slot = own(current, key);
    if (slot !== undefined)
      return read(slot, receiver);
  }
  return;
};
var has = (target, key) => {
  for (let current = target;current !== null; current = current.proto) {
    if (own(current, key) !== undefined)
      return true;
  }
  return false;
};
var hasPrototype = (value, proto) => {
  for (let current = value instanceof Obj ? value.proto : null;current !== null; current = current.proto) {
    if (current === proto)
      return true;
  }
  return false;
};
var writeElement = (target, name, value) => {
  const at = index(target, name);
  if (at !== undefined) {
    if (target instanceof Bytes) {
      target.bytes[at] = typeof value === "number" ? value : Number(value);
      return true;
    }
    if (!(at in target.items))
      rejectAddition(target, at);
    target.items[at] = value;
    return true;
  }
  if (!(target instanceof Arr) || name !== "length")
    return;
  const length = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(length) || length < 0)
    throw rangeError("Invalid array length");
  if (length < target.items.length && !target.elements.configurable)
    return false;
  checkArrayLength(length);
  target.items.length = length;
  return true;
};
var set = (target, key, value) => {
  const name = canonical(key);
  for (let current = target;current !== null; current = current.proto) {
    const slot = own(current, name);
    if (slot === undefined)
      continue;
    if (!("value" in slot)) {
      if (slot.set === undefined)
        return false;
      slot.set(target, value);
      return true;
    }
    if (!slot.writable)
      return false;
    if (current !== target)
      break;
    if (isIndexed(target)) {
      const written = writeElement(target, name, value);
      if (written !== undefined)
        return written;
    }
    slot.value = value;
    return true;
  }
  if (isIndexed(target)) {
    const written = writeElement(target, name, value);
    if (written !== undefined)
      return written;
  }
  rejectAddition(target, name);
  target.props.set(name, { value, ...data2 });
  return true;
};
var rejectAddition = (target, key) => {
  if (target.extensible)
    return;
  throw typeError(`Cannot add property ${String(key)}, object is not extensible.`);
};
var define = (target, key, value, attrs = data2) => {
  const name = canonical(key);
  if (isIndexed(target) && writeElement(target, name, value) !== undefined)
    return;
  target.props.set(name, { value, ...attrs });
};
var defineAccessor = (target, key, get, set) => {
  target.props.set(canonical(key), { get, set, enumerable: false, configurable: true });
};
var remove = (target, key) => {
  const name = canonical(key);
  if (isIndexed(target)) {
    const at = index(target, name);
    if (at !== undefined) {
      if (target instanceof Bytes)
        return !(at in target.bytes);
      if (at in target.items && !target.elements.configurable)
        return false;
      return delete target.items[at];
    }
    if (target instanceof Arr && name === "length")
      return false;
  }
  const slot = target.props.get(name);
  if (slot === undefined)
    return true;
  if (!slot.configurable)
    return false;
  target.props.delete(name);
  return true;
};
var ownKeys = (target) => {
  const strings = [...target.props.keys()].filter((key) => typeof key === "string");
  const symbols = [...target.props.keys()].filter((key) => typeof key === "symbol");
  return [
    ...isIndexed(target) ? Object.keys(elements(target)) : [],
    ...target instanceof Arr ? ["length"] : [],
    ...strings.filter((key) => parseArrayIndex(key) !== undefined).sort((a, b) => Number(a) - Number(b)),
    ...strings.filter((key) => parseArrayIndex(key) === undefined),
    ...symbols
  ];
};
var enumerable = (target, key) => own(target, key)?.enumerable === true;
var enumerableKeys = (target) => ownKeys(target).filter((key) => (typeof key === "string" || key === IteratorSymbol || key === AsyncIteratorSymbol) && enumerable(target, key));
var keys = (target) => ownKeys(target).filter((key) => typeof key === "string" && enumerable(target, key));
var entries = (target) => keys(target).map((key) => [key, getOwn(target, key)]);
var record2 = (proto, fields) => {
  const target = new Obj(proto);
  for (const [key, value] of Object.entries(fields))
    define(target, key, value);
  return target;
};
var assign2 = (target, source, skip) => {
  for (const key of enumerableKeys(source)) {
    if (skip?.has(key))
      continue;
    set(target, key, getOwn(source, key));
  }
};

// ../node_modules/@opencode/codemode/dist/interpreter/references.js
var isOpaque = (value) => value instanceof Opaque || value instanceof ToolReference;
var find = (value, match, skip, seen) => {
  const pending = [[value].values()];
  while (pending.length > 0) {
    const next = pending.at(-1).next();
    if (next.done) {
      pending.pop();
      continue;
    }
    const current = next.value;
    if (match(current))
      return true;
    if (!(current instanceof Obj) || skip(current) || seen.has(current))
      continue;
    seen.add(current);
    pending.push(ownKeys(current).map((key) => getOwn(current, key)).values());
  }
  return false;
};
var never3 = () => false;
var containsRuntimeReference = (value) => find(value, isRuntimeReference, never3, new Set);
var containsOpaqueReference = (value) => find(value, isOpaque, (current) => isRuntimeReference(current) && !isOpaque(current), new Set);
var rejectCircularInsertion = (container, value, label, seen = new Set) => {
  if (find(value, (current) => current === container, isRuntimeReference, seen)) {
    throw invalidData(`${label} contains a circular value.`);
  }
};
var describeValue = (value) => {
  if (value === null || value === undefined)
    return String(value);
  if (value instanceof Obj)
    return value.describe;
  if (value instanceof ToolReference)
    return "a tool reference";
  return `a ${typeof value}`;
};
var typeofValue = (value) => {
  if (value instanceof Callable)
    return "function";
  if (value instanceof ToolReference)
    return value.path.length > 0 ? "function" : "object";
  return typeof value;
};

// ../node_modules/@opencode/codemode/dist/data.js
var toJson2 = (ctx, value, replacer) => walk(ctx, value, replacer, false);
var toBoundary = (ctx, value) => walk(ctx, value, undefined, true);
var walk = (ctx, value, replacer, boundary) => {
  const stack = new Set;
  const visit = (holder, key, depth) => gen2(function* () {
    if (depth > MAX_VALUE_DEPTH)
      throw rangeError(`Value exceeds the maximum depth of ${MAX_VALUE_DEPTH}.`);
    const raw = get2(holder, key);
    if (raw instanceof PromiseObj && !boundary) {
      throw invalidData("JSON.stringify received an un-awaited Promise; await it first - e.g. `const result = await tools.ns.tool(...)`.");
    }
    const settled = raw instanceof PromiseObj ? yield* ctx.await(raw) : raw;
    const toJSON = settled instanceof Obj ? get2(settled, "toJSON") : undefined;
    const own = toJSON instanceof Callable ? yield* ctx.call(toJSON, settled, [key]) : settled;
    const value = replacer === undefined ? own : yield* replacer([key, own], holder);
    if (value === undefined || typeofValue(value) === "function")
      return;
    if (typeof value === "number")
      return Number.isFinite(value) ? value : null;
    if (value === null || typeof value === "string" || typeof value === "boolean")
      return value;
    if (!(value instanceof Obj))
      return {};
    if (boundary && value instanceof Bytes) {
      throw invalidData("A Uint8Array cannot cross to the host; pass text instead, e.g. `new TextDecoder().decode(bytes)` or `bytes.toBase64()`.");
    }
    if (boundary && value instanceof URLSearchParamsObj)
      return value.params.toString();
    if (value instanceof HeadersObj)
      return Object.fromEntries(value.headers);
    const target = boundary && value instanceof SetObj ? new Arr(ctx.builtins.Array, [...value.set]) : value;
    if (stack.has(target))
      throw typeError("Converting circular structure to JSON.");
    stack.add(target);
    if (target instanceof Arr) {
      const items = [];
      for (let index = 0;index < target.items.length; index += 1) {
        items.push((yield* visit(target, String(index), depth + 1)) ?? null);
      }
      stack.delete(target);
      return items;
    }
    const copied = {};
    const put = (name, item) => {
      if (item !== undefined)
        Object.defineProperty(copied, name, { value: item, enumerable: true, writable: true, configurable: true });
    };
    if (target instanceof ErrorObj) {
      put("name", yield* visit(target, "name", depth + 1));
      put("message", yield* visit(target, "message", depth + 1));
    }
    for (const name of keys(target)) {
      if (boundary && name === "__proto__")
        continue;
      put(name, yield* visit(target, name, depth + 1));
    }
    stack.delete(target);
    return copied;
  });
  return visit(record2(ctx.builtins.Object, { "": value }), "", 0);
};
var fromJson = (ctx, value) => {
  if (value === null || typeof value !== "object")
    return value;
  if (Array.isArray(value))
    return new Arr(ctx.builtins.Array, value.map((item) => fromJson(ctx, item)));
  const copied = new Obj(ctx.builtins.Object);
  for (const [key, item] of Object.entries(value))
    define(copied, key, fromJson(ctx, item));
  return copied;
};

// ../node_modules/@opencode/codemode/dist/interpreter/intrinsics.js
var errorTypes = [
  "Error",
  "TypeError",
  "RangeError",
  "SyntaxError",
  "ReferenceError",
  "EvalError",
  "URIError",
  "AggregateError"
];
var isErrorType = (name) => errorTypes.includes(name);
var createErrorValue = (prototype, message) => {
  const value = new ErrorObj(prototype);
  if (message !== undefined)
    define(value, "message", message, hidden);
  return value;
};
var primitivePrototype = (builtins, value) => {
  if (typeof value === "string")
    return builtins.String;
  if (typeof value === "number")
    return builtins.Number;
  if (typeof value === "boolean")
    return builtins.Boolean;
  return;
};
var createBuiltins = () => {
  const object = new Obj(null);
  const fn = new Native(object, { name: "", call: () => undefined_2 });
  const plain = () => new Obj(object);
  const error = plain();
  define(error, "name", "Error", hidden);
  define(error, "message", "", hidden);
  const derived = (type) => {
    const proto = new Obj(error);
    define(proto, "name", type, hidden);
    define(proto, "message", "", hidden);
    return proto;
  };
  const iterator = plain();
  const asyncIterator = plain();
  return {
    Object: object,
    Function: fn,
    Array: new Arr(object),
    String: plain(),
    Number: plain(),
    Boolean: plain(),
    Date: plain(),
    RegExp: plain(),
    Map: plain(),
    Set: plain(),
    WeakMap: plain(),
    WeakSet: plain(),
    URL: plain(),
    URLSearchParams: plain(),
    Headers: plain(),
    Uint8Array: plain(),
    TextEncoder: plain(),
    TextDecoder: plain(),
    Promise: plain(),
    Iterator: iterator,
    IteratorHelper: new Obj(iterator),
    AsyncIterator: asyncIterator,
    Generator: new Obj(iterator),
    AsyncGenerator: new Obj(asyncIterator),
    Error: error,
    TypeError: derived("TypeError"),
    RangeError: derived("RangeError"),
    SyntaxError: derived("SyntaxError"),
    ReferenceError: derived("ReferenceError"),
    EvalError: derived("EvalError"),
    URIError: derived("URIError"),
    AggregateError: derived("AggregateError")
  };
};

// ../node_modules/@opencode/codemode/dist/interpreter/native.js
var lift = (impl) => (thisValue, args) => {
  const result = impl(thisValue, args);
  return isEffect2(result) ? result : succeed5(result);
};
var native = (builtins, options) => new Native(builtins.Function, options);
var fn2 = (builtins, name, length, impl) => native(builtins, { name, length, call: lift(impl) });
var methods = (builtins, target, table) => {
  for (const [name, length, impl] of table)
    define(target, name, fn2(builtins, name, length, impl), hidden);
};
var constants = (target, table) => {
  for (const [name, value] of Object.entries(table))
    define(target, name, value, frozen);
};
var constructor = (builtins, proto, options) => {
  const ctor = native(builtins, options);
  define(ctor, "prototype", proto, frozen);
  define(proto, "constructor", ctor, hidden);
  return ctor;
};
var requiresNew = (name) => () => sync2(() => {
  throw typeError(`Constructor ${name} requires 'new'.`);
});
var prototypeFrom = (newTarget, fallback) => {
  const proto = newTarget.props.get("prototype");
  return proto !== undefined && "value" in proto && proto.value instanceof Obj ? proto.value : fallback;
};
var receiver = (cls, thisValue, method) => {
  if (thisValue instanceof cls)
    return thisValue;
  throw typeError(`${method} called on incompatible receiver ${describeValue(thisValue)}.`);
};

// ../node_modules/@opencode/codemode/dist/interpreter/callback.js
var preserveConsumerError = (close, effect) => flatMap2(exit2(effect), (exit) => {
  if (isSuccess3(exit))
    return succeed5(exit.value);
  return flatMap2(exit2(close), (closed) => {
    if (!isSuccess3(closed) && squash(exit.cause) instanceof GeneratorReturn) {
      return failCause3(closed.cause);
    }
    return failCause3(exit.cause);
  });
});
var toPrimitive = (ctx, value, hint) => {
  if (!(value instanceof Obj) || isOpaque(value))
    return succeed5(value);
  const asString = hint === "string" || hint === "default" && value instanceof DateObj;
  const order = asString ? ["toString", "valueOf"] : ["valueOf", "toString"];
  return gen2(function* () {
    for (const method of order) {
      const callable = get2(value, method);
      if (!(callable instanceof Callable))
        continue;
      const result = yield* ctx.call(callable, value, []);
      if (result === null || typeof result !== "object" && typeof result !== "function")
        return result;
    }
    throw typeError("Cannot convert object to primitive value.");
  });
};
var invoke = (ctx, value, name, label) => {
  const target = value instanceof Obj ? value : primitivePrototype(ctx.builtins, value);
  if (target === undefined)
    throw typeError(`${label} called on null or undefined.`);
  return ctx.call(get2(target, name), value, []);
};
var toPrimitiveString = (ctx, value) => map4(toPrimitive(ctx, value, "string"), coerceToString);
var toPrimitiveNumber = (ctx, value) => map4(toPrimitive(ctx, value, "number"), coerceToNumber);
var withPrimitives = (ctx, hints, values, body) => {
  if (!values.some((value) => value instanceof Obj))
    return body(values);
  return flatMap2(forEach2(values, (value, index) => toPrimitive(ctx, value, typeof hints === "string" ? hints : hints[index])), (primitives) => {
    const result = body(primitives);
    return isEffect2(result) ? result : succeed5(result);
  });
};
var isSupportedCallback = (value) => value instanceof Callable && !(value instanceof Native && !value.callback);
var applyCollectionCallback = (ctx, callback, name) => {
  if (!isSupportedCallback(callback)) {
    if (typeofValue(callback) === "function") {
      throw typeError(`${name} cannot use this callable as a callback; wrap it in an arrow function, e.g. (value) => tools.ns.tool(value).`);
    }
    throw typeError(`${name} expects a function callback.`);
  }
  return (callbackArgs, thisValue) => ctx.call(callback, thisValue, callbackArgs);
};

// ../node_modules/@opencode/codemode/dist/stdlib/console.js
var consoleMethods = ["log", "info", "debug", "warn", "error", "dir", "table"];
var consoleGlobal = (ctx) => {
  const builtins = ctx.builtins;
  const console2 = new Obj(builtins.Object);
  methods(builtins, console2, consoleMethods.map((name) => [
    name,
    0,
    (_, args) => {
      ctx.logs.push(formatConsoleMessage(name, args));
      return;
    }
  ]));
  return console2;
};
var MAX_CONSOLE_DEPTH = 32;
var formatConsoleMessage = (name, args) => {
  if (name === "dir")
    return args.length === 0 ? "undefined" : formatValue(args[0]);
  if (name === "table")
    return formatConsoleTable(args[0], args[1]);
  const prefix = name === "warn" ? "[warn] " : name === "error" ? "[error] " : name === "debug" ? "[debug] " : "";
  return `${prefix}${args.map((arg) => formatValue(arg)).join(" ")}`;
};
var formatValue = (value) => {
  if (value === undefined)
    return "undefined";
  if (typeof value === "string")
    return value;
  return formatConsoleValue(value, new Set, 0);
};
var formatConsoleValue = (value, seen, depth) => {
  if (value === null || value === undefined)
    return "null";
  if (typeof value === "string")
    return JSON.stringify(value);
  if (!(value instanceof Obj))
    return value instanceof ToolReference ? "[opaque reference]" : String(value);
  if (depth > MAX_CONSOLE_DEPTH)
    return "...";
  if (seen.has(value))
    return "[Circular]";
  seen.add(value);
  try {
    return value.inspect((item) => formatConsoleValue(item, seen, depth + 1));
  } finally {
    seen.delete(value);
  }
};
var formatConsoleTable = (value, columnsArgument) => {
  if (value === undefined)
    return "undefined";
  if (containsOpaqueReference(value))
    return "[opaque reference]";
  const columns = columnsArgument instanceof Arr ? columnsArgument.items.map(String) : undefined;
  const rows = consoleTableRows(value, columns);
  const keys = columns ?? Array.from(new Set(rows.flatMap((row) => Object.keys(row.values))));
  const header = ["(index)", ...keys].join("\t");
  return [
    header,
    ...rows.map((row) => [row.index, ...keys.map((key) => formatConsoleTableCell(row.values[key]))].join("\t"))
  ].join(`
`);
};
var consoleTableRows = (data, columns) => {
  if (data instanceof Arr) {
    return data.items.map((item, index) => ({ index: String(index), values: consoleTableValues(item, columns) }));
  }
  if (data instanceof Obj) {
    return entries(data).map(([index, item]) => ({ index, values: consoleTableValues(item, columns) }));
  }
  return [{ index: "0", values: { Value: data } }];
};
var consoleTableValues = (value, columns) => {
  if (value instanceof Obj && !(value instanceof Arr)) {
    if (columns !== undefined)
      return Object.fromEntries(columns.map((column) => [column, get2(value, column)]));
    return Object.fromEntries(entries(value));
  }
  return { Value: value };
};
var formatConsoleTableCell = (value) => {
  if (value === undefined)
    return "";
  if (typeof value === "string")
    return value;
  return formatConsoleValue(value, new Set, 0);
};

// ../node_modules/@opencode/codemode/dist/interpreter/errors.js
var normalizeError = (error) => {
  if (error instanceof PendingThrow) {
    return {
      kind: error.kind,
      message: `${error.type}: ${error.message}${formatLocation(error.node)}`,
      ...error.node?.loc ? { location: sourceLocation(error.node) } : {},
      ...error.suggestions ? { suggestions: error.suggestions } : {}
    };
  }
  if (error instanceof ToolRuntimeError) {
    return {
      kind: error.kind,
      message: error.message,
      ...error.suggestions.length > 0 ? { suggestions: error.suggestions } : {}
    };
  }
  if (error instanceof ToolError) {
    return { kind: "ToolFailure", message: error.message };
  }
  if (error instanceof Throw) {
    const value = error.value;
    if (value instanceof ErrorObj) {
      return value.host ? normalizeError(value.host) : { kind: "ExecutionFailure", message: errorToString(value) };
    }
    let message;
    if (containsRuntimeReference(value)) {
      message = "a non-data value";
    } else if (typeof value === "string") {
      message = value;
    } else {
      message = formatValue(value);
    }
    return { kind: "ExecutionFailure", message: `Uncaught: ${message}` };
  }
  if (error instanceof RangeError && /call stack|recursion/i.test(error.message)) {
    return {
      kind: "ExecutionFailure",
      message: "Execution exceeded the maximum nesting depth."
    };
  }
  if (error instanceof Error) {
    return {
      kind: error.name === "SyntaxError" ? "ParseError" : "ExecutionFailure",
      message: error.message
    };
  }
  return {
    kind: "ExecutionFailure",
    message: String(error)
  };
};
var locate = (error, node) => {
  if (error instanceof PendingThrow) {
    if (error.node === undefined && node)
      error.node = node;
    return error;
  }
  if (error instanceof Error && !(error instanceof ToolError) && !(error instanceof ToolRuntimeError)) {
    return new PendingThrow(isErrorType(error.name) ? error.name : "Error", error.message, node);
  }
  return error;
};
var materialize = (ctx, thrown) => {
  if (thrown instanceof Throw)
    return thrown.value;
  const builtins = ctx.builtins;
  if (thrown instanceof PendingThrow) {
    if (thrown.value === undefined) {
      thrown.value = createErrorValue(builtins[thrown.type], thrown.message);
      thrown.value.host = thrown;
    }
    return thrown.value;
  }
  const type = thrown instanceof Error && isErrorType(thrown.name) ? thrown.name : "Error";
  return createErrorValue(builtins[type], normalizeError(thrown).message);
};
var errorToString = (self) => {
  const name = get2(self, "name");
  const message = get2(self, "message");
  const shownName = name === undefined ? "Error" : coerceToString(name);
  const shownMessage = message === undefined ? "" : coerceToString(message);
  if (shownMessage === "")
    return shownName;
  if (shownName === "")
    return shownMessage;
  return `${shownName}: ${shownMessage}`;
};
var createAggregateErrorValue = (ctx, errors, message, proto = ctx.builtins.AggregateError) => {
  const value = createErrorValue(proto, message);
  define(value, "errors", new Arr(ctx.builtins.Array, errors), { ...hidden });
  return value;
};
var constructAggregateErrorValue = (ctx, args, proto) => gen2(function* () {
  const message = args[1] === undefined ? "" : yield* toPrimitiveString(ctx, args[1]);
  const cursor = yield* ctx.iterate(args[0]);
  if (cursor === undefined)
    throw typeError("new AggregateError(...) expects a synchronous iterable of errors.");
  const errors = [];
  while (true) {
    const step = yield* cursor.next;
    if (step.done)
      return createAggregateErrorValue(ctx, errors, message, proto);
    errors.push(step.value);
  }
});
var errorGlobal = (type, ctx) => {
  const builtins = ctx.builtins;
  const prototype = builtins[type];
  const construct = (args, newTarget) => {
    const proto = prototypeFrom(newTarget, prototype);
    const created = type === "AggregateError" ? constructAggregateErrorValue(ctx, args, proto) : map4(args[0] === undefined ? undefined_2 : toPrimitiveString(ctx, args[0]), (message) => createErrorValue(proto, message));
    const options = args[type === "AggregateError" ? 2 : 1];
    if (!(options instanceof Obj) || !has(options, "cause"))
      return created;
    return map4(created, (value) => {
      define(value, "cause", get2(options, "cause"), hidden);
      return value;
    });
  };
  const ctor = constructor(builtins, prototype, {
    name: type,
    length: type === "AggregateError" ? 2 : 1,
    call: (_, args) => construct(args, ctor),
    construct
  });
  if (type === "Error") {
    methods(builtins, prototype, [
      ["toString", 0, (thisValue) => errorToString(receiver(Obj, thisValue, "Error.prototype.toString"))]
    ]);
    methods(builtins, ctor, [["isError", 1, (_, args) => args[0] instanceof ErrorObj]]);
    return ctor;
  }
  ctor.proto = get2(builtins.Error, "constructor");
  return ctor;
};

// ../node_modules/@opencode/codemode/dist/interpreter/promises.js
var capability = (ctx, name, settle) => fn2(ctx.builtins, name, 1, (_, args) => {
  settle(args[0]);
  return;
});
var MAX_NESTING = 100;

class Turn {
  holder;
  handbacks = [];
  first;
  last;
  nesting = 0;
  take = withFiber2((fiber) => {
    if (this.holder === undefined) {
      this.holder = fiber;
      return void_3;
    }
    return callback2((resume) => {
      const waiter = { fiber, resume, removed: false };
      if (this.last === undefined)
        this.first = waiter;
      else
        this.last.next = waiter;
      this.last = waiter;
      return sync2(() => {
        if (this.holder === fiber)
          this.release(fiber);
        else
          waiter.removed = true;
      });
    });
  });
  hold(effect) {
    return withFiber2((fiber) => andThen2(this.take, effect).pipe(ensuring2(sync2(() => this.release(fiber)))));
  }
  release(fiber) {
    if (this.holder !== fiber)
      return;
    const back = this.handbacks.pop();
    if (back !== undefined) {
      this.holder = back.fiber;
      this.handBack(back);
      return;
    }
    let next = this.first;
    while (next !== undefined && next.removed)
      next = next.next;
    this.first = next?.next;
    if (this.first === undefined)
      this.last = undefined;
    this.holder = next?.fiber;
    if (next !== undefined)
      next.fiber.currentDispatcher.scheduleTask(() => next.resume(void_3), 0);
  }
  suspend(wait) {
    return uninterruptibleMask2((restore) => withFiber2((fiber) => {
      this.release(fiber);
      return flatMap2(exit2(restore(wait)), (exit) => isFailure3(exit) && hasInterruptsOnly2(exit.cause) ? exit : andThen2(restore(this.take), exit));
    }));
  }
  leave(wait) {
    return withFiber2((fiber) => {
      this.release(fiber);
      return wait;
    });
  }
  handOff(start) {
    return withFiber2((fiber) => {
      const back = { fiber, returned: false };
      this.handbacks.push(back);
      return andThen2(this.nest(start), awaitHandback(back));
    });
  }
  park(wait) {
    return uninterruptibleMask2((restore) => withFiber2((fiber) => {
      this.release(fiber);
      return tap2(restore(wait), () => {
        this.holder = fiber;
        return this.nesting > MAX_NESTING ? yieldNow2 : void_3;
      });
    }));
  }
  fork(effect, scope) {
    return withFiber2((caller) => {
      const back = { fiber: caller, returned: false };
      this.handbacks.push(back);
      let started = false;
      const body = withFiber2((fiber) => {
        started = true;
        this.holder = fiber;
        return effect;
      });
      const forked = this.nesting < MAX_NESTING ? this.nest(forkIn2(body, scope, { startImmediately: true })) : forkIn2(body, scope);
      return flatMap2(forked, (fiber) => {
        fiber.addObserver(() => {
          if (started)
            return this.release(fiber);
          const index = this.handbacks.lastIndexOf(back);
          if (index >= 0)
            this.handbacks.splice(index, 1);
          this.handBack(back);
        });
        return back.returned ? succeed5(fiber) : as2(awaitHandback(back), fiber);
      });
    });
  }
  handBack(back) {
    back.returned = true;
    const resume = back.resume;
    if (resume !== undefined)
      back.fiber.currentDispatcher.scheduleTask(() => resume(void_3), 0);
  }
  nest(effect) {
    return suspend2(() => {
      this.nesting++;
      return ensuring2(effect, sync2(() => {
        this.nesting--;
      }));
    });
  }
}
var awaitHandback = (back) => callback2((resume) => {
  if (back.returned)
    resume(void_3);
  else
    back.resume = resume;
});

class Pending {
  scope;
  proto;
  turn = new Turn;
  active = new Set;
  ids = new WeakMap;
  observed = new WeakSet;
  failures = new Map;
  nextID = 0;
  constructor(scope, proto) {
    this.scope = scope;
    this.proto = proto;
  }
  createWithSelf(body) {
    const self = {};
    return map4(this.create(body(self)), (promise) => {
      self.promise = promise;
      return promise;
    });
  }
  create(effect) {
    return this.register(effect, (body) => this.turn.fork(body, this.scope));
  }
  createHost(effect) {
    return this.register(effect, (body) => forkIn2(body, this.scope, { startImmediately: true }));
  }
  register(effect, fork) {
    return flatMap2(CallSite, (site) => {
      if (this.active.size >= MAX_PENDING_PROMISES) {
        throw rangeError(`Too many pending promises (limit ${MAX_PENDING_PROMISES}); await promises before creating more.`);
      }
      const id = this.nextID++;
      const body = catchDefect2(effect, (defect) => die3(locate(defect, site.node)));
      return map4(fork(body), (fiber) => {
        const promise = new PromiseObj(this.proto, fiber);
        this.active.add(promise);
        this.ids.set(promise, id);
        fiber.addObserver((exit) => {
          this.active.delete(promise);
          if (isSuccess3(exit) || hasInterruptsOnly2(exit.cause) || this.observed.has(promise)) {
            this.ids.delete(promise);
            return;
          }
          const failure = normalizeError(squash(exit.cause));
          this.failures.set(id, {
            ...failure,
            message: `Unhandled rejection from an un-awaited promise: ${failure.message}`
          });
        });
        return promise;
      });
    });
  }
  markObserved(promise) {
    this.observed.add(promise);
    const id = this.ids.get(promise);
    this.ids.delete(promise);
    if (id !== undefined)
      this.failures.delete(id);
  }
  await(promise) {
    return await_(promise.fiber);
  }
  fork(effect) {
    return asVoid2(this.turn.fork(effect, this.scope));
  }
  diagnostics() {
    return [...this.failures].sort(([left], [right]) => left - right).map(([, failure]) => failure);
  }
  interrupt() {
    const self = this;
    return gen2(function* () {
      while (self.active.size > 0) {
        yield* interruptAll([...self.active].map((promise) => promise.fiber));
      }
      return self.diagnostics();
    });
  }
}
var resolvePromiseValue = (ctx, value, own) => {
  if (own?.promise !== undefined && value === own.promise) {
    return die3(typeError("Chaining cycle detected: a promise cannot resolve with itself."));
  }
  if (value instanceof PromiseObj)
    return ctx.await(value);
  if (!(value instanceof Obj))
    return succeed5(value);
  const then = get2(value, "then");
  if (typeofValue(then) !== "function")
    return succeed5(value);
  return gen2(function* () {
    yield* ctx.pending.turn.suspend(yieldNow2);
    const deferred = makeUnsafe2();
    const resolve = capability(ctx, "resolve", (result) => doneUnsafe(deferred, succeed4(result)));
    const reject = capability(ctx, "reject", (reason) => doneUnsafe(deferred, fail4(new Throw(reason))));
    const executed = yield* exit2(ctx.call(then, value, [resolve, reject]));
    if (!isSuccess3(executed)) {
      if (hasInterruptsOnly2(executed.cause))
        return yield* failCause3(executed.cause);
      doneUnsafe(deferred, fail4(squash(executed.cause)));
    }
    return yield* resolvePromiseValue(ctx, yield* ctx.pending.turn.leave(_await(deferred)), own);
  });
};
var resolvePromise = (ctx, value) => {
  if (value instanceof PromiseObj)
    return succeed5(value);
  return ctx.pending.createWithSelf((self) => resolvePromiseValue(ctx, value, self));
};
var promiseStatics = ["all", "allSettled", "race", "any", "resolve", "reject", "withResolvers", "try"];
var invokePromiseMethod = (ctx, name, args) => {
  if (name === "resolve") {
    return resolvePromise(ctx, args[0]);
  }
  if (name === "reject") {
    return ctx.pending.create(fail5(new Throw(args[0])));
  }
  if (name === "withResolvers") {
    return map4(promiseCapability(ctx), (made) => record2(ctx.builtins.Object, { promise: made.promise, resolve: made.resolve, reject: made.reject }));
  }
  if (name === "try") {
    if (typeofValue(args[0]) !== "function") {
      throw typeError(`Promise.try expects a function, received ${describeValue(args[0])}.`);
    }
    return flatMap2(exit2(ctx.call(args[0], undefined, args.slice(1))), (called) => {
      if (isSuccess3(called))
        return resolvePromise(ctx, called.value);
      if (hasInterruptsOnly2(called.cause))
        return failCause3(called.cause);
      return ctx.pending.create(fail5(squash(called.cause)));
    });
  }
  return ctx.pending.create(gen2(function* () {
    const cursor = yield* ctx.iterate(args[0]);
    if (cursor === undefined) {
      throw typeError(`Promise.${name} expects a synchronous iterable, received ${describeValue(args[0])}.`);
    }
    const items = [];
    while (true) {
      const step = yield* cursor.next;
      if (step.done)
        break;
      const item = yield* resolvePromise(ctx, step.value);
      ctx.pending.markObserved(item);
      items.push(item);
    }
    if (name === "all") {
      return new Arr(ctx.builtins.Array, yield* settleAfterTurn(ctx, all2(items.map((item) => flatten3(ctx.pending.await(item))), { concurrency: "unbounded" })));
    }
    if (name === "allSettled") {
      return yield* ctx.pending.turn.suspend(gen2(function* () {
        const outcomes = [];
        for (const item of items) {
          const exit = yield* ctx.pending.await(item);
          if (isSuccess3(exit)) {
            outcomes.push(record2(ctx.builtins.Object, { status: "fulfilled", value: exit.value }));
            continue;
          }
          if (hasInterruptsOnly2(exit.cause))
            return yield* failCause3(exit.cause);
          outcomes.push(record2(ctx.builtins.Object, {
            status: "rejected",
            reason: materialize(ctx, squash(exit.cause))
          }));
        }
        yield* yieldNow2;
        return new Arr(ctx.builtins.Array, outcomes);
      }));
    }
    if (name === "race") {
      if (items.length === 0) {
        throw typeError("Promise.race([]) would never settle; provide at least one promise or value.");
      }
      return yield* settleAfterTurn(ctx, flatten3(raceAll2(items.map((item) => ctx.pending.await(item)))));
    }
    const flipped = items.map((item) => flatMap2(ctx.pending.await(item), (exit) => {
      if (isSuccess3(exit))
        return fail5(new PromiseAnyFulfilled(exit.value));
      if (hasInterruptsOnly2(exit.cause))
        return failCause3(exit.cause);
      return succeed5(materialize(ctx, squash(exit.cause)));
    }));
    return yield* settleAfterTurn(ctx, all2(flipped, { concurrency: "unbounded" }).pipe(flatMap2((reasons) => fail5(new Throw(createAggregateErrorValue(ctx, reasons, "All promises were rejected")))), catch_2((error) => error instanceof PromiseAnyFulfilled ? succeed5(error.value) : fail5(error))));
  }));
};
var instanceMethod = (ctx, name, thisValue, args) => {
  const method = `Promise.prototype.${name}`;
  const promise = receiver(PromiseObj, thisValue, method);
  ctx.pending.markObserved(promise);
  if (name === "finally") {
    return chainFinally(ctx, promise, reactionHandler(args[0], method), method);
  }
  const onFulfilled = name === "then" ? reactionHandler(args[0], method) : undefined;
  const onRejected = reactionHandler(name === "then" ? args[1] : args[0], method);
  return chainReaction(ctx, promise, onFulfilled, onRejected, method);
};
var promiseCapability = (ctx) => gen2(function* () {
  const deferred = makeUnsafe2();
  const promise = yield* ctx.pending.createWithSelf((self) => flatMap2(ctx.pending.turn.leave(_await(deferred)), (value) => resolvePromiseValue(ctx, value, self)));
  const resolve = capability(ctx, "resolve", (value) => doneUnsafe(deferred, succeed4(value)));
  const reject = capability(ctx, "reject", (value) => doneUnsafe(deferred, fail4(new Throw(value))));
  return { promise, resolve, reject, deferred };
});
var constructPromise = (ctx, executor) => {
  if (!(executor instanceof Fn)) {
    throw typeError("new Promise(...) expects an executor function (e.g. new Promise((resolve, reject) => { ... })).");
  }
  return gen2(function* () {
    const made = yield* promiseCapability(ctx);
    const executed = yield* exit2(ctx.call(executor, undefined, [made.resolve, made.reject]));
    if (!isSuccess3(executed)) {
      if (hasInterruptsOnly2(executed.cause))
        return yield* failCause3(executed.cause);
      doneUnsafe(made.deferred, fail4(squash(executed.cause)));
    }
    return made.promise;
  });
};
var settleAfterTurn = (ctx, body) => flatten3(ctx.pending.turn.suspend(flatMap2(exit2(body), (exit) => as2(yieldNow2, exit))));

class PromiseAnyFulfilled {
  value;
  constructor(value) {
    this.value = value;
  }
}
var reactionHandler = (value, method) => {
  if (isSupportedCallback(value))
    return value;
  if (typeofValue(value) === "function") {
    throw typeError(`${method} cannot use this callable as a handler; wrap it in an arrow function, e.g. (value) => tools.ns.tool(value).`);
  }
  return;
};
var reactionExit = (ctx, source) => ctx.pending.turn.suspend(gen2(function* () {
  const exit = yield* ctx.pending.await(source);
  if (!isSuccess3(exit) && hasInterruptsOnly2(exit.cause))
    return yield* failCause3(exit.cause);
  yield* yieldNow2;
  return exit;
}));
var chainReaction = (ctx, source, onFulfilled, onRejected, method) => {
  return ctx.pending.createWithSelf((self) => gen2(function* () {
    const exit = yield* reactionExit(ctx, source);
    const handler = isSuccess3(exit) ? onFulfilled : onRejected;
    if (handler === undefined)
      return yield* exit;
    const input = isSuccess3(exit) ? exit.value : materialize(ctx, squash(exit.cause));
    const result = yield* applyCollectionCallback(ctx, handler, method)([input]);
    return yield* resolvePromiseValue(ctx, result, self);
  }));
};
var chainFinally = (ctx, source, cleanup, method) => ctx.pending.create(gen2(function* () {
  const exit = yield* reactionExit(ctx, source);
  if (cleanup !== undefined) {
    const result = yield* applyCollectionCallback(ctx, cleanup, method)([]);
    const intermediate = yield* ctx.pending.create(gen2(function* () {
      yield* ctx.await(yield* resolvePromise(ctx, result));
      return yield* exit;
    }));
    return yield* ctx.await(intermediate);
  }
  return yield* exit;
}));
var promiseGlobal = (ctx) => {
  const builtins = ctx.builtins;
  const proto = builtins.Promise;
  const promise = constructor(builtins, proto, {
    name: "Promise",
    length: 1,
    call: requiresNew("Promise"),
    construct: (args) => constructPromise(ctx, args[0])
  });
  for (const name of promiseStatics) {
    define(promise, name, native(builtins, {
      name,
      length: 1,
      call: (_, args) => invokePromiseMethod(ctx, name, args),
      callback: false
    }), hidden);
  }
  methods(builtins, proto, [
    ["then", 2, (thisValue, args) => instanceMethod(ctx, "then", thisValue, args)],
    ["catch", 1, (thisValue, args) => instanceMethod(ctx, "catch", thisValue, args)],
    ["finally", 1, (thisValue, args) => instanceMethod(ctx, "finally", thisValue, args)]
  ]);
  return promise;
};

// ../node_modules/@opencode/codemode/dist/stdlib/array.js
var arrayLikeSource = (source) => {
  if (source instanceof Obj && !(source instanceof PromiseObj)) {
    const length = Math.max(0, coerceToInteger(get2(source, "length")));
    checkArrayLength(length);
    return { length, source };
  }
  throw invalidData(`Array.from expects an iterable or array-like value, received ${describeValue(source)}.`);
};
var arrayFrom = (ctx, args) => {
  const source = args[0];
  const proto = ctx.builtins.Array;
  const apply = args.length < 2 || args[1] === undefined ? undefined : applyCollectionCallback(ctx, args[1], "Array.from");
  return gen2(function* () {
    const cursor = yield* ctx.iterate(source);
    if (cursor === undefined) {
      if (source instanceof GeneratorObj) {
        throw typeError(`Array.from expects a synchronous iterable or array-like value, received ${describeValue(source)}.`);
      }
      const arrayLike = arrayLikeSource(source);
      const values = [];
      for (let index = 0;index < arrayLike.length; index += 1) {
        const item = get2(arrayLike.source, index);
        values.push(apply === undefined ? item : yield* apply([item, index], args[2]));
      }
      return new Arr(proto, values);
    }
    const values = [];
    let index = 0;
    while (true) {
      const step = yield* cursor.next;
      if (step.done)
        return new Arr(proto, values);
      values.push(apply === undefined ? step.value : yield* preserveConsumerError(cursor.close, apply([step.value, index], args[2])));
      index += 1;
    }
  });
};
var sortArray = (ctx, target, comparator, name) => {
  if (comparator === undefined) {
    return sync2(() => [...target].sort((a, b) => compareText(coerceToString(a), coerceToString(b))));
  }
  const apply = applyCollectionCallback(ctx, comparator, name);
  const mergeSort = (items) => {
    if (items.length <= 1)
      return succeed5(items);
    const midpoint = Math.floor(items.length / 2);
    return gen2(function* () {
      const left = yield* mergeSort(items.slice(0, midpoint));
      const right = yield* mergeSort(items.slice(midpoint));
      const merged = [];
      let leftIndex = 0;
      let rightIndex = 0;
      while (leftIndex < left.length && rightIndex < right.length) {
        const order = coerceToNumber(yield* apply([left[leftIndex], right[rightIndex]]));
        if (Number.isNaN(order) || order <= 0)
          merged.push(left[leftIndex++]);
        else
          merged.push(right[rightIndex++]);
      }
      return [...merged, ...left.slice(leftIndex), ...right.slice(rightIndex)];
    });
  };
  const defined = target.filter((item) => item !== undefined);
  const undefinedCount = target.length - defined.length;
  return map4(mergeSort(defined), (items) => [...items, ...Array(undefinedCount).fill(undefined)]);
};
var arrayGlobal = (ctx) => {
  const builtins = ctx.builtins;
  const proto = builtins.Array;
  const wrap = (items) => new Arr(proto, items);
  const construct = (args, into) => {
    if (args.length !== 1)
      return new Arr(into, [...args]);
    const first = args[0];
    if (typeof first !== "number")
      return new Arr(into, [first]);
    if (!Number.isInteger(first) || first < 0 || first > MAX_ARRAY_LENGTH)
      throw rangeError("Invalid array length.");
    return new Arr(into, new Array(first));
  };
  const array = constructor(builtins, proto, {
    name: "Array",
    length: 1,
    call: (_, args) => sync2(() => construct(args, proto)),
    construct: (args, newTarget) => sync2(() => construct(args, prototypeFrom(newTarget, proto)))
  });
  methods(builtins, array, [
    ["isArray", 1, (_, args) => args[0] instanceof Arr],
    ["of", 0, (_, args) => wrap([...args])],
    ["from", 1, (_, args) => arrayFrom(ctx, args)]
  ]);
  const self = (thisValue, name) => receiver(Arr, thisValue, `Array.prototype.${name}`);
  const mutable = (target, growth) => {
    const length = target.items.length;
    if ((growth ?? 0) > 0)
      rejectAddition(target, length);
    if ((growth ?? 0) < 0 && length > 0 && !target.elements.configurable) {
      throw typeError(`Cannot delete property '${length - 1}'.`);
    }
    if (!target.elements.writable && (length > 0 || growth !== undefined)) {
      throw typeError(`Cannot assign to read only property '${length > 0 ? 0 : "length"}'.`);
    }
    return target;
  };
  const optNumber = (value) => value === undefined ? undefined : coerceToInteger(value);
  methods(builtins, proto, [
    [
      "join",
      1,
      (thisValue, args) => {
        const parts = Array.from(self(thisValue, "join").items, (item) => item ?? "");
        return withPrimitives(ctx, "string", [args[0] === undefined ? "," : args[0], ...parts], ([separator, ...items]) => {
          const joined = items.map(coerceToString).join(coerceToString(separator));
          checkStringLength(joined.length);
          return joined;
        });
      }
    ],
    [
      "toString",
      0,
      (thisValue) => withPrimitives(ctx, "string", Array.from(self(thisValue, "toString").items, (item) => item ?? ""), (items) => items.map(coerceToString).join(","))
    ],
    [
      "includes",
      1,
      (thisValue, args) => {
        return self(thisValue, "includes").items.includes(args[0], optNumber(args[1]));
      }
    ],
    ["indexOf", 1, (thisValue, args) => self(thisValue, "indexOf").items.indexOf(args[0], optNumber(args[1]))],
    [
      "lastIndexOf",
      1,
      (thisValue, args) => {
        const target = self(thisValue, "lastIndexOf").items;
        return args.length < 2 ? target.lastIndexOf(args[0]) : target.lastIndexOf(args[0], optNumber(args[1]));
      }
    ],
    ["at", 1, (thisValue, args) => self(thisValue, "at").items.at(optNumber(args[0]) ?? 0)],
    [
      "slice",
      2,
      (thisValue, args) => wrap(self(thisValue, "slice").items.slice(optNumber(args[0]), optNumber(args[1])))
    ],
    [
      "concat",
      1,
      (thisValue, args) => {
        const joined = self(thisValue, "concat").items.concat(...args.map((item) => item instanceof Arr ? item.items : item));
        checkArrayLength(joined.length);
        return wrap(joined);
      }
    ],
    [
      "flat",
      0,
      (thisValue, args) => {
        const flatten = (items, depth) => items.flatMap((item) => item instanceof Arr && depth > 0 ? flatten(item.items, depth - 1) : [item]);
        const flattened = flatten(self(thisValue, "flat").items, optNumber(args[0]) ?? 1);
        checkArrayLength(flattened.length);
        return wrap(flattened);
      }
    ],
    [
      "reverse",
      0,
      (thisValue) => {
        const target = self(thisValue, "reverse");
        if (target.items.length > 1)
          mutable(target);
        target.items.reverse();
        return target;
      }
    ],
    [
      "sort",
      1,
      (thisValue, args) => {
        const target = mutable(self(thisValue, "sort"));
        const items = target.items;
        const length = items.length;
        const holeCount = Array.from({ length }, (_, index) => Object.hasOwn(items, index)).filter((o) => !o).length;
        const itemCount = length - holeCount;
        return map4(sortArray(ctx, items, args[0], "Array.sort"), (sorted) => {
          sorted.slice(0, itemCount).forEach((item, index) => {
            items[index] = item;
          });
          Array.from({ length: holeCount }, (_, index) => itemCount + index).forEach((index) => {
            delete items[index];
          });
          return target;
        });
      }
    ],
    [
      "toSorted",
      1,
      (thisValue, args) => map4(sortArray(ctx, self(thisValue, "toSorted").items, args[0], "Array.toSorted"), wrap)
    ],
    ["toReversed", 0, (thisValue) => wrap([...self(thisValue, "toReversed").items].reverse())],
    [
      "with",
      2,
      (thisValue, args) => {
        const target = self(thisValue, "with").items;
        const index = optNumber(args[0]) ?? 0;
        const resolved = index < 0 ? target.length + index : index;
        if (resolved < 0 || resolved >= target.length)
          throw rangeError("Array.with index is out of range.");
        const copied = [...target];
        copied[resolved] = args[1];
        return wrap(copied);
      }
    ],
    [
      "push",
      1,
      (thisValue, args) => {
        const target = mutable(self(thisValue, "push"), args.length);
        for (const item of args)
          rejectCircularInsertion(target, item, "Array.push result");
        return target.items.push(...args);
      }
    ],
    [
      "unshift",
      1,
      (thisValue, args) => {
        const target = mutable(self(thisValue, "unshift"), args.length);
        for (const item of args)
          rejectCircularInsertion(target, item, "Array.unshift result");
        return target.items.unshift(...args);
      }
    ],
    ["pop", 0, (thisValue) => mutable(self(thisValue, "pop"), -1).items.pop()],
    ["shift", 0, (thisValue) => mutable(self(thisValue, "shift"), -1).items.shift()],
    [
      "splice",
      2,
      (thisValue, args) => {
        const target = self(thisValue, "splice");
        const length = target.items.length;
        const start = optNumber(args[0]) ?? 0;
        const from = start < 0 ? Math.max(length + start, 0) : Math.min(start, length);
        const deleteCount = args.length === 1 ? length - from : Math.min(Math.max(optNumber(args[1]) ?? 0, 0), length - from);
        const inserted = args.slice(2);
        for (const item of inserted)
          rejectCircularInsertion(target, item, "Array.splice result");
        mutable(target, inserted.length - deleteCount);
        return wrap(target.items.splice(from, deleteCount, ...inserted));
      }
    ],
    [
      "toSpliced",
      2,
      (thisValue, args) => {
        const copied = [...self(thisValue, "toSpliced").items];
        if (args.length === 0)
          return wrap(copied);
        const start = optNumber(args[0]) ?? 0;
        if (args.length === 1)
          copied.splice(start);
        else
          copied.splice(start, optNumber(args[1]) ?? 0, ...args.slice(2));
        return wrap(copied);
      }
    ],
    [
      "fill",
      1,
      (thisValue, args) => {
        const target = mutable(self(thisValue, "fill"));
        rejectCircularInsertion(target, args[0], "Array.fill result");
        target.items.fill(args[0], optNumber(args[1]), optNumber(args[2]));
        return target;
      }
    ],
    [
      "copyWithin",
      2,
      (thisValue, args) => {
        const target = mutable(self(thisValue, "copyWithin"));
        target.items.copyWithin(optNumber(args[0]) ?? 0, optNumber(args[1]) ?? 0, optNumber(args[2]));
        return target;
      }
    ],
    [
      "toLocaleString",
      0,
      (thisValue) => map4(forEach2(self(thisValue, "toLocaleString").items, (item) => item === null || item === undefined ? succeed5("") : map4(invoke(ctx, item, "toLocaleString", "Array.prototype.toLocaleString"), coerceToString)), (parts) => parts.join(","))
    ],
    ["keys", 0, (thisValue) => hostIterator(builtins, self(thisValue, "keys").items.keys())],
    ["values", 0, (thisValue) => hostIterator(builtins, self(thisValue, "values").items.values())],
    [
      "entries",
      0,
      (thisValue) => hostIterator(builtins, self(thisValue, "entries").items.entries().map(([index, item]) => wrap([index, item])))
    ],
    [
      "flatMap",
      1,
      (thisValue, args) => {
        const target = self(thisValue, "flatMap");
        const apply = applyCollectionCallback(ctx, args[0], "Array.flatMap");
        return gen2(function* () {
          const length = target.items.length;
          const values = [];
          for (let index = 0;index < length; index += 1) {
            if (!(index in target.items))
              continue;
            const mapped = yield* apply([target.items[index], index, target], args[1]);
            if (mapped instanceof Arr) {
              mapped.items.forEach((item) => values.push(item));
              continue;
            }
            values.push(mapped);
          }
          return wrap(values);
        });
      }
    ],
    ...callbackMethods(ctx, "Array", self, (target) => target.items, wrap)
  ]);
  define(proto, IteratorSymbol, get2(proto, "values"), hidden);
  return array;
};
var callbackMethods = (ctx, label, self, elements, wrap) => {
  const iterate = (name, length, body) => [
    name,
    length,
    (thisValue, args) => {
      const target = self(thisValue, name);
      const call = applyCollectionCallback(ctx, args[0], `${label}.${name}`);
      const thisArg = name.startsWith("reduce") ? undefined : args[1];
      return body(elements(target), target, (callbackArgs) => call(callbackArgs, thisArg), args);
    }
  ];
  return [
    iterate("map", 1, (target, receiver, apply) => gen2(function* () {
      const length = target.length;
      const values = [];
      values.length = length;
      for (let index = 0;index < length; index += 1) {
        if (!(index in target))
          continue;
        values[index] = yield* apply([target[index], index, receiver]);
      }
      return wrap(values);
    })),
    iterate("filter", 1, (target, receiver, apply) => gen2(function* () {
      const length = target.length;
      const values = [];
      for (let index = 0;index < length; index += 1) {
        if (!(index in target))
          continue;
        const item = target[index];
        if (yield* apply([item, index, receiver]))
          values.push(item);
      }
      return wrap(values);
    })),
    iterate("find", 1, (target, receiver, apply) => gen2(function* () {
      const length = target.length;
      for (let index = 0;index < length; index += 1) {
        const item = target[index];
        if (yield* apply([item, index, receiver]))
          return item;
      }
      return;
    })),
    iterate("findIndex", 1, (target, receiver, apply) => gen2(function* () {
      const length = target.length;
      for (let index = 0;index < length; index += 1) {
        if (yield* apply([target[index], index, receiver]))
          return index;
      }
      return -1;
    })),
    iterate("findLast", 1, (target, receiver, apply) => gen2(function* () {
      for (let index = target.length - 1;index >= 0; index -= 1) {
        const item = target[index];
        if (yield* apply([item, index, receiver]))
          return item;
      }
      return;
    })),
    iterate("findLastIndex", 1, (target, receiver, apply) => gen2(function* () {
      for (let index = target.length - 1;index >= 0; index -= 1) {
        if (yield* apply([target[index], index, receiver]))
          return index;
      }
      return -1;
    })),
    iterate("some", 1, (target, receiver, apply) => gen2(function* () {
      const length = target.length;
      for (let index = 0;index < length; index += 1) {
        if (!(index in target))
          continue;
        if (yield* apply([target[index], index, receiver]))
          return true;
      }
      return false;
    })),
    iterate("every", 1, (target, receiver, apply) => gen2(function* () {
      const length = target.length;
      for (let index = 0;index < length; index += 1) {
        if (!(index in target))
          continue;
        if (!(yield* apply([target[index], index, receiver])))
          return false;
      }
      return true;
    })),
    iterate("forEach", 1, (target, receiver, apply) => gen2(function* () {
      const length = target.length;
      for (let index = 0;index < length; index += 1) {
        if (index in target)
          yield* apply([target[index], index, receiver]);
      }
      return;
    })),
    iterate("reduce", 1, (target, receiver, apply, args) => gen2(function* () {
      const length = target.length;
      let start = 0;
      let accumulator = args[1];
      if (args.length < 2) {
        while (start < length && !(start in target))
          start += 1;
        if (start === length) {
          throw typeError(`${label}.reduce of an empty array with no initial value.`);
        }
        accumulator = target[start];
        start += 1;
      }
      for (let index = start;index < length; index += 1) {
        if (!(index in target))
          continue;
        accumulator = yield* apply([accumulator, target[index], index, receiver]);
      }
      return accumulator;
    })),
    iterate("reduceRight", 1, (target, receiver, apply, args) => gen2(function* () {
      let start = target.length - 1;
      let accumulator = args[1];
      if (args.length < 2) {
        while (start >= 0 && !(start in target))
          start -= 1;
        if (start < 0) {
          throw typeError(`${label}.reduceRight of an empty array with no initial value.`);
        }
        accumulator = target[start];
        start -= 1;
      }
      for (let index = start;index >= 0; index -= 1) {
        if (!(index in target))
          continue;
        accumulator = yield* apply([accumulator, target[index], index, receiver]);
      }
      return accumulator;
    }))
  ];
};

// ../node_modules/@opencode/codemode/dist/stdlib/bytes.js
var collectBytes = (ctx, source, name, mapper, thisArg) => {
  const apply = mapper === undefined ? undefined : applyCollectionCallback(ctx, mapper, name);
  if (source instanceof Bytes && apply === undefined)
    return succeed5(new Uint8Array(source.bytes));
  return gen2(function* () {
    const cursor = yield* ctx.iterate(source);
    if (cursor === undefined) {
      throw typeError(`${name} expects a Uint8Array, an array, or an iterable of numbers, received ${describeValue(source)}.`);
    }
    const values = [];
    while (true) {
      const step = yield* cursor.next;
      if (step.done)
        break;
      values.push(step.value);
      checkArrayLength(values.length);
    }
    const mapped = apply === undefined ? values : yield* forEach2(values, (value, index) => apply([value, index], thisArg));
    return Uint8Array.from(mapped, coerceToNumber);
  });
};
var constructBytes = (ctx, args, proto) => {
  const source = args[0];
  if (source !== null && typeof source === "object") {
    return map4(collectBytes(ctx, source, "new Uint8Array(...)"), (bytes) => new Bytes(proto, bytes));
  }
  const length = source === undefined ? 0 : coerceToNumber(source);
  if (!Number.isInteger(length) || length < 0)
    throw rangeError(`Invalid typed array length: ${coerceToString(source)}`);
  checkArrayLength(length);
  return succeed5(new Bytes(proto, new Uint8Array(length)));
};
var uint8ArrayGlobal = (ctx) => {
  const builtins = ctx.builtins;
  const proto = builtins.Uint8Array;
  const wrap = (bytes) => new Bytes(proto, bytes);
  const uint8Array = constructor(builtins, proto, {
    name: "Uint8Array",
    length: 3,
    call: requiresNew("Uint8Array"),
    construct: (args, newTarget) => constructBytes(ctx, args, prototypeFrom(newTarget, proto))
  });
  const decode = (name, args, from) => {
    if (typeof args[0] !== "string")
      throw typeError(`Uint8Array.${name} expects a string.`);
    try {
      return wrap(from(args[0]));
    } catch {
      throw syntaxError(`Uint8Array.${name}: the string is not valid ${name === "fromHex" ? "hex" : "base64"}.`);
    }
  };
  methods(builtins, uint8Array, [
    ["from", 1, (_, args) => map4(collectBytes(ctx, args[0], "Uint8Array.from", args[1], args[2]), wrap)],
    ["of", 0, (_, args) => wrap(Uint8Array.from(args, coerceToNumber))],
    ["fromBase64", 1, (_, args) => decode("fromBase64", args, (text) => Uint8Array.fromBase64(text))],
    ["fromHex", 1, (_, args) => decode("fromHex", args, (text) => Uint8Array.fromHex(text))]
  ]);
  const self = (thisValue, name) => receiver(Bytes, thisValue, `Uint8Array.prototype.${name}`);
  const optNumber = (value) => value === undefined ? undefined : coerceToInteger(value);
  const search = (value) => typeof value === "number" ? value : NaN;
  const wrapAll = (items) => new Arr(builtins.Array, items);
  defineAccessor(proto, "length", (thisValue) => self(thisValue, "length").bytes.length);
  methods(builtins, proto, [
    ["at", 1, (thisValue, args) => self(thisValue, "at").bytes.at(optNumber(args[0]) ?? 0)],
    [
      "slice",
      2,
      (thisValue, args) => wrap(self(thisValue, "slice").bytes.slice(optNumber(args[0]), optNumber(args[1])))
    ],
    [
      "subarray",
      2,
      (thisValue, args) => wrap(self(thisValue, "subarray").bytes.subarray(optNumber(args[0]), optNumber(args[1])))
    ],
    [
      "set",
      1,
      (thisValue, args) => {
        const target = self(thisValue, "set");
        const offset = optNumber(args[1]) ?? 0;
        return map4(collectBytes(ctx, args[0], "Uint8Array.set"), (source) => {
          if (!Number.isInteger(offset) || offset < 0 || source.length + offset > target.bytes.length) {
            throw rangeError("Uint8Array.set: the source does not fit at that offset.");
          }
          target.bytes.set(source, offset);
          return;
        });
      }
    ],
    [
      "fill",
      1,
      (thisValue, args) => {
        const target = self(thisValue, "fill");
        target.bytes.fill(coerceToNumber(args[0]), optNumber(args[1]), optNumber(args[2]));
        return target;
      }
    ],
    [
      "reverse",
      0,
      (thisValue) => {
        const target = self(thisValue, "reverse");
        target.bytes.reverse();
        return target;
      }
    ],
    [
      "sort",
      1,
      (thisValue, args) => {
        const target = self(thisValue, "sort");
        if (args[0] === undefined) {
          target.bytes.sort();
          return target;
        }
        return map4(sortArray(ctx, [...target.bytes], args[0], "Uint8Array.sort"), (sorted) => {
          target.bytes.set(Uint8Array.from(sorted, coerceToNumber));
          return target;
        });
      }
    ],
    ["indexOf", 1, (thisValue, args) => self(thisValue, "indexOf").bytes.indexOf(search(args[0]), optNumber(args[1]))],
    [
      "lastIndexOf",
      1,
      (thisValue, args) => {
        const target = self(thisValue, "lastIndexOf").bytes;
        return args.length < 2 ? target.lastIndexOf(search(args[0])) : target.lastIndexOf(search(args[0]), optNumber(args[1]));
      }
    ],
    [
      "includes",
      1,
      (thisValue, args) => self(thisValue, "includes").bytes.includes(search(args[0]), optNumber(args[1]))
    ],
    [
      "join",
      1,
      (thisValue, args) => {
        const joined = self(thisValue, "join").bytes.join(args[0] === undefined ? "," : coerceToString(args[0]));
        checkStringLength(joined.length);
        return joined;
      }
    ],
    ["toString", 0, (thisValue) => self(thisValue, "toString").bytes.join(",")],
    ["toBase64", 0, (thisValue) => self(thisValue, "toBase64").bytes.toBase64()],
    ["toHex", 0, (thisValue) => self(thisValue, "toHex").bytes.toHex()],
    ["keys", 0, (thisValue) => hostIterator(builtins, self(thisValue, "keys").bytes.keys())],
    ["values", 0, (thisValue) => hostIterator(builtins, self(thisValue, "values").bytes.values())],
    [
      "entries",
      0,
      (thisValue) => hostIterator(builtins, self(thisValue, "entries").bytes.entries().map(([index, byte]) => wrapAll([index, byte])))
    ],
    ...callbackMethods(ctx, "Uint8Array", self, (target) => target.bytes, (values) => wrap(Uint8Array.from(values, coerceToNumber)))
  ]);
  define(proto, IteratorSymbol, get2(proto, "values"), hidden);
  return uint8Array;
};
var textEncoderGlobal = (ctx) => {
  const builtins = ctx.builtins;
  const proto = builtins.TextEncoder;
  const encoder = new TextEncoder;
  defineAccessor(proto, "encoding", () => "utf-8");
  methods(builtins, proto, [
    ["encode", 0, (_, args) => new Bytes(builtins.Uint8Array, encoder.encode(coerceToString(args[0] ?? "")))]
  ]);
  return constructor(builtins, proto, {
    name: "TextEncoder",
    call: requiresNew("TextEncoder"),
    construct: (_, newTarget) => succeed5(new Obj(prototypeFrom(newTarget, proto)))
  });
};

class TextDecoderObj extends Obj {
  decoder;
  constructor(proto, decoder) {
    super(proto);
    this.decoder = decoder;
  }
}
var utf8Labels = new Set(["unicode-1-1-utf-8", "unicode11utf8", "unicode20utf8", "utf-8", "utf8", "x-unicode20utf8"]);
var textDecoderGlobal = (ctx) => {
  const builtins = ctx.builtins;
  const proto = builtins.TextDecoder;
  const self = (thisValue, name) => receiver(TextDecoderObj, thisValue, `TextDecoder.prototype.${name}`);
  defineAccessor(proto, "encoding", (thisValue) => self(thisValue, "encoding").decoder.encoding);
  defineAccessor(proto, "fatal", (thisValue) => self(thisValue, "fatal").decoder.fatal);
  defineAccessor(proto, "ignoreBOM", (thisValue) => self(thisValue, "ignoreBOM").decoder.ignoreBOM);
  methods(builtins, proto, [
    [
      "decode",
      0,
      (thisValue, args) => {
        const decoder = self(thisValue, "decode").decoder;
        if (args[0] === undefined)
          return "";
        if (!(args[0] instanceof Bytes)) {
          throw typeError(`TextDecoder.decode expects a Uint8Array, received ${describeValue(args[0])}.`);
        }
        try {
          return decoder.decode(args[0].bytes);
        } catch {
          throw typeError(`TextDecoder.decode: the input is not valid ${decoder.encoding}.`);
        }
      }
    ]
  ]);
  return constructor(builtins, proto, {
    name: "TextDecoder",
    call: requiresNew("TextDecoder"),
    construct: (args, newTarget) => sync2(() => {
      const label = args[0] === undefined ? "utf-8" : coerceToString(args[0]).trim().toLowerCase();
      if (!utf8Labels.has(label))
        throw rangeError(`The "${label}" encoding is not supported; only UTF-8 is.`);
      const options = args[1] instanceof Obj ? args[1] : undefined;
      const flag = (name) => options !== undefined && Boolean(get2(options, name));
      return new TextDecoderObj(prototypeFrom(newTarget, proto), new TextDecoder("utf-8", { fatal: flag("fatal"), ignoreBOM: flag("ignoreBOM") }));
    })
  });
};

// ../node_modules/@opencode/codemode/dist/stdlib/collections.js
var coerceGroupByPropertyKey = (ctx, value) => {
  if (value instanceof PromiseObj)
    return succeed5(coerceToString(value));
  if (isOpaque(value)) {
    throw invalidData(`Object.groupBy callback must return a data value, received ${describeValue(value)}.`);
  }
  return toPrimitiveString(ctx, value);
};
var groupBy = (ctx, namespace) => fn2(ctx.builtins, "groupBy", 2, (_, args) => {
  const builtins = ctx.builtins;
  const source = args[0];
  if (source === null || source === undefined) {
    throw typeError(`${namespace}.groupBy expects an iterable collection.`);
  }
  const apply = applyCollectionCallback(ctx, args[1], `${namespace}.groupBy`);
  return gen2(function* () {
    const cursor = yield* ctx.iterate(source);
    if (cursor === undefined) {
      throw typeError(`${namespace}.groupBy expects an iterable collection.`);
    }
    if (namespace === "Map") {
      const result = new MapObj(builtins.Map);
      let index = 0;
      while (true) {
        const step = yield* cursor.next;
        if (step.done)
          return result;
        const item = step.value;
        const key = yield* preserveConsumerError(cursor.close, apply([item, index]));
        const group = result.map.get(key);
        if (group === undefined)
          result.map.set(key, new Arr(builtins.Array, [item]));
        else
          group.items.push(item);
        index += 1;
      }
    }
    const result = new Obj(null);
    let index = 0;
    while (true) {
      const step = yield* cursor.next;
      if (step.done)
        return result;
      const item = step.value;
      const key = yield* preserveConsumerError(cursor.close, flatMap2(apply([item, index]), (value) => coerceGroupByPropertyKey(ctx, value)));
      const group = getOwn(result, key);
      if (group === undefined)
        define(result, key, new Arr(builtins.Array, [item]));
      else
        group.items.push(item);
      index += 1;
    }
  });
});
var constructMap = (ctx, init, proto) => {
  const target = new MapObj(proto);
  if (init === undefined || init === null)
    return succeed5(target);
  return gen2(function* () {
    const cursor = yield* ctx.iterate(init);
    if (cursor === undefined) {
      throw typeError(`new Map(...) expects an iterable of [key, value] pairs, received ${describeValue(init)}.`);
    }
    while (true) {
      const step = yield* cursor.next;
      if (step.done)
        return target;
      yield* preserveConsumerError(cursor.close, sync2(() => {
        if (!(step.value instanceof Obj)) {
          throw typeError("new Map(...) expects [key, value] pairs as entry objects.");
        }
        target.map.set(getOwn(step.value, 0), getOwn(step.value, 1));
      }));
    }
  });
};
var constructSet = (ctx, init, proto) => {
  const target = new SetObj(proto);
  if (init === undefined || init === null)
    return succeed5(target);
  return gen2(function* () {
    const cursor = yield* ctx.iterate(init);
    if (cursor === undefined) {
      throw typeError(`new Set(...) expects a synchronous iterable, received ${describeValue(init)}.`);
    }
    while (true) {
      const step = yield* cursor.next;
      if (step.done)
        return target;
      target.set.add(step.value);
    }
  });
};
var mapGlobal = (ctx) => {
  const builtins = ctx.builtins;
  const proto = builtins.Map;
  const map = constructor(builtins, proto, {
    name: "Map",
    call: requiresNew("Map"),
    construct: (args, newTarget) => constructMap(ctx, args[0], prototypeFrom(newTarget, proto))
  });
  define(map, "groupBy", groupBy(ctx, "Map"), hidden);
  const self = (thisValue, name) => receiver(MapObj, thisValue, `Map.prototype.${name}`);
  defineAccessor(proto, "size", (thisValue) => receiver(MapObj, thisValue, "Map.prototype.size").map.size);
  methods(builtins, proto, [
    ["get", 1, (thisValue, args) => self(thisValue, "get").map.get(args[0])],
    ["has", 1, (thisValue, args) => self(thisValue, "has").map.has(args[0])],
    [
      "set",
      2,
      (thisValue, args) => {
        const target = self(thisValue, "set");
        target.map.set(args[0], args[1]);
        return target;
      }
    ],
    [
      "getOrInsert",
      2,
      (thisValue, args) => {
        const target = self(thisValue, "getOrInsert").map;
        if (!target.has(args[0]))
          target.set(args[0], args[1]);
        return target.get(args[0]);
      }
    ],
    [
      "getOrInsertComputed",
      2,
      (thisValue, args) => {
        const target = self(thisValue, "getOrInsertComputed").map;
        const apply = applyCollectionCallback(ctx, args[1], "Map.getOrInsertComputed");
        if (target.has(args[0]))
          return target.get(args[0]);
        return map4(apply([args[0] === 0 ? 0 : args[0]]), (value) => {
          target.set(args[0], value);
          return value;
        });
      }
    ],
    ["delete", 1, (thisValue, args) => self(thisValue, "delete").map.delete(args[0])],
    [
      "clear",
      0,
      (thisValue) => {
        self(thisValue, "clear").map.clear();
        return;
      }
    ],
    ["keys", 0, (thisValue) => hostIterator(builtins, self(thisValue, "keys").map.keys())],
    ["values", 0, (thisValue) => hostIterator(builtins, self(thisValue, "values").map.values())],
    ["entries", 0, (thisValue) => hostIterator(builtins, self(thisValue, "entries").iterator(builtins))],
    [
      "forEach",
      1,
      (thisValue, args) => {
        const target = self(thisValue, "forEach");
        const apply = applyCollectionCallback(ctx, args[0], "Map.forEach");
        return gen2(function* () {
          for (const [key, item] of target.map.entries())
            yield* apply([item, key, target], args[1]);
          return;
        });
      }
    ]
  ]);
  define(proto, IteratorSymbol, get2(proto, "entries"), hidden);
  return map;
};
var loadSetRecord = (ctx, source, name) => {
  if (source instanceof SetObj) {
    return succeed5({
      size: source.set.size,
      has: (item) => succeed5(source.set.has(item)),
      keys: () => succeed5(source.set.values())
    });
  }
  if (source instanceof MapObj) {
    return succeed5({
      size: source.map.size,
      has: (item) => succeed5(source.map.has(item)),
      keys: () => succeed5(source.map.keys())
    });
  }
  if (!(source instanceof Obj)) {
    throw typeError(`Set.${name} expects a Set-like object.`);
  }
  return gen2(function* () {
    const size = yield* toPrimitiveNumber(ctx, get2(source, "size"));
    if (Number.isNaN(size)) {
      throw typeError(`Set.${name} received a Set-like object with an invalid size.`);
    }
    const has = get2(source, "has");
    const keys = get2(source, "keys");
    if (!isSupportedCallback(has) || !isSupportedCallback(keys)) {
      throw typeError(`Set.${name} expects callable 'has' and 'keys' methods.`);
    }
    return {
      size: Math.max(Math.trunc(size), 0),
      has: (item) => map4(ctx.call(has, source, [item]), Boolean),
      keys: () => gen2(function* () {
        const result = yield* ctx.call(keys, source, []);
        const cursor = result instanceof Arr ? hostCursor(result.items.values()) : ctx.iterateDirect(result);
        const items = [];
        while (true) {
          const step = yield* cursor.next;
          if (step.done)
            return items;
          items.push(step.value);
        }
      })
    };
  });
};
var setOperation = (ctx, target, name, source) => gen2(function* () {
  const other = yield* loadSetRecord(ctx, source, name);
  const copy = () => {
    const result = new SetObj(ctx.builtins.Set);
    for (const item of target.set.values())
      result.set.add(item);
    return result;
  };
  if (name === "union") {
    const result = copy();
    for (const item of yield* other.keys())
      result.set.add(item);
    return result;
  }
  if (name === "intersection") {
    const result = new SetObj(ctx.builtins.Set);
    if (target.set.size <= other.size) {
      for (const item of target.set.values()) {
        if (yield* other.has(item))
          result.set.add(item);
      }
      return result;
    }
    for (const item of yield* other.keys()) {
      if (target.set.has(item))
        result.set.add(item);
    }
    return result;
  }
  if (name === "difference") {
    const result = copy();
    if (target.set.size <= other.size) {
      for (const item of result.set.values()) {
        if (yield* other.has(item))
          result.set.delete(item);
      }
      return result;
    }
    for (const item of yield* other.keys())
      result.set.delete(item);
    return result;
  }
  if (name === "symmetricDifference") {
    const result = copy();
    for (const item of yield* other.keys()) {
      if (target.set.has(item))
        result.set.delete(item);
      else
        result.set.add(item);
    }
    return result;
  }
  if (name === "isSubsetOf") {
    if (target.set.size > other.size)
      return false;
    for (const item of target.set.values()) {
      if (!(yield* other.has(item)))
        return false;
    }
    return true;
  }
  if (name === "isSupersetOf") {
    if (target.set.size < other.size)
      return false;
    for (const item of yield* other.keys()) {
      if (!target.set.has(item))
        return false;
    }
    return true;
  }
  if (target.set.size <= other.size) {
    for (const item of target.set.values()) {
      if (yield* other.has(item))
        return false;
    }
    return true;
  }
  for (const item of yield* other.keys()) {
    if (target.set.has(item))
      return false;
  }
  return true;
});
var setGlobal = (ctx) => {
  const builtins = ctx.builtins;
  const proto = builtins.Set;
  const set = constructor(builtins, proto, {
    name: "Set",
    call: requiresNew("Set"),
    construct: (args, newTarget) => constructSet(ctx, args[0], prototypeFrom(newTarget, proto))
  });
  const self = (thisValue, name) => receiver(SetObj, thisValue, `Set.prototype.${name}`);
  const wrap = (items) => new Arr(builtins.Array, items);
  const operation = (name) => [
    name,
    1,
    (thisValue, args) => setOperation(ctx, self(thisValue, name), name, args[0])
  ];
  defineAccessor(proto, "size", (thisValue) => receiver(SetObj, thisValue, "Set.prototype.size").set.size);
  methods(builtins, proto, [
    ["has", 1, (thisValue, args) => self(thisValue, "has").set.has(args[0])],
    [
      "add",
      1,
      (thisValue, args) => {
        const target = self(thisValue, "add");
        target.set.add(args[0]);
        return target;
      }
    ],
    ["delete", 1, (thisValue, args) => self(thisValue, "delete").set.delete(args[0])],
    [
      "clear",
      0,
      (thisValue) => {
        self(thisValue, "clear").set.clear();
        return;
      }
    ],
    ["keys", 0, (thisValue) => hostIterator(builtins, self(thisValue, "keys").set.values())],
    ["values", 0, (thisValue) => hostIterator(builtins, self(thisValue, "values").set.values())],
    [
      "entries",
      0,
      (thisValue) => hostIterator(builtins, self(thisValue, "entries").set.values().map((item) => wrap([item, item])))
    ],
    [
      "forEach",
      1,
      (thisValue, args) => {
        const target = self(thisValue, "forEach");
        const apply = applyCollectionCallback(ctx, args[0], "Set.forEach");
        return gen2(function* () {
          for (const item of target.set.values())
            yield* apply([item, item, target], args[1]);
          return;
        });
      }
    ],
    operation("union"),
    operation("intersection"),
    operation("difference"),
    operation("symmetricDifference"),
    operation("isSubsetOf"),
    operation("isSupersetOf"),
    operation("isDisjointFrom")
  ]);
  define(proto, IteratorSymbol, get2(proto, "values"), hidden);
  return set;
};
var weakKey = (value, label) => {
  if (value instanceof Obj)
    return value;
  throw typeError(`Invalid value used ${label}: ${describeValue(value)} cannot be held weakly.`);
};
var weakMapGlobal = (ctx) => {
  const builtins = ctx.builtins;
  const proto = builtins.WeakMap;
  const weakMap = constructor(builtins, proto, {
    name: "WeakMap",
    call: requiresNew("WeakMap"),
    construct: (args, newTarget) => {
      const target = new WeakMapObj(prototypeFrom(newTarget, proto));
      if (args[0] === undefined || args[0] === null)
        return succeed5(target);
      return gen2(function* () {
        const cursor = yield* ctx.iterate(args[0]);
        if (cursor === undefined) {
          throw typeError(`new WeakMap(...) expects an iterable of [key, value] pairs, received ${describeValue(args[0])}.`);
        }
        while (true) {
          const step = yield* cursor.next;
          if (step.done)
            return target;
          yield* preserveConsumerError(cursor.close, sync2(() => {
            if (!(step.value instanceof Obj)) {
              throw typeError("new WeakMap(...) expects [key, value] pairs as entry objects.");
            }
            target.map.set(weakKey(getOwn(step.value, 0), "as weak map key"), getOwn(step.value, 1));
          }));
        }
      });
    }
  });
  const self = (thisValue, name) => receiver(WeakMapObj, thisValue, `WeakMap.prototype.${name}`).map;
  const key = (value) => weakKey(value, "as weak map key");
  methods(builtins, proto, [
    [
      "get",
      1,
      (thisValue, args) => {
        const target = self(thisValue, "get");
        return args[0] instanceof Obj ? target.get(args[0]) : undefined;
      }
    ],
    ["has", 1, (thisValue, args) => self(thisValue, "has").has(args[0])],
    ["delete", 1, (thisValue, args) => self(thisValue, "delete").delete(args[0])],
    [
      "set",
      2,
      (thisValue, args) => {
        self(thisValue, "set").set(key(args[0]), args[1]);
        return thisValue;
      }
    ],
    [
      "getOrInsert",
      2,
      (thisValue, args) => {
        const target = self(thisValue, "getOrInsert");
        const k = key(args[0]);
        if (!target.has(k))
          target.set(k, args[1]);
        return target.get(k);
      }
    ],
    [
      "getOrInsertComputed",
      2,
      (thisValue, args) => {
        const target = self(thisValue, "getOrInsertComputed");
        const k = key(args[0]);
        const apply = applyCollectionCallback(ctx, args[1], "WeakMap.getOrInsertComputed");
        if (target.has(k))
          return target.get(k);
        return map4(apply([k]), (value) => {
          target.set(k, value);
          return value;
        });
      }
    ]
  ]);
  return weakMap;
};
var weakSetGlobal = (ctx) => {
  const builtins = ctx.builtins;
  const proto = builtins.WeakSet;
  const weakSet = constructor(builtins, proto, {
    name: "WeakSet",
    call: requiresNew("WeakSet"),
    construct: (args, newTarget) => {
      const target = new WeakSetObj(prototypeFrom(newTarget, proto));
      if (args[0] === undefined || args[0] === null)
        return succeed5(target);
      return gen2(function* () {
        const cursor = yield* ctx.iterate(args[0]);
        if (cursor === undefined) {
          throw typeError(`new WeakSet(...) expects a synchronous iterable, received ${describeValue(args[0])}.`);
        }
        while (true) {
          const step = yield* cursor.next;
          if (step.done)
            return target;
          yield* preserveConsumerError(cursor.close, sync2(() => {
            target.set.add(weakKey(step.value, "in weak set"));
          }));
        }
      });
    }
  });
  const self = (thisValue, name) => receiver(WeakSetObj, thisValue, `WeakSet.prototype.${name}`).set;
  methods(builtins, proto, [
    ["has", 1, (thisValue, args) => self(thisValue, "has").has(args[0])],
    ["delete", 1, (thisValue, args) => self(thisValue, "delete").delete(args[0])],
    [
      "add",
      1,
      (thisValue, args) => {
        self(thisValue, "add").add(weakKey(args[0], "in weak set"));
        return thisValue;
      }
    ]
  ]);
  return weakSet;
};

// ../node_modules/@opencode/codemode/dist/stdlib/date.js
var constructDate = (ctx, args, proto) => {
  if (args.length === 0)
    return succeed5(new DateObj(proto, Date.now()));
  if (args.length === 1) {
    const arg = args[0];
    if (arg instanceof DateObj)
      return succeed5(new DateObj(proto, arg.time));
    return map4(toPrimitive(ctx, arg, "default"), (value) => typeof value === "string" ? new DateObj(proto, Date.parse(value)) : new DateObj(proto, new Date(coerceToNumber(value)).getTime()));
  }
  return map4(forEach2(args.slice(0, 7), (arg) => toPrimitiveNumber(ctx, arg), { concurrency: 1 }), (parts) => new DateObj(proto, new Date(...parts).getTime()));
};
var getters = [
  "getFullYear",
  "getMonth",
  "getDate",
  "getDay",
  "getHours",
  "getMinutes",
  "getSeconds",
  "getMilliseconds",
  "getUTCFullYear",
  "getUTCMonth",
  "getUTCDate",
  "getUTCDay",
  "getUTCHours",
  "getUTCMinutes",
  "getUTCSeconds",
  "getUTCMilliseconds",
  "getTimezoneOffset"
];
var setters = [
  ["setTime", 1],
  ["setMilliseconds", 1],
  ["setUTCMilliseconds", 1],
  ["setSeconds", 2],
  ["setUTCSeconds", 2],
  ["setMinutes", 3],
  ["setUTCMinutes", 3],
  ["setHours", 4],
  ["setUTCHours", 4],
  ["setDate", 1],
  ["setUTCDate", 1],
  ["setMonth", 2],
  ["setUTCMonth", 2],
  ["setFullYear", 3],
  ["setUTCFullYear", 3]
];
var dateGlobal = (ctx) => {
  const builtins = ctx.builtins;
  const proto = builtins.Date;
  const date = constructor(builtins, proto, {
    name: "Date",
    length: 7,
    call: () => sync2(() => new Date().toISOString()),
    construct: (args, newTarget) => constructDate(ctx, args, prototypeFrom(newTarget, proto))
  });
  methods(builtins, date, [
    ["now", 0, () => Date.now()],
    ["parse", 1, (_, args) => Date.parse(coerceToString(args[0]))],
    [
      "UTC",
      7,
      (_, args) => map4(forEach2(args.slice(0, 7), (arg) => toPrimitiveNumber(ctx, arg), { concurrency: 1 }), (parts) => Date.UTC(...parts))
    ]
  ]);
  const self = (thisValue, name) => receiver(DateObj, thisValue, `Date.prototype.${name}`);
  const iso = (value) => {
    if (!Number.isFinite(value.time))
      throw rangeError("Invalid time value.");
    return new Date(value.time).toISOString();
  };
  methods(builtins, proto, [
    ["getTime", 0, (thisValue) => self(thisValue, "getTime").time],
    ["valueOf", 0, (thisValue) => self(thisValue, "valueOf").time],
    ["toISOString", 0, (thisValue) => iso(self(thisValue, "toISOString"))],
    [
      "toJSON",
      1,
      (thisValue) => {
        const value = self(thisValue, "toJSON");
        return Number.isFinite(value.time) ? iso(value) : null;
      }
    ],
    ["toString", 0, (thisValue) => coerceToString(self(thisValue, "toString"))],
    ["toDateString", 0, (thisValue) => new Date(self(thisValue, "toDateString").time).toDateString()],
    ["toTimeString", 0, (thisValue) => new Date(self(thisValue, "toTimeString").time).toTimeString()],
    ["toUTCString", 0, (thisValue) => new Date(self(thisValue, "toUTCString").time).toUTCString()],
    ["toGMTString", 0, (thisValue) => new Date(self(thisValue, "toGMTString").time).toUTCString()],
    ...["toLocaleString", "toLocaleDateString", "toLocaleTimeString"].map((name) => [
      name,
      0,
      (thisValue) => new Date(self(thisValue, name).time)[name]("en-US", { timeZone: "UTC" })
    ]),
    ...getters.map((name) => [name, 0, (thisValue) => new Date(self(thisValue, name).time)[name]()]),
    ...setters.map(([name, length]) => [
      name,
      length,
      (thisValue, args) => {
        const target = self(thisValue, name);
        const hosted = new Date(target.time);
        return map4(forEach2(args.slice(0, length), (arg) => toPrimitiveNumber(ctx, arg), {
          concurrency: 1
        }), (values) => {
          if (Number.isNaN(hosted.getTime()) && name !== "setTime" && !name.endsWith("FullYear"))
            return NaN;
          target.time = hosted[name](...values);
          return target.time;
        });
      }
    ])
  ]);
  return date;
};

// ../node_modules/@opencode/codemode/dist/stdlib/json.js
var jsonGlobal = (ctx) => {
  const json = new Obj(ctx.builtins.Object);
  methods(ctx.builtins, json, [
    ["parse", 2, (_, args) => parse2(ctx, args)],
    ["stringify", 3, (_, args) => stringify(ctx, args)]
  ]);
  return json;
};
var parse2 = (ctx, args) => {
  const text = coerceToString(args[0]);
  const parsed = (() => {
    try {
      return fromJson(ctx, JSON.parse(text));
    } catch (error) {
      throw syntaxError(`JSON.parse received invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  })();
  if (typeofValue(args[1]) !== "function")
    return succeed5(parsed);
  const apply = applyCollectionCallback(ctx, args[1], "JSON.parse");
  const visit = (holder, key) => gen2(function* () {
    const value = get2(holder, key);
    if (value instanceof Obj) {
      for (const name of keys(value)) {
        const revived = yield* visit(value, name);
        if (revived === undefined)
          remove(value, name);
        else
          set(value, name, revived);
      }
    }
    return yield* apply([key, value], holder);
  });
  return visit(record2(ctx.builtins.Object, { "": parsed }), "");
};
var stringify = (ctx, args) => {
  const space = args[2];
  const indent = typeof space === "number" || typeof space === "string" ? space : undefined;
  const replacer = args[1];
  const properties = replacer instanceof Arr ? replacer.items.filter((item) => typeof item === "string" || typeof item === "number").map(String) : null;
  const callback = typeofValue(replacer) === "function" ? applyCollectionCallback(ctx, replacer, "JSON.stringify") : undefined;
  return map4(toJson2(ctx, args[0], callback), (value) => {
    const text = JSON.stringify(value, properties, indent);
    if (text !== undefined)
      checkStringLength(text.length);
    return text;
  });
};

// ../node_modules/@opencode/codemode/dist/stdlib/math.js
var mathGlobal = (ctx) => {
  const builtins = ctx.builtins;
  const math = new Obj(builtins.Object);
  const unary = (name, op) => [
    name,
    1,
    (_, args) => withPrimitives(ctx, "number", [args[0]], ([a]) => op(coerceToNumber(a)))
  ];
  const binary = (name, op) => [
    name,
    2,
    (_, args) => withPrimitives(ctx, "number", [args[0], args[1]], ([a, b]) => op(coerceToNumber(a), coerceToNumber(b)))
  ];
  const variadic = (name, op) => [
    name,
    2,
    (_, args) => withPrimitives(ctx, "number", args, (values) => op(...values.map(coerceToNumber)))
  ];
  constants(math, {
    PI: Math.PI,
    E: Math.E,
    LN2: Math.LN2,
    LN10: Math.LN10,
    LOG2E: Math.LOG2E,
    LOG10E: Math.LOG10E,
    SQRT2: Math.SQRT2,
    SQRT1_2: Math.SQRT1_2
  });
  methods(builtins, math, [
    ["random", 0, () => Math.random()],
    variadic("max", Math.max),
    variadic("min", Math.min),
    variadic("hypot", Math.hypot),
    unary("abs", Math.abs),
    unary("acos", Math.acos),
    unary("acosh", Math.acosh),
    unary("asin", Math.asin),
    unary("asinh", Math.asinh),
    unary("atan", Math.atan),
    binary("atan2", Math.atan2),
    unary("atanh", Math.atanh),
    unary("floor", Math.floor),
    unary("ceil", Math.ceil),
    unary("round", Math.round),
    unary("trunc", Math.trunc),
    unary("sign", Math.sign),
    unary("sqrt", Math.sqrt),
    unary("cbrt", Math.cbrt),
    binary("pow", Math.pow),
    unary("cos", Math.cos),
    unary("cosh", Math.cosh),
    unary("sin", Math.sin),
    unary("sinh", Math.sinh),
    unary("tan", Math.tan),
    unary("tanh", Math.tanh),
    unary("log", Math.log),
    unary("log2", Math.log2),
    unary("log10", Math.log10),
    unary("log1p", Math.log1p),
    unary("exp", Math.exp),
    unary("expm1", Math.expm1),
    unary("f16round", Math.f16round),
    unary("fround", Math.fround),
    unary("clz32", Math.clz32),
    binary("imul", Math.imul),
    [
      "sumPrecise",
      1,
      (_, args) => gen2(function* () {
        const cursor = yield* ctx.iterate(args[0]);
        if (cursor === undefined) {
          throw typeError("Math.sumPrecise expects a synchronous iterable.");
        }
        const numbers = [];
        while (true) {
          const step = yield* cursor.next;
          if (step.done)
            return Math.sumPrecise(numbers);
          yield* preserveConsumerError(cursor.close, sync2(() => {
            if (typeof step.value !== "number") {
              throw typeError("Math.sumPrecise expects an iterable of numbers.");
            }
            numbers.push(step.value);
          }));
        }
      })
    ]
  ]);
  return math;
};

// ../node_modules/@opencode/codemode/dist/stdlib/value.js
var compoundOperators = new Set(["+=", "-=", "*=", "/=", "%=", "**=", "&=", "|=", "^=", "<<=", ">>=", ">>>="]);
var coerce = (ctx, name, args) => {
  if (args.length === 0) {
    if (name === "Number")
      return 0;
    if (name === "String")
      return "";
  }
  const raw = args[0];
  if (name === "Boolean")
    return Boolean(raw);
  if (name === "parseInt") {
    return withPrimitives(ctx, ["string", "number"], [raw, args[1]], ([text, radix]) => parseInt(coerceToString(text), coerceToNumber(radix)));
  }
  return withPrimitives(ctx, name === "String" || name === "parseFloat" ? "string" : "number", [raw], ([value]) => {
    if (name === "Number")
      return coerceToNumber(value);
    if (name === "isFinite")
      return Number.isFinite(coerceToNumber(value));
    if (name === "isNaN")
      return Number.isNaN(coerceToNumber(value));
    if (name === "parseFloat")
      return parseFloat(coerceToString(value));
    return coerceToString(value);
  });
};
var coercion = (ctx, name, length = 1) => fn2(ctx.builtins, name, length, (_, args) => coerce(ctx, name, args));

// ../node_modules/@opencode/codemode/dist/stdlib/number.js
var numberGlobal = (ctx) => {
  const builtins = ctx.builtins;
  const number = constructor(builtins, builtins.Number, {
    name: "Number",
    length: 1,
    call: coercion(ctx, "Number").call
  });
  constants(number, {
    MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
    MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
    MAX_VALUE: Number.MAX_VALUE,
    MIN_VALUE: Number.MIN_VALUE,
    EPSILON: Number.EPSILON,
    NaN: Number.NaN,
    POSITIVE_INFINITY: Number.POSITIVE_INFINITY,
    NEGATIVE_INFINITY: Number.NEGATIVE_INFINITY
  });
  methods(builtins, number, [
    ["isInteger", 1, (_, args) => Number.isInteger(args[0])],
    ["isFinite", 1, (_, args) => Number.isFinite(args[0])],
    ["isNaN", 1, (_, args) => Number.isNaN(args[0])],
    ["isSafeInteger", 1, (_, args) => Number.isSafeInteger(args[0])],
    ["parseInt", 2, (_, args) => coerce(ctx, "parseInt", args)],
    ["parseFloat", 1, (_, args) => coerce(ctx, "parseFloat", args)]
  ]);
  const self = (thisValue, name) => {
    if (typeof thisValue === "number")
      return thisValue;
    throw typeError(`Number.prototype.${name} requires that 'this' be a Number.`);
  };
  const formatting = (name, op) => [
    name,
    1,
    (thisValue, args) => {
      const value = self(thisValue, name);
      return withPrimitives(ctx, "number", [args[0]], ([digits]) => op(value, digits === undefined ? undefined : coerceToNumber(digits)));
    }
  ];
  methods(builtins, builtins.Number, [
    formatting("toFixed", (value, digits) => value.toFixed(digits)),
    ["toLocaleString", 0, (thisValue) => self(thisValue, "toLocaleString").toLocaleString("en-US")],
    formatting("toExponential", (value, digits) => value.toExponential(digits)),
    formatting("toPrecision", (value, digits) => digits === undefined ? value.toString() : value.toPrecision(digits)),
    formatting("toString", (value, radix) => value.toString(radix)),
    ["valueOf", 0, (thisValue) => self(thisValue, "valueOf")]
  ]);
  return number;
};
var booleanGlobal = (ctx) => {
  const builtins = ctx.builtins;
  const boolean = constructor(builtins, builtins.Boolean, {
    name: "Boolean",
    length: 1,
    call: coercion(ctx, "Boolean").call
  });
  const self = (thisValue, name) => {
    if (typeof thisValue === "boolean")
      return thisValue;
    throw typeError(`Boolean.prototype.${name} requires that 'this' be a Boolean.`);
  };
  methods(builtins, builtins.Boolean, [
    ["toString", 0, (thisValue) => String(self(thisValue, "toString"))],
    ["valueOf", 0, (thisValue) => self(thisValue, "valueOf")]
  ]);
  return boolean;
};

// ../node_modules/@opencode/codemode/dist/stdlib/object.js
var enumerableSource = (ctx, label, value, node) => {
  if (value === null || value === undefined) {
    throw typeError(`${label} cannot convert ${describeValue(value)} to an object.`, node);
  }
  if (value instanceof PromiseObj) {
    throw invalidData(`${label} received an un-awaited Promise; await it before inspecting the result.`, node);
  }
  if (value instanceof ToolReference) {
    throw invalidData(`${label} cannot read tool references: they are not plain data. Use Object.keys(tools) for names, or search({ query }) for signatures.`, node);
  }
  if (typeof value === "string")
    return new Arr(ctx.builtins.Array, [...value]);
  if (value instanceof Obj)
    return value;
  return new Obj(ctx.builtins.Object);
};
var objectAssign = (ctx, args) => {
  const target = args[0];
  if (!(target instanceof Obj)) {
    throw typeError(`Object.assign expects a data object or array target, received ${describeValue(target)}.`);
  }
  const seen = new Set;
  for (const source of args.slice(1)) {
    if (source === null || source === undefined)
      continue;
    const from = enumerableSource(ctx, "Object.assign(...)", source);
    for (const key of enumerableKeys(from)) {
      rejectCircularInsertion(target, getOwn(from, key), "Object.assign result", seen);
      if (!set(target, key, getOwn(from, key))) {
        throw typeError(`Cannot assign to read only property '${String(key)}'.`);
      }
    }
  }
  return target;
};
var objectFromEntries = (ctx, source) => {
  const out = new Obj(ctx.builtins.Object);
  return gen2(function* () {
    const cursor = yield* ctx.iterate(source);
    if (cursor === undefined) {
      throw typeError("Object.fromEntries expects a synchronous iterable of entries.");
    }
    while (true) {
      const step = yield* cursor.next;
      if (step.done)
        return out;
      yield* preserveConsumerError(cursor.close, sync2(() => {
        if (!(step.value instanceof Obj) || containsOpaqueReference(step.value)) {
          throw typeError("Object.fromEntries expects [key, value] entry objects.");
        }
        define(out, coerceToString(getOwn(step.value, 0)), getOwn(step.value, 1));
      }));
    }
  });
};
var classTag = (value) => {
  if (value === null)
    return "Null";
  if (value === undefined)
    return "Undefined";
  if (value instanceof Obj)
    return value.tag;
  if (typeof value === "string")
    return "String";
  if (typeof value === "number")
    return "Number";
  if (typeof value === "boolean")
    return "Boolean";
  return "Object";
};
var propertyKey = (value) => value === AsyncIteratorSymbol || value === IteratorSymbol ? value : coerceToString(value);
var restrict = (level, value) => {
  if (!(value instanceof Obj))
    return value;
  value.extensible = false;
  if (level === "preventExtensions")
    return value;
  if (value instanceof Bytes && value.bytes.length > 0) {
    throw typeError(`Cannot ${level} array buffer views with elements.`);
  }
  for (const slot of value.props.values()) {
    slot.configurable = false;
    if (level === "freeze" && "value" in slot)
      slot.writable = false;
  }
  if (value instanceof Arr)
    value.elements = { writable: level === "seal", enumerable: true, configurable: false };
  return value;
};
var integrity = (value, frozen) => {
  if (!(value instanceof Obj))
    return true;
  if (value.extensible)
    return false;
  return ownKeys(value).every((key) => {
    const slot = own(value, key);
    return slot !== undefined && !slot.configurable && !(frozen && ("value" in slot) && slot.writable);
  });
};
var objectGlobal = (ctx) => {
  const builtins = ctx.builtins;
  const construct = (args) => {
    const first = args[0];
    if (first === null || first === undefined)
      return new Obj(builtins.Object);
    if (first instanceof Obj)
      return first;
    throw typeError(`Object(${typeof first}) wrapper objects are not supported; use the primitive value directly.`);
  };
  const object = constructor(builtins, builtins.Object, {
    name: "Object",
    length: 1,
    call: (_, args) => sync2(() => construct(args)),
    construct: (args) => sync2(() => construct(args))
  });
  methods(builtins, object, [
    [
      "keys",
      1,
      (_, args) => new Arr(builtins.Array, args[0] instanceof ToolReference ? [...ctx.tools.keys(args[0].path)] : keys(enumerableSource(ctx, "Object.keys(...)", args[0])))
    ],
    [
      "values",
      1,
      (_, args) => new Arr(builtins.Array, entries(enumerableSource(ctx, "Object.values(...)", args[0])).map((entry) => entry[1]))
    ],
    [
      "entries",
      1,
      (_, args) => new Arr(builtins.Array, entries(enumerableSource(ctx, "Object.entries(...)", args[0])).map((entry) => new Arr(builtins.Array, entry)))
    ],
    ["hasOwn", 2, (_, args) => hasOwn2(enumerableSource(ctx, "Object.hasOwn(...)", args[0]), propertyKey(args[1]))],
    ["is", 2, (_, args) => Object.is(args[0], args[1])],
    ["assign", 2, (_, args) => objectAssign(ctx, args)],
    ["fromEntries", 1, (_, args) => objectFromEntries(ctx, args[0])],
    ["freeze", 1, (_, args) => restrict("freeze", args[0])],
    ["seal", 1, (_, args) => restrict("seal", args[0])],
    ["preventExtensions", 1, (_, args) => restrict("preventExtensions", args[0])],
    ["isFrozen", 1, (_, args) => integrity(args[0], true)],
    ["isSealed", 1, (_, args) => integrity(args[0], false)],
    ["isExtensible", 1, (_, args) => args[0] instanceof Obj && args[0].extensible],
    [
      "getPrototypeOf",
      1,
      (_, args) => {
        if (args[0] instanceof Obj)
          return args[0].proto;
        const proto = primitivePrototype(builtins, args[0]);
        if (proto === undefined) {
          throw typeError(`Object.getPrototypeOf cannot convert ${describeValue(args[0])} to an object.`);
        }
        return proto;
      }
    ],
    [
      "create",
      2,
      (_, args) => {
        if (args[0] !== null && !(args[0] instanceof Obj)) {
          throw typeError("Object prototype may only be an Object or null.");
        }
        if (args[1] !== undefined) {
          throw typeError("Object.create property descriptors are not supported; assign the fields after creating the object.");
        }
        return new Obj(args[0]);
      }
    ]
  ]);
  define(object, "groupBy", groupBy(ctx, "Object"), hidden);
  methods(builtins, builtins.Object, [
    [
      "hasOwnProperty",
      1,
      (thisValue, args) => hasOwn2(receiver(Obj, thisValue, "Object.prototype.hasOwnProperty"), propertyKey(args[0]))
    ],
    [
      "isPrototypeOf",
      1,
      (thisValue, args) => hasPrototype(args[0], receiver(Obj, thisValue, "Object.prototype.isPrototypeOf"))
    ],
    [
      "propertyIsEnumerable",
      1,
      (thisValue, args) => own(receiver(Obj, thisValue, "Object.prototype.propertyIsEnumerable"), propertyKey(args[0]))?.enumerable === true
    ],
    ["toString", 0, (thisValue) => `[object ${classTag(thisValue)}]`],
    ["toLocaleString", 0, (thisValue) => invoke(ctx, thisValue, "toString", "Object.prototype.toLocaleString")],
    [
      "valueOf",
      0,
      (thisValue) => {
        if (thisValue === null || thisValue === undefined) {
          throw typeError("Object.prototype.valueOf called on null or undefined.");
        }
        return thisValue;
      }
    ]
  ]);
  return object;
};

// ../node_modules/@opencode/codemode/dist/stdlib/regexp.js
var flagProperties = [
  "hasIndices",
  "global",
  "ignoreCase",
  "multiline",
  "sticky",
  "unicode",
  "unicodeSets",
  "dotAll"
];
var regexFailureReason = (error) => (error instanceof Error ? error.message : String(error)).replace(/^Invalid regular expression:\s*/i, "");
var escapeRegexHint = 'To match special characters like ( ) [ ] { } + * ? . literally, escape them with a backslash (e.g. "\\\\(") or test for them with String.includes instead.';
var toHostRegex = (arg, method, extraFlags = "") => {
  if (arg instanceof RegExpObj)
    return arg.regex;
  const source = arg === undefined ? "" : coerceToString(arg);
  try {
    return new RegExp(source, extraFlags);
  } catch (error) {
    throw syntaxError(`String.${method} received the string ${JSON.stringify(source)}, which is not a valid regular expression pattern (${regexFailureReason(error)}). ${escapeRegexHint}`);
  }
};
var matchToValue = (builtins, match) => {
  const result = new Arr(builtins.Array, Array.from(match, (group) => group));
  if (match.index !== undefined)
    define(result, "index", match.index);
  if (match.input !== undefined)
    define(result, "input", match.input);
  if (match.groups)
    define(result, "groups", record2(builtins.Object, match.groups));
  if (match.indices)
    define(result, "indices", indicesToValue(builtins, match.indices));
  return result;
};
var constructRegExp = (builtins, args, proto = builtins.RegExp) => {
  const first = args[0];
  const pattern = first instanceof RegExpObj ? first.regex.source : first === undefined ? "" : coerceToString(first);
  const flagsArg = args[1];
  if (flagsArg !== undefined && typeof flagsArg !== "string") {
    throw syntaxError(`RegExp flags must be a string of flag characters (e.g. "g", "gi"), not ${flagsArg === null ? "null" : typeof flagsArg}.`);
  }
  const flags = flagsArg ?? (first instanceof RegExpObj ? first.regex.flags : "");
  try {
    return new RegExpObj(proto, pattern, flags);
  } catch (error) {
    const reason = regexFailureReason(error);
    throw syntaxError(/flag/i.test(reason) ? `new RegExp(...) received invalid flags ${JSON.stringify(flags)} (${reason}). Valid flags are d, g, i, m, s, u, v, and y.` : `new RegExp(...) received ${JSON.stringify(pattern)}, which is not a valid regular expression pattern (${reason}). ${escapeRegexHint}`);
  }
};
var regexpGlobal = (ctx) => {
  const builtins = ctx.builtins;
  const proto = builtins.RegExp;
  const regexp = constructor(builtins, proto, {
    name: "RegExp",
    length: 2,
    call: (_, args) => sync2(() => constructRegExp(builtins, args)),
    construct: (args, newTarget) => sync2(() => constructRegExp(builtins, args, prototypeFrom(newTarget, proto)))
  });
  methods(builtins, regexp, [
    [
      "escape",
      1,
      (_, args) => {
        if (typeof args[0] !== "string")
          throw typeError("RegExp.escape expects a string.");
        return RegExp.escape(args[0]);
      }
    ]
  ]);
  const self = (thisValue, name) => receiver(RegExpObj, thisValue, `RegExp.prototype.${name}`);
  defineAccessor(proto, "source", (thisValue) => self(thisValue, "source").regex.source);
  defineAccessor(proto, "flags", (thisValue) => self(thisValue, "flags").regex.flags);
  defineAccessor(proto, "lastIndex", (thisValue) => self(thisValue, "lastIndex").regex.lastIndex, (thisValue, value) => {
    self(thisValue, "lastIndex").regex.lastIndex = coerceToNumber(value);
  });
  for (const name of flagProperties)
    defineAccessor(proto, name, (thisValue) => self(thisValue, name).regex[name]);
  const run = (name) => [
    name,
    1,
    (thisValue, args) => {
      const value = self(thisValue, name);
      const matched = value.regex.exec(coerceToString(args[0]));
      if (name === "test")
        return matched !== null;
      return matched === null ? null : matchToValue(builtins, matched);
    }
  ];
  methods(builtins, proto, [
    run("exec"),
    run("test"),
    ["toString", 0, (thisValue) => coerceToString(self(thisValue, "toString"))]
  ]);
  return regexp;
};
var indicesToValue = (builtins, indices) => {
  const range = (pair) => pair === undefined ? undefined : new Arr(builtins.Array, [...pair]);
  const result = new Arr(builtins.Array, Array.from(indices, range));
  const groups = indices.groups;
  define(result, "groups", groups === undefined ? undefined : record2(builtins.Object, Object.fromEntries(Object.entries(groups).map(([key, pair]) => [key, range(pair)]))));
  return result;
};

// ../node_modules/@opencode/codemode/dist/stdlib/string.js
var requireDataArgument = (name, index, arg) => {
  if (containsOpaqueReference(arg)) {
    throw invalidData(`String.${name} expects argument ${index + 1} to be a data value.`);
  }
  return arg;
};
var replaceAllNeedsGlobal = (pattern) => {
  if (!pattern.global) {
    throw typeError(`String.replaceAll requires a regular expression with the global (g) flag: write /${pattern.source}/${pattern.flags}g, or use String.replace to replace only the first match.`);
  }
};
var replaceWithCallback = (ctx, value, name, args) => {
  const builtins = ctx.builtins;
  const apply = applyCollectionCallback(ctx, args[1], `String.${name}`);
  const matches = [];
  const collect = (...callbackArgs) => {
    const match = callbackArgs[0];
    const hasGroups = typeof callbackArgs.at(-1) === "object";
    const offset = callbackArgs[callbackArgs.length - (hasGroups ? 3 : 2)];
    if (typeof match !== "string" || typeof offset !== "number") {
      throw typeError(`String.${name} produced an invalid replacement match.`);
    }
    const args = callbackArgs.map((arg) => typeof arg === "object" ? record2(builtins.Object, arg) : arg);
    matches.push({ match, offset, args });
    return match;
  };
  const pattern = args[0];
  if (pattern instanceof RegExpObj) {
    if (name === "replaceAll")
      replaceAllNeedsGlobal(pattern.regex);
    if (name === "replace")
      value.replace(pattern.regex, collect);
    else
      value.replaceAll(pattern.regex, collect);
  } else {
    const search = coerceToString(requireDataArgument(name, 0, pattern));
    if (name === "replace")
      value.replace(search, collect);
    else
      value.replaceAll(search, collect);
  }
  return gen2(function* () {
    const output = [];
    let end = 0;
    for (const match of matches) {
      const replacement = yield* apply(match.args);
      output.push(value.slice(end, match.offset), coerceToString(replacement));
      end = match.offset + match.match.length;
    }
    output.push(value.slice(end));
    return output.join("");
  });
};
var stringGlobal = (ctx) => {
  const builtins = ctx.builtins;
  const string = constructor(builtins, builtins.String, {
    name: "String",
    length: 1,
    call: coercion(ctx, "String").call
  });
  const codeUnits = (name, op) => [
    name,
    1,
    (_, args) => op(...args.map(coerceToNumber))
  ];
  methods(builtins, string, [
    codeUnits("fromCharCode", String.fromCharCode),
    codeUnits("fromCodePoint", String.fromCodePoint),
    [
      "raw",
      1,
      (_, args) => {
        const template = args[0];
        const raw = template instanceof Obj ? get2(template, "raw") : undefined;
        if (!(raw instanceof Obj))
          throw typeError("String.raw expects a template object with a raw array.");
        const count = Math.max(0, coerceToInteger(get2(raw, "length")));
        checkArrayLength(count);
        const parts = Array.from({ length: count }, (_, index) => index + 1 < count && index + 1 < args.length ? [get2(raw, index), args[index + 1]] : [get2(raw, index)]).flat();
        return map4(forEach2(parts, (part) => toPrimitiveString(ctx, part)), (strings) => {
          const output = strings.join("");
          checkStringLength(output.length);
          return output;
        });
      }
    ]
  ]);
  const self = (thisValue, name) => {
    if (typeof thisValue === "string")
      return thisValue;
    if (thisValue === null || thisValue === undefined) {
      throw typeError(`String.prototype.${name} called on null or undefined.`);
    }
    return coerceToString(thisValue);
  };
  const str = (name, args, index) => coerceToString(requireDataArgument(name, index, args[index]));
  const num = (name, args, index) => coerceToNumber(requireDataArgument(name, index, args[index]));
  const optNum = (name, args, index) => args[index] === undefined ? undefined : num(name, args, index);
  const optStr = (name, args, index) => args[index] === undefined ? undefined : str(name, args, index);
  const simple = (name, length, op, hints = []) => [
    name,
    length,
    (thisValue, args) => {
      if (thisValue === null || thisValue === undefined) {
        throw typeError(`String.prototype.${name} called on null or undefined.`);
      }
      return withPrimitives(ctx, ["string", ...hints], [thisValue, ...args.slice(0, hints.length)], ([value, ...primitives]) => op(coerceToString(value), [...primitives, ...args.slice(hints.length)]));
    }
  ];
  const searching = (name, op) => simple(name, 1, (value, args) => {
    if (args[0] instanceof RegExpObj) {
      throw typeError(`String.${name} cannot take a regular expression; use regex.test(string) or String.search instead.`);
    }
    return withPrimitives(ctx, ["string", "number"], args.slice(0, 2), (primitives) => op(value, str(name, primitives, 0), optNum(name, primitives, 1)));
  });
  const withPattern = (args, op) => args[0] instanceof RegExpObj ? op(args[0]) : withPrimitives(ctx, "string", [args[0]], ([text]) => op(text));
  const replace = (name) => simple(name, 2, (value, args) => {
    const pattern = args[0];
    const replacer = args[1];
    return withPrimitives(ctx, "string", [pattern instanceof RegExpObj ? undefined : pattern, isSupportedCallback(replacer) ? undefined : replacer], ([search, replacement]) => {
      if (isSupportedCallback(replacer)) {
        return replaceWithCallback(ctx, value, name, [pattern instanceof RegExpObj ? pattern : search, replacer]);
      }
      if (typeofValue(replacer) === "function") {
        throw typeError(`String.${name} cannot use this callable as a replacer; wrap it in an arrow function, e.g. (match) => tools.ns.tool(match).`);
      }
      const primitives = [search, replacement];
      if (pattern instanceof RegExpObj) {
        const regex = pattern.regex;
        const text = str(name, primitives, 1);
        if (name === "replaceAll")
          replaceAllNeedsGlobal(regex);
        return name === "replace" ? value.replace(regex, text) : value.replaceAll(regex, text);
      }
      if (name === "replace")
        return value.replace(str(name, primitives, 0), str(name, primitives, 1));
      return value.replaceAll(str(name, primitives, 0), str(name, primitives, 1));
    });
  });
  methods(builtins, builtins.String, [
    simple("toString", 0, (value) => value),
    simple("valueOf", 0, (value) => value),
    simple("toLowerCase", 0, (value) => value.toLowerCase()),
    simple("toUpperCase", 0, (value) => value.toUpperCase()),
    simple("toLocaleLowerCase", 0, (value) => value.toLowerCase()),
    simple("toLocaleUpperCase", 0, (value) => value.toUpperCase()),
    simple("trim", 0, (value) => value.trim()),
    simple("trimStart", 0, (value) => value.trimStart()),
    simple("trimLeft", 0, (value) => value.trimStart()),
    simple("trimEnd", 0, (value) => value.trimEnd()),
    simple("trimRight", 0, (value) => value.trimEnd()),
    simple("localeCompare", 1, (value, args) => value.localeCompare(str("localeCompare", args, 0)), ["string"]),
    simple("normalize", 0, (value, args) => {
      const form = optStr("normalize", args, 0);
      try {
        return value.normalize(form);
      } catch {
        throw rangeError(`String.normalize expects the form "NFC", "NFD", "NFKC", or "NFKD" (got ${JSON.stringify(form)}).`);
      }
    }, ["string"]),
    simple("split", 2, (value, args) => {
      const separator = args[0];
      return withPrimitives(ctx, ["number", "string"], [args[1], separator instanceof RegExpObj ? undefined : separator], ([limit, pattern]) => {
        const wrap = (parts) => new Arr(builtins.Array, parts);
        const requestedLimit = args[1] === undefined ? undefined : num("split", [pattern, limit], 1);
        if (separator === undefined) {
          return wrap(requestedLimit !== undefined && requestedLimit >>> 0 === 0 ? [] : [value]);
        }
        const parts = separator instanceof RegExpObj ? value.split(separator.regex, requestedLimit) : value.split(str("split", [pattern], 0), requestedLimit === undefined ? undefined : requestedLimit >>> 0);
        checkArrayLength(parts.length);
        return wrap(parts);
      });
    }),
    simple("slice", 2, (value, args) => value.slice(optNum("slice", args, 0), optNum("slice", args, 1)), [
      "number",
      "number"
    ]),
    searching("includes", (value, search, position) => value.includes(search, position)),
    searching("startsWith", (value, search, position) => value.startsWith(search, position)),
    searching("endsWith", (value, search, position) => value.endsWith(search, position)),
    simple("indexOf", 1, (value, args) => value.indexOf(str("indexOf", args, 0), optNum("indexOf", args, 1)), [
      "string",
      "number"
    ]),
    simple("lastIndexOf", 1, (value, args) => value.lastIndexOf(str("lastIndexOf", args, 0), optNum("lastIndexOf", args, 1)), ["string", "number"]),
    replace("replace"),
    replace("replaceAll"),
    simple("match", 1, (value, args) => withPattern(args, (arg) => {
      const regex = toHostRegex(arg, "match");
      const matched = value.match(regex);
      if (matched === null)
        return null;
      if (regex.global)
        return new Arr(builtins.Array, [...matched]);
      return matchToValue(builtins, matched);
    })),
    simple("matchAll", 1, (value, args) => withPattern(args, (arg) => {
      const regex = toHostRegex(arg, "matchAll", "g");
      if (!regex.global) {
        throw typeError(`String.matchAll requires a regular expression with the global (g) flag: write /${regex.source}/${regex.flags}g, or use String.match for a single match.`);
      }
      const matches = [];
      for (const match of value.matchAll(regex)) {
        checkArrayLength(matches.length + 1);
        matches.push(matchToValue(builtins, match));
      }
      return new Arr(builtins.Array, matches);
    })),
    simple("search", 1, (value, args) => withPattern(args, (arg) => value.search(toHostRegex(arg, "search")))),
    simple("repeat", 1, (value, args) => {
      const count = num("repeat", args, 0);
      if (!Number.isFinite(count) || count < 0) {
        throw rangeError("String.repeat expects a finite non-negative count.");
      }
      checkStringLength(value.length * count);
      return value.repeat(count);
    }, ["number"]),
    simple("padStart", 1, (value, args) => {
      const length = num("padStart", args, 0);
      checkStringLength(length);
      return value.padStart(length, optStr("padStart", args, 1));
    }, ["number", "string"]),
    simple("padEnd", 1, (value, args) => {
      const length = num("padEnd", args, 0);
      checkStringLength(length);
      return value.padEnd(length, optStr("padEnd", args, 1));
    }, ["number", "string"]),
    simple("charAt", 1, (value, args) => value.charAt(optNum("charAt", args, 0) ?? 0), ["number"]),
    simple("at", 1, (value, args) => value.at(optNum("at", args, 0) ?? 0), ["number"]),
    simple("substring", 2, (value, args) => value.substring(optNum("substring", args, 0) ?? 0, optNum("substring", args, 1)), ["number", "number"]),
    simple("substr", 2, (value, args) => value.substr(optNum("substr", args, 0) ?? 0, optNum("substr", args, 1)), [
      "number",
      "number"
    ]),
    simple("isWellFormed", 0, (value) => value.isWellFormed()),
    simple("toWellFormed", 0, (value) => value.toWellFormed()),
    simple("charCodeAt", 1, (value, args) => value.charCodeAt(optNum("charCodeAt", args, 0) ?? 0), ["number"]),
    simple("codePointAt", 1, (value, args) => value.codePointAt(optNum("codePointAt", args, 0) ?? 0), ["number"]),
    simple("concat", 1, (value, args) => withPrimitives(ctx, "string", args, (parts) => {
      const joined = value.concat(...parts.map((_, index) => str("concat", parts, index)));
      checkStringLength(joined.length);
      return joined;
    }))
  ]);
  define(builtins.String, IteratorSymbol, fn2(builtins, "[Symbol.iterator]", 0, (thisValue) => hostIterator(builtins, self(thisValue, "[Symbol.iterator]")[Symbol.iterator]())), hidden);
  return string;
};

// ../node_modules/@opencode/codemode/dist/stdlib/url.js
var urlProperties = [
  "href",
  "origin",
  "protocol",
  "username",
  "password",
  "host",
  "hostname",
  "port",
  "pathname",
  "search",
  "hash"
];
var uriFunctions = {
  encodeURI,
  encodeURIComponent,
  decodeURI,
  decodeURIComponent
};
var uriGlobal = (ctx, name) => fn2(ctx.builtins, name, 1, (_, args) => {
  const value = coerceToString(args[0]);
  try {
    return uriFunctions[name](value);
  } catch (error) {
    throw uriError(`${name} received malformed URI data: ${error instanceof Error ? error.message : String(error)}`);
  }
});
var urlArgument = (value) => value instanceof URLObj ? value.url.href : coerceToString(value);
var urlGlobal = (ctx) => {
  const builtins = ctx.builtins;
  const proto = builtins.URL;
  const construct = (args, into) => {
    if (args.length === 0) {
      throw typeError("new URL(...) requires a URL string and an optional base URL.");
    }
    const input = urlArgument(args[0]);
    const base = args[1] === undefined ? undefined : urlArgument(args[1]);
    try {
      return new URLObj(into, builtins.URLSearchParams, new URL(input, base));
    } catch {
      throw typeError(`new URL(...) received an invalid URL${base === undefined ? "" : " or base URL"}.`);
    }
  };
  const url = constructor(builtins, proto, {
    name: "URL",
    length: 1,
    call: requiresNew("URL"),
    construct: (args, newTarget) => sync2(() => construct(args, prototypeFrom(newTarget, proto)))
  });
  const parse = (name) => [
    name,
    1,
    (_, args) => {
      if (args.length === 0)
        throw typeError(`URL.${name} requires a URL argument.`);
      const input = urlArgument(args[0]);
      const base = args[1] === undefined ? undefined : urlArgument(args[1]);
      try {
        const parsed = new URL(input, base);
        return name === "canParse" ? true : new URLObj(proto, builtins.URLSearchParams, parsed);
      } catch {
        return name === "canParse" ? false : null;
      }
    }
  ];
  methods(builtins, url, [parse("canParse"), parse("parse")]);
  const self = (thisValue, name) => receiver(URLObj, thisValue, `URL.prototype.${name}`);
  for (const name of urlProperties) {
    defineAccessor(proto, name, (thisValue) => self(thisValue, name).url[name], name === "origin" ? undefined : (thisValue, value) => {
      const target = self(thisValue, name);
      try {
        target.url[name] = coerceToString(value);
      } catch (error) {
        if (error instanceof PendingThrow)
          throw error;
        throw typeError(`URL.${name} received an invalid value.`);
      }
    });
  }
  defineAccessor(proto, "searchParams", (thisValue) => self(thisValue, "searchParams").searchParams);
  methods(builtins, proto, [
    ["toString", 0, (thisValue) => self(thisValue, "toString").url.href],
    ["toJSON", 0, (thisValue) => self(thisValue, "toJSON").url.href]
  ]);
  return url;
};
var readPair = (ctx, value, label) => gen2(function* () {
  const cursor = yield* ctx.iterate(value);
  if (cursor === undefined)
    throw typeError(`${label} expects iterable [name, value] pairs.`);
  const items = [];
  while (true) {
    const step = yield* cursor.next;
    if (step.done)
      return items;
    items.push(yield* preserveConsumerError(cursor.close, sync2(() => coerceToString(step.value))));
  }
});
var readPairs = (ctx, init, label) => gen2(function* () {
  const cursor = yield* ctx.iterate(init);
  if (cursor === undefined)
    return;
  const pairs = [];
  while (true) {
    const step = yield* cursor.next;
    if (step.done) {
      if (pairs.some((entry) => entry.length !== 2))
        throw typeError(`${label} expects iterable [name, value] pairs.`);
      return pairs;
    }
    pairs.push(yield* preserveConsumerError(cursor.close, readPair(ctx, step.value, label)));
  }
});
var constructURLSearchParams = (ctx, init, proto) => {
  const wrap = (params) => new URLSearchParamsObj(proto, params);
  if (init === undefined)
    return succeed5(wrap(new URLSearchParams));
  if (init instanceof URLSearchParamsObj)
    return succeed5(wrap(new URLSearchParams(init.params)));
  if (typeof init === "string")
    return succeed5(wrap(new URLSearchParams(init)));
  if (init === null || typeof init === "number" || typeof init === "boolean") {
    return succeed5(wrap(new URLSearchParams(coerceToString(init))));
  }
  return gen2(function* () {
    const pairs = yield* readPairs(ctx, init, "new URLSearchParams(...)");
    if (pairs !== undefined)
      return wrap(new URLSearchParams(pairs));
    if (isRuntimeReference(init)) {
      throw typeError("new URLSearchParams(...) expects a query string, data object, or synchronous iterable pairs.");
    }
    if (!(init instanceof Obj)) {
      throw typeError("new URLSearchParams(...) expects a query string, data object, iterable pairs, or URLSearchParams.");
    }
    return wrap(new URLSearchParams(Object.fromEntries(entries(init).map(([key, value]) => [key, coerceToString(value)]))));
  });
};
var urlSearchParamsGlobal = (ctx) => {
  const builtins = ctx.builtins;
  const proto = builtins.URLSearchParams;
  const searchParams = constructor(builtins, proto, {
    name: "URLSearchParams",
    call: requiresNew("URLSearchParams"),
    construct: (args, newTarget) => constructURLSearchParams(ctx, args[0], prototypeFrom(newTarget, proto))
  });
  const self = (thisValue, name) => receiver(URLSearchParamsObj, thisValue, `URLSearchParams.prototype.${name}`);
  const wrap = (items) => new Arr(builtins.Array, items);
  const arg = (args, index) => coerceToString(args[index]);
  const requireArgs = (name, args, count) => {
    if (args.length < count) {
      throw typeError(`URLSearchParams.${name} requires ${count} argument${count === 1 ? "" : "s"}.`);
    }
  };
  defineAccessor(proto, "size", (thisValue) => self(thisValue, "size").params.size);
  methods(builtins, proto, [
    [
      "append",
      2,
      (thisValue, args) => {
        requireArgs("append", args, 2);
        self(thisValue, "append").params.append(arg(args, 0), arg(args, 1));
        return;
      }
    ],
    [
      "delete",
      1,
      (thisValue, args) => {
        requireArgs("delete", args, 1);
        const params = self(thisValue, "delete").params;
        if (args[1] !== undefined)
          params.delete(arg(args, 0), arg(args, 1));
        else
          params.delete(arg(args, 0));
        return;
      }
    ],
    [
      "get",
      1,
      (thisValue, args) => {
        requireArgs("get", args, 1);
        return self(thisValue, "get").params.get(arg(args, 0));
      }
    ],
    [
      "getAll",
      1,
      (thisValue, args) => {
        requireArgs("getAll", args, 1);
        return wrap(self(thisValue, "getAll").params.getAll(arg(args, 0)));
      }
    ],
    [
      "has",
      1,
      (thisValue, args) => {
        requireArgs("has", args, 1);
        const params = self(thisValue, "has").params;
        return args[1] !== undefined ? params.has(arg(args, 0), arg(args, 1)) : params.has(arg(args, 0));
      }
    ],
    [
      "set",
      2,
      (thisValue, args) => {
        requireArgs("set", args, 2);
        self(thisValue, "set").params.set(arg(args, 0), arg(args, 1));
        return;
      }
    ],
    [
      "sort",
      0,
      (thisValue) => {
        self(thisValue, "sort").params.sort();
        return;
      }
    ],
    ["keys", 0, (thisValue) => hostIterator(builtins, self(thisValue, "keys").params.keys())],
    ["values", 0, (thisValue) => hostIterator(builtins, self(thisValue, "values").params.values())],
    ["entries", 0, (thisValue) => hostIterator(builtins, self(thisValue, "entries").iterator(builtins))],
    ["toString", 0, (thisValue) => self(thisValue, "toString").params.toString()],
    [
      "forEach",
      1,
      (thisValue, args) => {
        requireArgs("forEach", args, 1);
        const target = self(thisValue, "forEach");
        const apply = applyCollectionCallback(ctx, args[0], "URLSearchParams.forEach");
        return gen2(function* () {
          for (const [key, value] of Array.from(target.params.entries()))
            yield* apply([value, key, target], args[1]);
          return;
        });
      }
    ]
  ]);
  define(proto, IteratorSymbol, get2(proto, "entries"), hidden);
  return searchParams;
};

// ../node_modules/@opencode/codemode/dist/stdlib/headers.js
var attempt = (run) => {
  try {
    return run();
  } catch (error) {
    throw typeError(error instanceof Error ? error.message : String(error));
  }
};
var constructHeaders = (ctx, init, proto) => {
  const wrap = (headers) => new HeadersObj(proto, headers);
  if (init === undefined)
    return succeed5(wrap(new Headers));
  return gen2(function* () {
    const pairs = init instanceof Obj ? yield* readPairs(ctx, init, "new Headers(...)") : undefined;
    if (pairs !== undefined)
      return wrap(attempt(() => new Headers(pairs)));
    if (!(init instanceof Obj) || isRuntimeReference(init)) {
      throw typeError("new Headers(...) expects a record of names to values, iterable [name, value] pairs, or Headers.");
    }
    return wrap(attempt(() => new Headers(Object.fromEntries(entries(init).map(([key, value]) => [key, coerceToString(value)])))));
  });
};
var headersGlobal = (ctx) => {
  const builtins = ctx.builtins;
  const proto = builtins.Headers;
  const headers = constructor(builtins, proto, {
    name: "Headers",
    call: requiresNew("Headers"),
    construct: (args, newTarget) => constructHeaders(ctx, args[0], prototypeFrom(newTarget, proto))
  });
  const self = (thisValue, name) => receiver(HeadersObj, thisValue, `Headers.prototype.${name}`);
  const wrap = (items) => new Arr(builtins.Array, items);
  const arg = (args, index) => coerceToString(args[index]);
  const requireArgs = (name, args, count) => {
    if (args.length < count)
      throw typeError(`Headers.${name} requires ${count} argument${count === 1 ? "" : "s"}.`);
  };
  methods(builtins, proto, [
    [
      "append",
      2,
      (thisValue, args) => {
        requireArgs("append", args, 2);
        const target = self(thisValue, "append").headers;
        attempt(() => target.append(arg(args, 0), arg(args, 1)));
        return;
      }
    ],
    [
      "delete",
      1,
      (thisValue, args) => {
        requireArgs("delete", args, 1);
        const target = self(thisValue, "delete").headers;
        attempt(() => target.delete(arg(args, 0)));
        return;
      }
    ],
    [
      "get",
      1,
      (thisValue, args) => {
        requireArgs("get", args, 1);
        const target = self(thisValue, "get").headers;
        return attempt(() => target.get(arg(args, 0)));
      }
    ],
    ["getSetCookie", 0, (thisValue) => wrap(self(thisValue, "getSetCookie").headers.getSetCookie())],
    [
      "has",
      1,
      (thisValue, args) => {
        requireArgs("has", args, 1);
        const target = self(thisValue, "has").headers;
        return attempt(() => target.has(arg(args, 0)));
      }
    ],
    [
      "set",
      2,
      (thisValue, args) => {
        requireArgs("set", args, 2);
        const target = self(thisValue, "set").headers;
        attempt(() => target.set(arg(args, 0), arg(args, 1)));
        return;
      }
    ],
    ["keys", 0, (thisValue) => hostIterator(builtins, self(thisValue, "keys").headers.keys())],
    ["values", 0, (thisValue) => hostIterator(builtins, self(thisValue, "values").headers.values())],
    ["entries", 0, (thisValue) => hostIterator(builtins, self(thisValue, "entries").iterator(builtins))],
    [
      "forEach",
      1,
      (thisValue, args) => {
        requireArgs("forEach", args, 1);
        const target = self(thisValue, "forEach");
        const apply = applyCollectionCallback(ctx, args[0], "Headers.forEach");
        return gen2(function* () {
          for (const [key, value] of Array.from(target.headers.entries()))
            yield* apply([value, key, target], args[1]);
          return;
        });
      }
    ]
  ]);
  define(proto, IteratorSymbol, get2(proto, "entries"), hidden);
  return headers;
};

// ../node_modules/@opencode/codemode/dist/stdlib/iterator.js
var finished = { done: true, value: undefined };
var iteratorGlobals = (ctx) => {
  const builtins = ctx.builtins;
  const proto = builtins.Iterator;
  const method = (name) => `Iterator.prototype.${name}`;
  const guarded = (source, body) => flatMap2(exit2(body), (exit) => {
    if (isSuccess3(exit))
      return succeed5(exit.value);
    if (hasInterruptsOnly2(exit.cause))
      return failCause3(exit.cause);
    return andThen2(exit2(source.close), failCause3(exit.cause));
  });
  const helper = (source, pull, close = source.close) => {
    let done = false;
    let running = false;
    const enter = () => {
      if (running)
        throw typeError("Iterator helper is already running.");
      running = true;
    };
    return new IteratorObj(builtins.IteratorHelper, {
      next: suspend2(() => {
        if (done)
          return succeed5(finished);
        enter();
        return flatMap2(exit2(pull), (exit) => {
          running = false;
          done = isSuccess3(exit) ? exit.value.done : true;
          return exit;
        });
      }),
      close: suspend2(() => {
        if (done)
          return void_3;
        enter();
        done = true;
        return ensuring2(close, sync2(() => {
          running = false;
        }));
      })
    });
  };
  const flattenable = (value, name, strings) => gen2(function* () {
    if (typeof value === "string" ? !strings : !(value instanceof Obj)) {
      throw typeError(`${name} expects an iterable or iterator, received ${describeValue(value)}.`);
    }
    return (yield* ctx.iterate(value)) ?? ctx.iterateDirect(value);
  });
  const limit = (value, name) => {
    const count = Math.trunc(coerceToNumber(value));
    if (Number.isNaN(count) || count < 0) {
      throw rangeError(`${method(name)} expects a non-negative count, received ${count}.`);
    }
    return count;
  };
  methods(builtins, proto, [
    [
      "next",
      0,
      (thisValue) => map4(receiver(IteratorObj, thisValue, method("next")).cursor.next, (step) => record2(builtins.Object, { value: step.value, done: step.done }))
    ],
    [
      "map",
      1,
      (thisValue, args) => {
        const source = ctx.iterateDirect(thisValue);
        const apply = applyCollectionCallback(ctx, args[0], method("map"));
        let counter = 0;
        return helper(source, gen2(function* () {
          const step = yield* source.next;
          if (step.done)
            return finished;
          return { done: false, value: yield* guarded(source, apply([step.value, counter++])) };
        }));
      }
    ],
    [
      "filter",
      1,
      (thisValue, args) => {
        const source = ctx.iterateDirect(thisValue);
        const apply = applyCollectionCallback(ctx, args[0], method("filter"));
        let counter = 0;
        return helper(source, gen2(function* () {
          while (true) {
            const step = yield* source.next;
            if (step.done)
              return finished;
            if (yield* guarded(source, apply([step.value, counter++])))
              return step;
          }
        }));
      }
    ],
    [
      "take",
      1,
      (thisValue, args) => {
        const source = ctx.iterateDirect(thisValue);
        let remaining = limit(args[0], "take");
        return helper(source, gen2(function* () {
          if (remaining === 0) {
            yield* source.close;
            return finished;
          }
          remaining -= 1;
          return yield* source.next;
        }));
      }
    ],
    [
      "drop",
      1,
      (thisValue, args) => {
        const source = ctx.iterateDirect(thisValue);
        let remaining = limit(args[0], "drop");
        return helper(source, gen2(function* () {
          while (remaining > 0) {
            remaining -= 1;
            const step = yield* source.next;
            if (step.done)
              return finished;
          }
          return yield* source.next;
        }));
      }
    ],
    [
      "flatMap",
      1,
      (thisValue, args) => {
        const source = ctx.iterateDirect(thisValue);
        const apply = applyCollectionCallback(ctx, args[0], method("flatMap"));
        let counter = 0;
        let inner;
        return helper(source, gen2(function* () {
          while (true) {
            if (inner !== undefined) {
              const step = yield* guarded(source, inner.next);
              if (!step.done)
                return step;
              inner = undefined;
            }
            const step = yield* source.next;
            if (step.done)
              return finished;
            inner = yield* guarded(source, flatMap2(apply([step.value, counter++]), (mapped) => flattenable(mapped, method("flatMap"), false)));
          }
        }), suspend2(() => inner === undefined ? source.close : andThen2(inner.close, source.close)));
      }
    ],
    [
      "reduce",
      1,
      (thisValue, args) => {
        const source = ctx.iterateDirect(thisValue);
        const apply = applyCollectionCallback(ctx, args[0], method("reduce"));
        return gen2(function* () {
          let counter = 0;
          let accumulator = args[1];
          if (args.length < 2) {
            const first = yield* source.next;
            if (first.done)
              throw typeError("Iterator.prototype.reduce of an empty iterator with no initial value.");
            accumulator = first.value;
            counter = 1;
          }
          while (true) {
            const step = yield* source.next;
            if (step.done)
              return accumulator;
            accumulator = yield* guarded(source, apply([accumulator, step.value, counter++]));
          }
        });
      }
    ],
    [
      "toArray",
      0,
      (thisValue) => {
        const source = ctx.iterateDirect(thisValue);
        return gen2(function* () {
          const items = [];
          while (true) {
            const step = yield* source.next;
            if (step.done)
              return new Arr(builtins.Array, items);
            items.push(step.value);
          }
        });
      }
    ],
    [
      "forEach",
      1,
      (thisValue, args) => {
        const source = ctx.iterateDirect(thisValue);
        const apply = applyCollectionCallback(ctx, args[0], method("forEach"));
        return gen2(function* () {
          let counter = 0;
          while (true) {
            const step = yield* source.next;
            if (step.done)
              return;
            yield* guarded(source, apply([step.value, counter++]));
          }
        });
      }
    ],
    [
      "some",
      1,
      (thisValue, args) => {
        const source = ctx.iterateDirect(thisValue);
        const apply = applyCollectionCallback(ctx, args[0], method("some"));
        return gen2(function* () {
          let counter = 0;
          while (true) {
            const step = yield* source.next;
            if (step.done)
              return false;
            if (yield* guarded(source, apply([step.value, counter++]))) {
              yield* source.close;
              return true;
            }
          }
        });
      }
    ],
    [
      "every",
      1,
      (thisValue, args) => {
        const source = ctx.iterateDirect(thisValue);
        const apply = applyCollectionCallback(ctx, args[0], method("every"));
        return gen2(function* () {
          let counter = 0;
          while (true) {
            const step = yield* source.next;
            if (step.done)
              return true;
            if (!(yield* guarded(source, apply([step.value, counter++])))) {
              yield* source.close;
              return false;
            }
          }
        });
      }
    ],
    [
      "find",
      1,
      (thisValue, args) => {
        const source = ctx.iterateDirect(thisValue);
        const apply = applyCollectionCallback(ctx, args[0], method("find"));
        return gen2(function* () {
          let counter = 0;
          while (true) {
            const step = yield* source.next;
            if (step.done)
              return;
            if (yield* guarded(source, apply([step.value, counter++]))) {
              yield* source.close;
              return step.value;
            }
          }
        });
      }
    ]
  ]);
  methods(builtins, builtins.IteratorHelper, [
    [
      "return",
      0,
      (thisValue) => map4(receiver(IteratorObj, thisValue, "Iterator.prototype.return").cursor.close, () => record2(builtins.Object, { value: undefined, done: true }))
    ]
  ]);
  const iterator = constructor(builtins, proto, {
    name: "Iterator",
    length: 0,
    call: requiresNew("Iterator"),
    construct: () => sync2(() => {
      throw typeError("Iterator is abstract; use Iterator.from(...) or a built-in iterator.");
    })
  });
  define(iterator, "from", fn2(builtins, "from", 1, (_, args) => gen2(function* () {
    if (args[0] instanceof Obj && hasPrototype(args[0], proto))
      return args[0];
    return new IteratorObj(builtins.IteratorHelper, yield* flattenable(args[0], "Iterator.from", true));
  })), hidden);
  return iterator;
};

// ../node_modules/@opencode/codemode/dist/stdlib/web.js
var base64Global = (ctx, name) => fn2(ctx.builtins, name, 1, (_, args) => {
  if (args.length === 0)
    throw typeError(`${name} requires 1 argument (a string)`);
  const input = coerceToString(args[0]);
  try {
    return name === "atob" ? atob(input) : btoa(input);
  } catch {
    throw typeError("The string contains invalid characters.");
  }
});
var structuredCloneGlobal = (ctx) => fn2(ctx.builtins, "structuredClone", 1, (_, args) => {
  if (args.length === 0)
    throw typeError("structuredClone requires 1 argument");
  const builtins = ctx.builtins;
  const memo = new Map;
  const clone = (value) => {
    if (typeof value === "symbol" || value instanceof ToolReference) {
      throw typeError(`DataCloneError: ${describeValue(value)} could not be cloned.`);
    }
    if (!(value instanceof Obj))
      return value;
    const seen = memo.get(value);
    if (seen !== undefined)
      return seen;
    const remember = (copy) => {
      memo.set(value, copy);
      return copy;
    };
    if (value instanceof MapObj) {
      const copy = remember(new MapObj(builtins.Map));
      for (const [key, item] of value.map)
        copy.map.set(clone(key), clone(item));
      return copy;
    }
    if (value instanceof SetObj) {
      const copy = remember(new SetObj(builtins.Set));
      for (const item of value.set)
        copy.set.add(clone(item));
      return copy;
    }
    if (value instanceof DateObj)
      return remember(new DateObj(builtins.Date, value.time));
    if (value instanceof RegExpObj) {
      return remember(new RegExpObj(builtins.RegExp, value.regex.source, value.regex.flags));
    }
    if (value instanceof Bytes)
      return remember(new Bytes(builtins.Uint8Array, new Uint8Array(value.bytes)));
    if (value instanceof ErrorObj) {
      const name = get2(value, "name");
      const message = get2(value, "message");
      const copy = remember(createErrorValue(builtins[typeof name === "string" && isErrorType(name) ? name : "Error"], message === undefined ? undefined : coerceToString(message)));
      const stack = getOwn(value, "stack");
      if (typeof stack === "string")
        define(copy, "stack", stack, hidden);
      if (hasOwn2(value, "cause"))
        define(copy, "cause", clone(getOwn(value, "cause")), hidden);
      return copy;
    }
    if (isRuntimeReference(value) || value instanceof WeakMapObj || value instanceof WeakSetObj) {
      throw typeError(`DataCloneError: ${describeValue(value)} could not be cloned.`);
    }
    const copy = remember(value instanceof Arr ? new Arr(builtins.Array, new Array(value.items.length)) : new Obj(builtins.Object));
    for (const [key, item] of entries(value))
      define(copy, key, clone(item));
    return copy;
  };
  return clone(args[0]);
});
var cryptoGlobal = (ctx) => {
  const object = new Obj(ctx.builtins.Object);
  methods(ctx.builtins, object, [
    ["randomUUID", 0, () => crypto.randomUUID()],
    [
      "getRandomValues",
      1,
      (_, args) => {
        if (!(args[0] instanceof Bytes)) {
          throw typeError(`crypto.getRandomValues expects a Uint8Array, received ${describeValue(args[0])}.`);
        }
        crypto.getRandomValues(args[0].bytes);
        return args[0];
      }
    ]
  ]);
  return object;
};

// ../node_modules/@opencode/codemode/dist/interpreter/generators.js
var generatorGlobals = (ctx) => {
  const builtins = ctx.builtins;
  const install = (asynchronous) => {
    const proto = asynchronous ? builtins.AsyncGenerator : builtins.Generator;
    const label = asynchronous ? "AsyncGenerator" : "Generator";
    const request = (kind) => [
      kind,
      1,
      (thisValue, args) => {
        const generator = receiver(GeneratorObj, thisValue, `${label}.prototype.${kind}`);
        const requested = generator.request(kind, args[0]);
        return generator.asynchronous ? ctx.pending.create(requested) : requested;
      }
    ];
    methods(builtins, proto, [request("next"), request("return"), request("throw")]);
    define(asynchronous ? builtins.AsyncIterator : builtins.Iterator, asynchronous ? AsyncIteratorSymbol : IteratorSymbol, fn2(builtins, asynchronous ? "[Symbol.asyncIterator]" : "[Symbol.iterator]", 0, (thisValue) => thisValue), hidden);
  };
  install(false);
  install(true);
};

// ../node_modules/@opencode/codemode/dist/interpreter/globals.js
var functionGlobal = (ctx) => {
  const reject = () => sync2(() => {
    throw typeError("The Function constructor is not supported; write the function inline.");
  });
  const target = (thisValue, method) => receiver(Callable, thisValue, `Function.prototype.${method}`);
  methods(ctx.builtins, ctx.builtins.Function, [
    ["call", 1, (thisValue, args) => ctx.call(target(thisValue, "call"), args[0], args.slice(1))],
    ["apply", 2, (thisValue, args) => ctx.call(target(thisValue, "apply"), args[0], listFromArrayLike(args[1]))],
    [
      "bind",
      1,
      (thisValue, args) => {
        const fn = target(thisValue, "bind");
        const bound = args.slice(1);
        return native(ctx.builtins, {
          name: `bound ${coerceToString(get2(fn, "name"))}`,
          length: Math.max(0, fn.length - bound.length),
          call: (_, rest) => ctx.call(fn, args[0], [...bound, ...rest])
        });
      }
    ]
  ]);
  return constructor(ctx.builtins, ctx.builtins.Function, {
    name: "Function",
    length: 1,
    call: reject,
    construct: reject
  });
};
var listFromArrayLike = (value) => {
  if (value === undefined || value === null)
    return [];
  if (value instanceof Arr)
    return [...value.items];
  if (!(value instanceof Obj))
    throw typeError("Function.prototype.apply expects an array-like argument list.");
  const length = Math.max(0, coerceToInteger(get2(value, "length")));
  checkArrayLength(length);
  return Array.from({ length }, (_, index) => get2(value, String(index)));
};
var symbolGlobal = (ctx) => {
  const symbol = native(ctx.builtins, {
    name: "Symbol",
    call: () => sync2(() => {
      throw typeError("Symbol is not callable; only Symbol.asyncIterator and Symbol.iterator are available.");
    }),
    callback: false
  });
  constants(symbol, { asyncIterator: AsyncIteratorSymbol, iterator: IteratorSymbol });
  return symbol;
};
var table = {
  tools: () => new ToolReference([]),
  search: (ctx) => native(ctx.builtins, { name: "search", call: (_, args) => ctx.tool(ctx.tools.search, args), callback: false }),
  undefined: () => {
    return;
  },
  NaN: () => NaN,
  Infinity: () => Infinity,
  Object: (ctx) => objectGlobal(ctx),
  Function: (ctx) => functionGlobal(ctx),
  Array: (ctx) => arrayGlobal(ctx),
  Math: (ctx) => mathGlobal(ctx),
  JSON: (ctx) => jsonGlobal(ctx),
  console: (ctx) => consoleGlobal(ctx),
  Promise: (ctx) => promiseGlobal(ctx),
  Symbol: (ctx) => symbolGlobal(ctx),
  Iterator: (ctx) => iteratorGlobals(ctx),
  Number: (ctx) => numberGlobal(ctx),
  String: (ctx) => stringGlobal(ctx),
  Boolean: (ctx) => booleanGlobal(ctx),
  parseInt: (ctx) => coercion(ctx, "parseInt", 2),
  parseFloat: (ctx) => coercion(ctx, "parseFloat"),
  isFinite: (ctx) => coercion(ctx, "isFinite"),
  isNaN: (ctx) => coercion(ctx, "isNaN"),
  Date: (ctx) => dateGlobal(ctx),
  RegExp: (ctx) => regexpGlobal(ctx),
  Map: (ctx) => mapGlobal(ctx),
  Set: (ctx) => setGlobal(ctx),
  WeakMap: (ctx) => weakMapGlobal(ctx),
  WeakSet: (ctx) => weakSetGlobal(ctx),
  URL: (ctx) => urlGlobal(ctx),
  URLSearchParams: (ctx) => urlSearchParamsGlobal(ctx),
  Headers: (ctx) => headersGlobal(ctx),
  Uint8Array: (ctx) => uint8ArrayGlobal(ctx),
  TextEncoder: (ctx) => textEncoderGlobal(ctx),
  TextDecoder: (ctx) => textDecoderGlobal(ctx),
  encodeURI: (ctx) => uriGlobal(ctx, "encodeURI"),
  encodeURIComponent: (ctx) => uriGlobal(ctx, "encodeURIComponent"),
  decodeURI: (ctx) => uriGlobal(ctx, "decodeURI"),
  decodeURIComponent: (ctx) => uriGlobal(ctx, "decodeURIComponent"),
  atob: (ctx) => base64Global(ctx, "atob"),
  btoa: (ctx) => base64Global(ctx, "btoa"),
  crypto: (ctx) => cryptoGlobal(ctx),
  structuredClone: (ctx) => structuredCloneGlobal(ctx),
  ...Object.fromEntries(errorTypes.map((type) => [type, (ctx) => errorGlobal(type, ctx)]))
};
var globalNames = new Set(Object.keys(table));
var globals = (ctx) => {
  generatorGlobals(ctx);
  return Object.entries(table).map(([name, factory]) => [name, factory(ctx)]);
};

// ../node_modules/@opencode/codemode/dist/interpreter/scope.js
class ScopeStack {
  scopes;
  constructor(scopes) {
    this.scopes = scopes;
  }
  reserve(name, mutable, node) {
    const scope = this.current();
    if (scope.has(name)) {
      throw typeError(`Identifier '${name}' has already been declared.`, node);
    }
    scope.set(name, { mutable, value: undefined, initialized: false });
  }
  initialize(name, value, node) {
    const binding = this.current().get(name);
    if (!binding || binding.initialized !== false) {
      throw typeError(`Identifier '${name}' has not been reserved for initialization.`, node);
    }
    binding.value = value;
    binding.initialized = true;
  }
  declare(name, value, mutable, node) {
    const scope = this.current();
    if (scope.has(name)) {
      throw typeError(`Identifier '${name}' has already been declared.`, node);
    }
    scope.set(name, { mutable, value, initialized: true });
  }
  get(name, node) {
    const binding = this.resolve(name);
    if (!binding) {
      throw referenceError(`Unknown identifier '${name}'.`, node);
    }
    if (binding.initialized === false) {
      throw referenceError(`Cannot access '${name}' before initialization.`, node);
    }
    return binding.value;
  }
  set(name, value, node) {
    const binding = this.resolve(name);
    if (!binding) {
      throw referenceError(`Unknown identifier '${name}'.`, node);
    }
    if (binding.initialized === false) {
      throw referenceError(`Cannot access '${name}' before initialization.`, node);
    }
    if (!binding.mutable) {
      throw typeError(`Cannot assign to constant '${name}'.`, node);
    }
    binding.value = value;
    return value;
  }
  resolve(name) {
    for (let index = this.scopes.length - 1;index >= 0; index -= 1) {
      const scope = this.scopes[index];
      const binding = scope?.get(name);
      if (binding) {
        return binding;
      }
    }
    return;
  }
  current() {
    const scope = this.scopes[this.scopes.length - 1];
    if (!scope) {
      throw typeError("Interpreter scope stack is empty.");
    }
    return scope;
  }
  push(scope = new Map) {
    this.scopes.push(scope);
  }
  pop() {
    this.scopes.pop();
  }
  capture() {
    return this.scopes.slice();
  }
}

// ../node_modules/@opencode/codemode/dist/interpreter/interpreter.js
var primitiveOperators = new Set([
  "+",
  "-",
  "*",
  "/",
  "%",
  "**",
  "<",
  "<=",
  ">",
  ">=",
  "&",
  "|",
  "^",
  "<<",
  ">>",
  ">>>"
]);
var propertyKey2 = (value) => typeof value === "string" || typeof value === "number" || typeof value === "symbol" ? value : coerceToString(value);
var loopExit = (result, labels) => {
  if (result.kind === "return")
    return result;
  if (result.kind === "break") {
    if (result.label !== undefined && !labels?.has(result.label))
      return result;
    return { kind: "none" };
  }
  if (result.kind === "continue" && result.label !== undefined && !labels?.has(result.label))
    return result;
  return;
};
var calleeDescription = (node) => {
  if (node?.type === "Identifier")
    return node.name;
  if (node?.type === "CallExpression") {
    const target = calleeDescription(node.callee);
    return target === undefined ? undefined : `${target}(...)`;
  }
  if (node?.type !== "MemberExpression")
    return;
  const property = node.property;
  const key = !node.computed && property.type === "Identifier" ? property.name : property.type === "Literal" && typeof property.value === "string" ? property.value : undefined;
  if (key === undefined)
    return;
  const object = calleeDescription(node.object);
  return object === undefined ? undefined : `${object}.${key}`;
};
var literal2 = (node) => {
  if (typeof node.value === "bigint")
    throw typeError("BigInt literals are not supported.", node);
  if (node.value instanceof RegExp)
    throw unsupportedSyntax("RegExpLiteral", node);
  return node.value;
};
var instanceofValue = (lhs, rhs, node) => {
  if (!(rhs instanceof Callable)) {
    throw typeError("The right-hand side of 'instanceof' is not callable.", node);
  }
  const prototype = get2(rhs, "prototype");
  if (!(prototype instanceof Obj)) {
    throw typeError("The right-hand side of 'instanceof' has no 'prototype' object.", node);
  }
  return hasPrototype(lhs, prototype);
};
var collectPatternNames = (pattern, out = []) => {
  switch (pattern.type) {
    case "Identifier":
      out.push(pattern.name);
      break;
    case "AssignmentPattern":
      collectPatternNames(pattern.left, out);
      break;
    case "RestElement":
      collectPatternNames(pattern.argument, out);
      break;
    case "ArrayPattern":
      for (const element of pattern.elements) {
        if (element !== null)
          collectPatternNames(element, out);
      }
      break;
    case "ObjectPattern":
      for (const prop of pattern.properties) {
        collectPatternNames(prop.type === "RestElement" ? prop.argument : prop.value, out);
      }
      break;
  }
  return out;
};
var argumentsUse = new WeakMap;
var usesArguments = (fn) => {
  const cached = argumentsUse.get(fn.body);
  if (cached !== undefined)
    return cached;
  const found = [...fn.parameters, fn.body].some(function visit(node) {
    if (node === null || typeof node !== "object")
      return false;
    if (node.type === "Identifier")
      return node.name === "arguments";
    if (node.type === "FunctionDeclaration" || node.type === "FunctionExpression")
      return false;
    return Object.values(node).some((child) => Array.isArray(child) ? child.some((item) => visit(item)) : visit(child));
  });
  argumentsUse.set(fn.body, found);
  return found;
};
var varNames = new WeakMap;
var collectVarNames = (node, out = []) => {
  if (!node)
    return out;
  switch (node.type) {
    case "VariableDeclaration":
      if (node.kind === "var")
        for (const declaration of node.declarations)
          collectPatternNames(declaration.id, out);
      break;
    case "BlockStatement":
      for (const statement of node.body)
        collectVarNames(statement, out);
      break;
    case "IfStatement":
      collectVarNames(node.consequent, out);
      collectVarNames(node.alternate, out);
      break;
    case "ForStatement":
      if (node.init?.type === "VariableDeclaration")
        collectVarNames(node.init, out);
      collectVarNames(node.body, out);
      break;
    case "ForInStatement":
    case "ForOfStatement":
      if (node.left.type === "VariableDeclaration")
        collectVarNames(node.left, out);
      collectVarNames(node.body, out);
      break;
    case "WhileStatement":
    case "DoWhileStatement":
    case "LabeledStatement":
      collectVarNames(node.body, out);
      break;
    case "SwitchStatement":
      for (const item of node.cases)
        for (const statement of item.consequent)
          collectVarNames(statement, out);
      break;
    case "TryStatement":
      collectVarNames(node.block, out);
      collectVarNames(node.handler?.body, out);
      collectVarNames(node.finalizer, out);
      break;
  }
  return out;
};
var loopDeclaration = (left, statement) => {
  if (left.type !== "VariableDeclaration")
    return;
  const declaration = left.declarations.length === 1 ? left.declarations[0] : undefined;
  if (declaration === undefined) {
    throw typeError(`${statement} supports one declared binding.`, left);
  }
  const kind = left.kind;
  return {
    pattern: declaration.id,
    mutable: kind !== "const",
    lexical: kind !== "var"
  };
};

class Interpreter {
  tools;
  pending;
  builtins;
  logs;
  templates = new WeakMap;
  root;
  constructor(options) {
    this.tools = options.tools;
    this.pending = options.pending;
    this.builtins = options.builtins;
    this.logs = options.logs ?? [];
    const globalScope = new Map([["this", { mutable: false, value: undefined }]]);
    this.root = new Frame(this, new ScopeStack([globalScope]));
    for (const [name, value] of [...globals(this), ...options.globals?.(this) ?? []]) {
      globalScope.set(name, { mutable: false, value });
    }
  }
  run(program) {
    return this.root.run(program);
  }
  call(callable, thisValue, args) {
    return this.root.call(callable, thisValue, args);
  }
  await(promise) {
    return this.root.await(promise);
  }
  iterate(value) {
    return this.root.iterate(value);
  }
  iterateDirect(value) {
    return this.root.iterateDirect(value);
  }
  tool(run, args) {
    const ctx = this;
    return gen2(function* () {
      const json = yield* forEach2(args, (arg) => toBoundary(ctx, arg));
      return fromJson(ctx, yield* run(json));
    });
  }
}
var MAX_CALL_DEPTH = 1e4;

class Frame {
  ctx;
  scopes;
  depth;
  generatorState;
  generatorAsync = false;
  constructor(ctx, scopes, depth = 0) {
    this.ctx = ctx;
    this.scopes = scopes;
    this.depth = depth;
  }
  run(program) {
    const self = this;
    this.scopes.push();
    return gen2(function* () {
      self.predeclareLexical(program.body);
      self.hoistFunctions(program.body);
      self.hoistVars(program.body);
      let value = undefined;
      for (const [index, statement] of program.body.entries()) {
        if (index === program.body.length - 1 && statement.type === "ExpressionStatement") {
          value = yield* self.evaluateExpression(statement.expression);
          break;
        }
        const result = yield* self.evaluateStatement(statement);
        if (result.kind === "return") {
          value = result.value;
          break;
        }
        if (result.kind === "break" || result.kind === "continue") {
          throw typeError(`Unexpected '${result.kind}' outside of a loop.`, statement);
        }
      }
      value = yield* resolvePromiseValue(self.ctx, value);
      return value;
    }).pipe(ensuring2(sync2(() => self.scopes.pop())));
  }
  createToolCallPromise(path, args) {
    const pending = this.ctx.pending;
    return pending.create(this.ctx.tool((json) => pending.turn.leave(this.ctx.tools.execute(path, json)), args));
  }
  await(promise) {
    const pending = this.ctx.pending;
    return suspend2(() => {
      pending.markObserved(promise);
      return flatten3(pending.turn.suspend(flatMap2(pending.await(promise), (exit) => as2(yieldNow2, exit))));
    });
  }
  nextJob() {
    return this.ctx.pending.turn.suspend(yieldNow2);
  }
  evaluateStatement(node) {
    switch (node.type) {
      case "ExpressionStatement":
        return as2(this.evaluateExpression(node.expression), { kind: "none" });
      case "VariableDeclaration":
        return map4(this.evaluateVariableDeclaration(node), () => ({ kind: "none" }));
      case "ReturnStatement": {
        const argumentNode = node.argument;
        return argumentNode ? map4(this.evaluateExpression(argumentNode), (value) => ({ kind: "return", value })) : succeed5({ kind: "return", value: undefined });
      }
      case "BlockStatement":
        return this.evaluateBlock(node);
      case "IfStatement":
        return this.evaluateIfStatement(node);
      case "SwitchStatement":
        return this.evaluateSwitchStatement(node);
      case "LabeledStatement":
        return this.evaluateLabeledStatement(node);
      case "WhileStatement":
        return this.evaluateWhileStatement(node);
      case "DoWhileStatement":
        return this.evaluateDoWhileStatement(node);
      case "ForStatement":
        return this.evaluateForStatement(node);
      case "ForOfStatement":
        return this.evaluateForOfStatement(node);
      case "ForInStatement":
        return this.evaluateForInStatement(node);
      case "BreakStatement":
        return succeed5(this.evaluateBreakStatement(node));
      case "ContinueStatement":
        return succeed5(this.evaluateContinueStatement(node));
      case "ThrowStatement":
        return this.evaluateThrowStatement(node);
      case "TryStatement":
        return this.evaluateTryStatement(node);
      case "EmptyStatement":
        return succeed5({ kind: "none" });
      case "FunctionDeclaration":
        return succeed5({ kind: "none" });
      default:
        throw unsupportedSyntax(node.type, node);
    }
  }
  evaluateBlock(node) {
    this.scopes.push();
    const self = this;
    return gen2(function* () {
      const body = node.body;
      self.predeclareLexical(body);
      self.hoistFunctions(body);
      for (const statement of body) {
        const result = yield* self.evaluateStatement(statement);
        if (result.kind !== "none") {
          return result;
        }
      }
      return { kind: "none" };
    }).pipe(ensuring2(sync2(() => self.scopes.pop())));
  }
  createFunction(node, name = node.type === "ArrowFunctionExpression" ? "" : node.id?.name ?? "") {
    const builtins = this.ctx.builtins;
    const fn = new Fn(builtins.Function, name, node.params, node.body, this.scopes.capture(), node.async, node.generator, node.type === "ArrowFunctionExpression");
    if (node.generator)
      define(fn, "prototype", new Obj(node.async ? builtins.AsyncGenerator : builtins.Generator), hidden);
    if (node.type === "FunctionExpression" && node.id) {
      fn.capturedScopes.push(new Map([[node.id.name, { mutable: false, value: fn, initialized: true }]]));
    }
    return fn;
  }
  evaluateNamed(node, name) {
    if (node.type === "ArrowFunctionExpression" || node.type === "FunctionExpression" && !node.id) {
      return sync2(() => this.createFunction(node, name));
    }
    return this.evaluateExpression(node);
  }
  hoistFunctions(statements) {
    for (const node of statements) {
      if (node.type !== "FunctionDeclaration")
        continue;
      this.scopes.current().set(node.id.name, { mutable: true, value: this.createFunction(node), initialized: true });
    }
  }
  hoistVars(statements, parameters) {
    const names = varNames.get(statements) ?? statements.reduce((out, statement) => collectVarNames(statement, out), []);
    varNames.set(statements, names);
    const scope = this.scopes.current();
    for (const name of names) {
      if (scope.has(name))
        continue;
      scope.set(name, { mutable: true, value: parameters?.get(name)?.value, initialized: true });
    }
  }
  predeclareLexical(statements) {
    for (const statement of statements) {
      if (statement.type !== "VariableDeclaration")
        continue;
      const kind = statement.kind;
      if (kind === "var")
        continue;
      for (const declaration of statement.declarations) {
        for (const name of collectPatternNames(declaration.id)) {
          this.scopes.reserve(name, kind !== "const", declaration);
        }
      }
    }
  }
  predeclarePattern(pattern, mutable, node) {
    for (const name of collectPatternNames(pattern))
      this.scopes.reserve(name, mutable, node);
  }
  evaluateIfStatement(node) {
    return flatMap2(this.evaluateExpression(node.test), (test) => test ? this.evaluateStatement(node.consequent) : node.alternate ? this.evaluateStatement(node.alternate) : succeed5({ kind: "none" }));
  }
  evaluateSwitchStatement(node) {
    const self = this;
    return gen2(function* () {
      const discriminant = yield* self.evaluateExpression(node.discriminant);
      self.scopes.push();
      return yield* gen2(function* () {
        const cases = node.cases;
        const statements = cases.flatMap((branch) => branch.consequent);
        self.predeclareLexical(statements);
        self.hoistFunctions(statements);
        let defaultIndex;
        let selected;
        for (const [index, branch] of cases.entries()) {
          const test = branch.test;
          if (!test) {
            defaultIndex = index;
            continue;
          }
          if ((yield* self.evaluateExpression(test)) === discriminant) {
            selected = index;
            break;
          }
        }
        const start = selected ?? defaultIndex;
        if (start === undefined)
          return { kind: "none" };
        for (let index = start;index < cases.length; index += 1) {
          for (const statement of cases[index].consequent) {
            const result = yield* self.evaluateStatement(statement);
            if (result.kind === "break") {
              if (result.label === undefined)
                return { kind: "none" };
              return result;
            }
            if (result.kind === "return" || result.kind === "continue")
              return result;
          }
        }
        return { kind: "none" };
      }).pipe(ensuring2(sync2(() => self.scopes.pop())));
    });
  }
  evaluateWhileStatement(node, labels) {
    const self = this;
    return gen2(function* () {
      while (yield* self.evaluateExpression(node.test)) {
        const exit = loopExit(yield* self.evaluateStatement(node.body), labels);
        if (exit !== undefined)
          return exit;
      }
      return { kind: "none" };
    });
  }
  evaluateDoWhileStatement(node, labels) {
    const self = this;
    return gen2(function* () {
      do {
        const exit = loopExit(yield* self.evaluateStatement(node.body), labels);
        if (exit !== undefined)
          return exit;
      } while (yield* self.evaluateExpression(node.test));
      return { kind: "none" };
    });
  }
  evaluateForStatement(node, labels) {
    this.scopes.push();
    const self = this;
    return gen2(function* () {
      const initNode = node.init;
      const testNode = node.test;
      const updateNode = node.update;
      if (initNode?.type === "VariableDeclaration" && initNode.kind !== "var") {
        self.predeclareLexical([initNode]);
      }
      if (initNode) {
        if (initNode.type === "VariableDeclaration") {
          yield* self.evaluateVariableDeclaration(initNode);
        } else {
          yield* self.evaluateExpression(initNode);
        }
      }
      const perIterationBindings = initNode?.type === "VariableDeclaration" && initNode.kind !== "var" ? Array.from(self.scopes.current().keys()) : [];
      const nextIteration = () => {
        if (perIterationBindings.length === 0)
          return;
        const current = self.scopes.current();
        self.scopes.pop();
        self.scopes.push(new Map(perIterationBindings.map((name) => [name, { ...current.get(name) }])));
      };
      nextIteration();
      while (testNode ? yield* self.evaluateExpression(testNode) : true) {
        const exit = loopExit(yield* self.evaluateStatement(node.body), labels);
        if (exit !== undefined)
          return exit;
        nextIteration();
        if (updateNode) {
          yield* self.evaluateExpression(updateNode);
        }
      }
      return { kind: "none" };
    }).pipe(ensuring2(sync2(() => self.scopes.pop())));
  }
  evaluateForOfStatement(node, labels) {
    const awaiting = node.await;
    const left = node.left;
    const declared = loopDeclaration(left, "for...of");
    if (declared?.lexical)
      this.scopes.push();
    const self = this;
    return gen2(function* () {
      if (declared?.lexical)
        self.predeclarePattern(declared.pattern, declared.mutable, left);
      const right = yield* self.evaluateExpression(node.right);
      const cursor = self.builtinCursor(right);
      const iterator = cursor === undefined ? yield* self.customIterator(right, node, awaiting) : undefined;
      if (iterator === undefined && cursor === undefined) {
        throw invalidData(`${awaiting ? "for await...of" : "for...of"} requires an iterable value, received ${describeValue(right)}.`, node);
      }
      const close = () => iterator ? self.closeIterator(iterator, node, awaiting) : awaiting ? andThen2(cursor?.close ?? void_3, self.nextJob()) : cursor?.close ?? void_3;
      if (left.type === "RestElement" || left.type === "AssignmentPattern") {
        throw typeError("Unsupported for...of binding.", left);
      }
      const assignment = left.type === "VariableDeclaration" ? undefined : left;
      const evaluateBody = (value) => gen2(function* () {
        if (declared?.lexical) {
          self.scopes.push();
          self.predeclarePattern(declared.pattern, declared.mutable, left);
          yield* self.declarePattern(declared.pattern, value, declared.mutable, left, true);
        } else if (declared) {
          yield* self.assignPattern(declared.pattern, value, left);
        } else if (assignment) {
          yield* self.assignPattern(assignment, value, left);
        }
        return yield* self.evaluateStatement(node.body);
      }).pipe(ensuring2(sync2(() => {
        if (declared?.lexical)
          self.scopes.pop();
      })));
      while (true) {
        const current = iterator ? yield* self.nextIteratorResult(iterator, node, awaiting) : yield* cursor?.next ?? die3(typeError("Iterator is unavailable.", node));
        const step = cursor && awaiting ? { done: current.done, value: yield* self.awaitValue(current.value) } : current;
        if (step.done)
          return { kind: "none" };
        const bodyExit = yield* exit2(evaluateBody(step.value));
        if (!isSuccess3(bodyExit)) {
          if (hasInterruptsOnly2(bodyExit.cause))
            return yield* failCause3(bodyExit.cause);
          return yield* preserveConsumerError(close(), failCause3(bodyExit.cause));
        }
        const exit = loopExit(bodyExit.value, labels);
        if (exit !== undefined) {
          yield* close();
          return exit;
        }
      }
    }).pipe(ensuring2(sync2(() => {
      if (declared?.lexical)
        self.scopes.pop();
    })));
  }
  awaitValue(value) {
    return flatMap2(resolvePromise(this.ctx, value), (promise) => ensuring2(this.await(promise), sync2(() => this.depth = 0)));
  }
  awaitAsyncFromSyncValue(iterator, value, node, closeOnRejection) {
    const self = this;
    return gen2(function* () {
      const settled = yield* exit2(self.awaitValue(value));
      if (isSuccess3(settled))
        return settled.value;
      if (closeOnRejection && !hasInterruptsOnly2(settled.cause)) {
        yield* exit2(self.closeIterator(iterator, node, false));
      }
      return yield* failCause3(settled.cause);
    });
  }
  iterate(value, node) {
    const cursor = this.builtinCursor(value);
    if (cursor !== undefined)
      return succeed5(cursor);
    return map4(this.customIterator(value, node, false), (iterator) => iterator === undefined ? undefined : this.customCursor(iterator, node));
  }
  iterateDirect(value, node) {
    if (value instanceof IteratorObj)
      return value.cursor;
    if (!(value instanceof Obj)) {
      throw typeError(`An iterator must be an object, received ${describeValue(value)}.`, node);
    }
    return this.customCursor({
      iterator: value,
      next: this.requireIteratorMethod(get2(value, "next"), "Iterator next", node),
      asynchronous: false
    }, node);
  }
  customCursor(iterator, node) {
    return {
      next: this.nextIteratorResult(iterator, node, false),
      close: suspend2(() => this.closeIterator(iterator, node, false))
    };
  }
  builtinCursor(value) {
    if (value instanceof IteratorObj)
      return value.cursor;
    const iterator = typeof value === "string" ? value[Symbol.iterator]() : value instanceof Obj ? value.iterator(this.ctx.builtins) : undefined;
    return iterator === undefined ? undefined : hostCursor(iterator);
  }
  customIterator(value, node, allowAsync = true) {
    if (!(value instanceof Obj))
      return undefined_2;
    const asyncMethod = allowAsync ? get2(value, AsyncIteratorSymbol) : undefined;
    const method = asyncMethod ?? get2(value, IteratorSymbol);
    if (method === undefined || method === null)
      return undefined_2;
    const self = this;
    return map4(this.call(this.requireIteratorMethod(method, "Iterator method", node), value, [], node), (iterator) => {
      const object = self.requireIteratorObject(iterator, "Iterator method result", node);
      return {
        iterator: object,
        next: self.requireIteratorMethod(get2(object, "next"), "Iterator next", node),
        asynchronous: asyncMethod !== undefined && asyncMethod !== null
      };
    });
  }
  nextIteratorResult(iterator, node, awaiting) {
    const self = this;
    return gen2(function* () {
      if (iterator.asynchronous) {
        const object = self.requireIteratorObject(yield* self.awaitValue(yield* self.call(iterator.next, iterator.iterator, [], node)), "Iterator next() result", node);
        return { done: Boolean(get2(object, "done")), value: get2(object, "value") };
      }
      const called = yield* exit2(self.call(iterator.next, iterator.iterator, [], node));
      if (!isSuccess3(called)) {
        if (awaiting)
          yield* self.nextJob();
        return yield* failCause3(called.cause);
      }
      const captured = yield* exit2(sync2(() => {
        const object = self.requireIteratorObject(called.value, "Iterator next() result", node);
        return { done: Boolean(get2(object, "done")), value: get2(object, "value") };
      }));
      if (!isSuccess3(captured)) {
        if (awaiting)
          yield* self.nextJob();
        return yield* failCause3(captured.cause);
      }
      return {
        done: captured.value.done,
        value: awaiting ? yield* self.awaitAsyncFromSyncValue(iterator, captured.value.value, node, !captured.value.done) : captured.value.value
      };
    });
  }
  closeIterator(iterator, node, awaiting = true) {
    const close = get2(iterator.iterator, "return");
    if (close === undefined || close === null) {
      return iterator.asynchronous || !awaiting ? void_3 : this.nextJob();
    }
    const self = this;
    return gen2(function* () {
      const method = self.requireIteratorMethod(close, "Iterator return", node);
      if (iterator.asynchronous) {
        self.requireIteratorObject(yield* self.awaitValue(yield* self.call(method, iterator.iterator, [], node)), "Iterator return() result", node);
        return;
      }
      const called = yield* exit2(self.call(method, iterator.iterator, [], node));
      if (!isSuccess3(called)) {
        if (awaiting)
          yield* self.nextJob();
        return yield* failCause3(called.cause);
      }
      const captured = yield* exit2(sync2(() => get2(self.requireIteratorObject(called.value, "Iterator return() result", node), "value")));
      if (!isSuccess3(captured)) {
        if (awaiting)
          yield* self.nextJob();
        return yield* failCause3(captured.cause);
      }
      if (awaiting)
        yield* self.awaitValue(captured.value);
    });
  }
  requireIteratorObject(value, context, node) {
    if (value instanceof Obj)
      return value;
    throw typeError(`${context} must be an object.`, node);
  }
  requireIteratorMethod(value, context, node) {
    if (typeofValue(value) === "function")
      return value;
    throw typeError(`${context} must be a function.`, node);
  }
  enumerableKeys(value, node) {
    if (value instanceof ToolReference)
      return [...this.ctx.tools.keys(value.path)];
    if (value === null || value === undefined)
      return [];
    return keys(enumerableSource(this.ctx, "for...in", value, node));
  }
  evaluateForInStatement(node, labels) {
    const left = node.left;
    const declared = loopDeclaration(left, "for...in");
    if (declared?.lexical)
      this.scopes.push();
    const self = this;
    return gen2(function* () {
      if (declared?.lexical)
        self.predeclarePattern(declared.pattern, declared.mutable, left);
      const right = yield* self.evaluateExpression(node.right);
      const keys = self.enumerableKeys(right, node.right);
      if (left.type === "RestElement" || left.type === "AssignmentPattern") {
        throw typeError("Unsupported for...in binding.", left);
      }
      const assignment = left.type === "VariableDeclaration" ? undefined : left;
      for (const key of keys) {
        const result = yield* gen2(function* () {
          if (declared?.lexical) {
            self.scopes.push();
            self.predeclarePattern(declared.pattern, declared.mutable, left);
            yield* self.declarePattern(declared.pattern, key, declared.mutable, left, true);
          } else if (declared) {
            yield* self.assignPattern(declared.pattern, key, left);
          } else if (assignment) {
            yield* self.assignPattern(assignment, key, left);
          }
          return yield* self.evaluateStatement(node.body);
        }).pipe(ensuring2(sync2(() => {
          if (declared?.lexical)
            self.scopes.pop();
        })));
        const exit = loopExit(result, labels);
        if (exit !== undefined)
          return exit;
      }
      return { kind: "none" };
    }).pipe(ensuring2(sync2(() => {
      if (declared?.lexical)
        self.scopes.pop();
    })));
  }
  evaluateBreakStatement(node) {
    return node.label ? { kind: "break", label: node.label.name } : { kind: "break" };
  }
  evaluateContinueStatement(node) {
    return node.label ? { kind: "continue", label: node.label.name } : { kind: "continue" };
  }
  evaluateLabeledStatement(node) {
    const labels = new Set;
    let body = node;
    while (body.type === "LabeledStatement") {
      labels.add(body.label.name);
      body = body.body;
    }
    const evaluated = (() => {
      if (body.type === "WhileStatement")
        return this.evaluateWhileStatement(body, labels);
      if (body.type === "DoWhileStatement")
        return this.evaluateDoWhileStatement(body, labels);
      if (body.type === "ForStatement")
        return this.evaluateForStatement(body, labels);
      if (body.type === "ForOfStatement")
        return this.evaluateForOfStatement(body, labels);
      if (body.type === "ForInStatement")
        return this.evaluateForInStatement(body, labels);
      return this.evaluateStatement(body);
    })();
    return map4(evaluated, (result) => result.kind === "break" && result.label !== undefined && labels.has(result.label) ? { kind: "none" } : result);
  }
  evaluateThrowStatement(node) {
    return flatMap2(this.evaluateExpression(node.argument), (value) => fail5(new Throw(value)));
  }
  evaluateTryStatement(node) {
    const body = node.block;
    const handler = node.handler;
    const finalizer = node.finalizer;
    const self = this;
    const attempted = matchCauseEffect2(this.evaluateStatement(body), {
      onFailure: (cause) => {
        if (cause.reasons.some(isInterruptReason2) || squash(cause) instanceof GeneratorReturn || !handler) {
          return failCause3(cause);
        }
        const caught = materialize(self.ctx, squash(cause));
        const parameter = handler.param;
        self.scopes.push();
        return gen2(function* () {
          if (parameter)
            yield* self.declarePattern(parameter, caught, true, handler);
          return yield* self.evaluateStatement(handler.body);
        }).pipe(ensuring2(sync2(() => self.scopes.pop())));
      },
      onSuccess: succeed5
    });
    if (!finalizer)
      return attempted;
    const isAbrupt = (result) => result.kind === "return" || result.kind === "break" || result.kind === "continue";
    return matchCauseEffect2(attempted, {
      onFailure: (cause) => cause.reasons.some(isInterruptReason2) ? failCause3(cause) : flatMap2(this.evaluateStatement(finalizer), (final) => isAbrupt(final) ? succeed5(final) : failCause3(cause)),
      onSuccess: (result) => flatMap2(this.evaluateStatement(finalizer), (final) => isAbrupt(final) ? succeed5(final) : succeed5(result))
    });
  }
  evaluateVariableDeclaration(node) {
    const kind = node.kind;
    const self = this;
    return gen2(function* () {
      for (const declaration of node.declarations) {
        if (declaration.type !== "VariableDeclarator") {
          throw typeError("Unsupported variable declaration shape.", declaration);
        }
        const init = declaration.init;
        const id = declaration.id;
        const evaluate = (init) => id.type === "Identifier" ? self.evaluateNamed(init, id.name) : self.evaluateExpression(init);
        if (kind === "var") {
          if (init)
            yield* self.assignPattern(id, yield* evaluate(init), declaration);
          continue;
        }
        const value = init ? yield* evaluate(init) : undefined;
        yield* self.declarePattern(declaration.id, value, kind !== "const", declaration, true);
      }
    });
  }
  declarePattern(pattern, value, mutable, node, initialize = false) {
    const self = this;
    return gen2(function* () {
      if (pattern.type === "Identifier") {
        const name = pattern.name;
        if (initialize)
          self.scopes.initialize(name, value, node);
        else
          self.scopes.declare(name, value, mutable, node);
        return;
      }
      if (pattern.type === "AssignmentPattern") {
        const resolved = value === undefined ? yield* self.evaluateDefault(pattern) : value;
        yield* self.declarePattern(pattern.left, resolved, mutable, node, initialize);
        return;
      }
      if (pattern.type === "ObjectPattern") {
        if (value === null || value === undefined) {
          throw typeError(`Cannot destructure ${describeValue(value)} as it is ${value}.`, pattern);
        }
        const consumed = new Set;
        for (const property of pattern.properties) {
          if (property.type === "RestElement") {
            const rest = new Obj(self.ctx.builtins.Object);
            assign2(rest, enumerableSource(self.ctx, "Object destructuring", value, pattern), consumed);
            yield* self.declarePattern(property.argument, rest, mutable, property, initialize);
            continue;
          }
          const key = yield* self.destructuringPropertyKey(property);
          consumed.add(typeof key === "symbol" ? key : String(key));
          yield* self.declarePattern(property.value, self.destructuredProperty(value, key, property), mutable, property, initialize);
        }
        return;
      }
      if (pattern.type === "ArrayPattern") {
        return yield* self.destructureArrayPattern(pattern, value, (target, item, context) => self.declarePattern(target, item, mutable, context, initialize));
      }
      throw typeError(`Unsupported binding pattern '${pattern.type}'.`, pattern);
    });
  }
  assignPattern(pattern, value, node) {
    const self = this;
    return gen2(function* () {
      if (pattern.type === "Identifier") {
        self.scopes.set(pattern.name, value, pattern);
        return;
      }
      if (pattern.type === "MemberExpression") {
        yield* self.writeMember(pattern, value);
        return;
      }
      if (pattern.type === "AssignmentPattern") {
        const resolved = value === undefined ? yield* self.evaluateDefault(pattern) : value;
        yield* self.assignPattern(pattern.left, resolved, node);
        return;
      }
      if (pattern.type === "ObjectPattern") {
        if (value === null || value === undefined) {
          throw typeError(`Cannot destructure ${describeValue(value)} as it is ${value}.`, pattern);
        }
        const consumed = new Set;
        for (const property of pattern.properties) {
          if (property.type === "RestElement") {
            const rest = new Obj(self.ctx.builtins.Object);
            assign2(rest, enumerableSource(self.ctx, "Object destructuring", value, pattern), consumed);
            yield* self.assignPattern(property.argument, rest, property);
            continue;
          }
          const key = yield* self.destructuringPropertyKey(property);
          consumed.add(typeof key === "symbol" ? key : String(key));
          yield* self.assignPattern(property.value, self.destructuredProperty(value, key, property), property);
        }
        return;
      }
      if (pattern.type === "ArrayPattern") {
        return yield* self.destructureArrayPattern(pattern, value, (target, item, context) => self.assignPattern(target, item, context));
      }
      throw typeError(`Unsupported assignment pattern '${pattern.type}'.`, node);
    });
  }
  evaluateDefault(pattern) {
    return pattern.left.type === "Identifier" ? this.evaluateNamed(pattern.right, pattern.left.name) : this.evaluateExpression(pattern.right);
  }
  destructureArrayPattern(pattern, value, consume) {
    const self = this;
    return gen2(function* () {
      const cursor = yield* self.iterate(value, pattern);
      if (cursor === undefined) {
        throw typeError("Array destructuring requires a supported iterable value.", pattern);
      }
      let done = false;
      for (const element of pattern.elements) {
        if (done) {
          if (element === null)
            continue;
          yield* consume(element.type === "RestElement" ? element.argument : element, element.type === "RestElement" ? new Arr(self.ctx.builtins.Array) : undefined, element);
          if (element.type === "RestElement")
            return;
          continue;
        }
        const step = yield* cursor.next;
        done = step.done;
        if (element === null)
          continue;
        if (element.type === "RestElement") {
          const rest = [];
          if (!step.done)
            rest.push(step.value);
          while (!done) {
            const next = yield* cursor.next;
            done = next.done;
            if (!done)
              rest.push(next.value);
          }
          yield* consume(element.argument, new Arr(self.ctx.builtins.Array, rest), element);
          return;
        }
        const consumed = consume(element, step.done ? undefined : step.value, pattern);
        yield* step.done ? consumed : preserveConsumerError(cursor.close, consumed);
      }
      if (!done)
        yield* cursor.close;
    });
  }
  destructuringPropertyKey(property) {
    if (property.type !== "Property" || property.kind !== "init") {
      throw typeError("Unsupported object destructuring property.", property);
    }
    const keyNode = property.key;
    if (property.computed) {
      return flatMap2(this.evaluateExpression(keyNode), (value) => this.toPropertyKey(value, keyNode));
    }
    if (keyNode.type === "Identifier")
      return succeed5(keyNode.name);
    if (keyNode.type === "Literal")
      return succeed5(String(keyNode.value));
    throw unsupportedSyntax(keyNode.type, keyNode);
  }
  evaluateExpression(node) {
    switch (node.type) {
      case "Literal": {
        const regex = node.regex;
        if (regex)
          return sync2(() => constructRegExp(this.ctx.builtins, [regex.pattern, regex.flags]));
        return succeed5(literal2(node));
      }
      case "Identifier":
        return sync2(() => this.scopes.get(node.name, node));
      case "ThisExpression":
        return sync2(() => this.scopes.get("this", node));
      case "BinaryExpression":
        return this.evaluateBinaryExpression(node);
      case "LogicalExpression":
        return this.evaluateLogicalExpression(node);
      case "UnaryExpression":
        return this.evaluateUnaryExpression(node);
      case "AssignmentExpression":
        return this.evaluateAssignmentExpression(node);
      case "SequenceExpression": {
        const self = this;
        return gen2(function* () {
          let result;
          for (const expression of node.expressions) {
            result = yield* self.evaluateExpression(expression);
          }
          return result;
        });
      }
      case "CallExpression":
        return this.evaluateCallExpression(node);
      case "ArrowFunctionExpression":
      case "FunctionExpression":
        return sync2(() => this.createFunction(node));
      case "MemberExpression":
        return this.readMember(node);
      case "ChainExpression":
        return map4(this.evaluateExpression(node.expression), (value) => value === OptionalShortCircuit ? undefined : value);
      case "ObjectExpression":
        return this.evaluateObjectExpression(node);
      case "ArrayExpression":
        return this.evaluateArrayExpression(node);
      case "TemplateLiteral":
        return this.evaluateTemplateLiteral(node);
      case "TaggedTemplateExpression":
        return this.evaluateTaggedTemplate(node);
      case "ConditionalExpression":
        return this.evaluateConditionalExpression(node);
      case "UpdateExpression":
        return this.evaluateUpdateExpression(node);
      case "AwaitExpression": {
        return flatMap2(this.evaluateExpression(node.argument), (value) => this.awaitValue(value));
      }
      case "YieldExpression":
        return this.evaluateYieldExpression(node);
      case "NewExpression":
        return this.evaluateNewExpression(node);
      default:
        throw unsupportedSyntax(node.type, node);
    }
  }
  evaluateNewExpression(node) {
    const self = this;
    return gen2(function* () {
      const callee = yield* self.evaluateExpression(node.callee);
      const construct = callee instanceof Native ? callee.construct : undefined;
      if (construct === undefined) {
        const name = calleeDescription(node.callee) ?? "The called value";
        const message = callee instanceof Fn ? `${name} cannot be constructed: user-defined constructors and classes are not supported. Call it as a function that returns a plain object instead.` : callee instanceof Native ? `new ${name}(...) is not supported; call ${name}(...) without new instead.` : `${name} is not a constructor.`;
        throw typeError(message, node);
      }
      const args = yield* self.evaluateCallArguments(node.arguments);
      return yield* self.native(() => construct(args, callee), node);
    });
  }
  evaluateBinaryExpression(node) {
    const operator = node.operator;
    const left = node.left;
    if (left.type === "PrivateIdentifier")
      throw unsupportedSyntax(left.type, left);
    const self = this;
    return gen2(function* () {
      const lhs = yield* self.evaluateExpression(left);
      const rhs = yield* self.evaluateExpression(node.right);
      if (operator === "instanceof")
        return instanceofValue(lhs, rhs, node);
      if (lhs instanceof Obj || rhs instanceof Obj)
        return yield* self.applyOperator(operator, lhs, rhs, node);
      return self.applyBinaryOperator(operator, lhs, rhs, node);
    });
  }
  toPrimitive(value, hint, node) {
    return this.native(() => toPrimitive(this.ctx, value, hint), node);
  }
  applyOperator(operator, lhs, rhs, node) {
    if (!(lhs instanceof Obj || rhs instanceof Obj))
      return succeed5(this.applyBinaryOperator(operator, lhs, rhs, node));
    const equality = operator === "==" || operator === "!=";
    if (operator === "in" && lhs instanceof Obj && !isOpaque(lhs) && rhs instanceof Obj) {
      return map4(this.toPropertyKey(lhs, node), (key) => has(rhs, key));
    }
    const other = lhs instanceof Obj ? rhs : lhs;
    const converts = primitiveOperators.has(operator) || equality && other !== null && other !== undefined && typeof other !== "object";
    if (!converts)
      return succeed5(this.applyBinaryOperator(operator, lhs, rhs, node));
    const hint = operator === "+" || equality ? "default" : "number";
    const self = this;
    return gen2(function* () {
      const l = yield* self.toPrimitive(lhs, hint, node);
      const r = yield* self.toPrimitive(rhs, hint, node);
      return self.applyBinaryOperator(operator, l, r, node);
    });
  }
  applyBinaryOperator(operator, lhs, rhs, node) {
    if (operator === "===")
      return lhs === rhs;
    if (operator === "!==")
      return lhs !== rhs;
    if (operator === "==")
      return this.looselyEqual(lhs, rhs, node);
    if (operator === "!=")
      return !this.looselyEqual(lhs, rhs, node);
    if (operator === "in" && rhs instanceof Obj && !isOpaque(lhs))
      return has(rhs, propertyKey2(lhs));
    if (isOpaque(lhs) || isOpaque(rhs)) {
      throw invalidData("Binary operators require data values.", node);
    }
    switch (operator) {
      case "+": {
        const sum = lhs + rhs;
        if (typeof sum === "string")
          checkStringLength(sum.length);
        return sum;
      }
      case "-":
        return lhs - rhs;
      case "*":
        return lhs * rhs;
      case "/":
        return lhs / rhs;
      case "%":
        return lhs % rhs;
      case "**":
        return lhs ** rhs;
      case "<":
        return lhs < rhs;
      case "<=":
        return lhs <= rhs;
      case ">":
        return lhs > rhs;
      case ">=":
        return lhs >= rhs;
      case "&":
        return lhs & rhs;
      case "|":
        return lhs | rhs;
      case "^":
        return lhs ^ rhs;
      case "<<":
        return lhs << rhs;
      case ">>":
        return lhs >> rhs;
      case ">>>":
        return lhs >>> rhs;
      case "in":
        throw typeError("The 'in' operator requires a data object on the right-hand side.", node);
      default:
        throw typeError(`Unsupported binary operator '${operator}'.`, node);
    }
  }
  looselyEqual(lhs, rhs, node) {
    const lhsObject = lhs !== null && typeof lhs === "object";
    const rhsObject = rhs !== null && typeof rhs === "object";
    if (lhsObject === rhsObject)
      return lhsObject ? lhs === rhs : lhs == rhs;
    const primitive = lhsObject ? rhs : lhs;
    if (primitive === null || primitive === undefined)
      return false;
    throw invalidData("Binary operators require data values.", node);
  }
  evaluateLogicalExpression(node) {
    const operator = node.operator;
    return flatMap2(this.evaluateExpression(node.left), (left) => {
      if (operator === "&&")
        return left ? this.evaluateExpression(node.right) : succeed5(left);
      if (operator === "||")
        return left ? succeed5(left) : this.evaluateExpression(node.right);
      if (operator === "??")
        return left !== null && left !== undefined ? succeed5(left) : this.evaluateExpression(node.right);
      throw typeError(`Unsupported logical operator '${operator}'.`, node);
    });
  }
  evaluateUnaryExpression(node) {
    const operator = node.operator;
    const argument = node.argument;
    if (operator === "delete")
      return this.evaluateDeleteExpression(argument);
    if (operator === "typeof" && argument.type === "Identifier" && !this.scopes.resolve(argument.name)) {
      return succeed5("undefined");
    }
    const self = this;
    return gen2(function* () {
      const value = yield* self.evaluateExpression(argument);
      if (operator === "typeof")
        return typeofValue(value);
      if (operator === "!")
        return !value;
      if (operator === "void")
        return;
      const operand = yield* self.toPrimitive(value, "number", node);
      if (isOpaque(operand)) {
        throw invalidData("Unary operators require data values.", node);
      }
      let result;
      switch (operator) {
        case "+":
          result = +operand;
          break;
        case "-":
          result = -operand;
          break;
        case "~":
          result = ~operand;
          break;
        default:
          throw typeError(`Unsupported unary operator '${operator}'.`, node);
      }
      return result;
    });
  }
  evaluateAssignmentExpression(node) {
    const left = node.left;
    const operator = node.operator;
    const binary = operator.slice(0, -1);
    const self = this;
    return gen2(function* () {
      if (operator === "??=" || operator === "||=" || operator === "&&=") {
        return yield* self.evaluateLogicalAssignment(node, left, operator);
      }
      if (operator !== "=" && !compoundOperators.has(operator)) {
        throw typeError(`Unsupported assignment operator '${operator}'.`, node);
      }
      if (operator === "=" && (left.type === "ObjectPattern" || left.type === "ArrayPattern")) {
        const rightValue = yield* self.evaluateExpression(node.right);
        yield* self.assignPattern(left, rightValue, node);
        return rightValue;
      }
      if (left.type === "Identifier") {
        const name = left.name;
        if (operator !== "=") {
          const current = self.scopes.get(name, left);
          const rightValue = yield* self.evaluateExpression(node.right);
          const next = current instanceof Obj || rightValue instanceof Obj ? yield* self.applyOperator(binary, current, rightValue, node) : self.applyBinaryOperator(binary, current, rightValue, node);
          return self.scopes.set(name, next, left);
        }
        const rightValue = yield* self.evaluateNamed(node.right, name);
        return self.scopes.set(name, rightValue, left);
      }
      if (left.type === "MemberExpression") {
        return yield* self.modifyMember(left, (current) => flatMap2(self.evaluateExpression(node.right), (rightValue) => {
          if (operator === "=")
            return succeed5({ write: true, next: rightValue, result: rightValue });
          return map4(self.applyOperator(binary, current, rightValue, node), (next) => ({
            write: true,
            next,
            result: next
          }));
        }));
      }
      throw typeError("Assignment target must be an Identifier or MemberExpression.", left);
    });
  }
  evaluateLogicalAssignment(node, left, operator) {
    const self = this;
    const shouldAssign = (current) => operator === "??=" ? current === null || current === undefined : operator === "||=" ? !current : Boolean(current);
    if (left.type === "Identifier") {
      const name = left.name;
      return gen2(function* () {
        const current = self.scopes.get(name, left);
        if (!shouldAssign(current))
          return current;
        const rightValue = yield* self.evaluateNamed(node.right, name);
        return self.scopes.set(name, rightValue, left);
      });
    }
    if (left.type === "MemberExpression") {
      return self.modifyMember(left, (current) => shouldAssign(current) ? map4(self.evaluateExpression(node.right), (rightValue) => ({
        write: true,
        next: rightValue,
        result: rightValue
      })) : succeed5({ write: false, next: current, result: current }));
    }
    throw typeError("Assignment target must be an Identifier or MemberExpression.", left);
  }
  evaluateUpdateExpression(node) {
    const operator = node.operator;
    const argument = node.argument;
    const prefix = node.prefix;
    const increment = operator === "++" ? 1 : operator === "--" ? -1 : undefined;
    if (increment === undefined) {
      throw typeError(`Unsupported update operator '${operator}'.`, node);
    }
    const operand = (current) => {
      if (isOpaque(current)) {
        throw invalidData(`'${operator}' requires a data value.`, argument);
      }
      return coerceToNumber(current);
    };
    if (argument.type === "Identifier") {
      const name = argument.name;
      const current = this.scopes.get(name, argument);
      const update = (value) => {
        const before = operand(value);
        const next = before + increment;
        this.scopes.set(name, next, argument);
        return prefix ? next : before;
      };
      if (!(current instanceof Obj))
        return sync2(() => update(current));
      return map4(this.toPrimitive(current, "number", argument), update);
    }
    if (argument.type === "MemberExpression") {
      return this.modifyMember(argument, (current) => map4(this.toPrimitive(current, "number", argument), (primitive) => {
        const value = operand(primitive);
        const next = value + increment;
        return { write: true, next, result: prefix ? next : value };
      }));
    }
    throw typeError("Update target must be an Identifier or MemberExpression.", argument);
  }
  evaluateCallExpression(node) {
    const callee = node.callee;
    const self = this;
    return gen2(function* () {
      if (callee.type === "Super")
        throw unsupportedSyntax(callee.type, callee);
      const { callable, thisValue } = callee.type === "MemberExpression" ? yield* self.readMethod(callee) : { callable: yield* self.evaluateExpression(callee), thisValue: undefined };
      if (callable === OptionalShortCircuit)
        return OptionalShortCircuit;
      if ((callable === null || callable === undefined) && node.optional)
        return OptionalShortCircuit;
      const args = yield* self.evaluateCallArguments(node.arguments);
      return yield* self.call(callable, thisValue, args, node, callee);
    });
  }
  readMethod(node) {
    return map4(this.getMemberReference(node), (reference) => {
      if (reference === OptionalShortCircuit)
        return { callable: OptionalShortCircuit, thisValue: undefined };
      if (reference instanceof ToolReference)
        return { callable: reference, thisValue: undefined };
      if ("value" in reference)
        return { callable: reference.value, thisValue: undefined };
      return { callable: this.readReference(reference, node), thisValue: reference.receiver };
    });
  }
  call(callable, thisValue, args, node, callee) {
    const self = this;
    return gen2(function* () {
      if (callable instanceof ToolReference) {
        if (callable.path.length === 0) {
          throw typeError("The tools root is not callable.", callee ?? node);
        }
        return yield* self.createToolCallPromise(callable.path, args);
      }
      if (callable instanceof Fn)
        return yield* self.invokeFunction(callable, thisValue, args, node);
      if (callable instanceof Native) {
        return yield* self.native(() => callable.call(thisValue, args), node);
      }
      throw typeError(`${calleeDescription(callee) ?? "The called value"} is not a function.`, callee ?? node);
    });
  }
  native(body, node) {
    return provideService2(catchDefect2(suspend2(body), (defect) => die3(locate(defect, node))), CallSite, { node, depth: this.depth });
  }
  evaluateCallArguments(argNodes) {
    const self = this;
    return gen2(function* () {
      const args = [];
      for (const argNode of argNodes) {
        if (argNode.type === "SpreadElement") {
          const spread = yield* self.evaluateExpression(argNode.argument);
          const cursor = yield* self.iterate(spread, argNode);
          if (cursor === undefined)
            throw typeError("Spread arguments require a synchronous iterable.", argNode);
          while (true) {
            const step = yield* cursor.next;
            if (step.done)
              break;
            args.push(step.value);
          }
        } else {
          args.push(yield* self.evaluateExpression(argNode));
        }
      }
      return args;
    });
  }
  invokeFunction(fn, thisValue, args, node) {
    const self = this;
    return flatMap2(CallSite, (site) => {
      const depth = Math.max(self.depth, site.depth) + 1;
      if (depth > MAX_CALL_DEPTH)
        throw rangeError("Maximum call stack size exceeded", node);
      const invocation = new Frame(this.ctx, new ScopeStack([...fn.capturedScopes, new Map]), depth);
      const paramScope = invocation.scopes.current();
      if (!fn.arrow)
        paramScope.set("this", { mutable: false, value: thisValue, initialized: true });
      if (!fn.arrow && usesArguments(fn)) {
        paramScope.set("arguments", {
          mutable: true,
          value: new Arguments(self.ctx.builtins.Object, args),
          initialized: true
        });
      }
      for (const parameter of fn.parameters) {
        for (const name of collectPatternNames(parameter)) {
          paramScope.set(name, { mutable: true, value: undefined, initialized: false });
        }
      }
      const parameters = fn.parameters.map((parameter) => parameter.type === "Identifier" ? parameter.name : undefined);
      const bind = gen2(function* () {
        for (const [index, parameter] of fn.parameters.entries()) {
          if (parameter.type === "RestElement") {
            yield* invocation.declarePattern(parameter.argument, new Arr(self.ctx.builtins.Array, args.slice(index)), true, parameter, true);
            break;
          }
          if (parameter.type === "Identifier" && parameters.lastIndexOf(parameter.name) !== index)
            continue;
          yield* invocation.declarePattern(parameter, args[index], true, parameter, true);
        }
      });
      const body = gen2(function* () {
        if (fn.body.type === "BlockStatement") {
          invocation.scopes.push();
          invocation.hoistVars(fn.body.body, paramScope);
          const result = yield* invocation.evaluateStatement(fn.body);
          return result.kind === "return" ? result.value : undefined;
        }
        return yield* invocation.evaluateExpression(fn.body);
      });
      if (fn.generator)
        return map4(bind, () => this.createGenerator(invocation, body, fn));
      const run = andThen2(bind, body);
      if (!fn.async)
        return run;
      return this.ctx.pending.createWithSelf((self) => flatMap2(run, (value) => resolvePromiseValue(invocation.ctx, value, self)));
    });
  }
  createGenerator(invocation, run, fn) {
    const asynchronous = fn.async;
    const state = { started: false, completed: false, draining: false, pending: [], pendingIndex: 0 };
    invocation.generatorState = state;
    invocation.generatorAsync = asynchronous;
    const builtins = this.ctx.builtins;
    const result = (value, done) => record2(builtins.Object, { value, done });
    const turn = this.ctx.pending.turn;
    const request = (kind, value) => {
      const request = { kind, value, response: makeUnsafe2() };
      const answer = suspend2(() => isDoneUnsafe(request.response) ? _await(request.response) : turn.leave(_await(request.response)));
      if (!asynchronous && state.active)
        return die3(typeError("Generator is already running."));
      if (asynchronous && (state.completed || !state.started && kind !== "next")) {
        state.started = true;
        state.completed = true;
        state.pending.push(request);
        if (state.draining)
          return answer;
        state.draining = true;
        return andThen2(this.ctx.pending.fork(invocation.completeGeneratorRequests(state, true).pipe(ensuring2(sync2(() => state.draining = false)))), answer);
      }
      if (state.completed) {
        if (kind === "throw")
          return fail5(new Throw(value));
        return succeed5(result(kind === "return" ? value : undefined, true));
      }
      if (!state.started && kind !== "next") {
        state.completed = true;
        if (kind === "throw")
          return fail5(new Throw(value));
        return succeed5(result(value, true));
      }
      state.pending.push(request);
      if (state.available) {
        const available = state.available;
        state.available = undefined;
        return andThen2(turn.handOff(sync2(() => doneUnsafe(available, succeed4(undefined)))), answer);
      }
      if (!state.started) {
        state.started = true;
        const body = gen2(function* () {
          state.active = yield* invocation.takeGeneratorRequest(state);
          const exit = yield* exit2(run.pipe(flatMap2((result) => asynchronous ? invocation.awaitValue(result) : succeed5(result)), catch_2((error) => error instanceof GeneratorReturn ? asynchronous ? invocation.awaitValue(error.value) : succeed5(error.value) : fail5(error))));
          const active = state.active;
          state.active = undefined;
          if (active) {
            doneUnsafe(active.response, isSuccess3(exit) ? succeed4(result(exit.value, true)) : exit);
          }
          yield* invocation.completeGeneratorRequests(state, asynchronous);
          state.completed = true;
        });
        return andThen2(this.ctx.pending.fork(body), answer);
      }
      return answer;
    };
    const proto = get2(fn, "prototype");
    return new GeneratorObj(proto instanceof Obj ? proto : builtins.Generator, asynchronous, request);
  }
  completeGeneratorRequests(state, asynchronous) {
    const self = this;
    const result = (value, done) => record2(self.ctx.builtins.Object, { value, done });
    return gen2(function* () {
      while (true) {
        const pending = self.dequeueGeneratorRequest(state);
        if (!pending)
          return;
        if (pending.kind === "throw") {
          doneUnsafe(pending.response, fail4(new Throw(pending.value)));
          continue;
        }
        if (asynchronous && pending.kind === "return") {
          const resolved = yield* exit2(self.awaitValue(pending.value));
          doneUnsafe(pending.response, isSuccess3(resolved) ? succeed4(result(resolved.value, true)) : resolved);
          continue;
        }
        doneUnsafe(pending.response, succeed4(result(pending.kind === "return" ? pending.value : undefined, true)));
      }
    });
  }
  takeGeneratorRequest(state) {
    const next = this.dequeueGeneratorRequest(state);
    if (next)
      return succeed5(next);
    state.available = makeUnsafe2();
    return andThen2(this.ctx.pending.turn.park(_await(state.available)), sync2(() => this.dequeueGeneratorRequest(state)));
  }
  dequeueGeneratorRequest(state) {
    const request = state.pending[state.pendingIndex];
    if (!request)
      return;
    state.pendingIndex += 1;
    if (state.pendingIndex === state.pending.length) {
      state.pending = [];
      state.pendingIndex = 0;
    }
    return request;
  }
  evaluateYieldExpression(node) {
    const argument = node.argument;
    const self = this;
    return gen2(function* () {
      if (!self.generatorState)
        throw typeError("yield is only valid inside a generator.", node);
      if (node.delegate) {
        const value = argument ? yield* self.evaluateExpression(argument) : undefined;
        return yield* self.delegateYield(value, node);
      }
      const value = argument ? yield* self.evaluateExpression(argument) : undefined;
      const yielded = self.generatorAsync ? yield* self.awaitValue(value) : value;
      return yield* self.suspendGenerator(yielded, node);
    });
  }
  suspendGenerator(value, node) {
    const state = this.generatorState;
    if (!state?.active)
      throw typeError("Generator has no active request.", node);
    doneUnsafe(state.active.response, succeed4(record2(this.ctx.builtins.Object, { value, done: false })));
    state.active = undefined;
    return flatMap2(this.takeGeneratorRequest(state), (request) => {
      state.active = request;
      if (request.kind === "next")
        return succeed5(request.value);
      if (request.kind === "throw")
        return fail5(new Throw(request.value));
      return this.generatorAsync ? flatMap2(this.awaitValue(request.value), (value) => fail5(new GeneratorReturn(value))) : fail5(new GeneratorReturn(request.value));
    });
  }
  delegateYield(value, node) {
    const self = this;
    return gen2(function* () {
      const cursor = self.builtinCursor(value);
      if (cursor !== undefined) {
        while (true) {
          const step = yield* cursor.next;
          if (step.done)
            return;
          const resumed = yield* exit2(self.suspendGenerator(self.generatorAsync ? yield* self.awaitValue(step.value) : step.value, node));
          if (isSuccess3(resumed))
            continue;
          const error = squash(resumed.cause);
          if (error instanceof GeneratorReturn) {
            yield* cursor.close;
            return yield* fail5(error);
          }
          if (error instanceof Throw) {
            yield* cursor.close;
            throw typeError("The delegated iterator does not provide a throw() method.", node);
          }
          return yield* failCause3(resumed.cause);
        }
      }
      const iterator = yield* self.customIterator(value, node, self.generatorAsync);
      if (!iterator)
        throw typeError("yield* requires a compatible iterable value.", node);
      let kind = "next";
      let input = undefined;
      while (true) {
        const method = kind === "next" ? iterator.next : get2(iterator.iterator, kind);
        if (method === undefined || method === null) {
          if (kind === "return")
            return yield* fail5(new GeneratorReturn(input));
          yield* self.closeIterator(iterator, node, self.generatorAsync);
          throw typeError("The delegated iterator does not provide a throw() method.", node);
        }
        const called = yield* self.call(self.requireIteratorMethod(method, `Iterator ${kind}`, node), iterator.iterator, [input], node);
        const result = self.requireIteratorObject(iterator.asynchronous ? yield* self.awaitValue(called) : called, `Iterator ${kind}() result`, node);
        const done = Boolean(get2(result, "done"));
        const resultValue = self.generatorAsync && !iterator.asynchronous ? yield* self.awaitAsyncFromSyncValue(iterator, get2(result, "value"), node, kind !== "return" && !done) : get2(result, "value");
        if (done) {
          if (kind === "return")
            return yield* fail5(new GeneratorReturn(resultValue));
          return resultValue;
        }
        const resumed = yield* exit2(self.suspendGenerator(resultValue, node));
        if (isSuccess3(resumed)) {
          kind = "next";
          input = resumed.value;
          continue;
        }
        const error = squash(resumed.cause);
        if (!(error instanceof GeneratorReturn) && !(error instanceof Throw)) {
          return yield* failCause3(resumed.cause);
        }
        kind = error instanceof GeneratorReturn ? "return" : "throw";
        input = error.value;
      }
    });
  }
  evaluateObjectExpression(node) {
    const objectValue = new Obj(this.ctx.builtins.Object);
    const self = this;
    return gen2(function* () {
      for (const property of node.properties) {
        if (property.type === "SpreadElement") {
          const spread = yield* self.evaluateExpression(property.argument);
          if (spread === null || spread === undefined)
            continue;
          assign2(objectValue, enumerableSource(self.ctx, "Object spread", spread, property));
          continue;
        }
        if (property.kind !== "init") {
          throw typeError("Only init object properties are supported.", property);
        }
        const keyNode = property.key;
        let key;
        if (property.computed) {
          key = yield* self.toPropertyKey(yield* self.evaluateExpression(keyNode), keyNode);
        } else if (keyNode.type === "Identifier") {
          key = keyNode.name;
        } else if (keyNode.type === "Literal") {
          key = propertyKey2(literal2(keyNode));
        } else {
          throw typeError("Unsupported object property key shape.", keyNode);
        }
        const name = key === IteratorSymbol ? "[Symbol.iterator]" : key === AsyncIteratorSymbol ? "[Symbol.asyncIterator]" : String(key);
        define(objectValue, key, yield* self.evaluateNamed(property.value, name));
      }
      return objectValue;
    });
  }
  evaluateArrayExpression(node) {
    const values = [];
    const self = this;
    return gen2(function* () {
      for (const element of node.elements) {
        if (element === null) {
          values.length += 1;
          continue;
        }
        if (element.type === "SpreadElement") {
          const spread = yield* self.evaluateExpression(element.argument);
          const cursor = yield* self.iterate(spread, element);
          if (cursor === undefined)
            throw typeError("Array spread requires a synchronous iterable.", element);
          while (true) {
            const step = yield* cursor.next;
            if (step.done)
              break;
            values.push(step.value);
          }
        } else {
          values.push(yield* self.evaluateExpression(element));
        }
      }
      return new Arr(self.ctx.builtins.Array, values);
    });
  }
  evaluateTemplateLiteral(node) {
    const quasis = node.quasis;
    const expressions = node.expressions;
    let output = "";
    const self = this;
    return gen2(function* () {
      for (let index = 0;index < quasis.length; index += 1) {
        const quasi = quasis[index];
        if (typeof quasi.value.cooked !== "string") {
          throw typeError("Invalid template literal quasi.", quasi);
        }
        output += quasi.value.cooked;
        checkStringLength(output.length);
        if (index < expressions.length) {
          const raw = yield* self.evaluateExpression(expressions[index]);
          output += coerceToString(yield* self.toPrimitive(raw, "string", expressions[index]));
          checkStringLength(output.length);
        }
      }
      return output;
    });
  }
  evaluateTaggedTemplate(node) {
    const self = this;
    return gen2(function* () {
      const { callable, thisValue } = node.tag.type === "MemberExpression" ? yield* self.readMethod(node.tag) : { callable: yield* self.evaluateExpression(node.tag), thisValue: undefined };
      const strings = self.ctx.templates.get(node) ?? self.createTemplateObject(node);
      const values = yield* forEach2(node.quasi.expressions, (expression) => self.evaluateExpression(expression));
      return yield* self.call(callable, thisValue, [strings, ...values], node, node.tag);
    });
  }
  createTemplateObject(node) {
    const array = this.ctx.builtins.Array;
    const strings = new Arr(array, node.quasi.quasis.map((quasi) => quasi.value.cooked ?? undefined));
    define(strings, "raw", new Arr(array, node.quasi.quasis.map((quasi) => quasi.value.raw)), frozen);
    this.ctx.templates.set(node, strings);
    return strings;
  }
  evaluateConditionalExpression(node) {
    return flatMap2(this.evaluateExpression(node.test), (test) => this.evaluateExpression(test ? node.consequent : node.alternate));
  }
  getMemberReference(node) {
    const objectNode = node.object;
    const propertyNode = node.property;
    if (objectNode.type === "Super")
      throw unsupportedSyntax(objectNode.type, objectNode);
    if (propertyNode.type === "PrivateIdentifier")
      throw unsupportedSyntax(propertyNode.type, propertyNode);
    const self = this;
    return gen2(function* () {
      const objectValue = yield* self.evaluateExpression(objectNode);
      if (objectValue === OptionalShortCircuit)
        return OptionalShortCircuit;
      if ((objectValue === null || objectValue === undefined) && node.optional)
        return OptionalShortCircuit;
      const keyValue = !node.computed && propertyNode.type === "Identifier" ? propertyNode.name : yield* self.evaluateExpression(propertyNode);
      if (objectValue === null || objectValue === undefined) {
        throw typeError(`Cannot read properties of ${objectValue} (reading '${coerceToString(keyValue)}').`, objectNode);
      }
      const key = yield* self.toPropertyKey(keyValue, propertyNode);
      return self.resolveProperty(objectValue, key, objectNode, propertyNode);
    });
  }
  resolveProperty(objectValue, key, objectNode, propertyNode) {
    if (objectValue instanceof ToolReference) {
      if (typeof key !== "string") {
        throw typeError("Tool paths must use string property names.", propertyNode);
      }
      return new ToolReference([...objectValue.path, key]);
    }
    if (objectValue instanceof Obj)
      return { target: objectValue, key, receiver: objectValue };
    if (typeof objectValue === "string") {
      if (key === "length")
        return { value: objectValue.length };
      const index = typeof key === "symbol" ? undefined : parseArrayIndex(key);
      if (index !== undefined)
        return { value: objectValue[index] };
    }
    const proto = primitivePrototype(this.ctx.builtins, objectValue);
    if (proto !== undefined)
      return { target: proto, key, receiver: objectValue };
    if (objectValue === null || objectValue === undefined) {
      throw typeError(`Cannot read properties of ${objectValue} (reading '${String(key)}').`, objectNode);
    }
    throw typeError("Cannot access a property on a non-object value.", objectNode);
  }
  destructuredProperty(source, key, node) {
    const reference = this.resolveProperty(source, key, node, node);
    if (reference instanceof ToolReference)
      return reference;
    if ("value" in reference)
      return reference.value;
    return this.readProperty(reference.target, reference.key, node, reference.receiver);
  }
  readReference(reference, node) {
    if (reference.target instanceof PromiseObj && !has(reference.target, reference.key)) {
      throw invalidData("This value is an un-awaited Promise; await it first - e.g. `const result = await tools.ns.tool(...)`.", node.object);
    }
    return this.readProperty(reference.target, reference.key, node, reference.receiver);
  }
  readProperty(target, key, node, receiver = target) {
    try {
      return get2(target, key, receiver);
    } catch (error) {
      throw locate(error, node);
    }
  }
  readMember(node) {
    return map4(this.getMemberReference(node), (reference) => {
      if (reference === OptionalShortCircuit)
        return OptionalShortCircuit;
      if (reference instanceof ToolReference)
        return reference;
      if ("value" in reference)
        return reference.value;
      return this.readReference(reference, node);
    });
  }
  writeMember(node, value) {
    return this.modifyMember(node, () => succeed5({ write: true, next: value, result: value }));
  }
  evaluateDeleteExpression(argument) {
    const target = argument.type === "ChainExpression" ? argument.expression : argument;
    if (target.type === "Identifier")
      throw typeError("Only data fields may be deleted.", argument);
    if (target.type !== "MemberExpression")
      return map4(this.evaluateExpression(target), () => true);
    return map4(this.getMemberReference(target), (reference) => {
      if (reference === OptionalShortCircuit)
        return true;
      if (reference instanceof ToolReference || "value" in reference || reference.receiver !== reference.target) {
        throw invalidData("Only data fields may be deleted.", target);
      }
      if (remove(reference.target, reference.key))
        return true;
      throw typeError(`Cannot delete property '${String(reference.key)}'.`, target);
    });
  }
  modifyMember(node, compute) {
    const self = this;
    return gen2(function* () {
      const reference = yield* self.getMemberReference(node);
      if (reference === OptionalShortCircuit || reference instanceof ToolReference || "value" in reference) {
        throw typeError("Only data fields may be assigned.", node);
      }
      if (reference.receiver !== reference.target) {
        throw typeError(`Cannot create property '${String(reference.key)}' on ${typeof reference.receiver} '${String(reference.receiver)}'.`, node);
      }
      const key = reference.key;
      const { write, next, result } = yield* compute(self.readReference(reference, node));
      if (write)
        self.assignToReference(reference.target, key, next, node);
      return result;
    });
  }
  assignToReference(target, key, next, node) {
    const written = (() => {
      try {
        rejectCircularInsertion(target, next, target instanceof Arr ? "Array assignment result" : "Object assignment result");
        return set(target, key, next);
      } catch (error) {
        throw locate(error, node);
      }
    })();
    if (written)
      return;
    throw typeError(`Cannot assign to read only property '${String(key)}'.`, node);
  }
  toPropertyKey(value, node) {
    if (!(value instanceof Obj))
      return succeed5(propertyKey2(value));
    return map4(this.toPrimitive(value, "string", node), propertyKey2);
  }
}

// ../node_modules/@opencode/codemode/dist/interpreter/execute.js
var executeProgram = (code, prepared, limits, hooks, globals) => {
  if (code.trim().length === 0) {
    return succeed5({
      ok: false,
      error: { kind: "ParseError", message: "Code cannot be empty." },
      toolCalls: []
    });
  }
  return suspend2(() => {
    const builtins = createBuiltins();
    const tools = make9(prepared, limits.maxToolCalls, hooks);
    const logs = [];
    const logged = () => logs.length > 0 ? { logs: [...logs] } : {};
    let returned;
    const base = acquireUseRelease2(make4("parallel"), (scope) => gen2(function* () {
      const program = parseProgram(code);
      const pending = new Pending(scope, builtins.Promise);
      const ctx = new Interpreter({ tools, pending, builtins, logs, globals });
      return yield* pending.turn.hold(gen2(function* () {
        const result = (yield* toBoundary(ctx, yield* ctx.run(program))) ?? null;
        returned = { value: result, pending };
        const warnings = yield* pending.interrupt();
        return {
          ok: true,
          value: result,
          ...warnings.length > 0 ? { warnings } : {},
          ...logged(),
          toolCalls: tools.calls
        };
      }));
    }), (scope, exit) => close(scope, exit));
    const timeoutMs = limits.timeoutMs;
    const operation = timeoutMs === undefined ? base : base.pipe(timeoutOrElse2({
      duration: timeoutMs,
      orElse: () => sync2(() => {
        if (returned === undefined) {
          return {
            ok: false,
            error: { kind: "TimeoutExceeded", message: `Execution timed out after ${timeoutMs}ms.` },
            ...logged(),
            toolCalls: tools.calls
          };
        }
        return {
          ok: true,
          value: returned.value,
          warnings: [
            {
              kind: "TimeoutExceeded",
              message: `The program returned, but background work was still running at the ${timeoutMs}ms timeout and was interrupted. Await all started promises.`
            },
            ...returned.pending.diagnostics()
          ],
          ...logged(),
          toolCalls: tools.calls
        };
      })
    }));
    return operation.pipe(catchCause2((cause) => hasInterruptsOnly2(cause) ? interrupt2 : succeed5({
      ok: false,
      error: normalizeError(squash(cause)),
      ...logged(),
      toolCalls: tools.calls
    })), map4((result) => limits.maxOutputBytes === undefined ? result : boundOutput(result, limits.maxOutputBytes)));
  });
};
var parseProgram = (code) => {
  return parse(code, {
    ecmaVersion: "latest",
    sourceType: "script",
    allowReturnOutsideFunction: true,
    allowAwaitOutsideFunction: true,
    locations: true
  });
};
var utf8ByteLength = (value) => new TextEncoder().encode(value).byteLength;
var utf8Truncate = (value, maxBytes) => {
  const bytes = new TextEncoder().encode(value);
  if (bytes.byteLength <= maxBytes)
    return value;
  const text = new TextDecoder("utf-8").decode(bytes.slice(0, Math.max(0, maxBytes)));
  return text.endsWith("�") ? text.slice(0, -1) : text;
};
var boundOutput = (result, maxOutputBytes) => {
  let truncated = false;
  let value = null;
  let valueBytes = 0;
  if (result.ok) {
    const serialized = JSON.stringify(result.value) ?? "null";
    const bytes = utf8ByteLength(serialized);
    if (bytes > maxOutputBytes) {
      truncated = true;
      value = `${utf8Truncate(serialized, maxOutputBytes)} [result truncated: ${bytes} bytes exceeds the ${maxOutputBytes}-byte output limit; return a smaller value]`;
      valueBytes = maxOutputBytes;
    } else {
      value = result.value;
      valueBytes = bytes;
    }
  }
  const warnings = result.ok ? result.warnings ?? [] : [];
  const keptWarnings = [];
  let warningBytes = 0;
  for (const warning of warnings) {
    const bytes = utf8ByteLength(JSON.stringify(warning)) + 1;
    if (warningBytes + bytes > maxOutputBytes)
      break;
    warningBytes += bytes;
    keptWarnings.push(warning);
  }
  if (keptWarnings.length < warnings.length) {
    truncated = true;
    keptWarnings.push({
      kind: "Truncated",
      message: `${warnings.length - keptWarnings.length} additional warnings omitted by the output limit.`
    });
  }
  const logs = result.logs ?? [];
  const kept = [];
  const logBudget = Math.max(0, maxOutputBytes - valueBytes);
  let logBytes = 0;
  for (const line of logs) {
    const lineBytes = utf8ByteLength(line) + 1;
    if (logBytes + lineBytes > logBudget)
      break;
    logBytes += lineBytes;
    kept.push(line);
  }
  if (kept.length < logs.length) {
    truncated = true;
    kept.push(`[logs truncated: showing ${kept.length} of ${logs.length} lines]`);
  }
  if (!truncated)
    return result;
  const warningsPart = keptWarnings.length > 0 ? { warnings: keptWarnings } : {};
  const logsPart = kept.length > 0 ? { logs: kept } : {};
  return result.ok ? {
    ok: true,
    value,
    ...warningsPart,
    ...logsPart,
    truncated: true,
    toolCalls: result.toolCalls
  } : { ok: false, error: result.error, ...logsPart, truncated: true, toolCalls: result.toolCalls };
};

// ../node_modules/@opencode/codemode/dist/interpreter/extensions.js
var extensionGlobals = (ctx, extensions) => {
  const builtins = ctx.builtins;
  const toHost = (value, label, depth = 0, seen = new Set) => {
    if (depth > MAX_VALUE_DEPTH)
      throw typeError(`${label} exceeds the maximum value depth of ${MAX_VALUE_DEPTH}.`);
    if (isPrimitive(value))
      return value;
    if (!(value instanceof Obj) || isOpaque(value)) {
      throw typeError(`${label} contains ${describeValue(value)}, which cannot be passed to an extension.`);
    }
    if (seen.has(value))
      throw typeError(`${label} contains a circular value.`);
    seen.add(value);
    const next = (item) => toHost(item, label, depth + 1, seen);
    if (value instanceof ErrorObj) {
      const name = coerceToString(get2(value, "name"));
      const message = get2(value, "message");
      const text = message === undefined ? "" : coerceToString(message);
      const copied = name === "AggregateError" ? new AggregateError([], text) : new (hostErrors.get(name) ?? Error)(text);
      for (const key of new Set(["cause", ...keys(value)])) {
        if (uncrossed.has(key) || !has(value, key))
          continue;
        const item = crossing(() => next(get2(value, key)));
        if (item === left)
          continue;
        Object.defineProperty(copied, key, {
          value: item,
          writable: true,
          configurable: true,
          enumerable: key !== "cause"
        });
      }
      seen.delete(value);
      return copied;
    }
    const copied = value.toHost(next);
    seen.delete(value);
    return copied;
  };
  const fromHost = (value, label, depth = 0, seen = new Set) => {
    if (depth > MAX_VALUE_DEPTH)
      throw typeError(`${label} exceeds the maximum value depth of ${MAX_VALUE_DEPTH}.`);
    if (isPrimitive(value))
      return value;
    if (typeof value === "function")
      return wrap(value, label);
    if (value !== null && typeof value === "object") {
      const next = (item, path) => fromHost(item, path, depth + 1, seen);
      if (value instanceof Date)
        return new DateObj(builtins.Date, value.getTime());
      if (value instanceof RegExp)
        return new RegExpObj(builtins.RegExp, value.source, value.flags);
      if (value instanceof Uint8Array)
        return new Bytes(builtins.Uint8Array, new Uint8Array(value));
      if (value instanceof ArrayBuffer)
        return new Bytes(builtins.Uint8Array, new Uint8Array(value.slice(0)));
      if (value instanceof Error) {
        if (seen.has(value))
          throw typeError(`${label} produced a circular value.`);
        seen.add(value);
        const copied = createErrorValue(builtins[isErrorType(value.name) ? value.name : "Error"], value.message);
        const fields = value;
        for (const key of new Set(["cause", ...Object.keys(value)])) {
          if (uncrossed.has(key) || !(key in value) || typeof fields[key] === "function")
            continue;
          const item = crossing(() => next(fields[key], `${label}.${key}`));
          if (item === left)
            continue;
          define(copied, key, item, key === "cause" ? hidden : undefined);
        }
        seen.delete(value);
        return copied;
      }
      if (value instanceof URL)
        return new URLObj(builtins.URL, builtins.URLSearchParams, new URL(value.href));
      if (value instanceof URLSearchParams) {
        return new URLSearchParamsObj(builtins.URLSearchParams, new URLSearchParams(value));
      }
      if (value instanceof Headers)
        return new HeadersObj(builtins.Headers, new Headers(value));
      if (value instanceof Map) {
        const wrapped = new MapObj(builtins.Map);
        for (const [key, item] of value)
          wrapped.map.set(next(key, label), next(item, label));
        return wrapped;
      }
      if (value instanceof Set) {
        const wrapped = new SetObj(builtins.Set);
        for (const item of value)
          wrapped.set.add(next(item, label));
        return wrapped;
      }
      if (seen.has(value))
        throw typeError(`${label} produced a circular value.`);
      seen.add(value);
      if (Array.isArray(value)) {
        const copied = new Arr(builtins.Array, value.map((item, index) => next(item, `${label}[${index}]`)));
        seen.delete(value);
        return copied;
      }
      const prototype = Object.getPrototypeOf(value);
      if (prototype === Object.prototype || prototype === null) {
        const copied = new Obj(builtins.Object);
        for (const [key, item] of Object.entries(value))
          define(copied, key, next(item, `${label}.${key}`));
        seen.delete(value);
        return copied;
      }
    }
    throw typeError(`${label} produced ${describeHost(value)}, which the program cannot hold.`);
  };
  const wrap = (value, label, describe) => fn2(builtins, value.name, value.length, (_, values) => {
    const args = values.map((item, index) => toHost(item, `Argument ${index + 1} to ${label}`));
    const hooks = ctx.tools.hooks;
    const settle = (run) => (describe === undefined ? run : hooked(describe(args), hooks["extension.before"], hooks["extension.after"], run)).pipe(mapError2((reason) => new Throw(fromHost(reason, label))), map4((settled) => fromHost(settled, label)));
    let result;
    try {
      result = value.apply(undefined, args);
    } catch (reason) {
      return settle(fail5(reason));
    }
    if (!(result instanceof Promise))
      return settle(succeed5(result));
    return ctx.pending.createHost(settle(tryPromise2({ try: () => result, catch: (reason) => reason })));
  });
  return extensions.flatMap((extension) => Object.entries(extension.globals).map(([name, value]) => [name, wrap(value, name, (args) => ({ extension: extension.name, name, args }))]));
};
var uncrossed = new Set(["stack", "constructor", "toString", "__proto__"]);
var left = Symbol("left behind");
var crossing = (convert) => {
  try {
    return convert();
  } catch (reason) {
    if (reason instanceof PendingThrow)
      return left;
    throw reason;
  }
};
var hostErrors = new Map([
  ["TypeError", TypeError],
  ["RangeError", RangeError],
  ["SyntaxError", SyntaxError],
  ["ReferenceError", ReferenceError],
  ["EvalError", EvalError],
  ["URIError", URIError]
]);
var isPrimitive = (value) => value === null || value === undefined || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
var describeHost = (value) => {
  if (typeof value !== "object" || value === null)
    return `a ${typeof value}`;
  const name = value.constructor?.name;
  return name === undefined || name === "" ? "an object" : `a ${name}`;
};

// ../node_modules/@opencode/codemode/dist/codemode.js
var Input = Struct({ code: String4 });
var DiagnosticKind = Literals([
  "ParseError",
  "UnsupportedSyntax",
  "UnknownTool",
  "InvalidToolInput",
  "InvalidToolOutput",
  "InvalidDataValue",
  "ToolCallLimitExceeded",
  "TimeoutExceeded",
  "ToolFailure",
  "ExecutionFailure",
  "Truncated"
]);
var Diagnostic = Struct({
  kind: DiagnosticKind,
  message: String4,
  location: optionalKey2(Struct({ line: Number5, column: Number5 })),
  suggestions: optionalKey2(ArraySchema(String4))
});
var ToolCallSchema = Struct({ name: String4 });
var Success = Struct({
  ok: Literal2(true),
  value: Json2,
  warnings: optionalKey2(ArraySchema(Diagnostic)),
  logs: optionalKey2(ArraySchema(String4)),
  truncated: optionalKey2(Boolean3),
  toolCalls: ArraySchema(ToolCallSchema)
});
var Failure = Struct({
  ok: Literal2(false),
  error: Diagnostic,
  logs: optionalKey2(ArraySchema(String4)),
  truncated: optionalKey2(Boolean3),
  toolCalls: ArraySchema(ToolCallSchema)
});
var Result = Union2([Success, Failure]);
var validateLimit = (name, value, minimum) => {
  if (value !== undefined && (!Number.isSafeInteger(value) || value < minimum)) {
    throw new RangeError(`${name} must be a safe integer greater than or equal to ${minimum}.`);
  }
  return value;
};
var resolveExecutionLimits = (limits) => ({
  timeoutMs: validateLimit("timeoutMs", limits?.timeoutMs, 1),
  maxToolCalls: validateLimit("maxToolCalls", limits?.maxToolCalls, 0),
  maxOutputBytes: validateLimit("maxOutputBytes", limits?.maxOutputBytes, 0)
});
var execute = (options) => make10(options).execute(options.code);
var make10 = (options = {}) => {
  const prepared = prepare(options.tools ?? {});
  const limits = resolveExecutionLimits(options.limits);
  const extensions = options.extensions ?? [];
  const bound = new Set(globalNames);
  for (const extension of extensions) {
    for (const name of Object.keys(extension.globals)) {
      if (bound.has(name))
        throw new TypeError(`Extension "${extension.name}" global "${name}" is already defined.`);
      bound.add(name);
    }
  }
  return {
    get catalog() {
      return prepared.catalog;
    },
    execute: (code) => executeProgram(code, prepared, limits, options.hooks ?? {}, (ctx) => extensionGlobals(ctx, extensions))
  };
};
// ../node_modules/@opencode/codemode/dist/openapi/spec.js
var methods2 = new Set(["get", "put", "post", "delete", "options", "head", "patch", "trace"]);
var ignoredHeaderParameters = new Set(["accept", "content-type", "authorization"]);
var projectionCaches = new WeakMap;
var directionalDocuments = new WeakMap;
var nestedSchemas = new Set([
  "items",
  "additionalProperties",
  "unevaluatedProperties",
  "propertyNames",
  "then",
  "else"
]);
var nestedSchemaLists = new Set(["anyOf", "oneOf", "prefixItems"]);
var nestedSchemaMaps = new Set(["patternProperties", "dependentSchemas", "$defs", "definitions"]);

// ../node_modules/@opencode/codemode/dist/openapi/runtime.js
var decodeJson = decodeUnknownOption2(fromJsonString2(Unknown2));
var maxResponseBodyBytes = 50 * 1024 * 1024;
// runtime.ts
var output = {
  type: "object",
  properties: {
    text: { type: "string", description: "What the direct tool call would have shown" },
    isError: { type: "boolean" },
    result: { description: "The tool's structured output" }
  },
  required: ["text", "isError", "result"]
};
var execute2 = (code, tools, call, signal) => runPromise2(execute({
  code,
  tools: Object.fromEntries(tools.map((tool) => [
    tool.name,
    make8({
      description: tool.description,
      input: { type: "object" },
      output,
      execute: (input) => tryPromise2(() => call(tool.name, input))
    })
  ])),
  limits: { maxToolCalls: 200, maxOutputBytes: 1e5 }
}), { signal });
export {
  execute2 as execute
};
