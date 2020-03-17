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

const ARRAY_KEYED_MAP_VALUE = Symbol("ArrayKeyedMap-value");

export class ArrayKeyedMap {
    constructor(root) {
        this._map = new Map();

        this._root = root ? root : this;
        this._size = 0;
    }

    get size() {
        return this._root._size;
    }

    _updateSize(diff) {
        this._root._size += diff;
    }

    set(key, value) {
        if (typeof key === "symbol") {
            return this._map.set(key, value);
        } else if (Array.isArray(key)) {
            if (key.length === 0) {
                if (!this._map.has(ARRAY_KEYED_MAP_VALUE)) {
                    this._updateSize(1);
                }
                this._map.set(ARRAY_KEYED_MAP_VALUE, value);
                return this;
            }

            const [first, ...rest] = key;
            let next = this._map.get(first);
            if (!next) {
                next = new ArrayKeyedMap(this._root);
                this._map.set(first, next);
            }
            next.set(rest, value);
        } else {
            throw new TypeError("key must be an Array or Symbol");
        }
    }

    has(key) {
        if (typeof key === "symbol") {
            return this._map.has(key);
        } else if (Array.isArray(key)) {
            if (key.length === 0) {
                return this._map.has(ARRAY_KEYED_MAP_VALUE);
            }

            const [first, ...rest] = key;
            const next = this._map.get(first);
            return next ? next.has(rest) : false;
        } else {
            throw new TypeError("key must be an Array or Symbol");
        }
    }

    get(key) {
        if (typeof key === "symbol") {
            return this._map.get(key);
        } else if (Array.isArray(key)) {
            if (key.length === 0) {
                return this._map.get(ARRAY_KEYED_MAP_VALUE);
            }

            const [first, ...rest] = key;
            const next = this._map.get(first);
            return next ? next.get(rest) : undefined;
        } else {
            throw new TypeError("key must be an Array or Symbol");
        }
    }

    delete(key) {
        if (typeof key === "symbol") {
            return this._map.delete(key);
        } else if (Array.isArray(key)) {
            if (key.length === 0) {
                const didDelete = this._map.delete(ARRAY_KEYED_MAP_VALUE);
                if (didDelete) {
                    this._updateSize(-1);
                }
                return didDelete;
            }

            const [first, ...rest] = key;
            const next = this._map.get(first);

            if (next) {
                const didDelete = next.delete(rest);
                if (this._root._size === 0) {
                    this._map.delete(first);
                }
                return didDelete;
            }
            return false;
        } else {
            throw new TypeError("key must be an Array or Symbol");
        }
    }
}
