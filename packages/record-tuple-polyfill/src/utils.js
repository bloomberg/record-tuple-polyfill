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

import { originalWeakSetAdd } from "./weakcollections-original";

export function isObject(v) {
    return typeof v === "object" && v !== null;
}
export function isFunction(v) {
    return typeof v === "function";
}

export function isIterableObject(v) {
    return isObject(v) && typeof v[Symbol.iterator] === "function";
}

export function fakeRecordFromEntries(iterable) {
    const retVal = Object.create(null);
    for (const [key, value] of iterable) {
        retVal[validateKey(key)] = validateProperty(value);
    }
    return retVal;
}

const RECORD_WEAKSET = new WeakSet();
const TUPLE_WEAKSET = new WeakSet();
export function isRecord(value) {
    return RECORD_WEAKSET.has(value);
}
export function isTuple(value) {
    return TUPLE_WEAKSET.has(value);
}
export function markRecord(value) {
    originalWeakSetAdd.call(RECORD_WEAKSET, value);
}
export function markTuple(value) {
    originalWeakSetAdd.call(TUPLE_WEAKSET, value);
}

function isRecordOrTuple(value) {
    return isRecord(value) || isTuple(value);
}

export function validateKey(key) {
    if (typeof key === "symbol") {
        throw new TypeError(
            "A Symbol cannot be used as a property key in a Record.",
        );
    }
    return String(key);
}

export function validateProperty(value) {
    if (isObject(value) && !isRecordOrTuple(value)) {
        throw new TypeError(
            "TypeError: cannot use an object as a value in a record",
        );
    } else if (isFunction(value)) {
        throw new TypeError(
            "TypeError: cannot use a function as a value in a record",
        );
    }
    return value;
}

export function define(obj, props) {
    for (const key of Reflect.ownKeys(props)) {
        const { get, set, value } = Object.getOwnPropertyDescriptor(props, key);
        let desc =
            get || set
                ? { get, set, configurable: true }
                : { value, writable: true, configurable: true };
        Object.defineProperty(obj, key, desc);
    }
}

const _WeakMap = globalThis["WeakMap"];
const _WeakRef = globalThis["WeakRef"];
const _FinalizationRegistry =
    globalThis["FinalizationRegistry"] || globalThis["FinalizationGroup"];
export function assertFeatures() {
    if (!_WeakMap || !_WeakRef || !_FinalizationRegistry) {
        throw new Error(
            "WeakMap, WeakRef, and FinalizationRegistry are required for @bloomberg/record-tuple-polyfill",
        );
    }
}

/** https://tc39.es/ecma262/#sec-tointegerorinfinity */
export function toIntegerOrInfinity(arg) {
    const n = Number(arg);
    if (Number.isNaN(n) || n === 0) {
        return 0;
    }
    if (n === Number.POSITIVE_INFINITY) {
        return Number.POSITIVE_INFINITY;
    }
    if (n === Number.NEGATIVE_INFINITY) {
        return Number.NEGATIVE_INFINITY;
    }
    let i = Math.floor(Math.abs(n));
    if (n < 0) {
        i = -i;
    }
    return i;
}
