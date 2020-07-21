/*
 ** Copyright 2020 Bloomberg Finance L.P.
 **
 ** Licensed under the Apache License, Version 2.0 (the "License");
 ** you may not use this file except in compliance with the License.
 ** You may obtain a copy of the License at
 **
 **     http://www.apache.org/licenses/LICENSE-2.0
 **
 ** Unless required by applicable law or agreed to in writing, software
 ** distributed under the License is distributed on an "AS IS" BASIS,
 ** WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 ** See the License for the specific language governing permissions and
 ** limitations under the License.
 */

import { InternGraph, assertFeatures } from "./interngraph";
import {
    isIterableObject,
    isTuple,
    markTuple,
    validateProperty,
    getTupleLength,
    define,
} from "./utils";

function createFreshTupleFromIterableObject(value) {
    if (!isIterableObject(value)) {
        throw new Error(
            "invalid value, expected an array or iterable as the argument.",
        );
    }

    let length = 0;

    const tuple = Object.create(Tuple.prototype);
    // eslint-disable-next-line no-constant-condition
    for (const val of value) {
        tuple[length] = validateProperty(val);
        length++;
    }

    Object.freeze(tuple);
    markTuple(tuple, length);
    return tuple;
}

const TUPLE_GRAPH = new InternGraph(function(values) {
    const elements = Array.from(values).map(v => v[0]);
    return createFreshTupleFromIterableObject(elements);
});

export function createTupleFromIterableObject(value) {
    assertFeatures();

    if (!isIterableObject(value)) {
        throw new Error(
            "invalid value, expected an array or iterable as the argument.",
        );
    }

    const validated = Array.from(value).map(v => [validateProperty(v)]);
    return TUPLE_GRAPH.get(validated);
}

function assertTuple(value, methodName) {
    if (!isTuple(value)) {
        throw new TypeError(
            `'Tuple.prototype.${methodName}' called on incompatible receiver.`,
        );
    }
}

export function Tuple(...values) {
    return createTupleFromIterableObject(values);
}
// ensure that Tuple.name is "Tuple" even if this
// source is aggressively minified or bundled.
if (Tuple.name !== "Tuple") {
    Object.defineProperty(Tuple, "name", {
        value: "Tuple",
        configurable: true,
    });
}

define(Tuple, {
    isTuple,

    from(arrayLike, mapFn, thisArg) {
        return createTupleFromIterableObject(
            Array.from(arrayLike, mapFn, thisArg),
        );
    },
    of(...values) {
        return createTupleFromIterableObject(Array.of(...values));
    },
});

Tuple.prototype = Object.create(null);

Object.defineProperty(Tuple.prototype, Symbol.toStringTag, {
    value: "Tuple",
    configurable: true,
});

define(Tuple.prototype, {
    constructor: Tuple,

    get length() {
        assertTuple(this, "length");
        return getTupleLength(this);
    },

    valueOf() {
        assertTuple(this, "valueOf");
        return this;
    },

    popped: arrayMethodUpdatingTuple("pop", "popped"),

    pushed: arrayMethodUpdatingTuple("push", "pushed"),

    reversed: arrayMethodUpdatingTuple("reverse", "reversed"),

    shifted: arrayMethodUpdatingTuple("shift", "shifted"),

    unshifted: arrayMethodUpdatingTuple("unshift", "unshifted"),

    sorted: arrayMethodUpdatingTuple("sort", "sorted"),

    spliced: arrayMethodUpdatingTuple("splice", "spliced"),

    concat: arrayMethodReturningTuple("concat"),

    includes: arrayMethod("includes"),

    indexOf: arrayMethod("indexOf"),

    join: arrayMethod("join"),

    lastIndexOf: arrayMethod("lastIndexOf"),

    slice: arrayMethodReturningTuple("slice"),

    entries: arrayMethod("entries"),

    every: arrayMethod("every"),

    filter: arrayMethodReturningTuple("filter"),

    find: arrayMethod("find"),

    findIndex: arrayMethod("findIndex"),

    forEach: arrayMethod("forEach"),

    keys: arrayMethod("keys"),

    map: arrayMethodReturningTuple("map"),

    reduce: arrayMethod("reduce"),

    reduceRight: arrayMethod("reduceRight"),

    some: arrayMethod("some"),

    values: arrayMethod("values"),

    toString: Array.prototype.toString,
    toLocaleString: arrayMethod("toLocaleString"),

    with(index, value) {
        assertTuple(this, "with");

        if (typeof index !== "number")
            throw new TypeError(`index provided to .with() must be a number`);

        const array = Array.from(this);
        array[index] = value;
        return createTupleFromIterableObject(array);
    },
});

define(Tuple.prototype, {
    [Symbol.iterator]: Tuple.prototype.values,
});

// Array methods that already work as-is with tuples
function arrayMethod(name) {
    const method = Array.prototype[name];
    return function() {
        assertTuple(this, name);
        return method.apply(this, arguments);
    };
}

// Array methods that return an array, but should return a tuple
function arrayMethodReturningTuple(name) {
    const method = Array.prototype[name];
    return function() {
        assertTuple(this, name);
        return createTupleFromIterableObject(method.apply(this, arguments));
    };
}

// Array methods that would try to mutate the existing tuple
function arrayMethodUpdatingTuple(name, newName) {
    const method = Array.prototype[name];
    return function() {
        assertTuple(this, newName);
        const arr = Array.from(this);
        method.apply(arr, arguments);
        return createTupleFromIterableObject(arr);
    };
}
