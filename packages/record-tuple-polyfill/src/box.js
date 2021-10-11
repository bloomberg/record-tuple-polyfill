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

import {
    isRecord,
    isTuple,
    isBox,
    unboxBox,
    markBox,
    define,
    assertFeatures,
    isPrimitive,
} from "./utils";

assertFeatures();

const OBJECT_BOXES = new WeakMap();
const PRIMITIVE_BOXES = new Map();

export function Box(value) {
    return isPrimitive(value) ? getPrimitiveBox(value) : getObjectBox(value);
}

function createBox(value) {
    const box = Object.create(Box.prototype);
    Object.freeze(box);
    markBox(box, value);
    return box;
}

function getPrimitiveBox(value) {
    let ref = PRIMITIVE_BOXES.get(value);
    if (ref && ref.deref()) {
        return ref.deref();
    }

    const box = createBox(value);
    ref = new WeakRef(box);
    PRIMITIVE_BOXES.set(value, ref);

    const group = new FinalizationRegistry(map => map.delete(value));
    group.register(box, PRIMITIVE_BOXES);

    return box;
}

function getObjectBox(value) {
    let box = OBJECT_BOXES.get(value);
    if (box) return box;

    box = createBox(value);
    OBJECT_BOXES.set(value, box);
    return box;
}

function assertBox(value, methodName) {
    if (!isBox(value)) {
        throw new TypeError(
            `'Box.prototype.${methodName}' called on incompatible receiver.`,
        );
    }
}

Object.defineProperty(Box.prototype, Symbol.toStringTag, {
    value: "Box",
    configurable: true,
});

function recursiveContainsBox(arg) {
    if (isBox(arg)) {
        return true;
    } else if (isRecord(arg)) {
        for (const key of Object.keys(arg)) {
            if (recursiveContainsBox(arg[key])) {
                return true;
            }
        }
        return false;
    } else if (isTuple(arg)) {
        for (const value of arg) {
            if (recursiveContainsBox(value)) {
                return true;
            }
        }
    }
    return false;
}

define(Box, {
    containsBoxes(arg) {
        if (isRecord(arg) || isTuple(arg) || isBox(arg)) {
            return recursiveContainsBox(arg);
        } else {
            throw new TypeError(
                "Box.containsBoxes called with incompatible argument",
            );
        }
    },
    unbox(box) {
        assertBox(box, "unbox");
        return unboxBox(box);
    },
});

define(Box.prototype, {
    constructor: Box,
    valueOf() {
        assertBox(this, "valueOf");
        return this;
    },
});
