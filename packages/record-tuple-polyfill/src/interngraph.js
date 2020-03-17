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

import { ArrayKeyedMap } from "./arraykeyedmap";

const WeakMap = globalThis["WeakMap"];
const WeakRef = globalThis["WeakRef"];
const FinalizationRegistry =
    globalThis["FinalizationRegistry"] || globalThis["FinalizationGroup"];

export function assertFeatures() {
    if (!WeakMap || !WeakRef || !FinalizationRegistry) {
        throw new Error(
            "WeakMap, WeakRef, and FinalizationRegistry are required for @bloomberg/record-tuple-polyfill",
        );
    }
}

const GRAPH_VALUE = Symbol("GRAPH_VALUE");
const GRAPH_PARENT = Symbol("GRAPH_PARENT");
const GRAPH_REFCOUNT = Symbol("GRAPH_REFCOUNT");

export class InternGraph {
    constructor(creator) {
        this._creator = creator;
        this._map = new ArrayKeyedMap();
        this._finalizers = new WeakMap();
    }

    get size() {
        return this._map.size;
    }

    clear() {
        this._map = new ArrayKeyedMap();
    }

    get(values) {
        let map = this._map;
        const maps = [map];
        for (const value of values) {
            if (!map.has(value)) {
                const newMap = new ArrayKeyedMap();
                newMap.set(GRAPH_PARENT, { parent: map, value });
                map.set(value, newMap);
            }

            map = map.get(value);
            maps.push(map);
        }

        let ref = map.get(GRAPH_VALUE);
        if (ref && ref.deref()) {
            return ref.deref();
        }

        for (const map of maps) {
            const refcount = map.get(GRAPH_REFCOUNT) || 0;
            map.set(GRAPH_REFCOUNT, refcount + 1);
        }

        const value = this._creator(values);
        ref = new WeakRef(value);
        map.set(GRAPH_VALUE, ref);

        const group = new FinalizationRegistry(
            function cleanup(heldValues) {
                let map = Array.from(heldValues)[0];
                while (map && map !== this._map) {
                    const mapParent = map.get(GRAPH_PARENT);
                    const refcount = map.get(GRAPH_REFCOUNT);

                    if (refcount - 1 === 0) {
                        mapParent.parent.delete(mapParent.value);
                    }
                    map.set(GRAPH_REFCOUNT, refcount - 1);
                    map = mapParent.parent;
                }
            }.bind(this),
        );
        group.register(value, map);
        this._finalizers.set(value, group);

        return value;
    }

    getFinalizer(value) {
        return this._finalizers.get(value);
    }
}
