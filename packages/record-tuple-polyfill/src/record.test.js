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

import { Record, Tuple } from "./index";

test("Record function throws when presented a non-plain object", () => {
    expect(() => Record(true)).toThrow();
    expect(() => Record(1)).toThrow();
    expect(() => Record(BigInt(1))).toThrow();
    expect(() => Record("test")).toThrow();
    expect(() => Record(Symbol())).toThrow();
    expect(() => Record(function() {})).toThrow();
    expect(() => Record(null)).toThrow();
    expect(() => Record(undefined)).toThrow();
});

test("records cannot contain objects", () => {
    expect(() => Record({ a: {} })).toThrow();
    expect(() => Record({ a: [] })).toThrow();
    expect(() => Record({ a: function() {} })).toThrow();
});

test("records doesn't unbox boxed primitives", () => {
    expect(() => Record({ a: Object(true) })).toThrow(Error); // TODO: TypeError
    expect(() => Record({ a: Object(1) })).toThrow(Error); // TODO: TypeError
    expect(() => Record({ a: Object("test") })).toThrow(Error); // TODO: TypeError
    expect(() => Record({ a: Object(Symbol()) })).toThrow(Error); // TODO: TypeError
});

test("records are correctly identified as records", () => {
    expect(Record.isRecord(Record({ a: 1 }))).toBe(true);
    expect(Record.isRecord(Tuple(1, 2, 3))).toBe(false);
    expect(Record.isRecord({ a: 1 })).toBe(false);
    expect(Record.isRecord(function() {})).toBe(false);
    expect(Record.isRecord(true)).toBe(false);
    expect(Record.isRecord(1)).toBe(false);
    expect(Record.isRecord("test")).toBe(false);
    expect(Record.isRecord(Symbol())).toBe(false);
});

test("Record function creates deeply frozen objects", () => {
    expect(Object.isFrozen(Record({ a: 1 }))).toBe(true);
    expect(Object.isFrozen(Record({ a: Record({ b: 2 }) }).b)).toBe(true);
});

test("Record function creates objects with keys in sorted order", () => {
    expect(Record.keys(Record({ a: 1, b: 2 }))).toBe(Tuple("a", "b"));
    expect(Record.keys(Record({ b: 1, a: 2 }))).toBe(Tuple("a", "b"));
    expect(Record.keys(Record({ b: 1, a: 2, 0: 3 }))).toBe(
        Tuple("0", "a", "b"),
    );
    expect(Record.keys(Record({ b: 1, a: 2, 0: 3 }))).toBe(
        Tuple("0", "a", "b"),
    );
});

test("records with the same structural equality will be equal", () => {
    expect(Record({ a: 1 })).toBe(Record({ a: 1 }));
    expect(Record({ a: 1, b: 2 })).toBe(Record({ a: 1, b: 2 }));
    expect(Record({ b: 2, a: 1 })).toBe(Record({ a: 1, b: 2 }));
    expect(Record({ 0: 0, 1: 1, 2: 2 })).toBe(Record({ 1: 1, 0: 0, 2: 2 }));
    expect(Record({ a: Record({ b: 2 }) })).toBe(
        Record({ a: Record({ b: 2 }) }),
    );

    expect(Record({ a: 1 })).not.toBe(Record({ a: 2 }));
    expect(Record({ a: 1 })).not.toBe(Record({ b: 1 }));
});

test("Record equality handles -/+0 and NaN correctly", () => {
    expect(Record({ a: -0 })).toBe(Record({ a: -0 }));
    expect(Record({ a: +0 })).toBe(Record({ a: +0 }));
    expect(Record({ a: -0 })).toBe(Record({ a: +0 }));
    expect(Record({ a: +0 })).toBe(Record({ a: -0 }));
    expect(Record({ a: NaN })).toBe(Record({ a: NaN }));
});

test("Record.assign", () => {
    expect(() => Record.assign(Record({ a: 1 }), { b: 2 })).toThrow();
    expect(() => Record.assign({ b: 2 }, Record({ a: 1 }))).toThrow();

    expect(Record.assign(Record({ a: 1 }), Record({ b: 2 }))).toBe(
        Record({ a: 1, b: 2 }),
    );
    expect(Record.assign(Record({ a: 1 }), Record({ a: 2 }))).toBe(
        Record({ a: 2 }),
    );
});
test("Record.entries", () => {
    expect(Record.entries(Record({ a: 1 }))).toBe(Tuple(Tuple("a", 1)));
    expect(Record.entries(Record({ a: 1, b: 2 }))).toBe(
        Tuple(Tuple("a", 1), Tuple("b", 2)),
    );
    expect(Record.entries(Record({ b: 2, a: 1 }))).toBe(
        Tuple(Tuple("a", 1), Tuple("b", 2)),
    );
});
test("Record.fromEntries", () => {
    expect(
        Record.fromEntries([
            ["a", 1],
            ["b", 2],
        ]),
    ).toBe(Record({ a: 1, b: 2 }));
    expect(
        Record.fromEntries([
            ["b", 2],
            ["a", 1],
        ]),
    ).toBe(Record({ a: 1, b: 2 }));
});
test("Record.keys", () => {
    expect(Record.keys(Record({ a: 1, b: 2 }))).toBe(Tuple("a", "b"));
    expect(Record.keys(Record({ b: 1, a: 2 }))).toBe(Tuple("a", "b"));
});
test("Record.values", () => {
    expect(Record.values(Record({ a: 1, b: 2 }))).toBe(Tuple(1, 2));
    expect(Record.values(Record({ b: 1, a: 2 }))).toBe(Tuple(2, 1));
});

test("Record.prototype.toString", () => {
    expect(Record({ a: 1 }).toString()).toEqual("[record Record]");
});
