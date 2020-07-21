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

    popped() {
        assertTuple(this, "popped");

        if (this.length <= 1) return Tuple();

        return createTupleFromIterableObject(
            Array.from(this).slice(0, this.length - 1),
        );
    },

    pushed(...vals) {
        assertTuple(this, "pushed");
        return createTupleFromIterableObject([...this, ...vals]);
    },

    reversed() {
        assertTuple(this, "reversed");
        return createTupleFromIterableObject(Array.from(this).reverse());
    },

    shifted() {
        assertTuple(this, "shifted");
        return createTupleFromIterableObject(Array.from(this).slice(1));
    },

    unshifted(...vals) {
        assertTuple(this, "unshifted");
        return createTupleFromIterableObject([...vals, ...this]);
    },

    sorted(compareFunction) {
        assertTuple(this, "sorted");
        return createTupleFromIterableObject(
            Array.from(this).sort(compareFunction),
        );
    },

    spliced(start, deleteCount, ...items) {
        assertTuple(this, "spliced");
        return createTupleFromIterableObject(
            Array.from(this).slice(start, deleteCount, ...items),
        );
    },

    concat: arrayMethodReturningTuple("concat"),

    includes: arrayMethod("includes"),

    indexOf: arrayMethod("indexOf"),

    join: arrayMethod("join"),

    lastIndexOf: arrayMethod("lastIndexOf"),

    sliced(start, end) {
        assertTuple(this, "sliced");
        return createTupleFromIterableObject(
            Array.from(this).slice(start, end),
        );
    },

    entries() {
        assertTuple(this, "entries");
        return createTupleFromIterableObject(
            Array.from(this)
                .entries()
                .map(e => createTupleFromIterableObject(e)),
        )[Symbol.iterator]();
    },

    every: arrayMethod("every"),

    filter: arrayMethodReturningTuple("filter"),

    find: arrayMethod("find"),

    findIndex: arrayMethod("findIndex"),

    forEach: arrayMethod("forEach"),

    keys() {
        assertTuple(this, "keys");
        return createTupleFromIterableObject(Array.from(this).keys())[
            Symbol.iterator
        ]();
    },

    map: arrayMethodReturningTuple("map"),

    reduce: arrayMethod("reduce"),

    reduceRight: arrayMethod("reduceRight"),

    some: arrayMethod("some"),

    values() {
        assertTuple(this, "values");
        return this[Symbol.iterator]();
    },

    with(index, value) {
        assertTuple(this, "with");

        if (typeof index !== "number")
            throw new TypeError(`index provided to .with() must be a number`);

        const array = Array.from(this);
        array[index] = value;
        return createTupleFromIterableObject(array);
    },

    toString: Array.prototype.toString,
    toLocaleString: arrayMethod("toLocaleString"),

    [Symbol.iterator]() {
        let index = 0;
        return {
            next: () => {
                if (index < this.length) {
                    const result = { value: this[index], done: false };
                    index++;
                    return result;
                } else {
                    return { value: undefined, done: true };
                }
            },
        };
    },
});

function arrayMethod(name) {
    const method = Array.prototype[name];
    return function() {
        assertTuple(this, name);
        return method.apply(this, arguments);
    };
}

function arrayMethodReturningTuple(name) {
    const method = Array.prototype[name];
    return function() {
        assertTuple(this, name);
        return createTupleFromIterableObject(method.apply(this, arguments));
    };
}
