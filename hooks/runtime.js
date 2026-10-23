// node_modules/effect/dist/Pipeable.js
/**
* The `Pipeable` module defines the shared interface and implementation helpers
* for values that support Effect-style method chaining with `.pipe(...)`.
*
* A `Pipeable` value can pass itself through a sequence of unary functions from
* left to right, so code can be written as `value.pipe(f, g, h)` instead of
* deeply nesting calls. This is the method form used by many Effect data types
* to compose transformations, validations, and effectful operations while
* keeping the original value as the starting point of the pipeline.
*
* @since 2.0.0
*/
/**
* Applies a `pipe` method's variadic arguments to an initial value from left
* to right.
*
* **When to use**
*
* Use to implement a custom `.pipe(...)` method from JavaScript's `arguments`
* object.
*
* **Details**
*
* This helper is intended for implementing `Pipeable.pipe` methods that
* receive JavaScript's `arguments` object. With no functions it returns the
* original value; otherwise it feeds each result into the next function.
*
* **Example** (Implementing a pipe method)
*
* ```ts import.meta.vitest
* import { Pipeable } from "effect"
*
* class NumberBox {
*   constructor(readonly value: number) {}
*
*   pipe(..._fns: ReadonlyArray<(value: number) => number>): number {
*     return Pipeable.pipeArguments(this.value, arguments) as number
*   }
* }
*
* const result = new NumberBox(5).pipe(
*   (n) => n + 2,
*   (n) => n * 3
* )
* result // => 21
* ```
*
* @category combinators
* @since 2.0.0
*/
const pipeArguments = (self, args) => {
	switch (args.length) {
		case 0: return self;
		case 1: return args[0](self);
		case 2: return args[1](args[0](self));
		case 3: return args[2](args[1](args[0](self)));
		case 4: return args[3](args[2](args[1](args[0](self))));
		case 5: return args[4](args[3](args[2](args[1](args[0](self)))));
		case 6: return args[5](args[4](args[3](args[2](args[1](args[0](self))))));
		case 7: return args[6](args[5](args[4](args[3](args[2](args[1](args[0](self)))))));
		case 8: return args[7](args[6](args[5](args[4](args[3](args[2](args[1](args[0](self))))))));
		case 9: return args[8](args[7](args[6](args[5](args[4](args[3](args[2](args[1](args[0](self)))))))));
		default: {
			let ret = self;
			for (let i = 0, len = args.length; i < len; i++) ret = args[i](ret);
			return ret;
		}
	}
};
/**
* Reusable prototype that implements `Pipeable.pipe`.
*
* **When to use**
*
* Use when classes or object prototypes can reuse this value when they need the
* standard pipe implementation backed by `pipeArguments`.
*
* @category prototypes
* @since 3.15.0
*/
const Prototype$1 = { pipe() {
	return pipeArguments(this, arguments);
} };
/**
* Provides a base constructor whose instances implement the standard `Pipeable.pipe`
* method.
*
* **When to use**
*
* Use when you need to define a class that supports Effect-style method
* chaining through `.pipe(...)`.
*
* @category constructors
* @since 3.15.0
*/
const Class$1 = /*#__PURE__*/ function() {
	function PipeableBase() {}
	PipeableBase.prototype = Prototype$1;
	return PipeableBase;
}();
// node_modules/effect/dist/Function.js
/**
* Creates a function that can be called in data-first style or data-last
* (`pipe`-friendly) style.
*
* **When to use**
*
* Use to expose one implementation through both direct and `pipe`-friendly
* call styles.
*
* **Details**
*
* Pass either the arity of the uncurried function or a predicate that decides
* whether the current call is data-first. Arity is the common case. Use a
* predicate when optional arguments make arity ambiguous.
*
* **Example** (Selecting data-first or data-last style by arity)
*
* ```ts import.meta.vitest
* import { Function, pipe } from "effect"
*
* const sum = Function.dual<
*   (that: number) => (self: number) => number,
*   (self: number, that: number) => number
* >(2, (self, that) => self + that)
*
* sum(2, 3) // => 5
* pipe(2, sum(3)) // => 5
* ```
*
* **Example** (Defining overloads with call signatures)
*
* ```ts import.meta.vitest
* import { Function, pipe } from "effect"
*
* const sum: {
*   (that: number): (self: number) => number
*   (self: number, that: number): number
* } = Function.dual(2, (self: number, that: number): number => self + that)
*
* sum(2, 3) // => 5
* pipe(2, sum(3)) // => 5
* ```
*
* **Example** (Selecting data-first or data-last style with a predicate)
*
* ```ts import.meta.vitest
* import { Function, pipe } from "effect"
*
* const sum = Function.dual<
*   (that: number) => (self: number) => number,
*   (self: number, that: number) => number
* >(
*   (args) => args.length === 2,
*   (self, that) => self + that
* )
*
* sum(2, 3) // => 5
* pipe(2, sum(3)) // => 5
* ```
*
* @category combinators
* @since 2.0.0
*/
const dual = function(arity, body) {
	if (typeof arity === "function") return function() {
		return arity(arguments) ? body.apply(this, arguments) : (self) => body(self, ...arguments);
	};
	switch (arity) {
		case 0:
		case 1: throw new RangeError(`Invalid arity ${arity}`);
		case 2: return function(a, b) {
			if (arguments.length >= 2) return body(a, b);
			return function(self) {
				return body(self, a);
			};
		};
		case 3: return function(a, b, c) {
			if (arguments.length >= 3) return body(a, b, c);
			return function(self) {
				return body(self, a, b);
			};
		};
		default: return function() {
			if (arguments.length >= arity) return body.apply(this, arguments);
			const args = arguments;
			return function(self) {
				return body(self, ...args);
			};
		};
	}
};
/**
* Returns its input argument unchanged.
*
* **When to use**
*
* Use to return a value unchanged where a function is required.
*
* **Example** (Returning the same value)
*
* ```ts import.meta.vitest
* import { identity } from "effect"
*
* identity(5) // => 5
* ```
*
* @category combinators
* @since 2.0.0
*/
const identity = (a) => a;
/**
* Creates a zero-argument function that always returns the provided value.
*
* **When to use**
*
* Use when you need a thunk or callback that returns the same value on every
* invocation.
*
* **Example** (Creating a constant thunk)
*
* ```ts import.meta.vitest
* import { Function } from "effect"
*
* const constNull = Function.constant(null)
*
* constNull() // => null
* constNull() // => null
* ```
*
* @category constructors
* @since 2.0.0
*/
const constant = (value) => () => value;
/**
* Returns `true` when called.
*
* **When to use**
*
* Use when you need a thunk that returns `true` on every invocation.
*
* **Example** (Returning true from a thunk)
*
* ```ts import.meta.vitest
* import { Function } from "effect"
*
* Function.constTrue() // => true
* ```
*
* @category constants
* @since 2.0.0
*/
const constTrue = /*#__PURE__*/ constant(true);
/**
* Returns `undefined` when called.
*
* **When to use**
*
* Use when you need a thunk that returns `undefined` on every invocation.
*
* **Example** (Returning undefined from a thunk)
*
* ```ts import.meta.vitest
* import { Function } from "effect"
*
* Function.constUndefined() // => undefined
* ```
*
* @category constants
* @since 2.0.0
*/
const constUndefined = /*#__PURE__*/ constant(void 0);
/**
* Returns no meaningful value when called.
*
* **When to use**
*
* Use when you need a thunk that is called only for its effect and has no
* meaningful return value.
*
* **Example** (Returning void from a thunk)
*
* ```ts import.meta.vitest
* import { Function } from "effect"
*
* Function.constVoid() // => undefined
* ```
*
* @category constants
* @since 2.0.0
*/
const constVoid = constUndefined;
/**
* Creates a memoized function whose input is an object, caching results by
* object identity.
*
* **When to use**
*
* Use to reuse the result of a synchronous computation whose output is stable
* for a given object reference.
*
* **Details**
*
* Each memoized wrapper owns a private `WeakMap` keyed by object identity.
*
* **Gotchas**
*
* `undefined` is reserved to represent a cache miss and is therefore not
* supported as a return value.
*
* Structurally equal objects do not share cache entries. If the same object is
* mutated after its first call, later calls still return the cached result for
* that reference.
*
* @category caching
* @since 4.0.0
*/
function memoize(f) {
	const cache = /* @__PURE__ */ new WeakMap();
	return (a) => {
		const cached = cache.get(a);
		if (cached !== void 0) return cached;
		const result = f(a);
		cache.set(a, result);
		return result;
	};
}
/**
* Creates a memoized idempotent object transformation that caches both inputs
* and their outputs by object identity.
*
* **When to use**
*
* Use when an object transformation is idempotent and its output can be safely
* reused as a fixed point.
*
* **Details**
*
* After computing an input, the returned function caches both the input and
* the output. Calling it with either reference returns the output without
* invoking the supplied function again.
*
* **Gotchas**
*
* The returned function treats each computed output as a fixed point. If
* applying the supplied function to an output would produce an observably
* different value, this memoization changes that behavior.
*
* @see {@link memoize} for memoizing functions without an idempotence requirement
* @category caching
* @since 4.0.0
*/
function memoizeIdempotent(f) {
	const cache = /* @__PURE__ */ new WeakMap();
	return (a) => {
		const cached = cache.get(a);
		if (cached !== void 0) return cached;
		const result = f(a);
		cache.set(a, result);
		if (result !== a) cache.set(result, result);
		return result;
	};
}
// node_modules/effect/dist/internal/equal.js
/** @internal */
const getAllObjectKeys = (obj) => {
	const keys = new Set(Reflect.ownKeys(obj));
	if (obj.constructor === Object) return keys;
	if (obj instanceof Error) keys.delete("stack");
	const proto = Object.getPrototypeOf(obj);
	let current = proto;
	while (current !== null && current !== Object.prototype) {
		const ownKeys = Reflect.ownKeys(current);
		for (let i = 0; i < ownKeys.length; i++) keys.add(ownKeys[i]);
		current = Object.getPrototypeOf(current);
	}
	if (keys.has("constructor") && typeof obj.constructor === "function" && proto === obj.constructor.prototype) keys.delete("constructor");
	return keys;
};
/** @internal */
const byReferenceInstances = /*#__PURE__*/ new WeakSet();
/** @internal */
const viewBytes = (view) => new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
// node_modules/effect/dist/internal/hash.js
/**
* Back-edge count used to avoid caching entry-point-dependent hashes.
*
* @internal
*/
let backEdges = 0;
/** @internal */
const addBackEdge = () => {
	backEdges++;
};
// node_modules/effect/dist/Predicate.js
/**
* Defines runtime checks for values.
*
* A `Predicate<A>` returns `true` or `false` for an `A`. A
* `Refinement<A, B>` is a predicate that also narrows the TypeScript type when
* it succeeds. This module includes guards for common JavaScript values,
* property and tag checks, tuple and struct checks, boolean combinators, and
* helpers for composing predicates and refinements.
*
* @since 2.0.0
*/
/**
* Checks whether a value is a `string`.
*
* **When to use**
*
* Use when you need a `Predicate` guard to narrow an `unknown` value to a
* string.
*
* **Details**
*
* Uses `typeof input === "string"`.
*
* **Example** (Guarding strings)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* const data: unknown = "hi"
*
* if (Predicate.isString(data)) {
*   data.toUpperCase() // => "HI"
* }
* ```
*
* @see {@link isNumber}
* @see {@link isBoolean}
* @see {@link Refinement}
* @category guards
* @since 2.0.0
*/
function isString(input) {
	return typeof input === "string";
}
/**
* Checks whether a value is a `number`.
*
* **When to use**
*
* Use when you need a `Predicate` guard to narrow an `unknown` value to a
* number.
*
* **Details**
*
* Uses `typeof input === "number"` and does not exclude `NaN` or `Infinity`.
*
* **Example** (Guarding numbers)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* const data: unknown = 42
*
* if (Predicate.isNumber(data)) {
*   data + 1 // => 43
* }
* ```
*
* @see {@link isBigInt}
* @see {@link isString}
* @category guards
* @since 2.0.0
*/
function isNumber(input) {
	return typeof input === "number";
}
/**
* Checks whether a value is a `boolean`.
*
* **When to use**
*
* Use when you need a `Predicate` guard to narrow an `unknown` value to a
* boolean.
*
* **Details**
*
* Uses `typeof input === "boolean"`.
*
* **Example** (Guarding booleans)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* const data: unknown = true
*
* if (Predicate.isBoolean(data)) {
*   data ? "yes" : "no" // => "yes"
* }
* ```
*
* @see {@link isString}
* @see {@link isNumber}
* @category guards
* @since 2.0.0
*/
function isBoolean(input) {
	return typeof input === "boolean";
}
/**
* Checks whether a value is a `function`.
*
* **When to use**
*
* Use when you need a `Predicate` guard to narrow an `unknown` value to a
* callable function.
*
* **Details**
*
* Uses `typeof input === "function"`.
*
* **Example** (Guarding functions)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* const data: unknown = () => 1
*
* if (Predicate.isFunction(data)) {
*   data() // => 1
* }
* ```
*
* @see {@link isObjectKeyword}
* @category guards
* @since 2.0.0
*/
function isFunction(input) {
	return typeof input === "function";
}
/**
* Checks whether a value is not `null` and not `undefined`.
*
* **When to use**
*
* Use when you need a `Predicate` refinement that filters out nullish values
* but keeps other falsy ones.
*
* **Details**
*
* Uses `input != null`.
*
* **Example** (Filtering non-nullish values)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* const values = [0, null, "", undefined]
* const present = values.filter(Predicate.isNotNullish) // => [0, ""]
* ```
*
* @see {@link isNullish}
* @see {@link isNotNull}
* @see {@link isNotUndefined}
* @category guards
* @since 4.0.0
*/
function isNotNullish(input) {
	return input != null;
}
/**
* Type guard that always returns `true`.
*
* **When to use**
*
* Use when you need a `Predicate` that always accepts, e.g. as a placeholder.
*
* **Example** (Matching every value)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* Predicate.isUnknown(123) // => true
* ```
*
* @see {@link isNever}
* @category guards
* @since 2.0.0
*/
function isUnknown(_) {
	return true;
}
/**
* Checks whether a value is a non-null object value that is not an array.
*
* **When to use**
*
* Use to narrow unknown input to a non-null, non-array object with a
* `Predicate` guard.
*
* **Details**
*
* This is a structural runtime check using `typeof input === "object"`, so it
* also accepts object instances such as `Date`, `Map`, class instances, and
* typed arrays. It excludes `null` and arrays.
*
* **Example** (Guarding objects)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* Predicate.isObject({ a: 1 }) // => true
* Predicate.isObject([1, 2]) // => false
* ```
*
* @see {@link isObjectOrArray}
* @see {@link isReadonlyObject}
* @category guards
* @since 2.0.0
*/
function isObject(input) {
	return typeof input === "object" && input !== null && !Array.isArray(input);
}
/**
* Checks whether a value is an `object` in the JavaScript sense (objects, arrays, functions).
*
* **When to use**
*
* Use when you need a `Predicate` guard that accepts arrays and functions as
* well as objects.
*
* **Details**
*
* Returns `true` for arrays and functions, and `false` for `null`.
*
* **Example** (Checking object keywords)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* Predicate.isObjectKeyword(() => 1) // => true
* Predicate.isObjectKeyword(null) // => false
* ```
*
* @see {@link isObject}
* @see {@link isObjectOrArray}
* @category guards
* @since 4.0.0
*/
function isObjectKeyword(input) {
	return typeof input === "object" && input !== null || isFunction(input);
}
/**
* Checks whether a value has a given property key.
*
* **When to use**
*
* Use when you need a `Predicate` guard for property access on `unknown`
* values with a simple structural object check.
*
* **Details**
*
* Uses the `in` operator and `isObjectKeyword`. This does not check property
* value types.
*
* **Example** (Guarding object properties)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* const hasName = Predicate.hasProperty("name")
* const data: unknown = { name: "Ada" }
*
* if (hasName(data)) {
*   data.name // => "Ada"
* }
* ```
*
* @see {@link isTagged}
* @see {@link isObjectKeyword}
* @category guards
* @since 2.0.0
*/
const hasProperty = /*#__PURE__*/ dual(2, (self, property) => isObjectKeyword(self) && property in self);
/**
* Checks whether a value is an `Error`.
*
* **When to use**
*
* Use when you need a `Predicate` guard for errors caught from unknown sources.
*
* **Details**
*
* Uses `instanceof Error`.
*
* **Example** (Guarding errors)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* const data: unknown = new Error("boom")
*
* Predicate.isError(data) // => true
* ```
*
* @see {@link isUnknown}
* @category guards
* @since 2.0.0
*/
function isError(input) {
	return input instanceof Error;
}
/**
* Checks whether a value is iterable.
*
* **When to use**
*
* Use when you need a `Predicate` guard before iterating an unknown value.
*
* **Details**
*
* Accepts strings as iterable and uses `hasProperty` for `Symbol.iterator`.
*
* **Example** (Guarding iterables)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* const data: unknown = [1, 2, 3]
*
* Predicate.isIterable(data) // => true
* ```
*
* @see {@link isSet}
* @see {@link isMap}
* @category guards
* @since 2.0.0
*/
function isIterable(input) {
	return hasProperty(input, Symbol.iterator) || isString(input);
}
// node_modules/effect/dist/Hash.js
/**
* Computes Effect hash values and defines the interface for objects that want
* to provide their own hash implementation. Hashes are small numeric
* fingerprints used by Effect data structures to bucket values quickly; they
* are not cryptographic digests and they are not proof that two values are
* equal. The module also includes helpers for primitive, structure, array, and
* reference-based hashes, plus functions for combining and optimizing numeric
* hash values.
*
* @since 2.0.0
*/
/**
* Defines the unique identifier used to identify objects that implement the Hash interface.
*
* **When to use**
*
* Use as the computed property key for the method that supplies a custom hash
* value on a `Hash` implementor.
*
* @see {@link Hash} for the interface implemented with this symbol
* @see {@link isHash} for checking whether a value implements `Hash`
* @see {@link hash} for computing hash values
*
* @category symbols
* @since 2.0.0
*/
const symbol$1 = "~effect/Hash";
/**
* Computes a hash value for any given value.
*
* **When to use**
*
* Use to compute an Effect hash for primitives, collections, and hashable
* objects.
*
* **Details**
*
* This function can hash primitives (numbers, strings, booleans, etc.) as well as
* objects, arrays, and other complex data structures. It automatically handles
* different types and provides a consistent hash value for equivalent inputs.
*
* **Gotchas**
*
* Objects being hashed must be treated as immutable after their first hash
* computation. Hash results are cached, so mutating an object after hashing will
* lead to stale cached values and broken hash-based operations. For mutable
* objects, implement a custom `Hash` interface that hashes the object reference
* rather than its content.
*
* **Example** (Hashing different values)
*
* ```ts import.meta.vitest
* import { Hash } from "effect"
*
* Hash.hash(42) === Hash.hash(42) // => true
* Hash.hash("hello") === Hash.hash("hello") // => true
* Hash.hash([1, 2, 3]) === Hash.hash([1, 2, 3]) // => true
* ```
*
* @category hashing
* @since 2.0.0
*/
const hash = (self) => {
	switch (typeof self) {
		case "number": return number$1(self);
		case "bigint": return string$1(self.toString(10));
		case "string": return string$1(self);
		case "function":
		case "object": if (self === null) break;
		else if (self instanceof Date) {
			if (Number.isNaN(self.getTime())) return string$1("Invalid Date");
			return string$1(self.toISOString());
		} else if (self instanceof RegExp) return string$1(self.toString());
		else {
			if (byReferenceInstances.has(self)) return random(self);
			const cached = hashCache.get(self);
			if (cached !== void 0) return cached;
			if (visitedObjects.has(self)) {
				addBackEdge();
				return string$1("[Circular]");
			}
			visitedObjects.add(self);
			const seen = backEdges;
			let h;
			try {
				if ("~effect/Hash" in self) h = self[symbol$1]();
				else if (typeof self === "function") h = random(self);
				else if (self instanceof DataView) h = array(viewBytes(self));
				else if (Array.isArray(self) || ArrayBuffer.isView(self)) h = array(self);
				else if (self instanceof Map) h = hashMap(self);
				else if (self instanceof Set) h = hashSet(self);
				else h = structure(self);
			} finally {
				visitedObjects.delete(self);
			}
			if (seen === backEdges) hashCache.set(self, h);
			return h;
		}
	}
	return optimize(mix(string$1(String(self))));
};
/**
* Generates a random hash value for an object and caches it.
*
* **When to use**
*
* Use to hash an object by reference identity instead of structural content.
*
* **Details**
*
* This function creates a random hash value for objects that don't have their own
* hash implementation. The hash value is cached using a WeakMap, so the same object
* will always return the same hash value during its lifetime.
*
* **Example** (Hashing objects by reference)
*
* ```ts import.meta.vitest
* import { Hash } from "effect"
*
* const obj1 = { a: 1 }
* const obj2 = { a: 1 }
*
* Hash.random(obj1) === Hash.random(obj1) // => true
*
* typeof Hash.random(obj2) // => "number"
* ```
*
* @category hashing
* @since 2.0.0
*/
const random = (self) => {
	if (!randomHashCache.has(self)) randomHashCache.set(self, optimize(Math.random() * 4294967296 | 0));
	return randomHashCache.get(self);
};
const mix = (h) => {
	h ^= h >>> 16;
	h = Math.imul(h, 2246822507);
	h ^= h >>> 13;
	h = Math.imul(h, 3266489909);
	return h ^ h >>> 16;
};
/**
* Combines two hash values into a single hash value.
*
* **When to use**
*
* Use to build a hash for a composite value by folding together hash values for
* its parts.
*
* **Details**
*
* Supports direct and pipeable usage. Argument order affects the result.
*
* **Example** (Combining hash values)
*
* ```ts import.meta.vitest
* import { Hash, pipe } from "effect"
*
* const hash1 = Hash.hash("hello")
* const hash2 = Hash.hash("world")
*
* const combined = Hash.combine(hash2)(hash1)
* combined === pipe(hash1, Hash.combine(hash2)) // => true
* ```
*
* @see {@link hash} for computing hash values from arbitrary inputs
* @see {@link structureKeys} for hashing selected object fields without manual combination
*
* @category hashing
* @since 2.0.0
*/
const combine = /*#__PURE__*/ dual(2, (self, b) => mix(Math.imul(self, 2654435761) + Math.imul(b, 2246822507)));
/**
* Applies bit manipulation techniques to optimize a hash value.
*
* **When to use**
*
* Use to improve the bit distribution of a raw numeric hash value.
*
* **Details**
*
* This function takes a hash value and applies bitwise operations to improve
* the distribution of hash values, reducing the likelihood of collisions.
*
* **Example** (Optimizing a hash value)
*
* ```ts import.meta.vitest
* import { Hash } from "effect"
*
* Hash.optimize(1234567890) // => 160826066
* ```
*
* @category hashing
* @since 2.0.0
*/
const optimize = (n) => n & 3221225471 | n >>> 1 & 1073741824;
const float64 = /*#__PURE__*/ new DataView(/*#__PURE__*/ new ArrayBuffer(8));
/**
* Computes a hash value for a number.
*
* **When to use**
*
* Use to hash a JavaScript number with Effect's numeric hash semantics.
*
* **Details**
*
* Int32 values hash to themselves. Other numbers hash from their IEEE-754 bits,
* with a canonical representation for `NaN`.
*
* **Example** (Hashing numbers)
*
* ```ts import.meta.vitest
* import { Hash } from "effect"
*
* Number.isInteger(Hash.number(42)) // => true
* Number.isInteger(Hash.number(3.14)) // => true
* Hash.number(NaN) === Hash.number(NaN) // => true
* Hash.number(Infinity) === Hash.number(Infinity) // => true
* Hash.number(100) === Hash.number(100) // => true
* ```
*
* @category hashing
* @since 2.0.0
*/
const number$1 = (n) => {
	const h = n | 0;
	if (h === n) return optimize(h);
	float64.setFloat64(0, n !== n ? NaN : n);
	return optimize(combine(float64.getInt32(0), float64.getInt32(4)));
};
/**
* Computes a hash value for a string using the djb2 algorithm.
*
* **When to use**
*
* Use when you need a string field to contribute to a custom structural hash
* implementation.
*
* **Details**
*
* This function implements a variation of the djb2 hash algorithm, which is
* known for its good distribution properties and speed. It processes each
* character of the string to produce a consistent hash value.
*
* **Example** (Hashing strings)
*
* ```ts import.meta.vitest
* import { Hash } from "effect"
*
* Hash.string("hello") // => 181380007
* Hash.string("world") // => 164394279
* Hash.string("") // => 5381
* Hash.string("test") === Hash.string("test") // => true
* ```
*
* @category hashing
* @since 2.0.0
*/
const string$1 = (str) => {
	let h = 5381, i = str.length;
	while (i) h = h * 33 ^ str.charCodeAt(--i);
	return optimize(h);
};
/**
* Computes a hash value for an object using only the specified keys.
*
* **When to use**
*
* Use to hash an object by a selected set of property keys.
*
* **Details**
*
* This function allows you to hash an object by considering only specific keys,
* which is useful when you want to create a hash based on a subset of an object's
* properties.
*
* **Example** (Hashing selected object keys)
*
* ```ts import.meta.vitest
* import { Hash } from "effect"
*
* const person = { name: "John", age: 30, city: "New York" }
*
* const hash1 = Hash.structureKeys(person, ["name", "age"])
* const hash2 = Hash.structureKeys(person, ["name", "city"])
*
* hash1 // => -731887653
* hash2 // => 148523102
*
* const person2 = { name: "John", age: 30, city: "Boston" }
* const hash3 = Hash.structureKeys(person2, ["name", "age"])
* hash1 === hash3 // => true
* ```
*
* @category hashing
* @since 2.0.0
*/
const structureKeys = (o, keys) => {
	let h = 12289;
	for (const key of keys) h ^= combine(hash(key), hash(o[key]));
	return optimize(h);
};
/**
* Computes a structural hash for an object using Effect's object key collection.
*
* **When to use**
*
* Use to hash an object from all structural keys collected by Effect.
*
* **Details**
*
* The hash is based on the object's structural keys and their values, including
* symbol keys and relevant prototype keys for non-plain objects.
*
* **Example** (Hashing object structures)
*
* ```ts import.meta.vitest
* import { Hash } from "effect"
*
* const obj1 = { name: "John", age: 30 }
* const obj2 = { name: "Jane", age: 25 }
* const obj3 = { name: "John", age: 30 }
*
* Hash.structure(obj1) // => -731887653
* Hash.structure(obj2) // => -222100417
* Hash.structure(obj3) // => -731887653
* Hash.structure(obj1) === Hash.structure(obj3) // => true
* ```
*
* @category hashing
* @since 2.0.0
*/
const structure = (o) => structureKeys(o, getAllObjectKeys(o));
const unordered = (seed, f) => (iter) => {
	let h = seed;
	for (const element of iter) h ^= f(element);
	return optimize(h);
};
/**
* Computes a hash value for an iterable by hashing all of its elements.
*
* **When to use**
*
* Use to hash the values yielded by an iterable with Effect hash semantics.
*
* **Details**
*
* Folds element hashes with {@link combine}, so order and length affect the
* result.
*
* **Gotchas**
*
* A hash is not an equality proof. Distinct inputs can still share a hash.
*
* **Example** (Hashing arrays)
*
* ```ts import.meta.vitest
* import { Hash } from "effect"
*
* const arr1 = [1, 2, 3]
* const arr2 = [1, 2, 3]
* const arr3 = [3, 2, 1]
*
* Hash.array(arr1) === Hash.array(arr2) // => true
* Hash.array(arr1) === Hash.array(arr3) // => false
* ```
*
* @see {@link hash} for the general-purpose hash dispatcher
*
* @category hashing
* @since 2.0.0
*/
const array = (arr) => {
	let h = 6151;
	for (const element of arr) h = combine(h, hash(element));
	return optimize(h);
};
const hashMap = /*#__PURE__*/ unordered(/*#__PURE__*/ string$1("Map"), ([k, v]) => combine(hash(k), hash(v)));
const setSeed = /*#__PURE__*/ string$1("Set");
const hashSet = /*#__PURE__*/ unordered(setSeed, (element) => combine(setSeed, hash(element)));
const randomHashCache = /*#__PURE__*/ new WeakMap();
const hashCache = /*#__PURE__*/ new WeakMap();
const visitedObjects = /*#__PURE__*/ new WeakSet();
// node_modules/effect/dist/Equal.js
/**
* Defines the unique string identifier for the `Equal` interface.
*
* **When to use**
*
* Use when you implement custom equality and need the computed property key for
* the equality method.
*
* **Details**
*
* This is a pure constant with no allocation or side effects.
*
* **Example** (Implementing Equal on a class)
*
* ```ts import.meta.vitest
* import { Equal, Hash } from "effect"
*
* class UserId implements Equal.Equal {
*   constructor(readonly id: string) {}
*
*   [Equal.symbol](that: Equal.Equal): boolean {
*     return that instanceof UserId && this.id === that.id
*   }
*
*   [Hash.symbol](): number {
*     return Hash.string(this.id)
*   }
* }
*
* Equal.equals(new UserId("1"), new UserId("1")) // => true
* Equal.equals(new UserId("1"), new UserId("2")) // => false
* ```
*
* @see {@link Equal} — the interface that uses this symbol
* @see {@link isEqual} — type guard for `Equal` implementors
* @category symbols
* @since 2.0.0
*/
const symbol = "~effect/Equal";
function equals$1() {
	if (arguments.length === 1) return (self) => compareBoth(self, arguments[0]);
	return compareBoth(arguments[0], arguments[1]);
}
function compareBoth(self, that) {
	if (self === that) return true;
	if (self == null || that == null) return false;
	const selfType = typeof self;
	if (selfType !== typeof that) return false;
	if (selfType === "number" && self !== self && that !== that) return true;
	if (selfType !== "object" && selfType !== "function") return false;
	if (byReferenceInstances.has(self) || byReferenceInstances.has(that)) return false;
	return compareObjects(self, that);
}
function compareObjects(self, that) {
	const depth = pathLeft.length;
	for (let i = depth; i-- > 0;) if (pathLeft[i] === self && pathRight[i] === that) return true;
	if (depth) return compareOnPath(self, that);
	let known = results.get(self);
	if (!known) results.set(self, known = /* @__PURE__ */ new WeakMap());
	let result = known.get(that);
	if (result === void 0) known.set(that, result = compareOnPath(self, that));
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
const pathLeft = [];
const pathRight = [];
const results = /*#__PURE__*/ new WeakMap();
function compareStructure(self, that) {
	if (hash(self) !== hash(that)) return false;
	else if (self instanceof Date) {
		if (!(that instanceof Date)) return false;
		const selfTime = self.getTime();
		const thatTime = that.getTime();
		return selfTime === thatTime || Number.isNaN(selfTime) && Number.isNaN(thatTime);
	} else if (self instanceof RegExp) return that instanceof RegExp && self.toString() === that.toString();
	const bothEquals = isEqual(self);
	if (bothEquals !== isEqual(that) || typeof self === "function" && !bothEquals) return false;
	else if (bothEquals) return self[symbol](that);
	else if (Array.isArray(self)) {
		if (!Array.isArray(that) || self.length !== that.length) return false;
		return compareArrays(self, that);
	} else if (ArrayBuffer.isView(self)) {
		const selfIsDataView = self instanceof DataView;
		if (!ArrayBuffer.isView(that) || self.byteLength !== that.byteLength || selfIsDataView !== that instanceof DataView) return false;
		if (selfIsDataView) return compareTypedArrays(viewBytes(self), viewBytes(that));
		return compareTypedArrays(self, that);
	} else if (self instanceof Map) {
		if (!(that instanceof Map) || self.size !== that.size) return false;
		return compareHashed(self, that, entryHash, equalEntries);
	} else if (self instanceof Set) {
		if (!(that instanceof Set) || self.size !== that.size) return false;
		return compareHashed(self, that, hash, compareBoth);
	}
	return compareRecords(self, that);
}
function compareArrays(self, that) {
	for (let i = 0; i < self.length; i++) if (!compareBoth(self[i], that[i])) return false;
	return true;
}
function compareTypedArrays(self, that) {
	if (self.length !== that.length) return false;
	for (let i = 0; i < self.length; i++) if (self[i] !== that[i]) return false;
	return true;
}
function compareRecords(self, that) {
	const selfKeys = getAllObjectKeys(self);
	const thatKeys = getAllObjectKeys(that);
	if (selfKeys.size !== thatKeys.size) return false;
	for (const key of selfKeys) if (!thatKeys.has(key) || !compareBoth(self[key], that[key])) return false;
	return true;
}
function compareHashed(self, that, hashOf, equivalent) {
	const groups = /* @__PURE__ */ new Map();
	for (const item of that) {
		const h = hashOf(item);
		const group = groups.get(h);
		if (group) group.push(item);
		else groups.set(h, [item]);
	}
	outer: for (const item of self) {
		const group = groups.get(hashOf(item));
		if (group) {
			for (let i = 0; i < group.length; i++) if (equivalent(item, group[i])) {
				group[i] = group[group.length - 1];
				group.pop();
				continue outer;
			}
		}
		return false;
	}
	return true;
}
const entryHash = (entry) => hash(entry[0]);
const equalEntries = (self, that) => compareBoth(self[0], that[0]) && compareBoth(self[1], that[1]);
/**
* Checks whether a value implements the {@link Equal} interface.
*
* **When to use**
*
* Use when you need generic utility code to distinguish `Equal` implementors
* from plain values before calling `[Equal.symbol]` directly.
*
* **Details**
*
* - Pure function, no side effects.
* - Returns `true` if and only if `u` has a property keyed by
*   {@link symbol}.
* - Acts as a TypeScript type guard, narrowing the input to {@link Equal}.
*
* **Example** (Checking Equal values)
*
* ```ts import.meta.vitest
* import { Equal, Hash } from "effect"
*
* class Token implements Equal.Equal {
*   constructor(readonly value: string) {}
*   [Equal.symbol](that: Equal.Equal): boolean {
*     return that instanceof Token && this.value === that.value
*   }
*   [Hash.symbol](): number {
*     return Hash.string(this.value)
*   }
* }
*
* Equal.isEqual(new Token("abc")) // => true
* Equal.isEqual({ x: 1 }) // => false
* Equal.isEqual(42) // => false
* ```
*
* @see {@link Equal} — the interface being checked
* @see {@link symbol} — the property key that signals `Equal` support
* @category guards
* @since 2.0.0
*/
const isEqual = (u) => hasProperty(u, symbol);
// node_modules/effect/dist/Redactable.js
/**
* Defines the symbol used to identify objects that implement the {@link Redactable}
* protocol.
*
* **When to use**
*
* Use as the property key when implementing the `Redactable` protocol.
*
* **Details**
*
* Add a method under this key to make an object redactable. The method receives
* the current `Context` and must return the replacement value. The symbol is
* registered globally via `Symbol.for("~effect/Redactable")`, so it is
* identical across multiple copies of the library at runtime.
*
* **Example** (Masking an API key)
*
* ```ts import.meta.vitest
* import { Context, Redactable } from "effect"
*
* class ApiKey {
*   constructor(readonly raw: string) {}
*
*   [Redactable.symbolRedactable](_ctx: Context.Context<never>) {
*     return this.raw.slice(0, 4) + "..."
*   }
* }
*
* Redactable.redact(new ApiKey("secret-key")) // => "secr..."
* ```
*
* @see {@link Redactable} for the interface this symbol belongs to
* @see {@link isRedactable} to check whether a value has this symbol
* @category symbols
* @since 3.10.0
*/
const symbolRedactable = /*#__PURE__*/ Symbol.for("~effect/Redactable");
/**
* Type guard that checks whether a value implements the {@link Redactable}
* interface.
*
* **When to use**
*
* Use to narrow an unknown value before calling redaction-specific helpers.
*
* @see {@link Redactable} for the interface being checked
* @see {@link redact} to apply redaction if the value is redactable
* @category guards
* @since 3.10.0
*/
const isRedactable = (u) => hasProperty(u, symbolRedactable);
/**
* Returns a redacted value if it implements {@link Redactable}, otherwise returns it
* unchanged.
*
* **When to use**
*
* Use as the general-purpose entry point for redaction when the input may
* or may not implement the redaction protocol.
*
* **Details**
*
* This function calls {@link isRedactable} and, when it returns `true`,
* delegates to {@link getRedacted}.
*
* **Gotchas**
*
* Redaction is not recursive. Nested redactable values inside the returned
* object are not automatically redacted.
*
* @see {@link isRedactable} to check before redacting
* @see {@link getRedacted} for the lower-level variant for known redactables
* @category destructors
* @since 3.10.0
*/
function redact(u) {
	if (isRedactable(u)) return getRedacted(u);
	return u;
}
/**
* Returns the result of calling `[symbolRedactable]` on a value that is
* already known to be {@link Redactable}.
*
* **When to use**
*
* Use when you need to read the redacted representation from a value already
* verified as `Redactable`.
*
* **Details**
*
* This function reads the current fiber's `Context` from the global fiber
* reference and passes it to the redaction method.
*
* **Gotchas**
*
* If no fiber is active, an empty `Context` is passed to the redaction method.
*
* @see {@link redact} for the higher-level variant that handles non-redactable values
* @see {@link isRedactable} for the type guard to verify before calling this
* @category destructors
* @since 4.0.0
*/
function getRedacted(redactable) {
	return redactable[symbolRedactable](globalThis["~effect/Fiber/currentFiber"]?.context ?? emptyContext$1);
}
/** @internal */
const currentFiberTypeId = "~effect/Fiber/currentFiber";
const emptyMap = /*#__PURE__*/ new Map();
const emptyContext$1 = {
	"~effect/Context": {},
	base: emptyMap,
	depth: 0,
	mapUnsafe: emptyMap,
	pipe() {
		return pipeArguments(this, arguments);
	}
};
// node_modules/effect/dist/Formatter.js
/**
* Formats JavaScript values into readable strings.
*
* `format` is intended for logs, diagnostics, and error messages. It handles
* primitives, objects, arrays, dates, regular expressions, maps, sets, class
* instances, errors, circular references, and redactable values. `formatJson`
* wraps JSON formatting with redaction and circular-reference handling, and the
* module also includes helpers for property keys, paths, and dates.
*
* @since 4.0.0
*/
/**
* Converts any JavaScript value into a human-readable string.
*
* **When to use**
*
* Use when you need to format arbitrary JavaScript values for debugging,
* logging, or error messages.
*
* **Details**
*
* - Output is **not** valid JSON; use {@link formatJson} when you need
*   parseable JSON.
* - Handles `BigInt`, `Symbol`, `Set`, `Map`, `Date`, `RegExp`, and class
*   instances that `JSON.stringify` cannot represent.
* - Circular references are shown as `"[Circular]"` instead of throwing.
* - Failures while inspecting a value are rendered as diagnostic placeholders instead of throwing.
* - Primitives: stringified naturally (`null`, `undefined`, `123`, `true`).
*   Strings are JSON-quoted.
* - Objects with a custom `toString` (not `Object.prototype.toString`):
*   `toString()` is called unless `ignoreToString` is `true`.
* - Errors with a `cause`: formatted as `"<message> (cause: <cause>)"`.
* - Iterables (`Set`, `Map`, etc.): formatted as
*   `ClassName([...elements])`.
* - Class instances: wrapped as `ClassName({...})`.
* - `Redactable` values are automatically redacted.
* - Arrays/objects with 0–1 entries are inline; larger ones are
*   pretty-printed when `space` is set.
* - `space` — indentation unit (number of spaces, or a string like
*   `"\t"`). Defaults to `0` (compact).
* - `ignoreToString` — skip calling `toString()`. Defaults to `false`.
*
* **Example** (Formatting compact output)
*
* ```ts import.meta.vitest
* import { Formatter } from "effect"
*
* Formatter.format({ a: 1, b: [2, 3] }) // => "{\"a\":1,\"b\":[2,3]}"
* ```
*
* **Example** (Pretty-printed output)
*
* ```ts import.meta.vitest
* import { Formatter } from "effect"
*
* const output = Formatter.format({ a: 1, b: [2, 3] }, { space: 2 })
* output // => "{\n  \"a\": 1,\n  \"b\": [\n    2,\n    3\n  ]\n}"
* ```
*
* **Example** (Handling circular references)
*
* ```ts import.meta.vitest
* import { Formatter } from "effect"
*
* const obj: any = { name: "loop" }
* obj.self = obj
* Formatter.format(obj) // => "{\"name\":\"loop\",\"self\":[Circular]}"
* ```
*
* @see {@link formatJson}
* @see {@link Formatter}
* @category formatting
* @since 2.0.0
*/
function format$1(input, options) {
	const space = options?.space ?? 0;
	const ancestors = /* @__PURE__ */ new WeakSet();
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
			if (typeof v === "object" && v !== null || typeof v === "function") ancestors.delete(v);
			return "[inspection threw]";
		}
	}
	function recurUnsafe(v, d = 0) {
		if (typeof v === "string") return JSON.stringify(v);
		if (typeof v === "number" || v == null || typeof v === "boolean" || typeof v === "symbol") return String(v);
		if (typeof v === "bigint") return String(v) + "n";
		if (typeof v === "object" || typeof v === "function") {
			if (ancestors.has(v)) return CIRCULAR;
			ancestors.add(v);
			let output;
			if (symbolRedactable in v) output = recur(getRedacted(v), d);
			else if (Array.isArray(v)) output = !gap || v.length <= 1 ? `[${v.map((x) => recur(x, d)).join(",")}]` : `[\n${ind(d + 1)}${v.map((x) => recur(x, d + 1)).join(",\n" + ind(d + 1))}\n${ind(d)}]`;
			else if (v instanceof Date) output = formatDate(v);
			else if (!options?.ignoreToString && hasProperty(v, "toString") && typeof v["toString"] === "function" && v["toString"] !== Object.prototype.toString && v["toString"] !== Array.prototype.toString) {
				const s = safeToString(v);
				output = v instanceof Error && v.cause !== void 0 ? `${s} (cause: ${recur(v.cause, d)})` : s;
			} else if (Symbol.iterator in v) output = `${v.constructor.name}(${recur(Array.from(v), d)})`;
			else {
				const keys = ownKeys(v);
				if (!gap || keys.length <= 1) {
					const body = `{${keys.map((k) => `${formatPropertyKey(k)}:${recur(safeGet(v, k), d)}`).join(",")}}`;
					output = wrap(v, body);
				} else {
					const body = `{\n${keys.map((k) => `${ind(d + 1)}${formatPropertyKey(k)}: ${recur(safeGet(v, k), d + 1)}`).join(",\n")}\n${ind(d)}}`;
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
const CIRCULAR = "[Circular]";
/**
* @internal
*/
function formatPropertyKey(name) {
	return typeof name === "string" ? JSON.stringify(name) : String(name);
}
/**
* Formats an array of property keys as a bracket-notation path string.
*
* @internal
*/
function formatPath(path) {
	return path.map((key) => `[${formatPropertyKey(key)}]`).join("");
}
/**
* Formats a `Date` as an ISO 8601 string, returning `"Invalid Date"` for
* invalid dates instead of throwing.
*
* @internal
*/
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
/**
* Stringifies a value to JSON safely, silently dropping circular references.
*
* **When to use**
*
* Use when you need valid JSON output, unlike `format`, and the input may
* contain circular references that should be silently omitted rather than
* throwing a `TypeError`.
*
* **Details**
*
* Uses `JSON.stringify` internally with a replacer that tracks the current
* object ancestry. Circular references are replaced with `undefined`, which
* omits them from object output. `Redactable` values are automatically redacted
* before serialization. `BigInt` values are stringified with an `n` suffix.
* `Error` instances without a `toJSON` property include their enumerable
* properties plus `name` and `message`. Errors with `toJSON` keep their custom
* representation. Other values follow standard `JSON.stringify` behavior. The
* `space` parameter controls indentation and defaults to `0`.
*
* **Gotchas**
*
* When the root input is `undefined`, a symbol, or a function, `formatJson`
* returns `"null"` instead of the `undefined` returned by `JSON.stringify`.
* Nested values retain standard `JSON.stringify` behavior.
*
* **Example** (Formatting compact JSON)
*
* ```ts import.meta.vitest
* import { Formatter } from "effect"
*
* Formatter.formatJson({ name: "Alice", age: 30 }) // => "{\"name\":\"Alice\",\"age\":30}"
* ```
*
* **Example** (Handling circular references)
*
* ```ts import.meta.vitest
* import { Formatter } from "effect"
*
* const obj: any = { name: "test" }
* obj.self = obj
* Formatter.formatJson(obj) // => "{\"name\":\"test\"}"
* ```
*
* **Example** (Pretty-printed JSON)
*
* ```ts import.meta.vitest
* import { Formatter } from "effect"
*
* const output = Formatter.formatJson({ name: "Alice", age: 30 }, { space: 2 })
* output // => "{\n  \"name\": \"Alice\",\n  \"age\": 30\n}"
* ```
*
* @see {@link format}
* @see {@link Formatter}
* @category serialization
* @since 4.0.0
*/
function formatJson(input, options) {
	const ancestors = [];
	return JSON.stringify(input, function(key, value) {
		const original = Object.getOwnPropertyDescriptor(this, key)?.value;
		const redacted = hasProperty(original, symbolRedactable) ? redact(original) : redact(value);
		if (typeof redacted === "bigint") return format$1(redacted);
		if (typeof redacted !== "object" || redacted === null) return redacted;
		const current = redacted instanceof Error && !hasProperty(redacted, "toJSON") ? {
			...redacted,
			name: redacted.name,
			message: redacted.message
		} : redacted;
		while (ancestors.length > 0 && ancestors[ancestors.length - 1] !== this) ancestors.pop();
		if (ancestors.includes(redacted)) return;
		ancestors.push(redacted);
		if (current !== redacted) ancestors.push(current);
		return current;
	}, options?.space) ?? "null";
}
// node_modules/effect/dist/Inspectable.js
/**
* Controls how values appear in logs and debugging output.
*
* Effect data types use `Inspectable` to provide stable string, JSON, and
* Node.js inspection output. This keeps custom values readable in logs, REPLs,
* test failures, and diagnostics. This module defines the Node inspect symbol,
* the `Inspectable` interface, safe conversion helpers, and shared prototype or
* class implementations for custom values.
*
* @since 2.0.0
*/
/**
* Defines the symbol used by Node.js for custom object inspection.
*
* **When to use**
*
* Use to implement Node.js custom inspection for a value.
*
* **Details**
*
* This symbol is recognized by Node.js's `util.inspect()` function and the REPL
* for custom object representation. When an object has a method with this symbol,
* it will be called to determine how the object should be displayed.
*
* **Example** (Defining custom Node inspection)
*
* ```ts import.meta.vitest
* import { Inspectable } from "effect"
*
* class CustomObject {
*   constructor(private value: string) {}
*
*   [Inspectable.NodeInspectSymbol]() {
*     return `CustomObject(${this.value})`
*   }
* }
*
* const obj = new CustomObject("hello")
* obj[Inspectable.NodeInspectSymbol]() // => "CustomObject(hello)"
* ```
*
* @category symbols
* @since 2.0.0
*/
const NodeInspectSymbol = /*#__PURE__*/ Symbol.for("nodejs.util.inspect.custom");
/**
* Converts a value to its structured inspection representation.
*
* **When to use**
*
* Use when you need the structured representation of an inspectable value
* without risking unhandled errors.
*
* **Details**
*
* This function applies redaction before extracting data from objects that
* implement `toJSON`, recursively processes arrays, and handles errors
* gracefully. Plain objects are returned unchanged, so the result is not
* guaranteed to be accepted by `JSON.stringify`; it may still contain values
* such as `BigInt`, functions, or circular references.
*
* @see {@link toStringUnknown} for converting unknown values to strings
*
* @category converting
* @since 4.0.0
*/
const toJson$1 = (input) => {
	try {
		input = redact(input);
		if (hasProperty(input, "toJSON") && isFunction(input["toJSON"]) && input["toJSON"].length === 0) return input.toJSON();
		else if (Array.isArray(input)) return input.map(toJson$1);
		return input;
	} catch {
		return "[toJSON threw]";
	}
};
/**
* A base prototype object that implements the {@link Inspectable} interface.
*
* **When to use**
*
* Use as a prototype for plain objects that should share standard inspectable behavior.
*
* **Details**
*
* This object provides default implementations for the {@link Inspectable} methods.
* It can be used as a prototype for objects that want to be inspectable,
* or as a mixin to add inspection capabilities to existing objects.
*
* **Example** (Using the base inspectable prototype)
*
* ```ts import.meta.vitest
* import { Inspectable } from "effect"
*
* // Use as prototype
* const myObject = Object.create(Inspectable.BaseProto)
* myObject.name = "example"
* myObject.value = 42
*
* myObject.toString() // => "\"[toJSON threw]\""
*
* // Or extend in a constructor
* function MyClass(this: any, name: string) {
*   this.name = name
* }
* MyClass.prototype = Object.create(Inspectable.BaseProto)
* MyClass.prototype.constructor = MyClass
* ```
*
* @category prototypes
* @since 2.0.0
*/
const BaseProto = {
	toJSON() {
		return toJson$1(this);
	},
	[NodeInspectSymbol]() {
		return this.toJSON();
	},
	toString() {
		return format$1(this.toJSON());
	}
};
// node_modules/effect/dist/internal/stackTraceLimit.js
/**
* Check if `Error.stackTraceLimit` is writable.
* Returns `false` if the property is frozen, non-writable, or `Error` is non-extensible.
*
* @internal
*/
const isStackTraceLimitWritable = () => {
	const desc = Object.getOwnPropertyDescriptor(Error, "stackTraceLimit");
	if (desc === void 0) return Object.isExtensible(Error);
	return Object.hasOwn(desc, "writable") ? desc.writable === true : desc.set !== void 0;
};
const canWriteStackTraceLimit = /*#__PURE__*/ isStackTraceLimitWritable();
/**
* Get the current `Error.stackTraceLimit` value.
* Returns `undefined` if the property doesn't exist.
*
* @internal
*/
const getStackTraceLimit = () => Error.stackTraceLimit;
/**
* Safely set `Error.stackTraceLimit` if possible, otherwise no-op.
*
* Accepts `undefined` so a value read via {@link getStackTraceLimit} can be
* restored faithfully.
*
* @internal
*/
const setStackTraceLimit = (value) => {
	if (canWriteStackTraceLimit) Error.stackTraceLimit = value;
};
// node_modules/effect/dist/Utils.js
/**
* Yields its wrapped value exactly once, then completes with the value sent
* back in.
*
* **When to use**
*
* Use to implement `[Symbol.iterator]()` on Effect-like types so they can be
* `yield*`-ed inside generator functions, such as `Effect.gen` and
* `Option.gen`.
*
* **Details**
*
* The first call to `next()` returns a fresh `{ value: self, done: false }`.
* Every subsequent call returns `{ value: a, done: true }` where `a` is the
* argument passed to `next()`. To keep `yield*` cheap, the completion result
* is the iterator itself rather than a new object, so only the iterator and
* the single yielded result are allocated per `yield*`.
*
* **Example** (Yielding a wrapped value in a generator)
*
* ```ts import.meta.vitest
* import { Utils } from "effect"
*
* const gen = new Utils.SingleShotGen<string, number>("hello")
*
* gen.next(0).value // => "hello"
*
* gen.next(42).value // => 42
* ```
*
* @see {@link Gen} for the type-level signature that relies on `SingleShotGen`
* @category constructors
* @since 2.0.0
*/
var SingleShotGen = class {
	constructor(self) {
		this.value = self;
		this.done = false;
	}
	/**
	* Yields the stored value once, then completes with the value sent back in.
	*
	* **When to use**
	*
	* Use to advance a `SingleShotGen` through its single yield and completion
	* step.
	*
	* @since 2.0.0
	*/
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
};
const pickInternalCall = () => {
	const InternalTypeId = "~effect/Utils/internal";
	const standard = { [InternalTypeId]: (body) => {
		return body();
	} };
	const forced = { [InternalTypeId]: (body) => {
		try {
			return body();
		} finally {}
	} };
	return getStackTraceLimit() !== 0 && standard[InternalTypeId](() => (/* @__PURE__ */ new Error()).stack)?.includes(InternalTypeId) === true ? standard[InternalTypeId] : forced[InternalTypeId];
};
/** @internal */
const internalCall = /*#__PURE__*/ pickInternalCall();
// node_modules/effect/dist/internal/record.js
/** @internal */
function assignProperty(self, key, value) {
	if (key === "__proto__") Object.defineProperty(self, key, {
		value,
		writable: true,
		enumerable: true,
		configurable: true
	});
	else self[key] = value;
}
/** @internal */
function assignProperties(self, source) {
	for (const key of Reflect.ownKeys(source)) if (Object.prototype.propertyIsEnumerable.call(source, key)) assignProperty(self, key, source[key]);
}
// node_modules/effect/dist/internal/core.js
/** @internal */
const EffectTypeId = `~effect/Effect`;
/** @internal */
const ExitTypeId = `~effect/Exit`;
const effectVariance = {
	_A: identity,
	_E: identity,
	_R: identity
};
/** @internal */
const identifier = `${EffectTypeId}/identifier`;
/** @internal */
const args = `${EffectTypeId}/args`;
/** @internal */
const evaluate = `${EffectTypeId}/evaluate`;
/** @internal */
const contA = `${EffectTypeId}/successCont`;
/** @internal */
const contE = `${EffectTypeId}/failureCont`;
/** @internal */
const contAll = `${EffectTypeId}/ensureCont`;
/** @internal */
const Yield = /*#__PURE__*/ Symbol.for("effect/Effect/Yield");
/** @internal */
const PipeInspectableProto = {
	pipe() {
		return pipeArguments(this, arguments);
	},
	toJSON() {
		return { ...this };
	},
	toString() {
		return format$1(this.toJSON(), {
			ignoreToString: true,
			space: 2
		});
	},
	[NodeInspectSymbol]() {
		return this.toJSON();
	}
};
/** @internal */
const EffectProto = {
	[EffectTypeId]: effectVariance,
	...PipeInspectableProto,
	[Symbol.iterator]() {
		return new SingleShotGen(this);
	},
	toJSON() {
		return {
			_id: "Effect",
			op: this[identifier],
			..."~effect/Effect/args" in this ? { args: this[args] } : void 0
		};
	}
};
/** @internal */
const isEffect$1 = (u) => hasProperty(u, EffectTypeId);
/** @internal */
const isExit = (u) => hasProperty(u, ExitTypeId);
/** @internal */
const CauseTypeId = "~effect/Cause";
/** @internal */
const CauseReasonTypeId = "~effect/Cause/Reason";
/** @internal */
const isCause = (self) => hasProperty(self, CauseTypeId);
/** @internal */
var CauseImpl = class {
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
		return `Cause(${format$1(this.reasons)})`;
	}
	[NodeInspectSymbol]() {
		return this.toJSON();
	}
	[symbol](that) {
		return isCause(that) && this.reasons.length === that.reasons.length && this.reasons.every((e, i) => equals$1(e, that.reasons[i]));
	}
	[symbol$1]() {
		return array(this.reasons);
	}
};
const annotationsMap = /*#__PURE__*/ new WeakMap();
/** @internal */
var ReasonBase = class {
	[CauseReasonTypeId];
	annotations;
	_tag;
	constructor(_tag, annotations, originalError) {
		this[CauseReasonTypeId] = CauseReasonTypeId;
		this._tag = _tag;
		if (annotations !== constEmptyAnnotations && typeof originalError === "object" && originalError !== null && annotations.size > 0) {
			const prevAnnotations = annotationsMap.get(originalError);
			if (prevAnnotations) annotations = new Map([...prevAnnotations, ...annotations]);
			annotationsMap.set(originalError, annotations);
		}
		this.annotations = annotations;
	}
	annotate(annotations, options) {
		if (annotations.mapUnsafe.size === 0) return this;
		const newAnnotations = new Map(this.annotations);
		annotations.mapUnsafe.forEach((value, key) => {
			if (options?.overwrite !== true && newAnnotations.has(key)) return;
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
		return format$1(this);
	}
	[NodeInspectSymbol]() {
		return this.toString();
	}
};
/** @internal */
const constEmptyAnnotations = /*#__PURE__*/ new Map();
/** @internal */
var Fail = class extends ReasonBase {
	constructor(error, annotations = constEmptyAnnotations) {
		super("Fail", annotations, error);
		this.error = error;
	}
	toString() {
		return `Fail(${format$1(this.error)})`;
	}
	toJSON() {
		return {
			_tag: "Fail",
			error: this.error
		};
	}
	[symbol](that) {
		return isFailReason$1(that) && equals$1(this.error, that.error) && equals$1(this.annotations, that.annotations);
	}
	[symbol$1]() {
		return combine(string$1(this._tag))(combine(hash(this.error))(hash(this.annotations)));
	}
};
/** @internal */
const causeFromReasons = (reasons) => new CauseImpl(reasons);
const dedupeReasons = (self, that) => {
	const buckets = /* @__PURE__ */ new Map();
	const out = [];
	for (const reason of self.concat(that)) {
		const hash$2 = hash(reason);
		const bucket = buckets.get(hash$2);
		if (bucket === void 0) buckets.set(hash$2, [reason]);
		else if (bucket.some((previous) => equals$1(previous, reason))) continue;
		else bucket.push(reason);
		out.push(reason);
	}
	return out;
};
/** @internal */
const causeCombine = /*#__PURE__*/ dual(2, (self, that) => {
	if (self.reasons.length === 0) return that;
	else if (that.reasons.length === 0) return self;
	const newCause = new CauseImpl(dedupeReasons(self.reasons, that.reasons));
	return equals$1(self, newCause) ? self : newCause;
});
/** @internal */
const causeFail = (error) => new CauseImpl([new Fail(error)]);
/** @internal */
var Die = class extends ReasonBase {
	constructor(defect, annotations = constEmptyAnnotations) {
		super("Die", annotations, defect);
		this.defect = defect;
	}
	toString() {
		return `Die(${format$1(this.defect)})`;
	}
	toJSON() {
		return {
			_tag: "Die",
			defect: this.defect
		};
	}
	[symbol](that) {
		return isDieReason(that) && equals$1(this.defect, that.defect) && equals$1(this.annotations, that.annotations);
	}
	[symbol$1]() {
		return combine(string$1(this._tag))(combine(hash(this.defect))(hash(this.annotations)));
	}
};
/** @internal */
const causeDie = (defect) => new CauseImpl([new Die(defect)]);
/** @internal */
const causeAnnotate = /*#__PURE__*/ dual((args) => isCause(args[0]), (self, annotations, options) => {
	if (annotations.mapUnsafe.size === 0) return self;
	return new CauseImpl(self.reasons.map((f) => f.annotate(annotations, options)));
});
/** @internal */
const isFailReason$1 = (self) => self._tag === "Fail";
/** @internal */
const isDieReason = (self) => self._tag === "Die";
/** @internal */
const isInterruptReason$1 = (self) => self._tag === "Interrupt";
function defaultEvaluate(_fiber) {
	return exitDie(`Effect.evaluate: Not implemented`);
}
/** @internal */
const makePrimitiveProto = (options) => ({
	...EffectProto,
	[identifier]: options.op,
	[evaluate]: options["~effect/Effect/evaluate"] ?? defaultEvaluate,
	[contA]: options[contA],
	[contE]: options[contE],
	[contAll]: options[contAll]
});
/** @internal */
const makePrimitive = (options) => {
	const Proto = makePrimitiveProto(options);
	const PrimitiveImpl = function(value) {
		this[args] = value;
	};
	PrimitiveImpl.prototype = Proto;
	return function(value) {
		return new PrimitiveImpl(value);
	};
};
/** @internal */
const makeExit = (options) => {
	const Proto = {
		[ExitTypeId]: ExitTypeId,
		_tag: options.op,
		get [options.prop]() {
			return this[args];
		},
		...makePrimitiveProto(options),
		toString() {
			return `${options.op}(${format$1(this[args])})`;
		},
		toJSON() {
			return {
				_id: "Exit",
				_tag: options.op,
				[options.prop]: this[args]
			};
		},
		[symbol](that) {
			return isExit(that) && that._tag === this._tag && equals$1(this["~effect/Effect/args"], that["~effect/Effect/args"]);
		},
		[symbol$1]() {
			return combine(string$1(options.op), hash(this[args]));
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
/** @internal */
const exitSucceed = /*#__PURE__*/ makeExit({
	op: "Success",
	prop: "value",
	[evaluate](fiber) {
		const cont = fiber.getCont(contA);
		return cont ? cont[contA](this[args], fiber, this) : fiber.yieldWith(this);
	}
});
/** @internal */
const StackTraceKey = { key: "effect/Cause/StackTrace" };
/** @internal */
const InterruptorStackTrace = { key: "effect/Cause/InterruptorStackTrace" };
/** @internal */
const exitFailCause = /*#__PURE__*/ makeExit({
	op: "Failure",
	prop: "cause",
	[evaluate](fiber) {
		let cause = this[args];
		let annotated = false;
		if (fiber.cache.stackFrame) {
			cause = causeAnnotate(cause, { mapUnsafe: /* @__PURE__ */ new Map([[StackTraceKey.key, fiber.cache.stackFrame]]) });
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
			if (skippedHandler) cause = causeFromReasons(cause.reasons.filter((reason) => reason._tag !== "Fail"));
			cause = causeCombine(cause, interruptedCause);
			annotated = true;
		}
		return cont ? cont[contE](cause, fiber, annotated ? void 0 : this) : fiber.yieldWith(annotated ? exitFailCause(cause) : this);
	}
});
/** @internal */
const exitFail = (e) => exitFailCause(causeFail(e));
/** @internal */
const exitDie = (defect) => exitFailCause(causeDie(defect));
/** @internal */
const withFiber$1 = /*#__PURE__*/ makePrimitive({
	op: "WithFiber",
	[evaluate](fiber) {
		return this[args](fiber);
	}
});
/** @internal */
const YieldableError = /*#__PURE__*/ function() {
	class YieldableError extends globalThis.Error {}
	const proto = /*#__PURE__*/ makePrimitiveProto({
		op: "YieldableError",
		[evaluate]() {
			return exitFail(this);
		}
	});
	delete proto.toString;
	Object.assign(YieldableError.prototype, proto);
	return YieldableError;
}();
/** @internal */
const Error$3 = /*#__PURE__*/ function() {
	const plainArgsSymbol = /*#__PURE__*/ Symbol.for("effect/Data/Error/plainArgs");
	return class Base extends YieldableError {
		constructor(args) {
			super(args?.message, args?.cause ? { cause: args.cause } : void 0);
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
/** @internal */
const TaggedError$2 = (tag) => {
	class Base extends Error$3 {
		_tag = tag;
	}
	Base.prototype.name = tag;
	return Base;
};
// node_modules/effect/dist/Effectable.js
/**
* Create a low-level `Effect` prototype.
*
* **When to use**
*
* Use when you need to create a custom Effect-like value without extending a
* class, by providing a label and an evaluate function that receives the
* current fiber.
*
* **Details**
*
* When the effect is evaluated, it calls `evaluate` with the current fiber.
*
* @see {@link Class} for a class-based approach to defining custom Effect values
* @see {@link Mixin} for wrapping an existing class constructor
*
* @category prototypes
* @since 4.0.0
*/
const Prototype = (options) => makePrimitiveProto({
	op: options.label,
	[evaluate]: options.evaluate
});
// node_modules/effect/dist/internal/option.js
/**
* @since 2.0.0
*/
const TypeId$13 = "~effect/Option";
const CommonProto$1 = {
	[TypeId$13]: { _A: (_) => _ },
	...PipeInspectableProto,
	[Symbol.iterator]() {
		return new SingleShotGen(this);
	}
};
const SomeProto = /*#__PURE__*/ Object.defineProperty(/*#__PURE__*/ Object.assign(/*#__PURE__*/ Object.create(CommonProto$1), {
	_tag: "Some",
	_op: "Some",
	[symbol](that) {
		return isOption(that) && isSome$1(that) && equals$1(this.value, that.value);
	},
	[symbol$1]() {
		return combine(hash(this._tag))(hash(this.value));
	},
	toString() {
		return `some(${format$1(this.value)})`;
	},
	toJSON() {
		return {
			_id: "Option",
			_tag: this._tag,
			value: toJson$1(this.value)
		};
	}
}), "valueOrUndefined", { get() {
	return this.value;
} });
const NoneHash = /*#__PURE__*/ hash("None");
const NoneProto = /*#__PURE__*/ Object.assign(/*#__PURE__*/ Object.create(CommonProto$1), {
	_tag: "None",
	_op: "None",
	valueOrUndefined: void 0,
	[symbol](that) {
		return isOption(that) && isNone$1(that);
	},
	[symbol$1]() {
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
/** @internal */
const isOption = (input) => hasProperty(input, TypeId$13);
/** @internal */
const isNone$1 = (fa) => fa._tag === "None";
/** @internal */
const isSome$1 = (fa) => fa._tag === "Some";
/** @internal */
const none$1 = /*#__PURE__*/ Object.create(NoneProto);
/** @internal */
const SomeImpl = function(value) {
	this.value = value;
};
SomeImpl.prototype = SomeProto;
/** @internal */
const some$1 = (value) => new SomeImpl(value);
// node_modules/effect/dist/internal/result.js
const TypeId$12 = "~effect/Result";
const CommonProto = {
	[TypeId$12]: {
		/* v8 ignore next 2 */
		_A: (_) => _,
		_E: (_) => _
	},
	...PipeInspectableProto,
	[Symbol.iterator]() {
		return new SingleShotGen(this);
	}
};
const SuccessProto = /*#__PURE__*/ Object.assign(/*#__PURE__*/ Object.create(CommonProto), {
	_tag: "Success",
	_op: "Success",
	[symbol](that) {
		return isResult(that) && isSuccess$2(that) && equals$1(this.success, that.success);
	},
	[symbol$1]() {
		return combine(hash(this._tag))(hash(this.success));
	},
	toString() {
		return `success(${format$1(this.success)})`;
	},
	toJSON() {
		return {
			_id: "Result",
			_tag: this._tag,
			value: toJson$1(this.success)
		};
	}
});
const FailureProto = /*#__PURE__*/ Object.assign(/*#__PURE__*/ Object.create(CommonProto), {
	_tag: "Failure",
	_op: "Failure",
	[symbol](that) {
		return isResult(that) && isFailure$2(that) && equals$1(this.failure, that.failure);
	},
	[symbol$1]() {
		return combine(hash(this._tag))(hash(this.failure));
	},
	toString() {
		return `failure(${format$1(this.failure)})`;
	},
	toJSON() {
		return {
			_id: "Result",
			_tag: this._tag,
			failure: toJson$1(this.failure)
		};
	}
});
/** @internal */
const isResult = (input) => hasProperty(input, TypeId$12);
/** @internal */
const isFailure$2 = (result) => result._tag === "Failure";
/** @internal */
const isSuccess$2 = (result) => result._tag === "Success";
/** @internal */
const FailureImpl = function(failure) {
	this.failure = failure;
};
FailureImpl.prototype = FailureProto;
/** @internal */
const fail$5 = (failure) => new FailureImpl(failure);
/** @internal */
const SuccessImpl = function(success) {
	this.success = success;
};
SuccessImpl.prototype = SuccessProto;
/** @internal */
const succeed$5 = (success) => new SuccessImpl(success);
// node_modules/effect/dist/Order.js
/**
* Defines comparison functions for ordered values.
*
* An `Order<A>` compares two `A` values and returns whether the first is less
* than, equal to, or greater than the second. Orders are used for sorting,
* choosing minimum or maximum values, checking ranges, and building ordered data
* structures. This module includes built-in orders, constructors for custom
* orders, tools for reversing and combining comparisons, tuple and struct
* helpers, comparison predicates, clamping, and reducer support.
*
* @since 2.0.0
*/
/**
* Creates a new `Order` instance from a comparison function.
*
* **When to use**
*
* Use when you need a sorting rule not covered by the built-in orders or input
* mapping helpers, and you can provide a total comparison.
*
* **Details**
*
* Uses reference equality (`===`) as a shortcut: if `self === that`, it returns
* `0` without calling the comparison function. The comparison function should
* return `-1`, `0`, or `1`, and the returned order satisfies total ordering
* laws when the comparison function does.
*
* **Example** (Creating an Order)
*
* ```ts import.meta.vitest
* import { Order } from "effect"
*
* const byAge = Order.make<{ name: string; age: number }>((self, that) => {
*   if (self.age < that.age) return -1
*   if (self.age > that.age) return 1
*   return 0
* })
*
* byAge({ name: "Alice", age: 30 }, { name: "Bob", age: 25 }) // => 1
* byAge({ name: "Alice", age: 25 }, { name: "Bob", age: 30 }) // => -1
* ```
*
* @see {@link mapInput} to transform an order by mapping the input type
* @see {@link combine} to combine multiple orders
* @category constructors
* @since 2.0.0
*/
function make$13(compare) {
	return (self, that) => self === that ? 0 : compare(self, that);
}
/**
* Order instance for strings that compares them lexicographically using JavaScript's `<` operator.
*
* **When to use**
*
* Use when you need lexicographic string ordering.
*
* **Details**
*
* Uses lexicographic dictionary ordering. The empty string is less than any
* non-empty string, and comparisons are case-sensitive.
*
* **Example** (Ordering strings)
*
* ```ts import.meta.vitest
* import { Order } from "effect"
*
* Order.String("apple", "banana") // => -1
* Order.String("banana", "apple") // => 1
* Order.String("apple", "apple") // => 0
* ```
*
* @see {@link mapInput} to compare objects by a string property
* @see {@link Struct} to combine with other orders for struct comparison
* @category instances
* @since 4.0.0
*/
const String$4 = /*#__PURE__*/ make$13((self, that) => self < that ? -1 : 1);
/**
* Order instance for numbers that compares them numerically.
*
* **When to use**
*
* Use when you need numeric ordering for numbers.
*
* **Details**
*
* `0` is considered equal to `-0`. All `NaN` values are considered equal to
* each other, and any `NaN` is considered less than any non-`NaN` number. All
* other values use standard numeric comparison.
*
* **Example** (Ordering numbers)
*
* ```ts import.meta.vitest
* import { Order } from "effect"
*
* Order.Number(1, 1) // => 0
* Order.Number(1, 2) // => -1
* Order.Number(2, 1) // => 1
*
* Order.Number(0, -0) // => 0
* Order.Number(NaN, 1) // => -1
* ```
*
* @see {@link mapInput} to compare objects by a number property
* @see {@link BigInt} for bigint comparisons
* @category instances
* @since 4.0.0
*/
const Number$4 = /*#__PURE__*/ make$13((self, that) => {
	if (globalThis.Number.isNaN(self) && globalThis.Number.isNaN(that)) return 0;
	if (globalThis.Number.isNaN(self)) return -1;
	if (globalThis.Number.isNaN(that)) return 1;
	return self < that ? -1 : 1;
});
/**
* Checks whether one value is strictly greater than another according to the given order.
*
* **When to use**
*
* Use when you need a boolean greater-than predicate using an `Order`.
*
* **Details**
*
* Returns `true` if the order returns `1`, meaning the first value is greater
* than the second. Equal or lesser values return `false`.
*
* **Example** (Checking greater-than comparisons)
*
* ```ts import.meta.vitest
* import { Order } from "effect"
*
* const isGreaterThanNumber = Order.isGreaterThan(Order.Number)
*
* isGreaterThanNumber(2, 1) // => true
* isGreaterThanNumber(1, 2) // => false
* isGreaterThanNumber(1, 1) // => false
* ```
*
* @see {@link isGreaterThanOrEqualTo} for non-strict greater than or equal
* @see {@link isLessThan} for strict less than
* @category predicates
* @since 4.0.0
*/
const isGreaterThan$1 = (O) => dual(2, (self, that) => O(self, that) === 1);
/**
* Checks whether one value is greater than or equal to another according to the given order.
*
* **When to use**
*
* Use when you need a boolean greater-than-or-equal predicate using an
* `Order`.
*
* **Details**
*
* Returns `true` if the order returns `1` or `0`, and returns `false` only if
* the order returns `-1`.
*
* **Example** (Checking greater-than-or-equal comparisons)
*
* ```ts import.meta.vitest
* import { Order } from "effect"
*
* const isGreaterThanOrEqualToNumber = Order.isGreaterThanOrEqualTo(Order.Number)
*
* isGreaterThanOrEqualToNumber(2, 1) // => true
* isGreaterThanOrEqualToNumber(1, 1) // => true
* isGreaterThanOrEqualToNumber(1, 2) // => false
* ```
*
* @see {@link isGreaterThan} for strict greater than
* @see {@link isLessThanOrEqualTo} for less than or equal
* @category predicates
* @since 4.0.0
*/
const isGreaterThanOrEqualTo$1 = (O) => dual(2, (self, that) => O(self, that) !== -1);
// node_modules/effect/dist/Option.js
/**
* Creates an `Option` representing the absence of a value.
*
* **When to use**
*
* Use to represent a missing or uninitialized value, such as returning "no
* result" from a function.
*
* **Details**
*
* - Returns `Option<never>`, which is a subtype of `Option<A>` for any `A`
* - Always returns the same singleton instance
*
* **Example** (Creating an empty Option)
*
* ```ts import.meta.vitest
* import { Option } from "effect"
*
* //      ┌─── Option<never>
* //      ▼
* const noValue = Option.none() // => Option.none()
* ```
*
* @see {@link some} for the opposite operation.
*
* @category constructors
* @since 2.0.0
*/
const none = () => none$1;
/**
* Wraps the given value into an `Option` to represent its presence.
*
* **When to use**
*
* Use to wrap a known present value as `Option`
* - Returning a successful result from a partial function
*
* **Details**
*
* - Always returns `Some<A>`
* - Does not filter `null` or `undefined`; use {@link fromNullishOr} for that
*
* **Example** (Wrapping a value)
*
* ```ts import.meta.vitest
* import { Option } from "effect"
*
* //      ┌─── Option<number>
* //      ▼
* const value = Option.some(1) // => Option.some(1)
* ```
*
* @see {@link none} for the opposite operation.
*
* @category constructors
* @since 2.0.0
*/
const some = some$1;
/**
* Checks whether an `Option` is `None` (absent).
*
* **When to use**
*
* Use when you need to branch on an absent `Option` before accessing `.value`.
*
* **Details**
*
* - Acts as a type guard, narrowing to `None<A>`
*
* **Example** (Checking for None)
*
* ```ts import.meta.vitest
* import { Option } from "effect"
*
* Option.isNone(Option.some(1)) // => false
* Option.isNone(Option.none()) // => true
* ```
*
* @see {@link isSome} for the opposite check.
*
* @category guards
* @since 2.0.0
*/
const isNone = isNone$1;
// node_modules/effect/dist/Context.js
/**
* Runtime type identifier attached to `Context` service keys and used by
* `isKey` to recognize them.
*
* @category type IDs
* @since 4.0.0
*/
const ServiceTypeId = "~effect/Context/Service";
/**
* Creates a `Context` service key.
*
* **When to use**
*
* Use when you need to define a context service key for a dependency that must
* be provided by the surrounding context.
*
* **Details**
*
* Call `Context.Service("Key")` for a function-style key, or use the two-stage
* form `Context.Service<Self, Shape>()("Key")` for class-style service
* declarations. The returned key can be yielded as an Effect and passed to
* `Context.make`, `Context.add`, and the Context getter functions.
*
* **Gotchas**
*
* The string key is the runtime identity of the service. Reusing the same key
* string for unrelated services makes them occupy the same slot in a
* `Context`.
*
* **Example** (Creating service keys)
*
* ```ts import.meta.vitest
* import { Context } from "effect"
*
* // Create a simple service
* const Database = Context.Service<{
*   query: (sql: string) => string
* }>("Database")
*
* // Create a service class
* class Config extends Context.Service<Config, {
*   port: number
* }>()("Config") {}
*
* // Use the services to create contexts
* const db = Context.make(Database, {
*   query: (sql) => `Result: ${sql}`
* })
* const config = Context.make(Config, { port: 8080 })
* Context.get(db, Database).query("SELECT 1") // => "Result: SELECT 1"
* Context.get(config, Config).port // => 8080
* ```
*
* @see {@link Reference} for service keys with default values
*
* @category services
* @since 4.0.0
*/
const Service = function() {
	function KeyClass() {}
	const self = KeyClass;
	Object.setPrototypeOf(self, ServiceProto);
	const init = (key, options) => {
		self.key = key;
		if (options?.defaultValue) {
			self[ReferenceTypeId] = ReferenceTypeId;
			self.defaultValue = options.defaultValue;
		}
		if (options?.make) self.make = options.make;
		if (options?.fiberCached) cacheKeys.add(key);
		return self;
	};
	return arguments.length > 0 ? init(arguments[0], arguments[1]) : init;
};
const ServiceProto = {
	[ServiceTypeId]: ServiceTypeId,
	.../*#__PURE__*/ Prototype({
		label: "Service",
		evaluate(fiber) {
			return exitSucceed(get$1(fiber.context, this));
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
		return make$12(this, self);
	},
	use(f) {
		return withFiber$1((fiber) => f(get$1(fiber.context, this)));
	},
	useSync(f) {
		return withFiber$1((fiber) => exitSucceed(f(get$1(fiber.context, this))));
	}
};
const cacheKeys = /*#__PURE__*/ new Set();
const ReferenceTypeId = "~effect/Context/Reference";
const TypeId$11 = "~effect/Context";
const MaxDepth = 8;
const FlattenAfterBaseHits = 8;
const makeImpl = (cacheRoot, base, overlay, depth) => {
	const self = Object.create(Proto$3);
	self.cacheRoot = cacheRoot ?? self;
	self.base = base;
	self.overlay = overlay;
	self.depth = depth;
	self._flat = void 0;
	self.baseHits = 0;
	return self;
};
const applyOverlays = (map, overlay) => {
	if (!overlay) return;
	applyOverlays(map, overlay.parent);
	map.set(overlay.key, overlay.value);
};
const flatten$2 = (self) => {
	if (self._flat) return self._flat;
	if (!self.overlay) return self._flat = self.base;
	const map = new Map(self.base);
	applyOverlays(map, self.overlay);
	return self._flat = map;
};
const withFlat = (self, f) => {
	const map = new Map(self.mapUnsafe);
	f(map);
	return makeUnsafe$3(map);
};
const notFound = /*#__PURE__*/ Symbol();
const lookup$1 = (self, key) => {
	const impl = self;
	for (let overlay = impl.overlay; overlay; overlay = overlay.parent) if (overlay.key === key) return overlay.value;
	const value = impl.base.get(key);
	if (value === void 0 && !impl.base.has(key)) return notFound;
	if (impl.overlay && ++impl.baseHits >= impl.base.size && impl.baseHits >= FlattenAfterBaseHits) {
		impl.base = flatten$2(impl);
		impl.overlay = void 0;
		impl.depth = 0;
	}
	return value;
};
/**
* Creates a `Context` from an existing service map.
*
* **When to use**
*
* Use when constructing a low-level `Context` from a trusted map whose lifecycle
* you control.
*
* **Gotchas**
*
* The provided map is retained without copying and must not be mutated after
* construction. Prefer `empty`, `make`, `add`, or `merge` for normal Context
* construction.
*
* **Example** (Creating a context from a map)
*
* ```ts import.meta.vitest
* import { Context } from "effect"
*
* // Create a context from a Map (unsafe)
* const map = new Map([
*   ["Logger", { log: (_msg: string) => {} }]
* ])
*
* const context = Context.makeUnsafe(map)
* context.mapUnsafe.size // => 1
* ```
*
* @category constructors
* @since 4.0.0
*/
const makeUnsafe$3 = (mapUnsafe) => makeImpl(void 0, mapUnsafe, void 0, 0);
const Proto$3 = {
	get mapUnsafe() {
		return flatten$2(this);
	},
	...PipeInspectableProto,
	[TypeId$11]: { _Services: (_) => _ },
	toJSON() {
		return {
			_id: "Context",
			services: Array.from(this.mapUnsafe).map(([key, value]) => ({
				key,
				value
			}))
		};
	},
	[symbol](that) {
		if (!isContext(that)) return false;
		const self = this.mapUnsafe;
		const other = that.mapUnsafe;
		if (self.size !== other.size) return false;
		for (const [key, value] of self) if (!other.has(key) || !equals$1(value, other.get(key))) return false;
		return true;
	},
	[symbol$1]() {
		return number$1(this.mapUnsafe.size);
	}
};
/** @internal */
const hasSameCache = (self, that) => self.cacheRoot === that.cacheRoot;
/**
* Checks whether the provided argument is a `Context`.
*
* **When to use**
*
* Use to narrow an unknown value before passing it to APIs that require a
* `Context`.
*
* **Details**
*
* This checks the runtime `Context` marker and does not inspect which services
* the context contains.
*
* **Gotchas**
*
* This guard only proves that the value is a `Context`; it does not prove that
* any specific service is present.
*
* **Example** (Checking for contexts)
*
* ```ts import.meta.vitest
* import { Context } from "effect"
* Context.isContext(Context.empty()) // => true
* ```
*
* @see {@link isKey} for checking service keys
* @see {@link isReference} for checking references with defaults
*
* @category guards
* @since 2.0.0
*/
const isContext = (u) => hasProperty(u, TypeId$11);
/**
* Checks whether the provided argument is a `Reference`.
*
* **Example** (Checking for references)
*
* ```ts import.meta.vitest
* import { Context } from "effect"
*
* const LoggerRef = Context.Reference("Logger", {
*   defaultValue: () => ({ log: (_msg: string) => {} })
* })
*
* Context.isReference(LoggerRef) // => true
* Context.isReference(Context.Service("Key")) // => false
* ```
*
* @category guards
* @since 3.11.0
*/
const isReference = (u) => !!u[ReferenceTypeId];
/**
* Returns an empty `Context`.
*
* **Example** (Creating an empty context)
*
* ```ts import.meta.vitest
* import { Context } from "effect"
* Context.empty().mapUnsafe.size // => 0
* ```
*
* @category constructors
* @since 2.0.0
*/
const empty$3 = () => emptyContext;
const emptyContext = /*#__PURE__*/ makeUnsafe$3(/*#__PURE__*/ new Map());
/**
* Creates a new `Context` with a single service associated to the key.
*
* **Example** (Creating a context with one service)
*
* ```ts import.meta.vitest
* import { Context } from "effect"
*
* const Port = Context.Service<{ PORT: number }>("Port")
*
* const context = Context.make(Port, { PORT: 8080 })
*
* Context.get(context, Port).PORT // => 8080
* ```
*
* @category constructors
* @since 2.0.0
*/
const make$12 = (key, service) => makeUnsafe$3(/* @__PURE__ */ new Map([[key.key, service]]));
/**
* Adds a service to a given `Context`.
*
* **When to use**
*
* Use when you need to store a known service value in a `Context`.
*
* **Details**
*
* If the context already contains the same service key, the new service
* replaces the previous one.
*
* **Example** (Adding a service to a context)
*
* ```ts import.meta.vitest
* import { Context, pipe } from "effect"
*
* const Port = Context.Service<{ PORT: number }>("Port")
* const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
*
* const someContext = Context.make(Port, { PORT: 8080 })
*
* const context = pipe(
*   someContext,
*   Context.add(Timeout, { TIMEOUT: 5000 })
* )
*
* const values = [Context.get(context, Port).PORT, Context.get(context, Timeout).TIMEOUT]
* values // => [8080, 5000]
* ```
*
* @see {@link addOrOmit} for adding or removing a service from an `Option`
*
* @category combining
* @since 2.0.0
*/
const add = /*#__PURE__*/ dual(3, (self, key, service) => addUnsafe(self, key.key, service));
/**
* Adds a service by key to a given `Context` using a string key.
*
* @category combining
* @since 4.0.0
*/
const addUnsafe = (self, key, service) => {
	const impl = self;
	const cacheRoot = cacheKeys.has(key) ? void 0 : impl.cacheRoot;
	if (impl.depth >= MaxDepth) {
		const map = new Map(impl.mapUnsafe);
		map.set(key, service);
		return makeImpl(cacheRoot, map, void 0, 0);
	}
	return makeImpl(cacheRoot, impl.base, {
		key,
		value: service,
		parent: impl.overlay
	}, impl.depth + 1);
};
/** @internal */
const getOrUndefinedUnsafe = (self, key) => {
	const value = lookup$1(self, key);
	return value === notFound ? void 0 : value;
};
/**
* Gets a service from the context that corresponds to the given key.
*
* **When to use**
*
* Use when you need type-checked access to a service already included in the
* context type.
*
* **Example** (Getting a service from a context)
*
* ```ts import.meta.vitest
* import { Context, pipe } from "effect"
*
* const Port = Context.Service<{ PORT: number }>("Port")
* const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
*
* const context = pipe(
*   Context.make(Port, { PORT: 8080 }),
*   Context.add(Timeout, { TIMEOUT: 5000 })
* )
*
* Context.get(context, Timeout).TIMEOUT // => 5000
* ```
*
* @see {@link getOption} for optional service access
* @see {@link getOrElse} for fallback values
*
* @category getters
* @since 2.0.0
*/
const get$1 = /* @__PURE__ */ dual(2, (self, service) => {
	const value = lookup$1(self, service.key);
	if (value === notFound) {
		if (isReference(service)) return getDefaultValue(service);
		throw serviceNotFoundError(service);
	}
	return value;
});
const defaultValueCacheKey = "~effect/Context/defaultValue";
const getDefaultValue = (ref) => {
	if (defaultValueCacheKey in ref) return ref[defaultValueCacheKey];
	return ref[defaultValueCacheKey] = ref.defaultValue();
};
const serviceNotFoundError = (service) => {
	const error = /* @__PURE__ */ new Error(`Service not found${service.key ? `: ${String(service.key)}` : ""}`);
	if (error.stack) {
		const lines = error.stack.split("\n");
		lines.splice(1, 3);
		error.stack = lines.join("\n");
	}
	return error;
};
/**
* Merges two `Context`s into one.
*
* **When to use**
*
* Use when you need to combine two contexts.
*
* **Details**
*
* When both contexts contain the same service key, the service from `that`
* overrides the service from `self`.
*
* **Example** (Merging two contexts)
*
* ```ts import.meta.vitest
* import { Context } from "effect"
*
* const Port = Context.Service<{ PORT: number }>("Port")
* const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
*
* const firstContext = Context.make(Port, { PORT: 8080 })
* const secondContext = Context.make(Timeout, { TIMEOUT: 5000 })
*
* const context = Context.merge(firstContext, secondContext)
*
* const values = [Context.get(context, Port).PORT, Context.get(context, Timeout).TIMEOUT]
* values // => [8080, 5000]
* ```
*
* @see {@link mergeAll} for merging more than two contexts at once
*
* @category combining
* @since 2.0.0
*/
const merge = /*#__PURE__*/ dual(2, (self, that) => {
	if (self.mapUnsafe.size === 0) return that;
	if (that.mapUnsafe.size === 0) return self;
	return withFlat(self, (map) => that.mapUnsafe.forEach((value, key) => map.set(key, value)));
});
/**
* Creates a context key with a default value.
*
* **When to use**
*
* Use when you need to define a context key with a lazily computed default
* value.
*
* **Details**
*
* `Context.Reference` allows you to create a key that can hold a value. You
* can provide a default value for the service, which will automatically be used
* when the context is accessed, or override it with a custom implementation
* when needed. The default value is computed lazily and cached on the
* reference.
*
* **Example** (Creating references with default values)
*
* ```ts import.meta.vitest
* import { Context } from "effect"
*
* // Create a reference with a default value
* const messages: Array<string> = []
* const LoggerRef = Context.Reference("Logger", {
*   defaultValue: () => ({ log: (msg: string) => messages.push(`Default: ${msg}`) })
* })
*
* // The reference provides the default value when accessed from an empty context
* const context = Context.empty()
* const logger = Context.get(context, LoggerRef)
*
* // You can also override the default value
* const customContext = Context.make(LoggerRef, {
*   log: (msg: string) => messages.push(`Custom: ${msg}`)
* })
* const customLogger = Context.get(customContext, LoggerRef)
* logger.log("default")
* customLogger.log("message")
* messages // => ["Default: default", "Custom: message"]
* ```
*
* @see {@link Service} for required services without default values
*
* @category services
* @since 3.11.0
*/
const Reference = Service;
// node_modules/effect/dist/internal/array.js
/**
* @since 2.0.0
*/
/** @internal */
const isArrayNonEmpty$1 = (self) => self.length > 0;
// node_modules/effect/dist/Result.js
/**
* Creates a `Result` holding a `Success` value.
*
* **Details**
*
* - Use when you have a value and want to lift it into the `Result` type
* - The error type `E` defaults to `never`
*
* **Example** (Wrapping a value)
*
* ```ts import.meta.vitest
* import { Result } from "effect"
*
* Result.succeed(42) // => Result.succeed(42)
* ```
*
* @see {@link fail} to create a Failure
* @see {@link void_ void} for a pre-built `Success<void>`
*
* @category constructors
* @since 4.0.0
*/
const succeed$4 = succeed$5;
/**
* Creates a `Result` holding a `Failure` value.
*
* **When to use**
*
* Use to represent a failed `Result` with a typed failure value.
*
* **Details**
*
* - The success type `A` defaults to `never`
*
* **Example** (Creating a failure)
*
* ```ts import.meta.vitest
* import { Result } from "effect"
*
* Result.fail("Something went wrong") // => Result.fail("Something went wrong")
* ```
*
* @see {@link succeed} to create a Success
* @see {@link mapError} to transform the error
*
* @category constructors
* @since 4.0.0
*/
const fail$4 = fail$5;
/**
* Checks whether a `Result` is a `Failure`.
*
* **When to use**
*
* Use to narrow a known `Result` to the `Failure` variant.
*
* **Details**
*
* - Acts as a TypeScript type guard, narrowing to `Failure<A, E>`
* - After narrowing, you can access `.failure` to read the error value
*
* **Example** (Narrowing to failure)
*
* ```ts import.meta.vitest
* import { Result } from "effect"
*
* const result = Result.fail("oops")
*
* if (Result.isFailure(result)) {
*   result.failure // => "oops"
* }
* ```
*
* @see {@link isSuccess} for the opposite check
* @see {@link isResult} to check if a value is any Result
*
* @category guards
* @since 4.0.0
*/
const isFailure$1 = isFailure$2;
// node_modules/effect/dist/Array.js
/**
* Exposes the global array constructor.
*
* **When to use**
*
* Use to access native JavaScript array constructor methods such as `isArray`
* or `from` from the Effect module namespace.
*
* **Example** (Accessing the Array constructor)
*
* ```ts import.meta.vitest
* import { Array } from "effect"
*
* Array.Array === globalThis.Array // => true
* ```
*
* @category constructors
* @since 4.0.0
*/
const Array$1 = globalThis.Array;
/**
* Converts an `Iterable` to an `Array`.
*
* **When to use**
*
* Use to convert any `Iterable` (Set, Generator, etc.) into an array.
*
* **Details**
*
* If the input is already an array, this returns it by reference without
* copying. Otherwise, it creates a new array from the iterable. Use `copy` if
* you need a fresh array even when the input is already an array.
*
* **Example** (Converting a Set to an array)
*
* ```ts import.meta.vitest
* import { Array } from "effect"
*
* Array.fromIterable(new Set([1, 2, 3])) // => [1, 2, 3]
* ```
*
* @see {@link ensure} — wrap a single value or return an existing array
* @see {@link copy} — create a shallow copy of an array
*
* @category constructors
* @since 2.0.0
*/
const fromIterable$1 = (collection) => Array$1.isArray(collection) ? collection : Array$1.from(collection);
/**
* Adds a single element to the end of an iterable, returning a `NonEmptyArray`.
*
* **When to use**
*
* Use when you need to guarantee a non-empty result after adding a required
* trailing value.
*
* **Example** (Appending an element)
*
* ```ts import.meta.vitest
* import { Array } from "effect"
*
* Array.append([1, 2, 3], 4) // => [1, 2, 3, 4]
* ```
*
* @see {@link prepend} — add to the front
* @see {@link appendAll} — append multiple elements
*
* @category combining
* @since 2.0.0
*/
const append = /*#__PURE__*/ dual(2, (self, last) => [...self, last]);
Array$1.isArray;
/**
* Checks whether a mutable `Array` is non-empty, narrowing the type to
* `NonEmptyArray`.
*
* **When to use**
*
* Use when you need the narrowed value to remain a mutable `Array` after proving
* it has at least one element.
*
* **Example** (Checking for a non-empty array)
*
* ```ts import.meta.vitest
* import { Array } from "effect"
*
* Array.isArrayNonEmpty([]) // => false
* Array.isArrayNonEmpty([1, 2, 3]) // => true
* ```
*
* @see {@link isReadonlyArrayNonEmpty} — readonly variant
* @see {@link isArrayEmpty} — opposite check
*
* @category guards
* @since 4.0.0
*/
const isArrayNonEmpty = isArrayNonEmpty$1;
/**
* Checks whether a `ReadonlyArray` is non-empty, narrowing the type to
* `NonEmptyReadonlyArray`.
*
* **When to use**
*
* Use when you need to prove a readonly array has at least one element without
* requiring mutable array methods afterward.
*
* **Example** (Checking for a non-empty readonly array)
*
* ```ts import.meta.vitest
* import { Array } from "effect"
*
* Array.isReadonlyArrayNonEmpty([]) // => false
* Array.isReadonlyArrayNonEmpty([1, 2, 3]) // => true
* ```
*
* @see {@link isArrayNonEmpty} — mutable variant
* @see {@link isReadonlyArrayEmpty} — opposite check
*
* @category guards
* @since 4.0.0
*/
const isReadonlyArrayNonEmpty = isArrayNonEmpty$1;
/**
* Creates an empty array.
*
* **When to use**
*
* Use to create a typed empty array without allocating placeholder elements.
*
* **Example** (Creating an empty array)
*
* ```ts import.meta.vitest
* import { Array } from "effect"
*
* Array.empty<number>() // => []
* ```
*
* @see {@link of} — create a single-element array
* @see {@link make} — create from multiple values
*
* @category constructors
* @since 2.0.0
*/
const empty$2 = () => [];
/**
* Transforms each element using a function, returning a new array.
*
* **When to use**
*
* Use to transform each element independently while preserving the array shape.
*
* **Details**
*
* The function receives `(element, index)`. The return type preserves
* `NonEmptyArray`.
*
* **Example** (Doubling values)
*
* ```ts import.meta.vitest
* import { Array } from "effect"
*
* Array.map([1, 2, 3], (x) => x * 2) // => [2, 4, 6]
* ```
*
* @see {@link flatMap} — map and flatten
*
* @category mapping
* @since 2.0.0
*/
const map$3 = /*#__PURE__*/ dual(2, (self, f) => self.map(f));
// node_modules/effect/dist/Duration.js
const TypeId$10 = "~effect/Duration";
const bigint0$1 = /*#__PURE__*/ BigInt(0);
const bigint1$1 = /*#__PURE__*/ BigInt(1);
const bigint2 = /*#__PURE__*/ BigInt(2);
const bigint10$1 = /*#__PURE__*/ BigInt(10);
const bigint1e3 = /*#__PURE__*/ BigInt(1e3);
const roundTiesAwayFromZero = (input) => BigInt(input < 0 ? Math.ceil(input - .5) : Math.floor(input + .5));
const roundMillisToNanos = (millis) => roundTiesAwayFromZero(millis * 1e6);
const parseNanos = (input, scale) => {
	const decimalIndex = input.indexOf(".");
	if (decimalIndex === -1) return BigInt(input) * scale;
	const isNegative = input[0] === "-";
	const fractional = input.slice(decimalIndex + 1);
	const fractionalScale = bigint10$1 ** BigInt(fractional.length);
	const scaled = (BigInt(input.slice(isNegative ? 1 : 0, decimalIndex)) * fractionalScale + BigInt(fractional)) * scale;
	const rounded = scaled / fractionalScale + (scaled % fractionalScale * bigint2 >= fractionalScale ? bigint1$1 : bigint0$1);
	return isNegative ? -rounded : rounded;
};
const DURATION_REGEXP = /^(-?\d+(?:\.\d+)?)\s+(nanos?|micros?|millis?|seconds?|minutes?|hours?|days?|weeks?)$/;
/**
* Decodes a `Duration.Input` into a `Duration`.
*
* **When to use**
*
* Use when the input has already been validated or comes from a trusted source
* and throwing is acceptable for invalid duration syntax.
*
* **Gotchas**
*
* If the input is not a valid `Duration.Input`, it throws an error.
*
* **Example** (Decoding duration inputs)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.fromInputUnsafe(1000) // => Duration.millis(1000)
* Duration.fromInputUnsafe("5 seconds") // => Duration.seconds(5)
* Duration.fromInputUnsafe("Infinity") // => Duration.infinity
* Duration.fromInputUnsafe([2, 500_000_000]) // => Duration.nanos(2_500_000_000n)
* ```
*
* @category constructors
* @since 4.0.0
*/
const fromInputUnsafe = (input) => {
	switch (typeof input) {
		case "number": return millis(input);
		case "bigint": return nanos(input);
		case "string": {
			if (input === "Infinity") return infinity;
			if (input === "-Infinity") return negativeInfinity;
			const match = DURATION_REGEXP.exec(input);
			if (!match) break;
			const [_, valueStr, unit] = match;
			if (unit === "nano" || unit === "nanos") return nanos(parseNanos(valueStr, bigint1$1));
			if (unit === "micro" || unit === "micros") return nanos(parseNanos(valueStr, bigint1e3));
			const value = Number(valueStr);
			switch (unit) {
				case "milli":
				case "millis": return millis(value);
				case "second":
				case "seconds": return seconds(value);
				case "minute":
				case "minutes": return minutes(value);
				case "hour":
				case "hours": return hours(value);
				case "day":
				case "days": return days(value);
				case "week":
				case "weeks": return weeks(value);
			}
			break;
		}
		case "object": {
			if (input === null) break;
			if (TypeId$10 in input) return input;
			if (Array.isArray(input)) {
				if (input.length !== 2 || !input.every(isNumber)) return invalid$1(input);
				if (Number.isNaN(input[0]) || Number.isNaN(input[1])) return zero$1;
				if (input[0] === -Infinity || input[1] === -Infinity) return negativeInfinity;
				if (input[0] === Infinity || input[1] === Infinity) return infinity;
				return make$11(roundTiesAwayFromZero(input[0] * 1e9 + input[1]));
			}
			const obj = input;
			let millis = 0;
			if (obj.weeks) millis += obj.weeks * 6048e5;
			if (obj.days) millis += obj.days * 864e5;
			if (obj.hours) millis += obj.hours * 36e5;
			if (obj.minutes) millis += obj.minutes * 6e4;
			if (obj.seconds) millis += obj.seconds * 1e3;
			if (obj.milliseconds) millis += obj.milliseconds;
			if (!obj.microseconds && !obj.nanoseconds) return make$11(millis);
			return make$11(roundTiesAwayFromZero(millis * 1e6 + (obj.microseconds ?? 0) * 1e3 + (obj.nanoseconds ?? 0)));
		}
	}
	return invalid$1(input);
};
const invalid$1 = (input) => {
	throw new Error(`Invalid Input: ${input}`);
};
const zeroDurationValue = {
	_tag: "Millis",
	millis: 0
};
const infinityDurationValue = { _tag: "Infinity" };
const negativeInfinityDurationValue = { _tag: "NegativeInfinity" };
const DurationProto = {
	[TypeId$10]: TypeId$10,
	[symbol$1]() {
		switch (this.value._tag) {
			case "Millis": {
				const nanos = this.value.millis * 1e6;
				return Number.isFinite(nanos) ? hash(roundTiesAwayFromZero(nanos)) : number$1(this.value.millis);
			}
			case "Nanos": return hash(this.value.nanos);
			default: return structure(this.value);
		}
	},
	[symbol](that) {
		return isDuration(that) && equals(this, that);
	},
	toString() {
		switch (this.value._tag) {
			case "Infinity": return "Infinity";
			case "NegativeInfinity": return "-Infinity";
			case "Nanos": return `${this.value.nanos} nanos`;
			case "Millis": return `${this.value.millis} millis`;
		}
	},
	toJSON() {
		switch (this.value._tag) {
			case "Millis": return {
				_id: "Duration",
				_tag: "Millis",
				millis: this.value.millis
			};
			case "Nanos": return {
				_id: "Duration",
				_tag: "Nanos",
				nanos: String(this.value.nanos)
			};
			case "Infinity": return {
				_id: "Duration",
				_tag: "Infinity"
			};
			case "NegativeInfinity": return {
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
const make$11 = (input) => {
	const duration = Object.create(DurationProto);
	if (typeof input === "number") {
		if (isNaN(input) || input === 0 || Object.is(input, -0)) duration.value = zeroDurationValue;
		else if (!Number.isFinite(input)) duration.value = input > 0 ? infinityDurationValue : negativeInfinityDurationValue;
		else if (!Number.isInteger(input)) duration.value = {
			_tag: "Nanos",
			nanos: roundMillisToNanos(input)
		};
		else duration.value = {
			_tag: "Millis",
			millis: input
		};
	} else if (input === bigint0$1) duration.value = zeroDurationValue;
	else duration.value = {
		_tag: "Nanos",
		nanos: input
	};
	return duration;
};
/**
* Checks whether a value is a Duration.
*
* **Example** (Checking for durations)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.isDuration(Duration.seconds(1)) // => true
* Duration.isDuration(1000) // => false
* ```
*
* @category guards
* @since 2.0.0
*/
const isDuration = (u) => hasProperty(u, TypeId$10);
/**
* A Duration representing zero time.
*
* **Example** (Referencing the zero duration)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toMillis(Duration.zero) // => 0
* ```
*
* @category constructors
* @since 2.0.0
*/
const zero$1 = /*#__PURE__*/ make$11(0);
/**
* A Duration representing infinite time.
*
* **Example** (Referencing infinite duration)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toMillis(Duration.infinity) // => Infinity
* ```
*
* @category constructors
* @since 2.0.0
*/
const infinity = /*#__PURE__*/ make$11(Infinity);
/**
* A Duration representing negative infinite time.
*
* **Example** (Referencing negative infinite duration)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toMillis(Duration.negativeInfinity) // => -Infinity
* ```
*
* @category constructors
* @since 4.0.0
*/
const negativeInfinity = /*#__PURE__*/ make$11(-Infinity);
/**
* Creates a Duration from nanoseconds.
*
* **Example** (Creating durations from nanoseconds)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.nanos(500_000_000n) // => Duration.nanos(500_000_000n)
* ```
*
* @category constructors
* @since 2.0.0
*/
const nanos = (nanos) => make$11(nanos);
/**
* Creates a Duration from milliseconds.
*
* **Example** (Creating durations from milliseconds)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toMillis(Duration.millis(1000)) // => 1000
* ```
*
* @category constructors
* @since 2.0.0
*/
const millis = (millis) => make$11(millis);
/**
* Creates a Duration from seconds.
*
* **Example** (Creating durations from seconds)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toMillis(Duration.seconds(30)) // => 30_000
* ```
*
* @category constructors
* @since 2.0.0
*/
const seconds = (seconds) => make$11(seconds * 1e3);
/**
* Creates a Duration from minutes.
*
* **Example** (Creating durations from minutes)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toMillis(Duration.minutes(5)) // => 300_000
* ```
*
* @category constructors
* @since 2.0.0
*/
const minutes = (minutes) => make$11(minutes * 6e4);
/**
* Creates a Duration from hours.
*
* **Example** (Creating durations from hours)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toMillis(Duration.hours(2)) // => 7_200_000
* ```
*
* @category constructors
* @since 2.0.0
*/
const hours = (hours) => make$11(hours * 36e5);
/**
* Creates a Duration from days.
*
* **Example** (Creating durations from days)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toMillis(Duration.days(1)) // => 86_400_000
* ```
*
* @category constructors
* @since 2.0.0
*/
const days = (days) => make$11(days * 864e5);
/**
* Creates a Duration from weeks.
*
* **Example** (Creating durations from weeks)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toMillis(Duration.weeks(1)) // => 604_800_000
* ```
*
* @category constructors
* @since 2.0.0
*/
const weeks = (weeks) => make$11(weeks * 6048e5);
/**
* Converts a Duration to milliseconds.
*
* **Example** (Converting durations to milliseconds)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toMillis(Duration.seconds(5)) // => 5000
* Duration.toMillis(Duration.minutes(2)) // => 120_000
* ```
*
* @category getters
* @since 2.0.0
*/
const toMillis = (self) => match$1(fromInputUnsafe(self), {
	onMillis: identity,
	onNanos: (nanos) => Number(nanos) / 1e6,
	onInfinity: () => Infinity,
	onNegativeInfinity: () => -Infinity
});
/**
* Gets the duration in nanoseconds as a bigint.
*
* **When to use**
*
* Use when the duration is known to be finite and you need the nanosecond value
* as a `bigint`.
*
* **Details**
*
* Millisecond-backed fractional durations are rounded to the nearest
* nanosecond, with ties away from zero.
*
* **Gotchas**
*
* If the duration is infinite, it throws an error.
*
* **Example** (Reading nanoseconds unsafely)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toNanosUnsafe(Duration.seconds(2)) // => 2_000_000_000n
*
* // Duration.toNanosUnsafe(Duration.infinity)
* // throws Error: "Cannot convert infinite duration to nanos"
* ```
*
* @category getters
* @since 4.0.0
*/
const toNanosUnsafe = (input) => {
	const self = fromInputUnsafe(input);
	switch (self.value._tag) {
		case "Infinity":
		case "NegativeInfinity": throw new Error("Cannot convert infinite duration to nanos");
		case "Nanos": return self.value.nanos;
		case "Millis": return roundMillisToNanos(self.value.millis);
	}
};
/**
* Pattern matches on the representation of a `Duration`.
*
* **Details**
*
* Provide handlers for millisecond-backed values, nanosecond-backed values,
* and positive infinity. Use `onNegativeInfinity` to handle negative infinity
* separately; otherwise negative infinity is handled by `onInfinity`.
*
* **Example** (Pattern matching on duration representations)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.match(Duration.seconds(5), {
*   onMillis: (millis) => `${millis} milliseconds`,
*   onNanos: (nanos) => `${nanos} nanoseconds`,
*   onInfinity: () => "infinite"
* }) // => "5000 milliseconds"
* ```
*
* @category pattern matching
* @since 2.0.0
*/
const match$1 = /*#__PURE__*/ dual(2, (self, options) => {
	switch (self.value._tag) {
		case "Millis": return options.onMillis(self.value.millis);
		case "Nanos": return options.onNanos(self.value.nanos);
		case "Infinity": return options.onInfinity();
		case "NegativeInfinity": return (options.onNegativeInfinity ?? options.onInfinity)();
	}
});
/**
* Pattern matches on two `Duration`s, providing handlers that receive both values.
*
* **Example** (Pattern matching on duration pairs)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.matchPair(Duration.seconds(3), Duration.seconds(2), {
*   onMillis: (a, b) => a + b,
*   onNanos: (a, b) => Number(a + b),
*   onInfinity: () => Infinity
* }) // => 5000
* ```
*
* @category pattern matching
* @since 4.0.0
*/
const matchPair = /*#__PURE__*/ dual(3, (self, that, options) => {
	if (self.value._tag === "Infinity" || self.value._tag === "NegativeInfinity" || that.value._tag === "Infinity" || that.value._tag === "NegativeInfinity") return options.onInfinity(self, that);
	if (self.value._tag === "Millis") return that.value._tag === "Millis" ? options.onMillis(self.value.millis, that.value.millis) : options.onNanos(toNanosUnsafe(self), that.value.nanos);
	else return options.onNanos(self.value.nanos, toNanosUnsafe(that));
});
/**
* Provides an `Equivalence` instance for comparing `Duration` values.
*
* **Example** (Comparing durations for equivalence)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.Equivalence(Duration.seconds(5), Duration.millis(5000)) // => true
* ```
*
* @category instances
* @since 2.0.0
*/
const Equivalence$1 = (self, that) => matchPair(self, that, {
	onMillis: (self, that) => self === that,
	onNanos: (self, that) => self === that,
	onInfinity: (self, that) => self.value._tag === that.value._tag
});
/**
* Checks whether two Durations are equal.
*
* **Example** (Checking duration equality)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.equals(Duration.seconds(5), Duration.millis(5000)) // => true
* ```
*
* @category predicates
* @since 2.0.0
*/
const equals = /*#__PURE__*/ dual(2, (self, that) => Equivalence$1(self, that));
// node_modules/effect/dist/Scheduler.js
/**
* Controls how runnable Effect fiber tasks are dispatched.
*
* A scheduler decides how tasks are queued, when queued tasks run, and when a
* fiber should pause so other work can continue. This module includes the
* scheduler service reference, the default `MixedScheduler`, dispatcher types
* for queued tasks, and references for tuning or disabling automatic scheduler
* yields.
*
* @since 2.0.0
*/
/**
* Context reference for the scheduler used by the Effect runtime.
*
* **When to use**
*
* Use when you need to replace scheduling behavior globally in tests or runtime
* setup, such as forcing deterministic task dispatch.
*
* **Details**
*
* The default value creates a `MixedScheduler`. Provide this service to
* customize execution mode, task dispatching, or yield behavior.
*
* @category services
* @since 2.0.0
*/
const Scheduler = /*#__PURE__*/ Reference("effect/Scheduler", {
	fiberCached: true,
	defaultValue: () => new MixedScheduler()
});
const setMicrotask = (f) => {
	let cancelled = false;
	Promise.resolve().then(() => {
		if (!cancelled) f();
	});
	return () => {
		cancelled = true;
	};
};
const setTimer = "setImmediate" in globalThis ? (f) => {
	const timer = globalThis.setImmediate(f);
	return () => globalThis.clearImmediate(timer);
} : (f) => {
	const timer = setTimeout(f, 0);
	return () => clearTimeout(timer);
};
const setImmediate = (f) => {
	try {
		return setTimer(f);
	} catch {
		return setMicrotask(f);
	}
};
var PriorityBuckets = class {
	buckets = [];
	scheduleTask(task, priority) {
		const buckets = this.buckets;
		const len = buckets.length;
		let bucket;
		let index = 0;
		for (; index < len; index++) {
			if (buckets[index][0] > priority) break;
			bucket = buckets[index];
		}
		if (bucket && bucket[0] === priority) bucket[1].push(task);
		else if (index === len) buckets.push([priority, [task]]);
		else buckets.splice(index, 0, [priority, [task]]);
	}
	drain() {
		const buckets = this.buckets;
		this.buckets = [];
		return buckets;
	}
};
/**
* Provides a scheduler implementation that batches queued tasks and dispatches them by
* priority.
*
* **When to use**
*
* Use when you need the default runtime scheduler directly, including a
* scheduler that batches queued work by priority and preserves FIFO order within
* each priority.
*
* **Details**
*
* `MixedScheduler` supports synchronous and asynchronous execution modes, uses
* operation counts to decide when fibers should yield, and is the default
* scheduler implementation.
*
* @category models
* @since 2.0.0
*/
var MixedScheduler = class {
	executionMode;
	setImmediate;
	constructor(executionMode = "async", setImmediateFn) {
		this.executionMode = executionMode;
		this.setImmediate = setImmediateFn ?? (executionMode === "sync" ? setMicrotask : setImmediate);
	}
	/**
	* Returns whether the fiber has reached its operation budget and should yield.
	*
	* **When to use**
	*
	* Use to decide whether a fiber should yield after consuming its current
	* operation budget.
	*
	* @since 2.0.0
	*/
	shouldYield(fiber) {
		return fiber.currentOpCount >= fiber.cache.maxOpsBeforeYield;
	}
	/**
	* Creates a dispatcher that schedules work through this scheduler.
	*
	* **When to use**
	*
	* Use when you need a standalone dispatcher from a scheduler instance, for
	* example in tests that enqueue tasks and then flush them deterministically.
	*
	* @since 4.0.0
	*/
	makeDispatcher() {
		return new MixedSchedulerDispatcher(this.setImmediate);
	}
};
var MixedSchedulerDispatcher = class {
	tasks = /*#__PURE__*/ new PriorityBuckets();
	running = void 0;
	setImmediate;
	constructor(setImmediateFn = setImmediate) {
		this.setImmediate = setImmediateFn;
	}
	/**
	* @since 2.0.0
	*/
	scheduleTask(task, priority) {
		this.tasks.scheduleTask(task, priority);
		if (this.running === void 0) this.running = this.setImmediate(this.afterScheduled);
	}
	/**
	* @since 2.0.0
	*/
	afterScheduled = () => {
		this.running = void 0;
		this.runTasks();
	};
	/**
	* @since 2.0.0
	*/
	runTasks() {
		const buckets = this.tasks.drain();
		for (let i = 0; i < buckets.length; i++) {
			const toRun = buckets[i][1];
			for (let j = 0; j < toRun.length; j++) toRun[j]();
		}
	}
	/**
	* @since 2.0.0
	*/
	flush() {
		while (this.tasks.buckets.length > 0) {
			if (this.running !== void 0) {
				this.running();
				this.running = void 0;
			}
			this.runTasks();
		}
	}
};
/**
* Context reference that controls the maximum number of operations a fiber
* can perform before yielding control back to the scheduler.
*
* **When to use**
*
* Use to tune scheduler fairness for CPU-bound fibers by changing the scheduler
* operation budget that triggers a yield.
*
* **Details**
*
* The default value is `2048` operations, which balances performance and
* fairness by helping prevent long-running fibers from monopolizing the
* execution thread.
*
* @see {@link PreventSchedulerYield} for bypassing scheduler yield checks entirely rather than tuning the operation budget
*
* @category services
* @since 4.0.0
*/
const MaxOpsBeforeYield = /*#__PURE__*/ Reference("effect/Scheduler/MaxOpsBeforeYield", {
	fiberCached: true,
	defaultValue: () => 2048
});
/**
* Context reference that controls whether the runtime should bypass scheduler
* yield checks. When set to `true`, the fiber run loop won't call
* `Scheduler.shouldYield`.
*
* **When to use**
*
* Use to bypass scheduler yield checks for controlled runtime workloads where
* cooperative yielding should be disabled.
*
* **Gotchas**
*
* Setting this reference to `true` can let long-running fibers monopolize the
* JavaScript thread.
*
* @see {@link MaxOpsBeforeYield} for tuning yield frequency without disabling yield checks
* @see {@link Scheduler} for providing custom scheduler yield behavior
*
* @category services
* @since 4.0.0
*/
const PreventSchedulerYield = /*#__PURE__*/ Reference("effect/Scheduler/PreventSchedulerYield", {
	fiberCached: true,
	defaultValue: () => false
});
/**
* Creates a tagged error class with a `_tag` discriminator.
*
* **When to use**
*
* Use when you need domain errors with discriminated-union handling.
*
* **Details**
*
* Like {@link Error}, but instances also carry a `readonly _tag` property,
* enabling `Effect.catchTag` and `Effect.catchTags` for tag-based recovery.
* The `_tag` is excluded from the constructor argument. Yielding an instance
* inside `Effect.gen` fails the effect with this error.
*
* **Example** (Recovering by tag)
*
* ```ts import.meta.vitest
* import { Data, Effect } from "effect"
*
* class NotFound extends Data.TaggedError("NotFound")<{
*   readonly resource: string
* }> {}
*
* class Forbidden extends Data.TaggedError("Forbidden")<{
*   readonly reason: string
* }> {}
*
* const program = Effect.gen(function*() {
*   return yield* new NotFound({ resource: "/users/42" })
* })
*
* const recovered = program.pipe(
*   Effect.catchTag("NotFound", (e) =>
*     Effect.succeed(`missing: ${e.resource}`))
* )
*
* await Effect.runPromise(recovered) // => "missing: /users/42"
* ```
*
* @see {@link Error} — without a `_tag`
* @see {@link TaggedClass} — tagged class that is not an error
*
* @category constructors
* @since 2.0.0
*/
const TaggedError$1 = TaggedError$2;
// node_modules/effect/dist/Tracer.js
/**
* Defines the string key for the parent-span context service.
*
* **When to use**
*
* Use when you need the raw context key for parent span lookup in lower-level
* tracing code.
*
* **Example** (Reading the parent span key)
*
* ```ts import.meta.vitest
* import { Tracer } from "effect"
*
* // The key used to identify parent spans in the context
* Tracer.ParentSpanKey // => "effect/Tracer/ParentSpan"
* ```
*
* @category constants
* @since 4.0.0
*/
const ParentSpanKey = "effect/Tracer/ParentSpan";
/**
* Defines the string key for the active tracer context reference.
*
* **When to use**
*
* Use when you need the raw context key for active tracer lookup in lower-level
* tracing code.
*
* @category constants
* @since 4.0.0
*/
const TracerKey = "effect/Tracer";
// node_modules/effect/dist/internal/metric.js
/** @internal */
const FiberRuntimeMetricsKey = "effect/Metric/FiberRuntimeMetrics";
// node_modules/effect/dist/internal/references.js
/** @internal */
const CurrentStackFrame = /*#__PURE__*/ Reference("effect/References/CurrentStackFrame", {
	fiberCached: true,
	defaultValue: constUndefined
});
/** @internal */
const TracerEnabled = /*#__PURE__*/ Reference("effect/References/TracerEnabled", {
	fiberCached: true,
	defaultValue: constTrue
});
/** @internal */
const CurrentLogLevel = /*#__PURE__*/ Reference("effect/References/CurrentLogLevel", {
	fiberCached: true,
	defaultValue: () => "Info"
});
/** @internal */
const MinimumLogLevel = /*#__PURE__*/ Reference("effect/References/MinimumLogLevel", {
	fiberCached: true,
	defaultValue: () => "Info"
});
// node_modules/effect/dist/internal/effect.js
/** @internal */
var Interrupt = class extends ReasonBase {
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
	[symbol](that) {
		return isInterruptReason$1(that) && this.fiberId === that.fiberId && this.annotations === that.annotations;
	}
	[symbol$1]() {
		return combine(string$1(`${this._tag}:${this.fiberId}`))(random(this.annotations));
	}
};
/** @internal */
const causeInterrupt = (fiberId) => new CauseImpl([new Interrupt(fiberId)]);
/** @internal */
const findError = (self) => {
	for (let i = 0; i < self.reasons.length; i++) {
		const reason = self.reasons[i];
		if (reason._tag === "Fail") return succeed$4(reason.error);
	}
	return fail$4(self);
};
/** @internal */
const findDefect = (self) => {
	const reason = self.reasons.find(isDieReason);
	return reason ? succeed$4(reason.defect) : fail$4(self);
};
/** @internal */
const hasInterrupts = (self) => self.reasons.some(isInterruptReason$1);
/** @internal */
const hasInterruptsOnly$1 = (self) => self.reasons.length > 0 && self.reasons.every(isInterruptReason$1);
/** @internal */
const causeMap = /*#__PURE__*/ dual(2, (self, f) => {
	let hasFail = false;
	const failures = self.reasons.map((failure) => {
		if (isFailReason$1(failure)) {
			hasFail = true;
			return new Fail(f(failure.error), failure.annotations);
		}
		return failure;
	});
	return hasFail ? causeFromReasons(failures) : self;
});
/** @internal */
const causeSquash = (self) => {
	let die;
	for (const reason of self.reasons) {
		if (reason._tag === "Fail") return reason.error;
		if (reason._tag === "Die") die ??= reason;
	}
	if (die !== void 0) return die.defect;
	if (self.reasons.length > 0) return new globalThis.Error("All fibers interrupted without error");
	return new globalThis.Error("Empty cause");
};
/** @internal */
const causePrettyErrors = (self, options) => {
	const errors = [];
	const interrupts = [];
	if (self.reasons.length === 0) return errors;
	const prevStackLimit = getStackTraceLimit();
	if (prevStackLimit !== 0) setStackTraceLimit(1);
	try {
		for (const failure of self.reasons) {
			if (failure._tag === "Interrupt") {
				interrupts.push(failure);
				continue;
			}
			errors.push(causePrettyError(failure._tag === "Die" ? failure.defect : failure.error, failure.annotations, options));
		}
		if (errors.length === 0) {
			const cause = /* @__PURE__ */ new Error("The fiber was interrupted by:");
			cause.name = "InterruptCause";
			cause.stack = interruptCauseStack(cause, interrupts);
			const error = new globalThis.Error("All fibers interrupted without error", { cause });
			error.name = "InterruptError";
			error.stack = `${error.name}: ${error.message}`;
			errors.push(causePrettyError(error, interrupts[0].annotations, options));
		}
	} finally {
		if (prevStackLimit !== 0) setStackTraceLimit(prevStackLimit);
	}
	return errors;
};
/** @internal */
const causePrettyError = (original, annotations, options) => {
	const kind = typeof original;
	let error;
	if (original && kind === "object") {
		error = new globalThis.Error(causePrettyMessage(original), { cause: original.cause ? causePrettyError(original.cause) : void 0 });
		if (typeof original.name === "string") error.name = original.name;
		if (typeof original.stack === "string") error.stack = cleanErrorStack(original.stack, error, annotations);
		else {
			const stack = `${error.name}: ${error.message}`;
			error.stack = annotations ? addStackAnnotations(stack, annotations) : stack;
		}
		if (options?.includeCauseInStack) error.stack = renderPrettyError(error);
		for (const key of Object.keys(original)) if (!(key in error)) error[key] = original[key];
	} else error = new globalThis.Error(!original ? `Unknown error: ${original}` : kind === "string" ? original : formatJson(original));
	return error;
};
const causePrettyMessage = (u) => {
	if (typeof u.message === "string") return u.message;
	else if (typeof u.toString === "function" && u.toString !== Object.prototype.toString && u.toString !== Array.prototype.toString) try {
		return u.toString();
	} catch {}
	return formatJson(u);
};
const locationRegExp = /\((.*)\)/g;
const cleanErrorStack = (stack, error, annotations) => {
	const message = `${error.name}: ${error.message}`;
	const lines = (stack.startsWith(message) ? stack.slice(message.length) : stack).split("\n");
	const out = [message];
	for (let i = 1; i < lines.length; i++) {
		if (/Generator\.next|~effect\/(?:Effect|Utils)/.test(lines[i])) break;
		out.push(lines[i]);
	}
	return annotations ? addStackAnnotations(out.join("\n"), annotations) : out.join("\n");
};
const addStackAnnotations = (stack, annotations) => {
	const frame = annotations?.get(StackTraceKey.key);
	if (frame) stack = `${stack}\n${currentStackTrace(frame)}`;
	return stack;
};
const interruptCauseStack = (error, interrupts) => {
	const out = [`${error.name}: ${error.message}`];
	for (const current of interrupts) {
		const fiberId = current.fiberId !== void 0 ? `#${current.fiberId}` : "unknown";
		const frame = current.annotations.get(InterruptorStackTrace.key);
		out.push(`    at fiber (${fiberId})`);
		if (frame) out.push(currentStackTrace(frame));
	}
	return out.join("\n");
};
const currentStackTrace = (frame) => {
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
			if (!match) out.push(`    at ${current.name} (${stack.replace(/^at /, "")})`);
		} else out.push(`    at ${current.name}`);
		current = current.parent;
		i++;
	}
	return out.join("\n");
};
const renderPrettyError = (e) => e.cause ? `${e.stack} {\n${renderErrorCause(e.cause, "  ")}\n}` : e.stack;
const renderErrorCause = (cause, prefix) => {
	const lines = cause.stack.split("\n");
	let stack = `${prefix}[cause]: ${lines[0]}`;
	for (let i = 1, len = lines.length; i < len; i++) stack += `\n${prefix}${lines[i]}`;
	if (cause.cause) stack += ` {\n${renderErrorCause(cause.cause, `${prefix}  `)}\n${prefix}}`;
	return stack;
};
/** @internal */
const FiberTypeId = "~effect/Fiber";
const fiberVariance = {
	_A: identity,
	_E: identity
};
const fiberIdStore = { id: 0 };
const AsyncResource = /*#__PURE__*/ (() => {
	try {
		return globalThis.process?.getBuiltinModule?.("node:async_hooks")?.AsyncResource;
	} catch {
		return;
	}
})();
const captureAsyncContext = () => AsyncResource === void 0 ? void 0 : new AsyncResource("effect/Fiber");
/** @internal */
const getCurrentFiber = () => globalThis[currentFiberTypeId];
/** @internal */
var FiberImpl = class {
	constructor(context, interruptible = true) {
		this.setContext(context);
		this.id = ++fiberIdStore.id;
		this.currentOpCount = 0;
		this.interruptible = interruptible;
		this._stack = [];
		this._observers = void 0;
		this._exit = void 0;
		this._children = void 0;
		this._interruptedCause = void 0;
		this._yielded = void 0;
		this._running = false;
		this._deferredInterrupt = false;
		this._parent = void 0;
		this._asyncContext = void 0;
		this.cache.runtimeMetrics?.recordFiberStart(this.context);
	}
	get [FiberTypeId]() {
		return fiberVariance;
	}
	get currentDispatcher() {
		return this._dispatcher ??= this.cache.scheduler.makeDispatcher();
	}
	getRef(ref) {
		return get$1(this.context, ref);
	}
	addObserver(cb) {
		if (this._exit) {
			cb(this._exit);
			return constVoid;
		}
		if (this._observers === void 0) this._observers = [cb];
		else this._observers.push(cb);
		return () => this.removeObserver(cb);
	}
	removeObserver(cb) {
		if (this._exit || this._observers === void 0) return;
		const index = this._observers.indexOf(cb);
		if (index >= 0) this._observers.splice(index, 1);
	}
	interruptUnsafe(fiberId, annotations) {
		if (this._exit) return;
		let cause = causeInterrupt(fiberId);
		if (this.cache.stackFrame) cause = causeAnnotate(cause, make$12(StackTraceKey, this.cache.stackFrame));
		if (annotations) cause = causeAnnotate(cause, annotations);
		this._interruptedCause = this._interruptedCause ? causeCombine(this._interruptedCause, cause) : cause;
		if (this.interruptible) {
			if (this._running) this._deferredInterrupt = true;
			else this.evaluate(failCause$2(this._interruptedCause));
		}
	}
	pollUnsafe() {
		return this._exit;
	}
	evaluate(effect) {
		if (this._exit) return;
		else if (this._asyncContext !== void 0) {
			const asyncContext = this._asyncContext;
			this._asyncContext = void 0;
			return asyncContext.runInAsyncScope(this.evaluate, this, effect);
		} else if (this._yielded !== void 0) {
			const yielded = this._yielded;
			this._yielded = void 0;
			yielded();
		}
		const exit = this.runLoop(effect);
		if (exit === Yield) {
			this._asyncContext = captureAsyncContext();
			return;
		}
		const interruptChildren = fiberMiddleware.interruptChildren && fiberMiddleware.interruptChildren(this);
		if (interruptChildren !== void 0) return this.evaluate(flatMap$1(interruptChildren, () => exit));
		this._exit = exit;
		this.cache.runtimeMetrics?.recordFiberEnd(this.context, this._exit);
		if (this._parent) {
			this._parent._children?.delete(this);
			this._parent = void 0;
		}
		if (this._observers !== void 0) {
			const observers = this._observers;
			this._observers = void 0;
			for (let i = 0; i < observers.length; i++) observers[i](exit);
		}
		this._stack.length = 0;
		this._children = void 0;
		this.context = empty$3();
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
					current = failCause$2(this._interruptedCause);
				}
				this.currentOpCount++;
				const cache = this.cache;
				if (!yielding && !cache.preventYield && cache.scheduler.shouldYield(this)) {
					yielding = true;
					const prev = current;
					current = flatMap$1(yieldNow$1, () => prev);
				}
				current = cache.tracerContext ? cache.tracerContext(current, this) : current[evaluate](this);
				if (current === Yield) {
					const yielded = this._yielded;
					if ("~effect/Exit" in yielded) {
						this._deferredInterrupt = false;
						this._yielded = void 0;
						return yielded;
					} else if (this._deferredInterrupt) {
						this._yielded = void 0;
						yielded();
						continue;
					}
					return Yield;
				}
			}
		} catch (error) {
			if (!hasProperty(current, "~effect/Effect/evaluate")) return exitDie(`Fiber.runLoop: Not a valid effect: ${String(current)}`);
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
			if (!op) return void 0;
			const all = op[contAll];
			if (all !== void 0) {
				const cont = all.call(op, this);
				if (cont) {
					cont[symbol] = cont;
					return cont;
				}
			}
			if (op[symbol]) return op;
		}
	}
	succeedWith(value) {
		if ((++this.currentOpCount & maxInlineSteps - 1) === 0) return exitSucceed(value);
		const cont = this.getCont(contA);
		return cont ? cont[contA](value, this) : this.yieldWith(exitSucceed(value));
	}
	yieldWith(value) {
		this._yielded = value;
		return Yield;
	}
	children() {
		return this._children ??= /* @__PURE__ */ new Set();
	}
	pipe() {
		return pipeArguments(this, arguments);
	}
	setContext(context) {
		const previous = this.context;
		this.context = context;
		if (previous !== void 0 && hasSameCache(previous, context)) return;
		const root = context.cacheRoot;
		const cache = root._fiberCache ??= makeFiberContextCache(context);
		if (this.cache?.scheduler !== cache.scheduler) this._dispatcher = void 0;
		this.cache = cache;
	}
	get currentSpanLocal() {
		const span = this.cache.span;
		return span?._tag === "Span" ? span : void 0;
	}
};
const makeFiberContextCache = (context) => {
	const currentTracer = getOrUndefinedUnsafe(context, TracerKey);
	return {
		scheduler: get$1(context, Scheduler),
		tracer: currentTracer,
		tracerContext: currentTracer ? currentTracer["context"] : void 0,
		tracerEnabled: get$1(context, TracerEnabled),
		span: getOrUndefinedUnsafe(context, ParentSpanKey),
		logLevel: get$1(context, CurrentLogLevel),
		minimumLogLevel: get$1(context, MinimumLogLevel),
		stackFrame: get$1(context, CurrentStackFrame),
		runtimeMetrics: getOrUndefinedUnsafe(context, FiberRuntimeMetricsKey),
		maxOpsBeforeYield: get$1(context, MaxOpsBeforeYield),
		preventYield: get$1(context, PreventSchedulerYield)
	};
};
const deferredInterruptCont = {
	[contA](_value, fiber) {
		return failCause$2(fiber._interruptedCause);
	},
	[contE](_cause, fiber) {
		return failCause$2(fiber._interruptedCause);
	}
};
const maxInlineSteps = 32;
const fiberMiddleware = { interruptChildren: void 0 };
const fiberStackAnnotations = (fiber) => {
	if (!fiber.cache.stackFrame) return void 0;
	const annotations = /* @__PURE__ */ new Map();
	annotations.set(InterruptorStackTrace.key, fiber.cache.stackFrame);
	return makeUnsafe$3(annotations);
};
/** @internal */
const fiberAwait = (self) => {
	const impl = self;
	if (impl._exit) return succeed$3(impl._exit);
	return callback$1((resume) => {
		if (impl._exit) return resume(succeed$3(impl._exit));
		return sync$1(self.addObserver((exit) => resume(succeed$3(exit))));
	});
};
/** @internal */
const fiberAwaitAll = (self) => callback$1((resume) => {
	const iter = self[Symbol.iterator]();
	const exits = [];
	let cancel = void 0;
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
		resume(succeed$3(exits));
	}
	loop();
	return sync$1(() => cancel?.());
});
/** @internal */
const fiberInterrupt = (self) => withFiber$1((fiber) => fiberInterruptAs(self, fiber.id));
/** @internal */
const fiberInterruptAs = /*#__PURE__*/ dual((args) => hasProperty(args[0], FiberTypeId), (self, fiberId, annotations) => withFiber$1((parent) => {
	let ann = fiberStackAnnotations(parent);
	ann = ann && annotations ? merge(ann, annotations) : ann ?? annotations;
	self.interruptUnsafe(fiberId, ann);
	return asVoid$1(fiberAwait(self));
}));
/** @internal */
const fiberInterruptAll = (fibers) => withFiber$1((parent) => {
	const annotations = fiberStackAnnotations(parent);
	let fiberArr = empty$2();
	for (const fiber of fibers) {
		fiber.interruptUnsafe(parent.id, annotations);
		fiberArr.push(fiber);
	}
	return asVoid$1(fiberAwaitAll(fiberArr));
});
/** @internal */
const succeed$3 = exitSucceed;
/** @internal */
const failCause$2 = exitFailCause;
/** @internal */
const fail$3 = exitFail;
/** @internal */
const sync$1 = /*#__PURE__*/ makePrimitive({
	op: "Sync",
	[evaluate](fiber) {
		const value = this[args]();
		const cont = fiber.getCont(contA);
		return cont ? cont[contA](value, fiber) : fiber.yieldWith(exitSucceed(value));
	}
});
/** @internal */
const suspend$1 = /*#__PURE__*/ makePrimitive({
	op: "Suspend",
	[evaluate](_fiber) {
		return this[args]();
	}
});
/** @internal */
const yieldNow$1 = /*#__PURE__*/ (/* @__PURE__ */ makePrimitive({
	op: "Yield",
	[evaluate](fiber) {
		let resumed = false;
		fiber.currentDispatcher.scheduleTask(() => {
			if (resumed) return;
			fiber.evaluate(exitVoid);
		}, this["~effect/Effect/args"] ?? 0);
		return fiber.yieldWith(() => {
			resumed = true;
		});
	}
}))(0);
/** @internal */
const failCauseSync$1 = (evaluate) => suspend$1(() => failCause$2(evaluate()));
/** @internal */
const die$2 = (defect) => exitDie(defect);
/** @internal */
const failSync = (error) => suspend$1(() => fail$3(error()));
/** @internal */
const void_$2 = /*#__PURE__*/ succeed$3(void 0);
/** @internal */
const try_$1 = (options) => {
	const evaluate = typeof options === "function" ? options : options.try;
	const catcher = typeof options === "function" ? (cause) => new UnknownError(cause, "An error occurred in Effect.try") : options.catch;
	return suspend$1(() => {
		try {
			return succeed$3(evaluate());
		} catch (err) {
			return fail$3(catcher(err));
		}
	});
};
/** @internal */
const tryPromise$1 = (options) => {
	const f = typeof options === "function" ? options : options.try;
	const catcher = typeof options === "function" ? (cause) => new UnknownError(cause, "An error occurred in Effect.tryPromise") : options.catch;
	return callbackOptions(function(resume, signal) {
		const failWithCatch = (cause) => suspend$1(() => {
			try {
				return fail$3(internalCall(() => catcher(cause)));
			} catch (err) {
				return die$2(err);
			}
		});
		try {
			f(signal).then((a) => resume(succeed$3(a)), (e) => resume(failWithCatch(e)));
		} catch (err) {
			resume(failWithCatch(err));
		}
	}, f.length !== 0);
};
/** @internal */
const withFiberId = (f) => withFiber$1((fiber) => f(fiber.id));
const callbackOptions = /*#__PURE__*/ function() {
	const Proto = /*#__PURE__*/ makePrimitiveProto({
		op: "Async",
		[evaluate](fiber) {
			let resumed = false;
			let yielded = false;
			const controller = this.withSignal ? new AbortController() : void 0;
			const onCancel = this.register.call(fiber.cache.scheduler, (effect) => {
				if (resumed) return;
				resumed = true;
				if (yielded) fiber.evaluate(effect);
				else yielded = effect;
			}, controller?.signal);
			if (yielded !== false) return yielded;
			yielded = true;
			fiber._yielded = () => {
				resumed = true;
			};
			if (controller === void 0 && onCancel === void 0) return Yield;
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
const asyncFinalizer = /*#__PURE__*/ makePrimitive({
	op: "AsyncFinalizer",
	[contAll](fiber) {
		if (fiber.interruptible) {
			fiber.interruptible = false;
			fiber._stack.push(setInterruptibleTrue);
		}
	},
	[contE](cause, _fiber) {
		return hasInterrupts(cause) ? flatMap$1(combineFinalizerCause(exitFailCause(cause), this[args]()), () => failCause$2(cause)) : failCause$2(cause);
	}
});
/** @internal */
const callback$1 = (register) => callbackOptions(register, register.length >= 2);
/** @internal */
const never$1 = /*#__PURE__*/ callback$1(constVoid);
/** @internal */
const gen$1 = (...args) => {
	if (args.length === 1) {
		const body = args[0];
		return suspend$1(() => fromIteratorUnsafe(body()));
	}
	const [options, body] = args;
	return suspend$1(() => fromIteratorUnsafe(body.call(options.self)));
};
/** @internal */
const fnUntraced = (body, ...pipeables) => {
	const fn = pipeables.length === 0 ? function() {
		return suspend$1(() => fromIteratorUnsafe(body.apply(this, arguments)));
	} : function() {
		let effect = suspend$1(() => fromIteratorUnsafe(body.apply(this, arguments)));
		for (let i = 0; i < pipeables.length; i++) effect = pipeables[i](effect, ...arguments);
		return effect;
	};
	return defineFunctionLength(body.length, fn);
};
const defineFunctionLength = (length, fn) => Object.defineProperty(fn, "length", {
	value: length,
	configurable: true
});
/** @internal */
const fnUntracedEager$1 = (body, ...pipeables) => defineFunctionLength(body.length, pipeables.length === 0 ? function() {
	return fromIteratorEagerUnsafe(() => body.apply(this, arguments));
} : function() {
	let effect = fromIteratorEagerUnsafe(() => body.apply(this, arguments));
	for (const pipeable of pipeables) effect = pipeable(effect, ...arguments);
	return effect;
});
const fromIteratorEagerUnsafe = (evaluate) => {
	try {
		const iterator = evaluate();
		let value = void 0;
		while (true) {
			const state = iterator.next(value);
			if (state.done) return succeed$3(state.value);
			const primitive = state.value;
			if (primitive && primitive._tag === "Success") {
				value = primitive.value;
				continue;
			} else if (primitive && primitive._tag === "Failure") return state.value;
			else {
				let isFirstExecution = true;
				return suspend$1(() => {
					if (isFirstExecution) {
						isFirstExecution = false;
						return flatMap$1(state.value, (value) => fromIteratorUnsafe(iterator, value));
					} else return suspend$1(() => fromIteratorUnsafe(evaluate()));
				});
			}
		}
	} catch (error) {
		return die$2(error);
	}
};
const fromIteratorUnsafe = /*#__PURE__*/ function() {
	const Proto = /*#__PURE__*/ makePrimitiveProto({
		op: "Iterator",
		[contA](value, fiber) {
			const iter = this.iterator;
			while (true) {
				const state = iter.next(value);
				if (state.done) return succeed$3(state.value);
				if (!effectIsExit(state.value)) {
					fiber._stack.push(this);
					return state.value;
				} else if (state.value._tag === "Failure") return state.value;
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
/** @internal */
const as$1 = /*#__PURE__*/ dual(2, (self, value) => new ContImpl(self, returnPayload, succeed$3(value)));
const evaluateCont = function(fiber) {
	fiber._stack.push(this);
	return this[args];
};
const OnSuccessProto = /*#__PURE__*/ makePrimitiveProto({
	op: "OnSuccess",
	[evaluate]: evaluateCont
});
const ContImpl = function(self, cont, payload) {
	this[args] = self;
	this[contA] = cont;
	this.payload = payload;
};
ContImpl.prototype = OnSuccessProto;
const returnPayload = function() {
	return this.payload;
};
const succeedPayload = function(_value, fiber) {
	return fiber.succeedWith(this.payload);
};
const continuationMarksStack = /*#__PURE__*/ (() => {
	const marker = "~effect/Effect/stackProbe";
	return { [marker]: function stackProbe() {
		return (/* @__PURE__ */ new Error()).stack;
	} }[marker]()?.includes("[as " + marker + "]") === true;
})();
const mapCont = function(value, fiber) {
	const f = this.payload;
	return fiber.succeedWith(continuationMarksStack ? f(value) : internalCall(() => f(value)));
};
const andThenCont = function(value) {
	const f = this.payload;
	return f(value);
};
const tapCont = function(value) {
	const f = this.payload;
	return new ContImpl(f(value), succeedPayload, value);
};
const tapEffectCont = function(value) {
	return new ContImpl(this.payload, succeedPayload, value);
};
/** @internal */
const asSome = (self) => map$2(self, some);
/** @internal */
const andThen$1 = /*#__PURE__*/ dual(2, (self, f) => new ContImpl(self, isEffect$1(f) ? returnPayload : andThenCont, f));
/** @internal */
const tap$1 = /*#__PURE__*/ dual(2, (self, f) => new ContImpl(self, isEffect$1(f) ? tapEffectCont : tapCont, f));
/** @internal */
const asVoid$1 = (self) => new ContImpl(self, returnPayload, exitVoid);
/** @internal */
const raceAll$1 = (all, options) => withFiber$1((parent) => {
	const fibers = /* @__PURE__ */ new Set();
	onExitUnsafe(parent, () => fibers.size === 0 ? void 0 : fiberInterruptAll(fibers));
	return callback$1((resume) => {
		const effects = fromIterable$1(all);
		const len = effects.length;
		let doneCount = 0;
		let done = false;
		const failures = [];
		const onExit = (exit, fiber, i) => {
			doneCount++;
			if (exit._tag === "Failure") {
				failures.push(...exit.cause.reasons);
				if (doneCount >= len) resume(failCause$2(causeFromReasons(failures)));
				return;
			}
			const isWinner = !done;
			done = true;
			resume(exit);
			if (isWinner && options?.onWinner) options.onWinner({
				fiber,
				index: i,
				parentFiber: parent
			});
		};
		for (let i = 0; i < len; i++) {
			const fiber = forkUnsafe(parent, effects[i], true, true, false);
			fibers.add(fiber);
			fiber.addObserver((exit) => {
				fibers.delete(fiber);
				onExit(exit, fiber, i);
			});
			if (done) break;
		}
	});
});
/** @internal */
const raceAllFirst = (all, options) => withFiber$1((parent) => {
	const fibers = /* @__PURE__ */ new Set();
	onExitUnsafe(parent, () => fibers.size === 0 ? void 0 : fiberInterruptAll(fibers));
	return callback$1((resume) => {
		let done = false;
		let i = 0;
		for (const effect of all) {
			if (done) break;
			const index = i++;
			const fiber = forkUnsafe(parent, effect, true, true, false);
			fibers.add(fiber);
			fiber.addObserver((exit) => {
				fibers.delete(fiber);
				const isWinner = !done;
				done = true;
				resume(exit);
				if (isWinner && options?.onWinner) options.onWinner({
					fiber,
					index,
					parentFiber: parent
				});
			});
		}
	});
});
/** @internal */
const raceFirst = /*#__PURE__*/ dual((args) => isEffect$1(args[1]), (self, that, options) => raceAllFirst([self, that], options));
/** @internal */
const flatMap$1 = /*#__PURE__*/ dual(2, (self, f) => new ContImpl(self, andThenCont, f));
/** @internal */
const effectIsExit = (effect) => effect[ExitTypeId] !== void 0;
/** @internal */
const flatMapEager$1 = /*#__PURE__*/ dual(2, (self, f) => {
	if (effectIsExit(self)) return self._tag === "Success" ? f(self.value) : self;
	return flatMap$1(self, f);
});
/** @internal */
const flatten$1 = (self) => flatMap$1(self, identity);
/** @internal */
const map$2 = /*#__PURE__*/ dual(2, (self, f) => new ContImpl(self, mapCont, f));
/** @internal */
const mapEager$1 = /*#__PURE__*/ dual(2, (self, f) => effectIsExit(self) ? exitMap(self, f) : map$2(self, f));
/** @internal */
const exitIsSuccess = (self) => self._tag === "Success";
/** @internal */
const exitIsFailure = (self) => self._tag === "Failure";
/** @internal */
const exitVoid = /*#__PURE__*/ exitSucceed(void 0);
/** @internal */
const exitMap = /*#__PURE__*/ dual(2, (self, f) => self._tag === "Success" ? exitSucceed(f(self.value)) : self);
/** @internal */
const exitAsVoidAll = (exits) => {
	const failures = [];
	for (const exit of exits) if (exit._tag === "Failure") failures.push(...exit.cause.reasons);
	return failures.length === 0 ? exitVoid : exitFailCause(causeFromReasons(failures));
};
/** @internal */
const updateContext = /*#__PURE__*/ dual(2, (self, f) => withFiber$1((fiber) => {
	const prevContext = fiber.context;
	const nextContext = f(prevContext);
	if (prevContext === nextContext) return self;
	fiber.setContext(nextContext);
	onExitUnsafe(fiber, () => {
		fiber.setContext(prevContext);
	});
	return self;
}));
/** @internal */
const provideService$1 = function() {
	if (arguments.length === 1) return dual(2, (self, impl) => provideServiceImpl(self, arguments[0], impl));
	return dual(3, (self, service, impl) => provideServiceImpl(self, service, impl)).apply(this, arguments);
};
const provideServiceImpl = (self, service, implementation) => updateContext(self, add(service, implementation));
/** @internal */
const catchCause$1 = /*#__PURE__*/ dual(2, (self, f) => new OnFailureImpl(self, f.length !== 1 ? (cause) => f(cause) : f));
const OnFailureProto = /*#__PURE__*/ makePrimitiveProto({
	op: "OnFailure",
	[evaluate]: evaluateCont
});
const OnFailureImpl = function(self, f) {
	this[args] = self;
	this[contE] = f;
};
OnFailureImpl.prototype = OnFailureProto;
/** @internal */
const catchCauseFilter = /*#__PURE__*/ dual(3, (self, filter, f) => catchCause$1(self, (cause) => {
	const eb = filter(cause);
	return isFailure$1(eb) ? failCause$2(eb.failure) : f(eb.success, cause);
}));
/** @internal */
const catch_$1 = /*#__PURE__*/ dual(2, (self, f) => catchCauseFilter(self, findError, (e) => f(e)));
/** @internal */
const catchDefect$1 = /*#__PURE__*/ dual(2, (self, f) => catchCauseFilter(self, findDefect, f));
/** @internal */
const mapError$1 = /*#__PURE__*/ dual(2, (self, f) => catch_$1(self, (error) => failSync(() => f(error))));
/** @internal */
const result = (self) => matchEager(self, {
	onFailure: fail$4,
	onSuccess: succeed$4
});
/** @internal */
const matchCauseEffect$1 = /*#__PURE__*/ dual(2, (self, options) => new OnSuccessAndFailureImpl(self, options.onSuccess.length !== 1 ? (a) => options.onSuccess(a) : options.onSuccess, options.onFailure.length !== 1 ? (cause) => options.onFailure(cause) : options.onFailure));
const OnSuccessAndFailureProto = /*#__PURE__*/ makePrimitiveProto({
	op: "OnSuccessAndFailure",
	[evaluate]: evaluateCont
});
const OnSuccessAndFailureImpl = function(self, onSuccess, onFailure) {
	this[args] = self;
	this[contA] = onSuccess;
	this[contE] = onFailure;
};
OnSuccessAndFailureImpl.prototype = OnSuccessAndFailureProto;
const matchSuccess = function(value, fiber) {
	const handlers = this.payload;
	return fiber.succeedWith(continuationMarksStack ? handlers.onSuccess(value) : internalCall(() => handlers.onSuccess(value)));
};
const makeMatch = (op, onFailure) => {
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
const MatchImpl = /*#__PURE__*/ makeMatch("Match", function(cause, fiber) {
	const fail = cause.reasons.find(isFailReason$1);
	if (fail === void 0) return failCause$2(cause);
	const handlers = this.payload;
	return fiber.succeedWith(continuationMarksStack ? handlers.onFailure(fail.error) : internalCall(() => handlers.onFailure(fail.error)));
});
/** @internal */
const match = /*#__PURE__*/ dual(2, (self, options) => new MatchImpl(self, options));
/** @internal */
const matchEager = /*#__PURE__*/ dual(2, (self, options) => {
	if (effectIsExit(self)) {
		if (self._tag === "Success") return exitSucceed(options.onSuccess(self.value));
		const error = findError(self.cause);
		if (isFailure$1(error)) return self;
		return exitSucceed(options.onFailure(error.success));
	}
	return match(self, options);
});
/** @internal */
const exit$1 = (self) => effectIsExit(self) ? exitSucceed(self) : exitPrimitive(self);
const exitPrimitive = /*#__PURE__*/ makePrimitive({
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
/** @internal */
const timeoutOrElse$1 = /*#__PURE__*/ dual(2, (self, options) => flatMap$1(timeoutOption(self, options.duration), (option) => isNone(option) ? options.orElse() : succeed$3(option.value)));
/** @internal */
const timeoutOption = /*#__PURE__*/ dual(2, (self, duration) => raceFirst(asSome(self), as$1(sleep(duration), none())));
/** @internal */
const ScopeTypeId = "~effect/Scope";
/** @internal */
const ScopeCloseableTypeId = "~effect/Scope/Closeable";
/** @internal */
const scopeClose = (self, exit_) => withFiber$1((fiber) => {
	const close = scopeCloseUnsafe(self, exit_);
	if (close === void 0) return void_$2;
	fiberEnterUninterruptibleUnsafe(fiber);
	return close;
});
/** @internal */
const scopeCloseUnsafe = (self, exit_) => {
	const state = self.state;
	if (state._tag === "Closed") return;
	self.state = {
		_tag: "Closed",
		exit: exit_
	};
	if (self.parent !== void 0) scopeRemoveFinalizerUnsafe(self.parent, self);
	if (state._tag === "Empty") return;
	if (state.finalizer !== void 0) return runFinalizer(state.finalizer, exit_);
	const finalizers = state.finalizers;
	if (finalizers.size === 1) return runFinalizer(finalizers.values().next().value, exit_);
	return scopeCloseFinalizers(self, finalizers, exit_);
};
const runFinalizer = (finalizer, exit_) => {
	try {
		return finalizer(exit_);
	} catch (defect) {
		return exitDie(defect);
	}
};
const combineFinalizerCause = (exit_, finalizer) => exitIsSuccess(exit_) ? finalizer : catchCause$1(finalizer, (cause) => failCause$2(causeCombine(exit_.cause, cause)));
const scopeCloseFinalizers = /*#__PURE__*/ fnUntraced(function* (self, finalizers, exit_) {
	let exits = [];
	const fibers = [];
	const arr = Array.from(finalizers.values());
	const parent = getCurrentFiber();
	for (let i = arr.length - 1; i >= 0; i--) {
		const finalizer = arr[i];
		if (self.strategy === "sequential") exits.push(yield* exit$1(runFinalizer(finalizer, exit_)));
		else fibers.push(forkUnsafe(parent, runFinalizer(finalizer, exit_), true, true, "inherit"));
	}
	if (fibers.length > 0) exits = yield* fiberAwaitAll(fibers);
	return yield* exitAsVoidAll(exits);
});
/** @internal */
const scopeAddFinalizerUnsafe = (scope, key, finalizer) => {
	if (scope.state._tag === "Empty") scope.state = {
		_tag: "Open",
		finalizerKey: key,
		finalizer,
		finalizers: void 0
	};
	else if (scope.state._tag === "Open") {
		const state = scope.state;
		if (state.finalizer !== void 0) {
			state.finalizers = /* @__PURE__ */ new Map([[state.finalizerKey, state.finalizer]]);
			state.finalizerKey = void 0;
			state.finalizer = void 0;
			state.finalizers.set(key, finalizer);
		} else state.finalizers.set(key, finalizer);
	}
};
/** @internal */
const scopeRemoveFinalizerUnsafe = (scope, key) => {
	if (scope.state._tag !== "Open") return;
	const state = scope.state;
	if (state.finalizerKey === key) scope.state = constScopeEmpty;
	else if (state.finalizers !== void 0) {
		state.finalizers.delete(key);
		if (state.finalizers.size === 0) scope.state = constScopeEmpty;
	}
};
/** @internal */
const scopeMakeUnsafe = (finalizerStrategy) => makeScope(finalizerStrategy, void 0);
const makeScope = (finalizerStrategy = "sequential", parent) => ({
	[ScopeCloseableTypeId]: ScopeCloseableTypeId,
	[ScopeTypeId]: ScopeTypeId,
	strategy: finalizerStrategy,
	parent,
	state: constScopeEmpty
});
const constScopeEmpty = { _tag: "Empty" };
/** @internal */
const scopeMake = (finalizerStrategy) => sync$1(() => scopeMakeUnsafe(finalizerStrategy));
const OnExitImpl = /*#__PURE__*/ function() {
	const Proto = /*#__PURE__*/ makePrimitiveProto({
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
			return eff ? flatMap$1(eff, (_) => exit) : exit;
		},
		[contE](cause, _, exit) {
			exit ??= exitFailCause(cause);
			let eff;
			try {
				eff = this.onExit(exit);
			} catch (defect) {
				eff = exitDie(defect);
			}
			return eff ? flatMap$1(combineFinalizerCause(exit, eff), (_) => exit) : exit;
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
/** @internal */
const onExitPrimitive = (effect, onExit, interruptible) => new OnExitImpl(effect, onExit, interruptible);
/**
* Pushes an exit finalizer for the current `withFiber` evaluation. Only call inside `withFiber`.
* @internal
*/
const onExitUnsafe = (fiber, f) => {
	fiber._stack.push(new OnExitImpl(void 0, f, void 0));
};
/** @internal */
const onExit$1 = /*#__PURE__*/ dual(2, onExitPrimitive);
/** @internal */
const ensuring$1 = /*#__PURE__*/ dual(2, (self, finalizer) => onExit$1(self, (_) => finalizer));
/** @internal */
const acquireUseRelease$1 = (acquire, use, release) => uninterruptibleMask$1((restore) => flatMap$1(acquire, (a) => onExitPrimitive(suspend$1(() => restore(use(a))), (exit) => release(a, exit), true)));
/** @internal */
const interrupt$1 = /*#__PURE__*/ withFiber$1((fiber) => failCause$2(causeInterrupt(fiber.id)));
/** @internal */
const uninterruptible = (self) => withFiber$1((fiber) => {
	if (!fiber.interruptible) return self;
	fiber.interruptible = false;
	fiber._stack.push(setInterruptibleTrue);
	return self;
});
const setInterruptible = /*#__PURE__*/ makePrimitive({
	op: "SetInterruptible",
	[contAll](fiber) {
		fiber.interruptible = this[args];
		if (fiber._interruptedCause && fiber.interruptible) return () => failCause$2(fiber._interruptedCause);
	}
});
const setInterruptibleTrue = /*#__PURE__*/ setInterruptible(true);
const setInterruptibleFalse = /*#__PURE__*/ setInterruptible(false);
const setFiberInterruptible = (fiber) => {
	fiber.interruptible = true;
	fiber._stack.push(setInterruptibleFalse);
	if (fiber._interruptedCause) return failCause$2(fiber._interruptedCause);
};
/**
* Makes the current fiber uninterruptible for the returned effect without an
* extra primitive. Call only within `withFiber`.
*
* @internal
*/
const fiberEnterUninterruptibleUnsafe = (fiber) => {
	const impl = fiber;
	if (!impl.interruptible) return;
	impl.interruptible = false;
	impl._stack.push(setInterruptibleTrue);
};
/** @internal */
const interruptible = (self) => withFiber$1((fiber) => {
	if (fiber.interruptible) return self;
	return setFiberInterruptible(fiber) ?? self;
});
/** @internal */
const uninterruptibleMask$1 = (f) => withFiber$1((fiber) => {
	if (!fiber.interruptible) return f(identity);
	fiber.interruptible = false;
	fiber._stack.push(setInterruptibleTrue);
	return f(interruptible);
});
/** @internal */
const all$1 = (arg, options) => {
	if (isIterable(arg)) return options?.mode === "result" ? forEach$1(arg, result, options) : forEach$1(arg, identity, options);
	else if (options?.discard) return options.mode === "result" ? forEach$1(Object.values(arg), result, options) : forEach$1(Object.values(arg), identity, options);
	return suspend$1(() => {
		const out = {};
		return as$1(forEach$1(Object.entries(arg), ([key, effect]) => map$2(options?.mode === "result" ? result(effect) : effect, (value) => {
			assignProperty(out, key, value);
		}), {
			discard: true,
			concurrency: options?.concurrency
		}), out);
	});
};
/** @internal */
const whileLoop = /*#__PURE__*/ makePrimitive({
	op: "While",
	[contA](value, fiber) {
		this[args].step(value);
		if (this["~effect/Effect/args"].while()) {
			fiber._stack.push(this);
			return this[args].body();
		}
		return exitVoid;
	},
	[evaluate](fiber) {
		if (this["~effect/Effect/args"].while()) {
			fiber._stack.push(this);
			return this[args].body();
		}
		return exitVoid;
	}
});
/** @internal */
const forEach$1 = /*#__PURE__*/ dual((args) => typeof args[1] === "function", (iterable, f, options) => suspend$1(() => {
	const concurrency = resolveConcurrency(options?.concurrency);
	if (concurrency === 1) return forEachSequential(iterable, f, options);
	const items = fromIterable$1(iterable);
	let length = items.length;
	if (length === 0) return options?.discard ? void_$2 : succeed$3([]);
	const out = options?.discard ? void 0 : new Array(length);
	const eff = forEachConcurrent({
		f,
		out
	}, items, { concurrency });
	return eff ? as$1(eff, out) : succeed$3(out);
}));
const forEachSequential = (iterable, f, options) => suspend$1(() => {
	const out = options?.discard ? void 0 : [];
	const iterator = iterable[Symbol.iterator]();
	let state = iterator.next();
	let index = 0;
	return as$1(whileLoop({
		while: () => !state.done,
		body: () => f(state.value, index++),
		step: (b) => {
			if (out) out.push(b);
			state = iterator.next();
		}
	}), out);
});
/** @internal */
const resolveConcurrency = (concurrency) => concurrency === "unbounded" ? Number.POSITIVE_INFINITY : Math.max(1, concurrency ?? 1);
/** @internal */
const iterateEager = () => (options) => {
	const onItem = options.onItem;
	const step = options.step;
	const resumeSequential = (state, items, index, end, effect) => flatMap$1(exit$1(effect), (itemExit) => step(state, items[index], itemExit, index) ?? runSequential(state, items, index + 1, end) ?? void_$2);
	const runSequential = (state, items, index = 0, end = items.length) => {
		for (; index < end; index++) {
			const item = items[index];
			const effect = onItem(state, item, index);
			if (!effectIsExit(effect)) return resumeSequential(state, items, index, end, effect);
			const terminal = step(state, item, effect, index);
			if (terminal) return terminal._tag === "Failure" ? terminal : void 0;
		}
	};
	return runSequential;
};
const iterateConcurrentImpl = (options) => {
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
			return fibers && fibers.size > 0 ? flatMap$1(uninterruptible(fiberInterruptAll(Array.from(fibers))), () => terminal ?? defect) : defect;
		};
		const go = () => {
			let paused = false;
			for (; !terminal && index < end; index++) {
				const item = items[index];
				const eff = effect ?? onItem(state, item, index);
				if (effectIsExit(eff)) {
					terminal = step(state, item, eff, index);
					if (terminal) break;
				} else if (!parentFiber) return callback$1((cb) => {
					parentFiber = getCurrentFiber();
					fibers = /* @__PURE__ */ new Set();
					effect = eff;
					resume = cb;
					let result;
					try {
						result = go();
					} catch (error) {
						return cb(failDefect(error));
					}
					if (result) return cb(result);
					return suspend$1(() => {
						terminal ??= exitVoid;
						return flatMap$1(fibers ? fiberInterruptAll(fibers) : void_$2, () => terminal?._tag === "Failure" ? terminal : void_$2);
					});
				});
				else {
					effect = void 0;
					const fiber = forkUnsafe(parentFiber, eff, true, true, "inherit");
					if (fiber._exit) {
						terminal = step(state, item, fiber._exit, index);
						if (terminal) break;
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
								if (eff) resume(eff);
							} else if (done && fibers.size === 0) resume(terminal ?? void_$2);
						} catch (error) {
							resume(failDefect(error));
						}
					});
					if (fibers.size < concurrency) continue;
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
				if (resume || terminal._tag === "Failure") return terminal;
			} else if (resume) {
				if (!fibers) return exitVoid;
				else if (fibers.size === 0) resume(void_$2);
			}
		};
		return go();
	};
};
/** @internal */
const iterateConcurrent = () => (options) => iterateConcurrentImpl(options);
const forEachConcurrent = /*#__PURE__*/ iterateConcurrentImpl({
	onItem(state, item, index) {
		return state.f(item, index);
	},
	step(state, _, exit, index) {
		if (exit._tag === "Failure") return exit;
		else if (state.out) state.out[index] = exit.value;
	}
});
/** @internal */
const forkUnsafe = (parent, effect, immediate = false, daemon = false, uninterruptible = false) => {
	const parentRuntime = parent;
	const interruptible = uninterruptible === "inherit" ? parentRuntime.interruptible : !uninterruptible;
	const child = new FiberImpl(parentRuntime.context, interruptible);
	if (immediate) child.evaluate(effect);
	else {
		child._asyncContext = captureAsyncContext();
		parentRuntime.currentDispatcher.scheduleTask(() => child.evaluate(effect), 0);
	}
	if (!daemon && !child._exit) {
		parentRuntime.children().add(child);
		child._parent = parentRuntime;
	}
	return child;
};
/** @internal */
const forkIn$1 = /*#__PURE__*/ dual((args) => isEffect$1(args[0]), (self, scope, options) => withFiber$1((parent) => {
	const fiber = forkUnsafe(parent, self, options?.startImmediately, true, options?.uninterruptible);
	if (!fiber._exit) {
		if (scope.state._tag !== "Closed") {
			const key = {};
			const finalizer = () => withFiberId((interruptor) => interruptor === fiber.id ? void_$2 : fiberInterrupt(fiber));
			scopeAddFinalizerUnsafe(scope, key, finalizer);
			fiber.addObserver(() => scopeRemoveFinalizerUnsafe(scope, key));
		} else fiber.interruptUnsafe(parent.id, fiberStackAnnotations(parent));
	}
	return succeed$3(fiber);
}));
/** @internal */
const runForkWith = (context) => (effect, options) => {
	const fiber = new FiberImpl(options?.scheduler ? add(context, Scheduler, options.scheduler) : context, options?.uninterruptible !== true);
	fiber.evaluate(effect);
	if (fiber._exit) return fiber;
	if (options?.signal) {
		if (options.signal.aborted) fiber.interruptUnsafe();
		else {
			const abort = () => fiber.interruptUnsafe();
			options.signal.addEventListener("abort", abort, { once: true });
			fiber.addObserver(() => options.signal.removeEventListener("abort", abort));
		}
	}
	if (options?.onFiberStart) options.onFiberStart(fiber);
	return fiber;
};
/** @internal */
const runPromiseExitWith = (context) => {
	const runFork = runForkWith(context);
	return (effect, options) => {
		const fiber = runFork(effect, options);
		return new Promise((resolve) => {
			fiber.addObserver((exit) => resolve(exit));
		});
	};
};
/** @internal */
const runPromiseWith = (context) => {
	const runPromiseExit = runPromiseExitWith(context);
	return (effect, options) => runPromiseExit(effect, options).then((exit) => {
		if (exit._tag === "Failure") throw causeSquash(exit.cause);
		return exit.value;
	});
};
/** @internal */
const runPromise$1 = /*#__PURE__*/ runPromiseWith(/*#__PURE__*/ empty$3());
/** @internal */
const runSyncExitWith = (context) => {
	const runFork = runForkWith(context);
	return (effect) => {
		if (effectIsExit(effect)) return effect;
		const scheduler = new MixedScheduler("sync");
		const fiber = runFork(effect, { scheduler });
		fiber._dispatcher?.flush();
		return fiber._exit ?? exitDie(new AsyncFiberError(fiber));
	};
};
/** @internal */
const runSyncExit$1 = /*#__PURE__*/ runSyncExitWith(/*#__PURE__*/ empty$3());
/** @internal */
const ClockRef = /*#__PURE__*/ Reference("effect/Clock", { defaultValue: () => new ClockImpl() });
const MAX_TIMER_MILLIS = 2 ** 31 - 1;
var ClockImpl = class {
	currentTimeMillisUnsafe() {
		return Date.now();
	}
	currentTimeMillis = /*#__PURE__*/ sync$1(() => this.currentTimeMillisUnsafe());
	currentTimeNanosUnsafe() {
		return wallTimeNanos();
	}
	currentTimeNanos = /*#__PURE__*/ sync$1(() => this.currentTimeNanosUnsafe());
	monotonicTimeNanosUnsafe() {
		return monotonicNowNanos();
	}
	monotonicTimeNanos = /*#__PURE__*/ sync$1(() => this.monotonicTimeNanosUnsafe());
	sleep(duration) {
		return this.sleepMillis(toMillis(duration));
	}
	sleepMillis(millis) {
		if (millis <= 0) return yieldNow$1;
		else if (!Number.isFinite(millis)) return never$1;
		return callback$1((resume) => {
			const continuation = millis > MAX_TIMER_MILLIS ? this.sleepMillis(millis - MAX_TIMER_MILLIS) : void_$2;
			const handle = setTimeout(() => resume(continuation), Math.min(millis, MAX_TIMER_MILLIS));
			return sync$1(() => clearTimeout(handle));
		});
	}
};
const nanosPerMilli = /*#__PURE__*/ BigInt(1e6);
const monotonicNowNanos = /*#__PURE__*/ function() {
	const processHrtime = globalThis.process?.hrtime;
	if (typeof processHrtime?.bigint === "function") return () => processHrtime.bigint();
	if (typeof performance !== "undefined" && typeof performance.now === "function") return () => BigInt(Math.round(performance.now() * 1e6));
	let previous = /*#__PURE__*/ BigInt(0);
	return () => {
		const current = BigInt(Date.now()) * nanosPerMilli;
		if (current > previous) previous = current;
		return previous;
	};
}();
const wallTimeNanos = /*#__PURE__*/ function() {
	const reanchorThresholdNanos = /*#__PURE__*/ BigInt(1e9);
	let origin;
	return () => {
		const monotonic = monotonicNowNanos();
		const wall = BigInt(Date.now()) * nanosPerMilli;
		if (origin === void 0) origin = wall - monotonic;
		else {
			const projected = origin + monotonic;
			if ((wall > projected ? wall - projected : projected - wall) > reanchorThresholdNanos) origin = wall - monotonic;
		}
		return origin + monotonic;
	};
}();
/** @internal */
const clockWith = (f) => withFiber$1((fiber) => f(fiber.getRef(ClockRef)));
/** @internal */
const sleep = (duration) => clockWith((clock) => clock.sleep(fromInputUnsafe(duration)));
/** @internal */
const AsyncFiberErrorTypeId = "~effect/Cause/AsyncFiberError";
/** @internal */
var AsyncFiberError = class extends (/*#__PURE__*/ TaggedError$2("AsyncFiberError")) {
	[AsyncFiberErrorTypeId] = AsyncFiberErrorTypeId;
	constructor(fiber) {
		super({
			message: "An asynchronous Effect was executed with Effect.runSync",
			fiber
		});
	}
};
/** @internal */
const UnknownErrorTypeId = "~effect/Cause/UnknownError";
/** @internal */
var UnknownError = class extends (/*#__PURE__*/ TaggedError$2("UnknownError")) {
	[UnknownErrorTypeId] = UnknownErrorTypeId;
	constructor(cause, message) {
		super({
			message,
			cause
		});
	}
};
const colors = {
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
colors.gray, colors.blue, colors.green, colors.yellow, colors.red, colors.bgBrightRed, colors.black;
/** @internal */
const undefined_$1 = /*#__PURE__*/ succeed$3(void 0);
// node_modules/effect/dist/Cause.js
/**
* Narrows a `Reason` to `Fail`.
*
* **When to use**
*
* Use as a predicate for `Array.filter` to pick out typed `Fail` reasons when
* iterating over `cause.reasons`.
*
* **Example** (Filtering fail reasons)
*
* ```ts import.meta.vitest
* import { Cause } from "effect"
*
* const cause = Cause.fail("error")
* const fails = cause.reasons.filter(Cause.isFailReason)
* fails[0].error // => "error"
* ```
*
* @see {@link isDieReason} — narrow to `Die`
* @see {@link isInterruptReason} — narrow to `Interrupt`
*
* @category guards
* @since 4.0.0
*/
const isFailReason = isFailReason$1;
/**
* Narrows a `Reason` to `Interrupt`.
*
* **When to use**
*
* Use as a predicate for `Array.filter` to pick out `Interrupt` reasons when
* iterating over `cause.reasons`.
*
* **Example** (Filtering interrupt reasons)
*
* ```ts import.meta.vitest
* import { Cause } from "effect"
*
* const cause = Cause.interrupt(123)
* const interrupts = cause.reasons.filter(Cause.isInterruptReason)
* interrupts[0].fiberId // => 123
* ```
*
* @see {@link isFailReason} — narrow to `Fail`
* @see {@link isDieReason} — narrow to `Die`
*
* @category guards
* @since 4.0.0
*/
const isInterruptReason = isInterruptReason$1;
/**
* Creates a `Cause` containing a single `Die` reason with the
* given defect.
*
* **When to use**
*
* Use to construct a cause from an untyped defect or unexpected thrown value.
*
* **Example** (Creating a die cause)
*
* ```ts import.meta.vitest
* import { Cause } from "effect"
*
* Cause.die("Unexpected") // => Cause.fromReasons([Cause.makeDieReason("Unexpected")])
* ```
*
* @see {@link fail} — for typed errors
* @see {@link interrupt} — for fiber interruptions
*
* @category constructors
* @since 2.0.0
*/
const die$1 = causeDie;
/**
* Returns `true` if every reason in the cause is an `Interrupt` (and
* there is at least one reason).
*
* **When to use**
*
* Use when you need to detect failures caused only by interruption.
*
* **Example** (Checking interrupt-only causes)
*
* ```ts import.meta.vitest
* import { Cause } from "effect"
*
* Cause.hasInterruptsOnly(Cause.interrupt(123)) // => true
* Cause.hasInterruptsOnly(Cause.fail("error")) // => false
* Cause.hasInterruptsOnly(Cause.empty) // => false
* ```
*
* @see {@link hasInterrupts} — `true` if the cause contains *any* interrupts
*
* @category predicates
* @since 4.0.0
*/
const hasInterruptsOnly = hasInterruptsOnly$1;
/**
* Transforms the typed error values inside a `Cause` using the
* provided function. Only `Fail` reasons are affected; `Die` and `Interrupt`
* reasons pass through unchanged.
*
* **When to use**
*
* Use to transform expected typed failures while preserving defects and
* interruptions unchanged.
*
* **Details**
*
* If at least one `Fail` reason exists, this returns a new `Cause`
* containing the mapped failures. If the cause has no `Fail` reasons, the
* original cause is returned unchanged.
*
* **Example** (Mapping errors to uppercase)
*
* ```ts import.meta.vitest
* import { Cause } from "effect"
*
* const cause = Cause.fail("error")
* const mapped = Cause.map(cause, (e) => e.toUpperCase())
* const reason = mapped.reasons[0]
* if (Cause.isFailReason(reason)) {
*   reason.error // => "ERROR"
* }
* ```
*
* @category mapping
* @since 2.0.0
*/
const map$1 = causeMap;
/**
* Collapses a `Cause` into a single `unknown` value, picking the "most
* important" failure in this order:
*
* **When to use**
*
* Use to collapse a structured cause to the single value that synchronous and
* promise runners would throw.
*
* **Details**
*
* 1. First `Fail` error (the `E` value)
* 2. First `Die` defect
* 3. A generic `Error("All fibers interrupted without error")` for interrupt-only causes
* 4. A generic `Error("Empty cause")` for `empty`
*
* This is the function used by `Effect.runPromise` and `Effect.runSync` to
* decide what to throw.
*
* **Gotchas**
*
* This function is lossy. Use {@link prettyErrors} or iterate `cause.reasons`
* when you need all failures.
*
* **Example** (Squashing a cause)
*
* ```ts import.meta.vitest
* import { Cause } from "effect"
*
* Cause.squash(Cause.fail("error")) // => "error"
* Cause.squash(Cause.die("defect")) // => "defect"
* ```
*
* @see {@link prettyErrors} — non-lossy conversion to `Array<Error>`
* @see {@link pretty} — human-readable string rendering
*
* @category destructors
* @since 2.0.0
*/
const squash = causeSquash;
/**
* Converts a `Cause` into an `Array<Error>` suitable for logging or
* rethrowing.
*
* **When to use**
*
* Use to convert every renderable failure in a cause into individual `Error`
* values before logging or rethrowing.
*
* **Details**
*
* Each `Fail` and `Die` reason is converted into a standard
* `Error`:
*
* - **Objects / Error instances** — `message`, `name`, `stack`, and `cause`
*   are preserved. Extra enumerable properties are copied. Stack traces are
*   cleaned up and enriched with span annotations when available.
* - **Strings** — used directly as the `Error` message.
* - **Other primitives** (`null`, `undefined`, numbers, …) — wrapped in an
*   `Error` with message `"Unknown error: <value>"`.
*
* `Interrupt` reasons are collected separately. If the cause contains
* **only** interrupts (no `Fail` or `Die`), a single `InterruptError` is
* returned whose `cause` lists the interrupting fiber IDs.
*
* An empty cause returns an empty array.
*
* **Example** (Converting a cause to errors)
*
* ```ts import.meta.vitest
* import { Cause } from "effect"
*
* Cause.prettyErrors(Cause.fail(new Error("boom")))[0].message // => "boom"
* ```
*
* @see {@link pretty} — renders the cause as a single string
* @see {@link squash} — lossy collapse to a single thrown value
*
* @category formatting
* @since 3.2.0
*/
const prettyErrors = causePrettyErrors;
// node_modules/effect/dist/Exit.js
/**
* Creates a successful Exit containing the given value.
*
* **When to use**
*
* Use when you need an Exit that contains a known success value.
*
* **Details**
*
* Returns a `Success<A>` with the provided value. Does not perform any
* computation.
*
* **Example** (Creating a successful Exit)
*
* ```ts import.meta.vitest
* import { Exit } from "effect"
*
* Exit.succeed(42) // => Exit.succeed(42)
* ```
*
* @see {@link fail} to create a failed Exit
* @see {@link void_ void} for a pre-allocated success with no value
*
* @category constructors
* @since 2.0.0
*/
const succeed$2 = exitSucceed;
/**
* Creates a failed Exit from a Cause.
*
* **When to use**
*
* Use when you already have a `Cause<E>` and want to wrap it in an Exit
* for advanced error handling where you need full control over the Cause
* structure.
*
* **Details**
*
* Returns a `Failure<never, E>`. If you only have an error value, use
* {@link fail} instead.
*
* **Example** (Creating a failed Exit from a Cause)
*
* ```ts import.meta.vitest
* import { Cause, Exit } from "effect"
*
* Exit.failCause(Cause.fail("Something went wrong")) // => Exit.fail("Something went wrong")
* ```
*
* @see {@link fail} to create a Failure from a plain error value
* @see {@link die} to create a Failure from a defect
*
* @category constructors
* @since 2.0.0
*/
const failCause$1 = exitFailCause;
/**
* Creates a failed Exit from a typed error value.
*
* **When to use**
*
* Use when you need to represent an expected typed failure as an `Exit`.
*
* **Details**
*
* The error is wrapped in a `Cause.Fail` internally.
*
* Returns a `Failure<never, E>`.
*
* **Example** (Creating a failed Exit)
*
* ```ts import.meta.vitest
* import { Exit } from "effect"
*
* Exit.fail("Something went wrong") // => Exit.fail("Something went wrong")
* ```
*
* @see {@link succeed} to create a successful Exit
* @see {@link die} to create a Failure from an unexpected defect
* @see {@link failCause} to create a Failure from a full Cause
*
* @category constructors
* @since 2.0.0
*/
const fail$2 = exitFail;
const void_$1 = exitVoid;
/**
* Checks whether an Exit is a Success.
*
* **When to use**
*
* Use as a type guard to narrow `Exit<A, E>` to `Success<A, E>` and access the
* `value` property.
*
* **Example** (Narrowing to success)
*
* ```ts import.meta.vitest
* import { Exit } from "effect"
*
* const exit = Exit.succeed(42)
*
* if (Exit.isSuccess(exit)) {
*   exit.value // => 42
* }
* ```
*
* @see {@link isFailure} for the opposite check
* @see {@link match} for exhaustive pattern matching
*
* @category guards
* @since 2.0.0
*/
const isSuccess = exitIsSuccess;
/**
* Checks whether an Exit is a Failure.
*
* **When to use**
*
* Use as a type guard to narrow `Exit<A, E>` to `Failure<A, E>` and access the
* `cause` property.
*
* **Example** (Narrowing to failure)
*
* ```ts import.meta.vitest
* import { Cause, Exit } from "effect"
*
* const exit = Exit.fail("error")
*
* if (Exit.isFailure(exit)) {
*   exit.cause // => Cause.fail("error")
* }
* ```
*
* @see {@link isSuccess} for the opposite check
* @see {@link match} for exhaustive pattern matching
*
* @category guards
* @since 2.0.0
*/
const isFailure = exitIsFailure;
const DeferredProto = {
	["~effect/Deferred"]: {
		_A: identity,
		_E: identity
	},
	pipe() {
		return pipeArguments(this, arguments);
	}
};
const DeferredImpl = function() {
	this.resumes = void 0;
	this.effect = void 0;
};
DeferredImpl.prototype = DeferredProto;
/**
* Creates an empty `Deferred` synchronously outside the `Effect` runtime.
*
* **When to use**
*
* Use to allocate a `Deferred` synchronously when direct allocation outside
* `Effect` is required.
*
* **Example** (Creating a Deferred unsafely)
*
* ```ts import.meta.vitest
* import { Deferred } from "effect"
*
* const deferred = Deferred.makeUnsafe<number>()
* Deferred.isDoneUnsafe(deferred) // => false
* ```
*
* @category unsafe
* @since 4.0.0
*/
const makeUnsafe$2 = () => new DeferredImpl();
const _await = (self) => callback$1((resume) => {
	if (self.effect) return resume(self.effect);
	self.resumes ??= [];
	self.resumes.push(resume);
	return sync$1(() => {
		const resumes = self.resumes;
		if (resumes === void 0) return;
		const index = resumes.indexOf(resume);
		if (index >= 0) resumes.splice(index, 1);
	});
});
/**
* Returns whether this `Deferred` has already been completed synchronously.
*
* **When to use**
*
* Use to check `Deferred` completion synchronously in code that cannot return
* an `Effect`, such as low-level integration code.
*
* @see {@link isDone} for checking completion inside `Effect`
* @see {@link poll} for reading the completed effect when available
*
* @category predicates
* @since 4.0.0
*/
const isDoneUnsafe = (self) => self.effect !== void 0;
/**
* Attempts to complete the `Deferred` synchronously with the specified
* completion effect.
*
* **When to use**
*
* Use to complete a `Deferred` synchronously in low-level code that already has
* the completion effect.
*
* **Details**
*
* This mutates the `Deferred` directly and should be reserved for low-level
* code; prefer the effectful completion APIs when possible. Returns `true` if
* this call completed the `Deferred`, or `false` if it was already completed.
*
* **Example** (Completing a Deferred unsafely)
*
* ```ts import.meta.vitest
* import { Deferred, Effect } from "effect"
*
* const deferred = Deferred.makeUnsafe<number>()
* Deferred.doneUnsafe(deferred, Effect.succeed(42)) // => true
* ```
*
* @category unsafe
* @since 4.0.0
*/
const doneUnsafe = (self, effect) => {
	if (self.effect) return false;
	self.effect = effect;
	if (self.resumes) {
		const resumes = self.resumes;
		self.resumes = void 0;
		for (let i = 0; i < resumes.length; i++) resumes[i](effect);
	}
	return true;
};
// node_modules/effect/dist/Scope.js
/**
* Controls how long resources stay open.
*
* A scope is a lifetime boundary. Code can register cleanup effects on it, and
* closing the scope runs those cleanups with the `Exit` value that ended the
* work. Most application code uses higher-level APIs such as `Effect.scoped`
* and `Layer`, while this module is useful when code needs to create, provide,
* fork, close, or inspect scopes directly.
*
* @since 2.0.0
*/
/**
* Creates a new `Scope` with the specified finalizer strategy.
*
* **Example** (Creating a scope)
*
* ```ts import.meta.vitest
* import { Effect, Exit, Scope } from "effect"
*
* const cleanups: Array<string> = []
* const program = Effect.gen(function*() {
*   const scope = yield* Scope.make("sequential")
*   yield* Scope.addFinalizer(scope, Effect.sync(() => cleanups.push("Cleanup 1")))
*   yield* Scope.addFinalizer(scope, Effect.sync(() => cleanups.push("Cleanup 2")))
*   yield* Scope.close(scope, Exit.void)
* })
*
* Effect.runSync(program)
* cleanups // => ["Cleanup 2", "Cleanup 1"]
* ```
*
* @category constructors
* @since 2.0.0
*/
const make$10 = scopeMake;
/**
* Closes a scope and runs its registered finalizers.
*
* **When to use**
*
* Use to close a scope manually with a specific exit value.
*
* **Details**
*
* Finalizers run in the scope's configured order and receive the supplied
* `Exit`.
* By default, finalizers run uninterruptibly, so interrupting the closing fiber
* waits for them to finish; a finalizer can explicitly restore interruptibility.
*
* **Example** (Running scope finalizers)
*
* ```ts import.meta.vitest
* import { Effect, Exit, Scope } from "effect"
*
* const events: Array<string> = []
* const resourceManagement = Effect.gen(function*() {
*   const scope = yield* Scope.make("sequential")
*   yield* Scope.addFinalizer(scope, Effect.sync(() => events.push("database")))
*   yield* Scope.addFinalizer(scope, Effect.sync(() => events.push("file")))
*   yield* Scope.addFinalizer(scope, Effect.sync(() => events.push("memory")))
*   events.push("work")
*   yield* Scope.close(scope, Exit.succeed("Success!"))
* })
*
* Effect.runSync(resourceManagement)
* events // => ["work", "memory", "file", "database"]
* ```
*
* @category combinators
* @since 2.0.0
*/
const close = scopeClose;
// node_modules/effect/dist/internal/dateTime.js
/** @internal */
const TypeId$8 = "~effect/DateTime";
/** @internal */
const TimeZoneTypeId = "~effect/DateTime/TimeZone";
const Proto$2 = {
	[TypeId$8]: TypeId$8,
	pipe() {
		return pipeArguments(this, arguments);
	},
	[NodeInspectSymbol]() {
		return this.toString();
	},
	toJSON() {
		return toDateUtc$1(this).toJSON();
	}
};
({ ...Proto$2 });
({ ...Proto$2 });
const ProtoTimeZone = {
	[TimeZoneTypeId]: TimeZoneTypeId,
	[NodeInspectSymbol]() {
		return this.toString();
	}
};
({ ...ProtoTimeZone });
({ ...ProtoTimeZone });
/** @internal */
const toDateUtc$1 = (self) => new Date(self.epochMilliseconds);
// node_modules/effect/dist/Effect.js
/**
* Checks whether a value is an `Effect`.
*
* **Example** (Checking whether a value is an Effect)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* Effect.isEffect(Effect.succeed(1)) // => true
* Effect.isEffect("hello") // => false
* ```
*
* @category guards
* @since 2.0.0
*/
const isEffect = isEffect$1;
/**
* Combines an iterable or record of effects into one effect whose success shape
* follows the input.
*
* **When to use**
*
* Use to run a known collection of effects and collect results in the same
* tuple, iterable, or record shape.
*
* **Details**
*
* Tuple and iterable inputs collect results in order. Record inputs collect
* results under the same keys. By default, the combined effect fails on the
* first failure; with concurrent execution, effects that have already started
* may be interrupted, while effects not yet started are skipped.
*
* Options:
*
* Use `concurrency` to control sequential or concurrent execution. Use
* `mode: "result"` to run every effect and collect each success or failure as a
* `Result` in the same output shape. Use `discard: true` to ignore successful
* values and return `void`.
*
* **Example** (Collecting tuple results in order)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const tupleOfEffects = [
*   Effect.succeed(42),
*   Effect.succeed("Hello")
* ] as const
*
* //      ┌─── Effect<[number, string], never, never>
* //      ▼
* const resultsAsTuple = Effect.all(tupleOfEffects)
*
* await Effect.runPromise(resultsAsTuple) // => [42, "Hello"]
* ```
*
* **Example** (Collecting iterable results in order)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const iterableOfEffects: Iterable<Effect.Effect<number>> = [1, 2, 3].map(
*   Effect.succeed
* )
*
* //      ┌─── Effect<number[], never, never>
* //      ▼
* const resultsAsArray = Effect.all(iterableOfEffects)
*
* await Effect.runPromise(resultsAsArray) // => [1, 2, 3]
* ```
*
* **Example** (Collecting struct results by key)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const structOfEffects = {
*   a: Effect.succeed(42),
*   b: Effect.succeed("Hello")
* }
*
* //      ┌─── Effect<{ a: number; b: string; }, never, never>
* //      ▼
* const resultsAsStruct = Effect.all(structOfEffects)
*
* await Effect.runPromise(resultsAsStruct) // => { a: 42, b: "Hello" }
* ```
*
* **Example** (Collecting record results by key)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const recordOfEffects: Record<string, Effect.Effect<number>> = {
*   key1: Effect.succeed(1),
*   key2: Effect.succeed(2)
* }
*
* //      ┌─── Effect<{ [x: string]: number; }, never, never>
* //      ▼
* const resultsAsRecord = Effect.all(recordOfEffects)
*
* await Effect.runPromise(resultsAsRecord) // => { key1: 1, key2: 2 }
* ```
*
* **Example** (Stopping on the first failure)
*
* ```ts import.meta.vitest
* import { Effect, Exit } from "effect"
* const output: Array<unknown> = []
* const record = (value: unknown) => Effect.sync(() => { output.push(value) })
*
* const program = Effect.all([
*   Effect.succeed("Task1").pipe(Effect.tap(record)),
*   Effect.fail("Task2: Oh no!").pipe(Effect.tap(record)),
*   // Won't execute due to earlier failure
*   Effect.succeed("Task3").pipe(Effect.tap(record))
* ])
*
* const outcome = await Effect.runPromiseExit(program)
* const observation = [output, outcome] // => [["Task1"], Exit.fail("Task2: Oh no!")]
* ```
*
* @see {@link forEach} for iterating over elements and applying an effect.
* @category collecting
* @since 2.0.0
*/
const all = all$1;
/**
* Executes an effectful operation for each element in an `Iterable`.
*
* **When to use**
*
* Use to traverse an iterable with an effectful function while preserving
* element order in the collected results.
*
* **Details**
*
* The `forEach` function applies a provided operation to each element in the
* iterable, producing a new effect that returns an array of results.
*
* If any effect fails, the iteration stops immediately (short-circuiting), and
* the error is propagated.
*
* Concurrency:
*
* The `concurrency` option controls how many operations are performed
* concurrently. By default, the operations are performed sequentially.
*
* Discarding Results:
*
* If the `discard` option is set to `true`, the intermediate results are not
* collected, and the final result of the operation is `void`.
*
* **Example** (Mapping over an iterable with effects)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* const result = Effect.forEach(
*   [1, 2, 3, 4, 5],
*   (n, index) =>
*     Effect.sync(() => { output.push(`Currently at index ${index}`) }).pipe(Effect.as(n * 2))
* )
*
* void output.push(await Effect.runPromise(result))
* output // => ["Currently at index 0", "Currently at index 1", "Currently at index 2", "Currently at index 3", "Currently at index 4", [2, 4, 6, 8, 10]]
* ```
*
* **Example** (Running effects without collecting results)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* // Apply effects but discard the results
* const result = Effect.forEach(
*   [1, 2, 3, 4, 5],
*   (n, index) =>
*     Effect.sync(() => { output.push(`Currently at index ${index}`) }).pipe(Effect.as(n * 2)),
*   { discard: true }
* )
*
* void output.push(await Effect.runPromise(result))
* output // => ["Currently at index 0", "Currently at index 1", "Currently at index 2", "Currently at index 3", "Currently at index 4", undefined]
* ```
*
* @see {@link all} for combining multiple effects into one.
* @category collecting
* @since 2.0.0
*/
const forEach = forEach$1;
/**
* Creates an `Effect` from an asynchronous computation that may throw or
* reject, mapping failures into the error channel.
*
* **When to use**
*
* Use when you need to perform asynchronous operations that might fail, such
* as fetching data from an API, and want thrown exceptions or rejected promises
* captured as Effect errors.
*
* **Details**
*
* The promise thunk is evaluated when the effect runs. If it returns a promise
* that resolves, the resolved value becomes the success value. If the thunk
* throws before returning a promise, or if the returned promise rejects, the
* thrown or rejected value is mapped into the error channel.
*
* Passing the thunk directly maps failures to {@link Cause.UnknownError}.
* Passing `{ try, catch }` uses `catch` to map failures to an error of type
* `E`.
*
* The thunk receives an `AbortSignal` that is aborted if the effect is
* interrupted. The underlying asynchronous operation only stops if it observes
* that signal.
*
* **Gotchas**
*
* If `catch` throws while mapping the error, that thrown value is treated as a
* defect. Return the error value you want in the error channel instead of
* throwing it.
*
* **Example** (Wrapping a fetch request that may fail)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const getTodo = (id: number) =>
*   Effect.tryPromise(() => Promise.resolve({ id, completed: false }))
*
* //      ┌─── Effect<{ id: number; completed: boolean }, UnknownError, never>
* //      ▼
* const program = getTodo(1)
* await Effect.runPromise(program) // => { id: 1, completed: false }
* ```
*
* **Example** (Mapping Promise rejections to a tagged error)
*
* ```ts import.meta.vitest
* import { Data, Effect } from "effect"
*
* class TodoFetchError extends Data.TaggedError("TodoFetchError")<{ readonly cause: unknown }> {}
*
* const getTodo = (id: number) =>
*   Effect.tryPromise({
*     try: () => Promise.reject(`Todo ${id} is unavailable`),
*     // remap the error
*     catch: (cause) => new TodoFetchError({ cause })
*   })
*
* //      ┌─── Effect<never, TodoFetchError, never>
* //      ▼
* const program = Effect.flip(getTodo(1))
* const error = await Effect.runPromise(program)
* error._tag // => "TodoFetchError"
* ```
*
* @see {@link promise} if the effectful computation is asynchronous and does not throw errors.
* @category constructors
* @since 2.0.0
*/
const tryPromise = tryPromise$1;
/**
* Creates an `Effect` that always succeeds with a given value.
*
* **When to use**
*
* Use when an effect should complete successfully with a specific value without any errors
* or external dependencies.
*
* **Example** (Creating a successful effect)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* // Creating an effect that represents a successful scenario
* //
* //      ┌─── Effect<number, never, never>
* //      ▼
* const success = Effect.succeed(42)
* Effect.runSync(success) // => 42
* ```
*
* @see {@link fail} to create an effect that represents a failure.
* @category constructors
* @since 2.0.0
*/
const succeed$1 = succeed$3;
/**
* Creates an `Effect` lazily, delaying construction until it is needed.
*
* **When to use**
*
* Use when you need to defer the evaluation of an effect until it is required.
*
* **Details**
*
* `suspend` takes a thunk that represents an effect and delays creating it
* until the suspended effect is evaluated. This is useful for optimizing
* expensive computations, managing circular dependencies such as recursive
* functions, and helping TypeScript unify return types when branches construct
* different effects. Any side effects or scoped captures inside the thunk are
* re-executed on each invocation.
*
* **Example** (Lazily evaluating side effects)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* let i = 0
*
* const bad = Effect.succeed(i++)
*
* const good = Effect.suspend(() => Effect.succeed(i++))
*
* Effect.runSync(bad) // => 0
* Effect.runSync(bad) // => 0
*
* Effect.runSync(good) // => 1
* Effect.runSync(good) // => 2
* ```
*
* **Example** (Suspending recursive Fibonacci evaluation)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const blowsUp = (n: number): Effect.Effect<number> =>
*   n < 2
*     ? Effect.succeed(1)
*     : Effect.zipWith(blowsUp(n - 1), blowsUp(n - 2), (a, b) => a + b)
*
* // console.log(Effect.runSync(blowsUp(32)))
* // crash: JavaScript heap out of memory
*
* const allGood = (n: number): Effect.Effect<number> =>
*   n < 2
*     ? Effect.succeed(1)
*     : Effect.zipWith(
*         Effect.suspend(() => allGood(n - 1)),
*         Effect.suspend(() => allGood(n - 2)),
*         (a, b) => a + b
*       )
*
* Effect.runSync(allGood(16)) // => 1597
* ```
*
* **Example** (Helping TypeScript infer recursive effect types)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* //   Without suspend, TypeScript may struggle with type inference.
* //   Inferred type:
* //     (a: number, b: number) =>
* //       Effect<never, Error, never> | Effect<number, never, never>
* const withoutSuspend = (a: number, b: number) =>
*   b === 0
*     ? Effect.fail(new Error("Cannot divide by zero"))
*     : Effect.succeed(a / b)
*
* //   Using suspend to unify return types.
* //   Inferred type:
* //     (a: number, b: number) => Effect<number, Error, never>
* const withSuspend = (a: number, b: number) =>
*   Effect.suspend(() =>
*     b === 0
*       ? Effect.fail(new Error("Cannot divide by zero"))
*       : Effect.succeed(a / b)
*   )
*
* Effect.runSync(withSuspend(6, 2)) // => 3
* ```
*
* @category constructors
* @since 2.0.0
*/
const suspend = suspend$1;
/**
* Creates an `Effect` that represents a synchronous side-effectful computation.
*
* **When to use**
*
* Use when you need to wrap a synchronous side-effectful operation that is not
* expected to throw.
*
* **Details**
*
* The provided function is evaluated lazily when the effect runs.
*
* **Gotchas**
*
* The function must not throw. If it throws, the thrown value is treated as a
* defect, not as a typed failure. Use `try` when throwing is expected.
*
* **Example** (Capturing synchronous logging in an Effect)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* const log = (message: string) =>
*   Effect.sync(() => {
*     void output.push(message) // side effect
*   })
*
* //      ┌─── Effect<void, never, never>
* //      ▼
* const program = log("Hello, World!")
* Effect.runSync(program)
* output // => ["Hello, World!"]
* ```
*
* @see {@link try_ | try} for a version that can handle failures.
* @category constructors
* @since 2.0.0
*/
const sync = sync$1;
const void_ = void_$2;
const undefined_ = undefined_$1;
/**
* Creates an `Effect` from a callback-based asynchronous API.
*
* **When to use**
*
* Use when you need to integrate APIs that complete through callbacks instead
* of returning a `Promise`.
*
* **Details**
*
* The registration function receives a `resume` callback and, when requested,
* an `AbortSignal`. Call `resume` at most once with the effect that should
* complete the fiber; later calls are ignored. Return an optional cleanup
* effect from the registration function to run if the fiber is interrupted.
*
* **Example** (Integrating callback APIs)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* const fromCallback = (message: string) =>
*   Effect.callback<void>((resume) => {
*     queueMicrotask(() => {
*       void output.push(message)
*       resume(Effect.void)
*     })
*   })
*
* await Effect.runPromise(fromCallback("callback completed"))
* output // => ["callback completed"]
* ```
*
* @category constructors
* @since 4.0.0
*/
const callback = callback$1;
/**
* Provides a way to write effectful code using generator functions, simplifying
* control flow and error handling.
*
* **When to use**
*
* Use when you want to write effectful code that looks and behaves like
* synchronous code, while still handling asynchronous tasks, errors, and complex
* control flow such as loops and conditions.
*
* Generator functions work similarly to `async/await` but keep errors,
* requirements, and interruption in the Effect type. You can `yield*` values
* from effects and return the final result at the end.
*
* **Example** (Sequencing effects with generators)
*
* ```ts import.meta.vitest
* import { Data, Effect } from "effect"
*
* class DiscountRateError extends Data.TaggedError("DiscountRateError")<{}> {}
*
* const addServiceCharge = (amount: number) => amount + 1
*
* const applyDiscount = (
*   total: number,
*   discountRate: number
* ): Effect.Effect<number, DiscountRateError> =>
*   discountRate === 0
*     ? Effect.fail(new DiscountRateError())
*     : Effect.succeed(total - (total * discountRate) / 100)
*
* const fetchTransactionAmount = Effect.promise(() => Promise.resolve(100))
*
* const fetchDiscountRate = Effect.promise(() => Promise.resolve(5))
*
* export const program = Effect.gen(function*() {
*   const transactionAmount = yield* fetchTransactionAmount
*   const discountRate = yield* fetchDiscountRate
*   const discountedAmount = yield* applyDiscount(
*     transactionAmount,
*     discountRate
*   )
*   const finalAmount = addServiceCharge(discountedAmount)
*   return `Final amount to charge: ${finalAmount}`
* })
*
* await Effect.runPromise(program) // => "Final amount to charge: 96"
* ```
*
* @category constructors
* @since 2.0.0
*/
const gen = gen$1;
/**
* Creates an `Effect` that represents a recoverable error.
*
* **When to use**
*
* Use to explicitly signal a recoverable error in an `Effect`.
*
* **Details**
*
* The error keeps propagating unless it is handled. You can handle tagged
* errors with functions like {@link catchTag} or {@link catchTags}.
*
* **Example** (Creating a failed effect)
*
* ```ts import.meta.vitest
* import { Data, Effect } from "effect"
*
* class OperationFailedError extends Data.TaggedError("OperationFailedError")<{}> {}
*
* //      ┌─── Effect<never, OperationFailedError, never>
* //      ▼
* const failure = Effect.fail(
*   new OperationFailedError()
* )
* Effect.runSync(Effect.flip(failure))._tag // => "OperationFailedError"
* ```
*
* @see {@link succeed} to create an effect that represents a successful value.
* @category constructors
* @since 2.0.0
*/
const fail$1 = fail$3;
/**
* Creates an `Effect` that represents a failure with a specific `Cause`.
*
* **When to use**
*
* Use when you already have a full `Cause` and need to preserve defects,
* interruptions, annotations, or combined failures in the effect's failure
* channel.
*
* **Details**
*
* This function allows you to create effects that fail with complex error
* structures, including multiple errors, defects, interruptions, and more.
*
* **Example** (Failing with a full Cause)
*
* ```ts import.meta.vitest
* import { Cause, Effect } from "effect"
*
* const program = Effect.failCause(
*   Cause.fail("Network error")
* )
*
* Effect.runSync(Effect.flip(program)) // => "Network error"
* ```
*
* @category constructors
* @since 2.0.0
*/
const failCause = failCause$2;
/**
* Creates an `Effect` that represents a failure with a `Cause` computed lazily.
*
* **When to use**
*
* Use to defer computing a full `Cause` until the effect is run.
*
* **Details**
*
* The cause-producing function is evaluated each time the effect is executed.
*
* **Example** (Lazily creating a Cause)
*
* ```ts import.meta.vitest
* import { Cause, Effect } from "effect"
*
* const program = Effect.failCauseSync(() =>
*   Cause.fail("Error computed at runtime")
* )
*
* Effect.runSync(Effect.flip(program)) // => "Error computed at runtime"
* ```
*
* @category constructors
* @since 2.0.0
*/
const failCauseSync = failCauseSync$1;
/**
* Creates an effect that terminates a fiber with a specified error.
*
* **When to use**
*
* Use when you need an `Effect` to report an unrecoverable defect instead of a
* typed error.
*
* **Details**
*
* The `die` function is used to signal a defect, which represents a critical
* and unexpected error in the code. When invoked, it produces an effect that
* does not handle the error and instead terminates the fiber.
*
* The error channel of the resulting effect is of type `never`, indicating that
* it cannot recover from this failure.
*
* **Example** (Failing on division by zero)
*
* ```ts import.meta.vitest
* import { Effect, Exit } from "effect"
*
* const defect = new Error("Cannot divide by zero")
* const divide = (a: number, b: number) =>
*   b === 0
*     ? Effect.die(defect)
*     : Effect.succeed(a / b)
*
* //      ┌─── Effect<number, never, never>
* //      ▼
* const program = divide(1, 0)
*
* Effect.runSyncExit(program) // => Exit.die(defect)
* ```
*
* @category constructors
* @since 2.0.0
*/
const die = die$2;
const try_ = try_$1;
/**
* Yields control back to the Effect runtime, allowing other fibers to execute.
*
* **Example** (Yielding to other fibers)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* const program = Effect.gen(function*() {
*   void output.push("Before yield")
*   yield* Effect.yieldNow
*   void output.push("After yield")
* })
*
* await Effect.runPromise(program)
* output // => ["Before yield", "After yield"]
* ```
*
* @category constructors
* @since 2.0.0
*/
const yieldNow = yieldNow$1;
/**
* Provides access to the current fiber within an effect computation.
*
* **Example** (Reading the current fiber)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const program = Effect.withFiber((fiber) => Effect.succeed(typeof fiber.id))
*
* Effect.runSync(program) // => "number"
* ```
*
* @category constructors
* @since 4.0.0
*/
const withFiber = withFiber$1;
/**
* Chains effects to produce new `Effect` instances, useful for combining
* operations that depend on previous results.
*
* **When to use**
*
* Use when you need to chain multiple effects, ensuring that each
* step produces a new `Effect` while flattening any nested effects that may
* occur.
*
* **Details**
*
* `flatMap` lets you sequence effects so that the result of one effect can be
* used in the next step. It is similar to `flatMap` used with arrays but works
* specifically with `Effect` instances, allowing you to avoid deeply nested
* effect structures.
*
* Since effects are immutable, `flatMap` always returns a new effect instead of
* changing the original one.
*
* **Example** (Choosing flatMap syntax variants)
*
* ```ts import.meta.vitest
* import { Effect, pipe } from "effect"
* const output: Array<unknown> = []
*
* const myEffect = Effect.succeed(1)
* const transformation = (n: number) => Effect.succeed(n + 1)
*
* const flatMappedWithPipe = pipe(myEffect, Effect.flatMap(transformation))
* const flatMappedWithDataFirst = Effect.flatMap(myEffect, transformation)
* const flatMappedWithMethod = myEffect.pipe(Effect.flatMap(transformation))
*
* void output.push(Effect.runSync(Effect.all([
*   flatMappedWithPipe,
*   flatMappedWithDataFirst,
*   flatMappedWithMethod
* ])))
* output // => [[2, 2, 2]]
* ```
*
* **Example** (Sequencing dependent effects)
*
* ```ts import.meta.vitest
* import { Data, Effect, pipe } from "effect"
*
* class DiscountRateError extends Data.TaggedError("DiscountRateError")<{}> {}
*
* // Function to apply a discount safely to a transaction amount
* const applyDiscount = (
*   total: number,
*   discountRate: number
* ): Effect.Effect<number, DiscountRateError> =>
*   discountRate === 0
*     ? Effect.fail(new DiscountRateError())
*     : Effect.succeed(total - (total * discountRate) / 100)
*
* // Simulated asynchronous task to fetch a transaction amount from database
* const fetchTransactionAmount = Effect.promise(() => Promise.resolve(100))
*
* // Chaining the fetch and discount application using `flatMap`
* const finalAmount = pipe(
*   fetchTransactionAmount,
*   Effect.flatMap((amount) => applyDiscount(amount, 5))
* )
*
* await Effect.runPromise(finalAmount) // => 95
* ```
*
* @see {@link tap} for a version that ignores the result of the effect.
* @category sequencing
* @since 2.0.0
*/
const flatMap = flatMap$1;
/**
* Flattens an `Effect` that produces another `Effect` into a single effect.
*
* **Example** (Flattening nested effects)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* const nested = Effect.succeed(Effect.succeed("hello"))
*
* const program = Effect.gen(function*() {
*   const value = yield* Effect.flatten(nested)
*   yield* Effect.sync(() => { output.push(value) })
* })
*
* Effect.runSync(program)
* output // => ["hello"]
* ```
*
* @category sequencing
* @since 2.0.0
*/
const flatten = flatten$1;
/**
* Runs this effect and then runs another effect, optionally using the first
* effect's success value to choose the next effect.
*
* **When to use**
*
* Use when you need one effect to run after another and the second effect may
* depend on the first effect's success value.
*
* **Details**
*
* When the second argument is an `Effect`, the first success value is discarded
* and the returned effect produces the second effect's value. When the second
* argument is a function, it receives the first success value and must return
* the next `Effect`.
*
* Failures or requirements from either effect are preserved in the returned
* effect.
*
* **Example** (Choosing andThen syntax variants)
*
* ```ts import.meta.vitest
* import { Effect, pipe } from "effect"
* const output: Array<unknown> = []
*
* const myEffect = Effect.succeed(1)
* const anotherEffect = Effect.succeed("done")
*
* const transformedWithPipe = pipe(myEffect, Effect.andThen(anotherEffect))
* const transformedWithDataFirst = Effect.andThen(myEffect, anotherEffect)
* const transformedWithMethod = myEffect.pipe(Effect.andThen(anotherEffect))
*
* void output.push(Effect.runSync(Effect.all([
*   transformedWithPipe,
*   transformedWithDataFirst,
*   transformedWithMethod
* ])))
* output // => [['done', 'done', 'done']]
* ```
*
* **Example** (Sequencing a discount calculation after fetching a total)
*
* ```ts import.meta.vitest
* import { Data, Effect, pipe } from "effect"
*
* class DiscountRateError extends Data.TaggedError("DiscountRateError")<{}> {}
*
* // Function to apply a discount safely to a transaction amount
* const applyDiscount = (
*   total: number,
*   discountRate: number
* ): Effect.Effect<number, DiscountRateError> =>
*   discountRate === 0
*     ? Effect.fail(new DiscountRateError())
*     : Effect.succeed(total - (total * discountRate) / 100)
*
* // Simulated asynchronous task to fetch a transaction amount from database
* const fetchTransactionAmount = Effect.promise(() => Promise.resolve(100))
*
* // Using Effect.map and Effect.flatMap
* const result1 = pipe(
*   fetchTransactionAmount,
*   Effect.map((amount) => amount * 2),
*   Effect.flatMap((amount) => applyDiscount(amount, 5))
* )
*
* await Effect.runPromise(result1) // => 190
*
* // Using Effect.andThen
* const result2 = pipe(
*   fetchTransactionAmount,
*   Effect.andThen((amount) => Effect.succeed(amount * 2)),
*   Effect.andThen((amount) => applyDiscount(amount, 5))
* )
*
* await Effect.runPromise(result2) // => 190
* ```
*
* @category sequencing
* @since 2.0.0
*/
const andThen = andThen$1;
/**
* Runs a side effect with the result of an effect without changing the original
* value.
*
* **When to use**
*
* Use when you need to run an effectful observation, such as logging or
* tracking, while passing the original success value to the next step.
*
* **Details**
*
* `tap` works similarly to `flatMap`, but it ignores the result of the function
* passed to it. The value from the previous effect remains available for the
* next part of the chain. Note that if the side effect fails, the entire chain
* will fail too.
*
* **Example** (Logging a step in a pipeline)
*
* ```ts import.meta.vitest
* import { Data, Effect, pipe } from "effect"
* const output: Array<unknown> = []
*
* class DiscountRateError extends Data.TaggedError("DiscountRateError")<{}> {}
*
* // Function to apply a discount safely to a transaction amount
* const applyDiscount = (
*   total: number,
*   discountRate: number
* ): Effect.Effect<number, DiscountRateError> =>
*   discountRate === 0
*     ? Effect.fail(new DiscountRateError())
*     : Effect.succeed(total - (total * discountRate) / 100)
*
* // Simulated asynchronous task to fetch a transaction amount from database
* const fetchTransactionAmount = Effect.promise(() => Promise.resolve(100))
*
* const finalAmount = pipe(
*   fetchTransactionAmount,
*   // Log the fetched transaction amount
*   Effect.tap((amount) => Effect.sync(() => { output.push(`Apply a discount to: ${amount}`) })),
*   // `amount` is still available!
*   Effect.flatMap((amount) => applyDiscount(amount, 5))
* )
*
* void output.push(await Effect.runPromise(finalAmount))
* output // => ["Apply a discount to: 100", 95]
* ```
*
* @category sequencing
* @since 2.0.0
*/
const tap = tap$1;
/**
* Transforms an effect to encapsulate both failure and success using the `Exit`
* data type.
*
* **When to use**
*
* Use when you need to inspect the full outcome, including typed failures, defects,
* and interruptions.
*
* **Details**
*
* `exit` wraps an effect's success or failure inside an `Exit` type, allowing
* you to handle both cases explicitly.
*
* The resulting effect cannot fail because the failure is encapsulated within
* the `Exit.Failure` type. The error type is set to `never`, indicating that
* the effect is structured to never fail directly.
*
* **Example** (Capturing completion as Exit)
*
* ```ts import.meta.vitest
* import { Effect, Exit } from "effect"
*
* const success = Effect.succeed(42)
* const failure = Effect.fail("Something went wrong")
*
* const program1 = Effect.exit(success)
* const program2 = Effect.exit(failure)
*
* Effect.runSync(program1) // => Exit.succeed(42)
*
* Effect.runSync(program2) // => Exit.fail("Something went wrong")
* ```
*
* @see {@link option} for a version that uses `Option` instead.
* @see {@link result} for a version that uses `Result` instead.
*
* @category error handling
* @since 2.0.0
*/
const exit = exit$1;
/**
* Transforms the value inside an effect by applying a function to it.
*
* **When to use**
*
* Use to transform an effect's success value with a function that returns a
* plain value, producing a new effect without changing the original effect's
* typed error or context requirements.
*
* **Details**
*
* `map` takes a function and applies it to the value contained within an
* effect, creating a new effect with the transformed value.
*
* It's important to note that effects are immutable, meaning that the original
* effect is not modified. Instead, a new effect is returned with the updated
* value.
*
* **Example** (Choosing map syntax variants)
*
* ```ts import.meta.vitest
* import { Effect, pipe } from "effect"
* const output: Array<unknown> = []
*
* const myEffect = Effect.succeed(1)
* const transformation = (n: number) => n + 1
*
* const mappedWithPipe = pipe(myEffect, Effect.map(transformation))
* const mappedWithDataFirst = Effect.map(myEffect, transformation)
* const mappedWithMethod = myEffect.pipe(Effect.map(transformation))
*
* void output.push(Effect.runSync(Effect.all([
*   mappedWithPipe,
*   mappedWithDataFirst,
*   mappedWithMethod
* ])))
* output // => [[2, 2, 2]]
* ```
*
* **Example** (Adding a service charge)
*
* ```ts import.meta.vitest
* import { Effect, pipe } from "effect"
*
* const addServiceCharge = (amount: number) => amount + 1
*
* const fetchTransactionAmount = Effect.promise(() => Promise.resolve(100))
*
* const finalAmount = pipe(
*   fetchTransactionAmount,
*   Effect.map(addServiceCharge)
* )
*
* await Effect.runPromise(finalAmount) // => 101
* ```
*
* @see {@link mapError} for a version that operates on the error channel.
* @see {@link mapBoth} for a version that operates on both channels.
* @see {@link flatMap} or {@link andThen} for a version that can return a new effect.
* @category mapping
* @since 2.0.0
*/
const map = map$2;
/**
* Replaces the value inside an effect with a constant value.
*
* **When to use**
*
* Use to replace a successful value with a constant while preserving failures
* and requirements.
*
* **Details**
*
* `as` allows you to ignore the original value inside an effect and
* replace it with a new constant value.
*
* **Example** (Replacing a success value)
*
* ```ts import.meta.vitest
* import { Effect, pipe } from "effect"
*
* // Replaces the value 5 with the constant "new value"
* const program = pipe(Effect.succeed(5), Effect.as("new value"))
*
* Effect.runSync(program) // => "new value"
* ```
*
* @see {@link map} for deriving the replacement value from the success value
* @see {@link asVoid} for replacing the success value with `void`
*
* @category mapping
* @since 2.0.0
*/
const as = as$1;
/**
* Maps the success value of an `Effect` to `void`, preserving failures.
*
* **Example** (Discarding success values)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const program = Effect.asVoid(Effect.succeed(42))
*
* Effect.runSync(program) // => undefined
* ```
*
* @category mapping
* @since 2.0.0
*/
const asVoid = asVoid$1;
const catch_ = catch_$1;
/**
* Handles both recoverable and unrecoverable errors by providing a recovery
* effect.
*
* **When to use**
*
* Use when you need to recover from an `Effect` by inspecting the full `Cause`,
* including recoverable failures, defects, and interruptions, instead of only
* the typed error value.
*
* **Details**
*
* When to Recover from Defects:
*
* Defects are unexpected errors that typically shouldn't be recovered from, as
* they often indicate serious issues. However, in some cases, such as
* dynamically loaded plugins, controlled recovery might be needed.
*
* **Example** (Recovering from full failure causes)
*
* ```ts import.meta.vitest
* import { Cause, Effect } from "effect"
* const output: Array<unknown> = []
*
* // An effect that might fail in different ways
* const program = Effect.die("Something went wrong")
*
* // Recover from any cause (including defects)
* const recovered = Effect.catchCause(program, (cause) => {
*   if (Cause.hasDies(cause)) {
*     return Effect.sync(() => { output.push("Caught defect") }).pipe(
*       Effect.as("Recovered from defect")
*     )
*   }
*   return Effect.succeed("Unknown error")
* })
*
* void output.push(Effect.runSync(recovered))
* output // => ["Caught defect", "Recovered from defect"]
* ```
*
* @category error handling
* @since 4.0.0
*/
const catchCause = catchCause$1;
/**
* Recovers from defects using a provided recovery function.
*
* **When to use**
*
* Use when you need to report or translate defects at integration boundaries.
*
* **Details**
*
* `catchDefect` handles unexpected defects, such as thrown exceptions or
* values passed to `die`, without catching typed failures or interruptions.
*
* When to Recover from Defects:
*
* Defects are unexpected errors that typically should not be recovered from, as
* they often indicate serious issues. In some cases, such as dynamically loaded
* plugins, controlled recovery may be needed.
*
* **Example** (Recovering from defects)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* // An effect that might throw an unexpected error (defect)
* const program = Effect.sync(() => {
*   throw new Error("Unexpected error")
* })
*
* // Recover from defects only
* const recovered = Effect.catchDefect(program, (defect) => {
*   return Effect.sync(() => { output.push(`Caught defect: ${(defect as Error).message}`) }).pipe(
*     Effect.as("Recovered from defect")
*   )
* })
*
* void output.push(Effect.runSync(recovered))
* output // => ["Caught defect: Unexpected error", "Recovered from defect"]
* ```
*
* @category error handling
* @since 4.0.0
*/
const catchDefect = catchDefect$1;
/**
* Transforms the failure value of an effect without changing its success value.
*
* **When to use**
*
* Use to translate an `Effect`'s typed failures while leaving successful values
* unchanged.
*
* **Details**
*
* Only the failure channel is transformed. The success channel and requirements
* are preserved.
*
* **Example** (Transforming the error channel)
*
* ```ts import.meta.vitest
* import { Data, Effect } from "effect"
*
* class TaskError extends Data.TaggedError("TaskError")<{ readonly message: string }> {}
*
* //      ┌─── Effect<number, string, never>
* //      ▼
* const simulatedTask = Effect.fail("Oh no!").pipe(Effect.as(1))
*
* //      ┌─── Effect<number, TaskError, never>
* //      ▼
* const mapped = Effect.mapError(
*   simulatedTask,
*   (message) => new TaskError({ message })
* )
* Effect.runSync(Effect.flip(mapped)).message // => "Oh no!"
* ```
*
* @see {@link map} for a version that operates on the success channel.
* @see {@link mapBoth} for a version that operates on both channels.
*
* @category error handling
* @since 2.0.0
*/
const mapError = mapError$1;
/**
* Applies a timeout to an effect, lazily evaluating `orElse` after interrupting
* the source if the timeout is reached.
*
* **Example** (Falling back on timeout)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* const program = Effect.timeoutOrElse(Effect.never, {
*   duration: 0,
*   orElse: () => Effect.sync(() => { output.push("Query timed out, using cached data") }).pipe(
*     Effect.as("Cached result")
*   )
* })
*
* void output.push(await Effect.runPromise(program))
* output // => ["Query timed out, using cached data", "Cached result"]
* ```
*
* @see {@link timeout} for failing with a `TimeoutError`.
* @see {@link timeoutOption} for returning `Option.none` on timeout.
*
* @category delays & timeouts
* @since 4.0.0
*/
const timeoutOrElse = timeoutOrElse$1;
/**
* Runs multiple effects concurrently and returns the first successful result.
*
* **When to use**
*
* Use when early failures should be ignored until a success occurs
* or all effects fail.
*
* **Details**
*
* Early failures do not finish the race; `raceAll` keeps waiting until one
* effect succeeds or every effect has failed. When one effect succeeds, the
* remaining effects are interrupted. If every effect fails, the returned effect
* fails with a cause containing the collected failure reasons.
*
* **Example** (Racing many effects)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const raced = Effect.raceAll([
*   Effect.succeed("Fast"),
*   Effect.never
* ])
* await Effect.runPromise(raced) // => "Fast"
* ```
*
* @see {@link race} for a version that handles only two effects.
* @category racing
* @since 2.0.0
*/
const raceAll = raceAll$1;
/**
* Handles failures with access to the cause and allows performing side effects.
*
* **When to use**
*
* Use when you need to fold an `Effect` with effectful success handlers and
* `Cause`-aware failure handlers.
*
* **Details**
*
* The `matchCauseEffect` function works similarly to {@link matchCause}, but it
* also allows you to perform additional side effects based on the failure
* cause. This function provides access to the complete cause of the failure,
* making it possible to differentiate between various failure types, and allows
* you to respond accordingly while performing side effects (like logging or
* other operations).
*
* **Example** (Effectfully matching on causes)
*
* ```ts import.meta.vitest
* import { Cause, Data, Effect, Result } from "effect"
* const output: Array<unknown> = []
*
* class TaskError extends Data.TaggedError("TaskError")<{ readonly message: string }> {}
*
* const task = Effect.fail(new TaskError({ message: "Task failed" }))
*
* const program = Effect.matchCauseEffect(task, {
*   onFailure: (cause) =>
*     Effect.gen(function*() {
*       if (Cause.hasFails(cause)) {
*         const error = Cause.findError(cause)
*         if (Result.isSuccess(error)) {
*           yield* Effect.sync(() => { output.push(`Handling error: ${error.success.message}`) })
*         }
*         return "recovered from error"
*       } else {
*         yield* Effect.sync(() => { output.push("Handling interruption or defect") })
*         return "recovered from interruption/defect"
*       }
*     }),
*   onSuccess: (value) =>
*     Effect.gen(function*() {
*       yield* Effect.sync(() => { output.push(`Success: ${value}`) })
*       return `processed ${value}`
*     })
* })
*
* void output.push(Effect.runSync(program))
* output // => ["Handling error: Task failed", "recovered from error"]
* ```
*
* @see {@link matchCause} if you don't need side effects and only want to handle the result or failure.
* @see {@link matchEffect} if you don't need to handle the cause of the failure.
*
* @category pattern matching
* @since 2.0.0
*/
const matchCauseEffect = matchCauseEffect$1;
/**
* Provides one concrete service implementation to an effect.
*
* **When to use**
*
* Use to satisfy one service requirement with an already-built implementation.
*
* **Details**
*
* The service requirement identified by the `Context.Key` is removed from the
* effect requirements after the implementation is provided.
*
* **Example** (Providing a service value)
*
* ```ts import.meta.vitest
* import { Context, Effect } from "effect"
* const output: Array<unknown> = []
*
* // Define a service for configuration
* const Config = Context.Service<{
*   apiUrl: string
*   timeout: number
* }>("Config")
*
* const fetchData = Effect.gen(function*() {
*   const config = yield* Effect.service(Config)
*   yield* Effect.sync(() => { output.push(`Fetching from: ${config.apiUrl}`) })
*   yield* Effect.sync(() => { output.push(`Timeout: ${config.timeout}ms`) })
*   return "data"
* })
*
* // Provide the service implementation
* const program = Effect.provideService(fetchData, Config, {
*   apiUrl: "https://api.example.com",
*   timeout: 5000
* })
*
* void output.push(Effect.runSync(program))
* output // => ["Fetching from: https://api.example.com", "Timeout: 5000ms", "data"]
* ```
*
* @see {@link provide} for providing multiple layers to an effect.
* @see {@link provideServiceEffect} for acquiring the service implementation effectfully.
* @see {@link provideContext} for providing a complete context.
* @category providing services
* @since 2.0.0
*/
const provideService = provideService$1;
/**
* Runs resource acquisition, usage, and release as one bracketed effect.
*
* **When to use**
*
* Use to bracket acquire, use, and release logic in one effect.
*
* **Details**
*
* `acquireUseRelease` does the following:
*
*   1. Ensures that the `Effect` value that acquires the resource will not be
*      interrupted. Note that acquisition may still fail due to internal
*      reasons (such as an uncaught exception).
*   2. Ensures that the `release` `Effect` value will not be interrupted,
*      and will be executed as long as the acquisition `Effect` value
*      successfully acquires the resource.
*
* During the time period between the acquisition and release of the resource,
* the `use` `Effect` value will be executed.
*
* If the `release` `Effect` value fails, then the entire `Effect` value will
* fail, even if the `use` `Effect` value succeeds. If this fail-fast behavior
* is not desired, errors produced by the `release` `Effect` value can be caught
* and ignored.
*
* **Example** (Acquiring resources with cleanup)
*
* ```ts import.meta.vitest
* import { Effect, Exit } from "effect"
* const output: Array<unknown> = []
*
* interface Database {
*   readonly connection: string
*   readonly query: (sql: string) => Effect.Effect<string>
* }
*
* const program = Effect.acquireUseRelease(
*   // Acquire - connect to database
*   Effect.gen(function*() {
*     yield* Effect.sync(() => { output.push("Connecting to database...") })
*     return {
*       connection: "db://localhost:5432",
*       query: (sql: string) => Effect.succeed(`Result for: ${sql}`)
*     }
*   }),
*   // Use - perform database operations
*   (db) =>
*     Effect.gen(function*() {
*       yield* Effect.sync(() => { output.push(`Connected to ${db.connection}`) })
*       const result = yield* db.query("SELECT * FROM users")
*       yield* Effect.sync(() => { output.push(`Query result: ${result}`) })
*       return result
*     }),
*   // Release - close database connection
*   (db, exit) =>
*     Effect.gen(function*() {
*       if (Exit.isSuccess(exit)) {
*         yield* Effect.sync(() => { output.push(`Closing connection to ${db.connection} (success)`) })
*       } else {
*         yield* Effect.sync(() => { output.push(`Closing connection to ${db.connection} (failure)`) })
*       }
*     })
* )
*
* await Effect.runPromise(program)
* output // => ["Connecting to database...", "Connected to db://localhost:5432", "Query result: Result for: SELECT * FROM users", "Closing connection to db://localhost:5432 (success)"]
* ```
*
* @see {@link acquireRelease} for scoped resources whose use happens later
*
* @category resource management
* @since 2.0.0
*/
const acquireUseRelease = acquireUseRelease$1;
/**
* Returns an effect that, if this effect _starts_ execution, then the
* specified `finalizer` is guaranteed to be executed, whether this effect
* succeeds, fails, or is interrupted.
*
* **Details**
*
* For use cases that need access to the effect's result, see `onExit`.
*
* Finalizers offer very powerful guarantees, but they are low-level, and
* should generally not be used for releasing resources. For higher-level
* logic built on `ensuring`, see the `acquireRelease` family of methods.
*
* **Example** (Always running cleanup)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* const task = Effect.gen(function*() {
*   yield* Effect.sync(() => { output.push("Task started") })
*   yield* Effect.sync(() => { output.push("Task completed") })
*   return 42
* })
*
* // Ensure cleanup always runs, regardless of success or failure
* const program = Effect.ensuring(
*   task,
*   Effect.sync(() => { output.push("Cleanup: This always runs!") })
* )
*
* void output.push(Effect.runSync(program))
* output // => ["Task started", "Task completed", "Cleanup: This always runs!", 42]
* ```
*
* @category resource management
* @since 2.0.0
*/
const ensuring = ensuring$1;
/**
* Ensures that a cleanup function runs whether this effect succeeds, fails, or
* is interrupted.
*
* **Details**
*
* If both the effect and the cleanup function fail, the two causes are merged.
*
* **Example** (Observing every exit)
*
* ```ts import.meta.vitest
* import { Effect, Exit } from "effect"
* const output: Array<unknown> = []
*
* const task = Effect.succeed(42)
*
* const program = Effect.onExit(task, (exit) =>
*   Effect.sync(() => { output.push(
*     Exit.isSuccess(exit)
*       ? `Task succeeded with: ${exit.value}`
*       : `Task failed: ${Exit.isFailure(exit) ? exit.cause : "interrupted"}`
*   ) }))
*
* void output.push(Effect.runSync(program))
* output // => ["Task succeeded with: 42", 42]
* ```
*
* @category resource management
* @since 2.0.0
*/
const onExit = onExit$1;
/**
* Returns an effect that is immediately interrupted.
*
* **Example** (Creating an interrupted effect)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const program = Effect.gen(function*() {
*   return yield* Effect.interrupt
*   yield* Effect.succeed("This won't execute and is unreachable")
* })
*
* Effect.runSyncExit(program)._tag // => "Failure"
* ```
*
* @category interruption
* @since 2.0.0
*/
const interrupt = interrupt$1;
/**
* Disables interruption and provides a restore function to restore the
* interruptible state within the effect.
*
* **Example** (Restoring interruption in protected regions)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* const program = Effect.uninterruptibleMask((restore) =>
*   Effect.gen(function*() {
*     yield* Effect.sync(() => { output.push("Uninterruptible phase...") })
*     // Restore interruptibility for this part
*     yield* restore(
*       Effect.gen(function*() {
*         yield* Effect.sync(() => { output.push("Interruptible phase...") })
*       })
*     )
*
*     yield* Effect.sync(() => { output.push("Back to uninterruptible") })
*   })
* )
*
* Effect.runSync(program)
* output // => ["Uninterruptible phase...", "Interruptible phase...", "Back to uninterruptible"]
* ```
*
* @category interruption
* @since 2.0.0
*/
const uninterruptibleMask = uninterruptibleMask$1;
/**
* Forks the effect in the specified scope. The fiber will be interrupted
* when the scope is closed.
*
* **Example** (Forking into a supplied scope)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const task = Effect.never
*
* const program = Effect.scoped(
*   Effect.gen(function*() {
*     const scope = yield* Effect.scope
*     const fiber = yield* Effect.forkIn(task, scope)
*     // Fiber will be interrupted when scope closes
*     return "done"
*   })
* )
*
* await Effect.runPromise(program) // => "done"
* ```
*
* @category forking
* @since 2.0.0
*/
const forkIn = forkIn$1;
/**
* Executes an effect and returns the result as a `Promise`.
*
* **When to use**
*
* Use when you need to execute an effect and work with the
* result using `Promise` syntax, typically for compatibility with other
* promise-based code.
*
* If the effect succeeds, the promise will resolve with the result. If the
* effect fails, the promise will reject with an error.
*
* **Example** (Running a successful effect as a Promise)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* await Effect.runPromise(Effect.succeed(1)) // => 1
* ```
*
* **Example** (Running effects as promises)
*
* ```ts import.meta.vitest
* //Example: Handling a Failing Effect as a Rejected Promise
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* await Effect.runPromise(Effect.fail("my error")).catch(() => {
*   void output.push("rejected")
* })
* output // => ["rejected"]
* ```
*
* @see {@link runPromiseExit} for a version that returns an `Exit` type instead of rejecting.
* @category running
* @since 2.0.0
*/
const runPromise = runPromise$1;
/**
* Runs an effect synchronously and captures the outcome safely as an `Exit` type, which
* represents the outcome (success or failure) of the effect.
*
* **When to use**
*
* Use to find out whether an effect succeeded or failed,
* including any defects, without dealing with asynchronous operations.
*
* **Details**
*
* The `Exit` type represents the result of the effect. Successful effects are
* wrapped in `Success`, and failed effects are wrapped in `Failure` with a
* `Cause`.
*
* If the effect contains asynchronous operations, `runSyncExit` will
* return an `Failure` with a `Die` cause, indicating that the effect cannot be
* resolved synchronously.
*
* **Example** (Observing synchronous results as Exit)
*
* ```ts import.meta.vitest
* import { Effect, Exit } from "effect"
*
* Effect.runSyncExit(Effect.succeed(1)) // => Exit.succeed(1)
*
* Effect.runSyncExit(Effect.fail("my error")) // => Exit.fail("my error")
* ```
*
* **Example** (Capturing async work as a Die cause)
*
* ```ts import.meta.vitest
* import { Cause, Effect, Exit } from "effect"
*
* const exit = Effect.runSyncExit(Effect.promise(() => Promise.resolve(1)))
* const isAsyncDie = Exit.hasDies(exit) && exit.cause.reasons.some(
*   (reason) => Cause.isDieReason(reason) && Cause.isAsyncFiberError(reason.defect)
* )
*
* isAsyncDie // => true
* ```
*
* @see {@link runSync} for a version that throws on failure.
*
* @category running
* @since 2.0.0
*/
const runSyncExit = runSyncExit$1;
/**
* Applies `map` eagerly when an effect is already resolved.
*
* **When to use**
*
* Use when an already-resolved effect should apply a success transformation
* immediately while pending effects still use regular mapping.
*
* **Details**
*
* Success effects apply the mapping function immediately. Failure effects pass
* through unchanged, and pending effects fall back to regular `map` behavior.
*
* **Example** (Mapping already completed effects)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* // For resolved effects, the mapping is applied immediately
* const resolved = Effect.succeed(5)
* const mapped = Effect.mapEager(resolved, (n) => n * 2) // Applied eagerly
*
* // For pending effects, behaves like regular map
* const pending = Effect.delay(Effect.succeed(5), 0)
* const mappedPending = Effect.mapEager(pending, (n) => n * 2) // Uses regular map
*
* await Effect.runPromise(Effect.all([mapped, mappedPending])) // => [10, 10]
* ```
*
* @category mapping
* @since 4.0.0
*/
const mapEager = mapEager$1;
/**
* Applies `flatMap` eagerly when an effect is already resolved.
*
* **When to use**
*
* Use when an already-resolved successful effect should bind immediately to the
* next effect while pending effects still use regular flat mapping.
*
* **Details**
*
* Success effects apply the flatMap function immediately. Failure effects pass
* through unchanged, and pending effects fall back to regular `flatMap`
* behavior.
*
* **Example** (Flat mapping eagerly when possible)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* // For resolved effects, the flatMap is applied immediately
* const resolved = Effect.succeed(5)
* const flatMapped = Effect.flatMapEager(resolved, (n) => Effect.succeed(n * 2)) // Applied eagerly
*
* // For pending effects, behaves like regular flatMap
* const pending = Effect.delay(Effect.succeed(5), 0)
* const flatMappedPending = Effect.flatMapEager(
*   pending,
*   (n) => Effect.succeed(n * 2)
* ) // Uses regular flatMap
*
* await Effect.runPromise(Effect.all([flatMapped, flatMappedPending])) // => [10, 10]
* ```
*
* @category sequencing
* @since 4.0.0
*/
const flatMapEager = flatMapEager$1;
/**
* Creates untraced function effects with eager evaluation optimization.
*
* **Details**
*
* Executes generator functions eagerly when all yielded effects are synchronous,
* stopping at the first async effect and deferring to normal execution.
*
* **Example** (Defining eager untraced effect functions)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const computation = Effect.fnUntracedEager(function*() {
*   yield* Effect.succeed(1)
*   yield* Effect.succeed(2)
*   return "computed eagerly"
* })
*
* const effect = computation() // Executed immediately if all effects are sync
* Effect.runSync(effect) // => "computed eagerly"
* ```
*
* @category constructors
* @since 4.0.0
*/
const fnUntracedEager = fnUntracedEager$1;
// node_modules/effect/dist/BigDecimal.js
/**
* Decimal numbers and arithmetic for cases where JavaScript `number` rounding
* is not precise enough. A `BigDecimal` stores digits as a `bigint` plus a
* decimal scale, which lets the module parse, compare, add, subtract, multiply,
* divide, round, and format decimal values such as money, quantities, and
* measurements.
*
* @since 2.0.0
*/
const TypeId$7 = "~effect/BigDecimal";
const BigDecimalProto = {
	[TypeId$7]: TypeId$7,
	[symbol$1]() {
		const normalized = normalize(this);
		return combine(string$1(String(normalized.value)), number$1(normalized.scale));
	},
	[symbol](that) {
		return isBigDecimal(that) && compare(this, that) === 0;
	},
	toString() {
		return `BigDecimal(${format(this)})`;
	},
	toJSON() {
		return {
			_id: "BigDecimal",
			value: String(this.value),
			scale: this.scale
		};
	},
	[NodeInspectSymbol]() {
		return this.toJSON();
	},
	pipe() {
		return pipeArguments(this, arguments);
	}
};
/**
* Checks whether a given value is a `BigDecimal`.
*
* **When to use**
*
* Use to validate unknown input and narrow it to `BigDecimal`.
*
* **Example** (Checking BigDecimal values)
*
* ```ts import.meta.vitest
* import { BigDecimal } from "effect"
*
* const decimal = BigDecimal.fromNumber(123.45)
* BigDecimal.isBigDecimal(decimal) // => false
* BigDecimal.isBigDecimal(BigDecimal.fromStringUnsafe("123.45")) // => true
* BigDecimal.isBigDecimal(123.45) // => false
* BigDecimal.isBigDecimal("123.45") // => false
* ```
*
* @category guards
* @since 2.0.0
*/
const isBigDecimal = (u) => hasProperty(u, TypeId$7);
/**
* Creates a `BigDecimal` from a `bigint` value and a safe integer scale.
*
* **When to use**
*
* Use to construct a decimal directly from its unscaled integer value and
* decimal scale.
*
* **Gotchas**
*
* Throws a `RangeError` if `scale` is not a safe integer.
*
* **Example** (Creating decimals from bigint and scale)
*
* ```ts import.meta.vitest
* import { BigDecimal } from "effect"
*
* // Create 123.45 (12345 with scale 2)
* const decimal = BigDecimal.make(12345n, 2)
* decimal // => BigDecimal.fromStringUnsafe("123.45")
*
* // Create 42 (42 with scale 0)
* const integer = BigDecimal.make(42n, 0)
* integer // => BigDecimal.fromBigInt(42n)
* ```
*
* @see {@link fromBigInt} for constructing an integer decimal from a `bigint`
*
* @category constructors
* @since 2.0.0
*/
const make$8 = (value, scale) => {
	if (!Number.isSafeInteger(scale)) throw new RangeError(`Scale must be a safe integer, got ${scale}`);
	const o = Object.create(BigDecimalProto);
	o.value = value;
	o.scale = scale;
	return o;
};
const makeNormalized = (value, scale) => {
	const o = make$8(value, scale);
	o.normalized = o;
	return o;
};
const bigint0 = /*#__PURE__*/ BigInt(0);
const bigint1 = /*#__PURE__*/ BigInt(1);
const bigint10 = /*#__PURE__*/ BigInt(10);
const zero = /*#__PURE__*/ makeNormalized(bigint0, 0);
/**
* Normalizes a given `BigDecimal` by removing trailing zeros.
*
* **When to use**
*
* Use to canonicalize decimals that have equivalent values but different
* internal scales.
*
* **Example** (Normalizing trailing zeros)
*
* ```ts import.meta.vitest
* import { BigDecimal } from "effect"
*
* const decimal = BigDecimal.normalize(BigDecimal.fromStringUnsafe("123.00000"))
* const decimalStorage = [decimal.value, decimal.scale] // => [123n, 0]
*
* const largeDecimal = BigDecimal.normalize(BigDecimal.fromStringUnsafe("12300000"))
* const largeDecimalStorage = [largeDecimal.value, largeDecimal.scale] // => [123n, -5]
* ```
*
* @see {@link format} for rendering normalized decimals as strings
*
* @category scaling
* @since 2.0.0
*/
const normalize = (self) => {
	if (self.normalized === void 0) {
		if (self.value === bigint0) self.normalized = zero;
		else {
			const digits = `${self.value}`;
			let end = digits.length;
			while (digits[end - 1] === "0") end--;
			self.normalized = makeNormalized(BigInt(digits.slice(0, end)), self.scale - (digits.length - end));
		}
	}
	return self.normalized;
};
const MAX_COMPARISON_SCALE_ALIGNMENT = 100;
const comparisonPowersOfTen = [bigint1];
const compareBigInt = (self, that) => self === that ? 0 : self < that ? -1 : 1;
const compareMagnitude = (self, that) => {
	const selfDigits = `${self.value < bigint0 ? -self.value : self.value}`;
	const thatDigits = `${that.value < bigint0 ? -that.value : that.value}`;
	const exponentDifference = BigInt(selfDigits.length - thatDigits.length) - BigInt(self.scale) + BigInt(that.scale);
	if (exponentDifference !== bigint0) return exponentDifference < bigint0 ? -1 : 1;
	const length = Math.max(selfDigits.length, thatDigits.length);
	return String$4(selfDigits.padEnd(length, "0"), thatDigits.padEnd(length, "0"));
};
const compare = (self, that) => {
	if (self.scale === that.scale) return compareBigInt(self.value, that.value);
	const selfSign = sign(self);
	const thatSign = sign(that);
	if (selfSign !== thatSign) return selfSign < thatSign ? -1 : 1;
	if (selfSign === 0) return 0;
	const scaleDifference = self.scale - that.scale;
	const absoluteScaleDifference = Math.abs(scaleDifference);
	if (absoluteScaleDifference > MAX_COMPARISON_SCALE_ALIGNMENT) return selfSign === -1 ? compareMagnitude(that, self) : compareMagnitude(self, that);
	const powerOfTen = comparisonPowersOfTen[absoluteScaleDifference] ??= bigint10 ** BigInt(absoluteScaleDifference);
	return scaleDifference > 0 ? compareBigInt(self.value, that.value * powerOfTen) : compareBigInt(self.value * powerOfTen, that.value);
};
/**
* Determines the sign of a given `BigDecimal`.
*
* **When to use**
*
* Use to classify a `BigDecimal` as negative, zero, or positive.
*
* **Example** (Reading decimal signs)
*
* ```ts import.meta.vitest
* import { BigDecimal } from "effect"
*
* BigDecimal.sign(BigDecimal.fromStringUnsafe("-5")) // => -1
* BigDecimal.sign(BigDecimal.fromStringUnsafe("0")) // => 0
* BigDecimal.sign(BigDecimal.fromStringUnsafe("5")) // => 1
* ```
*
* @category math
* @since 2.0.0
*/
const sign = (n) => n.value === bigint0 ? 0 : n.value < bigint0 ? -1 : 1;
/**
* Formats a `BigDecimal` as a string.
*
* **When to use**
*
* Use to render a `BigDecimal` as plain decimal text when possible.
*
* **Details**
*
* The value is normalized before formatting. Scientific notation is used when
* the absolute value of the normalized scale is at least `16`; otherwise plain
* decimal notation is used.
*
* **Example** (Formatting decimals)
*
* ```ts import.meta.vitest
* import { BigDecimal } from "effect"
*
* BigDecimal.format(BigDecimal.fromStringUnsafe("-5")) // => "-5"
* BigDecimal.format(BigDecimal.fromStringUnsafe("123.456")) // => "123.456"
* BigDecimal.format(BigDecimal.fromStringUnsafe("-0.00000123")) // => "-0.00000123"
* ```
*
* @see {@link toExponential} for always rendering scientific notation
*
* @category converting
* @since 2.0.0
*/
const format = (n) => {
	const normalized = normalize(n);
	if (Math.abs(normalized.scale) >= 16) return toExponential(normalized);
	const negative = normalized.value < bigint0;
	const absolute = `${negative ? -normalized.value : normalized.value}`;
	const digits = normalized.scale > 0 ? absolute.padStart(normalized.scale + 1, "0") : absolute.padEnd(absolute.length - normalized.scale, "0");
	const point = digits.length - normalized.scale;
	const complete = normalized.scale > 0 ? `${digits.slice(0, point)}.${digits.slice(point)}` : digits;
	return negative ? `-${complete}` : complete;
};
/**
* Formats a given `BigDecimal` as a `string` in scientific notation.
*
* **When to use**
*
* Use to render a `BigDecimal` in scientific notation.
*
* **Example** (Formatting decimals exponentially)
*
* ```ts import.meta.vitest
* import { BigDecimal } from "effect"
*
* BigDecimal.toExponential(BigDecimal.make(123456n, -5)) // => "1.23456e+10"
* ```
*
* @see {@link format} for plain decimal formatting when possible
*
* @category converting
* @since 3.11.0
*/
const toExponential = (n) => {
	if (isZero(n)) return "0e+0";
	const normalized = normalize(n);
	const digits = `${normalized.value}`;
	const point = normalized.value < bigint0 ? 2 : 1;
	const head = digits.slice(0, point);
	const tail = digits.slice(point);
	const exp = tail.length - normalized.scale;
	return `${head}${tail === "" ? "" : `.${tail}`}e${exp >= 0 ? "+" : ""}${exp}`;
};
/**
* Checks whether a given `BigDecimal` is `0`.
*
* **When to use**
*
* Use to test whether a `BigDecimal` is exactly zero.
*
* **Example** (Checking zero decimals)
*
* ```ts import.meta.vitest
* import { BigDecimal } from "effect"
*
* BigDecimal.isZero(BigDecimal.fromStringUnsafe("0")) // => true
* BigDecimal.isZero(BigDecimal.fromStringUnsafe("1")) // => false
* ```
*
* @category predicates
* @since 2.0.0
*/
const isZero = (n) => n.value === bigint0;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const codes = /*#__PURE__*/ (/* @__PURE__ */ new Uint8Array(123)).fill(255);
for (let i = 0; i < 64; i++) codes[/*#__PURE__*/ alphabet.charCodeAt(i)] = i;
codes[/*#__PURE__*/ "=".charCodeAt(0)] = 0;
({ ...BaseProto });
({ ...BaseProto });
({ ...PipeInspectableProto });
// node_modules/effect/dist/internal/schema/annotations.js
/** @internal */
function resolve$2(ast) {
	return ast.checks ? ast.checks[ast.checks.length - 1].annotations : ast.annotations;
}
/** @internal */
function resolveAt(key) {
	return (ast) => resolve$2(ast)?.[key];
}
/** @internal */
const STRUCTURAL_ANNOTATION_KEY = "~structural";
/** @internal */
const IDENTIFIER_FALLBACK_KEY = "~identifier";
/** @internal */
const SENTINELS_ANNOTATION_KEY = "~sentinels";
/** @internal */
const CONSTRUCTOR_ANNOTATION_KEY = "~constructor";
/** @internal */
const jsonSchemaAnnotationKeys = [
	"title",
	"description",
	"default",
	"examples",
	"readOnly",
	"writeOnly",
	"format",
	"contentEncoding",
	"contentMediaType",
	"contentSchema"
];
/** @internal */
const resolveIdentifier = /*#__PURE__*/ resolveAt("identifier");
/** @internal */
const resolveIdentifierFallback = /*#__PURE__*/ resolveAt(IDENTIFIER_FALLBACK_KEY);
/** @internal */
const getExpected = /*#__PURE__*/ memoize((ast) => {
	const identifier = resolve$2(ast)?.identifier;
	if (typeof identifier === "string") return identifier;
	return ast.getExpected(getExpected);
});
/** @internal */
const annotationExcludedKeys = /*#__PURE__*/ new Set([
	SENTINELS_ANNOTATION_KEY,
	STRUCTURAL_ANNOTATION_KEY,
	"representation",
	"arbitraryConstraint",
	"toJsonSchema",
	"toCode",
	"toEquivalence",
	"toFormatter",
	"toCodec",
	"toCodecJson",
	"toCodecStringTree",
	"toCodecIso",
	"toCodecArbitrary"
]);
// node_modules/effect/dist/internal/schema/parser.js
/** @internal */
const missing = /*#__PURE__*/ Symbol();
/** @internal */
const succeed = succeed$2;
/** @internal */
const missingExit = /*#__PURE__*/ succeed(missing);
/** @internal */
const sameExit = /*#__PURE__*/ succeed(missing);
/** @internal */
const toOption = (value) => value === missing ? none() : some(value);
/** @internal */
const fromOptionExit = (option) => option._tag === "None" ? missingExit : succeed(option.value);
// node_modules/effect/dist/SchemaIssue.js
/**
* Describes problems found while decoding, encoding, or checking data with
* schemas.
*
* An `Issue` records what failed and, for nested data, where the failure
* happened. The Schema system uses these values for missing keys, unexpected
* keys, invalid types, invalid values, failed filters, failed transformations,
* and alternatives that did not match. This module also formats issues.
*
* @since 4.0.0
*/
const TypeId$4 = "~effect/SchemaIssue/Issue";
/**
* Returns `true` if the given value is an {@link Issue}.
*
* **When to use**
*
* Use when you need to narrow an `unknown` value to `Issue` in error-handling
* code, such as distinguishing an `Issue` from other error types in a catch-all
* handler.
*
* **Details**
*
* - Checks for the internal `TypeId` brand on the value.
*
* **Example** (Type-guarding an unknown error)
*
* ```ts import.meta.vitest
* import { SchemaIssue } from "effect"
*
* const issue = new SchemaIssue.MissingKey(undefined)
* SchemaIssue.isIssue(issue) // => true
* SchemaIssue.isIssue("not an issue") // => false
* ```
*
* @see {@link Issue}
*
* @category guards
* @since 4.0.0
*/
function isIssue(u) {
	return hasProperty(u, TypeId$4) && u[TypeId$4] === TypeId$4;
}
/**
* Returns `true` when an issue contains an input reported by the schema parser.
*
* **When to use**
*
* Use when reading `Issue.input`, especially when `undefined` is a valid input
* value.
*
* **Details**
*
* Reported input is stored as an own property. This guard checks for that
* property and narrows `input` from optional to required.
*
* **Example** (Reading a reported input)
*
* ```ts import.meta.vitest
* import { Result, Schema, SchemaIssue } from "effect"
*
* const result = Schema.decodeUnknownResult(Schema.String)(1, { reportInput: true })
* if (Result.isFailure(result) && SchemaIssue.hasInput(result.failure.issue)) {
*   result.failure.issue.input // => 1
* }
* ```
*
* @see {@link Issue} for the complete issue model
*
* @category guards
* @since 4.0.0
*/
function hasInput(issue) {
	return Object.hasOwn(issue, "input");
}
var IssueNodeImpl = class {
	[TypeId$4] = TypeId$4;
	constructor(input, options) {
		if (options?.reportInput === true && input !== missing) this.input = input;
	}
};
/**
* Constructs a schema issue for a failed refinement check.
*
* @category constructors
* @since 4.0.0
*/
const Filter$1 = class extends IssueNodeImpl {
	_tag = "Filter";
	/**
	* The filter that failed.
	*/
	filter;
	/**
	* The issue that occurred.
	*/
	issue;
	constructor(filter, issue, input, options) {
		super(input, options);
		this.filter = filter;
		this.issue = issue;
	}
};
/**
* Constructs a schema issue for a failed transformation.
*
* @category constructors
* @since 4.0.0
*/
const Encoding = class extends IssueNodeImpl {
	_tag = "Encoding";
	/**
	* The schema that caused the issue.
	*/
	ast;
	/**
	* The issue that occurred.
	*/
	issue;
	constructor(ast, issue, input, options) {
		super(input, options);
		this.ast = ast;
		this.issue = issue;
	}
};
/**
* Constructs a schema issue that points to a nested location.
*
* @category constructors
* @since 4.0.0
*/
const Pointer = class extends IssueNodeImpl {
	_tag = "Pointer";
	/**
	* The path to the location in the input that caused the issue.
	*/
	path;
	/**
	* The issue that occurred.
	*/
	issue;
	constructor(path, issue) {
		super();
		this.path = path;
		this.issue = issue;
	}
};
/**
* Constructs a schema issue for a missing key or tuple index.
*
* @category constructors
* @since 4.0.0
*/
const MissingKey = class extends IssueNodeImpl {
	_tag = "MissingKey";
	/**
	* The metadata for the issue.
	*/
	annotations;
	constructor(annotations) {
		super();
		this.annotations = annotations;
	}
};
/**
* Constructs a schema issue for an unexpected key or tuple index.
*
* @category constructors
* @since 4.0.0
*/
const UnexpectedKey = class extends IssueNodeImpl {
	_tag = "UnexpectedKey";
	/**
	* The schema that caused the issue.
	*/
	ast;
	constructor(ast, input, options) {
		super(input, options);
		this.ast = ast;
	}
};
/**
* Constructs a schema issue that groups multiple child issues.
*
* @category constructors
* @since 4.0.0
*/
const Composite = class extends IssueNodeImpl {
	_tag = "Composite";
	/**
	* The schema that caused the issue.
	*/
	ast;
	/**
	* The issues that occurred.
	*/
	issues;
	constructor(ast, issues, input, options) {
		super(input, options);
		this.ast = ast;
		this.issues = issues;
	}
};
/**
* Constructs a schema issue for an input with an invalid runtime type.
*
* @category constructors
* @since 4.0.0
*/
const InvalidType = class extends IssueNodeImpl {
	_tag = "InvalidType";
	/**
	* The schema that caused the issue.
	*/
	ast;
	constructor(ast, input, options) {
		super(input, options);
		this.ast = ast;
	}
};
/**
* Constructs a schema issue for a value that violates a constraint.
*
* @category constructors
* @since 4.0.0
*/
const InvalidValue = class extends IssueNodeImpl {
	_tag = "InvalidValue";
	/**
	* The metadata for the issue.
	*/
	annotations;
	constructor(annotations, input, options) {
		super(input, options);
		this.annotations = annotations;
	}
};
/**
* Constructs a schema issue for a value that matches no union member.
*
* @category constructors
* @since 4.0.0
*/
const AnyOf = class extends IssueNodeImpl {
	_tag = "AnyOf";
	/**
	* The schema that caused the issue.
	*/
	ast;
	/**
	* The issues that occurred.
	*/
	issues;
	constructor(ast, issues, input, options) {
		super(input, options);
		this.ast = ast;
		this.issues = issues;
	}
};
/**
* Constructs a schema issue for a value that matches multiple union members.
*
* @category constructors
* @since 4.0.0
*/
const OneOf = class extends IssueNodeImpl {
	_tag = "OneOf";
	/**
	* The schema that caused the issue.
	*/
	ast;
	/**
	* The schemas that were successful.
	*/
	successes;
	constructor(ast, successes, input, options) {
		super(input, options);
		this.ast = ast;
		this.successes = successes;
	}
};
function makeFilterIssue(entry, input, options) {
	if (isIssue(entry)) return entry;
	if (typeof entry === "string") return new InvalidValue({ message: entry }, input, options);
	const inner = typeof entry.issue === "string" ? new InvalidValue({ message: entry.issue }, input, options) : entry.issue;
	return new Pointer(entry.path, inner);
}
/** @internal */
function makeSingle(out, input, options) {
	if (out === void 0) return;
	if (typeof out === "boolean") return out ? void 0 : new InvalidValue(void 0, input, options);
	return makeFilterIssue(out, input, options);
}
/** @internal */
function normalizeFilterOutput(ast, out, input, options) {
	if (Array.isArray(out)) {
		if (!isReadonlyArrayNonEmpty(out)) return;
		return out.length === 1 ? makeFilterIssue(out[0], input, options) : new Composite(ast, map$3(out, (entry) => makeFilterIssue(entry, input, options)), input, options);
	}
	return makeSingle(out, input, options);
}
/**
* Returns the built-in {@link LeafHook} used by default formatters.
*
* **When to use**
*
* Use as the default leaf renderer when customizing only the {@link CheckHook}.
*
* **Details**
*
* - Checks for a `message` annotation first; returns it if present.
* - For `InvalidValue`, an `expected` annotation uses the standard expected
*   value message and includes reported input when available.
* - Otherwise generates a default message per `_tag`. When the issue reports
*   input, the message includes its formatted value where applicable:
*   - `InvalidType` → `"Expected <type>"` or `"Expected <type>, got <input>"`
*   - `InvalidValue` → `"Expected a valid value"` or `"Invalid data <input>"`
*   - `MissingKey` → `"Missing key"`
*   - `UnexpectedKey` → `"Expected no excess property"` or
*     `"Unexpected key with value <input>"`
*   - `Forbidden` → `"Forbidden operation"`
*   - `OneOf` → `"Expected exactly one member to match"` or
*     `"Expected exactly one member to match the input <input>"`
*
* **Example** (Formatting Standard Schema issues with defaultLeafHook)
*
* ```ts import.meta.vitest
* import { SchemaIssue } from "effect"
*
* const formatter = SchemaIssue.makeFormatterStandardSchemaV1({
*   leafHook: SchemaIssue.defaultLeafHook
* })
* formatter(new SchemaIssue.MissingKey(undefined)) // => { issues: [{ path: [], message: "Missing key" }] }
* ```
*
* @see {@link LeafHook}
* @see {@link makeFormatterStandardSchemaV1}
*
* @category formatting
* @since 4.0.0
*/
const defaultLeafHook = (issue) => {
	const message = findMessage(issue);
	if (message !== void 0) return message;
	switch (issue._tag) {
		case "InvalidType": return getExpectedMessage(getExpected(issue.ast), issue);
		case "InvalidValue": {
			const expected = findExpected(issue);
			if (expected !== void 0) return getExpectedMessage(expected, issue);
			const input = formatInput(issue);
			return input === void 0 ? "Expected a valid value" : `Invalid data ${input}`;
		}
		case "MissingKey": return "Missing key";
		case "UnexpectedKey": {
			const input = formatInput(issue);
			return input === void 0 ? "Expected no excess property" : `Unexpected key with value ${input}`;
		}
		case "Forbidden": return "Forbidden operation";
		case "OneOf": {
			const input = formatInput(issue);
			return input === void 0 ? "Expected exactly one member to match" : `Expected exactly one member to match the input ${input}`;
		}
	}
};
/**
* Returns the built-in {@link CheckHook} used by default formatters.
*
* **When to use**
*
* Use as the default filter renderer when customizing only the {@link LeafHook}.
*
* **Details**
*
* - Looks for a `message` annotation on the inner issue first, then on the
*   filter itself.
* - Returns `undefined` when no annotation is found, causing the formatter to
*   fall back to `"Expected <filter>"` or, when the filter reports input,
*   `"Expected <filter>, got <input>"`.
*
* @see {@link CheckHook}
* @see {@link makeFormatterStandardSchemaV1}
*
* @category formatting
* @since 4.0.0
*/
const defaultCheckHook = (issue) => findMessage(issue.issue) ?? findMessage(issue);
function formatInput(issue) {
	return hasInput(issue) ? format$1(issue.input) : void 0;
}
function findExpected(issue) {
	const expected = issue.annotations?.expected;
	return typeof expected === "string" ? expected : void 0;
}
function getExpectedMessage(expected, issue) {
	const input = formatInput(issue);
	return input === void 0 ? `Expected ${expected}` : `Expected ${expected}, got ${input}`;
}
function formatCheck(check) {
	const expected = check.annotations?.expected;
	if (typeof expected === "string") return expected;
	switch (check._tag) {
		case "Filter": return "<filter>";
		case "FilterGroup": return check.checks.map((check) => formatCheck(check)).join(" & ");
	}
}
/**
* Creates a {@link Formatter} that converts an {@link Issue} into a
* human-readable multi-line string.
*
* **When to use**
*
* Use when you need to format a `SchemaIssue.Issue` as error messages for
* logging, CLI output, or developer-facing diagnostics.
*
* **Details**
*
* - Flattens the issue tree into `{ message, path }` entries using
*   {@link defaultLeafHook} and {@link defaultCheckHook}.
* - Includes reported input in default messages when the node producing the
*   message has an `input` field.
* - Each entry is rendered as `"<message>"` or `"<message>\n  at <path>"`.
* - Multiple entries are joined with newlines.
*
* **Gotchas**
*
* Formatting an issue can disclose input retained with `reportInput: true`.
* Wrapper inputs are not inherited by child messages, and custom messages are
* returned unchanged.
*
* **Example** (Formatting an issue as a string)
*
* ```ts import.meta.vitest
* import { SchemaIssue } from "effect"
*
* const formatter = SchemaIssue.makeFormatterDefault()
* formatter(new SchemaIssue.MissingKey(undefined)) // => "Missing key"
* ```
*
* @see {@link makeFormatterStandardSchemaV1} — produces Standard Schema V1 format instead
* @see {@link Formatter}
*
* @category formatting
* @since 4.0.0
*/
function makeFormatterDefault() {
	return (issue) => formatIssue(issue, "");
}
/** @internal */
const defaultFormatter = /*#__PURE__*/ makeFormatterDefault();
function formatIssue(issue, path) {
	let message;
	switch (issue._tag) {
		case "Filter": {
			const annotated = defaultCheckHook(issue);
			if (annotated !== void 0) message = annotated;
			else {
				if (issue.issue._tag !== "InvalidValue") return formatIssue(issue.issue, path);
				const expected = findExpected(issue.issue);
				message = expected === void 0 ? getExpectedMessage(formatCheck(issue.filter), issue) : getExpectedMessage(expected, issue.issue);
			}
			break;
		}
		case "Encoding": return formatIssue(issue.issue, path);
		case "Pointer": return formatIssue(issue.issue, path + formatPath(issue.path));
		case "Composite":
		case "AnyOf":
			if (issue._tag === "Composite" || issue.issues.length > 0) return issue.issues.map((issue) => formatIssue(issue, path)).join("\n");
			message = findMessage(issue) ?? getExpectedMessage(getExpected(issue.ast), issue);
			break;
		default: message = defaultLeafHook(issue);
	}
	return path ? `${message}\n  at ${path}` : message;
}
function findMessage(issue) {
	if (issue._tag === "Pointer") return;
	if (issue._tag === "Encoding") return findMessage(issue.issue);
	const message = (issue._tag === "Filter" ? issue.filter.annotations : "annotations" in issue ? issue.annotations : issue.ast.annotations)?.[issue._tag === "MissingKey" ? "messageMissingKey" : issue._tag === "UnexpectedKey" ? "messageUnexpectedKey" : "message"];
	if (typeof message === "string") return message;
}
// node_modules/effect/dist/internal/schema/cause.js
/** @internal */
function getSchemaIssue(cause) {
	let issue;
	for (const reason of cause.reasons) {
		if (!isFailReason(reason) || !isIssue(reason.error)) return;
		issue ??= reason.error;
	}
	return issue;
}
/** @internal */
function getSchemaIssueOrThrow(cause, message) {
	const issue = getSchemaIssue(cause);
	if (issue === void 0) throw new Error(message, { cause });
	return issue;
}
// node_modules/effect/dist/SchemaGetter.js
const makeGetter = (fields) => Object.assign(Object.create(Prototype$1), fields);
const passthrough_$1 = /*#__PURE__*/ makeGetter({ _tag: "Passthrough" });
function passthrough$1() {
	return passthrough_$1;
}
/**
* Creates a getter that applies a pure function to present values.
*
* **When to use**
*
* Use when you need a schema getter for a pure, infallible transformation
* between types.
* - Building encode/decode pairs for `Schema.decodeTo`.
*
* **Details**
*
* - This is the most commonly used constructor.
* - Transforms `Some(e)` to `Some(f(e))` and leaves `None` unchanged.
* - Skips `None` inputs — only called when a value is present.
* - Never fails.
*
* **Example** (Transforming strings to numbers)
*
* ```ts import.meta.vitest
* import { Schema, SchemaGetter } from "effect"
*
* const NumberFromString = Schema.String.pipe(
*   Schema.decodeTo(Schema.Number, {
*     decode: SchemaGetter.transform((s) => Number(s)),
*     encode: SchemaGetter.transform((n) => String(n))
*   })
* )
* Schema.decodeSync(NumberFromString)("42") // => 42
* ```
*
* @see {@link transformEffect} when the transformation returns an `Effect`
* @see {@link transformOptional} when you need to handle `None` inputs
* @see {@link passthrough} when no transformation is needed
*
* @category transforming
* @since 4.0.0
*/
function transform$1(f) {
	return makeGetter({
		_tag: "Transform",
		transform: f
	});
}
/**
* Creates a getter that applies an effectful transformation to present values.
*
* **When to use**
*
* Use when you need a schema getter for a transformation that may fail, require
* Effect services, or run asynchronously.
*
* **Details**
*
* - Skips `None` inputs — only called when a value is present.
* - On success, wraps the result in `Some`.
* - On failure, propagates the `Issue`.
*
* **Example** (Parsing with failure)
*
* ```ts import.meta.vitest
* import { Effect, Option, SchemaGetter, SchemaIssue } from "effect"
*
* const safeParseInt = SchemaGetter.transformEffect<number, string>(
*   (s, options) => {
*     const n = parseInt(s, 10)
*     return isNaN(n)
*       ? Effect.fail(new SchemaIssue.InvalidValue({ message: "not an integer" }, s, options))
*       : Effect.succeed(n)
*   }
* )
* await Effect.runPromise(SchemaGetter.run(safeParseInt, Option.some("42"), {})) // => Option.some(42)
* ```
*
* @see {@link transform} when transformation cannot fail
* @see {@link transformOptionalEffect} when you need full `Option` control over the output
*
* @category transforming
* @since 4.0.0
*/
function transformEffect$1(f) {
	return makeGetter({
		_tag: "TransformEffect",
		transform: f
	});
}
/**
* Coerces any value to a `string` using the global `String()` constructor.
*
* **When to use**
*
* Use when you need a schema getter to coerce a present encoded value to a
* string with `String()`.
*
* **Details**
*
* The getter is pure, never fails, and delegates to `globalThis.String`.
*
* **Example** (Coercing to a string)
*
* ```ts import.meta.vitest
* import { Effect, Option, SchemaGetter } from "effect"
*
* const toString = SchemaGetter.String<number>()
* Effect.runSync(SchemaGetter.run(toString, Option.some(42), {})) // => Option.some("42")
* ```
*
* @see {@link transform} for custom string conversions
*
* @category converting
* @since 4.0.0
*/
function String$3() {
	return transform$1(globalThis.String);
}
/**
* Coerces any value to a `number` using the global `Number()` constructor.
*
* **When to use**
*
* Use when you need a schema getter to coerce a present encoded value to a
* number with `Number()`.
*
* **Details**
*
* The getter is pure, never fails, and delegates to `globalThis.Number`. It may
* produce `NaN` for non-numeric inputs.
*
* **Example** (Coercing to a number)
*
* ```ts import.meta.vitest
* import { Effect, Option, SchemaGetter } from "effect"
*
* const toNumber = SchemaGetter.Number<string>()
* Effect.runSync(SchemaGetter.run(toNumber, Option.some("42"), {})) // => Option.some(42)
* ```
*
* @see {@link transformEffect} for effectful or validated number parsing
*
* @category converting
* @since 4.0.0
*/
function Number$3() {
	return transform$1(globalThis.Number);
}
function parseJson(options) {
	return transformEffect$1((input, parseOptions) => try_({
		try: () => JSON.parse(input, options?.reviver),
		catch: () => new InvalidValue({ expected: "a valid JSON string" }, input, parseOptions)
	}));
}
/**
* Stringifies a present value using `JSON.stringify`.
*
* **When to use**
*
* Use when you need a schema getter to serialize a present decoded value to
* JSON text during encoding.
*
* **Details**
*
* - Skips `None` inputs.
* - If `JSON.stringify` throws or returns `undefined`, fails with
*   `SchemaIssue.InvalidValue`.
* - Supports optional `replacer` and `space` options, matching
*   `JSON.stringify`.
*
* **Example** (Stringifying JSON)
*
* ```ts import.meta.vitest
* import { Effect, Option, SchemaGetter } from "effect"
*
* const stringify = SchemaGetter.stringifyJson()
* const result = await Effect.runPromise(SchemaGetter.run(stringify, Option.some({ a: 1 }), {}))
* result // => Option.some("{\"a\":1}")
* ```
*
* @see {@link parseJson} for the inverse operation
*
* @category encoding
* @since 4.0.0
*/
function stringifyJson(options) {
	return transformEffect$1((input, parseOptions) => try_({
		try: () => {
			const output = JSON.stringify(input, options?.replacer, options?.space);
			if (output === void 0) throw new TypeError("Value cannot be represented as JSON");
			return output;
		},
		catch: () => new InvalidValue({ expected: "a JSON-serializable value" }, input, parseOptions)
	}));
}
// node_modules/effect/dist/SchemaTransformation.js
/**
* Constructs schema middleware from its decode and encode functions.
*
* @category constructors
* @since 4.0.0
*/
const Middleware = class extends Class$1 {
	_tag = "Middleware";
	decode;
	encode;
	constructor(decode, encode) {
		super();
		this.decode = decode;
		this.encode = encode;
	}
	flip() {
		return new Middleware(this.encode, this.decode);
	}
};
const TypeId$3 = "~effect/SchemaTransformation/Transformation";
/**
* Constructs a bidirectional schema transformation from its decode and encode getters.
*
* @category constructors
* @since 4.0.0
*/
const Transformation = class extends Class$1 {
	[TypeId$3] = TypeId$3;
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
/**
* Returns `true` if `u` is a `Transformation` instance.
*
* **When to use**
*
* Use to check whether a value is already a schema transformation before
* wrapping it.
*
* **Details**
*
* - Pure predicate, no side effects.
* - Acts as a TypeScript type guard.
*
* **Example** (Checking a value)
*
* ```ts import.meta.vitest
* import { SchemaTransformation } from "effect"
*
* SchemaTransformation.isTransformation(SchemaTransformation.trim()) // => true
* SchemaTransformation.isTransformation({ decode: null, encode: null }) // => false
* ```
*
* @see {@link Transformation}
* @see {@link makeTransformation}
*
* @category guards
* @since 4.0.0
*/
function isTransformation(u) {
	return hasProperty(u, TypeId$3) && u[TypeId$3] === TypeId$3;
}
/**
* Constructs a `Transformation` from an object with `decode` and `encode`
* `Getter`s. If the input is already a `Transformation`, returns it as-is.
*
* **When to use**
*
* Use when you already have schema getter instances and want to pair them into
* a schema transformation.
* - You want idempotent wrapping (won't double-wrap).
*
* **Details**
*
* - Returns the input unchanged if it is already a `Transformation`.
*
* **Example** (Wrapping existing getters)
*
* ```ts import.meta.vitest
* import { SchemaGetter, SchemaTransformation } from "effect"
*
* const t = SchemaTransformation.makeTransformation({
*   decode: SchemaGetter.transform<number, string>((s) => Number(s)),
*   encode: SchemaGetter.transform<string, number>((n) => String(n))
* })
* t._tag // => "Transformation"
* ```
*
* @see {@link transform} — simpler constructor from pure functions
* @see {@link transformEffect} — constructor from effectful functions
* @see {@link Transformation}
*
* @category constructors
* @since 3.10.0
*/
const makeTransformation = (options) => {
	if (isTransformation(options)) return options;
	return new Transformation(options.decode, options.encode);
};
/**
* Creates a `Transformation` from pure (sync, infallible) decode and encode
* functions.
*
* **When to use**
*
* Use when you need an infallible schema transformation that does not require
* Effect services.
*
* **Details**
*
* - Each function receives the input and returns the output directly.
* - Skips `None` inputs (missing keys) — functions are only called on present values.
* - Does not allocate Effects internally; uses optimized sync path.
*
* **Example** (Converting between cents and dollars)
*
* ```ts import.meta.vitest
* import { Schema, SchemaTransformation } from "effect"
*
* const CentsFromDollars = Schema.Number.pipe(
*   Schema.decodeTo(
*     Schema.Number,
*     SchemaTransformation.transform({
*       decode: (dollars) => dollars * 100,
*       encode: (cents) => cents / 100
*     })
*   )
* )
* Schema.decodeSync(CentsFromDollars)(2.5) // => 250
* ```
*
* @see {@link transformEffect} — for fallible or effectful transformations
* @see {@link transformOptional} — for transformations that handle missing keys
* @see {@link passthrough} — when no conversion is needed
*
* @category transforming
* @since 3.10.0
*/
function transform(options) {
	return new Transformation(transform$1(options.decode), transform$1(options.encode));
}
const passthrough_ = /*#__PURE__*/ new Transformation(/*#__PURE__*/ passthrough$1(), /*#__PURE__*/ passthrough$1());
function passthrough() {
	return passthrough_;
}
/**
* Decodes a `string` into a `number` and encodes a `number` back to a
* `string`.
*
* **When to use**
*
* Use when you need a schema transformation to parse numeric strings from APIs,
* form data, or URL parameters.
*
* **Details**
*
* Decoding coerces the string to a number like `Number(s)`. Encoding coerces
* the number to a string like `String(n)`. This does not validate that the
* result is finite; combine with `Schema.Finite` or `Schema.Int` for stricter
* checks.
*
* **Example** (Converting a string to a number)
*
* ```ts import.meta.vitest
* import { Schema, SchemaTransformation } from "effect"
*
* const schema = Schema.String.pipe(
*   Schema.decodeTo(Schema.Number, SchemaTransformation.numberFromString)
* )
* Schema.decodeSync(schema)("42") // => 42
* ```
*
* @see {@link bigintFromString}
* @see {@link transform}
*
* @category converting
* @since 4.0.0
*/
const numberFromString = /*#__PURE__*/ new Transformation(/*#__PURE__*/ Number$3(), /*#__PURE__*/ String$3());
const isJsonError = (input) => isObject(input) && typeof input["message"] === "string";
const decodeJsonError = (input) => {
	const err = Object.hasOwn(input, "cause") ? new Error(input.message, { cause: decodeDefect(input.cause) }) : new Error(input.message);
	if (typeof input.name === "string" && input.name !== "Error") err.name = input.name;
	if (typeof input.stack === "string") err.stack = input.stack;
	return err;
};
const encodeUnknownAsJson = (input) => {
	try {
		const json = formatJson(input);
		return json === void 0 ? format$1(input) : JSON.parse(json);
	} catch {
		return format$1(input);
	}
};
const encodeJsonError = (input, options, encodeDefect) => {
	const encoded = {
		name: input.name,
		message: typeof input.message === "string" ? input.message : ""
	};
	if (options?.includeStack && typeof input.stack === "string") encoded.stack = input.stack;
	if (!options?.excludeCause && input.cause !== void 0) encoded.cause = encodeDefect(input.cause);
	return encoded;
};
const makeEncodeDefect = (options) => {
	const seen = /* @__PURE__ */ new WeakSet();
	const encode = (input) => {
		if (isError(input)) {
			if (seen.has(input)) return "[Circular]";
			seen.add(input);
			const encoded = encodeJsonError(input, options, encode);
			seen.delete(input);
			return encoded;
		}
		return encodeUnknownAsJson(input);
	};
	return encode;
};
const decodeDefect = (input) => isJsonError(input) ? decodeJsonError(input) : input;
/** @internal */
const defectFromJson = (options) => transform({
	decode: decodeDefect,
	encode: makeEncodeDefect(options)
});
/**
* Decodes a JSON string with `JSON.parse` and encodes a value with
* `JSON.stringify`.
*
* **When to use**
*
* Use when you need a schema transformation to decode JSON stored or
* transmitted as a string, usually before composing with another schema that
* validates the parsed structure.
*
* **Details**
*
* The `reviver` option is passed to `JSON.parse` during decoding. The
* `replacer` and `space` options are passed to `JSON.stringify` during
* encoding. Decode fails with `InvalidValue` for invalid JSON, and encode can
* fail with `InvalidValue` when `JSON.stringify` cannot serialize the value.
*
* **Example** (Parsing JSON)
*
* ```ts import.meta.vitest
* import { Schema, SchemaTransformation } from "effect"
*
* const schema = Schema.String.pipe(
*   Schema.decodeTo(Schema.Unknown, SchemaTransformation.fromJsonString())
* )
* Schema.decodeSync(schema)("{\"ok\":true}") // => { ok: true }
* ```
*
* @see {@link uint8ArrayFromBase64String}
* @see {@link fromFormData}
*
* @category decoding
* @since 4.0.0
*/
function fromJsonString$1(options) {
	return new Transformation(parseJson(options ?? {}), stringifyJson(options));
}
// node_modules/effect/dist/SchemaAST.js
/**
* Represents Effect schemas as runtime trees.
*
* Every `Schema` has an AST made from nodes for declarations, primitives,
* literals, arrays, objects, unions, suspended schemas, checks, annotations,
* encoding links, and parsing context. Most users work with the higher-level
* `Schema` module. Use `SchemaAST` when you need to inspect schema nodes, build
* ASTs programmatically, change encoded or decoded views, collect issues, or
* run low-level schema checks.
*
* @since 4.0.0
*/
function makeGuard(tag) {
	return (ast) => ast._tag === tag;
}
/**
* Narrows an {@link AST} to {@link Declaration}.
*
* **When to use**
*
* Use to recognize declaration AST nodes before running declaration-specific
* handling.
*
* @see {@link Declaration} for the AST node type narrowed by this guard
*
* @category guards
* @since 3.10.0
*/
const isDeclaration = /*#__PURE__*/ makeGuard("Declaration");
/**
* Narrows an {@link AST} to {@link Never}.
*
* **When to use**
*
* Use to detect the AST node for a schema that can never match before handling
* other schema variants.
*
* @see {@link Never} for the AST node type narrowed by this guard
* @see {@link never} for the singleton `Never` AST instance
*
* @category guards
* @since 4.0.0
*/
const isNever = /*#__PURE__*/ makeGuard("Never");
/**
* Narrows an {@link AST} to {@link Literal}.
*
* **When to use**
*
* Use to recognize exact string, number, boolean, or bigint literal AST nodes.
*
* @see {@link Literal} for the AST node type narrowed by this guard
* @see {@link LiteralValue} for the values stored by literal nodes
*
* @category guards
* @since 3.10.0
*/
const isLiteral = /*#__PURE__*/ makeGuard("Literal");
/**
* Narrows an {@link AST} to {@link UniqueSymbol}.
*
* @category guards
* @since 3.10.0
*/
const isUniqueSymbol = /*#__PURE__*/ makeGuard("UniqueSymbol");
/**
* Narrows an {@link AST} to {@link Arrays}.
*
* **When to use**
*
* Use to recognize array-like AST nodes before reading their element, rest, or
* mutability metadata.
*
* @see {@link Arrays} for the AST node type narrowed by this guard
*
* @category guards
* @since 4.0.0
*/
const isArrays = /*#__PURE__*/ makeGuard("Arrays");
/**
* Narrows an {@link AST} to {@link Objects}.
*
* @category guards
* @since 4.0.0
*/
const isObjects = /*#__PURE__*/ makeGuard("Objects");
/**
* Narrows an {@link AST} to {@link Suspend}.
*
* @category guards
* @since 3.10.0
*/
const isSuspend = /*#__PURE__*/ makeGuard("Suspend");
/**
* Constructs a {@link Link}.
*
* @category constructors
* @since 4.0.0
*/
const Link = class {
	to;
	transformation;
	constructor(to, transformation) {
		this.to = to;
		this.transformation = transformation;
	}
};
/** @internal */
const defaultParseOptions = {};
/**
* Constructs a {@link Context}.
*
* @category constructors
* @since 4.0.0
*/
const Context = class {
	isOptional;
	isMutable;
	/** Used for constructor default values (e.g. `withConstructorDefault` API) */
	constructorDefault;
	annotations;
	constructor(isOptional, isMutable, constructorDefault = void 0, annotations = void 0) {
		this.isOptional = isOptional;
		this.isMutable = isMutable;
		this.constructorDefault = constructorDefault;
		this.annotations = annotations;
	}
};
const TypeId$2 = "~effect/Schema";
var ASTNodeImpl = class {
	[TypeId$2] = TypeId$2;
	annotations;
	checks;
	encoding;
	context;
	constructor(annotations = void 0, checks = void 0, encoding = void 0, context = void 0) {
		this.annotations = annotations;
		this.checks = checks;
		this.encoding = encoding;
		this.context = context;
	}
	toString() {
		return `<${this._tag}>`;
	}
};
/**
* Constructs a {@link Declaration}.
*
* @category constructors
* @since 4.0.0
*/
const Declaration = class extends ASTNodeImpl {
	_tag = "Declaration";
	typeParameters;
	run;
	encodingChecks;
	/**
	* Parser factory {@link flip} swaps in, so a declaration can behave
	* differently when encoding. `undefined` reuses `run`.
	*/
	encodingRun;
	constructor(typeParameters, run, annotations, checks, encoding, context, encodingChecks, encodingRun) {
		super(annotations, checks, encoding, context);
		this.typeParameters = typeParameters;
		this.run = run;
		this.encodingChecks = encodingChecks;
		this.encodingRun = encodingRun;
	}
	/** @internal */
	getParser() {
		let run;
		return (input, options) => {
			if (input === missing) return missingExit;
			return (run ??= this.run(this.typeParameters))(input, this, options);
		};
	}
	_rebuild(recur, checks, encodingChecks, run, encodingRun) {
		const tps = mapOrSame(this.typeParameters, recur);
		return tps === this.typeParameters && checks === this.checks && encodingChecks === this.encodingChecks && run === this.run && encodingRun === this.encodingRun ? this : new Declaration(tps, run, this.annotations, checks, void 0, this.context, encodingChecks, encodingRun);
	}
	/** @internal */
	recur(recur) {
		return this._rebuild(recur, this.checks, this.encodingChecks, this.run, this.encodingRun);
	}
	/** @internal */
	flip(recur) {
		return this._rebuild(recur, this.encodingChecks, this.checks, this.encodingRun ?? this.run, this.run);
	}
	/** @internal */
	getExpected() {
		const expected = this.annotations?.expected;
		if (typeof expected === "string") return expected;
		return "<Declaration>";
	}
};
/**
* Constructs a {@link Null}.
*
* @category constructors
* @since 4.0.0
*/
const Null$1 = class extends ASTNodeImpl {
	_tag = "Null";
	/** @internal */
	getParser() {
		return fromConst(this, null);
	}
	/** @internal */
	getExpected() {
		return "null";
	}
};
const null_ = /*#__PURE__*/ new Null$1();
/**
* Constructs a {@link Unknown}.
*
* @category constructors
* @since 4.0.0
*/
const Unknown$1 = class extends ASTNodeImpl {
	_tag = "Unknown";
	/** @internal */
	getParser() {
		return fromRefinement(this, isUnknown);
	}
	/** @internal */
	getExpected() {
		return "unknown";
	}
};
/**
* Provides the singleton {@link Unknown} AST instance.
*
* **When to use**
*
* Use when you need the reusable AST singleton for a schema node that accepts
* every value while keeping parsed values opaque.
*
* @see {@link any} for the singleton that accepts every value as `any`
*
* @category constructors
* @since 4.0.0
*/
const unknown = /*#__PURE__*/ new Unknown$1();
/**
* Constructs a {@link Literal}.
*
* @category constructors
* @since 4.0.0
*/
const Literal$1 = class extends ASTNodeImpl {
	_tag = "Literal";
	literal;
	constructor(literal, annotations, checks, encoding, context) {
		super(annotations, checks, encoding, context);
		if (typeof literal === "number" && !globalThis.Number.isFinite(literal)) throw new Error(`A numeric literal must be finite, got ${format$1(literal)}`);
		this.literal = literal;
	}
	/** @internal */
	getParser() {
		return fromConst(this, this.literal);
	}
	/** @internal */
	matchPart(s, _options) {
		return s === globalThis.String(this.literal) ? this.literal : void 0;
	}
	/** @internal */
	toCodecJson() {
		return typeof this.literal === "bigint" ? literalToString(this) : this;
	}
	/** @internal */
	toCodecStringTree() {
		return typeof this.literal === "string" ? this : literalToString(this);
	}
	/** @internal */
	getExpected() {
		return typeof this.literal === "string" ? JSON.stringify(this.literal) : globalThis.String(this.literal);
	}
};
function literalToString(ast) {
	const literalAsString = globalThis.String(ast.literal);
	return replaceEncoding(ast, [new Link(new Literal$1(literalAsString), new Transformation(transform$1(() => ast.literal), transform$1(() => literalAsString)))]);
}
/**
* Constructs a {@link String}.
*
* @category constructors
* @since 4.0.0
*/
const String$2 = class extends ASTNodeImpl {
	_tag = "String";
	/** @internal */
	getParser() {
		return fromRefinement(this, isString);
	}
	/** @internal */
	matchPart(s, options) {
		const checks = this.checks;
		return checks && !options.disableChecks && collectIssues(checks, s, void 0, this, options) ? void 0 : s;
	}
	/** @internal */
	getExpected() {
		return "string";
	}
};
/**
* Provides the singleton {@link String} AST instance.
*
* **When to use**
*
* Use as the shared `SchemaAST` node for unconstrained JavaScript strings.
*
* @see {@link String} for the AST node class
* @see {@link isString} for narrowing an AST to a string node
*
* @category constructors
* @since 4.0.0
*/
const string = /*#__PURE__*/ new String$2();
/**
* Constructs a {@link Number}.
*
* @category constructors
* @since 4.0.0
*/
const Number$2 = class extends ASTNodeImpl {
	_tag = "Number";
	/** @internal */
	getParser() {
		return fromRefinement(this, isNumber);
	}
	/** @internal */
	matchKey(s, options) {
		return this._match(isStringNumberRegExp, s, options);
	}
	/** @internal */
	matchPart(s, options) {
		return this._match(isStringFiniteRegExp, s, options);
	}
	_match(regexp, s, options) {
		if (!regexp.test(s)) return void 0;
		const value = globalThis.Number(s);
		if (options.disableChecks || !this.checks) return value;
		return collectIssues(this.checks, value, void 0, this, options) ? void 0 : value;
	}
	/** @internal */
	toCodecJson() {
		if (this.checks && (hasCheck(this.checks, "effect/schema/isFinite") || hasCheck(this.checks, "effect/schema/isInt"))) return this;
		return replaceEncoding(this, [numberToJson]);
	}
	/** @internal */
	toCodecStringTree() {
		if (this.toCodecJson() === this) return replaceEncoding(this, [finiteToString]);
		return replaceEncoding(this, [numberToString]);
	}
	/** @internal */
	getExpected() {
		return "number";
	}
};
function hasCheck(checks, id) {
	return checks.some((check) => check.annotations?.representation?.id === id || check._tag === "FilterGroup" && hasCheck(check.checks, id));
}
/**
* Provides the singleton {@link Number} AST instance.
*
* **When to use**
*
* Use when you need the canonical `SchemaAST` node for schemas that accept any
* JavaScript number value.
*
* @see {@link Number} for the AST node class and serialization behavior
* @see {@link Literal} for exact finite numeric literal AST nodes
*
* @category constructors
* @since 4.0.0
*/
const number = /*#__PURE__*/ new Number$2();
/**
* Constructs a {@link Boolean}.
*
* @category constructors
* @since 4.0.0
*/
const Boolean$2 = class extends ASTNodeImpl {
	_tag = "Boolean";
	/** @internal */
	getParser() {
		return fromRefinement(this, isBoolean);
	}
	/** @internal */
	getExpected() {
		return "boolean";
	}
};
/**
* Provides the singleton {@link Boolean} AST instance.
*
* **When to use**
*
* Use to reuse the standard AST node that accepts either `true` or `false` when
* constructing schema ASTs directly.
*
* @see {@link Boolean} for the AST node class
* @see {@link Literal} for exact boolean literal AST nodes
*
* @category constructors
* @since 4.0.0
*/
const boolean = /*#__PURE__*/ new Boolean$2();
/**
* Constructs a {@link Arrays}.
*
* @category constructors
* @since 4.0.0
*/
const Arrays = class extends ASTNodeImpl {
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
		for (let i = 0; i < elements.length; i++) if (isOptional(elements[i])) hasOptional = true;
		else if (hasOptional) throw new Error("A required element cannot follow an optional element. ts(1257)");
		if (hasOptional && rest.length > 1) throw new Error("A required element cannot follow an optional element. ts(1257)");
		for (let i = 1; i < rest.length; i++) if (isOptional(rest[i])) throw new Error("An optional element cannot follow a rest element. ts(1266)");
	}
	/** @internal */
	getParser(compile, compileField = compile) {
		const ast = this;
		let elements;
		let rest;
		const elementLen = ast.elements.length;
		const tailLen = Math.max(0, ast.rest.length - 1);
		function getParser(tailThreshold, index) {
			if (index < elementLen) return elements[index];
			else if (index >= tailThreshold) return rest[index - tailThreshold + 1];
			return rest[0];
		}
		const finish = (state) => {
			const { input, len, options } = state;
			if (ast.rest.length === 0 && len > elementLen) for (let i = elementLen; i < len; i++) {
				const unexpected = new UnexpectedKey(ast, input[i], options);
				const issue = new Pointer([i], unexpected);
				if (options.errors === "all") {
					if (state.issues) state.issues.push(issue);
					else state.issues = [issue];
				} else return fail$1(new Composite(ast, [issue], input, options));
			}
			if (state.issues) return fail$1(new Composite(ast, state.issues, input, options));
			return succeed(state.output);
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
				issues: void 0,
				options
			};
			const end = ast.rest.length === 0 ? elementLen : Math.max(len, elementLen + tailLen);
			const concurrency = options.concurrency === void 0 ? 1 : resolveConcurrency(options.concurrency);
			const eff = concurrency === 1 ? parseArray(state, input, 0, end) : parseArrayConcurrent(state, input, {
				concurrency,
				end
			});
			if (!eff) return finish(state);
			if (effectIsExit(eff)) return flatMapEager(eff, () => finish(state));
			let first = true;
			return suspend(() => {
				if (!first) return parse(input, options);
				first = false;
				return flatMap(eff, () => finish(state));
			});
		};
		return (input, options) => {
			if (input === missing) return missingExit;
			try {
				if (!Array.isArray(input)) return fail$1(new InvalidType(ast, input, options));
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
				return die(error);
			}
		};
	}
	_rebuild(recur, checks, encodingChecks) {
		const elements = mapOrSame(this.elements, recur);
		const rest = mapOrSame(this.rest, recur);
		return elements === this.elements && rest === this.rest && checks === this.checks && encodingChecks === this.encodingChecks ? this : new Arrays(this.isMutable, elements, rest, this.annotations, checks, void 0, this.context, encodingChecks);
	}
	/** @internal */
	recur(recur) {
		return this._rebuild(recur, this.checks, this.encodingChecks);
	}
	/** @internal */
	flip(recur) {
		return this._rebuild(recur, this.encodingChecks, this.checks);
	}
	/** @internal */
	getExpected() {
		return "array";
	}
};
/** @internal */
function stepArray(s, item, exit, i) {
	if (exit._tag === "Failure") return wrapPropertyKeyIssue(s, s.ast, i, exit);
	const value = exit === sameExit ? item : exit[args];
	if (value !== missing) s.output[i] = value;
	else {
		const p = s.getParser(s.tailThreshold, i);
		if (isOptional(p.ast)) return;
		const issue = new Pointer([i], new MissingKey(p.ast.context?.annotations));
		if (s.options.errors === "all") {
			if (s.issues) s.issues.push(issue);
			else s.issues = [issue];
		} else return fail$2(new Composite(s.ast, [issue], s.input, s.options));
	}
}
const parseArrayOptions = {
	onItem(s, item, i) {
		const value = i < s.len ? item : missing;
		return s.getParser(s.tailThreshold, i).parser(value, s.options);
	},
	step: stepArray
};
/** @internal */
const parseArray = /*#__PURE__*/ iterateEager()(parseArrayOptions);
const parseArrayConcurrent = /*#__PURE__*/ iterateConcurrent()(parseArrayOptions);
const wrapPropertyKeyIssue = (s, ast, key, exit) => {
	if (exit.cause.reasons.length === 0) return exit;
	const issue = getSchemaIssue(exit.cause);
	if (issue === void 0) return failCause$1(map$1(exit.cause, (issue) => new Composite(ast, [new Pointer([key], issue)], s.input, s.options)));
	const pointer = new Pointer([key], issue);
	if (s.options.errors === "all") {
		if (s.issues) s.issues.push(pointer);
		else s.issues = [pointer];
	} else return fail$2(new Composite(ast, [pointer], s.input, s.options));
};
/**
* floating point or integer, with optional exponent
* @internal
*/
const FINITE_PATTERN = "[+-]?\\d*\\.?\\d+(?:[Ee][+-]?\\d+)?";
/**
* Returns the object keys that match the index signature parameter schema.
* @internal
*/
function getIndexSignatureKeys(input, parameter, options = defaultParseOptions) {
	let stringKeys;
	let symbolKeys;
	function go(parameter) {
		switch (parameter._tag) {
			case "String":
			case "TemplateLiteral": return (stringKeys ??= Object.keys(input)).filter((k) => parameter.matchPart(k, options) !== void 0);
			case "Number": return (stringKeys ??= Object.keys(input)).filter((k) => parameter.matchKey(k, options) !== void 0);
			case "Symbol": return (symbolKeys ??= Object.getOwnPropertySymbols(input)).filter((k) => Object.prototype.propertyIsEnumerable.call(input, k) && parameter.matchKey(k, options) !== void 0);
			case "Union": return [...new Set(parameter.types.flatMap(go))];
			default: return [];
		}
	}
	return go(parameterFromPropertyKey(toEncoded(parameter)));
}
/**
* Constructs a {@link PropertySignature}.
*
* @category constructors
* @since 4.0.0
*/
const PropertySignature = class {
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
		case "TemplateLiteral": return true;
		case "Union": return ast.types.every(isIndexSignatureParameterSide);
		default: return false;
	}
}
function isIndexSignatureParameterEncodedSide(ast) {
	const encoded = getLastEncoding(ast);
	switch (encoded._tag) {
		case "String":
		case "Number":
		case "Symbol":
		case "TemplateLiteral": return true;
		case "Union": return encoded.types.every(isIndexSignatureParameterEncodedSide);
		default: return false;
	}
}
function isIndexSignatureParameter(ast) {
	return isIndexSignatureParameterSide(ast) && isIndexSignatureParameterEncodedSide(ast);
}
/**
* Constructs a {@link IndexSignature}.
*
* @category constructors
* @since 4.0.0
*/
const IndexSignature = class {
	parameter;
	type;
	constructor(parameter, type) {
		if (!isIndexSignatureParameter(parameter)) throw new Error(`Invalid index signature parameter ${parameter._tag}`);
		this.parameter = parameter;
		this.type = type;
		if (isOptional(type) && !containsUndefined(type)) throw new Error("Cannot use `Schema.optionalKey` with index signatures, use `Schema.optional` instead.");
	}
};
/**
* Constructs a {@link Objects}.
*
* @category constructors
* @since 4.0.0
*/
const Objects = class extends ASTNodeImpl {
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
	/** @internal */
	getParser(compile, compileField = compile) {
		const ast = this;
		const hasProperties = ast.propertySignatures.length;
		const indexCount = ast.indexSignatures.length;
		if (!hasProperties && !indexCount) return fromRefinement(ast, isNotNullish);
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
				})) : void 0;
			}
			return properties;
		};
		const makeFallback = () => {
			const expectedKeys = new Set(ast.propertySignatures.map((ps) => typeof ps.name === "number" ? globalThis.String(ps.name) : ps.name));
			const finishIndex = (s, key, k2, inputValue, exitValue) => {
				if (exitValue._tag === "Failure") return wrapPropertyKeyIssue(s, ast, key, exitValue) ?? void_$1;
				const value = exitValue === sameExit ? inputValue : exitValue[args];
				if (k2 !== missing && value !== missing) {
					if (hasProperties && (expectedKeys.has(key) || expectedKeys.has(typeof k2 === "number" ? globalThis.String(k2) : k2))) return void_$1;
					assignProperty(s.out, k2, value);
				}
				return void_$1;
			};
			const parseIndex = (s, key, index, exitKey) => {
				if (!exitKey) {
					const eff = index.parserKey(key, s.options);
					if (!effectIsExit(eff)) return flatMap(exit(eff), (exit) => parseIndex(s, key, index, exit));
					exitKey = eff;
				}
				if (exitKey._tag === "Failure") return wrapPropertyKeyIssue(s, ast, key, exitKey) ?? void_$1;
				const k2 = exitKey === sameExit ? key : exitKey[args];
				const inputValue = s.input[key];
				const result = index.parserValue(inputValue, s.options);
				return effectIsExit(result) ? finishIndex(s, key, k2, inputValue, result) : flatMap(exit(result), (exit) => finishIndex(s, key, k2, inputValue, exit));
			};
			const parseStringIndex = (s, key, index) => {
				const inputValue = s.input[key];
				const result = index.parserValue(inputValue, s.options);
				return effectIsExit(result) ? finishIndex(s, key, key, inputValue, result) : flatMap(exit(result), (exit) => finishIndex(s, key, key, inputValue, exit));
			};
			const parseIndexes = indexCount ? iterateConcurrent()({
				onItem: (s, [key, index]) => index.is.parameter === string ? parseStringIndex(s, key, index) : parseIndex(s, key, index),
				step: (_s, _item, exit) => exit._tag === "Failure" ? exit : void 0
			}) : void 0;
			return fnUntracedEager(function* (input, options) {
				if (input === missing) return missing;
				if (!(typeof input === "object" && input !== null && !Array.isArray(input))) return yield* fail$1(new InvalidType(ast, input, options));
				compileMembers();
				const record = input;
				const out = {};
				const state = {
					ast,
					input: record,
					out,
					issues: void 0,
					options
				};
				const errorsAllOption = options.errors === "all";
				const onExcessPropertyError = options.onExcessProperty === "error";
				const concurrency = options.concurrency === void 0 ? 1 : resolveConcurrency(options.concurrency);
				const indexKeys = indexCount && onExcessPropertyError ? ast.indexSignatures.map((index) => getIndexSignatureKeys(record, index.parameter, options)) : void 0;
				if (onExcessPropertyError) {
					const coveredKeys = indexKeys ? new Set(expectedKeys) : expectedKeys;
					if (indexKeys) for (const keys of indexKeys) for (const key of keys) coveredKeys.add(key);
					const inputKeys = Reflect.ownKeys(record);
					for (let i = 0; i < inputKeys.length; i++) {
						const key = inputKeys[i];
						if (!coveredKeys.has(key) && Object.prototype.propertyIsEnumerable.call(record, key)) {
							const unexpected = new UnexpectedKey(ast, record[key], options);
							const issue = new Pointer([key], unexpected);
							if (errorsAllOption) {
								if (state.issues) state.issues.push(issue);
								else state.issues = [issue];
								continue;
							} else return yield* fail$1(new Composite(ast, [issue], input, options));
						}
					}
				}
				if (hasProperties) {
					const eff = concurrency === 1 ? parseProperties(state, properties) : parsePropertiesConcurrent(state, properties, { concurrency });
					if (eff) yield* eff;
				}
				if (indexCount && concurrency === 1) for (let i = 0; i < indexCount; i++) {
					const index = indexes[i];
					const parse = index.is.parameter === string ? parseStringIndex : parseIndex;
					const keys = indexKeys?.[i] ?? (index.is.parameter === string ? Object.keys(record) : getIndexSignatureKeys(record, index.is.parameter, options));
					for (let j = 0; j < keys.length; j++) {
						const eff = parse(state, keys[j], index);
						if (!effectIsExit(eff)) yield* eff;
						else if (eff._tag === "Failure") return yield* eff;
					}
				}
				else if (parseIndexes) {
					const keyPairs = empty$2();
					for (let i = 0; i < indexCount; i++) {
						const index = indexes[i];
						const keys = indexKeys?.[i] ?? (index.is.parameter === string ? Object.keys(record) : getIndexSignatureKeys(record, index.is.parameter, options));
						for (let j = 0; j < keys.length; j++) keyPairs.push([keys[j], index]);
					}
					const eff = parseIndexes(state, keyPairs, { concurrency });
					if (eff) yield* eff;
				}
				if (state.issues) return yield* fail$1(new Composite(ast, state.issues, input, options));
				return out;
			});
		};
		if (indexCount) return makeFallback();
		let fallback;
		const resume = (state, index, pending) => {
			const property = properties[index];
			return flatMap(exit(pending), (exit) => {
				const terminal = stepProperty(state, property, exit);
				if (terminal) return terminal;
				const done = () => succeed(state.out);
				const eff = parseProperties(state, properties.slice(index + 1));
				return eff ? flatMapEager(eff, done) : done();
			});
		};
		return (input, options) => {
			if (input === missing) return missingExit;
			if (options.errors === "all" || options.onExcessProperty !== void 0 || options.concurrency !== void 0 && resolveConcurrency(options.concurrency) !== 1) return (fallback ??= makeFallback())(input, options);
			if (!(typeof input === "object" && input !== null && !Array.isArray(input))) return fail$1(new InvalidType(ast, input, options));
			const props = compileMembers();
			const record = input;
			const out = {};
			const state = {
				ast,
				input: record,
				out,
				issues: void 0,
				options
			};
			try {
				for (let index = 0; index < props.length; index++) {
					const property = props[index];
					const name = property.name;
					const hasKey = hasPropertySignature(record, name);
					const value = hasKey ? record[name] : missing;
					const exit = property.parser(value, options);
					if (!effectIsExit(exit)) return resume(state, index, exit);
					if (exit === sameExit) {
						if (hasKey) assignProperty(out, name, value);
						continue;
					}
					const terminal = stepProperty(state, property, exit);
					if (terminal) return terminal;
				}
			} catch (error) {
				return die(error);
			}
			return succeed(out);
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
		return props === this.propertySignatures && indexes === this.indexSignatures && checks === this.checks && encodingChecks === this.encodingChecks ? this : new Objects(props, indexes, this.annotations, checks, void 0, this.context, encodingChecks);
	}
	/** @internal */
	flip(recur) {
		return this._rebuild(recur, recur, this.encodingChecks, this.checks);
	}
	/** @internal */
	recur(recur, recurParameter = recur) {
		return this._rebuild(recur, recurParameter, this.checks, this.encodingChecks);
	}
	/** @internal */
	getExpected() {
		if (this.propertySignatures.length === 0 && this.indexSignatures.length === 0) return "object | array";
		return "object";
	}
};
/** @internal */
function stepProperty(s, p, exit) {
	if (exit._tag === "Failure") return wrapPropertyKeyIssue(s, s.ast, p.name, exit);
	if (exit === sameExit) return;
	const value = exit[args];
	if (value !== missing) {
		assignProperty(s.out, p.name, value);
		return;
	}
	delete s.out[p.name];
	if (!isOptional(p.type)) {
		const issue = new Pointer([p.name], new MissingKey(p.type.context?.annotations));
		if (s.options.errors === "all") {
			if (s.issues) s.issues.push(issue);
			else s.issues = [issue];
			return;
		} else return fail$2(new Composite(s.ast, [issue], s.input, s.options));
	}
}
const parsePropertiesOptions = {
	onItem(s, p) {
		if (!hasPropertySignature(s.input, p.name)) return p.parser(missing, s.options);
		const value = s.input[p.name];
		assignProperty(s.out, p.name, value);
		return p.parser(value, s.options);
	},
	step: stepProperty
};
/** @internal */
const parseProperties = /*#__PURE__*/ iterateEager()(parsePropertiesOptions);
const parsePropertiesConcurrent = /*#__PURE__*/ iterateConcurrent()(parsePropertiesOptions);
function combineChecks(a, b) {
	if (!a) return b;
	if (!b) return a;
	return [...a, ...b];
}
/** @internal */
function struct(fields, checks, annotations) {
	return new Objects(Reflect.ownKeys(fields).map((key) => {
		return new PropertySignature(key, fields[key].ast);
	}), [], annotations, checks);
}
/** @internal */
function getAST(self) {
	return self.ast;
}
/** @internal */
function union(members, options, checks) {
	return new Union$1(members.map(getAST), options, void 0, checks);
}
const toCandidate = /*#__PURE__*/ memoizeIdempotent((ast) => {
	while (true) {
		if (isSuspend(ast)) return unknown;
		const encoding = ast.encoding;
		if (!encoding) return ast.recur?.(toCandidate, identity) ?? ast;
		if (encoding.some((link) => link.transformation._tag === "Middleware" && link.transformation.decode !== identity)) return unknown;
		ast = encoding[encoding.length - 1].to;
	}
});
function getCandidateTypes(ast) {
	switch (ast._tag) {
		case "Null": return ["null"];
		case "Undefined": return ["undefined"];
		case "String":
		case "TemplateLiteral": return ["string"];
		case "Number": return ["number"];
		case "Boolean": return ["boolean"];
		case "Symbol":
		case "UniqueSymbol": return ["symbol"];
		case "BigInt": return ["bigint"];
		case "Arrays": return ["array"];
		case "ObjectKeyword": return [
			"object",
			"array",
			"function"
		];
		case "Objects": return ast.propertySignatures.length || ast.indexSignatures.length ? ["object"] : [
			"string",
			"number",
			"boolean",
			"symbol",
			"bigint",
			"object",
			"array",
			"function"
		];
		case "Enum": return Array.from(new Set(ast.enums.map(([, v]) => typeof v)));
		case "Literal": return [typeof ast.literal];
		case "Union": return Array.from(new Set(ast.types.flatMap(getCandidateTypes)));
		default: return [
			"null",
			"undefined",
			"string",
			"number",
			"boolean",
			"symbol",
			"bigint",
			"object",
			"array",
			"function"
		];
	}
}
/** @internal */
function collectSentinels(ast) {
	switch (ast._tag) {
		default: return [];
		case "Declaration": {
			const s = ast.annotations?.[SENTINELS_ANNOTATION_KEY];
			return Array.isArray(s) ? s : [];
		}
		case "Objects": return ast.propertySignatures.flatMap((ps) => {
			const type = ps.type;
			if (!isOptional(type)) {
				if (isLiteral(type)) return [{
					key: ps.name,
					literal: type.literal
				}];
				if (isUniqueSymbol(type)) return [{
					key: ps.name,
					literal: type.symbol
				}];
			}
			return [];
		});
		case "Arrays": return ast.elements.flatMap((e, i) => {
			if (!isOptional(e)) {
				if (isLiteral(e)) return [{
					key: i,
					literal: e.literal
				}];
				if (isUniqueSymbol(e)) return [{
					key: i,
					literal: e.symbol
				}];
			}
			return [];
		});
		case "Union": {
			if (ast.types.length === 0) return [];
			const members = ast.types.map((type) => collectSentinels(toCandidate(type)));
			return members[0].filter((s) => members.every((sentinels) => sentinels.some((o) => o.key === s.key && o.literal === s.literal)));
		}
		case "Suspend": return collectSentinels(ast.thunk());
	}
}
const candidateIndexCache = /*#__PURE__*/ new WeakMap();
const emptyCandidates = /*#__PURE__*/ Object.freeze([]);
const getRuntimeType = (input) => input === null ? "null" : Array.isArray(input) ? "array" : typeof input;
const hasPropertySignature = (input, key) => key === "__proto__" ? Object.hasOwn(input, key) : key in input;
/** @internal */
function getCandidateIndex(types) {
	let index = candidateIndexCache.get(types);
	if (index) return index;
	let bySentinel;
	let sentinelCandidateCount = 0;
	let otherwise;
	let literalCandidates;
	let onlyLiterals = true;
	const literalOf = [];
	for (let i = 0; i < types.length; i++) {
		const a = types[i];
		const encoded = toCandidate(a);
		if (isNever(encoded)) continue;
		if (isLiteral(encoded) || isUniqueSymbol(encoded)) {
			literalCandidates ??= /* @__PURE__ */ new Map();
			const literal = isLiteral(encoded) ? encoded.literal : encoded.symbol;
			literalOf[i] = literal;
			let arr = literalCandidates.get(literal);
			if (!arr) literalCandidates.set(literal, arr = []);
			arr.push(i);
		} else onlyLiterals = false;
		const sentinels = collectSentinels(encoded);
		if (sentinels.length) {
			bySentinel ??= /* @__PURE__ */ new Map();
			sentinelCandidateCount++;
			for (const { key, literal } of sentinels) {
				let entry = bySentinel.get(key);
				if (!entry) bySentinel.set(key, entry = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Set()]);
				entry[1].add(i);
				let indexes = entry[0].get(literal);
				if (!indexes) entry[0].set(literal, indexes = /* @__PURE__ */ new Set());
				indexes.add(i);
			}
		} else {
			otherwise ??= {};
			const candidateTypes = getCandidateTypes(encoded);
			for (const t of candidateTypes) (otherwise[t] ??= []).push(i);
		}
	}
	const fallbacks = {};
	const getFallback = (type) => fallbacks[type] ??= Object.freeze(otherwise?.[type] ?? emptyCandidates);
	if (onlyLiterals && literalCandidates) {
		literalCandidates.forEach(Object.freeze);
		index = (input) => literalCandidates.get(input) ?? emptyCandidates;
	} else if (bySentinel?.size === 1 && !otherwise) {
		const [key, [byValue]] = bySentinel.entries().next().value;
		const candidates = /* @__PURE__ */ new Map();
		for (const [literal, indexes] of byValue) candidates.set(literal, Object.freeze(Array.from(indexes)));
		const all = Object.freeze(types.map((_, i) => i));
		index = (input, isConstructor) => {
			if (isObjectKeyword(input)) {
				const value = hasPropertySignature(input, key) ? input[key] : void 0;
				if (value !== void 0) return candidates.get(value) ?? emptyCandidates;
				if (isConstructor) return all;
			}
			return emptyCandidates;
		};
	} else if (bySentinel) {
		let commonSentinel;
		for (const entry of bySentinel) if ((!commonSentinel || entry[1][0].size > commonSentinel[1][0].size) && entry[1][1].size === sentinelCandidateCount) commonSentinel = entry;
		index = (input, isConstructor) => {
			const runtimeType = getRuntimeType(input);
			if (!isObjectKeyword(input)) return getFallback(runtimeType);
			const selected = new Set(otherwise?.[runtimeType]);
			let directKey;
			if (commonSentinel) {
				const [key, [byValue]] = commonSentinel;
				const hasKey = hasPropertySignature(input, key);
				const value = hasKey ? input[key] : void 0;
				if (hasKey && (!isConstructor || value !== void 0)) {
					const match = byValue.get(value);
					if (!match) return getFallback(runtimeType);
					for (const i of match) selected.add(i);
					directKey = key;
				}
			}
			if (directKey === void 0) for (const [key, [byValue, all]] of bySentinel) {
				const hasKey = hasPropertySignature(input, key);
				const value = hasKey ? input[key] : void 0;
				if (hasKey && (!isConstructor || value !== void 0)) {
					const match = byValue.get(value);
					if (match) for (const i of match) selected.add(i);
				} else if (isConstructor) for (const i of all) selected.add(i);
			}
			for (const [key, [byValue, all]] of bySentinel) {
				if (key === directKey) continue;
				const hasKey = hasPropertySignature(input, key);
				const value = hasKey ? input[key] : void 0;
				if (hasKey && (!isConstructor || value !== void 0)) {
					const match = byValue.get(value);
					for (const i of selected) if (all.has(i) && !match?.has(i)) selected.delete(i);
				}
			}
			return Array.from(selected).sort((a, b) => a - b);
		};
	} else index = (input) => {
		const fallback = getFallback(getRuntimeType(input));
		return literalCandidates ? fallback.filter((i) => literalOf[i] === void 0 || literalOf[i] === input) : fallback;
	};
	candidateIndexCache.set(types, index);
	return index;
}
/**
* Constructs a {@link Union}.
*
* @category constructors
* @since 4.0.0
*/
const Union$1 = class extends ASTNodeImpl {
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
	/** @internal */
	getParser(compile, compileField) {
		const ast = this;
		const isConstructor = compileField !== void 0;
		const parsers = [];
		const parser = (i) => parsers[i] ??= compile(ast.types[i]);
		let index;
		return (input, options) => {
			if (input === missing) return missingExit;
			const candidates = (index ??= getCandidateIndex(ast.types))(input, isConstructor);
			if (candidates.length === 0) return fail$1(new AnyOf(ast, [], input, options));
			if (candidates.length === 1) {
				const result = parser(candidates[0])(input, options);
				if (result._tag === "Success") return result;
				return effectIsExit(result) ? failSingleUnionCandidate(ast, result.cause, input, options) : catchSingleUnionCandidate(ast, result, input, options);
			}
			return parseUnionCandidates(ast, parser, candidates, input, options);
		};
	}
	_rebuild(recur, checks, encodingChecks) {
		const types = mapOrSame(this.types, recur);
		return types === this.types && checks === this.checks && encodingChecks === this.encodingChecks ? this : new Union$1(types, this.options, this.annotations, checks, void 0, this.context, encodingChecks);
	}
	/** @internal */
	recur(recur) {
		return this._rebuild(recur, this.checks, this.encodingChecks);
	}
	/** @internal */
	flip(recur) {
		return this._rebuild(recur, this.encodingChecks, this.checks);
	}
	/** @internal */
	matchPart(s, options) {
		for (const type of this.types) {
			const out = type.matchPart(s, options);
			if (out !== void 0) return out;
		}
	}
	/** @internal */
	getExpected(getExpected) {
		const expected = this.annotations?.expected;
		if (typeof expected === "string") return expected;
		if (this.types.length === 0) return "never";
		const types = this.types.map((type) => {
			const encoded = toEncoded(type);
			switch (encoded._tag) {
				case "Arrays": {
					const literals = encoded.elements.filter(isLiteral);
					if (literals.length > 0) return `${formatIsMutable(encoded.isMutable)}[ ${literals.map((e) => getExpected(e) + formatIsOptional(e.context?.isOptional)).join(", ")}, ... ]`;
					break;
				}
				case "Objects": {
					const literals = encoded.propertySignatures.filter((ps) => isLiteral(ps.type));
					if (literals.length > 0) return `{ ${literals.map((ps) => `${formatIsMutable(ps.type.context?.isMutable)}${formatPropertyKey(ps.name)}${formatIsOptional(ps.type.context?.isOptional)}: ${getExpected(ps.type)}`).join(", ")}, ... }`;
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
	if (!issue) return failCause$1(cause);
	return fail$2(new AnyOf(ast, [issue], input, options));
}
function catchSingleUnionCandidate(ast, result, input, options) {
	return catchCause(result, (cause) => failSingleUnionCandidate(ast, cause, input, options));
}
function parseUnionCandidates(ast, parser, candidates, input, options) {
	const state = {
		ast,
		parser,
		input,
		out: void 0,
		successes: ast.options?.mode === "oneOf" ? [] : void 0,
		issues: void 0,
		options
	};
	const eff = parseUnion(state, candidates);
	if (!eff) {
		if (state.out) return state.out;
		return fail$1(new AnyOf(ast, state.issues ?? [], input, options));
	}
	return resumeUnion(eff, state);
}
function resumeUnion(eff, state) {
	return flatMapEager(eff, (_) => {
		if (state.out === sameExit) return succeed$1(state.input);
		if (state.out) return state.out;
		return fail$1(new AnyOf(state.ast, state.issues ?? [], state.input, state.options));
	});
}
const parseUnion = /*#__PURE__*/ iterateEager()({
	onItem(s, i) {
		return s.parser(i)(s.input, s.options);
	},
	step(s, i, exit) {
		if (exit._tag === "Failure") {
			const issue = getSchemaIssue(exit.cause);
			if (issue === void 0) return exit;
			if (s.issues) s.issues.push(issue);
			else s.issues = [issue];
		} else {
			if (s.out && s.successes) {
				s.successes.push(s.ast.types[i]);
				return fail$2(new OneOf(s.ast, s.successes, s.input, s.options));
			}
			s.out = exit;
			if (s.successes) s.successes.push(s.ast.types[i]);
			else return void_$1;
		}
	}
});
const nonFiniteLiterals = /*#__PURE__*/ new Union$1([
	/*#__PURE__*/ new Literal$1("Infinity"),
	/*#__PURE__*/ new Literal$1("-Infinity"),
	/*#__PURE__*/ new Literal$1("NaN")
]);
function formatIsMutable(isMutable) {
	return isMutable ? "" : "readonly ";
}
function formatIsOptional(isOptional) {
	return isOptional ? "?" : "";
}
/**
* Constructs a {@link Filter}.
*
* @category constructors
* @since 4.0.0
*/
const Filter = class extends Class$1 {
	_tag = "Filter";
	run;
	annotations;
	/**
	* Whether the parsing process should be aborted after this check has failed.
	*/
	aborted;
	constructor(run, annotations = void 0, aborted = false) {
		super();
		this.run = run;
		this.annotations = annotations;
		this.aborted = aborted;
	}
	annotate(annotations) {
		return new Filter(this.run, {
			...this.annotations,
			...annotations
		}, this.aborted);
	}
	abort() {
		return new Filter(this.run, this.annotations, true);
	}
	and(other, annotations) {
		return new FilterGroup([this, other], annotations);
	}
};
/**
* Constructs a {@link FilterGroup}.
*
* @category constructors
* @since 4.0.0
*/
const FilterGroup = class extends Class$1 {
	_tag = "FilterGroup";
	checks;
	annotations;
	constructor(checks, annotations = void 0) {
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
/** @internal */
function makeFilter$1(filter, annotations, aborted = false) {
	return new Filter((input, ast, options) => normalizeFilterOutput(ast, filter(input, ast, options), input, options), annotations, aborted);
}
/** @internal */
function isFinite(annotations) {
	return makeFilter$1((n) => globalThis.Number.isFinite(n), {
		expected: "a finite number",
		representation: {
			id: "effect/schema/isFinite",
			payload: null
		},
		toJsonSchema: () => ({ type: "number" }),
		toCode: () => ({ runtime: "Schema.isFinite()" }),
		arbitraryConstraint: { number: "finite" },
		...annotations
	});
}
const numberToJson = /*#__PURE__*/ new Link(/*#__PURE__*/ new Union$1([/* @__PURE__ */ appendChecks(number, [/*#__PURE__*/ isFinite()]), nonFiniteLiterals]), /*#__PURE__*/ new Transformation(/*#__PURE__*/ Number$3(), /*#__PURE__*/ transform$1((n) => globalThis.Number.isFinite(n) ? n : globalThis.String(n))));
/**
* Creates a {@link Filter} that validates strings by running `RegExp.test`.
*
* **When to use**
*
* Use when string validation should be represented as a schema `Filter` backed
* by a regular expression.
*
* **Details**
*
* The filter can be used with `Schema.filter` or attached directly to a
* `String` AST node through checks. The regular expression is cloned and its
* `lastIndex` is reset before each test, so global and sticky expressions are
* deterministic and the provided regular expression is not mutated. The
* regular expression source is stored in annotations for serialization and
* arbitrary generation.
*
* **Gotchas**
*
* Arbitrary metadata preserves both `regExp.source` and `regExp.flags`.
* Implementations that cannot consume all flags may still use the source as a
* generation hint because the Schema filter validates every generated value.
* JSON Schema has no way to carry JavaScript regular-expression flags. Unless
* annotations provide `toJsonSchema`, the RegExp constraint is omitted from
* JSON Schema export.
*
* **Example** (Validating an email pattern)
*
* ```ts import.meta.vitest
* import { SchemaAST } from "effect"
*
* const emailFilter = SchemaAST.isPattern(/^[^@]+@[^@]+$/)
* emailFilter.run("alice@example.com", SchemaAST.string, {}) // => undefined
* emailFilter.run("invalid", SchemaAST.string, {})?._tag // => "InvalidValue"
* ```
*
* @see {@link Filter}
* @category constructors
* @since 4.0.0
*/
function isPattern$1(regExp, annotations) {
	const copy = new globalThis.RegExp(regExp);
	const payload = {
		source: copy.source,
		flags: copy.flags
	};
	return makeFilter$1((s) => {
		copy.lastIndex = 0;
		return copy.test(s);
	}, {
		expected: `a string matching the RegExp ${payload.source}`,
		representation: {
			id: "effect/schema/isPattern",
			payload
		},
		toJsonSchema: () => [{}, true],
		arbitraryConstraint: { patterns: [payload] },
		...annotations
	});
}
const bodyOwners = /*#__PURE__*/ new WeakMap();
function copy(ast, changes) {
	const out = Object.assign(Object.create(Object.getPrototypeOf(ast)), ast, changes);
	if (Reflect.ownKeys(changes).every((key) => key === "context" || key === "encoding")) bodyOwners.set(out, getContextOwner(ast));
	return out;
}
/** @internal */
function getContextOwner(ast) {
	const existing = bodyOwners.get(ast);
	if (existing !== void 0) return existing;
	if (ast.encoding === void 0) return ast;
	const owner = Object.assign(Object.create(Object.getPrototypeOf(ast)), ast, { encoding: void 0 });
	bodyOwners.set(ast, owner);
	return owner;
}
/** @internal */
function replaceEncoding(ast, encoding) {
	return ast.encoding === encoding ? ast : copy(ast, { encoding });
}
/** @internal */
function replaceContext(ast, context) {
	if (ast.context === context) return ast;
	const owner = getContextOwner(ast);
	if (owner.context === context && owner.encoding === ast.encoding) return owner;
	return copy(ast, { context });
}
/** @internal */
function getLastEncoding(ast) {
	return ast.encoding ? getLastEncoding(ast.encoding[ast.encoding.length - 1].to) : ast;
}
/** @internal */
function annotate(ast, annotations) {
	if (ast.checks) {
		const last = ast.checks[ast.checks.length - 1];
		return replaceChecks(ast, append(ast.checks.slice(0, -1), last.annotate(annotations)));
	}
	return copy(ast, { annotations: {
		...ast.annotations,
		...annotations
	} });
}
/** @internal */
function replaceChecks(ast, checks) {
	if (ast._tag === "Suspend" && checks) throw new Error("Cannot add checks to Suspend");
	if (ast.checks === checks) return ast;
	return copy(ast, { checks });
}
/** @internal */
function appendChecks(ast, checks) {
	return replaceChecks(ast, combineChecks(ast.checks, checks));
}
/** @internal */
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
/** @internal */
function applyToLastLink(f) {
	return (ast) => ast.encoding ? replaceEncoding(ast, updateLastLink(ast.encoding, f)) : ast;
}
/** @internal */
function replaceContextLastLink(ast, context) {
	return applyToLastLink((ast) => replaceContext(ast, context))(ast);
}
/** @internal */
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
	for (let i = 0; i < as.length; i++) {
		const a = as[i];
		const fa = f(a);
		if (out) out[i] = fa;
		else if (fa !== a) {
			out = new Array(as.length);
			for (let j = 0; j < i; j++) out[j] = as[j];
			out[i] = fa;
		}
	}
	return out ?? as;
}
/** @internal */
function annotateKey(ast, annotations) {
	return replaceContext(ast, ast.context ? new Context(ast.context.isOptional, ast.context.isMutable, ast.context.constructorDefault, {
		...ast.context.annotations,
		...annotations
	}) : new Context(false, false, void 0, annotations));
}
/** @internal */
const optionalKey$1 = /*#__PURE__*/ memoizeIdempotent((ast) => {
	const context = ast.context ? ast.context.isOptional === false ? new Context(true, ast.context.isMutable, ast.context.constructorDefault, ast.context.annotations) : ast.context : new Context(true, false);
	return optionalKeyLastLink(replaceContext(ast, context));
});
const optionalKeyLastLink = /*#__PURE__*/ applyToLastLink(optionalKey$1);
/** @internal */
function withConstructorDefault$1(ast, defaultValue) {
	return replaceContext(ast, ast.context ? new Context(ast.context.isOptional, ast.context.isMutable, defaultValue, ast.context.annotations) : new Context(false, false, defaultValue));
}
/**
* Attaches a `Transformation` to the `to` AST, making it decode from the
* `from` AST and encode back to it.
*
* **Details**
*
* This is the low-level primitive behind `Schema.decodeTo`. It appends a
* {@link Link} to the `to` node's encoding chain.
*
* - Returns a new AST with the same type as `to`.
*
* @see {@link Link}
* @see {@link Encoding}
* @see {@link flip}
* @category transforming
* @since 4.0.0
*/
function decodeTo$1(from, to, transformation) {
	return appendTransformation(from, transformation, to);
}
/**
* Returns `true` if the AST node represents an optional property.
*
* **Details**
*
* Checks `ast.context?.isOptional`. Defaults to `false` when no
* {@link Context} is set.
*
* @see `Schema.optionalKey`
* @see {@link Context}
* @category predicates
* @since 4.0.0
*/
function isOptional(ast) {
	return ast.context?.isOptional ?? false;
}
/** @internal */
function isMutable(ast) {
	return ast.context?.isMutable ?? false;
}
function isStructuralCheck(check) {
	return check.annotations?.["~structural"] === true || check._tag === "FilterGroup" && check.checks.every(isStructuralCheck);
}
function extractStructuralChecks(checks) {
	function extract(check) {
		if (isStructuralCheck(check)) return [check];
		return check._tag === "FilterGroup" ? check.checks.flatMap(extract) : [];
	}
	const out = checks.flatMap(extract);
	return isArrayNonEmpty(out) ? out : void 0;
}
function canPreserveEncodingChecks(ast) {
	let preserve = true;
	function visit(child) {
		preserve = preserve && !child.encoding && !isSuspend(child);
		if (preserve && "recur" in child) child.recur(visit);
		return child;
	}
	if ("recur" in ast) ast.recur(visit);
	return preserve;
}
/**
* Strips all encoding transformations from an AST, returning the decoded
* (type-level) representation.
*
* **Details**
*
* - Memoized: same input reference → same output reference.
* - Recursively walks into composite nodes ({@link Arrays}, {@link Objects},
*   {@link Union}, {@link Suspend}).
*
* **Example** (Getting the type AST)
*
* ```ts import.meta.vitest
* import { Schema, SchemaAST } from "effect"
*
* const schema = Schema.NumberFromString
* const typeAst = SchemaAST.toType(schema.ast)
* typeAst._tag // => "Number"
* ```
*
* @see {@link toEncoded}
* @see {@link flip}
* @category transforming
* @since 4.0.0
*/
const toType$1 = /*#__PURE__*/ memoizeIdempotent((ast) => {
	const owner = getContextOwner(ast);
	if (owner !== ast) {
		const type = toType$1(owner);
		return type === owner && ast.encoding === void 0 ? ast : replaceContext(type, ast.context);
	}
	const type = "recur" in ast ? ast.recur(toType$1) : ast;
	if ("encodingChecks" in type && type.encodingChecks) {
		const checks = canPreserveEncodingChecks(ast) ? type.encodingChecks : isArrays(type) || isObjects(type) || isDeclaration(type) && type.typeParameters.length > 0 ? extractStructuralChecks(type.encodingChecks) : void 0;
		return copy(type, {
			encodingChecks: void 0,
			checks: combineChecks(type.checks, checks)
		});
	}
	return type;
});
/**
* Returns the encoded (wire-format) AST by flipping and then stripping
* encodings.
*
* **Details**
*
* Equivalent to `toType(flip(ast))`. This gives you the AST that describes
* the shape of the serialized/encoded data.
*
* - Memoized: same input reference → same output reference.
*
* **Example** (Getting the encoded AST)
*
* ```ts import.meta.vitest
* import { Schema, SchemaAST } from "effect"
*
* const schema = Schema.NumberFromString
* const encodedAst = SchemaAST.toEncoded(schema.ast)
* encodedAst._tag // => "String"
* ```
*
* @see {@link toType}
* @see {@link flip}
* @category transforming
* @since 4.0.0
*/
const toEncoded = /*#__PURE__*/ memoizeIdempotent((ast) => {
	return toType$1(flip(ast));
});
function flipEncoding(ast, encoding) {
	const links = encoding;
	const len = links.length;
	const last = links[len - 1];
	const ls = [new Link(flip(replaceEncoding(ast, void 0)), links[0].transformation.flip())];
	for (let i = 1; i < len; i++) ls.unshift(new Link(flip(links[i - 1].to), links[i].transformation.flip()));
	const to = flip(last.to);
	if (to.encoding) return replaceEncoding(to, [...to.encoding, ...ls]);
	else return replaceEncoding(to, ls);
}
/**
* Swaps the decode and encode directions of an AST's {@link Encoding} chain.
*
* **Details**
*
* After flipping, what was decoding becomes encoding and vice versa. This is
* the core operation behind `Schema.encode` — encoding a value is decoding
* with a flipped SchemaAST.
*
* - Memoized: same input reference → same output reference.
* - Recursively walks composite nodes.
*
* @see {@link toType}
* @see {@link toEncoded}
* @category transforming
* @since 4.0.0
*/
const flip = /*#__PURE__*/ memoize((ast) => {
	if (ast.encoding) return flipEncoding(ast, ast.encoding);
	const owner = getContextOwner(ast);
	if (owner !== ast) {
		const flipped = flip(owner);
		return flipped === owner ? ast : replaceContext(flipped, ast.context);
	}
	return "flip" in ast ? ast.flip(flip) : "recur" in ast ? ast.recur(flip) : ast;
});
/** @internal */
function containsUndefined(ast) {
	switch (ast._tag) {
		case "Undefined": return true;
		case "Union": return ast.types.some(containsUndefined);
		default: return false;
	}
}
function fromConst(ast, value) {
	const succeed$7 = value === 0 ? sameExit : succeed(value);
	return (input, options) => {
		if (input === missing) return missingExit;
		if (input === value) return succeed$7;
		return fail$1(new InvalidType(ast, input, options));
	};
}
function fromRefinement(ast, refinement) {
	return (input, options) => {
		if (input === missing) return missingExit;
		if (refinement(input)) return sameExit;
		return fail$1(new InvalidType(ast, input, options));
	};
}
/** @internal */
const parameterFromPropertyKey = /*#__PURE__*/ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
	switch (ast._tag) {
		default: return ast;
		case "Number": return ast.toCodecStringTree();
		case "Union": return ast.recur(parameterFromPropertyKey);
	}
});
/** @internal */
const parameterFromString = /*#__PURE__*/ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
	switch (ast._tag) {
		default: return ast;
		case "Symbol":
		case "UniqueSymbol": return ast.toCodecStringTree();
		case "Union": return ast.recur(parameterFromString);
	}
});
/**
* any string, including newlines
* @internal
*/
const STRING_PATTERN = "[\\s\\S]*?";
const isStringFiniteRegExp = /*#__PURE__*/ new globalThis.RegExp(`^${FINITE_PATTERN}$`);
const isStringNumberRegExp = /*#__PURE__*/ new globalThis.RegExp(`^(?:${FINITE_PATTERN}|Infinity|-Infinity|NaN)$`);
/** @internal */
function isStringFinite(annotations) {
	return isPattern$1(isStringFiniteRegExp, {
		expected: "a string representing a finite number",
		representation: {
			id: "effect/schema/isStringFinite",
			payload: null
		},
		toJsonSchema: () => ({ pattern: isStringFiniteRegExp.source }),
		...annotations
	});
}
const finiteString = /*#__PURE__*/ appendChecks(string, [/*#__PURE__*/ isStringFinite()]);
const finiteToString = /*#__PURE__*/ new Link(finiteString, numberFromString);
const numberToString = /*#__PURE__*/ new Link(/*#__PURE__*/ new Union$1([finiteString, nonFiniteLiterals]), numberFromString);
/** @internal */
function collectIssues(checks, value, issues, ast, options) {
	for (let i = 0; i < checks.length; i++) {
		const check = checks[i];
		if (check._tag === "FilterGroup") {
			issues = collectIssues(check.checks, value, issues, ast, options);
			if (issues && (options.errors !== "all" || issues[issues.length - 1].filter.aborted)) return issues;
		} else {
			const issue = check.run(value, ast, options);
			if (issue) {
				const filter = new Filter$1(check, issue, value, options);
				if (issues) issues.push(filter);
				else issues = [filter];
				if (options.errors !== "all" || check.aborted) return issues;
			}
		}
	}
	return issues;
}
/** @internal */
function getConstructorDescriptor(ast) {
	if (!isDeclaration(ast)) return void 0;
	const getDescriptor = ast.annotations?.[CONSTRUCTOR_ANNOTATION_KEY];
	return isFunction(getDescriptor) ? getDescriptor(ast.typeParameters) : void 0;
}
function isJsonLeaf(u) {
	return u === null || typeof u === "string" || typeof u === "boolean" || typeof u === "number" && globalThis.Number.isFinite(u);
}
function isStringTreeLeaf(u) {
	return u === void 0 || typeof u === "string";
}
function isTree(u, isLeaf) {
	const cache = /* @__PURE__ */ new WeakMap();
	const stack = [];
	outer: while (true) {
		if (typeof u !== "object" || u === null) {
			if (!isLeaf(u)) return false;
		} else {
			const value = u;
			const cached = cache.get(value);
			if (cached === false) return false;
			if (cached === void 0) {
				const isArray = Array.isArray(value);
				if (!isArray) {
					const prototype = Object.getPrototypeOf(value);
					if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) return false;
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
/**
* Returns true if the value is a JSON value.
*
* When a cyclic reference is detected, returns false.
*
* @internal
*/
function isJson(u) {
	return isTree(u, isJsonLeaf);
}
/** @internal */
const Json$1 = /*#__PURE__*/ new Declaration([], () => (input, ast, options) => isJson(input) ? sameExit : fail$1(new InvalidType(ast, input, options)), {
	representation: {
		id: "effect/schema/Json",
		payload: null
	},
	expected: "JSON value",
	toCodecJson: () => void 0,
	toCodecStringTree: () => unknownToStringTree
});
/** @internal */
const unknownToJson = /*#__PURE__*/ new Link(Json$1, /*#__PURE__*/ passthrough());
/** @internal */
const objectKeywordToJson = /*#__PURE__*/ new Link(/*#__PURE__*/ new Union$1([/*#__PURE__*/ new Arrays(false, [], [Json$1]), /*#__PURE__*/ new Objects([], [/*#__PURE__*/ new IndexSignature(string, Json$1)])]), /*#__PURE__*/ passthrough());
/**
* Returns true if the value is a StringTree value.
*
* When a cyclic reference is detected, returns false.
*
* @internal
*/
function isStringTree(u) {
	return isTree(u, isStringTreeLeaf);
}
/** @internal */
const unknownToStringTree = /*#__PURE__*/ new Link(/* @__PURE__ */ new Declaration([], () => (input, ast, options) => isStringTree(input) ? sameExit : fail$1(new InvalidType(ast, input, options)), {
	expected: "StringTree",
	toCodecStringTree: () => void 0
}), /*#__PURE__*/ passthrough());
// node_modules/effect/dist/internal/schema/interpreter.js
const flatMapTransformation = (result, current, f) => result === sameExit ? f(current) : flatMapEager(result, f);
function compileTransformation(transformation) {
	if (transformation._tag === "Middleware") return (result, current, options) => {
		const transformed = result === sameExit ? transformation.decode(succeed(toOption(current)), options) : transformation.decode(mapEager(result, toOption), options);
		return fromOptionalEffect(transformed);
	};
	const getter = transformation.decode;
	switch (getter._tag) {
		case "Passthrough": return (result, current) => result === sameExit ? succeed(current) : result;
		case "Transform": {
			const transform = (value) => value === missing ? missingExit : succeed(getter.transform(value));
			return (result, current) => flatMapTransformation(result, current, transform);
		}
		case "TransformOptional": {
			const transform = (value) => fromOptionExit(getter.transform(toOption(value)));
			return (result, current) => flatMapTransformation(result, current, transform);
		}
		case "TransformEffect": return (result, current, options) => flatMapTransformation(result, current, (value) => value === missing ? missingExit : getter.transform(value, options));
		case "TransformOptionalEffect": return (result, current, options) => flatMapTransformation(result, current, (value) => fromOptionalEffect(getter.transform(toOption(value), options)));
	}
}
const fromOptionalEffect = (effect) => flatMapEager(effect, fromOptionExit);
/** @internal */
const wrapEncoding = (ast, input, options, effect) => catchCause(effect, (cause) => failCauseSync(() => map$1(cause, (issue) => new Encoding(ast, issue, input, options))));
function makeConstructorParser(descriptor, compile) {
	const transform = compileTransformation(descriptor.link.transformation);
	let sourceParser;
	return (input, options) => {
		if (input === missing) return missingExit;
		if (descriptor.isConstructed(input)) return sameExit;
		const result = (sourceParser ??= compile(descriptor.link.to))(input, options);
		return transform(result, input, options);
	};
}
function withDefault(ast, parser) {
	const defaultValue = ast.context.constructorDefault;
	return (input, options) => {
		if (input !== missing && input !== void 0) return parser(input, options);
		const result = defaultValue;
		if (effectIsExit(result) && result._tag === "Success") {
			const local = parser(result[args], options);
			return local === sameExit ? result : local;
		}
		return flatMapEager(wrapEncoding(ast, input, options, result), (value) => {
			const local = parser(value, options);
			return local === sameExit ? succeed(value) : local;
		});
	};
}
/** @internal */
function compileField(ast, compile) {
	const parser = compile(ast);
	return ast.context?.constructorDefault === void 0 ? parser : withDefault(ast, parser);
}
/** @internal */
function compile(ast, compile, compileField, base, specialize) {
	if (ast._tag === "Declaration") for (const parameter of ast.typeParameters) compile(parameter);
	const descriptor = compileField ? getConstructorDescriptor(ast) : void 0;
	const parser = descriptor ? makeConstructorParser(descriptor, compile) : base ?? ast.getParser(compile, compileField);
	const checks = ast.checks;
	const links = ast.encoding;
	const transformations = links?.map((link) => compileTransformation(link.transformation));
	const encodingChecks = ast.encodingChecks;
	if (!links && !checks && !encodingChecks) return parser;
	let encodingParsers;
	const parseChecks = (input, options) => {
		let result = parser(input, options);
		if (encodingChecks && !options.disableChecks) {
			if (effectIsExit(result)) {
				if (result._tag === "Success") {
					const output = result === sameExit ? input : result[args];
					if (input !== missing && output !== missing) {
						const issues = collectIssues(encodingChecks, input, void 0, ast, options);
						if (issues) result = fail$1(new Composite(ast, issues, input, options));
					}
				}
			} else result = flatMap(result, (value) => {
				if (input !== missing && value !== missing) {
					const issues = collectIssues(encodingChecks, input, void 0, ast, options);
					if (issues) return fail$1(new Composite(ast, issues, input, options));
				}
				return succeed$1(value);
			});
		}
		if (checks && !options.disableChecks) {
			if (effectIsExit(result)) {
				if (result._tag === "Success") {
					const value = result === sameExit ? input : result[args];
					if (value === missing) return result;
					const issues = collectIssues(checks, value, void 0, ast, options);
					if (issues) result = fail$1(new Composite(ast, issues, value, options));
				}
			} else result = flatMap(result, (value) => {
				if (value !== missing) {
					const issues = collectIssues(checks, value, void 0, ast, options);
					if (issues) return fail$1(new Composite(ast, issues, value, options));
				}
				return succeed$1(value);
			});
		}
		return result;
	};
	const parseLocal = specialize === void 0 ? parseChecks : specialize(parseChecks);
	if (!links) return parseLocal;
	return (input, options) => {
		const parsers = encodingParsers ??= links.map((link) => compile(link.to));
		let current = input;
		let result = parsers[parsers.length - 1](input, options);
		for (let i = links.length - 1; i >= 0; i--) {
			result = transformations[i](result, current, options);
			if (i !== 0) {
				const next = parsers[i - 1];
				if (result._tag === "Success") {
					current = result[args];
					result = next(current, options);
				} else result = flatMapEager(result, (value) => {
					const nextResult = next(value, options);
					return nextResult === sameExit ? succeed(value) : nextResult;
				});
			}
		}
		if (result._tag === "Success") {
			const value = result[args];
			const local = parseLocal(value, options);
			return local === sameExit ? result : local;
		}
		result = wrapEncoding(ast, input, options, result);
		return flatMapEager(result, (value) => {
			const local = parseLocal(value, options);
			return local === sameExit ? succeed(value) : local;
		});
	};
}
// node_modules/effect/dist/internal/schema/compilerRegistry.js
/** @internal */
const invalid = /*#__PURE__*/ Symbol();
const cache = /*#__PURE__*/ new WeakMap();
const decodeChild = (ast) => resolve$1(ast).parser;
const makeChild = (ast) => resolve$1(ast).makeEffect;
const makeField = (ast) => compileField(ast, makeChild);
var InterpretedEntry = class {
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
};
/** @internal */
function resolve$1(ast) {
	const cached = cache.get(ast);
	if (cached !== void 0) return cached;
	const entry = new InterpretedEntry(ast);
	cache.set(ast, entry);
	return entry;
}
// node_modules/effect/dist/SchemaParser.js
/**
* Runs schemas against real values.
*
* Schema parsers construct values from schema input, check whether a value
* matches a schema, decode encoded input, and encode decoded values back to
* their external form. This module exposes those operations through several
* result styles, including `Effect`, `Promise`, `Exit`, `Option`, `Result`, and
* synchronous functions that throw. It also contains the lower-level runner that
* walks a schema AST and reports schema failures as `SchemaIssue.Issue` values.
*
* @since 4.0.0
*/
/**
* Creates an effectful maker for the schema's decoded type side.
*
* **When to use**
*
* Use to construct decoded schema values in `Effect` while preserving
* construction failures as `SchemaIssue.Issue` values in the error channel.
*
* **Details**
*
* The returned function accepts constructor input, applies constructor defaults,
* runs type-side validation unless checks are disabled, and fails with a
* `SchemaIssue.Issue` when construction fails.
*
* @category constructors
* @since 4.0.0
*/
function makeEffect(schema) {
	const ast = schema.ast;
	let parser;
	return (input, options) => {
		return (parser ??= runWithCompiler(constructorCompiler, toType$1(ast)))(input, options?.disableChecks ? options?.parseOptions ? {
			...options.parseOptions,
			disableChecks: true
		} : { disableChecks: true } : options?.parseOptions);
	};
}
/**
* Creates a synchronous maker that returns `Option.some` with the constructed
* value on success, or `Option.none` when construction fails with schema issues.
*
* **When to use**
*
* Use when you need to validate schema constructor input and only care whether
* construction succeeds, without exposing `SchemaIssue.Issue` details.
*
* **Gotchas**
*
* Only causes made entirely of schema issues are converted to `Option.none`.
* Causes that contain defects, interruptions, or asynchronous work at this
* synchronous boundary throw an `Error` whose cause is the underlying `Cause`.
*
* @category constructors
* @since 4.0.0
*/
function makeOption(schema) {
	const parser = makeEffect(schema);
	return (input, options) => {
		const exit = runSyncExit(parser(input, options));
		if (isSuccess(exit)) return some(exit.value);
		getSchemaIssueOrThrow(exit.cause, "Option adapter can only return none for schema issues");
		return none();
	};
}
/**
* Creates a synchronous maker for the schema's decoded type side.
*
* **When to use**
*
* Use to construct decoded schema values synchronously when invalid input
* should throw an `Error` whose cause is `SchemaIssue.Issue`.
*
* **Details**
*
* The returned function constructs a value from constructor input and throws an
* `Error` with the `SchemaIssue.Issue` in its `cause` when construction fails.
* Schema validation failures use the generic message `"Schema validation failed"`.
* Format the `cause` explicitly with `SchemaIssue.makeFormatterDefault()` when
* human-readable details are needed.
*
* **Gotchas**
*
* Causes that contain defects, interruptions, or asynchronous work at this
* synchronous boundary throw an `Error` whose cause is the underlying `Cause`,
* instead of being converted to a schema validation error.
*
* @category constructors
* @since 4.0.0
*/
function make$5(schema) {
	return makeConstructorSync(toType$1(schema.ast));
}
/**
* Creates an effectful decoder for `unknown` input.
*
* **When to use**
*
* Use when you need to decode untyped boundary input in an `Effect` whose
* failure channel is `SchemaIssue.Issue`, while preserving transformations
* and service requirements.
*
* **Details**
*
* The returned function succeeds with the schema's decoded `Type` or fails with a
* `SchemaIssue.Issue`. Decoding service requirements are preserved in the returned
* `Effect`. Parse options may be provided when creating the decoder and overridden
* when applying it.
*
* @see {@link decodeEffect} for input already typed as the schema's `Encoded` type
*
* @category decoding
* @since 4.0.0
*/
function decodeUnknownEffect$1(schema, options) {
	const parser = run(schema.ast);
	return options === void 0 ? parser : (input, overrideOptions) => parser(input, mergeParseOptions(options, overrideOptions));
}
/** @internal */
function decodeUnknownOption$1(schema, options) {
	return asOption(decodeUnknownEffect$1(schema, options));
}
const mergeParseOptions = (options, overrideOptions) => overrideOptions ? {
	...options,
	...overrideOptions
} : options;
const getValue = (value) => {
	if (value === missing) return fail$1(new InvalidValue());
	return succeed$1(value);
};
/** @internal */
function run(ast) {
	return runWithCompiler(normalCompiler, ast);
}
function parserResult(result, input) {
	if (result === sameExit) return succeed$1(input);
	if (!effectIsExit(result)) return flatMapEager(result, getValue);
	return result["~effect/Effect/args"] === missing ? getValue(missing) : result;
}
function runWithCompiler(compiler, ast) {
	let parser;
	return (input, options) => {
		const result = (parser ??= compiler(ast))(input, options ?? defaultParseOptions);
		if (result === sameExit) return succeed$1(input);
		if (!effectIsExit(result)) return flatMapEager(result, getValue);
		return result["~effect/Effect/args"] === missing ? getValue(missing) : result;
	};
}
function asExit(parser) {
	return (input, options) => runSyncExit(parser(input, options));
}
/** @internal */
function asOption(parser) {
	const parserExit = asExit(parser);
	return (input, options) => {
		const exit = parserExit(input, options);
		if (isSuccess(exit)) return some(exit.value);
		getSchemaIssueOrThrow(exit.cause, "Option adapter can only return none for schema issues");
		return none();
	};
}
function runSync(effect, message) {
	const exit = runSyncExit(effect);
	if (isSuccess(exit)) return exit.value;
	const issue = getSchemaIssueOrThrow(exit.cause, message);
	throw new Error("Schema validation failed", { cause: issue });
}
function makeConstructorSync(ast) {
	let entry;
	let parser;
	return (input, options) => {
		entry ??= resolve$1(ast);
		const parseOptions = options?.disableChecks ? options.parseOptions ? {
			...options.parseOptions,
			disableChecks: true
		} : { disableChecks: true } : options?.parseOptions ?? defaultParseOptions;
		const make = entry.make;
		if (make !== void 0 && input !== missing) {
			let output;
			try {
				output = make(input, parseOptions);
			} catch (error) {
				getSchemaIssueOrThrow(die$1(error), "Constructor adapter can only throw schema issues");
				throw error;
			}
			if (output !== invalid && output !== missing) return output;
		}
		return runSync(parserResult((parser ??= entry.makeEffect)(input, parseOptions), input), "Constructor adapter can only throw schema issues");
	};
}
const normalCompiler = (ast) => resolve$1(ast).parser;
const constructorCompiler = (ast) => resolve$1(ast).makeEffect;
// node_modules/effect/dist/internal/schema/make.js
/** @internal */
const TypeId$1 = "~effect/Schema/Schema";
const RebuildOptions = /*#__PURE__*/ Symbol();
const SchemaProto = {
	[TypeId$1]: TypeId$1,
	get make() {
		const value = make$5(this);
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
		return make$4(ast, this[RebuildOptions]);
	}
};
/** @internal */
function make$4(ast, options) {
	function Schema() {}
	const self = Object.setPrototypeOf(Schema, SchemaProto);
	if (options && (Object.hasOwn(options, "name") || Object.hasOwn(options, "length") || Object.hasOwn(options, "__proto__"))) Object.defineProperties(self, Object.getOwnPropertyDescriptors({ ...options }));
	else Object.assign(self, options);
	self[RebuildOptions] = options;
	self.ast = ast;
	return self;
}
// node_modules/effect/dist/JsonPointer.js
/**
* Helpers for escaping JSON Pointer path segments and converting JSON Pointer
* URI fragments. JSON Pointer uses `/` to separate path tokens inside a JSON
* document, so token text must encode literal `~` and `/` characters. URI
* fragments additionally apply percent-encoding after JSON Pointer escaping.
*
* @since 4.0.0
*/
/**
* Escapes a JSON Pointer reference token according to RFC 6901 by encoding special characters so the token can be safely used as a segment in a JSON Pointer.
*
* **When to use**
*
* Use when you need to escape a single JSON Pointer path segment.
*
* **Details**
*
* - Returns a new escaped string
* - Replaces `~` (tilde) with `~0` and `/` (forward slash) with `~1`
* - Returns the input unchanged if it contains no special characters
* - Empty strings are valid and returned unchanged
*
* **Gotchas**
*
* The replacement order matters: `~` is replaced before `/` to prevent double-escaping.
*
* **Example** (Escaping special characters)
*
* ```ts import.meta.vitest
* import { JsonPointer } from "effect"
*
* JsonPointer.escapeToken("a/b") // => "a~1b"
* JsonPointer.escapeToken("c~d") // => "c~0d"
* JsonPointer.escapeToken("path/to~key") // => "path~1to~0key"
* ```
*
* @see {@link unescapeToken} The inverse operation for decoding escaped tokens
* @category encoding
* @since 4.0.0
*/
function escapeToken(token) {
	return token.replace(/~/g, "~0").replace(/\//g, "~1");
}
/**
* Decodes a JSON Pointer reference token according to RFC 6901 escaping rules.
*
* **When to use**
*
* Use when you need to decode a single escaped JSON Pointer path segment.
*
* **Details**
*
* - Returns a new unescaped string
* - Replaces `~1` with `/` (forward slash) and `~0` with `~` (tilde)
* - Returns the input unchanged if it contains no escaped sequences
* - Empty strings are valid and returned unchanged
*
* **Gotchas**
*
* The replacement order matters: `~1` is replaced before `~0` to prevent incorrect decoding.
*
* **Example** (Unescaping special characters)
*
* ```ts import.meta.vitest
* import { JsonPointer } from "effect"
*
* JsonPointer.unescapeToken("a~1b") // => "a/b"
* JsonPointer.unescapeToken("c~0d") // => "c~d"
* JsonPointer.unescapeToken("path~1to~0key") // => "path/to~key"
* ```
*
* @see {@link escapeToken} The inverse operation for encoding tokens
* @category decoding
* @since 4.0.0
*/
function unescapeToken(token) {
	return token.replace(/~1/g, "/").replace(/~0/g, "~");
}
/** @internal */
function formatUriFragmentToken(token) {
	return encodeURI(escapeToken(token)).replace(/#/g, "%23");
}
/** @internal */
function decodeUriFragment(fragment) {
	if (fragment.length === 0 || fragment === "#") return "";
	if (!fragment.startsWith("#")) return void 0;
	const encoded = fragment.slice(1);
	try {
		if (encodeURI(encoded).replace(/%25/g, "%").replace(/#/g, "%23") !== encoded) return void 0;
		const pointer = decodeURIComponent(encoded);
		return pointer.startsWith("/") && !/~(?:[^01]|$)/.test(pointer) ? pointer : void 0;
	} catch {
		return;
	}
}
/**
* Parses a JSON Pointer URI fragment into decoded path tokens.
*
* **When to use**
*
* Use when you need to resolve a URI fragment against a JSON document.
*
* **Details**
*
* Percent-encoding is decoded before the pointer is split into tokens, then
* each token is decoded with {@link unescapeToken}. The empty string and `#`
* both represent the document root.
*
* **Gotchas**
*
* Returns `undefined` when the input is not a URI fragment, contains characters
* that require percent-encoding, or contains an invalid JSON Pointer escape
* sequence.
*
* **Example** (Parsing URI fragments)
*
* ```ts import.meta.vitest
* import { JsonPointer } from "effect"
*
* JsonPointer.parseUriFragment("#/users/a~1b") // => ["users", "a/b"]
* JsonPointer.parseUriFragment("#/caf%C3%A9") // => ["café"]
* JsonPointer.parseUriFragment("#/%") // => undefined
* JsonPointer.parseUriFragment("#/a#b") // => undefined
* ```
*
* @see {@link formatUriFragment} for the inverse operation
* @category decoding
* @since 4.0.0
*/
function parseUriFragment(fragment) {
	const pointer = decodeUriFragment(fragment);
	return pointer === void 0 ? void 0 : pointer.length === 0 ? [] : pointer.slice(1).split("/").map(unescapeToken);
}
// node_modules/effect/dist/JsonSchema.js
/**
* Helpers for normalizing and converting JSON Schema and OpenAPI schema
* documents. Supported inputs include JSON Schema Draft-07, Draft 2020-12,
* OpenAPI 3.0, and OpenAPI 3.1; conversions normalize through
* `Document<"draft-2020-12">` before emitting another dialect, including
* JSON Schema Draft-04. The module also defines document types, meta-schema
* constants, and OpenAPI component-key helpers.
*
* @since 4.0.0
*/
function transformSchema(node, transform) {
	return walk(node, false, true);
	function walk(node, inheritedResource, isRoot = false) {
		if (!isObject(node)) return node;
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
				case "contentSchema": transformed = walk(value, inEmbeddedResource);
			}
			assignProperty(out, key, transformed);
		}
		transform(out, inEmbeddedResource);
		return out;
	}
}
/** @internal */
function rewriteRefs(schema, rewrite) {
	return transformSchema(schema, (schema) => {
		rewriteSchemaRef(schema, rewrite);
	});
}
function rewriteSchemaRef(schema, rewrite) {
	if (typeof schema.$ref === "string") assignProperty(schema, "$ref", rewrite(schema.$ref, "$ref"));
	if (typeof schema.$dynamicRef === "string") assignProperty(schema, "$dynamicRef", rewrite(schema.$dynamicRef, "$dynamicRef"));
}
function mapObject(value, f) {
	if (!isObject(value)) return void 0;
	const out = {};
	for (const key of Object.keys(value)) assignProperty(out, key, f(value[key], key));
	return out;
}
function createsResource(id) {
	return typeof id === "string" && id.length > 0 && id[0] !== "#";
}
const PRE_2020_TO_2020_COLLISIONS = [
	"$anchor",
	"$defs",
	"$dynamicAnchor",
	"$dynamicRef",
	"$vocabulary",
	"contentSchema",
	"dependentRequired",
	"dependentSchemas",
	"maxContains",
	"minContains",
	"prefixItems",
	"unevaluatedItems",
	"unevaluatedProperties"
];
[...PRE_2020_TO_2020_COLLISIONS];
[...PRE_2020_TO_2020_COLLISIONS];
// node_modules/effect/dist/internal/schema/toCodec.js
/** @internal */
const toCodecJsonAST = /*#__PURE__*/ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
	const out = toCodecJsonASTStep(ast, toCodecJsonAST);
	const context = ast.context;
	if (out === ast || context === void 0) return out;
	return replaceContextLastLink(out, withoutConstructorDefault(context));
});
function withoutConstructorDefault(context) {
	return context.constructorDefault === void 0 ? context : new Context(context.isOptional, context.isMutable, void 0, context.annotations);
}
function validateCanonicalObjectPropertyNames(ast) {
	if (ast.propertySignatures.some((ps) => typeof ps.name !== "string")) throw new globalThis.Error("Objects property names must be strings", { cause: ast });
}
function makeReorder(getPriority) {
	return (types) => {
		const sortedTypes = [...types].sort((a, b) => getPriority(toEncoded(a)) - getPriority(toEncoded(b)));
		if (!sortedTypes.some((ast, index) => ast !== types[index])) return types;
		return sortedTypes;
	};
}
const toCodecJsonReorder = /*#__PURE__*/ makeReorder((ast) => {
	switch (ast._tag) {
		case "BigInt":
		case "Symbol":
		case "UniqueSymbol": return 0;
		default: return 1;
	}
});
function toCodecJsonASTStep(ast, recur) {
	switch (ast._tag) {
		case "Declaration": {
			const getLink = ast.annotations?.toCodecJson ?? ast.annotations?.toCodec;
			if (!isFunction(getLink)) return replaceEncoding(ast, [unknownToJson]);
			const link = getLink(ast.typeParameters.map((tp) => make$4(toEncoded(tp))));
			return link === void 0 ? ast : replaceEncoding(ast, [mapLink(link, recur)]);
		}
		case "Unknown": return replaceEncoding(ast, [unknownToJson]);
		case "ObjectKeyword": return replaceEncoding(ast, [objectKeywordToJson]);
		case "Undefined":
		case "Void":
		case "Literal":
		case "Number": return ast.toCodecJson();
		case "UniqueSymbol":
		case "Symbol":
		case "BigInt": return ast.toCodecStringTree();
		case "Objects":
			validateCanonicalObjectPropertyNames(ast);
			return ast.recur(recur, parameterFromString);
		case "Union": {
			const sortedTypes = toCodecJsonReorder(ast.types);
			if (sortedTypes !== ast.types) return new Union$1(sortedTypes, ast.options, ast.annotations, ast.checks, ast.encoding, ast.context, ast.encodingChecks).recur(recur);
			return ast.recur(recur);
		}
		case "Arrays":
		case "Suspend": return ast.recur(recur);
	}
	return ast;
}
globalThis.RegExp;
/**
* Escapes special characters in a regular expression pattern.
*
* **When to use**
*
* Use to turn literal text into a safe regular expression pattern fragment.
*
* **Example** (Escaping a pattern string)
*
* ```ts import.meta.vitest
* import { RegExp } from "effect"
*
* RegExp.escape("a*b") // => "a\\*b"
* ```
*
* @category transforming
* @since 2.0.0
*/
const escape = (string) => string.replace(/[/\\^$*+?.()|[\]{}]/g, "\\$&");
// node_modules/effect/dist/internal/errors.js
/** @internal */
function errorWithPath(message, path) {
	if (path.length > 0) message += `\n  at ${formatPath(path)}`;
	return new Error(message);
}
// node_modules/effect/dist/internal/schema/toJsonSchemaDocument.js
function formatDefinitionReference(key) {
	return `#/$defs/${formatUriFragmentToken(key)}`;
}
const jsonSchemaAnnotationExcludedKeys = /*#__PURE__*/ new Set([
	...annotationExcludedKeys,
	IDENTIFIER_FALLBACK_KEY,
	...jsonSchemaAnnotationKeys
]);
function collectJsonSchemaAnnotations(annotations, options) {
	if (annotations === void 0) return void 0;
	const out = {};
	const title = annotations.title;
	if (typeof title === "string") out.title = title;
	const description = annotations.description;
	const expected = annotations.expected;
	if (typeof description === "string") out.description = description;
	else if (options?.generateDescriptions === true && typeof expected === "string") out.description = expected;
	const defaultValue = annotations.default;
	if (isJson(defaultValue)) out.default = defaultValue;
	const examples = annotations.examples;
	if (Array.isArray(examples) && isJson(examples)) out.examples = examples;
	const readOnly = annotations.readOnly;
	if (typeof readOnly === "boolean") out.readOnly = readOnly;
	const writeOnly = annotations.writeOnly;
	if (typeof writeOnly === "boolean") out.writeOnly = writeOnly;
	const format = annotations.format;
	if (typeof format === "string") out.format = format;
	const contentEncoding = annotations.contentEncoding;
	if (typeof contentEncoding === "string") out.contentEncoding = contentEncoding;
	const contentMediaType = annotations.contentMediaType;
	if (typeof contentMediaType === "string") out.contentMediaType = contentMediaType;
	const contentSchema = annotations.contentSchema;
	if (isJson(contentSchema)) out.contentSchema = contentSchema;
	if (options?.includeAnnotationKey !== void 0) for (const [key, value] of Object.entries(annotations)) {
		if (jsonSchemaAnnotationExcludedKeys.has(key) || !options.includeAnnotationKey(key)) continue;
		if (isJson(value)) assignProperty(out, key, value);
	}
	return Object.keys(out).length === 0 ? void 0 : out;
}
function extractJsonSchemaNumberType(schema) {
	let type = schema.type === "number" || schema.type === "integer" ? schema.type : void 0;
	let out = schema;
	if (type !== void 0) {
		out = { ...schema };
		delete out.type;
	}
	if (Array.isArray(out.allOf)) {
		const members = [];
		let changed = false;
		for (const member of out.allOf) {
			const extracted = extractJsonSchemaNumberType(member);
			if (extracted.type !== void 0) {
				changed = true;
				if (type === void 0 || extracted.type === "integer") type = extracted.type;
			}
			if (Object.keys(extracted.schema).length > 0) members.push(extracted.schema);
		}
		if (changed) {
			const { allOf: _, ...rest } = out;
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
	if (!Array.isArray(schema.anyOf) || schema.anyOf.length !== 2 || schema.anyOf[0]?.type !== "number") return false;
	const special = schema.anyOf[1];
	return special?.type === "string" && Array.isArray(special.enum) && special.enum.length === 3 && special.enum.includes("NaN") && special.enum.includes("Infinity") && special.enum.includes("-Infinity");
}
const inlineableCheckKeywords = "|type|format|pattern|multipleOf|minimum|maximum|exclusiveMinimum|exclusiveMaximum|minLength|maxLength|minItems|maxItems|uniqueItems|minProperties|maxProperties|propertyNames|";
function hasOnlyKeywords(schema, allowed) {
	return Object.keys(schema).every((key) => allowed.includes(`|${key}|`));
}
function hasNoCollisions(left, rightKeys) {
	return typeof left.$ref !== "string" && rightKeys.every((key) => !Object.hasOwn(left, key));
}
const promotableAnnotationKeywords = "|title|description|default|examples|readOnly|writeOnly|";
const inlineableAnnotatedCheckKeywords = inlineableCheckKeywords + promotableAnnotationKeywords;
function appendJsonSchema(left, right, inlineCheck) {
	if (Object.keys(left).length === 0) return right;
	const rightKeys = Object.keys(right);
	if (rightKeys.length === 0) return left;
	const leftType = left.type === "number" || left.type === "integer" ? left.type : void 0;
	const isNumberEncoding = isJsonSchemaNumberEncoding(left);
	if (leftType !== void 0 || isNumberEncoding) {
		const extracted = extractJsonSchemaNumberType(right);
		if (extracted.type !== void 0) {
			const type = leftType === "integer" || extracted.type === "integer" ? "integer" : "number";
			const base = {
				...left,
				type
			};
			if (isNumberEncoding) delete base.anyOf;
			const extractedKeys = Object.keys(extracted.schema);
			if (extractedKeys.length === 0) return base;
			return hasOnlyKeywords(extracted.schema, promotableAnnotationKeywords) && hasNoCollisions(base, extractedKeys) ? {
				...base,
				...extracted.schema
			} : appendJsonSchema(base, extracted.schema, inlineCheck);
		}
	}
	if (inlineCheck && hasNoCollisions(left, rightKeys)) return {
		...left,
		...right
	};
	const members = Array.isArray(right.allOf) && rightKeys.length === 1 ? right.allOf : [right];
	if (Array.isArray(left.allOf)) return {
		...left,
		allOf: [...left.allOf, ...members]
	};
	if (typeof left.$ref === "string") return { allOf: [left, ...members] };
	return {
		...left,
		allOf: members
	};
}
function isExact(exactness, seen = /* @__PURE__ */ new Set()) {
	if (typeof exactness === "boolean") return exactness;
	if (seen.has(exactness)) return true;
	seen.add(exactness);
	return exactness.every((dependency) => isExact(dependency, seen));
}
function isApproximateCheckOutput(output) {
	return Array.isArray(output);
}
function compileJsonSchema(representations, rootPaths, references, options) {
	const compiledDefinitions = /* @__PURE__ */ new Map();
	const definitionAliases = /* @__PURE__ */ new Map();
	const compiledRepresentations = /* @__PURE__ */ new WeakMap();
	const pendingOneOf = /* @__PURE__ */ new Map();
	const fallbackDefinitions = /* @__PURE__ */ new Map();
	const referenceKeys = Object.keys(references);
	for (const key of referenceKeys) compileDefinition(key, ["references", key]);
	const compiledSchemas = map$3(representations, (representation, index) => recur(representation, rootPaths[index], []));
	for (const [branches, schemas] of pendingOneOf.values()) if (!isExact(branches)) {
		for (const schema of schemas) if (Array.isArray(schema.oneOf)) {
			schema.anyOf = schema.oneOf;
			delete schema.oneOf;
		}
	}
	for (const key of referenceKeys) {
		const representation = references[key];
		const fallback = getIdentifierFallback(representation);
		if (fallback === void 0) continue;
		const schema = compiledDefinitions.get(key)[0];
		const candidates = fallbackDefinitions.get(fallback);
		const match = candidates?.find((candidate) => equals$1(compiledDefinitions.get(candidate)[0], schema));
		if (match === void 0) {
			if (candidates === void 0) fallbackDefinitions.set(fallback, [key]);
			else candidates.push(key);
		} else definitionAliases.set(key, match);
	}
	const schemas = map$3(compiledSchemas, finalizeJsonSchema);
	const definitions = {};
	for (const key of referenceKeys) if (!definitionAliases.has(key)) assignProperty(definitions, key, finalizeJsonSchema(compiledDefinitions.get(key)[0]));
	return {
		dialect: "draft-2020-12",
		schemas,
		definitions
	};
	function registerPendingOneOf(schema) {
		if (Array.isArray(schema.oneOf)) pendingOneOf.get(schema.oneOf)?.[1].push(schema);
		return schema;
	}
	function compileDefinition(key, path) {
		if (!Object.hasOwn(references, key)) throw errorWithPath(`Invalid reference ${key}`, [...path, "$ref"]);
		const cached = compiledDefinitions.get(key);
		if (cached !== void 0) return cached;
		const result = [{}, []];
		compiledDefinitions.set(key, result);
		result[0] = recur(references[key], ["references", key], result[1]);
		return result;
	}
	function finalizeJsonSchema(schema) {
		return rewriteRefs(schema, ($ref) => {
			const pointer = decodeUriFragment($ref);
			if (pointer === void 0) {
				if (/^#(?:\/|%2f)/i.test($ref)) throw new Error(`Invalid JSON Pointer URI fragment ${JSON.stringify($ref)}`);
				return $ref;
			}
			if (!pointer.startsWith("/$defs/")) return $ref;
			const separator = pointer.indexOf("/", 7);
			const canonical = definitionAliases.get(unescapeToken(pointer.slice(7, separator < 0 ? void 0 : separator)));
			if (canonical === void 0) return $ref;
			return $ref.replace(/^#(?:\/|%2f).*?(?:\/|%2f).*?(?=\/|%2f|$)/i, formatDefinitionReference(canonical));
		});
	}
	function getIdentifierFallback(representation) {
		if (representation._tag === "Reference") return void 0;
		const annotations = representation.checks.length === 0 ? representation.annotations : representation.checks[representation.checks.length - 1].annotations;
		return typeof annotations?.identifier !== "string" && typeof annotations?.["~identifier"] === "string" ? annotations[IDENTIFIER_FALLBACK_KEY] : void 0;
	}
	function compileCheck(check, type, path, dependencies) {
		const annotations = check.annotations;
		const callback = annotations?.toJsonSchema;
		if (callback !== void 0) {
			const result = callback({
				type,
				schemas: check.representation?.schemas?.map((schema, index) => recur(schema, [
					...path,
					"representation",
					"schemas",
					index
				], dependencies)) ?? []
			});
			const approximate = isApproximateCheckOutput(result);
			if (approximate) dependencies.push(false);
			const fragment = approximate ? result[0] : result;
			const ordinary = collectJsonSchemaAnnotations(annotations, options);
			const schema = ordinary === void 0 ? fragment : {
				...fragment,
				...ordinary
			};
			const allowed = ordinary === void 0 ? inlineableCheckKeywords : inlineableAnnotatedCheckKeywords;
			return [schema, check._tag === "Filter" && hasOnlyKeywords(schema, allowed) && (ordinary === void 0 || hasOnlyKeywords(ordinary, promotableAnnotationKeywords)) ? true : void 0];
		}
		if (check._tag === "Filter") {
			dependencies.push(false);
			return;
		}
		const schemas = check.checks.flatMap((child, index) => {
			const result = compileCheck(child, type, [
				...path,
				"checks",
				index
			], dependencies);
			return result === void 0 ? [] : [result[0]];
		});
		if (schemas.length === 0) return void 0;
		const ordinary = collectJsonSchemaAnnotations(annotations, options);
		const schema = { allOf: schemas };
		return [ordinary === void 0 ? schema : {
			...schema,
			...ordinary
		}];
	}
	function recur(representation, path, dependencies) {
		if (representation._tag === "Reference") {
			dependencies.push(compileDefinition(representation.$ref, path)[1]);
			return { $ref: formatDefinitionReference(representation.$ref) };
		}
		const cached = compiledRepresentations.get(representation);
		if (cached !== void 0) {
			dependencies.push(cached[1]);
			return cached[0];
		}
		const local = [];
		dependencies.push(local);
		let output = on(representation, path, local);
		const ordinary = collectJsonSchemaAnnotations(representation.annotations, options);
		if (ordinary !== void 0) output = {
			...output,
			...ordinary
		};
		for (let index = 0; index < representation.checks.length; index++) {
			const type = typeof output.type === "string" && isJsonSchemaType(output.type) ? output.type : void 0;
			const check = compileCheck(representation.checks[index], type, [
				...path,
				"checks",
				index
			], local);
			if (check !== void 0) output = appendJsonSchema(output, ...check);
		}
		compiledRepresentations.set(representation, [output, local]);
		return registerPendingOneOf(output);
	}
	function on(representation, path, dependencies) {
		switch (representation._tag) {
			case "Any":
			case "Unknown": return {};
			case "ObjectKeyword": return { anyOf: [{ type: "object" }, { type: "array" }] };
			case "Void":
			case "Undefined":
			case "Null": return { type: "null" };
			case "BigInt": return {
				type: "string",
				allOf: [{ pattern: "^-?\\d+$" }]
			};
			case "Symbol": return {
				type: "string",
				allOf: [{ pattern: "^Symbol\\(([\\s\\S]*)\\)$" }]
			};
			case "UniqueSymbol": return globalThis.Symbol.keyFor(representation.symbol) === void 0 ? { not: {} } : {
				type: "string",
				enum: [globalThis.String(representation.symbol)]
			};
			case "Declaration":
				dependencies.push(false);
				return {};
			case "Suspend": return recur(representation.thunk, [...path, "thunk"], dependencies);
			case "Never": return { not: {} };
			case "String": return { type: "string" };
			case "Number": return { anyOf: [{ type: "number" }, {
				type: "string",
				enum: [
					"NaN",
					"Infinity",
					"-Infinity"
				]
			}] };
			case "Boolean": return { type: "boolean" };
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
					if (typeof literal === "number" && !globalThis.Number.isFinite(literal)) throw errorWithPath(`Invalid numeric enum value ${globalThis.String(literal)}`, [
						...path,
						"enums",
						index,
						1
					]);
					return {
						type: typeof literal,
						enum: [literal],
						title
					};
				});
				return types.length === 0 ? { not: {} } : { anyOf: types };
			}
			case "TemplateLiteral": return {
				type: "string",
				pattern: `^${representation.parts.map(getPartPattern).join("")}$`
			};
			case "Arrays": {
				if (representation.rest.length > 1) throw errorWithPath("Invalid schema representation document", [...path, "rest"]);
				const out = { type: "array" };
				let minItems = representation.elements.length;
				const prefixItems = representation.elements.map((element, index) => {
					if (element.isOptional) minItems--;
					const schema = recur(element.type, [
						...path,
						"elements",
						index,
						"type"
					], dependencies);
					const annotations = collectJsonSchemaAnnotations(element.annotations, options);
					return annotations === void 0 ? schema : registerPendingOneOf(appendJsonSchema(schema, annotations));
				});
				if (prefixItems.length > 0) {
					out.prefixItems = prefixItems;
					out.maxItems = representation.elements.length;
					if (minItems > 0) out.minItems = minItems;
				} else out.items = false;
				if (representation.rest.length === 1) {
					delete out.maxItems;
					const rest = recur(representation.rest[0], [
						...path,
						"rest",
						0
					], dependencies);
					if (Object.keys(rest).length > 0) out.items = rest;
					else delete out.items;
				}
				return out;
			}
			case "Objects": {
				if (representation.propertySignatures.length === 0 && representation.indexSignatures.length === 0) return { not: { type: "null" } };
				const out = { type: "object" };
				const properties = {};
				const required = [];
				for (let index = 0; index < representation.propertySignatures.length; index++) {
					const property = representation.propertySignatures[index];
					if (typeof property.name !== "string") throw errorWithPath("Invalid schema representation document", [
						...path,
						"propertySignatures",
						index,
						"name"
					]);
					const name = property.name;
					const schema = recur(property.type, [
						...path,
						"propertySignatures",
						index,
						"type"
					], dependencies);
					const annotations = collectJsonSchemaAnnotations(property.annotations, options);
					assignProperty(properties, name, annotations === void 0 ? schema : registerPendingOneOf(appendJsonSchema(schema, annotations)));
					if (!property.isOptional) required.push(name);
				}
				if (representation.propertySignatures.length > 0) out.properties = properties;
				if (required.length > 0) out.required = required;
				const patternProperties = {};
				const additionalPropertySchemas = [];
				const indexValueSchemas = [];
				let hasUnrepresentableIndexPattern = false;
				for (let index = 0; index < representation.indexSignatures.length; index++) {
					const signature = representation.indexSignatures[index];
					let type = recur(signature.type, [
						...path,
						"indexSignatures",
						index,
						"type"
					], dependencies);
					if (equals$1(type, { not: {} })) type = false;
					indexValueSchemas.push(type);
					const patterns = getParameterPatterns(signature.parameter, [
						...path,
						"indexSignatures",
						index,
						"parameter"
					], /* @__PURE__ */ new Set());
					if (patterns === void 0) {
						hasUnrepresentableIndexPattern = true;
						dependencies.push(false);
						continue;
					}
					if (patterns.length === 0) additionalPropertySchemas.push(type);
					else for (const pattern of patterns) {
						const previous = patternProperties[pattern];
						assignProperty(patternProperties, pattern, previous === void 0 ? type : previous === false || type === false ? false : registerPendingOneOf(appendJsonSchema(previous, type)));
					}
				}
				const hasPatternProperties = Object.keys(patternProperties).length > 0;
				if (hasPatternProperties) out.patternProperties = patternProperties;
				if (hasUnrepresentableIndexPattern && options?.onExcessProperty === "error") {
					const propertyNames = [];
					if (representation.propertySignatures.length > 0) propertyNames.push({ enum: Object.keys(properties) });
					for (let index = 0; index < representation.indexSignatures.length; index++) propertyNames.push(recur(representation.indexSignatures[index].parameter, [
						...path,
						"indexSignatures",
						index,
						"parameter"
					], dependencies));
					out.propertyNames = propertyNames.length === 1 ? propertyNames[0] : { anyOf: propertyNames };
					out.additionalProperties = indexValueSchemas.length === 1 ? indexValueSchemas[0] : { anyOf: indexValueSchemas };
					if (additionalPropertySchemas.length > 0) out.allOf = additionalPropertySchemas.map((type) => ({
						type: "object",
						additionalProperties: type
					}));
				} else if (additionalPropertySchemas.length === 0) out.additionalProperties = hasUnrepresentableIndexPattern || options?.onExcessProperty !== "error";
				else if (additionalPropertySchemas.length === 1 && representation.propertySignatures.length === 0 && !hasPatternProperties) out.additionalProperties = additionalPropertySchemas[0];
				else if (additionalPropertySchemas.length > 0) out.allOf = additionalPropertySchemas.map((type) => ({
					type: "object",
					additionalProperties: type
				}));
				if (typeof out.additionalProperties === "object" && out.additionalProperties !== null && Object.keys(out.additionalProperties).length === 0) delete out.additionalProperties;
				return out;
			}
			case "Union": {
				const branches = [];
				const types = representation.types.map((type, index) => recur(type, [
					...path,
					"types",
					index
				], branches));
				dependencies.push(branches);
				if (types.length === 0) return { not: {} };
				const mode = representation.options?.mode ?? "anyOf";
				if (mode === "anyOf" && types.length > 1) {
					const compacted = compactEnums(types);
					if (compacted !== void 0) return compacted;
				}
				if (mode === "oneOf") pendingOneOf.set(types, [branches, []]);
				return { [mode]: types };
			}
		}
	}
	function getParameterPatterns(parameter, path, seenReferences) {
		switch (parameter._tag) {
			case "Reference": {
				if (!Object.hasOwn(references, parameter.$ref)) throw errorWithPath(`Invalid reference ${parameter.$ref}`, [...path, "$ref"]);
				compileDefinition(parameter.$ref, path);
				if (seenReferences.has(parameter.$ref)) return void 0;
				const next = new Set(seenReferences).add(parameter.$ref);
				return getParameterPatterns(references[parameter.$ref], ["references", parameter.$ref], next);
			}
			case "String": {
				if (parameter.checks.length === 0) return [];
				if (parameter.checks.length !== 1 || parameter.checks[0]._tag !== "Filter" || parameter.checks[0].annotations?.toJsonSchema === void 0) return;
				const dependencies = [];
				const schema = recur(parameter, path, dependencies);
				if (!isExact(dependencies)) return void 0;
				return schema.type === "string" && typeof schema.pattern === "string" && hasOnlyKeywords(schema, "|type|pattern|title|description|default|examples|readOnly|writeOnly|") ? [schema.pattern] : void 0;
			}
			case "TemplateLiteral": return parameter.checks.length === 0 ? [`^${parameter.parts.map(getPartPattern).join("")}$`] : void 0;
			case "Union": {
				if (parameter.types.length === 0 || parameter.checks.length > 0 || parameter.options?.mode === "oneOf") return;
				const patterns = [];
				for (let index = 0; index < parameter.types.length; index++) {
					const memberPatterns = getParameterPatterns(parameter.types[index], [
						...path,
						"types",
						index
					], seenReferences);
					if (memberPatterns === void 0) return void 0;
					if (memberPatterns.length === 0) return [];
					patterns.push(...memberPatterns);
				}
				return patterns;
			}
			default: throw errorWithPath("Invalid schema representation document", path);
		}
	}
}
function isJsonSchemaType(input) {
	return input === "string" || input === "number" || input === "boolean" || input === "array" || input === "object" || input === "null" || input === "integer";
}
function compactEnums(schemas) {
	let sharedType = void 0;
	const values = [];
	for (const schema of schemas) {
		if (Object.keys(schema).length !== 2 || schema.type === void 0 || !Array.isArray(schema.enum) || schema.enum.length === 0) return;
		if (sharedType === void 0) sharedType = schema.type;
		else if (schema.type !== sharedType) return void 0;
		for (const value of schema.enum) {
			if (values.includes(value)) return void 0;
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
		case "Literal": return escape(globalThis.String(part.literal));
		case "String": return STRING_PATTERN;
		case "Number": return FINITE_PATTERN;
		case "TemplateLiteral": return part.parts.map(getPartPattern).join("");
		case "Union": return `(?:${part.types.map(getPartPattern).join("|")})`;
		default: throw errorWithPath("Invalid schema representation document", []);
	}
}
/** @internal */
function toJsonSchemaDocument$1(document, options) {
	const output = compileJsonSchema([document.representation], [["representation"]], document.references, options);
	return {
		dialect: output.dialect,
		schema: output.schemas[0],
		definitions: output.definitions
	};
}
// node_modules/effect/dist/internal/schema/toRepresentation.js
const defaultReferencePolicy = ({ identifier }) => identifier;
function annotationsField(annotations) {
	return annotations === void 0 ? void 0 : { annotations };
}
/** @internal */
function toRepresentation(ast, options) {
	const { references, representations } = toRepresentations([ast], options);
	return {
		representation: representations[0],
		references
	};
}
/** @internal */
function toRepresentations(asts, options) {
	const references = {};
	const referenceOwners = /* @__PURE__ */ new Map();
	const buildingReferences = /* @__PURE__ */ new Set();
	const candidates = /* @__PURE__ */ new Map();
	const visitingCandidates = /* @__PURE__ */ new Set();
	for (const ast of asts) visit(ast);
	const referencePolicy = options?.referencePolicy ?? defaultReferencePolicy;
	for (const candidatesByIdentifier of candidates.values()) for (const candidate of candidatesByIdentifier.values()) {
		const requestedReference = referencePolicy({
			ast: candidate.ast,
			occurrences: candidate.occurrences,
			identifier: candidate.identifier
		});
		if (requestedReference !== void 0) candidate.reference = getReference(requestedReference, candidate, requestedReference === candidate.identifier || !requestedReference.endsWith("_") ? "_" : "");
		else if (candidate.isRecursive) candidate.reference = getReference(`${candidate.ast._tag}_`, candidate, "");
	}
	return {
		representations: map$3(asts, (ast) => recur(ast)),
		references
	};
	function getReference(prefix, owner, separator = "_") {
		let candidate = prefix;
		let suffix = 0;
		while (referenceOwners.has(candidate)) {
			if (referenceOwners.get(candidate) === owner) return candidate;
			candidate = `${prefix}${separator}${++suffix}`;
		}
		referenceOwners.set(candidate, owner);
		return candidate;
	}
	function annotateReference(ast, candidate, reference) {
		const fallback = candidate.fallback;
		if (fallback !== void 0) return resolveIdentifierFallback(ast) === fallback ? ast : annotate(ast, { [IDENTIFIER_FALLBACK_KEY]: fallback });
		return reference === candidate.identifier ? ast : annotate(ast, { identifier: reference });
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
		const fallback = identifier === void 0 ? (ast !== input ? resolveIdentifier(input) : void 0) ?? resolveIdentifierFallback(ast) : void 0;
		if (fallback !== void 0) identifier = `${fallback}Encoded`;
		let candidatesByIdentifier = candidates.get(owner);
		if (candidatesByIdentifier === void 0) {
			candidatesByIdentifier = /* @__PURE__ */ new Map();
			candidates.set(owner, candidatesByIdentifier);
		}
		let candidate = candidatesByIdentifier.get(identifier);
		if (candidate === void 0) {
			candidate = {
				ast: owner,
				identifier,
				fallback,
				occurrences: 0,
				isRecursive: false,
				reference: void 0
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
		if (candidate.occurrences > 1) return;
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
			case "Suspend": visit(ast.thunk());
		}
		visitingCandidates.delete(candidate);
	}
	function visitChecks(checks) {
		checks?.forEach((check) => {
			check.annotations?.representation?.schemas?.forEach((schema) => visit(toType$1(schema)));
			if (check._tag === "FilterGroup") visitChecks(check.checks);
		});
	}
	function recur(input) {
		const candidate = getCandidate(input);
		const ast = candidate.ast;
		const reference = candidate.reference;
		if (reference !== void 0) return makeReference(reference, candidate.identifier === void 0 ? ast : annotateReference(ast, candidate, reference));
		return on(ast);
	}
	function on(ast) {
		const checks = fromChecks(ast.checks);
		switch (ast._tag) {
			case "Declaration": return {
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
			case "ObjectKeyword": return {
				_tag: ast._tag,
				checks,
				...annotationsField(ast.annotations)
			};
			case "Literal": return {
				_tag: "Literal",
				literal: ast.literal,
				checks,
				...annotationsField(ast.annotations)
			};
			case "UniqueSymbol": return {
				_tag: "UniqueSymbol",
				symbol: ast.symbol,
				checks,
				...annotationsField(ast.annotations)
			};
			case "Enum": return {
				_tag: "Enum",
				enums: ast.enums,
				checks,
				...annotationsField(ast.annotations)
			};
			case "TemplateLiteral": return {
				_tag: "TemplateLiteral",
				parts: ast.parts.map((ast) => recur(ast)),
				checks,
				...annotationsField(ast.annotations)
			};
			case "Arrays": return {
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
			case "Objects": return {
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
			case "Union": return {
				_tag: "Union",
				types: ast.types.map((ast) => recur(ast)),
				...ast.options === void 0 ? {} : { options: ast.options },
				checks,
				...annotationsField(ast.annotations)
			};
			case "Suspend": return {
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
			case "Filter": return {
				_tag: "Filter",
				aborted: check.aborted,
				...fromCheckAnnotations(check.annotations)
			};
			case "FilterGroup": return {
				_tag: "FilterGroup",
				checks: map$3(check.checks, fromCheck),
				...fromCheckAnnotations(check.annotations)
			};
		}
	}
	function fromDeclarationAnnotations(annotations) {
		if (annotations === void 0) return void 0;
		const { representation, ...ordinary } = annotations;
		return {
			...representation === void 0 ? void 0 : { representation },
			...Object.keys(ordinary).length === 0 ? void 0 : { annotations: ordinary }
		};
	}
	function fromCheckAnnotations(annotations) {
		if (annotations === void 0) return void 0;
		const { representation, ...ordinary } = annotations;
		const projected = representation === void 0 ? void 0 : representation.schemas === void 0 ? representation : {
			...representation,
			schemas: representation.schemas.map((schema) => recur(toType$1(schema)))
		};
		return {
			...projected === void 0 ? void 0 : { representation: projected },
			...Object.keys(ordinary).length === 0 ? void 0 : { annotations: ordinary }
		};
	}
}
// node_modules/effect/dist/Struct.js
/**
* Wraps a plain function as a {@link Lambda} value so it can be used with
* {@link map}, {@link mapPick}, and {@link mapOmit}.
*
* **When to use**
*
* Use to create a typed lambda for struct mapping APIs that need type-level
* input and output tracking.
*
* **Details**
*
* The type parameter `L` encodes both the input and output types at the type
* level, allowing the compiler to track how struct value types change. At
* runtime, the returned value is the same function; `lambda` only adjusts the
* type.
*
* **Example** (Wrapping values in arrays)
*
* ```ts import.meta.vitest
* import { pipe, Struct } from "effect"
*
* interface AsArray extends Struct.Lambda {
*   <A>(self: A): Array<A>
*   readonly "~lambda.out": Array<this["~lambda.in"]>
* }
*
* const asArray = Struct.lambda<AsArray>((a) => [a])
* const result = pipe({ x: 1, y: "hello" }, Struct.map(asArray))
* result // => { x: [1], y: ["hello"] }
* ```
*
* @see {@link Lambda} – the type-level interface
* @see {@link map} – apply a lambda to all struct values
* @category constructors
* @since 4.0.0
*/
const lambda = (f) => f;
// node_modules/effect/dist/internal/schemaError.js
const SchemaErrorTypeId = "~effect/Schema/SchemaError";
function isSchemaError$1(u) {
	return hasProperty(u, "~effect/Schema/SchemaError") && u["~effect/Schema/SchemaError"] === "~effect/Schema/SchemaError";
}
// node_modules/effect/dist/Schema.js
const TypeId = TypeId$1;
/**
* Error thrown or returned when schema decoding or encoding fails.
*
* **Details**
*
* The `issue` field contains a structured {@link SchemaIssue.Issue} tree describing
* every validation failure, including the path to the problematic value and
* the expected type or constraint. The `message` field renders the issue tree
* with the default formatter.
*
* **Gotchas**
*
* Parsing with `reportInput: true` adds an enumerable `input` field to
* value-bearing issues. Built-in messages may include reported input, and
* custom annotations or messages are not sanitized.
*
* **Example** (Inspecting a SchemaError)
*
* ```ts import.meta.vitest
* import { Result, Schema } from "effect"
*
* const result = Schema.decodeUnknownResult(Schema.Number)("not a number")
* const message = Result.isFailure(result) ? result.failure.message : ""
* message // => "Expected number"
* ```
*
* @see {@link isSchemaError} for narrowing unknown values
* @category errors
* @since 4.0.0
*/
var SchemaError = class extends (/*#__PURE__*/ TaggedError$1("SchemaError")) {
	[SchemaErrorTypeId] = SchemaErrorTypeId;
	constructor(issue) {
		const stackTraceLimit = getStackTraceLimit();
		setStackTraceLimit(0);
		try {
			super({ issue });
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
};
/**
* Returns `true` if `u` is a {@link SchemaError}.
*
* **When to use**
*
* Use when you need to narrow an unknown value to `SchemaError`.
*
* **Example** (Narrowing Schema errors)
*
* ```ts import.meta.vitest
* import { Result, Schema } from "effect"
*
* const result = Result.try(() => Schema.decodeUnknownSync(Schema.Number)("oops"))
* const error: unknown = Result.isFailure(result) ? result.failure : undefined
* Schema.isSchemaError(error) // => true
* ```
*
* @category guards
* @since 4.0.0
*/
function isSchemaError(u) {
	return isSchemaError$1(u);
}
function fromIssueEffect(self) {
	if (effectIsExit(self)) return fromIssueExit(self);
	return catchCause(self, (cause) => failCauseSync(() => map$1(cause, (issue) => new SchemaError(issue))));
}
function fromIssueExit(exit) {
	return isSuccess(exit) ? exit : failCause$1(map$1(exit.cause, (issue) => new SchemaError(issue)));
}
function getSchemaErrorOrThrow(cause, message) {
	let schemaError;
	for (const reason of cause.reasons) {
		if (!isFailReason(reason) || !isSchemaError(reason.error)) throw new globalThis.Error(message, { cause });
		schemaError ??= reason.error;
	}
	if (schemaError === void 0) throw new globalThis.Error(message, { cause });
	return schemaError;
}
function runSchemaErrorSync(self) {
	const exit = runSyncExit(self);
	if (isSuccess(exit)) return exit.value;
	throw getSchemaErrorOrThrow(exit.cause, "Sync adapter can only throw schema errors");
}
/**
* Decodes an `unknown` input against a schema, returning an `Effect` that
* succeeds with the decoded value or fails with a {@link SchemaError}.
*
* **When to use**
*
* Use when you need to decode unknown input in an `Effect` whose failure
* channel is `SchemaError`.
*
* **Details**
*
* Prefer {@link decodeEffect} when the input is already typed as the schema's
* `Encoded` type.
* Options may be provided either when creating the decoder or when applying it;
* application options override creation options.
*
* @see {@link SchemaParser.decodeUnknownEffect} for the adapter that fails with `SchemaIssue.Issue` directly
*
* @category decoding
* @since 4.0.0
*/
function decodeUnknownEffect(schema, options) {
	const parser = decodeUnknownEffect$1(schema, options);
	return (input, options) => {
		return fromIssueEffect(parser(input, options));
	};
}
/**
* Decodes an `unknown` input against a schema, returning an `Option` that is
* `Some` with the decoded value on success or `None` for schema mismatches.
*
* **When to use**
*
* Use when you do not know the input type statically and only need to know
* whether decoding succeeded.
*
* **Details**
*
* Prefer this over {@link decodeUnknownExit} or {@link decodeUnknownEffect}
* when you don't need error details. For input already typed as the schema's
* `Encoded` type use {@link decodeOption}.
* Options may be provided either when creating the decoder or when applying it;
* application options override creation options.
*
* **Gotchas**
*
* Only causes made entirely of schema issues are converted to `None`. Causes
* that contain defects, interruptions, or other non-schema reasons throw
* instead.
*
* @category decoding
* @since 3.10.0
*/
const decodeUnknownOption = decodeUnknownOption$1;
/**
* Decodes an `unknown` input against a schema synchronously, returning the
* decoded value or throwing a {@link SchemaError} for schema mismatches.
*
* **When to use**
*
* Use when you need to validate unknown data at a synchronous boundary and want
* schema mismatches to throw `SchemaError`.
*
* **Details**
*
* For input already typed as the schema's `Encoded` type use `decodeSync`.
* Only service-free schemas can be decoded synchronously. For alternatives that
* do not throw on schema mismatches, see `decodeUnknownOption`,
* `decodeUnknownExit`, or `decodeUnknownEffect`. Options may be provided either
* when creating the decoder or when applying it; application options override
* creation options.
*
* **Gotchas**
*
* Non-schema failures may throw a runtime failure instead of `SchemaError`.
*
* **Example** (Decoding with a transformation schema)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const NumberFromString = Schema.NumberFromString
*
* Schema.decodeUnknownSync(NumberFromString)("42") // => 42
* ```
*
* @see {@link SchemaParser.decodeUnknownSync} for the adapter that throws an `Error` whose cause is `SchemaIssue.Issue`
*
* @category decoding
* @since 4.0.0
*/
function decodeUnknownSync(schema, options) {
	const parser = decodeUnknownEffect(schema, options);
	return (input, options) => {
		return runSchemaErrorSync(parser(input, options));
	};
}
/**
* Creates a schema from an AST (Abstract Syntax Tree) node.
*
* **Details**
*
* This is the fundamental constructor for all schemas in the Effect Schema
* library. It takes an AST node and wraps it in a fully-typed schema that
* preserves all type information and provides the complete schema API.
*
* The `make` function is used internally to create all primitive schemas like
* `String`, `Number`, `Boolean`, etc., as well as more complex schemas. It's
* the bridge between the untyped AST representation and the strongly-typed
* schema.
*
* @category constructors
* @since 3.10.0
*/
const make$3 = make$4;
/**
* Checks whether a value is a `Schema`.
*
* @category guards
* @since 3.10.0
*/
function isSchema(u) {
	return hasProperty(u, TypeId) && u[TypeId] === TypeId;
}
/**
* Creates an exact optional key schema for struct fields. Unlike `optional`,
* this creates exact optional properties (not `| undefined`) that can be
* completely omitted from the object.
*
* **Example** (Creating a struct with optional key)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const schema = Schema.Struct({
*   name: Schema.String,
*   age: Schema.optionalKey(Schema.Number)
* })
*
* // Type: { readonly name: string; readonly age?: number }
* type Person = typeof schema["Type"]
* ```
*
* @category combinators
* @since 4.0.0
*/
const optionalKey = /*#__PURE__*/ lambda((schema) => make$3(optionalKey$1(schema.ast), { schema }));
/**
* Extracts the type-side schema: sets `Encoded` to equal the decoded `Type`,
* discarding the encoding transformation path.
*
* @category transforming
* @since 4.0.0
*/
const toType = /*#__PURE__*/ lambda((schema) => make$3(toType$1(schema.ast), { schema }));
/**
* Creates a schema for a single literal value (string, number, bigint, boolean, or null).
*
* **Example** (Defining a string literal)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const schema = Schema.Literal("hello")
* // Type: Schema.Literal<"hello">
* Schema.decodeSync(schema)("hello") // => "hello"
* ```
*
* @see {@link Literals} for a schema that represents a union of literals.
* @see {@link tag} for a schema that represents a literal value that can be
* used as a discriminator field in tagged unions and has a constructor default.
* @category constructors
* @since 3.10.0
*/
function Literal(literal) {
	const out = make$3(new Literal$1(literal), {
		literal,
		transform(to) {
			return out.pipe(decodeTo(Literal(to), {
				decode: transform$1(() => to),
				encode: transform$1(() => literal)
			}));
		}
	});
	return out;
}
/**
* Schema for the `unknown` type. Accepts any value without validation.
*
* **When to use**
*
* Use as a top schema when you need to accept any input while preserving
* TypeScript's `unknown` safety at use sites.
*
* @see {@link Any} for the `any` variant.
* @category schemas
* @since 3.10.0
*/
const Unknown = /*#__PURE__*/ make$3(unknown);
/**
* Schema for the `null` literal. Validates that the input is strictly `null`.
*
* @see {@link NullOr} for a union with another schema.
* @category schemas
* @since 3.10.0
*/
const Null = /*#__PURE__*/ make$3(null_);
/**
* Schema for `string` values. Validates that the input is `typeof` `"string"`.
*
* @category schemas
* @since 4.0.0
*/
const String$1 = /*#__PURE__*/ make$3(string);
/**
* Schema for `number` values, including `NaN`, `Infinity`, and `-Infinity`.
*
* **Details**
*
* Default JSON serializer:
*
* - Finite numbers are serialized as numbers.
* - Non-finite values are serialized as strings (`"NaN"`, `"Infinity"`, `"-Infinity"`).
*
* @see {@link Finite} for a schema that excludes non-finite values.
* @category schemas
* @since 4.0.0
*/
const Number$1 = /*#__PURE__*/ make$3(number);
/**
* Schema for `boolean` values. Validates that the input is `typeof` `"boolean"`.
*
* **When to use**
*
* Use to validate values that are already JavaScript booleans.
*
* @see {@link BooleanFromBit} for a schema that decodes bit literals `0` or `1` into a boolean
*
* @category schemas
* @since 4.0.0
*/
const Boolean$1 = /*#__PURE__*/ make$3(boolean);
function makeStruct(ast, fields) {
	return make$3(ast, {
		fields,
		mapFields(f, options) {
			const fields = f(this.fields);
			return makeStruct(struct(fields, options?.unsafePreserveChecks ? this.ast.checks : void 0), fields);
		}
	});
}
/**
* Defines a struct schema from a map of field schemas.
*
* **Details**
*
* Each field value is a schema. Use {@link optionalKey} or {@link optional} to
* mark fields as optional, and {@link mutableKey} to mark them as mutable.
*
* The resulting schema's `Type` is a readonly object type with the fields'
* decoded types. The `Encoded` form mirrors the field schemas' encoded types.
* Declared fields may be inherited and are copied to own properties in the
* output. The `__proto__` field is accepted only when it is an own property.
* Parsing does not guarantee that output keys retain their input order.
*
* **Example** (Defining a basic struct)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const Person = Schema.Struct({
*   name: Schema.String,
*   age: Schema.Number,
*   email: Schema.optionalKey(Schema.String)
* })
*
* // { readonly name: string; readonly age: number; readonly email?: string }
* type Person = typeof Person.Type
*
* Schema.decodeUnknownSync(Person)({ name: "Alice", age: 30 }) // => { name: "Alice", age: 30 }
* ```
*
* @category constructors
* @since 3.10.0
*/
function Struct(fields) {
	return makeStruct(struct(fields, void 0), fields);
}
/**
* @category constructors
* @since 4.0.0
*/
const ArraySchema = /*#__PURE__*/ lambda((schema) => make$3(new Arrays(false, [], [schema.ast]), { value: schema }));
function makeUnion(ast, members) {
	return make$3(ast, {
		members,
		mapMembers(f, options) {
			const members = f(this.members);
			return makeUnion(union(members, this.ast.options, options?.unsafePreserveChecks ? this.ast.checks : void 0), members);
		}
	});
}
/**
* Creates a union schema from an array of member schemas. Members are tested in
* order; the first match is returned.
*
* **Details**
*
* Optionally, specify `mode`:
* - `"anyOf"` (default) — matches if any member matches.
* - `"oneOf"` — matches if exactly one member matches.
*
* **Example** (Defining a string or number union)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const schema = Schema.Union([Schema.String, Schema.Number])
*
* Schema.decodeUnknownSync(schema)("hello") // => "hello"
* Schema.decodeUnknownSync(schema)(42) // => 42
* ```
*
* @category constructors
* @since 3.10.0
*/
function Union(members, options) {
	return makeUnion(union(members, options, void 0), members);
}
/**
* Creates a union schema from an array of literal values.
*
* **Example** (Defining status codes)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const schema = Schema.Literals(["active", "inactive", "pending"])
* Schema.decodeSync(schema)("active") // => "active"
* ```
*
* @see {@link Literal} for a schema that represents a single literal.
* @category constructors
* @since 4.0.0
*/
function Literals(literals) {
	const members = literals.map(Literal);
	return make$3(union(members, void 0, void 0), {
		literals,
		members,
		mapMembers(f) {
			return Union(f(this.members));
		},
		pick(literals) {
			return Literals(literals);
		},
		transform(to) {
			return Union(members.map((member, index) => member.transform(to[index])));
		}
	});
}
/**
* Creates a union schema of `S | null`.
*
* @category constructors
* @since 3.10.0
*/
const NullOr = /*#__PURE__*/ lambda((self) => Union([self, Null]));
function decodeTo(to, transformation) {
	return (from) => {
		return make$3(decodeTo$1(from.ast, to.ast, transformation ? makeTransformation(transformation) : passthrough()), {
			from,
			to
		});
	};
}
/**
* Attaches a constructor default value to a schema field.
*
* **Details**
*
* Constructor defaults are applied only during `make*`, not during decoding or
* encoding. Failures are represented directly as `SchemaIssue.Issue` values.
*
* **Example** (Defining an optional field with a static default)
*
* ```ts import.meta.vitest
* import { Effect, Schema } from "effect"
*
* const MySchema = Schema.Struct({
*   name: Schema.String.pipe(
*     Schema.optionalKey,
*     Schema.withConstructorDefault(Effect.succeed("anonymous"))
*   )
* })
*
* MySchema.make({}).name // => "anonymous"
* ```
*
* @category constructors
* @since 3.10.0
*/
function withConstructorDefault(defaultValue) {
	return (schema) => make$3(withConstructorDefault$1(schema.ast, defaultValue), { schema });
}
/**
* Combines a {@link Literal} schema with {@link withConstructorDefault}, making it ideal
* for discriminator fields in tagged unions. When constructing via `make`, the
* `_tag` field can be omitted and will be filled automatically.
*
* **Example** (Defining a discriminated union tag)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const A = Schema.Struct({ _tag: Schema.tag("A"), value: Schema.Number })
*
* // _tag is optional in make, auto-filled to "A"
* const a = A.make({ value: 42 })
* a // => { _tag: "A", value: 42 }
* ```
*
* @see {@link tagDefaultOmit} to also omit the tag during encoding
* @see {@link TaggedStruct} for a shorthand that adds `_tag` automatically
* @category constructors
* @since 3.10.0
*/
function tag(literal) {
	return Literal(literal).pipe(withConstructorDefault(succeed$1(literal)));
}
/**
* Creates a struct schema with an automatically populated `_tag` field.
*
* **When to use**
*
* Use to define a tagged union case from a literal tag and a set of fields.
*
* **Details**
*
* When using the `make` method, the `_tag` field is optional and will be
* added automatically. However, when decoding or encoding, the `_tag` field
* must be present in the input.
*
* **Example** (Defining a tagged struct shorthand)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* // Defines a struct with a fixed `_tag` field
* const tagged = Schema.TaggedStruct("A", {
*   a: Schema.String
* })
*
* // This is the same as writing:
* const equivalent = Schema.Struct({
*   _tag: Schema.tag("A"),
*   a: Schema.String
* })
* void tagged
* void equivalent
* ```
*
* **Example** (Accessing the literal value of the tag)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const tagged = Schema.TaggedStruct("A", {
*   a: Schema.String
* })
*
* tagged.fields._tag.schema.literal // => "A"
* ```
*
* @category constructors
* @since 3.10.0
*/
function TaggedStruct(value, fields) {
	return Struct({
		_tag: tag(value),
		...fields
	});
}
/**
* Creates a custom validation filter from a predicate function.
*
* **Details**
*
* The predicate receives the decoded input value, the schema AST, and parse
* options, and returns a `FilterOutput`. Non-success outputs are normalized into
* schema issues. The `annotations` parameter annotates the filter itself; with
* the default formatter, failures use `message` first, `expected` second, and
* `<filter>` when neither is provided.
*
* When `abort` is `true`, parsing stops after this filter fails instead of
* collecting later check failures.
*
* **Example** (Reporting failure at a nested path)
*
* ```ts import.meta.vitest
* import { Result, Schema } from "effect"
*
* const schema = Schema.Struct({ password: Schema.String, confirmPassword: Schema.String }).check(
*   Schema.makeFilter((o) =>
*     o.password === o.confirmPassword
*       ? undefined
*       : { path: ["password"], issue: "password and confirmPassword must match" }
*   )
* )
*
* const result = Schema.decodeUnknownResult(schema)({ password: "123456", confirmPassword: "1234567" })
* if (Result.isFailure(result) && result.failure.issue._tag === "Filter" && result.failure.issue.issue._tag === "Pointer") {
*   result.failure.issue.issue.path // => ["password"]
* }
* ```
*
* **Example** (Reporting multiple failures at once)
*
* ```ts import.meta.vitest
* import { Result, Schema } from "effect"
*
* const schema = Schema.Struct({ a: Schema.Finite, b: Schema.Finite, c: Schema.Finite }).check(
*   Schema.makeFilter((o) => {
*     const issues: Array<Schema.FilterIssue> = []
*     if (o.a > 0) {
*       if (o.b <= 0) issues.push({ path: ["b"], issue: "b must be greater than 0" })
*       if (o.c <= 0) issues.push({ path: ["c"], issue: "c must be greater than 0" })
*     }
*     return issues
*   })
* )
*
* const result = Schema.decodeUnknownResult(schema)({ a: 1, b: 0, c: 0 })
* if (Result.isFailure(result) && result.failure.issue._tag === "Filter" && result.failure.issue.issue._tag === "Composite") {
*   result.failure.issue.issue.issues.map((issue) => issue._tag === "Pointer" ? issue.path : []) // => [["b"], ["c"]]
* }
* ```
*
* @category constructors
* @since 4.0.0
*/
const makeFilter = makeFilter$1;
/**
* Creates a greater-than (`>`) check for any ordered type from an
* `Order.Order` instance.
*
* @category validation
* @since 4.0.0
*/
function makeIsGreaterThan(options) {
	const gt = isGreaterThan$1(options.order);
	const formatter = options.formatter ?? format$1;
	return (exclusiveMinimum, annotations) => {
		return makeFilter((input) => gt(input, exclusiveMinimum), {
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
/**
* Creates a greater-than-or-equal-to (`>=`) check for any ordered type from an
* `Order.Order` instance.
*
* @category validation
* @since 4.0.0
*/
function makeIsGreaterThanOrEqualTo(options) {
	const gte = isGreaterThanOrEqualTo$1(options.order);
	const formatter = options.formatter ?? format$1;
	return (minimum, annotations) => {
		return makeFilter((input) => gte(input, minimum), {
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
	if (!globalThis.Number.isFinite(number)) throw new globalThis.RangeError(`Expected a finite number, got ${format$1(number)}`);
	return number;
}
/**
* Validates that a number is greater than the specified value (exclusive).
*
* **Details**
*
* JSON Schema:
*
* This check corresponds to the `exclusiveMinimum` constraint in JSON Schema.
*
* Arbitrary:
*
* During arbitrary generation, this applies an
* `exclusiveMinimum` constraint to ensure generated numbers are greater than
* the specified value.
*
* @category validation
* @since 4.0.0
*/
const isGreaterThan = /*#__PURE__*/ makeIsGreaterThan({
	order: Number$4,
	annotate: (exclusiveMinimum) => ({
		representation: {
			id: "effect/schema/isGreaterThan",
			payload: { exclusiveMinimum: encodeNumberPayload(exclusiveMinimum) }
		},
		toJsonSchema: () => ({ exclusiveMinimum }),
		toCode: () => ({ runtime: `Schema.isGreaterThan(${format$1(exclusiveMinimum)})` })
	})
});
/**
* Validates that a number is greater than or equal to the specified value
* (inclusive).
*
* **Details**
*
* JSON Schema:
*
* This check corresponds to the `minimum` constraint in JSON Schema.
*
* Arbitrary:
*
* During arbitrary generation, this applies a `minimum` constraint
* to ensure generated numbers are greater than or equal to the specified value.
*
* @category validation
* @since 4.0.0
*/
const isGreaterThanOrEqualTo = /*#__PURE__*/ makeIsGreaterThanOrEqualTo({
	order: Number$4,
	annotate: (minimum) => ({
		representation: {
			id: "effect/schema/isGreaterThanOrEqualTo",
			payload: { minimum: encodeNumberPayload(minimum) }
		},
		toJsonSchema: () => ({ minimum }),
		toCode: () => ({ runtime: `Schema.isGreaterThanOrEqualTo(${format$1(minimum)})` })
	})
});
/**
* Validates that a number is a safe integer (within the safe integer range
* that can be exactly represented in JavaScript).
*
* **Details**
*
* JSON Schema:
*
* This check corresponds to the `type: "integer"` constraint in JSON Schema.
*
* Arbitrary:
*
* During arbitrary generation, this applies an integer constraint.
*
* @category validation
* @since 4.0.0
*/
function isInt(annotations) {
	return makeFilter((n) => globalThis.Number.isSafeInteger(n), {
		expected: "an integer",
		representation: {
			id: "effect/schema/isInt",
			payload: null
		},
		toJsonSchema: () => [{ type: "integer" }, true],
		toCode: () => ({ runtime: "Schema.isInt()" }),
		arbitraryConstraint: { number: "integer" },
		...annotations
	});
}
/**
* Schema for integers, rejecting `NaN`, `Infinity`, and `-Infinity`.
*
* @category schemas
* @since 3.10.0
*/
const Int = /*#__PURE__*/ Number$1.check(/*#__PURE__*/ isInt());
const getErrorOptionsKey = (options) => (options?.includeStack === true ? 1 : 0) | (options?.excludeCause === true ? 2 : 0);
const getErrorOptions = (key) => {
	switch (key) {
		case 0: return;
		case 1: return { includeStack: true };
		case 2: return { excludeCause: true };
		case 3: return {
			includeStack: true,
			excludeCause: true
		};
	}
};
const defectSchemaCache = [];
/**
* Schema for unexpected defect values represented as `unknown` with a JSON
* encoded form.
*
* **When to use**
*
* Use when you need a schema for `Cause` defects or other unexpected failures
* whose runtime value may be any value.
*
* **Details**
*
* The encoded side is {@link Json}. During decoding, JSON objects with a string
* `message` property are decoded into JavaScript `Error` values, preserving a
* non-default `name` and any string `stack`. Other JSON values decode
* unchanged.
*
* During encoding, JavaScript `Error` values encode to JSON objects with
* `name`, `message`, and optional `cause` properties. Pass
* `{ includeStack: true }` to include string stack traces in encoded `Error`
* defects, or `{ excludeCause: true }` to omit causes. Other values are
* serialized through Effect's JSON formatter and then parsed back into JSON
* when possible.
*
* **Gotchas**
*
* This schema is for carrying defects across JSON boundaries, not for
* preserving every JavaScript value exactly. Some values cannot round-trip
* unchanged:
*
* - A non-`Error` object such as `{ message: "boom" }` encodes as an
*   error-shaped JSON object and decodes back as an `Error`.
* - JSON serialization normalizes unsupported values. For example,
*   `undefined` array elements encode as `null`, unsupported object properties
*   are omitted, and circular references are dropped.
* - Values that cannot be represented as JSON fall back to Effect's formatted
*   string representation.
*
* @see {@link ErrorInstance} for a schema that only accepts JavaScript `Error` values.
* @category schemas
* @since 4.0.0
*/
function Defect(options) {
	const key = getErrorOptionsKey(options);
	const cached = defectSchemaCache[key];
	if (cached !== void 0) return cached;
	const schema = Json.pipe(decodeTo(Unknown, defectFromJson(getErrorOptions(key))));
	defectSchemaCache[key] = schema;
	return schema;
}
globalThis.RegExp;
globalThis.URL;
const JsonString = /*#__PURE__*/ String$1.annotate({
	expected: "a string that will be decoded as JSON",
	contentMediaType: "application/json"
});
/**
* Returns a schema that decodes a JSON string and then decodes the parsed value
* using the given schema.
*
* **Details**
*
* This is useful when working with JSON-encoded strings where the actual
* structure of the value is known and described by an existing schema.
*
* During decoding, the resulting schema first parses the input string as JSON,
* using `reviver` when provided, and then runs the provided schema on the
* parsed result. During encoding, it first encodes with the provided schema and
* then passes the result to `JSON.stringify` with the optional `replacer` and
* `space`.
*
* **Example** (Formatting encoded JSON)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const schema = Schema.Struct({ a: Schema.Number })
* const schemaFromJsonString = Schema.fromJsonString(schema, { space: 2 })
*
* Schema.encodeSync(schemaFromJsonString)({ a: 1 }) // => "{\n  \"a\": 1\n}"
* ```
*
* @category schemas
* @since 4.0.0
*/
function fromJsonString(schema, options) {
	return JsonString.pipe(decodeTo(schema, fromJsonString$1(options)));
}
globalThis.File;
globalThis.FormData;
globalThis.URLSearchParams;
globalThis.Uint8Array;
const immerable = /*#__PURE__*/ globalThis.Symbol.for("immer-draftable");
const payloadToken = {};
function makeClass(Inherited, identifier, struct$1, annotations, proto) {
	const getClassSchema = getClassSchemaFactory(struct$1, identifier, annotations);
	const ClassTypeId = getClassTypeId(identifier);
	const out = class extends Inherited {
		constructor(...[input, options]) {
			const payload = options?.["~payload"];
			const value = payload?.token === payloadToken ? payload.value : struct$1.make(input ?? {}, options);
			super(value, {
				...options,
				disableChecks: true,
				"~payload": {
					token: payloadToken,
					value
				}
			});
		}
		static [TypeId] = TypeId;
		get [ClassTypeId]() {
			return ClassTypeId;
		}
		static [immerable] = true;
		static identifier = identifier;
		static fields = struct$1.fields;
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
			return make$5(getClassSchema(this))(input ?? {}, options);
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
		static extend(identifier) {
			return (schema, annotations) => {
				const extension = isStruct(schema) ? schema : Struct(schema);
				const fields = {
					...struct$1.fields,
					...extension.fields
				};
				const ast = struct(fields, struct$1.ast.checks, { identifier });
				return makeClass(this, identifier, makeStruct(appendChecks(ast, extension.ast.checks), fields), annotations, proto);
			};
		}
		static mapFields(f, options) {
			return struct$1.mapFields(f, options);
		}
	};
	if (proto !== void 0) Object.assign(out.prototype, proto(identifier));
	return out;
}
function getClassTransformation(self) {
	return new Transformation(transform$1((input) => new self(input, { "~payload": {
		token: payloadToken,
		value: input
	} })), passthrough$1());
}
function getClassTypeId(identifier) {
	return `~effect/Schema/Class/${identifier}`;
}
function getClassSchemaFactory(from, identifier, annotations) {
	let memo;
	return (self) => {
		if (memo !== void 0) return memo;
		const ClassTypeId = getClassTypeId(identifier);
		const isClassValue = (input) => input instanceof self || hasProperty(input, ClassTypeId);
		const transformation = getClassTransformation(self);
		return memo = decodeTo(make$3(new Declaration([from.ast], () => (input, ast, options) => {
			return isClassValue(input) ? succeed$1(input) : fail$1(new InvalidType(ast, input, options));
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
		})), transformation)(from);
	};
}
function isStruct(schema) {
	return isSchema(schema);
}
/**
* Creates a schema-backed error class that can be used as a typed,
* yieldable error in Effect programs. Combines {@link Class} validation with
* the `YieldableError` interface so instances can be yielded directly inside
* `Effect.gen`.
*
* **Example** (Schema-backed error)
*
* ```ts import.meta.vitest
* import { Effect, Schema } from "effect"
*
* class NotFound extends Schema.Error<NotFound>("NotFound")({
*   id: Schema.Number
* }) {}
*
* const program = Effect.gen(function*() {
*   yield* new NotFound({ id: 1 })
* })
* const error = await Effect.runPromise(Effect.flip(program))
* error.id // => 1
* ```
*
* @category constructors
* @since 4.0.0
*/
const Error$1 = (identifier) => (schema, annotations) => {
	const struct = isStruct(schema) ? schema : Struct(schema);
	return makeClass(Error$3, identifier, struct, annotations, (identifier) => ({ name: identifier }));
};
/**
* Defines a schema-backed yieldable error class with an automatically populated
* `_tag` field.
*
* **When to use**
*
* Use to define typed errors that are schema validated, yielded in `Effect.gen`,
* and matched as tagged union members.
*
* **Example** (Defining a tagged error class)
*
* ```ts import.meta.vitest
* import { Effect, Schema } from "effect"
*
* class NotFound extends Schema.TaggedError<NotFound>()("NotFound", {
*   id: Schema.Number
* }) {}
*
* const program = Effect.gen(function*() {
*   yield* new NotFound({ id: 42 })
* })
* const error = await Effect.runPromise(Effect.flip(program))
* error._tag // => "NotFound"
* error.id // => 42
* ```
*
* @category constructors
* @since 3.10.0
*/
const TaggedError = (identifier) => {
	return (tagValue, schema, annotations) => {
		const struct = isStruct(schema) ? schema.mapFields((fields) => ({
			_tag: tag(tagValue),
			...fields
		}), { unsafePreserveChecks: true }) : TaggedStruct(tagValue, schema);
		return Error$1(identifier ?? tagValue)(struct, annotations);
	};
};
/**
* Returns a JSON Schema document using draft 2020-12.
*
* **When to use**
*
* Use when you need a draft-2020-12 description of the canonical JSON form of a runtime schema.
*
* **Details**
*
* The document describes the encoded side of `Schema.toCodecJson(schema)`.
* Use that codec to decode JSON inputs. For example, it decodes JSON `null`
* to JavaScript `undefined` for a field defined with `Schema.optional(Schema.String)`.
* Decoding the same input with the original schema rejects `null`.
*
* The `options` parameter controls reference extraction and generation details
* such as excess properties and synthesized check descriptions; it does not
* change the draft target. The reference policy receives canonical JSON
* encoded ASTs. By default, anonymous non-recursive candidates remain inline,
* while candidates with resolved identifiers become definitions. Declarations
* are lowered through their `toCodecJson` or `toCodec` annotation when
* available before the representation document is compiled.
*
* The generated document is intended for preliminary validation. JSON Schema
* and Effect checks do not always have identical semantics, so the Effect
* decoder remains the final authority. Passing JSON Schema validation does not
* guarantee that Effect decoding will succeed.
*
* **Gotchas**
*
* JSON Schema generation is best-effort. String length uses Unicode code points
* in JSON Schema and UTF-16 code units in Effect. A generated `pattern` cannot
* retain JavaScript RegExp flags. Object property checks apply to the original
* input in JSON Schema but to the decoded object in Effect. When a `oneOf`
* branch contains a known approximation, the compiler emits `anyOf` so that
* the approximation cannot create a false rejection. Unions with only exact
* branches retain `oneOf`. Custom `toJsonSchema` callbacks return `[schema, true]` for safe,
* looser approximations and are responsible for the semantics they declare. When
* canonical JSON derivation adds an artificial transformation, checks and
* annotations on its source node are not copied to the JSON target, so they do
* not appear in the emitted document. Opaque declarations without a structural
* codec are represented by an unconstrained JSON Schema. The default
* `onExcessProperty: "ignore"` matches the decoder default and leaves
* index-signature keys without exact selectors open. In `"error"` mode, the compiler
* constrains those keys with `propertyNames` and applies a permissive choice of
* candidate index value schemas. The Effect decoder enforces the exact
* key-value association.
*
* **Example** (Decoding JSON with the matching codec)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const schema = Schema.Struct({
*   name: Schema.optional(Schema.String)
* })
*
* const document = Schema.toJsonSchemaDocument(schema)
* const jsonCodec = Schema.toCodecJson(schema)
*
* Schema.decodeUnknownResult(schema)({ name: null })._tag // => "Failure"
* Schema.decodeUnknownSync(jsonCodec)({ name: null }) // => { name: undefined }
* Schema.decodeUnknownSync(jsonCodec)({}) // => {}
* Schema.encodeSync(jsonCodec)({ name: undefined }) // => { name: null }
* ```
*
* @see {@link toCodecJson} for decoding and encoding the canonical JSON representation
* @see {@link SchemaRepresentation.toJsonSchemaDocument} for compiling an existing live representation document
*
* @category converting
* @since 4.0.0
*/
function toJsonSchemaDocument(schema, options) {
	return toJsonSchemaDocument$1(toRepresentation(toCodecJsonAST(schema.ast), options), options);
}
/**
* Schema that accepts and validates any immutable JSON-compatible value.
*
* **Example** (Validating a JSON value)
*
* ```ts import.meta.vitest
* import { Option, Schema } from "effect"
*
* Schema.decodeUnknownOption(Schema.Json)({ key: [1, true, null] }) // => Option.some({ key: [1, true, null] })
* ```
*
* @category schemas
* @since 4.0.0
*/
const Json = /*#__PURE__*/ make$3(/*#__PURE__*/ annotate(Json$1, { toCode: () => ({
	runtime: "Schema.Json",
	Type: "Schema.Json"
}) }));
// node_modules/effect/dist/Fiber.js
const await_ = fiberAwait;
/**
* Interrupts all fibers in the provided iterable, causing them to stop executing
* and clean up any acquired resources.
*
* **When to use**
*
* Use when you need to cancel several forked fibers and wait for their cleanup
* to complete.
*
* **Details**
*
* The current fiber is recorded as the interruptor. The returned Effect
* completes only after all interrupted fibers have completed.
*
* **Gotchas**
*
* Interruption is cooperative for each fiber. The returned Effect can wait for
* uninterruptible work and finalizers in any interrupted fiber.
*
* **Example** (Interrupting multiple fibers)
*
* ```ts import.meta.vitest
* import { Effect, Fiber } from "effect"
*
* const program = Effect.gen(function*() {
*   const fiber1 = yield* Effect.forkChild(Effect.never)
*   const fiber2 = yield* Effect.forkChild(Effect.never)
*   const fiber3 = yield* Effect.forkChild(Effect.never)
*   yield* Fiber.interruptAll([fiber1, fiber2, fiber3])
* })
*
* await Effect.runPromise(program)
* ```
*
* @see {@link interruptAllAs} for specifying the interrupting fiber ID
*
* @category interruption
* @since 2.0.0
*/
const interruptAll = fiberInterruptAll;
// node_modules/acorn/dist/acorn.mjs
var astralIdentifierCodes = [
	509,
	0,
	227,
	0,
	150,
	4,
	294,
	9,
	1368,
	2,
	2,
	1,
	6,
	3,
	41,
	2,
	5,
	0,
	166,
	1,
	574,
	3,
	9,
	9,
	7,
	9,
	32,
	4,
	318,
	1,
	80,
	3,
	71,
	10,
	50,
	3,
	123,
	2,
	54,
	14,
	32,
	10,
	3,
	1,
	11,
	3,
	46,
	10,
	8,
	0,
	46,
	9,
	7,
	2,
	37,
	13,
	2,
	9,
	6,
	1,
	45,
	0,
	13,
	2,
	49,
	13,
	9,
	3,
	2,
	11,
	83,
	11,
	7,
	0,
	3,
	0,
	158,
	11,
	6,
	9,
	7,
	3,
	56,
	1,
	2,
	6,
	3,
	1,
	3,
	2,
	10,
	0,
	11,
	1,
	3,
	6,
	4,
	4,
	68,
	8,
	2,
	0,
	3,
	0,
	2,
	3,
	2,
	4,
	2,
	0,
	15,
	1,
	83,
	17,
	10,
	9,
	5,
	0,
	82,
	19,
	13,
	9,
	214,
	6,
	3,
	8,
	28,
	1,
	83,
	16,
	16,
	9,
	82,
	12,
	9,
	9,
	7,
	19,
	58,
	14,
	5,
	9,
	243,
	14,
	166,
	9,
	71,
	5,
	2,
	1,
	3,
	3,
	2,
	0,
	2,
	1,
	13,
	9,
	120,
	6,
	3,
	6,
	4,
	0,
	29,
	9,
	41,
	6,
	2,
	3,
	9,
	0,
	10,
	10,
	47,
	15,
	343,
	9,
	54,
	7,
	2,
	7,
	17,
	9,
	57,
	21,
	2,
	13,
	123,
	5,
	4,
	0,
	2,
	1,
	2,
	6,
	2,
	0,
	9,
	9,
	49,
	4,
	2,
	1,
	2,
	4,
	9,
	9,
	330,
	3,
	10,
	1,
	2,
	0,
	49,
	6,
	4,
	4,
	14,
	10,
	5350,
	0,
	7,
	14,
	11465,
	27,
	2343,
	9,
	87,
	9,
	39,
	4,
	60,
	6,
	26,
	9,
	535,
	9,
	470,
	0,
	2,
	54,
	8,
	3,
	82,
	0,
	12,
	1,
	19628,
	1,
	4178,
	9,
	519,
	45,
	3,
	22,
	543,
	4,
	4,
	5,
	9,
	7,
	3,
	6,
	31,
	3,
	149,
	2,
	1418,
	49,
	513,
	54,
	5,
	49,
	9,
	0,
	15,
	0,
	23,
	4,
	2,
	14,
	1361,
	6,
	2,
	16,
	3,
	6,
	2,
	1,
	2,
	4,
	101,
	0,
	161,
	6,
	10,
	9,
	357,
	0,
	62,
	13,
	499,
	13,
	245,
	1,
	2,
	9,
	726,
	6,
	110,
	6,
	6,
	9,
	4759,
	9,
	787719,
	239
];
var astralIdentifierStartCodes = [
	0,
	11,
	2,
	25,
	2,
	18,
	2,
	1,
	2,
	14,
	3,
	13,
	35,
	122,
	70,
	52,
	268,
	28,
	4,
	48,
	48,
	31,
	14,
	29,
	6,
	37,
	11,
	29,
	3,
	35,
	5,
	7,
	2,
	4,
	43,
	157,
	19,
	35,
	5,
	35,
	5,
	39,
	9,
	51,
	13,
	10,
	2,
	14,
	2,
	6,
	2,
	1,
	2,
	10,
	2,
	14,
	2,
	6,
	2,
	1,
	4,
	51,
	13,
	310,
	10,
	21,
	11,
	7,
	25,
	5,
	2,
	41,
	2,
	8,
	70,
	5,
	3,
	0,
	2,
	43,
	2,
	1,
	4,
	0,
	3,
	22,
	11,
	22,
	10,
	30,
	66,
	18,
	2,
	1,
	11,
	21,
	11,
	25,
	71,
	55,
	7,
	1,
	65,
	0,
	16,
	3,
	2,
	2,
	2,
	28,
	43,
	28,
	4,
	28,
	36,
	7,
	2,
	27,
	28,
	53,
	11,
	21,
	11,
	18,
	14,
	17,
	111,
	72,
	56,
	50,
	14,
	50,
	14,
	35,
	39,
	27,
	10,
	22,
	251,
	41,
	7,
	1,
	17,
	2,
	60,
	28,
	11,
	0,
	9,
	21,
	43,
	17,
	47,
	20,
	28,
	22,
	13,
	52,
	58,
	1,
	3,
	0,
	14,
	44,
	33,
	24,
	27,
	35,
	30,
	0,
	3,
	0,
	9,
	34,
	4,
	0,
	13,
	47,
	15,
	3,
	22,
	0,
	2,
	0,
	36,
	17,
	2,
	24,
	20,
	1,
	64,
	6,
	2,
	0,
	2,
	3,
	2,
	14,
	2,
	9,
	8,
	46,
	39,
	7,
	3,
	1,
	3,
	21,
	2,
	6,
	2,
	1,
	2,
	4,
	4,
	0,
	19,
	0,
	13,
	4,
	31,
	9,
	2,
	0,
	3,
	0,
	2,
	37,
	2,
	0,
	26,
	0,
	2,
	0,
	45,
	52,
	19,
	3,
	21,
	2,
	31,
	47,
	21,
	1,
	2,
	0,
	185,
	46,
	42,
	3,
	37,
	47,
	21,
	0,
	60,
	42,
	14,
	0,
	72,
	26,
	38,
	6,
	186,
	43,
	117,
	63,
	32,
	7,
	3,
	0,
	3,
	7,
	2,
	1,
	2,
	23,
	16,
	0,
	2,
	0,
	95,
	7,
	3,
	38,
	17,
	0,
	2,
	0,
	29,
	0,
	11,
	39,
	8,
	0,
	22,
	0,
	12,
	45,
	20,
	0,
	19,
	72,
	200,
	32,
	32,
	8,
	2,
	36,
	18,
	0,
	50,
	29,
	113,
	6,
	2,
	1,
	2,
	37,
	22,
	0,
	26,
	5,
	2,
	1,
	2,
	31,
	15,
	0,
	328,
	18,
	16,
	0,
	2,
	12,
	2,
	33,
	125,
	0,
	80,
	921,
	103,
	110,
	18,
	195,
	2637,
	96,
	16,
	1071,
	18,
	5,
	26,
	3994,
	6,
	582,
	6842,
	29,
	1763,
	568,
	8,
	30,
	18,
	78,
	18,
	29,
	19,
	47,
	17,
	3,
	32,
	20,
	6,
	18,
	433,
	44,
	212,
	63,
	129,
	74,
	6,
	0,
	67,
	12,
	65,
	1,
	2,
	0,
	29,
	6135,
	9,
	1237,
	42,
	9,
	8936,
	3,
	2,
	6,
	2,
	1,
	2,
	290,
	16,
	0,
	30,
	2,
	3,
	0,
	15,
	3,
	9,
	395,
	2309,
	106,
	6,
	12,
	4,
	8,
	8,
	9,
	5991,
	84,
	2,
	70,
	2,
	1,
	3,
	0,
	3,
	1,
	3,
	3,
	2,
	11,
	2,
	0,
	2,
	6,
	2,
	64,
	2,
	3,
	3,
	7,
	2,
	6,
	2,
	27,
	2,
	3,
	2,
	4,
	2,
	0,
	4,
	6,
	2,
	339,
	3,
	24,
	2,
	24,
	2,
	30,
	2,
	24,
	2,
	30,
	2,
	24,
	2,
	30,
	2,
	24,
	2,
	30,
	2,
	24,
	2,
	7,
	1845,
	30,
	7,
	5,
	262,
	61,
	147,
	44,
	11,
	6,
	17,
	0,
	322,
	29,
	19,
	43,
	485,
	27,
	229,
	29,
	3,
	0,
	496,
	6,
	2,
	3,
	2,
	1,
	2,
	14,
	2,
	196,
	60,
	67,
	8,
	0,
	1205,
	3,
	2,
	26,
	2,
	1,
	2,
	0,
	3,
	0,
	2,
	9,
	2,
	3,
	2,
	0,
	2,
	0,
	7,
	0,
	5,
	0,
	2,
	0,
	2,
	0,
	2,
	2,
	2,
	1,
	2,
	0,
	3,
	0,
	2,
	0,
	2,
	0,
	2,
	0,
	2,
	0,
	2,
	1,
	2,
	0,
	3,
	3,
	2,
	6,
	2,
	3,
	2,
	3,
	2,
	0,
	2,
	9,
	2,
	16,
	6,
	2,
	2,
	4,
	2,
	16,
	4421,
	42719,
	33,
	4153,
	7,
	221,
	3,
	5761,
	15,
	7472,
	16,
	621,
	2467,
	541,
	1507,
	4938,
	6,
	4191
];
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
	for (var i = 0; i < set.length; i += 2) {
		pos += set[i];
		if (pos > code) return false;
		pos += set[i + 1];
		if (pos >= code) return true;
	}
	return false;
}
function isIdentifierStart(code, astral) {
	if (code < 65) return code === 36;
	if (code < 91) return true;
	if (code < 97) return code === 95;
	if (code < 123) return true;
	if (code <= 65535) return code >= 170 && nonASCIIidentifierStart.test(String.fromCharCode(code));
	if (astral === false) return false;
	return isInAstralSet(code, astralIdentifierStartCodes);
}
function isIdentifierChar(code, astral) {
	if (code < 48) return code === 36;
	if (code < 58) return true;
	if (code < 65) return false;
	if (code < 91) return true;
	if (code < 97) return code === 95;
	if (code < 123) return true;
	if (code <= 65535) return code >= 170 && nonASCIIidentifier.test(String.fromCharCode(code));
	if (astral === false) return false;
	return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
}
var TokenType = function TokenType(label, conf) {
	if (conf === void 0) conf = {};
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
	return new TokenType(name, {
		beforeExpr: true,
		binop: prec
	});
}
var beforeExpr = { beforeExpr: true };
var startsExpr = { startsExpr: true };
var keywords = {};
function kw(name, options) {
	if (options === void 0) options = {};
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
	bracketL: new TokenType("[", {
		beforeExpr: true,
		startsExpr: true
	}),
	bracketR: new TokenType("]"),
	braceL: new TokenType("{", {
		beforeExpr: true,
		startsExpr: true
	}),
	braceR: new TokenType("}"),
	parenL: new TokenType("(", {
		beforeExpr: true,
		startsExpr: true
	}),
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
	dollarBraceL: new TokenType("${", {
		beforeExpr: true,
		startsExpr: true
	}),
	eq: new TokenType("=", {
		beforeExpr: true,
		isAssign: true
	}),
	assign: new TokenType("_=", {
		beforeExpr: true,
		isAssign: true
	}),
	incDec: new TokenType("++/--", {
		prefix: true,
		postfix: true,
		startsExpr: true
	}),
	prefix: new TokenType("!/~", {
		beforeExpr: true,
		prefix: true,
		startsExpr: true
	}),
	logicalOR: binop("||", 1),
	logicalAND: binop("&&", 2),
	bitwiseOR: binop("|", 3),
	bitwiseXOR: binop("^", 4),
	bitwiseAND: binop("&", 5),
	equality: binop("==/!=/===/!==", 6),
	relational: binop("</>/<=/>=", 7),
	bitShift: binop("<</>>/>>>", 8),
	plusMin: new TokenType("+/-", {
		beforeExpr: true,
		binop: 9,
		prefix: true,
		startsExpr: true
	}),
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
	_do: kw("do", {
		isLoop: true,
		beforeExpr: true
	}),
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
	_new: kw("new", {
		beforeExpr: true,
		startsExpr: true
	}),
	_this: kw("this", startsExpr),
	_super: kw("super", startsExpr),
	_class: kw("class", startsExpr),
	_extends: kw("extends", beforeExpr),
	_export: kw("export"),
	_import: kw("import", startsExpr),
	_null: kw("null", startsExpr),
	_true: kw("true", startsExpr),
	_false: kw("false", startsExpr),
	_in: kw("in", {
		beforeExpr: true,
		binop: 7
	}),
	_instanceof: kw("instanceof", {
		beforeExpr: true,
		binop: 7
	}),
	_typeof: kw("typeof", {
		beforeExpr: true,
		prefix: true,
		startsExpr: true
	}),
	_void: kw("void", {
		beforeExpr: true,
		prefix: true,
		startsExpr: true
	}),
	_delete: kw("delete", {
		beforeExpr: true,
		prefix: true,
		startsExpr: true
	})
};
var lineBreak = /\r\n?|\n|\u2028|\u2029/;
var lineBreakG = new RegExp(lineBreak.source, "g");
function isNewLine(code) {
	return code === 10 || code === 13 || code === 8232 || code === 8233;
}
function nextLineBreak(code, from, end) {
	if (end === void 0) end = code.length;
	for (var i = from; i < end; i++) {
		var next = code.charCodeAt(i);
		if (isNewLine(next)) return i < end - 1 && next === 13 && code.charCodeAt(i + 1) === 10 ? i + 2 : i + 1;
	}
	return -1;
}
var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;
var ref = Object.prototype;
var hasOwnProperty = ref.hasOwnProperty;
var toString = ref.toString;
var hasOwn$1 = Object.hasOwn || (function(obj, propName) {
	return hasOwnProperty.call(obj, propName);
});
var isArray = Array.isArray || (function(obj) {
	return toString.call(obj) === "[object Array]";
});
var regexpCache = Object.create(null);
function wordsRegexp(words) {
	return regexpCache[words] || (regexpCache[words] = new RegExp("^(?:" + words.replace(/ /g, "|") + ")$"));
}
function codePointToString(code) {
	if (code <= 65535) return String.fromCharCode(code);
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
	if (p.sourceFile !== null) this.source = p.sourceFile;
};
function getLineInfo(input, offset) {
	for (var line = 1, cur = 0;;) {
		var nextBreak = nextLineBreak(input, cur, offset);
		if (nextBreak < 0) return new Position(line, offset - cur);
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
	for (var opt in defaultOptions) options[opt] = opts && hasOwn$1(opts, opt) ? opts[opt] : defaultOptions[opt];
	if (options.ecmaVersion === "latest") options.ecmaVersion = 1e8;
	else if (options.ecmaVersion == null) {
		if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
			warnedAboutEcmaVersion = true;
			console.warn("Since Acorn 8.0.0, options.ecmaVersion is required.\nDefaulting to 2020, but this will stop working in the future.");
		}
		options.ecmaVersion = 11;
	} else if (options.ecmaVersion >= 2015) options.ecmaVersion -= 2009;
	if (options.allowReserved == null) options.allowReserved = options.ecmaVersion < 5;
	if (!opts || opts.allowHashBang == null) options.allowHashBang = options.ecmaVersion >= 14;
	if (isArray(options.onToken)) {
		var tokens = options.onToken;
		options.onToken = function(token) {
			return tokens.push(token);
		};
	}
	if (isArray(options.onComment)) options.onComment = pushComment(options, options.onComment);
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
		if (options.locations) comment.loc = new SourceLocation(this, startLoc, endLoc);
		if (options.ranges) comment.range = [start, end];
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
		if (options.sourceType === "module") reserved += " await";
	}
	this.reservedWords = wordsRegexp(reserved);
	var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
	this.reservedWordsStrict = wordsRegexp(reservedStrict);
	this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
	this.input = String(input);
	this.containsEsc = false;
	if (startPos) {
		this.pos = startPos;
		this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
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
	if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!") this.skipLineComment(2);
	this.scopeStack = [];
	this.enterScope(SCOPE_TOP);
	this.regexpState = null;
	this.privateNameStack = [];
};
var prototypeAccessors = {
	inFunction: { configurable: true },
	inGenerator: { configurable: true },
	inAsync: { configurable: true },
	canAwait: { configurable: true },
	allowSuper: { configurable: true },
	allowDirectSuper: { configurable: true },
	treatFunctionsAsVar: { configurable: true },
	allowNewDotTarget: { configurable: true },
	inClassStaticBlock: { configurable: true }
};
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
	for (var i = this.scopeStack.length - 1; i >= 0; i--) {
		var flags = this.scopeStack[i].flags;
		if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT)) return false;
		if (flags & SCOPE_FUNCTION) return (flags & SCOPE_ASYNC) > 0;
	}
	return this.inModule && this.options.ecmaVersion >= 13 || this.options.allowAwaitOutsideFunction;
};
prototypeAccessors.allowSuper.get = function() {
	return (this.currentThisScope().flags & SCOPE_SUPER) > 0 || this.options.allowSuperOutsideMethod;
};
prototypeAccessors.allowDirectSuper.get = function() {
	return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0;
};
prototypeAccessors.treatFunctionsAsVar.get = function() {
	return this.treatFunctionsAsVarInScope(this.currentScope());
};
prototypeAccessors.allowNewDotTarget.get = function() {
	for (var i = this.scopeStack.length - 1; i >= 0; i--) {
		var flags = this.scopeStack[i].flags;
		if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT) || flags & SCOPE_FUNCTION && !(flags & SCOPE_ARROW)) return true;
	}
	return false;
};
prototypeAccessors.inClassStaticBlock.get = function() {
	return (this.currentVarScope().flags & SCOPE_CLASS_STATIC_BLOCK) > 0;
};
Parser.extend = function extend() {
	var plugins = [], len = arguments.length;
	while (len--) plugins[len] = arguments[len];
	var cls = this;
	for (var i = 0; i < plugins.length; i++) cls = plugins[i](cls);
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
var literal$2 = /^(?:'((?:\\[^]|[^'\\])*?)'|"((?:\\[^]|[^"\\])*?)")/;
pp$9.strictDirective = function(start) {
	if (this.options.ecmaVersion < 5) return false;
	for (;;) {
		skipWhiteSpace.lastIndex = start;
		start += skipWhiteSpace.exec(this.input)[0].length;
		var match = literal$2.exec(this.input.slice(start));
		if (!match) return false;
		if ((match[1] || match[2]) === "use strict") {
			skipWhiteSpace.lastIndex = start + match[0].length;
			var spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length;
			var next = this.input.charAt(end);
			return next === ";" || next === "}" || lineBreak.test(spaceAfter[0]) && !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "=");
		}
		start += match[0].length;
		skipWhiteSpace.lastIndex = start;
		start += skipWhiteSpace.exec(this.input)[0].length;
		if (this.input[start] === ";") start++;
	}
};
pp$9.eat = function(type) {
	if (this.type === type) {
		this.next();
		return true;
	} else return false;
};
pp$9.isContextual = function(name) {
	return this.type === types$1.name && this.value === name && !this.containsEsc;
};
pp$9.eatContextual = function(name) {
	if (!this.isContextual(name)) return false;
	this.next();
	return true;
};
pp$9.expectContextual = function(name) {
	if (!this.eatContextual(name)) this.unexpected();
};
pp$9.canInsertSemicolon = function() {
	return this.type === types$1.eof || this.type === types$1.braceR || lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
};
pp$9.insertSemicolon = function() {
	if (this.canInsertSemicolon()) {
		if (this.options.onInsertedSemicolon) this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
		return true;
	}
};
pp$9.semicolon = function() {
	if (!this.eat(types$1.semi) && !this.insertSemicolon()) this.unexpected();
};
pp$9.afterTrailingComma = function(tokType, notNext) {
	if (this.type === tokType) {
		if (this.options.onTrailingComma) this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
		if (!notNext) this.next();
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
	if (!refDestructuringErrors) return;
	if (refDestructuringErrors.trailingComma > -1) this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element");
	var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
	if (parens > -1) this.raiseRecoverable(parens, isAssign ? "Assigning to rvalue" : "Parenthesized pattern");
};
pp$9.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
	if (!refDestructuringErrors) return false;
	var shorthandAssign = refDestructuringErrors.shorthandAssign;
	var doubleProto = refDestructuringErrors.doubleProto;
	if (!andThrow) return shorthandAssign >= 0 || doubleProto >= 0;
	if (shorthandAssign >= 0) this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns");
	if (doubleProto >= 0) this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property");
};
pp$9.checkYieldAwaitInDefaultParams = function() {
	if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos)) this.raise(this.yieldPos, "Yield expression cannot be a default value");
	if (this.awaitPos) this.raise(this.awaitPos, "Await expression cannot be a default value");
};
pp$9.isSimpleAssignTarget = function(expr) {
	if (expr.type === "ParenthesizedExpression") return this.isSimpleAssignTarget(expr.expression);
	return expr.type === "Identifier" || expr.type === "MemberExpression";
};
var pp$8 = Parser.prototype;
pp$8.parseTopLevel = function(node) {
	var exports = Object.create(null);
	if (!node.body) node.body = [];
	while (this.type !== types$1.eof) {
		var stmt = this.parseStatement(null, true, exports);
		node.body.push(stmt);
	}
	if (this.inModule) for (var i = 0, list = Object.keys(this.undefinedExports); i < list.length; i += 1) {
		var name = list[i];
		this.raiseRecoverable(this.undefinedExports[name].start, "Export '" + name + "' is not defined");
	}
	this.adaptDirectivePrologue(node.body);
	this.next();
	node.sourceType = this.options.sourceType;
	return this.finishNode(node, "Program");
};
var loopLabel = { kind: "loop" };
var switchLabel = { kind: "switch" };
pp$8.isLet = function(context) {
	if (this.options.ecmaVersion < 6 || !this.isContextual("let")) return false;
	skipWhiteSpace.lastIndex = this.pos;
	var skip = skipWhiteSpace.exec(this.input);
	var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
	if (nextCh === 91 || nextCh === 92) return true;
	if (context) return false;
	if (nextCh === 123 || nextCh > 55295 && nextCh < 56320) return true;
	if (isIdentifierStart(nextCh, true)) {
		var pos = next + 1;
		while (isIdentifierChar(nextCh = this.input.charCodeAt(pos), true)) ++pos;
		if (nextCh === 92 || nextCh > 55295 && nextCh < 56320) return true;
		var ident = this.input.slice(next, pos);
		if (!keywordRelationalOperator.test(ident)) return true;
	}
	return false;
};
pp$8.isAsyncFunction = function() {
	if (this.options.ecmaVersion < 8 || !this.isContextual("async")) return false;
	skipWhiteSpace.lastIndex = this.pos;
	var skip = skipWhiteSpace.exec(this.input);
	var next = this.pos + skip[0].length, after;
	return !lineBreak.test(this.input.slice(this.pos, next)) && this.input.slice(next, next + 8) === "function" && (next + 8 === this.input.length || !(isIdentifierChar(after = this.input.charCodeAt(next + 8)) || after > 55295 && after < 56320));
};
pp$8.isUsingKeyword = function(isAwaitUsing, isFor) {
	if (this.options.ecmaVersion < 17 || !this.isContextual(isAwaitUsing ? "await" : "using")) return false;
	skipWhiteSpace.lastIndex = this.pos;
	var skip = skipWhiteSpace.exec(this.input);
	var next = this.pos + skip[0].length;
	if (lineBreak.test(this.input.slice(this.pos, next))) return false;
	if (isAwaitUsing) {
		var awaitEndPos = next + 5, after;
		if (this.input.slice(next, awaitEndPos) !== "using" || awaitEndPos === this.input.length || isIdentifierChar(after = this.input.charCodeAt(awaitEndPos)) || after > 55295 && after < 56320) return false;
		skipWhiteSpace.lastIndex = awaitEndPos;
		var skipAfterUsing = skipWhiteSpace.exec(this.input);
		if (skipAfterUsing && lineBreak.test(this.input.slice(awaitEndPos, awaitEndPos + skipAfterUsing[0].length))) return false;
	}
	if (isFor) {
		var ofEndPos = next + 2, after$1;
		if (this.input.slice(next, ofEndPos) === "of") {
			if (ofEndPos === this.input.length || !isIdentifierChar(after$1 = this.input.charCodeAt(ofEndPos)) && !(after$1 > 55295 && after$1 < 56320)) return false;
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
		case types$1._continue: return this.parseBreakContinueStatement(node, starttype.keyword);
		case types$1._debugger: return this.parseDebuggerStatement(node);
		case types$1._do: return this.parseDoStatement(node);
		case types$1._for: return this.parseForStatement(node);
		case types$1._function:
			if (context && (this.strict || context !== "if" && context !== "label") && this.options.ecmaVersion >= 6) this.unexpected();
			return this.parseFunctionStatement(node, false, !context);
		case types$1._class:
			if (context) this.unexpected();
			return this.parseClass(node, true);
		case types$1._if: return this.parseIfStatement(node);
		case types$1._return: return this.parseReturnStatement(node);
		case types$1._switch: return this.parseSwitchStatement(node);
		case types$1._throw: return this.parseThrowStatement(node);
		case types$1._try: return this.parseTryStatement(node);
		case types$1._const:
		case types$1._var:
			kind = kind || this.value;
			if (context && kind !== "var") this.unexpected();
			return this.parseVarStatement(node, kind);
		case types$1._while: return this.parseWhileStatement(node);
		case types$1._with: return this.parseWithStatement(node);
		case types$1.braceL: return this.parseBlock(true, node);
		case types$1.semi: return this.parseEmptyStatement(node);
		case types$1._export:
		case types$1._import:
			if (this.options.ecmaVersion > 10 && starttype === types$1._import) {
				skipWhiteSpace.lastIndex = this.pos;
				var skip = skipWhiteSpace.exec(this.input);
				var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
				if (nextCh === 40 || nextCh === 46) return this.parseExpressionStatement(node, this.parseExpression());
			}
			if (!this.options.allowImportExportEverywhere) {
				if (!topLevel) this.raise(this.start, "'import' and 'export' may only appear at the top level");
				if (!this.inModule) this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
			}
			return starttype === types$1._import ? this.parseImport(node) : this.parseExport(node, exports);
		default:
			if (this.isAsyncFunction()) {
				if (context) this.unexpected();
				this.next();
				return this.parseFunctionStatement(node, true, !context);
			}
			var usingKind = this.isAwaitUsing(false) ? "await using" : this.isUsing(false) ? "using" : null;
			if (usingKind) {
				if (topLevel && this.options.sourceType === "script") this.raise(this.start, "Using declaration cannot appear in the top level when source type is `script`");
				if (usingKind === "await using") {
					if (!this.canAwait) this.raise(this.start, "Await using cannot appear outside of async function");
					this.next();
				}
				this.next();
				this.parseVar(node, false, usingKind);
				this.semicolon();
				return this.finishNode(node, "VariableDeclaration");
			}
			var maybeName = this.value, expr = this.parseExpression();
			if (starttype === types$1.name && expr.type === "Identifier" && this.eat(types$1.colon)) return this.parseLabeledStatement(node, maybeName, expr, context);
			else return this.parseExpressionStatement(node, expr);
	}
};
pp$8.parseBreakContinueStatement = function(node, keyword) {
	var isBreak = keyword === "break";
	this.next();
	if (this.eat(types$1.semi) || this.insertSemicolon()) node.label = null;
	else if (this.type !== types$1.name) this.unexpected();
	else {
		node.label = this.parseIdent();
		this.semicolon();
	}
	var i = 0;
	for (; i < this.labels.length; ++i) {
		var lab = this.labels[i];
		if (node.label == null || lab.name === node.label.name) {
			if (lab.kind != null && (isBreak || lab.kind === "loop")) break;
			if (node.label && isBreak) break;
		}
	}
	if (i === this.labels.length) this.raise(node.start, "Unsyntactic " + keyword);
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
	if (this.options.ecmaVersion >= 6) this.eat(types$1.semi);
	else this.semicolon();
	return this.finishNode(node, "DoWhileStatement");
};
pp$8.parseForStatement = function(node) {
	this.next();
	var awaitAt = this.options.ecmaVersion >= 9 && this.canAwait && this.eatContextual("await") ? this.lastTokStart : -1;
	this.labels.push(loopLabel);
	this.enterScope(0);
	this.expect(types$1.parenL);
	if (this.type === types$1.semi) {
		if (awaitAt > -1) this.unexpected(awaitAt);
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
		if (usingKind === "await using") this.next();
		this.parseVar(init$2, true, usingKind);
		this.finishNode(init$2, "VariableDeclaration");
		return this.parseForAfterInit(node, init$2, awaitAt);
	}
	var containsEsc = this.containsEsc;
	var refDestructuringErrors = new DestructuringErrors();
	var initPos = this.start;
	var init = awaitAt > -1 ? this.parseExprSubscripts(refDestructuringErrors, "await") : this.parseExpression(true, refDestructuringErrors);
	if (this.type === types$1._in || (isForOf = this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
		if (awaitAt > -1) {
			if (this.type === types$1._in) this.unexpected(awaitAt);
			node.await = true;
		} else if (isForOf && this.options.ecmaVersion >= 8) {
			if (init.start === initPos && !containsEsc && init.type === "Identifier" && init.name === "async") this.unexpected();
			else if (this.options.ecmaVersion >= 9) node.await = false;
		}
		if (startsWithLet && isForOf) this.raise(init.start, "The left-hand side of a for-of loop may not start with 'let'.");
		this.toAssignable(init, false, refDestructuringErrors);
		this.checkLValPattern(init);
		return this.parseForIn(node, init);
	} else this.checkExpressionErrors(refDestructuringErrors, true);
	if (awaitAt > -1) this.unexpected(awaitAt);
	return this.parseFor(node, init);
};
pp$8.parseForAfterInit = function(node, init, awaitAt) {
	if ((this.type === types$1._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) && init.declarations.length === 1) {
		if (this.options.ecmaVersion >= 9) {
			if (this.type === types$1._in) {
				if (awaitAt > -1) this.unexpected(awaitAt);
			} else node.await = awaitAt > -1;
		}
		return this.parseForIn(node, init);
	}
	if (awaitAt > -1) this.unexpected(awaitAt);
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
	if (!this.inFunction && !this.options.allowReturnOutsideFunction) this.raise(this.start, "'return' outside of function");
	this.next();
	if (this.eat(types$1.semi) || this.insertSemicolon()) node.argument = null;
	else {
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
	for (var sawDefault = false; this.type !== types$1.braceR;) if (this.type === types$1._case || this.type === types$1._default) {
		var isCase = this.type === types$1._case;
		if (cur) this.finishNode(cur, "SwitchCase");
		node.cases.push(cur = this.startNode());
		cur.consequent = [];
		this.next();
		if (isCase) cur.test = this.parseExpression();
		else {
			if (sawDefault) this.raiseRecoverable(this.lastTokStart, "Multiple default clauses");
			sawDefault = true;
			cur.test = null;
		}
		this.expect(types$1.colon);
	} else {
		if (!cur) this.unexpected();
		cur.consequent.push(this.parseStatement(null));
	}
	this.exitScope();
	if (cur) this.finishNode(cur, "SwitchCase");
	this.next();
	this.labels.pop();
	return this.finishNode(node, "SwitchStatement");
};
pp$8.parseThrowStatement = function(node) {
	this.next();
	if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) this.raise(this.lastTokEnd, "Illegal newline after throw");
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
		if (this.eat(types$1.parenL)) clause.param = this.parseCatchClauseParam();
		else {
			if (this.options.ecmaVersion < 10) this.unexpected();
			clause.param = null;
			this.enterScope(0);
		}
		clause.body = this.parseBlock(false);
		this.exitScope();
		node.handler = this.finishNode(clause, "CatchClause");
	}
	node.finalizer = this.eat(types$1._finally) ? this.parseBlock() : null;
	if (!node.handler && !node.finalizer) this.raise(node.start, "Missing catch or finally clause");
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
	if (this.strict) this.raise(this.start, "'with' in strict mode");
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
	for (var i$1 = 0, list = this.labels; i$1 < list.length; i$1 += 1) if (list[i$1].name === maybeName) this.raise(expr.start, "Label '" + maybeName + "' is already declared");
	var kind = this.type.isLoop ? "loop" : this.type === types$1._switch ? "switch" : null;
	for (var i = this.labels.length - 1; i >= 0; i--) {
		var label$1 = this.labels[i];
		if (label$1.statementStart === node.start) {
			label$1.statementStart = this.start;
			label$1.kind = kind;
		} else break;
	}
	this.labels.push({
		name: maybeName,
		kind,
		statementStart: this.start
	});
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
	if (createNewLexicalScope === void 0) createNewLexicalScope = true;
	if (node === void 0) node = this.startNode();
	node.body = [];
	this.expect(types$1.braceL);
	if (createNewLexicalScope) this.enterScope(0);
	while (this.type !== types$1.braceR) {
		var stmt = this.parseStatement(null);
		node.body.push(stmt);
	}
	if (exitStrict) this.strict = false;
	this.next();
	if (createNewLexicalScope) this.exitScope();
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
	if (init.type === "VariableDeclaration" && init.declarations[0].init != null && (!isForIn || this.options.ecmaVersion < 8 || this.strict || init.kind !== "var" || init.declarations[0].id.type !== "Identifier")) this.raise(init.start, (isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer");
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
	for (;;) {
		var decl = this.startNode();
		this.parseVarId(decl, kind);
		if (this.eat(types$1.eq)) decl.init = this.parseMaybeAssign(isFor);
		else if (!allowMissingInitializer && kind === "const" && !(this.type === types$1._in || this.options.ecmaVersion >= 6 && this.isContextual("of"))) this.unexpected();
		else if (!allowMissingInitializer && (kind === "using" || kind === "await using") && this.options.ecmaVersion >= 17 && this.type !== types$1._in && !this.isContextual("of")) this.raise(this.lastTokEnd, "Missing initializer in " + kind + " declaration");
		else if (!allowMissingInitializer && decl.id.type !== "Identifier" && !(isFor && (this.type === types$1._in || this.isContextual("of")))) this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
		else decl.init = null;
		node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
		if (!this.eat(types$1.comma)) break;
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
		if (this.type === types$1.star && statement & FUNC_HANGING_STATEMENT) this.unexpected();
		node.generator = this.eat(types$1.star);
	}
	if (this.options.ecmaVersion >= 8) node.async = !!isAsync;
	if (statement & FUNC_STATEMENT) {
		node.id = statement & FUNC_NULLABLE_ID && this.type !== types$1.name ? null : this.parseIdent();
		if (node.id && !(statement & FUNC_HANGING_STATEMENT)) this.checkLValSimple(node.id, this.strict || node.generator || node.async ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION);
	}
	var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
	this.yieldPos = 0;
	this.awaitPos = 0;
	this.awaitIdentPos = 0;
	this.enterScope(functionFlags(node.async, node.generator));
	if (!(statement & FUNC_STATEMENT)) node.id = this.type === types$1.name ? this.parseIdent() : null;
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
				if (hadConstructor) this.raiseRecoverable(element.start, "Duplicate constructor in the same class");
				hadConstructor = true;
			} else if (element.key && element.key.type === "PrivateIdentifier" && isPrivateNameConflicted(privateNameMap, element)) this.raiseRecoverable(element.key.start, "Identifier '#" + element.key.name + "' has already been declared");
		}
	}
	this.strict = oldStrict;
	this.next();
	node.body = this.finishNode(classBody, "ClassBody");
	this.exitClassBody();
	return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
};
pp$8.parseClassElement = function(constructorAllowsSuper) {
	if (this.eat(types$1.semi)) return null;
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
		if (this.isClassElementNameStart() || this.type === types$1.star) isStatic = true;
		else keyName = "static";
	}
	node.static = isStatic;
	if (!keyName && ecmaVersion >= 8 && this.eatContextual("async")) {
		if ((this.isClassElementNameStart() || this.type === types$1.star) && !this.canInsertSemicolon()) isAsync = true;
		else keyName = "async";
	}
	if (!keyName && (ecmaVersion >= 9 || !isAsync) && this.eat(types$1.star)) isGenerator = true;
	if (!keyName && !isAsync && !isGenerator) {
		var lastValue = this.value;
		if (this.eatContextual("get") || this.eatContextual("set")) {
			if (this.isClassElementNameStart()) kind = lastValue;
			else keyName = lastValue;
		}
	}
	if (keyName) {
		node.computed = false;
		node.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);
		node.key.name = keyName;
		this.finishNode(node.key, "Identifier");
	} else this.parseClassElementName(node);
	if (ecmaVersion < 13 || this.type === types$1.parenL || kind !== "method" || isGenerator || isAsync) {
		var isConstructor = !node.static && checkKeyName(node, "constructor");
		var allowsDirectSuper = isConstructor && constructorAllowsSuper;
		if (isConstructor && kind !== "method") this.raise(node.key.start, "Constructor can't have get/set modifier");
		node.kind = isConstructor ? "constructor" : kind;
		this.parseClassMethod(node, isGenerator, isAsync, allowsDirectSuper);
	} else this.parseClassField(node);
	return node;
};
pp$8.isClassElementNameStart = function() {
	return this.type === types$1.name || this.type === types$1.privateId || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword;
};
pp$8.parseClassElementName = function(element) {
	if (this.type === types$1.privateId) {
		if (this.value === "constructor") this.raise(this.start, "Classes can't have an element named '#constructor'");
		element.computed = false;
		element.key = this.parsePrivateIdent();
	} else this.parsePropertyName(element);
};
pp$8.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
	var key = method.key;
	if (method.kind === "constructor") {
		if (isGenerator) this.raise(key.start, "Constructor can't be a generator");
		if (isAsync) this.raise(key.start, "Constructor can't be an async method");
	} else if (method.static && checkKeyName(method, "prototype")) this.raise(key.start, "Classes may not have a static property named prototype");
	var value = method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);
	if (method.kind === "get" && value.params.length !== 0) this.raiseRecoverable(value.start, "getter should have no params");
	if (method.kind === "set" && value.params.length !== 1) this.raiseRecoverable(value.start, "setter should have exactly one param");
	if (method.kind === "set" && value.params[0].type === "RestElement") this.raiseRecoverable(value.params[0].start, "Setter cannot use rest params");
	return this.finishNode(method, "MethodDefinition");
};
pp$8.parseClassField = function(field) {
	if (checkKeyName(field, "constructor")) this.raise(field.key.start, "Classes can't have a field named 'constructor'");
	else if (field.static && checkKeyName(field, "prototype")) this.raise(field.key.start, "Classes can't have a static field named 'prototype'");
	if (this.eat(types$1.eq)) {
		this.enterScope(SCOPE_CLASS_FIELD_INIT | SCOPE_SUPER);
		field.value = this.parseMaybeAssign();
		this.exitScope();
	} else field.value = null;
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
		if (isStatement) this.checkLValSimple(node.id, BIND_LEXICAL, false);
	} else {
		if (isStatement === true) this.unexpected();
		node.id = null;
	}
};
pp$8.parseClassSuper = function(node) {
	node.superClass = this.eat(types$1._extends) ? this.parseExprSubscripts(null, false) : null;
};
pp$8.enterClassBody = function() {
	var element = {
		declared: Object.create(null),
		used: []
	};
	this.privateNameStack.push(element);
	return element.declared;
};
pp$8.exitClassBody = function() {
	var ref = this.privateNameStack.pop();
	var declared = ref.declared;
	var used = ref.used;
	if (!this.options.checkPrivateFields) return;
	var len = this.privateNameStack.length;
	var parent = len === 0 ? null : this.privateNameStack[len - 1];
	for (var i = 0; i < used.length; ++i) {
		var id = used[i];
		if (!hasOwn$1(declared, id.name)) {
			if (parent) parent.used.push(id);
			else this.raiseRecoverable(id.start, "Private field '#" + id.name + "' must be declared in an enclosing class");
		}
	}
};
function isPrivateNameConflicted(privateNameMap, element) {
	var name = element.key.name;
	var curr = privateNameMap[name];
	var next = "true";
	if (element.type === "MethodDefinition" && (element.kind === "get" || element.kind === "set")) next = (element.static ? "s" : "i") + element.kind;
	if (curr === "iget" && next === "iset" || curr === "iset" && next === "iget" || curr === "sget" && next === "sset" || curr === "sset" && next === "sget") {
		privateNameMap[name] = "true";
		return false;
	} else if (!curr) {
		privateNameMap[name] = next;
		return false;
	} else return true;
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
		} else node.exported = null;
	}
	this.expectContextual("from");
	if (this.type !== types$1.string) this.unexpected();
	node.source = this.parseExprAtom();
	if (this.options.ecmaVersion >= 16) node.attributes = this.parseWithClause();
	this.semicolon();
	return this.finishNode(node, "ExportAllDeclaration");
};
pp$8.parseExport = function(node, exports) {
	this.next();
	if (this.eat(types$1.star)) return this.parseExportAllDeclaration(node, exports);
	if (this.eat(types$1._default)) {
		this.checkExport(exports, "default", this.lastTokStart);
		node.declaration = this.parseExportDefaultDeclaration();
		return this.finishNode(node, "ExportDefaultDeclaration");
	}
	if (this.shouldParseExportStatement()) {
		node.declaration = this.parseExportDeclaration(node);
		if (node.declaration.type === "VariableDeclaration") this.checkVariableExport(exports, node.declaration.declarations);
		else this.checkExport(exports, node.declaration.id, node.declaration.id.start);
		node.specifiers = [];
		node.source = null;
		if (this.options.ecmaVersion >= 16) node.attributes = [];
	} else {
		node.declaration = null;
		node.specifiers = this.parseExportSpecifiers(exports);
		if (this.eatContextual("from")) {
			if (this.type !== types$1.string) this.unexpected();
			node.source = this.parseExprAtom();
			if (this.options.ecmaVersion >= 16) node.attributes = this.parseWithClause();
		} else {
			for (var i = 0, list = node.specifiers; i < list.length; i += 1) {
				var spec = list[i];
				this.checkUnreserved(spec.local);
				this.checkLocalExport(spec.local);
				if (spec.local.type === "Literal") this.raise(spec.local.start, "A string literal cannot be used as an exported binding without `from`.");
			}
			node.source = null;
			if (this.options.ecmaVersion >= 16) node.attributes = [];
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
		if (isAsync) this.next();
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
	if (!exports) return;
	if (typeof name !== "string") name = name.type === "Identifier" ? name.name : name.value;
	if (hasOwn$1(exports, name)) this.raiseRecoverable(pos, "Duplicate export '" + name + "'");
	exports[name] = true;
};
pp$8.checkPatternExport = function(exports, pat) {
	var type = pat.type;
	if (type === "Identifier") this.checkExport(exports, pat, pat.start);
	else if (type === "ObjectPattern") for (var i = 0, list = pat.properties; i < list.length; i += 1) {
		var prop = list[i];
		this.checkPatternExport(exports, prop);
	}
	else if (type === "ArrayPattern") for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
		var elt = list$1[i$1];
		if (elt) this.checkPatternExport(exports, elt);
	}
	else if (type === "Property") this.checkPatternExport(exports, pat.value);
	else if (type === "AssignmentPattern") this.checkPatternExport(exports, pat.left);
	else if (type === "RestElement") this.checkPatternExport(exports, pat.argument);
};
pp$8.checkVariableExport = function(exports, decls) {
	if (!exports) return;
	for (var i = 0, list = decls; i < list.length; i += 1) {
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
			if (this.afterTrailingComma(types$1.braceR)) break;
		} else first = false;
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
	if (this.options.ecmaVersion >= 16) node.attributes = this.parseWithClause();
	this.semicolon();
	return this.finishNode(node, "ImportDeclaration");
};
pp$8.parseImportSpecifier = function() {
	var node = this.startNode();
	node.imported = this.parseModuleExportName();
	if (this.eatContextual("as")) node.local = this.parseIdent();
	else {
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
		if (!this.eat(types$1.comma)) return nodes;
	}
	if (this.type === types$1.star) {
		nodes.push(this.parseImportNamespaceSpecifier());
		return nodes;
	}
	this.expect(types$1.braceL);
	while (!this.eat(types$1.braceR)) {
		if (!first) {
			this.expect(types$1.comma);
			if (this.afterTrailingComma(types$1.braceR)) break;
		} else first = false;
		nodes.push(this.parseImportSpecifier());
	}
	return nodes;
};
pp$8.parseWithClause = function() {
	var nodes = [];
	if (!this.eat(types$1._with)) return nodes;
	this.expect(types$1.braceL);
	var attributeKeys = {};
	var first = true;
	while (!this.eat(types$1.braceR)) {
		if (!first) {
			this.expect(types$1.comma);
			if (this.afterTrailingComma(types$1.braceR)) break;
		} else first = false;
		var attr = this.parseImportAttribute();
		var keyName = attr.key.type === "Identifier" ? attr.key.name : attr.key.value;
		if (hasOwn$1(attributeKeys, keyName)) this.raiseRecoverable(attr.key.start, "Duplicate attribute key '" + keyName + "'");
		attributeKeys[keyName] = true;
		nodes.push(attr);
	}
	return nodes;
};
pp$8.parseImportAttribute = function() {
	var node = this.startNode();
	node.key = this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
	this.expect(types$1.colon);
	if (this.type !== types$1.string) this.unexpected();
	node.value = this.parseExprAtom();
	return this.finishNode(node, "ImportAttribute");
};
pp$8.parseModuleExportName = function() {
	if (this.options.ecmaVersion >= 13 && this.type === types$1.string) {
		var stringLiteral = this.parseLiteral(this.value);
		if (loneSurrogate.test(stringLiteral.value)) this.raise(stringLiteral.start, "An export name cannot include a lone surrogate.");
		return stringLiteral;
	}
	return this.parseIdent(true);
};
pp$8.adaptDirectivePrologue = function(statements) {
	for (var i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) statements[i].directive = statements[i].expression.raw.slice(1, -1);
};
pp$8.isDirectiveCandidate = function(statement) {
	return this.options.ecmaVersion >= 5 && statement.type === "ExpressionStatement" && statement.expression.type === "Literal" && typeof statement.expression.value === "string" && (this.input[statement.start] === "\"" || this.input[statement.start] === "'");
};
var pp$7 = Parser.prototype;
pp$7.toAssignable = function(node, isBinding, refDestructuringErrors) {
	if (this.options.ecmaVersion >= 6 && node) switch (node.type) {
		case "Identifier":
			if (this.inAsync && node.name === "await") this.raise(node.start, "Cannot use 'await' as identifier inside an async function");
			break;
		case "ObjectPattern":
		case "ArrayPattern":
		case "AssignmentPattern":
		case "RestElement": break;
		case "ObjectExpression":
			node.type = "ObjectPattern";
			if (refDestructuringErrors) this.checkPatternErrors(refDestructuringErrors, true);
			for (var i = 0, list = node.properties; i < list.length; i += 1) {
				var prop = list[i];
				this.toAssignable(prop, isBinding);
				if (prop.type === "RestElement" && (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")) this.raise(prop.argument.start, "Unexpected token");
			}
			break;
		case "Property":
			if (node.kind !== "init") this.raise(node.key.start, "Object pattern can't contain getter or setter");
			this.toAssignable(node.value, isBinding);
			break;
		case "ArrayExpression":
			node.type = "ArrayPattern";
			if (refDestructuringErrors) this.checkPatternErrors(refDestructuringErrors, true);
			this.toAssignableList(node.elements, isBinding);
			break;
		case "SpreadElement":
			node.type = "RestElement";
			this.toAssignable(node.argument, isBinding);
			if (node.argument.type === "AssignmentPattern") this.raise(node.argument.start, "Rest elements cannot have a default value");
			break;
		case "AssignmentExpression":
			if (node.operator !== "=") this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
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
		case "MemberExpression": if (!isBinding) break;
		default: this.raise(node.start, "Assigning to rvalue");
	}
	else if (refDestructuringErrors) this.checkPatternErrors(refDestructuringErrors, true);
	return node;
};
pp$7.toAssignableList = function(exprList, isBinding) {
	var end = exprList.length;
	for (var i = 0; i < end; i++) {
		var elt = exprList[i];
		if (elt) this.toAssignable(elt, isBinding);
	}
	if (end) {
		var last = exprList[end - 1];
		if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier") this.unexpected(last.argument.start);
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
	if (this.options.ecmaVersion === 6 && this.type !== types$1.name) this.unexpected();
	node.argument = this.parseBindingAtom();
	return this.finishNode(node, "RestElement");
};
pp$7.parseBindingAtom = function() {
	if (this.options.ecmaVersion >= 6) switch (this.type) {
		case types$1.bracketL:
			var node = this.startNode();
			this.next();
			node.elements = this.parseBindingList(types$1.bracketR, true, true);
			return this.finishNode(node, "ArrayPattern");
		case types$1.braceL: return this.parseObj(true);
	}
	return this.parseIdent();
};
pp$7.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowModifiers) {
	var elts = [], first = true;
	while (!this.eat(close)) {
		if (first) first = false;
		else this.expect(types$1.comma);
		if (allowEmpty && this.type === types$1.comma) elts.push(null);
		else if (allowTrailingComma && this.afterTrailingComma(close)) break;
		else if (this.type === types$1.ellipsis) {
			var rest = this.parseRestBinding();
			this.parseBindingListItem(rest);
			elts.push(rest);
			if (this.type === types$1.comma) this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
			this.expect(close);
			break;
		} else elts.push(this.parseAssignableListItem(allowModifiers));
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
	if (this.options.ecmaVersion < 6 || !this.eat(types$1.eq)) return left;
	var node = this.startNodeAt(startPos, startLoc);
	node.left = left;
	node.right = this.parseMaybeAssign();
	return this.finishNode(node, "AssignmentPattern");
};
pp$7.checkLValSimple = function(expr, bindingType, checkClashes) {
	if (bindingType === void 0) bindingType = BIND_NONE;
	var isBind = bindingType !== BIND_NONE;
	switch (expr.type) {
		case "Identifier":
			if (this.strict && this.reservedWordsStrictBind.test(expr.name)) this.raiseRecoverable(expr.start, (isBind ? "Binding " : "Assigning to ") + expr.name + " in strict mode");
			if (isBind) {
				if (bindingType === BIND_LEXICAL && expr.name === "let") this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name");
				if (checkClashes) {
					if (hasOwn$1(checkClashes, expr.name)) this.raiseRecoverable(expr.start, "Argument name clash");
					checkClashes[expr.name] = true;
				}
				if (bindingType !== BIND_OUTSIDE) this.declareName(expr.name, bindingType, expr.start);
			}
			break;
		case "ChainExpression":
			this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
			break;
		case "MemberExpression":
			if (isBind) this.raiseRecoverable(expr.start, "Binding member expression");
			break;
		case "ParenthesizedExpression":
			if (isBind) this.raiseRecoverable(expr.start, "Binding parenthesized expression");
			return this.checkLValSimple(expr.expression, bindingType, checkClashes);
		default: this.raise(expr.start, (isBind ? "Binding" : "Assigning to") + " rvalue");
	}
};
pp$7.checkLValPattern = function(expr, bindingType, checkClashes) {
	if (bindingType === void 0) bindingType = BIND_NONE;
	switch (expr.type) {
		case "ObjectPattern":
			for (var i = 0, list = expr.properties; i < list.length; i += 1) {
				var prop = list[i];
				this.checkLValInnerPattern(prop, bindingType, checkClashes);
			}
			break;
		case "ArrayPattern":
			for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
				var elem = list$1[i$1];
				if (elem) this.checkLValInnerPattern(elem, bindingType, checkClashes);
			}
			break;
		default: this.checkLValSimple(expr, bindingType, checkClashes);
	}
};
pp$7.checkLValInnerPattern = function(expr, bindingType, checkClashes) {
	if (bindingType === void 0) bindingType = BIND_NONE;
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
		default: this.checkLValPattern(expr, bindingType, checkClashes);
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
	if (parent === types.f_expr || parent === types.f_stat) return true;
	if (prevType === types$1.colon && (parent === types.b_stat || parent === types.b_expr)) return !parent.isExpr;
	if (prevType === types$1._return || prevType === types$1.name && this.exprAllowed) return lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
	if (prevType === types$1._else || prevType === types$1.semi || prevType === types$1.eof || prevType === types$1.parenR || prevType === types$1.arrow) return true;
	if (prevType === types$1.braceL) return parent === types.b_stat;
	if (prevType === types$1._var || prevType === types$1._const || prevType === types$1.name) return false;
	return !this.exprAllowed;
};
pp$6.inGeneratorContext = function() {
	for (var i = this.context.length - 1; i >= 1; i--) {
		var context = this.context[i];
		if (context.token === "function") return context.generator;
	}
	return false;
};
pp$6.updateContext = function(prevType) {
	var update, type = this.type;
	if (type.keyword && prevType === types$1.dot) this.exprAllowed = false;
	else if (update = type.updateContext) update.call(this, prevType);
	else this.exprAllowed = type.beforeExpr;
};
pp$6.overrideContext = function(tokenCtx) {
	if (this.curContext() !== tokenCtx) this.context[this.context.length - 1] = tokenCtx;
};
types$1.parenR.updateContext = types$1.braceR.updateContext = function() {
	if (this.context.length === 1) {
		this.exprAllowed = true;
		return;
	}
	var out = this.context.pop();
	if (out === types.b_stat && this.curContext().token === "function") out = this.context.pop();
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
	if (prevType.beforeExpr && prevType !== types$1._else && !(prevType === types$1.semi && this.curContext() !== types.p_stat) && !(prevType === types$1._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) && !((prevType === types$1.colon || prevType === types$1.braceL) && this.curContext() === types.b_stat)) this.context.push(types.f_expr);
	else this.context.push(types.f_stat);
	this.exprAllowed = false;
};
types$1.colon.updateContext = function() {
	if (this.curContext().token === "function") this.context.pop();
	this.exprAllowed = true;
};
types$1.backQuote.updateContext = function() {
	if (this.curContext() === types.q_tmpl) this.context.pop();
	else this.context.push(types.q_tmpl);
	this.exprAllowed = false;
};
types$1.star.updateContext = function(prevType) {
	if (prevType === types$1._function) {
		var index = this.context.length - 1;
		if (this.context[index] === types.f_expr) this.context[index] = types.f_expr_gen;
		else this.context[index] = types.f_gen;
	}
	this.exprAllowed = true;
};
types$1.name.updateContext = function(prevType) {
	var allowed = false;
	if (this.options.ecmaVersion >= 6 && prevType !== types$1.dot) {
		if (this.value === "of" && !this.exprAllowed || this.value === "yield" && this.inGeneratorContext()) allowed = true;
	}
	this.exprAllowed = allowed;
};
var pp$5 = Parser.prototype;
pp$5.checkPropClash = function(prop, propHash, refDestructuringErrors) {
	if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement") return;
	if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand)) return;
	var key = prop.key;
	var name;
	switch (key.type) {
		case "Identifier":
			name = key.name;
			break;
		case "Literal":
			name = String(key.value);
			break;
		default: return;
	}
	var kind = prop.kind;
	if (this.options.ecmaVersion >= 6) {
		if (name === "__proto__" && kind === "init") {
			if (propHash.proto) {
				if (refDestructuringErrors) {
					if (refDestructuringErrors.doubleProto < 0) refDestructuringErrors.doubleProto = key.start;
				} else this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
			}
			propHash.proto = true;
		}
		return;
	}
	name = "$" + name;
	var other = propHash[name];
	if (other) {
		var redefinition;
		if (kind === "init") redefinition = this.strict && other.init || other.get || other.set;
		else redefinition = other.init || other[kind];
		if (redefinition) this.raiseRecoverable(key.start, "Redefinition of property");
	} else other = propHash[name] = {
		init: false,
		get: false,
		set: false
	};
	other[kind] = true;
};
pp$5.parseExpression = function(forInit, refDestructuringErrors) {
	var startPos = this.start, startLoc = this.startLoc;
	var expr = this.parseMaybeAssign(forInit, refDestructuringErrors);
	if (this.type === types$1.comma) {
		var node = this.startNodeAt(startPos, startLoc);
		node.expressions = [expr];
		while (this.eat(types$1.comma)) node.expressions.push(this.parseMaybeAssign(forInit, refDestructuringErrors));
		return this.finishNode(node, "SequenceExpression");
	}
	return expr;
};
pp$5.parseMaybeAssign = function(forInit, refDestructuringErrors, afterLeftParse) {
	if (this.isContextual("yield")) {
		if (this.inGenerator) return this.parseYield(forInit);
		else this.exprAllowed = false;
	}
	var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldDoubleProto = -1;
	if (refDestructuringErrors) {
		oldParenAssign = refDestructuringErrors.parenthesizedAssign;
		oldTrailingComma = refDestructuringErrors.trailingComma;
		oldDoubleProto = refDestructuringErrors.doubleProto;
		refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
	} else {
		refDestructuringErrors = new DestructuringErrors();
		ownDestructuringErrors = true;
	}
	var startPos = this.start, startLoc = this.startLoc;
	if (this.type === types$1.parenL || this.type === types$1.name) {
		this.potentialArrowAt = this.start;
		this.potentialArrowInForAwait = forInit === "await";
	}
	var left = this.parseMaybeConditional(forInit, refDestructuringErrors);
	if (afterLeftParse) left = afterLeftParse.call(this, left, startPos, startLoc);
	if (this.type.isAssign) {
		var node = this.startNodeAt(startPos, startLoc);
		node.operator = this.value;
		if (this.type === types$1.eq) left = this.toAssignable(left, false, refDestructuringErrors);
		if (!ownDestructuringErrors) refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1;
		if (refDestructuringErrors.shorthandAssign >= left.start) refDestructuringErrors.shorthandAssign = -1;
		if (this.type === types$1.eq) this.checkLValPattern(left);
		else this.checkLValSimple(left);
		node.left = left;
		this.next();
		node.right = this.parseMaybeAssign(forInit);
		if (oldDoubleProto > -1) refDestructuringErrors.doubleProto = oldDoubleProto;
		return this.finishNode(node, "AssignmentExpression");
	} else if (ownDestructuringErrors) this.checkExpressionErrors(refDestructuringErrors, true);
	if (oldParenAssign > -1) refDestructuringErrors.parenthesizedAssign = oldParenAssign;
	if (oldTrailingComma > -1) refDestructuringErrors.trailingComma = oldTrailingComma;
	return left;
};
pp$5.parseMaybeConditional = function(forInit, refDestructuringErrors) {
	var startPos = this.start, startLoc = this.startLoc;
	var expr = this.parseExprOps(forInit, refDestructuringErrors);
	if (this.checkExpressionErrors(refDestructuringErrors)) return expr;
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
	if (this.checkExpressionErrors(refDestructuringErrors)) return expr;
	return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, forInit);
};
pp$5.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, forInit) {
	var prec = this.type.binop;
	if (prec != null && (!forInit || this.type !== types$1._in)) {
		if (prec > minPrec) {
			var logical = this.type === types$1.logicalOR || this.type === types$1.logicalAND;
			var coalesce = this.type === types$1.coalesce;
			if (coalesce) prec = types$1.logicalAND.binop;
			var op = this.value;
			this.next();
			var startPos = this.start, startLoc = this.startLoc;
			var right = this.parseExprOp(this.parseMaybeUnary(null, false, false, forInit), startPos, startLoc, prec, forInit);
			var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);
			if (logical && this.type === types$1.coalesce || coalesce && (this.type === types$1.logicalOR || this.type === types$1.logicalAND)) this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
			return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, forInit);
		}
	}
	return left;
};
pp$5.buildBinary = function(startPos, startLoc, left, right, op, logical) {
	if (right.type === "PrivateIdentifier") this.raise(right.start, "Private identifier can only be left side of binary expression");
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
		if (update) this.checkLValSimple(node.argument);
		else if (this.strict && node.operator === "delete" && isLocalVariableAccess(node.argument)) this.raiseRecoverable(node.start, "Deleting local variable in strict mode");
		else if (node.operator === "delete" && isPrivateFieldAccess(node.argument)) this.raiseRecoverable(node.start, "Private fields can not be deleted");
		else sawUnary = true;
		expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
	} else if (!sawUnary && this.type === types$1.privateId) {
		if ((forInit || this.privateNameStack.length === 0) && this.options.checkPrivateFields) this.unexpected();
		expr = this.parsePrivateIdent();
		if (this.type !== types$1._in) this.unexpected();
	} else {
		expr = this.parseExprSubscripts(refDestructuringErrors, forInit);
		if (this.checkExpressionErrors(refDestructuringErrors)) return expr;
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
		if (sawUnary) this.unexpected(this.lastTokStart);
		else return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false, false, forInit), "**", false);
	} else return expr;
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
	if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")") return expr;
	var result = this.parseSubscripts(expr, startPos, startLoc, false, forInit);
	if (refDestructuringErrors && result.type === "MemberExpression") {
		if (refDestructuringErrors.parenthesizedAssign >= result.start) refDestructuringErrors.parenthesizedAssign = -1;
		if (refDestructuringErrors.parenthesizedBind >= result.start) refDestructuringErrors.parenthesizedBind = -1;
		if (refDestructuringErrors.trailingComma >= result.start) refDestructuringErrors.trailingComma = -1;
	}
	return result;
};
pp$5.parseSubscripts = function(base, startPos, startLoc, noCalls, forInit) {
	var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" && this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 && this.potentialArrowAt === base.start;
	var optionalChained = false;
	while (true) {
		var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit);
		if (element.optional) optionalChained = true;
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
	if (noCalls && optional) this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions");
	var computed = this.eat(types$1.bracketL);
	if (computed || optional && this.type !== types$1.parenL && this.type !== types$1.backQuote || this.eat(types$1.dot)) {
		var node = this.startNodeAt(startPos, startLoc);
		node.object = base;
		if (computed) {
			node.property = this.parseExpression();
			this.expect(types$1.bracketR);
		} else if (this.type === types$1.privateId && base.type !== "Super") node.property = this.parsePrivateIdent();
		else node.property = this.parseIdent(this.options.allowReserved !== "never");
		node.computed = !!computed;
		if (optionalSupported) node.optional = optional;
		base = this.finishNode(node, "MemberExpression");
	} else if (!noCalls && this.eat(types$1.parenL)) {
		var refDestructuringErrors = new DestructuringErrors(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
		this.yieldPos = 0;
		this.awaitPos = 0;
		this.awaitIdentPos = 0;
		var exprList = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
		if (maybeAsyncArrow && !optional && this.shouldParseAsyncArrow()) {
			this.checkPatternErrors(refDestructuringErrors, false);
			this.checkYieldAwaitInDefaultParams();
			if (this.awaitIdentPos > 0) this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function");
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
		if (optionalSupported) node$1.optional = optional;
		base = this.finishNode(node$1, "CallExpression");
	} else if (this.type === types$1.backQuote) {
		if (optional || optionalChained) this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
		var node$2 = this.startNodeAt(startPos, startLoc);
		node$2.tag = base;
		node$2.quasi = this.parseTemplate({ isTagged: true });
		base = this.finishNode(node$2, "TaggedTemplateExpression");
	}
	return base;
};
pp$5.parseExprAtom = function(refDestructuringErrors, forInit, forNew) {
	if (this.type === types$1.slash) this.readRegexp();
	var node, canBeArrow = this.potentialArrowAt === this.start;
	switch (this.type) {
		case types$1._super:
			if (!this.allowSuper) this.raise(this.start, "'super' keyword outside a method");
			node = this.startNode();
			this.next();
			if (this.type === types$1.parenL && !this.allowDirectSuper) this.raise(node.start, "super() call outside constructor of a subclass");
			if (this.type !== types$1.dot && this.type !== types$1.bracketL && this.type !== types$1.parenL) this.unexpected();
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
				if (this.eat(types$1.arrow)) return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false, forInit);
				if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types$1.name && !containsEsc && (!this.potentialArrowInForAwait || this.value !== "of" || this.containsEsc)) {
					id = this.parseIdent(false);
					if (this.canInsertSemicolon() || !this.eat(types$1.arrow)) this.unexpected();
					return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true, forInit);
				}
			}
			return id;
		case types$1.regexp:
			var value = this.value;
			node = this.parseLiteral(value.value);
			node.regex = {
				pattern: value.pattern,
				flags: value.flags
			};
			return node;
		case types$1.num:
		case types$1.string: return this.parseLiteral(this.value);
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
				if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr)) refDestructuringErrors.parenthesizedAssign = start;
				if (refDestructuringErrors.parenthesizedBind < 0) refDestructuringErrors.parenthesizedBind = start;
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
		case types$1._class: return this.parseClass(this.startNode(), false);
		case types$1._new: return this.parseNew();
		case types$1.backQuote: return this.parseTemplate();
		case types$1._import: if (this.options.ecmaVersion >= 11) return this.parseExprImport(forNew);
		else return this.unexpected();
		default: return this.parseExprAtomDefault();
	}
};
pp$5.parseExprAtomDefault = function() {
	this.unexpected();
};
pp$5.parseExprImport = function(forNew) {
	var node = this.startNode();
	if (this.containsEsc) this.raiseRecoverable(this.start, "Escape sequence in keyword import");
	this.next();
	if (this.type === types$1.parenL && !forNew) return this.parseDynamicImport(node);
	else if (this.type === types$1.dot) {
		var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
		meta.name = "import";
		node.meta = this.finishNode(meta, "Identifier");
		return this.parseImportMeta(node);
	} else this.unexpected();
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
					if (!this.afterTrailingComma(types$1.parenR)) this.unexpected();
				}
			} else node.options = null;
		} else node.options = null;
	} else if (!this.eat(types$1.parenR)) {
		var errorPos = this.start;
		if (this.eat(types$1.comma) && this.eat(types$1.parenR)) this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import\u0028)");
		else this.unexpected(errorPos);
	}
	return this.finishNode(node, "ImportExpression");
};
pp$5.parseImportMeta = function(node) {
	this.next();
	var containsEsc = this.containsEsc;
	node.property = this.parseIdent(true);
	if (node.property.name !== "meta") this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'");
	if (containsEsc) this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters");
	if (this.options.sourceType !== "module" && !this.options.allowImportExportEverywhere) this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module");
	return this.finishNode(node, "MetaProperty");
};
pp$5.parseLiteral = function(value) {
	var node = this.startNode();
	node.value = value;
	node.raw = this.input.slice(this.start, this.end);
	if (node.raw.charCodeAt(node.raw.length - 1) === 110) node.bigint = node.value != null ? node.value.toString() : node.raw.slice(0, -1).replace(/_/g, "");
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
		var refDestructuringErrors = new DestructuringErrors(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
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
				if (this.type === types$1.comma) this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
				break;
			} else exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
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
		if (!exprList.length || lastIsComma) this.unexpected(this.lastTokStart);
		if (spreadStart) this.unexpected(spreadStart);
		this.checkExpressionErrors(refDestructuringErrors, true);
		this.yieldPos = oldYieldPos || this.yieldPos;
		this.awaitPos = oldAwaitPos || this.awaitPos;
		if (exprList.length > 1) {
			val = this.startNodeAt(innerStartPos, innerStartLoc);
			val.expressions = exprList;
			this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
		} else val = exprList[0];
	} else val = this.parseParenExpression();
	if (this.options.preserveParens) {
		var par = this.startNodeAt(startPos, startLoc);
		par.expression = val;
		return this.finishNode(par, "ParenthesizedExpression");
	} else return val;
};
pp$5.parseParenItem = function(item) {
	return item;
};
pp$5.parseParenArrowList = function(startPos, startLoc, exprList, forInit) {
	return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, false, forInit);
};
var empty = [];
pp$5.parseNew = function() {
	if (this.containsEsc) this.raiseRecoverable(this.start, "Escape sequence in keyword new");
	var node = this.startNode();
	this.next();
	if (this.options.ecmaVersion >= 6 && this.type === types$1.dot) {
		var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
		meta.name = "new";
		node.meta = this.finishNode(meta, "Identifier");
		this.next();
		var containsEsc = this.containsEsc;
		node.property = this.parseIdent(true);
		if (node.property.name !== "target") this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'");
		if (containsEsc) this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters");
		if (!this.allowNewDotTarget) this.raiseRecoverable(node.start, "'new.target' can only be used in functions and class static block");
		return this.finishNode(node, "MetaProperty");
	}
	var startPos = this.start, startLoc = this.startLoc;
	node.callee = this.parseSubscripts(this.parseExprAtom(null, false, true), startPos, startLoc, true, false);
	if (this.eat(types$1.parenL)) node.arguments = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false);
	else node.arguments = empty;
	return this.finishNode(node, "NewExpression");
};
pp$5.parseTemplateElement = function(ref) {
	var isTagged = ref.isTagged;
	var elem = this.startNode();
	if (this.type === types$1.invalidTemplate) {
		if (!isTagged) this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
		elem.value = {
			raw: this.value.replace(/\r\n?/g, "\n"),
			cooked: null
		};
	} else elem.value = {
		raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
		cooked: this.value
	};
	this.next();
	elem.tail = this.type === types$1.backQuote;
	return this.finishNode(elem, "TemplateElement");
};
pp$5.parseTemplate = function(ref) {
	if (ref === void 0) ref = {};
	var isTagged = ref.isTagged;
	if (isTagged === void 0) isTagged = false;
	var node = this.startNode();
	this.next();
	node.expressions = [];
	var curElt = this.parseTemplateElement({ isTagged });
	node.quasis = [curElt];
	while (!curElt.tail) {
		if (this.type === types$1.eof) this.raise(this.pos, "Unterminated template literal");
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
			if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types$1.braceR)) break;
		} else first = false;
		var prop = this.parseProperty(isPattern, refDestructuringErrors);
		if (!isPattern) this.checkPropClash(prop, propHash, refDestructuringErrors);
		node.properties.push(prop);
	}
	return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
};
pp$5.parseProperty = function(isPattern, refDestructuringErrors) {
	var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
	if (this.options.ecmaVersion >= 9 && this.eat(types$1.ellipsis)) {
		if (isPattern) {
			prop.argument = this.parseIdent(false);
			if (this.type === types$1.comma) this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
			return this.finishNode(prop, "RestElement");
		}
		prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
		if (this.type === types$1.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) refDestructuringErrors.trailingComma = this.start;
		return this.finishNode(prop, "SpreadElement");
	}
	if (this.options.ecmaVersion >= 6) {
		prop.method = false;
		prop.shorthand = false;
		if (isPattern || refDestructuringErrors) {
			startPos = this.start;
			startLoc = this.startLoc;
		}
		if (!isPattern) isGenerator = this.eat(types$1.star);
	}
	var containsEsc = this.containsEsc;
	this.parsePropertyName(prop);
	if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
		isAsync = true;
		isGenerator = this.options.ecmaVersion >= 9 && this.eat(types$1.star);
		this.parsePropertyName(prop);
	} else isAsync = false;
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
		if (prop.kind === "get") this.raiseRecoverable(start, "getter should have no params");
		else this.raiseRecoverable(start, "setter should have exactly one param");
	} else if (prop.kind === "set" && prop.value.params[0].type === "RestElement") this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params");
};
pp$5.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
	if ((isGenerator || isAsync) && this.type === types$1.colon) this.unexpected();
	if (this.eat(types$1.colon)) {
		prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
		prop.kind = "init";
	} else if (this.options.ecmaVersion >= 6 && this.type === types$1.parenL) {
		if (isPattern) this.unexpected();
		prop.method = true;
		prop.value = this.parseMethod(isGenerator, isAsync);
		prop.kind = "init";
	} else if (!isPattern && !containsEsc && this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set") && this.type !== types$1.comma && this.type !== types$1.braceR && this.type !== types$1.eq) {
		if (isGenerator || isAsync) this.unexpected();
		this.parseGetterSetter(prop);
	} else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
		if (isGenerator || isAsync) this.unexpected();
		this.checkUnreserved(prop.key);
		if (prop.key.name === "await" && !this.awaitIdentPos) this.awaitIdentPos = startPos;
		if (isPattern) prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
		else if (this.type === types$1.eq && refDestructuringErrors) {
			if (refDestructuringErrors.shorthandAssign < 0) refDestructuringErrors.shorthandAssign = this.start;
			prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
		} else prop.value = this.copyNode(prop.key);
		prop.kind = "init";
		prop.shorthand = true;
	} else this.unexpected();
};
pp$5.parsePropertyName = function(prop) {
	if (this.options.ecmaVersion >= 6) {
		if (this.eat(types$1.bracketL)) {
			prop.computed = true;
			prop.key = this.parseMaybeAssign();
			this.expect(types$1.bracketR);
			return prop.key;
		} else prop.computed = false;
	}
	return prop.key = this.type === types$1.num || this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
};
pp$5.initFunction = function(node) {
	node.id = null;
	if (this.options.ecmaVersion >= 6) node.generator = node.expression = false;
	if (this.options.ecmaVersion >= 8) node.async = false;
};
pp$5.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
	var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
	this.initFunction(node);
	if (this.options.ecmaVersion >= 6) node.generator = isGenerator;
	if (this.options.ecmaVersion >= 8) node.async = !!isAsync;
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
	if (this.options.ecmaVersion >= 8) node.async = !!isAsync;
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
			if (useStrict && nonSimple) this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list");
		}
		var oldLabels = this.labels;
		this.labels = [];
		if (useStrict) this.strict = true;
		this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
		if (this.strict && node.id) this.checkLValSimple(node.id, BIND_OUTSIDE);
		node.body = this.parseBlock(false, void 0, useStrict && !oldStrict);
		node.expression = false;
		this.adaptDirectivePrologue(node.body.body);
		this.labels = oldLabels;
	}
	this.exitScope();
};
pp$5.isSimpleParamList = function(params) {
	for (var i = 0, list = params; i < list.length; i += 1) if (list[i].type !== "Identifier") return false;
	return true;
};
pp$5.checkParams = function(node, allowDuplicates) {
	var nameHash = Object.create(null);
	for (var i = 0, list = node.params; i < list.length; i += 1) {
		var param = list[i];
		this.checkLValInnerPattern(param, BIND_VAR, allowDuplicates ? null : nameHash);
	}
};
pp$5.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
	var elts = [], first = true;
	while (!this.eat(close)) {
		if (!first) {
			this.expect(types$1.comma);
			if (allowTrailingComma && this.afterTrailingComma(close)) break;
		} else first = false;
		var elt = void 0;
		if (allowEmpty && this.type === types$1.comma) elt = null;
		else if (this.type === types$1.ellipsis) {
			elt = this.parseSpread(refDestructuringErrors);
			if (refDestructuringErrors && this.type === types$1.comma && refDestructuringErrors.trailingComma < 0) refDestructuringErrors.trailingComma = this.start;
		} else elt = this.parseMaybeAssign(false, refDestructuringErrors);
		elts.push(elt);
	}
	return elts;
};
pp$5.checkUnreserved = function(ref) {
	var start = ref.start;
	var end = ref.end;
	var name = ref.name;
	if (this.inGenerator && name === "yield") this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator");
	if (this.inAsync && name === "await") this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function");
	if (!(this.currentThisScope().flags & SCOPE_VAR) && name === "arguments") this.raiseRecoverable(start, "Cannot use 'arguments' in class field initializer");
	if (this.inClassStaticBlock && (name === "arguments" || name === "await")) this.raise(start, "Cannot use " + name + " in class static initialization block");
	if (this.keywords.test(name)) this.raise(start, "Unexpected keyword '" + name + "'");
	if (this.options.ecmaVersion < 6 && this.input.slice(start, end).indexOf("\\") !== -1) return;
	if ((this.strict ? this.reservedWordsStrict : this.reservedWords).test(name)) {
		if (!this.inAsync && name === "await") this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function");
		this.raiseRecoverable(start, "The keyword '" + name + "' is reserved");
	}
};
pp$5.parseIdent = function(liberal) {
	var node = this.parseIdentNode();
	this.next(!!liberal);
	this.finishNode(node, "Identifier");
	if (!liberal) {
		this.checkUnreserved(node);
		if (node.name === "await" && !this.awaitIdentPos) this.awaitIdentPos = node.start;
	}
	return node;
};
pp$5.parseIdentNode = function() {
	var node = this.startNode();
	if (this.type === types$1.name) node.name = this.value;
	else if (this.type.keyword) {
		node.name = this.type.keyword;
		if ((node.name === "class" || node.name === "function") && (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) this.context.pop();
		this.type = types$1.name;
	} else this.unexpected();
	return node;
};
pp$5.parsePrivateIdent = function() {
	var node = this.startNode();
	if (this.type === types$1.privateId) node.name = this.value;
	else this.unexpected();
	this.next();
	this.finishNode(node, "PrivateIdentifier");
	if (this.options.checkPrivateFields) {
		if (this.privateNameStack.length === 0) this.raise(node.start, "Private field '#" + node.name + "' must be declared in an enclosing class");
		else this.privateNameStack[this.privateNameStack.length - 1].used.push(node);
	}
	return node;
};
pp$5.parseYield = function(forInit) {
	if (!this.yieldPos) this.yieldPos = this.start;
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
	if (!this.awaitPos) this.awaitPos = this.start;
	var node = this.startNode();
	this.next();
	node.argument = this.parseMaybeUnary(null, true, false, forInit);
	return this.finishNode(node, "AwaitExpression");
};
var pp$4 = Parser.prototype;
pp$4.raise = function(pos, message) {
	var loc = getLineInfo(this.input, pos);
	message += " (" + loc.line + ":" + loc.column + ")";
	if (this.sourceFile) message += " in " + this.sourceFile;
	var err = new SyntaxError(message);
	err.pos = pos;
	err.loc = loc;
	err.raisedAt = this.pos;
	throw err;
};
pp$4.raiseRecoverable = pp$4.raise;
pp$4.curPosition = function() {
	if (this.options.locations) return new Position(this.curLine, this.pos - this.lineStart);
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
		if (this.inModule && scope.flags & SCOPE_TOP) delete this.undefinedExports[name];
	} else if (bindingType === BIND_SIMPLE_CATCH) this.currentScope().lexical.push(name);
	else if (bindingType === BIND_FUNCTION) {
		var scope$2 = this.currentScope();
		if (this.treatFunctionsAsVar) redeclared = scope$2.lexical.indexOf(name) > -1;
		else redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1;
		scope$2.functions.push(name);
	} else for (var i = this.scopeStack.length - 1; i >= 0; --i) {
		var scope$3 = this.scopeStack[i];
		if (scope$3.lexical.indexOf(name) > -1 && !(scope$3.flags & SCOPE_SIMPLE_CATCH && scope$3.lexical[0] === name) || !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
			redeclared = true;
			break;
		}
		scope$3.var.push(name);
		if (this.inModule && scope$3.flags & SCOPE_TOP) delete this.undefinedExports[name];
		if (scope$3.flags & SCOPE_VAR) break;
	}
	if (redeclared) this.raiseRecoverable(pos, "Identifier '" + name + "' has already been declared");
};
pp$3.checkLocalExport = function(id) {
	if (this.scopeStack[0].lexical.indexOf(id.name) === -1 && this.scopeStack[0].var.indexOf(id.name) === -1) this.undefinedExports[id.name] = id;
};
pp$3.currentScope = function() {
	return this.scopeStack[this.scopeStack.length - 1];
};
pp$3.currentVarScope = function() {
	for (var i = this.scopeStack.length - 1;; i--) {
		var scope = this.scopeStack[i];
		if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK)) return scope;
	}
};
pp$3.currentThisScope = function() {
	for (var i = this.scopeStack.length - 1;; i--) {
		var scope = this.scopeStack[i];
		if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK) && !(scope.flags & SCOPE_ARROW)) return scope;
	}
};
var Node = function Node(parser, pos, loc) {
	this.type = "";
	this.start = pos;
	this.end = 0;
	if (parser.options.locations) this.loc = new SourceLocation(parser, loc);
	if (parser.options.directSourceFile) this.sourceFile = parser.options.directSourceFile;
	if (parser.options.ranges) this.range = [pos, 0];
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
	if (this.options.locations) node.loc.end = loc;
	if (this.options.ranges) node.range[1] = pos;
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
	for (var prop in node) newNode[prop] = node[prop];
	return newNode;
};
var scriptValuesAddedInUnicode = "Gara Garay Gukh Gurung_Khema Hrkt Katakana_Or_Hiragana Kawi Kirat_Rai Krai Nag_Mundari Nagm Ol_Onal Onao Sunu Sunuwar Todhri Todr Tulu_Tigalari Tutg Unknown Zzzz";
var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
var ecma11BinaryProperties = ecma10BinaryProperties;
var ecma12BinaryProperties = ecma11BinaryProperties + " EBase EComp EMod EPres ExtPict";
var ecma13BinaryProperties = ecma12BinaryProperties;
var unicodeBinaryProperties = {
	9: ecma9BinaryProperties,
	10: ecma10BinaryProperties,
	11: ecma11BinaryProperties,
	12: ecma12BinaryProperties,
	13: ecma13BinaryProperties,
	14: ecma13BinaryProperties
};
var unicodeBinaryPropertiesOfStrings = {
	9: "",
	10: "",
	11: "",
	12: "",
	13: "",
	14: "Basic_Emoji Emoji_Keycap_Sequence RGI_Emoji_Modifier_Sequence RGI_Emoji_Flag_Sequence RGI_Emoji_Tag_Sequence RGI_Emoji_ZWJ_Sequence RGI_Emoji"
};
var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";
var ecma9ScriptValues = "Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
var ecma12ScriptValues = ecma11ScriptValues + " Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi";
var ecma13ScriptValues = ecma12ScriptValues + " Cypro_Minoan Cpmn Old_Uyghur Ougr Tangsa Tnsa Toto Vithkuqi Vith";
var unicodeScriptValues = {
	9: ecma9ScriptValues,
	10: ecma10ScriptValues,
	11: ecma11ScriptValues,
	12: ecma12ScriptValues,
	13: ecma13ScriptValues,
	14: ecma13ScriptValues + " " + scriptValuesAddedInUnicode
};
var data$1 = {};
function buildUnicodeData(ecmaVersion) {
	var d = data$1[ecmaVersion] = {
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
for (var i = 0, list = [
	9,
	10,
	11,
	12,
	13,
	14
]; i < list.length; i += 1) {
	var ecmaVersion = list[i];
	buildUnicodeData(ecmaVersion);
}
var pp$1 = Parser.prototype;
var BranchID = function BranchID(parent, base) {
	this.parent = parent;
	this.base = base || this;
};
BranchID.prototype.separatedFrom = function separatedFrom(alt) {
	for (var self = this; self; self = self.parent) for (var other = alt; other; other = other.parent) if (self.base === other.base && self !== other) return true;
	return false;
};
BranchID.prototype.sibling = function sibling() {
	return new BranchID(this.parent, this.base);
};
var RegExpValidationState = function RegExpValidationState(parser) {
	this.parser = parser;
	this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "") + (parser.options.ecmaVersion >= 13 ? "d" : "") + (parser.options.ecmaVersion >= 15 ? "v" : "");
	this.unicodeProperties = data$1[parser.options.ecmaVersion >= 14 ? 14 : parser.options.ecmaVersion];
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
	if (forceU === void 0) forceU = false;
	var s = this.source;
	var l = s.length;
	if (i >= l) return -1;
	var c = s.charCodeAt(i);
	if (!(forceU || this.switchU) || c <= 55295 || c >= 57344 || i + 1 >= l) return c;
	var next = s.charCodeAt(i + 1);
	return next >= 56320 && next <= 57343 ? (c << 10) + next - 56613888 : c;
};
RegExpValidationState.prototype.nextIndex = function nextIndex(i, forceU) {
	if (forceU === void 0) forceU = false;
	var s = this.source;
	var l = s.length;
	if (i >= l) return l;
	var c = s.charCodeAt(i), next;
	if (!(forceU || this.switchU) || c <= 55295 || c >= 57344 || i + 1 >= l || (next = s.charCodeAt(i + 1)) < 56320 || next > 57343) return i + 1;
	return i + 2;
};
RegExpValidationState.prototype.current = function current(forceU) {
	if (forceU === void 0) forceU = false;
	return this.at(this.pos, forceU);
};
RegExpValidationState.prototype.lookahead = function lookahead(forceU) {
	if (forceU === void 0) forceU = false;
	return this.at(this.nextIndex(this.pos, forceU), forceU);
};
RegExpValidationState.prototype.advance = function advance(forceU) {
	if (forceU === void 0) forceU = false;
	this.pos = this.nextIndex(this.pos, forceU);
};
RegExpValidationState.prototype.eat = function eat(ch, forceU) {
	if (forceU === void 0) forceU = false;
	if (this.current(forceU) === ch) {
		this.advance(forceU);
		return true;
	}
	return false;
};
RegExpValidationState.prototype.eatChars = function eatChars(chs, forceU) {
	if (forceU === void 0) forceU = false;
	var pos = this.pos;
	for (var i = 0, list = chs; i < list.length; i += 1) {
		var ch = list[i];
		var current = this.at(pos, forceU);
		if (current === -1 || current !== ch) return false;
		pos = this.nextIndex(pos, forceU);
	}
	this.pos = pos;
	return true;
};
/**
* Validate the flags part of a given RegExpLiteral.
*
* @param {RegExpValidationState} state The state to validate RegExp.
* @returns {void}
*/
pp$1.validateRegExpFlags = function(state) {
	var validFlags = state.validFlags;
	var flags = state.flags;
	var u = false;
	var v = false;
	for (var i = 0; i < flags.length; i++) {
		var flag = flags.charAt(i);
		if (validFlags.indexOf(flag) === -1) this.raise(state.start, "Invalid regular expression flag");
		if (flags.indexOf(flag, i + 1) > -1) this.raise(state.start, "Duplicate regular expression flag");
		if (flag === "u") u = true;
		if (flag === "v") v = true;
	}
	if (this.options.ecmaVersion >= 15 && u && v) this.raise(state.start, "Invalid regular expression flag");
};
function hasProp(obj) {
	for (var _ in obj) return true;
	return false;
}
/**
* Validate the pattern part of a given RegExpLiteral.
*
* @param {RegExpValidationState} state The state to validate RegExp.
* @returns {void}
*/
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
		if (state.eat(41)) state.raise("Unmatched ')'");
		if (state.eat(93) || state.eat(125)) state.raise("Lone quantifier brackets");
	}
	if (state.maxBackReference > state.numCapturingParens) state.raise("Invalid escape");
	for (var i = 0, list = state.backReferenceNames; i < list.length; i += 1) {
		var name = list[i];
		if (!state.groupNames[name]) state.raise("Invalid named capture referenced");
	}
};
pp$1.regexp_disjunction = function(state) {
	var trackDisjunction = this.options.ecmaVersion >= 16;
	if (trackDisjunction) state.branchID = new BranchID(state.branchID, null);
	this.regexp_alternative(state);
	while (state.eat(124)) {
		if (trackDisjunction) state.branchID = state.branchID.sibling();
		this.regexp_alternative(state);
	}
	if (trackDisjunction) state.branchID = state.branchID.parent;
	if (this.regexp_eatQuantifier(state, true)) state.raise("Nothing to repeat");
	if (state.eat(123)) state.raise("Lone quantifier brackets");
};
pp$1.regexp_alternative = function(state) {
	while (state.pos < state.source.length && this.regexp_eatTerm(state));
};
pp$1.regexp_eatTerm = function(state) {
	if (this.regexp_eatAssertion(state)) {
		if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
			if (state.switchU) state.raise("Invalid quantifier");
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
	if (state.eat(94) || state.eat(36)) return true;
	if (state.eat(92)) {
		if (state.eat(66) || state.eat(98)) return true;
		state.pos = start;
	}
	if (state.eat(40) && state.eat(63)) {
		var lookbehind = false;
		if (this.options.ecmaVersion >= 9) lookbehind = state.eat(60);
		if (state.eat(61) || state.eat(33)) {
			this.regexp_disjunction(state);
			if (!state.eat(41)) state.raise("Unterminated group");
			state.lastAssertionIsQuantifiable = !lookbehind;
			return true;
		}
	}
	state.pos = start;
	return false;
};
pp$1.regexp_eatQuantifier = function(state, noError) {
	if (noError === void 0) noError = false;
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
			if (state.eat(44) && this.regexp_eatDecimalDigits(state)) max = state.lastIntValue;
			if (state.eat(125)) {
				if (max !== -1 && max < min && !noError) state.raise("numbers out of order in {} quantifier");
				return true;
			}
		}
		if (state.switchU && !noError) state.raise("Incomplete quantifier");
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
		if (this.regexp_eatAtomEscape(state)) return true;
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
					for (var i = 0; i < addModifiers.length; i++) {
						var modifier = addModifiers.charAt(i);
						if (addModifiers.indexOf(modifier, i + 1) > -1) state.raise("Duplicate regular expression modifiers");
					}
					if (hasHyphen) {
						var removeModifiers = this.regexp_eatModifiers(state);
						if (!addModifiers && !removeModifiers && state.current() === 58) state.raise("Invalid regular expression modifiers");
						for (var i$1 = 0; i$1 < removeModifiers.length; i$1++) {
							var modifier$1 = removeModifiers.charAt(i$1);
							if (removeModifiers.indexOf(modifier$1, i$1 + 1) > -1 || addModifiers.indexOf(modifier$1) > -1) state.raise("Duplicate regular expression modifiers");
						}
					}
				}
			}
			if (state.eat(58)) {
				this.regexp_disjunction(state);
				if (state.eat(41)) return true;
				state.raise("Unterminated group");
			}
		}
		state.pos = start;
	}
	return false;
};
pp$1.regexp_eatCapturingGroup = function(state) {
	if (state.eat(40)) {
		if (this.options.ecmaVersion >= 9) this.regexp_groupSpecifier(state);
		else if (state.current() === 63) state.raise("Invalid group");
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
	if (this.regexp_eatBracedQuantifier(state, true)) state.raise("Nothing to repeat");
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
	while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) state.advance();
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
		if (!this.regexp_eatGroupName(state)) state.raise("Invalid group");
		var trackDisjunction = this.options.ecmaVersion >= 16;
		var known = state.groupNames[state.lastStringValue];
		if (known) {
			if (trackDisjunction) {
				for (var i = 0, list = known; i < list.length; i += 1) if (!list[i].separatedFrom(state.branchID)) state.raise("Duplicate capture group name");
			} else state.raise("Duplicate capture group name");
		}
		if (trackDisjunction) (known || (state.groupNames[state.lastStringValue] = [])).push(state.branchID);
		else state.groupNames[state.lastStringValue] = true;
	}
};
pp$1.regexp_eatGroupName = function(state) {
	state.lastStringValue = "";
	if (state.eat(60)) {
		if (this.regexp_eatRegExpIdentifierName(state) && state.eat(62)) return true;
		state.raise("Invalid capture group name");
	}
	return false;
};
pp$1.regexp_eatRegExpIdentifierName = function(state) {
	state.lastStringValue = "";
	if (this.regexp_eatRegExpIdentifierStart(state)) {
		state.lastStringValue += codePointToString(state.lastIntValue);
		while (this.regexp_eatRegExpIdentifierPart(state)) state.lastStringValue += codePointToString(state.lastIntValue);
		return true;
	}
	return false;
};
pp$1.regexp_eatRegExpIdentifierStart = function(state) {
	var start = state.pos;
	var forceU = this.options.ecmaVersion >= 11;
	var ch = state.current(forceU);
	state.advance(forceU);
	if (ch === 92 && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) ch = state.lastIntValue;
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
	if (ch === 92 && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) ch = state.lastIntValue;
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
	if (this.regexp_eatBackReference(state) || this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state) || state.switchN && this.regexp_eatKGroupName(state)) return true;
	if (state.switchU) {
		if (state.current() === 99) state.raise("Invalid unicode escape");
		state.raise("Invalid escape");
	}
	return false;
};
pp$1.regexp_eatBackReference = function(state) {
	var start = state.pos;
	if (this.regexp_eatDecimalEscape(state)) {
		var n = state.lastIntValue;
		if (state.switchU) {
			if (n > state.maxBackReference) state.maxBackReference = n;
			return true;
		}
		if (n <= state.numCapturingParens) return true;
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
		if (this.regexp_eatControlLetter(state)) return true;
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
	if (forceU === void 0) forceU = false;
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
		if (switchU && state.eat(123) && this.regexp_eatHexDigits(state) && state.eat(125) && isValidUnicode(state.lastIntValue)) return true;
		if (switchU) state.raise("Invalid unicode escape");
		state.pos = start;
	}
	return false;
};
function isValidUnicode(ch) {
	return ch >= 0 && ch <= 1114111;
}
pp$1.regexp_eatIdentityEscape = function(state) {
	if (state.switchU) {
		if (this.regexp_eatSyntaxCharacter(state)) return true;
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
			if (negate && result === CharSetString) state.raise("Invalid property name");
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
	if (!hasOwn$1(state.unicodeProperties.nonBinary, name)) state.raise("Invalid property name");
	if (!state.unicodeProperties.nonBinary[name].test(value)) state.raise("Invalid property value");
};
pp$1.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
	if (state.unicodeProperties.binary.test(nameOrValue)) return CharSetOk;
	if (state.switchV && state.unicodeProperties.binaryOfStrings.test(nameOrValue)) return CharSetString;
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
		if (!state.eat(93)) state.raise("Unterminated character class");
		if (negate && result === CharSetString) state.raise("Negated character class may contain strings");
		return true;
	}
	return false;
};
pp$1.regexp_classContents = function(state) {
	if (state.current() === 93) return CharSetOk;
	if (state.switchV) return this.regexp_classSetExpression(state);
	this.regexp_nonEmptyClassRanges(state);
	return CharSetOk;
};
pp$1.regexp_nonEmptyClassRanges = function(state) {
	while (this.regexp_eatClassAtom(state)) {
		var left = state.lastIntValue;
		if (state.eat(45) && this.regexp_eatClassAtom(state)) {
			var right = state.lastIntValue;
			if (state.switchU && (left === -1 || right === -1)) state.raise("Invalid character class");
			if (left !== -1 && right !== -1 && left > right) state.raise("Range out of order in character class");
		}
	}
};
pp$1.regexp_eatClassAtom = function(state) {
	var start = state.pos;
	if (state.eat(92)) {
		if (this.regexp_eatClassEscape(state)) return true;
		if (state.switchU) {
			var ch$1 = state.current();
			if (ch$1 === 99 || isOctalDigit(ch$1)) state.raise("Invalid class escape");
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
		if (this.regexp_eatClassControlLetter(state)) return true;
		state.pos = start;
	}
	return this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state);
};
pp$1.regexp_classSetExpression = function(state) {
	var result = CharSetOk, subResult;
	if (this.regexp_eatClassSetRange(state));
	else if (subResult = this.regexp_eatClassSetOperand(state)) {
		if (subResult === CharSetString) result = CharSetString;
		var start = state.pos;
		while (state.eatChars([38, 38])) {
			if (state.current() !== 38 && (subResult = this.regexp_eatClassSetOperand(state))) {
				if (subResult !== CharSetString) result = CharSetOk;
				continue;
			}
			state.raise("Invalid character in character class");
		}
		if (start !== state.pos) return result;
		while (state.eatChars([45, 45])) {
			if (this.regexp_eatClassSetOperand(state)) continue;
			state.raise("Invalid character in character class");
		}
		if (start !== state.pos) return result;
	} else state.raise("Invalid character in character class");
	for (;;) {
		if (this.regexp_eatClassSetRange(state)) continue;
		subResult = this.regexp_eatClassSetOperand(state);
		if (!subResult) return result;
		if (subResult === CharSetString) result = CharSetString;
	}
};
pp$1.regexp_eatClassSetRange = function(state) {
	var start = state.pos;
	if (this.regexp_eatClassSetCharacter(state)) {
		var left = state.lastIntValue;
		if (state.eat(45) && this.regexp_eatClassSetCharacter(state)) {
			var right = state.lastIntValue;
			if (left !== -1 && right !== -1 && left > right) state.raise("Range out of order in character class");
			return true;
		}
		state.pos = start;
	}
	return false;
};
pp$1.regexp_eatClassSetOperand = function(state) {
	if (this.regexp_eatClassSetCharacter(state)) return CharSetOk;
	return this.regexp_eatClassStringDisjunction(state) || this.regexp_eatNestedClass(state);
};
pp$1.regexp_eatNestedClass = function(state) {
	var start = state.pos;
	if (state.eat(91)) {
		var negate = state.eat(94);
		var result = this.regexp_classContents(state);
		if (state.eat(93)) {
			if (negate && result === CharSetString) state.raise("Negated character class may contain strings");
			return result;
		}
		state.pos = start;
	}
	if (state.eat(92)) {
		var result$1 = this.regexp_eatCharacterClassEscape(state);
		if (result$1) return result$1;
		state.pos = start;
	}
	return null;
};
pp$1.regexp_eatClassStringDisjunction = function(state) {
	var start = state.pos;
	if (state.eatChars([92, 113])) {
		if (state.eat(123)) {
			var result = this.regexp_classStringDisjunctionContents(state);
			if (state.eat(125)) return result;
		} else state.raise("Invalid escape");
		state.pos = start;
	}
	return null;
};
pp$1.regexp_classStringDisjunctionContents = function(state) {
	var result = this.regexp_classString(state);
	while (state.eat(124)) if (this.regexp_classString(state) === CharSetString) result = CharSetString;
	return result;
};
pp$1.regexp_classString = function(state) {
	var count = 0;
	while (this.regexp_eatClassSetCharacter(state)) count++;
	return count === 1 ? CharSetOk : CharSetString;
};
pp$1.regexp_eatClassSetCharacter = function(state) {
	var start = state.pos;
	if (state.eat(92)) {
		if (this.regexp_eatCharacterEscape(state) || this.regexp_eatClassSetReservedPunctuator(state)) return true;
		if (state.eat(98)) {
			state.lastIntValue = 8;
			return true;
		}
		state.pos = start;
		return false;
	}
	var ch = state.current();
	if (ch < 0 || ch === state.lookahead() && isClassSetReservedDoublePunctuatorCharacter(ch)) return false;
	if (isClassSetSyntaxCharacter(ch)) return false;
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
		if (this.regexp_eatFixedHexDigits(state, 2)) return true;
		if (state.switchU) state.raise("Invalid escape");
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
	if (ch >= 65 && ch <= 70) return 10 + (ch - 65);
	if (ch >= 97 && ch <= 102) return 10 + (ch - 97);
	return ch - 48;
}
pp$1.regexp_eatLegacyOctalEscapeSequence = function(state) {
	if (this.regexp_eatOctalDigit(state)) {
		var n1 = state.lastIntValue;
		if (this.regexp_eatOctalDigit(state)) {
			var n2 = state.lastIntValue;
			if (n1 <= 3 && this.regexp_eatOctalDigit(state)) state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
			else state.lastIntValue = n1 * 8 + n2;
		} else state.lastIntValue = n1;
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
	for (var i = 0; i < length; ++i) {
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
	if (p.options.locations) this.loc = new SourceLocation(p, p.startLoc, p.endLoc);
	if (p.options.ranges) this.range = [p.start, p.end];
};
var pp = Parser.prototype;
pp.next = function(ignoreEscapeSequenceInKeyword) {
	if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc) this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword);
	if (this.options.onToken) this.options.onToken(new Token(this));
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
if (typeof Symbol !== "undefined") pp[Symbol.iterator] = function() {
	var this$1$1 = this;
	return { next: function() {
		var token = this$1$1.getToken();
		return {
			done: token.type === types$1.eof,
			value: token
		};
	} };
};
pp.nextToken = function() {
	var curContext = this.curContext();
	if (!curContext || !curContext.preserveSpace) this.skipSpace();
	this.start = this.pos;
	if (this.options.locations) this.startLoc = this.curPosition();
	if (this.pos >= this.input.length) return this.finishToken(types$1.eof);
	if (curContext.override) return curContext.override(this);
	else this.readToken(this.fullCharCodeAtPos());
};
pp.readToken = function(code) {
	if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92) return this.readWord();
	return this.getTokenFromCode(code);
};
pp.fullCharCodeAtPos = function() {
	var code = this.input.charCodeAt(this.pos);
	if (code <= 55295 || code >= 56320) return code;
	var next = this.input.charCodeAt(this.pos + 1);
	return next <= 56319 || next >= 57344 ? code : (code << 10) + next - 56613888;
};
pp.skipBlockComment = function() {
	var startLoc = this.options.onComment && this.curPosition();
	var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
	if (end === -1) this.raise(this.pos - 2, "Unterminated comment");
	this.pos = end + 2;
	if (this.options.locations) for (var nextBreak = void 0, pos = start; (nextBreak = nextLineBreak(this.input, pos, this.pos)) > -1;) {
		++this.curLine;
		pos = this.lineStart = nextBreak;
	}
	if (this.options.onComment) this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos, startLoc, this.curPosition());
};
pp.skipLineComment = function(startSkip) {
	var start = this.pos;
	var startLoc = this.options.onComment && this.curPosition();
	var ch = this.input.charCodeAt(this.pos += startSkip);
	while (this.pos < this.input.length && !isNewLine(ch)) ch = this.input.charCodeAt(++this.pos);
	if (this.options.onComment) this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos, startLoc, this.curPosition());
};
pp.skipSpace = function() {
	loop: while (this.pos < this.input.length) {
		var ch = this.input.charCodeAt(this.pos);
		switch (ch) {
			case 32:
			case 160:
				++this.pos;
				break;
			case 13: if (this.input.charCodeAt(this.pos + 1) === 10) ++this.pos;
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
					default: break loop;
				}
				break;
			default: if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) ++this.pos;
			else break loop;
		}
	}
};
pp.finishToken = function(type, val) {
	this.end = this.pos;
	if (this.options.locations) this.endLoc = this.curPosition();
	var prevType = this.type;
	this.type = type;
	this.value = val;
	this.updateContext(prevType);
};
pp.readToken_dot = function() {
	var next = this.input.charCodeAt(this.pos + 1);
	if (next >= 48 && next <= 57) return this.readNumber(true);
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
	if (next === 61) return this.finishOp(types$1.assign, 2);
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
	if (next === 61) return this.finishOp(types$1.assign, size + 1);
	return this.finishOp(tokentype, size);
};
pp.readToken_pipe_amp = function(code) {
	var next = this.input.charCodeAt(this.pos + 1);
	if (next === code) {
		if (this.options.ecmaVersion >= 12) {
			if (this.input.charCodeAt(this.pos + 2) === 61) return this.finishOp(types$1.assign, 3);
		}
		return this.finishOp(code === 124 ? types$1.logicalOR : types$1.logicalAND, 2);
	}
	if (next === 61) return this.finishOp(types$1.assign, 2);
	return this.finishOp(code === 124 ? types$1.bitwiseOR : types$1.bitwiseAND, 1);
};
pp.readToken_caret = function() {
	if (this.input.charCodeAt(this.pos + 1) === 61) return this.finishOp(types$1.assign, 2);
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
	if (next === 61) return this.finishOp(types$1.assign, 2);
	return this.finishOp(types$1.plusMin, 1);
};
pp.readToken_lt_gt = function(code) {
	var next = this.input.charCodeAt(this.pos + 1);
	var size = 1;
	if (next === code) {
		size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
		if (this.input.charCodeAt(this.pos + size) === 61) return this.finishOp(types$1.assign, size + 1);
		return this.finishOp(types$1.bitShift, size);
	}
	if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 && this.input.charCodeAt(this.pos + 3) === 45) {
		this.skipLineComment(4);
		this.skipSpace();
		return this.nextToken();
	}
	if (next === 61) size = 2;
	return this.finishOp(types$1.relational, size);
};
pp.readToken_eq_excl = function(code) {
	var next = this.input.charCodeAt(this.pos + 1);
	if (next === 61) return this.finishOp(types$1.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2);
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
			if (next2 < 48 || next2 > 57) return this.finishOp(types$1.questionDot, 2);
		}
		if (next === 63) {
			if (ecmaVersion >= 12) {
				if (this.input.charCodeAt(this.pos + 2) === 61) return this.finishOp(types$1.assign, 3);
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
		if (isIdentifierStart(code, true) || code === 92) return this.finishToken(types$1.privateId, this.readWord1());
	}
	this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};
pp.getTokenFromCode = function(code) {
	switch (code) {
		case 46: return this.readToken_dot();
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
			if (this.options.ecmaVersion < 6) break;
			++this.pos;
			return this.finishToken(types$1.backQuote);
		case 48:
			var next = this.input.charCodeAt(this.pos + 1);
			if (next === 120 || next === 88) return this.readRadixNumber(16);
			if (this.options.ecmaVersion >= 6) {
				if (next === 111 || next === 79) return this.readRadixNumber(8);
				if (next === 98 || next === 66) return this.readRadixNumber(2);
			}
		case 49:
		case 50:
		case 51:
		case 52:
		case 53:
		case 54:
		case 55:
		case 56:
		case 57: return this.readNumber(false);
		case 34:
		case 39: return this.readString(code);
		case 47: return this.readToken_slash();
		case 37:
		case 42: return this.readToken_mult_modulo_exp(code);
		case 124:
		case 38: return this.readToken_pipe_amp(code);
		case 94: return this.readToken_caret();
		case 43:
		case 45: return this.readToken_plus_min(code);
		case 60:
		case 62: return this.readToken_lt_gt(code);
		case 61:
		case 33: return this.readToken_eq_excl(code);
		case 63: return this.readToken_question();
		case 126: return this.finishOp(types$1.prefix, 1);
		case 35: return this.readToken_numberSign();
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
	for (;;) {
		if (this.pos >= this.input.length) this.raise(start, "Unterminated regular expression");
		var ch = this.input.charAt(this.pos);
		if (lineBreak.test(ch)) this.raise(start, "Unterminated regular expression");
		if (!escaped) {
			if (ch === "[") inClass = true;
			else if (ch === "]" && inClass) inClass = false;
			else if (ch === "/" && !inClass) break;
			escaped = ch === "\\";
		} else escaped = false;
		++this.pos;
	}
	var pattern = this.input.slice(start, this.pos);
	++this.pos;
	var flagsStart = this.pos;
	var flags = this.readWord1();
	if (this.containsEsc) this.unexpected(flagsStart);
	var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
	state.reset(start, pattern, flags);
	this.validateRegExpFlags(state);
	this.validateRegExpPattern(state);
	var value = null;
	try {
		value = new RegExp(pattern, flags);
	} catch (e) {}
	return this.finishToken(types$1.regexp, {
		pattern,
		flags,
		value
	});
};
pp.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
	var allowSeparators = this.options.ecmaVersion >= 12 && len === void 0;
	var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;
	var start = this.pos, total = 0, lastCode = 0;
	for (var i = 0, e = len == null ? Infinity : len; i < e; ++i, ++this.pos) {
		var code = this.input.charCodeAt(this.pos), val = void 0;
		if (allowSeparators && code === 95) {
			if (isLegacyOctalNumericLiteral) this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals");
			if (lastCode === 95) this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore");
			if (i === 0) this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits");
			lastCode = code;
			continue;
		}
		if (code >= 97) val = code - 97 + 10;
		else if (code >= 65) val = code - 65 + 10;
		else if (code >= 48 && code <= 57) val = code - 48;
		else val = Infinity;
		if (val >= radix) break;
		lastCode = code;
		total = total * radix + val;
	}
	if (allowSeparators && lastCode === 95) this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits");
	if (this.pos === start || len != null && this.pos - start !== len) return null;
	return total;
};
function stringToNumber(str, isLegacyOctalNumericLiteral) {
	if (isLegacyOctalNumericLiteral) return parseInt(str, 8);
	return parseFloat(str.replace(/_/g, ""));
}
function stringToBigInt(str) {
	if (typeof BigInt !== "function") return null;
	return BigInt(str.replace(/_/g, ""));
}
pp.readRadixNumber = function(radix) {
	var start = this.pos;
	this.pos += 2;
	var val = this.readInt(radix);
	if (val == null) this.raise(this.start + 2, "Expected number in radix " + radix);
	if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
		val = stringToBigInt(this.input.slice(start, this.pos));
		++this.pos;
	} else if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number");
	return this.finishToken(types$1.num, val);
};
pp.readNumber = function(startsWithDot) {
	var start = this.pos;
	if (!startsWithDot && this.readInt(10, void 0, true) === null) this.raise(start, "Invalid number");
	var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
	if (octal && this.strict) this.raise(start, "Invalid number");
	var next = this.input.charCodeAt(this.pos);
	if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
		var val$1 = stringToBigInt(this.input.slice(start, this.pos));
		++this.pos;
		if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number");
		return this.finishToken(types$1.num, val$1);
	}
	if (octal && /[89]/.test(this.input.slice(start, this.pos))) octal = false;
	if (next === 46 && !octal) {
		++this.pos;
		this.readInt(10);
		next = this.input.charCodeAt(this.pos);
	}
	if ((next === 69 || next === 101) && !octal) {
		next = this.input.charCodeAt(++this.pos);
		if (next === 43 || next === 45) ++this.pos;
		if (this.readInt(10) === null) this.raise(start, "Invalid number");
	}
	if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number");
	var val = stringToNumber(this.input.slice(start, this.pos), octal);
	return this.finishToken(types$1.num, val);
};
pp.readCodePoint = function() {
	var ch = this.input.charCodeAt(this.pos), code;
	if (ch === 123) {
		if (this.options.ecmaVersion < 6) this.unexpected();
		var codePos = ++this.pos;
		code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
		++this.pos;
		if (code > 1114111) this.invalidStringToken(codePos, "Code point out of bounds");
	} else code = this.readHexChar(4);
	return code;
};
pp.readString = function(quote) {
	var out = "", chunkStart = ++this.pos;
	for (;;) {
		if (this.pos >= this.input.length) this.raise(this.start, "Unterminated string constant");
		var ch = this.input.charCodeAt(this.pos);
		if (ch === quote) break;
		if (ch === 92) {
			out += this.input.slice(chunkStart, this.pos);
			out += this.readEscapedChar(false);
			chunkStart = this.pos;
		} else if (ch === 8232 || ch === 8233) {
			if (this.options.ecmaVersion < 10) this.raise(this.start, "Unterminated string constant");
			++this.pos;
			if (this.options.locations) {
				this.curLine++;
				this.lineStart = this.pos;
			}
		} else {
			if (isNewLine(ch)) this.raise(this.start, "Unterminated string constant");
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
		if (err === INVALID_TEMPLATE_ESCAPE_ERROR) this.readInvalidTemplateToken();
		else throw err;
	}
	this.inTemplateElement = false;
};
pp.invalidStringToken = function(position, message) {
	if (this.inTemplateElement && this.options.ecmaVersion >= 9) throw INVALID_TEMPLATE_ESCAPE_ERROR;
	else this.raise(position, message);
};
pp.readTmplToken = function() {
	var out = "", chunkStart = this.pos;
	for (;;) {
		if (this.pos >= this.input.length) this.raise(this.start, "Unterminated template");
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
				case 13: if (this.input.charCodeAt(this.pos) === 10) ++this.pos;
				case 10:
					out += "\n";
					break;
				default: out += String.fromCharCode(ch);
			}
			if (this.options.locations) {
				++this.curLine;
				this.lineStart = this.pos;
			}
			chunkStart = this.pos;
		} else ++this.pos;
	}
};
pp.readInvalidTemplateToken = function() {
	for (; this.pos < this.input.length; this.pos++) switch (this.input[this.pos]) {
		case "\\":
			++this.pos;
			break;
		case "$": if (this.input[this.pos + 1] !== "{") break;
		case "`": return this.finishToken(types$1.invalidTemplate, this.input.slice(this.start, this.pos));
		case "\r": if (this.input[this.pos + 1] === "\n") ++this.pos;
		case "\n":
		case "\u2028":
		case "\u2029":
			++this.curLine;
			this.lineStart = this.pos + 1;
	}
	this.raise(this.start, "Unterminated template");
};
pp.readEscapedChar = function(inTemplate) {
	var ch = this.input.charCodeAt(++this.pos);
	++this.pos;
	switch (ch) {
		case 110: return "\n";
		case 114: return "\r";
		case 120: return String.fromCharCode(this.readHexChar(2));
		case 117: return codePointToString(this.readCodePoint());
		case 116: return "	";
		case 98: return "\b";
		case 118: return "\v";
		case 102: return "\f";
		case 13: if (this.input.charCodeAt(this.pos) === 10) ++this.pos;
		case 10:
			if (this.options.locations) {
				this.lineStart = this.pos;
				++this.curLine;
			}
			return "";
		case 56:
		case 57:
			if (this.strict) this.invalidStringToken(this.pos - 1, "Invalid escape sequence");
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
				if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) this.invalidStringToken(this.pos - 1 - octalStr.length, inTemplate ? "Octal literal in template string" : "Octal literal in strict mode");
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
	if (n === null) this.invalidStringToken(codePos, "Bad character escape sequence");
	return n;
};
pp.readWord1 = function() {
	this.containsEsc = false;
	var word = "", first = true, chunkStart = this.pos;
	var astral = this.options.ecmaVersion >= 6;
	while (this.pos < this.input.length) {
		var ch = this.fullCharCodeAtPos();
		if (isIdentifierChar(ch, astral)) this.pos += ch <= 65535 ? 1 : 2;
		else if (ch === 92) {
			this.containsEsc = true;
			word += this.input.slice(chunkStart, this.pos);
			var escStart = this.pos;
			if (this.input.charCodeAt(++this.pos) !== 117) this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX");
			++this.pos;
			var esc = this.readCodePoint();
			if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral)) this.invalidStringToken(escStart, "Invalid Unicode escape");
			word += codePointToString(esc);
			chunkStart = this.pos;
		} else break;
		first = false;
	}
	return word + this.input.slice(chunkStart, this.pos);
};
pp.readWord = function() {
	var word = this.readWord1();
	var type = types$1.name;
	if (this.keywords.test(word)) type = keywords[word];
	return this.finishToken(type, word);
};
Parser.acorn = {
	Parser,
	version: "8.15.0",
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
function parse$1(input, options) {
	return Parser.parse(input, options);
}
// node_modules/@opencode/codemode/dist/interpreter/model.js
/** The program call a built-in is running under: where to locate failures born inside it, and how deep the stack is there. */
const CallSite = Reference("codemode/CallSite", { defaultValue: () => ({ depth: 0 }) });
const AsyncIteratorSymbol = Symbol("codemode.async-iterator");
const IteratorSymbol = Symbol("codemode.iterator");
var Throw = class {
	value;
	constructor(value) {
		this.value = value;
	}
};
var GeneratorReturn = class {
	value;
	constructor(value) {
		this.value = value;
	}
};
const OptionalShortCircuit = Symbol("codemode.optional-short-circuit");
/**
* A failure raised by the interpreter or a built-in. It travels as a defect and becomes one program Error object
* the first time a handler observes it, so every observer of the same failure sees the same value.
*/
var PendingThrow = class {
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
		if (node) this.node = node;
	}
};
const failure = (type, kind) => (message, node) => new PendingThrow(type, message, node, kind);
const typeError = failure("TypeError");
const invalidData = failure("TypeError", "InvalidDataValue");
const rangeError = failure("RangeError");
const referenceError = failure("ReferenceError");
const syntaxError = failure("SyntaxError");
const uriError = failure("URIError");
const supportedSyntaxMessage = "This is a restricted JavaScript-like language. Supported: plain and async functions, data literals, destructuring, standard control flow, await and Promise, and built-ins such as Array, Object, Math, JSON, Date, RegExp, Map, Set, and URL. Unsupported: classes, getters/setters, BigInt, and custom Symbols. Use plain functions and data objects instead.";
const unsupportedSyntax = (kind, node) => new PendingThrow("SyntaxError", `Syntax '${kind}' is not supported. ${supportedSyntaxMessage}`, node, "UnsupportedSyntax", [supportedSyntaxMessage]);
const sourceLocation = (node) => ({
	line: node.loc?.start.line ?? 1,
	column: (node.loc?.start.column ?? 0) + 1
});
const formatLocation = (node) => {
	if (!node?.loc) return "";
	const location = sourceLocation(node);
	return ` (line ${location.line}, col ${location.column})`;
};
/** Most promises that may be pending at once. */
const MAX_PENDING_PROMISES = 1e4;
const checkStringLength = (length) => {
	if (length > 16777216) throw rangeError("Invalid string length");
};
const checkArrayLength = (length) => {
	if (length > 1e7) throw rangeError("Invalid array length");
};
// node_modules/@opencode/codemode/dist/tool-error.js
/** Tool failure reported as `ToolFailure`. */
var ToolError = class extends TaggedError()("ToolError", {
	message: String$1,
	cause: optionalKey(Defect())
}) {};
/** Creates a tool failure with an optional underlying cause. */
const toolError = (message, cause) => new ToolError({
	message,
	...cause === void 0 ? {} : { cause }
});
// node_modules/@opencode/codemode/dist/tool-schema.js
const isEffectSchema = (schema) => isSchema(schema);
const renderLiteral = (value) => JSON.stringify(value) ?? "unknown";
const identifierSegment = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const renderKey = (name) => identifierSegment.test(name) ? name : JSON.stringify(name);
const definitionName = (ref) => {
	const tokens = parseUriFragment(ref);
	return tokens?.length === 2 && (tokens[0] === "$defs" || tokens[0] === "definitions") ? tokens[1] : void 0;
};
const effectNumberSentinel = (schema) => schema.type === "string" && Array.isArray(schema.enum) && schema.enum.length > 0 && schema.enum.every((value) => value === "NaN" || value === "Infinity" || value === "-Infinity");
const annotationKeywords = /* @__PURE__ */ new Set([
	"title",
	"description",
	"default",
	"examples",
	"readOnly",
	"writeOnly"
]);
const isEffectEmptyStruct = (schema) => schema.not?.type === "null" && Object.keys(schema.not).length === 1 && Object.keys(schema).every((key) => key === "not" || annotationKeywords.has(key));
const intersection = (members) => {
	const concrete = members.filter((member) => member !== "unknown");
	if (concrete.length === 0) return "unknown";
	if (concrete.length === 1) return concrete[0];
	return concrete.map((member) => member.includes(" | ") ? `(${member})` : member).join(" & ");
};
const MAX_RENDER_DEPTH = 8;
const hasUnresolvedRef = (schema, definitions, seen = /* @__PURE__ */ new Set(), visited = /* @__PURE__ */ new Set()) => {
	if (visited.has(schema)) return false;
	const nextVisited = /* @__PURE__ */ new Set([...visited, schema]);
	if (schema.$ref !== void 0) {
		const name = definitionName(schema.$ref);
		if (name === void 0 || definitions[name] === void 0 || seen.has(name)) return true;
		if (hasUnresolvedRef(definitions[name], definitions, /* @__PURE__ */ new Set([...seen, name]), nextVisited)) return true;
	}
	return [
		...schema.anyOf ?? [],
		...schema.oneOf ?? [],
		...schema.allOf ?? [],
		...Object.values(schema.properties ?? {}),
		...schema.items === void 0 ? [] : [schema.items],
		...typeof schema.additionalProperties === "object" ? [schema.additionalProperties] : []
	].some((item) => hasUnresolvedRef(item, definitions, seen, nextVisited));
};
const docTags = (schema) => {
	const tags = [];
	if (schema.deprecated === true) tags.push("@deprecated");
	if (schema.default !== void 0) try {
		const rendered = JSON.stringify(schema.default);
		if (rendered !== void 0) tags.push(`@default ${rendered}`);
	} catch {}
	if (typeof schema.format === "string") tags.push(`@format ${schema.format}`);
	if (schema.type === "integer") tags.push("@integer");
	if (typeof schema.minimum === "number") tags.push(`@minimum ${schema.minimum}`);
	if (typeof schema.maximum === "number") tags.push(`@maximum ${schema.maximum}`);
	if (typeof schema.exclusiveMinimum === "number") tags.push(`@exclusiveMinimum ${schema.exclusiveMinimum}`);
	if (typeof schema.exclusiveMaximum === "number") tags.push(`@exclusiveMaximum ${schema.exclusiveMaximum}`);
	if (typeof schema.multipleOf === "number") tags.push(`@multipleOf ${schema.multipleOf}`);
	if (typeof schema.minLength === "number") tags.push(`@minLength ${schema.minLength}`);
	if (typeof schema.maxLength === "number") tags.push(`@maxLength ${schema.maxLength}`);
	if (typeof schema.pattern === "string") tags.push(`@pattern ${schema.pattern}`);
	if (typeof schema.minItems === "number") tags.push(`@minItems ${schema.minItems}`);
	if (typeof schema.maxItems === "number") tags.push(`@maxItems ${schema.maxItems}`);
	if (schema.uniqueItems === true) tags.push("@uniqueItems true");
	return tags;
};
const docLines = (schema, width) => {
	const summary = docTags(schema).join(" ");
	const lines = (schema.description ?? "").split("\n").map((line) => line.replace(/\s+$/, ""));
	while (lines.length > 0 && lines[0].trim() === "") lines.shift();
	while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();
	const inline = lines.length === 1 ? `${lines[0]}${lines[0].endsWith(".") ? "" : "."} ${summary}` : summary;
	return summary && lines.length === 1 && !summary.includes("\n") && width + inline.length + 7 <= 120 ? [inline] : [...lines, ...summary ? summary.split("\n") : []];
};
const jsdoc = (schema, pad) => {
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
	if (types.includes("array") && schema.items) append("Each item", schema.items);
	if ((types.includes("object") || schema.properties) && typeof schema.additionalProperties === "object") append(Object.keys(schema.properties ?? {}).length > 0 ? "Each additional value" : "Each value", schema.additionalProperties);
	if (content.length === 0) return "";
	const escaped = content.map((line) => line.replaceAll("*/", "* /"));
	if (escaped.length === 1 && pad.length + escaped[0].length + 7 <= 120) return `${pad}/** ${escaped[0]} */\n`;
	return `${pad}/**\n${escaped.map((line) => `${pad} *${line === "" ? "" : ` ${line}`}`).join("\n")}\n${pad} */\n`;
};
const renderSchema = (schema, ctx, depth = 0, seen = /* @__PURE__ */ new Set()) => {
	if (depth > MAX_RENDER_DEPTH) return "unknown";
	const nested = schema.definitions === void 0 && schema.$defs === void 0 ? ctx : {
		...ctx,
		definitions: {
			...ctx.definitions,
			...schema.definitions ?? {},
			...schema.$defs ?? {}
		}
	};
	if (schema.$ref) {
		const name = definitionName(schema.$ref);
		if (!name || !nested.definitions[name] || seen.has(name)) return "unknown";
		return intersection([renderSchema(nested.definitions[name], nested, depth, /* @__PURE__ */ new Set([...seen, name])), renderSchema({
			...schema,
			$ref: void 0
		}, nested, depth + 1, seen)]);
	}
	if (schema.const !== void 0) return renderLiteral(schema.const);
	if (schema.enum) return schema.enum.map(renderLiteral).join(" | ");
	const alternatives = schema.anyOf ?? schema.oneOf;
	if (alternatives) {
		if (alternatives.some((item) => item.type === "number") && alternatives.every((item) => item.type === "number" || effectNumberSentinel(item))) return "number";
		if (alternatives.length === 2 && alternatives[0]?.type === "object" && alternatives[0].properties === void 0 && alternatives[1]?.type === "array" && alternatives[1].items === void 0) return "{}";
		const members = alternatives.map((item) => renderSchema(item, nested, depth + 1, seen));
		if (members.some((member) => member === "unknown")) return "unknown";
		return intersection([members.join(" | "), renderSchema({
			...schema,
			anyOf: void 0,
			oneOf: void 0
		}, nested, depth + 1, seen)]);
	}
	if (schema.allOf) {
		if (schema.allOf.some((item) => hasUnresolvedRef(item, nested.definitions))) return "unknown";
		const members = schema.allOf.map((item) => renderSchema(item, nested, depth + 1, seen));
		return intersection([renderSchema({
			...schema,
			allOf: void 0
		}, nested, depth + 1, seen), ...members]);
	}
	if (Array.isArray(schema.type)) return schema.type.map((item) => renderSchema({
		...schema,
		type: item
	}, nested, depth + 1, seen)).join(" | ");
	if (schema.type === "string") return "string";
	if (schema.type === "number" || schema.type === "integer") return "number";
	if (schema.type === "boolean") return "boolean";
	if (schema.type === "null") return "null";
	if (schema.type === "array") return `Array<${renderSchema(schema.items ?? {}, nested, depth + 1, seen)}>`;
	if (schema.type === "object" || schema.properties) {
		const required = new Set(schema.required ?? []);
		const properties = Object.entries(schema.properties ?? {});
		const additional = schema.additionalProperties;
		const indexType = additional && typeof additional === "object" ? renderSchema(additional, nested, depth + 1, seen) : void 0;
		const field = ([name, value]) => `${renderKey(name)}${required.has(name) ? "" : "?"}: ${renderSchema(value, nested, depth + 1, seen)}`;
		if (!ctx.pretty) {
			const fields = properties.map(field);
			if (indexType !== void 0) fields.push(`[key: string]: ${indexType}`);
			return fields.length === 0 ? "{}" : `{ ${fields.join("; ")} }`;
		}
		if (properties.length === 0 && indexType === void 0) return "{}";
		const pad = "  ".repeat(depth + 1);
		const lines = properties.map((entry) => `${jsdoc(entry[1], pad)}${pad}${field(entry)},`);
		if (indexType !== void 0) lines.push(`${pad}[key: string]: ${indexType},`);
		return `{\n${lines.join("\n")}\n${"  ".repeat(depth)}}`;
	}
	if (isEffectEmptyStruct(schema)) return "{}";
	return "unknown";
};
const toTypeScript = (schema, decoded = false, pretty = false) => {
	try {
		const document = toJsonSchemaDocument(decoded ? toType(schema) : schema, { onExcessProperty: "error" });
		return renderSchema(document.schema, {
			definitions: document.definitions,
			pretty
		});
	} catch {
		return "unknown";
	}
};
const jsonSchemaToTypeScript = (schema, pretty = false) => {
	try {
		return renderSchema(schema, {
			definitions: {},
			pretty
		});
	} catch {
		return "unknown";
	}
};
const inputProperties = (tool) => {
	try {
		const document = isEffectSchema(tool.input) ? toJsonSchemaDocument(tool.input, { onExcessProperty: "error" }) : {
			schema: tool.input,
			definitions: {
				...tool.input.definitions ?? {},
				...tool.input.$defs ?? {}
			}
		};
		let schema = document.schema;
		if (schema.$ref !== void 0) {
			const name = definitionName(schema.$ref);
			const resolved = name === void 0 ? void 0 : document.definitions[name];
			if (resolved === void 0) return [];
			schema = resolved;
		}
		const required = new Set(schema.required ?? []);
		return Object.entries(schema.properties ?? {}).map(([name, value]) => ({
			name,
			description: typeof value.description === "string" ? value.description : void 0,
			required: required.has(name)
		}));
	} catch {
		return [];
	}
};
const inputTypeScript = (tool, pretty = false) => isEffectSchema(tool.input) ? toTypeScript(tool.input, false, pretty) : jsonSchemaToTypeScript(tool.input, pretty);
const isEmptyInput = (tool) => isEffectSchema(tool.input) ? isEffectEmptyStruct(toJsonSchemaDocument(tool.input, { referencePolicy: () => void 0 }).schema) : inputTypeScript(tool) === "{}";
const outputTypeScript = (tool, pretty = false) => tool.output === void 0 ? "void" : isEffectSchema(tool.output) ? toTypeScript(tool.output, true, pretty) : jsonSchemaToTypeScript(tool.output, pretty);
const decodeInput = (tool, value) => isEffectSchema(tool.input) ? decodeUnknownSync(tool.input)(value) : value;
const decodeOutput = (tool, value) => tool.output === void 0 ? void 0 : isEffectSchema(tool.output) ? decodeUnknownSync(tool.output)(value) : value;
// node_modules/@opencode/codemode/dist/namespace.js
const isNamespace = (value) => Object.hasOwn(value, "_tag") && value._tag === "CodeModeNamespace";
// node_modules/@opencode/codemode/dist/tool.js
const isTool = (value) => value !== void 0 && Object.hasOwn(value, "_tag") && value._tag === "CodeModeTool";
/**
* Declares one schema-described tool available to a CodeMode program through `tools.*`.
*
* Effect Schemas validate values; JSON Schemas only shape the model-visible signature.
* Without `output`, results are exposed as `void`. Hosts remain responsible for authorization
* and durable side effects.
*/
const make$2 = (options) => ({
	_tag: "CodeModeTool",
	description: options.description,
	input: options.input,
	output: options.output,
	execute: (input) => options.execute(input)
});
// node_modules/@opencode/codemode/dist/tool-runtime.js
const compareText = (left, right) => left < right ? -1 : left > right ? 1 : 0;
/** Runs `before`, then `run`, then `after` with how it ended, including when interrupted. */
const hooked = (call, before, after, run) => {
	const observed = after === void 0 ? run : onExit(run, (exit) => {
		if (isSuccess(exit)) return after(call, {
			status: "success",
			value: exit.value
		});
		if (hasInterruptsOnly(exit.cause)) return after(call, { status: "interrupted" });
		return after(call, {
			status: "failure",
			error: squash(exit.cause)
		});
	});
	return before === void 0 ? observed : andThen(before(call), observed);
};
const defaultSearchLimit = 10;
const PositiveInt = Int.check(isGreaterThan(0));
const NonNegativeInt = Int.check(isGreaterThanOrEqualTo(0));
const SearchInput = Struct({
	query: optionalKey(String$1),
	namespace: optionalKey(String$1),
	limit: optionalKey(PositiveInt),
	offset: optionalKey(NonNegativeInt)
});
const SearchOutput = Struct({
	items: ArraySchema(Struct({
		path: String$1,
		description: String$1,
		signature: String$1
	})),
	remaining: NonNegativeInt,
	next: NullOr(Struct({ offset: NonNegativeInt }))
});
const toolExpression = (path) => "tools" + path.split(".").map((segment) => identifierSegment.test(segment) ? `.${segment}` : `[${JSON.stringify(segment)}]`).join("");
var ToolReference = class {
	path;
	constructor(path) {
		this.path = path;
	}
};
const toolTrie = (tools) => {
	const root = { children: /* @__PURE__ */ new Map() };
	const insert = (node, group) => {
		for (const [name, value] of Object.entries(group)) {
			let current = node;
			for (const segment of name.split(".")) {
				if (segment === "") throw new TypeError(`Tool name '${name}' contains an empty segment.`);
				const child = current.children.get(segment) ?? { children: /* @__PURE__ */ new Map() };
				current.children.set(segment, child);
				current = child;
			}
			if (isTool(value)) current.tool = value;
			else if (isNamespace(value)) {
				current.namespace = value;
				insert(current, value.tools);
			} else insert(current, value);
		}
	};
	insert(root, tools);
	return root;
};
const canonicalSegments = (path) => path.flatMap((segment) => segment.split("."));
const flattenTools = (node, path = [], namespaces = []) => {
	const next = node.namespace === void 0 ? namespaces : [...namespaces, node.namespace];
	return [...node.tool === void 0 ? [] : [{
		path: path.join("."),
		tool: node.tool,
		namespaces: next
	}], ...Array.from(node.children).flatMap(([name, child]) => flattenTools(child, [...path, name], next))];
};
const describeTool = (visible) => {
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
const tokenize = (query) => query.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 0 && term !== "*");
const termForms = (term) => {
	const forms = [term];
	if (term.endsWith("es") && term.length > 3) forms.push(term.slice(0, -2));
	if (term.endsWith("s") && term.length > 2) forms.push(term.slice(0, -1));
	return forms;
};
const rank = (entries, query) => {
	const terms = tokenize(query).map(termForms);
	return entries.map((entry) => {
		const path = entry.description.path.toLowerCase();
		const description = entry.description.description.toLowerCase();
		return {
			entry,
			score: terms.reduce((total, forms) => total + (forms.some((form) => path === form || path.endsWith(`.${form}`)) ? 20 : 0) + (forms.some((form) => entry.pathWords.includes(form)) ? 12 : 0) + (forms.some((form) => path.includes(form)) ? 8 : 0) + (forms.some((form) => description.includes(form)) ? 4 : 0) + (forms.some((form) => entry.searchText.includes(form)) ? 2 : 0), 0)
		};
	}).filter(({ score }) => terms.length === 0 || score > 0).sort((left, right) => right.score - left.score || compareText(left.entry.description.path, right.entry.description.path)).map(({ entry }) => entry);
};
const makeSearchTool = (searchIndex) => ({
	_tag: "CodeModeTool",
	description: "Search available tools",
	input: SearchInput,
	output: SearchOutput,
	execute: (input) => sync(() => {
		const request = input;
		const query = request.query ?? "";
		const offset = request.offset ?? 0;
		let ns = request.namespace;
		if (ns !== void 0 && !searchIndex.some((entry) => entry.description.path.startsWith("tools."))) {
			if (ns === "tools") ns = void 0;
			else if (ns.startsWith("tools.")) ns = ns.slice(6);
		}
		const scoped = ns === void 0 ? searchIndex : searchIndex.filter((entry) => entry.description.path === ns || entry.description.path.startsWith(`${ns}.`));
		const trimmed = query.trim();
		const pathQuery = trimmed.startsWith("tools.") ? trimmed.slice(6) : trimmed;
		const exact = pathQuery === "" ? void 0 : scoped.find((entry) => entry.description.path === pathQuery || toolExpression(entry.description.path) === trimmed);
		const ranked = exact !== void 0 ? [exact] : rank(scoped, query);
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
(() => {
	const tool = makeSearchTool([]);
	return `search(${inputTypeScript(tool, true)}): ${outputTypeScript(tool, true)}`;
})();
const toSearchEntry = (visible) => ({
	description: describeTool(visible),
	pathWords: tokenize(visible.path),
	searchText: [
		visible.path,
		visible.tool.description,
		...visible.namespaces.flatMap((namespace) => namespace.description === void 0 ? [] : [namespace.description]),
		...inputProperties(visible.tool).flatMap(({ name, description: property }) => property === void 0 ? [name] : [name, property])
	].join("\n").toLowerCase()
});
const prepare = (tools) => {
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
const lookup = (root, segments) => segments.reduce((node, segment) => node?.children.get(segment), root);
const namespaceKeys = (root, path) => {
	const segments = canonicalSegments(path);
	const node = lookup(root, segments);
	if (node === void 0) throw new ToolRuntimeError("UnknownTool", `Unknown tool namespace '${segments.join(".")}'.`);
	return Array.from(node.children.keys());
};
const resolve = (root, path, index) => {
	const segments = canonicalSegments(path);
	const node = lookup(root, segments);
	if (node === void 0) {
		const name = segments.join(".");
		const ns = segments.length > 1 && root.children.has(segments[0]) ? segments[0] : void 0;
		const closest = rank(ns ? index.filter((entry) => entry.description.path.startsWith(`${ns}.`)) : index, ns ? segments.slice(1).join(" ") : name)[0];
		throw new ToolRuntimeError("UnknownTool", closest ? `Unknown tool '${name}'. Did you mean ${toolExpression(closest.description.path)}?` : `Unknown tool '${name}'.`, ["Use search to find available tools."]);
	}
	if (node.tool === void 0) throw new ToolRuntimeError("UnknownTool", `Tool '${segments.join(".")}' is not callable.`);
	return node.tool;
};
var ToolRuntimeError = class extends Error {
	kind;
	suggestions;
	constructor(kind, message, suggestions = []) {
		super(message);
		this.kind = kind;
		this.suggestions = suggestions;
		this.name = "ToolRuntimeError";
	}
};
/** Per-execution call state over tools prepared once for the runtime. */
const make$1 = (prepared, maxToolCalls, hooks = {}) => {
	const calls = [];
	const root = prepared.root;
	const recordCall = (call) => {
		if (maxToolCalls !== void 0 && calls.length >= maxToolCalls) throw new ToolRuntimeError("ToolCallLimitExceeded", `Execution exceeded its tool-call limit of ${maxToolCalls}.`);
		calls.push(call);
	};
	const executeTool = (name, tool, args) => gen(function* () {
		const normalized = args.length === 0 ? [{}] : args;
		if (normalized.length !== 1) throw new ToolRuntimeError("InvalidToolInput", `Tool '${name}' expects at most one input object.`);
		const input = yield* try_({
			try: () => decodeInput(tool, normalized[0]),
			catch: (cause) => new ToolRuntimeError("InvalidToolInput", `Invalid input for tool '${name}': ${String(cause)}`, name === "search" ? [] : ["The signature may have changed. Use search to get the current signature."])
		});
		yield* sync(() => recordCall({ name }));
		return yield* hooked({
			name,
			input
		}, hooks["tool.before"], hooks["tool.after"], gen(function* () {
			const raw = yield* suspend(() => tool.execute(input)).pipe(catchCause((cause) => {
				if (hasInterruptsOnly(cause)) return interrupt;
				return fail$1(toolError(prettyErrors(cause).map((error) => error.cause ? format$1(error) : error.message || error.name).join("\n")));
			}));
			return yield* try_({
				try: () => {
					const text = JSON.stringify(decodeOutput(tool, raw));
					return text === void 0 ? void 0 : JSON.parse(text);
				},
				catch: (cause) => new ToolRuntimeError("InvalidToolOutput", `Invalid output from tool '${name}': ${cause}`)
			});
		}));
	});
	return {
		calls,
		hooks,
		keys: (path) => namespaceKeys(root, path),
		search: (args) => suspend(() => executeTool("search", makeSearchTool(prepared.searchIndex), args)),
		execute: (path, args) => suspend(() => {
			const segments = canonicalSegments(path);
			if (segments.length === 1 && segments[0] === "search" && lookup(root, segments) === void 0) return executeTool("search", makeSearchTool(prepared.searchIndex), args);
			return executeTool(segments.join("."), resolve(root, path, prepared.searchIndex), args);
		})
	};
};
// node_modules/@opencode/codemode/dist/interpreter/objects.js
/** Ordinary assignment: writable, enumerable, configurable. */
const data = {
	writable: true,
	enumerable: true,
	configurable: true
};
/** Built-in methods and `constructor`: writable and configurable but hidden from enumeration. */
const hidden = {
	writable: true,
	enumerable: false,
	configurable: true
};
/** Function `name` and `length`: read-only but deletable. */
const readonly = {
	writable: false,
	enumerable: false,
	configurable: true
};
/** Constants such as `Math.PI` and a constructor's `prototype`. */
const frozen = {
	writable: false,
	enumerable: false,
	configurable: false
};
/**
* An object owned by the program: own properties plus a prototype link. Subclasses answer, in one place, how a
* built-in kind of object prints, coerces, iterates, and crosses to the host.
*/
var Obj = class {
	proto;
	props = /* @__PURE__ */ new Map();
	/** [[Extensible]]: cleared by `Object.preventExtensions`, `seal`, and `freeze`. */
	extensible = true;
	constructor(proto) {
		this.proto = proto;
	}
	/** The class name `Object.prototype.toString` reports: `[object Map]`. */
	tag = "Object";
	/** How diagnostics refer to a value of this kind. */
	get describe() {
		if (this.tag === "Object") return "a data object";
		return `${/^[AEIO]/.test(this.tag) ? "an" : "a"} ${this.tag}`;
	}
	/** ToString without consulting program-defined methods. */
	toString() {
		return `[object ${this.tag}]`;
	}
	/** ToPrimitive without consulting program-defined methods: only a Date answers a number hint differently. */
	toPrimitive(hint) {
		return this.toString();
	}
	/** ToNumber without consulting program-defined methods. */
	toNumber() {
		return Number(this.toPrimitive("number"));
	}
	/** How `console.log` shows the value; `item` formats a child with cycle and depth tracking. */
	inspect(item) {
		return `{${entries(this).map(([key, value]) => `${JSON.stringify(key)}:${item(value)}`).join(",")}}`;
	}
	/** A copy the host can hold; `item` converts a child. A `__proto__` key never reaches host code. */
	toHost(item) {
		return Object.fromEntries(entries(this).filter(([key]) => key !== "__proto__").map(([key, value]) => [key, item(value)]));
	}
	/** The built-in iteration `for...of` and spread use, when this kind of object has one. */
	iterator(builtins) {}
};
var Arr = class extends Obj {
	items;
	tag = "Array";
	/** The attributes every live element shares; `seal` and `freeze` narrow them since elements have no slots. */
	elements = data;
	constructor(proto, items = []) {
		super(proto);
		this.items = items;
	}
	get describe() {
		return "an array";
	}
	toString() {
		return this.items.map((item) => item === null || item === void 0 ? "" : coerceToString(item)).join(",");
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
};
/** An object with the [[ErrorData]] slot: what `Error.prototype.toString` and the host boundary recognize as an error. */
var ErrorObj = class extends Obj {
	tag = "Error";
	/** The interpreter failure this error materialized from, so rethrowing it keeps the diagnostic kind and location. */
	host;
	/** Error.prototype.toString: "name: message", or just one when the other is empty. */
	toString() {
		const name = get(this, "name");
		const message = get(this, "message");
		const shownName = typeof name === "string" ? name : "Error";
		const shownMessage = typeof message === "string" ? message : "";
		if (shownMessage === "") return shownName;
		if (shownName === "") return shownMessage;
		return `${shownName}: ${shownMessage}`;
	}
	inspect() {
		return this.toString();
	}
};
/** Interpreter machinery a program can hold but never inspect, serialize, or hand to the host. */
var Opaque = class extends Obj {
	inspect() {
		return "[opaque reference]";
	}
};
var Callable = class extends Opaque {
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
};
var Fn = class extends Callable {
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
};
/** The strict `arguments` object: an ordinary object with indexed own properties and a hidden `length`. */
var Arguments = class extends Obj {
	tag = "Arguments";
	constructor(proto, args) {
		super(proto);
		args.forEach((arg, index) => define(this, String(index), arg));
		define(this, "length", args.length, hidden);
	}
	iterator() {
		return keys(this).map((key) => get(this, key)).values();
	}
};
var Native = class extends Callable {
	call;
	construct;
	callback;
	constructor(proto, options) {
		super(proto, options.name, options.length ?? 0);
		this.call = options.call;
		this.construct = options.construct;
		this.callback = options.callback ?? true;
	}
};
var PromiseObj = class extends Opaque {
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
};
var GeneratorObj = class extends Opaque {
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
};
/** A cursor over a host iterator; there is nothing to close. */
const hostCursor = (iterator) => ({
	next: sync(() => {
		const step = iterator.next();
		return {
			done: Boolean(step.done),
			value: step.value
		};
	}),
	close: void_
});
/** A built-in iterator: a live cursor over a host collection or an iterator helper, yielding program values. */
var IteratorObj = class extends Opaque {
	cursor;
	tag = "Iterator";
	constructor(proto, cursor) {
		super(proto);
		this.cursor = cursor;
	}
	get describe() {
		return "an iterator";
	}
};
/** A built-in iterator over a host iterator, e.g. `array.values()`. */
const hostIterator = (builtins, iterator) => new IteratorObj(builtins.Iterator, hostCursor(iterator));
/** A built-in object around a host value: data-like, so it prints as itself and crosses to extensions as a copy. */
var Wrapper = class extends Obj {
	inspect(item) {
		return this.toString();
	}
};
var DateObj = class extends Wrapper {
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
};
var RegExpObj = class extends Wrapper {
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
};
var MapObj = class extends Wrapper {
	tag = "Map";
	map = /* @__PURE__ */ new Map();
	inspect(item) {
		return `Map(${this.map.size}) [${[...this.map].map(([key, value]) => `[${item(key)},${item(value)}]`).join(",")}]`;
	}
	toHost(item) {
		return new Map([...this.map].map(([key, value]) => [item(key), item(value)]));
	}
	iterator(builtins) {
		return this.map.entries().map((entry) => new Arr(builtins.Array, entry));
	}
};
var SetObj = class extends Wrapper {
	tag = "Set";
	set = /* @__PURE__ */ new Set();
	inspect(item) {
		return `Set(${this.set.size}) [${[...this.set].map(item).join(",")}]`;
	}
	toHost(item) {
		return new Set([...this.set].map(item));
	}
	iterator() {
		return this.set.values();
	}
};
/** Keys are program objects, so a host WeakMap gives the same lifetime rule as JavaScript without any bookkeeping. */
var WeakMapObj = class extends Wrapper {
	tag = "WeakMap";
	map = /* @__PURE__ */ new WeakMap();
	inspect() {
		return "WeakMap { <items unknown> }";
	}
};
var WeakSetObj = class extends Wrapper {
	tag = "WeakSet";
	set = /* @__PURE__ */ new WeakSet();
	inspect() {
		return "WeakSet { <items unknown> }";
	}
};
var URLSearchParamsObj = class extends Wrapper {
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
};
var HeadersObj = class extends Wrapper {
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
};
var URLObj = class extends Wrapper {
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
};
/** A `Uint8Array`: the host array does the byte clamping and ignores out-of-range writes, as JS does. */
var Bytes = class extends Wrapper {
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
};
/** ToString without consulting program-defined methods. */
const coerceToString = (value) => value instanceof Obj ? value.toString() : String(value);
/** ToNumber without consulting program-defined methods; tool references are not numbers. */
const coerceToNumber = (value) => {
	if (value instanceof Obj) return value.toNumber();
	return value instanceof ToolReference ? NaN : Number(value);
};
/** ToIntegerOrInfinity: NaN is 0, fractions truncate. */
const coerceToInteger = (value) => {
	const number = coerceToNumber(value);
	return Number.isNaN(number) ? 0 : Math.trunc(number);
};
/** Values that cannot cross the data boundary: opaque machinery and host-backed wrappers. */
const isRuntimeReference = (value) => value instanceof Opaque || value instanceof Wrapper || value instanceof ToolReference;
const MAX_ARRAY_INDEX = 4294967295;
const parseArrayIndex = (key) => {
	const property = String(key);
	if (!/^(0|[1-9]\d*)$/.test(property)) return void 0;
	const index = Number(property);
	return index < MAX_ARRAY_INDEX ? index : void 0;
};
const canonical = (key) => typeof key === "symbol" ? key : String(key);
const isIndexed = (target) => target instanceof Arr || target instanceof Bytes;
const elements = (target) => target instanceof Arr ? target.items : target.bytes;
const index = (target, key) => isIndexed(target) && typeof key === "string" ? parseArrayIndex(key) : void 0;
/** The own property under `key`, including an array's live indexes and `length`. */
const own = (target, key) => {
	const name = canonical(key);
	if (isIndexed(target)) {
		const at = index(target, name);
		if (at !== void 0) {
			const items = elements(target);
			if (!(at in items)) return void 0;
			return {
				value: items[at],
				...target instanceof Arr ? target.elements : data
			};
		}
		if (target instanceof Arr && name === "length") return {
			value: target.items.length,
			writable: target.elements.writable,
			enumerable: false,
			configurable: false
		};
	}
	return target.props.get(name);
};
const read = (slot, receiver) => "value" in slot ? slot.value : slot.get === void 0 ? void 0 : slot.get(receiver);
const hasOwn = (target, key) => own(target, key) !== void 0;
const getOwn = (target, key) => {
	const slot = own(target, key);
	return slot === void 0 ? void 0 : read(slot, target);
};
/** [[Get]]: walks the prototype chain; accessors see `receiver`, which is the primitive for wrapper prototypes. */
const get = (target, key, receiver = target) => {
	for (let current = target; current !== null; current = current.proto) {
		const slot = own(current, key);
		if (slot !== void 0) return read(slot, receiver);
	}
};
const has = (target, key) => {
	for (let current = target; current !== null; current = current.proto) if (own(current, key) !== void 0) return true;
	return false;
};
const hasPrototype = (value, proto) => {
	for (let current = value instanceof Obj ? value.proto : null; current !== null; current = current.proto) if (current === proto) return true;
	return false;
};
const writeElement = (target, name, value) => {
	const at = index(target, name);
	if (at !== void 0) {
		if (target instanceof Bytes) {
			target.bytes[at] = typeof value === "number" ? value : Number(value);
			return true;
		}
		if (!(at in target.items)) rejectAddition(target, at);
		target.items[at] = value;
		return true;
	}
	if (!(target instanceof Arr) || name !== "length") return void 0;
	const length = typeof value === "number" ? value : Number(value);
	if (!Number.isInteger(length) || length < 0) throw rangeError("Invalid array length");
	if (length < target.items.length && !target.elements.configurable) return false;
	checkArrayLength(length);
	target.items.length = length;
	return true;
};
/** [[Set]]: an inherited setter or read-only property decides before an own data property is created. */
const set = (target, key, value) => {
	const name = canonical(key);
	for (let current = target; current !== null; current = current.proto) {
		const slot = own(current, name);
		if (slot === void 0) continue;
		if (!("value" in slot)) {
			if (slot.set === void 0) return false;
			slot.set(target, value);
			return true;
		}
		if (!slot.writable) return false;
		if (current !== target) break;
		if (isIndexed(target)) {
			const written = writeElement(target, name, value);
			if (written !== void 0) return written;
		}
		slot.value = value;
		return true;
	}
	if (isIndexed(target)) {
		const written = writeElement(target, name, value);
		if (written !== void 0) return written;
	}
	rejectAddition(target, name);
	target.props.set(name, {
		value,
		...data
	});
	return true;
};
/** Creating a property on a non-extensible object is the one [[Set]] failure with its own message. */
const rejectAddition = (target, key) => {
	if (target.extensible) return;
	throw typeError(`Cannot add property ${String(key)}, object is not extensible.`);
};
/** [[DefineOwnProperty]] for a data property, ignoring the chain. */
const define = (target, key, value, attrs = data) => {
	const name = canonical(key);
	if (isIndexed(target) && writeElement(target, name, value) !== void 0) return;
	target.props.set(name, {
		value,
		...attrs
	});
};
const defineAccessor = (target, key, get, set) => {
	target.props.set(canonical(key), {
		get,
		set,
		enumerable: false,
		configurable: true
	});
};
const remove = (target, key) => {
	const name = canonical(key);
	if (isIndexed(target)) {
		const at = index(target, name);
		if (at !== void 0) {
			if (target instanceof Bytes) return !(at in target.bytes);
			if (at in target.items && !target.elements.configurable) return false;
			return delete target.items[at];
		}
		if (target instanceof Arr && name === "length") return false;
	}
	const slot = target.props.get(name);
	if (slot === void 0) return true;
	if (!slot.configurable) return false;
	target.props.delete(name);
	return true;
};
const ownKeys = (target) => {
	const strings = [...target.props.keys()].filter((key) => typeof key === "string");
	const symbols = [...target.props.keys()].filter((key) => typeof key === "symbol");
	return [
		...isIndexed(target) ? Object.keys(elements(target)) : [],
		...target instanceof Arr ? ["length"] : [],
		...strings.filter((key) => parseArrayIndex(key) !== void 0).sort((a, b) => Number(a) - Number(b)),
		...strings.filter((key) => parseArrayIndex(key) === void 0),
		...symbols
	];
};
const enumerable = (target, key) => own(target, key)?.enumerable === true;
/** Own enumerable keys, including the iterator symbols; what spread and `Object.assign` copy. */
const enumerableKeys = (target) => ownKeys(target).filter((key) => (typeof key === "string" || key === IteratorSymbol || key === AsyncIteratorSymbol) && enumerable(target, key));
/** Own enumerable string keys: `Object.keys`. */
const keys = (target) => ownKeys(target).filter((key) => typeof key === "string" && enumerable(target, key));
/** Own enumerable string entries: `Object.entries` and serialization. */
const entries = (target) => keys(target).map((key) => [key, getOwn(target, key)]);
const record = (proto, fields) => {
	const target = new Obj(proto);
	for (const [key, value] of Object.entries(fields)) define(target, key, value);
	return target;
};
const assign = (target, source, skip) => {
	for (const key of enumerableKeys(source)) {
		if (skip?.has(key)) continue;
		set(target, key, getOwn(source, key));
	}
};
// node_modules/@opencode/codemode/dist/interpreter/references.js
/** Interpreter machinery that is never data, unlike a Date or Map, which cross some boundaries as copies. */
const isOpaque = (value) => value instanceof Opaque || value instanceof ToolReference;
const find = (value, match, skip, seen) => {
	const pending = [[value].values()];
	while (pending.length > 0) {
		const next = pending.at(-1).next();
		if (next.done) {
			pending.pop();
			continue;
		}
		const current = next.value;
		if (match(current)) return true;
		if (!(current instanceof Obj) || skip(current) || seen.has(current)) continue;
		seen.add(current);
		pending.push(ownKeys(current).map((key) => getOwn(current, key)).values());
	}
	return false;
};
const never = () => false;
const containsRuntimeReference = (value) => find(value, isRuntimeReference, never, /* @__PURE__ */ new Set());
const containsOpaqueReference = (value) => find(value, isOpaque, (current) => isRuntimeReference(current) && !isOpaque(current), /* @__PURE__ */ new Set());
const rejectCircularInsertion = (container, value, label, seen = /* @__PURE__ */ new Set()) => {
	if (find(value, (current) => current === container, isRuntimeReference, seen)) throw invalidData(`${label} contains a circular value.`);
};
const describeValue = (value) => {
	if (value === null || value === void 0) return String(value);
	if (value instanceof Obj) return value.describe;
	if (value instanceof ToolReference) return "a tool reference";
	return `a ${typeof value}`;
};
const typeofValue = (value) => {
	if (value instanceof Callable) return "function";
	if (value instanceof ToolReference) return value.path.length > 0 ? "function" : "object";
	return typeof value;
};
// node_modules/@opencode/codemode/dist/data.js
/**
* What `JSON.stringify` would serialize for a program value, as host JSON: `toJSON` is honored, functions and
* `undefined` vanish, non-finite numbers become null, and everything else is copied. Two departures from JS
* so a mistake is not a silent `{}`: an Error serializes as `{ name, message, ...own }`, and a promise throws.
*/
const toJson = (ctx, value, replacer) => walk(ctx, value, replacer, false);
/**
* The host boundary: `toJson`, plus what a program most likely meant when a value cannot be JSON. A promise is
* awaited, a Set crosses as an array, a URLSearchParams as its query string, a Uint8Array asks to be encoded as
* text first, and a `__proto__` key is dropped so host code can never receive one.
*/
const toBoundary = (ctx, value) => walk(ctx, value, void 0, true);
const walk = (ctx, value, replacer, boundary) => {
	const stack = /* @__PURE__ */ new Set();
	const visit = (holder, key, depth) => gen(function* () {
		if (depth > 32) throw rangeError(`Value exceeds the maximum depth of 32.`);
		const raw = get(holder, key);
		if (raw instanceof PromiseObj && !boundary) throw invalidData("JSON.stringify received an un-awaited Promise; await it first - e.g. `const result = await tools.ns.tool(...)`.");
		const settled = raw instanceof PromiseObj ? yield* ctx.await(raw) : raw;
		const toJSON = settled instanceof Obj ? get(settled, "toJSON") : void 0;
		const own = toJSON instanceof Callable ? yield* ctx.call(toJSON, settled, [key]) : settled;
		const value = replacer === void 0 ? own : yield* replacer([key, own], holder);
		if (value === void 0 || typeofValue(value) === "function") return void 0;
		if (typeof value === "number") return Number.isFinite(value) ? value : null;
		if (value === null || typeof value === "string" || typeof value === "boolean") return value;
		if (!(value instanceof Obj)) return {};
		if (boundary && value instanceof Bytes) throw invalidData("A Uint8Array cannot cross to the host; pass text instead, e.g. `new TextDecoder().decode(bytes)` or `bytes.toBase64()`.");
		if (boundary && value instanceof URLSearchParamsObj) return value.params.toString();
		if (value instanceof HeadersObj) return Object.fromEntries(value.headers);
		const target = boundary && value instanceof SetObj ? new Arr(ctx.builtins.Array, [...value.set]) : value;
		if (stack.has(target)) throw typeError("Converting circular structure to JSON.");
		stack.add(target);
		if (target instanceof Arr) {
			const items = [];
			for (let index = 0; index < target.items.length; index += 1) items.push((yield* visit(target, String(index), depth + 1)) ?? null);
			stack.delete(target);
			return items;
		}
		const copied = {};
		const put = (name, item) => {
			if (item !== void 0) Object.defineProperty(copied, name, {
				value: item,
				enumerable: true,
				writable: true,
				configurable: true
			});
		};
		if (target instanceof ErrorObj) {
			put("name", yield* visit(target, "name", depth + 1));
			put("message", yield* visit(target, "message", depth + 1));
		}
		for (const name of keys(target)) {
			if (boundary && name === "__proto__") continue;
			put(name, yield* visit(target, name, depth + 1));
		}
		stack.delete(target);
		return copied;
	});
	return visit(record(ctx.builtins.Object, { "": value }), "", 0);
};
/** Host JSON as program values: objects and arrays are copied, primitives pass through. */
const fromJson = (ctx, value) => {
	if (value === null || typeof value !== "object") return value;
	if (Array.isArray(value)) return new Arr(ctx.builtins.Array, value.map((item) => fromJson(ctx, item)));
	const copied = new Obj(ctx.builtins.Object);
	for (const [key, item] of Object.entries(value)) define(copied, key, fromJson(ctx, item));
	return copied;
};
// node_modules/@opencode/codemode/dist/interpreter/intrinsics.js
const errorTypes = [
	"Error",
	"TypeError",
	"RangeError",
	"SyntaxError",
	"ReferenceError",
	"EvalError",
	"URIError",
	"AggregateError"
];
const isErrorType = (name) => errorTypes.includes(name);
const createErrorValue = (prototype, message) => {
	const value = new ErrorObj(prototype);
	if (message !== void 0) define(value, "message", message, hidden);
	return value;
};
/** The prototype a primitive reads its methods from without being boxed; none for null, undefined, and symbols. */
const primitivePrototype = (builtins, value) => {
	if (typeof value === "string") return builtins.String;
	if (typeof value === "number") return builtins.Number;
	if (typeof value === "boolean") return builtins.Boolean;
};
const createBuiltins = () => {
	const object = new Obj(null);
	const fn = new Native(object, {
		name: "",
		call: () => undefined_
	});
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
// node_modules/@opencode/codemode/dist/interpreter/native.js
const lift = (impl) => (thisValue, args) => {
	const result = impl(thisValue, args);
	return isEffect(result) ? result : succeed$1(result);
};
const native = (builtins, options) => new Native(builtins.Function, options);
const fn = (builtins, name, length, impl) => native(builtins, {
	name,
	length,
	call: lift(impl)
});
const methods = (builtins, target, table) => {
	for (const [name, length, impl] of table) define(target, name, fn(builtins, name, length, impl), hidden);
};
const constants = (target, table) => {
	for (const [name, value] of Object.entries(table)) define(target, name, value, frozen);
};
/** A constructor wired to its prototype: `C.prototype === proto` and `proto.constructor === C`. */
const constructor = (builtins, proto, options) => {
	const ctor = native(builtins, options);
	define(ctor, "prototype", proto, frozen);
	define(proto, "constructor", ctor, hidden);
	return ctor;
};
/** The `call` of a constructor that JS requires to be invoked with `new`. */
const requiresNew = (name) => () => sync(() => {
	throw typeError(`Constructor ${name} requires 'new'.`);
});
/** The instance prototype for `new` via `newTarget.prototype`, falling back to the built-in's own. */
const prototypeFrom = (newTarget, fallback) => {
	const proto = newTarget.props.get("prototype");
	return proto !== void 0 && "value" in proto && proto.value instanceof Obj ? proto.value : fallback;
};
/** Narrows a method receiver to the built-in it belongs to, or throws the TypeError JS would. */
const receiver = (cls, thisValue, method) => {
	if (thisValue instanceof cls) return thisValue;
	throw typeError(`${method} called on incompatible receiver ${describeValue(thisValue)}.`);
};
// node_modules/@opencode/codemode/dist/interpreter/callback.js
/** IteratorClose: a consumer failure closes the iterator and wins over any close failure, except that a generator's
* return() is a return completion, so a failing close wins over it, as after `break`. */
const preserveConsumerError = (close, effect) => flatMap(exit(effect), (exit$5) => {
	if (isSuccess(exit$5)) return succeed$1(exit$5.value);
	return flatMap(exit(close), (closed) => {
		if (!isSuccess(closed) && squash(exit$5.cause) instanceof GeneratorReturn) return failCause(closed.cause);
		return failCause(exit$5.cause);
	});
});
/**
* ToPrimitive: calls `valueOf`/`toString` in hint order and returns the first primitive result. Dates treat the
* default hint as "string", like their `Symbol.toPrimitive`. Opaque values (functions, promises, generators, tool
* references) pass through unchanged so callers reject or describe them in their built-in form.
*/
const toPrimitive = (ctx, value, hint) => {
	if (!(value instanceof Obj) || isOpaque(value)) return succeed$1(value);
	const order = hint === "string" || hint === "default" && value instanceof DateObj ? ["toString", "valueOf"] : ["valueOf", "toString"];
	return gen(function* () {
		for (const method of order) {
			const callable = get(value, method);
			if (!(callable instanceof Callable)) continue;
			const result = yield* ctx.call(callable, value, []);
			if (result === null || typeof result !== "object" && typeof result !== "function") return result;
		}
		throw typeError("Cannot convert object to primitive value.");
	});
};
/** Invoke(value, name): calls the method the value would find through its prototype. */
const invoke = (ctx, value, name, label) => {
	const target = value instanceof Obj ? value : primitivePrototype(ctx.builtins, value);
	if (target === void 0) throw typeError(`${label} called on null or undefined.`);
	return ctx.call(get(target, name), value, []);
};
const toPrimitiveString = (ctx, value) => map(toPrimitive(ctx, value, "string"), coerceToString);
const toPrimitiveNumber = (ctx, value) => map(toPrimitive(ctx, value, "number"), coerceToNumber);
/**
* Runs a native body on its arguments after ToPrimitive, in order, with one hint for all positions or one per
* position. Primitive arguments skip the Effect entirely.
*/
const withPrimitives = (ctx, hints, values, body) => {
	if (!values.some((value) => value instanceof Obj)) return body(values);
	return flatMap(forEach(values, (value, index) => toPrimitive(ctx, value, typeof hints === "string" ? hints : hints[index])), (primitives) => {
		const result = body(primitives);
		return isEffect(result) ? result : succeed$1(result);
	});
};
const isSupportedCallback = (value) => value instanceof Callable && !(value instanceof Native && !value.callback);
const applyCollectionCallback = (ctx, callback, name) => {
	if (!isSupportedCallback(callback)) {
		if (typeofValue(callback) === "function") throw typeError(`${name} cannot use this callable as a callback; wrap it in an arrow function, e.g. (value) => tools.ns.tool(value).`);
		throw typeError(`${name} expects a function callback.`);
	}
	return (callbackArgs, thisValue) => ctx.call(callback, thisValue, callbackArgs);
};
// node_modules/@opencode/codemode/dist/stdlib/console.js
const consoleMethods = [
	"log",
	"info",
	"debug",
	"warn",
	"error",
	"dir",
	"table"
];
/** Captured console: every method appends one formatted line to `logs`. */
const consoleGlobal = (ctx) => {
	const builtins = ctx.builtins;
	const console = new Obj(builtins.Object);
	methods(builtins, console, consoleMethods.map((name) => [
		name,
		0,
		(_, args) => {
			ctx.logs.push(formatConsoleMessage(name, args));
		}
	]));
	return console;
};
const MAX_CONSOLE_DEPTH = 32;
const formatConsoleMessage = (name, args) => {
	if (name === "dir") return args.length === 0 ? "undefined" : formatValue(args[0]);
	if (name === "table") return formatConsoleTable(args[0], args[1]);
	return `${name === "warn" ? "[warn] " : name === "error" ? "[error] " : name === "debug" ? "[debug] " : ""}${args.map((arg) => formatValue(arg)).join(" ")}`;
};
/** One value as `console.log` shows it. */
const formatValue = (value) => {
	if (value === void 0) return "undefined";
	if (typeof value === "string") return value;
	return formatConsoleValue(value, /* @__PURE__ */ new Set(), 0);
};
const formatConsoleValue = (value, seen, depth) => {
	if (value === null || value === void 0) return "null";
	if (typeof value === "string") return JSON.stringify(value);
	if (!(value instanceof Obj)) return value instanceof ToolReference ? "[opaque reference]" : String(value);
	if (depth > MAX_CONSOLE_DEPTH) return "...";
	if (seen.has(value)) return "[Circular]";
	seen.add(value);
	try {
		return value.inspect((item) => formatConsoleValue(item, seen, depth + 1));
	} finally {
		seen.delete(value);
	}
};
const formatConsoleTable = (value, columnsArgument) => {
	if (value === void 0) return "undefined";
	if (containsOpaqueReference(value)) return "[opaque reference]";
	const columns = columnsArgument instanceof Arr ? columnsArgument.items.map(String) : void 0;
	const rows = consoleTableRows(value, columns);
	const keys = columns ?? Array.from(new Set(rows.flatMap((row) => Object.keys(row.values))));
	return [["(index)", ...keys].join("	"), ...rows.map((row) => [row.index, ...keys.map((key) => formatConsoleTableCell(row.values[key]))].join("	"))].join("\n");
};
const consoleTableRows = (data, columns) => {
	if (data instanceof Arr) return data.items.map((item, index) => ({
		index: String(index),
		values: consoleTableValues(item, columns)
	}));
	if (data instanceof Obj) return entries(data).map(([index, item]) => ({
		index,
		values: consoleTableValues(item, columns)
	}));
	return [{
		index: "0",
		values: { Value: data }
	}];
};
const consoleTableValues = (value, columns) => {
	if (value instanceof Obj && !(value instanceof Arr)) {
		if (columns !== void 0) return Object.fromEntries(columns.map((column) => [column, get(value, column)]));
		return Object.fromEntries(entries(value));
	}
	return { Value: value };
};
const formatConsoleTableCell = (value) => {
	if (value === void 0) return "";
	if (typeof value === "string") return value;
	return formatConsoleValue(value, /* @__PURE__ */ new Set(), 0);
};
// node_modules/@opencode/codemode/dist/interpreter/errors.js
const normalizeError = (error) => {
	if (error instanceof PendingThrow) return {
		kind: error.kind,
		message: `${error.type}: ${error.message}${formatLocation(error.node)}`,
		...error.node?.loc ? { location: sourceLocation(error.node) } : {},
		...error.suggestions ? { suggestions: error.suggestions } : {}
	};
	if (error instanceof ToolRuntimeError) return {
		kind: error.kind,
		message: error.message,
		...error.suggestions.length > 0 ? { suggestions: error.suggestions } : {}
	};
	if (error instanceof ToolError) return {
		kind: "ToolFailure",
		message: error.message
	};
	if (error instanceof Throw) {
		const value = error.value;
		if (value instanceof ErrorObj) return value.host ? normalizeError(value.host) : {
			kind: "ExecutionFailure",
			message: errorToString(value)
		};
		let message;
		if (containsRuntimeReference(value)) message = "a non-data value";
		else if (typeof value === "string") message = value;
		else message = formatValue(value);
		return {
			kind: "ExecutionFailure",
			message: `Uncaught: ${message}`
		};
	}
	if (error instanceof RangeError && /call stack|recursion/i.test(error.message)) return {
		kind: "ExecutionFailure",
		message: "Execution exceeded the maximum nesting depth."
	};
	if (error instanceof Error) return {
		kind: error.name === "SyntaxError" ? "ParseError" : "ExecutionFailure",
		message: error.message
	};
	return {
		kind: "ExecutionFailure",
		message: String(error)
	};
};
/**
* Gives a failure the source location of the expression that raised it, keeping the first one attached. Host errors
* that escape a built-in become the equivalent program error here.
*/
const locate = (error, node) => {
	if (error instanceof PendingThrow) {
		if (error.node === void 0 && node) error.node = node;
		return error;
	}
	if (error instanceof Error && !(error instanceof ToolError) && !(error instanceof ToolRuntimeError)) return new PendingThrow(isErrorType(error.name) ? error.name : "Error", error.message, node);
	return error;
};
/** The program value a handler receives for a failure; one failure always yields the same value. */
const materialize = (ctx, thrown) => {
	if (thrown instanceof Throw) return thrown.value;
	const builtins = ctx.builtins;
	if (thrown instanceof PendingThrow) {
		if (thrown.value === void 0) {
			thrown.value = createErrorValue(builtins[thrown.type], thrown.message);
			thrown.value.host = thrown;
		}
		return thrown.value;
	}
	const type = thrown instanceof Error && isErrorType(thrown.name) ? thrown.name : "Error";
	return createErrorValue(builtins[type], normalizeError(thrown).message);
};
/** Error.prototype.toString: `name: message`, omitting whichever side is empty. */
const errorToString = (self) => {
	const name = get(self, "name");
	const message = get(self, "message");
	const shownName = name === void 0 ? "Error" : coerceToString(name);
	const shownMessage = message === void 0 ? "" : coerceToString(message);
	if (shownMessage === "") return shownName;
	if (shownName === "") return shownMessage;
	return `${shownName}: ${shownMessage}`;
};
const createAggregateErrorValue = (ctx, errors, message, proto = ctx.builtins.AggregateError) => {
	const value = createErrorValue(proto, message);
	define(value, "errors", new Arr(ctx.builtins.Array, errors), { ...hidden });
	return value;
};
const constructAggregateErrorValue = (ctx, args, proto) => gen(function* () {
	const message = args[1] === void 0 ? "" : yield* toPrimitiveString(ctx, args[1]);
	const cursor = yield* ctx.iterate(args[0]);
	if (cursor === void 0) throw typeError("new AggregateError(...) expects a synchronous iterable of errors.");
	const errors = [];
	while (true) {
		const step = yield* cursor.next;
		if (step.done) return createAggregateErrorValue(ctx, errors, message, proto);
		errors.push(step.value);
	}
});
/** An error constructor such as `Error` or `TypeError`; callable with or without `new`, like JS. */
const errorGlobal = (type, ctx) => {
	const builtins = ctx.builtins;
	const prototype = builtins[type];
	const construct = (args, newTarget) => {
		const proto = prototypeFrom(newTarget, prototype);
		const created = type === "AggregateError" ? constructAggregateErrorValue(ctx, args, proto) : map(args[0] === void 0 ? undefined_ : toPrimitiveString(ctx, args[0]), (message) => createErrorValue(proto, message));
		const options = args[type === "AggregateError" ? 2 : 1];
		if (!(options instanceof Obj) || !has(options, "cause")) return created;
		return map(created, (value) => {
			define(value, "cause", get(options, "cause"), hidden);
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
		methods(builtins, prototype, [[
			"toString",
			0,
			(thisValue) => errorToString(receiver(Obj, thisValue, "Error.prototype.toString"))
		]]);
		methods(builtins, ctor, [[
			"isError",
			1,
			(_, args) => args[0] instanceof ErrorObj
		]]);
		return ctor;
	}
	ctor.proto = get(builtins.Error, "constructor");
	return ctor;
};
// node_modules/@opencode/codemode/dist/interpreter/promises.js
const capability = (ctx, name, settle) => fn(ctx.builtins, name, 1, (_, args) => {
	settle(args[0]);
});
const MAX_NESTING = 100;
/**
* The right to run program code. JavaScript runs one job at a time: code between two awaits finishes before another
* job starts. Effect preempts a busy fiber so timeouts and host work still run, so only the fiber holding the turn may
* run program code. A synchronous call into another fiber (an async function's body up to its first await, a
* generator step) lends that fiber the turn and gets it back when the callee suspends or ends. An await gives the turn
* to the next waiting job and queues to take it back. Work that only settles a promise or runs host code leaves
* without it, so tool calls stay concurrent and resolvers settle in the call, as in JavaScript.
*/
var Turn = class {
	holder;
	handbacks = [];
	first;
	last;
	nesting = 0;
	take = withFiber((fiber) => {
		if (this.holder === void 0) {
			this.holder = fiber;
			return void_;
		}
		return callback((resume) => {
			const waiter = {
				fiber,
				resume,
				removed: false
			};
			if (this.last === void 0) this.first = waiter;
			else this.last.next = waiter;
			this.last = waiter;
			return sync(() => {
				if (this.holder === fiber) this.release(fiber);
				else waiter.removed = true;
			});
		});
	});
	hold(effect) {
		return withFiber((fiber) => andThen(this.take, effect).pipe(ensuring(sync(() => this.release(fiber)))));
	}
	release(fiber) {
		if (this.holder !== fiber) return;
		const back = this.handbacks.pop();
		if (back !== void 0) {
			this.holder = back.fiber;
			this.handBack(back);
			return;
		}
		let next = this.first;
		while (next !== void 0 && next.removed) next = next.next;
		this.first = next?.next;
		if (this.first === void 0) this.last = void 0;
		this.holder = next?.fiber;
		if (next !== void 0) next.fiber.currentDispatcher.scheduleTask(() => next.resume(void_), 0);
	}
	suspend(wait) {
		return uninterruptibleMask((restore) => withFiber((fiber) => {
			this.release(fiber);
			return flatMap(exit(restore(wait)), (exit) => isFailure(exit) && hasInterruptsOnly(exit.cause) ? exit : andThen(restore(this.take), exit));
		}));
	}
	leave(wait) {
		return withFiber((fiber) => {
			this.release(fiber);
			return wait;
		});
	}
	handOff(start) {
		return withFiber((fiber) => {
			const back = {
				fiber,
				returned: false
			};
			this.handbacks.push(back);
			return andThen(this.nest(start), awaitHandback(back));
		});
	}
	park(wait) {
		return uninterruptibleMask((restore) => withFiber((fiber) => {
			this.release(fiber);
			return tap(restore(wait), () => {
				this.holder = fiber;
				return this.nesting > MAX_NESTING ? yieldNow : void_;
			});
		}));
	}
	fork(effect, scope) {
		return withFiber((caller) => {
			const back = {
				fiber: caller,
				returned: false
			};
			this.handbacks.push(back);
			let started = false;
			const body = withFiber((fiber) => {
				started = true;
				this.holder = fiber;
				return effect;
			});
			const forked = this.nesting < MAX_NESTING ? this.nest(forkIn(body, scope, { startImmediately: true })) : forkIn(body, scope);
			return flatMap(forked, (fiber) => {
				fiber.addObserver(() => {
					if (started) return this.release(fiber);
					const index = this.handbacks.lastIndexOf(back);
					if (index >= 0) this.handbacks.splice(index, 1);
					this.handBack(back);
				});
				return back.returned ? succeed$1(fiber) : as(awaitHandback(back), fiber);
			});
		});
	}
	handBack(back) {
		back.returned = true;
		const resume = back.resume;
		if (resume !== void 0) back.fiber.currentDispatcher.scheduleTask(() => resume(void_), 0);
	}
	nest(effect) {
		return suspend(() => {
			this.nesting++;
			return ensuring(effect, sync(() => {
				this.nesting--;
			}));
		});
	}
};
const awaitHandback = (back) => callback((resume) => {
	if (back.returned) resume(void_);
	else back.resume = resume;
});
var Pending = class {
	scope;
	proto;
	turn = new Turn();
	active = /* @__PURE__ */ new Set();
	ids = /* @__PURE__ */ new WeakMap();
	observed = /* @__PURE__ */ new WeakSet();
	failures = /* @__PURE__ */ new Map();
	nextID = 0;
	constructor(scope, proto) {
		this.scope = scope;
		this.proto = proto;
	}
	createWithSelf(body) {
		const self = {};
		return map(this.create(body(self)), (promise) => {
			self.promise = promise;
			return promise;
		});
	}
	create(effect) {
		return this.register(effect, (body) => this.turn.fork(body, this.scope));
	}
	createHost(effect) {
		return this.register(effect, (body) => forkIn(body, this.scope, { startImmediately: true }));
	}
	register(effect, fork) {
		return flatMap(CallSite, (site) => {
			if (this.active.size >= 1e4) throw rangeError(`Too many pending promises (limit ${MAX_PENDING_PROMISES}); await promises before creating more.`);
			const id = this.nextID++;
			const body = catchDefect(effect, (defect) => die(locate(defect, site.node)));
			return map(fork(body), (fiber) => {
				const promise = new PromiseObj(this.proto, fiber);
				this.active.add(promise);
				this.ids.set(promise, id);
				fiber.addObserver((exit) => {
					this.active.delete(promise);
					if (isSuccess(exit) || hasInterruptsOnly(exit.cause) || this.observed.has(promise)) {
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
		if (id !== void 0) this.failures.delete(id);
	}
	await(promise) {
		return await_(promise.fiber);
	}
	fork(effect) {
		return asVoid(this.turn.fork(effect, this.scope));
	}
	diagnostics() {
		return [...this.failures].sort(([left], [right]) => left - right).map(([, failure]) => failure);
	}
	interrupt() {
		const self = this;
		return gen(function* () {
			while (self.active.size > 0) yield* interruptAll([...self.active].map((promise) => promise.fiber));
			return self.diagnostics();
		});
	}
};
const resolvePromiseValue = (ctx, value, own) => {
	if (own?.promise !== void 0 && value === own.promise) return die(typeError("Chaining cycle detected: a promise cannot resolve with itself."));
	if (value instanceof PromiseObj) return ctx.await(value);
	if (!(value instanceof Obj)) return succeed$1(value);
	const then = get(value, "then");
	if (typeofValue(then) !== "function") return succeed$1(value);
	return gen(function* () {
		yield* ctx.pending.turn.suspend(yieldNow);
		const deferred = makeUnsafe$2();
		const resolve = capability(ctx, "resolve", (result) => doneUnsafe(deferred, succeed$2(result)));
		const reject = capability(ctx, "reject", (reason) => doneUnsafe(deferred, fail$2(new Throw(reason))));
		const executed = yield* exit(ctx.call(then, value, [resolve, reject]));
		if (!isSuccess(executed)) {
			if (hasInterruptsOnly(executed.cause)) return yield* failCause(executed.cause);
			doneUnsafe(deferred, fail$2(squash(executed.cause)));
		}
		return yield* resolvePromiseValue(ctx, yield* ctx.pending.turn.leave(_await(deferred)), own);
	});
};
const resolvePromise = (ctx, value) => {
	if (value instanceof PromiseObj) return succeed$1(value);
	return ctx.pending.createWithSelf((self) => resolvePromiseValue(ctx, value, self));
};
const promiseStatics = [
	"all",
	"allSettled",
	"race",
	"any",
	"resolve",
	"reject",
	"withResolvers",
	"try"
];
const invokePromiseMethod = (ctx, name, args) => {
	if (name === "resolve") return resolvePromise(ctx, args[0]);
	if (name === "reject") return ctx.pending.create(fail$1(new Throw(args[0])));
	if (name === "withResolvers") return map(promiseCapability(ctx), (made) => record(ctx.builtins.Object, {
		promise: made.promise,
		resolve: made.resolve,
		reject: made.reject
	}));
	if (name === "try") {
		if (typeofValue(args[0]) !== "function") throw typeError(`Promise.try expects a function, received ${describeValue(args[0])}.`);
		return flatMap(exit(ctx.call(args[0], void 0, args.slice(1))), (called) => {
			if (isSuccess(called)) return resolvePromise(ctx, called.value);
			if (hasInterruptsOnly(called.cause)) return failCause(called.cause);
			return ctx.pending.create(fail$1(squash(called.cause)));
		});
	}
	return ctx.pending.create(gen(function* () {
		const cursor = yield* ctx.iterate(args[0]);
		if (cursor === void 0) throw typeError(`Promise.${name} expects a synchronous iterable, received ${describeValue(args[0])}.`);
		const items = [];
		while (true) {
			const step = yield* cursor.next;
			if (step.done) break;
			const item = yield* resolvePromise(ctx, step.value);
			ctx.pending.markObserved(item);
			items.push(item);
		}
		if (name === "all") return new Arr(ctx.builtins.Array, yield* settleAfterTurn(ctx, all(items.map((item) => flatten(ctx.pending.await(item))), { concurrency: "unbounded" })));
		if (name === "allSettled") return yield* ctx.pending.turn.suspend(gen(function* () {
			const outcomes = [];
			for (const item of items) {
				const exit = yield* ctx.pending.await(item);
				if (isSuccess(exit)) {
					outcomes.push(record(ctx.builtins.Object, {
						status: "fulfilled",
						value: exit.value
					}));
					continue;
				}
				if (hasInterruptsOnly(exit.cause)) return yield* failCause(exit.cause);
				outcomes.push(record(ctx.builtins.Object, {
					status: "rejected",
					reason: materialize(ctx, squash(exit.cause))
				}));
			}
			yield* yieldNow;
			return new Arr(ctx.builtins.Array, outcomes);
		}));
		if (name === "race") {
			if (items.length === 0) throw typeError("Promise.race([]) would never settle; provide at least one promise or value.");
			return yield* settleAfterTurn(ctx, flatten(raceAll(items.map((item) => ctx.pending.await(item)))));
		}
		const flipped = items.map((item) => flatMap(ctx.pending.await(item), (exit) => {
			if (isSuccess(exit)) return fail$1(new PromiseAnyFulfilled(exit.value));
			if (hasInterruptsOnly(exit.cause)) return failCause(exit.cause);
			return succeed$1(materialize(ctx, squash(exit.cause)));
		}));
		return yield* settleAfterTurn(ctx, all(flipped, { concurrency: "unbounded" }).pipe(flatMap((reasons) => fail$1(new Throw(createAggregateErrorValue(ctx, reasons, "All promises were rejected")))), catch_((error) => error instanceof PromiseAnyFulfilled ? succeed$1(error.value) : fail$1(error))));
	}));
};
const instanceMethod = (ctx, name, thisValue, args) => {
	const method = `Promise.prototype.${name}`;
	const promise = receiver(PromiseObj, thisValue, method);
	ctx.pending.markObserved(promise);
	if (name === "finally") return chainFinally(ctx, promise, reactionHandler(args[0], method), method);
	const onFulfilled = name === "then" ? reactionHandler(args[0], method) : void 0;
	const onRejected = reactionHandler(name === "then" ? args[1] : args[0], method);
	return chainReaction(ctx, promise, onFulfilled, onRejected, method);
};
/** NewPromiseCapability: a pending promise with the resolve/reject callables that settle it exactly once. */
const promiseCapability = (ctx) => gen(function* () {
	const deferred = makeUnsafe$2();
	return {
		promise: yield* ctx.pending.createWithSelf((self) => flatMap(ctx.pending.turn.leave(_await(deferred)), (value) => resolvePromiseValue(ctx, value, self))),
		resolve: capability(ctx, "resolve", (value) => doneUnsafe(deferred, succeed$2(value))),
		reject: capability(ctx, "reject", (value) => doneUnsafe(deferred, fail$2(new Throw(value)))),
		deferred
	};
});
const constructPromise = (ctx, executor) => {
	if (!(executor instanceof Fn)) throw typeError("new Promise(...) expects an executor function (e.g. new Promise((resolve, reject) => { ... })).");
	return gen(function* () {
		const made = yield* promiseCapability(ctx);
		const executed = yield* exit(ctx.call(executor, void 0, [made.resolve, made.reject]));
		if (!isSuccess(executed)) {
			if (hasInterruptsOnly(executed.cause)) return yield* failCause(executed.cause);
			doneUnsafe(made.deferred, fail$2(squash(executed.cause)));
		}
		return made.promise;
	});
};
const settleAfterTurn = (ctx, body) => flatten(ctx.pending.turn.suspend(flatMap(exit(body), (exit) => as(yieldNow, exit))));
var PromiseAnyFulfilled = class {
	value;
	constructor(value) {
		this.value = value;
	}
};
const reactionHandler = (value, method) => {
	if (isSupportedCallback(value)) return value;
	if (typeofValue(value) === "function") throw typeError(`${method} cannot use this callable as a handler; wrap it in an arrow function, e.g. (value) => tools.ns.tool(value).`);
};
const reactionExit = (ctx, source) => ctx.pending.turn.suspend(gen(function* () {
	const exit = yield* ctx.pending.await(source);
	if (!isSuccess(exit) && hasInterruptsOnly(exit.cause)) return yield* failCause(exit.cause);
	yield* yieldNow;
	return exit;
}));
const chainReaction = (ctx, source, onFulfilled, onRejected, method) => {
	return ctx.pending.createWithSelf((self) => gen(function* () {
		const exit = yield* reactionExit(ctx, source);
		const handler = isSuccess(exit) ? onFulfilled : onRejected;
		if (handler === void 0) return yield* exit;
		const input = isSuccess(exit) ? exit.value : materialize(ctx, squash(exit.cause));
		const result = yield* applyCollectionCallback(ctx, handler, method)([input]);
		return yield* resolvePromiseValue(ctx, result, self);
	}));
};
const chainFinally = (ctx, source, cleanup, method) => ctx.pending.create(gen(function* () {
	const exit = yield* reactionExit(ctx, source);
	if (cleanup !== void 0) {
		const result = yield* applyCollectionCallback(ctx, cleanup, method)([]);
		const intermediate = yield* ctx.pending.create(gen(function* () {
			yield* ctx.await(yield* resolvePromise(ctx, result));
			return yield* exit;
		}));
		return yield* ctx.await(intermediate);
	}
	return yield* exit;
}));
const promiseGlobal = (ctx) => {
	const builtins = ctx.builtins;
	const proto = builtins.Promise;
	const promise = constructor(builtins, proto, {
		name: "Promise",
		length: 1,
		call: requiresNew("Promise"),
		construct: (args) => constructPromise(ctx, args[0])
	});
	for (const name of promiseStatics) define(promise, name, native(builtins, {
		name,
		length: 1,
		call: (_, args) => invokePromiseMethod(ctx, name, args),
		callback: false
	}), hidden);
	methods(builtins, proto, [
		[
			"then",
			2,
			(thisValue, args) => instanceMethod(ctx, "then", thisValue, args)
		],
		[
			"catch",
			1,
			(thisValue, args) => instanceMethod(ctx, "catch", thisValue, args)
		],
		[
			"finally",
			1,
			(thisValue, args) => instanceMethod(ctx, "finally", thisValue, args)
		]
	]);
	return promise;
};
// node_modules/@opencode/codemode/dist/stdlib/array.js
const arrayLikeSource = (source) => {
	if (source instanceof Obj && !(source instanceof PromiseObj)) {
		const length = Math.max(0, coerceToInteger(get(source, "length")));
		checkArrayLength(length);
		return {
			length,
			source
		};
	}
	throw invalidData(`Array.from expects an iterable or array-like value, received ${describeValue(source)}.`);
};
const arrayFrom = (ctx, args) => {
	const source = args[0];
	const proto = ctx.builtins.Array;
	const apply = args.length < 2 || args[1] === void 0 ? void 0 : applyCollectionCallback(ctx, args[1], "Array.from");
	return gen(function* () {
		const cursor = yield* ctx.iterate(source);
		if (cursor === void 0) {
			if (source instanceof GeneratorObj) throw typeError(`Array.from expects a synchronous iterable or array-like value, received ${describeValue(source)}.`);
			const arrayLike = arrayLikeSource(source);
			const values = [];
			for (let index = 0; index < arrayLike.length; index += 1) {
				const item = get(arrayLike.source, index);
				values.push(apply === void 0 ? item : yield* apply([item, index], args[2]));
			}
			return new Arr(proto, values);
		}
		const values = [];
		let index = 0;
		while (true) {
			const step = yield* cursor.next;
			if (step.done) return new Arr(proto, values);
			values.push(apply === void 0 ? step.value : yield* preserveConsumerError(cursor.close, apply([step.value, index], args[2])));
			index += 1;
		}
	});
};
const sortArray = (ctx, target, comparator, name) => {
	if (comparator === void 0) return sync(() => [...target].sort((a, b) => compareText(coerceToString(a), coerceToString(b))));
	const apply = applyCollectionCallback(ctx, comparator, name);
	const mergeSort = (items) => {
		if (items.length <= 1) return succeed$1(items);
		const midpoint = Math.floor(items.length / 2);
		return gen(function* () {
			const left = yield* mergeSort(items.slice(0, midpoint));
			const right = yield* mergeSort(items.slice(midpoint));
			const merged = [];
			let leftIndex = 0;
			let rightIndex = 0;
			while (leftIndex < left.length && rightIndex < right.length) {
				const order = coerceToNumber(yield* apply([left[leftIndex], right[rightIndex]]));
				if (Number.isNaN(order) || order <= 0) merged.push(left[leftIndex++]);
				else merged.push(right[rightIndex++]);
			}
			return [
				...merged,
				...left.slice(leftIndex),
				...right.slice(rightIndex)
			];
		});
	};
	const defined = target.filter((item) => item !== void 0);
	const undefinedCount = target.length - defined.length;
	return map(mergeSort(defined), (items) => [...items, ...Array(undefinedCount).fill(void 0)]);
};
const arrayGlobal = (ctx) => {
	const builtins = ctx.builtins;
	const proto = builtins.Array;
	const wrap = (items) => new Arr(proto, items);
	const construct = (args, into) => {
		if (args.length !== 1) return new Arr(into, [...args]);
		const first = args[0];
		if (typeof first !== "number") return new Arr(into, [first]);
		if (!Number.isInteger(first) || first < 0 || first > 1e7) throw rangeError("Invalid array length.");
		return new Arr(into, new Array(first));
	};
	const array = constructor(builtins, proto, {
		name: "Array",
		length: 1,
		call: (_, args) => sync(() => construct(args, proto)),
		construct: (args, newTarget) => sync(() => construct(args, prototypeFrom(newTarget, proto)))
	});
	methods(builtins, array, [
		[
			"isArray",
			1,
			(_, args) => args[0] instanceof Arr
		],
		[
			"of",
			0,
			(_, args) => wrap([...args])
		],
		[
			"from",
			1,
			(_, args) => arrayFrom(ctx, args)
		]
	]);
	const self = (thisValue, name) => receiver(Arr, thisValue, `Array.prototype.${name}`);
	const mutable = (target, growth) => {
		const length = target.items.length;
		if ((growth ?? 0) > 0) rejectAddition(target, length);
		if ((growth ?? 0) < 0 && length > 0 && !target.elements.configurable) throw typeError(`Cannot delete property '${length - 1}'.`);
		if (!target.elements.writable && (length > 0 || growth !== void 0)) throw typeError(`Cannot assign to read only property '${length > 0 ? 0 : "length"}'.`);
		return target;
	};
	const optNumber = (value) => value === void 0 ? void 0 : coerceToInteger(value);
	methods(builtins, proto, [
		[
			"join",
			1,
			(thisValue, args) => {
				const parts = Array.from(self(thisValue, "join").items, (item) => item ?? "");
				return withPrimitives(ctx, "string", [args[0] === void 0 ? "," : args[0], ...parts], ([separator, ...items]) => {
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
		[
			"indexOf",
			1,
			(thisValue, args) => self(thisValue, "indexOf").items.indexOf(args[0], optNumber(args[1]))
		],
		[
			"lastIndexOf",
			1,
			(thisValue, args) => {
				const target = self(thisValue, "lastIndexOf").items;
				return args.length < 2 ? target.lastIndexOf(args[0]) : target.lastIndexOf(args[0], optNumber(args[1]));
			}
		],
		[
			"at",
			1,
			(thisValue, args) => self(thisValue, "at").items.at(optNumber(args[0]) ?? 0)
		],
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
				if (target.items.length > 1) mutable(target);
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
				return map(sortArray(ctx, items, args[0], "Array.sort"), (sorted) => {
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
			(thisValue, args) => map(sortArray(ctx, self(thisValue, "toSorted").items, args[0], "Array.toSorted"), wrap)
		],
		[
			"toReversed",
			0,
			(thisValue) => wrap([...self(thisValue, "toReversed").items].reverse())
		],
		[
			"with",
			2,
			(thisValue, args) => {
				const target = self(thisValue, "with").items;
				const index = optNumber(args[0]) ?? 0;
				const resolved = index < 0 ? target.length + index : index;
				if (resolved < 0 || resolved >= target.length) throw rangeError("Array.with index is out of range.");
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
				for (const item of args) rejectCircularInsertion(target, item, "Array.push result");
				return target.items.push(...args);
			}
		],
		[
			"unshift",
			1,
			(thisValue, args) => {
				const target = mutable(self(thisValue, "unshift"), args.length);
				for (const item of args) rejectCircularInsertion(target, item, "Array.unshift result");
				return target.items.unshift(...args);
			}
		],
		[
			"pop",
			0,
			(thisValue) => mutable(self(thisValue, "pop"), -1).items.pop()
		],
		[
			"shift",
			0,
			(thisValue) => mutable(self(thisValue, "shift"), -1).items.shift()
		],
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
				for (const item of inserted) rejectCircularInsertion(target, item, "Array.splice result");
				mutable(target, inserted.length - deleteCount);
				return wrap(target.items.splice(from, deleteCount, ...inserted));
			}
		],
		[
			"toSpliced",
			2,
			(thisValue, args) => {
				const copied = [...self(thisValue, "toSpliced").items];
				if (args.length === 0) return wrap(copied);
				const start = optNumber(args[0]) ?? 0;
				if (args.length === 1) copied.splice(start);
				else copied.splice(start, optNumber(args[1]) ?? 0, ...args.slice(2));
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
			(thisValue) => map(forEach(self(thisValue, "toLocaleString").items, (item) => item === null || item === void 0 ? succeed$1("") : map(invoke(ctx, item, "toLocaleString", "Array.prototype.toLocaleString"), coerceToString)), (parts) => parts.join(","))
		],
		[
			"keys",
			0,
			(thisValue) => hostIterator(builtins, self(thisValue, "keys").items.keys())
		],
		[
			"values",
			0,
			(thisValue) => hostIterator(builtins, self(thisValue, "values").items.values())
		],
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
				return gen(function* () {
					const length = target.items.length;
					const values = [];
					for (let index = 0; index < length; index += 1) {
						if (!(index in target.items)) continue;
						const mapped = yield* apply([
							target.items[index],
							index,
							target
						], args[1]);
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
	define(proto, IteratorSymbol, get(proto, "values"), hidden);
	return array;
};
/**
* The callback methods Array and Uint8Array share. They fix the iteration length while reading existing elements
* live; `wrap` builds the collection `map` and `filter` return.
*/
const callbackMethods = (ctx, label, self, elements, wrap) => {
	const iterate = (name, length, body) => [
		name,
		length,
		(thisValue, args) => {
			const target = self(thisValue, name);
			const call = applyCollectionCallback(ctx, args[0], `${label}.${name}`);
			const thisArg = name.startsWith("reduce") ? void 0 : args[1];
			return body(elements(target), target, (callbackArgs) => call(callbackArgs, thisArg), args);
		}
	];
	return [
		iterate("map", 1, (target, receiver, apply) => gen(function* () {
			const length = target.length;
			const values = [];
			values.length = length;
			for (let index = 0; index < length; index += 1) {
				if (!(index in target)) continue;
				values[index] = yield* apply([
					target[index],
					index,
					receiver
				]);
			}
			return wrap(values);
		})),
		iterate("filter", 1, (target, receiver, apply) => gen(function* () {
			const length = target.length;
			const values = [];
			for (let index = 0; index < length; index += 1) {
				if (!(index in target)) continue;
				const item = target[index];
				if (yield* apply([
					item,
					index,
					receiver
				])) values.push(item);
			}
			return wrap(values);
		})),
		iterate("find", 1, (target, receiver, apply) => gen(function* () {
			const length = target.length;
			for (let index = 0; index < length; index += 1) {
				const item = target[index];
				if (yield* apply([
					item,
					index,
					receiver
				])) return item;
			}
		})),
		iterate("findIndex", 1, (target, receiver, apply) => gen(function* () {
			const length = target.length;
			for (let index = 0; index < length; index += 1) if (yield* apply([
				target[index],
				index,
				receiver
			])) return index;
			return -1;
		})),
		iterate("findLast", 1, (target, receiver, apply) => gen(function* () {
			for (let index = target.length - 1; index >= 0; index -= 1) {
				const item = target[index];
				if (yield* apply([
					item,
					index,
					receiver
				])) return item;
			}
		})),
		iterate("findLastIndex", 1, (target, receiver, apply) => gen(function* () {
			for (let index = target.length - 1; index >= 0; index -= 1) if (yield* apply([
				target[index],
				index,
				receiver
			])) return index;
			return -1;
		})),
		iterate("some", 1, (target, receiver, apply) => gen(function* () {
			const length = target.length;
			for (let index = 0; index < length; index += 1) {
				if (!(index in target)) continue;
				if (yield* apply([
					target[index],
					index,
					receiver
				])) return true;
			}
			return false;
		})),
		iterate("every", 1, (target, receiver, apply) => gen(function* () {
			const length = target.length;
			for (let index = 0; index < length; index += 1) {
				if (!(index in target)) continue;
				if (!(yield* apply([
					target[index],
					index,
					receiver
				]))) return false;
			}
			return true;
		})),
		iterate("forEach", 1, (target, receiver, apply) => gen(function* () {
			const length = target.length;
			for (let index = 0; index < length; index += 1) if (index in target) yield* apply([
				target[index],
				index,
				receiver
			]);
		})),
		iterate("reduce", 1, (target, receiver, apply, args) => gen(function* () {
			const length = target.length;
			let start = 0;
			let accumulator = args[1];
			if (args.length < 2) {
				while (start < length && !(start in target)) start += 1;
				if (start === length) throw typeError(`${label}.reduce of an empty array with no initial value.`);
				accumulator = target[start];
				start += 1;
			}
			for (let index = start; index < length; index += 1) {
				if (!(index in target)) continue;
				accumulator = yield* apply([
					accumulator,
					target[index],
					index,
					receiver
				]);
			}
			return accumulator;
		})),
		iterate("reduceRight", 1, (target, receiver, apply, args) => gen(function* () {
			let start = target.length - 1;
			let accumulator = args[1];
			if (args.length < 2) {
				while (start >= 0 && !(start in target)) start -= 1;
				if (start < 0) throw typeError(`${label}.reduceRight of an empty array with no initial value.`);
				accumulator = target[start];
				start -= 1;
			}
			for (let index = start; index >= 0; index -= 1) {
				if (!(index in target)) continue;
				accumulator = yield* apply([
					accumulator,
					target[index],
					index,
					receiver
				]);
			}
			return accumulator;
		}))
	];
};
// node_modules/@opencode/codemode/dist/stdlib/bytes.js
/**
* The bytes a Uint8Array, array, or other iterable of numbers describes; the host array clamps each value. As in
* TypedArray.from, a mapper sees the original values, after the source is consumed in full.
*/
const collectBytes = (ctx, source, name, mapper, thisArg) => {
	const apply = mapper === void 0 ? void 0 : applyCollectionCallback(ctx, mapper, name);
	if (source instanceof Bytes && apply === void 0) return succeed$1(new Uint8Array(source.bytes));
	return gen(function* () {
		const cursor = yield* ctx.iterate(source);
		if (cursor === void 0) throw typeError(`${name} expects a Uint8Array, an array, or an iterable of numbers, received ${describeValue(source)}.`);
		const values = [];
		while (true) {
			const step = yield* cursor.next;
			if (step.done) break;
			values.push(step.value);
			checkArrayLength(values.length);
		}
		const mapped = apply === void 0 ? values : yield* forEach(values, (value, index) => apply([value, index], thisArg));
		return Uint8Array.from(mapped, coerceToNumber);
	});
};
const constructBytes = (ctx, args, proto) => {
	const source = args[0];
	if (source !== null && typeof source === "object") return map(collectBytes(ctx, source, "new Uint8Array(...)"), (bytes) => new Bytes(proto, bytes));
	const length = source === void 0 ? 0 : coerceToNumber(source);
	if (!Number.isInteger(length) || length < 0) throw rangeError(`Invalid typed array length: ${coerceToString(source)}`);
	checkArrayLength(length);
	return succeed$1(new Bytes(proto, new Uint8Array(length)));
};
const uint8ArrayGlobal = (ctx) => {
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
		if (typeof args[0] !== "string") throw typeError(`Uint8Array.${name} expects a string.`);
		try {
			return wrap(from(args[0]));
		} catch {
			throw syntaxError(`Uint8Array.${name}: the string is not valid ${name === "fromHex" ? "hex" : "base64"}.`);
		}
	};
	methods(builtins, uint8Array, [
		[
			"from",
			1,
			(_, args) => map(collectBytes(ctx, args[0], "Uint8Array.from", args[1], args[2]), wrap)
		],
		[
			"of",
			0,
			(_, args) => wrap(Uint8Array.from(args, coerceToNumber))
		],
		[
			"fromBase64",
			1,
			(_, args) => decode("fromBase64", args, (text) => Uint8Array.fromBase64(text))
		],
		[
			"fromHex",
			1,
			(_, args) => decode("fromHex", args, (text) => Uint8Array.fromHex(text))
		]
	]);
	const self = (thisValue, name) => receiver(Bytes, thisValue, `Uint8Array.prototype.${name}`);
	const optNumber = (value) => value === void 0 ? void 0 : coerceToInteger(value);
	const search = (value) => typeof value === "number" ? value : NaN;
	const wrapAll = (items) => new Arr(builtins.Array, items);
	defineAccessor(proto, "length", (thisValue) => self(thisValue, "length").bytes.length);
	methods(builtins, proto, [
		[
			"at",
			1,
			(thisValue, args) => self(thisValue, "at").bytes.at(optNumber(args[0]) ?? 0)
		],
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
				return map(collectBytes(ctx, args[0], "Uint8Array.set"), (source) => {
					if (!Number.isInteger(offset) || offset < 0 || source.length + offset > target.bytes.length) throw rangeError("Uint8Array.set: the source does not fit at that offset.");
					target.bytes.set(source, offset);
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
				if (args[0] === void 0) {
					target.bytes.sort();
					return target;
				}
				return map(sortArray(ctx, [...target.bytes], args[0], "Uint8Array.sort"), (sorted) => {
					target.bytes.set(Uint8Array.from(sorted, coerceToNumber));
					return target;
				});
			}
		],
		[
			"indexOf",
			1,
			(thisValue, args) => self(thisValue, "indexOf").bytes.indexOf(search(args[0]), optNumber(args[1]))
		],
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
				const joined = self(thisValue, "join").bytes.join(args[0] === void 0 ? "," : coerceToString(args[0]));
				checkStringLength(joined.length);
				return joined;
			}
		],
		[
			"toString",
			0,
			(thisValue) => self(thisValue, "toString").bytes.join(",")
		],
		[
			"toBase64",
			0,
			(thisValue) => self(thisValue, "toBase64").bytes.toBase64()
		],
		[
			"toHex",
			0,
			(thisValue) => self(thisValue, "toHex").bytes.toHex()
		],
		[
			"keys",
			0,
			(thisValue) => hostIterator(builtins, self(thisValue, "keys").bytes.keys())
		],
		[
			"values",
			0,
			(thisValue) => hostIterator(builtins, self(thisValue, "values").bytes.values())
		],
		[
			"entries",
			0,
			(thisValue) => hostIterator(builtins, self(thisValue, "entries").bytes.entries().map(([index, byte]) => wrapAll([index, byte])))
		],
		...callbackMethods(ctx, "Uint8Array", self, (target) => target.bytes, (values) => wrap(Uint8Array.from(values, coerceToNumber)))
	]);
	define(proto, IteratorSymbol, get(proto, "values"), hidden);
	return uint8Array;
};
const textEncoderGlobal = (ctx) => {
	const builtins = ctx.builtins;
	const proto = builtins.TextEncoder;
	const encoder = new TextEncoder();
	defineAccessor(proto, "encoding", () => "utf-8");
	methods(builtins, proto, [[
		"encode",
		0,
		(_, args) => new Bytes(builtins.Uint8Array, encoder.encode(coerceToString(args[0] ?? "")))
	]]);
	return constructor(builtins, proto, {
		name: "TextEncoder",
		call: requiresNew("TextEncoder"),
		construct: (_, newTarget) => succeed$1(new Obj(prototypeFrom(newTarget, proto)))
	});
};
/** A `TextDecoder` holding the host decoder its label and options configured. */
var TextDecoderObj = class extends Obj {
	decoder;
	constructor(proto, decoder) {
		super(proto);
		this.decoder = decoder;
	}
};
const utf8Labels = /* @__PURE__ */ new Set([
	"unicode-1-1-utf-8",
	"unicode11utf8",
	"unicode20utf8",
	"utf-8",
	"utf8",
	"x-unicode20utf8"
]);
const textDecoderGlobal = (ctx) => {
	const builtins = ctx.builtins;
	const proto = builtins.TextDecoder;
	const self = (thisValue, name) => receiver(TextDecoderObj, thisValue, `TextDecoder.prototype.${name}`);
	defineAccessor(proto, "encoding", (thisValue) => self(thisValue, "encoding").decoder.encoding);
	defineAccessor(proto, "fatal", (thisValue) => self(thisValue, "fatal").decoder.fatal);
	defineAccessor(proto, "ignoreBOM", (thisValue) => self(thisValue, "ignoreBOM").decoder.ignoreBOM);
	methods(builtins, proto, [[
		"decode",
		0,
		(thisValue, args) => {
			const decoder = self(thisValue, "decode").decoder;
			if (args[0] === void 0) return "";
			if (!(args[0] instanceof Bytes)) throw typeError(`TextDecoder.decode expects a Uint8Array, received ${describeValue(args[0])}.`);
			try {
				return decoder.decode(args[0].bytes);
			} catch {
				throw typeError(`TextDecoder.decode: the input is not valid ${decoder.encoding}.`);
			}
		}
	]]);
	return constructor(builtins, proto, {
		name: "TextDecoder",
		call: requiresNew("TextDecoder"),
		construct: (args, newTarget) => sync(() => {
			const label = args[0] === void 0 ? "utf-8" : coerceToString(args[0]).trim().toLowerCase();
			if (!utf8Labels.has(label)) throw rangeError(`The "${label}" encoding is not supported; only UTF-8 is.`);
			const options = args[1] instanceof Obj ? args[1] : void 0;
			const flag = (name) => options !== void 0 && Boolean(get(options, name));
			return new TextDecoderObj(prototypeFrom(newTarget, proto), new TextDecoder("utf-8", {
				fatal: flag("fatal"),
				ignoreBOM: flag("ignoreBOM")
			}));
		})
	});
};
// node_modules/@opencode/codemode/dist/stdlib/collections.js
const coerceGroupByPropertyKey = (ctx, value) => {
	if (value instanceof PromiseObj) return succeed$1(coerceToString(value));
	if (isOpaque(value)) throw invalidData(`Object.groupBy callback must return a data value, received ${describeValue(value)}.`);
	return toPrimitiveString(ctx, value);
};
/** `Map.groupBy` and `Object.groupBy`: the same iteration, keyed into a Map or a data object. */
const groupBy = (ctx, namespace) => fn(ctx.builtins, "groupBy", 2, (_, args) => {
	const builtins = ctx.builtins;
	const source = args[0];
	if (source === null || source === void 0) throw typeError(`${namespace}.groupBy expects an iterable collection.`);
	const apply = applyCollectionCallback(ctx, args[1], `${namespace}.groupBy`);
	return gen(function* () {
		const cursor = yield* ctx.iterate(source);
		if (cursor === void 0) throw typeError(`${namespace}.groupBy expects an iterable collection.`);
		if (namespace === "Map") {
			const result = new MapObj(builtins.Map);
			let index = 0;
			while (true) {
				const step = yield* cursor.next;
				if (step.done) return result;
				const item = step.value;
				const key = yield* preserveConsumerError(cursor.close, apply([item, index]));
				const group = result.map.get(key);
				if (group === void 0) result.map.set(key, new Arr(builtins.Array, [item]));
				else group.items.push(item);
				index += 1;
			}
		}
		const result = new Obj(null);
		let index = 0;
		while (true) {
			const step = yield* cursor.next;
			if (step.done) return result;
			const item = step.value;
			const key = yield* preserveConsumerError(cursor.close, flatMap(apply([item, index]), (value) => coerceGroupByPropertyKey(ctx, value)));
			const group = getOwn(result, key);
			if (group === void 0) define(result, key, new Arr(builtins.Array, [item]));
			else group.items.push(item);
			index += 1;
		}
	});
});
const constructMap = (ctx, init, proto) => {
	const target = new MapObj(proto);
	if (init === void 0 || init === null) return succeed$1(target);
	return gen(function* () {
		const cursor = yield* ctx.iterate(init);
		if (cursor === void 0) throw typeError(`new Map(...) expects an iterable of [key, value] pairs, received ${describeValue(init)}.`);
		while (true) {
			const step = yield* cursor.next;
			if (step.done) return target;
			yield* preserveConsumerError(cursor.close, sync(() => {
				if (!(step.value instanceof Obj)) throw typeError("new Map(...) expects [key, value] pairs as entry objects.");
				target.map.set(getOwn(step.value, 0), getOwn(step.value, 1));
			}));
		}
	});
};
const constructSet = (ctx, init, proto) => {
	const target = new SetObj(proto);
	if (init === void 0 || init === null) return succeed$1(target);
	return gen(function* () {
		const cursor = yield* ctx.iterate(init);
		if (cursor === void 0) throw typeError(`new Set(...) expects a synchronous iterable, received ${describeValue(init)}.`);
		while (true) {
			const step = yield* cursor.next;
			if (step.done) return target;
			target.set.add(step.value);
		}
	});
};
const mapGlobal = (ctx) => {
	const builtins = ctx.builtins;
	const proto = builtins.Map;
	const map$5 = constructor(builtins, proto, {
		name: "Map",
		call: requiresNew("Map"),
		construct: (args, newTarget) => constructMap(ctx, args[0], prototypeFrom(newTarget, proto))
	});
	define(map$5, "groupBy", groupBy(ctx, "Map"), hidden);
	const self = (thisValue, name) => receiver(MapObj, thisValue, `Map.prototype.${name}`);
	defineAccessor(proto, "size", (thisValue) => receiver(MapObj, thisValue, "Map.prototype.size").map.size);
	methods(builtins, proto, [
		[
			"get",
			1,
			(thisValue, args) => self(thisValue, "get").map.get(args[0])
		],
		[
			"has",
			1,
			(thisValue, args) => self(thisValue, "has").map.has(args[0])
		],
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
				if (!target.has(args[0])) target.set(args[0], args[1]);
				return target.get(args[0]);
			}
		],
		[
			"getOrInsertComputed",
			2,
			(thisValue, args) => {
				const target = self(thisValue, "getOrInsertComputed").map;
				const apply = applyCollectionCallback(ctx, args[1], "Map.getOrInsertComputed");
				if (target.has(args[0])) return target.get(args[0]);
				return map(apply([args[0] === 0 ? 0 : args[0]]), (value) => {
					target.set(args[0], value);
					return value;
				});
			}
		],
		[
			"delete",
			1,
			(thisValue, args) => self(thisValue, "delete").map.delete(args[0])
		],
		[
			"clear",
			0,
			(thisValue) => {
				self(thisValue, "clear").map.clear();
			}
		],
		[
			"keys",
			0,
			(thisValue) => hostIterator(builtins, self(thisValue, "keys").map.keys())
		],
		[
			"values",
			0,
			(thisValue) => hostIterator(builtins, self(thisValue, "values").map.values())
		],
		[
			"entries",
			0,
			(thisValue) => hostIterator(builtins, self(thisValue, "entries").iterator(builtins))
		],
		[
			"forEach",
			1,
			(thisValue, args) => {
				const target = self(thisValue, "forEach");
				const apply = applyCollectionCallback(ctx, args[0], "Map.forEach");
				return gen(function* () {
					for (const [key, item] of target.map.entries()) yield* apply([
						item,
						key,
						target
					], args[1]);
				});
			}
		]
	]);
	define(proto, IteratorSymbol, get(proto, "entries"), hidden);
	return map$5;
};
const loadSetRecord = (ctx, source, name) => {
	if (source instanceof SetObj) return succeed$1({
		size: source.set.size,
		has: (item) => succeed$1(source.set.has(item)),
		keys: () => succeed$1(source.set.values())
	});
	if (source instanceof MapObj) return succeed$1({
		size: source.map.size,
		has: (item) => succeed$1(source.map.has(item)),
		keys: () => succeed$1(source.map.keys())
	});
	if (!(source instanceof Obj)) throw typeError(`Set.${name} expects a Set-like object.`);
	return gen(function* () {
		const size = yield* toPrimitiveNumber(ctx, get(source, "size"));
		if (Number.isNaN(size)) throw typeError(`Set.${name} received a Set-like object with an invalid size.`);
		const has = get(source, "has");
		const keys = get(source, "keys");
		if (!isSupportedCallback(has) || !isSupportedCallback(keys)) throw typeError(`Set.${name} expects callable 'has' and 'keys' methods.`);
		return {
			size: Math.max(Math.trunc(size), 0),
			has: (item) => map(ctx.call(has, source, [item]), Boolean),
			keys: () => gen(function* () {
				const result = yield* ctx.call(keys, source, []);
				const cursor = result instanceof Arr ? hostCursor(result.items.values()) : ctx.iterateDirect(result);
				const items = [];
				while (true) {
					const step = yield* cursor.next;
					if (step.done) return items;
					items.push(step.value);
				}
			})
		};
	});
};
const setOperation = (ctx, target, name, source) => gen(function* () {
	const other = yield* loadSetRecord(ctx, source, name);
	const copy = () => {
		const result = new SetObj(ctx.builtins.Set);
		for (const item of target.set.values()) result.set.add(item);
		return result;
	};
	if (name === "union") {
		const result = copy();
		for (const item of yield* other.keys()) result.set.add(item);
		return result;
	}
	if (name === "intersection") {
		const result = new SetObj(ctx.builtins.Set);
		if (target.set.size <= other.size) {
			for (const item of target.set.values()) if (yield* other.has(item)) result.set.add(item);
			return result;
		}
		for (const item of yield* other.keys()) if (target.set.has(item)) result.set.add(item);
		return result;
	}
	if (name === "difference") {
		const result = copy();
		if (target.set.size <= other.size) {
			for (const item of result.set.values()) if (yield* other.has(item)) result.set.delete(item);
			return result;
		}
		for (const item of yield* other.keys()) result.set.delete(item);
		return result;
	}
	if (name === "symmetricDifference") {
		const result = copy();
		for (const item of yield* other.keys()) if (target.set.has(item)) result.set.delete(item);
		else result.set.add(item);
		return result;
	}
	if (name === "isSubsetOf") {
		if (target.set.size > other.size) return false;
		for (const item of target.set.values()) if (!(yield* other.has(item))) return false;
		return true;
	}
	if (name === "isSupersetOf") {
		if (target.set.size < other.size) return false;
		for (const item of yield* other.keys()) if (!target.set.has(item)) return false;
		return true;
	}
	if (target.set.size <= other.size) {
		for (const item of target.set.values()) if (yield* other.has(item)) return false;
		return true;
	}
	for (const item of yield* other.keys()) if (target.set.has(item)) return false;
	return true;
});
const setGlobal = (ctx) => {
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
		[
			"has",
			1,
			(thisValue, args) => self(thisValue, "has").set.has(args[0])
		],
		[
			"add",
			1,
			(thisValue, args) => {
				const target = self(thisValue, "add");
				target.set.add(args[0]);
				return target;
			}
		],
		[
			"delete",
			1,
			(thisValue, args) => self(thisValue, "delete").set.delete(args[0])
		],
		[
			"clear",
			0,
			(thisValue) => {
				self(thisValue, "clear").set.clear();
			}
		],
		[
			"keys",
			0,
			(thisValue) => hostIterator(builtins, self(thisValue, "keys").set.values())
		],
		[
			"values",
			0,
			(thisValue) => hostIterator(builtins, self(thisValue, "values").set.values())
		],
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
				return gen(function* () {
					for (const item of target.set.values()) yield* apply([
						item,
						item,
						target
					], args[1]);
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
	define(proto, IteratorSymbol, get(proto, "values"), hidden);
	return set;
};
const weakKey = (value, label) => {
	if (value instanceof Obj) return value;
	throw typeError(`Invalid value used ${label}: ${describeValue(value)} cannot be held weakly.`);
};
const weakMapGlobal = (ctx) => {
	const builtins = ctx.builtins;
	const proto = builtins.WeakMap;
	const weakMap = constructor(builtins, proto, {
		name: "WeakMap",
		call: requiresNew("WeakMap"),
		construct: (args, newTarget) => {
			const target = new WeakMapObj(prototypeFrom(newTarget, proto));
			if (args[0] === void 0 || args[0] === null) return succeed$1(target);
			return gen(function* () {
				const cursor = yield* ctx.iterate(args[0]);
				if (cursor === void 0) throw typeError(`new WeakMap(...) expects an iterable of [key, value] pairs, received ${describeValue(args[0])}.`);
				while (true) {
					const step = yield* cursor.next;
					if (step.done) return target;
					yield* preserveConsumerError(cursor.close, sync(() => {
						if (!(step.value instanceof Obj)) throw typeError("new WeakMap(...) expects [key, value] pairs as entry objects.");
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
				return args[0] instanceof Obj ? target.get(args[0]) : void 0;
			}
		],
		[
			"has",
			1,
			(thisValue, args) => self(thisValue, "has").has(args[0])
		],
		[
			"delete",
			1,
			(thisValue, args) => self(thisValue, "delete").delete(args[0])
		],
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
				if (!target.has(k)) target.set(k, args[1]);
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
				if (target.has(k)) return target.get(k);
				return map(apply([k]), (value) => {
					target.set(k, value);
					return value;
				});
			}
		]
	]);
	return weakMap;
};
const weakSetGlobal = (ctx) => {
	const builtins = ctx.builtins;
	const proto = builtins.WeakSet;
	const weakSet = constructor(builtins, proto, {
		name: "WeakSet",
		call: requiresNew("WeakSet"),
		construct: (args, newTarget) => {
			const target = new WeakSetObj(prototypeFrom(newTarget, proto));
			if (args[0] === void 0 || args[0] === null) return succeed$1(target);
			return gen(function* () {
				const cursor = yield* ctx.iterate(args[0]);
				if (cursor === void 0) throw typeError(`new WeakSet(...) expects a synchronous iterable, received ${describeValue(args[0])}.`);
				while (true) {
					const step = yield* cursor.next;
					if (step.done) return target;
					yield* preserveConsumerError(cursor.close, sync(() => {
						target.set.add(weakKey(step.value, "in weak set"));
					}));
				}
			});
		}
	});
	const self = (thisValue, name) => receiver(WeakSetObj, thisValue, `WeakSet.prototype.${name}`).set;
	methods(builtins, proto, [
		[
			"has",
			1,
			(thisValue, args) => self(thisValue, "has").has(args[0])
		],
		[
			"delete",
			1,
			(thisValue, args) => self(thisValue, "delete").delete(args[0])
		],
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
// node_modules/@opencode/codemode/dist/stdlib/date.js
const constructDate = (ctx, args, proto) => {
	if (args.length === 0) return succeed$1(new DateObj(proto, Date.now()));
	if (args.length === 1) {
		const arg = args[0];
		if (arg instanceof DateObj) return succeed$1(new DateObj(proto, arg.time));
		return map(toPrimitive(ctx, arg, "default"), (value) => typeof value === "string" ? new DateObj(proto, Date.parse(value)) : new DateObj(proto, new Date(coerceToNumber(value)).getTime()));
	}
	return map(forEach(args.slice(0, 7), (arg) => toPrimitiveNumber(ctx, arg), { concurrency: 1 }), (parts) => new DateObj(proto, new Date(...parts).getTime()));
};
const getters = [
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
const setters = [
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
const dateGlobal = (ctx) => {
	const builtins = ctx.builtins;
	const proto = builtins.Date;
	const date = constructor(builtins, proto, {
		name: "Date",
		length: 7,
		call: () => sync(() => (/* @__PURE__ */ new Date()).toISOString()),
		construct: (args, newTarget) => constructDate(ctx, args, prototypeFrom(newTarget, proto))
	});
	methods(builtins, date, [
		[
			"now",
			0,
			() => Date.now()
		],
		[
			"parse",
			1,
			(_, args) => Date.parse(coerceToString(args[0]))
		],
		[
			"UTC",
			7,
			(_, args) => map(forEach(args.slice(0, 7), (arg) => toPrimitiveNumber(ctx, arg), { concurrency: 1 }), (parts) => Date.UTC(...parts))
		]
	]);
	const self = (thisValue, name) => receiver(DateObj, thisValue, `Date.prototype.${name}`);
	const iso = (value) => {
		if (!Number.isFinite(value.time)) throw rangeError("Invalid time value.");
		return new Date(value.time).toISOString();
	};
	methods(builtins, proto, [
		[
			"getTime",
			0,
			(thisValue) => self(thisValue, "getTime").time
		],
		[
			"valueOf",
			0,
			(thisValue) => self(thisValue, "valueOf").time
		],
		[
			"toISOString",
			0,
			(thisValue) => iso(self(thisValue, "toISOString"))
		],
		[
			"toJSON",
			1,
			(thisValue) => {
				const value = self(thisValue, "toJSON");
				return Number.isFinite(value.time) ? iso(value) : null;
			}
		],
		[
			"toString",
			0,
			(thisValue) => coerceToString(self(thisValue, "toString"))
		],
		[
			"toDateString",
			0,
			(thisValue) => new Date(self(thisValue, "toDateString").time).toDateString()
		],
		[
			"toTimeString",
			0,
			(thisValue) => new Date(self(thisValue, "toTimeString").time).toTimeString()
		],
		[
			"toUTCString",
			0,
			(thisValue) => new Date(self(thisValue, "toUTCString").time).toUTCString()
		],
		[
			"toGMTString",
			0,
			(thisValue) => new Date(self(thisValue, "toGMTString").time).toUTCString()
		],
		...[
			"toLocaleString",
			"toLocaleDateString",
			"toLocaleTimeString"
		].map((name) => [
			name,
			0,
			(thisValue) => new Date(self(thisValue, name).time)[name]("en-US", { timeZone: "UTC" })
		]),
		...getters.map((name) => [
			name,
			0,
			(thisValue) => new Date(self(thisValue, name).time)[name]()
		]),
		...setters.map(([name, length]) => [
			name,
			length,
			(thisValue, args) => {
				const target = self(thisValue, name);
				const hosted = new Date(target.time);
				return map(forEach(args.slice(0, length), (arg) => toPrimitiveNumber(ctx, arg), { concurrency: 1 }), (values) => {
					if (Number.isNaN(hosted.getTime()) && name !== "setTime" && !name.endsWith("FullYear")) return NaN;
					target.time = hosted[name](...values);
					return target.time;
				});
			}
		])
	]);
	return date;
};
// node_modules/@opencode/codemode/dist/stdlib/json.js
const jsonGlobal = (ctx) => {
	const json = new Obj(ctx.builtins.Object);
	methods(ctx.builtins, json, [[
		"parse",
		2,
		(_, args) => parse(ctx, args)
	], [
		"stringify",
		3,
		(_, args) => stringify(ctx, args)
	]]);
	return json;
};
const parse = (ctx, args) => {
	const text = coerceToString(args[0]);
	const parsed = (() => {
		try {
			return fromJson(ctx, JSON.parse(text));
		} catch (error) {
			throw syntaxError(`JSON.parse received invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
		}
	})();
	if (typeofValue(args[1]) !== "function") return succeed$1(parsed);
	const apply = applyCollectionCallback(ctx, args[1], "JSON.parse");
	const visit = (holder, key) => gen(function* () {
		const value = get(holder, key);
		if (value instanceof Obj) for (const name of keys(value)) {
			const revived = yield* visit(value, name);
			if (revived === void 0) remove(value, name);
			else set(value, name, revived);
		}
		return yield* apply([key, value], holder);
	});
	return visit(record(ctx.builtins.Object, { "": parsed }), "");
};
const stringify = (ctx, args) => {
	const space = args[2];
	const indent = typeof space === "number" || typeof space === "string" ? space : void 0;
	const replacer = args[1];
	const properties = replacer instanceof Arr ? replacer.items.filter((item) => typeof item === "string" || typeof item === "number").map(String) : null;
	const callback = typeofValue(replacer) === "function" ? applyCollectionCallback(ctx, replacer, "JSON.stringify") : void 0;
	return map(toJson(ctx, args[0], callback), (value) => {
		const text = JSON.stringify(value, properties, indent);
		if (text !== void 0) checkStringLength(text.length);
		return text;
	});
};
// node_modules/@opencode/codemode/dist/stdlib/math.js
const mathGlobal = (ctx) => {
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
		[
			"random",
			0,
			() => Math.random()
		],
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
			(_, args) => gen(function* () {
				const cursor = yield* ctx.iterate(args[0]);
				if (cursor === void 0) throw typeError("Math.sumPrecise expects a synchronous iterable.");
				const numbers = [];
				while (true) {
					const step = yield* cursor.next;
					if (step.done) return Math.sumPrecise(numbers);
					yield* preserveConsumerError(cursor.close, sync(() => {
						if (typeof step.value !== "number") throw typeError("Math.sumPrecise expects an iterable of numbers.");
						numbers.push(step.value);
					}));
				}
			})
		]
	]);
	return math;
};
// node_modules/@opencode/codemode/dist/stdlib/value.js
const compoundOperators = /* @__PURE__ */ new Set([
	"+=",
	"-=",
	"*=",
	"/=",
	"%=",
	"**=",
	"&=",
	"|=",
	"^=",
	"<<=",
	">>=",
	">>>="
]);
const coerce = (ctx, name, args) => {
	if (args.length === 0) {
		if (name === "Number") return 0;
		if (name === "String") return "";
	}
	const raw = args[0];
	if (name === "Boolean") return Boolean(raw);
	if (name === "parseInt") return withPrimitives(ctx, ["string", "number"], [raw, args[1]], ([text, radix]) => parseInt(coerceToString(text), coerceToNumber(radix)));
	return withPrimitives(ctx, name === "String" || name === "parseFloat" ? "string" : "number", [raw], ([value]) => {
		if (name === "Number") return coerceToNumber(value);
		if (name === "isFinite") return Number.isFinite(coerceToNumber(value));
		if (name === "isNaN") return Number.isNaN(coerceToNumber(value));
		if (name === "parseFloat") return parseFloat(coerceToString(value));
		return coerceToString(value);
	});
};
/** A global coercion function such as `Number` or `parseInt`. */
const coercion = (ctx, name, length = 1) => fn(ctx.builtins, name, length, (_, args) => coerce(ctx, name, args));
// node_modules/@opencode/codemode/dist/stdlib/number.js
const numberGlobal = (ctx) => {
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
		NaN: NaN,
		POSITIVE_INFINITY: Number.POSITIVE_INFINITY,
		NEGATIVE_INFINITY: Number.NEGATIVE_INFINITY
	});
	methods(builtins, number, [
		[
			"isInteger",
			1,
			(_, args) => Number.isInteger(args[0])
		],
		[
			"isFinite",
			1,
			(_, args) => Number.isFinite(args[0])
		],
		[
			"isNaN",
			1,
			(_, args) => Number.isNaN(args[0])
		],
		[
			"isSafeInteger",
			1,
			(_, args) => Number.isSafeInteger(args[0])
		],
		[
			"parseInt",
			2,
			(_, args) => coerce(ctx, "parseInt", args)
		],
		[
			"parseFloat",
			1,
			(_, args) => coerce(ctx, "parseFloat", args)
		]
	]);
	const self = (thisValue, name) => {
		if (typeof thisValue === "number") return thisValue;
		throw typeError(`Number.prototype.${name} requires that 'this' be a Number.`);
	};
	const formatting = (name, op) => [
		name,
		1,
		(thisValue, args) => {
			const value = self(thisValue, name);
			return withPrimitives(ctx, "number", [args[0]], ([digits]) => op(value, digits === void 0 ? void 0 : coerceToNumber(digits)));
		}
	];
	methods(builtins, builtins.Number, [
		formatting("toFixed", (value, digits) => value.toFixed(digits)),
		[
			"toLocaleString",
			0,
			(thisValue) => self(thisValue, "toLocaleString").toLocaleString("en-US")
		],
		formatting("toExponential", (value, digits) => value.toExponential(digits)),
		formatting("toPrecision", (value, digits) => digits === void 0 ? value.toString() : value.toPrecision(digits)),
		formatting("toString", (value, radix) => value.toString(radix)),
		[
			"valueOf",
			0,
			(thisValue) => self(thisValue, "valueOf")
		]
	]);
	return number;
};
const booleanGlobal = (ctx) => {
	const builtins = ctx.builtins;
	const boolean = constructor(builtins, builtins.Boolean, {
		name: "Boolean",
		length: 1,
		call: coercion(ctx, "Boolean").call
	});
	const self = (thisValue, name) => {
		if (typeof thisValue === "boolean") return thisValue;
		throw typeError(`Boolean.prototype.${name} requires that 'this' be a Boolean.`);
	};
	methods(builtins, builtins.Boolean, [[
		"toString",
		0,
		(thisValue) => String(self(thisValue, "toString"))
	], [
		"valueOf",
		0,
		(thisValue) => self(thisValue, "valueOf")
	]]);
	return boolean;
};
// node_modules/@opencode/codemode/dist/stdlib/object.js
const enumerableSource = (ctx, label, value, node) => {
	if (value === null || value === void 0) throw typeError(`${label} cannot convert ${describeValue(value)} to an object.`, node);
	if (value instanceof PromiseObj) throw invalidData(`${label} received an un-awaited Promise; await it before inspecting the result.`, node);
	if (value instanceof ToolReference) throw invalidData(`${label} cannot read tool references: they are not plain data. Use Object.keys(tools) for names, or search({ query }) for signatures.`, node);
	if (typeof value === "string") return new Arr(ctx.builtins.Array, [...value]);
	if (value instanceof Obj) return value;
	return new Obj(ctx.builtins.Object);
};
const objectAssign = (ctx, args) => {
	const target = args[0];
	if (!(target instanceof Obj)) throw typeError(`Object.assign expects a data object or array target, received ${describeValue(target)}.`);
	const seen = /* @__PURE__ */ new Set();
	for (const source of args.slice(1)) {
		if (source === null || source === void 0) continue;
		const from = enumerableSource(ctx, "Object.assign(...)", source);
		for (const key of enumerableKeys(from)) {
			rejectCircularInsertion(target, getOwn(from, key), "Object.assign result", seen);
			if (!set(target, key, getOwn(from, key))) throw typeError(`Cannot assign to read only property '${String(key)}'.`);
		}
	}
	return target;
};
const objectFromEntries = (ctx, source) => {
	const out = new Obj(ctx.builtins.Object);
	return gen(function* () {
		const cursor = yield* ctx.iterate(source);
		if (cursor === void 0) throw typeError("Object.fromEntries expects a synchronous iterable of entries.");
		while (true) {
			const step = yield* cursor.next;
			if (step.done) return out;
			yield* preserveConsumerError(cursor.close, sync(() => {
				if (!(step.value instanceof Obj) || containsOpaqueReference(step.value)) throw typeError("Object.fromEntries expects [key, value] entry objects.");
				define(out, coerceToString(getOwn(step.value, 0)), getOwn(step.value, 1));
			}));
		}
	});
};
const classTag = (value) => {
	if (value === null) return "Null";
	if (value === void 0) return "Undefined";
	if (value instanceof Obj) return value.tag;
	if (typeof value === "string") return "String";
	if (typeof value === "number") return "Number";
	if (typeof value === "boolean") return "Boolean";
	return "Object";
};
const propertyKey$1 = (value) => value === AsyncIteratorSymbol || value === IteratorSymbol ? value : coerceToString(value);
const restrict = (level, value) => {
	if (!(value instanceof Obj)) return value;
	value.extensible = false;
	if (level === "preventExtensions") return value;
	if (value instanceof Bytes && value.bytes.length > 0) throw typeError(`Cannot ${level} array buffer views with elements.`);
	for (const slot of value.props.values()) {
		slot.configurable = false;
		if (level === "freeze" && "value" in slot) slot.writable = false;
	}
	if (value instanceof Arr) value.elements = {
		writable: level === "seal",
		enumerable: true,
		configurable: false
	};
	return value;
};
const integrity = (value, frozen) => {
	if (!(value instanceof Obj)) return true;
	if (value.extensible) return false;
	return ownKeys(value).every((key) => {
		const slot = own(value, key);
		return slot !== void 0 && !slot.configurable && !(frozen && "value" in slot && slot.writable);
	});
};
const objectGlobal = (ctx) => {
	const builtins = ctx.builtins;
	const construct = (args) => {
		const first = args[0];
		if (first === null || first === void 0) return new Obj(builtins.Object);
		if (first instanceof Obj) return first;
		throw typeError(`Object(${typeof first}) wrapper objects are not supported; use the primitive value directly.`);
	};
	const object = constructor(builtins, builtins.Object, {
		name: "Object",
		length: 1,
		call: (_, args) => sync(() => construct(args)),
		construct: (args) => sync(() => construct(args))
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
		[
			"hasOwn",
			2,
			(_, args) => hasOwn(enumerableSource(ctx, "Object.hasOwn(...)", args[0]), propertyKey$1(args[1]))
		],
		[
			"is",
			2,
			(_, args) => Object.is(args[0], args[1])
		],
		[
			"assign",
			2,
			(_, args) => objectAssign(ctx, args)
		],
		[
			"fromEntries",
			1,
			(_, args) => objectFromEntries(ctx, args[0])
		],
		[
			"freeze",
			1,
			(_, args) => restrict("freeze", args[0])
		],
		[
			"seal",
			1,
			(_, args) => restrict("seal", args[0])
		],
		[
			"preventExtensions",
			1,
			(_, args) => restrict("preventExtensions", args[0])
		],
		[
			"isFrozen",
			1,
			(_, args) => integrity(args[0], true)
		],
		[
			"isSealed",
			1,
			(_, args) => integrity(args[0], false)
		],
		[
			"isExtensible",
			1,
			(_, args) => args[0] instanceof Obj && args[0].extensible
		],
		[
			"getPrototypeOf",
			1,
			(_, args) => {
				if (args[0] instanceof Obj) return args[0].proto;
				const proto = primitivePrototype(builtins, args[0]);
				if (proto === void 0) throw typeError(`Object.getPrototypeOf cannot convert ${describeValue(args[0])} to an object.`);
				return proto;
			}
		],
		[
			"create",
			2,
			(_, args) => {
				if (args[0] !== null && !(args[0] instanceof Obj)) throw typeError("Object prototype may only be an Object or null.");
				if (args[1] !== void 0) throw typeError("Object.create property descriptors are not supported; assign the fields after creating the object.");
				return new Obj(args[0]);
			}
		]
	]);
	define(object, "groupBy", groupBy(ctx, "Object"), hidden);
	methods(builtins, builtins.Object, [
		[
			"hasOwnProperty",
			1,
			(thisValue, args) => hasOwn(receiver(Obj, thisValue, "Object.prototype.hasOwnProperty"), propertyKey$1(args[0]))
		],
		[
			"isPrototypeOf",
			1,
			(thisValue, args) => hasPrototype(args[0], receiver(Obj, thisValue, "Object.prototype.isPrototypeOf"))
		],
		[
			"propertyIsEnumerable",
			1,
			(thisValue, args) => own(receiver(Obj, thisValue, "Object.prototype.propertyIsEnumerable"), propertyKey$1(args[0]))?.enumerable === true
		],
		[
			"toString",
			0,
			(thisValue) => `[object ${classTag(thisValue)}]`
		],
		[
			"toLocaleString",
			0,
			(thisValue) => invoke(ctx, thisValue, "toString", "Object.prototype.toLocaleString")
		],
		[
			"valueOf",
			0,
			(thisValue) => {
				if (thisValue === null || thisValue === void 0) throw typeError("Object.prototype.valueOf called on null or undefined.");
				return thisValue;
			}
		]
	]);
	return object;
};
// node_modules/@opencode/codemode/dist/stdlib/regexp.js
const flagProperties = [
	"hasIndices",
	"global",
	"ignoreCase",
	"multiline",
	"sticky",
	"unicode",
	"unicodeSets",
	"dotAll"
];
const regexFailureReason = (error) => (error instanceof Error ? error.message : String(error)).replace(/^Invalid regular expression:\s*/i, "");
const escapeRegexHint = "To match special characters like ( ) [ ] { } + * ? . literally, escape them with a backslash (e.g. \"\\\\(\") or test for them with String.includes instead.";
const toHostRegex = (arg, method, extraFlags = "") => {
	if (arg instanceof RegExpObj) return arg.regex;
	const source = arg === void 0 ? "" : coerceToString(arg);
	try {
		return new RegExp(source, extraFlags);
	} catch (error) {
		throw syntaxError(`String.${method} received the string ${JSON.stringify(source)}, which is not a valid regular expression pattern (${regexFailureReason(error)}). ${escapeRegexHint}`);
	}
};
const matchToValue = (builtins, match) => {
	const result = new Arr(builtins.Array, Array.from(match, (group) => group));
	if (match.index !== void 0) define(result, "index", match.index);
	if (match.input !== void 0) define(result, "input", match.input);
	if (match.groups) define(result, "groups", record(builtins.Object, match.groups));
	if (match.indices) define(result, "indices", indicesToValue(builtins, match.indices));
	return result;
};
const constructRegExp = (builtins, args, proto = builtins.RegExp) => {
	const first = args[0];
	const pattern = first instanceof RegExpObj ? first.regex.source : first === void 0 ? "" : coerceToString(first);
	const flagsArg = args[1];
	if (flagsArg !== void 0 && typeof flagsArg !== "string") throw syntaxError(`RegExp flags must be a string of flag characters (e.g. "g", "gi"), not ${flagsArg === null ? "null" : typeof flagsArg}.`);
	const flags = flagsArg ?? (first instanceof RegExpObj ? first.regex.flags : "");
	try {
		return new RegExpObj(proto, pattern, flags);
	} catch (error) {
		const reason = regexFailureReason(error);
		throw syntaxError(/flag/i.test(reason) ? `new RegExp(...) received invalid flags ${JSON.stringify(flags)} (${reason}). Valid flags are d, g, i, m, s, u, v, and y.` : `new RegExp(...) received ${JSON.stringify(pattern)}, which is not a valid regular expression pattern (${reason}). ${escapeRegexHint}`);
	}
};
const regexpGlobal = (ctx) => {
	const builtins = ctx.builtins;
	const proto = builtins.RegExp;
	const regexp = constructor(builtins, proto, {
		name: "RegExp",
		length: 2,
		call: (_, args) => sync(() => constructRegExp(builtins, args)),
		construct: (args, newTarget) => sync(() => constructRegExp(builtins, args, prototypeFrom(newTarget, proto)))
	});
	methods(builtins, regexp, [[
		"escape",
		1,
		(_, args) => {
			if (typeof args[0] !== "string") throw typeError("RegExp.escape expects a string.");
			return RegExp.escape(args[0]);
		}
	]]);
	const self = (thisValue, name) => receiver(RegExpObj, thisValue, `RegExp.prototype.${name}`);
	defineAccessor(proto, "source", (thisValue) => self(thisValue, "source").regex.source);
	defineAccessor(proto, "flags", (thisValue) => self(thisValue, "flags").regex.flags);
	defineAccessor(proto, "lastIndex", (thisValue) => self(thisValue, "lastIndex").regex.lastIndex, (thisValue, value) => {
		self(thisValue, "lastIndex").regex.lastIndex = coerceToNumber(value);
	});
	for (const name of flagProperties) defineAccessor(proto, name, (thisValue) => self(thisValue, name).regex[name]);
	const run = (name) => [
		name,
		1,
		(thisValue, args) => {
			const matched = self(thisValue, name).regex.exec(coerceToString(args[0]));
			if (name === "test") return matched !== null;
			return matched === null ? null : matchToValue(builtins, matched);
		}
	];
	methods(builtins, proto, [
		run("exec"),
		run("test"),
		[
			"toString",
			0,
			(thisValue) => coerceToString(self(thisValue, "toString"))
		]
	]);
	return regexp;
};
const indicesToValue = (builtins, indices) => {
	const range = (pair) => pair === void 0 ? void 0 : new Arr(builtins.Array, [...pair]);
	const result = new Arr(builtins.Array, Array.from(indices, range));
	const groups = indices.groups;
	define(result, "groups", groups === void 0 ? void 0 : record(builtins.Object, Object.fromEntries(Object.entries(groups).map(([key, pair]) => [key, range(pair)]))));
	return result;
};
// node_modules/@opencode/codemode/dist/stdlib/string.js
const requireDataArgument = (name, index, arg) => {
	if (containsOpaqueReference(arg)) throw invalidData(`String.${name} expects argument ${index + 1} to be a data value.`);
	return arg;
};
const replaceAllNeedsGlobal = (pattern) => {
	if (!pattern.global) throw typeError(`String.replaceAll requires a regular expression with the global (g) flag: write /${pattern.source}/${pattern.flags}g, or use String.replace to replace only the first match.`);
};
const replaceWithCallback = (ctx, value, name, args) => {
	const builtins = ctx.builtins;
	const apply = applyCollectionCallback(ctx, args[1], `String.${name}`);
	const matches = [];
	const collect = (...callbackArgs) => {
		const match = callbackArgs[0];
		const hasGroups = typeof callbackArgs.at(-1) === "object";
		const offset = callbackArgs[callbackArgs.length - (hasGroups ? 3 : 2)];
		if (typeof match !== "string" || typeof offset !== "number") throw typeError(`String.${name} produced an invalid replacement match.`);
		const args = callbackArgs.map((arg) => typeof arg === "object" ? record(builtins.Object, arg) : arg);
		matches.push({
			match,
			offset,
			args
		});
		return match;
	};
	const pattern = args[0];
	if (pattern instanceof RegExpObj) {
		if (name === "replaceAll") replaceAllNeedsGlobal(pattern.regex);
		if (name === "replace") value.replace(pattern.regex, collect);
		else value.replaceAll(pattern.regex, collect);
	} else {
		const search = coerceToString(requireDataArgument(name, 0, pattern));
		if (name === "replace") value.replace(search, collect);
		else value.replaceAll(search, collect);
	}
	return gen(function* () {
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
const stringGlobal = (ctx) => {
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
				const raw = template instanceof Obj ? get(template, "raw") : void 0;
				if (!(raw instanceof Obj)) throw typeError("String.raw expects a template object with a raw array.");
				const count = Math.max(0, coerceToInteger(get(raw, "length")));
				checkArrayLength(count);
				const parts = Array.from({ length: count }, (_, index) => index + 1 < count && index + 1 < args.length ? [get(raw, index), args[index + 1]] : [get(raw, index)]).flat();
				return map(forEach(parts, (part) => toPrimitiveString(ctx, part)), (strings) => {
					const output = strings.join("");
					checkStringLength(output.length);
					return output;
				});
			}
		]
	]);
	const self = (thisValue, name) => {
		if (typeof thisValue === "string") return thisValue;
		if (thisValue === null || thisValue === void 0) throw typeError(`String.prototype.${name} called on null or undefined.`);
		return coerceToString(thisValue);
	};
	const str = (name, args, index) => coerceToString(requireDataArgument(name, index, args[index]));
	const num = (name, args, index) => coerceToNumber(requireDataArgument(name, index, args[index]));
	const optNum = (name, args, index) => args[index] === void 0 ? void 0 : num(name, args, index);
	const optStr = (name, args, index) => args[index] === void 0 ? void 0 : str(name, args, index);
	const simple = (name, length, op, hints = []) => [
		name,
		length,
		(thisValue, args) => {
			if (thisValue === null || thisValue === void 0) throw typeError(`String.prototype.${name} called on null or undefined.`);
			return withPrimitives(ctx, ["string", ...hints], [thisValue, ...args.slice(0, hints.length)], ([value, ...primitives]) => op(coerceToString(value), [...primitives, ...args.slice(hints.length)]));
		}
	];
	const searching = (name, op) => simple(name, 1, (value, args) => {
		if (args[0] instanceof RegExpObj) throw typeError(`String.${name} cannot take a regular expression; use regex.test(string) or String.search instead.`);
		return withPrimitives(ctx, ["string", "number"], args.slice(0, 2), (primitives) => op(value, str(name, primitives, 0), optNum(name, primitives, 1)));
	});
	const withPattern = (args, op) => args[0] instanceof RegExpObj ? op(args[0]) : withPrimitives(ctx, "string", [args[0]], ([text]) => op(text));
	const replace = (name) => simple(name, 2, (value, args) => {
		const pattern = args[0];
		const replacer = args[1];
		return withPrimitives(ctx, "string", [pattern instanceof RegExpObj ? void 0 : pattern, isSupportedCallback(replacer) ? void 0 : replacer], ([search, replacement]) => {
			if (isSupportedCallback(replacer)) return replaceWithCallback(ctx, value, name, [pattern instanceof RegExpObj ? pattern : search, replacer]);
			if (typeofValue(replacer) === "function") throw typeError(`String.${name} cannot use this callable as a replacer; wrap it in an arrow function, e.g. (match) => tools.ns.tool(match).`);
			const primitives = [search, replacement];
			if (pattern instanceof RegExpObj) {
				const regex = pattern.regex;
				const text = str(name, primitives, 1);
				if (name === "replaceAll") replaceAllNeedsGlobal(regex);
				return name === "replace" ? value.replace(regex, text) : value.replaceAll(regex, text);
			}
			if (name === "replace") return value.replace(str(name, primitives, 0), str(name, primitives, 1));
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
			return withPrimitives(ctx, ["number", "string"], [args[1], separator instanceof RegExpObj ? void 0 : separator], ([limit, pattern]) => {
				const wrap = (parts) => new Arr(builtins.Array, parts);
				const requestedLimit = args[1] === void 0 ? void 0 : num("split", [pattern, limit], 1);
				if (separator === void 0) return wrap(requestedLimit !== void 0 && requestedLimit >>> 0 === 0 ? [] : [value]);
				const parts = separator instanceof RegExpObj ? value.split(separator.regex, requestedLimit) : value.split(str("split", [pattern], 0), requestedLimit === void 0 ? void 0 : requestedLimit >>> 0);
				checkArrayLength(parts.length);
				return wrap(parts);
			});
		}),
		simple("slice", 2, (value, args) => value.slice(optNum("slice", args, 0), optNum("slice", args, 1)), ["number", "number"]),
		searching("includes", (value, search, position) => value.includes(search, position)),
		searching("startsWith", (value, search, position) => value.startsWith(search, position)),
		searching("endsWith", (value, search, position) => value.endsWith(search, position)),
		simple("indexOf", 1, (value, args) => value.indexOf(str("indexOf", args, 0), optNum("indexOf", args, 1)), ["string", "number"]),
		simple("lastIndexOf", 1, (value, args) => value.lastIndexOf(str("lastIndexOf", args, 0), optNum("lastIndexOf", args, 1)), ["string", "number"]),
		replace("replace"),
		replace("replaceAll"),
		simple("match", 1, (value, args) => withPattern(args, (arg) => {
			const regex = toHostRegex(arg, "match");
			const matched = value.match(regex);
			if (matched === null) return null;
			if (regex.global) return new Arr(builtins.Array, [...matched]);
			return matchToValue(builtins, matched);
		})),
		simple("matchAll", 1, (value, args) => withPattern(args, (arg) => {
			const regex = toHostRegex(arg, "matchAll", "g");
			if (!regex.global) throw typeError(`String.matchAll requires a regular expression with the global (g) flag: write /${regex.source}/${regex.flags}g, or use String.match for a single match.`);
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
			if (!Number.isFinite(count) || count < 0) throw rangeError("String.repeat expects a finite non-negative count.");
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
		simple("substr", 2, (value, args) => value.substr(optNum("substr", args, 0) ?? 0, optNum("substr", args, 1)), ["number", "number"]),
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
	define(builtins.String, IteratorSymbol, fn(builtins, "[Symbol.iterator]", 0, (thisValue) => hostIterator(builtins, self(thisValue, "[Symbol.iterator]")[Symbol.iterator]())), hidden);
	return string;
};
// node_modules/@opencode/codemode/dist/stdlib/url.js
const urlProperties = [
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
const uriFunctions = {
	encodeURI,
	encodeURIComponent,
	decodeURI,
	decodeURIComponent
};
const uriGlobal = (ctx, name) => fn(ctx.builtins, name, 1, (_, args) => {
	const value = coerceToString(args[0]);
	try {
		return uriFunctions[name](value);
	} catch (error) {
		throw uriError(`${name} received malformed URI data: ${error instanceof Error ? error.message : String(error)}`);
	}
});
const urlArgument = (value) => value instanceof URLObj ? value.url.href : coerceToString(value);
const urlGlobal = (ctx) => {
	const builtins = ctx.builtins;
	const proto = builtins.URL;
	const construct = (args, into) => {
		if (args.length === 0) throw typeError("new URL(...) requires a URL string and an optional base URL.");
		const input = urlArgument(args[0]);
		const base = args[1] === void 0 ? void 0 : urlArgument(args[1]);
		try {
			return new URLObj(into, builtins.URLSearchParams, new URL(input, base));
		} catch {
			throw typeError(`new URL(...) received an invalid URL${base === void 0 ? "" : " or base URL"}.`);
		}
	};
	const url = constructor(builtins, proto, {
		name: "URL",
		length: 1,
		call: requiresNew("URL"),
		construct: (args, newTarget) => sync(() => construct(args, prototypeFrom(newTarget, proto)))
	});
	const parse = (name) => [
		name,
		1,
		(_, args) => {
			if (args.length === 0) throw typeError(`URL.${name} requires a URL argument.`);
			const input = urlArgument(args[0]);
			const base = args[1] === void 0 ? void 0 : urlArgument(args[1]);
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
	for (const name of urlProperties) defineAccessor(proto, name, (thisValue) => self(thisValue, name).url[name], name === "origin" ? void 0 : (thisValue, value) => {
		const target = self(thisValue, name);
		try {
			target.url[name] = coerceToString(value);
		} catch (error) {
			if (error instanceof PendingThrow) throw error;
			throw typeError(`URL.${name} received an invalid value.`);
		}
	});
	defineAccessor(proto, "searchParams", (thisValue) => self(thisValue, "searchParams").searchParams);
	methods(builtins, proto, [[
		"toString",
		0,
		(thisValue) => self(thisValue, "toString").url.href
	], [
		"toJSON",
		0,
		(thisValue) => self(thisValue, "toJSON").url.href
	]]);
	return url;
};
const readPair = (ctx, value, label) => gen(function* () {
	const cursor = yield* ctx.iterate(value);
	if (cursor === void 0) throw typeError(`${label} expects iterable [name, value] pairs.`);
	const items = [];
	while (true) {
		const step = yield* cursor.next;
		if (step.done) return items;
		items.push(yield* preserveConsumerError(cursor.close, sync(() => coerceToString(step.value))));
	}
});
/**
* Reads a synchronous iterable of `[name, value]` pairs as strings; `undefined` when `init` is not iterable. As in
* WebIDL, the whole sequence is converted before any pair's length is checked.
*/
const readPairs = (ctx, init, label) => gen(function* () {
	const cursor = yield* ctx.iterate(init);
	if (cursor === void 0) return void 0;
	const pairs = [];
	while (true) {
		const step = yield* cursor.next;
		if (step.done) {
			if (pairs.some((entry) => entry.length !== 2)) throw typeError(`${label} expects iterable [name, value] pairs.`);
			return pairs;
		}
		pairs.push(yield* preserveConsumerError(cursor.close, readPair(ctx, step.value, label)));
	}
});
const constructURLSearchParams = (ctx, init, proto) => {
	const wrap = (params) => new URLSearchParamsObj(proto, params);
	if (init === void 0) return succeed$1(wrap(new URLSearchParams()));
	if (init instanceof URLSearchParamsObj) return succeed$1(wrap(new URLSearchParams(init.params)));
	if (typeof init === "string") return succeed$1(wrap(new URLSearchParams(init)));
	if (init === null || typeof init === "number" || typeof init === "boolean") return succeed$1(wrap(new URLSearchParams(coerceToString(init))));
	return gen(function* () {
		const pairs = yield* readPairs(ctx, init, "new URLSearchParams(...)");
		if (pairs !== void 0) return wrap(new URLSearchParams(pairs));
		if (isRuntimeReference(init)) throw typeError("new URLSearchParams(...) expects a query string, data object, or synchronous iterable pairs.");
		if (!(init instanceof Obj)) throw typeError("new URLSearchParams(...) expects a query string, data object, iterable pairs, or URLSearchParams.");
		return wrap(new URLSearchParams(Object.fromEntries(entries(init).map(([key, value]) => [key, coerceToString(value)]))));
	});
};
const urlSearchParamsGlobal = (ctx) => {
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
		if (args.length < count) throw typeError(`URLSearchParams.${name} requires ${count} argument${count === 1 ? "" : "s"}.`);
	};
	defineAccessor(proto, "size", (thisValue) => self(thisValue, "size").params.size);
	methods(builtins, proto, [
		[
			"append",
			2,
			(thisValue, args) => {
				requireArgs("append", args, 2);
				self(thisValue, "append").params.append(arg(args, 0), arg(args, 1));
			}
		],
		[
			"delete",
			1,
			(thisValue, args) => {
				requireArgs("delete", args, 1);
				const params = self(thisValue, "delete").params;
				if (args[1] !== void 0) params.delete(arg(args, 0), arg(args, 1));
				else params.delete(arg(args, 0));
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
				return args[1] !== void 0 ? params.has(arg(args, 0), arg(args, 1)) : params.has(arg(args, 0));
			}
		],
		[
			"set",
			2,
			(thisValue, args) => {
				requireArgs("set", args, 2);
				self(thisValue, "set").params.set(arg(args, 0), arg(args, 1));
			}
		],
		[
			"sort",
			0,
			(thisValue) => {
				self(thisValue, "sort").params.sort();
			}
		],
		[
			"keys",
			0,
			(thisValue) => hostIterator(builtins, self(thisValue, "keys").params.keys())
		],
		[
			"values",
			0,
			(thisValue) => hostIterator(builtins, self(thisValue, "values").params.values())
		],
		[
			"entries",
			0,
			(thisValue) => hostIterator(builtins, self(thisValue, "entries").iterator(builtins))
		],
		[
			"toString",
			0,
			(thisValue) => self(thisValue, "toString").params.toString()
		],
		[
			"forEach",
			1,
			(thisValue, args) => {
				requireArgs("forEach", args, 1);
				const target = self(thisValue, "forEach");
				const apply = applyCollectionCallback(ctx, args[0], "URLSearchParams.forEach");
				return gen(function* () {
					for (const [key, value] of Array.from(target.params.entries())) yield* apply([
						value,
						key,
						target
					], args[1]);
				});
			}
		]
	]);
	define(proto, IteratorSymbol, get(proto, "entries"), hidden);
	return searchParams;
};
// node_modules/@opencode/codemode/dist/stdlib/headers.js
const attempt = (run) => {
	try {
		return run();
	} catch (error) {
		throw typeError(error instanceof Error ? error.message : String(error));
	}
};
const constructHeaders = (ctx, init, proto) => {
	const wrap = (headers) => new HeadersObj(proto, headers);
	if (init === void 0) return succeed$1(wrap(new Headers()));
	return gen(function* () {
		const pairs = init instanceof Obj ? yield* readPairs(ctx, init, "new Headers(...)") : void 0;
		if (pairs !== void 0) return wrap(attempt(() => new Headers(pairs)));
		if (!(init instanceof Obj) || isRuntimeReference(init)) throw typeError("new Headers(...) expects a record of names to values, iterable [name, value] pairs, or Headers.");
		return wrap(attempt(() => new Headers(Object.fromEntries(entries(init).map(([key, value]) => [key, coerceToString(value)])))));
	});
};
const headersGlobal = (ctx) => {
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
		if (args.length < count) throw typeError(`Headers.${name} requires ${count} argument${count === 1 ? "" : "s"}.`);
	};
	methods(builtins, proto, [
		[
			"append",
			2,
			(thisValue, args) => {
				requireArgs("append", args, 2);
				const target = self(thisValue, "append").headers;
				attempt(() => target.append(arg(args, 0), arg(args, 1)));
			}
		],
		[
			"delete",
			1,
			(thisValue, args) => {
				requireArgs("delete", args, 1);
				const target = self(thisValue, "delete").headers;
				attempt(() => target.delete(arg(args, 0)));
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
		[
			"getSetCookie",
			0,
			(thisValue) => wrap(self(thisValue, "getSetCookie").headers.getSetCookie())
		],
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
			}
		],
		[
			"keys",
			0,
			(thisValue) => hostIterator(builtins, self(thisValue, "keys").headers.keys())
		],
		[
			"values",
			0,
			(thisValue) => hostIterator(builtins, self(thisValue, "values").headers.values())
		],
		[
			"entries",
			0,
			(thisValue) => hostIterator(builtins, self(thisValue, "entries").iterator(builtins))
		],
		[
			"forEach",
			1,
			(thisValue, args) => {
				requireArgs("forEach", args, 1);
				const target = self(thisValue, "forEach");
				const apply = applyCollectionCallback(ctx, args[0], "Headers.forEach");
				return gen(function* () {
					for (const [key, value] of Array.from(target.headers.entries())) yield* apply([
						value,
						key,
						target
					], args[1]);
				});
			}
		]
	]);
	define(proto, IteratorSymbol, get(proto, "entries"), hidden);
	return headers;
};
// node_modules/@opencode/codemode/dist/stdlib/iterator.js
const finished = {
	done: true,
	value: void 0
};
const iteratorGlobals = (ctx) => {
	const builtins = ctx.builtins;
	const proto = builtins.Iterator;
	const method = (name) => `Iterator.prototype.${name}`;
	const guarded = (source, body) => flatMap(exit(body), (exit$4) => {
		if (isSuccess(exit$4)) return succeed$1(exit$4.value);
		if (hasInterruptsOnly(exit$4.cause)) return failCause(exit$4.cause);
		return andThen(exit(source.close), failCause(exit$4.cause));
	});
	const helper = (source, pull, close = source.close) => {
		let done = false;
		let running = false;
		const enter = () => {
			if (running) throw typeError("Iterator helper is already running.");
			running = true;
		};
		return new IteratorObj(builtins.IteratorHelper, {
			next: suspend(() => {
				if (done) return succeed$1(finished);
				enter();
				return flatMap(exit(pull), (exit) => {
					running = false;
					done = isSuccess(exit) ? exit.value.done : true;
					return exit;
				});
			}),
			close: suspend(() => {
				if (done) return void_;
				enter();
				done = true;
				return ensuring(close, sync(() => {
					running = false;
				}));
			})
		});
	};
	const flattenable = (value, name, strings) => gen(function* () {
		if (typeof value === "string" ? !strings : !(value instanceof Obj)) throw typeError(`${name} expects an iterable or iterator, received ${describeValue(value)}.`);
		return (yield* ctx.iterate(value)) ?? ctx.iterateDirect(value);
	});
	const limit = (value, name) => {
		const count = Math.trunc(coerceToNumber(value));
		if (Number.isNaN(count) || count < 0) throw rangeError(`${method(name)} expects a non-negative count, received ${count}.`);
		return count;
	};
	methods(builtins, proto, [
		[
			"next",
			0,
			(thisValue) => map(receiver(IteratorObj, thisValue, method("next")).cursor.next, (step) => record(builtins.Object, {
				value: step.value,
				done: step.done
			}))
		],
		[
			"map",
			1,
			(thisValue, args) => {
				const source = ctx.iterateDirect(thisValue);
				const apply = applyCollectionCallback(ctx, args[0], method("map"));
				let counter = 0;
				return helper(source, gen(function* () {
					const step = yield* source.next;
					if (step.done) return finished;
					return {
						done: false,
						value: yield* guarded(source, apply([step.value, counter++]))
					};
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
				return helper(source, gen(function* () {
					while (true) {
						const step = yield* source.next;
						if (step.done) return finished;
						if (yield* guarded(source, apply([step.value, counter++]))) return step;
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
				return helper(source, gen(function* () {
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
				return helper(source, gen(function* () {
					while (remaining > 0) {
						remaining -= 1;
						if ((yield* source.next).done) return finished;
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
				return helper(source, gen(function* () {
					while (true) {
						if (inner !== void 0) {
							const step = yield* guarded(source, inner.next);
							if (!step.done) return step;
							inner = void 0;
						}
						const step = yield* source.next;
						if (step.done) return finished;
						inner = yield* guarded(source, flatMap(apply([step.value, counter++]), (mapped) => flattenable(mapped, method("flatMap"), false)));
					}
				}), suspend(() => inner === void 0 ? source.close : andThen(inner.close, source.close)));
			}
		],
		[
			"reduce",
			1,
			(thisValue, args) => {
				const source = ctx.iterateDirect(thisValue);
				const apply = applyCollectionCallback(ctx, args[0], method("reduce"));
				return gen(function* () {
					let counter = 0;
					let accumulator = args[1];
					if (args.length < 2) {
						const first = yield* source.next;
						if (first.done) throw typeError("Iterator.prototype.reduce of an empty iterator with no initial value.");
						accumulator = first.value;
						counter = 1;
					}
					while (true) {
						const step = yield* source.next;
						if (step.done) return accumulator;
						accumulator = yield* guarded(source, apply([
							accumulator,
							step.value,
							counter++
						]));
					}
				});
			}
		],
		[
			"toArray",
			0,
			(thisValue) => {
				const source = ctx.iterateDirect(thisValue);
				return gen(function* () {
					const items = [];
					while (true) {
						const step = yield* source.next;
						if (step.done) return new Arr(builtins.Array, items);
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
				return gen(function* () {
					let counter = 0;
					while (true) {
						const step = yield* source.next;
						if (step.done) return void 0;
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
				return gen(function* () {
					let counter = 0;
					while (true) {
						const step = yield* source.next;
						if (step.done) return false;
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
				return gen(function* () {
					let counter = 0;
					while (true) {
						const step = yield* source.next;
						if (step.done) return true;
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
				return gen(function* () {
					let counter = 0;
					while (true) {
						const step = yield* source.next;
						if (step.done) return void 0;
						if (yield* guarded(source, apply([step.value, counter++]))) {
							yield* source.close;
							return step.value;
						}
					}
				});
			}
		]
	]);
	methods(builtins, builtins.IteratorHelper, [[
		"return",
		0,
		(thisValue) => map(receiver(IteratorObj, thisValue, "Iterator.prototype.return").cursor.close, () => record(builtins.Object, {
			value: void 0,
			done: true
		}))
	]]);
	const iterator = constructor(builtins, proto, {
		name: "Iterator",
		length: 0,
		call: requiresNew("Iterator"),
		construct: () => sync(() => {
			throw typeError("Iterator is abstract; use Iterator.from(...) or a built-in iterator.");
		})
	});
	define(iterator, "from", fn(builtins, "from", 1, (_, args) => gen(function* () {
		if (args[0] instanceof Obj && hasPrototype(args[0], proto)) return args[0];
		return new IteratorObj(builtins.IteratorHelper, yield* flattenable(args[0], "Iterator.from", true));
	})), hidden);
	return iterator;
};
// node_modules/@opencode/codemode/dist/stdlib/web.js
const base64Global = (ctx, name) => fn(ctx.builtins, name, 1, (_, args) => {
	if (args.length === 0) throw typeError(`${name} requires 1 argument (a string)`);
	const input = coerceToString(args[0]);
	try {
		return name === "atob" ? atob(input) : btoa(input);
	} catch {
		throw typeError("The string contains invalid characters.");
	}
});
const structuredCloneGlobal = (ctx) => fn(ctx.builtins, "structuredClone", 1, (_, args) => {
	if (args.length === 0) throw typeError("structuredClone requires 1 argument");
	const builtins = ctx.builtins;
	const memo = /* @__PURE__ */ new Map();
	const clone = (value) => {
		if (typeof value === "symbol" || value instanceof ToolReference) throw typeError(`DataCloneError: ${describeValue(value)} could not be cloned.`);
		if (!(value instanceof Obj)) return value;
		const seen = memo.get(value);
		if (seen !== void 0) return seen;
		const remember = (copy) => {
			memo.set(value, copy);
			return copy;
		};
		if (value instanceof MapObj) {
			const copy = remember(new MapObj(builtins.Map));
			for (const [key, item] of value.map) copy.map.set(clone(key), clone(item));
			return copy;
		}
		if (value instanceof SetObj) {
			const copy = remember(new SetObj(builtins.Set));
			for (const item of value.set) copy.set.add(clone(item));
			return copy;
		}
		if (value instanceof DateObj) return remember(new DateObj(builtins.Date, value.time));
		if (value instanceof RegExpObj) return remember(new RegExpObj(builtins.RegExp, value.regex.source, value.regex.flags));
		if (value instanceof Bytes) return remember(new Bytes(builtins.Uint8Array, new Uint8Array(value.bytes)));
		if (value instanceof ErrorObj) {
			const name = get(value, "name");
			const message = get(value, "message");
			const copy = remember(createErrorValue(builtins[typeof name === "string" && isErrorType(name) ? name : "Error"], message === void 0 ? void 0 : coerceToString(message)));
			const stack = getOwn(value, "stack");
			if (typeof stack === "string") define(copy, "stack", stack, hidden);
			if (hasOwn(value, "cause")) define(copy, "cause", clone(getOwn(value, "cause")), hidden);
			return copy;
		}
		if (isRuntimeReference(value) || value instanceof WeakMapObj || value instanceof WeakSetObj) throw typeError(`DataCloneError: ${describeValue(value)} could not be cloned.`);
		const copy = remember(value instanceof Arr ? new Arr(builtins.Array, new Array(value.items.length)) : new Obj(builtins.Object));
		for (const [key, item] of entries(value)) define(copy, key, clone(item));
		return copy;
	};
	return clone(args[0]);
});
const cryptoGlobal = (ctx) => {
	const object = new Obj(ctx.builtins.Object);
	methods(ctx.builtins, object, [[
		"randomUUID",
		0,
		() => crypto.randomUUID()
	], [
		"getRandomValues",
		1,
		(_, args) => {
			if (!(args[0] instanceof Bytes)) throw typeError(`crypto.getRandomValues expects a Uint8Array, received ${describeValue(args[0])}.`);
			crypto.getRandomValues(args[0].bytes);
			return args[0];
		}
	]]);
	return object;
};
// node_modules/@opencode/codemode/dist/interpreter/generators.js
/** `next`/`return`/`throw` on the generator prototypes; async generators answer with promises. */
const generatorGlobals = (ctx) => {
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
		methods(builtins, proto, [
			request("next"),
			request("return"),
			request("throw")
		]);
		define(asynchronous ? builtins.AsyncIterator : builtins.Iterator, asynchronous ? AsyncIteratorSymbol : IteratorSymbol, fn(builtins, asynchronous ? "[Symbol.asyncIterator]" : "[Symbol.iterator]", 0, (thisValue) => thisValue), hidden);
	};
	install(false);
	install(true);
};
// node_modules/@opencode/codemode/dist/interpreter/globals.js
const functionGlobal = (ctx) => {
	const reject = () => sync(() => {
		throw typeError("The Function constructor is not supported; write the function inline.");
	});
	const target = (thisValue, method) => receiver(Callable, thisValue, `Function.prototype.${method}`);
	methods(ctx.builtins, ctx.builtins.Function, [
		[
			"call",
			1,
			(thisValue, args) => ctx.call(target(thisValue, "call"), args[0], args.slice(1))
		],
		[
			"apply",
			2,
			(thisValue, args) => ctx.call(target(thisValue, "apply"), args[0], listFromArrayLike(args[1]))
		],
		[
			"bind",
			1,
			(thisValue, args) => {
				const fn = target(thisValue, "bind");
				const bound = args.slice(1);
				return native(ctx.builtins, {
					name: `bound ${coerceToString(get(fn, "name"))}`,
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
const listFromArrayLike = (value) => {
	if (value === void 0 || value === null) return [];
	if (value instanceof Arr) return [...value.items];
	if (!(value instanceof Obj)) throw typeError("Function.prototype.apply expects an array-like argument list.");
	const length = Math.max(0, coerceToInteger(get(value, "length")));
	checkArrayLength(length);
	return Array.from({ length }, (_, index) => get(value, String(index)));
};
const symbolGlobal = (ctx) => {
	const symbol = native(ctx.builtins, {
		name: "Symbol",
		call: () => sync(() => {
			throw typeError("Symbol is not callable; only Symbol.asyncIterator and Symbol.iterator are available.");
		}),
		callback: false
	});
	constants(symbol, {
		asyncIterator: AsyncIteratorSymbol,
		iterator: IteratorSymbol
	});
	return symbol;
};
const table = {
	tools: () => new ToolReference([]),
	search: (ctx) => native(ctx.builtins, {
		name: "search",
		call: (_, args) => ctx.tool(ctx.tools.search, args),
		callback: false
	}),
	undefined: () => void 0,
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
/** Names bound in every program before extensions apply. */
const globalNames = new Set(Object.keys(table));
/** The immutable global bindings of every program, in declaration order. */
const globals = (ctx) => {
	generatorGlobals(ctx);
	return Object.entries(table).map(([name, factory]) => [name, factory(ctx)]);
};
// node_modules/@opencode/codemode/dist/interpreter/scope.js
var ScopeStack = class {
	scopes;
	constructor(scopes) {
		this.scopes = scopes;
	}
	reserve(name, mutable, node) {
		const scope = this.current();
		if (scope.has(name)) throw typeError(`Identifier '${name}' has already been declared.`, node);
		scope.set(name, {
			mutable,
			value: void 0,
			initialized: false
		});
	}
	initialize(name, value, node) {
		const binding = this.current().get(name);
		if (!binding || binding.initialized !== false) throw typeError(`Identifier '${name}' has not been reserved for initialization.`, node);
		binding.value = value;
		binding.initialized = true;
	}
	declare(name, value, mutable, node) {
		const scope = this.current();
		if (scope.has(name)) throw typeError(`Identifier '${name}' has already been declared.`, node);
		scope.set(name, {
			mutable,
			value,
			initialized: true
		});
	}
	get(name, node) {
		const binding = this.resolve(name);
		if (!binding) throw referenceError(`Unknown identifier '${name}'.`, node);
		if (binding.initialized === false) throw referenceError(`Cannot access '${name}' before initialization.`, node);
		return binding.value;
	}
	set(name, value, node) {
		const binding = this.resolve(name);
		if (!binding) throw referenceError(`Unknown identifier '${name}'.`, node);
		if (binding.initialized === false) throw referenceError(`Cannot access '${name}' before initialization.`, node);
		if (!binding.mutable) throw typeError(`Cannot assign to constant '${name}'.`, node);
		binding.value = value;
		return value;
	}
	resolve(name) {
		for (let index = this.scopes.length - 1; index >= 0; index -= 1) {
			const binding = this.scopes[index]?.get(name);
			if (binding) return binding;
		}
	}
	current() {
		const scope = this.scopes[this.scopes.length - 1];
		if (!scope) throw typeError("Interpreter scope stack is empty.");
		return scope;
	}
	push(scope = /* @__PURE__ */ new Map()) {
		this.scopes.push(scope);
	}
	pop() {
		this.scopes.pop();
	}
	capture() {
		return this.scopes.slice();
	}
};
// node_modules/@opencode/codemode/dist/interpreter/interpreter.js
/** The binary operators that convert object operands through ToPrimitive before acting on primitives. */
const primitiveOperators = /* @__PURE__ */ new Set([
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
/** ToPropertyKey on a primitive (or an opaque value, which keeps its built-in string form). */
const propertyKey = (value) => typeof value === "string" || typeof value === "number" || typeof value === "symbol" ? value : coerceToString(value);
const loopExit = (result, labels) => {
	if (result.kind === "return") return result;
	if (result.kind === "break") {
		if (result.label !== void 0 && !labels?.has(result.label)) return result;
		return { kind: "none" };
	}
	if (result.kind === "continue" && result.label !== void 0 && !labels?.has(result.label)) return result;
};
const calleeDescription = (node) => {
	if (node?.type === "Identifier") return node.name;
	if (node?.type === "CallExpression") {
		const target = calleeDescription(node.callee);
		return target === void 0 ? void 0 : `${target}(...)`;
	}
	if (node?.type !== "MemberExpression") return void 0;
	const property = node.property;
	const key = !node.computed && property.type === "Identifier" ? property.name : property.type === "Literal" && typeof property.value === "string" ? property.value : void 0;
	if (key === void 0) return void 0;
	const object = calleeDescription(node.object);
	return object === void 0 ? void 0 : `${object}.${key}`;
};
const literal$1 = (node) => {
	if (typeof node.value === "bigint") throw typeError("BigInt literals are not supported.", node);
	if (node.value instanceof RegExp) throw unsupportedSyntax("RegExpLiteral", node);
	return node.value;
};
const instanceofValue = (lhs, rhs, node) => {
	if (!(rhs instanceof Callable)) throw typeError("The right-hand side of 'instanceof' is not callable.", node);
	const prototype = get(rhs, "prototype");
	if (!(prototype instanceof Obj)) throw typeError("The right-hand side of 'instanceof' has no 'prototype' object.", node);
	return hasPrototype(lhs, prototype);
};
const collectPatternNames = (pattern, out = []) => {
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
			for (const element of pattern.elements) if (element !== null) collectPatternNames(element, out);
			break;
		case "ObjectPattern": for (const prop of pattern.properties) collectPatternNames(prop.type === "RestElement" ? prop.argument : prop.value, out);
	}
	return out;
};
const argumentsUse = /* @__PURE__ */ new WeakMap();
const usesArguments = (fn) => {
	const cached = argumentsUse.get(fn.body);
	if (cached !== void 0) return cached;
	const found = [...fn.parameters, fn.body].some(function visit(node) {
		if (node === null || typeof node !== "object") return false;
		if (node.type === "Identifier") return node.name === "arguments";
		if (node.type === "FunctionDeclaration" || node.type === "FunctionExpression") return false;
		return Object.values(node).some((child) => Array.isArray(child) ? child.some((item) => visit(item)) : visit(child));
	});
	argumentsUse.set(fn.body, found);
	return found;
};
const varNames = /* @__PURE__ */ new WeakMap();
const collectVarNames = (node, out = []) => {
	if (!node) return out;
	switch (node.type) {
		case "VariableDeclaration":
			if (node.kind === "var") for (const declaration of node.declarations) collectPatternNames(declaration.id, out);
			break;
		case "BlockStatement":
			for (const statement of node.body) collectVarNames(statement, out);
			break;
		case "IfStatement":
			collectVarNames(node.consequent, out);
			collectVarNames(node.alternate, out);
			break;
		case "ForStatement":
			if (node.init?.type === "VariableDeclaration") collectVarNames(node.init, out);
			collectVarNames(node.body, out);
			break;
		case "ForInStatement":
		case "ForOfStatement":
			if (node.left.type === "VariableDeclaration") collectVarNames(node.left, out);
			collectVarNames(node.body, out);
			break;
		case "WhileStatement":
		case "DoWhileStatement":
		case "LabeledStatement":
			collectVarNames(node.body, out);
			break;
		case "SwitchStatement":
			for (const item of node.cases) for (const statement of item.consequent) collectVarNames(statement, out);
			break;
		case "TryStatement":
			collectVarNames(node.block, out);
			collectVarNames(node.handler?.body, out);
			collectVarNames(node.finalizer, out);
	}
	return out;
};
const loopDeclaration = (left, statement) => {
	if (left.type !== "VariableDeclaration") return void 0;
	const declaration = left.declarations.length === 1 ? left.declarations[0] : void 0;
	if (declaration === void 0) throw typeError(`${statement} supports one declared binding.`, left);
	const kind = left.kind;
	return {
		pattern: declaration.id,
		mutable: kind !== "const",
		lexical: kind !== "var"
	};
};
/** One program execution: the tool bridge, promise scheduler, captured logs, and the global scope built once. */
var Interpreter = class {
	tools;
	pending;
	builtins;
	logs;
	/** Template objects by site: a tag sees the same `strings` array every time its literal is evaluated, as in JS. */
	templates = /* @__PURE__ */ new WeakMap();
	root;
	constructor(options) {
		this.tools = options.tools;
		this.pending = options.pending;
		this.builtins = options.builtins;
		this.logs = options.logs ?? [];
		const globalScope = /* @__PURE__ */ new Map([["this", {
			mutable: false,
			value: void 0
		}]]);
		this.root = new Frame(this, new ScopeStack([globalScope]));
		for (const [name, value] of [...globals(this), ...options.globals?.(this) ?? []]) globalScope.set(name, {
			mutable: false,
			value
		});
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
	/** Runs one host tool: arguments cross as JSON and the result comes back as program values. */
	tool(run, args) {
		const ctx = this;
		return gen(function* () {
			const json = yield* forEach(args, (arg) => toBoundary(ctx, arg));
			return fromJson(ctx, yield* run(json));
		});
	}
};
const MAX_CALL_DEPTH = 1e4;
/** One activation: the top-level program or a single function call, evaluating against its own scope chain. */
var Frame = class Frame {
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
		return gen(function* () {
			self.predeclareLexical(program.body);
			self.hoistFunctions(program.body);
			self.hoistVars(program.body);
			let value = void 0;
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
				if (result.kind === "break" || result.kind === "continue") throw typeError(`Unexpected '${result.kind}' outside of a loop.`, statement);
			}
			value = yield* resolvePromiseValue(self.ctx, value);
			return value;
		}).pipe(ensuring(sync(() => self.scopes.pop())));
	}
	createToolCallPromise(path, args) {
		const pending = this.ctx.pending;
		return pending.create(this.ctx.tool((json) => pending.turn.leave(this.ctx.tools.execute(path, json)), args));
	}
	await(promise) {
		const pending = this.ctx.pending;
		return suspend(() => {
			pending.markObserved(promise);
			return flatten(pending.turn.suspend(flatMap(pending.await(promise), (exit) => as(yieldNow, exit))));
		});
	}
	nextJob() {
		return this.ctx.pending.turn.suspend(yieldNow);
	}
	evaluateStatement(node) {
		switch (node.type) {
			case "ExpressionStatement": return as(this.evaluateExpression(node.expression), { kind: "none" });
			case "VariableDeclaration": return map(this.evaluateVariableDeclaration(node), () => ({ kind: "none" }));
			case "ReturnStatement": {
				const argumentNode = node.argument;
				return argumentNode ? map(this.evaluateExpression(argumentNode), (value) => ({
					kind: "return",
					value
				})) : succeed$1({
					kind: "return",
					value: void 0
				});
			}
			case "BlockStatement": return this.evaluateBlock(node);
			case "IfStatement": return this.evaluateIfStatement(node);
			case "SwitchStatement": return this.evaluateSwitchStatement(node);
			case "LabeledStatement": return this.evaluateLabeledStatement(node);
			case "WhileStatement": return this.evaluateWhileStatement(node);
			case "DoWhileStatement": return this.evaluateDoWhileStatement(node);
			case "ForStatement": return this.evaluateForStatement(node);
			case "ForOfStatement": return this.evaluateForOfStatement(node);
			case "ForInStatement": return this.evaluateForInStatement(node);
			case "BreakStatement": return succeed$1(this.evaluateBreakStatement(node));
			case "ContinueStatement": return succeed$1(this.evaluateContinueStatement(node));
			case "ThrowStatement": return this.evaluateThrowStatement(node);
			case "TryStatement": return this.evaluateTryStatement(node);
			case "EmptyStatement": return succeed$1({ kind: "none" });
			case "FunctionDeclaration": return succeed$1({ kind: "none" });
			default: throw unsupportedSyntax(node.type, node);
		}
	}
	evaluateBlock(node) {
		this.scopes.push();
		const self = this;
		return gen(function* () {
			const body = node.body;
			self.predeclareLexical(body);
			self.hoistFunctions(body);
			for (const statement of body) {
				const result = yield* self.evaluateStatement(statement);
				if (result.kind !== "none") return result;
			}
			return { kind: "none" };
		}).pipe(ensuring(sync(() => self.scopes.pop())));
	}
	createFunction(node, name = node.type === "ArrowFunctionExpression" ? "" : node.id?.name ?? "") {
		const builtins = this.ctx.builtins;
		const fn = new Fn(builtins.Function, name, node.params, node.body, this.scopes.capture(), node.async, node.generator, node.type === "ArrowFunctionExpression");
		if (node.generator) define(fn, "prototype", new Obj(node.async ? builtins.AsyncGenerator : builtins.Generator), hidden);
		if (node.type === "FunctionExpression" && node.id) fn.capturedScopes.push(/* @__PURE__ */ new Map([[node.id.name, {
			mutable: false,
			value: fn,
			initialized: true
		}]]));
		return fn;
	}
	evaluateNamed(node, name) {
		if (node.type === "ArrowFunctionExpression" || node.type === "FunctionExpression" && !node.id) return sync(() => this.createFunction(node, name));
		return this.evaluateExpression(node);
	}
	hoistFunctions(statements) {
		for (const node of statements) {
			if (node.type !== "FunctionDeclaration") continue;
			this.scopes.current().set(node.id.name, {
				mutable: true,
				value: this.createFunction(node),
				initialized: true
			});
		}
	}
	hoistVars(statements, parameters) {
		const names = varNames.get(statements) ?? statements.reduce((out, statement) => collectVarNames(statement, out), []);
		varNames.set(statements, names);
		const scope = this.scopes.current();
		for (const name of names) {
			if (scope.has(name)) continue;
			scope.set(name, {
				mutable: true,
				value: parameters?.get(name)?.value,
				initialized: true
			});
		}
	}
	predeclareLexical(statements) {
		for (const statement of statements) {
			if (statement.type !== "VariableDeclaration") continue;
			const kind = statement.kind;
			if (kind === "var") continue;
			for (const declaration of statement.declarations) for (const name of collectPatternNames(declaration.id)) this.scopes.reserve(name, kind !== "const", declaration);
		}
	}
	predeclarePattern(pattern, mutable, node) {
		for (const name of collectPatternNames(pattern)) this.scopes.reserve(name, mutable, node);
	}
	evaluateIfStatement(node) {
		return flatMap(this.evaluateExpression(node.test), (test) => test ? this.evaluateStatement(node.consequent) : node.alternate ? this.evaluateStatement(node.alternate) : succeed$1({ kind: "none" }));
	}
	evaluateSwitchStatement(node) {
		const self = this;
		return gen(function* () {
			const discriminant = yield* self.evaluateExpression(node.discriminant);
			self.scopes.push();
			return yield* gen(function* () {
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
				if (start === void 0) return { kind: "none" };
				for (let index = start; index < cases.length; index += 1) for (const statement of cases[index].consequent) {
					const result = yield* self.evaluateStatement(statement);
					if (result.kind === "break") {
						if (result.label === void 0) return { kind: "none" };
						return result;
					}
					if (result.kind === "return" || result.kind === "continue") return result;
				}
				return { kind: "none" };
			}).pipe(ensuring(sync(() => self.scopes.pop())));
		});
	}
	evaluateWhileStatement(node, labels) {
		const self = this;
		return gen(function* () {
			while (yield* self.evaluateExpression(node.test)) {
				const exit = loopExit(yield* self.evaluateStatement(node.body), labels);
				if (exit !== void 0) return exit;
			}
			return { kind: "none" };
		});
	}
	evaluateDoWhileStatement(node, labels) {
		const self = this;
		return gen(function* () {
			do {
				const exit = loopExit(yield* self.evaluateStatement(node.body), labels);
				if (exit !== void 0) return exit;
			} while (yield* self.evaluateExpression(node.test));
			return { kind: "none" };
		});
	}
	evaluateForStatement(node, labels) {
		this.scopes.push();
		const self = this;
		return gen(function* () {
			const initNode = node.init;
			const testNode = node.test;
			const updateNode = node.update;
			if (initNode?.type === "VariableDeclaration" && initNode.kind !== "var") self.predeclareLexical([initNode]);
			if (initNode) {
				if (initNode.type === "VariableDeclaration") yield* self.evaluateVariableDeclaration(initNode);
				else yield* self.evaluateExpression(initNode);
			}
			const perIterationBindings = initNode?.type === "VariableDeclaration" && initNode.kind !== "var" ? Array.from(self.scopes.current().keys()) : [];
			const nextIteration = () => {
				if (perIterationBindings.length === 0) return;
				const current = self.scopes.current();
				self.scopes.pop();
				self.scopes.push(new Map(perIterationBindings.map((name) => [name, { ...current.get(name) }])));
			};
			nextIteration();
			while (testNode ? yield* self.evaluateExpression(testNode) : true) {
				const exit = loopExit(yield* self.evaluateStatement(node.body), labels);
				if (exit !== void 0) return exit;
				nextIteration();
				if (updateNode) yield* self.evaluateExpression(updateNode);
			}
			return { kind: "none" };
		}).pipe(ensuring(sync(() => self.scopes.pop())));
	}
	evaluateForOfStatement(node, labels) {
		const awaiting = node.await;
		const left = node.left;
		const declared = loopDeclaration(left, "for...of");
		if (declared?.lexical) this.scopes.push();
		const self = this;
		return gen(function* () {
			if (declared?.lexical) self.predeclarePattern(declared.pattern, declared.mutable, left);
			const right = yield* self.evaluateExpression(node.right);
			const cursor = self.builtinCursor(right);
			const iterator = cursor === void 0 ? yield* self.customIterator(right, node, awaiting) : void 0;
			if (iterator === void 0 && cursor === void 0) throw invalidData(`${awaiting ? "for await...of" : "for...of"} requires an iterable value, received ${describeValue(right)}.`, node);
			const close = () => iterator ? self.closeIterator(iterator, node, awaiting) : awaiting ? andThen(cursor?.close ?? void_, self.nextJob()) : cursor?.close ?? void_;
			if (left.type === "RestElement" || left.type === "AssignmentPattern") throw typeError("Unsupported for...of binding.", left);
			const assignment = left.type === "VariableDeclaration" ? void 0 : left;
			const evaluateBody = (value) => gen(function* () {
				if (declared?.lexical) {
					self.scopes.push();
					self.predeclarePattern(declared.pattern, declared.mutable, left);
					yield* self.declarePattern(declared.pattern, value, declared.mutable, left, true);
				} else if (declared) yield* self.assignPattern(declared.pattern, value, left);
				else if (assignment) yield* self.assignPattern(assignment, value, left);
				return yield* self.evaluateStatement(node.body);
			}).pipe(ensuring(sync(() => {
				if (declared?.lexical) self.scopes.pop();
			})));
			while (true) {
				const current = iterator ? yield* self.nextIteratorResult(iterator, node, awaiting) : yield* cursor?.next ?? die(typeError("Iterator is unavailable.", node));
				const step = cursor && awaiting ? {
					done: current.done,
					value: yield* self.awaitValue(current.value)
				} : current;
				if (step.done) return { kind: "none" };
				const bodyExit = yield* exit(evaluateBody(step.value));
				if (!isSuccess(bodyExit)) {
					if (hasInterruptsOnly(bodyExit.cause)) return yield* failCause(bodyExit.cause);
					return yield* preserveConsumerError(close(), failCause(bodyExit.cause));
				}
				const exit$2 = loopExit(bodyExit.value, labels);
				if (exit$2 !== void 0) {
					yield* close();
					return exit$2;
				}
			}
		}).pipe(ensuring(sync(() => {
			if (declared?.lexical) self.scopes.pop();
		})));
	}
	awaitValue(value) {
		return flatMap(resolvePromise(this.ctx, value), (promise) => ensuring(this.await(promise), sync(() => this.depth = 0)));
	}
	awaitAsyncFromSyncValue(iterator, value, node, closeOnRejection) {
		const self = this;
		return gen(function* () {
			const settled = yield* exit(self.awaitValue(value));
			if (isSuccess(settled)) return settled.value;
			if (closeOnRejection && !hasInterruptsOnly(settled.cause)) yield* exit(self.closeIterator(iterator, node, false));
			return yield* failCause(settled.cause);
		});
	}
	iterate(value, node) {
		const cursor = this.builtinCursor(value);
		if (cursor !== void 0) return succeed$1(cursor);
		return map(this.customIterator(value, node, false), (iterator) => iterator === void 0 ? void 0 : this.customCursor(iterator, node));
	}
	/** GetIteratorDirect: drive an iterator by its own `next`, without asking for `[Symbol.iterator]`. */
	iterateDirect(value, node) {
		if (value instanceof IteratorObj) return value.cursor;
		if (!(value instanceof Obj)) throw typeError(`An iterator must be an object, received ${describeValue(value)}.`, node);
		return this.customCursor({
			iterator: value,
			next: this.requireIteratorMethod(get(value, "next"), "Iterator next", node),
			asynchronous: false
		}, node);
	}
	customCursor(iterator, node) {
		return {
			next: this.nextIteratorResult(iterator, node, false),
			close: suspend(() => this.closeIterator(iterator, node, false))
		};
	}
	builtinCursor(value) {
		if (value instanceof IteratorObj) return value.cursor;
		const iterator = typeof value === "string" ? value[Symbol.iterator]() : value instanceof Obj ? value.iterator(this.ctx.builtins) : void 0;
		return iterator === void 0 ? void 0 : hostCursor(iterator);
	}
	customIterator(value, node, allowAsync = true) {
		if (!(value instanceof Obj)) return undefined_;
		const asyncMethod = allowAsync ? get(value, AsyncIteratorSymbol) : void 0;
		const method = asyncMethod ?? get(value, IteratorSymbol);
		if (method === void 0 || method === null) return undefined_;
		const self = this;
		return map(this.call(this.requireIteratorMethod(method, "Iterator method", node), value, [], node), (iterator) => {
			const object = self.requireIteratorObject(iterator, "Iterator method result", node);
			return {
				iterator: object,
				next: self.requireIteratorMethod(get(object, "next"), "Iterator next", node),
				asynchronous: asyncMethod !== void 0 && asyncMethod !== null
			};
		});
	}
	nextIteratorResult(iterator, node, awaiting) {
		const self = this;
		return gen(function* () {
			if (iterator.asynchronous) {
				const object = self.requireIteratorObject(yield* self.awaitValue(yield* self.call(iterator.next, iterator.iterator, [], node)), "Iterator next() result", node);
				return {
					done: Boolean(get(object, "done")),
					value: get(object, "value")
				};
			}
			const called = yield* exit(self.call(iterator.next, iterator.iterator, [], node));
			if (!isSuccess(called)) {
				if (awaiting) yield* self.nextJob();
				return yield* failCause(called.cause);
			}
			const captured = yield* exit(sync(() => {
				const object = self.requireIteratorObject(called.value, "Iterator next() result", node);
				return {
					done: Boolean(get(object, "done")),
					value: get(object, "value")
				};
			}));
			if (!isSuccess(captured)) {
				if (awaiting) yield* self.nextJob();
				return yield* failCause(captured.cause);
			}
			return {
				done: captured.value.done,
				value: awaiting ? yield* self.awaitAsyncFromSyncValue(iterator, captured.value.value, node, !captured.value.done) : captured.value.value
			};
		});
	}
	closeIterator(iterator, node, awaiting = true) {
		const close = get(iterator.iterator, "return");
		if (close === void 0 || close === null) return iterator.asynchronous || !awaiting ? void_ : this.nextJob();
		const self = this;
		return gen(function* () {
			const method = self.requireIteratorMethod(close, "Iterator return", node);
			if (iterator.asynchronous) {
				self.requireIteratorObject(yield* self.awaitValue(yield* self.call(method, iterator.iterator, [], node)), "Iterator return() result", node);
				return;
			}
			const called = yield* exit(self.call(method, iterator.iterator, [], node));
			if (!isSuccess(called)) {
				if (awaiting) yield* self.nextJob();
				return yield* failCause(called.cause);
			}
			const captured = yield* exit(sync(() => get(self.requireIteratorObject(called.value, "Iterator return() result", node), "value")));
			if (!isSuccess(captured)) {
				if (awaiting) yield* self.nextJob();
				return yield* failCause(captured.cause);
			}
			if (awaiting) yield* self.awaitValue(captured.value);
		});
	}
	requireIteratorObject(value, context, node) {
		if (value instanceof Obj) return value;
		throw typeError(`${context} must be an object.`, node);
	}
	requireIteratorMethod(value, context, node) {
		if (typeofValue(value) === "function") return value;
		throw typeError(`${context} must be a function.`, node);
	}
	enumerableKeys(value, node) {
		if (value instanceof ToolReference) return [...this.ctx.tools.keys(value.path)];
		if (value === null || value === void 0) return [];
		return keys(enumerableSource(this.ctx, "for...in", value, node));
	}
	evaluateForInStatement(node, labels) {
		const left = node.left;
		const declared = loopDeclaration(left, "for...in");
		if (declared?.lexical) this.scopes.push();
		const self = this;
		return gen(function* () {
			if (declared?.lexical) self.predeclarePattern(declared.pattern, declared.mutable, left);
			const right = yield* self.evaluateExpression(node.right);
			const keys = self.enumerableKeys(right, node.right);
			if (left.type === "RestElement" || left.type === "AssignmentPattern") throw typeError("Unsupported for...in binding.", left);
			const assignment = left.type === "VariableDeclaration" ? void 0 : left;
			for (const key of keys) {
				const result = yield* gen(function* () {
					if (declared?.lexical) {
						self.scopes.push();
						self.predeclarePattern(declared.pattern, declared.mutable, left);
						yield* self.declarePattern(declared.pattern, key, declared.mutable, left, true);
					} else if (declared) yield* self.assignPattern(declared.pattern, key, left);
					else if (assignment) yield* self.assignPattern(assignment, key, left);
					return yield* self.evaluateStatement(node.body);
				}).pipe(ensuring(sync(() => {
					if (declared?.lexical) self.scopes.pop();
				})));
				const exit = loopExit(result, labels);
				if (exit !== void 0) return exit;
			}
			return { kind: "none" };
		}).pipe(ensuring(sync(() => {
			if (declared?.lexical) self.scopes.pop();
		})));
	}
	evaluateBreakStatement(node) {
		return node.label ? {
			kind: "break",
			label: node.label.name
		} : { kind: "break" };
	}
	evaluateContinueStatement(node) {
		return node.label ? {
			kind: "continue",
			label: node.label.name
		} : { kind: "continue" };
	}
	evaluateLabeledStatement(node) {
		const labels = /* @__PURE__ */ new Set();
		let body = node;
		while (body.type === "LabeledStatement") {
			labels.add(body.label.name);
			body = body.body;
		}
		const evaluated = (() => {
			if (body.type === "WhileStatement") return this.evaluateWhileStatement(body, labels);
			if (body.type === "DoWhileStatement") return this.evaluateDoWhileStatement(body, labels);
			if (body.type === "ForStatement") return this.evaluateForStatement(body, labels);
			if (body.type === "ForOfStatement") return this.evaluateForOfStatement(body, labels);
			if (body.type === "ForInStatement") return this.evaluateForInStatement(body, labels);
			return this.evaluateStatement(body);
		})();
		return map(evaluated, (result) => result.kind === "break" && result.label !== void 0 && labels.has(result.label) ? { kind: "none" } : result);
	}
	evaluateThrowStatement(node) {
		return flatMap(this.evaluateExpression(node.argument), (value) => fail$1(new Throw(value)));
	}
	evaluateTryStatement(node) {
		const body = node.block;
		const handler = node.handler;
		const finalizer = node.finalizer;
		const self = this;
		const attempted = matchCauseEffect(this.evaluateStatement(body), {
			onFailure: (cause) => {
				if (cause.reasons.some(isInterruptReason) || squash(cause) instanceof GeneratorReturn || !handler) return failCause(cause);
				const caught = materialize(self.ctx, squash(cause));
				const parameter = handler.param;
				self.scopes.push();
				return gen(function* () {
					if (parameter) yield* self.declarePattern(parameter, caught, true, handler);
					return yield* self.evaluateStatement(handler.body);
				}).pipe(ensuring(sync(() => self.scopes.pop())));
			},
			onSuccess: succeed$1
		});
		if (!finalizer) return attempted;
		const isAbrupt = (result) => result.kind === "return" || result.kind === "break" || result.kind === "continue";
		return matchCauseEffect(attempted, {
			onFailure: (cause) => cause.reasons.some(isInterruptReason) ? failCause(cause) : flatMap(this.evaluateStatement(finalizer), (final) => isAbrupt(final) ? succeed$1(final) : failCause(cause)),
			onSuccess: (result) => flatMap(this.evaluateStatement(finalizer), (final) => isAbrupt(final) ? succeed$1(final) : succeed$1(result))
		});
	}
	evaluateVariableDeclaration(node) {
		const kind = node.kind;
		const self = this;
		return gen(function* () {
			for (const declaration of node.declarations) {
				if (declaration.type !== "VariableDeclarator") throw typeError("Unsupported variable declaration shape.", declaration);
				const init = declaration.init;
				const id = declaration.id;
				const evaluate = (init) => id.type === "Identifier" ? self.evaluateNamed(init, id.name) : self.evaluateExpression(init);
				if (kind === "var") {
					if (init) yield* self.assignPattern(id, yield* evaluate(init), declaration);
					continue;
				}
				const value = init ? yield* evaluate(init) : void 0;
				yield* self.declarePattern(declaration.id, value, kind !== "const", declaration, true);
			}
		});
	}
	declarePattern(pattern, value, mutable, node, initialize = false) {
		const self = this;
		return gen(function* () {
			if (pattern.type === "Identifier") {
				const name = pattern.name;
				if (initialize) self.scopes.initialize(name, value, node);
				else self.scopes.declare(name, value, mutable, node);
				return;
			}
			if (pattern.type === "AssignmentPattern") {
				const resolved = value === void 0 ? yield* self.evaluateDefault(pattern) : value;
				yield* self.declarePattern(pattern.left, resolved, mutable, node, initialize);
				return;
			}
			if (pattern.type === "ObjectPattern") {
				if (value === null || value === void 0) throw typeError(`Cannot destructure ${describeValue(value)} as it is ${value}.`, pattern);
				const consumed = /* @__PURE__ */ new Set();
				for (const property of pattern.properties) {
					if (property.type === "RestElement") {
						const rest = new Obj(self.ctx.builtins.Object);
						assign(rest, enumerableSource(self.ctx, "Object destructuring", value, pattern), consumed);
						yield* self.declarePattern(property.argument, rest, mutable, property, initialize);
						continue;
					}
					const key = yield* self.destructuringPropertyKey(property);
					consumed.add(typeof key === "symbol" ? key : String(key));
					yield* self.declarePattern(property.value, self.destructuredProperty(value, key, property), mutable, property, initialize);
				}
				return;
			}
			if (pattern.type === "ArrayPattern") return yield* self.destructureArrayPattern(pattern, value, (target, item, context) => self.declarePattern(target, item, mutable, context, initialize));
			throw typeError(`Unsupported binding pattern '${pattern.type}'.`, pattern);
		});
	}
	assignPattern(pattern, value, node) {
		const self = this;
		return gen(function* () {
			if (pattern.type === "Identifier") {
				self.scopes.set(pattern.name, value, pattern);
				return;
			}
			if (pattern.type === "MemberExpression") {
				yield* self.writeMember(pattern, value);
				return;
			}
			if (pattern.type === "AssignmentPattern") {
				const resolved = value === void 0 ? yield* self.evaluateDefault(pattern) : value;
				yield* self.assignPattern(pattern.left, resolved, node);
				return;
			}
			if (pattern.type === "ObjectPattern") {
				if (value === null || value === void 0) throw typeError(`Cannot destructure ${describeValue(value)} as it is ${value}.`, pattern);
				const consumed = /* @__PURE__ */ new Set();
				for (const property of pattern.properties) {
					if (property.type === "RestElement") {
						const rest = new Obj(self.ctx.builtins.Object);
						assign(rest, enumerableSource(self.ctx, "Object destructuring", value, pattern), consumed);
						yield* self.assignPattern(property.argument, rest, property);
						continue;
					}
					const key = yield* self.destructuringPropertyKey(property);
					consumed.add(typeof key === "symbol" ? key : String(key));
					yield* self.assignPattern(property.value, self.destructuredProperty(value, key, property), property);
				}
				return;
			}
			if (pattern.type === "ArrayPattern") return yield* self.destructureArrayPattern(pattern, value, (target, item, context) => self.assignPattern(target, item, context));
			throw typeError(`Unsupported assignment pattern '${pattern.type}'.`, node);
		});
	}
	evaluateDefault(pattern) {
		return pattern.left.type === "Identifier" ? this.evaluateNamed(pattern.right, pattern.left.name) : this.evaluateExpression(pattern.right);
	}
	destructureArrayPattern(pattern, value, consume) {
		const self = this;
		return gen(function* () {
			const cursor = yield* self.iterate(value, pattern);
			if (cursor === void 0) throw typeError("Array destructuring requires a supported iterable value.", pattern);
			let done = false;
			for (const element of pattern.elements) {
				if (done) {
					if (element === null) continue;
					yield* consume(element.type === "RestElement" ? element.argument : element, element.type === "RestElement" ? new Arr(self.ctx.builtins.Array) : void 0, element);
					if (element.type === "RestElement") return;
					continue;
				}
				const step = yield* cursor.next;
				done = step.done;
				if (element === null) continue;
				if (element.type === "RestElement") {
					const rest = [];
					if (!step.done) rest.push(step.value);
					while (!done) {
						const next = yield* cursor.next;
						done = next.done;
						if (!done) rest.push(next.value);
					}
					yield* consume(element.argument, new Arr(self.ctx.builtins.Array, rest), element);
					return;
				}
				const consumed = consume(element, step.done ? void 0 : step.value, pattern);
				yield* step.done ? consumed : preserveConsumerError(cursor.close, consumed);
			}
			if (!done) yield* cursor.close;
		});
	}
	destructuringPropertyKey(property) {
		if (property.type !== "Property" || property.kind !== "init") throw typeError("Unsupported object destructuring property.", property);
		const keyNode = property.key;
		if (property.computed) return flatMap(this.evaluateExpression(keyNode), (value) => this.toPropertyKey(value, keyNode));
		if (keyNode.type === "Identifier") return succeed$1(keyNode.name);
		if (keyNode.type === "Literal") return succeed$1(String(keyNode.value));
		throw unsupportedSyntax(keyNode.type, keyNode);
	}
	evaluateExpression(node) {
		switch (node.type) {
			case "Literal": {
				const regex = node.regex;
				if (regex) return sync(() => constructRegExp(this.ctx.builtins, [regex.pattern, regex.flags]));
				return succeed$1(literal$1(node));
			}
			case "Identifier": return sync(() => this.scopes.get(node.name, node));
			case "ThisExpression": return sync(() => this.scopes.get("this", node));
			case "BinaryExpression": return this.evaluateBinaryExpression(node);
			case "LogicalExpression": return this.evaluateLogicalExpression(node);
			case "UnaryExpression": return this.evaluateUnaryExpression(node);
			case "AssignmentExpression": return this.evaluateAssignmentExpression(node);
			case "SequenceExpression": {
				const self = this;
				return gen(function* () {
					let result;
					for (const expression of node.expressions) result = yield* self.evaluateExpression(expression);
					return result;
				});
			}
			case "CallExpression": return this.evaluateCallExpression(node);
			case "ArrowFunctionExpression":
			case "FunctionExpression": return sync(() => this.createFunction(node));
			case "MemberExpression": return this.readMember(node);
			case "ChainExpression": return map(this.evaluateExpression(node.expression), (value) => value === OptionalShortCircuit ? void 0 : value);
			case "ObjectExpression": return this.evaluateObjectExpression(node);
			case "ArrayExpression": return this.evaluateArrayExpression(node);
			case "TemplateLiteral": return this.evaluateTemplateLiteral(node);
			case "TaggedTemplateExpression": return this.evaluateTaggedTemplate(node);
			case "ConditionalExpression": return this.evaluateConditionalExpression(node);
			case "UpdateExpression": return this.evaluateUpdateExpression(node);
			case "AwaitExpression": return flatMap(this.evaluateExpression(node.argument), (value) => this.awaitValue(value));
			case "YieldExpression": return this.evaluateYieldExpression(node);
			case "NewExpression": return this.evaluateNewExpression(node);
			default: throw unsupportedSyntax(node.type, node);
		}
	}
	evaluateNewExpression(node) {
		const self = this;
		return gen(function* () {
			const callee = yield* self.evaluateExpression(node.callee);
			const construct = callee instanceof Native ? callee.construct : void 0;
			if (construct === void 0) {
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
		if (left.type === "PrivateIdentifier") throw unsupportedSyntax(left.type, left);
		const self = this;
		return gen(function* () {
			const lhs = yield* self.evaluateExpression(left);
			const rhs = yield* self.evaluateExpression(node.right);
			if (operator === "instanceof") return instanceofValue(lhs, rhs, node);
			if (lhs instanceof Obj || rhs instanceof Obj) return yield* self.applyOperator(operator, lhs, rhs, node);
			return self.applyBinaryOperator(operator, lhs, rhs, node);
		});
	}
	/** ToPrimitive for an operand: data objects run their own methods; opaque values stay for the data gates below. */
	toPrimitive(value, hint, node) {
		return this.native(() => toPrimitive(this.ctx, value, hint), node);
	}
	applyOperator(operator, lhs, rhs, node) {
		if (!(lhs instanceof Obj || rhs instanceof Obj)) return succeed$1(this.applyBinaryOperator(operator, lhs, rhs, node));
		const equality = operator === "==" || operator === "!=";
		if (operator === "in" && lhs instanceof Obj && !isOpaque(lhs) && rhs instanceof Obj) return map(this.toPropertyKey(lhs, node), (key) => has(rhs, key));
		const other = lhs instanceof Obj ? rhs : lhs;
		if (!(primitiveOperators.has(operator) || equality && other !== null && other !== void 0 && typeof other !== "object")) return succeed$1(this.applyBinaryOperator(operator, lhs, rhs, node));
		const hint = operator === "+" || equality ? "default" : "number";
		const self = this;
		return gen(function* () {
			const l = yield* self.toPrimitive(lhs, hint, node);
			const r = yield* self.toPrimitive(rhs, hint, node);
			return self.applyBinaryOperator(operator, l, r, node);
		});
	}
	applyBinaryOperator(operator, lhs, rhs, node) {
		if (operator === "===") return lhs === rhs;
		if (operator === "!==") return lhs !== rhs;
		if (operator === "==") return this.looselyEqual(lhs, rhs, node);
		if (operator === "!=") return !this.looselyEqual(lhs, rhs, node);
		if (operator === "in" && rhs instanceof Obj && !isOpaque(lhs)) return has(rhs, propertyKey(lhs));
		if (isOpaque(lhs) || isOpaque(rhs)) throw invalidData("Binary operators require data values.", node);
		switch (operator) {
			case "+": {
				const sum = lhs + rhs;
				if (typeof sum === "string") checkStringLength(sum.length);
				return sum;
			}
			case "-": return lhs - rhs;
			case "*": return lhs * rhs;
			case "/": return lhs / rhs;
			case "%": return lhs % rhs;
			case "**": return lhs ** rhs;
			case "<": return lhs < rhs;
			case "<=": return lhs <= rhs;
			case ">": return lhs > rhs;
			case ">=": return lhs >= rhs;
			case "&": return lhs & rhs;
			case "|": return lhs | rhs;
			case "^": return lhs ^ rhs;
			case "<<": return lhs << rhs;
			case ">>": return lhs >> rhs;
			case ">>>": return lhs >>> rhs;
			case "in": throw typeError("The 'in' operator requires a data object on the right-hand side.", node);
			default: throw typeError(`Unsupported binary operator '${operator}'.`, node);
		}
	}
	looselyEqual(lhs, rhs, node) {
		const lhsObject = lhs !== null && typeof lhs === "object";
		if (lhsObject === (rhs !== null && typeof rhs === "object")) return lhsObject ? lhs === rhs : lhs == rhs;
		const primitive = lhsObject ? rhs : lhs;
		if (primitive === null || primitive === void 0) return false;
		throw invalidData("Binary operators require data values.", node);
	}
	evaluateLogicalExpression(node) {
		const operator = node.operator;
		return flatMap(this.evaluateExpression(node.left), (left) => {
			if (operator === "&&") return left ? this.evaluateExpression(node.right) : succeed$1(left);
			if (operator === "||") return left ? succeed$1(left) : this.evaluateExpression(node.right);
			if (operator === "??") return left !== null && left !== void 0 ? succeed$1(left) : this.evaluateExpression(node.right);
			throw typeError(`Unsupported logical operator '${operator}'.`, node);
		});
	}
	evaluateUnaryExpression(node) {
		const operator = node.operator;
		const argument = node.argument;
		if (operator === "delete") return this.evaluateDeleteExpression(argument);
		if (operator === "typeof" && argument.type === "Identifier" && !this.scopes.resolve(argument.name)) return succeed$1("undefined");
		const self = this;
		return gen(function* () {
			const value = yield* self.evaluateExpression(argument);
			if (operator === "typeof") return typeofValue(value);
			if (operator === "!") return !value;
			if (operator === "void") return void 0;
			const operand = yield* self.toPrimitive(value, "number", node);
			if (isOpaque(operand)) throw invalidData("Unary operators require data values.", node);
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
				default: throw typeError(`Unsupported unary operator '${operator}'.`, node);
			}
			return result;
		});
	}
	evaluateAssignmentExpression(node) {
		const left = node.left;
		const operator = node.operator;
		const binary = operator.slice(0, -1);
		const self = this;
		return gen(function* () {
			if (operator === "??=" || operator === "||=" || operator === "&&=") return yield* self.evaluateLogicalAssignment(node, left, operator);
			if (operator !== "=" && !compoundOperators.has(operator)) throw typeError(`Unsupported assignment operator '${operator}'.`, node);
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
			if (left.type === "MemberExpression") return yield* self.modifyMember(left, (current) => flatMap(self.evaluateExpression(node.right), (rightValue) => {
				if (operator === "=") return succeed$1({
					write: true,
					next: rightValue,
					result: rightValue
				});
				return map(self.applyOperator(binary, current, rightValue, node), (next) => ({
					write: true,
					next,
					result: next
				}));
			}));
			throw typeError("Assignment target must be an Identifier or MemberExpression.", left);
		});
	}
	evaluateLogicalAssignment(node, left, operator) {
		const self = this;
		const shouldAssign = (current) => operator === "??=" ? current === null || current === void 0 : operator === "||=" ? !current : Boolean(current);
		if (left.type === "Identifier") {
			const name = left.name;
			return gen(function* () {
				const current = self.scopes.get(name, left);
				if (!shouldAssign(current)) return current;
				const rightValue = yield* self.evaluateNamed(node.right, name);
				return self.scopes.set(name, rightValue, left);
			});
		}
		if (left.type === "MemberExpression") return self.modifyMember(left, (current) => shouldAssign(current) ? map(self.evaluateExpression(node.right), (rightValue) => ({
			write: true,
			next: rightValue,
			result: rightValue
		})) : succeed$1({
			write: false,
			next: current,
			result: current
		}));
		throw typeError("Assignment target must be an Identifier or MemberExpression.", left);
	}
	evaluateUpdateExpression(node) {
		const operator = node.operator;
		const argument = node.argument;
		const prefix = node.prefix;
		const increment = operator === "++" ? 1 : operator === "--" ? -1 : void 0;
		if (increment === void 0) throw typeError(`Unsupported update operator '${operator}'.`, node);
		const operand = (current) => {
			if (isOpaque(current)) throw invalidData(`'${operator}' requires a data value.`, argument);
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
			if (!(current instanceof Obj)) return sync(() => update(current));
			return map(this.toPrimitive(current, "number", argument), update);
		}
		if (argument.type === "MemberExpression") return this.modifyMember(argument, (current) => map(this.toPrimitive(current, "number", argument), (primitive) => {
			const value = operand(primitive);
			const next = value + increment;
			return {
				write: true,
				next,
				result: prefix ? next : value
			};
		}));
		throw typeError("Update target must be an Identifier or MemberExpression.", argument);
	}
	evaluateCallExpression(node) {
		const callee = node.callee;
		const self = this;
		return gen(function* () {
			if (callee.type === "Super") throw unsupportedSyntax(callee.type, callee);
			const { callable, thisValue } = callee.type === "MemberExpression" ? yield* self.readMethod(callee) : {
				callable: yield* self.evaluateExpression(callee),
				thisValue: void 0
			};
			if (callable === OptionalShortCircuit) return OptionalShortCircuit;
			if ((callable === null || callable === void 0) && node.optional) return OptionalShortCircuit;
			const args = yield* self.evaluateCallArguments(node.arguments);
			return yield* self.call(callable, thisValue, args, node, callee);
		});
	}
	readMethod(node) {
		return map(this.getMemberReference(node), (reference) => {
			if (reference === OptionalShortCircuit) return {
				callable: OptionalShortCircuit,
				thisValue: void 0
			};
			if (reference instanceof ToolReference) return {
				callable: reference,
				thisValue: void 0
			};
			if ("value" in reference) return {
				callable: reference.value,
				thisValue: void 0
			};
			return {
				callable: this.readReference(reference, node),
				thisValue: reference.receiver
			};
		});
	}
	call(callable, thisValue, args, node, callee) {
		const self = this;
		return gen(function* () {
			if (callable instanceof ToolReference) {
				if (callable.path.length === 0) throw typeError("The tools root is not callable.", callee ?? node);
				return yield* self.createToolCallPromise(callable.path, args);
			}
			if (callable instanceof Fn) return yield* self.invokeFunction(callable, thisValue, args, node);
			if (callable instanceof Native) return yield* self.native(() => callable.call(thisValue, args), node);
			throw typeError(`${calleeDescription(callee) ?? "The called value"} is not a function.`, callee ?? node);
		});
	}
	native(body, node) {
		return provideService(catchDefect(suspend(body), (defect) => die(locate(defect, node))), CallSite, {
			node,
			depth: this.depth
		});
	}
	evaluateCallArguments(argNodes) {
		const self = this;
		return gen(function* () {
			const args = [];
			for (const argNode of argNodes) if (argNode.type === "SpreadElement") {
				const spread = yield* self.evaluateExpression(argNode.argument);
				const cursor = yield* self.iterate(spread, argNode);
				if (cursor === void 0) throw typeError("Spread arguments require a synchronous iterable.", argNode);
				while (true) {
					const step = yield* cursor.next;
					if (step.done) break;
					args.push(step.value);
				}
			} else args.push(yield* self.evaluateExpression(argNode));
			return args;
		});
	}
	invokeFunction(fn, thisValue, args, node) {
		const self = this;
		return flatMap(CallSite, (site) => {
			const depth = Math.max(self.depth, site.depth) + 1;
			if (depth > MAX_CALL_DEPTH) throw rangeError("Maximum call stack size exceeded", node);
			const invocation = new Frame(this.ctx, new ScopeStack([...fn.capturedScopes, /* @__PURE__ */ new Map()]), depth);
			const paramScope = invocation.scopes.current();
			if (!fn.arrow) paramScope.set("this", {
				mutable: false,
				value: thisValue,
				initialized: true
			});
			if (!fn.arrow && usesArguments(fn)) paramScope.set("arguments", {
				mutable: true,
				value: new Arguments(self.ctx.builtins.Object, args),
				initialized: true
			});
			for (const parameter of fn.parameters) for (const name of collectPatternNames(parameter)) paramScope.set(name, {
				mutable: true,
				value: void 0,
				initialized: false
			});
			const parameters = fn.parameters.map((parameter) => parameter.type === "Identifier" ? parameter.name : void 0);
			const bind = gen(function* () {
				for (const [index, parameter] of fn.parameters.entries()) {
					if (parameter.type === "RestElement") {
						yield* invocation.declarePattern(parameter.argument, new Arr(self.ctx.builtins.Array, args.slice(index)), true, parameter, true);
						break;
					}
					if (parameter.type === "Identifier" && parameters.lastIndexOf(parameter.name) !== index) continue;
					yield* invocation.declarePattern(parameter, args[index], true, parameter, true);
				}
			});
			const body = gen(function* () {
				if (fn.body.type === "BlockStatement") {
					invocation.scopes.push();
					invocation.hoistVars(fn.body.body, paramScope);
					const result = yield* invocation.evaluateStatement(fn.body);
					return result.kind === "return" ? result.value : void 0;
				}
				return yield* invocation.evaluateExpression(fn.body);
			});
			if (fn.generator) return map(bind, () => this.createGenerator(invocation, body, fn));
			const run = andThen(bind, body);
			if (!fn.async) return run;
			return this.ctx.pending.createWithSelf((self) => flatMap(run, (value) => resolvePromiseValue(invocation.ctx, value, self)));
		});
	}
	createGenerator(invocation, run, fn) {
		const asynchronous = fn.async;
		const state = {
			started: false,
			completed: false,
			draining: false,
			pending: [],
			pendingIndex: 0
		};
		invocation.generatorState = state;
		invocation.generatorAsync = asynchronous;
		const builtins = this.ctx.builtins;
		const result = (value, done) => record(builtins.Object, {
			value,
			done
		});
		const turn = this.ctx.pending.turn;
		const request = (kind, value) => {
			const request = {
				kind,
				value,
				response: makeUnsafe$2()
			};
			const answer = suspend(() => isDoneUnsafe(request.response) ? _await(request.response) : turn.leave(_await(request.response)));
			if (!asynchronous && state.active) return die(typeError("Generator is already running."));
			if (asynchronous && (state.completed || !state.started && kind !== "next")) {
				state.started = true;
				state.completed = true;
				state.pending.push(request);
				if (state.draining) return answer;
				state.draining = true;
				return andThen(this.ctx.pending.fork(invocation.completeGeneratorRequests(state, true).pipe(ensuring(sync(() => state.draining = false)))), answer);
			}
			if (state.completed) {
				if (kind === "throw") return fail$1(new Throw(value));
				return succeed$1(result(kind === "return" ? value : void 0, true));
			}
			if (!state.started && kind !== "next") {
				state.completed = true;
				if (kind === "throw") return fail$1(new Throw(value));
				return succeed$1(result(value, true));
			}
			state.pending.push(request);
			if (state.available) {
				const available = state.available;
				state.available = void 0;
				return andThen(turn.handOff(sync(() => doneUnsafe(available, succeed$2(void 0)))), answer);
			}
			if (!state.started) {
				state.started = true;
				const body = gen(function* () {
					state.active = yield* invocation.takeGeneratorRequest(state);
					const exit$3 = yield* exit(run.pipe(flatMap((result) => asynchronous ? invocation.awaitValue(result) : succeed$1(result)), catch_((error) => error instanceof GeneratorReturn ? asynchronous ? invocation.awaitValue(error.value) : succeed$1(error.value) : fail$1(error))));
					const active = state.active;
					state.active = void 0;
					if (active) doneUnsafe(active.response, isSuccess(exit$3) ? succeed$2(result(exit$3.value, true)) : exit$3);
					yield* invocation.completeGeneratorRequests(state, asynchronous);
					state.completed = true;
				});
				return andThen(this.ctx.pending.fork(body), answer);
			}
			return answer;
		};
		const proto = get(fn, "prototype");
		return new GeneratorObj(proto instanceof Obj ? proto : builtins.Generator, asynchronous, request);
	}
	completeGeneratorRequests(state, asynchronous) {
		const self = this;
		const result = (value, done) => record(self.ctx.builtins.Object, {
			value,
			done
		});
		return gen(function* () {
			while (true) {
				const pending = self.dequeueGeneratorRequest(state);
				if (!pending) return;
				if (pending.kind === "throw") {
					doneUnsafe(pending.response, fail$2(new Throw(pending.value)));
					continue;
				}
				if (asynchronous && pending.kind === "return") {
					const resolved = yield* exit(self.awaitValue(pending.value));
					doneUnsafe(pending.response, isSuccess(resolved) ? succeed$2(result(resolved.value, true)) : resolved);
					continue;
				}
				doneUnsafe(pending.response, succeed$2(result(pending.kind === "return" ? pending.value : void 0, true)));
			}
		});
	}
	takeGeneratorRequest(state) {
		const next = this.dequeueGeneratorRequest(state);
		if (next) return succeed$1(next);
		state.available = makeUnsafe$2();
		return andThen(this.ctx.pending.turn.park(_await(state.available)), sync(() => this.dequeueGeneratorRequest(state)));
	}
	dequeueGeneratorRequest(state) {
		const request = state.pending[state.pendingIndex];
		if (!request) return void 0;
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
		return gen(function* () {
			if (!self.generatorState) throw typeError("yield is only valid inside a generator.", node);
			if (node.delegate) {
				const value = argument ? yield* self.evaluateExpression(argument) : void 0;
				return yield* self.delegateYield(value, node);
			}
			const value = argument ? yield* self.evaluateExpression(argument) : void 0;
			const yielded = self.generatorAsync ? yield* self.awaitValue(value) : value;
			return yield* self.suspendGenerator(yielded, node);
		});
	}
	suspendGenerator(value, node) {
		const state = this.generatorState;
		if (!state?.active) throw typeError("Generator has no active request.", node);
		doneUnsafe(state.active.response, succeed$2(record(this.ctx.builtins.Object, {
			value,
			done: false
		})));
		state.active = void 0;
		return flatMap(this.takeGeneratorRequest(state), (request) => {
			state.active = request;
			if (request.kind === "next") return succeed$1(request.value);
			if (request.kind === "throw") return fail$1(new Throw(request.value));
			return this.generatorAsync ? flatMap(this.awaitValue(request.value), (value) => fail$1(new GeneratorReturn(value))) : fail$1(new GeneratorReturn(request.value));
		});
	}
	delegateYield(value, node) {
		const self = this;
		return gen(function* () {
			const cursor = self.builtinCursor(value);
			if (cursor !== void 0) while (true) {
				const step = yield* cursor.next;
				if (step.done) return void 0;
				const resumed = yield* exit(self.suspendGenerator(self.generatorAsync ? yield* self.awaitValue(step.value) : step.value, node));
				if (isSuccess(resumed)) continue;
				const error = squash(resumed.cause);
				if (error instanceof GeneratorReturn) {
					yield* cursor.close;
					return yield* fail$1(error);
				}
				if (error instanceof Throw) {
					yield* cursor.close;
					throw typeError("The delegated iterator does not provide a throw() method.", node);
				}
				return yield* failCause(resumed.cause);
			}
			const iterator = yield* self.customIterator(value, node, self.generatorAsync);
			if (!iterator) throw typeError("yield* requires a compatible iterable value.", node);
			let kind = "next";
			let input = void 0;
			while (true) {
				const method = kind === "next" ? iterator.next : get(iterator.iterator, kind);
				if (method === void 0 || method === null) {
					if (kind === "return") return yield* fail$1(new GeneratorReturn(input));
					yield* self.closeIterator(iterator, node, self.generatorAsync);
					throw typeError("The delegated iterator does not provide a throw() method.", node);
				}
				const called = yield* self.call(self.requireIteratorMethod(method, `Iterator ${kind}`, node), iterator.iterator, [input], node);
				const result = self.requireIteratorObject(iterator.asynchronous ? yield* self.awaitValue(called) : called, `Iterator ${kind}() result`, node);
				const done = Boolean(get(result, "done"));
				const resultValue = self.generatorAsync && !iterator.asynchronous ? yield* self.awaitAsyncFromSyncValue(iterator, get(result, "value"), node, kind !== "return" && !done) : get(result, "value");
				if (done) {
					if (kind === "return") return yield* fail$1(new GeneratorReturn(resultValue));
					return resultValue;
				}
				const resumed = yield* exit(self.suspendGenerator(resultValue, node));
				if (isSuccess(resumed)) {
					kind = "next";
					input = resumed.value;
					continue;
				}
				const error = squash(resumed.cause);
				if (!(error instanceof GeneratorReturn) && !(error instanceof Throw)) return yield* failCause(resumed.cause);
				kind = error instanceof GeneratorReturn ? "return" : "throw";
				input = error.value;
			}
		});
	}
	evaluateObjectExpression(node) {
		const objectValue = new Obj(this.ctx.builtins.Object);
		const self = this;
		return gen(function* () {
			for (const property of node.properties) {
				if (property.type === "SpreadElement") {
					const spread = yield* self.evaluateExpression(property.argument);
					if (spread === null || spread === void 0) continue;
					assign(objectValue, enumerableSource(self.ctx, "Object spread", spread, property));
					continue;
				}
				if (property.kind !== "init") throw typeError("Only init object properties are supported.", property);
				const keyNode = property.key;
				let key;
				if (property.computed) key = yield* self.toPropertyKey(yield* self.evaluateExpression(keyNode), keyNode);
				else if (keyNode.type === "Identifier") key = keyNode.name;
				else if (keyNode.type === "Literal") key = propertyKey(literal$1(keyNode));
				else throw typeError("Unsupported object property key shape.", keyNode);
				const name = key === IteratorSymbol ? "[Symbol.iterator]" : key === AsyncIteratorSymbol ? "[Symbol.asyncIterator]" : String(key);
				define(objectValue, key, yield* self.evaluateNamed(property.value, name));
			}
			return objectValue;
		});
	}
	evaluateArrayExpression(node) {
		const values = [];
		const self = this;
		return gen(function* () {
			for (const element of node.elements) {
				if (element === null) {
					values.length += 1;
					continue;
				}
				if (element.type === "SpreadElement") {
					const spread = yield* self.evaluateExpression(element.argument);
					const cursor = yield* self.iterate(spread, element);
					if (cursor === void 0) throw typeError("Array spread requires a synchronous iterable.", element);
					while (true) {
						const step = yield* cursor.next;
						if (step.done) break;
						values.push(step.value);
					}
				} else values.push(yield* self.evaluateExpression(element));
			}
			return new Arr(self.ctx.builtins.Array, values);
		});
	}
	evaluateTemplateLiteral(node) {
		const quasis = node.quasis;
		const expressions = node.expressions;
		let output = "";
		const self = this;
		return gen(function* () {
			for (let index = 0; index < quasis.length; index += 1) {
				const quasi = quasis[index];
				if (typeof quasi.value.cooked !== "string") throw typeError("Invalid template literal quasi.", quasi);
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
		return gen(function* () {
			const { callable, thisValue } = node.tag.type === "MemberExpression" ? yield* self.readMethod(node.tag) : {
				callable: yield* self.evaluateExpression(node.tag),
				thisValue: void 0
			};
			const strings = self.ctx.templates.get(node) ?? self.createTemplateObject(node);
			const values = yield* forEach(node.quasi.expressions, (expression) => self.evaluateExpression(expression));
			return yield* self.call(callable, thisValue, [strings, ...values], node, node.tag);
		});
	}
	createTemplateObject(node) {
		const array = this.ctx.builtins.Array;
		const strings = new Arr(array, node.quasi.quasis.map((quasi) => quasi.value.cooked ?? void 0));
		define(strings, "raw", new Arr(array, node.quasi.quasis.map((quasi) => quasi.value.raw)), frozen);
		this.ctx.templates.set(node, strings);
		return strings;
	}
	evaluateConditionalExpression(node) {
		return flatMap(this.evaluateExpression(node.test), (test) => this.evaluateExpression(test ? node.consequent : node.alternate));
	}
	getMemberReference(node) {
		const objectNode = node.object;
		const propertyNode = node.property;
		if (objectNode.type === "Super") throw unsupportedSyntax(objectNode.type, objectNode);
		if (propertyNode.type === "PrivateIdentifier") throw unsupportedSyntax(propertyNode.type, propertyNode);
		const self = this;
		return gen(function* () {
			const objectValue = yield* self.evaluateExpression(objectNode);
			if (objectValue === OptionalShortCircuit) return OptionalShortCircuit;
			if ((objectValue === null || objectValue === void 0) && node.optional) return OptionalShortCircuit;
			const keyValue = !node.computed && propertyNode.type === "Identifier" ? propertyNode.name : yield* self.evaluateExpression(propertyNode);
			if (objectValue === null || objectValue === void 0) throw typeError(`Cannot read properties of ${objectValue} (reading '${coerceToString(keyValue)}').`, objectNode);
			const key = yield* self.toPropertyKey(keyValue, propertyNode);
			return self.resolveProperty(objectValue, key, objectNode, propertyNode);
		});
	}
	resolveProperty(objectValue, key, objectNode, propertyNode) {
		if (objectValue instanceof ToolReference) {
			if (typeof key !== "string") throw typeError("Tool paths must use string property names.", propertyNode);
			return new ToolReference([...objectValue.path, key]);
		}
		if (objectValue instanceof Obj) return {
			target: objectValue,
			key,
			receiver: objectValue
		};
		if (typeof objectValue === "string") {
			if (key === "length") return { value: objectValue.length };
			const index = typeof key === "symbol" ? void 0 : parseArrayIndex(key);
			if (index !== void 0) return { value: objectValue[index] };
		}
		const proto = primitivePrototype(this.ctx.builtins, objectValue);
		if (proto !== void 0) return {
			target: proto,
			key,
			receiver: objectValue
		};
		if (objectValue === null || objectValue === void 0) throw typeError(`Cannot read properties of ${objectValue} (reading '${String(key)}').`, objectNode);
		throw typeError("Cannot access a property on a non-object value.", objectNode);
	}
	destructuredProperty(source, key, node) {
		const reference = this.resolveProperty(source, key, node, node);
		if (reference instanceof ToolReference) return reference;
		if ("value" in reference) return reference.value;
		return this.readProperty(reference.target, reference.key, node, reference.receiver);
	}
	readReference(reference, node) {
		if (reference.target instanceof PromiseObj && !has(reference.target, reference.key)) throw invalidData("This value is an un-awaited Promise; await it first - e.g. `const result = await tools.ns.tool(...)`.", node.object);
		return this.readProperty(reference.target, reference.key, node, reference.receiver);
	}
	readProperty(target, key, node, receiver = target) {
		try {
			return get(target, key, receiver);
		} catch (error) {
			throw locate(error, node);
		}
	}
	readMember(node) {
		return map(this.getMemberReference(node), (reference) => {
			if (reference === OptionalShortCircuit) return OptionalShortCircuit;
			if (reference instanceof ToolReference) return reference;
			if ("value" in reference) return reference.value;
			return this.readReference(reference, node);
		});
	}
	writeMember(node, value) {
		return this.modifyMember(node, () => succeed$1({
			write: true,
			next: value,
			result: value
		}));
	}
	evaluateDeleteExpression(argument) {
		const target = argument.type === "ChainExpression" ? argument.expression : argument;
		if (target.type === "Identifier") throw typeError("Only data fields may be deleted.", argument);
		if (target.type !== "MemberExpression") return map(this.evaluateExpression(target), () => true);
		return map(this.getMemberReference(target), (reference) => {
			if (reference === OptionalShortCircuit) return true;
			if (reference instanceof ToolReference || "value" in reference || reference.receiver !== reference.target) throw invalidData("Only data fields may be deleted.", target);
			if (remove(reference.target, reference.key)) return true;
			throw typeError(`Cannot delete property '${String(reference.key)}'.`, target);
		});
	}
	modifyMember(node, compute) {
		const self = this;
		return gen(function* () {
			const reference = yield* self.getMemberReference(node);
			if (reference === OptionalShortCircuit || reference instanceof ToolReference || "value" in reference) throw typeError("Only data fields may be assigned.", node);
			if (reference.receiver !== reference.target) throw typeError(`Cannot create property '${String(reference.key)}' on ${typeof reference.receiver} '${String(reference.receiver)}'.`, node);
			const key = reference.key;
			const { write, next, result } = yield* compute(self.readReference(reference, node));
			if (write) self.assignToReference(reference.target, key, next, node);
			return result;
		});
	}
	assignToReference(target, key, next, node) {
		if ((() => {
			try {
				rejectCircularInsertion(target, next, target instanceof Arr ? "Array assignment result" : "Object assignment result");
				return set(target, key, next);
			} catch (error) {
				throw locate(error, node);
			}
		})()) return;
		throw typeError(`Cannot assign to read only property '${String(key)}'.`, node);
	}
	toPropertyKey(value, node) {
		if (!(value instanceof Obj)) return succeed$1(propertyKey(value));
		return map(this.toPrimitive(value, "string", node), propertyKey);
	}
};
// node_modules/@opencode/codemode/dist/interpreter/execute.js
const executeProgram = (code, prepared, limits, hooks, globals) => {
	if (code.trim().length === 0) return succeed$1({
		ok: false,
		error: {
			kind: "ParseError",
			message: "Code cannot be empty."
		},
		toolCalls: []
	});
	return suspend(() => {
		const builtins = createBuiltins();
		const tools = make$1(prepared, limits.maxToolCalls, hooks);
		const logs = [];
		const logged = () => logs.length > 0 ? { logs: [...logs] } : {};
		let returned;
		const base = acquireUseRelease(make$10("parallel"), (scope) => gen(function* () {
			const program = parseProgram$1(code);
			const pending = new Pending(scope, builtins.Promise);
			const ctx = new Interpreter({
				tools,
				pending,
				builtins,
				logs,
				globals
			});
			return yield* pending.turn.hold(gen(function* () {
				const result = (yield* toBoundary(ctx, yield* ctx.run(program))) ?? null;
				returned = {
					value: result,
					pending
				};
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
		return (timeoutMs === void 0 ? base : base.pipe(timeoutOrElse({
			duration: timeoutMs,
			orElse: () => sync(() => {
				if (returned === void 0) return {
					ok: false,
					error: {
						kind: "TimeoutExceeded",
						message: `Execution timed out after ${timeoutMs}ms.`
					},
					...logged(),
					toolCalls: tools.calls
				};
				return {
					ok: true,
					value: returned.value,
					warnings: [{
						kind: "TimeoutExceeded",
						message: `The program returned, but background work was still running at the ${timeoutMs}ms timeout and was interrupted. Await all started promises.`
					}, ...returned.pending.diagnostics()],
					...logged(),
					toolCalls: tools.calls
				};
			})
		}))).pipe(catchCause((cause) => hasInterruptsOnly(cause) ? interrupt : succeed$1({
			ok: false,
			error: normalizeError(squash(cause)),
			...logged(),
			toolCalls: tools.calls
		})), map((result) => limits.maxOutputBytes === void 0 ? result : boundOutput(result, limits.maxOutputBytes)));
	});
};
const parseProgram$1 = (code) => {
	return parse$1(code, {
		ecmaVersion: "latest",
		sourceType: "script",
		allowReturnOutsideFunction: true,
		allowAwaitOutsideFunction: true,
		locations: true
	});
};
const utf8ByteLength = (value) => new TextEncoder().encode(value).byteLength;
const utf8Truncate = (value, maxBytes) => {
	const bytes = new TextEncoder().encode(value);
	if (bytes.byteLength <= maxBytes) return value;
	const text = new TextDecoder("utf-8").decode(bytes.slice(0, Math.max(0, maxBytes)));
	return text.endsWith("�") ? text.slice(0, -1) : text;
};
const boundOutput = (result, maxOutputBytes) => {
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
		if (warningBytes + bytes > maxOutputBytes) break;
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
		if (logBytes + lineBytes > logBudget) break;
		logBytes += lineBytes;
		kept.push(line);
	}
	if (kept.length < logs.length) {
		truncated = true;
		kept.push(`[logs truncated: showing ${kept.length} of ${logs.length} lines]`);
	}
	if (!truncated) return result;
	const warningsPart = keptWarnings.length > 0 ? { warnings: keptWarnings } : {};
	const logsPart = kept.length > 0 ? { logs: kept } : {};
	return result.ok ? {
		ok: true,
		value,
		...warningsPart,
		...logsPart,
		truncated: true,
		toolCalls: result.toolCalls
	} : {
		ok: false,
		error: result.error,
		...logsPart,
		truncated: true,
		toolCalls: result.toolCalls
	};
};
// node_modules/@opencode/codemode/dist/interpreter/extensions.js
/**
* The global bindings of one run's extensions. Everything crossing the boundary is converted: plain data and
* built-in wrappers are copied, a host function becomes a program function whose calls cross the same way, and a
* host Promise becomes a program promise.
*/
const extensionGlobals = (ctx, extensions) => {
	const builtins = ctx.builtins;
	const toHost = (value, label, depth = 0, seen = /* @__PURE__ */ new Set()) => {
		if (depth > 32) throw typeError(`${label} exceeds the maximum value depth of 32.`);
		if (isPrimitive(value)) return value;
		if (!(value instanceof Obj) || isOpaque(value)) throw typeError(`${label} contains ${describeValue(value)}, which cannot be passed to an extension.`);
		if (seen.has(value)) throw typeError(`${label} contains a circular value.`);
		seen.add(value);
		const next = (item) => toHost(item, label, depth + 1, seen);
		if (value instanceof ErrorObj) {
			const name = coerceToString(get(value, "name"));
			const message = get(value, "message");
			const text = message === void 0 ? "" : coerceToString(message);
			const copied = name === "AggregateError" ? new AggregateError([], text) : new ((hostErrors.get(name)) ?? Error)(text);
			for (const key of /* @__PURE__ */ new Set(["cause", ...keys(value)])) {
				if (uncrossed.has(key) || !has(value, key)) continue;
				const item = crossing(() => next(get(value, key)));
				if (item === left) continue;
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
	const fromHost = (value, label, depth = 0, seen = /* @__PURE__ */ new Set()) => {
		if (depth > 32) throw typeError(`${label} exceeds the maximum value depth of 32.`);
		if (isPrimitive(value)) return value;
		if (typeof value === "function") return wrap(value, label);
		if (value !== null && typeof value === "object") {
			const next = (item, path) => fromHost(item, path, depth + 1, seen);
			if (value instanceof Date) return new DateObj(builtins.Date, value.getTime());
			if (value instanceof RegExp) return new RegExpObj(builtins.RegExp, value.source, value.flags);
			if (value instanceof Uint8Array) return new Bytes(builtins.Uint8Array, new Uint8Array(value));
			if (value instanceof ArrayBuffer) return new Bytes(builtins.Uint8Array, new Uint8Array(value.slice(0)));
			if (value instanceof Error) {
				if (seen.has(value)) throw typeError(`${label} produced a circular value.`);
				seen.add(value);
				const copied = createErrorValue(builtins[isErrorType(value.name) ? value.name : "Error"], value.message);
				const fields = value;
				for (const key of /* @__PURE__ */ new Set(["cause", ...Object.keys(value)])) {
					if (uncrossed.has(key) || !(key in value) || typeof fields[key] === "function") continue;
					const item = crossing(() => next(fields[key], `${label}.${key}`));
					if (item === left) continue;
					define(copied, key, item, key === "cause" ? hidden : void 0);
				}
				seen.delete(value);
				return copied;
			}
			if (value instanceof URL) return new URLObj(builtins.URL, builtins.URLSearchParams, new URL(value.href));
			if (value instanceof URLSearchParams) return new URLSearchParamsObj(builtins.URLSearchParams, new URLSearchParams(value));
			if (value instanceof Headers) return new HeadersObj(builtins.Headers, new Headers(value));
			if (value instanceof Map) {
				const wrapped = new MapObj(builtins.Map);
				for (const [key, item] of value) wrapped.map.set(next(key, label), next(item, label));
				return wrapped;
			}
			if (value instanceof Set) {
				const wrapped = new SetObj(builtins.Set);
				for (const item of value) wrapped.set.add(next(item, label));
				return wrapped;
			}
			if (seen.has(value)) throw typeError(`${label} produced a circular value.`);
			seen.add(value);
			if (Array.isArray(value)) {
				const copied = new Arr(builtins.Array, value.map((item, index) => next(item, `${label}[${index}]`)));
				seen.delete(value);
				return copied;
			}
			const prototype = Object.getPrototypeOf(value);
			if (prototype === Object.prototype || prototype === null) {
				const copied = new Obj(builtins.Object);
				for (const [key, item] of Object.entries(value)) define(copied, key, next(item, `${label}.${key}`));
				seen.delete(value);
				return copied;
			}
		}
		throw typeError(`${label} produced ${describeHost(value)}, which the program cannot hold.`);
	};
	const wrap = (value, label, describe) => fn(builtins, value.name, value.length, (_, values) => {
		const args = values.map((item, index) => toHost(item, `Argument ${index + 1} to ${label}`));
		const hooks = ctx.tools.hooks;
		const settle = (run) => (describe === void 0 ? run : hooked(describe(args), hooks["extension.before"], hooks["extension.after"], run)).pipe(mapError((reason) => new Throw(fromHost(reason, label))), map((settled) => fromHost(settled, label)));
		let result;
		try {
			result = value.apply(void 0, args);
		} catch (reason) {
			return settle(fail$1(reason));
		}
		if (!(result instanceof Promise)) return settle(succeed$1(result));
		return ctx.pending.createHost(settle(tryPromise({
			try: () => result,
			catch: (reason) => reason
		})));
	});
	return extensions.flatMap((extension) => Object.entries(extension.globals).map(([name, value]) => [name, wrap(value, name, (args) => ({
		extension: extension.name,
		name,
		args
	}))]));
};
/**
* An error crosses as its name, message, `cause`, and own enumerable fields, such as Node's `code`, `errno`,
* `syscall`, and `path`. `stack` stays on its own side, and no field may shadow an Error method. A field that cannot
* cross (a socket, a handle, a function) is left behind so the error itself always arrives.
*/
const uncrossed = /* @__PURE__ */ new Set([
	"stack",
	"constructor",
	"toString",
	"__proto__"
]);
const left = Symbol("left behind");
const crossing = (convert) => {
	try {
		return convert();
	} catch (reason) {
		if (reason instanceof PendingThrow) return left;
		throw reason;
	}
};
const hostErrors = /* @__PURE__ */ new Map([
	["TypeError", TypeError],
	["RangeError", RangeError],
	["SyntaxError", SyntaxError],
	["ReferenceError", ReferenceError],
	["EvalError", EvalError],
	["URIError", URIError]
]);
const isPrimitive = (value) => value === null || value === void 0 || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
const describeHost = (value) => {
	if (typeof value !== "object" || value === null) return `a ${typeof value}`;
	const name = value.constructor?.name;
	return name === void 0 || name === "" ? "an object" : `a ${name}`;
};
Struct({ code: String$1 });
const Diagnostic = Struct({
	kind: Literals([
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
	]),
	message: String$1,
	location: optionalKey(Struct({
		line: Number$1,
		column: Number$1
	})),
	suggestions: optionalKey(ArraySchema(String$1))
});
const ToolCallSchema = Struct({ name: String$1 });
Union([Struct({
	ok: Literal(true),
	value: Json,
	warnings: optionalKey(ArraySchema(Diagnostic)),
	logs: optionalKey(ArraySchema(String$1)),
	truncated: optionalKey(Boolean$1),
	toolCalls: ArraySchema(ToolCallSchema)
}), Struct({
	ok: Literal(false),
	error: Diagnostic,
	logs: optionalKey(ArraySchema(String$1)),
	truncated: optionalKey(Boolean$1),
	toolCalls: ArraySchema(ToolCallSchema)
})]);
const validateLimit = (name, value, minimum) => {
	if (value !== void 0 && (!Number.isSafeInteger(value) || value < minimum)) throw new RangeError(`${name} must be a safe integer greater than or equal to ${minimum}.`);
	return value;
};
const resolveExecutionLimits = (limits) => ({
	timeoutMs: validateLimit("timeoutMs", limits?.timeoutMs, 1),
	maxToolCalls: validateLimit("maxToolCalls", limits?.maxToolCalls, 0),
	maxOutputBytes: validateLimit("maxOutputBytes", limits?.maxOutputBytes, 0)
});
/** Executes one Effect-native CodeMode program without constructing a reusable runtime. */
const execute$1 = (options) => make(options).execute(options.code);
/** Creates an Effect-native runtime over explicit, schema-described tools. */
const make = (options = {}) => {
	const prepared = prepare(options.tools ?? {});
	const limits = resolveExecutionLimits(options.limits);
	const extensions = options.extensions ?? [];
	const bound = new Set(globalNames);
	for (const extension of extensions) for (const name of Object.keys(extension.globals)) {
		if (bound.has(name)) throw new TypeError(`Extension "${extension.name}" global "${name}" is already defined.`);
		bound.add(name);
	}
	return {
		get catalog() {
			return prepared.catalog;
		},
		execute: (code) => executeProgram(code, prepared, limits, options.hooks ?? {}, (ctx) => extensionGlobals(ctx, extensions))
	};
};
decodeUnknownOption(fromJsonString(Unknown));
// node_modules/acorn-walk/dist/walk.mjs
function simple(node, visitors, baseVisitor, state, override) {
	if (!baseVisitor) baseVisitor = base;
	(function c(node, st, override) {
		var type = override || node.type;
		visitNode(baseVisitor, type, node, st, c);
		if (visitors[type]) visitors[type](node, st);
	})(node, state, override);
}
function ancestor(node, visitors, baseVisitor, state, override) {
	var ancestors = [];
	if (!baseVisitor) baseVisitor = base;
	(function c(node, st, override) {
		var type = override || node.type;
		var isNew = node !== ancestors[ancestors.length - 1];
		if (isNew) ancestors.push(node);
		visitNode(baseVisitor, type, node, st, c);
		if (visitors[type]) visitors[type](node, st || ancestors, ancestors);
		if (isNew) ancestors.pop();
	})(node, state, override);
}
function skipThrough(node, st, c) {
	c(node, st);
}
function ignore(_node, _st, _c) {}
function visitNode(baseVisitor, type, node, st, c) {
	if (baseVisitor[type] == null) throw new Error("No walker function defined for node type " + type);
	baseVisitor[type](node, st, c);
}
var base = {};
base.Program = base.BlockStatement = base.StaticBlock = function(node, st, c) {
	for (var i = 0, list = node.body; i < list.length; i += 1) {
		var stmt = list[i];
		c(stmt, st, "Statement");
	}
};
base.Statement = skipThrough;
base.EmptyStatement = ignore;
base.ExpressionStatement = base.ParenthesizedExpression = base.ChainExpression = function(node, st, c) {
	return c(node.expression, st, "Expression");
};
base.IfStatement = function(node, st, c) {
	c(node.test, st, "Expression");
	c(node.consequent, st, "Statement");
	if (node.alternate) c(node.alternate, st, "Statement");
};
base.LabeledStatement = function(node, st, c) {
	return c(node.body, st, "Statement");
};
base.BreakStatement = base.ContinueStatement = ignore;
base.WithStatement = function(node, st, c) {
	c(node.object, st, "Expression");
	c(node.body, st, "Statement");
};
base.SwitchStatement = function(node, st, c) {
	c(node.discriminant, st, "Expression");
	for (var i = 0, list = node.cases; i < list.length; i += 1) {
		var cs = list[i];
		c(cs, st);
	}
};
base.SwitchCase = function(node, st, c) {
	if (node.test) c(node.test, st, "Expression");
	for (var i = 0, list = node.consequent; i < list.length; i += 1) {
		var cons = list[i];
		c(cons, st, "Statement");
	}
};
base.ReturnStatement = base.YieldExpression = base.AwaitExpression = function(node, st, c) {
	if (node.argument) c(node.argument, st, "Expression");
};
base.ThrowStatement = base.SpreadElement = function(node, st, c) {
	return c(node.argument, st, "Expression");
};
base.TryStatement = function(node, st, c) {
	c(node.block, st, "Statement");
	if (node.handler) c(node.handler, st);
	if (node.finalizer) c(node.finalizer, st, "Statement");
};
base.CatchClause = function(node, st, c) {
	if (node.param) c(node.param, st, "Pattern");
	c(node.body, st, "Statement");
};
base.WhileStatement = base.DoWhileStatement = function(node, st, c) {
	c(node.test, st, "Expression");
	c(node.body, st, "Statement");
};
base.ForStatement = function(node, st, c) {
	if (node.init) c(node.init, st, "ForInit");
	if (node.test) c(node.test, st, "Expression");
	if (node.update) c(node.update, st, "Expression");
	c(node.body, st, "Statement");
};
base.ForInStatement = base.ForOfStatement = function(node, st, c) {
	c(node.left, st, "ForInit");
	c(node.right, st, "Expression");
	c(node.body, st, "Statement");
};
base.ForInit = function(node, st, c) {
	if (node.type === "VariableDeclaration") c(node, st);
	else c(node, st, "Expression");
};
base.DebuggerStatement = ignore;
base.FunctionDeclaration = function(node, st, c) {
	return c(node, st, "Function");
};
base.VariableDeclaration = function(node, st, c) {
	for (var i = 0, list = node.declarations; i < list.length; i += 1) {
		var decl = list[i];
		c(decl, st);
	}
};
base.VariableDeclarator = function(node, st, c) {
	c(node.id, st, "Pattern");
	if (node.init) c(node.init, st, "Expression");
};
base.Function = function(node, st, c) {
	if (node.id) c(node.id, st, "Pattern");
	for (var i = 0, list = node.params; i < list.length; i += 1) {
		var param = list[i];
		c(param, st, "Pattern");
	}
	c(node.body, st, node.expression ? "Expression" : "Statement");
};
base.Pattern = function(node, st, c) {
	if (node.type === "Identifier") c(node, st, "VariablePattern");
	else if (node.type === "MemberExpression") c(node, st, "MemberPattern");
	else c(node, st);
};
base.VariablePattern = ignore;
base.MemberPattern = skipThrough;
base.RestElement = function(node, st, c) {
	return c(node.argument, st, "Pattern");
};
base.ArrayPattern = function(node, st, c) {
	for (var i = 0, list = node.elements; i < list.length; i += 1) {
		var elt = list[i];
		if (elt) c(elt, st, "Pattern");
	}
};
base.ObjectPattern = function(node, st, c) {
	for (var i = 0, list = node.properties; i < list.length; i += 1) {
		var prop = list[i];
		if (prop.type === "Property") {
			if (prop.computed) c(prop.key, st, "Expression");
			c(prop.value, st, "Pattern");
		} else if (prop.type === "RestElement") c(prop.argument, st, "Pattern");
	}
};
base.Expression = skipThrough;
base.ThisExpression = base.Super = base.MetaProperty = ignore;
base.ArrayExpression = function(node, st, c) {
	for (var i = 0, list = node.elements; i < list.length; i += 1) {
		var elt = list[i];
		if (elt) c(elt, st, "Expression");
	}
};
base.ObjectExpression = function(node, st, c) {
	for (var i = 0, list = node.properties; i < list.length; i += 1) {
		var prop = list[i];
		c(prop, st);
	}
};
base.FunctionExpression = base.ArrowFunctionExpression = base.FunctionDeclaration;
base.SequenceExpression = function(node, st, c) {
	for (var i = 0, list = node.expressions; i < list.length; i += 1) {
		var expr = list[i];
		c(expr, st, "Expression");
	}
};
base.TemplateLiteral = function(node, st, c) {
	for (var i = 0, list = node.quasis; i < list.length; i += 1) {
		var quasi = list[i];
		c(quasi, st);
	}
	for (var i$1 = 0, list$1 = node.expressions; i$1 < list$1.length; i$1 += 1) {
		var expr = list$1[i$1];
		c(expr, st, "Expression");
	}
};
base.TemplateElement = ignore;
base.UnaryExpression = base.UpdateExpression = function(node, st, c) {
	c(node.argument, st, "Expression");
};
base.BinaryExpression = base.LogicalExpression = function(node, st, c) {
	c(node.left, st, "Expression");
	c(node.right, st, "Expression");
};
base.AssignmentExpression = base.AssignmentPattern = function(node, st, c) {
	c(node.left, st, "Pattern");
	c(node.right, st, "Expression");
};
base.ConditionalExpression = function(node, st, c) {
	c(node.test, st, "Expression");
	c(node.consequent, st, "Expression");
	c(node.alternate, st, "Expression");
};
base.NewExpression = base.CallExpression = function(node, st, c) {
	c(node.callee, st, "Expression");
	if (node.arguments) for (var i = 0, list = node.arguments; i < list.length; i += 1) {
		var arg = list[i];
		c(arg, st, "Expression");
	}
};
base.MemberExpression = function(node, st, c) {
	c(node.object, st, "Expression");
	if (node.computed) c(node.property, st, "Expression");
};
base.ExportNamedDeclaration = base.ExportDefaultDeclaration = function(node, st, c) {
	if (node.declaration) c(node.declaration, st, node.type === "ExportNamedDeclaration" || node.declaration.id ? "Statement" : "Expression");
	if (node.source) c(node.source, st, "Expression");
	if (node.attributes) for (var i = 0, list = node.attributes; i < list.length; i += 1) {
		var attr = list[i];
		c(attr, st);
	}
};
base.ExportAllDeclaration = function(node, st, c) {
	if (node.exported) c(node.exported, st);
	c(node.source, st, "Expression");
	if (node.attributes) for (var i = 0, list = node.attributes; i < list.length; i += 1) {
		var attr = list[i];
		c(attr, st);
	}
};
base.ImportAttribute = function(node, st, c) {
	c(node.value, st, "Expression");
};
base.ImportDeclaration = function(node, st, c) {
	for (var i = 0, list = node.specifiers; i < list.length; i += 1) {
		var spec = list[i];
		c(spec, st);
	}
	c(node.source, st, "Expression");
	if (node.attributes) for (var i$1 = 0, list$1 = node.attributes; i$1 < list$1.length; i$1 += 1) {
		var attr = list$1[i$1];
		c(attr, st);
	}
};
base.ImportExpression = function(node, st, c) {
	c(node.source, st, "Expression");
	if (node.options) c(node.options, st, "Expression");
};
base.ImportSpecifier = base.ImportDefaultSpecifier = base.ImportNamespaceSpecifier = base.Identifier = base.PrivateIdentifier = base.Literal = ignore;
base.TaggedTemplateExpression = function(node, st, c) {
	c(node.tag, st, "Expression");
	c(node.quasi, st, "Expression");
};
base.ClassDeclaration = base.ClassExpression = function(node, st, c) {
	return c(node, st, "Class");
};
base.Class = function(node, st, c) {
	if (node.id) c(node.id, st, "Pattern");
	if (node.superClass) c(node.superClass, st, "Expression");
	c(node.body, st);
};
base.ClassBody = function(node, st, c) {
	for (var i = 0, list = node.body; i < list.length; i += 1) {
		var elt = list[i];
		c(elt, st);
	}
};
base.MethodDefinition = base.PropertyDefinition = base.Property = function(node, st, c) {
	if (node.computed) c(node.key, st, "Expression");
	if (node.value) c(node.value, st, "Expression");
};
// build/runtime.ts
const SAVE = "__cc_save";
const VALUE_BYTES = 1e5;
const NOTEBOOK_BYTES = 1e6;
const CONDITIONAL = /* @__PURE__ */ new Set([
	"IfStatement",
	"ConditionalExpression",
	"LogicalExpression",
	"ChainExpression",
	"SwitchStatement",
	"TryStatement",
	"ForStatement",
	"ForInStatement",
	"ForOfStatement",
	"WhileStatement",
	"DoWhileStatement",
	"FunctionExpression",
	"ArrowFunctionExpression",
	"FunctionDeclaration"
]);
const output = {
	type: "object",
	properties: {
		text: {
			type: "string",
			description: "What the direct tool call would have shown"
		},
		isError: { type: "boolean" },
		result: { description: "The tool's structured output" }
	},
	required: [
		"text",
		"isError",
		"result"
	]
};
const sorted = (value) => Array.isArray(value) ? value.map(sorted) : typeof value === "object" && value !== null ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, item]) => [key, sorted(item)])) : value;
const callKey = (name, input) => `${name} ${JSON.stringify(sorted(input))}`;
const literal = (node) => {
	switch (node?.type) {
		case "Literal": return typeof node.value === "string" || typeof node.value === "number" || typeof node.value === "boolean" || node.value === null ? { value: node.value } : void 0;
		case "TemplateLiteral": {
			const cooked = node.expressions.length === 0 ? node.quasis[0]?.value.cooked : void 0;
			return typeof cooked === "string" ? { value: cooked } : void 0;
		}
		case "UnaryExpression": {
			const inner = node.operator === "-" ? literal(node.argument) : void 0;
			return typeof inner?.value === "number" ? { value: -inner.value } : void 0;
		}
		case "ArrayExpression": {
			const items = node.elements.map(literal);
			return items.every((item) => item !== void 0) ? { value: items.map((item) => item.value) } : void 0;
		}
		case "ObjectExpression": {
			const entries = node.properties.map((property) => {
				if (property.type !== "Property" || property.kind !== "init" || property.computed || property.method) return;
				const key = property.key.type === "Identifier" ? property.key.name : property.key.type === "Literal" && typeof property.key.value === "string" ? property.key.value : void 0;
				const value = literal(property.value);
				return key === void 0 || value === void 0 ? void 0 : [key, value.value];
			});
			return entries.every((entry) => entry !== void 0) ? { value: Object.fromEntries(entries) } : void 0;
		}
		default: return;
	}
};
const toolName = ({ callee }) => {
	if (callee.type !== "MemberExpression" || callee.object.type !== "Identifier" || callee.object.name !== "tools") return;
	if (!callee.computed && callee.property.type === "Identifier") return { name: callee.property.name };
	return { name: callee.property.type === "Literal" && typeof callee.property.value === "string" ? callee.property.value : void 0 };
};
const plan = (program) => {
	const planned = [];
	for (const statement of program.body) {
		let opaque = false;
		const calls = [];
		ancestor(statement, { CallExpression(node, _, ancestors) {
			const tool = toolName(node);
			if (tool === void 0) {
				if (node.callee.type === "Identifier" && node.callee.name !== "search") opaque = true;
				return;
			}
			if (tool.name === void 0) {
				opaque = true;
				return;
			}
			const argument = !ancestors.slice(0, -1).some((node) => CONDITIONAL.has(node.type)) && node.arguments.length === 1 ? literal(node.arguments[0] ?? null) : void 0;
			calls.push({
				name: tool.name,
				input: argument?.value,
				at: node.start
			});
		} });
		if (opaque) break;
		planned.push(...calls.sort((a, b) => a.at - b.at));
	}
	return planned;
};
const patternNames = (pattern) => {
	switch (pattern.type) {
		case "Identifier": return [pattern.name];
		case "ObjectPattern": return pattern.properties.flatMap((p) => patternNames(p.type === "RestElement" ? p.argument : p.value));
		case "ArrayPattern": return pattern.elements.flatMap((element) => element === null ? [] : patternNames(element));
		case "RestElement": return patternNames(pattern.argument);
		case "AssignmentPattern": return patternNames(pattern.left);
		default: return [];
	}
};
const withNotebook = (code, program, notebook) => {
	const declared = program.body.flatMap((statement) => statement.type === "VariableDeclaration" ? statement.declarations.flatMap((d) => patternNames(d.id)).map((name) => ({
		name,
		end: statement.end
	})) : []);
	const used = /* @__PURE__ */ new Set();
	simple(program, { Identifier: (node) => void used.add(node.name) });
	const own = new Set(declared.map((d) => d.name));
	const prefix = Object.keys(notebook).filter((name) => used.has(name) && !own.has(name)).map((name) => `const ${name} = JSON.parse(${JSON.stringify(JSON.stringify(notebook[name]))});`);
	if (declared.length === 0) return prefix.join(" ") + (prefix.length ? " " : "") + code;
	const save = (at) => `await tools.${SAVE}({ ${declared.filter((d) => d.end <= at).map((d) => `${JSON.stringify(d.name)}: ${d.name}`).join(", ")} });`;
	const edits = [];
	ancestor(program, { ReturnStatement(node, _, ancestors) {
		if (ancestors.some((a) => a.type.includes("Function"))) return;
		const value = node.argument ? code.slice(node.argument.start, node.argument.end) : "undefined";
		edits.push({
			start: node.start,
			end: node.end,
			text: `{ const __ccValue = (${value}); ${save(node.start)} return __ccValue }`
		});
	} });
	const last = program.body.at(-1);
	if (last?.type === "ExpressionStatement") {
		const value = code.slice(last.expression.start, last.expression.end);
		edits.push({
			start: last.start,
			end: last.end,
			text: `{ const __ccValue = (${value}); ${save(last.start)} return __ccValue }`
		});
	} else if (last?.type !== "ReturnStatement") edits.push({
		start: code.length,
		end: code.length,
		text: `\n{ ${save(code.length)} return }`
	});
	const body = edits.sort((a, b) => b.start - a.start).reduce((text, edit) => text.slice(0, edit.start) + edit.text + text.slice(edit.end), code);
	return prefix.join(" ") + (prefix.length ? " " : "") + body;
};
const nextNotebook = (notebook, saved) => {
	const fresh = Object.entries(saved).flatMap(([name, value]) => {
		const json = JSON.stringify(value);
		return json === void 0 ? [] : [{
			name,
			json
		}];
	});
	const tooBig = fresh.filter((entry) => entry.json.length > VALUE_BYTES).map((entry) => entry.name);
	const kept = fresh.filter((entry) => entry.json.length <= VALUE_BYTES);
	const names = new Set(kept.map((entry) => entry.name));
	const older = Object.entries(notebook).filter(([name]) => !names.has(name)).map(([name, value]) => ({
		name,
		json: JSON.stringify(value)
	}));
	let bytes = 0;
	const next = {};
	for (const entry of [...kept].reverse().concat([...older].reverse())) {
		bytes += entry.json.length;
		if (bytes > NOTEBOOK_BYTES) break;
		next[entry.name] = JSON.parse(entry.json);
	}
	return {
		notebook: next,
		saved: kept.map((entry) => entry.name),
		tooBig
	};
};
const parseProgram = (code) => {
	try {
		return parse$1(code, {
			ecmaVersion: "latest",
			sourceType: "script",
			allowReturnOutsideFunction: true,
			allowAwaitOutsideFunction: true
		});
	} catch {
		return;
	}
};
const execute = async (code, tools, call, options) => {
	const program = parseProgram(code);
	const planned = program ? plan(program) : [];
	const verdicts = await Promise.all(planned.map((p) => options.speculate(p.name, p.input)));
	const stop = verdicts.indexOf("stop");
	const early = /* @__PURE__ */ new Map();
	let started = 0;
	planned.slice(0, stop === -1 ? void 0 : stop).forEach(({ name, input }, i) => {
		if (verdicts[i] !== "start") return;
		const run = call(name, input);
		run.catch(() => {});
		early.set(callKey(name, input), [...early.get(callKey(name, input)) ?? [], run]);
		started += 1;
	});
	let used = 0;
	let saved = {};
	const host = (name, input) => {
		const run = early.get(callKey(name, input))?.shift();
		if (run === void 0) return call(name, input);
		used += 1;
		return run;
	};
	const result = await runPromise(execute$1({
		code: program ? withNotebook(code, program, options.notebook) : code,
		tools: {
			...Object.fromEntries(tools.map((tool) => [tool.name, make$2({
				description: tool.description,
				input: { type: "object" },
				output,
				execute: (input) => tryPromise(() => host(tool.name, input))
			})])),
			[SAVE]: make$2({
				description: "Internal to cc-codemod, never call it.",
				input: { type: "object" },
				output: { type: "object" },
				execute: (input) => sync(() => {
					saved = typeof input === "object" && input !== null ? { ...input } : {};
					return {};
				})
			})
		},
		limits: {
			maxToolCalls: 200,
			maxOutputBytes: 1e5
		}
	}), { signal: options.signal });
	const next = result.ok ? nextNotebook(options.notebook, saved) : void 0;
	return {
		...result,
		toolCalls: result.toolCalls.filter((c) => c.name !== SAVE),
		early: used,
		unused: started - used,
		notebook: next?.notebook,
		saved: next?.saved ?? [],
		tooBig: next?.tooBig ?? []
	};
};
export { callKey, execute };
