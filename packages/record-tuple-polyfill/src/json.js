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

import { Record } from "./record";
import { createTupleFromIterableObject } from "./tuple";
import { isRecord, isTuple, validateProperty } from "./utils";

const JSON$stringify = JSON.stringify;
const JSON$parse = JSON.parse;

export function stringify(value, replacer, space) {
    let props;
    if (Array.isArray(replacer)) {
        props = new Set();
        replacer.forEach(v => {
            if (
                typeof v === "string" ||
                typeof v === "number" ||
                v instanceof Number ||
                v instanceof String
            ) {
                props.add(String(v));
            }
        });
    }

    let isTopLevel = true;

    return JSON$stringify(
        value,
        function stringifyReplacer(key, val) {
            if (props && !isTopLevel && !props.has(key)) {
                return undefined;
            }
            isTopLevel = false; // The top-level value is never excluded

            if (typeof replacer === "function") {
                val = replacer.call(this, key, val);
            }

            if (isRecord(val)) return { ...val };
            else if (isTuple(val)) return Array.from(val);
            return val;
        },
        space,
    );
}

export function parseImmutable(text, reviver) {
    return JSON$parse(text, function parseImmutableReviver(key, value) {
        if (typeof value === "object") {
            if (Array.isArray(value)) {
                value = createTupleFromIterableObject(value);
            } else if (value !== null) {
                value = Record(value);
            }
        }

        // This should check IsCallable(reviver)
        if (typeof reviver === "function") {
            value = reviver(key, value);
            validateProperty(value);
        }

        return value;
    });
}
