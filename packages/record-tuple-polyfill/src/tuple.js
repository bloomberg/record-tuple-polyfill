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
    unbox,
    isTuple,
    markTuple,
    validateProperty,
    getTupleLength,
} from "./utils";

function createFreshTupleFromIterableObject(value) {
    const unboxed = unbox(value);

    if (!isIterableObject(unboxed)) {
        throw new Error(
            "invalid value, expected an array or iterable as the argument.",
        );
    }

    let length = 0;

    const tuple = Object.create(Tuple.prototype);
    // eslint-disable-next-line no-constant-condition
    for (const value of unboxed) {
        tuple[length] = validateProperty(value);
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
    const unboxed = unbox(value);

    if (!isIterableObject(unboxed)) {
        throw new Error(
            "invalid value, expected an array or iterable as the argument.",
        );
    }

    const validated = Array.from(unboxed).map(v => [validateProperty(v)]);
    return TUPLE_GRAPH.get(validated);
}

export function Tuple(...values) {
    return createTupleFromIterableObject(values);
}
// ensure that Tuple.name is "Tuple" even if this
// source is aggressively minified or bundled.
if (Tuple.name !== "Tuple") {
    Object.defineProperty(Tuple, "name", { value: "Tuple" });
}
Tuple.prototype = Object.create(null);
Tuple.prototype.constructor = Tuple;
Tuple.prototype[Symbol.iterator] = function TupleIterator() {
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
};

Tuple.from = function from(arrayLike, mapFn, thisArg) {
    return createTupleFromIterableObject(Array.from(arrayLike, mapFn, thisArg));
};
Tuple.isTuple = isTuple;

Tuple.of = function of(...values) {
    return createTupleFromIterableObject(Array.of(...values));
};

Object.defineProperty(Tuple.prototype, "length", {
    enumerable: false,
    configurable: false,
    get: function get_length() {
        if (!isTuple(this)) {
            throw new TypeError(
                "'get Tuple.prototype.length' called on incompatible receiver.",
            );
        }
        return getTupleLength(this);
    },
});

Tuple.prototype[Symbol.toStringTag] = "Tuple";
Tuple.prototype.toString = Array.prototype.toString;
Tuple.prototype.toLocaleString = Array.prototype.toLocaleString;

Tuple.prototype.valueOf = function valueOf() {
    return this;
};

Tuple.prototype.popped = function popped() {
    if (this.length <= 1) return Tuple();

    return createTupleFromIterableObject(
        Array.from(this).slice(0, this.length - 1),
    );
};
Tuple.prototype.pushed = function pushed(...vals) {
    return createTupleFromIterableObject([...this, ...vals]);
};
Tuple.prototype.reversed = function reversed() {
    return createTupleFromIterableObject(Array.from(this).reverse());
};
Tuple.prototype.shifted = function shifted() {
    return createTupleFromIterableObject(Array.from(this).slice(1));
};
Tuple.prototype.unshifted = function unshifted(...vals) {
    return createTupleFromIterableObject([...vals, ...this]);
};
Tuple.prototype.sorted = function sorted(compareFunction) {
    return createTupleFromIterableObject(
        Array.from(this).sort(compareFunction),
    );
};
Tuple.prototype.spliced = function spliced(start, deleteCount, ...items) {
    return createTupleFromIterableObject(
        Array.from(this).slice(start, deleteCount, ...items),
    );
};
Tuple.prototype.concat = function concat(...values) {
    return createTupleFromIterableObject(Array.from(this).concat(...values));
};
Tuple.prototype.includes = function includes(valueToFind, fromIndex) {
    return Array.from(this).includes(valueToFind, fromIndex);
};
Tuple.prototype.indexOf = function indexOf(valueToFind, fromIndex) {
    return Array.from(this).indexOf(valueToFind, fromIndex);
};
Tuple.prototype.join = function join(separator) {
    return Array.from(this).join(separator);
};
Tuple.prototype.lastIndexOf = function lastIndexOf(valueToFind, fromIndex) {
    return Array.from(this).lastIndexOf(valueToFind, fromIndex);
};
Tuple.prototype.sliced = function sliced(start, end) {
    return createTupleFromIterableObject(Array.from(this).slice(start, end));
};
Tuple.prototype.toLocaleString = function toLocaleString(locales, options) {
    return createTupleFromIterableObject(
        Array.from(this).toLocaleString(locales, options),
    );
};
Tuple.prototype.entries = function entries() {
    return createTupleFromIterableObject(
        Array.from(this)
            .entries()
            .map(e => createTupleFromIterableObject(e)),
    )[Symbol.iterator]();
};

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
Tuple.prototype.every = function every(callback, thisArg) {
    return Array.from(this).every(wrapTupleCallback(this, callback), thisArg);
};
Tuple.prototype.filter = function filter(callback, thisArg) {
    return createTupleFromIterableObject(
        Array.from(this).filter(wrapTupleCallback(this, callback), thisArg),
    );
};
Tuple.prototype.find = function find(callback, thisArg) {
    return Array.from(this).find(wrapTupleCallback(this, callback), thisArg);
};
Tuple.prototype.findIndex = function findIndex(callback, thisArg) {
    return Array.from(this).findIndex(
        wrapTupleCallback(this, callback),
        thisArg,
    );
};
Tuple.prototype.forEach = function forEach(callback, thisArg) {
    return Array.from(this).forEach(wrapTupleCallback(this, callback), thisArg);
};
Tuple.prototype.keys = function keys() {
    return createTupleFromIterableObject(Array.from(this).keys())[
        Symbol.iterator
    ]();
};
Tuple.prototype.map = function map(callback, thisArg) {
    return createTupleFromIterableObject(
        Array.from(this).map(wrapTupleCallback(this, callback), thisArg),
    );
};
Tuple.prototype.reduce = function reduce(callback, initialValue) {
    return Array.from(this).reduce(
        wrapTupleReduceCallback(this, callback),
        initialValue,
    );
};
Tuple.prototype.reduceRight = function reduceRight(callback, initialValue) {
    return Array.from(this).reduceRight(
        wrapTupleReduceCallback(this, callback),
        initialValue,
    );
};
Tuple.prototype.some = function some(callback, thisArg) {
    return Array.from(this).some(wrapTupleCallback(this, callback), thisArg);
};
Tuple.prototype.values = function values() {
    return this[Symbol.iterator]();
};
Tuple.prototype.with = function(index, value) {
    if (typeof index !== "number")
        throw new TypeError(`index provided to .with() must be a number`);

    const array = Array.from(this);
    array[index] = value;
    return createTupleFromIterableObject(array);
};
