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
        if (!isTuple(this)) {
            throw new TypeError(
                "'get Tuple.prototype.length' called on incompatible receiver.",
            );
        }
        return getTupleLength(this);
    },

    valueOf() {
        return this;
    },

    popped() {
        if (this.length <= 1) return Tuple();

        return createTupleFromIterableObject(
            Array.from(this).slice(0, this.length - 1),
        );
    },

    pushed(...vals) {
        return createTupleFromIterableObject([...this, ...vals]);
    },

    reversed() {
        return createTupleFromIterableObject(Array.from(this).reverse());
    },

    shifted() {
        return createTupleFromIterableObject(Array.from(this).slice(1));
    },

    unshifted(...vals) {
        return createTupleFromIterableObject([...vals, ...this]);
    },

    sorted(compareFunction) {
        return createTupleFromIterableObject(
            Array.from(this).sort(compareFunction),
        );
    },

    spliced(start, deleteCount, ...items) {
        return createTupleFromIterableObject(
            Array.from(this).slice(start, deleteCount, ...items),
        );
    },

    concat(...values) {
        return createTupleFromIterableObject(
            Array.from(this).concat(...values),
        );
    },

    includes(valueToFind, fromIndex) {
        return Array.from(this).includes(valueToFind, fromIndex);
    },

    indexOf(valueToFind, fromIndex) {
        return Array.from(this).indexOf(valueToFind, fromIndex);
    },

    join(separator) {
        return Array.from(this).join(separator);
    },

    lastIndexOf(valueToFind, fromIndex) {
        return Array.from(this).lastIndexOf(valueToFind, fromIndex);
    },

    sliced(start, end) {
        return createTupleFromIterableObject(
            Array.from(this).slice(start, end),
        );
    },

    entries() {
        return createTupleFromIterableObject(
            Array.from(this)
                .entries()
                .map(e => createTupleFromIterableObject(e)),
        )[Symbol.iterator]();
    },

    every(callback, thisArg) {
        return Array.from(this).every(
            wrapTupleCallback(this, callback),
            thisArg,
        );
    },

    filter(callback, thisArg) {
        return createTupleFromIterableObject(
            Array.from(this).filter(wrapTupleCallback(this, callback), thisArg),
        );
    },

    find(callback, thisArg) {
        return Array.from(this).find(
            wrapTupleCallback(this, callback),
            thisArg,
        );
    },

    findIndex(callback, thisArg) {
        return Array.from(this).findIndex(
            wrapTupleCallback(this, callback),
            thisArg,
        );
    },

    forEach(callback, thisArg) {
        return Array.from(this).forEach(
            wrapTupleCallback(this, callback),
            thisArg,
        );
    },

    keys() {
        return createTupleFromIterableObject(Array.from(this).keys())[
            Symbol.iterator
        ]();
    },

    map(callback, thisArg) {
        return createTupleFromIterableObject(
            Array.from(this).map(wrapTupleCallback(this, callback), thisArg),
        );
    },

    reduce(callback, initialValue) {
        return Array.from(this).reduce(
            wrapTupleReduceCallback(this, callback),
            initialValue,
        );
    },

    reduceRight(callback, initialValue) {
        return Array.from(this).reduceRight(
            wrapTupleReduceCallback(this, callback),
            initialValue,
        );
    },

    some(callback, thisArg) {
        return Array.from(this).some(
            wrapTupleCallback(this, callback),
            thisArg,
        );
    },

    values() {
        return this[Symbol.iterator]();
    },

    with(index, value) {
        if (typeof index !== "number")
            throw new TypeError(`index provided to .with() must be a number`);

        const array = Array.from(this);
        array[index] = value;
        return createTupleFromIterableObject(array);
    },

    toString: Array.prototype.toString,
    toLocaleString: Array.prototype.toLocaleString,

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

function wrapTupleCallback(tuple, callback) {
    return function(element, index) {
        return callback.call(this, element, index, tuple);
    };
}
function wrapTupleReduceCallback(tuple, callback) {
    return function(accumulator, element, index) {
        return callback.call(this, accumulator, element, index, tuple);
    };
}
